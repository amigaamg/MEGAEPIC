'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, X, Loader2, Activity, Stethoscope, TestTube2, Database, ShieldCheck } from 'lucide-react'
import { C } from '@/lib/colors'
import { getActiveOrganizationId } from '@/lib/firebase/orgContext'
import { listenAllOrders } from '@/lib/firebase/orderService'
import type { OrderData } from '@/lib/firebase/orderService'
import {
  OrderType, OrderCategory, OrderPriority, createOrder, submitOrder, getOrderSummary,
} from '@/lib/amexan/hmis/orders-engine'
import { createOrderDoc } from '@/lib/firebase/orderService'

const CATEGORY_LABELS: Record<string, string> = {
  laboratory: 'Laboratory', imaging: 'Radiology', medication: 'Medication',
  procedure: 'Procedure', blood_bank: 'Blood Bank', referral: 'Referral',
  consult: 'Consult', therapy: 'Therapy', nursing: 'Nursing',
  dietetics: 'Dietetics', other: 'Other',
}

const TYPE_SHORT: Record<string, string> = {
  lab_hematology: 'CBC / Hematology',
  lab_biochemistry: 'Biochemistry',
  lab_microbiology: 'Microbiology',
  lab_immunology: 'Immunology',
  lab_pathology: 'Pathology',
  imaging_xray: 'X-Ray',
  imaging_ct: 'CT Scan',
  imaging_mri: 'MRI',
  imaging_ultrasound: 'Ultrasound',
  imaging_fluoroscopy: 'Fluoroscopy',
  imaging_mammography: 'Mammography',
  imaging_nuclear: 'Nuclear Med',
  imaging_other: 'Imaging',
  medication: 'Medication',
  procedure: 'Procedure',
  surgery: 'Surgery',
  blood_product: 'Blood Product',
  referral: 'Referral',
  consultation: 'Consultation',
  physiotherapy: 'Physiotherapy',
  nutrition: 'Nutrition',
  vaccination: 'Vaccination',
  other: 'Other',
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  draft: { bg: '#94A3B815', fg: '#94A3B8' },
  ordered: { bg: '#F59E0B15', fg: '#F59E0B' },
  acknowledged: { bg: '#8B5CF615', fg: '#8B5CF6' },
  in_progress: { bg: '#C026D315', fg: '#C026D3' },
  completed: { bg: '#10B98115', fg: '#10B981' },
  verified: { bg: '#05966915', fg: '#059669' },
  cancelled: { bg: '#EF444415', fg: '#EF4444' },
  discontinued: { bg: '#EF444415', fg: '#EF4444' },
  on_hold: { bg: '#F59E0B15', fg: '#F59E0B' },
  pending_approval: { bg: '#F59E0B15', fg: '#F59E0B' },
}

function categoryForType(t: string): any {
  if (t.startsWith('lab_')) return 'laboratory'
  if (t.startsWith('imaging_')) return 'imaging'
  if (t === OrderType.Medication) return 'medication'
  if (t === OrderType.Procedure || t === OrderType.Surgery) return 'procedure'
  if (t === OrderType.BloodProduct) return 'blood_bank'
  if (t === OrderType.Referral) return 'referral'
  if (t === OrderType.Consultation) return 'consult'
  if (t === OrderType.Physiotherapy) return 'therapy'
  if (t === OrderType.Nutrition) return 'dietetics'
  return 'other'
}

function orderDescription(o: OrderData): string {
  const m = (o.metadata || {}) as any
  return (m.testName || m.studyName || m.drugName || TYPE_SHORT[o.orderType] || o.orderType) as string
}

function orderDetail(o: OrderData): string {
  const m = (o.metadata || {}) as any
  const bits: string[] = []
  if (m.dose) bits.push(`${m.dose}${m.doseUnit || ''}`)
  if (m.route) bits.push(m.route)
  if (m.frequency) bits.push(m.frequency)
  if (m.modality && m.bodyRegion) bits.push(`${m.modality} ${m.bodyRegion}`)
  if (o.fulfillment?.sampleType) bits.push(o.fulfillment.sampleType)
  if (o.result?.value) bits.push(`result: ${o.result.value}`)
  return bits.join(' · ')
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--surface-border)',
  background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}

