// ── LOCAL EXAMINATION REGISTRY (Surgery / Orthopedics) ──
// For swellings, ulcers, wounds, masses, deformities, fractures, burns, etc.

import type { LocalExamType, LocalExaminationEntry } from '../types';

export interface LocalExamTemplate {
  type: LocalExamType;
  label: string;
  fields: { key: string; label: string; options?: string[]; placeholder?: string }[];
  relevantFor: string[]; // diseaseIds
}

export const LOCAL_EXAM_TEMPLATES: LocalExamTemplate[] = [
  // ── SWELLING ──
  {
    type: 'swelling',
    label: 'Swelling Examination',
    relevantFor: ['abscess', 'hernia', 'lipoma', 'lymphadenopathy', 'goiter', 'cyst', 'tumor', 'hidradenitis'],
    fields: [
      { key: 'site', label: 'Anatomical site', placeholder: 'e.g. Right inguinal region' },
      { key: 'size', label: 'Size (cm)', placeholder: 'e.g. 5 x 4 cm' },
      { key: 'shape', label: 'Shape', options: ['Round', 'Oval', 'Irregular', 'Lobulated', 'Diffuse'] },
      { key: 'surface', label: 'Surface', options: ['Smooth', 'Nodular', 'Irregular', 'Lobulated'] },
      { key: 'edge', label: 'Edge / Margin', options: ['Well-defined', 'Ill-defined', 'Regular', 'Irregular'] },
      { key: 'consistency', label: 'Consistency', options: ['Soft', 'Firm', 'Hard', 'Cystic', 'Fluctuant', 'Doughy'] },
      { key: 'tenderness', label: 'Tenderness', options: ['Present', 'Absent'] },
      { key: 'temperature', label: 'Temperature', options: ['Normal', 'Warm', 'Hot'] },
      { key: 'fluctuant', label: 'Fluctuant', options: ['Yes', 'No'] },
      { key: 'transilluminable', label: 'Transilluminable', options: ['Yes', 'No'] },
      { key: 'reducible', label: 'Reducible', options: ['Yes', 'No', 'Partially'] },
      { key: 'pulsatile', label: 'Pulsatile', options: ['Yes', 'No'] },
      { key: 'compressible', label: 'Compressible', options: ['Yes', 'No'] },
      { key: 'fixity', label: 'Fixity to underlying structures', options: ['Mobile', 'Fixed to skin', 'Fixed to deep fascia', 'Fixed to muscle', 'Fixed to bone'] },
      { key: 'overlying_skin', label: 'Overlying skin', placeholder: 'Normal, erythematous, ulcerated, sinuses, dilated veins' },
      { key: 'lymph_nodes', label: 'Regional lymph nodes', placeholder: 'Palpable or not; size, consistency, fixity' },
      { key: 'special_tests', label: 'Special tests', placeholder: 'Cough impulse (hernia), fluctuation test, transillumination' },
    ],
  },

  // ── ULCER ──
  {
    type: 'ulcer',
    label: 'Ulcer Examination',
    relevantFor: ['chronic_ulcer', 'venous_ulcer', 'arterial_ulcer', 'diabetic_ulcer', 'pressure_sore', 'malignant_ulcer', 'buruli_ulcer', 'tropical_ulcer'],
    fields: [
      { key: 'site', label: 'Anatomical site', placeholder: 'e.g. Medial malleolus, left leg' },
      { key: 'size', label: 'Size (cm)', placeholder: 'e.g. 3 x 2 cm' },
      { key: 'shape', label: 'Shape', options: ['Round', 'Oval', 'Irregular', 'Linear', 'Geographic'] },
      { key: 'edge', label: 'Edge type', options: ['Sloping (healing)', 'Punched out (arterial/neuropathic)', 'Undermined (TB/pyogenic)', 'Rolled (BCC)', 'Everted (SCC)'] },
      { key: 'base', label: 'Base', placeholder: 'Clean, sloughy, necrotic, granular, bleeding' },
      { key: 'floor', label: 'Floor', placeholder: 'Muscle, tendon, bone, fascia, granulation tissue' },
      { key: 'discharge', label: 'Discharge', options: ['None', 'Serous', 'Serosanguinous', 'Purulent', 'Bloody', 'Foul-smelling'] },
      { key: 'depth', label: 'Depth', options: ['Superficial (epidermis/dermis)', 'Deep (subcutaneous)', 'Deep to fascia', 'Involving bone'] },
      { key: 'surrounding_skin', label: 'Surrounding skin', placeholder: 'Normal, erythematous, indurated, eczematous, hyperpigmented, cellulitic' },
      { key: 'tenderness', label: 'Tenderness', options: ['Present', 'Absent'] },
      { key: 'bleeding', label: 'Bleeding on touch', options: ['Yes', 'No'] },
      { key: 'lymph_nodes', label: 'Regional lymph nodes', placeholder: 'Palpable or not; size, consistency, matting' },
      { key: 'vascular_status', label: 'Vascular status', placeholder: 'Peripheral pulses, capillary refill, ankle-brachial index if available' },
      { key: 'neurological_status', label: 'Neurological status', placeholder: 'Sensation to pinprick/light touch around ulcer (important for diabetic/neuropathic)' },
    ],
  },

  // ── WOUND ──
  {
    type: 'wound',
    label: 'Wound Examination',
    relevantFor: ['trauma', 'laceration', 'surgical_wound', 'degloving', 'crush_injury'],
    fields: [
      { key: 'site', label: 'Anatomical site', placeholder: 'e.g. Left forearm volar aspect' },
      { key: 'size', label: 'Size (cm)', placeholder: 'e.g. 8 x 3 cm' },
      { key: 'type', label: 'Wound type', options: ['Incised', 'Lacerated', 'Crush', 'Abrasion', 'Puncture', 'Degloving', 'Avulsion', 'Burn'] },
      { key: 'depth', label: 'Depth', options: ['Superficial', 'Deep to subcutaneous', 'Deep to fascia', 'Involving muscle', 'Involving bone/joint'] },
      { key: 'edge', label: 'Edge', placeholder: 'Sharp, ragged, confused, viable, necrotic' },
      { key: 'bleeding', label: 'Bleeding activity', options: ['None', 'Oozing', 'Active bleeding', 'Pulsatile bleeding'] },
      { key: 'contamination', label: 'Contamination', options: ['Clean', 'Minimally contaminated', 'Contaminated', 'Foreign body present', 'Infected'] },
      { key: 'neurovascular', label: 'Distal neurovascular status', placeholder: 'Pulses, sensation, motor function distal to wound' },
      { key: 'tendon_nerve', label: 'Tendon/nerve involvement', placeholder: 'Specific tendon or nerve function test results' },
    ],
  },

  // ── FRACTURE/DEFORMITY ──
  {
    type: 'fracture',
    label: 'Fracture / Deformity Examination',
    relevantFor: ['fracture', 'dislocation', 'deformity', 'non_union', 'malunion'],
    fields: [
      { key: 'bone', label: 'Bone / Joint involved', placeholder: 'e.g. Right distal radius' },
      { key: 'deformity', label: 'Deformity type', options: ['None', 'Angulation', 'Rotation', 'Shortening', 'Swelling', 'Dislocation'] },
      { key: 'swelling', label: 'Local swelling', options: ['Mild', 'Moderate', 'Severe', 'None'] },
      { key: 'tenderness', label: 'Tenderness', options: ['Present', 'Absent'] },
      { key: 'crepitus', label: 'Crepitus', options: ['Present', 'Absent'] },
      { key: 'movement', label: 'Abnormal movement', options: ['None', 'Present'] },
      { key: 'neurovascular_distal', label: 'Distal neurovascular status', placeholder: 'Radial pulse, capillary refill, median/ulnar/radial nerve function' },
      { key: 'skin_status', label: 'Skin status', options: ['Intact (closed)', 'Open grade I', 'Open grade II', 'Open grade IIIa', 'Open grade IIIb', 'Open grade IIIc'] },
      { key: 'compartment', label: 'Compartment syndrome signs', options: ['Not present', 'Pain on passive stretch', 'Tense compartment', 'Paresthesia', 'Paresis', 'Pulselessness'] },
    ],
  },

  // ── BURN ──
  {
    type: 'burn',
    label: 'Burn Examination',
    relevantFor: ['burn_injury', 'chemical_burn', 'electrical_burn'],
    fields: [
      { key: 'site', label: 'Anatomical sites involved', placeholder: 'Face, trunk, upper limbs, lower limbs, perineum' },
      { key: 'tbsa', label: 'Total Body Surface Area (%)', placeholder: 'Using Wallace rule of 9s or Lund-Browder chart' },
      { key: 'depth', label: 'Depth', options: ['Superficial (1st degree)', 'Partial thickness (2nd degree)', 'Full thickness (3rd degree)', '4th degree (deep to bone)'] },
      { key: 'appearance', label: 'Appearance', placeholder: 'Erythema, blisters, charred, white/leathery' },
      { key: 'capillary_refill', label: 'Capillary refill', options: ['Brisk', 'Slow', 'Absent'] },
      { key: 'sensation', label: 'Sensation to pinprick', options: ['Intact', 'Reduced', 'Absent'] },
      { key: 'airway', label: 'Airway involvement', options: ['No', 'Suspected (facial burns, hoarse voice, stridor)', 'Confirmed'] },
      { key: 'inhalation', label: 'Inhalation injury signs', options: ['None', 'Carbonaceous sputum', 'Hoarseness', 'Stridor', 'Respiratory distress'] },
      { key: 'circumferential', label: 'Circumferential involvement', options: ['No', 'Yes (chest)', 'Yes (limb)', 'Yes (neck)'] },
    ],
  },

  // ── MASS (deep/organ) ──
  {
    type: 'mass',
    label: 'Mass / Tumor Examination',
    relevantFor: ['tumor', 'malignancy', 'lymphoma', 'sarcoma', 'carcinoma_breast', 'thyroid_mass'],
    fields: [
      { key: 'site', label: 'Anatomical site', placeholder: 'e.g. Left breast upper outer quadrant' },
      { key: 'size', label: 'Size (cm)', placeholder: 'e.g. 3 x 2.5 cm' },
      { key: 'shape', label: 'Shape', options: ['Round', 'Oval', 'Irregular', 'Lobulated'] },
      { key: 'consistency', label: 'Consistency', options: ['Soft', 'Firm', 'Hard', 'Cystic', 'Rubbery'] },
      { key: 'fixity', label: 'Fixity', options: ['Mobile', 'Fixed to skin', 'Fixed to deep structures', 'Fixed to underlying muscle'] },
      { key: 'skin_changes', label: 'Overlying skin changes', placeholder: 'Peau d\'orange, dimpling, ulceration, dilated veins, erythema' },
      { key: 'tenderness', label: 'Tenderness', options: ['Present', 'Absent'] },
      { key: 'lymph_nodes', label: 'Regional lymph nodes', placeholder: 'Level I-III (axilla), supraclavicular, cervical' },
      { key: 'surface', label: 'Surface', options: ['Smooth', 'Nodular', 'Irregular', 'Lobulated'] },
    ],
  },

  // ── SINUS ──
  {
    type: 'sinus',
    label: 'Sinus Examination',
    relevantFor: ['chronic_osteomyelitis', 'tb_sinus', 'pilonidal_sinus', 'branchial_sinus'],
    fields: [
      { key: 'site', label: 'Anatomical site', placeholder: 'e.g. Left gluteal region' },
      { key: 'opening', label: 'External opening', placeholder: 'Size, shape, surrounding skin' },
      { key: 'discharge', label: 'Discharge', options: ['None', 'Serous', 'Purulent', 'Blood-stained', 'Fecal'] },
      { key: 'probe', label: 'Probe direction/depth', placeholder: 'Direction of tract, depth, communication with bone' },
      { key: 'surrounding', label: 'Surrounding skin', placeholder: 'Induration, erythema, scarring, multiple openings' },
    ],
  },

  // ── FISTULA ──
  {
    type: 'fistula',
    label: 'Fistula Examination',
    relevantFor: ['anal_fistula', 'entercutaneous_fistula', 'tracheoesophageal_fistula'],
    fields: [
      { key: 'site', label: 'Location', placeholder: 'e.g. Perianal at 6 o\'clock' },
      { key: 'external_opening', label: 'External opening', placeholder: 'Number, position, relation to anal verge (Goodsall rule)' },
      { key: 'internal_opening', label: 'Internal opening', placeholder: 'Palpable on DRE or visible on proctoscopy' },
      { key: 'discharge', label: 'Discharge', options: ['None', 'Serous', 'Purulent', 'Fecal', 'Blood-stained'] },
      { key: 'induration', label: 'Induration along tract', options: ['Present', 'Absent'] },
      { key: 'multiple', label: 'Multiple openings', options: ['No', 'Yes'] },
      { key: 'type', label: 'Fistula type (Goodsall)', options: ['Intersphincteric', 'Transsphincteric', 'Suprasphincteric', 'Extrasphincteric'] },
    ],
  },

  // ── ABSCESS ──
  {
    type: 'abscess',
    label: 'Abscess Examination',
    relevantFor: ['abscess', 'pyomyositis', 'peritonsillar_abscess', 'psoas_abscess', 'subphrenic_abscess'],
    fields: [
      { key: 'site', label: 'Anatomical site', placeholder: 'e.g. Right axilla' },
      { key: 'size', label: 'Size (cm)', placeholder: 'e.g. 6 x 5 cm' },
      { key: 'swelling', label: 'Swelling characteristics', placeholder: 'Tense, erythematous, warm, tender' },
      { key: 'fluctuance', label: 'Fluctuance', options: ['Present', 'Absent'] },
      { key: 'overlying_skin', label: 'Overlying skin', placeholder: 'Erythematous, shiny, pointing, impending rupture' },
      { key: 'tenderness', label: 'Tenderness', placeholder: 'Severe, mild, none' },
      { key: 'temperature', label: 'Local temperature', options: ['Normal', 'Warm', 'Hot'] },
      { key: 'lymph_nodes', label: 'Regional lymph nodes', placeholder: 'Enlarged, tender, matted' },
      { key: 'systemic_signs', label: 'Systemic signs', placeholder: 'Fever, tachycardia, hypotension (if septic)' },
    ],
  },
];

export function getLocalExamTemplatesForDisease(diseaseIds: string[]): LocalExamTemplate[] {
  const relevant = new Set<string>();
  for (const did of diseaseIds) {
    for (const template of LOCAL_EXAM_TEMPLATES) {
      if (template.relevantFor.includes(did)) relevant.add(template.type);
    }
  }
  return LOCAL_EXAM_TEMPLATES.filter(t => relevant.has(t.type));
}

export function createDefaultLocalEntry(template: LocalExamTemplate, anatomicalSite: string): LocalExaminationEntry {
  const findings: Record<string, string> = {};
  for (const field of template.fields) {
    findings[field.key] = '';
  }
  return {
    id: `local_${template.type}_${Date.now()}`,
    type: template.type,
    anatomicalSite,
    label: template.label,
    findings,
    description: '',
    interpretation: '',
  };
}
