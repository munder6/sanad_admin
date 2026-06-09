"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { superAdminApi } from "@/lib/api/superAdminApi";
import { getToken, setStoredUser, setToken } from "@/lib/auth/authStorage";
import { isValidLocalPhone, sanitizeLocalPhoneInput } from "@/lib/formatters/number";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!phone.trim() || !password) {
      setError("يرجى إدخال رقم الهاتف وكلمة المرور.");
      return;
    }

    if (!isValidLocalPhone(phone)) {
      setError("رقم الجوال يجب أن يكون 10 أرقام ويبدأ بصفر.");
      return;
    }

    setLoading(true);

    try {
      const result = await superAdminApi.login(phone.trim(), password);
      setToken(result.token);
      setStoredUser(result.user);
      router.replace("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="sanad-login">
      <section className="sanad-login-hero">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-[14px] bg-[linear-gradient(135deg,#C8985A,#A67A3F)] text-3xl font-bold text-[var(--primary-dark)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_rgba(0,0,0,0.2)]">
            س
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">سَنَد</p>
            <p className="text-[12px] text-[#9BC0BE]">Sanad Super Admin Dashboard</p>
          </div>
        </div>

        <div className="max-w-[620px]">
          <p className="text-[15px] font-medium text-[var(--gold)]">منصة الإدارة العليا</p>
          <h1 className="mt-4 text-[34px] font-semibold leading-[1.35]">
            مراقبة المحلات، المستخدمين، الحركات، وأوامر الذكاء الصناعي.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-8 text-[#C9DEDC]">
            واجهة عربية RTL مصممة لفريق مالك المنصة، مرتبطة بنطاق
            /api/super-admin فقط في هذه المرحلة.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-[13px]">
          {["حماية صلاحيات", "نظرة تشغيلية", "هوية سَنَد"].map((item) => (
            <div key={item} className="rounded-[12px] border border-white/10 bg-white/[0.06] p-4 text-[#DDE9E8]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center lg:px-10">
        <div className="sanad-login-card">
          <div className="mb-8">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-[12px] bg-[var(--primary)] text-2xl font-bold text-[var(--gold)] lg:hidden">
              س
            </div>
            <p className="text-[15px] font-medium text-[var(--gold-700)]">تسجيل دخول المشرف العام</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">مرحباً بك في لوحة سَنَد</h2>
            <p className="mt-2 text-[14px] text-[var(--muted)]">استخدم رقم الهاتف وكلمة المرور الخاصة بحساب Super Admin.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-[14px] font-semibold text-[var(--text)]">رقم الهاتف</span>
              <input
                value={phone}
                onChange={(event) => setPhone(sanitizeLocalPhoneInput(event.target.value))}
                autoComplete="tel"
                inputMode="tel"
                maxLength={10}
                className="focus-ring mt-2 w-full rounded-[var(--r-md)] border border-[var(--hairline)] bg-white px-4 py-3 text-right text-[15px] shadow-[var(--shadow-1)] placeholder:text-[var(--muted-2)]"
                placeholder="مثال: 0590000000"
              />
            </label>

            <label className="block">
              <span className="text-[14px] font-semibold text-[var(--text)]">كلمة المرور</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                type="password"
                className="focus-ring mt-2 w-full rounded-[var(--r-md)] border border-[var(--hairline)] bg-white px-4 py-3 text-right text-[15px] shadow-[var(--shadow-1)] placeholder:text-[var(--muted-2)]"
                placeholder="أدخل كلمة المرور"
              />
            </label>

            {error ? (
              <div className="rounded-[var(--r-md)] border border-[#F0CDC9] bg-[var(--danger-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--danger-700)]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring w-full rounded-[var(--r-md)] bg-[var(--primary)] px-4 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[rgba(15,95,92,0.18)] transition hover:bg-[var(--primary-dark)] disabled:opacity-60"
            >
              {loading ? "جاري تسجيل الدخول..." : "دخول إلى لوحة المشرف"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
