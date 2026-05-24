"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SourceBadge, type SourceKind } from "@/components/badges/SourceBadge";
import { StatusBadge, type StatusTone } from "@/components/badges/StatusBadge";
import { KpiCard } from "@/components/cards/KpiCard";
import { InfoRow as InfoItem } from "@/components/details/InfoRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MissingDetailState } from "@/components/ui/MissingDetailState";
import { ApiError } from "@/lib/api/apiClient";
import {
  superAdminApi,
  type SuperAdminCustomerAiCommand,
  type SuperAdminCustomerDetail,
  type SuperAdminCustomerLedgerEntry,
} from "@/lib/api/superAdminApi";
import { formatArabicDate, formatArabicDateTime } from "@/lib/formatters/date";

export default function CustomerDetailsPage() {
  return (
    <Suspense fallback={<LoadingState label="جاري فتح تفاصيل الزبون..." />}>
      <CustomerDetailsContent />
    </Suspense>
  );
}

function CustomerDetailsContent() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("id") ?? "";
  const [detail, setDetail] = useState<SuperAdminCustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      setDetail(await superAdminApi.getCustomer(customerId));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل تفاصيل الزبون.");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;

    const timer = window.setTimeout(() => {
      loadDetail();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDetail, customerId]);

  const itemEntries = useMemo(
    () => detail?.ledger_entries.filter((entry) => entry.items.length > 0).slice(0, 5) ?? [],
    [detail],
  );

  if (!customerId) {
    return <MissingDetailState backHref="/customers" backLabel="العودة للزبائن" />;
  }

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>الإدارة / الزبائن / تفاصيل</p>
          <h2>{detail?.customer.name ?? "تفاصيل الزبون"}</h2>
          <p>{detail?.shop?.name ? `المحل: ${detail.shop.name}` : "مراقبة الرصيد والحركات المرتبطة بالزبون"}</p>
        </div>
        <div className="sanad-page-actions">
          {detail ? <StatusBadge tone={customerStatusTone(detail.customer.status)}>{statusLabel(detail.customer.status)}</StatusBadge> : null}
          {detail ? <StatusBadge tone={balanceTone(detail.balance.balance_status)}>{detail.balance.balance_status_label ?? balanceLabel(detail.balance.balance_status)}</StatusBadge> : null}
          <Link href="/customers" className="sanad-btn">العودة للزبائن</Link>
        </div>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل تفاصيل الزبون..." />
      ) : error ? (
        <ErrorState
          title={forbidden ? "وصول غير مسموح" : "تعذر تحميل التفاصيل"}
          message={error}
          onRetry={loadDetail}
        />
      ) : detail ? (
        <div className="space-y-[14px]">
          <div className="sanad-kpi-grid">
            <KpiCard title="الرصيد الحالي" value={detail.balance.balance_text ?? "0 شيكل"} subtitle={balanceLabel(detail.balance.balance_status)} trend="قراءة فقط" icon="₪" tone={detail.balance.balance_status === "has_debt" ? "danger" : "teal"} />
            <KpiCard title="عدد الحركات" value={formatCount(detail.summary.ledger_entries_count)} subtitle="قيود دفتر الزبون" trend="حركة" icon="◎" tone="gold" />
            <KpiCard title="الديون" value={detail.balance.total_debt_text ?? "0 شيكل"} subtitle={`${formatCount(detail.summary.debt_entries_count)} حركة دين`} trend="دين" icon="+" tone="danger" />
            <KpiCard title="السداد" value={detail.balance.total_payment_text ?? "0 شيكل"} subtitle={`${formatCount(detail.summary.payment_entries_count)} حركة سداد`} trend="سداد" icon="-" tone="success" />
            <KpiCard title="الأصناف" value={formatCount(detail.summary.items_count)} subtitle="عناصر مرتبطة بالحركات" trend="عنصر" icon="▦" tone="teal" />
            <KpiCard title="آخر نشاط" value={formatShortDate(detail.summary.last_activity_at)} subtitle="حركة أو أمر AI" trend="نشاط" icon="↻" tone="ai" />
          </div>

          <section className="grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">بيانات الزبون</h3>
                  <p className="sanad-section-subtitle">الملف الأساسي والأسماء البديلة كما هي مخزنة في النظام.</p>
                </div>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="الهاتف" value={detail.customer.phone} mono />
                <InfoItem label="الملاحظات" value={detail.customer.notes} />
                <InfoItem label="الحالة" value={statusLabel(detail.customer.status)} />
                <InfoItem label="الأسماء البديلة" value={aliasesText(detail.customer.aliases)} />
                <InfoItem label="تاريخ الإنشاء" value={formatDate(detail.customer.created_at)} />
                <InfoItem label="آخر تحديث" value={formatDate(detail.customer.updated_at)} />
                <InfoItem label="رقم الزبون" value={String(detail.customer.id)} mono />
              </div>
            </div>

            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">المحل</h3>
                  <p className="sanad-section-subtitle">الجهة المالكة لدفتر هذا الزبون.</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <InfoItem label="اسم المحل" value={detail.shop?.name} />
                <InfoItem label="المالك" value={detail.shop?.owner?.name} />
                <InfoItem label="هاتف المالك" value={detail.shop?.owner?.phone} mono />
                <InfoItem label="المدينة" value={detail.shop?.city} />
                <InfoItem label="نوع النشاط" value={detail.shop?.business_type} />
                <InfoItem label="حالة المحل" value={statusLabel(detail.shop?.status)} />
              </div>
            </div>
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">آخر الحركات</h3>
                <p className="sanad-section-subtitle">آخر 20 قيداً مالياً على دفتر الزبون.</p>
              </div>
            </div>
            <LedgerEntriesTable rows={detail.ledger_entries} />
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">أوامر AI المرتبطة</h3>
                <p className="sanad-section-subtitle">آخر 10 أوامر مرتبطة برقم الزبون أو اسمه داخل نفس المحل.</p>
              </div>
            </div>
            <AiCommandsTable rows={detail.ai_commands} />
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">معاينة الأصناف</h3>
                <p className="sanad-section-subtitle">أحدث الأصناف المسجلة ضمن حركات الزبون.</p>
              </div>
            </div>
            <ItemsPreview rows={itemEntries} />
          </section>
        </div>
      ) : null}
    </>
  );
}

