import type { SymptomQuestion, ClinicalObjectiveGroup, FactExtractionRule } from '../symptom-types';

export const ALLERGY_OBJECTIVES: ClinicalObjectiveGroup[] = [
  { id: 'obj_allergy_drug', label: 'Drug Allergies', description: 'Document drug allergies and reactions', order: 1, required: true, questionIds: ['allergy_q_drug', 'allergy_q_drug_details'] },
  { id: 'obj_allergy_other', label: 'Other Allergies', description: 'Food, environmental, and contact allergies', order: 2, required: false, questionIds: ['allergy_q_food', 'allergy_q_environmental'] },
];

export const ALLERGY_QUESTIONS: SymptomQuestion[] = [
  {
    id: 'allergy_q_drug',
    text: 'Are you allergic to any medications?',
    alternatives: [
      { condition: { ageMax: 5 }, text: 'Is the child allergic to any medicines?' },
    ],
    type: 'multiple',
    chips: ['None known', 'Penicillin', 'Amoxicillin', 'Cotrimoxazole', 'Sulfa drugs', 'NSAIDs', 'Aspirin', 'Codeine', 'Chloroquine', 'Quinine', 'Contrast dye', 'Plaster / tape', 'Other'],
    required: true,
    importance: 3,
    reasoningWeight: 35,
    factKey: 'allergy_drug',
    documentationPhrase: 'Drug allergies: {value}',
  },
  {
    id: 'allergy_q_drug_details',
    text: 'What reaction do you have to the medication?',
    alternatives: [],
    type: 'chips',
    chips: ['Rash / hives', 'Swelling (angioedema)', 'Breathing difficulty', 'Anaphylaxis', 'Nausea / vomiting', 'Severe skin reaction', 'Unknown'],
    required: false,
    importance: 2,
    reasoningWeight: 15,
    factKey: 'allergy_drug_reaction',
    documentationPhrase: 'Drug allergy reaction: {value}',
    dependencies: ['allergy_q_drug'],
  },
  {
    id: 'allergy_q_food',
    text: 'Do you have any food allergies?',
    alternatives: [
      { condition: { ageMax: 5 }, text: 'Is the child allergic to any foods?' },
    ],
    type: 'multiple',
    chips: ['None', 'Milk', 'Eggs', 'Peanuts', 'Tree nuts', 'Fish / shellfish', 'Soy', 'Wheat', 'Other'],
    required: false,
    importance: 2,
    reasoningWeight: 15,
    factKey: 'allergy_food',
    documentationPhrase: 'Food allergies: {value}',
  },
  {
    id: 'allergy_q_environmental',
    text: 'Do you have any other allergies? (pollen, dust, latex, insect stings)',
    alternatives: [],
    type: 'multiple',
    chips: ['None', 'Dust / house dust mite', 'Pollen / hay fever', 'Latex', 'Insect stings', 'Animal dander', 'Mould', 'Other'],
    required: false,
    importance: 1,
    reasoningWeight: 10,
    factKey: 'allergy_environmental',
    documentationPhrase: 'Environmental allergies: {value}',
  },
];

export const ALLERGY_FACT_EXTRACTION: FactExtractionRule[] = [
  { questionId: 'allergy_q_drug', extract: (a) => [{ key: 'allergy_drug', value: Array.isArray(a) ? a.join(', ') : String(a), type: 'reported', questionId: 'allergy_q_drug', documentationPhrase: 'Drug allergies: ' + (Array.isArray(a) ? a.join(', ') : String(a)) }] },
  { questionId: 'allergy_q_drug_details', extract: (a) => a ? [{ key: 'allergy_drug_reaction', value: String(a), type: 'reported', questionId: 'allergy_q_drug_details', documentationPhrase: 'Reaction: ' + String(a) }] : [] },
  { questionId: 'allergy_q_food', extract: (a) => a ? [{ key: 'allergy_food', value: Array.isArray(a) ? a.join(', ') : String(a), type: 'reported', questionId: 'allergy_q_food', documentationPhrase: 'Food allergies: ' + (Array.isArray(a) ? a.join(', ') : String(a)) }] : [] },
  { questionId: 'allergy_q_environmental', extract: (a) => a ? [{ key: 'allergy_environmental', value: Array.isArray(a) ? a.join(', ') : String(a), type: 'reported', questionId: 'allergy_q_environmental', documentationPhrase: 'Other allergies: ' + (Array.isArray(a) ? a.join(', ') : String(a)) }] : [] },
];
