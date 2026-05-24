import { toEnglishDigits } from "@/lib/formatters/number";

type InfoRowProps = {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
  wide?: boolean;
};

export function InfoRow({ label, value, mono = false, wide = false }: InfoRowProps) {
  const displayValue =
    typeof value === "string" || typeof value === "number"
      ? toEnglishDigits(value)
      : value || "-";

  return (
    <div className={`sanad-info-row ${wide ? "md:col-span-2 xl:col-span-3" : ""}`}>
      <p className="sanad-info-label">{label}</p>
      <div className={`sanad-info-value ${mono ? "mono-num" : ""}`}>{displayValue}</div>
    </div>
  );
}
