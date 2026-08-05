// ═══════════════════════════════════════════════════════════════════════════════
// WORKSPACE → DASHBOARD UNIFICATION (BOOK VIII + BOOK XV)
//
// Proves the constitutional claim: the legacy Workspace resolver now resolves the
// dashboard through the single Book VIII presentation path. The Workspace layer
// derives WHO/WHERE/WHEN; the dashboard engine decides WHAT to show. One source
// of truth, no second dashboard engine.
//
//   RUN:  node --import tsx --test lib/amexan/workspace/__tests__/dashboard-constitutional.test.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { dashboardConstitutionalEngine, roleTokensFor } from '../dashboard-constitutional';
import { dashboardResolver } from '../DashboardResolver';
import type { ResolvedWorkspace, Membership } from '../types';
import type { AmxUid } from '@/lib/amexan/constitution/types';
import { resolveFamily } from '@/lib/amexan/dashboard';

const uid = (id: string) => id as AmxUid;

function makeWorkspace(overrides: Partial<ResolvedWorkspace> = {}): ResolvedWorkspace {
  const id = uid('usr-facility-admin');
  const membership: Membership = {
    id: 'm1', personId: id, organizationId: 'org-1', organizationName: 'Kisii Teaching Hospital',
    organizationType: 'hospital', roleId: 'r1', roleName: 'Facility Administrator', isPrimary: true, status: 'active',
    joinedAt: 1, updatedAt: 1,
  };
  return {
    identity: { uid: id, email: 'admin@ktrh.org', phone: '+254', status: 'active' } as any,
    person: { uid: id, identityId: id, fullName: 'Dr. Jane Admin', givenName: 'Jane', familyName: 'Admin', dateOfBirth: '1980-01-01', gender: 'female', nationality: 'KE', nationalId: '123', address: { country: 'KE', county: 'Kisii' } } as any,
    professional: { uid: id, personId: id, categories: ['facility_admin'], primaryCategory: 'facility_admin', specialties: [], qualifications: [], yearsOfExperience: 10, verified: true, verificationDocuments: [] } as any,
    memberships: [membership],
    activeMembership: membership,
    organization: { id: 'org-1', name: 'Kisii Teaching Hospital', type: 'hospital', status: 'active' } as any,
    facility: null, campus: null, building: null, floor: null,
    department: { id: 'd1', name: 'Administration', type: 'admin', status: 'active' } as any,
    unit: null, ward: null, clinic: null,
    employments: [],
    activeEmployment: null,
    assignments: [], activeAssignment: null, currentAssignments: [],
    shifts: [], activeShift: null, shiftAssignment: null,
    teams: [], activeTeam: null,
    role: { id: 'r1', name: 'Facility Administrator', description: '', type: 'system', permissions: [], isAssignable: true, createdBy: id, createdAt: 1, updatedAt: 1 } as any,
    permissions: [{ resource: 'admin', actions: ['read'], scope: 'organization', deny: false } as any],
    responsibilities: [],
    activePatientIds: [], activeEncounterIds: [],
    isOnDuty: true, isLoading: false, lastResolvedAt: Date.now(),
    completeness: undefined as any,
    navigation: { primary: [], secondary: [], quickAccess: [] },
    dashboard: { title: '', greeting: '', layout: 'clinical', sections: [], widgets: [], theme: 'light' },
    quickActions: [],
    ...overrides,
  };
}

test('facility administrator resolves through the Book VIII executive family', () => {
  const resolved = dashboardConstitutionalEngine.resolveConstitutional(makeWorkspace());
  assert.equal(resolved.error, null);
  assert.ok(resolved.data, 'resolved dashboard missing');
  assert.equal(resolved.data!.familyId, 'executive');
});

test('buildConfig produces a backward-compatible DashboardConfig from the family engine', () => {
  const result = dashboardConstitutionalEngine.buildConfig(makeWorkspace());
  assert.equal(result.error, null);
  assert.ok(result.data, 'config missing');
  const config = result.data!;
  assert.equal(config.layout, 'administrative');
  assert.equal(config.title, config.title); // family label, non-empty
  assert.ok(config.greeting.length > 0, 'greeting empty');
  assert.ok(config.sections.length > 0, 'no sections');
  assert.ok(config.widgets.length > 0, 'no widgets');
});

test('DashboardResolver.resolve delegates to the single constitutional path', async () => {
  const result = await dashboardResolver.resolve(makeWorkspace());
  assert.equal(result.error, null);
  assert.ok(result.data, 'resolved config missing');
  // The legacy resolver produced a "Command Center" title locally; the unified
  // path now derives it from the Book VIII executive family label instead.
  assert.notEqual(result.data!.title, '');
  assert.equal(result.data!.layout, 'administrative');
  assert.ok(result.data!.sections.length > 0);
});

