'use server';
import * as z from 'zod';
import { prisma } from '@/lib/prisma';
import { SettingsSchema } from '@/schemas';

export const createSettings = async (data: z.infer<typeof SettingsSchema>) => {
  const settings = await prisma.settings.create({ data });
  return { settings, message: 'Settings created successfully' };
};
export const getSettings = async () => {
  try {
    const settings = await prisma.settings.findFirst();
    return settings;
  } catch (error) {
    console.error('error getting settings:', error);
  }
};

export const updateSettings = async (id: string, data: z.infer<typeof SettingsSchema>) => {
  try {
    const settings = await prisma.settings.update({
      where: { id },
      data,
    });
    return { settings, message: 'Settings updated successfully' };
  } catch (error) {
    console.error('error updating settings:', error);
    return { error: 'Error updating settings' };
  }
};
