import { GradientCircleCheck } from "@renderer/components/svgs/gradient-circle-check";
import { OnboardingButton } from "../onboarding-button";
import { StepLayout } from "../step-layout";
import { OnboardingStepProps } from "./types";

export function Privacy({ onNext }: OnboardingStepProps) {
  const bulletPoints = [
    "Read-only — Recall never sends, edits, or deletes messages",
    "Private AI — AI sees only what's needed to answer, nothing more",
  ];

  return (
    <StepLayout
      title="Your messages stay on your Mac."
      description="Recall is local-first, so your iMessage data stays on your device."
      footer={<OnboardingButton onClick={onNext}>Continue</OnboardingButton>}
    >
      <ul className="flex flex-col items-center gap-4">
        {bulletPoints.map((point) => (
          <li
            key={point}
            className="font-geist flex items-center gap-2 text-lg"
          >
            <GradientCircleCheck />
            {point}
          </li>
        ))}
      </ul>
    </StepLayout>
  );
}
