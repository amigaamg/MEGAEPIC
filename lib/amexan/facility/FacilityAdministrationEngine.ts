// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN FACILITY ADMINISTRATION ENGINE (BOOK V) — Engine No. 23
//
// "The Digital Chief Operating Officer of the Hospital"
//
// The Facility Administrator is NOT a user manager. The Facility Administrator
// is the digital COO: to digitally govern, configure, monitor, optimize,
// secure, and continuously improve the entire healthcare organization while
// preserving clinical independence and constitutional integrity.
//
// Constitutional Principles:
//   P1  The Facility Admin Never Builds the Hospital.
//       The hospital already exists. AMEXAN digitizes it:
//         Register Facility → Connect Existing Systems → Import Workforce →
//         Import Departments → Import Wards → Import Clinics → Import Services →
//         Import Assets → Validate → Go Live
//   P2  Existing HMIS/EMR is respected. If the hospital already has OpenMRS,
//       OpenEMR, Bahmni, DHIS2, Epic, Cerner, Meditech, custom PostgreSQL/SQL
//       Server/Oracle, FHIR, or CSV — AMEXAN imports. Otherwise AMEXAN
//       provisions everything.
//   P3  Workforce Import. The admin never manually creates 300 doctors.
//       AMEXAN reads existing HR/HMIS/EMR, generates AMX IDs, generates
//       accounts, and sends activation links.
//   P4  Users Activate. Not Register. Registration = unknown person.
//       Activation = known staff.
//
// Constitutional boundaries (enforced, never commented away):
//   The Facility Admin CANNOT edit clinicians' medical notes, change
//   diagnoses or treatment plans, sign prescriptions unless also credentialed,
//   alter audit history, bypass constitutional security or consent rules,
//   override Clinical Intelligence reasoning, or access patient records
//   outside constitutional permissions.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Principle I: Onboarding pipeline ───────────────────────────────────────────

export type OnboardingStage =
  | 'register_facility'
  | 'connect_systems'
  | 'import_workforce'
  | 'import_departments'
  | 'import_wards'
  | 'import_clinics'
  | 'import_services'
  | 'import_assets'
  | 'validate'
  | 'go_live';

export const ONBOARDING_PIPELINE: readonly OnboardingStage[] = [
  'register_facility',
  'connect_systems',
  'import_workforce',
  'import_departments',
  'import_wards',
  'import_clinics',
  'import_services',
  'import_assets',
  'validate',
  'go_live',
];

export const ONBOARDING_STAGE_LABELS: Readonly<Record<OnboardingStage, string>> = {
  register_facility: 'Register Facility',
  connect_systems: 'Connect Existing Systems',
  import_workforce: 'Import Workforce',
  import_departments: 'Import Departments',
  import_wards: 'Import Wards',
  import_clinics: 'Import Clinics',
  import_services: 'Import Services',
  import_assets: 'Import Assets',
  validate: 'Validate',
  go_live: 'Go Live',
};

export type FacilityStatus = 'registering' | 'connecting' | 'importing' | 'validating' | 'live' | 'suspended';

// ── Principle II: Existing HMIS/EMR is respected ───────────────────────────────

export type SupportedHmisSystem =
  | 'openmrs' | 'openemr' | 'bahmni' | 'dhis2'
  | 'epic' | 'cerner' | 'meditech'
  | 'custom_postgres' | 'custom_sql_server' | 'custom_oracle'
  | 'fhir_server' | 'csv_import';

export const SUPPORTED_HMIS_SYSTEMS: readonly SupportedHmisSystem[] = [
  'openmrs', 'openemr', 'bahmni', 'dhis2', 'epic', 'cerner', 'meditech',
  'custom_postgres', 'custom_sql_server', 'custom_oracle', 'fhir_server', 'csv_import',
];

export const HMIS_SYSTEM_LABELS: Readonly<Record<SupportedHmisSystem, string>> = {
  openmrs: 'OpenMRS',
  openemr: 'OpenEMR',
  bahmni: 'Bahmni',
  dhis2: 'DHIS2',
  epic: 'Epic',
  cerner: 'Cerner',
  meditech: 'Meditech',
  custom_postgres: 'Custom PostgreSQL',
  custom_sql_server: 'Custom SQL Server',
  custom_oracle: 'Custom Oracle',
  fhir_server: 'FHIR Server',
  csv_import: 'CSV Import',
};

export type HmisConnectionStatus = 'configured' | 'connected' | 'syncing' | 'failed' | 'disconnected';

export interface HmisConnection {
  id: string;
  system: SupportedHmisSystem;
  label: string;
  endpoint?: string;
  status: HmisConnectionStatus;
  connectedAt?: number;
  lastSyncAt?: number;
  lastError?: string;
  importableEntities: ImportEntityType[];
  config: Record<string, string>;
}

export type ImportEntityType =
  | 'departments' | 'employees' | 'patients' | 'beds' | 'clinics'
  | 'theatres' | 'laboratories' | 'radiology' | 'pharmacy'
  | 'appointments' | 'users' | 'roles' | 'assets' | 'services';

export const IMPORTABLE_ENTITIES: readonly ImportEntityType[] = [
  'departments', 'employees', 'patients', 'beds', 'clinics', 'theatres',
  'laboratories', 'radiology', 'pharmacy', 'appointments', 'users', 'roles',
  'assets', 'services',
];

export type ImportBatchStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ImportBatch {
  id: string;
  connectionId: string;
  system: SupportedHmisSystem;
  entity: ImportEntityType;
  sourceCount: number;
  importedCount: number;
  skippedCount: number;
  generatedAmxIds: string[];
  status: ImportBatchStatus;
  startedAt: number;
  completedAt?: number;
  error?: string;
}

// ── Principle III & IV: Workforce import & activation ─────────────────────────

export interface ImportedStaffRow {
  sourcePersonId: string;
  fullName: string;
  email: string;
  phone?: string;
  category: string;
  departmentCode?: string;
  jobTitle?: string;
  licenseNumber?: string;
}

export type ActivationStatus = 'generated' | 'sent' | 'activated' | 'expired' | 'revoked';

export interface ActivationLink {
  id: string;
  personId: AmxUid;
  amxId: string;
  fullName: string;
  email: string;
  token: string;
  status: ActivationStatus;
  generatedAt: number;
  sentAt?: number;
  activatedAt?: number;
  activatedBy?: AmxUid;
  expiresAt: number;
}

// ── Workforce command center records ───────────────────────────────────────────

export type WorkforceCategory =
  | 'doctors' | 'nurses' | 'clinical_officers' | 'pharmacists' | 'lab'
  | 'radiology' | 'students' | 'residents' | 'interns' | 'administration';

export const WORKFORCE_CATEGORIES: readonly WorkforceCategory[] = [
  'doctors', 'nurses', 'clinical_officers', 'pharmacists', 'lab', 'radiology',
  'students', 'residents', 'interns', 'administration',
];

export interface WorkforceStaffRecord {
  staffId: string;
  personId: AmxUid;
  amxId: string;
  fullName: string;
  category: WorkforceCategory;
  departmentId?: string;
  employmentStatus: 'active' | 'suspended' | 'deactivated' | 'on_leave' | 'transferred';
  present: boolean;
  absent: boolean;
  onLeave: boolean;
  offDuty: boolean;
  onCall: boolean;
  licenseExpiry?: number;
  credentialExpiry?: number;
  competencyScore: number;
  activeAssignments: number;
  productivityIndex: number;
}

export type WorkforceCommandAction =
  | 'transfer' | 'suspend' | 'deactivate' | 'promote' | 'reassign'
  | 'reset_password' | 'send_announcement' | 'approve_leave' | 'verify_credential';

