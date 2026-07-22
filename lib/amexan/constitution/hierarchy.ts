import type { Organization, Department, Ward, Clinic, Theatre, Unit, Address } from './types';

export interface OrgTree {
  organization: Organization;
  departments: DeptTreeNode[];
}

export interface DeptTreeNode {
  department: Department;
  units: UnitNode[];
  wards: Ward[];
  clinics: Clinic[];
  theatres: Theatre[];
  children: DeptTreeNode[];
}

export interface UnitNode {
  unit: Unit;
  staff: { id: string; name: string; role: string }[];
}

export function buildOrgTree(org: Organization, allDepartments: Department[]): OrgTree {
  const deptMap = new Map<string, Department>();
  for (const d of allDepartments) deptMap.set(d.id, d);

  const rootDepts = allDepartments.filter(d => !d.parentDepartmentId);
  const childrenOf = (parentId: string) => allDepartments.filter(d => d.parentDepartmentId === parentId);

  function buildDeptNode(dept: Department): DeptTreeNode {
    return {
      department: dept,
      units: dept.units.map(u => ({ unit: u, staff: [] })),
      wards: dept.wards ?? [],
      clinics: dept.clinics ?? [],
      theatres: dept.theatres ?? [],
      children: childrenOf(dept.id).map(buildDeptNode),
    };
  }

  return {
    organization: org,
    departments: rootDepts.map(buildDeptNode),
  };
}

export function findDepartmentById(tree: OrgTree, deptId: string): DeptTreeNode | null {
  function search(nodes: DeptTreeNode[]): DeptTreeNode | null {
    for (const node of nodes) {
      if (node.department.id === deptId) return node;
      if (node.children.length > 0) {
        const found = search(node.children);
        if (found) return found;
      }
    }
    return null;
  }
  return search(tree.departments);
}

export function getDepartmentChain(allDepartments: Department[], deptId: string): Department[] {
  const chain: Department[] = [];
  const deptMap = new Map(allDepartments.map(d => [d.id, d]));
  let current = deptMap.get(deptId);
  while (current) {
    chain.unshift(current);
    current = current.parentDepartmentId ? deptMap.get(current.parentDepartmentId) : undefined;
  }
  return chain;
}

export function getStaffInUnit(/*unitId: string*/): { id: string; name: string; role: string }[] {
  return [];
}

export function getBedsInWard(ward: Ward): { total: number; occupied: number; available: number } {
  return {
    total: ward.capacity,
    occupied: ward.currentOccupancy,
    available: ward.capacity - ward.currentOccupancy,
  };
}

export function formatAddress(address: Address): string {
  const parts = [address.street, address.city, address.subCounty, address.county, address.country].filter(Boolean);
  return parts.join(', ');
}

export function getOrgStats(org: Organization, departments: Department[]): {
  totalDepartments: number;
  totalWards: number;
  totalClinics: number;
  totalTheatres: number;
  totalBedCapacity: number;
  totalOccupiedBeds: number;
} {
  let totalWards = 0, totalClinics = 0, totalTheatres = 0, totalBedCapacity = 0, totalOccupiedBeds = 0;

  for (const dept of departments) {
    totalWards += dept.wards?.length ?? 0;
    totalClinics += dept.clinics?.length ?? 0;
    totalTheatres += dept.theatres?.length ?? 0;
    for (const ward of dept.wards ?? []) {
      totalBedCapacity += ward.capacity;
      totalOccupiedBeds += ward.currentOccupancy;
    }
  }

  return {
    totalDepartments: departments.length,
    totalWards,
    totalClinics,
    totalTheatres,
    totalBedCapacity,
    totalOccupiedBeds,
  };
}
