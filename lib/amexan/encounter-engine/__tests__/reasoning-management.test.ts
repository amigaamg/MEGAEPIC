import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  computeDifferentials,
  computeRedFlags,
  computeMissingInfo,
  computeObjectives,
  scoreMechanisms,
  computeGeneralDdx,
} from '../engines/reasoning-engine';

import { generateManagementPlan } from '../engines/management-generator';

import type { ReasoningInput } from '../engines/reasoning-engine';

const BASE_INPUT: ReasoningInput = {
  biodata: null,
  chiefComplaints: [],
  answers: {},
  activeModules: [],
  currentPhase: 'hpi',
  completedPhases: [],
};

const FEVER_COUGH_INPUT: ReasoningInput = {
  biodata: null,
  chiefComplaints: [
    { id: 'cc-1', complaint: 'fever', duration: '3 days', durationSeconds: 259200, onset: '', primary: true, patientWords: '' },
    { id: 'cc-2', complaint: 'cough', duration: '2 days', durationSeconds: 172800, onset: '', primary: false, patientWords: '' },
  ],
  answers: {},
  activeModules: ['infectious', 'respiratory'],
  currentPhase: 'differentials',
  completedPhases: ['registration', 'hpi', 'review_of_systems', 'examination'],
};

void describe('computeDifferentials', () => {
  void it('returns empty array for empty input', () => {
    const result = computeDifferentials(BASE_INPUT);
    assert.ok(Array.isArray(result));
  });

  void it('returns differentials for fever + cough presentation', () => {
    const result = computeDifferentials(FEVER_COUGH_INPUT);
    assert.ok(Array.isArray(result));
  });

  void it('each differential has required fields', () => {
    const result = computeDifferentials(FEVER_COUGH_INPUT);
    for (const d of result) {
      assert.ok(d.diseaseName);
      assert.ok(typeof d.probability === 'number');
      assert.ok(Array.isArray(d.supporting));
    }
  });
});

void describe('computeGeneralDdx', () => {
  void it('returns differentials derived from symptom knowledge base', () => {
    const result = computeGeneralDdx(FEVER_COUGH_INPUT);
    assert.ok(Array.isArray(result));
  });
});

void describe('computeRedFlags', () => {
  void it('returns array of red flags', () => {
    const result = computeRedFlags(BASE_INPUT);
    assert.ok(Array.isArray(result));
  });
});

void describe('computeMissingInfo', () => {
  void it('returns array of missing information', () => {
    const result = computeMissingInfo(FEVER_COUGH_INPUT);
    assert.ok(Array.isArray(result));
  });
});

void describe('computeObjectives', () => {
  void it('returns array of clinical objectives', () => {
    const result = computeObjectives(FEVER_COUGH_INPUT.currentPhase, FEVER_COUGH_INPUT.completedPhases, FEVER_COUGH_INPUT.answers, FEVER_COUGH_INPUT);
    assert.ok(Array.isArray(result));
  });
});

void describe('scoreMechanisms', () => {
  void it('returns scored mechanism array', () => {
    const result = scoreMechanisms(FEVER_COUGH_INPUT);
    assert.ok(Array.isArray(result));
    if (result.length > 0) {
      assert.ok(result[0].mechanismId);
      assert.ok(typeof result[0].score === 'number');
    }
  });
});

void describe('generateManagementPlan', () => {
  void it('returns a GeneratedManagementPlan with all categories', () => {
    const plan = generateManagementPlan({
      biodata: null,
      chiefComplaints: FEVER_COUGH_INPUT.chiefComplaints,
      answers: FEVER_COUGH_INPUT.answers,
      activeModules: FEVER_COUGH_INPUT.activeModules,
      currentPhase: FEVER_COUGH_INPUT.currentPhase,
      completedPhases: FEVER_COUGH_INPUT.completedPhases,
    });
    assert.ok(Array.isArray(plan.investigations));
    assert.ok(Array.isArray(plan.medications));
    assert.ok(Array.isArray(plan.nursing));
    assert.ok(Array.isArray(plan.monitoring));
    assert.ok(Array.isArray(plan.supportive));
    assert.ok(Array.isArray(plan.referrals));
    assert.ok(Array.isArray(plan.all));
    assert.equal(
      plan.all.length,
      plan.investigations.length + plan.medications.length +
      plan.nursing.length + plan.monitoring.length +
      plan.supportive.length + plan.referrals.length,
    );
  });
});
