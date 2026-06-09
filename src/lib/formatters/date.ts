type DateInput = string | Date | null | undefined;

export function formatAdminDate(value: DateInput): string {
  const date = parseDate(value);
  if (!date) return "—";

  return `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`;
}

export function formatAdminDateTime(value: DateInput): string {
  const date = parseDate(value);
  if (!date) return "—";

  const hours = date.getHours();
  const displayHour = hours % 12 || 12;
  const meridiem = hours >= 12 ? "PM" : "AM";

  return `${formatAdminDate(date)} ${pad2(displayHour)}:${pad2(date.getMinutes())} ${meridiem}`;
}

export function formatArabicDate(value: DateInput): string {
  return formatAdminDate(value);
}

export function formatArabicDateTime(value: DateInput): string {
  return formatAdminDateTime(value);
}

function parseDate(value: DateInput): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(trimmed);

  return Number.isNaN(date.getTime()) ? null : date;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
