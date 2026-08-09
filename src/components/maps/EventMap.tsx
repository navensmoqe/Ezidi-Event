'use client';

import React, { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { EventItem } from '@/types/database';
import { formatEventDateTime } from '@/lib/utils/timezone';

interface EventMapProps {
  events: EventItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedEventId?: string;
  onSelectEvent?: (event: EventItem) => void;
}

export function EventMap({
  events,
  center = [45.0, 15.0], // Centered between Europe and Middle East
  zoom = 3,
  height = '500px',
  selectedEventId,
  onSelectEvent,
}: EventMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const locale = useLocale();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Dynamically load Leaflet on client side
    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      // Import Leaflet CSS if not already loaded
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        attributionControl: true,
      });

      mapInstanceRef.current = map;

      // OpenStreetMap Carto Dark Tile Layer for sleek modern dark aesthetic
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Create Custom Gold Sun Pin Marker Icon
      const customSunIcon = L.divIcon({
        className: 'custom-ezidi-pin',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #FDB813 0%, #D4AF37 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 14px rgba(212, 175, 55, 0.6);
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span style="font-size: 14px;">☀️</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      // Filter: Strictly ensure only published public events with valid coordinates are mapped
      const validEvents = events.filter(
        (e) =>
          (e.status === 'published' || e.status === 'cancelled' || e.status === 'postponed') &&
          e.visibility === 'public' &&
          !e.deleted_at &&
          typeof e.latitude === 'number' &&
          typeof e.longitude === 'number'
      );

      const markersGroup = L.featureGroup();

      validEvents.forEach((event) => {
        const { formattedDate, formattedTime } = formatEventDateTime(
          event.date,
          event.start_time,
          event.timezone,
          locale
        );

        const marker = L.marker([event.latitude, event.longitude], {
          icon: customSunIcon,
        });

        const badgeHtml =
          event.event_verification_status === 'admin_verified'
            ? `<span style="background: rgba(6, 78, 59, 0.9); color: #6EE7B7; padding: 2px 6px; border-radius: 9999px; font-size: 11px; font-weight: 600;">✓ Admin Verified</span>`
            : event.event_verification_status === 'organization_verified'
            ? `<span style="background: rgba(120, 53, 15, 0.9); color: #FDE68A; padding: 2px 6px; border-radius: 9999px; font-size: 11px; font-weight: 600;">✓ Verified Org</span>`
            : `<span style="background: rgba(30, 58, 138, 0.9); color: #93C5FD; padding: 2px 6px; border-radius: 9999px; font-size: 11px;">Published</span>`;

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 240px; color: #F8FAFC;">
            <div style="margin-bottom: 6px;">${badgeHtml}</div>
            <h4 style="font-weight: 700; font-size: 14px; margin: 0 0 6px 0; color: #FFFFFF; line-height: 1.3;">
              ${event.title}
            </h4>
            <p style="font-size: 12px; color: #F59E0B; margin: 0 0 4px 0; font-weight: 500;">
              📅 ${formattedDate} • ⏰ ${formattedTime}
            </p>
            <p style="font-size: 12px; color: #94A3B8; margin: 0 0 10px 0;">
              📍 ${event.full_address}
            </p>
            <a href="/${locale}/events/${event.slug}" style="
              display: inline-block;
              width: 100%;
              text-align: center;
              padding: 6px 12px;
              background: #F59E0B;
              color: #0F172A;
              font-weight: 700;
              font-size: 12px;
              border-radius: 8px;
              text-decoration: none;
            ">View Event Details →</a>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectEvent) onSelectEvent(event);
        });

        markersGroup.addLayer(marker);
      });

      markersGroup.addTo(map);

      if (validEvents.length > 0) {
        map.fitBounds(markersGroup.getBounds(), { padding: [40, 40], maxZoom: 12 });
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events, center, zoom, locale, onSelectEvent]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden glass-panel border border-slate-800 shadow-2xl relative z-10"
    />
  );
}
