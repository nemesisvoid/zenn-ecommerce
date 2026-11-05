import { getProductsByCategory } from '@/actions/category.actions';
import ProductList from '@/components/product/product-list';
import EmptyState from '@/components/shared/empty-state';
import PageBreadcrumb from '@/components/shared/page-breadcrumb';
import { Button } from '@/components/ui/button';
import { PackageOpenIcon } from 'lucide-react';
import Link from 'next/link';

const ProductListPage = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const filters = await searchParams;

  const category = Array.isArray(filters.category) ? filters.category[0] : filters.category || 'all-products';
  const data = await getProductsByCategory(category);
  const title = category?.replace('-', ' ');
  const count = data.products.length;

  return (
    <div className='container'>
      <PageBreadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/list' }, ...(category !== 'all-products' ? [{ label: title }] : [])]}
        className='mb-6'
      />
      <header className='mb-10 flex flex-col gap-2 border-b border-border pb-8 md:flex-row md:items-end md:justify-between'>
        <h1 className='page-title first-letter:uppercase'>{title}</h1>
        <p className='text-sm tabular-nums text-muted-foreground'>
          {count} {count === 1 ? 'product' : 'products'}
        </p>
      </header>

      {count === 0 ? (
        <EmptyState
          icon={PackageOpenIcon}
          title='Nothing here yet'
          description='There are no products in this category right now. Check back soon.'>
          <Button
            asChild
            className='h-11 rounded-full px-6'>
            <Link href='/list'>See all products</Link>
          </Button>
        </EmptyState>
      ) : (
        <ProductList data={data.products} />
      )}
    </div>
  );
};

export default ProductListPage;
