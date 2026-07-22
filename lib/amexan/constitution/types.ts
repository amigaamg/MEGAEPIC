// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CONSTITUTION — Volume XIII
// Identity, Organization, Authorization, Workflow & Governance
// ═══════════════════════════════════════════════════════════════════════════════
// Every user in AMEXAN has exactly one AMX-UID.
// Every dashboard is generated from the intersection of:
//   Identity × ProfessionalIdentity × Organization × Employment × Assignment × Role
// Permission comes LAST, not first.
// ═══════════════════════════════════════════════════════════════════════════════

// ── AMX-UID ───────────────────────────────────────────────────────────────────
// A lifetime universal identifier. Never reassigned, never deleted.
export type AmxUid = string & { readonly __brand: 'AmxUid' };

// ── Layer 1: Identity (lifelong account) ──────────────────────────────────────
export interface Identity {
  uid: AmxUid;
  email: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
  verified: boolean;
  twoFactorEnabled: boolean;
  recoveryEmail?: string;
  recoveryPhone?: string;
  securityKeys: SecurityKey[];
  authProvider: 'email' | 'google' | 'apple' | 'saml' | 'oauth2';
  status: 'active' | 'suspended' | 'deactivated';
  suspensionReason?: string;
}

export interface SecurityKey {
  id: string;
  label: string;
  publicKey: string;
  createdAt: number;
  lastUsedAt: number;
}

// ── Person (the actual human being) ───────────────────────────────────────────
export interface Person {
  uid: AmxUid;
  identityId: AmxUid;
  fullName: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'undisclosed';
  nationality: string;
  nationalId: string;
  passportNumber?: string;
  alternateContact?: string;
  emergencyContact?: EmergencyContact;
  address: Address;
  biometricHash?: string;
  photoUrl?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Address {
  country: string;
  county: string;
  subCounty?: string;
  city?: string;
  postalCode?: string;
  street?: string;
}

// ── Layer 2: Professional Identity ────────────────────────────────────────────
export type ProfessionalCategory =
  | 'medical_doctor'
  | 'nurse'
  | 'pharmacist'
  | 'lab_technologist'
  | 'radiographer'
  | 'physiotherapist'
  | 'occupational_therapist'
  | 'nutritionist'
  | 'social_worker'
  | 'psychologist'
  | 'dentist'
  | 'medical_student'
  | 'nursing_student'
  | 'intern'
  | 'resident'
  | 'consultant'
  | 'specialist'
  | 'clinical_officer'
  | 'midwife'
  | 'community_health_worker'
  | 'administrator'
  | 'it_staff'
  | 'finance_staff'
  | 'hr_staff'
  | 'receptionist'
  | 'records_officer'
  | 'facility_admin'
  | 'super_admin'
  | 'researcher'
  | 'educator'
  | 'patient'
  | 'guardian'
  | 'insurance_officer'
  | 'supplier'
  | 'other';

export type MedicalSpecialty =
  | 'general_surgery' | 'cardiothoracic_surgery' | 'neurosurgery'
  | 'orthopedic_surgery' | 'pediatric_surgery' | 'plastic_surgery'
  | 'vascular_surgery' | 'urology' | 'ent'
  | 'ophthalmology' | 'anesthesiology' | 'emergency_medicine'
  | 'internal_medicine' | 'pediatrics' | 'obstetrics_gynecology'
  | 'psychiatry' | 'radiology' | 'pathology'
  | 'dermatology' | 'neurology' | 'cardiology'
  | 'pulmonology' | 'gastroenterology' | 'nephrology'
  | 'endocrinology' | 'rheumatology' | 'oncology'
  | 'hematology' | 'infectious_disease' | 'family_medicine'
  | 'general_practice' | 'public_health' | 'forensic_medicine'
  | 'sports_medicine' | 'palliative_care' | 'pain_medicine'
  | 'intensive_care' | 'neonatology' | 'other';

export interface ProfessionalIdentity {
  uid: AmxUid;
  personId: AmxUid;
  categories: ProfessionalCategory[];
  primaryCategory: ProfessionalCategory;
  specialties: MedicalSpecialty[];
  primarySpecialty?: MedicalSpecialty;
  subSpecialty?: string;
  licenseNumber?: string;
  licenseCountry?: string;
  licenseExpiry?: number;
  councilNumber?: string;
  councilName?: string;
  qualifications: Qualification[];
  yearsOfExperience: number;
  verified: boolean;
  verificationDocuments: string[];
  verificationDate?: number;
  verifiedBy?: AmxUid;
}

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  country: string;
  documentUrl?: string;
  verified: boolean;
}

