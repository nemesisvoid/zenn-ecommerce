import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendUserWelcomeMail } from '@/helper/send-mail';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) return NextResponse.redirect(new URL('/auth/error?reason=missing-token', req.url));

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expires < new Date()) return NextResponse.redirect(new URL('/auth/error?reason=invalid-or-expired-token', req.url));

    const updatedUser = await prisma.user.update({
      where: { email: record.email },
      data: {
        isEmailVerified: true,
        emailVerified: new Date(),
      },
    });

    await prisma.verificationToken.delete({
      where: { token },
    });

    try {
      await sendUserWelcomeMail(updatedUser.email, updatedUser.name ?? `${updatedUser.firstName ?? ''} ${updatedUser.lastName ?? ''}`.trim());
    } catch (err) {
      console.error('Failed to send welcome mail:', err);
    }

    return NextResponse.redirect(new URL('/auth/login?verified=true', req.url));
  } catch (error) {
    console.error('Error verifying email:', error);
  }
}
