'use client';
import { useState, useMemo } from 'react';
import { OrderType, OrderCategory, OrderStatus, OrderPriority, createOrder, submitOrder, acknowledgeOrder, completeOrder, cancelOrder, getOrdersByPatient, getPendingOrders, getStatOrders, getCriticalResults, getOrderSummary } from '@/lib/amexan/hmis/orders-engine';
import type { Order } from '@/lib/amexan/hmis/orders-engine';

const PRIORITY_COLORS: Record<string, string> = { stat: '#EF4444', emergency: '#EF4444', urgent: '#F59E0B', routine: '#3B82F6', timed: '#8B5CF6', prn: '#64748B', standing: '#6B7280' };
const STATUS_COLORS: Record<string, string> = { draft: '#64748B', ordered: '#3B82F6', acknowledged: '#8B5CF6', in_progress: '#F59E0B', completed: '#10B981', verified: '#34D399', cancelled: '#6B7280', discontinued: '#DC2626', on_hold: '#F97316', pending_approval: '#EAB308' };
const CATEGORY_ICONS: Record<string, string> = { laboratory: '🔬', imaging: '📡', medication: '💊', procedure: '🏨', blood_bank: '🩸', referral: '📋', consult: '👥', therapy: '💪', nursing: '🩺', dietetics: '🥗', other: '📌' };

const MOCK_ORDERS: Order[] = [
  createOrder({ orderType: OrderType.LabHematology, orderCategory: OrderCategory.Laboratory, patientId: 'P-001', encounterId: 'ENC-001', requesterId: 'ACT-001', requesterName: 'Dr. Smith', requesterDepartment: 'DEPT-001', responsibleDepartmentId: 'DEPT-006', responsibleDepartmentName: 'Laboratory', clinicalIndication: 'Rule out infection', priority: OrderPriority.STAT, isStat: true }),
  createOrder({ orderType: OrderType.ImagingCT, orderCategory: OrderCategory.Imaging, patientId: 'P-001', encounterId: 'ENC-001', requesterId: 'ACT-001', requesterName: 'Dr. Smith', requesterDepartment: 'DEPT-001', responsibleDepartmentId: 'DEPT-007', responsibleDepartmentName: 'Radiology', clinicalIndication: 'Head trauma', priority: OrderPriority.Urgent, diagnosis: 'Subdural hematoma?' }),
  createOrder({ orderType: OrderType.Medication, orderCategory: OrderCategory.Medication, patientId: 'P-002', encounterId: 'ENC-002', requesterId: 'ACT-001', requesterName: 'Dr. Smith', requesterDepartment: 'DEPT-002', responsibleDepartmentId: 'DEPT-005', responsibleDepartmentName: 'Pharmacy', clinicalIndication: 'UTI', priority: OrderPriority.Routine, diagnosis: 'UTI' }),
  createOrder({ orderType: OrderType.Consultation, orderCategory: OrderCategory.Consult, patientId: 'P-003', encounterId: 'ENC-003', requesterId: 'ACT-002', requesterName: 'Dr. Jones', requesterDepartment: 'DEPT-003', responsibleDepartmentId: 'DEPT-008', responsibleDepartmentName: 'Cardiology', clinicalIndication: 'Chest pain evaluation', priority: OrderPriority.Urgent }),
  createOrder({ orderType: OrderType.Referral, orderCategory: OrderCategory.Referral, patientId: 'P-004', encounterId: 'ENC-004', requesterId: 'ACT-003', requesterName: 'Dr. Williams', requesterDepartment: 'DEPT-002', responsibleDepartmentId: 'DEPT-009', responsibleDepartmentName: 'Physiotherapy', clinicalIndication: 'Post-stroke rehabilitation', priority: OrderPriority.Routine }),
];

submitOrder(MOCK_ORDERS[0]);
submitOrder(MOCK_ORDERS[1]);
submitOrder(MOCK_ORDERS[2]);
submitOrder(MOCK_ORDERS[3]);
submitOrder(MOCK_ORDERS[4]);
acknowledgeOrder(MOCK_ORDERS[0], 'lab-tech-01');
completeOrder(MOCK_ORDERS[0], { value: 'Hb: 13.2, WBC: 11.5, PLT: 250', isAbnormal: true, isCritical: false, interpretation: 'Leukocytosis - likely infection' });

