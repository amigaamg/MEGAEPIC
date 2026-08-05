// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN WIDGET ENGINE (BOOK VIII · Volume VIII-A)
//
// Every dashboard is built from widgets — never from pages. The Widget Engine is
// the constitutional assembler: it takes a family, an actor's capabilities, their
// preferences and the current context, and composes the widgets of the workspace
// and the five dashboard layers.
//
// Constitutional rules enforced here:
//   • Capabilities override generic role behavior (widgets are filtered by permission)
//   • Preferences personalize presentation, never business logic
//   • Widgets are composable, reusable, independently versioned
//   • Every dashboard degrades gracefully if one widget fails
//   • This engine never contains clinical reasoning — it only presents engine output
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  CapabilityProfile, CurrentAssignment, DashboardFamilyId, DashboardLayer,
  DashboardLayerId, PreferenceSet, PresentationWidget, ResolutionContext,
} from './types';
import { buildWidget, DASHBOARD_LAYERS } from './constitution';

// ── Widget catalogue record ────────────────────────────────────────────────────
// One record per family. Each widget is owned independently (Google-style ownership):
// one engineer, one widget, no merge conflicts.

export interface WidgetSpec {
  type: string;
  title: string;
  size: PresentationWidget['size'];
  priority: number;
  refreshIntervalSeconds: number;
  layer: DashboardLayerId;
  permission?: string;
  dataKey?: string;
}

// Compact constructor: [type, title, size, priority, refresh, layer, permission?, dataKey?]
type SpecTuple = [
  type: string, title: string, size: PresentationWidget['size'],
  priority: number, refresh: number, layer: DashboardLayerId,
  permission?: string, dataKey?: string,
];

function s([type, title, size, priority, refresh, layer, permission, dataKey]: SpecTuple): WidgetSpec {
  return { type, title, size, priority, refreshIntervalSeconds: refresh, layer, permission, dataKey };
}

const none = undefined;

