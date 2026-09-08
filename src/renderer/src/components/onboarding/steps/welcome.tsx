import { Button } from "@renderer/components/ui/button";
import { OnboardingStepProps } from "./types";

export function Welcome({ onNext }: OnboardingStepProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <span className="text-center text-4xl font-medium">
          👋 Welcome to Recall!
        </span>
        <p className="font-geist text-muted-foreground text-center text-[20px]">
          Let&apos;s get you set up.
        </p>
      </div>
      <Button onClick={onNext} className="font-geist px-5 py-2 text-lg">
        Get started
      </Button>
    </div>
  );
}
