const Header = ({ label }: { label: string }) => {
  return (
    <div className='w-full flex flex-col gap-y-3 items-center'>
      <h1 className='text-5xl font-semibold'>Zenn</h1>
      <p className='text-muted-foreground text-lg'>{label}</p>
    </div>
  );
};

export default Header;
