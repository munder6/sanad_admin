import { toEnglishDigits } from "@/lib/formatters/number";

export type StatusTone = "success" | "warning" | "danger" | "neutral" | "info" | "ai" | "teal" | "gold";

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: StatusTone;
};

const toneClasses: Record<StatusTone, string> = {
  success: "bg-[var(--success-soft)] text-[var(--success-700)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning-700)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger-700)]",
  neutral: "bg-[var(--cream)] text-[var(--muted)] border-[var(--hairline)]",
  info: "bg-[var(--info-soft)] text-[var(--info-700)]",
  ai: "bg-[var(--ai-soft)] text-[var(--ai-700)]",
  teal: "bg-[var(--teal-50)] text-[var(--teal-700)]",
  gold: "bg-[var(--gold-50)] text-[var(--gold-700)]",
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  const displayChildren =
    typeof children === "string" || typeof children === "number" ? toEnglishDigits(children) : children;

  return (
    <span className={`sanad-badge ${toneClasses[tone]}`}>
      <span className="sanad-badge-dot" />
      {displayChildren}
    </span>
  );
}
