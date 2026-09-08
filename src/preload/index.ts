import { contextBridge, ipcRenderer } from "electron";
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
};

// Expose the API to the renderer via contextBridge (context isolation is on)
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", recallAPI);
  } catch (error) {
    console.error(error);
  }
}
