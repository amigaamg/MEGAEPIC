import { QuestionGroup } from '../../types/ces';

export const exam_gu_male: QuestionGroup = {
  id: 'exam_gu_male',
  label: 'Genitourinary — Male',
  phase: 'systemic_exam',
  condition: { factKey: 'sex', value: 'male' },
  cards: [
    { id: 'q_exam_gu_external', phase: 'systemic_exam', question: 'External genitalia', type: 'chips', chips: ['Normal', 'Hypospadias', 'Phimosis', 'Chordee', 'Normal variant'], required: false, factKey: 'gu_external' },
    { id: 'q_exam_gu_testes', phase: 'systemic_exam', question: 'Testes', type: 'chips', chips: ['Normal — both', 'Normal — right', 'Normal — left', 'Absent — right', 'Absent — left', 'Small — right', 'Small — left', 'Swollen — right', 'Swollen — left'], required: false, factKey: 'gu_testes' },
    { id: 'q_exam_gu_epididymis', phase: 'systemic_exam', question: 'Epididymal tenderness?', type: 'chips', chips: ['None', 'Right', 'Left', 'Bilateral'], required: false, factKey: 'gu_epididymis' },
    { id: 'q_exam_gu_urethral', phase: 'systemic_exam', question: 'Urethral discharge?', type: 'boolean', required: false, factKey: 'gu_urethral_discharge' },
    { id: 'q_exam_gu_scrotal_swelling', phase: 'systemic_exam', question: 'Scrotal swelling?', type: 'chips', chips: ['None', 'Hydrocele — right', 'Hydrocele — left', 'Varicocele — right', 'Varicocele — left', 'Inguinoscrotal hernia'], required: false, factKey: 'gu_scrotal_swelling' },
  ],
};

export const exam_gu_female: QuestionGroup = {
  id: 'exam_gu_female',
  label: 'Genitourinary — Female',
  phase: 'systemic_exam',
  condition: { factKey: 'sex', value: 'female' },
  cards: [
    { id: 'q_exam_gu_vaginal', phase: 'systemic_exam', question: 'Vaginal examination', type: 'chips', chips: ['Not indicated', 'Deferred', 'Normal', 'Tenderness — cervix', 'Adnexal tenderness', 'Mass'], required: false, factKey: 'gu_vaginal' },
    { id: 'q_exam_gu_discharge', phase: 'systemic_exam', question: 'Vaginal discharge?', type: 'chips', chips: ['None', 'Clear', 'White', 'Yellow', 'Blood-stained', 'Foul-smelling'], required: false, factKey: 'gu_discharge' },
  ],
};

export const exam_renal: QuestionGroup = {
  id: 'exam_renal',
  label: 'Renal Angle & Flank',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_renal_cva', phase: 'systemic_exam', question: 'Costovertebral angle tenderness?', type: 'chips', chips: ['None', 'Right', 'Left', 'Bilateral'], required: false, factKey: 'renal_cva_tenderness' },
    { id: 'q_exam_renal_palpable', phase: 'systemic_exam', question: 'Ballotable kidney?', type: 'chips', chips: ['Not palpable', 'Right', 'Left', 'Bilateral'], required: false, factKey: 'renal_palpable' },
  ],
};
