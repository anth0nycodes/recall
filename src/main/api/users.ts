import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { users } from "../db/schema";

export const usersApi = {
  getUser() {
    let user = db.select().from(users).where(eq(users.id, 1)).get();
    if (!user) user = db.insert(users).values({ id: 1 }).returning().get();
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
};
