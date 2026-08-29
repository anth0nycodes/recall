import { homedir } from "node:os";
import Database from "better-sqlite3";
import { eq, sql } from "drizzle-orm";
import { ingestionState, messages } from "../db/schema";
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
  isAudioMessage: number;
}

const chatDBPath = `${homedir()}/Library/Messages/chat.db`;
const sqliteDB = new Database(chatDBPath, { readonly: true });

const BATCH_SIZE = 2500;
const state = db
  .select()
  .from(ingestionState)
  .where(eq(ingestionState.id, 1))
  .get();
let lastRowId = state?.lastRowId ?? 0;

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
    CASE WHEN m.cache_has_attachments = 1 THEN (
      SELECT a.mime_type
      FROM message_attachment_join AS maj
      JOIN attachment AS a ON a.ROWID = maj.attachment_id
      WHERE maj.message_id = m.ROWID
      LIMIT 1
    ) END AS attachmentMime
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
      const messageContent =
        cleaned || placeholderFor(attachmentMime, isAudioMessage);
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
          sentAt: normalizedDate,
        })
        .onConflictDoNothing()
        .run();
    }

    lastRowId = rows[rows.length - 1].rowId;
    tx.insert(ingestionState)
      .values({ id: 1, lastRowId })
      .onConflictDoUpdate({
        target: ingestionState.id,
        set: { lastRowId },
      })
      .run();
  });
}

console.log("Ingestion completed!");
