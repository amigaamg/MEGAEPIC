/**
 * HPI Rules Engine — Integration Test
 * Run: npx tsx lib/history-engine/hpi-engine/__tests__/hpi-engine-test.ts
 */
import { createHpiEngine, addChiefComplaint, addAssociatedSymptom, recordAnswerAndAdvance, getEngineOutput } from '../index';

const engine = createHpiEngine('encounter-001');

// 1. Add primary complaint: Abdominal Pain
console.log('=== STAGE 1: ADD PRIMARY COMPLAINT ===');
let state = addChiefComplaint(engine, 'pain', 'Abdominal Pain', 'My stomach has been hurting', true, 0);
console.log(`Status: ${state.status}`);
console.log(`Primary: ${state.primarySymptomId}`);
console.log(`Questions generated: ${state.questions.length}`);

// 2. Answer questions about the pain
console.log('\n=== STAGE 2: ANSWER PAIN QUESTIONS ===');
const painQuestions = state.questions.filter(q => !q.answered);
for (const q of painQuestions.slice(0, 5)) {
  const answers: Record<string, any> = {
    pain_location: 'lower abdomen',
    pain_onset: 'gradual',
    pain_duration: '3 days',
    pain_course: 'worsening',
    pain_severity: 6,
    pain_character: 'colicky then constant',
    pain_timing: 'constant',
    pain_24h_trend: 'worse',
    pain_aggravating: 'eating',
    pain_radiation: 'none',
  };
  const answer = answers[q.fieldId] || 'yes';
  const output = recordAnswerAndAdvance(state, q.id, answer);
  state = output.state;
  console.log(`  Q: ${q.text} → ${answer}`);
}

console.log(`\nStatus: ${state.status}`);
console.log(`Questions remaining: ${state.questions.filter(q => !q.answered).length}`);

// 3. Add associated symptom: Vomiting
console.log('\n=== STAGE 3: ADD ASSOCIATED SYMPTOM ===');
state = addAssociatedSymptom(state, 'vomiting', 'Vomiting', 'I have been vomiting', undefined, 'after', 1);
console.log(`Status: ${state.status}`);
console.log(`Total symptoms: ${state.symptoms.length}`);

// 4. Answer vomiting questions
console.log('\n=== STAGE 4: ANSWER VOMITING QUESTIONS ===');
const vomitQuestions = state.questions.filter(q => !q.answered && q.symptomId === state.currentSymptomId);
for (const q of vomitQuestions.slice(0, 5)) {
  const answers: Record<string, any> = {
    vomiting_onset: '2 days ago',
    vomiting_frequency: 4,
    vomiting_content: 'bilious',
    vomiting_relation_to_food: 'after_eating',
    vomiting_nausea_precedes: true,
    vomiting_hematemesis: false,
    vomiting_bilious: true,
    vomiting_faeculent: false,
    vomiting_ability_to_tolerate: false,
  };
  const answer = answers[q.fieldId] || 'yes';
  const output = recordAnswerAndAdvance(state, q.id, answer);
  state = output.state;
  console.log(`  Q: ${q.text} → ${answer}`);
}

// 5. Add associated symptom: Distension
console.log('\n=== STAGE 5: ADD DISTENSION ===');
state = addAssociatedSymptom(state, 'distension', 'Abdominal Distension', 'My belly is swollen', undefined, 'after', 2);

const distQuestions = state.questions.filter(q => !q.answered && q.symptomId === state.currentSymptomId);
for (const q of distQuestions.slice(0, 5)) {
  const answers: Record<string, any> = {
    distension_onset: '3 days ago',
    distension_course: 'rapidly_progressive',
    distension_rate: 'days',
    distension_visible_peristalsis: false,
    distension_flatus: false,
    distension_bowel_movement: '5 days ago',
    distension_previous_similar: true,
    distension_pain_relation: 'pain_before_distension',
  };
  const answer = answers[q.fieldId] || 'yes';
  const output = recordAnswerAndAdvance(state, q.id, answer);
  state = output.state;
  console.log(`  Q: ${q.text} → ${answer}`);
}

// 6. Add associated symptom: Constipation
console.log('\n=== STAGE 6: ADD CONSTIPATION ===');
state = addAssociatedSymptom(state, 'constipation', 'Constipation', 'I cannot open my bowels', undefined, 'after', 0);

const constipQuestions = state.questions.filter(q => !q.answered && q.symptomId === state.currentSymptomId);
for (const q of constipQuestions.slice(0, 5)) {
  const answers: Record<string, any> = {
    constipation_duration: '5 days',
    constipation_last_bm: '5 days ago',
    constipation_completeness: 'complete_no_stool',
    constipation_prior_habit: 'daily',
    constipation_blood: false,
    constipation_previous_similar: false,
  };
  const answer = answers[q.fieldId] || 'yes';
  const output = recordAnswerAndAdvance(state, q.id, answer);
  state = output.state;
  console.log(`  Q: ${q.text} → ${answer}`);
}

// 7. Show final engine output
console.log('\n=== FINAL ENGINE OUTPUT ===');
const output = getEngineOutput(state);
console.log('\nACTIVE DIFFERENTIALS:');
for (const dx of output.activeDifferentials) {
  console.log(`  ${dx.name}: ${dx.probability}% (supported: ${dx.supporting.length}, opposed: ${dx.opposing.length})`);
}

console.log('\nCOMPLETENESS:');
console.log(`  All passed: ${output.completeness.allPassed}`);
console.log(`  Blocking: ${output.completeness.blockingCount}`);
console.log(`  Warnings: ${output.completeness.warningsCount}`);

console.log('\nNARRATIVE:');
console.log(output.narrative);

console.log('\nTIMELINE:');
for (const event of output.timeline) {
  console.log(`  Day ${event.relativeDay}: ${event.label}`);
}
