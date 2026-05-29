import type { DepartmentDefinition } from './index';

export const cardiology: DepartmentDefinition = {
  id: 'CARD',
  name: 'Cardiology',
  shortName: 'CARD',
  description: 'Diagnosis and management of disorders of the heart and circulatory system, including coronary artery disease, heart failure, arrhythmias, and valvular disease.',
  icon: '❤️',
  color: '#ef4444',
  sections: [
    {
      id: 'coronary-artery-disease',
      name: 'Coronary Artery Disease',
      description: 'Acute and chronic coronary syndromes, angina, myocardial infarction',
      diseaseCategories: ['Stable angina', 'Unstable angina', 'NSTEMI', 'STEMI', 'Silent ischaemia', 'Microvascular angina'],
    },
    {
      id: 'heart-failure',
      name: 'Heart Failure',
      description: 'Acute and chronic heart failure with reduced or preserved ejection fraction',
      diseaseCategories: ['HFrEF', 'HFpEF', 'Acute decompensated heart failure', 'Right heart failure', 'High-output failure'],
    },
    {
      id: 'arrhythmia',
      name: 'Arrhythmia & Electrophysiology',
      description: 'Cardiac rhythm disorders, conduction abnormalities, device therapy',
      diseaseCategories: ['Atrial fibrillation', 'Atrial flutter', 'Supraventricular tachycardia', 'Ventricular tachycardia', 'Bradyarrhythmia', 'Heart block', 'Syncope'],
    },
    {
      id: 'valvular',
      name: 'Valvular Heart Disease',
      description: 'Acquired and congenital valvular lesions',
      diseaseCategories: ['Aortic stenosis', 'Aortic regurgitation', 'Mitral stenosis', 'Mitral regurgitation', 'Tricuspid valve disease', 'Prosthetic valve complications'],
    },
    {
      id: 'vascular',
      name: 'Vascular Medicine',
      description: 'Diseases of the aorta and peripheral vasculature',
      diseaseCategories: ['Aortic aneurysm', 'Aortic dissection', 'Peripheral arterial disease', 'Carotid artery disease', 'Venous thromboembolism'],
    },
    {
      id: 'preventive',
      name: 'Preventive Cardiology',
      description: 'Cardiovascular risk assessment and primary prevention',
      diseaseCategories: ['Hypertension', 'Dyslipidaemia', 'Cardiovascular risk stratification', 'Cardiac rehabilitation'],
    },
  ],
  commonSymptoms: [
    'chest_pain', 'chest_tightness', 'dyspnoea', 'orthopnoea',
    'paroxysmal_nocturnal_dyspnoea', 'palpitations', 'syncope',
    'pre_syncope', 'fatigue', 'peripheral_oedema', 'cyanosis',
    'claudication', 'dizziness', 'heartburn_like_chest_pain',
    'radiating_arm_pain', 'jaw_pain', 'back_pain', 'diaphoresis',
    'nausea_with_chest_pain', 'exercise_intolerance',
  ],
  commonInvestigations: [
    'ECG', 'Echocardiogram', 'Troponin', 'BNP/NT-proBNP', 'Chest X-ray',
    'Exercise tolerance test', 'Holter monitor', 'Coronary angiogram',
    'CT coronary angiogram', 'Cardiac MRI', 'Lipid profile', 'CRP',
    'D-dimer', 'Coagulation screen', 'Blood glucose', 'HbA1c',
    'U&E', 'Full blood count', 'Thyroid function',
  ],
};
