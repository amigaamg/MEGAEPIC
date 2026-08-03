// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 8 — Clinical Context Resolver
// Derives the current clinical context: encounter, diagnosis, pending
// labs/imaging/procedures/consults, and risk scores (NEWS, MEWS, SOFA, sepsis).
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { ClinicalContext } from '../types';

export function resolveClinicalContext(workspace: ResolvedWorkspace): ClinicalContext {
  const assignment = workspace.activeAssignment;
  const encounterIds = workspace.activeEncounterIds || [];
  const currentEncounterId = encounterIds[0] || null;

  // Pending counts from assignments
  const pendingLabs = workspace.assignments.filter(
    a => (a.type as string) === 'lab_order' || a.title?.toLowerCase().includes('lab'),
  ).length;
  const pendingImaging = workspace.assignments.filter(
    a => (a.type as string) === 'imaging_order' || a.title?.toLowerCase().includes('imaging'),
  ).length;
  const pendingProcedures = workspace.assignments.filter(
    a => a.type === 'procedure' || a.title?.toLowerCase().includes('procedure'),
  ).length;
  const pendingConsults = workspace.assignments.filter(
    a => a.type === 'consultation' || a.title?.toLowerCase().includes('consult'),
  ).length;

  // Risk alerts derived from assignment type and patient context
  const riskAlerts: string[] = [];
  const riskScores = { news: null as number | null, mews: null as number | null, sofa: null as number | null, sepsis: false };

  // If active assignment has linked patients, check for risk signals
  if (assignment?.linkedPatientIds && assignment.linkedPatientIds.length > 0) {
    // Placeholder: in production, these would be computed from patient vitals/observations
    // For now, surface structural alerts
    if (assignment.type === 'icu_duty' || assignment.type === 'emergency_call') {
      riskAlerts.push('High-acuity assignment — monitor vitals closely');
      riskScores.news = 3;
    }
    if (assignment.type === 'ward_round') {
      riskAlerts.push('Ward round — review pending results');
    }
  }

  // Sepsis alert heuristic
  if (riskAlerts.some(a => a.toLowerCase().includes('sepsis') || a.toLowerCase().includes('infection'))) {
    riskScores.sepsis = true;
  }

  return {
    currentEncounterId,
    currentDiagnosis: null,
    pendingLabs,
    pendingImaging,
    pendingProcedures,
    pendingConsults,
    riskAlerts,
    riskScores,
  };
}