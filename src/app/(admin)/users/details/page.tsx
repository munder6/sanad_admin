"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Tabs } from "@/components/ui/Tabs";
import { ApiError } from "@/lib/api/apiClient";
import {
  superAdminApi,
  type SmsRechargeRequest,
  type SmsProviderMessageLog,
  type SmsWalletTransaction,
  type SuperAdminUserAuditEvent,
  type SuperAdminUserDeletePreview,
  type SuperAdminUserDetail,
  type SuperAdminUserRecentAiCommand,
  type SuperAdminUserRecentTransaction,
  type SuperAdminUserResetPreview,
  type SuperAdminUserShop,
} from "@/lib/api/superAdminApi";
import { formatArabicDate, formatArabicDateTime } from "@/lib/formatters/date";
import { formatPhone, isValidLocalPhone, sanitizeLocalPhoneInput } from "@/lib/formatters/number";

export default function UserDetailsPage() {
  return (
    <Suspense fallback={<LoadingState label="جاري فتح تفاصيل المستخدم..." />}>
      <UserDetailsContent />
    </Suspense>
  );
}

function UserDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditUserForm>(emptyEditUserForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>(emptyChangePasswordForm);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promotePassword, setPromotePassword] = useState("");
  const [promoteNotes, setPromoteNotes] = useState("");
  const [promoteSaving, setPromoteSaving] = useState(false);
  const [promoteError, setPromoteError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePreview, setDeletePreview] = useState<SuperAdminUserDeletePreview | null>(null);
  const [deletePreviewLoading, setDeletePreviewLoading] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteNotes, setDeleteNotes] = useState("");
  const [smsAction, setSmsAction] = useState<"quota" | "topup" | "toggle" | null>(null);
  const [smsActionValue, setSmsActionValue] = useState("");
  const [smsActionNotes, setSmsActionNotes] = useState("");
  const [smsActionSaving, setSmsActionSaving] = useState(false);
  const [smsActionError, setSmsActionError] = useState<string | null>(null);

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

  const openEditDialog = useCallback(() => {
    if (!detail) return;

    setActionSuccess(null);
    setEditError(null);
    setEditForm({
      name: detail.user.name ?? "",
      phone: detail.user.phone ?? "",
      email: detail.user.email ?? "",
      shop_name: detail.user.current_shop?.name ?? detail.shops[0]?.name ?? "",
      is_active: detail.user.is_active ?? detail.user.status === "active",
      notes: "",
    });
    setEditOpen(true);
  }, [detail]);

  const closeEditDialog = useCallback(() => {
    if (editSaving) return;
    setEditOpen(false);
    setEditForm(emptyEditUserForm);
    setEditError(null);
  }, [editSaving]);

  const submitEditUser = useCallback(async () => {
    if (!detail) return;
    if (!canSubmitEditUser(editForm)) {
      setEditError("رقم الجوال يجب أن يكون 10 أرقام ويبدأ بصفر، مع تعبئة باقي الحقول المطلوبة.");
      return;
    }

    try {
      setEditSaving(true);
      setEditError(null);
      const updated = await superAdminApi.updateUser(detail.user.id, editForm);
      setDetail(updated);
      setEditOpen(false);
      setEditForm(emptyEditUserForm);
      setActionSuccess("تم تحديث بيانات المستخدم بنجاح.");
    } catch (caught) {
      setEditError(caught instanceof Error ? caught.message : "تعذر تحديث بيانات المستخدم.");
    } finally {
      setEditSaving(false);
    }
  }, [detail, editForm]);

  const openPasswordDialog = useCallback(() => {
    setActionSuccess(null);
    setPasswordError(null);
    setPasswordForm(emptyChangePasswordForm);
    setPasswordOpen(true);
  }, []);

  const closePasswordDialog = useCallback(() => {
    if (passwordSaving) return;
    setPasswordOpen(false);
    setPasswordForm(emptyChangePasswordForm);
    setPasswordError(null);
  }, [passwordSaving]);

  const submitPasswordChange = useCallback(async () => {
    if (!detail || !canSubmitPasswordChange(passwordForm)) return;

    try {
      setPasswordSaving(true);
      setPasswordError(null);
      const response = await superAdminApi.changeUserPassword(detail.user.id, passwordForm);
      setPasswordOpen(false);
      setPasswordForm(emptyChangePasswordForm);
      setActionSuccess(response.message || "تم تحديث كلمة مرور المستخدم بنجاح.");
      await loadDetail();
    } catch (caught) {
      setPasswordError(caught instanceof Error ? caught.message : "تعذر تحديث كلمة مرور المستخدم.");
    } finally {
      setPasswordSaving(false);
    }
  }, [detail, loadDetail, passwordForm]);

  const openPromoteDialog = useCallback(() => {
    setActionSuccess(null);
    setPromoteError(null);
    setPromotePassword("");
    setPromoteNotes("");
    setPromoteOpen(true);
  }, []);

  const closePromoteDialog = useCallback(() => {
    if (promoteSaving) return;
    setPromoteOpen(false);
    setPromotePassword("");
    setPromoteNotes("");
    setPromoteError(null);
  }, [promoteSaving]);

  const submitPromote = useCallback(async () => {
    if (!detail || !promotePassword.trim()) {
      setPromoteError("كلمة مرور المشرف الحالي مطلوبة.");
      return;
    }

    try {
      setPromoteSaving(true);
      setPromoteError(null);
      const updated = await superAdminApi.promoteUserToSuperAdmin(detail.user.id, {
        admin_password: promotePassword,
        notes: promoteNotes,
      });

      setDetail(updated);
      setPromoteOpen(false);
      setPromotePassword("");
      setPromoteNotes("");
      setActionSuccess("تم تعيين المستخدم كمشرف بنجاح.");
    } catch (caught) {
      setPromoteError(caught instanceof Error ? caught.message : "تعذر تعيين المستخدم كمشرف.");
    } finally {
      setPromoteSaving(false);
    }
  }, [detail, promoteNotes, promotePassword]);

  const loadDeletePreview = useCallback(async () => {
    if (!detail) return;

    try {
      setDeletePreviewLoading(true);
      setDeleteError(null);
      setDeletePreview(await superAdminApi.getUserDeletePreview(detail.user.id));
    } catch (caught) {
      setDeletePreview(null);
      setDeleteError(caught instanceof Error ? caught.message : "تعذر تحميل معاينة الحذف.");
    } finally {
      setDeletePreviewLoading(false);
    }
  }, [detail]);

  const openDeleteDialog = useCallback(() => {
    setActionSuccess(null);
    setDeleteOpen(true);
    setDeletePreview(null);
    setDeleteError(null);
    setDeletePassword("");
    setDeleteConfirmation("");
    setDeleteNotes("");
    window.setTimeout(() => {
      void loadDeletePreview();
    }, 0);
  }, [loadDeletePreview]);

  const openSmsAction = useCallback((action: "quota" | "topup" | "toggle") => {
    if (!detail || (!detail.sms.summary?.id && detail.sms.wallets.length === 0)) return;

    setActionSuccess(null);
    setSmsActionError(null);
    setSmsAction(action);
    setSmsActionNotes("");
    setSmsActionValue(action === "quota" ? String(detail.sms.summary?.monthly_quota ?? 0) : "");
  }, [detail]);

  const closeSmsAction = useCallback(() => {
    if (smsActionSaving) return;
    setSmsAction(null);
    setSmsActionValue("");
    setSmsActionNotes("");
    setSmsActionError(null);
  }, [smsActionSaving]);

  const confirmSmsAction = useCallback(async () => {
    if (!detail || !smsAction) return;

    const walletId = detail.sms.summary?.id ?? detail.sms.wallets[0]?.id;
    if (!walletId) return;

    try {
      setSmsActionSaving(true);
      setSmsActionError(null);

      if (smsAction === "quota") {
        const quota = Number(smsActionValue);
        if (!Number.isInteger(quota) || quota < 0) throw new Error("أدخل حصة شهرية صحيحة.");
        await superAdminApi.updateSmsWallet(walletId, { monthly_quota: quota, notes: smsActionNotes });
        setActionSuccess("تم تحديث حصة الرسائل للمستخدم.");
      }

      if (smsAction === "topup") {
        const quantity = Number(smsActionValue);
        if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("عدد الرسائل المشحونة يجب أن يكون أكبر من صفر.");
        await superAdminApi.topupSmsWallet(walletId, { quantity, notes: smsActionNotes });
        setActionSuccess("تم شحن رصيد الرسائل للمستخدم.");
      }

      if (smsAction === "toggle") {
        await superAdminApi.updateSmsWallet(walletId, {
          sms_enabled: !(detail.sms.summary?.sms_enabled ?? true),
          notes: smsActionNotes,
        });
        setActionSuccess(detail.sms.summary?.sms_enabled ? "تم إيقاف الرسائل للمستخدم." : "تم تفعيل الرسائل للمستخدم.");
      }

      setSmsAction(null);
      setSmsActionValue("");
      setSmsActionNotes("");
      await loadDetail();
    } catch (caught) {
      setSmsActionError(caught instanceof Error ? caught.message : "تعذر تنفيذ إجراء الرسائل.");
    } finally {
      setSmsActionSaving(false);
    }
  }, [detail, loadDetail, smsAction, smsActionNotes, smsActionValue]);

  const closeDeleteDialog = useCallback(() => {
    if (deleteSaving) return;
    setDeleteOpen(false);
    setDeletePreview(null);
    setDeleteError(null);
    setDeletePassword("");
    setDeleteConfirmation("");
    setDeleteNotes("");
  }, [deleteSaving]);

  const confirmPermanentDelete = useCallback(async () => {
    if (!detail || deleteConfirmation !== "DELETE" || !deletePassword.trim()) return;

    try {
      setDeleteSaving(true);
      setDeleteError(null);
      const response = await superAdminApi.deleteUser(detail.user.id, {
        admin_password: deletePassword,
        confirmation_text: "DELETE",
        notes: deleteNotes,
      });

      setActionSuccess(response.message || "تم حذف الحساب نهائيًا بنجاح.");
      setDeleteOpen(false);
      window.setTimeout(() => {
        router.push("/users");
      }, 700);
    } catch (caught) {
      setDeleteError(caught instanceof Error ? caught.message : "تعذر حذف الحساب نهائيًا.");
    } finally {
      setDeleteSaving(false);
    }
  }, [deleteConfirmation, deleteNotes, deletePassword, detail, router]);

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
                  <>
                    <button type="button" className="sanad-btn" onClick={openEditDialog}>
                      تعديل البيانات
                    </button>
                    <button type="button" className="sanad-btn" onClick={openPasswordDialog}>
                      تغيير كلمة المرور
                    </button>
                    <button type="button" className="sanad-btn sanad-btn-primary" onClick={openPromoteDialog}>
                      تعيين كمشرف
                    </button>
                    <button
                      type="button"
                      className="sanad-btn border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger-700)] hover:border-[var(--danger-700)]"
                      onClick={openResetDialog}
                    >
                      تصفير بيانات الحساب
                    </button>
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
                    <button
                      type="button"
                      className="sanad-btn border-[var(--danger)] bg-[var(--danger)] text-white hover:bg-[var(--danger-700)]"
                      onClick={openDeleteDialog}
                    >
                      حذف الحساب نهائيًا
                    </button>
                  </>
                ) : null}
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

          <UserSmsCard
            messageLogs={detail.sms.message_logs}
            rechargeRequests={detail.sms.recharge_requests}
            summary={detail.sms.summary}
            transactions={detail.sms.transactions}
            walletsCount={detail.sms.wallets.length}
            onOpenAction={openSmsAction}
          />

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

      <EditUserDialog
        errorMessage={editError}
        form={editForm}
        loading={editSaving}
        open={editOpen && Boolean(detail)}
        onCancel={closeEditDialog}
        onChange={(field, value) => setEditForm((current) => ({ ...current, [field]: value } as EditUserForm))}
        onConfirm={submitEditUser}
      />

      <ChangePasswordDialog
        errorMessage={passwordError}
        form={passwordForm}
        loading={passwordSaving}
        open={passwordOpen && Boolean(detail)}
        userName={detail?.user.name ?? "المستخدم"}
        onCancel={closePasswordDialog}
        onChange={(field, value) => setPasswordForm((current) => ({ ...current, [field]: value }))}
        onConfirm={submitPasswordChange}
      />

      <PromoteDialog
        errorMessage={promoteError}
        loading={promoteSaving}
        notes={promoteNotes}
        open={promoteOpen && Boolean(detail)}
        password={promotePassword}
        userName={detail?.user.name ?? "المستخدم"}
        onCancel={closePromoteDialog}
        onConfirm={submitPromote}
        onNotesChange={setPromoteNotes}
        onPasswordChange={setPromotePassword}
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

      <PermanentDeleteDialog
        confirmationText={deleteConfirmation}
        errorMessage={deleteError}
        loading={deleteSaving}
        notes={deleteNotes}
        password={deletePassword}
        preview={deletePreview}
        previewLoading={deletePreviewLoading}
        userName={detail?.user.name ?? "المستخدم"}
        open={deleteOpen && Boolean(detail)}
        onCancel={closeDeleteDialog}
        onConfirm={confirmPermanentDelete}
        onConfirmationTextChange={setDeleteConfirmation}
        onNotesChange={setDeleteNotes}
        onPasswordChange={setDeletePassword}
      />

      <UserSmsActionDialog
        action={smsAction}
        enabled={detail?.sms.summary?.sms_enabled ?? true}
        errorMessage={smsActionError}
        loading={smsActionSaving}
        notes={smsActionNotes}
        value={smsActionValue}
        onCancel={closeSmsAction}
        onConfirm={confirmSmsAction}
        onNotesChange={setSmsActionNotes}
        onValueChange={setSmsActionValue}
      />
    </>
  );
}

