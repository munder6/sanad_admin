import { StatusBadge } from "@/components/badges/StatusBadge";
import { FilterChip } from "@/components/filters/FilterChip";
import { SearchInput } from "@/components/filters/SearchInput";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/tables/DataTable";
import { formatAmount } from "@/lib/formatters/amount";

const rows = [
  { id: 1, name: "سوبرماركت الهدى", owner: "محمد البابا", city: "غزة", balance: 9820, status: "نشط" },
  { id: 2, name: "بقالة النور", owner: "أحمد أبو علي", city: "رفح", balance: 600, status: "نشط" },
  { id: 3, name: "محل أبو عصام", owner: "أبو عصام", city: "خان يونس", balance: 10000, status: "مراجعة" },
];

export default function ShopsPage() {
  return (
    <AdminLayout>
      <section className="sanad-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline-2)] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">المحلات</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">جدول ثابت مؤقت حتى ربط إدارة المحلات.</p>
          </div>
          <SearchInput placeholder="بحث باسم المحل أو المالك..." />
        </div>
        <div className="flex flex-wrap gap-2 border-b border-[var(--hairline-2)] px-5 py-3">
          <FilterChip label="الكل" selected />
          <FilterChip label="نشط" />
          <FilterChip label="بحاجة مراجعة" />
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "name", header: "المحل" },
            { key: "owner", header: "المالك" },
            { key: "city", header: "المدينة" },
            { key: "balance", header: "الرصيد", align: "end", render: (row) => <span className="mono-num">{formatAmount(row.balance as number)}</span> },
            { key: "status", header: "الحالة", render: (row) => <StatusBadge tone={row.status === "نشط" ? "success" : "warning"}>{String(row.status)}</StatusBadge> },
          ]}
        />
      </section>
    </AdminLayout>
  );
}
