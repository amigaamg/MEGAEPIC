import type { DiseaseNode, FeatureRecord } from '../../diseaseNode';
import { getFeature, getLrPlus, getLrMinus } from '../../features/featureLibrary';

function feat(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  const base = getFeature(id);
  return { ...base, sensitivity: sens, specificity: spec, LR_positive: getLrPlus({ ...base, sensitivity: sens, specificity: spec }), LR_negative: getLrMinus({ ...base, sensitivity: sens, specificity: spec }), ...overrides };
}
function sym(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  return feat(id, sens, spec, { ...overrides, category: 'symptom' });
}
function rf(id: string, LRP: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  const base = getFeature(id);
  return { ...base, LR_positive: LRP, ...overrides, category: 'risk_factor' };
}
