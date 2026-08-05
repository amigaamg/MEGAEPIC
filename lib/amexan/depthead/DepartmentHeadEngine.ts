// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN DEPARTMENT HEAD ENGINE (BOOK VI-C) — Engine No. 13
//
// "Clinical Governance at Department Level"
//
// The Department Head is not merely the most senior doctor. Within AMEXAN the
// Department Head is the Chief Executive Officer of a clinical domain:
// responsible for ensuring that patient care, workforce, education, research,
// quality, and departmental operations function as one coherent ecosystem.
//
// Position in the Constitutional Hierarchy:
//   Facility Administrator → Clinical Operations Administrator → Medical
//   Director → Department Head → Consultants → Senior Registrars → Registrars →
//   Medical Officers → Interns → Students → Nurses (departmental leadership) →
//   Pharmacists → Laboratory staff → Radiology staff → Allied health →
//   Administrative officers.
//
// Constitutional vision: every department becomes an independent, intelligently
// managed clinical enterprise with its own operational command center,
// education hub, research platform, quality system, analytics engine, and AI
// assistant — while remaining fully synchronized with the wider hospital.
//
// Constitutional Restrictions (enforced, never commented away):
//   A Department Head cannot change hospital branding, create new organizations,
//   modify constitutional engines, access unrelated departments, change
//   hospital-wide financial policies, alter global permissions, view restricted
//   HR records outside their department, delete audit logs, or override patient
//   consent policies.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Departments that may have heads (every department is treated identically) ─

export type DepartmentKind = 'clinical' | 'diagnostic' | 'support' | 'administrative';

export const DEPARTMENT_KINDS: readonly DepartmentKind[] = ['clinical', 'diagnostic', 'support', 'administrative'];

export type HeadableDepartment =
  | 'internal_medicine' | 'general_surgery' | 'orthopedics' | 'neurosurgery'
  | 'cardiothoracic_surgery' | 'pediatric_surgery' | 'urology' | 'plastic_surgery'
  | 'ent' | 'ophthalmology' | 'obstetrics_gynaecology' | 'pediatrics'
  | 'emergency_medicine' | 'family_medicine' | 'oncology' | 'cardiology'
  | 'neurology' | 'nephrology' | 'psychiatry' | 'dermatology'
  | 'icu' | 'hdu' | 'burns_unit' | 'palliative_care'
  | 'laboratory_medicine' | 'radiology' | 'nuclear_medicine' | 'blood_bank' | 'pathology'
  | 'pharmacy' | 'physiotherapy' | 'occupational_therapy' | 'nutrition'
  | 'biomedical_engineering' | 'infection_control'
  | 'hr' | 'ict' | 'finance' | 'procurement' | 'quality' | 'research' | 'education';

export const HEADABLE_DEPARTMENTS: readonly HeadableDepartment[] = [
  'internal_medicine', 'general_surgery', 'orthopedics', 'neurosurgery',
  'cardiothoracic_surgery', 'pediatric_surgery', 'urology', 'plastic_surgery',
  'ent', 'ophthalmology', 'obstetrics_gynaecology', 'pediatrics',
  'emergency_medicine', 'family_medicine', 'oncology', 'cardiology',
  'neurology', 'nephrology', 'psychiatry', 'dermatology',
  'icu', 'hdu', 'burns_unit', 'palliative_care',
  'laboratory_medicine', 'radiology', 'nuclear_medicine', 'blood_bank', 'pathology',
  'pharmacy', 'physiotherapy', 'occupational_therapy', 'nutrition',
  'biomedical_engineering', 'infection_control',
  'hr', 'ict', 'finance', 'procurement', 'quality', 'research', 'education',
];

export const DEPARTMENT_KIND_BY_DEPARTMENT: Readonly<Record<HeadableDepartment, DepartmentKind>> = {
  internal_medicine: 'clinical',
  general_surgery: 'clinical',
  orthopedics: 'clinical',
  neurosurgery: 'clinical',
  cardiothoracic_surgery: 'clinical',
  pediatric_surgery: 'clinical',
  urology: 'clinical',
  plastic_surgery: 'clinical',
  ent: 'clinical',
  ophthalmology: 'clinical',
  obstetrics_gynaecology: 'clinical',
  pediatrics: 'clinical',
  emergency_medicine: 'clinical',
  family_medicine: 'clinical',
  oncology: 'clinical',
  cardiology: 'clinical',
  neurology: 'clinical',
  nephrology: 'clinical',
  psychiatry: 'clinical',
  dermatology: 'clinical',
  icu: 'clinical',
  hdu: 'clinical',
  burns_unit: 'clinical',
  palliative_care: 'clinical',
  laboratory_medicine: 'diagnostic',
  radiology: 'diagnostic',
  nuclear_medicine: 'diagnostic',
  blood_bank: 'diagnostic',
  pathology: 'diagnostic',
  pharmacy: 'support',
  physiotherapy: 'support',
  occupational_therapy: 'support',
  nutrition: 'support',
  biomedical_engineering: 'support',
  infection_control: 'support',
  hr: 'administrative',
  ict: 'administrative',
  finance: 'administrative',
  procurement: 'administrative',
  quality: 'administrative',
  research: 'administrative',
  education: 'administrative',
};

export const DEPARTMENT_DISPLAY_NAMES: Readonly<Record<HeadableDepartment, string>> = {
  internal_medicine: 'Internal Medicine',
  general_surgery: 'General Surgery',
  orthopedics: 'Orthopaedics',
  neurosurgery: 'Neurosurgery',
  cardiothoracic_surgery: 'Cardiothoracic Surgery',
  pediatric_surgery: 'Paediatric Surgery',
  urology: 'Urology',
  plastic_surgery: 'Plastic Surgery',
  ent: 'ENT',
  ophthalmology: 'Ophthalmology',
  obstetrics_gynaecology: 'Obstetrics & Gynaecology',
  pediatrics: 'Paediatrics',
  emergency_medicine: 'Emergency Medicine',
  family_medicine: 'Family Medicine',
  oncology: 'Oncology',
  cardiology: 'Cardiology',
  neurology: 'Neurology',
  nephrology: 'Nephrology',
  psychiatry: 'Psychiatry',
  dermatology: 'Dermatology',
  icu: 'ICU',
  hdu: 'HDU',
  burns_unit: 'Burns Unit',
  palliative_care: 'Palliative Care',
  laboratory_medicine: 'Laboratory Medicine',
  radiology: 'Radiology',
  nuclear_medicine: 'Nuclear Medicine',
  blood_bank: 'Blood Bank',
  pathology: 'Pathology',
  pharmacy: 'Pharmacy',
  physiotherapy: 'Physiotherapy',
  occupational_therapy: 'Occupational Therapy',
  nutrition: 'Nutrition',
  biomedical_engineering: 'Biomedical Engineering',
  infection_control: 'Infection Prevention & Control',
  hr: 'HR',
  ict: 'ICT',
  finance: 'Finance',
  procurement: 'Procurement',
  quality: 'Quality',
  research: 'Research',
  education: 'Education',
};

