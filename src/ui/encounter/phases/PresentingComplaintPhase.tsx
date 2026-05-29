'use client';
import { useState, useMemo } from 'react';
import { ALL_SYMPTOMS } from '@/src/engine/knowledge-graph/reference';
import type { PatientForm } from '@/src/types';
import type { DocumentEvent, AIInsight } from '@/lib/encounterTypes';

const SYMPTOM_CATEGORIES: Record<string, string[]> = {
  respiratory: ['cough','wheeze','stridor','difficulty_breathing','chest_indrawing','cyanosis','fast_breathing','noisy_breathing','chest_tightness','hemoptysis','nasal_discharge'],
  infective: ['fever','lethargy','night_sweats','weight_loss','rash'],
  severe: ['cyanosis','chest_indrawing','stridor','difficulty_breathing','apnoea','drooling','tripod_posture','altered_consciousness'],
  neurological: ['convulsions','altered_consciousness','seizures','headache','visual_disturbance'],
  gastrointestinal: ['vomiting','diarrhoea','abdominal_pain','constipation','nausea','dysphagia','hematemesis','melena'],
  cardiovascular: ['chest_pain','palpitations','syncope','oedema','dyspnoea_exertion','orthopnoea','pnd'],
  musculoskeletal: ['joint_pain','joint_swelling','muscle_weakness','back_pain','neck_stiffness'],
  other: [],
};

const CAT_ORDER = ['severe','respiratory','infective','neurological','cardiovascular','gastrointestinal','musculoskeletal','other'];

function categorize(id: string): string {
  for (const [cat, ids] of Object.entries(SYMPTOM_CATEGORIES)) { if (ids.includes(id)) return cat; }
  return 'other';
}

const t: Record<string, React.CSSProperties> = {
  h: { fontSize: '1.125rem', fontWeight: 600, color: '#E2E8F0', marginBottom: 4 },
  sub: { fontSize: '.8125rem', color: '#64748B', marginBottom: 20 },
  card: { background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 20, marginBottom: 16 },
  label: { fontSize: '.6875rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', color: '#E2E8F0', fontSize: '.875rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' } as React.CSSProperties,
};

interface Props { form: PatientForm; setField: (p: string, v: any) => void; toggleArray: (p: string, i: string) => void; addEvent: (e: Partial<DocumentEvent>) => void; addInsight: (i: Partial<AIInsight>) => void; deptColor: string; }

