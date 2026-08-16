import createMiddleware from 'next-intl/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);
const adminRoles = ['super_admin', 'admin', 'moderator', 'editor'];

function isSupabaseProduction() {
  return Boolean(
    process.env.APP_MODE === 'production' &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-ezidi-events') &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function copyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie);
  return to;
}

async function getProductionSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { response, session: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (!profile) return { response, session: null };

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', authData.user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  return { response, session: { role: profile.role as string, organizationId: membership?.organization_id } };
}

function getDemoSession(request: NextRequest) {
  const value = request.cookies.get('ezidi_auth_session')?.value;
  if (!value) return null;
  try {
    const session = JSON.parse(value) as { exp?: number; role?: string; organizationId?: string };
    return session.exp && Date.now() > session.exp ? null : session;
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Supabase invite and recovery links can fall back to the configured Site URL.
  // Preserve the one-time authorization code and send it to the dedicated callback.
  if (pathname === '/' && request.nextUrl.searchParams.has('code')) {
    const callbackUrl = new URL('/auth/callback', request.url);
    callbackUrl.search = request.nextUrl.search;
    return NextResponse.redirect(callbackUrl);
  }

  // Administrative routes are deliberately not localized.
  const localeAdminMatch = pathname.match(/^\/(en|ar|de|fr)\/admin(\/.*)?$/);
  if (localeAdminMatch) {
    return NextResponse.redirect(new URL(`/admin${localeAdminMatch[2] || ''}`, request.url));
  }
  const localeOrgMatch = pathname.match(/^\/(en|ar|de|fr)\/organization(\/.*)?$/);
  if (localeOrgMatch) {
    return NextResponse.redirect(new URL(`/organization${localeOrgMatch[2] || ''}`, request.url));
  }

  const production = isSupabaseProduction();
  const auth = production
    ? await getProductionSession(request)
    : { response: NextResponse.next({ request }), session: getDemoSession(request) };
  const redirect = (path: string) => copyCookies(auth.response, NextResponse.redirect(new URL(path, request.url)));

  if (pathname.startsWith('/admin')) {
    if (!pathname.startsWith('/admin/login') && (!auth.session || !adminRoles.includes(auth.session.role || ''))) {
      return redirect('/admin/login');
    }
    return auth.response;
  }

  if (pathname.startsWith('/organization')) {
    const isOrgUser = Boolean(
      auth.session?.organizationId ||
        adminRoles.includes(auth.session?.role || '') ||
        auth.session?.role === 'organization_owner' ||
        auth.session?.role === 'organization_admin'
    );
    if (!pathname.startsWith('/organization/login') && !isOrgUser) return redirect('/organization/login');
    return auth.response;
  }

  return copyCookies(auth.response, intlMiddleware(request));
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
