import { type AmxUid } from '@/lib/amexan/identity/types'

export interface Employment {
  uid: AmxUid
  orgId: AmxUid
  deptId: string
  position: string
  type: 'full_time' | 'part_time' | 'locum' | 'contract' | 'volunteer'
  startDate: number
  endDate?: number
  supervisorId?: AmxUid
  status: 'active' | 'suspended' | 'terminated'
}

export interface Position {
  id: string
  title: string
  seniority: SeniorityLevel
  competenciesRequired: string[]
}

export enum SeniorityLevel {
  Intern = 0,
  MedicalOfficer = 1,
  Registrar = 2,
  Consultant = 3,
  HeadOfDepartment = 4,
  Director = 5,
}

export interface Competency {
  id: string
  name: string
  issuingBody: string
  expiryDate?: number
}

export interface Shift {
  id: string
  workerId: AmxUid
  startTime: number
  endTime: number
  type: 'morning' | 'afternoon' | 'night' | 'on_call' | 'weekend'
  status: 'scheduled' | 'checked_in' | 'checked_out' | 'missed' | 'cancelled'
  assignmentId?: string
}

export interface Assignment {
  id: string
  workerId: AmxUid
  shiftId: string
  assignmentType: 'ward_round' | 'clinic' | 'emergency' | 'icu' | 'theatre' | 'telemedicine' | 'admin' | 'research'
  locationId: string
  startTime: number
  endTime?: number
}

export interface Schedule {
  id: string
  workerId: AmxUid
  pattern: 'mon-fri' | 'shift_rotating' | 'weekends' | 'flexible' | 'on_call_rotating'
  recurringShifts: RecurringShift[]
  exceptions: ScheduleException[]
}

export interface RecurringShift {
  dayOfWeek: number
  type: Shift['type']
  startHour: number
  endHour: number
}

export interface ScheduleException {
  date: number
  type: 'leave' | 'training' | 'sick' | 'swap'
  note?: string
}
