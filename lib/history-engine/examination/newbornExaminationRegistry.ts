// ── NEWBORN EXAMINATION REGISTRY ──
// Head-to-toe examination for newborns (0-28 days)

export interface NewbornExamField {
  id: string;
  category: string;
  label: string;
  type: 'select' | 'text' | 'number' | 'boolean';
  options?: string[];
  placeholder?: string;
}

export const NEWBORN_EXAM_FIELDS: NewbornExamField[] = [
  // Vital Signs
  { id: 'nb_temp', label: 'Temperature (°C)', category: 'vitals', type: 'number', placeholder: '36.5' },
  { id: 'nb_hr', label: 'Heart Rate (/min)', category: 'vitals', type: 'number', placeholder: '140' },
  { id: 'nb_rr', label: 'Respiratory Rate (/min)', category: 'vitals', type: 'number', placeholder: '40' },
  { id: 'nb_spo2', label: 'Oxygen Saturation (%)', category: 'vitals', type: 'number', placeholder: '97' },
  { id: 'nb_blood_sugar', label: 'Blood Sugar (mmol/L)', category: 'vitals', type: 'number', placeholder: '3.5' },

  // Head & Neck
  { id: 'nb_head_circ', label: 'Head Circumference (cm)', category: 'head_neck', type: 'number', placeholder: '34' },
  { id: 'nb_fontanelles', label: 'Fontanelles', category: 'head_neck', type: 'select',
    options: ['Normal', 'Sunken', 'Bulging', 'Tense'] },
  { id: 'nb_sutures', label: 'Sutures', category: 'head_neck', type: 'select',
    options: ['Normal', 'Overlapping', 'Widely separated'] },
  { id: 'nb_caput', label: 'Caput Succedaneum', category: 'head_neck', type: 'select', options: ['Not present', 'Present'] },
  { id: 'nb_cephalhematoma', label: 'Cephalhematoma', category: 'head_neck', type: 'select', options: ['Not present', 'Present'] },
  { id: 'nb_eyes', label: 'Eyes', category: 'head_neck', type: 'text', placeholder: 'Normal, discharge, jaundice sclera, conjunctivitis' },
  { id: 'nb_ears', label: 'Ears — shape, position, hearing', category: 'head_neck', type: 'text', placeholder: 'Normal, low-set, abnormal pinna' },
  { id: 'nb_nose', label: 'Nose — patency', category: 'head_neck', type: 'text', placeholder: 'Patent bilaterally, choanal atresia' },
  { id: 'nb_mouth', label: 'Mouth — palate, tongue, suck', category: 'head_neck', type: 'text', placeholder: 'Intact palate, normal suck, no tongue tie' },
  { id: 'nb_palate', label: 'Palate', category: 'head_neck', type: 'select', options: ['Intact', 'Cleft lip', 'Cleft palate', 'Both'] },
  { id: 'nb_neck', label: 'Neck', category: 'head_neck', type: 'text', placeholder: 'Supple, no masses, no webbing' },

  // Chest
  { id: 'nb_chest_shape', label: 'Chest shape', category: 'chest', type: 'text', placeholder: 'Symmetric, pectus, funnel' },
  { id: 'nb_breast', label: 'Breast engorgement', category: 'chest', type: 'select', options: ['Not present', 'Mild', 'Moderate'] },
  { id: 'nb_chest_auscultation', label: 'Chest auscultation', category: 'chest', type: 'text', placeholder: 'Clear, crepitations, wheeze, equal air entry' },

  // Abdomen
  { id: 'nb_abdomen', label: 'Abdomen', category: 'abdomen', type: 'text', placeholder: 'Soft, non-distended, no masses' },
  { id: 'nb_umbilical', label: 'Umbilical cord', category: 'abdomen', type: 'select',
    options: ['Normal', 'Infected', 'Bleeding', 'Hernia', 'Granuloma'] },
  { id: 'nb_liver', label: 'Liver palpable', category: 'abdomen', type: 'select', options: ['No', 'Yes (cm below costal margin)'] },
  { id: 'nb_spleen', label: 'Spleen palpable', category: 'abdomen', type: 'select', options: ['No', 'Yes'] },
  { id: 'nb_anus', label: 'Anus', category: 'abdomen', type: 'select', options: ['Normal', 'Imperforate', 'Stenosis', 'Anteriorly placed'] },

  // Genitalia
  { id: 'nb_genitalia', label: 'Genitalia', category: 'genitalia', type: 'text', placeholder: 'Normal male/female, ambiguous, hypospadias' },
  { id: 'nb_testes', label: 'Testes descended', category: 'genitalia', type: 'select', options: ['Yes — both', 'Yes — right only', 'Yes — left only', 'No — undescended'] },
  { id: 'nb_labia', label: 'Labia (female)', category: 'genitalia', type: 'text', placeholder: 'Normal, fused, swollen' },

  // Limbs & Spine
  { id: 'nb_spine', label: 'Spine', category: 'limbs_spine', type: 'text', placeholder: 'Normal, scoliosis, spina bifida, dimple, hair tuft' },
  { id: 'nb_hips', label: 'Hips (Ortolani/Barlow)', category: 'limbs_spine', type: 'select',
    options: ['Normal', 'Suspected dysplasia', 'Dislocated'] },
  { id: 'nb_limbs', label: 'Limbs', category: 'limbs_spine', type: 'text', placeholder: 'Normal, deformity, fracture, clubfoot, extra digits' },
  { id: 'nb_digits', label: 'Digits', category: 'limbs_spine', type: 'text', placeholder: '10/10, polydactyly, syndactyly' },
  { id: 'nb_creases', label: 'Palmar creases', category: 'limbs_spine', type: 'text', placeholder: 'Normal, simian crease (unilateral/bilateral)' },

  // Skin
  { id: 'nb_skin_color', label: 'Skin color', category: 'skin', type: 'select',
    options: ['Pink', 'Jaundiced', 'Pale', 'Cyanosed', 'Mottled'] },
  { id: 'nb_rash', label: 'Rash / lesions', category: 'skin', type: 'text', placeholder: 'None, erythema toxicum, pustules, petechiae' },
  { id: 'nb_birthmarks', label: 'Birth marks', category: 'skin', type: 'text', placeholder: 'None, Mongolian spot, hemangioma, café-au-lait' },
  { id: 'nb_vernix', label: 'Vernix caseosa', category: 'skin', type: 'select', options: ['Present', 'Absent'] },
  { id: 'nb_lanugo', label: 'Lanugo hair', category: 'skin', type: 'select', options: ['Present', 'Absent'] },

  // Neurological
  { id: 'nb_tone', label: 'Muscle tone', category: 'neurological', type: 'select',
    options: ['Normal', 'Hypertonic', 'Hypotonic', 'Floppy'] },
  { id: 'nb_moro', label: 'Moro reflex', category: 'neurological', type: 'select',
    options: ['Present', 'Absent', 'Asymmetric'] },
  { id: 'nb_rooting', label: 'Rooting reflex', category: 'neurological', type: 'select', options: ['Present', 'Absent'] },
  { id: 'nb_sucking', label: 'Sucking reflex', category: 'neurological', type: 'select', options: ['Present', 'Absent'] },
  { id: 'nb_grasping', label: 'Grasping reflex', category: 'neurological', type: 'select', options: ['Present', 'Absent'] },
  { id: 'nb_stepping', label: 'Stepping reflex', category: 'neurological', type: 'select', options: ['Present', 'Absent'] },
  { id: 'nb_babinski', label: 'Babinski reflex', category: 'neurological', type: 'select', options: ['Present', 'Absent'] },
  { id: 'nb_cry', label: 'Cry', category: 'neurological', type: 'select', options: ['Normal', 'Weak', 'High-pitched', 'Absent'] },
  { id: 'nb_activity', label: 'Activity level', category: 'neurological', type: 'select', options: ['Active', 'Lethargic', 'Irritable'] },
];

export const NEWBORN_CATEGORIES = [
  { id: 'vitals', label: 'Vital Signs' },
  { id: 'head_neck', label: 'Head & Neck' },
  { id: 'chest', label: 'Chest' },
  { id: 'abdomen', label: 'Abdomen' },
  { id: 'genitalia', label: 'Genitalia' },
  { id: 'limbs_spine', label: 'Limbs & Spine' },
  { id: 'skin', label: 'Skin' },
  { id: 'neurological', label: 'Neurological' },
] as const;

export default NEWBORN_EXAM_FIELDS;