// ── Staff tiers ────────────────────────────────────────────────────────────────

export type DepartmentStaffTier =
  | 'consultant' | 'senior_registrar' | 'registrar' | 'medical_officer'
  | 'intern' | 'student' | 'nurse_leadership' | 'pharmacist'
  | 'laboratory_staff' | 'radiology_staff' | 'allied_health' | 'administrative_officer';

export interface DepartmentStaffRecord {
  personId: AmxUid;
  name: string;
  tier: DepartmentStaffTier;
  onDuty: boolean;
  onLeave: boolean;
  shiftCoveragePercent: number;
  fatigueIndicator: 'low' | 'moderate' | 'high' | 'critical';
  competencyLevel: 'observed' | 'supervised' | 'independent' | 'expert' | 'trainer';
  assignments: number;
  productivityIndex: number;
}

// ── Digital twin structural refs ───────────────────────────────────────────────

export interface UnitRef { id: string; name: string; code: string; location: string }
export interface ClinicRef { id: string; name: string; code: string; schedule: string }
export interface WardRef { id: string; name: string; code: string; capacity: number; occupancy: number }
export interface BedRef { id: string; wardId?: string; label: string; status: 'available' | 'occupied' | 'maintenance' }
export interface DepartmentEquipment {
  id: string;
  name: string;
  category: 'ventilator' | 'ultrasound' | 'endoscopy' | 'theatre_equipment' | 'laparoscopic_tower' | 'monitor' | 'defibrillator' | 'other';
  status: 'operational' | 'maintenance' | 'faulted' | 'downtime';
  utilizationPercent: number;
  maintenanceRequested: boolean;
}
export interface SupplyItem {
  id: string;
  name: string;
  category: 'surgical_consumable' | 'dressing' | 'medication' | 'blood_product' | 'implant' | 'other';
  stock: number;
  reorderLevel: number;
  status: 'in_stock' | 'low' | 'critical';
}

// ── Operational command center ─────────────────────────────────────────────────

export interface OperationalCommandCenter {
  currentAdmissions: number;
  activeInpatients: number;
  opdLoad: number;
  emergencyReferrals: number;
  icuPatients: number;
  theatreCases: number;
  transfers: number;
  bedOccupancyPercent: number;
  waitingList: number;
  criticalAlerts: number;
}

// ── Patient intelligence (AI continuously ranks clinical urgency) ─────────────

export type PatientRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface PatientIntelligenceRecord {
  patientId: string;
  name?: string;
  riskLevel: PatientRiskLevel;
  urgencyScore: number;
  flags: ('deteriorating' | 'high_risk' | 'delayed_investigation' | 'delayed_surgery' | 'delayed_discharge' | 'mortality_review_candidate' | 'readmission')[];
  summary: string;
  lastAssessmentAt: number;
}

// ── Protocol version engine ────────────────────────────────────────────────────

export type ProtocolKind = 'clinical_pathway' | 'sop' | 'order_set' | 'antibiotic_guideline' | 'ward_round_standard' | 'referral_pathway' | 'emergency_algorithm';

export interface ProtocolVersion {
  version: number;
  content: string;
  authoredBy: AmxUid;
  authoredAt: number;
  reviewedBy?: AmxUid;
  reviewedAt?: number;
  status: 'draft' | 'approved' | 'active' | 'superseded';
}

export interface DepartmentProtocol {
  id: string;
  code: string;
  title: string;
  kind: ProtocolKind;
  versions: ProtocolVersion[];
  currentVersion: number;
  status: 'draft' | 'approved' | 'active' | 'superseded' | 'archived';
  createdAt: number;
}

// ── Quality governance ─────────────────────────────────────────────────────────

export interface QualityIndicator {
  code: string;
  name: string;
  current: number;
  target: number;
  trend: ('up' | 'down' | 'flat')[];
  unit: string;
}

export interface DepartmentAudit {
  id: string;
  title: string;
  kind: 'clinical_audit' | 'documentation_audit' | 'consent_audit' | 'infection_audit';
  status: 'planned' | 'in_progress' | 'completed';
  initiatedBy: AmxUid;
  initiatedAt: number;
  completedAt?: number;
  completionPercent: number;
  findings: number;
}

// ── Education governance ───────────────────────────────────────────────────────

export type LearnerTier = 'undergraduate' | 'resident' | 'fellow' | 'intern' | 'student';

export interface DepartmentRotation {
  id: string;
  learnerId: AmxUid;
  learnerName: string;
  tier: LearnerTier;
  startDate: number;
  endDate: number;
  supervisorId: AmxUid;
  status: 'scheduled' | 'active' | 'completed';
  approvedBy?: AmxUid;
  proceduresLogged: number;
  caseExposure: number;
  competenciesAchieved: string[];
  attendancePercent: number;
}

export interface EpaRecord {
  id: string;
  learnerId: AmxUid;
  rotationId: string;
  epa: string;
  level: 1 | 2 | 3 | 4 | 5;
  assessedBy: AmxUid;
  assessedAt: number;
  feedback?: string;
}

export interface TeachingSession {
  id: string;
  kind: 'journal_club' | 'grand_round' | 'morbidity_mortality' | 'skills_lab' | 'clinical_teaching' | 'assessment';
  title: string;
  scheduledAt: number;
  attendance: number;
  facilitatorId: AmxUid;
}

// ── Research governance ────────────────────────────────────────────────────────

export interface ResearchProject {
  id: string;
  title: string;
  ethicsApproved: boolean;
  recruitmentStatus: 'planning' | 'recruiting' | 'active' | 'closed' | 'suspended';
  publications: number;
  grants: number;
  registries: string[];
  studentProjects: number;
}

// ── Finance (departmental only — no payroll, no enterprise control) ───────────

export interface DepartmentFinance {
  revenueGenerated: number;
  costPerAdmission: number;
  costPerProcedure: number;
  implantExpenditure: number;
  drugExpenditure: number;
  equipmentUtilizationPercent: number;
  budgetConsumedPercent: number;
  insuranceMixPercent: number;
}

// ── Department AI ──────────────────────────────────────────────────────────────

export type AiTopic = 'clinical_performance' | 'education' | 'research' | 'operations';

export interface DepartmentAiAdvice {
  id: string;
  topic: AiTopic;
  advice: string;
  rationale: string;
  confidence: number;
  generatedAt: number;
  status: 'pending' | 'acknowledged' | 'actioned' | 'dismissed';
}

// ── Analytics ──────────────────────────────────────────────────────────────────