export function PresentingComplaintPhase({ form, setField, toggleArray, addEvent, deptColor }: Props) {
  const [symptomOrder, setSymptomOrder] = useState<string[]>(() => [...form.complaints]);
  const orderedList = useMemo(() => {
    const unique = [...new Set(form.complaints)];
    const existing = [...new Set(symptomOrder.filter(id => unique.includes(id)))];
    const newIds = unique.filter(id => !existing.includes(id));
    return [...existing, ...newIds];
  }, [form.complaints, symptomOrder]);

  const grouped = useMemo(() => {
    const groups: Record<string, string[]> = {};
    orderedList.forEach(id => { const c = categorize(id); if (!groups[c]) groups[c] = []; groups[c].push(id); });
    return groups;
  }, [orderedList]);

  const selectSymptom = (symId: string) => {
    toggleArray('complaints', symId);
    if (!form.complaints.includes(symId)) {
      setSymptomOrder(prev => [...prev, symId]);
      addEvent({ type: 'hpi_entered', description: `Symptom added: ${ALL_SYMPTOMS.find(s => s.id === symId)?.label || symId}` });
    } else {
      setSymptomOrder(prev => prev.filter(id => id !== symId));
    }
  };

  const moveSymptom = (id: string, dir: 'up' | 'down') => {
    const idx = orderedList.indexOf(id);
    if (idx === -1) return;
    const next = [...orderedList];
    if (dir === 'up' && idx > 0) { [next[idx-1], next[idx]] = [next[idx], next[idx-1]]; }
    else if (dir === 'down' && idx < orderedList.length - 1) { [next[idx+1], next[idx]] = [next[idx], next[idx+1]]; }
    setSymptomOrder(next);
  };

  const symptomBtns = (symId: string) => {
    const sym = ALL_SYMPTOMS.find(s => s.id === symId);
    if (!sym) return null;
    const sel = form.complaints.includes(symId);
    return (
      <button key={symId} onClick={() => selectSymptom(symId)}
        style={{
          padding: '8px 12px', borderRadius: 8, textAlign: 'left', cursor: 'pointer', fontSize: '.8125rem',
          border: `1px solid ${sel ? (sym.warn ? '#EF444480' : `${deptColor}50`) : 'rgba(255,255,255,.08)'}`,
          background: sel ? (sym.warn ? 'rgba(239,68,68,.1)' : `${deptColor}15`) : 'rgba(255,255,255,.02)',
          color: sel ? (sym.warn ? '#FCA5A5' : '#E2E8F0') : '#94A3B8',
          fontWeight: sel ? 500 : 400, transition: 'all .12s', fontFamily: 'Inter, sans-serif',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
        <span style={{
          width: 14, height: 14, borderRadius: 3, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid ${sel ? (sym.warn ? '#EF4444' : deptColor) : 'rgba(255,255,255,.15)'}`,
          background: sel ? (sym.warn ? '#EF4444' : deptColor) : 'transparent', fontSize: 8, color: 'white',
        }}>{sel ? '✓' : ''}</span>
        {sym.label}
        {sym.warn && <span style={{ fontSize: '.5625rem', color: '#EF4444', marginLeft: 'auto' }}>⚠</span>}
      </button>
    );
  };

  return <>
    <div style={t.h}>Presenting Complaint</div>
    <div style={t.sub}>Select all symptoms in chronological order. High-priority symptoms are grouped first.</div>

    <div style={t.card}>
      <div style={t.label}>Select Symptoms — click in order of appearance</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CAT_ORDER.map(cat => {
          const symptomsInCat = (SYMPTOM_CATEGORIES[cat] || []).filter(id => ALL_SYMPTOMS.find(s => s.id === id));
          if (symptomsInCat.length === 0) return null;
          const catLabels: Record<string, string> = { severe:'🚨 Emergency Signs', respiratory:'Respiratory', infective:'Infective', neurological:'Neurological', cardiovascular:'Cardiovascular', gastrointestinal:'Gastrointestinal', musculoskeletal:'Musculoskeletal', other:'Other' };
          return (
            <div key={cat}>
              <div style={{ fontSize: '.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#475569', marginBottom: 6 }}>
                {catLabels[cat] || cat}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {symptomsInCat.map(symptomBtns)}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {orderedList.length > 0 && (
      <div style={t.card}>
        <div style={t.label}>Illness Timeline — reorder with arrows (earliest first)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {orderedList.map((id, idx) => {
            const sym = ALL_SYMPTOMS.find(s => s.id === id);
            return (
              <div key={id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                borderRadius: 8, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', background: deptColor, color: '#070B14',
                  fontSize: '.6875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{idx + 1}</span>
                <span style={{ flex: 1, fontSize: '.8125rem', color: '#E2E8F0' }}>{sym?.label || id}</span>
                <input style={{
                  width: 100, padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,.06)',
                  background: 'rgba(255,255,255,.02)', color: '#94A3B8', fontSize: '.6875rem', outline: 'none', fontFamily: 'Inter, sans-serif',
                }} placeholder="Duration" value={form.complaintDurations[id] || ''}
                  onChange={e => setField('complaintDurations', { ...form.complaintDurations, [id]: e.target.value })} />
                <button onClick={() => moveSymptom(id, 'up')} disabled={idx === 0}
                  style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid rgba(255,255,255,.06)', background: 'transparent', color: idx === 0 ? '#334155' : '#64748B', cursor: idx === 0 ? 'default' : 'pointer', fontSize: '.625rem', fontFamily: 'Inter, sans-serif' }}>▲</button>
                <button onClick={() => moveSymptom(id, 'down')} disabled={idx === orderedList.length - 1}
                  style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid rgba(255,255,255,.06)', background: 'transparent', color: idx === orderedList.length - 1 ? '#334155' : '#64748B', cursor: idx === orderedList.length - 1 ? 'default' : 'pointer', fontSize: '.625rem', fontFamily: 'Inter, sans-serif' }}>▼</button>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </>;
}
