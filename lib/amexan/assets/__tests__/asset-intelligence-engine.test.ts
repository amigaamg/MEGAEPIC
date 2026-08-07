import { describe, it, expect } from 'vitest';
import { AssetIntelligenceEngine, computeRemainingValue } from '../AssetIntelligenceEngine';
import { ASSET_CATEGORIES, ASSET_CATALOG, MAINTENANCE_TYPES, REPORTS } from '../registry';
import type { AssetModel } from '../constitutional-types';

const actor = 'AMX-PER-ADMIN-1';
const now = Date.now();

function fresh(): AssetModel {
  return AssetIntelligenceEngine.create({ organizationId: 'org-kenyatta' });
}

function registerCT(model: AssetModel, dept = 'Radiology') {
  return AssetIntelligenceEngine.registerAsset(model, actor, {
    department: dept,
    category: 'radiology_equipment',
    itemKey: 'ct_scanner',
    name: 'CT Scanner A',
    finance: {
      purchaseCost: 145000000,
      purchaseDate: now,
      installationDate: now,
      usefulLifeYears: 10,
      residualValue: 10000000,
      supplier: 'Siemens',
      fundingSource: 'government',
    },
    warranty: { start: now, end: now + 2 * 365 * 86400000 },
  });
}

describe('AssetIntelligenceEngine — A1/A2/A3 · identity, location, responsibility', () => {
  it('registers an asset with a constitutional identity', () => {
    const model = fresh();
    const { asset } = registerCT(model);
    expect(asset.assetId).toMatch(/^AST-\d{6}$/);
    expect(asset.category).toBe('radiology_equipment');
    expect(asset.department).toBe('Radiology');
    expect(asset.links.departments).toContain('Radiology');
    expect(asset.lifecycle[0].type).toBe('purchased');
  });

  it('assigns unique sequential asset IDs', () => {
    const { model: m1, asset: a } = registerCT(fresh());
    const { asset: b } = AssetIntelligenceEngine.registerAsset(m1, actor, {
      department: 'ICT', itemKey: 'server_rack', name: 'Server Rack',
    });
    expect(a.assetId).not.toBe(b.assetId);
    expect(parseInt(b.assetId.slice(4), 10)).toBeGreaterThan(parseInt(a.assetId.slice(4), 10));
  });

  it('fills the name, department and cost from the catalog', () => {
    const { model } = AssetIntelligenceEngine.registerAsset(fresh(), actor, {
      department: 'Laboratory', itemKey: 'microscope',
    });
    const asset = model.assets[0];
    expect(asset.name).toBe('Microscope');
    expect(asset.category).toBe('laboratory_equipment');
    expect(asset.finance.purchaseCost).toBeGreaterThan(0);
  });

  it('rejects a registration without a department (A1 integrity)', () => {
    const model = fresh();
    expect(() => AssetIntelligenceEngine.registerAsset(model, actor, {
      department: '', category: 'medical_equipment', itemKey: 'ventilator',
    })).toThrow(/department/);
  });

  it('the registry is fully constitutional', () => {
    expect(ASSET_CATEGORIES.length).toBeGreaterThanOrEqual(24);
    expect(ASSET_CATALOG.length).toBeGreaterThanOrEqual(20);
    expect(MAINTENANCE_TYPES.length).toBe(8);
    expect(REPORTS.length).toBeGreaterThanOrEqual(8);
  });
});

describe('AssetIntelligenceEngine — A8 · maintenance & calibration', () => {
  it('schedules and completes maintenance jobs', () => {
    const { model: m0, asset } = registerCT(fresh());
    const sched = AssetIntelligenceEngine.scheduleMaintenance(m0, actor, {
      assetId: asset.id, type: 'preventive', title: 'Preventive calibration', scheduledFor: now,
    });
    expect(sched.job.status).toBe('scheduled');
    const done = AssetIntelligenceEngine.completeMaintenance(sched.model, actor, sched.job.id, {
      performedBy: 'BME-1', cost: 250000,
    });
    expect(done.job.status).toBe('completed');
    const rec = AssetIntelligenceEngine.calibrate(m0, actor, {
      assetId: asset.id, performedBy: 'BME-1', nextDueInDays: 180,
    });
    expect(rec.record.status).toBe('healthy');
    expect(rec.record.nextDue).toBeGreaterThan(now);
    expect(rec.model.assets[0].health.calibrationDue).toBe(rec.record.nextDue);
  });
});

