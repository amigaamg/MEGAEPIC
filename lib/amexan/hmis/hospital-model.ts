// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book I: Universal Hospital Model
// Every hospital, clinic, or health system is represented using the same hierarchy.
// ═══════════════════════════════════════════════════════════════════════════════

export enum HealthSystemLevel {
  Global = 'global',
  Continent = 'continent',
  Country = 'country',
  Region = 'region',
  Organization = 'organization',
  Hospital = 'hospital',
  Campus = 'campus',
  Building = 'building',
  Floor = 'floor',
  Department = 'department',
  Unit = 'unit',
  Ward = 'ward',
  Room = 'room',
  Bed = 'bed',
}

export interface HealthSystemNode {
  id: string;
  level: HealthSystemLevel;
  name: string;
  code: string;
  parentId: string | null;
  children: HealthSystemNode[];
  metadata: HealthSystemMetadata;
  status: 'active' | 'inactive' | 'under_maintenance' | 'closed';
  createdAt: number;
  updatedAt: number;
}

export interface HealthSystemMetadata {
  type: string;
  description?: string;
  contact?: ContactInfo;
  address?: Address;
  coordinates?: GeoCoordinates;
  capacity?: CapacityInfo;
  operatingHours?: OperatingHours;
  specialties?: string[];
  services?: string[];
  accreditation?: Accreditation[];
}

