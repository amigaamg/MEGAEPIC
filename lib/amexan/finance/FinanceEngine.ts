// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Finance Engine (BOOK VI-Q · Constitutional Engine No. 27)
//
// "The Engine of Financial Sustainability"
//
// The engine governs: patient billing, insurance claims, the revenue cycle,
// payroll, budgets, asset costing, department profitability, financial
// forecasting, procurement, inventory valuation, and capital planning.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Constitutional authority / restriction tables ──────────────────────────────

export const FINANCE_AUTHORITY: readonly string[] = [
  'issue_bills', 'process_payments', 'submit_insurance_claims',
  'manage_payroll', 'create_budgets', 'manage_procurement',
  'cost_assets', 'run_financial_forecasts', 'manage_revenue_cycle',
  'lead_financial_governance',
];

export const FINANCE_RESTRICTIONS: readonly string[] = [
  'alter_patient_bills_without_authority', 'misallocate_funds',
  'override_constitutional_governance', 'disclose_financial_data',
  'approve_own_payments', 'underreport_revenue',
];

// ── Billing engine ─────────────────────────────────────────────────────────────

export type BillLineKind =
  | 'consultation' | 'admission' | 'procedure' | 'theatre' | 'laboratory'
  | 'radiology' | 'pharmacy' | 'consumables' | 'accommodation' | 'professional_fees';

