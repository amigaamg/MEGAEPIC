import { describe, it, expect, beforeEach } from 'vitest';
import { usePresentationStore } from '@/lib/amexan/presentation/store';
import { routeExperience, listAccessibleJourneys, canAccessJourney, canAccessPatientData } from '@/lib/amexan/presentation/experience-engine';
import { buildThemeContext, getBrand, getLayoutForRole } from '@/lib/amexan/presentation/theme-engine';
import { getDeviceInfo } from '@/lib/amexan/presentation/device-constitution';
import { ACTORS, JOURNEYS, checkPermission, getActor } from '@/lib/amexan/constitution/books/book-II-experience';

describe('Presentation Store Integration', () => {
  beforeEach(() => {
    usePresentationStore.setState({
      actorId: 'doctor' as any,
      journeyId: 'clinical_care' as any,
      phaseId: 'registration',
      patientId: 'P001',
      encounterId: '',
      facilityName: 'Test Hospital',
      completionMap: {},
      alerts: [],
      clinicalSummary: {},
      presentation: null,
      theme: null,
      experience: null,
      loading: false,
      error: null,
    });
  });

  it('initializes from request', () => {
    const store = usePresentationStore.getState();
    store.initializeFromRequest({
      actorId: 'nurse' as any,
      patientId: 'P002',
      facility: { name: 'Ward' },
    });
    const s = usePresentationStore.getState();
    expect(s.actorId).toBe('nurse');
    expect(s.patientId).toBe('P002');
    expect(s.facilityName).toBe('Ward');
  });

  it('setActor changes actor and refreshes', () => {
    const store = usePresentationStore.getState();
    expect(store.patientId).toBe('P001');
    store.setActor('patient' as any);
    expect(usePresentationStore.getState().actorId).toBe('patient');
  });

  it('updateCompletion updates completion map', () => {
    usePresentationStore.getState().updateCompletion('registration', 100);
    expect(usePresentationStore.getState().completionMap.registration).toBe(100);
  });

  it('addAlert and dismissAlert', () => {
    const store = usePresentationStore.getState();
    store.addAlert({ id: 'test1', type: 'warning', message: 'Test warning' });
    expect(usePresentationStore.getState().alerts).toHaveLength(1);
    store.dismissAlert('test1');
    expect(usePresentationStore.getState().alerts).toHaveLength(0);
  });

  it('navigateToPhase changes phase', () => {
    usePresentationStore.getState().navigateToPhase('history');
    expect(usePresentationStore.getState().phaseId).toBe('history');
  });

  it('setJourney changes journey', () => {
    usePresentationStore.getState().setJourney('emergency' as any);
    expect(usePresentationStore.getState().journeyId).toBe('emergency');
  });
});

describe('Full Engine->UI Pipeline', () => {
  it('routeExperience returns presentation with all required fields', () => {
    const experience = routeExperience({
      actorId: 'doctor',
      patientId: 'P001',
      context: {},
      facility: { name: 'Hospital' },
    });

    expect(experience.routing.allowed).toBe(true);
    expect(experience.journey.id).toBe('clinical_care');
    expect(experience.presentation).toBeDefined();
    expect(experience.presentation.cards.length).toBeGreaterThan(0);
    expect(experience.presentation.layout).toBeDefined();
    expect(experience.presentation.device).toBeDefined();
    expect(experience.presentation.theme).toBeDefined();
  });

  it('all actors get a valid presentation', () => {
    const actors = Object.keys(ACTORS) as Array<keyof typeof ACTORS>;
    for (const actorId of actors) {
      const exp = routeExperience({
        actorId: actorId as any,
        patientId: 'P001',
        context: {},
        facility: { name: 'Test' },
      });
      expect(exp.actor.id).toBe(actorId);
      if (exp.routing.allowed) {
        expect(exp.presentation.cards.length).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('Theme Engine Integration', () => {
  it('generates CSS variables from theme context', () => {
    const brand = getBrand();
    const device = getDeviceInfo();
    const theme = buildThemeContext({ role: 'doctor', brand, device });
    const vars = {
      '--color-primary': theme.colors.primary,
      '--color-secondary': theme.colors.secondary,
    };
    expect(vars['--color-primary']).toBe('#2563eb');
    expect(vars['--color-secondary']).toBe('#1d4ed8');
  });

  it('patient role gets different colors from doctor', () => {
    const brand = getBrand();
    const device = getDeviceInfo();
    const doctorTheme = buildThemeContext({ role: 'doctor', brand, device });
    const patientTheme = buildThemeContext({ role: 'patient', brand, device });
    expect(doctorTheme.colors.primary).not.toBe(patientTheme.colors.primary);
  });

  it('getLayoutForRole returns correct layout', () => {
    expect(getLayoutForRole('doctor')).toBe('sidebar');
    expect(getLayoutForRole('patient')).toBe('topbar');
    expect(getLayoutForRole('nurse')).toBe('sidebar');
  });

  it('buildThemeContext applies role overrides', () => {
    const brand = getBrand();
    const device = getDeviceInfo();
    const theme = buildThemeContext({ role: 'nurse', brand, device });
    expect(theme.colors.primary).toBe('#059669');
  });
});

describe('Experience Engine Integration', () => {
  it('listAccessibleJourneys returns correct count for each actor', () => {
    for (const [actorId] of Object.entries(ACTORS)) {
      const journeys = listAccessibleJourneys(actorId as any);
      const matching = Object.values(JOURNEYS).filter(j => j.actors.includes(actorId as any));
      expect(journeys.length).toBe(matching.length);
    }
  });

  it('canAccessPatientData returns correct levels', () => {
    expect(canAccessPatientData('doctor')).toBe('full');
    expect(canAccessPatientData('patient')).toBe('self');
    expect(canAccessPatientData('student')).toBe('deidentified');
    expect(canAccessPatientData('administrator')).toBe('limited');
  });

  it('doctor can access clinical_care but not patient_portal', () => {
    expect(canAccessJourney('doctor', 'clinical_care')).toBe(true);
    expect(canAccessJourney('doctor', 'patient_portal')).toBe(false);
  });

  it('patient can access patient_portal but not clinical_care', () => {
    expect(canAccessJourney('patient', 'patient_portal')).toBe(true);
    expect(canAccessJourney('patient', 'clinical_care')).toBe(false);
  });
});

describe('Constitution + Engine Integration', () => {
  it('every actor in JOURNEYS exists in ACTORS', () => {
    const actorKeys = Object.keys(ACTORS);
    for (const journey of Object.values(JOURNEYS)) {
      for (const actorId of journey.actors) {
        expect(actorKeys).toContain(actorId);
      }
    }
  });

  it('every actor has a valid default journey', () => {
    for (const actor of Object.values(ACTORS)) {
      expect(JOURNEYS[actor.defaultJourney]).toBeDefined();
    }
  });

  it('checkPermission works with actor permissions', () => {
    const doctor = ACTORS.doctor;
    expect(checkPermission(
      { actor: 'doctor', resource: 'clinical', action: 'write', context: {} },
      doctor.permissions
    )).toBe(true);

    const patient = ACTORS.patient;
    expect(checkPermission(
      { actor: 'patient', resource: 'clinical', action: 'write', context: {} },
      patient.permissions
    )).toBe(false);
  });
});
