import { Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "./api/users";
import { ErrorScreen } from "./components/error-screen";
import { Sidebar } from "./components/sidebar";
import { Splash } from "./components/splash";
import { TooltipProvider } from "./components/ui/tooltip";

export function Layout() {
  const navigate = useNavigate();
  const {
    data: user,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => usersApi.getUser(),
  });

  if (isPending) return <Splash />;
  if (isError) return <ErrorScreen onRetry={() => refetch()} />;

  if (!user.hasCompletedOnboarding) {
    navigate("/onboarding");
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}
