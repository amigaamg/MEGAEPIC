import type { DiseaseNode } from '../knowledge-graph/types';

export interface RuleEvaluation {
  diseaseId: string;
  diseaseName: string;
  ruledIn: boolean;
  ruledOut: boolean;
  reasons: string[];
}

export function evaluateRules(
  disease: DiseaseNode,
  presentSymptoms: string[],
  absentSymptoms: string[],
  examFindings: string[]
): RuleEvaluation {
  const reasons: string[] = [];
  let ruledIn = false;
  let ruledOut = false;

  const symptomSet = new Set(presentSymptoms.map(s => s.toLowerCase()));
  const examSet = new Set(examFindings.map(s => s.toLowerCase()));
  const absentSet = new Set(absentSymptoms.map(s => s.toLowerCase()));

  if (disease.exclusionClues && disease.exclusionClues.length > 0) {
    for (const clue of disease.exclusionClues) {
      if (symptomSet.has(clue.toLowerCase()) || examSet.has(clue.toLowerCase())) {
        ruledOut = true;
        reasons.push(`Exclusion clue present: ${clue}`);
      }
    }
  }

  for (const hf of disease.historyFeatures || []) {
    if (hf.negativePredictor && presentSymptoms.includes(hf.symptomId)) {
      reasons.push(`Negative predictor: ${hf.symptomId} reduces likelihood`);
    }
  }

  for (const ef of disease.examFeatures || []) {
    if (ef.excludePneumonia && examSet.has(ef.signId.toLowerCase())) {
      ruledOut = true;
      reasons.push(`Absolute exclusion: ${ef.signId} present`);
    }
  }

  if (disease.diagnosticClues && disease.diagnosticClues.length > 0) {
    const matchedClues = disease.diagnosticClues.filter(clue =>
      presentSymptoms.some(s => clue.toLowerCase().includes(s.toLowerCase())) ||
      examFindings.some(f => clue.toLowerCase().includes(f.toLowerCase()))
    );
    if (matchedClues.length >= 2) {
      ruledIn = true;
      reasons.push(`Diagnostic clues matched: ${matchedClues.slice(0, 2).join(', ')}`);
    }
  }

  const pathophysiologyTags = new Set(disease.syndromeTags || []);
  if (pathophysiologyTags.size > 0) {
    const matchedTags = [...pathophysiologyTags].filter(tag =>
      presentSymptoms.some(s => s.toLowerCase().includes(tag.toLowerCase())) ||
      examFindings.some(f => f.toLowerCase().includes(tag.toLowerCase()))
    );
    if (matchedTags.length > 0) {
      ruledIn = true;
      reasons.push(`Syndrome match: ${matchedTags.join(', ')}`);
    }
  }

  return { diseaseId: disease.id, diseaseName: disease.name, ruledIn, ruledOut, reasons };
}

export function hasRedFlags(disease: DiseaseNode, symptoms: string[]): string[] {
  const flags: string[] = [];
  const symptomSet = new Set(symptoms.map(s => s.toLowerCase()));

  if (disease.mustNotMiss) {
    flags.push('Must-not-miss disease — consider even if probability is low');
  }

  const sa = disease.severityAssessment;
  if (sa) {
    for (const ds of sa.immediateDangerSigns || []) {
      if (symptomSet.has(ds.sign.toLowerCase())) {
        flags.push(`${ds.sign}: ${ds.description || 'immediate danger sign'}`);
      }
    }
    for (const sc of sa.severeCriteria?.additionalCriteria || []) {
      if (symptomSet.has(sc.sign.toLowerCase())) {
        flags.push(`${sc.sign}: severe criterion`);
      }
    }
  }

  if (disease.emergencyPriority === 'red' || disease.emergencyPriority === 'orange') {
    flags.push(`Emergency priority: ${disease.emergencyPriority}`);
  }

  return flags;
}
