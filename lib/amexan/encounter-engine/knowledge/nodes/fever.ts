// ═══════════════════════════════════════════════════════════════════════════════
// Fever Symptom Node — SX000001
// Sources: Hutchison Clinical Methods 25th Edition, WHO IMCI Guidelines
// Universal Core + Pediatric + Neonatal + Obstetric + Emergency adapters
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  SymptomNode, StructuredFact, AssessmentContext, FactExtractionRule,
  ClinicalObjectiveGroup,
} from '../symptom-types';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function makeExtract(
  questionId: string,
  factKey: string,
  phrase: string
): FactExtractionRule {
  return {
    questionId,
    extract: (answer: any, _ctx: AssessmentContext): StructuredFact[] => {
      if (answer === undefined || answer === null || answer === '') return [];
      return [{
        key: factKey,
        value: typeof answer === 'string' ? answer : String(answer),
        type: 'reported',
        questionId,
        documentationPhrase: phrase,
      }];
    },
  };
}

function makeBooleanExtract(
  questionId: string,
  factKey: string,
  phraseIfYes: string,
  phraseIfNo: string
): FactExtractionRule {
  return {
    questionId,
    extract: (answer: any): StructuredFact[] => {
      if (answer === undefined || answer === null) return [];
      const isYes = answer === true || answer === 'yes' || answer === 'Yes';
      return [{
        key: factKey,
        value: isYes,
        type: 'reported',
        questionId,
        documentationPhrase: isYes ? phraseIfYes : phraseIfNo,
      }];
    },
  };
}

// ─── THE FEVER SYMPTOM NODE ──────────────────────────────────────────────────
// Follows exact spec: Identity → Metadata → Activation → Timeline →
// Objectives → Questions (with alternatives) → Context Adapters →
// Fact Extraction → Relationships → Phenotypes → Documentation → Reasoning → Completion

const FEVER_NODE_OBJECTIVES: ClinicalObjectiveGroup[] = [
  { id: 'obj_char', label: 'Characterization', description: 'Establish presence and nature of fever', order: 1, required: true, questionIds: ['q_temp_measured', 'q_feels_hot'] },
  { id: 'obj_timeline', label: 'Timeline', description: 'Establish onset, duration, temporal evolution', order: 2, required: true, questionIds: ['q_onset', 'q_duration', 'q_pattern', 'q_progression'] },
  { id: 'obj_severity', label: 'Severity', description: 'Assess intensity and impact', order: 3, required: true, questionIds: ['q_severity', 'q_rigors', 'q_night_sweats'] },
  { id: 'obj_source', label: 'Source Localization', description: 'Identify potential source of fever', order: 4, required: true, questionIds: ['q_cough', 'q_dysuria', 'q_diarrhea', 'q_headache', 'q_rash', 'q_joint_pain', 'q_sore_throat', 'q_ear_pain', 'q_wound', 'q_neck_stiffness'] },
  { id: 'obj_exposure', label: 'Exposure', description: 'Identify epidemiological risk factors', order: 5, required: false, questionIds: ['q_travel', 'q_mosquito', 'q_tb_contact', 'q_sick_contact', 'q_unsafe_water'] },
  { id: 'obj_functional', label: 'Functional Impact', description: 'Assess effect on daily function', order: 6, required: false, questionIds: ['q_functional_impact'] },
  { id: 'obj_previous', label: 'Previous Episodes', description: 'History of similar episodes', order: 7, required: false, questionIds: ['q_previous_episodes', 'q_previous_treatment'] },
  { id: 'obj_complications', label: 'Complications', description: 'Identify fever-related complications', order: 8, required: false, questionIds: ['q_seizure', 'q_confusion', 'q_dehydration'] },
  { id: 'obj_negatives', label: 'Important Negatives', description: 'Document pertinent negatives', order: 9, required: false, questionIds: ['q_bleeding', 'q_shortness_breath', 'q_chest_pain'] },
  { id: 'obj_pediatric', label: 'Pediatric Assessment', description: 'Age-appropriate fever assessment', order: 10, required: false, questionIds: ['q_immunization', 'q_feeding', 'q_crying_urine'] },
];

