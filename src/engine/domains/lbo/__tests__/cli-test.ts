/**
 * LBO Clinical Engine — Standalone CLI Test Runner
 *
 * Usage: npx tsx src/engine/domains/lbo/__tests__/cli-test.ts
 *
 * Runs 3 clinical test cases through `runLboEngine` and prints structured output.
 * Web UI alternative: /clinical-workspace/hospital@amexan.test/departments/surgery/lbo-intelligence
 */
import { runLboEngine } from '../api/lbo-api';
import type { LboPatientData } from '../lbo-reasoning-engine';

const HR = '='.repeat(72);

const TEST_CASES: { name: string; patient: LboPatientData }[] = [
  {
    name: 'Sigmoid Volvulus — 70M acute distension, coffee bean AXR, bird-beak CT',
    patient: {
      age: 70, comorbidities: ['hypertension'], patientStable: false,
      vitals: { heartRate: 110, systolicBP: 95, temperature: 38.2, respiratoryRate: 22, spO2: 94 },
      labs: { wbc: 16.5, lactate: 3.2, crp: 156, creatinine: 1.4 },
      exam: { distensionSeverity: 'severe', constipationDays: 5, painConstant: false, vomiting: true, previousEpisodes: true, peritonism: false, guarding: false, rigidity: false, absentBowelSounds: false, massPalpable: false },
      axrFindings: { coffeeBeanSign: true, bentInnerTubeSign: false, freeAir: false, colonicDilationCm: 12, airFluidLevels: true, haustraPattern: 'haustra' },
      ctFindings: { transitionPoint: true, transitionLevel: 'sigmoid', mesentericSwirl: true, birdBeakSign: true, appleCoreLesion: false, colonicWallThickening: false, pneumatosis: false, portalVenousGas: false, freeFluid: false, freeAir: false, targetLesion: false, cecalDilationCm: 0 },
    },
  },
  {
    name: 'Obstructing Cancer — 65F weight loss, apple-core splenic flexure CT',
    patient: {
      age: 65, comorbidities: ['type_2_diabetes', 'copd'], patientStable: true,
      vitals: { heartRate: 88, systolicBP: 135, temperature: 37.2, respiratoryRate: 16, spO2: 97 },
      labs: { wbc: 9.2, lactate: 0.8, crp: 22, creatinine: 1.0 },
      exam: { distensionSeverity: 'moderate', constipationDays: 7, painConstant: false, vomiting: false, previousEpisodes: false, peritonism: false, guarding: false, rigidity: false, absentBowelSounds: false, massPalpable: true },
      axrFindings: { coffeeBeanSign: false, bentInnerTubeSign: false, freeAir: false, colonicDilationCm: 8, airFluidLevels: true, haustraPattern: 'valvulae' },
      ctFindings: { transitionPoint: true, transitionLevel: 'splenic_flexure', mesentericSwirl: false, birdBeakSign: false, appleCoreLesion: true, colonicWallThickening: true, pneumatosis: false, portalVenousGas: false, freeFluid: false, freeAir: false, targetLesion: true, cecalDilationCm: 6 },
    },
  },
  {
    name: 'Pseudo-Obstruction — 78F ICU, no transition point, pancolonic dilation',
    patient: {
      age: 78, comorbidities: ['ckd', 'heart_failure', 'parkinson_disease'], patientStable: true,
      vitals: { heartRate: 78, systolicBP: 110, temperature: 36.8, respiratoryRate: 18, spO2: 96 },
      labs: { wbc: 7.0, lactate: 0.6, crp: 8, creatinine: 1.8 },
      exam: { distensionSeverity: 'severe', constipationDays: 2, painConstant: true, vomiting: false, previousEpisodes: false, peritonism: false, guarding: false, rigidity: false, absentBowelSounds: false, massPalpable: false },
      axrFindings: { coffeeBeanSign: false, bentInnerTubeSign: false, freeAir: false, colonicDilationCm: 10, airFluidLevels: true, haustraPattern: 'absent' },
      ctFindings: { transitionPoint: false, transitionLevel: 'none', mesentericSwirl: false, birdBeakSign: false, appleCoreLesion: false, colonicWallThickening: false, pneumatosis: false, portalVenousGas: false, freeFluid: false, freeAir: false, targetLesion: false, cecalDilationCm: 10 },
    },
  },
];

function printSection(title: string, data: unknown) {
  console.log(`\n  ${title}`);
  const json = JSON.stringify(data, null, 4);
  for (const line of json.split('\n')) {
    console.log(`  ${line}`);
  }
}

async function main() {
  console.log(`\n${HR}`);
  console.log('  LBO CLINICAL REASONING ENGINE — CLI TEST RUNNER');
  console.log(`${HR}\n`);

  for (const tc of TEST_CASES) {
    try {
      const start = Date.now();
      const output = runLboEngine(tc.patient);
      const elapsed = Date.now() - start;

      console.log(`\n${HR}`);
      console.log(`  CASE: ${tc.name}`);
      console.log(`${HR}`);
      console.log(`  Time: ${elapsed}ms`);
      console.log(`\n  Diagnosis: ${output.reasoning.diagnosis}`);
      console.log(`  Subtype:   ${output.reasoning.subtype}`);
      console.log(`  Prob:      ${(output.reasoning.probability * 100).toFixed(1)}%`);
      console.log(`  Conf:      ${output.reasoning.confidence}`);
      console.log(`  Volvulus:  ${output.reasoning.score.volvulusScore}`);
      console.log(`  Ischemia:  ${output.reasoning.score.ischemiaScore}`);
      console.log(`  Perf:      ${output.reasoning.score.perforationScore}`);
      console.log(`  Urgency:   ${output.reasoning.score.urgencyLevel}`);
      console.log(`  Risk:      ${output.reasoning.score.riskStratification}`);

      if (output.reasoning.axrInterpretation) {
        printSection('AXR', output.reasoning.axrInterpretation);
      }
      if (output.reasoning.ctInterpretation) {
        printSection('CT', output.reasoning.ctInterpretation);
      }

      printSection('Red Flags', output.reasoning.redFlags);
      printSection('Management Plan', output.reasoning.managementPlan);

      for (const [key, exp] of Object.entries(output.explanation)) {
        printSection(`Explanation: ${key}`, exp);
      }

      printSection('Missing Data', output.missingData);
      printSection('Contradictions', output.contradictions);

      if (output.operativeDecision) {
        printSection('Operative Decision', output.operativeDecision);
      }
      if (output.sepsis) printSection('Sepsis', output.sepsis);
      if (output.ischemia) printSection('Ischemia', output.ischemia);
      if (output.systemicRisks) printSection('Systemic Risk', output.systemicRisks);
      if (output.bayesianUpdates) printSection('Bayesian Updates', output.bayesianUpdates);

      printSection('Workflow', output.workflow);
      printSection('Events (first 5)', output.eventLog.slice(0, 5));

      console.log(`\n  Clerking PDF length: ${output.documentation.clerkingPdf.length} chars`);
      if (output.documentation.operativeNotePdf)
        console.log(`  Operative Note PDF length: ${output.documentation.operativeNotePdf.length} chars`);
      if (output.documentation.dischargePdf)
        console.log(`  Discharge PDF length: ${output.documentation.dischargePdf.length} chars`);

    } catch (err) {
      console.error(`\n  FAILED — ${tc.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`\n${HR}`);
  console.log('  DONE');
  console.log(`${HR}\n`);
}

main();
