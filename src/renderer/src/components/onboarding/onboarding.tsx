import type { ComponentType } from "react";
import { usersApi } from "@renderer/api/users";
import { getErrorMessage } from "@renderer/utils/helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Splash } from "../splash";
import { ProgressBar } from "./progress-bar";
import { Greeting } from "./steps/greeting";
import { Privacy } from "./steps/privacy";
import { OnboardingStepProps } from "./steps/types";
import { UserInfo } from "./steps/user-info";
import { Welcome } from "./steps/welcome";

interface OnboardingStep {
  id: number;
  stepName: string;
  StepComponent: ComponentType<OnboardingStepProps>;
}

export function Onboarding() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => usersApi.getUser(),
  });

  const updateStep = useMutation({
    mutationFn: (stepName: string) => usersApi.updateOnboardingStep(stepName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      throw new Error(`Failed to update onboarding step: ${errorMessage}`);
    },
  });

  const finishOnboarding = useMutation({
    mutationFn: (stepName: string) =>
      usersApi.updateOnboardingStep(stepName, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      throw new Error(`Failed to finish onboarding: ${errorMessage}`);
    },
  });

  if (!user) return <Splash />;

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 0,
      stepName: "welcome",
      StepComponent: Welcome,
    },
    {
      id: 1,
      stepName: "privacy",
      StepComponent: Privacy,
    },
    {
      id: 2,
      stepName: "name",
      StepComponent: UserInfo,
    },
    {
      id: 3,
      stepName: "greeting",
      StepComponent: Greeting,
    },
  ];

  const currentOnboardingStep = user.onboardingStep;
  const currentStepIndex = onboardingSteps.findIndex(
    (step) => step.stepName === currentOnboardingStep
  );
  const { StepComponent } = onboardingSteps[currentStepIndex];

  function onNext() {
    const nextStep = onboardingSteps[currentStepIndex + 1];
    if (nextStep) updateStep.mutate(nextStep.stepName);
    else finishOnboarding.mutate("finished");
  }

  function onBack() {
    const previousStep = onboardingSteps[currentStepIndex - 1];
    if (previousStep) updateStep.mutate(previousStep.stepName);
  }

  return (
    <div className="p-4">
      <ProgressBar
        currentStep={currentStepIndex}
        totalSteps={onboardingSteps.length}
      />
      <StepComponent onNext={onNext} onBack={onBack} />
    </div>
  );
}
