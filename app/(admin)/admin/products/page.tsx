import { getAllProducts } from '@/actions/product.actions';

import { allProductsColumn } from '@/components/admin/tables/products/all-products-column';
import AllProductsTable from '@/components/admin/tables/products/all-products-table';
import Link from 'next/link';

const AdminProductsPage = async () => {
  const products = await getAllProducts();
  return (
    <div className='bg-white dark:bg-black/20 rounded-md pt-6'>
      <div className='flex justify-between'>
        <h2 className='text-sm text-gray-700 mx-4 mb-5'>All Products List</h2>

        <div>
          <Link
            href='/admin/products/create-product'
            className='text-sm text-gray-700 mx-4 mb-5 bg-pink-400 px-4 py-2 rounded-xl'>
            Add Product
          </Link>
        </div>
      </div>
      <AllProductsTable
        data={products}
        columns={allProductsColumn}
      />
    </div>
  );
};

export default AdminProductsPage;
