// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN COS — Ward Round engine
//
// The ward round is a WORKFLOW, not a list. This library:
//   • assembles the round from a ward census;
//   • prioritises patients into Immediate / New / Requires-decision / Stable;
//   • generates a verifiable DRAFT clinical summary from known observations
//     (never a signed opinion — the clinician verifies then signs);
//   • derives follow-up tasks from the plan.
// ═══════════════════════════════════════════════════════════════════════════════
import type {
  AmexanNoteStructured,
  ClinicalObservation,
  TriggerFlag,
  VitalsSnapshot,
  WorkspacePatient,
} from './types';

export type RoundBucket = 'immediate' | 'new' | 'decision' | 'stable';

export interface RoundPatient extends WorkspacePatient {
  bucket: RoundBucket;
  priorityReason: string[];
  triggers: TriggerFlag[];
  vitals?: VitalsSnapshot;
  observations: ClinicalObservation[];
  /** Days since admission. */
  episodeDay: number;
  pendingInvestigations?: boolean;
  treatmentPlanIncomplete?: boolean;
  sinceLast: string[];
  draft?: AmexanNoteStructured;
}

export interface RoundInput extends WorkspacePatient {
  triggers?: TriggerFlag[];
  episodeDay?: number;
  pendingInvestigations?: boolean;
  treatmentPlanIncomplete?: boolean;
}

export interface RoundAssembly {
  patients: RoundPatient[];
  counts: Record<RoundBucket | 'total', number>;
  pendingRequiringDecision: number;
}

/** Bucket a patient for round prioritisation. */
export function bucketPatient(p: RoundInput): RoundBucket {
  const hasCritical = (p.triggers ?? []).some((t) => t.severy === 'critical');
  if (hasCritical) return 'immediate';
  if ((p.episodeDay ?? 99) < 1) return 'new';
  if (p.pendingInvestigations || p.treatmentPlanIncomplete) return 'decision';
  return 'stable';
}

/** Assemble a ward round from patient rows. */
export function assembleRound(input: RoundInput[]): RoundAssembly {
  const counts: Record<RoundBucket, number> = { immediate: 0, new: 0, decision: 0, stable: 0 };
  const order: RoundBucket[] = ['immediate', 'new', 'decision', 'stable'];
  const patients: RoundPatient[] = input.map((p) => {
    const bucket = bucketPatient(p);
    counts[bucket]++;
    return {
      ...p,
      bucket,
      episodeDay: p.episodeDay ?? 0,
      priorityReason: [],
      triggers: p.triggers ?? [],
      observations: [],
      sinceLast: [],
    };
  });
  // buckets re-ordered after assembly; capture final counts (bucketPatient may
  // differ from assemble-time status). Keep deterministic ordering.
  const finalCounts = { immediate: 0, new: 0, decision: 0, stable: 0 } as Record<RoundBucket, number>;
  for (const p of patients) finalCounts[p.bucket]++;
  const sorted: RoundPatient[] = [];
  for (const b of order) sorted.push(...patients.filter((p) => p.bucket === b));
  const pending = patients.filter((p) => p.bucket === 'decision' || p.bucket === 'immediate').length;
  return { patients: sorted, counts: { ...finalCounts, total: patients.length }, pendingRequiringDecision: pending };
}

/** Build a substantiated clinical summary. Never auto-signs. */
export function draftNoteFrom(
  since: string[],
  vitals: VitalsSnapshot | undefined,
  problems: string[],
  admissionScript?: string,
): AmexanNoteStructured {
  const objectiveline = () => {
    if (!vitals) return 'Vitals not yet recorded for this review.';
    const pairs: string[] = [];
    if (vitals.spo2) pairs.push(`SpO2 ${vitals.spo2}`);
    if (vitals.rr) pairs.push(`RR ${vitals.rr}`);
    if (vitals.temp) pairs.push(`Temp ${vitals.temp}`);
    if (vitals.bp) pairs.push(`BP ${vitals.bp}`);
    if (vitals.hr) pairs.push(`HR ${vitals.hr}`);
    return pairs.length ? pairs.join(' · ') : 'Vitals recorded.';
  };
  return {
    subjective: since.length ? since.join(' ') : (admissionScript || 'No new symptoms documented since last review.'),
    objective: objectiveline(),
    assessment: problems.length ? `Active problems: ${problems.join('; ')}.` : 'Assessment pending clinician input.',
    plan: '',
  };
}

/** Extract follow-up tasks from a signed plan. */
export function extractFollowUps(plan: string): string[] {
  return plan
    .split(/\n|;/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && /\b(repeat|review|escalate|refer|rescan|check|monitor|d\/c|discharge|follow)\b/i.test(s));
}

export function defaultReviewInterval(p: RoundPatient): string {
  if (p.bucket === 'immediate') return '12 hours';
  if (p.bucket === 'new') return '24 hours';
  if (p.bucket === 'decision') return '24 hours';
  return 'Daily';
}

export function flag(severity: TriggerFlag['severy'], label: string, detail?: string): TriggerFlag {
  return { severy: severity, label, detail };
}