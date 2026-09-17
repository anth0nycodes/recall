import { User } from "../../../../../types";

export interface OnboardingStepProps {
  onNext: () => void;
  onBack: () => void;
  user: User;
}
