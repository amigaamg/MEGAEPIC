// ─────────────────────────────────────────────────────────────
// AMEXAN Universal Orders — Firestore data-access layer.
// Mirrors lib/firebase/encounterService.ts conventions.
// Orders live under the encounter tree:
//   organizations/{org}/departments/{dept}/units/{unit}/encounters/{encounterId}/orders/{orderId}
// A mirror index doc is written to patients/{patientId}/orders for patient-centric queries.
// ─────────────────────────────────────────────────────────────
import {
  doc, setDoc, deleteDoc, getDoc, query, orderBy, limit,
  onSnapshot, Unsubscribe, collection, collectionGroup, where,
} from 'firebase/firestore';
import { orderRef, ordersCol, patientOrdersCol } from './collections';
import type { Order } from '@/lib/amexan/hmis/orders-engine';
import { db } from '@/lib/firebase';

const DEFAULT_ORG_ID = 'telemed-a98cf';

function resolveOrgId(orgId?: string): string {
  return orgId || DEFAULT_ORG_ID;
}

export interface OrderData extends Order {
  orgId: string;
  departmentId: string;
  unitId: string;
}

export async function createOrderDoc(
  data: OrderData,
  explicitId?: string,
): Promise<string> {
  const oid = resolveOrgId(data.orgId);
  const ref = explicitId
    ? doc(ordersCol(oid, data.departmentId, data.unitId, data.encounterId), explicitId)
    : doc(ordersCol(oid, data.departmentId, data.unitId, data.encounterId));
  const record = { ...data, id: ref.id, orgId: oid, createdAt: data.createdAt, updatedAt: data.updatedAt };
  await setDoc(ref, record);
  await setDoc(doc(patientOrdersCol(oid, data.patientId), ref.id), {
    orderId: ref.id, encounterId: data.encounterId, orderType: data.orderType,
    orderCategory: data.orderCategory, status: data.status, priority: data.priority,
    createdAt: data.createdAt, updatedAt: data.updatedAt,
  });
  return ref.id;
}

export async function getOrder(
  deptId: string, unitId: string, encounterId: string, orderId: string,
  orgId?: string,
): Promise<OrderData | null> {
  const snap = await getDoc(orderRef(resolveOrgId(orgId), deptId, unitId, encounterId, orderId));
  return snap.exists() ? snap.data() as OrderData : null;
}

export async function updateOrder(
  order: OrderData,
  updates: Partial<OrderData>,
): Promise<void> {
  const merged = { ...order, ...updates, id: order.id, updatedAt: Date.now() };
  await setDoc(orderRef(resolveOrgId(order.orgId), order.departmentId, order.unitId, order.encounterId, order.id), merged, { merge: true });
  await setDoc(doc(patientOrdersCol(resolveOrgId(order.orgId), order.patientId), order.id),
    { status: merged.status, orderType: merged.orderType, orderCategory: merged.orderCategory, updatedAt: merged.updatedAt }, { merge: true });
}

export async function deleteOrder(order: OrderData): Promise<void> {
  await deleteDoc(orderRef(resolveOrgId(order.orgId), order.departmentId, order.unitId, order.encounterId, order.id));
}

export async function deleteOrderByPath(
  deptId: string, unitId: string, encounterId: string, orderId: string, orgId?: string,
): Promise<void> {
  await deleteDoc(orderRef(resolveOrgId(orgId), deptId, unitId, encounterId, orderId));
}

export function listenOrdersByEncounter(
  deptId: string, unitId: string, encounterId: string,
  onData: (orders: OrderData[]) => void,
  onError?: (err: Error) => void,
  orgId?: string,
): Unsubscribe {
  const q = query(
    // collectionGroup fallback by encounterId is heavy; scoped query is index-friendly
    collection(db, 'organizations', resolveOrgId(orgId), 'departments', deptId, 'units', unitId, 'encounters', encounterId, 'orders'),
  );
  return onSnapshot(q,
    (snap) => onData(snap.docs.map(d => d.data() as OrderData).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))),
    (err) => onError?.(err),
  );
}

export function listenOrdersByPatient(
  patientId: string,
  onData: (orders: OrderData[]) => void,
  onError?: (err: Error) => void,
  orgId?: string,
): Unsubscribe {
  const q = query(
    patientOrdersCol(resolveOrgId(orgId), patientId),
    orderBy('createdAt', 'desc'),
    limit(200),
  );
  return onSnapshot(q,
    (snap) => {
      // Full doc ids available in subcollection; return lightweight rows,
      // the board hydrates details on demand.
      onData(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id, orgId: resolveOrgId(orgId), departmentId: '', unitId: '',
          encounterId: data.encounterId || '', patientId,
          orderType: data.orderType, orderCategory: data.orderCategory, status: data.status,
          priority: data.priority, requesterId: '', requesterName: '', requesterDepartment: '',
          responsibleDepartmentId: '', responsibleDepartmentName: '', clinicalIndication: '',
          isStat: false, timing: { orderedAt: data.createdAt || 0 }, fulfillment: {},
          billing: { itemCode: '', itemName: '', quantity: 1, unitPrice: 0, totalPrice: 0, isBilled: false, billingStatus: 'pending' },
          audit: [], metadata: {}, createdAt: data.createdAt || 0, updatedAt: data.updatedAt || 0,
        } as OrderData;
      }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    },
  );
}

/** Org-wide Universal Orders via collection-group. Requires a composite index at scale; fine for small orgs. */
export function listenAllOrders(
  orgId: string | undefined,
  onData: (orders: OrderData[]) => void,
  onError?: (err: Error) => void,
  limitCount = 200,
): Unsubscribe {
  const q = query(
    collectionGroup(db, 'orders'),
    where('orgId', '==', resolveOrgId(orgId)),
    limit(limitCount),
  );
  return onSnapshot(q,
    (snap) => onData(snap.docs.map(d => d.data() as OrderData).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))),
    (err) => onError?.(err),
  );
}