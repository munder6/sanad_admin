type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "جاري التحميل..." }: LoadingStateProps) {
  return (
    <div className="sanad-card flex items-center gap-3 px-5 py-4 text-sm text-[var(--muted)]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--hairline)] border-t-[var(--primary)]" />
      <span>{label}</span>
    </div>
  );
}
