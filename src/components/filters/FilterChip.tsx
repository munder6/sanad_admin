type FilterChipProps = {
  label: string;
  selected?: boolean;
};

export function FilterChip({ label, selected = false }: FilterChipProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${
        selected
          ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
          : "border-[var(--hairline)] bg-[var(--cream-2)] text-[var(--muted)]"
      }`}
    >
      {label}
    </span>
  );
}
