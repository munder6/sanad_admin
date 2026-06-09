"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { RefreshCw, Save, Send } from "lucide-react";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  superAdminApi,
  type SmsProviderBalanceResult,
  type SmsProviderMessageLog,
  type SmsProviderMessageType,
  type SmsProviderTestSendResult,
  type SuperAdminPaginationMeta,
  type SuperAdminSmsProviderSettings,
  type UpdateSmsProviderSettingsInput,
} from "@/lib/api/superAdminApi";
import { formatAdminDateTime } from "@/lib/formatters/date";
import { isValidLocalPhone, sanitizeLocalPhoneInput } from "@/lib/formatters/number";
import { SmsQuotaManager } from "./SmsQuotaManager";

type SmsTestForm = {
  mobile: string;
  text: string;
  type: SmsProviderMessageType;
};

type ActionNotice = {
  tone: "success" | "warning" | "danger";
  message: string;
};

type DebugResult =
  | { type: "balance"; result: SmsProviderBalanceResult }
  | { type: "test"; result: SmsProviderTestSendResult };

const defaultSmsProviderForm: UpdateSmsProviderSettingsInput = {
  enabled: false,
  auth_mode: "api_token",
  api_token: "",
  user_name: "",
  user_pass: "",
  sender: "",
  send_url: "http://hotsms.ps/sendbulksms.php",
  balance_url: "http://hotsms.ps/getbalance.php",
  default_message_type: "auto",
  request_method: "POST",
  msg_id: true,
  timeout_seconds: 15,
};

const defaultSmsTestForm: SmsTestForm = {
  mobile: "",
  text: "رسالة اختبار من سند",
  type: "auto",
};

const messageTypeOptions = [
  { value: "auto", label: "تلقائي" },
  { value: "0", label: "GSM" },
  { value: "1", label: "Unicode" },
  { value: "2", label: "UTF-8" },
];

const historyPerPage = 10;

const emptyHistoryMeta: SuperAdminPaginationMeta = {
  current_page: 1,
  per_page: historyPerPage,
  total: 0,
  last_page: 1,
};

