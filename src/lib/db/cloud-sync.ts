import { Organization, EventItem, UserProfile, EventCategory } from '@/types/database';

const CLOUD_CONFIG = {
  ORGS_ID: 'ff8081819f7e10ae019fe890ea9517eb',
  EVENTS_ID: 'ff8081819f7e10ae019fe890ebc917ec',
  USERS_ID: 'ff8081819f7e10ae019fe890ecdf17ed',
  CATS_ID: 'ff8081819f7e10ae019fe890ee1d17ee',
  BASE_URL: 'https://api.restful-api.dev/objects',
};

async function fetchCloudItems<T>(objectId: string): Promise<T[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${CLOUD_CONFIG.BASE_URL}/${objectId}`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const json = await res.json();
    if (json && json.data && Array.isArray(json.data.items)) {
      return json.data.items as T[];
    }
    return [];
  } catch {
    return [];
  }
}

async function saveCloudItems<T>(objectId: string, name: string, items: T[]): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${CLOUD_CONFIG.BASE_URL}/${objectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        data: { items: items.slice(0, 100) }, // keep latest 100 items
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

export const CloudSync = {
  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    return await fetchCloudItems<Organization>(CLOUD_CONFIG.ORGS_ID);
  },

  async saveOrganization(org: Organization): Promise<void> {
    const existing = await this.getOrganizations();
    const filtered = existing.filter((o) => o.id !== org.id);
    const updated = [org, ...filtered];
    await saveCloudItems(CLOUD_CONFIG.ORGS_ID, 'ezidi_store_organizations_global', updated);
  },

  async updateOrganization(orgId: string, updates: Partial<Organization>): Promise<void> {
    const existing = await this.getOrganizations();
    const updated = existing.map((o) => (o.id === orgId ? { ...o, ...updates } : o));
    await saveCloudItems(CLOUD_CONFIG.ORGS_ID, 'ezidi_store_organizations_global', updated);
  },

  // Events
  async getEvents(): Promise<EventItem[]> {
    return await fetchCloudItems<EventItem>(CLOUD_CONFIG.EVENTS_ID);
  },

  async saveEvent(event: EventItem): Promise<void> {
    const existing = await this.getEvents();
    const filtered = existing.filter((e) => e.id !== event.id);
    const updated = [event, ...filtered];
    await saveCloudItems(CLOUD_CONFIG.EVENTS_ID, 'ezidi_store_events_global', updated);
  },

  async updateEvent(eventId: string, updates: Partial<EventItem>): Promise<void> {
    const existing = await this.getEvents();
    const updated = existing.map((e) => (e.id === eventId ? { ...e, ...updates } : e));
    await saveCloudItems(CLOUD_CONFIG.EVENTS_ID, 'ezidi_store_events_global', updated);
  },

  // Users
  async getUsers(): Promise<UserProfile[]> {
    return await fetchCloudItems<UserProfile>(CLOUD_CONFIG.USERS_ID);
  },

  async saveUser(user: UserProfile): Promise<void> {
    const existing = await this.getUsers();
    const filtered = existing.filter((u) => u.id !== user.id);
    const updated = [user, ...filtered];
    await saveCloudItems(CLOUD_CONFIG.USERS_ID, 'ezidi_store_users_global', updated);
  },

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const existing = await this.getUsers();
    const updated = existing.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    await saveCloudItems(CLOUD_CONFIG.USERS_ID, 'ezidi_store_users_global', updated);
  },

  async deleteUser(userId: string): Promise<void> {
    const existing = await this.getUsers();
    const updated = existing.filter((u) => u.id !== userId);
    await saveCloudItems(CLOUD_CONFIG.USERS_ID, 'ezidi_store_users_global', updated);
  },

  // Categories
  async getCategories(): Promise<EventCategory[]> {
    return await fetchCloudItems<EventCategory>(CLOUD_CONFIG.CATS_ID);
  },

  async saveCategory(cat: EventCategory): Promise<void> {
    const existing = await this.getCategories();
    const filtered = existing.filter((c) => c.id !== cat.id);
    const updated = [cat, ...filtered];
    await saveCloudItems(CLOUD_CONFIG.CATS_ID, 'ezidi_store_categories_global', updated);
  },

  async updateCategory(catId: string, updates: Partial<EventCategory>): Promise<void> {
    const existing = await this.getCategories();
    const updated = existing.map((c) => (c.id === catId ? { ...c, ...updates } : c));
    await saveCloudItems(CLOUD_CONFIG.CATS_ID, 'ezidi_store_categories_global', updated);
  },

  async deleteCategory(catId: string): Promise<void> {
    const existing = await this.getCategories();
    const updated = existing.filter((c) => c.id !== catId);
    await saveCloudItems(CLOUD_CONFIG.CATS_ID, 'ezidi_store_categories_global', updated);
  },
};
