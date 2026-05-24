export type SourceKind = "manual" | "ai" | "voice" | "system" | "text";

type SourceBadgeProps = {
  source: SourceKind;
};

const labels: Record<SourceKind, string> = {
  manual: "يدوي",
  ai: "AI",
  voice: "صوتي",
  system: "النظام",
  text: "مكتوب",
};

const classes: Record<SourceKind, string> = {
  manual: "bg-[var(--cream)] text-[var(--muted)] border-[var(--hairline)]",
  ai: "bg-[var(--ai-soft)] text-[var(--ai-700)]",
  voice: "bg-[#EFE9F8] text-[#5B47A0]",
  system: "bg-[var(--info-soft)] text-[var(--info-700)]",
  text: "bg-[var(--teal-50)] text-[var(--teal-700)]",
};

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <span className={`sanad-source ${classes[source] ?? classes.manual}`}>
      {labels[source] ?? labels.manual}
    </span>
  );
}
