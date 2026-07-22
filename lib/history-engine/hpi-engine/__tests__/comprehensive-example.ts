/**
 * Comprehensive Example — Full Encounter Flow
 * Run: npx tsx lib/history-engine/hpi-engine/__tests__/comprehensive-example.ts
 *
 * Simulates a complete clinical encounter from Registration → Chief Complaint
 * → HPI → Documentation, showing real-time narrative evolution at each step.
 */
import {
  createHpiEngine, addChiefComplaint, addAssociatedSymptom,
  recordAnswerAndAdvance, advanceStage, getEngineOutput,
} from '../index';

function header(text: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`  ${text}`);
  console.log(`${'='.repeat(80)}`);
}

function section(text: string) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${text}`);
  console.log(`${'─'.repeat(60)}`);
}

function printOutput(output: any) {
  console.log(`  Stage: ${output.state.status.replace(/_/g, ' ')}`);
  console.log(`  Questions remaining: ${output.questionsRemaining}`);
  console.log(`  Active DDx: ${output.activeDifferentials.filter((d: any) => !d.isExcluded).length}`);
  if (output.activeDifferentials.length > 0) {
    console.log(`  Top differentials:`);
    output.activeDifferentials.filter((d: any) => !d.isExcluded).sort((a: any, b: any) => b.probability - a.probability).slice(0, 5).forEach((d: any) => {
      console.log(`    • ${d.name}: ${d.probability.toFixed(1)}%`);
    });
  }
  if (output.timeline.length > 0) {
    console.log(`  Timeline events: ${output.timeline.length}`);
  }
  if (output.narrative) {
    console.log(`\n  ┌─ NARRATIVE (${output.narrative.split('\n').length} lines) ──────────────────`);
    console.log(output.narrative);
    console.log(`  └──────────────────────────────────────────────`);
  }
  if (output.nextQuestion) {
    console.log(`\n  ▶ Next question: ${output.nextQuestion.text}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  ENCOUNTER START
// ═══════════════════════════════════════════════════════════════════════════

header('AMEXAN CLINICAL ENCOUNTER — COMPREHENSIVE DEMONSTRATION');
console.log(`  Patient: Mary Akinyi Ochieng`);
console.log(`  Age/Sex: 34 years, Female`);
console.log(`  Occupation: Teacher`);
console.log(`  Residence: Nairobi, Kibera`);
console.log(`  Department: Emergency`);
console.log(`  Informant: Self (reliable)`);

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 1: REGISTRATION (Biodata + Context Activators)
// ═══════════════════════════════════════════════════════════════════════════

header('STEP 1: REGISTRATION — Biodata & Context');
console.log(`  Rule PAT-0001: Name → Mary Akinyi Ochieng`);
console.log(`  Rule PAT-0002: Age → 34 years → Adult pathway activated`);
console.log(`  Rule PAT-0003: Sex → Female → Gynaecological context available`);
console.log(`  Rule PAT-0004: Occupation → Teacher → No occupational hazard flagged`);
console.log(`  Rule PAT-0005: Residence → Nairobi, Kibera → Urban setting`);
console.log(`  Rule PAT-0006: Informant → Self → Reliable historian`);
console.log(`  Rule PAT-0007: Department → Emergency → High-acuity context`);
console.log(`  Context activators: Adult, Female, Non-pregnant, Emergency`);
console.log(`\n  Documentation Preview (right panel):`);
console.log(`    ┌─────────────────────────────────────────────┐`);
console.log(`    │ Patient: Mary Akinyi Ochieng                │`);
console.log(`    │ 34 yrs · Female · Teacher · Nairobi         │`);
console.log(`    │─────────────────────────────────────────────│`);
console.log(`    │ Chief Complaint: Pending                    │`);
console.log(`    │ HPI Narrative: Pending                      │`);
console.log(`    │ Differentials: None yet                     │`);
console.log(`    │ Timeline: Empty                             │`);
console.log(`    └─────────────────────────────────────────────┘`);

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 2: CHIEF COMPLAINT
// ═══════════════════════════════════════════════════════════════════════════

