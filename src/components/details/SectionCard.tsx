type SectionCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({ title, subtitle, children, className = "" }: SectionCardProps) {
  return (
    <section className={`sanad-card overflow-hidden ${className}`}>
      <div className="sanad-card-header">
        <div>
          <h3 className="sanad-section-title">{title}</h3>
          {subtitle ? <p className="sanad-section-subtitle">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
