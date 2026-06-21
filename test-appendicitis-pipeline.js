const ts = require('./node_modules/typescript/lib/typescript.js');
const fs = require('fs');
const nodePath = require('path');

const tscOpts = { module: 1, target: 2, strict: true, esModuleInterop: true };

const moduleStore = {};

function define(name, factory) {
  moduleStore[name] = { factory, exports: {}, executed: false };
}

function loadModule(name, callerDir) {
  if (name.startsWith('.')) {
    const abs = nodePath.resolve(callerDir, name).replace(/\\/g, '/');
    if (moduleStore[abs]) return execModule(abs);
    if (moduleStore[abs + '.ts']) return execModule(abs + '.ts');
  }
  for (const key of Object.keys(moduleStore)) {
    if (key.endsWith('/' + name) || key.endsWith('/' + name + '.ts') || key === name) {
      return execModule(key);
    }
  }
  try { return require(name); } catch(e) {}
  throw new Error('Module not found: ' + name);
}

function execModule(name) {
  const m = moduleStore[name];
  if (!m) throw new Error('Not registered: ' + name);
  if (m.executed) return m.exports;
  m.executed = true;
  const fn = new Function('exports', 'require', 'module', '__dirname', m.factory);
  fn(m.exports, (n) => loadModule(n, nodePath.dirname(name)), { exports: m.exports }, nodePath.dirname(name));
  return m.exports;
}

function register(filePath) {
  const abs = nodePath.resolve(__dirname, filePath).replace(/\\/g, '/');
  const src = fs.readFileSync(abs, 'utf8');
  const js = ts.transpileModule(src, tscOpts).outputText;
  define(abs, js);
}

register('lib/amexan/core/types.ts');
register('lib/amexan/engines/ise/caseMapper.ts');
register('lib/amexan/engines/ise/severityEngine.ts');
register('lib/amexan/engines/ise/investigationEngine.ts');
register('lib/amexan/engines/ise/managementEngine.ts');
register('lib/amexan/engines/ise/educationEngine.ts');
register('lib/amexan/engines/appendicitisPipeline.ts');

const pipelinePath = nodePath.resolve(__dirname, 'lib/amexan/engines/appendicitisPipeline.ts').replace(/\\/g, '/');
const { assessAppendicitis, formatAssessmentSummary } = execModule(pipelinePath);

const scenarios = [
  {
    name: 'SCENARIO 1: Classic Appendicitis (22yo Male)',
    input: {
      demographics: { age: 22, sex: 'male' },
      symptoms: { periumbilicalPain: true, painMigratedToRIF: true, rightIliacFossaPain: true, anorexia: true, nausea: true, painAggravatedByMovement: true, fever: true },
      signs: { temperature: 37.6, heartRate: 95, RIFTenderness: true, mcburneyTenderness: true, reboundTenderness: true, localizedGuarding: true, rovsingSign: true, coughSign: true },
      labs: { wbc: 14500, crp: 85, neutrophils: 82 },
    },
  },
  {
    name: 'SCENARIO 2: Gastroenteritis Mimic (10yo Child)',
    input: {
      demographics: { age: 10, sex: 'male', isChild: true },
      symptoms: { abdominalPain: true, nausea: true, vomiting: true, vomitingBeforePain: true, diarrhea: true, fever: true, anorexia: false, painMigratedToRIF: false },
      signs: { temperature: 38.8, RIFTenderness: false, reboundTenderness: false },
      labs: { wbc: 8000, crp: 15, neutrophils: 50 },
    },
  },
  {
    name: 'SCENARIO 3: Perforated/Gangrenous (65yo F)',
    input: {
      demographics: { age: 65, sex: 'female', isElderly: true },
      symptoms: { abdominalPain: true, rightIliacFossaPain: true, anorexia: true, nausea: true, vomiting: true, fever: true, malaise: true, painMigratedToRIF: false },
      signs: { temperature: 39.2, heartRate: 122, bloodPressure: '85/60', RIFTenderness: true, reboundTenderness: true, localizedGuarding: true, generalizedGuarding: true, rigidity: true, absentBowelSounds: true, septicAppearance: true, dehydration: true },
      labs: { wbc: 18500, crp: 220, lactate: 3.8, neutrophils: 90 },
    },
  },
  {
    name: 'SCENARIO 4: Ectopic Pregnancy (28yo F)',
    input: {
      demographics: { age: 28, sex: 'female', pregnant: true },
      symptoms: { abdominalPain: true, rightIliacFossaPain: true, nausea: true, anorexia: false, fever: false, painMigratedToRIF: false },
      signs: { temperature: 36.9, heartRate: 105, bloodPressure: '100/65', RIFTenderness: true, reboundTenderness: false, localizedGuarding: true },
      labs: { wbc: 10500, crp: 25, betaHcg: 'positive', neutrophils: 68 },
    },
  },
  {
    name: 'SCENARIO 5: Pneumonia Mimic (8yo Child)',
    input: {
      demographics: { age: 8, sex: 'male', isChild: true },
      symptoms: { abdominalPain: true, fever: true, cough_with_sputum: true, pleuritic_chest_pain: true, vomiting: false, anorexia: false, painMigratedToRIF: false },
      signs: { temperature: 39.5, heartRate: 115, RIFTenderness: false, reboundTenderness: false },
      labs: { wbc: 12000, crp: 60, neutrophils: 72 },
    },
  },
  {
    name: 'SCENARIO 6: Right Colon Cancer (68yo M)',
    input: {
      demographics: { age: 68, sex: 'male', isElderly: true },
      symptoms: { abdominalPain: true, rightIliacFossaPain: true, anorexia: true, weight_loss_chronic_diarrhea: true, change_in_bowel_habits: true, nausea: false, vomiting: false, fever: false, painMigratedToRIF: false },
      signs: { temperature: 36.8, heartRate: 88, RIFTenderness: true, reboundTenderness: false, palpableMass: true },
      labs: { wbc: 9000, crp: 12, neutrophils: 60 },
    },
  },
];

for (const s of scenarios) {
  console.log('\n' + '='.repeat(72));
  console.log(s.name);
  console.log('-'.repeat(72));
  try {
    const r = assessAppendicitis(s.input);
    console.log(`Alvarado: ${r.alvarado.score}/10 (${r.alvarado.risk})`);
    console.log(`Severity: ${r.severity.level.toUpperCase()} (score ${r.severity.score})`);
    console.log(`Subtype: ${r.management.subtype.replace(/_/g, ' ')}`);
    const essential = r.investigations.diagnostic.filter(d => d.priority === 'essential');
    console.log(`Essential dx: ${essential.map(d => d.name).join(', ')}`);
    console.log(`Disp: ${r.management.disposition[0]?.action}`);
    const abx = r.management.antibiotics[0];
    if (abx) console.log(`ABX: ${abx.regimen.substring(0, 80)} (${abx.duration})`);
    if (r.labInterpretations.length) console.log(`Lab: ${r.labInterpretations[0].substring(0, 100)}`);
    console.log(`Subtype notes: ${r.management.notes.substring(0, 120)}`);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
  }
}

console.log('\n\n' + '='.repeat(72));
console.log('ALL 6 SCENARIOS COMPLETE');
console.log('='.repeat(72));

console.log('\n\n=== FULL REPORT: Classic Appendicitis ===');
const sample = assessAppendicitis(scenarios[0].input);
console.log(formatAssessmentSummary(sample));
