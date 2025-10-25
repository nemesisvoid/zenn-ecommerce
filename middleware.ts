import authConfig from './auth.config';
import NextAuth from 'next-auth';
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from './routes';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth(req => {
  const { nextUrl } = req;
  const res = NextResponse.next();

  if (!req.cookies.get('sessionCartId')) {
    const sessionCartId = crypto.randomUUID();
    res.cookies.set('sessionCartId', sessionCartId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    console.log('setting sessionCartId cookie:', sessionCartId);
  }

  const isLoggedIn = !!req.auth;
  // console.log('middleware:', nextUrl.pathname);
  // console.log('req auth:', !!req.auth);
  // console.log('is logged in:', isLoggedIn);

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return nextUrl.pathname === route;
    }
    return nextUrl.pathname.startsWith(route);
  });
  console.log('isPublicRoute:', isPublicRoute);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    return;
  }

  if (!isPublicRoute && !isLoggedIn) {
    return Response.redirect(new URL('/auth/login', nextUrl));
  }

  return res;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
