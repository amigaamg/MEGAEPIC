// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Encounter Phases — the 22-step doctor-centric workflow
// ═══════════════════════════════════════════════════════════════════════════════
// Clinical Summary (phase 12) is the constitutional watershed:
//   phases 1-11  = Evidence Collection (what the patient tells/ shows us)
//   phase 12     = Clinical Summary (the bridge — synthesizes evidence)
//   phases 13-22 = Clinical Synthesis (what the doctor decides)
// ═══════════════════════════════════════════════════════════════════════════════

export type EncounterPhase =
  | 'biodata'
  | 'chief_complaints'
  | 'hpi'
  | 'pmh'
  | 'psh'
  | 'drug_history'
  | 'allergy_history'
  | 'family_history'
  | 'social_history'
  | 'ros'
  | 'physical_examination'
  | 'clinical_summary'
  | 'provisional_diagnosis'
  | 'differential_diagnoses'
  | 'problem_list'
  | 'investigations'
  | 'results_review'
  | 'final_diagnosis'
  | 'management'
  | 'disposition'
  | 'documentation'
  | 'sign_off'
  | 'closed';

export type PhaseGroup =
  | 'intake'
  | 'history'
  | 'examination'
  | 'summary'
  | 'diagnostic'
  | 'investigation'
  | 'management'
  | 'closure';

export interface PhaseDefinition {
  phaseId: EncounterPhase;
  label: string;
  group: PhaseGroup;
  order: number;
  prerequisitePhases: EncounterPhase[];
  purpose: string;
  isEvidenceCollection: boolean;
  isSynthesis: boolean;
  supportsNegativeHistory: boolean;
  outputFormat: 'structured' | 'narrative' | 'decision' | 'list' | 'document';
  // Maps to the old 8-step WorkflowStep for backward compatibility
  mapsToOldStep: 'intake' | 'chief_complaint' | 'history' | 'examination' | 'investigations' | 'assessment' | 'plan' | 'complete';
}

