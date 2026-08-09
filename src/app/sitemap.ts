import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { routing } from '@/i18n/routing';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ezidievents.org';
  const publishedEvents = await db.events.findPublicEvents();
  const verifiedOrgs = await db.organizations.findVerifiedPublic();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    // Static routes
    const staticRoutes = ['', '/events', '/map', '/organizations', '/countries', '/about', '/privacy', '/terms'];

    for (const route of staticRoutes) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' || route === '/events' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }

    // Dynamic Published Events
    for (const event of publishedEvents) {
      entries.push({
        url: `${baseUrl}/${locale}/events/${event.slug}`,
        lastModified: new Date(event.updated_at || event.created_at),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }

    // Dynamic Verified Organizations
    for (const org of verifiedOrgs) {
      entries.push({
        url: `${baseUrl}/${locale}/organizations/${org.slug}`,
        lastModified: new Date(org.updated_at || org.created_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
