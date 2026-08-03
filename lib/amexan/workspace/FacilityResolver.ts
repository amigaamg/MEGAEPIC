// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Engine — Facility Resolver
// Resolves the complete facility hierarchy: Organization → Campus → Facility → Building → Floor → Department → Ward/Clinic
// ═══════════════════════════════════════════════════════════════════════════════

import { getDocs, query, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Department, Ward, Clinic } from '@/lib/amexan/constitution/types';
import type {
  Facility,
  Campus,
  Building,
  Floor,
  FacilityHierarchy,
  ResolverResult,
  ResolverContext,
} from './types';
import { getOrganization, listDepartments } from '@/lib/amexan/constitution/firestoreService';

const CAMPUS_COLLECTION = 'campuses';
const BUILDING_COLLECTION = 'buildings';

export class FacilityResolver {
  private cache = new Map<string, ResolverResult<FacilityHierarchy>>();
  private cacheTtl = 10 * 60 * 1000; // 10 minutes (facility hierarchy changes less frequently)

  async resolveHierarchy(context: ResolverContext): Promise<ResolverResult<FacilityHierarchy>> {
    if (!context.activeOrganizationId) {
      return {
        data: { organization: null, campuses: [], facilities: [], buildings: [], floors: [], departments: [], wards: [], clinics: [] },
        error: null,
        fromCache: false,
        resolvedAt: Date.now(),
      };
    }

    const cacheKey = `hierarchy:${context.activeOrganizationId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && !context.forceRefresh && Date.now() - cached.resolvedAt < this.cacheTtl) {
      return { ...cached, fromCache: true };
    }

    try {
      const org = await getOrganization(context.activeOrganizationId);
      if (!org) {
        return {
          data: { organization: null, campuses: [], facilities: [], buildings: [], floors: [], departments: [], wards: [], clinics: [] },
          error: new Error('Organization not found'),
          fromCache: false,
          resolvedAt: Date.now(),
        };
      }

      // Facilities are derived from organization branches.
      const facilities: Facility[] = (org.branches || []).map((branch, idx) => ({
        id: branch.id || `facility-${idx}`,
        organizationId: context.activeOrganizationId!,
        name: branch.name,
        legalName: branch.name,
        type: branch.type as Facility['type'],
        code: branch.id || `FAC-${idx}`,
        address: branch.address,
        phone: branch.phone,
        email: branch.email || org.email,
        departments: branch.departments || [],
        status: branch.status,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      }));

      // If no branches, create a default facility from the organization itself.
      if (facilities.length === 0) {
        facilities.push({
          id: `main-${context.activeOrganizationId}`,
          organizationId: context.activeOrganizationId,
          name: org.name,
          legalName: org.legalName,
          type: org.type as Facility['type'],
          code: 'MAIN',
          address: org.address,
          phone: org.phone,
          email: org.email,
          departments: org.departments?.map(d => d.id) || [],
          status: 'active',
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
        });
      }

      // Fetch campuses
      const campusesSnap = await getDocs(query(
        collection(db, 'organizations', context.activeOrganizationId, CAMPUS_COLLECTION)
      ));
      const campuses: Campus[] = campusesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Campus));

      // Fetch buildings across campuses
      const buildings: Building[] = [];
      for (const campus of campuses) {
        const buildingsSnap = await getDocs(query(
          collection(db, 'organizations', context.activeOrganizationId, CAMPUS_COLLECTION, campus.id, BUILDING_COLLECTION)
        ));
        buildings.push(...buildingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Building)));
      }

      // Floors are embedded in building data
      const floors: Floor[] = [];
      for (const building of buildings) {
        if ((building as any).floors) {
          floors.push(...((building as any).floors as Floor[]));
        }
      }

      // Fetch departments
      const departments = await listDepartments(context.activeOrganizationId).catch(() => [] as Department[]);

      // Extract wards and clinics from departments
      const wards: Ward[] = [];
      const clinics: Clinic[] = [];
      for (const dept of departments) {
        if (dept.wards) wards.push(...dept.wards);
        if (dept.clinics) clinics.push(...dept.clinics);
      }

      const hierarchy: FacilityHierarchy = {
        organization: org,
        campuses,
        facilities,
        buildings,
        floors,
        departments,
        wards,
        clinics,
      };

      const result: ResolverResult<FacilityHierarchy> = {
        data: hierarchy,
        error: null,
        fromCache: false,
        resolvedAt: Date.now(),
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      const result: ResolverResult<FacilityHierarchy> = {
        data: null,
        error: error as Error,
        fromCache: false,
        resolvedAt: Date.now(),
      };
      return result;
    }
  }

  async resolveActiveFacility(context: ResolverContext): Promise<ResolverResult<Facility | null>> {
    const hierarchyResult = await this.resolveHierarchy(context);
    if (hierarchyResult.error || !hierarchyResult.data) {
      return { data: null, error: hierarchyResult.error, fromCache: hierarchyResult.fromCache, resolvedAt: hierarchyResult.resolvedAt };
    }

    let facility: Facility | null = null;

    // Priority: context.activeFacilityId > activeMembership.facilityId > first active facility
    if (context.activeFacilityId) {
      facility = hierarchyResult.data.facilities.find(f => f.id === context.activeFacilityId) || null;
    }
    if (!facility && context.activeDepartmentId) {
      facility = hierarchyResult.data.facilities.find(f => f.departments.includes(context.activeDepartmentId!)) || null;
    }
    if (!facility && context.activeMembership?.facilityId) {
      facility = hierarchyResult.data.facilities.find(f => f.id === context.activeMembership?.facilityId) || null;
    }
    if (!facility) {
      facility = hierarchyResult.data.facilities.find(f => f.status === 'active') || hierarchyResult.data.facilities[0] || null;
    }

    return {
      data: facility,
      error: null,
      fromCache: hierarchyResult.fromCache,
      resolvedAt: hierarchyResult.resolvedAt,
    };
  }

  async resolveActiveDepartment(context: ResolverContext): Promise<ResolverResult<Department | null>> {
    const hierarchyResult = await this.resolveHierarchy(context);
    if (hierarchyResult.error || !hierarchyResult.data) {
      return { data: null, error: hierarchyResult.error, fromCache: hierarchyResult.fromCache, resolvedAt: hierarchyResult.resolvedAt };
    }

    let department: Department | null = null;

    if (context.activeDepartmentId) {
      department = hierarchyResult.data.departments.find(d => d.id === context.activeDepartmentId) || null;
    }
    if (!department && context.activeFacilityId) {
      const facility = hierarchyResult.data.facilities.find(f => f.id === context.activeFacilityId);
      if (facility) {
        department = hierarchyResult.data.departments.find(d => facility.departments.includes(d.id)) || null;
      }
    }
    if (!department && context.activeMembership?.departmentId) {
      department = hierarchyResult.data.departments.find(d => d.id === context.activeMembership?.departmentId) || null;
    }
    if (!department && hierarchyResult.data.departments.length > 0) {
      department = hierarchyResult.data.departments.find(d =>
        ['emergency', 'outpatient', 'inpatient', 'surgery', 'medicine', 'pediatrics', 'obstetrics_gynaecology'].includes(d.type)
      ) || hierarchyResult.data.departments[0] || null;
    }

    return {
      data: department,
      error: null,
      fromCache: hierarchyResult.fromCache,
      resolvedAt: hierarchyResult.resolvedAt,
    };
  }

  async resolveActiveWard(context: ResolverContext): Promise<ResolverResult<Ward | null>> {
    const hierarchyResult = await this.resolveHierarchy(context);
    if (hierarchyResult.error || !hierarchyResult.data) {
      return { data: null, error: hierarchyResult.error, fromCache: hierarchyResult.fromCache, resolvedAt: hierarchyResult.resolvedAt };
    }

    // Priority: activeDepartment's first ward > first ward overall
    if (context.activeDepartmentId) {
      const dept = hierarchyResult.data.departments.find(d => d.id === context.activeDepartmentId);
      if (dept?.wards?.length) {
        return { data: dept.wards[0], error: null, fromCache: hierarchyResult.fromCache, resolvedAt: hierarchyResult.resolvedAt };
      }
    }
    if (context.activeMembership?.departmentId) {
      const dept = hierarchyResult.data.departments.find(d => d.id === context.activeMembership?.departmentId);
      if (dept?.wards?.length) {
        return { data: dept.wards[0], error: null, fromCache: hierarchyResult.fromCache, resolvedAt: hierarchyResult.resolvedAt };
      }
    }
    if (hierarchyResult.data.wards.length > 0) {
      return { data: hierarchyResult.data.wards[0], error: null, fromCache: hierarchyResult.fromCache, resolvedAt: hierarchyResult.resolvedAt };
    }

    return { data: null, error: null, fromCache: hierarchyResult.fromCache, resolvedAt: hierarchyResult.resolvedAt };
  }

  async resolveActiveClinic(context: ResolverContext): Promise<ResolverResult<Clinic | null>> {
    const hierarchyResult = await this.resolveHierarchy(context);
    if (hierarchyResult.error || !hierarchyResult.data) {
      return { data: null, error: hierarchyResult.error, fromCache: hierarchyResult.fromCache, resolvedAt: hierarchyResult.resolvedAt };
    }

    if (context.activeDepartmentId) {
      const dept = hierarchyResult.data.departments.find(d => d.id === context.activeDepartmentId);
      if (dept?.clinics?.length) {
        return { data: dept.clinics[0], error: null, fromCache: hierarchyResult.fromCache, resolvedAt: hierarchyResult.resolvedAt };
      }
    }
    if (hierarchyResult.data.clinics.length > 0) {
      return { data: hierarchyResult.data.clinics[0], error: null, fromCache: hierarchyResult.fromCache, resolvedAt: hierarchyResult.resolvedAt };
    }

    return { data: null, error: null, fromCache: hierarchyResult.fromCache, resolvedAt: hierarchyResult.resolvedAt };
  }

  invalidateCache(orgId: string): void {
    this.cache.delete(`hierarchy:${orgId}`);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const facilityResolver = new FacilityResolver();