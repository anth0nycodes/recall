interface OnboardingHeaderProps {
  title: string;
  description: string;
}

export function OnboardingHeader({
  title,
  description,
}: OnboardingHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-center text-4xl font-medium">{title}</span>
      <p className="font-geist text-muted-foreground text-center text-[20px]">
        {description}
      </p>
    </div>
  );
}
