'use client';

import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { authInput } from './auth-styles';

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'>;

const PasswordInput = ({ className, disabled, ...props }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className='relative'>
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={cn(authInput, 'pr-11', className)}
      />
      <button
        type='button'
        onClick={() => setVisible(v => !v)}
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className='absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-lg text-subtle-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50'>
        {visible ? <EyeOffIcon className='size-[18px]' /> : <EyeIcon className='size-[18px]' />}
      </button>
    </div>
  );
};

export default PasswordInput;
