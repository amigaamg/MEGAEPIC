import { type AmxUid } from '@/lib/amexan/identity/types'
import type { Assignment } from './types'

const assignments = new Map<string, Assignment>()

export function createAssignment(workerId: AmxUid, type: Assignment['assignmentType'], locationId: string, startTime: number, shiftId?: string): Assignment {
  const assignment: Assignment = {
    id: `asn_${crypto.randomUUID()}`,
    workerId,
    shiftId: shiftId ?? '',
    assignmentType: type,
    locationId,
    startTime,
  }
  assignments.set(assignment.id, assignment)
  return assignment
}

export function getCurrentAssignment(workerId: AmxUid): Assignment | undefined {
  const now = Date.now()
  return Array.from(assignments.values()).find(a => a.workerId === workerId && a.startTime <= now && (!a.endTime || a.endTime >= now))
}

export function getAssignmentQueue(deptId: string): Assignment[] {
  return Array.from(assignments.values()).filter(a => a.assignmentType === 'ward_round')
}

export function endAssignment(assignmentId: string): boolean {
  const a = assignments.get(assignmentId)
  if (!a) return false
  a.endTime = Date.now()
  return true
}

export function getAssignmentsByLocation(locationId: string): Assignment[] {
  return Array.from(assignments.values()).filter(a => a.locationId === locationId && (!a.endTime || a.endTime >= Date.now()))
}

export function getWorkerAssignments(workerId: AmxUid, date?: number): Assignment[] {
  const start = date ? new Date(date).setHours(0, 0, 0, 0) : 0
  const end = start ? start + 86400000 : Infinity
  return Array.from(assignments.values()).filter(a => a.workerId === workerId && a.startTime >= start && a.startTime < end)
}
