import { contextBridge, ipcRenderer } from "electron";
import { z } from "zod";
import { UserInfoSchema } from "../schemas/UserInfoSchema";
import { PermissionStatus, User } from "../types";

// Custom APIs for renderer
const userMethods = {
  getUser: (): Promise<User> => ipcRenderer.invoke("get-user"),
  updateOnboardingStep: (
    stepName: string,
    hasCompletedOnboarding?: boolean
  ): Promise<void> =>
    ipcRenderer.invoke(
      "update-onboarding-step",
      stepName,
      hasCompletedOnboarding
    ),
  updateUserInfo: (data: z.infer<typeof UserInfoSchema>): Promise<void> =>
    ipcRenderer.invoke("update-user-info", data),
};

const systemPermissionsMethods = {
  getFullDiskAccessStatus: (): Promise<PermissionStatus> =>
    ipcRenderer.invoke("get-full-disk-access-status"),
  requestFullDiskAccess: (): Promise<void> =>
    ipcRenderer.invoke("request-full-disk-access"),
  getContactsAccessStatus: (): Promise<PermissionStatus> =>
    ipcRenderer.invoke("get-contacts-access-status"),
  requestContactsAccess: (): Promise<PermissionStatus> =>
    ipcRenderer.invoke("request-contacts-access"),
};

const apiKeyMethods = {
  saveOpenRouterApiKey: (apiKey: string): Promise<void> =>
    ipcRenderer.invoke("save-openrouter-api-key", apiKey),
  hasOpenRouterApiKey: (): Promise<boolean> =>
    ipcRenderer.invoke("has-openrouter-api-key"),
  clearOpenRouterApiKey: (): Promise<void> =>
    ipcRenderer.invoke("clear-openrouter-api-key"),
};

const recallAPI = {
  ...userMethods,
  ...systemPermissionsMethods,
  ...apiKeyMethods,
};

// Expose the API to the renderer via contextBridge (context isolation is on)
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", recallAPI);
  } catch (error) {
    console.error(error);
  }
}
