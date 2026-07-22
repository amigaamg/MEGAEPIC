import { QuestionGroup } from '../../types/ces';

export const exam_msk_upper: QuestionGroup = {
  id: 'exam_msk_upper',
  label: 'Musculoskeletal — Upper Limbs',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_msk_upper_inspect', phase: 'systemic_exam', question: 'Upper limb inspection', type: 'chips', chips: ['Normal', 'Swelling — joint', 'Deformity', 'Muscle wasting', 'Clubbing', 'Cyanosis'], required: false, factKey: 'msk_upper_inspect' },
    { id: 'q_exam_msk_upper_rom', phase: 'systemic_exam', question: 'Upper limb range of motion', type: 'chips', chips: ['Full', 'Limited — shoulder', 'Limited — elbow', 'Limited — wrist', 'Limited — fingers'], required: false, factKey: 'msk_upper_rom' },
    { id: 'q_exam_msk_upper_tenderness', phase: 'systemic_exam', question: 'Upper limb tenderness?', type: 'boolean', required: false, factKey: 'msk_upper_tenderness' },
  ],
};

export const exam_msk_lower: QuestionGroup = {
  id: 'exam_msk_lower',
  label: 'Musculoskeletal — Lower Limbs',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_msk_lower_inspect', phase: 'systemic_exam', question: 'Lower limb inspection', type: 'chips', chips: ['Normal', 'Swelling — joint', 'Deformity', 'Muscle wasting', 'Venous eczema', 'Ulceration'], required: false, factKey: 'msk_lower_inspect' },
    { id: 'q_exam_msk_lower_rom', phase: 'systemic_exam', question: 'Lower limb range of motion', type: 'chips', chips: ['Full', 'Limited — hip', 'Limited — knee', 'Limited — ankle'], required: false, factKey: 'msk_lower_rom' },
    { id: 'q_exam_msk_lower_tenderness', phase: 'systemic_exam', question: 'Lower limb tenderness?', type: 'boolean', required: false, factKey: 'msk_lower_tenderness' },
    { id: 'q_exam_msk_lower_hips', phase: 'systemic_exam', question: 'Hip special tests', type: 'chips', chips: ['Normal', 'Limited internal rotation', 'Thomas test +', 'Trendelenburg +', 'Leg length discrepancy'], required: false, factKey: 'msk_lower_hips' },
  ],
};

export const exam_msk_spine: QuestionGroup = {
  id: 'exam_msk_spine',
  label: 'Musculoskeletal — Spine',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_msk_spine_inspect', phase: 'systemic_exam', question: 'Spine inspection', type: 'chips', chips: ['Normal alignment', 'Scoliosis', 'Kyphosis', 'Lordosis', 'Step deformity'], required: false, factKey: 'msk_spine_inspect' },
    { id: 'q_exam_msk_spine_rom', phase: 'systemic_exam', question: 'Spine range of motion', type: 'chips', chips: ['Full', 'Limited — flexion', 'Limited — extension', 'Limited — lateral'], required: false, factKey: 'msk_spine_rom' },
    { id: 'q_exam_msk_spine_tenderness', phase: 'systemic_exam', question: 'Spinal tenderness?', type: 'boolean', required: false, factKey: 'msk_spine_tenderness' },
  ],
};
