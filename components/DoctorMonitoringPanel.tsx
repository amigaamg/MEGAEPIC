'use client';
// ═══════════════════════════════════════════════════════════════════════════════
// components/DoctorMonitoringPanel.tsx
// Full clinical workstation: monitoring, notes, prescriptions, referrals, labs,
// imaging, patient logging, alerts, consent-gated shared records
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, getDocs,
  serverTimestamp, orderBy, limit, doc, Timestamp, setDoc, deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend, ReferenceArea, Dot, LineChart, Line,
} from 'recharts';
import { TOOL_CONFIGS, ToolAssignment, ToolReading } from '@/lib/diseaseTools';
import { evaluateReading } from '@/lib/triageRules';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ClinicalNote {
  id: string; patientId: string; doctorId: string; doctorName: string;
  type: 'soap' | 'progress' | 'discharge' | 'referral' | 'procedure';
  content: { subjective?: string; objective?: string; assessment?: string; plan?: string; text?: string };
  toolType?: string; tags: string[]; private: boolean;
  createdAt: any; updatedAt?: any;
}
interface Prescription {
  id: string; patientId: string; doctorId: string; doctorName: string;
  medication: string; dosage: string; frequency: string; duration: string;
  route: string; indication: string; instructions: string; warnings: string;
  refills: number; active: boolean; toolType?: string;
  startDate: any; endDate?: any; createdAt: any;
}
interface LabOrder {
  id: string; patientId: string; doctorId: string; doctorName: string;
  tests: string[]; priority: 'routine' | 'urgent' | 'stat';
  clinicalInfo: string; fasting: boolean; status: 'ordered' | 'collected' | 'resulted' | 'reviewed';
  results?: { test: string; value: string; unit: string; flag: string; range: string }[];
  toolType?: string; createdAt: any; resultedAt?: any;
}
interface ImagingOrder {
  id: string; patientId: string; doctorId: string; doctorName: string;
  modality: 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'Echo' | 'ECG' | 'PFT' | 'Other';
  region: string; indication: string; priority: 'routine' | 'urgent' | 'emergency';
  contrast?: boolean; status: 'ordered' | 'scheduled' | 'completed' | 'reported';
  report?: string; toolType?: string; createdAt: any;
}
interface Referral {
  id: string; patientId: string; fromDoctorId: string; fromDoctorName: string;
  toDoctorId?: string; toDoctorName?: string;
  specialty: string; reason: string; urgency: 'routine' | 'urgent' | 'emergency';
  clinicalSummary: string; status: 'pending' | 'accepted' | 'completed' | 'declined';
  toolType?: string; createdAt: any;
}
interface PatientConsent {
  id: string; patientId: string; doctorId: string;
  tools: string[]; sections: string[]; grantedAt: any; expiresAt?: any; active: boolean;
}
interface DocService { id: string; doctorId: string; doctorName: string; specialties: string[]; title: string; }

// ─── Tool IDs ────────────────────────────────────────────────────────────────
const ALL_TOOL_IDS = [
  'bp_monitor','glucose_tracker','hba1c_tracker','peak_flow',
  'spo2_monitor','weight_tracker','pain_scale','mood_tracker',
  'medication_adherence','ecg_monitor',
];

// ─── Colours ─────────────────────────────────────────────────────────────────
const LC: Record<string,string> = { normal:'#10b981', watch:'#f59e0b', video:'#6366f1', clinic:'#f97316', hospital:'#ef4444' };
const LB: Record<string,string> = { normal:'#f0fdf4', watch:'#fffbeb', video:'#eef2ff', clinic:'#fff7ed', hospital:'#fef2f2' };

// ─── Formatters ──────────────────────────────────────────────────────────────
const fmtDate  = (ts:any) => { if(!ts)return'—'; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}); };
const fmtShort = (ts:any) => { if(!ts)return''; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('en-KE',{day:'numeric',month:'short'}); };
const fmtTime  = (ts:any) => { if(!ts)return''; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}); };
const fmtAgo   = (ts:any) => {
  if(!ts)return''; const d=ts?.toDate?ts.toDate():new Date(ts); const s=Math.floor((Date.now()-d.getTime())/1000);
  if(s<60)return'Just now'; if(s<3600)return`${Math.floor(s/60)}m ago`;
  if(s<86400)return`${Math.floor(s/3600)}h ago`; return fmtDate(ts);
};

