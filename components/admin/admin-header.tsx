interface AdminHeaderProps {
  title: string;
  text: string;
}
const AdminHeader = ({ title, text }: AdminHeaderProps) => {
  return (
    <div
      className='flex flex-col my-8
    '>
      <h1 className='font-semibold text-2xl mb-1'>{title}</h1>
      <p className='text-sm text-gray-600'>{text}</p>
    </div>
  );
};

export default AdminHeader;
