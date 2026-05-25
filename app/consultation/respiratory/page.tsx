'use client';
import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { ThemeProvider, useTheme } from '@/src/ui/themes/ThemeProvider';
import { MainLayout } from '@/src/ui/layouts/MainLayout';
import { usePatientStore } from '@/src/state/patientStore';
import { useUIStore } from '@/src/state/uiStore';
import { computeScores, getSeverity, runInference, symptomMap, signMap } from '@/src/engine/inference/scorer';
import { buildClinicalNote, buildHPI } from '@/src/engine/inference/clinicalNoteBuilder';
import { generateManagementPlan } from '@/src/engine/inference/managementPlanGenerator';
import type { ManagementPlan } from '@/src/types';
import { AdaptiveGuide } from '@/src/ui/components/AdaptiveGuide';
import { AGE_BANDS, ESSENTIAL_DRUGS, MILESTONES, ALL_SYMPTOMS } from '@/src/engine/knowledge-graph/reference';
import { PHASES } from '@/src/ui/layouts/Sidebar';
import { PatientForm, INIT_FORM } from '@/src/types';
import { ScoredDisease, SeverityInfo } from '@/src/engine/inference/types';
import { PrescriptionForm } from '@/components/PrescriptionForm';
import { TreatmentSheet } from '@/components/TreatmentSheet';
import { MonitoringSheets } from '@/components/MonitoringSheets';
import HPIWorkflow from './components/HPIWorkflow';

// -- CLINICAL HELPERS -----------------------------------------------------------
function getAgeBand(mo) {
  return AGE_BANDS.find(b => mo <= b.max) || AGE_BANDS[AGE_BANDS.length-1];
}

function formatAge(mo) {
  const m = parseInt(mo)||0;
  if (m === 0) return "a newborn";
  if (m < 12) return `a ${m}-month-old`;
  const yr = Math.floor(m/12), rem = m%12;
  if (rem === 0) return `a ${yr}-year-old`;
  return `a ${yr}-year, ${rem}-month-old`;
}

// -- TREATMENT REFS (inline � used in renderManagement) ------------------------
const TREATMENT_REFS = [
  { name:"Pneumonia (2-59 months, no SAM)", steps:[
    "Non-severe: Amoxicillin PO 40-45 mg/kg/day in 2-3 divided doses x 5 days",
    "Severe: Benzylpenicillin IV 50,000 IU/kg every 6 h + Gentamicin 7.5 mg/kg once daily",
    "Failure at 48 h: escalate to Ceftriaxone 50 mg/kg once daily IV",
    "Failure at 5 days: consider PCP (check HIV), TB, empyema, or resistant pathogen",
    "Staphylococcal (bulging, effusion, air crescent): Flucloxacillin IV + Gentamicin IV",
  ]},
  { name:"Acute Wheeze / Possible Asthma (>12 months)", steps:[
    "Mild-moderate: Salbutamol 4-8 puffs MDI + spacer every 20 min x 3 doses, then review",
    "Severe: Nebulised salbutamol 2.5-5 mg + ipratropium 250 mcg every 20 min x 3",
    "Add prednisolone PO 1-2 mg/kg/day (max 40 mg) x 3-5 days",
    "Life-threatening: IV magnesium sulphate 25-50 mg/kg over 20 min + IV hydrocortisone",
    "If no response: IV aminophylline loading 6 mg/kg over 1 h; consider PICU",
  ]},
  { name:"Tuberculosis (Intensive Phase - 2RHZE)", steps:[
    "Rifampicin (R) + Isoniazid (H) + Pyrazinamide (Z) + Ethambutol (E) x 2 months",
    "Continuation phase: RH x 4 months (pulmonary TB); RH x 10 months (CNS/bone TB)",
    "Pyridoxine (vitamin B6) 25-50 mg daily throughout treatment",
    "Steroids: prednisolone 2 mg/kg/day x 4 weeks for TB meningitis, pericarditis, miliary with distress",
    "IPT: isoniazid 10 mg/kg/day x 6 months for close contacts with negative workup",
  ]},
  { name:"Severe Malaria", steps:[
    "Artesunate IV/IM: 3 mg/kg (<=20 kg) or 2.4 mg/kg (>20 kg) at 0, 12, and 24 h, then daily",
    "Treat hypoglycaemia: 5 ml/kg of 10% dextrose IV (2 ml/kg if neonate); recheck BGL",
    "Transfuse packed red cells 10 ml/kg if Hb <5 g/dL with respiratory distress",
    "Do NOT give fluid bolus unless child has diarrhoea and clinical shock",
    "Switch to oral artemisinin combination therapy (ACT) when the child can swallow",
  ]},
  { name:"Acute Convulsions (>1 month)", steps:[
    "1st line: IV lorazepam 0.1 mg/kg OR IV diazepam 0.3 mg/kg over 1-2 min OR rectal diazepam 0.5 mg/kg",
    "If still seizing at 5 min: repeat benzodiazepine once",
    "2nd line (at 10 min): IV phenobarbitone 15-20 mg/kg over 10-20 min OR IV phenytoin 15-20 mg/kg",
    "3rd line (refractory, at 30 min): IV levetiracetam 30 mg/kg OR IV sodium valproate 30 mg/kg",
    "Check RBS: give 5 ml/kg of 10% dextrose IV if hypoglycaemic",
    "Treat the underlying cause (fever, meningitis, electrolyte disorder, malaria)",
  ]},
  { name:"DKA (Diabetic Ketoacidosis)", steps:[
    "If shocked: 10 ml/kg 0.9% sodium chloride over 30-60 min (max 40 ml/kg in first 4 h)",
    "Rehydrate remaining deficit + maintenance with 0.9% saline over 48 h; add 40 mmol/L KCl when urine output confirmed",
    "Insulin: start subcutaneous regular insulin 0.2 IU/kg every 4 h (or IV infusion 0.05-0.1 IU/kg/h after first hour)",
    "When glucose falls to 14-17 mmol/L: change to 5% dextrose in 0.9% saline",
    "Cerebral oedema: mannitol 0.5-1 g/kg IV over 20 min OR 3% saline 2.5-5 ml/kg; restrict fluids to 70%",
    "DO NOT give bicarbonate; monitor hourly glucose, neuro-observations, and strict fluid balance",
  ]},
];

// -- UI COMPONENTS (module-level � extracted from PageContent to prevent remount-on-every-render) --
function useT() {
  const theme = useTheme();
  return { ...theme.colors, font: theme.typography.font, mono: theme.typography.mono, id: theme.id };
}

function Inp({value,onChange,placeholder="",type="text",...rest}){
  const t = useT();
  const s: React.CSSProperties = {width:"100%",boxSizing:"border-box",padding:"8px 12px",borderRadius:8,border:`1px solid ${t.border}`,background:t.surface,color:t.text,fontSize:13,outline:"none",fontFamily:t.font,transition:"border-color 0.15s"};
  return <input style={s} type={type} value={value} min={rest.min} max={rest.max} step={rest.step} placeholder={placeholder} onChange={e=>onChange(e.target.value)} />;
}
function Ta({value,onChange,placeholder=""}){
  const t = useT();
  const s: React.CSSProperties = {width:"100%",boxSizing:"border-box",padding:"8px 12px",borderRadius:8,border:`1px solid ${t.border}`,background:t.surface,color:t.text,fontSize:13,outline:"none",fontFamily:t.font,transition:"border-color 0.15s",minHeight:64,resize:"vertical"};
  return <textarea style={s} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} />;
}
function Sel({value,onChange,options,placeholder=""}){
  const t = useT();
  const s: React.CSSProperties = {width:"100%",boxSizing:"border-box",padding:"8px 12px",borderRadius:8,border:`1px solid ${t.border}`,background:t.surface,color:t.text,fontSize:13,outline:"none",fontFamily:t.font,transition:"border-color 0.15s"};
  return <select style={s} value={value} onChange={e=>onChange(e.target.value)}>
    <option value="">{placeholder||"Select..."}</option>
    {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
  </select>;
}
function Section({title,sub="",children}){
  const t = useT();
  return <div style={{marginBottom:24}}>
    <div style={{fontSize:11,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:sub?3:12,paddingBottom:8,borderBottom:`1px solid ${t.border}`}}>{title}</div>
    {sub&&<div style={{fontSize:11,color:t.textMuted,marginBottom:10}}>{sub}</div>}
    {children}
  </div>;
}
function Field({label,children,full=false}){
  const t = useT();
  return <div style={full?{marginBottom:12,gridColumn:"1/-1"}:{marginBottom:12}}>
    <div style={{fontSize:11,fontWeight:600,color:t.textSub,marginBottom:5}}>{label}</div>
    {children}
  </div>;
}
function Grid({cols=2,children}){
  const t = useT();
  const isMobile = useUIStore(s => s.isMobile);
  return <div style={{display:"grid",gridTemplateColumns:isMobile?`1fr`:`repeat(${cols},1fr)`,gap:12,marginBottom:4}}>{children}</div>;
}
function Pills({options,value,onSelect}){
  const t = useT();
  return <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
    {options.map(o=>{
      const v=typeof o==="string"?o:o.value;const l=typeof o==="string"?o:o.label;const w=typeof o==="string"?false:!!o.warn;const sel=value===v;
      return <button key={v} onClick={()=>onSelect(v)} style={{padding:"5px 14px",borderRadius:20,fontSize:12,cursor:"pointer",border:`1px solid ${sel?(w?t.danger:t.accent):(w?t.danger:t.border)}`,background:sel?(w?t.dangerBg:t.accent):(w?"transparent":"transparent"),color:sel?(w?t.danger:"white"):(w?t.danger:t.textSub),fontWeight:sel?600:400,transition:"all 0.12s",fontFamily:t.font}}>{l}</button>;
    })}
  </div>;
}
function BoolPill({label,value,onToggle,warn=false}){
  const t = useT();
  return <button onClick={()=>onToggle(!value)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",borderRadius:8,border:`1px solid ${value?(warn?t.danger:t.accent):(warn?`${t.danger}50`:t.border)}`,background:value?(warn?t.dangerBg:t.accentBg):"transparent",color:value?(warn?t.danger:t.accentText):(warn?t.danger:t.textSub),fontSize:13,cursor:"pointer",transition:"all 0.12s",whiteSpace:"nowrap",fontFamily:t.font}}>
    <span style={{width:15,height:15,borderRadius:4,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${value?(warn?t.danger:t.accent):(warn?`${t.danger}70`:t.borderStrong)}`,background:value?(warn?t.danger:t.accent):"transparent",fontSize:9,color:"white",fontWeight:700}}>{value?"✓":""}</span>
    {label}
  </button>;
}
function VitalInput({label,unit="",val,onChange,warnFn}:any){
  const t = useT();
  const inp: React.CSSProperties = {width:"100%",boxSizing:"border-box",padding:"8px 12px",borderRadius:8,border:`1px solid ${t.border}`,background:t.surface,color:t.text,fontSize:13,outline:"none",fontFamily:t.font,transition:"border-color 0.15s"};
  const n=parseFloat(val);const w=warnFn&&!isNaN(n)?warnFn(n):null;
  return <div style={{marginBottom:12}}>
    <div style={{fontSize:11,fontWeight:600,color:t.textSub,marginBottom:5}}>{label} {unit&&<span style={{fontWeight:400,color:t.textMuted}}>({unit})</span>}</div>
    <input style={{...inp,borderColor:w?t.warn:t.border}} type="number" value={val} onChange={e=>onChange(e.target.value)} />
    {w&&<div style={{fontSize:11,color:t.warn,marginTop:3}}>⚠ {w}</div>}
  </div>;
}
function Card({children,style={}}){
  const t = useT();
  return <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:24,...style}}>{children}</div>;
}
function PhaseHeader({title,sub=""}){
  const t = useT();
  return <div style={{marginBottom:20}}>
    <h2 style={{fontSize:20,fontWeight:700,margin:0,color:t.text,fontFamily:t.font}}>{title}</h2>
    {sub&&<p style={{fontSize:13,color:t.textSub,margin:"6px 0 0",fontFamily:t.font}}>{sub}</p>}
  </div>;
}

// -- MAIN APP -------------------------------------------------------------------
export default function Page() {
  return (
    <ThemeProvider>
      <MainLayout>
        <PageContent />
      </MainLayout>
    </ThemeProvider>
  );
}

function PageContent() {
  const theme = useTheme();
  const t = { ...theme.colors, font: theme.typography.font, mono: theme.typography.mono, id: theme.id };
  const phaseIdx = useUIStore(s => s.phaseIdx);
  const isMobile = useUIStore(s => s.isMobile);
  const form = usePatientStore(s => s.form);
  const [copied, setCopied] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [editedNote, setEditedNote] = useState('');
  const [rxExpanded, setRxExpanded] = useState(false);
  const [txExpanded, setTxExpanded] = useState(false);
  const [monExpanded, setMonExpanded] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [prescriptionSaved, setPrescriptionSaved] = useState<{ medication: string; id: string } | null>(null);
  const [noteEdited, setNoteEdited] = useState(false);
  const scores = useMemo(()=>computeScores(form),[form]);
  const severity = useMemo(()=>getSeverity(form),[form]);
  const differentials = useMemo(()=>runInference(form),[form]);
  const noteText = useMemo(()=>buildClinicalNote(form, differentials),[form, differentials]);
  const plan = useMemo(()=>generateManagementPlan(form, differentials),[form, differentials]);

  const set = useCallback((path, val)=>usePatientStore.getState().setField(path, val), []);
  const toggle = useCallback((path, item)=>usePatientStore.getState().toggleArrayItem(path, item), []);

  // Auto-save
  useEffect(()=>{
    if (!draftLoaded) return;
    const timer=setTimeout(()=>{
      try {
        const f = usePatientStore.getState().form;
        const ui = useUIStore.getState();
        localStorage.setItem("pedsDraft",JSON.stringify({form:f, phaseIdx:ui.phaseIdx, done:ui.donePhases, themeKey:ui.themeId}));
      } catch(e){}
    },2000);
    return ()=>clearTimeout(timer);
  },[form, phaseIdx, draftLoaded]);

  // Load draft
  useEffect(()=>{
    try {
      const saved=localStorage.getItem("pedsDraft");
      if (saved) {
        const p=JSON.parse(saved);
        if (p&&p.form&&window.confirm("Restore previous draft?")) {
          usePatientStore.getState().setForm({...INIT_FORM,...p.form});
          useUIStore.getState().setPhaseIdx(p.phaseIdx||0);
          if (p.done) p.done.forEach(id=>useUIStore.getState().addDonePhase(id));
          if (p.themeKey) useUIStore.getState().setThemeId(p.themeKey);
        }
      }
    } catch(e){}
    setDraftLoaded(true);
  },[]);

  // Keyboard shortcut
  useEffect(()=>{
    const h=e=>{
      if ((e.ctrlKey||e.metaKey)&&e.key==="Enter") {
        e.preventDefault();
        const ui = useUIStore.getState();
        const idx = ui.phaseIdx;
        ui.addDonePhase(PHASES[idx].id);
        ui.setPhaseIdx(Math.min(idx+1,PHASES.length-1));
        window.scrollTo?.(0,0);
      }
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[]);

  // -- PHASE RENDERERS --------------------------------------------------------

// -- CLINICAL CONTEXT HOOK ------------------------------------------------------
interface BiodataContext {
  ageMonths: number;
  ageBand: { label: string; hrMin: number; hrMax: number; rrMin: number; rrMax: number; sbpMin: number; sbpMax: number };
  respiratoryRiskGroup: 'high_risk_infant' | 'toddler_child' | 'older_child';
  keyRespRisks: {
    bronchiolitis: boolean;
    asthma: boolean;
    croup: boolean;
    tb: boolean;
    foreignBody: boolean;
  };
  informantWeight: number;   // 1 = reliable, 0.7 = partially, 0.4 = unreliable/unknown
  tbRiskArea: boolean;        // true if residence suggests high TB burden (e.g., from a map)
}

const HIGH_TB_AREAS = [
  'kampala', 'nairobi', 'dar es salaam', 'lusaka', 'lilongwe', // example cities; extend as needed
  'mombasa', 'kisumu', 'blantyre', 'gulu', 'harare'
];

function useBiodataContext(form: PatientForm): BiodataContext {
  return useMemo(() => {
    const ageMonths = parseInt(form.biodata.ageMonths || '0');
    const band = getAgeBand(ageMonths);

    const respiratoryRiskGroup =
      ageMonths < 12 ? 'high_risk_infant'
      : ageMonths < 60 ? 'toddler_child'
      : 'older_child';

    const keyRespRisks = {
      bronchiolitis: ageMonths < 24,
      asthma: ageMonths >= 12,
      croup: ageMonths >= 6 && ageMonths <= 60,   // widened slightly for clinical safety
      tb: true,                                    // always consider TB in endemic settings
      foreignBody: ageMonths >= 6 && ageMonths <= 84,
    };

    const informantWeight =
      form.biodata.histReliability === 'Reliable' ? 1.0 :
      form.biodata.histReliability === 'Partially Reliable' ? 0.7 :
      0.4; // Unknown or Unreliable

    const residenceLower = (form.biodata.residence || '').toLowerCase();
    const tbRiskArea = HIGH_TB_AREAS.some(area => residenceLower.includes(area));

    return {
      ageMonths,
      ageBand: band,
      respiratoryRiskGroup,
      keyRespRisks,
      informantWeight,
      tbRiskArea,
    };
  }, [form.biodata.ageMonths, form.biodata.residence, form.biodata.histReliability]);
}

// -- MODIFIED renderBiodata() --------------------------------------------------
function renderBiodata() {
  const ctx = useBiodataContext(form);  // clinical context
  const { ageMonths, ageBand, respiratoryRiskGroup, keyRespRisks, informantWeight, tbRiskArea } = ctx;

  return <>
    <PhaseHeader title="Patient Biodata" sub="Demographics, informant, and clinical context — the first diagnostic filter." />
    <Card>
      <Section title="Patient Identification">
        <Grid>
          <Field label="Full Name">
            <Inp value={form.biodata.patientName} onChange={v=>set("biodata.patientName",v)} placeholder="Patient's full name" />
          </Field>
          <Field label="Date of Birth">
            <Inp type="date" value={form.biodata.dob} onChange={v=>set("biodata.dob",v)} />
          </Field>
          <Field label="Age in Months">
            <Inp type="number" value={form.biodata.ageMonths} onChange={v=>set("biodata.ageMonths",v)} placeholder="e.g. 24" min={0} max={216} />
            {/* Age interpretation */}
            {ageMonths > 0 && (
              <div style={{ fontSize: 12, marginTop: 6 }}>
                <span style={{ color: t.text, fontWeight: 600 }}>
                  {formatAge(form.biodata.ageMonths)} — {ageBand.label}
                </span>
                <div style={{ color: t.textSub, marginTop: 4 }}>
                  {respiratoryRiskGroup === 'high_risk_infant' && (
                    <span style={{ color: t.warn }}>⚠ High-risk infant — prioritise bronchiolitis, pneumonia, sepsis.</span>
                  )}
                  {respiratoryRiskGroup === 'toddler_child' && (
                    <span>⚠ Toddler — foreign body, croup, early asthma possible.</span>
                  )}
                  {respiratoryRiskGroup === 'older_child' && (
                    <span>⚠ Older child — asthma, TB, atypical pneumonia more common.</span>
                  )}
                </div>
              </div>
            )}
          </Field>
          <Field label="Sex">
            <Pills options={["Male","Female"]} value={form.biodata.sex} onSelect={v=>set("biodata.sex",v)} />
          </Field>
          <Field label="Residence (Town/Village)">
            <Inp value={form.biodata.residence} onChange={v=>set("biodata.residence",v)} placeholder="e.g. Kampala" />
            {tbRiskArea && (
              <div style={{ fontSize: 11, color: t.warn, marginTop: 4 }}>
                High TB-burden area — maintain lower threshold for TB workup.
              </div>
            )}
          </Field>
          <Field label="Date of Admission">
            <Inp type="date" value={form.biodata.dateOfAdmission} onChange={v=>set("biodata.dateOfAdmission",v)} />
          </Field>
        </Grid>

        <Field label="Source of Referral" full>
          <Sel value={form.biodata.sourceOfReferral} onChange={v=>set("biodata.sourceOfReferral",v)}
            options={[
              {value:"self",label:"Self-referred / Walk-in"},
              {value:"primary_care",label:"Primary care / Health centre"},
              {value:"hospital",label:"Another hospital / Emergency dept"},
              {value:"private",label:"Private practitioner"},
              {value:"community",label:"Community health worker"},
              {value:"other",label:"Other"}
            ]} />
        </Field>
      </Section>

      <Section title="Informant & History Quality">
        <Grid>
          <Field label="Informant Name">
            <Inp value={form.biodata.informant} onChange={v=>set("biodata.informant",v)} placeholder="Name of person giving history" />
          </Field>
          <Field label="Relationship to Child">
            <Inp value={form.biodata.informantRelation} onChange={v=>set("biodata.informantRelation",v)} placeholder="e.g. Mother, Father, Guardian" />
          </Field>
        </Grid>
        <Field label="Reliability of History" full>
          <Pills options={["Reliable","Partially Reliable","Unreliable","Unknown"]}
            value={form.biodata.histReliability} onSelect={v=>set("biodata.histReliability",v)} />
          {form.biodata.histReliability && (
            <div style={{ fontSize: 11, marginTop: 4, color: informantWeight < 0.8 ? t.warn : t.textSub }}>
              {informantWeight < 0.8
                ? `Diagnostic confidence reduced — history weighted at ${informantWeight*100}%`
                : `Good informant — history carries full diagnostic weight.`}
            </div>
          )}
        </Field>
      </Section>

      {/* CLINICAL CONTEXT SUMMARY (now the engine drives UI) */}
      <div style={{
        marginTop: 20,
        padding: '16px',
        background: t.surfaceAlt,
        borderRadius: 12,
        border: `1px solid ${t.border}`,
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: t.text, marginBottom: 12 }}>
          🔬 Active Respiratory Risk Profile
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <Row label="Age risk group" value={
            respiratoryRiskGroup === 'high_risk_infant' ? 'High-risk infant (<1 yr)' :
            respiratoryRiskGroup === 'toddler_child' ? 'Toddler/child (1-5 yr)' :
            'Older child (>5 yr)'
          } />
          <Row label="Likely diagnoses" value={
            Object.entries(keyRespRisks)
              .filter(([_, v]) => v)
              .map(([k]) => k.replace(/([A-Z])/g, ' $1').trim())
              .join(', ')
          } />
          <Row label="TB priority" value={tbRiskArea ? 'High — residence in endemic area' : 'Standard — keep in differential'} />
          <Row label="Informant confidence" value={`${Math.round(informantWeight * 100)}%`} />
        </div>
      </div>
    </Card>

    {/* Adaptive questions can now use the clinical context */}
  </>;
}

// Simple inline row component for the risk profile box
const Row = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
    <span style={{ color: t.textSub }}>{label}</span>
    <span style={{ color: t.text, fontWeight: 500 }}>{value}</span>
  </div>
);

// -- CONSTANTS ------------------------------------------------------------------
// Severity weights for priority sorting (higher = more dangerous, shown first)
const SYMPTOM_SEVERITY: Record<string, number> = {
  cyanosis: 10,
  chest_indrawing: 9,
  stridor: 9,
  difficulty_breathing: 8,
  apnoea: 8,
  convulsions: 7,
  altered_consciousness: 7,
  drooling: 6,
  hemoptysis: 6,
  feeding_difficulty: 5,
  tachypnea: 5,
  wheeze: 4,
  cough: 3,
  fever: 3,
  sore_throat: 2,
  nasal_discharge: 1,
};

// Clinical category grouping
const SYMPTOM_CATEGORIES: Record<string, string[]> = {
  respiratory: ['cough', 'wheeze', 'stridor', 'difficulty_breathing', 'chest_indrawing', 'cyanosis', 'fast_breathing', 'noisy_breathing', 'chest_tightness', 'hemoptysis', 'nasal_discharge'],
  infective: ['fever', 'lethargy', 'night_sweats', 'weight_loss', 'rash'],
  severe: ['cyanosis', 'chest_indrawing', 'stridor', 'difficulty_breathing', 'apnoea', 'drooling', 'tripod_posture', 'altered_consciousness'],
  neurological: ['convulsions', 'altered_consciousness', 'seizures', 'headache', 'visual_disturbance'],
  other: []
};

function categorizeSymptom(symptomId: string): string {
  for (const [cat, ids] of Object.entries(SYMPTOM_CATEGORIES)) {
    if (ids.includes(symptomId)) return cat;
  }
  return 'other';
}

// -- HELPER: build narrative ----------------------------------------------------
function buildIllnessNarrative(
  orderedSymptoms: { id: string; label: string; duration: string }[]
): string {
  if (orderedSymptoms.length === 0) return '';

  const parts = orderedSymptoms.map((s, i) => {
    const duration = s.duration ? `lasting ${s.duration}` : 'of unknown duration';
    const prefix = i === 0 ? 'The illness began' : 'followed by';
    return `${prefix} ${s.label.toLowerCase()} (${duration})`;
  });

  return parts.join(', ') + '.';
}

// -- COMPONENT: renderComplaints (UPGRADED) ------------------------------------
function renderComplaints() {
  const [symptomOrder, setSymptomOrder] = useState<string[]>(() => [...form.complaints]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Sync order with actual selected complaints (deduplicated)
  const orderedList = useMemo(() => {
    const unique = [...new Set(form.complaints)];
    const existingOrdered = [...new Set(symptomOrder.filter(id => unique.includes(id)))];
    const newIds = unique.filter(id => !existingOrdered.includes(id));
    return [...existingOrdered, ...newIds];
  }, [form.complaints, symptomOrder]);

  // Group symptoms by clinical category
  const grouped = useMemo(() => {
    const groups: Record<string, string[]> = {};
    orderedList.forEach(id => {
      const cat = categorizeSymptom(id);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(id);
    });
    return groups;
  }, [orderedList]);

  // Sort groups to show high-priority first (severe, then respiratory, infective, neuro, other)
  const groupOrder = ['severe', 'respiratory', 'infective', 'neurological', 'other'];
  const sortedGroups = groupOrder.filter(cat => grouped[cat]?.length > 0);

  // Build narrative for live preview
  const narrative = useMemo(() => {
    const symptomsWithLabels = orderedList.map(id => {
      const sym = ALL_SYMPTOMS.find(s => s.id === id);
      return {
        id,
        label: sym?.label || id,
        duration: form.complaintDurations[id] || ''
      };
    });
    return buildIllnessNarrative(symptomsWithLabels);
  }, [orderedList, form.complaintDurations]);

  // Move symptom up or down in order
  const moveSymptom = (id: string, direction: 'up' | 'down') => {
    const idx = orderedList.indexOf(id);
    if (idx === -1) return;
    const newOrder = [...orderedList];
    if (direction === 'up' && idx > 0) {
      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    } else if (direction === 'down' && idx < orderedList.length - 1) {
      [newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]];
    }
    setSymptomOrder(newOrder);
  };

  // Drag-and-drop handlers (simple version)
  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const currentOrder = [...orderedList];
    const fromIdx = currentOrder.indexOf(draggedId);
    const toIdx = currentOrder.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    currentOrder.splice(fromIdx, 1);
    currentOrder.splice(toIdx, 0, draggedId);
    setSymptomOrder(currentOrder);
    setDraggedId(null);
  };

  return <>
        <PhaseHeader title="Chief Complaints" sub="Capture the illness story — what started first? Then what followed?" />
    <Card>
      <AdaptiveGuide phaseIdx={1} />

      {/* -- 1. SYMPTOM SELECTION (by group) ---------------------------------- */}
      <Section title="Select all symptoms — click in order of appearance">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {groupOrder.map(cat => {
            const symptomsInCat = SYMPTOM_CATEGORIES[cat] || [];
            if (symptomsInCat.length === 0) return null;
            return (
              <div key={cat}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: t.textMuted, marginBottom: 8 }}>
                  {cat === 'severe' ? '🚨 Emergency Signs' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                  {symptomsInCat.map(symId => {
                    const sym = ALL_SYMPTOMS.find(s => s.id === symId);
                    if (!sym) return null;
                    const sel = form.complaints.includes(symId);
                    return (
                      <button key={symId}
                        onClick={() => {
                          toggle("complaints", symId);
                          if (!sel) {
                            // new symptom added: append to end of order
                            setSymptomOrder(prev => [...prev, symId]);
                          } else {
                            // removal handled by sync via orderedList
                            setSymptomOrder(prev => prev.filter(id => id !== symId));
                          }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '9px 14px', borderRadius: 8, textAlign: 'left',
                          border: `1px solid ${sel ? (sym.warn ? t.danger : t.accent) : (sym.warn ? `${t.danger}50` : t.border)}`,
                          background: sel ? (sym.warn ? t.dangerBg : t.accentBg) : 'transparent',
                          color: sel ? (sym.warn ? t.danger : t.accentText) : t.text,
                          fontSize: 13, cursor: 'pointer', transition: 'all 0.12s',
                          fontWeight: sel ? 600 : 400,
                        }}
                      >
                        <span style={{
                          width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `1.5px solid ${sel ? (sym.warn ? t.danger : t.accent) : t.borderStrong}`,
                          background: sel ? (sym.warn ? t.danger : t.accent) : 'transparent',
                          fontSize: 9, color: 'white', fontWeight: 700,
                        }}>{sel ? '✓' : ''}</span>
                        {sym.label}
                        {sym.warn && <span style={{ fontSize: 10, color: t.danger, marginLeft: 'auto' }}>⚠</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* -- 2. CHRONOLOGICAL TIMELINE & ORDERING ------------------------------ */}
      {orderedList.length > 0 && (
        <Section title="Illness Timeline — drag or use arrows to reorder (earliest first)">
          <div style={{ background: t.surfaceAlt, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 12 }}>
              📖 Story builder: {narrative}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {orderedList.map((id, idx) => {
                const sym = ALL_SYMPTOMS.find(s => s.id === id);
                const isLast = idx === orderedList.length - 1;
                return (
                  <div key={id}
                    draggable
                    onDragStart={() => handleDragStart(id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '8px 12px', borderRadius: 8,
                      background: t.surface, border: `1px solid ${t.border}`,
                      cursor: 'grab', userSelect: 'none',
                      opacity: draggedId === id ? 0.5 : 1,
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: t.accent, color: 'white', fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13, color: t.text }}>
                        {sym?.label || id}
                      </div>
                      <div style={{ fontSize: 11, color: t.textSub, marginTop: 2 }}>
                        Duration: {form.complaintDurations[id] || 'not set'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => moveSymptom(id, 'up')}
                        disabled={idx === 0}
                        style={miniBtn(t, idx === 0)}>▲</button>
                      <button onClick={() => moveSymptom(id, 'down')}
                        disabled={idx === orderedList.length - 1}
                        style={miniBtn(t, idx === orderedList.length - 1)}>▼</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 10, color: t.textMuted, marginTop: 8 }}>
              Drag items to reorder, or use ?? buttons. The first symptom should be the one that appeared earliest.
            </div>
          </div>

          {/* Duration inputs (now inline with timeline) */}
          <Grid>
            {orderedList.map(id => (
              <Field key={id} label={`Duration of ${ALL_SYMPTOMS.find(s => s.id === id)?.label || id}`}>
                <Inp
                  value={form.complaintDurations[id] || ''}
                  placeholder="e.g. 3 days"
                  onChange={v => set("complaintDurations", { ...form.complaintDurations, [id]: v })}
                />
              </Field>
            ))}
          </Grid>
        </Section>
      )}

      {form.complaints.length === 0 && (
        <div style={{ textAlign: 'center', color: t.textMuted, fontSize: 13, padding: '24px 0' }}>
          Select at least one symptom above to continue. Click in the order they appeared.
        </div>
      )}
    </Card>
  </>;
}

// Small utility for mini buttons
const miniBtn = (t: any, disabled: boolean): React.CSSProperties => ({
  width: 26, height: 26, borderRadius: 6,
  border: `1px solid ${t.border}`,
  background: disabled ? t.surfaceAlt : t.surface,
  color: disabled ? t.textMuted : t.text,
  cursor: disabled ? 'default' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 12, fontWeight: 600,
});

 // -- HPI ENGINE (compute from form) ----------------------------------------------
interface TimelineEvent {
  id: string;
  symptomLabel: string;
  day: number;           // estimated day of onset (1 = first symptom)
  duration: string;
  severity: string;      // 'mild','moderate','severe','critical'
  category: string;      // 'respiratory','infective','severe','neurological','other'
}

function useHPIEngine(form: PatientForm, clinicalContext: BiodataContext): {
  timeline: TimelineEvent[];
  prioritizedSymptoms: string[];
  narrative: string;
  missingCriticalQuestions: string[];
  ddxDrivenQuestions: string[];
  redFlags: string[];
  severityScore: number;
} {
  return useMemo(() => {
    const order = form.complaints; // use actual selected complaints in selection order
    const durations = form.complaintDurations;
    const allSymptoms = ALL_SYMPTOMS;
    const ageMonths = clinicalContext.ageMonths;

    // Build timeline events
    const timeline: TimelineEvent[] = order
      .filter(id => form.complaints.includes(id)) // only selected ones
      .map((id, idx) => {
        const sym = allSymptoms.find(s => s.id === id) || { id, label: id.replace(/_/g,' '), warn: false };
        const severityWeight = SYMPTOM_SEVERITY[id] || 1;
        let severity = 'mild';
        if (severityWeight >= 8) severity = 'critical';
        else if (severityWeight >= 6) severity = 'severe';
        else if (severityWeight >= 4) severity = 'moderate';
        return {
          id,
          symptomLabel: sym.label,
          day: idx + 1, // assumption: order = onset order (first selected = day 1)
          duration: durations[id] || 'unknown',
          severity,
          category: categorizeSymptom(id),
        };
      });

    // Prioritize symptoms for deep-dive: critical first, then severe, respiratory, etc.
    const categoryPriority: Record<string, number> = {
      critical: 0, severe: 1, respiratory: 2, infective: 3, neurological: 4, other: 5,
    };
    const prioritizedSymptoms = timeline
      .sort((a, b) => {
        const catA = a.severity === 'critical' ? 'critical' : a.severity === 'severe' ? 'severe' : a.category;
        const catB = b.severity === 'critical' ? 'critical' : b.severity === 'severe' ? 'severe' : b.category;
        const pA = categoryPriority[catA] ?? 10;
        const pB = categoryPriority[catB] ?? 10;
        return pA - pB || a.day - b.day;
      })
      .map(e => e.id);

    // Missing critical questions based on differentials (using inference)
    const differentials = runInference(form);

    // Build consultant-level narrative using the engine
    const narrative = timeline.length > 0
      ? buildHPI(form, differentials)
      : 'No symptoms selected.';
    const topDisease = differentials[0]?.disease;
    const missingCriticalQuestions: string[] = [];
    const ddxDrivenQuestions: string[] = [];

    // Check for high-impact missing features from top disease's diagnostic clues and exam features
    if (topDisease) {
      // clues from diagnosticClues (like "barking cough", "drooling")
      if (topDisease.diagnosticClues) {
        topDisease.diagnosticClues.forEach(clue => {
          const lower = clue.toLowerCase();
          if (lower.includes('barking cough') && form.hpi.coughChar !== 'barking') {
            missingCriticalQuestions.push('Is the cough barking (seal-like)?');
          }
          if (lower.includes('drooling') && !form.hpi.drooling) {
            missingCriticalQuestions.push('Has there been drooling or difficulty swallowing?');
          }
          if (lower.includes('toxic') && form.vitals.generalCondition !== 'toxic' && form.vitals.generalCondition !== 'very_sick') {
            missingCriticalQuestions.push('Does the child appear toxic or severely ill?');
          }
        });
      }
      // From historyFeatures that are high-weight but missing
      if (topDisease.historyFeatures) {
        topDisease.historyFeatures.forEach(f => {
          const present = symptomMap[f.symptomId]?.(form, clinicalContext as any) || false;
          if (!present && (f.weight || 0) >= 4) {
            const symLabel = ALL_SYMPTOMS.find(s => s.id === f.symptomId)?.label || f.symptomId;
            ddxDrivenQuestions.push(`To differentiate ${topDisease.name}, ask about: ${symLabel}?`);
          }
        });
      }
    }

    // Red flags
    const redFlags: string[] = [];
    if (form.hpi.chestIndrawing || form.vitals.examIndrawing) redFlags.push('Chest indrawing');
    if (form.hpi.drooling && form.hpi.tripodPosition) redFlags.push('Epiglottitis (drooling + tripod)');
    if (form.hpi.suddenOnset && form.hpi.unilateralWheeze) redFlags.push('Foreign body aspiration (sudden + unilateral wheeze)');
    if (form.hpi.cyanoticEpisodes) redFlags.push('Cyanotic episodes');
    if (form.hpi.feedingDiff && form.hpi.chestIndrawing) redFlags.push('Severe pneumonia (feeding difficulty + chest indrawing)');

    // Severity score (simple count of severe flags)
    const severityCount = redFlags.length + timeline.filter(e => e.severity === 'severe' || e.severity === 'critical').length;

    return {
      timeline,
      prioritizedSymptoms,
      narrative,
      missingCriticalQuestions,
      ddxDrivenQuestions,
      redFlags,
      severityScore: severityCount,
    };
  }, [form, clinicalContext]);
}

// -- RENDER HPI (CONSULTANT-LEVEL) ----------------------------------------------
function renderHpi() {
  const clinicalContext = useBiodataContext(form); // from earlier upgrade
  const {
    timeline,
    prioritizedSymptoms,
    narrative,
    missingCriticalQuestions,
    ddxDrivenQuestions,
    redFlags,
    severityScore,
  } = useHPIEngine(form, clinicalContext);

  const differentials = useMemo(() => runInference(form), [form]);
  const topDiff = differentials.slice(0, 3);

  // Sort the symptom deep-dive modules: highest priority first
  const symptomModules = prioritizedSymptoms.map(id => {
    // each module renders based on id (cough, fever, wheeze, etc.)
    return { id, key: id };
  });

  return <>
    <PhaseHeader title="History of Presenting Illness" sub="Consultant-level timeline, deep-dive characterisation, and differential-driven reasoning." />
    <Card>
      <AdaptiveGuide phaseIdx={2} />

      {/* -- 1. LIVE NARRATIVE & TIMELINE BAR ----------------------------------- */}
      <Section title="Illness Narrative (auto-generated)">
        <div style={{ background: t.surfaceAlt, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: t.text, fontWeight: 500, fontStyle: 'italic' }}>
            {narrative}
          </div>
        </div>

        {/* Visual timeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {timeline.map((event, idx) => (
            <React.Fragment key={event.id}>
              <div style={{
                background: event.severity === 'critical' ? t.dangerBg : event.severity === 'severe' ? t.warnBg : t.accentBg,
                borderRadius: 20, padding: '6px 12px',
                display: 'flex', alignItems: 'center', gap: 6,
                border: `1px solid ${event.severity === 'critical' ? t.danger : event.severity === 'severe' ? t.warn : t.accent}`,
              }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: t.text }}>Day {event.day}</span>
                <span style={{ fontSize: 12, color: t.text }}>{event.symptomLabel}</span>
                {event.severity === 'critical' && <span style={{ color: t.danger, fontWeight: 700, fontSize: 11 }}>⚠</span>}
              </div>
              {idx < timeline.length - 1 && <span style={{ color: t.textMuted }}>↓</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Onset & progression (contextual) */}
        <Grid>
          <Field label="Overall Onset">
            <Pills options={[{value:"sudden",label:"Sudden / Acute"},{value:"gradual",label:"Gradual / Progressive"}]}
              value={form.hpi.onsetType} onSelect={v=>set("hpi.onsetType",v)} />
          </Field>
          <Field label="Progression Pattern">
            <Pills options={["Worsening","Improving","Fluctuating","Static"].map(v=>({value:v.toLowerCase(),label:v}))}
              value={form.hpi.progression} onSelect={v=>set("hpi.progression",v)} />
          </Field>
        </Grid>

        {/* Full narrative text field (still editable for additional detail) */}
        <Field label="Detailed Narrative (free-text)" full>
          <Ta value={form.hpi.associated} onChange={v=>set("hpi.associated",v)}
            placeholder="Add any additional chronological details, treatments given, response, or pertinent negatives (e.g., no cyanosis, no convulsions)..." />
        </Field>
      </Section>

      {/* -- 2. RED FLAGS & SEVERITY ALERTS ------------------------------------ */}
      {redFlags.length > 0 && (
        <Section title="🚨 Red Flags & Safety Alerts">
          <div style={{ background: t.dangerBg, borderRadius: 10, padding: 12, border: `1px solid ${t.danger}` }}>
            <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 12, color: t.danger, fontWeight: 600 }}>
              {redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
            </ul>
          </div>
        </Section>
      )}

      {/* -- 3. LIVE DIFFERENTIAL PANEL ---------------------------------------- */}
      <Section title="Live Working Differential (updated continuously)">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {topDiff.map((d, i) => (
            <div key={d.disease.id} style={{
              flex: 1, minWidth: 180,
              background: i === 0 ? t.accentBg : t.surfaceAlt,
              borderRadius: 10, padding: 12,
              border: `1px solid ${i === 0 ? t.accent : t.border}`
            }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: t.text }}>
                {d.disease.name}
              </div>
              <div style={{ fontSize: 11, color: t.textSub, marginTop: 4 }}>
                Probability: {Math.round(d.probability * 100)}%
              </div>
              <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>
                {d.evidence.historyHits.slice(0, 3).join(', ')}
              </div>
            </div>
          ))}
        </div>
        {missingCriticalQuestions.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: t.warn }}>
            ⚠ Missing critical details: {missingCriticalQuestions.join('; ')}
          </div>
        )}
      </Section>

      {/* -- 4. STRUCTURED PER-SYMPTOM WORKFLOW (replaces deep-dives, rule-outs, feeding, and respiratory distress sections) -- */}
      <Section title="Structured Symptom Workup — complete each card chronologically">
        <HPIWorkflow form={form} set={set} symptomOrder={[...new Set(form.complaints)]} />
      </Section>

      {/* -- 8. PRIOR TREATMENT & HEALTHCARE-SEEKING ---------------------------- */}
      <Section title="Prior Treatment & Healthcare Seeking">
        <Grid>
          <Field label="Treatment Already Received"><Inp value={form.hpi.prevTx} onChange={v=>set("hpi.prevTx",v)} placeholder="e.g. Paracetamol, ceftriaxone IM" /></Field>
          <Field label="Response to Treatment"><Inp value={form.hpi.txResponse} onChange={v=>set("hpi.txResponse",v)} placeholder="e.g. Partial improvement, worsening" /></Field>
        </Grid>
        <Field label="Healthcare-Seeking Timeline" full>
          <Inp value={form.hpi.radiation} onChange={v=>set("hpi.radiation",v)} placeholder="e.g. Day 1: chemist → Day 3: referral hospital" />
        </Field>
      </Section>
    </Card>

  </>;
}



// -- UPGRADED renderPmh() � Consultant-Grade Past Medical History ----------

function renderPmh() {
  const clinicalContext = useBiodataContext(form);
  // Existing fields from form (still supported)
  const hasPrevAdmissions = form.pmh.prevAdmissions;
  const chronicIllnesses = form.pmh.chronicIllnesses || [];
  const prevAdmDetail = form.pmh.prevAdmDetail;
  const allergies = form.pmh.allergies;
  const currentMeds = form.pmh.medications;
  const prevSurgeries = form.pmh.prevSurgeries;
  const surgeryDetail = form.pmh.surgeryDetail;

  // New structured data (add these to your PatientForm store if not already)
  const conditions: PMHCondition[] = (form.pmh as any).conditions || [];
  const surgeries: SurgeryHistory[] = (form.pmh as any).surgeries || [];
  const infection: InfectionStatus = (form.pmh as any).infectionStatus || {};
  const transfusions: Transfusion[] = (form.pmh as any).transfusions || [];

  // Helpers to update arrays
  const addCondition = () => {
    const newCondition: PMHCondition = {
      id: Date.now().toString(),
      name: '',
      diagnosedYear: '',
      severity: 'unknown',
      currentStatus: 'active',
      medications: [],
      complications: [],
    };
    set("pmh.conditions", [...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<PMHCondition>) => {
    set("pmh.conditions", conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCondition = (id: string) => {
    set("pmh.conditions", conditions.filter(c => c.id !== id));
  };

  const addSurgery = () => {
    const newSurgery: SurgeryHistory = {
      id: Date.now().toString(),
      procedure: '',
      indication: '',
      year: '',
      facility: '',
      anesthesiaType: 'general',
      complications: [],
      transfusion: false,
    };
    set("pmh.surgeries", [...surgeries, newSurgery]);
  };

  const updateSurgery = (id: string, updates: Partial<SurgeryHistory>) => {
    set("pmh.surgeries", surgeries.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSurgery = (id: string) => {
    set("pmh.surgeries", surgeries.filter(s => s.id !== id));
  };

  const addTransfusion = () => {
    const newTx: Transfusion = {
      id: Date.now().toString(),
      date: '',
      reason: '',
      reaction: 'none',
    };
    set("pmh.transfusions", [...transfusions, newTx]);
  };

  const updateTransfusion = (id: string, updates: Partial<Transfusion>) => {
    set("pmh.transfusions", transfusions.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
  };

  const removeTransfusion = (id: string) => {
    set("pmh.transfusions", transfusions.filter(tx => tx.id !== id));
  };

  return (
    <>
      <AdaptiveGuide phaseIdx={3} />
      <PhaseHeader
        title="Past Medical History"
        sub="Structured chronic conditions, surgical/anesthesia history, transfusion record, and infection risk profile."
      />
      <Card>
        {/* -- NIL HISTORY (medicolegal completeness) -- */}
        <Section title="NIL History — confirm absence of major events">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <BoolPill
              label="No chronic illnesses known"
              value={(form.pmh as any).noChronicIllness}
              onToggle={v => set("pmh.noChronicIllness", v)}
            />
            <BoolPill
              label="No previous surgeries"
              value={(form.pmh as any).noSurgeries}
              onToggle={v => set("pmh.noSurgeries", v)}
            />
            <BoolPill
              label="No previous blood transfusions"
              value={(form.pmh as any).noTransfusions}
              onToggle={v => set("pmh.noTransfusions", v)}
            />
            <BoolPill
              label="No known drug allergies"
              value={(form.pmh as any).noAllergies}
              onToggle={v => set("pmh.noAllergies", v)}
            />
          </div>
        </Section>

        {/* -- 1. CHRONIC CONDITIONS (card-based) -- */}
        <Section title="Chronic Medical Conditions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {conditions.length === 0 && !(form.pmh as any).noChronicIllness && (
              <div style={{ fontSize: 12, color: t.textMuted, textAlign: 'center', padding: 12 }}>
                No conditions recorded. Click "Add Condition" or select NIL above.
              </div>
            )}
            {conditions.map((cond) => (
              <ConditionCard
                key={cond.id}
                condition={cond}
                onChange={(updates) => updateCondition(cond.id, updates)}
                onRemove={() => removeCondition(cond.id)}
              />
            ))}
            <button
              onClick={addCondition}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px dashed ${t.accent}`,
                background: 'transparent',
                color: t.accent,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                alignSelf: 'flex-start',
              }}
            >
              + Add Condition
            </button>
          </div>
          {/* Legacy quick-select still available */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textSub, marginBottom: 4 }}>
              Quick-add common respiratory-relevant conditions:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {["Asthma", "Sickle Cell Disease", "Epilepsy", "Congenital Heart Disease", "HIV/AIDS", "Cystic Fibrosis", "Immunodeficiency", "Diabetes Mellitus", "Down Syndrome", "Cerebral Palsy", "Chronic Kidney Disease"].map(ill => {
                const alreadyAdded = conditions.some(c => c.name === ill);
                return (
                  <button
                    key={ill}
                    onClick={() => {
                      if (!alreadyAdded) {
                        const newCond: PMHCondition = {
                          id: Date.now().toString(),
                          name: ill,
                          diagnosedYear: '',
                          severity: 'unknown',
                          currentStatus: 'active',
                          medications: [],
                          complications: [],
                        };
                        set("pmh.conditions", [...conditions, newCond]);
                      }
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      cursor: alreadyAdded ? 'default' : 'pointer',
                      border: `1px solid ${alreadyAdded ? t.border : t.accent}`,
                      background: alreadyAdded ? t.surfaceAlt : 'transparent',
                      color: alreadyAdded ? t.textMuted : t.accent,
                      opacity: alreadyAdded ? 0.6 : 1,
                    }}
                  >
                    {ill}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* -- 2. SURGICAL HISTORY (with anesthesia) -- */}
        <Section title="Surgical History & Anesthesia">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {surgeries.length === 0 && !(form.pmh as any).noSurgeries && (
              <div style={{ fontSize: 12, color: t.textMuted, textAlign: 'center', padding: 12 }}>
                No surgeries recorded. Click "Add Surgery" or select NIL.
              </div>
            )}
            {surgeries.map((surgery) => (
              <SurgeryCard
                key={surgery.id}
                surgery={surgery}
                onChange={(updates) => updateSurgery(surgery.id, updates)}
                onRemove={() => removeSurgery(surgery.id)}
              />
            ))}
            <button
              onClick={addSurgery}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px dashed ${t.accent}`,
                background: 'transparent',
                color: t.accent,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                alignSelf: 'flex-start',
              }}
            >
              + Add Surgery
            </button>
          </div>
        </Section>

        {/* -- 3. TRANSFUSION HISTORY -- */}
        <Section title="Blood Transfusion History">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transfusions.length === 0 && !(form.pmh as any).noTransfusions && (
              <div style={{ fontSize: 12, color: t.textMuted, textAlign: 'center', padding: 12 }}>
                No transfusions recorded.
              </div>
            )}
            {transfusions.map((tx) => (
              <TransfusionCard
                key={tx.id}
                transfusion={tx}
                onChange={(updates) => updateTransfusion(tx.id, updates)}
                onRemove={() => removeTransfusion(tx.id)}
              />
            ))}
            <button
              onClick={addTransfusion}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px dashed ${t.accent}`,
                background: 'transparent',
                color: t.accent,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                alignSelf: 'flex-start',
              }}
            >
              + Add Transfusion
            </button>
          </div>
        </Section>

        {/* -- 4. INFECTION & SEROLOGY STATUS -- */}
        <Section title="Infection Risk & Serology">
          <Grid>
            <Field label="HIV Status">
              <Pills
                options={[
                  { value: 'negative', label: 'Negative' },
                  { value: 'positive', label: 'Positive' },
                  { value: 'unknown', label: 'Unknown' },
                ]}
                value={infection.hivStatus || ''}
                onSelect={v => set("pmh.infectionStatus", { ...infection, hivStatus: v })}
              />
            </Field>
            {infection.hivStatus === 'positive' && (
              <>
                <Field label="On ART?">
                  <BoolPill
                    label="On ART"
                    value={infection.onART || false}
                    onToggle={v => set("pmh.infectionStatus", { ...infection, onART: v })}
                  />
                </Field>
                <Field label="CD4 count / Viral load">
                  <Inp
                    value={infection.cd4ViralLoad || ''}
                    onChange={v => set("pmh.infectionStatus", { ...infection, cd4ViralLoad: v })}
                    placeholder="e.g. CD4 350, VL <50"
                  />
                </Field>
              </>
            )}
          </Grid>
          <Grid>
            <Field label="Hepatitis B">
              <Pills
                options={['Negative', 'Positive', 'Unknown']}
                value={infection.hepB || ''}
                onSelect={v => set("pmh.infectionStatus", { ...infection, hepB: v })}
              />
            </Field>
            <Field label="Hepatitis C">
              <Pills
                options={['Negative', 'Positive', 'Unknown']}
                value={infection.hepC || ''}
                onSelect={v => set("pmh.infectionStatus", { ...infection, hepC: v })}
              />
            </Field>
          </Grid>
          <Field label="Other relevant infectious history (TB, P24, etc.)" full>
            <Inp
              value={infection.other || ''}
              onChange={v => set("pmh.infectionStatus", { ...infection, other: v })}
              placeholder="e.g. TB treatment completed 2022, P24 negative"
            />
          </Field>
        </Section>

        {/* -- 5. LONG-TERM MEDICATIONS (summary) -- */}
        <Section title="Current Long-Term Medications">
          <Field label="Drug & Dose" full>
            <Inp
              value={form.pmh.medications || ''}
              onChange={v => set("pmh.medications", v)}
              placeholder="e.g. Salbutamol 100 mcg 2 puffs PRN, Lamivudine 150 mg BD"
            />
          </Field>
          <BoolPill
            label="Adherence difficulties suspected"
            value={(form.pmh as any).adherenceIssues || false}
            onToggle={v => set("pmh.adherenceIssues", v)}
          />
        </Section>

        {/* -- 6. ALLERGIES & ADVERSE REACTIONS -- */}
        <Section title="Allergies & Drug Reactions">
          <Grid>
            <Field label="Known Allergies">
              <Inp
                value={form.pmh.allergies || ''}
                onChange={v => set("pmh.allergies", v)}
                placeholder="Drug, food, environmental"
              />
            </Field>
            <Field label="Adverse Drug Reactions">
              <Inp
                value={(form.pmh as any).adverseDrugReactions || ''}
                onChange={v => set("pmh.adverseDrugReactions", v)}
                placeholder="e.g. rash after penicillin"
              />
            </Field>
          </Grid>
        </Section>
      </Card>

    </>
  );
}

// -- SUB-COMPONENTS for structured entries -----------------------------------

const ConditionCard = ({ condition, onChange, onRemove }: {
  condition: PMHCondition;
  onChange: (updates: Partial<PMHCondition>) => void;
  onRemove: () => void;
}) => (
  <div style={{ background: t.surfaceAlt, borderRadius: 10, padding: 12, border: `1px solid ${t.border}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 12, color: t.text }}>
        {condition.name || 'New Condition'}
      </div>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: t.danger, cursor: 'pointer', fontSize: 12 }}>✕</button>
    </div>
    <Grid>
      <Field label="Condition Name">
        <Inp value={condition.name} onChange={v => onChange({ name: v })} placeholder="e.g. Asthma" />
      </Field>
      <Field label="Year of Diagnosis">
        <Inp value={condition.diagnosedYear || ''} onChange={v => onChange({ diagnosedYear: v })} placeholder="e.g. 2020" />
      </Field>
    </Grid>
    <Field label="Severity">
      <Pills
        options={['Mild', 'Moderate', 'Severe', 'Unknown']}
        value={condition.severity || 'unknown'}
        onSelect={v => onChange({ severity: v as PMHCondition['severity'] })}
      />
    </Field>
    <Field label="Control Status">
      <Pills
        options={['Active', 'Controlled', 'Poorly controlled', 'Resolved']}
        value={condition.currentStatus || 'active'}
        onSelect={v => onChange({ currentStatus: v as PMHCondition['currentStatus'] })}
      />
    </Field>
    <Field label="Complications (if any)">
      <Inp
        value={condition.complications?.join(', ') || ''}
        onChange={v => onChange({ complications: v.split(',').map(s => s.trim()) })}
        placeholder="e.g. hospitalisations, intubations"
      />
    </Field>
  </div>
);

const SurgeryCard = ({ surgery, onChange, onRemove }: {
  surgery: SurgeryHistory;
  onChange: (updates: Partial<SurgeryHistory>) => void;
  onRemove: () => void;
}) => (
  <div style={{ background: t.surfaceAlt, borderRadius: 10, padding: 12, border: `1px solid ${t.border}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 12, color: t.text }}>
        {surgery.procedure || 'New Surgery'}
      </div>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: t.danger, cursor: 'pointer', fontSize: 12 }}>✕</button>
    </div>
    <Grid>
      <Field label="Procedure">
        <Inp value={surgery.procedure} onChange={v => onChange({ procedure: v })} placeholder="e.g. Appendectomy" />
      </Field>
      <Field label="Indication">
        <Inp value={surgery.indication} onChange={v => onChange({ indication: v })} placeholder="e.g. Appendicitis" />
      </Field>
    </Grid>
    <Grid>
      <Field label="Year">
        <Inp value={surgery.year} onChange={v => onChange({ year: v })} placeholder="YYYY" />
      </Field>
      <Field label="Facility">
        <Inp value={surgery.facility} onChange={v => onChange({ facility: v })} placeholder="Hospital name" />
      </Field>
    </Grid>
    <Field label="Anesthesia Type">
      <Pills
        options={['General', 'Spinal', 'Regional', 'Local', 'Unknown']}
        value={surgery.anesthesiaType || 'general'}
        onSelect={v => onChange({ anesthesiaType: v as SurgeryHistory['anesthesiaType'] })}
      />
    </Field>
    <Field label="Complications">
      <Inp
        value={surgery.complications?.join(', ') || ''}
        onChange={v => onChange({ complications: v.split(',').map(s => s.trim()) })}
        placeholder="e.g. bleeding, infection"
      />
    </Field>
    <BoolPill
      label="Received blood transfusion during/after surgery"
      value={surgery.transfusion || false}
      onToggle={v => onChange({ transfusion: v })}
    />
  </div>
);

