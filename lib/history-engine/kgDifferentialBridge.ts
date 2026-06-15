import KG_SYMPTOM_INDEX from './kgSymptomIndex.json';
import { getSymptomId, getKgId } from './diseaseIdMap';
import { getDiseaseCategory } from './diseaseProfile';

interface KgBridgeEntry {
  kgId: string;
  name: string;
  weight: number;
}

/** Map of symptomId → KG disease entries loaded from pre-built index */
const KG_INDEX: Record<string, KgBridgeEntry[]> = KG_SYMPTOM_INDEX as any;

/**
 * Enrich existing aggregated differentials with KG-sourced disease data.
 * Adds KG diseases that match the given symptom IDs but aren't already
 * in the symptom library's static differentials.
 */
export function enrichWithKgDifferentials(
  symptomIds: string[],
  baseDifferentials: Map<string, { diseaseName: string; totalWeight: number; matchedSymptoms: string[] }>,
): Map<string, { diseaseName: string; totalWeight: number; matchedSymptoms: string[] }> {
  const enriched = new Map(baseDifferentials);

  for (const sid of symptomIds) {
    const kgEntries = KG_INDEX[sid];
    if (!kgEntries) continue;

    for (const entry of kgEntries) {
      // Check if KG disease already has a symptom library mapping
      const symptomLibId = getSymptomId(entry.kgId);
      // If already covered by symptom library via its own ID, skip
      if (symptomLibId && baseDifferentials.has(symptomLibId)) continue;
      // Use symptom library ID if available, else raw KG ID
      const mappedId = symptomLibId || entry.kgId;
      if (baseDifferentials.has(mappedId)) continue;

      const existing = enriched.get(mappedId);
      if (existing) {
        existing.totalWeight += entry.weight;
        existing.matchedSymptoms.push(sid.replace(/_/g, ' '));
      } else {
        enriched.set(mappedId, {
          diseaseName: entry.name,
          totalWeight: entry.weight,
          matchedSymptoms: [sid.replace(/_/g, ' ')],
        });
      }
    }
  }

  return enriched;
}

/**
 * Get all KG diseases associated with a symptom ID.
 */
export function getKgDiseasesForSymptom(symptomId: string): KgBridgeEntry[] {
  return KG_INDEX[symptomId] || [];
}

/**
 * Check which symptoms have KG bridge data.
 */
export function getKgBridgeSymptoms(): string[] {
  return Object.keys(KG_INDEX);
}
