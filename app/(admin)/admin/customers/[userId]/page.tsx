import { getUserById } from '@/actions/user.action';
import AdminUserDetails from '@/components/admin/tables/users/admin-user-details';
import AdminUserForm from '@/components/admin/users/admin-user-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CustomersDetailsPage = async (props: { params: Promise<{ userId: string }> }) => {
  const { userId } = await props.params;

  const user = await getUserById(userId);

  if (!user)
    return (
      <div className='flex items-center justify-center h-[50vh] -translate-x-15'>
        <p className='text-3xl font-medium'>Requested user not found!</p>
      </div>
    );

  const userStats = {
    totalExpense: user.orders.reduce((acc, cur) => acc + cur.totalPrice, 0),
    totalOrders: user.orders.length,
  };

  const userTransaction = user.orders.map(order => ({
    id: order.id,
    status: order.status,
    totalAmount: order.totalPrice,
    isPaid: order.isPaid,
    paymentMethod: order.paymentMethod,
    orderDate: order.createdAt,
  }));

  return (
    <Tabs defaultValue='user-details'>
      <TabsList className='bg-dark-100 mt-4 mb-6'>
        <TabsTrigger
          className='py-4'
          value='user-details'>
          User Details
        </TabsTrigger>
        <TabsTrigger
          className='py-4'
          value='edit-user'>
          Edit User
        </TabsTrigger>
      </TabsList>

      <TabsContent value='user-details'>
        <AdminUserDetails
          user={user}
          userTransaction={userTransaction}
          userStats={userStats}
        />
      </TabsContent>

      <TabsContent value='edit-product'>
        <AdminUserForm initialData={user} />
      </TabsContent>
    </Tabs>
  );
};

export default CustomersDetailsPage;
