import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  type UserSession,
  type AmxUid,
  type Permission,
  type Role,
  type Organization,
  type Department,
  type Employment,
  type Assignment,
  type ProfessionalIdentity,
  type Identity,
  type Person,
  type ProfessionalCategory,
} from '@/lib/amexan/constitution/types';
import { composeUserSession } from '@/lib/amexan/constitution/session';
import { buildEmptySession } from '@/lib/amexan/constitution/auth';
import {
  getIdentity, getPerson, getProfessional,
  createIdentity, createPerson, createProfessional,
} from '@/lib/amexan/constitution/firestoreService';
import { orgRef } from './collections';
import { getWorkspaceEngine } from '@/lib/amexan/workspace';
import type { ResolvedWorkspace } from '@/lib/amexan/workspace/types';

export interface ActorSessionResult {
  session: UserSession;
  activeOrganizationId: string | null;
  derivedRole: string | null;
  // New: Full workspace context
  workspace?: ResolvedWorkspace;
}

const ROLE_LABEL: Record<string, string> = {
  doctor: 'medical_doctor',
  consultant: 'consultant',
  nurse: 'nurse',
  admin: 'facility_admin',
  super_admin: 'super_admin',
  pharmacist: 'pharmacist',
  lab_tech: 'lab_technologist',
  receptionist: 'receptionist',
  student: 'medical_student',
};

function defaultPermissions(role: string): Permission[] {
  const scope = { type: 'organization' as const };
  if (role === 'doctor' || role === 'consultant' || role === 'clinical_officer') {
    return [
      { resource: 'patient', actions: ['create', 'read', 'update'], scope, deny: false },
      { resource: 'encounter', actions: ['create', 'read', 'update'], scope, deny: false },
      { resource: 'prescription', actions: ['create', 'read', 'update'], scope, deny: false },
      { resource: 'lab_order', actions: ['create', 'read'], scope, deny: false },
      { resource: 'imaging_order', actions: ['create', 'read'], scope, deny: false },
      { resource: 'clinical_note', actions: ['create', 'read', 'update'], scope, deny: false },
      { resource: 'referral', actions: ['create', 'read'], scope, deny: false },
      { resource: 'discharge', actions: ['create', 'update'], scope, deny: false },
    ];
  }
  if (role === 'nurse' || role === 'midwife') {
    return [
      { resource: 'patient', actions: ['read'], scope, deny: false },
      { resource: 'encounter', actions: ['read', 'update'], scope, deny: false },
      { resource: 'clinical_note', actions: ['create', 'read'], scope, deny: false },
      { resource: 'prescription', actions: ['read'], scope, deny: false },
    ];
  }
  if (role === 'admin' || role === 'super_admin' || role === 'hospital_admin') {
    return [
      { resource: 'admin', actions: ['create', 'read', 'update', 'delete', 'admin'], scope: { type: 'global' }, deny: false },
      { resource: 'manage_org', actions: ['manage_org', 'manage_staff', 'manage_roles'], scope: { type: 'global' }, deny: false },
    ];
  }
  if (role === 'pharmacist') {
    return [
      { resource: 'prescription', actions: ['read', 'update'], scope, deny: false },
      { resource: 'inventory', actions: ['create', 'read'], scope, deny: false },
    ];
  }
  if (role === 'lab_tech') {
    return [
      { resource: 'lab_order', actions: ['read', 'update'], scope, deny: false },
      { resource: 'observations', actions: ['create', 'read'], scope, deny: false },
    ];
  }
  return [{ resource: 'patient', actions: ['read'], scope, deny: false }];
}

function roleFromString(role: string | null | undefined): Role {
  const id = role || 'user';
  const perms = defaultPermissions(id);
  return {
    id,
    name: id,
    description: '',
    type: 'system',
    permissions: perms,
    isAssignable: false,
    createdBy: '' as AmxUid,
    createdAt: 0,
    updatedAt: 0,
  };
}

