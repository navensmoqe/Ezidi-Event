# Vercel staging deployment

This repository builds as a Next.js application and can be deployed directly to Vercel. Do not commit `.env.local` or any real credentials.

## 1. Create the database

Create a free Supabase project, then run the SQL migration at `supabase/migrations/20260809000000_initial_schema.sql` in the Supabase SQL Editor. The current local configuration contains placeholder credentials, so this is required before the site can use real persistent data.

## 2. Configure Vercel

Import `navensmoqe/Ezidi-Event` into Vercel. In **Settings → Environment Variables**, add these values for the Preview and Production environments:

| Variable | Value |
| --- | --- |
| `APP_MODE` | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service-role key (server-only) |
| `NEXT_PUBLIC_APP_URL` | The current Vercel deployment URL |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `ar`, `en`, `de`, or `fr` |
| `UPSTASH_REDIS_REST_URL` | Optional, recommended for production rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Optional, recommended for production rate limiting |

Never expose `SUPABASE_SERVICE_ROLE_KEY` with a `NEXT_PUBLIC_` prefix.

## 3. Deploy and test

Every push to `main` creates a Vercel deployment when the GitHub repository is connected. Test the public events pages, organization registration, and the administrator review queue on the generated Vercel URL.

## Important current boundary

The application still has a demo data layer and a temporary synchronization implementation. A fully production backend requires replacing that layer with the Supabase database defined by the migration before using the site for real registrations or sensitive data. Do not collect real passwords or private verification documents until that migration is complete.
