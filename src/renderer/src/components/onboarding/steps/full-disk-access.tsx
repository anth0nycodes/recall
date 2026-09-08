import { systemPermissionsApi } from "@renderer/api/system-permissions";
import { Button } from "@renderer/components/ui/button";
import { usePermissionGate } from "@renderer/hooks/use-permission-gate";
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
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <span className="text-center text-4xl font-medium">
          Give Recall access to your messages.
        </span>
        <p className="font-geist text-muted-foreground text-center text-[20px]">
          Recall needs Full Disk Access to index your iMessage history locally.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Button onClick={request} className="font-geist px-5 py-2 text-lg">
          Open System Settings
        </Button>
        {isWaiting && (
          <>
            <p className="font-geist text-muted-foreground text-center text-sm">
              Turn on Recall under Privacy &amp; Security → Full Disk Access.
              We&apos;ll continue automatically once you do.
            </p>
            <Button variant="ghost" onClick={verify} className="font-geist">
              I&apos;ve allowed it
            </Button>
          </>
        )}
      </div>

      <PermissionDeniedDialog
        open={isDeniedDialogOpen}
        onOpenChange={setIsDeniedDialogOpen}
        permissionName="Full Disk Access"
        reason="Without it, Recall can't read your iMessage history, so there's nothing to search."
        actionLabel="Open System Settings"
        onRetry={request}
      />
    </div>
  );
}
