import { User } from "../types";

interface RecallAPI {
  getUser: () => Promise<User>;
  updateOnboardingStep: (
    stepName: string,
    hasCompletedOnboarding?: boolean
  ) => Promise<void>;
}

declare global {
  interface Window {
    api: RecallAPI;
  }
}

export {};