function categoryFromRole(role: string | null | undefined): ProfessionalCategory {
  return (ROLE_LABEL[role || 'user'] as ProfessionalCategory) || 'other';
}

async function loadUserDoc(uid: string): Promise<Record<string, unknown> | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function getActorSession(uid: string): Promise<ActorSessionResult | null> {
  if (typeof window === 'undefined') return null;
  try {
    // Constitutional gate (CR-WS-001): never initialize the Workspace Engine
    // before registration is COMPLETE. Incomplete accounts must resume
    // onboarding instead of persisting a partial workspace.
    const regState = await loadUserDoc(uid);
    const regStep = regState?.registrationStep as string | undefined;
    if (!regStep || regStep !== 'complete') {
      return getActorSessionLegacy(uid);
    }

    // Use the new Workspace Engine for complete context resolution
    const engine = getWorkspaceEngine();
    const workspace = await engine.initialize(uid as AmxUid);

    // Convert workspace to legacy session format for backward compatibility
    const session = engine.getSession();

    return {
      session,
      activeOrganizationId: workspace.activeMembership?.organizationId || workspace.organization?.id || null,
      derivedRole: workspace.role?.id || null,
      workspace,
    };
  } catch (e) {
    console.error('[actorService] Failed to load actor session via WorkspaceEngine:', e);

    // Fallback to legacy implementation
    return getActorSessionLegacy(uid);
  }
}

// Legacy implementation kept for backward compatibility
async function getActorSessionLegacy(uid: string): Promise<ActorSessionResult | null> {
  if (typeof window === 'undefined') return null;
  try {
    const [identity, person, professional, userData] = await Promise.all([
      getIdentity(uid).catch(() => null),
      getPerson(uid).catch(() => null),
      getProfessional(uid).catch(() => null),
      loadUserDoc(uid),
    ]);

    const activeOrganizationId = (userData?.activeOrganizationId as string) || null;
    const fetchedRole = (userData?.role as string) || null;
    const role = roleFromString(fetchedRole);

    let currentOrganization: Organization | null = null;
    let currentDepartment: Department | null = null;
    let employments: Employment[] = [];
    let currentEmployment: Employment | null = null;
    let assignments: Assignment[] = [];

    if (activeOrganizationId) {
      try {
        const orgSnap = await getDoc(orgRef(activeOrganizationId));
        if (orgSnap.exists()) {
          currentOrganization = orgSnap.data() as Organization;
        }
      } catch { /* org fetch is best-effort */ }
    }

    const identityObj: Identity = identity ?? {
      uid: uid as AmxUid,
      email: (userData?.email as string) || '',
      phone: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLoginAt: Date.now(),
      verified: !!(userData?.emailVerified as boolean),
      twoFactorEnabled: false,
      securityKeys: [],
      authProvider: 'email',
      status: 'active',
    };

    const personObj: Person = person ?? {
      uid: uid as AmxUid,
      identityId: uid as AmxUid,
      fullName: (userData?.displayName as string) || (userData?.name as string) || fetchedRole || 'User',
      givenName: '',
      familyName: '',
      dateOfBirth: '',
      gender: 'undisclosed',
      nationality: '',
      nationalId: '',
      address: { country: 'Kenya', county: '' },
    };

    const professionalObj: ProfessionalIdentity = professional ?? {
      uid: uid as AmxUid,
      personId: uid as AmxUid,
      categories: [categoryFromRole(fetchedRole)],
      primaryCategory: categoryFromRole(fetchedRole),
      specialties: [],
      qualifications: [],
      yearsOfExperience: 0,
      verified: false,
      verificationDocuments: [],
    };

    const session = composeUserSession({
      identity: identityObj,
      person: personObj,
      professional: professionalObj,
      organizations: currentOrganization ? [currentOrganization] : [],
      employments,
      currentEmployment,
      currentOrganization,
      currentDepartment,
      currentAssignments: assignments,
      role,
      permissions: role.permissions,
      responsibilities: [],
    });

    return {
      session,
      activeOrganizationId,
      derivedRole: fetchedRole,
    };
  } catch (e) {
    console.error('[actorService] Failed to load actor session:', e);
    return null;
  }
}

