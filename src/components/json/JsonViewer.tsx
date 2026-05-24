"use client";

import { toEnglishDigits } from "@/lib/formatters/number";

type JsonViewerProps = {
  data: unknown;
  emptyLabel?: string;
};

export function JsonViewer({ data, emptyLabel = "لا توجد بيانات JSON" }: JsonViewerProps) {
  const text = formatJson(data);

  if (!text) {
    return (
      <div className="rounded-[14px] border border-[var(--hairline-2)] bg-[var(--paper)] px-4 py-5 text-center text-[14px] text-[var(--muted)]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <pre
      dir="ltr"
      className="max-h-[460px] overflow-auto rounded-[14px] border border-[#d8c9ad] bg-[#161f1e] p-4 text-left font-mono text-[13px] leading-6 text-[#f6f1e8] shadow-inner"
    >
      <code>{text}</code>
    </pre>
  );
}

function formatJson(data: unknown): string {
  if (data === null || data === undefined || data === "") {
    return "";
  }

  try {
    if (typeof data === "string") {
      const parsed = JSON.parse(data);
      return toEnglishDigits(JSON.stringify(parsed, null, 2));
    }

    return toEnglishDigits(JSON.stringify(data, null, 2));
  } catch {
    return toEnglishDigits(data);
  }
}