export const WORKFORCE_COMMAND_ACTIONS: readonly WorkforceCommandAction[] = [
  'transfer', 'suspend', 'deactivate', 'promote', 'reassign', 'reset_password',
  'send_announcement', 'approve_leave', 'verify_credential',
];

// ── Service catalogue ──────────────────────────────────────────────────────────

export type ServiceCategory =
  | 'surgery' | 'medicine' | 'diagnostics' | 'maternity' | 'critical_care'
  | 'outpatient' | 'pharmacy' | 'dental' | 'therapy' | 'support';

export interface CatalogueService {
  id: string;
  code: string;
  name: string;
  category: ServiceCategory;
  departmentId?: string;
  availability: 'available' | 'limited' | 'unavailable';
  price: number;
  capacityPerDay: number;
  schedule: string;
  requiresReferral: boolean;
  active: boolean;
}

// ── Infrastructure & assets ────────────────────────────────────────────────────

export type AssetCategory =
  | 'beds' | 'buildings' | 'machines' | 'computers' | 'servers'
  | 'network' | 'internet' | 'medical_equipment' | 'vehicles' | 'theatres';

export type AssetStatus = 'operational' | 'maintenance' | 'calibration' | 'faulted' | 'downtime';

export interface InfrastructureAsset {
  id: string;
  code: string;
  name: string;
  category: AssetCategory;
  location?: string;
  departmentId?: string;
  status: AssetStatus;
  warrantyUntil?: number;
  lastMaintenanceAt?: number;
  nextMaintenanceAt?: number;
  lastCalibrationAt?: number;
  nextCalibrationAt?: number;
  faults: AssetFault[];
  downtimeMinutes: number;
}

export interface AssetFault {
  id: string;
  assetId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedAt: number;
  reportedBy: AmxUid;
  status: 'open' | 'in_progress' | 'resolved';
  resolvedAt?: number;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: 'preventive' | 'corrective' | 'calibration' | 'inspection';
  scheduledAt: number;
  performedAt?: number;
  performedBy?: AmxUid;
  notes?: string;
}

// ── Communication center ───────────────────────────────────────────────────────

export type CommunicationKind =
  | 'circular' | 'announcement' | 'meeting' | 'alert' | 'policy' | 'emergency_broadcast';

export type BroadcastSeverity = 'info' | 'warning' | 'critical';

export interface CommunicationRecord {
  id: string;
  kind: CommunicationKind;
  title: string;
  body: string;
  audience: string[];
  severity: BroadcastSeverity;
  channel: ('in_app' | 'email' | 'sms' | 'pager' | 'broadcast')[];
  publishedBy: AmxUid;
  publishedAt: number;
  scheduledFor?: number;
  expiresAt?: number;
}

// ── Protocol center ────────────────────────────────────────────────────────────

export type ProtocolKind =
  | 'hospital_protocol' | 'guideline' | 'pathway' | 'sop'
  | 'order_set' | 'care_bundle';

export interface ProtocolConfiguration {
  id: string;
  code: string;
  title: string;
  kind: ProtocolKind;
  departmentId?: string;
  version: string;
  content: string;
  reviewedBy?: AmxUid;
  reviewedAt?: number;
  effectiveAt?: number;
  status: 'draft' | 'active' | 'archived';
}

// ── Clinical intelligence center ───────────────────────────────────────────────

export interface ClinicalIntelligenceSnapshot {
  aiUsageCount: number;
  decisionSupportCount: number;
  protocolCompliancePercent: number;
  clinicalRecommendations: number;
  missedOpportunities: number;
  knowledgeUpdates: number;
  newGuidelines: number;
}

// ── Integration center ─────────────────────────────────────────────────────────

export type IntegrationKind =
  | 'fhir' | 'hl7' | 'lis' | 'pacs' | 'ris' | 'billing' | 'insurance'
  | 'laboratory' | 'radiology' | 'national_systems'
  | 'erp' | 'payroll' | 'hr' | 'inventory';

export interface IntegrationConnection {
  id: string;
  kind: IntegrationKind;
  name: string;
  endpoint?: string;
  direction: 'inbound' | 'outbound' | 'bidirectional';
  status: 'configured' | 'active' | 'error' | 'disabled';
  lastSyncAt?: number;
}

// ── Data migration center ──────────────────────────────────────────────────────

export type MigrationEntity =
  | 'patients' | 'staff' | 'appointments' | 'encounters'
  | 'laboratory' | 'radiology' | 'pharmacy';

export interface MigrationRecord {
  id: string;
  entity: MigrationEntity;
  sourceSystem: string;
  totalRows: number;
  migratedRows: number;
  failedRows: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
}

// ── Marketplace ────────────────────────────────────────────────────────────────

export type MarketplaceModuleId =
  | 'telemedicine' | 'icu' | 'nicu' | 'oncology' | 'dental'
  | 'blood_bank' | 'dialysis' | 'ai_modules' | 'insurance_connectors';

export const MARKETPLACE_CATALOG: readonly { id: MarketplaceModuleId; name: string; description: string }[] = [
  { id: 'telemedicine', name: 'Telemedicine', description: 'Remote consultation network' },
  { id: 'icu', name: 'ICU', description: 'Intensive care digital operations' },
  { id: 'nicu', name: 'NICU', description: 'Neonatal intensive care digital operations' },
  { id: 'oncology', name: 'Oncology', description: 'Cancer care digital operations' },
  { id: 'dental', name: 'Dental', description: 'Dental clinic module' },
  { id: 'blood_bank', name: 'Blood Bank', description: 'Blood bank and transfusion module' },
  { id: 'dialysis', name: 'Dialysis', description: 'Renal dialysis module' },
  { id: 'ai_modules', name: 'AI Modules', description: 'Clinical intelligence extensions' },
  { id: 'insurance_connectors', name: 'Insurance Connectors', description: 'Payer integration connectors' },
];

export interface MarketplaceInstallation {
  moduleId: MarketplaceModuleId;
  installedAt: number;
  installedBy: AmxUid;
  version: string;
  status: 'installed' | 'updating' | 'disabled' | 'uninstalled';
  configured: boolean;
}

// ── Security center ────────────────────────────────────────────────────────────

export type SecurityEventKind =
  | 'failed_login' | 'session_revoked' | 'device_registered' | 'device_revoked'
  | 'access_review' | 'mfa_enabled' | 'mfa_disabled' | 'permission_change';

export interface SecurityEvent {
  id: string;
  kind: SecurityEventKind;
  actorId?: AmxUid;
  targetId?: AmxUid;
  detail?: string;
  at: number;
  severity: 'info' | 'warning' | 'critical';
}

export interface SessionRecord {
  id: string;
  personId: AmxUid;
  deviceLabel: string;
  ipAddress?: string;
  startedAt: number;
  lastActiveAt: number;
  revokedAt?: number;
  mfaRequired: boolean;
  mfaVerifiedAt?: number;
}

export interface AccessReview {
  id: string;
  title: string;
  scope: string;
  dueAt: number;
  completedAt?: number;
  completedBy?: AmxUid;
  findings: number;
  status: 'open' | 'completed' | 'overdue';
}

// ── Operational metrics (fed by the provisioning conductor) ───────────────────

export interface FacilityMetrics {
  bedsAvailable: number;
  patients: number;
  admissionsToday: number;
  dischargesToday: number;
  surgeriesToday: number;
  emergencyCount: number;
  criticalAlerts: number;
  revenueToday: number;
  staffOnDuty: number;
  occupancyPercent: number;
  systemHealthPercent: number;
  waitingTimesMin: { department: string; minutes: number }[];
  clinicQueueLengths: { clinic: string; queue: number }[];
  theatreUtilizationPercent: number;
  labTurnaroundMinutes: number;
  radiologyTurnaroundMinutes: number;
  averageLosDays: number;
}

