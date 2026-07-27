// ---------------------------------------------------------------
// AMEXAN Universal Examination Object (UEO) Engine
// Constitutional Volume — all object definitions + engine logic
// ---------------------------------------------------------------

import {
  type UEOCardDef,
  type UEOGroupDef,
  type UEOActivationRule,
  type UEOEvidenceNode,
  type UEOObject,
  type UEOIdentifiers,
  type UEOMeasurement,
  type UEOPhotograph,
  type UEOType,
  type UEOContext,
} from './ueo-types';
export type { UEOCardDef, UEOGroupDef, UEOObject, UEOMeasurement, UEOType, UEOActivationRule, UEOEvidenceNode, UEOPhotograph };

// -----------------------------------------------------------------
// ACTIVATION RULES — cross-cutting, trigger from any system
// -----------------------------------------------------------------

export const UEO_ACTIVATION_RULES: UEOActivationRule[] = [
  { triggerCardIds: ['ge_skin_lesion'], triggerValues: ['mass', 'lump', 'swelling', 'nodule'], ueoType: 'mass', ueoLabel: 'Mass / Swelling', priority: 1 },
  { triggerCardIds: ['ge_skin_lesion'], triggerValues: ['ulcer', 'erosion', 'sore'], ueoType: 'ulcer', ueoLabel: 'Ulcer', priority: 1 },
  { triggerCardIds: ['ge_skin_lesion'], triggerValues: ['rash', 'spots', 'eruption', 'lesion'], ueoType: 'rash', ueoLabel: 'Rash / Skin Lesion', priority: 1 },
  { triggerCardIds: ['ge_skin_lesion'], triggerValues: ['scar'], ueoType: 'scar', ueoLabel: 'Scar', priority: 2 },
  { triggerCardIds: ['ge_skin_lesion'], triggerValues: ['burn'], ueoType: 'burn', ueoLabel: 'Burn', priority: 2 },
  { triggerCardIds: ['abd_mass', 'cvs_mass', 'resp_mass'], triggerValues: ['present'], ueoType: 'mass', ueoLabel: 'Abdominal / Truncal Mass', priority: 1 },
  { triggerCardIds: ['abd_hernia', 'ge_hernia'], triggerValues: ['present'], ueoType: 'hernia', ueoLabel: 'Hernia', priority: 1 },
  { triggerCardIds: ['ge_wound', 'surg_wound', 'trauma_wound'], triggerValues: ['present'], ueoType: 'wound', ueoLabel: 'Wound', priority: 1 },
  { triggerCardIds: ['ge_discharge', 'ent_discharge', 'wound_discharge'], triggerValues: ['present'], ueoType: 'discharge', ueoLabel: 'Discharge', priority: 1 },
  { triggerCardIds: ['ge_stoma'], triggerValues: ['present'], ueoType: 'stoma', ueoLabel: 'Stoma', priority: 1 },
  { triggerCardIds: ['ge_lymph_nodes', 'ln_abnormal'], triggerValues: ['enlarged', 'palpable'], ueoType: 'lymph_node', ueoLabel: 'Lymphadenopathy', priority: 1 },
  { triggerCardIds: ['ge_drain', 'surg_drain'], triggerValues: ['present'], ueoType: 'drain', ueoLabel: 'Surgical Drain', priority: 2 },
  { triggerCardIds: ['ge_catheter'], triggerValues: ['present'], ueoType: 'catheter', ueoLabel: 'Catheter / Tube', priority: 2 },
  { triggerCardIds: ['ge_edema', 'cvs_peripheral_edema'], triggerValues: ['present', 'pitting_mild', 'pitting_moderate', 'pitting_severe'], ueoType: 'edema', ueoLabel: 'Edema', priority: 2 },
  { triggerCardIds: ['ge_skin_graft', 'surg_graft'], triggerValues: ['present'], ueoType: 'skin_graft', ueoLabel: 'Skin Graft', priority: 2 },
  { triggerCardIds: ['ge_flap', 'surg_flap'], triggerValues: ['present'], ueoType: 'flap', ueoLabel: 'Surgical Flap', priority: 2 },
  { triggerCardIds: ['ge_sinus'], triggerValues: ['present'], ueoType: 'sinus', ueoLabel: 'Sinus', priority: 2 },
  { triggerCardIds: ['ge_fistula'], triggerValues: ['present'], ueoType: 'fistula', ueoLabel: 'Fistula', priority: 2 },
];
// -----------------------------------------------------------------
// UEO: MASS / SWELLING
// -----------------------------------------------------------------

