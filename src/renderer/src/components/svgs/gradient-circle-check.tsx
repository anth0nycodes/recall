import { useId, type SVGProps } from "react";

export function GradientCircleCheck(props: SVGProps<SVGSVGElement>) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 24 24"
      fill={`url(#${gradientId})`}
      stroke="none"
      className="size-6 shrink-0"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary-gradient-from)" />
          <stop offset="50%" stopColor="var(--primary-gradient-via)" />
          <stop offset="100%" stopColor="var(--primary-gradient-to)" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" />
      <path
        d="m9 12 2 2 4-4"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
