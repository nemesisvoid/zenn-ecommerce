import { getAllOrders } from '@/actions/order.action';
import { allOrdersColumn } from '@/components/admin/table/columns/all-orders-column';
import DataTable from '@/components/admin/table/data-table';

const AllOrdersPage = async () => {
  const orders = await getAllOrders();

  const order = orders?.map(order => ({
    id: order.id,
    userId: order.user.id,
    customerName: order.user.firstName ? `${order.user.firstName} ${order.user.lastName ?? ''}`.trim() : order.user.name || order.user.email,
    avatar: order.user.avatar ?? order.user.image,
    totalItems: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
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
        <h2 className='table-header'>All Orders</h2>
      </div>
      <DataTable
        data={order ?? []}
        pageSize={10}
        columns={allOrdersColumn}
      />
    </div>
  );
};

export default AllOrdersPage;
