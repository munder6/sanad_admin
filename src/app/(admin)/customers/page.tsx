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
  type SuperAdminCustomer,
  type SuperAdminCustomersParams,
  type SuperAdminPaginationMeta,
} from "@/lib/api/superAdminApi";

const perPage = 10;

type CustomerFilter = {
  label: string;
  params: Pick<SuperAdminCustomersParams, "balance_status">;
};

const filters: CustomerFilter[] = [
  { label: "الكل", params: {} },
  { label: "عليهم دين", params: { balance_status: "has_debt" } },
  { label: "مسدّدون", params: { balance_status: "paid" } },
  { label: "لهم رصيد", params: { balance_status: "credit" } },
];

const emptyMeta: SuperAdminPaginationMeta = {
  current_page: 1,
  per_page: perPage,
  total: 0,
  last_page: 1,
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<SuperAdminCustomer[]>([]);
  const [meta, setMeta] = useState<SuperAdminPaginationMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [shopId, setShopId] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      const response = await superAdminApi.getCustomers({
        search: search.trim(),
        shop_id: shopId.trim(),
        page,
        per_page: perPage,
        sort: "last_activity",
        ...filters[activeFilter].params,
      });
      setCustomers(response.customers);
      setMeta(response.meta);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل الزبائن.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page, search, shopId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCustomers();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadCustomers]);

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>الإدارة / الزبائن</p>
          <h2>الزبائن</h2>
          <p>مراقبة زبائن كل المحلات وأرصدتهم</p>
        </div>
        <StatusBadge tone="teal">قراءة فقط</StatusBadge>
      </div>

      <section className="sanad-card overflow-hidden">
        <div className="sanad-card-header flex-wrap">
          <div>
            <h3 className="sanad-section-title">سجل الزبائن</h3>
            <p className="sanad-section-subtitle">بحث ومتابعة أرصدة الزبائن عبر كل المحلات بدون إجراءات تعديل.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[520px] sm:flex-row">
            <SearchInput
              placeholder="بحث باسم الزبون أو الهاتف أو الاسم البديل..."
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
              className="h-10 w-full rounded-[10px] border border-[var(--hairline)] bg-white px-3 text-[13px] text-[var(--text)] outline-none transition focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-50)] sm:w-[130px]"
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
            <LoadingState label="جاري تحميل الزبائن..." />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState
              title={forbidden ? "وصول غير مسموح" : "تعذر تحميل الزبائن"}
              message={error}
              onRetry={loadCustomers}
            />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            title="لا توجد زبائن مطابقة"
            description="جرّب تعديل البحث أو اختيار فلتر مختلف."
          />
        ) : (
          <>
            <div className="sanad-table-wrap">
              <table className="sanad-table">
                <thead>
                  <tr>
                    <th>الزبون</th>
                    <th>المحل</th>
                    <th>الهاتف</th>
                    <th className="!text-left">الرصيد</th>
                    <th>الحالة</th>
                    <th className="!text-center">عدد الحركات</th>
                    <th className="!text-left">آخر عملية</th>
                    <th className="!text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-[var(--cream-2)]"
                    >
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-9 w-9 place-items-center rounded-[9px] border border-[var(--hairline)] bg-[linear-gradient(135deg,var(--teal-50),var(--cream))] text-[13px] font-semibold text-[var(--teal-700)]">
                            {(customer.name ?? "ز").slice(0, 1)}
                          </span>
                          <div>
                            <p className="font-medium text-[var(--text)]">{customer.name ?? "زبون بدون اسم"}</p>
                            <p className="mono-num mt-0.5 text-[11.5px] text-[var(--muted)]">#{customer.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>{customer.shop?.name ?? "-"}</td>
                      <td><span className="mono-num">{customer.phone ?? "-"}</span></td>
                      <td className="!text-left"><span className="mono-num">{customer.balance_text ?? "0 شيكل"}</span></td>
                      <td><StatusBadge tone={balanceTone(customer.balance_status)}>{balanceLabel(customer.balance_status)}</StatusBadge></td>
                      <td className="!text-center"><span className="mono-num">{formatCount(customer.ledger_entries_count)}</span></td>
                      <td className="!text-left">
                        <span className="text-[12px] text-[var(--muted)]">{customer.last_entry_text ?? "-"}</span>
                      </td>
                      <td className="!text-left">
                        <Link
                          href={`/customers/details?id=${customer.id}`}
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

function balanceLabel(status?: string | null): string {
  const labels: Record<string, string> = {
    has_debt: "عليه دين",
    paid: "مسدّد",
    credit: "له رصيد",
  };

  return status ? labels[status] ?? status : "غير محدد";
}

function balanceTone(status?: string | null): StatusTone {
  if (status === "has_debt") return "danger";
  if (status === "credit") return "success";
  if (status === "paid") return "teal";
  return "neutral";
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
