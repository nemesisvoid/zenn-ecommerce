import Link from 'next/link';

const Logo = () => {
  return (
    <Link
      className='text-4xl font-bold'
      href='/'>
      Zenn
    </Link>
  );
};

export default Logo;
