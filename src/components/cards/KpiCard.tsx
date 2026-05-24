import type { ReactNode } from "react";
import { toEnglishDigits } from "@/lib/formatters/number";

type KpiCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon?: ReactNode;
  tone?: "teal" | "gold" | "success" | "danger" | "ai" | "warning";
};

const iconClasses: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  teal: "bg-[var(--teal-50)] text-[var(--teal-700)]",
  gold: "bg-[var(--gold-50)] text-[var(--gold-700)]",
  success: "bg-[var(--success-soft)] text-[var(--success-700)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger-700)]",
  ai: "bg-[var(--ai-soft)] text-[var(--ai-700)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning-700)]",
};

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon = "س",
  tone = "teal",
}: KpiCardProps) {
  const displayValue = typeof value === "string" || typeof value === "number" ? toEnglishDigits(value) : value;
  const displaySubtitle = subtitle ? toEnglishDigits(subtitle) : undefined;
  const displayTrend = trend ? toEnglishDigits(trend) : undefined;

  return (
    <article className="sanad-card sanad-kpi">
      <div className="sanad-kpi-top">
        <p className="sanad-kpi-label">{title}</p>
        <div className={`sanad-kpi-icon ${iconClasses[tone]}`}>
          {icon}
        </div>
      </div>
      <div className="sanad-kpi-value">
        {displayValue}
      </div>
      <div className="sanad-kpi-foot">
        <span className="text-[var(--muted-2)]">{displaySubtitle}</span>
        {displayTrend ? (
          <span className="sanad-trend">
            {displayTrend}
          </span>
        ) : null}
      </div>
    </article>
  );
}
