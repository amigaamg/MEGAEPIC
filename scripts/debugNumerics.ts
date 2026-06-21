// Debug the numerical underflow: trace exactly what happens during computeDdxUpdate
import { createSession, processAnswer } from '../lib/amexan/reasoning/encounterOrchestrator';
import { FEATURES } from '../lib/amexan/knowbase/features/featureLibrary';
import { computeDdxUpdate } from '../lib/amexan/reasoning/bayesianEngine';
import { getMergedDiseaseMap, getActiveHighways } from '../lib/amexan/highways/abdominalPain';

const symptomId = 'abdominal_pain';
const complaintText = 'severe abdominal pain, vomiting, not passed gas or stool for 2 days';

// Create session
const session = createSession(symptomId, complaintText, 65, 'male', '3 days', [], '');

console.log('Initial state:');
showTop(session);

// Answer questions one by one, checking after each that probabilities are valid
const answers = [
  { fid: 'pain_onset', val: 'Gradual over hours' },
  { fid: 'pain_initial_location', val: 'Periumbilical (around the navel)' },
  { fid: 'pain_character', val: 'Cramping — comes in waves' },
  { fid: 'pain_severity', val: 9 },
  { fid: 'syncope', val: false },
  { fid: 'pain_location_now', val: 'Diffuse — whole abdomen' },
  { fid: 'nausea', val: true },
  { fid: 'vomiting', val: true },
  { fid: 'vomiting_timing', val: 'After the pain began' },
  { fid: 'vomiting_description', val: 'Bilious (yellow-green fluid)' },
  { fid: 'vomiting_frequency', val: 'Multiple times per hour' },
  { fid: 'anorexia', val: true },
  { fid: 'fever', val: true },
  { fid: 'bowel_habits', val: 'No stool or gas (obstipation)' },
  { fid: 'obstipation', val: true },
  { fid: 'abdominal_distension', val: true },
  { fid: 'distension_onset', val: 'Developed over 1-2 days' },
  { fid: 'distension_progression', val: 'Progressive worsening' },
  { fid: 'distension_gas_passage_relief', val: false },
  { fid: 'peritonism', val: true },
  { fid: 'guarding', val: true },
  { fid: 'vomiting_relief', val: true },
  { fid: 'rebound_history', val: true },
  { fid: 'fever_chills', val: true },
  { fid: 'prior_abdominal_surgery', val: true },
  { fid: 'previous_similar_episodes', val: false },
  { fid: 'smoking', val: false },
];

let currentSession = session;
for (let i = 0; i < answers.length; i++) {
  const { fid, val } = answers[i];
  currentSession = processAnswer(currentSession, fid, val, FEATURES[fid]?.label || fid);
  
  // Check for NaN or 0 total probability
  const total = currentSession.state.ddx.activeCandidates.reduce((s: number, c: any) => s + c.currentProb, 0);
  const hasIO = currentSession.state.ddx.activeCandidates.find((c: any) => c.diseaseId === 'intestinal_obstruction');
  const ioProb = hasIO ? Math.round(hasIO.currentProb * 10000) / 100 : 0;
  
  console.log(`After ${fid} (${val}): totalProb=${total.toExponential(3)}, IO=${ioProb}%, count=${currentSession.state.ddx.activeCandidates.length}`);
  
  if (total === 0 || isNaN(total)) {
    console.log('  *** NUMERICAL FAILURE! ***');
    // Show raw candidate values
    for (const c of currentSession.state.ddx.activeCandidates) {
      console.log(`  ${c.diseaseId}: raw=${c.currentProb.toExponential(3)}` + (c.isRedFlagTriggered ? ' RF' : ''));
    }
    break;
  }
  
  // Also log when IO probability is suspicious
  if (hasIO && hasIO.currentProb > 0 && hasIO.currentProb < 0.001 && i > 15) {
    console.log(`  *** IO PROBABILITY DROPPING! raw=${hasIO.currentProb.toExponential(3)}`);
  }
}

function showTop(session: any) {
  const cs = session.state.ddx.activeCandidates.slice(0, 5);
  console.log(`Total candidates: ${session.state.ddx.activeCandidates.length}`);
  for (const c of cs) {
    console.log(`  ${c.diseaseId}: ${Math.round(c.currentProb * 100)}% (raw: ${c.currentProb.toExponential(3)})`);
  }
}
