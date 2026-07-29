'use client';
import { useState, useMemo } from 'react';
import { ReferralType, ReferralDirection, ReferralStatus, ReferralPriority, ReferralUrgency, createReferral, submitReferral, acceptReferral, declineReferral, completeReferral, getReferralStats } from '@/lib/amexan/hmis/referral-engine';
import type { Referral } from '@/lib/amexan/hmis/referral-engine';

const MOCK_REFERRALS: Referral[] = [
  createReferral({ patientId: 'P-001', patientName: 'John Kamau', encounterId: 'ENC-001', referralType: ReferralType.Specialist, direction: ReferralDirection.Internal, referringFacilityId: 'HOS-001', referringFacilityName: 'AMEXAN Hospital', referringDepartmentId: 'DEPT-001', referringProviderId: 'DOC-001', referringProviderName: 'Dr. Smith', receivingFacilityId: 'HOS-001', receivingFacilityName: 'AMEXAN Hospital', receivingDepartmentId: 'DEPT-008', reason: 'Cardiology consult for chest pain', clinicalSummary: '45yo M with exertional chest pain, ECG shows ST depression', priority: ReferralPriority.Urgent, urgency: ReferralUrgency.Within24h }),
  createReferral({ patientId: 'P-003', patientName: 'Samuel Ochieng', encounterId: 'ENC-003', referralType: ReferralType.Surgical, direction: ReferralDirection.Internal, referringFacilityId: 'HOS-001', referringFacilityName: 'AMEXAN Hospital', referringDepartmentId: 'DEPT-002', referringProviderId: 'DOC-002', referringProviderName: 'Dr. Jones', receivingFacilityId: 'HOS-001', receivingFacilityName: 'AMEXAN Hospital', receivingDepartmentId: 'DEPT-004', reason: 'Surgical evaluation for appendicitis', clinicalSummary: '22yo M with RLQ pain, ultrasound positive for appendicitis', priority: ReferralPriority.STAT, urgency: ReferralUrgency.Immediate }),
  createReferral({ patientId: 'P-004', patientName: 'Grace Mwangi', encounterId: 'ENC-004', referralType: ReferralType.Rehabilitation, direction: ReferralDirection.Internal, referringFacilityId: 'HOS-001', referringFacilityName: 'AMEXAN Hospital', referringDepartmentId: 'DEPT-003', referringProviderId: 'DOC-003', referringProviderName: 'Dr. Akinyi', receivingFacilityId: 'HOS-001', receivingFacilityName: 'AMEXAN Hospital', receivingDepartmentId: 'DEPT-011', reason: 'Post-stroke physiotherapy', clinicalSummary: '68yo F with left-sided weakness post CVA', priority: ReferralPriority.Routine, urgency: ReferralUrgency.Within1Week }),
];

submitReferral(MOCK_REFERRALS[0]);
submitReferral(MOCK_REFERRALS[1]);
submitReferral(MOCK_REFERRALS[2]);
acceptReferral(MOCK_REFERRALS[1], 'DOC-004', 'Dr. Njoroge');

export default function ReferralsPage() {
  const [referrals] = useState(MOCK_REFERRALS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all');
  const [selectedRef, setSelectedRef] = useState<string | null>(null);

  const stats = useMemo(() => getReferralStats(referrals), [referrals]);

  const filtered = useMemo(() => {
    return referrals.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.patientName.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q) || r.referringProviderName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [referrals, search, statusFilter]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Referral Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XVII — Inter/intra-facility referral workflows with full lifecycle</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#D946EF,#C026D3)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ New Referral</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
        {[{ label: 'Total', value: stats.total, color: '#D946EF' }, { label: 'Pending', value: stats.pending, color: '#F59E0B' }, { label: 'Accepted', value: stats.accepted, color: '#10B981' }, { label: 'Declined', value: stats.declined, color: '#EF4444' }, { label: 'Avg Accept', value: `${stats.averageAcceptanceTime}h`, color: '#3B82F6' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <input placeholder="Search by patient, reason, referrer..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', maxWidth: 400 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(r => {
          const isSelected = selectedRef === r.id;
          return (
            <div key={r.id} onClick={() => setSelectedRef(isSelected ? null : r.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: isSelected ? 'rgba(217,70,239,0.08)' : r.priority === ReferralPriority.STAT ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(217,70,239,0.3)' : r.priority === ReferralPriority.STAT ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
              <div className="flex items-center justify-between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{r.patientName} → {r.receivingDepartmentId} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· {r.referralType}</span></div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{r.reason} · From: {r.referringProviderName} | {r.direction}</div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  {r.priority === ReferralPriority.STAT && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>STAT</span>}
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: r.status === ReferralStatus.Accepted ? 'rgba(16,185,129,0.15)' : r.status === ReferralStatus.Submitted ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', color: r.status === ReferralStatus.Accepted ? '#10B981' : r.status === ReferralStatus.Submitted ? '#3B82F6' : '#94A3B8' }}>{r.status}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: '#E2E8F0', marginBottom: 8 }}>{r.clinicalSummary}</div>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>From: <span style={{ color: '#E2E8F0' }}>{r.referringFacilityName} · {r.referringDepartmentId}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>To: <span style={{ color: '#E2E8F0' }}>{r.receivingFacilityName} · {r.receivingDepartmentId}</span></div>
                    {r.receivingProviderName && <div style={{ fontSize: 11, color: '#64748B' }}>Accepted by: <span style={{ color: '#E2E8F0' }}>{r.receivingProviderName}</span></div>}
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
