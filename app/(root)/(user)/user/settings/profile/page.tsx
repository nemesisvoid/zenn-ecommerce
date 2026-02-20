import { getUserById } from '@/actions/user.action';
import { auth } from '@/auth';
import UserProfileForm from '@/components/user/user-profile-form';

const UserProfilePage = async () => {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) return null;
  const initialData = await getUserById(userId);
  console.log('init', initialData);

  return <UserProfileForm initialData={initialData} />;
};

export default UserProfilePage;
