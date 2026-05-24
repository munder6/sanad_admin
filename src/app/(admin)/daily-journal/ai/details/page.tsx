"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KpiCard } from "@/components/cards/KpiCard";
import { InfoRow as InfoItem } from "@/components/details/InfoRow";
import { JsonViewer } from "@/components/json/JsonViewer";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MissingDetailState } from "@/components/ui/MissingDetailState";
import { ApiError } from "@/lib/api/apiClient";
import { superAdminApi, type SuperAdminDailyJournalAiDraftDetail } from "@/lib/api/superAdminApi";
import { displayDate, displayDateTime, EntryTypeBadge, intentLabel, JournalSourceBadge, JournalStatusBadge } from "../../_dailyJournalUi";

export default function DailyJournalAiDraftDetailsPage() {
  return (
    <Suspense fallback={<LoadingState label="جاري فتح تفاصيل AI اليومية..." />}>
      <DailyJournalAiDraftDetailsContent />
    </Suspense>
  );
}

function DailyJournalAiDraftDetailsContent() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("id") ?? "";
  const [detail, setDetail] = useState<SuperAdminDailyJournalAiDraftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      setDetail(await superAdminApi.getDailyJournalAiDraftDetails(draftId));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) setForbidden(true);
      setError(caught instanceof Error ? caught.message : "تعذر تحميل تفاصيل مسودة AI اليومية.");
    } finally {
      setLoading(false);
    }
  }, [draftId]);

  useEffect(() => {
    if (!draftId) return;
    const timer = window.setTimeout(() => loadDetail(), 0);
    return () => window.clearTimeout(timer);
  }, [draftId, loadDetail]);

  if (!draftId) {
    return <MissingDetailState backHref="/daily-journal/ai" backLabel="العودة لمسودات AI" />;
  }

  const draft = detail?.draft;

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>اليوميات / AI / تفاصيل</p>
          <h2>تفاصيل مسودة AI اليومية</h2>
          <p>{draft ? `مسودة رقم #${draft.id}` : "عرض قراءة فقط لتحليل دفتر اليوميات"}</p>
        </div>
        <div className="sanad-page-actions">
          {draft ? <JournalStatusBadge value={draft.status} label={draft.status_label} /> : null}
          {draft ? <EntryTypeBadge value={draft.entry_type} label={draft.entry_type_label} /> : null}
          <Link href="/daily-journal/ai" className="sanad-btn">العودة لمسودات AI</Link>
        </div>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل تفاصيل مسودة AI اليومية..." />
      ) : error ? (
        <ErrorState title={forbidden ? "وصول غير مسموح" : "تعذر تحميل التفاصيل"} message={error} onRetry={loadDetail} />
      ) : detail && draft ? (
        <div className="space-y-[14px]">
          <div className="sanad-kpi-grid">
            <KpiCard title="النية" value={draft.intent_label ?? intentLabel(draft.intent)} subtitle={draft.intent ?? undefined} icon="AI" tone="ai" />
            <KpiCard title="الحالة" value={draft.status_label ?? "-"} subtitle="قراءة فقط" icon="◎" tone={draft.status === "confirmed" ? "success" : "teal"} />
            <KpiCard title="نوع القيد" value={draft.entry_type_label ?? "-"} subtitle={draft.entry_type ?? undefined} icon="≡" tone="gold" />
            <KpiCard title="المبلغ" value={draft.amount_text ?? "-"} subtitle={draft.currency ?? "ILS"} icon="₪" tone="teal" />
            <KpiCard title="التاريخ" value={displayDate(draft.entry_date || draft.created_at)} subtitle="تاريخ القيد أو الإنشاء" icon="◷" tone="success" />
          </div>

          <section className="grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">النص والحقول المستخرجة</h3>
                  <p className="sanad-section-subtitle">الأمر الخام والنتيجة المقروءة من AI.</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="rounded-[14px] border border-[var(--hairline-2)] bg-[var(--paper)] p-4">
                  <p className="text-[17px] font-semibold leading-8 text-[var(--text)]">{draft.raw_text || "لا يوجد نص محفوظ."}</p>
                </div>
                {draft.assistant_reply ? (
                  <div className="rounded-[14px] border border-[var(--ai-soft)] bg-[var(--ai-soft)] p-4 text-[14px] leading-7 text-[var(--ai-700)]">
                    {draft.assistant_reply}
                  </div>
                ) : null}
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoItem label="UUID" value={draft.uuid} mono />
                  <InfoItem label="المصدر" value={<JournalSourceBadge value={draft.source} />} />
                  <InfoItem label="تاريخ القيد" value={displayDate(draft.entry_date)} mono />
                  <InfoItem label="الفترة" value={draft.period_type_label ?? draft.period_type} />
                  <InfoItem label="بداية الفترة" value={displayDate(draft.period_start)} mono />
                  <InfoItem label="نهاية الفترة" value={displayDate(draft.period_end)} mono />
                  <InfoItem label="نوع الإجابة" value={draft.answer_type} />
                  <InfoItem label="تاريخ الإنشاء" value={displayDateTime(draft.created_at)} mono />
                  <InfoItem label="آخر تحديث" value={displayDateTime(draft.updated_at)} mono />
                  <InfoItem label="تاريخ التأكيد" value={displayDateTime(draft.confirmed_at)} mono />
                  <InfoItem label="تاريخ الإلغاء" value={displayDateTime(draft.cancelled_at)} mono />
                </div>
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
                  <InfoItem label="المستخدم" value={detail.user?.name} />
                  <InfoItem label="هاتف المستخدم" value={detail.user?.phone} mono />
                </div>
              </div>

              <div className="sanad-card overflow-hidden">
                <div className="sanad-card-header">
                  <h3 className="sanad-section-title">القيد المؤكد</h3>
                </div>
                {detail.confirmed_entry ? (
                  <div className="space-y-3 p-4">
                    <InfoItem label="رقم القيد" value={`#${detail.confirmed_entry.id}`} mono />
                    <InfoItem label="نوع القيد" value={detail.confirmed_entry.entry_type_label} />
                    <InfoItem label="المبلغ" value={detail.confirmed_entry.amount_text} mono />
                    <InfoItem label="الحالة" value={detail.confirmed_entry.status_label} />
                    <Link href={`/daily-journal/entries/details?id=${detail.confirmed_entry.id}`} className="sanad-btn inline-flex h-9 px-4 text-[12.5px]">
                      فتح القيد
                    </Link>
                  </div>
                ) : (
                  <div className="p-5 text-[13px] text-[var(--muted)]">لم يتم تأكيد هذه المسودة إلى قيد يومية.</div>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-[14px] xl:grid-cols-2">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <h3 className="sanad-section-title">Parsed JSON</h3>
              </div>
              <div className="p-4">
                <JsonViewer data={detail.parsed_json} />
              </div>
            </div>
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <h3 className="sanad-section-title">Answer JSON</h3>
              </div>
              <div className="p-4">
                <JsonViewer data={detail.answer_json} />
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
