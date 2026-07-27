// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK IX–X
// CLINICAL REASONING ENGINE
// Operates on graphs, not medicine.
// Evidence scoring, activation rules, investigation readiness.
// FORBIDDEN SHORTCUT ENFORCER: Complaint→Disease is never allowed.
// ═══════════════════════════════════════════════════════════════

import type {
  DiseaseObject, DiseaseInvestigation, DiseaseActivation,
  InvestigationReadiness, DifferentialRanking, ReasoningEvidence,
  KnowledgeGraph, KnowledgeNode, KnowledgeRelationshipType,
} from './clinical-knowledge-constitution';
import { ACTIVATION_THRESHOLDS, SYMPTOM_DISEASE_REFERENCES } from './clinical-knowledge-constitution';
import { DISEASE_REGISTRY } from './disease-registry';
import { buildDiseaseKnowledgeGraph, findRelationshipsFrom, findNodesByType } from './knowledge-graph-engine';
import type { FactObject, MechanismActivation, PhenotypeActivation, ClinicalConfidence } from './hpi-constitution';

// ─────────────────────────────────────────────────────────────────
// FORBIDDEN SHORTCUT ENFORCER
// Never: Complaint → Disease
// Always: Facts → Mechanisms → Phenotypes → Diseases
// ─────────────────────────────────────────────────────────────────

export interface ShortcutViolation {
  type: 'complaint_to_disease' | 'symptom_to_diagnosis' | 'missing_mechanism' | 'missing_phenotype';
  source: string;
  target: string;
  missingLayers: string[];
  severity: 'error' | 'warning';
}

export function enforceReasoningChain(
  complaintId: string,
  targetDiseaseId: string,
  activeMechanisms: string[],
  activePhenotypes: string[],
): ShortcutViolation[] {
  const violations: ShortcutViolation[] = [];

  if (activeMechanisms.length === 0) {
    violations.push({
      type: 'missing_mechanism',
      source: complaintId,
      target: targetDiseaseId,
      missingLayers: ['mechanism'],
      severity: 'error',
    });
  }

  if (activePhenotypes.length === 0) {
    violations.push({
      type: 'missing_phenotype',
      source: complaintId,
      target: targetDiseaseId,
      missingLayers: ['phenotype'],
      severity: 'error',
    });
  }

  const directMapping = SYMPTOM_DISEASE_REFERENCES[complaintId];
  if (directMapping?.includes(targetDiseaseId) && activeMechanisms.length === 0) {
    violations.push({
      type: 'complaint_to_disease',
      source: complaintId,
      target: targetDiseaseId,
      missingLayers: ['mechanism', 'phenotype'],
      severity: 'error',
    });
  }

  return violations;
}

export function validateReasoningChain(
  facts: FactObject[],
  mechanisms: MechanismActivation[],
  phenotypes: PhenotypeActivation[],
  targetDiseaseId: string,
): { valid: boolean; violations: ShortcutViolation[] } {
  const violations: ShortcutViolation[] = [];

  if (facts.length === 0) {
    violations.push({ type: 'complaint_to_disease', source: 'facts', target: targetDiseaseId, missingLayers: ['fact'], severity: 'error' });
  }

  const activeMechs = mechanisms.filter(m => m.isActive);
  if (activeMechs.length === 0) {
    violations.push({ type: 'missing_mechanism', source: 'facts', target: targetDiseaseId, missingLayers: ['mechanism'], severity: 'error' });
  }

  const activePhenos = phenotypes.filter(p => p.isActive);
  if (activePhenos.length === 0) {
    violations.push({ type: 'missing_phenotype', source: 'mechanisms', target: targetDiseaseId, missingLayers: ['phenotype'], severity: 'error' });
  }

  return { valid: violations.length === 0, violations };
}

// ─────────────────────────────────────────────────────────────────
// EVIDENCE SCORING — diseases compete by explaining evidence
// ─────────────────────────────────────────────────────────────────

