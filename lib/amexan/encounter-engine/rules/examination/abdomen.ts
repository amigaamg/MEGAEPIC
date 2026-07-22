import { QuestionGroup } from '../../types/ces';

export const exam_abdomen_inspection: QuestionGroup = {
  id: 'exam_abdomen_inspection',
  label: 'Abdomen — Inspection',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_abd_inspect_shape', phase: 'systemic_exam', question: 'Abdominal shape', type: 'chips', chips: ['Flat', 'Scaphoid', 'Distended', 'Obese', 'Protuberant'], required: true, factKey: 'abd_inspect_shape' },
    { id: 'q_exam_abd_inspect_scars', phase: 'systemic_exam', question: 'Surgical scars?', type: 'chips', chips: ['None', 'Midline', 'Gridiron', 'Pfannenstiel', 'Kocher', 'Paramedian', 'Laparoscopy', 'Multiple'], required: true, factKey: 'abd_inspect_scars' },
    { id: 'q_exam_abd_inspect_movement', phase: 'systemic_exam', question: 'Respiratory movement', type: 'chips', chips: ['Normal', 'Reduced', 'Paradoxical'], required: false, factKey: 'abd_inspect_movement' },
    { id: 'q_exam_abd_inspect_hernias', phase: 'systemic_exam', question: 'Visible hernias?', type: 'chips', chips: ['None', 'Inguinal', 'Umbilical', 'Incisional', 'Femoral', 'Epigastric'], required: false, factKey: 'abd_inspect_hernias' },
    { id: 'q_exam_abd_inspect_distension', phase: 'systemic_exam', question: 'Distension?', type: 'chips', chips: ['None', 'Mild', 'Moderate', 'Severe', 'Generalized'], required: false, factKey: 'abd_inspect_distension' },
    { id: 'q_exam_abd_inspect_masses', phase: 'systemic_exam', question: 'Visible masses?', type: 'boolean', required: false, factKey: 'abd_inspect_masses' },
    { id: 'q_exam_abd_inspect_peristalsis', phase: 'systemic_exam', question: 'Visible peristalsis?', type: 'boolean', required: false, factKey: 'abd_inspect_peristalsis' },
    { id: 'q_exam_abd_inspect_veins', phase: 'systemic_exam', question: 'Dilated superficial veins?', type: 'boolean', required: false, factKey: 'abd_inspect_veins' },
    { id: 'q_exam_abd_inspect_umbilicus', phase: 'systemic_exam', question: 'Umbilicus', type: 'chips', chips: ['Normal', 'Inverted', 'Everted', 'Discharge'], required: false, factKey: 'abd_inspect_umbilicus' },
  ],
};

export const exam_abdomen_auscultation: QuestionGroup = {
  id: 'exam_abdomen_auscultation',
  label: 'Abdomen — Auscultation',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_abd_ausc_bowel', phase: 'systemic_exam', question: 'Bowel sounds', type: 'chips', chips: ['Normal', 'Increased', 'Reduced', 'Absent', 'High-pitched', 'Tinkling'], required: true, factKey: 'abd_ausc_bowel_sounds' },
    { id: 'q_exam_abd_ausc_bruits', phase: 'systemic_exam', question: 'Abdominal bruits?', type: 'boolean', required: false, factKey: 'abd_ausc_bruits' },
    { id: 'q_exam_abd_ausc_venous', phase: 'systemic_exam', question: 'Venous hum?', type: 'boolean', required: false, factKey: 'abd_ausc_venous_hum' },
  ],
};

export const exam_abdomen_percussion: QuestionGroup = {
  id: 'exam_abdomen_percussion',
  label: 'Abdomen — Percussion',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_abd_perc_note', phase: 'systemic_exam', question: 'Percussion note', type: 'chips', chips: ['Tympanic', 'Dull', 'Resonant', 'Shifting dullness'], required: true, factKey: 'abd_perc_note' },
    { id: 'q_exam_abd_perc_liver', phase: 'systemic_exam', question: 'Liver dullness', type: 'chips', chips: ['Preserved', 'Obliterated', 'Enlarged'], required: false, factKey: 'abd_perc_liver' },
    { id: 'q_exam_abd_perc_spleen', phase: 'systemic_exam', question: 'Spleen dullness', type: 'chips', chips: ['Not enlarged', 'Splenic dullness', 'Palpable spleen'], required: false, factKey: 'abd_perc_spleen' },
    { id: 'q_exam_abd_perc_shifting', phase: 'systemic_exam', question: 'Shifting dullness? (ascites)', type: 'boolean', required: false, factKey: 'abd_perc_shifting_dullness' },
    { id: 'q_exam_abd_perc_fluid_thrill', phase: 'systemic_exam', question: 'Fluid thrill?', type: 'boolean', required: false, factKey: 'abd_perc_fluid_thrill' },
  ],
};

