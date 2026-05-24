"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SourceBadge, type SourceKind } from "@/components/badges/SourceBadge";
import { StatusBadge, type StatusTone } from "@/components/badges/StatusBadge";
import { KpiCard } from "@/components/cards/KpiCard";
import { InfoRow as InfoItem } from "@/components/details/InfoRow";
import { AiIcon, AuditIcon, ShopsIcon, SystemIcon, TransactionsIcon } from "@/components/icons/AdminIcons";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MissingDetailState } from "@/components/ui/MissingDetailState";
import { ApiError } from "@/lib/api/apiClient";
import {
  superAdminApi,
  type SuperAdminUserAuditEvent,
  type SuperAdminUserDetail,
  type SuperAdminUserRecentAiCommand,
  type SuperAdminUserRecentTransaction,
  type SuperAdminUserResetPreview,
  type SuperAdminUserShop,
} from "@/lib/api/superAdminApi";
import { formatArabicDate, formatArabicDateTime } from "@/lib/formatters/date";
import { formatPhone } from "@/lib/formatters/number";

export default function UserDetailsPage() {
  return (
    <Suspense fallback={<LoadingState label="جاري فتح تفاصيل المستخدم..." />}>
      <UserDetailsContent />
    </Suspense>
  );
}

function UserDetailsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id") ?? "";
  const [detail, setDetail] = useState<SuperAdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [actionType, setActionType] = useState<"suspend" | "unsuspend" | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspensionMessage, setSuspensionMessage] = useState("");
  const [actionSaving, setActionSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetPreview, setResetPreview] = useState<SuperAdminUserResetPreview | null>(null);
  const [resetPreviewLoading, setResetPreviewLoading] = useState(false);
  const [resetSaving, setResetSaving] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [resetNotes, setResetNotes] = useState("");

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      setDetail(await superAdminApi.getUser(userId));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل تفاصيل المستخدم.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const timer = window.setTimeout(() => {
      loadDetail();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDetail, userId]);

  const closeAction = useCallback(() => {
    if (actionSaving) return;
    setActionType(null);
    setSuspendReason("");
    setSuspensionMessage("");
    setActionError(null);
  }, [actionSaving]);

  const confirmAction = useCallback(async () => {
    if (!detail || !actionType) return;

    try {
      setActionSaving(true);
      setActionError(null);

      const updated = actionType === "suspend"
        ? await superAdminApi.suspendUser(detail.user.id, {
            reason: suspendReason,
            suspension_message: suspensionMessage,
          })
        : await superAdminApi.unsuspendUser(detail.user.id);

      setDetail(updated);
      setActionSuccess(actionType === "suspend" ? "تم إيقاف الحساب مؤقتًا." : "تم تفعيل الحساب.");
      setActionType(null);
      setSuspendReason("");
      setSuspensionMessage("");
      setActionError(null);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "تعذر تنفيذ الإجراء.");
    } finally {
      setActionSaving(false);
    }
  }, [actionType, detail, suspendReason, suspensionMessage]);

  const loadResetPreview = useCallback(async () => {
    if (!detail) return;

    try {
      setResetPreviewLoading(true);
      setResetError(null);
      setResetPreview(await superAdminApi.getUserResetPreview(detail.user.id));
    } catch (caught) {
      setResetPreview(null);
      setResetError(caught instanceof Error ? caught.message : "تعذر تحميل معاينة التصفير.");
    } finally {
      setResetPreviewLoading(false);
    }
  }, [detail]);

  const openResetDialog = useCallback(() => {
    setActionSuccess(null);
    setResetOpen(true);
    setResetPreview(null);
    setResetError(null);
    setResetPassword("");
    setResetConfirmation("");
    setResetNotes("");
    window.setTimeout(() => {
      void loadResetPreview();
    }, 0);
  }, [loadResetPreview]);

  const closeResetDialog = useCallback(() => {
    if (resetSaving) return;
    setResetOpen(false);
    setResetPreview(null);
    setResetError(null);
    setResetPassword("");
    setResetConfirmation("");
    setResetNotes("");
  }, [resetSaving]);

  const confirmReset = useCallback(async () => {
    if (!detail || resetConfirmation !== "RESET" || !resetPassword.trim()) return;

    try {
      setResetSaving(true);
      setResetError(null);
      const response = await superAdminApi.resetUserData(detail.user.id, {
        admin_password: resetPassword,
        confirmation_text: "RESET",
        notes: resetNotes,
      });

      setActionSuccess(response.message || "تم تصفير بيانات الحساب بنجاح.");
      setResetOpen(false);
      setResetPreview(null);
      setResetPassword("");
      setResetConfirmation("");
      setResetNotes("");
      await loadDetail();
    } catch (caught) {
      setResetError(caught instanceof Error ? caught.message : "تعذر تصفير بيانات الحساب.");
    } finally {
      setResetSaving(false);
    }
  }, [detail, loadDetail, resetConfirmation, resetNotes, resetPassword]);

  if (!userId) {
    return <MissingDetailState backHref="/users" backLabel="العودة للمستخدمين" />;
  }

  return (
    <>
      <div className="sanad-user-hero">
        <div>
          <p className="sanad-user-hero-crumb">الإدارة / المستخدمون / تفاصيل</p>
          <h2>{detail?.user.name ?? "تفاصيل المستخدم"}</h2>
          <p className="mono-num">{detail?.user.phone ? formatPhone(detail.user.phone) : "مراقبة ملف الحساب والأنشطة المرتبطة به"}</p>
        </div>
        <div className="sanad-user-hero-actions">
          {detail ? <StatusBadge tone={detail.user.is_suspended ? "danger" : "success"}>{detail.user.is_suspended ? "مجمّد" : "نشط"}</StatusBadge> : null}
          {detail?.user.is_super_admin ? <StatusBadge tone="gold">مشرف عام</StatusBadge> : null}
          <Link href="/users" className="sanad-btn">العودة للمستخدمين</Link>
        </div>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل تفاصيل المستخدم..." />
      ) : error ? (
        <ErrorState
          title={forbidden ? "وصول غير مسموح" : "تعذر تحميل التفاصيل"}
          message={error}
          onRetry={loadDetail}
        />
      ) : detail ? (
        <div className="space-y-[14px]">
          <div className="sanad-kpi-grid">
            <KpiCard title="عدد المحلات" value={formatCount(detail.summary.shops_count)} subtitle="مملوكة أو مرتبطة" trend="قراءة فقط" icon={<ShopsIcon width="17" height="17" />} tone="teal" />
            <KpiCard title="عدد الحركات" value={formatCount(detail.summary.ledger_entries_count)} subtitle="منشأة بواسطة الحساب" trend="حركة" icon={<TransactionsIcon width="17" height="17" />} tone="gold" />
            <KpiCard title="أوامر AI" value={formatCount(detail.summary.ai_commands_count)} subtitle="مسودات وأوامر" trend="AI" icon={<AiIcon width="17" height="17" />} tone="ai" />
            <KpiCard title="آخر نشاط" value={formatShortDate(detail.summary.last_activity_at)} subtitle="حركة أو أمر أو سجل تدقيق" trend="نشاط" icon={<SystemIcon width="17" height="17" />} tone="success" />
            <KpiCard title="أحداث التدقيق" value={formatCount(detail.summary.audit_events_count)} subtitle="سجلات أمان مرتبطة" trend={`${formatCount(detail.summary.tokens_count)} token`} icon={<AuditIcon width="17" height="17" />} tone="danger" />
          </div>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">بيانات الحساب</h3>
                <p className="sanad-section-subtitle">معلومات المستخدم الأساسية وحالة التحقق.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!detail.user.is_super_admin ? (
                  <button
                    type="button"
                    className="sanad-btn border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger-700)] hover:border-[var(--danger-700)]"
                    onClick={openResetDialog}
                  >
                    تصفير بيانات الحساب
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`sanad-btn ${detail.user.is_suspended ? "sanad-btn-primary" : ""}`}
                  onClick={() => {
                    setActionSuccess(null);
                    setActionError(null);
                    setActionType(detail.user.is_suspended ? "unsuspend" : "suspend");
                    setSuspendReason(detail.user.suspended_reason ?? "");
                    setSuspensionMessage(detail.user.suspension_message ?? "");
                  }}
                >
                  {detail.user.is_suspended ? "تفعيل الحساب" : "تجميد الحساب"}
                </button>
              </div>
            </div>
            {actionSuccess ? (
              <div className="mx-4 mb-3 rounded-[var(--r-md)] border border-[var(--success-soft)] bg-[var(--success-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--success-700)]">
                {actionSuccess}
              </div>
            ) : null}
            <div className="sanad-user-info-grid">
              <InfoItem label="الهاتف" value={formatPhone(detail.user.phone)} mono />
              <InfoItem label="البريد" value={detail.user.email} />
              <InfoItem label="حالة الحساب" value={detail.user.is_suspended ? "مجمّد" : "نشط"} />
              <InfoItem label="حالة التسجيل" value={statusLabel(detail.user.status)} />
              <InfoItem label="سبب الإيقاف الداخلي" value={detail.user.suspended_reason} />
              <InfoItem label="النص الظاهر للمستخدم" value={detail.user.suspension_message} />
              <InfoItem label="تاريخ التجميد" value={formatDate(detail.user.suspended_at)} />
              <InfoItem label="جمّد بواسطة" value={detail.user.suspended_by?.name ?? detail.user.suspended_by?.phone ?? null} />
              <InfoItem label="الصلاحية" value={detail.user.is_super_admin ? "مشرف عام" : "مستخدم"} />
              <InfoItem label="توثيق الهاتف" value={verificationLabel(detail.user.phone_verified_at)} />
              <InfoItem label="توثيق البريد" value={verificationLabel(detail.user.email_verified_at)} />
              <InfoItem label="تاريخ الإنشاء" value={formatDate(detail.user.created_at)} />
              <InfoItem label="آخر تحديث" value={formatDate(detail.user.updated_at)} />
              <InfoItem label="المحل الحالي" value={detail.user.current_shop?.name} />
              <InfoItem label="رقم الحساب" value={String(detail.user.id)} mono />
            </div>
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">المحلات المرتبطة</h3>
                <p className="sanad-section-subtitle">المحلات المملوكة أو المرتبطة بهذا الحساب.</p>
              </div>
            </div>
            <UserShopsTable rows={detail.shops} />
          </section>

          <div className="grid gap-[14px] xl:grid-cols-2">
            <section className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">أحدث الحركات</h3>
                  <p className="sanad-section-subtitle">آخر 10 قيود مالية أنشأها هذا المستخدم.</p>
                </div>
              </div>
              <RecentTransactionsTable rows={detail.recent_transactions} />
            </section>

            <section className="sanad-card overflow-hidden">
              <div className="sanad-card-header">
                <div>
                  <h3 className="sanad-section-title">أحدث أوامر AI</h3>
                  <p className="sanad-section-subtitle">آخر 10 مسودات أو أوامر ذكية من هذا الحساب.</p>
                </div>
              </div>
              <RecentAiCommandsTable rows={detail.recent_ai_commands} />
            </section>
          </div>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">أحداث التدقيق</h3>
                <p className="sanad-section-subtitle">آخر أحداث الأمان المرتبطة بالمستخدم.</p>
              </div>
            </div>
            <AuditEventsTable rows={detail.audit_events} />
          </section>
        </div>
      ) : null}

      <SuspendDialog
        errorMessage={actionError}
        loading={actionSaving}
        open={actionType === "suspend" && Boolean(detail)}
        reason={suspendReason}
        suspensionMessage={suspensionMessage}
        userName={detail?.user.name ?? "المستخدم"}
        onCancel={closeAction}
        onConfirm={confirmAction}
        onReasonChange={setSuspendReason}
        onSuspensionMessageChange={setSuspensionMessage}
      />

      <ConfirmDialog
        open={actionType === "unsuspend" && Boolean(detail)}
        title="تفعيل الحساب؟"
        body={`سيتم السماح للحساب "${detail?.user.name ?? "المستخدم"}" باستخدام التطبيق مرة أخرى.`}
        confirmLabel="تفعيل الحساب"
        loading={actionSaving}
        onCancel={closeAction}
        onConfirm={confirmAction}
      />

      <ResetAccountDataDialog
        confirmationText={resetConfirmation}
        errorMessage={resetError}
        loading={resetSaving}
        notes={resetNotes}
        password={resetPassword}
        preview={resetPreview}
        previewLoading={resetPreviewLoading}
        userName={detail?.user.name ?? "المستخدم"}
        open={resetOpen && Boolean(detail)}
        onCancel={closeResetDialog}
        onConfirm={confirmReset}
        onConfirmationTextChange={setResetConfirmation}
        onNotesChange={setResetNotes}
        onPasswordChange={setResetPassword}
      />
    </>
  );
}

