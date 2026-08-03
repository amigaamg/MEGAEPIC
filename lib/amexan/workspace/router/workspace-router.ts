// AMEXAN Workspace Router
// Constitutional Principle: Navigation never reloads. Workspaces morph.

import type { WorkspaceSession } from '../types';
import type { DeviceInfo } from '../../presentation/types';

export interface RouteDecision {
  path: string;
  workspaceId: string;
  panes: { left: boolean; center: boolean; right: boolean };
  keepState: boolean;
  morph: boolean;
}

export interface RouteInput {
  session: WorkspaceSession;
  device: DeviceInfo;
  destination?: { workspaceId?: string; patientId?: string; encounterId?: string };
}

export function routeWorkspace(input: RouteInput): RouteDecision {
  const dest = input.destination?.workspaceId ?? input.session.assignmentType;
  const mobile = input.device.viewportClass === 'xs' || input.device.viewportClass === 'sm';

  return {
    path: routeFor(dest),
    workspaceId: dest,
    panes: mobile
      ? { left: false, center: true, right: false }
      : { left: true, center: true, right: true },
    keepState: true,
    morph: true,
  };
}

function routeFor(workspaceId: string): string {
  const map: Record<string, string> = {
    ward_round: '/workspace/ward-round',
    clinic: '/workspace/clinic',
    icu_duty: '/workspace/icu',
    administration: '/workspace/admin',
    patient_portal: '/patient',
    emergency_call: '/workspace/emergency',
  };
  return map[workspaceId] ?? `/workspace/${workspaceId}`;
}

export function morphTarget(current: string, next: string): boolean {
  return current !== next;
}

export const workspaceRouter = {
  route: routeWorkspace,
  morph: morphTarget,
};

export type WorkspaceRouter = typeof workspaceRouter;
