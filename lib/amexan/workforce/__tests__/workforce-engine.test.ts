import { describe, it, expect } from 'vitest';
import { WorkforceEngine } from '../WorkforceEngine';
import {
  getAllPrivileges,
  getProfessionalCategory,
  registerPrivilege,
  registerProfessionalCategory,
} from '../registry';
import type { Credential } from '../constitutional-types';

describe('WorkforceEngine — Layer 1 · Person', () => {
  it('creates a person with a permanent AMX-PER identity', () => {
    const p = WorkforceEngine.createPerson({ givenName: 'James', familyName: 'Kamau', email: 'j@k.com', phone: '0712', nationalId: '123', passport: '', otherNames: [], dob: '1980-01-01', gender: 'male', addresses: [], emergencyContact: { name: '', phone: '', relationship: '' }, photoUrl: '', signatureUrl: '', biometricHash: '', languages: ['en'], });
    expect(p.id).toMatch(/^AMX-PER-/);
    expect(p.givenName).toBe('James');
  });

  it('requires email and givenName', () => {
    expect(() => WorkforceEngine.createPerson({ givenName: 'X', familyName: 'Y', email: '', phone: '', nationalId: '', passport: '', otherNames: [], dob: '', gender: 'undisclosed', addresses: [], emergencyContact: { name: '', phone: '', relationship: '' }, photoUrl: '', signatureUrl: '', biometricHash: '', languages: [] })).toThrow();
  });
});

describe('WorkforceEngine — Layers 2-3 · Identity & Employment', () => {
  it('creates an unverified professional identity for a registered category', () => {
    const person = WorkforceEngine.createPerson({ givenName: 'A', familyName: 'B', email: 'a@b.com', phone: '', nationalId: '', passport: '', otherNames: [], dob: '', gender: 'undisclosed', addresses: [], emergencyContact: { name: '', phone: '', relationship: '' }, photoUrl: '', signatureUrl: '', biometricHash: '', languages: [] });
    const id = WorkforceEngine.createProfessionalIdentity({ personId: person.id, category: 'consultant', primaryCategory: 'consultant', categories: ['consultant'], professionalNumber: 'KMPDC-1', council: 'KMPDC', board: '', licenseRefs: [], licenseStatus: 'active', licenseExpiry: '2030-01-01', qualifications: [], specialties: ['General Surgery'], subspecialties: [], credits: 20 });
    expect(id.personId).toBe(person.id);
    expect(id.verified).toBe(false);
  });

  it('rejects an unregistered professional category', () => {
    expect(() => WorkforceEngine.createProfessionalIdentity({ personId: 'x', category: 'wizard', primaryCategory: 'wizard', categories: ['wizard'], professionalNumber: '', council: '', board: '', licenseRefs: [], licenseStatus: 'active', licenseExpiry: '', qualifications: [], specialties: [], subspecialties: [], credits: 0 })).toThrow(/Unknown professional category/);
  });

  it('employment belongs to an organization, not the person', () => {
    const person = WorkforceEngine.createPerson({ givenName: 'A', familyName: 'B', email: 'a@b.com', phone: '', nationalId: '', passport: '', otherNames: [], dob: '', gender: 'undisclosed', addresses: [], emergencyContact: { name: '', phone: '', relationship: '' }, photoUrl: '', signatureUrl: '', biometricHash: '', languages: [] });
    const emp = WorkforceEngine.createEmployment({ organizationId: 'org-1', personId: person.id, employeeNumber: 'E-01', jobTitle: 'Consultant Surgeon', professionalCategory: 'consultant', employmentType: 'permanent', rank: 'senior', salaryScale: 'L5', startDate: '2020-01-01', contractRef: '', benefits: [] });
    expect(emp.organizationId).toBe('org-1');
    expect(emp.status).toBe('active');
    expect(emp.id).toMatch(/^AMX-EMP-/);
  });
});

