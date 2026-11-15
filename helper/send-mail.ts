import nodemailer from 'nodemailer';

interface SendMailProps {
  email: string;
  sendTo: string;
  subject: string;
  text?: string;
  html?: string;
}
/** Escapes text before putting it into email HTML, so names can't inject links or markup. */
export const escapeHtml = (value: string | null | undefined) =>
  (value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const host = process.env.EMAIL_HOST;
const port = process.env.EMAIL_PORT;
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

export const transporter = nodemailer.createTransport({
  host: host || 'smtp.gmail.com',
  port: Number(port || 465),
  secure: Number(port || 465) === 465,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  auth: {
    user,
    pass,
  },
});

export const assertPasswordResetMailConfigured = () => {
  const requiredSettings = ['EMAIL_USER', 'EMAIL_PASSWORD', 'NEXT_PUBLIC_APP_URL'] as const;
  const missingSettings = requiredSettings.filter(setting => !process.env[setting]?.trim());
  if (missingSettings.length > 0) {
    throw new Error(`Password reset email is not configured. Set ${missingSettings.join(', ')} in .env and restart the development server.`);
  }
  let url: URL;
  try {
    url = new URL(process.env.NEXT_PUBLIC_APP_URL!);
  } catch {
    throw new Error('NEXT_PUBLIC_APP_URL must be a valid application URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || (process.env.NODE_ENV === 'production' && url.protocol !== 'https:')) {
    throw new Error('NEXT_PUBLIC_APP_URL must use HTTP or HTTPS, and must use HTTPS in production.');
  }
};

export const sendPasswordResetMail = async (email: string, token: string) => {
  assertPasswordResetMailConfigured();
  const url = new URL('/auth/reset-password', process.env.NEXT_PUBLIC_APP_URL);
  url.searchParams.set('token', token);
  const resetUrl = url.toString();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your Zenn password',
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 15 minutes and can only be used once. If you did not request this, you can ignore this email.`,
    html: `<h2>Reset your password</h2><p>We received a request to reset your Zenn password.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 15 minutes and can only be used once.</p><p>If you did not request this, you can ignore this email. Your password has not changed.</p>`,
  });
};

export const sendPasswordChangedMail = async (email: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Your Zenn password has changed',
    text: 'Your Zenn password was successfully reset. If you did not make this change, reset your password immediately and contact store support.',
  });
};

export const sendMail = async ({ email, sendTo, subject, text, html }: SendMailProps) => {
  try {
    const isVerified = await transporter.verify();

    if (!isVerified) return { success: false, message: 'Email not verified' };

    const info = await transporter.sendMail({
      from: email,
      to: sendTo,
      subject,
      text,
      html,
    });

    return { success: true, info, message: 'Mail successfully sent' };
  } catch (err) {
    console.error('something went wrong', err);
    return;
  }
};
export const sendVerificationMail = async (email: string, token: string) => {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    to: email,
    subject: 'Verify your email address',
    html: `<p>Please click the link below to verify your email address:</p>
           <a href="${verifyUrl}">${verifyUrl}</a>
          <p>This link will expire in 15 minutes.</p>`,
  });
};

export const sendAdminNotificationMail = async (email: string, user: { name?: string | null; email?: string | null }) => {
  await transporter.sendMail({
    to: email,
    subject: 'New User Registered',
    html: `<div>A new user has registered to the website <br/> <p> User details: ${escapeHtml(user.name)}, ${escapeHtml(user.email)}
    </p> 
    </div>`,
  });
};

export const sendUserWelcomeMail = async (email: string, name: string) => {
  await transporter.sendMail({
    to: email,
    subject: 'Welcome to Zenn E-commerce Website',
    html: `<div>Hi ${escapeHtml(name)},<br/>
    <p>Thank you for registering with us. We are excited to have you on board!</p> <br/>
    <p>Explore our wide range of products and start shopping today! </p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/list">Shop Now</a>
    <p>Best regards,<br/>
    The Zenn E-commerce Team</p>
    </div>`,
  });
};
