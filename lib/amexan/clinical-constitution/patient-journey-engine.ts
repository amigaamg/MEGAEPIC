// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Constitution — Patient Journey Engine
// Book II Volume I: Lifelong longitudinal record management
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  ClinicalFact, ClinicalObservation, EpisodeOfCare, PatientJourney,
  CareNetwork, ConsentDirective, CareGap, PatientGoal,
  EpisodeType, EpisodeStatus, TrustLayer, Provenance,
  CareTeamMember,
} from './types';

import type { AmxUid } from '../constitution/types';

// ── Generate unique IDs ───────────────────────────────────────────────────────

let _counter = 0;
function uid(prefix: string): string {
  _counter++;
  return `${prefix}_${Date.now()}_${_counter}`;
}

// ── Create Fact ───────────────────────────────────────────────────────────────
// Creates a ClinicalFact with proper provenance and trust layer assignment.

export function createClinicalFact(params: {
  patientId: string;
  trustLayer: TrustLayer;
  category: string;
  observations: ClinicalObservation[];
  recordedBy: { id: string; name: string; role: string; type: Provenance['recordedBy']['type'] };
  organizationId?: string;
  organizationName?: string;
  departmentId?: string;
  departmentName?: string;
  source: string;
  sourceDevice?: string;
  encounterId?: string;
  episodeId?: string;
  timestamp?: number;
  documentIds?: string[];
}): ClinicalFact {
  const now = Date.now();
  const fact: ClinicalFact = {
    id: uid('cf'),
    patientId: params.patientId,
    episodeId: params.episodeId,
    encounterId: params.encounterId,
    trustLayer: params.trustLayer,
    category: params.category as any,
    provenance: {
      recordedBy: params.recordedBy,
      organizationId: params.organizationId,
      organizationName: params.organizationName,
      departmentId: params.departmentId,
      departmentName: params.departmentName,
      recordedAt: now,
      source: params.source,
      sourceDevice: params.sourceDevice,
      verified: params.trustLayer === 2,  // Layer 2 starts verified
      verifiedAt: params.trustLayer === 2 ? now : undefined,
      verifiedBy: params.trustLayer === 2 ? params.recordedBy.id : undefined,
    },
    timestamp: params.timestamp ?? now,
    recordedAt: now,
    observations: params.observations,
    documentIds: params.documentIds ?? [],
    status: 'active',
  };
  return fact;
}

// ── Create Episode of Care ────────────────────────────────────────────────────

