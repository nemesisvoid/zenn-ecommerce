'use server';

import * as z from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegisterSchema } from '@/schemas';

import { getUserByEmail } from '@/data/user';
import { generateVerificationToken } from './verification-token.action';
import { sendVerificationMail, sendAdminNotificationMail } from '@/helper/send-mail';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) return { error: 'invalid credentials' };

  const { firstName, lastName, email, password } = validatedFields.data;

  const hashedPassword = await bcrypt.hash(password, 10);
  const data = { firstName, lastName, email, password: hashedPassword };

  const existingUser = await getUserByEmail(email);

  if (existingUser) return { error: 'email already exists' };

  const createdUser = await prisma.user.create({
    data: { ...data, name: `${firstName} ${lastName}` },
  });

  const token = await generateVerificationToken(email);
  await sendVerificationMail(email, token);

  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { email: true } });
  await Promise.all([...admins.map(admin => sendAdminNotificationMail(admin.email, createdUser))]);

  return { success: true, message: 'Account created, please verify your email address by clicking the link sent to your mail' };
};