function LedgerEntriesTable({ rows }: { rows: SuperAdminCustomerLedgerEntry[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد حركات" description="لم يتم تسجيل قيود مالية لهذا الزبون بعد." />;
  }

  return (
    <div className="sanad-table-wrap">
      <table className="sanad-table">
        <thead>
          <tr>
            <th>النوع</th>
            <th className="!text-left">المبلغ</th>
            <th>المصدر</th>
            <th>الحالة</th>
            <th>النص الخام</th>
            <th className="!text-center">الأصناف</th>
            <th className="!text-left">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><StatusBadge tone={row.entry_type === "payment" ? "success" : "gold"}>{entryTypeLabel(row.entry_type)}</StatusBadge></td>
              <td className="!text-left"><span className="mono-num">{row.signed_amount_text ?? row.amount_text ?? "-"}</span></td>
              <td><SourceBadge source={sourceKind(row.source)} /></td>
              <td><StatusBadge tone={row.status === "posted" ? "success" : "warning"}>{statusLabel(row.status)}</StatusBadge></td>
              <td className="max-w-[360px] truncate">{row.raw_text ?? row.note ?? "-"}</td>
              <td className="!text-center"><span className="mono-num">{formatCount(row.items_count)}</span></td>
              <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(row.posted_at ?? row.created_at)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AiCommandsTable({ rows }: { rows: SuperAdminCustomerAiCommand[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد أوامر AI مرتبطة" description="لم يتم العثور على أوامر مرتبطة بشكل موثوق بهذا الزبون." />;
  }

  return (
    <div className="sanad-table-wrap">
      <table className="sanad-table">
        <thead>
          <tr>
            <th>النص</th>
            <th>النية</th>
            <th>الحالة</th>
            <th className="!text-left">المبلغ</th>
            <th className="!text-center">الأصناف</th>
            <th className="!text-left">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="max-w-[420px] truncate">{row.raw_text ?? "-"}</td>
              <td>{intentLabel(row.intent)}</td>
              <td><StatusBadge tone={aiStatusTone(row.status)}>{statusLabel(row.status)}</StatusBadge></td>
              <td className="!text-left"><span className="mono-num">{row.amount_text ?? "-"}</span></td>
              <td className="!text-center"><span className="mono-num">{formatCount(row.items_count)}</span></td>
              <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(row.created_at)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ItemsPreview({ rows }: { rows: SuperAdminCustomerLedgerEntry[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد أصناف حديثة" description="ستظهر تفاصيل الأصناف عندما تحتوي الحركات الأخيرة على عناصر." />;
  }

  return (
    <div className="divide-y divide-[var(--hairline-2)]">
      {rows.map((entry) => (
        <div key={entry.id} className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusBadge tone={entry.entry_type === "payment" ? "success" : "gold"}>{entryTypeLabel(entry.entry_type)}</StatusBadge>
              <span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(entry.posted_at ?? entry.created_at)}</span>
            </div>
            <span className="mono-num text-[13px] font-semibold text-[var(--text)]">{entry.signed_amount_text ?? entry.amount_text ?? "-"}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {entry.items.map((item, index) => (
              <div key={`${entry.id}-${item.id ?? index}`} className="rounded-[8px] border border-[var(--hairline-2)] bg-[var(--cream-2)] px-3 py-2">
                <p className="text-[13px] font-medium text-[var(--text)]">{item.name ?? item.raw_text ?? "صنف بدون اسم"}</p>
                <p className="mt-1 text-[11.5px] text-[var(--muted)]">
                  {[item.quantity_text, item.unit_text, item.amount_text].filter(Boolean).join(" · ") || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function aliasesText(aliases: { alias: string | null }[]): string {
  const values = aliases.map((alias) => alias.alias).filter(Boolean);
  return values.length > 0 ? values.join("، ") : "-";
}

function statusLabel(status?: string | null): string {
  const labels: Record<string, string> = {
    active: "نشط",
    inactive: "غير نشط",
    suspended: "معلّق",
    disabled: "معطل",
    pending: "قيد المراجعة",
    posted: "منشور",
    voided: "ملغي",
    parsed: "مقروء",
    confirmed: "مؤكد",
    cancelled: "ملغي",
    answered: "تمت الإجابة",
  };

  return status ? labels[status] ?? status : "غير محدد";
}

function customerStatusTone(status?: string | null): StatusTone {
  if (status === "active") return "success";
  if (status === "pending" || status === "suspended") return "warning";
  if (status === "disabled") return "danger";
  return "neutral";
}

function balanceLabel(status?: string | null): string {
  if (status === "has_debt") return "عليه دين";
  if (status === "credit") return "له رصيد";
  if (status === "paid") return "مسدّد";
  return "غير محدد";
}

function balanceTone(status?: string | null): StatusTone {
  if (status === "has_debt") return "danger";
  if (status === "credit") return "success";
  if (status === "paid") return "teal";
  return "neutral";
}

function aiStatusTone(status?: string | null): StatusTone {
  if (status === "confirmed" || status === "answered") return "success";
  if (status === "cancelled") return "danger";
  return "ai";
}

function entryTypeLabel(type?: string | null): string {
  if (type === "debt") return "دين";
  if (type === "payment") return "سداد";
  return type ?? "-";
}

function intentLabel(intent?: string | null): string {
  const labels: Record<string, string> = {
    create_debt: "تسجيل دين",
    record_payment: "تسجيل سداد",
    query_balance: "استعلام رصيد",
    show_customer_transactions: "عرض حركات",
    create_customer: "إنشاء زبون",
    unknown: "غير معروف",
  };

  return intent ? labels[intent] ?? intent : "-";
}

function sourceKind(source?: string | null): SourceKind {
  if (source === "ai" || source === "voice" || source === "system") return source;
  return "manual";
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDateTime(value);
}

function formatShortDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDate(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
