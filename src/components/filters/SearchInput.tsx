"use client";

type SearchInputProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchInput({
  placeholder = "بحث سريع...",
  value,
  onChange,
}: SearchInputProps) {
  return (
    <label className="relative block min-w-56">
      <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-xs font-semibold text-[var(--muted)]">
        بحث
      </span>
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full rounded-full border border-[var(--hairline)] bg-white py-2.5 pr-14 pl-4 text-sm text-[var(--text)] shadow-sm placeholder:text-[var(--muted-2)]"
      />
    </label>
  );
}
