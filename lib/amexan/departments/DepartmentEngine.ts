// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Department Engine (BOOK III)
//
// The constitutional engine responsible for creating, governing, coordinating,
// securing, analyzing, and continuously improving every clinical, administrative,
// educational, research, financial, operational, and support department within
// an organization.
//
// A department is NOT merely a folder of staff. It is a living operational
// organism with its own identity, objectives, workflows, knowledge, analytics,
// governance, resources, communications, quality systems, and constitutional
// responsibilities.
//
// Constitutional Principles:
//   P1  Departments are Organizations inside Organizations — every level behaves
//       like a miniature organization under the same constitutional rules.
//   P2  Departments own WORK, not people. People move; work remains.
//   P3  Departments own SERVICES, never people. Services remain constitutional.
//   P4  Departments collaborate, never compete.
//
// Constitutional Rules:
//   1. Departments own services, not people.
//   2. Departments may contain sub-departments indefinitely.
//   3. Every department has its own HMIS view.
//   4. Every department has its own EMR view.
//   5. Departments communicate only through constitutional workflows.
//   6. Departments own protocols but inherit constitutional reasoning.
//   7. Departments generate localized dashboards from the Presentation Engine.
//   8. Department knowledge contributes to the Organization Knowledge Base while
//      remaining versioned.
//   9. Patients move between departments; the longitudinal record never fragments.
//   10. Every action within a department is attributable, auditable, and measurable.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type {
  DepartmentType,
  MedicalSpecialty,
} from '@/lib/amexan/constitution/types';

// ── Department Categories ──────────────────────────────────────────────────────

export type DepartmentCategory =
  | 'clinical'
  | 'diagnostic'
  | 'therapeutic'
  | 'support'
  | 'administrative'
  | 'academic';

export const DEPARTMENT_CATEGORIES: readonly DepartmentCategory[] = [
  'clinical', 'diagnostic', 'therapeutic', 'support', 'administrative', 'academic',
];

/** The ten constitutional rules of the Department Engine. */
export const DEPARTMENT_CONSTITUTIONAL_RULES: readonly { id: number; name: string; statement: string }[] = [
  { id: 1, name: 'Services Not People', statement: 'Departments own services, not people. People move; work remains.' },
  { id: 2, name: 'Indefinite Sub-departments', statement: 'Departments may contain sub-departments indefinitely.' },
  { id: 3, name: 'Own HMIS View', statement: 'Every department has its own HMIS view.' },
  { id: 4, name: 'Own EMR View', statement: 'Every department has its own EMR view.' },
  { id: 5, name: 'Constitutional Communication', statement: 'Departments communicate only through constitutional workflows.' },
  { id: 6, name: 'Protocol Ownership', statement: 'Departments own protocols but inherit constitutional reasoning.' },
  { id: 7, name: 'Localized Dashboards', statement: 'Departments generate localized dashboards from the Presentation Engine.' },
  { id: 8, name: 'Versioned Knowledge', statement: 'Department knowledge contributes to the Organization Knowledge Base while remaining versioned.' },
  { id: 9, name: 'Unfragmented Record', statement: 'Patients move between departments; the longitudinal record never fragments.' },
  { id: 10, name: 'Attributable Actions', statement: 'Every action within a department is attributable, auditable, and measurable.' },
];

export const DEPARTMENT_CATEGORY_BY_TYPE: Readonly<Record<DepartmentType, DepartmentCategory>> = {
  administration: 'administrative',
  hr: 'administrative',
  finance: 'administrative',
  it: 'administrative',
  emergency: 'clinical',
  outpatient: 'clinical',
  inpatient: 'clinical',
  surgery: 'clinical',
  medicine: 'clinical',
  pediatrics: 'clinical',
  obstetrics_gynaecology: 'clinical',
  psychiatry: 'clinical',
  radiology: 'diagnostic',
  laboratory: 'diagnostic',
  pharmacy: 'support',
  icu: 'clinical',
  nicu: 'clinical',
  hdu: 'clinical',
  nursing: 'support',
  mortuary: 'support',
  laundry: 'support',
  kitchen: 'support',
  maintenance: 'support',
  research: 'academic',
  training: 'academic',
  quality: 'administrative',
  infection_control: 'clinical',
  blood_bank: 'diagnostic',
  ambulance: 'support',
  physiotherapy: 'therapeutic',
  dental: 'clinical',
  eye: 'clinical',
  ent: 'clinical',
  dermatology: 'clinical',
  oncology: 'clinical',
  cardiology: 'clinical',
  neurology: 'clinical',
  renal: 'clinical',
  pulmonology: 'clinical',
  gastroenterology: 'clinical',
  endocrinology: 'clinical',
  rheumatology: 'clinical',
  hematology: 'clinical',
  palliative_care: 'clinical',
  pain_management: 'clinical',
  other: 'clinical',
};

// ── Department Digital Twin ────────────────────────────────────────────────────

export type DepartmentStatus = 'draft' | 'active' | 'inactive' | 'closed';

export interface DepartmentLeadership {
  chairId?: AmxUid;
  administratorId?: AmxUid;
  clinicalLeadId?: AmxUid;
  headNurseId?: AmxUid;
  appointedAt?: number;
}

export interface DepartmentUnit {
  id: string;
  name: string;
  type: string;                 // ward | icu | theatre | clinic | lab_unit | pharmacy_unit ...
  leadId?: AmxUid;
  parentUnitId?: string;
  status: 'active' | 'inactive';
  createdAt: number;
}

export interface DepartmentClinic {
  id: string;
  name: string;
  specialty: MedicalSpecialty;
  location?: string;
  schedule?: string;
  status: 'active' | 'inactive';
}