export default function SmsPage() {
  const [settings, setSettings] = useState<SuperAdminSmsProviderSettings | null>(null);
  const [form, setForm] = useState<UpdateSmsProviderSettingsInput>(defaultSmsProviderForm);
  const [testForm, setTestForm] = useState<SmsTestForm>(defaultSmsTestForm);
  const [messageLogs, setMessageLogs] = useState<SmsProviderMessageLog[]>([]);
  const [messageLogsMeta, setMessageLogsMeta] = useState<SuperAdminPaginationMeta>(emptyHistoryMeta);
  const [messageLogsPage, setMessageLogsPage] = useState(1);
  const [messageLogSearch, setMessageLogSearch] = useState("");
  const [messageLogSuccess, setMessageLogSuccess] = useState<"all" | "success" | "failed">("all");
  const [messageLogSource, setMessageLogSource] = useState("all");
  const [loading, setLoading] = useState(true);
  const [messageLogsLoading, setMessageLogsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [balanceChecking, setBalanceChecking] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageLogsError, setMessageLogsError] = useState<string | null>(null);
  const [notice, setNotice] = useState<ActionNotice | null>(null);
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);
  const [balanceRefreshWarning, setBalanceRefreshWarning] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);

  const showNotice = useCallback((nextNotice: ActionNotice) => {
    setNotice(nextNotice);

    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }

    noticeTimer.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimer.current = null;
    }, 4200);
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminApi.getSmsProviderSettings();
      setSettings(response);
      setForm(smsProviderSettingsToForm(response));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تحميل إعدادات الرسائل النصية.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessageLogs = useCallback(async (targetPage = messageLogsPage) => {
    try {
      setMessageLogsLoading(true);
      setMessageLogsError(null);
      const response = await superAdminApi.getSmsProviderMessageLogs({
        page: targetPage,
        per_page: historyPerPage,
        search: messageLogSearch.trim(),
        success: messageLogSuccess === "all" ? undefined : messageLogSuccess === "success",
        sms_source: messageLogSource === "all" ? undefined : messageLogSource,
      });

      setMessageLogs(response.logs);
      setMessageLogsMeta(response.meta);
    } catch (caught) {
      setMessageLogsError(caught instanceof Error ? caught.message : "تعذر تحميل سجل الرسائل المرسلة.");
    } finally {
      setMessageLogsLoading(false);
    }
  }, [messageLogSearch, messageLogSource, messageLogSuccess, messageLogsPage]);

  const saveSettings = useCallback(async () => {
    const validationError = validateSmsProviderForm(form, settings);

    if (validationError) {
      setError(validationError);
      setNotice(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setBalanceRefreshWarning(null);
      const response = await superAdminApi.updateSmsProviderSettings(form);
      setSettings(response);
      setForm(smsProviderSettingsToForm(response));
      showNotice({ tone: "success", message: "تم حفظ إعدادات الرسائل النصية." });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر حفظ إعدادات الرسائل النصية.");
    } finally {
      setSaving(false);
    }
  }, [form, settings, showNotice]);

  const refreshBalance = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setBalanceChecking(true);
      }
      setError(null);
      setBalanceRefreshWarning(null);
      const result = await superAdminApi.checkSmsProviderBalance();
      setDebugResult({ type: "balance", result });

      if (result.success) {
        setSettings((current) => applyBalanceToSettings(current, result.balance));
        if (!options?.silent) {
          showNotice({ tone: "success", message: "تم تحديث رصيد مزود الرسائل." });
        }
        void loadSettings();
      } else {
        if (!options?.silent) {
          setError(result.message);
        }
        throw new Error(result.message);
      }

      return result;
    } catch (caught) {
      if (!options?.silent) {
        setError(caught instanceof Error ? caught.message : "تعذر فحص رصيد مزود الرسائل.");
      }
      throw caught;
    } finally {
      if (!options?.silent) {
        setBalanceChecking(false);
      }
    }
  }, [loadSettings, showNotice]);

  const sendTestSms = useCallback(async () => {
    const validationError = validateSmsTestForm(testForm);

    if (validationError) {
      setError(validationError);
      setNotice(null);
      return;
    }

    try {
      setTestSending(true);
      setError(null);
      setBalanceRefreshWarning(null);
      const result = await superAdminApi.sendSmsProviderTest(testForm);
      setDebugResult({ type: "test", result });

      if (!result.success) {
        setError(result.message);
        if (messageLogsPage === 1) {
          void loadMessageLogs(1);
        } else {
          setMessageLogsPage(1);
        }
        return;
      }

      showNotice({ tone: "success", message: "تم إرسال الرسالة بنجاح." });

      if (result.balance_after !== undefined && result.balance_after !== null) {
        setSettings((current) => applyBalanceToSettings(current, result.balance_after ?? null));
        void loadSettings();
      } else if (result.warning) {
        setBalanceRefreshWarning(result.warning);
      } else {
        try {
          await refreshBalance({ silent: true });
        } catch {
          setBalanceRefreshWarning("تم إرسال الرسالة، لكن تعذر تحديث الرصيد.");
        }
      }

      if (messageLogsPage === 1) {
        void loadMessageLogs(1);
      } else {
        setMessageLogsPage(1);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر إرسال الرسالة التجريبية.");
      if (messageLogsPage === 1) {
        void loadMessageLogs(1);
      } else {
        setMessageLogsPage(1);
      }
    } finally {
      setTestSending(false);
    }
  }, [loadMessageLogs, loadSettings, messageLogsPage, refreshBalance, showNotice, testForm]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSettings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSettings]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadMessageLogs(messageLogsPage);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadMessageLogs, messageLogsPage]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  const actionDisabled = loading || saving || balanceChecking || testSending;

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <h2>الرسائل النصية</h2>
          <p>إدارة مزود الرسائل النصية وإرسال رسائل اختبارية.</p>
        </div>
        <div className="sanad-page-actions">
          <button className="sanad-btn" disabled={actionDisabled} type="button" onClick={loadSettings}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </div>

      {notice ? <ActionNoticeBar notice={notice} /> : null}

      {error ? (
        <div className="mb-4">
          <ErrorState title="تعذر تنفيذ العملية" message={error} onRetry={loadSettings} />
        </div>
      ) : null}

      {loading ? (
        <LoadingState label="جاري تحميل إعدادات الرسائل النصية..." />
      ) : (
        <div className="space-y-[14px]">
          <SmsQuotaManager onNotice={showNotice} />
          <MessageHistoryCard
            error={messageLogsError}
            loading={messageLogsLoading}
            logs={messageLogs}
            meta={messageLogsMeta}
            search={messageLogSearch}
            source={messageLogSource}
            successFilter={messageLogSuccess}
            onNext={() => setMessageLogsPage((value) => value + 1)}
            onPrevious={() => setMessageLogsPage((value) => Math.max(1, value - 1))}
            onRetry={() => {
              void loadMessageLogs(messageLogsPage);
            }}
            onSearchChange={(value) => {
              setMessageLogSearch(value);
              setMessageLogsPage(1);
            }}
            onSourceChange={(value) => {
              setMessageLogSource(value);
              setMessageLogsPage(1);
            }}
            onSuccessFilterChange={(value) => {
              setMessageLogSuccess(value);
              setMessageLogsPage(1);
            }}
          />
          <ProviderStatusCard
            checking={balanceChecking}
            disabled={actionDisabled}
            form={form}
            settings={settings}
            warning={balanceRefreshWarning}
            onCheck={() => {
              void refreshBalance().catch(() => undefined);
            }}
          />
          <ProviderSettingsCard
            disabled={actionDisabled}
            form={form}
            saving={saving}
            settings={settings}
            onChange={(value) => {
              setError(null);
              setNotice(null);
              setForm(value);
            }}
            onSave={saveSettings}
          />
          <TestSendCard
            disabled={actionDisabled}
            form={testForm}
            sending={testSending}
            onChange={(value) => {
              setError(null);
              setBalanceRefreshWarning(null);
              setTestForm(value);
            }}
            onSend={sendTestSms}
          />
          <LatestResultDetails debugResult={debugResult} />
        </div>
      )}
    </>
  );
}

