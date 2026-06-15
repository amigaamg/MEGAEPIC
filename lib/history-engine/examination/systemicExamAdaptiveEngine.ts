// ── Adaptive Systemic Examination Engine ──
// Only shows examination systems relevant to current differential diagnoses.
// Uses the disease->system mapping to determine which body systems to prioritize.

import type { SystemExamination, SystemExaminationFinding } from '../types';

type ExamPriority = 'high' | 'medium' | 'low';

interface DiseaseSystemMap {
  [diseaseId: string]: { systemId: string; priority: ExamPriority }[];
}

// Maps each disease to the body systems that should be examined
export const DISEASE_SYSTEM_MAP: DiseaseSystemMap = {
  pneumonia_pulm: [{ systemId: 'respiratory', priority: 'high' }, { systemId: 'cardiovascular', priority: 'medium' }],
  tb_pulm: [{ systemId: 'respiratory', priority: 'high' }, { systemId: 'lymphatic', priority: 'medium' }],
  asthma_pulm: [{ systemId: 'respiratory', priority: 'high' }, { systemId: 'cardiovascular', priority: 'medium' }],
  copd_pulm: [{ systemId: 'respiratory', priority: 'high' }, { systemId: 'cardiovascular', priority: 'medium' }],
  bronchiectasis: [{ systemId: 'respiratory', priority: 'high' }, { systemId: 'cardiovascular', priority: 'low' }],
  lung_cancer: [{ systemId: 'respiratory', priority: 'high' }, { systemId: 'lymphatic', priority: 'medium' }],
  pulmonary_embolism: [{ systemId: 'respiratory', priority: 'high' }, { systemId: 'cardiovascular', priority: 'high' }],

  heart_failure_card: [{ systemId: 'cardiovascular', priority: 'high' }, { systemId: 'respiratory', priority: 'high' }],
  acs: [{ systemId: 'cardiovascular', priority: 'high' }],
  pericarditis: [{ systemId: 'cardiovascular', priority: 'high' }],
  infective_endocarditis: [{ systemId: 'cardiovascular', priority: 'high' }],
  af_ep: [{ systemId: 'cardiovascular', priority: 'high' }],

  appendicitis: [{ systemId: 'gastrointestinal', priority: 'high' }],
  cholecystitis: [{ systemId: 'gastrointestinal', priority: 'high' }, { systemId: 'cardiovascular', priority: 'low' }],
  pancreatitis: [{ systemId: 'gastrointestinal', priority: 'high' }, { systemId: 'cardiovascular', priority: 'medium' }],
  gastroenteritis: [{ systemId: 'gastrointestinal', priority: 'high' }],
  bowel_obstruction: [{ systemId: 'gastrointestinal', priority: 'high' }],
  peptic_ulcer: [{ systemId: 'gastrointestinal', priority: 'high' }],
  hepatitis: [{ systemId: 'gastrointestinal', priority: 'high' }],
  cirrhosis: [{ systemId: 'gastrointestinal', priority: 'high' }, { systemId: 'cardiovascular', priority: 'low' }],
  typhoid: [{ systemId: 'gastrointestinal', priority: 'high' }],

  meningitis: [{ systemId: 'neurological', priority: 'high' }, { systemId: 'musculoskeletal', priority: 'low' }],
  stroke_tia: [{ systemId: 'neurological', priority: 'high' }, { systemId: 'cardiovascular', priority: 'high' }],
  migraine: [{ systemId: 'neurological', priority: 'medium' }],
  intracranial_hemorrhage: [{ systemId: 'neurological', priority: 'high' }, { systemId: 'cardiovascular', priority: 'high' }],
  brain_tumor: [{ systemId: 'neurological', priority: 'high' }],
  seizure: [{ systemId: 'neurological', priority: 'high' }],

  septic_arthritis: [{ systemId: 'musculoskeletal', priority: 'high' }],
  rheumatoid_arthritis: [{ systemId: 'musculoskeletal', priority: 'high' }],
  oa: [{ systemId: 'musculoskeletal', priority: 'high' }],
  gout: [{ systemId: 'musculoskeletal', priority: 'high' }],
  sickle_cell: [{ systemId: 'musculoskeletal', priority: 'high' }, { systemId: 'cardiovascular', priority: 'low' }],

  uti: [{ systemId: 'genitourinary', priority: 'high' }],
  pyelonephritis: [{ systemId: 'genitourinary', priority: 'high' }],
  renal_colic: [{ systemId: 'genitourinary', priority: 'high' }],
  ckd: [{ systemId: 'genitourinary', priority: 'high' }, { systemId: 'cardiovascular', priority: 'medium' }],

  hyperthyroidism: [{ systemId: 'endocrine', priority: 'high' }, { systemId: 'cardiovascular', priority: 'high' }],
  hypothyroidism: [{ systemId: 'endocrine', priority: 'high' }],
  diabetes_t1: [{ systemId: 'endocrine', priority: 'medium' }, { systemId: 'cardiovascular', priority: 'medium' }],
  diabetes_t2: [{ systemId: 'endocrine', priority: 'medium' }, { systemId: 'cardiovascular', priority: 'medium' }],

  cellulitis: [{ systemId: 'skin_msk', priority: 'high' }],
  sle: [{ systemId: 'skin_msk', priority: 'high' }, { systemId: 'musculoskeletal', priority: 'medium' }, { systemId: 'cardiovascular', priority: 'medium' }],
  scabies: [{ systemId: 'skin_msk', priority: 'high' }],
  psoriasis: [{ systemId: 'skin_msk', priority: 'high' }, { systemId: 'musculoskeletal', priority: 'medium' }],
  allergic_reaction: [{ systemId: 'skin_msk', priority: 'high' }, { systemId: 'respiratory', priority: 'medium' }],
  chickenpox: [{ systemId: 'skin_msk', priority: 'high' }],
  meningococcal: [{ systemId: 'skin_msk', priority: 'high' }, { systemId: 'neurological', priority: 'high' }],

  sepsis: [{ systemId: 'cardiovascular', priority: 'high' }, { systemId: 'respiratory', priority: 'high' }, { systemId: 'neurological', priority: 'medium' }],
  malaria: [{ systemId: 'cardiovascular', priority: 'medium' }, { systemId: 'neurological', priority: 'medium' }],
  dengue: [{ systemId: 'cardiovascular', priority: 'high' }, { systemId: 'skin_msk', priority: 'medium' }],
  anemia: [{ systemId: 'cardiovascular', priority: 'high' }],
  hiv: [{ systemId: 'respiratory', priority: 'medium' }, { systemId: 'skin_msk', priority: 'medium' }, { systemId: 'gastrointestinal', priority: 'medium' }],
};

