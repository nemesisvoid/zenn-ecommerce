import type { Metadata } from 'next';
import ProductCatalog from '@/components/product/product-catalog';
import { parseCatalogParams } from '@/lib/catalog';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { query } = parseCatalogParams(await searchParams);
  return { title: query ? `“${query}” | Zenn` : 'Search | Zenn' };
}

const SearchPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;
  const { query } = parseCatalogParams(params);

  return (
    <div className='container'>
      <header className='mb-10 border-b border-border pb-8'>
        <h1 className='page-title'>{query ? `Results for “${query}”` : 'All products'}</h1>
      </header>

      <ProductCatalog
        pathname='/search'
        params={params}
      />
    </div>
  );
};

export default SearchPage;
