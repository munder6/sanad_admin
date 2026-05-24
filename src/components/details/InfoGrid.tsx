type InfoGridProps = {
  children: React.ReactNode;
  columns?: "two" | "three" | "four";
  relaxed?: boolean;
};

const columnClasses: Record<NonNullable<InfoGridProps["columns"]>, string> = {
  two: "md:grid-cols-2",
  three: "md:grid-cols-2 xl:grid-cols-3",
  four: "sm:grid-cols-2 lg:grid-cols-4",
};

export function InfoGrid({ children, columns = "three", relaxed = false }: InfoGridProps) {
  return (
    <div className={`sanad-info-grid ${columnClasses[columns]} ${relaxed ? "sanad-info-grid-relaxed" : ""}`}>
      {children}
    </div>
  );
}
