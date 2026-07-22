import { type AmxUid } from '@/lib/amexan/identity/types'
import type { Competency } from './types'

const workerCompetencies = new Map<AmxUid, Competency[]>()

export function addCompetency(workerId: AmxUid, competency: Competency): void {
  const list = workerCompetencies.get(workerId) ?? []
  list.push(competency)
  workerCompetencies.set(workerId, list)
}

export function verifyLicense(workerId: AmxUid): { valid: boolean; expiredCompetencies: Competency[] } {
  const comps = workerCompetencies.get(workerId) ?? []
  const expired = comps.filter(c => c.expiryDate && c.expiryDate < Date.now())
  return { valid: expired.length === 0, expiredCompetencies: expired }
}

export function getExpiredCredentials(deptWorkerIds: AmxUid[]): { workerId: AmxUid; expired: Competency[] }[] {
  const results: { workerId: AmxUid; expired: Competency[] }[] = []
  for (const wid of deptWorkerIds) {
    const { expiredCompetencies } = verifyLicense(wid)
    if (expiredCompetencies.length > 0) results.push({ workerId: wid, expired: expiredCompetencies })
  }
  return results
}

export function getCompetencies(workerId: AmxUid): Competency[] {
  return workerCompetencies.get(workerId) ?? []
}

export function renewCompetency(workerId: AmxUid, competencyId: string, newExpiry: number): boolean {
  const comps = workerCompetencies.get(workerId)
  if (!comps) return false
  const comp = comps.find(c => c.id === competencyId)
  if (!comp) return false
  comp.expiryDate = newExpiry
  return true
}

export function hasCompetency(workerId: AmxUid, competencyName: string): boolean {
  return (workerCompetencies.get(workerId) ?? []).some(c => c.name === competencyName && (!c.expiryDate || c.expiryDate > Date.now()))
}
