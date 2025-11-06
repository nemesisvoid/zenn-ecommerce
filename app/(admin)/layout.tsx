import { auth } from '@/auth';

import AdminSidebar from '@/components/admin/admin-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { BellDotIcon, SearchIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const AdminLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const session = await auth();
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className='overflow-x-hidden bg-gray-100 w-full h-full px-5'>
        <SidebarTrigger className='mb-3' />
        <div className='flex items-center justify-between bg-white rounded-2xl shadow-sm pr-5 mb-5'>
          <div
            className='flex items-center gap-5 w-1/2 border border-gray-300 rounded-2xl py-2 px-4
          '>
            <SearchIcon size={20} />
            <input
              className='text-sm placeholder:text-sm w-full
               border-0 outline-0 '
              placeholder='search...'
            />
          </div>

          <div className='flex items-center gap-3'>
            <Link href='/admin/notifications'>
              <BellDotIcon size={20} />
            </Link>
            <div className='ml-3'>
              <p className='text-sm text-gray-500'>{session?.user.name}</p>
              <p className='text-gray-400 lowercase'>{session?.user.role}</p>
            </div>
            <Image
              src={'/default-avatar.png'}
              width={20}
              height={20}
              alt='admin image'
            />
          </div>
        </div>
        <div className='min-h-screen'>{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
