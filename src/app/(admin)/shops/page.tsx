"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
  type SuperAdminShop,
} from "@/lib/api/superAdminApi";
import { formatArabicDateTime } from "@/lib/formatters/date";

const perPage = 10;

const statusFilters = [
  { label: "الكل", value: "" },
  { label: "نشط", value: "active" },
  { label: "غير نشط", value: "inactive" },
  { label: "معلّق", value: "suspended" },
];

const emptyMeta: SuperAdminPaginationMeta = {
  current_page: 1,
  per_page: perPage,
  total: 0,
  last_page: 1,
};

export default function ShopsPage() {
  const [shops, setShops] = useState<SuperAdminShop[]>([]);
  const [meta, setMeta] = useState<SuperAdminPaginationMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      const response = await superAdminApi.getShops({
        search: search.trim(),
        status,
        page,
        per_page: perPage,
        sort: "newest",
      });
      setShops(response.shops);
      setMeta(response.meta);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل المحلات.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadShops();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadShops]);

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>الإدارة / المحلات</p>
          <h2>المحلات</h2>
          <p>إدارة ومراقبة المحلات المسجلة في سند</p>
        </div>
        <StatusBadge tone="teal">قراءة فقط</StatusBadge>
      </div>

      <section className="sanad-card overflow-hidden">
        <div className="sanad-card-header flex-wrap">
          <div>
            <h3 className="sanad-section-title">سجل المحلات</h3>
            <p className="sanad-section-subtitle">بحث ومتابعة تشغيلية بدون إجراءات تعديل في هذه المرحلة.</p>
          </div>
          <SearchInput
            placeholder="بحث باسم المحل أو المالك أو الهاتف..."
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>

        <div className="sanad-filter-bar">
          {statusFilters.map((filter) => (
            <FilterChip
              key={filter.value || "all"}
              label={filter.label}
              selected={status === filter.value}
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
            />
          ))}
        </div>

        {loading ? (
          <div className="p-4">
            <LoadingState label="جاري تحميل المحلات..." />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState
              title={forbidden ? "وصول غير مسموح" : "تعذر تحميل المحلات"}
              message={error}
              onRetry={loadShops}
            />
          </div>
        ) : shops.length === 0 ? (
          <EmptyState
            title="لا توجد محلات مطابقة"
            description="جرّب تعديل البحث أو اختيار حالة مختلفة."
          />
        ) : (
          <>
            <div className="sanad-table-wrap">
              <table className="sanad-table">
                <thead>
                  <tr>
                    <th>اسم المحل</th>
                    <th>المالك</th>
                    <th>المدينة</th>
                    <th>الحالة</th>
                    <th className="!text-left">إجمالي الدين</th>
                    <th className="!text-center">عدد الزبائن</th>
                    <th className="!text-center">عدد الحركات</th>
                    <th className="!text-left">آخر نشاط</th>
                    <th className="!text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop) => (
                    <tr
                      key={shop.id}
                      className="transition hover:bg-[var(--cream-2)]"
                    >
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-9 w-9 place-items-center rounded-[9px] border border-[var(--hairline)] bg-[linear-gradient(135deg,var(--teal-50),var(--cream))] text-[13px] font-semibold text-[var(--teal-700)]">
                            {(shop.name ?? "س").slice(0, 1)}
                          </span>
                          <div>
                            <p className="font-medium text-[var(--text)]">{shop.name ?? "محل بدون اسم"}</p>
                            <p className="text-[11.5px] text-[var(--muted)]">{shop.business_type ?? "نوع النشاط غير محدد"}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p>{shop.owner?.name ?? "غير محدد"}</p>
                          <p className="mono-num mt-0.5 text-[11.5px] text-[var(--muted)]">{shop.owner?.phone ?? "-"}</p>
                        </div>
                      </td>
                      <td>{shop.city ?? "-"}</td>
                      <td><StatusBadge tone={statusTone(shop.status)}>{statusLabel(shop.status)}</StatusBadge></td>
                      <td className="!text-left"><span className="mono-num">{shop.current_debt_text ?? "0 شيكل"}</span></td>
                      <td className="!text-center"><span className="mono-num">{formatCount(shop.customers_count)}</span></td>
                      <td className="!text-center"><span className="mono-num">{formatCount(shop.ledger_entries_count)}</span></td>
                      <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(shop.last_activity_at)}</span></td>
                      <td className="!text-left">
                        <Link
                          href={`/shops/details?id=${shop.id}`}
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

function statusLabel(status?: string | null): string {
  const labels: Record<string, string> = {
    active: "نشط",
    inactive: "غير نشط",
    suspended: "معلّق",
    disabled: "معطل",
    pending: "قيد المراجعة",
  };

  return status ? labels[status] ?? status : "غير محدد";
}

function statusTone(status?: string | null): StatusTone {
  if (status === "active") return "success";
  if (status === "suspended" || status === "pending") return "warning";
  if (status === "disabled") return "danger";
  return "neutral";
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDateTime(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
