interface AdminHeaderProps {
  title: string;
  text: string;
}

/** Page title block used at the top of each admin page. */
const AdminHeader = ({ title, text }: AdminHeaderProps) => {
  return (
    <div className='mb-6 flex flex-col gap-1'>
      <h1 className='text-2xl font-semibold tracking-tight text-foreground'>{title}</h1>
      <p className='text-sm text-muted-foreground'>{text}</p>
    </div>
  );
};

export default AdminHeader;
