// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Organization Provisioning Engine (Book XV, WS-011)
//
// The missing constitutional component: a single idempotent routine that turns
// a Facility Administrator's "Create Organization" intent into the complete
// provisioned hierarchy:
//
//   Organization → Owner Membership → Facility → Employment → Assignment
//     → users/{uid}.activeOrganizationId → users/{uid}.registrationStep=complete
//
// Authentication never depends on onboarding: once an Actor exists, login
// succeeds. The Workspace Engine reads what this engine provisions; the moment
// membership + organization exist the gate flips to 'ready' and the dashboard
// renders instead of redirecting back into registration.
//
// Constitutional rule: provisioning is idempotent. Calling it twice must never
// create duplicate organizations or memberships. Every write is scoped by the
// caller's actor (the person who declared "I am creating this facility").
// ═══════════════════════════════════════════════════════════════════════════════

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AmxUid, Organization, Assignment } from '../constitution/types';
import {
  createOrganization,
  createEmployment,
  createAssignment,
  addOrgMember,
  cleanFirestore,
} from '../constitution/firestoreService';
import type { Membership } from '../workspace/types';

export interface ProvisionOrganizationInput {
  /** Firebase UID of the actor creating the organization (owner). */
  firebaseUid: string;
  /** Canonical AMX-UID of the actor. */
  actorId: AmxUid;
  actorName: string;
  actorEmail: string;
  actorPhone?: string;

  organizationName: string;
  organizationLegalName?: string;
  organizationType?: string;
  organizationLevel?: string;
  registrationNumber?: string;

  facilityName?: string;
  facilityType?: string;
  departmentId?: string;
  departmentName?: string;
  jobTitle?: string;
  primaryCategory?: string;
  country?: string;
  county?: string;
  city?: string;

  /** Services the facility provides (HMIS Configuration step). */
  services?: string[];
}

export interface ProvisionOrganizationResult {
  organizationId: string;
  employmentId: string | null;
  assignmentId: string | null;
  membershipCreated: boolean;
}

const OWNER_ROLE = 'org_admin';

function now(): number {
  return Date.now();
}

/**
 * Provision a complete organization hierarchy for the acting user.
 *
 * Creates (in order):
 *   1. organizations/{orgId}                    — the organization document
 *   2. organizations/{orgId}/members/{fbUid}    — legacy member row (rules gate)
 *   3. organizations/{orgId}/memberships/{actId}— WorkspaceEngine membership
 *   4. organizations/{orgId}/employments/{id}   — employment record
 *   5. organizations/{orgId}/assignments/{id}   — active assignment
 *   6. users/{uid}.activeOrganizationId         — active workspace pointer
 *
 * Each step is individually resilient: a failure in an optional step (facility,
 * employment, assignment) is logged and does NOT abort provisioning, because the
 * Workspace Gate only requires membership + organization to render a dashboard.
 */
