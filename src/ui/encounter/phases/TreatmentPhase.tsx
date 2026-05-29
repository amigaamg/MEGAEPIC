'use client';
import { useMemo } from 'react';
import { runInference } from '@/src/engine/inference/scorer';
import { generateManagementPlan } from '@/src/engine/inference/managementPlanGenerator';
import type { PatientForm } from '@/src/types';
import type { DocumentEvent } from '@/lib/encounterTypes';
import { DISEASE_PROTOCOLS, type DiseaseProtocol } from '@/lib/clinicalProtocols';

const s: Record<string, React.CSSProperties> = {
  h: { fontSize: '1.125rem', fontWeight: 600, color: '#E2E8F0', marginBottom: 4 },
  sub: { fontSize: '.8125rem', color: '#64748B', marginBottom: 20 },
  card: { background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 20, marginBottom: 16 },
  label: { fontSize: '.6875rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 },
  inp: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', color: '#E2E8F0', fontSize: '.875rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' } as React.CSSProperties,
  ta: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', color: '#E2E8F0', fontSize: '.875rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', minHeight: 60, resize: 'vertical' } as React.CSSProperties,
};

interface Props { form: PatientForm; setField: (p: string, v: any) => void; addEvent: (e: Partial<DocumentEvent>) => void; deptColor: string; }

export function TreatmentPhase({ form, setField, addEvent, deptColor }: Props) {
  const differentials = useMemo(() => runInference(form), [form]);
  const plan = useMemo(() => {
    try { return generateManagementPlan(form, differentials); } catch { return null; }
  }, [form, differentials]);

  // Look up relevant protocols
  const matchedProtocols = useMemo(() => {
    const matched: DiseaseProtocol[] = [];
    differentials.slice(0, 3).forEach(d => {
      const icd = (d.disease as any).icd || '';
      const proto = Object.values(DISEASE_PROTOCOLS).find(p => d.disease.name.toLowerCase().includes(p.name.toLowerCase()));
      if (proto && !matched.includes(proto)) matched.push(proto);
    });
    return matched;
  }, [differentials]);

  return <>
    <div style={s.h}>Treatment Plan</div>
    <div style={s.sub}>Evidence-based management with protocol-aligned guidance</div>

    {/* Medications */}
    <div style={s.card}>
      <div style={s.label}>Medication Orders</div>
      {plan && plan.diagnosisSpecific.map((dx, i) => (
        <div key={i} style={{ padding: '8px 0', borderBottom: i < plan.diagnosisSpecific.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
          <div style={{ fontSize: '.8125rem', fontWeight: 600, color: '#E2E8F0', marginBottom: 6 }}>{dx.diseaseName}</div>
          {dx.prescriptions && dx.prescriptions.map((rx, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, padding: '6px 8px', background: 'rgba(255,255,255,.02)', borderRadius: 6, marginBottom: 4, fontSize: '.75rem', alignItems: 'center' }}>
              <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{(rx as any).medication}</span>
              <span style={{ color: '#64748B' }}>{(rx as any).dose} {rx.route} {rx.frequency}</span>
              <span style={{ color: '#475569', fontSize: '.6875rem' }}>{rx.duration}</span>
            </div>
          ))}
          {dx.steps.map((step, si) => (
            <div key={si} style={{ fontSize: '.75rem', color: '#64748B', padding: '3px 0 3px 12px', borderLeft: `2px solid ${deptColor}30`, marginBottom: 2 }}>
              {step}
            </div>
          ))}
        </div>
      ))}
      {!plan && (
        <div style={{ fontSize: '.75rem', color: '#475569', textAlign: 'center', padding: 16 }}>
          No management plan generated. Complete HPI and DDx phases first.
        </div>
      )}
    </div>

    {/* Investigations */}
    {plan && plan.investigations.length > 0 && (
      <div style={s.card}>
        <div style={s.label}>Investigations</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {plan.investigations.map((inv, i) => (
            <span key={i} style={{ padding: '5px 12px', borderRadius: 100, fontSize: '.75rem', border: `1px solid ${deptColor}25`, background: `${deptColor}10`, color: '#94A3B8' }}>{inv}</span>
          ))}
        </div>
      </div>
    )}

    {/* Clinical Protocols */}
    {matchedProtocols.length > 0 && (
      <div style={s.card}>
        <div style={s.label}>📋 Active Clinical Protocols</div>
        {matchedProtocols.map(p => (
          <div key={p.name} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ fontSize: '.8125rem', fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>{p.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {p.stepProtocol.slice(0, 3).map((st, si) => (
                <span key={si} style={{ padding: '2px 8px', borderRadius: 4, fontSize: '.625rem', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', color: '#64748B' }}>{st}</span>
              ))}
              {p.stepProtocol.length > 3 && <span style={{ fontSize: '.625rem', color: '#475569' }}>+{p.stepProtocol.length - 3} more</span>}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Supportive care & monitoring */}
    {plan && (
      <div style={s.card}>
        <div style={s.label}>Supportive Care & Monitoring</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>Supportive Care</div>
            <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: '.75rem', color: '#64748B', lineHeight: 1.8 }}>
              {plan.supportiveCare.map((sc, i) => <li key={i}>{sc}</li>)}
            </ul>
          </div>
          <div>
            <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>Monitoring</div>
            <div style={{ fontSize: '.75rem', color: '#64748B', lineHeight: 1.6 }}>{plan.monitoring}</div>
            <div style={{ fontSize: '.6875rem', color: '#475569', marginTop: 8 }}>Follow-up: {plan.followUp}</div>
          </div>
        </div>
      </div>
    )}

    {/* Free-text plan */}
    <div style={s.card}>
      <div style={s.label}>Additional Notes</div>
      <textarea style={s.ta} placeholder="Additional treatment notes, special considerations, or patient instructions..."
        value={(form.management as any)?.treatmentNotes || ''} onChange={e => setField('management.treatmentNotes', e.target.value)} />
    </div>
  </>;
}
