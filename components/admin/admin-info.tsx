'use client';

import Link from 'next/link';
import { BellDotIcon, MenuIcon, MoonIcon, SearchIcon } from 'lucide-react';
import Image from 'next/image';
import { Session } from 'next-auth';
import { useSidebar } from '../ui/sidebar';
import { useTheme } from 'next-themes';

const AdminInfo = ({ session }: { session: Session | null }) => {
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  return (
    <div className='flex items-center justify-between pr-5 mb-5'>
      <div className='flex items-center gap-6'>
        <button
          onClick={toggleSidebar}
          className='cursor-pointer'>
          <MenuIcon />
        </button>

        <h1>Welcome, {session?.user.name}</h1>
      </div>

      <div className='flex items-center gap-6'>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className='cursor-pointer'>
          <MoonIcon size={20} />
        </button>

        <Link href='/admin/notifications'>
          <BellDotIcon
            size={20}
            className='text-gray-700'
          />
        </Link>

        <Image
          src={'/default-avatar.png'}
          width={22}
          height={22}
          alt='admin image'
          className='border border-gray-400 rounded-full'
        />

        <div className='flex items-center gap-2 border border-gray-300 py-2 pl-2 pr-5 rounded-sm'>
          <SearchIcon size={18} />
          <input
            className='outline-none placeholder:text-sm text-sm'
            placeholder='Search... '
          />
        </div>
      </div>
    </div>
  );
};

export default AdminInfo;
