import type { ClinicalContext } from '@/lib/clinical/constitutional/registration-engine/types';

export type ClinicalPriority =
  | 'triage'      // 0 — Immediate life threat screening (RED)
  | 'critical'    // 1 — Must rule out danger (syncope, peritonism, airway)
  | 'essential'   // 2 — Required for clinical reasoning
  | 'standard'    // 3 — Standard of care questioning
  | 'supportive'  // 4 — Adds context, not critical
  | 'optional'    // 5 — Nice to know

export const PRIORITY_ORDER: ClinicalPriority[] = [
  'triage', 'critical', 'essential', 'standard', 'supportive', 'optional',
];

export type QuestionDomain =
  | 'triage' | 'safety' | 'red_flag'
  | 'vital_sign' | 'demographic'
  | 'chief_complaint' | 'pain' | 'symptom'
  | 'respiratory' | 'cardiovascular' | 'gi' | 'neurological'
  | 'musculoskeletal' | 'genitourinary' | 'obgyn' | 'pregnancy'
  | 'pediatric' | 'neonatal' | 'geriatric'
  | 'psychiatric' | 'endocrine' | 'renal' | 'hepatic'
  | 'hematology' | 'infectious_disease' | 'dermatology'
  | 'pmh' | 'drug_history' | 'allergy' | 'family' | 'social'
  | 'examination' | 'investigation' | 'management';

export interface VisibilityCriterion {
  type: 'age_group' | 'age_min_months' | 'age_max_months'
      | 'sex' | 'reproductive_stage'
      | 'pregnancy_status'
      | 'encounter_type' | 'department'
      | 'service' | 'unit'
      | 'mode_of_arrival' | 'triage_category'
      | 'module_active' | 'module_inactive'
      | 'is_emergency' | 'is_inpatient' | 'is_ward_round'
      | 'is_follow_up'
      | 'is_pediatric' | 'is_geriatric' | 'is_neonatal'
      | 'is_pregnant' | 'is_postpartum' | 'is_psychiatric'
      | 'is_surgical' | 'is_trauma'
      | 'field_equals' | 'field_not_empty' | 'field_in'
      | 'field_not_in' | 'field_not_equals'
      | 'complaint_contains' | 'complaint_in'
      | 'diagnosis_present' | 'diagnosis_not_present'
      | 'module_any' | 'module_all'
      | 'always' | 'never';

  params?: Record<string, unknown>;
}

export type CascadeDomain =
  | 'mode_of_arrival'
  | 'triage_category'
  | 'encounter_type'
  | 'service'
  | 'nicu_admission'
  | 'immunization_status'
  | 'referral_source'
  | 'pregnancy_related_visit';

export interface EncounterCascadeActivation {
  cascadeDomain: CascadeDomain;
  activatedBy: { field: string; value: unknown };
  showSections: string[];
  hideSections: string[];
  makeRequired: string[];
  skipFullHistory: boolean;
}

export interface CascadeRule {
  trigger: { field: string; value: unknown };
  showFields: string[];
  hideFields: string[];
  makeRequired: string[];
  priorityBoost?: number;
}

export interface QuestionCardVisibility {
  fieldId: string;
  label: string;
  section: string;
  domain: QuestionDomain;
  priority: ClinicalPriority;
  priorityScore: number;
  visibility: VisibilityCriterion[];
  hideWhen: VisibilityCriterion[];
  required: VisibilityCriterion[];
  cascades?: CascadeRule[];
  groupId: string;
  order: number;
}

export interface QuestionGroupVisibility {
  groupId: string;
  label: string;
  section: string;
  domain: QuestionDomain;
  basePriority: ClinicalPriority;
  visibility: VisibilityCriterion[];
  hideWhen: VisibilityCriterion[];
  cards: QuestionCardVisibility[];
  order: number;
}

export interface VisibilityEvaluation {
  fieldId: string;
  visible: boolean;
  reason: string;
  priority: ClinicalPriority;
  priorityScore: number;
  required: boolean;
}

export interface VisibilityResult {
  visibleCards: QuestionCardVisibility[];
  invisibleCards: QuestionCardVisibility[];
  evaluations: VisibilityEvaluation[];
  activeCascades: CascadeRule[];
  priorityOrder: string[];
}

export interface ClinicalQuestionInput {
  context: ClinicalContext;
  complaints: string[];
  answeredFields: Set<string>;
  diagnoses: string[];
  activeModules: string[];
}
