import { contextBridge, ipcRenderer } from "electron";

// Custom APIs for renderer
const recallAPI = {
  getUser: () => ipcRenderer.invoke("get-user"),
};

// Expose the API to the renderer via contextBridge (context isolation is on)
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", recallAPI);
  } catch (error) {
    console.error(error);
  }
}
