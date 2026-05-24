"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatusBadge, type StatusTone } from "@/components/badges/StatusBadge";
import { KpiCard } from "@/components/cards/KpiCard";
import { InfoRow as InfoItem } from "@/components/details/InfoRow";
import { JsonViewer } from "@/components/json/JsonViewer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MissingDetailState } from "@/components/ui/MissingDetailState";
import { ApiError } from "@/lib/api/apiClient";
import {
  superAdminApi,
  type SuperAdminAiCommandAttempt,
  type SuperAdminAiCommandAuditEvent,
  type SuperAdminAiCommandDetail,
  type SuperAdminAiCommandItem,
  type SuperAdminAiCommandCustomerMatch,
} from "@/lib/api/superAdminApi";
import { formatArabicDate, formatArabicDateTime } from "@/lib/formatters/date";

export default function AiCommandDetailsPage() {
  return (
    <Suspense fallback={<LoadingState label="جاري فتح تفاصيل أمر AI..." />}>
      <AiCommandDetailsContent />
    </Suspense>
  );
}

function AiCommandDetailsContent() {
  const searchParams = useSearchParams();
  const commandId = searchParams.get("id") ?? "";
  const [detail, setDetail] = useState<SuperAdminAiCommandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      setDetail(await superAdminApi.getAiCommand(commandId));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل تفاصيل أمر AI.");
    } finally {
      setLoading(false);
    }
  }, [commandId]);

  useEffect(() => {
    if (!commandId) return;

    const timer = window.setTimeout(() => {
      loadDetail();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDetail, commandId]);

  const command = detail?.command;

  if (!commandId) {
    return <MissingDetailState backHref="/ai-commands" backLabel="العودة للأوامر" />;
  }

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>العمليات / أوامر الذكاء الصناعي / تفاصيل</p>
          <h2>تفاصيل أمر AI</h2>
          <p>{command ? `أمر رقم #${command.id}` : "ملف مراقبة لأمر صوتي أو نصي"}</p>
        </div>
        <div className="sanad-page-actions">
          {command ? <StatusBadge tone={statusTone(command.status)}>{statusLabel(command.status, command.status_label)}</StatusBadge> : null}
          {command ? <StatusBadge tone={intentTone(command.intent)}>{intentLabel(command.intent, command.intent_label)}</StatusBadge> : null}
          <Link href="/ai-commands" className="sanad-btn">العودة للأوامر</Link>
        </div>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل تفاصيل أمر AI..." />
      ) : error ? (
        <ErrorState
          title={forbidden ? "وصول غير مسموح" : "تعذر تحميل التفاصيل"}
          message={error}
          onRetry={loadDetail}
        />
      ) : detail && command ? (
        <div className="space-y-[14px]">
          <div className="sanad-kpi-grid">
            <KpiCard title="النية" value={intentLabel(command.intent, command.intent_label)} subtitle="نتيجة التحليل" trend={command.intent ?? "unknown"} icon="AI" tone="ai" />
            <KpiCard title="الحالة" value={statusLabel(command.status, command.status_label)} subtitle="مرحلة الأمر" trend="قراءة فقط" icon="◎" tone={statusTone(command.status) === "danger" ? "danger" : "teal"} />
            <KpiCard title="المبلغ" value={command.amount_text ?? "-"} subtitle="المبلغ المستخرج" trend={command.currency ?? "ILS"} icon="₪" tone="gold" />
            <KpiCard title="عدد الأصناف" value={formatCount(detail.items_count)} subtitle="أصناف مستخرجة أو مؤكدة" trend="صنف" icon="▦" tone="teal" />
            <KpiCard title="المصدر" value={sourceLabel(command.source, command.source_label)} subtitle="صوت أو نص" trend={command.model ?? "AI"} icon="◌" tone={command.source === "voice" ? "ai" : "success"} />
            <KpiCard title="التاريخ" value={formatShortDate(command.created_at)} subtitle="وقت إنشاء الأمر" trend={formatLatency(command.latency_ms)} icon="◷" tone="gold" />
          </div>

          <section className="grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">الأمر الخام</h3>
                  <p className="sanad-section-subtitle">النص كما وصل من الصوت أو الإدخال النصي.</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="rounded-[16px] border border-[var(--hairline-2)] bg-[var(--paper)] p-4">
                  <p className="text-[17px] font-semibold leading-8 text-[var(--text)]">{command.raw_text ?? "-"}</p>
                </div>
                {command.normalized_text && command.normalized_text !== command.raw_text ? (
                  <InfoItem label="النص المعياري" value={command.normalized_text} wide />
                ) : null}
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <InfoItem label="UUID" value={command.uuid} mono />
                  <InfoItem label="المصدر" value={sourceLabel(command.source, command.source_label)} />
                  <InfoItem label="الموديل" value={command.model} mono />
                  <InfoItem label="زمن الاستجابة" value={formatLatency(command.latency_ms)} mono />
                  <InfoItem label="عدد المحاولات" value={formatCount(command.attempts_count)} mono />
                  <InfoItem label="الثقة" value={formatConfidence(command.confidence)} mono />
                  <InfoItem label="تاريخ الإنشاء" value={formatDate(command.created_at)} mono />
                  <InfoItem label="آخر تحديث" value={formatDate(command.updated_at)} mono />
                </div>
              </div>
            </div>

            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">المحل والمستخدم والزبون</h3>
                  <p className="sanad-section-subtitle">السياق المرتبط بالأمر.</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <InfoItem label="المحل" value={detail.shop?.name} />
                <InfoItem label="مالك المحل" value={detail.shop?.owner?.name} />
                <InfoItem label="المدينة" value={detail.shop?.city} />
                <InfoItem label="المستخدم" value={detail.user?.name} />
                <InfoItem label="هاتف المستخدم" value={detail.user?.phone} mono />
                <InfoItem label="حالة المستخدم" value={detail.user?.status} />
                <InfoItem label="الزبون المحدد" value={detail.customer?.name ?? command.customer_name} />
                <InfoItem label="هاتف الزبون" value={detail.customer?.phone} mono />
                <InfoItem label="رصيد الزبون" value={detail.customer?.balance_text} mono />
              </div>
            </div>
          </section>

          <section className="grid gap-[14px] xl:grid-cols-2">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">الأصناف المستخرجة</h3>
                  <p className="sanad-section-subtitle">كل صنف يظهر مرة واحدة من التحليل أو القيد المؤكد.</p>
                </div>
              </div>
              <ItemsList items={detail.items} />
            </div>

            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">القيد المرتبط</h3>
                  <p className="sanad-section-subtitle">يظهر عند تأكيد الأمر أو وجود ربط مباشر بالحركة.</p>
                </div>
              </div>
              <LinkedLedger detail={detail} />
            </div>
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">Parsed JSON</h3>
                <p className="sanad-section-subtitle">نسخة آمنة للقراءة، مع إخفاء مفاتيح الأسرار عند وجودها.</p>
              </div>
            </div>
            <div className="p-4">
              <JsonViewer data={detail.parsed_json} />
            </div>
          </section>

          <section className="grid gap-[14px] xl:grid-cols-2">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">محاولات AI</h3>
                  <p className="sanad-section-subtitle">ملخص آمن لطلبات واستجابات الموديل.</p>
                </div>
              </div>
              <AttemptsList attempts={detail.attempts} />
            </div>

            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">مطابقات الزبائن</h3>
                  <p className="sanad-section-subtitle">تظهر عند حفظها ضمن نتيجة التحليل.</p>
                </div>
              </div>
              <CustomerMatches rows={detail.customer_matches} />
            </div>
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">السجل والتدقيق</h3>
                <p className="sanad-section-subtitle">أحداث مرتبطة بالأمر إذا كانت متاحة.</p>
              </div>
            </div>
            <AuditEvents rows={detail.audit_events} />
          </section>
        </div>
      ) : null}
    </>
  );
}

