export function formatAmount(value: number | string, currency = "شيكل"): string {
  const numericValue = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;

  if (Number.isNaN(numericValue)) {
    return `${value} ${currency}`;
  }

  return `${new Intl.NumberFormat("ar-PS").format(numericValue)} ${currency}`;
}