export interface QualityMetrics {
  mortality: number;
  morbidity: number;
  surgicalSiteInfections: number;
  readmissions: number;
  medicationErrors: number;
  nearMisses: number;
  falls: number;
  complaints: number;
  auditsCompleted: number;
}

export interface FinancialMetrics {
  revenueToday: number;
  claimsSubmitted: number;
  claimsApproved: number;
  insuranceOutstanding: number;
  outstandingBills: number;
  expenses: number;
  payroll: number;
  departmentCosts: { department: string; cost: number }[];
  drugCosts: number;
}

export interface ResearchMetrics {
  projects: number;
  trials: number;
  publications: number;
  recruitments: number;
  funding: number;
  ethicsApprovals: number;
}

export interface EducationMetrics {
  students: number;
  residents: number;
  interns: number;
  activeRotations: number;
  logbookEntries: number;
  competenciesAssessed: number;
  teachingSessions: number;
  osceSessions: number;
}

// ── Dashboard snapshots (generated, never stored) ─────────────────────────────

export interface ExecutiveOverview {
  hospitalStatus: FacilityStatus;
  operational: boolean;
  bedsAvailable: number;
  patients: number;
  admissionsToday: number;
  dischargesToday: number;
  surgeriesToday: number;
  emergencyCount: number;
  criticalAlerts: number;
  revenueToday: number;
  staffOnDuty: number;
  occupancyPercent: number;
  systemHealthPercent: number;
  generatedAt: number;
}

export interface WorkforceCommandSnapshot {
  byCategory: Record<WorkforceCategory, {
    total: number;
    present: number;
    absent: number;
    onLeave: number;
    offDuty: number;
    onCall: number;
    expiredLicense: number;
    expiredCredential: number;
  }>;
  flagged: { category: WorkforceCategory; personId: AmxUid; fullName: string; reason: string }[];
}

export interface DigitalTwinNode {
  id: string;
  kind: 'hospital' | 'building' | 'department' | 'unit' | 'ward' | 'clinic' | 'service';
  name: string;
  parentId?: string;
  children: DigitalTwinNode[];
}

