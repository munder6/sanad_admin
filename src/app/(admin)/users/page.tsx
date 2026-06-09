"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { FilterChip } from "@/components/filters/FilterChip";
import { SearchInput } from "@/components/filters/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ApiError } from "@/lib/api/apiClient";
import {
  superAdminApi,
  type SuperAdminPaginationMeta,
  type SuperAdminUser,
  type SuperAdminUsersParams,
} from "@/lib/api/superAdminApi";
import { formatArabicDateTime } from "@/lib/formatters/date";
import { isValidLocalPhone, sanitizeLocalPhoneInput } from "@/lib/formatters/number";

const perPage = 10;

type UserFilter = {
  label: string;
  params: Pick<SuperAdminUsersParams, "status" | "is_super_admin" | "is_suspended">;
};

const filters: UserFilter[] = [
  { label: "الكل", params: {} },
  { label: "المشرفون العامون", params: { is_super_admin: true } },
  { label: "المستخدمون العاديون", params: { is_super_admin: false } },
  { label: "النشطون", params: { status: "active" } },
  { label: "المجمّدون", params: { is_suspended: true } },
];

const emptyMeta: SuperAdminPaginationMeta = {
  current_page: 1,
  per_page: perPage,
  total: 0,
  last_page: 1,
};

export default function UsersPage() {
  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [meta, setMeta] = useState<SuperAdminPaginationMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [actionUser, setActionUser] = useState<SuperAdminUser | null>(null);
  const [actionType, setActionType] = useState<"suspend" | "unsuspend" | "promote" | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspensionMessage, setSuspensionMessage] = useState("");
  const [promotePassword, setPromotePassword] = useState("");
  const [promoteNotes, setPromoteNotes] = useState("");
  const [actionSaving, setActionSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserForm>(emptyCreateUserForm);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [openActionsMenu, setOpenActionsMenu] = useState<{
    userId: number;
    top: number;
    left: number;
  } | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      const response = await superAdminApi.getUsers({
        search: search.trim(),
        page,
        per_page: perPage,
        sort: "newest",
        ...filters[activeFilter].params,
      });
      setUsers(response.users);
      setMeta(response.meta);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل المستخدمين.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadUsers();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  useEffect(() => {
    if (!openActionsMenu) return;

    const closeMenu = () => setOpenActionsMenu(null);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("click", closeMenu);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [openActionsMenu]);

  const closeAction = useCallback(() => {
    if (actionSaving) return;
    setActionUser(null);
    setActionType(null);
    setSuspendReason("");
    setSuspensionMessage("");
    setPromotePassword("");
    setPromoteNotes("");
    setActionError(null);
  }, [actionSaving]);

  const refreshActionUser = useCallback((updatedId: number, isSuspended: boolean, reason?: string | null, message?: string | null) => {
    setUsers((current) => current.map((user) => (
      user.id === updatedId
        ? {
            ...user,
            is_suspended: isSuspended,
            suspended_reason: reason ?? null,
            suspension_message: message ?? null,
            suspended_at: isSuspended ? new Date().toISOString() : null,
          }
        : user
    )));
  }, []);

  const confirmAction = useCallback(async () => {
    if (!actionUser || !actionType) return;

    try {
      setActionSaving(true);
      setActionError(null);

      if (actionType === "promote") {
        if (!promotePassword.trim()) {
          setActionError("كلمة مرور المشرف الحالي مطلوبة.");
          return;
        }

        const detail = await superAdminApi.promoteUserToSuperAdmin(actionUser.id, {
          admin_password: promotePassword,
          notes: promoteNotes,
        });

        setUsers((current) => current.map((user) => (
          user.id === detail.user.id
            ? {
                ...user,
                is_super_admin: true,
                role: "super_admin",
              }
            : user
        )));
        setActionSuccess("تم تعيين المستخدم كمشرف بنجاح.");
        setActionUser(null);
        setActionType(null);
        setPromotePassword("");
        setPromoteNotes("");
        setActionError(null);
        await loadUsers();
        return;
      }

      const detail = actionType === "suspend"
        ? await superAdminApi.suspendUser(actionUser.id, {
            reason: suspendReason,
            suspension_message: suspensionMessage,
          })
        : await superAdminApi.unsuspendUser(actionUser.id);

      refreshActionUser(detail.user.id, Boolean(detail.user.is_suspended), detail.user.suspended_reason, detail.user.suspension_message);
      setActionSuccess(actionType === "suspend" ? "تم إيقاف الحساب مؤقتًا." : "تم تفعيل الحساب.");
      setActionUser(null);
      setActionType(null);
      setSuspendReason("");
      setSuspensionMessage("");
      setPromotePassword("");
      setPromoteNotes("");
      setActionError(null);
      await loadUsers();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "تعذر تنفيذ الإجراء.");
    } finally {
      setActionSaving(false);
    }
  }, [actionType, actionUser, loadUsers, promoteNotes, promotePassword, refreshActionUser, suspendReason, suspensionMessage]);

  const closeCreateDialog = useCallback(() => {
    if (createSaving) return;
    setCreateOpen(false);
    setCreateForm(emptyCreateUserForm);
    setCreateError(null);
  }, [createSaving]);

  const submitCreateUser = useCallback(async () => {
    if (!canSubmitCreateUser(createForm)) {
      setCreateError("رقم الجوال يجب أن يكون 10 أرقام ويبدأ بصفر، مع تعبئة باقي الحقول المطلوبة.");
      return;
    }

    try {
      setCreateSaving(true);
      setCreateError(null);
      await superAdminApi.createUser(createForm);
      setCreateOpen(false);
      setCreateForm(emptyCreateUserForm);
      setActionSuccess("تم إنشاء المستخدم بنجاح.");
      setPage(1);
      await loadUsers();
    } catch (caught) {
      setCreateError(caught instanceof Error ? caught.message : "تعذر إنشاء المستخدم.");
    } finally {
      setCreateSaving(false);
    }
  }, [createForm, loadUsers]);

  const selectedActionsUser = openActionsMenu
    ? users.find((user) => user.id === openActionsMenu.userId) ?? null
    : null;

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>الإدارة / المستخدمون</p>
          <h2>المستخدمون</h2>
          <p>إدارة ومراقبة حسابات منصة سند</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="sanad-btn sanad-btn-primary"
            onClick={() => {
              setActionSuccess(null);
              setCreateError(null);
              setCreateOpen(true);
            }}
          >
            <Plus size={17} strokeWidth={2.2} />
            إضافة مستخدم
          </button>
          <StatusBadge tone="teal">تحكم الحسابات</StatusBadge>
        </div>
      </div>

      <section className="sanad-card overflow-hidden">
        <div className="sanad-card-header flex-wrap">
          <div>
            <h3 className="sanad-section-title">سجل المستخدمين</h3>
            <p className="sanad-section-subtitle">بحث ومراقبة وتجميد حسابات مستخدمي التطبيق الحقيقيين.</p>
          </div>
          <SearchInput
            placeholder="بحث بالاسم أو الهاتف أو البريد..."
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>

        {actionSuccess ? (
          <div className="mx-4 mb-3 rounded-[var(--r-md)] border border-[var(--success-soft)] bg-[var(--success-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--success-700)]">
            {actionSuccess}
          </div>
        ) : null}

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
            <LoadingState label="جاري تحميل المستخدمين..." />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState
              title={forbidden ? "وصول غير مسموح" : "تعذر تحميل المستخدمين"}
              message={error}
              onRetry={loadUsers}
            />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="لا توجد حسابات مطابقة"
            description="جرّب تعديل البحث أو اختيار فلتر مختلف."
          />
        ) : (
          <>
            <div className="sanad-table-wrap">
              <table className="sanad-table">
                <thead>
                  <tr>
                    <th>المستخدم</th>
                    <th>رقم الهاتف</th>
                    <th>الحالة</th>
                    <th>الصلاحية</th>
                    <th>المحل الحالي</th>
                    <th>حالة الرسائل</th>
                    <th className="!text-center">المتاح</th>
                    <th className="!text-center">عدد المحلات</th>
                    <th className="!text-center">عدد الحركات</th>
                    <th className="!text-center">أوامر AI</th>
                    <th className="!text-left">آخر نشاط</th>
                    <th className="!text-left">تاريخ الإنشاء</th>
                    <th className="!text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-[var(--cream-2)]"
                    >
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-9 w-9 place-items-center rounded-[9px] border border-[var(--hairline)] bg-[linear-gradient(135deg,var(--teal-50),var(--cream))] text-[13px] font-semibold text-[var(--teal-700)]">
                            {(user.name || "س").slice(0, 1)}
                          </span>
                          <div>
                            <p className="font-medium text-[var(--text)]">{user.name || "مستخدم بدون اسم"}</p>
                            <p className="mono-num mt-0.5 text-[11.5px] text-[var(--muted)]">{user.email ?? "لا يوجد بريد"}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="mono-num">{user.phone ?? "-"}</span></td>
                      <td>
                        <StatusBadge tone={user.is_suspended ? "danger" : "success"}>
                          {user.is_suspended ? "مجمّد" : "نشط"}
                        </StatusBadge>
                      </td>
                      <td><StatusBadge tone={user.is_super_admin ? "gold" : "neutral"}>{roleLabel(user)}</StatusBadge></td>
                      <td>{user.current_shop?.name ?? "-"}</td>
                      <td>
                        <StatusBadge tone={user.sms_wallet?.effective_sms_enabled === false ? "danger" : "success"}>
                          {user.sms_wallet?.effective_sms_enabled === false ? "موقوفة" : "مفعلة"}
                        </StatusBadge>
                      </td>
                      <td className="!text-center">
                        <span className="mono-num">{formatCount(user.sms_wallet?.available_balance ?? 0)}</span>
                      </td>
                      <td className="!text-center"><span className="mono-num">{formatCount(user.shops_count ?? 0)}</span></td>
                      <td className="!text-center"><span className="mono-num">{formatCount(user.ledger_entries_count ?? 0)}</span></td>
                      <td className="!text-center"><span className="mono-num">{formatCount(user.ai_commands_count ?? 0)}</span></td>
                      <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(user.last_activity_at)}</span></td>
                      <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(user.created_at)}</span></td>
                      <td className="!text-left">
                        <button
                          type="button"
                          aria-label="إجراءات المستخدم"
                          aria-expanded={openActionsMenu?.userId === user.id}
                          className="sanad-action-menu-trigger"
                          onClick={(event) => {
                            event.stopPropagation();
                            const rect = event.currentTarget.getBoundingClientRect();
                            const menuWidth = 190;
                            setOpenActionsMenu((current) => (
                              current?.userId === user.id
                                ? null
                                : {
                                    userId: user.id,
                                    top: rect.bottom + 8,
                                    left: Math.max(12, rect.right - menuWidth),
                                  }
                            ));
                          }}
                        >
                          <MoreHorizontal size={18} strokeWidth={2.2} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedActionsUser ? (
              <div
                className="sanad-action-menu"
                role="menu"
                style={{ top: openActionsMenu?.top ?? 0, left: openActionsMenu?.left ?? 0 }}
                onClick={(event) => event.stopPropagation()}
              >
                <Link
                  href={`/users/details?id=${selectedActionsUser.id}`}
                  className="sanad-action-menu-item"
                  role="menuitem"
                  onClick={() => setOpenActionsMenu(null)}
                >
                  عرض التفاصيل
                </Link>
                {!selectedActionsUser.is_super_admin ? (
                  <button
                    type="button"
                    className="sanad-action-menu-item"
                    role="menuitem"
                    onClick={() => {
                      setOpenActionsMenu(null);
                      setActionSuccess(null);
                      setActionError(null);
                      setActionUser(selectedActionsUser);
                      setActionType("promote");
                      setPromotePassword("");
                      setPromoteNotes("");
                    }}
                  >
                    تعيين كمشرف
                  </button>
                ) : (
                  <button
                    type="button"
                    className="sanad-action-menu-item cursor-not-allowed opacity-60"
                    disabled
                    role="menuitem"
                  >
                    مشرف بالفعل
                  </button>
                )}
                {!selectedActionsUser.is_super_admin ? (
                  <button
                    type="button"
                    className={`sanad-action-menu-item ${selectedActionsUser.is_suspended ? "" : "is-danger"}`}
                    role="menuitem"
                    onClick={() => {
                      setOpenActionsMenu(null);
                      setActionSuccess(null);
                      setActionUser(selectedActionsUser);
                      setActionType(selectedActionsUser.is_suspended ? "unsuspend" : "suspend");
                      setSuspendReason(selectedActionsUser.suspended_reason ?? "");
                      setSuspensionMessage(selectedActionsUser.suspension_message ?? "");
                    }}
                  >
                    {selectedActionsUser.is_suspended ? "تفعيل الحساب" : "تجميد الحساب"}
                  </button>
                ) : null}
              </div>
            ) : null}

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

      <SuspendDialog
        errorMessage={actionError}
        loading={actionSaving}
        open={actionType === "suspend" && Boolean(actionUser)}
        reason={suspendReason}
        suspensionMessage={suspensionMessage}
        userName={actionUser?.name ?? "المستخدم"}
        onCancel={closeAction}
        onConfirm={confirmAction}
        onReasonChange={setSuspendReason}
        onSuspensionMessageChange={setSuspensionMessage}
      />

      <ConfirmDialog
        open={actionType === "unsuspend" && Boolean(actionUser)}
        title="تفعيل الحساب؟"
        body={`سيتم السماح للحساب "${actionUser?.name ?? "المستخدم"}" باستخدام التطبيق مرة أخرى.`}
        confirmLabel="تفعيل الحساب"
        loading={actionSaving}
        onCancel={closeAction}
        onConfirm={confirmAction}
      />

      <PromoteDialog
        errorMessage={actionError}
        loading={actionSaving}
        notes={promoteNotes}
        open={actionType === "promote" && Boolean(actionUser)}
        password={promotePassword}
        userName={actionUser?.name ?? "المستخدم"}
        onCancel={closeAction}
        onConfirm={confirmAction}
        onNotesChange={setPromoteNotes}
        onPasswordChange={setPromotePassword}
      />

      <CreateUserDialog
        errorMessage={createError}
        form={createForm}
        loading={createSaving}
        open={createOpen}
        onCancel={closeCreateDialog}
        onChange={(field, value) => setCreateForm((current) => ({ ...current, [field]: value }))}
        onConfirm={submitCreateUser}
      />
    </>
  );
}

