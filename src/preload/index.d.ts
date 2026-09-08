import { z } from "zod";
import { UserInfoSchema } from "../schemas/UserInfoSchema";
import { PermissionStatus, User } from "../types";

interface RecallAPI {
  getUser: () => Promise<User>;
  updateOnboardingStep: (
    stepName: string,
    hasCompletedOnboarding?: boolean
  ) => Promise<void>;
  updateUserInfo: (data: z.infer<typeof UserInfoSchema>) => Promise<void>;
  getFullDiskAccessStatus: () => Promise<PermissionStatus>;
  requestFullDiskAccess: () => Promise<void>;
  relaunchApp: () => Promise<void>;
  getContactsAccessStatus: () => Promise<PermissionStatus>;
  requestContactsAccess: () => Promise<PermissionStatus>;
  saveOpenRouterApiKey: (apiKey: string) => Promise<void>;
  hasOpenRouterApiKey: () => Promise<boolean>;
  clearOpenRouterApiKey: () => Promise<void>;
}

declare global {
  interface Window {
    api: RecallAPI;
  }
}

export {};
