'use client'; // Needed for usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Heart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a standard cn utility

const sidebarNavItems = [
  { title: 'Profile', href: '/user/settings/profile', icon: User },
  { title: 'Orders', href: '/user/settings/orders', icon: Package },
  { title: 'Wishlist', href: '/user/settings/wishlist', icon: Heart },
  { title: 'Security', href: '/user/settings/account', icon: Settings },
];

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className='container'>
      <header className='mb-8 border-b border-border pb-8 md:mb-10'>
        <h1 className='page-title'>Your account</h1>
        <p className='lede mt-3'>Manage your details, orders and saved items.</p>
      </header>

      <div className='flex flex-col gap-8 lg:flex-row lg:gap-12'>
        <aside className='-mx-4 shrink-0 overflow-x-auto px-4 lg:mx-0 lg:w-56 lg:overflow-visible lg:px-0'>
          <nav
            aria-label='Account'
            className='flex gap-1 lg:sticky lg:top-28 lg:flex-col'>
            {sidebarNavItems.map(item => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-[0.9375rem] transition-colors lg:rounded-xl',
                    active ? 'bg-foreground font-medium text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}>
                  <Icon
                    className='size-4'
                    aria-hidden='true'
                  />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className='min-w-0 flex-1 lg:max-w-4xl'>{children}</div>
      </div>
    </div>
  );
};

export default UserLayout;
