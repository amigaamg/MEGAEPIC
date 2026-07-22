import { type AmxUid } from '@/lib/amexan/identity/types'
import type { Shift } from './types'

const shifts = new Map<string, Shift>()

export function createShift(workerId: AmxUid, startTime: number, endTime: number, type: Shift['type']): Shift {
  const shift: Shift = {
    id: `sft_${crypto.randomUUID()}`,
    workerId,
    startTime,
    endTime,
    type,
    status: 'scheduled',
  }
  shifts.set(shift.id, shift)
  return shift
}

export function getCurrentShift(workerId: AmxUid): Shift | undefined {
  const now = Date.now()
  return Array.from(shifts.values()).find(s => s.workerId === workerId && s.startTime <= now && s.endTime >= now && s.status !== 'cancelled')
}

export function getActiveWorkers(deptId: string): AmxUid[] {
  const now = Date.now()
  return Array.from(shifts.values())
    .filter(s => s.startTime <= now && s.endTime >= now && s.status === 'checked_in')
    .map(s => s.workerId)
}

export function getShiftHistory(workerId: AmxUid, limit = 30): Shift[] {
  return Array.from(shifts.values()).filter(s => s.workerId === workerId).slice(-limit).reverse()
}

export function checkIn(shiftId: string): boolean {
  const s = shifts.get(shiftId)
  if (!s || s.status !== 'scheduled') return false
  s.status = 'checked_in'
  return true
}

export function checkOut(shiftId: string): boolean {
  const s = shifts.get(shiftId)
  if (!s || (s.status !== 'checked_in')) return false
  s.status = 'checked_out'
  return true
}

export function cancelShift(shiftId: string): boolean {
  const s = shifts.get(shiftId)
  if (!s || s.status === 'checked_out') return false
  s.status = 'cancelled'
  return true
}

export function getShiftsByDate(date: number): Shift[] {
  const start = new Date(date).setHours(0, 0, 0, 0)
  const end = start + 86400000
  return Array.from(shifts.values()).filter(s => s.startTime >= start && s.startTime < end)
}