// System metadata with IPPA (Inspection, Palpation, Percussion, Auscultation) methods
export const SYSTEM_METHODS: Record<string, { methods: string[] }> = {
  respiratory: { methods: ['Inspection', 'Palpation', 'Percussion', 'Auscultation'] },
  cardiovascular: { methods: ['Inspection', 'Palpation', 'Auscultation'] },
  gastrointestinal: { methods: ['Inspection', 'Auscultation', 'Palpation', 'Percussion'] },
  neurological: { methods: ['Mental status', 'Cranial nerves', 'Motor', 'Sensory', 'Coordination', 'Gait', 'Reflexes'] },
  musculoskeletal: { methods: ['Inspection', 'Palpation', 'Range of motion', 'Special tests'] },
  genitourinary: { methods: ['Inspection', 'Palpation', 'Percussion'] },
  endocrine: { methods: ['Inspection', 'Palpation'] },
  skin_msk: { methods: ['Inspection', 'Palpation'] },
  lymphatic: { methods: ['Inspection', 'Palpation'] },
};

export interface AdaptiveSystemPriority {
  systemId: string;
  systemName: string;
  priority: ExamPriority;
  methods: string[];
}

export function getPrioritizedSystems(diseaseIds: string[]): AdaptiveSystemPriority[] {
  const systemPriority: Record<string, ExamPriority> = {};
  const systemNames: Record<string, string> = {
    respiratory: 'Respiratory System',
    cardiovascular: 'Cardiovascular System',
    gastrointestinal: 'Gastrointestinal / Abdomen',
    neurological: 'Neurological System',
    musculoskeletal: 'Musculoskeletal System',
    genitourinary: 'Genitourinary System',
    endocrine: 'Endocrine System',
    skin_msk: 'Skin, Hair & Nails',
    lymphatic: 'Lymphatic System',
  };

  for (const did of diseaseIds) {
    const systems = DISEASE_SYSTEM_MAP[did] || [];
    for (const sys of systems) {
      const existing = systemPriority[sys.systemId];
      if (!existing) {
        systemPriority[sys.systemId] = sys.priority;
      } else {
        // Upgrade priority if higher
        const priorityRank: Record<ExamPriority, number> = { high: 3, medium: 2, low: 1 };
        if (priorityRank[sys.priority] > priorityRank[existing]) {
          systemPriority[sys.systemId] = sys.priority;
        }
      }
    }
  }

  return Object.entries(systemPriority)
    .sort(([, a], [, b]) => {
      const rank: Record<ExamPriority, number> = { high: 3, medium: 2, low: 1 };
      return rank[b] - rank[a];
    })
    .map(([systemId, priority]) => ({
      systemId,
      systemName: systemNames[systemId] || systemId,
      priority,
      methods: SYSTEM_METHODS[systemId]?.methods || ['Inspection', 'Palpation'],
    }));
}

