// 'use client';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '../ui/button';

import { providerLogin } from '@/actions/login.action';
import { authSecondaryButton } from './auth-styles';

const Social = () => {
  // const handleSignIn = async (provider: 'google' | 'github') => {
  //   signIn(provider, {
  //     callbackUrl: '/',
  //   });
  // };
  return (
    <div className='flex items-center w-full gap-x-2'>
      <Button
        onClick={() => providerLogin('google')}
        className={authSecondaryButton}
        variant='outline'
        size='lg'>
        <FcGoogle
          className='size-5'
          aria-hidden='true'
        />
        <span>Continue with Google</span>
      </Button>
    </div>
  );
};

export default Social;
