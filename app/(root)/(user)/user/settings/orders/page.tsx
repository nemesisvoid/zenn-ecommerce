import Link from 'next/link';
import { PackageSearch } from 'lucide-react';
import { auth } from '@/auth';
import { getUserOrders } from '@/actions/order.action';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/empty-state';
import OrderStatusPill from '@/components/shared/order-status-pill';
import SettingsHeader from '@/components/user/settings-header';
import { formatCurrency } from '@/helper/utils';

const UserOrdersPage = async () => {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) return null;
  const orders = await getUserOrders();

  return (
    <div>
      <SettingsHeader
        title='Orders'
        description='Track recent orders and view past purchases.'
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title='No orders yet'
          description="You haven't placed any orders yet. When you do, they'll show up here."
          className='panel'>
          <Button
            asChild
            className='h-11 rounded-full px-6'>
            <Link href='/list'>Start shopping</Link>
          </Button>
        </EmptyState>
      ) : (
        <ul className='space-y-4'>
          {orders.map(order => {
            const itemNames = order.orderItems.map(item => item.product.name);
            const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <li
                key={order.id}
                className='panel overflow-hidden'>
                <div className='flex flex-wrap items-start justify-between gap-3 p-5 md:p-6'>
                  <div>
                    <p className='text-[0.9375rem] font-semibold text-foreground'>Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      {order.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {itemCount}{' '}
                      {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {order.status === 'CANCELLED' && <OrderStatusPill status='CANCELLED' />}
                    <OrderStatusPill
                      label='Payment'
                      status={order.paymentStatus}
                    />
                    <OrderStatusPill
                      label='Delivery'
                      status={order.deliveryStatus}
                    />
                  </div>
                </div>
                <p className='px-5 pb-5 text-sm text-muted-foreground md:px-6'>
                  {itemNames.slice(0, 2).join(', ')}
                  {itemNames.length > 2 && ` and ${itemNames.length - 2} more`}
                </p>
                <div className='flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/50 px-5 py-4 md:px-6'>
                  <p className='price text-foreground'>{formatCurrency(order.totalPrice)}</p>
                  <Button
                    asChild
                    variant='outline'
                    size='sm'
                    className='h-9 rounded-full px-4'>
                    <Link href={`/order/${order.id}`}>View details</Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UserOrdersPage;
