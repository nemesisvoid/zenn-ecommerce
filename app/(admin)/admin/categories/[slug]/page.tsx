import { getProductsForCategory } from '@/actions/category.actions';
import CategoryForm from '@/components/admin/categories/category-form';
import { getCategoryBySlug } from '@/actions/category.actions';

const CategoryDetailsPage = async (props: { params: Promise<{ slug: string }> }) => {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  const products = await getProductsForCategory();
  return (
    <div>
      <h3 className='mb-6'>Edit Category</h3>
      <CategoryForm
        initialData={category ? { ...category, description: category.description ?? undefined } : undefined}
        products={products}
      />
    </div>
  );
};

export default CategoryDetailsPage;
