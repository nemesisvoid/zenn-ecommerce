'use client';

import { CartType } from '@/types';
import { Button } from '../ui/button';
import { useTransition } from 'react';
import { createCart } from '@/actions/cart.actions';
import { ShoppingBagIcon } from 'lucide-react';
import { toast } from 'sonner';

type AddToCartType = {
  cart: CartType | undefined;
  product: { id: string; price: number };
  canAddToCart: boolean;
  selectedVariant?: { id: string; productId: string; price: number } | null;
  price: number;
};

const AddToCart = ({ product, selectedVariant, price, canAddToCart }: AddToCartType) => {
  // const isItemInCart = cart && product && cart.cartItems.find(item => item.productId === product.productId);
  console.log('product in addToCart', product, selectedVariant);
  const variantId = selectedVariant?.id ?? null;
  const productId = product.id;

  const [isPending, startTransition] = useTransition();
  const handleAddToCart = async () => {
    startTransition(async () => {
      const newData = {
        productId,
        variantId,
        price,
        quantity: 1,
      };
      const res = await createCart(newData);

      if (!res?.success) {
        toast.error(res?.message);
        return;
      }
      toast.success(res?.message);
      console.log({ res });
    });
  };

  return (
    <Button
      className='w-1/2 text-2xl py-6 bg-black text-white flex items-center hover:bg-white hover:text-black border-0 hover:border-1 hover:border-black rounded-sm cursor-pointer'
      disabled={!canAddToCart || isPending}
      onClick={handleAddToCart}>
      <div className='flex items-center gap-2'>
        <ShoppingBagIcon size={34} /> {isPending ? 'Adding...' : <p>Add to Cart</p>}
      </div>
    </Button>
  );
};

export default AddToCart;