function ProviderStatusCard({
  settings,
  form,
  checking,
  disabled,
  warning,
  onCheck,
}: {
  settings: SuperAdminSmsProviderSettings | null;
  form: UpdateSmsProviderSettingsInput;
  checking: boolean;
  disabled: boolean;
  warning: string | null;
  onCheck: () => void;
}) {
  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header">
        <div>
          <h3 className="sanad-section-title">حالة المزود</h3>
        </div>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
        <StatusInfoItem label="حالة المزود">
          <StatusBadge tone={form.enabled ? "success" : "warning"}>
            {form.enabled ? "مفعّل" : "غير مفعّل"}
          </StatusBadge>
        </StatusInfoItem>
        <StatusInfoItem label="طريقة التفويض" value={authModeLabel(form.auth_mode)} />
        <StatusInfoItem label="اسم المرسل" value={form.sender?.trim() || "—"} mono={Boolean(form.sender?.trim())} />
        <StatusInfoItem label="آخر رصيد معروف" mono>
          <div className="flex flex-wrap items-center gap-2">
            <span>{formatBalance(settings?.last_balance)}</span>
            <button className="sanad-btn h-8 px-3 text-[12px]" disabled={disabled} type="button" onClick={onCheck}>
              <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
              تحديث
            </button>
          </div>
        </StatusInfoItem>
        <StatusInfoItem label="آخر فحص" value={formatAdminDateTime(settings?.last_balance_checked_at)} mono />
      </div>
      {warning ? (
        <div className="mx-4 mb-4 rounded-[var(--r-md)] border border-[var(--warning-soft)] bg-[var(--warning-soft)] px-4 py-3 text-[13px] font-semibold text-[var(--warning-700)]">
          {warning}
        </div>
      ) : null}
    </section>
  );
}

