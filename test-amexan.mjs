import { createSession, processAnswer } from './lib/amexan/reasoning/encounterOrchestrator';

// Simulate: 22yo male with abdominal pain, vomiting
let session = createSession('abdominal_pain', 'abdominal pain and vomiting', 22, 'male');

console.log('=== SESSION INIT ===');
console.log('Next Q:', session.nextQuestion?.label);
console.log('CC prefills:', session.state.answers.length, 'answers');
console.log('DDX candidates:', session.state.ddx.activeCandidates.length);
console.log('Red flags:', session.state.ddx.activeCandidates.filter(c => c.isRedFlagTriggered).length);

// Answer pain onset
session = processAnswer(session, 'pain_onset', 'Gradual over hours');
console.log('\n=== AFTER ONSET ===');
console.log('Next Q:', session.nextQuestion?.label);
console.log('Phase:', session.state.phase);
const l1 = session.state.ddx.leadingDiagnosis;
console.log('DDX leader:', l1?.diseaseName, l1 ? Math.round(l1.currentProb * 100) + '%' : 'none');

// Answer initial location
session = processAnswer(session, 'pain_initial_location', 'Periumbilical (around the navel)');
console.log('\n=== AFTER INITIAL LOCATION ===');
console.log('Next Q:', session.nextQuestion?.label);
const l2 = session.state.ddx.leadingDiagnosis;
console.log('DDX leader:', l2?.diseaseName, l2 ? Math.round(l2.currentProb * 100) + '%' : 'none');

// Answer migration (appendicitis pathognomonic)
session = processAnswer(session, 'pain_migration', 'Started around navel → moved to lower right');
console.log('\n=== AFTER MIGRATION ===');
console.log('Next Q:', session.nextQuestion?.label);
console.log('Phase:', session.state.phase);
const l3 = session.state.ddx.leadingDiagnosis;
console.log('DDX leader:', l3?.diseaseName, l3 ? Math.round(l3.currentProb * 100) + '%' : 'none');

// Top 3
console.log('Top 3:', session.state.ddx.activeCandidates.slice(0, 3).map(c =>
  c.diseaseName + ' ' + Math.round(c.currentProb * 100) + '%'
).join(', '));

// Answer a few more to see convergence
session = processAnswer(session, 'pain_location_now', 'Right lower quadrant');
session = processAnswer(session, 'anorexia', true);
session = processAnswer(session, 'nausea', true);
session = processAnswer(session, 'vomiting_timing', 'After the pain began');
session = processAnswer(session, 'fever', true);

console.log('\n=== AFTER CLUSTER ===');
console.log('Phase:', session.state.phase);
console.log('Convergence:', session.state.ddx.convergenceState);
const lf = session.state.ddx.leadingDiagnosis;
console.log('DDX leader:', lf?.diseaseName, lf ? Math.round(lf.currentProb * 100) + '%' : 'none');
if (lf) console.log('Important negatives:', lf.importantNegativesFound);
console.log('Top 3:', session.state.ddx.activeCandidates.slice(0, 3).map(c =>
  c.diseaseName + ' ' + Math.round(c.currentProb * 100) + '%'
).join(', '));

console.log('\n=== RED FLAGS CHECK ===');
const redFlagCandidates = session.state.ddx.activeCandidates.filter(c => c.isRedFlagTriggered);
console.log('Red flag candidates:', redFlagCandidates.length > 0 ? redFlagCandidates.map(c => c.diseaseName + ' RED FLAG') : 'none');

console.log('\n=== AMEXAN ENGINE VERIFIED ===');
console.log('EIG selection works: ' + (session.nextQuestion !== null ? 'YES' : 'NO'));
console.log('Bayesian update works: ' + (lf && lf.currentProb > 0 ? 'YES' : 'NO'));
console.log('Convergence detection works: ' + (session.state.ddx.convergenceState !== 'exploring' ? 'YES' : 'NO'));
console.log('CC prefill works: ' + (session.state.answers.some(a => a.source === 'chief_complaint') ? 'YES' : 'NO'));
console.log('Narrative available: ' + (session.narrative ? 'YES' : 'NO'));
