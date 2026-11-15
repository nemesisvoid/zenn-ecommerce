'use client';

import { HeartIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useWishlist } from './wishlist-provider';

type Props = {
  productId: string;
  productName: string;
  /** "icon": small round button for product cards. "full": outlined pill with a label, for the product page. */
  variant?: 'icon' | 'full';
  className?: string;
  onToggled?: (saved: boolean) => void;
};

const WishlistButton = ({ productId, productName, variant = 'icon', className, onToggled }: Props) => {
  const { has, toggle } = useWishlist();
  const saved = has(productId);

  const onClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const result = await toggle(productId);
    if (result !== null) onToggled?.(result);
  };

  const heart = (
    <HeartIcon
      className={cn('transition-transform duration-200 group-active/wish:scale-90', variant === 'icon' ? 'size-[18px]' : 'size-5', saved && 'fill-current')}
      aria-hidden='true'
    />
  );

  if (variant === 'full') {
    return (
      <button
        type='button'
        onClick={onClick}
        aria-pressed={saved}
        className={cn(
          'group/wish inline-flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border text-base font-semibold transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          saved ? 'text-destructive' : 'text-foreground',
          className,
        )}>
        {heart}
        {saved ? 'Saved to wishlist' : 'Save to wishlist'}
      </button>
    );
  }

  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={cn(
        'group/wish flex size-9 cursor-pointer items-center justify-center rounded-full bg-background/85 shadow-sm backdrop-blur transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        saved ? 'text-destructive' : 'text-foreground/80 hover:text-foreground',
        className,
      )}>
      {heart}
    </button>
  );
};

export default WishlistButton;
