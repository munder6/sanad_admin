"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminRoutes } from "@/lib/constants/routes";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-l border-[rgba(255,255,255,0.1)] bg-[var(--primary-dark)] text-white lg:flex">
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--gold)] bg-[var(--primary)] text-3xl font-bold text-[var(--gold)]">
            س
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--gold)]">سَنَد</p>
            <p className="text-xs text-white/60">لوحة المشرف العام</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {adminRoutes.map((route) => {
          const active = pathname === route.href || pathname.startsWith(`${route.href}/`);

          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                active
                  ? "bg-[var(--gold)] text-[#2a1f0f] shadow-lg shadow-black/10"
                  : "text-white/72 hover:bg-white/8 hover:text-white"
              }`}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-bold ${
                  active ? "bg-white/35" : "bg-white/10"
                }`}
              >
                {route.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{route.label}</span>
                <span className={`block truncate text-xs ${active ? "text-[#4b3518]" : "text-white/45"}`}>
                  {route.eyebrow}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/8 p-3 text-xs leading-6 text-white/62">
          نطاق العمل الحالي: واجهة المشرف العام فقط، بدون تعديل backend أو Flutter.
        </div>
      </div>
    </aside>
  );
}
