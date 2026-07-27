// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK V
// LIVE CLINICAL DOCUMENTATION ENGINE
// Documentation is NOT output. It is a living clinical object.
// Narrative shall never invent, omit, duplicate, or distort facts.
// ═══════════════════════════════════════════════════════════════
// Constitutional Principle 1: Documentation is a living object.
// Constitutional Principle 2: Documentation is based on Facts, not Questions.
// Constitutional Principle 3: Narrative never knows how info was collected.
// ═══════════════════════════════════════════════════════════════

import type { FactObject, SymptomObject, SymptomTimeline, SymptomSeverity, SymptomLocation, MechanismCategoryUniversal } from './hpi-constitution';

// ─────────────────────────────────────────────────────────────────
// DOCUMENT OBJECT — the HPI is NOT a string, it is an object
// ─────────────────────────────────────────────────────────────────

export interface ClinicalClause {
  id: string;
  text: string;
  factIds: string[];
  symptomId: string | null;
  clauseType: ClauseType;
  temporalOrder: number;
  isNegation: boolean;
  confidence: number;
}

export type ClauseType =
  | 'symptom_introduction'
  | 'temporal'
  | 'characterization'
  | 'severity'
  | 'location'
  | 'radiation'
  | 'progression'
  | 'associated_feature'
  | 'aggravating'
  | 'relieving'
  | 'context'
  | 'risk_factor'
  | 'previous_episode'
  | 'treatment_tried'
  | 'impact'
  | 'current_state'
  | 'important_negative'
  | 'transition';

export interface ClinicalSentence {
  id: string;
  text: string;
  clauses: ClinicalClause[];
  symptomId: string | null;
  order: number;
  isComplete: boolean;
}

export interface ClinicalParagraph {
  id: string;
  heading: string | null;
  sentences: ClinicalSentence[];
  symptomId: string | null;
  order: number;
  isComplete: boolean;
  factIdsReferenced: string[];
}

export interface DocumentObject {
  id: string;
  encounterId: string;
  patientId: string;
  paragraphs: ClinicalParagraph[];
  summary: string;
  lastUpdated: string;
  version: number;
}

// ─────────────────────────────────────────────────────────────────
// PRONOUN SYSTEM
// ─────────────────────────────────────────────────────────────────

export type PatientGender = 'male' | 'female' | 'other' | 'unknown';
export type PatientAgeCategory = 'neonate' | 'infant' | 'child' | 'adolescent' | 'adult' | 'older_adult';

export interface PronounSet {
  subject: string;
  object: string;
  possessive: string;
  reflexive: string;
  determiner: string;
}

export const PRONOUN_MAP: Record<PatientGender, PronounSet> = {
  male: { subject: 'He', object: 'him', possessive: 'his', reflexive: 'himself', determiner: 'his' },
  female: { subject: 'She', object: 'her', possessive: 'her', reflexive: 'herself', determiner: 'her' },
  other: { subject: 'They', object: 'them', possessive: 'their', reflexive: 'themselves', determiner: 'their' },
  unknown: { subject: 'The patient', object: 'the patient', possessive: 'the patient\'s', reflexive: 'themselves', determiner: 'the' },
};

export const AGE_REFERENCE_MAP: Record<PatientAgeCategory, string> = {
  neonate: 'the neonate',
  infant: 'the infant',
  child: 'the child',
  adolescent: 'the adolescent',
  adult: 'the patient',
  older_adult: 'the patient',
};

// ─────────────────────────────────────────────────────────────────
// DOCUMENTATION ORDER — every symptom expands in constitutional order
// ─────────────────────────────────────────────────────────────────

export const CLAUSE_ORDER: ClauseType[] = [
  'transition',
  'symptom_introduction',
  'temporal',
  'characterization',
  'severity',
  'location',
  'radiation',
  'progression',
  'context',
  'aggravating',
  'relieving',
  'associated_feature',
  'treatment_tried',
  'previous_episode',
  'impact',
  'current_state',
  'important_negative',
  'risk_factor',
];

export const PAIN_ORDER: ClauseType[] = [
  'transition',
  'symptom_introduction',
  'temporal',
  'location',
  'radiation',
  'characterization',
  'severity',
  'progression',
  'associated_feature',
  'aggravating',
  'relieving',
  'context',
  'previous_episode',
  'treatment_tried',
  'impact',
  'current_state',
];

// ─────────────────────────────────────────────────────────────────
// TERMINOLOGY RULES — patient wording → clinical wording
// ─────────────────────────────────────────────────────────────────

export interface TerminologyRule {
  patientPattern: RegExp;
  clinicalTerm: string;
  category: string;
}

