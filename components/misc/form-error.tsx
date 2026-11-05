import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

interface FormErrorProps {
  message?: string;
}

const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;
  return (
    <div
      role='alert'
      className='alert alert-error'>
      <TriangleAlertIcon aria-hidden='true' />
      <p>{message}</p>
    </div>
  );
};

export default FormError;
