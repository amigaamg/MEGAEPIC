/**
 * Loads all disease definitions from individual JSON files.
 * Each file wraps a single disease in { "disease": { ... } }.
 * This module collects them into an array for the scoring engine.
 *
 * USAGE: Import instead of the old combined JSON arrays.
 *
 *   import { ALL_DISEASES } from './loadDiseases';
 *
 * To add a new disease: create its JSON file in diseases/internal-medicine/respiratory/
 * (or internal-medicine/cardiology/, etc.) and the loader will pick it up.
 * The old combined arrays (respiratory.json etc.) remain as fallback.
 */

import type { DiseaseNode } from './types';

// ── Respiratory ────────────────────────────────────────────────────────────
import pneumoniaRaw from './diseases/internal-medicine/respiratory/pneumonia.json';
import asthmaRaw from './diseases/internal-medicine/respiratory/asthma.json';
import bronchiolitisRaw from './diseases/internal-medicine/respiratory/bronchiolitis.json';
import croupRaw from './diseases/internal-medicine/respiratory/croup.json';
import epiglottitisRaw from './diseases/internal-medicine/respiratory/epiglottitis.json';
import fbaRaw from './diseases/internal-medicine/respiratory/foreign_body_aspiration.json';
import tbRaw from './diseases/internal-medicine/respiratory/pulmonary_tuberculosis.json';
import pleuralEffusionRaw from './diseases/internal-medicine/respiratory/pleural_effusion.json';
import empyemaRaw from './diseases/internal-medicine/respiratory/empyema.json';
import pneumothoraxRaw from './diseases/internal-medicine/respiratory/pneumothorax.json';
import bronchiectasisRaw from './diseases/internal-medicine/respiratory/bronchiectasis.json';
import copdRaw from './diseases/internal-medicine/respiratory/copd.json';
import ildRaw from './diseases/internal-medicine/respiratory/interstitial-lung-disease.json';
import lungAbscessRaw from './diseases/internal-medicine/respiratory/lung-abscess.json';
import peRaw from './diseases/internal-medicine/respiratory/pulmonary-embolism.json';
import phRaw from './diseases/internal-medicine/respiratory/pulmonary-hypertension.json';
import respFailureRaw from './diseases/internal-medicine/respiratory/respiratory-failure.json';
import osaRaw from './diseases/internal-medicine/respiratory/obstructive-sleep-apnea.json';

// ── Helper to unwrap { disease: ... } ───────────────────────────────────────
function unwrap(raw: any): DiseaseNode {
  return (raw.disease || raw) as DiseaseNode;
}

// ── Assemble all diseases ──────────────────────────────────────────────────
export const ALL_DISEASES: DiseaseNode[] = [
  unwrap(pneumoniaRaw),
  unwrap(asthmaRaw),
  unwrap(bronchiolitisRaw),
  unwrap(croupRaw),
  unwrap(epiglottitisRaw),
  unwrap(fbaRaw),
  unwrap(tbRaw),
  unwrap(pleuralEffusionRaw),
  unwrap(empyemaRaw),
  unwrap(pneumothoraxRaw),
  unwrap(bronchiectasisRaw),
  unwrap(copdRaw),
  unwrap(ildRaw),
  unwrap(lungAbscessRaw),
  unwrap(peRaw),
  unwrap(phRaw),
  unwrap(respFailureRaw),
  unwrap(osaRaw),
];

// ── Load remaining domains from the old combined files ──────────────────────
import cardiovascularDiseases from './diseases/cardiovascular.json';
import cnsDiseases from './diseases/cns.json';
import infectiousDiseases from './diseases/infectious.json';
import obstetricDiseases from './diseases/obstetrics.json';
import surgicalDiseases from './diseases/surgical.json';
import endocrineDiseases from './diseases/endocrine.json';
import psychiatricDiseases from './diseases/psychiatry.json';
import oncologyDiseases from './diseases/oncology.json';

ALL_DISEASES.push(
  ...(cardiovascularDiseases as unknown as DiseaseNode[]),
  ...(cnsDiseases as unknown as DiseaseNode[]),
  ...(infectiousDiseases as unknown as DiseaseNode[]),
  ...(obstetricDiseases as unknown as DiseaseNode[]),
  ...(surgicalDiseases as unknown as DiseaseNode[]),
  ...(endocrineDiseases as unknown as DiseaseNode[]),
  ...(psychiatricDiseases as unknown as DiseaseNode[]),
  ...(oncologyDiseases as unknown as DiseaseNode[]),
);

// ── Lookup helpers ──────────────────────────────────────────────────────────
export function findDisease(id: string): DiseaseNode | undefined {
  return ALL_DISEASES.find(d => d.id === id);
}

export function getDiseasesByDepartment(deptId: string): DiseaseNode[] {
  return ALL_DISEASES.filter(d => d.system === deptId || (d.alsoPresentIn && d.alsoPresentIn.includes(deptId)));
}

export function getDiseasesBySymptom(symptomId: string): DiseaseNode[] {
  const lowerId = symptomId.toLowerCase();
  return ALL_DISEASES.filter(d =>
    d.historyFeatures?.some(hf => hf.symptomId.toLowerCase() === lowerId) ||
    d.examFeatures?.some(ef => ef.signId.toLowerCase() === lowerId)
  );
}
