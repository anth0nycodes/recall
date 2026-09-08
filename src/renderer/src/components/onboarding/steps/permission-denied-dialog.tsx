import { Button } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";

interface PermissionDeniedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissionName: string;
  reason: string;
  actionLabel: string;
  onRetry: () => void;
}

export function PermissionDeniedDialog({
  open,
  onOpenChange,
  permissionName,
  reason,
  actionLabel,
  onRetry,
}: PermissionDeniedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-geist">
        <DialogHeader>
          <DialogTitle>Recall needs {permissionName} to continue.</DialogTitle>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Everything stays on your Mac. Recall reads your data locally, never
          uploads it, and never sends, edits, or deletes anything.
        </p>
        <DialogFooter showCloseButton>
          <Button className="px-4 py-2" onClick={onRetry}>
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
