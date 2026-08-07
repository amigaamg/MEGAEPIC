// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Asset Intelligence Engine — Engine VI — PURE KERNEL
// Zero knowledge of Firestore/Postgres/Neo4j. Operates only on constitutional
// types + the Asset Registry.
//
// An asset is NOT just equipment. It is a living operational resource with a
// constitutional identity continuously linked to procurement, finance,
// inventory, biomedical engineering, departments, clinicians, services,
// patients, quality, digital twin, and executive analytics.
//
// Constitutional principles:
//   A1 what exists · A2 where it is · A3 who is responsible · A4 how it is used
//   A5 what it costs · A6 whether it generates value · A7 when it will fail
//   A8 when serviced · A9 when replaced
// ═══════════════════════════════════════════════════════════════════════════════

import {
  getCatalogItem,
  getAssetCategoryLabel,
} from './registry';
import type {
  AssetFault,
  AssetFinancial,
  AssetModel,
  AssetRecord,
  AssetRegistrationInput,
  AssetStatus,
  CalibrationRecord,
  CreateAssetModelInput,
  DepreciationMethod,
  LifecycleEventType,
  MaintenanceRecord,
  MaintenanceType,
} from './constitutional-types';

export function genAssetId(seq: number): string {
  return `AST-${String(seq).padStart(6, '0')}`;
}

export function genEntityId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

// ── Depreciation (A5: what it costs, over time) ───────────────────────────────
export function computeRemainingValue(
  method: DepreciationMethod,
  cost: number,
  usefulLifeYears: number,
  residualValue: number,
  installedAt: number,
  now: number,
): number {
  if (!usefulLifeYears || installedAt <= 0) return cost;
  const ageYears = Math.max(0, (now - installedAt) / (365 * 86400000));
  const residual = Math.min(residualValue, cost);
  if (method === 'reducing_balance') {
    const rate = 2 / usefulLifeYears;
    const value = cost * Math.pow(1 - rate, ageYears);
    return Math.max(value, residual);
  }
  // straight line default
  const dep = (cost - residual) * (ageYears / usefulLifeYears);
  return Math.max(cost - dep, residual);
}

export function accumulatedDepreciation(
  method: DepreciationMethod,
  cost: number,
  usefulLifeYears: number,
  residualValue: number,
  installedAt: number,
  now: number,
): number {
  if (!usefulLifeYears || installedAt <= 0) return 0;
  return cost - computeRemainingValue(method, cost, usefulLifeYears, residualValue, installedAt, now);
}

function freshFinancial(input: Partial<AssetFinancial>, now: number, catalogCost?: number): AssetFinancial {
  const cost = input.purchaseCost ?? catalogCost ?? 0;
  return {
    purchaseCost: cost,
    currency: input.currency ?? 'KES',
    purchaseDate: input.purchaseDate ?? now,
    installationDate: input.installationDate ?? input.purchaseDate ?? now,
    fundingSource: input.fundingSource ?? 'private',
    depreciationMethod: input.depreciationMethod ?? 'straight_line',
    usefulLifeYears: input.usefulLifeYears ?? 10,
    residualValue: input.residualValue ?? 0,
    supplier: input.supplier ?? '',
    accumulatedDepreciation: 0,
    currentValue: cost,
  };
}

