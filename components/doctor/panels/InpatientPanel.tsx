'use client';

import React, { useState } from 'react';

interface Ward {
  id: string; name: string; type: string; totalBeds: number; occupiedBeds: number;
  patients: InpatientPatient[];
}

interface InpatientPatient {
  id: string; name: string; age?: number; gender?: string; condition: string;
  admissionDate: string; doctorId: string; bedNumber: string; status: 'stable' | 'guarded' | 'critical' | 'discharging';
  diagnosis: string; notes?: string;
}

interface Props {
  wards: Ward[];
  doctorId: string;
  onAdmit: (data: { patientId: string; wardId: string; diagnosis: string; condition: string }) => void;
  onDischarge: (patientId: string) => void;
  onTransfer: (patientId: string, targetWardId: string) => void;
  onUpdateNotes: (patientId: string, notes: string) => void;
}

const WARD_TYPES = ['General Ward', 'Maternity', 'Pediatrics', 'ICU', 'HDU', 'NICU', 'Psychiatry', 'Isolation'];
const STATUS_COLORS = {
  stable: { color: '#10b981', bg: 'rgba(16,185,129,.15)' },
  guarded: { color: '#f59e0b', bg: 'rgba(245,158,11,.15)' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,.15)' },
  discharging: { color: '#6366f1', bg: 'rgba(99,102,241,.15)' },
};

const CONDITION_ICONS: Record<string, string> = {
  'Hypertension': '❤️', 'Diabetes': '🍬', 'Pneumonia': '🫁', 'Stroke': '🧠',
  'CKD': '🫘', 'Cancer': '🎗️', 'Trauma': '🩹', 'Sepsis': '🦠',
  'Surgery': '🔪', 'Maternity': '🤰', 'Pediatric': '👶',
};

