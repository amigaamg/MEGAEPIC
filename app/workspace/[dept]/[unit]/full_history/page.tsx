'use client';
import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ThemeProvider, useTheme } from '@/src/ui/themes/ThemeProvider';
import { MainLayout } from '@/src/ui/layouts/MainLayout';
import { usePatientStore } from '@/src/state/patientStore';
import { useUIStore } from '@/src/state/uiStore';
import { computeScores, getSeverity, runInference } from '@/src/engine/inference/scorer';
import { buildClinicalNote, buildHPI } from '@/src/engine/inference/clinicalNoteBuilder';
import { generateManagementPlan } from '@/src/engine/inference/managementPlanGenerator';
import type { ManagementPlan } from '@/src/types';
import { AdaptiveGuide } from '@/src/ui/components/AdaptiveGuide';
import { AGE_BANDS, ALL_SYMPTOMS } from '@/src/engine/knowledge-graph/reference';
import { PatientForm, INIT_FORM } from '@/src/types';
import { PrescriptionForm } from '@/components/PrescriptionForm';
import { TreatmentSheet } from '@/components/TreatmentSheet';
import { MonitoringSheets } from '@/components/MonitoringSheets';
import { getDepartment, getUnit } from '@/lib/workspaceData';
import HPIWorkflow from '@/app/consultation/respiratory/components/HPIWorkflow';
import { getDepartmentContent } from '@/lib/departmentContent';
import { getPhaseRenderer } from '@/lib/phaseRenderers';

const PHASES = [
  { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'Patient demographics & clinical context' },
  { id: 'complaints', label: 'Chief Complaints', icon: '🗣️', desc: 'Symptoms & timeline' },
  { id: 'hpi', label: 'HPI', icon: '📝', desc: 'History of Presenting Illness' },
  { id: 'pmh', label: 'PMH', icon: '🏥', desc: 'Past Medical History' },
  { id: 'birth', label: 'Birth History', icon: '👶', desc: 'Antenatal, delivery, neonatal' },
  { id: 'development', label: 'Development', icon: '🧒', desc: 'Milestones & growth' },
  { id: 'immunization', label: 'Immunization', icon: '💉', desc: 'Vaccination status' },
  { id: 'nutrition', label: 'Nutrition', icon: '🍽️', desc: 'Feeding & anthropometry' },
  { id: 'family', label: 'Family & Social', icon: '👨‍👩‍👧‍👦', desc: 'Environmental & genetic risks' },
  { id: 'vitals', label: 'Vitals & Exam', icon: '🩺', desc: 'Vital signs & physical exam' },
  { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'AI-powered differentials' },
  { id: 'management', label: 'Management', icon: '💊', desc: 'Treatment plan & prescriptions' },
  { id: 'plan', label: 'Plan & Summary', icon: '📄', desc: 'Clinical note & discharge plan' },
];

function getAgeBand(mo: number) {
  return AGE_BANDS.find(b => mo <= b.max) || AGE_BANDS[AGE_BANDS.length-1];
}

function formatAge(mo: string) {
  const m = parseInt(mo)||0;
  if (m === 0) return 'a newborn';
  if (m < 12) return `a ${m}-month-old`;
  const yr = Math.floor(m/12), rem = m%12;
  if (rem === 0) return `a ${yr}-year-old`;
  return `a ${yr}-year, ${rem}-month-old`;
}

const TREATMENT_REFS = [
  { name:'Pneumonia (2-59 months, no SAM)', steps:[
    'Non-severe: Amoxicillin PO 40-45 mg/kg/day in 2-3 divided doses x 5 days',
    'Severe: Benzylpenicillin IV 50,000 IU/kg every 6 h + Gentamicin 7.5 mg/kg once daily',
    'Failure at 48 h: escalate to Ceftriaxone 50 mg/kg once daily IV',
  ]},
  { name:'Acute Wheeze / Possible Asthma (>12 months)', steps:[
    'Mild-moderate: Salbutamol 4-8 puffs MDI + spacer every 20 min x 3 doses',
    'Severe: Nebulised salbutamol 2.5-5 mg + ipratropium 250 mcg every 20 min x 3',
    'Add prednisolone PO 1-2 mg/kg/day (max 40 mg) x 3-5 days',
  ]},
  { name:'Tuberculosis (Intensive Phase - 2RHZE)', steps:[
    'Rifampicin (R) + Isoniazid (H) + Pyrazinamide (Z) + Ethambutol (E) x 2 months',
    'Continuation phase: RH x 4 months (pulmonary TB)',
    'Pyridoxine (vitamin B6) 25-50 mg daily throughout treatment',
  ]},
  { name:'Severe Malaria', steps:[
    'Artesunate IV/IM: 3 mg/kg (<=20 kg) or 2.4 mg/kg (>20 kg) at 0, 12, and 24 h',
    'Treat hypoglycaemia: 5 ml/kg of 10% dextrose IV',
    'Transfuse packed red cells 10 ml/kg if Hb <5 g/dL with respiratory distress',
  ]},
  { name:'DKA (Diabetic Ketoacidosis)', steps:[
    'If shocked: 10 ml/kg 0.9% sodium chloride over 30-60 min (max 40 ml/kg in first 4 h)',
    'Rehydrate remaining deficit + maintenance with 0.9% saline over 48 h',
    'Insulin: start subcutaneous regular insulin 0.2 IU/kg every 4 h',
  ]},
];

function useT() {
  const theme = useTheme();
  return { ...theme.colors, font: theme.typography.font, mono: theme.typography.mono, id: theme.id };
}

function Inp({value,onChange,placeholder='',type='text',...rest}:any){
  const t = useT();
  const s: React.CSSProperties = {width:'100%',boxSizing:'border-box',padding:'8px 12px',borderRadius:8,border:`1px solid ${t.border}`,background:t.surface,color:t.text,fontSize:13,outline:'none',fontFamily:t.font,transition:'border-color 0.15s'};
  return <input style={s} type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} min={rest.min} max={rest.max} />;
}

function Ta({value,onChange,placeholder=''}){
  const t = useT();
  return <textarea style={{width:'100%',boxSizing:'border-box',padding:'8px 12px',borderRadius:8,border:`1px solid ${t.border}`,background:t.surface,color:t.text,fontSize:13,outline:'none',fontFamily:t.font,minHeight:64,resize:'vertical'}} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} />;
}

function Sel({value,onChange,options,placeholder=''}){
  const t = useT();
  return <select style={{width:'100%',boxSizing:'border-box',padding:'8px 12px',borderRadius:8,border:`1px solid ${t.border}`,background:t.surface,color:t.text,fontSize:13,outline:'none',fontFamily:t.font}} value={value} onChange={e=>onChange(e.target.value)}>
    <option value=''>{placeholder||'Select...'}</option>
    {options.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}
  </select>;
}

