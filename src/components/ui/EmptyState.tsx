type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: string;
};

export function EmptyState({ title, description, icon = "س" }: EmptyStateProps) {
  return (
    <div className="grid place-items-center px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--cream)] text-lg font-bold text-[var(--muted-2)]">
        {icon}
      </div>
      <h3 className="mt-4 text-[16px] font-semibold text-[var(--text)]">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-[14px] text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}