const MASS_CARDS: UEOCardDef[] = [
  { id: 'ueo_mass_site', group: 'identification', cardNumber: 1, label: 'Site', question: 'Anatomical site of mass', type: 'text', options: [], documentationTemplate: 'Located at {value}.', visibility: { alwaysShow: true }, evidenceLinks: [] },
  { id: 'ueo_mass_side', group: 'identification', cardNumber: 2, label: 'Side', question: 'Which side?', type: 'single_select', options: [
    { value: 'midline', label: 'Midline', documentationPhrase: 'midline' },
    { value: 'left', label: 'Left', documentationPhrase: 'left-sided' },
    { value: 'right', label: 'Right', documentationPhrase: 'right-sided' },
    { value: 'bilateral', label: 'Bilateral', documentationPhrase: 'bilateral' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [] },
  { id: 'ueo_mass_number', group: 'identification', cardNumber: 3, label: 'Number', question: 'Number of masses', type: 'single_select', options: [
    { value: 'solitary', label: 'Solitary (single)', documentationPhrase: 'solitary' },
    { value: 'two', label: 'Two', documentationPhrase: 'two' },
    { value: 'multiple', label: 'Multiple', documentationPhrase: 'multiple' },
    { value: 'diffuse', label: 'Diffuse', documentationPhrase: 'diffuse' },
  ], documentationTemplate: 'There is a {value} mass.', visibility: { alwaysShow: true }, evidenceLinks: [
    { supportsDisease: ['lipoma', 'sebaceous_cyst', 'abscess', 'lymphoma'], weight: 0.2, documentationPhrase: 'number of masses' },
  ]},
  { id: 'ueo_mass_size', group: 'measurement', cardNumber: 4, label: 'Size', question: 'Length \u00d7 Width \u00d7 Height (cm)', type: 'text', options: [], documentationTemplate: 'measuring {value} cm.', visibility: { alwaysShow: true }, evidenceLinks: [] },
  { id: 'ueo_mass_shape', group: 'character', cardNumber: 5, label: 'Shape', question: 'Shape of the mass', type: 'single_select', options: [
    { value: 'round', label: 'Round', documentationPhrase: 'round' },
    { value: 'oval', label: 'Oval', documentationPhrase: 'oval' },
    { value: 'lobulated', label: 'Lobulated', documentationPhrase: 'lobulated' },
    { value: 'irregular', label: 'Irregular', documentationPhrase: 'irregular' },
    { value: 'diffuse', label: 'Diffuse / Poorly defined', documentationPhrase: 'diffuse' },
  ], documentationTemplate: '{value} in shape,', visibility: { alwaysShow: true }, evidenceLinks: [
    { supportsDisease: ['lipoma', 'cyst', 'malignancy'], weight: 0.3, documentationPhrase: 'shape of mass' },
  ]},
  { id: 'ueo_mass_surface', group: 'character', cardNumber: 6, label: 'Surface', question: 'Surface characteristics', type: 'single_select', options: [
    { value: 'smooth', label: 'Smooth', documentationPhrase: 'with a smooth surface' },
    { value: 'nodular', label: 'Nodular', documentationPhrase: 'with a nodular surface' },
    { value: 'bosselated', label: 'Bosselated', documentationPhrase: 'with a bosselated (knobby) surface' },
    { value: 'irregular', label: 'Irregular', documentationPhrase: 'with an irregular surface' },
    { value: 'papillary', label: 'Papillary', documentationPhrase: 'with a papillary surface' },
    { value: 'ulcerated', label: 'Ulcerated', documentationPhrase: 'with surface ulceration' },
  ], documentationTemplate: '{value}', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Malignancy', supportsDisease: ['malignancy', 'sarcoma'], weight: 0.4, documentationPhrase: 'irregular/nodular surface' },
  ]},
  { id: 'ueo_mass_edge', group: 'character', cardNumber: 7, label: 'Edge / Margin', question: 'Edge / margin definition', type: 'single_select', options: [
    { value: 'well_defined', label: 'Well-defined', documentationPhrase: 'well-defined margins' },
    { value: 'poorly_defined', label: 'Poorly defined', documentationPhrase: 'poorly defined margins' },
    { value: 'everted', label: 'Everted (rolled)', documentationPhrase: 'everted margins' },
    { value: 'undermined', label: 'Undermined', documentationPhrase: 'undermined edges' },
    { value: 'sloping', label: 'Sloping', documentationPhrase: 'sloping edges' },
  ], documentationTemplate: 'with {value},', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Malignancy', supportsDisease: ['malignancy'], weight: 0.5, documentationPhrase: 'poorly defined or everted margin' },
    { disease: 'Abscess', supportsDisease: ['abscess', 'infection'], weight: 0.3, documentationPhrase: 'poorly defined margin' },
  ]},
  { id: 'ueo_mass_consistency', group: 'character', cardNumber: 8, label: 'Consistency', question: 'Consistency on palpation', type: 'single_select', options: [
    { value: 'soft', label: 'Soft', documentationPhrase: 'soft in consistency' },
    { value: 'firm', label: 'Firm', documentationPhrase: 'firm in consistency' },
    { value: 'hard', label: 'Hard', documentationPhrase: 'hard in consistency' },
    { value: 'cystic', label: 'Cystic', documentationPhrase: 'cystic in consistency' },
    { value: 'rubbery', label: 'Rubbery', documentationPhrase: 'rubbery in consistency' },
    { value: 'fluctuant', label: 'Fluctuant', documentationPhrase: 'fluctuant' },
    { value: 'bony_hard', label: 'Bony hard', documentationPhrase: 'bony hard in consistency' },
    { value: 'pulsatile', label: 'Pulsatile', documentationPhrase: 'pulsatile in consistency' },
  ], documentationTemplate: '{value}', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Lipoma', supportsDisease: ['lipoma'], weight: 0.5, documentationPhrase: 'soft, rubbery mass' },
    { disease: 'Malignancy', supportsDisease: ['malignancy', 'sarcoma', 'carcinoma'], weight: 0.5, documentationPhrase: 'hard mass' },
    { disease: 'Aneurysm', supportsDisease: ['aneurysm'], weight: 0.6, documentationPhrase: 'pulsatile mass' },
    { disease: 'Cyst', supportsDisease: ['sebaceous_cyst', 'dermoid_cyst', 'abscess'], weight: 0.5, documentationPhrase: 'cystic/fluctuant mass' },
  ]},
  { id: 'ueo_mass_temperature', group: 'character', cardNumber: 9, label: 'Temperature', question: 'Skin temperature over mass', type: 'single_select', options: [
    { value: 'normal', label: 'Normal', documentationPhrase: 'with normal overlying temperature' },
    { value: 'warm', label: 'Warm', documentationPhrase: 'warm to touch suggesting inflammation' },
    { value: 'cold', label: 'Cold', documentationPhrase: 'cold to touch' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Infection', supportsDisease: ['abscess', 'infection', 'cellulitis'], weight: 0.5, documentationPhrase: 'warm mass suggesting inflammation' },
  ]},
  { id: 'ueo_mass_tenderness', group: 'character', cardNumber: 10, label: 'Tenderness', question: 'Tenderness on palpation', type: 'single_select', options: [
    { value: 'none', label: 'Non-tender', documentationPhrase: 'non-tender' },
    { value: 'mild', label: 'Mildly tender', documentationPhrase: 'mildly tender' },
    { value: 'moderate', label: 'Moderately tender', documentationPhrase: 'moderately tender' },
    { value: 'severe', label: 'Severely tender', documentationPhrase: 'severely tender' },
  ], documentationTemplate: 'The mass is {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Infection', supportsDisease: ['abscess', 'infection', 'cellulitis'], weight: 0.5, documentationPhrase: 'tender mass' },
    { disease: 'Malignancy', supportsDisease: ['malignancy', 'sarcoma'], weight: 0.2, documentationPhrase: 'non-tender mass' },
  ]},
  { id: 'ueo_mass_mobility', group: 'character', cardNumber: 11, label: 'Mobility', question: 'Mobility of the mass', type: 'single_select', options: [
    { value: 'free', label: 'Freely mobile', documentationPhrase: 'freely mobile' },
    { value: 'restricted', label: 'Restricted / Partially mobile', documentationPhrase: 'restricted mobility' },
    { value: 'fixed', label: 'Fixed to surrounding structures', documentationPhrase: 'fixed to surrounding structures' },
    { value: 'mobile_skin', label: 'Mobile over skin, fixed to deeper tissue', documentationPhrase: 'mobile over skin but fixed to deeper tissue' },
    { value: 'mobile_deep', label: 'Skin mobile over mass, mass mobile over deep', documentationPhrase: 'skin moves freely over the mass and the mass is mobile over deeper structures' },
  ], documentationTemplate: 'The mass is {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Malignancy', supportsDisease: ['malignancy', 'sarcoma'], weight: 0.6, documentationPhrase: 'fixed mass suggesting malignant infiltration' },
    { disease: 'Lipoma', supportsDisease: ['lipoma'], weight: 0.4, documentationPhrase: 'freely mobile mass' },
  ]},
  { id: 'ueo_mass_attachment', group: 'character', cardNumber: 12, label: 'Attachment', question: 'Plane of attachment', type: 'single_select', options: [
    { value: 'none', label: 'None / Mobile in all planes', documentationPhrase: 'not attached to any specific plane' },
    { value: 'skin', label: 'Attached to skin', documentationPhrase: 'attached to the skin' },
    { value: 'subcutaneous', label: 'Subcutaneous', documentationPhrase: 'in the subcutaneous plane' },
    { value: 'muscle', label: 'Attached to muscle', documentationPhrase: 'attached to underlying muscle' },
    { value: 'bone', label: 'Attached to bone', documentationPhrase: 'attached to underlying bone' },
    { value: 'organ', label: 'Intra-abdominal / Organ-based', documentationPhrase: 'intra-abdominal or organ-based' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_mass_transillumination', group: 'special', cardNumber: 13, label: 'Transillumination', question: 'Transilluminates? (cystic lesions, scrotal masses)', type: 'single_select', options: [
    { value: 'negative', label: 'Negative (does not transilluminate)', documentationPhrase: 'does not transilluminate' },
    { value: 'positive', label: 'Positive (transilluminates)', documentationPhrase: 'transilluminates suggesting a cystic lesion' },
    { value: 'not_done', label: 'Not applicable / Not tested', documentationPhrase: 'transillumination not tested' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Hydrocele', supportsDisease: ['hydrocele', 'cyst'], weight: 0.6, documentationPhrase: 'transilluminates' },
  ]},
  { id: 'ueo_mass_fluctuation', group: 'special', cardNumber: 14, label: 'Fluctuation', question: 'Fluctuation (fluid thrill — cross-fluctuation)', type: 'single_select', options: [
    { value: 'absent', label: 'Absent', documentationPhrase: 'no fluctuation detected' },
    { value: 'present', label: 'Present', documentationPhrase: 'fluctuation is present suggesting fluid content' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Abscess', supportsDisease: ['abscess', 'cyst'], weight: 0.5, documentationPhrase: 'fluctuant mass' },
  ]},
  { id: 'ueo_mass_compressibility', group: 'special', cardNumber: 15, label: 'Compressibility', question: 'Compressible?', type: 'single_select', options: [
    { value: 'absent', label: 'Not compressible', documentationPhrase: 'non-compressible' },
    { value: 'present', label: 'Compressible', documentationPhrase: 'compressible' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Lipoma', supportsDisease: ['lipoma', 'hemangioma'], weight: 0.3, documentationPhrase: 'compressible mass' },
  ]},
  { id: 'ueo_mass_pulsatility', group: 'special', cardNumber: 16, label: 'Pulsatility', question: 'Pulsatility of the mass', type: 'single_select', options: [
    { value: 'none', label: 'Non-pulsatile', documentationPhrase: 'non-pulsatile' },
    { value: 'transmitted', label: 'Transmitted (movement only)', documentationPhrase: 'transmitted pulsation' },
    { value: 'expansile', label: 'Expansile (expands in all directions)', documentationPhrase: 'expansile pulsation suggesting an aneurysm' },
  ], documentationTemplate: 'The mass is {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Aneurysm', supportsDisease: ['aneurysm', 'aa_aneurysm'], weight: 0.7, documentationPhrase: 'expansile pulsation' },
  ]},
  { id: 'ueo_mass_reducibility', group: 'special', cardNumber: 17, label: 'Reducibility', question: 'Reducible? (hernias, varices)', type: 'single_select', options: [
    { value: 'absent', label: 'Not reducible', documentationPhrase: 'not reducible' },
    { value: 'present', label: 'Reducible', documentationPhrase: 'reducible' },
  ], documentationTemplate: 'The mass is {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Hernia', supportsDisease: ['hernia', 'inguinal_hernia', 'umbilical_hernia'], weight: 0.6, documentationPhrase: 'reducible mass' },
  ]},
  { id: 'ueo_mass_cough_impulse', group: 'special', cardNumber: 18, label: 'Cough Impulse', question: 'Expansile cough impulse (hernias)', type: 'single_select', options: [
    { value: 'absent', label: 'Absent', documentationPhrase: 'no cough impulse' },
    { value: 'present', label: 'Present (expansile impulse on coughing)', documentationPhrase: 'expansile cough impulse is present' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Hernia', supportsDisease: ['hernia', 'inguinal_hernia'], weight: 0.7, documentationPhrase: 'expansile cough impulse' },
  ]},
  { id: 'ueo_mass_skin_changes', group: 'associated', cardNumber: 19, label: 'Overlying Skin Changes', question: 'Skin changes over the mass', type: 'multi_select', options: [
    { value: 'none', label: 'Normal skin', documentationPhrase: 'the overlying skin is normal' },
    { value: 'erythema', label: 'Erythema (redness)', documentationPhrase: 'overlying erythema' },
    { value: 'ulceration', label: 'Ulceration', documentationPhrase: 'overlying skin is ulcerated' },
    { value: 'pigmentation', label: 'Hyperpigmentation', documentationPhrase: 'overlying hyperpigmentation' },
    { value: 'sinus', label: 'Sinus / Discharging sinus', documentationPhrase: 'a discharging sinus is present' },
    { value: 'scar', label: 'Scar', documentationPhrase: 'a scar is present over the mass' },
    { value: 'hair_loss', label: 'Hair loss over lesion', documentationPhrase: 'hair loss is noted over the lesion' },
    { value: 'dilated_veins', label: 'Dilated veins', documentationPhrase: 'dilated veins over the mass' },
    { value: 'peau_dorange', label: 'Peau d\'orange (dimpling)', documentationPhrase: 'peau d\'orange skin changes are present' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Malignancy', supportsDisease: ['malignancy', 'breast_cancer'], weight: 0.6, documentationPhrase: 'peau d\'orange / skin dimpling' },
    { disease: 'Abscess', supportsDisease: ['abscess', 'infection'], weight: 0.4, documentationPhrase: 'erythema over mass' },
  ]},
  { id: 'ueo_mass_regional_nodes', group: 'associated', cardNumber: 20, label: 'Regional Lymph Nodes', question: 'Regional lymphadenopathy?', type: 'single_select', options: [
    { value: 'normal', label: 'Not enlarged', documentationPhrase: 'no regional lymphadenopathy appreciated' },
    { value: 'enlarged', label: 'Enlarged (see lymph node object)', documentationPhrase: 'regional lymphadenopathy is present' },
    { value: 'not_examined', label: 'Not examined', documentationPhrase: 'regional lymph nodes were not examined' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Infection', supportsDisease: ['infection', 'malignancy', 'lymphoma'], weight: 0.5, documentationPhrase: 'regional lymphadenopathy' },
  ]},
  { id: 'ueo_mass_neurovascular', group: 'associated', cardNumber: 21, label: 'Neurovascular Status', question: 'Distal neurovascular status', type: 'multi_select', options: [
    { value: 'intact', label: 'All intact', documentationPhrase: 'distal neurovascular status is intact' },
    { value: 'reduced_pulses', label: 'Reduced distal pulses', documentationPhrase: 'distal pulses are reduced' },
    { value: 'motor_deficit', label: 'Motor deficit distal', documentationPhrase: 'motor deficit is present distal to the mass' },
    { value: 'sensory_deficit', label: 'Sensory deficit distal', documentationPhrase: 'sensory deficit is present distal to the mass' },
    { value: 'cap_refill_delayed', label: 'Delayed capillary refill', documentationPhrase: 'capillary refill is delayed distal to the mass' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_mass_functional', group: 'associated', cardNumber: 22, label: 'Functional Effects', question: 'Functional impact of the mass', type: 'multi_select', options: [
    { value: 'none', label: 'No functional impact', documentationPhrase: 'no functional impact' },
    { value: 'pain', label: 'Pain', documentationPhrase: 'causing pain' },
    { value: 'movement_restriction', label: 'Restriction of movement', documentationPhrase: 'restricting movement' },
    { value: 'cosmetic', label: 'Cosmetic concern', documentationPhrase: 'cosmetic concern' },
    { value: 'pressure_symptoms', label: 'Pressure symptoms', documentationPhrase: 'causing pressure symptoms on surrounding structures' },
    { value: 'obstruction', label: 'Obstruction (luminal)', documentationPhrase: 'causing luminal obstruction' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
];

function massDocumentation(findings: Record<string, unknown>): string {
  const site = findings['ueo_mass_site'];
  const size = findings['ueo_mass_size'];
  const consistency = findings['ueo_mass_consistency'];
  const edge = findings['ueo_mass_edge'];
  const mobility = findings['ueo_mass_mobility'];
  const tenderness = findings['ueo_mass_tenderness'];
  const skin = findings['ueo_mass_skin_changes'];
  const nodes = findings['ueo_mass_regional_nodes'];
  const pulsatility = findings['ueo_mass_pulsatility'];
  const transillumination = findings['ueo_mass_transillumination'];
  const fluctuation = findings['ueo_mass_fluctuation'];
  const compressibility = findings['ueo_mass_compressibility'];
  const reducibility = findings['ueo_mass_reducibility'];
  const cough = findings['ueo_mass_cough_impulse'];
  const shape = findings['ueo_mass_shape'];
  const surface = findings['ueo_mass_surface'];
  const number = findings['ueo_mass_number'];

  const parts: string[] = [];
  const hasFindings = Object.values(findings).some(v => v != null && v !== '' && v !== false);

  if (!hasFindings) return '';

  const prefix = number && String(number) !== 'solitary' ? String(number) : 'A';
  const desc = [
    size ? `measuring ${size} cm` : '',
    shape ? String(shape) : '',
    consistency ? String(consistency) : '',
    edge ? `with ${edge} edge` : '',
  ].filter(Boolean).join(', ');

  const massType = findings['ueo_mass_type'] || '';
  if (site) {
    parts.push(`There is ${prefix.toLowerCase()} ${massType}mass present over the ${site}.`);
  } else {
    parts.push(`There is ${prefix.toLowerCase()} ${massType}mass.`);
  }

  if (mobility) {
    parts.push(`The mass is ${mobility}.`);
  }
  if (tenderness && String(tenderness) !== 'none') {
    parts.push(`It is ${tenderness} on palpation.`);
  }
  const skinVals = Array.isArray(skin) ? skin : (skin ? [skin] : []);
  if (skinVals.length > 0 && !skinVals.includes('none')) {
    parts.push(`The overlying skin shows ${skinVals.join(', ')}.`);
  }
  if (pulsatility && String(pulsatility) !== 'none') {
    parts.push(`${String(pulsatility).charAt(0).toUpperCase() + String(pulsatility).slice(1)} pulsation is noted.`);
  }
  if (transillumination === 'positive') {
    parts.push('The mass transilluminates suggesting cystic content.');
  }
  if (fluctuation === 'present') {
    parts.push('Fluctuation is present.');
  }
  if (compressibility === 'present') {
    parts.push('The mass is compressible.');
  }
  if (reducibility === 'present') {
    parts.push('The mass is reducible.');
  }
  if (cough === 'present') {
    parts.push('An expansile cough impulse is present.');
  }
  if (nodes && String(nodes) === 'enlarged') {
    parts.push('Regional lymphadenopathy is present.');
  }

  return parts.join(' ');
}

function massEvidenceGraph(findings: Record<string, unknown>): UEOEvidenceNode[] {
  const nodes: UEOEvidenceNode[] = [];
  const consistency = String(findings['ueo_mass_consistency'] || '');
  const edge = String(findings['ueo_mass_edge'] || '');
  if (consistency === 'hard') {
    nodes.push({
      finding: 'ueo_mass_consistency', findingLabel: 'Consistency (Hard)',
      mechanisms: ['Cellular proliferation', 'Fibrosis'],
      phenotypes: ['Solid mass', 'Firm/hard on palpation'],
      diseases: ['Malignancy', 'Sarcoma', 'Carcinoma'],
      investigations: ['Ultrasound', 'CT/MRI', 'Biopsy'],
      monitoring: ['Size on serial examination', 'Cross-sectional imaging'],
    });
  }
  if (edge === 'poorly_defined') {
    nodes.push({
      finding: 'ueo_mass_edge', findingLabel: 'Margin (Poorly Defined)',
      mechanisms: ['Infiltrative growth'],
      phenotypes: ['Poorly circumscribed mass'],
      diseases: ['Malignancy', 'Abscess', 'Infection'],
      investigations: ['Ultrasound', 'CT/MRI with contrast', 'Biopsy'],
      monitoring: ['Size', 'Response to treatment'],
    });
  }
  return nodes;
}
// -----------------------------------------------------------------
// UEO: ULCER
// -----------------------------------------------------------------

const ULCER_CARDS: UEOCardDef[] = [
  { id: 'ueo_ulcer_site', group: 'identification', cardNumber: 1, label: 'Site', question: 'Anatomical site of ulcer', type: 'text', options: [], documentationTemplate: 'Located at {value}.', visibility: { alwaysShow: true }, evidenceLinks: [] },
  { id: 'ueo_ulcer_number', group: 'identification', cardNumber: 2, label: 'Number', question: 'How many ulcers?', type: 'single_select', options: [
    { value: 'solitary', label: 'Solitary', documentationPhrase: 'solitary' },
    { value: 'multiple', label: 'Multiple', documentationPhrase: 'multiple' },
  ], documentationTemplate: '{value} ulcer.', visibility: { alwaysShow: true }, evidenceLinks: [] },
  { id: 'ueo_ulcer_size', group: 'measurement', cardNumber: 3, label: 'Size', question: 'Length x Width (cm)', type: 'text', options: [], documentationTemplate: 'measuring {value} cm.', visibility: { alwaysShow: true }, evidenceLinks: [] },
  { id: 'ueo_ulcer_shape', group: 'character', cardNumber: 4, label: 'Shape', question: 'Shape of the ulcer', type: 'single_select', options: [
    { value: 'round', label: 'Round', documentationPhrase: 'round' },
    { value: 'oval', label: 'Oval', documentationPhrase: 'oval' },
    { value: 'irregular', label: 'Irregular', documentationPhrase: 'irregular' },
    { value: 'linear', label: 'Linear', documentationPhrase: 'linear' },
    { value: 'serpiginous', label: 'Serpiginous (creeping)', documentationPhrase: 'serpiginous' },
  ], documentationTemplate: '{value} in shape,', visibility: { alwaysShow: true }, evidenceLinks: [] },
  { id: 'ueo_ulcer_edge', group: 'character', cardNumber: 5, label: 'Edge', question: 'Edge / margin of ulcer', type: 'single_select', options: [
    { value: 'well_defined', label: 'Well-defined', documentationPhrase: 'well-defined edges' },
    { value: 'sloping', label: 'Sloping', documentationPhrase: 'sloping edges' },
    { value: 'punched_out', label: 'Punched out', documentationPhrase: 'punched out edges' },
    { value: 'undermined', label: 'Undermined', documentationPhrase: 'undermined edges' },
    { value: 'rolled_everted', label: 'Rolled / Everted', documentationPhrase: 'rolled/everted edges' },
    { value: 'raised', label: 'Raised', documentationPhrase: 'raised edges' },
  ], documentationTemplate: 'with {value}', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Venous ulcer', supportsDisease: ['venous_ulcer'], weight: 0.5, documentationPhrase: 'sloping edges of venous ulcer' },
    { disease: 'Arterial ulcer', supportsDisease: ['arterial_ulcer'], weight: 0.5, documentationPhrase: 'punched out edges of arterial ulcer' },
    { disease: 'Malignancy', supportsDisease: ['malignancy', 'basal_cell_carcinoma', 'squamous_cell_carcinoma'], weight: 0.6, documentationPhrase: 'rolled/everted edges suggesting malignancy' },
    { disease: 'Diabetic ulcer', supportsDisease: ['diabetic_ulcer', 'neuropathic_ulcer'], weight: 0.4, documentationPhrase: 'punched out edge of neuropathic ulcer' },
  ]},
  { id: 'ueo_ulcer_floor', group: 'character', cardNumber: 6, label: 'Floor / Base', question: 'Floor or base of ulcer', type: 'single_select', options: [
    { value: 'granulating', label: 'Granulating (healthy red)', documentationPhrase: 'with a healthy granulating floor' },
    { value: 'sloughy', label: 'Sloughy (yellow/green)', documentationPhrase: 'with a sloughy floor' },
    { value: 'necrotic', label: 'Necrotic (black eschar)', documentationPhrase: 'with a necrotic (black eschar) floor' },
    { value: 'epithelialising', label: 'Epithelialising (pink)', documentationPhrase: 'epithelialising floor (pink)' },
    { value: 'bony', label: 'Bony / Tendon exposed', documentationPhrase: 'with exposed bone/tendon in the floor' },
    { value: 'fibrotic', label: 'Fibrotic (pale, avascular)', documentationPhrase: 'with a fibrotic pale floor' },
  ], documentationTemplate: '{value}', visibility: { alwaysShow: true }, evidenceLinks: [
    { phenotype: 'Healing wound', supportsDisease: ['venous_ulcer', 'surgical_wound'], weight: 0.3, documentationPhrase: 'granulating floor' },
    { phenotype: 'Non-healing / Infected', supportsDisease: ['infection', 'arterial_insufficiency'], weight: 0.4, documentationPhrase: 'sloughy/necrotic floor' },
  ]},
  { id: 'ueo_ulcer_base_induration', group: 'character', cardNumber: 7, label: 'Base Induration', question: 'Is the base indurated?', type: 'single_select', options: [
    { value: 'absent', label: 'Soft / Non-indurated', documentationPhrase: 'the base is soft and non-indurated' },
    { value: 'indurated', label: 'Indurated (firm/hard base)', documentationPhrase: 'the base is indurated suggesting malignant change' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Malignancy', supportsDisease: ['malignancy', 'squamous_cell_carcinoma'], weight: 0.7, documentationPhrase: 'indurated base' },
  ]},
  { id: 'ueo_ulcer_depth', group: 'measurement', cardNumber: 8, label: 'Depth', question: 'Depth / staging (1=superficial, 2=deep, 3=bone/joint)', type: 'single_select', options: [
    { value: '1', label: '1 — Superficial (epidermis/dermis)', documentationPhrase: 'superficial (depth 1)' },
    { value: '2', label: '2 — Deep (subcutaneous)', documentationPhrase: 'deep extending to subcutaneous (depth 2)' },
    { value: '3', label: '3 — Deep to bone/joint', documentationPhrase: 'deep to bone or joint (depth 3)' },
  ], documentationTemplate: 'Depth {value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_ulcer_surrounding_skin', group: 'associated', cardNumber: 9, label: 'Surrounding Skin', question: 'Surrounding skin condition', type: 'multi_select', options: [
    { value: 'normal', label: 'Normal', documentationPhrase: 'the surrounding skin is normal' },
    { value: 'erythema', label: 'Erythema / Cellulitis', documentationPhrase: 'surrounding erythema suggesting cellulitis' },
    { value: 'pigmentation', label: 'Hyperpigmentation (venous)', documentationPhrase: 'surrounding hyperpigmentation suggesting venous disease' },
    { value: 'eczema', label: 'Eczematous / Dermatitis', documentationPhrase: 'surrounding eczematous changes' },
    { value: 'oedema', label: 'Oedema', documentationPhrase: 'surrounding oedema' },
    { value: 'induration', label: 'Induration', documentationPhrase: 'surrounding induration' },
    { value: 'sclerosis', label: 'Lipodermatosclerosis', documentationPhrase: 'lipodermatosclerosis of the surrounding skin' },
    { value: 'atrophy_blanche', label: 'Atrophy blanche (white scars)', documentationPhrase: 'atrophy blanche (white atrophic scars) is present' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Venous ulcer', supportsDisease: ['venous_ulcer', 'cvi'], weight: 0.6, documentationPhrase: 'hyperpigmentation and lipodermatosclerosis suggesting venous disease' },
    { disease: 'Cellulitis', supportsDisease: ['cellulitis', 'infection'], weight: 0.5, documentationPhrase: 'surrounding erythema suggesting cellulitis' },
  ]},
  { id: 'ueo_ulcer_discharge', group: 'discharge', cardNumber: 10, label: 'Discharge', question: 'Type of discharge from ulcer', type: 'single_select', options: [
    { value: 'none', label: 'None / Dry', documentationPhrase: 'no discharge' },
    { value: 'serous', label: 'Serous (clear fluid)', documentationPhrase: 'serous discharge' },
    { value: 'purulent', label: 'Purulent (pus)', documentationPhrase: 'purulent discharge suggesting infection' },
    { value: 'serosanguinous', label: 'Serosanguinous (pink/watery)', documentationPhrase: 'serosanguinous discharge' },
    { value: 'bloody', label: 'Bloody / Frank bleeding', documentationPhrase: 'bloody discharge' },
    { value: 'foul', label: 'Foul-smelling', documentationPhrase: 'foul-smelling discharge suggesting anaerobic infection' },
  ], documentationTemplate: 'The ulcer has {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Infection', supportsDisease: ['infection', 'cellulitis', 'osteomyelitis'], weight: 0.5, documentationPhrase: 'purulent discharge' },
    { disease: 'Malignancy', supportsDisease: ['malignancy'], weight: 0.4, documentationPhrase: 'bloody/foul discharge' },
  ]},
  { id: 'ueo_ulcer_tenderness', group: 'character', cardNumber: 11, label: 'Tenderness', question: 'Tenderness of the ulcer', type: 'single_select', options: [
    { value: 'none', label: 'Non-tender', documentationPhrase: 'non-tender' },
    { value: 'mild', label: 'Mildly tender', documentationPhrase: 'mildly tender' },
    { value: 'severe', label: 'Severely tender', documentationPhrase: 'severely tender' },
  ], documentationTemplate: 'The ulcer is {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Infection', supportsDisease: ['infection', 'cellulitis'], weight: 0.4, documentationPhrase: 'tender ulcer' },
  ]},
  { id: 'ueo_ulcer_regional_nodes', group: 'associated', cardNumber: 12, label: 'Regional Lymph Nodes', question: 'Regional lymphadenopathy?', type: 'single_select', options: [
    { value: 'normal', label: 'Not enlarged', documentationPhrase: 'no regional lymphadenopathy appreciated' },
    { value: 'enlarged', label: 'Enlarged', documentationPhrase: 'regional lymphadenopathy is present' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Infection', supportsDisease: ['infection'], weight: 0.3, documentationPhrase: 'regional lymphadenopathy' },
    { disease: 'Malignancy', supportsDisease: ['malignancy'], weight: 0.5, documentationPhrase: 'regional lymphadenopathy suggesting metastasis' },
  ]},
];

function ulcerDocumentation(findings: Record<string, unknown>): string {
  const site = findings['ueo_ulcer_site'];
  const size = findings['ueo_ulcer_size'];
  const shape = findings['ueo_ulcer_shape'];
  const edge = findings['ueo_ulcer_edge'];
  const floor = findings['ueo_ulcer_floor'];
  const induration = findings['ueo_ulcer_base_induration'];
  const discharge = findings['ueo_ulcer_discharge'];
  const tenderness = findings['ueo_ulcer_tenderness'];
  const surrounding = findings['ueo_ulcer_surrounding_skin'];

  const parts: string[] = [];
  const hasFindings = Object.values(findings).some(v => v != null && v !== '' && v !== false);
  if (!hasFindings) return '';

  const v: string[] = [];
  if (size) v.push(`measuring ${size} cm`);
  if (shape) v.push(String(shape));
  const first = v.length > 0 ? `${v.join(', ')} ` : '';

  const ulcerType = findings['ueo_ulcer_type'] || '';
  if (site) {
    parts.push(`There is a ${ulcerType} ulcer over the ${site}.`);
  } else {
    parts.push(`There is a ${ulcerType} ulcer.`);
  }
  if (edge) parts.push(`The edges are ${edge}.`);
  if (floor) parts.push(`The floor is ${floor}.`);
  if (induration === 'indurated') parts.push('The base is indurated.');
  if (discharge && String(discharge) !== 'none') parts.push(`There is ${discharge} discharge.`);
  if (tenderness && String(tenderness) !== 'none') parts.push(`The ulcer is ${tenderness}.`);
  const surrVals = Array.isArray(surrounding) ? surrounding : (surrounding ? [surrounding] : []);
  if (surrVals.length > 0 && !surrVals.includes('normal')) parts.push(`The surrounding skin shows ${surrVals.join(', ')}.`);

  return parts.join(' ');
}

function ulcerEvidenceGraph(findings: Record<string, unknown>): UEOEvidenceNode[] {
  const nodes: UEOEvidenceNode[] = [];
  const edge = String(findings['ueo_ulcer_edge'] || '');
  const induration = String(findings['ueo_ulcer_base_induration'] || '');
  if (edge === 'rolled_everted' || induration === 'indurated') {
    nodes.push({
      finding: 'ueo_ulcer_edge', findingLabel: 'Ulcer Edge (Rolled/Everted) or Indurated Base',
      mechanisms: ['Malignant transformation', 'Infiltrative growth'],
      phenotypes: ['Non-healing ulcer with rolled edges and indurated base'],
      diseases: ['Basal cell carcinoma', 'Squamous cell carcinoma', 'Malignancy'],
      investigations: ['Biopsy (punch/incisional)', 'Histopathology'],
      monitoring: ['Healing response', 'Margins on follow-up'],
    });
  }
  return nodes;
}
// -----------------------------------------------------------------
// UEO: RASH / SKIN LESION
// -----------------------------------------------------------------

const RASH_CARDS: UEOCardDef[] = [
  { id: 'ueo_rash_site', group: 'identification', cardNumber: 1, label: 'Site', question: 'Anatomical distribution', type: 'text', options: [], documentationTemplate: 'Present over {value}.', visibility: { alwaysShow: true }, evidenceLinks: [] },
  { id: 'ueo_rash_primary', group: 'morphology', cardNumber: 2, label: 'Primary Lesion', question: 'Primary lesion type', type: 'single_select', options: [
    { value: 'macule', label: 'Macule (flat, <1cm)', documentationPhrase: 'well-defined macules' },
    { value: 'patch', label: 'Patch (flat, >1cm)', documentationPhrase: 'large patches' },
    { value: 'papule', label: 'Papule (raised, <1cm)', documentationPhrase: 'raised papules' },
    { value: 'plaque', label: 'Plaque (raised, >1cm)', documentationPhrase: 'well-defined plaques' },
    { value: 'nodule', label: 'Nodule (deep, >1cm)', documentationPhrase: 'palpable nodules' },
    { value: 'vesicle', label: 'Vesicle (fluid-filled, <1cm)', documentationPhrase: 'fluid-filled vesicles' },
    { value: 'bulla', label: 'Bulla (fluid-filled, >1cm)', documentationPhrase: 'large bullae' },
    { value: 'pustule', label: 'Pustule (pus-filled)', documentationPhrase: 'pustules' },
    { value: 'wheal', label: 'Wheal / Urticaria', documentationPhrase: 'wheals (urticarial lesions)' },
    { value: 'purpura', label: 'Purpura (non-blanching)', documentationPhrase: 'non-blanching purpura' },
    { value: 'petechiae', label: 'Petechiae (pinpoint purpura)', documentationPhrase: 'petechiae' },
    { value: 'lichenification', label: 'Lichenification (thickened skin)', documentationPhrase: 'lichenified plaques' },
    { value: 'ulceration', label: 'Ulceration / Erosion', documentationPhrase: 'superficial erosions' },
  ], documentationTemplate: '{value} are the primary lesions.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Eczema', supportsDisease: ['eczema', 'atopic_dermatitis'], weight: 0.3, documentationPhrase: 'papules/plaques' },
    { disease: 'Psoriasis', supportsDisease: ['psoriasis'], weight: 0.4, documentationPhrase: 'well-defined plaques with scale' },
    { disease: 'Vasculitis', supportsDisease: ['vasculitis', 'henoch_schonlein'], weight: 0.5, documentationPhrase: 'non-blanching purpura' },
  ]},
  { id: 'ueo_rash_distribution', group: 'morphology', cardNumber: 3, label: 'Distribution', question: 'Distribution pattern', type: 'multi_select', options: [
    { value: 'localized', label: 'Localized', documentationPhrase: 'localized distribution' },
    { value: 'generalized', label: 'Generalized', documentationPhrase: 'generalized distribution' },
    { value: 'flexural', label: 'Flexural (front of elbows/knees)', documentationPhrase: 'flexural distribution' },
    { value: 'extensor', label: 'Extensor (back of elbows/knees)', documentationPhrase: 'extensor distribution' },
    { value: 'dermatomal', label: 'Dermatomal (nerve root distribution)', documentationPhrase: 'dermatomal distribution' },
    { value: 'sun_exposed', label: 'Sun-exposed areas', documentationPhrase: 'distribution over sun-exposed areas' },
    { value: 'palms_soles', label: 'Palms and soles', documentationPhrase: 'involvement of palms and soles' },
    { value: 'scalp', label: 'Scalp', documentationPhrase: 'scalp involvement' },
    { value: 'mucosal', label: 'Mucosal involvement', documentationPhrase: 'mucosal involvement' },
    { value: 'genital', label: 'Genital area', documentationPhrase: 'genital involvement' },
    { value: 'facial', label: 'Facial', documentationPhrase: 'facial distribution' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Psoriasis', supportsDisease: ['psoriasis'], weight: 0.5, documentationPhrase: 'extensor distribution of psoriasis' },
    { disease: 'Eczema', supportsDisease: ['eczema', 'atopic_dermatitis'], weight: 0.5, documentationPhrase: 'flexural distribution of eczema' },
    { disease: 'Herpes zoster', supportsDisease: ['herpes_zoster', 'shingles'], weight: 0.7, documentationPhrase: 'dermatomal distribution of shingles' },
  ]},
  { id: 'ueo_rash_configuration', group: 'morphology', cardNumber: 4, label: 'Configuration', question: 'Arrangement of lesions', type: 'single_select', options: [
    { value: 'discrete', label: 'Discrete / Scattered', documentationPhrase: 'discrete scattered lesions' },
    { value: 'annular', label: 'Annular (ring-shaped)', documentationPhrase: 'annular arrangement' },
    { value: 'target', label: 'Target / Iris (bulls-eye)', documentationPhrase: 'target lesions (erythema multiforme)' },
    { value: 'reticular', label: 'Reticular (net-like)', documentationPhrase: 'reticular pattern' },
    { value: 'grouped', label: 'Grouped / Clustered', documentationPhrase: 'grouped clusters of lesions' },
    { value: 'linear', label: 'Linear', documentationPhrase: 'linear arrangement' },
    { value: 'serpiginous', label: 'Serpiginous (snake-like)', documentationPhrase: 'serpiginous pattern' },
    { value: 'confluent', label: 'Confluent (merge together)', documentationPhrase: 'confluent lesions' },
    { value: 'satellite', label: 'Satellite (small lesions around a large)', documentationPhrase: 'satellite lesions' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Erythema multiforme', supportsDisease: ['erythema_multiforme'], weight: 0.6, documentationPhrase: 'target lesions' },
    { disease: 'Fungal infection', supportsDisease: ['tinea', 'dermatophyte'], weight: 0.5, documentationPhrase: 'annular configuration' },
  ]},
  { id: 'ueo_rash_color', group: 'morphology', cardNumber: 5, label: 'Color', question: 'Color of lesions', type: 'single_select', options: [
    { value: 'red', label: 'Red / Erythematous', documentationPhrase: 'erythematous' },
    { value: 'brown', label: 'Brown / Hyperpigmented', documentationPhrase: 'hyperpigmented (brown)' },
    { value: 'black', label: 'Black', documentationPhrase: 'black' },
    { value: 'purple', label: 'Purple / Violaceous', documentationPhrase: 'purple/violaceous' },
    { value: 'white', label: 'White / Hypopigmented', documentationPhrase: 'hypopigmented (white)' },
    { value: 'yellow', label: 'Yellow', documentationPhrase: 'yellow' },
    { value: 'blue', label: 'Blue', documentationPhrase: 'blue' },
    { value: 'silver', label: 'Silver (scaly)', documentationPhrase: 'silvery scale' },
  ], documentationTemplate: '{value} in color.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Psoriasis', supportsDisease: ['psoriasis'], weight: 0.5, documentationPhrase: 'silvery scale of psoriasis' },
    { disease: 'Vitiligo', supportsDisease: ['vitiligo'], weight: 0.6, documentationPhrase: 'hypopigmented lesions of vitiligo' },
  ]},
  { id: 'ueo_rash_scaling', group: 'surface', cardNumber: 6, label: 'Scaling', question: 'Is scaling present?', type: 'single_select', options: [
    { value: 'absent', label: 'Absent', documentationPhrase: 'no scaling' },
    { value: 'fine', label: 'Fine / Furfuraceous', documentationPhrase: 'fine scaling' },
    { value: 'silvery', label: 'Silvery / Micaceous', documentationPhrase: 'silvery micaceous scale' },
    { value: 'crusted', label: 'Crusted / Plaque scale', documentationPhrase: 'crusted scaling' },
  ], documentationTemplate: '{value} scaling is present.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Psoriasis', supportsDisease: ['psoriasis'], weight: 0.6, documentationPhrase: 'silvery scale of psoriasis' },
    { disease: 'Eczema', supportsDisease: ['eczema', 'seborrheic_dermatitis'], weight: 0.3, documentationPhrase: 'fine scaling' },
  ]},
  { id: 'ueo_rash_pruritus', group: 'symptoms', cardNumber: 7, label: 'Pruritus', question: 'Is the rash itchy?', type: 'single_select', options: [
    { value: 'absent', label: 'No itching', documentationPhrase: 'non-pruritic' },
    { value: 'mild', label: 'Mild', documentationPhrase: 'mildly pruritic' },
    { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderately pruritic' },
    { value: 'severe', label: 'Severe', documentationPhrase: 'severely pruritic' },
  ], documentationTemplate: 'The rash is {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Eczema', supportsDisease: ['eczema', 'atopic_dermatitis'], weight: 0.6, documentationPhrase: 'pruritic rash' },
    { disease: 'Urticaria', supportsDisease: ['urticaria'], weight: 0.5, documentationPhrase: 'pruritic wheals' },
  ]},
  { id: 'ueo_rash_pain', group: 'symptoms', cardNumber: 8, label: 'Pain', question: 'Is the rash painful?', type: 'single_select', options: [
    { value: 'absent', label: 'No pain', documentationPhrase: 'painless' },
    { value: 'present', label: 'Painful', documentationPhrase: 'painful' },
  ], documentationTemplate: 'The rash is {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Herpes zoster', supportsDisease: ['herpes_zoster'], weight: 0.6, documentationPhrase: 'painful rash suggesting shingles' },
  ]},
  { id: 'ueo_rash_mucosal', group: 'symptoms', cardNumber: 9, label: 'Mucosal Involvement', question: 'Mucosal involvement?', type: 'single_select', options: [
    { value: 'absent', label: 'No mucosal involvement', documentationPhrase: 'no mucosal involvement' },
    { value: 'oral', label: 'Oral mucosa', documentationPhrase: 'oral mucosal involvement' },
    { value: 'ocular', label: 'Ocular / Conjunctival', documentationPhrase: 'ocular mucosal involvement' },
    { value: 'genital', label: 'Genital mucosa', documentationPhrase: 'genital mucosal involvement' },
  ], documentationTemplate: '{value} is present.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Stevens-Johnson', supportsDisease: ['stevens_johnson', 'ten'], weight: 0.7, documentationPhrase: 'mucosal involvement' },
    { disease: 'Erythema multiforme', supportsDisease: ['erythema_multiforme'], weight: 0.5, documentationPhrase: 'oral mucosal involvement' },
  ]},
  { id: 'ueo_rash_blanching', group: 'surface', cardNumber: 10, label: 'Blanching', question: 'Do the lesions blanch with pressure?', type: 'single_select', options: [
    { value: 'blanching', label: 'Blanching (inflamed / vascular)', documentationPhrase: 'blanching with pressure suggesting inflammation' },
    { value: 'non_blanching', label: 'Non-blanching (purpura / vasculitis)', documentationPhrase: 'non-blanching lesions suggesting purpura or vasculitis' },
    { value: 'not_applicable', label: 'N/A', documentationPhrase: 'blanching not assessed' },
  ], documentationTemplate: 'Lesions are {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Vasculitis', supportsDisease: ['vasculitis', 'henoch_schonlein', 'meningococcemia'], weight: 0.7, documentationPhrase: 'non-blanching purpura' },
  ]},
];

