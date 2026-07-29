import { describe, it, expect } from 'vitest';
import {
  ACTORS, JOURNEYS, getActor, getJourney, getJourneyForActor,
  checkPermission,
} from '@/lib/amexan/constitution/books/book-II-experience';
import { routeExperience, listAccessibleJourneys, canAccessJourney, canAccessPatientData } from '@/lib/amexan/presentation/experience-engine';
import { buildThemeContext, getBrand } from '@/lib/amexan/presentation/theme-engine';
import { getDeviceInfo } from '@/lib/amexan/presentation/device-constitution';
import {
  getWorkflowsForJourney, getWorkflowById, evaluateTrigger, resolveWorkflowStep,
} from '@/lib/amexan/presentation/workflow-definitions';

// ── Book II: Actor & Journey Definitions ─────────────────────────────────────

describe('Book II: Actor Definitions', () => {
  it('defines all expected actors', () => {
    const ids = Object.keys(ACTORS);
    expect(ids).toContain('doctor');
    expect(ids).toContain('resident');
    expect(ids).toContain('consultant');
    expect(ids).toContain('nurse');
    expect(ids).toContain('midwife');
    expect(ids).toContain('patient');
    expect(ids).toContain('student');
    expect(ids).toContain('pharmacist');
    expect(ids).toContain('lab_technician');
    expect(ids).toContain('radiologist');
    expect(ids).toContain('administrator');
    expect(ids).toContain('community_health_worker');
    expect(ids).toContain('researcher');
    expect(ids).toContain('educator');
    expect(ids).toContain('regulator');
    expect(ids).toContain('insurance_adjuster');
    expect(ids).toContain('family_member');
    expect(ids).toContain('developer');
    expect(ids).toContain('ai_agent');
    expect(ids.length).toBeGreaterThanOrEqual(19);
  });

  it('doctor has expected permissions', () => {
    const doctor = ACTORS.doctor;
    expect(doctor.permissions).toContain('read:all');
    expect(doctor.permissions).toContain('write:clinical');
    expect(doctor.permissions).toContain('write:orders');
    expect(doctor.defaultJourney).toBe('clinical_care');
    expect(doctor.educationLevel).toBe('expert');
  });

  it('patient has limited permissions', () => {
    const patient = ACTORS.patient;
    expect(patient.permissions).toContain('read:self');
    expect(patient.permissions).toContain('write:self_reported');
    expect(patient.permissions).not.toContain('read:all');
    expect(patient.defaultJourney).toBe('patient_portal');
    expect(patient.educationLevel).toBe('basic');
  });

  it('student has learning journey', () => {
    const student = ACTORS.student;
    expect(student.defaultJourney).toBe('learning');
    expect(student.permissions).toContain('read:deidentified');
    expect(student.permissions).not.toContain('write:clinical');
  });

  it('getActor returns correct definition', () => {
    expect(getActor('nurse').label).toBe('Nurse');
    expect(getActor('unknown' as any).label).toBe('Doctor');
  });
});

describe('Book II: Journey Definitions', () => {
  it('defines all expected journeys', () => {
    const ids = Object.keys(JOURNEYS);
    expect(ids).toContain('clinical_care');
    expect(ids).toContain('nursing_care');
    expect(ids).toContain('learning');
    expect(ids).toContain('patient_portal');
    expect(ids).toContain('pharmacy');
    expect(ids).toContain('laboratory');
    expect(ids).toContain('radiology');
    expect(ids).toContain('telemedicine');
    expect(ids).toContain('emergency');
    expect(ids).toContain('research');
    expect(ids).toContain('education');
    expect(ids).toContain('community_health');
    expect(ids).toContain('public_health');
    expect(ids).toContain('insurance');
    expect(ids).toContain('ai_service');
    expect(ids).toContain('family_portal');
    expect(ids).toContain('developer_portal');
    expect(ids.length).toBeGreaterThanOrEqual(17);
  });

  it('clinical_care has correct phases in order', () => {
    const journey = JOURNEYS.clinical_care;
    expect(journey.actors).toContain('doctor');
    expect(journey.phases.map(p => p.id)).toEqual([
      'registration', 'history', 'examination', 'assessment', 'plan', 'documentation',
    ]);
  });

  it('each clinical_care phase has sections', () => {
    const journey = JOURNEYS.clinical_care;
    for (const phase of journey.phases) {
      expect(phase.sections.length).toBeGreaterThan(0);
    }
  });

  it('nursing_care has nursing-specific phases', () => {
    const journey = JOURNEYS.nursing_care;
    expect(journey.actors).toContain('nurse');
    expect(journey.actors).toContain('midwife');
    expect(journey.actors).not.toContain('doctor');
    expect(journey.phases.map(p => p.id)).toEqual([
      'handover', 'observations', 'medication', 'care', 'handover_out',
    ]);
  });

  it('learning journey has student-specific phases', () => {
    const journey = JOURNEYS.learning;
    expect(journey.actors).toContain('student');
    expect(journey.actors).toContain('resident');
    expect(journey.phases.map(p => p.id)).toEqual([
      'dashboard', 'case_study', 'reasoning', 'study', 'assessment',
    ]);
  });

  it('patient_portal has limited non-clinical phases', () => {
    const journey = JOURNEYS.patient_portal;
    expect(journey.phases.map(p => p.id)).toEqual([
      'home', 'self_report', 'education', 'appointments',
    ]);
  });

  it('emergency journey starts with triage', () => {
    const journey = JOURNEYS.emergency;
    expect(journey.phases[0].id).toBe('triage');
    expect(journey.phases[0].minCompletion).toBe(100);
    expect(journey.phases[1].id).toBe('assessment');
  });

  it('getJourney returns default for unknown', () => {
    expect(getJourney('unknown' as any).id).toBe('clinical_care');
  });

  it('getJourneyForActor returns correct default', () => {
    expect(getJourneyForActor('pharmacist').id).toBe('pharmacy');
    expect(getJourneyForActor('radiologist').id).toBe('radiology');
    expect(getJourneyForActor('lab_technician').id).toBe('laboratory');
  });

  it('completionCriteria defined for each journey', () => {
    for (const journey of Object.values(JOURNEYS)) {
      if (journey.id === 'patient_portal' || journey.id === 'family_portal') continue;
      expect(journey.completionCriteria.length).toBeGreaterThan(0);
    }
  });
});

