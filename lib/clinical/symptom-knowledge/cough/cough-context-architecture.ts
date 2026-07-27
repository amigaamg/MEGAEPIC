// ═══════════════════════════════════════════════════════════════
// AMEXAN UCOS — COUGH DISEASE CONTEXT ARCHITECTURE
// Every disease exists as a Master + Context Overrides.
// No disease contains patient data. All context is applied
// dynamically by the reasoning engine at runtime.
// ═══════════════════════════════════════════════════════════════

import type { AgeGroup } from '../../constitutional/registration-engine/types';
import type { CoughUrgency, CoughSeverityClass, CoughAgeGroup } from './cough-knowledge';

// ─────────────────────────────────────────────────────────────────
// CONTEXT DIMENSIONS — every disease adapts across these axes
// ─────────────────────────────────────────────────────────────────

export type UniversalContext =
  | 'adult_immunocompetent'
  | 'pediatric_infant'       // 0-12 months
  | 'pediatric_toddler'      // 1-3 years
  | 'pediatric_preschool'    // 3-5 years
  | 'pediatric_school'       // 5-12 years
  | 'pediatric_adolescent'   // 12-18 years
  | 'pregnancy'
  | 'postpartum'
  | 'breastfeeding'
  | 'hiv_cd4_high'           // CD4 > 350
  | 'hiv_cd4_low'            // CD4 100-350
  | 'hiv_cd4_very_low'       // CD4 < 100
  | 'hiv_art_naive'
  | 'hiv_iris_risk'          // Recently started ART
  | 'elderly_>65'
  | 'elderly_frail'
  | 'icu_ventilated'
  | 'icu_non_ventilated'
  | 'postoperative'
  | 'renal_failure'
  | 'liver_disease'
  | 'diabetes'
  | 'malnutrition'
  | 'transplant'
  | 'oncology_active'
  | 'oncology_chemo'
  | 'oncology_radiation'
  | 'autoimmune_steroids'
  | 'copd_known'
  | 'asthma_known'
  | 'heart_failure_known'
  | 'cerebrovascular_disease'
  | 'dementia'
  | 'endemic_tb_high'
  | 'endemic_fungal'
  | 'tb_contact_household'
  | 'healthcare_worker'
  | 'resource_low'            // Limited diagnostics
  | 'resource_middle'         // Some diagnostics
  | 'resource_high'           // Full diagnostics
  | 'bronchiectasis'
  | 'cystic_fibrosis';

export type ContextDimension =
  | 'question_additions'
  | 'question_removals'
  | 'question_adaptations'     // Same question, different wording
  | 'question_priority_overrides'
  | 'exam_additions'
  | 'exam_removals'
  | 'exam_priority_overrides'
  | 'phenotype_activations'    // Extra phenotypes to consider
  | 'phenotype_deactivations'  // Phenotypes to suppress
  | 'mechanism_weight_adjustments'
  | 'investigation_additions'
  | 'investigation_removals'
  | 'investigation_priority_changes'
  | 'interpretation_modifiers' // How to read results differently
  | 'treatment_additions'
  | 'treatment_removals'
  | 'treatment_dose_changes'
  | 'treatment_contraindications'
  | 'treatment_interactions'
  | 'monitoring_additions'
  | 'monitoring_frequency_changes'
  | 'disposition_changes'
  | 'differential_additions'    // Extra DDx to consider in this context
  | 'differential_removals'     // DDx to deprioritize
  | 'differential_weight_changes'
  | 'guideline_activations'
  | 'activation_threshold_modifier'
  | 'urgency_modifier'
  | 'hide_rules'
  | 'show_rules'
  | 'documentation_modifiers'
  | 'hmis_event_additions';

// ─────────────────────────────────────────────────────────────────
// CONTEXT OVERRIDE — what changes for a disease in a context
// ─────────────────────────────────────────────────────────────────

export interface ContextOverride {
  context: UniversalContext;
  /** How much this context applies (0-1). Comorbidities stack. */
  applicabilityWeight: number;

  // Questions
  questionAdditions?: string[];
  questionRemovals?: string[];
  questionPriorityOverrides?: Record<string, 'critical' | 'essential' | 'helpful' | 'optional' | 'never_ask'>;

  // Exam
  examAdditions?: string[];
  examRemovals?: string[];
  examPriorityOverrides?: Record<string, 'critical' | 'essential' | 'helpful' | 'optional' | 'never_ask'>;

  // Phenotypes
  phenotypeActivations?: string[];
  phenotypeDeactivations?: string[];