export const exam_abdomen_palpation_superficial: QuestionGroup = {
  id: 'exam_abdomen_palpation_superficial',
  label: 'Abdomen — Superficial Palpation',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_abd_palp_tenderness', phase: 'systemic_exam', question: 'Tenderness?', type: 'chips', chips: ['None', 'Right upper', 'Epigastric', 'Left upper', 'Right lower', 'Left lower', 'Suprapubic', 'Generalized', 'Periumbilical'], required: true, factKey: 'abd_palp_tenderness' },
    { id: 'q_exam_abd_palp_guarding', phase: 'systemic_exam', question: 'Guarding?', type: 'chips', chips: ['None', 'Voluntary', 'Involuntary', 'Generalized'], required: true, factKey: 'abd_palp_guarding' },
    { id: 'q_exam_abd_palp_rigidity', phase: 'systemic_exam', question: 'Rigidity?', type: 'boolean', required: false, factKey: 'abd_palp_rigidity' },
    { id: 'q_exam_abd_palp_rebound', phase: 'systemic_exam', question: 'Rebound tenderness?', type: 'boolean', required: false, factKey: 'abd_palp_rebound' },
    { id: 'q_exam_abd_palp_masses', phase: 'systemic_exam', question: 'Palpable masses?', type: 'boolean', required: false, factKey: 'abd_palp_masses' },
    { id: 'q_exam_abd_palp_warmth', phase: 'systemic_exam', question: 'Abdominal wall warmth', type: 'chips', chips: ['Normal', 'Warm', 'Hot'], required: false, factKey: 'abd_palp_warmth' },
  ],
};

export const exam_abdomen_palpation_deep: QuestionGroup = {
  id: 'exam_abdomen_palpation_deep',
  label: 'Abdomen — Deep Palpation',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_abd_deep_liver', phase: 'systemic_exam', question: 'Liver palpable?', type: 'chips', chips: ['Not palpable', 'Palpable — smooth', 'Palpable — nodular', 'Tender'], required: false, factKey: 'abd_deep_liver' },
    { id: 'q_exam_abd_deep_spleen', phase: 'systemic_exam', question: 'Spleen palpable?', type: 'chips', chips: ['Not palpable', 'Tip', 'Enlarged — 2cm', 'Enlarged — >5cm', 'Massive'], required: false, factKey: 'abd_deep_spleen' },
    { id: 'q_exam_abd_deep_kidneys', phase: 'systemic_exam', question: 'Kidneys ballotable?', type: 'chips', chips: ['Not ballotable', 'Right', 'Left', 'Bilateral'], required: false, factKey: 'abd_deep_kidneys' },
    { id: 'q_exam_abd_deep_aorta', phase: 'systemic_exam', question: 'Aorta palpable?', type: 'chips', chips: ['Normal', 'Prominent', 'Pulsatile mass', 'Tender'], required: false, factKey: 'abd_deep_aorta' },
    { id: 'q_exam_abd_deep_bladder', phase: 'systemic_exam', question: 'Bladder palpable?', type: 'boolean', required: false, factKey: 'abd_deep_bladder' },
  ],
};

