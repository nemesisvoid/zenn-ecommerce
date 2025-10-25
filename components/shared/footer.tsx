import { footerNav } from '@/constants';
import Logo from './logo';
import Link from 'next/link';
import { LinkedinIcon, TwitterIcon, XIcon } from 'lucide-react';

const Footer = () => {
  return (
    <footer className='bg-gray-300'>
      <div className='container my-26'>
        <div className='flex justify-between border-b  border-gray-500 py-4'>
          <div className='flex items-center gap-8'>
            <Logo />
            <nav>
              <ul className='flex items-center gap-8'>
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
      </div>
    </footer>
  );
};

export default Footer;
