import { QuestionGroup } from '../../types/ces';

export const exam_neuro_cranial: QuestionGroup = {
  id: 'exam_neuro_cranial',
  label: 'Neurological — Cranial Nerves',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_neuro_cn1', phase: 'systemic_exam', question: 'CN I (Olfactory)', type: 'chips', chips: ['Intact', 'Not tested', 'Reduced', 'Absent'], required: false, factKey: 'neuro_cn1' },
    { id: 'q_exam_neuro_cn2', phase: 'systemic_exam', question: 'CN II (Optic) — visual acuity', type: 'chips', chips: ['Normal', 'Reduced', 'Counting fingers', 'Hand movement', 'Light perception', 'No perception'], required: true, factKey: 'neuro_cn2' },
    { id: 'q_exam_neuro_cn3_4_6', phase: 'systemic_exam', question: 'CN III, IV, VI (EOM)', type: 'chips', chips: ['Full EOM', 'Ptosis', 'Nystagmus', 'Strabismus', 'Diplopia on gaze'], required: false, factKey: 'neuro_cn3_4_6' },
    { id: 'q_exam_neuro_pupils', phase: 'systemic_exam', question: 'Pupils', type: 'chips', chips: ['Equal & reactive', 'Unequal', 'Sluggish', 'Fixed & dilated', 'Pinpoint'], required: true, factKey: 'neuro_pupils' },
    { id: 'q_exam_neuro_cn5', phase: 'systemic_exam', question: 'CN V (Trigeminal)', type: 'chips', chips: ['Intact', 'Reduced sensation', 'Motor weak'], required: false, factKey: 'neuro_cn5' },
    { id: 'q_exam_neuro_cn7', phase: 'systemic_exam', question: 'CN VII (Facial)', type: 'chips', chips: ['Intact', 'Upper weak', 'Lower weak', 'Both'], required: false, factKey: 'neuro_cn7' },
    { id: 'q_exam_neuro_cn8', phase: 'systemic_exam', question: 'CN VIII (Auditory)', type: 'chips', chips: ['Intact', 'Reduced — left', 'Reduced — right', 'Bilateral reduced'], required: false, factKey: 'neuro_cn8' },
    { id: 'q_exam_neuro_cn9_10', phase: 'systemic_exam', question: 'CN IX, X (Gag/cough)', type: 'chips', chips: ['Intact', 'Reduced gag', 'Dysphonia', 'Palatal deviation'], required: false, factKey: 'neuro_cn9_10' },
    { id: 'q_exam_neuro_cn11', phase: 'systemic_exam', question: 'CN XI (Spinal accessory)', type: 'chips', chips: ['Intact', 'Trapezius weak', 'SCM weak'], required: false, factKey: 'neuro_cn11' },
    { id: 'q_exam_neuro_cn12', phase: 'systemic_exam', question: 'CN XII (Hypoglossal)', type: 'chips', chips: ['Intact', 'Deviation', 'Fasciculation'], required: false, factKey: 'neuro_cn12' },
  ],
};

export const exam_neuro_motor: QuestionGroup = {
  id: 'exam_neuro_motor',
  label: 'Neurological — Motor',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_neuro_tone', phase: 'systemic_exam', question: 'Muscle tone', type: 'chips', chips: ['Normal', 'Increased (spastic)', 'Increased (rigid)', 'Decreased (flaccid)', 'Paratonic'], required: true, factKey: 'neuro_tone' },
    { id: 'q_exam_neuro_power_arms', phase: 'systemic_exam', question: 'Power — upper limbs', type: 'chips', chips: ['5/5', '4/5', '3/5', '2/5', '1/5', '0/5'], required: false, factKey: 'neuro_power_arms' },
    { id: 'q_exam_neuro_power_legs', phase: 'systemic_exam', question: 'Power — lower limbs', type: 'chips', chips: ['5/5', '4/5', '3/5', '2/5', '1/5', '0/5'], required: false, factKey: 'neuro_power_legs' },
    { id: 'q_exam_neuro_bulk', phase: 'systemic_exam', question: 'Muscle bulk', type: 'chips', chips: ['Normal', 'Wasting — focal', 'Wasting — generalized', 'Hypertrophy'], required: false, factKey: 'neuro_bulk' },
    { id: 'q_exam_neuro_fasciculations', phase: 'systemic_exam', question: 'Fasciculations?', type: 'boolean', required: false, factKey: 'neuro_fasciculations' },
  ],
};

export const exam_neuro_sensory: QuestionGroup = {
  id: 'exam_neuro_sensory',
  label: 'Neurological — Sensory',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_neuro_light_touch', phase: 'systemic_exam', question: 'Light touch', type: 'chips', chips: ['Normal', 'Reduced', 'Absent', 'Hyperesthetic'], required: true, factKey: 'neuro_light_touch' },
    { id: 'q_exam_neuro_pain', phase: 'systemic_exam', question: 'Pinprick sensation', type: 'chips', chips: ['Normal', 'Reduced', 'Absent', 'Increased'], required: false, factKey: 'neuro_pain_sensation' },
    { id: 'q_exam_neuro_vibration', phase: 'systemic_exam', question: 'Vibration sense', type: 'chips', chips: ['Normal', 'Reduced — ankles', 'Reduced — knees', 'Absent'], required: false, factKey: 'neuro_vibration' },
    { id: 'q_exam_neuro_proprioception', phase: 'systemic_exam', question: 'Proprioception', type: 'chips', chips: ['Normal', 'Impaired — toes', 'Impaired — ankles', 'Absent'], required: false, factKey: 'neuro_proprioception' },
    { id: 'q_exam_neuro_sensory_level', phase: 'systemic_exam', question: 'Sensory level?', type: 'text', required: false, factKey: 'neuro_sensory_level' },
  ],
};

export const exam_neuro_reflexes: QuestionGroup = {
  id: 'exam_neuro_reflexes',
  label: 'Neurological — Reflexes & Cerebellar',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_neuro_reflexes_arms', phase: 'systemic_exam', question: 'Upper limb reflexes', type: 'chips', chips: ['Normal', 'Increased', 'Reduced', 'Absent', 'Clonus'], required: false, factKey: 'neuro_reflexes_arms' },
    { id: 'q_exam_neuro_reflexes_legs', phase: 'systemic_exam', question: 'Lower limb reflexes', type: 'chips', chips: ['Normal', 'Increased', 'Reduced', 'Absent', 'Clonus'], required: false, factKey: 'neuro_reflexes_legs' },
    { id: 'q_exam_neuro_plantar', phase: 'systemic_exam', question: 'Plantar response', type: 'chips', chips: ['Flexor', 'Extensor — right', 'Extensor — left', 'Bilateral extensor'], required: false, factKey: 'neuro_plantar' },
    { id: 'q_exam_neuro_coordination', phase: 'systemic_exam', question: 'Coordination', type: 'chips', chips: ['Normal', 'Dysdiadochokinesia', 'Past-pointing', 'Intention tremor', 'Ataxic gait'], required: false, factKey: 'neuro_coordination' },
    { id: 'q_exam_neuro_gait', phase: 'systemic_exam', question: 'Gait', type: 'chips', chips: ['Normal', 'Hemiparetic', 'Ataxic', 'Parkinsonian', 'Trendelenburg', 'High-stepping', 'Unable to walk'], required: false, factKey: 'neuro_gait' },
    { id: 'q_exam_neuro_meningism', phase: 'systemic_exam', question: 'Meningeal signs', type: 'chips', chips: ['None', 'Neck stiffness', 'Kernig +', 'Brudzinski +'], required: false, factKey: 'neuro_meningism' },
  ],
};
