'use client';

import { useEffect, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchStore } from '../store/use-search-store';

type SortOption = { value: string; label: string };

const CatalogSort = ({ options, value }: { options: readonly SortOption[]; value: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { setIsPending } = useSearchStore();

  useEffect(() => setIsPending(isPending), [isPending, setIsPending]);

  const onChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'newest') params.delete('sort');
    else params.set('sort', next);
    params.delete('page');
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  return (
    <div className='flex items-center gap-2'>
      <label
        htmlFor='catalog-sort'
        className='shrink-0 text-sm text-muted-foreground'>
        Sort by
      </label>
      <Select
        value={value}
        onValueChange={onChange}>
        <SelectTrigger
          id='catalog-sort'
          className='h-10 w-[190px] rounded-full'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align='end'>
          {options.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CatalogSort;
