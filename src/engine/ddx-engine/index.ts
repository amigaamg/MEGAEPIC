import { ALL_DISEASES, findDisease, getDiseasesByDepartment, getDiseasesBySymptom } from '../knowledge-graph/loadDiseases';
import type { DiseaseNode } from '../knowledge-graph/types';
import { calculateSymptomWeights, aggregateScore } from './symptom-weighting';
import { evaluateRules, hasRedFlags } from './rule-in-out';
import { applyBayesianNetwork } from './bayesian-network';

export interface VitalsData {
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  oxygenSaturation?: number;
  weight?: number;
}

export { findDisease, getDiseasesByDepartment, getDiseasesBySymptom, ALL_DISEASES };
export type { DiseaseNode };

export interface DdxInput {
  ageMonths: number;
  sex: 'male' | 'female' | 'unknown';
  symptoms: string[];
  examFindings: string[];
  vitals: VitalsData;
  riskFactors: string[];
  durationDays: number;
  departmentId?: string;
}

export interface DdxResult {
  diseaseId: string;
  diseaseName: string;
  probability: number;
  confidence: 'low' | 'medium' | 'high';
  supportingEvidence: string[];
  againstEvidence: string[];
  severityLevel: 'mild' | 'moderate' | 'severe' | 'critical';
  recommendedActions: string[];
  suggestedInvestigations: string[];
  emergencyPriority: 'green' | 'yellow' | 'orange' | 'red';
}

export interface DdxEngine {
  evaluate(input: DdxInput): Promise<DdxResult[]>;
  getDiseaseDetail(id: string): DiseaseNode | undefined;
  getDiseasesByDepartment(deptId: string): DiseaseNode[];
  getDiseasesBySymptom(symptom: string): DiseaseNode[];
}

function getConfidence(score: number): 'low' | 'medium' | 'high' {
  if (score >= 0.7) return 'high';
  if (score >= 0.35) return 'medium';
  return 'low';
}

function getSeverityLevel(disease: DiseaseNode): 'mild' | 'moderate' | 'severe' | 'critical' {
  const sa = disease.severityAssessment;
  if (!sa) return 'mild';
  const label = sa.severityLabel?.toLowerCase() || 'mild';
  if (label.includes('critical')) return 'critical';
  if (label.includes('severe')) return 'severe';
  if (label.includes('moderate')) return 'moderate';
  return 'mild';
}

function getEmergencyPriority(severityLevel: string, mustNotMiss: boolean): 'green' | 'yellow' | 'orange' | 'red' {
  if (severityLevel === 'critical') return 'red';
  if (severityLevel === 'severe') return 'orange';
  if (mustNotMiss) return 'orange';
  if (severityLevel === 'moderate') return 'yellow';
  return 'green';
}

function extractInvestigations(disease: DiseaseNode): string[] {
  const names: string[] = [];
  const inv = disease.investigations;
  if (!inv) return names;
  if (Array.isArray(inv)) {
    for (const item of inv) {
      if (item && typeof item.name === 'string') names.push(item.name);
    }
  } else if (typeof inv === 'object') {
    for (const tier of ['bedside', 'laboratory', 'lab', 'imaging', 'advanced'] as const) {
      const arr = (inv as any)[tier];
      if (Array.isArray(arr)) {
        for (const item of arr) {
          if (item && typeof item.name === 'string') names.push(item.name);
        }
      }
    }
  }
  return names;
}

function extractManagementActions(disease: DiseaseNode): string[] {
  const actions: string[] = [];
  if (disease.managementProtocols) {
    for (const proto of disease.managementProtocols) {
      if (proto.steps) actions.push(...proto.steps);
    }
  }
  if (disease.management) {
    const mgmt = disease.management;
    if (mgmt.pathways) {
      for (const pw of mgmt.pathways) {
        if (typeof pw.treatment === 'string') actions.push(pw.treatment);
        else if (Array.isArray(pw.treatment)) actions.push(...pw.treatment);
      }
    }
  }
  return [...new Set(actions)];
}

function getAgeGatedDiseases(ageMonths: number): DiseaseNode[] {
  return ALL_DISEASES.filter(d => {
    if (!d.agePeak) return true;
    const [min, max] = d.agePeak;
    const minAllowed = Math.round(min * 0.5);
    const maxAllowed = Math.round(max * 2);
    return ageMonths >= minAllowed && ageMonths <= maxAllowed;
  });
}

export function createDdxEngine(): DdxEngine {
  return {
    async evaluate(input: DdxInput): Promise<DdxResult[]> {
      const { ageMonths, symptoms, examFindings, riskFactors, departmentId } = input;

      let candidates = getAgeGatedDiseases(ageMonths);

      if (departmentId) {
        candidates = candidates.filter(d =>
          d.system === departmentId || (d.alsoPresentIn && d.alsoPresentIn.includes(departmentId))
        );
      }

      const absentSymptoms: string[] = [];
      const allKnownSymptoms = new Set<string>();
      for (const d of candidates) {
        for (const hf of d.historyFeatures || []) allKnownSymptoms.add(hf.symptomId);
        for (const ef of d.examFeatures || []) allKnownSymptoms.add(ef.signId);
      }
      for (const known of allKnownSymptoms) {
        if (!symptoms.includes(known) && !examFindings.includes(known)) {
          absentSymptoms.push(known);
        }
      }

      const results: DdxResult[] = [];

      for (const disease of candidates) {
        const weights = calculateSymptomWeights(disease, symptoms, examFindings, riskFactors);
        const prevalenceWeight = disease.prevalenceWeight || 0.5;
        const score = aggregateScore(weights, prevalenceWeight);

        const ruleResult = evaluateRules(disease, symptoms, absentSymptoms, examFindings);
        if (ruleResult.ruledOut) continue;

        const bayesianProb = applyBayesianNetwork(disease, symptoms, absentSymptoms);
        const combinedProb = (score * 0.6 + bayesianProb * 0.4);

        const redFlags = hasRedFlags(disease, symptoms);
        const severityLevel = getSeverityLevel(disease);

        const supportingEvidence: string[] = [];
        const againstEvidence: string[] = [];
        for (const w of weights) {
          if (w.totalWeight > 0) {
            supportingEvidence.push(`${w.symptomId} (weight: ${w.totalWeight.toFixed(1)})`);
          }
        }
        if (ruleResult.reasons.length > 0) {
          againstEvidence.push(...ruleResult.reasons);
        }
        if (redFlags.length > 0) {
          supportingEvidence.push(...redFlags.map(rf => `RED FLAG: ${rf}`));
        }

        const recommendedActions = extractManagementActions(disease);
        const suggestedInvestigations = extractInvestigations(disease);

        const emergencyPriority = getEmergencyPriority(severityLevel, disease.mustNotMiss || false);

        results.push({
          diseaseId: disease.id,
          diseaseName: disease.name,
          probability: Math.min(1, Math.max(0, combinedProb)),
          confidence: getConfidence(combinedProb),
          supportingEvidence,
          againstEvidence,
          severityLevel,
          recommendedActions,
          suggestedInvestigations,
          emergencyPriority,
        });
      }

      results.sort((a, b) => b.probability - a.probability);
      return results;
    },

    getDiseaseDetail(id: string): DiseaseNode | undefined {
      return findDisease(id);
    },

    getDiseasesByDepartment(deptId: string): DiseaseNode[] {
      return getDiseasesByDepartment(deptId);
    },

    getDiseasesBySymptom(symptom: string): DiseaseNode[] {
      return getDiseasesBySymptom(symptom);
    },
  };
}
