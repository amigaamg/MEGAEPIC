// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Extended Context Resolvers — Index
// Combines all 13 resolver layers into a single ExtendedWorkspaceContext.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { ExtendedWorkspaceContext } from '../types';
import { resolveRegistrationCompleteness } from './RegistrationResolver';
import { resolveWorkspaceType } from './WorkspaceTypeResolver';
import { resolveModules } from './ModuleResolver';
import { resolveSubscription } from './SubscriptionResolver';
import { resolveTasks } from './TaskResolver';
import { resolveNotifications } from './NotificationResolver';
import { resolvePatientContext } from './PatientContextResolver';
import { resolveClinicalContext } from './ClinicalContextResolver';
import { resolveAIContext } from './AIResolver';
import { resolveEmergency } from './EmergencyResolver';
import { resolveEducationContext } from './EducationResolver';
import { resolveResearchContext } from './ResearchResolver';

export function resolveExtendedContext(
  workspace: ResolvedWorkspace,
  userData?: Record<string, unknown>,
  emergencyOverride?: import('../types').EmergencyState | null,
): ExtendedWorkspaceContext {
  return {
    registration: resolveRegistrationCompleteness(workspace, userData),
    workspaceType: resolveWorkspaceType(workspace),
    modules: resolveModules(workspace),
    subscription: resolveSubscription(workspace),
    notifications: resolveNotifications(workspace),
    tasks: resolveTasks(workspace),
    patientContext: resolvePatientContext(workspace),
    clinicalContext: resolveClinicalContext(workspace),
    aiContext: resolveAIContext(workspace),
    emergency: resolveEmergency(workspace, emergencyOverride),
    education: resolveEducationContext(workspace),
    research: resolveResearchContext(workspace),
  };
}