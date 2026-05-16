import { SourceBadge } from "@/components/badges/SourceBadge";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { FilterChip } from "@/components/filters/FilterChip";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/tables/DataTable";
import { formatAmount } from "@/lib/formatters/amount";

const rows = [
  { id: 1, type: "دين جديد", customer: "محمد البابا", shop: "سوبرماركت الهدى", source: "voice", amount: 9820, status: "مؤكد" },
  { id: 2, type: "سداد", customer: "أحمد أبو علي", shop: "بقالة النور", source: "manual", amount: 600, status: "مؤكد" },
  { id: 3, type: "أمر صوتي", customer: "خالد", shop: "محل أبو عصام", source: "voice", amount: 50, status: "مراجعة" },
  { id: 4, type: "AI", customer: "أبو عصام", shop: "سوبرماركت الهدى", source: "ai", amount: 10000, status: "مقبول" },
];

export default function TransactionsPage() {
  return (
    <AdminLayout>
      <section className="sanad-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline-2)] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">الحركات المالية</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">بيانات ثابتة للحركات حتى تفعيل API الإدارة.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-[var(--hairline-2)] px-5 py-3">
          <FilterChip label="الكل" selected />
          <FilterChip label="دين جديد" />
          <FilterChip label="سداد" />
          <FilterChip label="AI" />
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "type", header: "نوع الحركة" },
            { key: "customer", header: "الزبون" },
            { key: "shop", header: "المحل" },
            { key: "source", header: "المصدر", render: (row) => <SourceBadge source={row.source as "manual" | "ai" | "voice"} /> },
            { key: "amount", header: "المبلغ", align: "end", render: (row) => <span className="mono-num">{formatAmount(row.amount as number)}</span> },
            { key: "status", header: "الحالة", render: (row) => <StatusBadge tone={row.status === "مراجعة" ? "warning" : "success"}>{String(row.status)}</StatusBadge> },
          ]}
        />
      </section>
    </AdminLayout>
  );
}
