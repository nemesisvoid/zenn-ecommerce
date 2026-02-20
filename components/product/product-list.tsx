'use client';

import { useSearchStore } from '../store/use-search-store';
import { Skeleton } from '../ui/skeleton';
import ProductCard from './product-card';

import { ProductListType } from '@/types';

const ProductList = ({ data, limit }: { data: ProductListType; limit?: number }) => {
  const { isPending } = useSearchStore();
  const numProducts = data.slice(0, limit);
  console.log('num', numProducts);
  return (
    <div className=''>
      {isPending ? (
        <div className=''>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 w-full'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <div className='relative aspect-square w-full h-60'>
                  <Skeleton className='absolute w-full h-full' />
                </div>
                <Skeleton className='w-full h-10 my-4' />
                <Skeleton className='w-1/2 h-10' />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 items-center justify-between gap-10'>
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
