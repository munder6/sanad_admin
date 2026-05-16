import { SourceBadge } from "@/components/badges/SourceBadge";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/tables/DataTable";

const rows = [
  { id: 1, action: "تسجيل دخول مشرف", actor: "مشرف سَنَد", source: "system", ip: "127.0.0.1", status: "مسموح" },
  { id: 2, action: "تحديث صلاحية مستخدم", actor: "مشرف سَنَد", source: "manual", ip: "127.0.0.1", status: "مسموح" },
  { id: 3, action: "محاولة وصول غير مصرح", actor: "حساب عادي", source: "system", ip: "127.0.0.1", status: "مرفوض" },
];

export default function AuditPage() {
  return (
    <AdminLayout>
      <section className="sanad-card overflow-hidden">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h2 className="text-base font-semibold">الأمان والتدقيق</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">سجل ثابت مؤقت لتوضيح شكل أحداث التدقيق.</p>
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "action", header: "الإجراء" },
            { key: "actor", header: "المنفذ" },
            { key: "source", header: "المصدر", render: (row) => <SourceBadge source={row.source as "manual" | "system"} /> },
            { key: "ip", header: "IP", align: "end", render: (row) => <span className="mono-num">{String(row.ip)}</span> },
            { key: "status", header: "الحالة", render: (row) => <StatusBadge tone={row.status === "مسموح" ? "success" : "danger"}>{String(row.status)}</StatusBadge> },
          ]}
        />
      </section>
    </AdminLayout>
  );
}