function StatusInfoItem({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--r-md)] border border-[var(--hairline-2)] bg-[var(--paper)] px-4 py-3">
      <p className="text-[12.5px] font-semibold text-[var(--muted)]">{label}</p>
      <div className={`mt-2 min-h-8 text-[14px] font-bold text-[var(--text)] ${mono ? "mono-num text-left" : ""}`}>
        {children ?? value ?? "—"}
      </div>
    </div>
  );
}

function ProviderSettingsCard({
  form,
  settings,
  disabled,
  saving,
  onChange,
  onSave,
}: {
  form: UpdateSmsProviderSettingsInput;
  settings: SuperAdminSmsProviderSettings | null;
  disabled: boolean;
  saving: boolean;
  onChange: (value: UpdateSmsProviderSettingsInput) => void;
  onSave: () => void;
}) {
  const usingToken = form.auth_mode === "api_token";

  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header flex-wrap">
        <div>
          <h3 className="sanad-section-title">إعدادات المزود</h3>
          <p className="sanad-section-subtitle">القيم الحساسة تبقى مخفية، واترك الحقول السرية فارغة للإبقاء على المحفوظ.</p>
        </div>
        <StatusBadge tone={form.enabled ? "success" : "warning"}>
          {form.enabled ? "مفعّل" : "غير مفعّل"}
        </StatusBadge>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline-2)] pb-4">
          <div>
            <p className="text-[15px] font-bold text-[var(--text)]">تفعيل مزود الرسائل</p>
            <p className="mt-1 text-[13px] text-[var(--muted)]">يلزم التفعيل قبل إرسال الرسائل التجريبية.</p>
          </div>
          <Switch
            checked={form.enabled}
            disabled={disabled}
            label="تفعيل مزود الرسائل"
            onChange={() => onChange({ ...form, enabled: !form.enabled })}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <SmsSelect
            disabled={disabled}
            label="طريقة التفويض"
            value={form.auth_mode}
            options={[
              { value: "api_token", label: "API Token" },
              { value: "user_password", label: "اسم مستخدم وكلمة مرور" },
            ]}
            onChange={(value) => onChange({ ...form, auth_mode: value as UpdateSmsProviderSettingsInput["auth_mode"] })}
          />
          <SmsInput
            disabled={disabled}
            label="اسم المرسل"
            value={form.sender ?? ""}
            onChange={(value) => onChange({ ...form, sender: value })}
          />

          {usingToken ? (
            <div className="md:col-span-2">
              <SmsInput
                disabled={disabled}
                helper={settings?.api_token_masked ? `الحالي: ${settings.api_token_masked}` : undefined}
                label="API Token"
                placeholder="اتركه فارغًا للإبقاء على الرمز الحالي"
                type="password"
                value={form.api_token ?? ""}
                ltr
                onChange={(value) => onChange({ ...form, api_token: value })}
              />
            </div>
          ) : (
            <>
              <SmsInput
                disabled={disabled}
                label="اسم المستخدم"
                value={form.user_name ?? ""}
                ltr
                onChange={(value) => onChange({ ...form, user_name: value })}
              />
              <SmsInput
                disabled={disabled}
                helper={settings?.user_pass_masked ? `الحالي: ${settings.user_pass_masked}` : undefined}
                label="كلمة المرور"
                placeholder="اتركه فارغًا للإبقاء على كلمة المرور الحالية"
                type="password"
                value={form.user_pass ?? ""}
                ltr
                onChange={(value) => onChange({ ...form, user_pass: value })}
              />
            </>
          )}

          <SmsInput
            disabled={disabled}
            inputMode="url"
            label="رابط الإرسال"
            value={form.send_url}
            ltr
            onChange={(value) => onChange({ ...form, send_url: value })}
          />
          <SmsInput
            disabled={disabled}
            inputMode="url"
            label="رابط فحص الرصيد"
            value={form.balance_url}
            ltr
            onChange={(value) => onChange({ ...form, balance_url: value })}
          />
          <SmsSelect
            disabled={disabled}
            label="نوع الرسالة الافتراضي"
            value={form.default_message_type}
            options={messageTypeOptions}
            onChange={(value) => onChange({ ...form, default_message_type: value as SmsProviderMessageType })}
          />
          <SmsSelect
            disabled={disabled}
            label="طريقة الطلب"
            value={form.request_method}
            options={[
              { value: "POST", label: "POST" },
              { value: "GET", label: "GET" },
            ]}
            onChange={(value) => onChange({ ...form, request_method: value as UpdateSmsProviderSettingsInput["request_method"] })}
          />
          <SmsInput
            disabled={disabled}
            inputMode="numeric"
            label="مهلة الاتصال بالثواني"
            type="number"
            value={String(form.timeout_seconds)}
            ltr
            onChange={(value) => onChange({ ...form, timeout_seconds: Number(value) })}
          />
          <div className="flex min-h-[68px] items-center justify-between gap-3 rounded-[var(--r-md)] border border-[var(--hairline-2)] px-3 py-2">
            <div>
              <p className="text-[13px] font-semibold text-[var(--text)]">طلب Message ID</p>
              <p className="mt-1 text-[12.5px] text-[var(--muted)]">يرسل msg_id=YES عند التفعيل.</p>
            </div>
            <Switch
              checked={form.msg_id}
              disabled={disabled}
              label="طلب Message ID"
              onChange={() => onChange({ ...form, msg_id: !form.msg_id })}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="sanad-btn sanad-btn-primary" disabled={disabled} type="button" onClick={onSave}>
            <Save size={16} />
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      </div>
    </section>
  );
}

