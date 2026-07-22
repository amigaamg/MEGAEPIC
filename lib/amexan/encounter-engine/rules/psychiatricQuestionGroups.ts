import { QuestionGroup, QuestionCard } from '../types/ces';

export function getPsychiatricCardsForSection(sectionId: string): QuestionCard[] {
  const groups = Object.values(PSYCHIATRIC_QUESTION_GROUPS).filter(
    g => g.constitutionalSectionId === sectionId
  );
  return groups.flatMap(g => g.cards);
}

export const PSYCHIATRIC_QUESTION_GROUPS: Record<string, QuestionGroup> = {
  psych_past_history: {
    id: 'psych_past_history',
    label: 'Past Psychiatric History',
    phase: 'past_medical',
    constitutionalSectionId: 'past_psychiatric_history',
    cards: [
      { id: 'q_psych_prev_diagnosis', phase: 'past_medical', question: 'Previous psychiatric diagnosis?', type: 'chips', chips: ['None', 'Depression', 'Bipolar', 'Schizophrenia', 'Anxiety', 'PTSD', 'OCD', 'Eating disorder', 'ADHD', 'Other', 'Unknown'], required: true, factKey: 'psych_prev_diagnosis' },
      { id: 'q_psych_prev_admissions', phase: 'past_medical', question: 'Previous psychiatric admissions?', type: 'chips', chips: ['None', 'Once', '2-3 times', '>3 times', 'Unknown'], required: false, factKey: 'psych_prev_admissions' },
      { id: 'q_psych_prev_treatment', phase: 'past_medical', question: 'Previous psychiatric treatment?', type: 'chips', chips: ['None', 'Medication only', 'Therapy only', 'Both', 'Unknown'], required: false, factKey: 'psych_prev_treatment' },
      { id: 'q_psych_suicide_attempts', phase: 'past_medical', question: 'History of suicide attempts?', type: 'chips', chips: ['None', 'Yes (ideation)', 'Yes (attempt)', 'Unknown'], required: false, factKey: 'psych_suicide_attempts' },
      { id: 'q_psych_self_harm', phase: 'past_medical', question: 'History of self-harm?', type: 'chips', chips: ['None', 'Yes (past)', 'Yes (recent)', 'Unknown'], required: false, factKey: 'psych_self_harm' },
      { id: 'q_psych_compliance', phase: 'past_medical', question: 'Medication compliance?', type: 'chips', chips: ['Good', 'Partial', 'Poor', 'Not applicable', 'Unknown'], required: false, factKey: 'psych_compliance' },
    ],
  },

  psych_substance: {
    id: 'psych_substance',
    label: 'Substance Use History',
    phase: 'social_history',
    constitutionalSectionId: 'substance_use_history',
    cards: [
      { id: 'q_psych_alcohol', phase: 'social_history', question: 'Alcohol use?', type: 'chips', chips: ['None', 'Social', 'Regular', 'Heavy', 'Binge', 'Unknown'], required: true, factKey: 'psych_alcohol' },
      { id: 'q_psych_alcohol_quantity', phase: 'social_history', question: 'Quantity (units/week)?', type: 'text', required: false, factKey: 'psych_alcohol_quantity', dependsOn: { questionId: 'q_psych_alcohol', value: 'Regular' } },
      { id: 'q_psych_tobacco', phase: 'social_history', question: 'Tobacco use?', type: 'chips', chips: ['None', 'Social', 'Daily', 'Unknown'], required: false, factKey: 'psych_tobacco' },
      { id: 'q_psych_cannabis', phase: 'social_history', question: 'Cannabis use?', type: 'chips', chips: ['None', 'Past', 'Current', 'Unknown'], required: false, factKey: 'psych_cannabis' },
      { id: 'q_psych_drugs', phase: 'social_history', question: 'Other recreational drugs?', type: 'chips', chips: ['None', 'Cocaine', 'Heroin', 'Methamphetamine', 'Benzodiazepines', 'Inhalants', 'Other', 'Unknown'], required: false, factKey: 'psych_drugs' },
      { id: 'q_psych_substance_treatment', phase: 'social_history', question: 'Previous substance use treatment?', type: 'chips', chips: ['None', 'Detoxification', 'Rehabilitation', 'Medication-assisted', 'Support group', 'Unknown'], required: false, factKey: 'psych_substance_treatment' },
    ],
  },

  psych_forensic: {
    id: 'psych_forensic',
    label: 'Forensic & Legal History',
    phase: 'social_history',
    constitutionalSectionId: 'forensic_history',
    cards: [
      { id: 'q_psych_legal_issues', phase: 'social_history', question: 'Current or past legal issues?', type: 'chips', chips: ['None', 'Previous arrest', 'Current charges', 'Incarceration', 'Probation', 'Unknown'], required: false, factKey: 'psych_legal_issues' },
      { id: 'q_psych_violence', phase: 'social_history', question: 'History of violence?', type: 'chips', chips: ['None', 'Towards others', 'Towards self', 'Both', 'Unknown'], required: false, factKey: 'psych_violence' },
      { id: 'q_psych_restraining_order', phase: 'social_history', question: 'Restraining orders?', type: 'chips', chips: ['None', 'Active', 'Previous', 'Unknown'], required: false, factKey: 'psych_restraining_order' },
    ],
  },

  psych_premorbid: {
    id: 'psych_premorbid',
    label: 'Premorbid Personality',
    phase: 'social_history',
    constitutionalSectionId: 'premorbid_personality',
    cards: [
      { id: 'q_psych_premorbid_traits', phase: 'social_history', question: 'Premorbid personality traits?', type: 'chips', chips: ['Well-adjusted', 'Anxious', 'Withdrawn', 'Impulsive', 'Histrionic', 'Paranoid', 'Obsessive-compulsive', 'Dependent', 'Other', 'Unknown'], required: false, factKey: 'psych_premorbid_traits' },
      { id: 'q_psych_functioning', phase: 'social_history', question: 'Premorbid level of functioning?', type: 'chips', chips: ['Independent', 'Partially independent', 'Dependent', 'Unable to assess'], required: false, factKey: 'psych_functioning' },
      { id: 'q_psych_social_support', phase: 'social_history', question: 'Social support network?', type: 'chips', chips: ['Good', 'Moderate', 'Poor', 'None', 'Unknown'], required: false, factKey: 'psych_social_support' },
      { id: 'q_psych_employment', phase: 'social_history', question: 'Employment status?', type: 'chips', chips: ['Employed', 'Unemployed', 'Student', 'Retired', 'Disabled', 'Other'], required: false, factKey: 'psych_employment' },
    ],
  },
};
