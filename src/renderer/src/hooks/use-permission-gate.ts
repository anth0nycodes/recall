import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PermissionStatus } from "../../../types";

const POLL_INTERVAL_MS = 1500;

interface UsePermissionGateOptions {
  queryKey: string;
  getStatus: () => Promise<PermissionStatus>;
  requestAccess: () => Promise<PermissionStatus | void>;
  onGranted: () => void;
}

export function usePermissionGate({
  queryKey,
  getStatus,
  requestAccess,
  onGranted,
}: UsePermissionGateOptions) {
  const [hasRequested, setHasRequested] = useState(false);
  const [isDeniedDialogOpen, setIsDeniedDialogOpen] = useState(false);
  const hasAdvanced = useRef(false);

  const { data: status, refetch } = useQuery({
    queryKey: [queryKey],
    queryFn: getStatus,
    refetchInterval: hasRequested ? POLL_INTERVAL_MS : false,
    refetchOnWindowFocus: hasRequested,
  });

  const isGranted = status === "granted";

  useEffect(() => {
    if (!isGranted || hasAdvanced.current) return;
    hasAdvanced.current = true;
    setIsDeniedDialogOpen(false);
    onGranted();
  }, [isGranted]);

  async function request() {
    setHasRequested(true);
    setIsDeniedDialogOpen(false);
    const result = await requestAccess();
    const { data: latest } = await refetch();
    if (latest === "granted") return;
    if (result === "denied") setIsDeniedDialogOpen(true);
  }

  async function verify() {
    setHasRequested(true);
    const { data: latest } = await refetch();
    if (latest !== "granted") setIsDeniedDialogOpen(true);
  }

  return {
    status,
    isGranted,
    isWaiting: hasRequested && !isGranted,
    isDeniedDialogOpen,
    setIsDeniedDialogOpen,
    request,
    verify,
  };
}
