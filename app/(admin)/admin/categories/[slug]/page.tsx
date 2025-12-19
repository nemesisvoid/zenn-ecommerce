import { getProductsForCategory } from '@/actions/category.actions';
import CategoryForm from '@/components/admin/categories/category-form';
import { getCategoryBySlug } from '@/actions/category.actions';

const CategoryDetailsPage = async (props: { params: Promise<{ slug: string }> }) => {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  console.log('cat:', category);
  const products = await getProductsForCategory();
  return (
    <div>
      <h3 className='mb-6'>Edit Category</h3>
      <CategoryForm
        initialData={category}
        products={products}
      />
    </div>
  );
};

export default CategoryDetailsPage;