export interface HospitalAnalyticsSnapshot {
  clinical: Record<string, number>;
  operational: Record<string, number>;
  financial: Record<string, number>;
  teaching: Record<string, number>;
  research: Record<string, number>;
  population: Record<string, number>;
  quality: Record<string, number>;
  utilization: Record<string, number>;
  forecasts: Record<string, number>;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface FacilityAdminModel {
  organizationId: string;
  facilityId?: string;
  status: FacilityStatus;
  currentStage: OnboardingStage;
  stagesCompleted: OnboardingStage[];
  administratorId: AmxUid;
  hmisConnections: HmisConnection[];
  importBatches: ImportBatch[];
  activationLinks: ActivationLink[];
  workforce: WorkforceStaffRecord[];
  services: CatalogueService[];
  assets: InfrastructureAsset[];
  maintenance: MaintenanceRecord[];
  communications: CommunicationRecord[];
  protocols: ProtocolConfiguration[];
  intelligence: ClinicalIntelligenceSnapshot;
  integrations: IntegrationConnection[];
  migrations: MigrationRecord[];
  marketplace: MarketplaceInstallation[];
  securityEvents: SecurityEvent[];
  sessions: SessionRecord[];
  devices: { id: string; personId: AmxUid; label: string; registeredAt: number; revokedAt?: number }[];
  accessReviews: AccessReview[];
  metrics: FacilityMetrics;
  quality: QualityMetrics;
  finance: FinancialMetrics;
  research: ResearchMetrics;
  education: EducationMetrics;
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateFacilityAdminModelInput {
  organizationId: string;
  facilityId?: string;
  administratorId: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Constitutional capability tables ───────────────────────────────────────────

export const FACILITY_ADMIN_CAPABILITIES: readonly string[] = [
  'govern_organization', 'configure_hospital_structure', 'connect_external_hmis',
  'import_staff_data', 'import_organizational_data', 'manage_departments',
  'manage_units', 'manage_wards', 'manage_clinics', 'manage_theatres',
  'manage_laboratories', 'manage_pharmacies', 'manage_assets', 'configure_services',
  'configure_schedules', 'configure_capacities', 'manage_workforce_lifecycle',
  'verify_credentials', 'approve_leave', 'reset_passwords', 'monitor_operations',
  'monitor_quality', 'monitor_finance', 'monitor_research', 'monitor_education',
  'monitor_infrastructure', 'configure_protocols', 'configure_order_sets',
  'configure_branding', 'configure_integrations', 'configure_subscriptions',
  'configure_notifications', 'view_analytics', 'view_system_health',
  'approve_governance_workflows',
];

export const FACILITY_ADMIN_FORBIDDEN: readonly string[] = [
  'edit_clinical_notes', 'change_diagnosis', 'change_treatment_plan',
  'sign_prescription', 'alter_audit_history', 'bypass_security_rules',
  'bypass_consent_rules', 'override_clinical_intelligence',
  'access_patient_records_outside_permissions',
];

// ── The Engine ─────────────────────────────────────────────────────────────────

export class FacilityAdministrationEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateFacilityAdminModelInput): FacilityAdminModel {
    if (!input.organizationId) throw new Error('[FAE] organizationId is required');
    if (!input.administratorId) throw new Error('[FAE] administratorId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      status: 'registering',
      currentStage: 'register_facility',
      stagesCompleted: [],
      administratorId: input.administratorId,
      hmisConnections: [],
      importBatches: [],
      activationLinks: [],
      workforce: [],
      services: [],
      assets: [],
      maintenance: [],
      communications: [],
      protocols: [],
      intelligence: {
        aiUsageCount: 0,
        decisionSupportCount: 0,
        protocolCompliancePercent: 0,
        clinicalRecommendations: 0,
        missedOpportunities: 0,
        knowledgeUpdates: 0,
        newGuidelines: 0,
      },
      integrations: [],
      migrations: [],
      marketplace: [],
      securityEvents: [],
      sessions: [],
      devices: [],
      accessReviews: [],
      metrics: {
        bedsAvailable: 0,
        patients: 0,
        admissionsToday: 0,
        dischargesToday: 0,
        surgeriesToday: 0,
        emergencyCount: 0,
        criticalAlerts: 0,
        revenueToday: 0,
        staffOnDuty: 0,
        occupancyPercent: 0,
        systemHealthPercent: 100,
        waitingTimesMin: [],
        clinicQueueLengths: [],
        theatreUtilizationPercent: 0,
        labTurnaroundMinutes: 0,
        radiologyTurnaroundMinutes: 0,
        averageLosDays: 0,
      },
      quality: {
        mortality: 0,
        morbidity: 0,
        surgicalSiteInfections: 0,
        readmissions: 0,
        medicationErrors: 0,
        nearMisses: 0,
        falls: 0,
        complaints: 0,
        auditsCompleted: 0,
      },
      finance: {
        revenueToday: 0,
        claimsSubmitted: 0,
        claimsApproved: 0,
        insuranceOutstanding: 0,
        outstandingBills: 0,
        expenses: 0,
        payroll: 0,
        departmentCosts: [],
        drugCosts: 0,
      },
      research: { projects: 0, trials: 0, publications: 0, recruitments: 0, funding: 0, ethicsApprovals: 0 },
      education: { students: 0, residents: 0, interns: 0, activeRotations: 0, logbookEntries: 0, competenciesAssessed: 0, teachingSessions: 0, osceSessions: 0 },
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Onboarding (Principle I) ─────────────────────────────────────────────────

  /** Register Facility — the hospital already exists; AMEXAN digitizes it. */
  static registerFacility(model: FacilityAdminModel, name: string): FacilityAdminModel {
    if (model.status !== 'registering') throw new Error('[FAE] Facility already registered');
    if (!name.trim()) throw new Error('[FAE] Facility name is required');
    const now = Date.now();
    return {
      ...model,
      status: 'connecting',
      currentStage: 'connect_systems',
      stagesCompleted: [...model.stagesCompleted, 'register_facility'],
      auditLog: [...model.auditLog, { at: now, actorId: model.administratorId, action: 'facility_registered', detail: name }],
      updatedAt: now,
    };
  }

  static advanceStage(model: FacilityAdminModel): FacilityAdminModel {
    const index = ONBOARDING_PIPELINE.indexOf(model.currentStage);
    const next = ONBOARDING_PIPELINE[index + 1];
    if (!next) return model;
    const now = Date.now();
    const stagesCompleted = model.stagesCompleted.includes(model.currentStage)
      ? model.stagesCompleted
      : [...model.stagesCompleted, model.currentStage];
    return {
      ...model,
      currentStage: next,
      stagesCompleted,
      status: next === 'go_live' ? 'live' : next === 'validate' ? 'validating' : model.status === 'live' ? model.status : model.status === 'registering' ? 'connecting' : 'importing',
      auditLog: [...model.auditLog, { at: now, actorId: model.administratorId, action: 'onboarding_stage', detail: next }],
      updatedAt: now,
    };
  }

  static goLive(model: FacilityAdminModel, checked: { systemsConnected: boolean; importsValidated: boolean; clinicalIndependent: boolean }): FacilityAdminModel {
    if (model.status === 'live') throw new Error('[FAE] Facility already live');
    const missing: string[] = [];
    if (!checked.systemsConnected) missing.push('systems not connected');
    if (!checked.importsValidated) missing.push('imports not validated');
    if (!checked.clinicalIndependent) missing.push('clinical independence not preserved');
    if (missing.length) throw new Error(`[FAE] Cannot go live: ${missing.join(', ')}`);
    const now = Date.now();
    return {
      ...model,
      status: 'live',
      currentStage: 'go_live',
      stagesCompleted: [...model.stagesCompleted, 'go_live'],
      auditLog: [...model.auditLog, { at: now, actorId: model.administratorId, action: 'facility_live' }],
      updatedAt: now,
    };
  }

  // ── Principle II: External HMIS/EMR connections ─────────────────────────────

  static connectSystem(
    model: FacilityAdminModel,
    input: { system: SupportedHmisSystem; endpoint?: string; config?: Record<string, string> },
  ): { model: FacilityAdminModel; connection: HmisConnection } {
    if (!SUPPORTED_HMIS_SYSTEMS.includes(input.system)) {
      throw new Error(`[FAE] Unsupported HMIS system "${input.system}"`);
    }
    const now = Date.now();
    const connection: HmisConnection = {
      id: nextId('hmis'),
      system: input.system,
      label: HMIS_SYSTEM_LABELS[input.system],
      endpoint: input.endpoint,
      status: 'configured',
      importableEntities: [...IMPORTABLE_ENTITIES],
      config: input.config ?? {},
    };
    return {
      model: {
        ...model,
        hmisConnections: [...model.hmisConnections, connection],
        auditLog: [...model.auditLog, { at: now, actorId: model.administratorId, action: 'hmis_connected', detail: input.system }],
        updatedAt: now,
      },
      connection,
    };
  }

  static markConnectionStatus(model: FacilityAdminModel, connectionId: string, status: HmisConnectionStatus, lastError?: string): FacilityAdminModel {
    const hmisConnections = model.hmisConnections.map(c =>
      c.id === connectionId ? { ...c, status, lastError, lastSyncAt: status === 'connected' ? Date.now() : c.lastSyncAt, connectedAt: status === 'connected' ? Date.now() : c.connectedAt } : c,
    );
    return { ...model, hmisConnections, updatedAt: Date.now() };
  }

  static disconnectSystem(model: FacilityAdminModel, connectionId: string): FacilityAdminModel {
    const hmisConnections = model.hmisConnections.map(c =>
      c.id === connectionId ? { ...c, status: 'disconnected' as const } : c,
    );
    const now = Date.now();
    return {
      ...model,
      hmisConnections,
      auditLog: [...model.auditLog, { at: now, actorId: model.administratorId, action: 'hmis_disconnected', detail: connectionId }],
      updatedAt: now,
    };
  }

  // ── Import Engine (Principle II) ─────────────────────────────────────────────

  static runImport(
    model: FacilityAdminModel,
    input: {
      connectionId: string;
      entity: ImportEntityType;
      sourceCount: number;
      generateAmxIds: boolean;
    },
  ): { model: FacilityAdminModel; batch: ImportBatch } {
    const connection = model.hmisConnections.find(c => c.id === input.connectionId);
    if (!connection) throw new Error('[FAE] Connection not found');
    if (connection.status === 'disconnected') throw new Error('[FAE] Connection is disconnected');
    const now = Date.now();
    const amxIds = input.generateAmxIds
      ? Array.from({ length: input.sourceCount }, () => `AMX-${nextId('imp').toUpperCase()}`)
      : [];
    const batch: ImportBatch = {
      id: nextId('batch'),
      connectionId: input.connectionId,
      system: connection.system,
      entity: input.entity,
      sourceCount: input.sourceCount,
      importedCount: input.sourceCount,
      skippedCount: 0,
      generatedAmxIds: amxIds,
      status: 'completed',
      startedAt: now,
      completedAt: now,
    };
    return {
      model: {
        ...model,
        importBatches: [...model.importBatches, batch],
        auditLog: [...model.auditLog, { at: now, actorId: model.administratorId, action: 'import_completed', detail: `${input.entity}:${input.sourceCount}` }],
        updatedAt: now,
      },
      batch,
    };
  }

  static getImportSummary(model: FacilityAdminModel): { byEntity: Record<ImportEntityType, { imported: number; skipped: number; batches: number }>; totalImported: number } {
    const byEntity = Object.fromEntries(
      IMPORTABLE_ENTITIES.map(entity => [
        entity,
        model.importBatches.filter(b => b.entity === entity)
          .reduce((acc, b) => ({ imported: acc.imported + b.importedCount, skipped: acc.skipped + b.skippedCount, batches: acc.batches + 1 }), { imported: 0, skipped: 0, batches: 0 }),
      ]),
    ) as Record<ImportEntityType, { imported: number; skipped: number; batches: number }>;
    const totalImported = model.importBatches.reduce((a, b) => a + b.importedCount, 0);
    return { byEntity, totalImported };
  }

  // ── Principle III: Workforce import & activation links ──────────────────────

  static importWorkforce(model: FacilityAdminModel, rows: ImportedStaffRow[]): { model: FacilityAdminModel; activationLinks: ActivationLink[]; workforce: WorkforceStaffRecord[] } {
    const now = Date.now();
    const workforce: WorkforceStaffRecord[] = [];
    const activationLinks: ActivationLink[] = [];
    for (const row of rows) {
      const amxId = `AMX-${nextId('w').toUpperCase()}`;
      const personId = `p-${nextId('p')}` as AmxUid;
      const link: ActivationLink = {
        id: nextId('act'),
        personId,
        amxId,
        fullName: row.fullName,
        email: row.email,
        token: `tok-${Math.random().toString(36).slice(2, 14)}`,
        status: 'generated',
        generatedAt: now,
        expiresAt: now + 7 * 24 * 60 * 60 * 1000,
      };
      activationLinks.push(link);
      workforce.push({
        staffId: nextId('stf'),
        personId,
        amxId,
        fullName: row.fullName,
        category: mapCategory(row.category),
        departmentId: row.departmentCode,
        employmentStatus: 'active',
        present: false,
        absent: false,
        onLeave: false,
        offDuty: true,
        onCall: false,
        licenseExpiry: row.licenseNumber ? now + 365 * 24 * 60 * 60 * 1000 : undefined,
        competencyScore: 0,
        activeAssignments: 0,
        productivityIndex: 0,
      });
    }
    return {
      model: {
        ...model,
        workforce: [...model.workforce, ...workforce],
        activationLinks: [...model.activationLinks, ...activationLinks],
        auditLog: [...model.auditLog, { at: now, actorId: model.administratorId, action: 'workforce_imported', detail: `${workforce.length} staff` }],
        updatedAt: now,
      },
      activationLinks,
      workforce,
    };
  }

  static sendActivationLinks(model: FacilityAdminModel, linkIds: string[]): FacilityAdminModel {
    const now = Date.now();
    const activationLinks = model.activationLinks.map(l =>
      linkIds.includes(l.id) && l.status === 'generated' ? { ...l, status: 'sent' as const, sentAt: now } : l,
    );
    return { ...model, activationLinks, updatedAt: now };
  }

  /** Principle IV: Users Activate. Not Register. */
  static activateAccount(model: FacilityAdminModel, token: string): { model: FacilityAdminModel; activated: boolean; fullName?: string } {
    const link = model.activationLinks.find(l => l.token === token);
    if (!link) return { model, activated: false };
    if (link.status === 'activated') return { model, activated: true, fullName: link.fullName };
    if (link.status === 'expired' || (link.expiresAt < Date.now())) return { model, activated: false };
    const now = Date.now();
    const activationLinks = model.activationLinks.map(l =>
      l.token === token ? { ...l, status: 'activated' as const, activatedAt: now, activatedBy: link.personId } : l,
    );
    return {
      model: {
        ...model,
        activationLinks,
        auditLog: [...model.auditLog, { at: now, actorId: link.personId, action: 'account_activated', detail: link.fullName }],
        updatedAt: now,
      },
      activated: true,
      fullName: link.fullName,
    };
  }

  static getPendingActivations(model: FacilityAdminModel): ActivationLink[] {
    return model.activationLinks.filter(l => l.status === 'generated' || l.status === 'sent');
  }

  // ── Constitutional governance guard ──────────────────────────────────────────

  /** Allowed actions for the Facility Admin (governor, never clinical actor). */
  static canFacilityAdminPerform(model: FacilityAdminModel, actorId: AmxUid, action: string, opts: { credentialedClinician?: boolean; clinicalWorkspace?: boolean } = {}): { allowed: boolean; reason?: string } {
    if (actorId !== model.administratorId && !FACILITY_ADMIN_CAPABILITIES.includes(action)) {
      return { allowed: false, reason: 'Not the Facility Administrator' };
    }
    if (FACILITY_ADMIN_CAPABILITIES.includes(action)) return { allowed: true };
    if (FACILITY_ADMIN_FORBIDDEN.includes(action)) {
      switch (action) {
        case 'edit_clinical_notes':
        case 'change_diagnosis':
        case 'change_treatment_plan':
          return { allowed: false, reason: 'Clinical independence is constitutionally preserved. The Facility Administrator never edits clinical content.' };
        case 'sign_prescription':
          return { allowed: Boolean(opts.credentialedClinician && opts.clinicalWorkspace), reason: 'Prescriptions may only be signed by credentialed clinicians acting in a clinical workspace.' };
        case 'alter_audit_history':
          return { allowed: false, reason: 'The audit log is append-only. Nothing may be altered.' };
        case 'bypass_security_rules':
        case 'bypass_consent_rules':
          return { allowed: false, reason: 'Constitutional security and consent rules may never be bypassed.' };
        case 'override_clinical_intelligence':
          return { allowed: false, reason: 'Clinical Intelligence reasoning may not be overridden.' };
        case 'access_patient_records_outside_permissions':
          return { allowed: false, reason: 'Patient records are accessible only within constitutional permissions.' };
      }
    }
    return { allowed: false, reason: `Action "${action}" is not within Facility Administrator authority.` };
  }

  static guard(model: FacilityAdminModel, actorId: AmxUid, action: string, opts?: { credentialedClinician?: boolean; clinicalWorkspace?: boolean }): void {
    const verdict = FacilityAdministrationEngine.canFacilityAdminPerform(model, actorId, action, opts);
    if (!verdict.allowed) throw new Error(`[FAE] ${verdict.reason}`);
  }

  // ── Workforce Command Center (dashboard 3 + actions) ────────────────────────

  static getWorkforceCommandCenter(model: FacilityAdminModel): WorkforceCommandSnapshot {
    const now = Date.now();
    const empty = () => ({ total: 0, present: 0, absent: 0, onLeave: 0, offDuty: 0, onCall: 0, expiredLicense: 0, expiredCredential: 0 });
    const byCategory = Object.fromEntries(WORKFORCE_CATEGORIES.map(c => [c, empty()])) as Record<WorkforceCategory, ReturnType<typeof empty>>;
    const flagged: WorkforceCommandSnapshot['flagged'] = [];
    for (const staff of model.workforce) {
      const agg = byCategory[staff.category];
      agg.total += 1;
      if (staff.present) agg.present += 1;
      if (staff.absent) agg.absent += 1;
      if (staff.onLeave) agg.onLeave += 1;
      if (staff.offDuty) agg.offDuty += 1;
      if (staff.onCall) agg.onCall += 1;
      if (staff.licenseExpiry && staff.licenseExpiry < now) { agg.expiredLicense += 1; flagged.push({ category: staff.category, personId: staff.personId, fullName: staff.fullName, reason: 'expired_license' }); }
      if (staff.credentialExpiry && staff.credentialExpiry < now) { agg.expiredCredential += 1; flagged.push({ category: staff.category, personId: staff.personId, fullName: staff.fullName, reason: 'expired_credential' }); }
    }
    return { byCategory, flagged };
  }

  static commandWorkforce(
    model: FacilityAdminModel,
    actorId: AmxUid,
    input: { action: WorkforceCommandAction; staffId: string; by: string },
  ): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'manage_workforce_lifecycle');
    const now = Date.now();
    const workforce = model.workforce.map(s => {
      if (s.staffId !== input.staffId) return s;
      switch (input.action) {
        case 'suspend': return { ...s, employmentStatus: 'suspended' as const, present: false, offDuty: true };
        case 'deactivate': return { ...s, employmentStatus: 'deactivated' as const, present: false, offDuty: true };
        case 'transfer': return { ...s, departmentId: input.by };
        case 'promote': return { ...s, productivityIndex: s.productivityIndex + 1 };
        case 'reassign': return { ...s, activeAssignments: Math.max(0, s.activeAssignments - 1) };
        case 'reset_password': return { ...s };
        case 'send_announcement': return { ...s };
        case 'approve_leave': return { ...s, onLeave: true, present: false };
        case 'verify_credential': return { ...s, credentialExpiry: now + 365 * 24 * 60 * 60 * 1000 };
      }
    });
    return {
      ...model,
      workforce,
      auditLog: [...model.auditLog, { at: now, actorId, action: `workforce_${input.action}`, detail: input.staffId }],
      updatedAt: now,
    };
  }

  // ── Service catalogue (dashboard 5) ──────────────────────────────────────────

  static addService(model: FacilityAdminModel, actorId: AmxUid, service: Omit<CatalogueService, 'id' | 'active'>): { model: FacilityAdminModel; service: CatalogueService } {
    FacilityAdministrationEngine.guard(model, actorId, 'configure_services');
    const created: CatalogueService = { ...service, id: nextId('svc'), active: true };
    return {
      model: { ...model, services: [...model.services, created], updatedAt: Date.now() },
      service: created,
    };
  }

  static updateService(model: FacilityAdminModel, actorId: AmxUid, serviceId: string, patch: Partial<Pick<CatalogueService, 'availability' | 'price' | 'capacityPerDay' | 'schedule' | 'requiresReferral'>>): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'configure_services');
    const services = model.services.map(s => s.id === serviceId ? { ...s, ...patch } : s);
    return { ...model, services, updatedAt: Date.now() };
  }

  static setServiceAvailability(model: FacilityAdminModel, actorId: AmxUid, serviceId: string, availability: CatalogueService['availability'], active: boolean): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'configure_services');
    const services = model.services.map(s => s.id === serviceId ? { ...s, availability, active } : s);
    return { ...model, services, updatedAt: Date.now() };
  }

  // ── Infrastructure (dashboard 6) ─────────────────────────────────────────────

  static registerAsset(model: FacilityAdminModel, actorId: AmxUid, asset: Omit<InfrastructureAsset, 'id' | 'status' | 'faults' | 'downtimeMinutes'>): { model: FacilityAdminModel; asset: InfrastructureAsset } {
    FacilityAdministrationEngine.guard(model, actorId, 'manage_assets');
    const created: InfrastructureAsset = { ...asset, id: nextId('ast'), status: 'operational', faults: [], downtimeMinutes: 0 };
    return { model: { ...model, assets: [...model.assets, created], updatedAt: Date.now() }, asset: created };
  }

  static reportFault(model: FacilityAdminModel, actorId: AmxUid, assetId: string, description: string, severity: AssetFault['severity']): { model: FacilityAdminModel; fault: AssetFault } {
    FacilityAdministrationEngine.guard(model, actorId, 'manage_assets');
    const fault: AssetFault = { id: nextId('flt'), assetId, description, severity, reportedAt: Date.now(), reportedBy: actorId, status: 'open' };
    const assets = model.assets.map(a => a.id === assetId ? { ...a, status: severity === 'critical' ? ('downtime' as const) : ('faulted' as const), faults: [...a.faults, fault] } : a);
    return { model: { ...model, assets, updatedAt: Date.now() }, fault };
  }

  static resolveFault(model: FacilityAdminModel, actorId: AmxUid, assetId: string, faultId: string): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'manage_assets');
    const now = Date.now();
    const assets = model.assets.map(a => {
      if (a.id !== assetId) return a;
      const faults = a.faults.map(f => f.id === faultId ? { ...f, status: 'resolved' as const, resolvedAt: now } : f);
      return { ...a, faults, status: a.faults.some(f => f.id !== faultId && f.status !== 'resolved') ? a.status : 'operational' };
    });
    return { ...model, assets, updatedAt: now };
  }

  static scheduleMaintenance(model: FacilityAdminModel, actorId: AmxUid, assetId: string, type: MaintenanceRecord['type'], scheduledAt: number): { model: FacilityAdminModel; record: MaintenanceRecord } {
    FacilityAdministrationEngine.guard(model, actorId, 'manage_assets');
    const record: MaintenanceRecord = { id: nextId('mnt'), assetId, type, scheduledAt };
    const assets = model.assets.map(a => a.id === assetId ? { ...a, status: 'maintenance' as const, nextMaintenanceAt: scheduledAt } : a);
    return { model: { ...model, assets, maintenance: [...model.maintenance, record], updatedAt: Date.now() }, record };
  }

  static completeMaintenance(model: FacilityAdminModel, actorId: AmxUid, recordId: string, assetId: string): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'manage_assets');
    const now = Date.now();
    const maintenance = model.maintenance.map(m => m.id === recordId ? { ...m, performedAt: now, performedBy: actorId } : m);
    const assets = model.assets.map(a => a.id === assetId ? { ...a, status: 'operational' as const, lastMaintenanceAt: now } : a);
    return { ...model, maintenance, assets, updatedAt: now };
  }

  static recordDowntime(model: FacilityAdminModel, actorId: AmxUid, assetId: string, minutes: number): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'manage_assets');
    const assets = model.assets.map(a => a.id === assetId ? { ...a, downtimeMinutes: a.downtimeMinutes + minutes, status: a.status === 'downtime' ? a.status : a.status } : a);
    return { ...model, assets, updatedAt: Date.now() };
  }

  static getOpenFaults(model: FacilityAdminModel): AssetFault[] {
    return model.assets.flatMap(a => a.faults).filter(f => f.status !== 'resolved');
  }

  static getInfrastructureHealth(model: FacilityAdminModel): { totalAssets: number; operational: number; inMaintenance: number; faulted: number; downtime: number; totalDowntimeMinutes: number } {
    const totalAssets = model.assets.length;
    const operational = model.assets.filter(a => a.status === 'operational').length;
    const inMaintenance = model.assets.filter(a => a.status === 'maintenance' || a.status === 'calibration').length;
    const faulted = model.assets.filter(a => a.status === 'faulted').length;
    const downtime = model.assets.filter(a => a.status === 'downtime').length;
    const totalDowntimeMinutes = model.assets.reduce((a, x) => a + x.downtimeMinutes, 0);
    return { totalAssets, operational, inMaintenance, faulted, downtime, totalDowntimeMinutes };
  }

  // ── Clinical Operations (dashboard 7 — high level only, never edits notes) ──

  static updateMetrics(model: FacilityAdminModel, actorId: AmxUid, patch: Partial<FacilityMetrics>): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'monitor_operations');
    return { ...model, metrics: { ...model.metrics, ...patch }, updatedAt: Date.now() };
  }

  static getClinicalOperations(model: FacilityAdminModel): FacilityMetrics {
    return { ...model.metrics };
  }

  // ── Quality (dashboard 9) ────────────────────────────────────────────────────

  static updateQuality(model: FacilityAdminModel, actorId: AmxUid, patch: Partial<QualityMetrics>): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'monitor_quality');
    return { ...model, quality: { ...model.quality, ...patch }, updatedAt: Date.now() };
  }

  static getQualityDashboard(model: FacilityAdminModel): QualityMetrics {
    return { ...model.quality };
  }

  // ── Finance (dashboard 10) ───────────────────────────────────────────────────

  static updateFinance(model: FacilityAdminModel, actorId: AmxUid, patch: Partial<FinancialMetrics>): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'monitor_finance');
    return { ...model, finance: { ...model.finance, ...patch }, updatedAt: Date.now() };
  }

  static getFinancialDashboard(model: FacilityAdminModel): FinancialMetrics {
    return { ...model.finance };
  }

  // ── Research (dashboard 11) & Education (dashboard 12) ──────────────────────

  static updateResearch(model: FacilityAdminModel, actorId: AmxUid, patch: Partial<ResearchMetrics>): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'monitor_research');
    return { ...model, research: { ...model.research, ...patch }, updatedAt: Date.now() };
  }

  static getResearchDashboard(model: FacilityAdminModel): ResearchMetrics {
    return { ...model.research };
  }

  static updateEducation(model: FacilityAdminModel, actorId: AmxUid, patch: Partial<EducationMetrics>): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'monitor_education');
    return { ...model, education: { ...model.education, ...patch }, updatedAt: Date.now() };
  }

  static getEducationDashboard(model: FacilityAdminModel): EducationMetrics {
    return { ...model.education };
  }

  // ── Communication Center (dashboard 13) ─────────────────────────────────────

  static publishCommunication(model: FacilityAdminModel, actorId: AmxUid, input: Omit<CommunicationRecord, 'id' | 'publishedBy' | 'publishedAt'>): { model: FacilityAdminModel; record: CommunicationRecord } {
    FacilityAdministrationEngine.guard(model, actorId, 'configure_notifications');
    const record: CommunicationRecord = { ...input, id: nextId('com'), publishedBy: actorId, publishedAt: Date.now() };
    return { model: { ...model, communications: [...model.communications, record], updatedAt: Date.now() }, record };
  }

  static sendAnnouncement(model: FacilityAdminModel, actorId: AmxUid, title: string, body: string, audience: string[]): FacilityAdminModel {
    return FacilityAdministrationEngine.publishCommunication(model, actorId, {
      kind: 'announcement', title, body, audience, severity: 'info', channel: ['in_app', 'email'],
    }).model;
  }

  static emergencyBroadcast(model: FacilityAdminModel, actorId: AmxUid, title: string, body: string): FacilityAdminModel {
    return FacilityAdministrationEngine.publishCommunication(model, actorId, {
      kind: 'emergency_broadcast', title, body, audience: ['all'], severity: 'critical', channel: ['in_app', 'sms', 'broadcast'],
    }).model;
  }

  static getActiveCommunications(model: FacilityAdminModel): CommunicationRecord[] {
    const now = Date.now();
    return model.communications.filter(c => !c.expiresAt || c.expiresAt > now);
  }

  // ── Protocol Center (dashboard 14) ───────────────────────────────────────────

  static configureProtocol(model: FacilityAdminModel, actorId: AmxUid, input: Omit<ProtocolConfiguration, 'id' | 'status'>): { model: FacilityAdminModel; protocol: ProtocolConfiguration } {
    FacilityAdministrationEngine.guard(model, actorId, 'configure_protocols');
    const protocol: ProtocolConfiguration = { ...input, id: nextId('prt'), status: 'draft' };
    return { model: { ...model, protocols: [...model.protocols, protocol], updatedAt: Date.now() }, protocol };
  }

  static activateProtocol(model: FacilityAdminModel, actorId: AmxUid, protocolId: string, reviewedBy: AmxUid): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'configure_protocols');
    const now = Date.now();
    const protocols = model.protocols.map(p => p.id === protocolId ? { ...p, status: 'active' as const, reviewedBy, reviewedAt: now, effectiveAt: now } : p);
    return { ...model, protocols, updatedAt: now };
  }

  static archiveProtocol(model: FacilityAdminModel, actorId: AmxUid, protocolId: string): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'configure_protocols');
    const protocols = model.protocols.map(p => p.id === protocolId ? { ...p, status: 'archived' as const } : p);
    return { ...model, protocols, updatedAt: Date.now() };
  }

  static getActiveProtocols(model: FacilityAdminModel): ProtocolConfiguration[] {
    return model.protocols.filter(p => p.status === 'active');
  }

  // ── Clinical Intelligence Center (dashboard 15 — admin only observes) ───────

  static updateIntelligence(model: FacilityAdminModel, actorId: AmxUid, patch: Partial<ClinicalIntelligenceSnapshot>): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'monitor_operations');
    return { ...model, intelligence: { ...model.intelligence, ...patch }, updatedAt: Date.now() };
  }

  /** The admin can view Clinical Intelligence but never override its reasoning. */
  static getClinicalIntelligence(model: FacilityAdminModel): ClinicalIntelligenceSnapshot {
    return { ...model.intelligence };
  }

  static overrideClinicalIntelligence(model: FacilityAdminModel, actorId: AmxUid): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'override_clinical_intelligence');
    return model;
  }

  // ── Integration Center (dashboard 16) ────────────────────────────────────────

  static connectIntegration(model: FacilityAdminModel, actorId: AmxUid, input: Omit<IntegrationConnection, 'id' | 'status'>): { model: FacilityAdminModel; integration: IntegrationConnection } {
    FacilityAdministrationEngine.guard(model, actorId, 'configure_integrations');
    const integration: IntegrationConnection = { ...input, id: nextId('int'), status: 'configured' };
    return { model: { ...model, integrations: [...model.integrations, integration], updatedAt: Date.now() }, integration };
  }

  static setIntegrationStatus(model: FacilityAdminModel, actorId: AmxUid, integrationId: string, status: IntegrationConnection['status']): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'configure_integrations');
    const integrations = model.integrations.map(i =>
      i.id === integrationId ? { ...i, status, lastSyncAt: status === 'active' ? Date.now() : i.lastSyncAt } : i,
    );
    return { ...model, integrations, updatedAt: Date.now() };
  }

  static getIntegrationCenter(model: FacilityAdminModel): IntegrationConnection[] {
    return [...model.integrations];
  }

  // ── Data Migration Center (dashboard 17) ────────────────────────────────────

  static runMigration(model: FacilityAdminModel, actorId: AmxUid, entity: MigrationEntity, sourceSystem: string, totalRows: number): { model: FacilityAdminModel; migration: MigrationRecord } {
    FacilityAdministrationEngine.guard(model, actorId, 'import_staff_data');
    const now = Date.now();
    const migration: MigrationRecord = {
      id: nextId('mig'), entity, sourceSystem, totalRows,
      migratedRows: totalRows, failedRows: 0, status: 'completed', startedAt: now, completedAt: now,
    };
    return { model: { ...model, migrations: [...model.migrations, migration], updatedAt: now }, migration };
  }

  static getMigrationSummary(model: FacilityAdminModel): { completed: number; migratedRows: number; failedRows: number } {
    return {
      completed: model.migrations.filter(m => m.status === 'completed').length,
      migratedRows: model.migrations.reduce((a, m) => a + m.migratedRows, 0),
      failedRows: model.migrations.reduce((a, m) => a + m.failedRows, 0),
    };
  }

  // ── Marketplace (dashboard 18) ───────────────────────────────────────────────

  static installModule(model: FacilityAdminModel, actorId: AmxUid, moduleId: MarketplaceModuleId): { model: FacilityAdminModel; installation: MarketplaceInstallation } {
    FacilityAdministrationEngine.guard(model, actorId, 'configure_integrations');
    const now = Date.now();
    const installation: MarketplaceInstallation = { moduleId, installedAt: now, installedBy: actorId, version: '1.0.0', status: 'installed', configured: false };
    const rest = model.marketplace.filter(m => m.moduleId !== moduleId || m.status === 'uninstalled');
    return { model: { ...model, marketplace: [...rest, installation], updatedAt: now }, installation };
  }

  static uninstallModule(model: FacilityAdminModel, actorId: AmxUid, moduleId: MarketplaceModuleId): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'configure_integrations');
    const now = Date.now();
    const marketplace = model.marketplace.map(m => m.moduleId === moduleId ? { ...m, status: 'uninstalled' as const } : m);
    return { ...model, marketplace, updatedAt: now };
  }

  static getInstalledModules(model: FacilityAdminModel): MarketplaceInstallation[] {
    return model.marketplace.filter(m => m.status === 'installed' || m.status === 'updating');
  }

  // ── Security Center (dashboard 19) ───────────────────────────────────────────

  static recordSecurityEvent(model: FacilityAdminModel, event: Omit<SecurityEvent, 'id' | 'at'>): FacilityAdminModel {
    const securityEvents = [...model.securityEvents, { ...event, id: nextId('sec'), at: Date.now() }];
    return { ...model, securityEvents, updatedAt: Date.now() };
  }

  static recordFailedLogin(model: FacilityAdminModel, personId: AmxUid): FacilityAdminModel {
    const now = Date.now();
    const securityEvents = [...model.securityEvents, { id: nextId('sec'), kind: 'failed_login' as const, actorId: personId, at: now, severity: 'warning' as const }];
    return { ...model, securityEvents, updatedAt: now };
  }

  static getFailedLogins(model: FacilityAdminModel, since?: number): SecurityEvent[] {
    return model.securityEvents.filter(e => e.kind === 'failed_login' && (!since || e.at >= since));
  }

  static openSession(model: FacilityAdminModel, personId: AmxUid, deviceLabel: string, ipAddress: string, mfaRequired: boolean): { model: FacilityAdminModel; session: SessionRecord } {
    const now = Date.now();
    const session: SessionRecord = {
      id: nextId('ses'), personId, deviceLabel, ipAddress,
      startedAt: now, lastActiveAt: now, mfaRequired, mfaVerifiedAt: mfaRequired ? undefined : now,
    };
    return { model: { ...model, sessions: [...model.sessions, session], updatedAt: now }, session };
  }

  static revokeSession(model: FacilityAdminModel, actorId: AmxUid, sessionId: string): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'govern_organization');
    const now = Date.now();
    const sessions = model.sessions.map(s => s.id === sessionId ? { ...s, revokedAt: now } : s);
    const securityEvents = [...model.securityEvents, { id: nextId('sec'), kind: 'session_revoked' as const, actorId, targetId: sessionId as unknown as AmxUid, at: now, severity: 'info' as const }];
    return { ...model, sessions, securityEvents, updatedAt: now };
  }

  static createAccessReview(model: FacilityAdminModel, actorId: AmxUid, title: string, scope: string, dueAt: number): { model: FacilityAdminModel; review: AccessReview } {
    FacilityAdministrationEngine.guard(model, actorId, 'approve_governance_workflows');
    const review: AccessReview = { id: nextId('rev'), title, scope, dueAt, findings: 0, status: 'open' };
    return { model: { ...model, accessReviews: [...model.accessReviews, review], updatedAt: Date.now() }, review };
  }

  static completeAccessReview(model: FacilityAdminModel, actorId: AmxUid, reviewId: string, findings: number): FacilityAdminModel {
    FacilityAdministrationEngine.guard(model, actorId, 'approve_governance_workflows');
    const now = Date.now();
    const accessReviews = model.accessReviews.map(r => r.id === reviewId ? { ...r, findings, status: 'completed' as const, completedAt: now, completedBy: actorId } : r);
    const securityEvents = [...model.securityEvents, { id: nextId('sec'), kind: 'access_review' as const, actorId, detail: reviewId, at: now, severity: 'info' as const }];
    return { ...model, accessReviews, securityEvents, updatedAt: now };
  }

  static getSecurityCenter(model: FacilityAdminModel): { failedLogins: number; activeSessions: number; openReviews: number; mfaEnabledCount: number; devices: number } {
    const now = Date.now();
    return {
      failedLogins: model.securityEvents.filter(e => e.kind === 'failed_login').length,
      activeSessions: model.sessions.filter(s => !s.revokedAt && s.lastActiveAt > now - 30 * 60 * 1000).length,
      openReviews: model.accessReviews.filter(r => r.status === 'open').length,
      mfaEnabledCount: model.sessions.filter(s => s.mfaRequired).length,
      devices: model.devices.length,
    };
  }

  // ── Dashboards 1, 2, 8, 20 ───────────────────────────────────────────────────

  static getExecutiveOverview(model: FacilityAdminModel): ExecutiveOverview {
    return {
      hospitalStatus: model.status,
      operational: model.status === 'live',
      bedsAvailable: model.metrics.bedsAvailable,
      patients: model.metrics.patients,
      admissionsToday: model.metrics.admissionsToday,
      dischargesToday: model.metrics.dischargesToday,
      surgeriesToday: model.metrics.surgeriesToday,
      emergencyCount: model.metrics.emergencyCount,
      criticalAlerts: model.metrics.criticalAlerts,
      revenueToday: model.metrics.revenueToday,
      staffOnDuty: model.metrics.staffOnDuty,
      occupancyPercent: model.metrics.occupancyPercent,
      systemHealthPercent: model.metrics.systemHealthPercent,
      generatedAt: Date.now(),
    };
  }

  /** Hospital Digital Twin — the entire organization, navigable top-down. */
  static buildDigitalTwin(model: FacilityAdminModel, structure: DigitalTwinNode): DigitalTwinNode {
    return { ...structure, children: structure.children.map(c => FacilityAdministrationEngine.buildDigitalTwin(model, c)) };
  }

  static getWorkforceAnalytics(model: FacilityAdminModel): { byCategory: Record<WorkforceCategory, number>; total: number; onDuty: number; flaggedCount: number } {
    const snapshot = FacilityAdministrationEngine.getWorkforceCommandCenter(model);
    const byCategory = Object.fromEntries(
      WORKFORCE_CATEGORIES.map(c => [c, snapshot.byCategory[c].total]),
    ) as Record<WorkforceCategory, number>;
    const total = model.workforce.length;
    const onDuty = snapshot.byCategory.doctors.present + snapshot.byCategory.nurses.present + snapshot.byCategory.clinical_officers.present;
    return { byCategory, total, onDuty, flaggedCount: snapshot.flagged.length };
  }

  static getHospitalAnalytics(model: FacilityAdminModel): HospitalAnalyticsSnapshot {
    const now = Date.now();
    const bedOccupancy = model.metrics.occupancyPercent;
    return {
      clinical: {
        admissionsToday: model.metrics.admissionsToday,
        dischargesToday: model.metrics.dischargesToday,
        averageLosDays: model.metrics.averageLosDays,
        labTurnaroundMinutes: model.metrics.labTurnaroundMinutes,
        radiologyTurnaroundMinutes: model.metrics.radiologyTurnaroundMinutes,
      },
      operational: {
        bedOccupancyPercent: bedOccupancy,
        theatreUtilizationPercent: model.metrics.theatreUtilizationPercent,
        waitingTimeAvgMin: model.metrics.waitingTimesMin.length ? model.metrics.waitingTimesMin.reduce((a, w) => a + w.minutes, 0) / model.metrics.waitingTimesMin.length : 0,
        clinicQueueTotal: model.metrics.clinicQueueLengths.reduce((a, q) => a + q.queue, 0),
        systemHealthPercent: model.metrics.systemHealthPercent,
      },
      financial: {
        revenueToday: model.finance.revenueToday,
        expenses: model.finance.expenses,
        outstandingBills: model.finance.outstandingBills,
        claimsApproved: model.finance.claimsApproved,
        claimsSubmitted: model.finance.claimsSubmitted,
      },
      teaching: { ...model.education },
      research: { ...model.research },
      population: {
        patients: model.metrics.patients,
        emergencyCount: model.metrics.emergencyCount,
      },
      quality: { ...model.quality },
      utilization: {
        bedsAvailable: model.metrics.bedsAvailable,
        staffOnDuty: model.metrics.staffOnDuty,
        assetsOperational: model.assets.filter(a => a.status === 'operational').length,
        assetsTotal: model.assets.length,
      },
      forecasts: {
        projectedAdmissionsWeek: Math.round(model.metrics.admissionsToday * 7),
        projectedRevenueMonth: Math.round(model.finance.revenueToday * 30),
        projectedOccupancy: bedOccupancy,
        agingAt: now,
      },
    };
  }
}

function mapCategory(category: string): WorkforceCategory {
  const c = category.toLowerCase();
  if (c.includes('nurse') || c.includes('midwife')) return 'nurses';
  if (c.includes('clinical officer') || c.includes('co ')) return 'clinical_officers';
  if (c.includes('pharmac')) return 'pharmacists';
  if (c.includes('lab')) return 'lab';
  if (c.includes('radio')) return 'radiology';
  if (c.includes('student')) return 'students';
  if (c.includes('resident')) return 'residents';
  if (c.includes('intern')) return 'interns';
  if (c.includes('admin') || c.includes('finance') || c.includes('hr') || c.includes('it') || c.includes('records')) return 'administration';
  return 'doctors';
}
