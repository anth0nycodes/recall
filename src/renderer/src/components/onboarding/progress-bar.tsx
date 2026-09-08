interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const fillAmount = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <div className="absolute top-10 left-1/2 flex w-full max-w-lg -translate-x-1/2 flex-col gap-1">
      <span className="text-muted-foreground text-sm font-semibold uppercase">
        Step {currentStep} / {totalSteps}
      </span>
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        className="bg-accent relative h-4.5 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-primary-gradient absolute inset-y-0 left-0 rounded-full transition-all duration-200"
          style={{ width: `${fillAmount}%` }}
        />
      </div>
    </div>
  );
}
