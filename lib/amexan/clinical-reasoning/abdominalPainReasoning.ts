// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Abdominal Pain Clinical Reasoning Rules
// Comprehensive differential diagnosis by organ system with SOCRATES logic,
// biodata filtering, pattern recognition, and red flag detection.
// Drives the Information Gap Engine with clinically grounded question priorities.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

// ── Helper types ──────────────────────────────────────────────────────────────

interface BiodataRule {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  organSystem: string;
  category: string;
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  geographicPredilection?: string[];
  backgroundPrevalence: number;
  redFlags: string[];
  typicalSocrates: Partial<SocratesProfile>;
}

interface SocratesProfile {
  onset: string[];
  location: string[];
  character: string[];
  radiation: string[];
  severity: string;
  timing: string[];
  exacerbating: string[];
  relieving: string[];
}

interface PatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

// ── Biodata-based prior shifts ─────────────────────────────────────────────

const ABDOMINAL_PAIN_DDX: BiodataRule[] = [
  // ── Surgical: Right Lower Quadrant ──────────────────────────────────────
  {
    diseaseId: 'acute_appendicitis', diseaseName: 'Acute Appendicitis', icdCode: 'K35',
    organSystem: 'GI', category: 'surgical_RLQ',
    ageRange: [1, 90], agePeak: [10, 30],
    sexPredilection: 'male', backgroundPrevalence: 0.07,
    redFlags: ['peritonism', 'rigidity', 'fever_chills'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Periumbilical', 'Right lower quadrant', 'Periumbilical → RLQ'],
      character: ['Dull ache', 'Sharp or stabbing'], radiation: ['No radiation', 'To the groin'],
      severity: '4-8/10', timing: ['Constant, worsening'],
      exacerbating: ['Movement', 'Coughing'], relieving: ['Lying still'],
    },
  },
  {
    diseaseId: 'meckel_diverticulitis', diseaseName: 'Meckel Diverticulitis', icdCode: 'Q43.0',
    organSystem: 'GI', category: 'surgical_RLQ',
    ageRange: [0, 30], agePeak: [2, 8],
    sexPredilection: 'male', backgroundPrevalence: 0.02,
    redFlags: ['hematochezia', 'peritonism'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Right lower quadrant'],
      character: ['Sharp or stabbing', 'Cramping'], radiation: ['No radiation'],
      severity: '4-7/10', timing: ['Constant with colicky exacerbations'],
      exacerbating: ['Movement'], relieving: [],
    },
  },
  {
    diseaseId: 'ileocecal_tb', diseaseName: 'Ileocecal Tuberculosis', icdCode: 'A18.32',
    organSystem: 'GI', category: 'surgical_RLQ',
    ageRange: [15, 60], agePeak: [20, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    redFlags: ['weight_loss', 'night_sweats'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Right lower quadrant'],
      character: ['Dull ache'], radiation: [],
      severity: '2-5/10', timing: ['Chronic, intermittent'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'terminal_ileitis_crohn', diseaseName: 'Terminal Ileitis (Crohn Disease)', icdCode: 'K50.0',
    organSystem: 'GI', category: 'surgical_RLQ',
    ageRange: [10, 50], agePeak: [15, 35],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    redFlags: ['weight_loss', 'chronic_diarrhea'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Right lower quadrant'],
      character: ['Cramping', 'Dull ache'], radiation: [],
      severity: '3-7/10', timing: ['Chronic, relapsing-remitting'],
      exacerbating: ['Eating'], relieving: ['Passing stool'],
    },
  },

  // ── Surgical: Right Upper Quadrant ─────────────────────────────────────
  {
    diseaseId: 'acute_cholecystitis', diseaseName: 'Acute Cholecystitis', icdCode: 'K81.0',
    organSystem: 'hepatobiliary', category: 'surgical_RUQ',
    ageRange: [20, 90], agePeak: [30, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.05,
    redFlags: ['fever_chills', 'jaundice', 'peritonism'],
    typicalSocrates: {
      onset: ['Gradual over hours', 'Sudden over minutes'], location: ['Right upper quadrant', 'Epigastrium'],
      character: ['Sharp or stabbing', 'Dull ache'], radiation: ['To the right shoulder', 'To the back'],
      severity: '5-9/10', timing: ['Constant, may wax/wane'],
      exacerbating: ['Deep breathing', 'Eating fatty food'], relieving: ['Lying still'],
    },
  },
  {
    diseaseId: 'choledocholithiasis', diseaseName: 'Choledocholithiasis', icdCode: 'K80.5',
    organSystem: 'hepatobiliary', category: 'surgical_RUQ',
    ageRange: [20, 90], agePeak: [30, 70],
    sexPredilection: 'female', backgroundPrevalence: 0.03,
    redFlags: ['jaundice', 'fever_chills', 'dark_urine'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Right upper quadrant', 'Epigastrium'],
      character: ['Sharp or stabbing', 'Cramping'], radiation: ['To the back', 'To the right shoulder'],
      severity: '6-10/10', timing: ['Colicky, intermittent'],
      exacerbating: ['Eating'], relieving: [],
    },
  },
  {
    diseaseId: 'cholangitis', diseaseName: 'Ascending Cholangitis', icdCode: 'K83.0',
    organSystem: 'hepatobiliary', category: 'surgical_RUQ',
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    redFlags: ['fever_chills', 'jaundice', 'hypotension', 'confusion'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Right upper quadrant', 'Epigastrium'],
      character: ['Sharp or stabbing'], radiation: ['To the back'],
      severity: '6-10/10', timing: ['Constant, severe'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'hepatic_abscess', diseaseName: 'Hepatic Abscess (Pyogenic/Amoebic)', icdCode: 'K75.0',
    organSystem: 'hepatobiliary', category: 'surgical_RUQ',
    ageRange: [20, 80], agePeak: [30, 60],
    sexPredilection: 'male', backgroundPrevalence: 0.005,
    redFlags: ['fever_chills', 'weight_loss', 'night_sweats'],
    typicalSocrates: {
      onset: ['Gradual over hours', 'Gradual over days'], location: ['Right upper quadrant'],
      character: ['Dull ache', 'Sharp or stabbing'], radiation: ['To the right shoulder'],
      severity: '4-8/10', timing: ['Constant, progressive'],
      exacerbating: ['Deep breathing'], relieving: [],
    },
  },

  // ── Surgical: Epigastric ─────────────────────────────────────────────
  {
    diseaseId: 'perforated_peptic_ulcer', diseaseName: 'Perforated Peptic Ulcer', icdCode: 'K25.1',
    organSystem: 'GI', category: 'surgical_epigastric',
    ageRange: [20, 90], agePeak: [30, 60],
    sexPredilection: 'male', backgroundPrevalence: 0.02,
    redFlags: ['rigidity', 'peritonism', 'syncope'],
    typicalSocrates: {
      onset: ['Instantaneous — peak in seconds'], location: ['Epigastrium', 'Diffuse — all over'],
      character: ['Sharp or stabbing', 'Tearing or ripping'], radiation: ['To the back', 'To the right shoulder'],
      severity: '8-10/10', timing: ['Constant, unremitting'],
      exacerbating: ['Movement', 'Deep breathing'], relieving: ['Lying still'],
    },
  },
  {
    diseaseId: 'acute_pancreatitis', diseaseName: 'Acute Pancreatitis', icdCode: 'K85',
    organSystem: 'pancreatic', category: 'surgical_epigastric',
    ageRange: [20, 90], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    redFlags: ['hypotension', 'respiratory_distress', 'oliguria'],
    typicalSocrates: {
      onset: ['Sudden over minutes', 'Gradual over hours'], location: ['Epigastrium'],
      character: ['Gnawing', 'Sharp or stabbing'], radiation: ['To the back'],
      severity: '7-10/10', timing: ['Constant, severe'],
      exacerbating: ['Eating', 'Drinking', 'Lying flat'], relieving: ['Bending forward'],
    },
  },
  {
    diseaseId: 'gastric_ulcer', diseaseName: 'Gastric Ulcer', icdCode: 'K25',
    organSystem: 'GI', category: 'surgical_epigastric',
    ageRange: [20, 80], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.04,
    redFlags: ['hematemesis', 'melena', 'weight_loss'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Epigastrium'],
      character: ['Gnawing', 'Burning', 'Dull ache'], radiation: ['To the back'],
      severity: '3-7/10', timing: ['Constant or intermittent'],
      exacerbating: ['Eating'], relieving: ['Antacids'],
    },
  },
  {
    diseaseId: 'duodenal_ulcer', diseaseName: 'Duodenal Ulcer', icdCode: 'K26',
    organSystem: 'GI', category: 'surgical_epigastric',
    ageRange: [20, 80], agePeak: [30, 60],
    sexPredilection: 'male', backgroundPrevalence: 0.04,
    redFlags: ['hematemesis', 'melena', 'perforation_signs'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Epigastrium'],
      character: ['Gnawing', 'Burning'], radiation: ['To the back'],
      severity: '3-6/10', timing: ['Intermittent, meal-related'],
      exacerbating: ['Empty stomach', 'Night'], relieving: ['Eating', 'Antacids'],
    },
  },

  // ── Medical: Hepatobiliary ───────────────────────────────────────────
  {
    diseaseId: 'acute_hepatitis', diseaseName: 'Acute Hepatitis (Viral/Autoimmune)', icdCode: 'B15-B19',
    organSystem: 'hepatobiliary', category: 'medical_hepatic',
    ageRange: [1, 80], agePeak: [15, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    redFlags: ['jaundice', 'confusion', 'coagulopathy'],
    typicalSocrates: {
      onset: ['Gradual over hours', 'Gradual over days'], location: ['Right upper quadrant', 'Epigastrium'],
      character: ['Dull ache'], radiation: [],
      severity: '2-5/10', timing: ['Constant'],
      exacerbating: ['Eating fatty food'], relieving: [],
    },
  },
  {
    diseaseId: 'fatty_liver_steatohepatitis', diseaseName: 'Fatty Liver / Steatohepatitis', icdCode: 'K76.0',
    organSystem: 'hepatobiliary', category: 'medical_hepatic',
    ageRange: [20, 80], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.1,
    redFlags: ['jaundice', 'ascites'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Right upper quadrant', 'Epigastrium'],
      character: ['Dull ache'], radiation: [],
      severity: '1-4/10', timing: ['Constant, mild'],
      exacerbating: [], relieving: [],
    },
  },

  // ── Medical: Gastric ─────────────────────────────────────────────────
  {
    diseaseId: 'acute_gastritis', diseaseName: 'Acute Gastritis', icdCode: 'K29.0',
    organSystem: 'GI', category: 'medical_gastric',
    ageRange: [1, 90], agePeak: [20, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.08,
    redFlags: ['hematemesis', 'melena'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Epigastrium'],
      character: ['Burning', 'Gnawing'], radiation: [],
      severity: '2-6/10', timing: ['Intermittent, postprandial'],
      exacerbating: ['Spicy food', 'Alcohol', 'NSAIDs'], relieving: ['Antacids'],
    },
  },
  {
    diseaseId: 'gastroesophageal_reflux', diseaseName: 'Gastroesophageal Reflux (GERD)', icdCode: 'K21.0',
    organSystem: 'GI', category: 'medical_gastric',
    ageRange: [1, 90], agePeak: [30, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.15,
    redFlags: ['dysphagia', 'weight_loss', 'hematemesis'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Epigastrium', 'Retrosternal'],
      character: ['Burning'], radiation: ['To the throat'],
      severity: '2-6/10', timing: ['Postprandial, nocturnal'],
      exacerbating: ['Lying down', 'Bending', 'Large meals'], relieving: ['Antacids', 'Sitting up'],
    },
  },
  {
    diseaseId: 'functional_dyspepsia', diseaseName: 'Functional Dyspepsia', icdCode: 'K30',
    organSystem: 'GI', category: 'medical_gastric',
    ageRange: [15, 80], agePeak: [20, 50],
    sexPredilection: 'none', backgroundPrevalence: 0.1,
    redFlags: [],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Epigastrium'],
      character: ['Dull ache', 'Burning'], radiation: [],
      severity: '2-5/10', timing: ['Intermittent'],
      exacerbating: ['Eating', 'Stress'], relieving: ['Rest'],
    },
  },

  // ── Intestinal / Colonic ─────────────────────────────────────────────
  {
    diseaseId: 'small_bowel_obstruction', diseaseName: 'Small Bowel Obstruction', icdCode: 'K56.5',
    organSystem: 'GI', category: 'surgical_intestinal',
    ageRange: [1, 90], agePeak: [20, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.03,
    redFlags: ['obstipation', 'vomiting_feculent', 'peritonism'],
    typicalSocrates: {
      onset: ['Sudden over minutes', 'Gradual over hours'], location: ['Periumbilical', 'Diffuse'],
      character: ['Cramping — comes in waves'], radiation: [],
      severity: '5-9/10', timing: ['Colicky, intermittent'],
      exacerbating: ['Eating'], relieving: ['Vomiting', 'Nil per mouth'],
    },
  },
  {
    diseaseId: 'large_bowel_obstruction', diseaseName: 'Large Bowel Obstruction', icdCode: 'K56.6',
    organSystem: 'GI', category: 'surgical_intestinal',
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    redFlags: ['obstipation', 'abdominal_distension', 'peritonism'],
    typicalSocrates: {
      onset: ['Gradual over hours', 'Gradual over days'], location: ['Suprapubic', 'Diffuse', 'Left lower quadrant'],
      character: ['Cramping'], radiation: [],
      severity: '4-8/10', timing: ['Colicky, intermittent → constant'],
      exacerbating: [], relieving: ['Passing stool'],
    },
  },
  {
    diseaseId: 'acute_colitis', diseaseName: 'Acute Colitis (Infectious/IBD/Ischemic)', icdCode: 'K51.9',
    organSystem: 'GI', category: 'medical_intestinal',
    ageRange: [1, 90], agePeak: [20, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    redFlags: ['hematochezia', 'fever_chills', 'toxic_megacolon'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Suprapubic', 'Left lower quadrant', 'Diffuse'],
      character: ['Cramping'], radiation: [],
      severity: '3-7/10', timing: ['Colicky, with bowel movements'],
      exacerbating: ['Eating'], relieving: ['Passing stool'],
    },
  },
  {
    diseaseId: 'diverticulitis', diseaseName: 'Acute Diverticulitis', icdCode: 'K57.3',
    organSystem: 'GI', category: 'surgical_intestinal',
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.04,
    redFlags: ['peritonism', 'hematochezia', 'obstipation'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Left lower quadrant'],
      character: ['Sharp or stabbing', 'Dull ache'], radiation: [],
      severity: '5-9/10', timing: ['Constant, progressive'],
      exacerbating: ['Movement', 'Eating'], relieving: ['Rest'],
    },
  },
  {
    diseaseId: 'irritable_bowel_syndrome', diseaseName: 'Irritable Bowel Syndrome (IBS)', icdCode: 'K58',
    organSystem: 'GI', category: 'medical_intestinal',
    ageRange: [15, 70], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.1,
    redFlags: [],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Diffuse', 'Left lower quadrant', 'Suprapubic'],
      character: ['Cramping', 'Dull ache'], radiation: [],
      severity: '2-7/10', timing: ['Intermittent, with bowel habit change'],
      exacerbating: ['Stress', 'Eating', 'Specific foods'], relieving: ['Passing stool', 'Passing gas'],
    },
  },

  // ── Vascular ──────────────────────────────────────────────────────────
  {
    diseaseId: 'ruptured_aaa', diseaseName: 'Ruptured Abdominal Aortic Aneurysm (AAA)', icdCode: 'I71.3',
    organSystem: 'cardiovascular', category: 'vascular_catastrophic',
    ageRange: [50, 90], agePeak: [65, 85],
    sexPredilection: 'male', backgroundPrevalence: 0.005,
    redFlags: ['syncope', 'hypotension', 'pulsatile_mass'],
    typicalSocrates: {
      onset: ['Instantaneous — peak in seconds'], location: ['Flank or back', 'Diffuse'],
      character: ['Tearing or ripping', 'Sharp or stabbing'], radiation: ['To the back', 'To the groin'],
      severity: '9-10/10', timing: ['Constant, unremitting'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'symptomatic_aaa', diseaseName: 'Symptomatic AAA (Leaking/Expanding)', icdCode: 'I71.4',
    organSystem: 'cardiovascular', category: 'vascular_catastrophic',
    ageRange: [50, 90], agePeak: [60, 85],
    sexPredilection: 'male', backgroundPrevalence: 0.008,
    redFlags: ['pulsatile_mass', 'syncope', 'hypotension'],
    typicalSocrates: {
      onset: ['Gradual over hours', 'Sudden over minutes'], location: ['Flank or back', 'Periumbilical'],
      character: ['Dull ache', 'Gnawing'], radiation: ['To the back', 'To the groin'],
      severity: '4-8/10', timing: ['Constant, may worsen suddenly'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'acute_mesenteric_ischemia', diseaseName: 'Acute Mesenteric Ischemia', icdCode: 'K55.0',
    organSystem: 'cardiovascular', category: 'vascular_catastrophic',
    ageRange: [40, 90], agePeak: [60, 85],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    redFlags: ['atrial_fibrillation', 'peritonism', 'hematochezia'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Periumbilical', 'Diffuse'],
      character: ['Sharp or stabbing', 'Tearing or ripping'], radiation: ['To the back'],
      severity: '8-10/10', timing: ['Constant, severe, out of proportion to exam'],
      exacerbating: ['Movement'], relieving: [],
    },
  },
  {
    diseaseId: 'chronic_mesenteric_ischemia', diseaseName: 'Chronic Mesenteric Ischemia (Abdominal Angina)', icdCode: 'K55.1',
    organSystem: 'cardiovascular', category: 'vascular',
    ageRange: [40, 90], agePeak: [55, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.002,
    redFlags: ['weight_loss', 'food_fear'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Epigastrium', 'Periumbilical'],
      character: ['Cramping', 'Dull ache'], radiation: [],
      severity: '3-7/10', timing: ['Postprandial, 30-60 min after meals'],
      exacerbating: ['Eating'], relieving: ['Fasting', 'Small meals'],
    },
  },

  // ── Urological ───────────────────────────────────────────────────────
  {
    diseaseId: 'ureteric_colic', diseaseName: 'Ureteric Colic (Nephrolithiasis)', icdCode: 'N20',
    organSystem: 'renal', category: 'urological',
    ageRange: [10, 80], agePeak: [20, 60],
    sexPredilection: 'male', backgroundPrevalence: 0.05,
    redFlags: ['anuria', 'fever_chills', 'oliguria'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Flank or back'],
      character: ['Sharp or stabbing', 'Cramping'], radiation: ['To the groin or genitals'],
      severity: '8-10/10', timing: ['Colicky, waxing and waning'],
      exacerbating: ['Movement'], relieving: ['Rest'],
    },
  },
  {
    diseaseId: 'pyelonephritis', diseaseName: 'Acute Pyelonephritis', icdCode: 'N10',
    organSystem: 'renal', category: 'urological',
    ageRange: [1, 90], agePeak: [15, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.02,
    redFlags: ['fever_chills', 'hypotension', 'vomiting'],
    typicalSocrates: {
      onset: ['Gradual over hours', 'Sudden over minutes'], location: ['Flank or back'],
      character: ['Dull ache', 'Sharp or stabbing'], radiation: ['To the groin'],
      severity: '4-8/10', timing: ['Constant, progressive'],
      exacerbating: ['Movement'], relieving: [],
    },
  },
  {
    diseaseId: 'urinary_tract_infection', diseaseName: 'Lower Urinary Tract Infection / Cystitis', icdCode: 'N30.0',
    organSystem: 'renal', category: 'urological',
    ageRange: [1, 90], agePeak: [15, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.08,
    redFlags: ['fever_chills', 'flank_pain'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Suprapubic'],
      character: ['Dull ache', 'Cramping'], radiation: [],
      severity: '2-5/10', timing: ['Constant, with urinary symptoms'],
      exacerbating: ['Urination'], relieving: [],
    },
  },
  {
    diseaseId: 'acute_prostatitis', diseaseName: 'Acute Prostatitis', icdCode: 'N41.0',
    organSystem: 'reproductive_male', category: 'urological',
    ageRange: [20, 80], agePeak: [30, 60],
    sexPredilection: 'male', backgroundPrevalence: 0.005,
    redFlags: ['fever_chills', 'urinary_retention'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Suprapubic', 'Perineum'],
      character: ['Dull ache', 'Sharp or stabbing'], radiation: ['To the back', 'To the groin'],
      severity: '3-7/10', timing: ['Constant'],
      exacerbating: ['Sitting', 'Urination'], relieving: [],
    },
  },

  // ── Gynaecological ────────────────────────────────────────────────────
  {
    diseaseId: 'ectopic_pregnancy', diseaseName: 'Ectopic Pregnancy', icdCode: 'O00',
    organSystem: 'reproductive_female', category: 'gynaecological_emergency',
    ageRange: [15, 50], agePeak: [20, 35],
    sexPredilection: 'female', backgroundPrevalence: 0.015,
    redFlags: ['syncope', 'hypotension', 'shoulder_tip_pain'],
    typicalSocrates: {
      onset: ['Sudden over minutes', 'Gradual over hours'], location: ['Right lower quadrant', 'Left lower quadrant', 'Suprapubic'],
      character: ['Sharp or stabbing'], radiation: ['To the shoulder'],
      severity: '5-10/10', timing: ['Constant or colicky'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'ovarian_cyst_rupture', diseaseName: 'Ovarian Cyst Rupture', icdCode: 'N83.1',
    organSystem: 'reproductive_female', category: 'gynaecological',
    ageRange: [15, 50], agePeak: [20, 40],
    sexPredilection: 'female', backgroundPrevalence: 0.01,
    redFlags: ['syncope', 'hypotension'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Right lower quadrant', 'Left lower quadrant'],
      character: ['Sharp or stabbing'], radiation: ['To the groin'],
      severity: '5-9/10', timing: ['Sudden, may improve over hours'],
      exacerbating: ['Movement'], relieving: [],
    },
  },
  {
    diseaseId: 'ovarian_torsion', diseaseName: 'Ovarian Torsion', icdCode: 'N83.5',
    organSystem: 'reproductive_female', category: 'gynaecological_emergency',
    ageRange: [10, 50], agePeak: [15, 35],
    sexPredilection: 'female', backgroundPrevalence: 0.003,
    redFlags: ['vomiting', 'syncope'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Right lower quadrant', 'Left lower quadrant'],
      character: ['Sharp or stabbing', 'Cramping'], radiation: ['To the groin', 'To the thigh'],
      severity: '7-10/10', timing: ['Constant, severe'],
      exacerbating: ['Movement'], relieving: [],
    },
  },
  {
    diseaseId: 'pelvic_inflammatory_disease', diseaseName: 'Pelvic Inflammatory Disease (PID)', icdCode: 'N73.0',
    organSystem: 'reproductive_female', category: 'gynaecological',
    ageRange: [15, 50], agePeak: [20, 35],
    sexPredilection: 'female', backgroundPrevalence: 0.02,
    redFlags: ['fever_chills', 'peritonism'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Suprapubic', 'Bilateral lower quadrants'],
      character: ['Dull ache', 'Sharp or stabbing'], radiation: [],
      severity: '3-7/10', timing: ['Constant'],
      exacerbating: ['Movement', 'Intercourse'], relieving: [],
    },
  },
  {
    diseaseId: 'miscarriage', diseaseName: 'Threatened/Incomplete Miscarriage', icdCode: 'O03',
    organSystem: 'reproductive_female', category: 'gynaecological',
    ageRange: [15, 50], agePeak: [20, 40],
    sexPredilection: 'female', backgroundPrevalence: 0.03,
    redFlags: ['heavy_vaginal_bleeding', 'syncope', 'hypotension'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Suprapubic'],
      character: ['Cramping'], radiation: ['To the back', 'To the groin'],
      severity: '3-8/10', timing: ['Colicky, intermittent'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'fibroid_degeneration', diseaseName: 'Uterine Fibroid Degeneration', icdCode: 'D25',
    organSystem: 'reproductive_female', category: 'gynaecological',
    ageRange: [25, 55], agePeak: [35, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.03,
    redFlags: ['fever', 'heavy_vaginal_bleeding'],
    typicalSocrates: {
      onset: ['Gradual over hours', 'Sudden over minutes'], location: ['Suprapubic'],
      character: ['Sharp or stabbing', 'Dull ache'], radiation: ['To the back'],
      severity: '4-8/10', timing: ['Constant, may wax/wane'],
      exacerbating: ['Movement', 'Urination'], relieving: [],
    },
  },
  {
    diseaseId: 'endometriosis', diseaseName: 'Endometriosis', icdCode: 'N80',
    organSystem: 'reproductive_female', category: 'gynaecological',
    ageRange: [15, 55], agePeak: [25, 45],
    sexPredilection: 'female', backgroundPrevalence: 0.06,
    redFlags: ['infertility'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Suprapubic', 'Bilateral lower quadrants'],
      character: ['Cramping', 'Dull ache'], radiation: ['To the back', 'To the thigh'],
      severity: '3-8/10', timing: ['Cyclic, menstrual-related'],
      exacerbating: ['Menstruation', 'Intercourse'], relieving: ['Rest', 'NSAIDs'],
    },
  },
  {
    diseaseId: 'dysmenorrhea', diseaseName: 'Primary Dysmenorrhea', icdCode: 'N94.4',
    organSystem: 'reproductive_female', category: 'gynaecological',
    ageRange: [12, 50], agePeak: [15, 30],
    sexPredilection: 'female', backgroundPrevalence: 0.2,
    redFlags: [],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Suprapubic'],
      character: ['Cramping'], radiation: ['To the back', 'To the thigh'],
      severity: '3-7/10', timing: ['Cyclic, with menstruation'],
      exacerbating: ['Menstruation'], relieving: ['Rest', 'NSAIDs', 'Heat'],
    },
  },
  {
    diseaseId: 'mittelschmerz', diseaseName: 'Mittelschmerz (Ovulation Pain)', icdCode: 'N94',
    organSystem: 'reproductive_female', category: 'gynaecological',
    ageRange: [15, 50], agePeak: [20, 40],
    sexPredilection: 'female', backgroundPrevalence: 0.05,
    redFlags: [],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Right lower quadrant', 'Left lower quadrant'],
      character: ['Sharp or stabbing', 'Dull ache'], radiation: [],
      severity: '2-5/10', timing: ['Mid-cycle, brief (hours)'],
      exacerbating: ['Movement'], relieving: ['Rest'],
    },
  },
  {
    diseaseId: 'placental_abruption', diseaseName: 'Placental Abruption', icdCode: 'O45',
    organSystem: 'reproductive_female', category: 'obstetric',
    ageRange: [15, 50], agePeak: [20, 40],
    sexPredilection: 'female', backgroundPrevalence: 0.005,
    redFlags: ['vaginal_bleeding', 'uterine_tenderness', 'fetal_distress'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Diffuse', 'Suprapubic'],
      character: ['Sharp or stabbing', 'Tearing or ripping'], radiation: ['To the back'],
      severity: '6-10/10', timing: ['Constant, severe'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'preeclampsia_hellp', diseaseName: 'Preeclampsia / HELLP Syndrome', icdCode: 'O14',
    organSystem: 'reproductive_female', category: 'obstetric',
    ageRange: [15, 50], agePeak: [20, 40],
    sexPredilection: 'female', backgroundPrevalence: 0.005,
    redFlags: ['hypertension', 'seizures', 'visual_disturbance'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Right upper quadrant', 'Epigastrium'],
      character: ['Sharp or stabbing', 'Dull ache'], radiation: [],
      severity: '4-8/10', timing: ['Constant'],
      exacerbating: [], relieving: [],
    },
  },

  // ── Systemic / Medical ──────────────────────────────────────────────
  {
    diseaseId: 'diabetic_ketoacidosis', diseaseName: 'Diabetic Ketoacidosis (DKA)', icdCode: 'E10.1',
    organSystem: 'endocrine', category: 'medical_systemic',
    ageRange: [1, 80], agePeak: [10, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    redFlags: ['kussmaul_respirations', 'vomiting', 'confusion'],
    typicalSocrates: {
      onset: ['Gradual over hours', 'Gradual over days'], location: ['Diffuse', 'Epigastrium'],
      character: ['Dull ache', 'Cramping'], radiation: [],
      severity: '2-6/10', timing: ['Constant, with systemic symptoms'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'addison_crisis', diseaseName: 'Addisonian Crisis', icdCode: 'E27.2',
    organSystem: 'endocrine', category: 'medical_systemic',
    ageRange: [1, 80], agePeak: [20, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.0005,
    redFlags: ['hypotension', 'vomiting', 'confusion'],
    typicalSocrates: {
      onset: ['Gradual over hours', 'Gradual over days'], location: ['Diffuse'],
      character: ['Dull ache', 'Cramping'], radiation: [],
      severity: '3-6/10', timing: ['Constant'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'familial_mediterranean_fever', diseaseName: 'Familial Mediterranean Fever (FMF)', icdCode: 'E85.0',
    organSystem: 'metabolic', category: 'medical_systemic',
    ageRange: [1, 60], agePeak: [5, 30],
    sexPredilection: 'none', backgroundPrevalence: 0.002,
    redFlags: ['fever'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Diffuse'],
      character: ['Sharp or stabbing', 'Cramping'], radiation: [],
      severity: '5-8/10', timing: ['Episodic, self-limiting (24-72h)'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'sickle_cell_crisis', diseaseName: 'Sickle Cell Vaso-occlusive Crisis', icdCode: 'D57.0',
    organSystem: 'haematological', category: 'medical_systemic',
    ageRange: [1, 60], agePeak: [5, 30],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    redFlags: ['fever', 'chest_pain', 'stroke_symptoms'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Diffuse', 'Flank or back', 'Chest'],
      character: ['Sharp or stabbing', 'Dull ache'], radiation: [],
      severity: '6-10/10', timing: ['Constant, severe'],
      exacerbating: ['Dehydration', 'Cold', 'Infection'], relieving: [],
    },
  },
  {
    diseaseId: 'acute_porphyria', diseaseName: 'Acute Intermittent Porphyria', icdCode: 'E80.2',
    organSystem: 'metabolic', category: 'medical_systemic',
    ageRange: [15, 60], agePeak: [20, 40],
    sexPredilection: 'female', backgroundPrevalence: 0.0005,
    redFlags: ['neurological_deficit', 'psychiatric_symptoms'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Diffuse'],
      character: ['Cramping', 'Sharp or stabbing'], radiation: [],
      severity: '5-9/10', timing: ['Episodic, days to weeks'],
      exacerbating: ['Certain drugs', 'Alcohol', 'Fasting'], relieving: [],
    },
  },
  {
    diseaseId: 'lead_poisoning', diseaseName: 'Lead Poisoning', icdCode: 'T56.0',
    organSystem: 'metabolic', category: 'medical_systemic',
    ageRange: [1, 80], agePeak: [1, 10],
    sexPredilection: 'none', backgroundPrevalence: 0.001,
    redFlags: ['seizures', 'encephalopathy'],
    typicalSocrates: {
      onset: ['Gradual over hours', 'Gradual over weeks'], location: ['Diffuse'],
      character: ['Cramping', 'Dull ache'], radiation: [],
      severity: '3-7/10', timing: ['Chronic, intermittent'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'herpes_zoster', diseaseName: 'Herpes Zoster (Pre-eruptive)', icdCode: 'B02',
    organSystem: 'infectious', category: 'medical_systemic',
    ageRange: [1, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    redFlags: ['immunosuppression'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Dermatomal'],
      character: ['Burning', 'Sharp or stabbing'], radiation: ['Dermatomal distribution'],
      severity: '4-8/10', timing: ['Constant, burning'],
      exacerbating: ['Touch', 'Movement'], relieving: [],
    },
  },
  {
    diseaseId: 'abdominal_tuberculosis', diseaseName: 'Abdominal Tuberculosis', icdCode: 'A18.39',
    organSystem: 'infectious', category: 'medical_systemic',
    ageRange: [10, 80], agePeak: [20, 50],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    redFlags: ['weight_loss', 'night_sweats', 'ascites'],
    typicalSocrates: {
      onset: ['Gradual over hours', 'Gradual over weeks'], location: ['Diffuse', 'Right lower quadrant'],
      character: ['Dull ache', 'Cramping'], radiation: [],
      severity: '2-6/10', timing: ['Chronic, progressive'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'typhoid_perforation', diseaseName: 'Typhoid Ileal Perforation', icdCode: 'A01.0',
    organSystem: 'infectious', category: 'infectious',
    ageRange: [5, 60], agePeak: [10, 30],
    sexPredilection: 'none', backgroundPrevalence: 0.002,
    redFlags: ['fever', 'peritonism', 'rigidity'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Diffuse', 'Right lower quadrant'],
      character: ['Sharp or stabbing'], radiation: [],
      severity: '7-10/10', timing: ['Constant, severe'],
      exacerbating: ['Movement'], relieving: [],
    },
  },

  // ── Paediatric ───────────────────────────────────────────────────────
  {
    diseaseId: 'infantile_colic', diseaseName: 'Infantile Colic', icdCode: 'R10.83',
    organSystem: 'GI', category: 'paediatric',
    ageRange: [0, 1], agePeak: [0.08, 0.5],
    sexPredilection: 'none', backgroundPrevalence: 0.15,
    redFlags: [],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Diffuse'],
      character: ['Cramping'], radiation: [],
      severity: '3-6/10', timing: ['Episodic, evenings'],
      exacerbating: [], relieving: ['Passing gas'],
    },
  },
  {
    diseaseId: 'intussusception', diseaseName: 'Intussusception', icdCode: 'K56.1',
    organSystem: 'GI', category: 'paediatric',
    ageRange: [0.17, 5], agePeak: [0.5, 2],
    sexPredilection: 'male', backgroundPrevalence: 0.002,
    redFlags: ['currant_jelly_stool', 'vomiting_bilious', 'lethargy'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Periumbilical', 'Right lower quadrant'],
      character: ['Cramping — comes in waves'], radiation: [],
      severity: '7-10/10', timing: ['Colicky, periodic (every 15-20 min)'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'malrotation_volvulus', diseaseName: 'Malrotation with Midgut Volvulus', icdCode: 'Q43.3',
    organSystem: 'GI', category: 'paediatric',
    ageRange: [0, 2], agePeak: [0, 0.5],
    sexPredilection: 'none', backgroundPrevalence: 0.0005,
    redFlags: ['vomiting_bilious', 'hematochezia', 'shock'],
    typicalSocrates: {
      onset: ['Sudden over minutes'], location: ['Epigastrium', 'Diffuse'],
      character: ['Sharp or stabbing'], radiation: [],
      severity: '7-10/10', timing: ['Constant, severe'],
      exacerbating: [], relieving: [],
    },
  },
  {
    diseaseId: 'hypertrophic_pyloric_stenosis', diseaseName: 'Hypertrophic Pyloric Stenosis', icdCode: 'Q40.0',
    organSystem: 'GI', category: 'paediatric',
    ageRange: [0.08, 0.5], agePeak: [0.08, 0.25],
    sexPredilection: 'male', backgroundPrevalence: 0.003,
    redFlags: ['vomiting_projectile', 'dehydration', 'electrolyte_imbalance'],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Epigastrium'],
      character: ['Cramping'], radiation: [],
      severity: '2-5/10', timing: ['Postprandial, progressive'],
      exacerbating: ['Feeding'], relieving: ['Vomiting'],
    },
  },
  {
    diseaseId: 'mesenteric_adenitis', diseaseName: 'Mesenteric Adenitis', icdCode: 'I88.0',
    organSystem: 'infectious', category: 'paediatric',
    ageRange: [2, 20], agePeak: [5, 15],
    sexPredilection: 'male', backgroundPrevalence: 0.01,
    redFlags: [],
    typicalSocrates: {
      onset: ['Gradual over hours'], location: ['Right lower quadrant', 'Diffuse'],
      character: ['Dull ache'], radiation: [],
      severity: '3-6/10', timing: ['Constant, with viral symptoms'],
      exacerbating: ['Movement'], relieving: [],
    },
  },
];

// ── Pattern Recognition Rules ──────────────────────────────────────────

const ABDOMINAL_PAIN_PATTERNS: PatternRule[] = [
  // RLQ patterns
  {
    id: 'rlq_peritonism', label: 'RLQ Pain with Peritoneal Signs',
    description: 'RLQ pain + peritonism + fever = surgical abdomen until proven otherwise',
    pattern: ['pain_location_now', 'peritonism', 'fever'],
    suggests: ['acute_appendicitis', 'perforated_peptic_ulcer', 'typhoid_perforation'],
    rulesOut: ['gastroenteritis', 'ibs', 'mittelschmerz'],
    priorityBoost: 30,
  },
  {
    id: 'rlq_migration', label: 'Periumbilical-to-RLQ Migration',
    description: 'Pain migrating from periumbilical region to right lower quadrant is classic for appendicitis',
    pattern: ['pain_initial_location', 'pain_location_now', 'pain_migration'],
    suggests: ['acute_appendicitis'],
    rulesOut: ['mesenteric_adenitis', 'meckel_diverticulitis'],
    priorityBoost: 25,
  },
  {
    id: 'rlq_female_reproductive', label: 'RLQ Pain in Reproductive-Age Female',
    description: 'RLQ pain + reproductive age female + LMP abnormality = rule out ectopic first',
    pattern: ['last_menstrual_period', 'vaginal_bleeding'],
    suggests: ['ectopic_pregnancy', 'ovarian_cyst_rupture', 'ovarian_torsion', 'pelvic_inflammatory_disease'],
    rulesOut: [],
    priorityBoost: 25,
  },
  {
    id: 'rlq_child', label: 'RLQ Pain in Child',
    description: 'Child with RLQ pain + intermittent colicky pattern = rule out intussusception',
    pattern: ['pain_location_now', 'age_category'],
    suggests: ['intussusception', 'meckel_diverticulitis', 'mesenteric_adenitis'],
    rulesOut: [],
    priorityBoost: 20,
  },

  // RUQ patterns
  {
    id: 'ruq_fever_jaundice', label: 'RUQ Pain + Fever + Jaundice',
    description: 'Charcot triad: RUQ pain + fever + jaundice = ascending cholangitis until proven otherwise',
    pattern: ['pain_location_now', 'fever', 'jaundice'],
    suggests: ['cholangitis', 'choledocholithiasis', 'acute_cholecystitis'],
    rulesOut: [],
    priorityBoost: 30,
  },
  {
    id: 'ruq_postprandial_fatty', label: 'RUQ Pain After Fatty Meals',
    description: 'RUQ colicky pain after fatty meals + known gallstones = biliary colic',
    pattern: ['pain_location_now', 'pain_character', 'known_gallstones'],
    suggests: ['acute_cholecystitis', 'choledocholithiasis'],
    rulesOut: ['hepatic_abscess', 'acute_hepatitis'],
    priorityBoost: 20,
  },
  {
    id: 'ruq_third_trimester', label: 'RUQ Pain in Third Trimester',
    description: 'Pregnant patient in third trimester with RUQ pain = preeclampsia/HELLP until proven otherwise',
    pattern: ['pain_location_now', 'pregnancy_gestational_age'],
    suggests: ['preeclampsia_hellp', 'placental_abruption'],
    rulesOut: ['acute_cholecystitis', 'acute_hepatitis'],
    priorityBoost: 30,
  },

  // Epigastric patterns
  {
    id: 'epigastric_instant_onset', label: 'Instant Onset Epigastric Pain',
    description: 'Instantaneous severe epigastric pain = catastrophic event (perforation, pancreatitis, AAA rupture)',
    pattern: ['pain_onset', 'pain_initial_location', 'pain_severity'],
    suggests: ['perforated_peptic_ulcer', 'acute_pancreatitis', 'ruptured_aaa', 'acute_mesenteric_ischemia'],
    rulesOut: ['acute_gastritis', 'gastroesophageal_reflux', 'functional_dyspepsia'],
    priorityBoost: 35,
  },
  {
    id: 'epigastric_radiation_back', label: 'Epigastric Pain Radiating to Back',
    description: 'Epigastric pain radiating to the back = pancreatitis or penetrating PUD',
    pattern: ['pain_initial_location', 'pain_radiation'],
    suggests: ['acute_pancreatitis', 'perforated_peptic_ulcer', 'gastric_ulcer', 'duodenal_ulcer'],
    rulesOut: ['acute_cholecystitis', 'functional_dyspepsia'],
    priorityBoost: 20,
  },
  {
    id: 'epigastric_bending_forward', label: 'Epigastric Pain Relieved by Bending Forward',
    description: 'Pain relieved by leaning forward is classic for pancreatitis',
    pattern: ['pain_initial_location', 'pain_relieving_factors'],
    suggests: ['acute_pancreatitis'],
    rulesOut: [],
    priorityBoost: 20,
  },
  {
    id: 'epigastric_meal_relation', label: 'Meal-Related Epigastric Pain',
    description: 'Pain worse after eating (gastric ulcer) vs relieved by eating (duodenal ulcer)',
    pattern: ['pain_initial_location', 'pain_worsening_factors', 'pain_relieving_factors'],
    suggests: ['gastric_ulcer', 'duodenal_ulcer'],
    rulesOut: ['acute_pancreatitis', 'acute_cholecystitis'],
    priorityBoost: 15,
  },

  // Diffuse / vascular patterns
  {
    id: 'severe_out_of_proportion', label: 'Pain Out of Proportion to Exam',
    description: 'Severe diffuse pain with minimal or no tenderness = mesenteric ischemia until proven otherwise',
    pattern: ['pain_location_now', 'pain_severity'],
    suggests: ['acute_mesenteric_ischemia'],
    rulesOut: ['gastroenteritis', 'ibs', 'functional_dyspepsia'],
    priorityBoost: 35,
  },
  {
    id: 'diffuse_peritonism', label: 'Diffuse Pain with Peritonism',
    description: 'Diffuse pain + rigidity + peritonism = perforated viscus',
    pattern: ['pain_location_now', 'rigidity', 'peritonism'],
    suggests: ['perforated_peptic_ulcer', 'ruptured_aaa', 'typhoid_perforation'],
    rulesOut: [],
    priorityBoost: 30,
  },
  {
    id: 'pain_syncope', label: 'Abdominal Pain with Syncope',
    description: 'Pain + syncope = ruptured AAA or ectopic pregnancy until proven otherwise',
    pattern: ['syncope'],
    suggests: ['ruptured_aaa', 'ectopic_pregnancy', 'perforated_peptic_ulcer'],
    rulesOut: [],
    priorityBoost: 35,
  },
  {
    id: 'pain_afib', label: 'Pain in Patient with Atrial Fibrillation',
    description: 'Abdominal pain + AFib + severe = mesenteric ischemia',
    pattern: ['known_afib', 'pain_severity'],
    suggests: ['acute_mesenteric_ischemia'],
    rulesOut: [],
    priorityBoost: 30,
  },

  // Colicky / obstructive patterns
  {
    id: 'colicky_with_vomiting', label: 'Colicky Pain with Vomiting',
    description: 'Waves of colicky pain + vomiting + obstipation = bowel obstruction',
    pattern: ['pain_character', 'vomiting', 'obstipation'],
    suggests: ['small_bowel_obstruction', 'large_bowel_obstruction', 'intussusception'],
    rulesOut: ['gastroenteritis', 'acute_gastritis'],
    priorityBoost: 25,
  },
  {
    id: 'left_iliac_fossa_fever', label: 'Left Iliac Fossa Pain + Fever',
    description: 'LLQ pain + fever + altered bowel habits = diverticulitis',
    pattern: ['pain_location_now', 'fever', 'bowel_habits'],
    suggests: ['diverticulitis', 'acute_colitis'],
    rulesOut: ['ureteric_colic', 'ibs'],
    priorityBoost: 20,
  },
  {
    id: 'flank_radiation_groin', label: 'Flank Pain Radiating to Groin',
    description: 'Flank pain radiating to groin + hematuria = ureteric colic',
    pattern: ['pain_initial_location', 'pain_radiation', 'hematuria'],
    suggests: ['ureteric_colic'],
    rulesOut: ['pyelonephritis', 'ruptured_aaa', 'acute_pancreatitis'],
    priorityBoost: 20,
  },
  {
    id: 'flank_fever_dysuria', label: 'Flank Pain + Fever + Dysuria',
    description: 'Flank pain with fever and urinary symptoms = pyelonephritis',
    pattern: ['flank_pain', 'fever', 'dysuria'],
    suggests: ['pyelonephritis'],
    rulesOut: ['ureteric_colic', 'ruptured_aaa'],
    priorityBoost: 15,
  },

  // Systemic disease patterns
  {
    id: 'diabetic_with_pain', label: 'Diabetic with Abdominal Pain',
    description: 'Known diabetic with abdominal pain + vomiting = DKA until proven otherwise',
    pattern: ['diabetes', 'vomiting'],
    suggests: ['diabetic_ketoacidosis'],
    rulesOut: [],
    priorityBoost: 25,
  },
  {
    id: 'elderly_vascular', label: 'Elderly Patient with Abdominal Pain',
    description: 'Age > 60 + any abdominal pain = MUST rule out AAA, mesenteric ischemia',
    pattern: ['age_category'],
    suggests: ['ruptured_aaa', 'symptomatic_aaa', 'acute_mesenteric_ischemia', 'chronic_mesenteric_ischemia'],
    rulesOut: [],
    priorityBoost: 20,
  },
  {
    id: 'postop_early_pain', label: 'Early Post-Operative Abdominal Pain',
    description: 'Post-operative day 1-3 with pain = leak, abscess, or ileus',
    pattern: ['postoperative_state'],
    suggests: ['anastomotic_leak', 'intraabdominal_abscess', 'postoperative_ileus'],
    rulesOut: [],
    priorityBoost: 25,
  },
  {
    id: 'immunocompromised_pain', label: 'Immunocompromised with Abdominal Pain',
    description: 'HIV/immunosuppressed + pain = atypical presentations, CMV, TB, lymphoma',
    pattern: ['hiv_status', 'immunosuppression'],
    suggests: ['abdominal_tuberculosis', 'cmv_colitis', 'lymphoma'],
    rulesOut: [],
    priorityBoost: 20,
  },
  {
    id: 'sickle_cell_crisis_pain', label: 'Sickle Cell Patient with Abdominal Pain',
    description: 'Sickle cell patient + diffuse severe pain = vaso-occlusive crisis',
    pattern: ['known_sickle_cell', 'pain_location_now', 'pain_severity'],
    suggests: ['sickle_cell_crisis'],
    rulesOut: ['acute_appendicitis', 'acute_cholecystitis'],
    priorityBoost: 20,
  },
  {
    id: 'weight_loss_chronic_pain', label: 'Chronic Pain + Weight Loss + Night Sweats',
    description: 'Chronic abdominal pain with constitutional symptoms = malignancy or TB',
    pattern: ['weight_loss', 'night_sweats', 'pain_onset'],
    suggests: ['abdominal_tuberculosis', 'ileocecal_tb', 'gastric_cancer', 'colon_cancer', 'pancreatic_cancer'],
    rulesOut: ['ibs', 'functional_dyspepsia'],
    priorityBoost: 20,
  },
  {
    id: 'substance_use_acute_pain', label: 'Substance Use + Acute Abdominal Pain',
    description: 'IVDU + abdominal pain = need to consider hepatitis, abscess, or pancreatitis',
    pattern: ['ivdu', 'pain_onset'],
    suggests: ['acute_hepatitis', 'hepatic_abscess', 'acute_pancreatitis'],
    rulesOut: [],
    priorityBoost: 15,
  },
];

// ── Organ system category maps for biodata-based DDx narrowing ─────────

const SYSTEM_CATEGORIES: Record<string, { label: string; diseases: string[]; typicalAgeRange: [number, number]; sexPredilection: 'none' | 'male' | 'female' }> = {
  surgical_RLQ: { label: 'Surgical (Right Lower Quadrant)', diseases: ['acute_appendicitis', 'meckel_diverticulitis', 'ileocecal_tb', 'terminal_ileitis_crohn'], typicalAgeRange: [10, 40], sexPredilection: 'none' },
  surgical_RUQ: { label: 'Surgical (Right Upper Quadrant)', diseases: ['acute_cholecystitis', 'choledocholithiasis', 'cholangitis', 'hepatic_abscess'], typicalAgeRange: [30, 70], sexPredilection: 'female' },
  surgical_epigastric: { label: 'Surgical (Epigastric)', diseases: ['perforated_peptic_ulcer', 'acute_pancreatitis', 'gastric_ulcer', 'duodenal_ulcer'], typicalAgeRange: [30, 70], sexPredilection: 'male' },
  surgical_intestinal: { label: 'Surgical (Intestinal)', diseases: ['small_bowel_obstruction', 'large_bowel_obstruction', 'diverticulitis'], typicalAgeRange: [40, 80], sexPredilection: 'none' },
  medical_hepatic: { label: 'Medical (Hepatobiliary)', diseases: ['acute_hepatitis', 'fatty_liver_steatohepatitis'], typicalAgeRange: [30, 80], sexPredilection: 'none' },
  medical_gastric: { label: 'Medical (Upper GI)', diseases: ['acute_gastritis', 'gastroesophageal_reflux', 'functional_dyspepsia'], typicalAgeRange: [20, 70], sexPredilection: 'none' },
  medical_intestinal: { label: 'Medical (Intestinal/Colonic)', diseases: ['acute_colitis', 'irritable_bowel_syndrome'], typicalAgeRange: [20, 60], sexPredilection: 'female' },
  vascular_catastrophic: { label: 'Vascular (Catastrophic)', diseases: ['ruptured_aaa', 'symptomatic_aaa', 'acute_mesenteric_ischemia'], typicalAgeRange: [50, 85], sexPredilection: 'male' },
  vascular: { label: 'Vascular (Chronic)', diseases: ['chronic_mesenteric_ischemia'], typicalAgeRange: [50, 85], sexPredilection: 'none' },
  urological: { label: 'Urological', diseases: ['ureteric_colic', 'pyelonephritis', 'urinary_tract_infection', 'acute_prostatitis'], typicalAgeRange: [15, 60], sexPredilection: 'female' },
  gynaecological_emergency: { label: 'Gynaecological (Emergency)', diseases: ['ectopic_pregnancy', 'ovarian_torsion', 'placental_abruption'], typicalAgeRange: [15, 50], sexPredilection: 'female' },
  gynaecological: { label: 'Gynaecological', diseases: ['ovarian_cyst_rupture', 'pelvic_inflammatory_disease', 'miscarriage', 'fibroid_degeneration', 'endometriosis', 'dysmenorrhea', 'mittelschmerz'], typicalAgeRange: [15, 50], sexPredilection: 'female' },
  obstetric: { label: 'Obstetric', diseases: ['preeclampsia_hellp', 'placental_abruption'], typicalAgeRange: [15, 50], sexPredilection: 'female' },
  medical_systemic: { label: 'Medical (Systemic/Endocrine)', diseases: ['diabetic_ketoacidosis', 'addison_crisis', 'familial_mediterranean_fever', 'sickle_cell_crisis', 'acute_porphyria', 'lead_poisoning'], typicalAgeRange: [10, 60], sexPredilection: 'female' },
  infectious: { label: 'Infectious', diseases: ['herpes_zoster', 'abdominal_tuberculosis', 'typhoid_perforation', 'mesenteric_adenitis'], typicalAgeRange: [10, 60], sexPredilection: 'none' },
  paediatric: { label: 'Paediatric', diseases: ['infantile_colic', 'intussusception', 'malrotation_volvulus', 'hypertrophic_pyloric_stenosis', 'mesenteric_adenitis'], typicalAgeRange: [0, 10], sexPredilection: 'male' },
};

// ── Public API: Generate clinical reasoning gaps ───────────────────────

export function getAbdominalPainDdx(state: EncounterBrainState): BiodataRule[] {
  return ABDOMINAL_PAIN_DDX;
}

export function getAbdominalPainPatterns(): PatternRule[] {
  return ABDOMINAL_PAIN_PATTERNS;
}

export function getSystemCategories(): Record<string, { label: string; diseases: string[]; typicalAgeRange: [number, number]; sexPredilection: 'none' | 'male' | 'female' }> {
  return SYSTEM_CATEGORIES;
}

export function getBiodataAdjustedPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;
  const region = state.patient.geographicRegion || '';

  for (const ddx of ABDOMINAL_PAIN_DDX) {
    let shift = 0;
    const reasons: string[] = [];

    if (age >= ddx.ageRange[0] && age <= ddx.ageRange[1]) {
      shift += 0.02;
      if (age >= ddx.agePeak[0] && age <= ddx.agePeak[1]) {
        shift += 0.05;
        reasons.push(`peak age ${ddx.agePeak[0]}-${ddx.agePeak[1]}`);
      } else {
        reasons.push(`within age range ${ddx.ageRange[0]}-${ddx.ageRange[1]}`);
      }
    } else {
      shift -= 0.03;
      reasons.push('outside typical age range');
    }

    if (ddx.sexPredilection === 'male' && sex === 'male') {
      shift += 0.03;
      reasons.push('male predominance');
    } else if (ddx.sexPredilection === 'female' && sex === 'female') {
      shift += 0.03;
      reasons.push('female predominance');
    }

    if (ddx.geographicPredilection) {
      for (const geo of ddx.geographicPredilection) {
        if (region.toLowerCase().includes(geo.toLowerCase())) {
          shift += 0.04;
          reasons.push(`prevalent in ${geo}`);
        }
      }
    }

    result[ddx.diseaseId] = {
      diseaseId: ddx.diseaseId,
      diseaseName: ddx.diseaseName,
      priorShift: Math.max(-0.03, Math.min(0.15, shift)),
      rationale: reasons.length > 0 ? reasons.join('; ') : 'no specific biodata adjustment',
    };
  }

  return result;
}

export function getSocratesGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const SOCRATES_DIMENSIONS: { id: string; label: string; features: string[]; priority: number }[] = [
    { id: 'site', label: 'Site (location)', features: ['pain_initial_location', 'pain_location_now'], priority: 85 },
    { id: 'onset', label: 'Onset', features: ['pain_onset', 'pain_onset_sudden'], priority: 83 },
    { id: 'character', label: 'Character', features: ['pain_character'], priority: 82 },
    { id: 'radiation', label: 'Radiation', features: ['pain_radiation'], priority: 78 },
    { id: 'associations_gi', label: 'GI Associations', features: ['nausea', 'vomiting', 'anorexia', 'bowel_habits'], priority: 75 },
    { id: 'associations_fever', label: 'Fever', features: ['fever', 'fever_chills'], priority: 73 },
    { id: 'associations_urinary', label: 'Urinary Associations', features: ['dysuria', 'hematuria', 'urinary_frequency'], priority: 65 },
    { id: 'associations_gynae', label: 'Gynaecological Associations', features: ['last_menstrual_period', 'vaginal_bleeding', 'vaginal_discharge'], priority: 70 },
    { id: 'timing', label: 'Timing / Temporal Pattern', features: ['pain_temporal_pattern', 'pain_duration_hours', 'pain_duration_days'], priority: 72 },
    { id: 'exacerbating', label: 'Exacerbating Factors', features: ['pain_worsening_factors'], priority: 60 },
    { id: 'relieving', label: 'Relieving Factors', features: ['pain_relieving_factors'], priority: 55 },
    { id: 'severity', label: 'Severity', features: ['pain_severity'], priority: 68 },
  ];

  for (const dim of SOCRATES_DIMENSIONS) {
    const answeredCount = dim.features.filter(f => answered.has(f)).length;
    if (answeredCount === 0) {
      const firstFeature = dim.features[0];
      const feature = FEATURES[firstFeature];
      if (feature) {
        gaps.push({
          featureId: firstFeature,
          label: feature.label,
          category: 'documentation',
          priorityScore: dim.priority,
          reasonEssential: `SOCRATES dimension "${dim.label}" has not been assessed. Essential for complete HPI.`,
          type: feature.type,
          options: feature.options,
          clinicalGuide: feature.clinicalGuide,
          groupLabel: 'SOCRATES History',
        });
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getAbdominalPainRedFlagGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const RED_FLAGS: { featureId: string; label: string; rationale: string; priority: number }[] = [
    { featureId: 'syncope', label: 'Syncope / Collapse', rationale: 'Pain + syncope = ruptured AAA, ectopic, or perforation until proven otherwise', priority: 100 },
    { featureId: 'peritonism', label: 'Peritoneal Signs', rationale: 'Peritonism = surgical abdomen requiring urgent assessment', priority: 100 },
    { featureId: 'rigidity', label: 'Abdominal Rigidity', rationale: 'Rigidity = perforated viscus until proven otherwise', priority: 100 },
    { featureId: 'fever_chills', label: 'Rigors', rationale: 'Rigors = systemic infection, cholangitis, pyelonephritis', priority: 90 },
    { featureId: 'obstipation', label: 'Obstipation', rationale: 'Unable to pass gas/stool = obstruction until proven otherwise', priority: 85 },
    { featureId: 'hematochezia', label: 'Blood in Stool', rationale: 'Hematochezia = GI bleed, colitis, mesenteric ischemia', priority: 85 },
    { featureId: 'hematemesis', label: 'Hematemesis', rationale: 'Vomiting blood = upper GI bleed', priority: 85 },
    { featureId: 'melena', label: 'Melena', rationale: 'Black tarry stool = upper GI bleed', priority: 85 },
    { featureId: 'vaginal_bleeding', label: 'Vaginal Bleeding', rationale: 'Pain + vaginal bleeding in reproductive age = ectopic or miscarriage', priority: 90 },
    { featureId: 'jaundice', label: 'Jaundice', rationale: 'Jaundice + RUQ pain = cholangitis, cholecystitis, or hepatitis', priority: 85 },
    { featureId: 'chest_pain', label: 'Chest Pain', rationale: 'Referred abdominal pain may be cardiac (inferior MI)', priority: 80 },
  ];

  for (const rf of RED_FLAGS) {
    if (answered.has(rf.featureId)) continue;
    const feature = FEATURES[rf.featureId];
    if (!feature) continue;
    gaps.push({
      featureId: rf.featureId,
      label: feature.label,
      category: 'life_threatening',
      priorityScore: rf.priority,
      reasonEssential: `RED FLAG: ${rf.rationale}`,
      type: feature.type,
      options: feature.options,
      clinicalGuide: feature.clinicalGuide,
      groupLabel: 'Red Flag Assessment',
    });
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getAbdominalPainPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of ABDOMINAL_PAIN_PATTERNS) {
    const patternAnswered = pattern.pattern.filter(f => answered.has(f));
    const patternUnanswered = pattern.pattern.filter(f => !answered.has(f));

    if (patternAnswered.length >= 2 && patternUnanswered.length > 0) {
      for (const featureId of patternUnanswered) {
        const feature = FEATURES[featureId];
        if (!feature) continue;

        const matchingDiseases = pattern.suggests.filter(d => activeDiseaseStates[d]?.currentProb > 0.01).length;
        const boost = matchingDiseases > 0 ? pattern.priorityBoost + 10 : pattern.priorityBoost;

        gaps.push({
          featureId,
          label: feature.label,
          category: 'diagnostic',
          priorityScore: Math.min(100, 60 + boost),
          reasonEssential: `Pattern "${pattern.label}" partially recognized (${patternAnswered.length}/${pattern.pattern.length} features). ${pattern.description}`,
          type: feature.type,
          options: feature.options,
          clinicalGuide: feature.clinicalGuide,
          groupLabel: `Pattern: ${pattern.label}`,
        });
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}
