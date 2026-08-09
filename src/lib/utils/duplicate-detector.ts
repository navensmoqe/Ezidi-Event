import { EventItem } from '@/types/database';

function calculateLevenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, () => Array(an + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;
  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

function stringSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  const distance = calculateLevenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface DuplicateCheckResult {
  isPotentialDuplicate: boolean;
  score: number; // 0 to 100
  matchedEvent?: EventItem;
  reasons: string[];
}

export function detectDuplicateEvent(
  newEvent: Partial<EventItem>,
  existingEvents: EventItem[]
): DuplicateCheckResult {
  let highestScore = 0;
  let matchedEvent: EventItem | undefined;
  const reasons: string[] = [];

  for (const existing of existingEvents) {
    if (existing.id === newEvent.id) continue; // Skip self

    let score = 0;
    const currentReasons: string[] = [];

    // Check exact or same date
    const sameDate = newEvent.date && existing.date === newEvent.date;
    if (sameDate) {
      score += 35;
      currentReasons.push('Identical event date');
    }

    // Title similarity
    if (newEvent.title && existing.title) {
      const sim = stringSimilarity(newEvent.title, existing.title);
      if (sim > 0.75) {
        score += Math.round(sim * 40);
        currentReasons.push(`High title similarity (${Math.round(sim * 100)}%)`);
      } else if (sim > 0.5) {
        score += 15;
      }
    }

    // Geographic check
    if (
      newEvent.latitude &&
      newEvent.longitude &&
      existing.latitude &&
      existing.longitude
    ) {
      const distKm = haversineDistanceKm(
        newEvent.latitude,
        newEvent.longitude,
        existing.latitude,
        existing.longitude
      );
      if (distKm < 0.5) {
        // Within 500 meters
        score += 25;
        currentReasons.push(`Same venue / within ${Math.round(distKm * 1000)}m`);
      } else if (distKm < 5 && sameDate) {
        score += 15;
        currentReasons.push(`Same city vicinity (${distKm.toFixed(1)}km)`);
      }
    } else if (newEvent.city_id && existing.city_id === newEvent.city_id && sameDate) {
      score += 15;
      currentReasons.push('Same city on same date');
    }

    if (score > highestScore) {
      highestScore = score;
      matchedEvent = existing;
      reasons.splice(0, reasons.length, ...currentReasons);
    }
  }

  return {
    isPotentialDuplicate: highestScore >= 60,
    score: Math.min(100, highestScore),
    matchedEvent,
    reasons,
  };
}
