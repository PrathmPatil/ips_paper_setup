import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard?: () => void;
  title?: string;
  message?: string;
  saveLabel?: string;
  discardLabel?: string;
  showDiscard?: boolean;
  width?: string; // e.g., "400px"
}

export function ConfirmDialog({
  open,
  onClose,
  onSave,
  onDiscard,
  title = "Unsaved Changes",
  message = "You have unsaved changes. Do you want to save before leaving?",
  saveLabel = "Save",
  discardLabel = "Discard",
  showDiscard = true,
  width = "400px",
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`w-[${width}]`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="my-4">{message}</p>
        <DialogFooter className="flex justify-end gap-2">
          {showDiscard && onDiscard && (
            <Button variant="outline" onClick={onDiscard}>
              {discardLabel}
            </Button>
          )}
          <Button onClick={onSave}>{saveLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
