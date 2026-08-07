// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Engine — Membership Resolver
// Resolves all organizations an actor belongs to.
// Reads from BOTH the legacy `organizations/{orgId}/members` collection (used by
// existing seed data) and the new `organizations/{orgId}/memberships` collection.
// ═══════════════════════════════════════════════════════════════════════════════

import { getDocs, query, where, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sanitizeForFirestore } from '@/lib/firebase/sanitize';
import type { AmxUid } from '@/lib/amexan/constitution/types';
import type {
  Membership,
  ResolverResult,
  ResolverContext,
} from './types';
import { getOrganization } from '@/lib/amexan/constitution/firestoreService';
import { getOrgRole } from '@/lib/amexan/constitution/firestoreService';
import type { Organization } from '@/lib/amexan/constitution/types';

const MEMBERS_COLLECTION = 'members';
const MEMBERSHIPS_COLLECTION = 'memberships';

export class MembershipResolver {
  private cache = new Map<string, ResolverResult<Membership[]>>();
  private cacheTtl = 5 * 60 * 1000; // 5 minutes

  async resolve(context: ResolverContext): Promise<ResolverResult<Membership[]>> {
    const cacheKey = `memberships:${context.uid}`;
    const cached = this.cache.get(cacheKey);

    if (cached && !context.forceRefresh && Date.now() - cached.resolvedAt < this.cacheTtl) {
      return { ...cached, fromCache: true };
    }

    try {
      const memberships: Membership[] = [];
      const seen = new Set<string>();
      // The actor may be referenced by Firebase UID (legacy members) or by the
      // canonical AMX-UID (constitutional memberships). Query both and de-dupe.
      const actorIds = Array.from(new Set([context.uid, context.personId].filter(Boolean))) as string[];
      const personId = context.personId || context.uid;

      // ── Primary path (always works): read the ACTIVE organization's membership
      // directly. `users/{uid}.activeOrganizationId` is the constitutional anchor
      // (WS-010) already persisted on the user doc, so this read needs no
      // missing-collection-group index and is single-doc — one round trip.
      // Both the legacy `members/{firebaseUid}` and constitutional
      // `memberships/{personId}` shapes are supported.
      if (context.activeOrganizationId) {
        const orgDirect = await getOrganization(context.activeOrganizationId).catch(() => null);
        if (orgDirect) {
          const fromLegacy = await readDirectMembership(
            context.activeOrganizationId, orgDirect, false, actorIds, personId,
          );
          const fromNew = await readDirectMembership(
            context.activeOrganizationId, orgDirect, true, actorIds, personId,
          );
          const direct = fromNew ?? fromLegacy;
          if (direct) {
            memberships.push(direct);
            seen.add(direct.organizationId);
          }
        }
      }

      // ── Best-effort scans: find any ADDITIONAL organizations the actor belongs
      // to. These require a collection-group index; if the index is missing the
      // queries throw and we deliberately IGNORE them — the active membership
      // above already guarantees the workspaces single-organization resolution.
      // ── Legacy path: organizations/{orgId}/members/{userId} ─────────────────
      for (const actorId of actorIds) {
        const legacySnap = await getDocs(
          query(
            collectionGroup(db, MEMBERS_COLLECTION),
            where('userId', '==', actorId),
          )
        ).catch(() => null);
        if (!legacySnap) continue;
        for (const doc of legacySnap.docs) {
          const data = doc.data();
          const orgId = doc.ref.parent.parent?.id;
          if (!orgId || seen.has(orgId)) continue;

          const org = await getOrganization(orgId).catch(() => null);
          if (!org) continue;

          const membership: Membership = {
            id: doc.id,
            personId: context.personId || context.uid,
            organizationId: orgId,
            organizationName: org.name,
            organizationType: org.type,
            roleId: data.roleId || '',
            roleName: data.roleName || data.roleId || 'Member',
            departmentId: data.departmentIds?.[0] || undefined,
            departmentName: undefined,
            facilityId: undefined,
            facilityName: undefined,
            isPrimary: false,
            status: data.isActive === false ? 'inactive' : 'active',
            joinedAt: data.joinedAt || 0,
            updatedAt: 0,
            metadata: { source: 'members', ...data },
          };
          memberships.push(membership);
          seen.add(orgId);
        }
      }

      // ── New path: organizations/{orgId}/memberships/{personId} ──────────────
      for (const actorId of actorIds) {
        const newSnap = await getDocs(
          query(
            collectionGroup(db, MEMBERSHIPS_COLLECTION),
            where('personId', '==', actorId),
          )
        ).catch(() => null);
        if (!newSnap) continue;
        for (const doc of newSnap.docs) {
          const data = doc.data();
          const orgId = doc.ref.parent.parent?.id;
          if (!orgId || seen.has(orgId)) continue;

          const org = await getOrganization(orgId).catch(() => null);
          if (!org) continue;

          // Resolve role name from the role id
          let roleName = data.roleId || 'Member';
          if (data.roleId) {
            const role = await getOrgRole(orgId, data.roleId).catch(() => null);
            if (role) roleName = role.name;
          }

          const membership: Membership = {
            id: doc.id,
            personId: context.personId || context.uid,
            organizationId: orgId,
            organizationName: org.name,
            organizationType: org.type,
            roleId: data.roleId || '',
            roleName,
            departmentId: data.departmentId || undefined,
            departmentName: data.departmentName || undefined,
            facilityId: data.facilityId || undefined,
            facilityName: data.facilityName || undefined,
            isPrimary: !!data.isPrimary,
            status: data.status || 'active',
            joinedAt: data.joinedAt || 0,
            updatedAt: data.updatedAt || 0,
            metadata: data.metadata,
          };
          memberships.push(membership);
        }
      }

      // Sort: primary first, then by joinedAt desc
      memberships.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (b.joinedAt || 0) - (a.joinedAt || 0);
      });

