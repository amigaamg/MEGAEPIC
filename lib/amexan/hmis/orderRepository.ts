// ─────────────────────────────────────────────────────────────
// AMEXAN Universal Orders — Engine ↔ Firestore bridge + sync
// Takes orders produced inside an EncounterOrchestratorState
// (labOrders, imagingOrders, prescriptionOrders) and persists them
// as Universal Order documents (Book VII orders-engine) via Firestore.
// Idempotent: each engine order maps to a stable universal order id.
// ─────────────────────────────────────────────────────────────
import type { EncounterOrchestratorState } from '@/lib/amexan/encounter-engine/engines/orchestrator';
import type { Order } from '@/lib/amexan/hmis/orders-engine';
import { OrderType, OrderCategory, OrderPriority, OrderStatus } from '@/lib/amexan/hmis/orders-engine';
import {
  OrderData, createOrderDoc, getOrder, updateOrder,
} from '@/lib/firebase/orderService';

function patientIdOf(state: EncounterOrchestratorState): string {
  return state.biodata?.hospitalNumber || 'new';
}

function metreUserId(state: EncounterOrchestratorState): string {
  return state.biodata?.clinician || 'system';
}

function mapPriority(p: 'routine' | 'urgent' | 'stat' | undefined): OrderPriority {
  if (p === 'stat') return OrderPriority.STAT;
  if (p === 'urgent') return OrderPriority.Urgent;
  return OrderPriority.Routine;
}

function resultFor(value?: string, flag?: 'normal' | 'abnormal' | 'critical' | 'not_assessed') {
  if (!value) return undefined;
  return {
    value,
    isAbnormal: flag === 'abnormal',
    isCritical: flag === 'critical',
    interpretation: flag || undefined,
  };
}

function labOrderType(method: string): OrderType {
  if (method === 'microbiology') return OrderType.LabMicrobiology;
  if (method === 'pathology') return OrderType.LabPathology;
  return OrderType.LabHematology;
}

function imagingOrderType(modality: string = ''): OrderType {
  const m = modality.toLowerCase();
  if (m.includes('ct')) return OrderType.ImagingCT;
  if (m.includes('mri')) return OrderType.ImagingMRI;
  if (m.includes('ultrasound') || m.includes('echo')) return OrderType.ImagingUltrasound;
  if (m.includes('x-ray') || m.includes('xray')) return OrderType.ImagingXRay;
  return OrderType.ImagingOther;
}

function labStatus(s: string): Order['status'] {
  switch (s) {
    case 'ordered': return OrderStatus.Ordered;
    case 'sample_collected':
    case 'processing': return OrderStatus.InProgress;
    case 'completed': return OrderStatus.Completed;
    case 'cancelled': return OrderStatus.Cancelled;
    default: return OrderStatus.Draft;
  }
}

function rxStatus(s: string): Order['status'] {
  switch (s) {
    case 'prescribed': return OrderStatus.Ordered;
    case 'sent_to_pharmacy': return OrderStatus.Acknowledged;
    case 'confirmed': return OrderStatus.InProgress;
    case 'dispensed': return OrderStatus.Completed;
    case 'cancelled': return OrderStatus.Cancelled;
    default: return OrderStatus.Draft;
  }
}

function baseOrder(
  orgId: string, deptId: string, unitId: string, encounterId: string,
  state: EncounterOrchestratorState, id: string,
  orderCategory: OrderCategory, orderType: OrderType,
  status: Order['status'], priority: OrderPriority, indication: string,
  result?: Order['result'], metadata: Record<string, unknown> = {},
): OrderData {
  const now = Date.now();
  return {
    id,
    orgId,
    orderType, orderCategory, status, priority,
    patientId: patientIdOf(state),
    encounterId,
    requesterId: metreUserId(state),
    requesterName: metreUserId(state),
    requesterDepartment: deptId,
    responsibleDepartmentId: deptId,
    responsibleDepartmentName: deptId,
    clinicalIndication: indication,
    isStat: priority === OrderPriority.STAT,
    timing: { orderedAt: now, frequency: priority === OrderPriority.STAT ? 'once' : undefined },
    fulfillment: {},
    result,
    billing: { itemCode: '', itemName: '', quantity: 1, unitPrice: 0, totalPrice: 0, isBilled: false, billingStatus: 'pending' },
    audit: [{ at: now, by: metreUserId(state), action: 'sync', details: 'Created from encounter' }],
    metadata,
    createdAt: now,
    updatedAt: now,
    departmentId: deptId,
    unitId,
  };
}

