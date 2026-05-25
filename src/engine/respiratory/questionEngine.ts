import { Symptom } from '@/src/types';
import { EnhancedQuestionNode } from '@/src/types/clinical';

const questionBank: EnhancedQuestionNode[] = [
  // ── TRIAGE (always asked first) ──
  {
    id: 'triage_emergency',
    text: 'Does the child have any immediate life-threatening signs? (severe respiratory distress, cyanosis, unconscious, convulsing, severe dehydration)',
    type: 'boolean',
    category: 'triage',
  },
  {
    id: 'symptom_duration',
    text: 'Duration of symptoms',
    type: 'single',
    options: ['Less than 3 days', '3–7 days', '1–4 weeks', 'More than 4 weeks'],
    category: 'history',
    branching: [
      { targetId: 'tb_screen', when: { symptom_duration: 'gt4wk' } },
    ],
  },
  {
    id: 'fever_present',
    text: 'Is there fever (temperature ≥37.5°C)?',
    type: 'boolean',
    triggerSymptoms: ['fever'],
  },
  {
    id: 'fever_duration',
    text: 'How long has the fever been present?',
    type: 'single',
    options: ['< 3 days', '3–7 days', '> 7 days'],
    dependsOn: 'fever_present',
  },
  {
    id: 'cough_duration',
    text: 'How long has the cough been present?',
    type: 'single',
    options: ['Less than 2 weeks', '2–4 weeks', 'More than 4 weeks'],
    triggerSymptoms: ['cough'],
    branching: [
      { targetId: 'tb_screen', when: { cough_duration: 'gt4wk' } },
    ],
  },
  {
    id: 'cough_character',
    text: 'What is the character of the cough?',
    type: 'single',
    options: ['Dry / non-productive', 'Productive / wet', 'Barking / seal-like', 'Paroxysmal / whooping'],
    triggerSymptoms: ['cough'],
  },
  {
    id: 'wheeze_present',
    text: 'Is there audible wheeze?',
    type: 'boolean',
    triggerSymptoms: ['wheeze', 'difficulty_breathing'],
    branching: [
      { targetId: 'asthma_history', when: { wheeze_present: 'present' } },
    ],
  },
  {
    id: 'asthma_history',
    text: 'Has the child had previous wheezing episodes?',
    type: 'boolean',
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
    id: 'trigger_exposure',
    text: 'Is there a known trigger? (allergens, cold air, exercise, smoke)',
    type: 'multi',
    options: ['Allergens', 'Cold air', 'Exercise', 'Smoke', 'Infections', 'None known'],
    triggerSymptoms: ['wheeze'],
  },
  {
    id: 'bronchodilator_response',
    text: 'Has the child had any response to a bronchodilator (e.g. salbutamol)?',
    type: 'boolean',
    triggerSymptoms: ['wheeze'],
  },
  {
    id: 'family_history_atopy',
    text: 'Is there a family history of asthma, eczema, or allergic rhinitis?',
    type: 'boolean',
    triggerSymptoms: ['wheeze'],
  },
  {
    id: 'tb_contact',
    text: 'Is there a known TB contact in the household?',
    type: 'boolean',
    triggerSymptoms: ['cough'],
    branching: [
      { targetId: 'tb_screen', when: { tb_contact: 'present' } },
    ],
  },
  {
    id: 'tb_screen',
    text: 'Does the child have any of the following TB suspects? (select all that apply)',
    type: 'multi',
    options: ['Chronic cough > 4 weeks', 'Weight loss / failure to thrive', 'Drenching night sweats', 'Lymphadenopathy', 'TB contact', 'Unexplained fever > 2 weeks'],
    triggerSymptoms: ['cough'],
  },
  {
    id: 'weight_loss',
    text: 'Is there documented weight loss or growth faltering?',
    type: 'boolean',
  },
  {
    id: 'night_sweats',
    text: 'Does the child have drenching night sweats?',
    type: 'boolean',
  },
  {
    id: 'reduced_feeding',
    text: 'Is the child feeding significantly less than normal?',
    type: 'boolean',
    triggerSymptoms: ['difficulty_breathing', 'cough'],
  },
  {
    id: 'stridor_present',
    text: 'Is there stridor (harsh inspiratory sound)?',
    type: 'boolean',
    triggerSymptoms: ['noisy_breathing', 'difficulty_breathing'],
    branching: [
      { targetId: 'croup_severity', when: { stridor_present: 'present' } },
    ],
  },
  {
    id: 'croup_severity',
    text: 'Is the stridor present at rest or only when agitated?',
    type: 'single',
    options: ['Only when agitated / crying', 'Present at rest', 'Biphasic stridor'],
  },
  {
    id: 'cyanosis_history',
    text: 'Has the child ever turned blue (cyanosis)?',
    type: 'boolean',
    triggerSymptoms: ['cyanosis', 'difficulty_breathing'],
  },
  {
    id: 'chest_pain',
    text: 'Is there chest or abdominal pain?',
    type: 'boolean',
    triggerSymptoms: ['chest_pain'],
  },
  {
    id: 'vomiting',
    text: 'Has the child been vomiting?',
    type: 'boolean',
  },
  {
    id: 'diarrhoea',
    text: 'Is there diarrhoea?',
    type: 'boolean',
  },
  {
    id: 'rash_present',
    text: 'Is there a rash?',
    type: 'boolean',
  },
  {
    id: 'hiv_exposure',
    text: 'Is there known HIV exposure or infection in the child or mother?',
    type: 'boolean',
    triggerSymptoms: ['cough', 'fever'],
    category: 'risk',
  },
  {
    id: 'immunization_status',
    text: 'Is immunization up to date per KEPI schedule?',
    type: 'boolean',
    category: 'risk',
  },
  {
    id: 'malnutrition_screen',
    text: 'Has the child had Mid-Upper Arm Circumference (MUAC) measured?',
    type: 'boolean',
    category: 'exam',
    branching: [
      { targetId: 'muac_value', when: { malnutrition_screen: 'present' } },
    ],
  },
  {
    id: 'muac_value',
    text: 'What is the MUAC measurement?',
    type: 'single',
    options: ['≥ 12.5 cm (Normal)', '11.5–12.4 cm (Moderate malnutrition)', '< 11.5 cm (Severe malnutrition)'],
    category: 'exam',
  },
  {
    id: 'oxygen_home',
    text: 'Does the child require oxygen at home?',
    type: 'boolean',
    category: 'risk',
  },
  {
    id: 'previous_hospitalization',
    text: 'Has the child been hospitalised before for respiratory illness?',
    type: 'boolean',
    category: 'risk',
  },
  {
    id: 'pmtct',
    text: 'Is the child on PMTCT/CTX prophylaxis?',
    type: 'boolean',
    category: 'risk',
  },
  {
    id: 'travel_history',
    text: 'Recent travel or contact with sick persons?',
    type: 'multi',
    options: ['No travel', 'Healthcare facility exposure', 'Travel to high TB area', 'Contact with similar illness', 'Hospitalisation in last 6 months'],
    category: 'social',
  },
];

