import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActivityPaginationProps {
  page: number;
  totalPages: number;
  /** Builds the URL for a page, keeping the current filters. */
  hrefFor: (page: number) => string;
}

const MAX_NUMBERS = 5;

/** Page numbers around the current page, with the first/last page and gaps marked by null. */
function pageWindow(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= MAX_NUMBERS + 2) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const half = Math.floor(MAX_NUMBERS / 2);
  const start = Math.max(2, Math.min(page - half, totalPages - MAX_NUMBERS));
  const end = Math.min(totalPages - 1, start + MAX_NUMBERS - 1);

  const pages: (number | null)[] = [1];
  if (start > 2) pages.push(null);
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push(null);
  pages.push(totalPages);
  return pages;
}

const ActivityPagination = ({ page, totalPages, hrefFor }: ActivityPaginationProps) => {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label='Activity log pages'
      className='flex items-center justify-between gap-2 border-t border-black/5 px-4 py-3 sm:justify-end sm:px-6 dark:border-white/10'>
      <Button
        asChild={hasPrev}
        variant='outline'
        size='sm'
        disabled={!hasPrev}>
        {hasPrev ? (
          <Link
            href={hrefFor(page - 1)}
            rel='prev'>
            <ChevronLeftIcon aria-hidden='true' />
            Previous
          </Link>
        ) : (
          <span>
            <ChevronLeftIcon aria-hidden='true' />
            Previous
          </span>
        )}
      </Button>

      <p className='text-sm text-[#5D7186] sm:hidden dark:text-[#AAB8C5]'>
        Page {page} of {totalPages}
      </p>

      <ol className='hidden items-center gap-1 sm:flex'>
        {pageWindow(page, totalPages).map((p, i) =>
          p === null ? (
            <li
              key={`gap-${i}`}
              aria-hidden='true'
              className='px-2 text-sm text-[#5D7186] dark:text-[#AAB8C5]'>
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={hrefFor(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
                className={cn(
                  'flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm tabular-nums transition-colors',
                  'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  p === page
                    ? 'bg-gray-900 font-medium text-white dark:bg-white dark:text-gray-900'
                    : 'text-[#5D7186] hover:bg-black/5 hover:text-gray-900 dark:text-[#AAB8C5] dark:hover:bg-white/10 dark:hover:text-white',
                )}>
                {p}
              </Link>
            </li>
          ),
        )}
      </ol>

      <Button
        asChild={hasNext}
        variant='outline'
        size='sm'
        disabled={!hasNext}>
        {hasNext ? (
          <Link
            href={hrefFor(page + 1)}
            rel='next'>
            Next
            <ChevronRightIcon aria-hidden='true' />
          </Link>
        ) : (
          <span>
            Next
            <ChevronRightIcon aria-hidden='true' />
          </span>
        )}
      </Button>
    </nav>
  );
};

export default ActivityPagination;