function Section({title,sub='',children}:any){
  const t = useT();
  return <div style={{marginBottom:24}}>
    <div style={{fontSize:11,fontWeight:700,color:t.textMuted,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:sub?3:12,paddingBottom:8,borderBottom:`1px solid ${t.border}`}}>{title}</div>
    {sub&&<div style={{fontSize:11,color:t.textMuted,marginBottom:10}}>{sub}</div>}
    {children}
  </div>;
}

function Field({label,children,full=false}:any){
  const t = useT();
  return <div style={full?{marginBottom:12,gridColumn:'1/-1'}:{marginBottom:12}}>
    <div style={{fontSize:11,fontWeight:600,color:t.textSub,marginBottom:5}}>{label}</div>
    {children}
  </div>;
}

function Grid({cols=2,children}:any){
  const t = useT();
  const isMobile = useUIStore(s => s.isMobile);
  return <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':`repeat(${cols},1fr)`,gap:12,marginBottom:4}}>{children}</div>;
}

function Pills({options,value,onSelect}:any){
  const t = useT();
  return <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
    {options.map((o:any)=>{
      const v=typeof o==='string'?o:o.value;const l=typeof o==='string'?o:o.label;const sel=value===v;
      return <button key={v} onClick={()=>onSelect(v)} style={{padding:'5px 14px',borderRadius:20,fontSize:12,cursor:'pointer',border:`1px solid ${sel?t.accent:t.border}`,background:sel?t.accent:'transparent',color:sel?'white':t.textSub,fontWeight:sel?600:400,transition:'all 0.12s',fontFamily:t.font}}>{l}</button>;
    })}
  </div>;
}

function BoolPill({label,value,onToggle,warn=false}:any){
  const t = useT();
  return <button onClick={()=>onToggle(!value)} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 14px',borderRadius:8,border:`1px solid ${value?(warn?t.danger:t.accent):(warn?`${t.danger}50`:t.border)}`,background:value?(warn?t.dangerBg:t.accentBg):'transparent',color:value?(warn?t.danger:t.accentText):(warn?t.danger:t.textSub),fontSize:13,cursor:'pointer',transition:'all 0.12s',whiteSpace:'nowrap',fontFamily:t.font}}>
    <span style={{width:15,height:15,borderRadius:4,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',border:`1.5px solid ${value?(warn?t.danger:t.accent):(warn?`${t.danger}70`:t.borderStrong)}`,background:value?(warn?t.danger:t.accent):'transparent',fontSize:9,color:'white',fontWeight:700}}>{value?'✓':''}</span>
    {label}
  </button>;
}

function Card({children,style={}}:any){
  const t = useT();
  return <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:24,...style}}>{children}</div>;
}

function PhaseHeader({title,sub=''}:any){
  const t = useT();
  return <div style={{marginBottom:20}}>
    <h2 style={{fontSize:20,fontWeight:700,margin:0,color:t.text,fontFamily:t.font}}>{title}</h2>
    {sub&&<p style={{fontSize:13,color:t.textSub,margin:'6px 0 0',fontFamily:t.font}}>{sub}</p>}
  </div>;
}

const Row = ({label,value}:{label:string;value:string}) => {
  const t = useT();
  return <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
    <span style={{color:t.textSub}}>{label}</span>
    <span style={{color:t.text,fontWeight:500}}>{value}</span>
  </div>;
};

function VitalInput({label,unit='',val,onChange,warnFn}:any){
  const t = useT();
  const inp: React.CSSProperties = {width:'100%',boxSizing:'border-box',padding:'8px 12px',borderRadius:8,border:`1px solid ${t.border}`,background:t.surface,color:t.text,fontSize:13,outline:'none',fontFamily:t.font};
  const n=parseFloat(val);const w=warnFn&&!isNaN(n)?warnFn(n):null;
  return <div style={{marginBottom:12}}>
    <div style={{fontSize:11,fontWeight:600,color:t.textSub,marginBottom:5}}>{label} {unit&&<span style={{fontWeight:400,color:t.textMuted}}>({unit})</span>}</div>
    <input style={{...inp,borderColor:w?t.warn:t.border}} type='number' value={val} onChange={e=>onChange(e.target.value)} />
    {w&&<div style={{fontSize:11,color:t.warn,marginTop:3}}>⚠ {w}</div>}
  </div>;
}

const SYMPTOM_SEVERITY: Record<string, number> = { cyanosis:10, chest_indrawing:9, stridor:9, difficulty_breathing:8, apnoea:8, convulsions:7, altered_consciousness:7, drooling:6, hemoptysis:6, feeding_difficulty:5, tachypnea:5, wheeze:4, cough:3, fever:3, sore_throat:2, nasal_discharge:1 };

const SYMPTOM_CATEGORIES: Record<string, string[]> = {
  respiratory: ['cough','wheeze','stridor','difficulty_breathing','chest_indrawing','cyanosis','fast_breathing','noisy_breathing','chest_tightness','hemoptysis','nasal_discharge'],
  infective: ['fever','lethargy','night_sweats','weight_loss','rash'],
  severe: ['cyanosis','chest_indrawing','stridor','difficulty_breathing','apnoea','drooling','tripod_posture','altered_consciousness'],
  neurological: ['convulsions','altered_consciousness','seizures','headache','visual_disturbance'],
  other: []
};

function categorizeSymptom(symptomId: string): string {
  for (const [cat, ids] of Object.entries(SYMPTOM_CATEGORIES)) {
    if (ids.includes(symptomId)) return cat;
  }
  return 'other';
}

function buildIllnessNarrative(orderedSymptoms: { id: string; label: string; duration: string }[]): string {
  if (orderedSymptoms.length === 0) return '';
  const parts = orderedSymptoms.map((s, i) => {
    const duration = s.duration ? `lasting ${s.duration}` : 'of unknown duration';
    const prefix = i === 0 ? 'The illness began' : 'followed by';
    return `${prefix} ${s.label.toLowerCase()} (${duration})`;
  });
  return parts.join(', ') + '.';
}

const HIGH_TB_AREAS = ['kampala','nairobi','dar es salaam','lusaka','lilongwe','mombasa','kisumu','blantyre','gulu','harare'];

const KENYA_EPI_SCHEDULE = [
  { ageMonths: 0, vaccines: ['BCG', 'OPV0'] },
  { ageMonths: 1.5, vaccines: ['Pentavalent 1', 'OPV1', 'PCV1', 'Rotavirus 1'] },
  { ageMonths: 2.5, vaccines: ['Pentavalent 2', 'OPV2', 'PCV2', 'Rotavirus 2'] },
  { ageMonths: 3.5, vaccines: ['Pentavalent 3', 'OPV3', 'PCV3'] },
  { ageMonths: 9, vaccines: ['Measles 1', 'Yellow Fever'] },
  { ageMonths: 18, vaccines: ['Measles 2'] },
];