// ── Layer 3: Organization ─────────────────────────────────────────────────────
export type OrganizationType =
  | 'hospital' | 'clinic' | 'specialist_center' | 'telemedicine'
  | 'teaching_hospital' | 'research_institute' | 'university'
  | 'pharmacy' | 'laboratory' | 'radiology_center'
  | 'blood_bank' | 'ambulance_service' | 'home_care'
  | 'nursing_home' | 'hospice' | 'rehabilitation_center'
  | 'mental_health_facility' | 'insurance_company'
  | 'ngo' | 'government' | 'regulatory_body'
  | 'medical_supplier' | 'individual_practice'
  | 'other';

export type OrganizationLevel = 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5' | 'level_6';

export interface Organization {
  id: string;
  name: string;
  legalName: string;
  type: OrganizationType;
  level: OrganizationLevel;
  registrationNumber: string;
  taxId?: string;
  logoUrl?: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  parentOrganizationId?: string;
  branches: OrganizationBranch[];
  departments: Department[];
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  verified: boolean;
  verifiedAt?: number;
  verifiedBy?: AmxUid;
  createdAt: number;
  updatedAt: number;
  ownedBy: AmxUid;
  config: OrganizationConfig;
  license: OrganizationLicense;
  pricingTier: PricingTier;
}

export interface OrganizationBranch {
  id: string;
  name: string;
  address: Address;
  phone: string;
  email?: string;
  type: OrganizationType;
  status: 'active' | 'inactive';
  departments: string[];
}

export interface OrganizationConfig {
  documentHeader: DocumentHeaderConfig;
  branding: BrandingConfig;
  clinical: ClinicalConfig;
  billing: BillingConfig;
  integrations: IntegrationConfig;
}

