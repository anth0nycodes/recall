import "./assets/main.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ErrorScreen } from "./components/error-screen";

// Local-app defaults: data lives in our own SQLite over IPC, so it only changes
// when we mutate it — never "goes stale" on its own like a remote API. Lean on
// explicit invalidation instead of time/focus-based refetching.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        fallbackRender={({ resetErrorBoundary }) => (
          <ErrorScreen
            description="Recall hit an unexpected error. Try again — if it keeps happening, restart the app."
            onRetry={resetErrorBoundary}
          />
        )}
        onError={(error, info) =>
          console.error("[ErrorBoundary]", error, info.componentStack)
        }
        onReset={() => queryClient.resetQueries()}
      >
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>
);
