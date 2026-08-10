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

  // 2. Protected route guard for /admin
  if (pathname.startsWith('/admin')) {
    const isLogin = pathname.startsWith('/admin/login');
    if (!isLogin) {
      const authSession = request.cookies.get('ezidi_auth_session')?.value;
      if (!authSession) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      try {
        const parsed = JSON.parse(authSession);
        if (!['super_admin', 'admin', 'moderator', 'editor'].includes(parsed.role)) {
          return NextResponse.redirect(new URL('/admin/login', request.url));
        }
      } catch {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
    return NextResponse.next();
  }

  // 3. Protected route guard for /organization (Strict: Must have organization session)
  if (pathname.startsWith('/organization')) {
    const isLogin = pathname.startsWith('/organization/login');
    if (!isLogin) {
      const authSession = request.cookies.get('ezidi_auth_session')?.value;
      if (!authSession) {
        return NextResponse.redirect(new URL('/organization/login', request.url));
      }
      try {
        const parsed = JSON.parse(authSession);
        const isOrgUser = parsed.organizationId || ['organization_owner', 'organization_admin', 'super_admin', 'admin'].includes(parsed.role);
        if (!isOrgUser) {
          return NextResponse.redirect(new URL('/organization/login', request.url));
        }
      } catch {
        return NextResponse.redirect(new URL('/organization/login', request.url));
      }
    }
    return NextResponse.next();
  }

  // 4. Delegate to next-intl middleware for localized public routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
