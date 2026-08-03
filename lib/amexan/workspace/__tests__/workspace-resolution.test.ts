import { describe, it, expect } from 'vitest';

import {
  computeWorkspaceCompleteness,
  isWorkspaceComplete,
  resolveCompletenessProfile,
} from '../completeness';

import {
  WorkspaceResolutionEngine,
  resolveWorkspaceGate,
} from '../WorkspaceResolutionEngine';

import type { ResolvedWorkspace, Membership } from '../types';
import type { ProfessionalIdentity } from '../../constitution/types';

function makeWorkspace(overrides: Partial<Pick<ResolvedWorkspace, 'professional' | 'memberships' | 'activeMembership' | 'organization' | 'facility' | 'department' | 'activeEmployment' | 'activeAssignment' | 'activeShift'>> = {}): ResolvedWorkspace {
  return {
    identity: {} as any,
    person: {} as any,
    professional: null,
    memberships: [],
    activeMembership: null,
    organization: null,
    facility: null,
    campus: null,
    building: null,
    floor: null,
    department: null,
    unit: null,
    ward: null,
    clinic: null,
    employments: [],
    activeEmployment: null,
    assignments: [],
    activeAssignment: null,
    currentAssignments: [],
    shifts: [],
    activeShift: null,
    shiftAssignment: null,
    teams: [],
    activeTeam: null,
    role: { id: 'user', name: 'User' } as any,
    permissions: [],
    responsibilities: [],
    activePatientIds: [],
    activeEncounterIds: [],
    isOnDuty: false,
    isLoading: false,
    lastResolvedAt: Date.now(),
    completeness: undefined as any,
    navigation: { primary: [], secondary: [], quickAccess: [] },
    dashboard: { title: '', greeting: '', layout: 'clinical', sections: [], widgets: [], theme: 'light' },
    quickActions: [],
    ...overrides,
  };
}

const clinician = { uid: 'x' as any, personId: 'x' as any, categories: ['medical_doctor'], primaryCategory: 'medical_doctor', specialties: [], qualifications: [], yearsOfExperience: 3, verified: false, verificationDocuments: [] } as ProfessionalIdentity;
const admin = { uid: 'x' as any, personId: 'x' as any, categories: ['facility_admin'], primaryCategory: 'facility_admin', specialties: [], qualifications: [], yearsOfExperience: 1, verified: false, verificationDocuments: [] } as ProfessionalIdentity;
const membership = { id: 'm1', personId: 'x' as any, organizationId: 'o1', organizationName: 'KTRH', organizationType: 'hospital', roleId: 'doc', roleName: 'Doctor', isPrimary: true, status: 'active', joinedAt: 1, updatedAt: 1 } as Membership;
const org = { id: 'o1', name: 'KTRH', type: 'hospital', level: 'national', status: 'active' } as any;

describe('Workspace Completeness (Book XV)', () => {
  it('a full clinical workspace is complete', () => {
    const w = makeWorkspace({
      professional: clinician,
      activeMembership: membership,
      organization: org,
      facility: { id: 'f1', name: 'KTRH', type: 'hospital', status: 'active' } as any,
      department: { id: 'd1', name: 'Internal Medicine', type: 'medical', status: 'active' } as any,
      activeEmployment: { id: 'e1' } as any,
      activeAssignment: { id: 'a1', type: 'ward_round', status: 'active' } as any,
      activeShift: { id: 's1', type: 'morning' } as any,
    });
    const c = computeWorkspaceCompleteness(w);
    expect(c.isComplete).toBe(true);
    expect(c.score).toBe(1);
    expect(c.missing).toEqual([]);
    expect(isWorkspaceComplete(w)).toBe(true);
  });

  it('a clinician missing organization/employment/assignment is incomplete', () => {
    const w = makeWorkspace({ professional: clinician });
    const c = computeWorkspaceCompleteness(w);
    expect(c.isComplete).toBe(false);
    expect(c.missing).not.toContain('professional');
    expect(c.missing).toContain('membership');
    expect(c.missing).toContain('organization');
    expect(c.missing).toContain('employment');
    expect(c.score).toBeLessThan(1);
  });

  it('a patient without facility context is complete', () => {
    const w = makeWorkspace({
      professional: { ...clinician, primaryCategory: 'patient' },
      activeMembership: membership,
      organization: org,
    });
    const c = computeWorkspaceCompleteness(w);
    expect(c.isComplete).toBe(true);
  });

  it('an individual-practice actor is complete only when Continue Individually was chosen explicitly', () => {
    const w = makeWorkspace({ professional: clinician });
    const c = computeWorkspaceCompleteness(w, { workspaceChoice: 'individual' });
    expect(resolveCompletenessProfile(w, { workspaceChoice: 'individual' })).toBe('individual');
    expect(c.isComplete).toBe(true);
  });

  it('a registrationStep of complete alone is NOT individual practice intent', () => {
    // The regression that put users on "Individual Practice → Off Duty": the
    // onboarding flag said complete but no workspace was ever chosen.
    const w = makeWorkspace({ professional: clinician });
    const c = computeWorkspaceCompleteness(w, { registrationStep: 'complete' });
    expect(resolveCompletenessProfile(w, { registrationStep: 'complete' })).toBe('professional');
    expect(c.isComplete).toBe(false);
    expect(c.missing).toContain('membership');
  });

  it('a clinician who never finished onboarding is incomplete, not individual practice', () => {
    const w = makeWorkspace({ professional: clinician });
    const c = computeWorkspaceCompleteness(w, { registrationStep: 'professional' });
    expect(resolveCompletenessProfile(w, { registrationStep: 'professional' })).toBe('professional');
    expect(c.isComplete).toBe(false);
  });

  it('an administrator requires membership but not facility/assignment', () => {
    const w = makeWorkspace({
      professional: admin,
      activeMembership: membership,
      organization: org,
    });
    const c = computeWorkspaceCompleteness(w);
    expect(c.isComplete).toBe(true);
  });

  it('works without a professional identity at all', () => {
    const w = makeWorkspace({});
    const c = computeWorkspaceCompleteness(w);
    expect(c.isComplete).toBe(false);
    expect(c.missing).toContain('professional');
    expect(c.score).toBeLessThan(0.5);
  });
});

