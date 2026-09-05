import { homedir } from "node:os";
import Database from "better-sqlite3";
import { eq, sql } from "drizzle-orm";
import contacts from "node-mac-contacts";
import { ingestionState, messages, people } from "../db/schema";
import {
  convertAppleTimestampToUnix,
  decodeMessageBuffer,
  findOrCreatePerson,
  placeholderFor,
} from "./helpers";
import { db } from "./recall-db";

interface MessageRow {
  rowId: number;
  guid: string;
  text: string | null;
  messageBuffer: Buffer;
  isFromMe: number;
  sentAt: number;
  handle: string | null;
  chatId: number;
  attachmentMime: string | null;
  attachmentName: string | null;
  isReply: number;
  isAudioMessage: number;
}

const chatDBPath = `${homedir()}/Library/Messages/chat.db`;
const sqliteDB = new Database(chatDBPath, { readonly: true });

const BATCH_SIZE = 2500;

// Bump when a schema change needs existing rows re-derived (e.g. a new column
// filled from chat.db). A stored version below this forces one full rescan so
// old rows get backfilled; matching versions keep the fast incremental cursor.
const SCHEMA_VERSION = 1;

const state = db
  .select()
  .from(ingestionState)
  .where(eq(ingestionState.id, 1))
  .get();
// On a version lag, restart from 0 so every message is re-read and upserted.
const needsBackfill = (state?.schemaVersion ?? 0) < SCHEMA_VERSION;
if (needsBackfill) {
  console.log(
    `Schema version ${state?.schemaVersion ?? 0} < ${SCHEMA_VERSION} — reindexing all messages`
  );
}
let lastRowId = needsBackfill ? 0 : (state?.lastRowId ?? 0);

// A message is a reply when it points back to a thread originator —
// thread_originator_guid is non-null only on replies.
//
// For attachments, transfer_name is the original file name we surface as
// the message_content instead of a generic placeholder.
const query = `
  SELECT
    m.ROWID AS rowId,
    m.guid,
    m.text,
    m.attributedBody AS messageBuffer,
    m.is_from_me AS isFromMe,
    m.date AS sentAt,
    h.id AS handle,
    cmj.chat_id AS chatId,
    m.is_audio_message AS isAudioMessage,
    CASE WHEN m.thread_originator_guid IS NOT NULL THEN 1 ELSE 0 END AS isReply,
    CASE WHEN m.cache_has_attachments = 1 THEN (
      SELECT a.mime_type
      FROM message_attachment_join AS maj
      JOIN attachment AS a ON a.ROWID = maj.attachment_id
      WHERE maj.message_id = m.ROWID
      ORDER BY maj.ROWID
      LIMIT 1
    ) END AS attachmentMime,
    CASE WHEN m.cache_has_attachments = 1 THEN (
      SELECT a.transfer_name
      FROM message_attachment_join AS maj
      JOIN attachment AS a ON a.ROWID = maj.attachment_id
      WHERE maj.message_id = m.ROWID
      ORDER BY maj.ROWID
      LIMIT 1
    ) END AS attachmentName
  FROM message AS m
  LEFT JOIN handle AS h ON m.handle_id = h.ROWID
  INNER JOIN chat_message_join AS cmj ON cmj.message_id = m.ROWID
  WHERE m.ROWID > :lastRowId
  ORDER BY m.ROWID ASC
  LIMIT :BATCH_SIZE
`;

const stmt = sqliteDB.prepare(query);
const meId = findOrCreatePerson("Me");
const unknownId = findOrCreatePerson("Unknown");

// --- FTS5 setup (idempotent; runs before the loop so inserts hit the triggers) ---
// External-content mode: the index points back to `messages` by id,
// storing no second copy of the text.
db.run(
  sql.raw(`
  CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
    message_content,
    content='messages',
    content_rowid='id'
  )
`)
);
// Triggers keep the index in sync as rows change — no full rebuild each run.
db.run(
  sql.raw(`
  CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
    INSERT INTO messages_fts(rowid, message_content)
    VALUES (new.id, new.message_content);
  END
`)
);
db.run(
  sql.raw(`
  CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
    INSERT INTO messages_fts(messages_fts, rowid, message_content)
    VALUES ('delete', old.id, old.message_content);
  END
`)
);
db.run(
  sql.raw(`
  CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
    INSERT INTO messages_fts(messages_fts, rowid, message_content)
    VALUES ('delete', old.id, old.message_content);
    INSERT INTO messages_fts(rowid, message_content)
    VALUES (new.id, new.message_content);
  END
`)
);

