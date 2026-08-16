-- =============================================================================
-- Runtime completion: Supabase Auth profiles, real reference data and posters
-- Run this after 20260809000000_initial_schema.sql in the Supabase SQL Editor.
-- =============================================================================

-- A profile is created whenever an Auth user is created (dashboard, invite or API).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    lower(NEW.email),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name),
      updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Bring profiles in line for any Auth accounts made before this migration.
INSERT INTO public.profiles (id, email, full_name)
SELECT
  id,
  lower(email),
  COALESCE(NULLIF(raw_user_meta_data ->> 'full_name', ''), split_part(email, '@', 1))
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name),
    updated_at = NOW();

-- Users may edit only their basic display fields; they can never update their role.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url) ON public.profiles TO authenticated;

-- Reference categories used by the public submission form. This is safe to run
-- repeatedly and leaves categories subsequently added by administrators intact.
INSERT INTO public.event_categories (slug, name_en, name_ar, name_de, name_fr, description, icon_name)
VALUES
  ('cultural', 'Culture', 'ثقافة', 'Kultur', 'Culture', 'Cultural events and heritage.', 'Landmark'),
  ('conference', 'Conference', 'مؤتمر', 'Konferenz', 'Conférence', 'Conferences and forums.', 'Mic'),
  ('community', 'Community', 'مجتمع', 'Gemeinschaft', 'Communauté', 'Community gatherings.', 'Users'),
  ('education', 'Education', 'تعليم', 'Bildung', 'Éducation', 'Educational activities.', 'GraduationCap'),
  ('music', 'Music', 'موسيقى', 'Musik', 'Musique', 'Music and arts events.', 'Music'),
  ('sports', 'Sports', 'رياضة', 'Sport', 'Sport', 'Sports activities.', 'Trophy'),
  ('religious', 'Religious', 'ديني', 'Religiös', 'Religieux', 'Religious occasions.', 'Heart'),
  ('other', 'Other', 'أخرى', 'Andere', 'Autre', 'Other community events.', 'Tag')
ON CONFLICT (slug) DO UPDATE
SET name_en = EXCLUDED.name_en,
    name_ar = EXCLUDED.name_ar,
    name_de = EXCLUDED.name_de,
    name_fr = EXCLUDED.name_fr,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name;

-- Storage is public-read only. Uploads are performed by a protected server route
-- using the service-role key, never from an anonymous browser.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('event-posters', 'event-posters', TRUE, 4194304, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = TRUE,
    file_size_limit = 4194304,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Create your first administrator in Authentication > Users, then run the line
-- below once, replacing the email address. Do not put real credentials in Git.
-- UPDATE public.profiles SET role = 'super_admin' WHERE email = 'admin@example.org';
