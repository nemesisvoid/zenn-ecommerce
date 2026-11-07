import authConfig from './auth.config';
import NextAuth from 'next-auth';
import { apiAuthPrefix, authRoutes, adminRoutes, privateRoutes, publicRoutes, userRoutes, getSafeRedirect, loginUrlFor } from './routes';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth(req => {
  const { nextUrl } = req;
  const res = NextResponse.next();
  const userRole = req.auth?.user?.role;

  if (!req.cookies.get('sessionCartId')) {
    const sessionCartId = crypto.randomUUID();
    res.cookies.set('sessionCartId', sessionCartId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  const isLoggedIn = !!req.auth?.user?.id;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return nextUrl.pathname === route;
    }
    return nextUrl.pathname.startsWith(route);
  });

  const isAdminRoute = adminRoutes.some(route => nextUrl.pathname.startsWith(route));
  const isUserRoute = userRoutes.some(route => nextUrl.pathname.startsWith(route));

  // Where a signed-out visitor was trying to go, so login can send them back afterwards.
  const loginRedirect = new URL(loginUrlFor(nextUrl.pathname + nextUrl.search), nextUrl);

  if (isAdminRoute) {
    if (!isLoggedIn) return Response.redirect(loginRedirect);
    if (userRole !== 'ADMIN') return NextResponse.redirect(new URL('/', nextUrl));
    return res;
  }

  if (isUserRoute) {
    if (!isLoggedIn) return Response.redirect(loginRedirect);
    return res;
  }
  const isPrivateRoute = privateRoutes.some(route => nextUrl.pathname.startsWith(route));

  if (isPrivateRoute && !isLoggedIn) {
    return NextResponse.redirect(loginRedirect);
  }
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) return NextResponse.redirect(new URL(getSafeRedirect(nextUrl.searchParams.get('callbackUrl')), nextUrl));
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
