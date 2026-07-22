import type {
  EncounterBrainState,
  QuestionGroup,
  PatientContext,
  EncounterContext,
  WorkflowStep,
  SymptomObject,
} from '../encounter-brain/types';
import { getContextualIntroduction } from './contextRules';
import { getChronicDiseaseIntroduction, getChronicDiseaseQuestions } from '../chronic-disease/chronicDiseaseEngine';
import { getHealthSeekingNarrative, getDelayBeforePresentation } from '../health-seeking/healthSeekingEngine';
import { generateTimelineNarrative, getSymptomOnset } from '../master-timeline/timelineEngine';
import { assessStory } from '../clinical-story-engine/clinicalStoryEngine';
import { getRelationshipNarrative } from '../symptom-relationships/symptomRelationshipsEngine';

interface HpiSection {
  section: string;
  label: string;
  description: string;
  priority: number;
}

const ABDOMINAL_PAIN_FEATURES_GROUP_1: string[] = [
  'pain_location', 'pain_onset', 'pain_progression', 'pain_severity', 'pain_nature',
];

const ABDOMINAL_PAIN_FEATURES_GROUP_2: string[] = [
  'vomiting', 'fever', 'distension', 'constipation', 'diarrhea', 'urinary_symptoms',
];

const ABDOMINAL_PAIN_FEATURES_GROUP_3: string[] = [
  'previous_episodes', 'prior_abdominal_surgery', 'known_hernia', 'known_gallstones',
  'alcohol_use', 'menstrual_history',
];

const PAST_HISTORY_FEATURES_GROUP_1: string[] = [
  'chronic_diseases', 'diabetes', 'hypertension', 'asthma', 'hiv', 'tuberculosis',
  'chronic_kidney_disease', 'heart_disease', 'sickle_cell', 'epilepsy',
];

const PAST_HISTORY_FEATURES_GROUP_2: string[] = [
  'prior_surgeries', 'previous_surgery_details', 'surgery_complications',
];

const PAST_HISTORY_FEATURES_GROUP_3: string[] = [
  'prior_admissions', 'admission_details', 'admission_diagnoses',
];

const SOCIAL_HISTORY_FEATURES_GROUP_1: string[] = [
  'smoking', 'alcohol_use', 'substance_use', 'diet', 'exercise', 'occupation',
];

const SOCIAL_HISTORY_FEATURES_GROUP_2: string[] = [
  'housing', 'water_source', 'sanitation', 'pets', 'travel_history',
];

const SOCIAL_HISTORY_FEATURES_GROUP_3: string[] = [
  'marital_status', 'family_support', 'caregiver_available', 'living_arrangement',
];

function getPrimarySymptom(brain: EncounterBrainState): SymptomObject | null {
  if (!brain.primarySymptomId) return null;
  return brain.symptoms[brain.primarySymptomId] ?? null;
}

function buildPatientWellUntil(brain: EncounterBrainState): string | null {
  const primary = getPrimarySymptom(brain);
  if (!primary) return null;

  const onsetEvent = brain.timeline.find(e => e.eventType === 'symptom_onset');
  if (onsetEvent) {
    return `The patient was well until ${onsetEvent.date} when they developed ${primary.label}.`;
  }
  if (primary.onset) {
    return `The patient was well until ${primary.onset.date} when they developed ${primary.label}.`;
  }

  return `The patient was well until they developed ${primary.label}.`;
}

function buildPrimarySymptom(brain: EncounterBrainState): string | null {
  const primary = getPrimarySymptom(brain);
  if (!primary) return null;

  const parts: string[] = [primary.label];
  const attrValues = Object.values(primary.attributes);

  for (const attr of attrValues) {
    if (attr.featureId === 'pain_initial_location' || attr.featureId === 'pain_location') {
      parts.push(`located in ${attr.value}`);
    } else if (attr.featureId === 'pain_character' || attr.featureId === 'pain_nature') {
      parts.push(`described as ${attr.value}`);
    } else if (attr.featureId === 'pain_severity') {
      parts.push(`of severity ${attr.value}/10`);
    } else if (attr.featureId === 'pain_radiation') {
      if (attr.value !== 'No radiation' && attr.value !== 'none') {
        parts.push(`radiating to ${attr.value}`);
      }
    } else if (attr.featureId === 'pain_onset') {
      parts.push(`with ${attr.value} onset`);
    } else if (attr.featureId === 'pain_temporal_pattern' || attr.featureId === 'pain_progression') {
      parts.push(attr.value as string);
    }
  }

  return parts.join(', ') + '.';
}