function rashDocumentation(findings: Record<string, unknown>): string {
  const site = findings['ueo_rash_site'];
  const primary = findings['ueo_rash_primary'];
  const distribution = findings['ueo_rash_distribution'];
  const config = findings['ueo_rash_configuration'];
  const color = findings['ueo_rash_color'];
  const scaling = findings['ueo_rash_scaling'];
  const pruritus = findings['ueo_rash_pruritus'];
  const pain = findings['ueo_rash_pain'];
  const mucosal = findings['ueo_rash_mucosal'];

  const parts: string[] = [];
  const hasFindings = Object.values(findings).some(v => v != null && v !== '' && v !== false);
  if (!hasFindings) return '';

  if (primary) parts.push(`Multiple ${primary} lesions`);
  if (color) parts.push(`${String(color)} in color`);
  if (scaling && String(scaling) !== 'absent') parts.push(`with ${scaling} scaling`);
  const intro = parts.join(' ') + ' are present.';

  const locParts: string[] = [];
  if (site) locParts.push(`distributed over ${site}`);
  const distVals = Array.isArray(distribution) ? distribution : (distribution ? [distribution] : []);
  if (distVals.length > 0) locParts.push(`with a ${distVals.join(', ')} distribution`);
  if (config && String(config) !== 'discrete') locParts.push(`in a ${config} configuration`);

  let result = '';
  if (locParts.length > 0) {
    result = `${intro} The lesions are ${locParts.join(', ')}.`;
  } else {
    result = intro;
  }

  if (pruritus && String(pruritus) !== 'absent') result += ` They are ${pruritus}.`;
  if (pain && String(pain) !== 'absent') result += ' Painful.';
  if (mucosal && String(mucosal) !== 'absent') result += ` ${String(mucosal)} involvement is present.`;

  return result;
}

