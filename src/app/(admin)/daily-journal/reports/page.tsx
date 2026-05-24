"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChartNoAxesCombined, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { KpiCard } from "@/components/cards/KpiCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { superAdminApi, type SuperAdminDailyJournalReport } from "@/lib/api/superAdminApi";
import { DateInput, displayCount, displayDate, displayMoney, NumberInput, SelectFilter } from "../_dailyJournalUi";

const periodOptions = [
  { value: "today", label: "اليوم" },
  { value: "week", label: "هذا الأسبوع" },
  { value: "month", label: "هذا الشهر" },
];

const emptyReport: SuperAdminDailyJournalReport = {
  period: "today",
  date_from: null,
  date_to: null,
  totals: {
    sales_minor: 0,
    sales_text: "0 شيكل",
    purchases_minor: 0,
    purchases_text: "0 شيكل",
    expenses_minor: 0,
    expenses_text: "0 شيكل",
    remaining_debts_minor: 0,
    remaining_debts_text: "0 شيكل",
    profit_minor: 0,
    profit_text: "0 شيكل",
  },
  recorded_days_count: 0,
  missing_days_count: 0,
  shops_count: 0,
  formula_note: null,
  daily_breakdown: [],
  per_shop_summary: [],
};

export default function DailyJournalReportsPage() {
  const [report, setReport] = useState<SuperAdminDailyJournalReport>(emptyReport);
  const [period, setPeriod] = useState("week");
  const [shopId, setShopId] = useState("");
  const [date, setDate] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      else setRefreshing(true);
      setError(null);
      setReport(await superAdminApi.getDailyJournalReports({
        period,
        shop_id: shopId.trim(),
        date,
        date_from: dateFrom,
        date_to: dateTo,
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تحميل تقرير دفتر اليوميات.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [date, dateFrom, dateTo, period, shopId]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadReport(true), 250);
    return () => window.clearTimeout(timer);
  }, [loadReport]);

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>اليوميات / التقارير</p>
          <h2>تقارير دفتر اليوميات</h2>
          <p>تجميع المبيعات والمشتريات والمصروفات مع فصل الديون المتبقية.</p>
        </div>
        <div className="sanad-page-actions">
          <Link href="/daily-journal" className="sanad-btn">النظرة العامة</Link>
          <button type="button" className="sanad-btn" onClick={() => loadReport(false)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </div>

      <section className="sanad-card mb-[14px] overflow-hidden">
        <div className="sanad-filter-bar">
          <SelectFilter label="الفترة" value={period} options={periodOptions} onChange={setPeriod} />
          <NumberInput label="المحل" placeholder="رقم المحل اختياري" value={shopId} onChange={setShopId} />
          <DateInput label="تاريخ مرجعي" value={date} onChange={setDate} />
          <DateInput label="من تاريخ" value={dateFrom} onChange={setDateFrom} />
          <DateInput label="إلى تاريخ" value={dateTo} onChange={setDateTo} />
        </div>
      </section>

      {loading ? (
        <LoadingState label="جاري تحميل تقرير دفتر اليوميات..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadReport(true)} />
      ) : (
        <div className="space-y-[14px]">
          <div className="sanad-kpi-grid">
            <KpiCard title="المبيعات" value={displayMoney(report.totals.sales_text)} subtitle="قيود مرحلة" icon="₪" tone="success" />
            <KpiCard title="المشتريات" value={displayMoney(report.totals.purchases_text)} subtitle="قيود مرحلة" icon="₪" tone="gold" />
            <KpiCard title="المصروفات" value={displayMoney(report.totals.expenses_text)} subtitle="قيود مرحلة" icon="₪" tone="danger" />
            <KpiCard title="ديون متبقية" value={displayMoney(report.totals.remaining_debts_text)} subtitle="لا تدخل في الربح" icon="₪" tone="ai" />
            <KpiCard title="الربح" value={displayMoney(report.totals.profit_text)} subtitle="المبيعات - (المشتريات + المصروفات)" icon={<ChartNoAxesCombined size={18} />} tone="teal" />
          </div>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header flex-wrap">
              <div>
                <h3 className="sanad-section-title">ملخص التقرير</h3>
                <p className="sanad-section-subtitle">
                  من <span className="mono-num">{displayDate(report.date_from)}</span> إلى <span className="mono-num">{displayDate(report.date_to)}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="success">أيام مسجلة: {displayCount(report.recorded_days_count)}</StatusBadge>
                <StatusBadge tone={report.missing_days_count > 0 ? "warning" : "success"}>أيام ناقصة: {displayCount(report.missing_days_count)}</StatusBadge>
                <StatusBadge tone="teal">محلات: {displayCount(report.shops_count)}</StatusBadge>
              </div>
            </div>
            <div className="space-y-2 p-4 text-[13px] text-[var(--muted)]">
              <p>الربح = المبيعات - (المشتريات + المصروفات)</p>
              <p>الديون المتبقية تظهر كمؤشر مستقل ولا تدخل في حساب الربح.</p>
            </div>
          </section>

          <section className="grid gap-[14px] xl:grid-cols-2">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <h3 className="sanad-section-title">ملخص حسب المحل</h3>
              </div>
              <div className="sanad-table-wrap">
                <table className="sanad-table">
                  <thead>
                    <tr>
                      <th>المحل</th>
                      <th className="!text-center">القيود</th>
                      <th className="!text-left">المبيعات</th>
                      <th className="!text-left">الربح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.per_shop_summary.length === 0 ? (
                      <tr><td colSpan={4} className="!text-center text-[var(--muted)]">لا توجد بيانات محلات ضمن الفترة.</td></tr>
                    ) : report.per_shop_summary.map((row) => (
                      <tr key={row.shop?.id ?? row.shop?.name ?? "shop"}>
                        <td>{row.shop?.name ?? "-"}</td>
                        <td className="!text-center mono-num">{displayCount(row.entries_count)}</td>
                        <td className="!text-left mono-num">{row.totals.sales_text}</td>
                        <td className="!text-left mono-num">{row.totals.profit_text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <h3 className="sanad-section-title">التفصيل اليومي</h3>
              </div>
              <div className="sanad-table-wrap">
                <table className="sanad-table">
                  <thead>
                    <tr>
                      <th>اليوم</th>
                      <th className="!text-center">القيود</th>
                      <th className="!text-left">المبيعات</th>
                      <th className="!text-left">المصروفات</th>
                      <th className="!text-left">الربح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.daily_breakdown.length === 0 ? (
                      <tr><td colSpan={5} className="!text-center text-[var(--muted)]">لا توجد أيام ضمن التقرير.</td></tr>
                    ) : report.daily_breakdown.map((day) => (
                      <tr key={day.date}>
                        <td><span className="mono-num">{displayDate(day.date)}</span></td>
                        <td className="!text-center mono-num">{displayCount(day.entries_count)}</td>
                        <td className="!text-left mono-num">{day.sales_text}</td>
                        <td className="!text-left mono-num">{day.expenses_text}</td>
                        <td className="!text-left mono-num">{day.profit_text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