export function buildLabOrderData(
  orgId: string, deptId: string, unitId: string, encounterId: string,
  state: EncounterOrchestratorState, id: string,
): OrderData {
  const lab = state.labOrders?.find((o) => o.id === id);
  if (!lab || lab.status === 'suggested') return null!;
  return baseOrder(
    orgId, deptId, unitId, encounterId, state, `lab-${encounterId}-${lab.id}`,
    OrderCategory.Laboratory, labOrderType(lab.method), labStatus(lab.status),
    mapPriority(lab.priority), lab.reason || 'Suspected diagnosis', resultFor(lab.result, lab.flag),
    { testName: lab.testName, method: lab.method, referenceRange: lab.referenceRange },
  );
}

export function buildImagingOrderData(
  orgId: string, deptId: string, unitId: string, encounterId: string,
  state: EncounterOrchestratorState, id: string,
): OrderData {
  const img = state.imagingOrders?.find(x => x.id === id);
  if (!img || img.status === 'suggested') return null!;
  return baseOrder(
    orgId, deptId, unitId, encounterId, state, `img-${id}`,
    OrderCategory.Imaging, imagingOrderType(img.modality), labStatus(img.status),
    mapPriority(img.priority), img.reason || 'Imaging requested', resultFor(img.result, img.flag),
    { studyName: img.studyName, modality: img.modality, bodyRegion: img.bodyRegion, findings: img.findings, impression: img.impression },
  );
}

export function buildRxOrderData(
  orgId: string, deptId: string, unitId: string, encounterId: string,
  state: EncounterOrchestratorState, id: string,
): OrderData {
  const rx = state.prescriptionOrders?.find((x) => x.id === id);
  if (!rx || rx.status === 'suggested') return null!;
  return baseOrder(
    orgId, deptId, unitId, encounterId, state, `rx-${id}`,
    OrderCategory.Medication, OrderType.Medication, rxStatus(rx.status),
    mapPriority(rx.priority), rx.indication || rx.reason || 'Prescribed medication', undefined,
    { drugName: rx.drugName, genericName: rx.genericName, dose: rx.dose, doseUnit: rx.doseUnit, route: rx.route, frequency: rx.frequency, duration: rx.duration, patientInstructions: rx.patientInstructions },
  );
}

async function upsertOrder(order: OrderData): Promise<void> {
  const existing = await getOrder(order.departmentId, order.unitId, order.encounterId, order.id, order.orgId).catch(() => null);
  if (existing) {
    const merged: OrderData = { ...existing, ...order, result: order.result || existing.result, updatedAt: Date.now() };
    merged.metadata = { ...existing.metadata, ...order.metadata };
    merged.audit = [...(existing.audit || []), ...(order.audit || [])];
    await updateOrder(existing, merged);
    order.updatedAt = merged.updatedAt;
  } else {
    await createOrderDoc(order);
  }
}

/**
 * Persist every actionable order currently held in an orchestrator state as a
 * Universal Order. Idempotent (upsert). Returns the saved orders.
 */
export async function syncEncounterOrders(
  orgId: string, deptId: string, unitId: string, encounterId: string,
  state: EncounterOrchestratorState,
): Promise<OrderData[]> {
  const saved: OrderData[] = [];
  if (!encounterId || !state) return saved;

  for (const lab of state.labOrders || []) {
    if (lab.status === 'suggested') continue;
    const order = buildLabOrderData(orgId, deptId, unitId, encounterId, state, lab.id);
    if (!order) continue;
    await upsertOrder(order);
    saved.push(order);
  }

  for (const img of state.imagingOrders || []) {
    if (img.status === 'suggested') continue;
    const order = buildImagingOrderData(orgId, deptId, unitId, encounterId, state, img.id);
    if (!order) continue;
    await upsertOrder(order);
    saved.push(order);
  }

  for (const rx of state.prescriptionOrders || []) {
    if (rx.status === 'suggested') continue;
    const order = buildRxOrderData(orgId, deptId, unitId, encounterId, state, rx.id);
    if (!order) continue;
    await upsertOrder(order);
    saved.push(order);
  }

  return saved;
}