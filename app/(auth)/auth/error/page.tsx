'use client';
import { retryVerificationToken } from '@/actions/verification-token.action';
import BackButton from '@/components/auth/back-button';
import CardWrapper from '@/components/auth/card-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoaderIcon } from 'lucide-react';
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
      backButtonLabel='Back to Login'
      backButtonLink='/auth/login'>
      <form>
        <Input
          className='mb-8'
          value={email}
          type='email'
          onChange={e => setEmail(e.target.value)}
          placeholder='Enter your email to retry'
          disabled={isPending}
          required
        />

        <Button
          onClick={handleSubmit}
          disabled={isPending}>
          Retry Token
          {isPending && <LoaderIcon className='animate-spin' />}
        </Button>
      </form>
    </CardWrapper>
  );
};

export default AuthErrorPage;
