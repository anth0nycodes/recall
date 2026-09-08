export interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  onboardingStep: string;
  hasCompletedOnboarding: boolean;
}

export type PermissionStatus = "granted" | "denied" | "not-determined";