export class ClinicalQuestionEngine {
  private asked = new Set<string>();

  reset(): void {
    this.asked.clear();
  }

  getNextQuestion(
    symptoms: Symptom[],
    answers: Record<string, string | string[] | boolean | number>,
    phase: ClinicalInterviewPhase
  ): EnhancedQuestionNode | null {
    if (phase === 'complete') return null;

    for (const q of questionBank) {
      if (this.asked.has(q.id)) continue;

      const triggered = !q.triggerSymptoms || q.triggerSymptoms.some(s => symptoms.includes(s));
      if (!triggered) continue;

      const depsMet = !q.dependsOn || this.isTruthy(answers[q.dependsOn]);
      if (!depsMet) continue;

      if (q.category !== 'triage' && phase === 'triage') continue;
      if (q.category === 'exam' && phase === 'history') continue;

      const branchActive = this.evaluateBranching(q, answers);
      if (!branchActive) continue;

      this.asked.add(q.id);
      return q;
    }

    if (phase === 'triage') return null;
    if (phase === 'history') return null;

    return null;
  }

  private isTruthy(val: unknown): boolean {
    if (val === true || val === 'true' || val === 'present') return true;
    if (Array.isArray(val) && val.length > 0) return true;
    return false;
  }

  private evaluateBranching(
    q: EnhancedQuestionNode,
    answers: Record<string, string | string[] | boolean | number>
  ): boolean {
    if (!q.branching || q.branching.length === 0) return true;
    for (const branch of q.branching) {
      const allMatch = Object.entries(branch.when).every(([key, condition]) => {
        const val = answers[key];
        if (condition === 'present') return this.isTruthy(val);
        if (condition === 'absent') return !this.isTruthy(val);
        if (condition === 'gt4wk') {
          if (typeof val === 'string' && val.includes('More than 4')) return true;
          if (val === 'gt4wk') return true;
          return false;
        }
        return String(val) === condition;
      });
      if (allMatch) return true;
    }
    return false;
  }

  getAnsweredCount(): number {
    return this.asked.size;
  }

  getRemainingCount(symptoms: Symptom[], answers: Record<string, string | string[] | boolean | number>, phase: ClinicalInterviewPhase): number {
    let count = 0;
    for (const q of questionBank) {
      if (this.asked.has(q.id)) continue;
      const triggered = !q.triggerSymptoms || q.triggerSymptoms.some(s => symptoms.includes(s));
      if (!triggered) continue;
      const depsMet = !q.dependsOn || this.isTruthy(answers[q.dependsOn]);
      if (!depsMet) continue;
      if (q.category !== 'triage' && phase === 'triage') continue;
      if (q.category === 'exam' && (phase === 'history' || phase === 'triage')) continue;
      count++;
    }
    return count;
  }
}

export type ClinicalInterviewPhase = 'triage' | 'history' | 'exam' | 'assessment' | 'plan' | 'complete';
export const QUESTION_BANK = questionBank;
