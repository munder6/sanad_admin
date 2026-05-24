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
    <div className="sanad-card border-[var(--danger-soft)] bg-[var(--danger-soft)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-[var(--danger-700)]">{title}</h3>
          <p className="mt-1 text-[14px] text-[var(--text-2)]">{message}</p>
        </div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="focus-ring rounded-[var(--r-md)] bg-[var(--primary)] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[var(--primary-dark)]"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
