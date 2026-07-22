// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Universal System Examination Framework — Core Types
// ═══════════════════════════════════════════════════════════════════════════════
// Volume IIB: Every system examination follows one architecture:
//   Inspection → Palpation → Percussion → Auscultation → Special Tests
// Every card follows: Observation → Description → Measurement → Interpretation
// ═══════════════════════════════════════════════════════════════════════════════

export type SystemId =
  | 'respiratory'
  | 'cardiovascular'
  | 'gastrointestinal'
  | 'neurological'
  | 'musculoskeletal'
  | 'renal'
  | 'endocrine'
  | 'breast'
  | 'ent'
  | 'eye'
  | 'skin'
  | 'obstetric'
  | 'neonatal';

export type ExamPhase = 'inspection' | 'palpation' | 'percussion' | 'auscultation' | 'special_tests';

export const EXAM_PHASE_ORDER: readonly ExamPhase[] = ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'];

export const SYSTEM_LABELS: Record<SystemId, string> = {
  respiratory: 'Respiratory System',
  cardiovascular: 'Cardiovascular System',
  gastrointestinal: 'Gastrointestinal System',
  neurological: 'Neurological System',
  musculoskeletal: 'Musculoskeletal System',
  renal: 'Renal / Genitourinary System',
  endocrine: 'Endocrine System',
  breast: 'Breast Examination',
  ent: 'ENT Examination',
  eye: 'Eye Examination',
  skin: 'Skin Examination',
  obstetric: 'Obstetric Examination',
  neonatal: 'Neonatal Examination',
};

export const SYSTEM_PHASE_MAP: Record<SystemId, ExamPhase[]> = {
  respiratory: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
  cardiovascular: ['inspection', 'palpation', 'auscultation', 'special_tests'],
  gastrointestinal: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
  neurological: ['inspection', 'palpation', 'special_tests'],
  musculoskeletal: ['inspection', 'palpation', 'special_tests'],
  renal: ['inspection', 'palpation', 'special_tests'],
  endocrine: ['inspection', 'palpation', 'special_tests'],
  breast: ['inspection', 'palpation', 'special_tests'],
  ent: ['inspection', 'palpation', 'special_tests'],
  eye: ['inspection', 'special_tests'],
  skin: ['inspection'],
  obstetric: ['inspection', 'palpation', 'auscultation', 'special_tests'],
  neonatal: ['inspection', 'palpation', 'special_tests'],
};

// ── Core field type — 4-layer architecture ─────────────────────────────────────

export type SystemFieldType = 'boolean' | 'select' | 'multiselect' | 'number' | 'text' | 'grade' | 'scale';

export interface SystemExamFieldDef {
  id: string;
  label: string;
  shortLabel: string;
  phase: ExamPhase;
  type: SystemFieldType;
  options?: string[];
  mandatory: boolean;
  clinicalGuide: string;
  observation: string;
  description?: string;
  measurement?: boolean;
  unit?: string;
  interpretation: string;
  activatesFields?: string[];
  ageMinMonths?: number;
  ageMaxMonths?: number;
  sexRequired?: 'male' | 'female';
  isAbnormalOnly?: boolean;
}

// ── Per-system examination state — stored in EncounterState ───────────────────

export interface SystemExamState {
  examined: boolean;
  normal: boolean;
  phases: Partial<Record<ExamPhase, SystemPhaseState>>;
  measurements: Record<string, SystemMeasurement>;
  narrative: string;
  summary: string;
}

export interface SystemPhaseState {
  completed: boolean;
  fields: Record<string, SystemFieldValue>;
}

export type SystemFieldValue = boolean | string | number | string[] | undefined;

export interface SystemMeasurement {
  value: number;
  unit: string;
  lowNormal?: number;
  highNormal?: number;
  interpretation?: string;
}

// ── Aggregated system examinations container ──────────────────────────────────

export type SystemExaminations = Partial<Record<SystemId, SystemExamState>>;

// ── Engine types ──────────────────────────────────────────────────────────────

export interface NextSystemExamStep {
  systemId: SystemId;
  phase: ExamPhase;
  fieldId: string;
  fieldLabel: string;
  priority: 'critical' | 'mandatory' | 'routine' | 'optional';
  clinicalGuide: string;
  observation: string;
}

export interface SystemActivationRule {
  systemId: SystemId;
  priority: number;
  condition: (context: SystemContext) => boolean;
  reason: string;
}

export interface SystemContext {
  ageYears: number;
  ageMonths: number;
  sex: 'male' | 'female' | 'other';
  specialty?: string;
  chiefComplaint?: string;
  activeSymptoms: string[];
  constitutionalSigns: string[];
  isPregnant: boolean;
  gestationWeeks?: number;
}

// ── Narrative types ───────────────────────────────────────────────────────────

export interface SystemNarrativeInput {
  systemId: SystemId;
  state: SystemExamState;
  ageYears: number;
  context?: SystemContext;
}

export interface SystemNarrativeOutput {
  narrative: string;
  summary: string;
  abnormalFindings: string[];
  normalSystems: string[];
}