export interface BillLine {
  id: string;
  kind: BillLineKind;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Bill {
  id: string;
  patientId: string;
  encounterId?: string;
  lines: BillLine[];
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  paid: number;
  status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'void';
  issuedAt: number;
  issuedBy?: AmxUid;
}

// ── Insurance engine ───────────────────────────────────────────────────────────

export interface InsuranceEligibility {
  policyNumber: string;
  insurerId: string;
  patientId: string;
  eligible: boolean;
  checkedAt: number;
  coverage: { kind: BillLineKind; covered: boolean; percent: number }[];
}

export interface InsuranceClaim {
  id: string;
  billId: string;
  patientId: string;
  insurerId: string;
  amount: number;
  status: 'submitted' | 'accepted' | 'rejected' | 'appealed' | 'reconciled';
  submittedAt: number;
  decisionAt?: number;
  rejectionReason?: string;
  appealNote?: string;
  reconciledAt?: number;
}

// ── Revenue cycle ──────────────────────────────────────────────────────────────

export interface RevenueCycleStage {
  id: string;
  patientId: string;
  encounterId?: string;
  stages: { stage: string; enteredAt: number; status: 'pending' | 'done' }[];
  outstandingAmount: number;
  currentStage: string;
}

// ── Payroll / budgets / assets ─────────────────────────────────────────────────

export interface PayrollRecord {
  id: string;
  staffId: AmxUid;
  period: string;
  gross: number;
  deductions: number;
  net: number;
  processedAt: number;
  processedBy?: AmxUid;
}

export interface BudgetLine {
  id: string;
  departmentId?: string;
  category: string;
  planned: number;
  spent: number;
}

export interface Budget {
  id: string;
  period: string;
  lines: BudgetLine[];
  totalPlanned: number;
  totalSpent: number;
}

export interface AssetCost {
  id: string;
  assetId: string;
  acquisitionCost: number;
  depreciationPerYear: number;
  currentValue: number;
  asOf: number;
}

// ── Procurement engine ─────────────────────────────────────────────────────────

export type ProcurementStage =
  | 'requested' | 'approved' | 'tender' | 'supplier_selected'
  | 'purchase_order' | 'delivered' | 'inventory' | 'payment';

export interface ProcurementItem {
  id: string;
  name: string;
  quantity: number;
  estimatedCost: number;
  actualCost?: number;
}

export interface Procurement {
  id: string;
  title: string;
  stage: ProcurementStage;
  items: ProcurementItem[];
  requestedAt: number;
  requestedBy: AmxUid;
  approvedAt?: number;
  approvedBy?: AmxUid;
  supplierId?: string;
  purchaseOrderNumber?: string;
  deliveredAt?: number;
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  totalCost?: number;
}

// ── Department profitability ───────────────────────────────────────────────────

export interface DepartmentFinance {
  departmentId: string;
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  marginPercent: number;
}

// ── Executive analytics ────────────────────────────────────────────────────────

export interface ExecutiveAnalytics {
  revenue: number;
  expenses: number;
  profitability: number;
  departmentContribution: Record<string, number>;
  insurancePerformance: { insurerId: string; acceptedPercent: number }[];
  outstandingDebt: number;
  cashFlow: { period: string; inflow: number; outflow: number; net: number }[];
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface FinanceModel {
  organizationId: string;
  facilityId?: string;
  chiefFinancialOfficerId?: AmxUid;
  bills: Bill[];
  eligibilityChecks: InsuranceEligibility[];
  claims: InsuranceClaim[];
  revenueCycles: RevenueCycleStage[];
  payrollRecords: PayrollRecord[];
  budgets: Budget[];
  assetCosts: AssetCost[];
  procurements: Procurement[];
  departmentFinances: DepartmentFinance[];
  analytics: ExecutiveAnalytics;
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateFinanceModelInput {
  organizationId: string;
  facilityId?: string;
  chiefFinancialOfficerId?: AmxUid;
  actorId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── The Engine ─────────────────────────────────────────────────────────────────

export class FinanceEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateFinanceModelInput): FinanceModel {
    if (!input.organizationId) throw new Error('[FinanceEngine] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      chiefFinancialOfficerId: input.chiefFinancialOfficerId,
      bills: [],
      eligibilityChecks: [],
      claims: [],
      revenueCycles: [],
      payrollRecords: [],
      budgets: [],
      assetCosts: [],
      procurements: [],
      departmentFinances: [],
      analytics: {
        revenue: 0,
        expenses: 0,
        profitability: 0,
        departmentContribution: {},
        insurancePerformance: [],
        outstandingDebt: 0,
        cashFlow: [],
      },
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard & audit ─────────────────────────────────────────────

  static canFinancePerform(action: string): { allowed: boolean; reason?: string } {
    if (FINANCE_AUTHORITY.includes(action)) return { allowed: true };
    if (FINANCE_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        alter_patient_bills_without_authority: 'Bill alterations require authorization.',
        misallocate_funds: 'Funds may not be misallocated.',
        override_constitutional_governance: 'Constitutional governance may not be overridden.',
        disclose_financial_data: 'Financial data is confidential.',
        approve_own_payments: 'Self-approval of payments is prohibited.',
        underreport_revenue: 'Revenue must be reported accurately.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Finance authority.` };
  }

  static guard(model: FinanceModel, actorId: AmxUid, action: string): void {
    if (!actorId) throw new Error('[FinanceEngine] actorId is required for finance actions');
    const verdict = FinanceEngine.canFinancePerform(action);
    if (!verdict.allowed) throw new Error(`[FinanceEngine] ${verdict.reason}`);
  }

  static audit(model: FinanceModel, actorId: AmxUid | undefined, action: string, detail?: string): FinanceModel {
    const now = Date.now();
    const actor = actorId ?? model.chiefFinancialOfficerId;
    if (!actor) return { ...model, updatedAt: now };
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId: actor, action, detail }], updatedAt: now };
  }

  // ── Billing Engine ───────────────────────────────────────────────────────────

  static createBill(model: FinanceModel, actorId: AmxUid | undefined, input: { patientId: string; encounterId?: string; lines: Omit<BillLine, 'id' | 'total'>[]; discount?: number; taxes?: number }): { model: FinanceModel; bill: Bill } {
    FinanceEngine.guard(model, actorId ?? model.chiefFinancialOfficerId ?? ('' as AmxUid), 'issue_bills');
    const lines: BillLine[] = input.lines.map(l => ({ ...l, id: nextId('bl'), total: l.quantity * l.unitPrice }));
    const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
    const discount = input.discount ?? 0;
    const taxes = input.taxes ?? 0;
    const total = subtotal - discount + taxes;
    const bill: Bill = { id: nextId('bill'), patientId: input.patientId, encounterId: input.encounterId, lines, subtotal, discount, taxes, total, paid: 0, status: 'draft', issuedAt: Date.now() };
    return {
      model: { ...FinanceEngine.audit(model, actorId, 'bill_created', input.patientId), bills: [...model.bills, bill], updatedAt: Date.now() },
      bill,
    };
  }

  static issueBill(model: FinanceModel, billId: string): FinanceModel {
    const index = model.bills.findIndex(b => b.id === billId);
    if (index === -1) throw new Error(`[FinanceEngine] Bill "${billId}" does not exist`);
    const updated = { ...model.bills[index], status: 'issued' as const };
    return {
      ...model,
      bills: [...model.bills.slice(0, index), updated, ...model.bills.slice(index + 1)],
      analytics: { ...model.analytics, revenue: model.analytics.revenue + model.bills[index].total, outstandingDebt: model.analytics.outstandingDebt + model.bills[index].total, cashFlow: [...model.analytics.cashFlow, { period: new Date().toISOString().slice(0, 7), inflow: model.bills[index].total, outflow: 0, net: model.bills[index].total }] },
      updatedAt: Date.now(),
    };
  }

  static recordPayment(model: FinanceModel, billId: string, amount: number, actorId: AmxUid | undefined): FinanceModel {
    const index = model.bills.findIndex(b => b.id === billId);
    if (index === -1) throw new Error(`[FinanceEngine] Bill "${billId}" does not exist`);
    const current = model.bills[index];
    const paid = current.paid + amount;
    const status = paid >= current.total ? ('paid' as const) : paid > 0 ? ('partially_paid' as const) : current.status;
    const updated = { ...current, paid, status };
    return {
      ...model,
      bills: [...model.bills.slice(0, index), updated, ...model.bills.slice(index + 1)],
      analytics: { ...model.analytics, outstandingDebt: Math.max(0, model.analytics.outstandingDebt - amount), cashFlow: [...model.analytics.cashFlow, { period: new Date().toISOString().slice(0, 7), inflow: amount, outflow: 0, net: amount }] },
      updatedAt: Date.now(),
    };
  }

  static getOutstandingBills(model: FinanceModel): Bill[] {
    return model.bills.filter(b => b.status !== 'paid' && b.status !== 'void');
  }

  // ── Insurance Engine ─────────────────────────────────────────────────────────

  static checkEligibility(model: FinanceModel, input: Omit<InsuranceEligibility, 'checkedAt' | 'eligible'> & { eligible: boolean }): { model: FinanceModel; check: InsuranceEligibility } {
    const check: InsuranceEligibility = { ...input, checkedAt: Date.now() };
    return { model: { ...model, eligibilityChecks: [...model.eligibilityChecks, check], updatedAt: Date.now() }, check };
  }

  static submitClaim(model: FinanceModel, actorId: AmxUid | undefined, input: { billId: string; patientId: string; insurerId: string; amount: number }): { model: FinanceModel; claim: InsuranceClaim } {
    FinanceEngine.guard(model, actorId ?? model.chiefFinancialOfficerId ?? ('' as AmxUid), 'submit_insurance_claims');
    const claim: InsuranceClaim = { ...input, id: nextId('clm'), status: 'submitted', submittedAt: Date.now() };
    return {
      model: { ...FinanceEngine.audit(model, actorId, 'claim_submitted', input.insurerId), claims: [...model.claims, claim], updatedAt: Date.now() },
      claim,
    };
  }

  static decideClaim(model: FinanceModel, claimId: string, accepted: boolean, reason?: string): FinanceModel {
    const index = model.claims.findIndex(c => c.id === claimId);
    if (index === -1) throw new Error(`[FinanceEngine] Claim "${claimId}" does not exist`);
    const updated = { ...model.claims[index], status: accepted ? ('accepted' as const) : ('rejected' as const), decisionAt: Date.now(), rejectionReason: accepted ? undefined : reason };
    return { ...model, claims: [...model.claims.slice(0, index), updated, ...model.claims.slice(index + 1)], updatedAt: Date.now() };
  }

  static appealClaim(model: FinanceModel, claimId: string, appealNote: string): FinanceModel {
    const index = model.claims.findIndex(c => c.id === claimId);
    if (index === -1) throw new Error(`[FinanceEngine] Claim "${claimId}" does not exist`);
    const updated = { ...model.claims[index], status: 'appealed' as const, appealNote };
    return { ...model, claims: [...model.claims.slice(0, index), updated, ...model.claims.slice(index + 1)], updatedAt: Date.now() };
  }

  static reconcileClaim(model: FinanceModel, claimId: string): FinanceModel {
    const index = model.claims.findIndex(c => c.id === claimId);
    if (index === -1) throw new Error(`[FinanceEngine] Claim "${claimId}" does not exist`);
    const updated = { ...model.claims[index], status: 'reconciled' as const, reconciledAt: Date.now() };
    const insurerId = model.claims[index].insurerId;
    const performance = model.analytics.insurancePerformance;
    const perfIndex = performance.findIndex(p => p.insurerId === insurerId);
    const acceptedForInsurer = model.claims.filter(c => c.insurerId === insurerId && (c.status === 'accepted' || c.status === 'reconciled')).length + 1;
    const totalForInsurer = model.claims.filter(c => c.insurerId === insurerId).length + 1;
    const insurancePerformance = perfIndex === -1
      ? [...performance, { insurerId, acceptedPercent: Math.round((acceptedForInsurer / totalForInsurer) * 100) }]
      : performance.map((p, i) => i === perfIndex ? { ...p, acceptedPercent: Math.round((acceptedForInsurer / totalForInsurer) * 100) } : p);
    return {
      ...model,
      claims: [...model.claims.slice(0, index), updated, ...model.claims.slice(index + 1)],
      analytics: { ...model.analytics, insurancePerformance },
      updatedAt: Date.now(),
    };
  }

  // ── Revenue Cycle ────────────────────────────────────────────────────────────

  static startRevenueCycle(model: FinanceModel, input: { patientId: string; encounterId?: string; stages: string[] }): { model: FinanceModel; cycle: RevenueCycleStage } {
    const cycle: RevenueCycleStage = {
      id: nextId('rc'),
      patientId: input.patientId,
      encounterId: input.encounterId,
      stages: input.stages.map(s => ({ stage: s, enteredAt: Date.now(), status: 'pending' as const })),
      outstandingAmount: 0,
      currentStage: input.stages[0] ?? '',
    };
    return { model: { ...model, revenueCycles: [...model.revenueCycles, cycle], updatedAt: Date.now() }, cycle };
  }

  static advanceRevenueCycle(model: FinanceModel, cycleId: string, stage: string): FinanceModel {
    const index = model.revenueCycles.findIndex(c => c.id === cycleId);
    if (index === -1) throw new Error(`[FinanceEngine] Revenue cycle "${cycleId}" does not exist`);
    const current = model.revenueCycles[index];
    const stages = current.stages.map(s => s.stage === stage ? { ...s, status: 'done' as const } : s);
    const updated = { ...current, stages, currentStage: stage };
    return { ...model, revenueCycles: [...model.revenueCycles.slice(0, index), updated, ...model.revenueCycles.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Payroll / Budgets / Assets ───────────────────────────────────────────────

  static processPayroll(model: FinanceModel, actorId: AmxUid | undefined, input: Omit<PayrollRecord, 'id' | 'processedAt'>): { model: FinanceModel; record: PayrollRecord } {
    FinanceEngine.guard(model, actorId ?? model.chiefFinancialOfficerId ?? ('' as AmxUid), 'manage_payroll');
    const record: PayrollRecord = { ...input, id: nextId('pay'), processedAt: Date.now() };
    return {
      model: { ...FinanceEngine.audit(model, actorId, 'payroll_processed', input.period), payrollRecords: [...model.payrollRecords, record], analytics: { ...model.analytics, expenses: model.analytics.expenses + record.net }, updatedAt: Date.now() },
      record,
    };
  }

  static createBudget(model: FinanceModel, input: Omit<Budget, 'id' | 'totalPlanned' | 'totalSpent'>): { model: FinanceModel; budget: Budget } {
    const totalPlanned = input.lines.reduce((sum, l) => sum + l.planned, 0);
    const totalSpent = input.lines.reduce((sum, l) => sum + l.spent, 0);
    const budget: Budget = { ...input, id: nextId('bud'), totalPlanned, totalSpent };
    return { model: { ...model, budgets: [...model.budgets, budget], updatedAt: Date.now() }, budget };
  }

  static recordAssetCost(model: FinanceModel, input: Omit<AssetCost, 'id' | 'asOf'>): { model: FinanceModel; cost: AssetCost } {
    const cost: AssetCost = { ...input, id: nextId('asst'), asOf: Date.now() };
    return { model: { ...model, assetCosts: [...model.assetCosts, cost], updatedAt: Date.now() }, cost };
  }

  // ── Procurement Engine ───────────────────────────────────────────────────────

  static createProcurement(model: FinanceModel, actorId: AmxUid | undefined, input: Omit<Procurement, 'id' | 'stage' | 'requestedAt' | 'requestedBy'> & { requestedBy: AmxUid }): { model: FinanceModel; procurement: Procurement } {
    FinanceEngine.guard(model, input.requestedBy, 'manage_procurement');
    const procurement: Procurement = { ...input, id: nextId('prc'), stage: 'requested', requestedAt: Date.now(), items: input.items.map(i => ({ ...i, id: nextId('pi') })) };
    return {
      model: { ...FinanceEngine.audit(model, actorId, 'procurement_requested', input.title), procurements: [...model.procurements, procurement], updatedAt: Date.now() },
      procurement,
    };
  }

  static approveProcurement(model: FinanceModel, procurementId: string, approvedBy: AmxUid): FinanceModel {
    const index = model.procurements.findIndex(p => p.id === procurementId);
    if (index === -1) throw new Error(`[FinanceEngine] Procurement "${procurementId}" does not exist`);
    const updated = { ...model.procurements[index], stage: 'approved' as const, approvedAt: Date.now(), approvedBy };
    return { ...model, procurements: [...model.procurements.slice(0, index), updated, ...model.procurements.slice(index + 1)], updatedAt: Date.now() };
  }

  static selectSupplier(model: FinanceModel, procurementId: string, supplierId: string, totalCost: number): FinanceModel {
    const index = model.procurements.findIndex(p => p.id === procurementId);
    if (index === -1) throw new Error(`[FinanceEngine] Procurement "${procurementId}" does not exist`);
    const updated = { ...model.procurements[index], stage: 'supplier_selected' as const, supplierId, totalCost };
    return { ...model, procurements: [...model.procurements.slice(0, index), updated, ...model.procurements.slice(index + 1)], updatedAt: Date.now() };
  }

  static createPurchaseOrder(model: FinanceModel, procurementId: string, purchaseOrderNumber: string): FinanceModel {
    const index = model.procurements.findIndex(p => p.id === procurementId);
    if (index === -1) throw new Error(`[FinanceEngine] Procurement "${procurementId}" does not exist`);
    const updated = { ...model.procurements[index], stage: 'purchase_order' as const, purchaseOrderNumber };
    return { ...model, procurements: [...model.procurements.slice(0, index), updated, ...model.procurements.slice(index + 1)], updatedAt: Date.now() };
  }

  static deliverProcurement(model: FinanceModel, procurementId: string): FinanceModel {
    const index = model.procurements.findIndex(p => p.id === procurementId);
    if (index === -1) throw new Error(`[FinanceEngine] Procurement "${procurementId}" does not exist`);
    const updated = { ...model.procurements[index], stage: 'delivered' as const, deliveredAt: Date.now() };
    return { ...model, procurements: [...model.procurements.slice(0, index), updated, ...model.procurements.slice(index + 1)], updatedAt: Date.now() };
  }

  static payProcurement(model: FinanceModel, procurementId: string, actorId: AmxUid | undefined): FinanceModel {
    const index = model.procurements.findIndex(p => p.id === procurementId);
    if (index === -1) throw new Error(`[FinanceEngine] Procurement "${procurementId}" does not exist`);
    const current = model.procurements[index];
    const updated = { ...current, stage: 'payment' as const, paymentStatus: 'paid' as const };
    const cost = current.totalCost ?? 0;
    return {
      ...model,
      procurements: [...model.procurements.slice(0, index), updated, ...model.procurements.slice(index + 1)],
      analytics: { ...model.analytics, expenses: model.analytics.expenses + cost, cashFlow: [...model.analytics.cashFlow, { period: new Date().toISOString().slice(0, 7), inflow: 0, outflow: cost, net: -cost }] },
      updatedAt: Date.now(),
    };
  }

  // ── Department profitability ─────────────────────────────────────────────────

  static recordDepartmentFinance(model: FinanceModel, input: Omit<DepartmentFinance, 'profit' | 'marginPercent'>): { model: FinanceModel; finance: DepartmentFinance } {
    const profit = input.revenue - input.expenses;
    const marginPercent = input.revenue > 0 ? Math.round((profit / input.revenue) * 100) : 0;
    const finance: DepartmentFinance = { ...input, profit, marginPercent };
    return {
      model: { ...model, departmentFinances: [...model.departmentFinances, finance], analytics: { ...model.analytics, departmentContribution: { ...model.analytics.departmentContribution, [input.departmentId]: profit } }, updatedAt: Date.now() },
      finance,
    };
  }

  // ── Executive analytics / forecasting ────────────────────────────────────────

  static recomputeAnalytics(model: FinanceModel): FinanceModel {
    const revenue = model.bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.total, 0);
    const expenses = model.payrollRecords.reduce((sum, r) => sum + r.net, 0) + model.procurements.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + (p.totalCost ?? 0), 0);
    const profitability = revenue - expenses;
    return { ...model, analytics: { ...model.analytics, revenue, expenses, profitability }, updatedAt: Date.now() };
  }

  static forecastCashFlow(model: FinanceModel, periods: string[]): { period: string; projectedInflow: number; projectedOutflow: number; net: number }[] {
    const avgInflow = model.analytics.cashFlow.length > 0 ? model.analytics.cashFlow.reduce((s, c) => s + c.inflow, 0) / model.analytics.cashFlow.length : 0;
    const avgOutflow = model.analytics.cashFlow.length > 0 ? model.analytics.cashFlow.reduce((s, c) => s + c.outflow, 0) / model.analytics.cashFlow.length : 0;
    return periods.map(p => ({ period: p, projectedInflow: Math.round(avgInflow), projectedOutflow: Math.round(avgOutflow), net: Math.round(avgInflow - avgOutflow) }));
  }

  // ── Read conveniences / dashboard ────────────────────────────────────────────

  static getDashboardSummary(model: FinanceModel): {
    outstandingDebt: number;
    openClaims: number;
    activeProcurements: number;
    revenue: number;
    expenses: number;
    profitability: number;
  } {
    return {
      outstandingDebt: model.analytics.outstandingDebt,
      openClaims: model.claims.filter(c => c.status === 'submitted' || c.status === 'appealed').length,
      activeProcurements: model.procurements.filter(p => p.stage !== 'payment').length,
      revenue: model.analytics.revenue,
      expenses: model.analytics.expenses,
      profitability: model.analytics.profitability,
    };
  }
}

export default FinanceEngine;