// ===== MAIN PAGE =====
export default function FullHistoryPage() {
  const raw = useParams();
  const params = raw || {};
  const router = useRouter();
  const deptKey = typeof params.dept === 'string' ? params.dept.toUpperCase() : '';
  const unitId = typeof params.unit === 'string' ? params.unit : '';
  const dept = getDepartment(deptKey);
  const unit = getUnit(deptKey, unitId);
  const content = getDepartmentContent(deptKey);

  const isPaed = deptKey === 'PAED';

  return (
    <ThemeProvider>
      <MainLayout>
        <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%', height: 56, borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(7,11,20,.88)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => router.push(`/workspace/${deptKey}/${unitId}`)} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,.06)', background: 'transparent', color: '#94A3B8', fontSize: '.8125rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Back to {unit?.label || unitId}</button>
          {deptKey !== 'PAED' && <button onClick={()=>window.print()} style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.5rem 1rem',borderRadius:8,border:'1px solid rgba(255,255,255,.06)',background:'transparent',color:'#94A3B8',fontSize:'.8125rem',cursor:'pointer',fontFamily:'Inter, sans-serif'}}>🖨️ Print</button>}
          <div style={{ fontSize: '.75rem', color: '#475569' }}>Full Clinical History · {dept?.label} / {unit?.label}</div>
        </div>
        {isPaed ? <PaedPageContent /> : content ? <GenericPageContent deptKey={deptKey} content={content} /> : <div style={{padding:'80px 5%',textAlign:'center',color:'#475569'}}>Department content not available</div>}
      </MainLayout>
    </ThemeProvider>
  );
}

function PaedPageContent() {
  const theme = useTheme();
  const t = { ...theme.colors, font: theme.typography.font, mono: theme.typography.mono, id: theme.id };
  const phaseIdx = useUIStore(s => s.phaseIdx);
  const isMobile = useUIStore(s => s.isMobile);
  const form = usePatientStore(s => s.form);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [rxExpanded, setRxExpanded] = useState(false);
  const [txExpanded, setTxExpanded] = useState(false);
  const [monExpanded, setMonExpanded] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [prescriptionSaved, setPrescriptionSaved] = useState<{ medication: string; id: string } | null>(null);

  const scores = useMemo(()=>computeScores(form),[form]);
  const severity = useMemo(()=>getSeverity(form),[form]);
  const differentials = useMemo(()=>runInference(form),[form]);
  const noteText = useMemo(()=>buildClinicalNote(form, differentials),[form, differentials]);
  const plan = useMemo(()=>generateManagementPlan(form, differentials),[form, differentials]);

  const set = useCallback((path: string, val: any)=>usePatientStore.getState().setField(path, val), []);
  const toggle = useCallback((path: string, item: any)=>usePatientStore.getState().toggleArrayItem(path, item), []);

  useEffect(()=>{
    if (!draftLoaded) return;
    const timer=setTimeout(()=>{
      try {
        const f = usePatientStore.getState().form;
        const ui = useUIStore.getState();
        localStorage.setItem('pedsDraft',JSON.stringify({form:f, phaseIdx:ui.phaseIdx, done:ui.donePhases, themeKey:ui.themeId}));
      } catch(e){}
    },2000);
    return ()=>clearTimeout(timer);
  },[form, phaseIdx, draftLoaded]);

  useEffect(()=>{
    try {
      const saved=localStorage.getItem('pedsDraft');
      if (saved) {
        const p=JSON.parse(saved);
        if (p&&p.form&&window.confirm('Restore previous draft?')) {
          usePatientStore.getState().setForm({...INIT_FORM,...p.form});
          useUIStore.getState().setPhaseIdx(p.phaseIdx||0);
          if (p.done) p.done.forEach((id:string)=>useUIStore.getState().addDonePhase(id));
          if (p.themeKey) useUIStore.getState().setThemeId(p.themeKey);
        }
      }
    } catch(e){}
    setDraftLoaded(true);
  },[]);

  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if ((e.ctrlKey||e.metaKey)&&e.key==='Enter') {
        e.preventDefault();
        const ui = useUIStore.getState();
        const idx = ui.phaseIdx;
        ui.addDonePhase(PHASES[idx].id);
        ui.setPhaseIdx(Math.min(idx+1,PHASES.length-1));
        window.scrollTo?.(0,0);
      }
    };
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[]);

  const activePhase = PHASES[phaseIdx];
  const donePhases = useUIStore(s => s.donePhases);

  const goToPhase = (idx: number) => {
    useUIStore.getState().setPhaseIdx(idx);
    window.scrollTo?.({top: 0, behavior: 'smooth'});
  };

  const completeCurrentPhase = () => {
    const ui = useUIStore.getState();
    ui.addDonePhase(PHASES[phaseIdx].id);
    if (phaseIdx < PHASES.length - 1) {
      ui.setPhaseIdx(phaseIdx + 1);
      window.scrollTo?.({top: 0, behavior: 'smooth'});
    }
  };

  return (
    <div style={{ display: 'flex', gap: 24, maxWidth: 1400, margin: '0 auto', padding: '24px 5%', position: 'relative' }}>
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>WORKFLOW</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PHASES.map((p, idx) => {
            const isActive = idx === phaseIdx;
            const isDone = donePhases.includes(p.id);
            return (
              <button key={p.id} onClick={() => goToPhase(idx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
                  border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: isActive ? 'rgba(34,211,238,.12)' : isDone ? 'rgba(34,211,238,.06)' : 'transparent',
                  color: isActive ? '#22d3ee' : isDone ? '#22d3ee' : '#64748B',
                  fontWeight: isActive ? 700 : isDone ? 600 : 400,
                  fontSize: 12, fontFamily: 'Inter, sans-serif',
                  transition: 'all .12s',
                }}>
                <span style={{ fontSize: 14 }}>{p.icon}</span>
                <span>{p.label}</span>
                {isDone && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {activePhase.id === 'biodata' && renderBiodata()}
        {activePhase.id === 'complaints' && renderComplaints()}
        {activePhase.id === 'hpi' && renderHpi()}
        {activePhase.id === 'pmh' && renderPmh()}
        {activePhase.id === 'birth' && renderBirthHistory()}
        {activePhase.id === 'development' && renderDevelopment()}
        {activePhase.id === 'immunization' && renderImmunization()}
        {activePhase.id === 'nutrition' && renderNutrition()}
        {activePhase.id === 'family' && renderFamily()}
        {activePhase.id === 'vitals' && renderVitals()}
        {activePhase.id === 'ddx' && renderDdx()}
        {activePhase.id === 'management' && renderManagement()}
        {activePhase.id === 'plan' && renderPlan()}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, marginBottom: 60 }}>
          <button onClick={() => {
            if (phaseIdx > 0) {
              useUIStore.getState().setPhaseIdx(phaseIdx - 1);
              window.scrollTo?.({top: 0, behavior: 'smooth'});
            }
          }} style={{
            padding: '10px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)',
            background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: '.875rem', fontFamily: 'Inter, sans-serif',
          }} disabled={phaseIdx === 0}>← Previous</button>
          {phaseIdx < PHASES.length - 1 ? (
            <button onClick={completeCurrentPhase} style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#22d3ee', color: '#070B14', cursor: 'pointer', fontSize: '.875rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
            }}>Next →</button>
          ) : (
            <button onClick={() => {
              alert('Full History complete! The clinical note and management plan have been generated.');
            }} style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#22d3ee', color: '#070B14', cursor: 'pointer', fontSize: '.875rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
            }}>✓ Complete</button>
          )}
        </div>
      </div>

      <div style={{ width: 280, flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>AI INSIGHTS</div>
        <div style={{ background: 'rgba(255,255,255,.02)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,.06)' }}>
          {severity && severity.level !== 'normal' && severity.level !== 'unknown' && (
            <div style={{ padding: '8px 12px', borderRadius: 8, background: severity.level === 'emergency' ? 'rgba(239,68,68,.15)' : 'rgba(245,158,11,.15)', marginBottom: 12, border: `1px solid ${severity.level === 'emergency' ? '#ef4444' : '#f59e0b'}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: severity.level === 'emergency' ? '#ef4444' : '#f59e0b', marginBottom: 4 }}>{severity.level === 'emergency' ? '🚨 CRITICAL' : '⚠ Warning'}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>{severity.msg}</div>
            </div>
          )}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Top Differentials</div>
          {differentials.slice(0, 4).map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 11 }}>
              <span style={{ color: '#E2E8F0' }}>{d.disease.name}</span>
              <span style={{ color: '#22d3ee', fontWeight: 600 }}>{Math.round(d.probability * 100)}%</span>
            </div>
          ))}
          {differentials.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>Suggested Investigations</div>
              {(differentials[0].disease as any).investigations?.slice(0, 3).map((inv: string, i: number) => (
                <div key={i} style={{ fontSize: 10, color: '#94A3B8', padding: '2px 0' }}>• {inv}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ===== RENDER FUNCTIONS =====
  function useBiodataContext(f: PatientForm) {
    return useMemo(() => {
      const ageMonths = parseInt(f.biodata.ageMonths || '0');
      const band = getAgeBand(ageMonths);
      const respiratoryRiskGroup = ageMonths < 12 ? 'high_risk_infant' : ageMonths < 60 ? 'toddler_child' : 'older_child';
      const keyRespRisks = { bronchiolitis: ageMonths < 24, asthma: ageMonths >= 12, croup: ageMonths >= 6 && ageMonths <= 60, tb: true, foreignBody: ageMonths >= 6 && ageMonths <= 84 };
      const informantWeight = f.biodata.histReliability === 'Reliable' ? 1.0 : f.biodata.histReliability === 'Partially Reliable' ? 0.7 : 0.4;
      const residenceLower = (f.biodata.residence || '').toLowerCase();
      const tbRiskArea = HIGH_TB_AREAS.some(area => residenceLower.includes(area));
      return { ageMonths, ageBand: band, respiratoryRiskGroup, keyRespRisks, informantWeight, tbRiskArea };
    }, [f.biodata.ageMonths, f.biodata.residence, f.biodata.histReliability]);
  }

  function renderBiodata() {
    const ctx = useBiodataContext(form);
    return <>
      <PhaseHeader title='Patient Biodata' sub='Demographics, informant, and clinical context.' />
      <Card>
        <Section title='Patient Identification'>
          <Grid>
            <Field label='Full Name'><Inp value={form.biodata.patientName} onChange={v=>set('biodata.patientName',v)} placeholder='Patient full name' /></Field>
            <Field label='Date of Birth'><Inp type='date' value={form.biodata.dob} onChange={v=>set('biodata.dob',v)} /></Field>
            <Field label='Age in Months'><Inp type='number' value={form.biodata.ageMonths} onChange={v=>set('biodata.ageMonths',v)} placeholder='e.g. 24' min={0} max={216} />
              {parseInt(form.biodata.ageMonths||'0')>0 && <div style={{fontSize:12,marginTop:6}}><span style={{color:t.text,fontWeight:600}}>{formatAge(form.biodata.ageMonths)} — {ctx.ageBand.label}</span></div>}
            </Field>
            <Field label='Sex'><Pills options={['Male','Female']} value={form.biodata.sex} onSelect={v=>set('biodata.sex',v)} /></Field>
            <Field label='Residence'><Inp value={form.biodata.residence} onChange={v=>set('biodata.residence',v)} placeholder='e.g. Kampala' />
              {ctx.tbRiskArea && <div style={{fontSize:11,color:'#f59e0b',marginTop:4}}>High TB-burden area</div>}
            </Field>
            <Field label='Admission Date'><Inp type='date' value={form.biodata.dateOfAdmission} onChange={v=>set('biodata.dateOfAdmission',v)} /></Field>
          </Grid>
        </Section>
        <Section title='Informant & History Quality'>
          <Grid>
            <Field label='Informant'><Inp value={form.biodata.informant} onChange={v=>set('biodata.informant',v)} placeholder='Name' /></Field>
            <Field label='Relationship'><Inp value={form.biodata.informantRelation} onChange={v=>set('biodata.informantRelation',v)} placeholder='e.g. Mother' /></Field>
          </Grid>
          <Field label='Reliability' full><Pills options={['Reliable','Partially Reliable','Unreliable','Unknown']} value={form.biodata.histReliability} onSelect={v=>set('biodata.histReliability',v)} /></Field>
        </Section>
      </Card>
    </>;
  }

  function renderComplaints() {
    const [symptomOrder, setSymptomOrder] = useState<string[]>(() => [...form.complaints]);
    const orderedList = useMemo(() => {
      const unique = [...new Set(form.complaints)];
      const existingOrdered = [...new Set(symptomOrder.filter(id => unique.includes(id)))];
      const newIds = unique.filter(id => !existingOrdered.includes(id));
      return [...existingOrdered, ...newIds];
    }, [form.complaints, symptomOrder]);
    const narrative = useMemo(() => {
      const symptomsWithLabels = orderedList.map(id => ({ id, label: ALL_SYMPTOMS.find(s => s.id === id)?.label || id, duration: form.complaintDurations[id] || '' }));
      return buildIllnessNarrative(symptomsWithLabels);
    }, [orderedList, form.complaintDurations]);
    return <>
      <PhaseHeader title='Chief Complaints' sub='Capture the illness story in chronological order.' />
      <Card>
        <Section title='Select all symptoms'>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {['severe','respiratory','infective','neurological','other'].map(cat => {
              const symptomsInCat = SYMPTOM_CATEGORIES[cat] || [];
              if (symptomsInCat.length === 0) return null;
              return <div key={cat}>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:'#475569',marginBottom:8}}>{cat === 'severe' ? '🚨 Emergency Signs' : cat.charAt(0).toUpperCase()+cat.slice(1)}</div>
                <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:8}}>
                  {symptomsInCat.map(symId => {
                    const sym = ALL_SYMPTOMS.find(s => s.id === symId);
                    if (!sym) return null;
                    const sel = form.complaints.includes(symId);
                    return <button key={symId} onClick={() => { toggle('complaints', symId); if (!sel) setSymptomOrder(prev => [...prev, symId]); else setSymptomOrder(prev => prev.filter(id => id !== symId)); }}
                      style={{display:'flex',alignItems:'center',gap:8,padding:'9px 14px',borderRadius:8,textAlign:'left',border:`1px solid ${sel?t.accent:t.border}`,background:sel?t.accentBg:'transparent',color:sel?t.accentText:t.text,fontSize:13,cursor:'pointer',fontWeight:sel?600:400}}>
                      {sym.label}
                    </button>;
                  })}
                </div>
              </div>;
            })}
          </div>
        </Section>
        {orderedList.length > 0 && <Section title='Illness Timeline'>
          <div style={{fontSize:12,color:t.textSub,marginBottom:8,fontStyle:'italic'}}>{narrative}</div>
          <Grid>
            {orderedList.map(id => <Field key={id} label={`Duration of ${ALL_SYMPTOMS.find(s=>s.id===id)?.label||id}`}>
              <Inp value={form.complaintDurations[id]||''} placeholder='e.g. 3 days' onChange={v=>set('complaintDurations',{...form.complaintDurations,[id]:v})} />
            </Field>)}
          </Grid>
        </Section>}
      </Card>
    </>;
  }

  function renderHpi() {
    const clinicalContext = useBiodataContext(form);
    const differentials = useMemo(() => runInference(form), [form]);
    const narrative = useMemo(() => form.complaints.length > 0 ? buildHPI(form, differentials) : 'No symptoms selected.', [form, differentials]);
    const symptomOrder = [...new Set(form.complaints)];
    return <>
      <PhaseHeader title='History of Presenting Illness' sub='Structured timeline with deep-dive characterisation.' />
      <Card>
        <Section title='Illness Narrative'>
          <div style={{background:t.surfaceAlt,borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:13,lineHeight:1.6,color:t.text,fontWeight:500,fontStyle:'italic'}}>{narrative}</div>
          </div>
          <Grid>
            <Field label='Overall Onset'><Pills options={[{value:'sudden',label:'Sudden'},{value:'gradual',label:'Gradual'}]} value={form.hpi.onsetType} onSelect={v=>set('hpi.onsetType',v)} /></Field>
            <Field label='Progression'><Pills options={['Worsening','Improving','Fluctuating','Static'].map(v=>({value:v.toLowerCase(),label:v}))} value={form.hpi.progression} onSelect={v=>set('hpi.progression',v)} /></Field>
          </Grid>
          <Field label='Detailed Narrative' full><Ta value={form.hpi.associated} onChange={v=>set('hpi.associated',v)} placeholder='Additional chronological details, treatments given, response...' /></Field>
        </Section>
        <Section title='Structured Symptom Workup'>
          <HPIWorkflow form={form} set={set} symptomOrder={symptomOrder} />
        </Section>
        <Section title='Prior Treatment'>
          <Grid>
            <Field label='Treatment Already Received'><Inp value={form.hpi.prevTx} onChange={v=>set('hpi.prevTx',v)} placeholder='e.g. Paracetamol' /></Field>
            <Field label='Response'><Inp value={form.hpi.txResponse} onChange={v=>set('hpi.txResponse',v)} placeholder='e.g. Partial' /></Field>
          </Grid>
        </Section>
      </Card>
    </>;
  }

  function renderPmh() {
    const conditions: any[] = (form.pmh as any).conditions || [];
    const surgeries: any[] = (form.pmh as any).surgeries || [];
    const infection: any = (form.pmh as any).infectionStatus || {};
    const transfusions: any[] = (form.pmh as any).transfusions || [];
    const addCondition = () => set('pmh.conditions', [...conditions, {id:Date.now().toString(),name:'',diagnosedYear:'',severity:'unknown',currentStatus:'active',medications:[],complications:[]}]);
    const updateCondition = (id:string,updates:any) => set('pmh.conditions', conditions.map((c:any) => c.id===id?{...c,...updates}:c));
    const removeCondition = (id:string) => set('pmh.conditions', conditions.filter((c:any)=>c.id!==id));
    return <>
      <PhaseHeader title='Past Medical History' sub='Chronic conditions, surgical history, allergies.' />
      <Card>
        <Section title='Chronic Conditions'>
          {conditions.map((cond:any) => <div key={cond.id} style={{background:t.surfaceAlt,borderRadius:10,padding:12,marginBottom:8,border:`1px solid ${t.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontWeight:700,fontSize:12,color:t.text}}>{cond.name||'New Condition'}</span>
              <button onClick={()=>removeCondition(cond.id)} style={{background:'none',border:'none',color:t.danger,cursor:'pointer',fontSize:12}}>✕</button></div>
            <Grid><Field label='Name'><Inp value={cond.name} onChange={v=>updateCondition(cond.id,{name:v})} /></Field>
              <Field label='Year'><Inp value={cond.diagnosedYear} onChange={v=>updateCondition(cond.id,{diagnosedYear:v})} /></Field></Grid>
          </div>)}
          <button onClick={addCondition} style={{padding:'8px 16px',borderRadius:8,border:`1px dashed ${t.accent}`,background:'transparent',color:t.accent,cursor:'pointer',fontSize:12,fontWeight:600}}>+ Add Condition</button>
        </Section>
        <Section title='Medications & Allergies'>
          <Field label='Current Medications' full><Ta value={form.pmh.medications||''} onChange={v=>set('pmh.medications',v)} placeholder='List current medications' /></Field>
          <Field label='Allergies' full><Inp value={form.pmh.allergies||''} onChange={v=>set('pmh.allergies',v)} placeholder='Drug, food, environmental allergies' /></Field>
        </Section>
      </Card>
    </>;
  }

  function renderBirthHistory() {
    const birth = form.birth;
    const anc = form.anc as any;
    const weightInterpretation = birth.birthWeight && birth.gestAgeWeeks ? (parseFloat(birth.birthWeight)<2.5?'<10th centile (SGA)':parseFloat(birth.birthWeight)>4.0?'>90th centile (LGA)':'10th-90th centile (AGA)') : '';
    return <>
      <PhaseHeader title='Birth History' sub='Antenatal care, labour & delivery, and neonatal period.' />
      <Card>
        <Section title='Antenatal Care'>
          <Grid>
            <Field label='ANC Visits'><Inp type='number' value={anc.ancVisits||''} onChange={v=>set('anc.ancVisits',v)} placeholder='e.g. 4' /></Field>
            <Field label='Place of Delivery'><Inp value={birth.birthPlace||''} onChange={v=>set('birth.birthPlace',v)} placeholder='e.g. Hospital' /></Field>
          </Grid>
        </Section>
        <Section title='Labour & Delivery'>
          <Grid>
            <Field label='Gestation (weeks)'><Inp type='number' value={birth.gestAge||birth.gestAgeWeeks||''} onChange={v=>{set('birth.gestAge',v);set('birth.gestAgeWeeks',v);}} placeholder='e.g. 39' /></Field>
            <Field label='Mode of Delivery'><Pills options={[{value:'SVD',label:'SVD'},{value:'CS',label:'C-section'},{value:'vacuum',label:'Vacuum'}]} value={birth.deliveryMode||''} onSelect={v=>set('birth.deliveryMode',v)} /></Field>
          </Grid>
          <Grid>
            <Field label='Birth Weight (kg)'><Inp type='number' value={birth.birthWeight||''} onChange={v=>set('birth.birthWeight',v)} placeholder='e.g. 3.2' /></Field>
            <Field label='APGAR'><Inp value={birth.apgar||''} onChange={v=>set('birth.apgar',v)} placeholder='e.g. 9/10' /></Field>
          </Grid>
          {weightInterpretation && <div style={{padding:'8px 12px',borderRadius:8,marginTop:8,fontSize:12,background:t.surfaceAlt,color:t.text,fontWeight:500,border:`1px solid ${t.border}`}}>{weightInterpretation}</div>}
        </Section>
      </Card>
    </>;
  }

  function getExpectedMilestones(ageMonths: number): any {
    const MILESTONE_MAP: any = {0:{grossMotor:['Head lag'],fineMotor:['Hands fisted'],speech:['Startles'],social:['Regards face']},3:{grossMotor:['Holds head steady'],fineMotor:['Hands open'],speech:['Cooing'],social:['Social smile']},6:{grossMotor:['Rolls over','Sits with support'],fineMotor:['Reaches'],speech:['Babbles'],social:['Recognises caregiver']},9:{grossMotor:['Sits unsupported','Crawls'],fineMotor:['Pincer grasp'],speech:['Mama/dada'],social:['Waves bye-bye']},12:{grossMotor:['Stands alone','Walks with support'],fineMotor:['Pincer grasp well'],speech:['1-3 words'],social:['Points']},18:{grossMotor:['Walks well','Runs stiffly'],fineMotor:['Scribbles'],speech:['10-20 words'],social:['Imitates chores']},24:{grossMotor:['Runs well','Kicks ball'],fineMotor:['Tower of 6 cubes'],speech:['2-word sentences'],social:['Parallel play']},36:{grossMotor:['Jumps','Pedals tricycle'],fineMotor:['Copies circle'],speech:['3-word sentences'],social:['Interactive play']},48:{grossMotor:['Hops','Catches ball'],fineMotor:['Copies square'],speech:['Full sentences'],social:['Group play']},60:{grossMotor:['Skips','Bicycle'],fineMotor:['Copies triangle'],speech:['Narrates events'],social:['Cooperative play']}};
    const bands = Object.keys(MILESTONE_MAP).map(Number).sort((a,b)=>a-b);
    let selected = bands[0];
    for (const band of bands) { if (ageMonths >= band) selected = band; }
    return MILESTONE_MAP[selected];
  }

  function renderDevelopment() {
    const ageMonths = parseInt(form.biodata.ageMonths || '0');
    const expected = getExpectedMilestones(ageMonths);
    const achieved: any = (form.development as any).milestones || {grossMotor:{},fineMotor:{},speech:{},social:{}};
    const handleToggle = (domain:string,milestone:string) => set('development.milestones', {...achieved,[domain]:{...achieved[domain],[milestone]:!achieved[domain]?.[milestone]}});
    return <>
      <PhaseHeader title='Growth & Development' sub='Developmental milestones tracking.' />
      <Card>
        <Section title='Age-Appropriate Milestones'>
          {Object.entries(expected).map(([domain,milestones]:[string,any]) => <div key={domain} style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:t.text,marginBottom:4}}>{domain.replace(/([A-Z])/g,' $1').trim()}</div>
            {milestones.map((m:string) => <label key={m} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:t.text,cursor:'pointer',padding:'2px 0'}}>
              <input type='checkbox' checked={!!achieved[domain]?.[m]} onChange={()=>handleToggle(domain,m)} style={{accentColor:t.accent}} />{m}
            </label>)}
          </div>)}
        </Section>
      </Card>
    </>;
  }

  function getExpectedVaccines(ageMonths: number): string[] {
    const expected: Set<string> = new Set();
    for (const dose of KENYA_EPI_SCHEDULE) { if (ageMonths >= dose.ageMonths) dose.vaccines.forEach(v => expected.add(v)); }
    return Array.from(expected);
  }

  function renderImmunization() {
    const ageMonths = parseInt(form.biodata.ageMonths || '0');
    const administered: string[] = (form.immunization as any).administeredVaccines || [];
    const expected = getExpectedVaccines(ageMonths);
    const missing = expected.filter(v => !administered.includes(v));
    return <>
      <PhaseHeader title='Immunization' sub='Vaccination history and age-expected coverage.' />
      <Card>
        <Section title='Vaccine Status'>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {expected.map(v => { const received = administered.includes(v);
              return <button key={v} onClick={() => set('immunization.administeredVaccines', received ? administered.filter((x:string)=>x!==v) : [...administered,v])}
                style={{padding:'5px 12px',borderRadius:20,fontSize:12,cursor:'pointer',border:`1px solid ${received?'#22c55e':'#f59e0b'}`,background:received?'rgba(34,197,94,.15)':'transparent',color:received?'#22c55e':'#f59e0b',fontWeight:received?600:400}}>
                {received?'✓ ':'✗ '}{v}
              </button>;
            })}
          </div>
          {missing.length > 0 && <div style={{fontSize:11,color:'#f59e0b',marginTop:6}}>⚠ Missing: {missing.join(', ')}</div>}
        </Section>
      </Card>
    </>;
  }

  function renderNutrition() {
    const ageMonths = parseInt(form.biodata.ageMonths||'0');
    const sex = form.biodata.sex||'Male';
    const muacCm = parseFloat(form.nutrition.muac);
    const weightKg = parseFloat(form.vitals.weight);
    return <>
      <PhaseHeader title='Nutritional Assessment' sub='Feeding, growth parameters, and malnutrition risk.' />
      <Card>
        <Section title='Breastfeeding'>
          <Field label='Status' full><Pills options={[{value:'exclusive',label:'Exclusive'},{value:'partial',label:'Partial'},{value:'weaned',label:'Weaned'}]} value={form.nutrition.breastfed} onSelect={v=>set('nutrition.breastfed',v)} /></Field>
        </Section>
        <Section title='Anthropometry'>
          <Grid cols={3}>
            <VitalInput label='MUAC' unit='cm' val={form.nutrition.muac} onChange={v=>set('nutrition.muac',v)} warnFn={(v:number)=>v<11.5?'SAM (<11.5 cm)':null} />
            <VitalInput label='Weight' unit='kg' val={form.vitals.weight} onChange={v=>set('vitals.weight',v)} />
            <VitalInput label='Height' unit='cm' val={form.vitals.height} onChange={v=>set('vitals.height',v)} />
          </Grid>
        </Section>
      </Card>
    </>;
  }

  function computeEnvironmentalRiskScore(household:any, env:any, wash:any, smoke:boolean): number {
    let score = 0;
    const density = household.rooms > 0 ? household.totalMembers / household.rooms : 99;
    if (density > 3) score += 3; else if (density > 2) score += 1;
    if (['charcoal','firewood'].includes(env.cookingFuel) && env.indoorCooking) score += 2;
    if (smoke) score += 3;
    if (wash.waterSource === 'unprotected') score += 2;
    if (wash.sanitation === 'open') score += 2;
    if (!wash.soapAvailable) score += 2;
    return score;
  }

  function renderFamily() {
    const tbHousehold = form.family.tbHousehold;
    const asthmaFamily = form.family.asthmaFamily;
    const smokingExposure = form.family.smokingExposure;
    return <>
      <PhaseHeader title='Family & Social History' sub='Environmental exposures and familial risk.' />
      <Card>
        <Section title='Family History'>
          <Grid>
            <Field label='TB Household Contact'><BoolPill label='Yes' value={tbHousehold} onToggle={v=>set('family.tbHousehold',v)} warn /></Field>
            <Field label='Family Asthma'><BoolPill label='Yes' value={asthmaFamily} onToggle={v=>set('family.asthmaFamily',v)} /></Field>
            <Field label='Smoking Exposure'><BoolPill label='Yes' value={smokingExposure} onToggle={v=>set('family.smokingExposure',v)} warn /></Field>
            <Field label='Similar Illness in Siblings'><BoolPill label='Yes' value={form.family.similarIllnessSiblings} onToggle={v=>set('family.similarIllnessSiblings',v)} /></Field>
          </Grid>
          {smokingExposure && <Field label='Details' full><Inp value={form.family.smokeDetail||''} onChange={v=>set('family.smokeDetail',v)} placeholder='Who smokes, how many/day, indoors?' /></Field>}
        </Section>
        <Section title='Housing & Environment'>
          <Grid>
            <Field label='Housing Conditions'><Pills options={['Good','Fair','Poor','Overcrowded']} value={form.family.housingConditions} onSelect={v=>set('family.housingConditions',v)} /></Field>
            <Field label='Water Source'><Pills options={['Piped','Borehole','Well','Surface']} value={form.family.waterSource} onSelect={v=>set('family.waterSource',v)} /></Field>
          </Grid>
        </Section>
      </Card>
    </>;
  }

  function renderVitals() {
    return <>
      <PhaseHeader title='Vital Signs & Examination' sub='Vital signs and targeted physical exam.' />
      <Card>
        <Section title='Vital Signs'>
          <Grid cols={3}>
            <VitalInput label='HR' unit='bpm' val={Number(form.vitals.hr) || undefined} onChange={v=>set('vitals.hr',String(v))} warnFn={(v:number)=>v<60?'Bradycardia':v>160?'Tachycardia':null} />
            <VitalInput label='RR' unit='/min' val={Number(form.vitals.rr) || undefined} onChange={v=>set('vitals.rr',String(v))} warnFn={(v:number)=>v<20?'Low':v>60?'Tachypnoea':null} />
            <VitalInput label='SpO2' unit='%' val={Number(form.vitals.spo2) || undefined} onChange={v=>set('vitals.spo2',String(v))} warnFn={(v:number)=>v<92?'Hypoxia':v<95?'Borderline':null} />
            <VitalInput label='Temp' unit='°C' val={Number(form.vitals.temp) || undefined} onChange={v=>set('vitals.temp',String(v))} warnFn={(v:number)=>v>38.5?'Fever':null} />
            <VitalInput label='Weight' unit='kg' val={form.vitals.weight} onChange={v=>set('vitals.weight',v)} />
            <VitalInput label='Height' unit='cm' val={form.vitals.height} onChange={v=>set('vitals.height',v)} />
          </Grid>
        </Section>
        <Section title='General Exam Findings'>
          <Field label='General Condition' full><Pills options={['Well','Mildly ill','Moderately ill','Very sick','Toxic']} value={form.vitals.generalCondition} onSelect={v=>set('vitals.generalCondition',v)} /></Field>
          <Grid>
            <Field label='Pallor'><BoolPill label='Present' value={!!form.vitals.pallorExam} onToggle={v=>set('vitals.pallorExam',v)} /></Field>
            <Field label='Chest Indrawing'><BoolPill label='Present' value={!!form.vitals.examIndrawing} onToggle={v=>set('vitals.examIndrawing',v)} warn /></Field>
            <Field label='Cyanosis'><BoolPill label='Present' value={form.complaints.includes('cyanosis')} onToggle={()=>toggle('complaints','cyanosis')} warn /></Field>
            <Field label='Oedema'><BoolPill label='Present' value={!!form.vitals.edemaExam} onToggle={v=>set('vitals.edemaExam',v)} warn /></Field>
          </Grid>
        </Section>
      </Card>
    </>;
  }

  function renderDdx() {
    return <>
      <PhaseHeader title='Differential Diagnosis' sub='AI-powered differential generation based on clinical data.' />
      <Card>
        <Section title='Ranked Differentials'>
          {differentials.length === 0 ? <div style={{color:t.textMuted,fontSize:13,textAlign:'center',padding:24}}>Complete history data to generate differentials.</div> :
            differentials.slice(0, 6).map((d, i) => <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:8,marginBottom:6,background:i===0?t.accentBg:t.surfaceAlt,border:`1px solid ${i===0?t.accent:t.border}`}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:t.accent,color:'white',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13,color:t.text}}>{d.disease.name}</div>
                <div style={{fontSize:11,color:t.textSub,marginTop:2}}>Probability: {Math.round(d.probability*100)}% — {d.evidence?.historyHits?.slice(0,2).join(', ')||''}</div>
              </div>
              <div style={{fontSize:14,fontWeight:700,color:t.accent}}>{Math.round(d.probability*100)}%</div>
            </div>)}
        </Section>
        {severity && severity.level !== 'normal' && severity.level !== 'unknown' && <div style={{marginTop:16,padding:'12px 16px',borderRadius:8,background:severity.level==='emergency'?t.dangerBg:t.warnBg,border:`1px solid ${severity.level==='emergency'?t.danger:t.warn}`}}>
          <div style={{fontWeight:700,fontSize:13,color:severity.level==='emergency'?t.danger:t.warn,marginBottom:4}}>{severity.level==='emergency'?'🚨 Critical Alert':'⚠ Warning'}</div>
          <div style={{fontSize:12,color:t.text}}>{severity.msg}</div>
        </div>}
      </Card>
    </>;
  }

  function renderManagement() {
    return <>
      <PhaseHeader title='Management & Prescriptions' sub='Treatment plan with dosage guidance.' />
      <Card>
        <Section title='Treatment Protocols'>
          {TREATMENT_REFS.map((protocol) => <div key={protocol.name} style={{marginBottom:16,padding:'12px 16px',background:t.surfaceAlt,borderRadius:10,border:`1px solid ${t.border}`}}>
            <div style={{fontWeight:700,fontSize:13,color:t.text,marginBottom:8}}>{protocol.name}</div>
            {protocol.steps.map((step,i) => <div key={i} style={{fontSize:12,color:t.textSub,padding:'3px 0',paddingLeft:16,position:'relative'}}>
              <span style={{position:'absolute',left:0,color:t.accent}}>•</span>{step}
            </div>)}
          </div>)}
        </Section>
        <Section title='Prescriptions'>
          <PrescriptionForm patientId="" patientName="" doctorId="" doctorName="" medication="" calculatedDose="" onSaved={(result:{id:string;medication:string})=>{setSelectedDrug(result.medication);setPrescriptionSaved(result);}} onCancel={()=>{}} />
        </Section>
        {rxExpanded && <Section title='Medication Sheet'><TreatmentSheet patientId="" doctorId="" /></Section>}
        {monExpanded && <Section title='Monitoring Parameters'><MonitoringSheets diagnosisId="" diagnosisName="" severity="" /></Section>}
      </Card>
    </>;
  }

  function renderPlan() {
    return <>
      <PhaseHeader title='Clinical Note & Plan' sub='Auto-generated summary and plan.' />
      <Card>
        <Section title='Generated Clinical Note'>
          <div style={{background:t.surfaceAlt,borderRadius:12,padding:16,fontSize:13,lineHeight:1.7,color:t.text,whiteSpace:'pre-wrap',fontFamily:'Inter, sans-serif',border:`1px solid ${t.border}`}}>{noteText || 'Complete history to generate clinical note.'}</div>
        </Section>
        <Section title='Management Plan'>
          {plan && <div style={{background:t.surfaceAlt,borderRadius:12,padding:16,border:`1px solid ${t.border}`}}>
            {(plan as any).admission && <div style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:12,color:t.text,marginBottom:4}}>Admission</div><div style={{fontSize:12,color:t.textSub}}>{(plan as any).admission}</div></div>}
            {(plan as any).medications && <div style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:12,color:t.text,marginBottom:4}}>Medications</div><div style={{fontSize:12,color:t.textSub}}>{(plan as any).medications.map((m:any,i:number)=><div key={i}>• {m.drug||m}</div>)}</div></div>}
          </div>}
        </Section>
      </Card>
    </>;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC FULL HISTORY (for all departments except PAED)