function buildEvolution(brain: EncounterBrainState): string | null {
  const changeEvents = brain.timeline.filter(e => e.eventType === 'symptom_change');
  if (changeEvents.length === 0) {
    const primary = getPrimarySymptom(brain);
    if (primary) {
      const pattern = Object.values(primary.attributes).find(
        a => a.featureId === 'pain_temporal_pattern' || a.featureId === 'pain_progression',
      );
      if (pattern) return `The symptoms have been ${pattern.value}.`;
    }
    return null;
  }

  const parts = changeEvents.map(e => e.description);
  return `The illness evolved: ${parts.join('; ')}.`;
}

function buildAssociatedSymptoms(brain: EncounterBrainState): string | null {
  const relationships = brain.symptomRelationships;
  if (relationships.length === 0) return null;

  const narratives = getRelationshipNarrative(relationships);
  if (narratives.length === 0) return null;

  return narratives.join(' ');
}

function buildDiseaseSpecificContext(brain: EncounterBrainState): string | null {
  const chronicDiseases = Object.values(brain.chronicDiseases);
  if (chronicDiseases.length === 0) return null;

  return getChronicDiseaseIntroduction(chronicDiseases);
}

function buildHealthSeekingBehaviour(brain: EncounterBrainState): string | null {
  const hsj = brain.healthSeekingJourney;
  if (!hsj || hsj.steps.length === 0) return null;

  return getHealthSeekingNarrative(hsj);
}

function buildCurrentState(brain: EncounterBrainState): string | null {
  const encounter = brain.encounter;
  const patient = brain.patient;

  const parts: string[] = [];

  if (encounter.isPostoperative && brain.postOperativeState) {
    const pos = brain.postOperativeState;
    parts.push(`Currently on post-op day ${pos.postOpDay} after ${pos.operationPerformed}`);
  }

  if (encounter.acuity === 'emergency' || encounter.acuity === 'immediate') {
    parts.push('presenting as an emergency');
  } else if (encounter.encounterType === 'follow_up') {
    parts.push('presenting for follow-up');
  }

  if (parts.length === 0) return null;
  return parts.join(', ') + '.';
}

function buildFunctionalImpact(brain: EncounterBrainState): string | null {
  const fs = brain.functionalStatus;
  if (!fs) return null;

  const parts: string[] = [];
  if (fs.workImpact) parts.push(fs.workImpact);
  if (fs.overallImpact && fs.overallImpact !== 'none') {
    parts.push(`Overall functional impact is ${fs.overallImpact}`);
  }
  if (fs.dailyActivities.length > 0) {
    const impacted = fs.dailyActivities.filter(a => a.independence !== 'independent');
    if (impacted.length > 0) {
      const domains = impacted.map(a => a.domain).join(', ');
      parts.push(`Requires assistance with ${domains}`);
    }
  }

  if (parts.length === 0) return null;
  return parts.join('. ') + '.';
}

function buildReasonForVisit(brain: EncounterBrainState): string | null {
  const encounter = brain.encounter;
  const primary = getPrimarySymptom(brain);

  if (encounter.referralReason) {
    return `The patient presents today for ${encounter.referralReason}.`;
  }

  if (encounter.referralStatus === 'referral' || encounter.referralStatus === 'transfer') {
    return 'The patient presents today following a referral for further management.';
  }

  if (encounter.encounterType === 'follow_up') {
    return 'The patient presents today for scheduled follow-up.';
  }

  if (primary) {
    return `The patient presents today for evaluation of ${primary.label}.`;
  }

  return null;
}

