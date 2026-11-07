import Link from 'next/link';
import { SearchXIcon, XIcon } from 'lucide-react';

import { catalogHref, getCatalogPage, getFilterCategories, getPriceCeiling, parseCatalogParams, SORT_OPTIONS, CATALOG_PAGE_SIZE } from '@/lib/catalog';
import { formatCurrency } from '@/helper/utils';
import ProductFilters from './product-filters';
import ProductList from './product-list';
import CatalogSort from './catalog-sort';
import CatalogPagination from './catalog-pagination';
import EmptyState from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';

type RawParams = Record<string, string | string[] | undefined>;

type Props = {
  pathname: string;
  params: RawParams;
};

const chipClass =
  'inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-3 pr-2 text-sm text-foreground transition-colors hover:bg-accent';

/** Shop/search catalogue: filters, sort, active-filter chips, product grid and pagination. Server component. */
const ProductCatalog = async ({ pathname, params }: Props) => {
  const filters = parseCatalogParams(params);

  const [{ products, total, page, pageCount }, priceCeiling, categories] = await Promise.all([
    getCatalogPage(filters),
    getPriceCeiling(),
    getFilterCategories(),
  ]);

  const href = (changes: Record<string, string | null>) => catalogHref(pathname, params, changes);
  const categoryName = (slug: string) => categories.find(c => c.slug === slug)?.name ?? slug.replace(/-/g, ' ');

  // Removable chips for every active filter.
  const chips: { label: string; href: string }[] = [];
  for (const slug of filters.categories) {
    const rest = filters.categories.filter(c => c !== slug);
    chips.push({ label: categoryName(slug), href: href({ category: rest.length ? rest.join(',') : null }) });
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const low = formatCurrency(filters.minPrice ?? 0);
    const high = filters.maxPrice !== null ? formatCurrency(filters.maxPrice) : 'any';
    chips.push({ label: `${low} – ${high}`, href: href({ minPrice: null, maxPrice: null }) });
  }
  if (filters.onSale) chips.push({ label: 'On sale', href: href({ sale: null }) });
  if (filters.inStock) chips.push({ label: 'In stock', href: href({ stock: null }) });
  const clearAllHref = href({ category: null, minPrice: null, maxPrice: null, sale: null, stock: null });

  const from = total === 0 ? 0 : (page - 1) * CATALOG_PAGE_SIZE + 1;
  const to = Math.min(page * CATALOG_PAGE_SIZE, total);

  return (
    <div className='flex flex-col gap-8 md:flex-row lg:gap-12'>
      <aside className='w-full flex-shrink-0 md:w-60 lg:w-64'>
        <ProductFilters
          categories={categories}
          priceCeiling={priceCeiling}
          total={total}
        />
      </aside>

      <div className='min-w-0 flex-1'>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <p
            className='text-sm tabular-nums text-muted-foreground'
            aria-live='polite'>
            {total === 0 ? 'No products' : `Showing ${from}–${to} of ${total} ${total === 1 ? 'product' : 'products'}`}
          </p>
          <CatalogSort
            options={SORT_OPTIONS}
            value={filters.sort}
          />
        </div>

        {chips.length > 0 && (
          <ul
            className='mb-8 flex flex-wrap items-center gap-2'
            aria-label='Active filters'>
            {chips.map(chip => (
              <li key={chip.label}>
                <Link
                  href={chip.href}
                  scroll={false}
                  className={chipClass}
                  aria-label={`Remove filter: ${chip.label}`}>
                  <span className='capitalize'>{chip.label}</span>
                  <XIcon
                    className='size-3.5 text-muted-foreground'
                    aria-hidden='true'
                  />
                </Link>
              </li>
            ))}
            {chips.length > 1 && (
              <li>
                <Link
                  href={clearAllHref}
                  scroll={false}
                  className='px-2 text-sm font-medium text-foreground underline-offset-4 hover:underline'>
                  Clear all
                </Link>
              </li>
            )}
          </ul>
        )}

        {total === 0 ? (
          <EmptyState
            icon={SearchXIcon}
            title='No products found'
            description={chips.length > 0 ? 'Nothing matches these filters. Try removing some.' : 'Try a different search term.'}
            className='panel'>
            {chips.length > 0 && (
              <Button
                asChild
                variant='outline'
                className='h-11 rounded-full px-6'>
                <Link href={clearAllHref}>Clear filters</Link>
              </Button>
            )}
          </EmptyState>
        ) : (
          <ProductList data={products} />
        )}

        <CatalogPagination
          page={page}
          pageCount={pageCount}
          hrefFor={p => href({ page: p > 1 ? String(p) : null })}
        />
      </div>
    </div>
  );
};

export default ProductCatalog;
