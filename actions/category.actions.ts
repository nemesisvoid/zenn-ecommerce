'use server';

import * as z from 'zod';

import { prisma } from '@/lib/prisma';

import { CreateCategorySchema } from '@/schemas';
import { compareData, slugify } from '@/helper/utils';
import { logActivity } from './activity.action';
export const getAllCategories = async () => {
  const data = await prisma.category.findMany();
  console.log(data);
  return data;
};

export const getProductsByCategory = async (category: string) => {
  const data = await prisma.category.findUnique({
    where: { slug: category },
    include: { products: { select: { id: true, name: true, images: true } } },
  });
  return data;
};

export const getSelectableCategories = async () => {
  const data = await prisma.category.findMany({
    select: {
      name: true,
      slug: true,
      id: true,
    },
  });
  return data;
};

export const getProductsForCategory = async () => {
  return await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      images: true,
    },
  });
};

export const createCategory = async (categoryData: z.infer<typeof CreateCategorySchema>) => {
  const validatedData = CreateCategorySchema.safeParse(categoryData);
  if (!validatedData.success) return { success: false, message: validatedData.error.message };

  const { data } = validatedData;
  const productIds = validatedData.data?.products?.map(p => p.id);

  try {
    const cat = await prisma.category.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        coverImage: data.coverImage,
        description: data.description,
        products: {
          connect: productIds && productIds?.map(id => ({ id })),
        },
      },
    });

    await logActivity({
      action: 'CREATE',
      entity: 'CATEGORY',
      entityId: cat.id,
      entityName: cat.name,
      details: null,
    });

    return { success: true, message: 'Category created successfully', category: cat };
  } catch (error) {
    console.log('error creating category', error);
  }
};

export const editCategory = async (id: string, categoryData: z.infer<typeof CreateCategorySchema>) => {
  const validatedData = CreateCategorySchema.safeParse(categoryData);
  if (!validatedData.success) return { success: false, message: validatedData.error.message };
  const oldCategoryData = await prisma.category.findUnique({ where: { id } });

  const { data } = validatedData;
  const productIds = validatedData.data?.products?.map(p => p.id);

  const changes = compareData(oldCategoryData, data);

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: slugify(data.name),
        coverImage: data.coverImage,
        description: data.description,
        products: {
          set: productIds?.map(id => ({ id })),
        },
      },
    });

    if (changes) {
      await logActivity({
        action: 'UPDATE',
        entity: 'CATEGORY',
        entityId: id,
        entityName: data.name,
        details: changes,
      });
    }

    return { success: true, message: 'Category updated successfully' };
  } catch (error) {
    console.log('error creating category', error);
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    const res = await prisma.category.findUniqueOrThrow({
      where: { slug },
      include: { products: { select: { id: true, name: true, images: true } } },
    });
    return res;
  } catch (err) {
    console.log('error fetching category', err);
  }
};
