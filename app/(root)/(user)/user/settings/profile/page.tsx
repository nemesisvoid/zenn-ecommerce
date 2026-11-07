import { getUserById } from '@/actions/user.action';
import { auth } from '@/auth';
import UserProfileForm from '@/components/user/user-profile-form';

const UserProfilePage = async () => {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) return null;
  const user = await getUserById(userId);
  if (!user) return null;

  // Pass only the fields the form edits: props of a client component are serialised
  // to the browser, and the full row includes the password hash, admin notes and orders.
  const initialData = {
    id: user.id,
    avatar: user.avatar ?? '',
    email: user.email,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    address: user.address ?? '',
    city: user.city ?? '',
    country: user.country ?? '',
  };

  return <UserProfileForm initialData={initialData} />;
};

export default UserProfilePage;
