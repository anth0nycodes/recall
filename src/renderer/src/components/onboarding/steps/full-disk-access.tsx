import { systemPermissionsApi } from "@renderer/api/system-permissions";
import { usePermissionGate } from "@renderer/hooks/use-permission-gate";
import { OnboardingButton } from "../onboarding-button";
import { StepLayout } from "../step-layout";
import { PermissionDeniedDialog } from "./permission-denied-dialog";
import { OnboardingStepProps } from "./types";

export function FullDiskAccess({ onNext }: OnboardingStepProps) {
  const {
    isWaiting,
    isDeniedDialogOpen,
    setIsDeniedDialogOpen,
    request,
    verify,
  } = usePermissionGate({
    queryKey: "full-disk-access",
    getStatus: systemPermissionsApi.getFullDiskAccessStatus,
    requestAccess: systemPermissionsApi.requestFullDiskAccess,
    onGranted: onNext,
  });

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
                  Turn on Recall under Privacy &amp; Security → Full Disk
                  Access. We&apos;ll continue automatically once you do.
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
