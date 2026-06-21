// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN System Test: Intestinal Obstruction — Full Workflow Simulation
// Simulates the complete adaptive questioning via Bayesian EIG.
// ═══════════════════════════════════════════════════════════════════════════════

import { createSession, processAnswer } from '../lib/amexan/reasoning/encounterOrchestrator';
import { generateHpiNarrative } from '../lib/amexan/reasoning/narrativeEngine';
import { FEATURES } from '../lib/amexan/knowbase/features/featureLibrary';

const DIAGNOSIS_NAMES: Record<string, string> = {
  intestinal_obstruction: 'Intestinal Obstruction',
  acute_appendicitis: 'Acute Appendicitis',
  acute_cholecystitis: 'Acute Cholecystitis',
  acute_pancreatitis: 'Acute Pancreatitis',
  ectopic_pregnancy: 'Ectopic Pregnancy',
  perforated_peptic_ulcer: 'Perforated Peptic Ulcer',
  ureteric_colic: 'Ureteric Colic',
  pid: 'Pelvic Inflammatory Disease',
  gastroenteritis: 'Gastroenteritis',
  diverticulitis: 'Diverticulitis',
  ovarian_torsion: 'Ovarian Torsion',
  aaa_rupture: 'Ruptured AAA',
  mesenteric_ischaemia: 'Mesenteric Ischaemia',
  peptic_ulcer_disease: 'Peptic Ulcer Disease',
  meckel_diverticulitis: "Meckel's Diverticulitis",
  incarcerated_hernia: 'Incarcerated Hernia',
  strangulated_hernia: 'Strangulated Hernia',
  volvulus: 'Volvulus',
  intussusception: 'Intussusception',
  mesenteric_adenitis: 'Mesenteric Adenitis',
  gastric_outlet_obstruction: 'Gastric Outlet Obstruction',
  boerhaave: 'Boerhaave Syndrome',
  cholangitis: 'Cholangitis',
  hepatitis: 'Hepatitis',
  pancreatic_cancer: 'Pancreatic Cancer',
  splenic_infarct: 'Splenic Infarct',
  splenic_rupture: 'Splenic Rupture',
  alcoholic_hepatitis: 'Alcoholic Hepatitis',
  ibs: 'IBS',
  crohns_disease: "Crohn's Disease",
  ulcerative_colitis: 'Ulcerative Colitis',
  gastritis: 'Gastritis',
  food_poisoning: 'Food Poisoning',
  coeliac_disease: 'Coeliac Disease',
  constipation_simple: 'Constipation',
  endometriosis: 'Endometriosis',
  fibroids: 'Fibroids',
  ovarian_cyst_rupture: 'Ovarian Cyst Rupture',
  threatened_abortion: 'Threatened Abortion',
  placental_abruption: 'Placental Abruption',
  uterine_rupture: 'Uterine Rupture',
  pyelonephritis: 'Pyelonephritis',
  cystitis: 'Cystitis',
  testicular_torsion: 'Testicular Torsion',
  urinary_retention: 'Urinary Retention',
  aortic_dissection: 'Aortic Dissection',
  ischaemic_colitis: 'Ischaemic Colitis',
  dvt_pe: 'DVT / PE',
  inferior_mi: 'Inferior MI',
  pneumonia: 'Pneumonia',
  dka: 'DKA',
  porphyria: 'Porphyria',
  sickle_cell_crisis: 'Sickle Cell Crisis',
  addisonian_crisis: 'Adrenal Crisis',
  hypercalcaemia: 'Hypercalcaemia',
  typhoid: 'Typhoid Ileitis',
  amoebic_colitis: 'Amoebic Colitis',
  rectus_sheath_haematoma: 'Rectus Sheath Haematoma',
  herpes_zoster: 'Herpes Zoster',
  colon_cancer: 'Colon Cancer',
  henoch_schonlein_purpura: 'HSP',
  abdominal_tb: 'Abdominal TB',
  lead_poisoning: 'Lead Poisoning',
  gerd: 'GERD',
  esophagitis: 'Oesophagitis',
  achalasia: 'Achalasia',
  mallory_weiss: 'Mallory-Weiss Tear',
  functional_dyspepsia: 'Functional Dyspepsia',
  gastric_cancer: 'Gastric Cancer',
  liver_abscess: 'Liver Abscess',
  hcc: 'HCC',
  budd_chiari: 'Budd-Chiari',
  chronic_pancreatitis: 'Chronic Pancreatitis',
  pancreatic_pseudocyst: 'Pancreatic Pseudocyst',
  renal_abscess: 'Renal Abscess',
  hydronephrosis: 'Hydronephrosis',
  malaria: 'Malaria',
  dengue: 'Dengue',
  leptospirosis: 'Leptospirosis',
  brucellosis: 'Brucellosis',
  pericarditis: 'Pericarditis',
  nec: 'NEC',
  malrotation: 'Malrotation',
  hirschsprung: 'Hirschsprung',
  ascariasis: 'Ascariasis',
  functional_abdominal_pain: 'Functional Abdominal Pain',
  organophosphate: 'Organophosphate Poisoning',
  vasculitis_pan: 'PAN / Vasculitis',
};

