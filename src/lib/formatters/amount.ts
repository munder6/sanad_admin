import { formatAmount as formatEnglishAmount } from "@/lib/formatters/number";

export function formatAmount(value: number | string, currency = "شيكل"): string {
  return formatEnglishAmount(value, currency);
}