// ═══════════════════════════════════════════════════════════════════════════

function GenericPageContent({ deptKey, content }: { deptKey: string; content: any }) {
  const theme = useTheme();
  const t = { ...theme.colors, font: theme.typography.font, mono: theme.typography.mono, id: theme.id };
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [donePhases, setDonePhases] = useState<string[]>([]);
  const [phaseData, setPhaseData] = useState<Record<string, Record<string, any>>>({});
  const isMobile = useUIStore(s => s.isMobile);

  const phases = content.phases || [];

  const goToPhase = (idx: number) => {
    setPhaseIdx(idx);
    window.scrollTo?.({top: 0, behavior: 'smooth'});
  };

  const completePhase = () => {
    const pid = phases[phaseIdx]?.id;
    if (pid && !donePhases.includes(pid)) setDonePhases(prev => [...prev, pid]);
    if (phaseIdx < phases.length - 1) {
      setPhaseIdx(phaseIdx + 1);
      window.scrollTo?.({top: 0, behavior: 'smooth'});
    }
  };

  const handleDataChange = (phaseId: string, key: string, value: any) => {
    setPhaseData(prev => ({
      ...prev,
      [phaseId]: { ...(prev[phaseId]||{}), [key]: value }
    }));
  };

  const activePhase = phases[phaseIdx];
  const PhaseRenderer = activePhase ? getPhaseRenderer(activePhase.id, deptKey) : null;

  return (
    <div style={{ display: 'flex', gap: 24, maxWidth: 1400, margin: '0 auto', padding: '24px 5%', position: 'relative' }}>
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>WORKFLOW</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {phases.map((p: any, idx: number) => {
            const isActive = idx === phaseIdx;
            const isDone = donePhases.includes(p.id);
            return (
              <button key={p.id} onClick={() => goToPhase(idx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
                  border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: isActive ? 'rgba(99,102,241,.12)' : isDone ? 'rgba(99,102,241,.06)' : 'transparent',
                  color: isActive ? '#818cf8' : isDone ? '#818cf8' : '#64748B',
                  fontWeight: isActive ? 700 : isDone ? 600 : 400,
                  fontSize: 12, fontFamily: 'Inter, sans-serif',
                  transition: 'all .12s',
                }}>
                <span style={{ fontSize: 14 }}>{p.icon}</span>
                <span>{p.label}</span>
                {isDone && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {PhaseRenderer && activePhase ? (
          <PhaseRenderer
            phase={activePhase}
            dept={content}
            data={phaseData[activePhase.id]||{}}
            onDataChange={(key: string, val: any) => handleDataChange(activePhase.id, key, val)}
            theme={t}
          />
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
            {phases.length === 0 ? 'No phases defined for this department.' : 'Phase renderer not available.'}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, marginBottom: 60 }}>
          <button onClick={() => { if (phaseIdx > 0) { setPhaseIdx(phaseIdx - 1); window.scrollTo?.({top: 0, behavior: 'smooth'}); } }}
            style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: '.875rem', fontFamily: 'Inter, sans-serif' }}
            disabled={phaseIdx === 0}>← Previous</button>
          {phaseIdx < phases.length - 1 ? (
            <button onClick={completePhase}
              style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#818cf8', color: '#fff', cursor: 'pointer', fontSize: '.875rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
              Complete & Next →
            </button>
          ) : (
            <button onClick={() => {
              const summary = Object.entries(phaseData).map(([pid, pd]) => {
                const p = phases.find((ph: any) => ph.id === pid);
                return `=== ${p?.label||pid} ===\n${pd._notes||'(no notes)'}\n`;
              }).join('\n');
              alert(`Full History Complete!\n\n${summary ? `Summary:\n${summary}` : 'All phases completed.'}`);
            }}
              style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#818cf8', color: '#fff', cursor: 'pointer', fontSize: '.875rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
              ✓ Complete
            </button>
          )}
        </div>
      </div>

      <div style={{ width: 280, flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>DEPARTMENT INFO</div>
        <div style={{ background: 'rgba(255,255,255,.02)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Protocols</div>
          {(content.protocolReferences||[]).slice(0, 2).map((p: any) => (
            <div key={p.name} style={{ fontSize: 11, color: '#94A3B8', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>• {p.name}</div>
          ))}
          <div style={{ marginTop: 12, fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>Key Investigations</div>
          {(content.keyInvestigations||[]).slice(0, 5).map((inv: string) => (
            <div key={inv} style={{ fontSize: 10, color: '#94A3B8', padding: '2px 0' }}>• {inv}</div>
          ))}
          <div style={{ marginTop: 12, fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>Scoring</div>
          {(content.scoringSystems||[]).slice(0, 2).map((s: any) => (
            <div key={s.name} style={{ fontSize: 10, color: '#64748B', padding: '2px 0' }}>• {s.name}</div>
          ))}
          <div style={{ marginTop: 12, fontSize: 10, color: '#475569', borderTop: '1px solid rgba(255,255,255,.04)', paddingTop: 8 }}>
            Phase {phaseIdx+1} of {phases.length}
          </div>
        </div>
      </div>
    </div>
  );
}
