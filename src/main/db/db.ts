import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { app } from "electron";
import { is } from "@electron-toolkit/utils";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

if (is.dev) {
  app.setPath("userData", join(app.getPath("appData"), "recall-dev"));
}

const userDataDir = app.getPath("userData");
await mkdir(userDataDir, { recursive: true });

const sqlite = new Database(join(userDataDir, "recall.db"));
export const db = drizzle({ client: sqlite });

export function runMigrations() {
  // Dev: migrations live in the project root. Packaged: shipped via
  // electron-builder `extraResources` into the app's resources dir.
  const migrationsFolder = is.dev
    ? join(app.getAppPath(), "drizzle")
    : join(process.resourcesPath, "drizzle");

  migrate(db, { migrationsFolder });
}
