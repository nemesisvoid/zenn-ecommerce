import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image'; // Assuming Next.js
const UserWishlistPage = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>My Wishlist</h3>
        <p className='text-sm text-muted-foreground'>Save items you want to buy later.</p>
      </div>
      <Separator />

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        {/* Wishlist Item Card */}
        {[1, 2, 3].map(item => (
          <div
            key={item}
            className='group relative border rounded-lg overflow-hidden bg-background hover:shadow-md transition-all'>
            <div className='relative h-48 w-full bg-muted'>
              {/* Placeholder for Image */}
              <div className='absolute inset-0 flex items-center justify-center text-muted-foreground'>Product Image</div>
              <button className='absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white hover:text-red-500 transition-colors'>
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
            <div className='p-4'>
              <h4 className='font-semibold truncate'>Ergonomic Office Chair</h4>
              <p className='text-sm text-muted-foreground'>$299.00</p>
              <Button
                className='w-full mt-4 gap-2'
                size='sm'>
                <ShoppingCart className='w-4 h-4' /> Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserWishlistPage;