export const ENCOUNTER_PHASES: readonly PhaseDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // EVIDENCE COLLECTION — phases 1-11
  // ═══════════════════════════════════════════════════════════════════════════
  {
    phaseId: 'biodata',
    label: 'Biodata & Demographics',
    group: 'intake',
    order: 1,
    prerequisitePhases: [],
    purpose: 'Capture patient identification, demographics, and encounter context',
    isEvidenceCollection: true,
    isSynthesis: false,
    supportsNegativeHistory: false,
    outputFormat: 'structured',
    mapsToOldStep: 'intake',
  },
  {
    phaseId: 'chief_complaints',
    label: 'Chief Complaints',
    group: 'history',
    order: 2,
    prerequisitePhases: ['biodata'],
    purpose: 'Document the patient\'s main reason(s) for encounter in their own words',
    isEvidenceCollection: true,
    isSynthesis: false,
    supportsNegativeHistory: false,
    outputFormat: 'structured',
    mapsToOldStep: 'chief_complaint',
  },
  {
    phaseId: 'hpi',
    label: 'History of Present Illness',
    group: 'history',
    order: 3,
    prerequisitePhases: ['biodata', 'chief_complaints'],
    purpose: 'Systematically explore each symptom: onset, duration, character, severity, aggravating/relieving factors, associated symptoms',
    isEvidenceCollection: true,
    isSynthesis: false,
    supportsNegativeHistory: true,
    outputFormat: 'narrative',
    mapsToOldStep: 'history',
  },
  {
    phaseId: 'pmh',
    label: 'Past Medical History',
    group: 'history',
    order: 4,
    prerequisitePhases: ['biodata', 'chief_complaints', 'hpi'],
    purpose: 'Document chronic conditions, previous diagnoses, hospitalizations',
    isEvidenceCollection: true,
    isSynthesis: false,
    supportsNegativeHistory: true,
    outputFormat: 'structured',
    mapsToOldStep: 'history',
  },
  {
    phaseId: 'psh',
    label: 'Past Surgical History',
    group: 'history',
    order: 5,
    prerequisitePhases: ['biodata', 'chief_complaints', 'hpi', 'pmh'],
    purpose: 'Document prior surgeries, procedures, and anesthetic complications',
    isEvidenceCollection: true,
    isSynthesis: false,
    supportsNegativeHistory: true,
    outputFormat: 'structured',
    mapsToOldStep: 'history',
  },
  {
    phaseId: 'drug_history',
    label: 'Drug History',
    group: 'history',
    order: 6,
    prerequisitePhases: ['biodata', 'chief_complaints', 'hpi', 'pmh'],
    purpose: 'Document current medications, adherence, and recent drug changes',
    isEvidenceCollection: true,
    isSynthesis: false,
    supportsNegativeHistory: true,
    outputFormat: 'structured',
    mapsToOldStep: 'history',
  },
  {
    phaseId: 'allergy_history',
    label: 'Allergy History',
    group: 'history',
    order: 7,
    prerequisitePhases: ['biodata', 'chief_complaints', 'hpi', 'pmh'],
    purpose: 'Document drug, food, and environmental allergies with reaction type and severity',
    isEvidenceCollection: true,
    isSynthesis: false,
    supportsNegativeHistory: true,
    outputFormat: 'structured',
    mapsToOldStep: 'history',
  },
  {
    phaseId: 'family_history',
    label: 'Family History',
    group: 'history',
    order: 8,
    prerequisitePhases: ['biodata', 'chief_complaints', 'hpi', 'pmh'],
    purpose: 'Document hereditary and familial disease patterns',
    isEvidenceCollection: true,
    isSynthesis: false,
    supportsNegativeHistory: true,
    outputFormat: 'structured',
    mapsToOldStep: 'history',
  },
  {
    phaseId: 'social_history',
    label: 'Social History',
    group: 'history',
    order: 9,
    prerequisitePhases: ['biodata', 'chief_complaints', 'hpi', 'pmh'],
    purpose: 'Document lifestyle factors, occupation, housing, substance use, travel',
    isEvidenceCollection: true,
    isSynthesis: false,
    supportsNegativeHistory: true,
    outputFormat: 'structured',
    mapsToOldStep: 'history',
  },
  {
    phaseId: 'ros',
    label: 'Review of Systems',
    group: 'history',
    order: 10,
    prerequisitePhases: ['biodata', 'chief_complaints', 'hpi'],
    purpose: 'Systematically screen each body system for symptoms not captured in HPI',
    isEvidenceCollection: true,
    isSynthesis: false,
    supportsNegativeHistory: true,
    outputFormat: 'structured',
    mapsToOldStep: 'history',
  },
  {
    phaseId: 'physical_examination',
    label: 'Physical Examination',
    group: 'examination',
    order: 11,
    prerequisitePhases: ['biodata', 'chief_complaints', 'hpi'],
    purpose: 'Perform structured physical exam guided by presenting complaints and active highways',
    isEvidenceCollection: true,
    isSynthesis: false,
    supportsNegativeHistory: true,
    outputFormat: 'structured',
    mapsToOldStep: 'examination',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLINICAL SUMMARY — phase 12 (watershed)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    phaseId: 'clinical_summary',
    label: 'Clinical Summary',
    group: 'summary',
    order: 12,
    prerequisitePhases: ['biodata', 'chief_complaints', 'hpi', 'pmh', 'psh', 'drug_history', 'allergy_history', 'family_history', 'social_history', 'ros', 'physical_examination'],
    purpose: 'Synthesize all evidence collection into a concise clinical narrative — the watershed moment',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'narrative',
    mapsToOldStep: 'assessment',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLINICAL SYNTHESIS — phases 13-22
  // ═══════════════════════════════════════════════════════════════════════════
  {
    phaseId: 'provisional_diagnosis',
    label: 'Provisional Diagnosis',
    group: 'diagnostic',
    order: 13,
    prerequisitePhases: ['clinical_summary'],
    purpose: 'State the working diagnosis based on clinical summary findings',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'decision',
    mapsToOldStep: 'assessment',
  },
  {
    phaseId: 'differential_diagnoses',
    label: 'Differential Diagnoses',
    group: 'diagnostic',
    order: 14,
    prerequisitePhases: ['clinical_summary'],
    purpose: 'List and rank alternative diagnoses by likelihood and danger',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'list',
    mapsToOldStep: 'assessment',
  },
  {
    phaseId: 'problem_list',
    label: 'Problem List',
    group: 'diagnostic',
    order: 15,
    prerequisitePhases: ['clinical_summary', 'provisional_diagnosis', 'differential_diagnoses'],
    purpose: 'Enumerate all active problems in order of priority',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'list',
    mapsToOldStep: 'assessment',
  },
  {
    phaseId: 'investigations',
    label: 'Investigations',
    group: 'investigation',
    order: 16,
    prerequisitePhases: ['provisional_diagnosis', 'differential_diagnoses'],
    purpose: 'Order and document laboratory, imaging, and bedside investigations',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'structured',
    mapsToOldStep: 'investigations',
  },
  {
    phaseId: 'results_review',
    label: 'Results Review',
    group: 'investigation',
    order: 17,
    prerequisitePhases: ['investigations'],
    purpose: 'Review investigation results and update clinical impression',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'structured',
    mapsToOldStep: 'investigations',
  },
  {
    phaseId: 'final_diagnosis',
    label: 'Final Diagnosis',
    group: 'diagnostic',
    order: 18,
    prerequisitePhases: ['provisional_diagnosis', 'differential_diagnoses', 'results_review'],
    purpose: 'Establish the confirmed diagnosis after investigation results',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'decision',
    mapsToOldStep: 'assessment',
  },
  {
    phaseId: 'management',
    label: 'Management Plan',
    group: 'management',
    order: 19,
    prerequisitePhases: ['final_diagnosis', 'problem_list'],
    purpose: 'Document treatment plan organized by ABCDE/FGH categories',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'structured',
    mapsToOldStep: 'plan',
  },
  {
    phaseId: 'disposition',
    label: 'Disposition',
    group: 'management',
    order: 20,
    prerequisitePhases: ['management'],
    purpose: 'Document admission decision, referral, follow-up plan, and safety-netting',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'decision',
    mapsToOldStep: 'plan',
  },
  {
    phaseId: 'documentation',
    label: 'Documentation',
    group: 'closure',
    order: 21,
    prerequisitePhases: ['management', 'disposition'],
    purpose: 'Generate and review clinical note (admission note, SOAP, referral letter, etc.)',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'document',
    mapsToOldStep: 'complete',
  },
  {
    phaseId: 'sign_off',
    label: 'Sign-off',
    group: 'closure',
    order: 22,
    prerequisitePhases: ['documentation'],
    purpose: 'Doctor reviews, edits, and signs off — encounter becomes locked',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'document',
    mapsToOldStep: 'complete',
  },
  {
    phaseId: 'closed',
    label: 'Closed',
    group: 'closure',
    order: 23,
    prerequisitePhases: ['sign_off'],
    purpose: 'Encounter is locked. Future amendments recorded as addenda.',
    isEvidenceCollection: false,
    isSynthesis: true,
    supportsNegativeHistory: false,
    outputFormat: 'document',
    mapsToOldStep: 'complete',
  },
] as const;