  // Mechanisms (weight adjustments: key = mechanism_id, value = delta -0.5 to +0.5)
  mechanismWeightDeltas?: Record<string, number>;

  // Investigations
  investigationAdditions?: string[];
  investigationRemovals?: string[];
  investigationPriorityChanges?: Record<string, 'initial_required' | 'initial_suggested' | 'confirmatory' | 'monitoring'>;
  cxrInterpretationModifiers?: string[];       // How CXR reading changes
  ctInterpretationModifiers?: string[];
  labInterpretationModifiers?: string[];

  // Treatment
  treatmentAdditions?: { drugId: string; line: number; notes: string }[];
  treatmentRemovals?: string[];
  doseAdjustments?: Record<string, string>;    // drugId -> dose string
  treatmentDoseChanges?: Record<string, string>; // drugId/'all' -> dose guideline
  treatmentLines?: { line: number; regimen: string; medications: string[]; duration: string }[];
  contraindications?: string[];
  interactions?: string[];

  // Monitoring
  monitoringAdditions?: string[];
  monitoringFrequencyChanges?: Record<string, string>;

  // Disposition
  dispositionChanges?: {
    admissionRequired?: boolean;
    icuRequired?: boolean;
    specialtyReferral?: string;
    followUpTiming?: string;
  };

  // Differentials
  differentialAdditions?: { diseaseId: string; weight: number }[];
  differentialRemovals?: string[];
  differentialWeightDeltas?: Record<string, number>;

  // Activation
  activationThresholdDelta?: number;          // -0.2 to +0.2
  urgencyOverride?: CoughUrgency;

  // Visibility
  hideRules?: string[];
  showRules?: string[];

  // Guidelines
  guidelineActivations?: string[];

  // Documentation
  documentationModifiers?: string[];

  // HMIS
  hmisEventAdditions?: string[];

  // Disease-specific notes for this context
  clinicalNotes?: string;
}

// ─────────────────────────────────────────────────────────────────
// CONTEXT-AWARE DISEASE — master + overrides
// ─────────────────────────────────────────────────────────────────

export interface ContextAwareDiseaseProfile {
  /** Disease identifier (matches disease-registry) */
  diseaseId: string;
  /** Display name */
  diseaseName: string;

  /** Universal properties — true for ALL contexts */
  master: {
    organism: string;
    transmission: string;
    corePathophysiology: string;
    naturalHistory: string;
    universalComplications: string[];
    universalMechanisms: string[];
    universalPhenotypes: string[];
  };

  /** Baseline context (adult immunocompetent in high-resource) */
  baseline: DiseaseBaselineProfile;

  /** Context overrides — only what changes */
  contextOverrides: ContextOverride[];

  /** Age group mappings — which age groups map to which context */
  ageGroupToContext: Partial<Record<CoughAgeGroup, UniversalContext>>;

  /** Which contexts this disease is relevant in (empty = all) */
  relevantContexts: UniversalContext[];

  /** Contexts where this disease should never appear */
  excludedContexts: UniversalContext[];
}

export interface DiseaseBaselineProfile {
  epidemiology: string;
  symptomOnset: string;
  typicalPresentation: string;
  discriminatingFeatures: string[];
  basePrevalence: number;
  agePrevalenceModifiers: Partial<Record<CoughAgeGroup, number>>;
  typicalPhenotypes: string[];
  commonMechanisms: string[];
  requiredQuestions: string[];
  requiredExams: string[];
  initialInvestigations: string[];
  confirmatoryInvestigations: string[];
  treatmentLines: { line: number; regimen: string; medications: string[]; duration: string }[];
  supportiveCare: string[];
  disposition: { admissionRequired: boolean; icuRequired: boolean; specialty: string; followUp: string };
  monitoring: { parameter: string; frequency: string; target: string }[];
  urgency: CoughUrgency;
  activationThreshold: number;
  guidelines: string[];
  hmisEvents: string[];
}

// ─────────────────────────────────────────────────────────────────
// RESOLVED CONTEXT DISEASE — after applying context overrides
// ─────────────────────────────────────────────────────────────────

export interface ResolvedContextDisease {
  diseaseId: string;
  diseaseName: string;
  profile: ContextAwareDiseaseProfile;
  activeContexts: UniversalContext[];
  resolvedUrgency: CoughUrgency;
  resolvedActivationThreshold: number;
  resolvedQuestions: string[];
  resolvedExams: string[];
  resolvedPhenotypes: string[];
  resolvedMechanisms: string[];
  resolvedInvestigations: { initialRequired: string[]; initialSuggested: string[]; confirmatory: string[]; monitoring: string[] };
  resolvedTreatment: { drugId: string; line: number; dose: string; notes: string }[];
  resolvedContraindications: string[];
  resolvedMonitoring: { parameter: string; frequency: string; target: string }[];
  resolvedDisposition: { admissionRequired: boolean; icuRequired: boolean; specialty: string; followUp: string };
  resolvedGuidelines: string[];
  resolvedDifferentials: { diseaseId: string; weight: number }[];
  resolvedHideRules: string[];
  resolvedShowRules: string[];
  resolvedHMISEvents: string[];
  overlapScore: number;
}

