import { QuestionGroup, QuestionCard } from '../types/ces';

export function getPerinatalCardsForSection(sectionId: string): QuestionCard[] {
  const groups = Object.values(PERINATAL_QUESTION_GROUPS).filter(
    g => g.constitutionalSectionId === sectionId
  );
  return groups.flatMap(g => g.cards);
}

export const PERINATAL_QUESTION_GROUPS: Record<string, QuestionGroup> = {
  neonatal_antenatal: {
    id: 'neonatal_antenatal',
    label: 'Antenatal History',
    phase: 'past_medical',
    constitutionalSectionId: 'perinatal_history',
    cards: [
      { id: 'q_perinatal_anc', phase: 'past_medical', question: 'Antenatal care attended?', type: 'chips', chips: ['Yes, regular', 'Yes, irregular', 'None', 'Unknown'], required: true, factKey: 'perinatal_anc' },
      { id: 'q_perinatal_anc_visits', phase: 'past_medical', question: 'Number of ANC visits?', type: 'text', required: false, factKey: 'perinatal_anc_visits' },
      { id: 'q_perinatal_maternal_illness', phase: 'past_medical', question: 'Maternal illness during pregnancy?', type: 'chips', chips: ['None', 'Hypertension', 'Diabetes', 'Malaria', 'HIV', 'Syphilis', 'UTI', 'Anaemia', 'Other'], required: false, factKey: 'perinatal_maternal_illness' },
      { id: 'q_perinatal_pregnancy_complications', phase: 'past_medical', question: 'Pregnancy complications?', type: 'chips', chips: ['None', 'APH', 'Preterm labour', 'PROM', 'Oligohydramnios', 'Polyhydramnios', 'IUGR', 'Other'], required: false, factKey: 'perinatal_pregnancy_complications' },
      { id: 'q_perinatal_medications', phase: 'past_medical', question: 'Medications during pregnancy?', type: 'chips', chips: ['None', 'Iron/folate', 'Antihypertensives', 'Antidiabetics', 'Antimalarials', 'ART', 'Antibiotics', 'Other'], required: false, factKey: 'perinatal_medications' },
      { id: 'q_perinatal_alcohol', phase: 'past_medical', question: 'Alcohol during pregnancy?', type: 'chips', chips: ['None', 'Occasional', 'Regular', 'Unknown'], required: false, factKey: 'perinatal_alcohol' },
      { id: 'q_perinatal_smoking', phase: 'past_medical', question: 'Smoking during pregnancy?', type: 'chips', chips: ['None', 'Yes', 'Unknown'], required: false, factKey: 'perinatal_smoking' },
      { id: 'q_perinatal_fetal_movements', phase: 'past_medical', question: 'Fetal movements before delivery?', type: 'chips', chips: ['Normal', 'Reduced', 'Absent', 'Unknown'], required: false, factKey: 'perinatal_fetal_movements' },
      { id: 'q_perinatal_ultrasound', phase: 'past_medical', question: 'Antenatal ultrasound abnormalities?', type: 'chips', chips: ['None', 'Yes', 'Not done', 'Unknown'], required: false, factKey: 'perinatal_ultrasound' },
    ],
  },

  neonatal_natal: {
    id: 'neonatal_natal',
    label: 'Natal History',
    phase: 'past_medical',
    constitutionalSectionId: 'perinatal_history',
    cards: [
      { id: 'q_perinatal_birth_place', phase: 'past_medical', question: 'Place of delivery?', type: 'chips', chips: ['Hospital', 'Health centre', 'Clinic', 'Home', 'On the way', 'Other'], required: true, factKey: 'perinatal_birth_place' },
      { id: 'q_perinatal_birth_attendant', phase: 'past_medical', question: 'Birth attendant?', type: 'chips', chips: ['Doctor', 'Midwife', 'Nurse', 'TBA', 'Relative', 'Unassisted'], required: true, factKey: 'perinatal_birth_attendant' },
      { id: 'q_perinatal_labour_onset', phase: 'past_medical', question: 'Labour onset?', type: 'chips', chips: ['Spontaneous', 'Induced', 'C-section (no labour)', 'Unknown'], required: true, factKey: 'perinatal_labour_onset' },
      { id: 'q_perinatal_labour_duration', phase: 'past_medical', question: 'Prolonged labour?', type: 'chips', chips: ['No', 'Yes', 'Unknown'], required: false, factKey: 'perinatal_labour_duration' },
      { id: 'q_perinatal_liquor', phase: 'past_medical', question: 'Liquor appearance?', type: 'chips', chips: ['Clear', 'Meconium-stained', 'Blood-stained', 'Foul-smelling', 'Unknown'], required: false, factKey: 'perinatal_liquor' },
      { id: 'q_perinatal_delivery_mode', phase: 'past_medical', question: 'Mode of delivery?', type: 'chips', chips: ['SVD', 'Vacuum', 'Forceps', 'C-section (elective)', 'C-section (emergency)', 'Unknown'], required: true, factKey: 'perinatal_delivery_mode' },
      { id: 'q_perinatal_presentation', phase: 'past_medical', question: 'Fetal presentation?', type: 'chips', chips: ['Cephalic', 'Breech', 'Transverse', 'Other', 'Unknown'], required: false, factKey: 'perinatal_presentation' },
      { id: 'q_perinatal_cried', phase: 'past_medical', question: 'Baby cried immediately?', type: 'chips', chips: ['Yes', 'Weak cry', 'No', 'Unknown'], required: true, factKey: 'perinatal_cried' },
      { id: 'q_perinatal_apgar', phase: 'past_medical', question: 'APGAR scores (1/5/10 min)?', type: 'text', required: false, factKey: 'perinatal_apgar' },
      { id: 'q_perinatal_resuscitation', phase: 'past_medical', question: 'Resuscitation required?', type: 'chips', chips: ['None', 'Stimulation', 'Bag-mask', 'Chest compressions', 'Intubation', 'Medications'], required: false, factKey: 'perinatal_resuscitation' },
    ],
  },

  neonatal_postnatal: {
    id: 'neonatal_postnatal',
    label: 'Postnatal History',
    phase: 'past_medical',
    constitutionalSectionId: 'perinatal_history',
    cards: [
      { id: 'q_perinatal_skin_to_skin', phase: 'past_medical', question: 'Skin-to-skin contact initiated?', type: 'chips', chips: ['Yes', 'No', 'Unknown'], required: false, factKey: 'perinatal_skin_to_skin' },
      { id: 'q_perinatal_breastfeeding', phase: 'past_medical', question: 'Breastfeeding initiated?', type: 'chips', chips: ['Yes, within 1hr', 'Yes, after 1hr', 'No', 'Unknown'], required: true, factKey: 'perinatal_breastfeeding' },
      { id: 'q_perinatal_feeding_difficulty', phase: 'past_medical', question: 'Feeding difficulties?', type: 'chips', chips: ['None', 'Poor suck', 'Poor latch', 'Vomiting', 'Choking', 'Other'], required: false, factKey: 'perinatal_feeding_difficulty' },
      { id: 'q_perinatal_vitamin_k', phase: 'past_medical', question: 'Vitamin K given?', type: 'chips', chips: ['Yes', 'No', 'Unknown'], required: false, factKey: 'perinatal_vitamin_k' },
      { id: 'q_perinatal_jaundice', phase: 'past_medical', question: 'Neonatal jaundice?', type: 'chips', chips: ['No', 'Yes (phototherapy)', 'Yes (exchange transfusion)', 'Unknown'], required: false, factKey: 'perinatal_jaundice' },
      { id: 'q_perinatal_nicu', phase: 'past_medical', question: 'NICU admission?', type: 'chips', chips: ['No', 'Yes', 'Unknown'], required: false, factKey: 'perinatal_nicu' },
      { id: 'q_perinatal_nicu_reason', phase: 'past_medical', question: 'Reason for NICU admission?', type: 'chips', chips: ['Prematurity', 'Respiratory distress', 'Sepsis', 'Jaundice', 'Hypoglycaemia', 'Congenital anomaly', 'Other'], required: false, factKey: 'perinatal_nicu_reason' },
      { id: 'q_perinatal_discharge_age', phase: 'past_medical', question: 'Age at discharge (days)?', type: 'text', required: false, factKey: 'perinatal_discharge_age' },
    ],
  },
};
