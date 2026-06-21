// ═══════════════════════════════════════════════════════════════════════════════
// Investigation Tier Filter
// Suggests investigations based on facility capability and disease probability.
// ═══════════════════════════════════════════════════════════════════════════════

import type { DiseaseNode, FeatureRecord, EncounterState } from '../knowbase/diseaseNode';
import { FEATURES } from '../knowbase/features/featureLibrary';
import { ABDOMINAL_PAIN_DISEASE_MAP } from '../knowbase/diseases/abdominalPainNodes';

/** Facility capability tier — ascending capability */
export type FacilityTier = 1 | 2 | 3 | 4 | 5 | 6;

export interface FacilityCapability {
  tier: FacilityTier;
  label: string;
  availableInvestigations: string[]; // featureId prefixes or specific IDs
}

/** Suggested investigation with its rationale */
export interface SuggestedInvestigation {
  featureId: string;
  label: string;
  shortLabel: string;
  type: 'lab' | 'imaging' | 'endoscopy' | 'ecg' | 'procedure';
  tier: FacilityTier;
  /** Which high-probability diseases this helps confirm */
  supportsDiagnoses: string[];
  /** Which differentials this helps rule out */
  rulesOutDiagnoses: string[];
  urgency: 'immediate' | 'urgent' | 'routine';
  rationale: string;
}

/** Complete investigation plan */
export interface InvestigationPlan {
  investigations: SuggestedInvestigation[];
  facilityTier: FacilityTier;
  facilityLabel: string;
}

/**
 * Facility tiers and their available investigations.
 * Each tier includes everything from lower tiers.
 */
const FACILITY_TIERS: Record<FacilityTier, FacilityCapability> = {
  1: { tier: 1, label: 'Basic clinic — no lab or imaging', availableInvestigations: [] },
  2: { tier: 2, label: 'Basic lab only — FBC, U&E, glucose, urinalysis', availableInvestigations: ['fbc', 'ue', 'glucose', 'urinalysis', 'pregnancy_test'] },
  3: { tier: 3, label: 'Comprehensive lab + basic radiology — LFT, amylase, CRP, X-ray, ultrasound', availableInvestigations: ['fbc', 'ue', 'glucose', 'urinalysis', 'pregnancy_test', 'lft', 'amylase', 'lipase', 'crp', 'cxr', 'aortic', 'erect_chest_xray'] },
  4: { tier: 4, label: 'CT scanner available — CT abdomen with contrast', availableInvestigations: ['fbc', 'ue', 'glucose', 'urinalysis', 'pregnancy_test', 'lft', 'amylase', 'lipase', 'crp', 'cxr', 'aortic', 'erect_chest_xray', 'ct_abdomen', 'ct_abdomen_pelvis', 'ct_angiogram'] },
  5: { tier: 5, label: 'Full imaging suite — MRI, interventional radiology', availableInvestigations: ['fbc', 'ue', 'glucose', 'urinalysis', 'pregnancy_test', 'lft', 'amylase', 'lipase', 'crp', 'cxr', 'aortic', 'erect_chest_xray', 'ct_abdomen', 'ct_abdomen_pelvis', 'ct_angiogram', 'mri_abdomen', 'mrcp', 'ercp'] },
  6: { tier: 6, label: 'Tertiary referral centre — all modalities + endoscopy + nuclear', availableInvestigations: ['fbc', 'ue', 'glucose', 'urinalysis', 'pregnancy_test', 'lft', 'amylase', 'lipase', 'crp', 'cxr', 'aortic', 'erect_chest_xray', 'ct_abdomen', 'ct_abdomen_pelvis', 'ct_angiogram', 'mri_abdomen', 'mrcp', 'ercp', 'endoscopy', 'colonoscopy', 'hida', 'pet_ct', 'egds', 'endoscopic_ultrasound'] },
};

