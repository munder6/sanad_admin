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
  type SuperAdminAiCommand,
  type SuperAdminAiCommandsParams,
  type SuperAdminPaginationMeta,
} from "@/lib/api/superAdminApi";
import { formatArabicDateTime } from "@/lib/formatters/date";

const perPage = 10;

type AiCommandFilter = {
  label: string;
  params: Pick<SuperAdminAiCommandsParams, "status" | "source" | "has_items" | "failed_only" | "unknown_only">;
};

const filters: AiCommandFilter[] = [
  { label: "الكل", params: { status: "all", source: "all" } },
  { label: "بانتظار التأكيد", params: { status: "needs_confirmation", source: "all" } },
  { label: "مؤكدة", params: { status: "confirmed", source: "all" } },
  { label: "غير مفهومة", params: { unknown_only: true, status: "all", source: "all" } },
  { label: "فاشلة", params: { failed_only: true, status: "all", source: "all" } },
  { label: "بها أصناف", params: { has_items: true, status: "all", source: "all" } },
  { label: "صوتية", params: { source: "voice", status: "all" } },
];

const emptyMeta: SuperAdminPaginationMeta = {
  current_page: 1,
  per_page: perPage,
  total: 0,
  last_page: 1,
};

export default function AiCommandsPage() {
  const [commands, setCommands] = useState<SuperAdminAiCommand[]>([]);
  const [meta, setMeta] = useState<SuperAdminPaginationMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [shopId, setShopId] = useState("");
  const [userId, setUserId] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadCommands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      const response = await superAdminApi.getAiCommands({
        search: search.trim(),
        shop_id: shopId.trim(),
        user_id: userId.trim(),
        page,
        per_page: perPage,
        sort: "newest",
        ...filters[activeFilter].params,
      });
      setCommands(response.ai_commands);
      setMeta(response.meta);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل أوامر الذكاء الصناعي.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page, search, shopId, userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCommands();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadCommands]);

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>العمليات / أوامر الذكاء الصناعي</p>
          <h2>أوامر الذكاء الصناعي</h2>
          <p>مراقبة وتحليل أوامر الصوت والنص عبر المنصة</p>
        </div>
        <StatusBadge tone="ai">AI + صوت</StatusBadge>
      </div>

      <section className="sanad-card overflow-hidden">
        <div className="sanad-card-header flex-wrap">
          <div>
            <h3 className="sanad-section-title">سجل الأوامر الذكية</h3>
            <p className="sanad-section-subtitle">متابعة النية والحالة والربط المالي بدون إجراءات تعديل.</p>
          </div>
          <div className="flex w-full flex-col gap-2 xl:w-auto xl:min-w-[720px] xl:flex-row">
            <SearchInput
              placeholder="بحث بنص الأمر أو الزبون أو UUID..."
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
              placeholder="رقم المستخدم"
              value={userId}
              onChange={(event) => {
                setUserId(event.target.value);
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
            <LoadingState label="جاري تحميل أوامر الذكاء الصناعي..." />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState
              title={forbidden ? "وصول غير مسموح" : "تعذر تحميل الأوامر"}
              message={error}
              onRetry={loadCommands}
            />
          </div>
        ) : commands.length === 0 ? (
          <EmptyState
            title="لا توجد أوامر مطابقة"
            description="جرّب تعديل البحث أو اختيار فلتر مختلف."
          />
        ) : (
          <>
            <div className="sanad-table-wrap">
              <table className="sanad-table">
                <thead>
                  <tr>
                    <th>النص</th>
                    <th>المحل</th>
                    <th>المستخدم</th>
                    <th>النية</th>
                    <th>الحالة</th>
                    <th>الزبون</th>
                    <th className="!text-left">المبلغ</th>
                    <th className="!text-center">الأصناف</th>
                    <th>المصدر</th>
                    <th className="!text-left">التاريخ</th>
                    <th className="!text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {commands.map((command) => (
                    <tr
                      key={command.id}
                      className="transition hover:bg-[var(--cream-2)]"
                    >
                      <td>
                        <div className="max-w-[260px]">
                          <p className="line-clamp-2 font-medium text-[var(--text)]">{command.raw_text ?? "-"}</p>
                          <p className="mono-num mt-0.5 max-w-[170px] truncate text-[11.5px] text-[var(--muted)]">#{command.id} · {command.uuid ?? "-"}</p>
                        </div>
                      </td>
                      <td>{command.shop?.name ?? "-"}</td>
                      <td>
                        <div>
                          <p>{command.user?.name ?? "-"}</p>
                          <p className="mono-num mt-0.5 text-[11.5px] text-[var(--muted)]">{command.user?.phone ?? "-"}</p>
                        </div>
                      </td>
                      <td><StatusBadge tone={intentTone(command.intent)}>{intentLabel(command)}</StatusBadge></td>
                      <td><StatusBadge tone={statusTone(command.status)}>{statusLabel(command)}</StatusBadge></td>
                      <td>{command.customer?.name ?? command.customer_name ?? "-"}</td>
                      <td className="!text-left"><span className="mono-num">{command.amount_text ?? "-"}</span></td>
                      <td className="!text-center"><span className="mono-num">{formatCount(command.items_count)}</span></td>
                      <td><SourceBadge source={sourceKind(command.source)} /></td>
                      <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(command.created_at)}</span></td>
                      <td className="!text-left">
                        <Link
                          href={`/ai-commands/details?id=${command.id}`}
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

function intentLabel(command: SuperAdminAiCommand): string {
  if (command.intent_label) return command.intent_label;

  const labels: Record<string, string> = {
    create_debt: "دين جديد",
    record_payment: "سداد",
    query_balance: "استعلام رصيد",
    show_customer_transactions: "سجل الزبون",
    create_customer: "إنشاء زبون",
    unknown: "غير مفهوم",
  };

  return command.intent ? labels[command.intent] ?? command.intent : "غير محدد";
}

function statusLabel(command: SuperAdminAiCommand): string {
  if (command.status_label) return command.status_label;

  const labels: Record<string, string> = {
    answered: "تمت الإجابة",
    needs_confirmation: "بانتظار التأكيد",
    needs_customer_selection: "يحتاج اختيار زبون",
    needs_customer_creation: "يحتاج إنشاء زبون",
    needs_amount: "يحتاج مبلغ",
    unknown: "غير مفهوم",
    confirmed: "مؤكد",
    cancelled: "ملغي",
    failed: "فشل",
    parsed: "تم التحليل",
  };

  return command.status ? labels[command.status] ?? command.status : "غير محدد";
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

function sourceKind(source?: string | null): SourceKind {
  if (source === "ai" || source === "voice" || source === "system" || source === "text") return source;
  return "manual";
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDateTime(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