function getAllAnsweredFeatures(brain: EncounterBrainState): Set<string> {
  const ids = new Set<string>();
  for (const symptom of Object.values(brain.symptoms)) {
    for (const attr of Object.values(symptom.attributes)) {
      ids.add(attr.featureId);
    }
  }
  return ids;
}

export function generateHpiIntro(brain: EncounterBrainState): string {
  const sections: { render: () => string | null }[] = [
    { render: () => getContextualIntroduction(brain) },
    { render: () => buildPatientWellUntil(brain) },
    { render: () => buildPrimarySymptom(brain) },
    { render: () => buildEvolution(brain) },
    { render: () => buildAssociatedSymptoms(brain) },
    { render: () => buildDiseaseSpecificContext(brain) },
    { render: () => buildHealthSeekingBehaviour(brain) },
    { render: () => buildCurrentState(brain) },
    { render: () => buildFunctionalImpact(brain) },
    { render: () => buildReasonForVisit(brain) },
  ];

  const parts: string[] = [];
  for (const section of sections) {
    const result = section.render();
    if (result) parts.push(result);
  }

  return parts.join(' ');
}

const UNIVERSAL_HPI_SECTIONS: HpiSection[] = [
  { section: 'context', label: 'Patient Context', description: 'Age, sex, chronic diseases, referral status', priority: 100 },
  { section: 'onset', label: 'Symptom Onset', description: 'When the illness began and how it started', priority: 95 },
  { section: 'primary_symptom', label: 'Primary Symptom Characterization', description: 'Location, character, severity, radiation of the main symptom', priority: 90 },
  { section: 'evolution', label: 'Disease Evolution', description: 'How the symptoms have changed over time', priority: 80 },
  { section: 'associated_symptoms', label: 'Associated Symptoms', description: 'Symptoms that accompany the primary complaint', priority: 75 },
  { section: 'disease_context', label: 'Disease-Specific Context', description: 'Relevant chronic disease and surgical history', priority: 70 },
  { section: 'health_seeking', label: 'Health Seeking Behaviour', description: 'Actions taken before presenting to this facility', priority: 65 },
  { section: 'current_state', label: 'Current State', description: 'Current clinical status and postoperative state', priority: 60 },
  { section: 'functional_impact', label: 'Functional Impact', description: 'How the illness affects daily activities and work', priority: 50 },
  { section: 'reason_for_visit', label: 'Reason for Today\'s Visit', description: 'Why the patient is presenting now', priority: 40 },
];

export function getUniversalHpiStructure(): HpiSection[] {
  return UNIVERSAL_HPI_SECTIONS;
}

function getAbdominalPainGroups(): QuestionGroup[] {
  return [
    {
      id: 'hpi_abdominal_pain_1',
      label: 'Tell me about the pain',
      description: 'Characterizing the location, onset, progression, severity, and nature of the abdominal pain.',
      questions: [...ABDOMINAL_PAIN_FEATURES_GROUP_1],
      order: 1,
      minRequired: 3,
    },
    {
      id: 'hpi_abdominal_pain_2',
      label: 'What happened next?',
      description: 'Associated gastrointestinal and urinary symptoms that may accompany abdominal pain.',
      questions: [...ABDOMINAL_PAIN_FEATURES_GROUP_2],
      order: 2,
      minRequired: 2,
    },
    {
      id: 'hpi_abdominal_pain_3',
      label: 'What could explain it?',
      description: 'Risk factors and historical clues that may point to the underlying cause.',
      questions: [...ABDOMINAL_PAIN_FEATURES_GROUP_3],
      order: 3,
      minRequired: 1,
    },
  ];
}