header('STEP 2: CHIEF COMPLAINT');
console.log(`  Patient says: "My stomach has been hurting for 3 days"`);
console.log(`  Rule CC-0001: Mapped to concept → abdominal_pain`);
console.log(`  Rule CC-0003: Duration → 3 days → Acute presentation`);
console.log(`  Rule CC-0007: Chronology → Primary complaint (index = 0)`);
console.log(`\n  Patient adds: "I have been vomiting"`);
console.log(`  Rule CC-0002: Mapped to concept → nausea_vomiting`);
console.log(`  Rule CC-0008: Relationship → Associated with primary`);
console.log(`\n  Patient adds: "My belly is swollen"`);
console.log(`  Rule CC-0002: Mapped to concept → distension`);
console.log(`\n  Patient adds: "I cannot open my bowels"`);
console.log(`  Rule CC-0002: Mapped to concept → constipation`);
console.log(`\n  Chronological timeline:`);
console.log(`    Day 0: Abdominal pain (primary complaint)`);
console.log(`    Day 1: Vomiting (after pain started)`);
console.log(`    Day 2: Distension (progressive)`);
console.log(`    Day 0: Constipation (since pain began)`);
console.log(`\n  Documentation Preview (right panel):`);
console.log(`    ┌─────────────────────────────────────────────┐`);
console.log(`    │ CC: abdominal pain (3d) · vomiting ·        │`);
console.log(`    │     distension · constipation               │`);
console.log(`    │─────────────────────────────────────────────│`);
console.log(`    │ HPI: "My stomach has been hurting for 3     │`);
console.log(`    │ days... I have been vomiting... my belly is │`);
console.log(`    │ swollen... cannot open my bowels..."        │`);
console.log(`    │─────────────────────────────────────────────│`);
console.log(`    │ Differentials: Generating from symptoms...  │`);
console.log(`    └─────────────────────────────────────────────┘`);

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 3: HPI — Rules Engine in Action
// ═══════════════════════════════════════════════════════════════════════════

header('STEP 3: HPI — INFORMATION-GAP-DRIVEN QUESTION ENGINE');
console.log(`  Rule H0: HPI is ONE evolving story, not separate questionnaires`);
console.log(`  Rule H17: Every question is information-gap-driven`);
console.log(`  Rule H18: Highest-value question first (DDX-aware prioritization)`);
console.log(`  Rule H19: Never repeat a question`);
console.log(`  Rule H20: Remove resolved questions immediately`);
console.log(`  Rule H25: Stop only when all completeness criteria met`);

// Initialize engine
const engine = createHpiEngine('encounter-demo-001');
let state = engine;

section('Phase 1: Primary Symptom Expansion (Abdominal Pain)');
console.log(`  Adding primary complaint: Abdominal Pain`);
state = addChiefComplaint(state, 'pain', 'Abdominal Pain', 'My stomach has been hurting for 3 days', true, 0);
let output = getEngineOutput(state);
console.log(`  Status: ${state.status.replace(/_/g, ' ')}`);
console.log(`  Questions generated: ${state.questions.length}`);
printOutput(output);

section('Phase 2: Answering Pain Questions');
const qa_pairs: [string, string][] = [
  ['pain_location', 'lower abdomen'],
  ['pain_onset', 'gradual'],
  ['pain_duration', '3 days'],
  ['pain_course', 'worsening'],
  ['pain_severity', '7'],
  ['pain_character', 'colicky then constant'],
  ['pain_timing', 'constant'],
  ['pain_24h_trend', 'worse'],
];
for (const [fieldId, answer] of qa_pairs) {
  const q = state.questions.find(q => !q.answered && q.fieldId === fieldId);
  if (q) {
    output = recordAnswerAndAdvance(state, q.id, answer);
    state = output.state;
    console.log(`  ✓ ${q.text} → ${answer}`);
  }
}
printOutput(output);

