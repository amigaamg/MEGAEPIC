import { describe, it, expect } from 'vitest';
import {
  experienceGuarantees,
  fatigueTiers,
  focusModes,
} from '@/lib/amexan/experience/constitution';
import {
  journeyEngine,
  initializeJourney,
  advancePhase,
  journeyProgress,
} from '@/lib/amexan/experience/journey-engine';
import {
  focusEngine,
  focusModeFor,
  initialFocus,
  setActiveTask,
  isFocused,
} from '@/lib/amexan/experience/focus-engine';
import {
  fatigueEngine,
  assessFatigue,
} from '@/lib/amexan/experience/fatigue-engine';
import {
  trustEngine,
  assessTrust,
  everyAiOutputLabeled,
} from '@/lib/amexan/experience/trust-engine';
import {
  continuityEngine,
  captureSnapshot,
  resumeFromSnapshot,
  isSnapshotFresh,
} from '@/lib/amexan/experience/continuity-engine';
import type { DeviceInfo } from '@/lib/amexan/presentation/types';

const device = (overrides: Partial<DeviceInfo> = {}): DeviceInfo => ({
  viewportClass: 'xl',
  width: 1440,
  height: 900,
  heightClass: 'normal',
  orientation: 'landscape',
  pixelDensity: 1,
  pointerType: 'fine',
  interactionMode: 'hover',
  hasKeyboard: true,
  hasScreenReader: false,
  prefersReducedMotion: false,
  prefersHighContrast: false,
  colorScheme: 'light',
  online: true,
  browser: 'chromium',
  touchSupported: false,
  ...overrides,
});

describe('Experience Constitution', () => {
  it('guarantees journey, focus, fatigue, trust, and continuity', () => {
    for (const g of ['journey_always_present', 'focus_on_the_task', 'fatigue_aware', 'trust_transparent', 'continuity_preserved']) {
      expect(experienceGuarantees).toContain(g);
    }
  });
});

describe('Journey Engine', () => {
  it('initializes a journey at its default phase', () => {
    const state = initializeJourney('patient_care');
    expect(state.currentPhase).toBe('assessment');
    expect(state.nextPhase).toBe('diagnosis');
  });

  it('advances through phases in order and reports progress', () => {
    let state = initializeJourney('admission');
    expect(journeyProgress(state)).toBe(50);
    state = advancePhase(state);
    expect(state.currentPhase).toBe('assessment');
    expect(state.completedPhases).toContain('registration');
  });

  it('does not advance past the final phase', () => {
    const journey = journeyEngine.get('patient_care')!;
    let state = initializeJourney('patient_care');
    for (let i = 0; i < journey.phases.length; i++) state = advancePhase(state);
    expect(state.nextPhase).toBeNull();
  });
});

describe('Focus Engine', () => {
  it('chooses single-surface focus on phones', () => {
    expect(focusModeFor(device({ viewportClass: 'sm' }), 'doctor')).toBe('focused');
  });

  it('initial focus reflects mode', () => {
    const state = initialFocus('focused');
    expect(state.surfaces).toBe('single');
    expect(state.interruptions).toBe('deferred');
  });

  it('task focus is only active when a task is set', () => {
    let state = initialFocus('productive');
    expect(isFocused(state)).toBe(false);
    state = setActiveTask(state, 'task-1');
    expect(focusEngine.focused(state)).toBe(true);
  });
});

describe('Fatigue Engine', () => {
  it('detects extended high-load sessions', () => {
    const decision = assessFatigue({ sessionMinutes: 180, consecutiveInteractions: 500, errorRate: 0.2, timeOfDay: 14, role: 'nurse' });
    expect(decision.tier).toBe('very_fatigued');
    expect(decision.recommendBreak).toBe(true);
    expect(fatigueEngine.reducesChrome(decision.tier)).toBe(true);
  });

  it('healthy sessions stay alert', () => {
    const decision = assessFatigue({ sessionMinutes: 30, consecutiveInteractions: 40, errorRate: 0.02, timeOfDay: 10, role: 'doctor' });
    expect(decision.tier).toBe('alert');
  });
});

describe('Trust Engine', () => {
  it('requires source attribution for high trust', () => {
    const decision = assessTrust({ dataAccess: [{ resource: 'vitals', purpose: 'triage' }], aiAssistUsed: true, syncPending: 0, sourceAttribution: false });
    expect(decision.trustLevel).toBe('low');
  });

  it('labels all AI output transparently', () => {
    expect(everyAiOutputLabeled({ aiAssistUsed: true, labeled: true })).toBe(true);
    expect(everyAiOutputLabeled({ aiAssistUsed: true, labeled: false })).toBe(false);
  });
});

describe('Continuity Engine', () => {
  it('captures and resumes the exact workspace state', () => {
    const snapshot = captureSnapshot({ workspaceId: 'ward_round', focusMode: 'professional' });
    const resumed = resumeFromSnapshot(snapshot);
    expect(resumed.resumed).toBe(true);
    expect(resumed.restoredWorkspace).toBe('ward_round');
  });

  it('evaluates snapshot freshness', () => {
    const snapshot = captureSnapshot({ workspaceId: 'x', focusMode: 'focused' });
    expect(isSnapshotFresh(snapshot, 60000)).toBe(true);
    const old = { ...snapshot, savedAt: Date.now() - 120000 };
    expect(isSnapshotFresh(old, 60000)).toBe(false);
  });
});
