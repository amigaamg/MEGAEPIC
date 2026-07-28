// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book VII: Universal Orders Engine
// Everything ordered is an Order Object — lab, imaging, medication, procedure, referral, consult.
// All identical lifecycle.
// ═══════════════════════════════════════════════════════════════════════════════

export interface Order {
  id: string;
  orderType: OrderType;
  orderCategory: OrderCategory;
  status: OrderStatus;
  priority: OrderPriority;
  patientId: string;
  encounterId: string;
  requesterId: string;
  requesterName: string;
  requesterDepartment: string;
  responsibleDepartmentId: string;
  responsibleDepartmentName: string;
  clinicalIndication: string;
  diagnosis?: string;
  isStat: boolean;
  timing: OrderTiming;
  fulfillment: OrderFulfillment;
  result?: OrderResult;
  cancellation?: OrderCancellation;
  billing: OrderBilling;
  audit: OrderAuditEntry[];
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export enum OrderType {
  LabHematology = 'lab_hematology',
  LabBiochemistry = 'lab_biochemistry',
  LabMicrobiology = 'lab_microbiology',
  LabImmunology = 'lab_immunology',
  LabPathology = 'lab_pathology',
  LabGenetics = 'lab_genetics',
  LabOther = 'lab_other',
  ImagingXRay = 'imaging_xray',
  ImagingCT = 'imaging_ct',
  ImagingMRI = 'imaging_mri',
  ImagingUltrasound = 'imaging_ultrasound',
  ImagingFluoroscopy = 'imaging_fluoroscopy',
  ImagingMammography = 'imaging_mammography',
  ImagingNuclear = 'imaging_nuclear',
  ImagingOther = 'imaging_other',
  Medication = 'medication',
  Procedure = 'procedure',
  Surgery = 'surgery',
  BloodProduct = 'blood_product',
  Referral = 'referral',
  Consultation = 'consultation',
  Physiotherapy = 'physiotherapy',
  Nutrition = 'nutrition',
  Counselling = 'counselling',
  Dialysis = 'dialysis',
  OxygenTherapy = 'oxygen_therapy',
  Ventilator = 'ventilator',
  Vaccination = 'vaccination',
  Other = 'other',
}

export enum OrderCategory {
  Laboratory = 'laboratory',
  Imaging = 'imaging',
  Medication = 'medication',
  Procedure = 'procedure',
  BloodBank = 'blood_bank',
  Referral = 'referral',
  Consult = 'consult',
  Therapy = 'therapy',
  Nursing = 'nursing',
  Dietetics = 'dietetics',
  Other = 'other',
}

export enum OrderStatus {
  Draft = 'draft',
  Ordered = 'ordered',
  Acknowledged = 'acknowledged',
  InProgress = 'in_progress',
  Completed = 'completed',
  Verified = 'verified',
  Cancelled = 'cancelled',
  Discontinued = 'discontinued',
  OnHold = 'on_hold',
  PendingApproval = 'pending_approval',
}

export enum OrderPriority {
  STAT = 'stat',
  Emergency = 'emergency',
  Urgent = 'urgent',
  Routine = 'routine',
  Timed = 'timed',
  PRN = 'prn',
  Standing = 'standing',
}

export interface OrderTiming {
  orderedAt: number;
  acknowledgedAt?: number;
  startedAt?: number;
  completedAt?: number;
  verifiedAt?: number;
  expectedCompletionAt?: number;
  frequency?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  totalOccurrences?: number;
  administeredCount?: number;
}

export interface OrderFulfillment {
  assignedTo?: string;
  assignedTeam?: string;
  location?: string;
  notes?: string;
  specialInstructions?: string;
  fastingRequired?: boolean;
  contrastRequired?: boolean;
  prepInstructions?: string;
  sampleType?: string;
  sampleSite?: string;
  sampleId?: string;
  collectedAt?: number;
  collectedBy?: string;
}

export interface OrderResult {
  value: string;
  unit?: string;
  referenceRange?: string;
  interpretation?: string;
  isAbnormal: boolean;
  isCritical: boolean;
  resultedAt?: number;
  resultedBy?: string;
  verifiedAt?: number;
  verifiedBy?: string;
  attachedReportUrl?: string;
  structuredData?: Record<string, unknown>;
}

export interface OrderCancellation {
  cancelledAt: number;
  cancelledBy: string;
  reason: string;
  authorizedBy?: string;
}

export interface OrderBilling {
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isBilled: boolean;
  billingStatus: 'pending' | 'billed' | 'waived' | 'insurance' | 'partial';
  insuranceClaimId?: string;
}

export interface OrderAuditEntry {
  at: number;
  by: string;
  action: string;
  details: string;
  previousStatus?: OrderStatus;
  newStatus?: OrderStatus;
}

export function createOrder(params: {
  orderType: OrderType;
  orderCategory: OrderCategory;
  patientId: string;
  encounterId: string;
  requesterId: string;
  requesterName: string;
  requesterDepartment: string;
  responsibleDepartmentId: string;
  responsibleDepartmentName: string;
  clinicalIndication: string;
  priority: OrderPriority;
  isStat?: boolean;
  diagnosis?: string;
}): Order {
  const now = Date.now();
  return {
    id: `ORD-${now.toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    orderType: params.orderType,
    orderCategory: params.orderCategory,
    status: OrderStatus.Draft,
    priority: params.priority,
    patientId: params.patientId,
    encounterId: params.encounterId,
    requesterId: params.requesterId,
    requesterName: params.requesterName,
    requesterDepartment: params.requesterDepartment,
    responsibleDepartmentId: params.responsibleDepartmentId,
    responsibleDepartmentName: params.responsibleDepartmentName,
    clinicalIndication: params.clinicalIndication,
    diagnosis: params.diagnosis,
    isStat: params.isStat || false,
    timing: { orderedAt: now, frequency: params.priority === OrderPriority.STAT ? 'once' : undefined },
    fulfillment: {},
    billing: { itemCode: '', itemName: '', quantity: 1, unitPrice: 0, totalPrice: 0, isBilled: false, billingStatus: 'pending' },
    audit: [{ at: now, by: params.requesterId, action: 'create', details: 'Order created' }],
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };
}

export function submitOrder(order: Order): Order {
  order.status = OrderStatus.Ordered;
  order.updatedAt = Date.now();
  order.audit.push({ at: Date.now(), by: order.requesterId, action: 'submit', details: 'Order submitted', previousStatus: OrderStatus.Draft, newStatus: OrderStatus.Ordered });
  return order;
}

export function acknowledgeOrder(order: Order, acknowledgedBy: string): Order {
  order.status = OrderStatus.Acknowledged;
  order.timing.acknowledgedAt = Date.now();
  order.updatedAt = Date.now();
  order.audit.push({ at: Date.now(), by: acknowledgedBy, action: 'acknowledge', details: 'Order acknowledged', previousStatus: OrderStatus.Ordered, newStatus: OrderStatus.Acknowledged });
  return order;
}

export function startOrder(order: Order, startedBy: string): Order {
  order.status = OrderStatus.InProgress;
  order.timing.startedAt = Date.now();
  order.fulfillment.assignedTo = startedBy;
  order.updatedAt = Date.now();
  order.audit.push({ at: Date.now(), by: startedBy, action: 'start', details: 'Order started', previousStatus: OrderStatus.Acknowledged, newStatus: OrderStatus.InProgress });
  return order;
}

export function completeOrder(order: Order, result?: OrderResult): Order {
  const now = Date.now();
  order.status = OrderStatus.Completed;
  order.timing.completedAt = now;
  if (result) order.result = result;
  order.updatedAt = now;
  order.audit.push({ at: now, by: order.fulfillment.assignedTo || 'system', action: 'complete', details: 'Order completed', previousStatus: OrderStatus.InProgress, newStatus: OrderStatus.Completed });
  return order;
}

export function verifyOrderResult(order: Order, verifiedBy: string): Order {
  order.status = OrderStatus.Verified;
  order.timing.verifiedAt = Date.now();
  if (order.result) {
    order.result.verifiedAt = Date.now();
    order.result.verifiedBy = verifiedBy;
  }
  order.updatedAt = Date.now();
  order.audit.push({ at: Date.now(), by: verifiedBy, action: 'verify', details: 'Result verified', previousStatus: OrderStatus.Completed, newStatus: OrderStatus.Verified });
  return order;
}

export function cancelOrder(order: Order, cancelledBy: string, reason: string, authorizedBy?: string): Order {
  order.status = OrderStatus.Cancelled;
  order.cancellation = { cancelledAt: Date.now(), cancelledBy, reason, authorizedBy };
  order.updatedAt = Date.now();
  order.audit.push({ at: Date.now(), by: cancelledBy, action: 'cancel', details: reason, previousStatus: order.status, newStatus: OrderStatus.Cancelled });
  return order;
}

export function getOrdersByPatient(orders: Order[], patientId: string): Order[] {
  return orders.filter(o => o.patientId === patientId);
}

export function getOrdersByDepartment(orders: Order[], departmentId: string): Order[] {
  return orders.filter(o => o.responsibleDepartmentId === departmentId);
}

export function getPendingOrders(orders: Order[]): Order[] {
  return orders.filter(o => [OrderStatus.Ordered, OrderStatus.Acknowledged, OrderStatus.Draft].includes(o.status));
}

export function getStatOrders(orders: Order[]): Order[] {
  return orders.filter(o => o.isStat || o.priority === OrderPriority.STAT);
}

export function getCriticalResults(orders: Order[]): Order[] {
  return orders.filter(o => o.result?.isCritical && o.status !== OrderStatus.Verified);
}

export function getOrderSummary(orders: Order[]): {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  criticalResultsPending: number;
  byCategory: Record<string, number>;
  byDepartment: Record<string, number>;
  byPriority: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  for (const o of orders) {
    byCategory[o.orderCategory] = (byCategory[o.orderCategory] || 0) + 1;
    byDepartment[o.responsibleDepartmentId] = (byDepartment[o.responsibleDepartmentId] || 0) + 1;
    byPriority[o.priority] = (byPriority[o.priority] || 0) + 1;
  }
  return {
    total: orders.length,
    pending: getPendingOrders(orders).length,
    completed: orders.filter(o => o.status === OrderStatus.Completed || o.status === OrderStatus.Verified).length,
    cancelled: orders.filter(o => o.status === OrderStatus.Cancelled).length,
    criticalResultsPending: getCriticalResults(orders).length,
    byCategory, byDepartment, byPriority,
  };
}
