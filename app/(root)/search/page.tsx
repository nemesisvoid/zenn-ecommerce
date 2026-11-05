import { getAllCategories } from '@/actions/category.actions';
import { getProductBySearch } from '@/actions/product.actions';
import ProductFilters from '@/components/product/product-filters';
import ProductList from '@/components/product/product-list';
import EmptyState from '@/components/shared/empty-state';
import { SearchXIcon } from 'lucide-react';

const SearchPage = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) => {
  const search = await searchParams;
  const query = search.query || '';
  const res = await getProductBySearch(search);
  const categories = (await getAllCategories()).map(cat => cat.slug);
  const numSearch = res.length;

  return (
    <div className='container'>
      <header className='mb-10 flex flex-col gap-2 border-b border-border pb-8 md:flex-row md:items-end md:justify-between'>
        <h1 className='page-title'>{!query || query === '' ? 'All products' : `Results for “${query}”`}</h1>
        <p className='text-sm tabular-nums text-muted-foreground'>
          {numSearch} {numSearch === 1 ? 'result' : 'results'}
        </p>
      </header>

      <div className='flex flex-col gap-8 md:flex-row lg:gap-12'>
        <aside className='w-full flex-shrink-0 md:w-60 lg:w-64'>
          <ProductFilters
            categories={categories}
            currentFilters={search}
          />
        </aside>

        <div className='min-w-0 flex-1'>
          {!res || numSearch === 0 ? (
            <EmptyState
              icon={SearchXIcon}
              title='No products found'
              description='Try a different search term, or clear some filters.'
              className='panel'
            />
          ) : (
            <ProductList data={res} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
