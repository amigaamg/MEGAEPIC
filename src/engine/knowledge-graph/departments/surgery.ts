import type { DepartmentDefinition } from './index';

export const surgery: DepartmentDefinition = {
  id: 'SURG',
  name: 'General Surgery',
  shortName: 'SURG',
  description: 'Surgical management of diseases of the abdomen, breast, skin and soft tissues, including trauma and emergency surgery.',
  icon: '🔪',
  color: '#94a3b8',
  sections: [
    {
      id: 'upper-gi-surg',
      name: 'Upper Gastrointestinal Surgery',
      description: 'Surgical conditions of the oesophagus, stomach and duodenum',
      diseaseCategories: ['Oesophageal cancer', 'Gastric cancer', 'Peptic ulcer perforation', 'Gastric outlet obstruction', 'Hiatal hernia', 'Gastro-oesophageal reflux surgery'],
    },
    {
      id: 'hepatobiliary',
      name: 'Hepatobiliary & Pancreatic Surgery',
      description: 'Surgery of the liver, bile ducts, gallbladder and pancreas',
      diseaseCategories: ['Cholelithiasis/cholecystitis', 'Choledocholithiasis', 'Pancreatic cancer', 'Pancreatitis surgical complications', 'Liver tumours', 'Biliary stricture', 'Porta hepatis surgery'],
    },
    {
      id: 'colorectal',
      name: 'Colorectal Surgery',
      description: 'Surgical conditions of the colon, rectum and anus',
      diseaseCategories: ['Colorectal cancer', 'Diverticulitis', 'Appendicitis', 'Intestinal obstruction', 'Bowel perforation', 'Ischaemic colitis', 'Volvulus', 'Intussusception'],
    },
    {
      id: 'hernia',
      name: 'Hernia & Abdominal Wall Surgery',
      description: 'All types of abdominal wall hernias and their complications',
      diseaseCategories: ['Inguinal hernia', 'Femoral hernia', 'Umbilical hernia', 'Incisional hernia', 'Ventral hernia', 'Obstructed hernia', 'Strangulated hernia'],
    },
    {
      id: 'breast',
      name: 'Breast Surgery',
      description: 'Surgical management of benign and malignant breast disease',
      diseaseCategories: ['Breast cancer', 'Fibroadenoma', 'Breast abscess', 'Mastitis', 'Ductal carcinoma in situ', 'Paget disease of breast'],
    },
    {
      id: 'trauma-surg',
      name: 'Trauma & Emergency Surgery',
      description: 'Acute surgical presentations and trauma management',
      diseaseCategories: ['Abdominal trauma', 'Chest trauma', 'Polytrauma', 'Acute abdomen', 'Mesenteric ischaemia', 'Abdominal compartment syndrome', 'Damage control surgery'],
    },
    {
      id: 'vascular-surg',
      name: 'Vascular Surgery',
      description: 'Surgical management of vascular disease',
      diseaseCategories: ['AAA repair', 'Carotid endarterectomy', 'Peripheral bypass', 'AV access for dialysis', 'Amputation', 'Varicose veins'],
    },
  ],
  commonSymptoms: [
    'abdominal_pain', 'acute_abdomen', 'abdominal_distension',
    'nausea', 'vomiting', 'constipation', 'obstipation',
    'haematemesis', 'melena', 'haematochezia', 'jaundice',
    'fever', 'peritonism', 'guarding', 'rebound_tenderness',
    'palpable_mass', 'hernia_bulge', 'groin_pain', 'dysphagia',
    'breast_lump', 'breast_pain', 'nipple_discharge',
    'wound_discharge', 'wound_dehiscence', 'surgical_site_pain',
    'chest_trauma', 'Bruising', 'haemodynamic_instability',
  ],
  commonInvestigations: [
    'FBC', 'CRP', 'U&E', 'LFT', 'Lipase', 'Amylase', 'Coagulation screen',
    'Blood culture', 'Group and crossmatch', 'ECG', 'Chest X-ray',
    'Abdominal X-ray', 'Abdominal ultrasound', 'CT abdomen with contrast',
    'CT chest', 'ERCP', 'MRCP', 'Oesophagogastroduodenoscopy',
    'Colonoscopy', 'Sigmoidoscopy', 'Mammogram', 'Breast ultrasound',
    'Breast biopsy', 'Laparoscopy', 'Diagnostic laparotomy',
  ],
};
