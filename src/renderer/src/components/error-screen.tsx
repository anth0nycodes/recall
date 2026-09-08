import { Button } from "@renderer/components/ui/button";

interface Props {
  onRetry?: () => void;
  description?: string;
}

// Shown when loading the user fails (get-user threw). With retry:false a single
// failure would otherwise leave a blank window, so surface it and offer a retry.
// Also reused as the default fallback for ErrorBoundary, which passes its own
// copy since the cause there isn't the profile fetch.
export function ErrorScreen({ onRetry, description }: Props) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground font-geist max-w-sm">
        {description ??
          "Recall couldn't load your profile. This is usually temporary."}
      </p>
      {onRetry && (
        <Button className="font-geist px-4 py-2" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
