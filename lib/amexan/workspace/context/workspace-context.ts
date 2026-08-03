// AMEXAN Workspace Context
// Constitutional Principle: Everything has context. Nothing floats.

import type { WorkspaceSession } from '../types';
import type { DeviceInfo } from '../../presentation/types';

export interface WorkspaceContext {
  session: WorkspaceSession;
  device: DeviceInfo;
  activePane: 'left' | 'center' | 'right' | 'drawer';
  breadcrumbs: { label: string; route?: string }[];
  entity: { type: 'patient' | 'encounter' | 'department' | 'task' | null; id: string | null };
}

export function createWorkspaceContext(session: WorkspaceSession, device: DeviceInfo): WorkspaceContext {
  return {
    session,
    device,
    activePane: 'center',
    breadcrumbs: [
      { label: 'Home', route: '/' },
      { label: session.organizationName },
      { label: session.assignmentTitle },
    ],
    entity: entityFor(session),
  };
}

function entityFor(session: WorkspaceSession): WorkspaceContext['entity'] {
  if (session.activeEncounterId) return { type: 'encounter', id: session.activeEncounterId };
  if (session.activePatientId) return { type: 'patient', id: session.activePatientId };
  if (session.activeWorkflowId) return { type: 'task', id: session.activeWorkflowId };
  return { type: 'department', id: session.departmentId };
}

export function contextLabel(context: WorkspaceContext): string {
  const entity = context.entity;
  if (entity.type === 'patient') return `Patient ${entity.id}`;
  if (entity.type === 'encounter') return `Encounter ${entity.id}`;
  if (entity.type === 'department') return context.session.departmentName;
  return context.session.assignmentTitle;
}

export const workspaceContext = {
  create: createWorkspaceContext,
  label: contextLabel,
};

export type WorkspaceContextEngine = typeof workspaceContext;
