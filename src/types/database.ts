export type EventStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected'
  | 'cancelled'
  | 'postponed'
  | 'completed'
  | 'suspended';

export type EventVisibility = 'public' | 'private';

export type EventVerificationStatus =
  | 'unverified'
  | 'admin_verified'
  | 'organization_verified';

export type OrganizationStatus = 'active' | 'suspended' | 'inactive';

export type OrgVerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'suspended';

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'moderator'
  | 'editor'
  | 'organization_owner'
  | 'organization_admin'
  | 'organization_editor'
  | 'user';

export type SourceType =
  | 'official_organization'
  | 'official_website'
  | 'social_media'
  | 'news'
  | 'government'
  | 'community'
  | 'user_submitted'
  | 'other';

export type ReportType =
  | 'incorrect_information'
  | 'wrong_date'
  | 'wrong_location'
  | 'cancelled_event'
  | 'postponed_event'
  | 'fake_event'
  | 'duplicate_event'
  | 'misleading_information'
  | 'spam'
  | 'abuse'
  | 'other';

export type ReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export type Locale = 'en' | 'ar' | 'de' | 'fr';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
  is_active?: boolean;
  is_2fa_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  password?: string | null;
  logo?: string | null;
  cover_image?: string | null;
  description: string;
  organization_type: string;
  country_id: string;
  region_id?: string | null;
  city_id: string;
  postal_code?: string | null;
  street?: string | null;
  house_number?: string | null;
  full_address: string;
  latitude: number;
  longitude: number;
  website?: string | null;
  email: string;
  phone?: string | null;
  organization_status: OrganizationStatus;
  verification_status: OrgVerificationStatus;
  verified_at?: string | null;
  verified_by?: string | null;
  verification_notes?: string | null;
  direct_publishing_enabled: boolean;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
  // Localized fields
  name_ar?: string;
  name_de?: string;
  name_fr?: string;
  description_ar?: string;
  description_de?: string;
  description_fr?: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor';
  is_active: boolean;
  created_at: string;
}

export interface OrganizationDocument {
  id: string;
  organization_id: string;
  title: string;
  file_path: string; // Stored in private bucket
  file_type: string;
  file_size: number;
  is_verified: boolean;
  uploaded_by: string;
  created_at: string;
}

export interface EventCategory {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  name_de: string;
  name_fr: string;
  description?: string;
  icon_name?: string;
}

export interface Country {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
  name_de: string;
  name_fr: string;
}

export interface City {
  id: string;
  country_id: string;
  name_en: string;
  name_ar: string;
  name_de: string;
  name_fr: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface EventSource {
  id: string;
  event_id: string;
  source_type: SourceType;
  source_url: string;
  source_title: string;
  source_organization?: string | null;
  source_date?: string | null;
  description?: string | null;
  evidence_file?: string | null;
  is_public: boolean;
  created_by?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category_id: string;
  category?: EventCategory;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time?: string | null;
  timezone: string; // e.g. Europe/Berlin, Asia/Baghdad
  country_id: string;
  country?: Country;
  region_id?: string | null;
  city_id: string;
  city?: City;
  postal_code?: string | null;
  street?: string | null;
  house_number?: string | null;
  full_address: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
  organization_id?: string | null;
  organization?: Organization;
  organizer_name?: string | null;
  poster_url?: string | null;
  status: EventStatus;
  visibility: EventVisibility;
  event_verification_status: EventVerificationStatus;
  is_featured?: boolean;
  is_demo?: boolean;
  source_url?: string | null;
  sources?: EventSource[];
  contact_email?: string | null;
  contact_phone?: string | null;
  official_website?: string | null;
  deleted_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Localized fields
  title_ar?: string;
  title_de?: string;
  title_fr?: string;
  description_ar?: string;
  description_de?: string;
  description_fr?: string;
}

export interface EventVersion {
  id: string;
  event_id: string;
  version_number: number;
  data_snapshot: Partial<EventItem>;
  created_by: string;
  approved_by?: string | null;
  created_at: string;
}

export interface EventPendingChange {
  id: string;
  event_id: string;
  proposed_data: Partial<EventItem>;
  changed_fields: string[];
  submitted_by: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export interface EventChangeHistory {
  id: string;
  event_id: string;
  changed_by: string;
  change_type: string;
  changed_fields: string[];
  previous_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  reason?: string | null;
  created_at: string;
}

export interface EventReport {
  id: string;
  event_id: string;
  event?: EventItem;
  reporter_name?: string | null;
  reporter_email?: string | null;
  report_type: ReportType;
  description: string;
  evidence_url?: string | null;
  status: ReportStatus;
  resolution_notes?: string | null;
  reviewed_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_email?: string;
  actor_role: UserRole;
  action: string;
  entity_type: string;
  entity_id: string;
  reason?: string | null;
  previous_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface DirectPublishingHistory {
  id: string;
  organization_id: string;
  previous_value: boolean;
  new_value: boolean;
  changed_by: string;
  reason: string;
  created_at: string;
}

export interface OrgVerificationHistory {
  id: string;
  organization_id: string;
  previous_status: OrgVerificationStatus;
  new_status: OrgVerificationStatus;
  administrator_id: string;
  reason: string;
  notes?: string | null;
  created_at: string;
}
