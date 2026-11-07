'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import {
  BellIcon,
  CheckCheckIcon,
  ExternalLinkIcon,
  LogOutIcon,
  PackageIcon,
  PanelLeftIcon,
  RotateCcwIcon,
  SettingsIcon,
  TriangleAlertIcon,
  UserIcon,
} from 'lucide-react';

import { getAdminNotifications, type AdminNotification, type AdminNotifications } from '@/actions/admin-notification.actions';
import { logout } from '@/actions/login.action';
import ThemeToggle from '@/components/shared/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { greetAdmin } from '@/helper/utils';
import { cn, getInitials } from '@/lib/utils';

const KIND: Record<AdminNotification['kind'], { icon: typeof BellIcon; tone: string }> = {
  refund: { icon: RotateCcwIcon, tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  order: { icon: PackageIcon, tone: 'bg-brand-soft text-brand-ink' },
  stock: { icon: TriangleAlertIcon, tone: 'bg-destructive/10 text-destructive' },
};

const timeAgo = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const itemClass = 'cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm [&_svg]:text-muted-foreground';

const Notifications = () => {
  const pathname = usePathname();
  const [data, setData] = useState<AdminNotifications | null>(null);

  // Refresh on every admin page change, so handled items drop off and new ones appear.
  useEffect(() => {
    let cancelled = false;
    getAdminNotifications()
      .then(res => !cancelled && setData(res))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const total = data?.total ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={total > 0 ? `Notifications, ${total} need attention` : 'Notifications'}
        className='icon-button data-[state=open]:bg-accent'>
        <BellIcon
          className='size-[19px]'
          aria-hidden='true'
        />
        {total > 0 && (
          <span className='absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background'>
            {total > 99 ? '99+' : total}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={10}
        className='w-[min(22rem,calc(100vw-2rem))] rounded-xl p-0'>
        <div className='flex items-center justify-between border-b border-border px-4 py-3'>
          <p className='text-sm font-semibold text-foreground'>Notifications</p>
          {total > 0 && <span className='text-xs text-muted-foreground'>{total} need attention</span>}
        </div>

        {!data ? (
          <p className='px-4 py-8 text-center text-sm text-muted-foreground'>Loading…</p>
        ) : data.items.length === 0 ? (
          <div className='flex flex-col items-center gap-2 px-4 py-10 text-center'>
            <CheckCheckIcon
              className='size-6 text-success'
              aria-hidden='true'
            />
            <p className='text-sm font-medium text-foreground'>You&apos;re all caught up</p>
            <p className='text-xs text-muted-foreground'>New orders, refund requests and low stock show up here.</p>
          </div>
        ) : (
          <div className='max-h-96 overflow-y-auto p-1.5'>
            {data.items.map(item => {
              const { icon: Icon, tone } = KIND[item.kind];
              return (
                <DropdownMenuItem
                  key={item.id}
                  asChild
                  className='cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2.5'>
                  <Link href={item.href}>
                    <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', tone)}>
                      <Icon
                        className='size-4 text-current'
                        aria-hidden='true'
                      />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='flex items-baseline justify-between gap-2'>
                        <span className='text-sm font-medium text-foreground'>{item.title}</span>
                        {item.at && <span className='shrink-0 text-[11px] text-muted-foreground'>{timeAgo(item.at)}</span>}
                      </span>
                      <span className='mt-0.5 block truncate text-xs text-muted-foreground'>{item.description}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}

        {total > 0 && (
          <div className='border-t border-border p-1.5'>
            <DropdownMenuItem
              asChild
              className='cursor-pointer justify-center rounded-lg py-2 text-sm font-medium'>
              <Link href='/admin/orders'>View all orders</Link>
            </DropdownMenuItem>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ProfileMenu = ({ user }: { user: Session['user'] | undefined }) => {
  const name = user?.name || user?.email || 'Admin';
  const initials = getInitials({ name: user?.name, email: user?.email });
  const role = user?.role === 'SUPER_ADMIN' ? 'Super admin' : 'Admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label='Account menu'
        className='flex cursor-pointer items-center gap-2.5 rounded-full p-1 pr-1 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:bg-accent sm:pr-3'>
        {user?.image ? (
          <Image
            src={user.image}
            width={32}
            height={32}
            alt=''
            className='size-8 rounded-full object-cover'
          />
        ) : (
          <span className='flex size-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background'>{initials}</span>
        )}
        <span className='hidden text-left sm:block'>
          <span className='block max-w-36 truncate text-sm font-medium leading-tight text-foreground'>{name}</span>
          <span className='block text-xs leading-tight text-muted-foreground'>{role}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={10}
        className='w-60 rounded-xl p-1.5'>
        <DropdownMenuLabel className='px-2.5 py-2 font-normal'>
          <p className='truncate text-sm font-medium text-foreground'>{name}</p>
          {user?.email && <p className='truncate text-xs text-muted-foreground'>{user.email}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='my-1.5' />
        <DropdownMenuItem
          asChild
          className={itemClass}>
          <Link href='/user/settings/profile'>
            <UserIcon />
            My profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className={itemClass}>
          <Link href='/admin/settings'>
            <SettingsIcon />
            Store settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className={itemClass}>
          <Link
            href='/'
            target='_blank'>
            <ExternalLinkIcon />
            View store
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className='my-1.5' />
        <DropdownMenuItem
          onClick={() => logout()}
          className={itemClass}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AdminInfo = ({ session }: { session: Session | null }) => {
  const { toggleSidebar } = useSidebar();
  const firstName = session?.user.name?.split(' ')[0];
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header className='sticky top-0 z-30 -mx-5 -mt-5 mb-6 flex items-center justify-between gap-4 border-b border-border bg-[#efebeb]/85 px-5 py-3 backdrop-blur-md dark:bg-[#22282E]/85'>
      <div className='flex min-w-0 items-center gap-3'>
        <button
          type='button'
          onClick={toggleSidebar}
          aria-label='Toggle sidebar'
          className='icon-button'>
          <PanelLeftIcon
            className='size-[19px]'
            aria-hidden='true'
          />
        </button>
        <div className='min-w-0'>
          <p
            className='truncate text-sm font-semibold text-foreground'
            suppressHydrationWarning>
            {greetAdmin()}
            {firstName ? `, ${firstName}` : ''}
          </p>
          <p
            className='hidden truncate text-xs text-muted-foreground sm:block'
            suppressHydrationWarning>
            {today}
          </p>
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-1'>
        <ThemeToggle />
        <Notifications />
        <span
          className='mx-1.5 hidden h-6 w-px bg-border sm:block'
          aria-hidden='true'
        />
        <ProfileMenu user={session?.user} />
      </div>
    </header>
  );
};

export default AdminInfo;
