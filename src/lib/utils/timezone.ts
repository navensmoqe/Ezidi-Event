export const POPULAR_TIMEZONES = [
  { value: 'Europe/Berlin', label: 'Berlin / Hanover / Frankfurt (CET/CEST)' },
  { value: 'Asia/Baghdad', label: 'Baghdad / Erbil / Lalish / Mosul (AST)' },
  { value: 'Europe/Paris', label: 'Paris / Lyon (CET/CEST)' },
  { value: 'Europe/London', label: 'London / Manchester (GMT/BST)' },
  { value: 'America/New_York', label: 'New York / Lincoln / Chicago (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago / Dallas (CST/CDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles / Seattle (PST/PDT)' },
  { value: 'Australia/Sydney', label: 'Sydney / Melbourne (AEST/AEDT)' },
  { value: 'Asia/Tbilisi', label: 'Tbilisi / Yerevan (GET)' },
  { value: 'Asia/Yerevan', label: 'Yerevan (AMT)' },
  { value: 'UTC', label: 'Universal Coordinated Time (UTC)' },
];

export function isValidIanaTimeZone(timeZone: string): boolean {
  if (!timeZone || typeof timeZone !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export const validateIanaTimezone = isValidIanaTimeZone;

export function formatEventDateTime(
  dateStr: string,
  timeStr: string,
  timeZone: string,
  locale: string = 'en'
): { formattedDate: string; formattedTime: string; timeZoneAbbr: string } {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute));

    const dateFormatter = new Intl.DateTimeFormat(locale, {
      timeZone: isValidIanaTimeZone(timeZone) ? timeZone : 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const timeFormatter = new Intl.DateTimeFormat(locale, {
      timeZone: isValidIanaTimeZone(timeZone) ? timeZone : 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const timeZoneAbbrFormatter = new Intl.DateTimeFormat(locale, {
      timeZone: isValidIanaTimeZone(timeZone) ? timeZone : 'UTC',
      timeZoneName: 'short',
    });

    const parts = timeZoneAbbrFormatter.formatToParts(dateObj);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');

    return {
      formattedDate: dateFormatter.format(dateObj),
      formattedTime: timeFormatter.format(dateObj),
      timeZoneAbbr: tzPart ? tzPart.value : timeZone,
    };
  } catch {
    return {
      formattedDate: dateStr,
      formattedTime: timeStr,
      timeZoneAbbr: timeZone,
    };
  }
}

export function formatViewerLocalTime(
  dateStr: string,
  timeStr: string,
  eventTimeZone: string
): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const viewerTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (viewerTz === eventTimeZone) return null; // Same time zone, no conversion needed

    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    // Approximate ISO string creation with event timezone
    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute));

    const timeFormatter = new Intl.DateTimeFormat(undefined, {
      timeZone: viewerTz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    });

    return `${timeFormatter.format(dateObj)} (${viewerTz})`;
  } catch {
    return null;
  }
}
