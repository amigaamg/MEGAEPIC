// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XIII: Theatre Engine
// Waiting list, pre-op checklist, WHO checklist, operation, recovery, complications.
// ═══════════════════════════════════════════════════════════════════════════════

export interface SurgeryBooking {
  id: string;
  patientId: string;
  encounterId: string;
  procedureName: string;
  procedureCode: string;
  specialty: string;
  surgeonId: string;
  surgeonName: string;
  anaesthetistId?: string;
  anaesthetistName?: string;
  assistants: string[];
  theatreId: string;
  scheduledDate: string;
  scheduledStartTime: string;
  estimatedDuration: number;
  status: SurgeryStatus;
  priority: SurgeryPriority;
  urgency: SurgeryUrgency;
  admissionRequired: boolean;
  preoperativeNotes?: string;
  specialRequirements?: string;
  implants?: string[];
  bloodRequired: boolean;
  crossmatchRequired: boolean;
  imagingRequired: boolean;
  createdAt: number;
  updatedAt: number;
}

export enum SurgeryStatus {
  Listed = 'listed',
  Scheduled = 'scheduled',
  PreOpReady = 'pre_op_ready',
  InProgress = 'in_progress',
  Completed = 'completed',
  Recovery = 'recovery',
  PostOp = 'post_op',
  Discharged = 'discharged',
  Cancelled = 'cancelled',
  Postponed = 'postponed',
}

export enum SurgeryPriority {
  Emergency = 'emergency',
  Urgent = 'urgent',
  Elective = 'elective',
  Cosmetic = 'cosmetic',
}

export enum SurgeryUrgency {
  Immediate = 'immediate',
  Within24h = 'within_24h',
  Within1Week = 'within_1_week',
  Within1Month = 'within_1_month',
  Elective = 'elective',
}

export interface WHOChecklist {
  surgeryId: string;
  signIn: WHOChecklistItem[];
  timeOut: WHOChecklistItem[];
  signOut: WHOChecklistItem[];
  completedAt?: number;
  completedBy?: string;
}

export interface WHOChecklistItem {
  step: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: number;
  notes?: string;
}

export interface OperationNote {
  surgeryId: string;
  procedurePerformed: string;
  findings: string;
  specimen: string;
  implants?: string;
  complications?: string;
  bloodLoss?: string;
  fluids?: string;
  surgeonName: string;
  assistantName?: string;
  anaesthetistName?: string;
  anaesthesiaType: string;
  startTime: string;
  endTime: string;
  duration: number;
  recoveryInstructions?: string;
  createdBy: string;
  createdAt: number;
}

export interface TheatreAvailability {
  theatreId: string;
  theatreName: string;
  available: boolean;
  nextAvailableAt?: string;
  currentSurgery?: string;
  cleaningInProgress: boolean;
  equipmentReady: boolean;
}
