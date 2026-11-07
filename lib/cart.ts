// Server-side cart pricing. Deliberately NOT a 'use server' module: these helpers
// must only be called from our own server code, never exposed as public actions.
import { calcPrice, getPercentagePrice } from '@/helper/utils';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

type PricedProduct = { price: number; discountPercent: number | null };
type PricedVariant = { price: number | null } | null;

/** Unit price for a product/variant, always taken from the database values passed in. */
export const getUnitPrice = (product: PricedProduct, variant: PricedVariant) => {
  const price = variant?.price ?? product.price;
  const discountPrice = product.discountPercent ? getPercentagePrice(price, product.discountPercent) : null;
  return { price, discountPrice };
};

/** What the customer actually pays per unit. */
export const effectiveUnitPrice = (item: { price: number; discountPrice: number | null }) => item.discountPrice ?? item.price;

/** Available stock for a cart line: the variant's own stock when it has one, otherwise the product's. */
export const availableStock = (product: { stock: number }, variant: { stock: number | null } | null) => variant?.stock ?? product.stock;

/**
 * Re-prices every item in the cart from current product/variant data, then recalculates
 * the cart totals from the stored rows. Returns the names of items whose quantity
 * exceeds available stock (the cart is still updated; callers decide what to do).
 */
export const refreshCart = async (cartId: string) => {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: {
      products: { select: { name: true, price: true, discountPercent: true, stock: true } },
      variants: { select: { price: true, stock: true } },
    },
  });

  const outOfStock: string[] = [];

  await Promise.all(
    items.map(item => {
      const { price, discountPrice } = getUnitPrice(item.products, item.variants);
      if (item.quantity > availableStock(item.products, item.variants)) outOfStock.push(item.products.name);
      if (price === item.price && discountPrice === item.discountPrice) return null;
      return prisma.cartItem.update({ where: { id: item.id }, data: { price, discountPrice } });
    }),
  );

  const totals = calcPrice(
    items.map(item => {
      const unit = getUnitPrice(item.products, item.variants);
      return { price: effectiveUnitPrice(unit), quantity: item.quantity };
    }),
  );

  await prisma.cart.update({ where: { id: cartId }, data: totals });

  return { outOfStock };
};

/**
 * Takes ordered quantities out of stock. Uses the variant's own stock when it tracks one,
 * otherwise the product's — the same rule as availableStock(). Each decrement only applies
 * if enough stock is left, so stock never goes negative. Returns the order item ids that
 * could not be fulfilled from stock.
 */
export const decrementStock = async (
  db: Prisma.TransactionClient,
  items: { id: string; productId: string; variantId: string | null; quantity: number }[],
) => {
  const short: string[] = [];

  for (const item of items) {
    const variant = item.variantId ? await db.productVariant.findUnique({ where: { id: item.variantId }, select: { stock: true } }) : null;

    const { count } =
      variant && variant.stock !== null
        ? await db.productVariant.updateMany({
            where: { id: item.variantId!, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          })
        : await db.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });

    if (count === 0) short.push(item.id);
  }

  return short;
};
