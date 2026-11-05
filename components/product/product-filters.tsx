'use client';

import { Dispatch, memo, SetStateAction, useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, SlidersHorizontalIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchStore } from '../store/use-search-store';
import { formatCurrency } from '@/helper/utils';

const MIN_PRICE = 0;
const MAX_PRICE = 1000000;

const DEFAULT_PRICE_RANGE = [MIN_PRICE, MAX_PRICE];

export default function ProductFilters({ categories, currentFilters }: { categories: any; currentFilters: any }) {
  const [transitionPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange')?.split(',') || DEFAULT_PRICE_RANGE);

  const { setIsPending } = useSearchStore();

  const [selectedCategory, setSelectedCategory] = useState<string[]>(searchParams.get('category')?.split(',') || []);

  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsPending(transitionPending);
  }, [transitionPending, setIsPending]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isMobile) return;

    const delayTimeoutId = setTimeout(() => {
      const currentUrlPrice = searchParams.get('priceRange');
      const newPriceString = priceRange.join(',');

      if (!currentUrlPrice && priceRange[0] === MIN_PRICE && priceRange[1] === MAX_PRICE) {
        return;
      }

      if (currentUrlPrice !== newPriceString) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('priceRange', newPriceString);

        startTransition(() => {});
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(delayTimeoutId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange, isMounted, isMobile]);

  // const handleFilterChange = (key: string, value: string) => {
  //   const params = new URLSearchParams(searchParams.toString());
  //   console.log('params', params);
  //   console.log('params 2', key, value);
  //   const currentValue = params.get(key);
  //   console.log('currentValue', currentValue);

  //   if (currentValue) {
  //     const valueArray = currentValue.split(',');

  //     if (valueArray.includes(value)) {
  //       const newValue = valueArray.filter(v => v !== value);
  //       if (newValue.length > 0) {
  //         params.set(key, newValue.join(','));
  //       } else {
  //         params.delete(key);
  //       }
  //     } else {
  //       params.set(key, [...valueArray, value].join(','));
  //     }
  //   } else {
  //     params.set(key, value);
  //   }
  //   if (!isMobile) {
  //     startTransition(() => {
  //       router.push(`${pathname}?${params.toString()}`);
  //     });
  //   }
  // };

  const handleToggleCategory = (category: string) => {
    const next = selectedCategory.includes(category) ? selectedCategory.filter(c => c !== category) : [...selectedCategory, category];
    setSelectedCategory(next);

    if (!isMobile) {
      const params = new URLSearchParams(searchParams.toString());
      if (next.length > 0) {
        params.set('category', next.join(','));
      } else {
        params.delete('category');
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('priceRange');
    params.delete('category');
    setPriceRange([0, 1000000]);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApplyMobileFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory.length > 0) {
      params.set('category', selectedCategory.join(','));
    } else {
      params.delete('category');
    }

    params.set('priceRange', priceRange.join(','));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
      setIsOpen(false);
    });
  };

  const handleSlider = (val: number[]) => {
    setPriceRange(val);
    if (!isMobile) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('priceRange', val.join(','));
    }
  };

  const FilterContent = () => (
    <div className='space-y-4'>
      {/* Active Filters Summary */}

      {selectedCategory.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {selectedCategory.map((cat, i) => (
            <div key={i}>
              <Badge
                variant='secondary'
                className='rounded-full px-3 py-1 text-xs font-medium capitalize'>
                {cat.replace('-', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <Accordion
        type='multiple'
        defaultValue={['category', 'price', 'brand']}
        className='w-full'>
        {/* Category Filter */}
        <AccordionItem value='category'>
          <AccordionTrigger className='cursor-pointer py-4 text-sm font-semibold hover:no-underline'>Category</AccordionTrigger>
          <AccordionContent>
            <div className='space-y-3 pt-1'>
              <CategoryList
                categories={categories}
                selected={selectedCategory}
                onToggle={handleToggleCategory}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value='price'>
          <AccordionTrigger className='cursor-pointer py-4 text-sm font-semibold hover:no-underline'>Price</AccordionTrigger>
          <AccordionContent>
            <div className='space-y-6 px-1 pt-3'>
              <PriceRangeSlider
                initialValue={priceRange}
                onValueChangeFinish={handleSlider}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Filter */}
        {/* <AccordionItem value='brand'>
          <AccordionTrigger className='text-base font-semibold'>Brand</AccordionTrigger>
          <AccordionContent>
            <div className='space-y-3 pt-1'>
              {BRANDS.map(brand => (
                <div
                  key={brand}
                  className='flex items-center space-x-2'>
                  <Checkbox id={`brand-${brand}`} />
                  <Label
                    htmlFor={`brand-${brand}`}
                    className='text-sm font-normal cursor-pointer'>
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem> */}
      </Accordion>

      <Button
        onClick={handleClearFilters}
        className='h-10 w-full cursor-pointer rounded-full'
        variant='outline'>
        Clear filters
      </Button>
    </div>
  );

  return (
    <>
      {/* DESKTOP VIEW: Sticky Sidebar */}
      <div className='sticky top-28 hidden md:block'>
        <div className='mb-2 flex items-center gap-2'>
          <SlidersHorizontalIcon
            className='size-4 text-muted-foreground'
            aria-hidden='true'
          />
          <h2 className='text-sm font-semibold text-foreground'>Filters</h2>
        </div>
        <FilterContent />
      </div>

      {/* MOBILE VIEW: Bottom/Side Sheet */}
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
              {selectedCategory.length > 0 && (
                <span className='flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.6875rem] font-semibold text-primary-foreground'>
                  {selectedCategory.length}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent
            side='left'
            className='w-[320px] gap-0 overflow-y-auto sm:w-[400px]'>
            <SheetHeader className='border-b border-border'>
              <SheetTitle className='flex items-center gap-2 text-left'>
                <SlidersHorizontal className='size-4' /> Filters
              </SheetTitle>
              <SheetDescription className='text-left'>Narrow down your results.</SheetDescription>
            </SheetHeader>
            <div className='flex-1 overflow-y-auto px-4 py-2'>
              <FilterContent />
            </div>
            <div className='mt-auto border-t border-border p-4'>
              <Button
                className='h-11 w-full cursor-pointer rounded-full'
                onClick={handleApplyMobileFilters}
                disabled={transitionPending}>
                {transitionPending ? 'Applying…' : 'Show results'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

const PriceRangeSlider = ({ initialValue, onValueChangeFinish }: { initialValue: number[]; onValueChangeFinish: (value: number[]) => void }) => {
  const [localRange, setLocalRange] = useState(initialValue);
  return (
    <div className='space-y-4'>
      <Slider
        max={100000}
        value={localRange}
        onValueChange={setLocalRange}
        onValueCommit={onValueChangeFinish}
      />
      <div className='flex justify-between text-xs tabular-nums text-muted-foreground'>
        <span>{formatCurrency(Number(localRange[0]))}</span>
        <span>{formatCurrency(Number(localRange[1]))}</span>
      </div>
    </div>
  );
};

const CategoryList = memo(
  ({ categories, selected, onToggle }: { categories: string[]; selected: string[]; onToggle: (category: string) => void }) => {
    return (
      <div className='space-y-1'>
        {categories.map(cat => (
          <div
            key={cat}
            className='-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent'>
            <Checkbox
              id={`filter-${cat}`}
              checked={selected.includes(cat)}
              onCheckedChange={() => onToggle(cat)}
            />
            <Label
              htmlFor={`filter-${cat}`}
              className='flex-1 cursor-pointer text-sm font-normal capitalize'>
              {cat.replace('-', ' ')}
            </Label>
          </div>
        ))}
      </div>
    );
  },
);

CategoryList.displayName = 'CategoryList';
