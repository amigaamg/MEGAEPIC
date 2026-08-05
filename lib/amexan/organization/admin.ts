import { type AmxUid } from '@/lib/amexan/constitution/types'

interface WorkerRecord {
  uid: AmxUid
  orgId: AmxUid
  deptId: string
  role: string
  status: 'active' | 'suspended' | 'terminated'
  joinedAt: number
  terminatedAt?: number
}

const workers = new Map<string, WorkerRecord>()

export function registerWorker(orgId: AmxUid, identityId: AmxUid, deptId: string, role: string): WorkerRecord {
  const record: WorkerRecord = { uid: identityId, orgId, deptId, role, status: 'active', joinedAt: Date.now() }
  workers.set(`${orgId}:${identityId}`, record)
  return record
}

export function transferWorker(identityId: AmxUid, fromDept: string, toDept: string, newRole?: string): boolean {
  for (const [, w] of workers) {
    if (w.uid === identityId && w.deptId === fromDept) {
      w.deptId = toDept
      if (newRole) w.role = newRole
      return true
    }
  }
  return false
}

export function suspendWorker(orgId: AmxUid, identityId: AmxUid): boolean {
  const key = `${orgId}:${identityId}`
  const w = workers.get(key)
  if (!w) return false
  w.status = 'suspended'
  return true
}

export function terminateWorker(orgId: AmxUid, identityId: AmxUid): boolean {
  const key = `${orgId}:${identityId}`
  const w = workers.get(key)
  if (!w) return false
  w.status = 'terminated'
  w.terminatedAt = Date.now()
  return true
}

export function getWorkersByOrg(orgId: AmxUid): WorkerRecord[] {
  return Array.from(workers.values()).filter(w => w.orgId === orgId && w.status === 'active')
}

export function getWorkersByDept(deptId: string): WorkerRecord[] {
  return Array.from(workers.values()).filter(w => w.deptId === deptId && w.status === 'active')
}

export function getWorker(orgId: AmxUid, identityId: AmxUid): WorkerRecord | undefined {
  return workers.get(`${orgId}:${identityId}`)
}

export function getWorkerByIdentity(identityId: AmxUid): WorkerRecord[] {
  return Array.from(workers.values()).filter(w => w.uid === identityId)
}
