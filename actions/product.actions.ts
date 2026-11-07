'use server';

import { requireAdmin } from '@/lib/auth-guards';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import * as z from 'zod';
import { CreateProductSchema } from '@/schemas';
import { formatCurrency, slugify } from '@/helper/utils';
import { isEqual } from 'lodash';
import { logActivity } from './activity.action';
import { Prisma } from '@prisma/client';

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

/** Products added within the last `days` days, newest first. */
export const getRecentProducts = async (days = 30) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const data = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: {
      isArchived: false,
      deletedAt: null,
      createdAt: { gte: since },
    },
  });
  return data;
};

/** Products with a discount, biggest discount first (archived products excluded). */
export const getSaleProducts = async () => {
  try {
    return await prisma.product.findMany({
      where: { isArchived: false, discountPercent: { gt: 0 } },
      orderBy: [{ discountPercent: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, slug: true, name: true, price: true, images: true, discountPercent: true },
    });
  } catch (error) {
    console.error('error fetching sale products', error);
    return [];
  }
};

/** Storefront product page: archived products are treated as not found. */
export const getProductBySlug = async (slug: string) => {
  const data = await prisma.product.findFirst({
    where: { slug, isArchived: false },
    include: {
      variants: true,
      colorImages: true,
      categories: true,
    },
  });

  if (!data) return null;

  return data;
};

/** Admin product list, including archived products (shown last). */
export const getAllProducts = async () => {
  await requireAdmin();
  try {
    const data = await prisma.product.findMany({
      orderBy: [{ isArchived: 'asc' }, { createdAt: 'desc' }],
      select: {
        isArchived: true,
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
    console.error('error fetching products', error);
  }
};

export const createProduct = async (productData: z.infer<typeof CreateProductSchema>) => {
  try {
    await requireAdmin();
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
    console.error('error creating product', err);
    return { success: false, message: 'Error creating product' };
  }
};

/** Admin edit page: loads any product, including archived ones. */
export const getProductBySlugForAdmin = async (slug: string) => {
  await requireAdmin();
  return prisma.product.findUnique({
    where: { slug },
    include: { variants: true, colorImages: true, categories: true },
  });
};

// ---- Activity-log snapshots: a readable, comparable view of everything an edit can change.

type VariantLike = { color?: string | null; size?: string | null; price?: number | null; stock?: number | null };
type ColorImagesLike = { color: string; images: unknown[] };

const variantLabel = (v: VariantLike) =>
  `${[v.color, v.size].filter(Boolean).join(' / ') || 'Default'} — ${formatCurrency(v.price ?? 0)} · stock ${v.stock ?? 0}`;
const colorImagesLabel = (c: ColorImagesLike) => `${c.color}: ${c.images.length} image${c.images.length === 1 ? '' : 's'}`;
const imageLabel = (url: string) => decodeURIComponent(url.split('/').pop() ?? url);
const sorted = (values: string[]) => [...values].sort((a, b) => a.localeCompare(b));

const productSnapshot = (p: {
  name: string;
  price: number;
  description: string;
  stock: number;
  discountPercent: number | null | undefined;
  hasVariants: boolean;
  images: string[];
  categories: string[];
  variants: VariantLike[];
  colorImages: ColorImagesLike[];
}) => ({
  name: p.name,
  price: p.price,
  description: p.description,
  stock: p.stock,
  discountPercent: p.discountPercent ?? 0,
  hasVariants: p.hasVariants,
  categories: sorted(p.categories),
  variants: sorted(p.variants.map(variantLabel)),
  colorImages: sorted(p.colorImages.map(colorImagesLabel)),
  images: p.images.map(imageLabel),
});

type Snapshot = ReturnType<typeof productSnapshot>;
type FieldChange = { old: Prisma.InputJsonValue | null; new: Prisma.InputJsonValue | null };

const diffSnapshots = (before: Snapshot, after: Snapshot) => {
  const changes: Record<string, FieldChange> = {};
  for (const key of Object.keys(after) as (keyof Snapshot)[]) {
    if (!isEqual(before[key], after[key])) {
      changes[key] = { old: before[key] ?? null, new: after[key] ?? null };
    }
  }
  return Object.keys(changes).length > 0 ? changes : null;
};

export const editProduct = async (id: string, productData: z.infer<typeof CreateProductSchema>) => {
  await requireAdmin();
  if (!id) return { success: false, message: 'Product ID is required' };

  const validatedProduct = CreateProductSchema.safeParse(productData);
  if (!validatedProduct.success) return { success: false, message: validatedProduct.error.issues[0]?.message ?? 'Invalid product' };
  const { data } = validatedProduct;

  try {
    const oldProduct = await prisma.product.findUnique({
      where: { id },
      include: { categories: { select: { name: true } }, variants: true, colorImages: true },
    });
    if (!oldProduct) return { success: false, message: 'Product not found' };

    const defaultCategory = await prisma.category.upsert({
      where: { slug: 'all-products' },
      update: {},
      create: {
        name: 'All Products',
        slug: 'all-products',
        coverImage: '/all-products-cover.jpg',
      },
    });

    // Variants and colour images are only replaced when new ones are sent.
    const replacesVariants = !!data.variants?.length;
    const replacesColorImages = !!data.colorImages?.length;
    const images = data.images.filter((img): img is string => typeof img === 'string');

    const res = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        images,
        stock: data.stock,
        hasVariants: data.hasVariants,
        discountPercent: data.discountPercent,
        categories: {
          set: [...(data.categories ?? []).map(categoryId => ({ id: categoryId })), { id: defaultCategory.id }],
        },
        colorImages: replacesColorImages
          ? {
              deleteMany: {},
              create: (data.colorImages ?? []).map(cl => ({
                color: cl.color,
                images: cl.images.filter((img): img is string => typeof img === 'string'),
              })),
            }
          : undefined,
        variants: replacesVariants ? { deleteMany: {}, create: data.variants } : undefined,
      },
      include: { categories: { select: { name: true } }, variants: true, colorImages: true },
    });

    // Compare what was stored before with what is stored now, so every field the edit changed is recorded.
    const changes = diffSnapshots(
      productSnapshot({ ...oldProduct, categories: oldProduct.categories.map(c => c.name) }),
      productSnapshot({ ...res, categories: res.categories.map(c => c.name) }),
    );
    if (changes) {
      await logActivity({ action: 'UPDATE', entity: 'PRODUCT', entityId: id, entityName: res.name, details: changes });
    }

    revalidatePath('/admin/products');
    revalidatePath(`/product/${res.slug}`);
    return { success: true, data: res, message: 'Product updated successfully' };
  } catch (error) {
    console.error('error updating product', error);
    return { success: false, message: 'Error updating product' };
  }
};

// Products are never deleted, so orders and records keep pointing at them.
// Archiving hides a product from the store; restoring brings it back.
const setProductArchived = async (id: string, isArchived: boolean) => {
  await requireAdmin();
  try {
    const existing = await prisma.product.findUnique({ where: { id }, select: { isArchived: true } });
    if (!existing) return { success: false, message: 'Product not found' };
    if (existing.isArchived === isArchived) {
      return { success: true, message: isArchived ? 'Product is already archived' : 'Product is already active' };
    }

    const product = await prisma.product.update({ where: { id }, data: { isArchived }, select: { name: true, slug: true } });

    await logActivity({
      action: isArchived ? 'ARCHIVE' : 'RESTORE',
      entity: 'PRODUCT',
      entityId: id,
      entityName: product.name,
      details: null,
    });

    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/list');
    revalidatePath('/new-arrivals');
    revalidatePath(`/product/${product.slug}`);
    return { success: true, message: isArchived ? 'Product archived. It is hidden from the store.' : 'Product restored to the store.' };
  } catch (error) {
    console.error('error changing product archive state', error);
    return { success: false, message: 'Could not update the product' };
  }
};

export const archiveProduct = async (id: string) => setProductArchived(id, true);
export const restoreProduct = async (id: string) => setProductArchived(id, false);