export interface DepartmentTeam {
  id: string;
  name: string;
  type: 'medical' | 'nursing' | 'multidisciplinary' | 'support';
  leadId?: AmxUid;
  memberIds: AmxUid[];
  status: 'active' | 'inactive';
}

export interface DepartmentWorkspace {
  id: string;
  name: string;
  type: 'ward' | 'theatre' | 'clinic' | 'office' | 'lab' | 'pharmacy';
  location?: string;
  status: 'active' | 'inactive';
}

// ── Department Resources (rooms, theatres, beds, equipment, consumables) ───────
export type DepartmentResourceType =
  | 'room' | 'clinic' | 'theatre' | 'bed' | 'equipment' | 'computer'
  | 'consumable' | 'medicine' | 'laboratory' | 'vehicle';

export interface DepartmentResource {
  id: string;
  type: DepartmentResourceType;
  name: string;
  quantity: number;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  linkedEntityId?: string;   // e.g. workspace id, unit id
}

// ── Consultation Network (departments consult each other) ──────────────────────
export type ConsultationStatus = 'requested' | 'accepted' | 'assigned' | 'in_review' | 'completed' | 'closed' | 'declined';

export interface DepartmentConsultation {
  id: string;
  requestingDepartmentId: string;
  receivingDepartmentId: string;
  patientId: string;
  reason: string;
  status: ConsultationStatus;
  requestedBy: AmxUid;
  requestedAt: number;
  acceptedBy?: AmxUid;
  acceptedAt?: number;
  assignedConsultantId?: AmxUid;
  assignedAt?: number;
  recommendations?: string;
  completedAt?: number;
  closedAt?: number;
}

// ── Referral Network (patient journey moves through departments) ───────────────
export type ReferralStatus = 'referred' | 'accepted' | 'in_progress' | 'completed' | 'declined';

export interface DepartmentReferral {
  id: string;
  fromDepartmentId: string;
  toDepartmentId: string;
  patientId: string;
  reason: string;
  status: ReferralStatus;
  referredBy: AmxUid;
  referredAt: number;
  acceptedBy?: AmxUid;
  acceptedAt?: number;
  journeyStage?: string;   // e.g. 'theatre', 'icu', 'ward'
}

// ── Department branding (Rule 5: customize appearance) ─────────────────────────
export interface DepartmentBranding {
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
}

// ── Specialized department views ───────────────────────────────────────────────
/** The EMR adapts to the department (Emergency→ABCDE, OBG→ANC/EDD, ...). */
export const DEPARTMENT_EMR_VIEWS: Readonly<Record<DepartmentType, readonly string[]>> = {
  emergency: ['ABCDE', 'FAST', 'Trauma', 'Time', 'Disposition'],
  surgery: ['Clerking', 'Diagnosis', 'Operation Notes', 'Post-op', 'Rounds'],
  pediatrics: ['Growth', 'Vaccination', 'Nutrition', 'Development', 'Weight'],
  obstetrics_gynaecology: ['ANC', 'EDD', 'Partograph', 'Postnatal', 'Family Planning'],
  medicine: ['Ward Lists', 'Rounds', 'Admissions', 'Discharges', 'Transfers'],
  radiology: ['Imaging Orders', 'Scheduling', 'Reports', 'PACS'],
  laboratory: ['Specimens', 'Validation', 'QC', 'Interpretation'],
  pharmacy: ['Stock', 'Dispensing', 'Controlled Drugs', 'Expiry', 'Interactions'],
  icu: ['Monitoring', 'Ventilation', 'Scores', 'Lines', 'Sedation'],
  nicu: ['Weight', 'Feed', 'Jaundice', 'Oxygen', 'Scores'],
  hdu: ['Monitoring', 'Observations', 'Escalation'],
  cardiology: ['ECG', 'Echo', 'Monitoring', 'Drugs'],
  neurology: ['GCS', 'Seizure', 'Stroke Pathway', 'Investigations'],
  renal: ['Dialysis', 'Fluid Balance', 'Renal Function'],
  oncology: ['Staging', 'Chemo', 'Toxicities', 'Plan'],
  psychiatry: ['Mental State', 'Risk', 'Section', 'Medication'],
  dermatology: ['Lesion', 'Photos', 'Treatment', 'Follow-up'],
  eye: ['Visual Acuity', 'Slit Lamp', 'Intraocular Pressure', 'Plan'],
  ent: ['Otoscopy', 'Audiology', 'Nasendoscopy', 'Plan'],
  dental: ['Charting', 'X-ray', 'Procedure', 'Plan'],
  physiotherapy: ['Assessment', 'Range of Motion', 'Mobility', 'Plan'],
  blood_bank: ['Units', 'Crossmatch', 'Issue', 'Reactions'],
  outpatient: ['Consultation', 'Prescription', 'Follow-up'],
  inpatient: ['Ward Lists', 'Rounds', 'Admissions', 'Discharges'],
  infection_control: ['Isolation', 'HAI Tracking', 'Outbreak', 'Audits'],
  palliative_care: ['Symptoms', 'Pain', 'Advanced Care Plan'],
  pain_management: ['Pain Score', 'Interventions', 'Medication'],
  pulmonology: ['Spirometry', 'Oxygen', 'ABG', 'Plan'],
  gastroenterology: ['Endoscopy', 'Diet', 'LFT', 'Plan'],
  endocrinology: ['Glucose', 'TFT', 'Hormones', 'Plan'],
  rheumatology: ['Joints', 'Autoantibodies', 'Disease Activity'],
  hematology: ['CBC', 'Coagulation', 'Transfusion', 'Plan'],
  administration: ['Operations', 'Staff', 'Finance', 'Quality'],
  hr: ['Staff Records', 'Recruitment', 'Leave', 'Training'],
  finance: ['Billing', 'Revenue', 'Budgets', 'Claims'],
  it: ['Devices', 'Tickets', 'Networks', 'Security'],
  quality: ['Audits', 'KPIs', 'Incidents', 'Accreditation'],
  research: ['Projects', 'Ethics', 'Datasets', 'Publications'],
  training: ['Rotations', 'Sessions', 'Logbooks', 'Assessments'],
  nursing: ['Assignments', 'Observations', 'Medication', 'Handover'],
  mortuary: ['Cases', 'Release', 'Records'],
  laundry: ['Loads', 'Machines', 'Inventory'],
  kitchen: ['Menus', 'Dietary Needs', 'Stock'],
  maintenance: ['Work Orders', 'Equipment', 'Downtime'],
  ambulance: ['Calls', 'Fleet', 'Crews', 'Transfers'],
  other: ['General', 'Notes', 'Plan'],
};

