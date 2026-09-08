import { z } from "zod";
import { UserInfoSchema } from "../schemas/UserInfoSchema";
import { User } from "../types";

interface RecallAPI {
  getUser: () => Promise<User>;
  updateOnboardingStep: (
    stepName: string,
    hasCompletedOnboarding?: boolean
  ) => Promise<void>;
  updateUserInfo: (data: z.infer<typeof UserInfoSchema>) => Promise<void>;
}

declare global {
  interface Window {
    api: RecallAPI;
  }
}

export {};
