import { QuestionGroup } from '../../types/ces';

export const exam_cvs_general: QuestionGroup = {
  id: 'exam_cvs_general',
  label: 'Cardiovascular — General',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_cvs_jvp', phase: 'systemic_exam', question: 'Jugular Venous Pressure', type: 'chips', chips: ['Not elevated', 'Elevated', 'Raised + 2cm', 'Raised + >5cm', 'Not assessed'], required: true, factKey: 'cvs_jvp' },
    { id: 'q_exam_cvs_apex', phase: 'systemic_exam', question: 'Apex beat position', type: 'chips', chips: ['Normal (5th ICS MCL)', 'Displaced left', 'Displaced down & out', 'Not palpable', 'Heaving'], required: false, factKey: 'cvs_apex' },
    { id: 'q_exam_cvs_peripheral_pulses', phase: 'systemic_exam', question: 'Peripheral pulses', type: 'chips', chips: ['All present', 'Reduced — all', 'Absent — one', 'Bounding', 'Radio-radial delay', 'Radio-femoral delay'], required: false, factKey: 'cvs_peripheral_pulses' },
    { id: 'q_exam_cvs_cap_refill', phase: 'systemic_exam', question: 'Capillary refill time', type: 'chips', chips: ['<2 sec', '2–3 sec', '>3 sec'], required: false, factKey: 'cvs_cap_refill' },
    { id: 'q_exam_cvs_edema', phase: 'systemic_exam', question: 'Pedal edema?', type: 'chips', chips: ['None', 'Ankle', 'Leg', 'Sacral', 'Generalized'], required: false, factKey: 'cvs_edema' },
  ],
};

export const exam_cvs_auscultation: QuestionGroup = {
  id: 'exam_cvs_auscultation',
  label: 'Cardiovascular — Auscultation',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_cvs_s1', phase: 'systemic_exam', question: 'S1', type: 'chips', chips: ['Normal', 'Reduced', 'Loud', 'Split'], required: true, factKey: 'cvs_s1' },
    { id: 'q_exam_cvs_s2', phase: 'systemic_exam', question: 'S2', type: 'chips', chips: ['Normal', 'Reduced', 'Loud', 'Split — physiological', 'Split — fixed', 'Paradoxical split'], required: true, factKey: 'cvs_s2' },
    { id: 'q_exam_cvs_s3', phase: 'systemic_exam', question: 'S3?', type: 'boolean', required: false, factKey: 'cvs_s3' },
    { id: 'q_exam_cvs_s4', phase: 'systemic_exam', question: 'S4?', type: 'boolean', required: false, factKey: 'cvs_s4' },
    { id: 'q_exam_cvs_murmurs', phase: 'systemic_exam', question: 'Murmurs?', type: 'chips', chips: ['None', 'Systolic — mitral', 'Systolic — aortic', 'Diastolic — aortic', 'Diastolic — mitral', 'Pan-systolic', 'Continuous'], required: false, factKey: 'cvs_murmurs' },
    { id: 'q_exam_cvs_rubs', phase: 'systemic_exam', question: 'Pericardial rub?', type: 'boolean', required: false, factKey: 'cvs_pericardial_rub' },
  ],
};
