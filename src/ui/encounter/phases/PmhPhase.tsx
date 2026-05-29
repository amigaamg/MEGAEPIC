'use client';
import { useState } from 'react';
import type { PatientForm } from '@/src/types';
import type { DocumentEvent } from '@/lib/encounterTypes';

const s: Record<string, React.CSSProperties> = {
  h: { fontSize: '1.125rem', fontWeight: 600, color: '#E2E8F0', marginBottom: 4 },
  sub: { fontSize: '.8125rem', color: '#64748B', marginBottom: 20 },
  card: { background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 20, marginBottom: 16 },
  label: { fontSize: '.6875rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 },
  inp: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', color: '#E2E8F0', fontSize: '.875rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' } as React.CSSProperties,
  chip: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, fontSize: '.75rem', border: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)', color: '#94A3B8', cursor: 'pointer', margin: '0 4px 6px 0' },
  btn: { padding: '8px 16px', borderRadius: 8, border: '1px dashed rgba(255,255,255,.08)', background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '.75rem', fontFamily: 'Inter, sans-serif', alignSelf: 'flex-start' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 },
};

interface Condition { id: string; name: string; diagnosedYear: string; severity: string; currentStatus: string; }
interface Surgery { id: string; procedure: string; year: string; indication: string; }
interface Props { form: PatientForm; setField: (p: string, v: any) => void; addEvent: (e: Partial<DocumentEvent>) => void; deptColor: string; }

export function PmhPhase({ form, setField, addEvent, deptColor }: Props) {
  const conditions: Condition[] = (form.pmh as any).conditions || [];
  const surgeries: Surgery[] = (form.pmh as any).surgeries || [];

  const addCondition = () => {
    const newCond: Condition = { id: Date.now().toString(), name: '', diagnosedYear: '', severity: 'unknown', currentStatus: 'active' };
    setField('pmh.conditions', [...conditions, newCond]);
  };
  const updateCondition = (id: string, updates: Partial<Condition>) =>
    setField('pmh.conditions', conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  const removeCondition = (id: string) =>
    setField('pmh.conditions', conditions.filter(c => c.id !== id));

  const addSurgery = () => {
    const newSurg: Surgery = { id: Date.now().toString(), procedure: '', year: '', indication: '' };
    setField('pmh.surgeries', [...surgeries, newSurg]);
  };
  const updateSurgery = (id: string, updates: Partial<Surgery>) =>
    setField('pmh.surgeries', surgeries.map(s => s.id === id ? { ...s, ...updates } : s));
  const removeSurgery = (id: string) =>
    setField('pmh.surgeries', surgeries.filter(s => s.id !== id));

  const quickAdd = (ill: string) => {
    if (!conditions.some(c => c.name === ill)) {
      setField('pmh.conditions', [...conditions, { id: Date.now().toString(), name: ill, diagnosedYear: '', severity: 'unknown', currentStatus: 'active' }]);
      addEvent({ type: 'note_added', description: `PMH: ${ill} added` });
    }
  };

  return <>
    <div style={s.h}>Past Medical History</div>
    <div style={s.sub}>Structured chronic conditions, surgical history, allergies, and medications</div>

    {/* NIL History */}
    <div style={s.card}>
      <div style={s.label}>NIL History — confirm absence</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {[{l:'No chronic illnesses',k:'pmh.noChronicIllness'},{l:'No previous surgeries',k:'pmh.noSurgeries'},{l:'No known allergies',k:'pmh.noAllergies'}].map(n => (
          <button key={n.k} onClick={() => { const keys = n.k.split('.'); setField(keys[1], !(form.pmh as any)[keys[1]]); }}
            style={{ ...s.chip, ...((form.pmh as any)[n.k.split('.')[1]] ? { background: 'rgba(16,185,129,.15)', borderColor: '#10B98150', color: '#34D399' } : {}) }}>{n.l}</button>
        ))}
      </div>
    </div>

    {/* Chronic Conditions */}
    <div style={s.card}>
      <div style={s.label}>Chronic Medical Conditions</div>
      {conditions.map(c => (
        <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          <input style={{ ...s.inp, flex: 2, padding: '6px 10px', fontSize: '.8125rem' }} placeholder="Condition name" value={c.name} onChange={e => updateCondition(c.id, { name: e.target.value })} />
          <input style={{ ...s.inp, width: 70, padding: '6px 10px', fontSize: '.8125rem' }} placeholder="Year" value={c.diagnosedYear} onChange={e => updateCondition(c.id, { diagnosedYear: e.target.value })} />
          <select style={{ ...s.inp, width: 'auto', padding: '6px 10px', fontSize: '.75rem', cursor: 'pointer' }} value={c.severity} onChange={e => updateCondition(c.id, { severity: e.target.value })}>
            <option value="unknown">Severity</option><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option>
          </select>
          <button onClick={() => removeCondition(c.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '.875rem', padding: 4 }}>✕</button>
        </div>
      ))}
      {conditions.length === 0 && !(form.pmh as any).noChronicIllness && (
        <div style={{ fontSize: '.75rem', color: '#475569', textAlign: 'center', padding: 12 }}>No conditions recorded.</div>
      )}
      <button onClick={addCondition} style={s.btn}>+ Add Condition</button>
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: '.625rem', color: '#475569', marginBottom: 6 }}>Quick-add common conditions:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {['Asthma','Diabetes','Hypertension','Epilepsy','HIV','Sickle Cell','CHD'].map(ill => (
            <button key={ill} onClick={() => quickAdd(ill)} style={{ ...s.chip, fontSize: '.6875rem', padding: '3px 8px' }}>{ill}</button>
          ))}
        </div>
      </div>
    </div>

    {/* Surgeries */}
    <div style={s.card}>
      <div style={s.label}>Surgical History</div>
      {surgeries.map(sg => (
        <div key={sg.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          <input style={{ ...s.inp, flex: 2, padding: '6px 10px', fontSize: '.8125rem' }} placeholder="Procedure" value={sg.procedure} onChange={e => updateSurgery(sg.id, { procedure: e.target.value })} />
          <input style={{ ...s.inp, width: 70, padding: '6px 10px', fontSize: '.8125rem' }} placeholder="Year" value={sg.year} onChange={e => updateSurgery(sg.id, { year: e.target.value })} />
          <button onClick={() => removeSurgery(sg.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '.875rem', padding: 4 }}>✕</button>
        </div>
      ))}
      <button onClick={addSurgery} style={s.btn}>+ Add Surgery</button>
    </div>

    {/* Allergies & Medications */}
    <div style={s.card}>
      <div style={s.label}>Allergies & Medications</div>
      <div style={s.grid}>
        <div>
          <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>Allergies</div>
          <input style={s.inp} placeholder="e.g. Penicillin, NSAIDs" value={form.pmh.allergies} onChange={e => setField('pmh.allergies', e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: '.6875rem', color: '#64748B', marginBottom: 6 }}>Current Medications</div>
          <input style={s.inp} placeholder="e.g. Salbutamol PRN, Metformin 1g BD" value={form.pmh.medications} onChange={e => setField('pmh.medications', e.target.value)} />
        </div>
      </div>
    </div>
  </>;
}
