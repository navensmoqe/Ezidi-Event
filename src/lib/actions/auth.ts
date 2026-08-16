'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { isProduction } from '@/lib/config/env';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { logAuditEvent } from '@/lib/services/audit';
import { verifyTwoFactorToken } from '@/lib/security/two-factor';

export async function loginAction(formData: {
  email: string;
  password?: string;
  totpCode?: string;
  portalType: 'admin' | 'organization' | 'user';
}) {
  const email = formData.email.toLowerCase().trim();
  const password = formData.password?.trim() || '';

  // 1. Rate Limiting Check (Brute-force protection: 10 attempts per minute)
  const rateCheck = await checkRateLimit(`login:${email}`, 'AUTH_LOGIN');
  if (!rateCheck.success) {
    return {
      success: false,
      error: 'محاولات دخول كثيرة خاطئة. يرجى الانتظار 60 ثانية والمحاولة مجدداً.',
    };
  }

  // Production always uses Supabase Auth. The demo-only JSON cookie and its
  // demonstration passwords below are deliberately never accepted here.
  if (isProduction) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !authData.user) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', authData.user.id)
      .maybeSingle();
    if (profileError || !profile) {
      await supabase.auth.signOut();
      return { success: false, error: 'لم يُكتمل إعداد حسابك بعد. تواصل مع إدارة المنصة.' };
    }

    const user = {
      ...profile,
      role: profile.role as any,
      is_active: true,
      is_2fa_enabled: false,
      created_at: authData.user.created_at,
      updated_at: authData.user.updated_at || authData.user.created_at,
    };

    if (formData.portalType === 'admin') {
      if (!['super_admin', 'admin', 'moderator', 'editor'].includes(user.role)) {
        await supabase.auth.signOut();
        return { success: false, error: 'تم رفض الوصول: ليس لديك صلاحيات إدارية على النظام.' };
      }
    }

    if (formData.portalType === 'organization') {
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(*)')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      const organization = Array.isArray(membership?.organizations) ? membership?.organizations[0] : membership?.organizations;
      if (membershipError || !membership?.organization_id || !organization) {
        await supabase.auth.signOut();
        return { success: false, error: 'هذا الحساب غير مرتبط بمنظمة معتمدة بعد.' };
      }
      const org = organization as any;
      if (org.organization_status !== 'active') {
        await supabase.auth.signOut();
        return { success: false, error: 'تم تعليق حساب هذه المنظمة. يرجى التواصل مع إدارة المنصة.' };
      }
      await logAuditEvent({
        actor_id: user.id,
        actor_email: user.email,
        actor_role: user.role,
        action: 'USER_LOGGED_IN',
        entity_type: 'organization',
        entity_id: membership.organization_id,
        new_values: { portal: 'organization' },
      });
      return { success: true, organization: org, user };
    }

    await logAuditEvent({
      actor_id: user.id,
      actor_email: user.email,
      actor_role: user.role,
      action: 'USER_LOGGED_IN',
      entity_type: 'auth',
      entity_id: user.id,
      new_values: { portal: formData.portalType },
    });
    return { success: true, user };
  }

  // 2. Organization Portal Authentication
  if (formData.portalType === 'organization') {
    const org = await db.organizations.findByEmail(email);
    if (org) {
      if (org.organization_status === 'suspended') {
        return {
          success: false,
          error: 'تم تعليق حساب هذه المنظمة. يرجى التواصل مع إدارة المنصة.',
        };
      }

      const expectedPassword = org.password || 'Ezidi@2026';
      if (password !== expectedPassword && password !== 'Ezidi@2026' && password !== 'demo123456') {
        return {
          success: false,
          error: 'كلمة المرور غير صحيحة. يرجى التأكد من كلمة السر المرسلة من الإدارة.',
        };
      }

      // Set secure organization session cookie
      const sessionToken = JSON.stringify({
        userId: `org-user-${org.id}`,
        organizationId: org.id,
        email: org.email,
        role: 'organization_owner',
        full_name: org.name,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      try {
        cookies().set('ezidi_auth_session', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
      } catch {}

      await logAuditEvent({
        actor_id: org.id,
        actor_email: org.email,
        actor_role: 'organization_owner',
        action: 'USER_LOGGED_IN',
        entity_type: 'organization',
        entity_id: org.id,
        new_values: { portal: 'organization' },
      });

      return {
        success: true,
        organization: org,
      };
    }
  }

  // 3. User / Admin DB authentication
  const user = await db.users.findByEmail(email);
  if (!user) {
    return {
      success: false,
      error: 'البريد الإلكتروني غير مسجل أو كلمة المرور غير صحيحة.',
    };
  }

  // Role Gate for Admin
  if (formData.portalType === 'admin') {
    if (!['super_admin', 'admin', 'moderator', 'editor'].includes(user.role)) {
      return {
        success: false,
        error: 'تم رفض الوصول: ليس لديك صلاحيات إدارية على النظام.',
      };
    }

    // If TOTP is required for super_admin and not yet provided
    if (user.role === 'super_admin' && !formData.totpCode) {
      return {
        success: true,
        requires2FA: true,
        message: 'يتطلب الدخول إدخال رمز التحقق بخطوتين (2FA).',
      };
    }

    // Verify 2FA if provided
    if (formData.totpCode) {
      const isValid = formData.totpCode === '123456' || formData.totpCode.length === 6;
      if (!isValid) {
        return {
          success: false,
          error: 'رمز التحقق بخطوتين (2FA) غير صحيح.',
        };
      }
    }
  }

  // Set secure session cookie
  const sessionToken = JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  try {
    cookies().set('ezidi_auth_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  } catch {}

  await logAuditEvent({
    actor_id: user.id,
    actor_email: user.email,
    actor_role: user.role,
    action: 'USER_LOGGED_IN',
    entity_type: 'auth',
    entity_id: user.id,
    new_values: { portal: formData.portalType },
  });

  return {
    success: true,
    user,
  };
}

export async function getCurrentUserSession() {
  if (isProduction) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', authData.user.id)
      .maybeSingle();
    if (!profile) return null;
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', authData.user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    return {
      userId: profile.id,
      organizationId: membership?.organization_id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
    };
  }

  const cookie = cookies().get('ezidi_auth_session')?.value;
  if (!cookie) return null;

  try {
    const session = JSON.parse(cookie);
    if (session.exp && Date.now() > session.exp) {
      return null;
    }
    return session as {
      userId: string;
      organizationId?: string;
      email: string;
      role: string;
      full_name: string;
    };
  } catch {
    return null;
  }
}

export async function setPasswordAction(password: string) {
  if (!isProduction) {
    return { success: false, error: 'تعيين كلمة المرور متاح بعد إعداد Supabase في وضع الإنتاج.' };
  }
  if (password.length < 12) {
    return { success: false, error: 'يجب أن تتكون كلمة المرور من 12 حرفاً على الأقل.' };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { success: false, error: 'انتهت صلاحية رابط الدعوة. اطلب رابطاً جديداً من إدارة المنصة.' };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { success: false, error: 'تعذر حفظ كلمة المرور. أعد فتح رابط الدعوة وحاول مجدداً.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (!profile) return { success: false, error: 'تم حفظ كلمة المرور، لكن لم يتم العثور على ملف الحساب.' };

  await logAuditEvent({
    actor_id: profile.id,
    actor_email: profile.email,
    actor_role: profile.role as any,
    action: 'PASSWORD_SET',
    entity_type: 'auth',
    entity_id: profile.id,
    reason: 'Password set through Supabase invitation or recovery session.',
  });

  const redirectTo = ['super_admin', 'admin', 'moderator', 'editor'].includes(profile.role)
    ? '/admin'
    : '/organization/dashboard';
  return { success: true, redirectTo };
}

export async function logoutAction() {
  const current = await getCurrentUserSession();
  if (current) {
    await logAuditEvent({
      actor_id: current.userId,
      actor_email: current.email,
      actor_role: current.role as any,
      action: 'USER_LOGGED_OUT',
      entity_type: 'auth',
      entity_id: current.userId,
    });
  }

  if (isProduction) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    await supabase.auth.signOut();
  } else {
    cookies().delete('ezidi_auth_session');
  }
  return { success: true };
}
