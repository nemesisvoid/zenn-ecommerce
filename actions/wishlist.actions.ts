'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getSessionUser } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

type ToggleResult = { success: true; wishlisted: boolean; message: string } | { success: false; message: string; needsLogin?: boolean };

const ProductIdSchema = z.string().min(1).max(100);

/** Product ids on the signed-in user's wishlist (empty for guests). Used to fill in the hearts. */
export const getWishlistIds = async (): Promise<string[]> => {
  const user = await getSessionUser();
  if (!user) return [];
  const rows = await prisma.wishlist.findMany({ where: { userId: user.id, product: { isArchived: false } }, select: { productId: true } });
  return rows.map(row => row.productId);
};

/** Full wishlist for the account page, newest first. Archived products are never listed. */
export const getWishlist = async () => {
  const user = await getSessionUser();
  if (!user) return [];
  return prisma.wishlist.findMany({
    where: { userId: user.id, product: { isArchived: false } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          discountPercent: true,
          images: true,
          stock: true,
          variants: { select: { stock: true } },
        },
      },
    },
  });
};

/** Adds the product if it isn't saved yet, removes it if it is. */
export const toggleWishlist = async (productId: string): Promise<ToggleResult> => {
  const user = await getSessionUser();
  if (!user) return { success: false, message: 'Sign in to save items to your wishlist', needsLogin: true };
  if (!ProductIdSchema.safeParse(productId).success) return { success: false, message: 'Product not found' };

  try {
    const existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId: user.id, productId } }, select: { id: true } });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      revalidatePath('/user/settings/wishlist');
      return { success: true, wishlisted: false, message: 'Removed from your wishlist' };
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { isArchived: true } });
    if (!product || product.isArchived) return { success: false, message: 'This product is no longer available' };

    // upsert: a double click can't create a duplicate (userId + productId is unique).
    await prisma.wishlist.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      create: { userId: user.id, productId },
      update: {},
    });
    revalidatePath('/user/settings/wishlist');
    return { success: true, wishlisted: true, message: 'Saved to your wishlist' };
  } catch (error) {
    console.error('error updating wishlist', error);
    return { success: false, message: 'Could not update your wishlist' };
  }
};
