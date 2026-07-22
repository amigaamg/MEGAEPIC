export type FactType =
  | 'biodata' | 'chief_complaint' | 'hpi' | 'pmh'
  | 'past_surgical_history'
  | 'drug_history' | 'allergy' | 'family' | 'social'
  | 'ros' | 'examination' | 'investigation' | 'diagnosis';

export type SectionType =
  | 'biodata' | 'chief_complaint' | 'hpi' | 'pmh'
  | 'drug_history' | 'allergy_history'
  | 'family_history' | 'social_history'
  | 'review_of_systems' | 'history_summary'
  | 'birth_history' | 'development' | 'immunization' | 'nutrition'
  | 'perinatal_history'
  | 'menstrual_history' | 'pregnancy_history' | 'obstetric_history' | 'gynecological_history'
  | 'examination' | 'clinical_summary'
  | 'syndromes' | 'mechanisms' | 'phenotypes'
  | 'differentials' | 'problem_list'
  | 'investigations' | 'results'
  | 'diagnosis' | 'management' | 'disposition'
  | 'past_surgical_history'
  | 'past_psychiatric_history' | 'substance_use_history' | 'forensic_history' | 'premorbid_personality';

export type AgeBand = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly';

export type AssessmentFormat = 'adult_medical' | 'adult_surgical' | 'pediatric' | 'neonatal' | 'obstetric' | 'psychiatric';

export type GateStatus = 'locked' | 'pending' | 'active' | 'completed';

export interface AgeInMonths {
  years: number;
  months: number;
  totalMonths: number;
  band: AgeBand;
}

export interface PatientContext {
  age: AgeInMonths;
  sex: 'male' | 'female' | 'unknown';
  pregnancyStatus: 'not_pregnant' | 'pregnant' | 'postpartum' | 'unknown';
  department: string;
  specialty: string;
  encounterType: string;
  environment?: Record<string, string>;
  activeComplaints: SymptomObject[];
  activeDiseaseIds: string[];
  activeMedicationIds: string[];
  activeAllergenIds: string[];
  activeFindingIds: string[];
  existingFacts: Fact[];
}

export interface Fact {
  id: string;
  type: FactType;
  source: string;
  sourceSectionId: string;
  value: unknown;
  createdAt: number;
}

export interface SymptomObject {
  id: string;
  symptomId: string;
  label: string;
  present: boolean;
  site?: string;
  onset?: 'sudden' | 'gradual' | 'insidious';
  character?: string;
  radiation?: string;
  associations?: string[];
  timeCourse?: 'continuous' | 'intermittent' | 'recurrent' | 'progressive';
  exacerbatingFactors?: string[];
  relievingFactors?: string[];
  severity?: number;
  duration?: string;
  chronology?: number;
  patientDescription?: string;
  source: 'chief_complaint' | 'hpi' | 'ros';
  explored: boolean;
  createdAt: number;
}

export interface FindingObject {
  id: string;
  findingId: string;
  label: string;
  system: string;
  present: boolean | null;
  screening: boolean;
  site?: string;
  laterality?: 'left' | 'right' | 'bilateral' | 'midline' | 'diffuse';
  size?: string;
  character?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  interpretation?: string;
  examinedAt?: number;
  examiner?: string;
  version: number;
}

export interface DiseaseObject {
  id: string;
  diseaseId: string;
  label: string;
  diagnosedYear?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'unknown';
  status: 'active' | 'resolved' | 'in_remission' | 'chronic';
  control?: 'well_controlled' | 'partially_controlled' | 'uncontrolled' | 'unknown';
  complications?: string[];
  followUp?: string;
  treatmentLinks?: string[];
  chronology?: number;
  createdAt: number;
}

export interface MedicationObject {
  id: string;
  medicationId: string;
  label: string;
  dose?: string;
  route?: string;
  frequency?: string;
  status: 'current' | 'past' | 'planned';
  adherence?: 'good' | 'partial' | 'poor' | 'unknown';
  indication?: string;
  startedAt?: string;
  stoppedAt?: string;
  stoppedReason?: string;
  createdAt: number;
}

export interface AllergyObject {
  id: string;
  allergenId: string;
  label: string;
  type: 'true_allergy' | 'intolerance' | 'side_effect' | 'unknown';
  reaction?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
  onset?: string;
  verification: 'confirmed' | 'suspected' | 'patient_reported';
  createdAt: number;
}

export type ActivationRule =
  | { type: 'age'; minMonths?: number; maxMonths?: number }
  | { type: 'sex'; values: ('male' | 'female')[] }
  | { type: 'pregnancy'; status: ('not_pregnant' | 'pregnant' | 'postpartum')[] }
  | { type: 'department'; values: string[] }
  | { type: 'specialty'; values: string[] }
  | { type: 'encounter_type'; values: string[] }
  | { type: 'symptom_present'; symptomIds: string[] }
  | { type: 'symptom_absent'; symptomIds: string[] }
  | { type: 'disease_present'; diseaseIds: string[] }
  | { type: 'fact_exists'; factType: FactType }
  | { type: 'environment'; setting: string; values: string[] }
  | { type: 'always' }
  | { type: 'never' };

export interface SectionDefinition {
  id: string;
  type: SectionType;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  position: number;
  required: boolean;
  activationRules: ActivationRule[];
  prerequisites: string[];
}

export interface GateDefinition {
  id: string;
  sectionType: SectionType;
  label: string;
  icon: string;
  description: string;
  position: number;
  prerequisites: string[];
  required: boolean;
}

export interface DocumentationBlock {
  sectionId: string;
  sectionType: SectionType;
  narrative: string;
  structuredSummary?: Record<string, unknown>;
  generatedAt: number;
}

export interface ConstitutionalState {
  format: AssessmentFormat;
  sections: SectionDefinition[];
  gateStatuses: Record<string, GateStatus>;
  activeSectionId: string | null;
  completedSectionIds: string[];
  facts: Fact[];
  symptoms: Record<string, SymptomObject>;
  findings: Record<string, FindingObject>;
  diseases: Record<string, DiseaseObject>;
  medications: Record<string, MedicationObject>;
  allergies: Record<string, AllergyObject>;
  documentation: Record<string, DocumentationBlock>;
}

export function getAgeBand(totalMonths: number): AgeBand {
  if (totalMonths <= 1) return 'neonate';
  if (totalMonths <= 12) return 'infant';
  if (totalMonths <= 36) return 'toddler';
  if (totalMonths <= 144) return 'child';
  if (totalMonths <= 216) return 'adolescent';
  if (totalMonths <= 720) return 'adult';
  return 'elderly';
}

export function computeAge(years: number, months: number): AgeInMonths {
  const totalMonths = years * 12 + months;
  return { years, months, totalMonths, band: getAgeBand(totalMonths) };
}

export function computeAgeFromMonths(totalMonths: number): AgeInMonths {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months, totalMonths, band: getAgeBand(totalMonths) };
}
