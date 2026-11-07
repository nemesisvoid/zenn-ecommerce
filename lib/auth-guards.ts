// Permission checks for server actions. Every exported function in a 'use server' file is a
// public endpoint, so each one must check who is calling it — never trust ids passed in.
import { auth } from '@/auth';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export const isAdminRole = (role: string | null | undefined) => !!role && ADMIN_ROLES.includes(role);

/** Returns the signed-in user, or null. */
export const getSessionUser = async () => {
  const session = await auth();
  return session?.user?.id ? session.user : null;
};

/** Returns the signed-in admin, or throws. */
export const requireAdmin = async () => {
  const user = await getSessionUser();
  if (!user || !isAdminRole(user.role)) throw new Error('Unauthorized');
  return user;
};
