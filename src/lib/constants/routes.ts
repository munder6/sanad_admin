export type AdminRoute = {
  href: string;
  label: string;
  eyebrow: string;
  icon: "dashboard" | "shops" | "users" | "customers" | "transactions" | "journal" | "ai" | "audit" | "sms" | "system" | "settings";
  group: "overview" | "management" | "operations" | "system";
};

export const adminRoutes: AdminRoute[] = [
  { href: "/dashboard", label: "الرئيسية", eyebrow: "نظرة عامة", icon: "dashboard", group: "overview" },
  { href: "/shops", label: "المحلات", eyebrow: "إدارة التجار", icon: "shops", group: "management" },
  { href: "/users", label: "المستخدمون", eyebrow: "حسابات التطبيق", icon: "users", group: "management" },
  { href: "/customers", label: "الزبائن", eyebrow: "دفاتر الزبائن", icon: "customers", group: "management" },
  { href: "/transactions", label: "الحركات المالية", eyebrow: "الديون والسداد", icon: "transactions", group: "operations" },
  { href: "/daily-journal", label: "اليوميات", eyebrow: "دفتر اليوميات", icon: "journal", group: "operations" },
  { href: "/ai-commands", label: "أوامر الذكاء الصناعي", eyebrow: "الأوامر الذكية", icon: "ai", group: "operations" },
  { href: "/audit", label: "الأمان والتدقيق", eyebrow: "سجل النظام", icon: "audit", group: "system" },
  { href: "/sms", label: "الرسائل النصية", eyebrow: "إدارة SMS", icon: "sms", group: "system" },
  { href: "/system", label: "صحة النظام", eyebrow: "الخدمات", icon: "system", group: "system" },
  { href: "/system/settings", label: "إعدادات النظام", eyebrow: "الوصول والتوفر", icon: "settings", group: "system" },
];

export function getRouteLabel(pathname: string): string {
  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    return "بياناتي";
  }

  return getActiveAdminRoute(pathname)?.label ?? "لوحة سَنَد";
}

export function getActiveAdminRoute(pathname: string): AdminRoute | undefined {
  return [...adminRoutes]
    .sort((first, second) => second.href.length - first.href.length)
    .find((route) => pathname === route.href || pathname.startsWith(`${route.href}/`));
}
