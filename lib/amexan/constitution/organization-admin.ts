import type { AmxUid, Employment, Assignment, Organization, Department } from './types';

export interface WorkerRegistration {
  identityId: AmxUid;
  orgId: string;
  deptId: string;
  roleId: string;
  jobTitle: string;
  employmentType: Employment['employmentType'];
  startDate: number;
  supervisorId?: AmxUid;
}

export function registerWorker(data: WorkerRegistration): Omit<Employment, 'id'> {
  return {
    personId: data.identityId,
    organizationId: data.orgId,
    departmentId: data.deptId,
    professionalIdentityId: data.identityId,
    employeeId: `EMP-${Date.now().toString(36).toUpperCase()}`,
    jobTitle: data.jobTitle,
    employmentType: data.employmentType,
    startDate: data.startDate,
    endDate: undefined,
    isPrimary: false,
    schedule: {
      type: 'full_time',
      weeklyHours: 40,
      workingDays: [1, 2, 3, 4, 5],
      leaveBalance: { annual: 30, sick: 14, study: 10, maternity: 90, paternity: 14, compassionate: 5, unpaid: 30 },
    },
    privileges: [],
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function transferWorker(
  employment: Employment,
  toDeptId: string,
  toUnitId?: string,
): Employment {
  return {
    ...employment,
    departmentId: toDeptId,
    unitId: toUnitId ?? employment.unitId,
    updatedAt: Date.now(),
  };
}

export function suspendWorker(employment: Employment, reason: string): Employment {
  return {
    ...employment,
    status: 'suspended',
    terminationReason: reason,
    updatedAt: Date.now(),
  };
}

export function terminateWorker(employment: Employment, reason: string): Employment {
  return {
    ...employment,
    status: 'terminated',
    endDate: Date.now(),
    terminationReason: reason,
    updatedAt: Date.now(),
  }
}

export function getDepartmentStats(dept: Department, employments: Employment[]): {
  totalStaff: number;
  activeStaff: number;
  suspendedStaff: number;
  terminatedStaff: number;
  staffByRole: Record<string, number>;
} {
  const active = employments.filter(e => e.status === 'active');
  const suspended = employments.filter(e => e.status === 'suspended');
  const terminated = employments.filter(e => e.status === 'terminated');
  const byRole: Record<string, number> = {};

  for (const e of employments) {
    byRole[e.jobTitle] = (byRole[e.jobTitle] ?? 0) + 1;
  }

  return {
    totalStaff: employments.length,
    activeStaff: active.length,
    suspendedStaff: suspended.length,
    terminatedStaff: terminated.length,
    staffByRole: byRole,
  };
}

export function getOrgCapacity(org: Organization, departments: Department[]): {
  totalDepartments: number;
  activeDepartments: number;
  totalStaff: number;
} {
  const activeDepts = departments.filter(d => d.status === 'active');
  return {
    totalDepartments: departments.length,
    activeDepartments: activeDepts.length,
    totalStaff: 0,
  };
}
