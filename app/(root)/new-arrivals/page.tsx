import type { Metadata } from 'next';
import Link from 'next/link';
import { SparklesIcon } from 'lucide-react';
import { getRecentProducts } from '@/actions/product.actions';
import ProductList from '@/components/product/product-list';
import EmptyState from '@/components/shared/empty-state';
import PageBreadcrumb from '@/components/shared/page-breadcrumb';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'New arrivals | Zenn',
  description: 'Products added to Zenn in the last 30 days, newest first.',
};

// Always reflect the latest catalogue rather than a build-time snapshot.
export const dynamic = 'force-dynamic';

const WINDOW_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

type Products = Awaited<ReturnType<typeof getRecentProducts>>;

// Products arrive sorted newest → oldest, so grouping preserves that order.
const groupByAge = (products: Products) => {
  const now = Date.now();
  const groups: { label: string; items: Products }[] = [
    { label: 'This week', items: [] },
    { label: 'Last week', items: [] },
    { label: 'Earlier this month', items: [] },
  ];
  for (const product of products) {
    const age = now - new Date(product.createdAt).getTime();
    const index = age < 7 * DAY ? 0 : age < 14 * DAY ? 1 : 2;
    groups[index].items.push(product);
  }
  return groups.filter(group => group.items.length > 0);
};

const NewArrivalsPage = async () => {
  const products = await getRecentProducts(WINDOW_DAYS);
  const groups = groupByAge(products);
  const count = products.length;

  return (
    <div className='container'>
      <PageBreadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'New arrivals' }]}
        className='mb-6'
      />

      <header className='mb-10 flex flex-col gap-3 border-b border-border pb-8 md:flex-row md:items-end md:justify-between'>
        <div className='max-w-xl'>
          <h1 className='page-title'>New arrivals</h1>
          <p className='lede mt-3'>Everything added in the last {WINDOW_DAYS} days, newest first.</p>
        </div>
        <p className='text-sm tabular-nums text-muted-foreground'>
          {count} {count === 1 ? 'product' : 'products'}
        </p>
      </header>

      {count === 0 ? (
        <EmptyState
          icon={SparklesIcon}
          title='Nothing new just yet'
          description={`No products have been added in the last ${WINDOW_DAYS} days. Browse the full collection in the meantime.`}>
          <Button
            asChild
            className='h-11 rounded-full px-6'>
            <Link href='/list'>Browse the shop</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className='space-y-16'>
          {groups.map(group => (
            <section
              key={group.label}
              aria-labelledby={`group-${group.label}`}>
              <div className='mb-6 flex items-baseline gap-3'>
                <h2
                  id={`group-${group.label}`}
                  className='font-display text-3xl tracking-tight text-foreground'>
                  {group.label}
                </h2>
                <span className='text-sm tabular-nums text-muted-foreground'>{group.items.length}</span>
              </div>
              <ProductList data={group.items} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewArrivalsPage;
