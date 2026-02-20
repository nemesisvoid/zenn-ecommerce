import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PackageSearch } from 'lucide-react';

// Mock Data
const orders = [
  { id: 'ORD-001', date: 'Oct 23, 2023', total: '$120.50', status: 'Delivered', items: ['Wireless Headphones', 'USB-C Cable'] },
  { id: 'ORD-002', date: 'Sep 15, 2023', total: '$45.00', status: 'Processing', items: ['Gaming Mouse'] },
];
const UserOrdersPage = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Order History</h3>
        <p className='text-sm text-muted-foreground'>Check the status of recent orders.</p>
      </div>
      <Separator />

      {/* Empty State (Toggle logic to show this if orders.length === 0) */}
      {orders.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <PackageSearch className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold'>No orders yet</h3>
          <p className='text-muted-foreground mb-4'>You haven't placed any orders yet.</p>
          <Button>Start Shopping</Button>
        </div>
      ) : (
        <div className='space-y-4'>
          {orders.map(order => (
            <Card key={order.id}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <div className='space-y-1'>
                  <CardTitle className='text-base'>Order #{order.id}</CardTitle>
                  <CardDescription>{order.date}</CardDescription>
                </div>
                <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className='text-sm text-muted-foreground mt-2'>
                  {order.items.join(', ')}
                  {order.items.length > 2 && '...'}
                </div>
              </CardContent>
              <CardFooter className='flex justify-between border-t p-4 bg-muted/20'>
                <div className='font-medium'>{order.total}</div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'>
                    View Details
                  </Button>
                  <Button size='sm'>Buy Again</Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrdersPage;
