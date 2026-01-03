import { auth } from '@/auth';
import AdminInfo from '@/components/admin/admin-info';

import AdminSidebar from '@/components/admin/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from 'next/navigation';

const AdminLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className='overflow-x-hidden dark:bg-[#22282E] bg-[#efebeb] w-full h-full px-5 py-5'>
        <AdminInfo session={session} />
        <div className='min-h-screen'>{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
