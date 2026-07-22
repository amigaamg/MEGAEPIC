import { QuestionGroup } from '../../types/ces';

export const exam_resp_general: QuestionGroup = {
  id: 'exam_resp_general',
  label: 'Respiratory — Inspection & General',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_resp_symmetry', phase: 'systemic_exam', question: 'Chest symmetry', type: 'chips', chips: ['Symmetrical', 'Asymmetrical — right', 'Asymmetrical — left'], required: true, factKey: 'resp_symmetry' },
    { id: 'q_exam_resp_expansion', phase: 'systemic_exam', question: 'Chest expansion', type: 'chips', chips: ['Normal', 'Reduced — right', 'Reduced — left', 'Bilateral reduced'], required: false, factKey: 'resp_expansion' },
    { id: 'q_exam_resp_trachea', phase: 'systemic_exam', question: 'Trachea', type: 'chips', chips: ['Central', 'Deviated — right', 'Deviated — left'], required: false, factKey: 'resp_trachea' },
    { id: 'q_exam_resp_fremitus', phase: 'systemic_exam', question: 'Tactile vocal fremitus', type: 'chips', chips: ['Normal', 'Increased', 'Reduced', 'Absent'], required: false, factKey: 'resp_fremitus' },
    { id: 'q_exam_resp_use_accessory', phase: 'systemic_exam', question: 'Use of accessory muscles?', type: 'boolean', required: false, factKey: 'resp_accessory_muscles' },
    { id: 'q_exam_resp_intercostal', phase: 'systemic_exam', question: 'Intercostal recession?', type: 'boolean', required: false, factKey: 'resp_intercostal_recession' },
  ],
};

export const exam_resp_percussion: QuestionGroup = {
  id: 'exam_resp_percussion',
  label: 'Respiratory — Percussion',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_resp_perc_note', phase: 'systemic_exam', question: 'Percussion note', type: 'chips', chips: ['Resonant', 'Dull', 'Stony dull', 'Hyperresonant', 'Tympanic'], required: true, factKey: 'resp_perc_note' },
    { id: 'q_exam_resp_perc_liver', phase: 'systemic_exam', question: 'Liver dullness', type: 'chips', chips: ['Preserved', 'Obliterated', 'Pushed down'], required: false, factKey: 'resp_perc_liver' },
    { id: 'q_exam_resp_perc_cardiac', phase: 'systemic_exam', question: 'Cardiac dullness', type: 'chips', chips: ['Normal', 'Displaced', 'Absent'], required: false, factKey: 'resp_perc_cardiac_dullness' },
  ],
};

export const exam_resp_auscultation: QuestionGroup = {
  id: 'exam_resp_auscultation',
  label: 'Respiratory — Auscultation',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_resp_breath_sounds', phase: 'systemic_exam', question: 'Breath sounds', type: 'chips', chips: ['Vesicular — normal', 'Bronchial', 'Reduced', 'Absent'], required: true, factKey: 'resp_breath_sounds' },
    { id: 'q_exam_resp_wheeze', phase: 'systemic_exam', question: 'Wheezes?', type: 'chips', chips: ['None', 'Expiratory', 'Inspiratory', 'Biphasic'], required: false, factKey: 'resp_wheeze' },
    { id: 'q_exam_resp_crackles', phase: 'systemic_exam', question: 'Crackles/crepitations?', type: 'chips', chips: ['None', 'Fine — basal', 'Coarse — basal', 'Coarse — all zones', 'Bibasal'], required: false, factKey: 'resp_crackles' },
    { id: 'q_exam_resp_pleural_rub', phase: 'systemic_exam', question: 'Pleural rub?', type: 'boolean', required: false, factKey: 'resp_pleural_rub' },
    { id: 'q_exam_resp_whisper', phase: 'systemic_exam', question: 'Whispering pectoriloquy?', type: 'boolean', required: false, factKey: 'resp_whisper' },
  ],
};
