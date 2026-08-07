// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Asset Intelligence Engine — Engine VI — Constitutional Types
// An asset is a LIVING constitutional object: every physical, digital, and
// clinical resource of the hospital owns a complete digital lifecycle from
// procurement to retirement. This type system covers the asset itself, its
// finance, warranty, maintenance, calibration, utilization, faults, predictive
// health, consumables, links, and relationship graph.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Asset status (the digital twin colour source of truth) ────────────────────
export type AssetStatus =
  | 'operational'   // green
  | 'maintenance'   // amber
  | 'faulted'       // red
  | 'reserved'      // blue
  | 'pending'       // installed-not-yet-in-service
  | 'retired';      // grey

// ── Maintenance taxonomy — never "working/broken" ─────────────────────────────
export type MaintenanceType =
  | 'routine' | 'preventive' | 'corrective' | 'calibration'
  | 'cleaning' | 'software_update' | 'inspection' | 'safety_check';

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

// ── Financial facts ───────────────────────────────────────────────────────────
export type FundingSource = 'government' | 'donor' | 'private' | 'research' | 'loan';
export type DepreciationMethod = 'straight_line' | 'reducing_balance' | 'none';

// ── Location ──────────────────────────────────────────────────────────────────
export interface AssetLocation {
  building?: string;
  floor?: string;
  room?: string;
  gps?: string;
  barcode?: string;
  qrCode?: string;
  rfid?: string;
}

// ── Finance ───────────────────────────────────────────────────────────────────
export interface AssetFinancial {
  purchaseCost: number;
  currency: 'KES' | 'USD';
  supplier: string;
  vendor?: string;
  procurementNumber?: string;
  purchaseDate: number;
  installationDate?: number;
  fundingSource: FundingSource;
  depreciationMethod: DepreciationMethod;
  usefulLifeYears: number;
  residualValue: number;
  /** Auto-computed by the engine (depreciation applied). */
  currentValue?: number;
  accumulatedDepreciation?: number;
}

// ── Warranty / service contract ──────────────────────────────────────────────
export interface Warranty {
  start: number;
  end: number;
  serviceContract?: boolean;
  amc?: boolean;
  insurance?: boolean;
  supportContact?: string;
}

// ── Utilization (value creation, not just "working") ─────────────────────────
export interface AssetUtilization {
  scansToday?: number;
  average?: number;
  maximum?: number;
  utilizationPct?: number;
  revenueToday?: number;
  downtimeMinutes?: number;
  idleHoursYesterday?: number;
}

// ── Consumables (predicted shortages) ────────────────────────────────────────
export interface AssetConsumable {
  id: string;
  name: string;
  stockLevel: number;
  threshold: number;
  lastRestocked: number;
  predictedShortageDays?: number;
}

// ── Clinical / operational links (the Neo4j graph edges) ─────────────────────
export interface AssetLinks {
  departments: string[];
  clinicians: string[];
  services: string[];
  patients: string[];
  orders: string[];
  protocols: string[];
  maintenance: string[];
  inventory: string[];
}

// ── Lifecycle / service history events ───────────────────────────────────────
export type LifecycleEventType =
  | 'purchased' | 'installed' | 'calibrated' | 'serviced' | 'fault'
  | 'repair' | 'operational' | 'upgrade' | 'reserved' | 'replacement' | 'retired' | 'maintenance';

export interface AssetLifecycleEvent {
  at: number;
  type: LifecycleEventType;
  detail: string;
  by: string;
}

// ── Predictive maintenance (AI) ───────────────────────────────────────────────
export interface AssetHealth {
  failureProbabilityPct: number;
  recommendation?: string;
  recommendationWithinDays?: number;
  nextMaintenanceDue?: number;
  calibrationDue?: number;
}

// ── Fault ─────────────────────────────────────────────────────────────────────
export interface AssetFault {
  id: string;
  assetId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedAt: number;
  reportedBy: string;
  status: 'open' | 'resolved' | 'escalated';
  resolvedAt?: number;
  impact?: { service: string; narrative: string; revenueLossPerDay?: number };
}

// ── The Asset itself ──────────────────────────────────────────────────────────
export interface AssetRecord {
  id: string;            // internal uuid-ish
  assetId: string;       // human AMEXAN Asset ID, e.g. AMX-AST-000123
  name: string;
  itemKey?: string;      // registry catalog key
  category: string;      // registry category id
  department: string;
  status: AssetStatus;
  location: AssetLocation;
  manufacturer: string;
  model: string;
  serialNumber: string;
  finance: AssetFinancial;
  warranty?: Warranty;
  utilization?: AssetUtilization;
  consumables: AssetConsumable[];
  links: AssetLinks;
  lifecycle: AssetLifecycleEvent[];
  health: AssetHealth;
  responsiblePerson?: string;
  assignedEngineer?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

// ── Maintenance job ───────────────────────────────────────────────────────────
export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  title: string;
  description?: string;
  scheduledFor: number;
  completedAt?: number;
  performedBy?: string;
  cost?: number;
  sparePartsUsed?: string[];
  createdAt: number;
}

// ── Calibration record ────────────────────────────────────────────────────────
export interface CalibrationRecord {
  id: string;
  assetId: string;
  assetName: string;
  department: string;
  lastCalibration: number;
  nextDue: number;
  status: 'healthy' | 'due' | 'overdue';
  performedBy?: string;
  tolerance?: string;
}

// ── Organisation-level asset model ────────────────────────────────────────────
export interface AssetModel {
  organizationId: string;
  assets: AssetRecord[];
  faults: AssetFault[];
  maintenance: MaintenanceRecord[];
  calibration: CalibrationRecord[];
  auditLog: { at: number; actorId: string; action: string; referenceId?: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateAssetModelInput {
  organizationId: string;
}

// ── Registration input (driven by the 4-step wizard) ─────────────────────────
export interface AssetRegistrationInput {
  department: string;
  category?: string;
  name?: string;
  itemKey?: string;
  status?: AssetStatus;
  location?: AssetLocation;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  finance?: Partial<AssetFinancial>;
  warranty?: Warranty;
  utilization?: AssetUtilization;
  utilizations?: { at: number; usage: number }[];
  consumables?: AssetConsumable[];
  responsiblePerson?: string;
  assignedEngineer?: string;
}