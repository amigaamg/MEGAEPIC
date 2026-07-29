'use client';
import { useState, useMemo } from 'react';
import { LabCategory, SpecimenType, LabTestStatus } from '@/lib/amexan/hmis/laboratory-engine';
import type { LabTestProfile, LabRequest, LabSpecimen, QCResult } from '@/lib/amexan/hmis/laboratory-engine';

const MOCK_PROFILES: LabTestProfile[] = [
  { id: 'PROF-001', code: 'FBC', name: 'Full Blood Count', category: LabCategory.Hematology, department: 'Hematology', specimen: { type: SpecimenType.EDTA, container: 'EDTA Tube', storage: 'Room temp', transport: 'Pneumatic tube', rejectionCriteria: ['Clotted', 'Hemolyzed'], fasting: false }, methodology: 'Automated analyzer', turnaroundMinutes: 60, cost: 500, isPanel: true, panelMembers: ['Hb', 'WBC', 'PLT', 'HCT', 'MCV', 'MCH', 'MCHC', 'RDW', 'Neutrophils', 'Lymphocytes'], referenceRanges: [], criticalValues: [], interpretation: 'Standard hematology panel', preparation: 'No special preparation', isActive: true },
  { id: 'PROF-002', code: 'UEC', name: 'Urea & Electrolytes', category: LabCategory.Biochemistry, department: 'Biochemistry', specimen: { type: SpecimenType.Serum, container: 'SST Tube', storage: 'Room temp', transport: 'Pneumatic tube', rejectionCriteria: ['Hemolyzed', 'Insufficient volume'], fasting: false }, methodology: 'Ion selective electrode', turnaroundMinutes: 90, cost: 600, isPanel: true, panelMembers: ['Na', 'K', 'Urea', 'Cr', 'Cl'], referenceRanges: [], criticalValues: [{ high: 6.5, unit: 'mmol/L', notifyImmediately: true, notifyTo: ['clinician', 'pharmacist'] }], interpretation: 'Renal function panel', preparation: 'No special preparation', isActive: true },
  { id: 'PROF-003', code: 'LFT', name: 'Liver Function Tests', category: LabCategory.Biochemistry, department: 'Biochemistry', specimen: { type: SpecimenType.Serum, container: 'SST Tube', storage: 'Room temp', transport: 'Pneumatic tube', rejectionCriteria: ['Hemolyzed'], fasting: false }, methodology: 'Colorimetric assay', turnaroundMinutes: 120, cost: 800, isPanel: true, panelMembers: ['ALT', 'AST', 'ALP', 'GGT', 'TBIL', 'DBIL', 'TP', 'ALB'], referenceRanges: [], criticalValues: [], interpretation: 'Standard LFT panel', preparation: 'No special preparation', isActive: true },
  { id: 'PROF-004', code: 'BC', name: 'Blood Culture', category: LabCategory.Microbiology, department: 'Microbiology', specimen: { type: SpecimenType.WholeBlood, container: 'Blood culture bottles', storage: 'Incubate', transport: 'Immediate', rejectionCriteria: ['Insufficient volume', 'Contaminated'], fasting: false }, methodology: 'Automated culture system', turnaroundMinutes: 4320, cost: 1500, isPanel: false, referenceRanges: [], criticalValues: [], interpretation: 'Positive/negative', preparation: 'Aseptic technique', isActive: true },
  { id: 'PROF-005', code: 'HbA1c', name: 'Glycated Hemoglobin', category: LabCategory.Biochemistry, department: 'Biochemistry', specimen: { type: SpecimenType.EDTA, container: 'EDTA Tube', storage: 'Refrigerate', transport: 'Cold chain', rejectionCriteria: ['Hemolyzed'], fasting: false }, methodology: 'HPLC', turnaroundMinutes: 240, cost: 1200, isPanel: false, referenceRanges: [{ low: 4.0, high: 5.6, unit: '%' }], criticalValues: [], interpretation: 'Diabetes control marker', preparation: 'No fasting required', isActive: true },
];

