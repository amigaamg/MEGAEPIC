import type { DepartmentDefinition } from './index';

export const endocrinology: DepartmentDefinition = {
  id: 'ENDO',
  name: 'Endocrinology',
  shortName: 'ENDO',
  description: 'Disorders of the endocrine system including diabetes, thyroid, pituitary, adrenal, and metabolic bone disease.',
  icon: '🔬',
  color: '#f59e0b',
  sections: [
    {
      id: 'diabetes',
      name: 'Diabetes Mellitus',
      description: 'Type 1 and type 2 diabetes, gestational diabetes, metabolic syndrome',
      diseaseCategories: ['Type 1 diabetes', 'Type 2 diabetes', 'Gestational diabetes', 'Diabetic ketoacidosis', 'Hyperosmolar hyperglycaemic state', 'Hypoglycaemia', 'Metabolic syndrome'],
    },
    {
      id: 'thyroid',
      name: 'Thyroid Disorders',
      description: 'Hyperthyroidism, hypothyroidism, thyroid nodules, thyroid cancer',
      diseaseCategories: ['Graves disease', 'Hashimoto thyroiditis', 'Toxic multinodular goitre', 'Subacute thyroiditis', 'Thyroid nodule', 'Thyroid cancer', 'Myxoedema coma', 'Thyroid storm'],
    },
    {
      id: 'pituitary',
      name: 'Pituitary & Hypothalamus',
      description: 'Anterior and posterior pituitary disorders',
      diseaseCategories: ['Pituitary adenoma', 'Acromegaly', 'Prolactinoma', 'Cushing disease', 'Sheehan syndrome', 'Diabetes insipidus', 'SIADH', 'Hypopituitarism'],
    },
    {
      id: 'adrenal',
      name: 'Adrenal Disorders',
      description: 'Adrenal cortex and medulla pathologies',
      diseaseCategories: ['Adrenal insufficiency', 'Cushing syndrome', 'Conn syndrome', 'Phaeochromocytoma', 'Congenital adrenal hyperplasia', 'Adrenal incidentaloma'],
    },
    {
      id: 'bone-metabolism',
      name: 'Metabolic Bone Disease',
      description: 'Calcium and phosphate metabolism, bone density disorders',
      diseaseCategories: ['Osteoporosis', 'Osteomalacia', 'Hyperparathyroidism', 'Hypoparathyroidism', 'Paget disease of bone', 'Vitamin D deficiency'],
    },
  ],
  commonSymptoms: [
    'polyuria', 'polydipsia', 'weight_loss', 'weight_gain', 'fatigue',
    'heat_intolerance', 'cold_intolerance', 'palpitations', 'tremor',
    'constipation', 'diarrhoea', 'menstrual_irregularity', 'infertility',
    'hirsutism', 'acne', 'galactorrhoea', 'headache', 'visual_field_loss',
    'bone_pain', 'fragility_fracture', 'muscle_weakness', 'proximal_myopathy',
    'easy_bruising', 'striae', 'moon_face', 'buffalo_hump', 'hyperglycaemia',
    'hypoglycaemia', 'altered_consciousness', 'dehydration',
  ],
  commonInvestigations: [
    'Blood glucose', 'HbA1c', 'Oral glucose tolerance test', 'TSH', 'FT4', 'FT3',
    'Cortisol', 'ACTH', 'Dexamethasone suppression test', 'Urine free cortisol',
    'Prolactin', 'IGF-1', 'Growth hormone suppression test', 'Aldosterone/renin ratio',
    'Metanephrines', 'Calcium', 'Phosphate', 'Vitamin D', 'PTH', 'Bone density DEXA',
    'Thyroid ultrasound', 'Thyroid antibodies', 'Adrenal CT', 'Pituitary MRI',
  ],
};
