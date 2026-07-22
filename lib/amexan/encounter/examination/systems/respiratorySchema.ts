// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Respiratory System Examination Schema
// ═══════════════════════════════════════════════════════════════════════════════
// Hutchison's order: Inspection → Palpation → Percussion → Auscultation → Special Tests
// ═══════════════════════════════════════════════════════════════════════════════

import type { SystemExamFieldDef } from '../systemExaminationTypes';

export const RESPIRATORY_FIELDS: readonly SystemExamFieldDef[] = [

  // ═════════════════════════════════════════════════════════════════════════
  // INSPECTION
  // ═════════════════════════════════════════════════════════════════════════

  // General inspection of chest
  { id: 'resp_insp_shape', label: 'Chest shape', shortLabel: 'Shape', phase: 'inspection', type: 'select', options: ['normal', 'barrel', 'pectus_carinatum', 'pectus_excavatum', 'kyphoscoliotic', 'rickety_rosary', 'harrison_sulcus'], mandatory: true, clinicalGuide: 'Observe chest shape from anterior, lateral and posterior', observation: 'Shape and symmetry of the thoracic cage', description: 'Describe any deformity or asymmetry', interpretation: 'Structural abnormalities suggest chronic respiratory disease, rickets, or congenital conditions', activatesFields: ['resp_insp_symmetry'] },

  { id: 'resp_insp_symmetry', label: 'Chest symmetry', shortLabel: 'Symmetry', phase: 'inspection', type: 'select', options: ['symmetrical', 'asymmetrical'], mandatory: true, clinicalGuide: 'Is one side larger, smaller, or moving less than the other?', observation: 'Symmetry of chest wall movement', description: 'Note which side is affected', measurement: true, unit: '', interpretation: 'Unilateral reduction suggests effusion, pneumothorax, or phrenic nerve palsy' },

  { id: 'resp_insp_breathing_pattern', label: 'Breathing pattern', shortLabel: 'Pattern', phase: 'inspection', type: 'select', options: ['normal', 'shallow', 'deep', 'kussmaul', 'cheyne_stokes', 'biot', 'apneustic', 'ataxic'], mandatory: true, clinicalGuide: 'Observe at rest for 60 seconds without patient awareness', observation: 'Rate, rhythm, and depth of respiration', description: 'Characterize the pattern', interpretation: 'Abnormal patterns suggest metabolic, neurological, or respiratory pathology' },

  { id: 'resp_insp_use_of_accessory', label: 'Use of accessory muscles', shortLabel: 'Accessory mm.', phase: 'inspection', type: 'boolean', mandatory: true, clinicalGuide: 'Observe scalene, sternocleidomastoid, intercostal contraction', observation: 'Contraction of scalene, SCM, and intercostal muscles', description: 'Mild / Moderate / Severe', interpretation: 'Indicates increased work of breathing — severe obstruction or restriction', isAbnormalOnly: true },

  { id: 'resp_insp_trachea', label: 'Tracheal position', shortLabel: 'Trachea', phase: 'inspection', type: 'select', options: ['central', 'deviated_left', 'deviated_right'], mandatory: true, clinicalGuide: 'Palpate the trachea in the suprasternal notch', observation: 'Position of trachea relative to midline', measurement: true, unit: 'cm deviation', interpretation: 'Deviation suggests tension pneumothorax (away), collapse/fibrosis (towards), or mediastinal mass' },

  { id: 'resp_insp_intercostal', label: 'Intercostal recession', shortLabel: 'Recession', phase: 'inspection', type: 'select', options: ['absent', 'mild', 'moderate', 'severe'], mandatory: true, clinicalGuide: 'Observe for indrawing between ribs during inspiration', observation: 'Intercostal spaces during inspiration', description: 'Grade severity', interpretation: 'Indicates increased negative intrathoracic pressure — airway obstruction or stiff lungs', isAbnormalOnly: true },

  { id: 'resp_insp_cyanosis', label: 'Central cyanosis', shortLabel: 'Cyanosis', phase: 'inspection', type: 'boolean', mandatory: true, clinicalGuide: 'Examine tongue and lips for blue discoloration', observation: 'Blue discoloration of tongue and lips', description: 'Absent / Present', interpretation: 'Indicates ≥5g/dL deoxygenated haemoglobin — significant hypoxaemia' },

  { id: 'resp_insp_clubbing', label: 'Finger clubbing', shortLabel: 'Clubbing', phase: 'inspection', type: 'select', options: ['absent', 'grade_1', 'grade_2', 'grade_3', 'grade_4'], mandatory: false, clinicalGuide: 'Loss of Schamroth window; increased hyponychial angle', observation: 'Nail bed angle and Schamroth window', description: 'Grade the severity', interpretation: 'Associated with suppurative lung disease, bronchogenic carcinoma, cyanotic heart disease' },

  { id: 'resp_insp_apex_beat', label: 'Apex beat position', shortLabel: 'Apex beat', phase: 'inspection', type: 'select', options: ['normal', 'displaced_left', 'displaced_right', 'not_palpable'], mandatory: false, clinicalGuide: 'Apex displacement may indicate mediastinal shift', observation: 'Position of the apex beat', description: 'Note displacement in cm', measurement: true, unit: 'cm lateral to MCL', interpretation: 'Displacement suggests cardiomegaly, effusion, or mediastinal shift' },

  { id: 'resp_insp_chest_movement', label: 'Chest expansion (inspection)', shortLabel: 'Expansion', phase: 'inspection', type: 'select', options: ['equal_bilateral', 'reduced_left', 'reduced_right', 'reduced_bilateral'], mandatory: true, clinicalGuide: 'Observe both hands on posterolateral chest wall with thumbs meeting at T10', observation: 'Symmetry and range of chest wall expansion', description: 'Assess from behind — hands placed on lower ribs', interpretation: 'Unilateral reduction suggests effusion, consolidation, pneumothorax; bilateral suggests fibrosis, COPD' },

  { id: 'resp_insp_scars', label: 'Chest scars', shortLabel: 'Scars', phase: 'inspection', type: 'multiselect', options: ['thoracotomy', 'sternotomy', 'chest_drain', 'laparoscopic', 'other'], mandatory: false, clinicalGuide: 'Document all chest wall scars; note thoracotomy, sternotomy, drain sites', observation: 'Skin integrity and surgical scars', description: 'Note type and location of scars', interpretation: 'Previous thoracic surgery or trauma may explain current findings', isAbnormalOnly: true },

  // ═════════════════════════════════════════════════════════════════════════
  // PALPATION
  // ═════════════════════════════════════════════════════════════════════════

  { id: 'resp_palp_trachea', label: 'Tracheal palpation', shortLabel: 'Trachea', phase: 'palpation', type: 'select', options: ['central', 'deviated_left', 'deviated_right'], mandatory: true, clinicalGuide: 'Place index finger in suprasternal notch; feel tracheal rings', observation: 'Confirm tracheal position by palpation', description: 'Central or deviated — note direction', interpretation: 'Confirms inspection findings; tension pneumothorax pushes away from affected side' },

  { id: 'resp_palp_expansion', label: 'Chest expansion (palpation)', shortLabel: 'Expansion', phase: 'palpation', type: 'select', options: ['normal', 'reduced_left', 'reduced_right', 'reduced_bilateral'], mandatory: true, clinicalGuide: 'Palpate expansion anteriorly and posteriorly; measure in cm if possible', observation: 'Thumbs at T10 spinous process, ask patient to breathe deeply', description: 'Measure expansion in cm', measurement: true, unit: 'cm', interpretation: '<2 cm suggests restriction; unilateral suggests ipsilateral pathology' },

  { id: 'resp_palp_tactile_vocal_fremitus', label: 'Tactile vocal fremitus', shortLabel: 'Fremitus', phase: 'palpation', type: 'select', options: ['normal', 'increased', 'decreased', 'absent'], mandatory: true, clinicalGuide: 'Place ulnar edge of hand on chest; ask patient to say "99"', observation: 'Palpable vibration transmitted through chest wall', description: 'Compare side to side; note increase or decrease', interpretation: 'Increased in consolidation; decreased in effusion, pneumothorax, COPD' },

  { id: 'resp_palp_tenderness', label: 'Chest wall tenderness', shortLabel: 'Tenderness', phase: 'palpation', type: 'boolean', mandatory: false, clinicalGuide: 'Palpate ribs, intercostal spaces, and muscles for tenderness', observation: 'Pain elicited on palpation of chest wall', description: 'Localized or generalized', interpretation: 'Localized tenderness suggests costochondritis, rib fracture, or pleurisy', isAbnormalOnly: true },

  { id: 'resp_palp_apex_beat', label: 'Apex beat location', shortLabel: 'Apex', phase: 'palpation', type: 'select', options: ['normal', 'displaced', 'not_palpable', 'thrusting'], mandatory: false, clinicalGuide: 'Locate apex beat with fingertips; start at anterior axillary line and move medially', observation: 'Location and character of the apex beat', description: 'Note intercostal space and distance from midline', measurement: true, unit: 'cm', interpretation: 'Displaced apex suggests cardiomegaly or mediastinal shift; thrusting suggests LVH' },

  // ═════════════════════════════════════════════════════════════════════════
  // PERCUSSION
  // ═════════════════════════════════════════════════════════════════════════

  { id: 'resp_perc_note', label: 'Percussion note', shortLabel: 'Note', phase: 'percussion', type: 'select', options: ['resonant', 'dull', 'stony_dull', 'hyperresonant', 'tympanitic'], mandatory: true, clinicalGuide: 'Percuss systematically from apex to base, comparing sides at same levels', observation: 'Quality of the percussion note', description: 'Describe note character and location of abnormality', interpretation: 'Dull = consolidation/effusion; stony dull = large effusion; hyperresonant = COPD/pneumothorax; tympanitic = pneumothorax' },

  { id: 'resp_perc_liver_dullness', label: 'Liver dullness', shortLabel: 'Liver dull.', phase: 'percussion', type: 'select', options: ['normal', 'reduced', 'absent', 'increased'], mandatory: false, clinicalGuide: 'Percuss from chest down to abdomen; note change from resonant to dull', observation: 'Upper border of liver dullness in right mid-clavicular line', description: 'Compare with normal (5th-7th intercostal space)', interpretation: 'Loss of liver dullness suggests hyperinflation (COPD) or pneumothorax' },

  { id: 'resp_perc_cardiac_dullness', label: 'Cardiac dullness', shortLabel: 'Cardiac dull.', phase: 'percussion', type: 'select', options: ['normal', 'increased', 'decreased'], mandatory: false, clinicalGuide: 'Percuss over left anterior chest for cardiac dullness borders', observation: 'Area of cardiac dullness', description: 'Note increased or decreased area', interpretation: 'Increased in cardiomegaly; decreased in COPD' },

  { id: 'resp_perc_diaphragm', label: 'Diaphragm excursion', shortLabel: 'Diaphragm', phase: 'percussion', type: 'number', mandatory: false, clinicalGuide: 'Percuss for diaphragm level at full expiration vs full inspiration', observation: 'Range of diaphragm movement from full expiration to full inspiration', measurement: true, unit: 'cm', interpretation: 'Normal 3-5 cm; reduced in COPD, effusion, phrenic nerve palsy' },

  // ═════════════════════════════════════════════════════════════════════════
  // AUSCULTATION
  // ═════════════════════════════════════════════════════════════════════════

  { id: 'resp_ausc_breath_sounds', label: 'Breath sounds', shortLabel: 'Breath sounds', phase: 'auscultation', type: 'select', options: ['vesicular', 'bronchial', 'bronchovesicular', 'reduced', 'absent'], mandatory: true, clinicalGuide: 'Listen with diaphragm of stethoscope; compare side to side at same levels', observation: 'Quality and intensity of breath sounds', description: 'Describe character, intensity, and location of abnormality', interpretation: 'Bronchial = consolidation; reduced/absent = effusion, pneumothorax, COPD', activatesFields: ['resp_ausc_breath_sounds_location'] },

  { id: 'resp_ausc_breath_sounds_location', label: 'Breath sounds — location', shortLabel: 'Location', phase: 'auscultation', type: 'multiselect', options: ['apex_left', 'apex_right', 'midzone_left', 'midzone_right', 'base_left', 'base_right', 'diffuse'], mandatory: false, clinicalGuide: 'Document specific zones where breath sounds are abnormal', observation: 'Location of abnormal breath sounds', description: 'Map which zones are affected', interpretation: 'Location helps localize pathology', isAbnormalOnly: true },

  { id: 'resp_ausc_added_sounds', label: 'Added (adventitious) sounds', shortLabel: 'Added sounds', phase: 'auscultation', type: 'multiselect', options: ['wheezes', 'crackles', 'pleural_rub', 'stridor', 'rhonchi'], mandatory: false, clinicalGuide: 'Listen throughout respiratory cycle; note timing (inspiratory/expiratory)', observation: 'Abnormal sounds superimposed on breath sounds', description: 'Classify type, timing, location, and intensity', interpretation: 'Wheezes = airway narrowing; crackles = fluid/secretions in airways; rub = pleural inflammation', activatesFields: ['resp_ausc_crackles_type'] },

  { id: 'resp_ausc_crackles_type', label: 'Crackles — type', shortLabel: 'Crackles', phase: 'auscultation', type: 'select', options: ['fine', 'coarse', 'crepitations'], mandatory: false, clinicalGuide: 'Fine crackles = high-pitched, end-inspiratory; coarse = lower-pitched, early-mid inspiratory', observation: 'Character of crackles', description: 'Fine / Coarse / Crepitations', interpretation: 'Fine = pulmonary fibrosis, left ventricular failure; coarse = bronchiectasis, pneumonia' },

  { id: 'resp_ausc_wheezes', label: 'Wheezes', shortLabel: 'Wheezes', phase: 'auscultation', type: 'select', options: ['absent', 'expiratory', 'inspiratory_expiratory', 'monophonic', 'polyphonic'], mandatory: false, clinicalGuide: 'High-pitched musical sounds; expiratory suggests bronchospasm', observation: 'Musical sounds during expiration or inspiration', description: 'Timing and character (monophonic vs polyphonic)', interpretation: 'Monophonic = single airway obstruction; polyphonic = diffuse airway narrowing (asthma, COPD)' },

  { id: 'resp_ausc_pleural_rub', label: 'Pleural rub', shortLabel: 'Rub', phase: 'auscultation', type: 'boolean', mandatory: false, clinicalGuide: 'Creaking, grating sound; heard in both inspiration and expiration', observation: 'Creaking sound like walking on dry snow', description: 'Location where rub is heard best', interpretation: 'Indicates inflamed pleural surfaces — pleurisy, PE, connective tissue disease' },

  { id: 'resp_ausc_voice_sounds', label: 'Voice sounds (vocal resonance)', shortLabel: 'Vocal res.', phase: 'auscultation', type: 'select', options: ['normal', 'increased', 'decreased', 'aegophony', 'whispering_pectoriloquy'], mandatory: false, clinicalGuide: 'Ask patient to say "99" while listening with stethoscope; then whisper "1-2-3"', observation: 'Transmitted voice sounds through chest wall', description: 'Increased, decreased, or altered quality', interpretation: 'Increased (bronchophony) = consolidation; aegophony (E-to-A change) = early consolidation; whispering pectoriloquy = above effusion' },

  // ═════════════════════════════════════════════════════════════════════════
  // SPECIAL TESTS
  // ═════════════════════════════════════════════════════════════════════════

  { id: 'resp_spec_peak_flow', label: 'Peak expiratory flow rate', shortLabel: 'PEFR', phase: 'special_tests', type: 'number', mandatory: false, clinicalGuide: 'Use peak flow meter; patient takes deep breath and blows as hard as possible', observation: 'Maximum speed of expiration', measurement: true, unit: 'L/min', interpretation: 'Compare with predicted for age, sex, height; <80% suggests obstruction' },

  { id: 'resp_spec_pulse_ox', label: 'Pulse oximetry with exercise', shortLabel: 'SpO₂ exercise', phase: 'special_tests', type: 'number', mandatory: false, clinicalGuide: 'Measure SpO₂ at rest and after walking for 1 minute', observation: 'Oxygen saturation response to exercise', measurement: true, unit: '%', interpretation: 'Desaturation ≥4% or to <90% suggests significant lung disease' },

  { id: 'resp_spec_cough_test', label: 'Cough test', shortLabel: 'Cough', phase: 'special_tests', type: 'select', options: ['strong', 'weak', 'absent'], mandatory: false, clinicalGuide: 'Ask patient to cough forcefully; assess effectiveness', observation: 'Strength and effectiveness of cough', description: 'Strong, weak, or absent', interpretation: 'Weak cough suggests neuromuscular weakness, post-op risk' },

  { id: 'resp_spec_lymph_nodes', label: 'Scalene/supraclavicular nodes', shortLabel: 'Scalene nodes', phase: 'special_tests', type: 'boolean', mandatory: false, clinicalGuide: 'Palpate supraclavicular fossae for lymphadenopathy (Virchow node)', observation: 'Palpable lymph nodes in supraclavicular region', description: 'Size, consistency, mobility', interpretation: 'Enlarged left supraclavicular node (Virchow) suggests thoracic/abdominal malignancy' },

  { id: 'resp_spec_chest_expansion_cm', label: 'Chest expansion (cm)', shortLabel: 'Exp. (cm)', phase: 'special_tests', type: 'number', mandatory: false, clinicalGuide: 'Measure with tape measure at nipple line in men, below breasts in women', observation: 'Difference between full expiration and full inspiration measured in cm', measurement: true, unit: 'cm', interpretation: 'Normal >4 cm; <2 cm indicates significant restriction' },
];

// ── Phase-level groupings ──────────────────────────────────────────────────────

export const RESPIRATORY_INSPECTION = RESPIRATORY_FIELDS.filter(f => f.phase === 'inspection');
export const RESPIRATORY_PALPATION = RESPIRATORY_FIELDS.filter(f => f.phase === 'palpation');
export const RESPIRATORY_PERCUSSION = RESPIRATORY_FIELDS.filter(f => f.phase === 'percussion');
export const RESPIRATORY_AUSCULTATION = RESPIRATORY_FIELDS.filter(f => f.phase === 'auscultation');
export const RESPIRATORY_SPECIAL_TESTS = RESPIRATORY_FIELDS.filter(f => f.phase === 'special_tests');
