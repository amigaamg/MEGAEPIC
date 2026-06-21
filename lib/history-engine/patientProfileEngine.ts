// ── PATIENT PROFILE ENGINE ──
// Determines the specialty format based on age and sex.
// Provides the adaptive pipeline sections list.

import type { PatientProfile, Biodata, Sex, ChiefComplaint } from './types';

// Symptoms that warrant gynaecology/obstetric history sections
const GYN_SYMPTOMS = new Set([
  'vaginal_bleeding', 'vaginal_discharge', 'pelvic_pain', 'amenorrhea',
  'dysmenorrhea', 'dyspareunia', 'breast_lump', 'breast_pain',
  'reduced_fetal_movements', 'contractions', 'labor_pain',
  'lower_abdominal_pain', 'pv_bleeding', 'pv_discharge', 'infertility',
  'postmenopausal_bleeding', 'prolapse_symptoms', 'urinary_incontinence',
  'menorrhagia', 'metrorrhagia', 'oligomenorrhea', 'polymenorrhea',
]);

export function detectProfile(biodata: Partial<Biodata>): PatientProfile {
  const age = biodata.age ?? 30;
  const sex: Sex = biodata.sex ?? 'unknown';

  // Newborn: 0-28 days (0-0.0767 years)
  if (age >= 0 && age <= 0.0767) return 'newborn';

  // Pediatric: 28 days to 12 years
  if (age > 0.0767 && age <= 12) return 'pediatric';

  // Obstetric: female, age 12-55, pregnant
  if (sex === 'female' && age >= 12 && age <= 55 && biodata.obstetric?.isPregnant) return 'obstetric';

  // Default adult
  return 'adult';
}

/** Profile-aware version that considers chief complaints */
export function detectProfileWithComplaints(
  biodata: Partial<Biodata>,
  chiefComplaints?: Partial<ChiefComplaint>[]
): PatientProfile {
  const base = detectProfile(biodata);
  if (base === 'obstetric') return base; // pregnancy overrides everything

  const age = biodata.age ?? 30;
  const sex: Sex = biodata.sex ?? 'unknown';

  // Any female 12-55 of reproductive age: treat as gynecologic profile
  // to show OBGYN sections. The doctor can always skip them.
  if (sex === 'female' && age >= 12 && age <= 55) {
    // If no OBGYN symptoms explicitly entered, still default to gynecologic
    // so OBGYN sections appear in the pipeline
    return 'gynecologic';
  }

  return 'adult';
}

export interface SectionDef {
  id: string;
  label: string;
  icon: string;
}

// ── BASE SECTIONS (common to all profiles) ──
const BASE_SECTIONS: SectionDef[] = [
  { id: 'biodata', label: 'Patient Details', icon: '👤' },
  { id: 'chief_complaints', label: 'Chief Complaints', icon: '🩺' },
  { id: 'hpi', label: 'HPI & Exploration', icon: '📋' },
];

const END_SECTIONS: SectionDef[] = [
  { id: 'ros', label: 'Review of Systems', icon: '🔍' },
  { id: 'impact', label: 'Impact on Life', icon: '💪' },
  { id: 'history_summary', label: 'History Summary', icon: '📄' },
  { id: 'general_exam', label: 'General Exam', icon: '🩻' },
  { id: 'systemic_exam', label: 'Systemic Exam', icon: '🔬' },
];

const CLINICAL_SECTIONS: SectionDef[] = [
  { id: 'clinical_reasoning', label: 'Clinical Reasoning', icon: '🧠' },
  { id: 'diagnosis', label: 'Diagnosis', icon: '🎯' },
  { id: 'differentials', label: 'Differentials', icon: '📊' },
  { id: 'investigations', label: 'Investigations', icon: '🧪' },
  { id: 'interpretation', label: 'Interpretation', icon: '📝' },
  { id: 'treatment', label: 'Treatment', icon: '💊' },
  { id: 'monitoring', label: 'Monitoring', icon: '📈' },
  { id: 'summary', label: 'Summary', icon: '📑' },
];

// ── PROFILE-SPECIFIC SECTION PIPELINES ──

const ADULT_SECTIONS: SectionDef[] = [
  ...BASE_SECTIONS,
  { id: 'past_history', label: 'Past History', icon: '📜' },
  { id: 'family_social', label: 'Family & Social', icon: '👪' },
  ...END_SECTIONS,
  ...CLINICAL_SECTIONS,
];