export const FAMILY_WIDGETS: Readonly<Record<DashboardFamilyId, readonly WidgetSpec[]>> = {
  // ── 1. Executive — the hospital operating system ─────────────────────────────
  executive: [
    s(['kpi_card', 'Bed Occupancy', 'xl', 100, 30, 'overview', none, 'occupancy']),
    s(['ward_map', 'Facility Occupancy Map', 'lg', 72, 120, 'overview', none, 'facility']),
    s(['ai_card', 'Emergency Status', 'md', 90, 30, 'overview', none, 'emergency']),
    s(['kpi_card', 'Staff On Duty', 'md', 88, 120, 'overview', none, 'staff']),
    s(['financial_card', 'Revenue', 'lg', 95, 60, 'analytics', none, 'revenue']),
    s(['notifications', 'Alerts', 'lg', 85, 30, 'operations', none, 'alerts']),
    s(['kpi_card', 'Theatre Today', 'md', 80, 120, 'operations', none, 'theatre']),
    s(['inventory_card', 'Pharmacy Stock', 'md', 78, 300, 'operations', none, 'pharmacy']),
    s(['patient_list', 'Laboratory Critical Values', 'md', 75, 60, 'operations', none, 'laboratory']),
    s(['task_list', 'Pending Approvals', 'md', 65, 60, 'operations', 'administrate', 'approvals']),
    s(['chart', 'Admissions Trend', 'md', 70, 300, 'analytics', none, 'admissions']),
    s(['chart', 'Mortality Trend', 'md', 68, 300, 'analytics', none, 'mortality']),
    s(['messages', 'Announcements', 'md', 60, 300, 'communication', none, 'announcements']),
    s(['research_card', 'Active Research', 'md', 55, 600, 'learning', none, 'research']),
    s(['report_list', 'Reports', 'md', 50, 600, 'analytics', none, 'reports']),
  ],

  // ── 2. Clinical Leadership ───────────────────────────────────────────────────
  clinical_leadership: [
    s(['kpi_card', 'Hospital Clinical KPIs', 'xl', 100, 60, 'overview', none, 'kpis']),
    s(['patient_list', 'Critical Patients', 'lg', 95, 30, 'operations', none, 'critical']),
    s(['notifications', 'Pending Incidents', 'md', 85, 60, 'operations', none, 'incidents']),
    s(['task_list', 'Quality Reviews', 'md', 80, 120, 'operations', none, 'reviews']),
    s(['protocol_card', 'Protocol Adherence', 'md', 78, 300, 'operations', none, 'protocols']),
    s(['chart', 'Mortality Trend', 'lg', 90, 300, 'analytics', none, 'mortality']),
    s(['chart', 'Complication Rates', 'md', 70, 300, 'analytics', none, 'complications']),
    s(['ai_card', 'Clinical Intelligence', 'lg', 88, 60, 'analytics', none, 'intelligence']),
    s(['education_card', 'CME Schedule', 'md', 60, 600, 'learning', none, 'cme']),
    s(['research_card', 'Active Research', 'md', 55, 600, 'learning', none, 'research']),
    s(['messages', 'Leadership Communications', 'md', 50, 300, 'communication', none, 'messages']),
  ],

  // ── 3. Department Head Operating System (DHOS) ───────────────────────────────
  department: [
    s(['kpi_card', 'Department Census', 'xl', 100, 30, 'overview', none, 'census']),
    s(['kpi_card', 'Clinical Performance', 'md', 95, 120, 'overview', none, 'performance']),
    s(['kpi_card', 'Workforce', 'md', 90, 120, 'overview', none, 'workforce']),
    s(['kpi_card', 'Education', 'sm', 82, 300, 'overview', none, 'education']),
    s(['kpi_card', 'Research', 'sm', 80, 300, 'overview', none, 'research']),
    s(['notifications', 'Alerts', 'lg', 96, 30, 'overview', none, 'alerts']),
    s(['patient_list', 'Ward Rounds', 'md', 92, 60, 'operations', none, 'rounds']),
    s(['task_list', 'Admissions Queue', 'md', 88, 60, 'operations', none, 'admissions']),
    s(['timeline', 'Consults', 'md', 84, 120, 'operations', none, 'consults']),
    s(['calendar', 'MDT', 'md', 82, 300, 'operations', none, 'mdt']),
    s(['patient_list', 'Patients', 'lg', 90, 60, 'operations', none, 'patients']),
    s(['ward_map', 'Ward Management', 'lg', 86, 120, 'operations', none, 'wards']),
    s(['calendar', 'Clinics', 'md', 78, 300, 'operations', none, 'clinics']),
    s(['timeline', 'Theatre', 'md', 76, 120, 'operations', none, 'theatre']),
    s(['task_list', 'Staff', 'md', 74, 300, 'operations', none, 'staff']),
    s(['inventory_card', 'Resources', 'md', 70, 300, 'operations', none, 'resources']),
    s(['education_card', 'Teaching', 'md', 72, 600, 'learning', none, 'teaching']),
    s(['research_card', 'Research', 'md', 68, 600, 'learning', none, 'research']),
    s(['protocol_card', 'Protocols', 'md', 64, 600, 'learning', none, 'protocols']),
    s(['chart', 'Quality', 'md', 75, 300, 'analytics', none, 'quality']),
    s(['kpi_card', 'Audits', 'sm', 62, 300, 'analytics', none, 'audits']),
    s(['ai_card', 'Intelligence', 'lg', 80, 60, 'analytics', none, 'intelligence']),
    s(['chart', 'Analytics', 'md', 66, 300, 'analytics', none, 'analytics']),
    s(['messages', 'Communications', 'md', 58, 300, 'communication', none, 'communications']),
    s(['report_list', 'Reports', 'md', 60, 600, 'analytics', none, 'reports']),
  ],

  // ── 4. Ward In-Charge — Ward Command Center ──────────────────────────────────
  ward: [
    s(['kpi_card', 'Ward Occupancy', 'xl', 100, 30, 'overview', none, 'occupancy']),
    s(['kpi_card', 'Admissions Today', 'md', 92, 60, 'overview', none, 'admissions']),
    s(['kpi_card', 'Discharges', 'md', 88, 60, 'overview', none, 'discharges']),
    s(['kpi_card', 'Critical Patients', 'md', 95, 30, 'overview', none, 'critical']),
    s(['ward_map', 'Live Ward Map', 'lg', 96, 60, 'overview', none, 'ward_map']),
    s(['patient_list', 'Patient Flow', 'lg', 90, 60, 'operations', none, 'flow']),
    s(['ward_map', 'Bed Management', 'lg', 86, 60, 'operations', none, 'beds']),
    s(['task_list', 'Nursing Operations', 'lg', 84, 120, 'operations', none, 'nursing']),
    s(['timeline', 'Medication Schedule', 'lg', 82, 60, 'operations', none, 'medications']),
    s(['notifications', 'Investigations & Critical Values', 'lg', 80, 60, 'operations', none, 'investigations']),
    s(['calendar', 'Procedures', 'md', 74, 300, 'operations', none, 'procedures']),
    s(['inventory_card', 'Equipment', 'md', 72, 300, 'operations', none, 'equipment']),
    s(['kpi_card', 'Infection Status', 'md', 76, 120, 'operations', none, 'infection']),
    s(['notifications', 'Emergency Alerts', 'lg', 98, 30, 'operations', none, 'emergency']),
    s(['ai_card', 'Clinical Intelligence', 'xl', 90, 60, 'analytics', none, 'intelligence']),
    s(['chart', 'Ward Quality', 'md', 70, 300, 'analytics', none, 'quality']),
    s(['chart', 'Ward Analytics', 'lg', 68, 300, 'analytics', none, 'analytics']),
    s(['report_list', 'Reports', 'md', 60, 600, 'analytics', none, 'reports']),
    s(['messages', 'Communication', 'md', 64, 300, 'communication', none, 'communication']),
    s(['education_card', 'Teaching', 'md', 62, 600, 'learning', none, 'teaching']),
  ],

  // ── 5. Consultant — the highest clinical reasoning workstation ──────────────
  clinician: [
    s(['kpi_card', "Today's Clinics", 'md', 90, 120, 'overview', none, 'clinics']),
    s(['kpi_card', 'Overnight Admissions', 'md', 88, 120, 'overview', none, 'admissions']),
    s(['kpi_card', 'Critical Patients', 'md', 96, 30, 'overview', none, 'critical']),
    s(['patient_list', 'Ward Round List', 'xl', 100, 60, 'operations', none, 'ward_round']),
    s(['patient_list', 'Operating List', 'md', 86, 120, 'operations', 'clinical', 'theatre']),
    s(['task_list', 'Orders', 'lg', 84, 120, 'operations', none, 'orders']),
    s(['notifications', 'Pending Results', 'lg', 82, 60, 'operations', none, 'results']),
    s(['timeline', 'Imaging', 'md', 76, 300, 'operations', none, 'imaging']),
    s(['calendar', 'Procedures', 'md', 74, 300, 'operations', none, 'procedures']),
    s(['patient_list', 'Emergency Referrals', 'md', 80, 60, 'operations', none, 'referrals']),
    s(['ai_card', 'Clinical Intelligence', 'xl', 98, 60, 'analytics', none, 'intelligence']),
    s(['chart', 'My Analytics', 'md', 68, 300, 'analytics', none, 'analytics']),
    s(['protocol_card', 'Protocols', 'md', 72, 600, 'learning', none, 'protocols']),
    s(['education_card', 'Teaching', 'md', 66, 600, 'learning', none, 'teaching']),
    s(['research_card', 'Research', 'md', 64, 600, 'learning', none, 'research']),
    s(['messages', 'Messages', 'md', 70, 120, 'communication', none, 'messages']),
  ],

  // ── 6. Resident ──────────────────────────────────────────────────────────────
  resident: [
    s(['patient_list', 'Ward Round List', 'xl', 100, 60, 'operations', none, 'ward_round']),
    s(['task_list', 'Orders', 'md', 90, 120, 'operations', none, 'orders']),
    s(['notifications', 'Results', 'md', 86, 60, 'operations', none, 'results']),
    s(['timeline', 'Procedures', 'md', 80, 300, 'operations', none, 'procedures']),
    s(['kpi_card', 'Logbook Progress', 'md', 84, 300, 'learning', none, 'logbook']),
    s(['task_list', 'Supervisor Tasks', 'md', 82, 120, 'operations', none, 'supervisor']),
    s(['calendar', 'Teaching', 'md', 74, 600, 'learning', none, 'teaching']),
    s(['education_card', 'Education', 'md', 70, 600, 'learning', none, 'education']),
    s(['messages', 'Messages', 'md', 66, 120, 'communication', none, 'messages']),
    s(['chart', 'Analytics', 'md', 62, 300, 'analytics', none, 'analytics']),
  ],

  // ── 7. Student ───────────────────────────────────────────────────────────────
  student: [
    s(['patient_list', 'Cases', 'xl', 100, 60, 'operations', none, 'cases']),
    s(['kpi_card', 'Logbook', 'lg', 95, 300, 'learning', none, 'logbook']),
    s(['timeline', 'Procedures', 'md', 88, 300, 'learning', none, 'procedures']),
    s(['task_list', 'Competencies', 'md', 84, 300, 'learning', none, 'competencies']),
    s(['calendar', 'Teaching', 'md', 80, 600, 'learning', none, 'teaching']),
    s(['calendar', 'OSCE', 'md', 76, 600, 'learning', none, 'osce']),
    s(['task_list', 'Assignments', 'md', 72, 300, 'learning', none, 'assignments']),
    s(['messages', 'Supervisor', 'md', 68, 300, 'communication', none, 'supervisor']),
  ],

  // ── 8. Nursing ───────────────────────────────────────────────────────────────
  nursing: [
    s(['timeline', 'Medication Schedule', 'xl', 100, 60, 'operations', none, 'medications']),
    s(['kpi_card', 'Vitals Due', 'md', 90, 60, 'operations', none, 'vitals']),
    s(['task_list', 'Nursing Tasks', 'lg', 95, 60, 'operations', none, 'tasks']),
    s(['patient_list', 'Ward Census', 'lg', 92, 60, 'operations', none, 'census']),
    s(['notifications', 'Observation Alerts', 'md', 88, 60, 'operations', none, 'observations']),
    s(['messages', 'Handover', 'md', 80, 120, 'communication', none, 'handover']),
    s(['kpi_card', 'Admissions', 'sm', 76, 120, 'operations', none, 'admissions']),
    s(['kpi_card', 'Discharges', 'sm', 74, 120, 'operations', none, 'discharges']),
    s(['chart', 'Nursing Analytics', 'md', 70, 300, 'analytics', none, 'analytics']),
    s(['education_card', 'Education', 'md', 64, 600, 'learning', none, 'education']),
  ],

  // ── 9. Pharmacy ──────────────────────────────────────────────────────────────
  pharmacy: [
    s(['task_list', 'Dispensing Queue', 'lg', 100, 60, 'operations', none, 'dispensing']),
    s(['patient_list', 'Prescriptions', 'lg', 92, 60, 'operations', none, 'prescriptions']),
    s(['inventory_card', 'Inventory', 'lg', 95, 300, 'operations', none, 'inventory']),
    s(['notifications', 'Controlled Drugs', 'md', 88, 300, 'operations', none, 'controlled']),
    s(['ai_card', 'Interaction Alerts', 'md', 84, 300, 'analytics', none, 'interactions']),
    s(['chart', 'Pharmacy Analytics', 'md', 76, 300, 'analytics', none, 'analytics']),
    s(['report_list', 'Reports', 'md', 70, 600, 'analytics', none, 'reports']),
  ],

  // ── 10. Laboratory ───────────────────────────────────────────────────────────
  laboratory: [
    s(['task_list', 'Workbench', 'xl', 100, 60, 'operations', none, 'workbench']),
    s(['patient_list', 'Accessions', 'lg', 92, 60, 'operations', none, 'accessions']),
    s(['notifications', 'Results & Critical Values', 'lg', 95, 60, 'operations', none, 'results']),
    s(['kpi_card', 'QC Status', 'md', 84, 300, 'operations', none, 'qc']),
    s(['inventory_card', 'Reagents', 'md', 78, 300, 'operations', none, 'reagents']),
    s(['chart', 'Lab Analytics', 'md', 72, 300, 'analytics', none, 'analytics']),
  ],

  // ── 11. Radiology ────────────────────────────────────────────────────────────
  radiology: [
    s(['patient_list', 'Worklist', 'xl', 100, 60, 'operations', none, 'worklist']),
    s(['task_list', 'Reporting', 'lg', 92, 60, 'operations', none, 'reporting']),
    s(['notifications', 'Critical Findings', 'md', 95, 60, 'operations', none, 'critical']),
    s(['inventory_card', 'Equipment', 'md', 80, 300, 'operations', none, 'equipment']),
    s(['chart', 'Radiology Analytics', 'md', 72, 300, 'analytics', none, 'analytics']),
  ],

  // ── 12. Theatre ──────────────────────────────────────────────────────────────
  theatre: [
    s(['calendar', 'Theatre List', 'xl', 100, 60, 'operations', none, 'theatre_list']),
    s(['task_list', 'Schedule', 'md', 90, 120, 'operations', none, 'schedule']),
    s(['inventory_card', 'Instruments', 'md', 84, 300, 'operations', none, 'instruments']),
    s(['kpi_card', 'Recovery Beds', 'md', 80, 120, 'operations', none, 'recovery']),
    s(['kpi_card', 'Anaesthesia Cases', 'md', 76, 120, 'operations', none, 'anaesthesia']),
    s(['chart', 'Theatre Analytics', 'md', 70, 300, 'analytics', none, 'analytics']),
  ],

  // ── 13. Emergency ────────────────────────────────────────────────────────────
  emergency: [
    s(['patient_list', 'Critical Patients', 'xl', 100, 30, 'operations', none, 'critical']),
    s(['kpi_card', 'Triage', 'md', 95, 60, 'operations', none, 'triage']),
    s(['notifications', 'Ambulances', 'md', 92, 60, 'operations', none, 'ambulances']),
    s(['kpi_card', 'Available Beds', 'md', 88, 60, 'operations', none, 'beds']),
    s(['kpi_card', 'Blood Stock', 'md', 90, 60, 'operations', none, 'blood']),
    s(['notifications', 'Trauma Alerts', 'lg', 96, 30, 'operations', none, 'trauma']),
    s(['ai_card', 'Emergency Intelligence', 'lg', 86, 60, 'analytics', none, 'intelligence']),
    s(['chart', 'Emergency Analytics', 'md', 70, 300, 'analytics', none, 'analytics']),
  ],

  // ── 14. Telemedicine ─────────────────────────────────────────────────────────
  telemedicine: [
    s(['patient_list', 'Consultations', 'xl', 100, 60, 'operations', none, 'consultations']),
    s(['kpi_card', 'Virtual Clinics', 'md', 90, 120, 'operations', none, 'clinics']),
    s(['task_list', 'Asynchronous', 'md', 84, 120, 'operations', none, 'async']),
    s(['notifications', 'Remote Monitoring', 'lg', 95, 60, 'operations', none, 'monitoring']),
    s(['patient_list', 'Virtual Ward', 'md', 80, 120, 'operations', none, 'virtual_ward']),
    s(['timeline', 'Referrals', 'md', 76, 300, 'operations', none, 'referrals']),
    s(['chart', 'Telemedicine Analytics', 'md', 70, 300, 'analytics', none, 'analytics']),
  ],

  // ── 15. Research ─────────────────────────────────────────────────────────────
  research: [
    s(['patient_list', 'Studies', 'xl', 100, 120, 'operations', none, 'studies']),
    s(['kpi_card', 'Recruitment', 'md', 92, 300, 'operations', none, 'recruitment']),
    s(['task_list', 'Datasets', 'md', 84, 300, 'operations', none, 'datasets']),
    s(['notifications', 'Ethics', 'md', 88, 300, 'operations', none, 'ethics']),
    s(['financial_card', 'Grants', 'md', 80, 600, 'analytics', none, 'grants']),
    s(['research_card', 'Publications', 'md', 76, 600, 'learning', none, 'publications']),
    s(['chart', 'Research Analytics', 'md', 70, 300, 'analytics', none, 'analytics']),
  ],

  // ── 16. Finance ──────────────────────────────────────────────────────────────
  finance: [
    s(['financial_card', 'Revenue', 'xl', 100, 60, 'analytics', none, 'revenue']),
    s(['task_list', 'Billing', 'lg', 95, 60, 'operations', none, 'billing']),
    s(['notifications', 'Insurance Claims', 'md', 88, 300, 'operations', none, 'claims']),
    s(['chart', 'Revenue Cycle', 'md', 84, 300, 'analytics', none, 'revenue_cycle']),
    s(['inventory_card', 'Procurement', 'md', 80, 300, 'operations', none, 'procurement']),
    s(['kpi_card', 'Budgets', 'md', 78, 600, 'analytics', none, 'budgets']),
    s(['ai_card', 'Cash Flow Forecast', 'md', 82, 300, 'analytics', none, 'forecast']),
    s(['report_list', 'Reports', 'md', 72, 600, 'analytics', none, 'reports']),
  ],

  // ── 17. HR ───────────────────────────────────────────────────────────────────
  hr: [
    s(['kpi_card', 'Headcount', 'md', 95, 300, 'overview', none, 'headcount']),
    s(['task_list', 'Recruitment', 'lg', 92, 120, 'operations', none, 'recruitment']),
    s(['patient_list', 'Employees', 'lg', 90, 120, 'operations', none, 'employees']),
    s(['task_list', 'Competencies', 'md', 84, 300, 'operations', none, 'competencies']),
    s(['chart', 'Performance', 'md', 80, 600, 'analytics', none, 'performance']),
    s(['financial_card', 'Payroll', 'md', 82, 600, 'analytics', none, 'payroll']),
    s(['calendar', 'Training', 'md', 74, 600, 'learning', none, 'training']),
  ],

  // ── 18. ICT ──────────────────────────────────────────────────────────────────
  ict: [
    s(['kpi_card', 'Device Status', 'md', 95, 120, 'overview', none, 'devices']),
    s(['inventory_card', 'Infrastructure', 'lg', 92, 300, 'operations', none, 'infrastructure']),
    s(['notifications', 'Cyber Events', 'lg', 96, 60, 'operations', none, 'cybersecurity']),
    s(['kpi_card', 'Integrations', 'md', 84, 300, 'operations', none, 'integrations']),
    s(['task_list', 'Support Tickets', 'lg', 88, 120, 'operations', none, 'support']),
    s(['chart', 'Monitoring', 'lg', 90, 60, 'analytics', none, 'monitoring']),
    s(['report_list', 'Reports', 'md', 72, 600, 'analytics', none, 'reports']),
  ],

  // ── 19. Patient — the Citizen Health Operating System ────────────────────────
  patient: [
    s(['kpi_card', 'Health Summary', 'xl', 100, 300, 'overview', none, 'summary']),
    s(['timeline', 'Lifelong Timeline', 'lg', 95, 120, 'overview', none, 'timeline']),
    s(['kpi_card', 'Health Score', 'md', 92, 300, 'overview', none, 'health_score']),
    s(['calendar', 'Appointments', 'lg', 90, 300, 'operations', none, 'appointments']),
    s(['notifications', 'Health Alerts', 'md', 96, 60, 'operations', none, 'alerts']),
    s(['patient_list', 'Care Team', 'md', 84, 300, 'operations', none, 'care_team']),
    s(['kpi_card', 'Current Medications', 'md', 86, 300, 'operations', none, 'medications']),
    s(['inventory_card', 'Vaccinations', 'sm', 68, 600, 'operations', none, 'vaccinations']),
    s(['ai_card', 'AI Health Assistant', 'md', 88, 120, 'analytics', none, 'assistant']),
    s(['chart', 'Lab Result Trends', 'md', 78, 600, 'analytics', none, 'results']),
    s(['chart', 'BP / Weight Trends', 'md', 76, 600, 'analytics', none, 'trends']),
    s(['financial_card', 'Billing', 'md', 74, 600, 'analytics', none, 'billing']),
    s(['kpi_card', 'Insurance Status', 'sm', 66, 600, 'analytics', none, 'insurance']),
    s(['messages', 'Care Team Messages', 'md', 72, 300, 'communication', none, 'messages']),
    s(['education_card', 'Health Education', 'md', 70, 600, 'learning', none, 'education']),
  ],
};

