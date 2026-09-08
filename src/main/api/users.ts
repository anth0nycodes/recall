import { eq } from "drizzle-orm";
import { z } from "zod";
import { UserInfoSchema } from "../../schemas/UserInfoSchema";
import { db } from "../db/db";
import { people, users } from "../db/schema";

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