const PEDIATRIC_SECTIONS: SectionDef[] = [
  ...BASE_SECTIONS,
  { id: 'past_history', label: 'Past History', icon: '📜' },
  { id: 'birth_history', label: 'Birth History', icon: '👶' },
  { id: 'immunization', label: 'Immunizations', icon: '💉' },
  { id: 'growth_dev', label: 'Growth & Dev', icon: '📏' },
  { id: 'nutrition', label: 'Nutrition', icon: '🍼' },
  { id: 'family_social', label: 'Family & Social', icon: '👪' },
  ...END_SECTIONS,
  ...CLINICAL_SECTIONS,
];

const NEWBORN_SECTIONS: SectionDef[] = [
  ...BASE_SECTIONS,
  { id: 'birth_history', label: 'Birth History', icon: '👶' },
  { id: 'newborn_feeding', label: 'Feeding', icon: '🍼' },
  { id: 'past_history', label: 'Past History', icon: '📜' },
  { id: 'family_social', label: 'Family & Social', icon: '👪' },
  { id: 'ros', label: 'Review of Systems', icon: '🔍' },
  { id: 'history_summary', label: 'History Summary', icon: '📄' },
  { id: 'newborn_exam', label: 'Newborn Exam', icon: '🩻' },
  ...CLINICAL_SECTIONS,
];

const OBSTETRIC_SECTIONS: SectionDef[] = [
  ...BASE_SECTIONS,
  { id: 'obstetric_history', label: 'OB History', icon: '🤰' },
  { id: 'gynecology_history', label: 'Gynecology', icon: '♀️' },
  { id: 'past_history', label: 'Past History', icon: '📜' },
  { id: 'family_social', label: 'Family & Social', icon: '👪' },
  ...END_SECTIONS,
  { id: 'obstetric_exam', label: 'OB Exam', icon: '🩻' },
  { id: 'systemic_exam', label: 'Systemic Exam', icon: '🔬' },
  ...CLINICAL_SECTIONS,
];

const GYNECOLOGIC_SECTIONS: SectionDef[] = [
  ...BASE_SECTIONS,
  { id: 'obstetric_history', label: 'OB History', icon: '🤰' },
  { id: 'gynecology_history', label: 'Gynecology', icon: '♀️' },
  { id: 'past_history', label: 'Past History', icon: '📜' },
  { id: 'family_social', label: 'Family & Social', icon: '👪' },
  ...END_SECTIONS,
  ...CLINICAL_SECTIONS,
];

const PROFILE_MAP: Record<PatientProfile, SectionDef[]> = {
  adult: ADULT_SECTIONS,
  pediatric: PEDIATRIC_SECTIONS,
  newborn: NEWBORN_SECTIONS,
  obstetric: OBSTETRIC_SECTIONS,
  gynecologic: GYNECOLOGIC_SECTIONS,
};

export function getSectionsForProfile(profile: PatientProfile, sex?: string, age?: number): SectionDef[] {
  const sections = PROFILE_MAP[profile] || ADULT_SECTIONS;
  const isMale = sex === 'male';
  const isPreMenarche = sex === 'female' && (age || 0) < 12;

  // Filter out gender-inappropriate sections
  if (isMale) {
    return sections.filter(s =>
      s.id !== 'obstetric_history' &&
      s.id !== 'gynecology_history' &&
      s.id !== 'obstetric_exam'
    );
  }

  if (isPreMenarche) {
    return sections.filter(s =>
      s.id !== 'gynecology_history'
    );
  }

  return sections;
}

export function getAllSectionIds(profile: PatientProfile): string[] {
  return getSectionsForProfile(profile).map(s => s.id);
}

// ── Naegele's Rule: EDD = LNMP + 280 days (40 weeks) ──
export function calculateEDD(lnmp: string): string {
  const date = new Date(lnmp);
  if (isNaN(date.getTime())) return '';
  const edd = new Date(date);
  edd.setDate(edd.getDate() + 280);
  return edd.toISOString().split('T')[0];
}

// ── Calculate gestational age from LNMP ──
export function calculateGestationalAge(lnmp: string): { weeks: number; days: number } {
  const lmp = new Date(lnmp);
  const now = new Date();
  const diff = now.getTime() - lmp.getTime();
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  return { weeks, days };
}

// ── Detect if profile should change based on updated biodata ──
export function getUpdatedProfile(prevProfile: PatientProfile, biodata: Partial<Biodata>): PatientProfile {
  const detected = detectProfile(biodata);
  return detected;
}
