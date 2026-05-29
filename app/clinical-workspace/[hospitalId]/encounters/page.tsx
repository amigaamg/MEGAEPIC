'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SearchBar from '@/src/components/shared/search-bar';
import { ENCOUNTER_LABELS } from '@/lib/encounterTypes';

const ENCOUNTER_TYPES = ['outpatient', 'inpatient', 'follow_up', 'telemedicine', 'full_history'];

const MOCK_ENCOUNTERS = [
  { id: 'ENC-001', patientId: 'P001', patientName: 'Amara Nwosu', department: 'Cardiology', encounterType: 'outpatient', phase: 'DDx', priority: 'urgent', openedAt: '2026-05-28T08:00' },
  { id: 'ENC-002', patientId: 'P002', patientName: 'John Kamau', department: 'IM', encounterType: 'inpatient', phase: 'Treatment', priority: 'routine', openedAt: '2026-05-28T07:30' },
  { id: 'ENC-003', patientId: 'P003', patientName: 'Mary Wanjiku', department: 'OB/GYN', encounterType: 'full_history', phase: 'Triage', priority: 'routine', openedAt: '2026-05-28T09:00' },
  { id: 'ENC-004', patientId: 'P004', patientName: 'Baby Ochieng', department: 'PAED', encounterType: 'emergency', phase: 'Exam', priority: 'urgent', openedAt: '2026-05-28T06:00' },
  { id: 'ENC-005', patientId: 'P006', patientName: 'Grace Mwangi', department: 'ENDO', encounterType: 'follow_up', phase: 'History', priority: 'routine', openedAt: '2026-05-27T14:00' },
];

const PHASE_COLORS: Record<string, string> = {
  Triage: '#64748B', History: '#3B82F6', Exam: '#8B5CF6',
  DDx: '#06B6D4', Investigations: '#F59E0B', Diagnosis: '#10B981',
  Treatment: '#00D68F', Plan: '#6366F1',
};

const PRIORITY_COLORS: Record<string, string> = { urgent: '#FF4560', routine: '#64748B' };

export default function EncountersPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.hospitalId as string;
  const [search, setSearch] = useState('');

  const filtered = MOCK_ENCOUNTERS.filter(e =>
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Encounters</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>5 encounter types · {MOCK_ENCOUNTERS.length} active</p>
        </div>
        <div className="flex gap-2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search encounters..." />
          <button
            onClick={() => router.push(`/clinical-workspace/${hospitalId}/encounters/new`)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg,#06B6D4,#0891B2)',
              color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
              cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
            }}
          >
            + New Encounter
          </button>
        </div>
      </div>

      <div className="frost-card p-4">
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Encounter Types
        </div>
        <div className="flex flex-wrap gap-2">
          {ENCOUNTER_TYPES.map(type => {
            const info = ENCOUNTER_LABELS[type] || ENCOUNTER_LABELS.full_history;
            return (
              <button
                key={type}
                onClick={() => router.push(`/clinical-workspace/${hospitalId}/encounters/new?type=${type}`)}
                style={{
                  padding: '6px 14px', borderRadius: 999, border: `1px solid ${info.color}30`,
                  background: `${info.color}10`, color: info.color,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
                className="hover:brightness-125"
              >
                {info.icon} {info.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="frost-card overflow-hidden">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                {['ID', 'Patient', 'Department', 'Encounter Type', 'Phase', 'Priority', 'Opened', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 11, letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const encInfo = ENCOUNTER_LABELS[e.encounterType as keyof typeof ENCOUNTER_LABELS] || ENCOUNTER_LABELS.outpatient;
                return (
                  <tr
                    key={e.id}
                    onClick={() => router.push(`/clinical-workspace/${hospitalId}/encounters/${e.id}`)}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.15s' }}
                    className="hover:bg-white/[0.02]"
                  >
                    <td style={{ padding: '10px 14px', color: '#06B6D4', fontWeight: 500, fontFamily: "'JetBrains Mono',monospace" }}>{e.id}</td>
                    <td style={{ padding: '10px 14px', color: '#E2E8F0', fontWeight: 500 }}>{e.patientName}</td>
                    <td style={{ padding: '10px 14px', color: '#94A3B8' }}>{e.department}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                        background: `${encInfo.color}15`, color: encInfo.color,
                      }}>
                        {encInfo.icon} {encInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                        background: `${PHASE_COLORS[e.phase]}15`, color: PHASE_COLORS[e.phase],
                      }}>
                        {e.phase}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                        background: `${PRIORITY_COLORS[e.priority]}15`, color: PRIORITY_COLORS[e.priority],
                      }}>
                        {e.priority}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#64748B' }}>{e.openedAt}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>→</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
