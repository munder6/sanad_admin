"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Eye, Plus, Power, RefreshCw, Save } from "lucide-react";
import { StatusBadge, type StatusTone } from "@/components/badges/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Tabs } from "@/components/ui/Tabs";
import {
  superAdminApi,
  type SmsRechargeRequest,
  type SmsWalletTransaction,
  type SuperAdminPaginationMeta,
  type SuperAdminSmsOverview,
  type SuperAdminSmsWallet,
  type SuperAdminSmsWalletDetail,
} from "@/lib/api/superAdminApi";
import { formatAdminDateTime } from "@/lib/formatters/date";

type Notice = {
  tone: "success" | "warning" | "danger";
  message: string;
};

type SmsQuotaManagerProps = {
  onNotice: (notice: Notice) => void;
};

type ActionType =
  | "wallet-topup"
  | "wallet-quota"
  | "wallet-toggle"
  | "bulk-topup"
  | "bulk-quota"
  | "bulk-toggle"
  | "approve-request"
  | "reject-request";

type PendingAction = {
  type: ActionType;
  wallet?: SuperAdminSmsWallet;
  request?: SmsRechargeRequest;
  scope?: "all" | "selected";
  enabled?: boolean;
};

const perPage = 10;

const emptyMeta: SuperAdminPaginationMeta = {
  current_page: 1,
  per_page: perPage,
  total: 0,
  last_page: 1,
};

