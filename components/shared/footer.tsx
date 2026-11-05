import { footerNav } from '@/constants';
import Logo from './logo';
import Link from 'next/link';
import { LinkedinIcon, TwitterIcon } from 'lucide-react';

const accountLinks = [
  { name: 'Sign in', link: '/auth/login' },
  { name: 'Create account', link: '/auth/register' },
  { name: 'Your bag', link: '/cart' },
];

const linkClass = 'text-[0.9375rem] text-muted-foreground transition-colors hover:text-foreground';

const Footer = () => {
  return (
    <footer className='border-t border-border bg-card'>
      <div className='container grid gap-12 py-14 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))] md:py-16'>
        <div className='max-w-sm'>
          <Logo className='text-[2.5rem]' />
          <p className='lede mt-4'>Considered pieces for everyday living, delivered to your door. Pay online or when your order arrives.</p>
          <div className='mt-6 flex items-center gap-1'>
            <a
              href='#'
              aria-label='Zenn on LinkedIn'
              className='icon-button -ml-2 text-muted-foreground hover:text-foreground'>
              <LinkedinIcon className='size-[18px]' />
            </a>
            <a
              href='#'
              aria-label='Zenn on X (Twitter)'
              className='icon-button text-muted-foreground hover:text-foreground'>
              <TwitterIcon className='size-[18px]' />
            </a>
          </div>
        </div>

        <nav aria-labelledby='footer-shop'>
          <h3
            id='footer-shop'
            className='text-sm font-semibold text-foreground'>
            Shop
          </h3>
          <ul className='mt-4 space-y-3'>
            {footerNav.map(nav => (
              <li key={nav.link}>
                <Link
                  href={nav.link}
                  className={linkClass}>
                  {nav.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby='footer-account'>
          <h3
            id='footer-account'
            className='text-sm font-semibold text-foreground'>
            Account
          </h3>
          <ul className='mt-4 space-y-3'>
            {accountLinks.map(nav => (
              <li key={nav.link}>
                <Link
                  href={nav.link}
                  className={linkClass}>
                  {nav.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className='border-t border-border'>
        <div className='container flex flex-col gap-2 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between'>
          <p>© {new Date().getFullYear()} Zenn. All rights reserved.</p>
          <p>Secure payments by Paystack</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
