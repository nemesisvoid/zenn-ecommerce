import { getUserById } from '@/actions/user.action';
import DataTable from '@/components/admin/tables/products/data-table';
import { userTransactionColumn } from '@/components/admin/tables/users/user-transaction-column';
import UserStatCard from '@/components/admin/users/user-stat-card';
import { formatCurrency } from '@/helper/utils';
import { BoxIcon, DollarSignIcon } from 'lucide-react';
import Image from 'next/image';

const CustomersDetailsPage = async (props: { params: Promise<{ userId: string }> }) => {
  const { userId } = await props.params;

  const user = await getUserById(userId);

  if (!user)
    return (
      <div className='flex items-center justify-center h-[50vh] -translate-x-15'>
        <p className='text-3xl font-medium'>Requested user not found!</p>
      </div>
    );

  const totalExpense = user.orders.reduce((acc, cur) => acc + cur.totalPrice, 0);
  const totalOrders = user.orders.length;

  const userTransaction1 = user.orders.map(order => ({
    ...order,
    id: order.id,
    status: order.status,
    totalAmount: order.totalPrice,
    isPaid: order.isPaid,
    paymentMethod: order.paymentMethod,
    date: order.createdAt,
  }));

  const userTransaction = user.orders.map(order => ({
    id: order.id,
    status: order.status,
    totalAmount: order.totalPrice,
    isPaid: order.isPaid,
    paymentMethod: order.paymentMethod,
    orderDate: order.createdAt,
  }));

  console.log('testing:', userTransaction, userTransaction1);

  console.log('user', user);
  return (
    <div className='grid grid-cols-1 lg:grid-cols-[minmax(280px,500px)_1fr] gap-6'>
      <div>
        <figure className='bg-white/60 rounded-lg shadow-md dark:bg-dark-100'>
          <div className='relative rounded-md'>
            <div className='h-[100px] w-full bg-purple-300 mb-4 rounded-t-md' />

            <Image
              src={user.image || user.avatarUrl || `/avatar-fallback.png`}
              width={65}
              alt='user image'
              height={65}
              className='rounded-full object-cover absolute -bottom-6 left-10'
            />
          </div>

          <figcaption className='flex flex-col gap-2 px-6 py-3 pb-6'>
            <h3 className='text-lg font-medium mt-4 mb-3'>{user.name}</h3>

            <p className='text-base font-medium'>
              Email: <span className='text-gray-600'>{user.email}</span>
            </p>
            <p className='text-base font-medium'>
              Phone: <span className='text-gray-600'>{user.phone || 'N/A'}</span>
            </p>
            <p className='text-base font-medium'>
              Role:{' '}
              <span className={`inline-block px-3 rounded-3xl ${user.role === 'ADMIN' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                {user.role}
              </span>
            </p>
          </figcaption>
        </figure>
        <div className='bg-white/60 rounded-lg shadow-md dark:bg-dark-100 mt-6 p-6'>
          <h4 className='text-base font-medium mb-4'>Account Metadata</h4>

          <div className='space-y-4'>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-gray-500'>Member Since</span>
              <span className='font-medium'>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>

            <div className='flex justify-between items-center text-sm'>
              <span className='text-gray-500'>Email Verified</span>
              {/* Assuming you have a verified field, otherwise hardcode or check logic */}
              <span className={`px-2 py-0.5 rounded text-xs ${user.emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {user.emailVerified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <div className='flex justify-between items-center text-sm'>
              <span className='text-gray-500'>Last Login</span>
              <span className='font-medium'>2 hours ago</span>
              {/* You can format user.updatedAt or user.lastLogin here */}
            </div>

            <div className='flex justify-between items-center text-sm'>
              <span className='text-gray-500'>Account ID</span>
              <span
                className='font-mono text-xs text-gray-400 truncate max-w-[100px]'
                title={user.id}>
                {user.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 mb-8'>
          <UserStatCard
            title='Total Expense'
            text={formatCurrency(totalExpense)}
            icon={<DollarSignIcon size={32} />}
          />

          <UserStatCard
            title='Total Orders'
            text={totalOrders}
            icon={<BoxIcon size={32} />}
          />
        </div>

        <div className='bg-white/80 dark:bg-dark-100 rounded-md'>
          <h3 className='text-base font-medium py-3 px-8'>Transaction History</h3>

          <hr className='mb-5' />
          <div className='px-6'>
            <DataTable
              pageSize={5}
              data={userTransaction}
              columns={userTransactionColumn}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersDetailsPage;
