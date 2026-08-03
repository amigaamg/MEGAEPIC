import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { orgRef } from './collections';

export type OrgHierarchyNode = {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'network' | 'region' | 'country' | 'department' | 'ward' | 'team' | 'unit' | 'organization';
  parentId: string | null;
  children: string[];
  country: string;
  region: string;
  network: string;
  hospital: string;
  department: string;
  ward: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: number;
  meta?: Record<string, unknown>;
};

const ACTIVE_ORG_KEY = 'amexan.activeOrganizationId';

export function getActiveOrganizationId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(ACTIVE_ORG_KEY);
  } catch {
    return null;
  }
}

export function setActiveOrganizationId(orgId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVE_ORG_KEY, orgId);
  } catch {
    // storage unavailable (e.g. private mode) — non-fatal
  }
}

export async function registerHierarchyNode(node: OrgHierarchyNode): Promise<void> {
  if (typeof window === 'undefined') return;
  await setDoc(doc(db, 'organizations', node.id, 'hierarchy', node.id), {
    ...node,
    children: node.children || [],
  });
}

export async function getHierarchyNode(orgId: string): Promise<OrgHierarchyNode | null> {
  const snap = await getDoc(doc(db, 'organizations', orgId, 'hierarchy', orgId));
  return snap.exists() ? (snap.data() as OrgHierarchyNode) : null;
}

export async function addHierarchyChild(orgId: string, child: OrgHierarchyNode): Promise<void> {
  await setDoc(doc(db, 'organizations', orgId, 'hierarchy', child.id), {
    ...child,
    children: child.children || [],
  });
  const parent = await getHierarchyNode(orgId);
  if (parent) {
    await updateDoc(doc(db, 'organizations', orgId, 'hierarchy', orgId), {
      children: Array.from(new Set([...(parent.children || []), child.id])),
    });
  }
}

export async function getOrganizationContext(orgId: string) {
  const snap = await getDoc(orgRef(orgId));
  return snap.exists() ? snap.data() : null;
}