export function getDefaultRolePermissions(role: string | null | undefined): Permission[] {
  return defaultPermissions(role || 'user');
}

export function emptyActorSession(): UserSession {
  return buildEmptySession();
}

export interface EnsureActorInput {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  accountType: 'patient' | 'professional';
  clinicianRole?: string;
  professionalCategory?: string;
  /** Constitutional canonical identity (AMX-UID). When provided, identity/person/
   *  professional and the Actor root are keyed by it for consistency with the
   *  register flow. Absent (e.g. SSO), the Firebase uid is used as a stable key. */
  amxUid?: string;
}

export async function ensureActor(input: EnsureActorInput): Promise<void> {
  if (typeof window === 'undefined') return;
  // Canonical key: prefer the generated AMX-UID so quick-register and the full
  // constitution flow agree on the same identity document (resume-safe). Fall
  // back to the Firebase uid so legacy/SSO accounts keep their existing docs.
  const key = (input.amxUid || input.uid) as AmxUid;
  const now = Date.now();

  // UAE: every actor is first an Actor root before any specialization.
  // Non-fatal: if the rules aren't deployed yet, we must never break sign-up.
  try {
    const fs = await import('firebase/firestore');
    const { doc, setDoc, getDoc: fsGetDoc, serverTimestamp } = fs;
    const { db } = await import('@/lib/firebase');
    const actorId = key;
    const snapshot = await fsGetDoc(doc(db, 'actors', actorId));
    if (!snapshot.exists()) {
      await setDoc(doc(db, 'actors', actorId), {
        actorId: actorId,
        amxuid: deriveDisplayAmx(key),
        actorType: input.accountType === 'patient' ? 'patient' : 'professional',
        status: 'active',
        displayName: input.displayName,
        email: input.email,
        phone: input.phone || '',
        firebaseUid: input.uid,
        registrationStep: 'in_progress',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        constitutionVersion: '1.0.0',
      });
    }
  } catch {
    // best-effort, never fail registration on the Actor root write
  }

  const existingIdentity = await getIdentity(key).catch(() => null);
  if (!existingIdentity) {
    await createIdentity(key, {
      email: input.email,
      phone: input.phone || '',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      verified: false,
      twoFactorEnabled: false,
      securityKeys: [],
      authProvider: 'email',
      status: 'active',
    });
  }

  const existingPerson = await getPerson(key).catch(() => null);
  if (!existingPerson) {
    await createPerson(key, {
      identityId: key,
      fullName: input.displayName,
      givenName: input.displayName.split(' ')[0] || '',
      familyName: input.displayName.split(' ').slice(1).join(' ') || '',
      dateOfBirth: '',
      gender: 'undisclosed',
      nationality: '',
      nationalId: '',
      address: { country: 'Kenya', county: '' },
    });
  }

  const existingProfessional = await getProfessional(key).catch(() => null);
  if (!existingProfessional && input.accountType === 'professional') {
    const category = (input.professionalCategory || categoryFromRole(input.clinicianRole)) as ProfessionalCategory;
    await createProfessional(key, {
      personId: key,
      categories: [category],
      primaryCategory: category,
      specialties: [],
      qualifications: [],
      yearsOfExperience: 0,
      verified: false,
      verificationDocuments: [],
    });
  }
}

/** Display AMX-ID derived stably from the actor key — a secondary index, never identity. */
function deriveDisplayAmx(key: AmxUid | string): string {
  const upper = String(key).replace(/-/g, '').toUpperCase();
  const tail = upper.length >= 8 ? upper.slice(0, 8) : upper.padEnd(8, '0');
  return `AMX-${tail}`;
}