// ── ADAPTIVE EXAM FINDINGS per disease ──
// What specific findings to look for based on top differentials
export interface AdaptiveFinding {
  systemId: string;
  featureId: string;
  label: string;
  relevanceTo: string; // diseaseId
}

export const ADAPTIVE_FINDINGS: AdaptiveFinding[] = [
  // Respiratory findings for pneumonia
  { systemId: 'respiratory', featureId: 'resp_auscultation', label: 'Crackles/Crepitations', relevanceTo: 'pneumonia_pulm' },
  { systemId: 'respiratory', featureId: 'resp_auscultation', label: 'Bronchial breathing', relevanceTo: 'pneumonia_pulm' },
  { systemId: 'respiratory', featureId: 'resp_auscultation', label: 'Reduced breath sounds', relevanceTo: 'pleural_effusion' },
  { systemId: 'respiratory', featureId: 'resp_percussion', label: 'Dull percussion note', relevanceTo: 'pneumonia_pulm' },
  { systemId: 'respiratory', featureId: 'resp_percussion', label: 'Stony dull percussion', relevanceTo: 'pleural_effusion' },
  { systemId: 'respiratory', featureId: 'resp_percussion', label: 'Hyperresonant percussion', relevanceTo: 'pneumothorax' },
  { systemId: 'respiratory', featureId: 'resp_added', label: 'Wheeze — expiratory', relevanceTo: 'asthma_pulm' },
  { systemId: 'respiratory', featureId: 'resp_added', label: 'Wheeze — biphasic', relevanceTo: 'copd_pulm' },
  { systemId: 'respiratory', featureId: 'resp_added', label: 'Pleural rub', relevanceTo: 'pleurisy' },
  { systemId: 'respiratory', featureId: 'resp_inspection', label: 'Use of accessory muscles', relevanceTo: 'asthma_pulm' },
  { systemId: 'respiratory', featureId: 'resp_inspection', label: 'Tracheal deviation', relevanceTo: 'pneumothorax' },
  { systemId: 'respiratory', featureId: 'resp_vocal', label: 'Increased vocal resonance', relevanceTo: 'pneumonia_pulm' },
  { systemId: 'respiratory', featureId: 'resp_vocal', label: 'Decreased vocal resonance', relevanceTo: 'pleural_effusion' },

  // Cardiovascular
  { systemId: 'cardiovascular', featureId: 'cvs_murmur_timing', label: 'Holosystolic murmur', relevanceTo: 'mitral_valve_prolapse' },
  { systemId: 'cardiovascular', featureId: 'cvs_murmur_timing', label: 'Mid-systolic ejection murmur', relevanceTo: 'aortic_stenosis' },
  { systemId: 'cardiovascular', featureId: 'cvs_murmur_timing', label: 'Diastolic murmur', relevanceTo: 'aortic_regurgitation' },
  { systemId: 'cardiovascular', featureId: 'cvs_auscultation', label: 'S3 gallop', relevanceTo: 'heart_failure_card' },
  { systemId: 'cardiovascular', featureId: 'cvs_auscultation', label: 'S4 gallop', relevanceTo: 'acs' },
  { systemId: 'cardiovascular', featureId: 'cvs_jvp', label: 'Raised JVP', relevanceTo: 'heart_failure_card' },
  { systemId: 'cardiovascular', featureId: 'cvs_edema', label: 'Peripheral edema', relevanceTo: 'heart_failure_card' },
  { systemId: 'cardiovascular', featureId: 'cvs_peripheral', label: 'Weak/absent peripheral pulses', relevanceTo: 'peripheral_vascular_disease' },
  { systemId: 'cardiovascular', featureId: 'cvs_peripheral', label: 'Radio-femoral delay', relevanceTo: 'coarctation' },

  // Abdomen
  { systemId: 'gastrointestinal', featureId: 'gi_palpation_superficial', label: 'Right iliac fossa tenderness', relevanceTo: 'appendicitis' },
  { systemId: 'gastrointestinal', featureId: 'gi_palpation_superficial', label: 'Right upper quadrant tenderness', relevanceTo: 'cholecystitis' },
  { systemId: 'gastrointestinal', featureId: 'gi_palpation_superficial', label: 'Epigastric tenderness', relevanceTo: 'peptic_ulcer' },
  { systemId: 'gastrointestinal', featureId: 'gi_palpation_superficial', label: 'Generalized abdominal tenderness', relevanceTo: 'gastroenteritis' },
  { systemId: 'gastrointestinal', featureId: 'gi_palpation_superficial', label: 'Guarding/Rigidity', relevanceTo: 'appendicitis' },
  { systemId: 'gastrointestinal', featureId: 'gi_palpation_superficial', label: 'Rebound tenderness', relevanceTo: 'appendicitis' },
  { systemId: 'gastrointestinal', featureId: 'gi_palpation_superficial', label: 'Murphy sign', relevanceTo: 'cholecystitis' },
  { systemId: 'gastrointestinal', featureId: 'gi_palpation_deep', label: 'Palpable abdominal mass', relevanceTo: 'bowel_obstruction' },
  { systemId: 'gastrointestinal', featureId: 'gi_liver', label: 'Hepatomegaly', relevanceTo: 'cirrhosis' },
  { systemId: 'gastrointestinal', featureId: 'gi_spleen', label: 'Splenomegaly', relevanceTo: 'malaria' },
  { systemId: 'gastrointestinal', featureId: 'gi_percussion', label: 'Shifting dullness — ascites', relevanceTo: 'cirrhosis' },
  { systemId: 'gastrointestinal', featureId: 'gi_auscultation', label: 'Tinkling bowel sounds', relevanceTo: 'bowel_obstruction' },
  { systemId: 'gastrointestinal', featureId: 'gi_auscultation', label: 'Absent bowel sounds', relevanceTo: 'ileus' },
  { systemId: 'gastrointestinal', featureId: 'gi_hernial', label: 'Hernia — reducible/irreducible', relevanceTo: 'hernia' },

  // Neurological
  { systemId: 'neurological', featureId: 'neuro_meningeal', label: 'Neck stiffness', relevanceTo: 'meningitis' },
  { systemId: 'neurological', featureId: 'neuro_meningeal', label: 'Kernig sign', relevanceTo: 'meningitis' },
  { systemId: 'neurological', featureId: 'neuro_meningeal', label: 'Brudzinski sign', relevanceTo: 'meningitis' },
  { systemId: 'neurological', featureId: 'neuro_cranial', label: 'CN III palsy — dilated pupil', relevanceTo: 'intracranial_hemorrhage' },
  { systemId: 'neurological', featureId: 'neuro_motor', label: 'Hemiparesis', relevanceTo: 'stroke_tia' },
  { systemId: 'neurological', featureId: 'neuro_motor', label: 'Power 0-5 (weakness)', relevanceTo: 'stroke_tia' },
  { systemId: 'neurological', featureId: 'neuro_sensory', label: 'Sensory level', relevanceTo: 'spinal_cord_injury' },

  // Musculoskeletal
  { systemId: 'musculoskeletal', featureId: 'msk_inspection', label: 'Joint swelling — monoarticular', relevanceTo: 'septic_arthritis' },
  { systemId: 'musculoskeletal', featureId: 'msk_inspection', label: 'Joint swelling — polyarticular', relevanceTo: 'rheumatoid_arthritis' },
  { systemId: 'musculoskeletal', featureId: 'msk_palpation', label: 'Joint tenderness', relevanceTo: 'gout' },
  { systemId: 'musculoskeletal', featureId: 'msk_rom', label: 'Limited range of motion', relevanceTo: 'oa' },

  // Skin
  { systemId: 'skin_msk', featureId: 'skin_rash', label: 'Maculopapular rash', relevanceTo: 'measles' },
  { systemId: 'skin_msk', featureId: 'skin_rash', label: 'Vesicular rash', relevanceTo: 'chickenpox' },
  { systemId: 'skin_msk', featureId: 'skin_rash', label: 'Petechial/purpuric rash', relevanceTo: 'meningococcal' },
  { systemId: 'skin_msk', featureId: 'skin_rash', label: 'Urticarial rash', relevanceTo: 'allergic_reaction' },
  { systemId: 'skin_msk', featureId: 'skin_rash', label: 'Malar butterfly rash', relevanceTo: 'sle' },
];

export function getAdaptiveFindings(diseaseIds: string[]): AdaptiveFinding[] {
  return ADAPTIVE_FINDINGS.filter(f => diseaseIds.includes(f.relevanceTo));
}
