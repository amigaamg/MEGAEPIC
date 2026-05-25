'use client';
// components/wall/ClinicalJourneyColumn.tsx
// The heart of The Wall — monitoring cards + SOAP notes + teaching + chat
// interleaved chronologically so the doctor lives WITH the patient

import { useEffect, useState, useRef } from 'react';
import {
  collection, query, where, onSnapshot,
  orderBy, limit, addDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend, Dot,
} from 'recharts';
import { TOOL_CONFIGS, ToolAssignment, ToolReading } from '@/lib/diseaseTools';
import { evaluateReading } from '@/lib/triageRules';
import { WallDoctor } from '@/components/PatientWallPage';
import LogReadingModal from '@/components/DoctorMonitoringPanel/LogReadingModal';

// ── Types ────────────────────────────────────────────────────────────────────
interface ClinicalNote {
  id: string; patientId: string; doctorId: string; doctorName: string;
  type: 'soap'|'progress'|'discharge'|'procedure';
  content: { subjective?:string; objective?:string; assessment?:string; plan?:string; text?:string };
  tags: string[]; private: boolean; toolType?: string; createdAt: any;
}

interface Prescription {
  id: string; medication: string; dosage: string; frequency: string;
  route: string; indication: string; instructions: string; warnings: string;
  active: boolean; startDate: any; reason?: string; newDrug?: boolean;
  doctorName: string;
}

// ── Colour maps ──────────────────────────────────────────────────────────────
const LC: Record<string,string> = { normal:'#10b981',watch:'#f59e0b',video:'#6366f1',clinic:'#f97316',hospital:'#ef4444' };
const LB: Record<string,string> = { normal:'#f0fdf4',watch:'#fffbeb',video:'#eef2ff',clinic:'#fff7ed',hospital:'#fef2f2' };

const fmtShort = (ts:any) => { if(!ts)return''; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('en-KE',{day:'numeric',month:'short'}); };
const fmtAgo   = (ts:any) => { if(!ts)return''; const d=ts?.toDate?ts.toDate():new Date(ts); const s=Math.floor((Date.now()-d.getTime())/1000); if(s<60)return'Just now'; if(s<3600)return`${Math.floor(s/60)}m ago`; if(s<86400)return`${Math.floor(s/3600)}h ago`; return fmtShort(ts); };
const fmtDate  = (ts:any) => { if(!ts)return'—'; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}); };
const fmtTime  = (ts:any) => { if(!ts)return''; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}); };

// ── Custom tooltip ───────────────────────────────────────────────────────────
function CTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#0d1b2a', borderRadius:10, padding:'10px 14px', color:'#fff', fontSize:11, minWidth:130 }}>
      <div style={{ fontWeight:700, color:'#64748b', fontSize:9, textTransform:'uppercase', marginBottom:6 }}>{label}</div>
      {payload.map((p:any, i:number) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:p.stroke||p.fill }} />
          <span style={{ color:'#94a3b8' }}>{p.name}:</span>
          <span style={{ fontFamily:'monospace', fontWeight:800 }}>{typeof p.value==='number'?p.value.toFixed(1):p.value}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  patientId: string;
  doctor: WallDoctor;
  assignments: ToolAssignment[];
  allReadings: Record<string, ToolReading[]>;
  onOpenAssign:   () => void;
  onOpenNote:     () => void;
  onOpenRx:       () => void;
  onOpenLab:      () => void;
  onOpenImaging:  () => void;
  onOpenAlert:    () => void;
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ['Monitoring', 'SOAP notes', 'Teaching', 'Full timeline'] as const;
type Tab = typeof TABS[number];

