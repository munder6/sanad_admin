"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SourceBadge, type SourceKind } from "@/components/badges/SourceBadge";
import { StatusBadge, type StatusTone } from "@/components/badges/StatusBadge";
import { KpiCard } from "@/components/cards/KpiCard";
import { InfoRow as InfoItem } from "@/components/details/InfoRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MissingDetailState } from "@/components/ui/MissingDetailState";
import { ApiError } from "@/lib/api/apiClient";
import {
  superAdminApi,
  type SuperAdminRecentAiCommand,
  type SuperAdminRecentTransaction,
  type SuperAdminShopDetail,
} from "@/lib/api/superAdminApi";
import { formatArabicDate, formatArabicDateTime } from "@/lib/formatters/date";

export default function ShopDetailsPage() {
  return (
    <Suspense fallback={<LoadingState label="جاري فتح تفاصيل المحل..." />}>
      <ShopDetailsContent />
    </Suspense>
  );
}

function ShopDetailsContent() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("id") ?? "";
  const [detail, setDetail] = useState<SuperAdminShopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      setDetail(await superAdminApi.getShop(shopId));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل تفاصيل المحل.");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;

    const timer = window.setTimeout(() => {
      loadDetail();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDetail, shopId]);

  if (!shopId) {
    return <MissingDetailState backHref="/shops" backLabel="العودة للمحلات" />;
  }

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>الإدارة / المحلات / تفاصيل</p>
          <h2>{detail?.shop.name ?? "تفاصيل المحل"}</h2>
          <p>{detail?.owner?.name ? `المالك: ${detail.owner.name}` : "مراقبة بيانات المحل والحركات الأخيرة"}</p>
        </div>
        <div className="sanad-page-actions">
          {detail ? <StatusBadge tone={statusTone(detail.shop.status)}>{statusLabel(detail.shop.status)}</StatusBadge> : null}
          <Link href="/shops" className="sanad-btn">العودة للمحلات</Link>
        </div>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل تفاصيل المحل..." />
      ) : error ? (
        <ErrorState
          title={forbidden ? "وصول غير مسموح" : "تعذر تحميل التفاصيل"}
          message={error}
          onRetry={loadDetail}
        />
      ) : detail ? (
        <div className="space-y-[14px]">
          <div className="sanad-kpi-grid">
            <KpiCard title="إجمالي الدين" value={detail.summary.current_debt_text ?? "0 شيكل"} subtitle="رصيد العملاء الموجب" trend="قراءة فقط" icon="₪" tone="danger" />
            <KpiCard title="عدد الزبائن" value={formatCount(detail.summary.customers_count)} subtitle="ضمن هذا المحل" trend="زبون" icon="♙" tone="teal" />
            <KpiCard title="عدد الحركات" value={formatCount(detail.summary.ledger_entries_count)} subtitle="ديون وسداد" trend={`${formatCount(detail.summary.debt_entries_count)} دين`} icon="◎" tone="gold" />
            <KpiCard title="أوامر AI" value={formatCount(detail.summary.ai_commands_count)} subtitle="مسودات وأوامر" trend="AI" icon="⌘" tone="ai" />
            <KpiCard title="آخر نشاط" value={formatShortDate(detail.summary.last_activity_at)} subtitle="حركة أو أمر حديث" trend="نشاط" icon="↻" tone="success" />
          </div>

          <section className="grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">بيانات المحل</h3>
                  <p className="sanad-section-subtitle">ملف المحل والمالك كما هو مخزن في النظام.</p>
                </div>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="المدينة" value={detail.shop.city} />
                <InfoItem label="نوع النشاط" value={detail.shop.business_type} />
                <InfoItem label="العملة" value={detail.shop.currency} />
                <InfoItem label="تاريخ الإنشاء" value={formatDate(detail.shop.created_at)} />
                <InfoItem label="آخر تحديث" value={formatDate(detail.shop.updated_at)} />
                <InfoItem label="رقم المحل" value={String(detail.shop.id)} mono />
              </div>
            </div>

            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">المالك</h3>
                  <p className="sanad-section-subtitle">معلومات الحساب المرتبط بالمحل.</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <InfoItem label="الاسم" value={detail.owner?.name} />
                <InfoItem label="الهاتف" value={detail.owner?.phone} mono />
                <InfoItem label="البريد" value={detail.owner?.email} />
                <InfoItem label="حالة الحساب" value={statusLabel(detail.owner?.status)} />
                <InfoItem label="توثيق الهاتف" value={formatDate(detail.owner?.phone_verified_at)} />
              </div>
            </div>
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">أحدث الحركات</h3>
                <p className="sanad-section-subtitle">آخر 10 قيود مالية على دفتر المحل.</p>
              </div>
            </div>
            <RecentTransactionsTable rows={detail.recent_transactions} />
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">أحدث أوامر AI</h3>
                <p className="sanad-section-subtitle">آخر 10 مسودات أو أوامر ذكية.</p>
              </div>
            </div>
            <RecentAiCommandsTable rows={detail.recent_ai_commands} />
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">أعلى الزبائن ديناً</h3>
                <p className="sanad-section-subtitle">أعلى 5 أرصدة موجبة حسب القيود المنشورة.</p>
              </div>
            </div>
            {detail.top_debt_customers.length === 0 ? (
              <EmptyState title="لا توجد أرصدة دين حالياً" description="سيظهر هنا الزبائن أصحاب أعلى دين عند توفر بيانات منشورة." />
            ) : (
              <div className="sanad-table-wrap">
                <table className="sanad-table">
                  <thead>
                    <tr>
                      <th>الزبون</th>
                      <th>الهاتف</th>
                      <th className="!text-left">الدين</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.top_debt_customers.map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.name ?? "زبون بدون اسم"}</td>
                        <td><span className="mono-num">{customer.phone ?? "-"}</span></td>
                        <td className="!text-left"><span className="mono-num">{customer.debt_text ?? "0 شيكل"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function RecentTransactionsTable({ rows }: { rows: SuperAdminRecentTransaction[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد حركات حديثة" description="لم يتم تسجيل قيود مالية لهذا المحل بعد." />;
  }

  return (
    <div className="sanad-table-wrap">
      <table className="sanad-table">
        <thead>
          <tr>
            <th>الزبون</th>
            <th>النوع</th>
            <th className="!text-left">المبلغ</th>
            <th>المصدر</th>
            <th className="!text-center">العناصر</th>
            <th className="!text-left">التاريخ</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.customer?.name ?? "غير محدد"}</td>
              <td><StatusBadge tone={row.entry_type === "payment" ? "success" : "gold"}>{entryTypeLabel(row.entry_type)}</StatusBadge></td>
              <td className="!text-left"><span className="mono-num">{row.signed_amount_text ?? row.amount_text ?? "-"}</span></td>
              <td><SourceBadge source={sourceKind(row.source)} /></td>
              <td className="!text-center"><span className="mono-num">{formatCount(row.items_count)}</span></td>
              <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(row.posted_at ?? row.created_at)}</span></td>
              <td><StatusBadge tone={row.status === "posted" ? "success" : "warning"}>{statusLabel(row.status)}</StatusBadge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentAiCommandsTable({ rows }: { rows: SuperAdminRecentAiCommand[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد أوامر AI حديثة" description="ستظهر هنا الأوامر الذكية عند استخدامها داخل المحل." />;
  }

  return (
    <div className="sanad-table-wrap">
      <table className="sanad-table">
        <thead>
          <tr>
            <th>النص</th>
            <th>النية</th>
            <th>الحالة</th>
            <th>الزبون</th>
            <th className="!text-left">المبلغ</th>
            <th className="!text-center">العناصر</th>
            <th className="!text-left">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="max-w-[360px] truncate">{row.raw_text ?? "-"}</td>
              <td>{intentLabel(row.intent)}</td>
              <td><StatusBadge tone={aiStatusTone(row.status)}>{statusLabel(row.status)}</StatusBadge></td>
              <td>{row.customer_name ?? "-"}</td>
              <td className="!text-left"><span className="mono-num">{row.amount_text ?? "-"}</span></td>
              <td className="!text-center"><span className="mono-num">{formatCount(row.items_count)}</span></td>
              <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(row.created_at)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function statusLabel(status?: string | null): string {
  const labels: Record<string, string> = {
    active: "نشط",
    inactive: "غير نشط",
    suspended: "معلّق",
    disabled: "معطل",
    pending: "قيد المراجعة",
    posted: "منشور",
    voided: "ملغي",
    parsed: "مقروء",
    confirmed: "مؤكد",
    cancelled: "ملغي",
    answered: "تمت الإجابة",
  };

  return status ? labels[status] ?? status : "غير محدد";
}

function statusTone(status?: string | null): StatusTone {
  if (status === "active" || status === "posted" || status === "confirmed") return "success";
  if (status === "suspended" || status === "pending" || status === "parsed") return "warning";
  if (status === "disabled" || status === "voided" || status === "cancelled") return "danger";
  return "neutral";
}

function aiStatusTone(status?: string | null): StatusTone {
  if (status === "confirmed" || status === "answered") return "success";
  if (status === "cancelled") return "danger";
  return "ai";
}

function entryTypeLabel(type?: string | null): string {
  if (type === "debt") return "دين";
  if (type === "payment") return "سداد";
  return type ?? "-";
}

function intentLabel(intent?: string | null): string {
  const labels: Record<string, string> = {
    create_debt: "تسجيل دين",
    record_payment: "تسجيل سداد",
    query_balance: "استعلام رصيد",
    show_customer_transactions: "عرض حركات",
    create_customer: "إنشاء زبون",
    unknown: "غير معروف",
  };

  return intent ? labels[intent] ?? intent : "-";
}

function sourceKind(source?: string | null): SourceKind {
  if (source === "ai" || source === "voice" || source === "system") return source;
  return "manual";
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDateTime(value);
}

function formatShortDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDate(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
