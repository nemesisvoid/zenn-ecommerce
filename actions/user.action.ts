'use server';

import * as z from 'zod';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AdminUserSettingsSchema, UserSettingsSchema } from '@/schemas';
import { logActivity } from './activity.action';
import { compareData } from '@/helper/utils';
import bcrypt from 'bcryptjs';

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

export const updateUser = async (id: string, userData: z.infer<typeof UserSettingsSchema>) => {
  const user = await getUserById(id);
  if (!user) throw new Error('user not found');

  const validatedData = UserSettingsSchema.safeParse(userData);
  if (!validatedData.success) throw new Error('error validating fields');

  const { firstName, lastName, email, address, city, country, oldPassword, newPassword, avatar } = validatedData.data;

  let hashedPassword: string | null = null;

  if (oldPassword && newPassword) {
    const passwordMatch = await bcrypt.compare(oldPassword, user.password!);
    if (!passwordMatch) {
      return { success: false, message: 'Current password is incorrect' };
    }

    hashedPassword = await bcrypt.hash(newPassword, 10);
  }
  console.log('server action', newPassword);

  try {
    const updatedUser = await prisma.user.update({
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
    console.log('user updated', updatedUser);
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.log('error', error);
    if (error instanceof Error) console.log(error.message);
  }
};
