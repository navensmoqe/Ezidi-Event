import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. If someone accesses /[locale]/admin/* or /[locale]/organization/* -> redirect to unlocalized /admin or /organization
  const localeAdminMatch = pathname.match(/^\/(en|ar|de|fr)\/admin(\/.*)?$/);
  if (localeAdminMatch) {
    const subpath = localeAdminMatch[2] || '';
    return NextResponse.redirect(new URL(`/admin${subpath}`, request.url));
  }

  const localeOrgMatch = pathname.match(/^\/(en|ar|de|fr)\/organization(\/.*)?$/);
  if (localeOrgMatch) {
    const subpath = localeOrgMatch[2] || '';
    return NextResponse.redirect(new URL(`/organization${subpath}`, request.url));
  }

  // 2. Protected route guards for /admin and /organization (Bypass next-intl completely)
  if (pathname.startsWith('/admin')) {
    const isLogin = pathname.startsWith('/admin/login');
    if (!isLogin) {
      const authSession = request.cookies.get('ezidi_auth_session')?.value;
      if (!authSession) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/organization')) {
    const isLogin = pathname.startsWith('/organization/login');
    if (!isLogin) {
      const authSession = request.cookies.get('ezidi_auth_session')?.value;
      if (!authSession) {
        return NextResponse.redirect(new URL('/organization/login', request.url));
      }
    }
    return NextResponse.next();
  }

  // 3. Delegate to next-intl middleware for localized public routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
