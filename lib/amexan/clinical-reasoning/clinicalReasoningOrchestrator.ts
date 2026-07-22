// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Reasoning Orchestrator
// Integrates all four clinical reasoning domains (abdominal pain, GI bleeding,
// jaundice, constipation) into a unified gap pipeline for the Information Gap Engine.
// Every question exists because a clinical reasoning rule triggered it.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

import {
  getSocratesGaps,
  getAbdominalPainRedFlagGaps,
  getAbdominalPainPatternGaps,
  getBiodataAdjustedPriors as getAbdominalPainPriors,
} from './abdominalPainReasoning';

import {
  getGiBleedingGaps,
  getGiBleedingPatternGaps,
  getBiodataAdjustedBleedingPriors,
  localizeBleedingSource,
  assessBleedingSeverity,
} from './giBleedingReasoning';

import {
  getJaundiceGaps,
  getJaundicePatternGaps,
  classifyBilirubinType,
} from './jaundiceReasoning';

import {
  getConstipationGaps,
  getConstipationPatternGaps,
  classifyConstipationPathway,
  getBiodataAdjustedConstipationPriors,
} from './constipationReasoning';

import {
  getCoughMechanismGaps,
  getCoughRedFlags,
  computeCoughProbabilities,
  recognizeCoughPhenotype,
} from './coughReasoning';

// ── Chief complaint detection ──────────────────────────────────────────

type ClinicalDomain = 'abdominal_pain' | 'gi_bleeding' | 'jaundice' | 'constipation' | 'cough' | 'mixed' | 'other';

const DOMAIN_KEYWORDS: Record<ClinicalDomain, string[]> = {
  abdominal_pain: ['abdominal pain', 'stomach ache', 'belly pain', 'abd pain', 'abdo pain', 'tummy ache', 'stomach pain', 'abdominal discomfort'],
  gi_bleeding: ['bleeding', 'blood in stool', 'blood in vomit', 'black stool', 'tarry stool', 'hematemesis', 'melena', 'hematochezia', 'rectal bleeding', 'vomiting blood', 'coffee ground'],
  jaundice: ['jaundice', 'yellow', 'yellow eyes', 'yellow skin', 'icterus', 'bilirubin', 'liver problem', 'dark urine'],
  constipation: ['constipation', 'constipated', 'not passing stool', 'hard stool', 'difficult bowel', 'straining', 'obstipation', 'can\'t poop'],
  cough: ['cough', 'coughing', 'hacking', 'productive cough', 'dry cough', 'chest congestion', 'phlegm', 'sputum', 'mucous', 'mucus', 'hemoptysis', 'coughing blood'],
  mixed: [],
  other: [],
};

function detectClinicalDomains(state: EncounterBrainState): ClinicalDomain[] {
  const domains: ClinicalDomain[] = [];
  const ccText = state.patient?.name ? '' : '';
  const answeredFeatures = new Set<string>();

  for (const symptom of Object.values(state.symptoms)) {
    for (const attr of Object.values(symptom.attributes)) {
      answeredFeatures.add(attr.featureId);
    }
  }

  if (answeredFeatures.has('pain_initial_location') || answeredFeatures.has('pain_character') ||
      answeredFeatures.has('pain_severity') || answeredFeatures.has('pain_location_now')) {
    domains.push('abdominal_pain');
  }

  if (answeredFeatures.has('hematemesis') || answeredFeatures.has('melena') ||
      answeredFeatures.has('hematochezia')) {
    domains.push('gi_bleeding');
  }

  if (answeredFeatures.has('jaundice') || answeredFeatures.has('dark_urine') ||
      answeredFeatures.has('pale_stool')) {
    domains.push('jaundice');
  }

  if (answeredFeatures.has('constipation') || answeredFeatures.has('bowel_habits') ||
      answeredFeatures.has('straining') || answeredFeatures.has('incomplete_evacuation')) {
    domains.push('constipation');
  }

  if (answeredFeatures.has('cough_duration') || answeredFeatures.has('cough_character') ||
      answeredFeatures.has('sputum_character') || answeredFeatures.has('dry_cough') ||
      answeredFeatures.has('productive_cough') || answeredFeatures.has('hemoptysis')) {
    domains.push('cough');
  }

  if (domains.length === 0) {
    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      if (domain === 'mixed' || domain === 'other') continue;
      for (const s of Object.values(state.symptoms)) {
        const match = keywords.some(k => s.label.toLowerCase().includes(k));
        if (match) { domains.push(domain as ClinicalDomain); break; }
      }
    }
  }

  if (domains.length > 1 && !domains.includes('mixed')) {
    domains.unshift('mixed');
  }

  return domains.length > 0 ? [...new Set(domains)] : ['other'];
}

