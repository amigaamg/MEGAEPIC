// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Engine — Employment Resolver
// Resolves employment records for an actor within an organization
// ═══════════════════════════════════════════════════════════════════════════════

import { getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AmxUid, Employment } from '@/lib/amexan/constitution/types';
import type {
  ResolverResult,
  ResolverContext,
} from './types';
import { orgEmploymentsCol } from '@/lib/amexan/constitution/firestoreService';
import { listPersonEmployments } from '@/lib/amexan/constitution/firestoreService';

export class EmploymentResolver {
  private cache = new Map<string, ResolverResult<Employment[]>>();
  private cacheTtl = 5 * 60 * 1000; // 5 minutes

  async resolve(context: ResolverContext): Promise<ResolverResult<Employment[]>> {
    if (!context.activeOrganizationId) {
      return { data: [], error: null, fromCache: false, resolvedAt: Date.now() };
    }

    const cacheKey = `employments:${context.uid}:${context.activeOrganizationId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && !context.forceRefresh && Date.now() - cached.resolvedAt < this.cacheTtl) {
      return { ...cached, fromCache: true };
    }

    try {
      const personId = context.personId || context.uid;
      const employments = await listPersonEmployments(context.activeOrganizationId, personId);

      // Sort: primary first, then active, then by startDate desc
      employments.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return b.startDate - a.startDate;
      });

      const result: ResolverResult<Employment[]> = {
        data: employments,
        error: null,
        fromCache: false,
        resolvedAt: Date.now(),
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      const result: ResolverResult<Employment[]> = {
        data: null,
        error: error as Error,
        fromCache: false,
        resolvedAt: Date.now(),
      };
      return result;
    }
  }

  async getActiveEmployment(context: ResolverContext): Promise<ResolverResult<Employment | null>> {
    const employmentsResult = await this.resolve(context);
    if (employmentsResult.error || !employmentsResult.data) {
      return { data: null, error: employmentsResult.error, fromCache: employmentsResult.fromCache, resolvedAt: employmentsResult.resolvedAt };
    }

    // Priority: primary active > first active > primary > first
    let active = employmentsResult.data.find(e => e.isPrimary && e.status === 'active');
    if (!active) {
      active = employmentsResult.data.find(e => e.status === 'active');
    }
    if (!active) {
      active = employmentsResult.data.find(e => e.isPrimary);
    }

    return {
      data: active || null,
      error: null,
      fromCache: employmentsResult.fromCache,
      resolvedAt: employmentsResult.resolvedAt,
    };
  }

  async getEmploymentById(orgId: string, employmentId: string): Promise<ResolverResult<Employment | null>> {
    const { getEmployment } = await import('@/lib/amexan/constitution/firestoreService');
    try {
      const employment = await getEmployment(orgId, employmentId);
      return { data: employment, error: null, fromCache: false, resolvedAt: Date.now() };
    } catch (error) {
      return { data: null, error: error as Error, fromCache: false, resolvedAt: Date.now() };
    }
  }

  invalidateCache(uid: AmxUid, orgId?: string): void {
    if (orgId) {
      this.cache.delete(`employments:${uid}:${orgId}`);
    } else {
      // Clear all orgs for this user
      for (const key of this.cache.keys()) {
        if (key.startsWith(`employments:${uid}:`)) {
          this.cache.delete(key);
        }
      }
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const employmentResolver = new EmploymentResolver();