// AMEXAN Workspace Lifecycle
// Constitutional Principle: Nothing is lost. Workspaces resume.

import type { WorkspaceSession } from '../types';

export type WorkspaceStage = 'created' | 'active' | 'paused' | 'suspended' | 'archived';

export interface LifecycleRecord {
  workspaceId: string;
  stage: WorkspaceStage;
  createdAt: number;
  lastActiveAt: number;
  keptAlive: boolean;
}

export function initializeWorkspace(session: WorkspaceSession): LifecycleRecord {
  return {
    workspaceId: session.assignmentType,
    stage: 'created',
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    keptAlive: true,
  };
}

export function activateWorkspace(record: LifecycleRecord): LifecycleRecord {
  return { ...record, stage: 'active', lastActiveAt: Date.now(), keptAlive: true };
}

export function pauseWorkspace(record: LifecycleRecord): LifecycleRecord {
  return { ...record, stage: 'paused', lastActiveAt: Date.now() };
}

export function suspendWorkspace(record: LifecycleRecord): LifecycleRecord {
  return { ...record, stage: 'suspended', lastActiveAt: Date.now(), keptAlive: false };
}

export function workspaceIsAlive(record: LifecycleRecord): boolean {
  return record.keptAlive && record.stage !== 'suspended' && record.stage !== 'archived';
}

export const workspaceLifecycle = {
  init: initializeWorkspace,
  activate: activateWorkspace,
  pause: pauseWorkspace,
  suspend: suspendWorkspace,
  alive: workspaceIsAlive,
};

export type WorkspaceLifecycle = typeof workspaceLifecycle;
