'use client';
// ═══════════════════════════════════════════════════════════════════════════════
// components/PatientToolLogger.tsx
// Patient self-logging interface — beautiful, guided, instant triage feedback
// Shows only assigned tools · Contextual guidance · Instant doctor alert
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toolAssignmentsRef, toolReadingsRef } from '@/lib/collections';
import { TOOL_CONFIGS, ToolAssignment, ToolReading } from '@/lib/diseaseTools';
import { evaluateReading } from '@/lib/triageRules';

// ─── Colours ─────────────────────────────────────────────────────────────────
const LEVEL_COLOR: Record<string,string> = { normal:'#10b981', watch:'#f59e0b', video:'#6366f1', clinic:'#f97316', hospital:'#ef4444' };
const LEVEL_BG: Record<string,string>    = { normal:'#f0fdf4', watch:'#fffbeb', video:'#eef2ff', clinic:'#fff7ed', hospital:'#fef2f2' };
const LEVEL_BORDER: Record<string,string>= { normal:'#bbf7d0', watch:'#fde68a', video:'#c7d2fe', clinic:'#fed7aa', hospital:'#fecaca' };
const LEVEL_ICON: Record<string,string>  = { normal:'✅', watch:'👀', video:'📹', clinic:'⚠️', hospital:'🚨' };
const LEVEL_MSG: Record<string,string>   = { normal:'All good! Reading is within target range.', watch:'Monitor closely — slightly outside range.', video:'Book a video consultation soon.', clinic:'Please book an urgent clinic appointment.', hospital:'Seek emergency care immediately — call 999.' };

