// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 9 — AI Context Resolver
// Builds the AI context bundle that every AI request must include.
// AMEXAN AI needs current patient, encounter, ward, role, specialty,
// and task before answering any clinical question.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { AIContext } from '../types';

export function resolveAIContext(workspace: ResolvedWorkspace): AIContext {
  const professional = workspace.professional;
  const assignment = workspace.activeAssignment;
  const encounterIds = workspace.activeEncounterIds || [];
  const patientIds = workspace.activePatientIds || [];

  const currentPatientId = patientIds[0] || null;
  const currentEncounterId = encounterIds[0] || null;
  const currentWardId = workspace.ward?.id || workspace.facility?.id || null;
  const currentRoleId = workspace.role?.id || 'user';
  const currentSpecialty = professional?.primaryCategory || 'other';
  const currentTaskType = assignment?.type || null;

  // Build a concise context bundle for AI consumption
  const contextBundle: string[] = [];

  if (currentPatientId) contextBundle.push(`Patient: ${currentPatientId}`);
  if (currentEncounterId) contextBundle.push(`Encounter: ${currentEncounterId}`);
  if (currentWardId) contextBundle.push(`Ward/Facility: ${currentWardId}`);
  contextBundle.push(`Role: ${currentRoleId}`);
  contextBundle.push(`Specialty: ${currentSpecialty}`);
  if (currentTaskType) contextBundle.push(`Task: ${currentTaskType}`);
  if (assignment?.title) contextBundle.push(`Assignment: ${assignment.title}`);
  if (workspace.organization?.name) contextBundle.push(`Organization: ${workspace.organization.name}`);
  if (workspace.department?.name) contextBundle.push(`Department: ${workspace.department.name}`);
  if (workspace.isOnDuty) contextBundle.push('Status: On Duty');

  return {
    currentPatientId,
    currentEncounterId,
    currentWardId,
    currentRoleId,
    currentSpecialty,
    currentTaskType,
    contextBundle,
  };
}