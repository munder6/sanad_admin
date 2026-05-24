"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ApiError } from "@/lib/api/apiClient";
import {
  superAdminApi,
  type SuperAdminFeatureFlag,
  type SuperAdminPlatformSettingsResponse,
  type UpdatePlatformSettingsInput,
} from "@/lib/api/superAdminApi";
import { formatArabicDateTime } from "@/lib/formatters/date";

export default function SystemSettingsPage() {
  const [featureFlags, setFeatureFlags] = useState<SuperAdminFeatureFlag[]>([]);
  const [featureFlagsLoading, setFeatureFlagsLoading] = useState(true);
  const [featureFlagsRefreshing, setFeatureFlagsRefreshing] = useState(false);
  const [featureFlagsError, setFeatureFlagsError] = useState<string | null>(null);
  const [featureFlagsForbidden, setFeatureFlagsForbidden] = useState(false);
  const [featureFlagActionError, setFeatureFlagActionError] = useState<string | null>(null);
  const [pendingRegistrationValue, setPendingRegistrationValue] = useState<boolean | null>(null);
  const [savingFeatureFlag, setSavingFeatureFlag] = useState(false);
  const [featureFlagSuccess, setFeatureFlagSuccess] = useState<string | null>(null);
  const [platformSettings, setPlatformSettings] = useState<SuperAdminPlatformSettingsResponse | null>(null);
  const [platformForm, setPlatformForm] = useState<UpdatePlatformSettingsInput>(defaultPlatformForm);
  const [platformLoading, setPlatformLoading] = useState(true);
  const [platformSaving, setPlatformSaving] = useState(false);
  const [platformError, setPlatformError] = useState<string | null>(null);
  const [platformSuccess, setPlatformSuccess] = useState<string | null>(null);
  const successTimer = useRef<number | null>(null);

  const loadFeatureFlags = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setFeatureFlagsRefreshing(true);
      } else {
        setFeatureFlagsLoading(true);
      }
      setFeatureFlagsError(null);
      setFeatureFlagActionError(null);
      setFeatureFlagsForbidden(false);
      setFeatureFlags(await superAdminApi.getFeatureFlags());
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setFeatureFlagsForbidden(true);
      }
      setFeatureFlagsError(caught instanceof Error ? caught.message : "تعذر تحميل إعدادات المنصة.");
    } finally {
      setFeatureFlagsLoading(false);
      setFeatureFlagsRefreshing(false);
    }
  }, []);

  const loadPlatformSettings = useCallback(async () => {
    try {
      setPlatformLoading(true);
      setPlatformError(null);
      const response = await superAdminApi.getPlatformSettings();
      setPlatformSettings(response);
      setPlatformForm(platformResponseToForm(response));
    } catch (caught) {
      setPlatformError(caught instanceof Error ? caught.message : "تعذر تحميل إعدادات الوصول والتوفر.");
    } finally {
      setPlatformLoading(false);
    }
  }, []);

  const savePlatformSettings = useCallback(async () => {
    const validationError = validatePlatformForm(platformForm);

    if (validationError) {
      setPlatformSuccess(null);
      setPlatformError(validationError);
      return;
    }

    try {
      setPlatformSaving(true);
      setPlatformError(null);
      setPlatformSuccess(null);
      const response = await superAdminApi.updatePlatformSettings(platformForm);
      setPlatformSettings(response);
      setPlatformForm(platformResponseToForm(response));
      setPlatformSuccess("تم حفظ إعدادات النظام.");
    } catch (caught) {
      setPlatformError(caught instanceof Error ? caught.message : "تعذر حفظ إعدادات النظام.");
    } finally {
      setPlatformSaving(false);
    }
  }, [platformForm]);

  const showFeatureFlagSuccess = useCallback((message: string) => {
    setFeatureFlagSuccess(message);

    if (successTimer.current) {
      window.clearTimeout(successTimer.current);
    }

    successTimer.current = window.setTimeout(() => {
      setFeatureFlagSuccess(null);
      successTimer.current = null;
    }, 4500);
  }, []);

  const confirmRegistrationChange = useCallback(async () => {
    if (pendingRegistrationValue === null) return;

    try {
      setSavingFeatureFlag(true);
      setFeatureFlagActionError(null);
      const updatedFlag = await superAdminApi.updateFeatureFlag("public_registration_enabled", pendingRegistrationValue);

      setFeatureFlags((currentFlags) => {
        const nextFlags = currentFlags.filter((flag) => flag.key !== updatedFlag.key);
        return [updatedFlag, ...nextFlags];
      });
      setPendingRegistrationValue(null);
      showFeatureFlagSuccess(updatedFlag.value ? "تم فتح التسجيل العام." : "تم إغلاق التسجيل العام.");
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        setFeatureFlagsForbidden(true);
      }
      setPendingRegistrationValue(null);
      setFeatureFlagActionError(caught instanceof Error ? caught.message : "تعذر حفظ إعداد التسجيل العام.");
    } finally {
      setSavingFeatureFlag(false);
    }
  }, [pendingRegistrationValue, showFeatureFlagSuccess]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadFeatureFlags();
      loadPlatformSettings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadFeatureFlags, loadPlatformSettings]);

  useEffect(() => {
    return () => {
      if (successTimer.current) {
        window.clearTimeout(successTimer.current);
      }
    };
  }, []);

  const registrationFlag = featureFlags.find((flag) => flag.key === "public_registration_enabled") ?? null;

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>النظام / إعدادات النظام</p>
          <h2>إعدادات النظام</h2>
          <p>تحكم في التسجيل العام، توفر الخدمة، وروابط الدعم.</p>
        </div>
        <div className="sanad-page-actions">
          <Link href="/system" className="sanad-btn">صحة النظام</Link>
        </div>
      </div>

      <div className="space-y-[14px]">
        {featureFlagsLoading ? (
          <LoadingState label="جاري تحميل إعدادات المنصة..." />
        ) : featureFlagsError ? (
          <ErrorState
            title={featureFlagsForbidden ? "وصول غير مسموح" : "تعذر تحميل إعدادات المنصة"}
            message={featureFlagsError}
            onRetry={() => loadFeatureFlags()}
          />
        ) : registrationFlag ? (
          <RegistrationControlCard
            flag={registrationFlag}
            errorMessage={featureFlagActionError}
            loading={featureFlagsRefreshing || savingFeatureFlag}
            successMessage={featureFlagSuccess}
            onRefresh={() => loadFeatureFlags(true)}
            onRequestChange={(nextValue) => {
              setFeatureFlagSuccess(null);
              setFeatureFlagActionError(null);
              setPendingRegistrationValue(nextValue);
            }}
          />
        ) : (
          <ErrorState
            title="إعداد غير متوفر"
            message="لم يرجع الخادم إعداد التسجيل العام."
            onRetry={() => loadFeatureFlags()}
          />
        )}

        <PlatformAccessCard
          errorMessage={platformError}
          form={platformForm}
          loading={platformLoading}
          saving={platformSaving}
          settings={platformSettings}
          successMessage={platformSuccess}
          onChange={(value) => {
            setPlatformSuccess(null);
            setPlatformError(null);
            setPlatformForm(value);
          }}
          onRefresh={loadPlatformSettings}
          onSave={savePlatformSettings}
        />
      </div>

      <ConfirmDialog
        open={pendingRegistrationValue !== null}
        title={pendingRegistrationValue ? "فتح التسجيل العام؟" : "إغلاق التسجيل العام؟"}
        body={
          pendingRegistrationValue
            ? "سيتم السماح بإنشاء حسابات جديدة من التطبيق."
            : "سيتم منع إنشاء حسابات جديدة. لن يتأثر المستخدمون الحاليون."
        }
        confirmLabel={pendingRegistrationValue ? "فتح التسجيل" : "إغلاق التسجيل"}
        tone={pendingRegistrationValue ? "primary" : "danger"}
        loading={savingFeatureFlag}
        onCancel={() => {
          if (!savingFeatureFlag) setPendingRegistrationValue(null);
        }}
        onConfirm={confirmRegistrationChange}
      />
    </>
  );
}

