import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  onboardingStep: text("onboarding_step").notNull().default("welcome"),
  hasCompletedOnboarding: integer("has_completed_onboarding", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
});

export const people = sqliteTable("people", {
  id: integer("id").primaryKey(),
  handle: text("handle").notNull().unique(),
  firstName: text("first_name"),
  middleName: text("middle_name"),
  lastName: text("last_name"),
  nickname: text("nickname"),
  contactImage: blob("contact_image", {
    mode: "buffer",
  }),
  birthday: text("birthday"),
  jobTitle: text("job_title"),
});

export const ingestionState = sqliteTable("ingestion_state", {
  id: integer("id").primaryKey(),
  lastRowId: integer("last_row_id").notNull().default(0),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey(),
  guid: text("guid").notNull().unique(),
  personId: integer("person_id")
    .notNull()
    .references(() => people.id),
  chatId: integer("chat_id").notNull(),
  isFromMe: integer("is_from_me", {
    mode: "boolean",
  }).notNull(),
  messageContent: text("message_content").notNull(),
  sentAt: integer("sent_at", {
    mode: "timestamp",
  }).notNull(),
});
