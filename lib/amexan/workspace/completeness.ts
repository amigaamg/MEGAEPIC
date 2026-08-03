// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace — Completeness Evaluator (Book XV, CR-WS-001)
// Determines whether a resolved workspace is constitutionally complete and
// which required elements are missing. The dashboard gate reads this result;
// the dashboard itself never decides identity or role.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  WorkspaceCompleteness,
  WorkspaceMissingElement,
  ResolvedWorkspace,
} from './types';

// Constitutional resolution order (WS-003 .. WS-008)
const REQUIRED_ORDER: WorkspaceMissingElement[] = [
  'professional',
  'membership',
  'organization',
  'facility',
  'department',
  'employment',
  'assignment',
  'shift',
  'role',
  'permissions',
];

// Elements always required regardless of actor type. WS-003: a professional
// identity (profession) must exist before any role is assigned.
const ALWAYS_REQUIRED: WorkspaceMissingElement[] = ['professional', 'role', 'permissions'];

// Elements that are optional for non-clinical / individual-practice actors.
const CLINICAL_REQUIRED: WorkspaceMissingElement[] = [
  'membership',
  'organization',
  'facility',
  'department',
  'employment',
  'assignment',
];

const OPTIONAL_BY_DEFAULT: WorkspaceMissingElement[] = ['shift'];

export type ActorCompletenessProfile = 'patient' | 'professional' | 'administrator' | 'individual';

export interface CompletenessContext {
  /**
   * The persisted `users/{uid}.registrationStep`. When the actor completed the
   * onboarding flow this equals 'complete'; otherwise it signals which step they
   * are resuming. This is the authoritative intent signal that distinguishes a
   * deliberate "Continue Individually" choice from an unfinished onboarding.
   */
  registrationStep?: string | null;
  /**
   * The persisted `users/{uid}.workspaceChoice`. WS-003 (Book XV): individual
   * practice is a first-class constitutional choice and must be EXPLICITLY
   * recorded. A registrationStep of 'complete' alone is never proof of intent —
   * quick-registered and legacy accounts were marked complete without any
   * workspace being resolved. This is the rule that prevents the
   * "Individual Practice → Off Duty → No Active Assignments" dead-end.
   */
  workspaceChoice?: 'individual' | 'organization' | 'create' | 'join' | null;
}

export function resolveCompletenessProfile(
  workspace: Pick<ResolvedWorkspace, 'professional' | 'activeMembership' | 'organization' | 'activeEmployment' | 'activeAssignment'>,
  context?: CompletenessContext,
): ActorCompletenessProfile {
  const category = workspace.professional?.primaryCategory || '';
  const hasOrg = !!(workspace.activeMembership || workspace.organization);
  const hasEmployment = !!workspace.activeEmployment;
  const hasAssignment = !!workspace.activeAssignment;
  // WS-003: "Continue Individually" is an explicit constitutional choice. A
  // registrationStep of 'complete' alone is NOT intent — quick-registered and
  // legacy accounts were marked complete with no workspace ever resolved.
  const explicitIndividual = context?.workspaceChoice === 'individual';

  // An administrator operates organization-wide, no facility/department/assignment.
  if (category === 'facility_admin' || category === 'administrator') {
    return 'administrator';
  }

  // A clinical professional embedded in an organization requires the full
  // facility chain.
  const clinical = [
    'medical_doctor', 'clinical_officer', 'nurse', 'midwife', 'pharmacist',
    'pharmaceutical_technologist', 'lab_technologist', 'radiographer',
    'physiotherapist', 'nutritionist', 'psychologist', 'dental_surgeon',
    'medical_imaging_technologist', 'anesthesiologist', 'surgeon',
  ];
  if (clinical.includes(category) && (hasOrg || hasEmployment || hasAssignment)) {
    return 'professional';
  }

  // A clinical professional with no organization is "individual practice" ONLY
  // when they explicitly chose "Continue Individually" during onboarding.
  // Otherwise the workspace is incomplete and must resume onboarding (WS-002).
  if (clinical.includes(category) && !hasOrg && !hasEmployment && !hasAssignment) {
    return explicitIndividual ? 'individual' : 'professional';
  }

  // Any other actor (e.g. receptionist) who explicitly chose to work
  // individually is complete without the facility chain.
  if (explicitIndividual && !hasOrg && !hasEmployment && !hasAssignment) {
    return 'individual';
  }

  return 'patient';
}

export function computeWorkspaceCompleteness(
  workspace: Pick<ResolvedWorkspace, 'professional' | 'activeMembership' | 'organization' | 'facility' | 'department' | 'activeEmployment' | 'activeAssignment' | 'activeShift'>,
  context?: CompletenessContext,
): WorkspaceCompleteness {
  const profile = resolveCompletenessProfile(workspace, context);

  const required: WorkspaceMissingElement[] = [...ALWAYS_REQUIRED];
  let optional: WorkspaceMissingElement[] = [...OPTIONAL_BY_DEFAULT];

  if (profile === 'professional') {
    required.push('professional');
    required.push(...CLINICAL_REQUIRED);
  } else if (profile === 'administrator') {
    required.push('professional');
    required.push('membership');
    required.push('organization');
    optional.push('facility', 'department', 'employment', 'assignment');
  } else if (profile === 'patient') {
    required.push('membership');
    required.push('organization');
    optional.push('facility', 'department', 'employment', 'assignment');
  } else {
    // individual — identity layer only; every organization element is optional.
    optional.push(...CLINICAL_REQUIRED);
  }

  // De-duplicate while preserving order.
  const seen = new Set<string>();
  const ordered: WorkspaceMissingElement[] = [];
  for (const el of REQUIRED_ORDER) {
    if (required.includes(el) || optional.includes(el)) {
      if (!seen.has(el)) { seen.add(el); ordered.push(el); }
    }
  }

  const present: WorkspaceMissingElement[] = [];
  const missing: WorkspaceMissingElement[] = [];

  const has = (el: WorkspaceMissingElement): boolean => {
    switch (el) {
      case 'professional': return !!workspace.professional;
      case 'membership': return !!workspace.activeMembership;
      case 'organization': return !!(workspace.organization || workspace.activeMembership);
      case 'facility': return !!workspace.facility;
      case 'department': return !!workspace.department;
      case 'employment': return !!workspace.activeEmployment;
      case 'assignment': return !!workspace.activeAssignment;
      case 'shift': return !!workspace.activeShift;
      case 'role': return true; // role always resolves to at least 'user'
      case 'permissions': return true; // permissions always resolve to defaults
      default: return false;
    }
  };

  for (const el of ordered) {
    if (has(el)) present.push(el);
    else if (required.includes(el)) missing.push(el);
  }

  const isComplete = missing.length === 0;
  const score = ordered.length === 0 ? 1 : present.length / ordered.length;

  return {
    isComplete,
    score,
    missing,
    present,
    optional,
    requiredOrder: ordered,
    profile,
    evaluatedAt: Date.now(),
  };
}

export function isWorkspaceComplete(
  workspace: Pick<ResolvedWorkspace, 'professional' | 'activeMembership' | 'organization' | 'facility' | 'department' | 'activeEmployment' | 'activeAssignment' | 'activeShift'>,
  context?: CompletenessContext,
): boolean {
  return computeWorkspaceCompleteness(workspace, context).isComplete;
}

export const workspaceCompletenessEngine = {
  compute: computeWorkspaceCompleteness,
  isComplete: isWorkspaceComplete,
  profile: resolveCompletenessProfile,
};
