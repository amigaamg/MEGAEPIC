// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Engine — Assignment Resolver
// Resolves today's assignments, shifts, and shift assignments for an actor
// ═══════════════════════════════════════════════════════════════════════════════

import { getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AmxUid, Assignment, WorkSchedule } from '@/lib/amexan/constitution/types';
import type {
  Shift,
  ShiftAssignment,
  ResolverResult,
  ResolverContext,
} from './types';
import { orgAssignmentsCol } from '@/lib/amexan/constitution/firestoreService';
import { listPersonAssignments } from '@/lib/amexan/constitution/firestoreService';

const SHIFT_COLLECTION = 'shifts';
const SHIFT_ASSIGNMENT_COLLECTION = 'shift_assignments';

function startOfDay(date = new Date()): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function endOfDay(date = new Date()): number {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function isAssignmentToday(assignment: Assignment): boolean {
  const now = Date.now();
  return assignment.startTime <= endOfDay(new Date(now)) && assignment.endTime >= startOfDay(new Date(now));
}

function isAssignmentActive(assignment: Assignment): boolean {
  const now = Date.now();
  return assignment.startTime <= now && assignment.endTime >= now && assignment.status === 'active';
}

export class AssignmentResolver {
  private cache = new Map<string, ResolverResult<Assignment[]>>();
  private shiftCache = new Map<string, ResolverResult<Shift[]>>();
  private shiftAssignmentCache = new Map<string, ResolverResult<ShiftAssignment[]>>();
  private cacheTtl = 2 * 60 * 1000; // 2 minutes (assignments change frequently)

  async resolveAssignments(context: ResolverContext): Promise<ResolverResult<Assignment[]>> {
    if (!context.activeOrganizationId || !context.activeEmploymentId) {
      return { data: [], error: null, fromCache: false, resolvedAt: Date.now() };
    }

    const cacheKey = `assignments:${context.uid}:${context.activeOrganizationId}:${context.activeEmploymentId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && !context.forceRefresh && Date.now() - cached.resolvedAt < this.cacheTtl) {
      return { ...cached, fromCache: true };
    }

    try {
      const personId = context.personId || context.uid;
      const allAssignments = await listPersonAssignments(context.activeOrganizationId, personId);

      // Filter to today's assignments
      const todayAssignments = allAssignments.filter(isAssignmentToday);

      // Sort by start time
      todayAssignments.sort((a, b) => a.startTime - b.startTime);

      const result: ResolverResult<Assignment[]> = {
        data: todayAssignments,
        error: null,
        fromCache: false,
        resolvedAt: Date.now(),
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      const result: ResolverResult<Assignment[]> = {
        data: null,
        error: error as Error,
        fromCache: false,
        resolvedAt: Date.now(),
      };
      return result;
    }
  }

  async getActiveAssignment(context: ResolverContext): Promise<ResolverResult<Assignment | null>> {
    const assignmentsResult = await this.resolveAssignments(context);
    if (assignmentsResult.error || !assignmentsResult.data) {
      return { data: null, error: assignmentsResult.error, fromCache: assignmentsResult.fromCache, resolvedAt: assignmentsResult.resolvedAt };
    }

    // Priority: currently active > first scheduled today > first overall
    let active = assignmentsResult.data.find(isAssignmentActive);
    if (!active) {
      active = assignmentsResult.data.find(a => a.status === 'scheduled');
    }

    return {
      data: active || null,
      error: null,
      fromCache: assignmentsResult.fromCache,
      resolvedAt: assignmentsResult.resolvedAt,
    };
  }

  async getAllAssignments(context: ResolverContext): Promise<ResolverResult<Assignment[]>> {
    if (!context.activeOrganizationId) {
      return { data: [], error: null, fromCache: false, resolvedAt: Date.now() };
    }

    try {
      const personId = context.personId || context.uid;
      const allAssignments = await listPersonAssignments(context.activeOrganizationId, personId);
      allAssignments.sort((a, b) => b.startTime - a.startTime); // Most recent first

      return { data: allAssignments, error: null, fromCache: false, resolvedAt: Date.now() };
    } catch (error) {
      return { data: null, error: error as Error, fromCache: false, resolvedAt: Date.now() };
    }
  }

  async resolveShifts(context: ResolverContext): Promise<ResolverResult<Shift[]>> {
    if (!context.activeOrganizationId) {
      return { data: [], error: null, fromCache: false, resolvedAt: Date.now() };
    }

    const cacheKey = `shifts:${context.activeOrganizationId}`;
    const cached = this.shiftCache.get(cacheKey);

    if (cached && !context.forceRefresh && Date.now() - cached.resolvedAt < this.cacheTtl) {
      return { ...cached, fromCache: true };
    }

    try {
      const shiftsSnap = await getDocs(query(
        collection(db, 'organizations', context.activeOrganizationId, SHIFT_COLLECTION),
        where('status', '==', 'active')
      ));

      const shifts: Shift[] = shiftsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Shift));
      shifts.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

      const result: ResolverResult<Shift[]> = {
        data: shifts,
        error: null,
        fromCache: false,
        resolvedAt: Date.now(),
      };

      this.shiftCache.set(cacheKey, result);
      return result;
    } catch (error) {
      return { data: null, error: error as Error, fromCache: false, resolvedAt: Date.now() };
    }
  }

  async resolveShiftAssignments(context: ResolverContext): Promise<ResolverResult<ShiftAssignment[]>> {
    if (!context.activeOrganizationId) {
      return { data: [], error: null, fromCache: false, resolvedAt: Date.now() };
    }

    const today = startOfDay();
    const cacheKey = `shiftAssignments:${context.uid}:${context.activeOrganizationId}:${today}`;
    const cached = this.shiftAssignmentCache.get(cacheKey);

    if (cached && !context.forceRefresh && Date.now() - cached.resolvedAt < this.cacheTtl) {
      return { ...cached, fromCache: true };
    }

    try {
      const shiftAssignmentsSnap = await getDocs(query(
        collection(db, 'organizations', context.activeOrganizationId, SHIFT_ASSIGNMENT_COLLECTION),
        where('personId', '==', context.uid),
        where('date', '==', today)
      ));

      const shiftAssignments: ShiftAssignment[] = shiftAssignmentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as ShiftAssignment));
      shiftAssignments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      const result: ResolverResult<ShiftAssignment[]> = {
        data: shiftAssignments,
        error: null,
        fromCache: false,
        resolvedAt: Date.now(),
      };

      this.shiftAssignmentCache.set(cacheKey, result);
      return result;
    } catch (error) {
      return { data: null, error: error as Error, fromCache: false, resolvedAt: Date.now() };
    }
  }

  async getActiveShiftAssignment(context: ResolverContext): Promise<ResolverResult<ShiftAssignment | null>> {
    const shiftAssignmentsResult = await this.resolveShiftAssignments(context);
    if (shiftAssignmentsResult.error || !shiftAssignmentsResult.data) {
      return { data: null, error: shiftAssignmentsResult.error, fromCache: shiftAssignmentsResult.fromCache, resolvedAt: shiftAssignmentsResult.resolvedAt };
    }

    // Priority: checked_in > confirmed > scheduled
    let active = shiftAssignmentsResult.data.find(sa => sa.status === 'checked_in');
    if (!active) {
      active = shiftAssignmentsResult.data.find(sa => sa.status === 'confirmed');
    }
    if (!active) {
      active = shiftAssignmentsResult.data.find(sa => sa.status === 'scheduled');
    }

    return {
      data: active || null,
      error: null,
      fromCache: shiftAssignmentsResult.fromCache,
      resolvedAt: shiftAssignmentsResult.resolvedAt,
    };
  }

  async getActiveShift(context: ResolverContext): Promise<ResolverResult<Shift | null>> {
    const [shiftsResult, shiftAssignmentResult] = await Promise.all([
      this.resolveShifts(context),
      this.getActiveShiftAssignment(context),
    ]);

    if (shiftsResult.error || !shiftsResult.data) {
      return { data: null, error: shiftsResult.error, fromCache: shiftsResult.fromCache, resolvedAt: shiftsResult.resolvedAt };
    }

    if (shiftAssignmentResult.data) {
      const shift = shiftsResult.data.find(s => s.id === shiftAssignmentResult.data!.shiftId);
      return { data: shift || null, error: null, fromCache: shiftsResult.fromCache, resolvedAt: shiftsResult.resolvedAt };
    }

    // Fallback: find shift matching current time
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dayOfWeek = now.getDay();

    const matchingShift = shiftsResult.data.find(s =>
      s.daysOfWeek.includes(dayOfWeek) &&
      s.startTime <= currentTime &&
      s.endTime >= currentTime
    );

    return {
      data: matchingShift || null,
      error: null,
      fromCache: shiftsResult.fromCache,
      resolvedAt: shiftsResult.resolvedAt,
    };
  }

  invalidateCache(uid: AmxUid, orgId?: string): void {
    if (orgId) {
      this.cache.delete(`assignments:${uid}:${orgId}:*`);
      this.shiftCache.delete(`shifts:${orgId}`);
      this.shiftAssignmentCache.delete(`shiftAssignments:${uid}:${orgId}:*`);
    } else {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`assignments:${uid}:`)) this.cache.delete(key);
      }
      for (const key of this.shiftAssignmentCache.keys()) {
        if (key.startsWith(`shiftAssignments:${uid}:`)) this.shiftAssignmentCache.delete(key);
      }
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.shiftCache.clear();
    this.shiftAssignmentCache.clear();
  }
}

export const assignmentResolver = new AssignmentResolver();