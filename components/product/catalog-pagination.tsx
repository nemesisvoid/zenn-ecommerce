import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  page: number;
  pageCount: number;
  /** Returns the URL for a page, keeping the current filters. */
  hrefFor: (page: number) => string;
};

/** Page numbers to show, with gaps (null) collapsed: 1 … 4 5 6 … 12 */
const pageItems = (page: number, pageCount: number): (number | null)[] => {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter(p => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  const items: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push(null);
    items.push(p);
  });
  return items;
};

const base = 'flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm tabular-nums transition-colors';

const CatalogPagination = ({ page, pageCount, hrefFor }: Props) => {
  if (pageCount <= 1) return null;

  const prev = page > 1 ? hrefFor(page - 1) : null;
  const next = page < pageCount ? hrefFor(page + 1) : null;

  return (
    <nav
      aria-label='Pagination'
      className='mt-14 flex items-center justify-center gap-1'>
      {prev ? (
        <Link
          href={prev}
          rel='prev'
          className={cn(base, 'gap-1 text-foreground hover:bg-accent')}>
          <ChevronLeftIcon
            className='size-4'
            aria-hidden='true'
          />
          <span className='hidden sm:inline'>Previous</span>
          <span className='sr-only sm:hidden'>Previous page</span>
        </Link>
      ) : (
        <span
          aria-hidden='true'
          className={cn(base, 'gap-1 text-muted-foreground/50')}>
          <ChevronLeftIcon className='size-4' />
          <span className='hidden sm:inline'>Previous</span>
        </span>
      )}

      <ul className='flex items-center gap-1'>
        {pageItems(page, pageCount).map((item, i) =>
          item === null ? (
            <li
              key={`gap-${i}`}
              aria-hidden='true'
              className='px-1 text-muted-foreground'>
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className={cn(base, item === page ? 'bg-foreground font-medium text-background' : 'text-foreground hover:bg-accent')}>
                {item}
              </Link>
            </li>
          ),
        )}
      </ul>

      {next ? (
        <Link
          href={next}
          rel='next'
          className={cn(base, 'gap-1 text-foreground hover:bg-accent')}>
          <span className='hidden sm:inline'>Next</span>
          <span className='sr-only sm:hidden'>Next page</span>
          <ChevronRightIcon
            className='size-4'
            aria-hidden='true'
          />
        </Link>
      ) : (
        <span
          aria-hidden='true'
          className={cn(base, 'gap-1 text-muted-foreground/50')}>
          <span className='hidden sm:inline'>Next</span>
          <ChevronRightIcon className='size-4' />
        </span>
      )}
    </nav>
  );
};

export default CatalogPagination;