const TransfusionCard = ({ transfusion, onChange, onRemove }: {
  transfusion: Transfusion;
  onChange: (updates: Partial<Transfusion>) => void;
  onRemove: () => void;
}) => (
  <div style={{ background: t.surfaceAlt, borderRadius: 10, padding: 12, border: `1px solid ${t.border}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 12, color: t.text }}>Transfusion {transfusion.date ? `(${transfusion.date})` : ''}</div>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: t.danger, cursor: 'pointer', fontSize: 12 }}>✕</button>
    </div>
    <Grid>
      <Field label="Date">
        <Inp value={transfusion.date} onChange={v => onChange({ date: v })} placeholder="MM/YY or year" />
      </Field>
      <Field label="Reason">
        <Inp value={transfusion.reason} onChange={v => onChange({ reason: v })} placeholder="e.g. Anaemia, surgery" />
      </Field>
    </Grid>
    <Field label="Transfusion Reaction">
      <Pills
        options={['None', 'Mild (fever, rash)', 'Severe (anaphylaxis, hemolysis)', 'Unknown']}
        value={transfusion.reaction || 'none'}
        onSelect={v => onChange({ reaction: v as Transfusion['reaction'] })}
      />
    </Field>
  </div>
);

// Type definitions (add to your types file)
interface PMHCondition {
  id: string;
  name: string;
  diagnosedYear?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'unknown';
  currentStatus?: 'active' | 'controlled' | 'poorly_controlled' | 'resolved';
  medications?: { drug: string; dose: string; adherence: string }[];
  complications?: string[];
}

interface SurgeryHistory {
  id: string;
  procedure: string;
  indication?: string;
  year?: string;
  facility?: string;
  anesthesiaType?: 'general' | 'spinal' | 'regional' | 'local' | 'unknown';
  complications?: string[];
  transfusion?: boolean;
}

interface Transfusion {
  id: string;
  date: string;
  reason?: string;
  reaction?: 'none' | 'mild' | 'severe' | 'unknown';
}

interface InfectionStatus {
  hivStatus?: 'positive' | 'negative' | 'unknown';
  onART?: boolean;
  cd4ViralLoad?: string;
  hepB?: string;
  hepC?: string;
  other?: string;
}
  // -- BIRTH HISTORY ENGINE ----------------------------------------------------

// Types for structured birth data (add to your types file)
interface ANCVisit {
  id: string;
  week: string;
  findings: string;
  interventions?: string;
}

interface BirthEvent {
  id: string;
  type: string; // 'asphyxia', 'sepsis', 'jaundice', etc.
  severity: 'mild' | 'moderate' | 'severe' | 'unknown';
  intervention: string;
  outcome: string;
}

// Helper to interpret birth weight relative to gestation
function interpretBirthWeight(weightKg: number, gestWeeks: number): string {
  if (!weightKg || !gestWeeks) return '';
  const centile =
    weightKg < 2.5 ? '<10th centile (SGA)' :
    weightKg > 4.0 ? '>90th centile (LGA)' :
    '10th–90th centile (AGA)';
  const prematurity = gestWeeks < 37 ? `Preterm (${gestWeeks}w) — ` : '';
  return `${prematurity}${centile}`;
}

// Risk flags from birth history that affect respiratory differential
function computeBirthRisk(form: PatientForm): string[] {
  const risks: string[] = [];
  const gest = parseFloat(form.birth.gestAgeWeeks) || 0;
  const weight = parseFloat(form.birth.birthWeight) || 0;

  if (gest < 37) risks.push('Preterm birth — increased risk of RDS, bronchiolitis, asthma');
  if (weight < 2.5) risks.push('Low birth weight — may indicate IUGR, infection risk');
  if (form.birth.nicuAdmission) risks.push('NICU admission — possible CLD, subglottic stenosis, recurrent wheeze');
  if (form.anc.maternalFever) risks.push('Maternal fever in labour — consider neonatal sepsis, chorioamnionitis');
  if (form.anc.meconiumStained) risks.push('Meconium-stained liquor — risk of MAS, PPHN');
  if (form.birth.neonatalComplications?.includes('Birth Asphyxia')) risks.push('Birth asphyxia — hypoxic-ischemic encephalopathy, feeding difficulties');
  if (form.birth.neonatalComplications?.includes('Respiratory Distress')) risks.push('Neonatal respiratory distress — possible surfactant deficiency, infection');
  if (form.birth.deliveryMode === 'CS') risks.push('Caesarean section — possible transient tachypnoea, delayed colonisation');
  return risks;
}

// Immunisation risk mapping
function getVaccineAlerts(missedVaccines: string[]): { vaccine: string; risk: string }[] {
  const map: Record<string, string> = {
    'BCG': 'Increased risk of severe TB, disseminated BCGosis if immunocompromised',
    'PCV': 'High risk of invasive pneumococcal disease, severe pneumonia',
    'Pentavalent': 'Risk of Hib epiglottitis, pertussis, tetanus, hepatitis B',
    'Measles / MR': 'Risk of measles pneumonia, encephalitis',
    'Rotavirus': 'Severe diarrhoea, dehydration risk',
    'IPV': 'Polio risk in endemic areas',
    'Yellow Fever': 'Risk in endemic areas',
    'HPV': 'Later cancer risk',
    'Vitamin A': 'Increased severity of measles, malnutrition',
  };
  return missedVaccines.map(v => ({ vaccine: v, risk: map[v] || 'Unknown risk' }));
}

// -- UPGRADED RENDER FUNCTION -----------------------------------------------


// -- NEONATAL EVENT CARD (example for future structured events) --------------
const NeonatalEventCard = ({ event }: { event: BirthEvent }) => (
  <div style={{ background: t.surfaceAlt, borderRadius: 8, padding: '8px 12px', border: `1px solid ${t.border}` }}>
    <div style={{ fontWeight: 600, fontSize: 12, color: t.text }}>{event.type}</div>
    <div style={{ fontSize: 11, color: t.textSub }}>
      Severity: {event.severity} | Intervention: {event.intervention} | Outcome: {event.outcome}
    </div>
  </div>
);
// -- MILESTONE ENGINE ----------------------------------------------------------
// (This would normally live in a separate reference file, e.g., milestones.ts)

interface MilestoneGroup {
  grossMotor: string[];
  fineMotor: string[];
  speech: string[];
  social: string[];
}

const MILESTONE_MAP: Record<number, MilestoneGroup> = {
  0: { // newborn
    grossMotor: ["Head lag when pulled to sit"],
    fineMotor: ["Hands fisted"],
    speech: ["Startles to loud sounds"],
    social: ["Regards face"]
  },
  3: {
    grossMotor: ["Holds head steady when sitting", "Raises head when prone"],
    fineMotor: ["Hands open half the time", "Follows object past midline"],
    speech: ["Cooing", "Turns toward voice"],
    social: ["Social smile"]
  },
  6: {
    grossMotor: ["Rolls over (prone to supine)", "Sits with support", "Bears weight on legs"],
    fineMotor: ["Reaches for objects", "Palmar grasp"],
    speech: ["Babbles (vowel-consonant combinations)"],
    social: ["Recognises caregiver", "Stranger anxiety begins"]
  },
  9: {
    grossMotor: ["Sits unsupported", "Crawls", "Pulls to stand"],
    fineMotor: ["Pincer grasp emerging", "Transfers objects between hands"],
    speech: ["Says 'mama/dada' non-specific", "Imitates sounds"],
    social: ["Waves bye-bye", "Plays peek-a-boo"]
  },
  12: {
    grossMotor: ["Stands alone", "Walks with one hand held"],
    fineMotor: ["Pincer grasp well developed", "Feeds self finger foods"],
    speech: ["1-3 meaningful words", "Understands simple commands"],
    social: ["Drinks from cup", "Points to indicate wants"]
  },
  18: {
    grossMotor: ["Walks well", "Runs stiffly", "Climbs onto furniture"],
    fineMotor: ["Scribbles spontaneously", "Builds tower of 3 cubes"],
    speech: ["10-20 words", "Follows 1-step commands"],
    social: ["Imitates household chores", "Joint attention established"]
  },
  24: {
    grossMotor: ["Runs well", "Kicks ball", "Climbs stairs (2 feet per step)"],
    fineMotor: ["Builds tower of 6 cubes", "Imitates vertical line"],
    speech: ["2-word sentences", "Points to 5 body parts"],
    social: ["Parallel play", "Begins to show ownership"]
  },
  36: {
    grossMotor: ["Jumps with both feet", "Pedals tricycle"],
    fineMotor: ["Copies circle", "Snips paper with scissors"],
    speech: ["3-word sentences", "Asks 'what'/'why' questions"],
    social: ["Interactive play", "Takes turns"]
  },
  48: {
    grossMotor: ["Hops on one foot", "Catches ball"],
    fineMotor: ["Copies square", "Draws person (3 parts)"],
    speech: ["Full sentences", "Tells stories"],
    social: ["Group play", "Understands rules"]
  },
  60: {
    grossMotor: ["Skips", "Bicycle with training wheels"],
    fineMotor: ["Copies triangle", "Ties shoelaces"],
    speech: ["Narrates events", "Understands time concepts"],
    social: ["Cooperative play", "Has best friend"]
  }
};

function getExpectedMilestones(ageMonths: number): MilestoneGroup {
  // find the closest age band that is = current age
  const bands = Object.keys(MILESTONE_MAP).map(Number).sort((a, b) => a - b);
  let selected = bands[0];
  for (const band of bands) {
    if (ageMonths >= band) selected = band;
  }
  return MILESTONE_MAP[selected];
}

// -- INTERPRETATION BUILDER ----------------------------------------------------
function buildDevelopmentInterpretation(
  ageMonths: number,
  expected: MilestoneGroup,
  achieved: Record<string, Record<string, boolean>>, // {grossMotor: {...}, ...}
  regression?: string[] // domains with reported regression
): { status: string; details: string; redFlags: string[] } {
  // Compute gaps per domain
  const gaps = {
    grossMotor: expected.grossMotor.filter(m => !achieved.grossMotor?.[m]),
    fineMotor: expected.fineMotor.filter(m => !achieved.fineMotor?.[m]),
    speech: expected.speech.filter(m => !achieved.speech?.[m]),
    social: expected.social.filter(m => !achieved.social?.[m]),
  };

  const totalExpected = expected.grossMotor.length + expected.fineMotor.length + expected.speech.length + expected.social.length;
  const totalAchieved = (Object.values(achieved) as any[]).reduce((sum, domain) => sum + Object.values(domain).filter(Boolean).length, 0);
  const percentAchieved = totalExpected > 0 ? totalAchieved / totalExpected : 1;

  const redFlags: string[] = [];
  if (regression?.length) {
    redFlags.push(`Regression reported in: ${regression.join(', ')} — urgent neurodevelopmental evaluation required.`);
  }
  if (gaps.speech.length > 1 && ageMonths > 18) redFlags.push("Speech delay — consider hearing loss, autism spectrum disorder.");
  if (gaps.grossMotor.length > 1 && ageMonths > 12) redFlags.push("Gross motor delay — consider cerebral palsy, neuromuscular disorder.");
  if (ageMonths >= 9 && gaps.social.includes("Stranger anxiety begins") && gaps.speech.includes("Says 'mama/dada' non-specific")) {
    redFlags.push("Social/communication delay — may indicate autism spectrum disorder.");
  }

  let status = "Development is age-appropriate across all domains.";
  if (percentAchieved < 0.7) status = "Global developmental delay suspected.";
  else if (gaps.speech.length > 1 || gaps.grossMotor.length > 1) status = "Isolated delay in some domains.";

  const detailsLines: string[] = [];
  if (gaps.grossMotor.length) detailsLines.push(`Gross motor: missing ${gaps.grossMotor.join(', ')}`);
  if (gaps.fineMotor.length) detailsLines.push(`Fine motor: missing ${gaps.fineMotor.join(', ')}`);
  if (gaps.speech.length) detailsLines.push(`Speech/language: missing ${gaps.speech.join(', ')}`);
  if (gaps.social.length) detailsLines.push(`Social: missing ${gaps.social.join(', ')}`);

  return {
    status,
    details: detailsLines.length ? detailsLines.join('; ') : 'All expected milestones achieved.',
    redFlags,
  };
}

// -- Reusable Milestone Domain UI ----------------------------------------------
const MilestoneDomain = ({
  domain,
  expected,
  achieved,
  onToggle,
  isRegression,
  onRegressionToggle,
}: {
  domain: string;
  expected: string[];
  achieved: Record<string, boolean>;
  onToggle: (milestone: string) => void;
  isRegression: boolean;
  onRegressionToggle: () => void;
}) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: t.text, flex: 1 }}>{domain}</div>
      <BoolPill
        label="Regression?"
        value={isRegression}
        onToggle={onRegressionToggle}
        warn
      />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 12 }}>
      {expected.map(milestone => (
        <label
          key={milestone}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: t.text,
            cursor: "pointer",
            padding: "2px 0"
          }}
        >
          <input
            type="checkbox"
            checked={!!achieved[milestone]}
            onChange={() => onToggle(milestone)}
            style={{ accentColor: t.accent }}
          />
          {milestone}
        </label>
      ))}
    </div>
  </div>
);
// -- IMMUNISATION ENGINE --------------------------------------------------------

// Kenya EPI schedule (simplified; expand as needed)
interface EPIDose {
  ageMonths: number; // target age for dose
  vaccines: string[];
}

const KENYA_EPI_SCHEDULE: EPIDose[] = [
  { ageMonths: 0, vaccines: ['BCG', 'OPV0'] },
  { ageMonths: 1.5, vaccines: ['Pentavalent 1', 'OPV1', 'PCV1', 'Rotavirus 1'] },
  { ageMonths: 2.5, vaccines: ['Pentavalent 2', 'OPV2', 'PCV2', 'Rotavirus 2'] },
  { ageMonths: 3.5, vaccines: ['Pentavalent 3', 'OPV3', 'PCV3'] },
  { ageMonths: 9, vaccines: ['Measles 1', 'Yellow Fever'] },
  { ageMonths: 18, vaccines: ['Measles 2'] },
];

function getExpectedVaccines(ageMonths: number): string[] {
  const expected: Set<string> = new Set();
  for (const dose of KENYA_EPI_SCHEDULE) {
    if (ageMonths >= dose.ageMonths) {
      dose.vaccines.forEach(v => expected.add(v));
    }
  }
  return Array.from(expected);
}

function buildImmunisationInterpretation(
  ageMonths: number,
  administered: string[],
  bcgScar: boolean | undefined,
  cardSeen: boolean | undefined,
  caregiverOnly: boolean | undefined
): { status: string; missing: string[]; riskFlags: string[]; recommendation: string; narrative: string } {
  const expected = getExpectedVaccines(ageMonths);
  const missing = expected.filter(v => !administered.includes(v));

  let status = '';
  const riskFlags: string[] = [];
  let recommendation = '';

  if (missing.length === 0 && bcgScar && cardSeen) {
    status = 'Fully immunised for age, with documented evidence.';
  } else if (missing.length === 0 && (bcgScar || cardSeen)) {
    status = 'Likely fully immunised based on available evidence (card/scar).';
  } else if (missing.length > 0 && (cardSeen || bcgScar)) {
    status = 'Partially immunised; gaps identified in schedule.';
    riskFlags.push('Missed vaccines — increased vulnerability to vaccine-preventable diseases.');
    recommendation = 'Catch-up immunisation recommended.';
  } else if (!cardSeen && !bcgScar && caregiverOnly) {
    status = 'Immunisation status uncertain — caregiver recall only, no documented evidence.';
    riskFlags.push('Unverifiable immunisation status — treat as under-immunised until proven otherwise.');
    recommendation = 'Verify with official records; if unavailable, start catch-up schedule.';
  } else {
    status = 'Immunisation history incomplete or not documented.';
    riskFlags.push('Insufficient evidence to confirm protection.');
  }

  // Specific risk from missing vaccines
  if (missing.includes('BCG')) riskFlags.push('No BCG — at risk for severe TB, disseminated BCGosis if immunocompromised.');
  if (missing.some(v => v.includes('PCV'))) riskFlags.push('Missed PCV — high risk of invasive pneumococcal disease.');
  if (missing.some(v => v.includes('Measles'))) riskFlags.push('Missed measles vaccine — risk of measles pneumonia, encephalitis.');
  if (missing.some(v => v.includes('Pentavalent'))) riskFlags.push('Missed Pentavalent — risk of Hib epiglottitis, pertussis, hepatitis B.');

  // Narrative for clinical note
  const evidenceParts: string[] = [];
  if (bcgScar) evidenceParts.push('BCG scar present');
  if (cardSeen) evidenceParts.push('immunisation card seen');
  if (caregiverOnly) evidenceParts.push('caregiver recall only');
  const evidenceStr = evidenceParts.length ? ` (${evidenceParts.join('; ')})` : '';

  let narrative = `Immunisation status: ${status}${evidenceStr}.`;
  if (missing.length) narrative += ` Missing age-appropriate vaccines: ${missing.join(', ')}.`;
  if (riskFlags.length) narrative += ` Risk: ${riskFlags.join(' ')}`;
  if (recommendation) narrative += ` Recommendation: ${recommendation}`;

  return { status, missing, riskFlags, recommendation, narrative };
}

function renderBirthHistory() {
  const clinicalContext = useBiodataContext(form);
  const anc = form.anc;
  const birth = form.birth;
  const ageMonths = parseInt(form.biodata.ageMonths || '0');
  const birthRisks = computeBirthRisk(form);
  const weightInterpretation = birth.birthWeight && birth.gestAgeWeeks
    ? interpretBirthWeight(parseFloat(birth.birthWeight), parseInt(birth.gestAgeWeeks))
    : '';

  return (
    <>
      <AdaptiveGuide phaseIdx={4} />
      <PhaseHeader
        title="Birth History"
        sub="Antenatal care, labour & delivery, and neonatal period."
      />
      <Card>
        {/* -- ANTENATAL CARE -- */}
        <Section title="Antenatal Care">
          <Grid>
            <Field label="Number of ANC Visits">
              <Inp
                value={(anc as any).ancVisits || ''}
                onChange={v => set("anc.ancVisits", v)}
                placeholder="e.g. 4"
              />
            </Field>
            <Field label="Place of Delivery">
              <Inp
                value={birth.birthPlace || ''}
                onChange={v => set("birth.birthPlace", v)}
                placeholder="e.g. Hospital, Home, TBA"
              />
            </Field>
          </Grid>
          <Grid>
            <Field label="HIV Testing">
              <BoolPill
                label="HIV test done"
                value={(anc as any).hivTesting || false}
                onToggle={v => set("anc.hivTesting", v)}
              />
            </Field>
            {(anc as any).hivTesting && (
              <Field label="HIV Result">
                <Pills
                  options={[
                    { value: "positive", label: "Positive" },
                    { value: "negative", label: "Negative" },
                    { value: "unknown", label: "Unknown" }
                  ]}
                  value={(anc as any).hivResult || ''}
                  onSelect={v => set("anc.hivResult", v)}
                />
              </Field>
            )}
          </Grid>
          <Grid>
            <Field label="PMTCT">
              <BoolPill
                label="PMTCT received"
                value={(anc as any).pmtct || false}
                onToggle={v => set("anc.pmtct", v)}
              />
            </Field>
            <Field label="Syphilis Screening">
              <Pills
                options={[
                  { value: "positive", label: "Positive" },
                  { value: "negative", label: "Negative" },
                  { value: "not_done", label: "Not Done" }
                ]}
                value={(anc as any).syphilis || ''}
                onSelect={v => set("anc.syphilis", v)}
              />
            </Field>
          </Grid>
          <Grid>
            <Field label="Iron/Folate">
              <BoolPill
                label="Iron/folate supplementation"
                value={(anc as any).ironFolate || false}
                onToggle={v => set("anc.ironFolate", v)}
              />
            </Field>
            <Field label="Malaria Prophylaxis">
              <BoolPill
                label="Malaria prophylaxis given"
                value={(anc as any).malariaProphylaxis || false}
                onToggle={v => set("anc.malariaProphylaxis", v)}
              />
            </Field>
          </Grid>

          {/* Pregnancy complications */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textSub, marginBottom: 6 }}>
              Pregnancy / Labour Complications
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <BoolPill label="Pre-eclampsia" value={(anc as any).preEclampsia || false} onToggle={v => set("anc.preEclampsia", v)} warn />
              <BoolPill label="Gestational DM" value={(anc as any).gestationalDM || false} onToggle={v => set("anc.gestationalDM", v)} warn />
              <BoolPill label="APH" value={(anc as any).antepartumHaemorrhage || false} onToggle={v => set("anc.antepartumHaemorrhage", v)} warn />
              <BoolPill label="Maternal Fever" value={(anc as any).maternalFever || false} onToggle={v => set("anc.maternalFever", v)} warn />
              <BoolPill label="Meconium-stained liquor" value={(anc as any).meconiumStained || false} onToggle={v => set("anc.meconiumStained", v)} warn />
            </div>
          </div>
        </Section>

        {/* -- LABOUR & DELIVERY -- */}
        <Section title="Labour & Delivery">
          <Grid>
            <Field label="Gestation (weeks)">
              <Inp
                value={birth.gestAge || birth.gestAgeWeeks || ''}
                onChange={v => { set("birth.gestAge", v); set("birth.gestAgeWeeks", v); }}
                placeholder="e.g. 39"
              />
            </Field>
            <Field label="Mode of Delivery">
              <Pills
                options={[
                  { value: "SVD", label: "SVD" },
                  { value: "CS", label: "Caesarean Section" },
                  { value: "vacuum", label: "Vacuum" },
                  { value: "forceps", label: "Forceps" },
                  { value: "breech", label: "Breech" }
                ]}
                value={birth.deliveryMode || ''}
                onSelect={v => set("birth.deliveryMode", v)}
              />
            </Field>
          </Grid>
          <Grid>
            <Field label="Birth Weight (kg)">
              <Inp
                value={birth.birthWeight || ''}
                onChange={v => set("birth.birthWeight", v)}
                placeholder="e.g. 3.2"
              />
            </Field>
            <Field label="APGAR Score">
              <Inp
                value={birth.apgar || ''}
                onChange={v => set("birth.apgar", v)}
                placeholder="e.g. 9/10"
              />
            </Field>
          </Grid>
          <Grid>
            <Field label="NICU Admission">
              <BoolPill label="Admitted to NICU" value={birth.nicuAdmission || false} onToggle={v => set("birth.nicuAdmission", v)} warn />
            </Field>
            {birth.nicuAdmission && (
              <Field label="NICU Duration">
                <Inp value={birth.nicuDuration || ''} onChange={v => set("birth.nicuDuration", v)} placeholder="e.g. 5 days" />
              </Field>
            )}
          </Grid>

          {/* Birth weight interpretation */}
          {weightInterpretation && (
            <div style={{
              padding: '8px 12px', borderRadius: 8, marginTop: 8, fontSize: 12,
              background: t.surfaceAlt, color: t.text, fontWeight: 500,
              border: `1px solid ${t.border}`
            }}>
              {weightInterpretation}
            </div>
          )}
        </Section>

        {/* -- NEONATAL PERIOD -- */}
        <Section title="Neonatal Period">
          <Field label="Neonatal Complications" full>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Birth Asphyxia", "Neonatal Sepsis", "Respiratory Distress", "Neonatal Jaundice", "Hypoglycaemia", "Congenital Anomaly", "Birth Trauma"].map(comp => {
                const sel = (birth as any).neonatalComplications?.includes(comp);
                return (
                  <button key={comp} onClick={() => toggle("birth.neonatalComplications", comp)} style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                    border: `1px solid ${sel ? t.danger : t.border}`,
                    background: sel ? t.dangerBg : "transparent",
                    color: sel ? t.danger : t.textSub, fontFamily: t.font,
                  }}>
                    {comp}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Complication Details" full>
            <Ta
              value={(birth as any).neonatalDetail || ''}
              onChange={v => set("birth.neonatalDetail", v)}
              placeholder="Describe complications, interventions, and outcomes"
            />
          </Field>
        </Section>

        {/* -- PERINATAL RISK SUMMARY -- */}
        {birthRisks.length > 0 && (
          <div style={{
            background: t.warnBg, borderRadius: 10, padding: 14, marginTop: 8,
            border: `1px solid ${t.warn}`
          }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: t.warn, marginBottom: 6 }}>
              ⚠ Perinatal Risk Summary
            </div>
            {birthRisks.map((r, i) => (
              <div key={i} style={{ fontSize: 11, color: t.text, marginBottom: 2 }}>• {r}</div>
            ))}
          </div>
        )}

        {/* -- NIL History -- */}
        <Section title="NIL History — confirm absence of complications">
          <BoolPill
            label="No neonatal complications"
            value={(form.birth as any).noComplications}
            onToggle={v => set("birth.noComplications", v)}
          />
        </Section>
      </Card>
    </>
  );
}

function renderDevelopment() {
  const ageMonths = parseInt(form.biodata.ageMonths || '0');
  const expectedMilestones = getExpectedMilestones(ageMonths);
  const achievedMilestones = (form.development as any).milestones || {
    grossMotor: {},
    fineMotor: {},
    speech: {},
    social: {},
  };
  const regressionDomains: string[] = (form.development as any).regression || [];

  const handleToggleMilestone = (domain: string, milestone: string) => {
    const updated = {
      ...achievedMilestones,
      [domain]: {
        ...achievedMilestones[domain],
        [milestone]: !achievedMilestones[domain]?.[milestone],
      },
    };
    set("development.milestones", updated);
  };

  const handleRegressionDomain = (domain: string) => {
    const current = regressionDomains.includes(domain)
      ? regressionDomains.filter(d => d !== domain)
      : [...regressionDomains, domain];
    set("development.regression", current);
  };

  const devInterpretation = buildDevelopmentInterpretation(
    ageMonths,
    expectedMilestones,
    achievedMilestones,
    regressionDomains
  );

  return (
    <>
      <AdaptiveGuide phaseIdx={5} />
      <PhaseHeader
        title="Growth & Development"
        sub="Developmental milestones tracking and assessment."
      />
      <Card>
        <Section title="Developmental Milestones">
          <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 8 }}>
            Expected milestones for age {ageMonths} months
          </div>
          <MilestoneDomain
            domain="Gross Motor"
            expected={expectedMilestones.grossMotor}
            achieved={achievedMilestones.grossMotor}
            onToggle={m => handleToggleMilestone("grossMotor", m)}
            isRegression={regressionDomains.includes("grossMotor")}
            onRegressionToggle={() => handleRegressionDomain("grossMotor")}
          />
          <MilestoneDomain
            domain="Fine Motor"
            expected={expectedMilestones.fineMotor}
            achieved={achievedMilestones.fineMotor}
            onToggle={m => handleToggleMilestone("fineMotor", m)}
            isRegression={regressionDomains.includes("fineMotor")}
            onRegressionToggle={() => handleRegressionDomain("fineMotor")}
          />
          <MilestoneDomain
            domain="Speech & Language"
            expected={expectedMilestones.speech}
            achieved={achievedMilestones.speech}
            onToggle={m => handleToggleMilestone("speech", m)}
            isRegression={regressionDomains.includes("speech")}
            onRegressionToggle={() => handleRegressionDomain("speech")}
          />
          <MilestoneDomain
            domain="Social & Emotional"
            expected={expectedMilestones.social}
            achieved={achievedMilestones.social}
            onToggle={m => handleToggleMilestone("social", m)}
            isRegression={regressionDomains.includes("social")}
            onRegressionToggle={() => handleRegressionDomain("social")}
          />

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textSub, marginBottom: 6 }}>
              Any domain where the child has lost previously acquired skills? (regression)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Gross Motor", "Fine Motor", "Speech", "Social"].map(dom => (
                <BoolPill
                  key={dom}
                  label={dom}
                  value={regressionDomains.includes(dom.toLowerCase())}
                  onToggle={() => handleRegressionDomain(dom.toLowerCase())}
                  warn
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Development interpretation box */}
        <div style={{
          background: devInterpretation.redFlags.length ? t.dangerBg : t.surfaceAlt,
          borderRadius: 10, padding: 16, marginTop: 12,
          border: `1px solid ${devInterpretation.redFlags.length ? t.danger : t.border}`
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: t.text, marginBottom: 8 }}>
            📋 Developmental Assessment Summary
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: t.text }}>
            <b>Status:</b> {devInterpretation.status}
          </div>
          <div style={{ fontSize: 12, color: t.textSub, marginTop: 4 }}>
            {devInterpretation.details}
          </div>
          {devInterpretation.redFlags.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {devInterpretation.redFlags.map((flag, i) => (
                <div key={i} style={{ fontSize: 11, color: t.danger, fontWeight: 600 }}>⚠ {flag}</div>
              ))}
            </div>
          )}
        </div>

        {/* NIL History */}
        <Section title="NIL History — confirm absence of concerns">
          <BoolPill
            label="No developmental concerns"
            value={(form.development as any).noConcerns}
            onToggle={v => set("development.noConcerns", v)}
          />
        </Section>
      </Card>
    </>
  );
}

function renderImmunization() {
  const ageMonths = parseInt(form.biodata.ageMonths || '0');
  const administeredVaccines: string[] = (form.immunization as any).administeredVaccines || [];
  const bcgScar = (form.immunization as any).bcgScarPresent;
  const cardSeen = (form.immunization as any).cardSeen;
  const caregiverOnly = (form.immunization as any).caregiverOnly;

  const immInterpretation = buildImmunisationInterpretation(
    ageMonths,
    administeredVaccines,
    bcgScar,
    cardSeen,
    caregiverOnly
  );
  const expectedVaccines = getExpectedVaccines(ageMonths);
  const missingVaccines = immInterpretation.missing;
  const vaccineAlerts = getVaccineAlerts(missingVaccines);

  const handleToggleAdministered = (vaccine: string) => {
    const updated = administeredVaccines.includes(vaccine)
      ? administeredVaccines.filter(v => v !== vaccine)
      : [...administeredVaccines, vaccine];
    set("immunization.administeredVaccines", updated);
  };

  return (
    <>
      <AdaptiveGuide phaseIdx={6} />
      <PhaseHeader
        title="Immunization"
        sub="Vaccination history, age-expected coverage, and protection status."
      />
      <Card>
        {/* Evidence of immunisation */}
        <Section title="Evidence of Immunisation">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <BoolPill
              label="BCG scar seen"
              value={bcgScar}
              onToggle={v => set("immunization.bcgScarPresent", v)}
            />
            <BoolPill
              label="Immunisation card seen"
              value={cardSeen}
              onToggle={v => set("immunization.cardSeen", v)}
            />
            <BoolPill
              label="Caregiver recall only"
              value={caregiverOnly}
              onToggle={v => set("immunization.caregiverOnly", v)}
            />
          </div>
        </Section>

        {/* Age-expected vaccines table */}
        <Section title="Vaccine Administration Checklist">
          <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 8 }}>
            Vaccines expected by age {ageMonths} months
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {expectedVaccines.map(vaccine => {
              const received = administeredVaccines.includes(vaccine);
              return (
                <button
                  key={vaccine}
                  onClick={() => handleToggleAdministered(vaccine)}
                  style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                    border: `1px solid ${received ? t.success : t.warn}`,
                    background: received ? t.successBg : "transparent",
                    color: received ? t.success : t.warn,
                    fontFamily: t.font, fontWeight: received ? 600 : 400,
                    textDecoration: received ? 'none' : 'line-through',
                  }}
                >
                  {received ? '✓ ' : '✗ '}{vaccine}
                </button>
              );
            })}
          </div>
          {missingVaccines.length > 0 && (
            <div style={{ fontSize: 11, color: t.warn, marginTop: 6 }}>
              ? Missing: {missingVaccines.join(', ')}
            </div>
          )}
        </Section>

        {/* Risk flags for missed vaccines */}
        {vaccineAlerts.length > 0 && (
          <div style={{ marginTop: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.danger, marginBottom: 6 }}>
              Risk flags for missed vaccines
            </div>
            {vaccineAlerts.map((alert, i) => (
              <div key={i} style={{ fontSize: 11, color: t.danger, background: t.dangerBg, borderRadius: 6, padding: '4px 10px', marginBottom: 4 }}>
                ⚠ {alert.vaccine}: {alert.risk}
              </div>
            ))}
          </div>
        )}

        {/* Additional administered vaccines */}
        <Field label="Other vaccines given (if any)" full>
          <Inp
            value={(form.immunization as any).otherVaccines || ''}
            onChange={v => set("immunization.otherVaccines", v)}
            placeholder="e.g. influenza, travel vaccines"
          />
        </Field>

        {/* Interpretation box */}
        <div style={{
          background: immInterpretation.riskFlags.length ? t.warnBg : t.successBg,
          borderRadius: 10, padding: 14, marginTop: 12,
          border: `1px solid ${immInterpretation.riskFlags.length ? t.warn : t.success}`
        }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: t.text, marginBottom: 6 }}>
            💉 Immunisation Summary
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.6, color: t.text }}>
            {immInterpretation.narrative}
          </div>
          {immInterpretation.recommendation && (
            <div style={{ fontSize: 11, marginTop: 4, color: t.accentText }}>
              <b>Plan:</b> {immInterpretation.recommendation}
            </div>
          )}
        </div>

        {/* NIL History */}
        <Section title="NIL History — confirm absence of missed doses">
          <BoolPill
            label="No missed immunisations"
            value={(form.immunization as any).noMissed}
            onToggle={v => set("immunization.noMissed", v)}
          />
        </Section>
      </Card>
    </>
  );
}

 // -- GROWTH & NUTRITION ENGINE ---------------------------------------------------

// Simplified anthropometric classification (based on WHO standards, adapted for field use)
function classifyMUAC(muacCm: number): { category: string; color: string; risk: string } {
  if (muacCm < 11.5) return { category: 'SAM (Severe Acute Malnutrition)', color: t.danger, risk: 'High risk for severe pneumonia, TB, and mortality. Requires urgent nutritional rehabilitation.' };
  if (muacCm < 12.5) return { category: 'MAM (Moderate Acute Malnutrition)', color: t.warn, risk: 'Increased risk for infection and poor respiratory outcomes. Nutritional supplementation indicated.' };
  if (muacCm < 13.5) return { category: 'At nutritional risk', color: t.warn, risk: 'Monitor closely; suboptimal reserves for illness.' };
  return { category: 'Normal', color: t.success, risk: '' };
}

function classifyWeightForAge(weightKg: number, ageMonths: number, sex: string): { category: string; color: string; risk: string } {
  // Very rough approximation using median weight from WHO tables (0-5 years)
  const medians: Record<number, { male: number; female: number }> = {
    0: { male: 3.3, female: 3.2 },
    1: { male: 4.5, female: 4.2 },
    2: { male: 5.6, female: 5.1 },
    3: { male: 6.4, female: 5.8 },
    4: { male: 7.0, female: 6.4 },
    5: { male: 7.5, female: 6.9 },
    6: { male: 7.9, female: 7.3 },
    7: { male: 8.3, female: 7.6 },
    8: { male: 8.6, female: 8.0 },
    9: { male: 8.9, female: 8.2 },
    10: { male: 9.2, female: 8.5 },
    11: { male: 9.4, female: 8.7 },
    12: { male: 9.6, female: 8.9 },
    18: { male: 10.9, female: 10.2 },
    24: { male: 12.2, female: 11.5 },
    36: { male: 14.3, female: 13.9 },
    48: { male: 16.3, female: 16.1 },
    60: { male: 18.3, female: 18.2 }
  };
  const ageKey = Object.keys(medians).map(Number).reduce((a, b) => ageMonths >= b ? b : a, 0);
  const median = sex === 'Male' ? medians[ageKey]?.male : medians[ageKey]?.female;
  if (!median) return { category: 'Unknown', color: t.textMuted, risk: '' };
  const z = (weightKg / median - 1) / 0.1; // SD approximation (0.1 for <6mo, 0.13 after � simplified)
  if (weightKg < median * 0.8) return { category: 'Severe underweight', color: t.danger, risk: 'Severe malnutrition, high mortality risk.' };
  if (weightKg < median * 0.9) return { category: 'Underweight', color: t.warn, risk: 'Moderate malnutrition; increased infection risk.' };
  return { category: 'Normal', color: t.success, risk: '' };
}

function classifyHeightForAge(heightCm: number, ageMonths: number, sex: string): { category: string; color: string; risk: string } {
  // Median height WHO
  const medians: Record<number, { male: number; female: number }> = {
    0: { male: 49.9, female: 49.1 },
    6: { male: 67.6, female: 65.7 },
    12: { male: 75.7, female: 74.0 },
    24: { male: 87.1, female: 85.7 },
    36: { male: 96.1, female: 95.1 },
    48: { male: 103.3, female: 102.7 },
    60: { male: 110.0, female: 109.4 }
  };
  const ageKey = Object.keys(medians).map(Number).reduce((a, b) => ageMonths >= b ? b : a, 0);
  const median = sex === 'Male' ? medians[ageKey]?.male : medians[ageKey]?.female;
  if (!median) return { category: 'Unknown', color: t.textMuted, risk: '' };
  // stunting <-2 SD (approx. <94% of median)
  if (heightCm < median * 0.94) return { category: 'Stunted (chronic malnutrition)', color: t.danger, risk: 'Reflects long-term undernutrition; associated with poor cognitive outcomes and severe pneumonia risk.' };
  return { category: 'Normal length/height for age', color: t.success, risk: '' };
}

function classifyWeightForHeight(weightKg: number, heightCm: number, sex: string): { category: string; color: string; risk: string } {
  // WHO weight-for-length/height (simplified)
  const bmi = weightKg / ((heightCm / 100) ** 2);
  if (heightCm < 45) return { category: 'Not applicable', color: t.textMuted, risk: '' };
  if (bmi < 12) return { category: 'Severe wasting', color: t.danger, risk: 'SAM equivalent; very high mortality risk.' };
  if (bmi < 13.5) return { category: 'Moderate wasting', color: t.warn, risk: 'Acute malnutrition; risk of severe illness.' };
  if (bmi > 19) return { category: 'Overweight / Obese', color: t.warn, risk: 'Risk for metabolic syndrome, may complicate respiratory mechanics.' };
  return { category: 'Normal weight-for-height', color: t.success, risk: '' };
}

function generateNutritionNarrative(
  muacCm: number | undefined,
  weightKg: number | undefined,
  heightCm: number | undefined,
  ageMonths: number,
  sex: string,
  bfStatus: string,
  complementaryAge: string,
  dietaryDiversity: string,
  appetite: string,
  edemaPresent: boolean
): string {
  const muacClass = muacCm ? classifyMUAC(muacCm) : null;
  const weightClass = weightKg ? classifyWeightForAge(weightKg, ageMonths, sex) : null;
  const heightClass = heightCm ? classifyHeightForAge(heightCm, ageMonths, sex) : null;
  const wastingClass = weightKg && heightCm ? classifyWeightForHeight(weightKg, heightCm, sex) : null;

  let text = 'Nutritional assessment: ';
  const issues: string[] = [];
  if (muacClass && muacClass.category !== 'Normal') issues.push(`MUAC ${muacCm} cm — ${muacClass.category}`);
  if (weightClass && weightClass.category !== 'Normal') issues.push(`Weight-for-age: ${weightClass.category}`);
  if (heightClass && heightClass.category !== 'Normal length/height for age') issues.push(heightClass.category);
  if (wastingClass && wastingClass.category.includes('wasting')) issues.push(wastingClass.category);
  if (edemaPresent) issues.push('Bilateral pitting oedema — SAM regardless of MUAC');
  if (appetite === 'anorexic') issues.push('Poor appetite — feeding difficulty');
  if (dietaryDiversity === 'restricted' || dietaryDiversity === 'poor') issues.push('Limited dietary diversity');
  if (bfStatus === 'exclusive' && ageMonths > 6) issues.push('Exclusive breastfeeding beyond 6 months without adequate complementary feeding');
  if (complementaryAge && parseInt(complementaryAge) < 6) issues.push('Complementary foods introduced too early (<6 months)');

  if (issues.length === 0) {
    text += 'The child is well-nourished with normal anthropometric indicators and appropriate feeding practices.';
  } else {
    text += `Significant nutritional concerns: ${issues.join('; ')}.`;
  }

  // Respiratory risk
  if (muacClass?.risk) text += ` ${muacClass.risk}`;
  if (edemaPresent) text += ` Risk of severe pneumonia and heart failure.`;
  return text;
}

// -- UPGRADED renderNutrition ----------------------------------------------------

function renderNutrition() {
  const clinicalContext = useBiodataContext(form);
  const ageMonths = parseInt(form.biodata.ageMonths || '0');
  const sex = form.biodata.sex || 'Male';
  const weightKg = parseFloat(form.vitals.weight);
  const heightCm = parseFloat(form.vitals.height);
  const muacCm = parseFloat(form.nutrition.muac);

  const bfStatus = form.nutrition.breastfed;
  const complementaryAge = form.nutrition.complementaryAge;
  const dietaryDiversity = form.nutrition.dietaryDiversity;
  const appetite = form.nutrition.appetite;
  const edemaPresent = form.nutrition.malnutritionSigns?.includes('Bilateral pitting oedema');

  // Anthropometric interpretations
  const muacInterpret = muacCm ? classifyMUAC(muacCm) : null;
  const weightInterpret = weightKg ? classifyWeightForAge(weightKg, ageMonths, sex) : null;
  const heightInterpret = heightCm ? classifyHeightForAge(heightCm, ageMonths, sex) : null;
  const whInterpret = weightKg && heightCm ? classifyWeightForHeight(weightKg, heightCm, sex) : null;

  const nutritionNarrative = generateNutritionNarrative(
    muacCm, weightKg, heightCm, ageMonths, sex,
    bfStatus, complementaryAge, dietaryDiversity, appetite, edemaPresent
  );

  return <>
    <AdaptiveGuide phaseIdx={7} />
    <PhaseHeader title="Nutritional Assessment" sub="Feeding history, growth parameters, and malnutrition risk classification." />
    <Card>
      {/* -- 1. BREASTFEEDING & COMPLEMENTARY FEEDING -- */}
      <Section title="Breastfeeding History">
        <Field label="Breastfeeding Status" full>
          <Pills
            options={[
              { value: "exclusive", label: "Exclusive (0-6 months)" },
              { value: "partial", label: "Partial" },
              { value: "not_breastfed", label: "Not breastfed" },
              { value: "weaned", label: "Weaned" }
            ]}
            value={bfStatus || ''}
            onSelect={v => set("nutrition.breastfed", v)}
          />
          {bfStatus === 'exclusive' && ageMonths > 6 && (
            <div style={{ fontSize: 11, color: t.warn, marginTop: 4 }}>
              ? Exclusive breastfeeding beyond 6 months without complementary feeding may lead to iron deficiency and growth faltering.
            </div>
          )}
        </Field>
        <Grid>
          <Field label="Age Complementary Foods Introduced (months)">
            <Inp
              value={complementaryAge || ''}
              onChange={v => set("nutrition.complementaryAge", v)}
              placeholder="e.g. 6"
            />
            {complementaryAge && parseInt(complementaryAge) < 6 && (
              <div style={{ fontSize: 11, color: t.warn }}>Early introduction ({'<'}6 months) increases risk of infection and allergies.</div>
            )}
          </Field>
          <Field label="Total Breastfeeding Duration">
            <Inp
              value={form.nutrition.bfDuration || ''}
              onChange={v => set("nutrition.bfDuration", v)}
              placeholder="e.g. 18 months, ongoing"
            />
          </Field>
        </Grid>
      </Section>

      {/* -- 2. CURRENT DIET & APPETITE -- */}
      <Section title="Current Diet & Appetite">
        <Grid>
          <Field label="Dietary Diversity">
            <Pills
              options={[
                { value: "adequate", label: "Adequate / Varied" },
                { value: "poor", label: "Poor / Limited" },
                { value: "restricted", label: "Severely restricted" }
              ]}
              value={dietaryDiversity || ''}
              onSelect={v => set("nutrition.dietaryDiversity", v)}
            />
          </Field>
          <Field label="Current Appetite">
            <Pills
              options={[
                { value: "good", label: "Good" },
                { value: "reduced", label: "Reduced" },
                { value: "anorexic", label: "Poor / Anorexic" }
              ]}
              value={appetite || ''}
              onSelect={v => set("nutrition.appetite", v)}
            />
          </Field>
        </Grid>
        {appetite === 'anorexic' && (
          <div style={{ fontSize: 11, color: t.warn, marginTop: 6 }}>
            Anorexia is a WHO danger sign — may indicate severe illness or severe malnutrition.
          </div>
        )}
      </Section>

      {/* -- 3. ANTHROPOMETRY & GROWTH INTERPRETATION -- */}
      <Section title="Growth Parameters">
        <Grid cols={3}>
          <VitalInput label="MUAC" unit="cm" val={form.nutrition.muac} onChange={v => set("nutrition.muac", v)}
            warnFn={v => {
              const num = parseFloat(v);
              if (isNaN(num)) return null;
              if (num < 11.5) return "SAM (<11.5 cm)";
              if (num < 12.5) return "MAM (<12.5 cm)";
              return null;
            }}
          />
          <VitalInput label="Weight" unit="kg" val={form.vitals.weight} onChange={v => set("vitals.weight", v)}
            warnFn={v => {
              const num = parseFloat(v);
              if (isNaN(num)) return null;
              const interp = classifyWeightForAge(num, ageMonths, sex);
              return interp.category !== 'Normal' ? interp.category : null;
            }}
          />
          <VitalInput label="Height/Length" unit="cm" val={form.vitals.height} onChange={v => set("vitals.height", v)}
            warnFn={v => {
              const num = parseFloat(v);
              if (isNaN(num)) return null;
              const interp = classifyHeightForAge(num, ageMonths, sex);
              return interp.category !== 'Normal length/height for age' ? interp.category : null;
            }}
          />
        </Grid>

        {/* Interpretation boxes */}
        {muacInterpret && (
          <div style={{
            padding: '8px 12px', borderRadius: 8, marginTop: 8, fontSize: 12,
            background: muacInterpret.color === t.danger ? t.dangerBg : muacInterpret.color === t.warn ? t.warnBg : t.successBg,
            color: muacInterpret.color, fontWeight: 600,
          }}>
            MUAC {muacCm} cm — {muacInterpret.category}
            {muacInterpret.risk && <div style={{ fontWeight: 400, fontSize: 11, marginTop: 2 }}>{muacInterpret.risk}</div>}
          </div>
        )}
        {weightInterpret && (
          <div style={{
            padding: '6px 12px', borderRadius: 8, marginTop: 4, fontSize: 12,
            color: weightInterpret.color, fontWeight: 600,
          }}>
            Weight-for-age: {weightInterpret.category}
          </div>
        )}
        {heightInterpret && (
          <div style={{
            padding: '6px 12px', borderRadius: 8, marginTop: 4, fontSize: 12,
            color: heightInterpret.color, fontWeight: 600,
          }}>
            Length/height-for-age: {heightInterpret.category}
          </div>
        )}
        {whInterpret && (
          <div style={{
            padding: '6px 12px', borderRadius: 8, marginTop: 4, fontSize: 12,
            color: whInterpret.color, fontWeight: 600,
          }}>
            Weight-for-length/height: {whInterpret.category}
          </div>
        )}
      </Section>

      {/* -- 4. MALNUTRITION SIGNS -- */}
      <Section title="Clinical Signs of Malnutrition">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {["Wasting", "Stunting", "Underweight", "Bilateral pitting oedema", "Muscle wasting", "Hair changes", "Skin dermatosis", "Moon face"].map(sign => {
            const sel = form.nutrition.malnutritionSigns?.includes(sign);
            return (
              <button key={sign} onClick={() => toggle("nutrition.malnutritionSigns", sign)} style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                border: `1px solid ${sel ? t.warn : t.border}`,
                background: sel ? t.warnBg : "transparent",
                color: sel ? t.warn : t.textSub, fontFamily: t.font,
              }}>
                {sign}
              </button>
            );
          })}
        </div>
        {edemaPresent && (
          <div style={{ padding: '8px 12px', background: t.dangerBg, borderRadius: 8, color: t.danger, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
            ⚠ Bilateral pitting oedema = Severe Acute Malnutrition (SAM) regardless of MUAC. High risk of death, especially with respiratory infection.
          </div>
        )}
      </Section>

      {/* -- 5. NUTRITIONAL IMPRESSION -- */}
      <div style={{ background: t.surfaceAlt, borderRadius: 12, padding: 16, marginTop: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: t.text }}>
          🍽️ Nutritional Impression
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.6, color: t.text }}>
          {nutritionNarrative}
        </div>
        {(muacInterpret?.category.includes('SAM') || edemaPresent) && (
          <div style={{ marginTop: 10, fontSize: 11, color: t.danger, fontWeight: 600, background: t.dangerBg, borderRadius: 6, padding: '6px 10px' }}>
            ACTION: SAM identified — requires urgent nutritional rehabilitation (F-75 / F-100 / RUTF), careful fluid management, and infection screening. Do NOT give large volumes of IV fluids. Refer for inpatient care if severe pneumonia.
          </div>
        )}
      </div>
    </Card>
  </>;
}
// -- FAMILY & SOCIAL HISTORY ENGINE --------------------------------------

// Risk factor weights for environmental/social modifiers (affect differentials)
const ENV_RISK_WEIGHTS: Record<string, number> = {
  crowding: 3,          // >2 persons/room
  biomassFuel: 2,       // indoor cooking with wood/charcoal without chimney
  smokeExposure: 3,     // any passive smoke
  unprotectedWater: 2,  // surface water
  openDefecation: 2,    // no latrine
  noHandwashing: 2,     // no soap/water for handwashing
  dampHousing: 1,       // visible mold or dampness
  livestockIndoor: 1,   // animals inside home
};

interface HouseholdData {
  totalMembers: number;
  rooms: number;
  childrenUnder5: number;
  schoolChildren: number;
}

interface EnvironmentData {
  cookingFuel: 'electric' | 'gas' | 'kerosene' | 'charcoal' | 'firewood' | 'other';
  indoorCooking: boolean;
  ventilation: 'adequate' | 'poor' | 'none';
  dampnessMold: boolean;
  livestockInside: boolean;
  proximityToRoad: 'light' | 'moderate' | 'heavy';
  smokeExposureDetail: string; // details of smoking
}

interface WASHData {
  waterSource: 'piped' | 'borehole' | 'unprotected' | 'other';
  waterTreatment: 'none' | 'boiling' | 'chlorine' | 'filter';
  handwashingFacility: boolean;
  soapAvailable: boolean;
  sanitation: 'flush' | 'pit' | 'open' | 'other';
}

interface SocioeconomicData {
  motherEducation: 'none' | 'primary' | 'secondary' | 'tertiary';
  fatherEducation: 'none' | 'primary' | 'secondary' | 'tertiary';
  motherOccupation: string;
  fatherOccupation: string;
  insurance: 'NHIF' | 'private' | 'none' | 'other';
  distanceToHealth: '<5km' | '5-15km' | '>15km';
}

// Compute a composite environmental risk score
function computeEnvironmentalRiskScore(
  household: HouseholdData,
  env: EnvironmentData,
  wash: WASHData,
  smoke: boolean
): number {
  let score = 0;
  // Crowding
  const density = household.rooms > 0 ? household.totalMembers / household.rooms : 99;
  if (density > 3) score += ENV_RISK_WEIGHTS.crowding;
  else if (density > 2) score += 1;

  // Cooking fuel and indoor cooking
  if (['charcoal', 'firewood'].includes(env.cookingFuel) && env.indoorCooking) {
    score += ENV_RISK_WEIGHTS.biomassFuel;
  }

  // Smoke exposure
  if (smoke) score += ENV_RISK_WEIGHTS.smokeExposure;

  // Water and sanitation
  if (wash.waterSource === 'unprotected') score += ENV_RISK_WEIGHTS.unprotectedWater;
  if (wash.sanitation === 'open') score += ENV_RISK_WEIGHTS.openDefecation;
  if (!wash.soapAvailable || !wash.handwashingFacility) score += ENV_RISK_WEIGHTS.noHandwashing;

  // Additional environmental
  if (env.dampnessMold) score += ENV_RISK_WEIGHTS.dampHousing;
  if (env.livestockInside) score += ENV_RISK_WEIGHTS.livestockIndoor;

  return score;
}

// Generate a narrative summary
function generateSocialNarrative(
  household: HouseholdData,
  env: EnvironmentData,
  wash: WASHData,
  smoke: boolean,
  tbContact: boolean,
  asthmaFamily: boolean,
  atopyFamily: boolean,
  sickleCell: boolean,
  parentOccupations: string
): string {
  const issues: string[] = [];

  const density = household.rooms > 0 ? (household.totalMembers / household.rooms).toFixed(1) : 'unknown';
  if (household.totalMembers > 0) {
    issues.push(`Household of ${household.totalMembers} members in ${household.rooms} rooms (density ${density}/room)`);
    if (parseFloat(density) > 3) issues.push('Severe overcrowding — high risk of respiratory and enteric transmission');
  }

  if (['charcoal', 'firewood'].includes(env.cookingFuel) && env.indoorCooking) {
    issues.push('Indoor biomass cooking without adequate ventilation — chronic airway irritation');
  }

  if (smoke) issues.push(`Passive smoke exposure: ${env.smokeExposureDetail || 'reported'}`);

  const waterRisk = wash.waterSource === 'unprotected' ? 'Unprotected water source' : '';
  const sanitationRisk = wash.sanitation === 'open' ? 'Open defecation' : '';
  if (waterRisk || sanitationRisk) issues.push(`${waterRisk}${waterRisk && sanitationRisk ? '; ' : ''}${sanitationRisk} — increased enteric and respiratory infection risk`);

  if (!wash.soapAvailable) issues.push('No soap for handwashing — higher infection transmission');

  if (env.dampnessMold) issues.push('Damp/moldy housing — asthma and allergic exacerbation risk');
  if (env.livestockInside) issues.push('Animals inside home — zoonotic and allergen exposure');

  const familyRisks: string[] = [];
  if (tbContact) familyRisks.push('Active TB household contact');
  if (asthmaFamily) familyRisks.push('Family history of asthma');
  if (atopyFamily) familyRisks.push('Family atopy');
  if (sickleCell) familyRisks.push('Sickle cell disease in family');
  if (familyRisks.length) issues.push('Familial/genetic risks: ' + familyRisks.join(', '));

  const socioeconomic: string[] = [];
  if (parentOccupations) socioeconomic.push(`Parent occupations: ${parentOccupations}`);
  if (socioeconomic.length) issues.push(socioeconomic.join('; '));

  if (issues.length === 0) {
    return 'No significant environmental or social risk factors identified.';
  }

  return issues.join('. ') + '.';
}

// -- UPGRADED renderFamily() ------------------------------------------------

function renderFamily() {
  const clinicalContext = useBiodataContext(form);
  // Existing fields
  const tbHousehold = form.family.tbHousehold;
  const asthmaFamily = form.family.asthmaFamily;
  const atopyFamily = form.family.atopyFamily;
  const sickleCell = form.family.sickleCellFamily;
  const similarIllness = form.family.similarIllnessSiblings;
  const geneticDiseases = form.family.geneticDiseases;
  const smokingExposure = form.family.smokingExposure;
  const smokeDetail = form.family.smokeDetail;
  const parentOccupation = form.family.parentOccupation;
  const housingConditions = form.family.housingConditions;
  const waterSource = form.family.waterSource;
  const sanitation = form.family.sanitation;
  const schoolAttendance = form.family.schoolAttendance;

  // New structured fields (add to form.family)
  const household: HouseholdData = (form.family as any).household || {
    totalMembers: 0, rooms: 0, childrenUnder5: 0, schoolChildren: 0
  };
  const env: EnvironmentData = (form.family as any).env || {
    cookingFuel: 'firewood', indoorCooking: true, ventilation: 'poor',
    dampnessMold: false, livestockInside: false, proximityToRoad: 'moderate',
    smokeExposureDetail: ''
  };
  const wash: WASHData = (form.family as any).wash || {
    waterSource: 'unprotected', waterTreatment: 'none', handwashingFacility: false,
    soapAvailable: false, sanitation: 'open'
  };
  const socioeco: SocioeconomicData = (form.family as any).socioeco || {
    motherEducation: 'none', fatherEducation: 'none',
    motherOccupation: '', fatherOccupation: '',
    insurance: 'none', distanceToHealth: '>15km'
  };

  // Sync the original fields with the new structured ones for backward compatibility
  // (we still keep the original waterSource/sanitation/housingConditions, but also populate the structured ones)
  // For consistency, we can use the original fields as the single source, but here we'll show the new fields as the primary input and update the originals accordingly.

  // Update original fields when new ones change
  useEffect(() => { set("family.waterSource", wash.waterSource); }, [wash.waterSource]);
  useEffect(() => { set("family.sanitation", wash.sanitation); }, [wash.sanitation]);
  // etc., but we'll keep them separate for the UI.

  // Compute risk score and narrative
  const environmentalScore = computeEnvironmentalRiskScore(household, env, wash, smokingExposure);
  const narrative = generateSocialNarrative(
    household, env, wash, smokingExposure,
    tbHousehold, asthmaFamily, atopyFamily, sickleCell, parentOccupation
  );

  // Red flags
  const redFlags: string[] = [];
  if (tbHousehold) redFlags.push('Active TB contact — urgent screening and possible IPT');
  if (environmentalScore >= 8) redFlags.push('High environmental risk — severe pneumonia and recurrence likely');
  if (smokingExposure && !env.smokeExposureDetail) redFlags.push('Passive smoke — document intensity');
  if (wash.sanitation === 'open' && household.childrenUnder5 > 0) redFlags.push('Open defecation with under-5 child — high enteric disease risk');

  return (
    <>
      <AdaptiveGuide phaseIdx={8} />
      <PhaseHeader title="Family & Social History" sub="Household composition, environmental exposures, and familial risk factors." />
      <Card>
        {/* -- 1. HOUSEHOLD COMPOSITION -- */}
        <Section title="Household Composition">
          <Grid cols={2}>
            <Field label="Total Household Members">
              <Inp type="number" value={household.totalMembers?.toString() || ''}
                onChange={v => set("family.household", { ...household, totalMembers: parseInt(v) || 0 })}
                placeholder="Number of people" />
            </Field>
            <Field label="Number of Rooms (excluding kitchen/bath)">
              <Inp type="number" value={household.rooms?.toString() || ''}
                onChange={v => set("family.household", { ...household, rooms: parseInt(v) || 0 })}
                placeholder="Rooms" />
            </Field>
            <Field label="Children Under 5 Years">
              <Inp type="number" value={household.childrenUnder5?.toString() || ''}
                onChange={v => set("family.household", { ...household, childrenUnder5: parseInt(v) || 0 })}
                placeholder="Under-5s" />
            </Field>
            <Field label="School-Going Children">
              <Inp type="number" value={household.schoolChildren?.toString() || ''}
                onChange={v => set("family.household", { ...household, schoolChildren: parseInt(v) || 0 })}
                placeholder="School children" />
            </Field>
          </Grid>
          {household.totalMembers > 0 && household.rooms > 0 && (
            <div style={{ fontSize: 12, marginTop: 8, color: t.textSub }}>
              Household density: {(household.totalMembers / household.rooms).toFixed(1)} persons/room
              {(household.totalMembers / household.rooms) > 3
                ? ' — Overcrowded (increased infectious disease transmission)'
                : ' — Acceptable'}
            </div>
          )}
        </Section>

        {/* -- 2. ENVIRONMENTAL EXPOSURES -- */}
        <Section title="Environmental Exposures">
          <Grid>
            <Field label="Primary Cooking Fuel">
              <Pills
                options={[
                  { value: 'electric', label: 'Electric' },
                  { value: 'gas', label: 'Gas' },
                  { value: 'kerosene', label: 'Kerosene' },
                  { value: 'charcoal', label: 'Charcoal' },
                  { value: 'firewood', label: 'Firewood' },
                  { value: 'other', label: 'Other' }
                ]}
                value={env.cookingFuel}
                onSelect={v => set("family.env", { ...env, cookingFuel: v as any })}
              />
            </Field>
            <Field label="Cooking Location">
              <BoolPill
                label="Cooking done indoors"
                value={env.indoorCooking}
                onToggle={v => set("family.env", { ...env, indoorCooking: v })}
              />
            </Field>
          </Grid>
          {['charcoal', 'firewood'].includes(env.cookingFuel) && env.indoorCooking && (
            <div style={{ fontSize: 11, color: t.warn, marginTop: 4 }}>
              ? Indoor biomass fuel use increases risk of pneumonia, asthma, and chronic lung disease.
            </div>
          )}
          <Field label="Home Ventilation" full>
            <Pills
              options={[
                { value: 'adequate', label: 'Adequate (windows/vent)' },
                { value: 'poor', label: 'Poor / Limited' },
                { value: 'none', label: 'None' }
              ]}
              value={env.ventilation}
              onSelect={v => set("family.env", { ...env, ventilation: v as any })}
            />
          </Field>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <BoolPill
              label="Dampness / visible mold in home"
              value={env.dampnessMold}
              onToggle={v => set("family.env", { ...env, dampnessMold: v })}
            />
            <BoolPill
              label="Livestock kept inside house"
              value={env.livestockInside}
              onToggle={v => set("family.env", { ...env, livestockInside: v })}
            />
          </div>
          <Field label="Proximity to Major Road / Pollution" full>
            <Pills
              options={[
                { value: 'light', label: 'Light traffic' },
                { value: 'moderate', label: 'Moderate traffic' },
                { value: 'heavy', label: 'Heavy traffic / industrial area' }
              ]}
              value={env.proximityToRoad}
              onSelect={v => set("family.env", { ...env, proximityToRoad: v as any })}
            />
          </Field>
        </Section>

        {/* -- 3. WATER, SANITATION & HYGIENE (WASH) -- */}
        <Section title="Water, Sanitation & Hygiene (WASH)">
          <Grid>
            <Field label="Water Source">
              <Pills
                options={[
                  { value: 'piped', label: 'Piped / Treated' },
                  { value: 'borehole', label: 'Borehole / Well' },
                  { value: 'unprotected', label: 'Unprotected surface water' },
                  { value: 'other', label: 'Other' }
                ]}
                value={wash.waterSource}
                onSelect={v => set("family.wash", { ...wash, waterSource: v as any })}
              />
            </Field>
            <Field label="Water Treatment Method">
              <Pills
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'boiling', label: 'Boiling' },
                  { value: 'chlorine', label: 'Chlorine' },
                  { value: 'filter', label: 'Filtration' }
                ]}
                value={wash.waterTreatment}
                onSelect={v => set("family.wash", { ...wash, waterTreatment: v as any })}
              />
            </Field>
          </Grid>
          <Grid>
            <Field label="Sanitation Facility">
              <Pills
                options={[
                  { value: 'flush', label: 'Flush toilet' },
                  { value: 'pit', label: 'Pit latrine' },
                  { value: 'open', label: 'Open defecation' },
                  { value: 'other', label: 'Other' }
                ]}
                value={wash.sanitation}
                onSelect={v => set("family.wash", { ...wash, sanitation: v as any })}
              />
            </Field>
          </Grid>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <BoolPill
              label="Handwashing facility available"
              value={wash.handwashingFacility}
              onToggle={v => set("family.wash", { ...wash, handwashingFacility: v })}
            />
            <BoolPill
              label="Soap available"
              value={wash.soapAvailable}
              onToggle={v => set("family.wash", { ...wash, soapAvailable: v })}
            />
          </div>
        </Section>

        {/* -- 4. SMOKE & TOBACCO EXPOSURE -- */}
        <Section title="Tobacco & Smoke Exposure">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <BoolPill
              label="Passive smoke exposure at home"
              value={smokingExposure}
              onToggle={v => set("family.smokingExposure", v)}
              warn
            />
          </div>
          {smokingExposure && (
            <Field label="Details (who smokes, frequency, location)" full>
              <Inp
                value={env.smokeExposureDetail}
                onChange={v => set("family.env", { ...env, smokeExposureDetail: v })}
                placeholder="e.g. Father smokes 10 cigarettes/day indoors"
              />
            </Field>
          )}
        </Section>

        {/* -- 5. SOCIOECONOMIC FACTORS -- */}
        <Section title="Socioeconomic & Access to Care">
          <Grid>
            <Field label="Mother's Education">
              <Pills
                options={['none', 'primary', 'secondary', 'tertiary'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
                value={socioeco.motherEducation}
                onSelect={v => set("family.socioeco", { ...socioeco, motherEducation: v as any })}
              />
            </Field>
            <Field label="Father's Education">
              <Pills
                options={['none', 'primary', 'secondary', 'tertiary'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
                value={socioeco.fatherEducation}
                onSelect={v => set("family.socioeco", { ...socioeco, fatherEducation: v as any })}
              />
            </Field>
          </Grid>
          <Grid>
            <Field label="Mother's Occupation">
              <Inp value={socioeco.motherOccupation} onChange={v => set("family.socioeco", { ...socioeco, motherOccupation: v })}
                placeholder="e.g. Farmer, teacher, unemployed" />
            </Field>
            <Field label="Father's Occupation">
              <Inp value={socioeco.fatherOccupation} onChange={v => set("family.socioeco", { ...socioeco, fatherOccupation: v })}
                placeholder="e.g. Carpenter, driver, unemployed" />
            </Field>
          </Grid>
          <Grid>
            <Field label="Health Insurance">
              <Pills
                options={[
                  { value: 'NHIF', label: 'NHIF' },
                  { value: 'private', label: 'Private' },
                  { value: 'none', label: 'None' },
                  { value: 'other', label: 'Other' }
                ]}
                value={socioeco.insurance}
                onSelect={v => set("family.socioeco", { ...socioeco, insurance: v as any })}
              />
            </Field>
            <Field label="Distance to Health Facility">
              <Pills
                options={[
                  { value: '<5km', label: '<5 km' },
                  { value: '5-15km', label: '5-15 km' },
                  { value: '>15km', label: '>15 km' }
                ]}
                value={socioeco.distanceToHealth}
                onSelect={v => set("family.socioeco", { ...socioeco, distanceToHealth: v as any })}
              />
            </Field>
          </Grid>
          {socioeco.distanceToHealth === '>15km' && (
            <div style={{ fontSize: 11, color: t.warn, marginTop: 4 }}>
              ? Long distance to care may delay treatment and follow-up.
            </div>
          )}
        </Section>

        {/* -- 6. FAMILY MEDICAL HISTORY -- */}
        <Section title="Family Medical History">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <BoolPill label="Active TB in household" value={tbHousehold} onToggle={v => set("family.tbHousehold", v)} warn />
            <BoolPill label="Asthma in family" value={asthmaFamily} onToggle={v => set("family.asthmaFamily", v)} />
            <BoolPill label="Atopy / eczema / allergic rhinitis" value={atopyFamily} onToggle={v => set("family.atopyFamily", v)} />
            <BoolPill label="Sickle cell disease" value={sickleCell} onToggle={v => set("family.sickleCellFamily", v)} />
            <BoolPill label="Sibling with similar illness" value={similarIllness} onToggle={v => set("family.similarIllnessSiblings", v)} />
          </div>
          <Field label="Other Genetic / Familial Diseases" full>
            <Inp value={geneticDiseases} onChange={v => set("family.geneticDiseases", v)}
              placeholder="e.g. Chromosomal disorders, metabolic disease, congenital anomalies" />
          </Field>
        </Section>

        {/* -- 7. SOCIAL HISTORY IMPRESSION -- */}
        <div style={{
          background: environmentalScore >= 6 ? t.warnBg : t.surfaceAlt,
          borderRadius: 12,
          padding: 16,
          marginTop: 12,
          border: `1px solid ${environmentalScore >= 6 ? t.warn : t.border}`
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: t.text }}>
            🏠 Social & Environmental History Impression
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: t.text }}>
            {narrative}
          </div>
          {environmentalScore >= 6 && (
            <div style={{ marginTop: 10, fontSize: 11, color: t.danger, fontWeight: 600, background: t.dangerBg, borderRadius: 6, padding: '6px 10px' }}>
              ? High environmental risk (score {environmentalScore}) — increased likelihood of recurrent respiratory infections, TB, and severe pneumonia.
            </div>
          )}
          {redFlags.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {redFlags.map((flag, i) => (
                <div key={i} style={{ fontSize: 11, color: t.danger, fontWeight: 600 }}>⚠ {flag}</div>
              ))}
            </div>
          )}
        </div>

        {/* NIL History completeness */}
        <Section title="NIL History — confirm absence of social risk">
          <BoolPill
            label="No significant environmental or familial risks"
            value={(form.family as any).noRisks}
            onToggle={v => set("family.noRisks", v)}
          />
        </Section>
      </Card>
    </>
  );
}
  function renderRos() {
  // Helper: generate key for system detail from title
  const getDetailKey = (title: string) =>
    title.toLowerCase().replace(/[^a-z]/g, '') + 'Detail';

  // Compute status for each system
  const systems = [
    { title: 'Neurological', fields: [{ k: 'seizures', l: 'Seizures', label: 'Seizures', w: true }, { k: 'headache', l: 'Headache', label: 'Headache' }, { k: 'lethargyRos', l: 'Lethargy', label: 'Lethargy', w: true }, { k: 'dizziness', l: 'Dizziness', label: 'Dizziness' }, { k: 'syncope', l: 'Syncope', label: 'Syncope', w: true }] },
    { title: 'Cardiovascular', fields: [{ k: 'cyanosisRos', l: 'Cyanosis', label: 'Cyanosis', w: true }, { k: 'peripheralEdema', l: 'Peripheral edema', label: 'Peripheral edema' }, { k: 'fatigue', l: 'Fatigue', label: 'Fatigue' }, { k: 'palpitations', l: 'Palpitations', label: 'Palpitations' }] },
    { title: 'Gastrointestinal', fields: [{ k: 'vomiting', l: 'Vomiting', label: 'Vomiting', w: true }, { k: 'diarrhea', l: 'Diarrhea', label: 'Diarrhea' }, { k: 'abdominalPain', l: 'Abdominal pain', label: 'Abdominal pain' }, { k: 'hepatomegaly', l: 'Hepatomegaly', label: 'Hepatomegaly', w: true }, { k: 'constipation', l: 'Constipation', label: 'Constipation' }] },
    { title: 'Urinary', fields: [{ k: 'reducedUrine', l: 'Reduced urine output', label: 'Reduced urine output', w: true }, { k: 'dysuria', l: 'Dysuria', label: 'Dysuria' }, { k: 'hematuria', l: 'Hematuria', label: 'Hematuria' }] },
    { title: 'Dermatological', fields: [{ k: 'rash', l: 'Rash', label: 'Rash' }, { k: 'jaundice', l: 'Jaundice', label: 'Jaundice', w: true }, { k: 'pallor', l: 'Pallor', label: 'Pallor' }, { k: 'clubbing', l: 'Clubbing', label: 'Clubbing' }, { k: 'bruising', l: 'Bruising', label: 'Bruising' }, { k: 'petechiae', l: 'Petechiae', label: 'Petechiae', w: true }] },
    { title: 'ENT', fields: [{ k: 'earPain', l: 'Ear pain', label: 'Ear pain' }, { k: 'earDischarge', l: 'Ear discharge', label: 'Ear discharge' }, { k: 'soreThroatRos', l: 'Sore throat', label: 'Sore throat' }, { k: 'nasalDischargeRos', l: 'Nasal discharge', label: 'Nasal discharge' }, { k: 'hearingLoss', l: 'Hearing loss', label: 'Hearing loss' }] },
  ];
  const systemsWithStatus = systems.map(sys => {
    const positiveKeys = sys.fields.filter(f => form.ros[f.k]).map(f => f.label);
    const hasWarn = sys.fields.some(f => f.w && form.ros[f.k]);
    const hasAnyPositive = positiveKeys.length > 0;
    const statusColor = hasWarn ? t.danger : hasAnyPositive ? t.warn : t.success;
    const statusText = hasAnyPositive
      ? `${positiveKeys.length} positive sign${positiveKeys.length > 1 ? 's' : ''}`
      : 'Normal';

    return { ...sys, positiveKeys, hasWarn, hasAnyPositive, statusColor, statusText };
  });

  // Red flag detection across all systems
  const redFlags: string[] = [];
  systemsWithStatus.forEach(sys => {
    sys.fields.forEach(f => {
      if (form.ros[f.k] && f.w) {
        redFlags.push(`${f.label} (${sys.title})`);
      }
    });
  });

  // Build overall ROS summary
  const overallSummary = systemsWithStatus.map(sys => {
    if (!sys.hasAnyPositive) return `${sys.title}: No symptoms reported.`;
    else {
      const detail = form.ros[getDetailKey(sys.title)] || '';
      return `${sys.title}: Positive for ${sys.positiveKeys.join(', ')}.${detail ? ' Detail: ' + detail : ''}`;
    }
  }).join('\n');

  return (
    <>
      <AdaptiveGuide phaseIdx={9} />
      <PhaseHeader
        title="Review of Systems"
        sub="Systematic symptom screen with auto-generated system-by-system interpretation."
      />
      <Card>
        {systemsWithStatus.map(sys => (
          <Section key={sys.title} title={sys.title}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: t.text }}>{sys.title}</div>
              <div
                style={{
                  padding: '2px 10px',
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 600,
                  background: sys.statusColor === t.success ? t.successBg : sys.statusColor === t.warn ? t.warnBg : t.dangerBg,
                  color: sys.statusColor,
                  border: `1px solid ${sys.statusColor}`,
                }}
              >
                {sys.statusText}
              </div>
            </div>

            {/* Checkbox pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {sys.fields.map(f => (
                <BoolPill
                  key={f.k}
                  label={f.l}
                  value={form.ros[f.k]}
                  onToggle={v => set(`ros.${f.k}`, v)}
                  warn={f.w}
                />
              ))}
            </div>

            {/* If any positive, offer detail input */}
            {sys.hasAnyPositive && (
              <div style={{ marginTop: 8 }}>
                <Field label="Further details (describe character, severity, duration)" full>
                  <Inp
                    value={form.ros[getDetailKey(sys.title)] || ''}
                    onChange={v => set(`ros.${getDetailKey(sys.title)}`, v)}
                    placeholder="e.g. seizure type, duration, triggers?"
                  />
                </Field>
              </div>
            )}

            {/* Special handling for skin system: rash description still appears separately if needed */}
            {sys.title === 'Skin & Haematology' && form.ros.rash && (
              <div style={{ marginTop: 8 }}>
                <Field label="Rash Description (type, distribution, onset)" full>
                  <Inp
                    value={form.ros.rashType}
                    onChange={v => set('ros.rashType', v)}
                    placeholder="e.g. maculopapular, blanching, started on trunk"
                  />
                </Field>
              </div>
            )}
          </Section>
        ))}

        {/* Red flag alerts */}
        {redFlags.length > 0 && (
          <div
            style={{
              background: t.dangerBg,
              borderRadius: 10,
              padding: 14,
              marginTop: 12,
              border: `1px solid ${t.danger}`,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: t.danger, marginBottom: 6 }}>
              ⚠ Potentially Urgent Findings
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 12, color: t.danger }}>
              {redFlags.map((flag, i) => (
                <li key={i}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Automated ROS Summary */}
        <div
          style={{
            background: t.surfaceAlt,
            borderRadius: 10,
            padding: 16,
            marginTop: 16,
            border: `1px solid ${t.border}`,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, color: t.text, marginBottom: 12 }}>
            📋 Automated Review of Systems Summary
          </div>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: t.font,
              fontSize: 12,
              lineHeight: 1.7,
              color: t.text,
              margin: 0,
              background: 'transparent',
            }}
          >
            {overallSummary}
          </pre>
        </div>
      </Card>
    </>
  );
}

function renderHistorySummary() {
  // ── Gather core complaints ─────────────────────────────────────────────
  const complaints = form.complaints || [];
  const hasCough = complaints.includes('cough');
  const hasFever = complaints.includes('fever');
  const hasWheeze = complaints.includes('wheeze');
  const hasStridor = complaints.includes('stridor');
  const hasDifficultyBreathing = complaints.includes('difficulty_breathing');
  const hasChestIndrawing = form.hpi.chestIndrawing;
  const hasCyanosis = form.hpi.cyanoticEpisodes;
  const hasFeedingDiff = form.hpi.feedingDiff;
  const hasSeizures = form.hpi.seizureHPI || form.ros.seizures;

  // ── Danger signs from history ──────────────────────────────────────────
  const dangerSigns: string[] = [];
  if (hasChestIndrawing) dangerSigns.push('Chest indrawing (informant)');
  if (hasCyanosis) dangerSigns.push('Cyanosis');
  if (hasFeedingDiff) dangerSigns.push('Feeding difficulty');
  if (hasSeizures) dangerSigns.push('Seizures');
  if (form.hpi.headBobbing) dangerSigns.push('Head bobbing');
  if (form.ros.lethargyRos) dangerSigns.push('Lethargy');
  if (form.ros.petechiae) dangerSigns.push('Petechiae');
  const dangerCount = dangerSigns.length;

  // ── Complaints timeline (if stored) ────────────────────────────────────
  const symptomOrder = (form.hpi as any).symptomOrder || [];
  const durations = form.complaintDurations || {};
  const timelineParts = symptomOrder
    .filter(id => complaints.includes(id))
    .map((id, idx) => {
      const symLabel = ALL_SYMPTOMS.find(s => s.id === id)?.label || id;
      const dur = durations[id] ? ` lasting ${durations[id]}` : '';
      return idx === 0
        ? `started with ${symLabel}${dur}`
        : `followed by ${symLabel}${dur}`;
    });

  // ── Birth history risk factors ─────────────────────────────────────────
  const birthRiskFactors: string[] = [];
  if (form.birth.nicuAdmission) birthRiskFactors.push('NICU admission');
  if (form.birth.gestAgeWeeks && parseInt(form.birth.gestAgeWeeks) < 37)
    birthRiskFactors.push(`Prematurity (${form.birth.gestAgeWeeks} weeks)`);
  if ((form.birth as any).neonatalComplications?.includes('Birth Asphyxia'))
    birthRiskFactors.push('Birth asphyxia');
  if ((form.birth as any).neonatalComplications?.includes('Neonatal Sepsis'))
    birthRiskFactors.push('Neonatal sepsis');
  if ((form.birth as any).neonatalComplications?.includes('Respiratory Distress'))
    birthRiskFactors.push('Neonatal respiratory distress');

  // ── Past medical history summary ───────────────────────────────────────
  const pmhConditions = (form.pmh as any).conditions || [];
  const chronicConditionNames = pmhConditions.map((c: any) => c.name).filter(Boolean);
  const asthmaPMH = chronicConditionNames.includes('Asthma');
  const hivPMH = chronicConditionNames.includes('HIV/AIDS');
  const cardiacPMH = chronicConditionNames.includes('Congenital Heart Disease');

  // ── Nutritional status ─────────────────────────────────────────────────
  const muac = parseFloat(form.nutrition.muac);
  const muacClass = muac ? classifyMUAC(muac) : null;
  const edema = (form.nutrition as any).malnutritionSigns?.includes('Bilateral pitting oedema');

  // ── Immunisation status ────────────────────────────────────────────────
  const immMissing = (form.immunization as any).missedVaccines || [];
  const immStatus = (form.immunization as any).status;

  // ── Social / environmental risks ───────────────────────────────────────
  const socialRisks: string[] = [];
  if (form.family.tbHousehold) socialRisks.push('TB household contact');
  if ((form.family as any).housingConditions === 'crowded') socialRisks.push('Overcrowded housing');
  if ((form.family as any).waterSource === 'unprotected') socialRisks.push('Unsafe water source');
  if ((form.family as any).sanitation === 'open') socialRisks.push('Open defecation');
  if ((form.family as any).smokingExposure) socialRisks.push('Passive smoke exposure');
  const env = (form.family as any).env || {};
  if (env.cookingFuel === 'charcoal' || env.cookingFuel === 'firewood') {
    if (env.indoorCooking) socialRisks.push('Indoor biomass cooking');
  }
  if (env.dampnessMold) socialRisks.push('Damp/moldy home');

  // ── ROS positives ──────────────────────────────────────────────────────
  const sysRO = [
    { title: 'Neurological', fields: [{ k: 'seizures', l: 'Seizures', label: 'Seizures', w: true }, { k: 'headache', l: 'Headache', label: 'Headache' }, { k: 'lethargyRos', l: 'Lethargy', label: 'Lethargy', w: true }, { k: 'dizziness', l: 'Dizziness', label: 'Dizziness' }, { k: 'syncope', l: 'Syncope', label: 'Syncope', w: true }] },
    { title: 'Cardiovascular', fields: [{ k: 'cyanosisRos', l: 'Cyanosis', label: 'Cyanosis', w: true }, { k: 'peripheralEdema', l: 'Peripheral edema', label: 'Peripheral edema' }, { k: 'fatigue', l: 'Fatigue', label: 'Fatigue' }, { k: 'palpitations', l: 'Palpitations', label: 'Palpitations' }] },
    { title: 'Gastrointestinal', fields: [{ k: 'vomiting', l: 'Vomiting', label: 'Vomiting', w: true }, { k: 'diarrhea', l: 'Diarrhea', label: 'Diarrhea' }, { k: 'abdominalPain', l: 'Abdominal pain', label: 'Abdominal pain' }, { k: 'hepatomegaly', l: 'Hepatomegaly', label: 'Hepatomegaly', w: true }, { k: 'constipation', l: 'Constipation', label: 'Constipation' }] },
    { title: 'Urinary', fields: [{ k: 'reducedUrine', l: 'Reduced urine output', label: 'Reduced urine output', w: true }, { k: 'dysuria', l: 'Dysuria', label: 'Dysuria' }, { k: 'hematuria', l: 'Hematuria', label: 'Hematuria' }] },
    { title: 'Dermatological', fields: [{ k: 'rash', l: 'Rash', label: 'Rash' }, { k: 'jaundice', l: 'Jaundice', label: 'Jaundice', w: true }, { k: 'pallor', l: 'Pallor', label: 'Pallor' }, { k: 'clubbing', l: 'Clubbing', label: 'Clubbing' }, { k: 'bruising', l: 'Bruising', label: 'Bruising' }, { k: 'petechiae', l: 'Petechiae', label: 'Petechiae', w: true }] },
    { title: 'ENT', fields: [{ k: 'earPain', l: 'Ear pain', label: 'Ear pain' }, { k: 'earDischarge', l: 'Ear discharge', label: 'Ear discharge' }, { k: 'soreThroatRos', l: 'Sore throat', label: 'Sore throat' }, { k: 'nasalDischargeRos', l: 'Nasal discharge', label: 'Nasal discharge' }, { k: 'hearingLoss', l: 'Hearing loss', label: 'Hearing loss' }] },
  ];
  const rosPositives = sysRO.flatMap((sys: any) =>
    sys.fields.filter((f: any) => form.ros[f.k]).map((f: any) => f.l)
  );

  // ── Build synthesised narrative ────────────────────────────────────────
  const hpiNarrative = form.hpi.associated || '';
  const onsetType = form.hpi.onsetType || 'undocumented';
  const progression = form.hpi.progression || 'undocumented';

  const primaryComplaintText = complaints.length > 0
    ? complaints.map(c => c.replace(/_/g, ' ')).join(', ')
    : 'no specific complaint';

  let summary = `This ${formatAge(form.biodata.ageMonths)} ${form.biodata.sex || ''} presents with ${primaryComplaintText}. `;
  if (timelineParts.length > 0) {
    summary += `The illness ${timelineParts.join(', ')}. `;
  } else {
    summary += `The onset was ${onsetType} and the course has been ${progression}. `;
  }
  if (hpiNarrative) summary += `The caregiver describes: ${hpiNarrative}. `;

  // Add danger signs
  if (dangerCount > 0) {
    summary += `There are ${dangerCount} danger sign(s) from the history: ${dangerSigns.join('; ')}. `;
  } else {
    summary += `No clear danger signs were reported. `;
  }

  // Add relevant PMH
  if (chronicConditionNames.length > 0) {
    summary += `Past medical history includes ${chronicConditionNames.join(', ')}. `;
  }
  if (asthmaPMH) summary += `This may influence the current respiratory presentation. `;
  if (hivPMH) summary += `HIV infection increases the risk of severe pneumonia, TB, and PCP. `;
  if (cardiacPMH) summary += `Congenital heart disease predisposes to respiratory infections and heart failure. `;

  // Birth history
  if (birthRiskFactors.length > 0) {
    summary += `Perinatal history is notable for ${birthRiskFactors.join(', ')}. `;
  }

  // Nutrition
  if (muacClass) {
    summary += `Nutritional status: ${muacClass.category} (MUAC ${muac} cm). `;
  }
  if (edema) summary += `Bilateral pitting oedema indicates severe acute malnutrition (SAM). `;

  // Immunisation
  if (immStatus === 'unimmunized' || immStatus === 'incomplete') {
    summary += `Immunisation status is incomplete, missing ${immMissing.join(', ')}. `;
  }

  // Social risks
  if (socialRisks.length > 0) {
    summary += `Social/environmental risk factors include ${socialRisks.join(', ')}. `;
  }

  // ROS positives
  if (rosPositives.length > 0) {
    summary += `Other systemic symptoms include ${rosPositives.join(', ')}. `;
  }

  // Severity/risk classification
  const severityClass =
    dangerCount >= 3 ? 'high‑risk' : dangerCount >= 1 ? 'moderate‑risk' : 'low‑risk';

  return (
    <>
      <PhaseHeader
        title="History Summary"
        sub="Consultant‑level synthesis of all history domains – examination findings are excluded."
      />
      <Card>
        <Section title="1. Presenting Illness Synthesis">
          <div style={{
            padding: 14,
            background: t.surfaceAlt,
            borderRadius: 10,
            fontSize: 13,
            lineHeight: 1.7,
            color: t.text,
          }}>
            {summary}
          </div>
        </Section>

        <Section title="2. History-Based Severity Assessment">
          <div style={{
            padding: 14,
            borderRadius: 10,
            background: severityClass === 'high‑risk' ? t.dangerBg : severityClass === 'moderate‑risk' ? t.warnBg : t.successBg,
            color: severityClass === 'high‑risk' ? t.danger : severityClass === 'moderate‑risk' ? t.warn : t.success,
            fontWeight: 600,
            fontSize: 13,
          }}>
            {severityClass === 'high‑risk' &&
              '⚠ This child has multiple danger signs and is at high risk of severe disease. Urgent evaluation is required.'}
            {severityClass === 'moderate‑risk' &&
              '❗ The history suggests moderate concern; close monitoring and thorough assessment are needed.'}
            {severityClass === 'low‑risk' &&
              '✅ No high‑risk features identified from history; the child is currently stable by caregiver report.'}
          </div>
        </Section>

        <Section title="3. Risk Factor Summary">
          <div style={{
            padding: 14,
            background: t.surfaceAlt,
            borderRadius: 10,
            fontSize: 12,
            lineHeight: 1.7,
            color: t.textSub,
          }}>
            {socialRisks.length > 0 && (
              <div><b>Social/Environmental:</b> {socialRisks.join(', ')}</div>
            )}
            {chronicConditionNames.length > 0 && (
              <div><b>Chronic Conditions:</b> {chronicConditionNames.join(', ')}</div>
            )}
            {birthRiskFactors.length > 0 && (
              <div><b>Perinatal:</b> {birthRiskFactors.join(', ')}</div>
            )}
            {muacClass && <div><b>Nutrition:</b> {muacClass.category} {edema ? '(SAM with oedema)' : ''}</div>}
            {immStatus && immStatus !== 'up_to_date' && (
              <div><b>Immunisation:</b> {immStatus === 'unimmunized' ? 'Not immunised' : 'Incomplete'} – missing {immMissing.join(', ')}</div>
            )}
            {rosPositives.length > 0 && (
              <div><b>ROS Positives:</b> {rosPositives.join(', ')}</div>
            )}
            {socialRisks.length === 0 && chronicConditionNames.length === 0 && birthRiskFactors.length === 0 &&
              !muacClass && immStatus === 'up_to_date' && rosPositives.length === 0 && (
              <div>No significant medical, nutritional, or social risk factors identified.</div>
            )}
          </div>
        </Section>

        <Section title="4. Consultant Impression (History Only)">
          <div style={{
            padding: 14,
            background: t.surface,
            borderRadius: 10,
            border: `1px solid ${t.border}`,
            fontSize: 13,
            lineHeight: 1.7,
            color: t.text,
          }}>
            Based on the history alone, this {formatAge(form.biodata.ageMonths)} {form.biodata.sex || 'child'} has
            a {severityClass} presentation most consistent with
            {hasCough && hasFever ? ' an acute respiratory infection, possibly pneumonia or bronchiolitis' : ''}
            {hasCough && !hasFever ? ' a possible upper airway process (croup) or asthma exacerbation' : ''}
            {hasWheeze && ' with wheezing suggesting bronchiolitis or asthma' }
            {hasStridor && ' with stridor indicating upper airway obstruction (croup or epiglottitis)' }
            {!hasCough && !hasWheeze && !hasStridor && ' a systemic febrile illness with no clear respiratory focus'}.
            {dangerCount > 0 && ` The presence of ${dangerSigns.join(', ')} warrants immediate clinical assessment.`}
            No physical examination findings are incorporated into this summary.
          </div>
        </Section>
      </Card>
    </>
  );
}

  function renderExamGeneral() {
  const ageMonths = parseInt(form.biodata.ageMonths) || 0;
  const band = getAgeBand(ageMonths);
  const sex = form.biodata.sex || 'Male';
  const weightKg = parseFloat(form.vitals.weight);
  const heightCm = parseFloat(form.vitals.height);
  const muacCm = parseFloat(form.vitals.muac);
  const hcCm = parseFloat(form.vitals.hc);
  const spo2 = parseFloat(form.vitals.spo2);
  const rr = parseFloat(form.vitals.rr);
  const hr = parseFloat(form.vitals.hr);
  const temp = parseFloat(form.vitals.temp);
  const bp = form.vitals.bp;

  // -- Derived interpretations ---------------------------------------------
  const spo2Severity = !isNaN(spo2)
    ? spo2 < 85 ? 'critical' : spo2 < 92 ? 'severe' : spo2 < 95 ? 'mild' : null
    : null;
  const rrSeverity = !isNaN(rr)
    ? (ageMonths < 12 && rr >= 50) || (ageMonths < 60 && rr >= 40) || (ageMonths >= 60 && rr >= 30)
      ? (rr >= 70 ? 'critical' : 'moderate') : null
    : null;
  const avpu = form.vitals.avpu || 'alert';
  const generalCond = form.vitals.generalCondition || '';
  const isToxic = generalCond === 'toxic' || generalCond === 'very_sick' || generalCond === 'lethargic';

  // Anthropometric interpretations
  const muacInterpret = !isNaN(muacCm) && ageMonths >= 6 && ageMonths <= 59
    ? classifyMUAC(muacCm) : null;
  const weightInterpret = !isNaN(weightKg)
    ? classifyWeightForAge(weightKg, ageMonths, sex) : null;
  const heightInterpret = !isNaN(heightCm)
    ? classifyHeightForAge(heightCm, ageMonths, sex) : null;
  const hcInterpret = !isNaN(hcCm) && ageMonths <= 24
    ? (hcCm < 42 ? 'Microcephaly' : hcCm > 50 ? 'Macrocephaly' : 'Normal') : null;

  // Hydration
  const hydration = form.vitals.hydration || '';
  const isDehydrated = hydration === 'moderate' || hydration === 'severe';

  // -- Build auto-generated first impression ------------------------------
  const impressionParts: string[] = [];
  if (isToxic) impressionParts.push('toxic-appearing');
  else if (generalCond === 'moderately_ill') impressionParts.push('moderately ill');
  else if (generalCond === 'mildly_ill') impressionParts.push('mildly unwell');
  else if (generalCond === 'well') impressionParts.push('well-looking');

  if (spo2Severity === 'critical') impressionParts.push('critically hypoxic');
  else if (spo2Severity === 'severe') impressionParts.push('hypoxic');
  else if (spo2Severity === 'mild') impressionParts.push('borderline oxygen saturation');

  if (rrSeverity === 'critical') impressionParts.push('with severe tachypnoea');
  else if (rrSeverity === 'moderate') impressionParts.push('with tachypnoea');

  if (muacInterpret?.category.includes('SAM')) impressionParts.push('severely malnourished');
  else if (muacInterpret?.category.includes('MAM')) impressionParts.push('moderately malnourished');

  if (form.vitals.cyanosisExam) impressionParts.push('centrally cyanosed');
  if (form.vitals.pallorExam) impressionParts.push('pale');
  if (isDehydrated) impressionParts.push('dehydrated');

  const firstImpression = impressionParts.length > 0
    ? `Child appears ${impressionParts.join(', ')}.`
    : 'Child appears clinically stable with no immediate danger signs.';

  return (
    <>
      <AdaptiveGuide phaseIdx={10} />
      <PhaseHeader
        title="General Examination"
        sub="Vital signs, anthropometry, hydration, general signs, ENT/oral exam, and lymphadenopathy."
      />
      <Card>
        {/* -- AUTO-GENERATED FIRST IMPRESSION -- */}
        <div style={{
          background: isToxic || spo2Severity === 'critical' ? t.dangerBg
            : spo2Severity === 'severe' || rrSeverity === 'critical' ? t.warnBg
            : t.accentBg,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          border: `1px solid ${
            isToxic || spo2Severity === 'critical' ? t.danger
            : spo2Severity === 'severe' || rrSeverity === 'critical' ? t.warn
            : t.accent
          }`,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: t.text }}>
            📝 First Impression
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: t.text }}>
            {firstImpression}
          </div>
        </div>

        {/* -- VITAL SIGNS -- */}
        <Section title="Vital Signs">
          <Grid cols={4}>
            <VitalInput
              label="Temperature" unit="°C" val={form.vitals.temp}
              onChange={v => set("vitals.temp", v)}
              warnFn={v => v >= 38.5 ? 'Fever' : v < 36 ? 'Hypothermia' : null}
            />
            <VitalInput
              label="Heart Rate" unit="bpm" val={form.vitals.hr}
              onChange={v => set("vitals.hr", v)}
              warnFn={v => {
                const a = ageMonths;
                return (a < 12 && v > 160) || (a < 60 && v > 140) || (v > 120)
                  ? 'Tachycardia' : v < 60 ? 'Bradycardia' : null;
              }}
            />
            <VitalInput
              label="Respiratory Rate" unit="/min" val={form.vitals.rr}
              onChange={v => set("vitals.rr", v)}
              warnFn={v => {
                const a = ageMonths;
                return (a < 12 && v >= 50) || (a < 60 && v >= 40) || (a >= 60 && v >= 30)
                  ? `Tachypnoea (${v}/min)` : null;
              }}
            />
            <VitalInput
              label="SpO2" unit="%" val={form.vitals.spo2}
              onChange={v => set("vitals.spo2", v)}
              warnFn={v => v < 88 ? 'CRITICAL HYPOXIA' : v < 92 ? 'Hypoxia — give O2 now' : v < 95 ? 'Borderline — monitor' : null}
            />
          </Grid>
          <Grid>
            <Field label="Blood Pressure (mmHg)">
              <Inp value={bp || ''} onChange={v => set("vitals.bp", v)} placeholder="e.g. 100/70" />
            </Field>
            <Field label="Hydration Status">
              <Sel
                value={hydration}
                onChange={v => set("vitals.hydration", v)}
                options={[
                  { value: "well_hydrated", label: "Well hydrated" },
                  { value: "mild", label: "Mild dehydration (~5%)" },
                  { value: "moderate", label: "Moderate dehydration (~10%)" },
                  { value: "severe", label: "Severe dehydration (>10%)" },
                  { value: "over_hydrated", label: "Over-hydrated / Oedematous" }
                ]}
              />
            </Field>
          </Grid>
          {band && (
            <div style={{
              padding: "8px 12px", background: t.accentBg, borderRadius: 8,
              fontSize: 12, color: t.accentText, marginTop: 4
            }}>
              Expected for {band.label}: HR {band.hrMin}–{band.hrMax} bpm | RR {band.rrMin}–{band.rrMax}/min | SBP {band.sbpMin}–{band.sbpMax} mmHg
            </div>
          )}

          {/* Vital sign interpretation summary */}
          <div style={{ marginTop: 12, fontSize: 12, color: t.textSub, lineHeight: 1.6 }}>
            <b>Interpretation:</b>{' '}
            {!isNaN(rr) && rrSeverity
              ? `RR ${rr}/min — ${rrSeverity === 'critical' ? 'Severe ' : ''}tachypnoea for age. `
              : !isNaN(rr) ? `RR ${rr}/min — within normal range for age. ` : ''}
            {!isNaN(spo2) && spo2Severity
              ? `SpO2 ${spo2}% — ${spo2Severity === 'critical' ? 'Critical hypoxaemia requiring immediate oxygen.' : spo2Severity === 'severe' ? 'Hypoxia — give oxygen now.' : 'Borderline — monitor closely.'} `
              : !isNaN(spo2) ? `SpO2 ${spo2}% — adequate oxygenation. ` : ''}
            {isDehydrated && 'Signs of dehydration present — assess for shock and initiate rehydration.'}
          </div>
        </Section>

        {/* -- ANTHROPOMETRY -- */}
        <Section title="Anthropometry">
          <Grid cols={4}>
            <VitalInput
              label="Weight" unit="kg" val={form.vitals.weight}
              onChange={v => set("vitals.weight", v)}
            />
            <VitalInput
              label="Height / Length" unit="cm" val={form.vitals.height}
              onChange={v => set("vitals.height", v)}
            />
            <VitalInput
              label="MUAC" unit="cm" val={form.vitals.muac}
              onChange={v => set("vitals.muac", v)}
              warnFn={v => v < 11.5 ? 'SAM (<11.5 cm)' : v < 12.5 ? 'MAM (<12.5 cm)' : null}
            />
            <VitalInput
              label="Head Circumference" unit="cm" val={form.vitals.hc}
              onChange={v => set("vitals.hc", v)}
            />
          </Grid>

          {/* Anthropometry interpretation panel */}
          <div style={{
            marginTop: 12, padding: 12, background: t.surfaceAlt,
            borderRadius: 10, border: `1px solid ${t.border}`,
          }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: t.text, marginBottom: 8 }}>
              📏 Growth Interpretation
            </div>
            <div style={{ display: 'grid', gap: 4, fontSize: 11, color: t.textSub }}>
              {weightInterpret && (
                <div>
                  Weight-for-age: <span style={{ color: weightInterpret.color, fontWeight: 600 }}>{weightInterpret.category}</span>
                  {weightInterpret.risk && <span> — {weightInterpret.risk}</span>}
                </div>
              )}
              {heightInterpret && (
                <div>
                  Length/height-for-age: <span style={{ color: heightInterpret.color, fontWeight: 600 }}>{heightInterpret.category}</span>
                </div>
              )}
              {muacInterpret && (
                <div>
                  MUAC {muacCm} cm: <span style={{ color: muacInterpret.color, fontWeight: 600 }}>{muacInterpret.category}</span>
                  {muacInterpret.risk && <span> — {muacInterpret.risk}</span>}
                </div>
              )}
              {hcInterpret && (
                <div>
                  Head circumference: <span style={{
                    fontWeight: 600,
                    color: hcInterpret === 'Normal' ? t.success : t.warn,
                  }}>{hcInterpret}</span> {hcInterpret !== 'Normal' && '⚠ needs further evaluation'}
                </div>
              )}
              {!weightInterpret && !heightInterpret && !muacInterpret && !hcInterpret && (
                <div>Enter anthropometric measurements to see growth interpretation.</div>
              )}
            </div>
          </div>
        </Section>

        {/* -- GENERAL CONDITION -- */}
        <Section title="General Condition">
          <Grid>
            <Field label="General Appearance">
              <Sel
                value={generalCond}
                onChange={v => set("vitals.generalCondition", v)}
                options={[
                  { value: "well", label: "Well-looking / Active" },
                  { value: "mildly_ill", label: "Mildly ill" },
                  { value: "moderately_ill", label: "Moderately ill" },
                  { value: "toxic", label: "Toxic / Severely ill" },
                  { value: "lethargic", label: "Lethargic / Obtunded" }
                ]}
              />
            </Field>
            <Field label="AVPU Score">
              <Sel
                value={avpu}
                onChange={v => set("vitals.avpu", v)}
                options={[
                  { value: "alert", label: "Alert (A)" },
                  { value: "voice", label: "Responds to Voice (V)" },
                  { value: "pain", label: "Responds to Pain (P)" },
                  { value: "unresponsive", label: "Unresponsive (U)" }
                ]}
              />
            </Field>
          </Grid>
          {avpu !== 'alert' && (
            <div style={{ fontSize: 11, color: t.warn, marginTop: 4 }}>
              Reduced consciousness — may indicate severe hypoxia, shock, or CNS pathology.
            </div>
          )}
        </Section>

        {/* -- GENERAL PHYSICAL SIGNS -- */}
        <Section title="General Signs">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <BoolPill
              label="Pallor"
              value={form.vitals.pallorExam}
              onToggle={v => set("vitals.pallorExam", v)}
            />
            <BoolPill
              label="Jaundice"
              value={form.vitals.jaundiceExam}
              onToggle={v => set("vitals.jaundiceExam", v)}
              warn
            />
            <BoolPill
              label="Central cyanosis"
              value={form.vitals.cyanosisExam}
              onToggle={v => set("vitals.cyanosisExam", v)}
              warn
            />
            <BoolPill
              label="Digital clubbing"
              value={form.vitals.clubbingExam}
              onToggle={v => set("vitals.clubbingExam", v)}
            />
            <BoolPill
              label="Peripheral oedema"
              value={form.vitals.edemaExam}
              onToggle={v => set("vitals.edemaExam", v)}
            />
          </div>
          {form.vitals.pallorExam && (
            <div style={{ marginTop: 8 }}>
              <Field label="Pallor Site & Severity" full>
                <Inp
                  value={(form.vitals as any).pallorDetail || ''}
                  onChange={v => set("vitals.pallorDetail", v)}
                  placeholder="e.g. Moderate — conjunctiva + palms"
                />
              </Field>
            </div>
          )}
          {form.vitals.cyanosisExam && (
            <div style={{ marginTop: 4, fontSize: 11, color: t.danger, fontWeight: 600 }}>
              Central cyanosis is a medical emergency — indicates severe hypoxia or congenital heart disease.
            </div>
          )}
        </Section>

        {/* -- ENT / ORAL EXAM -- */}
        <Section title="ENT & Oral Examination">
          <Grid>
            <Field label="Nose">
              <Pills
                options={[
                  { value: "clear", label: "Clear" },
                  { value: "purulent", label: "Purulent discharge" },
                  { value: "bloody", label: "Bloody discharge" },
                  { value: "blocked", label: "Nasal obstruction" },
                  { value: "flaring", label: "Nasal flaring" }
                ]}
                value={(form.vitals as any).noseExam || ''}
                onSelect={v => set("vitals.noseExam", v)}
              />
            </Field>
            <Field label="Mouth / Oral Mucosa">
              <Pills
                options={[
                  { value: "normal", label: "Normal / moist" },
                  { value: "dry", label: "Dry mucosa" },
                  { value: "thrush", label: "Oral thrush (white plaques)" },
                  { value: "ulcers", label: "Oral ulcers" },
                  { value: "gingivitis", label: "Gingivitis / stomatitis" }
                ]}
                value={(form.vitals as any).mouthExam || ''}
                onSelect={v => set("vitals.mouthExam", v)}
              />
            </Field>
          </Grid>
          {(form.vitals as any).mouthExam === 'thrush' && (
              <div style={{ fontSize: 11, color: t.warn, marginTop: 4 }}>
              Oral thrush in a child {'>'}6 weeks may indicate immunosuppression, HIV, recent antibiotics, or inhaled steroid use.
            </div>
          )}
          <Grid>
            <Field label="Tonsils">
              <Pills
                options={[
                  { value: "grade0", label: "Grade 0 (not visible)" },
                  { value: "grade1", label: "Grade 1 (<25%)" },
                  { value: "grade2", label: "Grade 2 (25-50%)" },
                  { value: "grade3", label: "Grade 3 (50-75%)" },
                  { value: "grade4", label: "Grade 4 (>75% / kissing)" }
                ]}
                value={(form.vitals as any).tonsilsExam || ''}
                onSelect={v => set("vitals.tonsilsExam", v)}
              />
            </Field>
            <Field label="Tonsil Appearance">
              <Pills
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "exudate", label: "Exudate present" },
                  { value: "erythema", label: "Erythematous" },
                  { value: "membrane", label: "Membrane (diphtheria?)" }
                ]}
                value={(form.vitals as any).tonsilAppearance || ''}
                onSelect={v => set("vitals.tonsilAppearance", v)}
              />
            </Field>
          </Grid>
          {(form.vitals as any).tonsilAppearance === 'membrane' && (
            <div style={{ fontSize: 11, color: t.danger, fontWeight: 600, marginTop: 4 }}>
              ? Tonsillar membrane — consider diphtheria. Isolate, notify, and start DAT + antibiotics urgently.
            </div>
          )}
          <Grid>
            <Field label="Ears">
              <Pills
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "discharge", label: "Purulent discharge" },
                  { value: "serous", label: "Serous discharge" },
                  { value: "bulging", label: "Bulging tympanic membrane" },
                  { value: "perforation", label: "Perforated TM" }
                ]}
                value={(form.vitals as any).earExam || ''}
                onSelect={v => set("vitals.earExam", v)}
              />
            </Field>
          </Grid>
        </Section>

        {/* -- LYMPH NODES -- */}
        <Section title="Lymph Nodes">
          <Grid>
            <Field label="Lymphadenopathy">
              <Pills
                options={[
                  { value: "none", label: "None" },
                  { value: "cervical", label: "Cervical" },
                  { value: "axillary", label: "Axillary" },
                  { value: "inguinal", label: "Inguinal" },
                  { value: "generalized", label: "Generalised" }
                ]}
                value={form.vitals.lymphNodes}
                onSelect={v => set("vitals.lymphNodes", v)}
              />
            </Field>
            <Field label="Details">
              <Inp
                value={form.vitals.lymphNodeSite || ''}
                onChange={v => set("vitals.lymphNodeSite", v)}
                placeholder="Size, tenderness, consistency, fixity"
              />
            </Field>
          </Grid>
          {form.vitals.lymphNodes === 'generalized' && (
            <div style={{ fontSize: 11, color: t.warn, marginTop: 4 }}>
              Generalised lymphadenopathy — consider HIV, TB, syphilis, malignancy (lymphoma/leukaemia).
            </div>
          )}
        </Section>

        {/* -- CONSULTANT SUMMARY -- */}
        <div style={{
          background: t.surface,
          borderRadius: 12,
          padding: 16,
          marginTop: 20,
          border: `1px solid ${t.border}`,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: t.text, marginBottom: 12 }}>
            📋 General Examination Summary
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: t.text }}>
            {firstImpression}
            {!isNaN(rr) && ` Respiratory rate ${rr}/min${rrSeverity ? ' (tachypnoeic for age)' : ' (normal for age)'}.`}
            {!isNaN(spo2) && ` Oxygen saturation ${spo2}%${spo2Severity ? ` (${spo2Severity}).` : '.'}`}
            {muacInterpret && ` MUAC ${muacCm} cm — ${muacInterpret.category}.`}
            {hcInterpret && ` Head circumference — ${hcInterpret}.`}
            {form.vitals.pallorExam && ' Clinical pallor noted.'}
            {form.vitals.cyanosisExam && ' Central cyanosis present — urgent.'}
            {form.vitals.clubbingExam && ' Digital clubbing present — suggests chronic hypoxia.'}
            {form.vitals.edemaExam && ' Peripheral oedema noted.'}
            {form.vitals.lymphNodes !== 'none' && ` Lymphadenopathy: ${form.vitals.lymphNodes}.`}
            {(form.vitals as any).mouthExam === 'thrush' && ' Oral thrush present.'}
            {(form.vitals as any).tonsilAppearance === 'membrane' && ' Tonsillar membrane — DIPHTHERIA MUST BE EXCLUDED.'}
          </div>
        </div>
      </Card>
    </>
  );
}
  function renderExamSystemic() {
  // Derived state for respiratory interpretation
  const respFindings = {
    distressSigns: {
      indrawing: form.vitals.examIndrawing,
      nasalFlaring: form.vitals.examNasalFlaring,
      grunting: form.vitals.examGrunting,
      stridor: form.vitals.examStridor,
      headBobbing: (form.vitals as any).examHeadBobbing,
      trachealDeviation: (form.vitals as any).examTrachealDeviation,
    },
    percussion: {
      dullness: form.vitals.examDullness,
      hyperresonance: form.vitals.examHyperResonance,
      stonyDull: (form.vitals as any).examStonyDull || false, // new field
    },
    auscultation: {
      breathSounds: form.vitals.airEntry || 'good',
      wheeze: form.vitals.examWheeze,
      crackles: form.vitals.examCrackles,
      bronchialBreathing: form.vitals.examBronchial,
      pleuralRub: (form.vitals as any).examPleuralRub || false,
    },
    symmetry: {
      trachea: (form.vitals as any).examTrachea || 'central', // central/deviated_left/deviated_right
      expansion: (form.vitals as any).examChestExpansion || 'symmetrical', // symmetrical/reduced_left/reduced_right
    },
    tactileFremitus: (form.vitals as any).examFremitus || 'normal', // normal/increased/decreased
  };

  // Helper to generate respiratory narrative
  const buildRespiratorySummary = () => {
    const lines: string[] = [];
    // Inspection
    const distressParts: string[] = [];
    if (respFindings.distressSigns.indrawing) distressParts.push('chest indrawing');
    if (respFindings.distressSigns.nasalFlaring) distressParts.push('nasal flaring');
    if (respFindings.distressSigns.grunting) distressParts.push('expiratory grunting');
    if (respFindings.distressSigns.headBobbing) distressParts.push('head bobbing');
    if (respFindings.distressSigns.stridor) distressParts.push('inspiratory stridor');
    const distressText = distressParts.length
      ? `Child was in respiratory distress with ${distressParts.join(', ')}.`
      : 'No signs of respiratory distress.';

    const shape = form.vitals.chestShape || 'normal';
    const shapeText = shape !== 'normal' ? ` Chest shape: ${shape.replace(/_/g, ' ')}.` : '';

    lines.push(`Inspection: ${distressText}${shapeText}`);

    // Palpation
    const tracheaText = `Trachea was ${respFindings.symmetry.trachea}.`;
    const expansionText = `Chest expansion was ${respFindings.symmetry.expansion}.`;
    const fremitusText = `Tactile vocal fremitus was ${respFindings.tactileFremitus}.`;
    lines.push(`Palpation: ${tracheaText} ${expansionText} ${fremitusText}`);

    // Percussion
    let percNote = 'resonant throughout.';
    if (respFindings.percussion.stonyDull) percNote = 'stony dull over the affected area.';
    else if (respFindings.percussion.dullness) percNote = 'dull over the affected area.';
    else if (respFindings.percussion.hyperresonance) percNote = 'hyperresonant over the affected area.';
    lines.push(`Percussion: Percussion note was ${percNote}`);

    // Auscultation
    let auscText = '';
    const bs = respFindings.auscultation.breathSounds;
    if (bs === 'absent') auscText = 'Breath sounds were absent.';
    else if (bs === 'reduced_l') auscText = 'Breath sounds reduced on the left.';
    else if (bs === 'reduced_r') auscText = 'Breath sounds reduced on the right.';
    else if (bs === 'reduced_both') auscText = 'Breath sounds reduced bilaterally.';
    else auscText = 'Vesicular breath sounds heard bilaterally.';

    const added: string[] = [];
    if (respFindings.auscultation.wheeze) added.push('expiratory wheeze');
    if (respFindings.auscultation.crackles) added.push('coarse crackles');
    if (respFindings.auscultation.bronchialBreathing) added.push('bronchial breath sounds');
    if (respFindings.auscultation.pleuralRub) added.push('pleural rub');
    const addedText = added.length ? ` Added sounds: ${added.join(', ')}.` : ' No added sounds.';
    lines.push(`Auscultation: ${auscText}${addedText}`);

    return lines.join('\n');
  };

  // Cardiovascular auto summary
  const buildCvsSummary = () => {
    const hs = form.vitals.examHeartSounds || 'normal';
    const murmur = form.vitals.examMurmur || '';
    const murmurGrade = form.vitals.examMurmurGrade || '';
    const capRefill = parseFloat(form.vitals.capRefill);
    const perfusion = capRefill <= 2 ? 'normal' : 'prolonged';
    let summary = `Heart sounds: ${hs}.`;
    if (hs === 'murmur' && murmur) {
      summary += ` Murmur: ${murmur}${murmurGrade ? ` (grade ${murmurGrade})` : ''}.`;
    } else if (hs === 'gallop') {
      summary += ' S3 gallop rhythm noted.';
    }
    summary += ` Capillary refill time ${capRefill ? capRefill + 's (' + perfusion + ')' : 'not recorded'}.`;
    return summary;
  };

  // Abdominal auto summary
  const buildAbdomenSummary = () => {
    const distension = form.vitals.examAbdDistension ? 'distended' : 'non-distended';
    const hepato = form.vitals.examHepatomegaly ? 'hepatomegaly' : '';
    const spleno = form.vitals.examSplenomegaly ? 'splenomegaly' : '';
    const tenderness = form.vitals.examTenderness || 'none';
    let summary = `Abdomen was ${distension}.`;
    if (hepato || spleno) {
      summary += ` Organomegaly: ${[hepato, spleno].filter(Boolean).join(', ')}.`;
    }
    summary += ` Tenderness: ${tenderness}.`;
    return summary;
  };

  // CNS auto summary
  const buildCnsSummary = () => {
    const conscious = form.vitals.examConsciousLevel || 'alert';
    const tone = form.vitals.examCnsTone || 'normal';
    const fontanelle = form.vitals.examFontanelle || 'flat';
    const neckStiff = form.vitals.examNeckStiffness;
    let summary = `Conscious level: ${conscious}. Tone: ${tone}.`;
    if (fontanelle !== 'flat') summary += ` Fontanelle: ${fontanelle}.`;
    if (neckStiff) summary += ' Neck stiffness present.';
    return summary;
  };

  const systemicSummary = [
    `Respiratory: ${buildRespiratorySummary()}`,
    `Cardiovascular: ${buildCvsSummary()}`,
    `Abdominal: ${buildAbdomenSummary()}`,
    `CNS: ${buildCnsSummary()}`,
    `Skin: ${form.vitals.examSkinRash || 'No rash'}; ${form.vitals.examSkinBruising ? 'bruising present' : 'no bruising'}.`,
  ].join('\n\n');

  return (
    <>
      <AdaptiveGuide phaseIdx={11} />
      <PhaseHeader title="Systemic Examination" sub="IPPA-based respiratory, cardiovascular, abdominal, CNS, and skin exams." />
      <Card>
        {/* -- RESPIRATORY SYSTEM (IPPA) -- */}
        <Section title="Respiratory Examination">
          {/* INSPECTION */}
          <SubSection title="Inspection">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <BoolPill label="Chest indrawing" value={form.vitals.examIndrawing} onToggle={v => set("vitals.examIndrawing", v)} warn />
              <BoolPill label="Nasal flaring" value={form.vitals.examNasalFlaring} onToggle={v => set("vitals.examNasalFlaring", v)} warn />
              <BoolPill label="Expiratory grunting" value={form.vitals.examGrunting} onToggle={v => set("vitals.examGrunting", v)} warn />
              <BoolPill label="Head bobbing" value={(form.vitals as any).examHeadBobbing} onToggle={v => set("vitals.examHeadBobbing", v)} warn />
              <BoolPill label="Inspiratory stridor" value={form.vitals.examStridor} onToggle={v => set("vitals.examStridor", v)} warn />
              <BoolPill label="Tracheal deviation" value={(form.vitals as any).examTrachealDeviation} onToggle={v => set("vitals.examTrachealDeviation", v)} warn />
            </div>
            <Grid>
              <Field label="Chest Shape">
                <Sel value={form.vitals.chestShape || ""} onChange={v => set("vitals.chestShape", v)}
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "barrel", label: "Barrel-shaped (hyperinflation)" },
                    { value: "pectus_carinatum", label: "Pectus carinatum" },
                    { value: "pectus_excavatum", label: "Pectus excavatum" },
                    { value: "harrison_sulcus", label: "Harrison sulcus (rickets)" }
                  ]} />
              </Field>
            </Grid>
          </SubSection>

          {/* PALPATION */}
          <SubSection title="Palpation">
            <Grid>
              <Field label="Trachea">
                <Pills
                  options={[
                    { value: "central", label: "Central" },
                    { value: "deviated_left", label: "Deviated left" },
                    { value: "deviated_right", label: "Deviated right" },
                  ]}
                  value={respFindings.symmetry.trachea}
                  onSelect={v => set("vitals.examTrachea", v)}
                />
              </Field>
              <Field label="Chest Expansion">
                <Pills
                  options={[
                    { value: "symmetrical", label: "Symmetrical" },
                    { value: "reduced_left", label: "Reduced left" },
                    { value: "reduced_right", label: "Reduced right" },
                  ]}
                  value={respFindings.symmetry.expansion}
                  onSelect={v => set("vitals.examChestExpansion", v)}
                />
              </Field>
            </Grid>
            <Field label="Tactile Vocal Fremitus">
              <Pills
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "increased", label: "Increased" },
                  { value: "decreased", label: "Decreased" },
                ]}
                value={respFindings.tactileFremitus}
                onSelect={v => set("vitals.examFremitus", v)}
              />
            </Field>
          </SubSection>

          {/* PERCUSSION */}
          <SubSection title="Percussion">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <BoolPill label="Dullness" value={form.vitals.examDullness} onToggle={v => set("vitals.examDullness", v)} />
              <BoolPill label="Stony dull" value={respFindings.percussion.stonyDull} onToggle={v => set("vitals.examStonyDull", v)} />
              <BoolPill label="Hyperresonance" value={form.vitals.examHyperResonance} onToggle={v => set("vitals.examHyperResonance", v)} />
            </div>
          </SubSection>

          {/* AUSCULTATION */}
          <SubSection title="Auscultation">
            <Grid>
              <Field label="Breath Sounds">
                <Sel value={form.vitals.airEntry || ""} onChange={v => set("vitals.airEntry", v)}
                  options={[
                    { value: "good", label: "Vesicular, bilateral" },
                    { value: "reduced_l", label: "Reduced — left" },
                    { value: "reduced_r", label: "Reduced — right" },
                    { value: "reduced_both", label: "Reduced bilateral" },
                    { value: "absent", label: "Absent / Silent chest" }
                  ]} />
              </Field>
            </Grid>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              <BoolPill label="Wheeze" value={form.vitals.examWheeze} onToggle={v => set("vitals.examWheeze", v)} />
              <BoolPill label="Crackles / crepitations" value={form.vitals.examCrackles} onToggle={v => set("vitals.examCrackles", v)} />
              <BoolPill label="Bronchial breathing" value={form.vitals.examBronchial} onToggle={v => set("vitals.examBronchial", v)} />
              <BoolPill label="Pleural rub" value={(form.vitals as any).examPleuralRub} onToggle={v => set("vitals.examPleuralRub", v)} />
              <BoolPill label="Inspiratory stridor" value={form.vitals.examStridor} onToggle={v => set("vitals.examStridor", v)} warn />
            </div>
          </SubSection>

          {/* Auto respiratory summary */}
          <div style={{ marginTop: 12, padding: 12, background: t.surfaceAlt, borderRadius: 8, fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Respiratory Impression</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{buildRespiratorySummary()}</div>
          </div>
        </Section>

        {/* -- CARDIOVASCULAR -- */}
        <Section title="Cardiovascular Examination">
          <Grid>
            <Field label="Heart Sounds">
              <Sel value={form.vitals.examHeartSounds} onChange={v => set("vitals.examHeartSounds", v)}
                options={[
                  { value: "normal", label: "Normal S1 + S2" },
                  { value: "murmur", label: "Murmur present" },
                  { value: "gallop", label: "S3 gallop rhythm" },
                  { value: "faint", label: "Faint / Distant sounds" }
                ]} />
            </Field>
            <Field label="Murmur Details">
              <Inp value={form.vitals.examMurmur || ""} onChange={v => set("vitals.examMurmur", v)} placeholder="e.g. Pansystolic, LLSE" />
            </Field>
            <Field label="Murmur Grade (1-6)">
              <Inp type="number" min={1} max={6} value={form.vitals.examMurmurGrade || ""} onChange={v => set("vitals.examMurmurGrade", v)} />
            </Field>
            <Field label="Capillary Refill (s)">
              <Inp type="number" step="0.5" value={form.vitals.capRefill || ""} onChange={v => set("vitals.capRefill", v)} />
            </Field>
          </Grid>
          <div style={{ marginTop: 8, padding: 8, background: t.surfaceAlt, borderRadius: 6, fontSize: 12 }}>
            {buildCvsSummary()}
          </div>
        </Section>

        {/* -- ABDOMINAL -- */}
        <Section title="Abdominal Examination">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            <BoolPill label="Distension" value={form.vitals.examAbdDistension} onToggle={v => set("vitals.examAbdDistension", v)} />
            <BoolPill label="Hepatomegaly" value={form.vitals.examHepatomegaly} onToggle={v => set("vitals.examHepatomegaly", v)} />
            <BoolPill label="Splenomegaly" value={form.vitals.examSplenomegaly} onToggle={v => set("vitals.examSplenomegaly", v)} />
          </div>
          <Field label="Tenderness">
            <Sel value={form.vitals.examTenderness || ""} onChange={v => set("vitals.examTenderness", v)}
              options={[
                { value: "none", label: "None" },
                { value: "mild", label: "Mild" },
                { value: "moderate", label: "Moderate" },
                { value: "severe", label: "Severe with guarding" },
                { value: "rebound", label: "Rebound tenderness" }
              ]} />
          </Field>
          <div style={{ marginTop: 8, padding: 8, background: t.surfaceAlt, borderRadius: 6, fontSize: 12 }}>
            {buildAbdomenSummary()}
          </div>
        </Section>

        {/* -- CNS -- */}
        <Section title="CNS Examination">
          <Grid>
            <Field label="Conscious Level">
              <Sel value={form.vitals.examConsciousLevel || ""} onChange={v => set("vitals.examConsciousLevel", v)}
                options={[
                  { value: "alert", label: "Alert" },
                  { value: "drowsy", label: "Drowsy" },
                  { value: "confused", label: "Confused" },
                  { value: "comatose", label: "Comatose" }
                ]} />
            </Field>
            <Field label="Tone">
              <Sel value={form.vitals.examCnsTone || ""} onChange={v => set("vitals.examCnsTone", v)}
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "hypertonia", label: "Hypertonia / Spastic" },
                  { value: "hypotonia", label: "Hypotonia / Floppy" }
                ]} />
            </Field>
            <Field label="Fontanelle">
              <Sel value={form.vitals.examFontanelle || ""} onChange={v => set("vitals.examFontanelle", v)}
                options={[
                  { value: "flat", label: "Flat / Closed (normal)" },
                  { value: "bulging", label: "Bulging (raised ICP)" },
                  { value: "sunken", label: "Sunken (dehydration)" }
                ]} />
            </Field>
          </Grid>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <BoolPill label="Neck stiffness" value={form.vitals.examNeckStiffness} onToggle={v => set("vitals.examNeckStiffness", v)} warn />
            <BoolPill label="Petechiae / purpura" value={form.vitals.examSkinPetechiae} onToggle={v => set("vitals.examSkinPetechiae", v)} warn />
            <BoolPill label="Muscle wasting" value={form.vitals.examMuscleWasting} onToggle={v => set("vitals.examMuscleWasting", v)} />
          </div>
          {form.vitals.examSkinPetechiae && (
            <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: t.dangerBg, color: t.danger, fontSize: 12, fontWeight: 600 }}>
              ? Petechiae + fever ? meningococcal sepsis must be urgently excluded.
            </div>
          )}
          <div style={{ marginTop: 8, padding: 8, background: t.surfaceAlt, borderRadius: 6, fontSize: 12 }}>
            {buildCnsSummary()}
          </div>
        </Section>

        {/* -- SKIN -- */}
        <Section title="Skin & Extremities">
          <Field label="Rash (type, distribution)" full>
            <Inp value={form.vitals.examSkinRash || ""} onChange={v => set("vitals.examSkinRash", v)} placeholder="e.g. Maculopapular, blanching" />
          </Field>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <BoolPill label="Bruising" value={form.vitals.examSkinBruising} onToggle={v => set("vitals.examSkinBruising", v)} />
            <BoolPill label="Clubbing" value={form.vitals.clubbingExam} onToggle={v => set("vitals.clubbingExam", v)} />
            <BoolPill label="Cyanosis" value={form.vitals.cyanosisExam} onToggle={v => set("vitals.cyanosisExam", v)} warn />
          </div>
        </Section>

        {/* -- SYSTEMIC SUMMARY -- */}
        <div style={{
          marginTop: 24, padding: 16,
          background: t.surface,
          borderRadius: 12,
          border: `1px solid ${t.border}`
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: t.text }}>
            📋 Systemic Examination Summary
          </div>
          <pre style={{
            whiteSpace: 'pre-wrap',
            fontFamily: t.font,
            fontSize: 12,
            lineHeight: 1.7,
            color: t.text,
            margin: 0,
            background: 'transparent',
          }}>
            {systemicSummary}
          </pre>
        </div>
      </Card>
    </>
  );
}

// Simple SubSection component for IPPA blocks
const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 6 }}>{title}</div>
    {children}
  </div>
);
interface DiagnosticReasoning {
  diagnosisId: string;
  diagnosisName: string;
  probability: number;
  category: 'primary' | 'differential' | 'rule_out';
  supportingHistory: string[];
  supportingExam: string[];
  againstHistory: string[];
  againstExam: string[];
  severityIndicators: string[];
  redFlags: string[];
  missingCriticalData: string[];
  confidence: 'high' | 'moderate' | 'low';
  temporalNotes?: string[];
  syndromePatterns?: string[];
  againstReasoning?: string[];
}

function buildDiagnosticReasoning(
  form: PatientForm,
  differentials: ScoredDisease[],
  clinicalContext: BiodataContext,
  severity: SeverityInfo | null
): DiagnosticReasoning[] {
  const ageMonths = clinicalContext.ageMonths;

  // ── Syndrome scoring ──────────────────────────────────────────────
  const rr = parseFloat(form.vitals.rr);
  const spo2 = parseFloat(form.vitals.spo2);
  const temp = parseFloat(form.vitals.temp);

  const syndromeScores: Record<string, number> = {
    respiratoryDistress: 0,
    lowerRespiratory: 0,
    upperAirway: 0,
    infectious: 0,
    airLeak: 0,
    cardiac: 0,
  };

  if (form.hpi.chestIndrawing || form.vitals.examIndrawing) syndromeScores.respiratoryDistress += 0.25;
  if (form.vitals.examGrunting) syndromeScores.respiratoryDistress += 0.2;
  if (form.vitals.examNasalFlaring || form.hpi.nasalFlaring) syndromeScores.respiratoryDistress += 0.15;
  if (form.hpi.headBobbing) syndromeScores.respiratoryDistress += 0.1;
  if (form.hpi.feedingDiff) syndromeScores.respiratoryDistress += 0.1;
  if (!isNaN(rr) && rr > clinicalContext.ageBand.rrMax * 1.2) syndromeScores.respiratoryDistress += 0.15;
  if (!isNaN(spo2) && spo2 < 92) syndromeScores.respiratoryDistress += 0.15;
  if (!isNaN(spo2) && spo2 < 90) syndromeScores.respiratoryDistress += 0.1;

  if (form.hpi.coughChar) syndromeScores.lowerRespiratory += 0.2;
  if (form.vitals.examWheeze) syndromeScores.lowerRespiratory += 0.2;
  if (form.vitals.examCrackles) syndromeScores.lowerRespiratory += 0.2;
  if (form.vitals.examReducedBS) syndromeScores.lowerRespiratory += 0.15;
  if (form.vitals.examBronchial) syndromeScores.lowerRespiratory += 0.15;

  if (form.vitals.examStridor || form.hpi.stridor) syndromeScores.upperAirway += 0.3;
  if (form.hpi.coughChar === 'barking') syndromeScores.upperAirway += 0.25;
  if (form.hpi.drooling) syndromeScores.upperAirway += 0.2;
  if (form.hpi.tripodPosition) syndromeScores.upperAirway += 0.15;
  if (form.hpi.hoarseness) syndromeScores.upperAirway += 0.1;

  if (form.hpi.feverPattern || !isNaN(temp)) syndromeScores.infectious += 0.2;
  if (form.hpi.highFever || (!isNaN(temp) && temp > 39)) syndromeScores.infectious += 0.2;
  if (form.hpi.sickContact) syndromeScores.infectious += 0.15;
  if (form.hpi.feverDuration === '>3_days' || (form.hpi.feverDuration && parseInt(form.hpi.feverDuration) >= 3)) syndromeScores.infectious += 0.15;
  if (form.hpi.recentURTI) syndromeScores.infectious += 0.1;

  if (form.hpi.suddenOnset) syndromeScores.airLeak += 0.25;
  if (form.vitals.examHyperResonance) syndromeScores.airLeak += 0.25;
  if (form.vitals.examTrachealDeviation) syndromeScores.airLeak += 0.2;
  if (form.vitals.examReducedBS) syndromeScores.airLeak += 0.15;

  if (form.hpi.sweatingFeeds) syndromeScores.cardiac += 0.25;
  if (form.hpi.orthopnea) syndromeScores.cardiac += 0.2;
  if (form.hpi.pnd) syndromeScores.cardiac += 0.15;
  if (form.vitals.examHepatomegaly || form.hpi.hepatomegalyReported) syndromeScores.cardiac += 0.15;
  if (form.vitals.edemaExam) syndromeScores.cardiac += 0.1;
  if (form.hpi.heartburnRegurg) syndromeScores.cardiac += 0.05;

  const syndromePatterns: string[] = [];
  if (syndromeScores.respiratoryDistress >= 0.4) syndromePatterns.push('Respiratory distress physiology');
  if (syndromeScores.lowerRespiratory >= 0.4) syndromePatterns.push('Lower respiratory tract involvement');
  if (syndromeScores.upperAirway >= 0.4) syndromePatterns.push('Upper airway involvement');
  if (syndromeScores.infectious >= 0.4) syndromePatterns.push('Infectious process');
  if (syndromeScores.airLeak >= 0.4) syndromePatterns.push('Air leak syndrome (pneumothorax/pneumomediastinum)');
  if (syndromeScores.cardiac >= 0.3) syndromePatterns.push('Cardiac contribution suspected');

  // ── Temporal reasoning ───────────────────────────────────────────
  const onsetType = form.hpi.onsetType || '';
  const progression = form.hpi.progression || '';
  const coughDuration = form.hpi.coughDuration || '';

  const temporalNotes: string[] = [];
  if (onsetType === 'sudden') {
    temporalNotes.push('Sudden onset suggests acute event (foreign body, pneumothorax, anaphylaxis, asthma)');
  } else if (onsetType === 'acute') {
    temporalNotes.push('Acute onset over hours-days consistent with infection or acute wheeze');
  } else if (onsetType === 'gradual') {
    temporalNotes.push('Gradual onset over weeks may suggest TB, malignancy, or chronic condition');
  }
  if (coughDuration === 'acute' || coughDuration === '<2_weeks') {
    temporalNotes.push('Acute cough duration favours infection over chronic respiratory disease');
  } else if (coughDuration === 'chronic' || coughDuration === '>4_weeks') {
    temporalNotes.push('Chronic cough raises suspicion for TB, asthma, foreign body, or pertussis');
  } else if (coughDuration === '2-4_weeks') {
    temporalNotes.push('Subacute cough — consider protracted bacterial bronchitis or pertussis');
  }
  if (progression === 'worsening') {
    temporalNotes.push('Progressive deterioration suggests evolving pneumonia or airway obstruction');
  } else if (progression === 'improving') {
    temporalNotes.push('Improving trajectory reassuring — consider resolving viral illness');
  }

  const reasoning: DiagnosticReasoning[] = [];

  // Process top differentials (up to 5)
  const topDiffs = differentials.slice(0, 5);

  // Identify primary diagnosis for comparative reasoning
  const primaryScored = topDiffs.find(d => (d as any).relation === 'primary');
  const primaryId = primaryScored?.disease.id;

  for (const scored of topDiffs) {
    const disease = scored.disease;
    const evidence = scored.evidence;

    // Supporting history/exam from evidence hits
    const supportingHistory = evidence.historyHits.map(hit => {
      const sym = ALL_SYMPTOMS.find(s => s.id === hit);
      return sym ? sym.label : hit.replace(/_/g, ' ');
    });

    const supportingExam = evidence.examHits.map(hit => {
      return hit.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    });

    // Against features: high-weight features that are missing
    const againstHistory: string[] = [];
    const againstExam: string[] = [];

    for (const feat of disease.historyFeatures || []) {
      if ((feat.weight || 0) >= 4 && !symptomMap[feat.symptomId]?.(form, clinicalContext as any)) {
        const label = ALL_SYMPTOMS.find(s => s.id === feat.symptomId)?.label || feat.symptomId;
        againstHistory.push(`No ${label.toLowerCase()}`);
      }
    }

    for (const feat of disease.examFeatures || []) {
      if ((feat.baseWeight || 0) >= 4 && !signMap[feat.signId]?.(form)) {
        againstExam.push(`No ${feat.signId.replace(/_/g, ' ')}`);
      }
    }

    if (disease.exclusionClues) {
      for (const clue of disease.exclusionClues) {
        const lower = clue.toLowerCase();
        if (lower.includes('barking cough') && form.hpi.coughChar === 'barking') {
          againstHistory.push('Barking cough present (excludes epiglottitis)');
        }
        if (lower.includes('drooling') && lower.includes('toxic') && (form.hpi.drooling || form.vitals.generalCondition === 'toxic')) {
          againstHistory.push('Drooling/toxic appearance present');
        }
      }
    }

    // ── Enhanced "against" reasoning ────────────────────────────────
    const againstReasoning: string[] = [];
    if (scored.disease.id !== primaryId && primaryScored) {
      const primaryDisease = primaryScored.disease;
      if (syndromePatterns.includes('Upper airway involvement') && (disease as any).syndromeTags?.some((t: string) => ['lower_respiratory', 'lower_airway'].includes(t))) {
        againstReasoning.push('Primary syndrome pattern favours upper airway over lower respiratory');
      }
      if (syndromePatterns.includes('Lower respiratory tract involvement') && (disease as any).syndromeTags?.some((t: string) => ['upper_airway', 'croup', 'epiglottitis'].includes(t))) {
        againstReasoning.push('Lower respiratory pattern dominant; upper airway process less likely');
      }
      if (!syndromePatterns.includes('Infectious process') && (disease as any).syndromeTags?.some((t: string) => t === 'infectious')) {
        againstReasoning.push('No infectious syndrome detected — infectious aetiology less likely');
      }
      if (syndromePatterns.includes('Air leak syndrome (pneumothorax/pneumomediastinum)') && !(disease as any).syndromeTags?.some((t: string) => t === 'air_leak')) {
        againstReasoning.push('Air leak physiology present but this diagnosis does not typically cause pneumothorax');
      }
      if (temporalNotes.length > 0 && (disease as any).syndromeTags?.length) {
        const note0 = temporalNotes[0].toLowerCase();
        if (note0.includes('sudden') && !(disease as any).syndromeTags?.some((t: string) => ['acute', 'infectious'].includes(t))) {
          againstReasoning.push('Sudden onset not typical for this diagnosis');
        }
      }
    }

    // Severity indicators
    const severityIndicators: string[] = [];
    const redFlags: string[] = [];

    if (disease.mustNotMiss) {
      redFlags.push('Must‑not‑miss diagnosis');
    }

    if (form.hpi.chestIndrawing || form.vitals.examIndrawing) {
      severityIndicators.push('Chest indrawing');
      redFlags.push('Chest indrawing');
    }
    if (form.vitals.cyanosisExam || form.hpi.cyanoticEpisodes) {
      severityIndicators.push('Cyanosis');
      redFlags.push('Cyanosis');
    }
    const spo2 = parseFloat(form.vitals.spo2);
    if (!isNaN(spo2) && spo2 < 92) {
      severityIndicators.push(`Hypoxia (SpO₂ ${spo2}%)`);
      redFlags.push('Hypoxia');
    }
    if (form.vitals.examGrunting) {
      severityIndicators.push('Grunting');
      redFlags.push('Grunting (impending respiratory failure)');
    }
    if (form.vitals.examStridor) {
      severityIndicators.push('Stridor');
      redFlags.push('Upper airway obstruction');
    }
    if (form.hpi.feedingDiff) {
      severityIndicators.push('Feeding difficulty');
      redFlags.push('WHO danger sign – unable to feed');
    }
    if (form.hpi.seizureHPI || form.ros.seizures) {
      redFlags.push('Seizures');
    }
    if (form.ros.lethargyRos) {
      redFlags.push('Lethargy');
    }
    if (form.vitals.avpu !== 'alert' && form.vitals.avpu !== '') {
      redFlags.push(`Altered consciousness (AVPU: ${form.vitals.avpu})`);
    }

    // Missing critical data
    const missing: string[] = [];
    if (disease.diagnosticClues) {
      for (const clue of disease.diagnosticClues) {
        const lower = clue.toLowerCase();
        if (lower.includes('barking cough') && form.hpi.coughChar !== 'barking') {
          missing.push('Barking cough?');
        }
        if (lower.includes('drooling') && !form.hpi.drooling) {
          missing.push('Drooling?');
        }
        if (lower.includes('toxic') && form.vitals.generalCondition !== 'toxic' && form.vitals.generalCondition !== 'very_sick') {
          missing.push('Toxic appearance?');
        }
        if (lower.includes('hyperresonance') && !form.vitals.examHyperResonance) {
          missing.push('Hyperresonance?');
        }
        if (lower.includes('absent breath sounds') && !form.vitals.examReducedBS) {
          missing.push('Absent breath sounds?');
        }
        if (lower.includes('choking') && !form.hpi.suddenOnset) {
          missing.push('Choking episode?');
        }
      }
    }

    // Confidence
    const totalExpected = (disease.historyFeatures?.length || 0) + (disease.examFeatures?.length || 0);
    const totalPresent = evidence.historyHits.length + evidence.examHits.length;
    const coverage = totalExpected > 0 ? totalPresent / totalExpected : 0;
    let confidence: 'high' | 'moderate' | 'low' = 'low';
    if (coverage >= 0.6 && scored.probability >= 0.7) confidence = 'high';
    else if (coverage >= 0.4 && scored.probability >= 0.4) confidence = 'moderate';

    reasoning.push({
      diagnosisId: disease.id,
      diagnosisName: disease.name,
      probability: scored.probability,
      category: (scored as any).relation || 'differential',
      supportingHistory,
      supportingExam,
      againstHistory,
      againstExam,
      againstReasoning: againstReasoning.length > 0 ? againstReasoning : undefined,
      severityIndicators,
      redFlags,
      missingCriticalData: missing,
      confidence,
      temporalNotes: temporalNotes.length > 0 ? temporalNotes : undefined,
      syndromePatterns: syndromePatterns.length > 0 ? syndromePatterns : undefined,
    });
  }

  return reasoning;
}

// ── RENDER IMPRESSION FUNCTION ──────────────────────────────────────────────

function renderImpression() {
  const t = useT();
  const form = usePatientStore(s => s.form);
  const clinicalContext = useBiodataContext(form);
  const differentials = useMemo(() => runInference(form), [form]);
  const severity = useMemo(() => getSeverity(form), [form]);

  const reasoning = useMemo(
    () => buildDiagnosticReasoning(form, differentials, clinicalContext, severity),
    [form, differentials, clinicalContext, severity]
  );

  const primary = reasoning.find(r => r.category === 'primary') || reasoning[0];
  const differentialsList = reasoning.filter(r => r.diagnosisId !== primary?.diagnosisId);

  // Override state (for clinician editing)
  const [editMode, setEditMode] = useState(false);
  const [overrideDiagnoses, setOverrideDiagnoses] = useState<string[]>([]);
  const [customDiagnosis, setCustomDiagnosis] = useState('');

  const handleRemove = (id: string) => {
    setOverrideDiagnoses(prev => [...prev, id]);
  };

  const visibleReasoning = reasoning.filter(r => !overrideDiagnoses.includes(r.diagnosisId));

  const diagnosticSummary = useMemo(() => {
    if (visibleReasoning.length === 0) return '';
    const top = visibleReasoning[0];
    const syndromeText = top.syndromePatterns?.length
      ? ` Syndrome scores: ${top.syndromePatterns.join(', ')}.`
      : '';
    return `Clinical pattern ${top.confidence === 'high' ? 'strongly' : top.confidence === 'moderate' ? 'moderately' : 'weakly'} supports ${top.diagnosisName}.${syndromeText}`;
  }, [visibleReasoning]);

  const consultantSummary = useMemo(() => {
    if (visibleReasoning.length === 0) return '';
    const top = visibleReasoning[0];
    const age = formatAge(form.biodata.ageMonths);
    const sex = form.biodata.sex || 'child';

    // Complaint string
    const complaintStr = form.complaints.length > 0
      ? form.complaints.map(c => c.replace(/_/g, ' ')).join(', ')
      : 'respiratory symptoms';

    // History summary
    const histStr = top.supportingHistory.length > 0
      ? ` History is notable for ${top.supportingHistory.join(', ')}.`
      : '';

    // Exam summary
    const examStr = top.supportingExam.length > 0
      ? ` Examination demonstrates ${top.supportingExam.join(', ')}.`
      : '';

    // Primary diagnosis with confidence
    let primaryStr = ` The overall clinicopathological picture is most consistent with ${top.diagnosisName}`;
    if (top.confidence === 'high') primaryStr += ' with high confidence';
    else if (top.confidence === 'moderate') primaryStr += ' with moderate confidence';
    else primaryStr += ', though some uncertainty remains';

    // Red flags / critical features
    const criticalStr = top.redFlags.length > 0
      ? `. Critical features include ${top.redFlags.join(', ')}.`
      : '.';

    // Differentials with reasoning
    let diffStr = '';
    if (differentialsList.length > 0) {
      diffStr = ` Differentials considered include ${differentialsList.map(d =>
        `${d.diagnosisName} (${d.confidence})`
      ).join(', ')}.`;
      const lessLikely = differentialsList.filter(d =>
        d.againstHistory.length > 0 || d.againstExam.length > 0 || (d.againstReasoning && d.againstReasoning.length > 0)
      );
      if (lessLikely.length > 0) {
        diffStr += ' These are less favoured because';
        const reasons = lessLikely.flatMap(d => [
          ...d.againstReasoning || [],
          ...d.againstHistory.map(h => h.toLowerCase().startsWith('no') ? h : `no ${h.toLowerCase()}`),
          ...d.againstExam,
        ]);
        diffStr += ' ' + reasons.join('; ') + '.';
      }
    }

    // Missing data
    const missingStr = top.missingCriticalData.length > 0
      ? ` Further history or examination is required to clarify ${top.missingCriticalData.join(', ')}.`
      : '';

    return `This is ${age} ${sex} presenting with ${complaintStr}.${histStr}${examStr}${primaryStr}${criticalStr}${diffStr}${missingStr} No laboratories or imaging have been performed at this stage.`;
  }, [visibleReasoning, form, differentialsList]);

  // ── Timeline data ────────────────────────────────────────────────
  const symptomOrder = (form as any).hpi?.symptomOrder as string[] | undefined;
  const timelineItems = useMemo(() => {
    const items: { day: string; symptoms: string[] }[] = [];
    if (symptomOrder && symptomOrder.length > 0) {
      const grouped: Record<string, string[]> = {};
      symptomOrder.forEach((symId: string) => {
        const label = ALL_SYMPTOMS.find(s => s.id === symId)?.label || symId.replace(/_/g, ' ');
        const dur = (form as any).complaintDurations?.[symId];
        const day = dur || 'ongoing';
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(label);
      });
      Object.entries(grouped).forEach(([day, symptoms]) => {
        items.push({ day, symptoms });
      });
    } else if (form.complaints.length > 0) {
      items.push({ day: 'presentation', symptoms: form.complaints.map(c => c.replace(/_/g, ' ')) });
    }
    return items.sort((a, b) => {
      if (a.day === 'presentation') return 1;
      if (b.day === 'presentation') return -1;
      return 0;
    });
  }, [form, symptomOrder]);

  const [reasoningTimelineOpen, setReasoningTimelineOpen] = useState(false);

  return (
    <>
      <PhaseHeader title="Impression & Differential Diagnosis" sub="Consultant‑level clinical reasoning based on all collected data." />
      <Card>
        {/* Diagnostic Intelligence Summary */}
        {primary && diagnosticSummary && (
          <div style={{
            background: 'linear-gradient(135deg, #1a2340, #2a1a40)',
            borderRadius: 10,
            padding: 14,
            marginBottom: 20,
            border: '1px solid #4a3a6a',
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#b8a0e0', marginBottom: 4 }}>
              🧠 Diagnostic Intelligence Summary
            </div>
            <div style={{ fontSize: 12, color: '#d0c0f0', lineHeight: 1.5 }}>
              {diagnosticSummary}
            </div>
          </div>
        )}

        {/* Timeline visualization */}
        {timelineItems.length > 0 && (
          <div style={{
            marginBottom: 20,
            padding: 12,
            background: t.surfaceAlt,
            borderRadius: 10,
            border: `1px solid ${t.border}`,
          }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: t.text, marginBottom: 8 }}>📅 Symptom Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {timelineItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: t.textMuted, minWidth: 80,
                    background: t.surface, padding: '2px 6px', borderRadius: 4, textAlign: 'center',
                  }}>
                    {item.day === 'presentation' ? 'Onset' : `Day ${item.day}`}
                  </span>
                  <span style={{ fontSize: 12, color: t.text }}>
                    {item.symptoms.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Severity alert banner */}
        {severity && severity.level !== 'MILD' && (
          <div style={{
            background: severity.level === 'CRITICAL' ? t.dangerBg : severity.level === 'SEVERE' ? t.warnBg : t.surfaceAlt,
            borderRadius: 10,
            padding: 14,
            marginBottom: 20,
            border: `1px solid ${severity.level === 'CRITICAL' ? t.danger : severity.level === 'SEVERE' ? t.warn : t.border}`,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: severity.level === 'CRITICAL' ? t.danger : t.warn }}>
              {severity.level === 'CRITICAL' ? '🚨 Critical' : '⚠️ Severe'} Clinical Status
            </div>
            <div style={{ fontSize: 13, marginTop: 4, color: t.text }}>{severity.msg}</div>
          </div>
        )}

        {/* Editable toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <BoolPill label="Edit differential" value={editMode} onToggle={setEditMode} />
        </div>

        {/* Primary Impression */}
        {primary && (
          <DiagnosisCard
            reasoning={primary}
            isPrimary
            onRemove={editMode ? () => handleRemove(primary.diagnosisId) : undefined}
          />
        )}

        {/* Differentials */}
        {differentialsList.length > 0 && (
          <Section title="Other Differentials">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {differentialsList.map(d => (
                <DiagnosisCard
                  key={d.diagnosisId}
                  reasoning={d}
                  isPrimary={false}
                  onRemove={editMode ? () => handleRemove(d.diagnosisId) : undefined}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Custom diagnosis adder (edit mode) */}
        {editMode && (
          <div style={{ marginTop: 16 }}>
            <Field label="Add custom diagnosis" full>
              <div style={{ display: 'flex', gap: 8 }}>
                <Inp value={customDiagnosis} onChange={setCustomDiagnosis} placeholder="e.g. Malaria, Bronchiolitis, etc." />
                <button
                  onClick={() => {
                    if (customDiagnosis.trim()) {
                      setCustomDiagnosis('');
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: t.accent,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Add
                </button>
              </div>
            </Field>
          </div>
        )}

        {/* Red Flags summary */}
        {primary?.redFlags.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: t.danger, marginBottom: 6 }}>🚨 Red Flags</div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 12, color: t.danger }}>
              {primary.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
            </ul>
          </div>
        )}

        {/* Missing critical data */}
        {primary?.missingCriticalData.length > 0 && (
          <div style={{ marginTop: 16, padding: 12, background: t.warnBg, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: t.warn }}>🔍 Missing Critical Information</div>
            <ul style={{ margin: '4px 0 0', padding: '0 0 0 18px', fontSize: 12, color: t.text }}>
              {primary.missingCriticalData.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}

        {/* Reasoning Timeline (collapsible) */}
        {visibleReasoning.length > 0 && (
          <details
            open={reasoningTimelineOpen}
            onToggle={(e) => setReasoningTimelineOpen((e.target as HTMLDetailsElement).open)}
            style={{ marginTop: 20 }}
          >
            <summary style={{
              fontWeight: 700, fontSize: 13, color: t.text, cursor: 'pointer',
              padding: '8px 12px', background: t.surfaceAlt, borderRadius: 8,
              border: `1px solid ${t.border}`,
            }}>
              🔬 Reasoning Timeline — Why These Diagnoses?
            </summary>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visibleReasoning.map((r, i) => (
                <div key={r.diagnosisId} style={{
                  background: t.surfaceAlt, borderRadius: 8, padding: 12,
                  border: `1px solid ${t.border}`,
                }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: t.text, marginBottom: 4 }}>
                    {i + 1}. {r.diagnosisName}
                    <span style={{ fontWeight: 400, color: t.textMuted, marginLeft: 8 }}>
                      ({r.confidence}, {Math.round(r.probability * 100)}% probability)
                    </span>
                  </div>
                  {r.temporalNotes && r.temporalNotes.length > 0 && (
                    <div style={{ fontSize: 11, color: t.textSub, marginBottom: 4 }}>
                      ⏱ {r.temporalNotes.join('; ')}
                    </div>
                  )}
                  {r.syndromePatterns && r.syndromePatterns.length > 0 && (
                    <div style={{ fontSize: 11, color: t.textSub, marginBottom: 4 }}>
                      📊 Syndrome: {r.syndromePatterns.join(', ')}
                    </div>
                  )}
                  {r.againstReasoning && r.againstReasoning.length > 0 && (
                    <div style={{ fontSize: 11, color: t.danger, marginBottom: 4 }}>
                      ✗ {r.againstReasoning.join('; ')}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: t.textMuted }}>
                    Features matched: {r.supportingHistory.length + r.supportingExam.length} / {r.againstHistory.length + r.againstExam.length + r.supportingHistory.length + r.supportingExam.length || '?'}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Consultant Summary */}
        <div style={{
          marginTop: 24,
          padding: 16,
          background: t.surface,
          borderRadius: 12,
          border: `1px solid ${t.border}`,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: t.text }}>
            📋 Consultant Impression (Generated)
          </div>
          <pre style={{
            whiteSpace: 'pre-wrap',
            fontFamily: t.font,
            fontSize: 12,
            lineHeight: 1.7,
            color: t.text,
            margin: 0,
            background: 'transparent',
          }}>
            {consultantSummary}
          </pre>
        </div>
      </Card>
    </>
  );
}

// ── DiagnosisCard Component ──────────────────────────────────────────────────

const DiagnosisCard = ({
  reasoning,
  isPrimary,
  onRemove,
}: {
  reasoning: DiagnosticReasoning;
  isPrimary: boolean;
  onRemove?: () => void;
}) => {
  const [expanded, setExpanded] = useState(isPrimary);

  const severityColor = (indicator: string): string => {
    const lower = indicator.toLowerCase();
    if (lower.includes('cyanosis') || lower.includes('hypoxia') || lower.includes('grunting')) return '#dc3545';
    if (lower.includes('stridor') || lower.includes('indrawing') || lower.includes('obstruction')) return '#fd7e14';
    if (lower.includes('feeding')) return '#ffc107';
    return t.warn;
  };

  const severityBg = (indicator: string): string => {
    const lower = indicator.toLowerCase();
    if (lower.includes('cyanosis') || lower.includes('hypoxia') || lower.includes('grunting')) return '#fce4e4';
    if (lower.includes('stridor') || lower.includes('indrawing') || lower.includes('obstruction')) return '#fff3e0';
    if (lower.includes('feeding')) return '#fff8e1';
    return t.warnBg;
  };

  const pct = Math.round(reasoning.probability * 100);
  const barColor = pct >= 70 ? t.success : pct >= 40 ? t.warn : t.danger;

  return (
    <div style={{
      background: isPrimary ? t.accentBg : t.surfaceAlt,
      borderRadius: 10,
      padding: 16,
      border: `1px solid ${isPrimary ? t.accent : t.border}`,
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>
            {reasoning.diagnosisName}
          </div>
          {isPrimary && <span style={{ fontSize: 11, background: t.accent, color: 'white', padding: '2px 8px', borderRadius: 12 }}>PRIMARY</span>}
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: reasoning.confidence === 'high' ? t.success : reasoning.confidence === 'moderate' ? t.warn : t.textMuted,
          }}>
            {reasoning.confidence.toUpperCase()} ({pct}%)
          </span>
          {/* Severity badges alongside confidence */}
          {reasoning.severityIndicators.slice(0, 3).map((s, i) => (
            <span key={i} style={{
              fontSize: 10, fontWeight: 600,
              background: severityBg(s), color: severityColor(s),
              padding: '1px 6px', borderRadius: 8,
            }}>
              {s}
            </span>
          ))}
          {reasoning.severityIndicators.length > 3 && (
            <span style={{ fontSize: 10, color: t.textMuted }}>+{reasoning.severityIndicators.length - 3}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: '4px 10px', borderRadius: 6, border: `1px solid ${t.border}`,
              background: 'transparent', cursor: 'pointer', fontSize: 12, color: t.text,
            }}
          >
            {expanded ? 'Collapse' : 'Details'}
          </button>
          {onRemove && (
            <button
              onClick={onRemove}
              style={{
                padding: '4px 10px', borderRadius: 6, border: `1px solid ${t.danger}`,
                background: 'transparent', cursor: 'pointer', fontSize: 12, color: t.danger,
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Confidence bar */}
      <div style={{
        marginTop: 8, height: 4, borderRadius: 2,
        background: t.surface, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: barColor, borderRadius: 2,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {expanded && (
        <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.6 }}>
          {(reasoning.supportingHistory.length > 0 || reasoning.supportingExam.length > 0) && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: t.success }}>✓ Supporting findings</div>
              <ul style={{ margin: '4px 0 0', padding: '0 0 0 18px', color: t.text }}>
                {reasoning.supportingHistory.map((h, i) => <li key={'sh'+i}>{h}</li>)}
                {reasoning.supportingExam.map((e, i) => <li key={'se'+i} style={{ color: t.textSub }}>{e} (exam)</li>)}
              </ul>
            </div>
          )}

          {(reasoning.againstHistory.length > 0 || reasoning.againstExam.length > 0 || (reasoning.againstReasoning && reasoning.againstReasoning.length > 0)) && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: t.danger }}>✗ Against this diagnosis</div>
              <ul style={{ margin: '4px 0 0', padding: '0 0 0 18px', color: t.text }}>
                {reasoning.againstReasoning?.map((r, i) => <li key={'ar'+i} style={{ fontStyle: 'italic' }}>{r}</li>)}
                {reasoning.againstHistory.map((h, i) => <li key={'ah'+i}>{h}</li>)}
                {reasoning.againstExam.map((e, i) => <li key={'ae'+i}>{e}</li>)}
              </ul>
            </div>
          )}

          {reasoning.severityIndicators.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: t.warn }}>⚠ Severity indicators</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {reasoning.severityIndicators.map((s, i) => (
                  <span key={i} style={{
                    background: severityBg(s), color: severityColor(s),
                    borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {reasoning.missingCriticalData.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: t.textMuted }}>❓ Missing data</div>
              <div style={{ color: t.textMuted, marginTop: 2 }}>
                {reasoning.missingCriticalData.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
// These are embedded as constants, but in a full system would live in a JSON knowledge base.

const PROTOCOLS: Record<string, any> = {
  pneumonia: {
    mild: {
      admission: 'outpatient',
      antibiotics: 'Amoxicillin 40-45 mg/kg/dose PO twice daily for 5 days',
      oxygen: 'Room air — monitor SpO2',
    },
    severe: {
      admission: 'ward',
      antibiotics: 'Benzylpenicillin 50,000 IU/kg IV every 6 hours AND Gentamicin 7.5 mg/kg IV once daily',
      oxygen: 'Nasal prongs 1-2 L/min — target SpO2 =92%',
    },
    verySevere: {
      admission: 'ICU/HDU',
      antibiotics: 'Ceftriaxone 80 mg/kg IV once daily (max 2 g)',
      oxygen: 'High-flow nasal oxygen or CPAP if SpO2 <90%',
    },
  },
  asthma: {
    mild: {
      salbutamol: 'Salbutamol 4-8 puffs MDI + spacer every 20 min x3',
      steroid: 'Prednisolone 1-2 mg/kg PO daily for 3-5 days',
      oxygen: 'If SpO2 <92%, give nasal prongs',
    },
    severe: {
      salbutamol: 'Nebulised salbutamol 2.5-5 mg every 20 min x3',
      ipratropium: 'Add ipratropium 250 mcg neb to each salbutamol',
      steroid: 'IV hydrocortisone 4 mg/kg every 6 hours',
      admission: 'HDU/ward',
    },
  },
  croup: {
    moderate: {
      steroid: 'Dexamethasone 0.6 mg/kg PO/IV stat (max 16 mg)',
      adrenaline: 'Nebulised adrenaline 0.5 mL/kg (max 5 mL) if stridor at rest',
      admission: 'Ward',
    },
    severe: {
      steroid: 'Dexamethasone 0.6 mg/kg IV stat',
      adrenaline: 'Nebulised adrenaline every 1-2 h as needed',
      admission: 'HDU/ICU',
    },
  },
  bronchiolitis: {
    general: {
      oxygen: 'Nasal prongs to keep SpO2 >90%',
      feeding: 'NG tube if respiratory rate >70/min or unable to feed',
      fluid: '2/3 maintenance IV fluids if oral intake inadequate',
      admission: 'Ward (or HDU if severe indrawing/apnoea)',
      medication: 'Avoid routine bronchodilators or corticosteroids unless clear asthma overlap',
    },
  },
  tuberculosis: {
    intensive: {
      treatment: 'RHZE (Rifampicin, Isoniazid, Pyrazinamide, Ethambutol) for 2 months, then RH for 4 months',
      pyridoxine: 'Pyridoxine 25-50 mg daily',
      admit: 'Admit only if respiratory distress, severe malnutrition, or social concerns',
    },
  },
  empyema: {
    management: 'IV Ceftriaxone 80 mg/kg/day + Metronidazole 7.5 mg/kg IV TDS, chest tube drainage',
    fibrinolytic: 'Consider intrapleural urokinase if loculated',
    surgery: 'Refer for VATS/decortication if no improvement after 48-72 h',
  },
  epiglottitis: {
    immediate: 'DO NOT EXAMINE THROAT. Keep child calm, upright. Call anaesthesia/ENT for emergency intubation.',
    antibiotics: 'Ceftriaxone 80 mg/kg IV once daily after airway secured',
    admit: 'ICU',
  },
};

// -- MANAGEMENT PLAN GENERATOR ----------------------------------------------
function generateKenyanManagement(
  form: PatientForm,
  differentials: ScoredDisease[],
  severity: SeverityInfo | null
): {
  disposition: string;
  immediateActions: string[];
  investigations: { name: string; rationale: string }[];
  treatment: { category: string; steps: string[] }[];
  monitoring: string[];
  followUp: string;
  healthEducation: string[];
} {
  const ageMonths = parseInt(form.biodata.ageMonths) || 0;
  const weightKg = parseFloat(form.vitals.weight) || 0;
  const spo2 = parseFloat(form.vitals.spo2);
  const primary = differentials[0]?.disease;
  const diagnosisId = primary?.id || '';
  const sevLevel = severity?.level || 'MODERATE';

  const disposition =
    sevLevel === 'CRITICAL' ? 'ICU/HDU' :
    sevLevel === 'SEVERE' ? 'Ward admission' :
    form.vitals.examIndrawing || !isNaN(spo2) && spo2 < 92 ? 'Ward admission' :
    'Outpatient management';

  const immediateActions: string[] = [];
  if (!isNaN(spo2) && spo2 < 92) {
    immediateActions.push(`Start oxygen via nasal prongs at 2 L/min (target SpO2 >92%)`);
  }
  if (form.hpi.chestIndrawing || form.vitals.examIndrawing) {
    immediateActions.push('Position child for comfort, avoid agitation');
  }
  if (form.hpi.drooling && form.hpi.tripodPosition) {
    immediateActions.push('**EMERGENCY** — Suspect epiglottitis: Keep child calm, upright, call anaesthesia for airway');
  }
  if (form.vitals.avpu !== 'alert' && form.vitals.avpu !== '') {
    immediateActions.push('Check bedside glucose, manage airway, prepare for possible ICU');
  }

  const investigations: { name: string; rationale: string }[] = [];
  // Core investigations for severe respiratory illness
  investigations.push({ name: 'FBC + differential', rationale: 'Assess for leucocytosis, anaemia' });
  investigations.push({ name: 'CRP', rationale: 'Elevated in bacterial infection' });
  if (sevLevel !== 'MILD') {
    investigations.push({ name: 'Blood culture', rationale: 'Severe illness — rule out bacteraemia' });
  }
  if (sevLevel === 'CRITICAL' || form.hpi.seizureHPI) {
    investigations.push({ name: 'RBS (bedside glucose)', rationale: 'Altered consciousness or convulsions' });
  }
  if (form.vitals.examIndrawing || (!isNaN(spo2) && spo2 < 92)) {
    investigations.push({ name: 'Chest X-ray (PA)', rationale: 'Evaluate for consolidation, effusion, pneumothorax' });
  }
  if (diagnosisId === 'pulmonary_tuberculosis' || form.hpi.coughDuration === 'chronic' || form.hpi.weightLoss || form.family.tbHousehold) {
    investigations.push({ name: 'GeneXpert MTB/RIF (sputum/gastric aspirate)', rationale: 'High suspicion for TB' });
  }
  if (form.pmh.hiv || (form.pmh as any).conditions?.some((c: any) => c.name === 'HIV/AIDS')) {
    investigations.push({ name: 'CD4 count, viral load', rationale: 'HIV management' });
  }
  if (form.vitals.muac && parseFloat(form.vitals.muac) < 12.5) {
    investigations.push({ name: 'Serum albumin, RFT, electrolytes', rationale: 'Malnutrition risk' });
  }

  const treatment: { category: string; steps: string[] }[] = [];

  // Specific disease protocols based on primary diagnosis
  const primaryProtocol = PROTOCOLS[diagnosisId];
  if (primaryProtocol) {
    if (diagnosisId === 'pneumonia') {
      const sevCategory = sevLevel === 'CRITICAL' ? 'verySevere' : sevLevel === 'SEVERE' ? 'severe' : 'mild';
      const protocol = primaryProtocol[sevCategory];
      treatment.push({ category: 'Antibiotics', steps: [protocol.antibiotics] });
      treatment.push({ category: 'Oxygen', steps: [protocol.oxygen] });
      if (sevCategory !== 'mild') {
        treatment.push({ category: 'Supportive', steps: ['Monitor respiratory rate, SpO2 hourly', 'Paracetamol 15 mg/kg PO 6-hourly for fever'] });
      }
    } else if (diagnosisId === 'asthma') {
      const sev = sevLevel === 'CRITICAL' ? 'severe' : 'mild';
      const protocol = primaryProtocol[sev];
      treatment.push({ category: 'Bronchodilator', steps: [protocol.salbutamol] });
      if (protocol.ipratropium) treatment[0].steps.push(protocol.ipratropium);
      treatment.push({ category: 'Steroids', steps: [protocol.steroid] });
      if (sev === 'severe') treatment.push({ category: 'Oxygen', steps: ['Target SpO2 >92%'] });
    } else if (diagnosisId === 'croup') {
      const sev = sevLevel === 'CRITICAL' ? 'severe' : 'moderate';
      const protocol = primaryProtocol[sev];
      treatment.push({ category: 'Steroid', steps: [protocol.steroid] });
      treatment.push({ category: 'Nebulised Adrenaline', steps: [protocol.adrenaline || 'If stridor at rest'] });
    } else if (diagnosisId === 'bronchiolitis') {
      treatment.push({ category: 'Supportive', steps: [
        'Minimal handling, gentle nasal suction',
        weightKg > 0 ? `NG feeds if RR >70 or unable to feed; IV fluids at 2/3 maintenance if needed` : 'Encourage breastfeeding/small frequent feeds',
        'Oxygen to maintain SpO2 >90%',
        'No routine bronchodilators unless clear atopic history'
      ]});
    } else if (diagnosisId === 'tuberculosis') {
      treatment.push({ category: 'Anti-TB', steps: [primaryProtocol.intensive.treatment, primaryProtocol.intensive.pyridoxine] });
      treatment.push({ category: 'Admission', steps: [primaryProtocol.intensive.admit] });
    } else if (diagnosisId === 'empyema') {
      treatment.push({ category: 'Antibiotics + Drainage', steps: [primaryProtocol.management, primaryProtocol.fibrinolytic] });
    } else if (diagnosisId === 'epiglottitis') {
      treatment.push({ category: 'Airway Emergency', steps: [primaryProtocol.immediate, primaryProtocol.antibiotics] });
    }
  } else {
    // Generic treatment based on severity
    if (sevLevel === 'CRITICAL' || sevLevel === 'SEVERE') {
      treatment.push({ category: 'Empiric Antibiotics', steps: ['Ceftriaxone 80 mg/kg IV daily (max 2 g) + Gentamicin 7.5 mg/kg IV daily'] });
      treatment.push({ category: 'Oxygen', steps: ['Target SpO2 >92%'] });
    }
  }

  // Add supportive care common to all
  if (form.vitals.hydration === 'moderate' || form.vitals.hydration === 'severe') {
    treatment.push({ category: 'Fluids', steps: ['Correct dehydration carefully; avoid bolus unless shocked'] });
  }
  if (form.nutrition.muac && parseFloat(form.nutrition.muac) < 12.5) {
    treatment.push({ category: 'Nutrition', steps: ['SAM identified — provide F-75/F-100/RUTF as appropriate; avoid large IV fluids'] });
  }
  if (form.pmh.hiv) {
    treatment.push({ category: 'HIV Care', steps: ['Continue ART, consider co-trimoxazole prophylaxis if not on it'] });
  }

  const monitoring: string[] = [];
  if (disposition.includes('ICU') || disposition.includes('HDU')) {
    monitoring.push('Continuous SpO2, hourly RR/HR/BP, strict fluid balance');
  } else if (disposition.includes('Ward')) {
    monitoring.push('SpO2 4-hourly, respiratory assessment 4-hourly, daily weight');
  } else {
    monitoring.push('Review within 48-72 hours or sooner if danger signs appear');
  }

  const followUp = disposition.includes('Outpatient')
    ? 'Return immediately if unable to feed, convulsions, cyanosis, or worsening breathing.'
    : 'Follow-up in paediatric clinic 1-2 weeks after discharge.';

  const healthEducation: string[] = [
    'Avoid indoor smoke exposure',
    'Ensure completion of immunisations (PCV, Hib, measles)',
    form.hpi.feedingDiff ? 'Offer small frequent feeds; return if unable to tolerate' : '',
    form.family.smokingExposure ? 'Smoking cessation counselling for household members' : '',
  ].filter(Boolean);

  return { disposition, immediateActions, investigations, treatment, monitoring, followUp, healthEducation };
}

// -- RENDER MANAGEMENT FUNCTION ----------------------------------------------
function renderManagement() {
  const differentials = useMemo(() => runInference(form), [form]);
  const severity = useMemo(() => getSeverity(form), [form]);
  const clinicalContext = useBiodataContext(form);
  const plan = useMemo(() => generateKenyanManagement(form, differentials, severity), [form, differentials, severity]);
  const weightKg = parseFloat(form.vitals.weight) || 0;
  const ageMonths = parseInt(form.biodata.ageMonths) || 0;

  if (form.complaints.length === 0) return null;

  return (
    <>
      <PhaseHeader title="Management Plan (Kenyan Paediatric Protocols)" sub="Severity-based, weight-adjusted treatment with integrated monitoring and safety." />
      <Card>
        {/* -- DISPOSITION & IMMEDIATE ACTIONS -- */}
        <Section title="A. Disposition & Immediate Stabilisation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: t.accentBg, padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Recommended Care Level</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{plan.disposition}</div>
            </div>
            {plan.immediateActions.length > 0 && (
              <div style={{ background: t.dangerBg, padding: 12, borderRadius: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: t.danger }}>🚨 Immediate Actions</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                  {plan.immediateActions.map((a,i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </div>
        </Section>

        {/* -- INVESTIGATIONS -- */}
        <Section title="B. Investigations">
          <div style={{ fontSize: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: `1px solid ${t.border}` }}>
                <td style={{ padding: '4px 0', fontWeight: 700 }}>Test</td>
                <td style={{ padding: '4px 0', fontWeight: 700 }}>Rationale</td>
              </tr></thead>
              <tbody>
                {plan.investigations.map((inv, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: '4px 0' }}>{inv.name}</td>
                    <td style={{ padding: '4px 0', color: t.textSub }}>{inv.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* -- TREATMENT -- */}
        <Section title="C. Definitive Treatment">
          {plan.treatment.map((tx, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{tx.category}</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                {tx.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          ))}
        </Section>

        {/* -- WEIGHT-BASED DOSE CALCULATOR -- */}
        <Section title="D. Weight-Based Dose Calculator (Kenyan Formulary)">
          {weightKg > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: t.border }}>
                    {['Drug', 'Dose/kg', 'Calculated Dose', 'Route', 'Frequency', 'Notes'].map(h => (
                      <td key={h} style={{ padding: '4px 6px', fontWeight: 700 }}>{h}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ESSENTIAL_DRUGS.filter(d => {
                    // Show only relevant drugs for the context
                    const primaryId = differentials[0]?.disease.id;
                    if (primaryId === 'pneumonia') return d.drug.includes('Amoxicillin') || d.drug.includes('Benzylpenicillin') || d.drug.includes('Ceftriaxone') || d.drug.includes('Gentamicin');
                    if (primaryId === 'asthma') return d.drug.includes('Salbutamol') || d.drug.includes('Prednisolone') || d.drug.includes('Hydrocortisone');
                    if (primaryId === 'croup') return d.drug.includes('Dexamethasone') || d.drug.includes('Adrenaline');
                    return true; // fallback
                  }).map((drug, i) => {
                    let dose = '';
                    try { dose = drug.dose(weightKg, ageMonths); } catch (e) { dose = '--'; }
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${t.border}` }}>
                        <td style={{ padding: '2px 6px', fontWeight: 600 }}>{drug.drug}</td>
                        <td style={{ padding: '2px 6px' }}>{(drug as any).mgPerKg || '--'} mg/kg</td>
                        <td style={{ padding: '2px 6px', fontFamily: t.mono, fontWeight: 700, color: t.success }}>{dose}</td>
                        <td style={{ padding: '2px 6px' }}>{drug.route}</td>
                        <td style={{ padding: '2px 6px' }}>{drug.freq}</td>
                        <td style={{ padding: '2px 6px', color: t.textMuted }}>{drug.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: t.warn, fontSize: 12 }}>
              Enter patient weight in General Examination to calculate individual doses.
            </div>
          )}
        </Section>

        {/* -- MONITORING & FOLLOW-UP -- */}
        <Section title="E. Monitoring & Follow-Up">
          <Grid>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>Monitoring Plan</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                {plan.monitoring.map((m,i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>Follow-Up</div>
              <div style={{ fontSize: 12 }}>{plan.followUp}</div>
            </div>
          </Grid>
        </Section>

        {/* -- HEALTH EDUCATION -- */}
        <Section title="F. Health Education & Prevention">
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
            {plan.healthEducation.map((h,i) => <li key={i}>{h}</li>)}
          </ul>
        </Section>

        {/* -- SAFETY OVERRIDES -- */}
        <div style={{ marginTop: 16, padding: 12, background: t.warnBg, borderRadius: 8, borderLeft: `4px solid ${t.warn}` }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Safety Alerts & Contraindications</div>
          <div style={{ fontSize: 11, color: t.text }}>
            {form.nutrition.malnutritionSigns?.includes('Bilateral pitting oedema') && '⚠ Do not give large IV fluid boluses — high risk of heart failure in SAM with oedema. '}
            {form.pmh.hiv && '⚠ Ensure ART is continued. Be aware of potential drug-drug interactions (e.g., rifampicin with ART). '}
            {form.vitals.muac && parseFloat(form.vitals.muac) < 11.5 && '⚠ Severe acute malnutrition — use F-75/F-100 cautiously; monitor for refeeding syndrome. '}
          </div>
        </div>
      </Card>
    </>
  );
}

  function renderNote(){
    const ctx = useBiodataContext(form);
    const ageMonths = parseInt(form.biodata.ageMonths || '0');
    const sex = form.biodata.sex || 'Male';
    const weightKg = parseFloat(form.vitals.weight);
    const heightCm = parseFloat(form.vitals.height);
    const muacCm = parseFloat(form.nutrition.muac);
    const hcCm = parseFloat(form.vitals.hc);
    const spo2 = parseFloat(form.vitals.spo2);
    const rr = parseFloat(form.vitals.rr);
    const hr = parseFloat(form.vitals.hr);
    const temp = parseFloat(form.vitals.temp);
    const bfp = form.biodata;
    const muacCls = !isNaN(muacCm) && ageMonths >= 6 && ageMonths <= 59 ? classifyMUAC(muacCm) : null;
    const wfaCls = !isNaN(weightKg) ? classifyWeightForAge(weightKg, ageMonths, sex) : null;
    const hfaCls = !isNaN(heightCm) ? classifyHeightForAge(heightCm, ageMonths, sex) : null;
    const wfhCls = !isNaN(weightKg) && !isNaN(heightCm) ? classifyWeightForHeight(weightKg, heightCm, sex) : null;
    const expectedMilestones = getExpectedMilestones(ageMonths);
    const expectedVaccines = getExpectedVaccines(ageMonths);

    const copy=()=>{
      navigator.clipboard.writeText(displayText).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);});
    };
    const regenerate = () => {
      setEditedNote(noteText);
      setNoteEdited(false);
    };
    const displayText = noteEdited ? editedNote : noteText;

    const sv = severity;
    const severityLevel = sv?.level || 'MODERATE';
    const severityColor = severityLevel === 'CRITICAL' ? t.danger : severityLevel === 'SEVERE' ? t.warn : t.success;
    const primaryDx = differentials[0]?.disease?.name || 'Not determined';

    const redFlags: string[] = [];
    if (form.hpi.cyanoticEpisodes) redFlags.push('Cyanotic episodes');
    if (form.hpi.seizureHPI) redFlags.push('Seizures');
    if (form.hpi.drooling && form.hpi.tripodPosition) redFlags.push('Airway compromise (drooling, tripod)');
    if (form.hpi.chestIndrawing) redFlags.push('Chest indrawing');
    if (!isNaN(spo2) && spo2 < 92) redFlags.push(`Hypoxia (SpO2 ${spo2}%)`);
    if (form.vitals.examGrunting) redFlags.push('Expiratory grunting');
    if (form.vitals.avpu !== 'alert' && form.vitals.avpu !== '') redFlags.push(`Altered consciousness (AVPU: ${form.vitals.avpu})`);
    if (form.nutrition.malnutritionSigns?.includes('Bilateral pitting oedema')) redFlags.push('Bilateral pitting oedema — SAM');

    const muacRisk = muacCls?.category?.includes('SAM') || muacCls?.category?.includes('MAM');

    const fmt = (v: any, fallback = 'Not documented') => (v && v !== '' ? v : fallback);

    const rosPositives: string[] = [];
    const rosNegatives: string[] = [];
    const rosWarnFields = ['seizures','lethargyRos','syncope','cyanosisRos','vomiting','hepatomegaly','reducedUrine','jaundice','petechiae'];
    Object.entries(form.ros).forEach(([k, v]) => {
      if (v === true) {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/Ros$/, '').trim();
        if (rosWarnFields.includes(k)) redFlags.push(label);
        rosPositives.push(label);
      } else if (k !== 'rashType' && typeof v === 'boolean' && v === false) {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/Ros$/, '').trim();
        rosNegatives.push(label);
      }
    });

    const btnS = (sel: boolean, warn = false): React.CSSProperties => ({
      padding: '8px 20px', borderRadius: 8, border: sel ? 'none' : `1px solid ${t.border}`,
      cursor: 'pointer', background: sel ? (warn ? t.warn : t.accent) : 'transparent',
      color: sel ? 'white' : t.text, fontSize: 13, fontWeight: sel ? 600 : 400,
      transition: 'background 0.2s',
    });

    const sectionStyle: React.CSSProperties = { marginBottom: 28 };
    const sectionTitle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: t.text, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: `2px solid ${t.accent}40`, paddingBottom: 6, marginBottom: 12 };
    const subTitle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: t.textSub, marginTop: 12, marginBottom: 4 };
    const para: React.CSSProperties = { fontSize: 12, color: t.text, lineHeight: 1.7, margin: '0 0 6px 0' };
    const infoRow: React.CSSProperties = { fontSize: 11.5, color: t.text, lineHeight: 1.6, marginBottom: 2 };
    const labelStyle: React.CSSProperties = { fontWeight: 600, color: t.textSub };

    const topDxName = plan.diagnosisSpecific[0]?.diseaseName || primaryDx;

    return <>
      <PhaseHeader title="Clinical Note" sub="Senior consultant-level formatted consultation note with integrated management plan." />
      <Card>
        <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginBottom:16,flexWrap:'wrap'}}>
          <button onClick={copy} style={{
            padding:"8px 20px",borderRadius:8,border:"none",cursor:"pointer",
            background:copied?t.success:t.accent,color:"white",fontSize:13,fontWeight:600,transition:"background 0.2s",
          }}>{copied?'✔ Copied!':'Copy to Clipboard'}</button>
          <button onClick={regenerate} style={btnS(false)}>Regenerate from Form</button>
          <button onClick={()=>window.print?.()} style={btnS(false)}>Print / PDF</button>
        </div>

        <div style={{display:'flex',flexDirection:isMobile?'column':'row',gap:24}}>
          {/* ---------- LEFT COLUMN: FORMATTED NOTE ---------- */}
          <div style={{flex:isMobile?'1':'0 0 65%',minWidth:0}}>

            {/* --- TITLE --- */}
            <div style={{textAlign:'center',marginBottom:24,paddingBottom:16,borderBottom:`3px double ${t.accent}`}}>
              <div style={{fontSize:18,fontWeight:800,color:t.text,letterSpacing:'0.05em'}}>PEDIATRIC CONSULTATION NOTE</div>
              <div style={{fontSize:10,color:t.textMuted,marginTop:4}}>Senior Consultant Paediatrician — Respiratory Medicine</div>
            </div>

            {/* --- 1. IDENTIFICATION / BIODATA --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>1. Identification &amp; Biodata</div>
              <div style={infoRow}><span style={labelStyle}>Name:</span> {fmt(bfp.patientName)}</div>
              <div style={infoRow}><span style={labelStyle}>Age:</span> {formatAge(ageMonths)} ({ageMonths} months)</div>
              <div style={infoRow}><span style={labelStyle}>Sex:</span> {fmt(bfp.sex)}</div>
              <div style={infoRow}><span style={labelStyle}>Hospital No:</span> {fmt((bfp as any).hospitalNo)}</div>
              <div style={infoRow}><span style={labelStyle}>Date of Review:</span> {new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</div>
              <div style={infoRow}><span style={labelStyle}>Informant:</span> {fmt(bfp.informant)}</div>
              <div style={infoRow}><span style={labelStyle}>Reliability:</span> {fmt(bfp.histReliability)}</div>
              <div style={infoRow}><span style={labelStyle}>Residence:</span> {fmt(bfp.residence)}</div>
              <div style={infoRow}><span style={labelStyle}>Referral Source:</span> {fmt(bfp.sourceOfReferral)}</div>
              <div style={infoRow}><span style={labelStyle}>Accompanied by:</span> {fmt((bfp as any).accompaniedBy)}</div>
              <div style={{...para, marginTop:10, fontStyle:'italic', borderLeft:`3px solid ${t.accent}40`, paddingLeft:12}}>
                A {formatAge(ageMonths)} {sex?.toLowerCase()} from {fmt(bfp.residence, 'unknown location')}, brought by {fmt(bfp.informant, 'an attendant')}{bfp.histReliability ? ` who is a ${bfp.histReliability.toLowerCase()} informant` : ''}.
              </div>
            </div>

            {/* --- 2. CHIEF COMPLAINTS --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>2. Chief Complaints</div>
              {(form as any).hpi?.symptomOrder && (form as any).hpi.symptomOrder.length > 0
                ? (form as any).hpi.symptomOrder.map((item:any, i:number) => {
                    const sid = item.symptomId || item;
                    const complaint = ALL_SYMPTOMS.find((s:any) => s.id === sid);
                    const dur = item.duration || form.complaintDurations[sid] || '';
                    return <div key={i} style={para}>{i+1}. {complaint?.label || sid}{dur ? ` — ${dur}` : ''}</div>;
                  })
                : form.complaints.map((c, i) => {
                    const dur = form.complaintDurations[c] || '';
                    return <div key={i} style={para}>{i+1}. {ALL_SYMPTOMS.find((s:any)=>s.id===c)?.label || c}{dur ? ` — ${dur}` : ''}</div>;
                  })
              }
              {form.complaints.length === 0 && <div style={{...para, color:t.textMuted}}>No complaints documented.</div>}
            </div>

            {/* --- 3. HISTORY OF PRESENTING ILLNESS --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>3. History of Presenting Illness</div>
              <div style={para}>
                {(() => {
                  const parts: string[] = [];
                  const hpi = form.hpi;
                  const onset = hpi.onsetType || '';
                  const progression = hpi.progression || '';
                  const associated = hpi.associated || '';
                  const coughChar = hpi.coughChar || '';
                  const feverP = hpi.feverPattern || '';
                  const feverDur = hpi.feverDuration || '';

                  if (form.complaints.length > 0) {
                    const firstComplaint = ALL_SYMPTOMS.find((s:any) => s.id === form.complaints[0])?.label || form.complaints[0];
                    const firstDur = form.complaintDurations[form.complaints[0]] || '';
                    parts.push(`The child was${onset ? ` ${onset}` : ''} well until${firstDur ? ` ${firstDur} prior to admission` : ''} when they developed`);
                    const complaintList = form.complaints.map(c => ALL_SYMPTOMS.find((s:any) => s.id === c)?.label || c);
                    if (complaintList.length === 1) parts.push(` ${complaintList[0]}.`);
                    else if (complaintList.length === 2) parts.push(` ${complaintList[0]} and ${complaintList[1]}.`);
                    else parts.push(` ${complaintList.slice(0, -1).join(', ')}, and ${complaintList[complaintList.length-1]}.`);
                  }

                  if (coughChar) parts.push(`Cough was described as ${coughChar}.`);
                  if (feverP) parts.push(`Fever was ${feverP}${feverDur ? `, lasting ${feverDur}` : ''}${hpi.highFever ? ', high-grade' : ''},${hpi.highFever ? '' : ' low-to-moderate grade,'} temporarily relieved by antipyretics${hpi.seizureHPI ? ', NOT associated with convulsions' : ' and not associated with convulsions'}.`);
                  if (hpi.wheeze) parts.push(`Audible wheeze was noted${hpi.wheezePattern ? `, described as ${hpi.wheezePattern}` : ''}.`);
                  if (hpi.stridor) parts.push(`Inspiratory stridor was present, described as ${hpi.stridorType || 'harsh'} in nature.`);
                  if (hpi.chestIndrawing || hpi.nasalFlaring || hpi.grunting || hpi.headBobbing) {
                    const signs: string[] = [];
                    if (hpi.chestIndrawing) signs.push('chest indrawing');
                    if (hpi.nasalFlaring) signs.push('nasal flaring');
                    if (hpi.grunting) signs.push('expiratory grunting');
                    if (hpi.headBobbing) signs.push('head bobbing');
                    parts.push(`Difficulty in breathing was characterised by ${signs.join(', ')}.`);
                  }
                  if (hpi.feedingDiff) parts.push('Feeding has been poor since the onset of illness.');
                  if (hpi.cyanoticEpisodes) parts.push('Caregiver reports episodes of cyanosis.');
                  if (hpi.vomitingHPI) parts.push('The child has experienced vomiting.');
                  if (hpi.diarrheaHPI) parts.push('Diarrhoea has also been present.');

                  const negatives: string[] = [];
                  if (!hpi.cyanoticEpisodes) negatives.push('no history of cyanosis');
                  if (!hpi.seizureHPI) negatives.push('apnea, or choking episodes');
                  if (!hpi.vomitingHPI && !hpi.diarrheaHPI) negatives.push('no vomiting or diarrhoea');
                  if (negatives.length > 0) parts.push(`There was ${negatives.join(', ')}.`);

                  if (hpi.nightSweats) parts.push('Night sweats reported.');
                  if (hpi.weightLoss) parts.push('Caregiver reports weight loss.');
                  if (hpi.tbContact) parts.push('There is known contact with a tuberculosis case.');
                  if (hpi.prevTx) parts.push(`Treatment given before presentation: ${hpi.prevTx}.${hpi.txResponse ? ` Response: ${hpi.txResponse}.` : ''}`);
                  if (progression) parts.push(`Progression: ${progression}.`);
                  if (associated) parts.push(`Caregiver adds: "${associated}"`);
                  if (hpi.suddenOnset) parts.push('Onset was sudden, raising concern for foreign body aspiration or anaphylaxis.');
                  if (hpi.recentURTI) parts.push('There was a history of recent upper respiratory tract infection.');

                  return parts.length > 0
                    ? parts.join(' ').replace(/\.,/g, '.').replace(/\.\./g, '.').replace(/\.\s+\./g, '.').replace(/\s+/g, ' ').trim()
                    : 'No history of presenting illness documented.';
                })()}
              </div>
            </div>

            {/* --- 4. PAST MEDICAL HISTORY --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>4. Past Medical History</div>
              {(() => {
                const pmh = form.pmh;
                const items: { h: string; t: string }[] = [];
                const anyContent = pmh.prevAdmissions || pmh.chronicIllnesses?.length || pmh.prevSurgeries || pmh.hiv || pmh.sickleCellDisease || pmh.allergies || pmh.medications || pmh.asthmaDx;
                if (pmh.prevAdmissions) items.push({ h: 'Previous Admissions', t: fmt(pmh.prevAdmDetail, 'History of previous admissions.' )});
                if (pmh.chronicIllnesses?.length) items.push({ h: 'Chronic Illnesses', t: pmh.chronicIllnesses.join(', ') + '.' });
                if (pmh.asthmaDx) items.push({ h: 'Asthma', t: 'Child has a known diagnosis of asthma.' });
                if (pmh.recurrentChest) items.push({ h: 'Recurrent Chest Infections', t: 'History of recurrent chest infections.' });
                if (pmh.cardiacDisease) items.push({ h: 'Cardiac Disease', t: 'Known cardiac condition.' });
                if (pmh.hiv) items.push({ h: 'HIV Status', t: 'Child is HIV-positive.' });
                if (pmh.sickleCellDisease) items.push({ h: 'Sickle Cell Disease', t: 'Known diagnosis of sickle cell disease.' });
                if (pmh.prevSurgeries) items.push({ h: 'Surgical History', t: fmt(pmh.surgeryDetail, 'Previous surgery documented.') });
                if (pmh.allergies) items.push({ h: 'Allergies', t: pmh.allergies });
                if (pmh.medications) items.push({ h: 'Regular Medications', t: pmh.medications });
                if (items.length === 0) items.push({ h: '', t: 'No significant past medical history reported.' });
                return items.map((it, i) =>
                  it.h ? <div key={i}><div style={subTitle}>{it.h}</div><div style={para}>{it.t}</div></div>
                       : <div key={i} style={{...para, color: t.textMuted}}>{it.t}</div>
                );
              })()}
            </div>

            {/* --- 5. ANTENATAL HISTORY --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>5. Antenatal History</div>
              {(() => {
                const anc = form.anc;
                const ancParts: string[] = [];
                if (anc.ancVisits) ancParts.push(`Mother attended ${anc.ancVisits} ANC visits.`);
                if (anc.hivTesting) ancParts.push(`HIV testing was done${anc.hivResult ? `: ${anc.hivResult}` : ''}${anc.pmtct ? ', and PMTCT was administered' : ''}.`);
                if ((anc as any).syphilis !== undefined) ancParts.push(`Syphilis screening: ${(anc as any).syphilis ? 'positive' : 'negative'}.`);
                if (anc.ironFolate) ancParts.push('Iron/folate supplementation was given during pregnancy.');
                if (anc.malariaProphylaxis) ancParts.push('Malaria prophylaxis was administered.');
                const comps: string[] = [];
                if (anc.preEclampsia) comps.push('pre-eclampsia');
                if (anc.gestationalDM) comps.push('gestational diabetes');
                if (anc.antepartumHaemorrhage) comps.push('antepartum haemorrhage');
                if (anc.maternalFever) comps.push('maternal fever during labour');
                if (anc.meconiumStained) comps.push('meconium-stained liquor');
                if (comps.length) ancParts.push(`Complications included: ${comps.join(', ')}.`);
                if (ancParts.length === 0) ancParts.push('Antenatal history not documented.');
                return <div style={para}>{ancParts.join(' ')}</div>;
              })()}
            </div>

            {/* --- 6. BIRTH HISTORY --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>6. Birth History</div>
              {(() => {
                const b = form.birth;
                const parts: string[] = [];
                if (b.gestAge || b.gestAgeWeeks) parts.push(`Gestation: ${b.gestAgeWeeks || b.gestAge} weeks.`);
                else parts.push('Gestation: Not documented.');
                if (b.deliveryMode) parts.push(`Mode of delivery: ${b.deliveryMode.replace(/_/g, ' ')}.`);
                if (b.birthPlace) parts.push(`Place of delivery: ${b.birthPlace}.`);
                if (b.birthWeight) parts.push(`Birth weight: ${b.birthWeight} kg.`);
                if (b.nicuAdmission) parts.push(`NICU admission required${b.nicuDuration ? ` for ${b.nicuDuration}` : ''}.`);
                else parts.push('No NICU admission.');
                if (b.apgar) parts.push(`APGAR score: ${b.apgar}.`);
                if (b.neonatalComplications?.length) parts.push(`Neonatal complications: ${b.neonatalComplications.join(', ')}.${b.neonatalDetail ? ` Detail: ${b.neonatalDetail}` : ''}`);
                return <div style={para}>{parts.join(' ')}</div>;
              })()}
            </div>

            {/* --- 7. POSTNATAL / NEONATAL HISTORY --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>7. Postnatal &amp; Neonatal History</div>
              {(() => {
                const b = form.birth;
                const parts: string[] = [];
                if (b.neonatalComplications?.length) parts.push(`Neonatal period was complicated by: ${b.neonatalComplications.join(', ')}.`);
                if (b.neonatalDetail) parts.push(b.neonatalDetail);
                if (parts.length === 0) parts.push('Uneventful neonatal period.');
                return <div style={para}>{parts.join(' ')}</div>;
              })()}
            </div>

            {/* --- 8. GROWTH & DEVELOPMENT --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>8. Growth &amp; Development</div>
              {(() => {
                const dev = form.development;
                const parts: string[] = [];
                const achievedGM = dev.grossMotor?.split(',').map(s => s.trim()).filter(Boolean) || [];
                const achievedFM = dev.fineMotor?.split(',').map(s => s.trim()).filter(Boolean) || [];
                const achievedSp = dev.speech?.split(',').map(s => s.trim()).filter(Boolean) || [];
                const achievedSo = dev.social?.split(',').map(s => s.trim()).filter(Boolean) || [];
                const totalExp = expectedMilestones.grossMotor.length + expectedMilestones.fineMotor.length + expectedMilestones.speech.length + expectedMilestones.social.length;
                const totalAch = achievedGM.length + achievedFM.length + achievedSp.length + achievedSo.length;
                const pct = totalExp > 0 ? Math.round(totalAch / totalExp * 100) : 0;

                parts.push(`At ${ageMonths} months of age, expected developmental milestones include: gross motor — ${expectedMilestones.grossMotor.join(', ')}; fine motor — ${expectedMilestones.fineMotor.join(', ')}; speech — ${expectedMilestones.speech.join(', ')}; social — ${expectedMilestones.social.join(', ')}.`);
                if (totalAch > 0) parts.push(`Achieved milestones: ${dev.grossMotor ? `Gross motor: ${dev.grossMotor}. ` : ''}${dev.fineMotor ? `Fine motor: ${dev.fineMotor}. ` : ''}${dev.speech ? `Speech: ${dev.speech}. ` : ''}${dev.social ? `Social: ${dev.social}. ` : ''}`);
                if (pct < 70) parts.push('Developmental assessment suggests possible delay — further evaluation recommended.');
                if (dev.concerns) parts.push(`Caregiver concerns: ${dev.concerns}.`);
                if (pct >= 70) parts.push('Development appears age-appropriate.');
                return <div style={para}>{parts.join(' ')}</div>;
              })()}
            </div>

            {/* --- 9. IMMUNIZATION --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>9. Immunization</div>
              {(() => {
                const imm = form.immunization;
                const parts: string[] = [];
                parts.push(`Expected vaccines for age: ${expectedVaccines.join(', ')}.`);
                if (imm.status) parts.push(`Immunization status: ${imm.status}.`);
                if (imm.missedVaccines?.length) parts.push(`Missed vaccines: ${imm.missedVaccines.join(', ')}.`);
                parts.push(`BCG scar: ${(imm as any).bcgScarPresent ? 'Present' : 'Not documented'}.`);
                parts.push(`Card seen: ${(imm as any).cardSeen ? 'Yes' : 'Not documented'}.`);
                return <div style={para}>{parts.join(' ')}</div>;
              })()}
            </div>

            {/* --- 10. NUTRITIONAL HISTORY --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>10. Nutritional History</div>
              {(() => {
                const nut = form.nutrition;
                const parts: string[] = [];
                parts.push(`Breastfeeding: ${nut.breastfed || 'Not documented'}.`);
                if (nut.complementaryAge) parts.push(`Complementary feeds introduced at ${nut.complementaryAge} months.`);
                if (nut.dietaryDiversity) parts.push(`Dietary diversity: ${nut.dietaryDiversity}.`);
                if (nut.appetite) parts.push(`Appetite: ${nut.appetite}.`);
                if (nut.muac) {
                  const muacVal = parseFloat(nut.muac);
                  parts.push(`MUAC: ${nut.muac} cm${!isNaN(muacVal) && muacCls ? ` — ${muacCls.category} (${muacCls.risk})` : ''}.`);
                }
                if (weightKg) {
                  parts.push(`Weight-for-age: ${wfaCls?.category || 'Not classified'}${wfaCls?.risk ? ` — ${wfaCls.risk}` : ''}.`);
                }
                if (nut.malnutritionSigns?.includes('Bilateral pitting oedema')) parts.push('Bilateral pitting oedema present — diagnostic of severe acute malnutrition.');
                if (nut.malnutritionSigns?.length) parts.push(`Other signs: ${nut.malnutritionSigns.join(', ')}.`);
                if (parts.length === 1) parts.push('Nutritional history not documented.');
                return <div style={para}>{parts.join(' ')}</div>;
              })()}
            </div>

            {/* --- 11. FAMILY & SOCIAL HISTORY --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>11. Family &amp; Social History</div>
              {(() => {
                const fam = form.family;
                const parts: string[] = [];
                const household: string[] = [];
                if (fam.tbHousehold) household.push('TB contact in household');
                if (fam.asthmaFamily) household.push('family history of asthma');
                if (fam.atopyFamily) household.push('family history of atopy');
                if (fam.sickleCellFamily) household.push('family history of sickle cell disease');
                if (fam.similarIllnessSiblings) household.push('similar illness in siblings');
                if (household.length) parts.push(`Relevant family history: ${household.join('; ')}.`);
                if (fam.housingConditions) parts.push(`Housing: ${fam.housingConditions}.`);
                if (fam.waterSource) parts.push(`Water source: ${fam.waterSource}.`);
                if (fam.sanitation) parts.push(`Sanitation: ${fam.sanitation}.`);
                if (fam.smokingExposure) parts.push(`Household smoke exposure: Yes${fam.smokeDetail ? ` (${fam.smokeDetail})` : ''}.`);
                if (fam.parentOccupation) parts.push(`Parent occupation: ${fam.parentOccupation}.`);
                if (fam.schoolAttendance) parts.push(`School attendance: ${fam.schoolAttendance}.`);
                if (parts.length === 0) parts.push('Family and social history not documented.');
                return <div style={para}>{parts.join(' ')}</div>;
              })()}
            </div>

            {/* --- 12. REVIEW OF SYSTEMS --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>12. Review of Systems</div>
              {(() => {
                if (rosPositives.length === 0 && rosNegatives.length === 0) return <div style={{...para, color:t.textMuted}}>Review of systems not performed.</div>;
                const parts: string[] = [];
                if (rosPositives.length) parts.push(`Positive findings: ${rosPositives.join(', ')}.`);
                if (rosNegatives.length) parts.push(`Negative for: ${rosNegatives.join(', ')}.`);
                return <div style={para}>{parts.join(' ')}</div>;
              })()}
            </div>

            {/* --- 13. GENERAL EXAMINATION --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>13. General Examination</div>
              {(() => {
                const v = form.vitals;
                const examParts: string[] = [];
                const vitalsLine: string[] = [];
                if (v.hr) vitalsLine.push(`HR: ${v.hr}/min`);
                if (v.rr) vitalsLine.push(`RR: ${v.rr}/min`);
                if (v.spo2) vitalsLine.push(`SpO2: ${v.spo2}%`);
                if (v.temp) vitalsLine.push(`Temp: ${v.temp}°C`);
                if (v.bp) vitalsLine.push(`BP: ${v.bp} mmHg`);
                if (v.avpu) vitalsLine.push(`AVPU: ${v.avpu}`);
                if (vitalsLine.length) examParts.push(`Vitals: ${vitalsLine.join('; ')}.`);

                const anthro: string[] = [];
                if (v.weight) anthro.push(`Weight: ${v.weight} kg${wfaCls ? ` (${wfaCls.category})` : ''}`);
                if (v.height) anthro.push(`Height: ${v.height} cm${hfaCls ? ` (${hfaCls.category})` : ''}`);
                if (v.muac) anthro.push(`MUAC: ${v.muac} cm${muacCls ? ` (${muacCls.category})` : ''}`);
                if (v.hc) anthro.push(`HC: ${v.hc} cm`);
                if (anthro.length) examParts.push(`Anthropometry: ${anthro.join('; ')}.`);

                if (v.hydration) examParts.push(`Hydration status: ${v.hydration}.`);
                if (v.generalCondition) examParts.push(`General appearance: ${v.generalCondition.replace(/_/g, ' ')}.`);
                if (v.capRefill) examParts.push(`Capillary refill: ${v.capRefill} seconds.`);

                const examSigns: string[] = [];
                if (v.pallorExam) examSigns.push('pallor');
                if (v.jaundiceExam) examSigns.push('jaundice');
                if (v.cyanosisExam) examSigns.push('central cyanosis');
                if (v.clubbingExam) examSigns.push('clubbing');
                if (v.edemaExam) examSigns.push('pedal oedema');
                if (v.lymphNodes !== 'normal' && v.lymphNodes !== '') examSigns.push(`lymphadenopathy (${v.lymphNodes}${v.lymphNodeSite ? ` at ${v.lymphNodeSite}` : ''})`);
                if (examSigns.length) examParts.push(`Significant findings: ${examSigns.join(', ')}.`);

                // ENT
                const ent: string[] = [];
                if (v.examSkinRash) ent.push(`Rash: ${v.examSkinRash}`);
                if (ent.length) examParts.push(ent.join('; '));

                if (examParts.length === 0) examParts.push('General examination findings not documented.');
                return <div style={para}>{examParts.join(' ')}</div>;
              })()}
            </div>

            {/* --- 14. SYSTEMIC EXAMINATION --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>14. Systemic Examination</div>
              {(() => {
                const v = form.vitals;

                /* Respiratory */
                const respLines: string[] = [];
                respLines.push('Respiratory System:');
                const distress: string[] = [];
                if (v.examIndrawing) distress.push('chest indrawing');
                if (v.examNasalFlaring) distress.push('nasal flaring');
                if (v.examGrunting) distress.push('expiratory grunting');
                if (v.examStridor) distress.push('inspiratory stridor');
                const dText = distress.length ? `Respiratory distress present with ${distress.join(', ')}.` : 'No respiratory distress.';
                const shape = v.chestShape || 'normal';
                respLines.push(`  Inspection: ${dText} Chest shape: ${shape.replace(/_/g, ' ')}.`);
                respLines.push(`  Palpation: Trachea central. Chest expansion symmetrical.`);
                const perc = v.examDullness ? 'dullness noted' : v.examHyperResonance ? 'hyperresonance noted' : 'resonant throughout';
                respLines.push(`  Percussion: ${perc}.`);
                const auscult: string[] = [];
                auscult.push(`Breath sounds: ${v.airEntry || 'vesicular'}`);
                if (v.examWheeze) auscult.push('wheeze');
                if (v.examCrackles) auscult.push('crackles/crepitations');
                if (v.examBronchial) auscult.push('bronchial breathing');
                if (v.examReducedBS) auscult.push('reduced breath sounds');
                respLines.push(`  Auscultation: ${auscult.join('; ')}.`);

                /* CVS */
                const cvsParts: string[] = ['Cardiovascular System:'];
                cvsParts.push(`  Heart sounds: ${v.examHeartSounds || 'normal'}.`);
                if (v.examMurmur) cvsParts.push(`  Murmur: ${v.examMurmur}${v.examMurmurGrade ? ` (Grade ${v.examMurmurGrade}/6)` : ''}.`);

                /* Abdomen */
                const abdParts: string[] = ['Abdomen:'];
                const abdFindings: string[] = [];
                if (v.examAbdDistension) abdFindings.push('distended');
                if (v.examHepatomegaly) abdFindings.push('hepatomegaly');
                if (v.examSplenomegaly) abdFindings.push('splenomegaly');
                if (v.examTenderness) abdFindings.push(`tenderness: ${v.examTenderness}`);
                abdParts.push(`  ${abdFindings.length ? abdFindings.join(', ') : 'Soft, non-tender, no organomegaly.'}`);

                /* CNS */
                const cnsParts: string[] = ['Central Nervous System:'];
                cnsParts.push(`  AVPU: ${v.avpu || 'Alert'}. Tone: ${v.examCnsTone || 'normal'}. Reflexes: ${v.examCnsReflexes || 'normal'}.`);
                if (v.examFontanelle) cnsParts.push(`  Fontanelle: ${v.examFontanelle}.`);
                if (v.examNeckStiffness) cnsParts.push(`  Meningeal irritation: neck stiffness present.`);

                return <div style={para}>
                  <div>{respLines.join(' ')}</div>
                  <div style={{marginTop:4}}>{cvsParts.join(' ')}</div>
                  <div style={{marginTop:4}}>{abdParts.join(' ')}</div>
                  <div style={{marginTop:4}}>{cnsParts.join(' ')}</div>
                </div>;
              })()}
            </div>

            {/* --- 15. IMPRESSION & DIFFERENTIALS --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>15. Impression &amp; Differentials</div>
              {(() => {
                const parts: string[] = [];
                const topDiff = differentials[0];
                if (topDiff) {
                  parts.push(`Primary Diagnosis: ${topDiff.disease.name} (confidence: ${topDiff.confidence}, score: ${topDiff.rawScore}).`);
                  parts.push(`Supporting evidence: ${(form as any).summary?.ddxNotes || 'Based on history, examination, and available data.'}`);
                  if (differentials.length > 1) {
                    const others = differentials.slice(1).map(d => `${d.disease.name} (${d.confidence})`);
                    parts.push(`Differentials to consider: ${others.join('; ')}.`);
                  }
                } else {
                  parts.push('No differential diagnosis generated. Consider completing the clinical assessment.');
                }
                if (redFlags.length) {
                  parts.push(`Red flags identified: ${redFlags.join('; ')}.`);
                }
                if (muacRisk) parts.push('Nutritional risk is significant and must be factored into management decisions, including cautious fluid therapy and nutritional rehabilitation.');
                return <div style={para}>{parts.join(' ')}</div>;
              })()}
            </div>

            {/* --- 16. MANAGEMENT PLAN --- */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>16. Management Plan</div>
              <div style={para}>
                {(() => {
                  const planParts: string[] = [];
                  if (plan.diagnosisSpecific.length) {
                    plan.diagnosisSpecific.forEach(ds => {
                      planParts.push(`${ds.diseaseName}${ds.severity ? ` (${ds.severity})` : ''}: ${ds.steps.join('; ')}`);
                    });
                  }
                  if (plan.investigations.length) planParts.push(`Investigations: ${plan.investigations.join('; ')}`);
                  if (plan.supportiveCare.length) planParts.push(`Supportive care: ${plan.supportiveCare.join('; ')}`);
                  planParts.push(`Monitoring: ${plan.monitoring}`);
                  planParts.push(`Follow-up: ${plan.followUp}`);
                  planParts.push(`Safety netting: ${plan.safetyNetting}`);
                  if (plan.healthEducation) planParts.push(`Health education: ${plan.healthEducation}`);
                  return planParts.join(' | ');
                })()}
              </div>
            </div>

          </div>

          {/* ---------- RIGHT COLUMN: QUICK SUMMARY ---------- */}
          <div style={{flex:isMobile?'1':'0 0 30%',minWidth:0}}>
            <div style={{background:t.surfaceAlt,borderRadius:12,border:`1px solid ${t.border}`,padding:20,position:'sticky',top:20}}>
              <div style={{fontSize:13,fontWeight:700,color:t.text,marginBottom:16,textTransform:'uppercase',letterSpacing:'0.08em'}}>Clinical Summary</div>

              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,color:t.textMuted,textTransform:'uppercase',marginBottom:4}}>Severity</div>
                <div style={{display:'inline-block',padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:700,background:severityColor+'20',color:severityColor,border:`1px solid ${severityColor}`}}>
                  {severityLevel}
                </div>
              </div>

              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,color:t.textMuted,textTransform:'uppercase',marginBottom:4}}>Primary Diagnosis</div>
                <div style={{fontSize:13,fontWeight:600,color:t.text}}>{topDxName}</div>
              </div>

              {redFlags.length > 0 && <div style={{marginBottom:14}}>
                <div style={{fontSize:10,color:t.danger,textTransform:'uppercase',marginBottom:4}}>⚠ Red Flags</div>
                <ul style={{margin:0,padding:'0 0 0 14px',fontSize:11,color:t.danger,lineHeight:1.6}}>
                  {redFlags.map((rf, i) => <li key={i}>{rf}</li>)}
                </ul>
              </div>}

              <div>
                <div style={{fontSize:10,color:t.textMuted,textTransform:'uppercase',marginBottom:6}}>Key Actions</div>
                <div style={{fontSize:11,color:t.text,lineHeight:1.6}}>
                  {plan.investigations.length > 0 && <div>• Investigations: {plan.investigations.length} pending</div>}
                  {plan.diagnosisSpecific.length > 0 && <div>• Disease-specific therapy indicated</div>}
                  <div>• {plan.monitoring}</div>
                  <div>• {plan.followUp}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {noteEdited && <div style={{marginTop:12,fontSize:11,color:t.warn,textAlign:'center'}}>
          ⚠ Note has been manually edited. Click "Regenerate from Form" to restore auto-generated version.
        </div>}
      </Card>

      {form.complaints.length > 0 && <details style={{marginTop:20,background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,cursor:'pointer'}}>
        <summary style={{padding:'16px 24px',fontWeight:600,fontSize:14,color:t.text,display:'flex',alignItems:'center',gap:8,cursor:'pointer',listStyle:'none'}}>
          <span style={{color:t.accent}}>📋</span> View Management Plan (Structured)
        </summary>
        <div style={{padding:'0 24px 24px',display:'flex',flexDirection:'column',gap:20}}>
          {plan.diagnosisSpecific.map(ds=>(
            <div key={ds.diseaseName} style={{background:t.surfaceAlt,borderRadius:10,padding:16,border:`1px solid ${t.border}`}}>
              <div style={{fontSize:13,fontWeight:700,color:t.text,marginBottom:4}}>{ds.diseaseName}</div>
              <div style={{fontSize:11,color:t.textSub,marginBottom:10}}>Severity: {ds.severity || 'Not assessed'}</div>
              {ds.steps.length>0&&<ul style={{margin:0,padding:'0 0 0 18px',fontSize:12,color:t.text,lineHeight:1.7}}>
                {ds.steps.map((s,i)=><li key={i}>{s}</li>)}
              </ul>}
              {ds.steps.length===0&&<div style={{fontSize:11,color:t.textMuted}}>No disease-specific protocol available.</div>}
            </div>
          ))}

          <div style={{background:t.surfaceAlt,borderRadius:10,padding:16,border:`1px solid ${t.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:t.text,marginBottom:8}}>Investigations</div>
            {plan.investigations.length>0
              ? <ul style={{margin:0,padding:'0 0 0 18px',fontSize:12,color:t.text,lineHeight:1.7}}>{plan.investigations.map((inv,i)=><li key={i}>{inv}</li>)}</ul>
              : <div style={{fontSize:11,color:t.textMuted}}>None specified by current differentials.</div>}
          </div>

          <div style={{background:t.surfaceAlt,borderRadius:10,padding:16,border:`1px solid ${t.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:t.text,marginBottom:8}}>Supportive Care</div>
            <ul style={{margin:0,padding:'0 0 0 18px',fontSize:12,color:t.text,lineHeight:1.7}}>
              {plan.supportiveCare.map((s,i)=><li key={i}>{s}</li>)}
            </ul>
          </div>

          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:14}}>
            <div style={{background:t.surfaceAlt,borderRadius:10,padding:16,border:`1px solid ${t.border}`}}>
              <div style={{fontSize:12,fontWeight:700,color:t.text,marginBottom:6}}>Monitoring</div>
              <div style={{fontSize:12,color:t.text,margin:0}}>{plan.monitoring}</div>
            </div>
            <div style={{background:t.surfaceAlt,borderRadius:10,padding:16,border:`1px solid ${t.border}`}}>
              <div style={{fontSize:12,fontWeight:700,color:t.text,marginBottom:6}}>Follow-up</div>
              <div style={{fontSize:12,color:t.text,margin:0}}>{plan.followUp}</div>
            </div>
          </div>

          <div style={{background:t.dangerBg,borderRadius:10,padding:16,border:`1px solid ${t.danger}40`}}>
            <div style={{fontSize:12,fontWeight:700,color:t.danger,marginBottom:8}}>Safety Netting — Return Immediately If</div>
            <div style={{fontSize:12,color:t.danger,whiteSpace:'pre-wrap',margin:0}}>{plan.safetyNetting}</div>
          </div>

          {plan.healthEducation.trim()&&(
            <div style={{background:t.surfaceAlt,borderRadius:10,padding:16,border:`1px solid ${t.border}`}}>
              <div style={{fontSize:12,fontWeight:700,color:t.text,marginBottom:8}}>Health Education</div>
              <div style={{fontSize:12,color:t.text,whiteSpace:'pre-wrap',margin:0}}>{plan.healthEducation}</div>
            </div>
          )}
        </div>
      </details>}
    </>;
  }

  // -- PAGE RENDERERS (all rendered to satisfy Rules of Hooks; inactive hidden) ---
  return (
    <>
      <div style={{ display: phaseIdx === 0 ? '' : 'none' }}>{renderBiodata()}</div>
      <div style={{ display: phaseIdx === 1 ? '' : 'none' }}>{renderComplaints()}</div>
      <div style={{ display: phaseIdx === 2 ? '' : 'none' }}>{renderHpi()}</div>
      <div style={{ display: phaseIdx === 3 ? '' : 'none' }}>{renderPmh()}</div>
      <div style={{ display: phaseIdx === 4 ? '' : 'none' }}>{renderBirthHistory()}</div>
      <div style={{ display: phaseIdx === 5 ? '' : 'none' }}>{renderDevelopment()}</div>
      <div style={{ display: phaseIdx === 6 ? '' : 'none' }}>{renderImmunization()}</div>
      <div style={{ display: phaseIdx === 7 ? '' : 'none' }}>{renderNutrition()}</div>
      <div style={{ display: phaseIdx === 8 ? '' : 'none' }}>{renderFamily()}</div>
      <div style={{ display: phaseIdx === 9 ? '' : 'none' }}>{renderRos()}</div>
      <div style={{ display: phaseIdx === 10 ? '' : 'none' }}>{renderExamGeneral()}</div>
      <div style={{ display: phaseIdx === 11 ? '' : 'none' }}>{renderExamSystemic()}</div>
      <div style={{ display: phaseIdx === 12 ? '' : 'none' }}>{renderHistorySummary()}</div>
      <div style={{ display: phaseIdx === 13 ? '' : 'none' }}>{renderImpression()}</div>
      <div style={{ display: phaseIdx === 14 ? '' : 'none' }}>{renderManagement()}</div>
      <div style={{ display: phaseIdx === 15 ? '' : 'none' }}>{renderNote()}</div>
    </>
  );
}
