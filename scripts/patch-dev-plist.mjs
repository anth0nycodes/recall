/**
 * `electron-vite dev` runs the stock node_modules/electron/dist/Electron.app,
 * whose Info.plist has no NSContactsUsageDescription. macOS refuses to show the
 * Contacts prompt for a binary without that key, so requestAccess() resolves as
 * denied instantly and onboarding jumps straight to the "Open System Settings"
 * fallback. Packaged builds get the key from electron-builder.yml (mac.extendInfo);
 * this patches the dev binary so both paths behave the same.
 *
 * Editing the plist invalidates Electron's ad-hoc signature, and TCC won't prompt
 * for a binary whose signature doesn't validate — it denies instantly and writes
 * no entry at all — so the app has to be re-signed afterwards.
 *
 * Keep the string in sync with mac.extendInfo in electron-builder.yml.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const APP = "node_modules/electron/dist/Electron.app";
const PLIST = `${APP}/Contents/Info.plist`;

const KEYS = {
  NSContactsUsageDescription:
    "Recall uses your contacts to show names instead of phone numbers and email addresses. Contact data never leaves your Mac.",
};

if (process.platform !== "darwin" || !existsSync(PLIST)) process.exit(0);

function plist(command) {
  return execFileSync("/usr/libexec/PlistBuddy", ["-c", command, PLIST], {
    encoding: "utf8",
    // Add reports a duplicate key on stderr before we fall back to Set; the
    // caller handles it, so don't leak it into the dev output.
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

function isSignatureValid() {
  try {
    execFileSync("/usr/bin/codesign", ["--verify", APP], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const isPatched = Object.entries(KEYS).every((entry) => {
  const [key, value] = entry;
  try {
    return plist(`Print :${key}`) === value;
  } catch {
    return false;
  }
});

// Re-signing walks every helper binary, so skip the work when a previous run
// already left the app patched and valid.
if (isPatched && isSignatureValid()) process.exit(0);

for (const [key, value] of Object.entries(KEYS)) {
  // Set fails when the key is absent, so add it first and ignore the duplicate error.
  try {
    plist(`Add :${key} string ${JSON.stringify(value)}`);
  } catch {
    plist(`Set :${key} ${JSON.stringify(value)}`);
  }
}

execFileSync("/usr/bin/codesign", ["--force", "--deep", "--sign", "-", APP], {
  stdio: "inherit",
});

console.log(
  `Patched ${Object.keys(KEYS).join(", ")} into dev Electron.app and re-signed it`
);
