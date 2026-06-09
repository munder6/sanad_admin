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
  return normalizeLocalPhoneDisplay(value) ?? toEnglishDigits(value);
}

export function normalizeLocalPhoneDisplay(value?: string | number | null): string | null {
  if (value === null || value === undefined) return null;

  const normalized = toEnglishDigits(value).trim();
  if (!normalized) return null;

  const digits = normalized.startsWith("+") ? normalized.slice(1) : normalized;
  if (!/^\d+$/.test(digits)) return null;

  if (/^0\d{9}$/.test(digits)) {
    return digits;
  }

  if (/^\d{9}$/.test(digits) && !digits.startsWith("0")) {
    return `0${digits}`;
  }

  if (/^(970|972)\d{9}$/.test(digits)) {
    return `0${digits.slice(3)}`;
  }

  return null;
}

export function sanitizeLocalPhoneInput(value: string): string {
  return toEnglishDigits(value).replace(/\D/g, "").slice(0, 10);
}

export function isValidLocalPhone(value: string): boolean {
  return /^0\d{9}$/.test(toEnglishDigits(value).trim());
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
