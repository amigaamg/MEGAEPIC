// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Master Timeline Engine
// Single authoritative timeline for the entire encounter.
// Every engine reads from this. No engine maintains its own timeline.
// ═══════════════════════════════════════════════════════════════════════════════

import type { TimelineEvent, TimelineEventType, Certainty } from '../encounter-brain/types';

export interface TimelineState {
  events: TimelineEvent[];
  lastUpdated: number;
  owner: 'timeline_engine';
}

export function createTimeline(): TimelineState {
  return {
    events: [],
    lastUpdated: Date.now(),
    owner: 'timeline_engine',
  };
}

export function addEvent(
  timeline: TimelineState,
  event: Omit<TimelineEvent, 'id' | 'owner'>,
): TimelineState {
  const newEvent: TimelineEvent = {
    ...event,
    id: generateEventId(),
    owner: 'timeline_engine',
  };
  return {
    ...timeline,
    events: [...timeline.events, newEvent].sort((a, b) => sortByDate(a, b)),
    lastUpdated: Date.now(),
  };
}

export function addEvents(
  timeline: TimelineState,
  events: Omit<TimelineEvent, 'id' | 'owner'>[],
): TimelineState {
  const newEvents: TimelineEvent[] = events.map(e => ({
    ...e,
    id: generateEventId(),
    owner: 'timeline_engine' as const,
  }));
  return {
    ...timeline,
    events: [...timeline.events, ...newEvents].sort((a, b) => sortByDate(a, b)),
    lastUpdated: Date.now(),
  };
}

export function updateEvent(
  timeline: TimelineState,
  eventId: string,
  updates: Partial<TimelineEvent>,
): TimelineState {
  return {
    ...timeline,
    events: timeline.events.map(e =>
      e.id === eventId ? { ...e, ...updates } : e
    ),
    lastUpdated: Date.now(),
  };
}

export function getEventsByType(
  timeline: TimelineState,
  type: TimelineEventType,
): TimelineEvent[] {
  return timeline.events.filter(e => e.eventType === type);
}

export function getEventsBetween(
  timeline: TimelineState,
  startDate: string,
  endDate: string,
): TimelineEvent[] {
  return timeline.events.filter(e => {
    const d = new Date(e.date).getTime();
    return d >= new Date(startDate).getTime() && d <= new Date(endDate).getTime();
  });
}

export function getSymptomOnset(timeline: TimelineState): TimelineEvent | undefined {
  return timeline.events.find(e => e.eventType === 'symptom_onset');
}

export function getHealthSeekingTimeline(timeline: TimelineState): TimelineEvent[] {
  const healthTypes: TimelineEventType[] = [
    'health_seeking_action', 'self_medication', 'pharmacy_visit',
    'clinic_visit', 'health_centre_visit', 'hospital_visit',
    'admission', 'discharge', 'referral', 'transfer',
  ];
  return timeline.events.filter(e => healthTypes.includes(e.eventType));
}

export function generateTimelineNarrative(timeline: TimelineState): string {
  if (timeline.events.length === 0) return 'No timeline events recorded.';

  const parts: string[] = [];

  for (const event of timeline.events) {
    switch (event.eventType) {
      case 'symptom_onset':
        parts.push(`Symptoms began ${event.date}.`);
        break;
      case 'symptom_change':
        parts.push(`Symptoms changed: ${event.description} (${event.date}).`);
        break;
      case 'self_medication':
        parts.push(`Patient self-medicated with ${event.treatment || 'unknown'} at home.`);
        break;
      case 'pharmacy_visit':
        parts.push(`Visited pharmacy — received ${event.treatment || 'treatment'}.`);
        break;
      case 'clinic_visit':
        parts.push(`Attended ${event.facility || 'a clinic'} — ${(event.metadata as any)?.diagnosisGiven || 'evaluated'}.`);
        break;
      case 'hospital_visit':
        parts.push(`Presented to ${event.facility || 'hospital'} — ${(event.metadata as any)?.diagnosisGiven || 'evaluated'}.`);
        break;
      case 'admission':
        parts.push(`Admitted to ${event.facility || 'hospital'} on ${event.date}.`);
        break;
      case 'discharge':
        parts.push(`Discharged from ${event.facility || 'hospital'} on ${event.date}.`);
        break;
      case 'referral':
        parts.push(`Referred from ${event.facility || 'previous facility'} — ${(event.metadata as any)?.reason || 'reason not documented'}.`);
        break;
      case 'transfer':
        parts.push(`Transferred from ${event.facility || 'previous facility'} — ${(event.metadata as any)?.reason || 'reason not documented'}.`);
        break;
      case 'investigation':
        parts.push(`Investigation: ${event.description}.`);
        break;
      case 'diagnosis':
        parts.push(`Diagnosed with ${event.description}.`);
        break;
      case 'treatment':
        parts.push(`Treated with ${event.description}.`);
        break;
      case 'procedure':
      case 'surgery':
        parts.push(`${event.eventType === 'surgery' ? 'Surgery' : 'Procedure'}: ${event.description}.`);
        break;
      case 'complication':
        parts.push(`Complication: ${event.description}.`);
        break;
      case 'milestone':
        parts.push(`Milestone: ${event.description}.`);
        break;
      case 'follow_up':
        parts.push(`Follow-up: ${event.description}.`);
        break;
      default:
        parts.push(`${event.description}`);
    }
  }

  return parts.join(' ');
}

let eventCounter = 0;

function generateEventId(): string {
  return `tl_${Date.now()}_${++eventCounter}`;
}

function sortByDate(a: TimelineEvent, b: TimelineEvent): number {
  const aTime = new Date(a.date).getTime();
  const bTime = new Date(b.date).getTime();
  if (isNaN(aTime) && isNaN(bTime)) return 0;
  if (isNaN(aTime)) return -1;
  if (isNaN(bTime)) return 1;
  return aTime - bTime;
}
