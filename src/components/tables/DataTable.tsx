import { EmptyState } from "@/components/ui/EmptyState";
import { toEnglishDigits } from "@/lib/formatters/number";

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
    <div className="overflow-hidden rounded-b-[var(--r-lg)]">
      <div className="sanad-table-wrap">
        <table className="sanad-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`${
                    column.align === "end" ? "!text-left" : column.align === "center" ? "!text-center" : "!text-right"
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
                    className={`${
                      column.align === "end" ? "!text-left" : column.align === "center" ? "!text-center" : "!text-right"
                    }`}
                  >
                    {column.render ? column.render(row) : toEnglishDigits(row[column.key] ?? "")}
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