export function SmsQuotaManager({ onNotice }: SmsQuotaManagerProps) {
  const [overview, setOverview] = useState<SuperAdminSmsOverview | null>(null);
  const [wallets, setWallets] = useState<SuperAdminSmsWallet[]>([]);
  const [walletMeta, setWalletMeta] = useState<SuperAdminPaginationMeta>(emptyMeta);
  const [walletPage, setWalletPage] = useState(1);
  const [walletSearch, setWalletSearch] = useState("");
  const [walletEnabledFilter, setWalletEnabledFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [lowBalanceOnly, setLowBalanceOnly] = useState(false);
  const [selectedWalletIds, setSelectedWalletIds] = useState<number[]>([]);
  const [requests, setRequests] = useState<SmsRechargeRequest[]>([]);
  const [requestMeta, setRequestMeta] = useState<SuperAdminPaginationMeta>(emptyMeta);
  const [requestPage, setRequestPage] = useState(1);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalQuota, setGlobalQuota] = useState("");
  const [globalTopup, setGlobalTopup] = useState("");
  const [globalNotes, setGlobalNotes] = useState("");
  const [action, setAction] = useState<PendingAction | null>(null);
  const [actionValue, setActionValue] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [actionConfirm, setActionConfirm] = useState("");
  const [actionSaving, setActionSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [detailWalletId, setDetailWalletId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SuperAdminSmsWalletDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const selectedWallets = useMemo(
    () => wallets.filter((wallet) => selectedWalletIds.includes(wallet.id)),
    [selectedWalletIds, wallets],
  );

  const loadOverview = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const response = await superAdminApi.getSmsOverview();
      setOverview(response);
      setGlobalQuota(String(response.default_monthly_quota));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تحميل ملخص أرصدة الرسائل.");
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const loadWallets = useCallback(async () => {
    try {
      setLoadingWallets(true);
      setError(null);
      const response = await superAdminApi.getSmsWallets({
        page: walletPage,
        per_page: perPage,
        search: walletSearch.trim(),
        sms_enabled: walletEnabledFilter === "all" ? undefined : walletEnabledFilter === "enabled",
        low_balance: lowBalanceOnly || undefined,
      });
      setWallets(response.wallets);
      setWalletMeta(response.meta);
      setSelectedWalletIds((current) => current.filter((id) => response.wallets.some((wallet) => wallet.id === id)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تحميل محافظ الرسائل.");
    } finally {
      setLoadingWallets(false);
    }
  }, [lowBalanceOnly, walletEnabledFilter, walletPage, walletSearch]);

  const loadRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const response = await superAdminApi.getSmsRechargeRequests({
        page: requestPage,
        per_page: 8,
      });
      setRequests(response.requests);
      setRequestMeta(response.meta);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تحميل طلبات شحن الرسائل.");
    } finally {
      setLoadingRequests(false);
    }
  }, [requestPage]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadOverview(), loadWallets(), loadRequests()]);
  }, [loadOverview, loadRequests, loadWallets]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshAll();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshAll]);

  const openAction = useCallback((nextAction: PendingAction) => {
    setAction(nextAction);
    setActionError(null);
    setActionConfirm("");
    setActionNotes(globalNotes);

    if (nextAction.type === "wallet-quota") {
      setActionValue(String(nextAction.wallet?.monthly_quota ?? 0));
    } else if (nextAction.type === "bulk-quota") {
      setActionValue(globalQuota || String(overview?.default_monthly_quota ?? 0));
    } else if (nextAction.type === "bulk-topup") {
      setActionValue(globalTopup);
    } else if (nextAction.type === "approve-request") {
      setActionValue(String(nextAction.request?.requested_quantity ?? 0));
    } else if (nextAction.type === "wallet-topup") {
      setActionValue("");
    } else {
      setActionValue("");
    }
  }, [globalNotes, globalQuota, globalTopup, overview?.default_monthly_quota]);

  const closeAction = useCallback(() => {
    if (actionSaving) return;
    setAction(null);
    setActionValue("");
    setActionNotes("");
    setActionConfirm("");
    setActionError(null);
  }, [actionSaving]);

  const runAction = useCallback(async () => {
    if (!action) return;

    const ids = action.scope === "selected" ? selectedWalletIds : undefined;
    const quantity = Number(actionValue);
    const notes = actionNotes;

    if (action.scope === "all" && actionConfirm !== "APPLY") {
      setActionError("اكتب APPLY لتأكيد تطبيق الإجراء على كل المحافظ.");
      return;
    }

    if (["wallet-topup", "wallet-quota", "bulk-topup", "bulk-quota", "approve-request"].includes(action.type) && (!Number.isInteger(quantity) || quantity < 0)) {
      setActionError("أدخل رقمًا صحيحًا.");
      return;
    }

    try {
      setActionSaving(true);
      setActionError(null);

      if (action.type === "wallet-topup" && action.wallet) {
        if (quantity <= 0) throw new Error("عدد الرسائل يجب أن يكون أكبر من صفر.");
        await superAdminApi.topupSmsWallet(action.wallet.id, { quantity, notes });
        onNotice({ tone: "success", message: "تم شحن رصيد الرسائل للمحل." });
      }

      if (action.type === "wallet-quota" && action.wallet) {
        await superAdminApi.updateSmsWallet(action.wallet.id, { monthly_quota: quantity, notes });
        onNotice({ tone: "success", message: "تم تحديث الحصة الشهرية." });
      }

      if (action.type === "wallet-toggle" && action.wallet) {
        await superAdminApi.updateSmsWallet(action.wallet.id, { sms_enabled: Boolean(action.enabled), notes });
        onNotice({ tone: "success", message: action.enabled ? "تم تفعيل الرسائل للمحل." : "تم إيقاف الرسائل للمحل." });
      }

      if (action.type === "bulk-topup") {
        if (quantity <= 0) throw new Error("عدد الرسائل يجب أن يكون أكبر من صفر.");
        const response = await superAdminApi.bulkTopupSmsWallets({ scope: action.scope ?? "selected", wallet_ids: ids, quantity, notes });
        onNotice({ tone: "success", message: `تم شحن ${formatCount(response.affected_count)} محفظة.` });
      }

      if (action.type === "bulk-quota") {
        const response = await superAdminApi.bulkUpdateSmsQuota({ scope: action.scope ?? "selected", wallet_ids: ids, monthly_quota: quantity, notes });
        onNotice({ tone: "success", message: `تم تحديث حصة ${formatCount(response.affected_count)} محفظة.` });
      }

      if (action.type === "bulk-toggle") {
        const response = await superAdminApi.bulkToggleSmsWallets({ scope: action.scope ?? "selected", wallet_ids: ids, sms_enabled: Boolean(action.enabled), notes });
        onNotice({ tone: "success", message: `تم تحديث حالة ${formatCount(response.affected_count)} محفظة.` });
      }

      if (action.type === "approve-request" && action.request) {
        await superAdminApi.approveSmsRechargeRequest(action.request.id, { approved_quantity: quantity, admin_notes: notes });
        onNotice({ tone: "success", message: "تمت الموافقة على طلب الشحن." });
      }

      if (action.type === "reject-request" && action.request) {
        await superAdminApi.rejectSmsRechargeRequest(action.request.id, { admin_notes: notes });
        onNotice({ tone: "success", message: "تم رفض طلب الشحن." });
      }

      setAction(null);
      setActionValue("");
      setActionNotes("");
      setActionConfirm("");
      setActionError(null);
      await refreshAll();

      // Keep an open wallet detail modal in sync after an action launched from it.
      if (detailWalletId !== null) {
        try {
          setDetail(await superAdminApi.getSmsWallet(detailWalletId));
        } catch {
          // Ignore silent refresh failures; the modal keeps its previous data.
        }
      }
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "تعذر تنفيذ الإجراء.");
    } finally {
      setActionSaving(false);
    }
    // `detailWalletId` must stay in deps so the post-action silent re-fetch above
    // targets the currently open wallet detail modal (not a stale id).
  }, [action, actionConfirm, actionNotes, actionValue, detailWalletId, onNotice, refreshAll, selectedWalletIds]);

  const openDetails = useCallback(async (walletId: number, options?: { silent?: boolean }) => {
    try {
      setDetailWalletId(walletId);
      if (!options?.silent) {
        setDetail(null);
        setDetailLoading(true);
      }
      setDetailError(null);
      setDetail(await superAdminApi.getSmsWallet(walletId));
    } catch (caught) {
      if (!options?.silent) {
        setDetailError(caught instanceof Error ? caught.message : "تعذر تحميل تفاصيل محفظة الرسائل.");
      }
    } finally {
      if (!options?.silent) {
        setDetailLoading(false);
      }
    }
  }, []);

  return (
    <div className="space-y-[14px]">
      <SmsOverviewCards loading={loadingOverview} overview={overview} onRefresh={refreshAll} />

      {error ? (
        <ErrorState title="تعذر تحميل بيانات الرسائل" message={error} onRetry={refreshAll} />
      ) : null}

      <GlobalControlsCard
        disabled={loadingWallets || actionSaving}
        globalNotes={globalNotes}
        globalQuota={globalQuota}
        globalTopup={globalTopup}
        overview={overview}
        selectedCount={selectedWallets.length}
        onGlobalNotesChange={setGlobalNotes}
        onGlobalQuotaChange={setGlobalQuota}
        onGlobalTopupChange={setGlobalTopup}
        onOpenAction={openAction}
      />

      <WalletsTable
        enabledFilter={walletEnabledFilter}
        loading={loadingWallets}
        lowBalanceOnly={lowBalanceOnly}
        meta={walletMeta}
        search={walletSearch}
        selectedWalletIds={selectedWalletIds}
        wallets={wallets}
        onEnabledFilterChange={(value) => {
          setWalletEnabledFilter(value);
          setWalletPage(1);
        }}
        onLowBalanceChange={(value) => {
          setLowBalanceOnly(value);
          setWalletPage(1);
        }}
        onNext={() => setWalletPage((value) => Math.min(walletMeta.last_page, value + 1))}
        onOpenAction={openAction}
        onOpenDetails={openDetails}
        onPrevious={() => setWalletPage((value) => Math.max(1, value - 1))}
        onSearchChange={(value) => {
          setWalletSearch(value);
          setWalletPage(1);
        }}
        onSelectionChange={setSelectedWalletIds}
      />

      <RechargeRequestsCard
        loading={loadingRequests}
        meta={requestMeta}
        requests={requests}
        onNext={() => setRequestPage((value) => Math.min(requestMeta.last_page, value + 1))}
        onOpenAction={openAction}
        onPrevious={() => setRequestPage((value) => Math.max(1, value - 1))}
      />

      <SmsActionDialog
        action={action}
        confirmText={actionConfirm}
        errorMessage={actionError}
        loading={actionSaving}
        notes={actionNotes}
        selectedCount={selectedWallets.length}
        value={actionValue}
        onCancel={closeAction}
        onConfirm={runAction}
        onConfirmTextChange={setActionConfirm}
        onNotesChange={setActionNotes}
        onValueChange={setActionValue}
      />

      <WalletDetailsDialog
        detail={detail}
        errorMessage={detailError}
        loading={detailLoading}
        open={detailWalletId !== null}
        onCancel={() => {
          setDetailWalletId(null);
          setDetail(null);
          setDetailError(null);
        }}
        onOpenAction={openAction}
        onRetry={() => {
          if (detailWalletId !== null) void openDetails(detailWalletId);
        }}
      />
    </div>
  );
}

