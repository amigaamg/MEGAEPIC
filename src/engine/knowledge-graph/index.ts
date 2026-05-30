import {
  ALL_DISEASES,
  findDisease,
  getDiseasesByDepartment,
  getDiseasesBySymptom,
} from './loadDiseases';
import type { DiseaseNode } from './types';

const _byUnit = new Map<string, DiseaseNode[]>();
const _byId = new Map<string, DiseaseNode>();
const _presentingComplaintsByUnit = new Map<string, string[]>();

function ensureIndexed() {
  if (_byId.size > 0) return;
  for (const d of ALL_DISEASES) {
    _byId.set(d.id, d);
    const unit = (d as any).unit || (d as any).section || d.system || 'general';
    if (!_byUnit.has(unit)) _byUnit.set(unit, []);
    _byUnit.get(unit)!.push(d);
  }
}

function ensureComplaintsIndexed() {
  if (_presentingComplaintsByUnit.size > 0) return;
  ensureIndexed();
  for (const [unit, diseases] of _byUnit) {
    const complaints = new Set<string>();
    for (const d of diseases) {
      const pc = (d as any).presentingComplaints as string[] | undefined;
      if (pc) pc.forEach((c: string) => complaints.add(c));
      if (d.diagnosticClues) d.diagnosticClues.forEach((c) => complaints.add(c));
    }
    _presentingComplaintsByUnit.set(unit, Array.from(complaints));
  }
}

export function loadDiseaseLibrary(): DiseaseNode[] {
  ensureIndexed();
  return ALL_DISEASES;
}

export function getDiseasesByUnit(unitSlug: string): DiseaseNode[] {
  ensureIndexed();
  return _byUnit.get(unitSlug) || [];
}

export function getDiseaseById(id: string): DiseaseNode | undefined {
  ensureIndexed();
  return _byId.get(id) || findDisease(id);
}

export function getAllDiseases(): DiseaseNode[] {
  ensureIndexed();
  return ALL_DISEASES;
}

export function getDiseaseCountByUnit(unitSlug: string): number {
  return getDiseasesByUnit(unitSlug).length;
}

export function getUnitsForDepartment(deptSlug: string): string[] {
  ensureIndexed();
  const units = new Set<string>();
  for (const d of ALL_DISEASES) {
    if (d.system === deptSlug || (d as any).department === deptSlug) {
      const unit = (d as any).unit || (d as any).section;
      if (unit) units.add(unit);
    }
  }
  return Array.from(units);
}

export function getPresentingComplaintsForUnit(unitSlug: string): string[] {
  ensureComplaintsIndexed();
  return _presentingComplaintsByUnit.get(unitSlug) || [];
}

export function extractHistoryQuestions(disease: DiseaseNode): { id: string; question: string; weight: number }[] {
  const legacy = (disease as any).history_questions as { question: string; weight: number }[] | undefined;
  if (legacy) {
    return legacy.map((q, i) => ({ id: `${disease.id}_hq_${i}`, question: q.question, weight: q.weight }));
  }
  return (disease.historyFeatures || []).map((hf, i) => ({
    id: hf.symptomId || `${disease.id}_hf_${i}`,
    question: hf.symptomId?.replace(/_/g, ' ') || '',
    weight: hf.weight,
  }));
}

export function extractExaminationFindings(disease: DiseaseNode): {
  id: string; finding: string; weight: number; type: 'boolean' | 'numeric';
}[] {
  const legacy = (disease as any).examination_findings as { finding: string; weight: number }[] | undefined;
  if (legacy) {
    return legacy.map((f, i) => ({ id: `${disease.id}_ef_${i}`, finding: f.finding, weight: f.weight, type: 'boolean' }));
  }
  return (disease.examFeatures || []).map((ef, i) => ({
    id: ef.signId || `${disease.id}_ef_${i}`,
    finding: ef.signId?.replace(/_/g, ' ') || '',
    weight: ef.baseWeight,
    type: (ef as any).type || 'boolean',
  }));
}

export { findDisease, getDiseasesByDepartment, getDiseasesBySymptom, ALL_DISEASES };
