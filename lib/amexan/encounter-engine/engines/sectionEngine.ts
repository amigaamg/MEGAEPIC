import type { SectionState, SectionExecutionState } from '../knowledge/symptom-types';
import type { EncounterPhase } from '../types/ces';

export type DocSectionId =
  | 'biodata'
  | 'chief_complaints'
  | 'hpi'
  | 'past_medical_surgical'
  | 'drug_allergy'
  | 'family_history'
  | 'social_history'
  | 'review_of_systems'
  | 'summary';

export const SECTION_LABELS: Record<DocSectionId, string> = {
  biodata: 'Biodata',
  chief_complaints: 'Chief Complaints',
  hpi: 'History of Presenting Illness',
  past_medical_surgical: 'Past Medical & Surgical History',
  drug_allergy: 'Drug & Allergy History',
  family_history: 'Family History',
  social_history: 'Social & Occupational History',
  review_of_systems: 'Review of Systems',
  summary: 'Summary of History',
};

export const PHASE_TO_SECTION: Partial<Record<EncounterPhase, DocSectionId>> = {
  registration: 'biodata',
  chief_complaint: 'chief_complaints',
  hpi: 'hpi',
  past_medical: 'past_medical_surgical',
  past_surgical: 'past_medical_surgical',
  drug_history: 'drug_allergy',
  allergies: 'drug_allergy',
  family_history: 'family_history',
  social_history: 'social_history',
  review_of_systems: 'review_of_systems',
};

export interface QuickCompleteAction {
  sectionId: DocSectionId;
  label: string;
  fillAnswers: Record<string, any>;
}

export const NO_SIGNIFICANT_HISTORY_ACTIONS: QuickCompleteAction[] = [
  {
    sectionId: 'past_medical_surgical',
    label: 'No significant PMH',
    fillAnswers: {
      pmh_has_conditions: 'None',
      pmh_conditions: ['None'],
      q_psh_previous_surgery: false,
    },
  },
  {
    sectionId: 'drug_allergy',
    label: 'No known drug allergy',
    fillAnswers: {
      q_all_known: 'None known',
      allergy_category: 'None known',
    },
  },
  {
    sectionId: 'family_history',
    label: 'No significant FH',
    fillAnswers: {
      fh_conditions: ['None'],
    },
  },
  {
    sectionId: 'social_history',
    label: 'No significant SH',
    fillAnswers: {
      smoking: 'Never',
      alcohol: 'None',
      recreational_drugs: 'None',
    },
  },
];

export const SECTION_VISIBLE_IF_ANSWERED: Partial<Record<DocSectionId, string[]>> = {
  past_medical_surgical: ['pmh_conditions', 'q_psh_previous_surgery'],
  drug_allergy: ['allergies'],
  family_history: ['fh_conditions'],
  social_history: ['smoking', 'alcohol'],
  review_of_systems: Object.keys(Array(20).fill(0)).map((_, i) => `q_ros_${i}`),
};

export function createSectionStates(): Record<DocSectionId, SectionState> {
  const ids: DocSectionId[] = [
    'biodata', 'chief_complaints', 'hpi', 'past_medical_surgical',
    'drug_allergy', 'family_history', 'social_history', 'review_of_systems', 'summary',
  ];
  const states: Record<string, SectionState> = {};
  for (const id of ids) {
    states[id] = {
      sectionId: id,
      status: 'not_started',
      visited: false,
      skippedQuestions: [],
      deferredQuestions: [],
    };
  }
  return states as Record<DocSectionId, SectionState>;
}

