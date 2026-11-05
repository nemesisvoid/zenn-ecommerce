import type { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/forgot-password-form';

export const metadata: Metadata = { title: 'Forgot password | Zenn', robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <div className='flex w-full justify-center'><ForgotPasswordForm /></div>;
}
