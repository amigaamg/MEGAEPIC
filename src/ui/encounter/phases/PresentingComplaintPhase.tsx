'use client';
import { useState, useMemo } from 'react';
import { useTheme } from '../../themes/ThemeProvider';
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

interface Props { form: PatientForm; setField: (p: string, v: any) => void; toggleArray: (p: string, i: string) => void; addEvent: (e: Partial<DocumentEvent>) => void; addInsight: (i: Partial<AIInsight>) => void; deptColor: string; }

export function PresentingComplaintPhase({ form, setField, toggleArray, addEvent, deptColor }: Props) {
  const theme = useTheme();
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

  const s = {
    header: { fontSize: '1.125rem', fontWeight: 600, color: theme.colors.text, marginBottom: 4 },
    sub: { fontSize: '.8125rem', color: theme.colors.textMuted, marginBottom: 20 },
    card: { background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 10, padding: 20, marginBottom: 16 },
    label: { fontSize: '.6875rem', fontWeight: 600, color: theme.colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: '.08em' as const, marginBottom: 8 },
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.colors.borderStrong}`, background: theme.colors.bg, color: theme.colors.text, fontSize: '.875rem', outline: 'none', fontFamily: theme.typography.font, boxSizing: 'border-box' as const },
  };

  const symptomBtns = (symId: string) => {
    const sym = ALL_SYMPTOMS.find(s => s.id === symId);
    if (!sym) return null;
    const sel = form.complaints.includes(symId);
    return (
      <button key={symId} onClick={() => selectSymptom(symId)}
        style={{
          padding: '8px 12px', borderRadius: 8, textAlign: 'left', cursor: 'pointer', fontSize: '.8125rem',
          border: `1px solid ${sel ? (sym.warn ? '#EF444480' : `${deptColor}50`) : theme.colors.border}`,
          background: sel ? (sym.warn ? theme.colors.dangerBg : `${deptColor}15`) : theme.colors.surfaceAlt,
          color: sel ? (sym.warn ? theme.colors.danger : theme.colors.text) : theme.colors.textSub,
          fontWeight: sel ? 500 : 400, transition: 'all .12s', fontFamily: theme.typography.font,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
        <span style={{
          width: 14, height: 14, borderRadius: 3, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid ${sel ? (sym.warn ? theme.colors.danger : deptColor) : theme.colors.borderStrong}`,
          background: sel ? (sym.warn ? theme.colors.danger : deptColor) : 'transparent', fontSize: 8, color: '#fff',
        }}>{sel ? '✓' : ''}</span>
        {sym.label}
        {sym.warn && <span style={{ fontSize: '.5625rem', color: theme.colors.danger, marginLeft: 'auto' }}>⚠</span>}
      </button>
    );
  };

  return <>
    <div style={s.header}>Presenting Complaint</div>
    <div style={s.sub}>Select all symptoms in chronological order. High-priority symptoms are grouped first.</div>

    <div style={s.card}>
      <div style={s.label}>Select Symptoms — click in order of appearance</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CAT_ORDER.map(cat => {
          const symptomsInCat = (SYMPTOM_CATEGORIES[cat] || []).filter(id => ALL_SYMPTOMS.find(s => s.id === id));
          if (symptomsInCat.length === 0) return null;
          const catLabels: Record<string, string> = { severe:'🚨 Emergency Signs', respiratory:'Respiratory', infective:'Infective', neurological:'Neurological', cardiovascular:'Cardiovascular', gastrointestinal:'Gastrointestinal', musculoskeletal:'Musculoskeletal', other:'Other' };
          return (
            <div key={cat}>
              <div style={{ fontSize: '.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: theme.colors.textMuted, marginBottom: 6 }}>
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
      <div style={s.card}>
        <div style={s.label}>Illness Timeline — reorder with arrows (earliest first)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {orderedList.map((id, idx) => {
            const sym = ALL_SYMPTOMS.find(s => s.id === id);
            return (
              <div key={id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                borderRadius: 8, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', background: deptColor, color: '#fff',
                  fontSize: '.6875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{idx + 1}</span>
                <span style={{ flex: 1, fontSize: '.8125rem', color: theme.colors.text }}>{sym?.label || id}</span>
                <input style={{
                  width: 100, padding: '4px 8px', borderRadius: 4, border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.bg, color: theme.colors.textSub, fontSize: '.6875rem', outline: 'none', fontFamily: theme.typography.font,
                }} placeholder="Duration" value={form.complaintDurations[id] || ''}
                  onChange={e => setField('complaintDurations', { ...form.complaintDurations, [id]: e.target.value })} />
                <button onClick={() => moveSymptom(id, 'up')} disabled={idx === 0}
                  style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.colors.border}`, background: 'transparent', color: idx === 0 ? theme.colors.textMuted : theme.colors.textSub, cursor: idx === 0 ? 'default' : 'pointer', fontSize: '.625rem', fontFamily: theme.typography.font }}>▲</button>
                <button onClick={() => moveSymptom(id, 'down')} disabled={idx === orderedList.length - 1}
                  style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.colors.border}`, background: 'transparent', color: idx === orderedList.length - 1 ? theme.colors.textMuted : theme.colors.textSub, cursor: idx === orderedList.length - 1 ? 'default' : 'pointer', fontSize: '.625rem', fontFamily: theme.typography.font }}>▼</button>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </>;
}
