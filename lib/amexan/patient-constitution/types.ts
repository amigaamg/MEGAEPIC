export type AmxpId = string & { readonly __brand: 'AmxpId' };

export function generateAmxpId(type: 'patient' | 'temp' = 'patient'): AmxpId {
  const prefix = type === 'patient' ? 'AMXPID' : 'TEMP';
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${year}-${rand}` as AmxpId;
}

export function isValidAmxpId(id: string): id is AmxpId {
  return /^(AMXPID|TEMP)-\d{4}-[A-Z0-9]{8,9}$/.test(id);
}

export type PatientVerificationLevel = 0 | 1 | 2 | 3 | 4;

export const VERIFICATION_LABELS: Record<PatientVerificationLevel, string> = {
  0: 'Anonymous',
  1: 'Basic Verified',
  2: 'Government Verified',
  3: 'Facility Verified',
  4: 'Lifetime Trusted',
};

export interface PatientIdentity {
  amxpId: AmxpId;
  human: HumanIdentity;
  authentication: AuthenticationIdentity;
  verification: VerificationIdentity;
  clinical: ClinicalIdentity[];
  trust: TrustIdentity;
  linkedAccounts: LinkedAccount[];
  createdAt: number;
  updatedAt: number;
}

export interface HumanIdentity {
  fullName: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  sex: 'male' | 'female' | 'other' | 'undisclosed';
  nationality: string;
  nationalId: string;
  passportNumber?: string;
  phone: string;
  email: string;
  photoUrl?: string;
  address: PatientAddress;
  emergencyContact?: EmergencyContactPerson;
  preferredLanguage: string;
  interpreters: string[];
}

export interface PatientAddress {
  country: string;
  county: string;
  subCounty?: string;
  city?: string;
  ward?: string;
  village?: string;
  postalCode?: string;
  street?: string;
}

export interface EmergencyContactPerson {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface AuthenticationIdentity {
  methods: AuthMethod[];
  passwordEnabled: boolean;
  passkeyEnabled: boolean;
  biometricEnabled: boolean;
  mfaEnabled: boolean;
  mfaMethod?: 'totp' | 'sms' | 'email';
  sessions: ActiveSession[];
  devices: TrustedDevice[];
}

export type AuthMethod = 'email' | 'phone_otp' | 'google' | 'apple' | 'microsoft' | 'passkey' | 'biometric' | 'national_id' | 'hospital_portal';

export interface ActiveSession {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'kiosk' | 'unknown';
  ip: string;
  location?: string;
  lastActivity: number;
  createdAt: number;
  expiresAt: number;
  isCurrent: boolean;
}

export interface TrustedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  os?: string;
  browser?: string;
  trustedSince: number;
  lastUsed: number;
}

export interface VerificationIdentity {
  level: PatientVerificationLevel;
  emailVerified: boolean;
  phoneVerified: boolean;
  governmentVerified: boolean;
  facilityVerified: boolean;
  governmentIdType?: 'national_id' | 'passport' | 'birth_certificate' | 'huduma_namba' | 'alien_card';
  governmentIdNumber?: string;
  verificationDocuments: VerificationDocument[];
  verifiedBy?: string;
  verifiedAt?: number;
  verificationExpiry?: number;
}

export interface VerificationDocument {
  id: string;
  type: 'government_id' | 'passport' | 'birth_certificate' | 'insurance_card' | 'student_id' | 'hospital_card' | 'photo';
  url: string;
  verified: boolean;
  verifiedAt?: number;
  verifiedBy?: string;
  uploadedAt: number;
}

export interface ClinicalIdentity {
  facilityId: string;
  facilityName: string;
  mrn: string;
  encounterNumbers: string[];
  linkedSince: number;
  isActive: boolean;
}

export interface TrustIdentity {
  score: number;
  factors: TrustFactor[];
  lastComputed: number;
}

export interface TrustFactor {
  name: string;
  weight: number;
  score: number;
  details?: string;
}

export interface LinkedAccount {
  amxpId: AmxpId;
  relationship: FamilyRelationship;
  fullName: string;
  permissions: FamilyPermission[];
  linkedSince: number;
  isActive: boolean;
}

export type FamilyRelationship =
  | 'self'
  | 'mother' | 'father' | 'parent'
  | 'son' | 'daughter' | 'child'
  | 'brother' | 'sister' | 'sibling'
  | 'grandmother' | 'grandfather' | 'grandparent'
  | 'grandson' | 'granddaughter' | 'grandchild'
  | 'aunt' | 'uncle'
  | 'nephew' | 'niece'
  | 'cousin'
  | 'husband' | 'wife' | 'spouse'
  | 'guardian' | 'ward'
  | 'dependent'
  | 'emergency_contact'
  | 'other';

export type FamilyPermission =
  | 'view_appointments'
  | 'view_medications'
  | 'view_labs'
  | 'view_imaging'
  | 'view_diagnoses'
  | 'view_allergies'
  | 'view_vitals'
  | 'view_immunizations'
  | 'view_growth'
  | 'book_appointments'
  | 'receive_notifications'
  | 'emergency_access'
  | 'full_access';

export type JourneyType =
  | 'pregnancy' | 'newborn' | 'infant' | 'child'
  | 'hypertension' | 'diabetes' | 'asthma' | 'copd'
  | 'heart_failure' | 'ckd' | 'hiv' | 'tb'
  | 'cancer' | 'oncology'
  | 'mental_health' | 'depression'
  | 'surgical' | 'post_operative'
  | 'recovery' | 'rehabilitation'
  | 'acute_illness'
  | 'preventive' | 'wellness'
  | 'vaccination'
  | 'antenatal' | 'postnatal'
  | 'chronic_disease'
  | 'palliative'
  | 'other';

export type JourneyStatus = 'active' | 'pending' | 'completed' | 'resolved' | 'transferred' | 'archived' | 'lost_follow_up' | 'deceased';

export type JourneyPriority = 'critical' | 'high' | 'medium' | 'low' | 'monitoring';

export interface JourneyObject {
  id: string;
  type: JourneyType;
  title: string;
  description?: string;
  status: JourneyStatus;
  priority: JourneyPriority;
  diagnosedAt?: number;
  resolvedAt?: number;
  diagnosedBy?: string;
  diagnosedAtFacility?: string;
  timeline: JourneyEvent[];
  milestones: Milestone[];
  goals: HealthGoal[];
  tasks: JourneyTask[];
  careTeam: CareTeamMember[];
  appointments: string[];
  medications: string[];
  investigations: string[];
  monitoring: MonitoringParameter[];
  education: EducationModule[];
  alerts: JourneyAlert[];
  emergencyPlan?: EmergencyPlan;
  documents: string[];
  notes: string[];
  createdAt: number;
  updatedAt: number;
}

export interface JourneyEvent {
  id: string;
  type: 'diagnosis' | 'admission' | 'discharge' | 'surgery' | 'consultation' | 'investigation' | 'medication_change' | 'vaccination' | 'milestone' | 'education' | 'note';
  title: string;
  description?: string;
  date: number;
  facility?: string;
  provider?: string;
  severity?: 'info' | 'warning' | 'important' | 'critical';
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate?: number;
  completedAt?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'skipped';
  order: number;
}

export interface HealthGoal {
  id: string;
  metric: string;
  target: string;
  current?: string;
  unit?: string;
  status: 'on_track' | 'needs_attention' | 'off_track' | 'achieved' | 'not_set';
  targetDate?: number;
  progress: number;
}

export interface JourneyTask {
  id: string;
  title: string;
  description?: string;
  type: 'medication' | 'appointment' | 'investigation' | 'monitoring' | 'education' | 'exercise' | 'lifestyle' | 'form' | 'other';
  dueDate?: number;
  completedAt?: number;
  status: 'pending' | 'completed' | 'overdue' | 'skipped' | 'cancelled';
  recurrence?: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression?: string;
  dependsOn?: string[];
}

export interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  facility?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface MonitoringParameter {
  id: string;
  name: string;
  unit: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'continuous';
  targetMin?: number;
  targetMax?: number;
  criticalMin?: number;
  criticalMax?: number;
  lastValue?: number;
  lastRecorded?: number;
  trend: 'stable' | 'improving' | 'worsening' | 'unknown';
  readings: MonitoringReading[];
}

export interface MonitoringReading {
  id: string;
  value: number;
  unit: string;
  timestamp: number;
  source: 'manual' | 'device' | 'wearable' | 'lab' | 'clinic';
  notes?: string;
}

export interface EducationModule {
  id: string;
  title: string;
  type: 'video' | 'article' | 'interactive' | 'quiz' | 'pdf';
  category: string;
  completed: boolean;
  completedAt?: number;
  progress: number;
  duration?: number;
  url?: string;
}

export interface JourneyAlert {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'emergency';
  title: string;
  message: string;
  createdAt: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
  status: 'active' | 'acknowledged' | 'resolved' | 'expired';
}

export interface EmergencyPlan {
  conditions: string[];
  instructions: string[];
  medications: string[];
  contacts: EmergencyPlanContact[];
  hospitalPreference?: string;
  bloodGroup?: string;
  allergies: string[];
  qrCodeData?: string;
}

export interface EmergencyPlanContact {
  name: string;
  relationship: string;
  phone: string;
  order: number;
}

export type CareServiceType =
  | 'emergency_care'
  | 'physical_consultation'
  | 'telemedicine'
  | 'home_care'
  | 'diagnostic_lab'
  | 'diagnostic_imaging'
  | 'pharmacy'
  | 'rehabilitation'
  | 'education_service'
  | 'monitoring_service'
  | 'community_care'
  | 'preventive_care'
  | 'wellness'
  | 'ambulance'
  | 'flying_doctor'
  | 'vaccination'
  | 'screening'
  | 'procedure'
  | 'other';

export type CareServiceStatus =
  | 'requested'
  | 'eligibility_checked'
  | 'scheduled'
  | 'confirmed'
  | 'prepared'
  | 'in_progress'
  | 'delivered'
  | 'documented'
  | 'reviewed'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'quality_assessed';

export interface CareService {
  id: string;
  type: CareServiceType;
  title: string;
  description?: string;
  status: CareServiceStatus;
  priority: 'routine' | 'urgent' | 'emergency';
  patientAmxpId: AmxpId;
  journeyId?: string;
  providerId: string;
  providerName: string;
  providerType: 'hospital' | 'clinic' | 'laboratory' | 'pharmacy' | 'individual' | 'telemedicine' | 'ambulance' | 'community' | 'other';
  facilityId: string;
  facilityName: string;
  workflow: ServiceWorkflowStep[];
  requirements: ServiceRequirement[];
  billing?: ServiceBilling;
  documents: string[];
  communications: ServiceCommunication[];
  outcome?: ServiceOutcome;
  feedback?: ServiceFeedback;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface ServiceWorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  completedAt?: number;
  completedBy?: string;
  notes?: string;
}

export interface ServiceRequirement {
  name: string;
  met: boolean;
  details?: string;
}

export interface ServiceBilling {
  estimatedCost: number;
  actualCost?: number;
  currency: string;
  insuranceCovered: number;
  patientContribution: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'waived' | 'refunded';
  paymentMethod?: 'cash' | 'mpesa' | 'card' | 'insurance' | 'bank_transfer' | 'waiver';
  invoiceNumber?: string;
  paidAt?: number;
}

export interface ServiceCommunication {
  id: string;
  type: 'confirmation' | 'reminder' | 'update' | 'result' | 'instruction' | 'feedback_request';
  channel: 'sms' | 'email' | 'push' | 'in_app' | 'whatsapp';
  sentAt: number;
  delivered: boolean;
  readAt?: number;
}

export interface ServiceOutcome {
  result?: string;
  summary?: string;
  documents: string[];
  followUpRequired: boolean;
  followUpServiceId?: string;
  complications?: string[];
  outcomeDate: number;
}

export interface ServiceFeedback {
  rating: number;
  experience?: string;
  waitingTime?: number;
  communication?: number;
  understanding?: number;
  safety?: number;
  suggestions?: string;
  submittedAt: number;
  anonymous: boolean;
}

export type RegistrationStage = 0 | 1 | 2 | 3 | 4 | 5;

export const REGISTRATION_STAGE_LABELS: Record<RegistrationStage, string> = {
  0: 'Anonymous',
  1: 'Quick Registration',
  2: 'Personal Profile',
  3: 'Clinical Identity',
  4: 'Verification',
  5: 'Trusted Lifetime Record',
};

export interface RegistrationState {
  stage: RegistrationStage;
  completedAt?: number;
  method: 'self' | 'parent' | 'guardian' | 'community' | 'hospital' | 'emergency' | 'mass' | 'research';
  guardianAmxpId?: AmxpId;
  data: RegistrationData;
  errors: RegistrationErrors;
  isSubmitting: boolean;
}

export interface RegistrationData {
  stage1: {
    phone: string;
    email: string;
    password?: string;
    authMethod: AuthMethod;
  };
  stage2: {
    fullName: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    sex: 'male' | 'female' | 'other' | 'undisclosed';
    nationality: string;
    preferredLanguage: string;
    address: PatientAddress;
    emergencyContact?: EmergencyContactPerson;
  };
  stage3: {
    nationalId: string;
    nationalIdType: string;
    bloodGroup: string;
    allergies: string[];
    existingConditions: string[];
    currentMedications: string[];
    pregnancyStatus?: 'none' | 'pregnant' | 'breastfeeding' | 'unknown';
    insuranceProvider?: string;
    insuranceNumber?: string;
  };
  stage4: {
    documents: VerificationDocument[];
    governmentVerified: boolean;
    facilityVerified: boolean;
  };
}

export interface RegistrationErrors {
  [key: string]: string | undefined;
}

export interface CareBundle {
  id: string;
  name: string;
  description: string;
  services: CareServiceType[];
  totalEstimatedCost: number;
  currency: string;
  insuranceCoverage: number;
  patientEstimate: number;
  journeyTypes: JourneyType[];
}

export interface PatientDashboardConfig {
  amxpId: AmxpId;
  greeting: string;
  healthScore?: number;
  upcomingAppointment?: CareService;
  activeTasks: number;
  alerts: JourneyAlert[];
  journeys: JourneyObject[];
  careServices: CareService[];
  familyMembers: LinkedAccount[];
  todaysCare: {
    medications: number;
    investigations: number;
    monitoring: number;
    appointments: number;
    education: number;
  };
  recentActivity: JourneyEvent[];
  quickActions: PatientQuickAction[];
}

export interface PatientQuickAction {
  id: string;
  label: string;
  icon: string;
  link: string;
  requiresContext: boolean;
}

export interface SeedProfile {
  name: string;
  email: string;
  password: string;
  role: SeedRole;
  organization: string;
  verification: 'auto_verified' | 'pending' | 'suspended' | 'expired';
  license?: string;
  patientContext?: SeedPatientProfile;
}

export type SeedRole =
  | 'super_admin' | 'platform_architect' | 'constitution_team' | 'knowledge_team'
  | 'rules_engineer' | 'graph_engineer' | 'ai_safety' | 'documentation' | 'qa'
  | 'ux_research' | 'customer_success' | 'finance' | 'marketplace_review' | 'deployment'
  | 'consultant_physician' | 'medical_officer' | 'intern' | 'resident' | 'medical_student'
  | 'consultant_surgeon' | 'pediatrician' | 'obstetrician' | 'psychiatrist'
  | 'anaesthesiologist' | 'emergency_physician' | 'family_physician'
  | 'radiologist' | 'pathologist' | 'lab_scientist' | 'lab_technician'
  | 'pharmacist' | 'nurse' | 'senior_nurse' | 'icu_nurse' | 'theatre_nurse'
  | 'nutritionist' | 'physiotherapist' | 'occupational_therapist' | 'speech_therapist'
  | 'social_worker' | 'receptionist' | 'cashier' | 'facility_administrator'
  | 'patient';

export interface SeedPatientProfile {
  context: string;
  age: number;
  sex: string;
  conditions: string[];
  pregnant?: boolean;
  weeksPregnant?: number;
  verificationLevel: PatientVerificationLevel;
}