describe('Book II: Permissions', () => {
  it('admin permission bypasses all checks', () => {
    expect(checkPermission(
      { actor: 'doctor', resource: 'any', action: 'delete', context: {} },
      ['admin']
    )).toBe(true);
  });

  it('specific permission matches exactly', () => {
    expect(checkPermission(
      { actor: 'doctor', resource: 'clinical', action: 'write', context: {} },
      ['write:clinical']
    )).toBe(true);
  });

  it('wildcard matches any resource', () => {
    expect(checkPermission(
      { actor: 'doctor', resource: 'clinical', action: 'read', context: {} },
      ['read:*']
    )).toBe(true);
  });

  it('read:all matches any read', () => {
    expect(checkPermission(
      { actor: 'doctor', resource: 'anything', action: 'read', context: {} },
      ['read:all']
    )).toBe(true);
  });

  it('missing permission returns false', () => {
    expect(checkPermission(
      { actor: 'patient', resource: 'clinical', action: 'write', context: {} },
      ['read:self']
    )).toBe(false);
  });
});

// ── Presentation Engine ──────────────────────────────────────────────────────

describe('Presentation Engine', () => {
  it('routeExperience returns presentation with cards and layout', () => {
    const exp = routeExperience({
      actorId: 'doctor',
      patientId: 'P001',
      context: {},
      facility: { name: 'Test Hospital' },
    });
    expect(exp.presentation.cards.length).toBeGreaterThan(0);
    expect(exp.presentation.layout.columns).toBeGreaterThan(0);
    expect(exp.routing.allowed).toBe(true);
  });

  it('routeExperience for disallowed actor-journey returns routing error', () => {
    const exp = routeExperience({
      actorId: 'patient',
      patientId: 'P005',
      context: {},
      requestedJourney: 'clinical_care',
      facility: { name: 'Test' },
    });
    expect(exp.routing.allowed).toBe(false);
    expect(exp.routing.reason).toContain('not permitted');
  });

  it('routeExperience returns valid presentation for all actors', () => {
    for (const actorId of Object.keys(ACTORS) as Array<keyof typeof ACTORS>) {
      const exp = routeExperience({
        actorId: actorId as any,
        patientId: 'P',
        context: {},
        facility: { name: 'T' },
      });
      expect(exp.presentation.device).toBeDefined();
      expect(exp.presentation.theme.colors).toBeDefined();
    }
  });
});

// ── Experience Engine ────────────────────────────────────────────────────────

