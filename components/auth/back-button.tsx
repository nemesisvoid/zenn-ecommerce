import Link from 'next/link';
import { Button } from '../ui/button';

interface BackButtonProps {
  link: string;
  label: string;
}

const BackButton = ({ link, label }: BackButtonProps) => {
  return (
    <Button
      className='font-normal w-full'
      size='sm'
      variant='link'
      asChild>
      <Link href={link}>{label}</Link>
    </Button>
  );
};

export default BackButton;
