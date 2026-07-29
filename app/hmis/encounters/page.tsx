'use client';
import { useState, useMemo } from 'react';
import { EncounterState, EncounterClass, EncounterPriority, ModeOfArrival, createEncounterLifecycle, transitionEncounter, computeEncounterStats, getEncountersByState, getActiveEncounters, ENCOUNTER_STATE_TRANSITIONS } from '@/lib/amexan/hmis/encounter-lifecycle';
import type { EncounterLifecycle } from '@/lib/amexan/hmis/encounter-lifecycle';

const MOCK_ENCOUNTERS: EncounterLifecycle[] = [
  createEncounterLifecycle('ENC-001', 'P-001', 'AMX-P-001', EncounterClass.Emergency, 'DEPT-001', EncounterPriority.Resuscitation, 'Chest pain and shortness of breath'),
  createEncounterLifecycle('ENC-002', 'P-002', 'AMX-P-002', EncounterClass.Outpatient, 'DEPT-002', EncounterPriority.Routine, 'Routine checkup'),
  createEncounterLifecycle('ENC-003', 'P-003', 'AMX-P-003', EncounterClass.Inpatient, 'DEPT-003', EncounterPriority.Urgent, 'Severe pneumonia with hypoxia'),
  createEncounterLifecycle('ENC-004', 'P-004', 'AMX-P-004', EncounterClass.FollowUp, 'DEPT-002', EncounterPriority.Routine, 'HTN follow-up'),
  createEncounterLifecycle('ENC-005', 'P-005', 'AMX-P-005', EncounterClass.Procedure, 'DEPT-004', EncounterPriority.Elective, 'Cataract surgery'),
];

// Simulate some transitions
transitionEncounter(MOCK_ENCOUNTERS[0], EncounterState.Registered, 'nurse-01', 'Walk-in registration');
transitionEncounter(MOCK_ENCOUNTERS[0], EncounterState.Triaged, 'nurse-02', 'ESI Level 1 - Resuscitation');
transitionEncounter(MOCK_ENCOUNTERS[0], EncounterState.Consultation, 'doc-01', 'Seen by ED physician');
transitionEncounter(MOCK_ENCOUNTERS[1], EncounterState.Registered, 'reception-01', 'Routine registration');
transitionEncounter(MOCK_ENCOUNTERS[1], EncounterState.Waiting, 'reception-01', 'In waiting room');
transitionEncounter(MOCK_ENCOUNTERS[2], EncounterState.Registered, 'nurse-01', 'Ambulance arrival');
transitionEncounter(MOCK_ENCOUNTERS[2], EncounterState.Triaged, 'nurse-02', 'NEWS2 score 7 - Urgent');
transitionEncounter(MOCK_ENCOUNTERS[2], EncounterState.Consultation, 'doc-02', 'Seen by physician');
transitionEncounter(MOCK_ENCOUNTERS[2], EncounterState.Admission, 'doc-02', 'Admitted to ICU');
transitionEncounter(MOCK_ENCOUNTERS[3], EncounterState.Registered, 'reception-01', 'Scheduled follow-up');
transitionEncounter(MOCK_ENCOUNTERS[4], EncounterState.Registered, 'reception-01', 'Pre-op registration');

const STATE_COLORS: Record<string, string> = {
  [EncounterState.Created]: '#64748B', [EncounterState.Registered]: '#3B82F6', [EncounterState.Triaged]: '#F59E0B',
  [EncounterState.Waiting]: '#F97316', [EncounterState.Consultation]: '#8B5CF6', [EncounterState.Investigating]: '#06B6D4',
  [EncounterState.Diagnosis]: '#10B981', [EncounterState.Treatment]: '#EC4899', [EncounterState.Observation]: '#14B8A6',
  [EncounterState.Procedure]: '#EAB308', [EncounterState.Admission]: '#EF4444', [EncounterState.Transferred]: '#A855F7',
  [EncounterState.Discharged]: '#22D3EE', [EncounterState.FollowUp]: '#34D399', [EncounterState.Closed]: '#475569',
  [EncounterState.Cancelled]: '#6B7280', [EncounterState.NoShow]: '#9CA3AF',
};