export interface DepartmentAnalyticsSnapshot {
  clinical: { admissionsPerDay: number; dischargesPerDay: number; theatreUtilizationPercent: number; mortality: number; readmissions: number };
  teaching: { studentsRotating: number; proceduresLogged: number; assessmentsCompleted: number };
  research: { publicationsPerYear: number; ongoingTrials: number };
  quality: { documentationScore: number; auditCompletionPercent: number; patientSatisfaction: number };
  operational: { waitingList: number; averageLosDays: number; bedOccupancyPercent: number };
}

// ── Communication center ───────────────────────────────────────────────────────

export type DepartmentAudience =
  | 'entire_department' | 'consultants_only' | 'residents_only' | 'students'
  | 'ward_teams' | 'specific_clinics' | 'operating_theatre' | 'pharmacy'
  | 'radiology' | 'laboratory' | 'entire_hospital';

export type DepartmentCommunicationKind = 'circular' | 'protocol_update' | 'emergency_alert' | 'meeting_invitation' | 'teaching_announcement';

export interface DepartmentCommunication {
  id: string;
  kind: DepartmentCommunicationKind;
  title: string;
  body: string;
  audience: DepartmentAudience;
  severity: 'info' | 'warning' | 'critical';
  publishedBy: AmxUid;
  publishedAt: number;
}

// ── Duty roster / meetings / publications ──────────────────────────────────────

export interface DutyRoster {
  id: string;
  title: string;
  date: number;
  entries: { personId: AmxUid; role: string; slot: string }[];
}

export interface MeetingRecord {
  id: string;
  kind: 'department_meeting' | 'morbidity_mortality' | 'grand_round' | 'journal_club' | 'business_meeting';
  title: string;
  scheduledAt: number;
  agenda: string[];
}

export interface PublicationRecord {
  id: string;
  title: string;
  kind: 'publication' | 'conference_abstract' | 'registry' | 'ai_literature_summary';
  year: number;
}

// ── HMIS / EMR oversight ───────────────────────────────────────────────────────

export interface HmisGovernance {
  wardStructureConfigured: boolean;
  clinicsConfigured: boolean;
  theatreListsManaged: boolean;
  workflowsConfigured: boolean;
  admissionRulesSet: boolean;
  dischargeStandardsSet: boolean;
  staffAllocationConfigured: boolean;
  equipmentAllocationConfigured: boolean;
}

export interface EmrOversight {
  documentationCompletenessPercent: number;
  clinicalPathwayCompliancePercent: number;
  caseMix: number;
  diagnosticAccuracyScore: number;
  consultantReviewCompletionPercent: number;
  wardRoundCompletionPercent: number;
  procedureDocumentationPercent: number;
  dischargeSummaryQualityScore: number;
}

// ── Interoperability ───────────────────────────────────────────────────────────

export type DepartmentIntegrationKind =
  | 'specialty_registry' | 'imaging_workflow' | 'laboratory_interface'
  | 'specialty_device' | 'ai_decision_support' | 'research_database' | 'national_specialty_reporting';

export interface DepartmentIntegration {
  id: string;
  kind: DepartmentIntegrationKind;
  name: string;
  status: 'healthy' | 'degraded' | 'failed' | 'monitoring';
  lastCheckAt: number;
}

// ── Audit ──────────────────────────────────────────────────────────────────────

