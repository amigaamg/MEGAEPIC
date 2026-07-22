import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  autoExecuteProtocol,
  estimateSeverityFromVitals,
} from '../engines/protocol-auto-executor';

import type { AutoExecutionInput, AutoExecutionVitals } from '../engines/protocol-auto-executor';

const PNEUMONIA_INPUT: AutoExecutionInput = {
  diagnosisId: 'pneumonia',
  diagnosisName: 'Community-Acquired Pneumonia',
  severity: 'moderate',
  patientAge: 45,
  patientWeight: 70,
  pregnant: false,
  allergies: ['penicillin'],
  renalImpairment: false,
  hepaticImpairment: false,
  comorbidities: ['asthma'],
  activeModules: ['infectious', 'respiratory'],
  chiefComplaints: ['fever', 'cough', 'dyspnea'],
  vitals: {
    temperature: 38.9,
    spo2: 92,
    respiratoryRate: 24,
    heartRate: 100,
    systolicBP: 120,
  },
};

const SEPSIS_INPUT: AutoExecutionInput = {
  diagnosisId: 'sepsis',
  diagnosisName: 'Sepsis',
  severity: 'severe',
  patientAge: 65,
  patientWeight: 80,
  pregnant: false,
  allergies: ['sulfa'],
  renalImpairment: true,
  hepaticImpairment: false,
  comorbidities: ['diabetes', 'ckd'],
  activeModules: ['infectious', 'critical_care'],
  chiefComplaints: ['fever', 'confusion', 'oliguria'],
  vitals: {
    temperature: 39.5,
    spo2: 89,
    respiratoryRate: 28,
    heartRate: 115,
    systolicBP: 85,
    diastolicBP: 50,
    consciousness: 'confused',
    urineOutput: 0.3,
  },
};

void describe('autoExecuteProtocol', () => {
  void it('returns a valid AutoExecutionPlan for pneumonia', () => {
    const plan = autoExecuteProtocol(PNEUMONIA_INPUT);
    assert.ok(plan.orders.length > 0);
    assert.equal(plan.diagnosisId, 'pneumonia');
    assert.equal(plan.diagnosisName, 'Community-Acquired Pneumonia');
    assert.equal(plan.severity, 'moderate');
  });

  void it('includes investigations, medications, nursing, monitoring, supportive', () => {
    const plan = autoExecuteProtocol(PNEUMONIA_INPUT);
    assert.ok(plan.suggestedLabs.length > 0);
    assert.ok(plan.suggestedImaging.length > 0);
    assert.ok(plan.suggestedMeds.length > 0);
    assert.ok(plan.nursingPlan.length > 0);
    assert.ok(plan.monitoringPlan.length > 0);
  });

  void it('generates more intensive plan for sepsis (stat/urgent orders)', () => {
    const plan = autoExecuteProtocol(SEPSIS_INPUT);
    const priorities = plan.orders.map(o => o.priority);
    assert.ok(priorities.includes('stat') || priorities.includes('urgent'));
    assert.equal(plan.severity, 'severe');
    assert.ok(plan.isolationType !== null);
  });

  void it('filters out allergic medications', () => {
    const plan = autoExecuteProtocol(PNEUMONIA_INPUT);
    const medNames = plan.orders
      .filter(o => o.type === 'medication')
      .map(o => o.action.toLowerCase());
    const hasPenicillin = medNames.some(n => n.includes('penicillin') || n.includes('amoxicillin') || n.includes('ampicillin'));
    assert.equal(hasPenicillin, false);
  });

  void it('includes warnings when present', () => {
    const plan = autoExecuteProtocol(PNEUMONIA_INPUT);
    assert.ok(Array.isArray(plan.warnings));
  });

  void it('includes recommendation list', () => {
    const plan = autoExecuteProtocol(PNEUMONIA_INPUT);
    assert.ok(Array.isArray(plan.recommendations));
  });

  void it('handles mild severity', () => {
    const mild: AutoExecutionInput = {
      ...PNEUMONIA_INPUT,
      diagnosisId: 'bronchitis',
      diagnosisName: 'Acute Bronchitis',
      severity: 'mild',
      vitals: { temperature: 37.5, spo2: 97, respiratoryRate: 18, heartRate: 80, systolicBP: 120 },
    };
    const plan = autoExecuteProtocol(mild);
    assert.equal(plan.severity, 'mild');
    assert.ok(plan.orders.length > 0);
  });
});

void describe('estimateSeverityFromVitals', () => {
  void it('returns mild for normal vitals', () => {
    const vitals: AutoExecutionVitals = {
      temperature: 37.0, spo2: 98, respiratoryRate: 16,
      heartRate: 75, systolicBP: 120,
    };
    assert.equal(estimateSeverityFromVitals(vitals), 'mild');
  });

  void it('returns moderate for concerning vitals', () => {
    const vitals: AutoExecutionVitals = {
      temperature: 38.5, spo2: 93, respiratoryRate: 24,
      heartRate: 105, systolicBP: 100,
    };
    assert.equal(estimateSeverityFromVitals(vitals), 'moderate');
  });

  void it('returns severe for critical vitals', () => {
    const vitals: AutoExecutionVitals = {
      temperature: 39.5, spo2: 85, respiratoryRate: 30,
      heartRate: 130, systolicBP: 80,
      consciousness: 'unresponsive',
    };
    assert.equal(estimateSeverityFromVitals(vitals), 'severe');
  });

  void it('handles empty vitals gracefully', () => {
    const result = estimateSeverityFromVitals({});
    assert.ok(['mild', 'moderate', 'severe'].includes(result));
  });
});
