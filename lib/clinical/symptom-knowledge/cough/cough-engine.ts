// ═══════════════════════════════════════════════════════════════
// AMEXAN UNIVERSAL CLINICAL OPERATING SYSTEM (UCOS)
// COUGH ENGINE — processes cough through all 18 layers
// Evidence scoring, phenotype recognition, context-adaptive
// question selection, multi-guideline support, HMIS event firing.
// ═══════════════════════════════════════════════════════════════

import type {
  FactObject, MechanismActivation, PhenotypeActivation,
  ClinicalConfidence, QuestionPriority,
} from '../../constitutional/hpi-constitution';
import type { AgeGroup } from '../../constitutional/registration-engine/types';
import {
  COUGH_KNOWLEDGE,
  type CoughIdentity, type CoughContextRule, type CoughContextBehaviour,
  type CoughCause, type CoughEtiology,
  type CoughMechanism, type CoughPhenotype, type CoughQuestion,
  type CoughExamCard, type CoughExamFinding,
  type CoughDifferentialLink,
  type CoughInvestigationMap, type CoughResultInterpretation, type CoughFindingInterpretation,
  type CoughManagement, type CoughTreatmentLine,
  type CoughGuideline, type CoughDiseaseGuideline, type CoughCustomRule,
  type CoughWorkflow, type CoughWorkflowStep,
  type CoughMonitoring, type CoughMonitoringParameter,
  type CoughHMISEvent,
  type CoughSeverityClass, type CoughDurationClass, type CoughUrgency,
  type CoughContextVisibility, type CoughContextCondition,
} from './cough-knowledge';
import {
  determineActiveContexts, resolveContextDisease,
  type PatientContextProfile, type UniversalContext,
  type ContextAwareDiseaseProfile, type ResolvedContextDisease,
} from './cough-context-architecture';
import { ALL_PART1_PROFILES } from './cough-disease-context-profiles-p1';
import { ALL_PART2_PROFILES } from './cough-disease-context-profiles-p2';
import { getFactByAttribute } from '../../constitutional/hpi-engine';
import { DISEASE_REGISTRY } from '../../constitutional/disease-registry';
import { type DiseaseObject, ACTIVATION_THRESHOLDS } from '../../constitutional/clinical-knowledge-constitution';

// ─────────────────────────────────────────────────────────────────
// ENGINE INPUT / OUTPUT
// ─────────────────────────────────────────────────────────────────

export interface CoughEngineInput {
  encounterId: string;
  patientId: string;
  facts: FactObject[];
  factGraph: { facts: Map<string, FactObject> };
  patientAgeGroup: string;
  patientContext: CoughContextCondition;
  answeredQuestionIds: string[];
  completedExamIds: string[];
  collectedInvestigationIds: string[];
  activeGuidelineIds: string[];
}

export interface CoughScoredDisease {
  diseaseId: string;
  diseaseName: string;
  score: number;
  evidenceFor: string[];
  evidenceAgainst: string[];
  mechanismMatch: string[];
  phenotypeMatch: string[];
  confidence: ClinicalConfidence;
  urgency: CoughUrgency;
  investigationRequired: string[];
}

export interface CoughEngineOutput {
  identity: typeof COUGH_KNOWLEDGE.identity;

  // Layer 2: Context
  activeContextRules: CoughContextRule[];
  contextBehaviour: CoughContextBehaviour | null;

  // Layer 2b: Multi-context Disease Architecture
  resolvedContexts: string[];
  diseaseProfilesResolved: number;

  // Layer 3: Etiology
  etiologyScores: Record<string, number>;
  topEtiologies: { id: string; name: string; score: number; mechanism: string }[];

  // Layer 4: Mechanism
  mechanismScores: Record<string, number>;
  activeMechanisms: { id: string; label: string; score: number }[];

  // Layer 5: Phenotype
  phenotypeScores: Record<string, number>;
  activePhenotypes: { id: string; label: string; score: number; urgency: CoughUrgency }[];

  // Layer 6: Questions
  nextBestQuestions: CoughQuestion[];
  urgentQuestions: CoughQuestion[];
  allVisibleQuestions: CoughQuestion[];
  questionCount: number;

  // Layer 7: Exam
  suggestedExamCards: CoughExamCard[];
  examFindingsCollected: number;

  // Layer 8: Differentials
  differentials: CoughScoredDisease[];
  topDifferential: CoughScoredDisease | null;
  differentialUrgency: CoughUrgency;

  // Layer 9: Investigations
  investigationPlan: { diseaseId: string; initialRequired: string[]; initialSuggested: string[]; confirmatory: string[] }[];
  urgentInvestigations: string[];

  // Layer 10: Results
  resultInterpretations: { investigationId: string; findings: { finding: string; supports: string; weight: number; contradicts: string | null }[] }[];

  // Layer 11: Management
  managementPlan: { diseaseId: string; treatmentLines: CoughTreatmentLine[]; supportiveCare: string[]; disposition: string[] }[];

  // Layer 12: Guidelines
  activeGuidelinesApplied: { guidelineId: string; diseaseGuidelines: CoughDiseaseGuideline[]; customRules: CoughCustomRule[] }[];

  // Layer 14: Workflow
  workflows: { diseaseId: string; steps: CoughWorkflowStep[]; requiresAdmission: boolean }[];

  // Layer 15: Monitoring
  monitoringPlan: { diseaseId: string; parameters: CoughMonitoringParameter[]; frequency: string }[];

  // Layer 18: HMIS Events
  hmisEvents: { event: CoughHMISEvent; triggeredBy: string }[];

  // HPI Narrative
  hpiNarrative: string;
  clinicalNote: string;
  patientSummary: string;

  // Summary
  urgency: CoughUrgency;
  summary: string;
  evidenceSummary: string;
}

// ─────────────────────────────────────────────────────────────────
// HPI NARRATIVE — clinical documentation generation
// ─────────────────────────────────────────────────────────────────

export interface CoughHPIComponent {
  category: 'presentation' | 'onset' | 'character' | 'timing' | 'severity' | 'sputum' | 'associated' | 'context' | 'modifiers' | 'exam' | 'impression';
  content: string;
}

export interface CoughHPIOutput {
  hpiNarrative: string;
  hpiStructured: CoughHPIComponent[];
  clinicalNote: string;
  patientSummary: string;
}

// ─────────────────────────────────────────────────────────────────
// LAYER 2: CONTEXT ENGINE — apply context rules
// ─────────────────────────────────────────────────────────────────

function matchContextCondition(condition: CoughContextCondition, patientContext: CoughContextCondition): boolean {
  if (condition.ageGroup && condition.ageGroup !== patientContext.ageGroup) return false;
  if (condition.sex && condition.sex !== patientContext.sex) return false;
  if (condition.pregnant === true && patientContext.pregnant !== true) return false;
  if (condition.hivPositive === true && patientContext.hivPositive !== true) return false;
  if (condition.heartFailure === true && patientContext.heartFailure !== true) return false;
  if (condition.copd === true && patientContext.copd !== true) return false;
  if (condition.icuPatient === true && patientContext.icuPatient !== true) return false;
  if (condition.ventilated === true && patientContext.ventilated !== true) return false;
  if (condition.immunosuppressed === true && patientContext.immunosuppressed !== true) return false;
  if (condition.postoperative === true && patientContext.postoperative !== true) return false;
  if (condition.cancerPatient === true && patientContext.cancerPatient !== true) return false;
  return true;
}

