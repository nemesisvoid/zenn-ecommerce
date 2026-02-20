import { auth } from '@/auth';
import UserAccountForm from '@/components/user/user-account-form';
import { getUserById } from '@/data/user';

const UserAccountPage = async () => {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) return null;
  return <UserAccountForm userId={userId} />;
};

export default UserAccountPage;