function SmsOverviewCards({
  overview,
  loading,
  onRefresh,
}: {
  overview: SuperAdminSmsOverview | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  const cards = [
    { label: "المحافظ", value: overview?.total_wallets ?? 0 },
    { label: "المفعلة", value: overview?.enabled_wallets ?? 0 },
    { label: "الموقوفة", value: overview?.disabled_wallets ?? 0 },
    { label: "المستخدم هذا الشهر", value: overview?.total_monthly_used ?? 0 },
    { label: "طلبات الشحن المعلقة", value: overview?.pending_recharge_requests ?? 0 },
  ];

  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header flex-wrap">
        <div>
          <h3 className="sanad-section-title">لوحة التحكم بالرسائل</h3>
          <p className="sanad-section-subtitle">نظرة سريعة على المحافظ والاستخدام وطلبات الشحن.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-[var(--r-md)] border border-[var(--teal-50)] bg-[var(--teal-50)] px-3 py-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[12px] font-semibold text-[var(--teal-700)]">إجمالي المتاح للمحافظ المفعّلة: </span>
              <span className="mono-num text-[14px] font-black text-[var(--teal-700)]">
                {loading ? "..." : formatCount(overview?.total_available_balance ?? 0)}
              </span>
            </div>
            <p className="mt-0.5 text-[10.5px] font-semibold text-[var(--teal-700)] opacity-80">لا يشمل المحافظ الموقوفة.</p>
          </div>
          <button className="sanad-btn h-9 px-3 text-[12px]" type="button" onClick={onRefresh}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[var(--r-md)] border border-[var(--hairline-2)] bg-[var(--paper)] px-4 py-3">
            <p className="text-[12.5px] font-semibold text-[var(--muted)]">{card.label}</p>
            <p className="mono-num mt-2 text-[24px] font-black text-[var(--text)]">{loading ? "..." : formatCount(card.value)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function GlobalControlsCard({
  overview,
  selectedCount,
  globalQuota,
  globalTopup,
  globalNotes,
  disabled,
  onGlobalQuotaChange,
  onGlobalTopupChange,
  onGlobalNotesChange,
  onOpenAction,
}: {
  overview: SuperAdminSmsOverview | null;
  selectedCount: number;
  globalQuota: string;
  globalTopup: string;
  globalNotes: string;
  disabled: boolean;
  onGlobalQuotaChange: (value: string) => void;
  onGlobalTopupChange: (value: string) => void;
  onGlobalNotesChange: (value: string) => void;
  onOpenAction: (action: PendingAction) => void;
}) {
  const globalEnabled = overview?.global_sms_enabled !== false;
  const hasSelection = selectedCount > 0;

  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header">
        <div>
          <h3 className="sanad-section-title">التحكم العام بالرسائل</h3>
          <p className="sanad-section-subtitle">الحالة العامة والحصة الافتراضية والشحن الجماعي وإجراءات المحافظ المحددة.</p>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
        {/* A. الحالة العامة */}
        <ControlPanel title="الحالة العامة" subtitle="تفعيل الرسائل للجميع">
          <div>
            <StatusBadge tone={globalEnabled ? "success" : "danger"}>
              {globalEnabled ? "مفعّل للجميع" : "موقوف للجميع"}
            </StatusBadge>
          </div>
          <div className="mt-auto flex gap-2 pt-4">
            <button className="sanad-btn flex-1 justify-center" disabled={disabled} type="button" onClick={() => onOpenAction({ type: "bulk-toggle", scope: "all", enabled: true })}>
              <Power size={15} />
              تفعيل للجميع
            </button>
            <button className="sanad-btn flex-1 justify-center" disabled={disabled} type="button" onClick={() => onOpenAction({ type: "bulk-toggle", scope: "all", enabled: false })}>
              <Power size={15} />
              إيقاف للجميع
            </button>
          </div>
        </ControlPanel>

        {/* B. الحصة الشهرية الافتراضية */}
        <ControlPanel title="الحصة الشهرية الافتراضية" subtitle="تطبّق على كل المحافظ">
          <NumberInput label="الحصة الشهرية" value={globalQuota} disabled={disabled} onChange={onGlobalQuotaChange} />
          <div className="mt-auto pt-4">
            <button className="sanad-btn w-full justify-center" disabled={disabled} type="button" onClick={() => onOpenAction({ type: "bulk-quota", scope: "all" })}>
              <Save size={15} />
              تطبيق الحصة على الجميع
            </button>
          </div>
        </ControlPanel>

        {/* C. شحن جماعي */}
        <ControlPanel title="شحن جماعي" subtitle="إضافة رصيد لكل المحافظ">
          <NumberInput label="عدد الرسائل" value={globalTopup} disabled={disabled} onChange={onGlobalTopupChange} />
          <div className="mt-auto pt-4">
            <button className="sanad-btn w-full justify-center" disabled={disabled} type="button" onClick={() => onOpenAction({ type: "bulk-topup", scope: "all" })}>
              <Plus size={15} />
              شحن للجميع
            </button>
          </div>
        </ControlPanel>

        {/* D. إجراءات على المحافظ المحددة */}
        <ControlPanel title="المحافظ المحددة" subtitle="إجراءات على الصفوف المحددة" active={hasSelection}>
          {hasSelection ? (
            <>
              <p className="text-[13px] font-bold text-[var(--text)]">
                تم تحديد <span className="mono-num text-[var(--teal-700)]">{formatCount(selectedCount)}</span> محفظة
              </p>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <button className="sanad-btn w-full justify-center" disabled={disabled} type="button" onClick={() => onOpenAction({ type: "bulk-topup", scope: "selected" })}>
                  <Plus size={15} />
                  شحن المحدد
                </button>
                <div className="flex gap-2">
                  <button className="sanad-btn flex-1 justify-center" disabled={disabled} type="button" onClick={() => onOpenAction({ type: "bulk-toggle", scope: "selected", enabled: true })}>
                    تفعيل المحدد
                  </button>
                  <button className="sanad-btn flex-1 justify-center" disabled={disabled} type="button" onClick={() => onOpenAction({ type: "bulk-toggle", scope: "selected", enabled: false })}>
                    إيقاف المحدد
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="m-auto max-w-[210px] text-center text-[13px] leading-6 text-[var(--muted)]">
              حدد محافظ من الجدول لتفعيل هذه الإجراءات.
            </p>
          )}
        </ControlPanel>
      </div>

      <div className="border-t border-[var(--hairline-2)] px-4 py-3">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">
            ملاحظات داخلية <span className="font-normal text-[var(--muted)]">(اختياري)</span>
          </span>
          <input
            className="h-11 w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
            disabled={disabled}
            placeholder="تُرفق مع الإجراءات الجماعية أدناه"
            value={globalNotes}
            onChange={(event) => onGlobalNotesChange(event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}

function ControlPanel({
  title,
  subtitle,
  active = false,
  children,
}: {
  title: string;
  subtitle?: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex min-h-[176px] flex-col rounded-[var(--r-md)] border p-4 ${
        active ? "border-[var(--teal-700)] bg-[var(--teal-50)]" : "border-[var(--hairline-2)] bg-[var(--paper)]"
      }`}
    >
      <p className="text-[14px] font-bold text-[var(--text)]">{title}</p>
      {subtitle ? <p className="mb-3 mt-0.5 text-[12.5px] text-[var(--muted)]">{subtitle}</p> : <div className="mb-3" />}
      {children}
    </div>
  );
}

function WalletsTable({
  wallets,
  meta,
  loading,
  search,
  enabledFilter,
  lowBalanceOnly,
  selectedWalletIds,
  onSearchChange,
  onEnabledFilterChange,
  onLowBalanceChange,
  onSelectionChange,
  onOpenDetails,
  onOpenAction,
  onPrevious,
  onNext,
}: {
  wallets: SuperAdminSmsWallet[];
  meta: SuperAdminPaginationMeta;
  loading: boolean;
  search: string;
  enabledFilter: "all" | "enabled" | "disabled";
  lowBalanceOnly: boolean;
  selectedWalletIds: number[];
  onSearchChange: (value: string) => void;
  onEnabledFilterChange: (value: "all" | "enabled" | "disabled") => void;
  onLowBalanceChange: (value: boolean) => void;
  onSelectionChange: (ids: number[]) => void;
  onOpenDetails: (walletId: number) => void;
  onOpenAction: (action: PendingAction) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const allSelected = wallets.length > 0 && wallets.every((wallet) => selectedWalletIds.includes(wallet.id));

  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header flex-wrap">
        <div>
          <h3 className="sanad-section-title">أرصدة المحلات</h3>
          <p className="sanad-section-subtitle">رصيد الرسائل والحصة الشهرية لكل مستخدم / صاحب محل.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="h-10 w-[230px] max-w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 text-[13px] outline-none focus:border-[var(--teal-700)]"
            placeholder="بحث بالمستخدم أو المحل أو الهاتف..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <select
            className="h-10 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 text-[13px] outline-none"
            value={enabledFilter}
            onChange={(event) => onEnabledFilterChange(event.target.value as "all" | "enabled" | "disabled")}
          >
            <option value="all">كل الحالات</option>
            <option value="enabled">مفعلة</option>
            <option value="disabled">موقوفة</option>
          </select>
          <label className="flex h-10 items-center gap-2 rounded-[var(--r-md)] border border-[var(--border)] px-3 text-[13px] font-semibold">
            <input checked={lowBalanceOnly} type="checkbox" onChange={(event) => onLowBalanceChange(event.target.checked)} />
            رصيد منخفض
          </label>
        </div>
      </div>
      {selectedWalletIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--teal-700)] bg-[var(--teal-50)] px-4 py-3">
          <p className="text-[13px] font-bold text-[var(--teal-700)]">
            تم تحديد <span className="mono-num">{formatCount(selectedWalletIds.length)}</span> محفظة
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button className="sanad-btn h-9 px-3 text-[12.5px]" type="button" onClick={() => onOpenAction({ type: "bulk-topup", scope: "selected" })}>
              <Plus size={15} />
              شحن المحدد
            </button>
            <button className="sanad-btn h-9 px-3 text-[12.5px]" type="button" onClick={() => onOpenAction({ type: "bulk-toggle", scope: "selected", enabled: true })}>
              تفعيل المحدد
            </button>
            <button className="sanad-btn h-9 px-3 text-[12.5px]" type="button" onClick={() => onOpenAction({ type: "bulk-toggle", scope: "selected", enabled: false })}>
              إيقاف المحدد
            </button>
            <button className="sanad-btn h-9 px-3 text-[12.5px]" type="button" onClick={() => onSelectionChange([])}>
              إلغاء التحديد
            </button>
          </div>
        </div>
      ) : null}
      {loading ? (
        <div className="p-4">
          <LoadingState label="جاري تحميل أرصدة المحلات..." />
        </div>
      ) : wallets.length === 0 ? (
        <EmptyState title="لا توجد محافظ رسائل" description="ستظهر محافظ أصحاب المحلات هنا بعد إنشائها أو مزامنتها." icon="SMS" />
      ) : (
        <>
          <div className="sanad-table-wrap">
            <table className="sanad-table min-w-[1120px]">
              <thead>
                <tr>
                  <th className="!text-center">
                    <input
                      aria-label="تحديد الكل"
                      checked={allSelected}
                      type="checkbox"
                      onChange={(event) => onSelectionChange(event.target.checked ? wallets.map((wallet) => wallet.id) : [])}
                    />
                  </th>
                  <th>المستخدم</th>
                  <th>المحل</th>
                  <th>الحالة</th>
                  <th className="!text-center">الحصة الشهرية</th>
                  <th className="!text-center">المستخدم هذا الشهر</th>
                  <th className="!text-center">المتبقي</th>
                  <th className="!text-center">الإجمالي المتاح</th>
                  <th className="!text-left">آخر إرسال</th>
                  <th className="!text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.id}>
                    <td className="!text-center">
                      <input
                        checked={selectedWalletIds.includes(wallet.id)}
                        type="checkbox"
                        onChange={(event) => onSelectionChange(toggleId(selectedWalletIds, wallet.id, event.target.checked))}
                      />
                    </td>
                    <td>
                      <p className="font-semibold text-[var(--text)]">{wallet.user?.name ?? "مستخدم غير محدد"}</p>
                      <p className="mono-num text-[11.5px] text-[var(--muted)]">{wallet.user?.phone ?? "—"}</p>
                    </td>
                    <td>{wallet.shop?.name ?? "محل غير محدد"}</td>
                    <td>
                      <StatusBadge tone={wallet.effective_sms_enabled ? "success" : "danger"}>
                        {wallet.effective_sms_enabled ? "مفعلة" : "موقوفة"}
                      </StatusBadge>
                    </td>
                    <td className="!text-center"><span className="mono-num">{formatCount(wallet.monthly_quota)}</span></td>
                    <td className="!text-center"><span className="mono-num">{formatCount(wallet.monthly_used)}</span></td>
                    <td className="!text-center"><span className="mono-num">{formatCount(wallet.monthly_remaining)}</span></td>
                    <td className="!text-center font-bold text-[var(--teal-700)]"><span className="mono-num">{formatCount(wallet.available_balance)}</span></td>
                    <td className="!text-left text-[12px] text-[var(--muted)]"><span className="mono-num">{formatDate(wallet.last_sent_at)}</span></td>
                    <td className="!text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconButton label="عرض التفاصيل" onClick={() => onOpenDetails(wallet.id)}><Eye size={15} /></IconButton>
                        <IconButton label="تعديل الحصة" onClick={() => onOpenAction({ type: "wallet-quota", wallet })}><Save size={15} /></IconButton>
                        <IconButton label="شحن" onClick={() => onOpenAction({ type: "wallet-topup", wallet })}><Plus size={15} /></IconButton>
                        <IconButton label={wallet.sms_enabled ? "إيقاف الرسائل" : "تفعيل الرسائل"} onClick={() => onOpenAction({ type: "wallet-toggle", wallet, enabled: !wallet.sms_enabled })}><Power size={15} /></IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePager meta={meta} onPrevious={onPrevious} onNext={onNext} />
        </>
      )}
    </section>
  );
}

function RechargeRequestsCard({
  requests,
  meta,
  loading,
  onOpenAction,
  onPrevious,
  onNext,
}: {
  requests: SmsRechargeRequest[];
  meta: SuperAdminPaginationMeta;
  loading: boolean;
  onOpenAction: (action: PendingAction) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header">
        <div>
          <h3 className="sanad-section-title">طلبات شحن الرسائل</h3>
          <p className="sanad-section-subtitle">مراجعة طلبات أصحاب المحلات والموافقة عليها أو رفضها.</p>
        </div>
      </div>
      {loading ? (
        <div className="p-4">
          <LoadingState label="جاري تحميل طلبات الشحن..." />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState title="لا توجد طلبات شحن" description="طلبات الشحن الجديدة ستظهر هنا." icon="SMS" />
      ) : (
        <>
          <div className="sanad-table-wrap">
            <table className="sanad-table min-w-[980px]">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>المحل</th>
                  <th className="!text-center">العدد المطلوب</th>
                  <th>الملاحظة</th>
                  <th>الحالة</th>
                  <th className="!text-left">التاريخ</th>
                  <th className="!text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.user?.name ?? "—"}</td>
                    <td>{request.shop?.name ?? "—"}</td>
                    <td className="!text-center"><span className="mono-num">{formatCount(request.requested_quantity)}</span></td>
                    <td className="max-w-[300px] truncate">{request.notes ?? "—"}</td>
                    <td><StatusBadge tone={requestStatusTone(request.status)}>{requestStatusLabel(request.status)}</StatusBadge></td>
                    <td className="!text-left text-[12px] text-[var(--muted)]"><span className="mono-num">{formatDate(request.created_at)}</span></td>
                    <td className="!text-left">
                      {request.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button className="sanad-btn h-8 px-3 text-[12px]" type="button" onClick={() => onOpenAction({ type: "approve-request", request })}>قبول</button>
                          <button className="sanad-btn h-8 px-3 text-[12px]" type="button" onClick={() => onOpenAction({ type: "reject-request", request })}>رفض</button>
                        </div>
                      ) : (
                        <span className="text-[12px] text-[var(--muted)]">تمت المراجعة</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePager meta={meta} onPrevious={onPrevious} onNext={onNext} />
        </>
      )}
    </section>
  );
}

function SmsActionDialog({
  action,
  selectedCount,
  value,
  notes,
  confirmText,
  loading,
  errorMessage,
  onValueChange,
  onNotesChange,
  onConfirmTextChange,
  onCancel,
  onConfirm,
}: {
  action: PendingAction | null;
  selectedCount: number;
  value: string;
  notes: string;
  confirmText: string;
  loading: boolean;
  errorMessage: string | null;
  onValueChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onConfirmTextChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!action) return null;

  const needsValue = ["wallet-topup", "wallet-quota", "bulk-topup", "bulk-quota", "approve-request"].includes(action.type);
  const needsPositiveValue = action.type === "wallet-topup" || action.type === "bulk-topup";
  const needsApply = action.scope === "all";
  const title = actionTitle(action, selectedCount);
  const valueValid = !needsValue || (needsPositiveValue ? Number(value) > 0 : Number(value) >= 0);
  const canConfirm = !loading && valueValid && (!needsApply || confirmText === "APPLY");

  // z-[60] keeps this dialog above the wallet detail modal (z-50) when an action
  // is launched from inside that modal.
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[rgba(14,42,40,0.38)] px-4 py-6" role="presentation">
      <div aria-modal="true" className="sanad-card max-h-[92vh] w-full max-w-[540px] overflow-y-auto" role="dialog">
        <div className="border-b border-[var(--hairline-2)] px-5 py-4">
          <h3 className="text-[20px] font-bold text-[var(--text)]">{title}</h3>
          {needsApply ? (
            <p className="mt-2 text-[14px] leading-7 text-[var(--danger-700)]">سيتم تطبيق هذا الإجراء على كل المحافظ.</p>
          ) : null}
        </div>
        <div className="space-y-4 px-5 py-4">
          {needsValue ? (
            <NumberInput label={actionValueLabel(action)} value={value} disabled={loading} onChange={onValueChange} />
          ) : null}
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">ملاحظات</span>
            <textarea
              className="min-h-[84px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 outline-none focus:border-[var(--teal-700)]"
              disabled={loading}
              placeholder="اختياري"
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
            />
          </label>
          {needsApply ? (
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">اكتب APPLY للتأكيد</span>
              <input
                className="mono-num h-11 w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 text-[14px] outline-none focus:border-[var(--teal-700)]"
                disabled={loading}
                value={confirmText}
                onChange={(event) => onConfirmTextChange(event.target.value)}
              />
            </label>
          ) : null}
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

function WalletDetailsDialog({
  open,
  detail,
  loading,
  errorMessage,
  onCancel,
  onRetry,
  onOpenAction,
}: {
  open: boolean;
  detail: SuperAdminSmsWalletDetail | null;
  loading: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onRetry: () => void;
  onOpenAction: (action: PendingAction) => void;
}) {
  if (!open) return null;

  const wallet = detail?.wallet;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,42,40,0.38)] px-4 py-6" role="presentation">
      <div aria-modal="true" className="sanad-card max-h-[92vh] w-full max-w-[920px] overflow-y-auto" role="dialog">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline-2)] px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h3 className="text-[20px] font-bold text-[var(--text)]">{wallet?.user?.name ?? "تفاصيل الرصيد"}</h3>
              <p className="mt-0.5 text-[13px] text-[var(--muted)]">{wallet?.shop?.name ?? "—"}</p>
            </div>
            {wallet ? (
              <StatusBadge tone={wallet.effective_sms_enabled ? "success" : "danger"}>
                {wallet.effective_sms_enabled ? "مفعلة" : "موقوفة"}
              </StatusBadge>
            ) : null}
          </div>
          <button className="sanad-btn h-9 px-3 text-[12px]" type="button" onClick={onCancel}>إغلاق</button>
        </div>
        {loading ? (
          <div className="p-5"><LoadingState label="جاري تحميل تفاصيل الرصيد..." /></div>
        ) : errorMessage ? (
          <div className="p-5"><ErrorState title="تعذر تحميل التفاصيل" message={errorMessage} onRetry={onRetry} /></div>
        ) : detail ? (
          <div className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MiniMetric label="الحصة الشهرية" value={detail.wallet.monthly_quota} />
              <MiniMetric label="المستخدم هذا الشهر" value={detail.wallet.monthly_used} />
              <MiniMetric label="المتبقي من الحصة" value={detail.wallet.monthly_remaining} />
              <MiniMetric label="الإجمالي المتاح" value={detail.wallet.available_balance} strong />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="sanad-btn h-9 px-3 text-[12.5px]" type="button" onClick={() => onOpenAction({ type: "wallet-quota", wallet: detail.wallet })}>تعديل الحصة</button>
              <button className="sanad-btn h-9 px-3 text-[12.5px]" type="button" onClick={() => onOpenAction({ type: "wallet-topup", wallet: detail.wallet })}>شحن رسائل</button>
              <button className="sanad-btn h-9 px-3 text-[12.5px]" type="button" onClick={() => onOpenAction({ type: "wallet-toggle", wallet: detail.wallet, enabled: !detail.wallet.sms_enabled })}>
                {detail.wallet.sms_enabled ? "إيقاف الرسائل" : "تفعيل الرسائل"}
              </button>
            </div>
            <Tabs
              tabs={[
                { key: "balance", label: "سجل الرصيد", count: detail.transactions.length },
                { key: "messages", label: "سجل الرسائل", count: detail.message_logs.length },
                { key: "requests", label: "طلبات الشحن", count: detail.recharge_requests.length },
              ]}
            >
              {(active) =>
                active === "balance" ? (
                  <WalletBalanceLog rows={detail.transactions} />
                ) : active === "messages" ? (
                  <WalletMessagesLog rows={detail.message_logs} />
                ) : (
                  <WalletRequestsLog rows={detail.recharge_requests} />
                )
              }
            </Tabs>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function WalletBalanceLog({ rows }: { rows: SmsWalletTransaction[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد حركات رصيد" description="لا توجد عمليات على هذه المحفظة." />;
  }

  return (
    <div className="sanad-table-wrap rounded-[var(--r-md)] border border-[var(--hairline-2)]">
      <table className="sanad-table min-w-[780px]">
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
            <td>{transactionLabel(row.type)}</td>
            <td className="!text-center"><SmsChangeCell row={row} /></td>
            <td className="!text-center"><span className="mono-num">{formatNullableCount(row.balance_before)}</span></td>
            <td className="!text-center"><span className="mono-num">{formatNullableCount(row.balance_after)}</span></td>
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

function WalletMessagesLog({ rows }: { rows: SuperAdminSmsWalletDetail["message_logs"] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد رسائل مرسلة" description="لم يتم تسجيل رسائل لهذه المحفظة." />;
  }

  return (
    <div className="sanad-table-wrap rounded-[var(--r-md)] border border-[var(--hairline-2)]">
      <table className="sanad-table min-w-[820px]">
        <thead><tr><th>الحالة</th><th className="!text-left">الرقم</th><th>نص الرسالة</th><th className="!text-left">الكود</th><th className="!text-left">Message ID</th><th className="!text-left">التاريخ</th></tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={row.id}>
            <td><StatusBadge tone={row.success ? "success" : "danger"}>{row.success ? "تم الإرسال" : "فشل"}</StatusBadge></td>
            <td className="!text-left"><span className="mono-num">{row.mobile || "—"}</span></td>
            <td className="max-w-[280px] truncate" title={row.message_text}>{row.message_text || "—"}</td>
            <td className="!text-left"><span className="mono-num">{row.provider_code || "—"}</span></td>
            <td className="!text-left"><span className="mono-num">{row.provider_message_id || "—"}</span></td>
            <td className="!text-left text-[12px] text-[var(--muted)]"><span className="mono-num">{formatDate(row.sent_at ?? row.created_at)}</span></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function WalletRequestsLog({ rows }: { rows: SmsRechargeRequest[] }) {
  if (rows.length === 0) {
    return <EmptyState title="لا توجد طلبات شحن" description="لا توجد طلبات شحن لهذه المحفظة." />;
  }

  return (
    <div className="sanad-table-wrap rounded-[var(--r-md)] border border-[var(--hairline-2)]">
      <table className="sanad-table min-w-[760px]">
        <thead><tr><th className="!text-center">الكمية المطلوبة</th><th>الحالة</th><th>ملاحظة المستخدم</th><th>رد الإدارة</th><th className="!text-left">التاريخ</th></tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={row.id}>
            <td className="!text-center"><span className="mono-num">{formatCount(row.requested_quantity)}</span></td>
            <td><StatusBadge tone={requestStatusTone(row.status)}>{requestStatusLabel(row.status)}</StatusBadge></td>
            <td className="max-w-[240px] truncate">{row.notes ?? "—"}</td>
            <td className="max-w-[240px] truncate">{row.admin_notes ?? "—"}</td>
            <td className="!text-left text-[12px] text-[var(--muted)]"><span className="mono-num">{formatDate(row.created_at)}</span></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function NumberInput({ label, value, disabled, onChange }: { label: string; value: string; disabled: boolean; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">{label}</span>
      <input
        className="mono-num h-11 w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 text-left text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
        disabled={disabled}
        inputMode="numeric"
        min={0}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function MiniMetric({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="rounded-[var(--r-md)] border border-[var(--hairline-2)] bg-[var(--paper)] px-3 py-2">
      <p className="text-[12px] font-semibold text-[var(--muted)]">{label}</p>
      <p className={`mono-num mt-1 text-[20px] font-black ${strong ? "text-[var(--teal-700)]" : "text-[var(--text)]"}`}>{formatCount(value)}</p>
    </div>
  );
}

function IconButton({ label, children, onClick }: { label: string; children: ReactNode; onClick: () => void }) {
  return (
    <button className="grid h-8 w-8 place-items-center rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] text-[var(--text)] transition hover:border-[var(--teal-700)]" title={label} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function TablePager({ meta, onPrevious, onNext }: { meta: SuperAdminPaginationMeta; onPrevious: () => void; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--hairline-2)] px-4 py-3 text-[12.5px] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
      <span>صفحة <span className="mono-num">{formatCount(meta.current_page)}</span> من <span className="mono-num">{formatCount(meta.last_page)}</span> · إجمالي <span className="mono-num">{formatCount(meta.total)}</span></span>
      <div className="flex items-center gap-2">
        <button className="sanad-btn h-8 px-3 text-[12px]" disabled={meta.current_page <= 1} type="button" onClick={onPrevious}>السابق</button>
        <button className="sanad-btn h-8 px-3 text-[12px]" disabled={meta.current_page >= meta.last_page} type="button" onClick={onNext}>التالي</button>
      </div>
    </div>
  );
}

function actionTitle(action: PendingAction, selectedCount: number): string {
  if (action.type === "wallet-topup") return `شحن رسائل: ${action.wallet?.shop?.name ?? action.wallet?.user?.name ?? ""}`;
  if (action.type === "wallet-quota") return `تعديل الحصة الشهرية`;
  if (action.type === "wallet-toggle") return action.enabled ? "تفعيل الرسائل للمحل" : "إيقاف الرسائل للمحل";
  if (action.type === "bulk-topup") return action.scope === "all" ? "شحن رصيد للجميع" : `شحن ${formatCount(selectedCount)} محافظ`;
  if (action.type === "bulk-quota") return action.scope === "all" ? "تطبيق الحصة على الجميع" : `تعديل حصة ${formatCount(selectedCount)} محافظ`;
  if (action.type === "bulk-toggle") return action.enabled ? "تفعيل الرسائل" : "إيقاف الرسائل";
  if (action.type === "approve-request") return "قبول طلب الشحن";
  return "رفض طلب الشحن";
}

function actionValueLabel(action: PendingAction): string {
  if (action.type.includes("topup")) return "عدد الرسائل المشحونة";
  if (action.type.includes("quota")) return "الحصة الشهرية";
  if (action.type === "approve-request") return "العدد الموافق عليه";
  return "القيمة";
}

function toggleId(ids: number[], id: number, checked: boolean): number[] {
  if (checked) return [...new Set([...ids, id])];
  return ids.filter((value) => value !== id);
}

function requestStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "قيد المراجعة",
    approved: "مقبول",
    rejected: "مرفوض",
    cancelled: "ملغي",
  };

  return labels[status] ?? status;
}

function requestStatusTone(status: string): StatusTone {
  if (status === "approved") return "success";
  if (status === "rejected" || status === "cancelled") return "danger";
  return "warning";
}

function transactionLabel(type: string): string {
  const labels: Record<string, string> = {
    monthly_reset: "تجديد شهري",
    monthly_quota_update: "تحديث الحصة",
    monthly_usage: "استخدام شهري",
    topup: "شحن",
    bulk_topup: "شحن جماعي",
    manual_adjustment: "تعديل يدوي",
    campaign_reserve: "حجز حملة",
    campaign_debit: "خصم حملة",
    campaign_refund: "استرجاع حملة",
    sms_disabled: "إيقاف الرسائل",
    sms_enabled: "تفعيل الرسائل",
  };

  return labels[type] ?? type;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  return formatAdminDateTime(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatNullableCount(value: number | null): string {
  return value === null ? "—" : formatCount(value);
}
