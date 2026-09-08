import { eq } from "drizzle-orm";
import { db } from "./db/db";
import { users } from "./db/schema";

export function getUser() {
  let user = db.select().from(users).where(eq(users.id, 1)).get();
  if (!user) user = db.insert(users).values({ id: 1 }).returning().get();
  return user;
}
