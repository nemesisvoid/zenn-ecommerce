import ThemeToggle from '@/components/shared/theme-toggle';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='auth-theme auth-shell bg-auth'>
      <ThemeToggle className='absolute right-4 top-4 border border-border bg-card/70 backdrop-blur sm:right-6 sm:top-6' />
      {children}
    </div>
  );
};

export default AuthLayout;
