import { Organization, EventItem, UserProfile, EventCategory } from '@/types/database';

const CLOUD_CONFIG = {
  ORGS_INDEX_ID: 'ff8081819f7e10ae019fed035ddf1f7f',
  EVENTS_INDEX_ID: 'ff8081819f7e10ae019fed0393c01f81',
  BASE_URL: 'https://api.restful-api.dev/objects',
};

async function getIndexIds(indexObjectId: string): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${CLOUD_CONFIG.BASE_URL}/${indexObjectId}`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const json = await res.json();
    if (json && json.data && Array.isArray(json.data.ids)) {
      return json.data.ids;
    }
    return [];
  } catch {
    return [];
  }
}

async function addIdToIndex(indexObjectId: string, indexName: string, newId: string): Promise<boolean> {
  try {
    const existingIds = await getIndexIds(indexObjectId);
    if (!existingIds.includes(newId)) {
      const updatedIds = [newId, ...existingIds].slice(0, 100);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${CLOUD_CONFIG.BASE_URL}/${indexObjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: indexName,
          data: { ids: updatedIds },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    }
    return true;
  } catch {
    return false;
  }
}

export const CloudSync = {
  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    try {
      const ids = await getIndexIds(CLOUD_CONFIG.ORGS_INDEX_ID);
      if (ids.length === 0) return [];

      const query = ids.map((id) => `id=${id}`).join('&');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(`${CLOUD_CONFIG.BASE_URL}?${query}`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((it: any) => ({
          ...it.data,
          cloud_id: it.id,
        })) as Organization[];
      }
      return [];
    } catch {
      return [];
    }
  },

  async saveOrganization(org: Organization): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(CLOUD_CONFIG.BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `ezidi_org_${org.id}`,
          data: org,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const createdObj = await res.json();
        if (createdObj && createdObj.id) {
          await addIdToIndex(CLOUD_CONFIG.ORGS_INDEX_ID, 'ezidi_index_orgs', createdObj.id);
        }
      }
    } catch {}
  },

  async updateOrganization(orgId: string, updates: Partial<Organization>): Promise<void> {
    try {
      const all = await this.getOrganizations();
      const target = all.find((o) => o.id === orgId);
      if (target && (target as any).cloud_id) {
        const cloudId = (target as any).cloud_id;
        const merged = { ...target, ...updates };
        await fetch(`${CLOUD_CONFIG.BASE_URL}/${cloudId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `ezidi_org_${orgId}`,
            data: merged,
          }),
        });
      }
    } catch {}
  },

  // Events
  async getEvents(): Promise<EventItem[]> {
    try {
      const ids = await getIndexIds(CLOUD_CONFIG.EVENTS_INDEX_ID);
      if (ids.length === 0) return [];

      const query = ids.map((id) => `id=${id}`).join('&');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(`${CLOUD_CONFIG.BASE_URL}?${query}`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((it: any) => ({
          ...it.data,
          cloud_id: it.id,
        })) as EventItem[];
      }
      return [];
    } catch {
      return [];
    }
  },

  async saveEvent(event: EventItem): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(CLOUD_CONFIG.BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `ezidi_event_${event.id}`,
          data: event,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const createdObj = await res.json();
        if (createdObj && createdObj.id) {
          await addIdToIndex(CLOUD_CONFIG.EVENTS_INDEX_ID, 'ezidi_index_events', createdObj.id);
        }
      }
    } catch {}
  },

  async updateEvent(eventId: string, updates: Partial<EventItem>): Promise<void> {
    try {
      const all = await this.getEvents();
      const target = all.find((e) => e.id === eventId);
      if (target && (target as any).cloud_id) {
        const cloudId = (target as any).cloud_id;
        const merged = { ...target, ...updates };
        await fetch(`${CLOUD_CONFIG.BASE_URL}/${cloudId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `ezidi_event_${eventId}`,
            data: merged,
          }),
        });
      }
    } catch {}
  },

  // Fallbacks
  async getUsers(): Promise<UserProfile[]> {
    return [];
  },
  async saveUser(user: UserProfile): Promise<void> {},
  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {},
  async deleteUser(userId: string): Promise<void> {},
  async getCategories(): Promise<EventCategory[]> {
    return [];
  },
  async saveCategory(cat: EventCategory): Promise<void> {},
  async updateCategory(catId: string, updates: Partial<EventCategory>): Promise<void> {},
  async deleteCategory(catId: string): Promise<void> {},
};