export const FEVER_NODE: SymptomNode = {
  // ═════════════════════════════════════════════════════════════════════════
  // IDENTITY
  // ═════════════════════════════════════════════════════════════════════════
  identity: {
    id: 'SX000001',
    canonicalName: 'Fever',
    synonyms: ['Pyrexia', 'Hyperthermia', 'Elevated temperature', 'Febrile illness'],
    layTerms: ['Hotness of body', 'Feeling hot', 'High temperature', 'Hot body', 'Burning up'],
    translations: {
      sw: 'Homa',
      lu: 'Ooho',
      mer: 'Mwiru',
      kis: 'Eerori',
    },
    snomed: '386661006',
    icd10: 'R50.9',
    umls: 'C0015967',
    bodySystem: 'General',
    primarySpecialty: 'General Medicine',
    emergencyWeight: 3,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // METADATA
  // ═════════════════════════════════════════════════════════════════════════
  metadata: {
    version: '1.0.0',
    author: 'AMEXAN Clinical Constitution',
    evidenceLevel: 'consensus',
    lastUpdated: '2026-07-01',
    source: 'Hutchison Clinical Methods 25th Edition, WHO IMCI Guidelines',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ACTIVATION RULES
  // ═════════════════════════════════════════════════════════════════════════
  activation: {
    chiefComplaint: true,
    hpiMention: true,
    ros: true,
    referralLetter: true,
    voiceTranscription: true,
    keywords: [
      'fever', 'hot', 'homa', 'temperature', 'pyrexia', 'febrile',
      'feverish', 'high temperature', 'chills', 'feverous',
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // TIMELINE RULES
  // ═════════════════════════════════════════════════════════════════════════
  timeline: {
    allowed: ['acute', 'subacute', 'chronic', 'recurrent', 'relapsing', 'unknown'],
    defaultCategory: 'acute',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // OBJECTIVE GROUPS
  // These are the clinical goals that must be satisfied — NOT questions.
  // ═════════════════════════════════════════════════════════════════════════
  objectives: FEVER_NODE_OBJECTIVES,

  // ═════════════════════════════════════════════════════════════════════════
  // QUESTIONS with age/context alternatives
  // ═════════════════════════════════════════════════════════════════════════
  questions: [
    // ── Characterization ──
    {
      id: 'q_temp_measured',
      text: 'Have you measured the temperature?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Have you checked the child\'s temperature?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'fever_temp_measured',
      documentationPhrase: 'Temperature was measured',
    },
    {
      id: 'q_feels_hot',
      text: 'Do you feel hot to touch?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child feel hot to touch?' },
        { condition: { ageMax: 1 }, text: 'Does the baby feel hot?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 15,
      factKey: 'fever_feels_hot',
      documentationPhrase: 'Patient feels hot to touch',
    },

    // ── Timeline ──
    {
      id: 'q_onset',
      text: 'How did the fever start?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'How did the fever start? (Did it come on suddenly or slowly?)' },
      ],
      type: 'chips',
      chips: ['Suddenly', 'Gradually', 'Not sure'],
      required: true,
      importance: 2,
      reasoningWeight: 15,
      factKey: 'fever_onset',
      documentationPhrase: 'Fever started {value}',
    },
    {
      id: 'q_duration',
      text: 'How long have you had the fever?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'How long has the child had fever?' },
        { condition: { ageMax: 1 }, text: 'How long has the baby had fever?' },
      ],
      type: 'chips',
      chips: ['<24 hours', '1-3 days', '4-7 days', '1-2 weeks', '>2 weeks'],
      required: true,
      importance: 3,
      reasoningWeight: 25,
      factKey: 'fever_duration',
      documentationPhrase: 'Fever present for {value}',
    },
    {
      id: 'q_pattern',
      text: 'How does the fever behave?',
      alternatives: [],
      type: 'chips',
      chips: ['Continuous (always present)', 'Intermittent (comes and goes)', 'Remittent (fluctuates)', 'Relapsing (days normal between)', 'Not sure'],
      required: false,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'fever_pattern',
      documentationPhrase: 'Fever pattern is {value}',
    },
    {
      id: 'q_progression',
      text: 'How has the fever changed since it started?',
      alternatives: [],
      type: 'chips',
      chips: ['Getting worse', 'Staying the same', 'Getting better', 'Comes and goes', 'Not sure'],
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'fever_progression',
      documentationPhrase: 'Fever is {value}',
    },

    // ── Severity ──
    {
      id: 'q_severity',
      text: 'How severe is the fever?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'How severe is the fever?' },
      ],
      type: 'chips',
      chips: ['Mild', 'Moderate', 'Severe', 'Very severe', 'Not sure'],
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'fever_severity',
      documentationPhrase: 'Fever is {value} in severity',
    },
    {
      id: 'q_rigors',
      text: 'Do you have shaking chills (rigors)?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Has the child been shaking/shivering?' },
        { condition: { ageMax: 1 }, text: 'Has the baby been shivering?' },
      ],
      type: 'boolean',
      required: true,
      importance: 3,
      reasoningWeight: 30,
      factKey: 'fever_rigors',
      documentationPhrase: 'Associated with rigors',
      triggers: ['q_rigors_details'],
    },
    {
      id: 'q_rigors_details',
      text: 'How many episodes of rigors?',
      alternatives: [],
      type: 'chips',
      chips: ['Once', 'Multiple times', 'Every time fever spikes'],
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'fever_rigors_frequency',
      documentationPhrase: 'Rigors occurred {value}',
      dependencies: ['q_rigors'],
    },
    {
      id: 'q_night_sweats',
      text: 'Do you have drenching night sweats?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child sweat heavily at night?' },
      ],
      type: 'boolean',
      required: false,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'fever_night_sweats',
      documentationPhrase: 'Associated with drenching night sweats',
    },

    // ── Source Localization (compact grid) ──
    {
      id: 'q_cough',
      text: 'Do you have a cough?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have a cough?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'fever_cough',
      documentationPhrase: 'Associated with cough',
    },
    {
      id: 'q_dysuria',
      text: 'Pain or burning when urinating?',
      alternatives: [
        { condition: { ageMax: 5, ageMin: 0 }, text: 'Cries when passing urine?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'fever_dysuria',
      documentationPhrase: 'Associated with dysuria',
    },
    {
      id: 'q_diarrhea',
      text: 'Do you have diarrhea?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have diarrhea?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'fever_diarrhea',
      documentationPhrase: 'Associated with diarrhea',
    },
    {
      id: 'q_headache',
      text: 'Do you have a severe headache?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child complain of headache?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'fever_headache',
      documentationPhrase: 'Associated with severe headache',
    },
    {
      id: 'q_rash',
      text: 'Do you have any rash?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have a rash?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'fever_rash',
      documentationPhrase: 'Associated with rash',
    },
    {
      id: 'q_joint_pain',
      text: 'Do you have joint pains?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child complain of joint pains?' },
      ],
      type: 'boolean',
      required: true,
      importance: 1,
      reasoningWeight: 15,
      factKey: 'fever_joint_pain',
      documentationPhrase: 'Associated with joint pains',
    },
    {
      id: 'q_sore_throat',
      text: 'Do you have a sore throat?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have a sore throat?' },
      ],
      type: 'boolean',
      required: true,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'fever_sore_throat',
      documentationPhrase: 'Associated with sore throat',
    },
    {
      id: 'q_ear_pain',
      text: 'Ear pain or discharge?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child pull at the ears or have ear discharge?' },
      ],
      type: 'boolean',
      required: true,
      importance: 1,
      reasoningWeight: 15,
      factKey: 'fever_ear_pain',
      documentationPhrase: 'Associated with ear pain/discharge',
    },
    {
      id: 'q_wound',
      text: 'Any wound or skin infection?',
      alternatives: [],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'fever_wound',
      documentationPhrase: 'Associated with wound or skin infection',
    },
    {
      id: 'q_neck_stiffness',
      text: 'Do you have a stiff neck?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child have a stiff neck? (difficulty touching chin to chest)' },
      ],
      type: 'boolean',
      required: true,
      importance: 3,
      reasoningWeight: 40,
      factKey: 'fever_neck_stiffness',
      documentationPhrase: 'Associated with neck stiffness',
    },

    // ── Exposure ──
    {
      id: 'q_travel',
      text: 'Have you travelled recently?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Has the child travelled recently?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 20,
      factKey: 'fever_travel',
      documentationPhrase: 'Recent travel',
      triggers: ['q_travel_details'],
    },
    {
      id: 'q_travel_details',
      text: 'Where did you travel to?',
      alternatives: [],
      type: 'text',
      required: false,
      importance: 1,
      reasoningWeight: 5,
      factKey: 'fever_travel_destination',
      documentationPhrase: 'Travelled to {value}',
      dependencies: ['q_travel'],
    },
    {
      id: 'q_mosquito',
      text: 'Recent mosquito bites or not sleeping under a net?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Does the child sleep under a mosquito net?' },
        { condition: { ageMax: 1 }, text: 'Does the baby sleep under a mosquito net?' },
      ],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 25,
      factKey: 'fever_mosquito_exposure',
      documentationPhrase: 'Mosquito exposure risk identified',
    },
    {
      id: 'q_tb_contact',
      text: 'Contact with someone with TB or chronic cough?',
      alternatives: [],
      type: 'boolean',
      required: true,
      importance: 2,
      reasoningWeight: 25,
      factKey: 'fever_tb_contact',
      documentationPhrase: 'TB contact identified',
    },
    {
      id: 'q_sick_contact',
      text: 'Contact with someone with similar symptoms?',
      alternatives: [],
      type: 'boolean',
      required: true,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'fever_sick_contact',
      documentationPhrase: 'Contact with similarly ill person',
    },

    // ── Functional Impact ──
    {
      id: 'q_functional_impact',
      text: 'How has the fever affected you?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'How has the fever affected the child?' },
      ],
      type: 'multiple',
      chips: ['Unable to work', 'Stopped eating', 'Confused/delirious', 'Seizure', 'Bedridden', 'Minor inconvenience', 'Reduced activity'],
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'fever_functional_impact',
      documentationPhrase: 'Functional impact: {value}',
    },

    // ── Previous Episodes ──
    {
      id: 'q_previous_episodes',
      text: 'Have you had similar fevers before?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Has the child had similar fevers before?' },
      ],
      type: 'boolean',
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'fever_previous_episodes',
      documentationPhrase: 'Previous similar episodes',
    },
    {
      id: 'q_previous_treatment',
      text: 'What have you taken for this fever?',
      alternatives: [],
      type: 'multiple',
      chips: ['Paracetamol', 'Ibuprofen', 'Antimalarials', 'Antibiotics', 'Herbal remedies', 'Nothing'],
      required: false,
      importance: 1,
      reasoningWeight: 10,
      factKey: 'fever_previous_treatment',
      documentationPhrase: 'Previous treatment: {value}',
    },

    // ── Complications ──
    {
      id: 'q_seizure',
      text: 'Has the fever caused a seizure?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Has the fever caused a convulsion/seizure?' },
      ],
      type: 'boolean',
      required: false,
      importance: 3,
      reasoningWeight: 40,
      factKey: 'fever_seizure',
      documentationPhrase: 'Febrile seizure occurred',
    },
    {
      id: 'q_confusion',
      text: 'Have you felt confused or disoriented?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Has the child seemed confused or unusually drowsy?' },
      ],
      type: 'boolean',
      required: false,
      importance: 3,
      reasoningWeight: 35,
      factKey: 'fever_confusion',
      documentationPhrase: 'Associated confusion/disorientation',
    },
    {
      id: 'q_dehydration',
      text: 'Signs of dehydration? (dry mouth, reduced urine, sunken eyes)',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Signs of dehydration? (dry mouth, reduced urine, sunken eyes, no tears)' },
      ],
      type: 'boolean',
      required: false,
      importance: 2,
      reasoningWeight: 25,
      factKey: 'fever_dehydration',
      documentationPhrase: 'Signs of dehydration present',
    },

    // ── Important Negatives ──
    {
      id: 'q_bleeding',
      text: 'Any unusual bleeding or bruising?',
      alternatives: [],
      type: 'boolean',
      required: false,
      importance: 3,
      reasoningWeight: 35,
      factKey: 'fever_bleeding',
      documentationPhrase: 'No unusual bleeding',
    },
    {
      id: 'q_shortness_breath',
      text: 'Shortness of breath?',
      alternatives: [
        { condition: { ageMax: 5 }, text: 'Difficulty breathing?' },
      ],
      type: 'boolean',
      required: false,
      importance: 2,
      reasoningWeight: 25,
      factKey: 'fever_sob',
      documentationPhrase: 'No shortness of breath',
    },
    {
      id: 'q_chest_pain',
      text: 'Any chest pain?',
      alternatives: [],
      type: 'boolean',
      required: false,
      importance: 1,
      reasoningWeight: 15,
      factKey: 'fever_chest_pain',
      documentationPhrase: 'No chest pain',
    },

    // ── Pediatric-specific ──
    {
      id: 'q_feeding',
      text: 'How is the child feeding?',
      alternatives: [],
      type: 'chips',
      chips: ['Breastfeeding well', 'Breastfeeding poorly', 'Refusing to feed', 'Vomiting feeds', 'N/A'],
      required: false,
      importance: 2,
      reasoningWeight: 15,
      factKey: 'fever_feeding',
      documentationPhrase: 'Feeding: {value}',
    },
    {
      id: 'q_immunization',
      text: 'Are immunizations up to date?',
      alternatives: [],
      type: 'boolean',
      required: false,
      importance: 2,
      reasoningWeight: 10,
      factKey: 'fever_immunization_status',
      documentationPhrase: 'Immunization status: {value}',
    },
    {
      id: 'q_crying_urine',
      text: 'Does the child cry when passing urine?',
      alternatives: [],
      type: 'boolean',
      required: false,
      importance: 1,
      reasoningWeight: 15,
      factKey: 'fever_crying_urine',
      documentationPhrase: 'Cries on urination',
    },
  ],

  // ═════════════════════════════════════════════════════════════════════════
  // CONTEXT ADAPTERS — extend core without modifying it
  // ═════════════════════════════════════════════════════════════════════════
  contextAdapters: {
    pediatric: {
      label: 'Pediatric Extension',
      additionalObjectives: [
        { id: 'obj_ped_feeding', label: 'Feeding Assessment', description: 'Assess feeding in febrile child', order: 11, required: false, questionIds: ['q_feeding'] },
        { id: 'obj_ped_immunization', label: 'Immunization Context', description: 'Verify immunization status', order: 12, required: false, questionIds: ['q_immunization'] },
      ],
      additionalQuestions: [],
      suppressedQuestionIds: ['q_work', 'q_occupation', 'q_alcohol', 'q_smoking'],
      modifiedQuestions: [],
    },
    neonatal: {
      label: 'Neonatal Extension',
      additionalObjectives: [
        { id: 'obj_neonatal_feeding', label: 'Neonatal Feeding', description: 'Assess feeding in neonate', order: 13, required: true, questionIds: ['q_feeding'] },
      ],
      additionalQuestions: [],
      suppressedQuestionIds: ['q_travel', 'q_mosquito', 'q_joint_pain', 'q_headache', 'q_sore_throat'],
      modifiedQuestions: [
        { id: 'q_seizure', text: 'Has the baby had any convulsions (fits)?' },
        { id: 'q_feeding', text: 'How is the baby feeding?', chips: ['Breastfeeding well', 'Poor suck', 'Unable to feed', 'Vomiting all feeds'] },
      ],
    },
    obstetric: {
      label: 'Obstetric Extension',
      additionalObjectives: [
        { id: 'obj_obstetric', label: 'Obstetric Assessment', description: 'Assess pregnancy context of fever', order: 14, required: true, questionIds: ['q_gestation', 'q_fetal_movement', 'q_prom', 'q_lochia'] },
      ],
      additionalQuestions: [
        { id: 'q_gestation', text: 'Current gestational age?', type: 'text', alternatives: [], required: true, importance: 3, reasoningWeight: 20, factKey: 'fever_gestation', documentationPhrase: 'Gestational age: {value}' },
        { id: 'q_fetal_movement', text: 'Fetal movements normal?', type: 'boolean', alternatives: [], required: true, importance: 3, reasoningWeight: 20, factKey: 'fever_fetal_movement', documentationPhrase: 'Fetal movements normal' },
        { id: 'q_prom', text: 'Any leaking of liquor (PROM)?', type: 'boolean', alternatives: [], required: true, importance: 3, reasoningWeight: 30, factKey: 'fever_prom', documentationPhrase: 'PROM identified' },
        { id: 'q_lochia', text: 'Postpartum — is lochia normal?', type: 'boolean', alternatives: [], required: false, importance: 2, reasoningWeight: 20, factKey: 'fever_lochia', documentationPhrase: 'Lochia normal' },
      ],
      suppressedQuestionIds: [],
      modifiedQuestions: [],
    },
    emergency: {
      label: 'Emergency Extension',
      additionalObjectives: [
        { id: 'obj_emergency', label: 'Emergency Screening', description: 'ABCDE danger signs', order: 0, required: true, questionIds: ['q_abcde'] },
      ],
      additionalQuestions: [
        { id: 'q_abcde', text: 'Any ABCDE danger signs? (Airway compromise, severe respiratory distress, shock, altered consciousness)', type: 'multiple', alternatives: [], required: true, importance: 3, reasoningWeight: 50, chips: ['Airway compromise', 'Severe respiratory distress', 'Shock', 'Altered consciousness', 'Active bleeding', 'None'], factKey: 'fever_abcde', documentationPhrase: 'ABCDE: {value}' },
      ],
      suppressedQuestionIds: [],
      modifiedQuestions: [],
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // FACT EXTRACTION RULES — answer → structured facts
  // ═════════════════════════════════════════════════════════════════════════
  factExtraction: [
    makeExtract('q_temp_measured', 'fever_temp_measured', 'Temperature measured'),
    makeExtract('q_feels_hot', 'fever_feels_hot', 'Feels hot to touch'),
    makeExtract('q_duration', 'fever_duration', 'Fever duration'),
    makeExtract('q_pattern', 'fever_pattern', 'Fever pattern'),
    makeExtract('q_severity', 'fever_severity', 'Fever severity'),
    makeBooleanExtract('q_rigors', 'fever_rigors', 'Rigors present', 'No rigors'),
    makeBooleanExtract('q_night_sweats', 'fever_night_sweats', 'Night sweats present', 'No night sweats'),
    makeBooleanExtract('q_cough', 'fever_cough', 'Associated cough', 'No cough'),
    makeBooleanExtract('q_dysuria', 'fever_dysuria', 'Dysuria present', 'No dysuria'),
    makeBooleanExtract('q_diarrhea', 'fever_diarrhea', 'Diarrhea present', 'No diarrhea'),
    makeBooleanExtract('q_headache', 'fever_headache', 'Headache present', 'No headache'),
    makeBooleanExtract('q_rash', 'fever_rash', 'Rash present', 'No rash'),
    makeBooleanExtract('q_joint_pain', 'fever_joint_pain', 'Joint pains present', 'No joint pains'),
    makeBooleanExtract('q_travel', 'fever_travel', 'Recent travel', 'No recent travel'),
    makeBooleanExtract('q_mosquito', 'fever_malaria_risk', 'Malaria risk present', 'Low malaria risk'),
    makeBooleanExtract('q_tb_contact', 'fever_tb_contact', 'TB contact identified', 'No TB contact'),
    makeBooleanExtract('q_seizure', 'fever_seizure', 'Febrile seizure', 'No febrile seizure'),
    makeBooleanExtract('q_confusion', 'fever_confusion', 'Confusion present', 'No confusion'),
    makeBooleanExtract('q_neck_stiffness', 'fever_neck_stiffness', 'Neck stiffness present', 'No neck stiffness'),
    makeBooleanExtract('q_bleeding', 'fever_bleeding', 'Bleeding present', 'No bleeding'),
    makeExtract('q_functional_impact', 'fever_functional_impact', 'Functional impact'),
    makeExtract('q_previous_treatment', 'fever_previous_treatment', 'Previous treatment'),
    makeBooleanExtract('q_previous_episodes', 'fever_previous_episodes', 'Previous similar episodes', 'No previous similar episodes'),
  ],

  // ═════════════════════════════════════════════════════════════════════════
  // RELATIONSHIP GRAPH — symptom → related symptoms
  // ═════════════════════════════════════════════════════════════════════════
  relationships: [
    { targetSymptomId: 'SX000002', type: 'associated_with', strength: 0.8, description: 'Commonly associated with headache' },
    { targetSymptomId: 'SX000003', type: 'associated_with', strength: 0.7, description: 'Often accompanied by body aches' },
    { targetSymptomId: 'SX000004', type: 'associated_with', strength: 0.6, description: 'May be accompanied by vomiting' },
    { targetSymptomId: 'SX000005', type: 'associated_with', strength: 0.5, description: 'Commonly associated with cough' },
    { targetSymptomId: 'SX000006', type: 'may_complicate', strength: 0.3, description: 'May be complicated by seizure' },
    { targetSymptomId: 'SX000007', type: 'may_complicate', strength: 0.2, description: 'Associated with dehydration risk' },
  ],

  // ═════════════════════════════════════════════════════════════════════════
  // PHENOTYPE RULES — symptom patterns → clinical phenotypes
  // ═════════════════════════════════════════════════════════════════════════
  phenotypes: [
    {
      id: 'phen_fever_malaria',
      label: 'Malaria Phenotype',
      description: 'Fever with rigors, headache, joint pains, travel to endemic area',
      criteria: [
        { factKey: 'fever_malaria_risk', operator: 'eq', value: true },
        { factKey: 'fever_rigors', operator: 'eq', value: true },
      ],
      probability: 0.6,
      suggestsMechanisms: ['plasmodium_parasitemia', 'hemolysis'],
      suggestsDifferentials: ['Malaria', 'Severe malaria'],
      emergencyWeight: 60,
    },
    {
      id: 'phen_fever_respiratory',
      label: 'Respiratory Infection Phenotype',
      description: 'Fever with cough, sore throat, chest findings',
      criteria: [
        { factKey: 'fever_cough', operator: 'eq', value: true },
      ],
      probability: 0.4,
      suggestsMechanisms: ['airway_inflammation', 'parenchymal_infection'],
      suggestsDifferentials: ['Upper respiratory tract infection', 'Pneumonia', 'Bronchitis', 'Tuberculosis'],
      emergencyWeight: 40,
    },
    {
      id: 'phen_fever_uti',
      label: 'Urinary Tract Infection Phenotype',
      description: 'Fever with dysuria, frequency, flank pain',
      criteria: [
        { factKey: 'fever_dysuria', operator: 'eq', value: true },
      ],
      probability: 0.3,
      suggestsMechanisms: ['bacterial_uti'],
      suggestsDifferentials: ['Urinary tract infection', 'Pyelonephritis'],
      emergencyWeight: 30,
    },
    {
      id: 'phen_fever_gi',
      label: 'Gastrointestinal Infection Phenotype',
      description: 'Fever with diarrhea, vomiting, abdominal pain',
      criteria: [
        { factKey: 'fever_diarrhea', operator: 'eq', value: true },
      ],
      probability: 0.3,
      suggestsMechanisms: ['enteric_infection'],
      suggestsDifferentials: ['Gastroenteritis', 'Typhoid fever', 'Food poisoning'],
      emergencyWeight: 30,
    },
    {
      id: 'phen_fever_cns',
      label: 'CNS Infection Phenotype',
      description: 'Fever with neck stiffness, headache, confusion, seizure',
      criteria: [
        { factKey: 'fever_neck_stiffness', operator: 'eq', value: true },
      ],
      probability: 0.5,
      suggestsMechanisms: ['meningeal_inflammation', 'intracranial_infection'],
      suggestsDifferentials: ['Meningitis', 'Encephalitis', 'Cerebral malaria'],
      emergencyWeight: 90,
    },
    {
      id: 'phen_fever_sepsis',
      label: 'Sepsis Phenotype',
      description: 'High fever with confusion, rigors, functional impairment',
      criteria: [
        { factKey: 'fever_severity', operator: 'eq', value: 'Severe' },
        { factKey: 'fever_rigors', operator: 'eq', value: true },
      ],
      probability: 0.3,
      suggestsMechanisms: ['systemic_inflammatory_response', 'bacteremia'],
      suggestsDifferentials: ['Sepsis', 'Septic shock', 'Bacteremia'],
      emergencyWeight: 85,
    },
  ],

  // ═════════════════════════════════════════════════════════════════════════
  // DOCUMENTATION RULES — context-aware narrative generation
  // ═════════════════════════════════════════════════════════════════════════
  documentation: [
    {
      id: 'doc_temp_measured',
      condition: { factKey: 'fever_temp_measured', operator: 'eq', value: true },
      template: 'Temperature was measured and documented.',
      priority: 1,
    },
    {
      id: 'doc_temp_not_measured',
      condition: { factKey: 'fever_temp_measured', operator: 'eq', value: false },
      template: 'No thermometer available; patient described as hot to touch.',
      priority: 2,
    },
    {
      id: 'doc_duration',
      condition: { factKey: 'fever_duration', operator: 'present' },
      template: 'Fever has been present for {{fever_duration}}.',
      priority: 1,
    },
    {
      id: 'doc_pattern',
      condition: { factKey: 'fever_pattern', operator: 'present' },
      template: 'The fever is {{fever_pattern}} in pattern.',
      priority: 2,
    },
    {
      id: 'doc_rigors',
      condition: { factKey: 'fever_rigors', operator: 'eq', value: true },
      template: 'The patient reports rigors (severe shaking chills).',
      priority: 1,
    },
    {
      id: 'doc_night_sweats',
      condition: { factKey: 'fever_night_sweats', operator: 'eq', value: true },
      template: 'There are associated drenching night sweats.',
      priority: 2,
    },
    {
      id: 'doc_neck_stiffness',
      condition: { factKey: 'fever_neck_stiffness', operator: 'eq', value: true },
      template: 'NECK STIFFNESS PRESENT — high suspicion for meningitis.',
      priority: 1,
    },
    {
      id: 'doc_seizure',
      condition: { factKey: 'fever_seizure', operator: 'eq', value: true },
      template: 'Fever complicated by seizure.',
      priority: 1,
    },
    {
      id: 'doc_travel',
      condition: { factKey: 'fever_travel', operator: 'eq', value: true },
      template: 'Patient reports recent travel, raising suspicion for malaria or other travel-related infections.',
      priority: 2,
    },
  ],

  // ═════════════════════════════════════════════════════════════════════════
  // REASONING HOOKS — events that trigger clinical actions
  // ═════════════════════════════════════════════════════════════════════════
  reasoningHooks: [
    {
      id: 'rh_source_complete',
      trigger: { on: 'objective_complete', ref: 'obj_source' },
      action: 'suggest_differentials',
      payload: ['dx_protozoal_infection', 'dx_enteric_fever', 'dx_uti', 'dx_lower_respiratory_tract', 'dx_cns_infection'],
    },
    {
      id: 'rh_neck_stiffness',
      trigger: { on: 'fact_captured', ref: 'fever_neck_stiffness' },
      action: 'flag_red_flag',
      payload: ['Meningeal irritation detected — consider CNS infection'],
    },
    {
      id: 'rh_seizure',
      trigger: { on: 'fact_captured', ref: 'fever_seizure' },
      action: 'flag_red_flag',
      payload: ['Febrile convulsion — assess for intracranial infection'],
    },
    {
      id: 'rh_confusion',
      trigger: { on: 'fact_captured', ref: 'fever_confusion' },
      action: 'flag_red_flag',
      payload: ['Altered consciousness with fever — assess for CNS infection, severe systemic infection'],
    },
    {
      id: 'rh_severity_high',
      trigger: { on: 'fact_captured', ref: 'fever_severity' },
      action: 'suggest_investigations',
      payload: ['Blood culture', 'Blood film for parasites', 'Full blood count', 'CRP'],
    },
    {
      id: 'rh_travel_risk',
      trigger: { on: 'fact_captured', ref: 'fever_travel' },
      action: 'suggest_differentials',
      payload: ['dx_protozoal_infection', 'dx_viral_hemorrhagic', 'dx_enteric_fever', 'dx_arbovirus'],
    },
  ],
  // ═════════════════════════════════════════════════════════════════════════
  // COMPLETION RULES — tracks progress per objective
  // ═════════════════════════════════════════════════════════════════════════
  completion: {
    objectives: FEVER_NODE_OBJECTIVES.map(o => ({
      objectiveId: o.id,
      status: 'not_started' as const,
      answeredQuestions: [] as string[],
      percentage: 0,
    })),
    overall: 0,
  },

};
