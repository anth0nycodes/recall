import { homedir } from "node:os";
import Database from "better-sqlite3";
import { eq, sql } from "drizzle-orm";
import contacts from "node-mac-contacts";
import { db } from "../db/db";
import { ingestionState, messages, people } from "../db/schema";
import {
  convertAppleTimestampToUnix,
  decodeMessageBuffer,
  findOrCreatePerson,
  placeholderFor,
} from "./helpers";
import type { Contact, MessageRow, Tx } from "./types";

const chatDBPath = `${homedir()}/Library/Messages/chat.db`;

const BATCH_SIZE = 2500;

// Bump when a schema change needs existing rows re-derived (e.g. a new column
// filled from chat.db). A stored version below this forces one full rescan so
// old rows get backfilled; matching versions keep the fast incremental cursor.
const SCHEMA_VERSION = 1;
const selectBody = `
  SELECT
    m.ROWID AS rowId,
    m.guid,
    m.text,
    m.attributedBody AS messageBuffer,
    m.is_from_me AS isFromMe,
    m.date AS sentAt,
    m.date_edited AS dateEdited,
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
`;

// FTS5 setup (idempotent). External-content mode: the index points back to
// `messages` by id, storing no second copy of the text. Triggers keep the index
// in sync as rows change, so there's no full rebuild each run.
function ensureFtsSchema() {
  db.run(
    sql.raw(`
    CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
      message_content,
      content='messages',
      content_rowid='id'
    )
  `)
  );
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
}

// Map one chat.db row into the messages table (insert new, or upsert to refresh
// text on an existing guid).
function ingestRow(tx: Tx, row: MessageRow, meId: number, unknownId: number) {
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
    decodedMessage = messageBuffer ? decodeMessageBuffer(messageBuffer) : text;
  } catch (error) {
    console.warn(`Failed to decode message ${guid}, skipping:`, error);
    return;
  }

  // Apple marks attachment slots with U+FFFC ("￼"). Strip those + trim;
  const cleaned = decodedMessage?.replace(/￼/g, "").trim();
  const messageContent =
    cleaned || attachmentName || placeholderFor(attachmentMime, isAudioMessage);
  if (!messageContent) return;

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
    // rows that already exist — this is what makes backfill + edits work.
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

// Run one batched pass over a cursor-driven query. `nextCursor` reads the cursor
// value off the last row of a batch; `saveCursor` persists it (inside the same
// txn as the inserts, so a crash resumes cleanly). Returns the final cursor.
function runPass(
  stmt: import("better-sqlite3").Statement,
  startCursor: number,
  nextCursor: (row: MessageRow) => number,
  handleRow: (tx: Tx, row: MessageRow) => void,
  saveCursor: (tx: Tx, cursor: number) => void
) {
  let cursor = startCursor;
  while (true) {
    const rows = stmt.all({ cursor, BATCH_SIZE }) as MessageRow[];
    if (rows.length === 0) break;
    db.transaction((tx) => {
      for (const row of rows) handleRow(tx, row);
      cursor = nextCursor(rows[rows.length - 1]);
      saveCursor(tx, cursor);
    });
  }
  return cursor;
}

// Read messages out of chat.db into Recall's DB. Safe to call repeatedly: the
// ROWID cursor makes each call incremental (only new rows), so this is both the
// first-run importer (onboarding) and the per-new-message sync (watcher).
// FDA-gated — the chat.db open throws without Full Disk Access.
export async function runIngestion() {
  const sqliteDB = new Database(chatDBPath, { readonly: true });
  try {
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

    // Pass A — new messages. Forward cursor on ROWID (inserts always get a
    // higher ROWID), so this only ever sees rows we haven't imported yet.
    const newMessagesStmt = sqliteDB.prepare(`
      ${selectBody}
      WHERE m.ROWID > :cursor
      ORDER BY m.ROWID ASC
      LIMIT :BATCH_SIZE
    `);
    // Pass B — edited messages. Edits mutate a row in place (same ROWID) and
    // bump date_edited, so the ROWID cursor never revisits them. This pass looks
    // back over old rows by date_edited instead.
    const editedMessagesStmt = sqliteDB.prepare(`
      ${selectBody}
      WHERE m.date_edited > :cursor
      ORDER BY m.date_edited ASC
      LIMIT :BATCH_SIZE
    `);

    const meId = findOrCreatePerson("Me");
    const unknownId = findOrCreatePerson("Unknown");
    ensureFtsSchema();

    const handleRow = (tx: Tx, row: MessageRow) =>
      ingestRow(tx, row, meId, unknownId);

    // Pass A — new messages (ROWID cursor).
    runPass(
      newMessagesStmt,
      needsBackfill ? 0 : (state?.lastRowId ?? 0),
      (row) => row.rowId,
      handleRow,
      (tx, cursor) =>
        tx
          .insert(ingestionState)
          .values({ id: 1, lastRowId: cursor, schemaVersion: SCHEMA_VERSION })
          .onConflictDoUpdate({
            target: ingestionState.id,
            set: { lastRowId: cursor, schemaVersion: SCHEMA_VERSION },
          })
          .run()
    );

    // Pass B — edited messages (date_edited cursor). Refreshes text on rows Pass
    // A already imported but can never revisit.
    runPass(
      editedMessagesStmt,
      needsBackfill ? 0 : (state?.lastEditSync ?? 0),
      (row) => row.dateEdited,
      handleRow,
      (tx, cursor) =>
        tx
          .insert(ingestionState)
          .values({
            id: 1,
            lastEditSync: cursor,
            schemaVersion: SCHEMA_VERSION,
          })
          .onConflictDoUpdate({
            target: ingestionState.id,
            set: { lastEditSync: cursor, schemaVersion: SCHEMA_VERSION },
          })
          .run()
    );

    console.log("Ingestion completed!");
  } finally {
    // Always release the chat.db handle — runIngestion is called repeatedly.
    sqliteDB.close();
  }

  // Enrich AFTER the passes: new handles create new `people` rows, so this both
  // fills those in and refreshes existing contact info. Runs on every ingestion
  // (onboarding + each incremental sync) so `people` never drifts from Contacts.
  await enrichPeopleFromContacts();
}

// Fill people rows with macOS Contacts data (names, photos). Internal — always
// runs as the tail of runIngestion (Contacts-gated; getAuthStatus/requestAccess
// guards it if access isn't granted).
async function enrichPeopleFromContacts() {
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
}
