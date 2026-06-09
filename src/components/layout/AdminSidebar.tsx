"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AiIcon,
  AuditIcon,
  CustomersIcon,
  DashboardIcon,
  JournalIcon,
  SettingsIcon,
  ShopsIcon,
  SmsIcon,
  SystemIcon,
  TransactionsIcon,
  UsersIcon,
} from "@/components/icons/AdminIcons";
import { adminRoutes, getActiveAdminRoute } from "@/lib/constants/routes";

const groupLabels = {
  overview: "النظرة العامة",
  management: "الإدارة",
  operations: "العمليات",
  system: "النظام",
} as const;

const navIcons = {
  dashboard: DashboardIcon,
  shops: ShopsIcon,
  users: UsersIcon,
  customers: CustomersIcon,
  transactions: TransactionsIcon,
  journal: JournalIcon,
  ai: AiIcon,
  audit: AuditIcon,
  sms: SmsIcon,
  system: SystemIcon,
  settings: SettingsIcon,
} as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const activeRoute = getActiveAdminRoute(pathname);

  return (
    <aside className="sanad-sidebar">
      <div className="sanad-brand">
        <div className="sanad-brand-mark">س</div>
        <div>
          <p className="sanad-brand-title">سَنَد</p>
          <p className="sanad-brand-subtitle">لوحة المشرف العام</p>
        </div>
      </div>

      <nav className="sanad-nav">
        {adminRoutes.map((route, index) => {
          const active = activeRoute?.href === route.href;
          const showGroup = index === 0 || route.group !== adminRoutes[index - 1]?.group;
          const Icon = navIcons[route.icon];

          return (
            <div key={route.href}>
              {showGroup ? <p className="sanad-nav-group">{groupLabels[route.group]}</p> : null}
              <Link
                href={route.href}
                className={`sanad-nav-item ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="sanad-nav-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="sanad-nav-label">{route.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
