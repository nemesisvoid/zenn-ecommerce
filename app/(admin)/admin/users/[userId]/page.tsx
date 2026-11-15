import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

import { getUserById } from '@/actions/user.action';
import AdminUserDetails from '@/components/admin/users/admin-user-details';
import AdminUserForm from '@/components/admin/users/admin-user-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BackLink = () => (
  <Link
    href='/admin/users'
    className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'>
    <ArrowLeftIcon
      className='size-4'
      aria-hidden='true'
    />
    All users
  </Link>
);

const CustomersDetailsPage = async (props: { params: Promise<{ userId: string }> }) => {
  const { userId } = await props.params;

  const user = await getUserById(userId);

  if (!user)
    return (
      <div className='py-16 text-center'>
        <p className='text-lg font-semibold text-foreground'>User not found</p>
        <p className='mt-1 text-sm text-muted-foreground'>This account may have been deleted.</p>
        <div className='mt-6'>
          <BackLink />
        </div>
      </div>
    );

  const initialData = {
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
    userStatus: user.status,
  };

  // Money only counts once it's actually been paid (not pending, failed or fully refunded orders).
  const paid = user.orders.filter(order => order.paymentStatus === 'PAID' || order.paymentStatus === 'PARTIALLY_REFUNDED');
  const userStats = {
    totalSpent: paid.reduce((sum, order) => sum + order.totalPrice, 0),
    paidOrders: paid.length,
    totalOrders: user.orders.length,
    deliveredOrders: user.orders.filter(order => order.deliveryStatus === 'DELIVERED').length,
    lastOrderAt: user.orders[0]?.createdAt ?? null, // orders come newest first
  };

  const userTransaction = user.orders.map(order => ({
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    deliveryStatus: order.deliveryStatus,
    totalAmount: order.totalPrice,
    paymentMethod: order.paymentMethod,
    orderDate: order.createdAt,
  }));

  return (
    <div>
      <BackLink />

      <Tabs
        defaultValue='user-details'
        className='mt-4'>
        <TabsList className='mb-6'>
          <TabsTrigger value='user-details'>Overview</TabsTrigger>
          <TabsTrigger value='edit-user'>Edit user</TabsTrigger>
        </TabsList>

        <TabsContent value='user-details'>
          <AdminUserDetails
            user={user}
            userTransaction={userTransaction}
            userStats={userStats}
          />
        </TabsContent>

        <TabsContent value='edit-user'>
          <AdminUserForm
            id={user.id}
            initialData={initialData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomersDetailsPage;
