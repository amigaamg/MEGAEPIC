'use client';

import React, { useState, useMemo } from 'react';
import type { DoctorProfile } from '../DoctorShell';
import DocketManager from '../panels/DocketManager';

interface Docket {
  id: string; name: string; specialty: string; description?: string;
  tools: string[]; patientCount: number; createdBy: string;
  createdAt: any; isActive: boolean;
}

interface Appointment {
  id: string; patientId: string; patientName?: string; patientEmail?: string;
  patientPhone?: string; serviceId: string; specialty?: string;
  status: 'booked' | 'active' | 'completed' | 'cancelled';
  date: any; patientNotes?: string;
  prescriptions?: any[]; consultationId?: string;
  doctorId: string; amount?: number; paymentStatus?: string;
}

interface Consultation {
  id: string; appointmentId: string; doctorId: string; patientId: string;
  status: 'active' | 'completed'; prescriptions: any[];
  notes: string; startedAt: any; endedAt?: any;
}

interface Props {
  doctor: DoctorProfile;
  appointments: Appointment[];
  consultations: Record<string, Consultation>;
  activeAppts: Appointment[];
  upcomingAppts: Appointment[];
  onStartConsultation: (appt: Appointment) => void;
  onEndConsultation: (appt: Appointment) => void;
  onCancelAppointment: (appt: Appointment) => void;
  onRejoin: (id: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  dockets?: Docket[];
  onCreateDocket?: (data: { name: string; specialty: string; description: string; tools: string[] }) => Promise<Docket | null>;
  onActivateDocket?: (docketId: string, active: boolean) => void;
}

const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function ClinicWorkspace({
  doctor, appointments, consultations, activeAppts, upcomingAppts,
  onStartConsultation, onEndConsultation, onCancelAppointment, onRejoin,
  activeTab, onTabChange, dockets: propDockets, onCreateDocket, onActivateDocket,
}: Props) {
  const [tab, setTab] = useState<'operations' | 'dockets'>('operations');
  const [selectedDocket, setSelectedDocket] = useState<Docket | null>(null);

  const dockets = propDockets || [];
  const activeDockets = dockets.filter(d => d.isActive);

  const fmtTime = (ts: any) => {
    if (!ts) return '—';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideUp .25s ease' }}>
      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button className={`filter-chip ${tab === 'operations' ? 'active' : ''}`} onClick={() => setTab('operations')}>
          🏥 Clinical Operations
        </button>
        <button className={`filter-chip ${tab === 'dockets' ? 'active' : ''}`} onClick={() => setTab('dockets')}>
          📂 Care Dockets ({dockets.length})
        </button>
      </div>

      {tab === 'dockets' && (
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-title">📂 Care Dockets</div>
            <span className="count-badge">{activeDockets.length} active</span>
          </div>
          <DocketManager
            dockets={dockets}
            onCreateDocket={onCreateDocket || (async () => null)}
            onActivateDocket={onActivateDocket || (() => {})}
            onSelectDocket={setSelectedDocket}
            activeDocketId={selectedDocket?.id}
            doctorSpecialty={doctor.specialty}
          />
        </div>
      )}

      {tab === 'operations' && (
        <>
          {/* Active Docket Overview */}
          {activeDockets.length > 0 && (
            <div className="panel">
              <div className="panel-hd">
                <div className="panel-title">⚡ Active Clinical Workspaces</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {activeDockets.map(d => (
                  <div key={d.id} onClick={() => setTab('dockets')}
                    style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all .15s' }}>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>📂 {d.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{d.specialty}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, color: 'var(--text-2)' }}>
                      <span>👥 {d.patientCount} patients</span>
                      <span>🔧 {d.tools?.length} tools</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Sessions */}
          {activeAppts.length > 0 && (
            <div className="panel active-sessions-panel">
              <div className="panel-hd">
                <div className="panel-title"><span className="live-dot-sm" /> Active Sessions ({activeAppts.length})</div>
              </div>
              {activeAppts.map(appt => {
                const c = consultations[appt.id];
                return (
                  <div key={appt.id} className="active-session-card">
                    <div className="as-left">
                      <div className="as-ava">{(appt.patientName||'P')[0]}</div>
                      <div>
                        <div className="as-name">{appt.patientName||'Patient'}</div>
                        <div className="as-sub">{appt.specialty}</div>
                        {appt.patientPhone && <div style={{fontSize:11,color:'var(--muted)'}}>📞 {appt.patientPhone}</div>}
                      </div>
                    </div>
                    <div className="as-actions">
                      <button className="btn-action" onClick={()=>onTabChange('tools')}>🛠 Tools</button>
                      <button className="btn-join-live" disabled={!c?.id} onClick={()=>c?.id && onRejoin(c.id)}>🎥 Rejoin</button>
                      <button className="btn-end" onClick={()=>onEndConsultation(appt)}>End</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Queue */}
          <div className="panel">
            <div className="panel-hd">
              <div className="panel-title">📋 Appointment Queue</div>
              <span className="count-badge">{upcomingAppts.length} waiting</span>
            </div>
            {upcomingAppts.length === 0 ? (
              <div className="empty-sm"><div style={{fontSize:36,marginBottom:8}}>✅</div><p>Queue is clear</p></div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {upcomingAppts.map((appt, idx) => (
                  <div key={appt.id} className="queue-card">
                    <div className="queue-left">
                      <div style={{position:'relative'}}>
                        <div className="queue-ava">{(appt.patientName||'P')[0]}</div>
                        {idx===0 && <div style={{position:'absolute',top:-4,right:-4,width:14,height:14,background:'var(--amber)',borderRadius:'50%',border:'2px solid var(--surface)',fontSize:8,display:'flex',alignItems:'center',justifyContent:'center'}}>→</div>}
                      </div>
                      <div>
                        <div className="queue-name">{appt.patientName||'Patient'}</div>
                        <div className="queue-specialty">{appt.specialty||'Consultation'}</div>
                        <div className="queue-date">{fmtDate(appt.date)}</div>
                        {appt.patientPhone && <div style={{fontSize:11,color:'var(--muted)'}}>📞 {appt.patientPhone}</div>}
                        {appt.patientNotes && <div className="queue-concern">💬 "{appt.patientNotes}"</div>}
                      </div>
                    </div>
                    <div className="queue-right">
                      <span className="payment-pill" style={{background:appt.paymentStatus==='paid'?'rgba(16,185,129,.1)':'rgba(245,158,11,.1)',color:appt.paymentStatus==='paid'?'#10b981':'#f59e0b'}}>
                        {appt.paymentStatus==='paid'?'✓ Paid':'⏳ Pending'}{appt.amount?` · KES ${appt.amount.toLocaleString()}`:''}
                      </span>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn-end" onClick={()=>onCancelAppointment(appt)} style={{padding:'6px 10px',fontSize:11}}>Cancel</button>
                        <button className="btn-start" onClick={()=>onStartConsultation(appt)}>▶ Start</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
