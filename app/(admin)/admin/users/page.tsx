import { UsersRoundIcon } from 'lucide-react';
import AdminStatCard from '../../../../components/admin/admin-stat-card';
import AllCustomersTable from '@/components/admin/tables/users/all-customers-table';
import { allCustomersColumn } from '@/components/admin/table/users/all-customers-column';
import { getAllCustomers } from '@/actions/user.action';
import DataTable from '@/components/admin/table/data-table';
import { auth } from '@/auth';

const CustomersPage = async () => {
  const getUsers = await getAllCustomers();

  const user = await auth();
  console.log('logged in user', user);

  const newData = getUsers?.map(user => ({
    name: user.firstName ? `${user.firstName} ${user.lastName}` : user.name,
    id: user.id,
    email: user.email,
    // phone: user.phone,
    // address: user.address,
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
      <div className='flex items-center mb-8'>
        <AdminStatCard
          title='Total Customers'
          text={0}
          subtext='hellos'
          icon={<UsersRoundIcon />}
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
