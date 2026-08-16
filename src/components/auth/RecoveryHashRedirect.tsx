'use client';

import { useEffect } from 'react';

/**
 * Supabase's dashboard password-recovery emails use implicit-flow tokens in
 * the URL hash. Fragments never reach middleware, so move recovery links from
 * a localized public page to the dedicated non-localized password page here.
 */
export function RecoveryHashRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get('type') === 'recovery' && params.get('access_token') && params.get('refresh_token')) {
      window.location.replace(`/auth/set-password${window.location.hash}`);
      return;
    }

    if (params.get('error')) {
      window.location.replace('/auth/set-password?error=recovery_link_invalid');
    }
  }, []);

  return null;
}
