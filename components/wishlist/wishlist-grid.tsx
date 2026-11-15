'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ImageIcon, Loader2Icon, ShoppingBagIcon, XIcon } from 'lucide-react';

import { createCart } from '@/actions/cart.actions';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/helper/utils';
import { cn } from '@/lib/utils';
import { useWishlist } from './wishlist-provider';

export type WishlistGridItem = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  salePrice: number;
  hasOptions: boolean;
  stock: number;
  savedAt: string;
};

const LOW_STOCK = 5;

const WishlistCard = ({ item, onRemoved }: { item: WishlistGridItem; onRemoved: (id: string) => void }) => {
  const router = useRouter();
  const { toggle } = useWishlist();
  const [isAdding, startAdding] = useTransition();
  const [isRemoving, setIsRemoving] = useState(false);

  const soldOut = item.stock <= 0;
  const onSale = item.salePrice < item.price;

  const remove = async () => {
    setIsRemoving(true);
    const result = await toggle(item.id);
    if (result === false) onRemoved(item.id);
    else setIsRemoving(false);
  };

  const addToBag = () =>
    startAdding(async () => {
      const res = await createCart({ productId: item.id, variantId: null });
      if (!res?.success) {
        toast.error(res?.message ?? 'Could not add to your bag');
        return;
      }
      toast.success(res.message, { action: { label: 'View bag', onClick: () => router.push('/cart') } });
      router.refresh();
    });

  return (
    <li className={cn('group flex flex-col transition-opacity', isRemoving && 'pointer-events-none opacity-50')}>
      <div className='relative'>
        <Link
          href={`/product/${item.slug}`}
          className='relative block aspect-[4/5] overflow-hidden rounded-2xl bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'>
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes='(min-width: 768px) 30vw, 50vw'
              className={cn('object-cover transition-transform duration-500 group-hover:scale-[1.03]', soldOut && 'opacity-60 grayscale')}
            />
          ) : (
            <span className='flex h-full items-center justify-center text-muted-foreground'>
              <ImageIcon
                className='size-8 opacity-50'
                aria-hidden='true'
              />
            </span>
          )}
          {soldOut && (
            <span className='absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur'>
              Out of stock
            </span>
          )}
          {!soldOut && onSale && (
            <span className='sale-badge absolute left-3 top-3'>−{Math.round((1 - item.salePrice / item.price) * 100)}%</span>
          )}
        </Link>
        <button
          type='button'
          onClick={remove}
          aria-label={`Remove ${item.name} from wishlist`}
          title='Remove from wishlist'
          className='absolute right-3 top-3 flex size-9 cursor-pointer items-center justify-center rounded-full bg-background/85 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'>
          {isRemoving ? (
            <Loader2Icon
              className='size-4 animate-spin'
              aria-hidden='true'
            />
          ) : (
            <XIcon
              className='size-4'
              aria-hidden='true'
            />
          )}
        </button>
      </div>

      <div className='flex flex-1 flex-col px-1 pt-4'>
        <Link
          href={`/product/${item.slug}`}
          className='truncate text-[0.9375rem] font-medium text-foreground hover:underline'>
          {item.name}
        </Link>
        <div className='mt-1 flex items-baseline gap-2'>
          <p className='price text-[0.9375rem] text-foreground'>{formatCurrency(item.salePrice)}</p>
          {onSale && <p className='price text-sm text-muted-foreground line-through decoration-1'>{formatCurrency(item.price)}</p>}
        </div>
        {!soldOut && item.stock <= LOW_STOCK && <p className='mt-1 text-xs text-amber-700 dark:text-amber-300'>Only {item.stock} left</p>}

        <div className='mt-auto pt-4'>
          {item.hasOptions ? (
            <Button
              asChild
              variant='outline'
              className='h-10 w-full rounded-full'>
              <Link href={`/product/${item.slug}`}>Choose options</Link>
            </Button>
          ) : (
            <Button
              variant='outline'
              className='h-10 w-full gap-2 rounded-full'
              onClick={addToBag}
              disabled={soldOut || isAdding}>
              {isAdding ? (
                <Loader2Icon
                  className='size-4 animate-spin'
                  aria-hidden='true'
                />
              ) : (
                <ShoppingBagIcon
                  className='size-4'
                  aria-hidden='true'
                />
              )}
              {soldOut ? 'Out of stock' : 'Add to bag'}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
};

const WishlistGrid = ({ items }: { items: WishlistGridItem[] }) => {
  const [removed, setRemoved] = useState<Set<string>>(() => new Set());
  const visible = items.filter(item => !removed.has(item.id));

  if (visible.length === 0) {
    return (
      <div className='panel flex flex-col items-center gap-3 px-6 py-14 text-center'>
        <p className='text-base font-semibold text-foreground'>Your wishlist is empty</p>
        <p className='text-sm text-muted-foreground'>Tap the heart on any product to save it here for later.</p>
        <Button
          asChild
          className='mt-2 h-11 rounded-full px-6'>
          <Link href='/list'>Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className='grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6'>
      {visible.map(item => (
        <WishlistCard
          key={item.id}
          item={item}
          onRemoved={id => setRemoved(prev => new Set(prev).add(id))}
        />
      ))}
    </ul>
  );
};

export default WishlistGrid;
