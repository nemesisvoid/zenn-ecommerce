'use server';

import * as z from 'zod';

import { auth } from '@/auth';
import { getSessionUser, isAdminRole, requireAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { AdminUserSettingsSchema, UserSettingsSchema } from '@/schemas';
import { logActivity } from './activity.action';
import { compareData } from '@/helper/utils';
import bcrypt from 'bcryptjs';

export const getAllCustomers = async () => {
  try {
    await requireAdmin();
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
    console.error('error fetching users', err);
  }
};

export const editUser = async (id: string, userData: z.infer<typeof AdminUserSettingsSchema>) => {
  try {
    const user = await auth();
    if (!isAdminRole(user?.user.role)) throw new Error('only admins can update users');

    const validatedData = AdminUserSettingsSchema.safeParse(userData);
    if (!validatedData.success) throw new Error('error validating fields');

    const { data } = validatedData;

    const oldUserData = await prisma.user.findUnique({ where: { id } });

    if (!oldUserData) throw new Error('user not found');
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
        entityName: oldUserData.name ?? oldUserData.email,
        details: changes,
      });
    }

    return { success: true, message: 'User updated successfully' };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('error editing user', err);
      return { success: false, message: err.message };
    }
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const admin = await requireAdmin();
    if (admin.id === userId) throw new Error('You cannot delete your own account');

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, role: true } });
    if (!user) throw new Error('User not found');

    if (isAdminRole(user.role)) throw new Error('Admin users cannot be deleted!');

    await prisma.user.delete({
      where: { id: userId },
    });

    await logActivity({
      action: 'DELETE',
      entity: 'USER',
      entityId: userId,
      entityName: user.name ?? user.email,
      details: JSON.stringify({ name: user.name, email: user.email }),
    });

    return { success: true, message: 'User deleted successfully' };
  } catch (err) {
    console.error('error deleting user', err);
    const message = err instanceof Error ? err.message : String(err) || 'Unknown error';
    return { success: false, message };
  }
};

// Callers may read their own record; admins may read anyone's. The password hash is never returned.
export const getUserById = async (id: string) => {
  const sessionUser = await getSessionUser();
  if (!sessionUser || (sessionUser.id !== id && !isAdminRole(sessionUser.role))) return null;

  return prisma.user.findUnique({
    where: { id },
    omit: { password: true },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
};

// Users can only update their own profile (admins use editUser).
export const updateUser = async (id: string, userData: z.infer<typeof UserSettingsSchema>) => {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.id !== id) return { success: false, message: 'Unauthorized' };

  const user = await prisma.user.findUnique({ where: { id }, select: { password: true } });
  if (!user) return { success: false, message: 'User not found' };

  const validatedData = UserSettingsSchema.safeParse(userData);
  if (!validatedData.success) throw new Error('error validating fields');

  const { firstName, lastName, email, address, city, country, oldPassword, newPassword, avatar } = validatedData.data;

  let hashedPassword: string | null = null;

  if (oldPassword && newPassword) {
    if (!user.password) return { success: false, message: 'This account signs in with Google and has no password to change' };
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return { success: false, message: 'Current password is incorrect' };
    }

    hashedPassword = await bcrypt.hash(newPassword, 10);
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        avatar,
        email,
        ...(hashedPassword && { password: hashedPassword }),
        address,
        country,
        city,
        // phone: userData.phone,
      },
    });
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('error updating profile', error);
    return { success: false, message: 'Something went wrong updating your profile' };
  }
};
