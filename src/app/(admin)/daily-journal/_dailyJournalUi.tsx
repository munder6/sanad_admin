"use client";

import { StatusBadge, type StatusTone } from "@/components/badges/StatusBadge";
import { SourceBadge, type SourceKind } from "@/components/badges/SourceBadge";
import { formatArabicDate, formatArabicDateTime } from "@/lib/formatters/date";
import { formatCount, toEnglishDigits } from "@/lib/formatters/number";

export const entryTypeOptions = [
  { value: "all", label: "كل الأنواع" },
  { value: "sales", label: "مبيعات" },
  { value: "purchases", label: "مشتريات" },
  { value: "expenses", label: "مصروفات" },
  { value: "remaining_debts", label: "ديون متبقية" },
];

export const sourceOptions = [
  { value: "all", label: "كل المصادر" },
  { value: "manual", label: "يدوي" },
  { value: "voice", label: "صوتي" },
  { value: "ai", label: "AI" },
];

export const statusOptions = [
  { value: "all", label: "كل الحالات" },
  { value: "posted", label: "مرحّل" },
  { value: "voided", label: "ملغى" },
];

export const draftStatusOptions = [
  { value: "all", label: "كل الحالات" },
  { value: "needs_confirmation", label: "بانتظار التأكيد" },
  { value: "answered", label: "تمت الإجابة" },
  { value: "confirmed", label: "مؤكد" },
  { value: "cancelled", label: "ملغى" },
  { value: "needs_amount", label: "يحتاج مبلغ" },
  { value: "needs_entry_type", label: "يحتاج نوع" },
  { value: "needs_date", label: "يحتاج تاريخ" },
  { value: "unknown", label: "غير واضح" },
];

export const intentOptions = [
  { value: "all", label: "كل النوايا" },
  { value: "create_journal_entry", label: "إنشاء قيد" },
  { value: "query_journal_value", label: "استعلام قيمة" },
  { value: "journal_report", label: "تقرير يومية" },
  { value: "wrong_module", label: "دفتر الديون" },
  { value: "unknown", label: "غير معروف" },
];

export function EntryTypeBadge({ value, label }: { value?: string | null; label?: string | null }) {
  return <StatusBadge tone={entryTypeTone(value)}>{label || entryTypeLabel(value)}</StatusBadge>;
}

export function JournalStatusBadge({ value, label }: { value?: string | null; label?: string | null }) {
  return <StatusBadge tone={statusTone(value)}>{label || statusLabel(value)}</StatusBadge>;
}

export function JournalSourceBadge({ value }: { value?: string | null }) {
  return <SourceBadge source={sourceKind(value)} />;
}

export function entryTypeLabel(value?: string | null): string {
  return entryTypeOptions.find((option) => option.value === value)?.label ?? value ?? "غير محدد";
}

export function statusLabel(value?: string | null): string {
  return [...statusOptions, ...draftStatusOptions].find((option) => option.value === value)?.label ?? value ?? "غير محدد";
}

export function intentLabel(value?: string | null): string {
  return intentOptions.find((option) => option.value === value)?.label ?? value ?? "غير محدد";
}

export function sourceKind(source?: string | null): SourceKind {
  if (source === "ai" || source === "voice" || source === "system" || source === "text") return source;
  return "manual";
}

export function statusTone(value?: string | null): StatusTone {
  if (value === "posted" || value === "confirmed" || value === "answered") return "success";
  if (["needs_confirmation", "needs_amount", "needs_entry_type", "needs_date", "unknown"].includes(String(value))) return "warning";
  if (value === "voided" || value === "cancelled" || value === "wrong_module") return "danger";
  return "neutral";
}

export function entryTypeTone(value?: string | null): StatusTone {
  if (value === "sales") return "success";
  if (value === "purchases") return "gold";
  if (value === "expenses") return "danger";
  if (value === "remaining_debts") return "ai";
  return "neutral";
}

export function displayDateTime(value?: string | null): string {
  return value ? formatArabicDateTime(value) : "-";
}

export function displayDate(value?: string | null): string {
  return value ? formatArabicDate(value) : "-";
}

export function displayCount(value: number): string {
  return formatCount(value);
}

export function displayMoney(value?: string | null): string {
  return value ? toEnglishDigits(value) : "0 شيكل";
}

export function SelectFilter({
  value,
  label,
  options,
  onChange,
}: {
  value: string;
  label: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-[150px] flex-1 flex-col gap-1 text-[12px] font-semibold text-[var(--muted)] xl:flex-none">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-[10px] border border-[var(--hairline)] bg-white px-3 text-[13px] text-[var(--text)] outline-none transition focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-50)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export function DateInput({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-[150px] flex-1 flex-col gap-1 text-[12px] font-semibold text-[var(--muted)] xl:flex-none">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-[10px] border border-[var(--hairline)] bg-white px-3 text-[13px] text-[var(--text)] outline-none transition focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-50)]"
      />
    </label>
  );
}

export function NumberInput({
  value,
  label,
  placeholder,
  onChange,
}: {
  value: string;
  label: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-[120px] flex-1 flex-col gap-1 text-[12px] font-semibold text-[var(--muted)] xl:flex-none">
      {label}
      <input
        type="number"
        min="1"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-[10px] border border-[var(--hairline)] bg-white px-3 text-[13px] text-[var(--text)] outline-none transition focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-50)]"
      />
    </label>
  );
}
