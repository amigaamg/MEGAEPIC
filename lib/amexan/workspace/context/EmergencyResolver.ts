// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 10 — Emergency Context Resolver
// Determines the current emergency state of the workspace.
// Emergency states change dashboard layout, permissions, and routing.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { EmergencyState, EmergencyStateType } from '../types';

const EMERGENCY_TITLES: Record<EmergencyStateType, string> = {
  none: 'No Emergency',
  code_blue: 'Code Blue — Cardiac Arrest',
  mass_casualty: 'Mass Casualty Incident',
  fire: 'Fire Emergency',
  disaster: 'Disaster Response',
  pandemic: 'Pandemic Protocol',
  lockdown: 'Facility Lockdown',
};

export function resolveEmergency(workspace: ResolvedWorkspace, emergencyOverride?: EmergencyState | null): EmergencyState {
  // Admin override takes precedence
  if (emergencyOverride) {
    return emergencyOverride;
  }

  // Check organization config for emergency state
  const org = workspace.organization;
  const orgConfig = org?.config;

  // Check if org has an emergency flag in its config
  const emergencyType = (orgConfig as unknown as Record<string, unknown>)?.emergencyState as EmergencyStateType | undefined;
  if (emergencyType && emergencyType !== 'none') {
    return {
      active: true,
      type: emergencyType,
      title: EMERGENCY_TITLES[emergencyType] || emergencyType,
      activatedAt: (orgConfig as unknown as Record<string, unknown>)?.emergencyActivatedAt as number | undefined || null,
      activatedBy: (orgConfig as unknown as Record<string, unknown>)?.emergencyActivatedBy as string | undefined || null,
      description: (orgConfig as unknown as Record<string, unknown>)?.emergencyDescription as string | undefined,
    };
  }

  // Check workspace-level emergency from assignments (e.g. emergency_call type)
  const hasEmergencyAssignment = workspace.assignments.some(a => a.type === 'emergency_call' && a.status === 'active');
  if (hasEmergencyAssignment) {
    return {
      active: true,
      type: 'code_blue',
      title: EMERGENCY_TITLES.code_blue,
      activatedAt: Date.now(),
      activatedBy: workspace.identity.uid,
    };
  }

  // No emergency
  return {
    active: false,
    type: 'none',
    title: EMERGENCY_TITLES.none,
    activatedAt: null,
    activatedBy: null,
  };
}