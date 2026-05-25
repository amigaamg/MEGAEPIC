'use client';
// ════════════════════════════════════════════════════════════════════
// components/wall/AlertsColumn.tsx
// ════════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WallDoctor } from '@/components/PatientWallPage';

interface Alert {
  id: string; patientId: string; doctorId: string; type: string;
  title: string; message: string; read: boolean; urgency: string; createdAt: any;
}
interface FollowUp {
  id: string; patientId: string; date: any; type: string; note: string;
  doctorName: string; location: string; status: string;
}

const URGENCY_COLOR: Record<string,string> = { emergency:'#ef4444', urgent:'#f97316', routine:'#10b981', info:'#6366f1' };

const fmtDate = (ts:any) => { if(!ts)return'—'; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}); };
const fmtAgo  = (ts:any) => { if(!ts)return''; const d=ts?.toDate?ts.toDate():new Date(ts); const s=Math.floor((Date.now()-d.getTime())/1000); if(s<60)return'Just now'; if(s<3600)return`${Math.floor(s/60)}m ago`; if(s<86400)return`${Math.floor(s/3600)}h ago`; return fmtDate(ts); };

export function AlertsColumn({ patientId, doctor, onOpenAlert }: { patientId:string; doctor:WallDoctor; onOpenAlert:()=>void }) {
  const [alerts,    setAlerts]    = useState<Alert[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db,'alerts'), where('patientId','==',patientId), orderBy('createdAt','desc'), limit(50)), s=>setAlerts(s.docs.map(d=>({id:d.id,...d.data()} as Alert))));
    const u2 = onSnapshot(query(collection(db,'followUps'), where('patientId','==',patientId), orderBy('date','asc'), limit(10)), s=>setFollowUps(s.docs.map(d=>({id:d.id,...d.data()} as FollowUp))));
    return () => { u1(); u2(); };
  }, [patientId]);

  const unread = alerts.filter(a => !a.read).length;

  return (
    <div style={{ background:'#fff', display:'flex', flexDirection:'column', minHeight:0 }}>
      <div style={{ padding:'9px 12px', borderBottom:'1px solid #e8eef5', fontSize:10, fontWeight:700, color:'#8fa3bd', textTransform:'uppercase' as const, letterSpacing:.6, display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafbfd', flexShrink:0 }}>
        <span>Alerts {unread > 0 && <span style={{ background:'#ef4444', color:'#fff', borderRadius:99, fontSize:9, padding:'1px 5px', marginLeft:4 }}>{unread}</span>}</span>
        <button onClick={onOpenAlert} style={{ padding:'4px 9px', background:'#dc2626', border:'none', color:'#fff', borderRadius:6, fontSize:9, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Alert</button>
      </div>

      <div style={{ overflowY:'auto', flex:1 }}>
        {alerts.map(a => {
          const uc = URGENCY_COLOR[a.urgency] || '#64748b';
          return (
            <div key={a.id} onClick={() => !a.read && updateDoc(doc(db,'alerts',a.id),{ read:true })} style={{ padding:'10px 12px', borderBottom:'1px solid #e8eef5', display:'flex', gap:8, background:a.read?'#fff':'#f8faff', cursor:'pointer' }}>
              <div style={{ width:3, borderRadius:2, background:uc, flexShrink:0, alignSelf:'stretch' }} />
              <div style={{ flex:1 }}>
                {!a.read && <div style={{ width:6, height:6, borderRadius:'50%', background:uc, float:'right', marginTop:3 }} />}
                <div style={{ fontSize:12, fontWeight: a.read ? 600 : 800, color:'#0d1b2a', marginBottom:3, lineHeight:1.3 }}>{a.title}</div>
                <div style={{ fontSize:11, color:'#64748b', lineHeight:1.5 }}>{a.message}</div>
                <div style={{ fontSize:9, color:'#94a3b8', marginTop:4 }}>{fmtAgo(a.createdAt)} · {a.urgency}</div>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div style={{ textAlign:'center', color:'#8fa3bd', padding:'32px 16px', fontSize:12 }}>
            <div style={{ fontSize:24, marginBottom:6 }}>🔔</div>No alerts yet
          </div>
        )}

        {/* Follow-ups */}
        <div style={{ padding:'9px 12px', borderBottom:'1px solid #e8eef5', borderTop:'1px solid #e8eef5', fontSize:10, fontWeight:700, color:'#8fa3bd', textTransform:'uppercase' as const, letterSpacing:.6, background:'#fafbfd' }}>
          Follow-up schedule
        </div>
        {followUps.map(f => (
          <div key={f.id} style={{ padding:'10px 12px', borderBottom:'1px solid #e8eef5' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#0d1b2a' }}>{fmtDate(f.date)}</div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{f.type}</div>
            {f.note && <div style={{ fontSize:11, color:'#4a5568', marginTop:2 }}>{f.note}</div>}
            <div style={{ fontSize:10, color:'#8fa3bd', marginTop:3 }}>Dr. {f.doctorName} · {f.location}</div>
          </div>
        ))}
        {followUps.length === 0 && (
          <div style={{ textAlign:'center', color:'#8fa3bd', padding:'20px 16px', fontSize:12 }}>No follow-ups scheduled</div>
        )}
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════
// components/wall/IdentityColumn.tsx
// ════════════════════════════════════════════════════════════════════
import { Patient, WallDoctor as WD } from '@/components/PatientWallPage';
import { ToolAssignment } from '@/lib/diseaseTools';
import { TOOL_CONFIGS } from '@/lib/diseaseTools';

interface Milestone { id:string; patientId:string; date:any; title:string; type:string; }

const DOT_COLOR: Record<string,string> = { diagnosis:'#0aaa76', medication:'#6366f1', milestone:'#f97316', alert:'#ef4444', referral:'#7c3aed', lab:'#0891b2' };

export function IdentityColumn({ patient, patientId, doctor, assignments }: { patient:Patient; patientId:string; doctor:WD; assignments:ToolAssignment[] }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    const u = onSnapshot(query(collection(db,'milestones'), where('patientId','==',patientId), orderBy('date','desc'), limit(20)), s=>setMilestones(s.docs.map(d=>({id:d.id,...d.data()} as Milestone))));
    return u;
  }, [patientId]);

  const fDate = (ts:any) => { if(!ts)return'—'; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}); };

  return (
    <div style={{ background:'#fff', borderRight:'1px solid #e8eef5', display:'flex', flexDirection:'column', minHeight:0 }}>
      <div style={{ padding:'9px 12px', borderBottom:'1px solid #e8eef5', fontSize:10, fontWeight:700, color:'#8fa3bd', textTransform:'uppercase' as const, letterSpacing:.6, background:'#fafbfd', flexShrink:0 }}>
        Identity &amp; Context
      </div>
      <div style={{ overflowY:'auto', flex:1 }}>

        {/* Patient details */}
        <Section title="Patient details">
          {[
            ['Blood group', patient.bloodGroup||'—'],
            ['Height', patient.height ? `${patient.height} cm` : '—'],
            ['Weight + BMI', patient.weight ? `${patient.weight} kg · BMI ${patient.bmi||'?'}` : '—'],
            ['Insurance', patient.insurance||'—'],
            ['Next of kin', patient.nextOfKin||'—'],
          ].map(([l,v]) => (
            <div key={l as string} style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontSize:11, color:'#8fa3bd' }}>{l}</span>
              <span style={{ fontSize:11, color:'#0d1b2a', textAlign:'right', maxWidth:'55%' }}>{v}</span>
            </div>
          ))}
        </Section>

        {/* Primary doctor */}
        <Section title="Primary doctor">
          <div style={{ background:'#f8fafc', border:'1.5px solid #e8eef5', borderRadius:10, padding:'9px 11px', display:'flex', gap:9, alignItems:'center' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'#e0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#0aaa76', flexShrink:0 }}>
              {patient.primaryDoctorName?.split(' ').map(w=>w[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700 }}>{patient.primaryDoctorName}</div>
              <div style={{ fontSize:10, color:'#64748b', marginTop:1 }}>{patient.primaryDoctorSpec}</div>
              <div style={{ fontSize:10, color:'#8fa3bd', marginTop:1 }}>{patient.primaryDoctorFacility}</div>
            </div>
          </div>
        </Section>

        {/* Conditions */}
        <Section title="Active conditions">
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {patient.conditions?.map(c => (
              <span key={c} style={{ fontSize:10, padding:'2px 8px', borderRadius:99, background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', fontWeight:600 }}>{c}</span>
            ))}
          </div>
        </Section>

        {/* Allergies */}
        <Section title="Allergies &amp; warnings">
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {patient.allergies?.map(a => (
              <span key={a.drug} style={{ fontSize:10, padding:'2px 8px', borderRadius:99, background:'#fef2f2', color:'#ef4444', border:'1px solid #fecaca', fontWeight:700 }}>⚠ {a.drug}</span>
            ))}
            {patient.allergies?.length === 0 && <span style={{ fontSize:11, color:'#8fa3bd' }}>None recorded</span>}
          </div>
        </Section>

        {/* Assigned tools */}
        <Section title="Monitoring tools">
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {assignments.map(a => {
              const cfg = TOOL_CONFIGS[a.toolType];
              return cfg ? (
                <span key={a.id} style={{ fontSize:10, padding:'2px 8px', borderRadius:99, background:'#e0fdf4', color:'#0aaa76', border:'1px solid #6ee7b7', fontWeight:600 }}>
                  {cfg.icon} {cfg.name.split(' ')[0]}
                </span>
              ) : null;
            })}
            {assignments.length === 0 && <span style={{ fontSize:11, color:'#8fa3bd' }}>No tools assigned</span>}
          </div>
        </Section>

        {/* Consent */}
        <Section title="Data consent">
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:9, padding:'8px 10px', fontSize:11, color:'#166534' }}>
            ✅ Full access granted<br/>
            <span style={{ fontSize:10, opacity:.7 }}>All tools, notes, labs, imaging</span>
          </div>
        </Section>

        {/* Journey milestones */}
        <Section title="Journey milestones">
          {milestones.length === 0 ? (
            <div style={{ fontSize:11, color:'#8fa3bd' }}>No milestones recorded yet</div>
          ) : (
            milestones.map((m,i) => (
              <div key={m.id} style={{ display:'flex', gap:8, marginBottom:10 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                  <div style={{ width:9, height:9, borderRadius:'50%', background:DOT_COLOR[m.type]||'#0aaa76', marginTop:2 }} />
                  {i < milestones.length-1 && <div style={{ width:1, flex:1, background:'#e2e9f3', marginTop:3 }} />}
                </div>
                <div style={{ flex:1, paddingBottom:4 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#0d1b2a', lineHeight:1.3 }}>{m.title}</div>
                  <div style={{ fontSize:10, color:'#8fa3bd', marginTop:2 }}>{fDate(m.date)}</div>
                </div>
              </div>
            ))
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ padding:'11px 12px', borderBottom:'1px solid #e8eef5' }}>
      <div style={{ fontSize:9, fontWeight:700, color:'#8fa3bd', textTransform:'uppercase' as const, letterSpacing:.6, marginBottom:8 }}>{title}</div>
      {children}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════
// components/wall/PatientChat.tsx
// ════════════════════════════════════════════════════════════════════
import { useRef } from 'react';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { Patient as Pt } from '@/components/PatientWallPage';

interface ChatMessage { id:string; patientId:string; senderId:string; senderName:string; senderType:'doctor'|'patient'; message:string; attachments?:string[]; createdAt:any; read:boolean; }

const fmtChatTime = (ts:any) => { if(!ts)return''; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}); };
const fmtChatDate = (ts:any) => { if(!ts)return''; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('en-KE',{day:'numeric',month:'short'}); };

export function PatientChat({ patientId, doctor, patient }: { patientId:string; doctor:WallDoctor; patient:Pt }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const [open, setOpen]         = useState(true);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = onSnapshot(query(collection(db,'patientMessages'), where('patientId','==',patientId), orderBy('createdAt','asc'), limit(100)), s=>{
      setMessages(s.docs.map(d=>({id:d.id,...d.data()} as ChatMessage)));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50);
    });
    return u;
  }, [patientId]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await addDoc(collection(db,'patientMessages'), {
      patientId, senderId:doctor.uid, senderName:`Dr. ${doctor.name}`, senderType:'doctor',
      message:text.trim(), read:false, createdAt:serverTimestamp(),
    });
    // Create an alert for the patient
    await addDoc(collection(db,'alerts'), {
      patientId, doctorId:doctor.uid, type:'doctor_message',
      title:`💬 Message from Dr. ${doctor.name}`,
      message:text.trim(), read:false, createdAt:serverTimestamp(), urgency:'routine',
    });
    setText(''); setSending(false);
  };

  const unread = messages.filter(m => m.senderType==='patient' && !m.read).length;

  return (
    <div style={{ borderTop:'2px solid #e8eef5', background:'#fff' }}>
      {/* Chat header */}
      <div onClick={()=>setOpen(o=>!o)} style={{ padding:'10px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background:'#f8fafc', borderBottom:'1px solid #e8eef5' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontSize:14, fontWeight:800, color:'#0d1b2a' }}>💬 Patient messaging — {patient.name}</div>
          {unread > 0 && <span style={{ background:'#6366f1', color:'#fff', borderRadius:99, fontSize:10, fontWeight:800, padding:'2px 8px' }}>{unread} unread</span>}
        </div>
        <span style={{ fontSize:11, color:'#8fa3bd' }}>{open?'▲':'▼'}</span>
      </div>

      {open && (
        <>
          {/* Messages */}
          <div style={{ maxHeight:220, overflowY:'auto', padding:'12px 20px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign:'center', color:'#8fa3bd', padding:'24px', fontSize:12 }}>No messages yet. Send the first message to start communicating with this patient.</div>
            )}
            {messages.map((m,i) => {
              const isDoc = m.senderType === 'doctor';
              const showDate = i===0 || fmtChatDate(messages[i-1]?.createdAt) !== fmtChatDate(m.createdAt);
              return (
                <div key={m.id}>
                  {showDate && (
                    <div style={{ textAlign:'center', fontSize:10, color:'#8fa3bd', margin:'8px 0', fontWeight:600 }}>{fmtChatDate(m.createdAt)}</div>
                  )}
                  <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:10, flexDirection: isDoc?'row-reverse':'row' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background: isDoc?'#e0fdf4':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color: isDoc?'#0aaa76':'#6366f1', flexShrink:0 }}>
                      {m.senderName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ maxWidth:'75%' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#8fa3bd', marginBottom:3, textAlign: isDoc?'right':'left' }}>{m.senderName}</div>
                      <div style={{ background: isDoc?'#f0fdf4':'#f8faff', border:`1px solid ${isDoc?'#bbf7d0':'#e0e7ff'}`, borderRadius: isDoc?'12px 12px 0 12px':'12px 12px 12px 0', padding:'9px 12px', fontSize:12, color:'#0d1b2a', lineHeight:1.6 }}>
                        {m.message}
                      </div>
                      <div style={{ fontSize:9, color:'#c4d0de', marginTop:3, textAlign: isDoc?'right':'left' }}>{fmtChatTime(m.createdAt)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div style={{ padding:'10px 20px', borderTop:'1px solid #e8eef5', display:'flex', gap:8, alignItems:'center', background:'#fafbfd' }}>
            <input
              value={text}
              onChange={e=>setText(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
              placeholder={`Message ${patient.name}…`}
              style={{ flex:1, padding:'9px 13px', border:'1.5px solid #e8eef5', borderRadius:10, fontSize:12, outline:'none', background:'#fff', fontFamily:'inherit' }}
            />
            <button onClick={send} disabled={!text.trim()||sending} style={{ padding:'9px 18px', background: text.trim()?'#0aaa76':'#e2e9f3', border:'none', color: text.trim()?'#fff':'#8fa3bd', borderRadius:10, fontSize:12, fontWeight:700, cursor: text.trim()?'pointer':'default', fontFamily:'inherit', transition:'all .15s' }}>
              {sending?'Sending…':'Send'}
            </button>
            <button style={{ padding:'9px 12px', border:'1.5px solid #e8eef5', background:'#fff', borderRadius:10, fontSize:11, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>
              Attach reading
            </button>
          </div>
        </>
      )}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════
// components/wall/QuickActionBar.tsx
// ════════════════════════════════════════════════════════════════════
interface QAProps {
  onAssign:()=>void; onNote:()=>void; onPrescribe:()=>void;
  onLab:()=>void; onImaging:()=>void; onRefer:()=>void;
  onAlert:()=>void; onPDF:()=>void;
}
export function QuickActionBar({ onAssign,onNote,onPrescribe,onLab,onImaging,onRefer,onAlert,onPDF }: QAProps) {
  const actions = [
    { label:'+ Assign tool',    fn:onAssign,    bg:'#0aaa76', color:'#fff' },
    { label:'Write SOAP note',  fn:onNote,      bg:'transparent', color:'#374151', border:'1.5px solid #e2e9f3' },
    { label:'Prescribe',        fn:onPrescribe, bg:'transparent', color:'#374151', border:'1.5px solid #e2e9f3' },
    { label:'Order lab',        fn:onLab,       bg:'transparent', color:'#374151', border:'1.5px solid #e2e9f3' },
    { label:'Order imaging',    fn:onImaging,   bg:'transparent', color:'#374151', border:'1.5px solid #e2e9f3' },
    { label:'Refer patient',    fn:onRefer,     bg:'transparent', color:'#374151', border:'1.5px solid #e2e9f3' },
    { label:'🔔 Send alert',    fn:onAlert,     bg:'#fef2f2', color:'#dc2626', border:'1.5px solid #fecaca' },
    { label:'Export PDF',       fn:onPDF,       bg:'#eff6ff', color:'#1d4ed8', border:'1.5px solid #bfdbfe', marginLeft:'auto' },
  ];
  return (
    <div style={{ background:'#fff', borderBottom:'1px solid #e8eef5', padding:'8px 20px', display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
      <span style={{ fontSize:10, color:'#8fa3bd', fontWeight:700, textTransform:'uppercase', letterSpacing:.5, flexShrink:0 }}>Quick actions:</span>
      {actions.map(({ label,fn,bg,color,border,marginLeft }) => (
        <button key={label} onClick={fn} style={{ padding:'6px 13px', background:bg, color, border:border||'none', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginLeft:(marginLeft as any)||0, whiteSpace:'nowrap' as const, transition:'opacity .12s' }}>
          {label}
        </button>
      ))}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════
// components/wall/PDFExportBar.tsx
// ════════════════════════════════════════════════════════════════════
import { Patient as P2, WallDoctor as WD2 } from '@/components/PatientWallPage';
import { ToolAssignment as TA, ToolReading as TR } from '@/lib/diseaseTools';

interface PDFProps {
  patientId:string; patient:P2; doctor:WD2; assignments:TA[]; allReadings:Record<string,TR[]>;
}

const PDF_SECTIONS = [
  { key:'identity',    label:'Patient identity' },
  { key:'notes',       label:'SOAP notes' },
  { key:'monitoring',  label:'Monitoring trends' },
  { key:'prescriptions',label:'Prescriptions' },
  { key:'labs',        label:'Labs & results' },
  { key:'imaging',     label:'Imaging' },
  { key:'referral',    label:'Referral letter' },
  { key:'adherence',   label:'Adherence report' },
  { key:'teaching',    label:'Patient teaching' },
] as const;

export function PDFExportBar({ patientId, patient, doctor, assignments, allReadings }: PDFProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(['identity','notes','monitoring','prescriptions','labs','referral']));
  const [generating, setGen]    = useState(false);

  const toggle = (k:string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(k) ? next.delete(k) : next.add(k);
    return next;
  });

  const generate = async () => {
    setGen(true);
    // Open print window with selected sections
    window.open(`/patients/${patientId}/wall/print?sections=${[...selected].join(',')}&doctor=${doctor.uid}`, '_blank');
    setTimeout(() => setGen(false), 2000);
  };

  return (
    <div style={{ background:'#fafbfd', borderTop:'2px solid #e8eef5', padding:'10px 20px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
      <span style={{ fontSize:10, color:'#8fa3bd', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:.5, flexShrink:0 }}>Export PDF:</span>
      {PDF_SECTIONS.map(({ key, label }) => (
        <label key={key} style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer', fontSize:11, color: selected.has(key)?'#0d1b2a':'#8fa3bd', fontWeight: selected.has(key)?600:400 }}>
          <input
            type="checkbox"
            checked={selected.has(key)}
            onChange={() => toggle(key)}
            style={{ width:14, height:14, accentColor:'#0aaa76', cursor:'pointer' }}
          />
          {label}
        </label>
      ))}
      <div style={{ display:'flex', gap:6, marginLeft:'auto' }}>
        <button onClick={generate} disabled={generating} style={{ padding:'8px 16px', background:'#0aaa76', border:'none', color:'#fff', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          {generating ? 'Generating…' : `📄 Generate PDF (${selected.size} sections)`}
        </button>
        <button onClick={() => window.open(`/patients/${patientId}/wall/print?sections=all&doctor=${doctor.uid}`, '_blank')} style={{ padding:'8px 14px', background:'transparent', border:'1.5px solid #e2e9f3', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#374151' }}>
          Full record
        </button>
      </div>
      <div style={{ width:'100%', fontSize:10, color:'#8fa3bd', textAlign:'right' }}>
        Patient lifetime record · Started {patient.createdAt ? new Date(patient.createdAt?.toDate?.() || patient.createdAt).toLocaleDateString('en-KE',{month:'long',year:'numeric'}) : '—'} · {assignments.length} active tools
      </div>
    </div>
  );
}