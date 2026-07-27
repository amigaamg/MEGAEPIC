import { describe, it, expect } from 'vitest';
import { createRegistrationEngine, buildClinicalContext } from '@/lib/clinical/constitutional/registration-engine';

describe('Constitutional Registration Engine', () => {

  it('initializes with identity stage active', () => {
    const engine = createRegistrationEngine();
    const state = engine.initialize();
    expect(state.stage).toBe('identity');
    expect(state.data['hospital_number']).toBeDefined();
    expect(state.data['hospital_number']?.value).toMatch(/^HN-/);
  });

  it('sets a field and returns updated state', () => {
    const engine = createRegistrationEngine();
    engine.initialize();
    const state = engine.setField('patient_name', 'Jerusha Karangu');
    expect(state.data['patient_name']?.value).toBe('Jerusha Karangu');
    expect(state.data['patient_name']?.state).toBe('captured');
  });

  it('calculates age from date of birth', () => {
    const engine = createRegistrationEngine();
    engine.initialize();
    const state = engine.setField('date_of_birth', '2008-06-15');
    const age = state.data['age']?.value as number;
    expect(age).toBeGreaterThanOrEqual(17);
    expect(age).toBeLessThanOrEqual(19);
  });

  it('progresses through stages', () => {
    const engine = createRegistrationEngine();
    engine.initialize();

    expect(engine.getState().stage).toBe('identity');

    engine.setField('patient_name', 'Test Patient');
    engine.setField('age', 30);
    engine.setField('sex', 'female');
    engine.nextStage();

    expect(engine.getState().stage).toBe('patient_context');

    engine.nextStage();
    expect(engine.getState().stage).toBe('encounter_context');

    engine.nextStage();
    expect(engine.getState().stage).toBe('clinical_context');

    engine.nextStage();
    expect(engine.getState().stage).toBe('administrative_context');

    engine.nextStage();
    expect(engine.getState().stage).toBe('registration_complete');
  });

  it('generates correct ClinicalContext for a female reproductive-age patient', () => {
    const engine = createRegistrationEngine();
    engine.initialize();
    engine.setField('patient_name', 'Mary Wanjiku');
    engine.setField('age', 27);
    engine.setField('sex', 'female');
    engine.setField('encounter_type', 'outpatient');
    engine.setField('department', 'medicine');

    const ctx = engine.getClinicalContext();

    expect(ctx.demographic.ageGroup).toBe('adult');
    expect(ctx.demographic.reproductiveStage).toBe('reproductive_age');
    expect(ctx.demographic.clinicalCohort).toBe('adult_female');
    expect(ctx.clinical.activeModules).toContain('female');
    expect(ctx.clinical.activeModules).toContain('adult');
    expect(ctx.clinical.isPediatric).toBe(false);
    expect(ctx.clinical.isGeriatric).toBe(false);
  });

  it('generates correct ClinicalContext for a 2-year-old male', () => {
    const engine = createRegistrationEngine();
    engine.initialize();
    engine.setField('patient_name', 'Baby John');
    engine.setField('age', 2);
    engine.setField('age_unit', 'years');
    engine.setField('sex', 'male');
    engine.setField('encounter_type', 'outpatient');
    engine.setField('department', 'pediatrics');

    const ctx = engine.getClinicalContext();

    expect(ctx.demographic.ageGroup).toBe('child');
    expect(ctx.demographic.clinicalCohort).toBe('pediatric_male');
    expect(ctx.demographic.reproductiveStage).toBe('male');
    expect(ctx.clinical.activeModules).toContain('pediatric');
    expect(ctx.clinical.isPediatric).toBe(true);
    expect(ctx.encounter.department).toBe('pediatrics');
    expect(ctx.workflow.availableHpiTemplates).toContain('pediatric_hpi');
    expect(ctx.workflow.availableExaminationModules).toContain('pediatric_examination');
    expect(ctx.workflow.availableExaminationModules).toContain('growth_assessment');
  });

  it('generates correct ClinicalContext for a 70-year-old male with emergency encounter', () => {
    const engine = createRegistrationEngine();
    engine.initialize();
    engine.setField('patient_name', 'John Kamau');
    engine.setField('age', 70);
    engine.setField('sex', 'male');
    engine.setField('encounter_type', 'emergency');
    engine.setField('department', 'emergency_medicine');
    engine.setField('triage_category', 'red');
    engine.setField('mode_of_arrival', 'ambulance');

    const ctx = engine.getClinicalContext();

    expect(ctx.demographic.ageGroup).toBe('elderly');
    expect(ctx.demographic.clinicalCohort).toBe('geriatric_male');
    expect(ctx.demographic.geriatricSubtype).toBe('young_old');
    expect(ctx.clinical.isGeriatric).toBe(true);
    expect(ctx.encounter.isEmergency).toBe(true);
    expect(ctx.encounter.triageCategory).toBe('red');
    expect(ctx.encounter.modeOfArrival).toBe('ambulance');
    expect(ctx.workflow.workflowType).toBe('emergency_resuscitation');
    expect(ctx.workflow.requiredScoringSystems).toContain('news');
  });

  it('generates correct ClinicalContext for a pregnant patient', () => {
    const engine = createRegistrationEngine();
    engine.initialize();
    engine.setField('patient_name', 'Grace Akinyi');
    engine.setField('age', 24);
    engine.setField('sex', 'female');
    engine.setField('reproductive_status', 'reproductive_age');
    engine.setField('pregnancy_related', 'yes');
    engine.setField('are_you_pregnant', 'pregnant');
    engine.setField('pregnancy_confirmation_method', 'upt');
    engine.setField('lmp', '2026-02-01');
    engine.setField('gravida', 2);
    engine.setField('para', 1);
    engine.setField('encounter_type', 'antenatal');
    engine.setField('department', 'obstetrics_gynaecology');

    const ctx = engine.getClinicalContext();

    expect(ctx.clinical.pregnancy).toBe('pregnant');
    expect(ctx.clinical.pregnancyDetails.confirmed?.value).toBe(true);
    expect(ctx.clinical.pregnancyDetails.gravida?.value).toBe(2);
    expect(ctx.clinical.activeModules).toContain('pregnancy');
    expect(ctx.clinical.activeModules).toContain('obstetrics');
    expect(ctx.encounter.encounterType).toBe('antenatal');
    expect(ctx.workflow.availableHpiTemplates).toContain('obstetric_hpi');
    expect(ctx.workflow.availableExaminationModules).toContain('obstetric_examination');
  });

  it('respects visibility rules — male should not see pregnancy fields', () => {
    const engine = createRegistrationEngine();
    engine.initialize();
    engine.setField('age', 30);
    engine.setField('sex', 'male');

    const fields = engine.getState().activeFields;
    expect(fields).not.toContain('reproductive_status');
    expect(fields).not.toContain('pregnancy_related');
    expect(fields).not.toContain('are_you_pregnant');
  });

  it('respects visibility rules — children should not see marital status or occupation', () => {
    const engine = createRegistrationEngine();
    engine.initialize();
    engine.setField('age', 8);
    engine.setField('age_unit', 'years');
    engine.setField('sex', 'female');
    engine.nextStage();

    const fields = engine.getState().activeFields;
    expect(fields).not.toContain('marital_status');
    expect(fields).not.toContain('occupation');
    expect(fields).toContain('schooling');
  });

  it('can set answer state independently of value', () => {
    const engine = createRegistrationEngine();
    engine.initialize();
    engine.setField('age', 30);
    engine.setAnswerState('age', 'unknown');
    const answer = engine.getState().data['age'];
    expect(answer?.value).toBe(30);
    expect(answer?.state).toBe('unknown');
  });

  it('produces context summary at registration complete', () => {
    const engine = createRegistrationEngine();
    engine.initialize();
    engine.setField('patient_name', 'Test Patient');
    engine.setField('age', 27);
    engine.setField('sex', 'female');
    engine.setField('encounter_type', 'emergency');
    engine.setField('department', 'emergency_medicine');
    engine.setField('triage_category', 'red');

    const summary = engine.getState().contextSummary;
    expect(summary.length).toBeGreaterThanOrEqual(3);
    expect(summary.some(s => s.includes('Adult'))).toBe(true);
    expect(summary.some(s => s.includes('Emergency'))).toBe(true);
    expect(summary.some(s => s.includes('RED'))).toBe(true);
  });
});
