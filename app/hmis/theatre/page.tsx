'use client';
import { useState, useMemo } from 'react';
import { SurgeryStatus, SurgeryPriority, SurgeryUrgency } from '@/lib/amexan/hmis/theatre-engine';
import type { SurgeryBooking, WHOChecklist, OperationNote, TheatreAvailability } from '@/lib/amexan/hmis/theatre-engine';

const MOCK_BOOKINGS: SurgeryBooking[] = [
  { id: 'SURG-001', patientId: 'P-005', encounterId: 'ENC-005', procedureName: 'Laparoscopic Cholecystectomy', procedureCode: 'SUR-001', specialty: 'General Surgery', surgeonId: 'DOC-001', surgeonName: 'Dr. Ochieng', anaesthetistId: 'DOC-002', anaesthetistName: 'Dr. Kamau', assistants: ['Dr. Mwangi'], theatreId: 'TH-001', scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], scheduledStartTime: '08:00', estimatedDuration: 120, status: SurgeryStatus.Scheduled, priority: SurgeryPriority.Elective, urgency: SurgeryUrgency.Within1Month, admissionRequired: true, preoperativeNotes: 'NBM after midnight', bloodRequired: false, crossmatchRequired: false, imagingRequired: true, createdAt: Date.now() - 604800000, updatedAt: Date.now() - 86400000 },
  { id: 'SURG-002', patientId: 'P-006', encounterId: 'ENC-006', procedureName: 'Emergency Appendicectomy', procedureCode: 'SUR-002', specialty: 'General Surgery', surgeonId: 'DOC-001', surgeonName: 'Dr. Ochieng', anaesthetistId: 'DOC-002', anaesthetistName: 'Dr. Kamau', assistants: [], theatreId: 'TH-002', scheduledDate: new Date().toISOString().split('T')[0], scheduledStartTime: '14:30', estimatedDuration: 90, status: SurgeryStatus.Listed, priority: SurgeryPriority.Emergency, urgency: SurgeryUrgency.Immediate, admissionRequired: true, preoperativeNotes: 'Acute abdomen - likely appendicitis', bloodRequired: false, crossmatchRequired: false, imagingRequired: true, createdAt: Date.now() - 3600000, updatedAt: Date.now() - 1800000 },
  { id: 'SURG-003', patientId: 'P-007', encounterId: 'ENC-007', procedureName: 'Cataract Extraction + IOL', procedureCode: 'SUR-003', specialty: 'Ophthalmology', surgeonId: 'DOC-003', surgeonName: 'Dr. Akinyi', assistants: ['Dr. Otieno'], theatreId: 'TH-003', scheduledDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], scheduledStartTime: '10:00', estimatedDuration: 60, status: SurgeryStatus.Scheduled, priority: SurgeryPriority.Elective, urgency: SurgeryUrgency.Within1Month, admissionRequired: false, preoperativeNotes: 'Nil', bloodRequired: false, crossmatchRequired: false, imagingRequired: false, createdAt: Date.now() - 1209600000, updatedAt: Date.now() - 43200000 },
  { id: 'SURG-004', patientId: 'P-008', encounterId: 'ENC-008', procedureName: 'ORIF Tibial Fracture', procedureCode: 'SUR-004', specialty: 'Orthopedics', surgeonId: 'DOC-004', surgeonName: 'Dr. Njoroge', assistants: ['Dr. Wanjiku'], theatreId: 'TH-001', scheduledDate: new Date(Date.now() + 259200000).toISOString().split('T')[0], scheduledStartTime: '11:00', estimatedDuration: 150, status: SurgeryStatus.Listed, priority: SurgeryPriority.Urgent, urgency: SurgeryUrgency.Within1Week, admissionRequired: true, preoperativeNotes: 'Tibial plateau fracture', bloodRequired: true, crossmatchRequired: true, imagingRequired: true, createdAt: Date.now() - 172800000, updatedAt: Date.now() - 86400000 },
];

const MOCK_CHECKLIST: WHOChecklist = {
  surgeryId: 'SURG-001',
  signIn: [{ step: '1', description: 'Patient identity confirmed', completed: true }, { step: '2', description: 'Procedure site marked', completed: true }, { step: '3', description: 'Anaesthesia safety check', completed: false }, { step: '4', description: 'Pulse oximeter on and functioning', completed: false }],
  timeOut: [{ step: '1', description: 'Team introduction', completed: false }, { step: '2', description: 'Procedure confirmation', completed: false }, { step: '3', description: 'Anticipated critical events', completed: false }, { step: '4', description: 'Antibiotic prophylaxis given', completed: false }],
  signOut: [{ step: '1', description: 'Instrument counts correct', completed: false }, { step: '2', description: 'Specimens labelled', completed: false }, { step: '3', description: 'Equipment issues identified', completed: false }],
};

