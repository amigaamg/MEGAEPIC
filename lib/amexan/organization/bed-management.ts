import type { Bed } from './types'

const bedStore = new Map<string, Bed[]>()

export function registerBeds(wardId: string, beds: Bed[]): void {
  const existing = bedStore.get(wardId) ?? []
  bedStore.set(wardId, [...existing, ...beds.map(b => ({ ...b, wardId }))])
}

export function assignBed(bedId: string, patientId: string): boolean {
  for (const [, beds] of bedStore) {
    const bed = beds.find(b => b.id === bedId)
    if (!bed) continue
    if (bed.status !== 'available') return false
    bed.status = 'occupied'
    bed.currentPatientId = patientId
    return true
  }
  return false
}

export function releaseBed(bedId: string): boolean {
  for (const [, beds] of bedStore) {
    const bed = beds.find(b => b.id === bedId)
    if (!bed || bed.status !== 'occupied') continue
    bed.status = 'cleaning'
    bed.currentPatientId = undefined
    return true
  }
  return false
}

export function markBedClean(bedId: string): boolean {
  for (const [, beds] of bedStore) {
    const bed = beds.find(b => b.id === bedId)
    if (!bed) continue
    bed.cleaningStatus = 'clean'
    bed.status = 'available'
    return true
  }
  return false
}

export function getAvailableBeds(wardId: string): Bed[] {
  return (bedStore.get(wardId) ?? []).filter(b => b.status === 'available')
}

export function getBedOccupancy(wardId: string): { total: number; occupied: number; available: number; cleaning: number } {
  const beds = bedStore.get(wardId) ?? []
  return {
    total: beds.length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    available: beds.filter(b => b.status === 'available').length,
    cleaning: beds.filter(b => b.status === 'cleaning').length,
  }
}

export function getPatientBed(patientId: string): Bed | undefined {
  for (const [, beds] of bedStore) {
    const bed = beds.find(b => b.currentPatientId === patientId)
    if (bed) return bed
  }
  return undefined
}

export function getWardBeds(wardId: string): Bed[] {
  return bedStore.get(wardId) ?? []
}
