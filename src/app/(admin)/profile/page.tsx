"use client";

import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  superAdminApi,
  type ChangeMyPasswordInput,
  type SuperAdminProfile,
  type UpdateMyProfileInput,
} from "@/lib/api/superAdminApi";
import { setStoredUser } from "@/lib/auth/authStorage";
import { formatArabicDateTime } from "@/lib/formatters/date";
import { isValidLocalPhone, sanitizeLocalPhoneInput } from "@/lib/formatters/number";

type AccountForm = {
  name: string;
  phone: string;
  email: string;
};

const emptyAccountForm: AccountForm = {
  name: "",
  phone: "",
  email: "",
};

const emptyPasswordForm: ChangeMyPasswordInput = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<SuperAdminProfile | null>(null);
  const [accountForm, setAccountForm] = useState<AccountForm>(emptyAccountForm);
  const [passwordForm, setPasswordForm] = useState<ChangeMyPasswordInput>(emptyPasswordForm);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [accountSaving, setAccountSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);
      const currentProfile = await superAdminApi.getMyProfile();
      setProfile(currentProfile);
      setAccountForm({
        name: currentProfile.name ?? "",
        phone: currentProfile.phone ?? "",
        email: currentProfile.email ?? "",
      });
    } catch (caught) {
      setPageError(caught instanceof Error ? caught.message : "تعذر تحميل بياناتي.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  const submitAccount = useCallback(async () => {
    if (!canSubmitAccount(accountForm)) {
      setAccountError("الاسم مطلوب، ورقم الجوال يجب أن يكون 10 أرقام ويبدأ بصفر.");
      return;
    }

    try {
      setAccountSaving(true);
      setAccountError(null);
      setSuccessMessage(null);

      const payload: UpdateMyProfileInput = {
        name: accountForm.name,
        phone: accountForm.phone,
        email: accountForm.email,
      };
      const updated = await superAdminApi.updateMyProfile(payload);

      setProfile(updated);
      setAccountForm({
        name: updated.name ?? "",
        phone: updated.phone ?? "",
        email: updated.email ?? "",
      });
      setStoredUser(updated);
      window.dispatchEvent(new CustomEvent("sanad-super-admin-user-updated", { detail: updated }));
      setSuccessMessage("تم تحديث بياناتك بنجاح.");
    } catch (caught) {
      setAccountError(caught instanceof Error ? caught.message : "تعذر تحديث بياناتك.");
    } finally {
      setAccountSaving(false);
    }
  }, [accountForm]);

  const submitPassword = useCallback(async () => {
    if (!canSubmitPassword(passwordForm)) {
      setPasswordError("تحقق من كلمة المرور الحالية وتأكيد كلمة المرور الجديدة.");
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordError(null);
      setSuccessMessage(null);

      const response = await superAdminApi.changeMyPassword(passwordForm);
      setPasswordForm(emptyPasswordForm);
      setSuccessMessage(response.message || "تم تغيير كلمة المرور بنجاح.");
    } catch (caught) {
      setPasswordError(caught instanceof Error ? caught.message : "تعذر تغيير كلمة المرور.");
    } finally {
      setPasswordSaving(false);
    }
  }, [passwordForm]);

  return (
    <>
      <div className="sanad-page-head">
        <div>
          <p>المشرف / بياناتي</p>
          <h2>بياناتي</h2>
          <p>تعديل بياناتي وتغيير كلمة المرور.</p>
        </div>
        <StatusBadge tone="gold">المشرف العام</StatusBadge>
      </div>

      {loading ? (
        <LoadingState label="جاري تحميل بياناتي..." />
      ) : pageError ? (
        <ErrorState title="تعذر تحميل بياناتي" message={pageError} onRetry={loadProfile} />
      ) : profile ? (
        <div className="space-y-[14px]">
          {successMessage ? (
            <div className="rounded-[var(--r-md)] border border-[var(--success-soft)] bg-[var(--success-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--success-700)]">
              {successMessage}
            </div>
          ) : null}

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">بيانات الحساب</h3>
                <p className="sanad-section-subtitle">المشرف الحالي فقط.</p>
              </div>
              <StatusBadge tone="teal">المشرف</StatusBadge>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <ProfileInput
                id="profile-name"
                label="الاسم"
                disabled={accountSaving}
                value={accountForm.name}
                onChange={(value) => setAccountForm((current) => ({ ...current, name: value }))}
              />
              <ProfileInput
                id="profile-phone"
                label="رقم الهاتف"
                disabled={accountSaving}
                value={accountForm.phone}
                onChange={(value) => setAccountForm((current) => ({ ...current, phone: sanitizeLocalPhoneInput(value) }))}
              />
              <ProfileInput
                id="profile-email"
                label="البريد الإلكتروني"
                disabled={accountSaving}
                type="email"
                value={accountForm.email}
                onChange={(value) => setAccountForm((current) => ({ ...current, email: value }))}
                optional
              />
              <ReadonlyValue label="الصلاحية" value={profile.role_label ?? "المشرف العام"} />
              <ReadonlyValue label="تاريخ الإنشاء" value={formatDate(profile.created_at)} />
              <ReadonlyValue label="آخر تحديث" value={formatDate(profile.updated_at)} />
              {accountError ? (
                <div className="rounded-[var(--r-md)] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--danger-700)] sm:col-span-2">
                  {accountError}
                </div>
              ) : null}
            </div>
            <div className="flex justify-end border-t border-[var(--hairline-2)] px-5 py-4">
              <button
                className="sanad-btn sanad-btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
                disabled={accountSaving}
                type="button"
                onClick={submitAccount}
              >
                {accountSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </section>

          <section className="sanad-card overflow-hidden">
            <div className="sanad-card-header">
              <div>
                <h3 className="sanad-section-title">تغيير كلمة المرور</h3>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <ProfileInput
                id="profile-current-password"
                label="كلمة المرور الحالية"
                disabled={passwordSaving}
                type="password"
                value={passwordForm.current_password}
                onChange={(value) => setPasswordForm((current) => ({ ...current, current_password: value }))}
              />
              <ProfileInput
                id="profile-new-password"
                label="كلمة المرور الجديدة"
                disabled={passwordSaving}
                type="password"
                value={passwordForm.password}
                onChange={(value) => setPasswordForm((current) => ({ ...current, password: value }))}
              />
              <ProfileInput
                id="profile-password-confirmation"
                label="تأكيد كلمة المرور"
                disabled={passwordSaving}
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(value) => setPasswordForm((current) => ({ ...current, password_confirmation: value }))}
              />
              {passwordError ? (
                <div className="rounded-[var(--r-md)] border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--danger-700)] sm:col-span-2">
                  {passwordError}
                </div>
              ) : null}
            </div>
            <div className="flex justify-end border-t border-[var(--hairline-2)] px-5 py-4">
              <button
                className="sanad-btn sanad-btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
                disabled={passwordSaving}
                type="button"
                onClick={submitPassword}
              >
                {passwordSaving ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function ProfileInput({
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

function ReadonlyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--r-md)] border border-[var(--hairline-2)] bg-[var(--paper)] px-3 py-2">
      <p className="text-[12.5px] font-semibold text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-[14px] font-semibold text-[var(--text)]">{value}</p>
    </div>
  );
}

function canSubmitAccount(form: AccountForm): boolean {
  return Boolean(form.name.trim() && isValidLocalPhone(form.phone));
}

function canSubmitPassword(form: ChangeMyPasswordInput): boolean {
  return Boolean(
    form.current_password.trim()
      && form.password.length >= 8
      && form.password === form.password_confirmation,
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return formatArabicDateTime(value);
}
