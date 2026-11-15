import Link from 'next/link';
import { redirect } from 'next/navigation';
import { HeartIcon } from 'lucide-react';

import { auth } from '@/auth';
import { getWishlist } from '@/actions/wishlist.actions';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/empty-state';
import SettingsHeader from '@/components/user/settings-header';
import WishlistGrid, { type WishlistGridItem } from '@/components/wishlist/wishlist-grid';
import { getPercentagePrice } from '@/helper/utils';
import { loginUrlFor } from '@/routes';

export const dynamic = 'force-dynamic';

const UserWishlistPage = async () => {
  const session = await auth();
  if (!session?.user.id) redirect(loginUrlFor('/user/settings/wishlist'));

  const rows = await getWishlist();
  const items: WishlistGridItem[] = rows.map(({ product, createdAt }) => {
    // Products with options are in stock if any option is; options without their own stock use the product's.
    const stock = product.variants.length > 0 ? Math.max(0, ...product.variants.map(v => v.stock ?? product.stock)) : product.stock;
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? null,
      price: product.price,
      salePrice: getPercentagePrice(product.price, product.discountPercent ?? 0),
      hasOptions: product.variants.length > 0,
      stock,
      savedAt: createdAt.toISOString(),
    };
  });

  return (
    <div>
      <SettingsHeader
        title='Wishlist'
        description={items.length > 0 ? `${items.length} saved ${items.length === 1 ? 'item' : 'items'}` : 'Save items you want to buy later.'}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={HeartIcon}
          title='Your wishlist is empty'
          description='Tap the heart on any product to save it here for later.'
          className='panel'>
          <Button
            asChild
            className='h-11 rounded-full px-6'>
            <Link href='/list'>Browse products</Link>
          </Button>
        </EmptyState>
      ) : (
        <WishlistGrid items={items} />
      )}
    </div>
  );
};

export default UserWishlistPage;
