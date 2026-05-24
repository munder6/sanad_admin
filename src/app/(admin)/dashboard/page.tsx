"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  Building2,
  Download,
  ReceiptText,
  RefreshCw,
  Store,
  UserRound,
  UsersRound,
} from "lucide-react";
import { SourceBadge, type SourceKind } from "@/components/badges/SourceBadge";
import { StatusBadge, type StatusTone } from "@/components/badges/StatusBadge";
import { KpiCard } from "@/components/cards/KpiCard";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  emptyOverview,
  superAdminApi,
  type SuperAdminOverview,
  type SuperAdminOverviewRange,
  type SuperAdminPlatformMonitoringItem,
  type SuperAdminRecentActivityItem,
} from "@/lib/api/superAdminApi";
import { formatArabicDateTime } from "@/lib/formatters/date";
import { formatCount, toEnglishDigits } from "@/lib/formatters/number";

const rangeOptions: { value: SuperAdminOverviewRange; label: string }[] = [
  { value: "30d", label: "30 يوم" },
  { value: "90d", label: "90 يوم" },
  { value: "1y", label: "سنة" },
];

const aiColors = ["#2d7a4f", "#d49b4c", "#b94a48", "#5b47a0", "#95a3a1", "#0f5f5c"];

type ActivityRow = SuperAdminRecentActivityItem & { id: string };

