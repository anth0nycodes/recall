import { OnboardingButton } from "../onboarding-button";
import { StepLayout } from "../step-layout";
import { OnboardingStepProps } from "./types";

export function Welcome({ onNext }: OnboardingStepProps) {
  return (
    <StepLayout
      title="👋 Welcome to Recall!"
      description="Let's get you set up."
      footer={<OnboardingButton onClick={onNext}>Get started</OnboardingButton>}
    />
  );
}
