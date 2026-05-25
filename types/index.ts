import { Timestamp } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

export type RiskLevel = "low" | "moderate" | "high" | "very_high";
export type ToolType = "hypertension" | "diabetes" | "glaucoma" | "heart_failure" | "ckd";
export type ToolStatus = "active" | "closed" | "paused";
export type AlertType = "critical" | "warning" | "info";
export type FollowUpStatus = "scheduled" | "attended" | "missed" | "cancelled";
export type FollowUpType = "clinic" | "phone" | "virtual" | "home_visit";
export type PrescriptionStatus = "active" | "stopped" | "on_hold";
export type OrderPriority = "routine" | "urgent" | "stat";
export type OrderStatus = "pending" | "resulted" | "reviewed" | "cancelled";
export type NoteType = "visit" | "phone" | "lab_review" | "medication_change" | "complication" | "discharge";
export type LoggedBy = "patient" | "doctor" | "nurse" | "system";

// ─────────────────────────────────────────────────────────────
// PATIENTS
// ─────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  dob: Timestamp;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
  nationalId?: string;
  address?: string;
  nextOfKin?: {
    name: string;
    phone: string;
    relationship: string;
  };
  assignedDoctorId: string;
  riskLevel: RiskLevel;
  activeToolTypes: ToolType[];
  profilePhotoUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────
// DOCTORS
// ─────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  facilityName: string;
  facilityId: string;
  photoUrl?: string;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────
// PATIENT TOOLS
// ─────────────────────────────────────────────────────────────

export interface AlertThreshold {
  systolicCritical: number;     // default 180
  diastolicCritical: number;    // default 120
  systolicWarning: number;      // default 160
  diastolicWarning: number;     // default 100
  systolicTarget: number;       // default 130
  diastolicTarget: number;      // default 80
  hypotensionSystolic: number;  // default 90
  adherenceLow: number;         // default 70 (%)
  bpReadingGapDays: number;     // default 3
  uncontrolledReadingsCount: number; // default 7 readings
  uncontrolledReadingsDays: number;  // default 14 days
}

export const DEFAULT_HTN_THRESHOLDS: AlertThreshold = {
  systolicCritical: 180,
  diastolicCritical: 120,
  systolicWarning: 160,
  diastolicWarning: 100,
  systolicTarget: 130,
  diastolicTarget: 80,
  hypotensionSystolic: 90,
  adherenceLow: 70,
  bpReadingGapDays: 3,
  uncontrolledReadingsCount: 7,
  uncontrolledReadingsDays: 14,
};

