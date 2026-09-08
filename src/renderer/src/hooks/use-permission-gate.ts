import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PermissionStatus } from "../../../types";

const POLL_INTERVAL_MS = 1500;

// A failed check updates the step's copy right away, but the dialog waits for a
// second one: the first is usually timing (the toggle isn't flipped yet), not a
// refusal worth interrupting over.
const DENIALS_BEFORE_ESCALATING = 2;

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
  const [failedChecks, setFailedChecks] = useState(0);
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

  function noteFailedCheck() {
    const attempts = failedChecks + 1;
    setFailedChecks(attempts);
    if (attempts >= DENIALS_BEFORE_ESCALATING) setIsDeniedDialogOpen(true);
  }

  async function request() {
    setHasRequested(true);
    setIsDeniedDialogOpen(false);
    await requestAccess();
    const { data: latest } = await refetch();
    // Never escalates on its own. Asking again is the user retrying, not the
    // user refusing — only verify() speaks for them.
    if (latest !== "denied") setFailedChecks(0);
  }

  async function verify() {
    setHasRequested(true);
    const { data: latest } = await refetch();
    // Anything that isn't a usable grant counts, including an undefined result:
    // refetch() can dedupe against the poll already in flight and resolve with
    // no data, and treating that as "fine" is what swallows the first click.
    const current = latest ?? status;
    if (current === "granted" || current === "needs-relaunch") {
      setFailedChecks(0);
      return;
    }
    noteFailedCheck();
  }

  return {
    status,
    isGranted,
    hasRequested,
    needsRelaunch: status === "needs-relaunch",
    isDenied: status === "denied",
    hasFailedCheck: failedChecks > 0,
    isWaiting: hasRequested && !isGranted && status !== "needs-relaunch",
    isDeniedDialogOpen,
    setIsDeniedDialogOpen,
    request,
    verify,
  };
}
