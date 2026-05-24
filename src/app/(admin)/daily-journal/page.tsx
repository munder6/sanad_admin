"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, ChartNoAxesCombined, NotebookTabs, ReceiptText, RefreshCw, Store } from "lucide-react";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { KpiCard } from "@/components/cards/KpiCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  emptyDailyJournalOverview,
  superAdminApi,
  type DailyJournalRange,
  type SuperAdminDailyJournalOverview,
} from "@/lib/api/superAdminApi";
import { displayCount, displayDate, displayDateTime, displayMoney, EntryTypeBadge, JournalSourceBadge, JournalStatusBadge } from "./_dailyJournalUi";

const ranges: { value: DailyJournalRange; label: string }[] = [
  { value: "30d", label: "30 يوم" },
  { value: "90d", label: "90 يوم" },
  { value: "1y", label: "سنة" },
];

const colors = ["#0f5f5c", "#c8985a", "#b94a48", "#6e5ba8", "#3b79b6"];

export default function DailyJournalOverviewPage() {
  const [overview, setOverview] = useState<SuperAdminDailyJournalOverview>(emptyDailyJournalOverview);
  const [range, setRange] = useState<DailyJournalRange>("30d");
  const [shopId, setShopId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      else setRefreshing(true);
      setError(null);
      setOverview(await superAdminApi.getDailyJournalOverview({ range, shopId: shopId.trim() }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تحميل دفتر اليوميات.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range, shopId]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadOverview(true), 250);
    return () => window.clearTimeout(timer);
  }, [loadOverview]);

  const maxTrend = useMemo(
    () => Math.max(1, ...overview.trend.flatMap((point) => [point.sales_minor, point.purchases_minor, point.expenses_minor])),
    [overview.trend],
  );

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>العمليات / دفتر اليوميات</p>
          <h2>اليوميات</h2>
          <p>دفتر اليوميات للمحلات، المبيعات، المصروفات، والتقارير.</p>
        </div>
        <div className="sanad-page-actions">
          <Link href="/daily-journal/entries" className="sanad-btn">القيود</Link>
          <Link href="/daily-journal/reports" className="sanad-btn">التقارير</Link>
          <Link href="/daily-journal/ai" className="sanad-btn">AI اليوميات</Link>
          <button type="button" className="sanad-btn" onClick={() => loadOverview(false)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </div>

      <section className="sanad-card mb-[14px] overflow-hidden">
        <div className="sanad-filter-bar">
          <div className="sanad-range-tabs" aria-label="فترة دفتر اليوميات">
            {ranges.map((option) => (
              <button
                key={option.value}
                type="button"
                className={range === option.value ? "is-selected" : ""}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            placeholder="رقم المحل اختياري"
            value={shopId}
            onChange={(event) => setShopId(event.target.value)}
            className="h-10 w-full rounded-[10px] border border-[var(--hairline)] bg-white px-3 text-[13px] text-[var(--text)] outline-none transition focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-50)] sm:w-[180px]"
          />
        </div>
      </section>

      {loading ? (
        <LoadingState label="جاري تحميل مؤشرات دفتر اليوميات..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadOverview(true)} />
      ) : (
        <div className="space-y-[14px]">
          <div className="sanad-kpi-grid">
            <KpiCard title="إجمالي القيود" value={displayCount(overview.kpis.entries_count)} subtitle="ضمن الفترة" icon={<NotebookTabs size={18} />} tone="teal" />
            <KpiCard title="المحلات النشطة" value={displayCount(overview.kpis.active_shops_count)} subtitle="لها قيود يومية" icon={<Store size={18} />} tone="gold" />
            <KpiCard title="أوامر AI اليومية" value={displayCount(overview.kpis.ai_drafts_count)} subtitle="مسودات وأوامر" icon={<Bot size={18} />} tone="ai" />
            <KpiCard title="القيود المرحّلة" value={displayCount(overview.kpis.posted_entries_count)} subtitle="تدخل في التقارير" icon={<ReceiptText size={18} />} tone="success" />
            <KpiCard title="القيود الملغاة" value={displayCount(overview.kpis.voided_entries_count)} subtitle="للمراقبة فقط" icon={<ReceiptText size={18} />} tone="danger" />
          </div>

          <div className="sanad-kpi-grid">
            <KpiCard title="المبيعات" value={displayMoney(overview.totals.sales_text)} subtitle="قيود مرحلة فقط" icon="₪" tone="success" />
            <KpiCard title="المشتريات" value={displayMoney(overview.totals.purchases_text)} subtitle="قيود مرحلة فقط" icon="₪" tone="gold" />
            <KpiCard title="المصروفات" value={displayMoney(overview.totals.expenses_text)} subtitle="قيود مرحلة فقط" icon="₪" tone="danger" />
            <KpiCard title="ديون متبقية" value={displayMoney(overview.totals.remaining_debts_text)} subtitle="منفصلة عن الربح" icon="₪" tone="ai" />
            <KpiCard title="الربح" value={displayMoney(overview.totals.profit_text)} subtitle="المبيعات - (المشتريات + المصروفات)" icon={<ChartNoAxesCombined size={18} />} tone="teal" />
          </div>

          <div className="grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">اتجاه اليوميات</h3>
                  <p className="sanad-section-subtitle">المبيعات والمشتريات والمصروفات حسب الفترة.</p>
                </div>
              </div>
              <div className="flex h-[260px] items-end gap-2 overflow-x-auto p-4">
                {overview.trend.length === 0 ? (
                  <div className="grid h-full w-full place-items-center text-[13px] text-[var(--muted)]">لا توجد قيود ضمن الفترة.</div>
                ) : overview.trend.map((point) => (
                  <div key={point.date} className="flex min-w-[42px] flex-1 flex-col items-center justify-end gap-1">
                    <div className="flex h-[190px] w-full items-end justify-center gap-1">
                      <span className="w-2 rounded-t bg-[var(--success)]" style={{ height: `${Math.max(2, (point.sales_minor / maxTrend) * 180)}px` }} />
                      <span className="w-2 rounded-t bg-[var(--gold)]" style={{ height: `${Math.max(2, (point.purchases_minor / maxTrend) * 180)}px` }} />
                      <span className="w-2 rounded-t bg-[var(--danger)]" style={{ height: `${Math.max(2, (point.expenses_minor / maxTrend) * 180)}px` }} />
                    </div>
                    <span className="mono-num text-[10px] text-[var(--muted)]">{displayDate(point.date)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">التوزيع</h3>
                  <p className="sanad-section-subtitle">حسب نوع القيد والمصدر.</p>
                </div>
              </div>
              <Distribution title="أنواع القيود" rows={overview.entry_type_distribution} />
              <Distribution title="المصادر" rows={overview.source_distribution} />
            </section>
          </div>

          <div className="grid gap-[14px] xl:grid-cols-2">
            <section className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">آخر قيود اليوميات</h3>
                  <p className="sanad-section-subtitle">أحدث القيود عبر المحلات.</p>
                </div>
                <Link href="/daily-journal/entries" className="sanad-btn h-8 px-3 text-[12px]">فتح القائمة</Link>
              </div>
              <RecentEntries rows={overview.recent_entries} />
            </section>

            <section className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">آخر مسودات AI</h3>
                  <p className="sanad-section-subtitle">أوامر دفتر اليوميات الذكية.</p>
                </div>
                <Link href="/daily-journal/ai" className="sanad-btn h-8 px-3 text-[12px]">فتح القائمة</Link>
              </div>
              <RecentDrafts rows={overview.recent_ai_drafts} />
            </section>
          </div>

          {overview.monitoring.length > 0 ? (
            <section className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <h3 className="sanad-section-title">متابعة البيانات</h3>
              </div>
              <div className="divide-y divide-[var(--hairline-2)]">
                {overview.monitoring.map((item) => (
                  <div key={item.type} className="flex items-start justify-between gap-3 p-4">
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--text)]">{item.label}</p>
                      <p className="mt-1 text-[12px] text-[var(--muted)]">{item.description}</p>
                    </div>
                    <StatusBadge tone={item.severity === "warning" ? "warning" : "info"}>{item.severity}</StatusBadge>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </>
  );
}

function Distribution({ title, rows }: { title: string; rows: SuperAdminDailyJournalOverview["entry_type_distribution"] }) {
  return (
    <div className="border-t border-[var(--hairline-2)] p-4 first:border-t-0">
      <p className="mb-3 text-[13px] font-semibold text-[var(--text)]">{title}</p>
      {rows.length === 0 ? (
        <p className="text-[13px] text-[var(--muted)]">لا توجد بيانات.</p>
      ) : rows.map((row, index) => (
        <div key={row.value} className="mb-2 last:mb-0">
          <div className="mb-1 flex items-center justify-between gap-3 text-[12px]">
            <span className="flex items-center gap-2 text-[var(--text)]">
              <span className="h-2 w-2 rounded-sm" style={{ background: colors[index % colors.length] }} />
              {row.label}
            </span>
            <span className="mono-num text-[var(--muted)]">{displayCount(row.count)} · {row.percentage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--cream)]">
            <div className="h-full rounded-full" style={{ width: `${row.percentage}%`, background: colors[index % colors.length] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentEntries({ rows }: { rows: SuperAdminDailyJournalOverview["recent_entries"] }) {
  if (rows.length === 0) return <div className="p-6 text-center text-[13px] text-[var(--muted)]">لا توجد قيود حديثة.</div>;

  return (
    <div className="divide-y divide-[var(--hairline-2)]">
      {rows.map((entry) => (
        <Link key={entry.id} href={`/daily-journal/entries/details?id=${entry.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-[var(--cream-2)]">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[var(--text)]">{entry.shop?.name ?? "محل غير محدد"} · {entry.entry_type_label}</p>
            <p className="mt-1 truncate text-[12px] text-[var(--muted)]">{entry.note || entry.raw_text || displayDate(entry.entry_date)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <EntryTypeBadge value={entry.entry_type} label={entry.entry_type_label} />
            <span className="mono-num text-[13px] font-semibold text-[var(--text)]">{entry.amount_text}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function RecentDrafts({ rows }: { rows: SuperAdminDailyJournalOverview["recent_ai_drafts"] }) {
  if (rows.length === 0) return <div className="p-6 text-center text-[13px] text-[var(--muted)]">لا توجد مسودات AI حديثة.</div>;

  return (
    <div className="divide-y divide-[var(--hairline-2)]">
      {rows.map((draft) => (
        <Link key={draft.id} href={`/daily-journal/ai/details?id=${draft.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-[var(--cream-2)]">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[var(--text)]">{draft.raw_text || `مسودة #${draft.id}`}</p>
            <p className="mt-1 truncate text-[12px] text-[var(--muted)]">{draft.shop?.name ?? "-"} · {displayDateTime(draft.created_at)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <JournalSourceBadge value={draft.source} />
            <JournalStatusBadge value={draft.status} label={draft.status_label} />
          </div>
        </Link>
      ))}
    </div>
  );
}
