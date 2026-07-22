import { QuestionGroup, QuestionCard } from '../types/ces';

export function getObgynCardsForSection(sectionId: string): QuestionCard[] {
  const groups = Object.values(OBGYN_QUESTION_GROUPS).filter(
    g => g.constitutionalSectionId === sectionId
  );
  return groups.flatMap(g => g.cards);
}

export const OBGYN_QUESTION_GROUPS: Record<string, QuestionGroup> = {
  obgyn_menstrual: {
    id: 'obgyn_menstrual',
    label: 'Menstrual History',
    phase: 'past_medical',
    constitutionalSectionId: 'gynecological_history',
    cards: [
      { id: 'q_obgyn_menarche', phase: 'past_medical', question: 'Age at menarche?', type: 'chips', chips: ['<10', '10-12', '13-15', '16+', 'Unknown'], required: false, factKey: 'obgyn_menarche' },
      { id: 'q_obgyn_lmp', phase: 'past_medical', question: 'Date of Last Menstrual Period (LMP)?', type: 'text', required: true, factKey: 'obgyn_lmp' },
      { id: 'q_obgyn_cycle_length', phase: 'past_medical', question: 'Cycle length (days)?', type: 'chips', chips: ['<21', '21-27', '28-30', '31-35', '>35', 'Irregular', 'Unknown'], required: false, factKey: 'obgyn_cycle_length' },
      { id: 'q_obgyn_flow_duration', phase: 'past_medical', question: 'Duration of flow (days)?', type: 'chips', chips: ['1-3', '4-5', '6-7', '>7', 'Variable'], required: false, factKey: 'obgyn_flow_duration' },
      { id: 'q_obgyn_dysmenorrhea', phase: 'past_medical', question: 'Dysmenorrhea (painful periods)?', type: 'chips', chips: ['None', 'Mild', 'Moderate', 'Severe'], required: false, factKey: 'obgyn_dysmenorrhea' },
      { id: 'q_obgyn_menorrhagia', phase: 'past_medical', question: 'Menorrhagia (heavy bleeding)?', type: 'chips', chips: ['No', 'Yes', 'Unknown'], required: false, factKey: 'obgyn_menorrhagia' },
      { id: 'q_obgyn_menopause', phase: 'past_medical', question: 'Menopausal status?', type: 'chips', chips: ['Pre-menopausal', 'Peri-menopausal', 'Post-menopausal', 'Not applicable', 'Unknown'], required: false, factKey: 'obgyn_menopause' },
      { id: 'q_obgyn_menopause_age', phase: 'past_medical', question: 'Age at menopause?', type: 'text', required: false, factKey: 'obgyn_menopause_age', dependsOn: { questionId: 'q_obgyn_menopause', value: 'Post-menopausal' } },
    ],
  },

  obgyn_current_pregnancy: {
    id: 'obgyn_current_pregnancy',
    label: 'Current Pregnancy',
    phase: 'past_medical',
    constitutionalSectionId: 'pregnancy_history',
    cards: [
      { id: 'q_obgyn_currently_pregnant', phase: 'past_medical', question: 'Currently pregnant?', type: 'chips', chips: ['No', 'Yes', 'Unsure'], required: true, factKey: 'obgyn_currently_pregnant' },
      { id: 'q_obgyn_edd', phase: 'past_medical', question: 'Expected Date of Delivery (EDD)?', type: 'text', required: false, factKey: 'obgyn_edd', dependsOn: { questionId: 'q_obgyn_currently_pregnant', value: 'Yes' } },
      { id: 'q_obgyn_gestation', phase: 'past_medical', question: 'Current gestation (weeks)?', type: 'chips', chips: ['<12', '12-24', '24-36', '>36', 'Unknown'], required: false, factKey: 'obgyn_gestation', dependsOn: { questionId: 'q_obgyn_currently_pregnant', value: 'Yes' } },
      { id: 'q_obgyn_antenatal_care', phase: 'past_medical', question: 'Antenatal care attendance?', type: 'chips', chips: ['Regular', 'Irregular', 'None', 'Unknown'], required: false, factKey: 'obgyn_antenatal_care', dependsOn: { questionId: 'q_obgyn_currently_pregnant', value: 'Yes' } },
      { id: 'q_obgyn_pregnancy_complications', phase: 'past_medical', question: 'Any pregnancy complications?', type: 'chips', chips: ['None', 'Hyperemesis', 'Hypertension', 'Diabetes', 'Bleeding', 'Infection', 'Anaemia', 'Other'], required: false, factKey: 'obgyn_pregnancy_complications', dependsOn: { questionId: 'q_obgyn_currently_pregnant', value: 'Yes' } },
    ],
  },

  obgyn_obstetric: {
    id: 'obgyn_obstetric',
    label: 'Past Obstetric History',
    phase: 'past_medical',
    constitutionalSectionId: 'obstetric_history',
    cards: [
      { id: 'q_obgyn_gravida', phase: 'past_medical', question: 'Gravida (total number of pregnancies)?', type: 'text', required: true, factKey: 'obgyn_gravida' },
      { id: 'q_obgyn_para', phase: 'past_medical', question: 'Para (number of deliveries)?', type: 'text', required: true, factKey: 'obgyn_para' },
      { id: 'q_obgyn_abortus', phase: 'past_medical', question: 'Abortus (miscarriages/terminations)?', type: 'text', required: false, factKey: 'obgyn_abortus' },
      { id: 'q_obgyn_living', phase: 'past_medical', question: 'Number of living children?', type: 'text', required: true, factKey: 'obgyn_living' },
      { id: 'q_obgyn_previous_cs', phase: 'past_medical', question: 'Previous caesarean sections?', type: 'chips', chips: ['No', 'Yes (1)', 'Yes (2+)', 'Unknown'], required: false, factKey: 'obgyn_previous_cs' },
      { id: 'q_obgyn_obstetric_complications', phase: 'past_medical', question: 'Any past obstetric complications?', type: 'chips', chips: ['None', 'Pre-eclampsia', 'Postpartum haemorrhage', 'Preterm labour', 'Miscarriage', 'Stillbirth', 'Ectopic', 'Other'], required: false, factKey: 'obgyn_obstetric_complications' },
    ],
  },

  obgyn_gynecological: {
    id: 'obgyn_gynecological',
    label: 'Gynecological History',
    phase: 'past_medical',
    constitutionalSectionId: 'gynecological_history',
    cards: [
      { id: 'q_obgyn_cervical_screening', phase: 'past_medical', question: 'Cervical screening (Pap smear) history?', type: 'chips', chips: ['Up to date', 'Due/overdue', 'Never done', 'Unknown', 'Not applicable'], required: false, factKey: 'obgyn_cervical_screening' },
      { id: 'q_obgyn_contraception', phase: 'past_medical', question: 'Current contraception method?', type: 'chips', chips: ['None', 'OCP', 'Injectable', 'IUD', 'Implant', 'Condoms', 'Sterilization', 'Lactational amenorrhea', 'Other'], required: false, factKey: 'obgyn_contraception' },
      { id: 'q_obgyn_fertility', phase: 'past_medical', question: 'Any fertility concerns?', type: 'chips', chips: ['No', 'Yes (primary infertility)', 'Yes (secondary infertility)', 'Unknown'], required: false, factKey: 'obgyn_fertility' },
      { id: 'q_obgyn_std_history', phase: 'past_medical', question: 'History of STIs?', type: 'chips', chips: ['None', 'Syphilis', 'Gonorrhea', 'Chlamydia', 'Trichomonas', 'HPV', 'HSV', 'HIV', 'Other', 'Unknown'], required: false, factKey: 'obgyn_std_history' },
      { id: 'q_obgyn_gynae_surgery', phase: 'past_medical', question: 'Previous gynecological surgeries?', type: 'chips', chips: ['None', 'D&C', 'Myomectomy', 'Ovarian cystectomy', 'Hysterectomy', 'Tubal ligation', 'Other'], required: false, factKey: 'obgyn_gynae_surgery' },
      { id: 'q_obgyn_vaginal_discharge', phase: 'past_medical', question: 'Abnormal vaginal discharge?', type: 'chips', chips: ['No', 'Yes (itchy)', 'Yes (foul-smelling)', 'Yes (coloured)', 'Other', 'Unknown'], required: false, factKey: 'obgyn_vaginal_discharge' },
      { id: 'q_obgyn_pelvic_pain', phase: 'past_medical', question: 'Chronic pelvic pain?', type: 'chips', chips: ['No', 'Mild', 'Moderate', 'Severe', 'Unknown'], required: false, factKey: 'obgyn_pelvic_pain' },
    ],
  },
};
