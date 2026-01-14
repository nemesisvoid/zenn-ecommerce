import { getAllOrders } from '@/actions/order.action';
import { allOrdersColumn } from '@/components/admin/table/columns/all-orders-column';
import DataTable from '@/components/admin/table/data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const AllOrdersPage = async () => {
  const orders = await getAllOrders();

  const order = orders?.map(order => ({
    id: order.id,
    customerName: order.user.name,
    totalItems: order.orderItems.length,
    orderNumber: order.id.slice(0, 8).toUpperCase(),
    totalAmount: order.totalPrice,
    orderDate: order.createdAt,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
    deliveryStatus: order.deliveryStatus,
  }));

  return (
    <div className='admin-card px-0'>
      <div className='flex justify-between px-4'>
        <h2 className='table-header'>All Orders List</h2>
        <Button asChild>
          <Link
            href='/admin/products/create-product'
            className='text-sm text-gray-700 mx-4 mb-5  px-4 py-2 rounded-md dark:bg-white'>
            Add Product
          </Link>
        </Button>
      </div>
      <DataTable
        data={order ?? []}
        pageSize={5}
        columns={allOrdersColumn}
      />
    </div>
  );
};

export default AllOrdersPage;