function RegistrationControlCard({
  flag,
  errorMessage,
  loading,
  successMessage,
  onRefresh,
  onRequestChange,
}: {
  flag: SuperAdminFeatureFlag;
  errorMessage: string | null;
  loading: boolean;
  successMessage: string | null;
  onRefresh: () => void;
  onRequestChange: (nextValue: boolean) => void;
}) {
  const enabled = flag.value;

  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header flex-wrap">
        <div>
          <h3 className="sanad-section-title">التسجيل العام</h3>
          <p className="sanad-section-subtitle">
            {enabled
              ? "يمكن للمستخدمين إنشاء حسابات جديدة من التطبيق."
              : "التسجيل مغلق حاليًا. يمكن للمستخدمين الحاليين تسجيل الدخول فقط."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={enabled ? "success" : "warning"}>{enabled ? "مفتوح" : "مغلق"}</StatusBadge>
          <button
            className="sanad-btn h-9 px-3 text-[12.5px]"
            disabled={loading}
            type="button"
            onClick={onRefresh}
          >
            {loading ? "جاري التحديث..." : "تحديث"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="space-y-3">
          <div className="rounded-[var(--r-md)] border border-[var(--hairline-2)] bg-[var(--paper)] p-4">
            <p className="text-[14.5px] font-semibold text-[var(--text)]">أثر الإعداد</p>
            <p className="mt-2 text-[14px] leading-7 text-[var(--text-2)]">
              {enabled
                ? "فتح التسجيل يسمح لأي مستخدم جديد بإنشاء حساب من التطبيق."
                : "إغلاق التسجيل يمنع إنشاء حسابات جديدة، ولا يؤثر على تسجيل دخول المستخدمين الحاليين."}
            </p>
          </div>

          {successMessage ? (
            <div className="rounded-[var(--r-md)] border border-[var(--success-soft)] bg-[var(--success-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--success-700)]">
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-[var(--r-md)] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--danger-700)]">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="rounded-[var(--r-md)] border border-[var(--hairline-2)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-bold text-[var(--text)]">تفعيل التسجيل العام</p>
              <p className="mt-1 text-[13px] text-[var(--muted)]">يتطلب تأكيدًا قبل الحفظ.</p>
            </div>
            <button
              aria-checked={enabled}
              aria-label="تفعيل التسجيل العام"
              className={`focus-ring relative h-8 w-14 shrink-0 rounded-full border transition ${
                enabled
                  ? "border-[var(--teal-700)] bg-[var(--teal-700)]"
                  : "border-[var(--border)] bg-[var(--cream)]"
              }`}
              disabled={loading}
              role="switch"
              type="button"
              onClick={() => onRequestChange(!enabled)}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-[var(--shadow-1)] transition ${
                  enabled ? "start-1" : "start-7"
                }`}
              />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--hairline-2)] pt-3 text-[13px] text-[var(--muted)]">
            <span>آخر تحديث</span>
            <span className="mono-num text-left">{formatDateTime(flag.updated_at)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const defaultPlatformForm: UpdatePlatformSettingsInput = {
  account_suspension_title_ar: "حسابك غير متاح حاليًا",
  account_suspension_message_ar: "يرجى التواصل مع الإدارة لمراجعة حالة الحساب.",
  account_suspension_support_url: "",
  maintenance_enabled: false,
  maintenance_title_ar: "الخدمة قيد الصيانة",
  maintenance_message_ar: "نعمل على تحسين الخدمة. سنعود قريبًا.",
  maintenance_support_url: "",
};

function PlatformAccessCard({
  form,
  settings,
  loading,
  saving,
  errorMessage,
  successMessage,
  onChange,
  onRefresh,
  onSave,
}: {
  form: UpdatePlatformSettingsInput;
  settings: SuperAdminPlatformSettingsResponse | null;
  loading: boolean;
  saving: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onChange: (value: UpdatePlatformSettingsInput) => void;
  onRefresh: () => void;
  onSave: () => void;
}) {
  const disabled = loading || saving;

  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header flex-wrap">
        <div>
          <h3 className="sanad-section-title">الوصول والتوفر</h3>
          <p className="sanad-section-subtitle">إعدادات الصيانة وروابط الدعم التي تتحكم بتجربة الوصول للتطبيق.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={form.maintenance_enabled ? "warning" : "success"}>
            {form.maintenance_enabled ? "الصيانة مفعّلة" : "الخدمة متاحة"}
          </StatusBadge>
          <button className="sanad-btn h-9 px-3 text-[12.5px]" disabled={disabled} type="button" onClick={onRefresh}>
            {loading ? "جاري التحديث..." : "تحديث"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-4">
          <LoadingState label="جاري تحميل إعدادات الوصول..." />
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-[var(--r-md)] border border-[var(--hairline-2)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-bold text-[var(--text)]">إعدادات الصيانة</p>
                    <p className="mt-1 text-[13px] leading-6 text-[var(--muted)]">عند تفعيل الصيانة ستظهر شاشة صيانة للمستخدمين داخل التطبيق.</p>
                  </div>
                  <button
                    aria-checked={form.maintenance_enabled}
                    aria-label="تفعيل وضع الصيانة"
                    className={`focus-ring relative h-8 w-14 shrink-0 rounded-full border transition ${
                      form.maintenance_enabled
                        ? "border-[var(--warning-700)] bg-[var(--warning-700)]"
                        : "border-[var(--border)] bg-[var(--cream)]"
                    }`}
                    disabled={disabled}
                    role="switch"
                    type="button"
                    onClick={() => onChange({ ...form, maintenance_enabled: !form.maintenance_enabled })}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-[var(--shadow-1)] transition ${
                        form.maintenance_enabled ? "start-1" : "start-7"
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-4 border-t border-[var(--hairline-2)] pt-3 text-[13px] text-[var(--muted)]">
                  آخر تحديث: <span className="mono-num">{latestPlatformUpdate(settings)}</span>
                </div>
              </div>

              <div className="rounded-[var(--r-md)] border border-[var(--hairline-2)] bg-[var(--paper)] p-4">
                <p className="text-[14.5px] font-semibold text-[var(--text)]">الحسابات غير المتاحة</p>
                <p className="mt-2 text-[14px] leading-7 text-[var(--text-2)]">
                  النص ورابط التواصل اللذان يظهران للمستخدم عندما يكون حسابه غير متاح.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <PlatformInput
                disabled={disabled}
                label="عنوان الصيانة"
                value={form.maintenance_title_ar ?? ""}
                onChange={(value) => onChange({ ...form, maintenance_title_ar: value })}
              />
              <PlatformInput
                disabled={disabled}
                inputMode="url"
                label="رابط دعم الصيانة"
                value={form.maintenance_support_url ?? ""}
                onChange={(value) => onChange({ ...form, maintenance_support_url: value })}
              />
              <div className="md:col-span-2">
                <PlatformTextarea
                  disabled={disabled}
                  label="رسالة الصيانة"
                  value={form.maintenance_message_ar ?? ""}
                  onChange={(value) => onChange({ ...form, maintenance_message_ar: value })}
                />
              </div>
              <div className="md:col-span-2">
                <PlatformInput
                  disabled={disabled}
                  label="عنوان شاشة الحساب غير المتاح"
                  value={form.account_suspension_title_ar ?? ""}
                  onChange={(value) => onChange({ ...form, account_suspension_title_ar: value })}
                />
              </div>
              <div className="md:col-span-2">
                <PlatformTextarea
                  disabled={disabled}
                  label="رسالة شاشة الحساب غير المتاح"
                  value={form.account_suspension_message_ar ?? ""}
                  onChange={(value) => onChange({ ...form, account_suspension_message_ar: value })}
                />
              </div>
              <div className="md:col-span-2">
                <PlatformInput
                  disabled={disabled}
                  helper="يظهر هذا الرابط للمستخدم عند إيقاف حسابه مؤقتًا."
                  inputMode="url"
                  label="رابط التواصل مع الإدارة"
                  value={form.account_suspension_support_url ?? ""}
                  onChange={(value) => onChange({ ...form, account_suspension_support_url: value })}
                />
              </div>
            </div>
          </div>

          {successMessage ? (
            <div className="rounded-[var(--r-md)] border border-[var(--success-soft)] bg-[var(--success-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--success-700)]">
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-[var(--r-md)] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--danger-700)]">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button className="sanad-btn sanad-btn-primary" disabled={disabled} type="button" onClick={onSave}>
              {saving ? "جاري الحفظ..." : "حفظ إعدادات النظام"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function PlatformInput({
  label,
  value,
  disabled,
  helper,
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  helper?: string;
  inputMode?: "text" | "url";
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">{label}</span>
      <input
        className="h-11 w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
        disabled={disabled}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper ? <span className="mt-1.5 block text-[12.5px] leading-6 text-[var(--muted)]">{helper}</span> : null}
    </label>
  );
}

function PlatformTextarea({
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
        className="min-h-[96px] w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-[14px] leading-7 text-[var(--text)] outline-none transition focus:border-[var(--teal-700)]"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function platformResponseToForm(response: SuperAdminPlatformSettingsResponse): UpdatePlatformSettingsInput {
  const settingValue = (key: keyof UpdatePlatformSettingsInput): string | boolean | undefined => {
    const setting = response.settings.find((item) => item.key === key);
    return setting?.value;
  };

  return {
    account_suspension_title_ar: String(settingValue("account_suspension_title_ar") ?? response.status.support.account_suspension_title_ar ?? "حسابك غير متاح حاليًا"),
    account_suspension_message_ar: String(settingValue("account_suspension_message_ar") ?? response.status.support.account_suspension_message_ar ?? "يرجى التواصل مع الإدارة لمراجعة حالة الحساب."),
    account_suspension_support_url: String(settingValue("account_suspension_support_url") ?? response.status.support.account_suspension_url ?? ""),
    maintenance_enabled: toBool(settingValue("maintenance_enabled") ?? response.status.server.maintenance_enabled),
    maintenance_title_ar: String(settingValue("maintenance_title_ar") ?? response.status.server.maintenance_title_ar),
    maintenance_message_ar: String(settingValue("maintenance_message_ar") ?? response.status.server.maintenance_message_ar),
    maintenance_support_url: String(settingValue("maintenance_support_url") ?? response.status.server.maintenance_support_url ?? ""),
  };
}

function validatePlatformForm(form: UpdatePlatformSettingsInput): string | null {
  if (!isOptionalUrl(form.maintenance_support_url)) {
    return "رابط دعم الصيانة يجب أن يكون رابطًا صالحًا يبدأ بـ http:// أو https://.";
  }

  if (!isOptionalUrl(form.account_suspension_support_url)) {
    return "رابط التواصل مع الإدارة يجب أن يكون رابطًا صالحًا يبدأ بـ http:// أو https://.";
  }

  return null;
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

function toBool(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  return value === "1" || value === "true";
}

function latestPlatformUpdate(settings: SuperAdminPlatformSettingsResponse | null): string {
  if (!settings?.settings.length) return "-";

  const latest = settings.settings
    .map((setting) => setting.updated_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  return formatDateTime(latest);
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";

  try {
    return formatArabicDateTime(value);
  } catch {
    return value;
  }
}
