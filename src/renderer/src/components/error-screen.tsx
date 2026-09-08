import { Button } from "@renderer/components/ui/button";

// Shown when loading the user fails (get-user threw). With retry:false a single
// failure would otherwise leave a blank window, so surface it and offer a retry.
export function ErrorScreen({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground max-w-sm">
        Recall couldn&apos;t load your profile. This is usually temporary.
      </p>
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </div>
  );
}
