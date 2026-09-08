import { z } from "zod";
import { UserInfoSchema } from "../../../schemas/UserInfoSchema";

export const usersApi = {
  getUser: () => window.api.getUser(),
  updateOnboardingStep: (stepName: string, hasCompletedOnboarding?: boolean) =>
    window.api.updateOnboardingStep(stepName, hasCompletedOnboarding),
  updateUserInfo: (data: z.infer<typeof UserInfoSchema>) =>
    window.api.updateUserInfo(data),
};
