import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createEncounterOrchestrator, answerInOrchestrator, advancePhase, setPatientBiodata } from '../engines/orchestrator';

const BASE_BIODATA = {
  patientName: 'Test Patient',
  hospitalNumber: 'HN-001',
  age: 45,
  ageGroup: 'adult' as const,
  dateOfBirth: '1980-01-01',
  sex: 'male' as const,
  department: 'OPD',
  hospital: 'Test Hospital',
  encounterType: 'outpatient',
  date: '2026-07-15',
};

void describe('createEncounterOrchestrator', () => {
  void it('creates a state with default phase and empty question engine', () => {
    const state = createEncounterOrchestrator();
    assert.equal(state.currentPhase, 'registration');
    assert.deepEqual(state.completedPhases, []);
    assert.equal(state.constitutionEncounter, null);
    assert.deepEqual(state.constitutionFacts, []);
    assert.deepEqual(state.constitutionActions, []);
  });

  void it('creates constitution encounter when biodata is provided', () => {
    const state = createEncounterOrchestrator(BASE_BIODATA);
    assert.notEqual(state.constitutionEncounter, null);
    assert.equal(state.constitutionEncounter!.patientId, 'HN-001');
    assert.equal(state.constitutionEncounter!.currentState, 'created');
  });
});

void describe('answerInOrchestrator', () => {
  void it('returns a new state object (immutable)', () => {
    const state = createEncounterOrchestrator();
    const next = answerInOrchestrator(state, 'cc-0', 'fever');
    assert.notEqual(state, next);
  });
});

void describe('advancePhase', () => {
  void it('moves to the next phase and marks current as completed', () => {
    const state = createEncounterOrchestrator();
    const next = advancePhase(state, 'hpi');
    assert.equal(next.currentPhase, 'hpi');
    assert.ok(next.completedPhases.includes('registration'));
  });

  void it('updates constitutionEncounter state via mapPhaseToState', () => {
    const state = createEncounterOrchestrator(BASE_BIODATA);
    const next = advancePhase(state, 'hpi');
    assert.equal(next.constitutionEncounter!.currentState, 'in_progress');
  });
});

void describe('setPatientBiodata', () => {
  void it('updates biodata on the state', () => {
    const state = createEncounterOrchestrator();
    const next = setPatientBiodata(state, { patientName: 'Updated', hospitalNumber: 'HN-004' });
    assert.equal(next.biodata?.patientName, 'Updated');
    assert.equal(next.biodata?.hospitalNumber, 'HN-004');
  });
});
