const arabicIndicDigits = /[\u0660-\u0669]/g;
const easternArabicDigits = /[\u06f0-\u06f9]/g;

export function toEnglishDigits(value: unknown): string {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(arabicIndicDigits, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(easternArabicDigits, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

export function formatCount(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0";

  const numericValue = typeof value === "string" ? Number(toEnglishDigits(value).replace(/,/g, "")) : value;

  if (Number.isNaN(numericValue)) {
    return toEnglishDigits(value);
  }

  return new Intl.NumberFormat("en-US").format(numericValue);
}

export function formatPhone(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "-";
  return toEnglishDigits(value);
}

export function formatAmount(value: number | string | null | undefined, currency = "شيكل"): string {
  if (value === null || value === undefined || value === "") return `0 ${currency}`;

  const normalized = toEnglishDigits(value);
  const numericValue = Number(normalized.replace(/,/g, ""));

  if (Number.isNaN(numericValue)) {
    return normalized;
  }

  return `${new Intl.NumberFormat("en-US").format(numericValue)} ${currency}`;
}

export function normalizeDigitsDeep<T>(value: T): T {
  if (typeof value === "string") {
    return toEnglishDigits(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeDigitsDeep(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeDigitsDeep(item)]),
    ) as T;
  }

  return value;
}
