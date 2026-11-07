import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/shared/page-breadcrumb';
import ProductCatalog from '@/components/product/product-catalog';
import { getFilterCategories, parseCatalogParams } from '@/lib/catalog';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// A single selected category becomes the page title (category cards link to /list?category=<slug>).
const getSingleCategory = async (params: Record<string, string | string[] | undefined>) => {
  const { categories } = parseCatalogParams(params);
  if (categories.length !== 1) return null;
  return (await getFilterCategories()).find(c => c.slug === categories[0]) ?? null;
};

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const category = await getSingleCategory(await searchParams);
  return {
    title: `${category?.name ?? 'Shop all products'} | Zenn`,
    description: category?.description ?? 'Browse the full Zenn collection.',
  };
}

const ProductListPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;
  const category = await getSingleCategory(params);

  return (
    <div className='container'>
      <PageBreadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/list' }, ...(category ? [{ label: category.name }] : [])]}
        className='mb-6'
      />
      <header className='mb-10 border-b border-border pb-8'>
        <h1 className='page-title'>{category?.name ?? 'All products'}</h1>
        {category?.description && <p className='lede mt-3 max-w-xl'>{category.description}</p>}
      </header>

      <ProductCatalog
        pathname='/list'
        params={params}
      />
    </div>
  );
};

export default ProductListPage;