interface TestCase {
  name: string;
  chiefComplaint: string;
  symptomId: string;
  age: number;
  sex: string;
  duration: string;
  answers: { featureId: string; value: string | boolean | string[]; label?: string }[];
}

function showDDX(session: any) {
  const candidates = session.state.ddx.activeCandidates;
  if (candidates.length === 0) { console.log('  (no candidates)'); return; }
  const leading = candidates[0];
  console.log(`  Leading: ${DIAGNOSIS_NAMES[leading.diseaseId] || leading.diseaseName} (${Math.round(leading.currentProb * 100)}%)`);

  // Show top 5
  for (let i = 0; i < Math.min(5, candidates.length); i++) {
    const c = candidates[i];
    const name = DIAGNOSIS_NAMES[c.diseaseId] || c.diseaseName;
    const prob = Math.round(c.currentProb * 100);
    const rf = c.isRedFlagTriggered ? ' ⚠️ RED FLAG' : '';
    const evFor = c.evidenceFor.length;
    const evAgainst = c.evidenceAgainst.length;
    console.log(`    ${i + 1}. ${name} — ${prob}% (evidence: +${evFor}/-${evAgainst})${rf}`);
  }
  console.log(`  Convergence: ${session.state.ddx.convergenceState}, Phase: ${session.state.phase}`);
}

function showNextQuestion(session: any) {
  const q = session.nextQuestion;
  if (!q) { console.log('  No more questions — HPI complete.'); return; }
  const feature = FEATURES[q.featureId];
  console.log(`  Next: ${q.label}`);
  if (q.options) console.log(`  Options: ${q.options.join(', ')}`);
  if (q.clinicalGuide) console.log(`  Guide: ${q.clinicalGuide}`);
  console.log(`  Rationale: ${q.rationale.substring(0, 120)}...`);
}

