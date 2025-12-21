export const dynamic = 'force-dynamic';

import { getProductsForCategory } from '@/actions/category.actions';
import CategoryForm from '@/components/admin/categories/category-form';

const CreateCategoryPage = async () => {
  const products = await getProductsForCategory();

  return (
    <div>
      <CategoryForm products={products} />
    </div>
  );
};

export default CreateCategoryPage;
