import { Button } from '@/components/ui/button';
import SettingsHeader from '@/components/user/settings-header';
import { ImageIcon, ShoppingBag, Trash2 } from 'lucide-react';

const UserWishlistPage = () => {
  return (
    <div>
      <SettingsHeader
        title='Wishlist'
        description='Save items you want to buy later.'
      />

      <div className='grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6'>
        {/* Wishlist Item Card */}
        {[1, 2, 3].map(item => (
          <div
            key={item}
            className='group flex flex-col'>
            <div className='relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground'>
              {/* Placeholder for Image */}
              <ImageIcon
                className='size-8 opacity-50'
                aria-hidden='true'
              />
              <button
                type='button'
                aria-label='Remove from wishlist'
                className='absolute right-3 top-3 flex size-9 cursor-pointer items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-destructive'>
                <Trash2 className='size-4' />
              </button>
            </div>
            <div className='px-1 pt-4'>
              <h3 className='truncate text-[0.9375rem] font-medium text-foreground'>Ergonomic Office Chair</h3>
              <p className='price mt-1 text-[0.9375rem] text-foreground'>$299.00</p>
              <Button
                className='mt-4 h-10 w-full gap-2 rounded-full'
                variant='outline'
                size='sm'>
                <ShoppingBag className='size-4' /> Add to bag
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserWishlistPage;
