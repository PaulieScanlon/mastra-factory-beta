import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={() => {
        if (open) {
          onCancel();
        }
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onCancel();
        }
      }}
      className="m-auto max-w-sm w-full rounded-2xl border border-white/10 bg-[rgba(12,12,18,0.95)] p-6 text-white backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-white/60">{description}</p>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/5 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-4 py-2 rounded-full text-sm text-red-300 border border-red-400/30 hover:bg-red-400/10 transition"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
};
