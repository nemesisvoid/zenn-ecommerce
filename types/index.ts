import { prisma } from '@/lib/prisma';

export type CategoryListType = Awaited<ReturnType<typeof prisma.category.findMany>>;

export type ProductType = Awaited<ReturnType<typeof prisma.product.findFirst>> & {
  variants: Awaited<ReturnType<typeof prisma.productVariant.findMany>>;
};

export type ProductListType = Awaited<ReturnType<typeof prisma.product.findMany>>;

export type VariantType = Awaited<ReturnType<typeof prisma.productVariant.findMany>>;

export type CartType = Awaited<ReturnType<typeof prisma.cart.findFirst>> & {
  cartItems: Awaited<ReturnType<typeof prisma.cartItem.findMany>>;
  variants: VariantType | null;
};

export type CartItemType = Awaited<ReturnType<typeof prisma.cartItem.findFirst>> & {
  products: ProductType | null;
  variants: VariantType | null;
};

export type CartItemT = Awaited<ReturnType<typeof prisma.cartItem.findFirst>>;
