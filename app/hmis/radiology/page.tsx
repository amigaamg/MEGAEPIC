'use client';
import { useState, useMemo } from 'react';
import { ImagingModality, ImagingStatus } from '@/lib/amexan/hmis/radiology-engine';
import type { ImagingRequest, ImagingReport } from '@/lib/amexan/hmis/radiology-engine';

const MOCK_REQUESTS: ImagingRequest[] = [
  { id: 'IMG-001', orderId: 'ORD-002', patientId: 'P-001', encounterId: 'ENC-001', modality: ImagingModality.CT, bodyPart: 'Head', laterality: 'NA', clinicalIndication: 'Head trauma following RTA', diagnosis: 'Subdural hematoma?', contrastRequired: false, priority: 'urgent', requester: { id: 'ACT-001', name: 'Dr. Smith', department: 'ED' }, requestedAt: Date.now() - 7200000, status: ImagingStatus.Ordered },
  { id: 'IMG-002', orderId: 'ORD-005', patientId: 'P-002', encounterId: 'ENC-002', modality: ImagingModality.Ultrasound, bodyPart: 'Abdomen', clinicalIndication: 'RUQ pain, suspected gallstones', diagnosis: 'Cholecystitis?', contrastRequired: false, priority: 'routine', requester: { id: 'ACT-002', name: 'Dr. Jones', department: 'Medicine' }, requestedAt: Date.now() - 86400000, status: ImagingStatus.ReportCompleted },
  { id: 'IMG-003', orderId: 'ORD-006', patientId: 'P-003', encounterId: 'ENC-003', modality: ImagingModality.XRay, bodyPart: 'Chest', clinicalIndication: 'Cough, fever, suspected pneumonia', diagnosis: 'Community-acquired pneumonia', contrastRequired: false, priority: 'urgent', requester: { id: 'ACT-001', name: 'Dr. Smith', department: 'ED' }, requestedAt: Date.now() - 3600000, status: ImagingStatus.Completed },
  { id: 'IMG-004', orderId: 'ORD-007', patientId: 'P-004', encounterId: 'ENC-004', modality: ImagingModality.MRI, bodyPart: 'Lumbar Spine', clinicalIndication: 'Chronic lower back pain with radiculopathy', contrastRequired: true, contrastType: 'Gadolinium', priority: 'elective', requester: { id: 'ACT-003', name: 'Dr. Williams', department: 'Orthopedics' }, requestedAt: Date.now() - 604800000, status: ImagingStatus.Scheduled },
];

const MOCK_REPORTS: ImagingReport[] = [
  { id: 'RPT-001', requestId: 'IMG-002', technique: 'Grayscale and color Doppler ultrasound of the abdomen', comparison: 'None available', findings: 'Gallbladder distended with multiple gallstones. Wall thickness 4mm. Positive Murphy sign. Common bile duct measures 5mm.', impression: 'Acute cholecystitis with cholelithiasis', recommendations: 'Laparoscopic cholecystectomy recommended', radiologistId: 'RAD-001', radiologistName: 'Dr. Kipkorir', reportedAt: Date.now() - 43200000, verifiedAt: Date.now() - 36000000, verifiedBy: 'RAD-001', isCritical: false, attachments: [] },
];

const MODALITY_ICONS: Record<string, string> = { xray: '📡', ct: '🖥️', mri: '🧲', ultrasound: '📊', fluoroscopy: '📹', mammography: '🎯', nuclear_medicine: '☢️', pet: '🔬', dexa: '🦴', angiography: '🩸' };

export default function RadiologyPage() {
  const [requests] = useState(MOCK_REQUESTS);
  const [reports] = useState(MOCK_REPORTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ImagingStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return requests.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.id.toLowerCase().includes(q) || r.bodyPart.toLowerCase().includes(q) || r.clinicalIndication.toLowerCase().includes(q) || r.patientId.toLowerCase().includes(q);
      }
      return true;
    });
  }, [requests, search, statusFilter]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Radiology Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XII — Imaging request→report, PACS study model, structured reporting</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
        {[{ label: 'Total Requests', value: requests.length, color: '#06B6D4' }, { label: 'Pending', value: requests.filter(r => r.status === ImagingStatus.Ordered || r.status === ImagingStatus.Scheduled).length, color: '#F59E0B' }, { label: 'Completed', value: requests.filter(r => r.status === ImagingStatus.Completed || r.status === ImagingStatus.ReportCompleted).length, color: '#10B981' }, { label: 'Reported', value: reports.length, color: '#8B5CF6' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search by ID, body part, indication..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ImagingStatus | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Status</option>
          {Object.values(ImagingStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(req => {
          const isSelected = selectedRequest === req.id;
          const report = reports.find(r => r.requestId === req.id);
          return (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(isSelected ? null : req.id)}
              style={{
                padding: 14, borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 24 }}>{MODALITY_ICONS[req.modality] || '📡'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>
                      {req.bodyPart} {req.laterality && `(${req.laterality})`} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· {req.modality}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{req.clinicalIndication} · Patient: {req.patientId} · Requester: {req.requester.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  {req.contrastRequired && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>Contrast</span>}
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: req.priority === 'urgent' || req.priority === 'stat' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', color: req.priority === 'urgent' || req.priority === 'stat' ? '#EF4444' : '#94A3B8' }}>{req.priority}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{req.status}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  {report && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#06B6D4', marginBottom: 6 }}>Radiology Report — {report.radiologistName}</div>
                      <div style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Technique: <span style={{ color: '#E2E8F0' }}>{report.technique}</span></div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Findings: <span style={{ color: '#E2E8F0' }}>{report.findings}</span></div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Impression: <span style={{ color: '#06B6D4', fontWeight: 600 }}>{report.impression}</span></div>
                        {report.recommendations && <div style={{ fontSize: 11, color: '#94A3B8' }}>Recommendations: <span style={{ color: '#E2E8F0' }}>{report.recommendations}</span></div>}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Contrast: <span style={{ color: '#E2E8F0' }}>{req.contrastRequired ? `${req.contrastType || 'Yes'}` : 'No'}</span></div>
                    {req.diagnosis && <div style={{ fontSize: 11, color: '#64748B' }}>Dx: <span style={{ color: '#E2E8F0' }}>{req.diagnosis}</span></div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
