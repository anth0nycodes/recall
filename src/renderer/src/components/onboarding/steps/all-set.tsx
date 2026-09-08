import { ArrowLeft } from "lucide-react";
import { OnboardingButton } from "../onboarding-button";
import { StepLayout } from "../step-layout";
import { OnboardingStepProps } from "./types";

export function AllSet({ onNext, onBack }: OnboardingStepProps) {
  return (
    <StepLayout
      title="You’re all set! 🎉"
      description="Recall is ready to help you find what you need."
      footer={
        <div className="flex w-full justify-between gap-4">
          <OnboardingButton
            onClick={onBack}
            variant="ghost"
            className="text-muted-foreground flex items-center gap-2"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Back</span>
          </OnboardingButton>
          <OnboardingButton onClick={onNext}>Continue</OnboardingButton>
        </div>
      }
    />
  );
}
