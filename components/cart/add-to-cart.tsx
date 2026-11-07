'use client';

import { Button } from '../ui/button';
import { useTransition } from 'react';
import { createCart } from '@/actions/cart.actions';
import { ShoppingBagIcon } from 'lucide-react';
import Spinner from '@/components/shared/spinner';
import { toast } from 'sonner';

type AddToCartType = {
  product: { id: string; price: number };
  canAddToCart: boolean;
  selectedVariant?: { id: string; productId: string; price: number } | null;
};

const AddToCart = ({ product, selectedVariant, canAddToCart }: AddToCartType) => {
  // const isItemInCart = cart && product && cart.cartItems.find(item => item.productId === product.productId);

  const variantId = selectedVariant?.id ?? null;
  const productId = product.id;

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      // Only say what to add — the server looks up the price.
      const newData = { productId, variantId };
      const res = await createCart(newData);

      if (!res?.success) {
        toast.error(res?.message);
        return;
      }
      toast.success(res?.message);
    });
  };

  return (
    <Button
      className='h-13 w-full cursor-pointer rounded-full text-base font-semibold transition-[background-color,transform] active:scale-[0.99]'
      disabled={!canAddToCart || isPending}
      onClick={handleAddToCart}>
      {isPending ? (
        <Spinner
          className='size-5'
          aria-hidden='true'
        />
      ) : (
        <ShoppingBagIcon
          className='size-5'
          aria-hidden='true'
        />
      )}
      {isPending ? 'Adding to bag…' : 'Add to bag'}
    </Button>
  );
};

export default AddToCart;
