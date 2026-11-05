import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/empty-state';
import SettingsHeader from '@/components/user/settings-header';
import { PackageSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data
const orders = [
  { id: 'ORD-001', date: 'Oct 23, 2023', total: '$120.50', status: 'Delivered', items: ['Wireless Headphones', 'USB-C Cable'] },
  { id: 'ORD-002', date: 'Sep 15, 2023', total: '$45.00', status: 'Processing', items: ['Gaming Mouse'] },
];
const UserOrdersPage = () => {
  return (
    <div>
      <SettingsHeader
        title='Orders'
        description='Track recent orders and view past purchases.'
      />

      {/* Empty State (Toggle logic to show this if orders.length === 0) */}
      {orders.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title='No orders yet'
          description="You haven't placed any orders yet."
          className='panel'>
          <Button className='h-11 rounded-full px-6'>Start shopping</Button>
        </EmptyState>
      ) : (
        <ul className='space-y-4'>
          {orders.map(order => (
            <li
              key={order.id}
              className='panel overflow-hidden'>
              <div className='flex flex-wrap items-start justify-between gap-3 p-5 md:p-6'>
                <div>
                  <p className='text-[0.9375rem] font-semibold text-foreground'>Order #{order.id}</p>
                  <p className='mt-1 text-sm text-muted-foreground'>{order.date}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    order.status === 'Delivered' ? 'bg-success/12 text-success' : 'bg-brand-soft text-brand-ink',
                  )}>
                  {order.status}
                </span>
              </div>
              <p className='px-5 pb-5 text-sm text-muted-foreground md:px-6'>
                {order.items.join(', ')}
                {order.items.length > 2 && '...'}
              </p>
              <div className='flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/50 px-5 py-4 md:px-6'>
                <p className='price text-foreground'>{order.total}</p>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-9 rounded-full px-4'>
                    View details
                  </Button>
                  <Button
                    size='sm'
                    className='h-9 rounded-full px-4'>
                    Buy again
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserOrdersPage;
