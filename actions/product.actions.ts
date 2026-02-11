'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import * as z from 'zod';
import { CreateProductSchema } from '@/schemas';
import { compareData, slugify } from '@/helper/utils';
import { logActivity } from './activity.action';

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
      colorImages: true,
      categories: true,
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
        stock: true,
        rating: true,
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
          connect: [...data.categories!.map((id: string) => ({ id })), { slug: 'all-products' }],
        },
        colorImages: {
          create: data.colorImages || [],
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

    await logActivity({
      action: 'CREATE',
      entity: 'PRODUCT',
      entityId: product.id,
      entityName: product.name,
      details: null,
    });

    return { data: product, success: true, message: 'Product created successfully' };
  } catch (err) {
    console.log('error creating product', err);
    return { success: false, message: 'Error creating product' };
  }
};

export const editProduct = async (id: string, productData: z.infer<typeof CreateProductSchema>) => {
  const validatedProduct = CreateProductSchema.safeParse(productData);

  const oldProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!oldProduct) throw new Error('Product not found');

  const changes = compareData(oldProduct, productData);

  console.log('server data', productData);
  console.log('img', productData.categories);
  if (!id) throw new Error('Product ID is required');

  if (!validatedProduct.success) throw new Error(validatedProduct.error.message);

  const { data } = validatedProduct;

  try {
    const defaultCategory = await prisma.category.upsert({
      where: { slug: 'all-products' },
      update: {},
      create: {
        name: 'All Products',
        slug: 'all-products',
        coverImage: '/all-products-cover-img.png',
      },
    });

    const variants = data.variants?.length ? { deleteMany: {}, create: data.variants } : undefined;

    const res = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        images: data.images,
        stock: data.stock,
        hasVariants: data.hasVariants,
        discountPercent: data.discountPercent,
        categories: {
          set: [...data.categories.map(id => ({ id })), { id: defaultCategory.id }],
        },

        colorImages:
          data.colorImages && data.colorImages.length > 0
            ? {
                deleteMany: {},
                create: data.colorImages?.map(cl => ({
                  color: cl.color,
                  images: cl.images,
                })),
              }
            : undefined,
        variants: variants,
      },
    });

    if (changes) {
      await logActivity({
        action: 'UPDATE',
        entity: 'PRODUCT',
        entityId: id,
        entityName: oldProduct.name,
        details: changes,
      });
    }

    return { success: true, data: res, message: 'Product updated successfully' };
  } catch (error) {
    console.error('error updating product', error);
    return { success: false, message: 'Error updating product' };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const product = await prisma.product.findUnique({ where: { id }, select: { name: true } });

    if (!product) throw new Error('Product not found');
    await prisma.product.delete({ where: { id } });
    revalidatePath('/admin/products');

    await logActivity({
      action: 'ARCHIVE',
      entity: 'PRODUCT',
      entityId: id,
      entityName: product.name,
      details: null,
    });

    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('error deleting product', error);
  }
};
