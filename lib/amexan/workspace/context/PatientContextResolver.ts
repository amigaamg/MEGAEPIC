// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 7 — Patient Context Resolver
// Derives the patient list hierarchy from the active assignment and
// workspace context. Doctors see assigned patients, not all patients.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { PatientContext } from '../types';

export function resolvePatientContext(workspace: ResolvedWorkspace): PatientContext {
  const assignment = workspace.activeAssignment;
  const shift = workspace.activeShift;
  const encounterIds = workspace.activeEncounterIds || [];
  const patientIds = workspace.activePatientIds || [];

  // Assigned patients from active assignment
  const assignedPatients = assignment?.linkedPatientIds || patientIds || [];

  // Current patients = assigned patients with active encounters
  const currentPatients = assignedPatients.filter(id => encounterIds.includes(id));

  // Recent patients = assigned patients sorted by most recent encounter
  const recentPatients = [...assignedPatients].reverse().slice(0, 10);

  // Critical patients = those with critical risk alerts (would need patient data)
  const criticalPatients: string[] = [];

  // Discharged today (would need encounter data)
  const dischargedToday: string[] = [];

  // Expected admissions (from assignment or schedule)
  const expectedAdmissions: string[] = [];

  return {
    assignedPatients,
    currentPatients,
    recentPatients,
    criticalPatients,
    dischargedToday,
    expectedAdmissions,
  };
}