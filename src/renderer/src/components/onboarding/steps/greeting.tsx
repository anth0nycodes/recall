import { usersApi } from "@renderer/api/users";
import { Splash } from "@renderer/components/splash";
import { Button } from "@renderer/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { OnboardingStepProps } from "./types";

export function Greeting({ onNext, onBack }: OnboardingStepProps) {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => usersApi.getUser(),
  });

  if (!user) return <Splash />;

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <span className="text-center text-4xl font-medium">
            Nice to meet you {user.firstName}!
          </span>
          <p className="font-geist text-muted-foreground text-center text-[20px]">
            Let&apos;s get Recall connected to your Mac.
          </p>
        </div>
      </div>
      <div className="flex w-full justify-between gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="font-geist text-muted-foreground flex items-center gap-2 px-5 py-2 text-lg"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </Button>
        <Button onClick={onNext} className="font-geist px-5 py-2 text-lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