/** The HMIS localizes per department (Medicine→ward lists, Lab→orders/QC...). */
export const DEPARTMENT_HMIS_VIEWS: Readonly<Record<DepartmentType, readonly string[]>> = {
  medicine: ['Ward Lists', 'Rounds', 'Admissions', 'Discharges', 'Transfers'],
  laboratory: ['Orders', 'Samples', 'Quality Control', 'Machines', 'Reports'],
  radiology: ['Imaging Orders', 'Scheduling', 'Reports', 'PACS'],
  pharmacy: ['Stock', 'Dispensing', 'Controlled Drugs', 'Expiry', 'Interactions'],
  emergency: ['Triage', 'Resuscitation', 'Beds', 'Transfers', 'Alerts'],
  surgery: ['Theatre List', 'Wards', 'On-call', 'Operations', 'Complications'],
  pediatrics: ['Ward Lists', 'Vaccination', 'Nutrition', 'Growth'],
  obstetrics_gynaecology: ['ANC Register', 'Labour Ward', 'Partograph', 'Postnatal', 'Family Planning'],
  icu: ['Beds', 'Ventilators', 'Scores', 'Lines', 'Staffing'],
  nicu: ['Cots', 'Feedings', 'Phototherapy', 'Oxygen', 'Staffing'],
  hdu: ['Beds', 'Monitoring', 'Staffing'],
  cardiology: ['ECG Queue', 'Echo Queue', 'Ward', 'Monitoring'],
  neurology: ['Ward', 'Stroke Pathway', 'EEG', 'Seizure Log'],
  renal: ['Dialysis Machines', 'Sessions', 'Ward'],
  oncology: ['Treatment Schedule', 'Chemo Bays', 'Toxicities', 'Registries'],
  psychiatry: ['Beds', 'Sections', 'Risk Lists', 'Clinic'],
  dermatology: ['Clinic', 'Phototherapy', 'Procedures'],
  eye: ['Clinic', 'Operating List', 'Outreach'],
  ent: ['Clinic', 'Audiology', 'Operating List'],
  dental: ['Chair Schedule', 'X-ray Queue', 'Procedures'],
  physiotherapy: ['Sessions', 'Patients', 'Equipment'],
  blood_bank: ['Units', 'Crossmatch Queue', 'Issues', 'Reactions'],
  outpatient: ['Appointments', 'Queue', 'Clinics'],
  inpatient: ['Census', 'Ward Occupancy', 'Admissions', 'Discharges'],
  infection_control: ['Isolation Beds', 'HAI Surveillance', 'Outbreak'],
  palliative_care: ['Census', 'Pain Rounds', 'Home Visits'],
  pain_management: ['Clinic', 'Procedures', 'Patients'],
  pulmonology: ['Spirometry Queue', 'Bronchoscopy', 'Ward'],
  gastroenterology: ['Endoscopy Queue', 'Ward', 'Diet Clinics'],
  endocrinology: ['Clinic', 'DKA Log', 'Patients'],
  rheumatology: ['Clinic', 'Infusion Bays', 'Patients'],
  hematology: ['Clinic', 'Transfusion', 'Bone Marrow'],
  administration: ['Operations', 'Staff', 'Meetings', 'Reports'],
  hr: ['Staff', 'Recruitment', 'Leave', 'Training'],
  finance: ['Billing', 'Claims', 'Budgets', 'Reports'],
  it: ['Tickets', 'Devices', 'Network', 'Incidents'],
  quality: ['Audits', 'Incidents', 'KPIs', 'Accreditation'],
  research: ['Projects', 'Recruitment', 'Data', 'Publications'],
  training: ['Rotations', 'Timetables', 'Logbooks', 'Assessments'],
  nursing: ['Rosters', 'Assignments', 'Handover', 'Staffing'],
  mortuary: ['Admissions', 'Release', 'Records'],
  laundry: ['Processing', 'Machines', 'Distribution'],
  kitchen: ['Meal Planning', 'Dietary', 'Stock'],
  maintenance: ['Work Orders', 'Assets', 'Schedules'],
  ambulance: ['Dispatch', 'Fleet', 'Crews'],
  other: ['General', 'Operations'],
};

