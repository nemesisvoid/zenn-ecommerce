// 'use client';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '../ui/button';

import { providerLogin } from '@/actions/login.action';

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
        className='w-full py-6 cursor-pointer'
        variant='outline'
        size='lg'>
        <FcGoogle className='w-5 h-5' />
        <span>Continue with Google</span>
      </Button>
    </div>
  );
};

export default Social;