export function scoreDiseaseAgainstFacts(
  disease: DiseaseObject,
  facts: FactObject[],
  activeMechanisms: MechanismActivation[],
  activePhenotypes: PhenotypeActivation[],
): DiseaseActivation {
  const evidenceMatch: ReasoningEvidence[] = [];
  const missingEvidence: string[] = [];
  const contradictingEvidence: ReasoningEvidence[] = [];
  let score = 0;

  const diseaseSymptomIds = disease.symptoms.map(s => s.symptomId);
  const diseaseSignIds = disease.signs.map(s => s.signId);

  for (const fact of facts) {
    if (fact.symptomId && diseaseSymptomIds.includes(fact.symptomId)) {
      const symptomDef = disease.symptoms.find(s => s.symptomId === fact.symptomId)!;
      const evidenceWeight = fact.value === true || fact.value === 'yes' || (typeof fact.value === 'number' && fact.value > 0)
        ? symptomDef.discriminatingValue * fact.confidence
        : -symptomDef.discriminatingValue * 0.5;
      score += evidenceWeight;
      evidenceMatch.push({
        factId: fact.id, attribute: fact.attribute,
        value: fact.value, supportsDiseaseIds: [disease.id],
        contradictsDiseaseIds: [], weight: evidenceWeight,
      });
    } else if (diseaseSignIds.includes(fact.attribute)) {
      score += 0.15 * fact.confidence;
      evidenceMatch.push({
        factId: fact.id, attribute: fact.attribute,
        value: fact.value, supportsDiseaseIds: [disease.id],
        contradictsDiseaseIds: [], weight: 0.15,
      });
    }
  }

  const mechanismOverlap = activeMechanisms.filter(am =>
    disease.mechanisms.includes(am.mechanism),
  );
  score += mechanismOverlap.length * 0.2;

  const phenotypeOverlap = activePhenotypes.filter(ap =>
    disease.phenotypes.some(dp => dp.name === ap.label),
  );
  score += phenotypeOverlap.length * 0.25;

  for (const symptom of disease.symptoms) {
    const hasFact = facts.some(f => f.symptomId === symptom.symptomId);
    if (!hasFact && symptom.frequency === 'always') {
      missingEvidence.push(symptom.symptomId);
    } else if (hasFact && symptom.frequency === 'never') {
      const fact = facts.find(f => f.symptomId === symptom.symptomId);
      if (fact && (fact.value === true || fact.value === 'yes')) {
        contradictingEvidence.push({
          factId: fact.id, attribute: fact.attribute,
          value: fact.value, supportsDiseaseIds: [],
          contradictsDiseaseIds: [disease.id], weight: -0.5,
        });
        score -= 0.5;
      }
    }
  }

  const normalizedScore = Math.max(0, Math.min(1, score));
  const confidence: ClinicalConfidence =
    normalizedScore >= 0.7 ? 'high' :
    normalizedScore >= 0.4 ? 'moderate' :
    normalizedScore >= 0.2 ? 'low' : 'suspected';

  const investigationReadiness = evaluateInvestigationReadiness(disease, normalizedScore, activeMechanisms);

  return {
    disease,
    activationScore: Math.round(normalizedScore * 100) / 100,
    evidenceMatch,
    missingEvidence,
    contradictingEvidence,
    mechanismMatch: mechanismOverlap.map(m => m.mechanism),
    phenotypeMatch: phenotypeOverlap.map(p => p.phenotypeId),
    confidence,
    investigationReadiness,
  };
}

// ─────────────────────────────────────────────────────────────────
// BOOK X: INVESTIGATION READINESS — visible only when thresholds met
// ─────────────────────────────────────────────────────────────────

export function evaluateInvestigationReadiness(
  disease: DiseaseObject,
  diseaseScore: number,
  activeMechanisms: MechanismActivation[],
): InvestigationReadiness {
  let thresholdMet = 0;
  let requiredThreshold = 0;

  const suggestedInvestigations: string[] = [];
  const requiredInvestigations: string[] = [];

  for (const inv of disease.investigations) {
    if (inv.timing === 'initial') {
      const requiredForCurrent = inv.requiredForDiagnosis ? 0.3 : 0.2;
      requiredThreshold = Math.max(requiredThreshold, requiredForCurrent);
      if (diseaseScore >= requiredForCurrent) {
        thresholdMet++;
        if (inv.requiredForDiagnosis) {
          requiredInvestigations.push(inv.investigationId);
        } else {
          suggestedInvestigations.push(inv.investigationId);
        }
      }
    }

    if (inv.timing === 'confirmatory') {
      const confirmThreshold = 0.5;
      requiredThreshold = Math.max(requiredThreshold, confirmThreshold);
      if (diseaseScore >= confirmThreshold) {
        thresholdMet++;
        suggestedInvestigations.push(inv.investigationId);
      }
    }
  }

  const ready = diseaseScore >= 0.3;

  return {
    ready,
    thresholdMet,
    requiredThreshold,
    suggestedInvestigations,
    requiredInvestigations,
  };
}

