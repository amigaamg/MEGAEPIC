import { describe, it, expect } from 'vitest';
import {
  buildWorkspace,
} from '@/lib/amexan/workspace/builder/workspace-builder';
import {
  routeWorkspace,
  morphTarget,
} from '@/lib/amexan/workspace/router/workspace-router';
import {
  workspaceContext,
  createWorkspaceContext,
  contextLabel,
} from '@/lib/amexan/workspace/context/workspace-context';
import {
  workspaceLifecycle,
  initializeWorkspace,
  activateWorkspace,
  suspendWorkspace,
} from '@/lib/amexan/workspace/lifecycle/workspace-lifecycle';
import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { DeviceInfo } from '@/lib/amexan/presentation/types';

const identity = { uid: 'uid-1' } as unknown as AmxUid;

const session = {
  identity,
  organizationId: 'org-1',
  organizationName: 'County Hospital',
  departmentId: 'dept-1',
  departmentName: 'General Medicine',
  shiftType: 'day',
  assignmentType: 'ward_round',
  assignmentTitle: 'Ward Round',
  location: 'Ward 3',
  role: 'doctor',
  position: 'Registrar',
  permissions: ['read:*'],
};

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

describe('Workspace Builder', () => {
  it('assembles a workspace from session, role, and theme', () => {
    const built = buildWorkspace({ session, organizationType: 'hospital' });
    expect(built.themeId).toBe('hospital');
    expect(built.role).toBe('doctor');
    expect(built.layout.leftPane.id).toBeDefined();
    expect(built.quickActions.length).toBeGreaterThan(0);
  });
});

describe('Workspace Router', () => {
  it('routes without reload and preserves state', () => {
    const decision = routeWorkspace({ session, device: device() });
    expect(decision.keepState).toBe(true);
    expect(decision.morph).toBe(true);
    expect(decision.workspaceId).toBe('ward_round');
  });

  it('morphs only on workspace change', () => {
    expect(morphTarget('ward_round', 'clinic')).toBe(true);
    expect(morphTarget('ward_round', 'ward_round')).toBe(false);
  });
});

describe('Workspace Context', () => {
  it('builds breadcrumbs and entity from the session', () => {
    const ctx = createWorkspaceContext(session, device());
    expect(ctx.breadcrumbs.length).toBe(3);
    expect(contextLabel(ctx)).toBe('General Medicine');
  });

  it('resolves active patient as the entity when present', () => {
    const withPatient = { ...session, activePatientId: 'p-9' };
    const ctx = createWorkspaceContext(withPatient, device());
    expect(workspaceContext.label(ctx)).toBe('Patient p-9');
  });
});

describe('Workspace Lifecycle', () => {
  it('moves a workspace through stages', () => {
    let record = initializeWorkspace(session);
    expect(record.stage).toBe('created');
    record = activateWorkspace(record);
    expect(record.stage).toBe('active');
    record = suspendWorkspace(record);
    expect(workspaceLifecycle.alive(record)).toBe(false);
  });
});
