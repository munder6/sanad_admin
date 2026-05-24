"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  type SuperAdminLinkedAiCommand,
  type SuperAdminTransactionAuditEvent,
  type SuperAdminTransactionDetail,
  type SuperAdminTransactionItem,
} from "@/lib/api/superAdminApi";
import { formatArabicDate, formatArabicDateTime } from "@/lib/formatters/date";

export default function TransactionDetailsPage() {
  return (
    <Suspense fallback={<LoadingState label="جاري فتح تفاصيل الحركة..." />}>
      <TransactionDetailsContent />
    </Suspense>
  );
}

function TransactionDetailsContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("id") ?? "";
  const [detail, setDetail] = useState<SuperAdminTransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      setDetail(await superAdminApi.getTransaction(transactionId));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل تفاصيل الحركة.");
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (!transactionId) return;

    const timer = window.setTimeout(() => {
      loadDetail();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDetail, transactionId]);

  const transaction = detail?.transaction;
  const parsedSummary = useMemo(
    () => formatParsedSummary(detail?.linked_ai_command?.parsed_json_summary ?? {}),
    [detail?.linked_ai_command?.parsed_json_summary],
  );

  if (!transactionId) {
    return <MissingDetailState backHref="/transactions" backLabel="العودة للحركات" />;
  }

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>العمليات / الحركات المالية / تفاصيل</p>
          <h2>تفاصيل الحركة</h2>
          <p>{transaction ? `حركة رقم #${transaction.id}` : "ملف حركة مالية عبر منصة سند"}</p>
        </div>
        <div className="sanad-page-actions">
          {transaction ? <StatusBadge tone={entryTypeTone(transaction.entry_type)}>{entryTypeLabel(transaction.entry_type, transaction.entry_type_label)}</StatusBadge> : null}
          {transaction ? <StatusBadge tone={statusTone(transaction.status)}>{statusLabel(transaction.status, transaction.status_label)}</StatusBadge> : null}
          <Link href="/transactions" className="sanad-btn">العودة للحركات</Link>
        </div>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل تفاصيل الحركة..." />
      ) : error ? (
        <ErrorState
          title={forbidden ? "وصول غير مسموح" : "تعذر تحميل التفاصيل"}
          message={error}
          onRetry={loadDetail}
        />
      ) : detail && transaction ? (
        <div className="space-y-[14px]">
          <div className="sanad-kpi-grid">
            <KpiCard title="المبلغ" value={transaction.signed_amount_text ?? transaction.amount_text ?? "-"} subtitle="قيمة القيد" trend={transaction.currency ?? "ILS"} icon="₪" tone={transaction.entry_type === "payment" ? "success" : "gold"} />
            <KpiCard title="النوع" value={entryTypeLabel(transaction.entry_type, transaction.entry_type_label)} subtitle={transaction.direction ?? "غير محدد"} trend="قراءة فقط" icon={transaction.entry_type === "payment" ? "-" : "+"} tone={transaction.entry_type === "payment" ? "success" : "danger"} />
            <KpiCard title="المصدر" value={sourceLabel(transaction.source, transaction.source_label)} subtitle="مصدر إنشاء القيد" trend="مصدر" icon="◎" tone={transaction.source === "ai" ? "ai" : "teal"} />
            <KpiCard title="عدد الأصناف" value={formatCount(detail.items_count)} subtitle="عناصر مرتبطة بالحركة" trend="صنف" icon="▦" tone="teal" />
            <KpiCard title="التاريخ" value={formatShortDate(transaction.created_at)} subtitle="وقت إنشاء الحركة" trend={statusLabel(transaction.status, transaction.status_label)} icon="◷" tone={transaction.status === "voided" ? "warning" : "gold"} />
          </div>

          <section className="grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">بيانات الحركة</h3>
                  <p className="sanad-section-subtitle">الحقول الأساسية كما هي محفوظة في دفتر القيود.</p>
                </div>
              </div>
              <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="UUID" value={transaction.uuid} mono />
                <InfoItem label="الحالة" value={statusLabel(transaction.status, transaction.status_label)} />
                <InfoItem label="المصدر" value={sourceLabel(transaction.source, transaction.source_label)} />
                <InfoItem label="النص الخام" value={transaction.raw_text} wide />
                <InfoItem label="الملاحظة" value={transaction.note} wide />
                <InfoItem label="أُنشئت بواسطة" value={detail.created_by?.name} />
                <InfoItem label="هاتف المنشئ" value={detail.created_by?.phone} mono />
                <InfoItem label="تاريخ الإنشاء" value={formatDate(transaction.created_at)} mono />
                <InfoItem label="آخر تحديث" value={formatDate(transaction.updated_at)} mono />
                <InfoItem label="تاريخ الترحيل" value={formatDate(transaction.posted_at)} mono />
                <InfoItem label="تاريخ الإلغاء" value={formatDate(transaction.voided_at)} mono />
                <InfoItem label="سبب الإلغاء" value={transaction.void_reason} wide />
              </div>
            </div>

            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">المحل والزبون</h3>
                  <p className="sanad-section-subtitle">السياق التشغيلي للحركة.</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <InfoItem label="المحل" value={detail.shop?.name} />
                <InfoItem label="مالك المحل" value={detail.shop?.owner?.name} />
                <InfoItem label="المدينة" value={detail.shop?.city} />
                <InfoItem label="نوع النشاط" value={detail.shop?.business_type} />
                <InfoItem label="الزبون" value={detail.customer?.name} />
                <InfoItem label="هاتف الزبون" value={detail.customer?.phone} mono />
                <InfoItem label="رصيد الزبون" value={detail.customer?.balance_text} mono />
                <InfoItem label="حالة الرصيد" value={detail.customer?.balance_status_label} />
              </div>
            </div>
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">الأصناف</h3>
                <p className="sanad-section-subtitle">كل صنف يظهر مرة واحدة حسب ترتيب القيد.</p>
              </div>
            </div>
            <ItemsList items={detail.items} />
          </section>

          <section className="grid gap-[14px] xl:grid-cols-2">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">أمر AI المرتبط</h3>
                  <p className="sanad-section-subtitle">يظهر عند وجود ربط موثوق بالقيد أو أمر مؤكد.</p>
                </div>
              </div>
              <LinkedAiCommandCard command={detail.linked_ai_command} parsedSummary={parsedSummary} />
            </div>

            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">السجل والتدقيق</h3>
                  <p className="sanad-section-subtitle">أحداث القيد والإلغاء المتاحة للقراءة.</p>
                </div>
              </div>
              <AuditEvents rows={detail.audit_events} />
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function ItemsList({ items }: { items: SuperAdminTransactionItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="لا توجد أصناف" description="هذه الحركة لا تحتوي على تفاصيل أصناف." />;
  }

  return (
    <div className="divide-y divide-[var(--hairline-2)]">
      {items.map((item, index) => (
        <div key={item.id ?? `${item.raw_text}-${index}`} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[var(--text)]">{item.name ?? item.raw_text ?? "صنف بدون اسم"}</p>
            <p className="mt-1 text-[12px] text-[var(--muted)]">
              {[item.quantity_text, item.unit_text, item.raw_text && item.raw_text !== item.name ? item.raw_text : null].filter(Boolean).join(" · ") || "-"}
            </p>
          </div>
          <span className="mono-num text-[13px] font-semibold text-[var(--text)]">{item.amount_text ?? "-"}</span>
        </div>
      ))}
    </div>
  );
}

function LinkedAiCommandCard({
  command,
  parsedSummary,
}: {
  command: SuperAdminLinkedAiCommand | null;
  parsedSummary: string;
}) {
  if (!command) {
    return <EmptyState title="لا يوجد أمر AI مرتبط" description="لا يوجد ربط موثوق بين هذه الحركة وأمر AI محفوظ." />;
  }

  return (
    <div className="space-y-3 p-4">
      <InfoItem label="النص الخام" value={command.raw_text} wide />
      <InfoItem label="النص المعياري" value={command.normalized_text} wide />
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoItem label="النية" value={intentLabel(command.intent)} />
        <InfoItem label="الحالة" value={aiStatusLabel(command.status)} />
        <InfoItem label="اسم الزبون" value={command.customer_name} />
        <InfoItem label="المبلغ" value={command.amount_text} mono />
        <InfoItem label="عدد الأصناف" value={formatCount(command.items_count)} mono />
        <InfoItem label="تاريخ الأمر" value={formatDate(command.created_at)} mono />
      </div>
      <InfoItem label="ملخص التحليل" value={parsedSummary} wide />
    </div>
  );
}

function AuditEvents({ rows }: { rows: SuperAdminTransactionAuditEvent[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد أحداث تدقيق" description="لا توجد أحداث إلغاء أو سجل إضافي متاح لهذه الحركة." />;
  }

  return (
    <div className="sanad-table-wrap">
      <table className="sanad-table">
        <thead>
          <tr>
            <th>الحدث</th>
            <th>المستخدم</th>
            <th className="!text-left">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index}>
              <td>{eventLabel(row.event_type)}</td>
              <td>{row.user?.name ?? "-"}</td>
              <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(row.created_at)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function entryTypeLabel(type?: string | null, label?: string | null): string {
  if (label) return label;
  if (type === "debt") return "دين";
  if (type === "payment") return "سداد";
  return "غير محدد";
}

function statusLabel(status?: string | null, label?: string | null): string {
  if (label) return label;
  if (status === "posted") return "مرحّلة";
  if (status === "voided") return "ملغاة";
  return "غير محدد";
}

function sourceLabel(source?: string | null, label?: string | null): string {
  if (label) return label;
  if (source === "ai") return "AI";
  if (source === "voice") return "صوتي";
  if (source === "system") return "النظام";
  if (source === "manual") return "يدوي";
  return "غير محدد";
}

function entryTypeTone(type?: string | null): StatusTone {
  if (type === "payment") return "success";
  if (type === "debt") return "gold";
  return "neutral";
}

function statusTone(status?: string | null): StatusTone {
  if (status === "posted") return "success";
  if (status === "voided") return "danger";
  return "neutral";
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

function aiStatusLabel(status?: string | null): string {
  const labels: Record<string, string> = {
    parsed: "مقروء",
    confirmed: "مؤكد",
    cancelled: "ملغي",
    answered: "تمت الإجابة",
    failed: "فشل",
  };

  return status ? labels[status] ?? status : "-";
}

function eventLabel(event?: string | null): string {
  const labels: Record<string, string> = {
    created: "إنشاء",
    voided: "إلغاء",
    updated: "تحديث",
  };

  return event ? labels[event] ?? event : "-";
}

function formatParsedSummary(summary: Record<string, unknown>): string {
  const entries = Object.entries(summary)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 8)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? `${value.length} عناصر` : String(value)}`);

  return entries.length > 0 ? entries.join("، ") : "-";
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