describe('AssetIntelligenceEngine — A7 · faults and predictive health', () => {
  it('faults an asset and restores it on resolve', () => {
    const { model: m0, asset } = registerCT(fresh());
    const reported = AssetIntelligenceEngine.reportFault(m0, actor, {
      assetId: asset.id, severity: 'critical', description: 'X-ray tube failed',
      impact: { revenueLossPerDay: 420000, service: 'CT brain', narrative: 'CT capacity reduced' },
    });
    expect(reported.fault.status).toBe('open');
    expect(reported.model.assets[0].status).toBe('faulted');
    const resolved = AssetIntelligenceEngine.resolveFault(reported.model, actor, reported.fault.id, 'Tube replaced');
    expect(resolved.assets[0].status).toBe('operational');
    expect(resolved.faults[0].status).toBe('resolved');
  });

  it('records utilization % and revenue', () => {
    const { model: m0, asset } = registerCT(fresh());
    const { asset: updated } = AssetIntelligenceEngine.recordUtilization(m0, actor, asset.id, {
      usageToday: 81, maxCapacity: 120, revenueToday: 1800000, downtimeMinutes: 12,
    });
    expect(updated.utilization?.utilizationPct).toBe(68);
    expect(updated.utilization?.revenueToday).toBe(1800000);
  });

  it('raises failure probability for an over-life asset', () => {
    const { model: m0 } = AssetIntelligenceEngine.registerAsset(fresh(), actor, {
      department: 'Radiology', itemKey: 'mri', name: 'MRI Unit',
      finance: {
        purchaseCost: 220000000, purchaseDate: now - 9 * 365 * 86400000,
        installationDate: now - 9 * 365 * 86400000, usefulLifeYears: 10,
      },
    });
    const predicted = AssetIntelligenceEngine.predictiveHealth(m0);
    const target = predicted.assets.find((a) => a.name === 'MRI Unit')!;
    expect(target.health.failureProbabilityPct).toBeGreaterThanOrEqual(50);
  });

  it('emits a warranty-expiry alert', () => {
    const { model: m0, asset } = registerCT(fresh());
    const alerts = AssetIntelligenceEngine.alerts(m0, asset.warranty!.end - 30 * 86400000);
    expect(alerts.some((a) => a.type === 'warranty_expiring' && a.assetId === asset.assetId)).toBe(true);
  });
});

describe('AssetIntelligenceEngine — finance & analytics', () => {
  it('straight-line depreciation reduces current value over time', () => {
    const v = computeRemainingValue('straight_line', 145000000, 10, 10000000, now, now + 5 * 365 * 86400000);
    const expected = 145000000 - ((145000000 - 10000000) / 10) * 5;
    expect(v).toBeCloseTo(expected, 0);
  });

  it('aggregates overview totals and operational health', () => {
    const model = registerCT(fresh()).model;
    const o = AssetIntelligenceEngine.getOverview(model);
    expect(o.totalAssets).toBe(1);
    expect(o.operational).toBe(1);
    expect(o.totalValue).toBe(145000000);
    expect(o.healthScore).toBe(100);
  });
});

describe('AssetIntelligenceEngine — departments and replacement forecast', () => {
  it('builds a department treemap sorted by value', () => {
    const { model: m1 } = registerCT(fresh());
    const { model: m2 } = AssetIntelligenceEngine.registerAsset(m1, actor, {
      department: 'ICU', itemKey: 'ventilator', name: 'Ventilator',
      finance: { purchaseCost: 3800000, purchaseDate: now, installationDate: now, usefulLifeYears: 10 },
    });
    const tm = AssetIntelligenceEngine.departmentTreemap(m2);
    expect(tm[0].department).toBe('Radiology');
  });

  it('flags an over-life asset for replacement', () => {
    const model = AssetIntelligenceEngine.registerAsset(fresh(), actor, {
      department: 'Ward', itemKey: 'hospital_bed', name: 'Bed',
      finance: {
        purchaseCost: 186000, purchaseDate: now - 9 * 365 * 86400000,
        installationDate: now - 9 * 365 * 86400000, usefulLifeYears: 10,
      },
    }).model;
    const forecast = AssetIntelligenceEngine.replacementForecast(model);
    expect(forecast.length).toBeGreaterThanOrEqual(1);
    expect(forecast[0].critical).toBe(true);
  });
});