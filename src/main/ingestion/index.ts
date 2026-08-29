import { homedir } from "node:os";
import Database from "better-sqlite3";
import { messages } from "../db/schema";
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
let lastRowId = 0;

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
  });

  lastRowId = rows[rows.length - 1].rowId;
  // TODO(step 10, index_state): persist lastRowId here (inside/after the batch
  // txn) so an interrupted run resumes from the last committed batch.
}

// TODO(step 11, FTS5): after ingestion, index messageContent into an FTS5
// virtual table (messages_fts, content='messages', content_rowid='id') for
// keyword search. Drizzle has no FTS5 support -> raw db.run() DDL + triggers.
console.log("Ingestion completed!");
