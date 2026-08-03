/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * UAB — Universal Workspace Model
 *
 * People don't use modules. People work. AMEXAN is built around workspaces,
 * never isolated modules.
 *
 * Every workspace — without exception — answers four questions:
 *   What do I need?
 *   What am I doing?
 *   What requires attention?
 *   What happens next?
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/** The four questions every workspace must answer. */
export const WORKSPACE_QUESTIONS = [
  'what_do_i_need',
  'what_am_i_doing',
  'what_requires_attention',
  'what_happens_next',
] as const;

export type WorkspaceQuestion = (typeof WORKSPACE_QUESTIONS)[number];

export interface WorkspaceQuestionContract {
  /** A single sentence stating how the workspace answers this question. */
  answer: string;
  /** Widget ids that deliver the answer. */
  widgets: string[];
}

/**
 * The universal workspace types. Every human role in healthcare maps to one
 * of these. Never "modules" — always work.
 */
export const UNIVERSAL_WORKSPACE_TYPES = [
  'patient',
  'clinician',
  'nursing',
  'emergency',
  'theatre',
  'icu',
  'laboratory',
  'radiology',
  'pharmacy',
  'finance',
  'administration',
  'executive',
  'ministry',
] as const;

export type UniversalWorkspaceType = (typeof UNIVERSAL_WORKSPACE_TYPES)[number];

export interface UniversalWorkspaceDefinition {
  type: UniversalWorkspaceType;
  label: string;
  description: string;
  /** Default answer to "What do I need?" */
  needs: string;
  /** Default answer to "What am I doing?" */
  doing: string;
  /** Default answer to "What requires attention?" */
  attention: string;
  /** Default answer to "What happens next?" */
  next: string;
}

export const universalWorkspaceDefinitions: Record<UniversalWorkspaceType, UniversalWorkspaceDefinition> = {
  patient: {
    type: 'patient',
    label: 'Patient Workspace',
    description: 'Everything about one patient.',
    needs: 'One lifelong record — history, problems, medications, plans.',
    doing: 'Understand this patient, review status, decide next care.',
    attention: 'Alerts, critical results, outstanding tasks for this patient.',
    next: 'Next review, next order, next follow-up for this patient.',
  },
  clinician: {
    type: 'clinician',
    label: 'Clinician Workspace',
    description: 'Everything one clinician needs today.',
    needs: 'Today\'s patients, today\'s work, today\'s decisions.',
    doing: 'Complete rounds, review results, document, decide.',
    attention: 'Critical patients, unreviewed labs, escalations, referrals.',
    next: 'Next patient, next task, next decision.',
  },
  nursing: {
    type: 'nursing',
    label: 'Nursing Workspace',
    description: 'Medication, vitals, tasks, escalations, assignments.',
    needs: 'Medication rounds, vitals due, assigned patients.',
    doing: 'Administer, monitor, document, escalate.',
    attention: 'Escalations, deteriorating patients, overdue tasks.',
    next: 'Next round, next observation, next assignment.',
  },
  emergency: {
    type: 'emergency',
    label: 'Emergency Workspace',
    description: 'Triage, resuscitation, tracking, critical alerts.',
    needs: 'Waiting patients, triage acuity, resuscitation status.',
    doing: 'Triage, resuscitate, stabilize, admit or discharge.',
    attention: 'Life threats, critical alerts, wait-time breaches.',
    next: 'Next triage, next resuscitation, next disposition.',
  },
  theatre: {
    type: 'theatre',
    label: 'Theatre Workspace',
    description: 'WHO checklist, cases, implants, recovery.',
    needs: 'Today\'s list, WHO checklist, case status.',
    doing: 'Book, prep, operate, recover.',
    attention: 'Overdue cases, missing checklist items, recovery alerts.',
    next: 'Next case, next checklist, next recovery.',
  },
  icu: {
    type: 'icu',
    label: 'ICU Workspace',
    description: 'Ventilation, monitoring, rounds, scores.',
    needs: 'Vent settings, monitors, scores, rounds list.',
    doing: 'Monitor, round, adjust, document.',
    attention: 'Vent alarms, deteriorating scores, critical labs.',
    next: 'Next round, next intervention, next review.',
  },
  laboratory: {
    type: 'laboratory',
    label: 'Laboratory Workspace',
    description: 'Specimens, queues, analyzers, validation.',
    needs: 'Specimen queue, analyzer status, pending validation.',
    doing: 'Receive, run, validate, release.',
    attention: 'Critical values, overdue specimens, analyzer faults.',
    next: 'Next specimen, next validation, next release.',
  },
  radiology: {
    type: 'radiology',
    label: 'Radiology Workspace',
    description: 'Studies, scheduling, reporting, viewer.',
    needs: 'Study queue, schedule, open reports.',
    doing: 'Acquire, read, report.',
    attention: 'Stat studies, unreported exams, critical findings.',
    next: 'Next study, next report, next scheduling change.',
  },
  pharmacy: {
    type: 'pharmacy',
    label: 'Pharmacy Workspace',
    description: 'Dispensing, inventory, interactions.',
    needs: 'Prescription queue, interaction alerts, stock levels.',
    doing: 'Verify, dispense, monitor inventory.',
    attention: 'Interactions, stock-outs, overdue verification.',
    next: 'Next verification, next dispensing, next reorder.',
  },
  finance: {
    type: 'finance',
    label: 'Finance Workspace',
    description: 'Claims, revenue, invoices, payments.',
    needs: 'Claims queue, revenue position, pending invoices.',
    doing: 'Process claims, reconcile, approve.',
    attention: 'Rejected claims, overdue invoices, revenue gaps.',
    next: 'Next claim, next reconciliation, next approval.',
  },
  administration: {
    type: 'administration',
    label: 'Administration Workspace',
    description: 'Staff, departments, buildings, equipment.',
    needs: 'Staffing, department status, asset status.',
    doing: 'Manage staff, maintain assets, run departments.',
    attention: 'Equipment failures, staffing gaps, compliance items.',
    next: 'Next approval, next maintenance, next report.',
  },
  executive: {
    type: 'executive',
    label: 'Executive Workspace',
    description: 'KPIs, digital twin, analytics, forecasts.',
    needs: 'Today\'s KPIs, occupancy, revenue, incidents.',
    doing: 'Monitor performance, decide, direct.',
    attention: 'Critical incidents, KPI breaches, forecast risks.',
    next: 'Next review, next decision, next directive.',
  },
  ministry: {
    type: 'ministry',
    label: 'Ministry Workspace',
    description: 'National intelligence, surveillance, facilities, outbreaks.',
    needs: 'National dashboards, facility status, outbreak signals.',
    doing: 'Monitor population health, coordinate response.',
    attention: 'Outbreaks, surveillance signals, facility failures.',
    next: 'Next analysis, next response, next report.',
  },
};

/**
 * Validate that a workspace type is constitutional.
 */
export const isUniversalWorkspaceType = (value: string): value is UniversalWorkspaceType => {
  return (UNIVERSAL_WORKSPACE_TYPES as readonly string[]).includes(value);
};
