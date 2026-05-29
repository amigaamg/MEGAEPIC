import type { DepartmentDefinition } from './index';

export const obstetrics: DepartmentDefinition = {
  id: 'OB',
  name: 'Obstetrics',
  shortName: 'OB',
  description: 'Care of women during pregnancy, childbirth and the postpartum period, including management of high-risk pregnancies.',
  icon: '🤱',
  color: '#f97316',
  sections: [
    {
      id: 'antenatal',
      name: 'Antenatal Care',
      description: 'Routine pregnancy monitoring, screening and risk assessment',
      diseaseCategories: ['Normal pregnancy', 'First trimester bleeding', 'Hyperemesis gravidarum', 'Multiple pregnancy', 'Rh isoimmunisation', 'Prenatal screening'],
    },
    {
      id: 'high-risk-pregnancy',
      name: 'High-Risk Pregnancy',
      description: 'Maternal medical conditions complicating pregnancy and pregnancy-specific disorders',
      diseaseCategories: ['Pre-eclampsia', 'Gestational hypertension', 'Gestational diabetes', 'Placenta praevia', 'Placental abruption', 'Preterm labour', 'PPROM', 'IUGR', 'Maternal sepsis'],
    },
    {
      id: 'labour',
      name: 'Labour & Delivery',
      description: 'Management of labour, delivery and intrapartum complications',
      diseaseCategories: ['Normal labour', 'Preterm labour', 'Prolonged labour', 'Shoulder dystocia', 'Malpresentation', 'Cord prolapse', 'Uterine rupture', 'Amniotic fluid embolism'],
    },
    {
      id: 'postpartum',
      name: 'Postpartum Care',
      description: 'Care of mother and baby in the postnatal period',
      diseaseCategories: ['Postpartum haemorrhage', 'Postpartum sepsis', 'Postpartum thyroiditis', 'Postpartum cardiomyopathy', 'Puerperal psychosis', 'Lactation difficulties'],
    },
    {
      id: 'fetal-medicine',
      name: 'Fetal Medicine',
      description: 'Diagnosis and management of fetal abnormalities and conditions',
      diseaseCategories: ['Fetal anomaly', 'Fetal growth restriction', 'Fetal hydrops', 'Oligohydramnios', 'Polyhydramnios', 'Fetal arrhythmia', 'Twin-twin transfusion syndrome'],
    },
    {
      id: 'obstetric-surgery',
      name: 'Obstetric Surgery',
      description: 'Surgical interventions in pregnancy and delivery',
      diseaseCategories: ['Caesarean section', 'Instrumental delivery', 'Episiotomy', 'Perineal repair', 'Cervical cerclage'],
    },
  ],
  commonSymptoms: [
    'vaginal_bleeding_pregnancy', 'abdominal_pain_pregnancy', 'contractions',
    'reduced_fetal_movements', 'leaking_liquor', 'headache', 'visual_disturbance',
    'epigastric_pain', 'nausea_vomiting_pregnancy', 'excessive_vomiting',
    'fever_in_pregnancy', 'dysuria', 'back_pain', 'pelvic_pressure',
    'oedema', 'sudden_weight_gain', 'breathlessness', 'palpitations',
    'perineal_pain', 'wound_discharge', 'heavy_lochia', 'breast_engorgement',
  ],
  commonInvestigations: [
    'Urine pregnancy test', 'Urinalysis', 'Urine protein:creatinine ratio',
    'FBC', 'Blood group and antibody screen', 'Rh type', 'Hb electrophoresis',
    'OGTT', 'LFT', 'U&E', 'Coagulation screen', 'TSH', 'Rubella IgG',
    'Hepatitis B/C serology', 'HIV test', 'Syphilis serology',
    'Group B streptococcus screen', 'Obstetric ultrasound', 'Growth scan',
    'Doppler ultrasound', 'CTG', 'Amniotic fluid index', 'Bishop score',
  ],
};
