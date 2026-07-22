import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  mapPhaseToState,
  createConstitutionEncounter,
  managementItemToAction,
  convertManagementPlanToActions,
  createDiagnosisDecision,
  updateEncounterPreparation,
  addPatientInputToEncounter,
  setEncounterDecision,
  createConstitutionWorkflow,
} from '../constitution-integration';

import type { ManagementItem } from '../types/ces';
import type { PatientInput as ConstitutionPatientInput } from '../../clinical-constitution/types';

function makeBaseEncounter() {
  return createConstitutionEncounter(
    'p1', 'o1', 'Org', undefined, 'OPD',
    'walk_in', 'test', 'routine', 'sys',
    'outpatient_consultation', 'clinical', 'clinic', 'registration',
  );
}

void describe('mapPhaseToState', () => {
  void it('maps registration to created', () => {
    assert.equal(mapPhaseToState('registration'), 'created');
  });

  void it('maps hpi to in_progress', () => {
    assert.equal(mapPhaseToState('hpi'), 'in_progress');
  });

  void it('maps diagnosis to decision_made', () => {
    assert.equal(mapPhaseToState('diagnosis'), 'decision_made');
  });

  void it('maps management to actions_running', () => {
    assert.equal(mapPhaseToState('management'), 'actions_running');
  });

  void it('maps disposition to completed', () => {
    assert.equal(mapPhaseToState('disposition'), 'completed');
  });

  void it('maps follow_up to follow_up_pending', () => {
    assert.equal(mapPhaseToState('follow_up'), 'follow_up_pending');
  });

  void it('returns in_progress for unrecognized phases as fallback', () => {
    assert.equal(mapPhaseToState('unknown' as any), 'in_progress');
  });
});

void describe('createConstitutionEncounter', () => {
  void it('creates an Encounter with all required components', () => {
    const enc = makeBaseEncounter();
    assert.equal(enc.patientId, 'p1');
    assert.equal(enc.encounterType, 'outpatient_consultation');
    assert.equal(enc.currentState, 'created');
    assert.equal(enc.location.type, 'clinic');
    assert.equal(enc.trigger.type, 'walk_in');
    assert.ok(enc.id);
    assert.ok(enc.startTime);
  });
});

void describe('managementItemToAction', () => {
  void it('converts investigation item to lab_order action', () => {
    const item = {
      id: 'item-1', action: 'CBC Lab', category: 'investigation', details: '',
      status: 'pending' as const,
    };
    const action = managementItemToAction(item as ManagementItem, 'enc-1');
    assert.equal(action.type, 'lab_order');
    assert.equal(action.description, 'CBC Lab');
    assert.equal(action.status, 'pending');
  });

  void it('converts medication category item to prescription action', () => {
    const item = {
      id: 'item-2', action: 'Amoxicillin', category: 'medication', details: '500mg TID',
      status: 'pending' as const,
    };
    const action = managementItemToAction(item as ManagementItem, 'enc-1');
    assert.equal(action.type, 'prescription');
  });

  void it('falls back to other for unknown categories', () => {
    const item = {
      id: 'item-3', action: 'Monitor vitals', category: 'monitoring', details: '',
      status: 'pending' as const,
    };
    const action = managementItemToAction(item as ManagementItem, 'enc-1');
    assert.equal(action.type, 'other');
  });
});

void describe('convertManagementPlanToActions', () => {
  void it('converts multiple items', () => {
    const items = [
      { id: 'i1', action: 'CBC', category: 'investigation', details: '', status: 'pending' as const },
      { id: 'i2', action: 'Chest X-ray', category: 'imaging', details: '', status: 'pending' as const },
    ];
    const actions = convertManagementPlanToActions(items as ManagementItem[], 'enc-1');
    assert.equal(actions.length, 2);
    assert.equal(actions[0].type, 'lab_order');
    assert.equal(actions[1].type, 'imaging_order');
  });

  void it('returns empty array for empty input', () => {
    assert.deepEqual(convertManagementPlanToActions([], 'enc-1'), []);
  });
});

void describe('createDiagnosisDecision', () => {
  void it('creates a diagnosis decision', () => {
    const d = createDiagnosisDecision(
      'Community-Acquired Pneumonia', 'pneumonia',
      'Fever, cough, and infiltrate on CXR',
      'doctor-1', 'Dr. Smith', 'other',
    );
    assert.equal(d.type, 'other');
    assert.equal(d.diagnosisId, 'pneumonia');
    assert.equal(d.madeBy, 'doctor-1');
    assert.equal(d.madeByName, 'Dr. Smith');
  });
});

void describe('updateEncounterPreparation', () => {
  void it('updates preparation with allergies and warnings', () => {
    const enc = makeBaseEncounter();
    const updated = updateEncounterPreparation(
      enc, { patientName: 'John', age: 40, sex: 'male' },
      ['penicillin'], ['pneumonia'], ['asthma'], ['CXR results'], ['Hypoxia risk'],
    );
    assert.equal(updated.preparation.patientSummary.name, 'John');
    assert.deepEqual(updated.preparation.patientSummary.allergies, ['penicillin']);
    assert.deepEqual(updated.preparation.patientSummary.warnings, ['Hypoxia risk']);
  });
});

void describe('addPatientInputToEncounter', () => {
  void it('adds a patient input record', () => {
    const enc = makeBaseEncounter();
    const updated = addPatientInputToEncounter(enc, 'symptom_report', 'Headache for 3 days', 'patient');
    assert.equal(updated.interaction.patientContributions.length, 1);
    assert.equal(updated.interaction.patientContributions[0].type, 'symptom_report');
  });
});

void describe('setEncounterDecision', () => {
  void it('adds a decision to the encounter and updates state', () => {
    const enc = makeBaseEncounter();
    const decision = createDiagnosisDecision('HTN', 'htn', 'High BP', 'doc-1', 'Dr. A', 'other');
    const updated = setEncounterDecision(enc, decision);
    assert.notEqual(updated.decision, null);
    assert.equal(updated.decision!.diagnosisId, 'htn');
    assert.equal(updated.currentState, 'decision_made');
  });
});

void describe('createConstitutionWorkflow', () => {
  void it('creates a workflow from an encounter', () => {
    const enc = makeBaseEncounter();
    const wf = createConstitutionWorkflow(enc, 'follow_up');
    assert.equal(wf.patientId, 'p1');
    assert.equal(wf.type, 'follow_up');
    assert.equal(wf.status, 'active');
  });
});
