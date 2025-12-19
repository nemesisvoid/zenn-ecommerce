import { getProductsByCategory, getProductsForCategory } from '@/actions/category.actions';
import CategoryForm from '@/components/admin/categories/category-form';

const CreateCategoryPage = async () => {
  const products = await getProductsForCategory();
  const cat = await getProductsByCategory('all-products');
  console.log('cat', cat);
  return (
    <div>
      <CategoryForm products={products} />
    </div>
  );
};

export default CreateCategoryPage;
