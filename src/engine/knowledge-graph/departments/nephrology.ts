import type { DepartmentDefinition } from './index';

export const nephrology: DepartmentDefinition = {
  id: 'RENAL',
  name: 'Nephrology',
  shortName: 'RENAL',
  description: 'Disorders of the kidneys including acute kidney injury, chronic kidney disease, glomerulonephritis, electrolyte disorders, and renal replacement therapy.',
  icon: '💧',
  color: '#8b5cf6',
  sections: [
    {
      id: 'aki',
      name: 'Acute Kidney Injury',
      description: 'Rapid deterioration of renal function from prerenal, intrinsic or postrenal causes',
      diseaseCategories: ['Prerenal AKI', 'Acute tubular necrosis', 'Acute interstitial nephritis', 'Contrast-induced nephropathy', 'Hepatorenal syndrome', 'Urinary obstruction'],
    },
    {
      id: 'ckd',
      name: 'Chronic Kidney Disease',
      description: 'Progressive loss of kidney function with staging and complication management',
      diseaseCategories: ['CKD Stage 1-2', 'CKD Stage 3a-3b', 'CKD Stage 4', 'CKD Stage 5', 'ESRD', 'Renal anaemia', 'Renal osteodystrophy'],
    },
    {
      id: 'glomerular',
      name: 'Glomerular Disease',
      description: 'Primary and secondary glomerulonephritides',
      diseaseCategories: ['Minimal change disease', 'Focal segmental glomerulosclerosis', 'Membranous nephropathy', 'IgA nephropathy', 'Post-streptococcal GN', 'Lupus nephritis', 'Vasculitis', 'Goodpasture syndrome'],
    },
    {
      id: 'electrolyte',
      name: 'Fluid & Electrolyte Disorders',
      description: 'Disorders of sodium, potassium, calcium, magnesium, phosphate and acid-base balance',
      diseaseCategories: ['Hyponatraemia', 'Hypernatraemia', 'Hypokalaemia', 'Hyperkalaemia', 'Metabolic acidosis', 'Metabolic alkalosis', 'Respiratory acid-base disorders'],
    },
    {
      id: 'hypertension-nephro',
      name: 'Hypertension & Renovascular Disease',
      description: 'Hypertensive nephropathy and renal artery disease',
      diseaseCategories: ['Hypertensive nephrosclerosis', 'Renal artery stenosis', 'Renovascular hypertension', 'Malignant hypertension'],
    },
    {
      id: 'rrt',
      name: 'Renal Replacement Therapy',
      description: 'Dialysis and transplantation',
      diseaseCategories: ['Haemodialysis', 'Peritoneal dialysis', 'Renal transplantation', 'Transplant rejection', 'Dialysis access complications'],
    },
  ],
  commonSymptoms: [
    'oliguria', 'anuria', 'polyuria', 'nocturia', 'haematuria',
    'foamy_urine', 'peripheral_oedema', 'facial_oedema', 'dyspnoea',
    'fatigue', 'weakness', 'nausea', 'vomiting', 'anorexia',
    'weight_gain_fluid', 'confusion', 'seizures', 'pruritus',
    'bone_pain', 'cramps', 'hypertension', 'hypotension',
    'flank_pain', 'urinary_retention', 'pyuria',
  ],
  commonInvestigations: [
    'U&E', 'Serum creatinine', 'eGFR', 'BUN', 'Urinalysis', 'Urine microscopy',
    'Urine protein:creatinine ratio', 'Urine albumin:creatinine ratio',
    '24h urine collection', 'Renal ultrasound', 'Doppler renal arteries',
    'Renal biopsy', 'Serum complement C3/C4', 'ANCA', 'Anti-GBM',
    'ANA', 'Anti-dsDNA', 'Serum free light chains',
    'Potassium', 'Sodium', 'Calcium', 'Phosphate', 'Magnesium',
    'Bicarbonate', 'Blood gas', 'Hb', 'Ferritin', 'PTH', 'Vitamin D',
    'Hepatitis B/C serology', 'HIV test',
  ],
};
