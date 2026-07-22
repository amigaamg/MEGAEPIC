// ═══════════════════════════════════════════════════════════════════════════════
// Body Aches Symptom Node — SX000003
// Sources: Hutchison Clinical Methods 25e, WHO IMCI, ACR Fibromyalgia Criteria
// Universal Core + Pediatric + Obstetric adapters
// ═══════════════════════════════════════════════════════════════════════════════

import type { SymptomNode } from '../symptom-types';

export const BODY_ACHES_NODE: SymptomNode = {
  identity: {
    id: 'SX000003',
    canonicalName: 'Body Aches',
    synonyms: ['Myalgia', 'Muscle pain', 'General body pain'],
    layTerms: ['Body pains', 'Aching all over', 'Muscle soreness'],
    translations: {},
    snomed: '68962001',
    icd10: 'M79.1',
    umls: 'C0231528',
    bodySystem: 'Musculoskeletal',
    primarySpecialty: 'General Medicine',
    emergencyWeight: 2,
  },

  metadata: {
    version: '1.0.0',
    author: 'AMEXAN Clinical Constitution',
    evidenceLevel: 'consensus',
    lastUpdated: '2026-07-13',
    source: 'Hutchison Clinical Methods 25e, WHO IMCI guidelines, ACR Fibromyalgia diagnostic criteria',
  },

  activation: {
    chiefComplaint: true,
    hpiMention: true,
    ros: true,
    referralLetter: true,
    voiceTranscription: true,
    keywords: ['body ache', 'muscle pain', 'myalgia', 'body pain', 'aching', 'soreness', 'general body pain'],
  },

  timeline: {
    allowed: ['acute', 'subacute', 'chronic', 'recurrent', 'unknown'],
    defaultCategory: 'acute',
  },

  objectives: [
    { id: 'obj_char', label: 'Characterization', description: 'Establish location and distribution of body aches', order: 1, required: true, questionIds: ['q_location', 'q_pattern'] },
    { id: 'obj_timeline', label: 'Timeline', description: 'Onset, duration, progression', order: 2, required: true, questionIds: ['q_onset', 'q_duration', 'q_progression'] },
    { id: 'obj_severity', label: 'Severity', description: 'Assess intensity and functional impact', order: 3, required: true, questionIds: ['q_severity', 'q_functional_impact'] },
    { id: 'obj_aggravating', label: 'Aggravating Factors', description: 'Identify triggers and relieving factors', order: 4, required: false, questionIds: ['q_aggravating', 'q_relieving'] },
    { id: 'obj_associated', label: 'Associated Symptoms', description: 'Identify accompanying systemic and musculoskeletal symptoms', order: 5, required: true, questionIds: ['q_fever', 'q_rash', 'q_joint_pain', 'q_weakness', 'q_headache'] },
    { id: 'obj_previous', label: 'Previous Episodes', description: 'History of similar episodes or chronic conditions', order: 6, required: false, questionIds: ['q_previous_episodes', 'q_chronic_pain_history'] },
    { id: 'obj_pediatric', label: 'Pediatric Assessment', description: 'Age-appropriate myalgia assessment', order: 7, required: false, questionIds: ['q_activity_tolerance'] },
    { id: 'obj_red_flags', label: 'Red Flags', description: 'Identify warning signs requiring urgent attention', order: 8, required: true, questionIds: ['q_severe_weakness', 'q_dark_urine', 'q_chest_ache'] },
  ],

  questions: [
    // ── Characterization ──
    {
      id: 'q_location',
      text: 'Where is the body pain located?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Where does it hurt?' },
      ],
      type: 'chips',
      chips: ['Generalized — all over', 'Localized to one area', 'Upper body only', 'Lower body only', 'Joints and muscles', 'Neck and shoulders', 'Lower back'],
      required: true,
      importance: 2,
      reasoningWeight: 25,
      factKey: 'body_aches_location',
      documentationPhrase: 'Body aches are {value} in distribution',
    },
    {
      id: 'q_pattern',
      text: 'How would you describe the pain?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'What does the pain feel like?' },
      ],
      type: 'chips',
      chips: ['Aching / dull', 'Sharp / stabbing', 'Burning', 'Cramping', 'Tender to touch', 'Constant ache'],
      required: true,
      importance: 1,
      reasoningWeight: 15,
      factKey: 'body_aches_pattern',
      documentationPhrase: 'Pain described as {value}',
    },

    // ── Timeline ──
    {
      id: 'q_onset',
      text: 'When did the body aches start?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'When did the pain start?' },
      ],
      type: 'chips',
      chips: ['Hours ago', '1-3 days ago', '4-7 days ago', '1-2 weeks ago', 'More than 2 weeks ago'],
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'body_aches_onset',
      documentationPhrase: 'Body aches started {value} ago',
    },
    {
      id: 'q_duration',
      text: 'How long has the pain lasted?',
      alternatives: [],
      type: 'chips',
      chips: ['Less than 1 week (acute)', '1-4 weeks (subacute)', 'More than 4 weeks (chronic)'],
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'body_aches_duration',
      documentationPhrase: 'Duration of body aches: {value}',
    },
    {
      id: 'q_progression',
      text: 'Are the aches getting better, worse, or staying the same?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Is the pain getting better or worse?' },
      ],
      type: 'chips',
      chips: ['Getting better', 'Getting worse', 'Staying the same', 'Comes and goes'],
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'body_aches_progression',
      documentationPhrase: 'Body aches are {value}',
    },

    // ── Severity ──
    {
      id: 'q_severity',
      text: 'How severe are the body aches on a scale of 0-10?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'How much does it hurt? Does it stop the child from playing?' },
      ],
      type: 'chips',
      chips: ['Mild (1-3) — noticeable but not limiting', 'Moderate (4-6) — interferes with daily activities', 'Severe (7-10) — unable to function'],
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'body_aches_severity',
      documentationPhrase: 'Severity of body aches: {value}',
    },
    {
      id: 'q_functional_impact',
      text: 'How do the body aches affect your daily activities?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Can the child still go to school and play?' },
      ],
      type: 'chips',
      chips: ['No limitation', 'Difficulty with daily tasks', 'Unable to work/go to school', 'Bedridden'],
      required: false,
      importance: 1,
      reasoningWeight: 15,
      factKey: 'body_aches_functional_impact',
      documentationPhrase: 'Functional impact: {value}',
    },

    // ── Aggravating / Relieving ──
    {
      id: 'q_aggravating',
      text: 'What makes the body aches worse?',
      alternatives: [],
      type: 'chips',
      chips: ['Movement / activity', 'Cold weather', 'At night', 'After meals', 'Stress', 'No aggravating factors'],
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'body_aches_aggravating',
      documentationPhrase: 'Aggravated by {value}',
    },
    {
      id: 'q_relieving',
      text: 'What makes the body aches better?',
      alternatives: [],
      type: 'chips',
      chips: ['Rest', 'Heat application', 'Pain medication', 'Massage', 'Nothing provides relief'],
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'body_aches_relieving',
      documentationPhrase: 'Relieved by {value}',
    },

    // ── Associated Symptoms ──
    {
      id: 'q_fever',
      text: 'Do you have a fever?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have a fever?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 25,
      factKey: 'body_aches_fever',
      documentationPhrase: 'Associated with fever',
    },
    {
      id: 'q_rash',
      text: 'Do you have any rash?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have a rash?' },
      ],
      type: 'boolean',
      required: false,
      importance: 1,
      reasoningWeight: 15,
      factKey: 'body_aches_rash',
      documentationPhrase: 'Associated with rash',
    },
    {
      id: 'q_joint_pain',
      text: 'Do you have any joint pain or swelling?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Are any joints swollen or painful?' },
      ],
      type: 'boolean',
      required: false,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'body_aches_joint_pain',
      documentationPhrase: 'Associated joint pain',
    },
    {
      id: 'q_weakness',
      text: 'Do you feel muscle weakness?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child seem weaker than usual?' },
      ],
      type: 'boolean',
      required: false,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'body_aches_weakness',
      documentationPhrase: 'Associated muscle weakness',
    },
    {
      id: 'q_headache',
      text: 'Do you have a headache?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have a headache?' },
      ],
      type: 'boolean',
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'body_aches_headache',
      documentationPhrase: 'Associated headache',
    },

    // ── Previous Episodes ──
    {
      id: 'q_previous_episodes',
      text: 'Have you had similar body aches before?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Has the child had similar aches before?' },
      ],
      type: 'boolean',
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'body_aches_previous_episodes',
      documentationPhrase: 'Previous similar episodes',
    },
    {
      id: 'q_chronic_pain_history',
      text: 'Do you have any chronic pain condition (fibromyalgia, chronic fatigue)?',
      alternatives: [],
      type: 'boolean',
      required: false,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'body_aches_chronic_pain',
      documentationPhrase: 'History of chronic pain condition',
    },

    // ── Pediatric ──
    {
      id: 'q_activity_tolerance',
      text: 'Can the child still play and participate in usual activities?',
      alternatives: [],
      type: 'chips',
      chips: ['Normal activity', 'Reduced activity', 'Refuses to walk', 'Refuses to move limbs'],
      required: false,
      importance: 2,
      reasoningWeight: 15,
      factKey: 'body_aches_activity_tolerance',
      documentationPhrase: 'Activity tolerance: {value}',
    },

    // ── Red Flags ──
    {
      id: 'q_severe_weakness',
      text: 'Do you have severe muscle weakness or difficulty standing up?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have trouble standing up from sitting?' },
      ],
      type: 'boolean',
      required: true,
      importance: 3,
      reasoningWeight: 40,
      factKey: 'body_aches_severe_weakness',
      documentationPhrase: 'Severe muscle weakness',
    },
    {
      id: 'q_dark_urine',
      text: 'Is your urine dark or tea-colored?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Is the child\'s urine dark?' },
      ],
      type: 'boolean',
      required: true,
      importance: 3,
      reasoningWeight: 45,
      factKey: 'body_aches_dark_urine',
      documentationPhrase: 'Dark or tea-colored urine',
    },
    {
      id: 'q_chest_ache',
      text: 'Do you have chest wall tenderness or difficulty breathing?',
      alternatives: [],
      type: 'boolean',
      required: true,
      importance: 3,
      reasoningWeight: 35,
      factKey: 'body_aches_chest_ache',
      documentationPhrase: 'Chest wall tenderness with body aches',
    },
  ],

  contextAdapters: {
    pediatric: {
      label: 'Pediatric Body Aches Extension',
      additionalObjectives: [],
      additionalQuestions: [
        {
          id: 'q_ped_limping',
          text: 'Is the child limping or refusing to bear weight?',
          alternatives: [],
          type: 'boolean',
          required: true,
          importance: 3,
          reasoningWeight: 35,
          factKey: 'body_aches_ped_limping',
          documentationPhrase: 'Limping or refusing to bear weight',
        },
        {
          id: 'q_ped_sick_contact',
          text: 'Has anyone in the family had similar symptoms?',
          alternatives: [],
          type: 'boolean',
          required: false,
          importance: 1,
          reasoningWeight: 10,
          factKey: 'body_aches_ped_sick_contact',
          documentationPhrase: 'Family contact with similar symptoms',
        },
      ],
      suppressedQuestionIds: ['q_chronic_pain_history'],
      modifiedQuestions: [
        { id: 'q_severity', text: 'How much is the child hurting? Does it stop play or sleep?' },
        { id: 'q_aggravating', text: 'Does anyone in the family have the same aches?' },
      ],
    },
    obstetric: {
      label: 'Obstetric Body Aches Extension',
      additionalObjectives: [],
      additionalQuestions: [
        {
          id: 'q_obs_gestational_age',
          text: 'At what gestational age are you?',
          alternatives: [],
          type: 'chips',
          chips: ['First trimester', 'Second trimester', 'Third trimester', 'Postpartum'],
          required: true,
          importance: 2,
          reasoningWeight: 15,
          factKey: 'body_aches_obs_gestational_age',
          documentationPhrase: 'Gestational age: {value}',
        },
        {
          id: 'q_obs_preterm_pain',
          text: 'Do you have any lower abdominal pain or contractions?',
          alternatives: [],
          type: 'boolean',
          required: true,
          importance: 3,
          reasoningWeight: 35,
          factKey: 'body_aches_obs_contractions',
          documentationPhrase: 'Lower abdominal pain or contractions present',
        },
      ],
      suppressedQuestionIds: [],
      modifiedQuestions: [
        { id: 'q_location', text: 'Where is the body pain located? (especially any pelvic or low back pain)' },
      ],
    },
  },

  factExtraction: [
    { questionId: 'q_location', extract: (a) => [{ key: 'body_aches_location', value: String(a), type: 'reported', questionId: 'q_location', documentationPhrase: 'Body aches are ' + a + ' in distribution' }] },
    { questionId: 'q_pattern', extract: (a) => [{ key: 'body_aches_pattern', value: String(a), type: 'reported', questionId: 'q_pattern', documentationPhrase: 'Pain described as ' + a }] },
    { questionId: 'q_onset', extract: (a) => [{ key: 'body_aches_onset', value: String(a), type: 'reported', questionId: 'q_onset', documentationPhrase: 'Started ' + a + ' ago' }] },
    { questionId: 'q_duration', extract: (a) => [{ key: 'body_aches_duration', value: String(a), type: 'reported', questionId: 'q_duration', documentationPhrase: 'Duration: ' + a }] },
    { questionId: 'q_severity', extract: (a) => [{ key: 'body_aches_severity', value: String(a), type: 'reported', questionId: 'q_severity', documentationPhrase: 'Severity: ' + a }] },
    { questionId: 'q_fever', extract: (a) => a ? [{ key: 'body_aches_fever', value: true, type: 'reported', questionId: 'q_fever', documentationPhrase: 'Associated with fever' }] : [] },
    { questionId: 'q_rash', extract: (a) => a ? [{ key: 'body_aches_rash', value: true, type: 'reported', questionId: 'q_rash', documentationPhrase: 'Associated with rash' }] : [] },
    { questionId: 'q_joint_pain', extract: (a) => a ? [{ key: 'body_aches_joint_pain', value: true, type: 'reported', questionId: 'q_joint_pain', documentationPhrase: 'Associated joint pain' }] : [] },
    { questionId: 'q_weakness', extract: (a) => a ? [{ key: 'body_aches_weakness', value: true, type: 'reported', questionId: 'q_weakness', documentationPhrase: 'Associated muscle weakness' }] : [] },
    { questionId: 'q_dark_urine', extract: (a) => a ? [{ key: 'body_aches_dark_urine', value: true, type: 'reported', questionId: 'q_dark_urine', documentationPhrase: 'Dark or tea-colored urine' }] : [] },
    { questionId: 'q_severe_weakness', extract: (a) => a ? [{ key: 'body_aches_severe_weakness', value: true, type: 'reported', questionId: 'q_severe_weakness', documentationPhrase: 'Severe muscle weakness' }] : [] },
    { questionId: 'q_functional_impact', extract: (a) => [{ key: 'body_aches_functional_impact', value: String(a), type: 'reported', questionId: 'q_functional_impact', documentationPhrase: 'Functional impact: ' + a }] },
    { questionId: 'q_progression', extract: (a) => [{ key: 'body_aches_progression', value: String(a), type: 'reported', questionId: 'q_progression', documentationPhrase: 'Body aches are ' + a }] },
    { questionId: 'q_previous_episodes', extract: (a) => a ? [{ key: 'body_aches_previous_episodes', value: true, type: 'reported', questionId: 'q_previous_episodes', documentationPhrase: 'Previous similar episodes' }] : [] },
    { questionId: 'q_headache', extract: (a) => a ? [{ key: 'body_aches_headache', value: true, type: 'reported', questionId: 'q_headache', documentationPhrase: 'Associated headache' }] : [] },
  ],

  relationships: [
    { targetSymptomId: 'SX000001', type: 'associated_with', strength: 0.8, description: 'Commonly associated with fever (viral myalgia)' },
    { targetSymptomId: 'SX000002', type: 'associated_with', strength: 0.4, description: 'May be associated with headache' },
    { targetSymptomId: 'SX000004', type: 'associated_with', strength: 0.3, description: 'May be associated with vomiting' },
  ],

  phenotypes: [
    {
      id: 'phen_myalgia_viral',
      label: 'Viral Myalgia Phenotype',
      description: 'Acute generalized body aches with fever, acute onset, self-limited',
      criteria: [
        { factKey: 'body_aches_location', operator: 'contains', value: 'Generalized' },
        { factKey: 'body_aches_fever', operator: 'eq', value: true },
        { factKey: 'body_aches_duration', operator: 'contains', value: 'acute' },
      ],
      probability: 0.6,
      suggestsMechanisms: ['Systemic viral infection', 'Cytokine-mediated myalgia', 'Prostaglandin release'],
      suggestsDifferentials: ['Influenza', 'COVID-19', 'Dengue fever', 'Acute viral syndrome'],
      emergencyWeight: 20,
    },
    {
      id: 'phen_myalgia_fibromyalgia',
      label: 'Fibromyalgia Phenotype',
      description: 'Chronic widespread pain with tender points, fatigue, sleep disturbance',
      criteria: [
        { factKey: 'body_aches_duration', operator: 'contains', value: 'chronic' },
        { factKey: 'body_aches_location', operator: 'contains', value: 'Generalized' },
      ],
      probability: 0.4,
      suggestsMechanisms: ['Central sensitization', 'Altered pain processing', 'Neurotransmitter dysregulation'],
      suggestsDifferentials: ['Fibromyalgia', 'Chronic fatigue syndrome', 'Central sensitivity syndrome'],
      emergencyWeight: 10,
    },
    {
      id: 'phen_myalgia_polymyositis',
      label: 'Polymyositis Phenotype',
      description: 'Proximal muscle weakness with myalgia, elevated muscle enzymes',
      criteria: [
        { factKey: 'body_aches_weakness', operator: 'eq', value: true },
        { factKey: 'body_aches_location', operator: 'contains', value: 'Generalized' },
      ],
      probability: 0.2,
      suggestsMechanisms: ['Autoimmune muscle inflammation', 'T-cell mediated myotoxicity', 'Proximal muscle fiber necrosis'],
      suggestsDifferentials: ['Polymyositis', 'Dermatomyositis', 'Inclusion body myositis'],
      emergencyWeight: 50,
    },
    {
      id: 'phen_myalgia_drug_induced',
      label: 'Drug-Induced Myalgia Phenotype',
      description: 'Myalgia associated with medication use (statins, ACE inhibitors, etc.)',
      criteria: [
        { factKey: 'body_aches_chronic_pain', operator: 'eq', value: false },
        { factKey: 'body_aches_duration', operator: 'contains', value: 'acute' },
      ],
      probability: 0.3,
      suggestsMechanisms: ['Mitochondrial toxicity', 'Coenzyme Q10 depletion', 'Drug-induced muscle inflammation'],
      suggestsDifferentials: ['Statin-induced myopathy', 'ACE inhibitor myalgia', 'Corticosteroid withdrawal myalgia'],
      emergencyWeight: 25,
    },
  ],

  documentation: [
    { id: 'doc_location', condition: { factKey: 'body_aches_location', operator: 'present' }, template: 'Body aches are {{body_aches_location}} in distribution.', priority: 1 },
    { id: 'doc_duration', condition: { factKey: 'body_aches_duration', operator: 'present' }, template: 'Duration of body aches: {{body_aches_duration}}.', priority: 1 },
    { id: 'doc_severity', condition: { factKey: 'body_aches_severity', operator: 'present' }, template: 'Severity: {{body_aches_severity}}.', priority: 1 },
    { id: 'doc_fever', condition: { factKey: 'body_aches_fever', operator: 'eq', value: true }, template: 'Associated with fever.', priority: 2 },
    { id: 'doc_rash', condition: { factKey: 'body_aches_rash', operator: 'eq', value: true }, template: 'Associated with rash.', priority: 2 },
    { id: 'doc_joint_pain', condition: { factKey: 'body_aches_joint_pain', operator: 'eq', value: true }, template: 'Associated joint pain.', priority: 2 },
    { id: 'doc_weakness', condition: { factKey: 'body_aches_weakness', operator: 'eq', value: true }, template: 'Associated muscle weakness.', priority: 2 },
    { id: 'doc_dark_urine', condition: { factKey: 'body_aches_dark_urine', operator: 'eq', value: true }, template: 'DARK URINE — rhabdomyolysis suspected.', priority: 1 },
    { id: 'doc_severe_weakness', condition: { factKey: 'body_aches_severe_weakness', operator: 'eq', value: true }, template: 'Severe muscle weakness — investigate for myositis.', priority: 1 },
    { id: 'doc_functional', condition: { factKey: 'body_aches_functional_impact', operator: 'present' }, template: 'Functional impact: {{body_aches_functional_impact}}.', priority: 2 },
  ],

  reasoningHooks: [
    {
      id: 'rh_dark_urine',
      trigger: { on: 'fact_captured', ref: 'body_aches_dark_urine' },
      action: 'flag_red_flag',
      payload: ['Dark urine with myalgia — suspect rhabdomyolysis, check CK, renal function, urine myoglobin'],
    },
    {
      id: 'rh_severe_weakness',
      trigger: { on: 'fact_captured', ref: 'body_aches_severe_weakness' },
      action: 'flag_red_flag',
      payload: ['Severe muscle weakness with myalgia — investigate for polymyositis, check muscle enzymes, EMG'],
    },
    {
      id: 'rh_fever_myalgia',
      trigger: { on: 'fact_captured', ref: 'body_aches_fever' },
      action: 'suggest_differentials',
      payload: ['Fever with myalgia — consider influenza, dengue, COVID-19, acute viral syndrome'],
    },
    {
      id: 'rh_chronic_pain',
      trigger: { on: 'fact_captured', ref: 'body_aches_chronic_pain' },
      action: 'suggest_differentials',
      payload: ['Chronic widespread pain — consider fibromyalgia, chronic fatigue syndrome, central sensitization'],
    },
  ],

  completion: {
    objectives: [
      { objectiveId: 'obj_char', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_timeline', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_severity', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_aggravating', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_associated', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_previous', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_pediatric', status: 'not_started', answeredQuestions: [], percentage: 0 },
      { objectiveId: 'obj_red_flags', status: 'not_started', answeredQuestions: [], percentage: 0 },
    ],
    overall: 0,
  },
};
