import { usersApi } from "@renderer/api/users";
import { Splash } from "@renderer/components/splash";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { OnboardingButton } from "../onboarding-button";
import { StepLayout } from "../step-layout";
import { OnboardingStepProps } from "./types";

export function Greeting({ onNext, onBack }: OnboardingStepProps) {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => usersApi.getUser(),
  });

  if (!user) return <Splash />;

  return (
    <StepLayout
      title={`Nice to meet you ${user.firstName}!`}
      description="Let's get Recall connected to your Mac."
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