export interface ContactInfo {
  phone: string[];
  email: string[];
  emergency?: string;
  website?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  region?: string;
  country: string;
  postalCode?: string;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface CapacityInfo {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  totalStaff: number;
  activeStaff: number;
}

export interface OperatingHours {
  weekday: TimeRange;
  weekend?: TimeRange;
  holiday?: TimeRange;
  is24h: boolean;
}

export interface TimeRange {
  open: string;
  close: string;
}

export interface Accreditation {
  body: string;
  level: string;
  certificateNumber: string;
  issuedAt: number;
  expiresAt: number;
  status: 'active' | 'expired' | 'suspended';
}

export interface BedInfo {
  id: string;
  wardId: string;
  roomId: string;
  label: string;
  type: BedType;
  features: BedFeature[];
  status: BedStatus;
  currentPatientId?: string;
  assignedAt?: number;
  expectedDischargeAt?: number;
  lastCleanedAt?: number;
  maintenanceDueAt?: number;
}

export enum BedType {
  Standard = 'standard',
  ICU = 'icu',
  HDU = 'hdu',
  Pediatric = 'pediatric',
  Neonatal = 'neonatal',
  Maternity = 'maternity',
  Isolation = 'isolation',
  Recovery = 'recovery',
  Emergency = 'emergency',
  Dialysis = 'dialysis',
  Bariatric = 'bariatric',
}

export enum BedFeature {
  Oxygen = 'oxygen',
  Suction = 'suction',
  Monitor = 'monitor',
  Ventilator = 'ventilator',
  Dialysis = 'dialysis',
  Isolation = 'isolation',
  Hovermat = 'hovermat',
  Scale = 'scale',
  TV = 'tv',
  VisitorChair = 'visitor_chair',
  Private = 'private',
  Window = 'window',
  NearNurseStation = 'near_nurse_station',
}

export enum BedStatus {
  Available = 'available',
  Occupied = 'occupied',
  Reserved = 'reserved',
  Cleaning = 'cleaning',
  Maintenance = 'maintenance',
  OutOfService = 'out_of_service',
}

export interface DepartmentInfo {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  type: DepartmentType;
  parentDepartmentId?: string;
  headOfDepartment?: string;
  contact?: ContactInfo;
  location?: string;
  services: string[];
  units: UnitInfo[];
  status: 'active' | 'inactive' | 'under_maintenance';
}

export enum DepartmentType {
  Emergency = 'emergency',
  Outpatient = 'outpatient',
  Inpatient = 'inpatient',
  ICU = 'icu',
  Theatre = 'theatre',
  Laboratory = 'laboratory',
  Radiology = 'radiology',
  Pharmacy = 'pharmacy',
  Cardiology = 'cardiology',
  Neurology = 'neurology',
  Pediatrics = 'pediatrics',
  Obstetrics = 'obstetrics',
  Surgery = 'surgery',
  Orthopedics = 'orthopedics',
  Psychiatry = 'psychiatry',
  Oncology = 'oncology',
  Nephrology = 'nephrology',
  Administration = 'administration',
  Finance = 'finance',
  HR = 'hr',
  IT = 'it',
  Stores = 'stores',
  Physiotherapy = 'physiotherapy',
  Nutrition = 'nutrition',
  SocialWork = 'social_work',
  Mortuary = 'mortuary',
  Research = 'research',
}

export interface UnitInfo {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  type: UnitType;
  inCharge?: string;
  wards: WardInfo[];
}

export enum UnitType {
  Medical = 'medical',
  Surgical = 'surgical',
  Pediatric = 'pediatric',
  Neonatal = 'neonatal',
  Maternity = 'maternity',
  Psychiatric = 'psychiatric',
  Rehabilitation = 'rehabilitation',
  Palliative = 'palliative',
  Isolation = 'isolation',
  DayCare = 'day_care',
  Dialysis = 'dialysis',
  Chemotherapy = 'chemotherapy',
  Endoscopy = 'endoscopy',
  CathLab = 'cath_lab',
  ShortStay = 'short_stay',
}

export interface WardInfo {
  id: string;
  unitId: string;
  name: string;
  code: string;
  gender: 'male' | 'female' | 'mixed' | 'pediatric' | 'neonatal';
  totalBeds: number;
  rooms: RoomInfo[];
  nurseStation?: string;
  isolationCapable: boolean;
  visitorPolicy: 'restricted' | 'open' | 'none';
}

export interface RoomInfo {
  id: string;
  wardId: string;
  name: string;
  capacity: number;
  type: RoomType;
  beds: BedInfo[];
}

export enum RoomType {
  General = 'general',
  Private = 'private',
  SemiPrivate = 'semi_private',
  Ward = 'ward',
  Isolation = 'isolation',
  ICU = 'icu',
  HDU = 'hdu',
  Nursery = 'nursery',
  Labour = 'labour',
  Operating = 'operating',
  Recovery = 'recovery',
  Procedure = 'procedure',
  Consultation = 'consultation',
  Triage = 'triage',
  Resuscitation = 'resuscitation',
}

export interface ResourceInfo {
  id: string;
  hospitalId: string;
  resourceType: ResourceType;
  name: string;
  identifier: string;
  status: ResourceStatus;
  location: string;
  departmentId?: string;
  assignedTo?: string;
  lastCalibratedAt?: number;
  nextMaintenanceAt?: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
}

export enum ResourceType {
  Ventilator = 'ventilator',
  InfusionPump = 'infusion_pump',
  Monitor = 'monitor',
  Defibrillator = 'defibrillator',
  ECG = 'ecg',
  Ultrasound = 'ultrasound',
  XRay = 'x_ray',
  CTScanner = 'ct_scanner',
  MRIScanner = 'mri_scanner',
  DialysisMachine = 'dialysis_machine',
  AnaesthesiaMachine = 'anaesthesia_machine',
  SurgicalInstrument = 'surgical_instrument',
  Wheelchair = 'wheelchair',
  Stretcher = 'stretcher',
  Incubator = 'incubator',
  PhototherapyUnit = 'phototherapy_unit',
  OxygenConcentrator = 'oxygen_concentrator',
  SuctionMachine = 'suction_machine',
  Autoclave = 'autoclave',
  Centrifuge = 'centrifuge',
  Microscope = 'microscope',
  Fridge = 'fridge',
  Freezer = 'freezer',
  BloodBankRefrigerator = 'blood_bank_refrigerator',
  Ambulance = 'ambulance',
  Generator = 'generator',
  CPAP = 'cpap',
  BiPAP = 'bipap',
  Trolley = 'trolley',
  Computer = 'computer',
  Printer = 'printer',
  Other = 'other',
}

export enum ResourceStatus {
  Available = 'available',
  InUse = 'in_use',
  Reserved = 'reserved',
  Maintenance = 'maintenance',
  Calibration = 'calibration',
  OutOfService = 'out_of_service',
  Lost = 'lost',
  Decommissioned = 'decommissioned',
  OnLoan = 'on_loan',
}

export function createHospitalId(name: string, country: string): string {
  const prefix = country.substring(0, 2).toUpperCase();
  const code = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `HOS-${prefix}-${code}-${timestamp}`;
}

export function createDepartmentId(hospitalId: string, deptCode: string): string {
  return `DEPT-${hospitalId}-${deptCode}`;
}

export function createWardId(departmentId: string, wardCode: string): string {
  return `WARD-${departmentId}-${wardCode}`;
}

export function createBedId(wardId: string, bedNumber: number): string {
  return `BED-${wardId}-${String(bedNumber).padStart(3, '0')}`;
}

export function createResourceId(hospitalId: string, type: ResourceType): string {
  const typeCode = type.substring(0, 3).toUpperCase();
  const seq = Date.now().toString(36).toUpperCase().substring(0, 6);
  return `RES-${typeCode}-${seq}`;
}

export interface HospitalStats {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  averageLoSCurrent: number;
  totalAdmissionsToday: number;
  totalDischargesToday: number;
  totalOutpatientsToday: number;
  totalEmergencyVisitsToday: number;
  totalSurgeriesToday: number;
  pendingLabTests: number;
  pendingRadiologyOrders: number;
  pendingPharmacyOrders: number;
  icus: {
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
  };
  wards: {
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
  };
  theatre: {
    totalSurgeriesScheduled: number;
    totalSurgeriesCompleted: number;
    averageTurnaroundMinutes: number;
  };
}

export function buildHospitalTree(hospitalId: string, departments: DepartmentInfo[]): HealthSystemNode {
  const children: HealthSystemNode[] = departments.map(dept => ({
    id: dept.id,
    level: HealthSystemLevel.Department,
    name: dept.name,
    code: dept.code,
    parentId: hospitalId,
    children: dept.units.map(unit => ({
      id: unit.id,
      level: HealthSystemLevel.Unit,
      name: unit.name,
      code: unit.code,
      parentId: dept.id,
      children: unit.wards.map(ward => ({
        id: ward.id,
        level: HealthSystemLevel.Ward,
        name: ward.name,
        code: ward.code,
        parentId: unit.id,
        children: ward.rooms.map(room => ({
          id: room.id,
          level: HealthSystemLevel.Room,
          name: room.name,
          code: room.name,
          parentId: ward.id,
          children: room.beds.map(bed => ({
            id: bed.id,
            level: HealthSystemLevel.Bed,
            name: bed.label,
            code: bed.id,
            parentId: room.id,
            children: [],
            metadata: {
              type: bed.type,
              capacity: { totalBeds: 1, occupiedBeds: bed.status === BedStatus.Occupied ? 1 : 0, availableBeds: bed.status === BedStatus.Available ? 1 : 0, totalStaff: 0, activeStaff: 0 },
            },
            status: bed.status === BedStatus.Available ? 'active' : 'active',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })),
          metadata: { type: room.type, capacity: { totalBeds: room.beds.length, occupiedBeds: room.beds.filter(b => b.status === BedStatus.Occupied).length, availableBeds: room.beds.filter(b => b.status === BedStatus.Available).length, totalStaff: 0, activeStaff: 0 } },
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })),
        metadata: { type: ward.gender, capacity: { totalBeds: ward.totalBeds, occupiedBeds: 0, availableBeds: ward.totalBeds, totalStaff: 0, activeStaff: 0 } },
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })),
      metadata: { type: unit.type, capacity: { totalBeds: 0, occupiedBeds: 0, availableBeds: 0, totalStaff: 0, activeStaff: 0 } },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })),
    metadata: { type: dept.type, capacity: { totalBeds: 0, occupiedBeds: 0, availableBeds: 0, totalStaff: 0, activeStaff: 0 }, specialties: dept.services },
    status: dept.status,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));

  return {
    id: hospitalId,
    level: HealthSystemLevel.Hospital,
    name: '',
    code: hospitalId,
    parentId: null,
    children,
    metadata: { type: 'hospital' },
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function findNodeById(root: HealthSystemNode, id: string): HealthSystemNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

export function findBedByPatientId(root: HealthSystemNode, patientId: string): BedInfo | null {
  for (const dept of root.children) {
    for (const unit of dept.children) {
      for (const ward of unit.children) {
        for (const room of ward.children) {
          for (const bed of room.children) {
            const bedMeta = bed.metadata as any;
            if (bedMeta.occupiedBy === patientId) {
              return { id: bed.id, wardId: ward.id, roomId: room.id, label: bed.name, type: BedType.Standard, features: [], status: BedStatus.Occupied, currentPatientId: patientId };
            }
          }
        }
      }
    }
  }
  return null;
}

export function getAvailableBedsInWard(wardId: string, departments: DepartmentInfo[]): BedInfo[] {
  const available: BedInfo[] = [];
  for (const dept of departments) {
    for (const unit of dept.units) {
      for (const ward of unit.wards) {
        if (ward.id === wardId) {
          for (const room of ward.rooms) {
            for (const bed of room.beds) {
              if (bed.status === BedStatus.Available) {
                available.push(bed);
              }
            }
          }
        }
      }
    }
  }
  return available;
}

export function computeOccupancyStats(departments: DepartmentInfo[]): HospitalStats {
  let totalBeds = 0;
  let occupiedBeds = 0;
  let icuTotal = 0;
  let icuOccupied = 0;
  let wardTotal = 0;
  let wardOccupied = 0;

  for (const dept of departments) {
    for (const unit of dept.units) {
      for (const ward of unit.wards) {
        for (const room of ward.rooms) {
          for (const bed of room.beds) {
            totalBeds++;
            if (bed.status === BedStatus.Occupied) occupiedBeds++;
            if (bed.type === BedType.ICU || bed.type === BedType.HDU) {
              icuTotal++;
              if (bed.status === BedStatus.Occupied) icuOccupied++;
            } else {
              wardTotal++;
              if (bed.status === BedStatus.Occupied) wardOccupied++;
            }
          }
        }
      }
    }
  }

  return {
    totalBeds,
    occupiedBeds,
    availableBeds: totalBeds - occupiedBeds,
    occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0,
    averageLoSCurrent: 0,
    totalAdmissionsToday: 0,
    totalDischargesToday: 0,
    totalOutpatientsToday: 0,
    totalEmergencyVisitsToday: 0,
    totalSurgeriesToday: 0,
    pendingLabTests: 0,
    pendingRadiologyOrders: 0,
    pendingPharmacyOrders: 0,
    icus: { totalBeds: icuTotal, occupiedBeds: icuOccupied, availableBeds: icuTotal - icuOccupied },
    wards: { totalBeds: wardTotal, occupiedBeds: wardOccupied, availableBeds: wardTotal - wardOccupied },
    theatre: { totalSurgeriesScheduled: 0, totalSurgeriesCompleted: 0, averageTurnaroundMinutes: 0 },
  };
}
