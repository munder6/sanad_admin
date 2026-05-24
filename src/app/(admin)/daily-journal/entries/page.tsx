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
  type SuperAdminDailyJournalEntry,
  type SuperAdminPaginationMeta,
} from "@/lib/api/superAdminApi";
import {
  DateInput,
  displayCount,
  displayDate,
  EntryTypeBadge,
  entryTypeOptions,
  JournalSourceBadge,
  JournalStatusBadge,
  NumberInput,
  SelectFilter,
  sourceOptions,
  statusOptions,
} from "../_dailyJournalUi";

const perPage = 10;
const emptyMeta: SuperAdminPaginationMeta = { current_page: 1, per_page: perPage, total: 0, last_page: 1 };

export default function DailyJournalEntriesPage() {
  const [entries, setEntries] = useState<SuperAdminDailyJournalEntry[]>([]);
  const [meta, setMeta] = useState<SuperAdminPaginationMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [shopId, setShopId] = useState("");
  const [userId, setUserId] = useState("");
  const [entryType, setEntryType] = useState("all");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      const response = await superAdminApi.getDailyJournalEntries({
        search: search.trim(),
        shop_id: shopId.trim(),
        user_id: userId.trim(),
        entry_type: entryType,
        source,
        status,
        date_from: dateFrom,
        date_to: dateTo,
        page,
        per_page: perPage,
        sort: "newest",
      });
      setEntries(response.entries);
      setMeta(response.meta);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) setForbidden(true);
      setError(caught instanceof Error ? caught.message : "تعذر تحميل قيود اليوميات.");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, entryType, page, search, shopId, source, status, userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadEntries(), 250);
    return () => window.clearTimeout(timer);
  }, [loadEntries]);

  function resetPage(callback: () => void) {
    callback();
    setPage(1);
  }

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>اليوميات / القيود</p>
          <h2>قيود دفتر اليوميات</h2>
          <p>قراءة كل قيود اليوميات عبر المحلات بدون إجراءات تعديل.</p>
        </div>
        <div className="sanad-page-actions">
          <Link href="/daily-journal" className="sanad-btn">النظرة العامة</Link>
          <Link href="/daily-journal/reports" className="sanad-btn">التقارير</Link>
        </div>
      </div>

      <section className="sanad-card overflow-hidden">
        <div className="sanad-card-header flex-wrap">
          <div>
            <h3 className="sanad-section-title">سجل القيود</h3>
            <p className="sanad-section-subtitle">بحث وفلاتر حسب المحل، المستخدم، النوع، المصدر، والحالة.</p>
          </div>
          <div className="w-full xl:w-[360px]">
            <SearchInput
              placeholder="بحث بالنص، الملاحظة، المحل، أو المبلغ..."
              value={search}
              onChange={(value) => resetPage(() => setSearch(value))}
            />
          </div>
        </div>

        <div className="sanad-filter-bar">
          <NumberInput label="المحل" placeholder="رقم المحل" value={shopId} onChange={(value) => resetPage(() => setShopId(value))} />
          <NumberInput label="المستخدم" placeholder="رقم المستخدم" value={userId} onChange={(value) => resetPage(() => setUserId(value))} />
          <SelectFilter label="النوع" value={entryType} options={entryTypeOptions} onChange={(value) => resetPage(() => setEntryType(value))} />
          <SelectFilter label="المصدر" value={source} options={sourceOptions} onChange={(value) => resetPage(() => setSource(value))} />
          <SelectFilter label="الحالة" value={status} options={statusOptions} onChange={(value) => resetPage(() => setStatus(value))} />
          <DateInput label="من تاريخ" value={dateFrom} onChange={(value) => resetPage(() => setDateFrom(value))} />
          <DateInput label="إلى تاريخ" value={dateTo} onChange={(value) => resetPage(() => setDateTo(value))} />
        </div>

        {loading ? (
          <div className="p-4"><LoadingState label="جاري تحميل قيود اليوميات..." /></div>
        ) : error ? (
          <div className="p-4">
            <ErrorState title={forbidden ? "وصول غير مسموح" : "تعذر تحميل القيود"} message={error} onRetry={loadEntries} />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState title="لا توجد قيود مطابقة" description="جرّب تعديل البحث أو الفلاتر." />
        ) : (
          <>
            <div className="sanad-table-wrap">
              <table className="sanad-table">
                <thead>
                  <tr>
                    <th>رقم القيد</th>
                    <th>المحل</th>
                    <th>المستخدم</th>
                    <th>النوع</th>
                    <th className="!text-left">المبلغ</th>
                    <th>التاريخ</th>
                    <th>المصدر</th>
                    <th>الحالة</th>
                    <th>النص</th>
                    <th className="!text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <p className="mono-num font-medium text-[var(--text)]">#{entry.id}</p>
                        <p className="mono-num mt-0.5 max-w-[118px] truncate text-[11.5px] text-[var(--muted)]">{entry.uuid ?? "-"}</p>
                      </td>
                      <td>{entry.shop?.name ?? "-"}</td>
                      <td>{entry.user?.name ?? "-"}</td>
                      <td><EntryTypeBadge value={entry.entry_type} label={entry.entry_type_label} /></td>
                      <td className="!text-left"><span className="mono-num">{entry.amount_text ?? "-"}</span></td>
                      <td><span className="mono-num">{displayDate(entry.entry_date)}</span></td>
                      <td><JournalSourceBadge value={entry.source} /></td>
                      <td><JournalStatusBadge value={entry.status} label={entry.status_label} /></td>
                      <td className="max-w-[240px] truncate">{entry.note || entry.raw_text || "-"}</td>
                      <td className="!text-left">
                        <Link href={`/daily-journal/entries/details?id=${entry.id}`} className="sanad-btn inline-flex h-8 items-center px-3 text-[12px]">
                          عرض التفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={meta} setPage={setPage} />
          </>
        )}
      </section>
    </>
  );
}

function Pagination({ meta, setPage }: { meta: SuperAdminPaginationMeta; setPage: (updater: (value: number) => number) => void }) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--hairline-2)] px-4 py-3 text-[12.5px] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
      <span>
        صفحة <span className="mono-num">{displayCount(meta.current_page)}</span> من <span className="mono-num">{displayCount(meta.last_page)}</span> ·
        إجمالي <span className="mono-num">{displayCount(meta.total)}</span>
      </span>
      <div className="flex items-center gap-2">
        <button type="button" className="sanad-btn h-8 px-3 text-[12px]" disabled={meta.current_page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
          السابق
        </button>
        <button type="button" className="sanad-btn h-8 px-3 text-[12px]" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((value) => Math.min(meta.last_page, value + 1))}>
          التالي
        </button>
      </div>
    </div>
  );
}
