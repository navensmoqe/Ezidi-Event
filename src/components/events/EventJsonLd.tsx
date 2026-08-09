import React from 'react';
import { EventItem } from '@/types/database';

interface EventJsonLdProps {
  event: EventItem;
}

export function EventJsonLd({ event }: EventJsonLdProps) {
  // Security guard: Never render Schema.org JSON-LD for non-published or private events
  if (event.status !== 'published' || event.visibility !== 'public' || event.deleted_at) {
    return null;
  }

  const startDate = `${event.date}T${event.start_time}:00`;
  const endDate = event.end_time ? `${event.date}T${event.end_time}:00` : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate,
    endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.full_address,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.street ? `${event.street} ${event.house_number || ''}`.trim() : event.full_address,
        addressLocality: event.city?.name_en || '',
        postalCode: event.postal_code || '',
        addressCountry: event.country?.code || '',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: event.latitude,
        longitude: event.longitude,
      },
    },
    image: event.poster_url ? [event.poster_url] : undefined,
    organizer: {
      '@type': 'Organization',
      name: event.organization?.name || event.organizer_name || 'Ezidi Community Organizer',
      url: event.organization?.website || undefined,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