function ItemsList({ items }: { items: SuperAdminAiCommandItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="لا توجد أصناف" description="لم يتم استخراج أصناف محفوظة لهذا الأمر." />;
  }

  return (
    <div className="divide-y divide-[var(--hairline-2)]">
      {items.map((item, index) => (
        <div key={`${item.name ?? item.raw_text ?? "item"}-${index}`} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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

function LinkedLedger({ detail }: { detail: SuperAdminAiCommandDetail }) {
  const entry = detail.linked_ledger_entry;

  if (!entry) {
    return <EmptyState title="لا يوجد قيد مرتبط" description="هذا الأمر لم يرتبط بحركة مالية مؤكدة بعد." />;
  }

  return (
    <div className="space-y-3 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoItem label="رقم القيد" value={`#${entry.id}`} mono />
        <InfoItem label="النوع" value={entry.entry_type_label ?? ledgerTypeLabel(entry.entry_type)} />
        <InfoItem label="المبلغ" value={entry.signed_amount_text ?? entry.amount_text} mono />
        <InfoItem label="الحالة" value={ledgerStatusLabel(entry.status)} />
        <InfoItem label="الأصناف" value={formatCount(entry.items_count ?? 0)} mono />
        <InfoItem label="التاريخ" value={formatDate(entry.created_at)} mono />
      </div>
      <Link href={`/transactions/details?id=${entry.id}`} className="sanad-btn inline-flex h-9 items-center px-4 text-[12.5px]">
        فتح الحركة المالية
      </Link>
    </div>
  );
}

function AttemptsList({ attempts }: { attempts: SuperAdminAiCommandAttempt[] }) {
  if (attempts.length === 0) {
    return <EmptyState title="لا توجد محاولات" description="لا توجد سجلات محاولات AI مرتبطة بهذا الأمر." />;
  }

  return (
    <div className="divide-y divide-[var(--hairline-2)]">
      {attempts.map((attempt) => (
        <div key={attempt.id} className="space-y-3 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[var(--text)]">{attempt.model ?? "Gemini"}</p>
              <p className="mono-num mt-0.5 text-[11.5px] text-[var(--muted)]">{formatDate(attempt.created_at)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={attempt.status === "failed" ? "danger" : "success"}>{attemptStatusLabel(attempt.status)}</StatusBadge>
              <StatusBadge tone="neutral">{formatLatency(attempt.latency_ms)}</StatusBadge>
            </div>
          </div>
          {attempt.error_message ? (
            <div className="rounded-[10px] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-3 py-2 text-[12.5px] text-[var(--danger-700)]">
              {attempt.error_message}
            </div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-3">
            <InfoItem label="Input tokens" value={formatNullableCount(attempt.input_tokens)} mono />
            <InfoItem label="Output tokens" value={formatNullableCount(attempt.output_tokens)} mono />
            <InfoItem label="Total tokens" value={formatNullableCount(attempt.total_tokens)} mono />
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomerMatches({ rows }: { rows: SuperAdminAiCommandCustomerMatch[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد مطابقات محفوظة" description="لم يتم حفظ قائمة مطابقات زبائن لهذا الأمر." />;
  }

  return (
    <div className="sanad-table-wrap">
      <table className="sanad-table">
        <thead>
          <tr>
            <th>الزبون</th>
            <th>الهاتف</th>
            <th>النوع</th>
            <th className="!text-left">النتيجة</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index}>
              <td>{row.name ?? "-"}</td>
              <td><span className="mono-num">{row.phone ?? "-"}</span></td>
              <td>{matchTypeLabel(row.match_type)}</td>
              <td className="!text-left"><span className="mono-num">{row.score ?? "-"}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditEvents({ rows }: { rows: SuperAdminAiCommandAuditEvent[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد أحداث تدقيق" description="لا توجد أحداث تدقيق إضافية محفوظة لهذا الأمر." />;
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

function intentLabel(intent?: string | null, label?: string | null): string {
  if (label) return label;

  const labels: Record<string, string> = {
    create_debt: "دين جديد",
    record_payment: "سداد",
    query_balance: "استعلام رصيد",
    show_customer_transactions: "سجل الزبون",
    create_customer: "إنشاء زبون",
    unknown: "غير مفهوم",
  };

  return intent ? labels[intent] ?? intent : "غير محدد";
}

function statusLabel(status?: string | null, label?: string | null): string {
  if (label) return label;

  const labels: Record<string, string> = {
    answered: "تمت الإجابة",
    needs_confirmation: "بانتظار التأكيد",
    needs_customer_selection: "يحتاج اختيار زبون",
    needs_customer_creation: "يحتاج إنشاء زبون",
    needs_amount: "يحتاج مبلغ",
    needs_customer: "يحتاج زبون",
    unknown: "غير مفهوم",
    confirmed: "مؤكد",
    cancelled: "ملغي",
    failed: "فشل",
    parsed: "تم التحليل",
  };

  return status ? labels[status] ?? status : "غير محدد";
}

function sourceLabel(source?: string | null, label?: string | null): string {
  if (label) return label;
  if (source === "voice") return "صوتي";
  if (source === "text") return "مكتوب";
  if (source === "ai") return "AI";
  if (source === "manual") return "يدوي";
  if (source === "system") return "النظام";
  return "غير محدد";
}

function intentTone(intent?: string | null): StatusTone {
  if (intent === "record_payment") return "success";
  if (intent === "create_debt") return "gold";
  if (intent === "unknown") return "warning";
  return "ai";
}

function statusTone(status?: string | null): StatusTone {
  if (status === "confirmed" || status === "answered") return "success";
  if (status === "needs_confirmation" || status === "needs_customer_selection" || status === "needs_amount") return "warning";
  if (status === "failed" || status === "unknown" || status === "error") return "danger";
  if (status === "cancelled") return "neutral";
  return "teal";
}

function ledgerTypeLabel(type?: string | null): string {
  if (type === "debt") return "دين";
  if (type === "payment") return "سداد";
  return "غير محدد";
}

function ledgerStatusLabel(status?: string | null): string {
  if (status === "posted") return "مرحّلة";
  if (status === "voided") return "ملغاة";
  return status ?? "غير محدد";
}

function attemptStatusLabel(status?: string | null): string {
  if (status === "failed") return "فشلت";
  if (status === "completed") return "اكتملت";
  return status ?? "غير محدد";
}

function matchTypeLabel(type?: string | null): string {
  const labels: Record<string, string> = {
    exact_name: "اسم مطابق",
    exact_alias: "اسم بديل مطابق",
    phone: "هاتف",
    starts_with_name: "بداية الاسم",
    contains_name: "ضمن الاسم",
  };

  return type ? labels[type] ?? type : "-";
}

function eventLabel(event?: string | null): string {
  const labels: Record<string, string> = {
    "ai.parse": "تحليل AI",
    created: "إنشاء",
    updated: "تحديث",
    confirmed: "تأكيد",
    cancelled: "إلغاء",
  };

  return event ? labels[event] ?? event : "-";
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDateTime(value);
}

function formatShortDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDate(value);
}

function formatLatency(value?: number | null): string {
  if (value === null || value === undefined) return "-";
  return `${formatCount(value)} ms`;
}

function formatConfidence(value?: number | null): string {
  if (value === null || value === undefined) return "-";
  return `${Math.round(value * 100)}%`;
}

function formatNullableCount(value?: number | null): string {
  if (value === null || value === undefined) return "-";
  return formatCount(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
