"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KpiCard } from "@/components/cards/KpiCard";
import { InfoRow as InfoItem } from "@/components/details/InfoRow";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MissingDetailState } from "@/components/ui/MissingDetailState";
import { ApiError } from "@/lib/api/apiClient";
import { superAdminApi, type SuperAdminDailyJournalEntryDetail } from "@/lib/api/superAdminApi";
import { displayDate, displayDateTime, EntryTypeBadge, JournalStatusBadge } from "../../_dailyJournalUi";

export default function DailyJournalEntryDetailsPage() {
  return (
    <Suspense fallback={<LoadingState label="جاري فتح تفاصيل قيد اليومية..." />}>
      <DailyJournalEntryDetailsContent />
    </Suspense>
  );
}

function DailyJournalEntryDetailsContent() {
  const searchParams = useSearchParams();
  const entryId = searchParams.get("id") ?? "";
  const [detail, setDetail] = useState<SuperAdminDailyJournalEntryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      setDetail(await superAdminApi.getDailyJournalEntryDetails(entryId));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) setForbidden(true);
      setError(caught instanceof Error ? caught.message : "تعذر تحميل تفاصيل قيد اليومية.");
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    if (!entryId) return;
    const timer = window.setTimeout(() => loadDetail(), 0);
    return () => window.clearTimeout(timer);
  }, [entryId, loadDetail]);

  if (!entryId) {
    return <MissingDetailState backHref="/daily-journal/entries" backLabel="العودة للقيود" />;
  }

  const entry = detail?.entry;

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>اليوميات / القيود / تفاصيل</p>
          <h2>تفاصيل قيد اليومية</h2>
          <p>{entry ? `قيد رقم #${entry.id}` : "عرض قراءة فقط لقيد دفتر اليوميات"}</p>
        </div>
        <div className="sanad-page-actions">
          {entry ? <EntryTypeBadge value={entry.entry_type} label={entry.entry_type_label} /> : null}
          {entry ? <JournalStatusBadge value={entry.status} label={entry.status_label} /> : null}
          <Link href="/daily-journal/entries" className="sanad-btn">العودة للقيود</Link>
        </div>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل تفاصيل قيد اليومية..." />
      ) : error ? (
        <ErrorState title={forbidden ? "وصول غير مسموح" : "تعذر تحميل التفاصيل"} message={error} onRetry={loadDetail} />
      ) : detail && entry ? (
        <div className="space-y-[14px]">
          <div className="sanad-kpi-grid">
            <KpiCard title="المبلغ" value={entry.amount_text ?? "-"} subtitle="شيكل، أرقام إنجليزية" icon="₪" tone="teal" />
            <KpiCard title="نوع القيد" value={entry.entry_type_label ?? "-"} subtitle={entry.entry_type ?? undefined} icon="≡" tone="gold" />
            <KpiCard title="الحالة" value={entry.status_label ?? "-"} subtitle="قراءة فقط" icon="◎" tone={entry.status === "voided" ? "danger" : "success"} />
            <KpiCard title="التاريخ" value={displayDate(entry.entry_date)} subtitle="تاريخ القيد" icon="◷" tone="ai" />
            <KpiCard title="المصدر" value={entry.source_label ?? "-"} subtitle={entry.source ?? undefined} icon="◌" tone="success" />
          </div>

          <section className="grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">بيانات القيد</h3>
                  <p className="sanad-section-subtitle">المعلومات الأساسية كما سجلها التطبيق.</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="rounded-[14px] border border-[var(--hairline-2)] bg-[var(--paper)] p-4">
                  <p className="text-[17px] font-semibold leading-8 text-[var(--text)]">{entry.note || entry.raw_text || "لا توجد ملاحظة محفوظة."}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoItem label="UUID" value={entry.uuid} mono />
                  <InfoItem label="رقم الطلب" value={entry.client_request_id} mono />
                  <InfoItem label="تاريخ القيد" value={displayDate(entry.entry_date)} mono />
                  <InfoItem label="تاريخ الإنشاء" value={displayDateTime(entry.created_at)} mono />
                  <InfoItem label="آخر تحديث" value={displayDateTime(entry.updated_at)} mono />
                  <InfoItem label="وقت الإلغاء" value={displayDateTime(entry.voided_at)} mono />
                  <InfoItem label="سبب الإلغاء" value={entry.void_reason} wide />
                </div>
                <InfoItem label="النص الخام" value={entry.raw_text} wide />
              </div>
            </div>

            <div className="space-y-[14px]">
              <div className="sanad-card overflow-hidden">
                <div className="sanad-card-header">
                  <h3 className="sanad-section-title">المحل والمستخدم</h3>
                </div>
                <div className="space-y-3 p-4">
                  <InfoItem label="المحل" value={detail.shop?.name} />
                  <InfoItem label="مالك المحل" value={detail.shop?.owner?.name} />
                  <InfoItem label="المدينة" value={detail.shop?.city} />
                  <InfoItem label="نوع النشاط" value={detail.shop?.business_type} />
                  <InfoItem label="المستخدم" value={detail.user?.name} />
                  <InfoItem label="هاتف المستخدم" value={detail.user?.phone} mono />
                </div>
              </div>

              <div className="sanad-card overflow-hidden">
                <div className="sanad-card-header">
                  <h3 className="sanad-section-title">مسودة AI المرتبطة</h3>
                </div>
                {detail.related_ai_draft ? (
                  <div className="space-y-3 p-4">
                    <InfoItem label="رقم المسودة" value={`#${detail.related_ai_draft.id}`} mono />
                    <InfoItem label="الحالة" value={detail.related_ai_draft.status_label} />
                    <InfoItem label="النية" value={detail.related_ai_draft.intent_label} />
                    <InfoItem label="النص" value={detail.related_ai_draft.raw_text} wide />
                    <Link href={`/daily-journal/ai/details?id=${detail.related_ai_draft.id}`} className="sanad-btn inline-flex h-9 px-4 text-[12.5px]">
                      فتح مسودة AI
                    </Link>
                  </div>
                ) : (
                  <div className="p-5 text-[13px] text-[var(--muted)]">لا توجد مسودة AI مرتبطة بهذا القيد.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
