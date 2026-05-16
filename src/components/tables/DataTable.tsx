import { EmptyState } from "@/components/ui/EmptyState";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  align?: "start" | "end" | "center";
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyTitle?: string;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyTitle = "لا توجد بيانات للعرض",
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="overflow-hidden rounded-b-[14px]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`border-b border-[var(--hairline)] bg-[var(--cream-2)] px-4 py-3 text-xs font-semibold text-[var(--muted)] ${
                    column.align === "end" ? "text-left" : column.align === "center" ? "text-center" : "text-right"
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={String(row.id ?? rowIndex)} className="transition hover:bg-[var(--cream-2)]">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`border-b border-[var(--hairline-2)] px-4 py-3 text-[var(--text-2)] last:border-b-0 ${
                      column.align === "end" ? "text-left" : column.align === "center" ? "text-center" : "text-right"
                    }`}
                  >
                    {column.render ? column.render(row) : String(row[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