export interface DocumentHeaderConfig {
  logoUrl: string;
  facilityName: string;
  facilityAddress: string;
  facilityPhone: string;
  facilityEmail: string;
  mpesaPaybill?: string;
  insurancePanels?: string[];
  headerTemplate: string;
  footerTemplate: string;
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface ClinicalConfig {
  defaultWards: string[];
  defaultClinics: string[];
  defaultTheatres: string[];
  diagnosisCodeSystem: 'icd_10' | 'icd_11' | 'icpc_2' | 'dsm_5';
  medicationCodeSystem: 'atc' | 'local';
  labCodeSystem: 'loinc' | 'local';
  imagingCodeSystem: 'radlex' | 'local';
  enableTelemedicine: boolean;
  enableAI: boolean;
  enableResearch: boolean;
}

export interface BillingConfig {
  currency: string;
  taxRate: number;
  consultationFees: Record<string, number>;
  bedCharges: Record<string, number>;
  pharmacyMarkup: number;
  labMarkup: number;
  imagingMarkup: number;
  insuranceAccepted: string[];
  paymentMethods: ('cash' | 'mpesa' | 'insurance' | 'card' | 'bank_transfer')[];
}

export interface IntegrationConfig {
  fhirEnabled: boolean;
  fhirEndpoint?: string;
  fhirVersion?: 'r4' | 'stu3' | 'dstu2';
  hl7Enabled: boolean;
  hl7Endpoint?: string;
  externalHmisEnabled: boolean;
  externalHmisName?: string;
  externalHmisEndpoint?: string;
  aiServicesEnabled: boolean;
  aiServiceEndpoint?: string;
  apiEnabled: boolean;
  webhookUrl?: string;
}

export interface OrganizationLicense {
  licenseNumber: string;
  licenseType: string;
  issuingAuthority: string;
  issuedAt: number;
  expiresAt: number;
  renewedAt: number;
  status: 'valid' | 'expired' | 'revoked' | 'pending';
  restrictedProcedures?: string[];
}

export type PricingTier = 'free' | 'basic' | 'professional' | 'enterprise' | 'government';

// ── Layer 4: Department / Unit ────────────────────────────────────────────────
export interface Department {
  id: string;
  organizationId: string;
  branchId?: string;
  name: string;
  code: string;
  type: DepartmentType;
  parentDepartmentId?: string;
  headOfDepartment?: AmxUid;
  location?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  wards: Ward[];
  clinics: Clinic[];
  theatres: Theatre[];
  units: Unit[];
  createdAt: number;
}

export type DepartmentType =
  | 'administration' | 'hr' | 'finance' | 'it'
  | 'emergency' | 'outpatient' | 'inpatient'
  | 'surgery' | 'medicine' | 'pediatrics' | 'obstetrics_gynaecology'
  | 'psychiatry' | 'radiology' | 'laboratory' | 'pharmacy'
  | 'icu' | 'nicu' | 'hdu' | 'nursing'
  | 'mortuary' | 'laundry' | 'kitchen' | 'maintenance'
  | 'research' | 'training' | 'quality' | 'infection_control'
  | 'blood_bank' | 'ambulance' | 'physiotherapy'
  | 'dental' | 'eye' | 'ent' | 'dermatology'
  | 'oncology' | 'cardiology' | 'neurology'
  | 'renal' | 'pulmonology' | 'gastroenterology'
  | 'endocrinology' | 'rheumatology' | 'hematology'
  | 'palliative_care' | 'pain_management'
  | 'other';

export interface Ward {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  type: 'general' | 'private' | 'icu' | 'hdu' | 'nicu' | 'isolation' | 'maternity' | 'pediatric' | 'psychiatric' | 'rehabilitation';
  capacity: number;
  currentOccupancy: number;
  gender?: 'male' | 'female' | 'mixed';
  location: string;
  phone?: string;
}

export interface Clinic {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  specialty: MedicalSpecialty;
  location: string;
  schedule: string;
  phone?: string;
}

export interface Theatre {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  type: 'major' | 'minor' | 'emergency' | 'ophthalmic' | 'orthopedic' | 'cardiac' | 'obstetric';
  location: string;
  equipment: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
}

export interface Unit {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  type: string;
  location: string;
  phone?: string;
}

// ── Layer 5: Employment ───────────────────────────────────────────────────────
export type EmploymentStatus =
  | 'permanent' | 'contract' | 'locum' | 'part_time'
  | 'intern' | 'volunteer' | 'seconded' | 'visiting'
  | 'honorary' | 'research_fellow' | 'consultant'
  | 'temporary' | 'probation' | 'terminated' | 'resigned'
  | 'retired' | 'suspended';

export interface Employment {
  id: string;
  personId: AmxUid;
  organizationId: string;
  departmentId: string;
  unitId?: string;
  professionalIdentityId: string;
  employeeId: string;
  jobTitle: string;
  employmentType: EmploymentStatus;
  startDate: number;
  endDate?: number;
  isPrimary: boolean;
  supervisorId?: AmxUid;
  schedule: WorkSchedule;
  privileges: string[];
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  terminationReason?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorkSchedule {
  type: 'full_time' | 'shift' | 'flexible' | 'on_call';
  weeklyHours: number;
  shiftPattern?: ShiftPattern;
  workingDays: number[];
  onCallRotation?: string;
  leaveBalance: LeaveBalance;
}

export type ShiftPattern = 'fixed' | 'rotating' | 'day_night' | 'weekday_weekend' | 'custom';

export interface LeaveBalance {
  annual: number;
  sick: number;
  study: number;
  maternity: number;
  paternity: number;
  compassionate: number;
  unpaid: number;
}

// ── Layer 6: Assignment (what you're doing today) ────────────────────────────
export type AssignmentType =
  | 'ward_round' | 'clinic' | 'theatre' | 'emergency_call'
  | 'icu_duty' | 'consultation' | 'admission' | 'discharge'
  | 'procedure' | 'home_visit' | 'teleconsultation'
  | 'lecture' | 'research' | 'administration'
  | 'supervision' | 'on_call' | 'standby'
  | 'outreach' | 'other';

export interface Assignment {
  id: string;
  personId: AmxUid;
  employmentId: string;
  organizationId: string;
  departmentId: string;
  type: AssignmentType;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  location: AssignmentLocation;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'overdue';
  priority: 'routine' | 'urgent' | 'emergency' | 'critical';
  assignedBy: AmxUid;
  assignedAt: number;
  completedAt?: number;
  linkedPatientIds?: string[];
  linkedEncounterIds?: string[];
  requiresSignature: boolean;
  notes?: string;
}

export interface AssignmentLocation {
  type: 'ward' | 'clinic' | 'theatre' | 'icu' | 'emergency' | 'remote' | 'outreach';
  wardId?: string;
  clinicId?: string;
  theatreId?: string;
  room?: string;
  building?: string;
  floor?: string;
}

// ── Layer 7: Roles & Permissions ──────────────────────────────────────────────
export interface Role {
  id: string;
  organizationId?: string;
  name: string;
  description: string;
  type: 'system' | 'organization' | 'department' | 'custom';
  permissions: Permission[];
  inheritsFrom?: string[];
  isAssignable: boolean;
  maxAssignments?: number;
  createdBy: AmxUid;
  createdAt: number;
  updatedAt: number;
}

export interface Permission {
  resource: ResourceType;
  actions: Action[];
  scope: PermissionScope;
  conditions?: PermissionCondition[];
  deny: boolean;
}

export type ResourceType =
  | 'patient' | 'encounter' | 'prescription' | 'lab_order' | 'imaging_order'
  | 'clinical_note' | 'discharge_summary' | 'discharge' | 'referral' | 'consent'
  | 'vitals' | 'observations' | 'assessment' | 'care_plan'
  | 'staff' | 'department' | 'organization' | 'finance'
  | 'admin' | 'system_config' | 'audit_log' | 'reports'
  | 'inventory' | 'pharmacy' | 'theatre' | 'blood_bank'
  | 'research_data' | 'ai_insights' | 'telemedicine'
  | 'schedule' | 'hr' | 'training' | 'quality'
  | 'view_analytics' | 'manage_staff' | 'manage_org' | 'manage_roles' | 'view_finance';

export type Action =
  | 'create' | 'read' | 'update' | 'delete' | 'approve'
  | 'reject' | 'sign' | 'verify' | 'audit' | 'export'
  | 'import' | 'share' | 'delegate' | 'assign'
  | 'prescribe' | 'dispense' | 'administer'
  | 'order_lab' | 'order_imaging' | 'order_blood'
  | 'request_consult' | 'refer' | 'discharge'
  | 'admit' | 'transfer' | 'schedule' | 'cancel'
  | 'view_finance' | 'manage_billing' | 'manage_inventory'
  | 'manage_staff' | 'manage_roles' | 'manage_org'
  | 'view_analytics' | 'view_reports' | 'manage_system'
  | 'admin';

export interface PermissionScope {
  type: 'global' | 'organization' | 'department' | 'ward' | 'self' | 'custom';
  organizationIds?: string[];
  departmentIds?: string[];
  wardIds?: string[];
  patientIds?: string[];
  encounterIds?: string[];
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'neq' | 'lt' | 'gt' | 'lte' | 'gte' | 'in' | 'not_in' | 'contains';
  value: any;
}

// ── Layer 8: Responsibilities ─────────────────────────────────────────────────
export interface Responsibility {
  id: string;
  personId: AmxUid;
  organizationId: string;
  type: ResponsibilityType;
  targetId: string;
  targetName: string;
  targetType: 'ward' | 'clinic' | 'theatre' | 'patient' | 'department' | 'unit' | 'program';
  startDate: number;
  endDate?: number;
  isPrimary: boolean;
  status: 'active' | 'inactive' | 'completed';
}

export type ResponsibilityType =
  | 'ward_coverage' | 'clinic_coverage' | 'theatre_schedule'
  | 'primary_doctor' | 'consultant' | 'supervisor'
  | 'nurse_in_charge' | 'case_manager' | 'unit_head'
  | 'on_call_duty' | 'quality_officer' | 'infection_control'
  | 'research_lead' | 'training_coordinator';

// ── Digital Signature ─────────────────────────────────────────────────────────
export interface DigitalSignature {
  id: string;
  personId: AmxUid;
  signedBy: AmxUid;
  signedByName: string;
  signedByRole: string;
  signedByOrganizationId: string;
  signedByDepartmentId: string;
  signedAt: number;
  signatureType: 'full' | 'initial' | 'witness' | 'co_sign' | 'approval';
  documentType: string;
  documentId: string;
  documentHash: string;
  meaning: string;
  ipAddress?: string;
  deviceInfo?: string;
  location?: string;
  isValid: boolean;
  revokedAt?: number;
  revocationReason?: string;
}

// ── Audit Trail ────────────────────────────────────────────────────────────────
export interface AuditEntry {
  id: string;
  timestamp: number;
  actor: AmxUid;
  actorName: string;
  actorRole: string;
  actorOrganizationId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  deviceInfo?: string;
  sessionId?: string;
  digitalSignatureId?: string;
  reason?: string;
  integrityHash: string;
}

// ── Workflow Definition ────────────────────────────────────────────────────────
export type ClinicalWorkflowType =
  | 'ward_round' | 'clinic_visit' | 'emergency_triage' | 'admission'
  | 'discharge' | 'referral' | 'theatre_list' | 'consultation'
  | 'home_visit' | 'teleconsultation' | 'lab_review' | 'imaging_review'
  | 'handover' | 'morning_report' | 'mortality_meeting';

export interface WorkflowDefinition {
  id: string;
  type: ClinicalWorkflowType;
  name: string;
  description: string;
  organizationId?: string;
  departmentId?: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  estimatedDuration: number;
  requiredRoles: string[];
  optionalRoles: string[];
  status: 'active' | 'inactive' | 'archived';
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  type: 'assessment' | 'documentation' | 'ordering' | 'procedure' | 'review' | 'approval' | 'handover';
  assigneeRole: string;
  estimatedDuration: number;
  requiredFields: string[];
  optionalFields: string[];
  nextSteps: string[];
  branchingRules?: BranchingRule[];
  mandatory: boolean;
}

export interface BranchingRule {
  condition: string;
  nextStepId: string;
  alternativeStepId?: string;
}

export interface WorkflowTrigger {
  type: 'scheduled' | 'event' | 'manual' | 'automatic';
  schedule?: string;
  eventType?: string;
  conditions?: string[];
}

// ── User Session (loaded at login, cached) ────────────────────────────────────
export interface UserSession {
  identity: Identity;
  person: Person;
  professional: ProfessionalIdentity | null;
  employments: Employment[];
  currentEmployment: Employment | null;
  currentOrganization: Organization | null;
  currentDepartment: Department | null;
  currentAssignments: Assignment[];
  role: Role;
  permissions: Permission[];
  responsibilities: Responsibility[];
  isAuthenticated: boolean;
  isLoading: boolean;
  onDuty: boolean;
  currentShift?: WorkSchedule;
  activePatientIds: string[];
  activeEncounterIds: string[];
}

// ── Dashboard Template (generated from session) ──────────────────────────────
export interface DashboardTemplate {
  title: string;
  greeting: string;
  sections: DashboardSection[];
  quickActions: QuickAction[];
  notifications: DashboardNotification[];
  workspaceLinks: DashboardLink[];
}

export interface DashboardSection {
  id: string;
  title: string;
  type: 'tasks' | 'patients' | 'alerts' | 'schedule' | 'queue' | 'stats' | 'activity';
  items: DashboardItem[];
  priority: number;
  emptyMessage?: string;
}

export interface DashboardItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'overdue' | 'urgent' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  time?: string;
  patientId?: string;
  patientName?: string;
  encounterId?: string;
  link?: string;
  action?: string;
  actionLink?: string;
  assignedBy?: string;
  assignedAt?: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  link: string;
  color?: string;
  shortcut?: string;
  requiresContext: boolean;
}

export interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'alert';
  title: string;
  message: string;
  time: number;
  read: boolean;
  link?: string;
  actionable: boolean;
  actionLabel?: string;
  actionLink?: string;
}

export interface DashboardLink {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  badgeColor?: string;
}