const fmtAgo = (ts:any) => {
  if(!ts)return''; const d=ts?.toDate?ts.toDate():new Date(ts); const s=Math.floor((Date.now()-d.getTime())/1000);
  if(s<60)return'Just now'; if(s<3600)return`${Math.floor(s/60)}m ago`;
  if(s<86400)return`${Math.floor(s/3600)}h ago`;
  return d.toLocaleDateString('en-KE',{day:'numeric',month:'short'});
};

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ level, label, message, onDismiss, onBookClinic }: { level:string; label:string; message:string; onDismiss:()=>void; onBookClinic?:()=>void }) {
  const c = LEVEL_COLOR[level]||'#10b981';
  const bg = LEVEL_BG[level]||'#f0fdf4';
  const border = LEVEL_BORDER[level]||'#bbf7d0';
  return (
    <div style={{ background:bg, border:`2px solid ${border}`, borderRadius:14, padding:'18px 20px', marginTop:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        <span style={{ fontSize:28 }}>{LEVEL_ICON[level]||'✅'}</span>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:c }}>{label}</div>
          <div style={{ fontSize:12, color:'#4a5568', marginTop:2, lineHeight:1.5 }}>{message}</div>
        </div>
      </div>
      {level!=='normal'&&<div style={{ fontSize:11, color:c, fontWeight:700, marginBottom:10 }}>{LEVEL_MSG[level]}</div>}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {level!=='normal'&&onBookClinic&&(
          <button onClick={onBookClinic} style={{ padding:'8px 16px', background:c, color:'#fff', border:'none', borderRadius:9, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            {level==='hospital'?'🚨 Emergency contacts':'📅 Book appointment'}
          </button>
        )}
        <button onClick={onDismiss} style={{ padding:'8px 14px', background:'transparent', border:`1.5px solid ${border}`, borderRadius:9, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>
          Log another reading
        </button>
      </div>
    </div>
  );
}

// ─── Single Tool Logger ───────────────────────────────────────────────────────
function ToolLogger({ assignment, patientId, doctorId, latestReading, onLogged }: {
  assignment: ToolAssignment; patientId:string; doctorId:string;
  latestReading?: ToolReading; onLogged: ()=>void;
}) {
  const config = TOOL_CONFIGS[assignment.toolType];
  const [form, setForm]     = useState<Record<string,any>>({});
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(false);

  if (!config) return null;
  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    // Validate required fields
    const missing = config.fields.filter((f:any)=>f.required && (form[f.key]===undefined||form[f.key]===''));
    if (missing.length) { alert(`Please fill in: ${missing.map((f:any)=>f.label).join(', ')}`); return; }
    setSaving(true);
    try {
      const tr = evaluateReading(config.id, form);
      const doc = {
        toolType:config.id, patientId, doctorId,
        assignmentId:assignment.id, enteredBy:'patient',
        data:{...form, note:note||undefined},
        recordedAt:serverTimestamp(), doctorReviewed:false,
        triage:{ level:tr.level, label:tr.label, message:tr.message, urgency:tr.urgency, alertDoctor:tr.alertDoctor, alertPatient:tr.alertPatient },
      };
      await addDoc(collection(db, 'toolReadings'), doc);
      // Alert if non-normal
      if (tr.alertDoctor || tr.level!=='normal') {
        await addDoc(collection(db,'alerts'), {
          patientId, doctorId, type:'triage',
          title:`${tr.level==='hospital'?'🚨':tr.level==='clinic'?'⚠️':'👀'} ${config.name} Alert — ${tr.label}`,
          message:`Patient reading: ${tr.message}`,
          read:false, createdAt:serverTimestamp(), urgency:tr.urgency||'routine',
        });
      }
      setResult(tr); setForm({}); setNote('');
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div style={{ background:'#fff', border:`2px solid ${result ? LEVEL_BORDER[result.level]||'#e2e9f3' : '#e8eef5'}`, borderRadius:16, overflow:'hidden', marginBottom:12, transition:'border-color .2s' }}>
      {/* Header */}
      <div style={{ padding:'14px 18px', background:`linear-gradient(135deg,${config.color}10,${config.color}04)`, borderBottom:`1px solid ${config.color}20` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:44, height:44, borderRadius:13, background:`${config.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{config.icon}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:'#0d1b2a' }}>{config.name}</div>
              <div style={{ fontSize:10, color:'#8fa3bd', marginTop:1, fontWeight:600 }}>{assignment.frequency||config.frequency}</div>
              {(assignment as any).targets&&<div style={{ fontSize:10, color:config.color, marginTop:1, fontWeight:700 }}>🎯 Target: {(assignment as any).targets}</div>}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {latestReading&&(
              <div style={{ textAlign:'right', paddingTop:2 }}>
                <div style={{ fontSize:13, fontWeight:900, fontFamily:'monospace', color:LEVEL_COLOR[latestReading.triage?.level||'normal'], lineHeight:1 }}>
                  {assignment.toolType==='bp_monitor'
                    ?`${latestReading.data.systolic||'—'}/${latestReading.data.diastolic||'—'}`
                    :config.chartFields?.[0]?(latestReading.data[config.chartFields[0]]||'—'):'—'}
                </div>
                <div style={{ fontSize:9, color:'#8fa3bd' }}>Last: {fmtAgo(latestReading.recordedAt)}</div>
              </div>
            )}
            <button onClick={()=>setShowGuide(g=>!g)} style={{ padding:'5px 10px', background:`${config.color}15`, border:`1px solid ${config.color}30`, borderRadius:7, fontSize:10, fontWeight:700, cursor:'pointer', color:config.color, fontFamily:'inherit' }}>
              {showGuide?'▲ Hide':'📖 Guide'}
            </button>
          </div>
        </div>

        {/* Doctor instructions */}
        {assignment.instructions&&(
          <div style={{ marginTop:10, padding:'8px 12px', background:'#eff6ff', borderRadius:9, border:'1px solid rgba(99,102,241,.2)', fontSize:11, color:'#1e293b', display:'flex', gap:8 }}>
            <span style={{ fontWeight:700, color:'#6366f1', flexShrink:0 }}>👨‍⚕️</span>
            <span>{assignment.instructions}</span>
          </div>
        )}

        {/* Guide */}
        {showGuide&&(
          <div style={{ marginTop:10, padding:'10px 12px', background:'#f8fafc', borderRadius:10, border:'1px solid #e2e9f3' }}>
            <div style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, marginBottom:6 }}>📖 How to measure</div>
            <div style={{ fontSize:11, color:'#4a5568', lineHeight:1.7 }}>{config.description}</div>
          </div>
        )}
      </div>

      {/* Form */}
      <div style={{ padding:'16px 18px' }}>
        {!result ? (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:10, marginBottom:10 }}>
              {config.fields.map((f:any) => (
                <div key={f.key}>
                  <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span>{f.label}{f.required?' *':''}</span>
                    {f.unit&&<span style={{ color:config.color, fontWeight:700 }}>{f.unit}</span>}
                  </label>
                  {f.type==='number'&&(
                    <input type="number" min={f.min} max={f.max} step={f.step||1}
                      value={form[f.key]??''} placeholder={f.min!==undefined?`${f.min}–${f.max}`:f.placeholder||''}
                      onChange={e=>set(f.key,e.target.value===''?undefined:Number(e.target.value))}
                      style={{ width:'100%', padding:'11px 12px', background:'#f8fafc', border:`2px solid ${form[f.key]!==undefined?config.color+'60':'#e2e9f3'}`, borderRadius:10, fontSize:16, fontWeight:700, fontFamily:'monospace', outline:'none', transition:'border-color .15s', textAlign:'center' }}
                    />
                  )}
                  {f.type==='select'&&(
                    <select value={form[f.key]??''} onChange={e=>set(f.key,e.target.value)}
                      style={{ width:'100%', padding:'11px 12px', background:'#f8fafc', border:'2px solid #e2e9f3', borderRadius:10, fontSize:13, fontFamily:'inherit', outline:'none' }}>
                      <option value="">Select…</option>
                      {f.options?.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                  {f.type==='text'&&(
                    <input type="text" value={form[f.key]??''} placeholder={f.placeholder}
                      onChange={e=>set(f.key,e.target.value)}
                      style={{ width:'100%', padding:'11px 12px', background:'#f8fafc', border:'2px solid #e2e9f3', borderRadius:10, fontSize:13, fontFamily:'inherit', outline:'none' }} />
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:10, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:5 }}>
                Note (optional) — symptoms, how you feel, context
              </label>
              <input type="text" value={note} onChange={e=>setNote(e.target.value)}
                placeholder="e.g. feeling dizzy, after exercise, fasting reading…"
                style={{ width:'100%', padding:'9px 12px', background:'#f8fafc', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontFamily:'inherit', outline:'none' }} />
            </div>

            <button onClick={save} disabled={saving}
              style={{ width:'100%', padding:'13px', background:`linear-gradient(135deg,${config.color},${config.color}cc)`, color:'#fff', border:'none', borderRadius:11, fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit', opacity:saving?.7:1, transition:'opacity .15s', letterSpacing:.3 }}>
              {saving?'Saving…':'📊 Log Reading'}
            </button>
          </>
        ) : (
          <ResultCard level={result.level} label={result.label} message={result.message}
            onDismiss={()=>{ setResult(null); onLogged(); }}
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
interface Props {
  patientId: string;
  doctorId?: string;
}

export default function PatientToolLogger({ patientId, doctorId = '' }: Props) {
  const [assignments, setAssignments] = useState<ToolAssignment[]>([]);
  const [latestReadings, setLatestReadings] = useState<Record<string,ToolReading>>({});
  const [loading, setLoading]  = useState(true);
  const [refresh, setRefresh]  = useState(0);

  useEffect(()=>{
    const unsub = onSnapshot(
      query(toolAssignmentsRef,where('patientId','==',patientId),where('active','==',true)),
      snap=>{ setAssignments(snap.docs.map(d=>d.data())); setLoading(false); }
    );
    return()=>unsub();
  },[patientId]);

  useEffect(()=>{
    if (!assignments.length) return;
    const unsubs = assignments.map(a=>
      onSnapshot(
        query(toolReadingsRef,where('patientId','==',patientId),where('assignmentId','==',a.id),orderBy('recordedAt','desc'),limit(1)),
        snap=>{ if (!snap.empty) setLatestReadings(prev=>({...prev,[a.id]:snap.docs[0].data()})); }
      )
    );
    return()=>unsubs.forEach(u=>u());
  },[assignments,patientId,refresh]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ textAlign:'center', color:'#8fa3bd' }}>
        <div style={{ width:32, height:32, border:'3px solid #e2e9f3', borderTopColor:'#0aaa76', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 8px' }} />
        <div style={{ fontSize:12 }}>Loading your tools…</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {assignments.length===0 ? (
        <div style={{ background:'#fff', borderRadius:16, border:'2px dashed #e2e9f3', padding:'40px 24px', textAlign:'center' }}>
          <div style={{ fontSize:44, marginBottom:10 }}>🩺</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#4a5568', marginBottom:5 }}>No monitoring tools assigned</div>
          <div style={{ fontSize:13, color:'#8fa3bd', maxWidth:360, margin:'0 auto', lineHeight:1.6 }}>
            Your doctor will assign monitoring tools after your consultation. Each tool lets you log health readings that your doctor monitors in real-time.
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:800, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.8, marginBottom:3 }}>
              My Monitoring Tools — {assignments.length} active
            </div>
            <div style={{ fontSize:11, color:'#8fa3bd' }}>Log your readings below. Your doctor is notified of any out-of-range values instantly.</div>
          </div>
          {assignments.map(a=>(
            <ToolLogger key={a.id} assignment={a} patientId={patientId} doctorId={a.doctorId||doctorId}
              latestReading={latestReadings[a.id]} onLogged={()=>setRefresh(r=>r+1)} />
          ))}
        </div>
      )}
    </div>
  );
}