function TestSendCard({
  form,
  disabled,
  sending,
  onChange,
  onSend,
}: {
  form: SmsTestForm;
  disabled: boolean;
  sending: boolean;
  onChange: (value: SmsTestForm) => void;
  onSend: () => void;
}) {
  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header flex-wrap">
        <div>
          <h3 className="sanad-section-title">إرسال رسالة تجريبية</h3>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="rounded-[var(--r-md)] border border-[var(--warning-soft)] bg-[var(--warning-soft)] px-4 py-3 text-[13px] font-semibold text-[var(--warning-700)]">
          سيتم إرسال رسالة حقيقية وقد يتم خصمها من رصيد مزود الرسائل.
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,280px)_minmax(170px,220px)_minmax(0,1fr)]">
          <SmsInput
            disabled={disabled}
            inputMode="tel"
            label="رقم الجوال"
            placeholder="0590000000"
            value={form.mobile}
            ltr
            onChange={(value) => onChange({ ...form, mobile: sanitizeLocalPhoneInput(value) })}
          />
          <SmsSelect
            disabled={disabled}
            label="نوع الرسالة"
            value={form.type}
            options={messageTypeOptions}
            onChange={(value) => onChange({ ...form, type: value as SmsProviderMessageType })}
          />
        </div>
        <SmsTextarea
          disabled={disabled}
          label="نص الرسالة"
          value={form.text}
          onChange={(value) => onChange({ ...form, text: value })}
        />
        <div className="flex justify-end">
          <button className="sanad-btn sanad-btn-primary" disabled={disabled} type="button" onClick={onSend}>
            <Send size={16} />
            {sending ? "جاري الإرسال..." : "إرسال رسالة تجريبية"}
          </button>
        </div>
      </div>
    </section>
  );
}

