import { systemPermissionsApi } from "@renderer/api/system-permissions";
import { usePermissionGate } from "@renderer/hooks/use-permission-gate";
import { OnboardingButton } from "../onboarding-button";
import { StepLayout } from "../step-layout";
import { PermissionDeniedDialog } from "./permission-denied-dialog";
import { RelaunchPrompt } from "./relaunch-prompt";
import { OnboardingStepProps } from "./types";

export function FullDiskAccess({ onNext }: OnboardingStepProps) {
  const {
    isWaiting,
    needsRelaunch,
    hasFailedCheck,
    isDeniedDialogOpen,
    setIsDeniedDialogOpen,
    request,
    verify,
  } = usePermissionGate({
    queryKey: "full-disk-access",
    getStatus: systemPermissionsApi.getFullDiskAccessStatus,
    requestAccess: systemPermissionsApi.requestFullDiskAccess,
    // Only fires once the grant survived a restart, so the next steps and the
    // ingestion behind them can actually read chat.db.
    onGranted: onNext,
  });

  if (needsRelaunch) {
    return (
      <RelaunchPrompt description="macOS only hands Full Disk Access to Recall on a fresh launch. Restarting takes a second and picks up right here." />
    );
  }

  return (
    <>
      <StepLayout
        title="Give Recall access to your messages."
        description="Recall needs Full Disk Access to index your iMessage history locally."
        footer={
          <div className="flex flex-col items-center gap-3">
            <OnboardingButton onClick={request}>
              Open System Settings
            </OnboardingButton>
            {isWaiting && (
              <>
                <p className="font-geist text-muted-foreground text-center text-sm">
                  {hasFailedCheck
                    ? "Still not seeing it. Check that the switch next to Recall is on — macOS can take a moment to register it."
                    : "Turn on Recall under Privacy & Security → Full Disk Access. We'll continue automatically once you do."}
                </p>
                <OnboardingButton
                  variant="ghost"
                  onClick={verify}
                  className="text-base"
                >
                  I&apos;ve allowed it
                </OnboardingButton>
              </>
            )}
          </div>
        }
      />

      <PermissionDeniedDialog
        open={isDeniedDialogOpen}
        onOpenChange={setIsDeniedDialogOpen}
        permissionName="Full Disk Access"
        reason="Without it, Recall can't read your iMessage history, so there's nothing to search."
        actionLabel="Open System Settings"
        onRetry={request}
      />
    </>
  );
}