// ── Unified gap generation ─────────────────────────────────────────────

export function getClinicalReasoningGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const allGaps: InformationGap[] = [];
  const seenFeatureIds = new Set<string>();
  const domains = detectClinicalDomains(state);

  function addUniqueGaps(newGaps: InformationGap[]): void {
    for (const gap of newGaps) {
      if (!seenFeatureIds.has(gap.featureId)) {
        seenFeatureIds.add(gap.featureId);
        allGaps.push(gap);
      } else {
        const existing = allGaps.find(g => g.featureId === gap.featureId);
        if (existing && gap.priorityScore > existing.priorityScore) {
          existing.priorityScore = gap.priorityScore;
          existing.reasonEssential = gap.reasonEssential;
        }
      }
    }
  }

  if (domains.includes('abdominal_pain') || domains.includes('mixed')) {
    const socratesGaps = getSocratesGaps(state, answeredFeatureIds);
    addUniqueGaps(socratesGaps);

    const redFlagGaps = getAbdominalPainRedFlagGaps(state, answeredFeatureIds);
    addUniqueGaps(redFlagGaps);

    const patternGaps = getAbdominalPainPatternGaps(state, answeredFeatureIds, activeDiseaseStates);
    addUniqueGaps(patternGaps);
  }

  if (domains.includes('gi_bleeding') || domains.includes('mixed')) {
    const bleedGaps = getGiBleedingGaps(state, answeredFeatureIds);
    addUniqueGaps(bleedGaps);

    const bleedPatterGaps = getGiBleedingPatternGaps(state, answeredFeatureIds, activeDiseaseStates);
    addUniqueGaps(bleedPatterGaps);
  }

  if (domains.includes('jaundice') || domains.includes('mixed')) {
    const jaundiceGaps = getJaundiceGaps(state, answeredFeatureIds);
    addUniqueGaps(jaundiceGaps);

    const jaundicePatternGaps = getJaundicePatternGaps(state, answeredFeatureIds, activeDiseaseStates);
    addUniqueGaps(jaundicePatternGaps);
  }

  if (domains.includes('constipation') || domains.includes('mixed')) {
    const constipationGaps = getConstipationGaps(state, answeredFeatureIds);
    addUniqueGaps(constipationGaps);

    const constipationPatternGaps = getConstipationPatternGaps(state, answeredFeatureIds, activeDiseaseStates);
    addUniqueGaps(constipationPatternGaps);
  }

  if (domains.includes('cough') || domains.includes('mixed')) {
    const coughGaps = getCoughMechanismGaps(state);
    addUniqueGaps(coughGaps);
  }

  return allGaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

// ── Domain intelligence helpers ────────────────────────────────────────

export function getActiveClinicalDomains(state: EncounterBrainState): ClinicalDomain[] {
  return detectClinicalDomains(state);
}

export function getPrimaryClinicalDomain(state: EncounterBrainState): ClinicalDomain {
  const domains = detectClinicalDomains(state);
  if (domains.length === 0) return 'other';
  if (domains.includes('mixed')) {
    const nonMixed = domains.filter(d => d !== 'mixed' && d !== 'other');
    return nonMixed[0] || 'mixed';
  }
  return domains[0];
}

export function getBiodataPriorsForAll(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const allPriors: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const domains = detectClinicalDomains(state);

  if (domains.includes('abdominal_pain') || domains.includes('mixed')) {
    Object.assign(allPriors, getAbdominalPainPriors(state));
  }
  if (domains.includes('gi_bleeding') || domains.includes('mixed')) {
    Object.assign(allPriors, getBiodataAdjustedBleedingPriors(state));
  }
  if (domains.includes('constipation') || domains.includes('mixed')) {
    Object.assign(allPriors, getBiodataAdjustedConstipationPriors(state));
  }

  return allPriors;
}

// ── Clinical reasoning summary ─────────────────────────────────────────

