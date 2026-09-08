// Shown while the singleton user loads (the get-user IPC round-trip). Kept calm
// and cheap on purpose: the fetch is usually ~1 frame, so an animated spinner
// would flash in and out. Just the wordmark on the app background.
export function Splash() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold tracking-tight opacity-60">
        Recall
      </h1>
    </div>
  );
}
