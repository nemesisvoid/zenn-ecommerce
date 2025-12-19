import { getAllProducts } from '@/actions/product.actions';

import { allProductsColumn } from '@/components/admin/tables/products/all-products-column';
import DataTable from '@/components/admin/tables/products/data-table';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

const AdminProductsPage = async () => {
  const products = await getAllProducts();
  console.log('products', products);
  return (
    <div className='table-wrapper'>
      <div className='flex justify-between'>
        <h2 className='table-header'>All Products List</h2>

        <Button asChild>
          <Link
            href='/admin/products/create-product'
            className='text-sm text-gray-700 mx-4 mb-5  px-4 py-2 rounded-md dark:bg-white'>
            Add Product
          </Link>
        </Button>
      </div>
      <DataTable
        data={products}
        pageSize={5}
        columns={allProductsColumn}
      />
    </div>
  );
};

export default AdminProductsPage;