/** Specialized AI per department. */
export const DEPARTMENT_AI_CAPABILITIES: Readonly<Record<DepartmentType, readonly string[]>> = {
  surgery: ['Operative Planning', 'SSI Risk', 'ERAS', 'Complications'],
  radiology: ['Imaging Prioritization', 'Report Assistance'],
  laboratory: ['Critical Values', 'QC Monitoring', 'Delta Checks'],
  emergency: ['Triage Intelligence', 'Sepsis Detection', 'Stroke Pathway', 'Trauma Alerts'],
  medicine: ['Diagnostic Support', 'Escalation Prediction'],
  pediatrics: ['Growth Alerts', 'Dehydration Scoring'],
  obstetrics_gynaecology: ['Partograph Alerts', 'Risk Stratification'],
  icu: ['Deterioration Detection', 'Ventilator Weaning'],
  cardiology: ['ECG Interpretation', 'Arrhythmia Alerts'],
  neurology: ['Stroke Detection', 'Seizure Prediction'],
  pharmacy: ['Interaction Checking', 'Dose Adjustment', 'Stock Forecasting'],
  oncology: ['Staging Support', 'Toxicity Monitoring'],
  psychiatry: ['Risk Assessment', 'Outcome Tracking'],
  renal: ['Fluid Balance Alerts', 'Dialysis Adequacy'],
  hematology: ['Transfusion Triggers', 'Coagulation Alerts'],
  infection_control: ['Outbreak Detection', 'HAI Surveillance'],
  pulmonology: ['Ventilation Alerts', 'Asthma/COPD Alerts'],
  administration: ['Operational Insights'],
  hr: ['Workforce Analytics'],
  finance: ['Revenue Insights'],
  it: ['Anomaly Detection'],
  quality: ['KPI Trends'],
  research: ['Cohort Discovery'],
  training: ['Competency Tracking'],
  // Default fallbacks
  outpatient: ['Appointment Insights'],
  inpatient: ['Length of Stay Prediction'],
  hdu: ['Deterioration Detection'],
  nicu: ['Sepsis Risk in Neonates'],
  dermatology: ['Lesion Recognition'],
  eye: ['Retinal Screening'],
  ent: ['Hearing Assessment'],
  dental: ['Caries Risk'],
  physiotherapy: ['Progress Tracking'],
  blood_bank: ['Stock Management'],
  palliative_care: ['Symptom Prediction'],
  pain_management: ['Analgesia Guidance'],
  gastroenterology: ['Bleeding Risk'],
  endocrinology: ['Glycemic Prediction'],
  rheumatology: ['Flare Prediction'],
  mortuary: ['Case Management'],
  laundry: ['Workload Optimization'],
  kitchen: ['Menu Optimization'],
  maintenance: ['Predictive Maintenance'],
  ambulance: ['Response Optimization'],
  nursing: ['Staffing Prediction'],
  other: ['General Assistance'],
};

export interface DepartmentProtocol {
  id: string;
  name: string;
  type: 'clinical' | 'administrative' | 'operational';
  version: number;
  status: 'draft' | 'active' | 'archived';
  approvedBy?: AmxUid;
  createdAt: number;
}

export interface DepartmentKPI {
  id: string;
  name: string;
  category: 'clinical' | 'operational' | 'financial' | 'quality' | 'teaching' | 'research';
  target: number;
  current: number;
  unit: string;
}

export interface DepartmentFinancial {
  budget: number;
  spent: number;
  revenue: number;
  currency: string;
}

export interface DepartmentMeeting {
  id: string;
  title: string;
  type: 'handover' | 'morbidity_mortality' | 'journal_club' | 'grand_round' | 'staff' | 'board';
  scheduledAt: number;
  attendees: AmxUid[];
  notes?: string;
}

export interface DepartmentKnowledge {
  id: string;
  title: string;
  kind: 'guideline' | 'protocol' | 'teaching_note' | 'video' | 'research' | 'clinical_pearl' | 'case_discussion' | 'journal_club' | 'sop';
  version: number;
  authorId?: AmxUid;
  createdAt: number;
  status: 'draft' | 'published' | 'archived';
}

export interface DepartmentTeaching {
  rotations: { id: string; name: string; students: number; status: 'active' | 'completed' }[];
  sessions: { id: string; title: string; type: string; attendees: number; at: number }[];
  logbooks: number;
  assessments: number;
}

export interface DepartmentResearch {
  projects: { id: string; title: string; status: string }[];
  publications: number;
  ethicsApprovals: number;
}

export interface DepartmentQuality {
  mortality: number;
  morbidity: number;
  audits: number;
  kpis: number;
  incidents: number;
  infectionRate: number;
}

export interface DepartmentModel {
  id?: string;                   // Firestore id once persisted
  organizationId: string;
  facilityId?: string;
  branchId?: string;
  name: string;
  code: string;
  type: DepartmentType;
  category: DepartmentCategory;
  description?: string;
  shortName?: string;
  mission?: string;
  vision?: string;
  parentDepartmentId?: string;
  leadership: DepartmentLeadership;
  units: DepartmentUnit[];
  clinics: DepartmentClinic[];
  teams: DepartmentTeam[];
  workspaces: DepartmentWorkspace[];
  resources: DepartmentResource[];
  consultations: DepartmentConsultation[];
  referrals: DepartmentReferral[];
  branding?: DepartmentBranding;
  protocols: DepartmentProtocol[];
  kpis: DepartmentKPI[];
  financial: DepartmentFinancial;
  meetings: DepartmentMeeting[];
  knowledge: DepartmentKnowledge[];
  teaching: DepartmentTeaching;
  research: DepartmentResearch;
  quality: DepartmentQuality;
  services: { id: string; name: string; status: 'active' | 'inactive' }[];
  languages: string[];
  status: DepartmentStatus;
  createdAt: number;
  updatedAt: number;
  createdBy?: AmxUid;
}

export interface CreateDepartmentInput {
  organizationId: string;
  facilityId?: string;
  branchId?: string;
  name: string;
  code?: string;
  type: DepartmentType;
  description?: string;
  shortName?: string;
  mission?: string;
  vision?: string;
  parentDepartmentId?: string;
  languages?: string[];
  actorId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function codeFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 5).toUpperCase();
  return words.slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() + words[0].slice(0, 3).toUpperCase();
}

export class DepartmentEngine {
  // ── Creation ─────────────────────────────────────────────────────────────────

