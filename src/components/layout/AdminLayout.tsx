"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ApiError, setUnauthorizedHandler } from "@/lib/api/apiClient";
import { superAdminApi, type SuperAdminUser } from "@/lib/api/superAdminApi";
import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
} from "@/lib/auth/authStorage";
import { getRouteLabel } from "@/lib/constants/routes";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SuperAdminUser | null>(getStoredUser());
  const [status, setStatus] = useState<"checking" | "ready" | "forbidden">("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthStorage();
      router.replace("/login");
    });

    return () => setUnauthorizedHandler(null);
  }, [router]);

  useEffect(() => {
    function handleUserUpdated(event: Event) {
      const updatedUser = (event as CustomEvent<SuperAdminUser>).detail;

      if (!updatedUser) {
        return;
      }

      setUser(updatedUser);
      setStoredUser(updatedUser);
    }

    window.addEventListener("sanad-super-admin-user-updated", handleUserUpdated);

    return () => window.removeEventListener("sanad-super-admin-user-updated", handleUserUpdated);
  }, []);

  useEffect(() => {
    let active = true;

    async function validateSession() {
      if (!getToken()) {
        router.replace("/login");
        return;
      }

      setStatus("checking");
      setError(null);

      try {
        const currentUser = await superAdminApi.me();
        if (!active) return;
        setUser(currentUser);
        setStoredUser(currentUser);
        setStatus("ready");
      } catch (caught) {
        if (!active) return;
        if (caught instanceof ApiError && caught.status === 403) {
          setStatus("forbidden");
          return;
        }
        setError(caught instanceof Error ? caught.message : "تعذر التحقق من الجلسة.");
        setStatus("ready");
      }
    }

    validateSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      if (getToken()) {
        await superAdminApi.logout();
      }
    } catch {
      // Local logout still clears stale tokens when the API is unreachable.
    } finally {
      clearAuthStorage();
      router.replace("/login");
    }
  }

  if (status === "checking") {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--cream)]">
        <LoadingState label="جاري التحقق من صلاحية الدخول..." />
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--cream)] p-6">
        <ErrorState
          title="وصول غير مسموح"
          message="هذا الحساب لا يملك صلاحية المشرف العام."
          actionLabel="العودة لتسجيل الدخول"
          onRetry={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className="sanad-shell">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="sanad-main">
          <AdminTopbar title={getRouteLabel(pathname)} user={user} onLogout={handleLogout} />
          <div className="sanad-content">
            {error ? (
              <div className="mb-5">
                <ErrorState title="تنبيه الجلسة" message={error} />
              </div>
            ) : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
