import {
  EventItem,
  Organization,
  EventCategory,
  Country,
  City,
  EventReport,
  AuditLog,
  NotificationItem,
  UserProfile,
  EventPendingChange,
  EventStatus,
} from '@/types/database';
import {
  INITIAL_COUNTRIES,
  INITIAL_CITIES,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_ORGANIZATIONS,
  INITIAL_EVENTS,
  INITIAL_PENDING_CHANGES,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from './mock-data';
import { isProduction } from '@/lib/config/env';

// In-memory data store for development & demo mode
class InMemoryDb {
  countries: Country[] = [...INITIAL_COUNTRIES];
  cities: City[] = [...INITIAL_CITIES];
  categories: EventCategory[] = [...INITIAL_CATEGORIES];
  users: UserProfile[] = [...INITIAL_USERS];
  organizations: Organization[] = [...INITIAL_ORGANIZATIONS];
  events: EventItem[] = [...INITIAL_EVENTS];
  pendingChanges: EventPendingChange[] = [...INITIAL_PENDING_CHANGES];
  reports: EventReport[] = [...INITIAL_REPORTS];
  auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
}

const memory = new InMemoryDb();

export interface PublicEventFilters {
  category?: string;
  country?: string;
  city?: string;
  organization?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  status?: string; // e.g. 'published', 'cancelled', 'postponed'
  sort?: 'upcoming' | 'newest' | 'date' | 'city';
}

export const db = {
  events: {
    async findPublicEvents(filters: PublicEventFilters = {}): Promise<EventItem[]> {
      let results = memory.events.filter(
        (e) =>
          (e.status === 'published' || e.status === 'cancelled' || e.status === 'postponed') &&
          e.visibility === 'public' &&
          !e.deleted_at
      );

      if (filters.category && filters.category !== 'all') {
        const cat = memory.categories.find((c) => c.slug === filters.category || c.id === filters.category);
        if (cat) results = results.filter((e) => e.category_id === cat.id);
      }

      if (filters.country && filters.country !== 'all') {
        const c = memory.countries.find((cnt) => cnt.code === filters.country || cnt.id === filters.country);
        if (c) results = results.filter((e) => e.country_id === c.id);
      }

      if (filters.city && filters.city !== 'all') {
        results = results.filter((e) => e.city_id === filters.city);
      }

      if (filters.organization && filters.organization !== 'all') {
        results = results.filter((e) => e.organization_id === filters.organization);
      }

      if (filters.status && filters.status !== 'all') {
        results = results.filter((e) => e.status === filters.status);
      }

      if (filters.dateFrom) {
        results = results.filter((e) => e.date >= filters.dateFrom!);
      }

      if (filters.dateTo) {
        results = results.filter((e) => e.date <= filters.dateTo!);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            (e.organizer_name && e.organizer_name.toLowerCase().includes(q)) ||
            (e.full_address && e.full_address.toLowerCase().includes(q))
        );
      }

      // Populate relations
      results = results.map((e) => ({
        ...e,
        category: memory.categories.find((c) => c.id === e.category_id),
        country: memory.countries.find((c) => c.id === e.country_id),
        city: memory.cities.find((c) => c.id === e.city_id),
        organization: e.organization_id
          ? memory.organizations.find((o) => o.id === e.organization_id)
          : undefined,
      }));

      // Sort
      if (filters.sort === 'newest') {
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else {
        // default upcoming / by event date
        results.sort((a, b) => a.date.localeCompare(b.date));
      }

      return results;
    },

    async findPublicBySlug(slug: string): Promise<EventItem | null> {
      const event = memory.events.find(
        (e) =>
          e.slug === slug &&
          (e.status === 'published' || e.status === 'cancelled' || e.status === 'postponed') &&
          e.visibility === 'public' &&
          !e.deleted_at
      );

      if (!event) return null;

      return {
        ...event,
        category: memory.categories.find((c) => c.id === event.category_id),
        country: memory.countries.find((c) => c.id === event.country_id),
        city: memory.cities.find((c) => c.id === event.city_id),
        organization: event.organization_id
          ? memory.organizations.find((o) => o.id === event.organization_id)
          : undefined,
      };
    },

    async findById(id: string): Promise<EventItem | null> {
      const event = memory.events.find((e) => e.id === id);
      if (!event) return null;
      return {
        ...event,
        category: memory.categories.find((c) => c.id === event.category_id),
        country: memory.countries.find((c) => c.id === event.country_id),
        city: memory.cities.find((c) => c.id === event.city_id),
        organization: event.organization_id
          ? memory.organizations.find((o) => o.id === event.organization_id)
          : undefined,
      };
    },

    async findAllAdmin(filters: { status?: string; search?: string } = {}): Promise<EventItem[]> {
      let results = [...memory.events];

      if (filters.status && filters.status !== 'all') {
        results = results.filter((e) => e.status === filters.status);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter((e) => e.title.toLowerCase().includes(q));
      }

      return results.map((e) => ({
        ...e,
        category: memory.categories.find((c) => c.id === e.category_id),
        country: memory.countries.find((c) => c.id === e.country_id),
        city: memory.cities.find((c) => c.id === e.city_id),
        organization: e.organization_id
          ? memory.organizations.find((o) => o.id === e.organization_id)
          : undefined,
      }));
    },

    async create(eventData: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>): Promise<EventItem> {
      const newEvent: EventItem = {
        ...eventData,
        id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memory.events.unshift(newEvent);
      return newEvent;
    },

    async update(id: string, updates: Partial<EventItem>): Promise<EventItem | null> {
      const index = memory.events.findIndex((e) => e.id === id);
      if (index === -1) return null;

      memory.events[index] = {
        ...memory.events[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return memory.events[index];
    },

    async softDelete(id: string): Promise<boolean> {
      const index = memory.events.findIndex((e) => e.id === id);
      if (index === -1) return false;
      memory.events[index].deleted_at = new Date().toISOString();
      return true;
    },

    async getPendingChanges(): Promise<EventPendingChange[]> {
      return memory.pendingChanges.filter((c) => c.status === 'pending');
    },

    async submitPendingChange(change: Omit<EventPendingChange, 'id' | 'created_at'>): Promise<EventPendingChange> {
      const newChange: EventPendingChange = {
        ...change,
        id: `change-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      memory.pendingChanges.push(newChange);
      return newChange;
    },

    async resolvePendingChange(
      changeId: string,
      status: 'approved' | 'rejected',
      adminId: string,
      notes?: string
    ): Promise<boolean> {
      const change = memory.pendingChanges.find((c) => c.id === changeId);
      if (!change) return false;

      change.status = status;
      change.reviewed_by = adminId;
      change.reviewed_at = new Date().toISOString();
      change.admin_notes = notes || null;

      if (status === 'approved') {
        const event = memory.events.find((e) => e.id === change.event_id);
        if (event) {
          Object.assign(event, change.proposed_data, { updated_at: new Date().toISOString() });
        }
      }

      return true;
    },

    async getPublicStatistics() {
      const published = memory.events.filter(
        (e) => e.status === 'published' && e.visibility === 'public' && !e.deleted_at
      );

      const uniqueCountries = new Set(published.map((e) => e.country_id));
      const uniqueCities = new Set(published.map((e) => e.city_id));
      const verifiedOrgs = memory.organizations.filter(
        (o) => o.verification_status === 'verified' && o.organization_status === 'active'
      );

      const today = new Date().toISOString().split('T')[0];
      const upcoming = published.filter((e) => e.date >= today);
      const todayEvents = published.filter((e) => e.date === today);

      return {
        totalPublishedEvents: published.length,
        totalCountries: uniqueCountries.size,
        totalCities: uniqueCities.size,
        verifiedOrganizations: verifiedOrgs.length,
        upcomingEventsCount: upcoming.length,
        todayEventsCount: todayEvents.length,
      };
    },
  },

  organizations: {
    async findVerifiedPublic(): Promise<Organization[]> {
      return memory.organizations.filter(
        (o) => o.verification_status === 'verified' && o.organization_status === 'active'
      );
    },

    async findBySlug(slug: string): Promise<Organization | null> {
      return memory.organizations.find((o) => o.slug === slug) || null;
    },

    async findById(id: string): Promise<Organization | null> {
      return memory.organizations.find((o) => o.id === id) || null;
    },

    async findAllAdmin(): Promise<Organization[]> {
      return [...memory.organizations];
    },

    async create(orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<Organization> {
      const newOrg: Organization = {
        ...orgData,
        id: `org-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memory.organizations.unshift(newOrg);
      return newOrg;
    },

    async update(id: string, updates: Partial<Organization>): Promise<Organization | null> {
      const index = memory.organizations.findIndex((o) => o.id === id);
      if (index === -1) return null;

      // Suspension trigger enforcement: If status set to suspended, direct publishing is immediately disabled
      if (updates.organization_status === 'suspended') {
        updates.direct_publishing_enabled = false;
      }

      memory.organizations[index] = {
        ...memory.organizations[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return memory.organizations[index];
    },

    async isMember(orgId: string, userId: string): Promise<boolean> {
      if (!orgId || !userId) return false;
      const user = memory.users.find((u) => u.id === userId);
      if (user && ['organization_owner', 'organization_admin', 'organization_editor'].includes(user.role)) {
        return true;
      }
      return false;
    },
  },

  categories: {
    async getAll(): Promise<EventCategory[]> {
      return [...memory.categories];
    },
    async findBySlug(slug: string): Promise<EventCategory | null> {
      return memory.categories.find((c) => c.slug === slug) || null;
    },
  },

  countries: {
    async getAll(): Promise<Country[]> {
      return [...memory.countries];
    },
  },

  cities: {
    async getAll(): Promise<City[]> {
      return [...memory.cities];
    },
    async findByCountry(countryId: string): Promise<City[]> {
      return memory.cities.filter((c) => c.country_id === countryId);
    },
  },

  reports: {
    async create(reportData: Omit<EventReport, 'id' | 'created_at' | 'status'>): Promise<EventReport> {
      const newReport: EventReport = {
        ...reportData,
        id: `report-${Date.now()}`,
        status: 'open',
        created_at: new Date().toISOString(),
      };
      memory.reports.unshift(newReport);
      return newReport;
    },

    async getAllAdmin(): Promise<EventReport[]> {
      return memory.reports.map((r) => ({
        ...r,
        event: memory.events.find((e) => e.id === r.event_id),
      }));
    },

    async updateStatus(id: string, status: EventReport['status'], resolutionNotes?: string, adminId?: string): Promise<boolean> {
      const report = memory.reports.find((r) => r.id === id);
      if (!report) return false;
      report.status = status;
      report.resolution_notes = resolutionNotes || null;
      report.reviewed_by = adminId || null;
      report.resolved_at = status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null;
      return true;
    },
  },

  audit: {
    async create(log: AuditLog): Promise<AuditLog> {
      memory.auditLogs.unshift(log);
      return log;
    },

    async getAll(limit: number = 100): Promise<AuditLog[]> {
      return memory.auditLogs.slice(0, limit);
    },
  },

  notifications: {
    async create(notif: NotificationItem): Promise<NotificationItem> {
      memory.notifications.unshift(notif);
      return notif;
    },

    async getByUser(userId: string): Promise<NotificationItem[]> {
      return memory.notifications.filter((n) => n.user_id === userId);
    },

    async markAsRead(id: string): Promise<boolean> {
      const n = memory.notifications.find((item) => item.id === id);
      if (!n) return false;
      n.is_read = true;
      return true;
    },
  },

  users: {
    async findById(id: string): Promise<UserProfile | null> {
      return memory.users.find((u) => u.id === id) || null;
    },

    async findByEmail(email: string): Promise<UserProfile | null> {
      return memory.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    },

    async findAdmins(): Promise<UserProfile[]> {
      return memory.users.filter((u) => u.role === 'super_admin' || u.role === 'admin');
    },

    async getAll(): Promise<UserProfile[]> {
      return [...memory.users];
    },

    async updateRole(userId: string, role: UserProfile['role']): Promise<boolean> {
      const user = memory.users.find((u) => u.id === userId);
      if (!user) return false;
      user.role = role;
      user.updated_at = new Date().toISOString();
      return true;
    },
  },
};
