'use server';

import * as z from 'zod';
import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { BannerSchema } from '@/schemas';
import { compareData } from '@/helper/utils';
import { logActivity } from './activity.action';

export type BannerInput = z.input<typeof BannerSchema>;
type ActionResult = { success: true; message: string; id?: string } | { success: false; message: string };

const revalidateBanners = () => {
  revalidatePath('/');
  revalidatePath('/admin/banners');
};

const toData = (data: z.output<typeof BannerSchema>) => ({
  title: data.title,
  subtitle: data.subtitle || null,
  imageUrl: data.imageUrl,
  href: data.href,
  ctaLabel: data.ctaLabel,
  isActive: data.isActive,
  sortOrder: data.sortOrder,
  startsAt: data.startsAt ?? null,
  endsAt: data.endsAt ?? null,
});

/** Public: banners to show on the homepage right now (active and within their schedule). */
export const getActiveBanners = async () => {
  try {
    const now = new Date();
    return await prisma.banner.findMany({
      where: {
        isActive: true,
        AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, subtitle: true, imageUrl: true, href: true, ctaLabel: true },
    });
  } catch (error) {
    console.error('error fetching active banners', error);
    return [];
  }
};

export const getAllBanners = async () => {
  await requireAdmin();
  return prisma.banner.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
};

export const getBannerById = async (id: string) => {
  await requireAdmin();
  return prisma.banner.findUnique({ where: { id } });
};

export const createBanner = async (input: BannerInput): Promise<ActionResult> => {
  try {
    await requireAdmin();
    const parsed = BannerSchema.safeParse(input);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid banner' };

    const banner = await prisma.banner.create({ data: toData(parsed.data) });
    await logActivity({ action: 'CREATE', entity: 'BANNER', entityId: banner.id, entityName: banner.title, details: null });

    revalidateBanners();
    return { success: true, message: 'Banner created', id: banner.id };
  } catch (error) {
    console.error('error creating banner', error);
    return { success: false, message: 'Could not create the banner' };
  }
};

export const updateBanner = async (id: string, input: BannerInput): Promise<ActionResult> => {
  try {
    await requireAdmin();
    const parsed = BannerSchema.safeParse(input);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid banner' };

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) return { success: false, message: 'Banner not found' };

    const data = toData(parsed.data);
    await prisma.banner.update({ where: { id }, data });

    const changes = compareData(existing, data);
    if (changes) await logActivity({ action: 'UPDATE', entity: 'BANNER', entityId: id, entityName: data.title, details: changes });

    revalidateBanners();
    return { success: true, message: 'Banner updated', id };
  } catch (error) {
    console.error('error updating banner', error);
    return { success: false, message: 'Could not update the banner' };
  }
};

/** Quick show/hide from the banner list. */
export const setBannerActive = async (id: string, isActive: boolean): Promise<ActionResult> => {
  try {
    await requireAdmin();
    const banner = await prisma.banner.update({ where: { id }, data: { isActive } });
    await logActivity({
      action: 'UPDATE',
      entity: 'BANNER',
      entityId: id,
      entityName: banner.title,
      details: { isActive: { old: !isActive, new: isActive } },
    });

    revalidateBanners();
    return { success: true, message: isActive ? 'Banner is now live' : 'Banner hidden' };
  } catch (error) {
    console.error('error toggling banner', error);
    return { success: false, message: 'Could not update the banner' };
  }
};

export const deleteBanner = async (id: string): Promise<ActionResult> => {
  try {
    await requireAdmin();
    const banner = await prisma.banner.delete({ where: { id } });
    await logActivity({ action: 'DELETE', entity: 'BANNER', entityId: id, entityName: banner.title, details: null });

    revalidateBanners();
    return { success: true, message: 'Banner deleted' };
  } catch (error) {
    console.error('error deleting banner', error);
    return { success: false, message: 'Could not delete the banner' };
  }
};
