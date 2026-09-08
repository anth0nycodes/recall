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
        className="relative h-4.5 w-full overflow-clip rounded-xl"
      >
        <div className="bg-accent size-full" />
        <div
          className="bg-primary-gradient absolute inset-0 origin-left transition-transform duration-200"
          style={{ transform: `scaleX(${fillAmount / 100})` }}
        />
      </div>
    </div>
  );
}
