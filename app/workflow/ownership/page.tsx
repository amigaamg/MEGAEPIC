'use client'

import { useState, useMemo } from 'react'
import { C } from '@/lib/colors'
import {
  Activity, User, Users, ArrowRight, CheckCircle, XCircle,
  Clock, AlertTriangle, Search, RefreshCw, MessageSquare,
  ChevronRight, FileText, Shield, type LucideIcon,
} from 'lucide-react'
import type { OwnershipTransfer, OwnershipEntry } from '@/lib/amexan/clinical-constitution/types'

const FIRST_NAMES = ['James', 'Grace', 'Peter', 'Ann', 'John', 'Mary', 'David', 'Sarah', 'Michael', 'Esther']
const LAST_NAMES = ['Mwangi', 'Kamau', 'Ochieng', 'Wanjiku', 'Kiprop', 'Nyambura', 'Odhiambo', 'Chebet']
const DEPARTMENTS = ['Emergency', 'Medicine', 'Surgery', 'ICU', 'Pediatrics', 'OB/GYN', 'Orthopedics', 'Cardiology']
const CLINICIANS = [
  { id: 'doc_1', name: 'Dr. James Mwangi', role: 'Consultant Surgeon', dept: 'Surgery' },
  { id: 'doc_2', name: 'Dr. Grace Kamau', role: 'Medical Officer', dept: 'Medicine' },
  { id: 'doc_3', name: 'Dr. Peter Ochieng', role: 'Registrar', dept: 'Emergency' },
  { id: 'doc_4', name: 'Dr. Ann Wanjiku', role: 'Consultant Physician', dept: 'Medicine' },
  { id: 'doc_5', name: 'Dr. John Kiprop', role: 'ICU Specialist', dept: 'ICU' },
  { id: 'doc_6', name: 'Dr. Mary Nyambura', role: 'Pediatrician', dept: 'Pediatrics' },
  { id: 'doc_7', name: 'Dr. David Odhiambo', role: 'Registrar', dept: 'Surgery' },
  { id: 'doc_8', name: 'Dr. Sarah Chebet', role: 'OB/GYN Consultant', dept: 'OB/GYN' },
  { id: 'nurse_1', name: 'Nurse Esther Kimani', role: 'Charge Nurse', dept: 'Medicine' },
]

function generateTransfers(): OwnershipTransfer[] {
  return Array.from({ length: 14 }, (_, i) => {
    const fromIdx = Math.floor(Math.random() * CLINICIANS.length)
    let toIdx = Math.floor(Math.random() * CLINICIANS.length)
    while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * CLINICIANS.length)
    const transferTypes: OwnershipTransfer['transferType'][] = ['handover', 'referral', 'discharge', 'admission', 'escalation']
    const type = transferTypes[Math.floor(Math.random() * transferTypes.length)]
    const accepted = Math.random() > 0.6
    const transferredAt = Date.now() - Math.floor(Math.random() * 360 * 60000)

    return {
      fromOwner: CLINICIANS[fromIdx].id,
      fromName: CLINICIANS[fromIdx].name,
      toOwner: CLINICIANS[toIdx].id,
      toName: CLINICIANS[toIdx].name,
      transferType: type,
      checklistCompleted: accepted ? true : Math.random() > 0.5,
      accepted,
      acceptedAt: accepted ? transferredAt + Math.floor(Math.random() * 60 * 60000) : undefined,
      transferredAt,
      notes: type === 'referral' ? 'Patient requires specialist review for ongoing management' :
             type === 'handover' ? 'End of shift handover — all pending items documented' :
             type === 'escalation' ? 'Deteriorating clinical status requiring higher level of care' :
             type === 'admission' ? 'Admission from emergency department' :
             'Planned discharge with follow-up arranged',
    }
  })
}

