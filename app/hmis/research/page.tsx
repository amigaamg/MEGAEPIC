'use client';
import { useState, useMemo } from 'react';
import { TrialPhase, StudyStatus, StudyType, ParticipantStatus, getResearchStats } from '@/lib/amexan/hmis/research-engine';
import type { ResearchStudy, StudyParticipant } from '@/lib/amexan/hmis/research-engine';

const MOCK_STUDIES: ResearchStudy[] = [
  { id: 'STU-001', title: 'Efficacy of Artemether-Lumefantrine in Severe Malaria', shortTitle: 'Malaria Trial', protocolNumber: 'PROT-2024-001', phase: TrialPhase.Phase3, status: StudyStatus.Enrolling, type: StudyType.Interventional, principalInvestigator: 'Dr. Ochieng', principalInvestigatorId: 'DOC-001', sponsor: 'NIH', fundingSource: 'Grant', objectives: ['Evaluate efficacy', 'Assess safety profile'], endpoints: [{ name: 'Parasite clearance', type: 'primary', measure: 'Time to parasite clearance', timeFrame: '72 hours', description: 'Time to negative blood smear' }], eligibilityCriteria: { inclusionCriteria: ['Age 6-60 months', 'Confirmed malaria'], exclusionCriteria: ['Severe malnutrition', 'Known allergy'], minAge: 0, maxAge: 60, allowedGenders: ['M', 'F'], conditions: ['Malaria'] }, enrollmentTarget: 500, enrolledCount: 234, facilities: ['HOS-001'], departments: ['DEPT-002'], ethicsApproval: { board: 'KEMRI ERC', approvalNumber: 'KEMRI-2024-056', approvalDate: '2024-01-15', expiryDate: '2025-01-15', status: 'approved', documents: [] }, startDate: '2024-03-01', endDate: '2025-08-31', duration: '18 months', interventions: [{ name: 'Artemether-Lumefantrine', type: 'drug', description: 'Standard 6-dose regimen', dose: '1.5/9mg/kg', frequency: 'BD', duration: '3 days' }], arms: [{ name: 'Treatment Arm', description: 'Standard ACT therapy', interventions: ['Artemether-Lumefantrine'], targetEnrollment: 500 }], dataPoints: [{ name: 'Parasite Count', code: 'PC', type: 'numeric', required: true, collectionTimePoints: ['0h', '24h', '48h', '72h'], unit: 'parasites/μL' }], publications: [], createdAt: Date.now() - 31536000000, updatedAt: Date.now() - 259200000 },
  { id: 'STU-002', title: 'Telemedicine Outcomes in Rural Diabetes Management', shortTitle: 'Tele-DM Study', protocolNumber: 'PROT-2025-002', phase: TrialPhase.Observational, status: StudyStatus.Active, type: StudyType.Observational, principalInvestigator: 'Dr. Akinyi', principalInvestigatorId: 'DOC-003', sponsor: 'WHO AFRO', fundingSource: 'Grant', objectives: ['Compare telemedicine vs in-person outcomes'], endpoints: [{ name: 'HbA1c reduction', type: 'primary', measure: 'Change in HbA1c', timeFrame: '6 months', description: 'Mean HbA1c change' }], eligibilityCriteria: { inclusionCriteria: ['Type 2 DM', 'Age >18'], exclusionCriteria: ['Type 1 DM', 'Pregnancy'], minAge: 18, maxAge: 80, allowedGenders: ['M', 'F'], conditions: ['Diabetes'] }, enrollmentTarget: 300, enrolledCount: 156, facilities: ['HOS-001', 'HOS-002'], departments: ['DEPT-002'], ethicsApproval: { board: 'KNH ERC', approvalNumber: 'KNH-2025-023', approvalDate: '2025-01-20', expiryDate: '2026-01-20', status: 'approved', documents: [] }, startDate: '2025-02-01', endDate: '2026-07-31', duration: '18 months', interventions: [{ name: 'Telemedicine Monitoring', type: 'behavioral', description: 'Weekly telemedicine consultations' }], arms: [{ name: 'Telemedicine Arm', description: 'Virtual care', interventions: ['Telemedicine Monitoring'], targetEnrollment: 150 }, { name: 'Control Arm', description: 'Standard in-person care', interventions: [], targetEnrollment: 150 }], dataPoints: [{ name: 'HbA1c', code: 'A1C', type: 'numeric', required: true, collectionTimePoints: ['Baseline', '3mo', '6mo'], unit: '%' }], publications: [], createdAt: Date.now() - 15768000000, updatedAt: Date.now() - 86400000 },
];

export default function ResearchPage() {
  const [studies] = useState(MOCK_STUDIES);
  const [selectedStudy, setSelectedStudy] = useState<string | null>(null);

  const stats = useMemo(() => getResearchStats(studies, []), [studies]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Research Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XIX — Clinical trial management, studies, enrollment, data collection</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6D28D9,#5B21B6)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ New Study</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
        {[{ label: 'Studies', value: stats.totalStudies, color: '#6D28D9' }, { label: 'Active', value: stats.activeStudies, color: '#10B981' }, { label: 'Enrolling', value: stats.enrollingStudies, color: '#3B82F6' }, { label: 'Completed', value: stats.completedStudies, color: '#8B5CF6' }, { label: 'Participants', value: stats.totalParticipants, color: '#F59E0B' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {studies.map(s => {
          const isSelected = selectedStudy === s.id;
          return (
            <div key={s.id} onClick={() => setSelectedStudy(isSelected ? null : s.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: isSelected ? 'rgba(109,40,217,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(109,40,217,0.3)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
              <div className="flex items-center justify-between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{s.shortTitle} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· {s.phase} · PI: {s.principalInvestigator}</span></div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{s.sponsor} · Enrollment: {s.enrolledCount}/{s.enrollmentTarget} · {s.startDate} to {s.endDate}</div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: s.status === StudyStatus.Enrolling ? 'rgba(59,130,246,0.15)' : s.status === StudyStatus.Active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', color: s.status === StudyStatus.Enrolling ? '#3B82F6' : s.status === StudyStatus.Active ? '#10B981' : '#94A3B8' }}>{s.status}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: '#E2E8F0', marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>Eligibility</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginBottom: 8 }}>Age: {s.eligibilityCriteria.minAge}-{s.eligibilityCriteria.maxAge} · Genders: {s.eligibilityCriteria.allowedGenders.join(', ')} · Conditions: {s.eligibilityCriteria.conditions.join(', ')}</div>
                  {s.arms.length > 0 && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>Study Arms</div>
                      {s.arms.map((arm, i) => <div key={i} style={{ fontSize: 11, color: '#E2E8F0', padding: '4px 0' }}>{arm.name}: {arm.description} (n={arm.targetEnrollment})</div>)}
                    </>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', margin: '8px 0 4px' }}>Endpoints</div>
                  {s.endpoints.map((ep, i) => <div key={i} style={{ fontSize: 11, color: '#94A3B8' }}>{ep.name} ({ep.type}) · {ep.timeFrame}</div>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