const SYMPTOM_TYPE_GROUPS: Record<string, { label: string; description: string; features: string[] }[]> = {
  chest_pain: [
    { label: 'Tell me about the chest pain', description: 'Characterizing the location, radiation, and nature of chest pain.', features: ['pain_location', 'pain_radiation', 'pain_character', 'pain_severity', 'pain_onset'] },
    { label: 'Associated symptoms', description: 'Symptoms commonly associated with chest pain.', features: ['shortness_of_breath', 'palpitations', 'diaphoresis', 'nausea', 'dizziness', 'cough'] },
    { label: 'Risk factors', description: 'Cardiovascular risk factors and relevant history.', features: ['smoking', 'hypertension', 'diabetes', 'family_history_heart_disease', 'previous_heart_attack', 'lipid_disorder'] },
  ],
  headache: [
    { label: 'Tell me about the headache', description: 'Characterizing the location, quality, and severity of the headache.', features: ['headache_location', 'headache_quality', 'headache_severity', 'headache_onset', 'headache_duration'] },
    { label: 'Associated symptoms', description: 'Symptoms that accompany the headache.', features: ['nausea', 'vomiting', 'photophobia', 'phonophobia', 'visual_changes', 'aura', 'neck_stiffness'] },
    { label: 'What could explain it?', description: 'Triggers, past history, and risk factors.', features: ['headache_triggers', 'previous_headache_history', 'family_history_headache', 'medication_overuse', 'head_trauma', 'hypertension'] },
  ],
  dyspnea: [
    { label: 'Tell me about the breathing difficulty', description: 'Characterizing onset, severity, and progression of dyspnea.', features: ['dyspnea_onset', 'dyspnea_severity', 'dyspnea_progression', 'dyspnea_positional', 'dyspnea_nocturnal'] },
    { label: 'Associated symptoms', description: 'Symptoms commonly associated with breathing difficulty.', features: ['cough', 'sputum', 'hemoptysis', 'chest_pain', 'fever', 'wheezing', 'palpitations'] },
    { label: 'Risk factors', description: 'Respiratory and cardiac risk factors.', features: ['smoking', 'asthma', 'copd', 'occupational_exposure', 'travel_history', 'leg_swelling'] },
  ],
};

function getGroupsForSymptom(symptomId: string): QuestionGroup[] {
  const normalizedId = symptomId.toLowerCase();
  const groups = SYMPTOM_TYPE_GROUPS[normalizedId];
  if (groups) {
    return groups.map((g, i) => ({
      id: `hpi_${normalizedId}_${i + 1}`,
      label: g.label,
      description: g.description,
      questions: [...g.features],
      order: i + 1,
      minRequired: Math.max(1, Math.floor(g.features.length / 2)),
    }));
  }

  return [
    {
      id: `hpi_${normalizedId}_1`,
      label: 'Tell me more about the symptom',
      description: 'Characterizing the primary symptom in detail.',
      questions: ['symptom_location', 'symptom_onset', 'symptom_duration', 'symptom_severity', 'symptom_nature'],
      order: 1,
      minRequired: 2,
    },
    {
      id: `hpi_${normalizedId}_2`,
      label: 'Associated symptoms',
      description: 'Other symptoms that may accompany the primary complaint.',
      questions: ['fever', 'nausea', 'fatigue', 'weight_changes', 'sleep_disturbance', 'appetite_changes'],
      order: 2,
      minRequired: 1,
    },
    {
      id: `hpi_${normalizedId}_3`,
      label: 'Context and triggers',
      description: 'Factors that may explain or contribute to the symptom.',
      questions: ['precipitating_factors', 'relieving_factors', 'previous_episodes', 'family_history', 'medications'],
      order: 3,
      minRequired: 1,
    },
  ];
}

function getPastHistoryGroups(): QuestionGroup[] {
  return [
    {
      id: 'past_history_1',
      label: 'Chronic conditions',
      description: 'Known chronic medical conditions and their current management.',
      questions: [...PAST_HISTORY_FEATURES_GROUP_1],
      order: 1,
      minRequired: 1,
    },
    {
      id: 'past_history_2',
      label: 'Past surgeries',
      description: 'Previous surgical procedures and any complications.',
      questions: [...PAST_HISTORY_FEATURES_GROUP_2],
      order: 2,
      minRequired: 1,
    },
    {
      id: 'past_history_3',
      label: 'Past admissions',
      description: 'Prior hospital admissions and their indications.',
      questions: [...PAST_HISTORY_FEATURES_GROUP_3],
      order: 3,
      minRequired: 1,
    },
  ];
}

