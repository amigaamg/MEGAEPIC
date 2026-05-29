import type { DepartmentDefinition } from './index';

export const respiratory: DepartmentDefinition = {
  id: 'RESP',
  name: 'Respiratory Medicine',
  shortName: 'RESP',
  description: 'Diagnosis and management of diseases of the airways, lung parenchyma, pleura, and respiratory vasculature.',
  icon: '🫁',
  color: '#06b6d4',
  sections: [
    {
      id: 'airways',
      name: 'Airways Disease',
      description: 'Obstructive airways conditions including asthma and COPD',
      diseaseCategories: ['Asthma', 'COPD', 'Bronchiectasis', 'Bronchiolitis obliterans', 'Cough variant asthma', 'Occupational lung disease'],
    },
    {
      id: 'infections',
      name: 'Respiratory Infections',
      description: 'Infections of the lower and upper respiratory tract',
      diseaseCategories: ['Community-acquired pneumonia', 'Hospital-acquired pneumonia', 'Tuberculosis', 'Viral pneumonia', 'Fungal pneumonia', 'Lung abscess', 'Empyema'],
    },
    {
      id: 'interstitial',
      name: 'Interstitial Lung Disease',
      description: 'Diffuse parenchymal lung diseases',
      diseaseCategories: ['Idiopathic pulmonary fibrosis', 'Sarcoidosis', 'Hypersensitivity pneumonitis', 'Connective tissue disease-ILD', 'Drug-induced ILD'],
    },
    {
      id: 'pleural',
      name: 'Pleural Disease',
      description: 'Disorders of the pleural space',
      diseaseCategories: ['Pleural effusion', 'Pneumothorax', 'Malignant pleural mesothelioma', 'Pleural infection/empyema', 'Haemothorax'],
    },
    {
      id: 'pulmonary-vascular',
      name: 'Pulmonary Vascular Disease',
      description: 'Disorders of the pulmonary circulation',
      diseaseCategories: ['Pulmonary embolism', 'Pulmonary hypertension', 'Cor pulmonale', 'Pulmonary arteriovenous malformation'],
    },
    {
      id: 'sleep',
      name: 'Sleep & Ventilatory Disorders',
      description: 'Sleep-disordered breathing and respiratory failure',
      diseaseCategories: ['Obstructive sleep apnoea', 'Central sleep apnoea', 'Obesity hypoventilation syndrome', 'Chronic respiratory failure', 'Home ventilation'],
    },
  ],
  commonSymptoms: [
    'cough', 'dyspnoea', 'wheeze', 'haemoptysis', 'sputum_production',
    'chest_pain_pleuritic', 'fever', 'night_sweats', 'weight_loss',
    'fatigue', 'exercise_intolerance', 'stridor', 'hoarseness',
    'snoring', 'daytime_sleepiness', 'orthopnoea', 'cyanosis',
    'clubbing', 'finger_clubbing', 'respiratory_distress',
    'tachypnoea', 'use_of_accessory_muscles',
  ],
  commonInvestigations: [
    'Chest X-ray', 'CT chest', 'Spirometry', 'Peak expiratory flow',
    'Lung volumes', 'DLCO', 'Arterial blood gas', 'Pulse oximetry',
    'Sputum culture', 'Sputum AFB', 'GeneXpert', 'Blood culture',
    'CRP', 'PCT', 'D-dimer', 'CTPA', 'V/Q scan', 'Bronchoscopy',
    'Thoracentesis', 'Pleural fluid analysis', 'Sleep study',
    'Polysomnography', 'Allergy testing', 'Autoimmune screen',
  ],
};
