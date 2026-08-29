import { homedir } from "node:os";
import Database from "better-sqlite3";
import { messages } from "../db/schema";
import {
  convertAppleTimestampToUnix,
  decodeMessageBuffer,
  findOrCreatePerson,
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
    cmj.chat_id AS chatId
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
      const { guid, text, messageBuffer, isFromMe, sentAt, handle, chatId } =
        row;
      const decodedMessage = messageBuffer
        ? decodeMessageBuffer(row.messageBuffer)
        : text;
      if (!decodedMessage) continue;
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
          messageContent: decodedMessage,
          sentAt: normalizedDate,
        })
        .onConflictDoNothing()
        .run();
    }
  });

  lastRowId = rows[rows.length - 1].rowId;
}

console.log("Ingestion completed!");
