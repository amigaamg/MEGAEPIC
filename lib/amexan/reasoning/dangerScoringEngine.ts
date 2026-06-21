// ═══════════════════════════════════════════════════════════════════════════════
// Danger‑Score Parallel Ranking
// Surfaces "must not miss" diseases even at low probability.
// Ranks candidates by danger (acuity × probability) independent of DDX ranking.
// ═══════════════════════════════════════════════════════════════════════════════

import type { DiseaseNode, CandidateDiseaseState, EncounterState } from '../knowbase/diseaseNode';
import { ABDOMINAL_PAIN_DISEASE_MAP } from '../knowbase/diseases/abdominalPainNodes';

export type DangerLevel = 'critical' | 'high' | 'moderate' | 'low';

export interface DangerRankedDisease {
  diseaseId: string;
  diseaseName: string;
  acuityTier: number;
  dangerLevel: DangerLevel;
  probability: number;
  dangerScore: number; // 0–100 composite
  redFlagsTriggered: boolean;
  warningFeatures: string[];
  actionMessage: string;
}

/**
 * Compute danger score for a single candidate.
 * Danger = (acuity weight × 40%) + (red flag weight × 30%) + (probability weight × 30%)
 * This ensures high-acuity diseases surface even at low probability.
 */
function computeDangerScore(
  candidate: CandidateDiseaseState,
  disease: DiseaseNode,
): DangerRankedDisease {
  // Acuity weight: 1=100, 2=60, 3=30, 4=10
  const acuityWeights: Record<number, number> = { 1: 100, 2: 60, 3: 30, 4: 10 };
  const acuityWeight = acuityWeights[disease.acuityTier] || 10;

  // Red flag weight
  const redFlagWeight = candidate.isRedFlagTriggered ? 100 : 0;

  // Probability weight (normalized 0-100)
  const probWeight = Math.round(candidate.currentProb * 100);

  // Composite danger score (0-100)
  const dangerScore = Math.round(
    (acuityWeight * 0.40) +
    (redFlagWeight * 0.30) +
    (probWeight * 0.30)
  );

  // Danger level
  let dangerLevel: DangerLevel = 'low';
  if (dangerScore >= 70) dangerLevel = 'critical';
  else if (dangerScore >= 45) dangerLevel = 'high';
  else if (dangerScore >= 20) dangerLevel = 'moderate';

  // Action message
  let actionMessage = '';
  switch (disease.acuity) {
    case 'immediately_life_threatening':
      actionMessage = 'Immediate surgical/ICU consultation indicated';
      break;
    case 'urgent':
      actionMessage = 'Urgent assessment within 2 hours';
      break;
    case 'semi_urgent':
      actionMessage = 'Assessment within 24 hours';
      break;
    case 'routine':
      actionMessage = 'Outpatient management appropriate';
      break;
  }

  // Collect warning features from complications
  const warningFeatures: string[] = [];
  for (const comp of disease.complications) {
    for (const wf of comp.warningFeatures) {
      if (!warningFeatures.includes(wf)) warningFeatures.push(wf);
    }
  }

  return {
    diseaseId: disease.id,
    diseaseName: disease.name,
    acuityTier: disease.acuityTier,
    dangerLevel,
    probability: candidate.currentProb,
    dangerScore,
    redFlagsTriggered: candidate.isRedFlagTriggered,
    warningFeatures,
    actionMessage,
  };
}

/**
 * Dingley's "Diseases You Don't Want to Miss" — diseases that must be considered
 * even at very low probability due to catastrophic consequences of delayed diagnosis.
 */
