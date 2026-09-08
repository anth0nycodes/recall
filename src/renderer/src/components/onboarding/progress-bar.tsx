interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2">
      Current progress: {currentStep}/{totalSteps}
    </div>
  );
}
