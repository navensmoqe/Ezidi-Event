import { z } from 'zod';

const envSchema = z.object({
  APP_MODE: z.enum(['production', 'development', 'demo']).default('demo'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().default('https://mock-ezidi-events.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default('mock-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['ar', 'en']).default('ar'),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function getEnvironmentConfig(): EnvConfig {
  const hasRealSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-ezidi-events') &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('mock');

  const appMode = process.env.APP_MODE === 'production' && hasRealSupabase ? 'production' : 'demo';

  const rawEnv = {
    APP_MODE: appMode,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-ezidi-events.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_DEFAULT_LOCALE: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as any) || 'ar',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  };

  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    console.warn('Environment fallback to demo mode:', parsed.error.format());
    return {
      APP_MODE: 'demo',
      NEXT_PUBLIC_SUPABASE_URL: 'https://mock-ezidi-events.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_DEFAULT_LOCALE: 'ar',
    };
  }

  return parsed.data;
}

export const env = getEnvironmentConfig();

export const isProduction = env.APP_MODE === 'production';
export const isDemoMode = env.APP_MODE === 'demo' || env.APP_MODE === 'development';
