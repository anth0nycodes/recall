import { systemPermissionsApi } from "@renderer/api/system-permissions";
import { usePermissionGate } from "@renderer/hooks/use-permission-gate";
import { OnboardingButton } from "../onboarding-button";
import { StepLayout } from "../step-layout";
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
    <>
      <StepLayout
        title="One more thing."
        description="Recall uses your contacts to show names instead of phone numbers and email addresses."
        footer={
          <div className="flex flex-col items-center gap-3">
            <OnboardingButton onClick={request}>
              Allow Contacts Access
            </OnboardingButton>
            {isWaiting && (
              <p className="font-geist text-muted-foreground text-center text-sm">
                Waiting for access. We&apos;ll continue automatically once you
                allow it.
              </p>
            )}
          </div>
        }
      />

      <PermissionDeniedDialog
        open={isDeniedDialogOpen}
        onOpenChange={setIsDeniedDialogOpen}
        permissionName="Contacts access"
        reason="Without it, Recall can only show raw phone numbers and email addresses instead of the names you know."
        actionLabel="Allow Contacts Access"
        onRetry={request}
      />
    </>
  );
}
