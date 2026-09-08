import { closeSync, openSync } from "node:fs";
import { homedir } from "node:os";
import { shell } from "electron";
import contacts from "node-mac-contacts";
import type { PermissionStatus } from "../../types";

const chatDBPath = `${homedir()}/Library/Messages/chat.db`;

const FULL_DISK_ACCESS_PANE =
  "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles";

export const systemPermissionsApi = {
  getFullDiskAccessStatus: async (): Promise<PermissionStatus> => {
    // ENOENT counts as granted: TCC denies protected paths with EPERM whether or not
    // the file exists, so getting "no such file" means we cleared TCC and the user
    // simply has no Messages history yet.
    try {
      closeSync(openSync(chatDBPath, "r"));
      return "granted";
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return "granted";
      return "denied";
    }
  },

  requestFullDiskAccess: async (): Promise<void> =>
    await shell.openExternal(FULL_DISK_ACCESS_PANE),

  getContactsAccessStatus: (): PermissionStatus => {
    const status = contacts.getAuthStatus();
    if (status === "Authorized") return "granted";
    if (status === "Not Determined") return "not-determined";
    return "denied";
  },

  requestContactsAccess: async (): Promise<PermissionStatus> => {
    const result = await contacts.requestAccess();
    return result === "Authorized" ? "granted" : "denied";
  },
};
