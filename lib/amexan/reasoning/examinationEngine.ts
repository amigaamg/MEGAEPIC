// ═══════════════════════════════════════════════════════════════════════════════
// Examination Engine
// When HPI is complete, this engine selects sign features from the top disease
// candidates and structures them for the clinician to examine.
// ═══════════════════════════════════════════════════════════════════════════════

import type { FeatureRecord, DiseaseNode, EncounterState } from '../knowbase/diseaseNode';
import { FEATURES } from '../knowbase/features/featureLibrary';
import { ABDOMINAL_PAIN_DISEASE_MAP } from '../knowbase/diseases/abdominalPainNodes';

/** A sign to be checked during examination */
export interface ExamSign {
  featureId: string;
  label: string;
  shortLabel: string;
  description: string;
  type: 'boolean' | 'select' | 'multi_select';
  options?: string[];
  /** Which top diseases this sign helps discriminate */
  relevantFor: string[];
  diseaseNames: string[];
  priority: number; // 1 = essential, 2 = supportive, 3 = supplementary
}

/** The complete examination plan */
export interface ExaminationPlan {
  /** Signs organised by anatomical region */
  regions: ExamRegion[];
  /** Additional systemic examinations */
  systemic: ExamSign[];
  /** Vital signs to check */
  vitals: string[];
}

export interface ExamRegion {
  name: string;
  signs: ExamSign[];
}

/** Known sign features categorised for examination */
const SIGN_FEATURE_IDS: string[] = [
  'peritonism', 'guarding', 'rebound_history', 'rigidity',
];

/** Abdominal examination regions */
const ABDOMINAL_REGIONS = ['Inspection', 'Palpation', 'Percussion', 'Auscultation', 'Pelvic / DRE'];

/**
 * Organise sign features for examination based on the current DDX.
 * Returns an examination plan with signs grouped by region.
 */
export function buildExaminationPlan(
  state: EncounterState,
  diseaseMap: Map<string, DiseaseNode> = ABDOMINAL_PAIN_DISEASE_MAP,
): ExaminationPlan {
  const topCandidates = state.ddx.activeCandidates;
  if (topCandidates.length === 0) {
    return { regions: [], systemic: [], vitals: [] };
  }

  // Collect sign features from top 5 candidates
  const signScores = new Map<string, { count: number; totalProb: number; diseaseNames: Set<string> }>();

  for (const candidate of topCandidates.slice(0, 5)) {
    const disease = diseaseMap.get(candidate.diseaseId);
    if (!disease) continue;
    const prob = candidate.currentProb;

    for (const sign of disease.features.signs) {
      if (!signScores.has(sign.featureId)) {
        signScores.set(sign.featureId, { count: 0, totalProb: 0, diseaseNames: new Set() });
      }
      const entry = signScores.get(sign.featureId)!;
      entry.count++;
      entry.totalProb += prob;
      entry.diseaseNames.add(disease.name);
    }

    // Also include history symptom features that are signs
    for (const sym of disease.features.symptoms) {
      if (SIGN_FEATURE_IDS.includes(sym.featureId)) {
        if (!signScores.has(sym.featureId)) {
          signScores.set(sym.featureId, { count: 0, totalProb: 0, diseaseNames: new Set() });
        }
        const entry = signScores.get(sym.featureId)!;
        entry.count++;
        entry.totalProb += prob;
        entry.diseaseNames.add(disease.name);
      }
    }
  }

  // Build exam signs sorted by relevance (probability-weighted count)
  const allSigns: ExamSign[] = Array.from(signScores.entries())
    .map(([fid, sc]) => {
      const feat = FEATURES[fid];
      const libFeat = SIGN_FEATURE_IDS.includes(fid) ? FEATURES[fid] : null;
      return {
        featureId: fid,
        label: libFeat?.label || feat?.label || fid,
        shortLabel: libFeat?.shortLabel || feat?.shortLabel || fid,
        description: libFeat?.clinicalGuide || '',
        type: (libFeat?.type || feat?.type || 'boolean') as 'boolean' | 'select' | 'multi_select',
        options: libFeat?.options || feat?.options,
        relevantFor: Array.from(sc.diseaseNames),
        diseaseNames: Array.from(sc.diseaseNames),
        priority: sc.totalProb > 0.5 ? 1 : sc.totalProb > 0.2 ? 2 : 3,
      };
    })
    .sort((a, b) => a.priority - b.priority || b.relevantFor.length - a.relevantFor.length);

  // Split into regions
  const palpationSigns = allSigns.filter(s =>
    ['peritonism', 'guarding', 'rigidity', 'rebound_history'].includes(s.featureId)
  );
  const otherSigns = allSigns.filter(s =>
    !['peritonism', 'guarding', 'rigidity', 'rebound_history'].includes(s.featureId)
  );

  const regions: ExamRegion[] = [
    { name: 'Inspection', signs: [] },
    { name: 'Palpation', signs: palpationSigns },
    { name: 'Percussion', signs: [] },
    { name: 'Auscultation', signs: [] },
    { name: 'Pelvic / DRE', signs: otherSigns.filter(s => s.featureId.includes('vaginal') || s.featureId.includes('pelvic') || s.featureId.includes('uterine')) },
  ];

  // Filter empty regions
  const nonEmptyRegions = regions.filter(r => r.signs.length > 0);

  return {
    regions: nonEmptyRegions.length > 0 ? nonEmptyRegions : [{ name: 'Abdominal', signs: allSigns }],
    systemic: otherSigns.filter(s => !palpationSigns.includes(s)),
    vitals: [],
  };
}

/**
 * Get the next unanswered examination sign.
 * Used to guide the clinician sequentially through the exam.
 */
export function getNextExamSign(
  plan: ExaminationPlan,
  answeredSignIds: Set<string>,
): ExamSign | null {
  // All signs from all regions, flattened
  const allSigns = [
    ...plan.regions.flatMap(r => r.signs),
    ...plan.systemic,
  ];

  for (const sign of allSigns) {
    if (!answeredSignIds.has(sign.featureId)) {
      return sign;
    }
  }

  return null; // All signs answered
}