export const TERMINOLOGY_RULES: TerminologyRule[] = [
  { patientPattern: /vomited green|green vomit|bilious/i, clinicalTerm: 'bilious vomiting', category: 'vomiting' },
  { patientPattern: /vomited blood|blood in vomit|coffee ground/i, clinicalTerm: 'hematemesis', category: 'vomiting' },
  { patientPattern: /black stool|tarry stool|sticky stool/i, clinicalTerm: 'melena', category: 'stool' },
  { patientPattern: /blood in stool|bloody stool/i, clinicalTerm: 'hematochezia', category: 'stool' },
  { patientPattern: /passed out|blacked out|fainted/i, clinicalTerm: 'syncope', category: 'consciousness' },
  { patientPattern: /fit|convulsion|shaking all over/i, clinicalTerm: 'seizure', category: 'neurological' },
  { patientPattern: /heart racing|heart pounding|palpitations/i, clinicalTerm: 'palpitations', category: 'cardiac' },
  { patientPattern: /short of breath|can't breathe|breathless/i, clinicalTerm: 'dyspnea', category: 'respiratory' },
  { patientPattern: /yellow skin|yellow eyes|jaundice/i, clinicalTerm: 'jaundice', category: 'hepatic' },
  { patientPattern: /watery stool|loose stool|running stomach/i, clinicalTerm: 'diarrhea', category: 'gi' },
  { patientPattern: /can't pass stool|constipated/i, clinicalTerm: 'constipation', category: 'gi' },
  { patientPattern: /sweating at night|night sweat/i, clinicalTerm: 'night sweats', category: 'systemic' },
  { patientPattern: /lost weight|weight loss/i, clinicalTerm: 'weight loss', category: 'systemic' },
  { patientPattern: /felt hot|temperature|feverish/i, clinicalTerm: 'fever', category: 'systemic' },
  { patientPattern: /bad headache|migraine|splitting headache/i, clinicalTerm: 'severe headache', category: 'neurological' },
];

// ─────────────────────────────────────────────────────────────────
// STYLE RULES
// ─────────────────────────────────────────────────────────────────

export const STYLE_RULES = {
  maxPatientPerParagraph: 1 as const,
  maxConsecutiveNegativeSentences: 1 as const,
  minPronounAfterFirstReference: 2 as const,
  maxSymptomsPerSentence: 3 as const,
  requireTransitionBetweenSymptoms: true,
  chronologicalFlow: true,
  noRoboticPhrasing: true,
  medicalEnglishRequired: true,
  correctTenseRequired: true,
};

// ─────────────────────────────────────────────────────────────────
// DOCUMENTATION QUALITY CHECK
// ─────────────────────────────────────────────────────────────────

export interface QualityCheckResult {
  completeness: number;
  chronology: boolean;
  medicalEnglish: boolean;
  logicalFlow: boolean;
  noRepetition: boolean;
  noContradictions: boolean;
  noAmbiguity: boolean;
  correctGrammar: boolean;
  correctTense: boolean;
  clinicalUsefulness: boolean;
  consultantReadability: boolean;
}

export const DOCUMENTATION_CONSTITUTION = {
  documentationIsLivingObject: true,
  factsNotQuestions: true,
  narrativeNeverRegenerates: true,
  narrativeGrowsIncrementally: true,
  everySentenceTraceableToFacts: true,
  everyFactHasOriginConfidenceAuthorTimestamp: true,
  socratesNeverPrintedAsHeading: true,
  negativesGroupedNeverDominant: true,
  pronounsRequiredAfterFirstReference: true,
  chronologicalFlowRequired: true,
  terminologyClinicalNotPatient: true,
  oneSymptomMentionedOnce: true,
} as const;

export function applyTerminologyRules(patientText: string): { clinical: string; rule: TerminologyRule | null } {
  for (const rule of TERMINOLOGY_RULES) {
    if (rule.patientPattern.test(patientText)) {
      return { clinical: rule.clinicalTerm, rule };
    }
  }
  return { clinical: patientText, rule: null };
}

export function selectPronouns(gender: PatientGender, ageCategory: PatientAgeCategory): PronounSet {
  if (ageCategory === 'neonate' || ageCategory === 'infant') {
    return gender === 'male'
      ? { subject: 'He', object: 'him', possessive: 'his', reflexive: 'himself', determiner: 'his' }
      : { subject: 'She', object: 'her', possessive: 'her', reflexive: 'herself', determiner: 'her' };
  }
  return PRONOUN_MAP[gender];
}

export function getAgeReference(ageCategory: PatientAgeCategory): string {
  return AGE_REFERENCE_MAP[ageCategory];
}