const MOCK_THEATRES: TheatreAvailability[] = [
  { theatreId: 'TH-001', theatreName: 'Theatre 1 - Main', available: false, currentSurgery: 'Laparoscopic Cholecystectomy', cleaningInProgress: false, equipmentReady: true },
  { theatreId: 'TH-002', theatreName: 'Theatre 2 - Emergency', available: true, cleaningInProgress: false, equipmentReady: true },
  { theatreId: 'TH-003', theatreName: 'Theatre 3 - Ophthalmology', available: true, cleaningInProgress: true, equipmentReady: false },
  { theatreId: 'TH-004', theatreName: 'Theatre 4 - Orthopedics', available: true, cleaningInProgress: false, equipmentReady: true },
];

export default function TheatrePage() {
  const [bookings] = useState(MOCK_BOOKINGS);
  const [theatres] = useState(MOCK_THEATRES);
  const [tab, setTab] = useState<'bookings' | 'theatres'>('bookings');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: bookings.length,
    scheduled: bookings.filter(b => b.status === SurgeryStatus.Scheduled).length,
    listed: bookings.filter(b => b.status === SurgeryStatus.Listed).length,
    emergency: bookings.filter(b => b.priority === SurgeryPriority.Emergency).length,
    availableTheatres: theatres.filter(t => t.available).length,
  }), [bookings, theatres]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Theatre Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XIII — WHO checklist, operation notes, theatre availability, surgery booking</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#EAB308,#CA8A04)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + New Booking
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
        {[{ label: 'Total Bookings', value: stats.total, color: '#EAB308' }, { label: 'Scheduled', value: stats.scheduled, color: '#3B82F6' }, { label: 'Listed', value: stats.listed, color: '#F59E0B' }, { label: 'Emergency', value: stats.emergency, color: '#EF4444' }, { label: 'Available Theatres', value: stats.availableTheatres, color: '#10B981' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
        {(['bookings', 'theatres'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: tab === t ? 'rgba(234,179,8,0.15)' : 'transparent', color: tab === t ? '#EAB308' : '#64748B', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>
            {t === 'bookings' ? '📋 Surgery Bookings' : '🏨 Theatres'}
          </button>
        ))}
      </div>

      {tab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bookings.map(b => {
            const isSelected = selectedBooking === b.id;
            return (
              <div key={b.id} onClick={() => setSelectedBooking(isSelected ? null : b.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: isSelected ? 'rgba(234,179,8,0.08)' : b.priority === SurgeryPriority.Emergency ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(234,179,8,0.3)' : b.priority === SurgeryPriority.Emergency ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏨</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{b.procedureName} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· {b.specialty}</span></div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Surgeon: {b.surgeonName} · Patient: {b.patientId} · {b.scheduledDate} @ {b.scheduledStartTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: b.priority === SurgeryPriority.Emergency ? 'rgba(239,68,68,0.15)' : b.priority === SurgeryPriority.Urgent ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', color: b.priority === SurgeryPriority.Emergency ? '#EF4444' : b.priority === SurgeryPriority.Urgent ? '#F59E0B' : '#94A3B8' }}>{b.priority}</span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{b.status}</span>
                    <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                  </div>
                </div>
                {isSelected && (
                  <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                    <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Theatre: <span style={{ color: '#E2E8F0' }}>{b.theatreId}</span></div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Duration: <span style={{ color: '#E2E8F0' }}>{b.estimatedDuration}min</span></div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Anaesthetist: <span style={{ color: '#E2E8F0' }}>{b.anaesthetistName || 'TBD'}</span></div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Blood required: <span style={{ color: b.bloodRequired ? '#EF4444' : '#10B981' }}>{b.bloodRequired ? 'Yes' : 'No'}</span></div>
                    </div>
                    {b.preoperativeNotes && <div style={{ padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.03)', marginBottom: 8, fontSize: 11, color: '#94A3B8' }}>Pre-op: {b.preoperativeNotes}</div>}
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>WHO Checklist — Sign In</div>
                    {MOCK_CHECKLIST.signIn.map(item => (
                      <div key={item.step} className="flex items-center gap-2" style={{ padding: '3px 0' }}>
                        <span style={{ fontSize: 12, color: item.completed ? '#10B981' : '#64748B' }}>{item.completed ? '✅' : '⬜'}</span>
                        <span style={{ fontSize: 11, color: item.completed ? '#94A3B8' : '#E2E8F0' }}>{item.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'theatres' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {theatres.map(t => (
            <div key={t.theatreId} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{t.theatreName}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    {t.available ? 'Available' : 'Occupied'}
                    {t.currentSurgery && ` · Current: ${t.currentSurgery}`}
                    {t.cleaningInProgress && ' · Cleaning in progress'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: t.equipmentReady ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: t.equipmentReady ? '#10B981' : '#EF4444' }}>{t.equipmentReady ? 'Ready' : 'Issues'}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: t.available ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: t.available ? '#10B981' : '#EF4444' }}>{t.available ? 'Free' : 'In Use'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
