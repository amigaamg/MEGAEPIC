// ── Timeline Engine ─────────────────────────────────────────────
// RULE H7: Every answer updates the timeline.
// RULE H8: Timeline integrates ALL symptoms into one chronological story.
// RULE H9: Symptoms are sorted by onset, not entry order.
// RULE C7: Automatic chronology by onset.

import type { SymptomInstance, TimelineEvent, HpiState } from './types';

// ── Rule: Timeline is always visible ────────────────────────────
// Every symptom and event has a relative day from the earliest onset.

export interface TimelineEntry {
  id: string;
  relativeDay: number;
  relativeLabel: string;
  symptomId?: string;
  eventType: 'symptom_onset' | 'symptom_change' | 'intervention' | 'milestone';
  label: string;
  detail: string;
  severity?: number;
}

// ── Timeline Engine ─────────────────────────────────────────────
export function buildTimeline(symptoms: SymptomInstance[], sharedData: Record<string, any>): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  // Find earliest onset day across all symptoms
  const earliestDay = Math.min(...symptoms.map(s => s.metadata.firstAppearanceDay), 0);

  for (const symptom of symptoms) {
    // Add onset event
    entries.push({
      id: `onset-${symptom.id}`,
      relativeDay: symptom.metadata.firstAppearanceDay - earliestDay,
      relativeLabel: dayToLabel(symptom.metadata.firstAppearanceDay - earliestDay),
      symptomId: symptom.id,
      eventType: 'symptom_onset',
      label: `${symptom.label} began`,
      detail: symptom.verbatim,
      severity: symptom.severity,
    });

    // Add timeline events from symptom
    for (const event of symptom.timeline) {
      entries.push({
        id: event.id,
        relativeDay: event.relativeDay - earliestDay,
        relativeLabel: dayToLabel(event.relativeDay - earliestDay),
        symptomId: event.symptomId,
        eventType: 'symptom_change',
        label: event.label,
        detail: event.detail,
      });
    }
  }

  // Add care-sought events from shared data
  if (sharedData.careBeforePresentation?.firstSought) {
    entries.push({
      id: 'care-first-sought',
      relativeDay: -1,
      relativeLabel: 'Before presentation',
      eventType: 'intervention',
      label: 'First sought care',
      detail: sharedData.careBeforePresentation.firstSought,
    });
  }

  // Sort by relative day, then by onset priority
  entries.sort((a, b) => {
    if (a.relativeDay !== b.relativeDay) return a.relativeDay - b.relativeDay;
    // Symptom onsets before changes
    if (a.eventType === 'symptom_onset' && b.eventType !== 'symptom_onset') return -1;
    if (a.eventType !== 'symptom_onset' && b.eventType === 'symptom_onset') return 1;
    return 0;
  });

  return entries;
}

// ── RULE C7: Automatic chronology ──────────────────────────────
export function sortSymptomsByOnset(symptoms: SymptomInstance[]): SymptomInstance[] {
  return [...symptoms].sort((a, b) => a.metadata.firstAppearanceDay - b.metadata.firstAppearanceDay);
}

// ── RULE H6: Timeline follows narrative logic ──────────────────
export function timelineToNarrative(entries: TimelineEntry[]): string {
  if (entries.length === 0) return '';

  const parts: string[] = [];
  let currentDay = -999;

  for (const entry of entries) {
    if (entry.relativeDay !== currentDay) {
      currentDay = entry.relativeDay;
      parts.push(`\n${entry.relativeLabel}:`);
    }
    parts.push(`  • ${entry.label} — ${entry.detail}`);
  }

  return parts.join('\n');
}

// ── Helpers ─────────────────────────────────────────────────────
function dayToLabel(day: number): string {
  if (day === 0) return 'Day 0 — Onset';
  if (day === 1) return 'Day 1';
  if (day === 2) return 'Day 2';
  if (day === 3) return 'Day 3';
  if (day > 0) return `Day ${day}`;
  return `${Math.abs(day)} day(s) before onset`;
}

// ── RULE H16: Completeness check for timeline ──────────────────
export function isTimelineComplete(symptoms: SymptomInstance[]): boolean {
  if (symptoms.length === 0) return false;

  // Every symptom has at least onset recorded
  for (const symptom of symptoms) {
    if (symptom.metadata.firstAppearanceDay === undefined) return false;
  }

  return true;
}

// ── RULE: Timeline must be visible ✅ Built into UI contract ────

export function getTimelineSummary(state: HpiState): string {
  const entries = buildTimeline(state.symptoms, state.sharedData);

  const onsetInfo = entries
    .filter(e => e.eventType === 'symptom_onset')
    .map(e => `  ${e.relativeLabel}: ${e.label} (${e.detail})`)
    .join('\n');

  const changesInfo = entries
    .filter(e => e.eventType === 'symptom_change')
    .map(e => `  ${e.relativeLabel}: ${e.detail}`)
    .join('\n');

  return [
    'CHRONOLOGICAL TIMELINE:',
    '',
    'Symptom Onsets:',
    onsetInfo,
    '',
    changesInfo ? `Symptom Changes:\n${changesInfo}` : '',
  ].filter(Boolean).join('\n');
}
