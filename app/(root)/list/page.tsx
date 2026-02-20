import { getProductsByCategory } from '@/actions/category.actions';
import ProductList from '@/components/product/product-list';

const ProductListPage = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const filters = await searchParams;
  console.log('filter', filters);

  const category = Array.isArray(filters.category) ? filters.category[0] : filters.category || 'all-products';
  const data = await getProductsByCategory(category);

  return (
    <div className='container'>
      <h2 className='text-2xl capitalize mb-5'>{category?.replace('-', ' ')}</h2>

      <div>
        <ProductList data={data.products} />
      </div>
    </div>
  );
};

export default ProductListPage;
