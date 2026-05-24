import { toEnglishDigits } from "@/lib/formatters/number";

export function formatArabicDate(value: string | Date): string {
  return toEnglishDigits(new Intl.DateTimeFormat("ar-PS-u-nu-latn", {
    year: "numeric",
    month: "short",
    day: "numeric",
    numberingSystem: "latn",
  }).format(new Date(value)));
}

export function formatArabicDateTime(value: string | Date): string {
  return toEnglishDigits(new Intl.DateTimeFormat("ar-PS-u-nu-latn", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    numberingSystem: "latn",
  }).format(new Date(value)));
}
