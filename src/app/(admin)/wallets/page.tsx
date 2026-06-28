"use client";

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
  type SuperAdminWallet,
  type SuperAdminWalletsParams,
} from "@/lib/api/superAdminApi";
import { formatArabicDateTime } from "@/lib/formatters/date";

const perPage = 20;

type WalletFilter = {
  label: string;
  params: Pick<SuperAdminWalletsParams, "is_active">;
};

const filters: WalletFilter[] = [
  { label: "الكل", params: {} },
  { label: "النشطة", params: { is_active: 1 } },
  { label: "المجمّدة", params: { is_active: 0 } },
];

const emptyMeta: SuperAdminPaginationMeta = {
  current_page: 1,
  per_page: perPage,
  total: 0,
  last_page: 1,
};

export default function WalletsPage() {
  const [wallets, setWallets] = useState<SuperAdminWallet[]>([]);
  const [meta, setMeta] = useState<SuperAdminPaginationMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<WalletForm>(emptyWalletForm);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editWallet, setEditWallet] = useState<SuperAdminWallet | null>(null);
  const [editForm, setEditForm] = useState<WalletForm>(emptyWalletForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [toggleWallet, setToggleWallet] = useState<SuperAdminWallet | null>(null);
  const [toggleSaving, setToggleSaving] = useState(false);

  const [openActionsMenu, setOpenActionsMenu] = useState<{
    walletId: number;
    top: number;
    left: number;
  } | null>(null);

  const loadWallets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);
      const response = await superAdminApi.getWallets({
        search: search.trim(),
        page,
        per_page: perPage,
        ...filters[activeFilter].params,
      });
      setWallets(response.wallets);
      setMeta(response.meta);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setForbidden(true);
      }
      setError(caught instanceof Error ? caught.message : "تعذر تحميل المحافظ.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadWallets();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadWallets]);

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

  const openCreate = useCallback(() => {
    setSuccess(null);
    setActionError(null);
    setCreateError(null);
    setCreateForm(emptyWalletForm);
    setCreateOpen(true);
  }, []);

  const closeCreate = useCallback(() => {
    if (createSaving) return;
    setCreateOpen(false);
    setCreateForm(emptyWalletForm);
    setCreateError(null);
  }, [createSaving]);

  const submitCreate = useCallback(async () => {
    if (!canSubmitWallet(createForm)) {
      setCreateError("اسم المحفظة مطلوب.");
      return;
    }

    try {
      setCreateSaving(true);
      setCreateError(null);
      await superAdminApi.createWallet({
        name_ar: createForm.name_ar,
        sort_order: parseSortOrder(createForm.sort_order),
      });
      setCreateOpen(false);
      setCreateForm(emptyWalletForm);
      setSuccess("تم إنشاء المحفظة بنجاح.");
      setPage(1);
      await loadWallets();
    } catch (caught) {
      setCreateError(caught instanceof Error ? caught.message : "تعذر إنشاء المحفظة.");
    } finally {
      setCreateSaving(false);
    }
  }, [createForm, loadWallets]);

  const openEdit = useCallback((wallet: SuperAdminWallet) => {
    setSuccess(null);
    setActionError(null);
    setEditError(null);
    setEditWallet(wallet);
    setEditForm({ name_ar: wallet.name_ar, sort_order: String(wallet.sort_order) });
  }, []);

  const closeEdit = useCallback(() => {
    if (editSaving) return;
    setEditWallet(null);
    setEditError(null);
  }, [editSaving]);

  const submitEdit = useCallback(async () => {
    if (!editWallet) return;

    if (!canSubmitWallet(editForm)) {
      setEditError("اسم المحفظة مطلوب.");
      return;
    }

    try {
      setEditSaving(true);
      setEditError(null);
      await superAdminApi.updateWallet(editWallet.id, {
        name_ar: editForm.name_ar,
        sort_order: parseSortOrder(editForm.sort_order),
      });
      setEditWallet(null);
      setSuccess("تم تحديث المحفظة.");
      await loadWallets();
    } catch (caught) {
      setEditError(caught instanceof Error ? caught.message : "تعذر تحديث المحفظة.");
    } finally {
      setEditSaving(false);
    }
  }, [editForm, editWallet, loadWallets]);

  const confirmToggle = useCallback(async () => {
    if (!toggleWallet) return;

    const freezing = toggleWallet.is_active;

    try {
      setToggleSaving(true);
      setActionError(null);
      await superAdminApi.updateWallet(toggleWallet.id, { is_active: !freezing });
      setToggleWallet(null);
      setSuccess(freezing ? "تم تجميد المحفظة." : "تم تفعيل المحفظة.");
      await loadWallets();
    } catch (caught) {
      setToggleWallet(null);
      setActionError(caught instanceof Error ? caught.message : "تعذر تنفيذ الإجراء.");
    } finally {
      setToggleSaving(false);
    }
  }, [loadWallets, toggleWallet]);

  const selectedActionsWallet = openActionsMenu
    ? wallets.find((wallet) => wallet.id === openActionsMenu.walletId) ?? null
    : null;

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>العمليات / المحافظ</p>
          <h2>المحافظ</h2>
          <p>كتالوج المحافظ البنكية المتاح لجميع المحلات</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="sanad-btn sanad-btn-primary" onClick={openCreate}>
            <Plus size={17} strokeWidth={2.2} />
            إضافة محفظة
          </button>
          <StatusBadge tone="teal">كتالوج عام</StatusBadge>
        </div>
      </div>

      <section className="sanad-card overflow-hidden">
        <div className="sanad-card-header flex-wrap">
          <div>
            <h3 className="sanad-section-title">سجل المحافظ</h3>
            <p className="sanad-section-subtitle">
              التجميد يخفي المحفظة من الإدخال الجديد لدى جميع المحلات فقط — القيود والتقارير السابقة لا تتأثر.
            </p>
          </div>
          <SearchInput
            placeholder="بحث باسم المحفظة..."
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>

        {success ? (
          <div className="mx-4 mb-3 rounded-[var(--r-md)] border border-[var(--success-soft)] bg-[var(--success-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--success-700)]">
            {success}
          </div>
        ) : null}

        {actionError ? (
          <div className="mx-4 mb-3 rounded-[var(--r-md)] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--danger-700)]">
            {actionError}
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
            <LoadingState label="جاري تحميل المحافظ..." />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState
              title={forbidden ? "وصول غير مسموح" : "تعذر تحميل المحافظ"}
              message={error}
              onRetry={loadWallets}
            />
          </div>
        ) : wallets.length === 0 ? (
          <EmptyState
            title="لا توجد محافظ مطابقة"
            description="جرّب تعديل البحث أو أضف محفظة جديدة."
          />
        ) : (
          <>
            <div className="sanad-table-wrap">
              <table className="sanad-table">
                <thead>
                  <tr>
                    <th>المحفظة</th>
                    <th>الحالة</th>
                    <th className="!text-center">الترتيب</th>
                    <th className="!text-center">عدد القيود</th>
                    <th className="!text-left">تاريخ الإنشاء</th>
                    <th className="!text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet) => (
                    <tr key={wallet.id} className="transition hover:bg-[var(--cream-2)]">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-9 w-9 place-items-center rounded-[9px] border border-[var(--hairline)] bg-[linear-gradient(135deg,var(--teal-50),var(--cream))] text-[13px] font-semibold text-[var(--teal-700)]">
                            {(wallet.name_ar || "م").slice(0, 1)}
                          </span>
                          <div>
                            <p className="font-medium text-[var(--text)]">{wallet.name_ar || "محفظة بدون اسم"}</p>
                            <p className="mono-num mt-0.5 text-[11.5px] text-[var(--muted)]">#{wallet.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge tone={wallet.is_active ? "success" : "danger"}>
                          {wallet.is_active ? "نشطة" : "مجمّدة"}
                        </StatusBadge>
                      </td>
                      <td className="!text-center"><span className="mono-num">{formatCount(wallet.sort_order)}</span></td>
                      <td className="!text-center"><span className="mono-num">{formatCount(wallet.entries_count)}</span></td>
                      <td className="!text-left"><span className="mono-num text-[12px] text-[var(--muted)]">{formatDate(wallet.created_at)}</span></td>
                      <td className="!text-left">
                        <button
                          type="button"
                          aria-label="إجراءات المحفظة"
                          aria-expanded={openActionsMenu?.walletId === wallet.id}
                          className="sanad-action-menu-trigger"
                          onClick={(event) => {
                            event.stopPropagation();
                            const rect = event.currentTarget.getBoundingClientRect();
                            const menuWidth = 190;
                            setOpenActionsMenu((current) => (
                              current?.walletId === wallet.id
                                ? null
                                : {
                                    walletId: wallet.id,
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

            {selectedActionsWallet ? (
              <div
                className="sanad-action-menu"
                role="menu"
                style={{ top: openActionsMenu?.top ?? 0, left: openActionsMenu?.left ?? 0 }}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="sanad-action-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setOpenActionsMenu(null);
                    openEdit(selectedActionsWallet);
                  }}
                >
                  تعديل
                </button>
                <button
                  type="button"
                  className={`sanad-action-menu-item ${selectedActionsWallet.is_active ? "is-danger" : ""}`}
                  role="menuitem"
                  onClick={() => {
                    setOpenActionsMenu(null);
                    setSuccess(null);
                    setActionError(null);
                    setToggleWallet(selectedActionsWallet);
                  }}
                >
                  {selectedActionsWallet.is_active ? "تجميد المحفظة" : "تفعيل المحفظة"}
                </button>
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

      <WalletFormDialog
        confirmLabel="إنشاء محفظة"
        errorMessage={createError}
        form={createForm}
        loading={createSaving}
        open={createOpen}
        savingLabel="جاري الإنشاء..."
        subtitle="ستتاح المحفظة الجديدة للإدخال البنكي لدى جميع المحلات."
        title="إضافة محفظة جديدة"
        onCancel={closeCreate}
        onChange={(field, value) => setCreateForm((current) => ({ ...current, [field]: value }))}
        onConfirm={submitCreate}
      />

      <WalletFormDialog
        confirmLabel="حفظ التعديلات"
        errorMessage={editError}
        form={editForm}
        loading={editSaving}
        open={Boolean(editWallet)}
        savingLabel="جاري الحفظ..."
        subtitle="تعديل اسم المحفظة وترتيب عرضها في الكتالوج."
        title="تعديل المحفظة"
        onCancel={closeEdit}
        onChange={(field, value) => setEditForm((current) => ({ ...current, [field]: value }))}
        onConfirm={submitEdit}
      />

      <ConfirmDialog
        open={Boolean(toggleWallet)}
        tone={toggleWallet?.is_active ? "danger" : "primary"}
        title={toggleWallet?.is_active ? "تجميد المحفظة؟" : "تفعيل المحفظة؟"}
        body={toggleWallet?.is_active
          ? `لن تظهر المحفظة "${toggleWallet?.name_ar ?? ""}" للإدخال الجديد لدى جميع المحلات. القيود والأرصدة والتقارير السابقة لا تتأثر.`
          : `ستتاح المحفظة "${toggleWallet?.name_ar ?? ""}" للإدخال الجديد لدى جميع المحلات.`}
        confirmLabel={toggleWallet?.is_active ? "تجميد المحفظة" : "تفعيل المحفظة"}
        loading={toggleSaving}
        onCancel={() => {
          if (!toggleSaving) setToggleWallet(null);
        }}
        onConfirm={confirmToggle}
      />
    </>
  );
}

type WalletForm = {
  name_ar: string;
  sort_order: string;
};

const emptyWalletForm: WalletForm = {
  name_ar: "",
  sort_order: "0",
};

function canSubmitWallet(form: WalletForm): boolean {
  return form.name_ar.trim().length > 0;
}

function parseSortOrder(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function WalletFormDialog({
  open,
  title,
  subtitle,
  form,
  loading,
  errorMessage,
  confirmLabel,
  savingLabel,
  onChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  form: WalletForm;
  loading: boolean;
  errorMessage: string | null;
  confirmLabel: string;
  savingLabel: string;
  onChange: (field: keyof WalletForm, value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const canConfirm = canSubmitWallet(form) && !loading;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,42,40,0.36)] px-4 py-6" role="presentation">
      <div aria-modal="true" className="sanad-card max-h-[92vh] w-full max-w-[560px] overflow-y-auto" role="dialog">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h3 className="text-[20px] font-bold text-[var(--text)]">{title}</h3>
          <p className="mt-2 text-[14.5px] leading-7 text-[var(--text-2)]">{subtitle}</p>
        </div>

        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormInput
              id="wallet-name"
              label="اسم المحفظة"
              disabled={loading}
              value={form.name_ar}
              onChange={(value) => onChange("name_ar", value)}
            />
          </div>
          <FormInput
            id="wallet-sort-order"
            label="ترتيب العرض"
            disabled={loading}
            type="number"
            value={form.sort_order}
            onChange={(value) => onChange("sort_order", value)}
            optional
          />
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
          <button
            className="sanad-btn sanad-btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canConfirm}
            type="button"
            onClick={onConfirm}
          >
            {loading ? savingLabel : confirmLabel}
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

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDateTime(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
