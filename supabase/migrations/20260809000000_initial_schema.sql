-- ==============================================================================
-- EZIDI EVENTS WORLDWIDE - DATABASE INITIAL SCHEMA & SECURITY SPECIFICATION
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE event_status AS ENUM (
  'draft',
  'pending',
  'published',
  'rejected',
  'cancelled',
  'postponed',
  'completed',
  'suspended'
);

CREATE TYPE event_visibility AS ENUM ('public', 'private');

CREATE TYPE event_verification_status AS ENUM (
  'unverified',
  'admin_verified',
  'organization_verified'
);

CREATE TYPE organization_status AS ENUM ('active', 'suspended', 'inactive');

CREATE TYPE org_verification_status AS ENUM (
  'pending',
  'verified',
  'rejected',
  'suspended'
);

CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin',
  'moderator',
  'editor',
  'organization_owner',
  'organization_admin',
  'organization_editor',
  'user'
);

CREATE TYPE source_type AS ENUM (
  'official_organization',
  'official_website',
  'social_media',
  'news',
  'government',
  'community',
  'user_submitted',
  'other'
);

CREATE TYPE report_type AS ENUM (
  'incorrect_information',
  'wrong_date',
  'wrong_location',
  'cancelled_event',
  'postponed_event',
  'fake_event',
  'duplicate_event',
  'misleading_information',
  'spam',
  'abuse',
  'other'
);

CREATE TYPE report_status AS ENUM ('open', 'investigating', 'resolved', 'dismissed');

-- 3. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_2fa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  totp_secret TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  backup_codes TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. GEOGRAPHIC REFERENCE DATA
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(2) NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_de TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_de TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_de TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. EVENT CATEGORIES
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_de TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT,
  cover_image TEXT,
  description TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  country_id UUID NOT NULL REFERENCES countries(id),
  region_id UUID REFERENCES regions(id),
  city_id UUID NOT NULL REFERENCES cities(id),
  postal_code TEXT,
  street TEXT,
  house_number TEXT,
  full_address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  website TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  organization_status organization_status NOT NULL DEFAULT 'active',
  verification_status org_verification_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  verification_notes TEXT,
  direct_publishing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS organization_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  previous_status org_verification_status NOT NULL,
  new_status org_verification_status NOT NULL,
  administrator_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS direct_publishing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  previous_value BOOLEAN NOT NULL,
  new_value BOOLEAN NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES event_categories(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  country_id UUID NOT NULL REFERENCES countries(id),
  region_id UUID REFERENCES regions(id),
  city_id UUID NOT NULL REFERENCES cities(id),
  postal_code TEXT,
  street TEXT,
  house_number TEXT,
  full_address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  google_maps_url TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  organizer_name TEXT,
  poster_url TEXT,
  status event_status NOT NULL DEFAULT 'pending',
  visibility event_visibility NOT NULL DEFAULT 'private',
  event_verification_status event_verification_status NOT NULL DEFAULT 'unverified',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  source_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  official_website TEXT,
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  source_type source_type NOT NULL DEFAULT 'other',
  source_url TEXT NOT NULL,
  source_title TEXT NOT NULL,
  source_organization TEXT,
  source_date DATE,
  description TEXT,
  evidence_file TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  data_snapshot JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_pending_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  proposed_data JSONB NOT NULL,
  changed_fields TEXT[] NOT NULL,
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  change_type TEXT NOT NULL,
  changed_fields TEXT[] NOT NULL,
  previous_data JSONB NOT NULL,
  new_data JSONB NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reporter_name TEXT,
  reporter_email TEXT,
  report_type report_type NOT NULL,
  description TEXT NOT NULL,
  evidence_url TEXT,
  status report_status NOT NULL DEFAULT 'open',
  resolution_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. NOTIFICATIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES profiles(id),
  actor_role user_role NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT,
  previous_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. POSTGRESQL FUNCTIONS & TRIGGERS

-- Function: Check if user has permission to publish event directly
CREATE OR REPLACE FUNCTION can_publish_event(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_org_verified org_verification_status;
  v_org_status organization_status;
  v_direct_pub BOOLEAN;
  v_member_active BOOLEAN;
  v_user_role user_role;
BEGIN
  -- Super admins and admins can always publish
  SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;
  IF v_user_role IN ('super_admin', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- If no organization is specified, direct publishing is false for normal users
  IF p_org_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check organization state
  SELECT verification_status, organization_status, direct_publishing_enabled
  INTO v_org_verified, v_org_status, v_direct_pub
  FROM organizations
  WHERE id = p_org_id;

  IF v_org_verified != 'verified' OR v_org_status != 'active' OR v_direct_pub != TRUE THEN
    RETURN FALSE;
  END IF;

  -- Check active membership
  SELECT is_active INTO v_member_active
  FROM organization_members
  WHERE organization_id = p_org_id AND user_id = p_user_id;

  IF v_member_active IS TRUE THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: When an organization is suspended, immediately revoke direct publishing
CREATE OR REPLACE FUNCTION trg_fn_revoke_direct_publishing_on_suspension()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_status = 'suspended' AND OLD.organization_status != 'suspended' THEN
    NEW.direct_publishing_enabled := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_org_suspension_revoke_direct_pub
BEFORE UPDATE OF organization_status ON organizations
FOR EACH ROW
EXECUTE FUNCTION trg_fn_revoke_direct_publishing_on_suspension();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Events: Public can ONLY read published, public, non-deleted events
CREATE POLICY "Public read published events"
ON events FOR SELECT
TO public
USING (
  status = 'published'
  AND visibility = 'public'
  AND deleted_at IS NULL
);

-- Events: Authenticated organization members can read their own organization's events
CREATE POLICY "Org members read own events"
ON events FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = TRUE
  )
  OR created_by = auth.uid()
);

-- Events: Admins have full access
CREATE POLICY "Admins full access events"
ON events FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'moderator', 'editor'))
);

-- Organization Documents: Protected private bucket access
CREATE POLICY "Admins read all org documents"
ON organization_documents FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

CREATE POLICY "Org members read own documents"
ON organization_documents FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = TRUE
  )
);

-- Reports: Only admins and moderators can read reports
CREATE POLICY "Admins read reports"
ON event_reports FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'moderator'))
);

-- Notifications: Users only read their own notifications
CREATE POLICY "Users read own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Audit logs: Append only, admins read only
CREATE POLICY "Admins read audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);
