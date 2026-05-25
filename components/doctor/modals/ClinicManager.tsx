'use client';

import React, { useState, useCallback } from 'react';

interface ClinicData {
  id: string; name: string; specialty: string; location?: string;
  consultationFee?: number; followUpFee?: number;
  patientsPerSession?: number; slotDuration?: number;
  isActive: boolean; queueToday: number;
}

interface Props {
  clinics: ClinicData[];
  onSelectClinic: (clinic: ClinicData) => void;
  onCreateClinic: (data: Partial<ClinicData>) => Promise<ClinicData | null>;
  activeClinicId: string;
  onClose?: () => void;
  inline?: boolean;
}

const SPECIALTIES = [
  'General Practice', 'Cardiology', 'Neurology', 'Pediatrics', 'Obstetrics & Gynecology',
  'Orthopedics', 'Dermatology', 'Psychiatry', 'ENT', 'Ophthalmology',
  'Internal Medicine', 'Emergency Medicine', 'Surgery', 'Oncology', 'Nephrology',
];

export default function ClinicManager({ clinics, onSelectClinic, onCreateClinic, activeClinicId, onClose, inline }: Props) {
  const [tab, setTab] = useState<'overview' | 'create'>('overview');
  const [newClinic, setNewClinic] = useState({ name: '', specialty: '', location: '', consultationFee: 2000, followUpFee: 1000, patientsPerSession: 10, slotDuration: 30 });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreate = async () => {
    if (!newClinic.name || !newClinic.specialty) return;
    setCreating(true);
    try {
      const result = await onCreateClinic(newClinic);
      if (result) {
        setMessage(`✅ ${result.name} created successfully`);
        setTimeout(() => setMessage(''), 3000);
        setNewClinic({ name: '', specialty: '', location: '', consultationFee: 2000, followUpFee: 1000, patientsPerSession: 10, slotDuration: 30 });
        setTab('overview');
      }
    } finally { setCreating(false); }
  };

  const inpStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none',
  };

  const content = (
    <>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
        <button className={`filter-chip ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>📊 My Clinics</button>
        <button className={`filter-chip ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>➕ New Clinic</button>
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {clinics.length === 0 ? (
            <div className="empty-sm">
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏥</div>
              <p>No clinics yet. Create your first clinic.</p>
              <button className="btn-accent" onClick={() => setTab('create')} style={{ marginTop: 12 }}>➕ Create Clinic</button>
            </div>
          ) : clinics.map(clinic => {
            const isActive = clinic.id === activeClinicId;
            return (
              <div key={clinic.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px', borderRadius: 14,
                background: isActive ? 'var(--accent-dim)' : 'var(--bg)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all .15s',
              }} onClick={() => onSelectClinic(clinic)}>
                <div style={{ fontSize: 32 }}>🏥</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {clinic.name}
                    {isActive && <span className="status-pill" style={{ background: 'rgba(16,185,129,.15)', color: '#10b981', fontSize: 10 }}>● Active</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{clinic.specialty}{clinic.location ? ` · ${clinic.location}` : ''}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11, color: 'var(--text-2)' }}>
                    <span>👥 {clinic.patientsPerSession} pts/session</span>
                    <span>💰 KES {clinic.consultationFee?.toLocaleString()} consult</span>
                    <span>⏱ {clinic.slotDuration} min slots</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{clinic.queueToday}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>In Queue</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'create' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {message && (
            <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#10b981' }}>{message}</div>
          )}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Clinic Name *</label>
            <input style={inpStyle} value={newClinic.name} onChange={e => setNewClinic(n => ({ ...n, name: e.target.value }))} placeholder="e.g. Nairobi Medical Centre — Clinic A" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Specialty *</label>
              <select style={inpStyle} value={newClinic.specialty} onChange={e => setNewClinic(n => ({ ...n, specialty: e.target.value }))}>
                <option value="">— Select —</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Location</label>
              <input style={inpStyle} value={newClinic.location} onChange={e => setNewClinic(n => ({ ...n, location: e.target.value }))} placeholder="e.g. Nairobi, Kenya" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Consultation Fee (KES)</label>
              <input style={inpStyle} type="number" min={0} value={newClinic.consultationFee} onChange={e => setNewClinic(n => ({ ...n, consultationFee: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Follow-up Fee (KES)</label>
              <input style={inpStyle} type="number" min={0} value={newClinic.followUpFee} onChange={e => setNewClinic(n => ({ ...n, followUpFee: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Patients Per Session</label>
              <input style={inpStyle} type="number" min={1} max={100} value={newClinic.patientsPerSession} onChange={e => setNewClinic(n => ({ ...n, patientsPerSession: parseInt(e.target.value) || 10 }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Slot Duration (minutes)</label>
              <input style={inpStyle} type="number" min={5} max={120} step={5} value={newClinic.slotDuration} onChange={e => setNewClinic(n => ({ ...n, slotDuration: parseInt(e.target.value) || 30 }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="btn-secondary" onClick={() => setTab('overview')} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-accent" onClick={handleCreate} disabled={creating || !newClinic.name || !newClinic.specialty} style={{ flex: 2 }}>
              {creating ? '⏳ Creating…' : '🏥 Create Clinic'}
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (inline) {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{content}</div>;
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '94vh' }}>
        <div className="modal-hd" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 0 }}>
          <div className="modal-ht">🏥 Clinic Manager</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {content}
      </div>
    </div>
  );
}
