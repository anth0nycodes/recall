import { db } from "./recall-db";

export interface MessageRow {
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
  dateEdited: number;
}

export interface Contact {
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

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