function mergeContextBehaviours(rules: CoughContextRule[]): CoughContextBehaviour {
  const merged: CoughContextBehaviour = {
    nocturnalCoughWeight: 0.5,
    feedingCoughWeight: 0.3,
    chronicCoughThreshold: 14,
    cancerBranchOpens: false,
    tbBranchOpens: false,
    asthmaBranchWeight: 0.5,
    gerdBranchWeight: 0.3,
    aceInhibitorCheck: false,
    peRiskMultiplier: 1.0,
    aspirationRiskWeight: 0.3,
    additionalRequiredQuestions: [],
    additionalRequiredExams: [],
    hiddenQuestions: [],
    priorityOverrides: {},
  };

  for (const rule of rules) {
    if (rule.behaviour.nocturnalCoughWeight !== undefined) merged.nocturnalCoughWeight = Math.max(merged.nocturnalCoughWeight, rule.behaviour.nocturnalCoughWeight);
    if (rule.behaviour.feedingCoughWeight !== undefined) merged.feedingCoughWeight = Math.max(merged.feedingCoughWeight, rule.behaviour.feedingCoughWeight);
    if (rule.behaviour.chronicCoughThreshold !== undefined) merged.chronicCoughThreshold = Math.min(merged.chronicCoughThreshold, rule.behaviour.chronicCoughThreshold);
    if (rule.behaviour.cancerBranchOpens) merged.cancerBranchOpens = true;
    if (rule.behaviour.tbBranchOpens) merged.tbBranchOpens = true;
    if (rule.behaviour.asthmaBranchWeight !== undefined) merged.asthmaBranchWeight = Math.max(merged.asthmaBranchWeight, rule.behaviour.asthmaBranchWeight);
    if (rule.behaviour.gerdBranchWeight !== undefined) merged.gerdBranchWeight = Math.max(merged.gerdBranchWeight, rule.behaviour.gerdBranchWeight);
    if (rule.behaviour.aceInhibitorCheck) merged.aceInhibitorCheck = true;
    if (rule.behaviour.peRiskMultiplier !== undefined) merged.peRiskMultiplier = Math.max(merged.peRiskMultiplier, rule.behaviour.peRiskMultiplier);
    if (rule.behaviour.aspirationRiskWeight !== undefined) merged.aspirationRiskWeight = Math.max(merged.aspirationRiskWeight, rule.behaviour.aspirationRiskWeight);
    merged.additionalRequiredQuestions = [...new Set([...merged.additionalRequiredQuestions, ...rule.behaviour.additionalRequiredQuestions])];
    merged.additionalRequiredExams = [...new Set([...merged.additionalRequiredExams, ...rule.behaviour.additionalRequiredExams])];
    merged.hiddenQuestions = [...new Set([...merged.hiddenQuestions, ...rule.behaviour.hiddenQuestions])];
    Object.assign(merged.priorityOverrides, rule.behaviour.priorityOverrides);
  }

  return merged;
}

export function resolveCoughContext(
  patientContext: CoughContextCondition,
): { activeRules: CoughContextRule[]; behaviour: CoughContextBehaviour } {
  const activeRules = COUGH_KNOWLEDGE.contextRules.filter(rule =>
    matchContextCondition(rule.condition, patientContext),
  );
  const behaviour = mergeContextBehaviours(activeRules);
  return { activeRules, behaviour };
}

// ─────────────────────────────────────────────────────────────────
// CONTEXT-AWARE DISEASE RESOLVER — bridge to multi-context architecture
// ─────────────────────────────────────────────────────────────────

export function buildPatientContextProfile(
  ctx: CoughContextCondition,
  facts: FactObject[],
): PatientContextProfile {
  const factValues = new Map<string, unknown>();
  for (const f of facts) {
    if (f.isActive && !f.isStale) factValues.set(f.attribute, f.value);
  }
  const ageYears = factValues.get('age_years') as number | null ?? null;
  return {
    ageGroup: ctx.ageGroup ?? 'adult',
    pregnant: ctx.pregnant ?? false,
    breastfeeding: factValues.get('breastfeeding') === true,
    postpartum: ctx.postpartum ?? false,
    hivPositive: ctx.hivPositive ?? false,
    cd4Count: factValues.get('cd4_count') as number | null ?? null,
    onArt: factValues.get('on_art') === true,
    artDurationWeeks: factValues.get('art_duration_weeks') as number | null ?? null,
    ageYears,
    weightKg: factValues.get('weight_kg') as number | null ?? null,
    copd: ctx.copd ?? false,
    asthma: factValues.get('asthma') === true,
    heartFailure: ctx.heartFailure ?? false,
    diabetes: factValues.get('diabetes') === true,
    renalFailure: ctx.renalFailure ?? false,
    liverDisease: ctx.liverDisease ?? false,
    malnutrition: factValues.get('malnutrition') === true,
    transplant: factValues.get('transplant') === true,
    onChemotherapy: factValues.get('on_chemotherapy') === true,
    onRadiation: factValues.get('on_radiation') === true,
    onSteroids: factValues.get('on_steroids') === true,
    icuPatient: ctx.icuPatient ?? false,
    ventilated: ctx.ventilated ?? false,
    postoperative: ctx.postoperative ?? false,
    cerebrovascularDisease: factValues.get('cerebrovascular_disease') === true,
    dementia: factValues.get('dementia') === true,
    endemicTbHigh: factValues.get('endemic_tb_high') === true,
    endemicFungal: factValues.get('endemic_fungal') === true,
    tbContactHousehold: factValues.get('tb_contact_household') === true,
    healthcareWorker: factValues.get('healthcare_worker') === true,
    resourceSetting: (factValues.get('resource_setting') as 'low' | 'middle' | 'high') ?? 'middle',
  };
}

const ALL_DISEASE_PROFILES: ContextAwareDiseaseProfile[] = [
  ...ALL_PART1_PROFILES,
  ...ALL_PART2_PROFILES,
];

export function resolveAllContextDiseases(
  profiles: ContextAwareDiseaseProfile[],
  activeContexts: UniversalContext[],
  ageGroup: string,
): Map<string, ResolvedContextDisease> {
  const resolved = new Map<string, ResolvedContextDisease>();
  for (const profile of profiles) {
    resolved.set(profile.diseaseId, resolveContextDisease(profile, activeContexts, ageGroup));
  }
  return resolved;
}