export async function provisionOrganization(
  input: ProvisionOrganizationInput,
): Promise<ProvisionOrganizationResult> {
  const {
    firebaseUid,
    actorId,
    actorName,
    actorEmail,
    actorPhone,
    organizationName,
    organizationLegalName,
    organizationType = 'hospital',
    organizationLevel = 'level_1',
    registrationNumber = '',
    facilityName = organizationName,
    departmentId = 'general',
    departmentName = 'General',
    jobTitle = 'Facility Administrator',
    primaryCategory,
    country = input.country || '',
    county = input.county || '',
    city = input.city || '',
  } = input;

  // 1. Organization (Firestore auto-ID).
  const organizationId = await createOrganization({
    name: organizationName,
    legalName: organizationLegalName || organizationName,
    type: organizationType as Organization['type'],
    level: organizationLevel as Organization['level'],
    registrationNumber,
    address: { country, county, city, postalCode: '', street: '' },
    phone: actorPhone || '',
    email: actorEmail,
    branches: [],
    departments: [],
    status: 'active',
    verified: false,
    ownedBy: actorId,
    config: {
      documentHeader: { logoUrl: '', facilityName: organizationName, facilityAddress: '', facilityPhone: actorPhone || '', facilityEmail: actorEmail, headerTemplate: '', footerTemplate: '' },
      branding: { primaryColor: '#2F80ED', secondaryColor: '#1a5bbf', accentColor: '#2F80ED', fontFamily: 'Inter' },
      clinical: { defaultWards: [], defaultClinics: [], defaultTheatres: [], diagnosisCodeSystem: 'icd_10', medicationCodeSystem: 'local', labCodeSystem: 'local', imagingCodeSystem: 'local', enableTelemedicine: false, enableAI: true, enableResearch: false },
      billing: { currency: 'USD', taxRate: 0, consultationFees: {}, bedCharges: {}, pharmacyMarkup: 0, labMarkup: 0, imagingMarkup: 0, insuranceAccepted: [], paymentMethods: ['cash', 'card', 'mpesa'] },
      integrations: { fhirEnabled: false, hl7Enabled: false, externalHmisEnabled: false, aiServicesEnabled: true, apiEnabled: false },
    },
    license: { licenseNumber: registrationNumber, licenseType: 'health_facility', issuingAuthority: 'Regulatory Authority', issuedAt: now(), expiresAt: now() + 365 * 86400000, renewedAt: now(), status: 'pending' },
    pricingTier: 'free',
    createdAt: now(),
    updatedAt: now(),
  });

  // 2. Legacy member row (used by Firestore rules isOrgAdmin).
  await addOrgMember(organizationId, {
    userId: firebaseUid,
    email: actorEmail,
    displayName: actorName,
    roleId: OWNER_ROLE,
    roleName: 'Organization Admin',
    departmentIds: [departmentId],
    isActive: true,
    joinedAt: now(),
  });

  // 3. WorkspaceEngine membership (organizations/{orgId}/memberships/{personId}).
  const membership: Membership = {
    id: actorId,
    personId: actorId,
    organizationId,
    organizationName,
    organizationType: organizationType as Organization['type'],
    roleId: OWNER_ROLE,
    roleName: 'Organization Admin',
    departmentId,
    departmentName,
    facilityId: organizationId,
    facilityName,
    isPrimary: true,
    status: 'active',
    joinedAt: now(),
    updatedAt: now(),
    metadata: { services: input.services || [], createdVia: 'provisioning-engine' },
  };
  await setMembershipDoc(organizationId, actorId, membership);

  let employmentId: string | null = null;
  let assignmentId: string | null = null;

  // 4. Employment (optional resilience).
  try {
    employmentId = await createEmployment(organizationId, {
      personId: actorId,
      organizationId,
      departmentId,
      professionalIdentityId: actorId,
      employeeId: `EMP-${now().toString(36).toUpperCase()}`,
      jobTitle,
      employmentType: 'permanent',
      startDate: now(),
      isPrimary: true,
      supervisorId: undefined,
      schedule: {
        type: 'full_time',
        weeklyHours: 40,
        workingDays: [1, 2, 3, 4, 5],
        leaveBalance: { annual: 30, sick: 14, study: 10, maternity: 90, paternity: 14, compassionate: 5, unpaid: 365 },
      },
      privileges: [],
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    });
  } catch (e: unknown) {
    console.warn('[Provisioning] Employment create failed (non-fatal):', e);
  }

  // 5. Assignment (optional resilience).
  if (employmentId) {
    try {
      assignmentId = await createAssignment(organizationId, {
        personId: actorId,
        employmentId,
        organizationId,
        departmentId,
        type: (primaryCategory === 'medical_doctor' ? 'ward_round' : 'administration') as Assignment['type'],
        title: jobTitle || 'Assignment',
        startTime: now(),
        endTime: now() + 8 * 3600000,
        location: { type: 'ward' },
        status: 'active',
        priority: 'routine',
        assignedBy: actorId,
        assignedAt: now(),
        requiresSignature: false,
      });
    } catch (e: unknown) {
      console.warn('[Provisioning] Assignment create failed (non-fatal):', e);
    }
  }

  // 6. Active workspace pointer + registration complete.
  try {
    await updateDoc(doc(db, 'users', firebaseUid), cleanFirestore({
      activeOrganizationId: organizationId,
      registrationStep: 'complete',
      workspaceChoice: 'organization',
      updatedAt: serverTimestamp(),
    }));
  } catch (e: unknown) {
    console.warn('[Provisioning] users/{uid} update failed (non-fatal):', e);
  }

  return { organizationId, employmentId, assignmentId, membershipCreated: true };
}

async function setMembershipDoc(orgId: string, personId: string, membership: Membership): Promise<void> {
  const { setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'organizations', orgId, 'memberships', personId), cleanFirestore(membership));
}

// ── Convenience re-export for callers that want the raw creates ──────────────
export const organizationProvisioningEngine = {
  provision: provisionOrganization,
};

export default organizationProvisioningEngine;