// ─── Clinical guidance (same as patient dashboard) ──────────────────────────
const GUIDANCE: Record<string,{
  targets: { label:string; ideal:string; acceptable:string; danger:string }[];
  chartRef: { low?:number; high?:number; target?:number; dangerHigh?:number; dangerLow?:number; unit:string; fields:string[] };
  complications: { name:string; icon:string; signs:string; prevent:string; action:string }[];
  education: { tip:string; icon:string; cat:string }[];
}> = {
  bp_monitor: {
    targets:[
      { label:'Systolic',  ideal:'< 120 mmHg',    acceptable:'120–139 mmHg', danger:'≥ 160 mmHg' },
      { label:'Diastolic', ideal:'< 80 mmHg',     acceptable:'80–89 mmHg',  danger:'≥ 100 mmHg' },
      { label:'Pulse',     ideal:'60–100 bpm',    acceptable:'50–110 bpm',  danger:'> 120 or < 50 bpm' },
    ],
    chartRef:{ low:90, high:180, target:120, dangerHigh:160, dangerLow:80, unit:'mmHg', fields:['systolic','diastolic'] },
    complications:[
      { name:'Stroke', icon:'🧠', signs:'Sudden severe headache, facial drooping, arm weakness', prevent:'Maintain BP < 130/80', action:'EMERGENCY — 999' },
      { name:'Hypertensive Crisis', icon:'🚨', signs:'BP ≥ 180/120 with symptoms', prevent:'Medication compliance', action:'EMERGENCY — A&E' },
    ],
    education:[ { tip:'Measure at same time daily, before medications', icon:'⏰', cat:'monitoring' } ],
  },
  glucose_tracker: {
    targets:[
      { label:'Fasting', ideal:'4.0–5.5 mmol/L', acceptable:'5.6–7.0 mmol/L', danger:'> 10.0 or < 3.5 mmol/L' },
      { label:'Post-meal (2h)', ideal:'< 7.8 mmol/L', acceptable:'7.8–11.0 mmol/L', danger:'> 13.9 mmol/L' },
    ],
    chartRef:{ low:3.9, high:15, target:6.5, dangerHigh:13.9, dangerLow:3.0, unit:'mmol/L', fields:['value'] },
    complications:[
      { name:'DKA', icon:'🚨', signs:'Vomiting, fruity breath, deep breathing', prevent:'Never stop insulin when sick', action:'EMERGENCY' },
      { name:'Hypoglycaemia', icon:'⬇️', signs:'Shaking, sweating, BG <3.9', prevent:'Never skip meals', action:'15g fast sugar immediately' },
    ],
    education:[ { tip:'Log with time and meal context', icon:'📊', cat:'monitoring' } ],
  },
  hba1c_tracker: {
    targets:[ { label:'HbA1c', ideal:'< 48 mmol/mol (< 6.5%)', acceptable:'48–58 mmol/mol', danger:'> 75 mmol/mol (> 10%)' } ],
    chartRef:{ low:4, high:14, target:6.5, dangerHigh:10, unit:'%', fields:['value'] },
    complications:[ { name:'Microvascular Disease', icon:'🩸', signs:'Eyes, kidneys, nerves affected', prevent:'Every 1% reduction = 25-35% fewer complications', action:'Annual screening' } ],
    education:[ { tip:'Test every 3 months until stable', icon:'🔬', cat:'monitoring' } ],
  },
  peak_flow: {
    targets:[ { label:'% Predicted', ideal:'≥ 80% of personal best', acceptable:'60–79%', danger:'< 60% — emergency' } ],
    chartRef:{ low:100, high:800, target:500, dangerLow:300, unit:'L/min', fields:['value'] },
    complications:[ { name:'Acute Severe Asthma', icon:'🚨', signs:'PEF <50%, unable to complete sentences', prevent:'Preventer inhaler daily', action:'999 — 10 puffs salbutamol' } ],
    education:[ { tip:'Blow 3 times, record best of 3', icon:'🌬️', cat:'monitoring' } ],
  },
  spo2_monitor: {
    targets:[ { label:'SpO₂', ideal:'95–100%', acceptable:'94%', danger:'< 92% — emergency' } ],
    chartRef:{ low:80, high:100, target:96, dangerLow:92, unit:'%', fields:['spo2'] },
    complications:[ { name:'Respiratory Failure', icon:'🫁', signs:'SpO₂ <88%, cyanosis, confusion', prevent:'O₂ therapy compliance', action:'999' } ],
    education:[ { tip:'Measure after 5 min rest, warm hands', icon:'🤲', cat:'monitoring' } ],
  },
  weight_tracker: {
    targets:[ { label:'BMI', ideal:'18.5–24.9 kg/m²', acceptable:'25–29.9 kg/m²', danger:'≥ 35 kg/m²' } ],
    chartRef:{ unit:'kg', fields:['weight'] },
    complications:[ { name:'Decompensated Heart Failure', icon:'💧', signs:'>2kg in 24h, breathlessness', prevent:'Daily weight. Fluid restriction', action:'URGENT — A&E if breathless at rest' } ],
    education:[ { tip:'Same time daily, morning after toilet', icon:'⏰', cat:'monitoring' } ],
  },
  pain_scale: {
    targets:[ { label:'Pain Score', ideal:'0–3 (manageable)', acceptable:'4–6 (moderate)', danger:'7–10 (severe)' } ],
    chartRef:{ low:0, high:10, target:3, dangerHigh:7, unit:'/10', fields:['score'] },
    complications:[ { name:'Opioid Dependency', icon:'⚠️', signs:'Increasing doses, withdrawal symptoms', prevent:'Regular pain review, lowest effective dose', action:'Pain clinic review' } ],
    education:[ { tip:'Rate usual pain last 24h, not worst moment', icon:'📊', cat:'monitoring' } ],
  },
  mood_tracker: {
    targets:[ { label:'PHQ-9', ideal:'0–4 (minimal)', acceptable:'5–9 (mild)', danger:'≥ 15 (moderately severe)' } ],
    chartRef:{ low:0, high:27, target:5, dangerHigh:15, unit:'PHQ-9', fields:['phq9'] },
    complications:[ { name:'Suicidal Crisis', icon:'🆘', signs:'Thoughts of self-harm or ending life', prevent:'Regular monitoring, safety planning', action:'999 / Befrienders Kenya: 0800 723 253' } ],
    education:[ { tip:'PHQ-9 weekly at same time', icon:'📅', cat:'monitoring' } ],
  },
  medication_adherence: {
    targets:[ { label:'Adherence', ideal:'≥ 95%', acceptable:'80–94%', danger:'< 80%' } ],
    chartRef:{ unit:'compliance', fields:['taken'] },
    complications:[ { name:'Uncontrolled Disease', icon:'⚠️', signs:'Parameters worsening despite prescriptions', prevent:'Pill organiser, phone alarms', action:'Simplify regimen' } ],
    education:[ { tip:'Weekly pill organiser, attach to habits', icon:'💊', cat:'medication' } ],
  },
  ecg_monitor: {
    targets:[ { label:'Resting HR', ideal:'60–100 bpm', acceptable:'50–110 bpm', danger:'> 120 or < 45 bpm' } ],
    chartRef:{ low:40, high:150, target:75, dangerHigh:120, dangerLow:45, unit:'bpm', fields:['heartRate'] },
    complications:[ { name:'Atrial Fibrillation', icon:'〰️', signs:'Irregular pulse, palpitations', prevent:'Rate control, anticoagulation', action:'URGENT if new AF with fast rate' } ],
    education:[ { tip:'Measure after 5 min rest, check regularity', icon:'⏰', cat:'monitoring' } ],
  },
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function CTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#0d1b2a', borderRadius:10, padding:'10px 14px', color:'#fff', fontSize:11, boxShadow:'0 8px 24px rgba(0,0,0,.35)', minWidth:140 }}>
      <div style={{ fontWeight:700, color:'#64748b', fontSize:9, textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>{label}</div>
      {payload.map((p:any,i:number) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:p.stroke||p.color||p.fill }} />
          <span style={{ color:'#94a3b8' }}>{p.name}:</span>
          <span style={{ fontFamily:'monospace', fontWeight:800, color:'#fff' }}>{typeof p.value==='number'?p.value.toFixed(1):p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, color='#0aaa76', action, badge }: { icon:string; title:string; subtitle?:string; color?:string; action?:React.ReactNode; badge?:number }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, paddingBottom:10, borderBottom:'1.5px solid #e8eef5' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{icon}</div>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:14, fontWeight:800, color:'#0d1b2a' }}>{title}</span>
            {badge !== undefined && badge > 0 && <span style={{ background:color, color:'#fff', borderRadius:99, fontSize:9, fontWeight:700, padding:'2px 7px' }}>{badge}</span>}
          </div>
          {subtitle && <div style={{ fontSize:10, color:'#8fa3bd', marginTop:1 }}>{subtitle}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Assign Tool Modal ────────────────────────────────────────────────────────
function AssignToolModal({ patientId, doctor, existingIds, onClose }: { patientId:string; doctor:{uid:string;name:string}; existingIds:string[]; onClose:()=>void }) {
  const [selected, setSelected] = useState<string>('');
  const [freq, setFreq]         = useState('Daily');
  const [instr, setInstr]       = useState('');
  const [targets, setTargets]   = useState('');
  const [saving, setSave]       = useState(false);
  const [done, setDone]         = useState(false);

  const available = ALL_TOOL_IDS.filter(id => !existingIds.includes(id));

  const save = async () => {
    if (!selected) return;
    setSave(true);
    const cfg = TOOL_CONFIGS[selected];
    await addDoc(collection(db,'toolAssignments'), {
      patientId, doctorId: doctor.uid, doctorName: doctor.name,
      toolType: selected, toolName: cfg?.name, active: true,
      frequency: freq, instructions: instr, targets,
      assignedAt: serverTimestamp(),
    });
    await addDoc(collection(db,'alerts'), {
      patientId, doctorId: doctor.uid, type:'assignment',
      title:`🩺 Dr. ${doctor.name} assigned: ${cfg?.name}`,
      message:`You have been assigned a new monitoring tool: ${cfg?.name}. Frequency: ${freq}. ${instr}`,
      read: false, createdAt: serverTimestamp(), urgency:'routine',
    });
    setSave(false); setDone(true);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:480, boxShadow:'0 32px 80px rgba(0,0,0,.22)', overflow:'hidden' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:'linear-gradient(135deg,#0d1b2a,#0f3d2e)', padding:'20px 24px', color:'#fff' }}>
          <div style={{ fontSize:20, marginBottom:6 }}>🩺</div>
          <div style={{ fontSize:16, fontWeight:800 }}>{done ? 'Tool Assigned!' : 'Assign Monitoring Tool'}</div>
          <div style={{ fontSize:11, opacity:.7, marginTop:2 }}>Activate remote monitoring for this patient</div>
        </div>
        {done ? (
          <div style={{ padding:'28px 24px', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#10b981', marginBottom:6 }}>Tool assigned successfully</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>The patient has been notified and can now log readings.</div>
            <button onClick={onClose} style={{ padding:'11px 28px', background:'#0aaa76', border:'none', color:'#fff', borderRadius:12, fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Done</button>
          </div>
        ) : (
          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:8 }}>Select Tool</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxHeight:240, overflowY:'auto' }}>
                {available.map(id => { const cfg=TOOL_CONFIGS[id]; return (
                  <div key={id} onClick={()=>setSelected(id)} style={{ padding:'10px 12px', border:`2px solid ${selected===id?'#0aaa76':'#e2e9f3'}`, borderRadius:11, cursor:'pointer', background:selected===id?'#f0fdf4':'#fff', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:18 }}>{cfg?.icon}</span>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:'#0d1b2a' }}>{cfg?.name}</div>
                      <div style={{ fontSize:9, color:'#8fa3bd' }}>{cfg?.frequency}</div>
                    </div>
                  </div>
                )})}
                {available.length===0 && <div style={{ gridColumn:'1/-1', fontSize:12, color:'#8fa3bd', textAlign:'center', padding:16 }}>All tools already assigned</div>}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Frequency</label>
                <select value={freq} onChange={e=>setFreq(e.target.value)} style={{ width:'100%', padding:'9px 10px', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', background:'#f8fafc' }}>
                  {['Daily','Twice daily','3x daily','Weekly','After meals','Before meals','As needed'].map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Target Values</label>
                <input value={targets} onChange={e=>setTargets(e.target.value)} placeholder="e.g. BP < 130/80" style={{ width:'100%', padding:'9px 10px', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', background:'#f8fafc' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Instructions for Patient</label>
              <textarea value={instr} onChange={e=>setInstr(e.target.value)} rows={2} placeholder="Specific instructions, precautions, what to watch for…" style={{ width:'100%', padding:'9px 10px', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', background:'#f8fafc', resize:'vertical' }} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={onClose} style={{ flex:1, padding:'11px', background:'transparent', border:'1.5px solid #e2e9f3', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>Cancel</button>
              <button onClick={save} disabled={!selected||saving} style={{ flex:2, padding:'12px', background:'#0aaa76', color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:!selected?.5:1 }}>
                {saving?'Assigning…':'🩺 Assign Tool'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Log Reading Modal ────────────────────────────────────────────────────────
function LogReadingModal({ assignment, patientId, doctor, onClose }: { assignment:ToolAssignment; patientId:string; doctor:{uid:string;name:string}; onClose:()=>void }) {
  const config = TOOL_CONFIGS[assignment.toolType];
  const [form, setForm]   = useState<Record<string,any>>({});
  const [note, setNote]   = useState('');
  const [saving, setSave] = useState(false);

  const set = (k:string, v:any) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    setSave(true);
    try {
      const tr = evaluateReading(config.id, form);
      await addDoc(collection(db,'toolReadings'), {
        toolType:config.id, patientId, doctorId:doctor.uid,
        assignmentId:assignment.id, enteredBy:'doctor', doctorName:doctor.name,
        data:{...form}, recordedAt:serverTimestamp(), doctorNote:note,
        triage:{ level:tr.level, label:tr.label, message:tr.message, urgency:tr.urgency, alertDoctor:tr.alertDoctor, alertPatient:tr.alertPatient },
        doctorReviewed:true,
      });
      await addDoc(collection(db,'alerts'), {
        patientId, doctorId:doctor.uid, type:'reading',
        title:`📋 Dr. ${doctor.name} recorded your ${config.name}`,
        message: note?`${tr.message} — Note: ${note}`:tr.message,
        read:false, createdAt:serverTimestamp(), urgency:tr.urgency||'routine',
      });
      onClose();
    } catch(e){ console.error(e); }
    setSave(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:440, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.22)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:`linear-gradient(135deg,${config.color},${config.color}bb)`, padding:'18px 22px', color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:22, marginBottom:4 }}>{config.icon}</div>
            <div style={{ fontSize:15, fontWeight:800 }}>Log {config.name}</div>
            <div style={{ fontSize:11, opacity:.8 }}>Recording on behalf of patient</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,.2)', border:'none', color:'#fff', width:30, height:30, borderRadius:8, cursor:'pointer', fontSize:14 }}>✕</button>
        </div>
        <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:12, maxHeight:'60vh', overflowY:'auto' }}>
          {config.fields.map((f:any) => (
            <div key={f.key}>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span>{f.label}{f.required?' *':''}</span>
                {f.unit&&<span style={{ color:config.color }}>{f.unit}</span>}
              </label>
              {f.type==='number'&&<input type="number" min={f.min} max={f.max} step={f.step} value={form[f.key]??''} placeholder={`${f.min??0}–${f.max??999}`} onChange={e=>set(f.key,e.target.value===''?undefined:Number(e.target.value))} style={{ width:'100%', padding:'10px 12px', background:'#f8fafc', border:`1.5px solid ${config.color}40`, borderRadius:9, fontSize:14, fontFamily:'inherit', outline:'none' }} />}
              {f.type==='select'&&<select value={form[f.key]??''} onChange={e=>set(f.key,e.target.value)} style={{ width:'100%', padding:'10px 12px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:13, fontFamily:'inherit', outline:'none' }}><option value="">Select…</option>{f.options?.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}</select>}
              {f.type==='text'&&<input type="text" value={form[f.key]??''} placeholder={f.placeholder} onChange={e=>set(f.key,e.target.value)} style={{ width:'100%', padding:'10px 12px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:14, fontFamily:'inherit', outline:'none' }} />}
            </div>
          ))}
          <div>
            <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Clinical Note (visible to patient)</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Interpretation, advice, next steps…" style={{ width:'100%', padding:'10px 12px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical' }} />
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ flex:1, padding:'11px', background:'transparent', border:'1.5px solid #e2e9f3', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex:2, padding:'12px', background:`linear-gradient(135deg,${config.color},#06b6d4)`, color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              {saving?'Logging…':'📋 Log & Notify'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Write Prescription Modal ─────────────────────────────────────────────────
function PrescriptionModal({ patientId, doctor, toolType, onClose }: { patientId:string; doctor:{uid:string;name:string}; toolType?:string; onClose:()=>void }) {
  const [form, setForm] = useState({
    medication:'', dosage:'', frequency:'', duration:'', route:'Oral',
    indication:'', instructions:'', warnings:'', refills:0,
  });
  const [saving, setSave] = useState(false); const [done, setDone] = useState(false);
  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    if (!form.medication||!form.dosage) return;
    setSave(true);
    const endDate = form.duration ? Timestamp.fromDate(new Date(Date.now()+parseDuration(form.duration))) : null;
    await addDoc(collection(db,'prescriptions'), {
      patientId, doctorId:doctor.uid, doctorName:doctor.name,
      ...form, active:true, toolType:toolType||null,
      startDate:serverTimestamp(), endDate, createdAt:serverTimestamp(),
    });
    await addDoc(collection(db,'alerts'), {
      patientId, doctorId:doctor.uid, type:'prescription',
      title:`💊 New Prescription: ${form.medication}`,
      message:`Dr. ${doctor.name} prescribed ${form.medication} ${form.dosage} — ${form.frequency}. ${form.instructions}`,
      read:false, createdAt:serverTimestamp(), urgency:'routine',
    });
    setSave(false); setDone(true);
  };

  const parseDuration = (d:string) => {
    const n=parseInt(d); if(d.includes('week'))return n*7*86400000; if(d.includes('month'))return n*30*86400000; return n*86400000;
  };

  const ROUTES = ['Oral','Sublingual','Topical','Inhaled','IV','IM','SC','Transdermal','Rectal','Nasal'];
  const FREQS = ['Once daily','Twice daily','Three times daily','Four times daily','Every 8 hours','Every 12 hours','Every 6 hours','At night (nocte)','In the morning','As needed (PRN)'];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:540, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.22)', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', padding:'20px 24px', color:'#fff', position:'sticky', top:0, zIndex:1 }}>
          <div style={{ fontSize:20, marginBottom:6 }}>💊</div>
          <div style={{ fontSize:16, fontWeight:800 }}>{done?'Prescription Sent!':'Write Prescription'}</div>
          <div style={{ fontSize:11, opacity:.7, marginTop:2 }}>Electronic prescription — delivered to patient instantly</div>
        </div>
        {done ? (
          <div style={{ padding:'28px 24px', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#6366f1', marginBottom:6 }}>Prescription issued</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>Patient has been notified. The prescription is now in their health record.</div>
            <button onClick={onClose} style={{ padding:'11px 28px', background:'#6366f1', border:'none', color:'#fff', borderRadius:12, fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Done</button>
          </div>
        ) : (
          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { k:'medication', label:'Medication / Drug Name *', placeholder:'e.g. Amlodipine' },
                { k:'dosage', label:'Dosage / Strength *', placeholder:'e.g. 10mg' },
                { k:'indication', label:'Indication / Diagnosis', placeholder:'e.g. Hypertension' },
                { k:'duration', label:'Duration', placeholder:'e.g. 30 days, 3 months' },
              ].map(({k,label,placeholder})=>(
                <div key={k}>
                  <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>{label}</label>
                  <input value={(form as any)[k]} onChange={e=>set(k,e.target.value)} placeholder={placeholder} style={{ width:'100%', padding:'9px 11px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:13, fontFamily:'inherit', outline:'none' }} />
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <div>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Frequency</label>
                <select value={form.frequency} onChange={e=>set('frequency',e.target.value)} style={{ width:'100%', padding:'9px', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', background:'#f8fafc' }}>
                  <option value="">Select…</option>{FREQS.map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Route</label>
                <select value={form.route} onChange={e=>set('route',e.target.value)} style={{ width:'100%', padding:'9px', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', background:'#f8fafc' }}>
                  {ROUTES.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Refills</label>
                <input type="number" min={0} max={12} value={form.refills} onChange={e=>set('refills',Number(e.target.value))} style={{ width:'100%', padding:'9px', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:13, fontFamily:'inherit', outline:'none', background:'#f8fafc' }} />
              </div>
            </div>
            {[
              { k:'instructions', label:'Dispensing Instructions', placeholder:'e.g. Take with food, avoid alcohol, swallow whole…' },
              { k:'warnings', label:'Warnings / Contraindications', placeholder:'e.g. Avoid in pregnancy, monitor renal function…' },
            ].map(({k,label,placeholder})=>(
              <div key={k}>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>{label}</label>
                <textarea value={(form as any)[k]} onChange={e=>set(k,e.target.value)} rows={2} placeholder={placeholder} style={{ width:'100%', padding:'9px 11px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', resize:'vertical' }} />
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <button onClick={onClose} style={{ flex:1, padding:'11px', background:'transparent', border:'1.5px solid #e2e9f3', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>Cancel</button>
              <button onClick={save} disabled={!form.medication||!form.dosage||saving} style={{ flex:2, padding:'12px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:!form.medication?.5:1 }}>
                {saving?'Issuing…':'💊 Issue Prescription'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lab Order Modal ──────────────────────────────────────────────────────────
function LabOrderModal({ patientId, doctor, toolType, onClose }: { patientId:string; doctor:{uid:string;name:string}; toolType?:string; onClose:()=>void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [priority, setPriority] = useState<'routine'|'urgent'|'stat'>('routine');
  const [clinical, setClinical] = useState('');
  const [fasting, setFasting]   = useState(false);
  const [saving, setSave]       = useState(false);
  const [done, setDone]         = useState(false);

  const LAB_PANELS = {
    'Metabolic': ['FBC (Full Blood Count)','HbA1c','Fasting Glucose','Random Glucose','LFTs (Liver Function)','U&E (Urea & Electrolytes)','eGFR / Creatinine','Urine ACR'],
    'Cardiac': ['Troponin I/T','BNP / NT-proBNP','CK / CK-MB','D-Dimer','Lipid Profile','Homocysteine'],
    'Thyroid & Hormones': ['TSH','Free T4','Free T3','Cortisol (AM)','HbA1c','Insulin Levels'],
    'Haematology': ['FBC','ESR','CRP','INR / PT','APTT','Blood Film','Haematinics (Fe/B12/Folate)'],
    'Renal': ['U&E','Creatinine','eGFR','24h Urine Protein','Urine MC&S','Urine ACR'],
    'Other': ['HIV','Hepatitis B/C Serology','Urine Pregnancy Test','Blood Culture','Sputum MC&S','STI Screen'],
  };

  const toggle = (t:string) => setSelected(s=>s.includes(t)?s.filter(x=>x!==t):[...s,t]);

  const save = async () => {
    if (!selected.length) return;
    setSave(true);
    await addDoc(collection(db,'labOrders'), {
      patientId, doctorId:doctor.uid, doctorName:doctor.name,
      tests:selected, priority, clinicalInfo:clinical, fasting, status:'ordered',
      toolType:toolType||null, createdAt:serverTimestamp(),
    });
    await addDoc(collection(db,'alerts'), {
      patientId, doctorId:doctor.uid, type:'lab',
      title:`🔬 Lab Tests Ordered (${priority.toUpperCase()})`,
      message:`Dr. ${doctor.name} has ordered: ${selected.join(', ')}. ${fasting?'⚠️ FASTING required.':''} ${clinical}`,
      read:false, createdAt:serverTimestamp(), urgency:priority==='stat'?'emergency':priority==='urgent'?'urgent':'routine',
    });
    setSave(false); setDone(true);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:560, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.22)', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:'linear-gradient(135deg,#0891b2,#06b6d4)', padding:'20px 24px', color:'#fff', position:'sticky', top:0, zIndex:1 }}>
          <div style={{ fontSize:20, marginBottom:6 }}>🔬</div>
          <div style={{ fontSize:16, fontWeight:800 }}>{done?'Lab Orders Sent!':'Order Laboratory Tests'}</div>
          <div style={{ fontSize:11, opacity:.7, marginTop:2 }}>Orders sent directly to patient — they will be notified</div>
        </div>
        {done ? (
          <div style={{ padding:'28px 24px', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔬</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#0891b2', marginBottom:6 }}>{selected.length} test{selected.length!==1?'s':''} ordered</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>Patient notified. {fasting?'Fasting required.':''}</div>
            <button onClick={onClose} style={{ padding:'11px 28px', background:'#0891b2', border:'none', color:'#fff', borderRadius:12, fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Done</button>
          </div>
        ) : (
          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:8 }}>Select Tests ({selected.length} selected)</label>
              {Object.entries(LAB_PANELS).map(([panel,tests])=>(
                <div key={panel} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:'#0891b2', textTransform:'uppercase', letterSpacing:.6, marginBottom:6 }}>{panel}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {tests.map(t=>(
                      <button key={t} onClick={()=>toggle(t)} style={{ padding:'5px 10px', borderRadius:99, border:`1.5px solid ${selected.includes(t)?'#0891b2':'#e2e9f3'}`, background:selected.includes(t)?'#e0f7fa':'#fff', fontSize:11, fontWeight:600, cursor:'pointer', color:selected.includes(t)?'#0891b2':'#4a5568', fontFamily:'inherit' }}>
                        {selected.includes(t)?'✓ ':''}{t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Priority</label>
                <div style={{ display:'flex', gap:6 }}>
                  {(['routine','urgent','stat'] as const).map(p=>(
                    <button key={p} onClick={()=>setPriority(p)} style={{ flex:1, padding:'8px 4px', borderRadius:9, border:`1.5px solid ${priority===p?(p==='stat'?'#ef4444':p==='urgent'?'#f97316':'#10b981'):'#e2e9f3'}`, background:priority===p?(p==='stat'?'#fef2f2':p==='urgent'?'#fff7ed':'#f0fdf4'):'#fff', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', color:priority===p?(p==='stat'?'#ef4444':p==='urgent'?'#f97316':'#10b981'):'#8fa3bd', textTransform:'uppercase' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:22 }}>
                <input type="checkbox" checked={fasting} onChange={e=>setFasting(e.target.checked)} id="fasting" style={{ width:16, height:16, accentColor:'#0891b2', cursor:'pointer' }} />
                <label htmlFor="fasting" style={{ fontSize:12, fontWeight:600, color:'#0d1b2a', cursor:'pointer' }}>⚡ Fasting required</label>
              </div>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Clinical Information / Reason</label>
              <textarea value={clinical} onChange={e=>setClinical(e.target.value)} rows={2} placeholder="Clinical context for the lab…" style={{ width:'100%', padding:'9px 11px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', resize:'vertical' }} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={onClose} style={{ flex:1, padding:'11px', background:'transparent', border:'1.5px solid #e2e9f3', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>Cancel</button>
              <button onClick={save} disabled={!selected.length||saving} style={{ flex:2, padding:'12px', background:'linear-gradient(135deg,#0891b2,#06b6d4)', color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:!selected.length?.5:1 }}>
                {saving?'Ordering…':'🔬 Order Tests'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Imaging Order Modal ──────────────────────────────────────────────────────
function ImagingModal({ patientId, doctor, toolType, onClose }: { patientId:string; doctor:{uid:string;name:string}; toolType?:string; onClose:()=>void }) {
  const [form, setForm] = useState({
    modality: 'X-Ray' as ImagingOrder['modality'],
    region:'', indication:'', priority:'routine' as ImagingOrder['priority'],
    contrast:false, specialInstructions:'',
  });
  const [saving, setSave] = useState(false); const [done, setDone] = useState(false);
  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}));

  const MODALITIES: ImagingOrder['modality'][] = ['X-Ray','CT','MRI','Ultrasound','Echo','ECG','PFT','Other'];
  const REGIONS: Record<string,string[]> = {
    'X-Ray':['Chest PA','Chest lateral','Abdomen','Spine (C/T/L)','Pelvis','Knee','Hip','Ankle','Wrist','Skull'],
    'CT':['Head','Chest','Abdomen & Pelvis','Chest-Abdomen-Pelvis','Coronary Angio','Pulmonary Angio (CTPA)','Spine'],
    'MRI':['Brain','Spine','Knee','Shoulder','Cardiac','Abdomen','Pelvis','Whole body'],
    'Ultrasound':['Abdomen','Pelvis','Renal','Thyroid','Carotid Doppler','Lower Limb Doppler','FAST (trauma)'],
    'Echo':['Transthoracic Echo (TTE)','Stress Echo'],
    'ECG':['12-Lead ECG','24h Holter Monitor','Event Monitor'],
    'PFT':['Spirometry','Full PFT','Bronchodilator Reversibility','FeNO'],
    'Other':['Bone Density (DEXA)','Nuclear Medicine','PET-CT','Mammogram'],
  };

  const save = async () => {
    if (!form.modality||!form.region) return;
    setSave(true);
    await addDoc(collection(db,'imagingOrders'), {
      patientId, doctorId:doctor.uid, doctorName:doctor.name,
      ...form, status:'ordered', toolType:toolType||null, createdAt:serverTimestamp(),
    });
    await addDoc(collection(db,'alerts'), {
      patientId, doctorId:doctor.uid, type:'imaging',
      title:`🏥 Imaging Ordered: ${form.modality} — ${form.region}`,
      message:`Dr. ${doctor.name} has ordered: ${form.modality} of ${form.region} (${form.priority}). Indication: ${form.indication}. ${form.contrast?'⚠️ Contrast required.':''}`,
      read:false, createdAt:serverTimestamp(), urgency:form.priority==='emergency'?'emergency':form.priority==='urgent'?'urgent':'routine',
    });
    setSave(false); setDone(true);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:480, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.22)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)', padding:'20px 24px', color:'#fff' }}>
          <div style={{ fontSize:20, marginBottom:6 }}>🏥</div>
          <div style={{ fontSize:16, fontWeight:800 }}>{done?'Imaging Ordered!':'Order Imaging'}</div>
          <div style={{ fontSize:11, opacity:.7, marginTop:2 }}>Radiology & diagnostics referral</div>
        </div>
        {done ? (
          <div style={{ padding:'28px 24px', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🏥</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#7c3aed', marginBottom:6 }}>Imaging order sent</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>Patient has been notified of their imaging order.</div>
            <button onClick={onClose} style={{ padding:'11px 28px', background:'#7c3aed', border:'none', color:'#fff', borderRadius:12, fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Done</button>
          </div>
        ) : (
          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:8 }}>Modality</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {MODALITIES.map(m=>(
                  <button key={m} onClick={()=>set('modality',m)} style={{ padding:'6px 12px', borderRadius:99, border:`1.5px solid ${form.modality===m?'#7c3aed':'#e2e9f3'}`, background:form.modality===m?'#f5f3ff':'#fff', fontSize:11, fontWeight:700, cursor:'pointer', color:form.modality===m?'#7c3aed':'#8fa3bd', fontFamily:'inherit' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Region / Study *</label>
              <select value={form.region} onChange={e=>set('region',e.target.value)} style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:13, fontFamily:'inherit', outline:'none', background:'#f8fafc' }}>
                <option value="">Select region…</option>
                {(REGIONS[form.modality]||[]).map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Priority</label>
                <select value={form.priority} onChange={e=>set('priority',e.target.value)} style={{ width:'100%', padding:'9px', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', background:'#f8fafc' }}>
                  <option value="routine">Routine</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option>
                </select>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:22 }}>
                <input type="checkbox" checked={form.contrast} onChange={e=>set('contrast',e.target.checked)} id="contrast" style={{ width:16, height:16, accentColor:'#7c3aed', cursor:'pointer' }} />
                <label htmlFor="contrast" style={{ fontSize:12, fontWeight:600, color:'#0d1b2a', cursor:'pointer' }}>With contrast</label>
              </div>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Clinical Indication *</label>
              <textarea value={form.indication} onChange={e=>set('indication',e.target.value)} rows={2} placeholder="Clinical reason / suspected diagnosis…" style={{ width:'100%', padding:'9px 11px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', resize:'vertical' }} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={onClose} style={{ flex:1, padding:'11px', background:'transparent', border:'1.5px solid #e2e9f3', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>Cancel</button>
              <button onClick={save} disabled={!form.region||!form.indication||saving} style={{ flex:2, padding:'12px', background:'linear-gradient(135deg,#7c3aed,#a855f7)', color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:!form.region?.5:1 }}>
                {saving?'Ordering…':'🏥 Send Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Referral Modal ───────────────────────────────────────────────────────────
function ReferralModal({ patientId, doctor, toolType, onClose }: { patientId:string; doctor:{uid:string;name:string}; toolType?:string; onClose:()=>void }) {
  const [services, setServices] = useState<DocService[]>([]);
  const [form, setForm] = useState({ specialty:'Cardiology', reason:'', urgency:'routine' as Referral['urgency'], clinicalSummary:'', toDoctorId:'', toDoctorName:'' });
  const [saving, setSave] = useState(false); const [done, setDone] = useState(false);
  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{ getDocs(collection(db,'services')).then(s=>setServices(s.docs.map(d=>({id:d.id,...d.data()} as DocService)))); },[]);

  const SPECIALTIES = ['Cardiology','Endocrinology','Nephrology','Neurology','Ophthalmology','Pulmonology','Psychiatry','Gastroenterology','Orthopaedics','Dermatology','Oncology','Rheumatology','General Surgery','Physiotherapy','Dietitian','Podiatry','Pain Medicine'];

  const save = async () => {
    if (!form.specialty||!form.reason) return;
    setSave(true);
    await addDoc(collection(db,'referrals'), {
      patientId, fromDoctorId:doctor.uid, fromDoctorName:doctor.name,
      toDoctorId:form.toDoctorId||null, toDoctorName:form.toDoctorName||null,
      specialty:form.specialty, reason:form.reason, urgency:form.urgency,
      clinicalSummary:form.clinicalSummary, status:'pending',
      toolType:toolType||null, createdAt:serverTimestamp(),
    });
    await addDoc(collection(db,'alerts'), {
      patientId, doctorId:doctor.uid, type:'referral',
      title:`📋 Referral: ${form.specialty} (${form.urgency})`,
      message:`Dr. ${doctor.name} has referred you to ${form.specialty}. Reason: ${form.reason}. Urgency: ${form.urgency.toUpperCase()}.`,
      read:false, createdAt:serverTimestamp(), urgency:form.urgency==='emergency'?'emergency':form.urgency==='urgent'?'urgent':'routine',
    });
    setSave(false); setDone(true);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:500, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.22)', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:'linear-gradient(135deg,#f97316,#fb923c)', padding:'20px 24px', color:'#fff', position:'sticky', top:0, zIndex:1 }}>
          <div style={{ fontSize:20, marginBottom:6 }}>📋</div>
          <div style={{ fontSize:16, fontWeight:800 }}>{done?'Referral Sent!':'Write Referral'}</div>
          <div style={{ fontSize:11, opacity:.7, marginTop:2 }}>Specialist referral — sent to patient and receiving doctor</div>
        </div>
        {done ? (
          <div style={{ padding:'28px 24px', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#f97316', marginBottom:6 }}>Referral sent successfully</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>Patient and receiving doctor have been notified.</div>
            <button onClick={onClose} style={{ padding:'11px 28px', background:'#f97316', border:'none', color:'#fff', borderRadius:12, fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Done</button>
          </div>
        ) : (
          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Specialty *</label>
                <select value={form.specialty} onChange={e=>set('specialty',e.target.value)} style={{ width:'100%', padding:'9px', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', background:'#f8fafc' }}>
                  {SPECIALTIES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Urgency</label>
                <div style={{ display:'flex', gap:6 }}>
                  {(['routine','urgent','emergency'] as const).map(u=>(
                    <button key={u} onClick={()=>set('urgency',u)} style={{ flex:1, padding:'8px 4px', borderRadius:9, border:`1.5px solid ${form.urgency===u?(u==='emergency'?'#ef4444':u==='urgent'?'#f97316':'#10b981'):'#e2e9f3'}`, background:form.urgency===u?(u==='emergency'?'#fef2f2':u==='urgent'?'#fff7ed':'#f0fdf4'):'#fff', fontSize:9, fontWeight:700, cursor:'pointer', fontFamily:'inherit', color:form.urgency===u?(u==='emergency'?'#ef4444':u==='urgent'?'#f97316':'#10b981'):'#8fa3bd', textTransform:'uppercase' }}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Referral To (optional)</label>
              <select value={form.toDoctorId} onChange={e=>{ const svc=services.find(s=>s.id===e.target.value); set('toDoctorId',e.target.value); set('toDoctorName',svc?.doctorName||''); }} style={{ width:'100%', padding:'9px', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', background:'#f8fafc' }}>
                <option value="">Any available {form.specialty} specialist</option>
                {services.filter(s=>s.specialties?.includes(form.specialty)||s.title?.includes(form.specialty)).map(s=><option key={s.id} value={s.id}>Dr. {s.doctorName} — {s.title}</option>)}
              </select>
            </div>
            {[
              { k:'reason', label:'Reason for Referral *', placeholder:'Primary clinical reason…', rows:2 },
              { k:'clinicalSummary', label:'Clinical Summary', placeholder:'Relevant history, current management, test results, specific questions for specialist…', rows:3 },
            ].map(({k,label,placeholder,rows})=>(
              <div key={k}>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>{label}</label>
                <textarea value={(form as any)[k]} onChange={e=>set(k,e.target.value)} rows={rows} placeholder={placeholder} style={{ width:'100%', padding:'9px 11px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', resize:'vertical' }} />
              </div>
            ))}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={onClose} style={{ flex:1, padding:'11px', background:'transparent', border:'1.5px solid #e2e9f3', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>Cancel</button>
              <button onClick={save} disabled={!form.reason||saving} style={{ flex:2, padding:'12px', background:'linear-gradient(135deg,#f97316,#fb923c)', color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:!form.reason?.5:1 }}>
                {saving?'Sending…':'📋 Send Referral'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SOAP Note Modal ──────────────────────────────────────────────────────────
function SOAPNoteModal({ patientId, doctor, toolType, existingNote, onClose }: { patientId:string; doctor:{uid:string;name:string}; toolType?:string; existingNote?:ClinicalNote; onClose:()=>void }) {
  const [type, setType] = useState<ClinicalNote['type']>(existingNote?.type||'soap');
  const [soap, setSOAP] = useState({ subjective:existingNote?.content.subjective||'', objective:existingNote?.content.objective||'', assessment:existingNote?.content.assessment||'', plan:existingNote?.content.plan||'' });
  const [text, setText] = useState(existingNote?.content.text||'');
  const [tags, setTags] = useState<string[]>(existingNote?.tags||[]);
  const [priv, setPriv] = useState(existingNote?.private||false);
  const [saving, setSave] = useState(false); const [done, setDone] = useState(false);

  const TAG_OPTIONS = ['Hypertension','Diabetes','Asthma','COPD','Heart Failure','CKD','Depression','Anxiety','Pain','Medication Change','Follow-Up','Review','Urgent','Routine'];
  const toggleTag = (t:string) => setTags(ts=>ts.includes(t)?ts.filter(x=>x!==t):[...ts,t]);

  const save = async () => {
    setSave(true);
    const content = type==='soap' ? soap : { text };
    const payload = {
      patientId, doctorId:doctor.uid, doctorName:doctor.name,
      type, content, tags, private:priv, toolType:toolType||null,
      updatedAt:serverTimestamp(), createdAt:serverTimestamp(),
    };
    if (existingNote) {
      await updateDoc(doc(db,'clinicalNotes',existingNote.id), { ...payload, createdAt:existingNote.createdAt });
    } else {
      await addDoc(collection(db,'clinicalNotes'), payload);
    }
    if (!priv) {
      await addDoc(collection(db,'alerts'), {
        patientId, doctorId:doctor.uid, type:'note',
        title:`📝 Dr. ${doctor.name} added a clinical note`,
        message:`A new ${type==='soap'?'SOAP':'progress'} note has been added to your record. Tags: ${tags.join(', ')||'General'}.`,
        read:false, createdAt:serverTimestamp(), urgency:'routine',
      });
    }
    setSave(false); setDone(true);
  };

  const SOAP_FIELDS = [
    { k:'subjective', label:'S — Subjective', placeholder:"Patient's symptoms, complaints, history in their own words…" },
    { k:'objective', label:'O — Objective', placeholder:'Examination findings, vital signs, investigation results…' },
    { k:'assessment', label:'A — Assessment', placeholder:'Diagnosis, differential diagnosis, clinical impression…' },
    { k:'plan', label:'P — Plan', placeholder:'Management plan: medications, referrals, investigations, follow-up…' },
  ];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:620, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.22)', maxHeight:'92vh', display:'flex', flexDirection:'column' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', padding:'20px 24px', color:'#fff', flexShrink:0 }}>
          <div style={{ fontSize:20, marginBottom:6 }}>📝</div>
          <div style={{ fontSize:16, fontWeight:800 }}>{done?'Note Saved!':existingNote?'Edit Clinical Note':'Write Clinical Note'}</div>
          <div style={{ fontSize:11, opacity:.7, marginTop:2 }}>Structured clinical documentation · SOAP format</div>
        </div>
        {done ? (
          <div style={{ padding:'28px 24px', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📝</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#0f172a', marginBottom:6 }}>Note saved to patient record</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>{priv?'Private note — not visible to patient.':'Patient has been notified.'}</div>
            <button onClick={onClose} style={{ padding:'11px 28px', background:'#0f172a', border:'none', color:'#fff', borderRadius:12, fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Done</button>
          </div>
        ) : (
          <div style={{ overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:12, flex:1 }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              {(['soap','progress','discharge','procedure'] as const).map(t=>(
                <button key={t} onClick={()=>setType(t)} style={{ padding:'6px 14px', borderRadius:99, border:`1.5px solid ${type===t?'#0f172a':'#e2e9f3'}`, background:type===t?'#0f172a':'#fff', fontSize:11, fontWeight:700, cursor:'pointer', color:type===t?'#fff':'#8fa3bd', fontFamily:'inherit', textTransform:'uppercase', letterSpacing:.4 }}>
                  {t}
                </button>
              ))}
              <label style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto', cursor:'pointer' }}>
                <input type="checkbox" checked={priv} onChange={e=>setPriv(e.target.checked)} style={{ width:14, height:14, accentColor:'#6366f1' }} />
                <span style={{ fontSize:11, fontWeight:700, color:'#6366f1' }}>🔒 Private (doctor only)</span>
              </label>
            </div>

            {type==='soap' ? SOAP_FIELDS.map(({k,label,placeholder})=>(
              <div key={k}>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>{label}</label>
                <textarea value={(soap as any)[k]} onChange={e=>setSOAP(s=>({...s,[k]:e.target.value}))} rows={3} placeholder={placeholder} style={{ width:'100%', padding:'10px 12px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', resize:'vertical', lineHeight:1.6 }} />
              </div>
            )) : (
              <div>
                <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Note Content</label>
                <textarea value={text} onChange={e=>setText(e.target.value)} rows={8} placeholder="Clinical note content…" style={{ width:'100%', padding:'10px 12px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', resize:'vertical', lineHeight:1.6 }} />
              </div>
            )}

            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:6 }}>Tags</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {TAG_OPTIONS.map(t=>(
                  <button key={t} onClick={()=>toggleTag(t)} style={{ padding:'4px 10px', borderRadius:99, border:`1px solid ${tags.includes(t)?'#0f172a':'#e2e9f3'}`, background:tags.includes(t)?'#0f172a':'#f8fafc', fontSize:10, fontWeight:600, cursor:'pointer', color:tags.includes(t)?'#fff':'#64748b', fontFamily:'inherit' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:10, paddingTop:4, flexShrink:0 }}>
              <button onClick={onClose} style={{ flex:1, padding:'11px', background:'transparent', border:'1.5px solid #e2e9f3', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex:2, padding:'12px', background:'linear-gradient(135deg,#0f172a,#1e3a5f)', color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                {saving?'Saving…':'📝 Save Note'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Send Alert Modal ─────────────────────────────────────────────────────────
function SendAlertModal({ patientId, doctor, onClose }: { patientId:string; doctor:{uid:string;name:string}; onClose:()=>void }) {
  const [title, setTitle]     = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<'routine'|'urgent'|'emergency'>('routine');
  const [saving, setSave]     = useState(false); const [done, setDone] = useState(false);

  const TEMPLATES = [
    { title:'📅 Please book a follow-up appointment', msg:'Your recent readings require a follow-up consultation. Please book an appointment at your earliest convenience.', urgency:'routine' },
    { title:'⚠️ Reading requires attention', msg:'Your latest reading is outside the target range. Please monitor closely and contact us if symptoms worsen.', urgency:'urgent' },
    { title:'🚨 Seek urgent medical attention', msg:'Your readings indicate you may need urgent medical review. Please go to A&E or call 999 if you have any concerning symptoms.', urgency:'emergency' },
    { title:'💊 Medication reminder', msg:'Please remember to take your medications as prescribed. Consistency is important for your condition management.', urgency:'routine' },
    { title:'✅ Great progress!', msg:'Your recent readings are excellent. Keep up the good work with your lifestyle modifications and medication compliance.', urgency:'routine' },
  ];

  const save = async () => {
    if (!title||!message) return;
    setSave(true);
    await addDoc(collection(db,'alerts'), {
      patientId, doctorId:doctor.uid, type:'doctor_message',
      title:`📬 Dr. ${doctor.name}: ${title}`,
      message, read:false, createdAt:serverTimestamp(), urgency,
    });
    setSave(false); setDone(true);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:480, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.22)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:'linear-gradient(135deg,#dc2626,#f97316)', padding:'20px 24px', color:'#fff' }}>
          <div style={{ fontSize:20, marginBottom:6 }}>🔔</div>
          <div style={{ fontSize:16, fontWeight:800 }}>{done?'Alert Sent!':'Send Patient Alert'}</div>
          <div style={{ fontSize:11, opacity:.7, marginTop:2 }}>Instant notification delivered to patient</div>
        </div>
        {done ? (
          <div style={{ padding:'28px 24px', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#dc2626', marginBottom:6 }}>Alert delivered</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>The patient has been notified immediately.</div>
            <button onClick={onClose} style={{ padding:'11px 28px', background:'#dc2626', border:'none', color:'#fff', borderRadius:12, fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Done</button>
          </div>
        ) : (
          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:8 }}>Quick Templates</label>
              <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:180, overflowY:'auto' }}>
                {TEMPLATES.map((t,i)=>(
                  <button key={i} onClick={()=>{ setTitle(t.title.replace(/^[^\s]+ /,'')); setMessage(t.msg); setUrgency(t.urgency as any); }} style={{ padding:'8px 11px', borderRadius:9, border:'1.5px solid #e2e9f3', background:'#f8fafc', fontSize:11, fontWeight:600, cursor:'pointer', textAlign:'left', fontFamily:'inherit', color:'#0d1b2a' }}>
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Alert Title *</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Short, clear subject…" style={{ width:'100%', padding:'9px 11px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:13, fontFamily:'inherit', outline:'none' }} />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Message *</label>
              <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} placeholder="Full message for patient…" style={{ width:'100%', padding:'9px 11px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none', resize:'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>Urgency Level</label>
              <div style={{ display:'flex', gap:8 }}>
                {(['routine','urgent','emergency'] as const).map(u=>(
                  <button key={u} onClick={()=>setUrgency(u)} style={{ flex:1, padding:'9px 4px', borderRadius:9, border:`1.5px solid ${urgency===u?(u==='emergency'?'#ef4444':u==='urgent'?'#f97316':'#10b981'):'#e2e9f3'}`, background:urgency===u?(u==='emergency'?'#fef2f2':u==='urgent'?'#fff7ed':'#f0fdf4'):'#fff', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', color:urgency===u?(u==='emergency'?'#ef4444':u==='urgent'?'#f97316':'#10b981'):'#8fa3bd', textTransform:'uppercase' }}>
                    {u==='emergency'?'🚨':u==='urgent'?'⚠️':'✅'} {u}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={onClose} style={{ flex:1, padding:'11px', background:'transparent', border:'1.5px solid #e2e9f3', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>Cancel</button>
              <button onClick={save} disabled={!title||!message||saving} style={{ flex:2, padding:'12px', background:'linear-gradient(135deg,#dc2626,#f97316)', color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:(!title||!message)?.5:1 }}>
                {saving?'Sending…':'🔔 Send Alert'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Monitoring Tool Card ─────────────────────────────────────────────────────
function MonitoringToolCard({ assignment, readings, doctor, patientId, onDeactivate }: {
  assignment:ToolAssignment; readings:ToolReading[];
  doctor:{uid:string;name:string}; patientId:string; onDeactivate:()=>void;
}) {
  const config = TOOL_CONFIGS[assignment.toolType];
  const guide  = GUIDANCE[assignment.toolType];
  const [tab, setTab]       = useState<'chart'|'history'>('chart');
  const [showLog, setShowLog]   = useState(false);
  const [showRx, setShowRx]     = useState(false);
  const [showLab, setShowLab]   = useState(false);
  const [showImg, setShowImg]   = useState(false);
  const [showRef, setShowRef]   = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [expand, setExpand]     = useState(true);

  if (!config) return null;

  const latest = readings[0];
  const tc     = latest?.triage;
  const lc     = LC[tc?.level||'normal'];
  const lb     = LB[tc?.level||'normal'];
  const ref    = guide?.chartRef;

  const chartData = readings.slice(0,90).reverse().map(r => {
    const base: Record<string,any> = { date:fmtShort(r.recordedAt), level:r.triage?.level||'normal' };
    if (assignment.toolType==='bp_monitor') { base.Systolic=r.data.systolic; base.Diastolic=r.data.diastolic; base.Pulse=r.data.pulse; }
    else if (assignment.toolType==='mood_tracker') { base['PHQ-9']=r.data.phq9; base.Wellbeing=r.data.wellbeing; }
    else if (config.chartFields?.[0]) base[config.name.split(' ')[0]]=r.data[config.chartFields[0]];
    return base;
  });

  const LINES = assignment.toolType==='bp_monitor'
    ? [{ key:'Systolic',color:'#ef4444'},{ key:'Diastolic',color:'#f97316'},{ key:'Pulse',color:'#8b5cf6',dashed:true}]
    : assignment.toolType==='mood_tracker'
    ? [{ key:'PHQ-9',color:'#6366f1'},{ key:'Wellbeing',color:'#10b981'}]
    : [{ key:config.name.split(' ')[0],color:config.color}];

  const dispVal = assignment.toolType==='bp_monitor'
    ? `${latest?.data.systolic||'—'}/${latest?.data.diastolic||'—'}`
    : config.chartFields?.[0] ? (latest?.data[config.chartFields[0]]??'—') : '—';

  const actionBtns = [
    { label:'Log', icon:'📋', fn:()=>setShowLog(true), color:'#0aaa76' },
    { label:'Note', icon:'📝', fn:()=>setShowNote(true), color:'#0f172a' },
    { label:'Rx', icon:'💊', fn:()=>setShowRx(true), color:'#6366f1' },
    { label:'Lab', icon:'🔬', fn:()=>setShowLab(true), color:'#0891b2' },
    { label:'Imaging', icon:'🏥', fn:()=>setShowImg(true), color:'#7c3aed' },
    { label:'Refer', icon:'📋', fn:()=>setShowRef(true), color:'#f97316' },
    { label:'Alert', icon:'🔔', fn:()=>setShowAlert(true), color:'#dc2626' },
  ];

  return (
    <div style={{ background:'#fff', border:`1.5px solid ${tc?.level&&tc.level!=='normal'?lc+'55':'#e8eef5'}`, borderRadius:16, overflow:'hidden', marginBottom:12, boxShadow:'0 1px 8px rgba(0,0,0,.05)' }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${config.color}12,${config.color}04)`, borderBottom:`1px solid ${config.color}22`, padding:'14px 18px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={()=>setExpand(e=>!e)}>
            <div style={{ width:42, height:42, borderRadius:12, background:`${config.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{config.icon}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:'#0d1b2a' }}>{config.name}</div>
              <div style={{ fontSize:10, color:'#8fa3bd', marginTop:1 }}>{assignment.frequency||config.frequency} · {readings.length} readings</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {latest && (
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:22, fontWeight:900, fontFamily:'monospace', color:lc, lineHeight:1 }}>{dispVal}</div>
                <div style={{ fontSize:9, color:'#8fa3bd' }}>{ref?.unit} · {fmtAgo(latest.recordedAt)}</div>
              </div>
            )}
            {tc && (
              <div style={{ background:lb, border:`1.5px solid ${lc}40`, borderRadius:9, padding:'5px 9px', textAlign:'center' }}>
                <div style={{ fontSize:10, fontWeight:800, color:lc }}>{tc.label}</div>
              </div>
            )}
            <button onClick={()=>setExpand(e=>!e)} style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:14, color:'#8fa3bd' }}>{expand?'▲':'▼'}</button>
          </div>
        </div>

        {tc && tc.level!=='normal' && (
          <div style={{ marginTop:10, background:`${lc}12`, border:`1px solid ${lc}30`, borderRadius:9, padding:'9px 12px', fontSize:11, color:'#1e293b' }}>
            <span style={{ fontWeight:800, color:lc }}>{tc.level==='hospital'?'🚨':tc.level==='clinic'?'⚠️':'👀'} {tc.label}: </span>{tc.message}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ marginTop:12, display:'flex', gap:6, flexWrap:'wrap' }}>
          {actionBtns.map(({label,icon,fn,color})=>(
            <button key={label} onClick={fn} style={{ padding:'6px 11px', background:color, color:'#fff', border:'none', borderRadius:8, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>
              {icon} {label}
            </button>
          ))}
          <button onClick={onDeactivate} style={{ padding:'6px 11px', background:'transparent', color:'#ef4444', border:'1px solid #ef444440', borderRadius:8, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginLeft:'auto' }}>
            ✕ Unassign
          </button>
        </div>
      </div>

      {/* Expandable body */}
      {expand && (
        <div>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #e8eef5', background:'#fafbfd' }}>
            {[['chart','📈 Trends'],['history','📋 History']].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id as any)} style={{ flex:1, padding:'10px', border:'none', borderBottom:`2.5px solid ${tab===id?config.color:'transparent'}`, background:'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, color:tab===id?config.color:'#94a3b8' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding:'16px 18px' }}>
            {tab==='chart' && (
              <>
                {/* Targets */}
                {guide?.targets && (
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                    {guide.targets.map((t,i)=>(
                      <div key={i} style={{ background:'#f8fafc', borderRadius:8, padding:'7px 11px', border:'1px solid #e2e9f3', fontSize:10, flex:'1 1 180px' }}>
                        <div style={{ fontWeight:800, color:'#0d1b2a', marginBottom:3 }}>{t.label}</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                          <span style={{ color:'#10b981', fontWeight:700 }}>✅ {t.ideal}</span>
                          <span style={{ color:'#f59e0b', fontWeight:700 }}>⚠️ {t.acceptable}</span>
                          <span style={{ color:'#ef4444', fontWeight:700 }}>🚨 {t.danger}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {chartData.length < 2 ? (
                  <div style={{ textAlign:'center', color:'#8fa3bd', padding:'24px 0', fontSize:12 }}>
                    <div style={{ fontSize:28, marginBottom:6 }}>📊</div>
                    <div style={{ fontWeight:700 }}>Log at least 2 readings to see trends</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={chartData} margin={{ top:6, right:8, left:-12, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize:9, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize:9, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CTooltip />} />
                      <Legend wrapperStyle={{ fontSize:9, paddingTop:8 }} />
                      {ref?.target&&<ReferenceLine y={ref.target} stroke="#10b98155" strokeDasharray="4 3" label={{ value:'Target', fill:'#10b981', fontSize:8 }} />}
                      {ref?.dangerHigh&&<ReferenceLine y={ref.dangerHigh} stroke="#ef444455" strokeDasharray="4 3" label={{ value:'Alert', fill:'#ef4444', fontSize:8 }} />}
                      {ref?.dangerLow&&<ReferenceLine y={ref.dangerLow} stroke="#f59e0b55" strokeDasharray="4 3" label={{ value:'Low', fill:'#f59e0b', fontSize:8 }} />}
                      {LINES.map(l=>l.key?(
                        <Area key={l.key} type="monotone" dataKey={l.key} stroke={(l as any).color} strokeWidth={2.5} fill={`${(l as any).color}10`}
                          strokeDasharray={(l as any).dashed?'5 4':undefined}
                          dot={(props:any)=>{ const lvl=props.payload?.level; if(!lvl||lvl==='normal')return<Dot {...props} r={2.5} fill={(l as any).color} strokeWidth={0} />; return<Dot {...props} r={4} fill={LC[lvl]} stroke="#fff" strokeWidth={1.5} />; }}
                          activeDot={{ r:5, stroke:'#fff', strokeWidth:2 }}
                        />
                      ):null)}
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </>
            )}

            {tab==='history' && (
              <div style={{ maxHeight:320, overflowY:'auto' }}>
                {readings.length===0 ? (
                  <div style={{ textAlign:'center', color:'#8fa3bd', padding:'24px 0', fontSize:12 }}>No readings yet</div>
                ) : readings.map((r,i) => {
                  const rl=LC[r.triage?.level||'normal'];
                  const val=assignment.toolType==='bp_monitor'
                    ?`${r.data.systolic}/${r.data.diastolic} mmHg`
                    :config.chartFields?.[0]?`${r.data[config.chartFields[0]]} ${ref?.unit||''}`:'—';
                  return (
                    <div key={r.id||i} style={{ padding:'10px 12px', borderRadius:9, border:'1px solid #e8eef5', marginBottom:5, background:i%2===0?'#fafbfd':'#fff' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                            <span style={{ fontSize:15, fontWeight:900, fontFamily:'monospace', color:rl }}>{val}</span>
                            {(r as any).enteredBy==='doctor'&&<span style={{ fontSize:9, background:'#eff6ff', color:'#6366f1', borderRadius:99, padding:'2px 6px', fontWeight:700 }}>Dr. logged</span>}
                          </div>
                          <div style={{ fontSize:10, color:'#8fa3bd', marginTop:2 }}>{fmtDate(r.recordedAt)} {fmtTime(r.recordedAt)}</div>
                          {r.doctorNote&&<div style={{ fontSize:11, color:'#0aaa76', marginTop:2, fontWeight:600 }}>📝 {r.doctorNote}</div>}
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:99, background:`${rl}15`, color:rl, whiteSpace:'nowrap' }}>{r.triage?.label||'Normal'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showLog&&<LogReadingModal assignment={assignment} patientId={patientId} doctor={doctor} onClose={()=>setShowLog(false)} />}
      {showRx&&<PrescriptionModal patientId={patientId} doctor={doctor} toolType={assignment.toolType} onClose={()=>setShowRx(false)} />}
      {showLab&&<LabOrderModal patientId={patientId} doctor={doctor} toolType={assignment.toolType} onClose={()=>setShowLab(false)} />}
      {showImg&&<ImagingModal patientId={patientId} doctor={doctor} toolType={assignment.toolType} onClose={()=>setShowImg(false)} />}
      {showRef&&<ReferralModal patientId={patientId} doctor={doctor} toolType={assignment.toolType} onClose={()=>setShowRef(false)} />}
      {showNote&&<SOAPNoteModal patientId={patientId} doctor={doctor} toolType={assignment.toolType} onClose={()=>setShowNote(false)} />}
      {showAlert&&<SendAlertModal patientId={patientId} doctor={doctor} onClose={()=>setShowAlert(false)} />}
    </div>
  );
}

// ─── Clinical Records Panel ───────────────────────────────────────────────────
function ClinicalRecordsPanel({ patientId, doctor }: { patientId:string; doctor:{uid:string;name:string} }) {
  const [notes, setNotes]             = useState<ClinicalNote[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labs, setLabs]               = useState<LabOrder[]>([]);
  const [imaging, setImaging]         = useState<ImagingOrder[]>([]);
  const [referrals, setReferrals]     = useState<Referral[]>([]);
  const [tab, setTab]                 = useState<'notes'|'rx'|'labs'|'imaging'|'referrals'>('notes');
  const [showNote, setShowNote]       = useState(false);
  const [showRx, setShowRx]           = useState(false);
  const [showLab, setShowLab]         = useState(false);
  const [showImg, setShowImg]         = useState(false);
  const [showRef, setShowRef]         = useState(false);

  useEffect(()=>{
    const q1=onSnapshot(query(collection(db,'clinicalNotes'),where('patientId','==',patientId),orderBy('createdAt','desc'),limit(50)),s=>setNotes(s.docs.map(d=>({id:d.id,...d.data()} as ClinicalNote))));
    const q2=onSnapshot(query(collection(db,'prescriptions'),where('patientId','==',patientId),orderBy('createdAt','desc'),limit(50)),s=>setPrescriptions(s.docs.map(d=>({id:d.id,...d.data()} as Prescription))));
    const q3=onSnapshot(query(collection(db,'labOrders'),where('patientId','==',patientId),orderBy('createdAt','desc'),limit(50)),s=>setLabs(s.docs.map(d=>({id:d.id,...d.data()} as LabOrder))));
    const q4=onSnapshot(query(collection(db,'imagingOrders'),where('patientId','==',patientId),orderBy('createdAt','desc'),limit(50)),s=>setImaging(s.docs.map(d=>({id:d.id,...d.data()} as ImagingOrder))));
    const q5=onSnapshot(query(collection(db,'referrals'),where('patientId','==',patientId),orderBy('createdAt','desc'),limit(50)),s=>setReferrals(s.docs.map(d=>({id:d.id,...d.data()} as Referral))));
    return()=>{ q1();q2();q3();q4();q5(); };
  },[patientId]);

  const TABS = [
    { id:'notes', label:'📝 Notes', count:notes.length, fn:()=>setShowNote(true) },
    { id:'rx', label:'💊 Rx', count:prescriptions.filter(p=>p.active).length, fn:()=>setShowRx(true) },
    { id:'labs', label:'🔬 Labs', count:labs.filter(l=>l.status!=='reviewed').length, fn:()=>setShowLab(true) },
    { id:'imaging', label:'🏥 Imaging', count:imaging.filter(i=>i.status!=='reported').length, fn:()=>setShowImg(true) },
    { id:'referrals', label:'📋 Referrals', count:referrals.filter(r=>r.status==='pending').length, fn:()=>setShowRef(true) },
  ] as const;

  const statusColor: Record<string,string> = { pending:'#f59e0b', ordered:'#6366f1', collected:'#0891b2', resulted:'#f97316', reviewed:'#10b981', active:'#10b981', completed:'#10b981', accepted:'#0891b2', declined:'#ef4444', scheduled:'#8b5cf6', reported:'#10b981' };

  return (
    <div style={{ background:'#fff', border:'1.5px solid #e8eef5', borderRadius:16, overflow:'hidden', marginBottom:16, boxShadow:'0 1px 8px rgba(0,0,0,.05)' }}>
      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:'1px solid #e8eef5', background:'#fafbfd', overflowX:'auto' }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)} style={{ flex:'0 0 auto', padding:'12px 14px', border:'none', borderBottom:`2.5px solid ${tab===t.id?'#0aaa76':'transparent'}`, background:'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, color:tab===t.id?'#0aaa76':'#94a3b8', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
            {t.label}
            {t.count>0&&<span style={{ background:'#0aaa76', color:'#fff', borderRadius:99, fontSize:9, fontWeight:700, padding:'1px 5px' }}>{t.count}</span>}
          </button>
        ))}
        <button onClick={TABS.find(t=>t.id===tab)?.fn} style={{ marginLeft:'auto', padding:'10px 14px', background:'#0aaa76', border:'none', color:'#fff', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', flexShrink:0 }}>
          + New
        </button>
      </div>

      <div style={{ padding:'16px 18px', maxHeight:440, overflowY:'auto' }}>
        {/* NOTES */}
        {tab==='notes' && (
          notes.length===0 ? <div style={{ textAlign:'center', color:'#8fa3bd', padding:'24px 0', fontSize:12 }}><div style={{ fontSize:28, marginBottom:6 }}>📝</div>No clinical notes yet</div>
          : notes.map(n=>(
            <div key={n.id} style={{ borderRadius:11, border:'1px solid #e2e9f3', marginBottom:8, overflow:'hidden' }}>
              <div style={{ padding:'10px 14px', background:'#f8fafc', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:10, fontWeight:800, background:'#0f172a', color:'#fff', borderRadius:6, padding:'2px 7px', textTransform:'uppercase' }}>{n.type}</span>
                  {(n.tags || []).map((t:string) => (
                    <span key={t} style={{ fontSize:9, background:'#eff6ff', color:'#6366f1', borderRadius:99, padding:'2px 6px', fontWeight:700 }}>{t}</span>
                  ))}
                  {n.private&&<span style={{ fontSize:9, background:'#fef2f2', color:'#ef4444', borderRadius:99, padding:'2px 6px', fontWeight:700 }}>🔒 Private</span>}
                </div>
                <div style={{ fontSize:9, color:'#8fa3bd' }}>{fmtAgo(n.createdAt)}</div>
              </div>
              <div style={{ padding:'10px 14px' }}>
                {n.type==='soap' ? (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[['S',n.content.subjective],['O',n.content.objective],['A',n.content.assessment],['P',n.content.plan]].map(([k,v])=>v?(
                      <div key={k} style={{ padding:'8px', background:'#f8fafc', borderRadius:7, border:'1px solid #e2e9f3' }}>
                        <div style={{ fontSize:9, fontWeight:800, color:'#0f172a', marginBottom:3 }}>{k}</div>
                        <div style={{ fontSize:11, color:'#4a5568', lineHeight:1.5 }}>{v}</div>
                      </div>
                    ):null)}
                  </div>
                ) : (
                  <div style={{ fontSize:12, color:'#4a5568', lineHeight:1.6 }}>
                    {n.content?.text || "—"}
                  </div>
                )}
                <div style={{ fontSize:10, color:'#8fa3bd', marginTop:6 }}>By Dr. {n.doctorName} · {fmtDate(n.createdAt)}</div>
              </div>
            </div>
          ))
        )}

        {/* PRESCRIPTIONS */}
        {tab==='rx' && (
          prescriptions.length===0 ? <div style={{ textAlign:'center', color:'#8fa3bd', padding:'24px 0', fontSize:12 }}><div style={{ fontSize:28, marginBottom:6 }}>💊</div>No prescriptions yet</div>
          : prescriptions.map(p=>(
            <div key={p.id} style={{ borderRadius:11, border:`1px solid ${p.active?'#6366f130':'#e2e9f3'}`, marginBottom:8, padding:'12px 14px', background:p.active?'#fafbff':'#f8fafc', opacity:p.active?1:.7 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:800, color:'#0d1b2a' }}>💊 {p.medication} <span style={{ color:'#6366f1' }}>{p.dosage}</span></div>
                  <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{p.frequency} · {p.route} · {p.duration}</div>
                  {p.indication&&<div style={{ fontSize:10, color:'#8fa3bd', marginTop:2 }}>For: {p.indication}</div>}
                  {p.instructions&&<div style={{ fontSize:11, color:'#4a5568', marginTop:4, fontStyle:'italic' }}>{p.instructions}</div>}
                  {p.warnings&&<div style={{ fontSize:10, color:'#ef4444', marginTop:3 }}>⚠️ {p.warnings}</div>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end' }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:99, background:`${p.active?'#10b981':'#94a3b8'}20`, color:p.active?'#10b981':'#94a3b8' }}>{p.active?'Active':'Ended'}</span>
                  <span style={{ fontSize:9, color:'#8fa3bd' }}>Refills: {p.refills}</span>
                  {p.active&&<button onClick={()=>updateDoc(doc(db,'prescriptions',p.id),{active:false})} style={{ fontSize:9, color:'#ef4444', background:'none', border:'1px solid #ef444430', borderRadius:5, padding:'2px 7px', cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>Stop</button>}
                </div>
              </div>
              <div style={{ fontSize:9, color:'#8fa3bd', marginTop:5 }}>Dr. {p.doctorName} · {fmtDate(p.createdAt)}</div>
            </div>
          ))
        )}

        {/* LABS */}
        {tab==='labs' && (
          labs.length===0 ? <div style={{ textAlign:'center', color:'#8fa3bd', padding:'24px 0', fontSize:12 }}><div style={{ fontSize:28, marginBottom:6 }}>🔬</div>No lab orders yet</div>
          : labs.map(l=>(
            <div key={l.id} style={{ borderRadius:11, border:'1px solid #e2e9f3', marginBottom:8, overflow:'hidden' }}>
              <div style={{ padding:'10px 14px', background:'#f0fdfa', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:800, color:'#0d1b2a' }}>🔬 Lab Order · <span style={{ color:l.priority==='stat'?'#ef4444':l.priority==='urgent'?'#f97316':'#10b981', textTransform:'uppercase' }}>{l.priority}</span></div>
                  <div style={{ fontSize:10, color:'#8fa3bd', marginTop:1 }}>Dr. {l.doctorName} · {fmtDate(l.createdAt)}</div>
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  {l.fasting&&<span style={{ fontSize:9, background:'#fffbeb', color:'#f59e0b', borderRadius:99, padding:'2px 7px', fontWeight:700 }}>⚡ Fasting</span>}
                  <select value={l.status} onChange={e=>updateDoc(doc(db,'labOrders',l.id),{status:e.target.value})} style={{ fontSize:10, fontWeight:700, padding:'3px 7px', borderRadius:7, border:`1px solid ${statusColor[l.status]||'#e2e9f3'}40`, background:'#fff', color:statusColor[l.status]||'#64748b', cursor:'pointer', fontFamily:'inherit', outline:'none' }}>
                    {['ordered','collected','resulted','reviewed'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ padding:'10px 14px' }}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:6 }}>
                  {l.tests.map(t=><span key={t} style={{ fontSize:10, background:'#f0fdfa', border:'1px solid #ccfbf1', borderRadius:99, padding:'3px 8px', fontWeight:600, color:'#0891b2' }}>{t}</span>)}
                </div>
                {l.clinicalInfo&&<div style={{ fontSize:11, color:'#64748b', fontStyle:'italic' }}>{l.clinicalInfo}</div>}
              </div>
            </div>
          ))
        )}

        {/* IMAGING */}
        {tab==='imaging' && (
          imaging.length===0 ? <div style={{ textAlign:'center', color:'#8fa3bd', padding:'24px 0', fontSize:12 }}><div style={{ fontSize:28, marginBottom:6 }}>🏥</div>No imaging orders yet</div>
          : imaging.map(im=>(
            <div key={im.id} style={{ borderRadius:11, border:'1px solid #e2e9f3', marginBottom:8, overflow:'hidden' }}>
              <div style={{ padding:'10px 14px', background:'#faf5ff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:800, color:'#0d1b2a' }}>🏥 {im.modality} — {im.region} {im.contrast&&'(+contrast)'}</div>
                  <div style={{ fontSize:10, color:'#8fa3bd', marginTop:1 }}>Dr. {im.doctorName} · {fmtDate(im.createdAt)} · <span style={{ color:im.priority==='emergency'?'#ef4444':im.priority==='urgent'?'#f97316':'#8fa3bd', fontWeight:700, textTransform:'uppercase' }}>{im.priority}</span></div>
                </div>
                <select value={im.status} onChange={e=>updateDoc(doc(db,'imagingOrders',im.id),{status:e.target.value})} style={{ fontSize:10, fontWeight:700, padding:'3px 7px', borderRadius:7, border:`1px solid ${statusColor[im.status]||'#e2e9f3'}40`, background:'#fff', color:statusColor[im.status]||'#64748b', cursor:'pointer', fontFamily:'inherit', outline:'none' }}>
                  {['ordered','scheduled','completed','reported'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ padding:'8px 14px', fontSize:11, color:'#64748b', fontStyle:'italic' }}>{im.indication}</div>
              {im.report&&<div style={{ padding:'8px 14px', background:'#f0fdf4', fontSize:11, color:'#0d1b2a', borderTop:'1px solid #e2e9f3' }}><strong style={{ color:'#10b981' }}>📋 Report:</strong> {im.report}</div>}
              {im.status==='completed'&&!im.report&&(
                <div style={{ padding:'8px 14px', borderTop:'1px solid #e2e9f3' }}>
                  <textarea placeholder="Enter radiology report…" rows={2} onBlur={e=>{ if(e.target.value)updateDoc(doc(db,'imagingOrders',im.id),{report:e.target.value,status:'reported'}); }} style={{ width:'100%', padding:'7px 9px', border:'1.5px solid #e2e9f3', borderRadius:8, fontSize:11, fontFamily:'inherit', outline:'none', resize:'vertical' }} />
                </div>
              )}
            </div>
          ))
        )}

        {/* REFERRALS */}
        {tab==='referrals' && (
          referrals.length===0 ? <div style={{ textAlign:'center', color:'#8fa3bd', padding:'24px 0', fontSize:12 }}><div style={{ fontSize:28, marginBottom:6 }}>📋</div>No referrals yet</div>
          : referrals.map(r=>(
            <div key={r.id} style={{ borderRadius:11, border:'1px solid #e2e9f3', marginBottom:8, overflow:'hidden' }}>
              <div style={{ padding:'10px 14px', background:'#fff7ed', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:800, color:'#0d1b2a' }}>📋 {r.specialty} Referral</div>
                  <div style={{ fontSize:10, color:'#8fa3bd', marginTop:1 }}>By Dr. {r.fromDoctorName} · {fmtDate(r.createdAt)} · <span style={{ color:r.urgency==='emergency'?'#ef4444':r.urgency==='urgent'?'#f97316':'#10b981', fontWeight:700, textTransform:'uppercase' }}>{r.urgency}</span></div>
                </div>
                <select value={r.status} onChange={e=>updateDoc(doc(db,'referrals',r.id),{status:e.target.value})} style={{ fontSize:10, fontWeight:700, padding:'3px 7px', borderRadius:7, border:`1px solid ${statusColor[r.status]||'#e2e9f3'}40`, background:'#fff', color:statusColor[r.status]||'#64748b', cursor:'pointer', fontFamily:'inherit', outline:'none' }}>
                  {['pending','accepted','completed','declined'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ padding:'10px 14px' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#0d1b2a', marginBottom:4 }}>{r.reason}</div>
                {r.clinicalSummary&&<div style={{ fontSize:11, color:'#64748b', lineHeight:1.5 }}>{r.clinicalSummary}</div>}
                {r.toDoctorName&&<div style={{ fontSize:10, color:'#8fa3bd', marginTop:4 }}>To: Dr. {r.toDoctorName}</div>}
              </div>
            </div>
          ))
        )}
      </div>

      {showNote&&<SOAPNoteModal patientId={patientId} doctor={doctor} onClose={()=>setShowNote(false)} />}
      {showRx&&<PrescriptionModal patientId={patientId} doctor={doctor} onClose={()=>setShowRx(false)} />}
      {showLab&&<LabOrderModal patientId={patientId} doctor={doctor} onClose={()=>setShowLab(false)} />}
      {showImg&&<ImagingModal patientId={patientId} doctor={doctor} onClose={()=>setShowImg(false)} />}
      {showRef&&<ReferralModal patientId={patientId} doctor={doctor} onClose={()=>setShowRef(false)} />}
    </div>
  );
}

// ─── Consent Panel ────────────────────────────────────────────────────────────
function ConsentPanel({ patientId, doctor }: { patientId:string; doctor:{uid:string;name:string} }) {
  const [consents, setConsents] = useState<PatientConsent[]>([]);

  useEffect(()=>{
    const unsub = onSnapshot(query(collection(db,'patientConsent'),where('patientId','==',patientId),orderBy('grantedAt','desc')),
      s=>setConsents(s.docs.map(d=>({id:d.id,...d.data()} as PatientConsent))));
    return ()=>unsub();
  },[patientId]);

  const myConsent = consents.find(c=>c.doctorId===doctor.uid&&c.active);

  return (
    <div style={{ background:'#fff', border:'1.5px solid #e8eef5', borderRadius:16, padding:'14px 18px', marginBottom:12 }}>
      <SectionHeader icon="🔐" title="Data Sharing Consent" subtitle="Patient-controlled access to health records" color="#7c3aed" />
      {myConsent ? (
        <div style={{ background:'#f5f3ff', borderRadius:11, padding:'12px 14px', border:'1px solid #e9d5ff' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#7c3aed', marginBottom:6 }}>✅ Patient has granted you access</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {myConsent.tools.map(t=><span key={t} style={{ fontSize:10, background:'#ede9fe', color:'#7c3aed', borderRadius:99, padding:'2px 8px', fontWeight:600 }}>{TOOL_CONFIGS[t]?.name||t}</span>)}
            {myConsent.sections.map(t=><span key={t} style={{ fontSize:10, background:'#faf5ff', color:'#9333ea', borderRadius:99, padding:'2px 8px', fontWeight:600, border:'1px solid #e9d5ff' }}>{t}</span>)}
          </div>
          <div style={{ fontSize:10, color:'#8fa3bd', marginTop:8 }}>Granted: {fmtDate(myConsent.grantedAt)} {myConsent.expiresAt&&`· Expires: ${fmtDate(myConsent.expiresAt)}`}</div>
        </div>
      ) : (
        <div style={{ background:'#fffbeb', borderRadius:11, padding:'11px 14px', border:'1px solid #fde68a', fontSize:12, color:'#78350f' }}>
          ⚠️ Patient has not yet granted data access. Request consent through the messaging channel.
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEW: BP & Medication Timeline Component
// ═══════════════════════════════════════════════════════════════════════════════
function BpMedicationTimeline({ patientId }: { patientId: string }) {
  const [bpReadings, setBpReadings] = useState<Array<{ timestamp: number; systolic: number; diastolic: number }>>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time BP readings (from toolReadings, toolType = 'bp_monitor')
  useEffect(() => {
    const q = query(
      collection(db, 'toolReadings'),
      where('patientId', '==', patientId),
      where('toolType', '==', 'bp_monitor'),
      orderBy('recordedAt', 'asc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const readings: Array<{ timestamp: number; systolic: number; diastolic: number }> = [];
      snap.forEach(doc => {
        const data = doc.data();
        const value = data.value as string;
        if (typeof value === 'string' && value.includes('/')) {
          const [sys, dia] = value.split('/').map(Number);
          if (!isNaN(sys) && !isNaN(dia)) {
            readings.push({
              timestamp: data.recordedAt?.toDate?.()?.getTime() || Date.now(),
              systolic: sys,
              diastolic: dia,
            });
          }
        } else if (data.data?.systolic && data.data?.diastolic) {
          // fallback for older data structure
          readings.push({
            timestamp: data.recordedAt?.toDate?.()?.getTime() || Date.now(),
            systolic: data.data.systolic,
            diastolic: data.data.diastolic,
          });
        }
      });
      setBpReadings(readings);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [patientId]);

  // Real-time prescriptions
  useEffect(() => {
    const q = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'asc'),
      limit(200)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setPrescriptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription)));
    });
    return () => unsubscribe();
  }, [patientId]);

  // Group BP readings by month (latest per month)
  const bpByMonth = new Map<string, { systolic: number; diastolic: number; timestamp: number }>();
  bpReadings.forEach(r => {
    const d = new Date(r.timestamp);
    const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existing = bpByMonth.get(monthKey);
    if (!existing || r.timestamp > existing.timestamp) {
      bpByMonth.set(monthKey, {
        systolic: r.systolic,
        diastolic: r.diastolic,
        timestamp: r.timestamp,
      });
    }
  });
  const sortedBp = Array.from(bpByMonth.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);

  // Build medication timeline with events
  const medMap = new Map<string, Array<{ date: Date; type: 'start' | 'dose_change' | 'stop'; dosage?: string; note?: string }>>();
  prescriptions.forEach(p => {
    const med = p.medication;
    if (!med) return;
    const date = p.createdAt?.toDate?.() || new Date();
    if (!medMap.has(med)) medMap.set(med, []);
    medMap.get(med)!.push({
      date,
      type: p.active === false ? 'stop' : 'start',
      dosage: p.dosage,
      note: p.instructions,
    });
  });

  // Process each medication: sort events, detect dose changes
  const medicationTimeline: Array<{
    medication: string;
    events: Array<{ date: Date; type: string; dosage?: string; note?: string }>;
  }> = [];

  for (const [med, events] of medMap.entries()) {
    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    const processed: typeof events = [];
    let lastDosage: string | undefined;
    for (const ev of events) {
      if (ev.type === 'start') {
        if (!lastDosage) {
          processed.push(ev);
          lastDosage = ev.dosage;
        } else if (ev.dosage !== lastDosage) {
          processed.push({
            ...ev,
            type: 'dose_change',
            note: `Dose increased from ${lastDosage} to ${ev.dosage}`,
          });
          lastDosage = ev.dosage;
        }
      } else if (ev.type === 'stop') {
        processed.push(ev);
      }
    }
    if (processed.length) {
      medicationTimeline.push({ medication: med, events: processed });
    }
  }

  if (loading) {
    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e8eef5', overflow: 'hidden', marginBottom: 20, padding: '20px', textAlign: 'center' }}>
        <div className="animate-pulse">Loading timeline…</div>
      </div>
    );
  }

  if (sortedBp.length === 0 && medicationTimeline.length === 0) return null;

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e8eef5', overflow: 'hidden', marginBottom: 20, boxShadow: '0 1px 8px rgba(0,0,0,.05)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8eef5', background: '#fafbfd' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1b2a', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>❤️</span> Blood Pressure & Medication Timeline
        </div>
      </div>
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {/* Left column: BP Readings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>BP (mmHg)</span>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Target &lt;130/80</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedBp.map(([month, bp]) => (
              <div key={month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#475569' }}>{month}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#0d1b2a' }}>{bp.systolic}/{bp.diastolic}</span>
              </div>
            ))}
            {sortedBp.length === 0 && (
              <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 20 }}>No BP readings yet</div>
            )}
          </div>
        </div>

        {/* Right column: Medication Timeline */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Medication Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {medicationTimeline.map(({ medication, events }) => (
              <div key={medication} style={{ borderLeft: '2px solid #93c5fd', paddingLeft: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0d1b2a', marginBottom: 6 }}>{medication}</div>
                {events.map((ev, idx) => {
                  const dateStr = ev.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  if (ev.type === 'start') {
                    return (
                      <div key={idx} style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>
                        Started {dateStr}
                        {ev.dosage && <span style={{ color: '#64748b', marginLeft: 6 }}>({ev.dosage})</span>}
                      </div>
                    );
                  } else if (ev.type === 'dose_change') {
                    return (
                      <div key={idx} style={{ fontSize: 12, color: '#f59e0b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>⬆</span> Dose increased: {ev.dosage}
                        {ev.note && <span style={{ fontSize: 10, color: '#94a3b8' }}>({ev.note})</span>}
                      </div>
                    );
                  } else if (ev.type === 'stop') {
                    return (
                      <div key={idx} style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                        Stopped {dateStr}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
            {medicationTimeline.length === 0 && (
              <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 20 }}>No medications prescribed</div>
            )}
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #e8eef5', padding: '10px 20px', textAlign: 'center' }}>
        <button
          style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          onClick={() => console.log('View all history')}
        >
          View All History →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
interface Props {
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctor: { uid:string; name:string };
  isEmbedded?: boolean;
}

export default function DoctorMonitoringPanel({ patientId, patientName, patientAge, patientGender, doctor, isEmbedded = false }: Props) {
  const [assignments, setAssignments] = useState<ToolAssignment[]>([]);
  const [allReadings, setAllReadings] = useState<Record<string,ToolReading[]>>({});
  const [loading, setLoading]         = useState(true);
  const [showAssign, setShowAssign]   = useState(false);
  const [showRx, setShowRx]           = useState(false);
  const [showLab, setShowLab]         = useState(false);
  const [showImg, setShowImg]         = useState(false);
  const [showRef, setShowRef]         = useState(false);
  const [showNote, setShowNote]       = useState(false);
  const [showAlert, setShowAlert]     = useState(false);

  // ✅ Critical: patientId filter matches Firestore security rules
  useEffect(()=>{
    const unsub = onSnapshot(
      query(collection(db,'toolAssignments'),where('patientId','==',patientId),where('active','==',true)),
      snap=>{ setAssignments(snap.docs.map(d=>({id:d.id,...d.data()} as ToolAssignment))); setLoading(false); }
    );
    return()=>unsub();
  },[patientId]);

  useEffect(()=>{
    if (!assignments.length) { setLoading(false); return; }
    const unsubs = assignments.map(a=>
      onSnapshot(
        query(collection(db,'toolReadings'),
          where('patientId','==',patientId),   // ← rule-required filter
          where('assignmentId','==',a.id),
          orderBy('recordedAt','desc'), limit(90)
        ),
        snap=>setAllReadings(prev=>({...prev,[a.id]:snap.docs.map(d=>({id:d.id,...d.data()} as ToolReading))}))
      )
    );
    return()=>unsubs.forEach(u=>u());
  },[assignments,patientId]);

  const deactivate = async (id:string) => {
    if (!confirm('Remove this monitoring tool from patient?')) return;
    await updateDoc(doc(db,'toolAssignments',id),{ active:false });
  };

  const overall = (()=>{
    const lvls=assignments.map(a=>allReadings[a.id]?.[0]?.triage?.level||'normal');
    if (lvls.some(l=>l==='hospital')) return { label:'Critical',color:'#ef4444',icon:'🚨',bg:'#fef2f2' };
    if (lvls.some(l=>l==='clinic'))   return { label:'Urgent',  color:'#f97316',icon:'⚠️',bg:'#fff7ed' };
    if (lvls.some(l=>l==='video'))    return { label:'Attention',color:'#6366f1',icon:'📹',bg:'#eef2ff' };
    if (lvls.some(l=>l==='watch'))    return { label:'Monitor', color:'#f59e0b',icon:'👀',bg:'#fffbeb' };
    return { label:'Good',color:'#10b981',icon:'✅',bg:'#f0fdf4' };
  })();

  const assignedIds = assignments.map(a=>a.toolType);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:48 }}>
      <div style={{ textAlign:'center', color:'#8fa3bd' }}>
        <div style={{ width:36, height:36, border:'3px solid #e2e9f3', borderTopColor:'#0aaa76', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 10px' }} />
        <div style={{ fontSize:12, fontWeight:600 }}>Loading patient monitoring…</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", color:'#0d1b2a', background:'#f8fafc' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Patient Banner – only shown when NOT embedded ── */}
      {!isEmbedded && (
        <div style={{ background:'linear-gradient(135deg,#0d1b2a 0%,#0f3d2e 60%,#0a5741 100%)', padding:'20px 22px', color:'#fff', borderRadius:'16px 16px 0 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1.2, opacity:.5, marginBottom:3 }}>🩺 Monitoring — Doctor View</div>
              <div style={{ fontSize:20, fontWeight:900 }}>{patientName}</div>
              {(patientAge||patientGender)&&<div style={{ fontSize:11, opacity:.65, marginTop:2 }}>{[patientAge&&`${patientAge} yrs`,patientGender].filter(Boolean).join(' · ')}</div>}
              <div style={{ display:'flex', gap:7, marginTop:10, flexWrap:'wrap' }}>
                <span style={{ background:overall.bg, color:overall.color, borderRadius:99, padding:'4px 12px', fontSize:11, fontWeight:800 }}>{overall.icon} {overall.label}</span>
                <span style={{ background:'rgba(255,255,255,.12)', borderRadius:99, padding:'4px 12px', fontSize:11, fontWeight:700 }}>🩺 {assignments.length} active tool{assignments.length!==1?'s':''}</span>
              </div>
            </div>

            {/* Live summaries */}
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {assignments.slice(0,4).map(a=>{
                const cfg=TOOL_CONFIGS[a.toolType];
                const lat=allReadings[a.id]?.[0];
                const lv=LC[lat?.triage?.level||'normal'];
                const v=a.toolType==='bp_monitor'?`${lat?.data.systolic||'—'}/${lat?.data.diastolic||'—'}`:cfg?.chartFields?.[0]?(lat?.data[cfg.chartFields[0]]||'—'):'—';
                return (
                  <div key={a.id} style={{ background:'rgba(255,255,255,.09)', border:'1px solid rgba(255,255,255,.12)', borderRadius:11, padding:'9px 12px', textAlign:'center', minWidth:72 }}>
                    <div style={{ fontSize:16, marginBottom:2 }}>{cfg?.icon}</div>
                    <div style={{ fontSize:14, fontWeight:900, fontFamily:'monospace', color:lv, lineHeight:1 }}>{v}</div>
                    <div style={{ fontSize:8, opacity:.6, fontWeight:700, textTransform:'uppercase', letterSpacing:.4, marginTop:2 }}>{cfg?.name.split(' ')[0]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Doctor quick-action bar */}
          <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(255,255,255,.12)', display:'flex', gap:7, flexWrap:'wrap' }}>
            {[
              { label:'+ Assign Tool', fn:()=>setShowAssign(true), color:'#0aaa76', icon:'🩺' },
              { label:'Write Note', fn:()=>setShowNote(true), color:'rgba(255,255,255,.15)', icon:'📝' },
              { label:'Prescribe', fn:()=>setShowRx(true), color:'rgba(255,255,255,.15)', icon:'💊' },
              { label:'Order Lab', fn:()=>setShowLab(true), color:'rgba(255,255,255,.15)', icon:'🔬' },
              { label:'Order Imaging', fn:()=>setShowImg(true), color:'rgba(255,255,255,.15)', icon:'🏥' },
              { label:'Refer', fn:()=>setShowRef(true), color:'rgba(255,255,255,.15)', icon:'📋' },
              { label:'Send Alert', fn:()=>setShowAlert(true), color:'#dc2626', icon:'🔔' },
            ].map(({label,fn,color,icon})=>(
              <button key={label} onClick={fn} style={{ padding:'7px 13px', background:color, border:'none', color:'#fff', borderRadius:9, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content area – padding adapts to embedded mode */}
      <div style={{ padding: isEmbedded ? '0' : '16px' }}>

        {/* ── NEW: BP & Medication Timeline ── */}
        <BpMedicationTimeline patientId={patientId} />

        {/* Consent – only show when NOT embedded (because wall has its own consent panel) */}
        {!isEmbedded && <ConsentPanel patientId={patientId} doctor={doctor} />}

        {/* Active monitoring tools */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.8 }}>
              Active Monitoring Tools ({assignments.length})
            </div>
            <button onClick={()=>setShowAssign(true)} style={{ padding:'6px 12px', background:'#0aaa76', border:'none', color:'#fff', borderRadius:8, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              + Assign Tool
            </button>
          </div>

          {assignments.length===0 ? (
            <div style={{ background:'#fff', borderRadius:14, border:'2px dashed #e2e9f3', padding:'36px 24px', textAlign:'center', marginBottom:12 }}>
              <div style={{ fontSize:40, marginBottom:10 }}>🩺</div>
              <div style={{ fontSize:15, fontWeight:700, color:'#4a5568', marginBottom:5 }}>No monitoring tools assigned</div>
              <div style={{ fontSize:12, color:'#8fa3bd', maxWidth:360, margin:'0 auto 16px', lineHeight:1.6 }}>
                Assign health monitoring tools to start tracking this patient's chronic disease parameters remotely.
              </div>
              <button onClick={()=>setShowAssign(true)} style={{ padding:'10px 22px', background:'#0aaa76', border:'none', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                🩺 Assign First Tool
              </button>
            </div>
          ) : assignments.map(a=>(
            <MonitoringToolCard key={a.id} assignment={a} readings={allReadings[a.id]||[]} doctor={doctor} patientId={patientId} onDeactivate={()=>deactivate(a.id)} />
          ))}
        </div>

        {/* Clinical records – always shown (the wall will also show its own timeline, but this is fine) */}
        <ClinicalRecordsPanel patientId={patientId} doctor={doctor} />

      </div>

      {/* Modals */}
      {showAssign&&<AssignToolModal patientId={patientId} doctor={doctor} existingIds={assignedIds} onClose={()=>setShowAssign(false)} />}
      {showNote&&<SOAPNoteModal patientId={patientId} doctor={doctor} onClose={()=>setShowNote(false)} />}
      {showRx&&<PrescriptionModal patientId={patientId} doctor={doctor} onClose={()=>setShowRx(false)} />}
      {showLab&&<LabOrderModal patientId={patientId} doctor={doctor} onClose={()=>setShowLab(false)} />}
      {showImg&&<ImagingModal patientId={patientId} doctor={doctor} onClose={()=>setShowImg(false)} />}
      {showRef&&<ReferralModal patientId={patientId} doctor={doctor} onClose={()=>setShowRef(false)} />}
      {showAlert&&<SendAlertModal patientId={patientId} doctor={doctor} onClose={()=>setShowAlert(false)} />}
    </div>
  );
}