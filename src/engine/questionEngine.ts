import { ConsultationContext, QuestionNode } from '@/src/types';

// The ordered question bank — engine picks next unasked relevant one
const questionBank: QuestionNode[] = [
  {
    id: 'cough_duration',
    text: 'How long has the cough been present?',
    type: 'single',
    options: ['Less than 2 weeks', '2–4 weeks', 'More than 4 weeks'],
    triggerSymptoms: ['cough'],
  },
  {
    id: 'cough_character',
    text: 'What is the character of the cough?',
    type: 'single',
    options: ['Dry', 'Productive / wet', 'Barking / seal-like'],
    triggerSymptoms: ['cough'],
  },
  {
    id: 'fever_present',
    text: 'Is there fever?',
    type: 'boolean',
    triggerSymptoms: ['cough', 'difficulty_breathing'],
  },
  {
    id: 'wheeze_present',
    text: 'Is there audible wheeze?',
    type: 'boolean',
    triggerSymptoms: ['difficulty_breathing', 'cough'],
  },
  {
    id: 'night_symptoms',
    text: 'Are symptoms worse at night or early morning?',
    type: 'boolean',
    triggerSymptoms: ['wheeze', 'cough'],
  },
  {
    id: 'recurrent_episodes',
    text: 'Has the child had similar episodes before?',
    type: 'boolean',
    triggerSymptoms: ['wheeze', 'difficulty_breathing'],
  },
  {
    id: 'tb_contact',
    text: 'Is there a known TB contact in the household?',
    type: 'boolean',
    triggerSymptoms: ['cough'],
  },
  {
    id: 'weight_loss',
    text: 'Is there documented weight loss or failure to thrive?',
    type: 'boolean',
    triggerSymptoms: ['cough'],
  },
  {
    id: 'night_sweats',
    text: 'Does the child have drenching night sweats?',
    type: 'boolean',
    triggerSymptoms: ['cough', 'fever'],
  },
  {
    id: 'reduced_feeding',
    text: 'Is the child feeding significantly less than normal?',
    type: 'boolean',
    triggerSymptoms: ['difficulty_breathing', 'cough'],
  },
  {
    id: 'stridor_present',
    text: 'Is there stridor (inspiratory high-pitched noise)?',
    type: 'boolean',
    triggerSymptoms: ['noisy_breathing', 'difficulty_breathing'],
  },
  {
    id: 'bronchodilator_response',
    text: 'Has the child had any response to a bronchodilator (e.g. salbutamol)?',
    type: 'boolean',
    triggerSymptoms: ['wheeze'],
  },
  {
    id: 'family_history_atopy',
    text: 'Is there a family history of asthma, eczema, or allergies?',
    type: 'boolean',
    triggerSymptoms: ['wheeze'],
  },
  {
    id: 'hypoxia',
    text: 'What is the SpO2 on room air?',
    type: 'single',
    options: ['≥ 95%', '92–94%', '< 92%'],
    triggerSymptoms: ['difficulty_breathing', 'cyanosis'],
  },
];

export function getNextQuestion(ctx: ConsultationContext): QuestionNode | null {
  for (const question of questionBank) {
    // Skip already asked
    if (ctx.askedQuestions.includes(question.id)) continue;

    // Check if any trigger symptom is present (or no trigger = always ask)
    const triggered =
      !question.triggerSymptoms ||
      question.triggerSymptoms.some(s => ctx.symptoms.includes(s));

    if (triggered) return question;
  }
  return null; // All relevant questions asked
}