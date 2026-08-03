// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Resolution Engine (Book XV, WS-002)
//
// The gate that decides whether an authenticated actor may reach a dashboard.
//
//   Login → Authentication → Actor Loaded → Workspace Resolution →
//   Is Workspace Complete?
//       YES → Dashboard Resolver → Correct Dashboard
//       NO  → Professional Onboarding Engine → Guided Onboarding
//
// This engine performs the completeness gate and, when the workspace is
// incomplete, performs gap analysis to determine the exact next onboarding
// step. It never fabricates a fallback workspace; incompleteness is surfaced,
// never hidden.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace, WorkspaceMissingElement } from './types';
import { computeWorkspaceCompleteness } from './completeness';
import type { RegistrationStep } from '../constitution/registration';
export type ResolutionDecisionType =
  | 'ready'            // Workspace complete → dashboard may render
  | 'choose_workspace' // Memberships exist but none active → pick a workspace
  | 'onboarding';      // Workspace incomplete → guided onboarding required

export interface ResolutionGap {
  element: WorkspaceMissingElement;
  step: RegistrationStep;
  ruleId: string;
}

export interface WorkspaceResolutionDecision {
  type: ResolutionDecisionType;
  isComplete: boolean;
  score: number;
  missing: WorkspaceMissingElement[];
  present: WorkspaceMissingElement[];
  profile: string;
  /** The single next onboarding step to present, if onboarding is required. */
  nextStep: RegistrationStep | null;
  /** Full ordered gap→step mapping for the missing elements. */
  gaps: ResolutionGap[];
  route: string | null;
}

export interface ResolutionContext {
  /** Persisted `users/{uid}.registrationStep` — distinguishes intentional individual practice from unfinished onboarding. */
  registrationStep?: string | null;
  /** Persisted `users/{uid}.workspaceChoice` — explicit 'Continue Individually' intent (WS-003). */
  workspaceChoice?: 'individual' | 'organization' | 'create' | 'join' | null;
}

// Constitutional element → onboarding step mapping (Book XV resolution order).
const ELEMENT_TO_STEP: Record<WorkspaceMissingElement, RegistrationStep> = {
  professional: 'professional',
  membership: 'organization_choice',
  organization: 'organization_choice',
  facility: 'organization_create',
  department: 'department_select',
  employment: 'assignment',
  assignment: 'assignment',
  shift: 'assignment',
  role: 'organization_choice',
  permissions: 'organization_choice',
};

// Missing element → the constitutional rule it enforces.
const ELEMENT_TO_RULE: Record<WorkspaceMissingElement, string> = {
  professional: 'WS-003',
  membership: 'WS-004',
  organization: 'WS-004',
  facility: 'WS-004',
  department: 'WS-005',
  employment: 'WS-005',
  assignment: 'WS-005',
  shift: 'WS-005',
  role: 'WS-003',
  permissions: 'WS-008',
};

// Each first-missing element maps deterministically to the step to resume.
const FIRST_MISSING_STEP: Record<WorkspaceMissingElement, RegistrationStep> = {
  professional: 'professional',
  membership: 'organization_choice',
  organization: 'organization_choice',
  facility: 'organization_create',
  department: 'department_select',
  employment: 'assignment',
  assignment: 'assignment',
  shift: 'assignment',
  role: 'organization_choice',
  permissions: 'organization_choice',
};

export class WorkspaceResolutionEngine {
  resolve(workspace: ResolvedWorkspace | null | undefined, context?: ResolutionContext): WorkspaceResolutionDecision {
    if (!workspace) {
      return {
        type: 'onboarding',
        isComplete: false,
        score: 0,
        missing: ['professional', 'membership', 'organization', 'employment', 'assignment'],
        present: [],
        profile: 'unknown',
        nextStep: 'professional',
        gaps: [
          { element: 'professional', step: 'professional', ruleId: 'WS-003' },
          { element: 'membership', step: 'organization_choice', ruleId: 'WS-004' },
          { element: 'organization', step: 'organization_choice', ruleId: 'WS-004' },
        ],
        route: '/register/constitution',
      };
    }

    const completeness = computeWorkspaceCompleteness(workspace, context);

    // Book XV, Rule 2: memberships were detected but the actor has no active
    // workspace selected. Never render a dashboard — present "Choose Workspace".
    if (
      Array.isArray(workspace.memberships) &&
      workspace.memberships.length > 0 &&
      !workspace.activeMembership
    ) {
      return {
        type: 'choose_workspace',
        isComplete: false,
        score: completeness.score,
        missing: completeness.missing,
        present: completeness.present,
        profile: completeness.profile ?? 'incomplete',
        nextStep: 'workspace_choice',
        gaps: [{ element: 'membership', step: 'workspace_choice', ruleId: 'WS-004' }],
        route: '/register/constitution',
      };
    }

    if (completeness.isComplete) {
      return {
        type: 'ready',
        isComplete: true,
        score: completeness.score,
        missing: [],
        present: completeness.present,
        profile: completeness.profile ?? 'complete',
        nextStep: null,
        gaps: [],
        route: null,
      };
    }

    // Gap analysis: order missing elements by constitutional resolution order.
    const orderRank = (el: WorkspaceMissingElement): number =>
      completeness.requiredOrder.indexOf(el) === -1 ? 99 : completeness.requiredOrder.indexOf(el);

    const orderedMissing = [...completeness.missing].sort((a, b) => orderRank(a) - orderRank(b));

    const gaps: ResolutionGap[] = orderedMissing.map(element => ({
      element,
      step: ELEMENT_TO_STEP[element],
      ruleId: ELEMENT_TO_RULE[element],
    }));

    const first = orderedMissing[0];
    const nextStep: RegistrationStep | null = first ? FIRST_MISSING_STEP[first] : 'professional';

    return {
      type: 'onboarding',
      isComplete: false,
      score: completeness.score,
      missing: orderedMissing,
      present: completeness.present,
      profile: completeness.profile ?? 'incomplete',
      nextStep,
      gaps,
      route: '/register/constitution',
    };
  }
}

export const workspaceResolutionEngine = new WorkspaceResolutionEngine();

export function resolveWorkspaceGate(workspace: ResolvedWorkspace | null | undefined, context?: ResolutionContext): WorkspaceResolutionDecision {
  return workspaceResolutionEngine.resolve(workspace, context);
}
