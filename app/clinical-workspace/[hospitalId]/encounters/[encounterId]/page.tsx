'use client';
import { useParams, useRouter } from 'next/navigation';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';

const ENCOUNTER_PHASES = ['Triage', 'History', 'Exam', 'DDx', 'Investigations', 'Diagnosis', 'Treatment', 'Plan'];

export default function EncounterDetailPage() {
  const params = useParams();
  const hospitalId = params?.hospitalId as string;
  const encounterId = params?.encounterId as string;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl">
      <div className="frost-card p-5">
        <div className="flex items-start gap-3 mb-5">
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: 'rgba(6,182,212,0.12)', color: '#06B6D4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700,
          }}>
            #
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>
              Encounter {encounterId}
            </h1>
            <p style={{ fontSize: 12, color: '#64748B' }}>
              Opened 28 May 2026 · Cardiology · Patient P001
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6" style={{ overflowX: 'auto', paddingBottom: 4 }}>
          {ENCOUNTER_PHASES.map((phase, i) => (
            <div
              key={phase}
              style={{
                padding: '6px 14px', borderRadius: 999, whiteSpace: 'nowrap',
                fontSize: 11, fontWeight: 600,
                background: i <= 2 ? 'rgba(0,214,143,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i <= 2 ? 'rgba(0,214,143,0.2)' : 'rgba(255,255,255,0.06)'}`,
                color: i <= 2 ? '#00D68F' : '#64748B',
              }}
            >
              {i <= 2 && '✓ '}{phase}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="frost-card-sm p-4">
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Vitals</div>
            {[
              { label: 'BP', value: '128/82' },
              { label: 'HR', value: '72' },
              { label: 'RR', value: '16' },
              { label: 'SpO₂', value: '98%' },
              { label: 'Temp', value: '36.8°C' },
            ].map(v => (
              <div key={v.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ color: '#64748B' }}>{v.label}</span>
                <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{v.value}</span>
              </div>
            ))}
          </div>

          <div className="frost-card-sm p-4">
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Differential Diagnoses</div>
            {[
              { dx: 'Hypertension Stage 2', pct: 85 },
              { dx: 'White Coat HTN', pct: 25 },
              { dx: 'Secondary HTN', pct: 10 },
            ].map(d => (
              <div key={d.dx} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: '#E2E8F0' }}>{d.dx}</span>
                  <span style={{ color: '#06B6D4', fontWeight: 600 }}>{d.pct}%</span>
                </div>
                <div style={{ width: '100%', height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${d.pct}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#06B6D4,#00D68F)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          style={{
            padding: '8px 16px', borderRadius: 6, border: 'none',
            background: 'linear-gradient(135deg,#06B6D4,#0891B2)',
            color: '#fff', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}
        >
          ✏️ Update Phase
        </button>
        <button
          style={{
            padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}
        >
          📄 Generate Summary
        </button>
      </div>
    </div>
  );
}