export interface PatientTool {
  id: string;
  patientId: string;
  toolType: ToolType;
  diagnosis: string;
  assignedAt: Timestamp;
  assignedBy: string;           // doctorId
  doctorId: string;
  status: ToolStatus;
  // HTN-specific settings
  targetBP: string;             // e.g. "<130/80"
  alertThresholds: AlertThreshold;
  monitoringFrequency: "daily" | "twice_daily" | "every_2_days" | "weekly";
  clinicalNotes?: string;       // initial setup notes
  closedAt?: Timestamp;
  closedReason?: string;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────
// BP ENTRIES
// ─────────────────────────────────────────────────────────────

export type BPStatus = "controlled" | "elevated" | "high" | "crisis" | "hypotension";

export interface BPEntry {
  id: string;
  toolId: string;
  patientId: string;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  loggedBy: LoggedBy;
  loggedByUid: string;
  timestamp: Timestamp;
  notes?: string;
  flagged: boolean;
  status: BPStatus;             // computed on write
  arm?: "left" | "right";
  position?: "sitting" | "standing" | "lying";
  device?: string;
}

// ─────────────────────────────────────────────────────────────
// PRESCRIPTIONS
// ─────────────────────────────────────────────────────────────

export interface DoseChange {
  date: Timestamp;
  previousDose: string;
  newDose: string;
  reason: string;
  changedBy: string;            // doctorId
}

export interface Prescription {
  id: string;
  toolId: string;
  patientId: string;
  drug: string;
  drugClass: string;            // CCB, ARB, ACEi, Thiazide, etc.
  dose: string;                 // e.g. "10 mg"
  frequency: string;            // e.g. "once daily"
  route: string;                // oral, topical, etc.
  startDate: Timestamp;
  stopDate?: Timestamp;
  stopReason?: string;
  stoppedBy?: string;           // doctorId
  prescribedBy: string;         // doctorId
  status: PrescriptionStatus;
  doseChanges: DoseChange[];
  indication?: string;
  instructions?: string;        // patient-facing instructions
  sideEffectsToWatch?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────
// MEDICATION ADHERENCE
// ─────────────────────────────────────────────────────────────

export interface AdherenceEntry {
  id: string;
  prescriptionId: string;
  toolId: string;
  patientId: string;
  date: Timestamp;
  taken: boolean;
  takenAt?: Timestamp;
  notes?: string;
  loggedBy: LoggedBy;
}

// ─────────────────────────────────────────────────────────────
// CLINICAL NOTES (SOAP)
// ─────────────────────────────────────────────────────────────

export interface ClinicalNote {
  id: string;
  toolId: string;
  patientId: string;
  doctorId: string;
  visitDate: Timestamp;
  type: NoteType;
  // SOAP
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  // Vitals at time of note
  vitals?: {
    bp?: string;
    hr?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    temperature?: number;
    spo2?: number;
  };
  // Links
  linkedFollowUpId?: string;
  linkedPrescriptionIds?: string[];
  linkedLabOrderIds?: string[];
  linkedImagingIds?: string[];
  // Attachments
  attachments?: {
    name: string;
    url: string;
    type: string;
    uploadedAt: Timestamp;
  }[];
  isLocked: boolean;            // locked after 48h, requires admin to edit
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────
// FOLLOW-UPS
// ─────────────────────────────────────────────────────────────

export interface FollowUp {
  id: string;
  toolId: string;
  patientId: string;
  scheduledDate: Timestamp;
  scheduledBy: string;          // doctorId
  type: FollowUpType;
  status: FollowUpStatus;
  attendedDate?: Timestamp;
  notes?: string;
  linkedNoteId?: string;
  reminderSent: boolean;
  reminderSentAt?: Timestamp;
  patientConfirmed: boolean;
  reasonForMissing?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────
// LAB ORDERS
// ─────────────────────────────────────────────────────────────

export interface LabResult {
  test: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: "normal" | "low" | "high" | "critical";
  resultDate: Timestamp;
}

export interface LabOrder {
  id: string;
  toolId: string;
  patientId: string;
  orderedBy: string;            // doctorId
  tests: string[];
  priority: OrderPriority;
  indication: string;
  orderedAt: Timestamp;
  results?: LabResult[];
  resultsDate?: Timestamp;
  status: OrderStatus;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNotes?: string;
  linkedNoteId?: string;
}

// ─────────────────────────────────────────────────────────────
// IMAGING ORDERS
// ─────────────────────────────────────────────────────────────

export interface ImagingOrder {
  id: string;
  toolId: string;
  patientId: string;
  modality: string;             // Echocardiogram, CXR, Renal US, Fundoscopy, etc.
  indication: string;
  priority: OrderPriority;
  orderedBy: string;            // doctorId
  orderedAt: Timestamp;
  reportText?: string;
  reportDate?: Timestamp;
  reportedBy?: string;
  keyFindings?: string[];
  interpretationNotes?: string; // doctor's interpretation
  status: OrderStatus;
  linkedNoteId?: string;
  attachmentUrl?: string;
}

// ─────────────────────────────────────────────────────────────
// SYSTEM ALERTS
// ─────────────────────────────────────────────────────────────

export type AlertTrigger =
  | "bp_crisis"
  | "bp_emergency_pattern"
  | "renal_deterioration"
  | "uncontrolled_bp_pattern"
  | "medication_non_adherence"
  | "missed_follow_up"
  | "overdue_lab"
  | "potassium_drug_interaction"
  | "bp_reading_gap"
  | "visit_reminder_48h"
  | "visit_reminder_2h"
  | "bp_improving"
  | "new_doctor_instruction"
  | "hypotension_detected"
  | "lab_critical_value";

export interface SystemAlert {
  id: string;
  toolId: string;
  patientId: string;
  doctorId: string;
  type: AlertType;
  trigger: AlertTrigger;
  value: Record<string, unknown>;   // the data that triggered the alert
  message: string;                  // human-readable message
  patientMessage?: string;          // message sent to patient (different from doctor message)
  sentAt: Timestamp;
  acknowledgedBy?: string;
  acknowledgedAt?: Timestamp;
  isActive: boolean;
  notificationChannels: ("push" | "sms" | "email" | "in_app")[];
  deliveredAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────────
// DOCTOR → PATIENT MESSAGES
// ─────────────────────────────────────────────────────────────

export interface DoctorMessage {
  id: string;
  toolId: string;
  patientId: string;
  doctorId: string;
  subject: string;
  body: string;
  type: "instruction" | "alert" | "result" | "reminder" | "general";
  priority: "normal" | "urgent";
  sentAt: Timestamp;
  readAt?: Timestamp;
  isRead: boolean;
  attachments?: { name: string; url: string }[];
}

// ─────────────────────────────────────────────────────────────
// COMPLICATIONS
// ─────────────────────────────────────────────────────────────

export interface Complication {
  id: string;
  toolId: string;
  patientId: string;
  name: string;
  dateDetected: Timestamp;
  severity: "mild" | "moderate" | "severe";
  status: "active" | "resolving" | "resolved";
  referral?: string;
  referralDate?: Timestamp;
  notes: string;
  linkedLabOrderIds?: string[];
  linkedImagingIds?: string[];
  reportedBy: string;           // doctorId
  resolvedAt?: Timestamp;
  resolutionNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────────────────────

export interface BPStats {
  latestSystolic: number;
  latestDiastolic: number;
  latestDate: Timestamp;
  avg7daySystolic: number;
  avg7dayDiastolic: number;
  avg30daySystolic: number;
  avg30dayDiastolic: number;
  avg90daySystolic: number;
  avg90dayDiastolic: number;
  pctInTarget: number;
  pctCrisis: number;
  trend: "improving" | "stable" | "worsening";
  totalReadings: number;
}

export interface HTNDashboardData {
  patient: Patient;
  tool: PatientTool;
  bpStats: BPStats;
  recentBPEntries: BPEntry[];
  activePrescriptions: Prescription[];
  upcomingFollowUp: FollowUp | null;
  activeAlerts: SystemAlert[];
  recentNote: ClinicalNote | null;
  pendingLabOrders: LabOrder[];
  activeComplications: Complication[];
}