/** Investigation feature IDs mapped to their categories and minimum tier */
const INVESTIGATION_CATALOG: Record<string, { type: SuggestedInvestigation['type']; tier: FacilityTier }> = {
  // Bloods
  fbc: { type: 'lab', tier: 2 },
  ue: { type: 'lab', tier: 2 },
  glucose: { type: 'lab', tier: 2 },
  lft: { type: 'lab', tier: 3 },
  amylase: { type: 'lab', tier: 3 },
  lipase: { type: 'lab', tier: 3 },
  crp: { type: 'lab', tier: 3 },
  // Urine
  urinalysis: { type: 'lab', tier: 2 },
  pregnancy_test: { type: 'lab', tier: 2 },
  // Imaging
  cxr: { type: 'imaging', tier: 3 },
  erect_chest_xray: { type: 'imaging', tier: 3 },
  ct_abdomen: { type: 'imaging', tier: 4 },
  ct_abdomen_pelvis: { type: 'imaging', tier: 4 },
  ct_angiogram: { type: 'imaging', tier: 4 },
  mri_abdomen: { type: 'imaging', tier: 5 },
  mrcp: { type: 'imaging', tier: 5 },
  hida: { type: 'imaging', tier: 5 },
  pet_ct: { type: 'imaging', tier: 6 },
  // Endoscopy
  egds: { type: 'endoscopy', tier: 6 },
  endoscopic_ultrasound: { type: 'endoscopy', tier: 6 },
  colonoscopy: { type: 'endoscopy', tier: 6 },
  ercp: { type: 'endoscopy', tier: 6 },
  endoscopy: { type: 'endoscopy', tier: 6 },
  // Cardiac
  ecg: { type: 'ecg', tier: 3 },
  troponin: { type: 'lab', tier: 3 },
  d_dimer: { type: 'lab', tier: 3 },
};

/**
 * Build an investigation plan based on the current DDX and facility tier.
 */
export function buildInvestigationPlan(
  state: EncounterState,
  facilityTier: FacilityTier = 3,
  diseaseMap: Map<string, DiseaseNode> = ABDOMINAL_PAIN_DISEASE_MAP,
): InvestigationPlan {
  const topCandidates = state.ddx.activeCandidates;
  if (topCandidates.length === 0) {
    return { investigations: [], facilityTier, facilityLabel: FACILITY_TIERS[facilityTier].label };
  }

  const available = new Set(FACILITY_TIERS[facilityTier].availableInvestigations);

  // Collect investigation features from top 5 candidates, weighted by probability
  const invScores = new Map<string, { forDiseases: string[]; totalProb: number }>();

  for (const candidate of topCandidates.slice(0, 5)) {
    const disease = diseaseMap.get(candidate.diseaseId);
    if (!disease) continue;

    for (const inv of disease.features.investigations) {
      const fid = inv.featureId;
      // Only include if achievable at this facility
      if (!available.has(fid)) continue;

      if (!invScores.has(fid)) {
        invScores.set(fid, { forDiseases: [], totalProb: 0 });
      }
      const entry = invScores.get(fid)!;
      if (!entry.forDiseases.includes(disease.name)) {
        entry.forDiseases.push(disease.name);
      }
      entry.totalProb += candidate.currentProb;
    }
  }

  // Build suggested investigations
  const investigations: SuggestedInvestigation[] = Array.from(invScores.entries())
    .map(([fid, sc]) => {
      const catalog = INVESTIGATION_CATALOG[fid];
      const feat = FEATURES[fid];
      const tierLevel = catalog?.tier || 3;
      return {
        featureId: fid,
        label: feat?.label || fid,
        shortLabel: feat?.shortLabel || fid,
        type: catalog?.type || 'lab',
        tier: tierLevel as FacilityTier,
        supportsDiagnoses: sc.forDiseases,
        rulesOutDiagnoses: [],
        urgency: sc.totalProb > 0.5 ? 'immediate' as const : sc.totalProb > 0.2 ? 'urgent' as const : 'routine' as const,
        rationale: `Helps evaluate ${sc.forDiseases.join(', ')}`,
      };
    })
    .sort((a, b) => {
      // Sort by urgency then by tier
      const urgencyOrder = { immediate: 0, urgent: 1, routine: 2 };
      const ua = urgencyOrder[a.urgency];
      const ub = urgencyOrder[b.urgency];
      return ua - ub || a.tier - b.tier;
    });

  return {
    investigations,
    facilityTier,
    facilityLabel: FACILITY_TIERS[facilityTier].label,
  };
}

export const FACILITY_TIER_OPTIONS: { value: FacilityTier; label: string }[] = Object.values(FACILITY_TIERS)
  .map(t => ({ value: t.tier, label: t.label }));
