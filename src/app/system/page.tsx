import { StatusBadge } from "@/components/badges/StatusBadge";
import { KpiCard } from "@/components/cards/KpiCard";
import { AdminLayout } from "@/components/layout/AdminLayout";

const services = [
  { name: "Super Admin API", status: "جاهز", tone: "success" as const },
  { name: "Auth Middleware", status: "مفعل", tone: "success" as const },
  { name: "Overview Endpoint", status: "متصل عند تسجيل الدخول", tone: "info" as const },
  { name: "Future Modules", status: "قيد التخطيط", tone: "warning" as const },
];

export default function SystemPage() {
  return (
    <AdminLayout>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="حالة الواجهة" value="Ready" subtitle="Next.js frontend" icon="UI" tone="teal" />
        <KpiCard title="نطاق API" value="4" subtitle="Endpoints مفعلة حالياً" icon="API" tone="gold" />
        <KpiCard title="الحماية" value="MVP" subtitle="Token + auth/me" icon="أم" tone="success" />
      </div>

      <section className="sanad-card mt-6 p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold">صحة النظام</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">Placeholder تشغيلي للمرحلة الحالية بدون استدعاءات Backend إضافية.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between rounded-xl border border-[var(--hairline)] bg-[var(--cream-2)] px-4 py-3">
              <span className="text-sm font-medium">{service.name}</span>
              <StatusBadge tone={service.tone}>{service.status}</StatusBadge>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}