export default function DashboardPage() {
  const [overview, setOverview] = useState<SuperAdminOverview>(emptyOverview);
  const [selectedRange, setSelectedRange] = useState<SuperAdminOverviewRange>("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);

  const loadOverview = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      setOverview(await superAdminApi.overview(selectedRange));
      setLastLoadedAt(new Date());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تحميل ملخص لوحة التحكم.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadOverview(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOverview]);

  const trendPaths = useMemo(() => buildTrendPaths(overview.debt_trend), [overview.debt_trend]);
  const donutBackground = useMemo(() => buildDonutBackground(overview.ai_distribution), [overview.ai_distribution]);
  const activityRows = useMemo<ActivityRow[]>(
    () => overview.recent_activity.map((item, index) => ({ ...item, id: `${item.type}-${item.created_at ?? index}-${index}` })),
    [overview.recent_activity],
  );

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>سَنَد / النظرة العامة</p>
          <h2>لوحة التحكم العامة</h2>
          <p>{lastLoadedAt ? `آخر تحديث ${formatArabicDateTime(lastLoadedAt)}` : "بيانات تشغيلية مباشرة من المنصة"}</p>
        </div>
        <div className="sanad-page-actions">
          <button type="button" className="sanad-btn" onClick={() => loadOverview(false)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            تحديث
          </button>
          <button type="button" className="sanad-btn" onClick={() => exportOverviewCsv(overview, selectedRange)}>
            <Download size={16} />
            تصدير
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل مؤشرات لوحة التحكم..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadOverview(true)} />
      ) : (
        <>
          <div className="sanad-kpi-grid">
            <KpiCard title="إجمالي المحلات" value={formatCount(overview.kpis.shops_count)} subtitle="كل المحلات المسجلة" icon={<Store size={18} />} tone="teal" />
            <KpiCard title="إجمالي المستخدمين" value={formatCount(overview.kpis.users_count)} subtitle="حسابات المنصة" icon={<UsersRound size={18} />} tone="gold" />
            <KpiCard title="إجمالي الزبائن" value={formatCount(overview.kpis.customers_count)} subtitle="زبائن كل المحلات" icon={<UserRound size={18} />} tone="success" />
            <KpiCard title="إجمالي الحركات" value={formatCount(overview.kpis.ledger_entries_count)} subtitle="ديون وسدادات" icon={<ReceiptText size={18} />} tone="danger" />
            <KpiCard title="أوامر AI" value={formatCount(overview.kpis.ai_commands_count)} subtitle="أوامر محفوظة" icon={<Bot size={18} />} tone="ai" />
          </div>

          <div className="sanad-dashboard-grid">
            <section className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">حالة أوامر الذكاء الصناعي</h3>
                  <p className="sanad-section-subtitle">توزيع حقيقي حسب الفترة المحددة</p>
                </div>
              </div>
              <div className="relative px-[18px] pb-[18px]">
                <div className="sanad-donut" style={{ background: donutBackground }}>
                  <div className="sanad-donut-label">
                    <div className="text-[24px] font-semibold text-[var(--ink)]">{formatCount(overview.ai_distribution.reduce((sum, item) => sum + item.count, 0))}</div>
                    <div className="mt-1 text-[11px] text-[var(--muted)]">أمر ضمن الفترة</div>
                  </div>
                </div>
                {overview.ai_distribution.length === 0 ? (
                  <p className="py-4 text-center text-[13px] text-[var(--muted)]">لا توجد أوامر AI ضمن الفترة.</p>
                ) : (
                  <div className="space-y-2">
                    {overview.ai_distribution.map((item, index) => (
                      <div key={item.status} className="flex items-center justify-between gap-3 text-[12.5px]">
                        <span className="flex min-w-0 items-center gap-2 text-[var(--ink-2)]">
                          <span className="h-[9px] w-[9px] shrink-0 rounded-sm" style={{ background: aiColors[index % aiColors.length] }} />
                          <span className="truncate">{item.label}</span>
                        </span>
                        <span className="mono-num shrink-0 text-[var(--muted)]">{toEnglishDigits(item.percentage)}% · {formatCount(item.count)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="sanad-card overflow-hidden">
              <div className="sanad-card-header items-start">
                <div>
                  <h3 className="sanad-section-title">اتجاه الديون والسداد</h3>
                  <p className="sanad-section-subtitle">حجم الحركات المرحلة، وليس رصيداً تراكمياً</p>
                </div>
                <div className="sanad-range-tabs" aria-label="فترة الرسم البياني">
                  {rangeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={option.value === selectedRange ? "is-selected" : ""}
                      onClick={() => setSelectedRange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sanad-line-chart">
                {overview.debt_trend.length === 0 ? (
                  <div className="grid h-full place-items-center text-[13px] text-[var(--muted)]">لا توجد حركات مرحلة ضمن الفترة.</div>
                ) : (
                  <div className="sanad-chart-frame">
                    <svg className="sanad-chart-svg" viewBox="0 0 680 220" preserveAspectRatio="none" aria-label="اتجاه الديون والسداد">
                      {trendPaths.debtArea ? <path d={trendPaths.debtArea} fill="rgba(15,95,92,0.10)" /> : null}
                      <path d={trendPaths.debtLine} fill="none" stroke="#0F5F5C" strokeWidth="3" />
                      <path d={trendPaths.paymentLine} fill="none" stroke="#D49B4C" strokeWidth="3" />
                      {trendPaths.debtPoints.map((point) => (
                        <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="4" fill="#fff" stroke="#0F5F5C" strokeWidth="3" />
                      ))}
                    </svg>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="mt-[14px] grid gap-[14px] xl:grid-cols-[minmax(0,12fr)_minmax(320px,8fr)]">
            <section className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">نشاط حديث</h3>
                  <p className="sanad-section-subtitle">آخر أحداث فعلية من الحركات، أوامر AI، وسجلات التدقيق.</p>
                </div>
                <StatusBadge tone="info">مباشر</StatusBadge>
              </div>
              <DataTable
                rows={activityRows as unknown as Record<string, unknown>[]}
                emptyTitle="لا يوجد نشاط حديث حالياً."
                columns={[
                  { key: "label", header: "الحدث" },
                  { key: "shop_name", header: "المحل", render: (row) => String(row.shop_name ?? "-") },
                  { key: "source", header: "المصدر", render: (row) => <SourceBadge source={sourceKind(row.source)} /> },
                  { key: "amount_text", header: "المبلغ", align: "end", render: (row) => <span className="mono-num">{String(row.amount_text ?? "-")}</span> },
                  { key: "status_label", header: "الحالة", render: (row) => <StatusBadge tone={statusTone(row.status)}>{String(row.status_label ?? "-")}</StatusBadge> },
                  { key: "created_at", header: "الوقت", align: "end", render: (row) => <span className="mono-num text-[12px] text-[var(--muted)]">{row.created_at ? formatArabicDateTime(String(row.created_at)) : "-"}</span> },
                ]}
              />
            </section>

            <section className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">متابعة المنصة</h3>
                  <p className="sanad-section-subtitle">تنبيهات تشغيلية مبنية على بيانات فعلية.</p>
                </div>
              </div>
              <MonitoringList items={overview.platform_monitoring} />
            </section>
          </div>
        </>
      )}
    </>
  );
}

function MonitoringList({ items }: { items: SuperAdminPlatformMonitoringItem[] }) {
  if (items.length === 0) {
    return <div className="px-[18px] py-8 text-center text-[13px] text-[var(--muted)]">لا توجد إشارات متابعة حالياً.</div>;
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={`${item.type}-${item.created_at ?? index}`} className="sanad-feed-item">
          <span className={`sanad-feed-dot ${monitoringTone(item.severity)}`}>
            <Building2 size={15} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] text-[var(--text)]">{item.label}</p>
            <p className="mt-0.5 line-clamp-2 text-[11.5px] text-[var(--muted)]">{item.description || "لا توجد تفاصيل إضافية."}</p>
          </div>
          <span className="mono-num whitespace-nowrap text-[11.5px] text-[var(--muted-2)]">
            {item.created_at ? formatArabicDateTime(item.created_at) : "-"}
          </span>
        </div>
      ))}
    </div>
  );
}

function buildTrendPaths(points: SuperAdminOverview["debt_trend"]) {
  const maxValue = Math.max(1, ...points.flatMap((point) => [point.debt_minor, point.payment_minor]));
  const debtPoints = points.map((point, index) => chartPoint(index, points.length, point.debt_minor, maxValue));
  const paymentPoints = points.map((point, index) => chartPoint(index, points.length, point.payment_minor, maxValue));
  const debtLine = linePath(debtPoints);
  const paymentLine = linePath(paymentPoints);
  const debtArea = debtPoints.length > 0 ? `${debtLine} L680 220 L0 220 Z` : "";

  return { debtPoints, debtLine, paymentLine, debtArea };
}

function chartPoint(index: number, count: number, value: number, maxValue: number) {
  const x = count <= 1 ? 340 : (index / (count - 1)) * 680;
  const y = 198 - (value / maxValue) * 152;
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

function linePath(points: { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
}

function buildDonutBackground(items: SuperAdminOverview["ai_distribution"]) {
  if (items.length === 0) {
    return "conic-gradient(#dfe7e4 0 100%)";
  }

  let start = 0;
  const stops = items.map((item, index) => {
    const end = start + item.percentage;
    const stop = `${aiColors[index % aiColors.length]} ${start}% ${end}%`;
    start = end;
    return stop;
  });

  if (start < 100) {
    stops.push(`#dfe7e4 ${start}% 100%`);
  }

  return `conic-gradient(${stops.join(", ")})`;
}

function sourceKind(source: unknown): SourceKind {
  return ["manual", "ai", "voice", "system", "text"].includes(String(source)) ? String(source) as SourceKind : "manual";
}

function statusTone(status: unknown): StatusTone {
  if (["posted", "confirmed", "answered"].includes(String(status))) return "success";
  if (["failed", "error", "critical"].includes(String(status))) return "danger";
  if (["needs_confirmation", "unknown", "warning"].includes(String(status))) return "warning";
  if (String(status) === "cancelled" || String(status) === "voided") return "neutral";
  return "info";
}

function monitoringTone(severity: string) {
  if (severity === "critical") return "bg-[var(--danger-soft)] text-[var(--danger-700)]";
  if (severity === "warning") return "bg-[var(--warning-soft)] text-[var(--warning-700)]";
  return "bg-[var(--info-soft)] text-[var(--info-700)]";
}

function exportOverviewCsv(overview: SuperAdminOverview, range: SuperAdminOverviewRange) {
  const rows = [
    ["القسم", "الحقل", "القيمة", "تفاصيل"],
    ["بيانات التصدير", "الفترة", rangeLabel(range), ""],
    ["بيانات التصدير", "وقت التصدير", formatArabicDateTime(new Date()), ""],
    ["KPIs", "إجمالي المحلات", overview.kpis.shops_count, ""],
    ["KPIs", "إجمالي المستخدمين", overview.kpis.users_count, ""],
    ["KPIs", "إجمالي الزبائن", overview.kpis.customers_count, ""],
    ["KPIs", "إجمالي الحركات", overview.kpis.ledger_entries_count, ""],
    ["KPIs", "أوامر AI", overview.kpis.ai_commands_count, ""],
    ...overview.recent_activity.map((item) => [
      "نشاط حديث",
      item.label,
      item.amount_text ?? "",
      [item.shop_name, item.customer_name, item.status_label, item.created_at].filter(Boolean).join(" · "),
    ]),
    ...overview.platform_monitoring.map((item) => [
      "متابعة المنصة",
      item.label,
      item.severity,
      [item.description, item.created_at].filter(Boolean).join(" · "),
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sanad-dashboard-overview-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  const text = toEnglishDigits(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function rangeLabel(range: SuperAdminOverviewRange) {
  return rangeOptions.find((option) => option.value === range)?.label ?? "30 يوم";
}
