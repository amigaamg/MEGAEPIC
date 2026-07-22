import type { AmxUid, Ward } from './types';

export interface Bed {
  id: string;
  wardId: string;
  roomId: string;
  bedNumber: string;
  type: 'standard' | 'icu' | 'nicu' | 'hdu' | 'isolation' | 'maternity' | 'pediatric' | 'psychiatric';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
  currentPatientId?: AmxUid;
  currentEncounterId?: string;
  assignedAt?: number;
  expectedDischargeAt?: number;
  cleaningStatus: 'clean' | 'needs_cleaning' | 'being_cleaned';
  isolationType?: 'contact' | 'droplet' | 'airborne' | 'protective';
  features: string[];
  lastCleanedAt?: number;
}

export interface BedOccupancyReport {
  wardId: string;
  wardName: string;
  totalBeds: number;
  available: number;
  occupied: number;
  maintenance: number;
  cleaning: number;
  reserved: number;
  occupancyRate: number;
  beds: Bed[];
}

export function createBed(wardId: string, bedNumber: string, roomId: string, type: Bed['type']): Bed {
  return {
    id: `bed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    wardId,
    roomId,
    bedNumber,
    type,
    status: 'available',
    cleaningStatus: 'clean',
    features: [],
  };
}

export function assignBed(bed: Bed, patientId: AmxUid, encounterId: string): Bed {
  return {
    ...bed,
    status: 'occupied',
    currentPatientId: patientId,
    currentEncounterId: encounterId,
    assignedAt: Date.now(),
  };
}

export function releaseBed(bed: Bed): Bed {
  return {
    ...bed,
    status: 'cleaning',
    currentPatientId: undefined,
    currentEncounterId: undefined,
    assignedAt: undefined,
    expectedDischargeAt: undefined,
    cleaningStatus: 'needs_cleaning',
  };
}

export function markBedCleaned(bed: Bed): Bed {
  return {
    ...bed,
    cleaningStatus: 'clean',
    status: 'available',
    lastCleanedAt: Date.now(),
  };
}

export function getAvailableBeds(beds: Bed[]): Bed[] {
  return beds.filter(b => b.status === 'available' && b.cleaningStatus === 'clean');
}

export function getBedOccupancyReport(ward: Ward, beds: Bed[]): BedOccupancyReport {
  const total = beds.length;
  const available = beds.filter(b => b.status === 'available').length;
  const occupied = beds.filter(b => b.status === 'occupied').length;
  const maintenance = beds.filter(b => b.status === 'maintenance').length;
  const cleaning = beds.filter(b => b.status === 'cleaning').length;
  const reserved = beds.filter(b => b.status === 'reserved').length;

  return {
    wardId: ward.id,
    wardName: ward.name,
    totalBeds: total,
    available,
    occupied,
    maintenance,
    cleaning,
    reserved,
    occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    beds,
  };
}

export function getBedsByStatus(beds: Bed[]): Record<Bed['status'], Bed[]> {
  const grouped: Record<string, Bed[]> = { available: [], occupied: [], reserved: [], maintenance: [], cleaning: [] };
  for (const bed of beds) {
    if (!grouped[bed.status]) grouped[bed.status] = [];
    grouped[bed.status].push(bed);
  }
  return grouped as Record<Bed['status'], Bed[]>;
}
