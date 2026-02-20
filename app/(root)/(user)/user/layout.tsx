'use client'; // Needed for usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Heart, Settings, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a standard cn utility

const sidebarNavItems = [
  { title: 'Profile', href: '/user/settings/profile', icon: <User className='w-4 h-4 mr-2' /> },
  { title: 'Orders', href: '/user/settings/orders', icon: <Package className='w-4 h-4 mr-2' /> },
  { title: 'Wishlist', href: '/user/settings/wishlist', icon: <Heart className='w-4 h-4 mr-2' /> },
  { title: 'Account', href: '/user/settings/account', icon: <Settings className='w-4 h-4 mr-2' /> },
];

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className='container py-10 space-y-8 lg:flex lg:space-y-0 lg:space-x-12 gap-20 min-h-screen'>
      <aside className='-mx-4 lg:w-1/5 overflow-x-auto lg:overflow-visible'>
        <nav className='flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 max-md:px-4 max-sm:flex-wrap'>
          {sidebarNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}>
              <span
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transparent',
                  pathname === item.href ? 'bg-accent text-accent-foreground' : 'transparent',
                )}>
                {item.icon}
                {item.title}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className='flex-1 lg:max-w-4xl md:ml-auto'>{children}</div>
    </div>
  );
};

export default UserLayout;
