import { createSession, processAnswer } from './lib/amexan/reasoning/encounterOrchestrator';

let session = createSession('abdominal_pain', 'abdominal pain and vomiting', 22, 'male');

console.log('=== SESSION INIT ===');
console.log('Next Q:', session.nextQuestion?.label, '| id:', session.nextQuestion?.featureId);
console.log('EIG:', session.nextQuestion?.informationGain);

// Answer onset
session = processAnswer(session, 'pain_onset', 'Gradual over hours');
console.log('\n=== AFTER ONSET ===');
console.log('Next Q:', session.nextQuestion?.label, '| id:', session.nextQuestion?.featureId);
console.log('EIG:', session.nextQuestion?.informationGain);

// Let's see what the top EIG features are by probing the disease node features
const c = session.state.ddx.activeCandidates[0];
console.log('Leader:', c?.diseaseName, Math.round((c?.currentProb ?? 0) * 100) + '%');

// Answer initial location
session = processAnswer(session, 'pain_initial_location', 'Periumbilical (around the navel)');
console.log('\n=== AFTER LOCATION ===');
console.log('Next Q:', session.nextQuestion?.label, '| id:', session.nextQuestion?.featureId);
console.log('EIG:', session.nextQuestion?.informationGain);

// Manually check what features are available for appendicitis
const appendicitis = session.state.ddx.activeCandidates.find(c => c.diseaseId === 'acute_appendicitis');
console.log('Appendicitis prob:', Math.round((appendicitis?.currentProb ?? 0) * 100) + '%');
console.log('Evidence for:', appendicitis?.evidenceFor);
console.log('Evidence against:', appendicitis?.evidenceAgainst);

// List all unanswered features that could be asked
const answeredIds = new Set(session.state.answers.map(a => a.featureId));
console.log('\nAnswered so far:', Array.from(answeredIds).join(', '));