function runTestCase(tc: TestCase) {
  console.log('\n' + '═'.repeat(80));
  console.log(`║  ${tc.name}`);
  console.log('═'.repeat(80));
  console.log(`Chief Complaint: ${tc.chiefComplaint}`);
  console.log(`Patient: ${tc.age}y ${tc.sex}, Duration: ${tc.duration}`);
  console.log();

  // Create session
  const session = createSession(
    tc.symptomId,
    tc.chiefComplaint,
    tc.age,
    tc.sex,
    tc.duration,
    [],
    '',
  );

  console.log('=== INITIAL STATE (from CC pre-fills) ===');
  console.log(`Pre-filled answers: ${session.state.answers.length}`);
  for (const a of session.state.answers) {
    const f = FEATURES[a.featureId];
    console.log(`  ${f?.label || a.featureId}: ${a.value} (source: ${a.source})`);
  }
  showDDX(session);
  console.log();

  // Simulate answers
  let currentSession = session;
  for (let i = 0; i < tc.answers.length; i++) {
    const ans = tc.answers[i];
    const nextQ = currentSession.nextQuestion;
    const shouldAsk = nextQ && nextQ.featureId === ans.featureId;

    console.log(`--- Answer ${i + 1}: ${ans.featureId} = ${JSON.stringify(ans.value)} ${shouldAsk ? '(matches nextQuestion ✓)' : '(forced answer)'} ---`);

    currentSession = processAnswer(
      currentSession,
      ans.featureId,
      ans.value,
      ans.label || FEATURES[ans.featureId]?.label || ans.featureId,
    );

    showDDX(currentSession);
    if (i < tc.answers.length - 1 || !currentSession.isComplete) {
      showNextQuestion(currentSession);
    }
    console.log();
  }

  // Check if session is complete and show narrative
  if (currentSession.isComplete || currentSession.nextQuestion === null || tc.answers.length >= 12) {
    console.log('=== GENERATING HPI NARRATIVE ===');
    const narrative = currentSession.narrative || generateHpiNarrative(currentSession.state);
    console.log();
    if (narrative) {
      console.log(narrative.fullNarrative);
    } else {
      console.log('(narrative not generated — session not complete)');
    }
  }

  return currentSession;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST CASE 1: MALE — Complicated Intestinal Obstruction
// ═══════════════════════════════════════════════════════════════════════════════
const malePatient: TestCase = {
  name: 'MALE — Complicated Intestinal Obstruction (Strangulated with Peritonitis)',
  chiefComplaint: 'severe abdominal pain, vomiting, not passed gas or stool for 2 days',
  symptomId: 'abdominal_pain',
  age: 65,
  sex: 'male',
  duration: '3 days',
  answers: [
    // Triage phase
    { featureId: 'pain_onset', value: 'Gradual over hours' },
    { featureId: 'pain_initial_location', value: 'Periumbilical (around the navel)' },
    { featureId: 'pain_character', value: 'Cramping — comes in waves' },
    { featureId: 'pain_severity', value: 9 },
    { featureId: 'syncope', value: false },

    // Characterization phase — colicky pattern established
    { featureId: 'pain_location_now', value: 'Diffuse — whole abdomen' },
    { featureId: 'nausea', value: true },
    { featureId: 'vomiting', value: true },
    { featureId: 'vomiting_timing', value: 'After the pain began' },
    { featureId: 'vomiting_description', value: 'Bilious (yellow-green fluid)' },
    { featureId: 'vomiting_frequency', value: 'Multiple times per hour' },
    { featureId: 'anorexia', value: true },
    { featureId: 'fever', value: true },
    { featureId: 'bowel_habits', value: 'No stool or gas (obstipation)' },

    // Confirmation — obstruction-specific
    { featureId: 'obstipation', value: true },
    { featureId: 'abdominal_distension', value: true },
    { featureId: 'distension_onset', value: 'Developed over 1-2 days' },
    { featureId: 'distension_progression', value: 'Progressive worsening' },
    { featureId: 'distension_gas_passage_relief', value: false },

    // Peritonism — complicated
    { featureId: 'peritonism', value: true },
    { featureId: 'guarding', value: true },
    { featureId: 'vomiting_relief', value: true },
    { featureId: 'rebound_history', value: true },
    { featureId: 'fever_chills', value: true },

    // Risk factors
    { featureId: 'prior_abdominal_surgery', value: true },
    { featureId: 'previous_similar_episodes', value: false },
    { featureId: 'smoking', value: false },
    { featureId: 'nsaid_use', value: false },
    { featureId: 'alcohol_use', value: 'Occasional' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEST CASE 2: FEMALE — Intestinal Obstruction (Post-surgical adhesions)
// ═══════════════════════════════════════════════════════════════════════════════
const femalePatient: TestCase = {
  name: 'FEMALE — Intestinal Obstruction (Post-surgical adhesions, no peritonitis)',
  chiefComplaint: 'cramping abdominal pain, bloating, vomiting, cannot pass stool',
  symptomId: 'abdominal_pain',
  age: 45,
  sex: 'female',
  duration: '2 days',
  answers: [
    // Triage
    { featureId: 'pain_onset', value: 'Sudden over minutes' },
    { featureId: 'pain_initial_location', value: 'Periumbilical (around the navel)' },
    { featureId: 'pain_character', value: 'Cramping — comes in waves' },
    { featureId: 'pain_severity', value: 7 },
    { featureId: 'syncope', value: false },

    // Characterization
    { featureId: 'pain_location_now', value: 'Diffuse — whole abdomen' },
    { featureId: 'nausea', value: true },
    { featureId: 'vomiting', value: true },
    { featureId: 'vomiting_timing', value: 'After the pain began' },
    { featureId: 'vomiting_description', value: 'Bilious (yellow-green fluid)' },
    { featureId: 'vomiting_frequency', value: 'Every 1-2 hours' },
    { featureId: 'anorexia', value: true },
    { featureId: 'fever', value: false },
    { featureId: 'bowel_habits', value: 'No stool or gas (obstipation)' },

    // Confirmation
    { featureId: 'obstipation', value: true },
    { featureId: 'abdominal_distension', value: true },
    { featureId: 'distension_onset', value: 'Developed over 1-2 days' },
    { featureId: 'distension_site', value: 'Generalised — the whole abdomen' },

    // No peritonism — simple obstruction
    { featureId: 'peritonism', value: false },
    { featureId: 'guarding', value: false },
    { featureId: 'vomiting_relief', value: true },
    { featureId: 'rebound_history', value: false },
    { featureId: 'fever_chills', value: false },

    // Risk factors — previous surgery
    { featureId: 'prior_abdominal_surgery', value: true },
    { featureId: 'previous_similar_episodes', value: true },
    { featureId: 'smoking', value: false },
    { featureId: 'alcohol_use', value: 'None' },
    { featureId: 'last_menstrual_period', value: 'Normal — 2 weeks ago' },

    // GYN clearance
    { featureId: 'vaginal_bleeding', value: false },
    { featureId: 'vaginal_discharge', value: false },
    { featureId: 'dyspareunia', value: false },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Run both test cases
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════╗');
console.log('║        AMEXAN BAYESIAN DDX ENGINE — FULL SYSTEM TEST                      ║');
console.log('║        Intestinal Obstruction — Male & Female Workflows                   ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝');

console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
console.log('║  KNOWLEDGE GRAPH STATISTICS                                                ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
console.log(`Total features in library: ${Object.keys(FEATURES).length}`);
const featureTypes = new Map<string, number>();
for (const f of Object.values(FEATURES)) {
  featureTypes.set(f.type, (featureTypes.get(f.type) || 0) + 1);
}
for (const [type, count] of featureTypes) {
  console.log(`  ${type}: ${count}`);
}

const dfSymptoms = Object.values(FEATURES).filter(f => f.category === 'symptom').length;
const dfRisk = Object.values(FEATURES).filter(f => f.category === 'risk_factor').length;
const dfSigns = Object.values(FEATURES).filter(f => f.category === 'sign').length;
const dfInvestigations = Object.values(FEATURES).filter(f => f.category === 'investigation').length;
console.log(`  Symptoms: ${dfSymptoms}`);
console.log(`  Risk factors: ${dfRisk}`);
console.log(`  Signs: ${dfSigns}`);
console.log(`  Investigations: ${dfInvestigations}`);

// Show diseases that include Intestinal Obstruction
console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
console.log('║  INTESTINAL OBSTRUCTION DISEASE NODE                                      ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
console.log('ICD Code: K56');
console.log('System: Surgical — GI');
console.log('Acuity: Urgent (Tier 2)');
console.log('Age range: 1–90, Peak: 50–80');
console.log('Sex risk: Male 1.0×, Female 1.0×');
console.log('Background prevalence: 2%');
console.log();
console.log('Risk factors:');
console.log('  • Prior abdominal surgery: LR+ 5.0 (present in 60%)');
console.log('  • Known hernia: LR+ 4.0 (present in 20%)');
console.log();
console.log('Pathophysiology: Mechanical blockage → proximal bowel distension →');
console.log('  intramural pressure > venous pressure → congestion → ischaemia → perforation');
console.log();
console.log('Key discriminating features for Intestinal Obstruction:');
const obstructionFeatures = [
  'obstipation', 'abdominal_distension', 'vomiting', 'vomiting_timing',
  'vomiting_description', 'vomiting_frequency', 'pain_character',
  'bowel_habits', 'peritonism',
];
for (const fid of obstructionFeatures) {
  const f = FEATURES[fid];
  if (f) {
    console.log(`  • ${f.label} (${f.shortLabel})`);
    console.log(`      LR+: ${((f as any).LR_positive || 0).toFixed(2)}, LR−: ${((f as any).LR_negative || 0).toFixed(2)}`);
  }
}
console.log();
console.log('Complications:');
console.log('  • Strangulation (24–48h): peritonism + fever + pain change → emergency OR');
console.log('  • Perforation (48–72h): peritonism + rigidity → faecal peritonitis');
console.log('  • Red flags: peritonism, rigidity, fever_chills, syncope');

// Run test cases
const result1 = runTestCase(malePatient);
const result2 = runTestCase(femalePatient);

// Summary
console.log('\n' + '═'.repeat(80));
console.log('║  SUMMARY COMPARISON');
console.log('═'.repeat(80));
console.log();

function summarizeResult(session: any, label: string) {
  console.log(`--- ${label} ---`);
  console.log(`Questions asked: ${session.questionsAsked.length}`);
  console.log(`Answers recorded: ${session.state.answers.length}`);
  console.log(`Active highways: ${session.activeHighways.join(', ')}`);
  console.log(`Final convergence: ${session.state.ddx.convergenceState}`);
  console.log(`Final phase: ${session.state.phase}`);
  console.log(`HPI complete: ${session.isComplete}`);

  const candidates = session.state.ddx.activeCandidates;
  if (candidates.length > 0) {
    console.log(`Top 5 differential:`);
    for (let i = 0; i < Math.min(5, candidates.length); i++) {
      const c = candidates[i];
      const name = DIAGNOSIS_NAMES[c.diseaseId] || c.diseaseName;
      const prob = Math.round(c.currentProb * 100);
      const rf = c.isRedFlagTriggered ? ' ⚠️ RED FLAG' : '';
      console.log(`  ${i + 1}. ${name} — ${prob}%${rf}`);
    }
  }

  if (session.narrative) {
    console.log(`\nFull HPI Narrative:`);
    console.log(session.narrative.fullNarrative);
  }
  console.log();
}

summarizeResult(result1, 'MALE — Complicated Intestinal Obstruction');
summarizeResult(result2, 'FEMALE — Simple Intestinal Obstruction');
