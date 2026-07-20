import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
};

function pageHref(page: number): string {
  return page === 1 ? "/" : `/page/${page}`;
}

export function Pagination({ page, totalPages, previousLabel, nextLabel }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-16 flex items-center justify-between border-t border-ink/10 pt-7">
      {page > 1 ? (
        <Link href={pageHref(page - 1)} className="link-arrow font-semibold text-ink hover:text-azure">
          <span aria-hidden>← </span>{previousLabel}
        </Link>
      ) : <span />}
      <span className="text-sm text-ink/50">{page} / {totalPages}</span>
      {page < totalPages ? (
        <Link href={pageHref(page + 1)} className="link-arrow font-semibold text-ink hover:text-azure">
          {nextLabel}<span aria-hidden> →</span>
        </Link>
      ) : <span />}
    </nav>
  );
}