const TRANSFER_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  handover: { label: 'Handover', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  referral: { label: 'Referral', color: C.sky, bg: 'rgba(47,128,237,0.1)' },
  discharge: { label: 'Discharge', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  admission: { label: 'Admission', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  escalation: { label: 'Escalation', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
}

export default function WorkflowOwnershipPage() {
  const [transfers, setTransfers] = useState(generateTransfers)
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransfer, setSelectedTransfer] = useState<OwnershipTransfer | null>(null)

  function handleAccept(transfer: OwnershipTransfer) {
    setTransfers(prev => prev.map(t =>
      t.fromOwner === transfer.fromOwner && t.transferredAt === transfer.transferredAt
        ? { ...t, accepted: true, acceptedAt: Date.now() }
        : t
    ))
  }

  const filteredTransfers = useMemo(() => {
    let result = transfers
    if (activeTab === 'pending') {
      result = result.filter(t => !t.accepted)
    } else {
      result = result.filter(t => t.accepted)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.fromName.toLowerCase().includes(q) ||
        t.toName.toLowerCase().includes(q) ||
        t.transferType.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => b.transferredAt - a.transferredAt)
  }, [transfers, activeTab, searchQuery])

  const pendingCount = transfers.filter(t => !t.accepted).length
  const completedCount = transfers.filter(t => t.accepted).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      {/* Top bar */}
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Shield size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Ownership Transfers</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search clinicians..."
            style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
        <button onClick={() => setTransfers(generateTransfers())}
          style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 24px 0', display: 'flex', gap: 8, borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-card)' }}>
        <TabButton label="Pending Acceptance" count={pendingCount} active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} />
        <TabButton label="Completed" count={completedCount} active={activeTab === 'completed'} onClick={() => setActiveTab('completed')} />
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
        {/* Transfer list */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {filteredTransfers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <ArrowRight size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>
                {activeTab === 'pending' ? 'No pending ownership transfers' : 'No completed transfers'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredTransfers.map((transfer, idx) => (
                <div key={`${transfer.fromOwner}_${transfer.transferredAt}_${idx}`}
                  onClick={() => setSelectedTransfer(transfer)}
                  style={{
                    background: 'var(--surface-card)', borderRadius: 10,
                    border: `1px solid ${!transfer.accepted ? 'var(--surface-border)' : 'var(--surface-border)'}`,
                    padding: '14px 16px', cursor: 'pointer',
                    borderLeft: `3px solid ${TRANSFER_LABELS[transfer.transferType]?.color || 'var(--primary)'}`,
                    transition: 'box-shadow 0.15s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    {/* From → To */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sky-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>
                          {transfer.fromName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{transfer.fromName}</span>
                        </div>
                      </div>
                      <ArrowRight size={16} color="var(--text-muted)" />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: !transfer.accepted ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: !transfer.accepted ? '#F59E0B' : '#10B981' }}>
                          {transfer.toName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{transfer.toName}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: TRANSFER_LABELS[transfer.transferType]?.bg || 'var(--surface-elevated)',
                        color: TRANSFER_LABELS[transfer.transferType]?.color || 'var(--text-muted)',
                      }}>
                        {TRANSFER_LABELS[transfer.transferType]?.label || transfer.transferType}
                      </span>
                      {transfer.accepted ? (
                        <span style={{ color: '#10B981', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <CheckCircle size={13} /> Accepted
                        </span>
                      ) : (
                        <span style={{ color: '#F59E0B', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={13} /> Pending
                        </span>
                      )}
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>{formatDate(transfer.transferredAt)}</span>
                    {transfer.notes && <span>— {transfer.notes.slice(0, 60)}{transfer.notes.length > 60 ? '...' : ''}</span>}
                    {!transfer.checklistCompleted && !transfer.accepted && (
                      <span style={{ color: '#EF4444', fontWeight: 600 }}>Checklist incomplete</span>
                    )}
                  </div>

                  {/* Accept button for pending */}
                  {!transfer.accepted && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                      <button onClick={(e) => { e.stopPropagation(); handleAccept(transfer); }}
                        style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#10B981', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)' }}>
                        <CheckCircle size={13} /> Accept Transfer
                      </button>
                      <button onClick={(e) => e.stopPropagation()}
                        style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                        Message
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedTransfer && (
          <div style={{ width: 360, background: 'var(--surface-card)', borderLeft: '1px solid var(--surface-border)', padding: 20, overflow: 'auto', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Transfer Details</span>
              <button onClick={() => setSelectedTransfer(null)}
                style={{ padding: 4, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <XCircle size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DetailRow icon={ArrowRight} label="Type" value={TRANSFER_LABELS[selectedTransfer.transferType]?.label || selectedTransfer.transferType} valueColor={TRANSFER_LABELS[selectedTransfer.transferType]?.color} />
              <DetailRow icon={User} label="From" value={selectedTransfer.fromName} />
              <DetailRow icon={User} label="To" value={selectedTransfer.toName} />
              <DetailRow icon={Clock} label="Transferred" value={formatDate(selectedTransfer.transferredAt)} />
              {selectedTransfer.acceptedAt && (
                <DetailRow icon={CheckCircle} label="Accepted" value={formatDate(selectedTransfer.acceptedAt)} valueColor="#10B981" />
              )}
              <DetailRow icon={FileText} label="Notes" value={selectedTransfer.notes || 'No notes'} />

              <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Handover Checklist</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'Clinical Summary', done: true },
                    { label: 'Pending Results', done: Math.random() > 0.3 },
                    { label: 'Medication List', done: true },
                    { label: 'Outstanding Tasks', done: selectedTransfer.checklistCompleted },
                    { label: 'Resuscitation Status', done: Math.random() > 0.2 },
                    { label: 'Follow-up Plan', done: selectedTransfer.checklistCompleted },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: item.done ? '#10B981' : '#EF4444' }}>
                      {item.done ? <CheckCircle size={13} /> : <XCircle size={13} />}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!selectedTransfer.accepted && (
                <button onClick={() => handleAccept(selectedTransfer)}
                  style={{ width: '100%', height: 40, borderRadius: 8, border: 'none', background: '#10B981', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font-sans)', marginTop: 8 }}>
                  <CheckCircle size={16} /> Accept & Confirm Transfer
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{
        padding: '10px 16px', border: 'none', borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
        background: 'transparent', color: active ? 'var(--primary)' : 'var(--text-muted)',
        fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)',
      }}>
      {label}
      <span style={{
        padding: '1px 7px', borderRadius: 8, fontSize: 10, fontWeight: 700,
        background: active ? 'var(--sky-50)' : 'var(--surface-elevated)',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
      }}>{count}</span>
    </button>
  )
}

function DetailRow({ icon: Icon, label, value, valueColor }: { icon: LucideIcon; label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 2 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: valueColor || 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={14} color={valueColor || 'var(--text-muted)'} />
        {value}
      </span>
    </div>
  )
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
