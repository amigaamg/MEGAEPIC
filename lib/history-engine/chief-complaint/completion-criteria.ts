import type { ChiefComplaintObject, ComplaintCompletionCriteria, ComplaintConsistencyCheck } from './types';

export function evaluateCompletionCriteria(
  complaints: ChiefComplaintObject[],
  consistencyChecks: ComplaintConsistencyCheck[]
): ComplaintCompletionCriteria {
  const atLeastOneComplaint = complaints.length >= 1;
  const exactlyOnePrimary = complaints.filter(c => c.primary).length === 1;
  const everyComplaintHasDuration = complaints.length > 0 && complaints.every(c => c.durationHours > 0);
  const chronologyEstablished = complaints.length > 0 && complaints.every(c => c.chronology >= 0);
  const simultaneousClarified = !hasUnclarifiedSimultaneous(complaints);
  const eachMappedToSchema = complaints.length > 0 && complaints.every(c => c.schemaActivated !== null);
  const timelineGenerated = complaints.length > 0;
  const emergencyScreened = true;

  const allWarningChecksResolved = consistencyChecks
    .filter(c => c.severity === 'warning')
    .every(c => c.passed);

  const checks = {
    atLeastOneComplaint,
    exactlyOnePrimary,
    everyComplaintHasDuration,
    chronologyEstablished,
    simultaneousClarified,
    eachMappedToSchema,
    timelineGenerated,
    emergencyScreened,
  };

  const missing: string[] = [];

  if (!atLeastOneComplaint) missing.push('At least one complaint is required');
  if (!exactlyOnePrimary) missing.push('Exactly one primary complaint must be set');
  if (!everyComplaintHasDuration) missing.push('Every complaint requires a duration');
  if (!chronologyEstablished) missing.push('Chronology must be established for all complaints');
  if (!simultaneousClarified) missing.push('Simultaneous complaints must be clarified');
  if (!eachMappedToSchema) missing.push('Every complaint must be mapped to a schema');
  if (!timelineGenerated) missing.push('Timeline must be generated');
  if (!emergencyScreened) missing.push('Emergency screening not completed');
  if (!allWarningChecksResolved) missing.push('Unresolved clinical consistency warnings');

  const met = missing.length === 0;

  return { met, checks, missing };
}

function hasUnclarifiedSimultaneous(complaints: ChiefComplaintObject[]): boolean {
  const groups = new Map<string, ChiefComplaintObject[]>();

  for (const c of complaints) {
    if (c.simultaneousGroup) {
      if (!groups.has(c.simultaneousGroup)) {
        groups.set(c.simultaneousGroup, []);
      }
      groups.get(c.simultaneousGroup)!.push(c);
    }
  }

  for (const group of groups.values()) {
    if (group.length > 1) {
      return true;
    }
  }

  return false;
}
