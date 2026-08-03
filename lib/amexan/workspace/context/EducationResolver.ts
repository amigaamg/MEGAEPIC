// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 12 — Education Context Resolver
// Determines the training/education context for medical students and
// trainees. Provides supervisor, rotation, logbook, EPA, and assessment data.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { EducationContext } from '../types';

export function resolveEducationContext(workspace: ResolvedWorkspace): EducationContext {
  const category = workspace.professional?.primaryCategory || '';
  const isTrainee = category === 'medical_student' || (category as string) === 'student' || (category as string) === 'trainee';

  if (!isTrainee) {
    return {
      isTrainee: false,
      supervisorId: null,
      currentRotation: null,
      logbookEntries: 0,
      completedEPAs: [],
      skillsLog: [],
      pendingAssessments: 0,
    };
  }

  // Try to read education data from user doc or membership metadata
  const userData = {} as Record<string, unknown>;
  const meta = workspace.activeMembership?.metadata || {};

  const supervisorId = (meta.supervisorId as string) || null;
  const currentRotation = (meta.rotation as string) || null;
  const logbookEntries = (meta.logbookEntries as number) || 0;
  const completedEPAs = (meta.completedEPAs as string[]) || [];
  const skillsLog = (meta.skillsLog as string[]) || [];
  const pendingAssessments = (meta.pendingAssessments as number) || 0;

  return {
    isTrainee: true,
    supervisorId,
    currentRotation,
    logbookEntries,
    completedEPAs,
    skillsLog,
    pendingAssessments,
  };
}