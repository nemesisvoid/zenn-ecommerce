import type { Metadata } from 'next';
import Link from 'next/link';
import { TagIcon } from 'lucide-react';
import { getSaleProducts } from '@/actions/product.actions';
import ProductList from '@/components/product/product-list';
import EmptyState from '@/components/shared/empty-state';
import PageBreadcrumb from '@/components/shared/page-breadcrumb';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'On sale | Zenn',
  description: 'Every discounted product at Zenn, biggest savings first.',
};

// Discounts change from the admin dashboard, so always show the current ones.
export const dynamic = 'force-dynamic';

type Products = Awaited<ReturnType<typeof getSaleProducts>>;

// Products arrive sorted by discount (highest first), so grouping keeps that order.
const groupByDiscount = (products: Products) => {
  const groups: { label: string; items: Products }[] = [
    { label: '50% off or more', items: [] },
    { label: '25–49% off', items: [] },
    { label: 'Up to 24% off', items: [] },
  ];
  for (const product of products) {
    const discount = product.discountPercent ?? 0;
    const index = discount >= 50 ? 0 : discount >= 25 ? 1 : 2;
    groups[index].items.push(product);
  }
  return groups.filter(group => group.items.length > 0);
};

const OnSalePage = async () => {
  const products = await getSaleProducts();
  const groups = groupByDiscount(products);
  const count = products.length;
  const maxDiscount = Math.round(products[0]?.discountPercent ?? 0);

  return (
    <div className='container'>
      <PageBreadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'On sale' }]}
        className='mb-6'
      />

      <header className='mb-10 flex flex-col gap-3 border-b border-border pb-8 md:flex-row md:items-end md:justify-between'>
        <div className='max-w-xl'>
          <h1 className='page-title'>On sale</h1>
          <p className='lede mt-3'>{count > 0 ? `Save up to ${maxDiscount}%. Biggest discounts first.` : 'Discounted products appear here.'}</p>
        </div>
        <p className='text-sm tabular-nums text-muted-foreground'>
          {count} {count === 1 ? 'product' : 'products'}
        </p>
      </header>

      {count === 0 ? (
        <EmptyState
          icon={TagIcon}
          title='No sales right now'
          description='Nothing is discounted at the moment. Check back soon, or browse the full collection.'>
          <Button
            asChild
            className='h-11 rounded-full px-6'>
            <Link href='/list'>Browse the shop</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className='space-y-16'>
          {groups.map((group, i) => (
            <section
              key={group.label}
              aria-labelledby={`sale-group-${i}`}>
              <div className='mb-6 flex items-baseline gap-3'>
                <h2
                  id={`sale-group-${i}`}
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

export default OnSalePage;
