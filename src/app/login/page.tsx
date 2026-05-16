"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { superAdminApi } from "@/lib/api/superAdminApi";
import { getToken, setStoredUser, setToken } from "@/lib/auth/authStorage";

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
    <main className="grid min-h-screen bg-[var(--primary-dark)] p-6 lg:grid-cols-[1fr_520px]">
      <section className="hidden min-h-[calc(100vh-3rem)] flex-col justify-between rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(200,152,90,0.22),transparent_32%),linear-gradient(145deg,#0F5F5C,#0A3F3D)] p-10 text-white lg:flex">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-3xl border border-[var(--gold)] bg-white/8 text-4xl font-bold text-[var(--gold)]">
            س
          </div>
          <div>
            <p className="text-2xl font-semibold text-[var(--gold)]">سَنَد</p>
            <p className="text-sm text-white/58">Sanad Super Admin Dashboard</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[var(--gold)]">منصة الإدارة العليا</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            مراقبة المحلات، المستخدمين، الحركات، وأوامر الذكاء الصناعي من مكان واحد.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/66">
            واجهة عربية RTL مصممة لفريق مالك المنصة، مرتبطة بنطاق
            /api/super-admin فقط في هذه المرحلة.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          {["حماية صلاحيات", "نظرة تشغيلية", "تصميم سَنَد"].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/8 p-4 text-white/72">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center lg:px-10">
        <div className="w-full max-w-md rounded-[24px] border border-[var(--hairline)] bg-[var(--cream)] p-7 shadow-2xl shadow-black/20">
          <div className="mb-8">
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--primary)] text-3xl font-bold text-[var(--gold)] lg:hidden">
              س
            </div>
            <p className="text-sm font-medium text-[var(--gold)]">تسجيل دخول المشرف العام</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">مرحباً بك في لوحة سَنَد</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">استخدم رقم الهاتف وكلمة المرور الخاصة بحساب Super Admin.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">رقم الهاتف</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
                inputMode="tel"
                className="focus-ring mt-2 w-full rounded-xl border border-[var(--hairline)] bg-white px-4 py-3 text-right text-sm shadow-sm"
                placeholder="مثال: 0590000000"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">كلمة المرور</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                type="password"
                className="focus-ring mt-2 w-full rounded-xl border border-[var(--hairline)] bg-white px-4 py-3 text-right text-sm shadow-sm"
                placeholder="أدخل كلمة المرور"
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(15,95,92,0.22)] transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "جاري تسجيل الدخول..." : "دخول إلى لوحة المشرف"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
