import type { ComponentType } from "react";
import { usersApi } from "@renderer/api/users";
import { getErrorMessage } from "@renderer/utils/helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Splash } from "../splash";
import { ProgressBar } from "./progress-bar";
import { AllSet } from "./steps/all-set";
import { ContactsAccess } from "./steps/contacts-access";
import { FullDiskAccess } from "./steps/full-disk-access";
import { Greeting } from "./steps/greeting";
import { OpenrouterApiKey } from "./steps/openrouter-api-key";
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
    {
      id: 4,
      stepName: "full-disk-access",
      StepComponent: FullDiskAccess,
    },
    {
      id: 5,
      stepName: "contacts-access",
      StepComponent: ContactsAccess,
    },
    {
      id: 6,
      stepName: "openrouter-api-key",
      StepComponent: OpenrouterApiKey,
    },
    {
      id: 7,
      stepName: "finished",
      StepComponent: AllSet,
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
        totalSteps={onboardingSteps.length - 1}
      />
      <StepComponent onNext={onNext} onBack={onBack} />
    </div>
  );
}
