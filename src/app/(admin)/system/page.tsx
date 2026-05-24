"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StatusBadge, type StatusTone } from "@/components/badges/StatusBadge";
import { KpiCard } from "@/components/cards/KpiCard";
import { InfoRow as InfoItem } from "@/components/details/InfoRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ApiError } from "@/lib/api/apiClient";
import {
  superAdminApi,
  type SuperAdminSystemHealth,
} from "@/lib/api/superAdminApi";

export default function SystemPage() {
  const [health, setHealth] = useState<SuperAdminSystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadHealth = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      setForbidden(false);
      setHealth(await superAdminApi.getSystemHealth());
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل صحة النظام.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadHealth();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadHealth]);

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>النظام / صحة النظام</p>
          <h2>صحة النظام</h2>
          <p>حالة الخدمات والبنية التشغيلية لمنصة سند</p>
        </div>
        <div className="sanad-page-actions">
          {health ? <StatusBadge tone={overallTone(health)}>{overallLabel(health)}</StatusBadge> : null}
          <Link href="/system/settings" className="sanad-btn">
            إعدادات النظام
          </Link>
          <button
            type="button"
            className="sanad-btn sanad-btn-primary"
            disabled={refreshing}
            onClick={() => loadHealth(true)}
          >
            {refreshing ? "جاري التحديث..." : "تحديث"}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل صحة النظام..." />
      ) : error ? (
        <ErrorState
          title={forbidden ? "وصول غير مسموح" : "تعذر تحميل صحة النظام"}
          message={error}
          onRetry={() => loadHealth()}
        />
      ) : health ? (
        <div className="space-y-[14px]">
          <section className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            <HealthCard
              title="API / App"
              status={health.app.environment ? "ok" : "warning"}
              lines={[
                `البيئة: ${health.app.environment ?? "-"}`,
                `Debug: ${booleanLabel(health.app.debug)}`,
                `URL: ${health.app.url ?? "-"}`,
              ]}
            />
            <HealthCard
              title="Database"
              status={health.database.status}
              lines={[
                `Driver: ${health.database.driver ?? "-"}`,
                `Database: ${health.database.database ?? "-"}`,
                `Latency: ${formatLatency(health.database.latency_ms)}`,
              ]}
            />
            <HealthCard
              title="Cache"
              status={health.cache.status}
              lines={[
                `Store: ${health.cache.default_store ?? "-"}`,
                `Status: ${healthStatusLabel(health.cache.status)}`,
              ]}
            />
            <HealthCard
              title="Queue"
              status={health.queue.status}
              lines={[
                `Connection: ${health.queue.connection ?? "-"}`,
                `Status: ${healthStatusLabel(health.queue.status)}`,
              ]}
            />
            <HealthCard
              title="Gemini"
              status={health.gemini.configured ? "configured" : "warning"}
              lines={[
                `Configured: ${configuredLabel(health.gemini.configured)}`,
                `Model: ${health.gemini.model ?? "-"}`,
                `Timeout: ${health.gemini.timeout ?? "-"}s`,
              ]}
            />
            <HealthCard
              title="Storage"
              status={health.storage.storage_writable && health.storage.cache_writable ? "ok" : "warning"}
              lines={[
                `Logs: ${formatBytes(health.storage.logs_size_bytes)}`,
                `Storage writable: ${booleanLabel(health.storage.storage_writable)}`,
                `Cache writable: ${booleanLabel(health.storage.cache_writable)}`,
              ]}
            />
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">مؤشرات المنصة</h3>
                <p className="sanad-section-subtitle">أعداد تشغيلية آمنة للقراءة فقط.</p>
              </div>
            </div>
            <div className="sanad-kpi-grid p-4">
              <KpiCard title="المحال" value={formatCount(health.counts.shops)} subtitle="Shops" icon="م" tone="teal" />
              <KpiCard title="المستخدمون" value={formatCount(health.counts.users)} subtitle="Users" icon="U" tone="success" />
              <KpiCard title="الزبائن" value={formatCount(health.counts.customers)} subtitle="Customers" icon="ز" tone="gold" />
              <KpiCard title="الحركات" value={formatCount(health.counts.ledger_entries)} subtitle="Ledger entries" icon="₪" tone="teal" />
              <KpiCard title="أوامر AI" value={formatCount(health.counts.ai_commands)} subtitle="AI commands" icon="AI" tone="ai" />
              <KpiCard title="أحداث التدقيق" value={formatCount(health.counts.audit_events)} subtitle="Audit events" icon="◎" tone="gold" />
            </div>
          </section>

          <section className="grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">معلومات البيئة</h3>
                  <p className="sanad-section-subtitle">قيم آمنة لا تتضمن مفاتيح أو أسرار.</p>
                </div>
              </div>
              <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="اسم التطبيق" value={health.app.name} />
                <InfoItem label="البيئة" value={health.app.environment} mono />
                <InfoItem label="Debug" value={booleanLabel(health.app.debug)} />
                <InfoItem label="Laravel" value={health.app.laravel_version} mono />
                <InfoItem label="PHP" value={health.app.php_version} mono />
                <InfoItem label="Timezone" value={health.app.timezone} mono />
              </div>
            </div>

            <div className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">Recent errors</h3>
                  <p className="sanad-section-subtitle">ملخصات آمنة فقط عند توفرها.</p>
                </div>
              </div>
              {health.recent_errors.length === 0 ? (
                <EmptyState title="لا توجد أخطاء حديثة" description="الخادم لا يرجع ملخصات أخطاء حالياً لتجنب كشف تفاصيل حساسة." />
              ) : (
                <div className="divide-y divide-[var(--hairline-2)]">
                  {health.recent_errors.map((line, index) => (
                    <p key={`${line}-${index}`} className="break-words px-4 py-3 text-[12.5px] text-[var(--text-2)]">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function HealthCard({ title, status, lines }: { title: string; status?: string | null; lines: string[] }) {
  return (
    <div className="sanad-card p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-[var(--text)]">{title}</h3>
        <StatusBadge tone={healthTone(status)}>{healthStatusLabel(status)}</StatusBadge>
      </div>
      <div className="mt-4 space-y-2">
        {lines.map((line) => (
          <p key={line} className="mono-num block text-left text-[12px] text-[var(--muted)]">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function overallTone(health: SuperAdminSystemHealth): StatusTone {
  return health.database.status === "connected" && health.cache.status === "ok" ? "success" : "warning";
}

function overallLabel(health: SuperAdminSystemHealth): string {
  return overallTone(health) === "success" ? "سليم" : "يحتاج مراجعة";
}

function healthTone(status?: string | null): StatusTone {
  if (status === "connected" || status === "ok" || status === "configured") return "success";
  if (status === "error") return "danger";
  return "warning";
}

function healthStatusLabel(status?: string | null): string {
  if (status === "connected") return "متصل";
  if (status === "ok") return "سليم";
  if (status === "configured") return "مفعّل";
  if (status === "error") return "خطأ";
  return "مراجعة";
}

function configuredLabel(value: boolean): string {
  return value ? "مفعّل" : "غير مفعّل";
}

function booleanLabel(value: boolean): string {
  return value ? "نعم" : "لا";
}

function formatLatency(value?: number | null): string {
  if (value === null || value === undefined) return "-";
  return `${formatCount(value)} ms`;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
