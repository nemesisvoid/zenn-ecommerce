import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) return NextResponse.redirect(new URL('/auth/error?reason=missing-token', req.url));

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expires < new Date()) return NextResponse.redirect(new URL('/auth/error?reason=invalid-or-expired-token', req.url));

    await prisma.user.update({
      where: { email: record.email },
      data: {
        isEmailVerified: true,
        emailVerified: new Date(),
      },
    });

    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.redirect(new URL('/auth/login?verified=true', req.url));
  } catch (error) {
    console.error('Error verifying email:', error);
  }
}
