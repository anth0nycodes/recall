import { contextBridge, ipcRenderer } from "electron";
import { z } from "zod";
import { UserInfoSchema } from "../schemas/UserInfoSchema";
import { User } from "../types";

// Custom APIs for renderer
const recallAPI = {
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

// Expose the API to the renderer via contextBridge (context isolation is on)
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", recallAPI);
  } catch (error) {
    console.error(error);
  }
}
