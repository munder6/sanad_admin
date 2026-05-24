import Link from "next/link";

type MissingDetailStateProps = {
  backHref: string;
  backLabel: string;
};

export function MissingDetailState({ backHref, backLabel }: MissingDetailStateProps) {
  return (
    <div className="sanad-card border-[var(--danger-soft)] bg-[var(--danger-soft)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-[var(--danger-700)]">لم يتم تحديد العنصر</h3>
          <p className="mt-1 text-[14px] text-[var(--text-2)]">افتح التفاصيل من صفحة القائمة حتى يتم تمرير رقم العنصر.</p>
        </div>
        <Link href={backHref} className="sanad-btn inline-flex h-10 items-center px-4 text-[14px]">
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
