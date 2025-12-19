'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

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

export const deleteUser = async (userId: string) => {
  try {
    const session = await auth();
    const loggedInUser = session?.user;

    const isUserAdmin = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (loggedInUser?.role === 'USER') throw new Error('Unauthorized! users cannot delete admins!');

    if (isUserAdmin?.role === 'ADMIN') throw new Error('Admin users cannot be deleted!');

    await prisma.user.delete({
      where: { id: userId },
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
