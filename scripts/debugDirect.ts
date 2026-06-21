// DIRECT debug: trace every step inside processAnswer
import { createSession, processAnswer } from '../lib/amexan/reasoning/encounterOrchestrator';
import { computeDdxUpdate } from '../lib/amexan/reasoning/bayesianEngine';
import { getMergedDiseaseMap, getActiveHighways } from '../lib/amexan/highways/abdominalPain';

const symptomId = 'abdominal_pain';
const complaintText = 'severe abdominal pain, vomiting, not passed gas or stool for 2 days';

// Create session
const session = createSession(symptomId, complaintText, 65, 'male', '3 days', [], '');

// Check internal disease map
const highways = getActiveHighways(symptomId, complaintText);
console.log('Active highways:', highways.map((h: any) => h.id));
const dmap = getMergedDiseaseMap(highways);
console.log('Disease count in map:', dmap.size);
console.log('Has intestinal_obstruction:', dmap.has('intestinal_obstruction'));
console.log('IO sexRisk:', dmap.get('intestinal_obstruction')?.epidemiology.sexRisk);

// Answer a few key questions
let cur = session;

// Answer 1-14 exactly as the main test
const ans = [
  ['pain_onset', 'Gradual over hours'],
  ['pain_initial_location', 'Periumbilical (around the navel)'],
  ['pain_character', 'Cramping — comes in waves'],
  ['pain_severity', 9],
  ['syncope', false],
  ['pain_location_now', 'Diffuse — whole abdomen'],
  ['nausea', true],
  ['vomiting', true],
  ['vomiting_timing', 'After the pain began'],
  ['vomiting_description', 'Bilious (yellow-green fluid)'],
  ['vomiting_frequency', 'Multiple times per hour'],
  ['anorexia', true],
  ['fever', true],
  ['bowel_habits', 'No stool or gas (obstipation)'],
];

for (const [fid, val] of ans) {
  cur = processAnswer(cur, fid, val, fid);
}

console.log('\nAfter 14 answers:');
cur.state.ddx.activeCandidates.slice(0, 5).forEach((c: any) => {
  console.log(`  ${c.diseaseId}: ${c.currentProb} (prior: ${c.priorProb})`);
});

// Now answer obstipation
cur = processAnswer(cur, 'obstipation', true, 'obstipation');
console.log('\nAfter obstipation:');
cur.state.ddx.activeCandidates.slice(0, 5).forEach((c: any) => {
  console.log(`  ${c.diseaseId}: ${c.currentProb.toExponential(3)} (prior: ${c.priorProb})`);
});

// Answer peritonism
cur = processAnswer(cur, 'peritonism', true, 'peritonism');
console.log('\nAfter peritonism:');
cur.state.ddx.activeCandidates.slice(0, 5).forEach((c: any) => {
  console.log(`  ${c.diseaseId}: ${c.currentProb} (prior: ${c.priorProb})`);
});

// Now answer the rest that we know cause the bug
const more = [
  ['abdominal_distension', true],
  ['distension_onset', 'Developed over 1-2 days'],
  ['distension_progression', 'Progressive worsening'],
  ['distension_gas_passage_relief', false],
  ['guarding', true],
  ['vomiting_relief', true],
  ['rebound_history', true],
  ['fever_chills', true],
  ['prior_abdominal_surgery', true],
  ['previous_similar_episodes', false],
];

console.log('\n--- Answering more ---');
for (const [fid, val] of more) {
  cur = processAnswer(cur, fid, val, fid);
  const io = cur.state.ddx.activeCandidates.find((c: any) => c.diseaseId === 'intestinal_obstruction');
  const top = cur.state.ddx.activeCandidates[0];
  console.log(`After ${fid}: IO=${io ? io.currentProb.toExponential(4) : 'N/A'}, top=${top?.diseaseId}(${(top?.currentProb || 0).toExponential(4)}), total=${cur.state.ddx.activeCandidates.reduce((s:number,c:any)=>s+c.currentProb,0).toExponential(4)}`);
}

console.log('\n--- NOW ANSWER SMOKING ---');
const prevTotal = cur.state.ddx.activeCandidates.reduce((s: number, c: any) => s + c.currentProb, 0);
console.log('Total before smoking:', prevTotal.toExponential(4));
const ioBefore = cur.state.ddx.activeCandidates.find((c: any) => c.diseaseId === 'intestinal_obstruction');
console.log('IO before:', ioBefore?.currentProb);

cur = processAnswer(cur, 'smoking', false, 'smoking');

const total = cur.state.ddx.activeCandidates.reduce((s: number, c: any) => s + c.currentProb, 0);
console.log('Total after smoking:', total.toExponential(4));
if (total === 0) {
  console.log('ALL ZERO! Checking candidates:');
  cur.state.ddx.activeCandidates.slice(0, 3).forEach((c: any) => {
    console.log(`  ${c.diseaseId}: ${c.currentProb}, prior:${c.priorProb}`);
  });
}
