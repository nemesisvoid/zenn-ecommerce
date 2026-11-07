'use server';

import { auth } from '@/auth';
import { availableStock, getUnitPrice, refreshCart } from '@/lib/cart';
import { CartItemsSchema } from '@/schemas';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { prisma } from '@/lib/prisma';

interface CartActionProps {
  productId: string;
  variantId: string | null;
}

// Adds one unit of a product (or one of its variants) to the current cart.
// The browser only says WHAT to add; prices always come from the database.
export const createCart = async (data: CartActionProps) => {
  try {
    const session = await auth();
    const userId = session?.user.id ?? null;

    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Session Cart not found');

    const { productId, variantId: rawVariantId } = CartItemsSchema.parse(data);
    const variantId = rawVariantId ?? null;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { colorImages: true, variants: true },
    });
    if (!product || product.isArchived || product.deletedAt) return { success: false, message: 'This product is no longer available' };

    const variant = variantId ? (product.variants.find(v => v.id === variantId) ?? null) : null;
    if (variantId && !variant) return { success: false, message: 'Selected option not found' };
    if (!variant && product.variants.length > 0) return { success: false, message: 'Please select an option' };

    const { price, discountPrice } = getUnitPrice(product, variant);
    const image = (variant && product.colorImages.find(ci => ci.color === variant.color)?.images[0]) || product.images[0] || null;

    const cart = await getCart();
    const existingCartItem = cart?.cartItems.find(item => item.productId === productId && item.variantId === variantId);
    const newQuantity = (existingCartItem?.quantity ?? 0) + 1;

    if (newQuantity > availableStock(product, variant)) return { success: false, message: 'Not enough stock available' };

    let cartId: string;
    if (!cart) {
      const newCart = await prisma.cart.create({
        data: {
          userId,
          sessionCartId,
          itemsPrice: 0,
          shippingPrice: 0,
          totalPrice: 0,
          cartItems: { create: { productId, variantId, quantity: 1, price, discountPrice, image } },
        },
      });
      cartId = newCart.id;
    } else if (existingCartItem) {
      cartId = cart.id;
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity, price, discountPrice },
      });
    } else {
      cartId = cart.id;
      await prisma.cartItem.create({
        data: { cartId, productId, variantId, quantity: 1, price, discountPrice, image },
      });
    }

    await refreshCart(cartId);

    revalidatePath(`/product/${product.slug}`);
    revalidatePath('/cart');
    return { success: true, message: 'Item added to cart' };
  } catch (error) {
    console.error('an error occurred', error);
    return { success: false, message: 'Something went wrong adding this item' };
  }
};

export const getCart = async () => {
  try {
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;

    if (!sessionCartId) throw new Error('Session Cart not found');

    const session = await auth();
    const userId = session?.user.id ? session?.user.id : undefined;

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
      include: {
        cartItems: {
          include: {
            products: {
              include: { colorImages: true },
            },
            variants: true,
          },
        },
      },
    });

    if (!cart) return null;

    return cart;
  } catch (error) {
    console.error('an error occured', error);
  }
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
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error('Product not found');

    const isItemInCart = cart.cartItems.find(item => item.productId === productId && (variantId ? item.variantId === variantId : !item.variantId));

    if (!isItemInCart) throw new Error('Product not found in cart');

    // if (!productVariant) throw new Error('Product variant not found in cart');

    // update cart item by variant id or product id

    if (isItemInCart.quantity === 1) {
      await prisma.cartItem.delete({ where: { id: isItemInCart.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: isItemInCart.id },
        data: { quantity: isItemInCart.quantity - 1 },
      });
    }

    // Always recalculate, including when the last unit of an item is removed.
    await refreshCart(cart.id);
    revalidatePath('/cart');
    return { success: true, message: isItemInCart.quantity === 1 ? 'Item removed from cart' : 'Cart item quantity updated' };
  } catch (error) {
    console.error('an error occured', error);
    return { success: false, message: 'an error occured' };
  }
};

// Removes a whole line (all units) from the current cart.
export const deleteCartItem = async (productId: string, variantId?: string | null) => {
  try {
    const cart = await getCart();
    if (!cart) throw new Error('Cart not found');

    const item = cart.cartItems.find(i => i.productId === productId && i.variantId === (variantId ?? null));
    if (!item) throw new Error('Product not found in cart');

    await prisma.cartItem.delete({ where: { id: item.id } });
    await refreshCart(cart.id);

    revalidatePath('/cart');
    return { success: true, message: 'Item removed from cart' };
  } catch (error) {
    console.error('an error occured', error);
    return { success: false, message: 'Could not remove this item' };
  }
};
