import { ShoppingBasketIcon, UsersRoundIcon } from 'lucide-react';
import AdminStatCard from '../../../../components/admin/admin-stat-card';
import AllCustomersTable from '@/components/admin/tables/users/all-customers-table';
import { allCustomersColumn } from '@/components/admin/table/users/all-customers-column';
import { getAllCustomers } from '@/actions/user.action';
import DataTable from '@/components/admin/table/data-table';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

const CustomersPage = async () => {
  const getUsers = await getAllCustomers();

  const user = await auth();
  console.log('logged in user', user);

  // --- Admin metrics ---

  const orderCartIds = (await prisma.order.findMany({ select: { cartId: true } })).map(o => o.cartId).filter(Boolean as any);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const cartWhere: any = { cartItems: { some: {} }, createdAt: { lt: oneDayAgo } };
  if (orderCartIds.length) cartWhere.id = { notIn: orderCartIds };
  const abandonedCartsCount = await prisma.cart.count({ where: cartWhere });

  const regions = await prisma.user.groupBy({
    by: ['country'],
    _count: { id: true },
    where: { country: { not: null } },
    orderBy: { _count: { id: 'desc' } },
  });

  const newData = getUsers?.map(user => ({
    name: user.firstName ? `${user.firstName} ${user.lastName}` : user.name,
    id: user.id,
    email: user.email,
    role: user.role,
    avatar: user.image,
    lastOrderDate: user.orders[0]?.createdAt,
    totalOrders: user.orders.length,
    paymentMethod: user.paymentMethods,
    isEmailVerified: user.isEmailVerified,
    avgOrderValue: user.orders.reduce((acc, order) => acc + order.totalPrice, 0),
    // lastLogin:user.
  }));

  console.log('userss', getUsers);
  return (
    <div>
      <div className='flex items-center gap-4 mb-5'>
        <AdminStatCard
          title='Total Customers'
          text={getUsers?.length ?? 0}
          subtext='total number of customers'
          icon={<UsersRoundIcon />}
          variant='customers'
        />

        <AdminStatCard
          title='Abandoned Carts'
          text={abandonedCartsCount}
          subtext='carts with items & no order (24h+)'
          icon={<ShoppingBasketIcon />}
          variant='orders'
        />
      </div>

      <div className='admin-card'>
        <h2 className='table-header'>All Customers List</h2>
        <DataTable
          data={newData ?? []}
          columns={allCustomersColumn}
        />
      </div>
    </div>
  );
};

export default CustomersPage;
