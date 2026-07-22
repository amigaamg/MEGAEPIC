/**
 * Full Clinical Case Demo — Sigmoid Volvulus
 *
 * Demonstrates the complete output of the LBO engine for a real clinical scenario.
 * Run: npx tsx src/engine/domains/lbo/__tests__/full-case-demo.ts
 */
import { runLboEngine } from '../api/lbo-api';
import type { LboPatientData } from '../lbo-reasoning-engine';
import { buildClerkingPdf, buildOperativeNotePdf, buildDischargeSummaryPdf, renderPdfText } from '../reasoning/pdf-renderer';

const SIGMOID_VOLVULUS: LboPatientData = {
  age: 72,
  comorbidities: ['hypertension', 'copd'],
  patientStable: false,
  vitals: {
    heartRate: 112,
    systolicBP: 94,
    temperature: 38.4,
    respiratoryRate: 24,
    spO2: 93,
  },
  labs: {
    wbc: 18.2,
    lactate: 3.8,
    crp: 210,
    creatinine: 1.6,
  },
  exam: {
    distensionSeverity: 'severe',
    constipationDays: 5,
    painConstant: true,
    vomiting: true,
    previousEpisodes: true,
    peritonism: false,
    guarding: true,
    rigidity: false,
    absentBowelSounds: false,
    massPalpable: false,
  },
  axrFindings: {
    coffeeBeanSign: true,
    bentInnerTubeSign: true,
    freeAir: false,
    colonicDilationCm: 14,
    airFluidLevels: true,
    haustraPattern: 'haustra',
  },
  ctFindings: {
    transitionPoint: true,
    transitionLevel: 'sigmoid',
    mesentericSwirl: true,
    birdBeakSign: true,
    appleCoreLesion: false,
    colonicWallThickening: false,
    pneumatosis: false,
    portalVenousGas: false,
    freeFluid: false,
    freeAir: false,
    targetLesion: false,
    cecalDilationCm: 8,
  },
};