section('Phase 3: Associated Discovery — Add Vomiting');
console.log(`  Adding associated symptom: Vomiting`);
state = addAssociatedSymptom(state, 'vomiting', 'Vomiting', 'I have been vomiting since yesterday', undefined, 'after', 1);
output = getEngineOutput(state);
console.log(`  Status: ${state.status.replace(/_/g, ' ')}`);
printOutput(output);

const vomit_qa: [string, string][] = [
  ['vomiting_onset', '2 days ago'],
  ['vomiting_frequency', '4 times per day'],
  ['vomiting_content', 'bilious'],
  ['vomiting_relation_to_food', 'after_eating'],
  ['vomiting_nausea_precedes', 'true'],
  ['vomiting_hematemesis', 'false'],
  ['vomiting_bilious', 'true'],
  ['vomiting_faeculent', 'false'],
  ['vomiting_ability_to_tolerate', 'orally_only_fluids'],
];
for (const [fieldId, answer] of vomit_qa) {
  const q = state.questions.find(q => !q.answered && q.fieldId === fieldId);
  if (q) {
    output = recordAnswerAndAdvance(state, q.id, answer);
    state = output.state;
    console.log(`  ✓ ${q.text} → ${answer}`);
  }
}
printOutput(output);

section('Phase 4: Add Distension');
state = addAssociatedSymptom(state, 'distension', 'Abdominal Distension', 'My belly is swollen and getting bigger', undefined, 'after', 2);
const dist_qa: [string, string][] = [
  ['distension_onset', 'progressive over days'],
  ['distension_course', 'rapidly_progressive'],
  ['distension_rate', 'noticeable over 2 days'],
  ['distension_visible_peristalsis', 'false'],
  ['distension_flatus', 'false'],
  ['distension_bowel_movement', '5 days ago'],
  ['distension_previous_similar', 'true'],
  ['distension_pain_relation', 'pain_before_distension'],
];
for (const [fieldId, answer] of dist_qa) {
  const q = state.questions.find(q => !q.answered && q.fieldId === fieldId);
  if (q) {
    output = recordAnswerAndAdvance(state, q.id, answer);
    state = output.state;
    console.log(`  ✓ ${q.text} → ${answer}`);
  }
}
printOutput(output);

section('Phase 5: Add Constipation');
state = addAssociatedSymptom(state, 'constipation', 'Constipation', 'I have not opened my bowels for 5 days', undefined, 'after', 0);
const constip_qa: [string, string][] = [
  ['constipation_duration', '5 days'],
  ['constipation_last_bm', '5 days ago'],
  ['constipation_completeness', 'complete_no_stool'],
  ['constipation_prior_habit', 'daily'],
  ['constipation_stool_consistency', 'normally_formed'],
  ['constipation_straining', 'true'],
  ['constipation_tenesmus', 'true'],
  ['constipation_abdominal_pain', 'true'],
  ['constipation_bloating', 'true'],
  ['constipation_obstipation', 'true_no_stool_absolutely'],
];
for (const [fieldId, answer] of constip_qa) {
  const q = state.questions.find(q => !q.answered && q.fieldId === fieldId);
  if (q) {
    output = recordAnswerAndAdvance(state, q.id, answer);
    state = output.state;
    console.log(`  ✓ ${q.text} → ${answer}`);
  }
}
printOutput(output);

section('Phase 6: Differential Coverage');
// Advance through stages
for (let i = 0; i < 5; i++) {
  if (state.status === 'complete') break;
  output = advanceStage(state);
  state = output.state;
  console.log(`  Advancing to: ${state.status.replace(/_/g, ' ')}`);
}
printOutput(output);

section('Phase 7: Risk Factor & Context');
const risk_qa: [string, string][] = [
  ['previous_similar_episodes', 'true'],
  ['previous_surgery', 'no prior surgeries'],
  ['chronic_constipation', 'true'],
  ['age_above_60', 'false'],
  ['gender_male', 'false'],
  ['previous_admissions', 'none'],
  ['diabetes', 'false'],
  ['hypertension', 'false'],
  ['weight_loss', 'none'],
];
for (const [fieldId, answer] of risk_qa) {
  const q = state.questions.find(q => !q.answered && q.fieldId === fieldId);
  if (q) {
    output = recordAnswerAndAdvance(state, q.id, answer);
    state = output.state;
    console.log(`  ✓ ${q.text} → ${answer}`);
  }
}

