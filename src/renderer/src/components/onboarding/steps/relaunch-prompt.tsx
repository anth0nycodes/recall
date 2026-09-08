import { systemPermissionsApi } from "@renderer/api/system-permissions";
import { OnboardingButton } from "../onboarding-button";
import { StepLayout } from "../step-layout";

interface RelaunchPromptProps {
  description: string;
}

// Shown when macOS has the permission but this process can't use it yet. The
// onboarding step is persisted per user, so relaunching lands back on the same
// step, where the fresh process sees a plain "granted" and moves on.
export function RelaunchPrompt({ description }: RelaunchPromptProps) {
  return (
    <StepLayout
      title="Restart Recall to finish."
      description={description}
      footer={
        <OnboardingButton onClick={systemPermissionsApi.relaunchApp}>
          Restart Recall
        </OnboardingButton>
      }
    />
  );
}
