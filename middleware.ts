import authConfig from './auth.config';
import NextAuth from 'next-auth';
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, adminRoutes, privateRoutes, publicRoutes, userRoutes } from './routes';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth(req => {
  const { nextUrl } = req;
  const res = NextResponse.next();
  const userRole = req.auth?.user.role;
  console.log('middleware user role', userRole);

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


  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return nextUrl.pathname === route;
    }
    return nextUrl.pathname.startsWith(route);
  });

  console.log('isPublicRoute:', isPublicRoute);

  const isAdminRoute = adminRoutes.some(route => nextUrl.pathname.startsWith(route));
  console.log('');
  const isUserRoute = userRoutes.some(route => nextUrl.pathname.startsWith(route));

  if (isAdminRoute) {
    if (!isLoggedIn) return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    if (userRole !== 'ADMIN') return NextResponse.redirect(new URL('/', nextUrl));
    console.log('middle', res);
    return res;
  }

  if (isUserRoute) {
    if (!isLoggedIn) return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    return res;
  }
  const isPrivateRoute = privateRoutes.some(route => nextUrl.pathname.startsWith(route));

  console.log('private route:', isPrivateRoute);
  if (isPrivateRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/login', nextUrl));
  }
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    return;
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
