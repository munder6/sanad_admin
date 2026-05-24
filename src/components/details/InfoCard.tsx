import { InfoGrid } from "@/components/details/InfoGrid";

type InfoCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  columns?: "two" | "three" | "four";
};

export function InfoCard({ title, subtitle, children, columns = "three" }: InfoCardProps) {
  return (
    <section className="sanad-card overflow-hidden">
      <div className="sanad-card-header">
        <div>
          <h3 className="sanad-section-title">{title}</h3>
          {subtitle ? <p className="sanad-section-subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <InfoGrid columns={columns}>{children}</InfoGrid>
    </section>
  );
}
