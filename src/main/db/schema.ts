import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  hasCompletedOnboarding: integer("has_completed_onboarding", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
});
