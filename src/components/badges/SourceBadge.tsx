export type SourceKind = "manual" | "ai" | "voice" | "system";

type SourceBadgeProps = {
  source: SourceKind;
};

const labels: Record<SourceKind, string> = {
  manual: "يدوي",
  ai: "AI",
  voice: "صوتي",
  system: "النظام",
};

const classes: Record<SourceKind, string> = {
  manual: "bg-[var(--cream)] text-[var(--muted)] ring-1 ring-[var(--hairline)]",
  ai: "bg-[var(--ai-soft)] text-[var(--ai)]",
  voice: "bg-[#EFE9F8] text-[#5B47A0]",
  system: "bg-[var(--info-soft)] text-[var(--info)]",
};

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${classes[source]}`}>
      {labels[source]}
    </span>
  );
}
