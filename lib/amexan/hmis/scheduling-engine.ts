// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XVI: Universal Scheduling Engine
// Appointments, resource scheduling, shift management, calendar integration.
// ═══════════════════════════════════════════════════════════════════════════════

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  encounterId?: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  departmentId: string;
  providerId: string;
  providerName: string;
  facilityId: string;
  scheduledDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: number;
  actualEnd?: number;
  waitTimeMinutes?: number;
  durationMinutes: number;
  reason: string;
  notes?: string;
  isVirtual: boolean;
  reminderSent: boolean;
  reminderChannel?: 'sms' | 'email' | 'push' | 'whatsapp';
  confirmedAt?: number;
  cancelledAt?: number;
  cancellationReason?: string;
  rescheduledFrom?: string;
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export enum AppointmentType {
  Outpatient = 'outpatient',
  FollowUp = 'follow_up',
  Procedure = 'procedure',
  Telemedicine = 'telemedicine',
  HomeVisit = 'home_visit',
  Vaccination = 'vaccination',
  Antenatal = 'antenatal',
  Postnatal = 'postnatal',
  WellChild = 'well_child',
  ChronicDisease = 'chronic_disease',
  Counselling = 'counselling',
  Physiotherapy = 'physiotherapy',
  Diagnostic = 'diagnostic',
  PreOperative = 'pre_operative',
  PostOperative = 'post_operative',
  Emergency = 'emergency',
  Triage = 'triage',
  Review = 'review',
  Other = 'other',
}

export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  CheckedIn = 'checked_in',
  InProgress = 'in_progress',
  Completed = 'completed',
  NoShow = 'no_show',
  Cancelled = 'cancelled',
  Rescheduled = 'rescheduled',
  OnHold = 'on_hold',
}

export enum AppointmentPriority {
  Emergency = 'emergency',
  Urgent = 'urgent',
  Routine = 'routine',
  Elective = 'elective',
  FollowUp = 'follow_up',
}

export interface ScheduleSlot {
  id: string;
  providerId: string;
  departmentId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isAvailable: boolean;
  appointmentId?: string;
  type: SlotType;
  location?: string;
  recurring: boolean;
  recurringPattern?: RecurringPattern;
}

export enum SlotType {
  Regular = 'regular',
  Emergency = 'emergency',
  WalkIn = 'walk_in',
  Telemedicine = 'telemedicine',
  Blocked = 'blocked',
  Break = 'break',
  Training = 'training',
  Meeting = 'meeting',
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  maxOccurrences?: number;
}

export interface ProviderSchedule {
  providerId: string;
  providerName: string;
  departmentId: string;
  slots: ScheduleSlot[];
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  utilizationRate: number;
  date: string;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  departmentId: string;
  shiftType: ShiftType;
  date: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  status: ShiftStatus;
  swappedWith?: string;
  notes?: string;
}

export enum ShiftType {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Night = 'night',
  LongDay = 'long_day',
  OnCall = 'on_call',
  Standby = 'standby',
  Off = 'off',
  Training = 'training',
}

export enum ShiftStatus {
  Scheduled = 'scheduled',
  Confirmed = 'confirmed',
  InProgress = 'in_progress',
  Completed = 'completed',
  Late = 'late',
  Absent = 'absent',
  Swapped = 'swapped',
  Cancelled = 'cancelled',
}

export interface ScheduleConflict {
  type: 'double_booking' | 'overlap' | 'staff_unavailable' | 'resource_unavailable' | 'outside_hours';
  description: string;
  conflictingIds: string[];
  severity: 'warning' | 'error';
}

export function createAppointment(params: {
  patientId: string; patientName: string; appointmentType: AppointmentType;
  departmentId: string; providerId: string; providerName: string; facilityId: string;
  scheduledDate: string; scheduledStart: string; durationMinutes: number; reason: string;
  isVirtual?: boolean; priority?: AppointmentPriority;
}): Appointment {
  const now = Date.now();
  const start = new Date(`${params.scheduledDate}T${params.scheduledStart}`);
  const end = new Date(start.getTime() + params.durationMinutes * 60000);
  return {
    id: `APT-${now.toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    patientId: params.patientId, patientName: params.patientName,
    appointmentType: params.appointmentType, status: AppointmentStatus.Pending,
    priority: params.priority || AppointmentPriority.Routine,
    departmentId: params.departmentId, providerId: params.providerId, providerName: params.providerName,
    facilityId: params.facilityId, scheduledDate: params.scheduledDate,
    scheduledStart: params.scheduledStart,
    scheduledEnd: end.toTimeString().substring(0, 5),
    durationMinutes: params.durationMinutes, reason: params.reason,
    isVirtual: params.isVirtual || false, reminderSent: false,
    metadata: {}, createdAt: now, updatedAt: now,
  };
}

export function checkSlotAvailability(slots: ScheduleSlot[], date: string, startTime: string, endTime: string): ScheduleSlot | null {
  const start = startTime;
  const end = endTime;
  return slots.find(s => s.date === date && s.startTime <= start && s.endTime >= end && s.isAvailable) || null;
}

export function detectScheduleConflicts(appointments: Appointment[], newAppt: Appointment): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const sameProvider = appointments.filter(a =>
    a.providerId === newAppt.providerId && a.scheduledDate === newAppt.scheduledDate &&
    a.id !== newAppt.id && a.status !== AppointmentStatus.Cancelled && a.status !== AppointmentStatus.Rescheduled
  );
  for (const existing of sameProvider) {
    if (existing.scheduledStart < newAppt.scheduledEnd && existing.scheduledEnd > newAppt.scheduledStart) {
      conflicts.push({ type: 'double_booking', description: `Overlaps with ${existing.id}`, conflictingIds: [existing.id], severity: 'error' });
    }
  }
  return conflicts;
}

export function getAppointmentSummary(appointments: Appointment[]): {
  total: number; pending: number; confirmed: number; completed: number;
  noShow: number; cancelled: number; todayCount: number;
  byType: Record<string, number>; byProvider: Record<string, number>;
  noShowRate: number; avgWaitMinutes: number;
} {
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.scheduledDate === today);
  const byType: Record<string, number> = {};
  const byProvider: Record<string, number> = {};
  for (const a of appointments) {
    byType[a.appointmentType] = (byType[a.appointmentType] || 0) + 1;
    byProvider[a.providerName] = (byProvider[a.providerName] || 0) + 1;
  }
  const noShowCount = appointments.filter(a => a.status === AppointmentStatus.NoShow).length;
  const waitTimes = appointments.filter(a => a.waitTimeMinutes != null).map(a => a.waitTimeMinutes!);
  return {
    total: appointments.length,
    pending: appointments.filter(a => a.status === AppointmentStatus.Pending).length,
    confirmed: appointments.filter(a => a.status === AppointmentStatus.Confirmed).length,
    completed: appointments.filter(a => a.status === AppointmentStatus.Completed).length,
    noShow: noShowCount,
    cancelled: appointments.filter(a => a.status === AppointmentStatus.Cancelled).length,
    todayCount: todayAppts.length,
    byType, byProvider,
    noShowRate: appointments.length > 0 ? (noShowCount / appointments.length) * 100 : 0,
    avgWaitMinutes: waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0,
  };
}
