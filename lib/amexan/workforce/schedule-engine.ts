import { type AmxUid } from '@/lib/amexan/identity/types'
import type { Schedule, RecurringShift, ScheduleException } from './types'

const schedules = new Map<string, Schedule>()

export function createSchedule(workerId: AmxUid, pattern: Schedule['pattern'], recurringShifts: RecurringShift[] = []): Schedule {
  const schedule: Schedule = {
    id: `sch_${crypto.randomUUID()}`,
    workerId,
    pattern,
    recurringShifts,
    exceptions: [],
  }
  schedules.set(schedule.id, schedule)
  return schedule
}

export function getTodaySchedule(workerId: AmxUid): { shift?: RecurringShift; exception?: ScheduleException; startHour?: number; endHour?: number } {
  const schedule = Array.from(schedules.values()).find(s => s.workerId === workerId)
  if (!schedule) return {}
  const today = new Date().getDay()
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const exception = schedule.exceptions.find(e => e.date === todayStart)
  const shift = schedule.recurringShifts.find(s => s.dayOfWeek === today)
  return { shift, exception, startHour: shift?.startHour, endHour: shift?.endHour }
}

export function getOnCallWorkers(deptId: string): AmxUid[] {
  return Array.from(schedules.values())
    .filter(s => s.pattern === 'on_call_rotating' || s.pattern === 'shift_rotating')
    .map(s => s.workerId)
}

export function detectScheduleConflicts(workerId: AmxUid, newStart: number, newEnd: number): boolean {
  const schedule = Array.from(schedules.values()).find(s => s.workerId === workerId)
  if (!schedule) return false
  return schedule.recurringShifts.some(s => {
    const now = new Date()
    const shiftStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), s.startHour).getTime()
    const shiftEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), s.endHour).getTime()
    return newStart < shiftEnd && newEnd > shiftStart
  })
}

export function addScheduleException(scheduleId: string, exception: ScheduleException): boolean {
  const s = Array.from(schedules.values()).find(sch => sch.id === scheduleId)
  if (!s) return false
  s.exceptions.push(exception)
  return true
}

export function getWorkerSchedule(workerId: AmxUid): Schedule | undefined {
  return Array.from(schedules.values()).find(s => s.workerId === workerId)
}
