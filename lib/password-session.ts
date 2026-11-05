import { createHash } from 'node:crypto';

// A password change invalidates previously issued JWTs without storing a password in them.
export const passwordVersion = (password: string | null) =>
  createHash('sha256').update(password ?? '').digest('hex');
