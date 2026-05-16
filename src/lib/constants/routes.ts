export type AdminRoute = {
  href: string;
  label: string;
  eyebrow: string;
  icon: string;
};

export const adminRoutes: AdminRoute[] = [
  { href: "/dashboard", label: "الرئيسية", eyebrow: "نظرة عامة", icon: "س" },
  { href: "/shops", label: "المحلات", eyebrow: "إدارة التجار", icon: "مح" },
  { href: "/users", label: "المستخدمون", eyebrow: "حسابات التطبيق", icon: "مس" },
  { href: "/customers", label: "الزبائن", eyebrow: "دفاتر الزبائن", icon: "زب" },
  { href: "/transactions", label: "الحركات المالية", eyebrow: "الديون والسداد", icon: "₪" },
  { href: "/ai-commands", label: "أوامر الذكاء الصناعي", eyebrow: "الأوامر الذكية", icon: "AI" },
  { href: "/audit", label: "الأمان والتدقيق", eyebrow: "سجل النظام", icon: "أم" },
  { href: "/system", label: "صحة النظام", eyebrow: "الخدمات", icon: "نظ" },
];

export function getRouteLabel(pathname: string): string {
  return adminRoutes.find((route) => pathname.startsWith(route.href))?.label ?? "لوحة سَنَد";
}
