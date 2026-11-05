import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import { ForgotPasswordSchema, ResetPasswordSchema, ResetTokenSchema } from '../schemas/password-reset';

export const RESET_REQUEST_MESSAGE = 'If an eligible account exists for that email, a password reset link will be sent. Check your inbox and spam folder.';
export const INVALID_RESET_MESSAGE = 'This reset link is invalid or has expired. Please request a new one.';
const TOKEN_LIFETIME = 15 * 60 * 1000;
const REQUEST_COOLDOWN = 60 * 1000;
const REQUEST_WINDOW = 60 * 60 * 1000;
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export function createPasswordResetService(
  db: PrismaClient,
  sendResetMail: (email: string, token: string) => Promise<unknown>,
  sendChangedMail: (email: string) => Promise<unknown>,
) {
  return {
    async request(values: unknown) {
      const parsed = ForgotPasswordSchema.safeParse(values);
      if (!parsed.success) return;
      // Existing registration preserves email case. Avoid selecting an arbitrary account
      // if historical data contains multiple case variants of the same address.
      const users = await db.user.findMany({
        where: { email: { equals: parsed.data.email, mode: 'insensitive' } },
        take: 2,
      });
      if (users.length !== 1 || !users[0].password || users[0].status !== 'ACTIVE') return;
      const user = users[0];
      const token = randomBytes(32).toString('hex');
      const digest = hashToken(token);
      const issued = await db.$transaction(async tx => {
        // Serialize requests and resets for this account across all application instances.
        await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;
        const current = await tx.user.findUnique({ where: { id: user.id } });
        if (!current?.password || current.status !== 'ACTIVE' || current.email !== user.email) return false;
        const now = new Date();
        const recent = await tx.passwordResetToken.findMany({
          where: { email: user.email, createdAt: { gt: new Date(now.getTime() - REQUEST_WINDOW) } },
          orderBy: { createdAt: 'desc' },
        });
        if (recent.length >= 3 || (recent[0] && now.getTime() - recent[0].createdAt.getTime() < REQUEST_COOLDOWN)) return false;
        await tx.passwordResetToken.deleteMany({
          where: { email: user.email, createdAt: { lte: new Date(now.getTime() - REQUEST_WINDOW) } },
        });
        await tx.passwordResetToken.create({
          data: { email: user.email, token: digest, expires: new Date(now.getTime() + TOKEN_LIFETIME) },
        });
        return true;
      });
      if (!issued) return;
      try {
        await sendResetMail(user.email, token);
      } catch {
        // A failed delivery must not leave an unusable link blocking a retry.
        await db.passwordResetToken.deleteMany({ where: { token: digest } });
        throw new Error('Password reset email delivery failed');
      }
    },

    async reset(token: unknown, values: unknown) {
      const parsedToken = ResetTokenSchema.safeParse(token);
      if (!parsedToken.success) return { error: INVALID_RESET_MESSAGE };
      const parsed = ResetPasswordSchema.safeParse(values);
      if (!parsed.success) return { error: parsed.error.issues[0].message };
      const digest = hashToken(parsedToken.data);
      const record = await db.passwordResetToken.findUnique({ where: { token: digest } });
      if (!record || record.expires <= new Date()) return { error: INVALID_RESET_MESSAGE };
      const password = await bcrypt.hash(parsed.data.password, 12);
      const email = await db.$transaction(async tx => {
        await tx.$queryRaw`SELECT "id" FROM "User" WHERE "email" = ${record.email} FOR UPDATE`;
        const user = await tx.user.findUnique({ where: { email: record.email } });
        if (!user?.password || user.status !== 'ACTIVE') return null;
        // Recheck expiry and consume atomically: two submissions cannot both succeed.
        const consumed = await tx.passwordResetToken.deleteMany({
          where: { token: digest, expires: { gt: new Date() } },
        });
        if (consumed.count !== 1) return null;
        await tx.user.update({
          where: { id: user.id },
          data: { password, isEmailVerified: true, emailVerified: user.emailVerified ?? new Date() },
        });
        await tx.passwordResetToken.deleteMany({ where: { email: user.email } });
        await tx.verificationToken.deleteMany({ where: { email: user.email } });
        await tx.session.deleteMany({ where: { userId: user.id } });
        return user.email;
      });
      if (!email) return { error: INVALID_RESET_MESSAGE };
      try {
        await sendChangedMail(email);
      } catch {
        // The committed password change remains successful if the notification fails.
        console.error('Password changed notification could not be delivered');
      }
      return { success: 'Your password has been reset. Sign in with your new password.' };
    },
  };
}
