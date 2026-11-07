'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2Icon, SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ALL = 'all';
const SEARCH_DELAY_MS = 350;

interface Option {
  value: string;
  label: string;
}

interface ActivityFiltersProps {
  actions: Option[];
  entities: Option[];
  /** Current, server-validated filter values. */
  action: string | null;
  entity: string | null;
  q: string;
}

const ActivityFilters = ({ actions, entities, action, entity, q }: ActivityFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(q);
  // The last search term this component put in the URL. When the URL's term changes to anything
  // else (back button, "Clear filters" link), the input follows it; our own updates never
  // overwrite what the admin is still typing.
  const [pushedQ, setPushedQ] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  if (q !== syncedQ) {
    setSyncedQ(q);
    if (q !== pushedQ) {
      setPushedQ(q);
      setQuery(q);
    }
  }

  const navigate = useCallback(
    (patch: Record<string, string | null>) => {
      if ('q' in patch) setPushedQ(patch.q ?? '');
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete('page'); // any filter change starts again from the first page
      const qs = params.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [pathname, router, searchParams],
  );

  // Debounced search-as-you-type.
  useEffect(() => {
    const next = query.trim();
    if (next === q) return;
    const timeout = setTimeout(() => navigate({ q: next || null }), SEARCH_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [query, q, navigate]);

  const hasFilters = Boolean(q || action || entity);

  return (
    <form
      role='search'
      aria-label='Filter activity'
      aria-busy={isPending}
      onSubmit={event => {
        event.preventDefault();
        const next = query.trim();
        if (next !== q) navigate({ q: next || null });
      }}
      className='flex flex-col gap-3 md:flex-row md:items-end'>
      <div className='flex-1 space-y-1.5'>
        <Label
          htmlFor='activity-search'
          className='text-xs font-medium text-[#5D7186] dark:text-[#AAB8C5]'>
          Search
        </Label>
        <div className='relative'>
          <SearchIcon
            aria-hidden='true'
            className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5D7186] dark:text-[#AAB8C5]'
          />
          <Input
            id='activity-search'
            type='search'
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder='Search by item name, admin name or email'
            maxLength={100}
            autoComplete='off'
            className='bg-white pr-9 pl-9 dark:bg-white/5 [&::-webkit-search-cancel-button]:hidden'
          />
          {isPending ? (
            <Loader2Icon
              aria-hidden='true'
              className='absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-[#5D7186] dark:text-[#AAB8C5]'
            />
          ) : (
            query && (
              <button
                type='button'
                onClick={() => {
                  setQuery('');
                  navigate({ q: null });
                }}
                aria-label='Clear search'
                className='absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-[#5D7186] outline-none hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-ring/50 dark:text-[#AAB8C5] dark:hover:text-white'>
                <XIcon className='size-4' />
              </button>
            )
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3 md:flex md:items-end'>
        <div className='space-y-1.5'>
          <Label
            htmlFor='activity-action'
            className='text-xs font-medium text-[#5D7186] dark:text-[#AAB8C5]'>
            Action
          </Label>
          <Select
            value={action ?? ALL}
            onValueChange={value => navigate({ action: value === ALL ? null : value })}>
            <SelectTrigger
              id='activity-action'
              className='w-full bg-white md:w-40 dark:bg-white/5'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All actions</SelectItem>
              {actions.map(option => (
                <SelectItem
                  key={option.value}
                  value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-1.5'>
          <Label
            htmlFor='activity-entity'
            className='text-xs font-medium text-[#5D7186] dark:text-[#AAB8C5]'>
            Type
          </Label>
          <Select
            value={entity ?? ALL}
            onValueChange={value => navigate({ entity: value === ALL ? null : value })}>
            <SelectTrigger
              id='activity-entity'
              className='w-full bg-white md:w-40 dark:bg-white/5'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {entities.map(option => (
                <SelectItem
                  key={option.value}
                  value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <Button
          type='button'
          variant='ghost'
          onClick={() => {
            setQuery('');
            navigate({ q: null, action: null, entity: null });
          }}
          className='self-start text-[#5D7186] md:self-auto dark:text-[#AAB8C5]'>
          <XIcon aria-hidden='true' />
          Reset
        </Button>
      )}
    </form>
  );
};

export default ActivityFilters;
