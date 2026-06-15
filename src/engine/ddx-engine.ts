import { getDiseasesByUnit, getAllDiseases } from './knowledge-graph';
import type { DiseaseNode } from './knowledge-graph/types';
import { getKgId, getSymptomId } from '../../lib/history-engine/diseaseIdMap';

export interface EncounterFacts {
  unitSlug: string;
  presentingComplaint?: string;
  hpi: { questionId: string; answer: string | boolean; weight?: number }[];
  exam: { findingId: string; present?: boolean; value?: number }[];
  investigations: { testId: string; result: any; flag: 'normal' | 'abnormal' | 'critical' }[];
  imaging: { studyId: string; finding: string; positive?: boolean }[];
  scores: { name: string; totalPoints: number }[];
}

export interface DDXResult {
  diseaseId: string;
  diseaseName: string;
  probability: number;
  keyFactors: string[];
  subtype?: string;
  severityLevel?: string;
  recommendedActions?: string[];
  suggestedInvestigations?: string[];
  confidence?: string;
}

export interface VitalsData {
  oxygenSaturation?: number;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  respiratoryRate?: number;
  temperature?: number;
}

function normalize(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function calculateDDX(facts: EncounterFacts): DDXResult[] {
  let candidates = getDiseasesByUnit(facts.unitSlug);
  if (candidates.length === 0) {
    candidates = getAllDiseases();
  }
  if (candidates.length === 0) return [];

  const results: DDXResult[] = [];

  for (const disease of candidates) {
    let score = 0;
    let maxScore = 0;
    const keyFactors: string[] = [];

    const prevalenceWeight = disease.prevalenceWeight || 0.5;
    score += prevalenceWeight * 10;
    maxScore += 10;

    const pc = facts.presentingComplaint ? normalize(facts.presentingComplaint) : '';
    const pcs: string[] = (disease as any).presentingComplaints || [];
    const diagnosticClues = disease.diagnosticClues || [];
    const allClues = [...pcs, ...diagnosticClues];
    const pcMatch = allClues.some((c) => pc.includes(normalize(c)) || normalize(c).includes(pc));
    if (pcMatch) {
      score += 15;
      keyFactors.push(`Presenting complaint matches ${disease.name}`);
    }
    maxScore += 15;

    const hQuestions = disease.historyFeatures || [];
    const legacyH = (disease as any).history_questions || [];
    const allHpi = hQuestions.length > 0 ? hQuestions : legacyH;
    for (const hq of allHpi) {
      const hpiWeight = hq.weight || 5;
      maxScore += hpiWeight;
      let qId = hq.symptomId || hq.id || '';
      const mappedId = getKgId(qId);
      const matched = facts.hpi.find((h) =>
        normalize(h.questionId).includes(normalize(qId)) ||
        normalize(h.questionId).includes(normalize(mappedId))
      );
      if (matched && (matched.answer === true || (typeof matched.answer === 'string' && matched.answer.length > 0))) {
        score += hpiWeight;
        keyFactors.push((hq as any).question || hq.symptomId?.replace(/_/g, ' ') || qId);
      }
    }

    const eFeatures = disease.examFeatures || [];
    const legacyE = (disease as any).examination_findings || [];
    const allExam = eFeatures.length > 0 ? eFeatures : legacyE;
    for (const ef of allExam) {
      const examWeight = ef.baseWeight || ef.weight || 5;
      maxScore += examWeight;
      const fId = ef.signId || ef.findingId || ef.id || '';
      const matched = facts.exam.find((e) => normalize(e.findingId).includes(normalize(fId)));
      if (matched && matched.present === true) {
        score += examWeight;
        if (ef.doubleWeight) score += examWeight;
        keyFactors.push((ef as any).finding || ef.signId?.replace(/_/g, ' ') || fId);
      }
    }

    const investigations = (disease as any).investigations || disease.investigations || {};
    const labList: any[] = investigations.laboratory || investigations.lab || [];
    const imagingList: any[] = investigations.imaging || [];

    for (const inv of labList) {
      const invWeight = 10;
      maxScore += invWeight;
      const matched = facts.investigations.find((i) => normalize(i.testId).includes(normalize(inv.name)));
      if (matched && matched.flag === 'abnormal') {
        score += invWeight;
        keyFactors.push(`${inv.name} abnormal`);
      } else if (matched && matched.flag === 'normal') {
        score -= invWeight * 0.3;
      }
    }

    for (const img of imagingList) {
      const imgWeight = 15;
      maxScore += imgWeight;
      const matched = facts.imaging.find((i) => normalize(i.studyId).includes(normalize(img.name)));
      if (matched && matched.positive === true) {
        score += imgWeight;
        keyFactors.push(`${img.name} positive`);
      } else if (matched && matched.positive === false) {
        score -= imgWeight * 0.5;
      }
    }

    for (const s of facts.scores) {
      if (s.totalPoints > 0) {
        const weight = (s.totalPoints / 10) * 5;
        maxScore += weight;
        score += weight;
        keyFactors.push(`${s.name}: ${s.totalPoints}`);
      }
    }

    const probability = Math.max(0, Math.min(100, Math.round((score / Math.max(maxScore, 1)) * 100)));
    results.push({
      diseaseId: disease.id,
      diseaseName: disease.name,
      probability,
      keyFactors: keyFactors.slice(0, 8),
    });
  }

  return results.sort((a, b) => b.probability - a.probability);
}

export async function getDDXWithSnapshot(
  facts: EncounterFacts,
): Promise<{ results: DDXResult[]; basedOnFactCount: number }> {
  const results = calculateDDX(facts);
  const count =
    facts.hpi.length + facts.exam.length + facts.investigations.length + facts.imaging.length;
  return { results, basedOnFactCount: count };
}