export function applyContextOverridesToDifferential(
  scoredDisease: CoughScoredDisease,
  resolved: ResolvedContextDisease | undefined,
): CoughScoredDisease {
  if (!resolved) return scoredDisease;
  let adjustedScore = scoredDisease.score;
  if (resolved.resolvedActivationThreshold < 0.3) adjustedScore += 0.05;
  if (resolved.resolvedDifferentials.length > 0) {
    for (const rd of resolved.resolvedDifferentials) {
      if (rd.diseaseId === scoredDisease.diseaseId) adjustedScore += rd.weight * 0.1;
    }
  }
  return {
    ...scoredDisease,
    score: Math.min(1, Math.round(adjustedScore * 100) / 100),
    urgency: resolved.resolvedUrgency,
    investigationRequired: [
      ...new Set([
        ...resolved.resolvedInvestigations.initialRequired,
        ...resolved.resolvedInvestigations.initialSuggested,
        ...resolved.resolvedInvestigations.confirmatory,
      ]),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 3: ETIOLOGY SCORING — score causes based on facts
// ─────────────────────────────────────────────────────────────────

export function scoreCoughEtiologies(
  facts: FactObject[],
  contextBehaviour: CoughContextBehaviour | null,
): { scores: Record<string, number>; topEtiologies: { id: string; name: string; score: number; mechanism: string }[] } {
  const scores: Record<string, number> = {};
  const factValues = new Map<string, unknown>();
  for (const f of facts) {
    if (f.isActive && !f.isStale) factValues.set(f.attribute, f.value);
  }

  for ( const group of COUGH_KNOWLEDGE.etiologies) {
    for (const cause of group.causes) {
      let score = 0.05;
      let matchedFeatures = 0;

      for (const feature of cause.discriminatingFeatures) {
        const val = factValues.get(feature);
        if (val === true || val === 'yes' || (typeof val === 'string' && feature.includes(val as string))) {
          score += 0.15;
          matchedFeatures++;
        }
      }

      for (const evidence of cause.requiredEvidence) {
        const val = factValues.get(evidence);
        if (val === true || val === 'yes') {
          score += 0.2;
        }
      }

      if (cause.typicality === 'common') score += 0.05;
      if (cause.typicality === 'rare') score -= 0.02;

      // Duration-based adjustment
      const durationFact = factValues.get('cough_duration');
      if (durationFact) {
        if (['<3_days', '3_days_to_3_weeks'].includes(durationFact as string)) {
          score += cause.acuteProbability * 0.3;
        } else if (['>8_weeks', '3_to_8_weeks'].includes(durationFact as string)) {
          score += cause.chronicProbability * 0.3;
        }
      }

      // Context adjustments
      if (contextBehaviour) {
        if (cause.id === 'lung_cancer' && contextBehaviour.cancerBranchOpens) score += 0.1;
        if (cause.id === 'tb' && contextBehaviour.tbBranchOpens) score += 0.1;
        if (cause.id === 'pe' && contextBehaviour.peRiskMultiplier > 1) score += 0.05 * contextBehaviour.peRiskMultiplier;
        if (['tracheoesophageal_fistula', 'vascular_ring', 'aspiration'].includes(cause.id)) {
          score += contextBehaviour.aspirationRiskWeight * 0.1;
        }
      }

      scores[cause.id] = Math.min(1, Math.round(score * 100) / 100);
    }
  }

  const topEtiologies = Object.entries(scores)
    .map(([id, score]) => {
      for (const group of COUGH_KNOWLEDGE.etiologies) {
        const cause = group.causes.find(c => c.id === id);
        if (cause) return { id, name: cause.name, score, mechanism: group.mechanismGroup };
      }
      return { id, name: id, score, mechanism: 'unknown' };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return { scores, topEtiologies };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 4: MECHANISM SCORING — activate cough-specific mechanisms
// ─────────────────────────────────────────────────────────────────

export function scoreCoughMechanisms(
  facts: FactObject[],
  contextBehaviour: CoughContextBehaviour | null,
): { scores: Record<string, number>; active: { id: string; label: string; score: number }[] } {
  const scores: Record<string, number> = {};
  const factValues = new Map<string, unknown>();
  for (const f of facts) {
    if (f.isActive && !f.isStale) factValues.set(f.attribute, f.value);
  }

  for (const mech of COUGH_KNOWLEDGE.mechanisms) {
    let score = 0.1;
    let evidenceCount = 0;

    for (const evidence of mech.evidenceRequired) {
      const val = factValues.get(evidence);
      if (val === true || val === 'yes') {
        score += 0.25;
        evidenceCount++;
      }
    }

    for (const phenotype of mech.typicalPhenotypes) {
      for (const [, v] of factValues) {
        if (typeof v === 'string' && phenotype.includes(v as string)) {
          score += 0.1;
        }
      }
    }

    if (evidenceCount >= mech.evidenceRequired.length && mech.evidenceRequired.length > 0) {
      score += 0.15;
    }

    // Context adjustments
    if (contextBehaviour) {
      if (mech.id === 'bronchospasm') score += contextBehaviour.asthmaBranchWeight * 0.1;
      if (mech.id === 'pulmonary_edema') score += contextBehaviour.nocturnalCoughWeight * 0.1;
      if (mech.id === 'neoplastic_infiltration' && contextBehaviour.cancerBranchOpens) score += 0.15;
      if (mech.id === 'alveolar_inflammation' && contextBehaviour.tbBranchOpens) score += 0.1;
      if (mech.id === 'vagal_stimulation') score += contextBehaviour.gerdBranchWeight * 0.1;
      if (mech.id === 'chemical_stimulation' && contextBehaviour.aceInhibitorCheck) score += 0.15;
    }

    scores[mech.id] = Math.min(1, Math.round(score * 100) / 100);
  }

  const active = Object.entries(scores)
    .map(([id, score]) => {
      const mech = COUGH_KNOWLEDGE.mechanisms.find(m => m.id === id)!;
      return { id, label: mech ? mech.label : id, score };
    })
    .filter(m => m.score > 0.2)
    .sort((a, b) => b.score - a.score);

  return { scores, active };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 5: PHENOTYPE RECOGNITION — match features to phenotypes
// ─────────────────────────────────────────────────────────────────

export function recognizeCoughPhenotypes(
  facts: FactObject[],
  activeMechanisms: { id: string; label: string; score: number }[],
): { scores: Record<string, number>; active: { id: string; label: string; score: number; urgency: CoughUrgency }[] } {
  const scores: Record<string, number> = {};
  const factValues = new Map<string, unknown>();
  for (const f of facts) {
    if (f.isActive && !f.isStale) factValues.set(f.attribute, f.value);
  }

  for (const phen of COUGH_KNOWLEDGE.phenotypes) {
    let score = 0;
    let matched = 0;

    for (const feature of phen.keyFeatures) {
      const val = factValues.get(feature);
      if (val === true || val === 'yes') {
        score += 0.2;
        matched++;
      }
      // Check if any fact attribute or value contains the feature
      for (const [, v] of factValues) {
        if (typeof v === 'string' && v.toLowerCase().includes(feature.replace(/_/g, ' ').toLowerCase())) {
          score += 0.05;
        }
      }
    }

    // Boost from mechanism overlap
    const mechanismOverlap = phen.likelyMechanisms.filter(lm =>
      activeMechanisms.some(am => am.id === lm || am.label.toLowerCase().includes(lm.toLowerCase())),
    );
    score += mechanismOverlap.length * 0.15;

    // Duration fact matches phenotype
    const durationFact = factValues.get('cough_duration');
    if (durationFact) {
      const durationStr = durationFact as string;
      if (phen.id === 'cough_acute_dry' || phen.id === 'cough_acute_productive') {
        if (['<3_days', '3_days_to_3_weeks'].includes(durationStr)) score += 0.15;
      }
      if (phen.id === 'cough_chronic') {
        if (['>8_weeks', '3_to_8_weeks'].includes(durationStr)) score += 0.2;
      }
    }

    // Sputum fact matches
    const sputumFact = factValues.get('cough_sputum');
    if (sputumFact) {
      if (phen.id === 'cough_acute_dry' && sputumFact === 'none') score += 0.15;
      if (phen.id === 'cough_acute_productive' && sputumFact !== 'none') score += 0.15;
      if (phen.id === 'cough_hemoptysis' && (sputumFact === 'blood_streaked' || sputumFact === 'frank_blood')) score += 0.3;
    }

    scores[phen.id] = Math.min(1, Math.round(score * 100) / 100);
  }

  const active = Object.entries(scores)
    .map(([id, score]) => {
      const phen = COUGH_KNOWLEDGE.phenotypes.find(p => p.id === id)!;
      return { id, label: phen ? phen.label : id, score, urgency: phen ? phen.urgency : 'green' };
    })
    .filter(p => p.score > 0.25)
    .sort((a, b) => b.score - a.score);

  return { scores, active };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 6: QUESTION ENGINE — select best next questions
// ─────────────────────────────────────────────────────────────────

function isQuestionVisible(
  question: CoughQuestion,
  contextBehaviour: CoughContextBehaviour | null,
  patientAgeGroup: string,
): boolean {
  if (!contextBehaviour) return true;

  // Hidden questions
  if (contextBehaviour.hiddenQuestions.includes(question.id)) return false;

  // Context visibility
  if (question.contextVisibility.hideForContexts.length > 0) {
    if (question.contextVisibility.hideForContexts.some(ctx => ctx === patientAgeGroup)) return false;
  }

  if (question.contextVisibility.forceForContexts.length > 0) {
    if (question.contextVisibility.forceForContexts.some(ctx => ctx === patientAgeGroup)) return true;
  }

  if (question.contextVisibility.showForContexts.length > 0) {
    if (!question.contextVisibility.showForContexts.some(ctx => ctx === patientAgeGroup)) return false;
  }

  return true;
}

function isQuestionDependencyMet(question: CoughQuestion, answeredIds: Set<string>): boolean {
  if (question.dependencies.length === 0) return true;
  return question.dependencies.every(dep => answeredIds.has(dep));
}

export function resolveAdaptedQuestionText(
  question: CoughQuestion,
  patientAgeGroup: string,
): { text: string; options: { value: string; label: string; documentationPhrase: string }[] | undefined } {
  if (!question.contextTextOverrides || question.contextTextOverrides.length === 0) {
    return { text: question.text, options: question.options };
  }
  const matched = question.contextTextOverrides.find(o => {
    const patterns = o.contextPattern.split('|');
    return patterns.some(p => patientAgeGroup.includes(p) || p === patientAgeGroup);
  });
  if (matched) {
    return { text: matched.text, options: matched.options };
  }
  return { text: question.text, options: question.options };
}

export function selectCoughQuestions(
  facts: FactObject[],
  activePhenotypes: { id: string; label: string; score: number }[],
  activeMechanisms: { id: string; label: string; score: number }[],
  answeredQuestionIds: string[],
  contextBehaviour: CoughContextBehaviour | null,
  patientAgeGroup: string,
): {
  nextBestQuestions: CoughQuestion[];
  urgentQuestions: CoughQuestion[];
  allVisibleQuestions: CoughQuestion[];
} {
  const answeredSet = new Set(answeredQuestionIds);
  const allVisible: CoughQuestion[] = [];
  const urgent: CoughQuestion[] = [];
  const scored: { question: CoughQuestion; gain: number }[] = [];

  const activePhenotypeIds = new Set(activePhenotypes.map(p => p.id));
  const activeMechanismIds = new Set(activeMechanisms.map(m => m.id));

  for (const q of COUGH_KNOWLEDGE.questions) {
    if (answeredSet.has(q.id)) continue;
    if (!isQuestionVisible(q, contextBehaviour, patientAgeGroup)) continue;
    if (!isQuestionDependencyMet(q, answeredSet)) continue;

    allVisible.push(q);

    // Calculate information gain
    let gain = q.expectedInformationGain;

    // Boost if question resolves active phenotypes
    const phenotypeOverlap = q.reducesUncertaintyFor.filter(id => activePhenotypeIds.has(id));
    gain += phenotypeOverlap.length * 0.15;

    // Boost if question supports active mechanisms
    const mechanismOverlap = q.mechanismSupported.filter(id => activeMechanismIds.has(id));
    gain += mechanismOverlap.length * 0.1;

    // Priority boost
    if (q.priority === 'critical') gain += 0.4;
    if (q.priority === 'essential') gain += 0.2;

    // Context visibility priority overrides
    if (contextBehaviour?.priorityOverrides[q.id]) {
      const overridePriority = contextBehaviour.priorityOverrides[q.id];
      if (overridePriority === 'critical') gain += 0.5;
      if (overridePriority === 'essential') gain += 0.3;
    }

    // Additional required questions get boost
    if (contextBehaviour?.additionalRequiredQuestions.includes(q.id)) {
      gain += 0.3;
    }

    scored.push({ question: q, gain: Math.round(gain * 100) / 100 });
  }

  scored.sort((a, b) => b.gain - a.gain);

  const nextBest = scored.filter(s => s.gain >= 0.3).map(s => s.question);
  const urgentQ = allVisible.filter(q =>
    q.priority === 'critical' ||
    (contextBehaviour?.priorityOverrides[q.id] === 'critical'),
  );

  return {
    nextBestQuestions: nextBest.slice(0, 5),
    urgentQuestions: urgentQ,
    allVisibleQuestions: allVisible,
  };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 7: EXAM ENGINE — suggest exam cards
// ─────────────────────────────────────────────────────────────────

export function suggestCoughExams(
  facts: FactObject[],
  activePhenotypes: { id: string; label: string }[],
  contextBehaviour: CoughContextBehaviour | null,
  patientAgeGroup: string,
  completedExamIds: string[],
): CoughExamCard[] {
  const completedSet = new Set(completedExamIds);
  const activePhenotypeIds = new Set(activePhenotypes.map(p => p.id));
  const suggested: CoughExamCard[] = [];

  for (const card of COUGH_KNOWLEDGE.examCards) {
    if (completedSet.has(card.id)) continue;

    // Context visibility
    if (card.contextVisibility.hideForContexts.some(ctx => ctx === patientAgeGroup)) continue;
    if (card.contextVisibility.forceForContexts.length > 0) {
      if (!card.contextVisibility.forceForContexts.some(ctx => ctx === patientAgeGroup)) continue;
    }
    if (card.contextVisibility.showForContexts.length > 0) {
      if (!card.contextVisibility.showForContexts.some(ctx => ctx === patientAgeGroup)) continue;
    }

    // Additional required exams from context
    if (contextBehaviour?.additionalRequiredExams.includes(card.id)) {
      suggested.push(card);
      continue;
    }

    // Phenotype visibility
    if (card.phenotypeVisibility.length > 0) {
      if (!card.phenotypeVisibility.some(pid => activePhenotypeIds.has(pid))) continue;
    }

    suggested.push(card);
  }

  // Sort by priority
  return suggested.sort((a, b) => {
    const priorityOrder: Record<QuestionPriority, number> = { critical: 0, essential: 1, standard: 2, helpful: 3, optional: 4, never_ask: 5 };
    return (priorityOrder[a.priority] ?? 5) - (priorityOrder[b.priority] ?? 5);
  });
}

// ─────────────────────────────────────────────────────────────────
// LAYER 8: DIFFERENTIAL ENGINE — score and rank differentials
// ─────────────────────────────────────────────────────────────────

export function scoreCoughDifferentials(
  facts: FactObject[],
  activePhenotypes: { id: string; label: string; score: number }[],
  activeMechanisms: { id: string; label: string; score: number }[],
  contextBehaviour: CoughContextBehaviour | null,
  patientAgeGroup: string,
): { differentials: CoughScoredDisease[]; topDisease: CoughScoredDisease | null; urgency: CoughUrgency } {
  const factValues = new Map<string, unknown>();
  for (const f of facts) {
    if (f.isActive && !f.isStale) factValues.set(f.attribute, f.value);
  }

  const scored: CoughScoredDisease[] = [];
  let topUrgency: CoughUrgency = 'green';

  for (const diff of COUGH_KNOWLEDGE.differentials) {
    let score = diff.basePrevalence;
    const evidenceFor: string[] = [];
    const evidenceAgainst: string[] = [];
    const mechanismMatch: string[] = [];
    const phenotypeMatch: string[] = [];

    // Age prevalence modifier
    if (diff.agePrevalenceModifiers) {
      const ageMod = diff.agePrevalenceModifiers[patientAgeGroup as AgeGroup];
      if (ageMod) score += ageMod * 0.3;
    }

    // Phenotype match
    const matchingPhenotypes = activePhenotypes.filter(ap =>
      diff.typicalPhenotypes.includes(ap.id),
    );
    for (const mp of matchingPhenotypes) {
      score += mp.score * 0.2;
      phenotypeMatch.push(mp.label);
    }

    // Mechanism match
    const matchingMechanisms = activeMechanisms.filter(am =>
      diff.commonMechanisms.some(cm => am.label.toLowerCase().includes(cm.toLowerCase()) || am.id === cm),
    );
    score += matchingMechanisms.length * 0.1;
    for (const mm of matchingMechanisms) {
      mechanismMatch.push(mm.label);
    }

    // Key discriminating facts
    for (const fact of diff.keyDiscriminatingFacts) {
      const val = factValues.get(fact);
      if (val === true || val === 'yes') {
        score += 0.15;
        evidenceFor.push(fact);
      } else if (val === false || val === 'no') {
        evidenceAgainst.push(fact);
      }
    }

    // Context adjustments
    if (contextBehaviour) {
      if (diff.diseaseId === 'lung_cancer' && contextBehaviour.cancerBranchOpens) {
        const smokingFact = factValues.get('cough_smoking');
        if (smokingFact === 'current' || smokingFact === 'ex') score += 0.1;
      }
      if (diff.diseaseId === 'tb' && contextBehaviour.tbBranchOpens) {
        const nightSweats = factValues.get('cough_night_sweats');
        if (nightSweats === true) score += 0.1;
      }
      if (diff.diseaseId === 'pe') {
        score += contextBehaviour.peRiskMultiplier * 0.02;
      }
    }

    const normalizedScore = Math.min(1, Math.round(score * 100) / 100);

    const confidence: ClinicalConfidence =
      normalizedScore >= 0.6 ? 'high' :
      normalizedScore >= 0.35 ? 'moderate' :
      normalizedScore >= 0.15 ? 'low' : 'suspected';

    const urgencyOrder: Record<CoughUrgency, number> = { red: 4, orange: 3, yellow: 2, green: 1 };
    if (urgencyOrder[diff.urgency] > urgencyOrder[topUrgency]) {
      topUrgency = diff.urgency;
    }

    scored.push({
      diseaseId: diff.diseaseId,
      diseaseName: diff.diseaseName,
      score: normalizedScore,
      evidenceFor,
      evidenceAgainst,
      mechanismMatch,
      phenotypeMatch,
      confidence,
      urgency: diff.urgency,
      investigationRequired: diff.investigationRequired,
    });
  }

  scored.sort((a, b) => b.score - a.score);

  return {
    differentials: scored,
    topDisease: scored[0] ?? null,
    urgency: topUrgency,
  };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 9: INVESTIGATION ENGINE — determine investigation readiness
// ─────────────────────────────────────────────────────────────────

export function determineCoughInvestigations(
  differentials: CoughScoredDisease[],
): {
  plan: { diseaseId: string; initialRequired: string[]; initialSuggested: string[]; confirmatory: string[] }[];
  urgentInvestigations: string[];
} {
  const plan: { diseaseId: string; initialRequired: string[]; initialSuggested: string[]; confirmatory: string[] }[] = [];
  const urgentSet = new Set<string>();
  const urgentOrder: Record<CoughUrgency, number> = { red: 4, orange: 3, yellow: 2, green: 1 };

  for (const diff of differentials) {
    if (diff.score < 0.2) continue;

    const invMap = COUGH_KNOWLEDGE.investigationMap.find(m => m.diseaseId === diff.diseaseId);
    if (!invMap) continue;

    if (diff.score >= invMap.activationThreshold) {
      plan.push({
        diseaseId: diff.diseaseId,
        initialRequired: invMap.initialRequired,
        initialSuggested: invMap.initialSuggested,
        confirmatory: invMap.confirmatory,
      });

      if (urgentOrder[diff.urgency] >= 3) {
        for (const inv of [...invMap.initialRequired, ...invMap.initialSuggested]) {
          urgentSet.add(inv);
        }
      }
    }
  }

  return {
    plan,
    urgentInvestigations: [...urgentSet],
  };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 10: RESULT INTERPRETATION — interpret investigation results
// ─────────────────────────────────────────────────────────────────

export function interpretCoughResults(
  collectedInvestigationIds: string[],
): {
  interpretations: { investigationId: string; findings: { finding: string; supports: string; weight: number; contradicts: string | null }[] }[];
} {
  const interpretations: { investigationId: string; findings: { finding: string; supports: string; weight: number; contradicts: string | null }[] }[] = [];

  for (const invId of collectedInvestigationIds) {
    const resultDef = COUGH_KNOWLEDGE.resultInterpretations.find(r => r.investigationId === invId);
    if (!resultDef) continue;

    interpretations.push({
      investigationId: invId,
      findings: resultDef.findings.map(f => ({
        finding: f.finding,
        supports: f.supportsDiseaseId,
        weight: f.weight,
        contradicts: f.contradictsDiseaseId,
      })),
    });
  }

  return { interpretations };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 11: MANAGEMENT ENGINE — generate treatment plans
// ─────────────────────────────────────────────────────────────────

export function generateCoughManagement(
  differentials: CoughScoredDisease[],
): {
  plans: { diseaseId: string; treatmentLines: CoughTreatmentLine[]; supportiveCare: string[]; disposition: string[] }[];
} {
  const plans: { diseaseId: string; treatmentLines: CoughTreatmentLine[]; supportiveCare: string[]; disposition: string[] }[] = [];

  for (const diff of differentials) {
    if (diff.score < 0.3) continue;

    const management = COUGH_KNOWLEDGE.management.find(m => m.diseaseId === diff.diseaseId);
    if (!management) continue;

    plans.push({
      diseaseId: diff.diseaseId,
      treatmentLines: management.treatmentLines,
      supportiveCare: management.supportiveCare,
      disposition: management.dispositionCriteria,
    });
  }

  return { plans };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 12: GUIDELINE ENGINE — apply active guidelines
// ─────────────────────────────────────────────────────────────────

export function applyCoughGuidelines(
  activeGuidelineIds: string[],
  differentials: CoughScoredDisease[],
): {
  applied: { guidelineId: string; diseaseGuidelines: CoughDiseaseGuideline[]; customRules: CoughCustomRule[] }[];
} {
  const applied: { guidelineId: string; diseaseGuidelines: CoughDiseaseGuideline[]; customRules: CoughCustomRule[] }[] = [];

  const guidelinesToApply = activeGuidelineIds.length > 0
    ? COUGH_KNOWLEDGE.guidelines.filter(g => activeGuidelineIds.includes(g.id) && g.active)
    : COUGH_KNOWLEDGE.guidelines.filter(g => g.active).slice(0, 1);

  for (const guideline of guidelinesToApply) {
    const activeDiseaseIds = new Set(differentials.filter(d => d.score >= 0.3).map(d => d.diseaseId));
    const matchingGuidelines = guideline.diseaseGuidelines.filter(dg => activeDiseaseIds.has(dg.diseaseId));

    if (matchingGuidelines.length > 0) {
      applied.push({
        guidelineId: guideline.id,
        diseaseGuidelines: matchingGuidelines,
        customRules: guideline.customRules,
      });
    }
  }

  return { applied };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 14: WORKFLOW ENGINE — generate workflows for top diseases
// ─────────────────────────────────────────────────────────────────

export function generateCoughWorkflows(
  differentials: CoughScoredDisease[],
): {
  workflows: { diseaseId: string; steps: CoughWorkflowStep[]; requiresAdmission: boolean }[];
} {
  const workflows: { diseaseId: string; steps: CoughWorkflowStep[]; requiresAdmission: boolean }[] = [];

  for (const diff of differentials) {
    if (diff.score < 0.3) continue;

    const workflow = COUGH_KNOWLEDGE.workflows.find(w => w.diseaseId === diff.diseaseId);
    if (!workflow) continue;

    workflows.push({
      diseaseId: diff.diseaseId,
      steps: workflow.steps,
      requiresAdmission: workflow.requiresAdmission,
    });
  }

  return { workflows };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 15: MONITORING ENGINE — set up monitoring plans
// ─────────────────────────────────────────────────────────────────

export function setupCoughMonitoring(
  differentials: CoughScoredDisease[],
  severity: CoughSeverityClass,
): {
  plans: { diseaseId: string; parameters: CoughMonitoringParameter[]; frequency: string }[];
} {
  const plans: { diseaseId: string; parameters: CoughMonitoringParameter[]; frequency: string }[] = [];

  for (const diff of differentials) {
    if (diff.score < 0.3) continue;

    const monitoring = COUGH_KNOWLEDGE.monitoring.find(m => m.diseaseId === diff.diseaseId);
    if (!monitoring) continue;

    plans.push({
      diseaseId: diff.diseaseId,
      parameters: monitoring.parameters,
      frequency: monitoring.severityBasedFrequency[severity] ?? 'daily',
    });
  }

  return { plans };
}

// ─────────────────────────────────────────────────────────────────
// LAYER 18: HMIS ENGINE — fire event-driven actions
// ─────────────────────────────────────────────────────────────────

export function fireCoughHMISEvents(
  facts: FactObject[],
  differentials: CoughScoredDisease[],
  activePhenotypes: { id: string; label: string; score: number }[],
): {
  events: { event: CoughHMISEvent; triggeredBy: string }[];
} {
  const events: { event: CoughHMISEvent; triggeredBy: string }[] = [];
  const factValues = new Map<string, unknown>();
  for (const f of facts) {
    if (f.isActive && !f.isStale) factValues.set(f.attribute, f.value);
  }

  const activePhenotypeIds = new Set(activePhenotypes.map(p => p.id));

  const triggerMap: { trigger: string; check: () => boolean }[] = [
    {
      trigger: 'cough_with_hemoptysis',
      check: () => {
        const sputum = factValues.get('cough_sputum');
        return sputum === 'blood_streaked' || sputum === 'frank_blood';
      },
    },
    {
      trigger: 'tb_suspected',
      check: () => {
        const tbScore = differentials.find(d => d.diseaseId === 'tb')?.score ?? 0;
        return tbScore >= 0.3;
      },
    },
    {
      trigger: 'hypoxia_detected',
      check: () => factValues.get('hypoxia') === true || factValues.get('cough_dyspnea') === 'rest',
    },
    {
      trigger: 'pneumonia_diagnosis',
      check: () => {
        const capScore = differentials.find(d => d.diseaseId === 'cap')?.score ?? 0;
        return capScore >= 0.5;
      },
    },
    {
      trigger: 'tb_confirmed',
      check: () => {
        const tbScore = differentials.find(d => d.diseaseId === 'tb')?.score ?? 0;
        return tbScore >= 0.7;
      },
    },
    {
      trigger: 'asthma_diagnosis',
      check: () => {
        const asthmaScore = differentials.find(d => d.diseaseId === 'asthma')?.score ?? 0;
        return asthmaScore >= 0.5;
      },
    },
    {
      trigger: 'admission_required',
      check: () => {
        const topDiff = differentials[0];
        return topDiff != null && (topDiff.urgency === 'red' || topDiff.urgency === 'orange');
      },
    },
    {
      trigger: 'icu_required',
      check: () => {
        const topDiff = differentials[0];
        if (!topDiff) return false;
        return topDiff.urgency === 'red' || activePhenotypeIds.has('cough_barking') || activePhenotypeIds.has('cough_neonatal_feeding') || activePhenotypeIds.has('cough_immunocompromised');
      },
    },
  ];

  for (const hmisEvent of COUGH_KNOWLEDGE.hmisEvents) {
    const trigger = triggerMap.find(t => t.trigger === hmisEvent.trigger);
    if (trigger && trigger.check()) {
      events.push({ event: hmisEvent, triggeredBy: hmisEvent.trigger });
    }
  }

  return { events };
}

// ─────────────────────────────────────────────────────────────────
// SUMMARY GENERATOR
// ─────────────────────────────────────────────────────────────────

function determineOverallUrgency(
  differentials: CoughScoredDisease[],
  activePhenotypes: { id: string; label: string; score: number; urgency: CoughUrgency }[],
): CoughUrgency {
  const urgencyOrder: Record<CoughUrgency, number> = { red: 4, orange: 3, yellow: 2, green: 1 };

  let maxUrgency: CoughUrgency = 'green';
  for (const phen of activePhenotypes) {
    if (urgencyOrder[phen.urgency] > urgencyOrder[maxUrgency]) {
      maxUrgency = phen.urgency;
    }
  }
  for (const diff of differentials.slice(0, 3)) {
    if (urgencyOrder[diff.urgency] > urgencyOrder[maxUrgency]) {
      maxUrgency = diff.urgency;
    }
  }

  return maxUrgency;
}

function generateSummary(
  topDisease: CoughScoredDisease | null,
  activePhenotypes: { id: string; label: string; score: number }[],
  urgency: CoughUrgency,
): string {
  const phenLabels = activePhenotypes.slice(0, 2).map(p => p.label).join(', ');
  const prefix = urgency === 'red' ? 'EMERGENCY' : urgency === 'orange' ? 'Urgent' : 'Non-urgent';
  if (topDisease) {
    return `${prefix} — ${topDisease.diseaseName} (confidence ${Math.round(topDisease.score * 100)}%)${phenLabels ? `, ${phenLabels}` : ''}`;
  }
  return `${prefix} — Cough assessment in progress${phenLabels ? `, ${phenLabels}` : ''}`;
}

function generateEvidenceSummary(
  facts: FactObject[],
  activeMechanisms: { id: string; label: string; score: number }[],
  activePhenotypes: { id: string; label: string; score: number }[],
): string {
  const factCount = facts.filter(f => f.isActive && !f.isStale).length;
  const topMechanisms = activeMechanisms.slice(0, 2).map(m => m.label).join(', ');
  const topPhenotypes = activePhenotypes.slice(0, 2).map(p => p.label).join(', ');
  return `${factCount} facts collected. Mechanisms: ${topMechanisms || 'none identified'}. Phenotypes: ${topPhenotypes || 'none identified'}.`;
}

// ─────────────────────────────────────────────────────────────────
// HPI NARRATIVE GENERATION — clinical documentation from facts
// ─────────────────────────────────────────────────────────────────

function findFactValue(facts: FactObject[], attribute: string): unknown | undefined {
  const fact = facts.find(f => f.attribute === attribute && f.isActive && !f.isStale);
  return fact?.value;
}

function findFactDocPhrase(facts: FactObject[], questionAttr: string): string {
  const value = findFactValue(facts, questionAttr);
  if (value === undefined || value === null) return '';
  const valStr = String(value);
  const question = COUGH_KNOWLEDGE.questions.find(q => q.id === questionAttr);
  if (!question?.options) return valStr.replace(/_/g, ' ');
  const option = question.options.find(o => o.value === valStr);
  return option?.documentationPhrase || valStr.replace(/_/g, ' ');
}

function describeAgeGroup(context: CoughContextCondition): string {
  if (context.ageGroup === 'neonate') return 'newborn';
  if (context.ageGroup === 'infant') return 'infant';
  if (context.ageGroup === 'child') return 'child';
  if (context.ageGroup === 'adolescent') return 'adolescent';
  if (context.ageGroup === 'adult') return 'adult';
  if (context.ageGroup === 'older_adult') return 'elderly';
  return 'patient';
}

function describePatientContext(context: CoughContextCondition): string {
  const parts: string[] = [];
  parts.push(describeAgeGroup(context));
  if (context.sex === 'male') parts.push('male');
  else if (context.sex === 'female') { parts.push('female'); if (context.pregnant) parts.push('pregnant'); }
  if (context.hivPositive) parts.push('HIV-positive');
  if (context.diabetes) parts.push('diabetic');
  if (context.heartFailure) parts.push('with heart failure');
  if (context.copd) parts.push('with COPD');
  if (context.renalFailure) parts.push('with renal failure');
  if (context.liverDisease) parts.push('with liver disease');
  if (context.malnutrition) parts.push('malnourished');
  if (context.immunosuppressed) parts.push('immunosuppressed');
  if (context.cancerPatient) parts.push('with active malignancy');
  if (context.icuPatient) parts.push('in the ICU');
  if (context.ventilated) parts.push('ventilated');
  if (context.postoperative) parts.push('postoperative');
  if (context.cerebrovascularDisease) parts.push('with cerebrovascular disease');
  if (context.dementia) parts.push('with dementia');
  if (context.resourceLevel === 'low') parts.push('in a low-resource setting');
  if (context.resourceLevel === 'middle') parts.push('in a middle-resource setting');
  return parts.join(' ');
}

function describeDuration(behaviour: CoughContextBehaviour, facts: FactObject[]): string {
  const durVal = findFactValue(facts, 'cough_duration');
  if (durVal === '<3_days') return 'of recent onset';
  if (durVal === '3_days_to_3_weeks') return `of ${findFactDocPhrase(facts, 'cough_duration') || 'about one week\'s'} duration`;
  if (durVal === '3_to_8_weeks') return 'of several weeks\' duration';
  if (durVal === '>8_weeks') return 'of more than two months\' duration';
  if (behaviour.chronicCoughThreshold <= 5) return 'of a few days\' duration';
  if (behaviour.chronicCoughThreshold <= 14) return 'of more than two weeks\' duration';
  return '';
}

function describeCoughCharacter(facts: FactObject[]): string {
  const sputumVal = findFactValue(facts, 'cough_sputum');
  const timingVal = findFactValue(facts, 'cough_timing');
  const severityVal = findFactValue(facts, 'cough_severity');
  const charParts: string[] = [];
  if (sputumVal === 'none') charParts.push('dry');
  else if (sputumVal === 'mucoid' || sputumVal === 'purulent' || sputumVal === 'blood_streaked' || sputumVal === 'frank_blood') {
    const sputumPhrase = findFactDocPhrase(facts, 'cough_sputum');
    if (sputumPhrase) charParts.push(sputumPhrase);
    else charParts.push('productive');
  }
  if (timingVal === 'nocturnal') charParts.push('nocturnal');
  if (timingVal === 'morning') charParts.push('early morning');
  if (timingVal === 'after_meals') charParts.push('postprandial');
  if (timingVal === 'with_exercise') charParts.push('exercise-induced');
  if (timingVal === 'when_lying') charParts.push('positional');
  if (severityVal === 'severe') charParts.push('severe');
  if (charParts.length === 0) charParts.push('persistent');
  return charParts.join(', ');
}

function describeAssociatedSymptoms(facts: FactObject[]): string[] {
  const parts: string[] = [];
  const feverVal = findFactValue(facts, 'cough_fever');
  const dyspneaVal = findFactValue(facts, 'cough_dyspnea');
  const chestPainVal = findFactValue(facts, 'cough_chest_pain');
  const nightSweats = findFactValue(facts, 'cough_night_sweats');
  const weightLoss = findFactValue(facts, 'cough_weight_loss');
  const heartburn = findFactValue(facts, 'cough_heartburn');
  const nasalSymptoms = findFactValue(facts, 'cough_nasal_symptoms');
  const stridor = findFactValue(facts, 'cough_stridor');
  const feedingDiff = findFactValue(facts, 'cough_feeding_difficulty');

  if (feverVal === 'yes') parts.push('associated with fever');
  if (dyspneaVal === 'exertional') parts.push('with exertional dyspnea');
  if (dyspneaVal === 'rest') parts.push('with dyspnea at rest');
  if (chestPainVal === 'pleuritic') parts.push('with pleuritic chest pain');
  if (chestPainVal === 'dull') parts.push('with dull chest pain');
  if (nightSweats === true) parts.push('night sweats');
  if (weightLoss === true) parts.push('unintentional weight loss');
  if (heartburn === true) parts.push('heartburn');
  if (nasalSymptoms === true) parts.push('nasal congestion');
  if (stridor === true) parts.push('stridor');
  if (feedingDiff === true) parts.push('feeding difficulty');
  return parts;
}

function describeContextFactors(context: CoughContextCondition, facts: FactObject[]): string[] {
  const factors: string[] = [];
  const smokingVal = findFactValue(facts, 'cough_smoking');
  const aceInhibitor = findFactValue(facts, 'cough_ace_inhibitor');
  const tbContact = findFactValue(facts, 'cough_tb_contact');
  const hivStatus = findFactValue(facts, 'cough_hiv_status');
  const coughDuration = findFactValue(facts, 'cough_duration');
  const sputumVal = findFactValue(facts, 'cough_sputum');
  const heartburnVal = findFactValue(facts, 'cough_heartburn');
  const chestPainVal = findFactValue(facts, 'cough_chest_pain');

  const longCough = coughDuration === '3_to_8_weeks' || coughDuration === '>8_weeks';
  const hasSputum = sputumVal === 'purulent' || sputumVal === 'mucoid' || sputumVal === 'blood_streaked' || sputumVal === 'frank_blood';
  const hemoptysisPresent = sputumVal === 'blood_streaked' || sputumVal === 'frank_blood';
  const feverPresent = findFactValue(facts, 'cough_fever') === 'yes';
  const nightSweats = findFactValue(facts, 'cough_night_sweats') === true;
  const weightLoss = findFactValue(facts, 'cough_weight_loss') === true;
  const dyspneaPresent = findFactValue(facts, 'cough_dyspnea') === 'exertional' || findFactValue(facts, 'cough_dyspnea') === 'rest';

  if (longCough && feverPresent) factors.push('The chronicity with fever raises concern for tuberculosis');
  if (longCough && nightSweats) factors.push('night sweats suggest possible TB or lymphoma');
  if (longCough && weightLoss) factors.push('unexplained weight loss suggests possible chronic infection or malignancy');
  if (longCough && hemoptysisPresent) factors.push('hemoptysis in the setting of chronic cough requires TB and malignancy evaluation');
  if (hasSputum && feverPresent) factors.push('productive cough with fever suggests an infectious process');
  if (dyspneaPresent && chestPainVal === 'pleuritic') factors.push('dyspnea with pleuritic chest pain raises concern for pulmonary embolism');
  if (dyspneaPresent && heartburnVal === true) factors.push('dyspnea with GERD symptoms suggests possible asthma or reflux-related cough');
  if (smokingVal === 'current') factors.push('current smoker');
  if (smokingVal === 'ex') factors.push('ex-smoker');
  if (aceInhibitor === true) factors.push('on an ACE inhibitor');
  if (tbContact === true) factors.push('known TB contact');
  if (hivStatus === 'positive' || context.hivPositive) factors.push('HIV-positive');
  if (context.immunosuppressed) factors.push('immunosuppressed');
  if (context.cancerPatient) factors.push('with active malignancy');
  if (context.pregnant) factors.push('pregnant');
  if (context.icuPatient) factors.push('in intensive care');
  return factors;
}

function describeExamFindings(facts: FactObject[]): string[] {
  const findings: string[] = [];
  const examAttrMap: Record<string, Record<string, string>> = {
    exam_auscultation: {
      crackles_basal: 'basal crackles on auscultation',
      crackles_focal: 'focal crackles on auscultation',
      wheeze_expiratory: 'expiratory wheeze',
      bronchial_breathing: 'bronchial breath sounds',
      reduced_breath_sounds: 'reduced breath sounds',
      pleural_rub: 'pleural rub',
    },
    exam_inspection: {
      cyanosis: 'cyanosed',
      clubbing: 'clubbing of the digits',
      accessory_muscle_use: 'using accessory muscles',
      barrel_chest: 'barrel-shaped chest',
      pursed_lip_breathing: 'pursed-lip breathing',
    },
    exam_vitals: {
      tachypnea: 'tachypnoeic',
      hypoxia: 'hypoxic',
      fever_recorded: 'febrile',
      tachycardia: 'tachycardic',
    },
    exam_ent: {
      nasal_congestion: 'nasal congestion',
      postnasal_drip_visible: 'visible postnasal drip',
      pharyngeal_erythema: 'pharyngeal erythema',
      cervical_lymphadenopathy: 'cervical lymphadenopathy',
    },
    exam_cardiac: {
      elevated_jvp: 'elevated JVP',
      pedal_edema: 'pedal edema',
      gallop_rhythm: 'S3 gallop',
      mid_diastolic_murmur: 'mid-diastolic murmur',
    },
  };
  for (const attrMap of Object.values(examAttrMap)) {
    for (const [attr, phrase] of Object.entries(attrMap)) {
      const val = findFactValue(facts, attr);
      if (val === true) { findings.push(phrase); break; }
    }
  }
  return findings;
}

function buildConclusion(
  topEtiologies: { id: string; name: string; score: number; mechanism: string }[],
  activePhenotypes: { id: string; label: string; score: number; urgency: CoughUrgency }[],
  differentials: CoughScoredDisease[],
  context: CoughContextCondition,
  facts: FactObject[],
): string {
  const topPhen = activePhenotypes.slice(0, 2).map(p => p.label).join(' and ');
  const topDiffNames = differentials.slice(0, 3).map(d => d.diseaseName).join(', ');

  if (topDiffNames) {
    let conclusion = `The presentation is most consistent with ${topDiffNames}.`;
    if (topPhen) conclusion += ` Clinical phenotype: ${topPhen}.`;
    return conclusion;
  }
  if (topPhen) return `Clinical picture consistent with ${topPhen}. Further evaluation is ongoing.`;
  return 'The etiology of the cough is not yet clear and requires further investigation.';
}

export function generateCoughHPINarrative(
  facts: FactObject[],
  patientContext: CoughContextCondition,
  behaviour: CoughContextBehaviour,
  activeMechanisms: { id: string; label: string; score: number }[],
  activePhenotypes: { id: string; label: string; score: number; urgency: CoughUrgency }[],
  topEtiologies: { id: string; name: string; score: number; mechanism: string }[],
  differentials: CoughScoredDisease[],
): CoughHPIOutput {
  const components: CoughHPIComponent[] = [];

  // 1. Presentation — patient description and chief complaint
  const patientDesc = describePatientContext(patientContext);
  const duration = describeDuration(behaviour, facts);
  const character = describeCoughCharacter(facts);
  const presentationPhrase = character
    ? `${patientDesc} presents with a ${character} cough${duration ? ` ${duration}` : ''}.`
    : `${patientDesc} presents with a cough${duration ? ` ${duration}` : ''}.`;
  components.push({ category: 'presentation', content: presentationPhrase });

  // 2. Onset and duration detail
  const durVal = findFactValue(facts, 'cough_duration');
  if (typeof durVal === 'string') {
    const severityPhrase = describeCoughCharacter(facts);
    const durationDetail = `The cough is ${severityPhrase} in quality${duration ? ` and ${duration}` : ''}.`;
    components.push({ category: 'onset', content: durationDetail });
  }

  // 3. Sputum character
  const sputumVal = findFactValue(facts, 'cough_sputum');
  if (sputumVal && sputumVal !== 'none') {
    const sputumPhrase = findFactDocPhrase(facts, 'cough_sputum');
    if (sputumPhrase) {
      components.push({ category: 'sputum', content: `The patient is ${sputumPhrase}.` });
    }
  }

  // 4. Timing
  const timingVal = findFactValue(facts, 'cough_timing');
  if (typeof timingVal === 'string') {
    const timingPhrase = findFactDocPhrase(facts, 'cough_timing');
    if (timingPhrase) {
      components.push({ category: 'timing', content: `The cough is ${timingPhrase}.` });
    }
  }

  // 5. Severity
  const severityVal = findFactValue(facts, 'cough_severity');
  if (typeof severityVal === 'string') {
    const sevPhrase = findFactDocPhrase(facts, 'cough_severity');
    if (sevPhrase) {
      components.push({ category: 'severity', content: `Severity: ${sevPhrase}.` });
    }
  }

  // 6. Associated symptoms
  const associatedList = describeAssociatedSymptoms(facts);
  if (associatedList.length > 0) {
    const associatedText = associatedList.length <= 3
      ? associatedList.join(', ')
      : associatedList.slice(0, 3).join(', ') + ', and ' + associatedList.slice(3).join(', ');
    const capText = associatedText.charAt(0).toUpperCase() + associatedText.slice(1);
    components.push({ category: 'associated', content: `${capText}.` });
  }

  // 7. Context factors and modifiers
  const contextFactors = describeContextFactors(patientContext, facts);
  for (const factor of contextFactors) {
    components.push({ category: 'context', content: factor[0].toUpperCase() + factor.slice(1) + '.' });
  }

  // 8. Examination findings
  const examFindings = describeExamFindings(facts);
  if (examFindings.length > 0) {
    components.push({ category: 'exam', content: `Examination reveals: ${examFindings.join('; ')}.` });
  }

  // 9. Clinical impression / conclusion
  const conclusion = buildConclusion(topEtiologies, activePhenotypes, differentials, patientContext, facts);
  components.push({ category: 'impression', content: conclusion });

  // Build narrative — coherent flowing paragraphs
  const narrativeParts: string[] = [];

  // Paragraph 1: Presentation
  narrativeParts.push(components.find(c => c.category === 'presentation')?.content ?? presentationPhrase);

  // Paragraph 2: Cough character, timing, severity, sputum detail
  const detailComponents = components.filter(c =>
    ['onset', 'character', 'timing', 'severity', 'sputum'].includes(c.category)
  );
  if (detailComponents.length > 0) {
    narrativeParts.push(detailComponents.map(c => c.content).join(' '));
  }

  // Paragraph 3: Associated symptoms + context
  const associateComponents = components.filter(c =>
    ['associated', 'context', 'modifiers'].includes(c.category)
  );
  if (associateComponents.length > 0) {
    narrativeParts.push(associateComponents.map(c => c.content).join(' '));
  }

  // Paragraph 4: Examination
  const examComp = components.find(c => c.category === 'exam');
  if (examComp) narrativeParts.push(examComp.content);

  // Paragraph 5: Impression
  const impressionComp = components.find(c => c.category === 'impression');
  if (impressionComp) narrativeParts.push(impressionComp.content);

  const hpiNarrative = narrativeParts.join('\n\n');

  // Full clinical note (structured)
  const fullNoteParts: string[] = [
    '=== CLINICAL NOTE ===',
    '',
    '**Chief Complaint:** Cough',
    '',
    `**History of Present Illness:**`,
    hpiNarrative,
  ];
  const mechanismsStr = activeMechanisms.slice(0, 3).map(m => m.label).join(', ');
  if (mechanismsStr) {
    fullNoteParts.push('');
    fullNoteParts.push(`**Active Mechanisms:** ${mechanismsStr}.`);
  }
  const topPhenStr = activePhenotypes.slice(0, 3).map(p => p.label).join(', ');
  if (topPhenStr) {
    fullNoteParts.push(`**Clinical Phenotypes:** ${topPhenStr}.`);
  }
  const topDiffStr = differentials.slice(0, 3).map(d => `${d.diseaseName} (${Math.round(d.score * 100)}%)`).join(', ');
  if (topDiffStr) {
    fullNoteParts.push(`**Top Differentials:** ${topDiffStr}.`);
  }
  fullNoteParts.push('');
  fullNoteParts.push('**Assessment and Plan:** See management plan for details.');
  fullNoteParts.push('');

  const clinicalNote = fullNoteParts.join('\n');

  // Patient summary for handoff
  const urgency = differentials[0]?.urgency ?? 'green';
  const topDiff = differentials[0]?.diseaseName ?? 'undifferentiated cough';
  const patientSummary = `${patientDesc}, ${character || 'persistent'} cough${duration ? ` ${duration}` : ''}. ` +
    `Key concerns: ${topDiff}. Urgency: ${urgency}.`;

  return { hpiNarrative, hpiStructured: components, clinicalNote, patientSummary };
}

// ─────────────────────────────────────────────────────────────────
// MAIN PIPELINE — process cough through all 18 layers
// ─────────────────────────────────────────────────────────────────

export function processCoughEngine(input: CoughEngineInput): CoughEngineOutput {
  const { facts, patientContext, patientAgeGroup, answeredQuestionIds, completedExamIds, collectedInvestigationIds, activeGuidelineIds } = input;

  // Layer 2: Context
  const { activeRules, behaviour } = resolveCoughContext(patientContext);

  // Layer 2b: Context-Aware Disease Resolution (multi-context architecture)
  const patientProfile = buildPatientContextProfile(patientContext, facts);
  const activeContexts = determineActiveContexts(patientProfile);
  const resolvedDiseaseMap = resolveAllContextDiseases(ALL_DISEASE_PROFILES, activeContexts, patientAgeGroup);
  const resolvedContextIds = activeContexts;

  // Layer 3: Etiology
  const { scores: etiologyScores, topEtiologies } = scoreCoughEtiologies(facts, behaviour);

  // Layer 4: Mechanism
  const { scores: mechanismScores, active: activeMechanisms } = scoreCoughMechanisms(facts, behaviour);

  // Layer 5: Phenotype
  const { scores: phenotypeScores, active: activePhenotypes } = recognizeCoughPhenotypes(facts, activeMechanisms);

  // Layer 6: Questions (with context-adaptive text resolution)
  const { nextBestQuestions: rawNext, urgentQuestions: rawUrgent, allVisibleQuestions: rawAll } = selectCoughQuestions(
    facts, activePhenotypes, activeMechanisms, answeredQuestionIds, behaviour, patientAgeGroup,
  );
  const adaptQ = (q: CoughQuestion): CoughQuestion => {
    const adapted = resolveAdaptedQuestionText(q, patientAgeGroup);
    return { ...q, text: adapted.text, options: adapted.options as CoughQuestion['options'] };
  };
  const nextBestQuestions = rawNext.map(adaptQ);
  const urgentQuestions = rawUrgent.map(adaptQ);
  const allVisibleQuestions = rawAll.map(adaptQ);

  // Layer 7: Exam
  const suggestedExamCards = suggestCoughExams(facts, activePhenotypes, behaviour, patientAgeGroup, completedExamIds);

  // Layer 8: Differentials — scored then enhanced with context-aware overrides
  let { differentials, topDisease, urgency: diffUrgency } = scoreCoughDifferentials(facts, activePhenotypes, activeMechanisms, behaviour, patientAgeGroup);
  differentials = differentials.map(d => applyContextOverridesToDifferential(d, resolvedDiseaseMap.get(d.diseaseId)));
  differentials.sort((a, b) => b.score - a.score);
  topDisease = differentials[0] ?? null;

  // Layer 9: Investigations
  const { plan: investigationPlan, urgentInvestigations } = determineCoughInvestigations(differentials);

  // Layer 10: Results
  const { interpretations } = interpretCoughResults(collectedInvestigationIds);

  // Layer 11: Management
  const { plans: managementPlan } = generateCoughManagement(differentials);

  // Layer 12: Guidelines
  const { applied: activeGuidelinesApplied } = applyCoughGuidelines(activeGuidelineIds, differentials);

  // Layer 14: Workflow
  const { workflows } = generateCoughWorkflows(differentials);

  // Layer 15: Monitoring
  const { plans: monitoringPlan } = setupCoughMonitoring(differentials, 'moderate');

  // Layer 18: HMIS
  const { events: hmisEvents } = fireCoughHMISEvents(facts, differentials, activePhenotypes);

  // HPI Narrative
  const { hpiNarrative, clinicalNote, patientSummary } = generateCoughHPINarrative(
    facts, patientContext, behaviour, activeMechanisms, activePhenotypes, topEtiologies, differentials,
  );

  // Summary
  const urgency = determineOverallUrgency(differentials, activePhenotypes);
  const summary = generateSummary(topDisease, activePhenotypes, urgency);
  const evidenceSummary = generateEvidenceSummary(facts, activeMechanisms, activePhenotypes);

  return {
    identity: COUGH_KNOWLEDGE.identity,
    activeContextRules: activeRules,
    contextBehaviour: behaviour,
    resolvedContexts: activeContexts,
    diseaseProfilesResolved: resolvedDiseaseMap.size,
    etiologyScores,
    topEtiologies,
    mechanismScores,
    activeMechanisms,
    phenotypeScores,
    activePhenotypes,
    nextBestQuestions,
    urgentQuestions,
    allVisibleQuestions,
    questionCount: allVisibleQuestions.length,
    suggestedExamCards,
    examFindingsCollected: facts.filter(f => completedExamIds.includes(f.attribute)).length,
    differentials,
    topDifferential: topDisease,
    differentialUrgency: diffUrgency,
    investigationPlan,
    urgentInvestigations,
    resultInterpretations: interpretations,
    managementPlan,
    activeGuidelinesApplied,
    workflows,
    monitoringPlan,
    hmisEvents,
    hpiNarrative,
    clinicalNote,
    patientSummary,
    urgency,
    summary,
    evidenceSummary,
  };
}
