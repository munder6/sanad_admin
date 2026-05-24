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
  type SuperAdminAuditEvent,
  type SuperAdminAuditEventsParams,
  type SuperAdminPaginationMeta,
} from "@/lib/api/superAdminApi";
import { formatArabicDateTime } from "@/lib/formatters/date";

const perPage = 10;

type AuditFilter = {
  label: string;
  params: Pick<SuperAdminAuditEventsParams, "severity" | "event_type">;
};

const filters: AuditFilter[] = [
  { label: "الكل", params: {} },
  { label: "معلومات", params: { severity: "info" } },
  { label: "تحذيرات", params: { severity: "warning" } },
  { label: "حرجة", params: { severity: "critical" } },
  { label: "دخول المشرف", params: { event_type: "super_admin.login" } },
  { label: "محاولات فاشلة", params: { event_type: "failed" } },
];

const emptyMeta: SuperAdminPaginationMeta = {
  current_page: 1,
  per_page: perPage,
  total: 0,
  last_page: 1,
};

export default function AuditPage() {
  const [events, setEvents] = useState<SuperAdminAuditEvent[]>([]);
  const [meta, setMeta] = useState<SuperAdminPaginationMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);

      const response = await superAdminApi.getAuditEvents({
        search: search.trim(),
        page,
        per_page: perPage,
        sort: "newest",
        ...filters[activeFilter].params,
      });

      setEvents(response.audit_events);
      setMeta(response.meta);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل سجل التدقيق.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadEvents();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadEvents]);

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>النظام / الأمان والتدقيق</p>
          <h2>الأمان والتدقيق</h2>
          <p>متابعة الأحداث الحساسة وسجلات الأمان عبر المنصة</p>
        </div>
        <StatusBadge tone="danger">قراءة فقط</StatusBadge>
      </div>

      <section className="sanad-card overflow-hidden">
        <div className="sanad-card-header flex-wrap">
          <div>
            <h3 className="sanad-section-title">سجل أحداث التدقيق</h3>
            <p className="sanad-section-subtitle">بحث وتصفية آمنة بدون أي إجراءات حذف أو تنظيف.</p>
          </div>
          <SearchInput
            placeholder="بحث بالحدث أو المستخدم أو المحل..."
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
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
            <LoadingState label="جاري تحميل سجل التدقيق..." />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState
              title={forbidden ? "وصول غير مسموح" : "تعذر تحميل سجل التدقيق"}
              message={error}
              onRetry={loadEvents}
            />
          </div>
        ) : events.length === 0 ? (
          <EmptyState title="لا توجد أحداث مطابقة" description="جرّب تعديل البحث أو اختيار فلتر مختلف." />
        ) : (
          <>
            <div className="sanad-table-wrap">
              <table className="sanad-table">
                <thead>
                  <tr>
                    <th>الحدث</th>
                    <th>الشدة</th>
                    <th>المستخدم</th>
                    <th>المحل</th>
                    <th className="!text-left">IP</th>
                    <th className="!text-left">التاريخ</th>
                    <th className="!text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="transition hover:bg-[var(--cream-2)]"
                    >
                      <td>
                        <div className="max-w-[300px]">
                          <p className="font-medium text-[var(--text)]">{event.event_label ?? event.event_type ?? "-"}</p>
                          <p className="mono-num mt-0.5 truncate text-[11.5px] text-[var(--muted)]">
                            #{event.id} · {event.event_type ?? "-"}
                          </p>
                          {event.metadata_summary ? (
                            <p className="mt-1 line-clamp-1 text-[12px] text-[var(--muted)]">{event.metadata_summary}</p>
                          ) : null}
                        </div>
                      </td>
                      <td><StatusBadge tone={severityTone(event.severity)}>{event.severity_label ?? severityLabel(event.severity)}</StatusBadge></td>
                      <td>
                        <div>
                          <p>{event.user?.name ?? "-"}</p>
                          <p className="mono-num mt-0.5 text-[11.5px] text-[var(--muted)]">{event.user?.phone ?? "-"}</p>
                        </div>
                      </td>
                      <td>{event.shop?.name ?? "-"}</td>
                      <td className="!text-left"><span className="mono-num">{event.ip_address ?? "-"}</span></td>
                      <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(event.created_at)}</span></td>
                      <td className="!text-left">
                        <Link
                          href={`/audit/details?id=${event.id}`}
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
                  onClick={() => setPage((value) => value + 1)}
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

function severityTone(severity?: string | null): StatusTone {
  if (severity === "critical") return "danger";
  if (severity === "warning") return "warning";
  return "info";
}

function severityLabel(severity?: string | null): string {
  if (severity === "critical") return "حرجة";
  if (severity === "warning") return "تحذير";
  return "معلومة";
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDateTime(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
