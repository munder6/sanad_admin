"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatusBadge, type StatusTone } from "@/components/badges/StatusBadge";
import { KpiCard } from "@/components/cards/KpiCard";
import { InfoRow as InfoItem } from "@/components/details/InfoRow";
import { JsonViewer } from "@/components/json/JsonViewer";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MissingDetailState } from "@/components/ui/MissingDetailState";
import { ApiError } from "@/lib/api/apiClient";
import { superAdminApi, type SuperAdminAuditEventDetail } from "@/lib/api/superAdminApi";
import { formatArabicDate, formatArabicDateTime } from "@/lib/formatters/date";

export default function AuditEventDetailsPage() {
  return (
    <Suspense fallback={<LoadingState label="جاري فتح تفاصيل حدث التدقيق..." />}>
      <AuditEventDetailsContent />
    </Suspense>
  );
}

function AuditEventDetailsContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id") ?? "";
  const [detail, setDetail] = useState<SuperAdminAuditEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      setDetail(await superAdminApi.getAuditEvent(eventId));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل تفاصيل حدث التدقيق.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    const timer = window.setTimeout(() => {
      loadDetail();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDetail, eventId]);

  if (!eventId) {
    return <MissingDetailState backHref="/audit" backLabel="العودة للتدقيق" />;
  }

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>النظام / الأمان والتدقيق / تفاصيل</p>
          <h2>تفاصيل حدث التدقيق</h2>
          <p>{detail ? `حدث رقم #${detail.id}` : "قراءة آمنة لحدث تدقيق محفوظ"}</p>
        </div>
        <div className="sanad-page-actions">
          {detail ? <StatusBadge tone={severityTone(detail.severity)}>{detail.severity_label ?? severityLabel(detail.severity)}</StatusBadge> : null}
          <Link href="/audit" className="sanad-btn">العودة للتدقيق</Link>
        </div>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل تفاصيل حدث التدقيق..." />
      ) : error ? (
        <ErrorState
          title={forbidden ? "وصول غير مسموح" : "تعذر تحميل التفاصيل"}
          message={error}
          onRetry={loadDetail}
        />
      ) : detail ? (
        <div className="space-y-[14px]">
          <div className="sanad-kpi-grid">
            <KpiCard title="نوع الحدث" value={detail.event_label ?? detail.event_type ?? "-"} subtitle={detail.event_type ?? "غير محدد"} icon="◎" tone="teal" />
            <KpiCard title="الشدة" value={detail.severity_label ?? severityLabel(detail.severity)} subtitle="تصنيف مشتق من نوع الحدث" icon="!" tone={severityTone(detail.severity) === "danger" ? "danger" : "gold"} />
            <KpiCard title="المستخدم" value={detail.user?.name ?? "-"} subtitle={detail.user?.phone ?? "لا يوجد مستخدم مرتبط"} icon="م" tone="success" />
            <KpiCard title="التاريخ" value={formatShortDate(detail.created_at)} subtitle={formatDate(detail.created_at)} icon="◷" tone="gold" />
            <KpiCard title="IP" value={detail.ip_address ?? "-"} subtitle="عنوان الطلب" icon="IP" tone="teal" />
          </div>

          <section className="grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">بيانات الحدث</h3>
                  <p className="sanad-section-subtitle">تفاصيل القراءة المباشرة من سجل التدقيق.</p>
                </div>
              </div>
              <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="رقم الحدث" value={`#${detail.id}`} mono />
                <InfoItem label="event_type" value={detail.event_type} mono />
                <InfoItem label="subject_type" value={detail.subject_type} mono />
                <InfoItem label="subject_id" value={detail.subject_id} mono />
                <InfoItem label="IP" value={detail.ip_address} mono />
                <InfoItem label="تاريخ الإنشاء" value={formatDate(detail.created_at)} mono />
                <InfoItem label="User agent" value={detail.user_agent} mono wide />
                <InfoItem label="ملخص البيانات" value={detail.metadata_summary} wide />
              </div>
            </div>

            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">المستخدم والمحل</h3>
                  <p className="sanad-section-subtitle">الأطراف المرتبطة بالحدث إن وجدت.</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <InfoItem label="المستخدم" value={detail.user?.name} />
                <InfoItem label="هاتف المستخدم" value={detail.user?.phone} mono />
                <InfoItem label="رقم المستخدم" value={detail.user?.id} mono />
                <InfoItem label="المحل" value={detail.shop?.name} />
                <InfoItem label="رقم المحل" value={detail.shop?.id} mono />
              </div>
            </div>
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">Metadata JSON</h3>
                <p className="sanad-section-subtitle">يعرض القيم المقنّعة من الخادم فقط.</p>
              </div>
            </div>
            <div className="p-4">
              <JsonViewer data={detail.metadata} emptyLabel="لا توجد بيانات إضافية لهذا الحدث" />
            </div>
          </section>
        </div>
      ) : null}
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

function formatShortDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDate(value);
}
