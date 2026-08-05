export interface LegacyBed {
  id: string
  type: 'bed' | 'room' | 'theatre' | 'machine' | 'ventilator'
  location: string
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning'
  label: string
  wardId: string
  roomId: string
  bedNumber: string
  currentPatientId?: string
  isolationType?: 'none' | 'contact' | 'droplet' | 'airborne'
  cleaningStatus: 'clean' | 'dirty' | 'in_progress'
}

const bedStore = new Map<string, LegacyBed[]>()

export function registerBeds(wardId: string, beds: LegacyBed[]): void {
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

export function getAvailableBeds(wardId: string): LegacyBed[] {
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

export function getPatientBed(patientId: string): LegacyBed | undefined {
  for (const [, beds] of bedStore) {
    const bed = beds.find(b => b.currentPatientId === patientId)
    if (bed) return bed
  }
  return undefined
}

export function getWardBeds(wardId: string): LegacyBed[] {
  return bedStore.get(wardId) ?? []
}
