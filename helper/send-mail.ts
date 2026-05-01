import nodemailer from 'nodemailer';

interface SendMailProps {
  email: string;
  sendTo: string;
  subject: string;
  text?: string;
  html?: string;
}
const host = process.env.EMAIL_HOST;
const port = process.env.EMAIL_PORT;
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  host,
  port: Number(port),
  secure: true,
  auth: {
    user,
    pass,
  },
});

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

    console.log('message sent', info.messageId);
    console.log('sent to:', sendTo);
    return { success: true, info, message: 'Mail successfully sent' };
  } catch (err) {
    console.log('something went wrong', err);
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

export const sendAdminNotificationMail = async (email: string, user) => {
  await transporter.sendMail({
    to: email,
    subject: 'New User Registered',
    html: `<div>A new user has registered to the website <br/> <p> User details: ${user.name}, ${user.email}
    </p> 
    </div>`,
  });
};

export const sendUserWelcomeMail = async (email: string, name: string) => {
  await transporter.sendMail({
    to: email,
    subject: 'Welcome to Zenn E-commerce Website',
    html: `<div>Hi ${name},<br/>
    <p>Thank you for registering with us. We are excited to have you on board!</p> <br/>
    <p>Explore our wide range of products and start shopping today! </p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/list">Shop Now</a>
    <p>Best regards,<br/>
    The Zenn E-commerce Team</p>
    </div>`,
  });
};
