"use client";

import { SearchInput } from "@/components/filters/SearchInput";
import type { SuperAdminUser } from "@/lib/api/superAdminApi";

type AdminTopbarProps = {
  title: string;
  user: SuperAdminUser | null;
  onLogout: () => void;
};

export function AdminTopbar({ title, user, onLogout }: AdminTopbarProps) {
  const today = new Intl.DateTimeFormat("ar-PS", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--hairline)] bg-[rgba(246,241,232,0.88)] px-5 py-3 backdrop-blur xl:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--muted)]">سَنَد · Super Admin</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--text)]">{title}</h1>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden md:block">
            <SearchInput placeholder="بحث عام في لوحة سَنَد..." />
          </div>
          <div className="hidden rounded-full border border-[var(--hairline)] bg-white px-4 py-2 text-xs text-[var(--muted)] shadow-sm xl:block">
            {today} · آخر 30 يوم
          </div>
          <div className="flex items-center gap-3 rounded-full border border-[var(--hairline)] bg-white py-1 pr-2 pl-4 shadow-sm">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--primary)] text-xs font-semibold text-white">
              {user?.name?.slice(0, 2) || "مش"}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[var(--text)]">{user?.name || "مشرف سَنَد"}</p>
              <p className="text-xs text-[var(--muted)]">{user?.phone || "Super Admin"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="focus-ring rounded-lg border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)] transition hover:bg-[#f4d7d2]"
          >
            خروج
          </button>
        </div>
      </div>
    </header>
  );
}
