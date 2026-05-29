import {
  doc, setDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, onSnapshot, Unsubscribe,
} from 'firebase/firestore';
import {
  orgRef, orgsCol, orgDeptsCol, orgUnitsCol,
  orgDeptRef, orgUnitRef,
  orgMemberRef, orgMembersCol, orgSettingsRef,
} from './collections';
import { updateUserProfile } from './authService';

export interface Organization {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'specialist_center' | 'telemedicine' | 'teaching_hospital' | 'private_practice';
  country: string;
  city?: string;
  logo?: string;
  departments: string[];
  createdAt: number;
  createdBy: string;
  isActive: boolean;
}

export interface OrgMember {
  userId: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'hospital_admin' | 'consultant' | 'medical_officer' | 'nurse' | 'lab_tech' | 'pharmacist' | 'receptionist' | 'student' | 'read_only';
  departmentAccess: string[];
  permissions: {
    prescribing: boolean;
    noteEditing: boolean;
    dischargeRights: boolean;
    analyticsAccess: boolean;
    adminVisibility: boolean;
  };
  joinedAt: number;
  isActive: boolean;
}

// ── Create Organization ──────────────────────────────────────────────────────

export async function createOrganization(data: Omit<Organization, 'id' | 'createdAt' | 'isActive'> & { adminUserId: string }): Promise<string> {
  const ref = doc(orgsCol());
  const org: Organization = {
    id: ref.id,
    ...data,
    createdAt: Date.now(),
    isActive: true,
  };
  await setDoc(ref, org);

  // Add admin as first member
  await setDoc(orgMemberRef(ref.id, data.adminUserId), {
    userId: data.adminUserId,
    email: '',
    displayName: 'Admin',
    role: 'hospital_admin',
    departmentAccess: ['*'],
    permissions: {
      prescribing: true,
      noteEditing: true,
      dischargeRights: true,
      analyticsAccess: true,
      adminVisibility: true,
    },
    joinedAt: Date.now(),
    isActive: true,
  } as OrgMember);

  // Set default settings
  await setDoc(orgSettingsRef(ref.id), {
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
  });

  // Update admin user's org list
  await updateUserProfile(data.adminUserId, {
    organizations: [ref.id],
    activeOrganizationId: ref.id,
  } as any);

  return ref.id;
}

// ── Get Organization ─────────────────────────────────────────────────────────

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const snap = await getDoc(orgRef(orgId));
  return snap.exists() ? snap.data() as Organization : null;
}

// ── Add Member ───────────────────────────────────────────────────────────────

export async function addOrgMember(orgId: string, member: OrgMember): Promise<void> {
  await setDoc(orgMemberRef(orgId, member.userId), member);
}

export async function getOrgMember(orgId: string, userId: string): Promise<OrgMember | null> {
  const snap = await getDoc(orgMemberRef(orgId, userId));
  return snap.exists() ? snap.data() as OrgMember : null;
}

export async function getOrgMembers(orgId: string): Promise<OrgMember[]> {
  const snap = await getDocs(orgMembersCol(orgId));
  return snap.docs.map(d => d.data() as OrgMember);
}

// ── Update Member ────────────────────────────────────────────────────────────

export async function updateOrgMember(orgId: string, userId: string, updates: Partial<OrgMember>): Promise<void> {
  await updateDoc(orgMemberRef(orgId, userId), updates);
}

// ── Switch Organization ──────────────────────────────────────────────────────

export async function switchActiveOrganization(userId: string, orgId: string): Promise<void> {
  await updateUserProfile(userId, { activeOrganizationId: orgId } as any);
}

// ── List User Organizations ──────────────────────────────────────────────────

export async function listUserOrgs(userId: string): Promise<Organization[]> {
  const snap = await getDocs(query(orgMembersCol('*'), where('userId', '==', userId)));
  // Get org IDs from memberships
  const orgIds = snap.docs.map(d => d.id);
  const orgs: Organization[] = [];
  for (const id of orgIds) {
    const org = await getOrganization(id);
    if (org) orgs.push(org);
  }
  return orgs;
}

export function listenUserOrgs(userId: string, onData: (orgs: Organization[]) => void): Promise<() => void> {
  // Since we can't do collection group on members easily, fetch on mount
  return listUserOrgs(userId).then(onData).then(() => () => {});
}

// ── Add Department ───────────────────────────────────────────────────────────

export async function addDepartment(orgId: string, deptId: string, data: { name: string; label: string; icon?: string; color?: string; description?: string }): Promise<void> {
  await setDoc(orgDeptRef(orgId, deptId), {
    ...data,
    createdAt: Date.now(),
  });
}

// ── Add Unit ─────────────────────────────────────────────────────────────────

export async function addUnit(orgId: string, deptId: string, unitId: string, data: { name: string; label: string; icon?: string; description?: string }): Promise<void> {
  await setDoc(orgUnitRef(orgId, deptId, unitId), {
    ...data,
    createdAt: Date.now(),
  });
}
