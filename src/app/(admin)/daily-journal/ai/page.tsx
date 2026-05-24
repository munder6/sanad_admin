"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SearchInput } from "@/components/filters/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ApiError } from "@/lib/api/apiClient";
import {
  superAdminApi,
  type SuperAdminDailyJournalAiDraft,
  type SuperAdminPaginationMeta,
} from "@/lib/api/superAdminApi";
import {
  DateInput,
  displayCount,
  displayDateTime,
  draftStatusOptions,
  EntryTypeBadge,
  entryTypeOptions,
  intentLabel,
  intentOptions,
  JournalSourceBadge,
  JournalStatusBadge,
  NumberInput,
  SelectFilter,
} from "../_dailyJournalUi";

const perPage = 10;
const emptyMeta: SuperAdminPaginationMeta = { current_page: 1, per_page: perPage, total: 0, last_page: 1 };

export default function DailyJournalAiDraftsPage() {
  const [drafts, setDrafts] = useState<SuperAdminDailyJournalAiDraft[]>([]);
  const [meta, setMeta] = useState<SuperAdminPaginationMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [shopId, setShopId] = useState("");
  const [userId, setUserId] = useState("");
  const [intent, setIntent] = useState("all");
  const [status, setStatus] = useState("all");
  const [entryType, setEntryType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadDrafts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      const response = await superAdminApi.getDailyJournalAiDrafts({
        search: search.trim(),
        shop_id: shopId.trim(),
        user_id: userId.trim(),
        intent,
        status,
        entry_type: entryType,
        date_from: dateFrom,
        date_to: dateTo,
        page,
        per_page: perPage,
        sort: "newest",
      });
      setDrafts(response.ai_drafts);
      setMeta(response.meta);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) setForbidden(true);
      setError(caught instanceof Error ? caught.message : "تعذر تحميل مسودات AI اليومية.");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, entryType, intent, page, search, shopId, status, userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadDrafts(), 250);
    return () => window.clearTimeout(timer);
  }, [loadDrafts]);

  function resetPage(callback: () => void) {
    callback();
    setPage(1);
  }

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>اليوميات / AI</p>
          <h2>أوامر AI اليومية</h2>
          <p>مسودات وأوامر دفتر اليوميات عبر كل المحلات.</p>
        </div>
        <div className="sanad-page-actions">
          <Link href="/daily-journal" className="sanad-btn">النظرة العامة</Link>
          <Link href="/daily-journal/entries" className="sanad-btn">القيود</Link>
        </div>
      </div>

      <section className="sanad-card overflow-hidden">
        <div className="sanad-card-header flex-wrap">
          <div>
            <h3 className="sanad-section-title">سجل AI اليوميات</h3>
            <p className="sanad-section-subtitle">قراءة وتحليل بدون تأكيد أو إلغاء من لوحة المشرف.</p>
          </div>
          <div className="w-full xl:w-[360px]">
            <SearchInput placeholder="بحث بالنص، المحل، النية، أو المبلغ..." value={search} onChange={(value) => resetPage(() => setSearch(value))} />
          </div>
        </div>

        <div className="sanad-filter-bar">
          <NumberInput label="المحل" placeholder="رقم المحل" value={shopId} onChange={(value) => resetPage(() => setShopId(value))} />
          <NumberInput label="المستخدم" placeholder="رقم المستخدم" value={userId} onChange={(value) => resetPage(() => setUserId(value))} />
          <SelectFilter label="النية" value={intent} options={intentOptions} onChange={(value) => resetPage(() => setIntent(value))} />
          <SelectFilter label="الحالة" value={status} options={draftStatusOptions} onChange={(value) => resetPage(() => setStatus(value))} />
          <SelectFilter label="نوع القيد" value={entryType} options={entryTypeOptions} onChange={(value) => resetPage(() => setEntryType(value))} />
          <DateInput label="من تاريخ" value={dateFrom} onChange={(value) => resetPage(() => setDateFrom(value))} />
          <DateInput label="إلى تاريخ" value={dateTo} onChange={(value) => resetPage(() => setDateTo(value))} />
        </div>

        {loading ? (
          <div className="p-4"><LoadingState label="جاري تحميل مسودات AI اليومية..." /></div>
        ) : error ? (
          <div className="p-4"><ErrorState title={forbidden ? "وصول غير مسموح" : "تعذر تحميل المسودات"} message={error} onRetry={loadDrafts} /></div>
        ) : drafts.length === 0 ? (
          <EmptyState title="لا توجد مسودات مطابقة" description="جرّب تعديل البحث أو الفلاتر." />
        ) : (
          <>
            <div className="sanad-table-wrap">
              <table className="sanad-table">
                <thead>
                  <tr>
                    <th>النص</th>
                    <th>النية</th>
                    <th>الحالة</th>
                    <th>نوع القيد</th>
                    <th className="!text-left">المبلغ</th>
                    <th>المصدر</th>
                    <th>المحل</th>
                    <th>المستخدم</th>
                    <th>القيد المؤكد</th>
                    <th className="!text-left">التاريخ</th>
                    <th className="!text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((draft) => (
                    <tr key={draft.id}>
                      <td className="max-w-[280px]">
                        <p className="line-clamp-2 text-[13px]">{draft.raw_text || `مسودة #${draft.id}`}</p>
                        <p className="mono-num mt-0.5 text-[11.5px] text-[var(--muted)]">#{draft.id}</p>
                      </td>
                      <td>{draft.intent_label ?? intentLabel(draft.intent)}</td>
                      <td><JournalStatusBadge value={draft.status} label={draft.status_label} /></td>
                      <td><EntryTypeBadge value={draft.entry_type} label={draft.entry_type_label} /></td>
                      <td className="!text-left"><span className="mono-num">{draft.amount_text ?? "-"}</span></td>
                      <td><JournalSourceBadge value={draft.source} /></td>
                      <td>{draft.shop?.name ?? "-"}</td>
                      <td>{draft.user?.name ?? "-"}</td>
                      <td>{draft.confirmed_entry?.id ? <Link className="mono-num text-[var(--teal-700)]" href={`/daily-journal/entries/details?id=${draft.confirmed_entry.id}`}>#{draft.confirmed_entry.id}</Link> : "-"}</td>
                      <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{displayDateTime(draft.created_at)}</span></td>
                      <td className="!text-left">
                        <Link href={`/daily-journal/ai/details?id=${draft.id}`} className="sanad-btn inline-flex h-8 items-center px-3 text-[12px]">عرض التفاصيل</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-[var(--hairline-2)] px-4 py-3 text-[12.5px] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
              <span>
                صفحة <span className="mono-num">{displayCount(meta.current_page)}</span> من <span className="mono-num">{displayCount(meta.last_page)}</span> ·
                إجمالي <span className="mono-num">{displayCount(meta.total)}</span>
              </span>
              <div className="flex items-center gap-2">
                <button type="button" className="sanad-btn h-8 px-3 text-[12px]" disabled={meta.current_page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>السابق</button>
                <button type="button" className="sanad-btn h-8 px-3 text-[12px]" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((value) => Math.min(meta.last_page, value + 1))}>التالي</button>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