// ─────────────────────────────────────────────────────────────────
// CONTEXT RESOLVER — applies overrides to produce resolved disease
// ─────────────────────────────────────────────────────────────────

export function resolveContextDisease(
  profile: ContextAwareDiseaseProfile,
  activeContexts: UniversalContext[],
  ageGroup: string,
): ResolvedContextDisease {
  const matchingOverrides = profile.contextOverrides.filter(co =>
    activeContexts.includes(co.context),
  );

  // Start from baseline
  const resolved: ResolvedContextDisease = {
    diseaseId: profile.diseaseId,
    diseaseName: profile.diseaseName,
    profile,
    activeContexts,
    resolvedUrgency: profile.baseline.urgency,
    resolvedActivationThreshold: profile.baseline.activationThreshold,
    resolvedQuestions: [...profile.baseline.requiredQuestions],
    resolvedExams: [...profile.baseline.requiredExams],
    resolvedPhenotypes: [...profile.baseline.typicalPhenotypes],
    resolvedMechanisms: [...profile.baseline.commonMechanisms],
    resolvedInvestigations: {
      initialRequired: profile.baseline.initialInvestigations.filter(i => {
        const conf = profile.baseline.confirmatoryInvestigations;
        return !conf.includes(i);
      }),
      initialSuggested: [],
      confirmatory: [...profile.baseline.confirmatoryInvestigations],
      monitoring: [],
    },
    resolvedTreatment: profile.baseline.treatmentLines.flatMap(tl =>
      tl.medications.map(m => ({
        drugId: m,
        line: tl.line,
        dose: tl.regimen.includes(m) ? tl.regimen : 'per_guideline',
        notes: tl.duration,
      })),
    ),
    resolvedContraindications: [],
    resolvedMonitoring: profile.baseline.monitoring.map(m => ({
      parameter: m.parameter,
      frequency: m.frequency,
      target: m.target,
    })),
    resolvedDisposition: {
      admissionRequired: profile.baseline.disposition.admissionRequired,
      icuRequired: profile.baseline.disposition.icuRequired,
      specialty: profile.baseline.disposition.specialty,
      followUp: profile.baseline.disposition.followUp,
    },
    resolvedGuidelines: [...profile.baseline.guidelines],
    resolvedDifferentials: [],
    resolvedHideRules: [],
    resolvedShowRules: [],
    resolvedHMISEvents: [...profile.baseline.hmisEvents],
    overlapScore: profile.baseline.basePrevalence,
  };

  // Apply each matching override
  for (const override of matchingOverrides) {
    const weight = override.applicabilityWeight;

    // Questions
    if (override.questionAdditions) resolved.resolvedQuestions.push(...override.questionAdditions);
    if (override.questionRemovals) {
      resolved.resolvedQuestions = resolved.resolvedQuestions.filter(q => !override.questionRemovals!.includes(q));
    }

    // Exam
    if (override.examAdditions) resolved.resolvedExams.push(...override.examAdditions);
    if (override.examRemovals) {
      resolved.resolvedExams = resolved.resolvedExams.filter(e => !override.examRemovals!.includes(e));
    }

    // Phenotypes
    if (override.phenotypeActivations) resolved.resolvedPhenotypes.push(...override.phenotypeActivations);
    if (override.phenotypeDeactivations) {
      resolved.resolvedPhenotypes = resolved.resolvedPhenotypes.filter(p => !override.phenotypeDeactivations!.includes(p));
    }

    // Mechanisms (adjust weights via deltas)
    if (override.mechanismWeightDeltas) {
      for (const [mech, delta] of Object.entries(override.mechanismWeightDeltas)) {
        if (!resolved.resolvedMechanisms.includes(mech)) {
          resolved.resolvedMechanisms.push(mech);
        }
      }
    }

    // Investigations
    if (override.investigationAdditions) {
      for (const inv of override.investigationAdditions) {
        resolved.resolvedInvestigations.initialSuggested.push(inv);
      }
    }
    if (override.investigationRemovals) {
      resolved.resolvedInvestigations.initialRequired = resolved.resolvedInvestigations.initialRequired.filter(i => !override.investigationRemovals!.includes(i));
      resolved.resolvedInvestigations.initialSuggested = resolved.resolvedInvestigations.initialSuggested.filter(i => !override.investigationRemovals!.includes(i));
      resolved.resolvedInvestigations.confirmatory = resolved.resolvedInvestigations.confirmatory.filter(i => !override.investigationRemovals!.includes(i));
    }

    // Treatment
    if (override.treatmentAdditions) {
      for (const ta of override.treatmentAdditions) {
        resolved.resolvedTreatment.push({ drugId: ta.drugId, line: ta.line, dose: 'per_guideline', notes: ta.notes });
      }
    }
    if (override.treatmentRemovals) {
      resolved.resolvedTreatment = resolved.resolvedTreatment.filter(t => !override.treatmentRemovals!.includes(t.drugId));
    }
    if (override.contraindications) {
      resolved.resolvedContraindications.push(...override.contraindications);
    }

    // Monitoring
    if (override.monitoringAdditions) {
      for (const m of override.monitoringAdditions) {
        resolved.resolvedMonitoring.push({ parameter: m, frequency: 'per_protocol', target: 'per_protocol' });
      }
    }
    if (override.monitoringFrequencyChanges) {
      for (const [param, freq] of Object.entries(override.monitoringFrequencyChanges)) {
        const existing = resolved.resolvedMonitoring.find(m => m.parameter === param);
        if (existing) existing.frequency = freq;
      }
    }

    // Disposition
    if (override.dispositionChanges) {
      if (override.dispositionChanges.admissionRequired !== undefined) resolved.resolvedDisposition.admissionRequired = override.dispositionChanges.admissionRequired;
      if (override.dispositionChanges.icuRequired !== undefined) resolved.resolvedDisposition.icuRequired = override.dispositionChanges.icuRequired;
      if (override.dispositionChanges.specialtyReferral) resolved.resolvedDisposition.specialty = override.dispositionChanges.specialtyReferral;
      if (override.dispositionChanges.followUpTiming) resolved.resolvedDisposition.followUp = override.dispositionChanges.followUpTiming;
    }

    // Activation / Urgency
    if (override.activationThresholdDelta !== undefined) {
      resolved.resolvedActivationThreshold = Math.max(0.05, Math.min(0.95, resolved.resolvedActivationThreshold + override.activationThresholdDelta));
    }
    if (override.urgencyOverride) {
      const urgencyOrder: Record<CoughUrgency, number> = { green: 0, yellow: 1, orange: 2, red: 3 };
      if (urgencyOrder[override.urgencyOverride] > urgencyOrder[resolved.resolvedUrgency]) {
        resolved.resolvedUrgency = override.urgencyOverride;
      }
    }

    // Visibility
    if (override.hideRules) resolved.resolvedHideRules.push(...override.hideRules);
    if (override.showRules) resolved.resolvedShowRules.push(...override.showRules);

    // Guidelines
    if (override.guidelineActivations) resolved.resolvedGuidelines.push(...override.guidelineActivations);

    // Differentials
    if (override.differentialAdditions) {
      for (const da of override.differentialAdditions) {
        resolved.resolvedDifferentials.push(da);
      }
    }
    if (override.differentialRemovals) {
      resolved.resolvedDifferentials = resolved.resolvedDifferentials.filter(d => !override.differentialRemovals!.includes(d.diseaseId));
    }
    if (override.differentialWeightDeltas) {
      for (const [did, delta] of Object.entries(override.differentialWeightDeltas)) {
        const existing = resolved.resolvedDifferentials.find(d => d.diseaseId === did);
        if (existing) existing.weight += delta;
      }
    }

    // HMIS
    if (override.hmisEventAdditions) resolved.resolvedHMISEvents.push(...override.hmisEventAdditions);
  }

  // Deduplicate
  resolved.resolvedQuestions = [...new Set(resolved.resolvedQuestions)];
  resolved.resolvedExams = [...new Set(resolved.resolvedExams)];
  resolved.resolvedPhenotypes = [...new Set(resolved.resolvedPhenotypes)];
  resolved.resolvedMechanisms = [...new Set(resolved.resolvedMechanisms)];
  resolved.resolvedGuidelines = [...new Set(resolved.resolvedGuidelines)];
  resolved.resolvedHMISEvents = [...new Set(resolved.resolvedHMISEvents)];

  return resolved;
}