const ghostBtn: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8, border: '1px solid var(--surface-border)',
  background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: 0.4 }}>{children}</div>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    const orgId = getActiveOrganizationId() || undefined
    const unsub = listenAllOrders(orgId,
      (data) => { setOrders(data); setLoading(false) },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  const summary = getOrderSummary(orders)

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.orderCategory !== filter) return false
    if (search) {
      const hay = `${o.id} ${o.patientId} ${o.clinicalIndication} ${o.orderType} ${orderDescription(o)}`.toLowerCase()
      if (!hay.includes(search.toLowerCase())) return false
    }
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 56, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Database size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Universal Orders</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>One order engine · every clinical service</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowCreate(true)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> New Order
        </button>
      </div>

      <div style={{ padding: 24, maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total', value: summary.total, color: '#94A3B8' },
            { label: 'Pending', value: summary.pending, color: '#F59E0B' },
            { label: 'In Progress', value: orders.filter(o => o.status === 'in_progress').length, color: '#C026D3' },
            { label: 'Completed', value: summary.completed, color: '#10B981' },
            { label: 'Critical Results', value: summary.criticalResultsPending, color: '#EF4444' },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {summary.criticalResultsPending > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#EF444410', border: '1px solid #EF444430', color: '#EF4444', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
            <ShieldCheck size={14} /> {summary.criticalResultsPending} critical {summary.criticalResultsPending === 1 ? 'result' : 'results'} pending clinician review
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          </div>
          {[['all', 'All'], ['laboratory', 'Lab'], ['imaging', 'Radiology'], ['medication', 'Medication'], ['procedure', 'Procedure'], ['referral', 'Referral'], ['consult', 'Consult']].map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--surface-border)', background: filter === k ? C.sky : 'var(--surface)', color: filter === k ? C.white : 'var(--text-secondary)', fontSize: 11, fontWeight: filter === k ? 600 : 400, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Loader2 size={14} /> Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No orders found. Orders created inside an Encounter appear here automatically.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(o => {
              const st = STATUS_STYLES[o.status] || STATUS_STYLES.draft
              return (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 10, border: '1px solid var(--surface-border)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: C.sky + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {o.orderCategory === 'laboratory' ? <TestTube2 size={16} color={C.sky} />
                      : o.orderCategory === 'imaging' ? <Activity size={16} color={C.sky} />
                        : <Stethoscope size={16} color={C.sky} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {orderDescription(o)}
                      {o.result?.isCritical && <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', background: '#EF444415', padding: '2px 6px', borderRadius: 4 }}>CRITICAL</span>}
                      {o.isStat && <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', background: '#EF444415', padding: '2px 6px', borderRadius: 4 }}>STAT</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {CATEGORY_LABELS[o.orderCategory] || o.orderCategory} · {o.clinicalIndication || '—'}{orderDetail(o) ? ` · ${orderDetail(o)}` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{o.encounterId && o.encounterId !== 'manual' ? `${o.encounterId.slice(0, 8)}…` : `PT ${o.patientId}`}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                  <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: st.bg, color: st.fg, flexShrink: 0, textTransform: 'capitalize' }}>{o.status.replace(/_/g, ' ')}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showCreate && <CreateOrderModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

const TYPE_OPTIONS: Record<string, [string, string][]> = {
  laboratory: [
    [OrderType.LabHematology, 'Full Blood Count / Hematology'],
    [OrderType.LabBiochemistry, 'Biochemistry (U&E / LFT)'],
    [OrderType.LabMicrobiology, 'Microbiology (culture / sensitivity)'],
    [OrderType.LabImmunology, 'Immunology'],
    [OrderType.LabPathology, 'Pathology / Histology'],
  ],
  imaging: [
    [OrderType.ImagingXRay, 'X-Ray'],
    [OrderType.ImagingCT, 'CT Scan'],
    [OrderType.ImagingMRI, 'MRI'],
    [OrderType.ImagingUltrasound, 'Ultrasound'],
    [OrderType.ImagingFluoroscopy, 'Fluoroscopy'],
    [OrderType.ImagingMammography, 'Mammography'],
  ],
  medication: [[OrderType.Medication, 'Medication']],
  procedure: [[OrderType.Procedure, 'Procedure'], [OrderType.Surgery, 'Surgery']],
  referral: [[OrderType.Referral, 'Referral'], [OrderType.Consultation, 'Consultation']],
  other: [
    [OrderType.Physiotherapy, 'Physiotherapy'],
    [OrderType.Nutrition, 'Nutrition'],
    [OrderType.Vaccination, 'Vaccination'],
    [OrderType.Other, 'Other'],
  ],
}

function CreateOrderModal({ onClose }: { onClose: () => void }) {
  const [categoryKey, setCategoryKey] = useState<string>('laboratory')
  const [typeValue, setTypeValue] = useState<string>(OrderType.LabHematology)
  const [patientId, setPatientId] = useState('')
  const [encounterId, setEncounterId] = useState('')
  const [indication, setIndication] = useState('')
  const [priority, setPriority] = useState<string>(OrderPriority.Routine)
  const [saving, setSaving] = useState(false)

  const selectCategory = (key: string) => {
    setCategoryKey(key)
    const opts = TYPE_OPTIONS[key]
    if (opts) setTypeValue(opts[0][0])
  }

  const save = async () => {
    if (!patientId.trim() || !indication.trim()) return
    setSaving(true)
    try {
      const order = createOrder({
        orderType: typeValue as OrderType,
        orderCategory: categoryForType(typeValue),
        patientId: patientId.trim(),
        encounterId: encounterId.trim() || 'manual',
        requesterId: 'system',
        requesterName: 'Clinician',
        requesterDepartment: 'OUTPATIENT',
        responsibleDepartmentId: 'OUTPATIENT',
        responsibleDepartmentName: 'Outpatient',
        clinicalIndication: indication.trim(),
        priority: priority as OrderPriority,
      })
      const submitted = submitOrder(order)
      await createOrderDoc({
        ...submitted,
        orgId: getActiveOrganizationId() || 'telemed-a98cf',
        departmentId: 'OUTPATIENT',
        unitId: 'general',
      } as any)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: 480, maxHeight: '86vh', overflow: 'auto', background: 'var(--surface-card)', borderRadius: 14, padding: 20, border: '1px solid var(--surface-border)', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>New Universal Order</span>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {[['laboratory', 'Laboratory'], ['imaging', 'Imaging'], ['medication', 'Medication'], ['procedure', 'Procedure'], ['referral', 'Referral'], ['other', 'Other']].map(([k, c]) => (
            <button key={k} onClick={() => selectCategory(k)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--surface-border)', background: categoryKey === k ? C.sky : 'var(--surface)', color: categoryKey === k ? C.white : 'var(--text-secondary)', fontSize: 11, fontWeight: categoryKey === k ? 600 : 400, cursor: 'pointer' }}>{c}</button>
          ))}
        </div>

        <Label>Type</Label>
        <select value={typeValue} onChange={e => setTypeValue(e.target.value)} style={inputStyle}>
          {(TYPE_OPTIONS[categoryKey] || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        <Label>Patient</Label>
        <input value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="Hospital number / patient ID" style={inputStyle} />

        <Label>Encounter (optional)</Label>
        <input value={encounterId} onChange={e => setEncounterId(e.target.value)} placeholder="enc_..." style={inputStyle} />

        <Label>Clinical indication</Label>
        <textarea value={indication} onChange={e => setIndication(e.target.value)} rows={2} placeholder="Why is this being ordered?" style={{ ...inputStyle, resize: 'vertical' }} />

        <Label>Priority</Label>
        <div style={{ display: 'flex', gap: 6 }}>
          {([OrderPriority.Routine, OrderPriority.Urgent, OrderPriority.STAT]).map(p => (
            <button key={p} onClick={() => setPriority(p)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--surface-border)', background: priority === p ? C.sky : 'var(--surface)', color: priority === p ? C.white : 'var(--text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}>{p}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
          <button onClick={save} disabled={saving || !patientId.trim() || !indication.trim()} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>{saving ? <Loader2 size={14} /> : <Plus size={14} />} Submit Order</button>
        </div>
      </div>
    </div>
  )
}