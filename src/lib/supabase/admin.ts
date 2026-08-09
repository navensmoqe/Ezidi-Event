import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env, isProduction } from '@/lib/config/env';

export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    if (isProduction) {
      throw new Error(
        'CRITICAL: SUPABASE_SERVICE_ROLE_KEY is required for administrative operations in production.'
      );
    }
    // Return null or placeholder in non-production environments when mock is enabled
    console.warn('⚠️ Service role key not set in non-production mode.');
  }

  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
