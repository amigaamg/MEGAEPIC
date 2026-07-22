// ═══════════════════════════════════════════════════════════════════════════════
// Diarrhea Symptom Node — SX000006
// Sources: Hutchison Clinical Methods 25e, WHO IMCI, ESPGHAN Guidelines
// Universal Core + Pediatric (IMCI) + Neonatal adapters
// ═══════════════════════════════════════════════════════════════════════════════

import type { SymptomNode } from '../symptom-types';

export const DIARRHEA_NODE: SymptomNode = {
  identity: {
    id: 'SX000006',
    canonicalName: 'Diarrhea',
    synonyms: ['Diarrhoea', 'Loose motions', 'Frequent stools'],
    layTerms: ['Running stomach', 'Frequent pooping', 'Watery stool'],
    translations: {},
    snomed: '62315008',
    icd10: 'R19.7',
    umls: 'C0011991',
    bodySystem: 'Gastrointestinal',
    primarySpecialty: 'General Medicine',
    emergencyWeight: 3,
  },

  metadata: {
    version: '1.0.0',
    author: 'AMEXAN Clinical Constitution',
    evidenceLevel: 'consensus',
    lastUpdated: '2026-07-13',
    source: 'Hutchison Clinical Methods 25e, WHO IMCI diarrhea guidelines, ESPGHAN acute gastroenteritis guidelines',
  },

  activation: {
    chiefComplaint: true,
    hpiMention: true,
    ros: true,
    referralLetter: true,
    voiceTranscription: true,
    keywords: ['diarrhea', 'diarrhoea', 'loose stool', 'watery stool', 'frequent stool', 'running stomach', 'loose motions'],
  },

  timeline: {
    allowed: ['acute', 'subacute', 'chronic', 'recurrent', 'unknown'],
    defaultCategory: 'acute',
  },

  objectives: [
    { id: 'obj_char', label: 'Characterization', description: 'Establish stool consistency, volume, and content', order: 1, required: true, questionIds: ['q_consistency', 'q_volume'] },
    { id: 'obj_timeline', label: 'Timeline', description: 'Onset, duration, frequency', order: 2, required: true, questionIds: ['q_onset', 'q_duration', 'q_frequency'] },
    { id: 'obj_severity', label: 'Severity', description: 'Assess severity and dehydration risk', order: 3, required: true, questionIds: ['q_dehydration_signs', 'q_severity_assessment'] },
    { id: 'obj_associated', label: 'Associated Symptoms', description: 'Identify accompanying GI and systemic symptoms', order: 4, required: true, questionIds: ['q_abdominal_pain', 'q_fever', 'q_vomiting'] },
    { id: 'obj_exposure', label: 'Exposure History', description: 'Identify infectious exposures', order: 5, required: false, questionIds: ['q_recent_food', 'q_sick_contact', 'q_antibiotics'] },
    { id: 'obj_previous', label: 'Previous Episodes', description: 'History of similar episodes', order: 6, required: false, questionIds: ['q_previous_episodes'] },
    { id: 'obj_pediatric', label: 'Pediatric Assessment', description: 'IMCI diarrhea and dehydration classification', order: 7, required: false, questionIds: ['q_ped_feeding', 'q_ped_urine', 'q_ped_thirst'] },
    { id: 'obj_red_flags', label: 'Red Flags', description: 'Identify warning signs requiring urgent attention', order: 8, required: true, questionIds: ['q_bloody_stool', 'q_severe_dehydration'] },
  ],

  questions: [
    // ── Characterization ──
    {
      id: 'q_consistency',
      text: 'What is the consistency of the stool?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'What does the stool look like?' },
      ],
      type: 'chips',
      chips: ['Watery / liquid', 'Loose / mushy', 'Semi-formed', 'Mucoid (with mucus)', 'Bloody / dysentery', 'Rice-watery'],
      required: true,
      importance: 2,
      reasoningWeight: 30,
      factKey: 'diarrhea_consistency',
      documentationPhrase: 'Stool consistency: {value}',
    },
    {
      id: 'q_volume',
      text: 'What is the volume of each stool?',
      alternatives: [],
      type: 'chips',
      chips: ['Small volume', 'Moderate volume', 'Large volume / gushing'],
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'diarrhea_volume',
      documentationPhrase: 'Stool volume: {value}',
    },

    // ── Timeline ──
    {
      id: 'q_onset',
      text: 'When did the diarrhea start?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'When did the diarrhea start?' },
      ],
      type: 'chips',
      chips: ['Hours ago', '1-3 days ago', '4-7 days ago', '1-2 weeks ago', 'More than 2 weeks ago'],
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'diarrhea_onset',
      documentationPhrase: 'Diarrhea started {value} ago',
    },
    {
      id: 'q_duration',
      text: 'How long has the diarrhea lasted?',
      alternatives: [],
      type: 'chips',
      chips: ['Less than 7 days (acute)', '7-13 days (persistent)', '14 days or more (chronic)'],
      required: true,
      importance: 2,
      reasoningWeight: 25,
      factKey: 'diarrhea_duration',
      documentationPhrase: 'Duration: {value}',
    },
    {
      id: 'q_frequency',
      text: 'How many episodes of diarrhea in the last 24 hours?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'How many times has the child had diarrhea today?' },
      ],
      type: 'chips',
      chips: ['1-3 times', '4-6 times', '7-10 times', 'More than 10 times'],
      required: true,
      importance: 2,
      reasoningWeight: 25,
      factKey: 'diarrhea_frequency',
      documentationPhrase: 'Frequency: {value} per 24 hours',
    },

    // ── Severity ──
    {
      id: 'q_dehydration_signs',
      text: 'Do you have any signs of dehydration (dry mouth, excessive thirst, reduced urine)?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have dry mouth, sunken eyes, or reduced urine?' },
      ],
      type: 'chips',
      chips: ['No signs', 'Mild — dry mouth, thirsty', 'Moderate — sunken eyes, reduced urine', 'Severe — lethargic, no urine'],
      required: true,
      importance: 3,
      reasoningWeight: 35,
      factKey: 'diarrhea_dehydration',
      documentationPhrase: 'Dehydration: {value}',
    },
    {
      id: 'q_severity_assessment',
      text: 'How would you describe the overall severity of the diarrhea?',
      alternatives: [],
      type: 'chips',
      chips: ['Mild — not interfering with daily life', 'Moderate — limiting activities', 'Severe — unable to function, need IV fluids'],
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'diarrhea_severity',
      documentationPhrase: 'Overall severity: {value}',
    },

    // ── Associated Symptoms ──
    {
      id: 'q_abdominal_pain',
      text: 'Do you have any abdominal pain or cramps?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have tummy pain?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 15,
      factKey: 'diarrhea_abdominal_pain',
      documentationPhrase: 'Associated abdominal pain',
    },
    {
      id: 'q_fever',
      text: 'Do you have a fever?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have a fever?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'diarrhea_fever',
      documentationPhrase: 'Associated with fever',
    },
    {
      id: 'q_vomiting',
      text: 'Do you have any vomiting?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child vomit?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'diarrhea_vomiting',
      documentationPhrase: 'Associated with vomiting',
    },

    // ── Exposure ──
    {
      id: 'q_recent_food',
      text: 'Have you eaten any potentially contaminated food or water recently?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Has the child eaten anything that could have been bad?' },
      ],
      type: 'boolean',
      required: false,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'diarrhea_recent_food',
      documentationPhrase: 'Suspected food/water exposure',
    },
    {
      id: 'q_sick_contact',
      text: 'Has anyone in your household had similar diarrhea?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Has anyone at home had diarrhea too?' },
      ],
      type: 'boolean',
      required: false,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'diarrhea_sick_contact',
      documentationPhrase: 'Household contact with similar illness',
    },
    {
      id: 'q_antibiotics',
      text: 'Have you taken antibiotics recently?',
      alternatives: [],
      type: 'boolean',
      required: false,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'diarrhea_antibiotics',
      documentationPhrase: 'Recent antibiotic use',
    },

    // ── Previous Episodes ──
    {
      id: 'q_previous_episodes',
      text: 'Have you had similar diarrhea episodes before?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Has the child had diarrhea like this before?' },
      ],
      type: 'boolean',
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'diarrhea_previous_episodes',
      documentationPhrase: 'Previous similar episodes',
    },

    // ── Pediatric ──
    {
      id: 'q_ped_feeding',
      text: 'How is the child feeding?',
      alternatives: [],
      type: 'chips',
      chips: ['Breastfeeding well', 'Breastfeeding poorly', 'Refusing feeds', 'Vomiting after feeds'],
      required: false,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'diarrhea_ped_feeding',
      documentationPhrase: 'Feeding status: {value}',
    },
    {
      id: 'q_ped_urine',
      text: 'Has the child passed urine in the last 6 hours?',
      alternatives: [],
      type: 'boolean',
      required: true,
      importance: 3,
      reasoningWeight: 30,
      factKey: 'diarrhea_ped_urine',
      documentationPhrase: 'Urine output in last 6 hours',
    },
    {
      id: 'q_ped_thirst',
      text: 'Is the child drinking eagerly or abnormally thirsty?',
      alternatives: [],
      type: 'boolean',
      required: false,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'diarrhea_ped_thirst',
      documentationPhrase: 'Thirst: drinks eagerly',
    },

    // ── Red Flags ──
    {
      id: 'q_bloody_stool',
      text: 'Is there blood in the stool?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Is there blood in the child\'s stool?' },
      ],
      type: 'boolean',
      required: true,
      importance: 3,
      reasoningWeight: 40,
      factKey: 'diarrhea_bloody',
      documentationPhrase: 'Blood in stool',
    },
    {
      id: 'q_severe_dehydration',
      text: 'Does the patient appear very weak, lethargic, or unconscious?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child appear weak, lethargic, or difficult to wake?' },
      ],
      type: 'boolean',
      required: true,
      importance: 3,
      reasoningWeight: 45,
      factKey: 'diarrhea_severe_dehydration',
      documentationPhrase: 'Severe dehydration / lethargy',
    },
  ],

  contextAdapters: {
    pediatric: {
      label: 'Pediatric Diarrhea Extension (IMCI)',
      additionalObjectives: [],
      additionalQuestions: [
        {
          id: 'q_ped_sunken_eyes',
          text: 'Does the child have sunken eyes?',
          alternatives: [],
          type: 'boolean',
          required: true,
          importance: 3,
          reasoningWeight: 30,
          factKey: 'diarrhea_ped_sunken_eyes',
          documentationPhrase: 'Sunken eyes present',
        },
        {
          id: 'q_ped_skin_pinch',
          text: 'Does the child\'s skin pinch go back very slowly?',
          alternatives: [],
          type: 'boolean',
          required: true,
          importance: 3,
          reasoningWeight: 30,
          factKey: 'diarrhea_ped_skin_pinch',
          documentationPhrase: 'Slow skin pinch return',
        },
      ],
      suppressedQuestionIds: ['q_antibiotics'],
      modifiedQuestions: [
        { id: 'q_dehydration_signs', text: 'IMCI Dehydration Classification: Any signs of dehydration?' },
      ],
    },
    neonatal: {
      label: 'Neonatal Diarrhea Extension',
      additionalObjectives: [],
      additionalQuestions: [
        {
          id: 'q_neonatal_weight',
          text: 'Has the baby lost weight since birth?',
          alternatives: [],
          type: 'boolean',
          required: true,
          importance: 3,
          reasoningWeight: 30,
          factKey: 'diarrhea_neonatal_weight_loss',
          documentationPhrase: 'Neonatal weight loss',
        },
        {
          id: 'q_neonatal_fontanelle',
          text: 'Is the anterior fontanelle sunken?',
          alternatives: [],
          type: 'boolean',
          required: true,
          importance: 3,
          reasoningWeight: 30,
          factKey: 'diarrhea_neonatal_fontanelle',
          documentationPhrase: 'Sunken fontanelle',
        },
      ],
      suppressedQuestionIds: ['q_antibiotics', 'q_recent_food', 'q_previous_episodes'],
      modifiedQuestions: [
        { id: 'q_consistency', text: 'What does the baby\'s stool look like?' },
        { id: 'q_frequency', text: 'How many loose stools has the baby passed today?' },
      ],
    },
  },

  factExtraction: [
    { questionId: 'q_consistency', extract: (a) => [{ key: 'diarrhea_consistency', value: String(a), type: 'reported', questionId: 'q_consistency', documentationPhrase: 'Stool consistency: ' + a }] },
    { questionId: 'q_onset', extract: (a) => [{ key: 'diarrhea_onset', value: String(a), type: 'reported', questionId: 'q_onset', documentationPhrase: 'Started ' + a + ' ago' }] },
    { questionId: 'q_duration', extract: (a) => [{ key: 'diarrhea_duration', value: String(a), type: 'reported', questionId: 'q_duration', documentationPhrase: 'Duration: ' + a }] },
    { questionId: 'q_frequency', extract: (a) => [{ key: 'diarrhea_frequency', value: String(a), type: 'reported', questionId: 'q_frequency', documentationPhrase: 'Frequency: ' + a + ' per 24 hours' }] },
    { questionId: 'q_dehydration_signs', extract: (a) => [{ key: 'diarrhea_dehydration', value: String(a), type: 'reported', questionId: 'q_dehydration_signs', documentationPhrase: 'Dehydration: ' + a }] },
    { questionId: 'q_severity_assessment', extract: (a) => [{ key: 'diarrhea_severity', value: String(a), type: 'reported', questionId: 'q_severity_assessment', documentationPhrase: 'Severity: ' + a }] },
    { questionId: 'q_abdominal_pain', extract: (a) => a ? [{ key: 'diarrhea_abdominal_pain', value: true, type: 'reported', questionId: 'q_abdominal_pain', documentationPhrase: 'Associated abdominal pain' }] : [] },
    { questionId: 'q_fever', extract: (a) => a ? [{ key: 'diarrhea_fever', value: true, type: 'reported', questionId: 'q_fever', documentationPhrase: 'Associated with fever' }] : [] },
    { questionId: 'q_vomiting', extract: (a) => a ? [{ key: 'diarrhea_vomiting', value: true, type: 'reported', questionId: 'q_vomiting', documentationPhrase: 'Associated with vomiting' }] : [] },
    { questionId: 'q_bloody_stool', extract: (a) => a ? [{ key: 'diarrhea_bloody', value: true, type: 'reported', questionId: 'q_bloody_stool', documentationPhrase: 'Blood in stool' }] : [] },
    { questionId: 'q_severe_dehydration', extract: (a) => a ? [{ key: 'diarrhea_severe_dehydration', value: true, type: 'reported', questionId: 'q_severe_dehydration', documentationPhrase: 'Severe dehydration / lethargy' }] : [] },
    { questionId: 'q_sick_contact', extract: (a) => a ? [{ key: 'diarrhea_sick_contact', value: true, type: 'reported', questionId: 'q_sick_contact', documentationPhrase: 'Household contact with similar illness' }] : [] },
    { questionId: 'q_antibiotics', extract: (a) => a ? [{ key: 'diarrhea_antibiotics', value: true, type: 'reported', questionId: 'q_antibiotics', documentationPhrase: 'Recent antibiotic use' }] : [] },
    { questionId: 'q_recent_food', extract: (a) => a ? [{ key: 'diarrhea_recent_food', value: true, type: 'reported', questionId: 'q_recent_food', documentationPhrase: 'Suspected food/water exposure' }] : [] },
    { questionId: 'q_previous_episodes', extract: (a) => a ? [{ key: 'diarrhea_previous_episodes', value: true, type: 'reported', questionId: 'q_previous_episodes', documentationPhrase: 'Previous similar episodes' }] : [] },
  ],

  relationships: [
    { targetSymptomId: 'SX000001', type: 'associated_with', strength: 0.6, description: 'Commonly associated with fever in gastroenteritis' },
    { targetSymptomId: 'SX000004', type: 'associated_with', strength: 0.7, description: 'Commonly associated with vomiting (gastroenteritis)' },
    { targetSymptomId: 'SX000007', type: 'associated_with', strength: 0.5, description: 'May be associated with abdominal pain' },
    { targetSymptomId: 'SX000003', type: 'associated_with', strength: 0.3, description: 'May be associated with body aches' },
  ],

  phenotypes: [
    {
      id: 'phen_diarrhea_acute_watery',
      label: 'Acute Watery Diarrhea Phenotype',
      description: 'Acute onset watery stools with or without dehydration',
      criteria: [
        { factKey: 'diarrhea_consistency', operator: 'contains', value: 'Watery' },
        { factKey: 'diarrhea_duration', operator: 'contains', value: 'acute' },
      ],
      probability: 0.6,
      suggestsMechanisms: ['Enterotoxin-mediated secretion', 'Viral enteritis', 'Decreased colonic absorption'],
      suggestsDifferentials: ['Viral gastroenteritis', 'Cholera', 'Enterotoxigenic E. coli'],
      emergencyWeight: 30,
    },
    {
      id: 'phen_diarrhea_dysentery',
      label: 'Dysentery Phenotype',
      description: 'Bloody stool with abdominal cramps, fever, tenesmus',
      criteria: [
        { factKey: 'diarrhea_bloody', operator: 'eq', value: true },
        { factKey: 'diarrhea_consistency', operator: 'contains', value: 'Bloody' },
      ],
      probability: 0.5,
      suggestsMechanisms: ['Mucosal invasion and inflammation', 'Colonic epithelial damage', 'Inflammatory diarrhea'],
      suggestsDifferentials: ['Shigellosis', 'Campylobacter enteritis', 'Entamoeba histolytica', 'Salmonellosis'],
      emergencyWeight: 50,
    },
    {
      id: 'phen_diarrhea_persistent',
      label: 'Persistent Diarrhea Phenotype',
      description: 'Diarrhea lasting 7-13 days, often with malnutrition',
      criteria: [
        { factKey: 'diarrhea_duration', operator: 'contains', value: 'persistent' },
      ],
      probability: 0.4,
      suggestsMechanisms: ['Persistent enteric infection', 'Post-infectious enteropathy', 'Secondary disaccharidase deficiency'],
      suggestsDifferentials: ['Persistent gastroenteritis', 'Giardiasis', 'Tropical sprue', 'Celiac disease'],
      emergencyWeight: 40,
    },
    {
      id: 'phen_diarrhea_cholera',
      label: 'Cholera-Like Phenotype',
      description: 'Profuse rice-watery stools with rapid dehydration',
      criteria: [
        { factKey: 'diarrhea_consistency', operator: 'contains', value: 'Rice-watery' },
        { factKey: 'diarrhea_volume', operator: 'contains', value: 'Large' },
      ],
      probability: 0.4,
      suggestsMechanisms: ['Cholera toxin-mediated cAMP activation', 'Massive intestinal fluid secretion', 'Rapid electrolyte depletion'],
      suggestsDifferentials: ['Cholera', 'Enterotoxigenic E. coli', 'Vibrio parahaemolyticus'],
      emergencyWeight: 80,
    },
  ],

  documentation: [
    { id: 'doc_consistency', condition: { factKey: 'diarrhea_consistency', operator: 'present' }, template: 'Stool consistency: {{diarrhea_consistency}}.', priority: 1 },
    { id: 'doc_duration', condition: { factKey: 'diarrhea_duration', operator: 'present' }, template: 'Duration: {{diarrhea_duration}}.', priority: 1 },
    { id: 'doc_frequency', condition: { factKey: 'diarrhea_frequency', operator: 'present' }, template: 'Frequency: {{diarrhea_frequency}} per 24 hours.', priority: 1 },
    { id: 'doc_dehydration', condition: { factKey: 'diarrhea_dehydration', operator: 'present' }, template: 'Dehydration: {{diarrhea_dehydration}}.', priority: 1 },
    { id: 'doc_bloody', condition: { factKey: 'diarrhea_bloody', operator: 'eq', value: true }, template: 'BLOOD IN STOOL — dysentery suspected.', priority: 1 },
    { id: 'doc_severe_dehydration', condition: { factKey: 'diarrhea_severe_dehydration', operator: 'eq', value: true }, template: 'SEVERE DEHYDRATION — urgent IV fluids.', priority: 1 },
    { id: 'doc_fever', condition: { factKey: 'diarrhea_fever', operator: 'eq', value: true }, template: 'Associated with fever.', priority: 2 },
    { id: 'doc_vomiting', condition: { factKey: 'diarrhea_vomiting', operator: 'eq', value: true }, template: 'Associated with vomiting.', priority: 2 },
    { id: 'doc_abdominal_pain', condition: { factKey: 'diarrhea_abdominal_pain', operator: 'eq', value: true }, template: 'Associated abdominal pain.', priority: 2 },
    { id: 'doc_exposure', condition: { factKey: 'diarrhea_sick_contact', operator: 'eq', value: true }, template: 'Household contact with similar illness.', priority: 2 },
  ],

  reasoningHooks: [
    {
      id: 'rh_bloody_stool',
      trigger: { on: 'fact_captured', ref: 'diarrhea_bloody' },
      action: 'flag_red_flag',
      payload: ['Bloody stool — stool culture, consider antibiotics for dysentery, assess for HUS risk'],
    },
    {
      id: 'rh_severe_dehydration',
      trigger: { on: 'fact_captured', ref: 'diarrhea_severe_dehydration' },
      action: 'flag_red_flag',
      payload: ['Severe dehydration with diarrhea — IV fluids, hospital admission, monitor UOP and electrolytes'],
    },
    {
      id: 'rh_cholera_suspicion',
      trigger: { on: 'fact_captured', ref: 'diarrhea_consistency' },
      action: 'suggest_investigations',
      payload: ['Rice-watery stools with rapid dehydration — stool culture for Vibrio cholerae, rapid rehydration'],
    },
    {
      id: 'rh_antibiotic_diarrhea',
      trigger: { on: 'fact_captured', ref: 'diarrhea_antibiotics' },
      action: 'suggest_differentials',
      payload: ['Recent antibiotic use — consider C. difficile infection, stool PCR'],
    },
  ],

  completion: {
    objectives: [
      { objectiveId: 'obj_char', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_timeline', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_severity', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_associated', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_exposure', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_previous', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_pediatric', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_red_flags', status: 'not_started', answeredQuestions: [], percentage: 0 },
    ],
    overall: 0,
  },
};
