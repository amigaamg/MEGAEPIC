// ═══════════════════════════════════════════════════════════════════════════════
// Constipation Manifestation Profiles
// Every disease that causes constipation describes its typical pattern here.
// The engine uses these to ask discriminating questions and generate better HPI.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ConstipationManifestation } from '../diseaseNode';

/**
 * Constipation manifestation profiles mapped by diseaseId.
 * All 73 constipation disease nodes have an entry.
 */
export const CONSTIPATION_MANIFESTATIONS: Record<string, ConstipationManifestation> = {

  // ── SECTION 1: FUNCTIONAL (4 nodes) ──────────────────────────────────

  functional_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'functional',
    typicalDescription: 'Chronic constipation with infrequent, hard stools that require straining. Sensation of incomplete evacuation is common. No alarm features or organic cause identified.',
  },

  ibs_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'ibs',
    typicalDescription: 'Abdominal pain that improves with defecation, associated with constipation-predominant bowel habit. Bloating and alternating bowel pattern are common. No alarm features.',
  },

  slow_transit_constipation: {
    duration: 'chronic', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['abdominal_distension'], mechanism: 'slow_transit',
    typicalDescription: 'Infrequent bowel movements with stools occurring less than once weekly. Bloating is prominent. Straining and sensation of incomplete evacuation are absent — the primary problem is infrequency.',
  },

  pelvic_floor_dyssynergia: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'yes',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'outlet_obstruction',
    typicalDescription: 'Severe straining with defecation despite normal stool frequency. Sensation of incomplete evacuation is prominent, often requiring manual manoeuvres or digital evacuation to pass stool.',
  },

  // ── SECTION 2: DIETARY / LIFESTYLE (4 nodes) ─────────────────────────

  low_fiber_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'functional',
    typicalDescription: 'Constipation associated with inadequate dietary fiber intake. Stools are hard and infrequent. Responds well to dietary modification.',
  },

  dehydration_constipation: {
    duration: 'variable', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'functional',
    typicalDescription: 'Constipation developing in the setting of poor fluid intake. Stools are dry and hard. Promptly improves with rehydration.',
  },

  immobility_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'slow_transit',
    typicalDescription: 'Constipation in a bedridden or wheelchair-bound patient due to lack of physical activity and poor fluid intake.',
  },

  anorexia_nervosa_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['weight_loss', 'neurological'], mechanism: 'slow_transit',
    typicalDescription: 'Severe constipation in anorexia nervosa due to starvation, dehydration, and electrolyte abnormalities. Improves with refeeding.',
  },

  // ── SECTION 3: MECHANICAL LARGE BOWEL OBSTRUCTION (6 nodes) ──────────

  colorectal_cancer_constipation: {
    duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'ribbon_like',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'yes',
    associatedSymptoms: ['weight_loss', 'abdominal_distension'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Progressive constipation with decreasing stool calibre (ribbon-like stools), rectal bleeding, weight loss, and abdominal pain. Later stages present with complete obstruction with obstipation, distension, and vomiting.',
  },

  diverticular_stricture: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'ribbon_like',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Progressive constipation with narrowing stools in a patient with prior diverticulitis episodes. Left lower quadrant pain and bloating are common.',
  },

  radiation_stricture: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'ribbon_like',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'yes',
    associatedSymptoms: ['tenesmus'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Progressive constipation following pelvic radiation. Rectal bleeding, tenesmus, and ribbon-like stools develop months to years after treatment.',
  },

  crohn_stricture: {
    duration: 'chronic', frequency: 'variable', stoolConsistency: 'variable',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'yes',
    associatedSymptoms: ['abdominal_distension', 'weight_loss'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Constipation in known Crohn disease with colonic stricture. May alternate with diarrhoea. Abdominal pain, weight loss, and fistulae suggest active disease.',
  },

  sigmoid_volvulus: {
    duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'variable',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['abdominal_distension'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Acute onset of obstipation and massive abdominal distension in elderly or institutionalised patients. Severe cramping pain. "Coffee bean" sign on abdominal X-ray.',
  },

  cecal_volvulus: {
    duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'variable',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['vomiting', 'abdominal_distension'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Acute obstipation with severe right-sided or periumbilical pain, abdominal distension, and vomiting. "Comma sign" on abdominal X-ray.',
  },

  // ── SECTION 4: FAECAL / RECTAL (4 nodes) ─────────────────────────────

  fecal_impaction: {
    duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'overflow_diarrhoea',
    straining: 'no', incompleteEvacuation: 'yes', manualManeuvers: 'yes',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'variable',
    associatedSymptoms: ['abdominal_distension', 'tenesmus'], mechanism: 'outlet_obstruction',
    typicalDescription: 'Overflow diarrhoea with abdominal distension and palpable fecal mass — patient may report diarrhoea but is severely constipated.',
  },

  rectocele: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'yes',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'outlet_obstruction',
    typicalDescription: 'Constipation with a sensation of incomplete evacuation and the need to splint the posterior vagina or perineum to pass stool. A visible or palpable vaginal bulge is present.',
  },

  enterocele: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining',
    straining: 'no', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'outlet_obstruction',
    typicalDescription: 'Constipation with pelvic pressure and incomplete evacuation. Unlike rectocele, splinting does not help. Small bowel loops herniate into the rectovaginal space.',
  },

  rectal_prolapse: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'variable',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'yes',
    associatedSymptoms: ['tenesmus', 'mucus'], mechanism: 'outlet_obstruction',
    typicalDescription: 'Constipation with visible rectal protrusion during defecation. Mucous discharge, bleeding, and faecal incontinence are associated.',
  },

  // ── SECTION 5: ANORECTAL (4 nodes) ───────────────────────────────────

  anal_stenosis: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'yes',
    associatedSymptoms: ['tenesmus'], mechanism: 'outlet_obstruction',
    typicalDescription: 'Constipation with painful, difficult passage of stool due to a narrowed anal canal. Often post-surgical or post-radiation.',
  },

  severe_hemorrhoids: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'variable',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'yes',
    associatedSymptoms: ['tenesmus', 'mucus'], mechanism: 'outlet_obstruction',
    typicalDescription: 'Constipation with bright red rectal bleeding, anal pain, and prolapsing haemorrhoidal tissue. Straining aggravates both the constipation and the haemorrhoids.',
  },

  anal_fissure: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'large_painful',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'no', bleeding: 'yes',
    associatedSymptoms: ['tenesmus'], mechanism: 'outlet_obstruction',
    typicalDescription: 'Painful defecation with bright red blood on tissue, leading to stool retention cycle.',
  },

  anorectal_malformation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'mixed',
    typicalDescription: 'Constipation in a patient with history of surgically corrected anorectal malformation. Associated with faecal incontinence and altered rectal sensation.',
  },

  // ── SECTION 6: NEUROLOGICAL CNS (5 nodes) ────────────────────────────

  parkinson_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'mixed',
    typicalDescription: 'Chronic constipation in a patient with Parkinson disease. Often begins years before motor symptoms. Both slow transit and outlet obstruction components contribute.',
  },

  multiple_sclerosis_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'mixed',
    typicalDescription: 'Constipation in a patient with known MS. Spinal cord lesions impair colonic motility and pelvic floor coordination.',
  },

  stroke_constipation: {
    duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['neurological', 'vomiting'], mechanism: 'mixed',
    typicalDescription: 'Constipation developing after a stroke due to immobility, poor intake, medications, and impaired defecation sensation.',
  },

  dementia_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'functional',
    typicalDescription: 'Constipation in a patient with dementia, often unrecognised until overflow soiling or behavioural change occurs.',
  },

  brain_tumor_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['neurological', 'vomiting'], mechanism: 'functional',
    typicalDescription: 'Constipation in a patient with known brain tumour, exacerbated by poor intake, vomiting, and medications.',
  },

  // ── SECTION 7: SPINAL (4 nodes) ──────────────────────────────────────

  spinal_cord_injury_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'yes',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'mixed',
    typicalDescription: 'Constipation following spinal cord injury requiring a structured bowel program including digital stimulation and manual evacuation.',
  },

  cauda_equina_constipation: {
    duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'neurological',
    typicalDescription: 'Acute or subacute onset of constipation in a patient with low back pain, saddle anaesthesia, and urinary retention. This is a surgical emergency.',
  },

  spina_bifida_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'yes',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'neurological',
    typicalDescription: 'Lifelong constipation in a patient with spina bifida due to congenital neurogenic bowel. Bowel programs often include daily enemas or ACE procedure.',
  },

  spinal_tumor_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'neurological',
    typicalDescription: 'Progressive constipation in a patient with back pain, leg weakness, and sensory loss suggesting spinal cord or cauda equina compression.',
  },

  // ── SECTION 8: ENTERIC NERVOUS SYSTEM (2 nodes) ──────────────────────

  hirschsprung_disease: {
    duration: 'lifelong', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'variable',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['abdominal_distension', 'vomiting'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Lifelong severe constipation since birth with delayed meconium passage and abdominal distension. The aganglionic segment causes functional obstruction from birth.',
  },

  chagas_constipation: {
    duration: 'chronic', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['abdominal_distension', 'vomiting'], mechanism: 'mixed',
    typicalDescription: 'Chronic, progressive constipation in a patient with history of Chagas disease or endemic exposure. Severe abdominal distension with megacolon visible on imaging.',
  },

  // ── SECTION 9: ENDOCRINE (5 nodes) ───────────────────────────────────

  hypothyroidism_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['endocrine'], mechanism: 'endocrine',
    typicalDescription: 'Chronic constipation with cold intolerance, weight gain, and fatigue in a patient with hypothyroidism.',
  },

  diabetic_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'slow_transit',
    typicalDescription: 'Constipation in a patient with longstanding diabetes and other microvascular complications. Autonomic neuropathy causes delayed colonic transit.',
  },

  hyperparathyroid_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['endocrine'], mechanism: 'endocrine',
    typicalDescription: 'Constipation with fatigue, kidney stones, and bone pain suggesting hyperparathyroidism.',
  },

  pregnancy_constipation: {
    duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'mixed',
    typicalDescription: 'Constipation during pregnancy due to hormonal changes, uterine compression, and iron supplements.',
  },

  hypopituitarism_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['endocrine'], mechanism: 'endocrine',
    typicalDescription: 'Constipation due to secondary hypothyroidism and adrenal insufficiency from panhypopituitarism.',
  },

  // ── SECTION 10: METABOLIC (5 nodes) ──────────────────────────────────

  hypercalcemia_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['endocrine'], mechanism: 'slow_transit',
    typicalDescription: 'Constipation associated with elevated serum calcium. Often accompanied by polyuria, polydipsia, and fatigue.',
  },

  hypokalemia_constipation: {
    duration: 'acute', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'slow_transit',
    typicalDescription: 'Constipation in the setting of low potassium, often from diuretic use or diarrhoea. Muscle weakness and fatigue are associated.',
  },

  uremia_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none', 'endocrine'], mechanism: 'mixed',
    typicalDescription: 'Constipation in chronic kidney disease, exacerbated by phosphate binders, iron supplements, and fluid restrictions.',
  },

  porphyria_constipation: {
    duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'variable',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['abdominal_distension', 'neurological'], mechanism: 'slow_transit',
    typicalDescription: 'Acute constipation with severe abdominal pain, psychiatric disturbance, and dark urine during a porphyric attack.',
  },

  hypermagnesemia_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'slow_transit',
    typicalDescription: 'Constipation due to high serum magnesium, often from antacid use or CKD.',
  },

  // ── SECTION 11: DRUG-INDUCED (8 nodes) ───────────────────────────────

  opioid_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'drug_induced',
    typicalDescription: 'Constipation starting after opioid use, with hard stools and straining. Tolerance to opioid-induced constipation does not develop.',
  },

  anticholinergic_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'drug_induced',
    typicalDescription: 'Constipation starting after initiation of anticholinergic medication for overactive bladder, Parkinson disease, or other indications.',
  },

  tca_constipation: {
    duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'drug_induced',
    typicalDescription: 'Constipation developing after starting a tricyclic antidepressant. Dry mouth and sedation are common accompanying side effects.',
  },

  antipsychotic_constipation: {
    duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'drug_induced',
    typicalDescription: 'Constipation in a patient taking antipsychotic medication. Clozapine carries the highest risk of severe, even life-threatening constipation.',
  },

  ccb_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'drug_induced',
    typicalDescription: 'Constipation starting after initiation of a calcium channel blocker, especially verapamil. Bloating and hard stools are typical.',
  },

  iron_constipation: {
    duration: 'acute', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_relieved_by_defecation', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'mixed',
    typicalDescription: 'Constipation developing after starting iron supplements, often with abdominal cramping and hard, dark-coloured stools.',
  },

  aluminum_antacid_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'mixed',
    typicalDescription: 'Constipation in a patient taking aluminium-containing antacids or phosphate binders. Stools become exceptionally hard and dry.',
  },

  chemotherapy_constipation: {
    duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['vomiting'], mechanism: 'mixed',
    typicalDescription: 'Constipation during chemotherapy, exacerbated by antiemetics, opioids, and reduced oral intake. Vinca alkaloids are particularly constipating.',
  },

  // ── SECTION 12: GI DYSMOTILITY (4 nodes) ─────────────────────────────

  chronic_intestinal_pseudo_obstruction: {
    duration: 'chronic', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'variable',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['vomiting', 'abdominal_distension', 'weight_loss'], mechanism: 'mixed',
    typicalDescription: 'Episodic or chronic constipation with massive abdominal distension, vomiting, and pain. Episodes mimic mechanical obstruction but no blockage is found.',
  },

  postoperative_ileus: {
    duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'variable',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['vomiting', 'abdominal_distension'], mechanism: 'slow_transit',
    typicalDescription: 'Inability to pass stool or flatus following abdominal surgery, with abdominal distension and discomfort. Typically resolves within 3–5 days.',
  },

  colonic_inertia: {
    duration: 'chronic', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['abdominal_distension'], mechanism: 'slow_transit',
    typicalDescription: 'Extremely infrequent bowel movements (less than once per week) with massive bloating. Minimally responsive to laxatives. Often requires colectomy.',
  },

  systemic_sclerosis_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['abdominal_distension'], mechanism: 'slow_transit',
    typicalDescription: 'Chronic constipation in a patient with known systemic sclerosis. Dysphagia, reflux, and bloating are commonly associated.',
  },

  // ── SECTION 13: EXTRINSIC COMPRESSION (4 nodes) ──────────────────────

  ovarian_mass_constipation: {
    duration: 'chronic', frequency: 'variable', stoolConsistency: 'ribbon_like',
    straining: 'no', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['weight_loss', 'abdominal_distension'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Constipation with progressive abdominal distension and pelvic pressure in a woman. Ovarian masses often present with vague GI symptoms.',
  },

  uterine_fibroids_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'ribbon_like',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['tenesmus'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Constipation from a large posterior or cervical fibroid compressing the rectum. Associated with heavy menstrual bleeding and pelvic pressure.',
  },

  pelvic_malignancy_constipation: {
    duration: 'chronic', frequency: 'variable', stoolConsistency: 'ribbon_like',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'yes',
    associatedSymptoms: ['weight_loss', 'tenesmus'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Progressive constipation in a patient with known or suspected pelvic malignancy. Pelvic or sacral pain, weight loss, and rectal bleeding are associated.',
  },

  prostate_enlargement_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Constipation in an older man with coexisting urinary symptoms (hesitancy, weak stream, frequency). Incomplete evacuation and tenesmus are common.',
  },

  // ── SECTION 14: GYNAECOLOGICAL (2 nodes) ─────────────────────────────

  endometriosis_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining',
    straining: 'no', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'mixed',
    typicalDescription: 'Constipation that worsens during menstruation, associated with painful periods and intercourse.',
  },

  pelvic_congestion_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'functional',
    typicalDescription: 'Constipation with pelvic heaviness, worsened by standing. Associated with dysmenorrhea and dyspareunia.',
  },

  // ── SECTION 15: INFECTIOUS (2 nodes) ─────────────────────────────────

  diverticulitis_constipation: {
    duration: 'acute', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'yes',
    associatedSymptoms: ['fever'], mechanism: 'functional',
    typicalDescription: 'Constipation during an acute episode of diverticulitis with left lower quadrant pain, fever, and bloating.',
  },

  anal_tuberculosis_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'normal_with_straining',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'yes',
    associatedSymptoms: ['mucus', 'weight_loss', 'fever'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Constipation with painful defecation, rectal bleeding, and systemic B-symptoms in a patient from a TB-endemic area or immunocompromised.',
  },

  // ── SECTION 16: CONNECTIVE TISSUE (2 nodes) ──────────────────────────

  amyloidosis_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'variable',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['weight_loss', 'neurological'], mechanism: 'slow_transit',
    typicalDescription: 'Chronic constipation in a patient with known or suspected amyloidosis, accompanied by weight loss, fatigue, and organomegaly.',
  },

  dermatomyositis_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['vomiting', 'neurological'], mechanism: 'slow_transit',
    typicalDescription: 'Constipation with dysphagia in a patient with proximal muscle weakness and characteristic rash.',
  },

  // ── SECTION 17: PAEDIATRIC (4 nodes) ─────────────────────────────────

  functional_constipation_child: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'functional',
    typicalDescription: 'Common childhood constipation often triggered by painful defecation, with stool withholding, hard pellets, and occasional overflow soiling.',
  },

  meconium_ileus: {
    duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['vomiting', 'abdominal_distension'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Neonatal intestinal obstruction with failure to pass meconium, progressive abdominal distension, and bilious vomiting.',
  },

  celiac_disease_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'variable',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['weight_loss'], mechanism: 'mixed',
    typicalDescription: 'Constipation in coeliac disease, may alternate with diarrhoea. Bloating, fatigue, and weight loss are associated.',
  },

  cystic_fibrosis_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['weight_loss'], mechanism: 'slow_transit',
    typicalDescription: 'Constipation in cystic fibrosis with thick, hard stools, abdominal pain, and steatorrhea. Episodes of DIOS may occur with severe colicky pain.',
  },

  // ── SECTION 18: PSYCHIATRIC (3 nodes) ────────────────────────────────

  depression_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'functional',
    typicalDescription: 'Constipation in a patient with depression, with reduced appetite and physical activity. Confirm with mood symptoms.',
  },

  eating_disorder_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['weight_loss', 'neurological'], mechanism: 'slow_transit',
    typicalDescription: 'Severe constipation in an eating disorder due to reduced food intake, electrolyte disturbances, and laxative abuse.',
  },

  somatic_symptom_constipation: {
    duration: 'chronic', frequency: 'variable', stoolConsistency: 'variable',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['neurological'], mechanism: 'functional',
    typicalDescription: 'Constipation with excessive distress and health-concern out of proportion to objective findings. Multiple normal investigations.',
  },

  // ── SECTION 19: GERIATRIC (1 node) ───────────────────────────────────

  geriatric_multifactorial_constipation: {
    duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'mixed',
    typicalDescription: 'Chronic constipation in an elderly patient on multiple medications, with reduced mobility and fluid intake.',
  },

  rectal_cancer: {
    duration: 'chronic', frequency: 'variable', stoolConsistency: 'ribbon_like',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'no', bleeding: 'yes',
    associatedSymptoms: ['weight_loss', 'tenesmus'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Chronic progressive constipation with pencil-thin stools, tenesmus, and rectal bleeding. Weight loss indicates advanced disease.',
  },

  pancreatic_cancer_constipation: {
    duration: 'chronic', frequency: 'variable', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['weight_loss', 'vomiting', 'abdominal_distension'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Constipation with profound weight loss, epigastric pain radiating to the back, and jaundice. Steatorrhoea and anorexia are common accompaniments.',
  },

  antiepileptic_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'drug_induced',
    typicalDescription: 'Constipation that began after starting antiepileptic medication. Stools are hard and require straining. No alarm features.',
  },

  antihistamine_constipation: {
    duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'no',
    associatedSymptoms: ['none'], mechanism: 'drug_induced',
    typicalDescription: 'Constipation temporally related to starting antihistamine medication. Associated dry mouth suggests anticholinergic effect. No alarm features.',
  },

  hepatobiliary_constipation: {
    duration: 'chronic', frequency: 'variable', stoolConsistency: 'hard_pellets',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'no', bloating: 'yes', bleeding: 'variable',
    associatedSymptoms: ['abdominal_distension', 'weight_loss'], mechanism: 'mixed',
    typicalDescription: 'Constipation in a patient with known liver disease, associated with abdominal distension from ascites, leg swelling, and jaundice.',
  },

  metastatic_constipation: {
    duration: 'chronic', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'ribbon_like',
    straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no',
    abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'variable',
    associatedSymptoms: ['weight_loss', 'vomiting', 'abdominal_distension'], mechanism: 'mechanical_obstruction',
    typicalDescription: 'Progressive constipation in a patient with known malignancy. Profound weight loss, anorexia, and abdominal distension suggest peritoneal or retroperitoneal metastatic involvement.',
  },
};

export function getConstipationDiseaseIds(): string[] {
  return Object.keys(CONSTIPATION_MANIFESTATIONS);
}

export function getConstipationManifestation(diseaseId: string): ConstipationManifestation | undefined {
  return CONSTIPATION_MANIFESTATIONS[diseaseId];
}

export function hasConstipationManifestation(diseaseId: string): boolean {
  return diseaseId in CONSTIPATION_MANIFESTATIONS;
}
