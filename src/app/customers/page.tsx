import { StatusBadge } from "@/components/badges/StatusBadge";
import { SearchInput } from "@/components/filters/SearchInput";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/tables/DataTable";
import { formatAmount } from "@/lib/formatters/amount";

const rows = [
  { id: 1, name: "محمد البابا", shop: "سوبرماركت الهدى", ledger: 9820, lastActivity: "دين جديد", status: "مدين" },
  { id: 2, name: "أحمد أبو علي", shop: "بقالة النور", ledger: 600, lastActivity: "سداد", status: "متوازن" },
  { id: 3, name: "خالد", shop: "محل أبو عصام", ledger: 50, lastActivity: "أمر صوتي", status: "مدين" },
  { id: 4, name: "أبو عصام", shop: "سوبرماركت الهدى", ledger: 10000, lastActivity: "يدوي", status: "مراجعة" },
];

export default function CustomersPage() {
  return (
    <AdminLayout>
      <section className="sanad-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline-2)] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">الزبائن</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">دفاتر زبائن ثابتة كنموذج لشكل البيانات.</p>
          </div>
          <SearchInput placeholder="بحث باسم الزبون أو المحل..." />
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "name", header: "الزبون" },
            { key: "shop", header: "المحل" },
            { key: "ledger", header: "الرصيد", align: "end", render: (row) => <span className="mono-num">{formatAmount(row.ledger as number)}</span> },
            { key: "lastActivity", header: "آخر حركة" },
            { key: "status", header: "الحالة", render: (row) => <StatusBadge tone={row.status === "متوازن" ? "success" : row.status === "مراجعة" ? "warning" : "danger"}>{String(row.status)}</StatusBadge> },
          ]}
        />
      </section>
    </AdminLayout>
  );
}
