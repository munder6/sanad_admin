import { StatusBadge } from "@/components/badges/StatusBadge";
import { SearchInput } from "@/components/filters/SearchInput";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/tables/DataTable";

const rows = [
  { id: 1, name: "محمد البابا", phone: "0590000001", role: "مالك محل", shop: "سوبرماركت الهدى", status: "نشط" },
  { id: 2, name: "أحمد أبو علي", phone: "0590000002", role: "موظف", shop: "بقالة النور", status: "نشط" },
  { id: 3, name: "أبو عصام", phone: "0590000003", role: "مالك محل", shop: "محل أبو عصام", status: "معلق" },
];

export default function UsersPage() {
  return (
    <AdminLayout>
      <section className="sanad-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline-2)] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">المستخدمون</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">إدارة حسابات مستخدمي التطبيق في مرحلة لاحقة.</p>
          </div>
          <SearchInput placeholder="بحث باسم المستخدم أو الهاتف..." />
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "name", header: "الاسم" },
            { key: "phone", header: "الهاتف", align: "end", render: (row) => <span className="mono-num">{String(row.phone)}</span> },
            { key: "role", header: "الدور" },
            { key: "shop", header: "المحل" },
            { key: "status", header: "الحالة", render: (row) => <StatusBadge tone={row.status === "نشط" ? "success" : "danger"}>{String(row.status)}</StatusBadge> },
          ]}
        />
      </section>
    </AdminLayout>
  );
}