function MessageHistoryCard({
  logs,
  meta,
  loading,
  error,
  search,
  successFilter,
  source,
  onSearchChange,
  onSuccessFilterChange,
  onSourceChange,
  onRetry,
  onPrevious,
  onNext,
}: {
  logs: SmsProviderMessageLog[];
  meta: SuperAdminPaginationMeta;
  loading: boolean;
  error: string | null;
  search: string;
  successFilter: "all" | "success" | "failed";
  source: string;
  onSearchChange: (value: string) => void;
  onSuccessFilterChange: (value: "all" | "success" | "failed") => void;
  onSourceChange: (value: string) => void;
  onRetry: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header flex-wrap">
        <div>
          <h3 className="sanad-section-title">سجل الرسائل المرسلة</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="h-10 w-[230px] max-w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 text-[13px] outline-none focus:border-[var(--teal-700)]"
            placeholder="بحث بالرقم أو النص أو المرسل..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <select
            className="h-10 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 text-[13px] outline-none"
            value={successFilter}
            onChange={(event) => onSuccessFilterChange(event.target.value as "all" | "success" | "failed")}
          >
            <option value="all">كل الحالات</option>
            <option value="success">تم الإرسال</option>
            <option value="failed">فشل</option>
          </select>
          <select
            className="h-10 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 text-[13px] outline-none"
            value={source}
            onChange={(event) => onSourceChange(event.target.value)}
          >
            <option value="all">كل المصادر</option>
            <option value="provider_test">اختبار المزود</option>
            <option value="campaign">حملة</option>
            <option value="manual_admin">إداري</option>
            <option value="system">النظام</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-4">
          <LoadingState label="جاري تحميل سجل الرسائل..." />
        </div>
      ) : error ? (
        <div className="p-4">
          <ErrorState title="تعذر تحميل سجل الرسائل" message={error} onRetry={onRetry} />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState title="لا توجد رسائل مرسلة" description="ستظهر رسائل الاختبار هنا بعد إرسالها." icon="SMS" />
      ) : (
        <>
          <div className="sanad-table-wrap">
            <table className="sanad-table min-w-[1120px]">
              <thead>
                <tr>
                  <th>الحالة</th>
                  <th>رقم الجوال</th>
                  <th>نص الرسالة</th>
                  <th>المرسل</th>
                  <th>المصدر</th>
                  <th className="!text-center">المقاطع</th>
                  <th>أرسل بواسطة</th>
                  <th className="!text-left">كود المزود</th>
                  <th className="!text-left">Message ID</th>
                  <th className="!text-left">الرصيد بعد الإرسال</th>
                  <th className="!text-left">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <StatusBadge tone={log.success ? "success" : "danger"}>
                        {log.success ? "تم الإرسال" : "فشل"}
                      </StatusBadge>
                    </td>
                    <td className="!text-left">
                      <span className="mono-num">{log.mobile || "—"}</span>
                    </td>
                    <td>
                      <p className="max-w-[320px] truncate text-[13px] text-[var(--text)]" title={log.message_text}>
                        {log.message_text || "—"}
                      </p>
                      {!log.success && log.error_message ? (
                        <p className="mt-1 max-w-[320px] truncate text-[12px] text-[var(--danger-700)]" title={log.error_message}>
                          {log.error_message}
                        </p>
                      ) : null}
                    </td>
                    <td>{log.sender || "—"}</td>
                    <td>{smsSourceLabel(log.sms_source)}</td>
                    <td className="!text-center">
                      <span className="mono-num">{formatCount(log.segments_count)}</span>
                    </td>
                    <td>{log.sent_by_name || "—"}</td>
                    <td className="!text-left">
                      <span className="mono-num">{log.provider_code || "—"}</span>
                    </td>
                    <td className="!text-left">
                      <span className="mono-num">{log.provider_message_id || "—"}</span>
                    </td>
                    <td className="!text-left">
                      <span className="mono-num">{formatBalance(log.balance_after)}</span>
                    </td>
                    <td className="!text-left">
                      <span className="mono-num text-[12px] text-[var(--muted)]">
                        {formatAdminDateTime(log.sent_at ?? log.created_at)}
                      </span>
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
                onClick={onPrevious}
              >
                السابق
              </button>
              <button
                type="button"
                className="sanad-btn h-8 px-3 text-[12px]"
                disabled={meta.current_page >= meta.last_page}
                onClick={onNext}
              >
                التالي
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function LatestResultDetails({ debugResult }: { debugResult: DebugResult | null }) {
  return (
    <details className="sanad-card overflow-hidden">
      <summary className="cursor-pointer px-4 py-3 text-[14px] font-bold text-[var(--text)]">
        تفاصيل آخر عملية
      </summary>
      <div className="divide-y divide-[var(--hairline-2)] border-t border-[var(--hairline-2)] px-4 py-2">
        {!debugResult ? (
          <p className="py-4 text-center text-[13px] text-[var(--muted)]">لا توجد عملية حديثة.</p>
        ) : debugResult.type === "balance" ? (
          <>
            <InfoRow label="كود المزود" value={debugResult.result.code ?? "—"} mono />
            <InfoRow label="الرصيد بعد الفحص" value={formatBalance(debugResult.result.balance)} mono />
            <InfoRow label="Raw response" value={debugResult.result.raw_response ?? "—"} mono />
          </>
        ) : (
          <>
            <InfoRow label="الحالة" value={debugResult.result.success ? "تم الإرسال" : "فشل"} />
            {!debugResult.result.success ? <InfoRow label="الخطأ" value={debugResult.result.message} /> : null}
            <InfoRow label="كود المزود" value={debugResult.result.code ?? "—"} mono />
            <InfoRow label="Message ID" value={debugResult.result.provider_message_id ?? "—"} mono />
            <InfoRow label="الرصيد بعد الإرسال" value={formatBalance(debugResult.result.balance_after ?? null)} mono />
            <InfoRow label="Raw response" value={debugResult.result.raw_response ?? "—"} mono />
          </>
        )}
      </div>
    </details>
  );
}

function ActionNoticeBar({ notice }: { notice: ActionNotice }) {
  const toneClasses: Record<ActionNotice["tone"], string> = {
    success: "border-[var(--success-soft)] bg-[var(--success-soft)] text-[var(--success-700)]",
    warning: "border-[var(--warning-soft)] bg-[var(--warning-soft)] text-[var(--warning-700)]",
    danger: "border-[var(--danger-soft)] bg-[var(--danger-soft)] text-[var(--danger-700)]",
  };

  return (
    <div className={`mb-4 rounded-[var(--r-md)] border px-4 py-3 text-[14px] font-semibold ${toneClasses[notice.tone]}`}>
      {notice.message}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  compact,
}: {
  label: string;
  value: string;
  mono?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${compact ? "py-0" : "py-3"} text-[13px]`}>
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`${mono ? "mono-num text-left" : "text-start"} font-semibold text-[var(--text)]`}>{value}</span>
    </div>
  );
}

function SmsInput({
  label,
  value,
  disabled,
  helper,
  inputMode,
  ltr,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  helper?: string;
  inputMode?: "text" | "url" | "numeric" | "tel";
  ltr?: boolean;
  placeholder?: string;
  type?: "text" | "password" | "number" | "url";
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">{label}</span>
      <input
        className={`h-11 w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--teal-700)] ${ltr ? "text-left mono-num" : ""}`}
        dir={ltr ? "ltr" : undefined}
        disabled={disabled}
        inputMode={inputMode}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper ? <span className="mt-1.5 block text-[12.5px] leading-6 text-[var(--muted)]">{helper}</span> : null}
    </label>
  );
}

function SmsTextarea({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">{label}</span>
      <textarea
        className="min-h-[86px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SmsSelect({
  label,
  value,
  disabled,
  options,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">{label}</span>
      <select
        className="h-11 w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Switch({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={`focus-ring relative h-8 w-14 shrink-0 rounded-full border transition ${
        checked
          ? "border-[var(--teal-700)] bg-[var(--teal-700)]"
          : "border-[var(--border)] bg-[var(--cream)]"
      }`}
      disabled={disabled}
      role="switch"
      type="button"
      onClick={onChange}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-[var(--shadow-1)] transition ${
          checked ? "start-1" : "start-7"
        }`}
      />
    </button>
  );
}