type EditUserForm = {
  name: string;
  phone: string;
  email: string;
  shop_name: string;
  is_active: boolean;
  notes: string;
};

type ChangePasswordForm = {
  admin_password: string;
  password: string;
  password_confirmation: string;
};

const emptyEditUserForm: EditUserForm = {
  name: "",
  phone: "",
  email: "",
  shop_name: "",
  is_active: true,
  notes: "",
};

const emptyChangePasswordForm: ChangePasswordForm = {
  admin_password: "",
  password: "",
  password_confirmation: "",
};

function canSubmitEditUser(form: EditUserForm): boolean {
  return Boolean(form.name.trim() && isValidLocalPhone(form.phone) && form.shop_name.trim());
}

function canSubmitPasswordChange(form: ChangePasswordForm): boolean {
  return Boolean(
    form.admin_password.trim()
      && form.password.length >= 8
      && form.password === form.password_confirmation,
  );
}

function EditUserDialog({
  open,
  form,
  loading,
  errorMessage,
  onChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  form: EditUserForm;
  loading: boolean;
  errorMessage: string | null;
  onChange: (field: keyof EditUserForm, value: string | boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const canConfirm = canSubmitEditUser(form) && !loading;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,42,40,0.36)] px-4 py-6" role="presentation">
      <div aria-modal="true" className="sanad-card max-h-[92vh] w-full max-w-[640px] overflow-y-auto" role="dialog">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h3 className="text-[20px] font-bold text-[var(--text)]">تعديل البيانات</h3>
        </div>
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <DialogInput id="edit-user-name" label="الاسم" disabled={loading} value={form.name} onChange={(value) => onChange("name", value)} />
          <DialogInput id="edit-user-phone" label="رقم الجوال" disabled={loading} value={form.phone} onChange={(value) => onChange("phone", sanitizeLocalPhoneInput(value))} />
          <DialogInput id="edit-user-email" label="البريد الإلكتروني" disabled={loading} type="email" value={form.email} onChange={(value) => onChange("email", value)} optional />
          <DialogInput id="edit-user-shop" label="اسم المحل" disabled={loading} value={form.shop_name} onChange={(value) => onChange("shop_name", value)} />
          <label className="flex items-center gap-2 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[13px] font-semibold text-[var(--text)] sm:col-span-2">
            <input
              checked={form.is_active}
              className="h-4 w-4 accent-[var(--teal-700)]"
              disabled={loading}
              type="checkbox"
              onChange={(event) => onChange("is_active", event.target.checked)}
            />
            الحساب نشط
          </label>
          <div className="sm:col-span-2">
            <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="edit-user-notes">
              ملاحظات داخلية
            </label>
            <textarea
              className="mt-1 min-h-[86px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
              disabled={loading}
              id="edit-user-notes"
              maxLength={2000}
              placeholder="اختياري"
              value={form.notes}
              onChange={(event) => onChange("notes", event.target.value)}
            />
          </div>
          {errorMessage ? (
            <div className="rounded-[var(--r-md)] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--danger-700)] sm:col-span-2">
              {errorMessage}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <button className="sanad-btn justify-center" disabled={loading} type="button" onClick={onCancel}>
            إلغاء
          </button>
          <button className="sanad-btn sanad-btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60" disabled={!canConfirm} type="button" onClick={onConfirm}>
            {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordDialog({
  open,
  userName,
  form,
  loading,
  errorMessage,
  onChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  userName: string;
  form: ChangePasswordForm;
  loading: boolean;
  errorMessage: string | null;
  onChange: (field: keyof ChangePasswordForm, value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const canConfirm = canSubmitPasswordChange(form) && !loading;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,42,40,0.36)] px-4 py-6" role="presentation">
      <div aria-modal="true" className="sanad-card w-full max-w-[520px] overflow-hidden" role="dialog">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h3 className="text-[20px] font-bold text-[var(--text)]">تغيير كلمة المرور</h3>
          <p className="mt-2 text-[14.5px] leading-7 text-[var(--text-2)]">الحساب المستهدف: {userName}</p>
        </div>
        <div className="space-y-4 px-5 py-4">
          <DialogInput id="change-password-admin" label="كلمة مرور المشرف" disabled={loading} type="password" value={form.admin_password} onChange={(value) => onChange("admin_password", value)} />
          <DialogInput id="change-password-new" label="كلمة المرور الجديدة" disabled={loading} type="password" value={form.password} onChange={(value) => onChange("password", value)} />
          <DialogInput id="change-password-confirmation" label="تأكيد كلمة المرور" disabled={loading} type="password" value={form.password_confirmation} onChange={(value) => onChange("password_confirmation", value)} />
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
          <button className="sanad-btn sanad-btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60" disabled={!canConfirm} type="button" onClick={onConfirm}>
            {loading ? "جاري الحفظ..." : "تغيير كلمة المرور"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PromoteDialog({
  open,
  userName,
  password,
  notes,
  loading,
  errorMessage,
  onPasswordChange,
  onNotesChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  userName: string;
  password: string;
  notes: string;
  loading: boolean;
  errorMessage: string | null;
  onPasswordChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const canConfirm = password.trim().length > 0 && !loading;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,42,40,0.42)] px-4 py-6" role="presentation">
      <div aria-modal="true" className="sanad-card w-full max-w-[560px] overflow-hidden" role="dialog">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h3 className="text-[20px] font-bold text-[var(--text)]">تعيين المستخدم كمشرف</h3>
          <p className="mt-2 text-[14.5px] leading-7 text-[var(--text-2)]">
            سيتم منح هذا المستخدم صلاحية الدخول إلى لوحة الإدارة. هذا الإجراء حساس ويجب تأكيده بكلمة مرورك.
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[var(--muted)]">المستخدم: {userName}</p>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div className="rounded-[var(--r-md)] border border-[var(--gold-soft)] bg-[var(--gold-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--gold-700)]">
            هذا الإجراء يمنح المستخدم صلاحية الدخول إلى لوحة الإدارة.
          </div>
          <DialogInput id="detail-promote-admin-password" label="كلمة مرور المشرف الحالي" disabled={loading} type="password" value={password} onChange={onPasswordChange} />
          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="detail-promote-notes">
            ملاحظة داخلية <span className="font-normal text-[var(--muted)]">اختياري</span>
          </label>
          <textarea
            className="min-h-[86px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={loading}
            id="detail-promote-notes"
            maxLength={2000}
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
          <button className="sanad-btn sanad-btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60" disabled={!canConfirm} type="button" onClick={onConfirm}>
            {loading ? "جاري التعيين..." : "تعيين كمشرف"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PermanentDeleteDialog({
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
  preview: SuperAdminUserDeletePreview | null;
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

  const canConfirm = !previewLoading
    && !loading
    && Boolean(preview?.safe_to_delete)
    && password.trim().length > 0
    && confirmationText === "DELETE";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,42,40,0.46)] px-4 py-6" role="presentation">
      <div aria-modal="true" className="sanad-card max-h-[92vh] w-full max-w-[660px] overflow-y-auto" role="dialog">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h3 className="text-[20px] font-bold text-[var(--danger-700)]">حذف الحساب نهائيًا</h3>
          <p className="mt-2 text-[14.5px] leading-7 text-[var(--text-2)]">
            هذا الإجراء سيحذف الحساب وبياناته نهائيًا ولا يمكن التراجع عنه.
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[var(--muted)]">الحساب المستهدف: {userName}</p>
        </div>

        <div className="space-y-4 px-5 py-4">
          {previewLoading ? (
            <div className="rounded-[var(--r-md)] border border-[var(--hairline-2)] px-4 py-3 text-[14px] font-semibold text-[var(--text-2)]">
              جاري تحميل معاينة الحذف...
            </div>
          ) : preview ? (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {deleteCountRows(preview.counts).map((row) => (
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

          <DialogInput id="delete-admin-password" label="كلمة مرور المشرف" disabled={loading} type="password" value={password} onChange={onPasswordChange} />
          <DialogInput id="delete-confirmation-text" label="اكتب DELETE للتأكيد" disabled={loading} value={confirmationText} onChange={onConfirmationTextChange} mono />

          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="delete-notes">
            ملاحظات داخلية
          </label>
          <textarea
            className="min-h-[86px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={loading}
            id="delete-notes"
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
            {loading ? "جاري الحذف..." : "حذف الحساب نهائيًا"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DialogInput({
  id,
  label,
  value,
  disabled,
  onChange,
  type = "text",
  optional = false,
  mono = false,
}: {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  type?: string;
  optional?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor={id}>
      {label}
      {optional ? <span className="me-1 font-normal text-[var(--muted)]">اختياري</span> : null}
      <input
        className={`mt-1 w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--teal-700)] ${mono ? "mono-num" : ""}`}
        disabled={disabled}
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
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

function UserSmsCard({
  summary,
  walletsCount,
  messageLogs,
  transactions,
  rechargeRequests,
  onOpenAction,
}: {
  summary: SuperAdminUserDetail["sms"]["summary"];
  walletsCount: number;
  messageLogs: SmsProviderMessageLog[];
  transactions: SmsWalletTransaction[];
  rechargeRequests: SmsRechargeRequest[];
  onOpenAction: (action: "quota" | "topup" | "toggle") => void;
}) {
  if (!summary) {
    return (
      <section className="sanad-card overflow-hidden">
        <div className="sanad-card-header">
          <div>
            <h3 className="sanad-section-title">رصيد الرسائل النصية</h3>
          </div>
        </div>
        <EmptyState title="لا توجد محفظة رسائل" description="لا توجد محفظة رسائل مرتبطة بهذا المستخدم أو المحل." icon="SMS" />
      </section>
    );
  }

  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header flex-wrap">
        <div>
          <h3 className="sanad-section-title">رصيد الرسائل النصية</h3>
          <p className="sanad-section-subtitle">رصيد الرسائل والحصة الشهرية وسجل الاستخدام لهذا المستخدم / صاحب المحل.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={summary.effective_sms_enabled ? "success" : "danger"}>
            {summary.effective_sms_enabled ? "مفعلة" : "موقوفة"}
          </StatusBadge>
          {walletsCount > 1 ? <StatusBadge tone="neutral">{formatCount(walletsCount)} محافظ</StatusBadge> : null}
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <SmsMetric label="الحصة الشهرية" value={summary.monthly_quota} />
        <SmsMetric label="المستخدم هذا الشهر" value={summary.monthly_used} />
        <SmsMetric label="المتبقي من الحصة" value={summary.monthly_remaining} />
        <SmsMetric label="الإجمالي المتاح" value={summary.available_balance} strong />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-[var(--hairline-2)] px-4 py-3">
        <button className="sanad-btn h-9 px-3 text-[12.5px]" type="button" onClick={() => onOpenAction("quota")}>تعديل الحصة</button>
        <button className="sanad-btn h-9 px-3 text-[12.5px]" type="button" onClick={() => onOpenAction("topup")}>شحن رسائل</button>
        <button className="sanad-btn h-9 px-3 text-[12.5px]" type="button" onClick={() => onOpenAction("toggle")}>
          {summary.sms_enabled ? "إيقاف الرسائل" : "تفعيل الرسائل"}
        </button>
      </div>
      <div className="border-t border-[var(--hairline-2)] p-4">
        <Tabs
          tabs={[
            { key: "messages", label: "سجل الرسائل", count: messageLogs.length },
            { key: "balance", label: "سجل الرصيد", count: transactions.length },
            { key: "requests", label: "طلبات الشحن", count: rechargeRequests.length },
          ]}
        >
          {(active) =>
            active === "messages" ? (
              <UserSmsMessagesTable rows={messageLogs} />
            ) : active === "balance" ? (
              <UserSmsTransactionsTable rows={transactions} />
            ) : (
              <UserSmsRequestsTable rows={rechargeRequests} />
            )
          }
        </Tabs>
      </div>
    </section>
  );
}

function SmsMetric({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="rounded-[var(--r-md)] border border-[var(--hairline-2)] bg-[var(--paper)] px-3 py-2">
      <p className="text-[12px] font-semibold text-[var(--muted)]">{label}</p>
      <p className={`mono-num mt-1 text-[20px] font-black ${strong ? "text-[var(--teal-700)]" : "text-[var(--text)]"}`}>
        {formatCount(value)}
      </p>
    </div>
  );
}

function UserSmsMessagesTable({ rows }: { rows: SmsProviderMessageLog[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد رسائل مرسلة" description="لا توجد رسائل مسجلة لهذا المستخدم." />;
  }

  return (
    <div className="sanad-table-wrap rounded-[var(--r-md)] border border-[var(--hairline-2)]">
      <table className="sanad-table min-w-[760px]">
        <thead><tr><th>الحالة</th><th className="!text-left">الرقم</th><th>نص الرسالة</th><th className="!text-left">الكود</th><th className="!text-left">Message ID</th><th className="!text-left">التاريخ</th></tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={row.id}>
            <td><StatusBadge tone={row.success ? "success" : "danger"}>{row.success ? "تم" : "فشل"}</StatusBadge></td>
            <td className="!text-left"><span className="mono-num">{row.mobile || "—"}</span></td>
            <td className="max-w-[260px] truncate" title={row.message_text}>{row.message_text || "—"}</td>
            <td className="!text-left"><span className="mono-num">{row.provider_code || "—"}</span></td>
            <td className="!text-left"><span className="mono-num">{row.provider_message_id || "—"}</span></td>
            <td className="!text-left text-[12px] text-[var(--muted)]"><span className="mono-num">{formatDate(row.sent_at ?? row.created_at)}</span></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function UserSmsTransactionsTable({ rows }: { rows: SmsWalletTransaction[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد حركات رصيد" description="لم يتم تسجيل حركات على رصيد الرسائل." />;
  }

  return (
    <div className="sanad-table-wrap rounded-[var(--r-md)] border border-[var(--hairline-2)]">
      <table className="sanad-table min-w-[760px]">
        <thead>
          <tr>
            <th>النوع</th>
            <th className="!text-center">التغيير</th>
            <th className="!text-center">المتاح قبل</th>
            <th className="!text-center">المتاح بعد</th>
            <th>المشرف</th>
            <th className="!text-left">التاريخ</th>
          </tr>
        </thead>
        <tbody>{rows.map((row) => (
          <tr key={row.id}>
            <td>{smsTransactionLabel(row.type)}</td>
            <td className="!text-center"><SmsChangeCell row={row} /></td>
            <td className="!text-center"><span className="mono-num">{row.balance_before === null ? "—" : formatCount(row.balance_before)}</span></td>
            <td className="!text-center"><span className="mono-num">{row.balance_after === null ? "—" : formatCount(row.balance_after)}</span></td>
            <td>{row.performed_by_admin?.name ?? row.performed_by_user?.name ?? "—"}</td>
            <td className="!text-left text-[12px] text-[var(--muted)]"><span className="mono-num">{formatDate(row.created_at)}</span></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function SmsChangeCell({ row }: { row: SmsWalletTransaction }) {
  const quotaChanged =
    row.monthly_quota_before !== null &&
    row.monthly_quota_after !== null &&
    row.monthly_quota_before !== row.monthly_quota_after;

  return (
    <>
      <span className={`mono-num font-semibold ${smsChangeTone(row.quantity)}`}>{formatSmsChange(row.quantity)}</span>
      {quotaChanged ? (
        <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
          الحصة: <span className="mono-num">{formatCount(row.monthly_quota_before as number)}</span>
          {" ← "}
          <span className="mono-num">{formatCount(row.monthly_quota_after as number)}</span>
        </span>
      ) : null}
    </>
  );
}

function formatSmsChange(quantity: number): string {
  if (quantity > 0) return `+${formatCount(quantity)}`;
  if (quantity < 0) return `-${formatCount(Math.abs(quantity))}`;
  return "—";
}

function smsChangeTone(quantity: number): string {
  if (quantity > 0) return "text-[var(--teal-700)]";
  if (quantity < 0) return "text-[var(--danger-700)]";
  return "text-[var(--muted)]";
}

function UserSmsRequestsTable({ rows }: { rows: SmsRechargeRequest[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد طلبات شحن" description="لا توجد طلبات شحن لهذا المستخدم." />;
  }

  return (
    <div className="sanad-table-wrap rounded-[var(--r-md)] border border-[var(--hairline-2)]">
      <table className="sanad-table min-w-[640px]">
        <thead><tr><th className="!text-center">الكمية المطلوبة</th><th>الحالة</th><th>ملاحظة المستخدم</th><th>رد الإدارة</th><th className="!text-left">التاريخ</th></tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={row.id}>
            <td className="!text-center"><span className="mono-num">{formatCount(row.requested_quantity)}</span></td>
            <td><StatusBadge tone={smsRequestTone(row.status)}>{smsRequestLabel(row.status)}</StatusBadge></td>
            <td className="max-w-[220px] truncate">{row.notes ?? "—"}</td>
            <td className="max-w-[220px] truncate">{row.admin_notes ?? "—"}</td>
            <td className="!text-left text-[12px] text-[var(--muted)]"><span className="mono-num">{formatDate(row.created_at)}</span></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function UserSmsActionDialog({
  action,
  enabled,
  value,
  notes,
  loading,
  errorMessage,
  onValueChange,
  onNotesChange,
  onCancel,
  onConfirm,
}: {
  action: "quota" | "topup" | "toggle" | null;
  enabled: boolean;
  value: string;
  notes: string;
  loading: boolean;
  errorMessage: string | null;
  onValueChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!action) return null;

  const needsValue = action !== "toggle";
  const title = action === "quota" ? "تعديل الحصة الشهرية" : action === "topup" ? "شحن رسائل" : (enabled ? "إيقاف الرسائل" : "تفعيل الرسائل");
  const canConfirm = !loading && (!needsValue || Number(value) >= 0);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,42,40,0.36)] px-4 py-6" role="presentation">
      <div aria-modal="true" className="sanad-card w-full max-w-[520px] overflow-hidden" role="dialog">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h3 className="text-[20px] font-bold text-[var(--text)]">{title}</h3>
        </div>
        <div className="space-y-4 px-5 py-4">
          {needsValue ? (
            <DialogInput
              id="sms-action-value"
              label={action === "quota" ? "الحصة الشهرية" : "عدد الرسائل المشحونة"}
              disabled={loading}
              type="number"
              value={value}
              onChange={onValueChange}
              mono
            />
          ) : null}
          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="sms-action-notes">
            ملاحظات
            <textarea
              className="mt-1 min-h-[86px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
              disabled={loading}
              id="sms-action-notes"
              maxLength={2000}
              placeholder="اختياري"
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
            />
          </label>
          {errorMessage ? (
            <div className="rounded-[var(--r-md)] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--danger-700)]">
              {errorMessage}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <button className="sanad-btn justify-center" disabled={loading} type="button" onClick={onCancel}>إلغاء</button>
          <button className="sanad-btn sanad-btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60" disabled={!canConfirm} type="button" onClick={onConfirm}>
            {loading ? "جاري الحفظ..." : "تأكيد"}
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

function smsTransactionLabel(type?: string | null): string {
  const labels: Record<string, string> = {
    monthly_reset: "تجديد شهري",
    monthly_quota_update: "تحديث الحصة",
    monthly_usage: "استخدام",
    topup: "شحن",
    bulk_topup: "شحن جماعي",
    manual_adjustment: "تعديل يدوي",
    campaign_reserve: "حجز حملة",
    campaign_debit: "خصم حملة",
    campaign_refund: "استرجاع حملة",
    sms_disabled: "إيقاف الرسائل",
    sms_enabled: "تفعيل الرسائل",
  };

  return type ? labels[type] ?? type : "-";
}

function smsRequestLabel(status?: string | null): string {
  const labels: Record<string, string> = {
    pending: "قيد المراجعة",
    approved: "مقبول",
    rejected: "مرفوض",
    cancelled: "ملغي",
  };

  return status ? labels[status] ?? status : "-";
}

function smsRequestTone(status?: string | null): StatusTone {
  if (status === "approved") return "success";
  if (status === "rejected" || status === "cancelled") return "danger";
  return "warning";
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

function deleteCountRows(counts: Record<string, number>): { key: string; label: string; value: number }[] {
  const labels: Record<string, string> = {
    user: "الحساب",
    shops: "المحلات",
    shop_memberships: "عضويات المحلات",
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
    reminder_settings: "التذكيرات",
    auth_otp_codes: "أكواد OTP",
    password_reset_verifications: "تحققات كلمة المرور",
    personal_access_tokens: "جلسات الدخول",
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