function getSocialHistoryGroups(): QuestionGroup[] {
  return [
    {
      id: 'social_history_1',
      label: 'Lifestyle',
      description: 'Smoking, alcohol, substance use, diet, exercise, and occupation.',
      questions: [...SOCIAL_HISTORY_FEATURES_GROUP_1],
      order: 1,
      minRequired: 2,
    },
    {
      id: 'social_history_2',
      label: 'Home environment',
      description: 'Housing conditions, water source, sanitation, pets, and recent travel.',
      questions: [...SOCIAL_HISTORY_FEATURES_GROUP_2],
      order: 2,
      minRequired: 1,
    },
    {
      id: 'social_history_3',
      label: 'Support system',
      description: 'Marital status, family support, caregiver availability, and living arrangements.',
      questions: [...SOCIAL_HISTORY_FEATURES_GROUP_3],
      order: 3,
      minRequired: 1,
    },
  ];
}

export function getQuestionGroupsForStep(step: WorkflowStep, brain: EncounterBrainState): QuestionGroup[] {
  if (step === 'hpi') {
    const primary = getPrimarySymptom(brain);
    if (primary) {
      const symptomId = primary.symptomId || primary.label.toLowerCase().replace(/\s+/g, '_');
      if (symptomId === 'abdominal_pain' || symptomId.includes('abdominal') || symptomId.includes('stomach')) {
        return getAbdominalPainGroups();
      }
      return getGroupsForSymptom(symptomId);
    }
    return [
      {
        id: 'hpi_general_1',
        label: 'Tell me about your symptoms',
        description: 'Please describe the main symptom that brought you here today.',
        questions: ['primary_symptom_description', 'symptom_onset', 'symptom_duration'],
        order: 1,
        minRequired: 2,
      },
      {
        id: 'hpi_general_2',
        label: 'How has it been?',
        description: 'How the symptoms have progressed and affected you.',
        questions: ['symptom_progression', 'symptom_severity', 'associated_symptoms', 'functional_impact'],
        order: 2,
        minRequired: 1,
      },
    ];
  }

  if (step === 'past_history') {
    return getPastHistoryGroups();
  }

  if (step === 'social_history') {
    return getSocialHistoryGroups();
  }

  return [];
}

const FEATURE_PRIORITY_CLASSES: Record<string, { category: string; baseScore: number }> = {
  chest_pain: { category: 'life_threatening', baseScore: 100 },
  shortness_of_breath: { category: 'life_threatening', baseScore: 100 },
  hemoptysis: { category: 'life_threatening', baseScore: 100 },
  hematemesis: { category: 'life_threatening', baseScore: 100 },
  melena: { category: 'life_threatening', baseScore: 100 },
  hematochezia: { category: 'life_threatening', baseScore: 100 },
  syncope: { category: 'life_threatening', baseScore: 100 },
  altered_consciousness: { category: 'life_threatening', baseScore: 100 },
  severe_dehydration: { category: 'life_threatening', baseScore: 100 },
  anuria: { category: 'life_threatening', baseScore: 100 },
  pain_location: { category: 'diagnostic', baseScore: 80 },
  pain_character: { category: 'diagnostic', baseScore: 80 },
  pain_radiation: { category: 'diagnostic', baseScore: 80 },
  pain_onset: { category: 'diagnostic', baseScore: 80 },
  pain_severity: { category: 'diagnostic', baseScore: 80 },
  pain_temporal_pattern: { category: 'diagnostic', baseScore: 80 },
  fever: { category: 'diagnostic', baseScore: 80 },
  vomiting: { category: 'diagnostic', baseScore: 80 },
  diarrhea: { category: 'diagnostic', baseScore: 80 },
  constipation: { category: 'diagnostic', baseScore: 80 },
  jaundice: { category: 'diagnostic', baseScore: 80 },
  dysuria: { category: 'diagnostic', baseScore: 80 },
  cough: { category: 'diagnostic', baseScore: 80 },
  sputum: { category: 'diagnostic', baseScore: 80 },
  wheezing: { category: 'diagnostic', baseScore: 80 },
  palpitations: { category: 'diagnostic', baseScore: 80 },
  edema: { category: 'diagnostic', baseScore: 80 },
  medication_compliance: { category: 'management', baseScore: 60 },
  current_medications: { category: 'management', baseScore: 60 },
  drug_allergies: { category: 'management', baseScore: 60 },
  prior_treatment: { category: 'management', baseScore: 60 },
  treatment_response: { category: 'management', baseScore: 60 },
  functional_impact: { category: 'documentation', baseScore: 40 },
  impact_daily_activity: { category: 'documentation', baseScore: 40 },
  impact_sleep: { category: 'documentation', baseScore: 40 },
  impact_work: { category: 'documentation', baseScore: 40 },
  impact_self_care: { category: 'documentation', baseScore: 40 },
  smoking: { category: 'research', baseScore: 20 },
  alcohol_use: { category: 'research', baseScore: 20 },
  diet: { category: 'research', baseScore: 20 },
  exercise: { category: 'research', baseScore: 20 },
  occupation: { category: 'research', baseScore: 20 },
  family_history: { category: 'research', baseScore: 20 },
  travel_history: { category: 'research', baseScore: 20 },
};

