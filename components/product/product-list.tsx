'use client';

import { useSearchStore } from '@/components/store/use-search-store';

import ProductCard, { type ProductCardProps } from './product-card';
import { ProductCardSkeleton } from '../shared/skeletons';

// Column count follows the width of the list's container, so the same grid works
// full-width on the home page and beside the filters on search.
const gridClass = 'grid grid-cols-2 gap-x-4 gap-y-10 @2xl:grid-cols-3 @5xl:grid-cols-4 md:gap-x-6';

// Only the fields the card renders, so callers can pass narrow `select` results.
type ProductListItem = ProductCardProps & { id: string };

const ProductList = ({ data, limit }: { data: ProductListItem[]; limit?: number }) => {
  const { isPending } = useSearchStore();
  const numProducts = data.slice(0, limit);
  return (
    <div className='@container'>
      {isPending ? (
        <div
          className={`${gridClass} loading-enter`}
          role='status'
          aria-busy='true'>
          <span className='sr-only'>Loading products</span>
          {Array.from({ length: Math.min(Math.max(numProducts.length, 3), 8) }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className={gridClass}>
          {numProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
