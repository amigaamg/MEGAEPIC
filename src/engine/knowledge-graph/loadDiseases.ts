/**
 * Loads all disease definitions from individual JSON files.
 * Each file wraps a single disease in { "disease": { ... } }.
 * This module collects them into an array for the scoring engine.
 *
 * USAGE: Import instead of the old combined JSON arrays.
 *
 *   import { ALL_DISEASES } from './loadDiseases';
 *
 * To add a new disease: create its JSON file in diseases/respiratory/
 * (or cardiovascular/, cns/, infectious/) and the loader will pick it up.
 * The old combined arrays (respiratory.json etc.) remain as fallback.
 */

import type { DiseaseNode } from './types';

// ── Respiratory ────────────────────────────────────────────────────────────
import pneumoniaRaw from './diseases/respiratory/pneumonia.json';
import asthmaRaw from './diseases/respiratory/asthma.json';
import bronchiolitisRaw from './diseases/respiratory/bronchiolitis.json';
import croupRaw from './diseases/respiratory/croup.json';
import epiglottitisRaw from './diseases/respiratory/epiglottitis.json';
import fbaRaw from './diseases/respiratory/foreign_body_aspiration.json';
import tbRaw from './diseases/respiratory/pulmonary_tuberculosis.json';
import pleuralEffusionRaw from './diseases/respiratory/pleural_effusion.json';
import empyemaRaw from './diseases/respiratory/empyema.json';
import pneumothoraxRaw from './diseases/respiratory/pneumothorax.json';

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
];

// ── Load remaining domains from the old combined files ──────────────────────
import cardiovascularDiseases from './diseases/cardiovascular.json';
import cnsDiseases from './diseases/cns.json';
import infectiousDiseases from './diseases/infectious.json';

ALL_DISEASES.push(
  ...(cardiovascularDiseases as unknown as DiseaseNode[]),
  ...(cnsDiseases as unknown as DiseaseNode[]),
  ...(infectiousDiseases as unknown as DiseaseNode[]),
);

// ── Lookup helper ──────────────────────────────────────────────────────────
export function findDisease(id: string): DiseaseNode | undefined {
  return ALL_DISEASES.find(d => d.id === id);
}