function ResetAccountDataDialog({
  open,
  userName,
  preview,
  previewLoading,
  loading,
  errorMessage,
  password,
  confirmationText,
  notes,
  onPasswordChange,
  onConfirmationTextChange,
  onNotesChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  userName: string;
  preview: SuperAdminUserResetPreview | null;
  previewLoading: boolean;
  loading: boolean;
  errorMessage: string | null;
  password: string;
  confirmationText: string;
  notes: string;
  onPasswordChange: (value: string) => void;
  onConfirmationTextChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const canConfirm = !previewLoading && !loading && Boolean(preview?.safe_to_reset) && password.trim().length > 0 && confirmationText === "RESET";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,42,40,0.42)] px-4 py-6" role="presentation">
      <div aria-modal="true" className="sanad-card max-h-[92vh] w-full max-w-[620px] overflow-y-auto" role="dialog">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h3 className="text-[20px] font-bold text-[var(--danger-700)]">تصفير بيانات الحساب</h3>
          <p className="mt-2 text-[14.5px] leading-7 text-[var(--text-2)]">
            هذا الإجراء سيحذف بيانات الحساب التشغيلية ولا يمكن التراجع عنه.
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[var(--muted)]">الحساب المستهدف: {userName}</p>
        </div>

        <div className="space-y-4 px-5 py-4">
          {previewLoading ? (
            <div className="rounded-[var(--r-md)] border border-[var(--hairline-2)] px-4 py-3 text-[14px] font-semibold text-[var(--text-2)]">
              جاري تحميل معاينة البيانات...
            </div>
          ) : preview ? (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {resetCountRows(preview.counts).map((row) => (
                  <div key={row.key} className="rounded-[var(--r-md)] border border-[var(--hairline-2)] bg-[var(--paper)] px-3 py-2">
                    <p className="text-[12.5px] font-semibold text-[var(--muted)]">{row.label}</p>
                    <p className="mono-num mt-1 text-[18px] font-bold text-[var(--text)]">{formatCount(row.value)}</p>
                  </div>
                ))}
              </div>
              {preview.shops.length > 0 ? (
                <div className="rounded-[var(--r-md)] border border-[var(--hairline-2)] bg-[var(--paper)] px-3 py-2 text-[13px] leading-6 text-[var(--text-2)]">
                  المحلات المشمولة: {preview.shops.map((shop) => shop.name ?? `#${shop.id}`).join("، ")}
                </div>
              ) : null}
              {preview.warnings.length > 0 ? (
                <div className="rounded-[var(--r-md)] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--danger-700)]">
                  {preview.warnings.join(" ")}
                </div>
              ) : null}
            </div>
          ) : null}

          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="reset-admin-password">
            كلمة مرور المشرف
          </label>
          <input
            className="w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={loading}
            id="reset-admin-password"
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />

          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="reset-confirmation-text">
            اكتب RESET للتأكيد
          </label>
          <input
            className="mono-num w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={loading}
            id="reset-confirmation-text"
            value={confirmationText}
            onChange={(event) => onConfirmationTextChange(event.target.value)}
          />

          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="reset-notes">
            ملاحظات داخلية
          </label>
          <textarea
            className="min-h-[86px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={loading}
            id="reset-notes"
            maxLength={2000}
            placeholder="اختياري"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
          />

          {errorMessage ? (
            <div className="rounded-[var(--r-md)] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--danger-700)]">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <button className="sanad-btn justify-center" disabled={loading} type="button" onClick={onCancel}>
            إلغاء
          </button>
          <button
            className="sanad-btn justify-center border-[var(--danger)] bg-[var(--danger)] text-white hover:bg-[var(--danger-700)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canConfirm}
            type="button"
            onClick={onConfirm}
          >
            {loading ? "جاري التصفير..." : "تأكيد التصفير"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuspendDialog({
  open,
  userName,
  reason,
  suspensionMessage,
  loading,
  errorMessage,
  onReasonChange,
  onSuspensionMessageChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  userName: string;
  reason: string;
  suspensionMessage: string;
  loading: boolean;
  errorMessage: string | null;
  onReasonChange: (value: string) => void;
  onSuspensionMessageChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,42,40,0.36)] px-4 py-6" role="presentation">
      <div aria-modal="true" className="sanad-card w-full max-w-[520px] overflow-hidden" role="dialog">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h3 className="text-[20px] font-bold text-[var(--text)]">إيقاف الحساب مؤقتًا؟</h3>
          <p className="mt-2 text-[14.5px] leading-7 text-[var(--text-2)]">
            سيتم منع الحساب {userName} من تسجيل الدخول واستخدام واجهات التطبيق المحمية.
          </p>
        </div>
        <div className="space-y-4 px-5 py-4">
          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="detail-suspend-reason">
            سبب الإيقاف الداخلي
          </label>
          <textarea
            className="min-h-[92px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={loading}
            id="detail-suspend-reason"
            maxLength={2000}
            placeholder="اختياري"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
          />
          <p className="-mt-3 text-[12.5px] leading-6 text-[var(--muted)]">يظهر للإدارة فقط.</p>
          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="detail-suspension-message">
            النص الذي يظهر للمستخدم
          </label>
          <textarea
            className="min-h-[110px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={loading}
            id="detail-suspension-message"
            maxLength={2000}
            placeholder="اختياري"
            value={suspensionMessage}
            onChange={(event) => onSuspensionMessageChange(event.target.value)}
          />
          <p className="-mt-3 text-[12.5px] leading-6 text-[var(--muted)]">إذا تركته فارغًا سيظهر النص الافتراضي من إعدادات النظام.</p>
          {errorMessage ? (
            <div className="rounded-[var(--r-md)] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--danger-700)]">
              {errorMessage}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <button className="sanad-btn justify-center" disabled={loading} type="button" onClick={onCancel}>
            إلغاء
          </button>
          <button className="sanad-btn justify-center border-[var(--danger)] bg-[var(--danger)] text-white hover:bg-[var(--danger-700)]" disabled={loading} type="button" onClick={onConfirm}>
            {loading ? "جاري الحفظ..." : "إيقاف الحساب مؤقتًا"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserShopsTable({ rows }: { rows: SuperAdminUserShop[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد محلات مرتبطة" description="لا توجد عضوية أو ملكية محل مسجلة لهذا الحساب." />;
  }

  return (
    <div className="sanad-table-wrap">
      <table className="sanad-table">
        <thead>
          <tr>
            <th>المحل</th>
            <th>الحالة</th>
            <th>المدينة</th>
            <th>نوع النشاط</th>
            <th className="!text-left">الدين الحالي</th>
            <th className="!text-center">الزبائن</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name ?? "محل بدون اسم"}</td>
              <td><StatusBadge tone={statusTone(row.status)}>{statusLabel(row.status)}</StatusBadge></td>
              <td>{row.city ?? "-"}</td>
              <td>{row.business_type ?? "-"}</td>
              <td className="!text-left"><span className="mono-num">{row.current_debt_text ?? "0 شيكل"}</span></td>
              <td className="!text-center"><span className="mono-num">{formatCount(row.customers_count)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentTransactionsTable({ rows }: { rows: SuperAdminUserRecentTransaction[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد حركات حديثة" description="لم يتم العثور على قيود مالية منشأة بواسطة هذا المستخدم." />;
  }

  return (
    <div className="sanad-table-wrap">
      <table className="sanad-table">
        <thead>
          <tr>
            <th>المحل</th>
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
              <td>{row.shop?.name ?? "-"}</td>
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

function RecentAiCommandsTable({ rows }: { rows: SuperAdminUserRecentAiCommand[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد أوامر AI حديثة" description="لم يتم العثور على أوامر ذكية مرتبطة بهذا المستخدم." />;
  }

  return (
    <div className="sanad-table-wrap">
      <table className="sanad-table">
        <thead>
          <tr>
            <th>المحل</th>
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
              <td>{row.shop?.name ?? "-"}</td>
              <td className="max-w-[320px] truncate">{row.raw_text ?? "-"}</td>
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

function AuditEventsTable({ rows }: { rows: SuperAdminUserAuditEvent[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد أحداث تدقيق" description="لا توجد سجلات أمان مرتبطة بهذا الحساب حتى الآن." />;
  }

  return (
    <div className="sanad-table-wrap">
      <table className="sanad-table">
        <thead>
          <tr>
            <th>الحدث</th>
            <th>الشدة</th>
            <th>المحل</th>
            <th>ملخص آمن</th>
            <th className="!text-left">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.event_type}-${row.created_at}-${index}`}>
              <td>{eventLabel(row.event_type)}</td>
              <td><StatusBadge tone={severityTone(row.severity)}>{row.severity ?? "عادي"}</StatusBadge></td>
              <td>{row.shop?.name ?? "-"}</td>
              <td className="max-w-[420px] truncate">{metadataSummary(row.metadata_summary)}</td>
              <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(row.created_at)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function verificationLabel(value?: string | null): string {
  return value ? "موثق" : "غير موثق";
}

function statusLabel(status?: string | null): string {
  const labels: Record<string, string> = {
    active: "نشط",
    pending_verification: "بانتظار التحقق",
    pending: "قيد المراجعة",
    inactive: "غير نشط",
    suspended: "معلّق",
    disabled: "معطل",
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
  if (status === "pending_verification" || status === "pending" || status === "suspended" || status === "parsed") return "warning";
  if (status === "disabled" || status === "voided" || status === "cancelled") return "danger";
  return "neutral";
}

function aiStatusTone(status?: string | null): StatusTone {
  if (status === "confirmed" || status === "answered") return "success";
  if (status === "cancelled") return "danger";
  return "ai";
}

function severityTone(severity?: string | null): StatusTone {
  if (severity === "high" || severity === "critical") return "danger";
  if (severity === "warning" || severity === "medium") return "warning";
  return "neutral";
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

function eventLabel(eventType?: string | null): string {
  if (!eventType) return "-";
  return eventType.replaceAll("_", " ").replaceAll(".", " / ");
}

function sourceKind(source?: string | null): SourceKind {
  if (source === "ai" || source === "voice" || source === "system") return source;
  return "manual";
}

function metadataSummary(metadata?: Record<string, unknown> | null): string {
  if (!metadata) return "-";
  return Object.entries(metadata)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}

function resetCountRows(counts: Record<string, number>): { key: string; label: string; value: number }[] {
  const labels: Record<string, string> = {
    shops: "المحلات",
    customers: "الزبائن",
    customer_aliases: "الأسماء البديلة",
    ledger_entries: "الحركات",
    ledger_entry_items: "عناصر الحركات",
    ledger_entry_events: "سجلات الحركات",
    ai_drafts: "مسودات الذكاء",
    ai_command_attempts: "محاولات الذكاء",
    ai_command_feedback: "ملاحظات الذكاء",
    daily_journal_entries: "اليوميات",
    daily_journal_ai_drafts: "مسودات يومية الذكاء",
    reminders: "التذكيرات",
  };

  return Object.entries(labels).map(([key, label]) => ({
    key,
    label,
    value: counts[key] ?? 0,
  }));
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