export class AssetIntelligenceEngine {
  // ── Model lifecycle ─────────────────────────────────────────────────────────
  static create(input: CreateAssetModelInput): AssetModel {
    if (!input.organizationId) throw new Error('[AIE] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      assets: [],
      faults: [],
      maintenance: [],
      calibration: [],
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  private static audit(model: AssetModel, actorId: string, action: string, referenceId?: string, detail?: string) {
    return [...model.auditLog, { at: Date.now(), actorId, action, referenceId, detail }];
  }

  // ── Registration — assembles the constitutional asset from the wizard steps ─
  static registerAsset(model: AssetModel, actorId: string, input: AssetRegistrationInput): { model: AssetModel; asset: AssetRecord } {
    if (!input.department.trim()) throw new Error('[AIE] department is required (Step 1).');
    const now = Date.now();
    const catalog = input.itemKey ? getCatalogItem(input.itemKey) : undefined;
    const category = input.category?.trim() || catalog?.category || '';
    if (!category) throw new Error('[AIE] category is required (Step 2).');
    if (!input.name?.trim() && !input.itemKey) throw new Error('[AIE] asset name or catalog item is required (Step 2/3).');
    const name = input.name?.trim() || catalog?.name || 'Asset';
    const seq = model.assets.length + 1;
    const assetId = genAssetId(seq);
    const finance = freshFinancial(input.finance ?? {} as AssetFinancial, now, catalog?.suggestedCost);
    const asset: AssetRecord = {
      id: genEntityId('AST'),
      assetId,
      name,
      itemKey: input.itemKey ?? catalog?.key,
      category,
      department: input.department,
      status: input.status ?? 'operational',
      location: input.location ?? {},
      manufacturer: input.manufacturer ?? '',
      model: input.model ?? '',
      serialNumber: input.serialNumber ?? '',
      finance,
      warranty: input.warranty,
      utilization: input.utilization ?? {},
      consumables: input.consumables ?? [],
      links: {
        departments: input.department ? [input.department] : [],
        clinicians: [],
        services: [],
        patients: [],
        orders: [],
        protocols: [],
        maintenance: [],
        inventory: [],
      },
      lifecycle: [{ at: now, type: 'purchased', detail: `Registered on the Asset Intelligence Engine as ${assetId}`, by: actorId }],
      health: {
        failureProbabilityPct: 0,
        recommendation: undefined,
        recommendationWithinDays: undefined,
        nextMaintenanceDue: undefined,
        calibrationDue: undefined,
      },
      responsiblePerson: input.responsiblePerson,
      assignedEngineer: input.assignedEngineer,
      createdBy: actorId,
      createdAt: now,
      updatedAt: now,
    };
    const next: AssetModel = {
      ...model,
      assets: [...model.assets, asset],
      auditLog: this.audit(model, actorId, 'asset.register', asset.assetId, `${name} — ${input.department}`),
      updatedAt: now,
    };
    return { model: next, asset };
  }

  // ── Lifecycle event + status transition (A9) ───────────────────────────────
  static lifecycle(model: AssetModel, actorId: string, assetId: string, type: LifecycleEventType, detail: string, status: AssetStatus): AssetModel {
    return {
      ...model,
      assets: model.assets.map((a) => (a.id === assetId ? {
        ...a,
        status,
        lifecycle: [...a.lifecycle, { at: Date.now(), type, detail, by: actorId }],
        updatedAt: Date.now(),
      } : a)),
      auditLog: this.audit(model, actorId, `lifecycle.${type}`, assetId, detail),
      updatedAt: Date.now(),
    };
  }

  // ── Status change only (digital twin recolour) ─────────────────────────────
  static setStatus(model: AssetModel, actorId: string, assetId: string, status: AssetStatus, note?: string): AssetModel {
    return this.lifecycle(model, actorId, assetId, statusEventFor(status), note ?? `Status → ${status}`, status);
  }

  // ── Maintenance (A8: never "working/broken" — real taxonomy) ───────────────
  static scheduleMaintenance(model: AssetModel, actorId: string, input: {
    assetId: string;
    type: MaintenanceType;
    title: string;
    description?: string;
    scheduledFor: number;
  }): { model: AssetModel; job: MaintenanceRecord } {
    const asset = model.assets.find((a) => a.id === input.assetId);
    if (!asset) throw new Error('[AIE] asset not found.');
    const job: MaintenanceRecord = {
      id: genEntityId('MNT'),
      assetId: input.assetId,
      type: input.type,
      status: 'scheduled',
      title: input.title,
      description: input.description,
      scheduledFor: input.scheduledFor,
      cost: undefined,
      createdAt: Date.now(),
    };
    const next: AssetModel = {
      ...model,
      assets: model.assets.map((a) => a.id === input.assetId ? {
        ...a,
        status: a.status === 'operational' ? 'maintenance' : a.status,
        health: { ...a.health, nextMaintenanceDue: input.scheduledFor },
        links: { ...a.links, maintenance: [...a.links.maintenance, job.id] },
        updatedAt: Date.now(),
      } : a),
      maintenance: [...model.maintenance, job],
      auditLog: this.audit(model, actorId, 'maintenance.schedule', input.assetId, `${input.title}`),
      updatedAt: Date.now(),
    };
    return { model: next, job };
  }

  static completeMaintenance(model: AssetModel, actorId: string, jobId: string, input?: {
    performedBy?: string;
    cost?: number;
    sparePartsUsed?: string[];
  }): { model: AssetModel; job: MaintenanceRecord } {
    const job = model.maintenance.find((j) => j.id === jobId);
    if (!job) throw new Error('[AIE] maintenance job not found.');
    const done: MaintenanceRecord = {
      ...job,
      status: 'completed',
      completedAt: Date.now(),
      performedBy: input?.performedBy,
      cost: input?.cost,
      sparePartsUsed: input?.sparePartsUsed,
    };
    return {
      model: {
        ...model,
        maintenance: model.maintenance.map((j) => (j.id === jobId ? done : j)),
        assets: model.assets.map((a) => (a.id === job.assetId ? {
          ...a,
          status: a.status === 'maintenance' ? 'operational' : a.status,
          lifecycle: [...a.lifecycle, { at: Date.now(), type: job.type === 'calibration' ? 'calibrated' : 'serviced', detail: `Completed: ${done.title}`, by: actorId }],
          updatedAt: Date.now(),
        } : a)),
        auditLog: this.audit(model, actorId, 'maintenance.complete', job.assetId, done.title),
        updatedAt: Date.now(),
      },
      job: done,
    };
  }

  // ── Calibration (A8: know exactly when it is due) ──────────────────────────
  static calibrate(model: AssetModel, actorId: string, input: {
    assetId: string;
    performedBy?: string;
    nextDueInDays: number;
    tolerance?: string;
  }): { model: AssetModel; record: CalibrationRecord } {
    const asset = model.assets.find((a) => a.id === input.assetId);
    if (!asset) throw new Error('[AIE] asset not found.');
    const now = Date.now();
    const nextDue = now + input.nextDueInDays * 86400000;
    const record: CalibrationRecord = {
      id: genEntityId('CAL'),
      assetId: asset.id,
      assetName: asset.name,
      department: asset.department,
      lastCalibration: now,
      nextDue,
      status: 'healthy',
      performedBy: input.performedBy,
      tolerance: input.tolerance,
    };
    const next: AssetModel = {
      ...model,
      calibration: [...model.calibration, record],
      assets: model.assets.map((a) => (a.id === input.assetId ? {
        ...a,
        health: { ...a.health, calibrationDue: nextDue },
        lifecycle: [...a.lifecycle, { at: now, type: 'calibrated', detail: `Calibrated — next due ${new Date(nextDue).toDateString()}`, by: actorId }],
        updatedAt: now,
      } : a)),
      auditLog: this.audit(model, actorId, 'asset.calibrate', input.assetId, `next due ${new Date(nextDue).toDateString()}`),
      updatedAt: now,
    };
    return { model: next, record };
  }

  // ── Utilization (A4 + A6: value creation) ──────────────────────────────────
  static recordUtilization(model: AssetModel, actorId: string, assetId: string, input: {
    usageToday: number;
    maxCapacity?: number;
    revenueToday?: number;
    downtimeMinutes?: number;
  }): { model: AssetModel; asset: AssetRecord } {
    const asset = model.assets.find((a) => a.id === assetId);
    if (!asset) throw new Error('[AIE] asset not found.');
    const max = input.maxCapacity ?? asset.utilization?.maximum ?? 100;
    const utilizationPct = Math.min(100, Math.round((input.usageToday / Math.max(max, 1)) * 100));
    const updated: AssetRecord = {
      ...asset,
      utilization: {
        scansToday: input.usageToday,
        average: asset.utilization?.average ?? input.usageToday,
        maximum: max,
        utilizationPct,
        revenueToday: input.revenueToday ?? asset.utilization?.revenueToday,
        downtimeMinutes: input.downtimeMinutes ?? asset.utilization?.downtimeMinutes ?? 0,
      },
      updatedAt: Date.now(),
    };
    const next: AssetModel = {
      ...model,
      assets: model.assets.map((a) => (a.id === assetId ? updated : a)),
      auditLog: this.audit(model, actorId, 'asset.utilization', assetId, `${input.usageToday}/${max} → ${utilizationPct}%`),
      updatedAt: Date.now(),
    };
    return { model: next, asset: updated };
  }

  // ── Faults (A7: immediate impact, not just "faulted") ──────────────────────
  static reportFault(model: AssetModel, actorId: string, input: {
    assetId: string;
    severity: AssetFault['severity'];
    description: string;
    impact?: AssetFault['impact'];
  }): { model: AssetModel; fault: AssetFault } {
    const asset = model.assets.find((a) => a.id === input.assetId);
    if (!asset) throw new Error('[AIE] asset not found.');
    const now = Date.now();
    const fault: AssetFault = {
      id: genEntityId('FLT'),
      assetId: input.assetId,
      severity: input.severity,
      description: input.description,
      reportedAt: now,
      reportedBy: actorId,
      status: 'open',
      impact: input.impact,
    };
    const next: AssetModel = {
      ...model,
      faults: [...model.faults, fault],
      assets: model.assets.map((a) => (a.id === input.assetId ? {
        ...a,
        status: 'faulted',
        lifecycle: [...a.lifecycle, { at: now, type: 'fault', detail: `Fault: ${input.description}`, by: actorId }],
        updatedAt: now,
      } : a)),
      auditLog: this.audit(model, actorId, 'asset.fault', input.assetId, `${input.severity}: ${input.description}`),
      updatedAt: now,
    };
    return { model: next, fault };
  }

  static resolveFault(model: AssetModel, actorId: string, faultId: string, resolution?: string): AssetModel {
    const fault = model.faults.find((f) => f.id === faultId);
    if (!fault) throw new Error('[AIE] fault not found.');
    const now = Date.now();
    return {
      ...model,
      faults: model.faults.map((f) => (f.id === faultId ? { ...f, status: 'resolved', resolvedAt: now } : f)),
      assets: model.assets.map((a) => (a.id === fault.assetId ? {
        ...a,
        status: a.status === 'faulted' ? 'operational' : a.status,
        lifecycle: [...a.lifecycle, { at: now, type: 'repair', detail: resolution ?? 'Fault resolved', by: actorId }],
        updatedAt: now,
      } : a)),
      auditLog: this.audit(model, actorId, 'asset.resolveFault', fault.assetId, resolution),
      updatedAt: now,
    };
  }

  // ── Predictive maintenance (A7: no waiting for breakdown) ──────────────────
  static predictiveHealth(model: AssetModel, now = Date.now()): AssetModel {
    const next: AssetModel = {
      ...model,
      assets: model.assets.map((a) => {
        const failure = predictiveFailurePct(a, model, now);
        return { ...a, health: { ...a.health, failureProbabilityPct: failure } };
      }),
      updatedAt: now,
    };
    return next;
  }

  // ── Warranty / calibration / maintenance alerts ─────────────────────────────
  static alerts(model: AssetModel, now = Date.now()): AssetAlert[] {
    const alerts: AssetAlert[] = [];
    for (const a of model.assets) {
      if (a.warranty) {
        const days = Math.ceil((a.warranty.end - now) / 86400000);
        if (days >= 0 && days <= 90) {
          alerts.push({ assetId: a.assetId, assetName: a.name, type: 'warranty_expiring', level: days <= 30 ? 'high' : 'medium', detail: `Warranty expires in ${days} days` });
        }
      }
      if (a.health.calibrationDue && a.health.calibrationDue < now) {
        alerts.push({ assetId: a.assetId, assetName: a.name, type: 'calibration_overdue', level: 'high', detail: 'Calibration is overdue' });
      } else if (a.health.calibrationDue && a.health.calibrationDue - now <= 30 * 86400000) {
        alerts.push({ assetId: a.assetId, assetName: a.name, type: 'calibration_due', level: 'medium', detail: 'Calibration due within 30 days' });
      }
      if (a.health.nextMaintenanceDue && a.health.nextMaintenanceDue < now) {
        alerts.push({ assetId: a.assetId, assetName: a.name, type: 'maintenance_overdue', level: 'high', detail: 'Maintenance is overdue' });
      }
      if (a.health.failureProbabilityPct >= 70) {
        alerts.push({ assetId: a.assetId, assetName: a.name, type: 'failure_risk', level: 'high', detail: `Failure probability ${a.health.failureProbabilityPct}%` });
      }
      for (const c of a.consumables) {
        if (c.stockLevel <= c.threshold) {
          alerts.push({ assetId: a.assetId, assetName: a.name, type: 'consumable_low', level: 'medium', detail: `${c.name} below threshold (${c.stockLevel})` });
        }
      }
    }
    return alerts;
  }

  // ── Analytics ───────────────────────────────────────────────────────────────
  static getOverview(model: AssetModel, now = Date.now()): AssetOverview {
    const operational = model.assets.filter((a) => a.status === 'operational').length;
    const maintenance = model.assets.filter((a) => a.status === 'maintenance').length;
    const faulted = model.assets.filter((a) => a.status === 'faulted').length;
    const reserved = model.assets.filter((a) => a.status === 'reserved').length;
    const totalValue = model.assets.reduce((s, a) => s + (a.finance.currentValue ?? a.finance.purchaseCost), 0);
    const replacementCost = model.assets.reduce((s, a) => s + a.finance.purchaseCost, 0);
    const maintenanceCostYtd = model.maintenance.filter((m) => m.status === 'completed' && m.cost).reduce((s, m) => s + (m.cost ?? 0), 0);
    const utilAssets = model.assets.filter((a) => a.utilization?.utilizationPct !== undefined);
    const avgUtil = utilAssets.length ? Math.round(utilAssets.reduce((s, a) => s + (a.utilization?.utilizationPct ?? 0), 0) / utilAssets.length) : 0;
    const avgDowntime = utilAssets.length ? Math.round(utilAssets.reduce((s, a) => s + (a.utilization?.downtimeMinutes ?? 0), 0) / utilAssets.length) : 0;
    const warrantyExpiring = this.alerts(model, now).filter((al) => al.type === 'warranty_expiring').length;
    const openFaults = model.faults.filter((f) => f.status === 'open' || f.status === 'escalated').length;
    const calibrationDue = model.calibration.filter((c) => c.nextDue - now <= 30 * 86400000).length;
    const healthScore = model.assets.length ? Math.round((operational / model.assets.length) * 100) : 100;
    const revenueToday = model.assets.reduce((s, a) => s + (a.utilization?.revenueToday ?? 0), 0);
    return {
      totalAssets: model.assets.length,
      operational,
      maintenance,
      faulted,
      reserved,
      totalValue,
      replacementCost,
      maintenanceCostYtd,
      avgUtilization: avgUtil,
      avgDowntimeMinutes: avgDowntime,
      warrantyExpiring,
      openFaults,
      calibrationDue,
      healthScore,
      revenueToday,
    };
  }

  static departmentOverview(model: AssetModel, department: string, now = Date.now()) {
    const assets = model.assets.filter((a) => a.department === department);
    const maintenanceCost = model.maintenance.filter((m) => m.status === 'completed' && m.cost && assets.some((a) => a.id === m.assetId)).reduce((s, m) => s + (m.cost ?? 0), 0);
    const util = assets.filter((a) => a.utilization?.utilizationPct !== undefined);
    const avgUtil = util.length ? Math.round(util.reduce((s, a) => s + (a.utilization?.utilizationPct ?? 0), 0) / util.length) : 0;
    const value = assets.reduce((s, a) => s + (a.finance.currentValue ?? a.finance.purchaseCost), 0);
    const calibrationDue = assets.filter((a) => a.health.calibrationDue && a.health.calibrationDue - now <= 30 * 86400000).length;
    const faults = model.faults.filter((f) => assets.some((a) => a.id === f.assetId) && f.status !== 'resolved').length;
    return {
      department,
      assets: assets.length,
      operational: assets.filter((a) => a.status === 'operational').length,
      faulted: assets.filter((a) => a.status === 'faulted').length,
      maintenance: assets.filter((a) => a.status === 'maintenance').length,
      avgUtilization: avgUtil,
      value,
      maintenanceCost,
      calibrationDue,
      faults,
    };
  }

  static departmentTreemap(model: AssetModel): { department: string; value: number }[] {
    const map = new Map<string, number>();
    for (const a of model.assets) {
      const v = a.finance.currentValue ?? a.finance.purchaseCost;
      map.set(a.department, (map.get(a.department) ?? 0) + v);
    }
    return Array.from(map.entries())
      .map(([department, value]) => ({ department, value }))
      .sort((x, y) => y.value - x.value);
  }

  static replacementForecast(model: AssetModel, now = Date.now()): ReplacementForecastItem[] {
    const predicted = this.predictiveHealth(model, now);
    return predicted.assets
      .map((a) => {
        const ageYears = a.finance.installationDate ? (now - a.finance.installationDate) / (365 * 86400000) : 0;
        const eol = a.finance.usefulLifeYears - ageYears;
        const critical = a.health.failureProbabilityPct >= 70 || a.status === 'faulted';
        return {
          assetId: a.assetId,
          name: a.name,
          department: a.department,
          ageYears: Math.round(ageYears * 10) / 10,
          usefulLifeYears: a.finance.usefulLifeYears,
          yearsToEndOfLife: Math.round(eol * 10) / 10,
          replacementCost: a.finance.purchaseCost,
          failureProbability: a.health.failureProbabilityPct,
          critical,
          due: eol <= 0,
        };
      })
      .filter((r) => r.due || r.critical || r.yearsToEndOfLife <= 2)
      .sort((x, y) => x.yearsToEndOfLife - y.yearsToEndOfLife);
  }

  // ── Search ──────────────────────────────────────────────────────────────────
  static search(model: AssetModel, query: string): AssetRecord[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return model.assets.filter((a) =>
      [a.assetId, a.name, a.model, a.manufacturer, a.serialNumber, a.department, getAssetCategoryLabel(a.category), a.location.building ?? '']
        .join(' ').toLowerCase().includes(q)
    );
  }

  static byCategory(model: AssetModel, category: string): AssetRecord[] {
    return model.assets.filter((a) => a.category === category);
  }

  static byDepartment(model: AssetModel, department: string): AssetRecord[] {
    return model.assets.filter((a) => a.department === department);
  }
}

// ── helper: lifecycle event for a status change ───────────────────────────────
function statusEventFor(status: AssetStatus): LifecycleEventType {
  switch (status) {
    case 'operational': return 'operational';
    case 'maintenance': return 'maintenance';
    case 'faulted': return 'fault';
    case 'reserved': return 'reserved';
    case 'retired': return 'retired';
    case 'pending': return 'installed';
  }
}

// ── helper: predictive failure probability ────────────────────────────────────
function predictiveFailurePct(asset: AssetRecord, model: AssetModel, now: number): number {
  let pct = 0;
  if (asset.health.failureProbabilityPct) pct = asset.health.failureProbabilityPct;
  // older than useful life → high risk
  if (asset.finance.installationDate && asset.finance.usefulLifeYears) {
    const ageYears = (now - asset.finance.installationDate) / (365 * 86400000);
    if (ageYears > asset.finance.usefulLifeYears) pct = Math.max(pct, 90);
    else if (ageYears > asset.finance.usefulLifeYears * 0.8) pct = Math.max(pct, 72);
    else if (ageYears > asset.finance.usefulLifeYears * 0.5) pct = Math.max(pct, 45);
    else pct = Math.max(pct, ageYears / asset.finance.usefulLifeYears * 40);
  }
  // recent repeated faults raise probability
  const recentFaults = model.faults.filter((f) => f.assetId === asset.id && now - f.reportedAt < 90 * 86400000).length;
  pct += recentFaults * 8;
  // overdue calibration/maintenance
  if (asset.health.calibrationDue && asset.health.calibrationDue < now) pct += 10;
  if (asset.health.nextMaintenanceDue && asset.health.nextMaintenanceDue < now) pct += 10;
  return Math.min(97, Math.round(pct));
}

// ── type-level exports used by the engine surface ─────────────────────────────
export interface AssetAlert {
  assetId: string;
  assetName: string;
  type: 'warranty_expiring' | 'calibration_overdue' | 'calibration_due' | 'maintenance_overdue' | 'failure_risk' | 'consumable_low';
  level: 'low' | 'medium' | 'high';
  detail: string;
}

export interface AssetOverview {
  totalAssets: number;
  operational: number;
  maintenance: number;
  faulted: number;
  reserved: number;
  totalValue: number;
  replacementCost: number;
  maintenanceCostYtd: number;
  avgUtilization: number;
  avgDowntimeMinutes: number;
  warrantyExpiring: number;
  openFaults: number;
  calibrationDue: number;
  healthScore: number;
  revenueToday: number;
}

export interface ReplacementForecastItem {
  assetId: string;
  name: string;
  department: string;
  ageYears: number;
  usefulLifeYears: number;
  yearsToEndOfLife: number;
  replacementCost: number;
  failureProbability: number;
  critical: boolean;
  due: boolean;
}