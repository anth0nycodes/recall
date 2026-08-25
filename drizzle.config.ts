import { defineConfig } from "drizzle-kit";
import { homedir } from "node:os";
import { join } from "node:path";

// Point the CLI (studio, migrate, push) at the SAME DB the dev app uses:
// ~/Library/Application Support/recall-dev/recall.db (see the is.dev override in
// src/main/db/db.ts). Otherwise drizzle-kit creates a stray empty recall.db in
// the project root that has nothing to do with the running app.
const devDbPath = join(
  homedir(),
  "Library",
  "Application Support",
  "recall-dev",
  "recall.db",
);

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/main/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: devDbPath },
});
