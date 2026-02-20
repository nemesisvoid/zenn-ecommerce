import { getAllCategories } from '@/actions/category.actions';
import { getProductBySearch } from '@/actions/product.actions';
import ProductCard from '@/components/product/product-card';
import ProductFilters from '@/components/product/product-filters';
import ProductList from '@/components/product/product-list';

const SearchPage = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) => {
  const search = await searchParams;
  const query = search.query || '';
  const res = await getProductBySearch(search);
  const categories = (await getAllCategories()).map(cat => cat.slug);
  const numSearch = res.length;

  return (
    <div className='container'>
      <div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          {!query || query === '' ? null : <h1 className='text-2xl font-medium tracking-tight'>Search results for {`"${query}"`}</h1>}
          <p className='text-sm text-muted-foreground'>showing {numSearch} results</p>
        </div>
      </div>

      <div className='flex flex-col md:flex-row gap-10 lg:gap-16'>
        <aside className='w-full md:w-64 lg:w-72 flex-shrink-0'>
          <ProductFilters
            categories={categories}
            currentFilters={search}
          />
        </aside>

        <main className='flex-1'>
          {!res || numSearch === 0 ? (
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <h3 className='text-lg font-semibold mb-2'>No products found</h3>
              <p className='text-muted-foreground'>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <ProductList data={res} />
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