export function determineSectionStatus(
  sectionId: DocSectionId,
  currentPhase: EncounterPhase,
  completedPhases: EncounterPhase[],
  answers: Record<string, { value: any }>,
): SectionExecutionState {
  if (sectionId === 'biodata') {
    const name = answers['q_patient_name']?.value;
    return name ? 'completed' : 'in_progress';
  }
  if (sectionId === 'chief_complaints') {
    const cc = answers['q_cc_primary']?.value;
    return cc ? 'completed' : 'in_progress';
  }
  if (sectionId === 'hpi') {
    const hpiPhases: EncounterPhase[] = ['hpi'];
    const anyAnswered = hpiPhases.some(p => completedPhases.includes(p));
    const hasAnswers = ['q_socrates_site', 'q_hpi_onset', 'q_fever_onset'].some(k => answers[k]?.value);
    if (hasAnswers) return 'completed';
    if (anyAnswered || Object.keys(answers).some(k => k.startsWith('q_socrates_') || k.startsWith('q_fever_') || k.startsWith('q_hpi_'))) return 'in_progress';
    return 'not_started';
  }
  if (sectionId === 'past_medical_surgical') {
    const pmhHas = answers['q_pmh_has_conditions']?.value;
    const pmh = answers['q_pmh_conditions']?.value;
    const psh = answers['q_psh_previous_surgery']?.value;
    if (pmhHas === 'None') return 'completed';
    if (pmhHas === 'Yes' && Array.isArray(pmh) && pmh.length > 0) {
      const filtered = pmh.filter(c => !['None', 'none', ''].includes(String(c)));
      return filtered.length > 0 ? 'in_progress' : 'completed';
    }
    const pmhDone = completedPhases.includes('past_medical');
    const pshDone = completedPhases.includes('past_surgical');
    if ((pmhHas && pmhDone) || (psh === true || psh === false)) return 'in_progress';
    if (pmhDone || pshDone) return 'completed_with_unknowns';
    return 'not_started';
  }
  if (sectionId === 'drug_allergy') {
    const hasDrug = Object.keys(answers).some(k => k === 'q_dh_current_meds' || k.startsWith('q_dh_'));
    const hasAllergy = answers['q_all_known']?.value;
    if (hasAllergy) return 'completed';
    if (hasDrug) return 'in_progress';
    const phaseDone = completedPhases.includes('drug_history') || completedPhases.includes('allergies');
    return phaseDone ? 'completed_with_unknowns' : 'not_started';
  }
  if (sectionId === 'family_history') {
    const fh = answers['q_fh_conditions']?.value;
    if (fh) return 'completed';
    if (completedPhases.includes('family_history')) return 'completed_with_unknowns';
    return 'not_started';
  }
  if (sectionId === 'social_history') {
    const smoking = answers['q_sh_smoking']?.value;
    if (smoking) return 'completed';
    if (completedPhases.includes('social_history')) return 'completed_with_unknowns';
    return 'not_started';
  }
  if (sectionId === 'review_of_systems') {
    const rosAnswered = Object.keys(answers).some(k => k.startsWith('q_ros_'));
    if (rosAnswered) return 'completed';
    if (completedPhases.includes('review_of_systems')) return 'completed_with_unknowns';
    return 'not_started';
  }
  if (sectionId === 'summary') {
    const hasAnyHistory = Object.keys(answers).length > 3;
    if (hasAnyHistory) return 'completed';
    const summaryPhases: EncounterPhase[] = ['past_medical', 'drug_history', 'family_history', 'social_history', 'review_of_systems'];
    if (summaryPhases.some(p => completedPhases.includes(p))) return 'in_progress';
    return 'not_started';
  }
  return 'not_started';
}

export function updateSectionStates(
  existing: Record<DocSectionId, SectionState>,
  currentPhase: EncounterPhase,
  completedPhases: EncounterPhase[],
  answers: Record<string, { value: any }>,
): Record<DocSectionId, SectionState> {
  const updated = { ...existing };

  for (const sectionId of Object.keys(updated) as DocSectionId[]) {
    const status = determineSectionStatus(sectionId, currentPhase, completedPhases, answers);
    const prev = updated[sectionId];
    updated[sectionId] = {
      ...prev,
      status,
      visited: prev.visited || status !== 'not_started',
      completedAt: status === 'completed' && prev.status !== 'completed' ? Date.now() : prev.completedAt,
    };
  }

  return updated;
}
