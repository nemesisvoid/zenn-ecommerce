'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';

/**
 * 
 * @returns import { PrismaClient } from '@prisma/client';
 const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
 
 export const prisma = globalForPrisma.prisma || new PrismaClient();
 
 if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
 
 */

export const getProductsByNewArrivals = async () => {
  const data = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: {
      isArchived: false,
    },
  });
  return data;
};

export const getProductBySlug = async (slug: string) => {
  const data = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
    },
  });

  if (!data) return null;

  return data;
};

export const getAllProducts = async () => {
  try {
    const data = await prisma.product.findMany({
      where: {
        isArchived: false,
      },
    });
    return data;
  } catch (error) {
    console.log('error fetching products', error);
  }
};