export const exam_abdomen_special_tests: QuestionGroup = {
  id: 'exam_abdomen_special_tests',
  label: 'Abdomen — Special Tests',
  phase: 'systemic_exam',
  condition: { factKey: 'abd_palp_tenderness', value: 'Right lower' },
  cards: [
    { id: 'q_exam_abd_spec_mcburney', phase: 'systemic_exam', question: 'McBurney\'s point tenderness?', type: 'boolean', required: false, factKey: 'abd_spec_mcburney' },
    { id: 'q_exam_abd_spec_rovsing', phase: 'systemic_exam', question: 'Rovsing\'s sign?', type: 'boolean', required: false, factKey: 'abd_spec_rovsing' },
    { id: 'q_exam_abd_spec_psoas', phase: 'systemic_exam', question: 'Psoas sign?', type: 'boolean', required: false, factKey: 'abd_spec_psoas' },
    { id: 'q_exam_abd_spec_obturator', phase: 'systemic_exam', question: 'Obturator sign?', type: 'boolean', required: false, factKey: 'abd_spec_obturator' },
    { id: 'q_exam_abd_spec_dunphy', phase: 'systemic_exam', question: 'Dunphy\'s sign (pain on coughing)?', type: 'boolean', required: false, factKey: 'abd_spec_dunphy' },
    { id: 'q_exam_abd_spec_heel_jar', phase: 'systemic_exam', question: 'Heel jar test?', type: 'boolean', required: false, factKey: 'abd_spec_heel_jar' },
    { id: 'q_exam_abd_spec_murphy', phase: 'systemic_exam', question: 'Murphy\'s sign?', type: 'boolean', required: false, factKey: 'abd_spec_murphy' },
    { id: 'q_exam_abd_spec_carnett', phase: 'systemic_exam', question: 'Carnett\'s sign?', type: 'boolean', required: false, factKey: 'abd_spec_carnett' },
  ],
};

export const exam_rectal: QuestionGroup = {
  id: 'exam_rectal',
  label: 'Rectal Examination',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_rectal_consent', phase: 'systemic_exam', question: 'Consent obtained?', type: 'boolean', required: true, factKey: 'rectal_consent' },
    { id: 'q_exam_rectal_inspection', phase: 'systemic_exam', question: 'Perianal inspection', type: 'chips', chips: ['Normal', 'Haemorrhoids', 'Fissure', 'Fistula', 'Skin tags', 'Abscess', 'Excoriated'], required: false, factKey: 'rectal_inspection' },
    { id: 'q_exam_rectal_tone', phase: 'systemic_exam', question: 'Anal tone', type: 'chips', chips: ['Normal', 'Increased', 'Reduced', 'Absent'], required: false, factKey: 'rectal_tone' },
    { id: 'q_exam_rectal_mass', phase: 'systemic_exam', question: 'Rectal mass?', type: 'boolean', required: false, factKey: 'rectal_mass' },
    { id: 'q_exam_rectal_tenderness', phase: 'systemic_exam', question: 'Rectal tenderness?', type: 'chips', chips: ['None', 'Right pelvis', 'Left pelvis', 'Generalized', 'Posterior'], required: false, factKey: 'rectal_tenderness' },
    { id: 'q_exam_rectal_stool', phase: 'systemic_exam', question: 'Stool on glove?', type: 'chips', chips: ['None', 'Normal', 'Black/tarry', 'Blood-streaked', 'Mucus'], required: false, factKey: 'rectal_stool' },
    { id: 'q_exam_rectal_prostate', phase: 'systemic_exam', question: 'Prostate (male)', type: 'chips', chips: ['Normal', 'Enlarged — smooth', 'Enlarged — nodular', 'Tender', 'Not assessed'], required: false, factKey: 'rectal_prostate' },
  ],
};

export const exam_hernia: QuestionGroup = {
  id: 'exam_hernia',
  label: 'Hernial Orifices',
  phase: 'systemic_exam',
  cards: [
    { id: 'q_exam_hernia_inguinal', phase: 'systemic_exam', question: 'Inguinal hernia?', type: 'chips', chips: ['None', 'Right', 'Left', 'Bilateral'], required: false, factKey: 'hernia_inguinal' },
    { id: 'q_exam_hernia_femoral', phase: 'systemic_exam', question: 'Femoral hernia?', type: 'chips', chips: ['None', 'Right', 'Left', 'Bilateral'], required: false, factKey: 'hernia_femoral' },
    { id: 'q_exam_hernia_umbilical', phase: 'systemic_exam', question: 'Umbilical hernia?', type: 'boolean', required: false, factKey: 'hernia_umbilical' },
    { id: 'q_exam_hernia_incisional', phase: 'systemic_exam', question: 'Incisional hernia?', type: 'boolean', required: false, factKey: 'hernia_incisional' },
    { id: 'q_exam_hernia_cough_impulse', phase: 'systemic_exam', question: 'Cough impulse?', type: 'boolean', required: false, factKey: 'hernia_cough_impulse' },
    { id: 'q_exam_hernia_reducible', phase: 'systemic_exam', question: 'Reducible?', type: 'boolean', required: false, factKey: 'hernia_reducible' },
  ],
};
