type DetailDrawerProps = {
  open?: boolean;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function DetailDrawer({
  open = false,
  title = "تفاصيل السجل",
  subtitle = "جاهز للاستخدام في المراحل القادمة",
  children,
}: DetailDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-[rgba(16,45,43,0.36)] backdrop-blur-sm">
      <aside className="flex h-full w-[760px] max-w-[92vw] flex-col bg-[var(--cream)] shadow-[-20px_0_50px_rgba(16,45,43,0.18)]">
        <header className="flex items-center justify-between border-b border-[var(--hairline)] bg-white px-6 py-4">
          <div>
            <h3 className="font-semibold text-[var(--text)]">{title}</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p>
          </div>
          <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
            قريباً
          </span>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children ?? (
            <div className="sanad-card p-5 text-sm text-[var(--muted)]">
              ستظهر هنا تفاصيل المحل أو المستخدم أو الحركة المالية عند ربط الوحدات القادمة.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