// ─────────────────────────────────────────────────────────────────
// CONTEXT WEIGHT CALCULATOR — determine which contexts are active
// ─────────────────────────────────────────────────────────────────

export interface PatientContextProfile {
  ageGroup: string;
  pregnant: boolean;
  breastfeeding: boolean;
  postpartum: boolean;
  hivPositive: boolean;
  cd4Count: number | null;
  onArt: boolean;
  artDurationWeeks: number | null;
  ageYears: number | null;
  weightKg: number | null;
  copd: boolean;
  asthma: boolean;
  heartFailure: boolean;
  diabetes: boolean;
  renalFailure: boolean;
  liverDisease: boolean;
  malnutrition: boolean;
  transplant: boolean;
  onChemotherapy: boolean;
  onRadiation: boolean;
  onSteroids: boolean;
  icuPatient: boolean;
  ventilated: boolean;
  postoperative: boolean;
  cerebrovascularDisease: boolean;
  dementia: boolean;
  endemicTbHigh: boolean;
  endemicFungal: boolean;
  tbContactHousehold: boolean;
  healthcareWorker: boolean;
  resourceSetting: 'low' | 'middle' | 'high';
}

export function determineActiveContexts(patient: PatientContextProfile): UniversalContext[] {
  const contexts: UniversalContext[] = [];

  // Default
  contexts.push('adult_immunocompetent');

  // Pediatric
  if (patient.ageYears !== null) {
    if (patient.ageYears < 1) {
      const idx = contexts.indexOf('adult_immunocompetent');
      if (idx >= 0) contexts.splice(idx, 1);
      contexts.push('pediatric_infant');
    } else if (patient.ageYears < 3) {
      const idx = contexts.indexOf('adult_immunocompetent');
      if (idx >= 0) contexts.splice(idx, 1);
      contexts.push('pediatric_toddler');
    } else if (patient.ageYears < 5) {
      contexts.push('pediatric_preschool');
    } else if (patient.ageYears < 12) {
      contexts.push('pediatric_school');
    } else if (patient.ageYears < 18) {
      contexts.push('pediatric_adolescent');
    }
  }

  // Pregnancy / Postpartum
  if (patient.pregnant) contexts.push('pregnancy');
  if (patient.postpartum) contexts.push('postpartum');
  if (patient.breastfeeding) contexts.push('breastfeeding');

  // HIV
  if (patient.hivPositive) {
    if (patient.cd4Count !== null) {
      if (patient.cd4Count < 100) contexts.push('hiv_cd4_very_low');
      else if (patient.cd4Count < 350) contexts.push('hiv_cd4_low');
      else contexts.push('hiv_cd4_high');
    } else {
      contexts.push('hiv_cd4_low'); // assume low if unknown
    }
    if (!patient.onArt) contexts.push('hiv_art_naive');
    if (patient.artDurationWeeks !== null && patient.artDurationWeeks < 12) {
      contexts.push('hiv_iris_risk');
    }
  }

  // Elderly
  if (patient.ageYears !== null && patient.ageYears >= 65) {
    contexts.push('elderly_>65');
  }

  // ICU
  if (patient.icuPatient) {
    contexts.push(patient.ventilated ? 'icu_ventilated' : 'icu_non_ventilated');
  }

  // Comorbidities
  if (patient.postoperative) contexts.push('postoperative');
  if (patient.renalFailure) contexts.push('renal_failure');
  if (patient.liverDisease) contexts.push('liver_disease');
  if (patient.diabetes) contexts.push('diabetes');
  if (patient.malnutrition) contexts.push('malnutrition');
  if (patient.transplant) contexts.push('transplant');
  if (patient.onChemotherapy) contexts.push('oncology_chemo');
  if (patient.onRadiation) contexts.push('oncology_radiation');
  if (patient.onSteroids) contexts.push('autoimmune_steroids');
  if (patient.copd) contexts.push('copd_known');
  if (patient.asthma) contexts.push('asthma_known');
  if (patient.heartFailure) contexts.push('heart_failure_known');
  if (patient.cerebrovascularDisease) contexts.push('cerebrovascular_disease');
  if (patient.dementia) contexts.push('dementia');

  // Environmental
  if (patient.endemicTbHigh) contexts.push('endemic_tb_high');
  if (patient.endemicFungal) contexts.push('endemic_fungal');
  if (patient.tbContactHousehold) contexts.push('tb_contact_household');
  if (patient.healthcareWorker) contexts.push('healthcare_worker');

  // Resource
  if (patient.resourceSetting === 'low') contexts.push('resource_low');
  else if (patient.resourceSetting === 'middle') contexts.push('resource_middle');
  else contexts.push('resource_high');

  return [...new Set(contexts)];
}
