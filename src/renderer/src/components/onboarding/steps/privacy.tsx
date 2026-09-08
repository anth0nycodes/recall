import { GradientCircleCheck } from "@renderer/components/svgs/gradient-circle-check";
import { Button } from "@renderer/components/ui/button";
import { OnboardingStepProps } from "./types";

export function Privacy({ onNext }: OnboardingStepProps) {
  const bulletPoints = [
    "Read-only — Recall never sends, edits, or deletes messages",
    "Private AI — AI sees only what's needed to answer, nothing more",
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <span className="text-center text-4xl font-medium">
            Your messages stay on your Mac.
          </span>
          <p className="font-geist text-muted-foreground text-center text-[20px]">
            Recall is local-first, so your iMessage data stays on your device.
          </p>
        </div>
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
      </div>
      <Button onClick={onNext} className="font-geist px-5 py-2 text-lg">
        Continue
      </Button>
    </div>
  );
}
