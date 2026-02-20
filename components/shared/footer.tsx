import { footerNav } from '@/constants';
import Logo from './logo';
import Link from 'next/link';
import { LinkedinIcon, TwitterIcon, XIcon } from 'lucide-react';

const Footer = () => {
  return (
    <footer className='bg-gray-300'>
      <div className='container my-26'>
        <div className='flex flex-col justify-between md:flex-row max-sm:gap-10 border-b  border-gray-500 py-4'>
          <div className='flex flex-col items-center gap-4 md:gap-8 md:flex-row'>
            <Logo />
            <nav>
              <ul className='flex items-center flex-wrap gap-8'>
                {footerNav.map(nav => (
                  <li key={nav.link}>
                    <Link href={nav.link}>{nav.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className='flex items-center gap-4'>
            <LinkedinIcon className='w-6 h-6' />
            <TwitterIcon />
          </div>
        </div>

        <div className='flex items-center justify-between py-4'>
          <p className='text-sm'>&copy; {new Date().getFullYear()} Zenn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
