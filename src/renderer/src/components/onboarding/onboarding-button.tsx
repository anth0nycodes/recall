import type { ComponentProps } from "react";
import { Button } from "@renderer/components/ui/button";
import { cn } from "@renderer/lib/utils";

export function OnboardingButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("font-geist px-5 py-2 text-lg", className)}
      {...props}
    />
  );
}
