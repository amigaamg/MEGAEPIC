// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Longitudinal Timeline Engine
// ═══════════════════════════════════════════════════════════════════════════════
// Every event in the patient's journey lives on one timeline.
// ═══════════════════════════════════════════════════════════════════════════════

import type { TimelineEvent, TimelineEventType } from './types';
import type { EncounterState } from '../encounter/encounterState';
import type { InvestigationOrder, ImagingOrder, MedicationCard } from '../encounter/encounterState';

// ── Build the full timeline from encounter state ─────────────────────────────

export function buildTimeline(
  encounter: EncounterState,
  existingTimeline?: TimelineEvent[],
): TimelineEvent[] {
  const events: TimelineEvent[] = existingTimeline ? [...existingTimeline] : [];
  const now = Date.now();
  const existingIds = new Set(events.map(e => e.id));

  // Admission event
  const admissionKey = `adm_${encounter.id}`;
  if (!existingIds.has(admissionKey)) {
    events.push({
      id: admissionKey,
      type: 'admission',
      timestamp: encounter.createdAt,
      title: 'Admission',
      description: `Patient admitted to ${encounter.demographics.departmentSlug || 'hospital'}`,
      source: 'system',
      relatedEncounterId: encounter.id,
      severity: 'info',
      metadata: {},
    });
  }

  // Investigations ordered
  for (const lab of encounter.investigations.labs) {
    const key = `lab_${lab.testId}`;
    if (!existingIds.has(key)) {
      events.push({
        id: key,
        type: 'investigation_ordered',
        timestamp: lab.orderedAt,
        title: `Lab: ${lab.testName}`,
        description: lab.result !== null ? `Result: ${lab.result} ${lab.unit}` : 'Pending',
        source: 'doctor',
        relatedEncounterId: encounter.id,
        severity: lab.flag === 'critical' ? 'critical' : lab.flag === 'abnormal' ? 'warning' : 'info',
        metadata: { testName: lab.testName, result: lab.result, flag: lab.flag },
      });
    }
  }

  // Imaging ordered
  for (const img of encounter.investigations.imaging) {
    const key = `img_${img.studyId}`;
    if (!existingIds.has(key)) {
      events.push({
        id: key,
        type: 'investigation_result',
        timestamp: img.completedAt || Date.now(),
        title: `Imaging: ${img.studyName}`,
        description: img.finding || 'Pending',
        source: 'doctor',
        relatedEncounterId: encounter.id,
        severity: 'info',
        metadata: { studyName: img.studyName, finding: img.finding },
      });
    }
  }

  // Medications prescribed
  for (const med of encounter.medications) {
    const key = `med_${med.id}`;
    if (!existingIds.has(key)) {
      events.push({
        id: key,
        type: 'medication_prescribed',
        timestamp: med.prescribedAt || now,
        title: `Prescribed: ${med.genericName}`,
        description: `${med.dose.value}${med.dose.unit} ${med.route} ${med.frequency} — ${med.indication}`,
        source: 'doctor',
        relatedEncounterId: encounter.id,
        severity: 'info',
        metadata: { medication: med.genericName, dose: med.dose, route: med.route },
      });
    }
  }

  // Disposition events
  if (encounter.disposition) {
    const key = `disp_${encounter.id}`;
    if (!existingIds.has(key)) {
      const type: TimelineEventType = encounter.disposition.type === 'admit_icu' ? 'icu_admission'
        : encounter.disposition.type === 'transfer' ? 'transfer'
        : encounter.disposition.type === 'discharge' ? 'discharge'
        : 'note';
      events.push({
        id: key,
        type,
        timestamp: now,
        title: `Disposition: ${encounter.disposition.type.replace(/_/g, ' ')}`,
        description: encounter.disposition.reason || `Patient disposition set to ${encounter.disposition.type}`,
        source: 'doctor',
        relatedEncounterId: encounter.id,
        severity: type === 'discharge' ? 'success' : 'info',
        metadata: { dispositionType: encounter.disposition.type },
      });
    }
  }

  // Sort by timestamp ascending
  events.sort((a, b) => a.timestamp - b.timestamp);

  return events;
}

// ── Filter timeline by type ──────────────────────────────────────────────────

export function filterTimelineByType(
  events: TimelineEvent[],
  types: TimelineEventType[],
): TimelineEvent[] {
  return events.filter(e => types.includes(e.type));
}

// ── Get events for a date range ──────────────────────────────────────────────

export function getEventsForDateRange(
  events: TimelineEvent[],
  startDate: number,
  endDate: number,
): TimelineEvent[] {
  return events.filter(e => e.timestamp >= startDate && e.timestamp <= endDate);
}

// ── Group events by date ─────────────────────────────────────────────────────

export function groupEventsByDate(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
  const grouped = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    const dateKey = new Date(event.timestamp).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey)!.push(event);
  }

  return grouped;
}

// ── Get notable events (warnings, critical results, complications) ───────────

export function getNotableEvents(events: TimelineEvent[]): TimelineEvent[] {
  return events.filter(e =>
    e.severity === 'critical' ||
    e.severity === 'warning' ||
    e.type === 'complication' ||
    e.type === 'icu_admission' ||
    e.type === 'transfer'
  ).sort((a, b) => b.timestamp - a.timestamp);
}

// ── Generate event description for display ───────────────────────────────────

export function formatEventTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffHours < 1) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export const EVENT_TYPE_LABELS: Record<TimelineEventType, string> = {
  admission: 'Admission',
  discharge: 'Discharge',
  transfer: 'Transfer',
  ward_round: 'Ward Round',
  consultation: 'Consultation',
  operation: 'Operation',
  procedure: 'Procedure',
  investigation_ordered: 'Investigation Ordered',
  investigation_result: 'Result Available',
  medication_prescribed: 'Medication Prescribed',
  medication_administered: 'Medication Given',
  medication_changed: 'Medication Changed',
  icu_admission: 'ICU Transfer',
  icu_discharge: 'ICU Discharge',
  complication: 'Complication',
  event: 'Event',
  note: 'Note',
  clinic_visit: 'Clinic Visit',
  emergency_visit: 'Emergency Visit',
  vaccination: 'Vaccination',
  milestone: 'Milestone',
  outcome: 'Outcome',
};