function rashEvidenceGraph(findings: Record<string, unknown>): UEOEvidenceNode[] {
  const nodes: UEOEvidenceNode[] = [];
  const blanching = String(findings['ueo_rash_blanching'] || '');
  if (blanching === 'non_blanching') {
    nodes.push({
      finding: 'ueo_rash_blanching', findingLabel: 'Non-blanching Purpura',
      mechanisms: ['Vasculitis', 'Thrombocytopenia', 'Small vessel inflammation'],
      phenotypes: ['Non-blanching purpuric lesions'],
      diseases: ['Vasculitis', 'Henoch-Schonlein purpura', 'Meningococcemia', 'ITP'],
      investigations: ['CBC with platelets', 'Coagulation screen', 'Blood cultures', 'Skin biopsy', 'ANCA'],
      monitoring: ['Lesion evolution', 'Platelet count', 'Organ involvement'],
    });
  }
  return nodes;
}
// -----------------------------------------------------------------
// UEO: WOUND
// -----------------------------------------------------------------

const WOUND_CARDS: UEOCardDef[] = [
  { id: 'ueo_wound_type', group: 'identification', cardNumber: 1, label: 'Wound Type', question: 'Type of wound', type: 'single_select', options: [
    { value: 'surgical', label: 'Surgical incision', documentationPhrase: 'surgical wound' },
    { value: 'traumatic', label: 'Traumatic / Laceration', documentationPhrase: 'traumatic wound' },
    { value: 'burn', label: 'Burn', documentationPhrase: 'burn wound' },
    { value: 'pressure', label: 'Pressure sore / Bed sore', documentationPhrase: 'pressure sore' },
    { value: 'diabetic', label: 'Diabetic foot ulcer', documentationPhrase: 'diabetic foot wound' },
    { value: 'venous', label: 'Venous ulcer', documentationPhrase: 'venous wound' },
    { value: 'arterial', label: 'Arterial / Ischaemic', documentationPhrase: 'arterial wound' },
    { value: 'chronic', label: 'Chronic non-healing', documentationPhrase: 'chronic non-healing wound' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_wound_site', group: 'identification', cardNumber: 2, label: 'Site', question: 'Anatomical site', type: 'text', options: [], documentationTemplate: 'Located over {value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_wound_size', group: 'measurement', cardNumber: 3, label: 'Size', question: 'Length x Width (cm)', type: 'text', options: [], documentationTemplate: 'measuring {value} cm.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_wound_depth', group: 'measurement', cardNumber: 4, label: 'Depth', question: 'Depth / Tissue level', type: 'single_select', options: [
    { value: 'superficial', label: 'Superficial (epidermis/dermis)', documentationPhrase: 'superficial' },
    { value: 'partial', label: 'Partial thickness (subcutaneous)', documentationPhrase: 'partial thickness' },
    { value: 'full', label: 'Full thickness (muscle/fascia)', documentationPhrase: 'full thickness' },
    { value: 'cavity', label: 'Cavity / Undermining', documentationPhrase: 'cavity wound with undermining' },
  ], documentationTemplate: '{value} wound.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_wound_closure', group: 'closure', cardNumber: 5, label: 'Closure Method', question: 'Wound closure method', type: 'single_select', options: [
    { value: 'sutured', label: 'Sutured (primary closure)', documentationPhrase: 'closed primarily with sutures' },
    { value: 'stapled', label: 'Stapled', documentationPhrase: 'closed with surgical staples' },
    { value: 'glue', label: 'Tissue glue', documentationPhrase: 'closed with tissue glue' },
    { value: 'open', label: 'Open (healing by secondary intention)', documentationPhrase: 'left open to heal by secondary intention' },
    { value: 'packed', label: 'Packed / Dressed open', documentationPhrase: 'packed open' },
    { value: 'vac', label: 'VAC / Negative pressure therapy', documentationPhrase: 'on negative pressure wound therapy (VAC)' },
  ], documentationTemplate: 'The wound is {value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_wound_healing', group: 'closure', cardNumber: 6, label: 'Healing Phase', question: 'Stage of wound healing', type: 'single_select', options: [
    { value: 'primary', label: 'Primary intention (closed surgical)', documentationPhrase: 'healing by primary intention' },
    { value: 'secondary', label: 'Secondary intention (granulation)', documentationPhrase: 'healing by secondary intention with granulation tissue' },
    { value: 'delayed', label: 'Delayed primary', documentationPhrase: 'delayed primary closure' },
    { value: 'not_healing', label: 'Non-healing / Static', documentationPhrase: 'not healing (static)' },
  ], documentationTemplate: 'Healing is by {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { phenotype: 'Non-healing wound', supportsDisease: ['infection', 'ischaemia', 'malnutrition'], weight: 0.5, documentationPhrase: 'non-healing wound' },
  ]},
  { id: 'ueo_wound_infection', group: 'status', cardNumber: 7, label: 'Infection Status', question: 'Signs of infection?', type: 'single_select', options: [
    { value: 'none', label: 'No signs of infection', documentationPhrase: 'no signs of wound infection' },
    { value: 'suspected', label: 'Suspected (warmth, erythema, pain)', documentationPhrase: 'suspected wound infection with surrounding erythema and warmth' },
    { value: 'confirmed', label: 'Confirmed (pus, positive culture)', documentationPhrase: 'confirmed wound infection with purulent discharge' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Surgical site infection', supportsDisease: ['ssi', 'wound_infection'], weight: 0.6, documentationPhrase: 'wound infection' },
  ]},
  { id: 'ueo_wound_drain', group: 'status', cardNumber: 8, label: 'Drain Present?', question: 'Is there a drain in the wound?', type: 'single_select', options: [
    { value: 'no', label: 'No drain', documentationPhrase: 'no drain present' },
    { value: 'yes', label: 'Drain present (see drain object)', documentationPhrase: 'drain is in situ' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_wound_surrounding', group: 'associated', cardNumber: 9, label: 'Surrounding Skin', question: 'Condition of surrounding skin', type: 'multi_select', options: [
    { value: 'normal', label: 'Normal', documentationPhrase: 'surrounding skin is normal' },
    { value: 'erythema', label: 'Erythema', documentationPhrase: 'surrounding erythema' },
    { value: 'oedema', label: 'Oedema', documentationPhrase: 'surrounding oedema' },
    { value: 'macerated', label: 'Macerated', documentationPhrase: 'surrounding skin is macerated' },
    { value: 'indurated', label: 'Indurated', documentationPhrase: 'surrounding skin is indurated' },
    { value: 'eczematous', label: 'Eczematous changes', documentationPhrase: 'surrounding eczematous changes' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
];

function woundDocumentation(findings: Record<string, unknown>): string {
  const wtype = findings['ueo_wound_type'];
  const site = findings['ueo_wound_site'];
  const size = findings['ueo_wound_size'];
  const closure = findings['ueo_wound_closure'];
  const healing = findings['ueo_wound_healing'];
  const infection = findings['ueo_wound_infection'];
  const parts: string[] = [];
  if (site) parts.push(`There is a ${wtype || ''} wound at ${site}.`);
  if (closure) parts.push(`It is ${closure}.`);
  if (healing) parts.push(`It is ${healing}.`);
  if (infection && String(infection) !== 'none') parts.push('Signs of wound infection are present.');
  return parts.join(' ');
}

function woundEvidenceGraph(_findings: Record<string, unknown>): UEOEvidenceNode[] { return []; }

// -----------------------------------------------------------------
// UEO: LYMPH NODE
// -----------------------------------------------------------------

const LYMPH_NODE_CARDS: UEOCardDef[] = [
  { id: 'ueo_ln_region', group: 'identification', cardNumber: 1, label: 'Region', question: 'Lymph node region', type: 'single_select', options: [
    { value: 'cervical', label: 'Cervical (neck)', documentationPhrase: 'cervical' },
    { value: 'supraclavicular', label: 'Supraclavicular', documentationPhrase: 'supraclavicular' },
    { value: 'axillary', label: 'Axillary', documentationPhrase: 'axillary' },
    { value: 'epitrochlear', label: 'Epitrochlear', documentationPhrase: 'epitrochlear' },
    { value: 'inguinal', label: 'Inguinal', documentationPhrase: 'inguinal' },
    { value: 'femoral', label: 'Femoral', documentationPhrase: 'femoral' },
    { value: 'popliteal', label: 'Popliteal', documentationPhrase: 'popliteal' },
    { value: 'generalized', label: 'Generalized (multiple regions)', documentationPhrase: 'generalized' },
  ], documentationTemplate: '{value} lymphadenopathy.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_ln_number', group: 'character', cardNumber: 2, label: 'Number', question: 'How many nodes palpable?', type: 'single_select', options: [
    { value: 'single', label: 'Single', documentationPhrase: 'single' },
    { value: 'few', label: 'Few (2–4)', documentationPhrase: 'few (2–4)' },
    { value: 'multiple', label: 'Multiple (>5)', documentationPhrase: 'multiple' },
  ], documentationTemplate: '{value} node(s) are palpable.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_ln_size', group: 'measurement', cardNumber: 3, label: 'Size', question: 'Approximate size of largest node (cm)', type: 'text', options: [], documentationTemplate: 'Largest node {value} cm.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_ln_consistency', group: 'character', cardNumber: 4, label: 'Consistency', question: 'Consistency on palpation', type: 'single_select', options: [
    { value: 'soft', label: 'Soft', documentationPhrase: 'soft' },
    { value: 'firm', label: 'Firm', documentationPhrase: 'firm' },
    { value: 'hard', label: 'Hard / Stony hard', documentationPhrase: 'hard (stony hard)' },
    { value: 'rubbery', label: 'Rubbery', documentationPhrase: 'rubbery' },
  ], documentationTemplate: '{value} in consistency.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Reactive', supportsDisease: ['reactive_lymphadenopathy', 'infection'], weight: 0.4, documentationPhrase: 'soft, tender node — reactive' },
    { disease: 'Lymphoma', supportsDisease: ['lymphoma'], weight: 0.5, documentationPhrase: 'rubbery node suggesting lymphoma' },
    { disease: 'Metastasis', supportsDisease: ['metastasis', 'malignancy'], weight: 0.6, documentationPhrase: 'hard node suggesting metastasis' },
  ]},
  { id: 'ueo_ln_tenderness', group: 'character', cardNumber: 5, label: 'Tenderness', question: 'Tender on palpation?', type: 'single_select', options: [
    { value: 'non_tender', label: 'Non-tender', documentationPhrase: 'non-tender' },
    { value: 'tender', label: 'Tender', documentationPhrase: 'tender' },
  ], documentationTemplate: 'The nodes are {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Infection', supportsDisease: ['infection', 'lymphadenitis'], weight: 0.5, documentationPhrase: 'tender lymph node suggesting inflammation' },
  ]},
  { id: 'ueo_ln_mobility', group: 'character', cardNumber: 6, label: 'Mobility', question: 'Mobile or fixed?', type: 'single_select', options: [
    { value: 'mobile', label: 'Mobile', documentationPhrase: 'mobile' },
    { value: 'fixed', label: 'Fixed to surrounding / Matted', documentationPhrase: 'fixed to surrounding structures' },
    { value: 'matted', label: 'Matted (multiple nodes fixed together)', documentationPhrase: 'matted (nodes fixed together)' },
  ], documentationTemplate: 'The nodes are {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Malignancy', supportsDisease: ['malignancy', 'metastasis', 'lymphoma'], weight: 0.5, documentationPhrase: 'fixed nodes suggesting malignancy' },
    { disease: 'Tuberculosis', supportsDisease: ['tuberculosis', 'tb_lymphadenitis'], weight: 0.5, documentationPhrase: 'matted nodes suggesting TB' },
  ]},
  { id: 'ueo_ln_overlying_skin', group: 'associated', cardNumber: 7, label: 'Overlying Skin', question: 'Condition of overlying skin', type: 'multi_select', options: [
    { value: 'normal', label: 'Normal', documentationPhrase: 'overlying skin is normal' },
    { value: 'erythema', label: 'Erythema / Inflammation', documentationPhrase: 'overlying erythema suggesting inflammation' },
    { value: 'sinus', label: 'Discharging sinus', documentationPhrase: 'sinus formation over the node' },
    { value: 'scar', label: 'Scar (previous biopsy/drainage)', documentationPhrase: 'scar over the node' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Tuberculosis', supportsDisease: ['tuberculosis', 'tb_lymphadenitis'], weight: 0.5, documentationPhrase: 'sinus formation/scrofuloderma' },
  ]},
  { id: 'ueo_ln_temperature', group: 'measurement', cardNumber: 8, label: 'Temperature', question: 'Skin temperature over node', type: 'single_select', options: [
    { value: 'normal', label: 'Normal', documentationPhrase: 'normal temperature' },
    { value: 'warm', label: 'Warm', documentationPhrase: 'warm to touch suggesting inflammation' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_ln_drainage_area', group: 'associated', cardNumber: 9, label: 'Drainage Area', question: 'Area from which this node drains', type: 'text', options: [], documentationTemplate: 'Drains the {value} region.', visibility: { alwaysShow: true }, evidenceLinks: []},
];

function lnDocumentation(findings: Record<string, unknown>): string {
  const region = findings['ueo_ln_region'];
  const consistency = findings['ueo_ln_consistency'];
  const tenderness = findings['ueo_ln_tenderness'];
  const mobility = findings['ueo_ln_mobility'];
  const size = findings['ueo_ln_size'];
  const number = findings['ueo_ln_number'];
  const skin = findings['ueo_ln_overlying_skin'];
  if (!region) return '';
  const parts: string[] = [];
  parts.push(`${String(region).charAt(0).toUpperCase() + String(region).slice(1)} lymphadenopathy is present.`);
  const details: string[] = [];
  if (number) details.push(String(number));
  if (size) details.push(`${size} cm`);
  if (consistency) details.push(String(consistency));
  if (mobility && String(mobility) !== 'mobile') details.push(String(mobility));
  if (tenderness && String(tenderness) !== 'non_tender') details.push(String(tenderness));
  if (details.length > 0) parts.push(`The nodes are ${details.join(', ')}.`);
  const skinVals = Array.isArray(skin) ? skin : (skin ? [skin] : []);
  if (skinVals.length > 0 && !skinVals.includes('normal')) parts.push(`Overlying skin shows ${skinVals.join(', ')}.`);
  return parts.join(' ');
}

function lnEvidenceGraph(_findings: Record<string, unknown>): UEOEvidenceNode[] { return []; }

// -----------------------------------------------------------------
// UEO: HERNIA
// -----------------------------------------------------------------

const HERNIA_CARDS: UEOCardDef[] = [
  { id: 'ueo_hernia_type', group: 'identification', cardNumber: 1, label: 'Hernia Type', question: 'Type of hernia', type: 'single_select', options: [
    { value: 'inguinal', label: 'Inguinal', documentationPhrase: 'inguinal hernia' },
    { value: 'femoral', label: 'Femoral', documentationPhrase: 'femoral hernia' },
    { value: 'umbilical', label: 'Umbilical / Paraumbilical', documentationPhrase: 'umbilical hernia' },
    { value: 'incisional', label: 'Incisional (at scar)', documentationPhrase: 'incisional hernia' },
    { value: 'epigastric', label: 'Epigastric', documentationPhrase: 'epigastric hernia' },
    { value: 'spigelian', label: 'Spigelian', documentationPhrase: 'spigelian hernia' },
    { value: 'hiatus', label: 'Hiatus / Hiatal', documentationPhrase: 'hiatal hernia' },
    { value: 'obturator', label: 'Obturator', documentationPhrase: 'obturator hernia' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_hernia_side', group: 'identification', cardNumber: 2, label: 'Side', question: 'Side of hernia', type: 'single_select', options: [
    { value: 'right', label: 'Right', documentationPhrase: 'right-sided' },
    { value: 'left', label: 'Left', documentationPhrase: 'left-sided' },
    { value: 'midline', label: 'Midline', documentationPhrase: 'midline' },
    { value: 'bilateral', label: 'Bilateral', documentationPhrase: 'bilateral' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_hernia_reducibility', group: 'character', cardNumber: 3, label: 'Reducibility', question: 'Is the hernia reducible?', type: 'single_select', options: [
    { value: 'reducible', label: 'Reducible (returns to abdomen)', documentationPhrase: 'reducible' },
    { value: 'irreducible', label: 'Irreducible / Incarcerated', documentationPhrase: 'irreducible (incarcerated)' },
    { value: 'obstructed', label: 'Obstructed (pain, distension, vomiting)', documentationPhrase: 'obstructed with features of intestinal obstruction' },
    { value: 'strangulated', label: 'Strangulated (painful, tender, red, systemically unwell)', documentationPhrase: 'strangulated' },
  ], documentationTemplate: 'The hernia is {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Obstructed hernia', supportsDisease: ['obstructed_hernia'], weight: 0.6, documentationPhrase: 'obstructed hernia' },
    { disease: 'Strangulated hernia', supportsDisease: ['strangulated_hernia'], weight: 0.7, documentationPhrase: 'strangulated hernia — surgical emergency' },
  ]},
  { id: 'ueo_hernia_cough_impulse', group: 'character', cardNumber: 4, label: 'Cough Impulse', question: 'Expansile cough impulse?', type: 'single_select', options: [
    { value: 'present', label: 'Present (expansile)', documentationPhrase: 'expansile cough impulse is present' },
    { value: 'absent', label: 'Absent', documentationPhrase: 'no expansile cough impulse' },
    { value: 'not_elicited', label: 'Not elicited (irreducible)', documentationPhrase: 'cough impulse could not be elicited' },
  ], documentationTemplate: '{value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
  { id: 'ueo_hernia_tenderness', group: 'character', cardNumber: 5, label: 'Tenderness', question: 'Tenderness of the hernia', type: 'single_select', options: [
    { value: 'none', label: 'Non-tender', documentationPhrase: 'non-tender' },
    { value: 'mild', label: 'Mildly tender', documentationPhrase: 'mildly tender' },
    { value: 'severe', label: 'Severely tender (strangulation)', documentationPhrase: 'severely tender — suspicious for strangulation' },
  ], documentationTemplate: 'The hernia is {value}.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Strangulated hernia', supportsDisease: ['strangulated_hernia'], weight: 0.6, documentationPhrase: 'severe tenderness' },
  ]},
  { id: 'ueo_hernia_ring', group: 'character', cardNumber: 6, label: 'Neck / Ring', question: 'Size of hernia neck/ring (finger width)', type: 'single_select', options: [
    { value: 'narrow', label: 'Narrow (<1 finger)', documentationPhrase: 'narrow neck' },
    { value: 'moderate', label: 'Moderate (1–2 fingers)', documentationPhrase: 'moderate neck' },
    { value: 'wide', label: 'Wide (>2 fingers)', documentationPhrase: 'wide neck' },
  ], documentationTemplate: '{value} neck.', visibility: { alwaysShow: true }, evidenceLinks: [
    { disease: 'Incarceration', supportsDisease: ['obstructed_hernia', 'strangulated_hernia'], weight: 0.4, documentationPhrase: 'narrow neck — risk of obstruction' },
  ]},
  { id: 'ueo_hernia_content', group: 'character', cardNumber: 7, label: 'Content', question: 'What is felt in the hernia sac?', type: 'single_select', options: [
    { value: 'omentum', label: 'Omentum (soft, doughy, reducible)', documentationPhrase: 'omentum in the sac' },
    { value: 'bowel', label: 'Bowel (firm, gurgling, reducible)', documentationPhrase: 'bowel in the sac' },
    { value: 'ovary', label: 'Ovary (in a female child)', documentationPhrase: 'ovary in the sac' },
    { value: 'unknown', label: 'Uncertain / Irreducible', documentationPhrase: 'content uncertain' },
  ], documentationTemplate: 'The sac contains {value}.', visibility: { alwaysShow: true }, evidenceLinks: []},
];

function herniaDocumentation(findings: Record<string, unknown>): string {
  const type = findings['ueo_hernia_type'];
  const side = findings['ueo_hernia_side'];
  const reducibility = findings['ueo_hernia_reducibility'];
  const cough = findings['ueo_hernia_cough_impulse'];
  const tenderness = findings['ueo_hernia_tenderness'];
  const ring = findings['ueo_hernia_ring'];
  if (!type) return '';
  const prefix = side && String(side) !== 'midline' ? `${String(side)}-sided` : '';
  let result = `There is a ${prefix} ${type} hernia.`;
  if (reducibility) result += ` It is ${reducibility}.`;
  if (cough === 'present') result += ' An expansile cough impulse is present.';
  if (cough === 'absent') result += ' No expansile cough impulse.';
  if (tenderness && String(tenderness) !== 'none') result += ` It is ${tenderness}.`;
  if (ring) result += ` The neck is ${ring}.`;
  return result;
}

function herniaEvidenceGraph(_findings: Record<string, unknown>): UEOEvidenceNode[] { return []; }
// -----------------------------------------------------------------
// UEO REGISTRY
// -----------------------------------------------------------------

export const UEO_GROUPS: Record<UEOType, UEOGroupDef> = {
  mass: { type: 'mass', label: 'Mass / Swelling', sectionOrder: 1, cards: MASS_CARDS, activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'mass'), documentationTemplate: massDocumentation, evidenceGraphBuilder: massEvidenceGraph },
  ulcer: { type: 'ulcer', label: 'Ulcer', sectionOrder: 2, cards: ULCER_CARDS, activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'ulcer'), documentationTemplate: ulcerDocumentation, evidenceGraphBuilder: ulcerEvidenceGraph },
  swelling: { type: 'swelling', label: 'Swelling', sectionOrder: 3, cards: MASS_CARDS, activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'mass'), documentationTemplate: massDocumentation, evidenceGraphBuilder: massEvidenceGraph },
  rash: { type: 'rash', label: 'Rash / Skin Lesion', sectionOrder: 4, cards: RASH_CARDS, activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'rash'), documentationTemplate: rashDocumentation, evidenceGraphBuilder: rashEvidenceGraph },
  wound: { type: 'wound', label: 'Wound', sectionOrder: 5, cards: WOUND_CARDS, activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'wound'), documentationTemplate: woundDocumentation, evidenceGraphBuilder: woundEvidenceGraph },
  discharge: { type: 'discharge', label: 'Discharge', sectionOrder: 6, cards: [], activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'discharge'), documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  stoma: { type: 'stoma', label: 'Stoma', sectionOrder: 7, cards: [], activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'stoma'), documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  lymph_node: { type: 'lymph_node', label: 'Lymphadenopathy', sectionOrder: 8, cards: LYMPH_NODE_CARDS, activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'lymph_node'), documentationTemplate: lnDocumentation, evidenceGraphBuilder: lnEvidenceGraph },
  scar: { type: 'scar', label: 'Scar', sectionOrder: 9, cards: [], activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'scar'), documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  hernia: { type: 'hernia', label: 'Hernia', sectionOrder: 10, cards: HERNIA_CARDS, activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'hernia'), documentationTemplate: herniaDocumentation, evidenceGraphBuilder: herniaEvidenceGraph },
  burn: { type: 'burn', label: 'Burn', sectionOrder: 11, cards: [], activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'burn'), documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  pigmented_lesion: { type: 'pigmented_lesion', label: 'Pigmented Lesion', sectionOrder: 12, cards: [], activationRules: [], documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  pressure_sore: { type: 'pressure_sore', label: 'Pressure Sore', sectionOrder: 13, cards: [], activationRules: [], documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  edema: { type: 'edema', label: 'Edema', sectionOrder: 14, cards: [], activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'edema'), documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  sinus: { type: 'sinus', label: 'Sinus', sectionOrder: 15, cards: [], activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'sinus'), documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  fistula: { type: 'fistula', label: 'Fistula', sectionOrder: 16, cards: [], activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'fistula'), documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  drain: { type: 'drain', label: 'Drain', sectionOrder: 17, cards: [], activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'drain'), documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  catheter: { type: 'catheter', label: 'Catheter / Tube', sectionOrder: 18, cards: [], activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'catheter'), documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  surgical_incision: { type: 'surgical_incision', label: 'Surgical Incision', sectionOrder: 19, cards: [], activationRules: [], documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  skin_graft: { type: 'skin_graft', label: 'Skin Graft', sectionOrder: 20, cards: [], activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'skin_graft'), documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  flap: { type: 'flap', label: 'Surgical Flap', sectionOrder: 21, cards: [], activationRules: UEO_ACTIVATION_RULES.filter(r => r.ueoType === 'flap'), documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
  deformity: { type: 'deformity', label: 'Deformity', sectionOrder: 22, cards: [], activationRules: [], documentationTemplate: () => '', evidenceGraphBuilder: () => [] },
};

// -----------------------------------------------------------------
// UEO ENGINE — detect, instantiate, document, evidence
// -----------------------------------------------------------------

let _ueoCtr = 0;

export function generateUeoId(): string {
  _ueoCtr++;
  return `ueo_${_ueoCtr}`;
}

export function detectActiveUEOTypes(
  findings: Record<string, unknown>,
): Array<{ type: UEOType; label: string; triggerCardId: string; triggerValue: string }> {
  const detected: Array<{ type: UEOType; label: string; triggerCardId: string; triggerValue: string }> = [];
  for (const rule of UEO_ACTIVATION_RULES) {
    for (const cardId of rule.triggerCardIds) {
      const val = findings[cardId];
      if (val == null || val === '' || val === false) continue;
      const strVal = String(val);
      if (rule.triggerValues.some(tv => strVal === tv || strVal.includes(tv))) {
        if (!detected.some(d => d.type === rule.ueoType)) {
          detected.push({ type: rule.ueoType, label: rule.ueoLabel, triggerCardId: cardId, triggerValue: strVal });
        }
      }
    }
  }
  return detected;
}

export function instantiateUEOObject(
  type: UEOType,
  findings: Record<string, unknown>,
  triggerCardId?: string,
  triggerValue?: string,
): UEOObject {
  const now = Date.now();
  const group = UEO_GROUPS[type];
  const obj: UEOObject = {
    identifiers: {
      id: generateUeoId(),
      type,
      label: group?.label || type,
      activationSource: triggerCardId ? 'finding' : 'manual',
      triggerCardId,
      triggerValue,
      createdAt: now,
      updatedAt: now,
    },
    findings: {},
    measurements: [],
    photographs: [],
    narrative: '',
    active: true,
  };

  const groupFindings: Record<string, unknown> = {};
  if (group) {
    for (const card of group.cards) {
      const val = findings[card.id];
      if (val != null && val !== '' && val !== false) {
        groupFindings[card.id] = val;
        obj.findings[card.id] = val;
      }
    }
  }

  obj.narrative = group ? group.documentationTemplate(obj.findings, obj.measurements) : '';
  return obj;
}

export function updateUEOObjectNarrative(obj: UEOObject): string {
  const group = UEO_GROUPS[obj.identifiers.type];
  if (!group) return '';
  obj.narrative = group.documentationTemplate(obj.findings, obj.measurements);
  return obj.narrative;
}

export function buildUEOEvidenceGraph(obj: UEOObject): UEOEvidenceNode[] {
  const group = UEO_GROUPS[obj.identifiers.type];
  if (!group) return [];
  return group.evidenceGraphBuilder(obj.findings);
}

export function getUEOCardsForType(type: UEOType): UEOCardDef[] {
  const group = UEO_GROUPS[type];
  return group ? group.cards : [];
}

export function getAllActiveUEOs(ctx: UEOContext): UEOObject[] {
  return Object.values(ctx.activeObjects).filter(o => o.active);
}

export function formatUEOMeasurement(m: UEOMeasurement): string {
  const parts: string[] = [];
  if (m.lengthCm) parts.push(`${m.lengthCm} cm (length)`);
  if (m.widthCm) parts.push(`${m.widthCm} cm (width)`);
  if (m.heightCm) parts.push(`${m.heightCm} cm (height)`);
  if (m.diameterCm) parts.push(`${m.diameterCm} cm (diameter)`);
  if (m.depthCm) parts.push(`${m.depthCm} cm (depth)`);
  if (m.volumeMl) parts.push(`${m.volumeMl} ml (volume)`);
  return parts.join(' x ');
}
