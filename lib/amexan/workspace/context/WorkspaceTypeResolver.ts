// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 2 — Workspace Type Resolver
// Determines the workspace type from organization type, professional
// category, and membership context. Every actor has exactly one type.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { WorkspaceType, WorkspaceTypeInfo } from '../types';

const ORG_TYPE_TO_WORKSPACE_TYPE: Record<string, WorkspaceType> = {
  hospital: 'facility',
  clinic: 'clinic',
  university: 'university',
  medical_school: 'medical_school',
  research_institute: 'research_lab',
  government: 'government',
  ngo: 'ngo',
  insurance: 'insurance',
  telemedicine: 'telemedicine',
  training_center: 'training',
  simulation_center: 'simulation',
};

const CATEGORY_TO_TYPE_OVERRIDE: Record<string, WorkspaceType> = {
  medical_student: 'student',
  student: 'student',
  locum: 'locum',
  remote: 'remote',
};

export function resolveWorkspaceType(workspace: ResolvedWorkspace): WorkspaceTypeInfo {
  const category = workspace.professional?.primaryCategory || '';
  const orgType = workspace.organization?.type || '';
  const orgName = workspace.organization?.name || '';

  // Individual practice: no organization, explicit individual choice
  if (!workspace.organization && !workspace.activeMembership) {
    return {
      type: 'individual',
      label: 'Individual Practice',
      requiresFacilityHierarchy: false,
      dashboardLayout: 'clinical',
    };
  }

  // Category override (student, locum, remote)
  const categoryOverride = CATEGORY_TO_TYPE_OVERRIDE[category];
  if (categoryOverride) {
    return {
      type: categoryOverride,
      label: categoryOverride === 'student' ? 'Medical Student' :
             categoryOverride === 'locum' ? 'Locum Practitioner' : 'Remote Worker',
      requiresFacilityHierarchy: categoryOverride !== 'student',
      dashboardLayout: categoryOverride === 'student' ? 'administrative' : 'clinical',
    };
  }

  // Map org type
  const mapped = ORG_TYPE_TO_WORKSPACE_TYPE[orgType];
  if (mapped) {
    return {
      type: mapped,
      label: orgType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      requiresFacilityHierarchy: ['facility', 'clinic'].includes(mapped),
      dashboardLayout: mapped === 'university' || mapped === 'medical_school' ? 'administrative' : 'clinical',
    };
  }

  // Fallback based on professional category
  const clinical = ['medical_doctor', 'nurse', 'midwife', 'pharmacist', 'lab_technologist', 'clinical_officer'];
  if (clinical.includes(category)) {
    return {
      type: 'facility',
      label: 'Clinical Facility',
      requiresFacilityHierarchy: true,
      dashboardLayout: 'clinical',
    };
  }

  if (category === 'facility_admin' || category === 'administrator') {
    return {
      type: 'facility',
      label: 'Administrative Facility',
      requiresFacilityHierarchy: true,
      dashboardLayout: 'administrative',
    };
  }

  // Default
  return {
    type: 'facility',
    label: 'Facility',
    requiresFacilityHierarchy: true,
    dashboardLayout: 'clinical',
  };
}