import { Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "./api/users";
import { ErrorScreen } from "./components/error-screen";
import { Sidebar } from "./components/sidebar";
import { Splash } from "./components/splash";

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
    <div className="flex h-screen w-screen">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-neutral-900 p-6 text-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
