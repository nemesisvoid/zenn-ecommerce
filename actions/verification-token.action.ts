'use server';

import { prisma } from '@/lib/prisma';
import { sendVerificationMail } from '@/helper/send-mail';

export const generateVerificationToken = async (email: string) => {
  const token = crypto.randomUUID();
  await prisma.verificationToken.deleteMany({ where: { email } });

  await prisma.verificationToken.create({
    data: {
      email,
      token,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  return token;
};

// export const verifyToken = async () => {
//   const token = (await headers()).get('token');
//   console.log('token', token);
//   if (!token) return NextResponse.redirect('/');

//   const record = await prisma.verificationToken.findUnique({ where: { token } });

//   if (!record || record.expires < new Date()) return NextResponse.redirect('/auth/error');

//   await prisma.user.update({
//     where: {
//       email: record.email,
//     },
//     data: {
//       isEmailVerified: true,
//       emailVerified: new Date(),
//     },
//   });

//   await prisma.verificationToken.delete({ where: { token } });

//   return NextResponse.redirect('/auth/login?verified=true');
// };

export const retryVerificationToken = async (email: string) => {
  try {
    if (!email) throw new Error('email is required');
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new Error('no user found with this email');
    if (user?.isEmailVerified) throw new Error('email is already verified');

    const token = await generateVerificationToken(email);
    await sendVerificationMail(email, token);
    return { success: true, message: 'Verification token sent successfully' };
  } catch (err) {
    console.log(err, 'error checking mail');
    return { success: false, message: err.message };
  }
};
