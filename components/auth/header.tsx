const Header = ({ label, description }: { label: string; description?: string }) => {
  return (
    <header className='space-y-2'>
      <h1 className='auth-title first-letter:uppercase'>{label}</h1>
      {description && <p className='auth-description'>{description}</p>}
    </header>
  );
};

export default Header;