// ── GUIDANCE (clinical targets per tool) ─────────────────────────────────────
const GUIDANCE: Record<string,any> = {
  bp_monitor: {
    targets:[
      { label:'Systolic',  ideal:'<120 mmHg',   acceptable:'120–139',  danger:'≥160' },
      { label:'Diastolic', ideal:'<80 mmHg',    acceptable:'80–89',    danger:'≥100' },
      { label:'Pulse',     ideal:'60–100 bpm',  acceptable:'50–110',   danger:'>120 or <50' },
    ],
    chartRef:{ target:130, dangerHigh:160, dangerLow:80, unit:'mmHg' },
    complications:[
      { name:'Hypertensive crisis', icon:'🚨', signs:'BP ≥180/120, headache, visual changes', action:'A&E immediately' },
      { name:'Stroke', icon:'🧠', signs:'Facial droop, arm weakness, speech change', action:'999 — FAST' },
    ],
    lifestyle:['Low salt diet (<2g sodium/day)','DASH diet','30min moderate exercise 5x/week','No smoking','Limit alcohol'],
  },
  glucose_tracker: {
    targets:[
      { label:'Fasting',      ideal:'4.0–5.5 mmol/L', acceptable:'5.6–7.0', danger:'>10 or <3.5' },
      { label:'Post-meal 2h', ideal:'<7.8 mmol/L',    acceptable:'7.8–11',  danger:'>13.9' },
    ],
    chartRef:{ target:6.5, dangerHigh:13.9, dangerLow:3.0, unit:'mmol/L' },
    complications:[
      { name:'DKA', icon:'🚨', signs:'Vomiting, fruity breath, deep breathing', action:'Emergency — never stop insulin when sick' },
      { name:'Hypoglycaemia', icon:'⬇️', signs:'Shaking, sweating, BG<3.9', action:'15g fast sugar immediately' },
    ],
    lifestyle:['Log with time and meal context','Never skip meals with insulin','Carry glucose tablets','Foot check daily'],
  },
  hba1c_tracker: {
    targets:[{ label:'HbA1c', ideal:'<48 mmol/mol (<6.5%)', acceptable:'48–58', danger:'>75 mmol/mol (>10%)' }],
    chartRef:{ target:6.5, dangerHigh:10, unit:'%' },
    complications:[{ name:'Microvascular disease', icon:'🩸', signs:'Eyes, kidneys, nerves affected', action:'Annual screening' }],
    lifestyle:['Test every 3 months until stable','Every 1% reduction = 25–35% fewer complications'],
  },
  peak_flow: {
    targets:[{ label:'% Predicted', ideal:'≥80% personal best', acceptable:'60–79%', danger:'<60% — emergency' }],
    chartRef:{ target:500, dangerLow:300, unit:'L/min' },
    complications:[{ name:'Acute severe asthma', icon:'🚨', signs:'PEF <50%, unable to complete sentences', action:'999 — 10 puffs salbutamol' }],
    lifestyle:['Preventer inhaler every day','Avoid triggers: dust, cold air, pets','Blow 3 times, record best'],
  },
  spo2_monitor: {
    targets:[{ label:'SpO₂', ideal:'95–100%', acceptable:'94%', danger:'<92% — emergency' }],
    chartRef:{ target:96, dangerLow:92, unit:'%' },
    complications:[{ name:'Respiratory failure', icon:'🫁', signs:'SpO₂ <88%, cyanosis, confusion', action:'999' }],
    lifestyle:['Measure after 5 min rest, warm hands','O₂ therapy compliance'],
  },
  weight_tracker: {
    targets:[{ label:'BMI', ideal:'18.5–24.9 kg/m²', acceptable:'25–29.9', danger:'≥35' }],
    chartRef:{ unit:'kg' },
    complications:[{ name:'Heart failure decompensation', icon:'💧', signs:'>2kg in 24h, breathlessness', action:'Urgent A&E if breathless at rest' }],
    lifestyle:['Weigh same time daily — morning after toilet','Fluid restriction if advised','1500–2000 kcal/day'],
  },
  pain_scale: {
    targets:[{ label:'Pain score', ideal:'0–3', acceptable:'4–6 (moderate)', danger:'7–10 (severe)' }],
    chartRef:{ target:3, dangerHigh:7, unit:'/10' },
    complications:[{ name:'Opioid dependency', icon:'⚠️', signs:'Increasing doses, withdrawal', action:'Pain clinic review' }],
    lifestyle:['Rate usual pain last 24h, not worst moment','Ice/heat packs','Gentle movement'],
  },
  mood_tracker: {
    targets:[{ label:'PHQ-9', ideal:'0–4 (minimal)', acceptable:'5–9 (mild)', danger:'≥15 (moderately severe)' }],
    chartRef:{ target:5, dangerHigh:15, unit:'PHQ-9' },
    complications:[{ name:'Suicidal crisis', icon:'🆘', signs:'Thoughts of self-harm', action:'999 / Befrienders Kenya: 0800 723 253' }],
    lifestyle:['Weekly PHQ-9 at same time','Regular sleep schedule','Social connection'],
  },
  medication_adherence: {
    targets:[{ label:'Adherence', ideal:'≥95%', acceptable:'80–94%', danger:'<80%' }],
    chartRef:{ unit:'compliance' },
    complications:[{ name:'Uncontrolled disease', icon:'⚠️', signs:'Parameters worsening', action:'Simplify regimen, pill organiser' }],
    lifestyle:['Weekly pill organiser','Phone alarm reminders','Attach to daily habits'],
  },
  ecg_monitor: {
    targets:[{ label:'Resting HR', ideal:'60–100 bpm', acceptable:'50–110', danger:'>120 or <45' }],
    chartRef:{ target:75, dangerHigh:120, dangerLow:45, unit:'bpm' },
    complications:[{ name:'Atrial fibrillation', icon:'〰️', signs:'Irregular pulse, palpitations', action:'Urgent if new AF with fast rate' }],
    lifestyle:['Measure after 5 min rest','Check regularity','Rate control + anticoagulation if AF'],
  },
};