export default function OrdersPage() {
  const [orders] = useState(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<OrderCategory | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const summary = useMemo(() => getOrderSummary(orders), [orders]);
  const pendingOrders = useMemo(() => getPendingOrders(orders), [orders]);
  const statOrders = useMemo(() => getStatOrders(orders), [orders]);
  const criticalResults = useMemo(() => getCriticalResults(orders), [orders]);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && o.orderCategory !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.id.toLowerCase().includes(q) || o.clinicalIndication.toLowerCase().includes(q) || o.requesterName.toLowerCase().includes(q) || o.patientId.toLowerCase().includes(q);
      }
      return true;
    });
  }, [orders, search, statusFilter, categoryFilter]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Orders Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book VII — Lab, imaging, meds, procedures, referrals — unified lifecycle</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#3B82F6,#2563EB)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + New Order
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[{ label: 'Total Orders', value: summary.total, color: '#3B82F6' },
          { label: 'Pending', value: summary.pending, color: '#F59E0B' },
          { label: 'STAT', value: statOrders.length, color: '#EF4444' },
          { label: 'Completed', value: summary.completed, color: '#10B981' },
          { label: 'Critical', value: summary.criticalResultsPending, color: '#DC2626' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {criticalResults.length > 0 && (
        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626' }}>⚠ {criticalResults.length} Critical Result{criticalResults.length > 1 ? 's' : ''} Pending</div>
        </div>
      )}

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Status</option>
          {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as OrderCategory | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Categories</option>
          {Object.values(OrderCategory).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(order => {
          const isSelected = selectedOrder === order.id;
          return (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(isSelected ? null : order.id)}
              style={{
                padding: 14, borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(59,130,246,0.08)' : order.isStat ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(59,130,246,0.3)' : order.isStat ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[order.orderCategory] || '📌'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>
                      {order.id} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{order.orderType} · {order.responsibleDepartmentName}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{order.clinicalIndication} · Requester: {order.requesterName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  {order.isStat && <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 700 }}>STAT</span>}
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${PRIORITY_COLORS[order.priority]}20`, color: PRIORITY_COLORS[order.priority] }}>{order.priority}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status] }}>{order.status}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Patient: <span style={{ color: '#E2E8F0' }}>{order.patientId}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Encounter: <span style={{ color: '#E2E8F0' }}>{order.encounterId}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Dept: <span style={{ color: '#E2E8F0' }}>{order.requesterDepartment} → {order.responsibleDepartmentName}</span></div>
                    {order.diagnosis && <div style={{ fontSize: 11, color: '#64748B' }}>Dx: <span style={{ color: '#E2E8F0' }}>{order.diagnosis}</span></div>}
                  </div>
                  {order.result && (
                    <div style={{ padding: 10, borderRadius: 8, background: order.result.isCritical ? 'rgba(239,68,68,0.1)' : order.result.isAbnormal ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', marginBottom: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: order.result.isCritical ? '#EF4444' : order.result.isAbnormal ? '#F59E0B' : '#10B981', marginBottom: 4 }}>Result {order.result.isCritical ? '(Critical)' : order.result.isAbnormal ? '(Abnormal)' : '(Normal)'}</div>
                      <div style={{ fontSize: 12, color: '#E2E8F0' }}>{order.result.value}</div>
                      {order.result.interpretation && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{order.result.interpretation}</div>}
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', margin: '8px 0 6px' }}>Billing</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{order.billing.itemName || 'No billing info'} · {order.billing.billingStatus} · {order.billing.totalPrice} {order.billing.totalPrice > 0 ? 'KES' : ''}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', margin: '8px 0 6px' }}>Audit Trail</div>
                  {order.audit.slice(-3).map((a, i) => (
                    <div key={i} style={{ fontSize: 10, color: '#64748B', padding: '2px 0' }}>{a.action}: {a.details} ({new Date(a.at).toLocaleTimeString()})</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
