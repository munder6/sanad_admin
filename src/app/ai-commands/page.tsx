import { SourceBadge } from "@/components/badges/SourceBadge";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/tables/DataTable";

const rows = [
  { id: 1, command: "أضف دين 50 شيكل على خالد", shop: "محل أبو عصام", source: "voice", result: "تم إنشاء حركة", status: "ناجح" },
  { id: 2, command: "اعرض ديون محمد البابا", shop: "سوبرماركت الهدى", source: "ai", result: "تم عرض الدفتر", status: "ناجح" },
  { id: 3, command: "سدد 600 شيكل", shop: "بقالة النور", source: "voice", result: "بانتظار مراجعة", status: "مراجعة" },
];

export default function AiCommandsPage() {
  return (
    <AdminLayout>
      <section className="sanad-card overflow-hidden">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h2 className="text-base font-semibold">أوامر الذكاء الصناعي</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">عرض ثابت لأوامر AI والصوت قبل ربط الوحدة كاملة.</p>
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "command", header: "الأمر" },
            { key: "shop", header: "المحل" },
            { key: "source", header: "المصدر", render: (row) => <SourceBadge source={row.source as "voice" | "ai"} /> },
            { key: "result", header: "النتيجة" },
            { key: "status", header: "الحالة", render: (row) => <StatusBadge tone={row.status === "ناجح" ? "success" : "warning"}>{String(row.status)}</StatusBadge> },
          ]}
        />
      </section>
    </AdminLayout>
  );
}
