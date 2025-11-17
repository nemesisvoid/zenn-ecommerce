'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import * as z from 'zod';
import { CreateProductSchema } from '@/schemas';
import { slugify } from '@/helper/utils';

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
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        price: true,
        categories: {
          select: {
            name: true,
          },
        },
        variants: true,
      },
    });
    return data;
  } catch (error) {
    console.log('error fetching products', error);
  }
};

export const createProduct = async (productData: z.infer<typeof CreateProductSchema>) => {
  try {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');
    const validatedProduct = CreateProductSchema.safeParse(productData);

    if (!validatedProduct.success) throw new Error(validatedProduct.error.message);

    const { data } = validatedProduct;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        categories: {
          connect: [...data.categories.map((id: string) => ({ id }))],
        },
        price: data.price,
        description: data.description,
        discountPercent: data.discountPercent,
        images: data.images,
        hasVariants: data.hasVariants,
        stock: data.stock,
        variants: data.variants?.length
          ? {
              create: data.variants,
            }
          : undefined,
      },
    });

    return { data: product, success: true, message: 'Product created successfully' };
  } catch (err) {
    console.log('error creating product', err);
    return { success: false, message: 'Error creating product' };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath('/admin/products');
    return { success: 'Product deleted successfully' };
  } catch (error) {
    console.error('error deleting product', error);
  }
};
