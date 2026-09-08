import { useQuery } from "@tanstack/react-query";
import { ErrorScreen } from "./components/error-screen";
import { Home } from "./components/home";
import { Onboarding } from "./components/onboarding";
import { Splash } from "./components/splash";

function App() {
  const {
    data: user,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => window.api.getUser(),
  });

  if (isPending) return <Splash />;
  if (isError) return <ErrorScreen onRetry={() => refetch()} />;

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-6">
      {user.hasCompletedOnboarding ? <Home /> : <Onboarding />}
    </div>
  );
}

export default App;
