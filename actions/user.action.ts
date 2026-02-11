'use server';

import * as z from 'zod';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AdminUserSchema, AdminUserSettingsSchema } from '@/schemas';
import { logActivity } from './activity.action';
import { compareData } from '@/helper/utils';

export const getAllCustomers = async () => {
  try {
    const res = await prisma.user.findMany({
      select: {
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        email: true,
        id: true,
        phone: true,
        address: true,
        paymentMethods: true,
        role: true,
        emailVerified: true,
        isEmailVerified: true,
        orders: true,
      },
    });

    return res;
  } catch (err) {
    console.log('error fetching users', err);
  }
};

export const editUser = async (id: string, userData: z.infer<typeof AdminUserSettingsSchema>) => {
  try {
    const user = await auth();
    const loggedInUserRole = user?.user.role;
    if (loggedInUserRole !== 'ADMIN') throw new Error('only admins can update users');

    const validatedData = AdminUserSettingsSchema.safeParse(userData);
    if (!validatedData.success) throw new Error('error validating fields');

    const { data } = validatedData;

    const oldUserData = await prisma.user.findUnique({ where: { id } });

    if (!oldUserData) throw new Error('user not found');
    console.log('old user data', oldUserData.name);
    const changes = compareData(oldUserData, { ...data, status: data.userStatus });

    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        address: data.address,
        role: data.role,
        phone: data.phone,
        adminNotes: data.adminNotes,
        isEmailVerified: data.isEmailVerified,
        status: data.userStatus,
        emailVerified: data.isEmailVerified ? new Date() : null,
      },
    });

    if (changes) {
      await logActivity({
        action: 'UPDATE',
        entity: 'USER',
        entityId: id,
        entityName: oldUserData.name,
        details: changes,
      });
    }

    return { success: true, message: 'User updated successfully' };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log('error editing user', err);
      return { success: false, message: err.message };
    }
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const session = await auth();
    const loggedInUser = session?.user;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    if (!user) throw new Error('User not found');

    const isLoggedInUserAdmin = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (loggedInUser?.role === 'USER') throw new Error('Unauthorized! users cannot delete admins!');

    if (isLoggedInUserAdmin?.role === 'ADMIN') throw new Error('Admin users cannot be deleted!');

    await prisma.user.delete({
      where: { id: userId },
    });

    await logActivity({
      action: 'DELETE',
      entity: 'USER',
      entityId: userId,
      entityName: user.name,
      details: JSON.stringify(user),
    });

    return { success: true, message: 'User deleted successfully' };
  } catch (err) {
    console.error('error deleting user', err);
    const message = err instanceof Error ? err.message : String(err) || 'Unknown error';
    return { success: false, message };
  }
};

export const getUserById = async (id: string) =>
  prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
