const SettingsHeader = ({ title, description }: { title: string; description?: string }) => {
  return (
    <div className='mb-6'>
      <h2 className='text-xl font-semibold tracking-tight text-foreground'>{title}</h2>
      {description && <p className='mt-1 text-sm text-muted-foreground'>{description}</p>}
    </div>
  );
};

export default SettingsHeader;
