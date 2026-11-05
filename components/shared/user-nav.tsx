'use client';

import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { HeartIcon, LayoutDashboardIcon, LogInIcon, LogOutIcon, PackageIcon, ShoppingBagIcon, UserIcon, UserPlusIcon } from 'lucide-react';
import { logout } from '@/actions/login.action';
import { CartType } from '@/types';
import ThemeToggle from './theme-toggle';

type UserNavProps = {
  isLoggedIn: boolean;
  cart: CartType | null;
  cartItemsCount: number;
  userRole: string;
};

const itemClass = 'cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[0.9375rem] [&_svg]:text-muted-foreground';

const UserNav = ({ isLoggedIn, userRole, cartItemsCount }: UserNavProps) => {
  return (
    <ul className='flex shrink-0 list-none items-center gap-1'>
      <li className='hidden lg:block'>
        <ThemeToggle />
      </li>

      <li>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label='Account menu'
            className='icon-button data-[state=open]:bg-accent'>
            <UserIcon
              className='size-5'
              aria-hidden='true'
            />
          </DropdownMenuTrigger>

          {isLoggedIn ? (
            <DropdownMenuContent
              align='end'
              sideOffset={10}
              className='w-56 rounded-xl p-1.5'>
              <DropdownMenuLabel className='px-2.5 pb-1 pt-2 text-xs font-medium text-muted-foreground'>Account</DropdownMenuLabel>

              {userRole === 'ADMIN' && (
                <DropdownMenuItem
                  asChild
                  className={itemClass}>
                  <Link href='/admin/dashboard'>
                    <LayoutDashboardIcon />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                asChild
                className={itemClass}>
                <Link href='/user/orders'>
                  <PackageIcon />
                  Orders
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className={itemClass}>
                <Link href='/user/wishlist'>
                  <HeartIcon />
                  Wishlist
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className={itemClass}>
                <Link href='/user/settings/profile'>
                  <UserIcon />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className='my-1.5' />

              <DropdownMenuItem
                onClick={logout}
                className={itemClass}>
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          ) : (
            <DropdownMenuContent
              align='end'
              sideOffset={10}
              className='w-56 rounded-xl p-1.5'>
              <DropdownMenuItem
                asChild
                className={itemClass}>
                <Link href='/auth/login'>
                  <LogInIcon />
                  Sign in
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className={itemClass}>
                <Link href='/auth/register'>
                  <UserPlusIcon />
                  Create account
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </li>

      <li>
        <Link
          href='/cart'
          aria-label={`Shopping bag, ${cartItemsCount} ${cartItemsCount === 1 ? 'item' : 'items'}`}
          className='icon-button'>
          <ShoppingBagIcon
            className='size-5'
            aria-hidden='true'
          />
          {cartItemsCount > 0 && (
            <span className='absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] font-semibold tabular-nums text-primary-foreground ring-2 ring-background'>
              {cartItemsCount}
            </span>
          )}
        </Link>
      </li>
    </ul>
  );
};

export default UserNav;
