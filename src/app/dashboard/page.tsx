"use client";

import { useCallback, useEffect, useState } from "react";
import { SourceBadge } from "@/components/badges/SourceBadge";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { KpiCard } from "@/components/cards/KpiCard";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  emptyOverview,
  superAdminApi,
  type SuperAdminOverview,
} from "@/lib/api/superAdminApi";
import { formatAmount } from "@/lib/formatters/amount";

const recentRows = [
  { id: 1, event: "دين جديد", shop: "سوبرماركت الهدى", source: "voice", amount: 9820, status: "بحاجة مراجعة" },
  { id: 2, event: "سداد", shop: "بقالة النور", source: "manual", amount: 600, status: "مكتمل" },
  { id: 3, event: "أمر AI", shop: "محل أبو عصام", source: "ai", amount: 50, status: "مقبول" },
];

export default function DashboardPage() {
  const [overview, setOverview] = useState<SuperAdminOverview>(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setOverview(await superAdminApi.overview());
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تحميل ملخص لوحة التحكم.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    await fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchOverview();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchOverview]);

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">نظرة تشغيلية مرتبطة مباشرة بواجهة Super Admin API.</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">لوحة المؤشرات الرئيسية</h2>
        </div>
        <span className="rounded-full border border-[var(--hairline)] bg-white px-4 py-2 text-xs text-[var(--muted)]">
          بيانات فعلية من /super-admin/overview
        </span>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل مؤشرات لوحة التحكم..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadOverview} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
          <KpiCard title="إجمالي المحلات" value={overview.shops_count} subtitle="محلات مسجلة في المنصة" icon="مح" tone="teal" />
          <KpiCard title="إجمالي المستخدمين" value={overview.users_count} subtitle="حسابات مرتبطة بالمحلات" icon="مس" tone="gold" />
          <KpiCard title="إجمالي الزبائن" value={overview.customers_count} subtitle="دفاتر زبائن نشطة" icon="زب" tone="success" />
          <KpiCard title="إجمالي الحركات" value={overview.ledger_entries_count} subtitle="ديون وسداد وحركات مالية" icon="₪" tone="danger" />
          <KpiCard title="أوامر AI" value={overview.ai_commands_count} subtitle="أوامر ذكاء صناعي منفذة" icon="AI" tone="ai" />
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="sanad-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--hairline-2)] px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold">نشاط حديث</h3>
              <p className="mt-1 text-xs text-[var(--muted)]">بيانات ثابتة مؤقتة حتى ربط وحدات الإدارة القادمة.</p>
            </div>
          </div>
          <DataTable
            rows={recentRows}
            columns={[
              { key: "event", header: "الحدث" },
              { key: "shop", header: "المحل" },
              { key: "source", header: "المصدر", render: (row) => <SourceBadge source={row.source as "voice" | "manual" | "ai"} /> },
              { key: "amount", header: "المبلغ", align: "end", render: (row) => <span className="mono-num">{formatAmount(row.amount as number)}</span> },
              { key: "status", header: "الحالة", render: (row) => <StatusBadge tone={row.status === "بحاجة مراجعة" ? "warning" : "success"}>{String(row.status)}</StatusBadge> },
            ]}
          />
        </section>

        <section className="sanad-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">توزيع أولي</h3>
            <span className="text-xs text-[var(--muted)]">Placeholder</span>
          </div>
          <div className="mt-5 space-y-4">
            {[
              ["محلات نشطة", "72%", "bg-[var(--primary)]"],
              ["حركات يدوية", "18%", "bg-[var(--gold)]"],
              ["أوامر AI", "10%", "bg-[var(--ai)]"],
            ].map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-xs text-[var(--muted)]">
                  <span>{label}</span>
                  <span className="mono-num">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--cream)]">
                  <div className={`h-full rounded-full ${color}`} style={{ width: value }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
