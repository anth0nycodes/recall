import { Button } from "@renderer/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { OnboardingStepProps } from "./types";

export function AllSet({ onNext, onBack }: OnboardingStepProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <span className="text-center text-4xl font-medium">
          You’re all set! 🎉
        </span>
        <p className="font-geist text-muted-foreground text-center text-[20px]">
          Recall is ready to help you find what you need.
        </p>
      </div>
      <div className="flex w-full justify-between gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="font-geist text-muted-foreground flex items-center gap-2 px-5 py-2 text-lg"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Back</span>
        </Button>
        <Button onClick={onNext} className="font-geist px-5 py-2 text-lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
