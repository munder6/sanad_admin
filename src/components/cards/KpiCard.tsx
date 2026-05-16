type KpiCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon?: string;
  tone?: "teal" | "gold" | "success" | "danger" | "ai";
};

const iconClasses: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  teal: "bg-[var(--primary-soft)] text-[var(--primary)]",
  gold: "bg-[var(--gold-soft)] text-[var(--gold)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  ai: "bg-[var(--ai-soft)] text-[var(--ai)]",
};

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon = "س",
  tone = "teal",
}: KpiCardProps) {
  return (
    <article className="sanad-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[var(--muted)]">{title}</p>
          <div className="mono-num mt-3 text-3xl font-semibold text-[var(--text)]">{value}</div>
        </div>
        <div className={`grid h-9 w-9 place-items-center rounded-[10px] text-xs font-bold ${iconClasses[tone]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span className="text-[var(--muted-2)]">{subtitle}</span>
        {trend ? (
          <span className="rounded-full bg-[var(--success-soft)] px-2 py-1 font-medium text-[var(--success)]">
            {trend}
          </span>
        ) : null}
      </div>
    </article>
  );
}
