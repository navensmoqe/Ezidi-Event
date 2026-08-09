import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Protected route guards for /admin and /organization
  const isProtectedAdmin = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const isProtectedOrg = pathname.startsWith('/organization') && !pathname.startsWith('/organization/login');

  if (isProtectedAdmin || isProtectedOrg) {
    const authSession = request.cookies.get('ezidi_auth_session')?.value;

    if (!authSession) {
      const redirectUrl = isProtectedAdmin
        ? new URL('/admin/login', request.url)
        : new URL('/organization/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. Delegate to next-intl middleware for localized public routes
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
