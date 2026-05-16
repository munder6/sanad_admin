type ErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "تعذر تحميل البيانات",
  message,
  actionLabel = "إعادة المحاولة",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="sanad-card border-[var(--danger-soft)] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--danger)]">{title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{message}</p>
        </div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="focus-ring rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--primary-dark)]"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