while (true) {
  const rows = stmt.all({ lastRowId, BATCH_SIZE }) as MessageRow[];
  if (rows.length === 0) break;

  db.transaction((tx) => {
    for (const row of rows) {
      const {
        guid,
        text,
        messageBuffer,
        isFromMe,
        sentAt,
        handle,
        chatId,
        attachmentMime,
        attachmentName,
        isReply,
        isAudioMessage,
      } = row;
      let decodedMessage: string | null;
      try {
        decodedMessage = messageBuffer
          ? decodeMessageBuffer(row.messageBuffer)
          : text;
      } catch (error) {
        console.warn(`Failed to decode message ${guid}, skipping:`, error);
        continue;
      }
      // Apple marks attachment slots with U+FFFC ("￼"). Strip those + trim;
      // if nothing real is left, fall back to an attachment placeholder. Use
      // || (not ??) so an empty-after-cleaning string also triggers the fallback.
      const cleaned = decodedMessage?.replace(/￼/g, "").trim();
      // For attachment-only messages, prefer the original file name; fall back
      // to a placeholder when there's no name (e.g. expired audio messages).
      const messageContent =
        cleaned ||
        attachmentName ||
        placeholderFor(attachmentMime, isAudioMessage);
      if (!messageContent) continue;
      const normalizedDate = convertAppleTimestampToUnix(sentAt);
      const personId = isFromMe
        ? meId
        : handle
          ? findOrCreatePerson(handle)
          : unknownId;
      tx.insert(messages)
        .values({
          guid,
          personId,
          chatId,
          isFromMe: Boolean(isFromMe),
          messageContent,
          isReply: Boolean(isReply),
          attachmentType: attachmentMime,
          sentAt: normalizedDate,
        })
        // Upsert (not do-nothing) so a rescan refreshes derived columns on
        // rows that already exist — this is what makes backfill work.
        .onConflictDoUpdate({
          target: messages.guid,
          set: {
            messageContent,
            isReply: Boolean(isReply),
            attachmentType: attachmentMime,
          },
        })
        .run();
    }

    lastRowId = rows[rows.length - 1].rowId;
    tx.insert(ingestionState)
      .values({ id: 1, lastRowId, schemaVersion: SCHEMA_VERSION })
      .onConflictDoUpdate({
        target: ingestionState.id,
        set: { lastRowId, schemaVersion: SCHEMA_VERSION },
      })
      .run();
  });
}

console.log("Ingestion completed!");

// --- Contacts enrichment ---
const authStatus = contacts.getAuthStatus();
if (authStatus !== "Authorized") {
  console.log(`Contacts access: ${authStatus} — requesting…`);
  await contacts.requestAccess();
}

const allContacts = contacts.getAllContacts([
  "middleName",
  "jobTitle",
  "contactImage",
]) as Contact[];
console.log(`Fetched ${allContacts.length} contacts from the address book`);

// Normalize a handle for matching. chat.db stores phones as E.164
// (+18008888888) but contacts may store national format ((800) 888-8888) —
// strip to digits and compare the last 10 so both sides line up. Emails just
// lowercase. Both the map keys and the lookup use this, so formats can't drift.
const normalizeHandle = (raw: string) =>
  raw.includes("@") ? raw.toLowerCase() : raw.replace(/\D/g, "").slice(-10);

interface Contact {
  firstName: string;
  middleName: string;
  lastName: string;
  nickname: string;
  birthday: string;
  jobTitle: string;
  contactImage?: Buffer;
  phoneNumbers: string[];
  emailAddresses: string[];
}

const contactByHandle = new Map<string, Contact>();
// On a key collision (duplicate contacts sharing a number/email), keep the
// richer one — prefer whichever has a contact image so a later imageless
// duplicate can't overwrite a photo.
const setContact = (key: string, contact: Contact) => {
  const existing = contactByHandle.get(key);
  if (existing?.contactImage?.length && !contact.contactImage?.length) return;
  contactByHandle.set(key, contact);
};

for (const contact of allContacts) {
  for (const phone of contact.phoneNumbers ?? [])
    setContact(normalizeHandle(phone), contact);
  for (const email of contact.emailAddresses ?? [])
    setContact(normalizeHandle(email), contact);
}

// The library returns "" for unset fields — store those as NULL instead.
const clean = (value?: string) => value || null;

const allPeople = db.select().from(people).all();
let matched = 0;

for (const person of allPeople) {
  const contact = contactByHandle.get(normalizeHandle(person.handle));
  if (!contact) continue; // non-contact -> leave fields NULL

  console.log(
    `Matched ${person.handle} → ${contact.firstName} ${contact.lastName}`
  );
  matched++;

  db.update(people)
    .set({
      isContact: true,
      firstName: clean(contact.firstName),
      middleName: clean(contact.middleName),
      lastName: clean(contact.lastName),
      nickname: clean(contact.nickname),
      birthday: clean(contact.birthday),
      jobTitle: clean(contact.jobTitle),
      image: contact.contactImage?.length ? contact.contactImage : null,
    })
    .where(eq(people.id, person.id))
    .run();
}
console.log(`Enriched ${matched}/${allPeople.length} people from contacts`);
