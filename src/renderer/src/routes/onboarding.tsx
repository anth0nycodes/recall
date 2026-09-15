import type { ComponentType } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { usersApi } from "@renderer/api/users";
import { getErrorMessage } from "@renderer/utils/helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProgressBar } from "../components/onboarding/progress-bar";
import { AllSet } from "../components/onboarding/steps/all-set";
import { ContactsAccess } from "../components/onboarding/steps/contacts-access";
import { FullDiskAccess } from "../components/onboarding/steps/full-disk-access";
import { Greeting } from "../components/onboarding/steps/greeting";
import { OpenrouterApiKey } from "../components/onboarding/steps/openrouter-api-key";
import { Privacy } from "../components/onboarding/steps/privacy";
import { OnboardingStepProps } from "../components/onboarding/steps/types";
import { UserInfo } from "../components/onboarding/steps/user-info";
import { Welcome } from "../components/onboarding/steps/welcome";
import { Splash } from "../components/splash";

interface OnboardingStep {
  id: number;
  stepName: string;
  StepComponent: ComponentType<OnboardingStepProps>;
}

export function Onboarding() {
  const navigate = useNavigate();
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
      console.error(`Failed to update onboarding step: ${errorMessage}`);
    },
  });

  const finishOnboarding = useMutation({
    mutationFn: (stepName: string) =>
      usersApi.updateOnboardingStep(stepName, true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/", { replace: true });
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error(`Failed to finish onboarding: ${errorMessage}`);
    },
  });

  if (!user) return <Splash />;
  if (user.hasCompletedOnboarding) return <Navigate to="/" replace />;

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
      stepName: "all-set",
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
    const lastStep = onboardingSteps[onboardingSteps.length - 1];
    if (nextStep) updateStep.mutate(nextStep.stepName);
    if (currentOnboardingStep === lastStep.stepName) {
      finishOnboarding.mutate("finished");
    }
  }

  function onBack() {
    const previousStep = onboardingSteps[currentStepIndex - 1];
    if (previousStep) updateStep.mutate(previousStep.stepName);
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="p-4">
        <ProgressBar
          currentStep={currentStepIndex}
          totalSteps={onboardingSteps.length - 1}
        />
        <StepComponent onNext={onNext} onBack={onBack} />
      </div>
    </div>
  );
}
