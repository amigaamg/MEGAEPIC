import { describe, it, expect } from 'vitest';

import {
  resolveFamily,
  guardFamily,
  guardWorkspace,
  familyRedirect,
  loginRedirectForRole,
  WorkspaceMismatchError,
  type WorkspaceFamily,
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

  it('maps clinical_leadership categories', () => {
    expect(resolveFamily('medical_director')).toBe('clinical_leadership');
    expect(resolveFamily('nursing_director')).toBe('clinical_leadership');
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

  it('the demo dashboard route is within the family redirect target', () => {
    for (const account of DEMO_WORKSPACE_ACCOUNTS) {
      const category = account.role === 'patient' ? 'patient' : account.role;
      const redirect = familyRedirect(resolveFamily(category));
      // Executive accounts go to /facility-admin; others go to their family's
      // cos-* dashboard or /dashboard subroute. The key guarantee: the redirect
      // is NOT a mismatched family's dashboard.
      if (account.family === 'executive') {
        expect(redirect).toBe('/facility-admin');
        expect(account.dashboardRoute).toBe('/facility-admin');
      } else {
        // Non-executive accounts must not land on the executive command center.
        expect(redirect).not.toBe('/facility-admin');
        expect(account.dashboardRoute).not.toBe('/facility-admin');
      }
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
    expect(guardWorkspace('consultant', undefined, ['executive']).redirectTo).toBe('/dashboard/cos-doctor');
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
  });

  it('sends clinical leadership to the doctor dashboard', () => {
    expect(familyRedirect('clinical_leadership')).toBe('/dashboard/cos-doctor');
  });

  it('sends clinical support families to their cos-* dashboards', () => {
    expect(familyRedirect('clinical')).toBe('/dashboard/cos-doctor');
    expect(familyRedirect('nursing')).toBe('/dashboard/cos-nurse');
    expect(familyRedirect('pharmacy')).toBe('/dashboard/cos-pharmacy');
    expect(familyRedirect('laboratory')).toBe('/dashboard/cos-lab');
    expect(familyRedirect('radiology')).toBe('/dashboard/cos-radiology');
  });

  it('sends department and support families to the admin dashboard', () => {
    expect(familyRedirect('department')).toBe('/dashboard/cos-admin');
    expect(familyRedirect('finance')).toBe('/dashboard/cos-admin');
    expect(familyRedirect('hr')).toBe('/dashboard/cos-admin');
    expect(familyRedirect('ict')).toBe('/dashboard/cos-admin');
    expect(familyRedirect('research')).toBe('/dashboard/cos-admin');
  });

  it('sends teaching, telemedicine, and community_health to the doctor dashboard', () => {
    expect(familyRedirect('teaching')).toBe('/dashboard/cos-doctor');
    expect(familyRedirect('telemedicine')).toBe('/dashboard/cos-doctor');
    expect(familyRedirect('community_health')).toBe('/dashboard/cos-doctor');
  });

  it('sends patients to the patient dashboard', () => {
    expect(familyRedirect('patient')).toBe('/dashboard/patient');
  });

  it('falls back to the generic dashboard for null/unknown families', () => {
    expect(familyRedirect(null)).toBe('/dashboard');
  });
});

describe('loginRedirectForRole (post-login routing, WS-014 fix)', () => {
  it('sends facility_administrator straight to the command center (no /dashboard bounce)', () => {
    expect(loginRedirectForRole('facility_administrator')).toBe('/facility-admin');
    expect(loginRedirectForRole('facility_admin')).toBe('/facility-admin');
    expect(loginRedirectForRole('hospital_admin')).toBe('/facility-admin');
    expect(loginRedirectForRole('super_admin')).toBe('/facility-admin');
  });

  it('sends clinical support roles to their cos-* dashboard (no /workspace bounce)', () => {
    expect(loginRedirectForRole('consultant')).toBe('/dashboard/cos-doctor');
    expect(loginRedirectForRole('nurse')).toBe('/dashboard/cos-nurse');
    expect(loginRedirectForRole('pharmacist')).toBe('/dashboard/cos-pharmacy');
    expect(loginRedirectForRole('lab_technologist')).toBe('/dashboard/cos-lab');
    expect(loginRedirectForRole('radiographer')).toBe('/dashboard/cos-radiology');
  });

  it('sends clinical leadership to the doctor dashboard', () => {
    expect(loginRedirectForRole('medical_director')).toBe('/dashboard/cos-doctor');
  });

  it('falls back to the dashboard for unknown/null roles', () => {
    expect(loginRedirectForRole(null)).toBe('/dashboard');
    expect(loginRedirectForRole('mystery_role')).toBe('/dashboard');
  });
});

describe('Constitutional routing guarantee (every role → correct dashboard)', () => {
  const EXPECTED_DASHBOARD_BY_CATEGORY: Record<string, string> = {
    facility_admin: '/facility-admin',
    facility_administrator: '/facility-admin',
    hospital_admin: '/facility-admin',
    hospital_director: '/facility-admin',
    medical_superintendent: '/facility-admin',
    county_director: '/facility-admin',
    regional_director: '/facility-admin',
    national_director: '/facility-admin',
    super_admin: '/facility-admin',
    medical_director: '/dashboard/cos-doctor',
    nursing_director: '/dashboard/cos-doctor',
    department_head: '/dashboard/cos-admin',
    ward_in_charge: '/dashboard/cos-admin',
    medical_doctor: '/dashboard/cos-doctor',
    consultant: '/dashboard/cos-doctor',
    specialist: '/dashboard/cos-doctor',
    clinical_officer: '/dashboard/cos-doctor',
    resident: '/dashboard/cos-doctor',
    registrar: '/dashboard/cos-doctor',
    intern: '/dashboard/cos-doctor',
    medical_officer: '/dashboard/cos-doctor',
    surgeon: '/dashboard/cos-doctor',
    anaesthetist: '/dashboard/cos-doctor',
    dentist: '/dashboard/cos-doctor',
    nurse: '/dashboard/cos-nurse',
    enrolled_nurse: '/dashboard/cos-nurse',
    midwife: '/dashboard/cos-nurse',
    pharmacist: '/dashboard/cos-pharmacy',
    chief_pharmacist: '/dashboard/cos-pharmacy',
    pharmacy_technologist: '/dashboard/cos-pharmacy',
    lab_technologist: '/dashboard/cos-lab',
    medical_laboratory_scientist: '/dashboard/cos-lab',
    pathologist: '/dashboard/cos-lab',
    radiographer: '/dashboard/cos-radiology',
    radiologist: '/dashboard/cos-radiology',
    sonographer: '/dashboard/cos-radiology',
    finance_staff: '/dashboard/cos-admin',
    insurance_officer: '/dashboard/cos-admin',
    finance_officer: '/dashboard/cos-admin',
    billing_officer: '/dashboard/cos-admin',
    finance: '/dashboard/cos-admin',
    hr_staff: '/dashboard/cos-admin',
    hr_officer: '/dashboard/cos-admin',
    hr: '/dashboard/cos-admin',
    it_staff: '/dashboard/cos-admin',
    ict_officer: '/dashboard/cos-admin',
    ict: '/dashboard/cos-admin',
    researcher: '/dashboard/cos-admin',
    biostatistician: '/dashboard/cos-admin',
    study_coordinator: '/dashboard/cos-admin',
    educator: '/dashboard/cos-doctor',
    medical_student: '/dashboard/cos-doctor',
    nursing_student: '/dashboard/cos-doctor',
    pharmacy_student: '/dashboard/cos-doctor',
    student: '/dashboard/cos-doctor',
    telemedicine_officer: '/dashboard/cos-doctor',
    community_health_officer: '/dashboard/cos-doctor',
    outreach_officer: '/dashboard/cos-doctor',
    patient: '/dashboard/patient',
    guardian: '/dashboard/patient',
  };

  it('every constitutional category routes to the correct dashboard', () => {
    let failures: string[] = [];
    for (const [category, expectedRoute] of Object.entries(EXPECTED_DASHBOARD_BY_CATEGORY)) {
      const family = resolveFamily(category);
      if (family === null) {
        failures.push(`resolveFamily("${category}") returned null`);
        continue;
      }
      const redirect = familyRedirect(family);
      if (redirect !== expectedRoute) {
        failures.push(`familyRedirect(resolveFamily("${category}")) = "${redirect}", expected "${expectedRoute}"`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('loginRedirectForRole routes every demo account category correctly', () => {
    let failures: string[] = [];
    for (const [category, expectedRoute] of Object.entries(EXPECTED_DASHBOARD_BY_CATEGORY)) {
      const redirect = loginRedirectForRole(category);
      if (redirect !== expectedRoute) {
        failures.push(`loginRedirectForRole("${category}") = "${redirect}", expected "${expectedRoute}"`);
      }
    }
    expect(failures).toEqual([]);
  });
});