// ── Derived constants ──────────────────────────────────────────────────────────

export const PHASE_ORDER: readonly EncounterPhase[] = ENCOUNTER_PHASES.map(p => p.phaseId);

export const EVIDENCE_COLLECTION_PHASES: readonly EncounterPhase[] = ENCOUNTER_PHASES
  .filter(p => p.isEvidenceCollection)
  .map(p => p.phaseId);

export const CLINICAL_SYNTHESIS_PHASES: readonly EncounterPhase[] = ENCOUNTER_PHASES
  .filter(p => p.isSynthesis)
  .map(p => p.phaseId);

export const PHASE_GROUPS: readonly PhaseGroup[] = ['intake', 'history', 'examination', 'summary', 'diagnostic', 'investigation', 'management', 'closure'];

// ── Lookup functions ───────────────────────────────────────────────────────────

export function getPhaseDefinition(phaseId: EncounterPhase): PhaseDefinition {
  const def = ENCOUNTER_PHASES.find(p => p.phaseId === phaseId);
  if (!def) throw new Error(`Unknown encounter phase: ${phaseId}`);
  return def;
}

export function getPhasesByGroup(group: PhaseGroup): readonly EncounterPhase[] {
  return ENCOUNTER_PHASES.filter(p => p.group === group).map(p => p.phaseId);
}

export function getPhaseIndex(phaseId: EncounterPhase): number {
  return PHASE_ORDER.indexOf(phaseId);
}

export function isBeforeClinicalSummary(phaseId: EncounterPhase): boolean {
  return getPhaseIndex(phaseId) < getPhaseIndex('clinical_summary');
}

export function isAfterClinicalSummary(phaseId: EncounterPhase): boolean {
  return getPhaseIndex(phaseId) > getPhaseIndex('clinical_summary');
}

export function isClinicalSummary(phaseId: EncounterPhase): boolean {
  return phaseId === 'clinical_summary';
}