export function createEpisode(params: {
  patientId: string;
  name: string;
  description: string;
  type: EpisodeType;
  startDate?: number;
  leadClinicianId?: string;
  leadClinicianName?: string;
  primaryOrganizationId?: string;
  primaryOrganizationName?: string;
  careTeam?: CareTeamMember[];
}): EpisodeOfCare {
  const now = Date.now();
  return {
    id: uid('ep'),
    patientId: params.patientId,
    name: params.name,
    description: params.description,
    type: params.type,
    startDate: params.startDate ?? now,
    status: 'active',
    leadClinicianId: params.leadClinicianId,
    leadClinicianName: params.leadClinicianName,
    primaryOrganizationId: params.primaryOrganizationId,
    primaryOrganizationName: params.primaryOrganizationName,
    careTeam: params.careTeam ?? [],
    goals: [],
    encounterIds: [],
    diagnosisIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ── Patient Journey ───────────────────────────────────────────────────────────

export function createPatientJourney(patientId: string): PatientJourney {
  return {
    patientId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    factCount: 0,
    episodeIds: [],
    careNetworkIds: [],
    consentIds: [],
  };
}

export function addFactToJourney(journey: PatientJourney): PatientJourney {
  return {
    ...journey,
    factCount: journey.factCount + 1,
    updatedAt: Date.now(),
  };
}

export function addEpisodeToJourney(journey: PatientJourney, episodeId: string): PatientJourney {
  return {
    ...journey,
    episodeIds: [...journey.episodeIds, episodeId],
    updatedAt: Date.now(),
  };
}

// ── Timeline Builder ──────────────────────────────────────────────────────────
// Builds the patient's longitudinal timeline from all facts,
// ordered chronologically and grouped by source.

export interface TimelineEntry {
  fact: ClinicalFact;
  episode?: EpisodeOfCare;
  trustLayerLabel: string;
}

export function buildTimeline(
  facts: ClinicalFact[],
  episodes: EpisodeOfCare[],
): TimelineEntry[] {
  const episodeMap = new Map(episodes.map(e => [e.id, e]));

  return facts
    .map(fact => ({
      fact,
      episode: fact.episodeId ? episodeMap.get(fact.episodeId) : undefined,
      trustLayerLabel: fact.trustLayer === 1 ? 'Patient-Contributed'
        : fact.trustLayer === 2 ? 'Clinician-Authenticated'
        : 'Verified External',
    }))
    .sort((a, b) => a.fact.timestamp - b.fact.timestamp);
}

// ── Filter Timeline by Trust Layer ────────────────────────────────────────────

export function filterByTrustLayer(
  timeline: TimelineEntry[],
  layers: TrustLayer[],
): TimelineEntry[] {
  return timeline.filter(e => layers.includes(e.fact.trustLayer));
}

// ── Care Gap Detection ────────────────────────────────────────────────────────

export function detectCareGaps(
  facts: ClinicalFact[],
  episodes: EpisodeOfCare[],
  patientAge: number,
  patientSex: string,
): CareGap[] {
  const gaps: CareGap[] = [];
  const now = Date.now();
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;

  // For each active chronic episode, check for monitoring gaps
  for (const episode of episodes) {
    if (episode.status !== 'active' && episode.status !== 'ongoing_chronic') continue;

    const episodeFacts = facts.filter(f => f.episodeId === episode.id);

    if (episode.type === 'chronic_disease') {
      // Check for recent HbA1c if diabetic
      const hasHbA1c = episodeFacts.some(f =>
        f.observations.some(o => o.concept === 'HbA1c')
      );
      if (!hasHbA1c || (hasHbA1c && episodeFacts.every(f =>
        f.timestamp < now - oneYearMs
      ))) {
        gaps.push({
          id: uid('gap'),
          patientId: episode.patientId,
          episodeId: episode.id,
          type: 'lab_missing',
          description: 'No recent HbA1c measurement',
          clinicalRationale: 'Annual HbA1c monitoring is recommended for diabetic patients',
          recommendedAction: 'Order HbA1c test',
          dueDate: now + 30 * 24 * 60 * 60 * 1000,
          status: 'open',
          detectedAt: now,
        });
      }

      // Check for retinal screening
      const hasRetinalScreening = episodeFacts.some(f =>
        f.category === 'external_imaging_report' || f.observations.some(o =>
          o.concept?.toLowerCase().includes('retinal') || o.concept?.toLowerCase().includes('fundus')
        )
      );
      if (!hasRetinalScreening) {
        gaps.push({
          id: uid('gap'),
          patientId: episode.patientId,
          episodeId: episode.id,
          type: 'screening_overdue',
          description: 'No retinal screening recorded',
          clinicalRationale: 'Annual retinal screening is recommended for diabetic patients',
          recommendedAction: 'Refer for retinal examination',
          dueDate: now + 60 * 24 * 60 * 60 * 1000,
          status: 'open',
          detectedAt: now,
        });
      }

      // Check for renal function
      const hasRenalFunction = episodeFacts.some(f =>
        f.observations.some(o =>
          ['Creatinine', 'eGFR', 'Urine_Albumin'].includes(o.concept)
        )
      );
      if (!hasRenalFunction) {
        gaps.push({
          id: uid('gap'),
          patientId: episode.patientId,
          episodeId: episode.id,
          type: 'lab_missing',
          description: 'No recent renal function tests',
          clinicalRationale: 'Annual renal function monitoring is recommended for diabetic/hypertensive patients',
          recommendedAction: 'Order creatinine, eGFR, urine albumin',
          dueDate: now + 30 * 24 * 60 * 60 * 1000,
          status: 'open',
          detectedAt: now,
        });
      }
    }
  }

  return gaps;
}

// ── Patient Goal Management ───────────────────────────────────────────────────

export function addGoal(episode: EpisodeOfCare, goal: Omit<PatientGoal, 'id' | 'startDate' | 'status'>): EpisodeOfCare {
  const newGoal: PatientGoal = {
    ...goal,
    id: uid('goal'),
    startDate: Date.now(),
    status: 'active',
    progressNotes: [],
  };
  return { ...episode, goals: [...episode.goals, newGoal], updatedAt: Date.now() };
}

export function updateGoalProgress(
  episode: EpisodeOfCare,
  goalId: string,
  note: string,
  recordedBy: string,
): EpisodeOfCare {
  return {
    ...episode,
    goals: episode.goals.map(g =>
      g.id === goalId
        ? { ...g, progressNotes: [...g.progressNotes, { timestamp: Date.now(), note, recordedBy }] }
        : g
    ),
    updatedAt: Date.now(),
  };
}

// ── Care Network ──────────────────────────────────────────────────────────────

export function createCareNetwork(patientId: string): CareNetwork {
  return {
    id: uid('net'),
    patientId,
    organizations: [],
    providers: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ── Consent ───────────────────────────────────────────────────────────────────

export function createConsentDirective(params: {
  patientId: string;
  granteeType: string;
  granteeId: string;
  granteeName: string;
  scope: string;
  permissions: ('view' | 'contribute' | 'comment')[];
  consentMethod: string;
  validForDays?: number;
}): ConsentDirective {
  const now = Date.now();
  return {
    id: uid('cons'),
    patientId: params.patientId,
    granteeType: params.granteeType as any,
    granteeId: params.granteeId,
    granteeName: params.granteeName,
    scope: params.scope as any,
    permissions: params.permissions,
    timeLimited: !!params.validForDays,
    validFrom: now,
    validUntil: params.validForDays ? now + params.validForDays * 86400000 : undefined,
    emergencyOverride: false,
    revoked: false,
    createdAt: now,
    consentMethod: params.consentMethod as any,
  };
}