type CreateUserForm = {
  name: string;
  phone: string;
  email: string;
  password: string;
  password_confirmation: string;
  shop_name: string;
  notes: string;
};

const emptyCreateUserForm: CreateUserForm = {
  name: "",
  phone: "",
  email: "",
  password: "",
  password_confirmation: "",
  shop_name: "",
  notes: "",
};

function canSubmitCreateUser(form: CreateUserForm): boolean {
  return Boolean(
    form.name.trim()
      && form.phone.trim()
      && isValidLocalPhone(form.phone)
      && form.shop_name.trim()
      && form.password.length >= 8
      && form.password === form.password_confirmation,
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
          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="promote-admin-password">
            كلمة مرور المشرف الحالي
          </label>
          <input
            className="w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={loading}
            id="promote-admin-password"
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />

          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="promote-notes">
            ملاحظة داخلية <span className="font-normal text-[var(--muted)]">اختياري</span>
          </label>
          <textarea
            className="min-h-[86px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={loading}
            id="promote-notes"
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

function CreateUserDialog({
  open,
  form,
  loading,
  errorMessage,
  onChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  form: CreateUserForm;
  loading: boolean;
  errorMessage: string | null;
  onChange: (field: keyof CreateUserForm, value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const canConfirm = canSubmitCreateUser(form) && !loading;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,42,40,0.36)] px-4 py-6" role="presentation">
      <div aria-modal="true" className="sanad-card max-h-[92vh] w-full max-w-[640px] overflow-y-auto" role="dialog">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h3 className="text-[20px] font-bold text-[var(--text)]">إنشاء حساب جديد</h3>
          <p className="mt-2 text-[14.5px] leading-7 text-[var(--text-2)]">
            سيتم إنشاء المستخدم كحساب تطبيق نشط وموثق من الإدارة.
          </p>
        </div>

        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <FormInput id="create-user-name" label="الاسم" disabled={loading} value={form.name} onChange={(value) => onChange("name", value)} />
          <FormInput id="create-user-phone" label="رقم الجوال" disabled={loading} value={form.phone} onChange={(value) => onChange("phone", sanitizeLocalPhoneInput(value))} />
          <FormInput id="create-user-email" label="البريد الإلكتروني" disabled={loading} type="email" value={form.email} onChange={(value) => onChange("email", value)} optional />
          <FormInput id="create-user-shop" label="اسم المحل" disabled={loading} value={form.shop_name} onChange={(value) => onChange("shop_name", value)} />
          <FormInput id="create-user-password" label="كلمة المرور" disabled={loading} type="password" value={form.password} onChange={(value) => onChange("password", value)} />
          <FormInput id="create-user-password-confirmation" label="تأكيد كلمة المرور" disabled={loading} type="password" value={form.password_confirmation} onChange={(value) => onChange("password_confirmation", value)} />
          <div className="sm:col-span-2">
            <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="create-user-notes">
              ملاحظات داخلية
            </label>
            <textarea
              className="mt-1 min-h-[86px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
              disabled={loading}
              id="create-user-notes"
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
            {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormInput({
  id,
  label,
  value,
  disabled,
  onChange,
  type = "text",
  optional = false,
}: {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  type?: string;
  optional?: boolean;
}) {
  return (
    <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor={id}>
      {label}
      {optional ? <span className="me-1 font-normal text-[var(--muted)]">اختياري</span> : null}
      <input
        className="mt-1 w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
        disabled={disabled}
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
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
          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="suspend-reason">
            سبب الإيقاف الداخلي
          </label>
          <textarea
            className="min-h-[92px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={loading}
            id="suspend-reason"
            maxLength={2000}
            placeholder="اختياري"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
          />
          <p className="-mt-3 text-[12.5px] leading-6 text-[var(--muted)]">يظهر للإدارة فقط.</p>
          <label className="block text-[13px] font-semibold text-[var(--text)]" htmlFor="suspension-message">
            النص الذي يظهر للمستخدم
          </label>
          <textarea
            className="min-h-[110px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={loading}
            id="suspension-message"
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

function roleLabel(user: SuperAdminUser): string {
  if (user.is_super_admin) return "مشرف عام";

  const labels: Record<string, string> = {
    owner: "مالك محل",
    admin: "مدير محل",
    staff: "موظف",
    user: "مستخدم",
  };

  return user.role ? labels[user.role] ?? "مستخدم" : "مستخدم";
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDateTime(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
