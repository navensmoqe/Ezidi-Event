import { z } from 'zod';

const envSchema = z.object({
  APP_MODE: z.enum(['production', 'development', 'demo']).default('demo'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['en', 'ar', 'de', 'fr']).default('en'),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function getEnvironmentConfig(): EnvConfig {
  const rawEnv = {
    APP_MODE: process.env.APP_MODE || process.env.NODE_ENV === 'production' ? process.env.APP_MODE || 'production' : 'demo',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-ezidi-events.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  };

  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    console.error('❌ Invalid environment configuration:', parsed.error.format());
    throw new Error('Environment configuration error. Please check your environment variables.');
  }

  const config = parsed.data;

  // Strict Production Validation:
  if (config.APP_MODE === 'production') {
    if (!config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_SERVICE_ROLE_KEY.includes('mock')) {
      throw new Error(
        'CRITICAL CONFIG ERROR: In production mode (APP_MODE=production), a valid SUPABASE_SERVICE_ROLE_KEY is strictly required.'
      );
    }
    if (config.NEXT_PUBLIC_SUPABASE_URL.includes('mock-ezidi-events')) {
      throw new Error(
        'CRITICAL CONFIG ERROR: In production mode (APP_MODE=production), a real NEXT_PUBLIC_SUPABASE_URL is strictly required.'
      );
    }
  }

  return config;
}

export const env = getEnvironmentConfig();

export const isProduction = env.APP_MODE === 'production';
export const isDemoMode = env.APP_MODE === 'demo' || env.APP_MODE === 'development';
