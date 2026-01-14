import AdminHeader from '@/components/admin/admin-header';
import Link from 'next/link';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const menuItems = [
    { label: 'General', href: '/admin/settings' },
    { label: 'Shipping & Taxes', href: '/admin/settings/shipping' },
    { label: 'Appearance', href: '/admin/settings/appearance' },
    { label: 'System', href: '/admin/settings/system' },
  ];
  return (
    <div className='flex flex-col'>
      <AdminHeader
        title='Settings'
        text='Manage your store settings'
      />

      {/* <hr /> */}
      <div className='flex flex-col md:flex-row space-y-8  md:space-y-0 gap-2 lg:gap-10'>
        <aside className='md:min-h-screen lg:w-[15%]'>
          <nav className='flex flex-row space-x-2 md:flex-col md:space-x-0 md:space-y-1 py-6'>
            {menuItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className='justify-start px-4 py-2 text-base font-medium hover:bg-gray-100 rounded-md transition-colors dark:hover:bg-dark-100'>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className='flex-1 lg:max-w-full bg-white p-8 dark:bg-dark-100'>{children}</div>
      </div>
    </div>
  );
};
export default SettingsLayout;
