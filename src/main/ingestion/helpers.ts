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

// Builds a placeholder for attachment-only messages (photo/video/etc.) whose
// text decodes to nothing but Apple's U+FFFC attachment glyph. Branch on the
// attachment's mime type.
// - isAudioMessage: voice-message flag on the message itself; survives even
//   after Apple auto-expires the audio file (~2 min), so check it before mime.
// - null mime  = no attachment  -> null (caller skips)
export function placeholderFor(
  attachmentMime: string | null,
  isAudioMessage: number
): string | null {
  if (isAudioMessage) return "🎙️ Audio";
  if (attachmentMime === null) return null;
  if (attachmentMime.startsWith("image/")) return "📷 Photo";
  if (attachmentMime.startsWith("video/")) return "🎥 Video";
  if (attachmentMime.startsWith("audio/")) return "🎙️ Audio";
  if (attachmentMime === "application/pdf") return "📄 PDF";
  return "📎 Attachment";
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
