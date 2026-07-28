// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book IX: Universal Resource Management
// Resources include beds, wheelchairs, ventilators, theatres, labs, drugs, equipment.
// ═══════════════════════════════════════════════════════════════════════════════

export interface Resource {
  id: string;
  hospitalId: string;
  category: ResourceCategory;
  type: string;
  name: string;
  identifier: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  location: ResourceLocation;
  status: ResourceStatus;
  assignment?: ResourceAssignment;
  maintenance: MaintenanceRecord[];
  calibration: CalibrationRecord[];
  documents: ResourceDocument[];
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export enum ResourceCategory {
  Bed = 'bed',
  Ventilator = 'ventilator',
  Monitor = 'monitor',
  InfusionPump = 'infusion_pump',
  DialysisMachine = 'dialysis_machine',
  AnaesthesiaMachine = 'anaesthesia_machine',
  ImagingEquipment = 'imaging_equipment',
  LabEquipment = 'lab_equipment',
  SurgicalInstrument = 'surgical_instrument',
  PatientTransport = 'patient_transport',
  NeonatalEquipment = 'neonatal_equipment',
  EmergencyEquipment = 'emergency_equipment',
  Furniture = 'furniture',
  IT = 'it',
  Vehicle = 'vehicle',
  Other = 'other',
}

export interface ResourceLocation {
  departmentId: string;
  unitId?: string;
  wardId?: string;
  roomId?: string;
  building?: string;
  floor?: string;
}

import { ResourceStatus } from './hospital-model';

export interface ResourceAssignment {
  patientId?: string;
  encounterId?: string;
  assignedTo?: string;
  assignedAt?: number;
  expectedReturnAt?: number;
  returnedAt?: number;
  purpose?: string;
}

export interface MaintenanceRecord {
  id: string;
  type: 'routine' | 'corrective' | 'emergency' | 'scheduled';
  description: string;
  performedBy: string;
  performedAt: number;
  completedAt?: number;
  cost?: number;
  parts?: string[];
  nextDueAt?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  notes?: string;
}

export interface CalibrationRecord {
  id: string;
  parameter: string;
  value: string;
  standard: string;
  passed: boolean;
  performedBy: string;
  performedAt: number;
  nextDueAt: number;
}

export interface ResourceDocument {
  type: 'manual' | 'certificate' | 'insurance' | 'warranty' | 'inspection' | 'other';
  title: string;
  url: string;
  uploadedAt: number;
  expiresAt?: number;
}

export function createResource(params: {
  hospitalId: string;
  category: ResourceCategory;
  type: string;
  name: string;
  identifier: string;
  location: ResourceLocation;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
}): Resource {
  return {
    id: `RES-${Date.now().toString(36).toUpperCase()}`,
    hospitalId: params.hospitalId,
    category: params.category,
    type: params.type,
    name: params.name,
    identifier: params.identifier,
    serialNumber: params.serialNumber,
    manufacturer: params.manufacturer,
    model: params.model,
    location: params.location,
    status: ResourceStatus.Available,
    maintenance: [],
    calibration: [],
    documents: [],
    metadata: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function assignResource(resource: Resource, patientId: string, encounterId: string): Resource {
  resource.status = ResourceStatus.InUse;
  resource.assignment = { patientId, encounterId, assignedAt: Date.now() };
  resource.updatedAt = Date.now();
  return resource;
}

export function releaseResource(resource: Resource): Resource {
  resource.status = ResourceStatus.Available;
  if (resource.assignment) resource.assignment.returnedAt = Date.now();
  resource.updatedAt = Date.now();
  return resource;
}

export function scheduleMaintenance(resource: Resource, description: string, performedBy: string, nextDueAt?: number): Resource {
  resource.status = ResourceStatus.Maintenance;
  resource.maintenance.push({
    id: `MNT-${Date.now().toString(36).toUpperCase()}`,
    type: 'scheduled',
    description,
    performedBy,
    performedAt: Date.now(),
    nextDueAt,
    status: 'in_progress',
  });
  resource.updatedAt = Date.now();
  return resource;
}

export function completeMaintenance(resource: Resource, maintenanceId: string, notes?: string): Resource {
  const record = resource.maintenance.find(m => m.id === maintenanceId);
  if (record) {
    record.completedAt = Date.now();
    record.status = 'completed';
    record.notes = notes;
  }
  resource.status = ResourceStatus.Available;
  resource.updatedAt = Date.now();
  return resource;
}

export function getAvailableResources(resources: Resource[], category?: ResourceCategory): Resource[] {
  return resources.filter(r => r.status === ResourceStatus.Available && (!category || r.category === category));
}

export function getResourceUtilization(resources: Resource[]): {
  total: number;
  available: number;
  inUse: number;
  maintenance: number;
  utilizationRate: number;
  byCategory: Record<string, { total: number; inUse: number; available: number }>;
} {
  const byCategory: Record<string, { total: number; inUse: number; available: number }> = {};
  for (const r of resources) {
    if (!byCategory[r.category]) byCategory[r.category] = { total: 0, inUse: 0, available: 0 };
    byCategory[r.category].total++;
    if (r.status === ResourceStatus.InUse) byCategory[r.category].inUse++;
    if (r.status === ResourceStatus.Available) byCategory[r.category].available++;
  }
  const inUse = resources.filter(r => r.status === ResourceStatus.InUse).length;
  return {
    total: resources.length,
    available: resources.filter(r => r.status === ResourceStatus.Available).length,
    inUse,
    maintenance: resources.filter(r => r.status === ResourceStatus.Maintenance || r.status === ResourceStatus.OutOfService).length,
    utilizationRate: resources.length > 0 ? (inUse / resources.length) * 100 : 0,
    byCategory,
  };
}