function smsProviderSettingsToForm(settings: SuperAdminSmsProviderSettings): UpdateSmsProviderSettingsInput {
  return {
    enabled: settings.enabled,
    auth_mode: settings.auth_mode,
    api_token: "",
    user_name: settings.user_name ?? "",
    user_pass: "",
    sender: settings.sender ?? "",
    send_url: settings.send_url,
    balance_url: settings.balance_url,
    default_message_type: settings.default_message_type,
    request_method: settings.request_method,
    msg_id: settings.msg_id,
    timeout_seconds: settings.timeout_seconds,
  };
}

function validateSmsProviderForm(
  form: UpdateSmsProviderSettingsInput,
  settings: SuperAdminSmsProviderSettings | null,
): string | null {
  if (form.enabled && !form.sender?.trim()) {
    return "اسم المرسل مطلوب عند تفعيل الرسائل النصية.";
  }

  if (form.auth_mode === "api_token" && !form.api_token?.trim() && !settings?.api_token_masked) {
    return "API Token مطلوب عند عدم وجود رمز محفوظ سابقًا.";
  }

  if (form.auth_mode === "user_password") {
    if (!form.user_name?.trim()) {
      return "اسم المستخدم مطلوب عند استخدام اسم مستخدم وكلمة مرور.";
    }

    if (!form.user_pass?.trim() && !settings?.user_pass_masked) {
      return "كلمة المرور مطلوبة عند عدم وجود كلمة مرور محفوظة سابقًا.";
    }
  }

  if (!isRequiredUrl(form.send_url)) {
    return "رابط الإرسال يجب أن يكون رابطًا صالحًا يبدأ بـ http:// أو https://.";
  }

  if (!isRequiredUrl(form.balance_url)) {
    return "رابط فحص الرصيد يجب أن يكون رابطًا صالحًا يبدأ بـ http:// أو https://.";
  }

  if (!Number.isInteger(form.timeout_seconds) || form.timeout_seconds < 3 || form.timeout_seconds > 60) {
    return "مهلة الاتصال يجب أن تكون رقمًا بين 3 و 60 ثانية.";
  }

  return null;
}

