import { setDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import { ENCOUNTER_LABELS, ENCOUNTER_PHASES } from '@/lib/encounterTypes';
import type { EncounterType } from '@/lib/encounterTypes';

interface UnitDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  encounterTypes: EncounterType[];
  pathways: string[];
}

interface DeptDef {
  key: string;
  units: UnitDef[];
}

const DEPT_UNITS: DeptDef[] = [
  {
    key: 'PAED',
    units: [
      { id: 'paediatric-respiratory', label: 'Paediatric Respiratory Unit', description: 'Cough, wheeze, respiratory distress, TB, asthma, bronchiolitis', icon: '🫁', encounterTypes: ['outpatient','emergency','inpatient','ward_round','follow_up'], pathways: ['severe-pneumonia'] },
      { id: 'paediatric-cardiology', label: 'Paediatric Cardiology', description: 'Congenital heart disease, murmurs, heart failure', icon: '❤️', encounterTypes: ['outpatient','inpatient','ward_round','follow_up'], pathways: [] },
      { id: 'neonatology', label: 'Neonatology Unit', description: 'Newborn care, prematurity, NICU, neonatal jaundice', icon: '👶', encounterTypes: ['inpatient','ward_round','icu_review','discharge_summary'], pathways: [] },
      { id: 'paediatric-emergency', label: 'Paediatric Emergency', description: 'Acute presentations, trauma, poisoning, resuscitation', icon: '🚨', encounterTypes: ['emergency','procedure','referral'], pathways: ['severe-pneumonia'] },
      { id: 'paediatric-infectious', label: 'Paediatric Infectious Disease', description: 'Febrile illness, sepsis, meningitis, tropical infections', icon: '🦠', encounterTypes: ['outpatient','inpatient','ward_round','mdt_review'], pathways: ['sepsis'] },
      { id: 'paediatric-endocrinology', label: 'Paediatric Endocrinology', description: 'Growth, puberty, diabetes, thyroid', icon: '🔬', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: ['dka'] },
      { id: 'paediatric-gastroenterology', label: 'Paediatric Gastroenterology', description: 'GI disorders, feeding problems, IBD', icon: '🩺', encounterTypes: ['outpatient','inpatient','procedure','follow_up'], pathways: [] },
      { id: 'paediatric-hematology', label: 'Paediatric Haematology', description: 'Sickle cell, thalassaemia, bleeding disorders', icon: '🩸', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'paediatric-nephrology', label: 'Paediatric Nephrology', description: 'CKD, nephrotic syndrome, UTIs', icon: '💧', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'paediatric-neurology', label: 'Paediatric Neurology', description: 'Epilepsy, developmental delay, headache', icon: '🧠', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'paediatric-oncology', label: 'Paediatric Oncology', description: 'Childhood cancers, leukaemia, solid tumours', icon: '⚕️', encounterTypes: ['outpatient','inpatient','ward_round','mdt_review'], pathways: [] },
      { id: 'picu-nicu', label: 'PICU/NICU', description: 'Neonatal & paediatric intensive care', icon: '💓', encounterTypes: ['inpatient','icu_review','ward_round'], pathways: [] },
      { id: 'developmental-pediatrics', label: 'Developmental Pediatrics', description: 'Autism, ADHD, learning disabilities, developmental delay', icon: '🌟', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'IM',
    units: [
      { id: 'general-medicine', label: 'General Medicine Ward', description: 'Complex multi-system adult medical care, FUO, unexplained symptoms', icon: '🏥', encounterTypes: ['inpatient','ward_round','follow_up','mdt_review'], pathways: ['sepsis'] },
      { id: 'hypertension-risk', label: 'Hypertension & Cardiovascular Risk', description: 'Essential hypertension, secondary hypertension, dyslipidaemia, metabolic syndrome', icon: '🩸', encounterTypes: ['outpatient','telemedicine','follow_up'], pathways: [] },
      { id: 'infectious-disease', label: 'Infectious Disease Unit', description: 'HIV, TB, tropical medicine, antimicrobial stewardship', icon: '🦠', encounterTypes: ['outpatient','inpatient','ward_round','telemedicine'], pathways: ['sepsis'] },
      { id: 'allergy-immunology', label: 'Allergy & Clinical Immunology', description: 'Anaphylaxis, drug allergy, food allergy, urticaria, immunoglobulin deficiencies', icon: '🔬', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'adult-vaccination-travel', label: 'Adult Vaccination & Travel Medicine', description: 'Travel prophylaxis, vaccine-preventable diseases, post-exposure prophylaxis', icon: '💉', encounterTypes: ['outpatient','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'CARD',
    units: [
      { id: 'general-cardiology', label: 'Cardiology Clinic', description: 'Chest pain, dyspnoea, palpitations, valvular disease, cardiac risk assessment', icon: '❤️', encounterTypes: ['outpatient','emergency','follow_up','telemedicine'], pathways: ['chest-pain'] },
      { id: 'coronary-artery-disease', label: 'Coronary Artery Disease Unit', description: 'Stable angina, acute coronary syndrome, post-MI care, PCI, CABG follow-up', icon: '💔', encounterTypes: ['outpatient','emergency','inpatient','ward_round','icu_review','follow_up'], pathways: ['chest-pain'] },
      { id: 'heart-failure', label: 'Heart Failure Unit', description: 'HFrEF, HFpEF, acute decompensation, cardiogenic shock', icon: '💔', encounterTypes: ['inpatient','ward_round','icu_review','follow_up'], pathways: [] },
      { id: 'cardiac-ep', label: 'Electrophysiology', description: 'Atrial fibrillation, SVT, VT, bradyarrhythmias, device therapy', icon: '⚡', encounterTypes: ['outpatient','procedure','operative_note','follow_up'], pathways: [] },
      { id: 'valvular-disease', label: 'Valvular Heart Disease Clinic', description: 'Aortic stenosis, mitral regurgitation, prosthetic valves, valve surgery follow-up', icon: '🔬', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'cardiomyopathy', label: 'Cardiomyopathy & Inherited Cardiac Conditions', description: 'Dilated, hypertrophic, restrictive cardiomyopathy', icon: '❤️', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'hypertension-clinic', label: 'Hypertension Clinic', description: 'Essential hypertension, secondary hypertension, hypertensive emergencies', icon: '🩸', encounterTypes: ['outpatient','telemedicine','follow_up'], pathways: [] },
      { id: 'pericardial-vascular', label: 'Pericardial & Vascular Disease', description: 'Pericarditis, pericardial effusion, aortic dissection, PAD', icon: '🫀', encounterTypes: ['outpatient','emergency','inpatient','follow_up'], pathways: [] },
    ],
  },
  {
    key: 'ENDO',
    units: [
      { id: 'diabetes', label: 'Diabetes & Metabolism', description: 'Type 1, Type 2, gestational, metabolic syndrome, DKA', icon: '💉', encounterTypes: ['outpatient','inpatient','follow_up','telemedicine'], pathways: ['dka'] },
      { id: 'thyroid', label: 'Thyroid Clinic', description: 'Hyperthyroidism, hypothyroidism, nodules, cancer, goitre', icon: '🔬', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'adrenal-pituitary', label: 'Adrenal & Pituitary Disorders', description: 'Cushing syndrome, adrenal insufficiency, pituitary tumours', icon: '🧠', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'bone-calcium', label: 'Bone & Calcium Metabolism', description: 'Osteoporosis, hyperparathyroidism, vitamin D deficiency', icon: '🦴', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'RESP',
    units: [
      { id: 'pulmonology', label: 'Pulmonology Unit', description: 'COPD, asthma, bronchiectasis, ILD, pulmonary hypertension', icon: '🫁', encounterTypes: ['outpatient','inpatient','ward_round','follow_up'], pathways: ['severe-pneumonia'] },
      { id: 'respiratory-infections', label: 'Respiratory Infections', description: 'Pneumonia, TB, empyema, lung abscess', icon: '🦠', encounterTypes: ['outpatient','emergency','inpatient','ward_round'], pathways: [] },
      { id: 'pleural-disease', label: 'Pleural Disease Unit', description: 'Pleural effusion, pneumothorax, empyema', icon: '🫁', encounterTypes: ['outpatient','inpatient','procedure'], pathways: [] },
      { id: 'respiratory-failure', label: 'Respiratory Failure & Ventilation', description: 'Acute respiratory failure, NIV, respiratory weaning', icon: '💨', encounterTypes: ['inpatient','icu_review','ward_round'], pathways: [] },
      { id: 'sleep-medicine', label: 'Sleep & Ventilation Lab', description: 'Sleep studies, CPAP, non-invasive ventilation', icon: '💤', encounterTypes: ['outpatient','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'RENAL',
    units: [
      { id: 'general-nephrology', label: 'Nephrology Ward', description: 'CKD, AKI, glomerulonephritis, drug-induced nephropathy', icon: '💧', encounterTypes: ['outpatient','inpatient','ward_round','follow_up'], pathways: ['aki'] },
      { id: 'glomerular-disease', label: 'Glomerular & Autoimmune Renal Disease', description: 'Nephrotic syndrome, nephritic syndrome, IgA nephropathy, lupus nephritis', icon: '🔬', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'dialysis', label: 'Dialysis Unit', description: 'Haemodialysis, peritoneal dialysis, access management', icon: '🔄', encounterTypes: ['inpatient','procedure','follow_up'], pathways: [] },
      { id: 'electrolytes-transplant', label: 'Electrolytes & Transplant', description: 'Electrolyte disorders, acid-base, renal transplant, immunosuppression', icon: '💧', encounterTypes: ['outpatient','inpatient','follow_up','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'NEURO',
    units: [
      { id: 'stroke-unit', label: 'Stroke Unit', description: 'Ischaemic stroke, haemorrhagic stroke, TIA, cerebral venous thrombosis', icon: '🩸', encounterTypes: ['emergency','inpatient','icu_review','ward_round','discharge_summary'], pathways: ['stroke'] },
      { id: 'epilepsy-monitoring', label: 'Epilepsy & Seizure Disorders', description: 'Generalised epilepsy, focal epilepsy, status epilepticus, febrile seizures', icon: '⚡', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'headache-clinic', label: 'Headache & Pain Clinic', description: 'Migraine, tension headache, cluster headache, trigeminal neuralgia', icon: '🤕', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'neurodegenerative-clinic', label: 'Neurodegenerative Disorders', description: 'Parkinson disease, Alzheimer disease, MND, Huntington disease', icon: '🧠', encounterTypes: ['outpatient','follow_up','telemedicine','mdt_review'], pathways: [] },
      { id: 'neuroimmunology-clinic', label: 'Neuroimmunology', description: 'Multiple sclerosis, Guillain-Barre, neuromyelitis optica, Myasthenia gravis', icon: '🔬', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'cns-infection-unit', label: 'CNS Infections', description: 'Meningitis, encephalitis, brain abscess', icon: '🦠', encounterTypes: ['emergency','inpatient','ward_round'], pathways: [] },
      { id: 'neuromuscular-clinic', label: 'Neuromuscular Clinic', description: 'Peripheral neuropathy, muscular dystrophy, myopathy', icon: '💪', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'movement-disorders', label: 'Movement Disorders', description: 'Essential tremor, dystonia, Parkinson-plus syndromes', icon: '🎯', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'neuro-oncology', label: 'Neuro-Oncology', description: 'Glioma, meningioma, brain tumours', icon: '⚕️', encounterTypes: ['outpatient','inpatient','mdt_review'], pathways: [] },
      { id: 'general-neurology', label: 'General Neurology', description: 'Headache, dizziness, neuropathy - general referrals', icon: '🧠', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'GI',
    units: [
      { id: 'general-gi', label: 'Gastroenterology Clinic', description: 'Dyspepsia, IBS, IBD, GI bleeding, gastritis', icon: '🩺', encounterTypes: ['outpatient','procedure','follow_up'], pathways: [] },
      { id: 'hepatology', label: 'Hepatology Unit', description: 'Hepatitis B/C, cirrhosis, NAFLD, liver failure, HCC', icon: '🍃', encounterTypes: ['outpatient','inpatient','ward_round','follow_up'], pathways: [] },
      { id: 'oesophageal-gastric', label: 'Oesophageal & Gastric Disorders', description: 'GERD, peptic ulcer, oesophageal cancer, gastric cancer', icon: '🔬', encounterTypes: ['outpatient','procedure','inpatient','follow_up'], pathways: [] },
      { id: 'pancreatic-biliary', label: 'Pancreatic & Biliary Diseases', description: 'Acute/chronic pancreatitis, pancreatic cancer, biliary disorders', icon: '🍃', encounterTypes: ['outpatient','inpatient','ward_round','follow_up'], pathways: [] },
    ],
  },
  {
    key: 'OB',
    units: [
      { id: 'antenatal', label: 'Antenatal Clinic', description: 'Routine pregnancy care, screening, hyperemesis, multiple gestation', icon: '🤰', encounterTypes: ['outpatient','antenatal','telemedicine'], pathways: [] },
      { id: 'high-risk', label: 'High-Risk Pregnancy Unit', description: 'Pre-eclampsia, eclampsia, gestational diabetes, placenta praevia, abruption', icon: '⚠️', encounterTypes: ['emergency','inpatient','ward_round','antenatal'], pathways: [] },
      { id: 'labour-delivery', label: 'Labour & Delivery Ward', description: 'Normal labour, obstructed labour, fetal distress, shoulder dystocia, cord prolapse', icon: '🏥', encounterTypes: ['emergency','inpatient','ward_round'], pathways: [] },
      { id: 'postnatal', label: 'Postnatal Ward', description: 'Postpartum haemorrhage, puerperal sepsis, lactation, postpartum depression', icon: '👩‍👧', encounterTypes: ['inpatient','post_op','discharge_summary'], pathways: [] },
      { id: 'fetal-medicine', label: 'Fetal Medicine Unit', description: 'IUGR, congenital anomalies, fetal hydrops, TTTS, fetal demise', icon: '🔬', encounterTypes: ['outpatient','inpatient','telemedicine'], pathways: [] },
      { id: 'obstetric-surgery', label: 'Obstetric Surgery Suite', description: 'Caesarean section, instrumental delivery, cervical cerclage, perineal repair', icon: '🔪', encounterTypes: ['inpatient','operative_note','post_op','ward_round'], pathways: [] },
    ],
  },
  {
    key: 'PSYCH',
    units: [
      { id: 'mood-disorders', label: 'Mood Disorders Clinic', description: 'Major depressive disorder, bipolar disorder, persistent depressive disorder', icon: '💬', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'anxiety-disorders', label: 'Anxiety & Stress Disorders', description: 'Generalised anxiety, panic disorder, social anxiety, OCD, PTSD', icon: '😰', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'psychotic-disorders', label: 'Psychotic Disorders Service', description: 'Schizophrenia, schizoaffective disorder, brief psychotic disorder', icon: '🧠', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'child-adolescent', label: 'Child & Adolescent Service', description: 'ADHD, autism, conduct disorder, behavioural disorders', icon: '👦', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'addiction', label: 'Addiction Services', description: 'Alcohol, opioid, cannabis use disorders, detox, rehabilitation', icon: '🔄', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'personality-disorders', label: 'Personality Disorders Service', description: 'Borderline personality, antisocial personality disorder', icon: '🔬', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'eating-disorders', label: 'Eating Disorders Service', description: 'Anorexia nervosa, bulimia nervosa', icon: '⚖️', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'emergency-psychiatry', label: 'Emergency Psychiatry', description: 'Suicide risk, acute psychosis, agitation, crisis intervention', icon: '🚨', encounterTypes: ['emergency','inpatient','referral'], pathways: [] },
      { id: 'sleep-disorders', label: 'Sleep Disorders Clinic', description: 'Insomnia, narcolepsy, parasomnias', icon: '🌙', encounterTypes: ['outpatient','telemedicine','follow_up'], pathways: [] },
      { id: 'general-psychiatry', label: 'General Psychiatry Outpatient', description: 'General psychiatric assessments and follow-up', icon: '💬', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'SURG',
    units: [
      { id: 'acute-care-surgery', label: 'Acute Care & Emergency Surgery', description: 'Appendicitis, peritonitis, bowel obstruction, acute abdomen', icon: '🔪', encounterTypes: ['outpatient','emergency','inpatient','ward_round','operative_note','post_op','discharge_summary'], pathways: ['acute-abdomen'] },
      { id: 'upper-gi-surgery', label: 'Upper GI Surgery', description: 'Oesophageal, gastric, peptic ulcer, hiatal hernia', icon: '🍽️', encounterTypes: ['outpatient','inpatient','operative_note','ward_round','post_op'], pathways: [] },
      { id: 'colorectal-surgery', label: 'Colorectal Surgery', description: 'Colorectal cancer, diverticulitis, IBD, anal conditions', icon: '🔄', encounterTypes: ['outpatient','inpatient','operative_note','ward_round','post_op'], pathways: [] },
      { id: 'hepatobiliary-surgery', label: 'Hepatobiliary & Pancreatic Surgery', description: 'Gallbladder, liver, pancreatic surgery, obstructive jaundice', icon: '🍃', encounterTypes: ['outpatient','inpatient','operative_note','ward_round','post_op'], pathways: [] },
      { id: 'hernia-surgery', label: 'Hernia & Abdominal Wall Surgery', description: 'Inguinal, femoral, umbilical, incisional, strangulated hernia', icon: '🔧', encounterTypes: ['outpatient','inpatient','operative_note','post_op'], pathways: [] },
      { id: 'breast-surgery', label: 'Breast Surgery', description: 'Breast cancer, fibroadenoma, mastitis, breast abscess', icon: '🎗️', encounterTypes: ['outpatient','inpatient','operative_note','post_op','follow_up'], pathways: [] },
      { id: 'endocrine-surgery', label: 'Endocrine Surgery', description: 'Thyroid, parathyroid, adrenal tumours', icon: '🔬', encounterTypes: ['outpatient','inpatient','operative_note','post_op'], pathways: [] },
      { id: 'trauma', label: 'Trauma Unit', description: 'Major trauma, resuscitation, damage control, splenic/liver injury', icon: '🚑', encounterTypes: ['emergency','inpatient','icu_review','operative_note','ward_round'], pathways: ['polytrauma'] },
      { id: 'vascular-surgery', label: 'Vascular Surgery', description: 'AAA, PAD, acute limb ischaemia, DVT, varicose veins', icon: '🩸', encounterTypes: ['outpatient','emergency','inpatient','operative_note','ward_round'], pathways: [] },
      { id: 'surgical-infection', label: 'Surgical Infections & Wound Care', description: 'Necrotising fasciitis, cellulitis, abscess, surgical sepsis', icon: '🦠', encounterTypes: ['inpatient','ward_round','procedure','mdt_review'], pathways: ['sepsis'] },
      { id: 'surgical-hdu', label: 'Surgical HDU', description: 'High-dependency post-operative care, anastomotic leaks', icon: '💓', encounterTypes: ['inpatient','icu_review','ward_round'], pathways: [] },
    ],
  },
  {
    key: 'ORTHO',
    units: [
      { id: 'trauma-ortho', label: 'Orthopaedic Trauma', description: 'Fractures of limbs, hip, spine, pelvis; polytrauma orthopaedic management', icon: '🦴', encounterTypes: ['emergency','inpatient','operative_note','post_op','ward_round'], pathways: [] },
      { id: 'sports-medicine', label: 'Sports Medicine & Arthroscopy', description: 'ACL tear, meniscal tear, rotator cuff tear, ankle sprain', icon: '⚽', encounterTypes: ['outpatient','operative_note','post_op','follow_up'], pathways: [] },
      { id: 'degenerative-ortho', label: 'Degenerative Joint Disease', description: 'Osteoarthritis knee/hip, joint replacement, spondylosis', icon: '🦴', encounterTypes: ['outpatient','inpatient','operative_note','post_op','follow_up'], pathways: [] },
      { id: 'spine-surgery', label: 'Spine Surgery', description: 'Disc herniation, spinal stenosis, scoliosis, cauda equina syndrome', icon: '🔬', encounterTypes: ['outpatient','inpatient','operative_note','ward_round'], pathways: [] },
      { id: 'ortho-infections', label: 'Orthopaedic Infections', description: 'Septic arthritis, osteomyelitis, prosthetic joint infection', icon: '🦠', encounterTypes: ['emergency','inpatient','operative_note'], pathways: [] },
      { id: 'ortho-tumors', label: 'Orthopaedic Oncology', description: 'Osteosarcoma, Ewing sarcoma, bone tumours', icon: '⚕️', encounterTypes: ['outpatient','inpatient','operative_note','mdt_review'], pathways: [] },
      { id: 'pediatric-ortho', label: 'Paediatric Orthopaedics', description: 'Clubfoot, DDH, Legg-Calve-Perthes, paediatric fractures', icon: '👶', encounterTypes: ['outpatient','inpatient','operative_note','follow_up'], pathways: [] },
      { id: 'post-op-ortho', label: 'Orthopaedic Post-Operative Care', description: 'Periprosthetic fracture, wound complications, rehabilitation', icon: '💪', encounterTypes: ['inpatient','ward_round','post_op','follow_up'], pathways: [] },
      { id: 'general-ortho', label: 'General Orthopaedics Clinic', description: 'General orthopaedic assessments, fracture follow-up', icon: '🦴', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'DERM',
    units: [
      { id: 'inflammatory-derm', label: 'Inflammatory Dermatology', description: 'Eczema, psoriasis, lichen planus, seborrhoeic dermatitis', icon: '🩹', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'derm-infections', label: 'Skin Infections', description: 'Cellulitis, impetigo, fungal infections, herpes zoster, scabies', icon: '🦠', encounterTypes: ['outpatient','procedure','follow_up'], pathways: [] },
      { id: 'skin-cancers', label: 'Skin Cancer & Mohs Surgery', description: 'Melanoma, BCC, SCC, Kaposi sarcoma, surgical excision', icon: '🔬', encounterTypes: ['outpatient','procedure','post_op'], pathways: [] },
      { id: 'autoimmune-derm', label: 'Autoimmune Skin Disease', description: 'Pemphigus, bullous pemphigoid, vitiligo', icon: '🔬', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'drug-reactions', label: 'Cutaneous Drug Reactions', description: 'Stevens-Johnson syndrome, TEN, drug rash', icon: '🚨', encounterTypes: ['emergency','inpatient','ward_round'], pathways: [] },
      { id: 'acne-rosacea', label: 'Acne & Rosacea Clinic', description: 'Acne vulgaris, rosacea', icon: '🩹', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'wound-care', label: 'Wound Care & Ulcer Management', description: 'Pressure ulcers, skin abscess, chronic wounds', icon: '🏥', encounterTypes: ['outpatient','inpatient','procedure'], pathways: [] },
      { id: 'general-derm', label: 'General Dermatology', description: 'General dermatology assessments and follow-up', icon: '🩹', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'HAEM',
    units: [
      { id: 'general-haem', label: 'Haematology Clinic', description: 'Anaemia, cytopenias, haemoglobinopathies', icon: '🩸', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'haem-onc', label: 'Haemato-Oncology Unit', description: 'Leukaemia, lymphoma, multiple myeloma, transplant, CAR-T', icon: '⚕️', encounterTypes: ['outpatient','inpatient','ward_round','mdt_review','discharge_summary'], pathways: [] },
      { id: 'coagulation-thrombosis', label: 'Coagulation & Thrombosis', description: 'DIC, DVT/PE, haemophilia, von Willebrand, ITP', icon: '🩸', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'transfusion-blood', label: 'Transfusion & Blood Bank', description: 'Transfusion reactions, blood group incompatibility', icon: '💉', encounterTypes: ['inpatient','procedure'], pathways: [] },
    ],
  },
  {
    key: 'ONCO',
    units: [
      { id: 'medical-oncology', label: 'Medical Oncology', description: 'Chemotherapy, targeted therapy, immunotherapy', icon: '💊', encounterTypes: ['outpatient','inpatient','ward_round','mdt_review','follow_up'], pathways: [] },
      { id: 'solid-tumours', label: 'Solid Tumour Oncology', description: 'Lung, breast, colorectal, prostate, pancreatic cancer care', icon: '🎗️', encounterTypes: ['outpatient','inpatient','ward_round','mdt_review','follow_up'], pathways: [] },
      { id: 'haematologic-oncology', label: 'Haematologic Oncology', description: 'Leukaemia, lymphoma, myeloma, CAR-T', icon: '⚕️', encounterTypes: ['outpatient','inpatient','ward_round','mdt_review'], pathways: [] },
      { id: 'radiation-oncology', label: 'Radiation Oncology', description: 'External beam, brachytherapy, radiosurgery', icon: '☢️', encounterTypes: ['outpatient','procedure','follow_up'], pathways: [] },
      { id: 'oncologic-emergencies', label: 'Oncologic Emergencies & Palliation', description: 'Febrile neutropenia, SVC syndrome, tumour lysis, palliative care', icon: '🚨', encounterTypes: ['emergency','inpatient','ward_round','mdt_review'], pathways: [] },
    ],
  },
  {
    key: 'GYN',
    units: [
      { id: 'general-gyne', label: 'General Gynecology Clinic', description: 'Menstrual disorders, pelvic pain, fibroids, endometriosis, PCOS', icon: '🌸', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'gynae-infections', label: 'Gynaecological Infections & STI Clinic', description: 'PID, vaginitis, cervicitis, Bartholin cyst, STI screening', icon: '🦠', encounterTypes: ['outpatient','telemedicine','follow_up'], pathways: [] },
      { id: 'gynae-oncology-unit', label: 'Gynaecological Oncology', description: 'Ovarian, cervical, endometrial, vulvar cancer', icon: '⚕️', encounterTypes: ['outpatient','inpatient','ward_round','operative_note','mdt_review'], pathways: [] },
      { id: 'gynae-surgery', label: 'Gynaecology Surgery Suite', description: 'Laparoscopic & open gynaecological surgery', icon: '🔪', encounterTypes: ['outpatient','operative_note','post_op','discharge_summary'], pathways: [] },
      { id: 'fertility-reproductive', label: 'Fertility & Reproductive Medicine', description: 'Infertility, ovulatory disorders, tubal disease, recurrent pregnancy loss', icon: '💕', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'menopause-urogynecology', label: 'Menopause & Urogynaecology', description: 'Menopause, HRT, urinary incontinence, pelvic organ prolapse', icon: '🔄', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'EM',
    units: [
      { id: 'resus', label: 'Resuscitation Bay', description: 'Cardiac arrest, shock, major trauma, anaphylaxis', icon: '🚨', encounterTypes: ['emergency','procedure','icu_review'], pathways: ['polytrauma','sepsis'] },
      { id: 'majors', label: 'Majors (Acute Care)', description: 'Acute medical & surgical presentations', icon: '🏥', encounterTypes: ['emergency','inpatient','referral'], pathways: ['sepsis','chest-pain','acute-abdomen'] },
      { id: 'trauma-resus', label: 'Trauma Resuscitation', description: 'Polytrauma, haemorrhagic shock, spinal cord injury, TBI', icon: '🚑', encounterTypes: ['emergency','icu_review','operative_note'], pathways: ['polytrauma'] },
      { id: 'toxicology', label: 'Toxicology & Environmental', description: 'Poisoning, overdose, snake bite, drowning, heat stroke', icon: '☠️', encounterTypes: ['emergency','inpatient','icu_review'], pathways: [] },
      { id: 'respiratory-emergencies', label: 'Respiratory Emergencies', description: 'Acute respiratory failure, tension pneumothorax, PE', icon: '🫁', encounterTypes: ['emergency','icu_review','procedure'], pathways: [] },
      { id: 'neurological-emergencies', label: 'Neurological Emergencies', description: 'Stroke, status epilepticus, subarachnoid haemorrhage, meningitis', icon: '🧠', encounterTypes: ['emergency','inpatient','referral'], pathways: [] },
      { id: 'minors', label: 'Minors (Urgent Care)', description: 'Minor injuries, infections, low-acuity walk-in', icon: '🩹', encounterTypes: ['emergency','follow_up'], pathways: [] },
    ],
  },
  {
    key: 'ICU',
    units: [
      { id: 'icu-respiratory', label: 'Respiratory ICU', description: 'ARDS, status asthmaticus, ventilator-associated pneumonia, respiratory weaning', icon: '🫁', encounterTypes: ['icu_review','ward_round','inpatient'], pathways: [] },
      { id: 'icu-cardiovascular', label: 'Cardiovascular ICU', description: 'Cardiogenic shock, septic shock, haemorrhagic shock, post-cardiac surgery', icon: '❤️', encounterTypes: ['icu_review','ward_round','inpatient'], pathways: ['sepsis'] },
      { id: 'icu-neuro', label: 'Neuro ICU', description: 'Raised ICP, myasthenic crisis, brain death, post-neurosurgery', icon: '🧠', encounterTypes: ['icu_review','ward_round'], pathways: [] },
      { id: 'icu-sepsis', label: 'Sepsis & Multi-Organ Failure ICU', description: 'Sepsis bundle, multiorgan dysfunction, haemodynamic monitoring', icon: '🦠', encounterTypes: ['icu_review','ward_round','inpatient'], pathways: ['sepsis'] },
      { id: 'icu-trauma', label: 'Trauma ICU', description: 'Damage control resuscitation, massive transfusion, polytrauma', icon: '🚑', encounterTypes: ['icu_review','ward_round','post_op'], pathways: ['polytrauma'] },
      { id: 'icu-surgical', label: 'Surgical ICU', description: 'Post-abdominal surgery, post-operative complications', icon: '🔪', encounterTypes: ['icu_review','ward_round','post_op'], pathways: [] },
      { id: 'icu-renal', label: 'Renal ICU', description: 'Acute kidney injury in ICU, electrolyte emergencies, CRRT', icon: '💧', encounterTypes: ['icu_review','ward_round'], pathways: [] },
      { id: 'icu-procedures', label: 'ICU Procedures & Lines', description: 'Central line, arterial line, bronchoscopy, tracheostomy care', icon: '💉', encounterTypes: ['icu_review','procedure'], pathways: [] },
      { id: 'icu-medical', label: 'General Medical ICU', description: 'General medical critical care', icon: '💓', encounterTypes: ['icu_review','ward_round','inpatient'], pathways: [] },
    ],
  },
  {
    key: 'ENT',
    units: [
      { id: 'otology', label: 'Otology & Hearing', description: 'Acute otitis media, CSOM, cholesteatoma, hearing loss, mastoiditis', icon: '👂', encounterTypes: ['outpatient','inpatient','operative_note','follow_up'], pathways: [] },
      { id: 'rhinology', label: 'Rhinology & Sinus', description: 'Allergic rhinitis, sinusitis, nasal polyps', icon: '👃', encounterTypes: ['outpatient','procedure','follow_up'], pathways: [] },
      { id: 'laryngology', label: 'Laryngology & Voice', description: 'Acute tonsillitis, peritonsillar abscess, vocal cord nodules, laryngeal cancer', icon: '🔬', encounterTypes: ['outpatient','inpatient','operative_note','follow_up'], pathways: [] },
      { id: 'head-neck', label: 'Head & Neck Surgery', description: 'Thyroid nodules, salivary gland tumours, neck abscess', icon: '🔪', encounterTypes: ['outpatient','inpatient','operative_note','post_op'], pathways: [] },
      { id: 'sleep-ent', label: 'ENT Sleep Medicine', description: 'Obstructive sleep apnoea, snoring surgery', icon: '🌙', encounterTypes: ['outpatient','telemedicine','follow_up'], pathways: [] },
      { id: 'ent-emergencies', label: 'ENT Emergencies', description: 'Epistaxis, airway obstruction, foreign body nose/ear', icon: '🚨', encounterTypes: ['emergency','procedure','inpatient'], pathways: [] },
      { id: 'ent-clinic', label: 'General ENT Clinic', description: 'General ENT assessments and follow-up', icon: '👂', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'OPHTH',
    units: [
      { id: 'cataract-clinic', label: 'Cataract & Lens Service', description: 'Age-related cataract, congenital cataract', icon: '👁️', encounterTypes: ['outpatient','operative_note','post_op','follow_up'], pathways: [] },
      { id: 'anterior-segment', label: 'Anterior Segment & Cornea', description: 'Conjunctivitis, keratitis, corneal ulcer, uveitis', icon: '🔬', encounterTypes: ['outpatient','procedure','follow_up'], pathways: [] },
      { id: 'glaucoma', label: 'Glaucoma Service', description: 'Primary open-angle glaucoma, acute angle-closure glaucoma', icon: '🔬', encounterTypes: ['outpatient','procedure','follow_up'], pathways: [] },
      { id: 'retina-vitreous', label: 'Retina & Vitreous Service', description: 'Diabetic retinopathy, retinal detachment, macular degeneration', icon: '👁️', encounterTypes: ['outpatient','operative_note','follow_up'], pathways: [] },
      { id: 'neuro-ophthalmology', label: 'Neuro-Ophthalmology', description: 'Optic neuritis, papilledema, cranial nerve palsies', icon: '🧠', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'ophth-trauma', label: 'Ocular Trauma', description: 'Corneal abrasion, globe injury, chemical burn', icon: '🚨', encounterTypes: ['emergency','operative_note','follow_up'], pathways: [] },
      { id: 'pediatric-ophth', label: 'Paediatric Ophthalmology', description: 'Strabismus, amblyopia, congenital cataract', icon: '👶', encounterTypes: ['outpatient','operative_note','follow_up'], pathways: [] },
      { id: 'ophth-emergency', label: 'Eye Casualty', description: 'Red eye, acute vision loss, ocular trauma triage', icon: '🚨', encounterTypes: ['emergency','referral','follow_up'], pathways: [] },
    ],
  },
  {
    key: 'URO',
    units: [
      { id: 'stone-disease', label: 'Stone Disease Unit', description: 'Renal stones, ureteric stones, bladder stones, ESWL, PCNL', icon: '💎', encounterTypes: ['outpatient','procedure','inpatient','follow_up'], pathways: [] },
      { id: 'prostate-clinic', label: 'Prostate Clinic', description: 'BPH, prostatitis, prostate cancer diagnosis and management', icon: '🔬', encounterTypes: ['outpatient','inpatient','operative_note','follow_up'], pathways: [] },
      { id: 'bladder-urothelial', label: 'Bladder & Urothelial Service', description: 'UTI, cystitis, bladder cancer, overactive bladder', icon: '🚽', encounterTypes: ['outpatient','inpatient','procedure','follow_up'], pathways: [] },
      { id: 'renal-urology', label: 'Renal & Upper Tract Urology', description: 'Renal cell carcinoma, renal cyst, hydronephrosis', icon: '💧', encounterTypes: ['outpatient','inpatient','operative_note','follow_up'], pathways: [] },
      { id: 'male-reproductive', label: 'Male Reproductive Health', description: 'Erectile dysfunction, testicular torsion, epididymitis, testicular cancer', icon: '🔬', encounterTypes: ['outpatient','emergency','operative_note','follow_up'], pathways: [] },
      { id: 'incontinence-urogyn', label: 'Incontinence & Functional Urology', description: 'Stress incontinence, urge incontinence, neuropathic bladder', icon: '🔄', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'uro-emergencies', label: 'Urological Emergencies', description: 'Acute urinary retention, priapism, Fournier gangrene', icon: '🚨', encounterTypes: ['emergency','inpatient','operative_note'], pathways: [] },
      { id: 'uro-clinic', label: 'General Urology Clinic', description: 'General urology assessments and follow-up', icon: '🚽', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'ID',
    units: [
      { id: 'bacterial-id', label: 'Bacterial Infections', description: 'Sepsis, meningitis, typhoid, brucellosis, leptospirosis', icon: '🦠', encounterTypes: ['outpatient','inpatient','ward_round','mdt_review'], pathways: ['sepsis'] },
      { id: 'viral-id', label: 'Viral Infections', description: 'HIV/AIDS, hepatitis B/C, COVID-19, influenza, ebola', icon: '🦠', encounterTypes: ['outpatient','inpatient','ward_round','follow_up'], pathways: [] },
      { id: 'mycobacterial-id', label: 'Mycobacterial & Fungal Infections', description: 'Pulmonary/extrapulmonary TB, leprosy, candidemia, cryptococcal meningitis', icon: '🔬', encounterTypes: ['outpatient','inpatient','ward_round'], pathways: [] },
      { id: 'parasitic-id', label: 'Parasitic & Tropical Infections', description: 'Malaria, leishmaniasis, amebiasis, dengue', icon: '🌍', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'id-travel', label: 'Travel & Tropical Medicine', description: 'Travel advice, vaccine-preventable diseases, travellers diarrhoea', icon: '🌍', encounterTypes: ['outpatient','telemedicine','follow_up'], pathways: [] },
      { id: 'id-stewardship', label: 'Antimicrobial Stewardship', description: 'Antibiotic review, OPAT, resistance management, C. difficile', icon: '💊', encounterTypes: ['outpatient','telemedicine','mdt_review'], pathways: [] },
      { id: 'id-general', label: 'General Infectious Diseases', description: 'Complex infections, fever of unknown origin, general ID consults', icon: '🦠', encounterTypes: ['outpatient','inpatient','ward_round'], pathways: [] },
    ],
  },
  {
    key: 'RHEUM',
    units: [
      { id: 'inflammatory-arthritis', label: 'Inflammatory Arthritis Clinic', description: 'RA, psoriatic arthritis, ankylosing spondylitis, gout, pseudogout', icon: '🦴', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'connective-tissue', label: 'Connective Tissue Disease Clinic', description: 'SLE, systemic sclerosis, Sjogrens, dermatomyositis, MCTD', icon: '🔬', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'vasculitis-autoinflammatory', label: 'Vasculitis & Autoinflammatory', description: 'GCA, Takayasu, ANCA vasculitis, Behcet, sarcoidosis', icon: '🩸', encounterTypes: ['outpatient','inpatient','follow_up','telemedicine'], pathways: [] },
      { id: 'rheum-infusion', label: 'Biologic Infusion Unit', description: 'IV biologic therapies, rituximab, infliximab, abatacept', icon: '💉', encounterTypes: ['outpatient','procedure','follow_up'], pathways: [] },
      { id: 'degenerative-soft-tissue', label: 'Degenerative & Soft Tissue Rheumatology', description: 'Osteoarthritis, fibromyalgia, tendinopathy, rotator cuff disease', icon: '🦴', encounterTypes: ['outpatient','follow_up','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'GERI',
    units: [
      { id: 'geri-acute', label: 'Acute Geriatrics Ward', description: 'Acute illness in older adults, delirium, falls, syncope', icon: '👴', encounterTypes: ['emergency','inpatient','ward_round','discharge_summary'], pathways: [] },
      { id: 'cognition-dementia', label: 'Cognition & Dementia Service', description: 'Dementia, mild cognitive impairment, delirium assessment', icon: '🧠', encounterTypes: ['outpatient','inpatient','mdt_review','follow_up'], pathways: [] },
      { id: 'falls-mobility', label: 'Falls & Mobility Clinic', description: 'Recurrent falls, gait disorders, hip fracture, sarcopenia', icon: '🏃', encounterTypes: ['outpatient','inpatient','follow_up'], pathways: [] },
      { id: 'frailty-complex-care', label: 'Frailty & Complex Care', description: 'Frailty syndrome, polypharmacy, malnutrition, pressure ulcers', icon: '🔄', encounterTypes: ['outpatient','inpatient','mdt_review','follow_up'], pathways: [] },
      { id: 'geri-rehab', label: 'Geriatric Rehabilitation', description: 'Post-fracture rehab, deconditioning, comprehensive geriatric assessment', icon: '💪', encounterTypes: ['inpatient','ward_round','follow_up','mdt_review'], pathways: [] },
    ],
  },
  {
    key: 'RAD',
    units: [
      { id: 'neuro-imaging', label: 'Neuroimaging', description: 'Stroke imaging, brain tumour imaging, head trauma', icon: '🧠', encounterTypes: ['outpatient','emergency','telemedicine'], pathways: [] },
      { id: 'chest-imaging', label: 'Chest Imaging', description: 'Pneumonia radiology, PE imaging, lung cancer screening', icon: '🫁', encounterTypes: ['outpatient','emergency','telemedicine'], pathways: [] },
      { id: 'abdominal-imaging', label: 'Abdominal Imaging', description: 'Acute abdomen imaging, liver mass, renal mass', icon: '🏥', encounterTypes: ['outpatient','emergency','telemedicine'], pathways: [] },
      { id: 'msk-imaging', label: 'MSK Imaging', description: 'Fracture characterisation, bone tumour radiology', icon: '🦴', encounterTypes: ['outpatient','emergency','telemedicine'], pathways: [] },
      { id: 'interventional-rad', label: 'Interventional Radiology', description: 'Biopsy guidance, drainage procedures, angiography', icon: '🔬', encounterTypes: ['outpatient','inpatient','procedure'], pathways: [] },
      { id: 'critical-findings', label: 'Critical Findings Reporting', description: 'Free air, tension pneumothorax, urgent findings', icon: '🚨', encounterTypes: ['emergency','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'LAB',
    units: [
      { id: 'lab-haematology', label: 'Haematology Lab', description: 'Anaemia workup, leukaemia diagnostics, coagulation screening', icon: '🩸', encounterTypes: ['outpatient','inpatient','telemedicine'], pathways: [] },
      { id: 'lab-chemistry', label: 'Clinical Chemistry', description: 'Renal function, liver function, cardiac markers, electrolyte analysis', icon: '🧪', encounterTypes: ['outpatient','inpatient','telemedicine'], pathways: [] },
      { id: 'lab-microbiology', label: 'Microbiology', description: 'Blood culture interpretation, urine culture, gram stain guide', icon: '🦠', encounterTypes: ['outpatient','inpatient','telemedicine'], pathways: [] },
      { id: 'transfusion-lab', label: 'Transfusion Medicine', description: 'Blood grouping, cross-matching, transfusion reaction workup', icon: '💉', encounterTypes: ['inpatient','emergency','telemedicine'], pathways: [] },
      { id: 'point-of-care', label: 'Point-of-Care Testing', description: 'ABG interpretation, glucose monitoring, rapid diagnostics', icon: '📊', encounterTypes: ['emergency','inpatient','telemedicine'], pathways: [] },
    ],
  },
  {
    key: 'PHARM',
    units: [
      { id: 'drug-interactions', label: 'Drug Interactions', description: 'Warfarin interactions, antiretroviral interactions, antibiotic interactions', icon: '💊', encounterTypes: ['outpatient','inpatient','telemedicine'], pathways: [] },
      { id: 'therapeutic-drug-monitoring', label: 'Therapeutic Drug Monitoring', description: 'Vancomycin dosing, aminoglycoside dosing, phenytoin monitoring', icon: '📊', encounterTypes: ['inpatient','telemedicine'], pathways: [] },
      { id: 'adverse-drug-reactions', label: 'Adverse Drug Reactions', description: 'Stevens-Johnson syndrome, drug-induced liver injury, allergy assessment', icon: '🚨', encounterTypes: ['inpatient','emergency','telemedicine'], pathways: [] },
      { id: 'antimicrobial-stewardship-pharm', label: 'Antimicrobial Stewardship', description: 'Empiric antibiotic guide, antifungal selection, resistance management', icon: '🦠', encounterTypes: ['inpatient','telemedicine','mdt_review'], pathways: [] },
      { id: 'high-alert-medications', label: 'High-Alert Medications', description: 'Insulin safety, anticoagulation safety, chemotherapy safety', icon: '⚠️', encounterTypes: ['inpatient','telemedicine'], pathways: [] },
    ],
  },
];

export async function seedOrganization(orgId: string): Promise<void> {
  const batch = writeBatch(db);

  for (const dept of DEPT_UNITS) {
    const deptInfo = DEPARTMENTS[dept.key];
    if (!deptInfo) continue;

    const deptRef = doc(db, 'organizations', orgId, 'departments', dept.key);
    batch.set(deptRef, {
      key: dept.key,
      label: deptInfo.label,
      color: deptInfo.color,
      icon: deptInfo.icon,
      description: `Comprehensive ${deptInfo.label.toLowerCase()} services.`,
      activeCases: 0,
      todayEncounters: 0,
      avgWaitMinutes: 0,
      createdAt: Date.now(),
    });

    for (const unit of dept.units) {
      const unitRef = doc(db, 'organizations', orgId, 'departments', dept.key, 'units', unit.id);
      batch.set(unitRef, {
        id: unit.id,
        label: unit.label,
        description: unit.description,
        icon: unit.icon,
        encounterTypes: unit.encounterTypes,
        pathways: unit.pathways,
        activeCases: 0,
        createdAt: Date.now(),
      });
    }
  }

  await batch.commit();
}

export function getSeedDepartments(): DeptDef[] {
  return DEPT_UNITS;
}
