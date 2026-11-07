import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@prisma/client';

// Single source of truth for the Auth.js module augmentation.
// `role` mirrors the Prisma `UserRole` enum (SUPER_ADMIN | ADMIN | USER) because
// auth.ts copies it straight from the database row into the token.
export type ExtendedUser = DefaultSession['user'] & {
  id: string;
  role: UserRole;
};

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }

  // Credentials `authorize` returns a Prisma user, and the Prisma adapter hands
  // full Prisma users to events, so these columns can be present at runtime.
  interface User {
    role?: UserRole;
    firstName?: string | null;
    lastName?: string | null;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: UserRole;
    passwordVersion?: string;
  }
}
