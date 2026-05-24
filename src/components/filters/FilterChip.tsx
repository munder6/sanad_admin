type FilterChipProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export function FilterChip({ label, selected = false, onClick }: FilterChipProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`sanad-chip ${selected ? "is-selected" : ""}`}
      >
        {selected ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
        {label}
      </button>
    );
  }

  return (
    <span
      className={`sanad-chip ${selected ? "is-selected" : ""}`}
    >
      {selected ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {label}
    </span>
  );
}
