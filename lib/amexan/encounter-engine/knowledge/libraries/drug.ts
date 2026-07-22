import type { SymptomQuestion, ClinicalObjectiveGroup, FactExtractionRule } from '../symptom-types';

export const DRUG_OBJECTIVES: ClinicalObjectiveGroup[] = [
  { id: 'obj_drug_current', label: 'Current Medications', description: 'Document all current medications', order: 1, required: true, questionIds: ['drug_q_current', 'drug_q_adherence'] },
  { id: 'obj_drug_past', label: 'Past Medications', description: 'Significant past medications', order: 2, required: false, questionIds: ['drug_q_past'] },
  { id: 'obj_drug_adverse', label: 'Adverse Drug Reactions', description: 'Document adverse reactions', order: 3, required: false, questionIds: ['drug_q_adverse'] },
  { id: 'obj_drug_alternative', label: 'Complementary/Alternative', description: 'Herbal and traditional medicines', order: 4, required: false, questionIds: ['drug_q_herbal'] },
];

export const DRUG_QUESTIONS: SymptomQuestion[] = [
  {
    id: 'drug_q_current',
    text: 'Are you currently taking any medications? (prescribed or over-the-counter)',
    alternatives: [
      { condition: { ageMax: 5 }, text: 'Is the child on any medications?' },
      { condition: { ageMax: 1 }, text: 'Is the baby on any medications?' },
    ],
    type: 'text',
    required: true,
    importance: 3,
    reasoningWeight: 35,
    factKey: 'drug_current',
    documentationPhrase: 'Current medications: {value}',
  },
  {
    id: 'drug_q_adherence',
    text: 'How well do you take your medications?',
    alternatives: [],
    type: 'chips',
    chips: ['Takes as prescribed', 'Sometimes misses doses', 'Frequently misses doses', 'Cannot afford', 'Stopped due to side effects', 'N/A'],
    required: false,
    importance: 2,
    reasoningWeight: 20,
    factKey: 'drug_adherence',
    documentationPhrase: 'Medication adherence: {value}',
  },
  {
    id: 'drug_q_past',
    text: 'Have you taken any important medications in the past that you no longer take?',
    alternatives: [],
    type: 'text',
    required: false,
    importance: 1,
    reasoningWeight: 10,
    factKey: 'drug_past',
    documentationPhrase: 'Past medications: {value}',
  },
  {
    id: 'drug_q_adverse',
    text: 'Have you ever had a bad reaction to any medication?',
    alternatives: [
      { condition: { ageMax: 5 }, text: 'Has the child ever had a bad reaction to any medicine?' },
    ],
    type: 'boolean',
    required: false,
    importance: 3,
    reasoningWeight: 30,
    factKey: 'drug_adverse',
    documentationPhrase: 'History of adverse drug reaction',
  },
  {
    id: 'drug_q_herbal',
    text: 'Do you take any herbal, traditional, or complementary remedies?',
    alternatives: [],
    type: 'boolean',
    required: false,
    importance: 2,
    reasoningWeight: 15,
    factKey: 'drug_herbal',
    documentationPhrase: 'Uses herbal/traditional remedies',
  },
];

export const DRUG_FACT_EXTRACTION: FactExtractionRule[] = [
  { questionId: 'drug_q_current', extract: (a) => [{ key: 'drug_current', value: String(a), type: 'reported', questionId: 'drug_q_current', documentationPhrase: 'Current medications: ' + String(a) }] },
  { questionId: 'drug_q_adherence', extract: (a) => [{ key: 'drug_adherence', value: String(a), type: 'reported', questionId: 'drug_q_adherence', documentationPhrase: 'Adherence: ' + String(a) }] },
  { questionId: 'drug_q_past', extract: (a) => a ? [{ key: 'drug_past', value: String(a), type: 'reported', questionId: 'drug_q_past', documentationPhrase: 'Past medications: ' + String(a) }] : [] },
  { questionId: 'drug_q_adverse', extract: (a) => a ? [{ key: 'drug_adverse', value: true, type: 'reported', questionId: 'drug_q_adverse', documentationPhrase: 'History of adverse drug reaction' }] : [] },
  { questionId: 'drug_q_herbal', extract: (a) => a ? [{ key: 'drug_herbal', value: true, type: 'reported', questionId: 'drug_q_herbal', documentationPhrase: 'Uses herbal remedies' }] : [] },
];