// ── Permission → capability mapping (constitutional) ───────────────────────────
// A widget's declared permission is checked against the actor's capability profile.
// Capabilities override generic role behavior.

export type CapabilityCheck = (capabilities: CapabilityProfile) => boolean;

export const CAPABILITY_FOR_PERMISSION: Readonly<Record<string, CapabilityCheck>> = {
  clinical: c => c.clinical,
  administrate: c => c.administration,
  teaching: c => c.teaching,
  research: c => c.research,
  telemedicine: c => c.telemedicine,
  prescribe: c => c.prescribe,
  order_lab: c => c.orderLab,
  order_imaging: c => c.orderImaging,
  admit: c => c.admit,
  discharge: c => c.discharge,
  sign_off: c => c.signOff,
};

export function hasPermission(permission: string | undefined, capabilities: CapabilityProfile): boolean {
  if (!permission) return true;
  const check = CAPABILITY_FOR_PERMISSION[permission];
  if (check) return check(capabilities);
  return capabilities.flags.includes(permission);
}

export function filterByPermission<T extends { permission?: string }>(items: readonly T[], capabilities: CapabilityProfile): T[] {
  return items.filter(item => hasPermission(item.permission, capabilities));
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── Widget composition input ───────────────────────────────────────────────────

export interface WidgetCompositionInput {
  familyId: DashboardFamilyId;
  assignment?: CurrentAssignment;
  capabilities: CapabilityProfile;
  preferences?: PreferenceSet;
  context: ResolutionContext;
}

// ── Widget Engine ──────────────────────────────────────────────────────────────

export class WidgetEngine {
  catalog(familyId: DashboardFamilyId): readonly WidgetSpec[] {
    return FAMILY_WIDGETS[familyId] ?? [];
  }

  // Rule 3 & 5 — capabilities override generic behavior; widgets are filtered.
  private filterByCapability(specs: readonly WidgetSpec[], capabilities: CapabilityProfile): WidgetSpec[] {
    return specs.filter(spec => hasPermission(spec.permission, capabilities));
  }

  // Rule 6 — preferences personalize presentation, never business logic.
  private applyPreferences(specs: WidgetSpec[], preferences?: PreferenceSet): WidgetSpec[] {
    if (!preferences) return specs;
    const favorites = new Set(preferences.favoriteWidgets ?? []);
    const order = preferences.widgetOrder ?? [];
    return [...specs].sort((a, b) => {
      const favA = favorites.has(a.type) ? 0 : 1;
      const favB = favorites.has(b.type) ? 0 : 1;
      if (favA !== favB) return favA - favB;
      const idxA = order.indexOf(a.type);
      const idxB = order.indexOf(b.type);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return b.priority - a.priority;
    });
  }

  // Rule 8 — graceful degradation. A widget that cannot resolve data still renders.
  private resolveData(spec: WidgetSpec, context: ResolutionContext): Record<string, unknown> {
    try {
      if (!spec.dataKey) return { source: 'presentation' };
      const raw = context.hospitalStatus?.[spec.dataKey];
      return raw === undefined ? { source: 'presentation', dataKey: spec.dataKey, empty: true } : { [spec.dataKey]: raw };
    } catch {
      return { source: 'presentation', degraded: true };
    }
  }

  private build(spec: WidgetSpec, input: WidgetCompositionInput): PresentationWidget {
    const widget = buildWidget(spec.type, spec.title, input.familyId, spec.priority, {
      size: spec.size,
      refreshIntervalSeconds: spec.refreshIntervalSeconds,
      permission: spec.permission,
      layer: spec.layer,
      data: this.resolveData(spec, input.context),
    });
    // Unique id per family+title so independent widgets never collide.
    widget.id = `${input.familyId}-${slug(spec.title)}`;
    return widget;
  }

  compose(input: WidgetCompositionInput): { widgets: PresentationWidget[]; layers: DashboardLayer[] } {
    const specs = this.filterByCapability(this.catalog(input.familyId), input.capabilities);
    const ordered = this.applyPreferences(specs, input.preferences);
    const widgets = ordered.map(spec => this.build(spec, input));
    const layers = DASHBOARD_LAYERS.map(layer => ({
      id: layer.id,
      label: layer.label,
      widgets: widgets.filter(widget => widget.layer === layer.id),
    }));
    return { widgets, layers };
  }
}