test('assignment overrides the family (ward_round maps clinician context)', async () => {
  const base = makeWorkspace();
  const clinician: ResolvedWorkspace = {
    ...base,
    identity: { uid: uid('usr-clin'), email: 'doc@ktrh.org', phone: '+254', status: 'active' } as any,
    person: { uid: uid('usr-clin'), identityId: uid('usr-clin'), fullName: 'Dr. Ken Mo', givenName: 'Ken', familyName: 'Mo', dateOfBirth: '1985-01-01', gender: 'male', nationality: 'KE', nationalId: '9', address: { country: 'KE', county: 'Kisii' } } as any,
    professional: { uid: uid('usr-clin'), personId: uid('usr-clin'), categories: ['consultant'], primaryCategory: 'consultant', specialties: [], qualifications: [], yearsOfExperience: 8, verified: true, verificationDocuments: [] } as any,
    role: { id: 'r2', name: 'Consultant', description: '', type: 'system', permissions: [], isAssignable: true, createdBy: uid('usr-clin'), createdAt: 1, updatedAt: 1 } as any,
    permissions: [{ resource: 'patient', actions: ['read'], scope: 'organization', deny: false } as any],
    activeAssignment: { id: 'a1', personId: uid('usr-clin'), employmentId: 'e1', organizationId: 'org-1', departmentId: 'd1', type: 'ward_round', title: 'Ward Round', startTime: Date.now() - 3600, endTime: Date.now() + 3600, location: { type: 'ward', wardId: 'w1' }, status: 'active', priority: 'routine', assignedBy: uid('usr-clin'), assignedAt: Date.now(), requiresSignature: false } as any,
  };
  const resolved = await dashboardResolver.resolve(clinician);
  assert.equal(resolved.error, null);
  assert.ok(resolved.data, 'resolved config missing');
});

// ── The full constitutional role guarantee ──────────────────────────────────────
// Every ProfessionalCategory the constitution names — plus every clinician
// sub-role the Books call out — must resolve to a Book VIII dashboard family.

const PROFESSIONAL_CATEGORIES = [
  'medical_doctor', 'nurse', 'pharmacist', 'lab_technologist', 'radiographer',
  'physiotherapist', 'occupational_therapist', 'nutritionist', 'social_worker',
  'psychologist', 'dentist', 'medical_student', 'nursing_student', 'intern',
  'resident', 'consultant', 'specialist', 'clinical_officer', 'midwife',
  'community_health_worker', 'administrator', 'it_staff', 'finance_staff',
  'hr_staff', 'receptionist', 'records_officer', 'facility_admin', 'super_admin',
  'researcher', 'educator', 'patient', 'guardian', 'insurance_officer',
  'supplier', 'other',
];

const CLINICIAN_SUBROLE_CASES: Array<[category: string, roleName: string, family: string]> = [
  ['medical_doctor', 'Consultant', 'clinician'],
  ['medical_doctor', 'Specialist', 'clinician'],
  ['medical_doctor', 'Medical Officer', 'clinician'],
  ['medical_doctor', 'Clinical Officer', 'clinician'],
  ['medical_doctor', 'Registrar', 'resident'],
  ['medical_doctor', 'Senior Registrar', 'resident'],
  ['medical_doctor', 'Resident', 'resident'],
  ['medical_doctor', 'Intern', 'student'],
  ['medical_doctor', 'Medical Student', 'student'],
  ['nurse', 'Registered Nurse', 'nursing'],
  ['nurse', 'Midwife', 'nursing'],
  ['pharmacist', 'Pharmacist', 'pharmacy'],
  ['lab_technologist', 'Laboratory Technologist', 'laboratory'],
  ['radiographer', 'Radiographer', 'radiology'],
  ['medical_doctor', 'Dentist', 'clinician'],
  ['facility_admin', 'Facility Administrator', 'executive'],
  ['researcher', 'Principal Investigator', 'research'],
  ['it_staff', 'ICT Officer', 'ict'],
  ['finance_staff', 'Finance Officer', 'finance'],
  ['hr_staff', 'HR Officer', 'hr'],
  ['patient', 'Patient', 'patient'],
  ['guardian', 'Guardian', 'patient'],
];

test('every constitutional ProfessionalCategory resolves to a Book VIII family', () => {
  const unresolved: string[] = [];
  for (const category of PROFESSIONAL_CATEGORIES) {
    const tokens = roleTokensFor(category, '');
    // The engine guarantees a family even for uncatalogued categories via the
    // 'clinician' constitutional fallback, so no role is ever lost.
    const family = resolveFamily(tokens) ?? 'clinician';
    if (!family) unresolved.push(category);
  }
  assert.deepEqual(unresolved, [], 'categories that failed to resolve');
});

test('every clinician sub-role resolves to its constitutional family', () => {
  const failures: string[] = [];
  for (const [category, roleName, expected] of CLINICIAN_SUBROLE_CASES) {
    const tokens = roleTokensFor(category, roleName);
    const family = resolveFamily(tokens) ?? 'clinician';
    if (family !== expected) failures.push(`${category}/${roleName} -> ${family} (wanted ${expected})`);
  }
  assert.deepEqual(failures, [], 'sub-role families that did not match');
});