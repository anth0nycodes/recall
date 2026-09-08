export interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  onboardingStep: string;
  hasCompletedOnboarding: boolean;
}

export type PermissionStatus =
  | "granted"
  | "denied"
  | "not-determined"
  // Full Disk Access only: allowed in System Settings, but this process started
  // before the grant, so it can't read anything until it restarts. Contacts has
  // no equivalent — System Settings quits and reopens the app itself there.
  | "needs-relaunch";
