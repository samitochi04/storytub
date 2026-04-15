import Modal from "./Modal";
import { Button } from "@/components/ui";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  variant = "danger",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-[13px] text-[var(--color-text-secondary)] leading-[1.5]">
        {message}
      </p>
      <div className="flex justify-end gap-[var(--space-2)] mt-[var(--space-4)]">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          disabled={loading}
          className={
            variant === "danger"
              ? "bg-[var(--color-error)] hover:bg-[var(--color-error)]/90"
              : ""
          }
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
