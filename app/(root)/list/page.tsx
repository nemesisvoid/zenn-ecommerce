import { getProductsByCategory } from '@/actions/category.actions';
import ProductCard from '@/components/product/product-card';
import ProductList from '@/components/product/product-list';

const ProductListPage = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const filters = await searchParams;

  const data = await getProductsByCategory(filters.category || ('all-products' as string));

  return (
    <div className='container'>
      <h2 className='text-2xl capitalize mb-5'>{filters.category?.replace('-', ' ')}</h2>

      <div>
        <ProductList data={data.products} />
      </div>
    </div>
  );
};

export default ProductListPage;
