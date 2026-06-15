import type { TimelineEvent, ChiefComplaint } from './types';

export interface TimelineResult {
  events: TimelineEvent[];
  chronology: string;
  orderDescription: string;
}

export function buildTimeline(complaints: ChiefComplaint[]): TimelineResult {
  const events: TimelineEvent[] = [];
  const now = new Date();

  for (const c of complaints) {
    const daysAgo = c.durationDays;
    const eventDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    events.push({
      id: `tl_${c.id}`,
      date: eventDate.toISOString().split('T')[0],
      relativeTime: `${c.duration} ago`,
      description: `${c.label} started`,
      symptomId: c.symptomId,
    });
  }

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let chronology = '';
  if (events.length === 0) {
    chronology = 'No timeline events recorded.';
    return { events, chronology, orderDescription: '' };
  }

  const orderDesc = events
    .map((e, i) => `${e.relativeTime}: ${e.description}`)
    .join('\n');

  if (events.length === 1) {
    chronology = `The illness began ${events[0].relativeTime} when the patient developed ${events[0].description.toLowerCase()}.`;
  } else {
    const first = events[0];
    const last = events[events.length - 1];
    const middle = events.slice(1, -1)
      .map(e => `${e.relativeTime}, ${e.description.toLowerCase()}`)
      .join(', ');
    chronology = `The illness began ${first.relativeTime} when the patient developed ${first.description.toLowerCase()}.`;
    if (middle) {
      chronology += ` This was followed ${middle}.`;
    }
    chronology += ` The most recent symptom, ${last.description.toLowerCase()}, developed ${last.relativeTime}.`;
  }

  return { events, chronology, orderDescription: orderDesc };
}

export function addTimelineEvent(events: TimelineEvent[], description: string, relativeTime: string): TimelineEvent[] {
  const now = new Date();
  const event: TimelineEvent = {
    id: `tl_manual_${events.length + 1}_${Date.now()}`,
    date: now.toISOString().split('T')[0],
    relativeTime,
    description,
  };
  return [...events, event].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
