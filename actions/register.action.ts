'use server';

import * as z from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegisterSchema } from '@/schemas';

import { getUserByEmail } from '@/data/user';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) return { error: 'invalid credentials' };

  const { firstName, lastName, email, password } = validatedFields.data;

  const hashedPassword = await bcrypt.hash(password, 10);
  const data = { firstName, lastName, email, password: hashedPassword };

  const existingUser = await getUserByEmail(email);

  if (existingUser) return { error: 'email already exists' };

  const user = await prisma.user.create({
    data: { ...data, name: `${firstName} ${lastName}` },
  });

  console.log(user);

  //todo verification token
  console.log('validated', validatedFields.success);
  return { success: 'user created' };
};
