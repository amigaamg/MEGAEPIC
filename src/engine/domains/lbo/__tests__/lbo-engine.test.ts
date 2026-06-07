/**
 * LBO Clinical Engine — Unit Tests (via Node test runner)
 *
 * Run: npx tsx src/engine/domains/lbo/__tests__/lbo-engine.test.ts
 * Or:  node --import tsx --test src/engine/domains/lbo/__tests__/lbo-engine.test.ts
 *
 * Tests the full runLboEngine integration with 3 clinical scenarios.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';

import { runLboEngine } from '../api/lbo-api';
import type { LboPatientData } from '../lbo-reasoning-engine';

const BASE_PATIENT: LboPatientData = {
  age: 60, comorbidities: [], patientStable: true,
  vitals: { heartRate: 80, systolicBP: 130, temperature: 37.0, respiratoryRate: 16, spO2: 98 },
  labs: { wbc: 8.0, lactate: 1.0, crp: 5, creatinine: 0.9 },
  exam: {
    distensionSeverity: 'moderate', constipationDays: 3, painConstant: false,
    vomiting: true, previousEpisodes: false,
    peritonism: false, guarding: false, rigidity: false,
    absentBowelSounds: false, massPalpable: false,
  },
  axrFindings: {
    coffeeBeanSign: false, bentInnerTubeSign: false, freeAir: false,
    colonicDilationCm: 7, airFluidLevels: true, haustraPattern: 'haustra',
  },
  ctFindings: {
    transitionPoint: true, transitionLevel: 'sigmoid', mesentericSwirl: true,
    birdBeakSign: true, appleCoreLesion: false, colonicWallThickening: false,
    pneumatosis: false, portalVenousGas: false, freeFluid: false, freeAir: false,
    targetLesion: false, cecalDilationCm: 0,
  },
};

describe('LBO Clinical Engine (runLboEngine)', () => {

  it('should run with base patient and produce a valid output', () => {
    const output = runLboEngine(BASE_PATIENT);
    assert.ok(output.reasoning.diagnosis.length > 0, 'Should produce diagnosis');
    assert.ok(output.reasoning.subtype.length > 0, 'Should determine subtype');
    assert.ok(output.reasoning.confidence, 'Should have confidence');
    assert.ok(output.eventLog.length > 0, 'Should have event log');
    assert.ok(output.workflow.length > 0, 'Should have workflow states');
    assert.ok(output.documentation.clerkingPdf.length > 0, 'Should generate clerking PDF');
  });

  it('should set higher volvulus score for sigmoid volvulus pattern', () => {
    const volvulusPatient: LboPatientData = {
      ...BASE_PATIENT,
      age: 70,
      exam: { ...BASE_PATIENT.exam, distensionSeverity: 'severe', constipationDays: 5, previousEpisodes: true },
      axrFindings: { ...BASE_PATIENT.axrFindings!, coffeeBeanSign: true, colonicDilationCm: 12 },
      ctFindings: { ...BASE_PATIENT.ctFindings!, mesentericSwirl: true, birdBeakSign: true },
    };
    const output = runLboEngine(volvulusPatient);
    assert.ok(output.reasoning.score.volvulusScore >= 3, `Volvulus score should be ≥3 for sigmoid volvulus, got ${output.reasoning.score.volvulusScore}`);
  });

  it('should set higher obstruction score for obstructing cancer pattern', () => {
    const cancerPatient: LboPatientData = {
      ...BASE_PATIENT,
      exam: { ...BASE_PATIENT.exam, constipationDays: 7, massPalpable: true },
      axrFindings: { ...BASE_PATIENT.axrFindings!, coffeeBeanSign: false, haustraPattern: 'valvulae' },
      ctFindings: { ...BASE_PATIENT.ctFindings!, appleCoreLesion: true, colonicWallThickening: true, targetLesion: true, transitionLevel: 'splenic_flexure', mesentericSwirl: false, birdBeakSign: false },
    };
    const output = runLboEngine(cancerPatient);
    assert.ok(output.reasoning.score.ischemiaScore >= 0, 'Should calculate ischemia score');
    assert.ok(output.reasoning.subtype === 'obstructing_cancer' || output.reasoning.subtype === 'sigmoid_volvulus', 'Should identify subtype');
  });

  it('should detect red flags in septic patient', () => {
    const septicPatient: LboPatientData = {
      ...BASE_PATIENT,
      vitals: { heartRate: 115, systolicBP: 85, temperature: 38.8, respiratoryRate: 22, spO2: 92 },
      labs: { wbc: 18, lactate: 4.2, crp: 180, creatinine: 1.8 },
      exam: { ...BASE_PATIENT.exam, peritonism: true, guarding: true, absentBowelSounds: true },
    };
    const output = runLboEngine(septicPatient);
    assert.ok(output.reasoning.redFlags.triggered, 'Should trigger red flags in septic patient');
    assert.ok(output.reasoning.redFlags.flags.length >= 2, 'Should have multiple red flag triggers');
  });

  it('should produce AXR interpretation when AXR findings are present', () => {
    const output = runLboEngine(BASE_PATIENT);
    assert.ok(output.reasoning.axrInterpretation !== undefined, 'Should interpret AXR');
    assert.ok(output.reasoning.axrInterpretation!.findings.length > 0, 'Should list AXR findings');
  });

  it('should produce CT interpretation when CT findings are present', () => {
    const output = runLboEngine(BASE_PATIENT);
    assert.ok(output.reasoning.ctInterpretation !== undefined, 'Should interpret CT');
    assert.ok(output.reasoning.ctInterpretation!.findings.length > 0, 'Should list CT findings');
  });

  it('should generate decision explanations for all decision types', () => {
    const output = runLboEngine(BASE_PATIENT);
    const expectedKeys = ['diagnosis', 'urgency', 'management', 'operative_approach', 'stoma_formation', 'icu_admission'];
    for (const key of expectedKeys) {
      assert.ok(output.explanation[key], `Should have explanation for ${key}`);
      assert.ok(output.explanation[key].finalDecision.length > 0, `Explanation for ${key} should have a decision`);
      assert.ok(output.explanation[key].steps.length > 0, `Explanation for ${key} should have steps`);
    }
  });

  it('should detect missing data when fields are empty', () => {
    const incompletePatient: LboPatientData = {
      age: 60, comorbidities: [], patientStable: true,
      vitals: { heartRate: undefined, systolicBP: undefined, temperature: undefined, respiratoryRate: 16, spO2: undefined },
      labs: { wbc: undefined, lactate: undefined, crp: undefined, creatinine: undefined },
      exam: { distensionSeverity: 'moderate', constipationDays: 0, painConstant: false, vomiting: false, previousEpisodes: false, peritonism: false, guarding: false, rigidity: false, absentBowelSounds: false, massPalpable: false },
    };
    const output = runLboEngine(incompletePatient);
    assert.ok(output.missingData.completenessPercent < 100, 'Should detect incomplete data');
    assert.ok(output.missingData.missingItems.length >= 3, 'Should list missing items');
  });

  it('should assess sepsis', () => {
    const output = runLboEngine(BASE_PATIENT);
    assert.ok(output.sepsis !== null, 'Should assess sepsis');
    assert.ok(['none', 'sepsis', 'severe_sepsis', 'septic_shock'].includes(output.sepsis!.severity), 'Should have valid severity');
  });

  it('should assess ischemia', () => {
    const output = runLboEngine(BASE_PATIENT);
    assert.ok(output.ischemia !== null, 'Should assess ischemia');
    assert.ok(output.ischemia!.action.length > 0, 'Should have an action plan');
  });

  it('should assess systemic risks', () => {
    const comorbidPatient: LboPatientData = {
      ...BASE_PATIENT,
      age: 75,
      comorbidities: ['diabetes', 'ckd', 'heart_failure'],
    };
    const output = runLboEngine(comorbidPatient);
    assert.ok(output.systemicRisks !== null, 'Should assess systemic risks');
    assert.ok(output.systemicRisks!.alerts.length > 0, 'Should have alerts for comorbidities');
  });

  it('should make operative decision when data is sufficient', () => {
    const output = runLboEngine(BASE_PATIENT);
    assert.ok(output.operativeDecision !== null, 'Should make operative decision');
    assert.ok(output.operativeDecision!.requiresSurgery !== undefined, 'Should determine if surgery needed');
    assert.ok(output.operativeDecision!.recommendedProcedure.procedure.length > 0, 'Should recommend a procedure');
  });

  it('should update Bayesian probabilities', () => {
    const output = runLboEngine(BASE_PATIENT);
    assert.ok(output.bayesianUpdates !== null, 'Should produce Bayesian updates');
    const entries = Object.entries(output.bayesianUpdates!);
    assert.ok(entries.length > 0, 'Should have at least one disease probability');
    for (const [, info] of entries) {
      assert.ok(typeof info.probability === 'number', 'Probability should be a number');
    }
  });

  it('should build workflow states', () => {
    const output = runLboEngine(BASE_PATIENT);
    assert.ok(output.workflow.length >= 10, `Should have ≥10 workflow states, got ${output.workflow.length}`);
    const firstState = output.workflow[0];
    assert.ok(firstState.state.length > 0, 'Workflow state should have a name');
  });

  it('should emit events through event bus', () => {
    const output = runLboEngine(BASE_PATIENT);
    assert.ok(output.eventLog.length >= 10, `Should have ≥10 events, got ${output.eventLog.length}`);
    const firstEvent = output.eventLog[0];
    assert.ok(firstEvent.type.length > 0, 'Event should have a type');
    assert.ok(firstEvent.timestamp.length > 0, 'Event should have a timestamp');
  });

  it('should generate all three PDF documents when surgical patient', () => {
    const surgicalPatient: LboPatientData = {
      ...BASE_PATIENT,
      patientStable: false,
      vitals: { heartRate: 105, systolicBP: 95, temperature: 38.0, respiratoryRate: 20, spO2: 95 },
      labs: { wbc: 14, lactate: 2.5, crp: 80, creatinine: 1.2 },
      exam: { ...BASE_PATIENT.exam, peritonism: false },
    };
    const output = runLboEngine(surgicalPatient);
    assert.ok(output.documentation.clerkingPdf.length > 100, 'Clerking PDF should be substantive');
    assert.ok(output.documentation.operativeNotePdf, 'Should generate operative note PDF');
    assert.ok(output.documentation.operativeNotePdf!.length > 100, 'Operative note PDF should be substantive');
    assert.ok(output.documentation.dischargePdf, 'Should generate discharge PDF');
    assert.ok(output.documentation.dischargePdf!.length > 100, 'Discharge PDF should be substantive');
  });

  it('should produce a diagnosis string', () => {
    const output = runLboEngine(BASE_PATIENT);
    assert.ok(typeof output.reasoning.diagnosis === 'string', 'Diagnosis should be a string');
    assert.ok(output.reasoning.diagnosis.length > 5, 'Diagnosis should be descriptive');
  });

  it('should produce subtype-specific management', () => {
    const output = runLboEngine(BASE_PATIENT);
    assert.ok(output.reasoning.managementPlan.phases.length >= 3, 'Should have management phases');
    for (const phase of output.reasoning.managementPlan.phases) {
      assert.ok(phase.actions.length > 0, `Phase ${phase.phase} should have actions`);
      assert.ok(phase.timing.length > 0, `Phase ${phase.phase} should have timing`);
    }
  });

});
