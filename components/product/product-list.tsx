import ProductCard from './product-card';
import { ProductListType } from '@/types';

const ProductList = ({ data, limit }: { data: ProductListType; limit?: number }) => {
  const numProducts = data.slice(0, limit);
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center justify-between gap-10'>
      {numProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
};

export default ProductList;