// ── Single monitoring tool card ───────────────────────────────────────────────
function MonitoringCard({
  assignment, readings, doctor, patientId,
  onOpenRx, onOpenLab, onOpenImaging, onOpenAlert, onOpenNote,
  prescriptions,
}: {
  assignment: ToolAssignment; readings: ToolReading[]; doctor: WallDoctor;
  patientId: string; prescriptions: Prescription[];
  onOpenRx:()=>void; onOpenLab:()=>void; onOpenImaging:()=>void; onOpenAlert:()=>void; onOpenNote:()=>void;
}) {
  const config  = TOOL_CONFIGS[assignment.toolType];
  const guide   = GUIDANCE[assignment.toolType];
  const [tab, setTab]       = useState<'chart'|'history'|'targets'|'teaching'>('chart');
  const [showLog, setShowLog] = useState(false);
  const [expand, setExpand]  = useState(true);

  if (!config) return null;

  const latest   = readings[0];
  const tc       = latest?.triage;
  const lc       = LC[tc?.level||'normal'];
  const lb       = LB[tc?.level||'normal'];
  const ref      = guide?.chartRef;

  // Build chart data — mark drug change events on the chart
  const chartData = readings.slice(0, 90).reverse().map(r => {
    const base: Record<string,any> = { date: fmtShort(r.recordedAt), level: r.triage?.level||'normal' };
    // Match prescriptions to this reading's date
    const readingDate = r.recordedAt?.toDate ? r.recordedAt.toDate() : new Date(r.recordedAt);
    const nearDrug = prescriptions.find(p => {
      if (!p.startDate) return false;
      const pd = p.startDate?.toDate ? p.startDate.toDate() : new Date(p.startDate);
      return Math.abs(readingDate.getTime() - pd.getTime()) < 3 * 86400000;
    });
    if (nearDrug) base.drugEvent = nearDrug.medication;

    if (assignment.toolType === 'bp_monitor') {
      base.Systolic  = r.data.systolic;
      base.Diastolic = r.data.diastolic;
      base.Pulse     = r.data.pulse;
    } else if (assignment.toolType === 'mood_tracker') {
      base['PHQ-9']    = r.data.phq9;
      base.Wellbeing   = r.data.wellbeing;
    } else if (config.chartFields?.[0]) {
      base[config.name.split(' ')[0]] = r.data[config.chartFields[0]];
    }
    return base;
  });

  const LINES = assignment.toolType === 'bp_monitor'
    ? [{ key:'Systolic',color:'#ef4444'},{ key:'Diastolic',color:'#f97316'},{ key:'Pulse',color:'#8b5cf6',dashed:true}]
    : assignment.toolType === 'mood_tracker'
    ? [{ key:'PHQ-9',color:'#6366f1'},{ key:'Wellbeing',color:'#10b981'}]
    : [{ key:config.name.split(' ')[0], color:config.color||'#0aaa76'}];

  const dispVal = assignment.toolType === 'bp_monitor'
    ? `${latest?.data?.systolic??'—'}/${latest?.data?.diastolic??'—'}`
    : config.chartFields?.[0] ? (latest?.data?.[config.chartFields[0]]??'—') : '—';

  const CARD_TABS = ['chart','history','targets','teaching'] as const;

  return (
    <div style={{ ...cs.card, border:`1.5px solid ${tc?.level&&tc.level!=='normal'?lc+'55':'#e8eef5'}` }}>
      {/* Header */}
      <div style={{ ...cs.cardHead, background:`${config.color||'#0aaa76'}08` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={()=>setExpand(e=>!e)}>
            <div style={{ ...cs.toolIcon, background:`${config.color||'#0aaa76'}15` }}>{config.icon}</div>
            <div>
              <div style={cs.toolName}>{config.name}</div>
              <div style={cs.toolSub}>{assignment.frequency||config.frequency} · {readings.length} readings · {fmtAgo(assignment.assignedAt)}</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {latest && (
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:24, fontWeight:900, fontFamily:'monospace', color:lc, lineHeight:1 }}>{dispVal}</div>
                <div style={{ fontSize:9, color:'#8fa3bd' }}>{ref?.unit} · {fmtAgo(latest.recordedAt)}</div>
              </div>
            )}
            {tc && (
              <div style={{ background:lb, border:`1.5px solid ${lc}40`, borderRadius:9, padding:'5px 10px', textAlign:'center' }}>
                <div style={{ fontSize:11, fontWeight:800, color:lc }}>{tc.label}</div>
              </div>
            )}
            <button onClick={()=>setExpand(e=>!e)} style={cs.expandBtn}>{expand?'▲':'▼'}</button>
          </div>
        </div>

        {/* Triage alert */}
        {tc && tc.level !== 'normal' && (
          <div style={{ marginTop:10, background:`${lc}12`, border:`1px solid ${lc}30`, borderRadius:9, padding:'9px 13px', fontSize:11, color:'#1e293b', animation:'fadeUp .3s ease' }}>
            <span style={{ fontWeight:800, color:lc }}>{tc.level==='hospital'?'🚨 EMERGENCY: ':tc.level==='clinic'?'⚠️ URGENT: ':tc.level==='watch'?'👀 Watch: ':''}</span>
            {tc.message}
            {tc.level === 'hospital' && <span style={{ fontSize:10, color:lc, fontWeight:800, marginLeft:8 }}>→ Consider immediate action</span>}
          </div>
        )}

        {/* Drug change marker */}
        {prescriptions.filter(p => {
          if (!p.newDrug || !p.startDate) return false;
          const pd = p.startDate?.toDate ? p.startDate.toDate() : new Date(p.startDate);
          return (Date.now() - pd.getTime()) < 14 * 86400000;
        }).map(p => (
          <div key={p.id} style={{ marginTop:8, background:'#faf5ff', border:'1px solid #e9d5ff', borderRadius:9, padding:'7px 12px', fontSize:11, color:'#7c3aed' }}>
            💊 <strong>{p.medication} {p.dosage}</strong> added {fmtDate(p.startDate)} — {p.reason || 'New medication'}
          </div>
        ))}

        {/* Action buttons */}
        <div style={{ marginTop:12, display:'flex', gap:5, flexWrap:'wrap' }}>
          {[
            { label:'Log clinic reading', fn:()=>setShowLog(true), color:'#0aaa76', bg:'#f0fdf4' },
            { label:'SOAP note', fn:onOpenNote, color:'#0f172a', bg:'#f8fafc' },
            { label:'Prescribe', fn:onOpenRx, color:'#6366f1', bg:'#eef2ff' },
            { label:'Order lab', fn:onOpenLab, color:'#0891b2', bg:'#e0f7fa' },
            { label:'Order imaging', fn:onOpenImaging, color:'#7c3aed', bg:'#f5f3ff' },
            { label:'Send alert', fn:onOpenAlert, color:'#dc2626', bg:'#fef2f2' },
          ].map(({ label,fn,color,bg })=>(
            <button key={label} onClick={fn} style={{ padding:'5px 10px', background:bg, color, border:`1px solid ${color}30`, borderRadius:7, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {expand && (
        <div>
          {/* Tab bar */}
          <div style={{ display:'flex', borderBottom:'1px solid #e8eef5', background:'#fafbfd' }}>
            {CARD_TABS.map(t => (
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:'9px 4px', border:'none', borderBottom:`2.5px solid ${tab===t?(config.color||'#0aaa76'):'transparent'}`, background:'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:10, fontWeight:700, color:tab===t?(config.color||'#0aaa76'):'#94a3b8', textTransform:'capitalize' }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding:'14px 16px' }}>
            {/* CHART */}
            {tab === 'chart' && (
              <>
                {chartData.length < 2 ? (
                  <div style={cs.emptyChart}>
                    <div style={{ fontSize:28, marginBottom:6 }}>📊</div>
                    Log at least 2 readings to see trends
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <ComposedChart data={chartData} margin={{ top:6, right:6, left:-18, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize:9, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize:9, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CTooltip />} />
                      <Legend wrapperStyle={{ fontSize:9, paddingTop:8 }} />
                      {ref?.target    && <ReferenceLine y={ref.target}    stroke="#10b98155" strokeDasharray="4 3" label={{ value:'Target', fill:'#10b981', fontSize:8, position:'right' }} />}
                      {ref?.dangerHigh && <ReferenceLine y={ref.dangerHigh} stroke="#ef444455" strokeDasharray="4 3" label={{ value:'Alert',  fill:'#ef4444', fontSize:8, position:'right' }} />}
                      {ref?.dangerLow  && <ReferenceLine y={ref.dangerLow}  stroke="#f59e0b55" strokeDasharray="4 3" label={{ value:'Low',    fill:'#f59e0b', fontSize:8, position:'right' }} />}
                      {LINES.map(l => l.key ? (
                        <Area key={l.key} type="monotone" dataKey={l.key}
                          stroke={l.color} strokeWidth={2.5}
                          fill={`${l.color}10`}
                          strokeDasharray={(l as any).dashed ? '5 4' : undefined}
                          dot={(props: any) => {
                            const lvl = props.payload?.level;
                            if (!lvl || lvl === 'normal') return <Dot {...props} r={2.5} fill={l.color} strokeWidth={0} />;
                            return <Dot {...props} r={4.5} fill={LC[lvl]} stroke="#fff" strokeWidth={1.5} />;
                          }}
                          activeDot={{ r:5, stroke:'#fff', strokeWidth:2 }}
                        />
                      ) : null)}
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
                <div style={{ fontSize:10, color:'#8fa3bd', marginTop:4 }}>
                  Coloured dots = triage levels · {lc !== '#10b981' && <span style={{ color:lc, fontWeight:700 }}>⬤ = {tc?.label}</span>}
                  · Drug changes marked <span style={{ background:'#faf5ff', color:'#7c3aed', padding:'1px 5px', borderRadius:4 }}>Rx+</span>
                </div>
              </>
            )}

            {/* HISTORY */}
            {tab === 'history' && (
              <div style={{ maxHeight:300, overflowY:'auto' }}>
                {readings.length === 0
                  ? <div style={cs.emptyChart}>No readings yet</div>
                  : readings.map((r, i) => {
                    const rl  = LC[r.triage?.level||'normal'];
                    const val = assignment.toolType === 'bp_monitor'
                      ? `${r.data.systolic}/${r.data.diastolic} mmHg`
                      : config.chartFields?.[0] ? `${r.data[config.chartFields[0]]} ${ref?.unit||''}` : '—';
                    return (
                      <div key={r.id||i} style={{ padding:'9px 11px', borderRadius:9, border:'1px solid #e8eef5', marginBottom:5, background:i%2===0?'#fafbfd':'#fff' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                              <span style={{ fontSize:15, fontWeight:900, fontFamily:'monospace', color:rl }}>{val}</span>
                              {(r as any).enteredBy === 'doctor' && <span style={{ fontSize:9, background:'#eff6ff', color:'#6366f1', borderRadius:99, padding:'2px 6px', fontWeight:700 }}>Clinic</span>}
                            </div>
                            <div style={{ fontSize:10, color:'#8fa3bd', marginTop:2 }}>{fmtDate(r.recordedAt)} {fmtTime(r.recordedAt)}</div>
                            {r.doctorNote && <div style={{ fontSize:11, color:'#0aaa76', marginTop:2, fontWeight:600 }}>📝 {r.doctorNote}</div>}
                            {r.triage?.message && r.triage.level !== 'normal' && <div style={{ fontSize:10, color:rl, marginTop:2 }}>{r.triage.message}</div>}
                          </div>
                          <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:99, background:`${rl}15`, color:rl }}>{r.triage?.label||'Normal'}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* TARGETS */}
            {tab === 'targets' && guide?.targets && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {guide.targets.map((t:any, i:number) => (
                  <div key={i} style={{ background:'#f8fafc', borderRadius:9, padding:'10px 12px', border:'1px solid #e2e9f3' }}>
                    <div style={{ fontSize:12, fontWeight:800, color:'#0d1b2a', marginBottom:6 }}>{t.label}</div>
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, color:'#10b981', fontWeight:700 }}>✅ Ideal: {t.ideal}</span>
                      <span style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>⚠️ Watch: {t.acceptable}</span>
                      <span style={{ fontSize:11, color:'#ef4444', fontWeight:700 }}>🚨 Danger: {t.danger}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TEACHING */}
            {tab === 'teaching' && guide && (
              <div>
                {guide.complications?.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, marginBottom:8 }}>Complications to watch</div>
                    {guide.complications.map((c:any, i:number) => (
                      <div key={i} style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:9, padding:'10px 12px', marginBottom:6 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'#92400e', marginBottom:3 }}>{c.icon} {c.name}</div>
                        <div style={{ fontSize:11, color:'#4a5568' }}>Signs: {c.signs}</div>
                        <div style={{ fontSize:11, color:'#ef4444', fontWeight:700, marginTop:2 }}>Action: {c.action}</div>
                      </div>
                    ))}
                  </div>
                )}
                {guide.lifestyle?.length > 0 && (
                  <div>
                    <div style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, marginBottom:8 }}>Lifestyle advice for patient</div>
                    {guide.lifestyle.map((l:string, i:number) => (
                      <div key={i} style={{ fontSize:11, color:'#4a5568', padding:'4px 0', borderBottom:'1px solid #f1f5f9', display:'flex', gap:7 }}>
                        <span style={{ color:'#10b981', fontWeight:800 }}>✓</span> {l}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showLog && (
        <LogReadingModal assignment={assignment} patientId={patientId} doctor={doctor} onClose={()=>setShowLog(false)} />
      )}
    </div>
  );
}

// ── SOAP Note Card ────────────────────────────────────────────────────────────
function SOAPNoteCard({ note }: { note: ClinicalNote }) {
  const [open, setOpen] = useState(true);
  const TYPE_COLORS: Record<string,{bg:string;color:string}> = {
    soap:      { bg:'#eff6ff', color:'#1d4ed8' },
    progress:  { bg:'#f0fdf4', color:'#166534' },
    discharge: { bg:'#fef9c3', color:'#854d0e' },
    procedure: { bg:'#fdf4ff', color:'#7e22ce' },
  };
  const tc2 = TYPE_COLORS[note.type] || TYPE_COLORS.soap;

  return (
    <div style={{ background:'#fff', border:'1.5px solid #e8eef5', borderRadius:12, marginBottom:8, overflow:'hidden' }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background:'#fafbfd' }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:99, background:tc2.bg, color:tc2.color }}>📝 {note.type.toUpperCase()}</span>
          {note.tags?.map(t => (
            <span key={t} style={{ fontSize:9, background:'#eff6ff', color:'#3b82f6', borderRadius:99, padding:'2px 6px', fontWeight:700 }}>{t}</span>
          ))}
          {note.private && <span style={{ fontSize:9, background:'#fef2f2', color:'#ef4444', borderRadius:99, padding:'2px 6px', fontWeight:700 }}>🔒 Private</span>}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:10, color:'#8fa3bd' }}>{fmtDate(note.createdAt)} · Dr. {note.doctorName}</span>
          <span style={{ fontSize:11, color:'#8fa3bd' }}>{open?'▲':'▼'}</span>
        </div>
      </div>

      {open && (
        <div style={{ padding:'12px 14px' }}>
          {note.type === 'soap' ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                ['S — Subjective', note.content.subjective],
                ['O — Objective',  note.content.objective],
                ['A — Assessment', note.content.assessment],
                ['P — Plan',       note.content.plan],
              ].map(([k, v]) => v ? (
                <div key={k as string} style={{ padding:'9px 11px', background:'#f8fafc', borderRadius:8, border:'1px solid #e2e9f3' }}>
                  <div style={{ fontSize:9, fontWeight:800, color:'#0f172a', marginBottom:4, textTransform:'uppercase', letterSpacing:.4 }}>{k}</div>
                  <div style={{ fontSize:12, color:'#4a5568', lineHeight:1.6 }}>{v}</div>
                </div>
              ) : null)}
            </div>
          ) : (
            <div style={{ fontSize:12, color:'#4a5568', lineHeight:1.7 }}>{note.content.text}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main column component ─────────────────────────────────────────────────────
export default function ClinicalJourneyColumn({
  patientId, doctor, assignments, allReadings,
  onOpenAssign, onOpenNote, onOpenRx, onOpenLab, onOpenImaging, onOpenAlert,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Monitoring');
  const [notes,     setNotes]     = useState<ClinicalNote[]>([]);
  const [rxList,    setRxList]    = useState<Prescription[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = onSnapshot(
      query(collection(db,'clinicalNotes'), where('patientId','==',patientId), orderBy('createdAt','desc'), limit(50)),
      s => setNotes(s.docs.map(d => ({ id:d.id, ...d.data() } as ClinicalNote))),
    );
    const q2 = onSnapshot(
      query(collection(db,'prescriptions'), where('patientId','==',patientId), orderBy('createdAt','desc'), limit(50)),
      s => setRxList(s.docs.map(d => ({ id:d.id, ...d.data() } as Prescription))),
    );
    return () => { q(); q2(); };
  }, [patientId]);

  return (
    <div style={cs.col}>
      {/* Tab bar */}
      <div style={cs.tabBar}>
        {TABS.map(t => (
          <button key={t} onClick={()=>setActiveTab(t)} style={{ ...cs.tab, ...(activeTab===t?cs.tabOn:{}) }}>
            {t}
          </button>
        ))}
        <button onClick={onOpenAssign} style={cs.assignBtn}>+ Tool</button>
      </div>

      {/* Content */}
      <div ref={scrollRef} style={cs.colBody}>

        {/* MONITORING tab */}
        {activeTab === 'Monitoring' && (
          <>
            {assignments.length === 0 ? (
              <div style={cs.emptyState}>
                <div style={{ fontSize:40, marginBottom:12 }}>🩺</div>
                <div style={{ fontSize:15, fontWeight:700, color:'#4a5568', marginBottom:8 }}>No monitoring tools assigned</div>
                <div style={{ fontSize:12, color:'#8fa3bd', marginBottom:16, lineHeight:1.6, maxWidth:280 }}>
                  Assign monitoring tools to start tracking chronic disease parameters and walking with this patient.
                </div>
                <button onClick={onOpenAssign} style={cs.emptyBtn}>🩺 Assign First Tool</button>
              </div>
            ) : (
              assignments.map(a => (
                <MonitoringCard
                  key={a.id} assignment={a} readings={allReadings[a.id]||[]}
                  doctor={doctor} patientId={patientId} prescriptions={rxList}
                  onOpenRx={onOpenRx} onOpenLab={onOpenLab}
                  onOpenImaging={onOpenImaging} onOpenAlert={onOpenAlert}
                  onOpenNote={onOpenNote}
                />
              ))
            )}
          </>
        )}

        {/* SOAP NOTES tab */}
        {activeTab === 'SOAP notes' && (
          <div style={{ padding:'12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6 }}>
                {notes.length} clinical note{notes.length!==1?'s':''}
              </div>
              <button onClick={onOpenNote} style={cs.newBtn}>+ New note</button>
            </div>
            {notes.length === 0
              ? <div style={cs.emptyState}><div style={{ fontSize:28, marginBottom:8 }}>📝</div>No clinical notes yet</div>
              : notes.map(n => <SOAPNoteCard key={n.id} note={n} />)
            }
          </div>
        )}

        {/* TEACHING tab */}
        {activeTab === 'Teaching' && (
          <div style={{ padding:'12px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, marginBottom:12 }}>
              Disease education — assigned conditions
            </div>
            {assignments.map(a => {
              const g = GUIDANCE[a.toolType];
              const cfg = TOOL_CONFIGS[a.toolType];
              if (!g) return null;
              return (
                <div key={a.id} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:'#0d1b2a', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                    <span>{cfg?.icon}</span> {cfg?.name}
                  </div>
                  {g.complications?.map((c:any, i:number) => (
                    <div key={i} style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10, padding:'11px 13px', marginBottom:7 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#92400e', marginBottom:3 }}>{c.icon} {c.name}</div>
                      <div style={{ fontSize:11, color:'#4a5568', marginBottom:3 }}>Signs: {c.signs}</div>
                      <div style={{ fontSize:11, color:'#ef4444', fontWeight:700 }}>Action: {c.action}</div>
                    </div>
                  ))}
                  {g.lifestyle && (
                    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'11px 13px', marginBottom:7 }}>
                      <div style={{ fontSize:10, fontWeight:800, color:'#166534', textTransform:'uppercase', letterSpacing:.4, marginBottom:7 }}>Lifestyle advice</div>
                      {g.lifestyle.map((l:string, i:number) => (
                        <div key={i} style={{ fontSize:11, color:'#4a5568', padding:'3px 0', display:'flex', gap:8 }}>
                          <span style={{ color:'#10b981', fontWeight:800 }}>✓</span>{l}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {assignments.length === 0 && (
              <div style={cs.emptyState}>Assign monitoring tools to see teaching content</div>
            )}
          </div>
        )}

        {/* FULL TIMELINE tab — chronological merge */}
        {activeTab === 'Full timeline' && (
          <div style={{ padding:'12px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, marginBottom:12 }}>
              Full chronological journey
            </div>
            {notes.map(n => (
              <div key={n.id} style={{ display:'flex', gap:10, marginBottom:12 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#0aaa76', marginTop:3 }} />
                  <div style={{ width:1, flex:1, background:'#e2e9f3', marginTop:4 }} />
                </div>
                <div style={{ flex:1, paddingBottom:8 }}>
                  <div style={{ fontSize:10, color:'#8fa3bd', marginBottom:4 }}>{fmtDate(n.createdAt)} · Dr. {n.doctorName}</div>
                  <SOAPNoteCard note={n} />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Column styles ─────────────────────────────────────────────────────────────
const cs: Record<string, React.CSSProperties> = {
  col: { background:'#f5f8fc', borderRight:'1px solid #e8eef5', display:'flex', flexDirection:'column', minHeight:0 },
  tabBar: { display:'flex', borderBottom:'1px solid #e8eef5', background:'#fff', flexShrink:0, overflowX:'auto' as const },
  tab: { flex:1, minWidth:'fit-content', padding:'10px 6px', border:'none', background:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:600, color:'#94a3b8', borderBottom:'2.5px solid transparent', whiteSpace:'nowrap' as const, transition:'all .15s' },
  tabOn: { color:'#0aaa76', borderBottomColor:'#0aaa76' },
  assignBtn: { padding:'8px 12px', background:'#0aaa76', border:'none', color:'#fff', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0 },
  colBody: { overflowY:'auto', flex:1 },
  card: { background:'#fff', borderRadius:14, margin:'10px', overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,.04)' },
  cardHead: { padding:'13px 16px', borderBottom:'1px solid #f1f5f9' },
  toolIcon: { width:40, height:40, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 },
  toolName: { fontSize:14, fontWeight:800, color:'#0d1b2a' },
  toolSub: { fontSize:10, color:'#8fa3bd', marginTop:1 },
  expandBtn: { background:'transparent', border:'none', cursor:'pointer', fontSize:14, color:'#8fa3bd' },
  emptyChart: { textAlign:'center', color:'#8fa3bd', padding:'24px 0', fontSize:12, lineHeight:1.6 },
  emptyState: { textAlign:'center', color:'#8fa3bd', padding:'48px 24px', fontSize:12, lineHeight:1.6 },
  emptyBtn: { padding:'11px 22px', background:'#0aaa76', border:'none', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  newBtn: { padding:'6px 14px', background:'#0aaa76', border:'none', color:'#fff', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
};