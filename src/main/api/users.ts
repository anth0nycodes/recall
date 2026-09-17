import { eq } from "drizzle-orm";
import { z } from "zod";
import { UserInfoSchema } from "../../schemas/UserInfoSchema";
import { db } from "../db/db";
import { people, users } from "../db/schema";

// Recall is single-user: row 1 is the only user, and it must exist before any
// window opens. Seeding here keeps `getUser` a pure read.
export function seedUser() {
  db.insert(users).values({ id: 1 }).onConflictDoNothing().run();
}

export const usersApi = {
  getUser() {
    const user = db.select().from(users).where(eq(users.id, 1)).get();
    if (!user) throw new Error("User row is missing — seedUser() did not run");
    return user;
  },

  updateOnboardingStep(stepName: string, hasCompletedOnboarding?: boolean) {
    db.update(users)
      .set({
        onboardingStep: stepName,
        ...(hasCompletedOnboarding && {
          hasCompletedOnboarding,
        }),
      })
      .where(eq(users.id, 1))
      .run();
  },

  updateUserInfo(data: z.infer<typeof UserInfoSchema>) {
    const { firstName, lastName } = data;

    db.transaction((tx) => {
      tx.update(users)
        .set({
          firstName,
          lastName,
        })
        .where(eq(users.id, 1))
        .run();
      // TODO: no-op today — the "Me" row is only created by ingestion
      // (ingestion/index.ts findOrCreatePerson("Me")), which runs after the
      // onboarding name step, so this matches zero rows.
      tx.update(people)
        .set({
          firstName,
          lastName,
        })
        .where(eq(people.handle, "Me"))
        .run();
    });
  },
};
