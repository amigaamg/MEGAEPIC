// ═══════════════════════════════════════════════════════════════════════════════
// Diarrhoea Manifestation Profiles
// Every disease that causes diarrhoea describes its typical diarrhoea pattern here.
// The engine uses these to ask discriminating questions and generate better HPI.
// ═══════════════════════════════════════════════════════════════════════════════

import type { DiarrhoeaManifestation } from '../diseaseNode';

/**
 * Diarrhoea manifestation profiles mapped by diseaseId.
 * All 67 diarrhoea disease nodes have an entry.
 */
export const DIARRHOEA_MANIFESTATIONS: Record<string, DiarrhoeaManifestation> = {

  // ── SECTION 1: VIRAL GASTROENTERITIS (5 nodes) ──────────────────────

  viral_gastroenteritis_norovirus: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['vomiting', 'abdominal_pain', 'dehydration'],
    mechanism: 'secretory',
    typicalDescription: 'Acute onset of watery diarrhoea and vomiting after a short incubation period. Stools are non-bloody and may be profuse. Typically lasts 24–72 hours and resolves spontaneously.',
  },

  viral_gastroenteritis_rotavirus: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'severe_10_plus',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['vomiting', 'fever', 'dehydration'],
    mechanism: 'secretory',
    typicalDescription: 'Profuse watery diarrhoea in a young child with prominent vomiting. Stools are typically watery and non-bloody, with high risk of dehydration.',
  },

  viral_gastroenteritis_adenovirus: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['fever', 'vomiting', 'dehydration'],
    mechanism: 'secretory',
    typicalDescription: 'Watery diarrhoea lasting 1–2 weeks with mild vomiting and low-grade fever. More prolonged than typical viral gastroenteritis.',
  },

  viral_gastroenteritis_astrovirus: {
    duration: 'acute', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['fever', 'dehydration'],
    mechanism: 'secretory',
    typicalDescription: 'Mild watery diarrhoea in a young child with minimal vomiting. Illness is typically less severe than rotavirus or norovirus.',
  },

  viral_gastroenteritis_generic: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['vomiting', 'abdominal_pain', 'fever', 'dehydration'],
    mechanism: 'secretory',
    typicalDescription: 'Acute watery diarrhoea with vomiting and abdominal cramps. Non-bloody, self-limiting, with complete recovery within one week.',
  },

  // ── SECTION 2: BACTERIAL DIARRHOEA (8 nodes) ────────────────────────

  shigellosis: {
    duration: 'acute', stoolType: 'mixed', volume: 'small', frequency: 'severe_10_plus',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'mucus', 'tenesmus', 'dehydration'],
    mechanism: 'inflammatory',
    typicalDescription: 'Frequent small-volume bloody mucoid stools with high fever, severe abdominal cramps, and tenesmus. Classic bacillary dysentery presentation.',
  },

  salmonellosis: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'vomiting', 'dehydration'],
    mechanism: 'inflammatory',
    typicalDescription: 'Acute onset of watery (sometimes bloody) diarrhoea with fever and abdominal cramps after incubation period. Self-limiting but may cause bacteraemia in vulnerable hosts.',
  },

  campylobacter_enteritis: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'dehydration'],
    mechanism: 'inflammatory',
    typicalDescription: 'Acute diarrhoea with high fever and severe abdominal cramps, often with blood. Cramps can be severe enough to mimic other surgical conditions.',
  },

  etec_diarrhoea: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'dehydration'],
    mechanism: 'secretory',
    typicalDescription: 'Watery non-bloody diarrhoea in a traveller, often with mild cramps. Stools are profuse but without fever or systemic toxicity.',
  },

  ehec_diarrhoea: {
    duration: 'acute', stoolType: 'bloody', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'blood', 'vomiting', 'dehydration'],
    mechanism: 'inflammatory',
    typicalDescription: 'Acute onset of bloody diarrhoea with severe abdominal cramps but often no fever. Stools are blood-streaked and may initially be watery before becoming frankly bloody.',
  },

  cholera: {
    duration: 'acute', stoolType: 'watery', volume: 'massive', frequency: 'continuous',
    relationToFood: 'persists_despite_fasting', nocturnal: 'yes',
    associatedSymptoms: ['vomiting', 'dehydration'],
    mechanism: 'secretory',
    typicalDescription: 'Massive, painless watery diarrhoea — classic rice-water stools. Volume loss is dramatic with rapid dehydration. Minimal abdominal pain.',
  },

  staph_food_poisoning: {
    duration: 'acute', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['vomiting', 'abdominal_pain'],
    mechanism: 'secretory',
    typicalDescription: 'Acute onset of prominent vomiting and diarrhoea within hours of eating contaminated food. Vomiting is the dominant symptom. Rapidly self-limiting.',
  },

  bacillus_cereus_diarrhoea: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'dehydration'],
    mechanism: 'secretory',
    typicalDescription: 'Watery diarrhoea with abdominal cramps starting 8–16 hours after eating contaminated food. Vomiting is less prominent than the staph form.',
  },

  // ── SECTION 3: ANTIBIOTIC-ASSOCIATED (2 nodes) ──────────────────────

  c_diff_colitis: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'severe_10_plus',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['fever', 'abdominal_pain', 'mucus', 'dehydration'],
    mechanism: 'inflammatory',
    typicalDescription: 'Watery diarrhoea starting during or after antibiotic treatment, often with lower abdominal cramps and systemic symptoms. Stools may be mucoid.',
  },

  aad_generic: {
    duration: 'acute', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain'],
    mechanism: 'osmotic',
    typicalDescription: 'Mild watery diarrhoea during or after antibiotic use. Stools are non-bloody and not associated with systemic symptoms.',
  },

  // ── SECTION 4: PARASITIC (7 nodes) ──────────────────────────────────

  giardiasis: {
    duration: 'persistent', stoolType: 'fatty_steatorrhea', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'weight_loss'],
    mechanism: 'malabsorptive',
    typicalDescription: 'Foul-smelling, greasy, floating stools with bloating and upper abdominal cramps. Diarrhoea is persistent and worse after eating. Classic steatorrhoea.',
  },

  amoebic_dysentery: {
    duration: 'acute', stoolType: 'mixed', volume: 'small', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'blood', 'mucus', 'tenesmus'],
    mechanism: 'inflammatory',
    typicalDescription: 'Bloody mucoid stools with tenesmus and lower abdominal pain but relatively little fever. Stools resemble anchovy paste.',
  },

  cryptosporidiosis: {
    duration: 'persistent', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'],
    mechanism: 'mixed',
    typicalDescription: 'Profuse watery diarrhoea lasting 1–3 weeks with abdominal cramps. In immunocompromised patients, can become chronic and life-threatening.',
  },

  cyclospora_diarrhoea: {
    duration: 'persistent', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'],
    mechanism: 'mixed',
    typicalDescription: 'Prolonged watery diarrhoea with profound fatigue and weight loss. Often has a relapsing pattern if untreated.',
  },

  strongyloides_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'weight_loss'],
    mechanism: 'mixed',
    typicalDescription: 'Chronic watery diarrhoea with epigastric pain and weight loss. May have intermittent symptoms due to autoinfection cycle.',
  },

  hookworm_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain'],
    mechanism: 'mixed',
    typicalDescription: 'Mild chronic diarrhoea with epigastric discomfort. Anaemia is often the dominant clinical feature.',
  },

  trichuriasis: {
    duration: 'chronic', stoolType: 'mucoid', volume: 'small', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'blood', 'mucus', 'tenesmus'],
    mechanism: 'inflammatory',
    typicalDescription: 'Chronic mucoid diarrhoea with tenesmus and rectal pain. Heavy infections cause dysentery-like picture with bloody mucoid stools.',
  },

  // ── SECTION 5: INFLAMMATORY BOWEL DISEASE (4 nodes) ─────────────────

  ulcerative_colitis_diarrhoea: {
    duration: 'chronic', stoolType: 'mixed', volume: 'small', frequency: 'severe_10_plus',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['blood', 'mucus', 'tenesmus', 'abdominal_pain', 'weight_loss', 'arthritis'],
    mechanism: 'inflammatory',
    typicalDescription: 'Chronic relapsing bloody mucoid diarrhoea with urgency and tenesmus. Nocturnal symptoms are characteristic, distinguishing from functional disorders.',
  },

  crohns_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'weight_loss', 'fever', 'arthritis'],
    mechanism: 'inflammatory',
    typicalDescription: 'Chronic diarrhoea with right lower quadrant pain, weight loss, and fatigue. Stools may be watery or semiformed. Perianal disease and fistulae are distinguishing features.',
  },

  microscopic_colitis: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'severe_10_plus',
    relationToFood: 'improves_with_fasting', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'],
    mechanism: 'mixed',
    typicalDescription: 'Chronic watery, non-bloody diarrhoea with nocturnal symptoms and urgency. Diarrhoea may be dramatically improved by fasting. Associated with NSAID and PPI use.',
  },

  toxic_megacolon_diarrhoea: {
    duration: 'acute', stoolType: 'mixed', volume: 'small', frequency: 'variable',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'dehydration'],
    mechanism: 'inflammatory',
    typicalDescription: 'Initial profuse bloody diarrhoea that may decrease as colonic dilation and ileus develop. High fever, severe abdominal pain, and distension signal impending catastrophe.',
  },

  // ── SECTION 6: MALABSORPTION (5 nodes) ──────────────────────────────

  celiac_disease_diarrhoea: {
    duration: 'chronic', stoolType: 'fatty_steatorrhea', volume: 'large', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'weight_loss'],
    mechanism: 'malabsorptive',
    typicalDescription: 'Chronic steatorrhoea with pale, bulky, foul-smelling stools that float. Worse after gluten ingestion, improves with fasting. Associated with bloating, weight loss, and anaemia.',
  },

  tropical_sprue: {
    duration: 'chronic', stoolType: 'fatty_steatorrhea', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'weight_loss'],
    mechanism: 'malabsorptive',
    typicalDescription: 'Chronic diarrhoea with steatorrhoea in a tropical resident or traveller. Associated with progressive weight loss, anaemia, and nutritional deficiencies.',
  },

  whipple_disease: {
    duration: 'chronic', stoolType: 'fatty_steatorrhea', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'weight_loss', 'arthritis'],
    mechanism: 'malabsorptive',
    typicalDescription: 'Chronic steatorrhoea with dramatic weight loss and migratory arthralgias. A rare but important treatable cause of malabsorption.',
  },

  chronic_pancreatitis_diarrhoea: {
    duration: 'chronic', stoolType: 'fatty_steatorrhea', volume: 'large', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'weight_loss'],
    mechanism: 'malabsorptive',
    typicalDescription: 'Chronic steatorrhoea with bulky, greasy, foul-smelling stools that float and are difficult to flush. Often accompanied by epigastric pain radiating to the back.',
  },

  cystic_fibrosis_diarrhoea: {
    duration: 'chronic', stoolType: 'fatty_steatorrhea', volume: 'large', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['weight_loss'],
    mechanism: 'malabsorptive',
    typicalDescription: 'Chronic steatorrhoea in a child with known cystic fibrosis. Stools are greasy, bulky, and foul-smelling despite pancreatic enzyme therapy if non-compliant.',
  },

  // ── SECTION 7: FUNCTIONAL (2 nodes) ─────────────────────────────────

  ibs_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'variable',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'mucus'],
    mechanism: 'dysmotility',
    typicalDescription: 'Chronic relapsing diarrhoea with abdominal cramps that are relieved by defecation. Stools are typically small-volume and may contain mucus. Symptoms are never nocturnal — a key distinguishing feature.',
  },

  functional_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'variable',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['none'],
    mechanism: 'dysmotility',
    typicalDescription: 'Chronic painless passage of loose stools without nocturnal symptoms. No blood, no weight loss, no abdominal pain — the benign nature is the key feature.',
  },

  // ── SECTION 8: COLONIC (4 nodes) ────────────────────────────────────

  ischaemic_colitis_diarrhoea: {
    duration: 'acute', stoolType: 'bloody', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'blood'],
    mechanism: 'inflammatory',
    typicalDescription: 'Sudden onset of left-sided abdominal pain followed by bloody diarrhoea or passage of blood. The pain is often out of proportion to the degree of diarrhoea.',
  },

  radiation_colitis: {
    duration: 'chronic', stoolType: 'bloody', volume: 'small', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['blood', 'mucus', 'tenesmus'],
    mechanism: 'inflammatory',
    typicalDescription: 'Chronic bloody mucoid diarrhoea and tenesmus following pelvic radiation. Symptoms may begin months to years after treatment.',
  },

  cmv_colitis: {
    duration: 'persistent', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'weight_loss'],
    mechanism: 'inflammatory',
    typicalDescription: 'Watery or bloody diarrhoea in an immunocompromised patient with fever and lower abdominal pain. May be indistinguishable from C. diff or IBD without endoscopic biopsy.',
  },

  colorectal_cancer_diarrhoea: {
    duration: 'chronic', stoolType: 'mixed', volume: 'small', frequency: 'variable',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'blood', 'weight_loss'],
    mechanism: 'mixed',
    typicalDescription: 'Chronic change in bowel habit with alternating diarrhoea and constipation. Stools may contain blood. Weight loss and anaemia are associated red flags.',
  },

  // ── SECTION 9: SMALL BOWEL (3 nodes) ────────────────────────────────

  small_bowel_lymphoma: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'mild_3_5',
    relationToFood: 'worse_after_eating', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'weight_loss'],
    mechanism: 'malabsorptive',
    typicalDescription: 'Chronic watery diarrhoea with weight loss, night sweats, and colicky abdominal pain. B symptoms suggest underlying lymphoma.',
  },

  sibo_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'weight_loss'],
    mechanism: 'mixed',
    typicalDescription: 'Chronic diarrhoea with bloating and abdominal distension that worsens after eating. Stools may be watery or semiformed with some steatorrhoea. Improves with fasting.',
  },

  radiation_enteritis: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'weight_loss'],
    mechanism: 'malabsorptive',
    typicalDescription: 'Chronic diarrhoea after radiation therapy with malabsorption, weight loss, and cramping. Can be a debilitating late effect of cancer treatment.',
  },

  // ── SECTION 10: GASTRIC (2 nodes) ───────────────────────────────────

  dumping_syndrome: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'mild_3_5',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'palpitations'],
    mechanism: 'osmotic',
    typicalDescription: 'Watery diarrhoea immediately after meals (15–30 minutes) with cramping, sweating, and palpitations. Late phase causes hypoglycaemic symptoms. Occurs after gastric surgery.',
  },

  zollinger_ellison: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'weight_loss'],
    mechanism: 'mixed',
    typicalDescription: 'Chronic watery diarrhoea with epigastric burning, heartburn, and weight loss. Diarrhoea is due to acid-induced inactivation of pancreatic enzymes and direct mucosal injury.',
  },

  // ── SECTION 11: ENDOCRINE (5 nodes) ─────────────────────────────────

  hyperthyroid_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['weight_loss'],
    mechanism: 'dysmotility',
    typicalDescription: 'Chronic, mildly increased stool frequency without abdominal pain, blood, or mucus. Weight loss despite increased appetite is the key associated feature.',
  },

  addison_disease_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'weight_loss'],
    mechanism: 'mixed',
    typicalDescription: 'Chronic mild diarrhoea with vague abdominal pain, fatigue, weight loss, and hyperpigmentation. The diarrhoea is often overshadowed by other systemic features.',
  },

  diabetic_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'variable',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['dehydration'],
    mechanism: 'dysmotility',
    typicalDescription: 'Chronic watery diarrhoea, often nocturnal, in a patient with poorly controlled diabetes. May alternate with constipation and gastroparesis.',
  },

  vipoma: {
    duration: 'chronic', stoolType: 'watery', volume: 'massive', frequency: 'continuous',
    relationToFood: 'persists_despite_fasting', nocturnal: 'yes',
    associatedSymptoms: ['dehydration', 'weight_loss'],
    mechanism: 'secretory',
    typicalDescription: 'Massive secretory diarrhoea persisting despite fasting. Stool volume can exceed 3 L/day. Associated with hypokalaemia and flushing. The diarrhoea does not stop when the patient stops eating.',
  },

  carcinoid_syndrome_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'variable',
    relationToFood: 'worse_after_eating', nocturnal: 'yes',
    associatedSymptoms: ['flushing', 'palpitations', 'abdominal_pain'],
    mechanism: 'secretory',
    typicalDescription: 'Episodic watery diarrhoea triggered by alcohol or food, associated with facial flushing and palpitations. The flushing-diarrhoea combination is pathognomonic.',
  },

  // ── SECTION 12: METABOLIC (2 nodes) ─────────────────────────────────

  uraemic_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain'],
    mechanism: 'mixed',
    typicalDescription: 'Mild chronic diarrhoea with nausea and anorexia in a patient with advanced renal disease. May be bloody from uraemic colitis.',
  },

  amyloidosis_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['weight_loss'],
    mechanism: 'dysmotility',
    typicalDescription: 'Chronic diarrhoea with weight loss, autonomic dysfunction, and protein-losing enteropathy. Often accompanied by signs of multisystem disease including macroglossia and neuropathy.',
  },

  // ── SECTION 13: DRUG-INDUCED (1 node) ───────────────────────────────

  drug_induced_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain'],
    mechanism: 'osmotic',
    typicalDescription: 'Chronic mild diarrhoea temporally related to medication use (metformin, colchicine, PPIs, NSAIDs, etc.). Typically non-bloody and without nocturnal symptoms.',
  },

  // ── SECTION 14: HIV-RELATED (3 nodes) ───────────────────────────────

  hiv_enteropathy: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'],
    mechanism: 'mixed',
    typicalDescription: 'Chronic watery diarrhoea in an HIV-positive patient without identifiable pathogen. Wasting and weight loss are prominent. Improves with antiretroviral therapy.',
  },

  hiv_cryptosporidium: {
    duration: 'chronic', stoolType: 'watery', volume: 'massive', frequency: 'severe_10_plus',
    relationToFood: 'persists_despite_fasting', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'],
    mechanism: 'secretory',
    typicalDescription: 'Profuse, chronic watery diarrhoea in a profoundly immunocompromised HIV patient. Massive volumes cause severe dehydration and wasting. Does not improve with fasting.',
  },

  hiv_cmv_colitis: {
    duration: 'persistent', stoolType: 'bloody', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'weight_loss'],
    mechanism: 'inflammatory',
    typicalDescription: 'Bloody diarrhoea with high fever and severe abdominal pain in an AIDS patient with CD4 <50. Deep colonic ulcers carry high perforation risk.',
  },

  // ── SECTION 15: PAEDIATRIC (5 nodes) ────────────────────────────────

  nec_diarrhoea: {
    duration: 'acute', stoolType: 'bloody', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'worse_after_eating', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'blood'],
    mechanism: 'inflammatory',
    typicalDescription: 'Bloody stools in a preterm neonate with abdominal distension, feed intolerance, and systemic signs. A surgical emergency.',
  },

  hirschsprung_enterocolitis: {
    duration: 'acute', stoolType: 'bloody', volume: 'moderate', frequency: 'severe_10_plus',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'dehydration'],
    mechanism: 'inflammatory',
    typicalDescription: 'Explosive bloody diarrhoea in a neonate or infant with known Hirschsprung disease. Abdominal distension and fever indicate life-threatening enterocolitis.',
  },

  cow_milk_protein_allergy: {
    duration: 'chronic', stoolType: 'bloody', volume: 'small', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'blood', 'mucus'],
    mechanism: 'inflammatory',
    typicalDescription: 'Chronic diarrhoea with blood and mucus in an infant, temporally related to cow milk ingestion. Colic and irritability are associated.',
  },

  congenital_enteropathy: {
    duration: 'chronic', stoolType: 'watery', volume: 'large', frequency: 'severe_10_plus',
    relationToFood: 'persists_despite_fasting', nocturnal: 'yes',
    associatedSymptoms: ['dehydration', 'weight_loss'],
    mechanism: 'secretory',
    typicalDescription: 'Intractable watery diarrhoea starting in the first days of life. Massive volumes persist despite fasting. Requires parenteral nutrition for survival.',
  },

  hsp_diarrhoea: {
    duration: 'acute', stoolType: 'bloody', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'blood', 'rash', 'arthritis'],
    mechanism: 'inflammatory',
    typicalDescription: 'Colicky abdominal pain with bloody diarrhoea, palpable purpura on legs/buttocks, and arthralgia. Classic triad of HSP in a child.',
  },

  // ── SECTION 16: TROPICAL (3 nodes) ─────────────────────────────────

  typhoid_diarrhoea: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'unrelated', nocturnal: 'yes',
    associatedSymptoms: ['fever', 'abdominal_pain'],
    mechanism: 'inflammatory',
    typicalDescription: 'Watery diarrhoea (or constipation) as part of a systemic febrile illness with step-ladder temperature pattern, headache, and abdominal pain. Classic rose spots may be present.',
  },

  intestinal_tuberculosis_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'yes',
    associatedSymptoms: ['fever', 'abdominal_pain', 'weight_loss'],
    mechanism: 'inflammatory',
    typicalDescription: 'Chronic diarrhoea with constitutional symptoms (fever, night sweats, weight loss) and right lower quadrant pain. Can mimic Crohn disease with strictures and fistulae.',
  },

  schistosomiasis_diarrhoea: {
    duration: 'chronic', stoolType: 'bloody', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'blood'],
    mechanism: 'inflammatory',
    typicalDescription: 'Chronic mild bloody diarrhoea with abdominal pain in a patient with freshwater exposure in an endemic area. Hepatosplenomegaly develops in advanced disease.',
  },

  // ── SECTION 17: RHEUMATOLOGICAL (2 nodes) ───────────────────────────

  scleroderma_diarrhoea: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain'],
    mechanism: 'dysmotility',
    typicalDescription: 'Chronic diarrhoea with bloating and distension in a patient with known systemic sclerosis. Secondary SIBO from small intestinal dysmotility is a major contributor.',
  },

  behcet_diarrhoea: {
    duration: 'chronic', stoolType: 'bloody', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'unrelated', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'blood', 'arthritis'],
    mechanism: 'inflammatory',
    typicalDescription: 'Chronic relapsing diarrhoea with right lower quadrant pain and oral/genital ulcers. Deep ileocaecal ulcers carry perforation risk mimicking Crohn disease.',
  },

  // ── SECTION 18: SURGICAL (2 nodes) ──────────────────────────────────

  short_bowel_syndrome: {
    duration: 'chronic', stoolType: 'watery', volume: 'large', frequency: 'severe_10_plus',
    relationToFood: 'worse_after_eating', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'],
    mechanism: 'malabsorptive',
    typicalDescription: 'High-volume watery diarrhoea after extensive small bowel resection. Malabsorption of nutrients, fluids, and electrolytes requires aggressive replacement therapy.',
  },

  bile_acid_malabsorption: {
    duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'yes',
    associatedSymptoms: ['abdominal_pain'],
    mechanism: 'secretory',
    typicalDescription: 'Chronic watery diarrhoea often following ileal resection, cholecystectomy, or in Crohn disease. Diarrhoea is typically postprandial and may be accompanied by urgency.',
  },

  // ── SECTION 19: FOOD INTOLERANCE (2 nodes) ──────────────────────────

  lactose_intolerance_diarrhoea: {
    duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain'],
    mechanism: 'osmotic',
    typicalDescription: 'Watery diarrhoea, bloating, and cramps starting 30 minutes to 2 hours after consuming dairy. Self-limiting. Improves with fasting and resolves with dairy elimination.',
  },

  food_allergy_diarrhoea: {
    duration: 'acute', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5',
    relationToFood: 'worse_after_eating', nocturnal: 'no',
    associatedSymptoms: ['abdominal_pain', 'rash', 'vomiting'],
    mechanism: 'mixed',
    typicalDescription: 'Acute diarrhoea with vomiting and abdominal pain shortly after ingestion of an allergenic food. May be accompanied by urticaria, angioedema, or respiratory symptoms.',
  },
};

export function getDiarrhoeaDiseaseIds(): string[] {
  return Object.keys(DIARRHOEA_MANIFESTATIONS);
}

export function getDiarrhoeaManifestation(diseaseId: string): DiarrhoeaManifestation | undefined {
  return DIARRHOEA_MANIFESTATIONS[diseaseId];
}

export function hasDiarrhoeaManifestation(diseaseId: string): boolean {
  return diseaseId in DIARRHOEA_MANIFESTATIONS;
}