export default function InpatientPanel({ wards, doctorId, onAdmit, onDischarge, onTransfer, onUpdateNotes }: Props) {
  const [selectedWard, setSelectedWard] = useState<string>(wards[0]?.id || '');
  const [showAdmit, setShowAdmit] = useState(false);
  const [admitData, setAdmitData] = useState({ patientId: '', diagnosis: '', condition: 'stable' });
  const [transferTarget, setTransferTarget] = useState('');
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const currentWard = wards.find(w => w.id === selectedWard);
  const occupancy = currentWard ? Math.round((currentWard.occupiedBeds / currentWard.totalBeds) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Ward Selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {wards.map(ward => {
          const occ = Math.round((ward.occupiedBeds / ward.totalBeds) * 100);
          const isSelected = ward.id === selectedWard;
          return (
            <div key={ward.id} className="ward-chip" onClick={() => setSelectedWard(ward.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '12px 18px', borderRadius: 12, cursor: 'pointer', minWidth: 110,
              background: isSelected ? 'var(--accent-dim)' : 'var(--bg)',
              border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all .15s',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>
                {ward.type}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--mono)', color: isSelected ? 'var(--accent)' : 'var(--text)' }}>
                {ward.occupiedBeds}<span style={{ fontSize: 16, color: 'var(--muted)' }}>/{ward.totalBeds}</span>
              </div>
              <div style={{
                width: '100%', height: 4, borderRadius: 4, background: 'var(--border)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ width: `${occ}%`, height: '100%', borderRadius: 4,
                  background: occ > 90 ? '#ef4444' : occ > 70 ? '#f59e0b' : '#10b981', transition: 'width .3s' }} />
              </div>
              <div style={{ fontSize: 9, color: occ > 90 ? '#ef4444' : occ > 70 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                {occ}% full
              </div>
            </div>
          );
        })}
      </div>

      {/* Patients List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            🏥 {currentWard?.name || 'Select Ward'} — {currentWard?.patients.length || 0} patients
          </div>
          <button className="btn-accent" onClick={() => setShowAdmit(true)} style={{ fontSize: 11, padding: '6px 12px' }}>
            ➕ Admit Patient
          </button>
        </div>

        {currentWard?.patients.length === 0 ? (
          <div className="empty-sm"><p>No patients in this ward.</p></div>
        ) : currentWard?.patients.map(patient => {
          const sc = STATUS_COLORS[patient.status];
          const isExpanded = expandedPatient === patient.id;
          const condIcon = Object.entries(CONDITION_ICONS).find(([k]) => patient.diagnosis.toLowerCase().includes(k.toLowerCase()))?.[1] || '🩺';
          return (
            <div key={patient.id} className="inpatient-card" style={{
              borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden',
              background: 'var(--bg)', transition: 'all .15s',
            }}>
              <div className="inpatient-header" onClick={() => setExpandedPatient(isExpanded ? null : patient.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}>
                <div style={{ fontSize: 28 }}>{condIcon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {patient.name}
                    <span className="status-pill" style={{ background: sc.bg, color: sc.color, fontSize: 9 }}>{patient.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    🛏️ Bed {patient.bedNumber} · {patient.diagnosis} · Admitted {patient.admissionDate}
                  </div>
                  {patient.age && <div style={{ fontSize: 10, color: 'var(--text-2)' }}>{patient.age}y · {patient.gender}</div>}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{isExpanded ? '▲' : '▼'}</div>
              </div>

              {isExpanded && (
                <div className="inpatient-detail" style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <button className="btn-secondary" onClick={() => {
                      const t = prompt('Transfer to ward:', 'General Ward');
                      if (t) onTransfer(patient.id, t);
                    }} style={{ fontSize: 10, padding: '5px 10px' }}>
                      🔄 Transfer
                    </button>
                    <button className="btn-secondary" onClick={() => onDischarge(patient.id)}
                      style={{ fontSize: 10, padding: '5px 10px', color: '#6366f1' }}>
                      ✅ Discharge
                    </button>
                  </div>

                  <textarea className="search-inp" value={noteInput} onChange={e => setNoteInput(e.target.value)}
                    placeholder="Add clinical note / update…"
                    style={{ width: '100%', minHeight: 60, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', resize: 'vertical', fontSize: 12 }} />
                  <button className="btn-accent" onClick={() => { if (noteInput) onUpdateNotes(patient.id, noteInput); setNoteInput(''); }}
                    style={{ fontSize: 11, padding: '6px 12px', marginTop: 6 }} disabled={!noteInput}>Save Note</button>

                  {patient.notes && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(99,102,241,.08)', borderRadius: 10, fontSize: 12 }}>
                      <span style={{ fontWeight: 700 }}>📝 Recent:</span> {patient.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAdmit && (
        <div className="admit-panel" style={{
          padding: 16, borderRadius: 14, border: '2px solid var(--accent-dim)', background: 'var(--surface)',
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🛏️ Admit Patient</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="search-inp" value={admitData.patientId} onChange={e => setAdmitData(d => ({ ...d, patientId: e.target.value }))}
              placeholder="Patient ID or search name *" />
            <select className="filter-chip" value={transferTarget || selectedWard} onChange={e => setTransferTarget(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
              <option value="">— Select Ward —</option>
              {wards.map(w => <option key={w.id} value={w.id}>{w.name} ({w.type}) — {w.totalBeds - w.occupiedBeds} beds free</option>)}
            </select>
            <input className="search-inp" value={admitData.diagnosis} onChange={e => setAdmitData(d => ({ ...d, diagnosis: e.target.value }))}
              placeholder="Primary diagnosis *" />
            <select className="filter-chip" value={admitData.condition} onChange={e => setAdmitData(d => ({ ...d, condition: e.target.value }))}
              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
              <option value="stable">🟢 Stable</option>
              <option value="guarded">🟡 Guarded</option>
              <option value="critical">🔴 Critical</option>
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" onClick={() => setShowAdmit(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-accent" onClick={() => {
                onAdmit({ ...admitData, wardId: transferTarget || selectedWard });
                setShowAdmit(false);
                setAdmitData({ patientId: '', diagnosis: '', condition: 'stable' });
              }} disabled={!admitData.patientId || !admitData.diagnosis} style={{ flex: 2 }}>
                ✅ Admit Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