describe('Workspace Resolution Engine (CR-WS-001 gate)', () => {
  it('routes a null workspace to onboarding', () => {
    const decision = resolveWorkspaceGate(null);
    expect(decision.type).toBe('onboarding');
    expect(decision.nextStep).toBe('professional');
    expect(decision.route).toBe('/register/constitution');
  });

  it('returns ready for a complete workspace', () => {
    const w = makeWorkspace({
      professional: clinician,
      activeMembership: membership,
      organization: org,
      facility: { id: 'f1', name: 'KTRH', type: 'hospital', status: 'active' } as any,
      department: { id: 'd1', name: 'Internal Medicine', type: 'medical', status: 'active' } as any,
      activeEmployment: { id: 'e1' } as any,
      activeAssignment: { id: 'a1', type: 'ward_round', status: 'active' } as any,
      activeShift: { id: 's1', type: 'morning' } as any,
    });
    const decision = new WorkspaceResolutionEngine().resolve(w);
    expect(decision.type).toBe('ready');
    expect(decision.isComplete).toBe(true);
    expect(decision.nextStep).toBeNull();
    expect(decision.route).toBeNull();
  });

  it('routes an incomplete clinical workspace to onboarding with a next step', () => {
    const w = makeWorkspace({ professional: clinician });
    const decision = new WorkspaceResolutionEngine().resolve(w);
    expect(decision.type).toBe('onboarding');
    expect(decision.missing).toContain('membership');
    expect(decision.nextStep).toBe('organization_choice');
    expect(decision.gaps.length).toBeGreaterThan(0);
    expect(decision.route).toBe('/register/constitution');
  });

  it('maps membership gap to organization_choice', () => {
    const w = makeWorkspace({
      professional: clinician,
      organization: org,
    });
    const decision = new WorkspaceResolutionEngine().resolve(w);
    expect(decision.type).toBe('onboarding');
    expect(decision.nextStep).toBe('organization_choice');
    const gap = decision.gaps.find(g => g.element === 'membership');
    expect(gap?.step).toBe('organization_choice');
    expect(gap?.ruleId).toBe('WS-004');
  });

  it('never fabricates a dashboard fallback for incomplete workspaces', () => {
    const w = makeWorkspace({ professional: clinician });
    const decision = new WorkspaceResolutionEngine().resolve(w);
    expect(decision.type).toBe('onboarding');
    expect(decision.route).not.toBeNull();
  });

  it('returns ready for an explicit individual-practice actor with no membership', () => {
    const w = makeWorkspace({ professional: clinician });
    const decision = new WorkspaceResolutionEngine().resolve(w, { workspaceChoice: 'individual' });
    expect(decision.type).toBe('ready');
    expect(decision.profile).toBe('individual');
    expect(decision.route).toBeNull();
  });

  it('returns choose_workspace when memberships exist but none is active (WS-009)', () => {
    const w = makeWorkspace({
      professional: clinician,
      memberships: [membership, { ...membership, id: 'm2', organizationId: 'o2', organizationName: 'Aga Khan' }],
    });
    const decision = new WorkspaceResolutionEngine().resolve(w);
    expect(decision.type).toBe('choose_workspace');
    expect(decision.nextStep).toBe('workspace_choice');
    expect(decision.gaps).toContainEqual(
      expect.objectContaining({ element: 'membership', step: 'workspace_choice', ruleId: 'WS-004' })
    );
    expect(decision.route).toBe('/register/constitution');
  });

  it('does not fabricate choose_workspace when no memberships exist', () => {
    const w = makeWorkspace({ professional: clinician });
    const decision = new WorkspaceResolutionEngine().resolve(w);
    expect(decision.type).not.toBe('choose_workspace');
    expect(decision.type).toBe('onboarding');
  });
});
