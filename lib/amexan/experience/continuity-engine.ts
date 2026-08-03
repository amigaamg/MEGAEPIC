// AMEXAN Experience Engine - Continuity Engine
// Constitutional Principle: Nothing is lost. The experience resumes exactly where it left off.

export interface ContinuitySnapshot {
  workspaceId: string;
  taskId: string | null;
  journeyId: string | null;
  focusMode: string;
  openDocuments: string[];
  scrollPosition: Record<string, number>;
  savedAt: number;
}

export interface ContinuityState {
  snapshot: ContinuitySnapshot | null;
  resumed: boolean;
  restoredWorkspace: string | null;
}

export function captureSnapshot(input: {
  workspaceId: string;
  taskId?: string | null;
  journeyId?: string | null;
  focusMode: string;
  openDocuments?: string[];
  scrollPosition?: Record<string, number>;
}): ContinuitySnapshot {
  return {
    workspaceId: input.workspaceId,
    taskId: input.taskId ?? null,
    journeyId: input.journeyId ?? null,
    focusMode: input.focusMode,
    openDocuments: input.openDocuments ?? [],
    scrollPosition: input.scrollPosition ?? {},
    savedAt: Date.now(),
  };
}

export function resumeFromSnapshot(snapshot: ContinuitySnapshot): ContinuityState {
  return {
    snapshot,
    resumed: true,
    restoredWorkspace: snapshot.workspaceId,
  };
}

export function isSnapshotFresh(snapshot: ContinuitySnapshot, maxAgeMs: number): boolean {
  return Date.now() - snapshot.savedAt <= maxAgeMs;
}

export function continuityGuarantee(snapshot: ContinuitySnapshot | null): { preserved: boolean; reason: string } {
  if (!snapshot) return { preserved: false, reason: 'No snapshot exists yet.' };
  return { preserved: true, reason: 'Workspace state is captured and resumable.' };
}

export const continuityEngine = {
  capture: captureSnapshot,
  resume: resumeFromSnapshot,
  fresh: isSnapshotFresh,
  guarantee: continuityGuarantee,
};

export type ContinuityEngine = typeof continuityEngine;