const MUST_NOT_MISS: string[] = [
  'aaa_rupture',
  'ectopic_pregnancy',
  'mesenteric_ischaemia',
  'raised_icp',
  'meningitis',
  'aortic_dissection',
  'boerhaave',
  'perforated_peptic_ulcer',
  'sepsis',
  'inferior_mi',
  'nec',
  'malrotation',
  'placental_abruption',
  'uterine_rupture',
  'addisonian_crisis',
  'dka',
  'organophosphate',
  'pulmonary_embolism',
  // Abdominal distension — surgical do-not-miss
  'sbo_adhesions',
  'sbo_hernia',
  'sigmoid_volvulus',
  'cecal_volvulus',
  'toxic_megacolon',
  'mesenteric_ischemia_distension',
  'perforation_peritonitis_distension',
  'secondary_bacterial_peritonitis',
  'peritonitic_ileus',
  'acute_urinary_retention',
  'ovarian_torsion_cyst',
  'ovarian_cancer_distension',
  'pancreatic_cancer_distension',
  'colorectal_cancer',
  'midgut_volvulus',
  'nec_neonatal',
  'hirschsprung_disease',
  'intestinal_atresia',
  'malrotation_distension',
  // Constipation — surgical/urgent do-not-miss
  'sigmoid_volvulus',
  'cecal_volvulus',
  'colorectal_cancer_constipation',
  'fecal_impaction',
  'cauda_equina_constipation',
  'spinal_cord_injury_constipation',
  'spinal_tumor_constipation',
  'hirschsprung_disease',
  'meconium_ileus',
  'chronic_intestinal_pseudo_obstruction',
  'opioid_constipation',
  'hypercalcemia_constipation',
  'lead_poisoning_constipation',
  'rectal_cancer',
  'pancreatic_cancer_constipation',
  'hepatobiliary_constipation',
  'metastatic_constipation',
  'antiepileptic_constipation',
  // Dysphagia/odynophagia — surgical/life-threatening do-not-miss
  'esophageal_carcinoma',
  'esophageal_squamous_cell_carcinoma',
  'esophageal_adenocarcinoma',
  'gastric_cardiac_cancer',
  'secondary_achalasia',
  'esophageal_foreign_body',
  'epiglottitis',
  'retropharyngeal_abscess',
  'peritonsillar_abscess',
  'caustic_esophageal_injury',
  'stroke_dysphagia',
  'guillain_barre_dysphagia',
  'brainstem_tumour_dysphagia',
  'motor_neurone_disease',
  'candida_esophagitis',
  'herpes_simplex_esophagitis',
  'cmv_esophagitis',
  // GI bleeding — surgical/life-threatening do-not-miss
  'esophageal_varices_bleeding',
  'gastric_varices_bleeding',
  'aortoenteric_fistula',
  'boerhaave_syndrome',
  'gastric_ulcer_bleeding',
  'duodenal_ulcer_bleeding',
  'dieulafoy_lesion',
  'diverticular_bleeding',
  'colorectal_cancer_bleeding',
  'ischemic_colitis_bleeding',
  'meckel_diverticulum_bleeding',
  'necrotizing_enterocolitis_bleeding',
  'intussusception_bleeding',
  'hemobilia',
  'pancreatic_pseudocyst_bleeding',
];

/**
 * Compute danger-ranked list from the current DDX.
 * Returns two lists for separate display.
 */
export function computeDangerRanking(
  state: EncounterState,
  diseaseMap: Map<string, DiseaseNode> = ABDOMINAL_PAIN_DISEASE_MAP,
): {
  dangerRanked: DangerRankedDisease[];
  mustNotMiss: DangerRankedDisease[];
} {
  const candidates = state.ddx.activeCandidates;
  if (candidates.length === 0) {
    return { dangerRanked: [], mustNotMiss: [] };
  }

  const all: DangerRankedDisease[] = [];

  for (const candidate of candidates) {
    const disease = diseaseMap.get(candidate.diseaseId);
    if (!disease) continue;

    all.push(computeDangerScore(candidate, disease));
  }

  // Sort by danger score descending
  all.sort((a, b) => b.dangerScore - a.dangerScore);

  // Find must-not-miss diseases among candidates
  const mustNotMiss = all.filter(d => MUST_NOT_MISS.includes(d.diseaseId));

  return {
    dangerRanked: all.slice(0, 10),
    mustNotMiss,
  };
}
