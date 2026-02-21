import { footerNav } from '@/constants';
import Logo from './logo';
import Link from 'next/link';
import { LinkedinIcon, TwitterIcon } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      className='
        relative
        bg-gradient-to-b from-gray-950 via-black to-black
        text-white
        pt-32 pb-10
        border-t border-white/10
      '>
      {/* subtle glow behind CTA area */}
      <div className='pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]' />

      <div className='container relative'>
        {/* Top Row */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-10 border-b border-white/10 pb-8'>
          {/* Logo + Nav */}
          <div className='flex flex-col md:flex-row md:items-center gap-6 md:gap-10'>
            <Logo />

            <nav>
              <ul className='flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-400'>
                {footerNav.map(nav => (
                  <li key={nav.link}>
                    <Link
                      href={nav.link}
                      className='
                        transition-colors duration-200
                        hover:text-white
                      '>
                      {nav.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Socials */}
          <div className='flex items-center gap-3'>
            <a
              href='#'
              className='
                p-2 rounded-full
                text-gray-400
                hover:text-white
                hover:bg-white/10
                transition
              '>
              <LinkedinIcon className='w-5 h-5' />
            </a>

            <a
              href='#'
              className='
                p-2 rounded-full
                text-gray-400
                hover:text-white
                hover:bg-white/10
                transition
              '>
              <TwitterIcon className='w-5 h-5' />
            </a>
          </div>
        </div>

        {/* Bottom Row */}
        <div className='flex flex-col md:flex-row items-center justify-between gap-4 pt-6 text-sm text-gray-500'>
          <p>© {new Date().getFullYear()} Zenn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
