import { NSAttributedString, Unarchiver } from "@parseaple/typedstream";
import { eq } from "drizzle-orm";
import { people } from "../db/schema";
import { db } from "./recall-db";

export function convertAppleTimestampToUnix(appleTimestamp: number) {
  const appleTimestampInMs = appleTimestamp / 1000000;
  const APPLE_TO_UNIX_OFFSET_MS = 978307200 * 1000;
  const normalizedTimestamp = appleTimestampInMs + APPLE_TO_UNIX_OFFSET_MS;
  return new Date(normalizedTimestamp);
}

export function decodeMessageBuffer(messageBuffer: Buffer) {
  const message: NSAttributedString =
    Unarchiver.open(messageBuffer).decodeSingleRoot();
  return message.string;
}

export function findOrCreatePerson(handle: string) {
  const existing = db
    .select()
    .from(people)
    .where(eq(people.handle, handle))
    .get();
  if (existing) return existing.id;
  const inserted = db.insert(people).values({ handle }).returning().get();
  return inserted.id;
}
