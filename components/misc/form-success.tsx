import { CheckCircleIcon } from 'lucide-react';
import React from 'react';

interface FormSuccessProps {
  message?: string;
}

const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null;
  return (
    <div
      role='status'
      className='alert alert-success'>
      <CheckCircleIcon aria-hidden='true' />
      <p>{message}</p>
    </div>
  );
};

export default FormSuccess;
