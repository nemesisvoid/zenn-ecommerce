import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export type CategoryListType = Awaited<ReturnType<typeof prisma.category.findMany>>;

export type ProductType = Awaited<ReturnType<typeof prisma.product.findFirst>> & {
  variants: Awaited<ReturnType<typeof prisma.productVariant.findMany>>;
  colorImages: Awaited<ReturnType<typeof prisma.productColorImage.findMany>>;
  categories: Awaited<ReturnType<typeof prisma.category.findMany>>;
};

export type ProductListType = Awaited<ReturnType<typeof prisma.product.findMany>>;

export type VariantType = Awaited<ReturnType<typeof prisma.productVariant.findMany>> & {
  colorImages: Awaited<ReturnType<typeof prisma.productColorImage.findMany>>;
};

export type ColorImagesType = Awaited<ReturnType<typeof prisma.productColorImage.findFirst>>;

// Shapes returned by getCart() in actions/cart.actions.ts — keep the includes in sync.
type CartItemInclude = { products: { include: { colorImages: true } }; variants: true };

export type CartItemType = Prisma.CartItemGetPayload<{ include: CartItemInclude }>;

export type CartType = Prisma.CartGetPayload<{ include: { cartItems: { include: CartItemInclude } } }>;

export type UserType = Awaited<ReturnType<typeof prisma.user.findUnique>>;
export type CartItemT = Awaited<ReturnType<typeof prisma.cartItem.findFirst>>;