export interface DepartmentHeadAuditEntry {
  id: string;
  at: number;
  actorId: AmxUid;
  actorName: string;
  departmentId: string;
  action: string;
  reason?: string;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface DepartmentHeadModel {
  organizationId: string;
  facilityId?: string;
  facilityAdministratorId: AmxUid;
  medicalDirectorId?: AmxUid;
  departmentId: string;
  department: HeadableDepartment;
  departmentKind: DepartmentKind;
  headId: AmxUid;
  staff: DepartmentStaffRecord[];
  units: UnitRef[];
  clinics: ClinicRef[];
  wards: WardRef[];
  beds: BedRef[];
  equipment: DepartmentEquipment[];
  supplies: SupplyItem[];
  operationalCommand: OperationalCommandCenter;
  patientIntelligence: PatientIntelligenceRecord[];
  protocols: DepartmentProtocol[];
  qualityIndicators: QualityIndicator[];
  audits: DepartmentAudit[];
  rotations: DepartmentRotation[];
  epas: EpaRecord[];
  teachingSessions: TeachingSession[];
  research: ResearchProject[];
  finance: DepartmentFinance;
  aiAdvice: DepartmentAiAdvice[];
  analytics: DepartmentAnalyticsSnapshot;
  communications: DepartmentCommunication[];
  dutyRosters: DutyRoster[];
  meetings: MeetingRecord[];
  publications: PublicationRecord[];
  hmis: HmisGovernance;
  emr: EmrOversight;
  integrations: DepartmentIntegration[];
  auditLog: DepartmentHeadAuditEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateDepartmentHeadModelInput {
  organizationId: string;
  facilityId?: string;
  facilityAdministratorId: AmxUid;
  medicalDirectorId?: AmxUid;
  departmentId: string;
  department: HeadableDepartment;
  headId: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Constitutional authority / restriction tables ──────────────────────────────

export const DEPARTMENT_HEAD_AUTHORITY: readonly string[] = [
  'assign_departmental_duties', 'approve_departmental_leave', 'create_clinic_schedules',
  'approve_departmental_protocols', 'initiate_audits', 'request_equipment',
  'allocate_departmental_resources', 'review_staff_performance', 'recommend_promotions',
  'recommend_recruitment', 'escalate_disciplinary_concerns', 'approve_student_rotations',
  'manage_teaching_programs', 'govern_department',
];

export const DEPARTMENT_HEAD_RESTRICTIONS: readonly string[] = [
  'change_hospital_branding', 'create_new_organization', 'modify_constitutional_engines',
  'access_unrelated_departments', 'change_hospital_wide_financial_policy',
  'alter_global_permissions', 'view_restricted_hr_outside_department',
  'delete_audit_logs', 'override_patient_consent_policy',
];

// ── The Engine ─────────────────────────────────────────────────────────────────

export class DepartmentHeadEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateDepartmentHeadModelInput): DepartmentHeadModel {
    if (!input.organizationId) throw new Error('[DHE] organizationId is required');
    if (!input.facilityAdministratorId) throw new Error('[DHE] facilityAdministratorId is required');
    if (!input.headId) throw new Error('[DHE] headId is required');
    if (!HEADABLE_DEPARTMENTS.includes(input.department)) {
      throw new Error(`[DHE] Department "${input.department}" cannot have a head`);
    }
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      facilityAdministratorId: input.facilityAdministratorId,
      medicalDirectorId: input.medicalDirectorId,
      departmentId: input.departmentId,
      department: input.department,
      departmentKind: DEPARTMENT_KIND_BY_DEPARTMENT[input.department],
      headId: input.headId,
      staff: [],
      units: [],
      clinics: [],
      wards: [],
      beds: [],
      equipment: [],
      supplies: [],
      operationalCommand: {
        currentAdmissions: 0,
        activeInpatients: 0,
        opdLoad: 0,
        emergencyReferrals: 0,
        icuPatients: 0,
        theatreCases: 0,
        transfers: 0,
        bedOccupancyPercent: 0,
        waitingList: 0,
        criticalAlerts: 0,
      },
      patientIntelligence: [],
      protocols: [],
      qualityIndicators: [],
      audits: [],
      rotations: [],
      epas: [],
      teachingSessions: [],
      research: [],
      finance: {
        revenueGenerated: 0,
        costPerAdmission: 0,
        costPerProcedure: 0,
        implantExpenditure: 0,
        drugExpenditure: 0,
        equipmentUtilizationPercent: 0,
        budgetConsumedPercent: 0,
        insuranceMixPercent: 0,
      },
      aiAdvice: [],
      analytics: {
        clinical: { admissionsPerDay: 0, dischargesPerDay: 0, theatreUtilizationPercent: 0, mortality: 0, readmissions: 0 },
        teaching: { studentsRotating: 0, proceduresLogged: 0, assessmentsCompleted: 0 },
        research: { publicationsPerYear: 0, ongoingTrials: 0 },
        quality: { documentationScore: 0, auditCompletionPercent: 0, patientSatisfaction: 0 },
        operational: { waitingList: 0, averageLosDays: 0, bedOccupancyPercent: 0 },
      },
      communications: [],
      dutyRosters: [],
      meetings: [],
      publications: [],
      hmis: {
        wardStructureConfigured: false,
        clinicsConfigured: false,
        theatreListsManaged: false,
        workflowsConfigured: false,
        admissionRulesSet: false,
        dischargeStandardsSet: false,
        staffAllocationConfigured: false,
        equipmentAllocationConfigured: false,
      },
      emr: {
        documentationCompletenessPercent: 0,
        clinicalPathwayCompliancePercent: 0,
        caseMix: 0,
        diagnosticAccuracyScore: 0,
        consultantReviewCompletionPercent: 0,
        wardRoundCompletionPercent: 0,
        procedureDocumentationPercent: 0,
        dischargeSummaryQualityScore: 0,
      },
      integrations: [],
      auditLog: [{ id: nextId('aud'), at: now, actorId: input.headId, actorName: 'Department Head', departmentId: input.departmentId, action: 'department_head_appointed' }],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard ─────────────────────────────────────────────────────

  static assertHead(model: DepartmentHeadModel, actorId: AmxUid): void {
    if (actorId !== model.headId) throw new Error('[DHE] Only the Department Head may perform this action');
  }

  static canDepartmentHeadPerform(model: DepartmentHeadModel, action: string): { allowed: boolean; reason?: string } {
    if (DEPARTMENT_HEAD_AUTHORITY.includes(action)) return { allowed: true };
    if (DEPARTMENT_HEAD_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        change_hospital_branding: 'Hospital branding is governed by the Facility Administration Engine.',
        create_new_organization: 'Creating organizations is a Facility Administrator authority.',
        modify_constitutional_engines: 'Constitutional engines may not be modified.',
        access_unrelated_departments: 'Department Heads govern only their assigned department.',
        change_hospital_wide_financial_policy: 'Hospital-wide financial policy is enterprise authority.',
        alter_global_permissions: 'Global permissions may not be altered.',
        view_restricted_hr_outside_department: 'Restricted HR records are outside departmental scope.',
        delete_audit_logs: 'Audit logs are append-only and may never be deleted.',
        override_patient_consent_policy: 'Patient consent policies may not be overridden.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Department Head authority.` };
  }

  static guard(model: DepartmentHeadModel, actorId: AmxUid, action: string): void {
    DepartmentHeadEngine.assertHead(model, actorId);
    const verdict = DepartmentHeadEngine.canDepartmentHeadPerform(model, action);
    if (!verdict.allowed) throw new Error(`[DHE] ${verdict.reason}`);
  }

  static audit(model: DepartmentHeadModel, actorId: AmxUid, action: string, reason?: string): DepartmentHeadModel {
    const now = Date.now();
    return {
      ...model,
      auditLog: [...model.auditLog, { id: nextId('aud'), at: now, actorId, actorName: 'Department Head', departmentId: model.departmentId, action, reason }],
      updatedAt: now,
    };
  }

  // ── Digital twin ─────────────────────────────────────────────────────────────

  static buildDepartmentDigitalTwin(model: DepartmentHeadModel): {
    department: string;
    departmentKind: DepartmentKind;
    staff: DepartmentStaffRecord[];
    units: UnitRef[];
    clinics: ClinicRef[];
    wards: WardRef[];
    theatreLists: number;
    beds: BedRef[];
    equipment: DepartmentEquipment[];
    teaching: { sessions: number; rotations: number; epas: number };
    research: ResearchProject[];
    protocols: DepartmentProtocol[];
    kpis: QualityIndicator[];
    quality: DepartmentAudit[];
    finance: DepartmentFinance;
    inventory: SupplyItem[];
    meetings: MeetingRecord[];
    rotations: DepartmentRotation[];
    dutyRosters: DutyRoster[];
    publications: PublicationRecord[];
    audits: DepartmentAudit[];
    aiIntelligence: DepartmentAiAdvice[];
    analytics: DepartmentAnalyticsSnapshot;
  } {
    return {
      department: model.department,
      departmentKind: model.departmentKind,
      staff: [...model.staff],
      units: [...model.units],
      clinics: [...model.clinics],
      wards: [...model.wards],
      theatreLists: model.dutyRosters.length,
      beds: [...model.beds],
      equipment: [...model.equipment],
      teaching: { sessions: model.teachingSessions.length, rotations: model.rotations.length, epas: model.epas.length },
      research: [...model.research],
      protocols: [...model.protocols],
      kpis: [...model.qualityIndicators],
      quality: [...model.audits],
      finance: { ...model.finance },
      inventory: [...model.supplies],
      meetings: [...model.meetings],
      rotations: [...model.rotations],
      dutyRosters: [...model.dutyRosters],
      publications: [...model.publications],
      audits: [...model.audits],
      aiIntelligence: [...model.aiAdvice],
      analytics: { ...model.analytics },
    };
  }

  // ── Operational command center ───────────────────────────────────────────────

  static updateOperationalCommand(model: DepartmentHeadModel, actorId: AmxUid, patch: Partial<OperationalCommandCenter>): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'govern_department');
    const operationalCommand = { ...model.operationalCommand, ...patch };
    return { ...DepartmentHeadEngine.audit(model, actorId, 'operational_command_updated'), operationalCommand, updatedAt: Date.now() };
  }

  static getOperationalCommandCenter(model: DepartmentHeadModel): OperationalCommandCenter {
    return { ...model.operationalCommand };
  }

  // ── Workforce ────────────────────────────────────────────────────────────────

  static upsertStaffRecord(model: DepartmentHeadModel, actorId: AmxUid, record: DepartmentStaffRecord): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'review_staff_performance');
    const staff = [...model.staff.filter(s => s.personId !== record.personId), record];
    return { ...DepartmentHeadEngine.audit(model, actorId, 'staff_record_updated', record.personId), staff, updatedAt: Date.now() };
  }

  static getWorkforceSnapshot(model: DepartmentHeadModel): {
    byTier: Partial<Record<DepartmentStaffTier, number>>;
    total: number;
    onDuty: number;
    onLeave: number;
    vacancies: number;
    highFatigue: number;
    shiftCoverageAvg: number;
  } {
    const byTier: Partial<Record<DepartmentStaffTier, number>> = {};
    let onDuty = 0, onLeave = 0, highFatigue = 0, shiftCoverageSum = 0;
    for (const s of model.staff) {
      byTier[s.tier] = (byTier[s.tier] ?? 0) + 1;
      if (s.onDuty) onDuty += 1;
      if (s.onLeave) onLeave += 1;
      if (s.fatigueIndicator === 'high' || s.fatigueIndicator === 'critical') highFatigue += 1;
      shiftCoverageSum += s.shiftCoveragePercent;
    }
    return {
      byTier,
      total: model.staff.length,
      onDuty,
      onLeave,
      vacancies: 0,
      highFatigue,
      shiftCoverageAvg: model.staff.length ? Math.round(shiftCoverageSum / model.staff.length) : 0,
    };
  }

  static assignDuty(model: DepartmentHeadModel, actorId: AmxUid, personId: AmxUid, duty: string): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'assign_departmental_duties');
    return DepartmentHeadEngine.audit(model, actorId, 'duty_assigned', `${personId}: ${duty}`);
  }

  static approveLeave(model: DepartmentHeadModel, actorId: AmxUid, personId: AmxUid): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'approve_departmental_leave');
    const staff = model.staff.map(s => s.personId === personId ? { ...s, onLeave: true, onDuty: false } : s);
    return { ...DepartmentHeadEngine.audit(model, actorId, 'leave_approved', personId), staff, updatedAt: Date.now() };
  }

  static createClinicSchedule(model: DepartmentHeadModel, actorId: AmxUid, clinic: ClinicRef): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'create_clinic_schedules');
    const clinics = [...model.clinics.filter(c => c.id !== clinic.id), clinic];
    return { ...DepartmentHeadEngine.audit(model, actorId, 'clinic_schedule_created', clinic.name), clinics, updatedAt: Date.now() };
  }

  static recommendPromotion(model: DepartmentHeadModel, actorId: AmxUid, personId: AmxUid, reason: string): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'recommend_promotions');
    return DepartmentHeadEngine.audit(model, actorId, 'promotion_recommended', `${personId}: ${reason}`);
  }

  static recommendRecruitment(model: DepartmentHeadModel, actorId: AmxUid, role: string, reason: string): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'recommend_recruitment');
    return DepartmentHeadEngine.audit(model, actorId, 'recruitment_recommended', `${role}: ${reason}`);
  }

  static escalateDisciplinary(model: DepartmentHeadModel, actorId: AmxUid, personId: AmxUid, concern: string): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'escalate_disciplinary_concerns');
    return DepartmentHeadEngine.audit(model, actorId, 'disciplinary_escalated', `${personId}: ${concern}`);
  }

  // ── Patient intelligence ─────────────────────────────────────────────────────

  static registerPatientIntelligence(model: DepartmentHeadModel, record: PatientIntelligenceRecord): DepartmentHeadModel {
    const patientIntelligence = [...model.patientIntelligence.filter(p => p.patientId !== record.patientId), record];
    return { ...model, patientIntelligence, updatedAt: Date.now() };
  }

  /** AI continuously ranks clinical urgency — highest urgency first. */
  static getPatientIntelligence(model: DepartmentHeadModel, sortByUrgency: boolean = true): PatientIntelligenceRecord[] {
    const list = [...model.patientIntelligence];
    if (sortByUrgency) list.sort((a, b) => b.urgencyScore - a.urgencyScore);
    return list;
  }

  static getSickestPatients(model: DepartmentHeadModel, limit: number = 10): PatientIntelligenceRecord[] {
    return model.patientIntelligence
      .filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high')
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, limit);
  }

  static getDelayed(model: DepartmentHeadModel, kind: 'delayed_investigation' | 'delayed_surgery' | 'delayed_discharge'): PatientIntelligenceRecord[] {
    return model.patientIntelligence.filter(p => p.flags.includes(kind));
  }

  static getMortalityReviewCandidates(model: DepartmentHeadModel): PatientIntelligenceRecord[] {
    return model.patientIntelligence.filter(p => p.flags.includes('mortality_review_candidate'));
  }

  static getReadmissions(model: DepartmentHeadModel): PatientIntelligenceRecord[] {
    return model.patientIntelligence.filter(p => p.flags.includes('readmission'));
  }

  // ── Protocol version engine ──────────────────────────────────────────────────

  static createProtocol(model: DepartmentHeadModel, actorId: AmxUid, input: { code: string; title: string; kind: ProtocolKind; content: string }): { model: DepartmentHeadModel; protocol: DepartmentProtocol } {
    DepartmentHeadEngine.guard(model, actorId, 'approve_departmental_protocols');
    const now = Date.now();
    const version: ProtocolVersion = { version: 1, content: input.content, authoredBy: actorId, authoredAt: now, status: 'draft' };
    const protocol: DepartmentProtocol = {
      id: nextId('prt'), code: input.code, title: input.title, kind: input.kind,
      versions: [version], currentVersion: 1, status: 'draft', createdAt: now,
    };
    return { model: { ...DepartmentHeadEngine.audit(model, actorId, 'protocol_created', input.title), protocols: [...model.protocols, protocol], updatedAt: now }, protocol };
  }

  /** Version-controlled: a new version never destroys the prior state. */
  static newProtocolVersion(model: DepartmentHeadModel, actorId: AmxUid, protocolId: string, content: string): { model: DepartmentHeadModel; version: ProtocolVersion } {
    DepartmentHeadEngine.guard(model, actorId, 'approve_departmental_protocols');
    const protocol = model.protocols.find(p => p.id === protocolId);
    if (!protocol) throw new Error('[DHE] Protocol not found');
    const now = Date.now();
    const nextVersionNumber = protocol.versions.length + 1;
    const version: ProtocolVersion = { version: nextVersionNumber, content, authoredBy: actorId, authoredAt: now, status: 'draft' };
    const protocols = model.protocols.map(p =>
      p.id === protocolId ? { ...p, versions: [...p.versions, version], currentVersion: nextVersionNumber } : p,
    );
    return { model: { ...DepartmentHeadEngine.audit(model, actorId, 'protocol_version_created', `${protocol.title} v${nextVersionNumber}`), protocols, updatedAt: now }, version };
  }

  static approveProtocol(model: DepartmentHeadModel, actorId: AmxUid, protocolId: string, version: number): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'approve_departmental_protocols');
    const now = Date.now();
    const protocols = model.protocols.map(p => {
      if (p.id !== protocolId) return p;
      const versions = p.versions.map(v =>
        v.version === version ? { ...v, status: 'approved' as const, reviewedBy: actorId, reviewedAt: now } : v,
      );
      return { ...p, versions };
    });
    return { ...DepartmentHeadEngine.audit(model, actorId, 'protocol_approved', `v${version}`), protocols, updatedAt: now };
  }

  static activateProtocol(model: DepartmentHeadModel, actorId: AmxUid, protocolId: string, version: number): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'approve_departmental_protocols');
    const now = Date.now();
    const protocols = model.protocols.map(p => {
      if (p.id !== protocolId) return p;
      const versions = p.versions.map(v => {
        if (v.version === version) return { ...v, status: 'active' as const };
        if (v.status === 'active') return { ...v, status: 'superseded' as const };
        return v;
      });
      return { ...p, versions, status: 'active' as const, currentVersion: version };
    });
    return { ...DepartmentHeadEngine.audit(model, actorId, 'protocol_activated', `v${version}`), protocols, updatedAt: now };
  }

  static getProtocolVersions(model: DepartmentHeadModel, protocolId: string): ProtocolVersion[] {
    const protocol = model.protocols.find(p => p.id === protocolId);
    return protocol ? [...protocol.versions] : [];
  }

  static getActiveProtocols(model: DepartmentHeadModel): DepartmentProtocol[] {
    return model.protocols.filter(p => p.status === 'active');
  }

  // ── Quality governance ───────────────────────────────────────────────────────

  static upsertQualityIndicator(model: DepartmentHeadModel, actorId: AmxUid, indicator: QualityIndicator): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'initiate_audits');
    const qualityIndicators = [...model.qualityIndicators.filter(q => q.code !== indicator.code), indicator];
    return { ...DepartmentHeadEngine.audit(model, actorId, 'quality_indicator_updated', indicator.name), qualityIndicators, updatedAt: Date.now() };
  }

  static getQualityDashboard(model: DepartmentHeadModel): QualityIndicator[] {
    return [...model.qualityIndicators];
  }

  static initiateAudit(model: DepartmentHeadModel, actorId: AmxUid, title: string, kind: DepartmentAudit['kind']): { model: DepartmentHeadModel; audit: DepartmentAudit } {
    DepartmentHeadEngine.guard(model, actorId, 'initiate_audits');
    const audit: DepartmentAudit = { id: nextId('aud'), title, kind, status: 'in_progress', initiatedBy: actorId, initiatedAt: Date.now(), completionPercent: 0, findings: 0 };
    return { model: { ...DepartmentHeadEngine.audit(model, actorId, 'audit_initiated', title), audits: [...model.audits, audit], updatedAt: Date.now() }, audit };
  }

  static completeAudit(model: DepartmentHeadModel, actorId: AmxUid, auditId: string, completionPercent: number, findings: number): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'initiate_audits');
    const now = Date.now();
    const audits = model.audits.map(a =>
      a.id === auditId ? { ...a, status: 'completed' as const, completionPercent, findings, completedAt: now } : a,
    );
    return { ...DepartmentHeadEngine.audit(model, actorId, 'audit_completed', auditId), audits, updatedAt: now };
  }

  // ── Education governance ─────────────────────────────────────────────────────

  static registerRotation(model: DepartmentHeadModel, actorId: AmxUid, input: Omit<DepartmentRotation, 'id' | 'status' | 'approvedBy'>): { model: DepartmentHeadModel; rotation: DepartmentRotation } {
    DepartmentHeadEngine.guard(model, actorId, 'approve_student_rotations');
    const rotation: DepartmentRotation = { ...input, id: nextId('rot'), status: 'scheduled' };
    return { model: { ...DepartmentHeadEngine.audit(model, actorId, 'rotation_registered', input.learnerName), rotations: [...model.rotations, rotation], updatedAt: Date.now() }, rotation };
  }

  static approveRotation(model: DepartmentHeadModel, actorId: AmxUid, rotationId: string): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'approve_student_rotations');
    const now = Date.now();
    const rotations = model.rotations.map(r => r.id === rotationId ? { ...r, status: 'active' as const, approvedBy: actorId } : r);
    return { ...DepartmentHeadEngine.audit(model, actorId, 'rotation_approved', rotationId), rotations, updatedAt: now };
  }

  static logProcedure(model: DepartmentHeadModel, actorId: AmxUid, learnerId: AmxUid, rotationId: string, procedure: string): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'manage_teaching_programs');
    const rotations = model.rotations.map(r =>
      r.id === rotationId && r.learnerId === learnerId ? { ...r, proceduresLogged: r.proceduresLogged + 1 } : r,
    );
    return { ...DepartmentHeadEngine.audit(model, actorId, 'procedure_logged', `${learnerId}: ${procedure}`), rotations, updatedAt: Date.now() };
  }

  static recordEpa(model: DepartmentHeadModel, actorId: AmxUid, input: { learnerId: AmxUid; rotationId: string; epa: string; level: EpaRecord['level'] }): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'manage_teaching_programs');
    const record: EpaRecord = { id: nextId('epa'), learnerId: input.learnerId, rotationId: input.rotationId, epa: input.epa, level: input.level, assessedBy: actorId, assessedAt: Date.now() };
    return { ...DepartmentHeadEngine.audit(model, actorId, 'epa_assessed', `${input.learnerId}: ${input.epa}`), epas: [...model.epas, record], updatedAt: Date.now() };
  }

  static scheduleTeachingSession(model: DepartmentHeadModel, actorId: AmxUid, input: Omit<TeachingSession, 'id'>): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'manage_teaching_programs');
    const session: TeachingSession = { ...input, id: nextId('tea') };
    return { ...DepartmentHeadEngine.audit(model, actorId, 'teaching_session_scheduled', input.title), teachingSessions: [...model.teachingSessions, session], updatedAt: Date.now() };
  }

  static getEducationProgress(model: DepartmentHeadModel): { rotations: DepartmentRotation[]; epas: EpaRecord[]; totalProcedures: number; totalCaseExposure: number; avgAttendance: number } {
    const totalProcedures = model.rotations.reduce((a, r) => a + r.proceduresLogged, 0);
    const totalCaseExposure = model.rotations.reduce((a, r) => a + r.caseExposure, 0);
    const avgAttendance = model.rotations.length ? Math.round(model.rotations.reduce((a, r) => a + r.attendancePercent, 0) / model.rotations.length) : 0;
    return { rotations: [...model.rotations], epas: [...model.epas], totalProcedures, totalCaseExposure, avgAttendance };
  }

  // ── Research governance ──────────────────────────────────────────────────────

  static registerResearchProject(model: DepartmentHeadModel, actorId: AmxUid, input: Omit<ResearchProject, 'id'>): { model: DepartmentHeadModel; project: ResearchProject } {
    DepartmentHeadEngine.guard(model, actorId, 'govern_department');
    const project: ResearchProject = { ...input, id: nextId('rsc') };
    return { model: { ...DepartmentHeadEngine.audit(model, actorId, 'research_project_registered', input.title), research: [...model.research, project], updatedAt: Date.now() }, project };
  }

  static registerPublication(model: DepartmentHeadModel, actorId: AmxUid, title: string, kind: PublicationRecord['kind']): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'govern_department');
    const publication: PublicationRecord = { id: nextId('pub'), title, kind, year: new Date().getFullYear() };
    return { ...DepartmentHeadEngine.audit(model, actorId, 'publication_registered', title), publications: [...model.publications, publication], updatedAt: Date.now() };
  }

  static getResearchDashboard(model: DepartmentHeadModel): { projects: ResearchProject[]; publications: PublicationRecord[]; activeTrials: number; ethicsApproved: number; studentProjects: number } {
    return {
      projects: [...model.research],
      publications: [...model.publications],
      activeTrials: model.research.filter(p => p.recruitmentStatus === 'recruiting' || p.recruitmentStatus === 'active').length,
      ethicsApproved: model.research.filter(p => p.ethicsApproved).length,
      studentProjects: model.research.reduce((a, p) => a + p.studentProjects, 0),
    };
  }

  // ── Department resources ─────────────────────────────────────────────────────

  static registerEquipment(model: DepartmentHeadModel, actorId: AmxUid, input: Omit<DepartmentEquipment, 'id' | 'maintenanceRequested'>): { model: DepartmentHeadModel; equipment: DepartmentEquipment } {
    DepartmentHeadEngine.guard(model, actorId, 'request_equipment');
    const equipment: DepartmentEquipment = { ...input, id: nextId('eq'), maintenanceRequested: false };
    return { model: { ...DepartmentHeadEngine.audit(model, actorId, 'equipment_registered', input.name), equipment: [...model.equipment, equipment], updatedAt: Date.now() }, equipment };
  }

  /** Maintenance requests integrate directly with Biomedical Engineering. */
  static requestMaintenance(model: DepartmentHeadModel, actorId: AmxUid, equipmentId: string): { model: DepartmentHeadModel; requestId: string } {
    DepartmentHeadEngine.guard(model, actorId, 'request_equipment');
    const now = Date.now();
    const equipment = model.equipment.map(e =>
      e.id === equipmentId ? { ...e, maintenanceRequested: true, status: 'maintenance' as const } : e,
    );
    return {
      model: { ...DepartmentHeadEngine.audit(model, actorId, 'maintenance_requested', equipmentId), equipment, updatedAt: now },
      requestId: nextId('mnt'),
    };
  }

  static registerSupply(model: DepartmentHeadModel, actorId: AmxUid, input: Omit<SupplyItem, 'id' | 'status'>): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'allocate_departmental_resources');
    const status: SupplyItem['status'] = input.stock <= 0 ? 'critical' : input.stock <= input.reorderLevel ? 'low' : 'in_stock';
    const supply: SupplyItem = { ...input, id: nextId('sup'), status };
    return { ...DepartmentHeadEngine.audit(model, actorId, 'supply_registered', input.name), supplies: [...model.supplies, supply], updatedAt: Date.now() };
  }

  static consumeSupply(model: DepartmentHeadModel, actorId: AmxUid, supplyId: string, quantity: number): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'allocate_departmental_resources');
    const supplies = model.supplies.map(s => {
      if (s.id !== supplyId) return s;
      const stock = Math.max(0, s.stock - quantity);
      const status: SupplyItem['status'] = stock <= 0 ? 'critical' : stock <= s.reorderLevel ? 'low' : 'in_stock';
      return { ...s, stock, status };
    });
    return { ...DepartmentHeadEngine.audit(model, actorId, 'supply_consumed', `${supplyId}: ${quantity}`), supplies, updatedAt: Date.now() };
  }

  static getCriticalSupplies(model: DepartmentHeadModel): SupplyItem[] {
    return model.supplies.filter(s => s.status !== 'in_stock');
  }

  // ── Financial oversight (departmental only) ─────────────────────────────────

  static updateFinance(model: DepartmentHeadModel, actorId: AmxUid, patch: Partial<DepartmentFinance>): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'govern_department');
    const finance = { ...model.finance, ...patch };
    return { ...DepartmentHeadEngine.audit(model, actorId, 'finance_updated'), finance, updatedAt: Date.now() };
  }

  static getDepartmentFinance(model: DepartmentHeadModel): DepartmentFinance {
    return { ...model.finance };
  }

  // ── Department AI ────────────────────────────────────────────────────────────

  static generateAiAdvice(model: DepartmentHeadModel, input: { topic: AiTopic; advice: string; rationale: string; confidence: number }): { model: DepartmentHeadModel; advice: DepartmentAiAdvice } {
    const advice: DepartmentAiAdvice = { id: nextId('ai'), topic: input.topic, advice: input.advice, rationale: input.rationale, confidence: input.confidence, generatedAt: Date.now(), status: 'pending' };
    return { model: { ...model, aiAdvice: [...model.aiAdvice, advice], updatedAt: Date.now() }, advice };
  }

  static respondToAiAdvice(model: DepartmentHeadModel, actorId: AmxUid, adviceId: string, status: DepartmentAiAdvice['status']): DepartmentHeadModel {
    const aiAdvice = model.aiAdvice.map(a => a.id === adviceId ? { ...a, status } : a);
    return { ...DepartmentHeadEngine.audit(model, actorId, 'ai_advice_responded', adviceId), aiAdvice, updatedAt: Date.now() };
  }

  static getPendingAiAdvice(model: DepartmentHeadModel): DepartmentAiAdvice[] {
    return model.aiAdvice.filter(a => a.status === 'pending');
  }

  // ── Analytics ────────────────────────────────────────────────────────────────

  static updateAnalytics(model: DepartmentHeadModel, actorId: AmxUid, patch: Partial<DepartmentAnalyticsSnapshot>): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'govern_department');
    const analytics = { ...model.analytics, ...patch };
    return { ...DepartmentHeadEngine.audit(model, actorId, 'analytics_updated'), analytics, updatedAt: Date.now() };
  }

  static getAnalytics(model: DepartmentHeadModel): DepartmentAnalyticsSnapshot {
    return { ...model.analytics };
  }

  // ── Communication center ─────────────────────────────────────────────────────

  static sendCommunication(model: DepartmentHeadModel, actorId: AmxUid, input: Omit<DepartmentCommunication, 'id' | 'publishedBy' | 'publishedAt'>): { model: DepartmentHeadModel; communication: DepartmentCommunication } {
    DepartmentHeadEngine.guard(model, actorId, 'govern_department');
    if (input.audience === 'entire_hospital' && input.severity !== 'info') {
      throw new Error('[DHE] Hospital-wide communications with elevated severity require Facility Administration approval');
    }
    const communication: DepartmentCommunication = { ...input, id: nextId('com'), publishedBy: actorId, publishedAt: Date.now() };
    return { model: { ...DepartmentHeadEngine.audit(model, actorId, 'communication_published', input.title), communications: [...model.communications, communication], updatedAt: Date.now() }, communication };
  }

  static getCommunications(model: DepartmentHeadModel, audience?: DepartmentAudience): DepartmentCommunication[] {
    return model.communications.filter(c => !audience || c.audience === audience);
  }

  // ── Duty rosters & meetings ──────────────────────────────────────────────────

  static createDutyRoster(model: DepartmentHeadModel, actorId: AmxUid, input: Omit<DutyRoster, 'id'>): { model: DepartmentHeadModel; roster: DutyRoster } {
    DepartmentHeadEngine.guard(model, actorId, 'assign_departmental_duties');
    const roster: DutyRoster = { ...input, id: nextId('rst') };
    return { model: { ...DepartmentHeadEngine.audit(model, actorId, 'duty_roster_created'), dutyRosters: [...model.dutyRosters, roster], updatedAt: Date.now() }, roster };
  }

  static scheduleMeeting(model: DepartmentHeadModel, actorId: AmxUid, input: Omit<MeetingRecord, 'id'>): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'manage_teaching_programs');
    const meeting: MeetingRecord = { ...input, id: nextId('mtg') };
    return { ...DepartmentHeadEngine.audit(model, actorId, 'meeting_scheduled', input.title), meetings: [...model.meetings, meeting], updatedAt: Date.now() };
  }

  // ── HMIS responsibilities ────────────────────────────────────────────────────

  static updateHmisGovernance(model: DepartmentHeadModel, actorId: AmxUid, patch: Partial<HmisGovernance>): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'govern_department');
    const hmis = { ...model.hmis, ...patch };
    return { ...DepartmentHeadEngine.audit(model, actorId, 'hmis_governance_updated'), hmis, updatedAt: Date.now() };
  }

  // ── EMR responsibilities (monitor, do not routinely edit) ───────────────────

  static updateEmrOversight(model: DepartmentHeadModel, actorId: AmxUid, patch: Partial<EmrOversight>): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'govern_department');
    const emr = { ...model.emr, ...patch };
    return { ...DepartmentHeadEngine.audit(model, actorId, 'emr_oversight_updated'), emr, updatedAt: Date.now() };
  }

  static getEmrOversight(model: DepartmentHeadModel): EmrOversight {
    return { ...model.emr };
  }

  /** Governed amendment workflow: the head reviews and amends through the constitutional channel, not by direct editing. */
  static requestNoteAmendment(model: DepartmentHeadModel, actorId: AmxUid, noteId: string, reason: string): { model: DepartmentHeadModel; amendmentRequestId: string } {
    DepartmentHeadEngine.guard(model, actorId, 'govern_department');
    return {
      model: DepartmentHeadEngine.audit(model, actorId, 'note_amendment_requested', `${noteId}: ${reason}`),
      amendmentRequestId: nextId('amd'),
    };
  }

  // ── Interoperability responsibilities ────────────────────────────────────────

  static registerIntegration(model: DepartmentHeadModel, actorId: AmxUid, input: Omit<DepartmentIntegration, 'id' | 'status' | 'lastCheckAt'>): { model: DepartmentHeadModel; integration: DepartmentIntegration } {
    DepartmentHeadEngine.guard(model, actorId, 'govern_department');
    const integration: DepartmentIntegration = { ...input, id: nextId('int'), status: 'monitoring', lastCheckAt: Date.now() };
    return { model: { ...DepartmentHeadEngine.audit(model, actorId, 'integration_registered', input.name), integrations: [...model.integrations, integration], updatedAt: Date.now() }, integration };
  }

  static setIntegrationHealth(model: DepartmentHeadModel, actorId: AmxUid, integrationId: string, status: DepartmentIntegration['status']): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'govern_department');
    const now = Date.now();
    const integrations = model.integrations.map(i => i.id === integrationId ? { ...i, status, lastCheckAt: now } : i);
    return { ...DepartmentHeadEngine.audit(model, actorId, 'integration_health_updated', integrationId), integrations, updatedAt: now };
  }

  static getIntegrationHealth(model: DepartmentHeadModel): DepartmentIntegration[] {
    return model.integrations.filter(i => i.status !== 'healthy');
  }

  // ── Constitutional restrictions (enforced) ───────────────────────────────────

  static changeHospitalBranding(model: DepartmentHeadModel, actorId: AmxUid): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'change_hospital_branding');
    return model;
  }

  static createNewOrganization(model: DepartmentHeadModel, actorId: AmxUid): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'create_new_organization');
    return model;
  }

  static modifyConstitutionalEngines(model: DepartmentHeadModel, actorId: AmxUid): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'modify_constitutional_engines');
    return model;
  }

  static accessOtherDepartment(model: DepartmentHeadModel, actorId: AmxUid): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'access_unrelated_departments');
    return model;
  }

  static changeHospitalWideFinancialPolicy(model: DepartmentHeadModel, actorId: AmxUid): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'change_hospital_wide_financial_policy');
    return model;
  }

  static alterGlobalPermissions(model: DepartmentHeadModel, actorId: AmxUid): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'alter_global_permissions');
    return model;
  }

  static viewRestrictedHrOutsideDepartment(model: DepartmentHeadModel, actorId: AmxUid): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'view_restricted_hr_outside_department');
    return model;
  }

  static deleteAuditLog(model: DepartmentHeadModel, actorId: AmxUid): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'delete_audit_logs');
    return model;
  }

  static overrideConsentPolicy(model: DepartmentHeadModel, actorId: AmxUid): DepartmentHeadModel {
    DepartmentHeadEngine.guard(model, actorId, 'override_patient_consent_policy');
    return model;
  }
}