describe('WorkforceEngine — Layer 5 · Privileges are computed, never role alone', () => {
  it('a consultant can prescribe, order labs, and perform surgery', () => {
    const privs = WorkforceEngine.computePrivileges({ professionalCategory: 'consultant', employments: [] });
    expect(WorkforceEngine.canPerform(privs, 'prescribe')).toBe(true);
    expect(WorkforceEngine.canPerform(privs, 'order_labs')).toBe(true);
    expect(WorkforceEngine.canPerform(privs, 'perform_surgery')).toBe(true);
    // consultant must not hold a forbidden privilege
    expect(WorkforceEngine.canPerform(privs, 'sign_death_certificate_without_review')).toBe(false);
  });

  it('a medical officer cannot perform major surgery independently', () => {
    const privs = WorkforceEngine.computePrivileges({ professionalCategory: 'medical_officer', employments: [] });
    expect(WorkforceEngine.canPerform(privs, 'perform_major_surgery_independent')).toBe(false);
    expect(WorkforceEngine.canPerform(privs, 'prescribe')).toBe(true);
  });

  it('a nurse cannot prescribe, even if employment tries to grant it (constitutional safety)', () => {
    const privs = WorkforceEngine.computePrivileges({ professionalCategory: 'nurse', employments: [{ id: 'e1', professionalCategory: 'nurse' }], departmentGrants: ['prescribe'] });
    expect(WorkforceEngine.canPerform(privs, 'prescribe')).toBe(false);
    expect(WorkforceEngine.canPerform(privs, 'administer_medication')).toBe(true);
  });

  it('forbidden privileges are never granted', () => {
    const privs = WorkforceEngine.computePrivileges({ professionalCategory: 'patient', employments: [], departmentGrants: ['view_others_records'] });
    expect(WorkforceEngine.canPerform(privs, 'view_others_records')).toBe(false);
  });

  it('rejects unregistered privileges at compute time (catalog is the source of truth)', () => {
    expect(() => WorkforceEngine.computePrivileges({ professionalCategory: 'consultant', employments: [], departmentGrants: ['fly_an_airplane'] })).toThrow(/Unregistered privilege/);
  });

  it('supports runtime privilege registration (Stroke Specialist grant)', () => {
    expect(getAllPrivileges().some((p) => p.id === 'perform_thrombectomy')).toBe(false);
    registerPrivilege({ id: 'perform_thrombectomy', name: 'Perform Thrombectomy', description: 'Mechanical thrombectomy', domain: 'surgical', requiresLevel: 'expert' });
    registerProfessionalCategory({ id: 'stroke_specialist', label: 'Stroke Specialist', family: 'clinical', defaultRoute: '/workspace', defaultPrivileges: ['perform_thrombectomy', 'prescribe'], forbiddenPrivileges: [] });
    const privs = WorkforceEngine.computePrivileges({ professionalCategory: 'stroke_specialist', employments: [] });
    expect(WorkforceEngine.canPerform(privs, 'perform_thrombectomy')).toBe(true);
    expect(getProfessionalCategory('stroke_specialist')!.label).toBe('Stroke Specialist');
  });
});

describe('WorkforceEngine — Layer 7 · Credentials', () => {
  it('alerts on expiry windows', () => {
    const c: Credential = { id: 'c1', name: 'ACLS', type: 'cert', issuer: 'AHA', issuedAt: '2020-01-01', expiresAt: '2021-01-01', status: 'valid', documents: [] };
    expect(WorkforceEngine.credentialStatus(c, Date.parse('2020-12-01'))).toBe('expiring');
    expect(WorkforceEngine.credentialStatus(c, Date.parse('2021-06-01'))).toBe('expired');
  });
});

describe('WorkforceEngine — Workspace is computed, never chosen', () => {
  it('routes a clinical category to /workspace and an executive to /facility-admin', () => {
    const wsClinical = WorkforceEngine.computeWorkspace({ professionalCategory: 'consultant', privileges: WorkforceEngine.computePrivileges({ professionalCategory: 'consultant', employments: [] }) });
    expect(wsClinical.family).toBe('clinical');
    expect(wsClinical.primaryRoute).toBe('/workspace');

    const wsExec = WorkforceEngine.computeWorkspace({ professionalCategory: 'facility_administrator', privileges: WorkforceEngine.computePrivileges({ professionalCategory: 'facility_administrator', employments: [] }) });
    expect(wsExec.family).toBe('executive');
    expect(wsExec.primaryRoute).toBe('/facility-admin');
  });
});

describe('WorkforceEngine — AI context', () => {
  it('produces a reasoning-ready snapshot', () => {
    const person = WorkforceEngine.createPerson({ givenName: 'J', familyName: 'K', email: 'j@k.com', phone: '', nationalId: '', passport: '', otherNames: [], dob: '', gender: 'male', addresses: [], emergencyContact: { name: '', phone: '', relationship: '' }, photoUrl: '', signatureUrl: '', biometricHash: '', languages: [] });
    const ctx = WorkforceEngine.aiContext({
      person,
      employments: [WorkforceEngine.createEmployment({ organizationId: 'o1', personId: person.id, employeeNumber: '1', jobTitle: 'Surgeon', professionalCategory: 'consultant', employmentType: 'permanent', rank: 'senior', salaryScale: '', startDate: '', contractRef: '', benefits: [] })],
      assignments: [],
      privileges: WorkforceEngine.computePrivileges({ professionalCategory: 'consultant', employments: [] }),
      competencies: [],
      credentials: [],
    });
    expect(ctx.actorId).toBe(person.id);
    expect(ctx.employments).toHaveLength(1);
  });
});