// ─────────────────────────────────────────────────────────────────
// DIFFERENTIAL RANKING — diseases compete by explaining evidence
// ─────────────────────────────────────────────────────────────────

export function buildDifferentialRanking(
  facts: FactObject[],
  activeMechanisms: MechanismActivation[],
  activePhenotypes: PhenotypeActivation[],
  diseaseIds?: string[],
): DifferentialRanking {
  const diseasesToScore = diseaseIds
    ? diseaseIds.map(id => DISEASE_REGISTRY[id]).filter((d): d is DiseaseObject => !!d)
    : Object.values(DISEASE_REGISTRY);

  const activations = diseasesToScore.map(d =>
    scoreDiseaseAgainstFacts(d, facts, activeMechanisms, activePhenotypes),
  );

  activations.sort((a, b) => b.activationScore - a.activationScore);
  const topDisease = activations[0] ?? null;
  const confidenceGap = activations.length >= 2
    ? activations[0].activationScore - activations[1].activationScore
    : 1;

  const requiresMoreEvidence = confidenceGap < 0.2 && (topDisease?.activationScore ?? 0) < 0.7;

  const nextBestInvestigation = requiresMoreEvidence && topDisease
    ? topDisease.investigationReadiness.suggestedInvestigations[0] ?? null
    : null;

  return { diseases: activations, topDisease, confidenceGap, requiresMoreEvidence, nextBestInvestigation };
}

// ─────────────────────────────────────────────────────────────────
// FULL REASONING PIPELINE — facts → mechanisms → phenotypes → diseases → investigations
// ─────────────────────────────────────────────────────────────────

export interface ReasoningPipelineInput {
  facts: FactObject[];
  activeMechanisms: MechanismActivation[];
  activePhenotypes: PhenotypeActivation[];
  complaintIds: string[];
  patientAgeGroup: string;
  patientSex: string;
}

export interface ReasoningPipelineOutput {
  differentialRanking: DifferentialRanking;
  violations: ShortcutViolation[];
  investigationPlan: string[];
  diagnosticConfidence: number;
  requiresMoreEvidence: boolean;
  nextStep: string;
}

export function runReasoningPipeline(input: ReasoningPipelineInput): ReasoningPipelineOutput {
  const violations: ShortcutViolation[] = [];
  const investigationPlan: string[] = [];

  for (const complaint of input.complaintIds) {
    const v = enforceReasoningChain(
      complaint, '',
      input.activeMechanisms.map(m => m.mechanism),
      input.activePhenotypes.map(p => p.phenotypeId),
    );
    violations.push(...v);
  }

  const differentialRanking = buildDifferentialRanking(
    input.facts,
    input.activeMechanisms,
    input.activePhenotypes,
  );

  for (const activation of differentialRanking.diseases) {
    if (activation.activationScore >= 0.3) {
      investigationPlan.push(...activation.investigationReadiness.suggestedInvestigations);
      investigationPlan.push(...activation.investigationReadiness.requiredInvestigations);
    }
  }

  const topScore = differentialRanking.topDisease?.activationScore ?? 0;
  const diagnosticConfidence = topScore;
  const requiresMoreEvidence = differentialRanking.requiresMoreEvidence;

  const nextStep = requiresMoreEvidence
    ? `Collect more evidence. Next best: ${differentialRanking.nextBestInvestigation ?? 'gather more clinical facts'}`
    : topScore >= 0.7
      ? `Diagnostic confidence adequate (${Math.round(topScore * 100)}%). Proceed to management planning.`
      : `Top differential: ${differentialRanking.topDisease?.disease.name ?? 'Unknown'} (confidence ${Math.round(topScore * 100)}%). Consider investigations.`;

  return {
    differentialRanking,
    violations,
    investigationPlan: [...new Set(investigationPlan)],
    diagnosticConfidence,
    requiresMoreEvidence,
    nextStep,
  };
}
