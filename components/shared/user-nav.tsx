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

import { MoonIcon, ShoppingBagIcon, SunIcon, UserIcon } from 'lucide-react';
import { logout } from '@/actions/login.action';
import { Button } from '../ui/button';
import { CartType } from '@/types';
import { useTheme } from 'next-themes';

type UserNavProps = {
  isLoggedIn: boolean;
  cart: CartType | null;
  cartItemsCount: number;
  userRole: string;
};
const UserNav = ({ isLoggedIn, userRole, cartItemsCount }: UserNavProps) => {
  console.log(isLoggedIn);
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <ul className='flex items-center gap-8 list-none'>
        <li className=''>
          <Link
            href='/cart'
            className='relative'>
            <div className='absolute -top-3 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full'>
              {cartItemsCount}
            </div>
            <ShoppingBagIcon size={22} />
          </Link>
        </li>

        <li>
          <DropdownMenu>
            <DropdownMenuTrigger className='cursor-pointer'>
              <UserIcon />
            </DropdownMenuTrigger>

            {isLoggedIn ? (
              <DropdownMenuContent>
                <DropdownMenuLabel>Account</DropdownMenuLabel>

                {userRole === 'ADMIN' && (
                  <DropdownMenuItem>
                    <Link href='/admin/dashboard'>Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Link href='/user/orders'>Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href='/user/wishlist'>Wishlist</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link href='/login'>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className='w-full flex justify-start cursor-pointer bg-transparent hover:bg-transparent'>
                    {theme === 'light' ? <MoonIcon className='size-5' /> : <SunIcon className='size-5' />}
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button
                    onClick={logout}
                    className='cursor-pointer'>
                    Logout
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            ) : (
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href='/auth/login'>Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href='/auth/register'>Register</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </li>
      </ul>
    </div>
  );
};

export default UserNav;
