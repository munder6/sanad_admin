"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "إلغاء",
  tone = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmClasses =
    tone === "danger"
      ? "border-[var(--danger)] bg-[var(--danger)] text-white hover:bg-[var(--danger-700)]"
      : "sanad-btn-primary";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,42,40,0.36)] px-4 py-6" role="presentation">
      <div
        aria-modal="true"
        className="sanad-card w-full max-w-[440px] overflow-hidden"
        role="dialog"
      >
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h3 className="text-[20px] font-bold text-[var(--text)]">{title}</h3>
          <p className="mt-2 text-[14.5px] leading-7 text-[var(--text-2)]">{body}</p>
        </div>
        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            className="sanad-btn justify-center"
            disabled={loading}
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`sanad-btn justify-center ${confirmClasses}`}
            disabled={loading}
            type="button"
            onClick={onConfirm}
          >
            {loading ? "جاري الحفظ..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