export default function EncountersPage() {
  const [encounters] = useState(MOCK_ENCOUNTERS);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<EncounterState | 'all'>('all');
  const [selectedEnc, setSelectedEnc] = useState<string | null>(null);

  const stats = useMemo(() => computeEncounterStats(encounters), [encounters]);

  const filtered = useMemo(() => {
    return encounters.filter(e => {
      if (stateFilter !== 'all' && e.state !== stateFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return e.id.toLowerCase().includes(q) || e.patientAmxUid.toLowerCase().includes(q) || e.context.chiefComplaint.toLowerCase().includes(q);
      }
      return true;
    });
  }, [encounters, search, stateFilter]);

  const activeEncounters = useMemo(() => getActiveEncounters(encounters), [encounters]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Encounter Lifecycle</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book IV — 17-state state machine with transitions, timing, triage, stats</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + New Encounter
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[{ label: 'Today Total', value: stats.totalToday, color: '#F59E0B' },
          { label: 'Active', value: activeEncounters.length, color: '#3B82F6' },
          { label: 'Avg Wait', value: `${stats.averageWaitMinutes}m`, color: '#06B6D4' },
          { label: 'Avg Consult', value: `${stats.averageConsultMinutes}m`, color: '#8B5CF6' },
          { label: 'Discharged', value: stats.dischargedToday, color: '#10B981' },
          { label: 'Admitted', value: stats.admittedToday, color: '#EF4444' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search by ID, patient, complaint..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value as EncounterState | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All States</option>
          {Object.values(EncounterState).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(enc => {
          const isSelected = selectedEnc === enc.id;
          const allowedTransitions = ENCOUNTER_STATE_TRANSITIONS[enc.state];
          return (
            <div
              key={enc.id}
              onClick={() => setSelectedEnc(isSelected ? null : enc.id)}
              style={{
                padding: 14, borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>
                    {enc.id} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{enc.encounterType}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{enc.context.chiefComplaint}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${STATE_COLORS[enc.state]}20`, color: STATE_COLORS[enc.state] }}>
                    {enc.state}
                  </span>
                  <span style={{ fontSize: 10, color: enc.priority === EncounterPriority.Resuscitation || enc.priority === EncounterPriority.Emergency ? '#EF4444' : '#64748B' }}>
                    {enc.priority}
                  </span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
                    <div><span style={{ fontSize: 11, color: '#64748B' }}>Patient: </span><span style={{ fontSize: 11, color: '#E2E8F0' }}>{enc.patientAmxUid}</span></div>
                    <div><span style={{ fontSize: 11, color: '#64748B' }}>Dept: </span><span style={{ fontSize: 11, color: '#E2E8F0' }}>{enc.departmentId}</span></div>
                    <div><span style={{ fontSize: 11, color: '#64748B' }}>Arrival: </span><span style={{ fontSize: 11, color: '#E2E8F0' }}>{enc.context.modeOfArrival}</span></div>
                    <div><span style={{ fontSize: 11, color: '#64748B' }}>Wait: </span><span style={{ fontSize: 11, color: '#E2E8F0' }}>{enc.timing.totalWaitMinutes ?? '—'}m</span></div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>State History</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {enc.stateHistory.map((t, i) => (
                      <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${STATE_COLORS[t.to]}20`, color: STATE_COLORS[t.to] }}>
                        {t.to}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', margin: '12px 0 6px' }}>Allowed Transitions</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {allowedTransitions.map(s => (
                      <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{s}</span>
                    ))}
                    {allowedTransitions.length === 0 && <span style={{ fontSize: 10, color: '#475569' }}>Terminal state</span>}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Flags</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {Object.entries(enc.flags).filter(([, v]) => v).map(([key]) => (
                        <span key={key} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: key === 'isEmergency' || key === 'isCriticallyIll' ? 'rgba(239,68,68,0.15)' : key === 'isIsolationRequired' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', color: key === 'isEmergency' || key === 'isCriticallyIll' ? '#EF4444' : key === 'isIsolationRequired' ? '#F59E0B' : '#94A3B8' }}>
                        {key.replace(/^is/, '')}
                      </span>
                      ))}
                    </div>
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
