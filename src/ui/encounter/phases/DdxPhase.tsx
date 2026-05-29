'use client';
import { useMemo } from 'react';
import { runInference } from '@/src/engine/inference/scorer';
import type { PatientForm } from '@/src/types';
import type { AIInsight } from '@/lib/encounterTypes';

const s: Record<string, React.CSSProperties> = {
  h: { fontSize: '1.125rem', fontWeight: 600, color: '#E2E8F0', marginBottom: 4 },
  sub: { fontSize: '.8125rem', color: '#64748B', marginBottom: 20 },
  card: { background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 20, marginBottom: 16 },
  label: { fontSize: '.6875rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 },
  inp: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', color: '#E2E8F0', fontSize: '.875rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' } as React.CSSProperties,
};

interface Props { form: PatientForm; setField: (p: string, v: any) => void; addInsight: (i: Partial<AIInsight>) => void; deptColor: string; }

export function DdxPhase({ form, setField, addInsight, deptColor }: Props) {
  const differentials = useMemo(() => runInference(form), [form]);

  return <>
    <div style={s.h}>Differential Diagnosis</div>
    <div style={s.sub}>AI-powered differential with evidence scoring and clinical reasoning</div>

    {differentials.length > 0 ? (
      <div style={s.card}>
        <div style={s.label}>Ranked Differentials</div>
        {differentials.map((d, i) => {
          const pct = Math.round(d.probability * 100);
          return (
            <div key={d.disease.id} style={{
              padding: '12px 0', borderBottom: i < differentials.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', background: i === 0 ? deptColor : 'rgba(255,255,255,.06)',
                  color: i === 0 ? '#070B14' : '#64748B', fontSize: '.6875rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: '.875rem', fontWeight: 500, color: '#E2E8F0' }}>{d.disease.name}</span>
                <div style={{ width: 80, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: i === 0 ? deptColor : i === 1 ? '#3B82F6' : '#F59E0B', borderRadius: 3, transition: 'width .5s' }} />
                </div>
                <span style={{ fontSize: '.75rem', fontWeight: 700, color: i === 0 ? deptColor : '#94A3B8', minWidth: 36, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
              </div>
              {/* Evidence tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginLeft: 36 }}>
                {d.evidence.historyHits.slice(0, 4).map((h: string, hi: number) => (
                  <span key={hi} style={{ padding: '2px 6px', borderRadius: 3, fontSize: '.5625rem', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.04)', color: '#64748B' }}>✓ {h}</span>
                ))}
                {(d.disease as any).keyRedFlags?.map((rf: string, ri: number) => (
                  <span key={ri} style={{ padding: '2px 6px', borderRadius: 3, fontSize: '.5625rem', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', color: '#FCA5A5' }}>🚨 {rf}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div style={s.card}>
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#475569', fontSize: '.8125rem' }}>
          No symptoms selected. Return to Presenting Complaint to begin.<br />
          <span style={{ fontSize: '.6875rem', color: '#334155' }}>AI differentials require at least one symptom to generate.</span>
        </div>
      </div>
    )}

    {/* ICD Codes */}
    {differentials.length > 0 && (
      <div style={s.card}>
        <div style={s.label}>ICD-11 Codes</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {differentials.slice(0, 5).map(d => (
            <span key={d.disease.id} style={{ padding: '4px 10px', borderRadius: 6, fontSize: '.6875rem', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>
              {d.disease.name}: {(d.disease as any).icd || '—'}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Working diagnosis */}
    <div style={s.card}>
      <div style={s.label}>Working Diagnosis & Notes</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>Working Diagnosis</div>
          <input style={s.inp} placeholder="Primary working diagnosis" value={form.summary.workingDx} onChange={e => setField('summary.workingDx', e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>DDx Notes</div>
          <input style={s.inp} placeholder="Clinical reasoning notes" value={form.summary.ddxNotes} onChange={e => setField('summary.ddxNotes', e.target.value)} />
        </div>
      </div>
    </div>
  </>;
}
