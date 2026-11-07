'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontalIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSearchStore } from '../store/use-search-store';
import { formatCurrency } from '@/helper/utils';

type FilterCategory = { slug: string; name: string };

type ProductFiltersProps = {
  /** Omit to hide the category filter (e.g. on a single-category page). */
  categories?: FilterCategory[];
  priceCeiling: number;
  total: number;
};

/** Reads and updates catalogue filters in the URL. Any change goes back to page 1. */
const useCatalogParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { setIsPending } = useSearchStore();

  useEffect(() => setIsPending(isPending), [isPending, setIsPending]);

  const update = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    }
    params.delete('page');
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  return { searchParams, update, isPending };
};

const sectionTitle = 'text-sm font-semibold text-foreground';

export default function ProductFilters({ categories, priceCeiling, total }: ProductFiltersProps) {
  const { searchParams, update, isPending } = useCatalogParams();
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategories = searchParams.get('category')?.split(',').filter(Boolean) ?? [];
  const minPrice = Number(searchParams.get('minPrice') ?? '') || 0;
  const maxParam = Number(searchParams.get('maxPrice') ?? '');
  const maxPrice = maxParam > 0 ? Math.min(maxParam, priceCeiling) : priceCeiling;
  const onSale = searchParams.get('sale') === '1';
  const inStock = searchParams.get('stock') === '1';

  const activeCount =
    selectedCategories.length + (searchParams.has('minPrice') || searchParams.has('maxPrice') ? 1 : 0) + (onSale ? 1 : 0) + (inStock ? 1 : 0);

  const toggleCategory = (slug: string) => {
    const next = selectedCategories.includes(slug) ? selectedCategories.filter(c => c !== slug) : [...selectedCategories, slug];
    update({ category: next.length ? next.join(',') : null });
  };

  const commitPrice = ([low, high]: number[]) =>
    update({
      minPrice: low > 0 ? String(low) : null,
      maxPrice: high < priceCeiling ? String(high) : null,
    });

  const clearAll = () => update({ category: null, minPrice: null, maxPrice: null, sale: null, stock: null });

  const content = (
    <div className='space-y-8'>
      {categories && categories.length > 0 && (
        <fieldset>
          <legend className={sectionTitle}>Category</legend>
          <div className='mt-3 space-y-1'>
            {categories.map(cat => (
              <div
                key={cat.slug}
                className='-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent'>
                <Checkbox
                  id={`filter-cat-${cat.slug}`}
                  checked={selectedCategories.includes(cat.slug)}
                  onCheckedChange={() => toggleCategory(cat.slug)}
                />
                <Label
                  htmlFor={`filter-cat-${cat.slug}`}
                  className='flex-1 cursor-pointer text-sm font-normal'>
                  {cat.name}
                </Label>
              </div>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className={sectionTitle}>Price</legend>
        {/* Keyed on the URL values so the slider resets when a filter chip is removed. */}
        <PriceRange
          key={`${minPrice}-${maxPrice}-${priceCeiling}`}
          initial={[minPrice, maxPrice]}
          ceiling={priceCeiling}
          onCommit={commitPrice}
        />
      </fieldset>

      <fieldset>
        <legend className={sectionTitle}>Availability</legend>
        <div className='mt-3 space-y-1'>
          <div className='-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent'>
            <Checkbox
              id='filter-sale'
              checked={onSale}
              onCheckedChange={checked => update({ sale: checked ? '1' : null })}
            />
            <Label
              htmlFor='filter-sale'
              className='flex-1 cursor-pointer text-sm font-normal'>
              On sale only
            </Label>
          </div>
          <div className='-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent'>
            <Checkbox
              id='filter-stock'
              checked={inStock}
              onCheckedChange={checked => update({ stock: checked ? '1' : null })}
            />
            <Label
              htmlFor='filter-stock'
              className='flex-1 cursor-pointer text-sm font-normal'>
              In stock only
            </Label>
          </div>
        </div>
      </fieldset>

      {activeCount > 0 && (
        <Button
          onClick={clearAll}
          className='h-10 w-full cursor-pointer rounded-full'
          variant='outline'>
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <div className='sticky top-28 hidden md:block'>
        <div className='mb-5 flex items-center gap-2'>
          <SlidersHorizontalIcon
            className='size-4 text-muted-foreground'
            aria-hidden='true'
          />
          <h2 className='text-sm font-semibold text-foreground'>Filters</h2>
        </div>
        {content}
      </div>

      {/* Mobile: side sheet; filters apply as you change them */}
      <div className='w-full md:hidden'>
        <Sheet
          open={isOpen}
          onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant='outline'
              className='h-11 w-full cursor-pointer gap-2 rounded-full'>
              <SlidersHorizontalIcon
                className='size-4'
                aria-hidden='true'
              />
              Filters
              {activeCount > 0 && (
                <span className='flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.6875rem] font-semibold text-primary-foreground'>
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent
            side='left'
            className='w-[320px] gap-0 overflow-y-auto sm:w-[400px]'>
            <SheetHeader className='border-b border-border'>
              <SheetTitle className='flex items-center gap-2 text-left'>
                <SlidersHorizontalIcon className='size-4' /> Filters
              </SheetTitle>
              <SheetDescription className='text-left'>Narrow down your results.</SheetDescription>
            </SheetHeader>
            <div className='flex-1 overflow-y-auto px-4 py-6'>{content}</div>
            <div className='mt-auto border-t border-border p-4'>
              <Button
                className='h-11 w-full cursor-pointer rounded-full'
                onClick={() => setIsOpen(false)}
                disabled={isPending}>
                {isPending ? 'Updating…' : `Show ${total} ${total === 1 ? 'result' : 'results'}`}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

const PriceRange = ({ initial, ceiling, onCommit }: { initial: number[]; ceiling: number; onCommit: (value: number[]) => void }) => {
  const [range, setRange] = useState(initial);
  const step = Math.max(500, Math.round(ceiling / 200 / 500) * 500);

  return (
    <div className='mt-4 space-y-4 px-1'>
      <Slider
        min={0}
        max={ceiling}
        step={step}
        value={range}
        onValueChange={setRange}
        onValueCommit={onCommit}
        aria-label='Price range'
      />
      <div className='flex justify-between text-xs tabular-nums text-muted-foreground'>
        <span>{formatCurrency(range[0])}</span>
        <span>{formatCurrency(range[1])}</span>
      </div>
    </div>
  );
};