  static create(input: CreateDepartmentInput): DepartmentModel {
    const name = (input.name ?? '').trim();
    if (!name) throw new Error('[DepartmentEngine] Department name is required');
    if (name.length < 2) throw new Error('[DepartmentEngine] Department name must be at least 2 characters');
    if (!input.organizationId) throw new Error('[DepartmentEngine] organizationId is required (Rule 10)');
    if (!DEPARTMENT_CATEGORY_BY_TYPE[input.type]) throw new Error(`[DepartmentEngine] Unknown department type: ${input.type}`);

    const now = Date.now();
    const code = (input.code ?? codeFromName(name)).trim().toUpperCase();

    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      branchId: input.branchId,
      name,
      code,
      type: input.type,
      category: DEPARTMENT_CATEGORY_BY_TYPE[input.type],
      description: input.description?.trim(),
      shortName: input.shortName?.trim(),
      mission: input.mission?.trim(),
      vision: input.vision?.trim(),
      parentDepartmentId: input.parentDepartmentId,
      leadership: {},
      units: [],
      clinics: [],
      teams: [],
      workspaces: [],
      resources: [],
      consultations: [],
      referrals: [],
      protocols: [],
      kpis: [],
      financial: { budget: 0, spent: 0, revenue: 0, currency: 'USD' },
      meetings: [],
      knowledge: [],
      teaching: { rotations: [], sessions: [], logbooks: 0, assessments: 0 },
      research: { projects: [], publications: 0, ethicsApprovals: 0 },
      quality: { mortality: 0, morbidity: 0, audits: 0, kpis: 0, incidents: 0, infectionRate: 0 },
      services: [],
      languages: input.languages && input.languages.length ? input.languages : ['en'],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      createdBy: input.actorId,
    };
  }

  // ── Leadership (constitutional positions) ────────────────────────────────────

  static appointChair(model: DepartmentModel, chairId: AmxUid, actorId?: AmxUid): DepartmentModel {
    return DepartmentEngine.updateLeadership(model, { chairId, appointedAt: Date.now() }, actorId);
  }

  static appointAdministrator(model: DepartmentModel, administratorId: AmxUid, actorId?: AmxUid): DepartmentModel {
    return DepartmentEngine.updateLeadership(model, { administratorId, appointedAt: Date.now() }, actorId);
  }

  static appointClinicalLead(model: DepartmentModel, clinicalLeadId: AmxUid, actorId?: AmxUid): DepartmentModel {
    return DepartmentEngine.updateLeadership(model, { clinicalLeadId, appointedAt: Date.now() }, actorId);
  }

  static appointHeadNurse(model: DepartmentModel, headNurseId: AmxUid, actorId?: AmxUid): DepartmentModel {
    return DepartmentEngine.updateLeadership(model, { headNurseId, appointedAt: Date.now() }, actorId);
  }

  private static updateLeadership(model: DepartmentModel, patch: Partial<DepartmentLeadership>, actorId?: AmxUid): DepartmentModel {
    return { ...model, leadership: { ...model.leadership, ...patch }, updatedAt: Date.now() };
  }

  // ── Internal structure (units / clinics / teams / workspaces) ────────────────

  static addUnit(model: DepartmentModel, input: { name: string; type: string; leadId?: AmxUid; parentUnitId?: string }): DepartmentModel {
    const name = (input.name ?? '').trim();
    if (!name) throw new Error('[DepartmentEngine] Unit name is required');
    const unit: DepartmentUnit = {
      id: nextId('unit'),
      name,
      type: input.type,
      leadId: input.leadId,
      parentUnitId: input.parentUnitId,
      status: 'active',
      createdAt: Date.now(),
    };
    return { ...model, units: [...model.units, unit], updatedAt: Date.now() };
  }

  static addClinic(model: DepartmentModel, input: { name: string; specialty: MedicalSpecialty; location?: string; schedule?: string }): DepartmentModel {
    const name = (input.name ?? '').trim();
    if (!name) throw new Error('[DepartmentEngine] Clinic name is required');
    const clinic: DepartmentClinic = {
      id: nextId('cln'),
      name,
      specialty: input.specialty,
      location: input.location,
      schedule: input.schedule,
      status: 'active',
    };
    return { ...model, clinics: [...model.clinics, clinic], updatedAt: Date.now() };
  }

  static createTeam(model: DepartmentModel, input: { name: string; type: DepartmentTeam['type']; leadId?: AmxUid; memberIds?: AmxUid[] }): DepartmentModel {
    const name = (input.name ?? '').trim();
    if (!name) throw new Error('[DepartmentEngine] Team name is required');
    const team: DepartmentTeam = {
      id: nextId('team'),
      name,
      type: input.type,
      leadId: input.leadId,
      memberIds: input.memberIds ?? [],
      status: 'active',
    };
    return { ...model, teams: [...model.teams, team], updatedAt: Date.now() };
  }

  static addTeamMember(model: DepartmentModel, teamId: string, memberId: AmxUid): DepartmentModel {
    const index = model.teams.findIndex(t => t.id === teamId);
    if (index === -1) throw new Error(`[DepartmentEngine] Team "${teamId}" does not exist`);
    const team = model.teams[index];
    if (team.memberIds.includes(memberId)) return model; // idempotent
    const updated: DepartmentTeam = { ...team, memberIds: [...team.memberIds, memberId] };
    return { ...model, teams: [...model.teams.slice(0, index), updated, ...model.teams.slice(index + 1)], updatedAt: Date.now() };
  }

  static addWorkspace(model: DepartmentModel, input: { name: string; type: DepartmentWorkspace['type']; location?: string }): DepartmentModel {
    const workspace: DepartmentWorkspace = {
      id: nextId('ws'),
      name: (input.name ?? '').trim(),
      type: input.type,
      location: input.location,
      status: 'active',
    };
    return { ...model, workspaces: [...model.workspaces, workspace], updatedAt: Date.now() };
  }

  static addService(model: DepartmentModel, name: string): DepartmentModel {
    const trimmed = (name ?? '').trim();
    if (!trimmed) throw new Error('[DepartmentEngine] Service name is required');
    if (model.services.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) return model; // idempotent
    return {
      ...model,
      services: [...model.services, { id: nextId('svc'), name: trimmed, status: 'active' }],
      updatedAt: Date.now(),
    };
  }

  // ── Resources (rooms, theatres, beds, equipment, consumables) ────────────────

  static addResource(model: DepartmentModel, input: Omit<DepartmentResource, 'id'>): DepartmentModel {
    if (!input.name) throw new Error('[DepartmentEngine] Resource name is required');
    return { ...model, resources: [...model.resources, { ...input, id: nextId('res') }], updatedAt: Date.now() };
  }

  static setResourceStatus(model: DepartmentModel, resourceId: string, status: DepartmentResource['status']): DepartmentModel {
    const index = model.resources.findIndex(r => r.id === resourceId);
    if (index === -1) throw new Error(`[DepartmentEngine] Resource "${resourceId}" does not exist`);
    const updated = { ...model.resources[index], status };
    return {
      ...model,
      resources: [...model.resources.slice(0, index), updated, ...model.resources.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static getResourcesByType(model: DepartmentModel, type: DepartmentResourceType): DepartmentResource[] {
    return model.resources.filter(r => r.type === type);
  }

  static getUnavailableResources(model: DepartmentModel): DepartmentResource[] {
    return model.resources.filter(r => r.status !== 'available');
  }

  // ── Consultation Network (Rule 5: departments communicate through workflows) ─

  static requestConsultation(
    model: DepartmentModel,
    input: { receivingDepartmentId: string; patientId: string; reason: string; requestedBy: AmxUid },
  ): { model: DepartmentModel; consultation: DepartmentConsultation } {
    if (!input.receivingDepartmentId || !input.patientId || !input.reason.trim() || !input.requestedBy) {
      throw new Error('[DepartmentEngine] Consultation requires receivingDepartmentId, patientId, reason, and requestedBy');
    }
    const consultation: DepartmentConsultation = {
      id: nextId('cons'),
      requestingDepartmentId: model.id ?? '',
      receivingDepartmentId: input.receivingDepartmentId,
      patientId: input.patientId,
      reason: input.reason.trim(),
      status: 'requested',
      requestedBy: input.requestedBy,
      requestedAt: Date.now(),
    };
    return { model: { ...model, consultations: [...model.consultations, consultation], updatedAt: Date.now() }, consultation };
  }

  static acceptConsultation(model: DepartmentModel, consultationId: string, acceptedBy: AmxUid): DepartmentModel {
    const index = model.consultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[DepartmentEngine] Consultation "${consultationId}" does not exist`);
    const updated: DepartmentConsultation = { ...model.consultations[index], status: 'accepted', acceptedBy, acceptedAt: Date.now() };
    return {
      ...model,
      consultations: [...model.consultations.slice(0, index), updated, ...model.consultations.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static assignConsultant(model: DepartmentModel, consultationId: string, consultantId: AmxUid): DepartmentModel {
    const index = model.consultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[DepartmentEngine] Consultation "${consultationId}" does not exist`);
    const updated: DepartmentConsultation = { ...model.consultations[index], status: 'assigned', assignedConsultantId: consultantId, assignedAt: Date.now() };
    return {
      ...model,
      consultations: [...model.consultations.slice(0, index), updated, ...model.consultations.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static completeConsultation(model: DepartmentModel, consultationId: string, recommendations: string): DepartmentModel {
    const index = model.consultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[DepartmentEngine] Consultation "${consultationId}" does not exist`);
    const updated: DepartmentConsultation = { ...model.consultations[index], status: 'completed', recommendations, completedAt: Date.now() };
    return {
      ...model,
      consultations: [...model.consultations.slice(0, index), updated, ...model.consultations.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static closeConsultation(model: DepartmentModel, consultationId: string): DepartmentModel {
    const index = model.consultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[DepartmentEngine] Consultation "${consultationId}" does not exist`);
    const updated: DepartmentConsultation = { ...model.consultations[index], status: 'closed', closedAt: Date.now() };
    return {
      ...model,
      consultations: [...model.consultations.slice(0, index), updated, ...model.consultations.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static getOpenConsultations(model: DepartmentModel): DepartmentConsultation[] {
    return model.consultations.filter(c => c.status !== 'closed' && c.status !== 'completed');
  }

  static getOpenConsultationsForDepartment(model: DepartmentModel, departmentId: string): DepartmentConsultation[] {
    return model.consultations.filter(c => (c.requestingDepartmentId === departmentId || c.receivingDepartmentId === departmentId) && c.status !== 'closed' && c.status !== 'completed');
  }

  // ── Referral Network (Rule 9: the longitudinal record never fragments) ───────

  static referPatient(
    model: DepartmentModel,
    input: { toDepartmentId: string; patientId: string; reason: string; referredBy: AmxUid; journeyStage?: string },
  ): { model: DepartmentModel; referral: DepartmentReferral } {
    if (!input.toDepartmentId || !input.patientId || !input.reason.trim() || !input.referredBy) {
      throw new Error('[DepartmentEngine] Referral requires toDepartmentId, patientId, reason, and referredBy');
    }
    const referral: DepartmentReferral = {
      id: nextId('ref'),
      fromDepartmentId: model.id ?? '',
      toDepartmentId: input.toDepartmentId,
      patientId: input.patientId,
      reason: input.reason.trim(),
      status: 'referred',
      referredBy: input.referredBy,
      referredAt: Date.now(),
      journeyStage: input.journeyStage,
    };
    return { model: { ...model, referrals: [...model.referrals, referral], updatedAt: Date.now() }, referral };
  }

  static acceptReferral(model: DepartmentModel, referralId: string, acceptedBy: AmxUid): DepartmentModel {
    const index = model.referrals.findIndex(r => r.id === referralId);
    if (index === -1) throw new Error(`[DepartmentEngine] Referral "${referralId}" does not exist`);
    const updated: DepartmentReferral = { ...model.referrals[index], status: 'accepted', acceptedBy, acceptedAt: Date.now() };
    return {
      ...model,
      referrals: [...model.referrals.slice(0, index), updated, ...model.referrals.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static completeReferral(model: DepartmentModel, referralId: string): DepartmentModel {
    const index = model.referrals.findIndex(r => r.id === referralId);
    if (index === -1) throw new Error(`[DepartmentEngine] Referral "${referralId}" does not exist`);
    const updated: DepartmentReferral = { ...model.referrals[index], status: 'completed' };
    return {
      ...model,
      referrals: [...model.referrals.slice(0, index), updated, ...model.referrals.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static getActiveReferrals(model: DepartmentModel): DepartmentReferral[] {
    return model.referrals.filter(r => r.status !== 'completed' && r.status !== 'declined');
  }

  // ── Branding (Rule 5: appearance only) ───────────────────────────────────────

  static setBranding(model: DepartmentModel, branding: DepartmentBranding): DepartmentModel {
    return { ...model, branding: { ...model.branding, ...branding }, updatedAt: Date.now() };
  }

  // ── Specialized views (Rule 3 & 4: own HMIS and EMR views) ───────────────────

  static getEmrView(model: DepartmentModel): readonly string[] {
    return DEPARTMENT_EMR_VIEWS[model.type] ?? DEPARTMENT_EMR_VIEWS.other;
  }

  static getHmisView(model: DepartmentModel): readonly string[] {
    return DEPARTMENT_HMIS_VIEWS[model.type] ?? DEPARTMENT_HMIS_VIEWS.other;
  }

  static getAiCapabilities(model: DepartmentModel): readonly string[] {
    return DEPARTMENT_AI_CAPABILITIES[model.type] ?? DEPARTMENT_AI_CAPABILITIES.other;
  }

  // ── Constitutional Rules ─────────────────────────────────────────────────────

  static checkConstitutionalRules(model: DepartmentModel): string[] {
    const violations: string[] = [];
    if (!model.name) violations.push('Rule 10: a department must carry a name');
    if (!model.organizationId) violations.push('Rule 10: a department must belong to exactly one organization');
    if (model.parentDepartmentId && model.parentDepartmentId === model.id) {
      violations.push('Rule 2: a department cannot be its own parent');
    }
    const orphanConsult = model.consultations.some(c => c.requestingDepartmentId === '' && c.receivingDepartmentId === '');
    if (orphanConsult) violations.push('Rule 5: consultations must flow through constitutional workflows');
    return violations;
  }

  // ── Protocols (Rule 6: own protocols, inherit reasoning) ─────────────────────

  static addProtocol(model: DepartmentModel, input: { name: string; type: DepartmentProtocol['type'] }, actorId?: AmxUid): DepartmentModel {
    const protocol: DepartmentProtocol = {
      id: nextId('prt'),
      name: (input.name ?? '').trim(),
      type: input.type,
      version: 1,
      status: 'draft',
      approvedBy: actorId,
      createdAt: Date.now(),
    };
    return { ...model, protocols: [...model.protocols, protocol], updatedAt: Date.now() };
  }

  static publishProtocol(model: DepartmentModel, protocolId: string, actorId?: AmxUid): DepartmentModel {
    const index = model.protocols.findIndex(p => p.id === protocolId);
    if (index === -1) throw new Error(`[DepartmentEngine] Protocol "${protocolId}" does not exist`);
    const current = model.protocols[index];
    const updated: DepartmentProtocol = {
      ...current,
      version: current.status === 'active' ? current.version + 1 : current.version,
      status: 'active',
      approvedBy: actorId,
    };
    return {
      ...model,
      protocols: [...model.protocols.slice(0, index), updated, ...model.protocols.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static archiveProtocol(model: DepartmentModel, protocolId: string): DepartmentModel {
    const index = model.protocols.findIndex(p => p.id === protocolId);
    if (index === -1) throw new Error(`[DepartmentEngine] Protocol "${protocolId}" does not exist`);
    const updated: DepartmentProtocol = { ...model.protocols[index], status: 'archived' };
    return {
      ...model,
      protocols: [...model.protocols.slice(0, index), updated, ...model.protocols.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  // ── Knowledge (Rule 8: contributes to org knowledge, remains versioned) ──────

  static addKnowledge(model: DepartmentModel, input: { title: string; kind: DepartmentKnowledge['kind'] }, authorId?: AmxUid): DepartmentModel {
    const knowledge: DepartmentKnowledge = {
      id: nextId('kn'),
      title: (input.title ?? '').trim(),
      kind: input.kind,
      version: 1,
      authorId,
      createdAt: Date.now(),
      status: 'draft',
    };
    return { ...model, knowledge: [...model.knowledge, knowledge], updatedAt: Date.now() };
  }

  static publishKnowledge(model: DepartmentModel, knowledgeId: string): DepartmentModel {
    const index = model.knowledge.findIndex(k => k.id === knowledgeId);
    if (index === -1) throw new Error(`[DepartmentEngine] Knowledge "${knowledgeId}" does not exist`);
    const current = model.knowledge[index];
    const updated: DepartmentKnowledge = {
      ...current,
      version: current.status === 'published' ? current.version + 1 : current.version,
      status: 'published',
    };
    return {
      ...model,
      knowledge: [...model.knowledge.slice(0, index), updated, ...model.knowledge.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  // ── KPIs / financial / quality ───────────────────────────────────────────────

  static setKPI(model: DepartmentModel, input: Omit<DepartmentKPI, 'id'>): DepartmentModel {
    return { ...model, kpis: [...model.kpis, { ...input, id: nextId('kpi') }], updatedAt: Date.now() };
  }

  static updateKPI(model: DepartmentModel, kpiId: string, patch: Partial<Pick<DepartmentKPI, 'current' | 'target'>>): DepartmentModel {
    const index = model.kpis.findIndex(k => k.id === kpiId);
    if (index === -1) throw new Error(`[DepartmentEngine] KPI "${kpiId}" does not exist`);
    const updated = { ...model.kpis[index], ...patch };
    return {
      ...model,
      kpis: [...model.kpis.slice(0, index), updated, ...model.kpis.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static setFinancial(model: DepartmentModel, patch: Partial<DepartmentFinancial>): DepartmentModel {
    return { ...model, financial: { ...model.financial, ...patch }, updatedAt: Date.now() };
  }

  static scheduleMeeting(model: DepartmentModel, input: { title: string; type: DepartmentMeeting['type']; scheduledAt: number; attendees?: AmxUid[] }): DepartmentModel {
    const meeting: DepartmentMeeting = {
      id: nextId('mtg'),
      title: (input.title ?? '').trim(),
      type: input.type,
      scheduledAt: input.scheduledAt,
      attendees: input.attendees ?? [],
    };
    return { ...model, meetings: [...model.meetings, meeting], updatedAt: Date.now() };
  }

  static updateQuality(model: DepartmentModel, patch: Partial<DepartmentQuality>): DepartmentModel {
    return { ...model, quality: { ...model.quality, ...patch }, updatedAt: Date.now() };
  }

  // ── Status lifecycle ─────────────────────────────────────────────────────────

  static activate(model: DepartmentModel, actorId?: AmxUid): DepartmentModel {
    return { ...model, status: 'active', updatedAt: Date.now() };
  }

  static deactivate(model: DepartmentModel, actorId?: AmxUid): DepartmentModel {
    return { ...model, status: 'inactive', updatedAt: Date.now() };
  }

  static close(model: DepartmentModel, actorId?: AmxUid): DepartmentModel {
    return { ...model, status: 'closed', updatedAt: Date.now() };
  }

  // ── Read conveniences ────────────────────────────────────────────────────────

  static getUnits(model: DepartmentModel): DepartmentUnit[] { return model.units; }
  static getClinics(model: DepartmentModel): DepartmentClinic[] { return model.clinics; }
  static getTeams(model: DepartmentModel): DepartmentTeam[] { return model.teams; }
  static getWorkspaces(model: DepartmentModel): DepartmentWorkspace[] { return model.workspaces; }
  static getServices(model: DepartmentModel): { id: string; name: string; status: 'active' | 'inactive' }[] { return model.services; }
  static getLeadership(model: DepartmentModel): DepartmentLeadership { return model.leadership; }
  static getProtocols(model: DepartmentModel): DepartmentProtocol[] { return model.protocols; }
  static getActiveProtocols(model: DepartmentModel): DepartmentProtocol[] {
    return model.protocols.filter(p => p.status === 'active');
  }
  static getKPIs(model: DepartmentModel): DepartmentKPI[] { return model.kpis; }
  static getDashboardSummary(model: DepartmentModel): {
    name: string;
    type: DepartmentType;
    category: DepartmentCategory;
    status: DepartmentStatus;
    units: number;
    clinics: number;
    teams: number;
    workspaces: number;
    services: number;
    resources: number;
    activeProtocols: number;
    openConsultations: number;
    activeReferrals: number;
    kpis: number;
    mortality: number;
    morbidity: number;
  } {
    return {
      name: model.name,
      type: model.type,
      category: model.category,
      status: model.status,
      units: model.units.length,
      clinics: model.clinics.length,
      teams: model.teams.length,
      workspaces: model.workspaces.length,
      services: model.services.length,
      resources: model.resources.length,
      activeProtocols: DepartmentEngine.getActiveProtocols(model).length,
      openConsultations: DepartmentEngine.getOpenConsultations(model).length,
      activeReferrals: DepartmentEngine.getActiveReferrals(model).length,
      kpis: model.kpis.length,
      mortality: model.quality.mortality,
      morbidity: model.quality.morbidity,
    };
  }
}

/** Department types grouped by category for registry / pickers. */
export const DEPARTMENT_TYPES: Readonly<Record<DepartmentCategory, readonly DepartmentType[]>> = {
  clinical: [
    'emergency', 'outpatient', 'inpatient', 'surgery', 'medicine', 'pediatrics',
    'obstetrics_gynaecology', 'psychiatry', 'icu', 'nicu', 'hdu', 'infection_control',
    'dental', 'eye', 'ent', 'dermatology', 'oncology', 'cardiology', 'neurology',
    'renal', 'pulmonology', 'gastroenterology', 'endocrinology', 'rheumatology',
    'hematology', 'palliative_care', 'pain_management',
  ],
  diagnostic: ['radiology', 'laboratory', 'blood_bank'],
  therapeutic: ['physiotherapy'],
  support: [
    'pharmacy', 'nursing', 'mortuary', 'laundry', 'kitchen', 'maintenance', 'ambulance',
  ],
  administrative: ['administration', 'hr', 'finance', 'it', 'quality'],
  academic: ['research', 'training'],
};

export default DepartmentEngine;
