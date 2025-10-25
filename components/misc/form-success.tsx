import { CheckCircleIcon } from 'lucide-react';
import React from 'react';

interface FormSuccessProps {
  message?: string;
}

const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null;
  return (
    <div className='bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500   '>
      <CheckCircleIcon className='w-4 h-4' />
      <p>{message}</p>
    </div>
  );
};

export default FormSuccess;
