'use client';
import { useMemo } from 'react';
import { runInference } from '@/src/engine/inference/scorer';
import { buildHPI } from '@/src/engine/inference/clinicalNoteBuilder';
import type { PatientForm } from '@/src/types';
import type { DocumentEvent, AIInsight } from '@/lib/encounterTypes';

const h: Record<string, React.CSSProperties> = {
  header: { fontSize: '1.125rem', fontWeight: 600, color: '#E2E8F0', marginBottom: 4 },
  sub: { fontSize: '.8125rem', color: '#64748B', marginBottom: 20 },
  card: { background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 20, marginBottom: 16 },
  label: { fontSize: '.6875rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 },
  inp: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', color: '#E2E8F0', fontSize: '.875rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' } as React.CSSProperties,
  chip: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 100, fontSize: '.75rem', border: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)', color: '#94A3B8', cursor: 'pointer', margin: '0 4px 6px 0', transition: 'all .12s' },
};

interface Props { form: PatientForm; setField: (p: string, v: any) => void; addEvent: (e: Partial<DocumentEvent>) => void; addInsight: (i: Partial<AIInsight>) => void; deptColor: string; }

export function HpiPhase({ form, setField, addEvent, addInsight, deptColor }: Props) {
  const differentials = useMemo(() => runInference(form), [form]);
  const narrative = useMemo(() => {
    try { return buildHPI(form, differentials); } catch { return ''; }
  }, [form, differentials]);

  // Derive red flags from form state
  const redFlags = useMemo(() => {
    const flags: string[] = [];
    if (form.hpi.chestIndrawing) flags.push('Chest indrawing');
    if (form.hpi.drooling && form.hpi.tripodPosition) flags.push('Epiglottitis (drooling + tripod)');
    if (form.hpi.suddenOnset && form.hpi.unilateralWheeze) flags.push('Foreign body aspiration');
    if (form.hpi.cyanoticEpisodes) flags.push('Cyanotic episodes');
    if (form.hpi.feedingDiff && form.hpi.chestIndrawing) flags.push('Severe pneumonia');
    return flags;
  }, [form]);

  const topDiff = differentials.slice(0, 3);

  return <>
    <div style={h.header}>History of Presenting Illness</div>
    <div style={h.sub}>Consultant-level structured HPI with real-time AI narrative</div>

    {/* Auto-generated narrative */}
    {narrative && (
      <div style={h.card}>
        <div style={h.label}>📖 HPI Narrative (AI-generated)</div>
        <div style={{ fontSize: '.8125rem', lineHeight: 1.7, color: '#E2E8F0', fontStyle: 'italic', fontWeight: 400 }}>{narrative}</div>
      </div>
    )}

    {/* Red flags */}
    {redFlags.length > 0 && (
      <div style={{ ...h.card, border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.06)' }}>
        <div style={{ ...h.label, color: '#FCA5A5' }}>🚨 Red Flags</div>
        <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '.8125rem', color: '#FCA5A5' }}>
          {redFlags.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>
    )}

    {/* Onset & progression */}
    <div style={h.card}>
      <div style={h.label}>Onset & Progression</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>Overall Onset</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Sudden', 'Gradual'].map(o => (
              <button key={o} onClick={() => { setField('hpi.onsetType', o.toLowerCase()); addEvent({ type: 'hpi_entered', description: `Onset type: ${o}` }); }}
                style={{ ...h.chip, ...(form.hpi.onsetType === o.toLowerCase() ? { background: `${deptColor}20`, borderColor: deptColor, color: deptColor } : {}) }}>{o}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>Progression</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Worsening', 'Improving', 'Fluctuating', 'Static'].map(p => (
              <button key={p} onClick={() => setField('hpi.progression', p.toLowerCase())}
                style={{ ...h.chip, ...(form.hpi.progression === p.toLowerCase() ? { background: `${deptColor}20`, borderColor: deptColor, color: deptColor } : {}) }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Deep-dive characteristics */}
    <div style={h.card}>
      <div style={h.label}>Symptom Characterisation</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { l: 'Cough Character', k: 'hpi.coughChar', o: ['Dry','Productive','Barking','Paroxysmal','None'] },
          { l: 'Sputum', k: 'hpi.sputum', o: ['Clear','Purulent','Bloody','None'] },
          { l: 'Fever Pattern', k: 'hpi.feverPattern', o: ['Continuous','Intermittent','Remittent','No fever'] },
          { l: 'Breathing Difficulty', k: 'hpi.breathingDifficulty', o: ['Mild','Moderate','Severe','None'] },
          { l: 'Feeding', k: 'hpi.feedingStatus', o: ['Normal','Reduced','Unable','Vomiting'] },
          { l: 'Sleep', k: 'hpi.sleepStatus', o: ['Normal','Disturbed','Severely disturbed'] },
        ].map(f => (
          <div key={f.k}>
            <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>{f.l}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {f.o.map(o => {
                const current = f.k.split('.').reduce((obj: any, key) => obj?.[key], form);
                return (
                  <button key={o} onClick={() => {
                    const keys = f.k.split('.');
                    if (keys.length === 2) setField(keys[1], o.toLowerCase());
                    addEvent({ type: 'hpi_entered', description: `${f.l}: ${o}` });
                  }}
                    style={{ ...h.chip, fontSize: '.6875rem', padding: '3px 10px', ...(current === o.toLowerCase() ? { background: `${deptColor}20`, borderColor: deptColor, color: deptColor } : {}) }}>{o}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>Additional Narrative Details</div>
        <textarea style={{ ...h.inp, minHeight: 64, resize: 'vertical' } as React.CSSProperties}
          placeholder="Free-text: prior treatments, healthcare seeking, additional context..."
          value={form.hpi.associated} onChange={e => setField('hpi.associated', e.target.value)} />
      </div>
    </div>

    {/* Live differential panel */}
    {topDiff.length > 0 && (
      <div style={h.card}>
        <div style={h.label}>🧠 Live Working Differential</div>
        {topDiff.map((d, i) => (
          <div key={d.disease.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
            borderBottom: i < topDiff.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%', background: i === 0 ? deptColor : 'rgba(255,255,255,.06)',
              color: i === 0 ? '#070B14' : '#64748B', fontSize: '.625rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: '.8125rem', color: '#E2E8F0' }}>{d.disease.name}</span>
            <div style={{ width: 60, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.round(d.probability * 100)}%`, height: '100%', background: deptColor, borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: '.6875rem', fontWeight: 600, color: deptColor, minWidth: 32, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
              {Math.round(d.probability * 100)}%
            </span>
          </div>
        ))}
      </div>
    )}

    {/* Prior treatment */}
    <div style={h.card}>
      <div style={h.label}>Prior Treatment & Healthcare Seeking</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>Treatment Received</div>
          <input style={h.inp} placeholder="e.g. Paracetamol, Ceftriaxone IM" value={form.hpi.prevTx} onChange={e => setField('hpi.prevTx', e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>Response</div>
          <input style={h.inp} placeholder="e.g. Partial improvement" value={form.hpi.txResponse} onChange={e => setField('hpi.txResponse', e.target.value)} />
        </div>
      </div>
    </div>
  </>;
}