// Get final output
output = getEngineOutput(state);

// ═══════════════════════════════════════════════════════════════════════════
//  COMPREHENSIVE DOCUMENTATION OUTPUT
// ═══════════════════════════════════════════════════════════════════════════

header('COMPREHENSIVE DOCUMENTATION — AS SHOWN IN RIGHT PANEL');
console.log(`\n${'█'.repeat(76)}`);
console.log(`  RIGHT DOCUMENTATION PANEL (Live Preview)`);
console.log(`${'█'.repeat(76)}`);

console.log(`\n  ┌─ PATIENT ────────────────────────────────────────────`);
console.log(`  │ Name:    Mary Akinyi Ochieng`);
console.log(`  │ Age/Sex: 34 years, Female`);
console.log(`  │ Occ:     Teacher`);
console.log(`  │ Loc:     Nairobi, Kibera`);
console.log(`  │ Enc:     encounter-demo-001`);
console.log(`  └──────────────────────────────────────────────────────`);

console.log(`\n  ┌─ CHIEF COMPLAINT ─────────────────────────────────────`);
console.log(`  │ 1. Abdominal Pain — "My stomach has been hurting for 3 days"`);
console.log(`  │ 2. Vomiting — "I have been vomiting since yesterday"`);
console.log(`  │ 3. Distension — "My belly is swollen and getting bigger"`);
console.log(`  │ 4. Constipation — "I have not opened my bowels for 5 days"`);
console.log(`  └──────────────────────────────────────────────────────`);

console.log(`\n  ┌─ HPI NARRATIVE (Evolving) ───────────────────────────`);
console.log(`  │`);
const narrativeLines = output.narrative.split('\n');
for (const line of narrativeLines) {
  console.log(`  │ ${line}`);
}
console.log(`  │`);
console.log(`  └──────────────────────────────────────────────────────`);

console.log(`\n  ┌─ DIFFERENTIAL DIAGNOSES ──────────────────────────────`);
const sortedDdx = output.activeDifferentials.filter((d: any) => !d.isExcluded).sort((a: any, b: any) => b.probability - a.probability);
for (const d of sortedDdx) {
  const icon = d.probability >= 70 ? '🔴' : d.probability >= 40 ? '🟡' : '⚪';
  const bar = '█'.repeat(Math.round(d.probability / 5));
  const space = ' '.repeat(20 - Math.round(d.probability / 5));
  console.log(`  │ ${icon} ${d.name.padEnd(30)} ${(d.probability).toFixed(1).padStart(5)}% │${bar}${space}│`);
}
if (output.activeDifferentials.some((d: any) => d.isExcluded)) {
  console.log(`  │`);
  console.log(`  │ Excluded:`);
  output.activeDifferentials.filter((d: any) => d.isExcluded).forEach((d: any) => {
    console.log(`  │   ✕ ${d.name} — ${d.exclusionReason}`);
  });
}
console.log(`  └──────────────────────────────────────────────────────`);

console.log(`\n  ┌─ TIMELINE ────────────────────────────────────────────`);
const sortedTimeline = [...output.timeline].sort((a, b) => a.relativeDay - b.relativeDay);
let currentDay = -1;
for (const t of sortedTimeline) {
  if (t.relativeDay !== currentDay) {
    currentDay = t.relativeDay;
    console.log(`  │ Day ${currentDay}:`);
  }
  console.log(`  │   • ${t.label} — ${t.detail}`);
}
console.log(`  └──────────────────────────────────────────────────────`);

