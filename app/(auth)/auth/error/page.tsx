'use client';
import { retryVerificationToken } from '@/actions/verification-token.action';
import BackButton from '@/components/auth/back-button';
import CardWrapper from '@/components/auth/card-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authInput, authPrimaryButton } from '@/components/auth/auth-styles';
import Spinner from '@/components/shared/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const AuthErrorPage = () => {
  const [email, setEmail] = useState('');
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || email === '') return;
      setIsPending(true);
      const res = await retryVerificationToken(email);
      if (res.success) {
        toast.success(res.message);
        setIsPending(false);
      } else {
        toast.error(res.message);
        setIsPending(false);
      }
    } catch (err) {
      setIsPending(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <CardWrapper
      headerLabel={reason?.replaceAll('-', ' ') || 'Verify your email'}
      headerDescription='Enter the email you signed up with and we will send you a new verification link.'
      backButtonLabel='Back to sign in'
      backButtonLink='/auth/login'>
      <form className='space-y-5'>
        <div className='grid gap-2'>
          <Label
            htmlFor='retry-email'
            className='auth-label'>
            Email
          </Label>
          <Input
            id='retry-email'
            className={authInput}
            value={email}
            type='email'
            autoComplete='email'
            onChange={e => setEmail(e.target.value)}
            placeholder='you@example.com'
            disabled={isPending}
            required
          />
        </div>

        <Button
          className={authPrimaryButton}
          onClick={handleSubmit}
          disabled={isPending}>
          {isPending && (
            <Spinner
              aria-hidden='true'
            />
          )}
          {isPending ? 'Sending link…' : 'Resend verification link'}
        </Button>
      </form>
    </CardWrapper>
  );
};

export default AuthErrorPage;
