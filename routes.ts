/**
 * array of routes accessible to the public
 * these routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ['/', '/product', ''];

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