describe('Experience Engine', () => {
  it('routes doctor to clinical_care by default', () => {
    const output = routeExperience({
      actorId: 'doctor',
      patientId: 'P001',
      context: {},
      facility: { name: 'Hospital' },
    });

    expect(output.actor.id).toBe('doctor');
    expect(output.journey.id).toBe('clinical_care');
    expect(output.routing.allowed).toBe(true);
  });

  it('routes patient to patient_portal by default', () => {
    const output = routeExperience({
      actorId: 'patient',
      patientId: 'P002',
      context: {},
      facility: { name: 'Clinic' },
    });

    expect(output.journey.id).toBe('patient_portal');
  });

  it('allows requesting a specific journey if actor is permitted', () => {
    const output = routeExperience({
      actorId: 'doctor',
      patientId: 'P003',
      requestedJourney: 'emergency',
      context: {},
      facility: { name: 'A&E' },
    });

    expect(output.journey.id).toBe('emergency');
    expect(output.routing.allowed).toBe(true);
  });

  it('redirects when actor not permitted for requested journey', () => {
    const output = routeExperience({
      actorId: 'patient',
      patientId: 'P004',
      requestedJourney: 'clinical_care',
      context: {},
      facility: { name: 'Test' },
    });

    expect(output.routing.allowed).toBe(false);
    expect(output.routing.redirectUrl).toBe('/patient_portal');
  });

  it('listAccessibleJourneys returns correct journeys for nurse', () => {
    const journeys = listAccessibleJourneys('nurse');
    const ids = journeys.map(j => j.id);
    expect(ids).toContain('nursing_care');
    expect(ids).not.toContain('clinical_care');
  });

  it('canAccessJourney returns correct boolean', () => {
    expect(canAccessJourney('doctor', 'clinical_care')).toBe(true);
    expect(canAccessJourney('patient', 'clinical_care')).toBe(false);
    expect(canAccessJourney('student', 'learning')).toBe(true);
    expect(canAccessJourney('nurse', 'radiology')).toBe(false);
  });

  it('canAccessPatientData returns correct level', () => {
    expect(canAccessPatientData('doctor')).toBe('full');
    expect(canAccessPatientData('patient')).toBe('self');
    expect(canAccessPatientData('student')).toBe('deidentified');
    expect(canAccessPatientData('family_member')).toBe('limited');
  });
});

// ── Theme Engine ─────────────────────────────────────────────────────────────

describe('Theme Engine', () => {
  it('builds default theme', () => {
    const brand = getBrand();
    const device = getDeviceInfo();
    const theme = buildThemeContext({ role: 'doctor', brand, device });
    expect(theme.colors.primary).toBe('#2563eb');
    expect(theme.brand.facilityName).toBe('Healthcare Facility');
    expect(theme.mode).toBe(device.colorScheme || 'light');
  });

  it('builds role-specific theme for patient', () => {
    const brand = getBrand();
    const device = getDeviceInfo();
    const theme = buildThemeContext({ role: 'patient', brand, device });
    expect(theme.colors.primary).toBe('#0891b2');
    expect(theme.colors.secondary).toBe('#0e7490');
  });

  it('builds role-specific theme for nurse', () => {
    const brand = getBrand();
    const device = getDeviceInfo();
    const theme = buildThemeContext({ role: 'nurse', brand, device });
    expect(theme.colors.primary).toBe('#059669');
  });

  it('respects overrides', () => {
    const brand = getBrand();
    const device = getDeviceInfo();
    const theme = buildThemeContext({ role: 'doctor', brand, device, overrides: { mode: 'dark', fontScale: 1.2, density: 'compact' } });
    expect(theme.mode).toBe('dark');
    expect(theme.typography.fontScale).toBe(1.2);
    expect(theme.layout.density).toBe('compact');
  });
});

// ── Workflow Definitions ─────────────────────────────────────────────────────

describe('Workflow Definitions', () => {
  it('returns workflows for clinical_care', () => {
    const workflows = getWorkflowsForJourney('clinical_care');
    expect(workflows.length).toBeGreaterThan(0);
    expect(workflows.some(w => w.id === 'wf_triage_to_registration')).toBe(true);
  });

  it('returns workflow by id', () => {
    const wf = getWorkflowById('wf_triage_to_registration');
    expect(wf).toBeDefined();
    expect(wf!.name).toBe('Auto-fill from Triage');
  });

  it('evaluateTrigger handles conditions', () => {
    const wf = getWorkflowById('wf_nursing_handover')!;
    expect(evaluateTrigger(wf, { shift_type: 'day' })).toBe(true);
    expect(evaluateTrigger(wf, { shift_type: 'night' })).toBe(false);
  });

  it('evaluateTrigger returns true when no condition', () => {
    const wf = getWorkflowById('wf_triage_to_registration')!;
    expect(evaluateTrigger(wf, {})).toBe(true);
  });

  it('resolveWorkflowStep replaces template variables', () => {
    const wf = getWorkflowById('wf_critical_alert')!;
    const step = wf.steps[0];
    const resolved = resolveWorkflowStep(step, { result: 'Glucose 500 mg/dL' });
    expect((resolved.message as string)).toBe('Critical lab result received: Glucose 500 mg/dL');
  });
});