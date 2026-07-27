import type { RuleDefinition } from '../types';
import { UNIVERSAL_DATA_RULES, UNIVERSAL_UI_RULES } from './universal-rules';
import { COUGH_UI_RULES, COUGH_CLINICAL_RULES, COUGH_DATA_RULES } from './cough-rules';

export const ALL_RULES: RuleDefinition[] = [
  ...UNIVERSAL_DATA_RULES,
  ...UNIVERSAL_UI_RULES,
  ...COUGH_UI_RULES,
  ...COUGH_CLINICAL_RULES,
  ...COUGH_DATA_RULES,
];

export const RULES_BY_DOMAIN: Record<string, RuleDefinition[]> = {
  universal: [...UNIVERSAL_DATA_RULES, ...UNIVERSAL_UI_RULES],
  cough: [...COUGH_UI_RULES, ...COUGH_CLINICAL_RULES, ...COUGH_DATA_RULES],
};

export { UNIVERSAL_DATA_RULES, UNIVERSAL_UI_RULES } from './universal-rules';
export { COUGH_UI_RULES, COUGH_CLINICAL_RULES, COUGH_DATA_RULES } from './cough-rules';