const MOCK_REQUESTS: LabRequest[] = [
  { id: 'LREQ-001', orderId: 'ORD-001', patientId: 'P-001', encounterId: 'ENC-001', tests: [{ testCode: 'FBC', testName: 'Full Blood Count', isStat: true, status: LabTestStatus.Completed }], priority: 'stat', clinicalInfo: 'Suspected infection', requester: { id: 'ACT-001', name: 'Dr. Smith', department: 'ED' }, requestedAt: Date.now() - 7200000 },
  { id: 'LREQ-002', orderId: 'ORD-002', patientId: 'P-002', encounterId: 'ENC-002', tests: [{ testCode: 'UEC', testName: 'Urea & Electrolytes', isStat: false, status: LabTestStatus.Processing }, { testCode: 'LFT', testName: 'Liver Function Tests', isStat: false, status: LabTestStatus.Processing }], priority: 'urgent', clinicalInfo: 'Abnormal renal function', requester: { id: 'ACT-001', name: 'Dr. Smith', department: 'Medicine' }, requestedAt: Date.now() - 3600000 },
  { id: 'LREQ-003', orderId: 'ORD-004', patientId: 'P-004', encounterId: 'ENC-004', tests: [{ testCode: 'HbA1c', testName: 'Glycated Hemoglobin', isStat: false, status: LabTestStatus.Ordered }], priority: 'routine', clinicalInfo: 'Diabetes follow-up', requester: { id: 'ACT-003', name: 'Dr. Williams', department: 'Medicine' }, requestedAt: Date.now() - 1800000 },
];

const STATUS_COLORS: Record<string, string> = { ordered: '#3B82F6', collected: '#8B5CF6', received: '#F59E0B', processing: '#F97316', completed: '#10B981', verified: '#34D399', released: '#06B6D4', cancelled: '#6B7280', rejected: '#EF4444' };

export default function LaboratoryPage() {
  const [profiles] = useState(MOCK_PROFILES);
  const [requests] = useState(MOCK_REQUESTS);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'profiles' | 'requests'>('profiles');

  const filteredProfiles = useMemo(() => {
    if (!search) return profiles;
    const q = search.toLowerCase();
    return profiles.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [profiles, search]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Laboratory Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XI — Specimen workflow, QC, test profiles, reference ranges, critical values</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
        {[{ label: 'Test Profiles', value: profiles.length, color: '#A855F7' }, { label: 'Pending', value: requests.filter(r => r.tests.some(t => t.status === LabTestStatus.Ordered)).length, color: '#F59E0B' }, { label: 'Processing', value: requests.filter(r => r.tests.some(t => t.status === LabTestStatus.Processing)).length, color: '#F97316' }, { label: 'Completed', value: requests.filter(r => r.tests.every(t => t.status === LabTestStatus.Completed)).length, color: '#10B981' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
        {(['profiles', 'requests'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: tab === t ? 'rgba(168,85,247,0.15)' : 'transparent', color: tab === t ? '#A855F7' : '#64748B', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>
            {t === 'profiles' ? '🔬 Test Profiles' : '📋 Lab Requests'}
          </button>
        ))}
      </div>

      {tab === 'profiles' && (
        <>
          <input placeholder="Search by name, code, category..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', maxWidth: 400 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredProfiles.map(profile => (
              <div key={profile.id} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{profile.name} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{profile.code}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{profile.category} · {profile.department} · TAT: {profile.turnaroundMinutes}min · Cost: KES {profile.cost}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.isPanel && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(168,85,247,0.15)', color: '#A855F7' }}>Panel</span>}
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: profile.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: profile.isActive ? '#10B981' : '#EF4444' }}>{profile.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Specimen: {profile.specimen.type} in {profile.specimen.container} · {profile.specimen.fasting ? 'Fasting required' : 'No fasting'}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Method: {profile.methodology}</div>
                  {profile.isPanel && profile.panelMembers && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {profile.panelMembers.map(m => <span key={m} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{m}</span>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {requests.map(req => (
            <div key={req.id} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{req.id} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>by {req.requester.name} ({req.requester.department})</span></div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Patient: {req.patientId} · {req.clinicalInfo} · Priority: {req.priority}</div>
                </div>
                <span style={{ fontSize: 12, color: '#475569' }}>{new Date(req.requestedAt).toLocaleTimeString()}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                {req.tests.map((test, i) => (
                  <div key={i} className="flex items-center justify-between" style={{ padding: '4px 0' }}>
                    <span style={{ fontSize: 12, color: '#E2E8F0' }}>{test.testName} ({test.testCode})</span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${STATUS_COLORS[test.status]}20`, color: STATUS_COLORS[test.status] }}>{test.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
