import type { ReactNode } from "react";
import { OnboardingHeader } from "./onboarding-header";

interface StepLayoutProps {
  title: string;
  description: string;
  /**
   * Optional content between the header and the actions — a form, a bullet
   * list, a waiting-for-permission hint. When present it sits in a tighter
   * group with the header, so the header reads as its label rather than as a
   * separate block.
   */
  children?: ReactNode;
  /** The action row. Shapes vary too much per step to be prop-driven. */
  footer: ReactNode;
}

export function StepLayout({
  title,
  description,
  children,
  footer,
}: StepLayoutProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {children ? (
        <div className="flex flex-col items-center gap-6">
          <OnboardingHeader title={title} description={description} />
          {children}
        </div>
      ) : (
        <OnboardingHeader title={title} description={description} />
      )}
      {footer}
    </div>
  );
}
