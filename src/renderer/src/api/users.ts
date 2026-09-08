export const usersApi = {
  getUser: () => window.api.getUser(),
  updateOnboardingStep: (stepName: string, hasCompletedOnboarding?: boolean) =>
    window.api.updateOnboardingStep(stepName, hasCompletedOnboarding),
};