const CATEGORY_BASE_SCORES: Record<string, number> = {
  life_threatening: 100,
  diagnostic: 80,
  management: 60,
  documentation: 40,
  research: 20,
};

export function getQuestionPriority(featureId: string, context: EncounterBrainState): number {
  const feature = FEATURE_PRIORITY_CLASSES[featureId];
  if (feature) return feature.baseScore;

  const answered = getAllAnsweredFeatures(context);
  if (!answered.has(featureId)) {
    if (featureId.startsWith('pain_')) return 80;
    if (featureId.startsWith('symptom_')) return 60;
  }

  return CATEGORY_BASE_SCORES.documentation;
}

export function organizeIntoConversationBlocks(questionIds: string[], brain: EncounterBrainState): QuestionGroup[] {
  if (questionIds.length === 0) return [];

  const groups: QuestionGroup[] = [];
  const primary = getPrimarySymptom(brain);

  const diagnosticQuestions: string[] = [];
  const managementQuestions: string[] = [];
  const documentationQuestions: string[] = [];
  const riskFactorQuestions: string[] = [];

  const sorted = [...questionIds].sort((a, b) => {
    const pa = getQuestionPriority(a, brain);
    const pb = getQuestionPriority(b, brain);
    return pb - pa;
  });

  for (const qid of sorted) {
    const priority = getQuestionPriority(qid, brain);
    if (priority >= 80) {
      diagnosticQuestions.push(qid);
    } else if (priority >= 60) {
      managementQuestions.push(qid);
    } else if (priority >= 40) {
      documentationQuestions.push(qid);
    } else {
      riskFactorQuestions.push(qid);
    }
  }

  if (diagnosticQuestions.length > 0) {
    const symptomLabel = primary ? primary.label : 'symptoms';
    groups.push({
      id: 'block_diagnostic',
      label: `Tell me more about the ${symptomLabel}`,
      description: 'Key diagnostic features needed to characterize the presenting complaint.',
      questions: diagnosticQuestions,
      order: 1,
      minRequired: Math.max(1, Math.ceil(diagnosticQuestions.length / 2)),
    });
  }

  if (managementQuestions.length > 0) {
    groups.push({
      id: 'block_management',
      label: 'Current management',
      description: 'Current medications, allergies, and prior treatments.',
      questions: managementQuestions,
      order: 2,
      minRequired: 1,
    });
  }

  if (documentationQuestions.length > 0) {
    groups.push({
      id: 'block_functional',
      label: 'How is this affecting you?',
      description: 'Impact on daily life, work, and self-care.',
      questions: documentationQuestions,
      order: 3,
      minRequired: 1,
    });
  }

  if (riskFactorQuestions.length > 0) {
    groups.push({
      id: 'block_risk_factors',
      label: 'Background and risk factors',
      description: 'Lifestyle, family history, and environmental factors.',
      questions: riskFactorQuestions,
      order: 4,
      minRequired: 0,
    });
  }

  return groups;
}
