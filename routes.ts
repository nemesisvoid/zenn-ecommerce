/**
 * array of routes accessible to the public
 * these routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ['/', '/product', '/auth/forgot-password', '/auth/reset-password'];

/**
 * array of routes that require authentication
 * these routes will redirect logged in users to the home page
 * @type {string[]}
 */
export const authRoutes = ['/auth/login', '/auth/register'];

/**
 * the prefix for api auth routes,
 * routes that starts with this prefix are used for api auth purposes
 * @type {string}
 */
export const apiAuthPrefix = '/api/auth';

export const privateRoutes = ['/checkout'];

export const adminRoutes = ['/admin'];
export const userRoutes = ['/user'];

/**
 * the prefix for api auth routes
 * routes that starts with this prefix are used for api auth purposes
 * @type {string}
 */

/**
 * the default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = '/';

/**
 * Validates a post-login redirect target. Only same-site paths are allowed (blocks open
 * redirects like "https://evil.com" or "//evil.com"); auth pages fall back to the default.
 */
export const getSafeRedirect = (url: string | null | undefined) => {
  if (!url || !url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) return DEFAULT_LOGIN_REDIRECT;
  if (url.startsWith('/auth')) return DEFAULT_LOGIN_REDIRECT;
  return url;
};

/** Login page URL that returns the user to `path` after signing in. */
export const loginUrlFor = (path: string) => `/auth/login?callbackUrl=${encodeURIComponent(path)}`;
