import { describe, it, expect } from 'vitest';

import {
  resolveFamily,
  guardFamily,
  guardWorkspace,
  familyRedirect,
  loginRedirectForRole,
  WorkspaceMismatchError,
} from '../WorkspaceGuard';

import { DEMO_WORKSPACE_ACCOUNTS } from '../../demo/demoWorkspaces';

describe('WorkspaceGuard family resolution (WS-013)', () => {
  it('maps every executive category to the executive family', () => {
    for (const c of ['facility_admin', 'facility_administrator', 'hospital_admin', 'hospital_director', 'medical_superintendent', 'county_director', 'regional_director', 'national_director', 'super_admin']) {
      expect(resolveFamily(c)).toBe('executive');
    }
  });

  it('maps clinical categories to the clinical family', () => {
    for (const c of ['medical_doctor', 'consultant', 'resident', 'registrar', 'medical_officer', 'clinical_officer', 'surgeon', 'anaesthetist', 'dentist']) {
      expect(resolveFamily(c)).toBe('clinical');
    }
  });

  it('maps nursing/pharmacy/lab/radiology categories correctly', () => {
    expect(resolveFamily('nurse')).toBe('nursing');
    expect(resolveFamily('pharmacist')).toBe('pharmacy');
    expect(resolveFamily('lab_technologist')).toBe('laboratory');
    expect(resolveFamily('radiographer')).toBe('radiology');
  });

  it('maps department and patient families', () => {
    expect(resolveFamily('department_head')).toBe('department');
    expect(resolveFamily('ward_in_charge')).toBe('department');
    expect(resolveFamily('patient')).toBe('patient');
  });

  it('returns null for unknown categories (guard treats null as a mismatch)', () => {
    expect(resolveFamily('spy')).toBeNull();
    expect(resolveFamily(null)).toBeNull();
    expect(resolveFamily(undefined)).toBeNull();
  });

  it('accepts a human-readable role name as a fallback alias', () => {
    expect(resolveFamily('doctor', 'Specialist')).toBe('clinical');
    expect(resolveFamily('something', 'Pharmacy')).toBe('pharmacy');
    expect(resolveFamily('administrative')).toBe('executive');
  });
});

describe('WorkspaceGuard demo accounts land on their own workspace (WS-013/WS-016)', () => {
  it('every demo account resolves to the family declared in the seed', () => {
    for (const account of DEMO_WORKSPACE_ACCOUNTS) {
      const category = account.role === 'patient' ? 'patient' : account.role;
      expect(resolveFamily(category)).toBe(account.family);
    }
  });

  it('every demo account passes the guard for its own family', () => {
    for (const account of DEMO_WORKSPACE_ACCOUNTS) {
      const category = account.role === 'patient' ? 'patient' : account.role;
      expect(guardFamily(category, undefined, [account.family])).toBeNull();
    }
  });

  it('the demo dashboard route matches the guard redirect for a mismatched actor', () => {
    for (const account of DEMO_WORKSPACE_ACCOUNTS) {
      const category = account.role === 'patient' ? 'patient' : account.role;
      const redirect = familyRedirect(resolveFamily(category));
      expect(redirect).toBe(account.dashboardRoute);
    }
  });
});

describe('WorkspaceGuard mismatch semantics (WS-014/WS-015/WS-016)', () => {
  it('allows a clinical role on a clinical dashboard', () => {
    expect(guardFamily('consultant', undefined, ['clinical', 'nursing', 'department'])).toBeNull();
  });

  it('blocks an executive from rendering a clinical dashboard', () => {
    const err = guardFamily('facility_admin', undefined, ['clinical']);
    expect(err).toBeInstanceOf(WorkspaceMismatchError);
    expect(err!.family).toBe('executive');
    expect(err!.supportedRoles).toEqual(['clinical']);
    expect(guardWorkspace('facility_admin', undefined, ['clinical']).ok).toBe(false);
    expect(guardWorkspace('facility_admin', undefined, ['clinical']).redirectTo).toBe('/facility-admin');
  });

  it('blocks a clinical role from rendering the executive workspace', () => {
    const err = guardFamily('consultant', undefined, ['executive']);
    expect(err).toBeInstanceOf(WorkspaceMismatchError);
    expect(guardWorkspace('consultant', undefined, ['executive']).ok).toBe(false);
    expect(guardWorkspace('consultant', undefined, ['executive']).redirectTo).toBe('/workspace');
  });

  it('raises an error for an unknown family even with a broad allowlist', () => {
    const err = guardFamily('spy', undefined, ['executive', 'clinical', 'nursing']);
    expect(err).toBeInstanceOf(WorkspaceMismatchError);
    expect(err!.family).toBeNull();
  });

  it('treats an empty allowlist as no constraint', () => {
    expect(guardWorkspace('facility_admin').ok).toBe(true);
    expect(guardWorkspace('consultant').ok).toBe(true);
  });
});

describe('familyRedirect', () => {
  it('sends executives to the facility administration command center', () => {
    expect(familyRedirect('executive')).toBe('/facility-admin');
    expect(familyRedirect('clinical_leadership')).toBe('/dashboard');
  });

  it('sends clinical support families to the workspace resolver', () => {
    for (const f of ['clinical', 'nursing', 'pharmacy', 'laboratory', 'radiology', 'department'] as const) {
      expect(familyRedirect(f)).toBe('/workspace');
    }
  });

  it('sends all other families to the dashboard', () => {
    for (const f of ['finance', 'hr', 'ict', 'research', 'teaching', 'telemedicine', 'community_health', 'clinical_leadership'] as const) {
      expect(familyRedirect(f)).toBe('/dashboard');
    }
    expect(familyRedirect(null)).toBe('/dashboard');
  });

  it('sends patients to the patient dashboard', () => {
    expect(familyRedirect('patient')).toBe('/dashboard/patient');
  });
});

describe('loginRedirectForRole (post-login routing, WS-014 fix)', () => {
  it('sends facility_administrator straight to the command center (no /dashboard bounce)', () => {
    expect(loginRedirectForRole('facility_administrator')).toBe('/facility-admin');
    expect(loginRedirectForRole('facility_admin')).toBe('/facility-admin');
    expect(loginRedirectForRole('hospital_admin')).toBe('/facility-admin');
    expect(loginRedirectForRole('super_admin')).toBe('/facility-admin');
  });

  it('sends clinical support roles to the workspace resolver', () => {
    expect(loginRedirectForRole('consultant')).toBe('/workspace');
    expect(loginRedirectForRole('nurse')).toBe('/workspace');
    expect(loginRedirectForRole('pharmacist')).toBe('/workspace');
  });

  it('falls back to the dashboard for unknown/null roles', () => {
    expect(loginRedirectForRole(null)).toBe('/dashboard');
    expect(loginRedirectForRole('mystery_role')).toBe('/dashboard');
  });
});
