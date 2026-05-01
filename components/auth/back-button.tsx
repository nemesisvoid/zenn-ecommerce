import Link from 'next/link';
import { Button } from '../ui/button';

interface BackButtonProps {
  link: string;
  label: string;
  icon?: React.ReactNode;
}

const BackButton = ({ link, label, icon }: BackButtonProps) => {
  return (
    <Button
      className='text-white/70 font-normal w-full'
      size='sm'
      variant='link'
      asChild>
      <Link
        href={link}
        className='flex items-center gap-2'>
        {label}
        {icon}
      </Link>
    </Button>
  );
};

export default BackButton;
