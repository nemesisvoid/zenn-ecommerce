import CreateProductForm from './create-product-form';

import { getSelectableCategories } from '@/actions/category.actions';

const AdminCreateProductPage = async () => {
  const data = await getSelectableCategories();

  return (
    <div className=''>
      <CreateProductForm categories={data} />
    </div>
  );
};

export default AdminCreateProductPage;
