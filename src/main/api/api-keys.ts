import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { app, safeStorage } from "electron";

function keyFilePath() {
  return join(app.getPath("userData"), "openrouter-key.enc");
}

function assertEncryptionAvailable() {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error(
      "Keychain encryption is unavailable, refusing to write the API key to disk."
    );
  }
}

export const apiKeysApi = {
  saveOpenRouterApiKey(apiKey: string) {
    assertEncryptionAvailable();
    writeFileSync(keyFilePath(), safeStorage.encryptString(apiKey), {
      mode: 0o600,
    });
  },

  // Main-process only — deliberately not exposed over IPC. The renderer never
  // needs the plaintext; whatever calls OpenRouter runs here.
  getOpenRouterApiKey(): string | null {
    const path = keyFilePath();
    if (!existsSync(path)) return null;
    assertEncryptionAvailable();
    return safeStorage.decryptString(readFileSync(path));
  },

  hasOpenRouterApiKey(): boolean {
    return existsSync(keyFilePath());
  },

  clearOpenRouterApiKey() {
    rmSync(keyFilePath(), { force: true });
  },
};
