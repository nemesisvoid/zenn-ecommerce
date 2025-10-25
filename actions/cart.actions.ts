'use server';

import { auth } from '@/auth';
import { calcPrice } from '@/helper/utils';
import { CartItemsSchema } from '@/schemas';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

interface CartActionProps {
  productId: string;
  variantId: string | null;
}

export const createCart = async (data: CartActionProps) => {
  try {
    const session = await auth();
    const userId = session?.user.id ?? null;

    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Session Cart not found');

    const cartItems = CartItemsSchema.parse(data);
    const productId = cartItems.productId;
    const variantId = cartItems.variantId ?? null;

    const product = await prisma?.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error('Product not found');

    let variant = null;
    if (variantId) {
      variant = await prisma?.productVariant.findUnique({
        where: {
          id: variantId,
        },
      });

      if (!variant) throw new Error('no variant found');
    }

    const itemPrice = cartItems.price ?? product.price;
    const availabeStock = product.stock;

    if (availabeStock < cartItems.quantity) return { success: false, message: 'Not enough stock available' };

    const cart = await getCart();

    if (!cart) {
      const newCart = {
        userId,
        sessionCartId,
        ...calcPrice([cartItems]),
        cartItems: {
          create: {
            productId,
            price: itemPrice,
            variantId,
          },
        },
      };

      await prisma?.cart.create({ data: newCart });

      return { success: 'cart created', message: 'item added to cart' };
    } else {
      const existingCartItem = cart.cartItems.find(
        item => item.productId === productId && (variantId ? item.variantId === variantId : !item.variantId)
      );

      if (existingCartItem) {
        if (availabeStock < existingCartItem.quantity + 1) {
          return { success: false, message: 'Not enough stock available' };
        }

        await prisma?.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1, price: itemPrice },
        });

        await prisma?.product.update({
          where: { id: productId },
          data: { stock: availabeStock - 1 },
        });
      } else {
        await prisma?.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            variantId,
            price: itemPrice,
          },
        });
      }

      const updatedCart = await prisma?.cart.findFirst({ where: userId ? { userId } : { sessionCartId }, include: { cartItems: true } });

      if (updatedCart) {
        const calcCartItemPrice = updatedCart.cartItems.map(ci => ({
          price: Number(ci.price),
          quantity: Number(ci.quantity),
        }));

        const totalPrice = calcPrice(calcCartItemPrice);

        await prisma?.cart.update({
          where: { id: updatedCart.id },
          data: { ...totalPrice },
        });
      }

      revalidatePath('/cart');
      return { success: true, message: 'item added to cart' };
    }
  } catch (error) {
    console.error('an error occured', error);
    return { success: false, message: 'an error occured' };
  }
};

export const getCart = async () => {
  try {
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;

    if (!sessionCartId) throw new Error('Session Cart not found');

    const session = await auth();
    const userId = session?.user.id ? session?.user.id : undefined;

    const cart = await prisma?.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
      include: {
        cartItems: {
          include: { products: true, variants: true },
        },
      },
    });

    if (!cart) return null;

    return cart;
  } catch (error) {
    console.log('an error occured', error);
  }
};

export const getCartItems = async () => {
  return await prisma?.cartItem.findMany({
    include: { products: true, variants: true },
    orderBy: { createdAt: 'asc' },
  });
};

export const removeCartItem = async (productId: string, variantId?: string | null) => {
  try {
    // check for session cart id
    const sessionCart = (await cookies()).get('sessionCartId')?.value;

    if (!sessionCart) throw new Error('Session Cart not found');

    // check for cart
    const cart = await getCart();
    if (!cart) throw new Error('Cart not found');

    // check for product
    const product = await prisma?.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error('Product not found');

    const isItemInCart = cart.cartItems.find(item => item.productId === productId && (variantId ? item.variantId === variantId : !item.variantId));

    if (!isItemInCart) throw new Error('Product not found in cart');

    // if (!productVariant) throw new Error('Product variant not found in cart');

    // update cart item by variant id or product id

    if (isItemInCart.quantity === 1) {
      await prisma?.cartItem.delete({
        where: { id: isItemInCart.id },
      });
      return { success: true, message: 'Item removed from cart' };
    } else {
      await prisma?.cartItem.update({
        where: { id: isItemInCart.id },
        data: { quantity: isItemInCart.quantity - 1 },
      });
    }

    const updatedCart = await prisma?.cart.findFirst({
      where: { id: cart.id },
      include: { cartItems: true },
    });

    if (updatedCart) {
      await prisma?.cart.update({
        where: { id: updatedCart.id },
        data: { ...calcPrice(updatedCart.cartItems) },
      });
    }
    revalidatePath('/cart');
    return { success: true, message: 'Cart item quantity updated' };
  } catch (error) {
    console.log('an error occured', error);
    return { success: false, message: 'an error occured' };
  }
};
