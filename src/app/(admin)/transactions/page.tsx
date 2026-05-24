"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SourceBadge, type SourceKind } from "@/components/badges/SourceBadge";
import { StatusBadge, type StatusTone } from "@/components/badges/StatusBadge";
import { FilterChip } from "@/components/filters/FilterChip";
import { SearchInput } from "@/components/filters/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ApiError } from "@/lib/api/apiClient";
import {
  superAdminApi,
  type SuperAdminPaginationMeta,
  type SuperAdminTransaction,
  type SuperAdminTransactionsParams,
} from "@/lib/api/superAdminApi";
import { formatArabicDateTime } from "@/lib/formatters/date";

const perPage = 10;

type TransactionFilter = {
  label: string;
  params: Pick<SuperAdminTransactionsParams, "entry_type" | "status" | "has_items">;
};

const filters: TransactionFilter[] = [
  { label: "الكل", params: { status: "all", entry_type: "all" } },
  { label: "ديون", params: { entry_type: "debt", status: "all" } },
  { label: "سداد", params: { entry_type: "payment", status: "all" } },
  { label: "بها أصناف", params: { has_items: true, status: "all", entry_type: "all" } },
  { label: "ملغاة", params: { status: "voided", entry_type: "all" } },
];

const emptyMeta: SuperAdminPaginationMeta = {
  current_page: 1,
  per_page: perPage,
  total: 0,
  last_page: 1,
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<SuperAdminTransaction[]>([]);
  const [meta, setMeta] = useState<SuperAdminPaginationMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [shopId, setShopId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      const response = await superAdminApi.getTransactions({
        search: search.trim(),
        shop_id: shopId.trim(),
        customer_id: customerId.trim(),
        page,
        per_page: perPage,
        sort: "newest",
        ...filters[activeFilter].params,
      });
      setTransactions(response.transactions);
      setMeta(response.meta);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل الحركات المالية.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, customerId, page, search, shopId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadTransactions();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadTransactions]);

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>العمليات / الحركات المالية</p>
          <h2>الحركات المالية</h2>
          <p>مراقبة كل الديون والسدادات عبر منصة سند</p>
        </div>
        <StatusBadge tone="teal">قراءة فقط</StatusBadge>
      </div>

      <section className="sanad-card overflow-hidden">
        <div className="sanad-card-header flex-wrap">
          <div>
            <h3 className="sanad-section-title">سجل الحركات</h3>
            <p className="sanad-section-subtitle">بحث وفلاتر تشغيلية على كل قيود الدفتر بدون إجراءات تعديل.</p>
          </div>
          <div className="flex w-full flex-col gap-2 xl:w-auto xl:min-w-[720px] xl:flex-row">
            <SearchInput
              placeholder="بحث بالزبون أو المحل أو النص الخام..."
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
            <input
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="رقم المحل"
              value={shopId}
              onChange={(event) => {
                setShopId(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-[10px] border border-[var(--hairline)] bg-white px-3 text-[13px] text-[var(--text)] outline-none transition focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-50)] xl:w-[130px]"
            />
            <input
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="رقم الزبون"
              value={customerId}
              onChange={(event) => {
                setCustomerId(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-[10px] border border-[var(--hairline)] bg-white px-3 text-[13px] text-[var(--text)] outline-none transition focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-50)] xl:w-[130px]"
            />
          </div>
        </div>

        <div className="sanad-filter-bar">
          {filters.map((filter, index) => (
            <FilterChip
              key={filter.label}
              label={filter.label}
              selected={activeFilter === index}
              onClick={() => {
                setActiveFilter(index);
                setPage(1);
              }}
            />
          ))}
        </div>

        {loading ? (
          <div className="p-4">
            <LoadingState label="جاري تحميل الحركات المالية..." />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState
              title={forbidden ? "وصول غير مسموح" : "تعذر تحميل الحركات"}
              message={error}
              onRetry={loadTransactions}
            />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="لا توجد حركات مطابقة"
            description="جرّب تعديل البحث أو اختيار فلتر مختلف."
          />
        ) : (
          <>
            <div className="sanad-table-wrap">
              <table className="sanad-table">
                <thead>
                  <tr>
                    <th>رقم الحركة</th>
                    <th>المحل</th>
                    <th>الزبون</th>
                    <th>النوع</th>
                    <th className="!text-left">المبلغ</th>
                    <th>المصدر</th>
                    <th className="!text-center">الأصناف</th>
                    <th>الحالة</th>
                    <th className="!text-left">التاريخ</th>
                    <th className="!text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="transition hover:bg-[var(--cream-2)]"
                    >
                      <td>
                        <div>
                          <p className="mono-num font-medium text-[var(--text)]">#{transaction.id}</p>
                          <p className="mono-num mt-0.5 max-w-[118px] truncate text-[11.5px] text-[var(--muted)]">{transaction.uuid ?? "-"}</p>
                        </div>
                      </td>
                      <td>{transaction.shop?.name ?? "-"}</td>
                      <td>
                        <div>
                          <p>{transaction.customer?.name ?? "زبون غير محدد"}</p>
                          <p className="mono-num mt-0.5 text-[11.5px] text-[var(--muted)]">{transaction.customer?.phone ?? "-"}</p>
                        </div>
                      </td>
                      <td><StatusBadge tone={entryTypeTone(transaction.entry_type)}>{entryTypeLabel(transaction)}</StatusBadge></td>
                      <td className="!text-left"><span className="mono-num">{transaction.signed_amount_text ?? transaction.amount_text ?? "-"}</span></td>
                      <td><SourceBadge source={sourceKind(transaction.source)} /></td>
                      <td className="!text-center"><span className="mono-num">{formatCount(transaction.items_count)}</span></td>
                      <td><StatusBadge tone={statusTone(transaction.status)}>{statusLabel(transaction)}</StatusBadge></td>
                      <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(transaction.created_at)}</span></td>
                      <td className="!text-left">
                        <Link
                          href={`/transactions/details?id=${transaction.id}`}
                          className="sanad-btn inline-flex h-8 items-center px-3 text-[12px]"
                        >
                          عرض التفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--hairline-2)] px-4 py-3 text-[12.5px] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
              <span>
                صفحة <span className="mono-num">{formatCount(meta.current_page)}</span> من <span className="mono-num">{formatCount(meta.last_page)}</span> ·
                إجمالي <span className="mono-num">{formatCount(meta.total)}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="sanad-btn h-8 px-3 text-[12px]"
                  disabled={meta.current_page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  السابق
                </button>
                <button
                  type="button"
                  className="sanad-btn h-8 px-3 text-[12px]"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setPage((value) => Math.min(meta.last_page, value + 1))}
                >
                  التالي
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function entryTypeLabel(transaction: SuperAdminTransaction): string {
  if (transaction.entry_type_label) return transaction.entry_type_label;
  if (transaction.entry_type === "debt") return "دين";
  if (transaction.entry_type === "payment") return "سداد";
  return "غير محدد";
}

function statusLabel(transaction: SuperAdminTransaction): string {
  if (transaction.status_label) return transaction.status_label;
  if (transaction.status === "posted") return "مرحّلة";
  if (transaction.status === "voided") return "ملغاة";
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

function sourceKind(source?: string | null): SourceKind {
  if (source === "ai" || source === "voice" || source === "system") return source;
  return "manual";
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDateTime(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