function runCase(name: string, data: LboPatientData) {
  console.log('='.repeat(100));
  console.log(`CLINICAL CASE: ${name}`);
  console.log('='.repeat(100));

  const output = runLboEngine(data);

  // ————————————————————————————————————————————————————
  // 1. DIAGNOSIS & SCORING
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('1. DIAGNOSIS');
  console.log('#'.repeat(100));
  console.log(`Final Diagnosis: ${output.reasoning.diagnosis}`);
  console.log(`Subtype:         ${output.reasoning.subtype}`);
  console.log(`Probability:     ${output.reasoning.probability.toFixed(1)}%`);
  console.log(`Confidence:      ${output.reasoning.confidence}`);
  console.log('');
  console.log('Scoring:');
  console.log(`  Volvulus Score:   ${output.reasoning.score.volvulusScore}/10`);
  console.log(`  Ischemia Score:   ${output.reasoning.score.ischemiaScore}/10`);
  console.log(`  Perforation Score: ${output.reasoning.score.perforationScore}/10`);
  console.log(`  Urgency:          ${output.reasoning.score.urgencyLevel}`);
  console.log(`  Risk:             ${output.reasoning.score.riskStratification}`);

  // ————————————————————————————————————————————————————
  // 2. RED FLAGS
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('2. RED FLAG SCREENING');
  console.log('#'.repeat(100));
  console.log(`Triggered: ${output.reasoning.redFlags.triggered}`);
  if (output.reasoning.redFlags.triggered) {
    for (const flag of output.reasoning.redFlags.flags) {
      console.log(`  ⚠ ${flag.finding}`);
      console.log(`    Action: ${flag.action}`);
    }
    console.log(`Urgency: ${output.reasoning.redFlags.urgency}`);
    console.log(`Actions: ${output.reasoning.redFlags.recommendedActions.join(', ')}`);
  }

  // ————————————————————————————————————————————————————
  // 3. IMAGING INTERPRETATION
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('3. IMAGING INTERPRETATION');
  console.log('#'.repeat(100));
  if (output.reasoning.axrInterpretation) {
    console.log('\nABDOMINAL X-RAY:');
    console.log(`Interpretation: ${output.reasoning.axrInterpretation.interpretation}`);
    for (const f of output.reasoning.axrInterpretation.findings) {
      console.log(`  ${f.positive ? '+' : '-'} ${f.sign}: ${f.interpretation}`);
    }
  }
  if (output.reasoning.ctInterpretation) {
    console.log('\nCT ABDOMEN + PELVIS:');
    console.log(`Interpretation: ${output.reasoning.ctInterpretation.interpretation}`);
    console.log(`Ischaemia Likelihood: ${output.reasoning.ctInterpretation.ischemiaLikelihood}`);
    for (const f of output.reasoning.ctInterpretation.findings) {
      console.log(`  ${f.positive ? '+' : '-'} ${f.sign}: ${f.interpretation}`);
    }
  }

  // ————————————————————————————————————————————————————
  // 4. DECISION EXPLANATIONS (AUDIT TRAIL)
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('4. CLINICAL DECISIONS — AUDIT TRAIL');
  console.log('#'.repeat(100));
  for (const [key, exp] of Object.entries(output.explanation)) {
    console.log(`\n--- ${key.toUpperCase()} ---`);
    console.log(`Decision: ${exp.finalDecision}`);
    console.log('Reasoning Steps:');
    for (const step of exp.steps) {
      console.log(`  Step ${step.step}: ${step.premise}`);
      console.log(`    Evidence: ${step.evidence}`);
      console.log(`    Rule: ${step.rule}`);
      console.log(`    → ${step.conclusion} (confidence: ${step.confidence})`);
      if (step.alternatives?.length) {
        console.log(`    Alternatives considered: ${step.alternatives.join('; ')}`);
      }
    }
    console.log(`Guidelines: ${exp.guidelinesReferenced.join(', ')}`);
    console.log('---');
  }

  // ————————————————————————————————————————————————————
  // 5. MISSING DATA & CONTRADICTIONS
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('5. DATA QUALITY');
  console.log('#'.repeat(100));
  console.log(`Completeness: ${output.missingData.completenessPercent}%`);
  console.log(`Missing items: ${output.missingData.totalMissing} (${output.missingData.criticalCount} critical)`);
  for (const item of output.missingData.missingItems) {
    console.log(`  [${item.urgency.toUpperCase()}] ${item.label}: ${item.reason}`);
  }
  console.log(`\nContradictions: ${output.contradictions.summary}`);
  if (output.contradictions.contradictions.length > 0) {
    for (const c of output.contradictions.contradictions) {
      console.log(`  ⚠ ${c.explanation}`);
    }
  }

  // ————————————————————————————————————————————————————
  // 6. SEPSIS & ISCHAEMIA ASSESSMENT
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('6. SAFETY ASSESSMENTS');
  console.log('#'.repeat(100));
  console.log('\nSEPSIS:');
  if (output.sepsis) {
    console.log(`Severity: ${output.sepsis.severity}`);
    console.log(`SIRS: ${output.sepsis.sirsPositive ? 'POSITIVE' : 'negative'}`);
    console.log(`qSOFA: ${output.sepsis.qsofaPositive ? 'POSITIVE' : 'negative'}`);
    console.log(`SOFA Score: ${output.sepsis.sofaScore}`);
    console.log(`Septic Shock: ${output.sepsis.septicShockPresent ? 'YES' : 'No'}`);
    console.log(`Action: ${output.sepsis.action}`);
  }
  console.log('\nISCHAEMIA:');
  if (output.ischemia) {
    console.log(`Likelihood: ${output.ischemia.likelihood} (${output.ischemia.probability}%)`);
    console.log(`Definitive signs: ${output.ischemia.definitiveSigns.join(', ') || 'None'}`);
    console.log(`Suggestive signs: ${output.ischemia.suggestiveSigns.join(', ') || 'None'}`);
    console.log(`Action: ${output.ischemia.action}`);
    console.log(`Timeframe: ${output.ischemia.timeframe}`);
  }

  // ————————————————————————————————————————————————————
  // 7. SYSTEMIC RISK OVERLAY
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('7. SYSTEMIC RISK OVERLAY');
  console.log('#'.repeat(100));
  if (output.systemicRisks) {
    console.log(`Peri-operative risk: ${output.systemicRisks.perioperativeRisk}`);
    for (const alert of output.systemicRisks.alerts) {
      console.log(`  [${alert.severity.toUpperCase()}] ${alert.condition}: ${alert.action}`);
    }
    if (output.systemicRisks.managementModifications.length > 0) {
      console.log('\nManagement modifications:');
      for (const mod of output.systemicRisks.managementModifications) {
        console.log(`  • ${mod}`);
      }
    }
  }

  // ————————————————————————————————————————————————————
  // 8. BAYESIAN UPDATES
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('8. BAYESIAN DIFFERENTIAL PROBABILITIES');
  console.log('#'.repeat(100));
  if (output.bayesianUpdates) {
    for (const [dx, info] of Object.entries(output.bayesianUpdates)) {
      console.log(`\n${dx.replace(/_/g, ' ').toUpperCase()}: ${info.probability.toFixed(1)}%`);
      for (const update of info.updates) {
        console.log(`  Posterior: ${update.posteriorProbability.toFixed(1)}% (change: ${update.probabilityChange > 0 ? '+' : ''}${update.probabilityChange.toFixed(1)}%, LR: ${update.likelihoodRatio.toFixed(2)})`);
        console.log(`  Interpretation: ${update.interpretation}`);
      }
    }
  }

  // ————————————————————————————————————————————————————
  // 9. MANAGEMENT PLAN
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('9. MANAGEMENT PLAN');
  console.log('#'.repeat(100));
  for (const phase of output.reasoning.managementPlan.phases) {
    console.log(`\n--- ${phase.phase.toUpperCase()} (${phase.timing}) ---`);
    for (const action of phase.actions) {
      console.log(`  □ ${action}`);
    }
    if (phase.monitoring?.length) {
      console.log('  Monitoring:');
      for (const m of phase.monitoring) console.log(`    • ${m}`);
    }
  }
  console.log(`\nStoma likelihood: ${output.reasoning.managementPlan.stomaLikelihood}`);
  console.log(`ICU required: ${output.reasoning.managementPlan.icuRequired}`);
  console.log(`Same-admission resection: ${output.reasoning.managementPlan.sameAdmissionResection}`);

  // ————————————————————————————————————————————————————
  // 10. OPERATIVE DECISION
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('10. OPERATIVE DECISION');
  console.log('#'.repeat(100));
  if (output.operativeDecision) {
    console.log(`Requires surgery: ${output.operativeDecision.requiresSurgery}`);
    console.log(`Urgency: ${output.operativeDecision.urgency}`);
    console.log(`\nRecommended procedure: ${output.operativeDecision.recommendedProcedure.procedure}`);
    console.log(`Approach: ${output.operativeDecision.recommendedProcedure.approach}`);
    console.log(`Stoma: ${output.operativeDecision.recommendedProcedure.stomaRequired ? output.operativeDecision.recommendedProcedure.stomaType : 'No'}`);
    console.log(`\nReason: ${output.operativeDecision.reasonForChoice}`);
    console.log('\nPre-op optimisation:');
    for (const opt of output.operativeDecision.preOptimisation) {
      console.log(`  • ${opt}`);
    }
    console.log(`\nCan proceed directly: ${output.operativeDecision.canProceedDirectly}`);
    if (output.operativeDecision.blockingFactors.length > 0) {
      console.log('Blocking factors:');
      for (const bf of output.operativeDecision.blockingFactors) console.log(`  ✗ ${bf}`);
    }
    if (output.operativeDecision.alternativeProcedures.length > 0) {
      console.log('\nAlternatives:');
      for (const alt of output.operativeDecision.alternativeProcedures) {
        console.log(`  • ${alt.procedure} (urgency: ${alt.urgency})`);
      }
    }
  }

  // ————————————————————————————————————————————————————
  // 11. FULL PDF DOCUMENTATION
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('11. FULL CLINICAL DOCUMENTATION (PDF)');
  console.log('#'.repeat(100));

  console.log('\n' + '='.repeat(100));
  console.log(' CLERKING NOTE — ADMISSION');
  console.log('='.repeat(100));
  console.log(output.documentation.clerkingPdf);

  if (output.documentation.operativeNotePdf) {
    console.log('\n' + '='.repeat(100));
    console.log(' OPERATIVE NOTE');
    console.log('='.repeat(100));
    console.log(output.documentation.operativeNotePdf);
  }

  if (output.documentation.dischargePdf) {
    console.log('\n' + '='.repeat(100));
    console.log(' DISCHARGE SUMMARY');
    console.log('='.repeat(100));
    console.log(output.documentation.dischargePdf);
  }

  // ————————————————————————————————————————————————————
  // 12. WORKFLOW & EVENTS
  // ————————————————————————————————————————————————————
  console.log('\n' + '#'.repeat(100));
  console.log('12. CLINICAL WORKFLOW & EVENT LOG');
  console.log('#'.repeat(100));
  console.log('\nWorkflow states:');
  for (const state of output.workflow) {
    const icon = state.completed ? '✓' : state.canProceed ? '○' : '✗';
    console.log(`  ${icon} ${state.label} (${state.state})`);
    for (const action of state.requiredActions) {
      console.log(`    - ${action}`);
    }
    if (state.blockingReasons.length > 0) {
      for (const reason of state.blockingReasons) console.log(`    BLOCKED: ${reason}`);
    }
  }
  console.log(`\nEvents recorded: ${output.eventLog.length}`);
  for (const e of output.eventLog.slice(0, 5)) {
    console.log(`  [${e.type}] ${JSON.stringify(e.data).slice(0, 120)}...`);
  }
}

runCase('Acute Sigmoid Volvulus with Sepsis — 72M', SIGMOID_VOLVULUS);

console.log('\n' + '='.repeat(100));
console.log('END OF FULL CLINICAL CASE DEMONSTRATION');
console.log('='.repeat(100));
