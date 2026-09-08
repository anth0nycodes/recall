import { closeSync, openSync } from "node:fs";
import { homedir } from "node:os";
import { app, shell } from "electron";
import contacts from "node-mac-contacts";
import type { PermissionStatus } from "../../types";

const chatDBPath = `${homedir()}/Library/Messages/chat.db`;

const FULL_DISK_ACCESS_PANE =
  "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles";

const CONTACTS_PANE =
  "x-apple.systempreferences:com.apple.preference.security?Privacy_Contacts";

function canReadChatDB(): boolean {
  // ENOENT counts as granted: TCC denies protected paths with EPERM whether or not
  // the file exists, so getting "no such file" means we cleared TCC and the user
  // simply has no Messages history yet.
  try {
    closeSync(openSync(chatDBPath, "r"));
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "ENOENT";
  }
}

const hadAccessAtLaunch = canReadChatDB();

function readContactsAuthStatus(): PermissionStatus {
  const status = contacts.getAuthStatus();
  if (status === "Authorized") return "granted";
  if (status === "Not Determined") return "not-determined";
  return "denied";
}

export const systemPermissionsApi = {
  getFullDiskAccessStatus: async (): Promise<PermissionStatus> => {
    if (!canReadChatDB()) return "denied";
    return hadAccessAtLaunch ? "granted" : "needs-relaunch";
  },

  requestFullDiskAccess: async (): Promise<void> =>
    await shell.openExternal(FULL_DISK_ACCESS_PANE),

  relaunchApp: (): void => {
    app.relaunch();
    app.exit(0);
  },

  getContactsAccessStatus: (): PermissionStatus => readContactsAuthStatus(),

  requestContactsAccess: async (): Promise<PermissionStatus> => {
    // macOS shows the native prompt once. After a denial requestAccess() is a
    // silent no-op, so the only way forward is the Settings pane.
    if (readContactsAuthStatus() === "denied") {
      await shell.openExternal(CONTACTS_PANE);
      return "denied";
    }
    await contacts.requestAccess();
    return readContactsAuthStatus();
  },
};