      const result: ResolverResult<Membership[]> = {
        data: memberships,
        error: null,
        fromCache: false,
        resolvedAt: Date.now(),
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      const result: ResolverResult<Membership[]> = {
        data: null,
        error: error as Error,
        fromCache: false,
        resolvedAt: Date.now(),
      };
      return result;
    }
  }

  async getActiveMembership(context: ResolverContext): Promise<ResolverResult<Membership | null>> {
    const membershipsResult = await this.resolve(context);
    if (membershipsResult.error || !membershipsResult.data) {
      return { data: null, error: membershipsResult.error, fromCache: membershipsResult.fromCache, resolvedAt: membershipsResult.resolvedAt };
    }

    // Priority: context.activeOrganizationId > isPrimary > first active
    let active = membershipsResult.data.find(m => m.organizationId === context.activeOrganizationId);
    if (!active) {
      active = membershipsResult.data.find(m => m.isPrimary && m.status === 'active');
    }
    if (!active) {
      active = membershipsResult.data.find(m => m.status === 'active');
    }

    return {
      data: active || null,
      error: null,
      fromCache: membershipsResult.fromCache,
      resolvedAt: membershipsResult.resolvedAt,
    };
  }

  async createMembership(membership: Omit<Membership, 'id' | 'joinedAt' | 'updatedAt'>): Promise<string> {
    const { doc, setDoc } = await import('firebase/firestore');
    const now = Date.now();
    const ref = doc(db, 'organizations', membership.organizationId, MEMBERSHIPS_COLLECTION, membership.personId);
    await setDoc(ref, sanitizeForFirestore({ ...membership, joinedAt: now, updatedAt: now }));
    this.invalidateCache(membership.personId);
    return ref.id;
  }

  async updateMembership(personId: AmxUid, orgId: string, data: Partial<Membership>): Promise<void> {
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'organizations', orgId, MEMBERSHIPS_COLLECTION, personId), {
      ...data,
      updatedAt: Date.now(),
    });
    this.invalidateCache(personId);
  }

  async setPrimaryMembership(personId: AmxUid, orgId: string): Promise<void> {
    const membershipsResult = await this.resolve({ uid: personId, forceRefresh: true });
    if (membershipsResult.data) {
      for (const m of membershipsResult.data) {
        await this.updateMembership(personId, m.organizationId, { isPrimary: m.organizationId === orgId });
      }
    }
  }

  invalidateCache(uid: AmxUid): void {
    this.cache.delete(`memberships:${uid}`);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const membershipResolver = new MembershipResolver();

/**
 * Read a single membership directly from the ACTIVE organization — no
 * collection-group index required (WS-010 anchor: users/{uid}.activeOrganizationId).
 * Tries both storage shapes and returns the first that exists:
 *   legacy  : organizations/{orgId}/members/{firebaseUid}        (field userId)
 *   new     : organizations/{orgId}/memberships/{personId}       (field personId)
 */
async function readDirectMembership(
  orgId: string,
  org: Organization,
  useNew: boolean,
  actorIds: string[],
  personId: AmxUid,
): Promise<Membership | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const ids = useNew ? [personId] : actorIds;
  for (const id of ids) {
    const ref = doc(db, 'organizations', orgId, useNew ? MEMBERSHIPS_COLLECTION : MEMBERS_COLLECTION, id);
    const snap = await getDoc(ref).catch(() => null);
    if (!snap?.exists()) continue;
    const data = snap.data();
    if (useNew) {
      let roleName = data.roleId || 'Member';
      if (data.roleId) {
        const role = await getOrgRole(orgId, data.roleId).catch(() => null);
        if (role) roleName = role.name;
      }
      return {
        id: snap.id,
        personId,
        organizationId: orgId,
        organizationName: org.name || '',
        organizationType: org.type,
        roleId: data.roleId || '',
        roleName,
        departmentId: data.departmentId || undefined,
        departmentName: data.departmentName || undefined,
        facilityId: data.facilityId || undefined,
        facilityName: data.facilityName || undefined,
        isPrimary: !!data.isPrimary,
        status: data.status || 'active',
        joinedAt: data.joinedAt || 0,
        updatedAt: data.updatedAt || 0,
        metadata: data.metadata,
      };
    }
    return {
      id: snap.id,
      personId,
      organizationId: orgId,
organizationName: org.name || '',
        organizationType: org.type,
        roleId: data.roleId || '',
        roleName: data.roleName || data.roleId || 'Member',
      departmentId: data.departmentIds?.[0] || undefined,
      departmentName: undefined,
      facilityId: undefined,
      facilityName: undefined,
      isPrimary: false,
      status: data.isActive === false ? 'inactive' : 'active',
      joinedAt: data.joinedAt || 0,
      updatedAt: 0,
      metadata: { source: 'members', ...data },
    };
  }
  return null;
}