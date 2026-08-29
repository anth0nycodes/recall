import { homedir } from "node:os";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

// we're making a local drizzle db because the main one from db.ts
// is inside an electron environment, which node can't run properly

// this file will be removed once we move this logic to IPC inside
// the electron environment
const recallDBPath = `${homedir()}/Library/Application Support/recall-dev/recall.db`;
export const db = drizzle({ client: new Database(recallDBPath) });
