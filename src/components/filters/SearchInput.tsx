"use client";

import { Search } from "lucide-react";

type SearchInputProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
};

export function SearchInput({
  placeholder = "بحث سريع...",
  value,
  onChange,
  onFocus,
}: SearchInputProps) {
  return (
    <label className="sanad-search">
      <span className="sanad-search-icon" aria-hidden="true">
        <Search size={17} strokeWidth={2} />
      </span>
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="focus-ring"
      />
    </label>
  );
}