function validateSmsTestForm(form: SmsTestForm): string | null {
  if (!form.mobile.trim()) {
    return "رقم الجوال مطلوب لإرسال الرسالة التجريبية.";
  }

  if (!isValidLocalPhone(form.mobile)) {
    return "رقم الجوال يجب أن يكون 10 أرقام ويبدأ بصفر.";
  }

  if (!form.text.trim()) {
    return "نص الرسالة مطلوب لإرسال الرسالة التجريبية.";
  }

  return null;
}

function applyBalanceToSettings(
  settings: SuperAdminSmsProviderSettings | null,
  balance: string | null,
): SuperAdminSmsProviderSettings | null {
  if (!settings) return settings;

  return {
    ...settings,
    last_balance: balance,
    last_balance_checked_at: new Date().toISOString(),
  };
}

function authModeLabel(value: UpdateSmsProviderSettingsInput["auth_mode"]): string {
  return value === "user_password" ? "اسم مستخدم وكلمة مرور" : "API Token";
}

function formatBalance(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return `${String(value)} رسالة`;
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function smsSourceLabel(value?: string | null): string {
  const labels: Record<string, string> = {
    provider_test: "اختبار المزود",
    campaign: "حملة",
    manual_admin: "إداري",
    system: "النظام",
  };

  return value ? labels[value] ?? value : "—";
}

function isRequiredUrl(value?: string): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return false;

  return isOptionalUrl(trimmed);
}

function isOptionalUrl(value?: string): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
