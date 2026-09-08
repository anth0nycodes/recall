import { systemPermissionsApi } from "@renderer/api/system-permissions";
import { Button } from "@renderer/components/ui/button";
import { usePermissionGate } from "@renderer/hooks/use-permission-gate";
import { PermissionDeniedDialog } from "./permission-denied-dialog";
import { OnboardingStepProps } from "./types";

export function ContactsAccess({ onNext }: OnboardingStepProps) {
  const { isWaiting, isDeniedDialogOpen, setIsDeniedDialogOpen, request } =
    usePermissionGate({
      queryKey: "contacts-access",
      getStatus: systemPermissionsApi.getContactsAccessStatus,
      requestAccess: systemPermissionsApi.requestContactsAccess,
      onGranted: onNext,
    });

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <span className="text-center text-4xl font-medium">
          One more thing.
        </span>
        <p className="font-geist text-muted-foreground text-center text-[20px]">
          Recall uses your contacts to show names instead of phone numbers and
          email addresses.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Button onClick={request} className="font-geist px-5 py-2 text-lg">
          Allow Contacts Access
        </Button>
        {isWaiting && (
          <p className="font-geist text-muted-foreground text-center text-sm">
            Waiting for access. We&apos;ll continue automatically once you allow
            it.
          </p>
        )}
      </div>

      <PermissionDeniedDialog
        open={isDeniedDialogOpen}
        onOpenChange={setIsDeniedDialogOpen}
        permissionName="Contacts access"
        reason="Without it, Recall can only show raw phone numbers and email addresses instead of the names you know."
        actionLabel="Allow Contacts Access"
        onRetry={request}
      />
    </div>
  );
}