console.log(`\n  ┌─ ENGINE STATUS ───────────────────────────────────────`);
console.log(`  │ Stage:         ${state.status.replace(/_/g, ' ')}`);
console.log(`  │ Symptoms:      ${state.symptoms.length}`);
console.log(`  │ Questions:     ${output.questionsRemaining} remaining`);
console.log(`  │ Differentials: ${sortedDdx.length} active, ${output.activeDifferentials.filter((d: any) => d.isExcluded).length} excluded`);
console.log(`  │ Last updated:  ${new Date(state.lastUpdated).toLocaleTimeString()}`);
console.log(`  └──────────────────────────────────────────────────────`);

// ═══════════════════════════════════════════════════════════════════════════
//  FULL CLINICAL DOCUMENT (as generated at Documentation step)
// ═══════════════════════════════════════════════════════════════════════════

header('FULL CLINICAL DOCUMENTATION (as generated in Step 12: Documentation)');

console.log(`  HISTORY OF PRESENT ILLNESS`);
console.log(`  ${'─'.repeat(70)}`);
console.log(`  Mary Akinyi Ochieng is a 34-year-old female Teacher`);
console.log(`  presenting with abdominal pain, vomiting, distension,`);
console.log(`  and constipation.`);
console.log(``);
console.log(`  The patient reports a 3-day history of gradual-onset,`);
console.log(`  colicky then constant abdominal pain located in the`);
console.log(`  lower abdomen, rated 7/10 in severity. The pain is`);
console.log(`  constant and worsening.`);
console.log(``);
console.log(`  Since yesterday, she has been vomiting bilious fluid`);
console.log(`  approximately 4 times per day, occurring after meals.`);
console.log(`  There is no hematemesis or faeculent vomiting. She`);
console.log(`  can only tolerate oral fluids.`);
console.log(``);
console.log(`  Her abdomen has become progressively distended over`);
console.log(`  2 days, with no passage of flatus. She has not opened`);
console.log(`  her bowels for 5 days (obstipation). She reports similar`);
console.log(`  but milder episodes previously.`);
console.log(``);
console.log(`  She has chronic constipation but no prior surgeries,`);
console.log(`  no diabetes, and no hypertension. No weight loss.`);

console.log(``);
console.log(`  DIFFERENTIAL DIAGNOSES`);
console.log(`  ${'─'.repeat(70)}`);
sortedDdx.slice(0, 8).forEach((d: any, i: number) => {
  console.log(`  ${i + 1}. ${d.name} — ${d.probability.toFixed(1)}%`);
  if (d.supporting.length > 0) {
    console.log(`     Supporting: ${d.supporting.slice(0, 3).join(', ')}`);
  }
  if (d.opposing.length > 0) {
    console.log(`     Opposing: ${d.opposing.slice(0, 3).join(', ')}`);
  }
  console.log(`     Complications: ${d.complications.slice(0, 2).join(', ')}`);
  console.log(`     Risk factors: ${d.riskFactors.slice(0, 2).join(', ')}`);
  console.log(``);
});

console.log(`  MANAGEMENT CONSIDERATIONS`);
console.log(`  ${'─'.repeat(70)}`);
const topDx = sortedDdx[0];
if (topDx) {
  console.log(`  Leading diagnosis: ${topDx.name} (${topDx.probability.toFixed(1)}%)`);
  console.log(`  Rule-in: ${topDx.supporting.slice(0, 3).join(', ')}`);
  console.log(`  Rule-out: Screen for ${topDx.opposing.slice(0, 3).join(', ')}`);
  console.log(`  Complications to monitor:`);
  topDx.complications.forEach((c: string) => console.log(`    ⚠ ${c}`));
}
console.log(``);
console.log(`  Key LBO risk factors identified:`);
console.log(`    • Previous similar episodes (suggests recurrent volvulus)`);
console.log(`    • Chronic constipation`);
console.log(`    • Age 34 (atypical for CRC — favors volvulus)`);
console.log(`    • Complete obstipation + distension → high-grade obstruction`);
console.log(`    • Bilious vomiting → proximal small bowel involvement`);

console.log(`\n  ${'═'.repeat(76)}`);
console.log(`  END OF COMPREHENSIVE CLINICAL DOCUMENTATION`);
console.log(`  ${'═'.repeat(76)}`);
