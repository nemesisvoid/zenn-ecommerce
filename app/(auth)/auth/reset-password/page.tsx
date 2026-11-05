import type { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset password | Zenn',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function ResetPasswordPage({ searchParams }: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return <div className='flex w-full justify-center'><ResetPasswordForm token={typeof token === 'string' ? token : ''} /></div>;
}