export function getClinicalReasoningSummary(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): {
  domains: ClinicalDomain[];
  primaryDomain: ClinicalDomain;
  totalGaps: number;
  safetyGaps: number;
  diagnosticGaps: number;
  managementGaps: number;
  topGaps: InformationGap[];
} {
  const domains = detectClinicalDomains(state);
  const gaps = getClinicalReasoningGaps(state, answeredFeatureIds, activeDiseaseStates);

  return {
    domains,
    primaryDomain: getPrimaryClinicalDomain(state),
    totalGaps: gaps.length,
    safetyGaps: gaps.filter(g => g.category === 'life_threatening').length,
    diagnosticGaps: gaps.filter(g => g.category === 'diagnostic').length,
    managementGaps: gaps.filter(g => g.category === 'management').length,
    topGaps: gaps.slice(0, 5),
  };
}

// ── Specialized assessments ────────────────────────────────────────────

export function assessGiBleedingFromState(state: EncounterBrainState): {
  hematemesis: boolean;
  melena: boolean;
  hematochezia: boolean;
  likelySource: string;
  severity: string;
  blatchfordScore: number;
  action: string;
} | null {
  const answeredFeatures = new Set<string>();
  for (const s of Object.values(state.symptoms)) {
    for (const attr of Object.values(s.attributes)) {
      answeredFeatures.add(attr.featureId);
    }
  }

  const hasHematemesis = answeredFeatures.has('hematemesis');
  const hasMelena = answeredFeatures.has('melena');
  const hasHematochezia = answeredFeatures.has('hematochezia');

  if (!hasHematemesis && !hasMelena && !hasHematochezia) return null;

  const source = localizeBleedingSource(hasHematemesis, hasMelena, hasHematochezia);
  const severity = assessBleedingSeverity(
    undefined, undefined,
    answeredFeatures.has('syncope'),
    undefined,
  );

  return {
    hematemesis: hasHematemesis,
    melena: hasMelena,
    hematochezia: hasHematochezia,
    likelySource: source.likelySource,
    severity: severity.severity,
    blatchfordScore: severity.blatchfordScore,
    action: severity.action,
  };
}

export function assessJaundiceFromState(state: EncounterBrainState): {
  bilirubinType: string;
  category: string;
  confidence: string;
} | null {
  const answeredFeatures = new Set<string>();
  for (const s of Object.values(state.symptoms)) {
    for (const attr of Object.values(s.attributes)) {
      answeredFeatures.add(attr.featureId);
    }
  }

  if (!answeredFeatures.has('jaundice')) return null;

  const hasDarkUrine = answeredFeatures.has('dark_urine');
  const hasPaleStool = answeredFeatures.has('pale_stool');
  const hasClayStool = answeredFeatures.has('clay_colored_stool');
  const hasPruritus = answeredFeatures.has('pruritus');
  const hasFever = answeredFeatures.has('fever');

  const urineColor = hasDarkUrine ? 'dark' : 'normal';
  const stoolColor = hasClayStool ? 'clay_colored' : hasPaleStool ? 'pale' : 'normal';
  const pruritus = hasPruritus ? 'present' : 'none';

  const result = classifyBilirubinType(urineColor, stoolColor, pruritus, false, hasFever);

  return {
    bilirubinType: result.bilirubinType,
    category: result.category,
    confidence: result.confidence,
  };
}

export function assessConstipationFromState(state: EncounterBrainState): {
  pathway: string;
  rationale: string;
} | null {
  const answeredFeatures = new Set<string>();
  for (const s of Object.values(state.symptoms)) {
    for (const attr of Object.values(s.attributes)) {
      answeredFeatures.add(attr.featureId);
    }
  }

  if (!answeredFeatures.has('constipation') && !answeredFeatures.has('bowel_habits')) return null;

  const hasStraining = answeredFeatures.has('straining');
  const hasIncomplete = answeredFeatures.has('incomplete_evacuation');
  const hasManual = answeredFeatures.has('manual_maneuvers_needed');
  const hasBloating = answeredFeatures.has('bloating');
  const hasPainRelieved = answeredFeatures.has('pain_relieved_by_stool');
  const frequency = 'mild_3_5_per_week';

  const result = classifyConstipationPathway(
    frequency, hasStraining, hasIncomplete, hasManual,
    hasBloating, hasPainRelieved, [],
    state.patient.ageYears,
  );

  return { pathway: result.primaryPathway, rationale: result.rationale };
}
