import { join } from "path";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { usersApi } from "./api/users";
import { runMigrations } from "./db/db";
import { runIngestion } from "./ingestion";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      // TODO: make sure to disable devtools in the future for production
      preload: join(import.meta.dirname, "../preload/index.mjs"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer based on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(import.meta.dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle("get-user", () => usersApi.getUser());
  ipcMain.handle(
    "update-onboarding-step",
    (_, stepName: string, hasCompletedOnboarding?: boolean) =>
      usersApi.updateOnboardingStep(stepName, hasCompletedOnboarding)
  );

  // Ingestion (FDA-gated). Runs the message passes, then enriches `people` from
  // Contacts as its tail. Called by the onboarding button and, later, the
  // new-message watcher.
  ipcMain.handle("start-ingestion", () => runIngestion());

  // Apply pending DB migrations before any window/query runs.
  runMigrations();

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
