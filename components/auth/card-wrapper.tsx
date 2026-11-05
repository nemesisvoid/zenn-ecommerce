'use client';

import Link from 'next/link';
import { ArrowLeftIcon, HeartIcon, PackageIcon, WalletIcon } from 'lucide-react';
import BackButton from './back-button';
import Header from './header';
import Social from './social';

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  headerDescription?: string;
  backButtonLabel: string;
  backButtonLink: string;
  /** When set, the footer reads "{backButtonLabel} {backButtonCta}" with only the CTA linked. */
  backButtonCta?: string;
  showSocial?: boolean;
}

const perks = [
  { icon: PackageIcon, title: 'Track every order', body: 'Follow each purchase from checkout to your door.' },
  { icon: HeartIcon, title: 'Keep a wishlist', body: 'Save the pieces you love and come back to them anytime.' },
  { icon: WalletIcon, title: 'Pay on delivery', body: 'Choose to pay when your order arrives.' },
];

const CardWrapper = ({
  children,
  headerLabel,
  headerDescription,
  backButtonLink,
  backButtonLabel,
  backButtonCta,
  showSocial,
}: CardWrapperProps) => {
  return (
    <div className='auth-modal'>
      <aside className='auth-aside'>
        <div>
          <Link
            href='/'
            aria-label='Zenn home'
            className='auth-wordmark text-[5.5rem]'>
            Zenn
          </Link>
          <p className='mt-6 max-w-[28ch] text-lg leading-relaxed text-foreground/85'>
            One account for every order, saved piece and delivery.
          </p>
        </div>

        <ul className='space-y-6'>
          {perks.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className='flex gap-4'>
              <span className='flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-brand-soft text-brand-ink'>
                <Icon
                  className='size-[18px]'
                  aria-hidden='true'
                />
              </span>
              <div>
                <p className='text-[0.9375rem] font-medium text-foreground'>{title}</p>
                <p className='mt-0.5 text-sm leading-relaxed text-muted-foreground'>{body}</p>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href='/'
          className='inline-flex w-fit items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'>
          <ArrowLeftIcon
            className='size-4'
            aria-hidden='true'
          />
          Back to store
        </Link>
      </aside>

      <section className='auth-panel'>
        <Link
          href='/'
          aria-label='Zenn home'
          className='auth-wordmark w-fit text-[2.5rem] lg:hidden'>
          Zenn
        </Link>

        <Header
          label={headerLabel}
          description={headerDescription}
        />

        <div>{children}</div>

        {showSocial && (
          <div className='space-y-5'>
            <div className='auth-divider'>or</div>
            <Social />
          </div>
        )}

        <footer className='border-t border-border pt-6 text-center text-sm text-muted-foreground'>
          {backButtonCta ? (
            <p>
              {backButtonLabel}{' '}
              <Link
                href={backButtonLink}
                className='auth-link'>
                {backButtonCta}
              </Link>
            </p>
          ) : (
            <BackButton
              label={backButtonLabel}
              link={backButtonLink}
            />
          )}
        </footer>
      </section>
    </div>
  );
};

export default CardWrapper;
