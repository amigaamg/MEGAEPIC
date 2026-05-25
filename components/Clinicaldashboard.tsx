'use client';
// ═══════════════════════════════════════════════════════════════════════════════
// components/ClinicalDashboard.tsx
// AMEXAN — Premium Longitudinal Clinical Intelligence Dashboard
// 3-column EPR layout · Real Recharts chart with dose markers ·
// Compliance Gantt · Follow-up timeline · PDF via html2canvas + jsPDF
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc,
  orderBy, limit, serverTimestamp, Timestamp, getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TOOL_CONFIGS, ToolAssignment, ToolReading } from '@/lib/diseaseTools';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PatientProfile {
  name: string; age?: number; gender?: string; bloodGroup?: string;
  allergies?: string[]; condition?: string; riskLevel?: string;
  phone?: string; email?: string; photoURL?: string; address?: string;
  weight?: number; height?: number;
}
interface ToolMedication {
  id: string; toolAssignmentId: string; patientId: string;
  doctorId: string; doctorName: string;
  drugName: string; dose: string; doseValue: number; doseUnit: string;
  route: string; frequency: string; indication: string;
  startDate: any; endDate?: any; active: boolean; color: string;
  doseHistory: { dose: string; doseValue: number; changedAt: any; reason: string; doctorNote: string }[];
  createdAt: any;
}
interface ComplianceLog {
  id: string; medicationId: string; patientId: string;
  date: string; taken: boolean; loggedBy: string; createdAt: any;
}
interface ToolFollowUp {
  id: string; toolAssignmentId: string; patientId: string; doctorId: string;
  scheduledDate: any; type: 'clinic' | 'video' | 'phone';
  status: 'scheduled' | 'attended' | 'missed' | 'rescheduled';
  notes?: string; outcome?: string; createdAt: any;
}
interface ToolComplication {
  id: string; toolAssignmentId: string; patientId: string;
  type: string; severity: string; description: string;
  reportedAt: any; resolvedAt?: any; status: string;
  doctorNotified: boolean; appointmentBooked: boolean; createdAt: any;
}
interface DecisionNote {
  id: string; toolAssignmentId: string; patientId: string;
  doctorId: string; doctorName: string; note: string;
  eventType: string; chartMarker: boolean; linkedMedicationId?: string; createdAt: any;
}

// ─── Drug palette ─────────────────────────────────────────────────────────────
const DRUG_PAL = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#84cc16'];

// ─── Formatters ───────────────────────────────────────────────────────────────
const fd  = (ts: any) => { if (!ts) return '—'; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}); };
const fds = (ts: any) => { if (!ts) return ''; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString('en-KE',{day:'numeric',month:'short'}); };
const ft  = (ts: any) => { if (!ts) return ''; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}); };
const ymd = (ts: any) => { if (!ts) return ''; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toISOString().split('T')[0]; };
const today = () => new Date().toISOString().split('T')[0];

const TC: Record<string,string> = { normal:'#10b981', watch:'#f59e0b', video:'#6366f1', clinic:'#f97316', hospital:'#ef4444' };

function readingDisplay(toolType: string, data: any): { v: string; num: number|null } {
  if (!data) return { v:'—', num:null };
  switch(toolType) {
    case 'bp_monitor':      return { v:`${data.systolic??'—'}/${data.diastolic??'—'}`, num:data.systolic??null };
    case 'glucose_tracker': return { v:`${data.value??'—'} mmol/L`, num:data.value??null };
    case 'hba1c_tracker':   return { v:`${data.value??'—'}%`, num:data.value??null };
    case 'spo2_monitor':    return { v:`${data.spo2??'—'}%`, num:data.spo2??null };
    case 'peak_flow':       return { v:`${data.value??'—'} L/min`, num:data.value??null };
    case 'weight_tracker':  return { v:`${data.weight??'—'} kg`, num:data.weight??null };
    case 'pain_scale':      return { v:`${data.score??'—'}/10`, num:data.score??null };
    case 'mood_tracker':    return { v:`PHQ-9: ${data.phq9??'—'}`, num:data.phq9??null };
    case 'ecg_monitor':     return { v:`${data.heartRate??'—'} bpm`, num:data.heartRate??null };
    default: return { v:'—', num:null };
  }
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:10, padding:'10px 14px', fontSize:11, boxShadow:'0 12px 32px rgba(0,0,0,.4)', minWidth:160 }}>
      <div style={{ color:'#64748b', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>{label}</div>
      {payload.map((p:any,i:number) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, color:'#f8fafc', marginBottom:3 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:p.stroke||p.color, flexShrink:0 }} />
          <span style={{ color:'#94a3b8', minWidth:70 }}>{p.name}:</span>
          <span style={{ fontFamily:'monospace', fontWeight:800, color:'#f8fafc' }}>{typeof p.value==='number'?p.value.toFixed(1):p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
function RiskBadge({ level }: { level?: string }) {
  const c: Record<string,{bg:string;text:string;dot:string}> = {
    low:      { bg:'#dcfce7', text:'#15803d', dot:'#22c55e' },
    medium:   { bg:'#fef9c3', text:'#a16207', dot:'#eab308' },
    high:     { bg:'#ffedd5', text:'#c2410c', dot:'#f97316' },
    critical: { bg:'#fee2e2', text:'#b91c1c', dot:'#ef4444' },
  };
  const s = c[level?.toLowerCase()||'medium'] || c.medium;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', background:s.bg, borderRadius:99, fontSize:10, fontWeight:800, color:s.text }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot }} />
      {(level||'UNKNOWN').toUpperCase()}
    </span>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ title, icon, children, accent='#0aaa76', action, className }: {
  title: string; icon: string; children: React.ReactNode;
  accent?: string; action?: React.ReactNode; className?: string;
}) {
  return (
    <div className={className} style={{ background:'#fff', border:'1px solid #e8eef5', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:'10px 16px', borderBottom:'1px solid #e8eef5', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafbfd' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{icon}</div>
          <span style={{ fontSize:12, fontWeight:800, color:'#0d1b2a', letterSpacing:-.2 }}>{title}</span>
        </div>
        {action}
      </div>
      <div style={{ padding:'14px 16px' }}>{children}</div>
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({ label, val, color='#0aaa76', sub }: { label:string; val:string|number; color?:string; sub?:string }) {
  return (
    <div style={{ background:'#f8fafc', border:'1px solid #e8eef5', borderRadius:10, padding:'9px 12px', textAlign:'center' }}>
      <div style={{ fontSize:9, fontWeight:700, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.7, marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:19, fontWeight:900, fontFamily:'monospace', color, lineHeight:1 }}>{val}</div>
      {sub && <div style={{ fontSize:9, color:'#8fa3bd', marginTop:3 }}>{sub}</div>}
    </div>
  );
}

// ─── Compliance cell ──────────────────────────────────────────────────────────
function CompCell({ taken, onClick, date }: { taken:boolean|undefined; onClick:()=>void; date:string }) {
  const isToday = date === new Date().toISOString().split('T')[0];
  return (
    <div onClick={onClick} title={date}
      style={{
        width:20, height:20, borderRadius:4, cursor:'pointer', flexShrink:0,
        background: taken===true ? '#10b981' : taken===false ? '#ef444440' : '#f1f5f9',
        border: `1.5px solid ${taken===true?'#059669':taken===false?'#ef444460':isToday?'#0aaa76':'#e2e8f0'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:9, fontWeight:800, color:'#fff',
        transition:'all .1s',
      }}>
      {taken===true ? '✓' : taken===false ? '✗' : ''}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
interface Props {
  assignment:   ToolAssignment;
  readings:     ToolReading[];
  patientId:    string;
  patientName:  string;
  patientAge?:  number;
  patientGender?: string;
  allergies?:   string[];
  doctor:       { uid: string; name: string };
  isDoctor?:    boolean;
}

export default function ClinicalDashboard({
  assignment, readings, patientId, patientName, patientAge, patientGender,
  allergies, doctor, isDoctor,
}: Props) {
  if (!assignment?.toolType) return null;
  const cfg = TOOL_CONFIGS[assignment.toolType];
  if (!cfg) return null;

  const dashRef = useRef<HTMLDivElement>(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [profile,       setProfile]       = useState<PatientProfile|null>(null);
  const [medications,   setMedications]   = useState<ToolMedication[]>([]);
  const [compLogs,      setCompLogs]      = useState<ComplianceLog[]>([]);
  const [followUps,     setFollowUps]     = useState<ToolFollowUp[]>([]);
  const [complications, setComplications] = useState<ToolComplication[]>([]);
  const [decisionNotes, setDecisionNotes] = useState<DecisionNote[]>([]);
  const [snapshot,      setSnapshot]      = useState<any>({});
  const [editSnap,      setEditSnap]      = useState(false);
  const [snapForm,      setSnapForm]      = useState<any>({});
  const [genPDF,        setGenPDF]        = useState(false);
  const [showAddMed,    setShowAddMed]    = useState(false);
  const [showAddFU,     setShowAddFU]     = useState(false);
  const [doseModal,     setDoseModal]     = useState<ToolMedication|null>(null);

  useEffect(() => {
    if (!patientId) return;
    getDoc(doc(db,'users',patientId)).then(s=>{ if(s.exists()) setProfile(s.data() as PatientProfile); });
  }, [patientId]);

  useEffect(() => {
    const subs = [
      onSnapshot(query(collection(db,'toolMedications'), where('toolAssignmentId','==',assignment.id), orderBy('createdAt','asc')), s=>setMedications(s.docs.map(d=>({id:d.id,...d.data()} as ToolMedication)))),
      onSnapshot(query(collection(db,'toolComplianceLogs'), where('patientId','==',patientId), orderBy('date','desc'), limit(90)), s=>setCompLogs(s.docs.map(d=>({id:d.id,...d.data()} as ComplianceLog)))),
      onSnapshot(query(collection(db,'toolFollowUps'), where('toolAssignmentId','==',assignment.id), orderBy('scheduledDate','asc')), s=>setFollowUps(s.docs.map(d=>({id:d.id,...d.data()} as ToolFollowUp)))),
      onSnapshot(query(collection(db,'toolComplications'), where('toolAssignmentId','==',assignment.id), orderBy('reportedAt','desc')), s=>setComplications(s.docs.map(d=>({id:d.id,...d.data()} as ToolComplication)))),
      onSnapshot(query(collection(db,'toolDecisionNotes'), where('toolAssignmentId','==',assignment.id), orderBy('createdAt','desc')), s=>setDecisionNotes(s.docs.map(d=>({id:d.id,...d.data()} as DecisionNote)))),
    ];
    const snap = { chiefComplaint:'', hpi:'', examFindings:'', labsSummary:'', imagingSummary:'', diagnosis:'', icdCode:'', riskLevel:'high', plan:'', ...(assignment as any) };
    setSnapshot(snap); setSnapForm(snap);
    return () => subs.forEach(u=>u());
  }, [assignment.id, patientId]);

  // ── 28 days ────────────────────────────────────────────────────────────────
  const last28 = useMemo(() => {
    const d: string[] = [];
    for (let i=27; i>=0; i--) {
      const x=new Date(); x.setDate(x.getDate()-i);
      d.push(x.toISOString().split('T')[0]);
    }
    return d;
  }, []);

  const compByMedDate = useMemo(() => {
    const m: Record<string,Record<string,ComplianceLog>> = {};
    compLogs.forEach(c=>{ if(!m[c.medicationId]) m[c.medicationId]={}; m[c.medicationId][c.date]=c; });
    return m;
  }, [compLogs]);

  // ── Intelligence chart data ───────────────────────────────────────────────
  const chartData = useMemo(() => {
    const map: Record<string,any> = {};
    readings.slice(0,90).reverse().forEach(r => {
      const k = fds(r.recordedAt);
      if (!k) return;
      const ts = r.recordedAt?.toDate ? r.recordedAt.toDate() : new Date(r.recordedAt);
      if (!map[k]) map[k]={ date:k, _ts:ts };
      const d = r.data;
      if (assignment.toolType==='bp_monitor') { map[k].Systolic=d.systolic; map[k].Diastolic=d.diastolic; map[k].Pulse=d.pulse; }
      else if (assignment.toolType==='glucose_tracker') map[k].Glucose=d.value;
      else if (assignment.toolType==='spo2_monitor') map[k].SpO2=d.spo2;
      else if (assignment.toolType==='weight_tracker') map[k].Weight=d.weight;
      else if (assignment.toolType==='peak_flow') map[k].PEF=d.value;
      else if (assignment.toolType==='hba1c_tracker') map[k].HbA1c=d.value;
      else if (assignment.toolType==='pain_scale') map[k].Pain=d.score;
      else if (assignment.toolType==='ecg_monitor') map[k].HR=d.heartRate;
      else if (assignment.toolType==='mood_tracker') { map[k]['PHQ-9']=d.phq9; }
      map[k]._level = r.triage?.level||'normal';
    });
    medications.forEach(med => {
      const dk = `💊 ${med.drugName}`;
      Object.values(map).forEach((pt:any) => {
        const startD = med.startDate?.toDate?med.startDate.toDate():new Date(med.startDate||0);
        const endD   = med.endDate?.toDate?med.endDate.toDate():null;
        if (pt._ts<startD || (endD&&pt._ts>endD)) return;
        let dv = med.doseValue;
        for (const ch of (med.doseHistory||[])) {
          const cd = ch.changedAt?.toDate?ch.changedAt.toDate():new Date(ch.changedAt||0);
          if (cd<=pt._ts) dv=ch.doseValue;
        }
        pt[dk]=dv;
      });
    });
    return Object.values(map).sort((a,b)=>(a._ts?.getTime()||0)-(b._ts?.getTime()||0));
  }, [readings, medications, assignment.toolType]);

  // ── Chart lines config ────────────────────────────────────────────────────
  const readingLines = useMemo(() => {
    switch(assignment.toolType) {
      case 'bp_monitor': return [
        { key:'Systolic',  color:'#ef4444', width:2.5 },
        { key:'Diastolic', color:'#f97316', width:2, dash:'5 3' },
        { key:'Pulse',     color:'#8b5cf6', width:1.5, dash:'3 3' },
      ];
      case 'glucose_tracker': return [{ key:'Glucose', color:'#f59e0b', width:2.5 }];
      case 'spo2_monitor':    return [{ key:'SpO2',    color:'#06b6d4', width:2.5 }];
      case 'weight_tracker':  return [{ key:'Weight',  color:'#8b5cf6', width:2.5 }];
      case 'peak_flow':       return [{ key:'PEF',     color:'#10b981', width:2.5 }];
      case 'hba1c_tracker':   return [{ key:'HbA1c',   color:'#dc2626', width:2.5 }];
      case 'pain_scale':      return [{ key:'Pain',    color:'#f97316', width:2.5 }];
      case 'ecg_monitor':     return [{ key:'HR',      color:'#ef4444', width:2.5 }];
      case 'mood_tracker':    return [{ key:'PHQ-9',   color:'#6366f1', width:2.5 }];
      default: return [{ key:'Value', color:cfg.color, width:2.5 }];
    }
  }, [assignment.toolType, cfg.color]);

  // ── Dose change markers ───────────────────────────────────────────────────
  const doseMarkers = useMemo(() => {
    const m: { date:string; label:string; color:string; reason:string }[] = [];
    medications.forEach(med => {
      (med.doseHistory||[]).forEach(ch => {
        const d = fds(ch.changedAt);
        if (d) m.push({ date:d, label:`${med.drugName}\n${ch.dose}`, color:med.color, reason:ch.reason });
      });
    });
    return m;
  }, [medications]);

  // ── Compliance stats ──────────────────────────────────────────────────────
  const compStats = useMemo(() => {
    if (!medications.length) return null;
    let taken=0, total=0;
    medications.forEach(med => {
      const ml = compByMedDate[med.id]||{};
      last28.forEach(d => {
        const startD = med.startDate?.toDate?med.startDate.toDate():new Date(med.startDate||0);
        const dDate = new Date(d);
        if (dDate < startD) return;
        total++;
        if (ml[d]?.taken) taken++;
      });
    });
    return total ? Math.round((taken/total)*100) : 0;
  }, [medications, compByMedDate, last28]);

  // ── Toggle compliance ─────────────────────────────────────────────────────
  const toggleComp = async (medId:string, date:string) => {
    const existing = compByMedDate[medId]?.[date];
    if (existing) await updateDoc(doc(db,'toolComplianceLogs',existing.id),{ taken:!existing.taken });
    else await addDoc(collection(db,'toolComplianceLogs'),{ medicationId:medId, patientId, date, taken:true, loggedBy:isDoctor?'doctor':'patient', createdAt:serverTimestamp() });
  };

  // ── Follow-up status update ───────────────────────────────────────────────
  const updateFU = async (id:string, status:string) => {
    await updateDoc(doc(db,'toolFollowUps',id),{ status });
  };

  // ── Save snapshot ─────────────────────────────────────────────────────────
  const saveSnap = async () => {
    await updateDoc(doc(db,'toolAssignments',assignment.id), {
      chiefComplaint:snapForm.chiefComplaint, hpi:snapForm.hpi,
      examFindings:snapForm.examFindings, labsSummary:snapForm.labsSummary,
      imagingSummary:snapForm.imagingSummary, diagnosis:snapForm.diagnosis,
      icdCode:snapForm.icdCode, riskLevel:snapForm.riskLevel, plan:snapForm.plan,
    });
    setSnapshot(snapForm); setEditSnap(false);
  };

  // ── Generate PDF ──────────────────────────────────────────────────────────
  const generatePDF = async () => {
    setGenPDF(true);
    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jsPDFModule;

      const el = document.getElementById('clinical-dashboard-printzone');
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData   = canvas.toDataURL('image/png');
      const pdf       = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
      const pdfW      = pdf.internal.pageSize.getWidth();
      const pdfH      = pdf.internal.pageSize.getHeight();
      const ratio     = canvas.height / canvas.width;
      const imgH      = pdfW * ratio;
      let   heightLeft = imgH;
      let   position   = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH);
      heightLeft -= pdfH;

      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH);
        heightLeft -= pdfH;
      }

      pdf.save(`${patientName.replace(/\s+/g,'-')}_${cfg.name.replace(/\s+/g,'-')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error('PDF generation failed:', e);
      window.print();
    }
    setGenPDF(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  const latest   = readings[0];
  const { v: latestV } = readingDisplay(assignment.toolType, latest?.data);
  const tc       = latest?.triage;
  const triCol   = TC[tc?.level||'normal'];
  const riskLvl  = snapshot?.riskLevel || profile?.riskLevel || 'medium';
  const riskC: Record<string,string> = { low:'#22c55e', medium:'#f59e0b', high:'#f97316', critical:'#ef4444' };
  const now      = new Date().toLocaleDateString('en-KE',{day:'numeric',month:'long',year:'numeric'});

  const INP: React.CSSProperties = { width:'100%', padding:'8px 10px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:12, fontFamily:'inherit', outline:'none', color:'#0d1b2a' };
  const TA:  React.CSSProperties = { ...INP, resize:'vertical' as const };
  const LBL: React.CSSProperties = { fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase' as const, letterSpacing:.7, display:'block', marginBottom:4 };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", color:'#0d1b2a', background:'#f0f4f8', minHeight:'100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .cd-hover:hover { background:#f1f5f9 !important; }
        .cd-btn { transition:all .15s; }
        .cd-btn:hover { opacity:.85; transform:translateY(-1px); }
        @keyframes cd-spin { to { transform:rotate(360deg); } }
        @keyframes cd-pulse { 0%,100%{opacity:1}50%{opacity:.6} }
      `}</style>

      {/* ════════════════ TOP ACTION BAR ═══════════════════════════════════ */}
      <div style={{ background:'linear-gradient(135deg,#0d1b2a 0%,#0f3d2e 100%)', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`3px solid ${cfg.color}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`${cfg.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{cfg.icon}</div>
          <div>
            <div style={{ fontSize:14, fontWeight:900, color:'#fff', letterSpacing:-.3 }}>{patientName} — {cfg.name}</div>
            <div style={{ fontSize:10, color:'#4b5563', marginTop:1 }}>Dr. {doctor.name} · Assigned {fd((assignment as any).assignedAt)} · {readings.length} readings</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ background:`${triCol}25`, border:`1px solid ${triCol}60`, borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:800, color:triCol }}>
            {latestV} — {tc?.label||'Normal'}
          </div>
          <RiskBadge level={riskLvl} />
          <button className="cd-btn" onClick={generatePDF} disabled={genPDF}
            style={{ padding:'8px 18px', background:'#0aaa76', border:'none', color:'#fff', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
            {genPDF ? <><span style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'cd-spin .7s linear infinite',display:'inline-block' }} /> Generating…</> : '⬇ Export PDF'}
          </button>
        </div>
      </div>

      {/* ════════════════ PATIENT HEADER STRIP ════════════════════════════ */}
      <div id="clinical-dashboard-printzone">
      <div style={{ background:'#fff', borderBottom:'1px solid #e8eef5', padding:'14px 24px', display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
        {/* Avatar */}
        <div style={{ width:58, height:58, borderRadius:14, background:profile?.photoURL?'transparent':'linear-gradient(135deg,#0d1b2a,#0f3d2e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:'#fff', fontWeight:900, flexShrink:0, border:'2px solid #e8eef5', overflow:'hidden' }}>
          {profile?.photoURL ? <img src={profile.photoURL} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (patientName[0]||'P')}
        </div>
        {/* Identity */}
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ fontSize:20, fontWeight:900, letterSpacing:-.4 }}>{patientName}</span>
            {patientAge && <span style={{ fontSize:15, fontWeight:700, color:'#64748b' }}>{patientAge}{patientGender?patientGender[0].toUpperCase():''}</span>}
            {snapshot?.diagnosis && <span style={{ fontSize:11, background:'#eff6ff', color:'#2563eb', padding:'2px 9px', borderRadius:99, fontWeight:700, border:'1px solid #bfdbfe' }}>{snapshot.diagnosis}</span>}
            <RiskBadge level={riskLvl} />
            {snapshot?.icdCode && <span style={{ fontSize:10, background:'#f1f5f9', color:'#64748b', padding:'2px 7px', borderRadius:4, fontFamily:'monospace', fontWeight:700 }}>{snapshot.icdCode}</span>}
          </div>
          <div style={{ display:'flex', gap:16, marginTop:5, flexWrap:'wrap' }}>
            {profile?.email && <span style={{ fontSize:11, color:'#64748b' }}>✉ {profile.email}</span>}
            {profile?.phone && <span style={{ fontSize:11, color:'#64748b' }}>📞 {profile.phone}</span>}
          </div>
        </div>
        {/* Quick stats */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[
            { label:'Latest', val:latestV, color:triCol },
            { label:'Readings', val:readings.length, color:'#0d1b2a' },
            { label:'Compliance', val:compStats!==null?`${compStats}%`:'—', color:compStats!==null&&compStats>=80?'#10b981':compStats!==null&&compStats>=60?'#f59e0b':'#ef4444' },
            { label:'Follow-Ups', val:followUps.length, color:'#0369a1' },
          ].map(s => <StatChip key={s.label} label={s.label} val={s.val} color={s.color} />)}
        </div>
      </div>

      {/* ════════════════ 3-COLUMN BODY ═══════════════════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr 260px', gap:14, padding:'16px 24px', alignItems:'start' }}>

        {/* ╔══════════════════════════════════════
            COL 1 — CLINICAL CONTEXT
        ══════════════════════════════════════╗ */}
        <div>
          {/* Clinical Snapshot */}
          <Card title="Clinical Snapshot" icon="🩺" accent="#0369a1"
            action={isDoctor && (
              <button onClick={()=>editSnap?saveSnap():setEditSnap(true)}
                style={{ fontSize:10, fontWeight:700, padding:'4px 10px', background:editSnap?'#0aaa76':'#f1f5f9', border:'none', borderRadius:6, cursor:'pointer', color:editSnap?'#fff':'#334155', fontFamily:'inherit' }}>
                {editSnap?'💾 Save':'✏️ Edit'}
              </button>
            )}>
            <div style={{ fontSize:9, color:'#64748b', marginBottom:10 }}>Tool Assigned: <strong style={{ color:'#0d1b2a' }}>{fd((assignment as any).assignedAt)}</strong></div>
            {editSnap ? (
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {[
                  { k:'chiefComplaint', l:'Chief Complaint', ta:false },
                  { k:'diagnosis',      l:'Diagnosis',       ta:false },
                  { k:'icdCode',        l:'ICD-10',          ta:false },
                  { k:'hpi',            l:'Short HPI',       ta:true  },
                  { k:'examFindings',   l:'Exam Findings',   ta:true  },
                  { k:'labsSummary',    l:'Labs at Baseline',ta:true  },
                  { k:'imagingSummary', l:'Imaging',         ta:false },
                  { k:'plan',           l:'Plan',            ta:true  },
                ].map(f=>(
                  <div key={f.k}>
                    <label style={LBL}>{f.l}</label>
                    {f.ta
                      ? <textarea rows={2} value={snapForm[f.k]||''} onChange={e=>setSnapForm((p:any)=>({...p,[f.k]:e.target.value}))} style={TA} />
                      : <input value={snapForm[f.k]||''} onChange={e=>setSnapForm((p:any)=>({...p,[f.k]:e.target.value}))} style={INP} />
                    }
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {snapshot?.chiefComplaint && (
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:'#0d1b2a', marginBottom:3 }}>Chief Complaint</div>
                    <div style={{ fontSize:11, color:'#334155', lineHeight:1.6 }}>{snapshot.chiefComplaint}</div>
                  </div>
                )}
                {snapshot?.hpi && (
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:'#0d1b2a', marginBottom:3 }}>Short HPI</div>
                    <div style={{ fontSize:11, color:'#334155', lineHeight:1.6 }}>{snapshot.hpi}</div>
                  </div>
                )}
                {snapshot?.examFindings && (
                  <div style={{ background:'#f8fafc', borderRadius:8, padding:'8px 10px', border:'1px solid #e2e8f0' }}>
                    <div style={{ fontSize:10, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, marginBottom:4 }}>Exam</div>
                    <div style={{ fontSize:11, color:'#334155', lineHeight:1.7 }}>{snapshot.examFindings}</div>
                  </div>
                )}
                {snapshot?.labsSummary && (
                  <div style={{ background:'#f0fdfa', borderRadius:8, padding:'8px 10px', border:'1px solid #a7f3d0' }}>
                    <div style={{ fontSize:10, fontWeight:800, color:'#0891b2', textTransform:'uppercase', letterSpacing:.6, marginBottom:4 }}>Labs</div>
                    <div style={{ fontSize:11, color:'#334155', lineHeight:1.7 }}>{snapshot.labsSummary}</div>
                  </div>
                )}
                {snapshot?.imagingSummary && (
                  <div style={{ background:'#faf5ff', borderRadius:8, padding:'8px 10px', border:'1px solid #e9d5ff' }}>
                    <div style={{ fontSize:10, fontWeight:800, color:'#7c3aed', textTransform:'uppercase', letterSpacing:.6, marginBottom:4 }}>Imaging</div>
                    <div style={{ fontSize:11, color:'#334155', lineHeight:1.7 }}>{snapshot.imagingSummary}</div>
                  </div>
                )}
                {snapshot?.plan && (
                  <div style={{ background:'#eff6ff', borderRadius:8, padding:'8px 10px', border:'1px solid #bfdbfe' }}>
                    <div style={{ fontSize:10, fontWeight:800, color:'#2563eb', textTransform:'uppercase', letterSpacing:.6, marginBottom:4 }}>Plan</div>
                    <div style={{ fontSize:11, color:'#334155', lineHeight:1.7 }}>{snapshot.plan}</div>
                  </div>
                )}
                {!snapshot?.chiefComplaint && !snapshot?.hpi && (
                  <div style={{ textAlign:'center', padding:'16px 0', color:'#8fa3bd', fontSize:11 }}>
                    {isDoctor ? 'Click Edit to document the clinical snapshot' : 'Clinical snapshot will be added by your doctor'}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Doctor Decision Notes */}
          {decisionNotes.length > 0 && (
            <Card title="Doctor Notes" icon="📝" accent="#1e3a5f">
              <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:240, overflowY:'auto' }}>
                {decisionNotes.map(n => (
                  <div key={n.id} style={{ padding:'8px 10px', background:'#f0f9ff', borderLeft:`3px solid #0369a1`, borderRadius:'0 8px 8px 0', fontSize:11 }}>
                    <div style={{ fontWeight:700, color:'#0369a1', fontSize:9, textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>
                      {n.eventType.replace('_',' ')} · {fd(n.createdAt)}
                    </div>
                    <div style={{ color:'#0d1b2a', lineHeight:1.6 }}>{n.note}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Allergies */}
          {(allergies?.length||profile?.allergies?.length) ? (
            <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:11, fontSize:11, fontWeight:700, color:'#dc2626' }}>
              ⚠️ ALLERGIES: {(allergies||profile?.allergies||[]).join(' · ')}
            </div>
          ):null}
        </div>

        {/* ╔══════════════════════════════════════
            COL 2 — INTELLIGENCE CHART + MEDICATIONS + FOLLOW-UPS
        ══════════════════════════════════════╗ */}
        <div>
          {/* Intelligence Chart */}
          <Card title={`${cfg.name} — Intelligence Chart`} icon="📊" accent={cfg.color}>
            {/* Legend */}
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:10 }}>
              {readingLines.map(l => (
                <div key={l.key} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:20, height:2, background:l.color, borderRadius:1 }} />
                  <span style={{ fontSize:10, fontWeight:700, color:l.color }}>{l.key}</span>
                </div>
              ))}
              {medications.map(m => (
                <div key={m.id} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:12, height:12, borderRadius:2, background:m.color }} />
                  <span style={{ fontSize:10, fontWeight:700, color:m.color }}>💊 {m.drugName} (dose, right axis)</span>
                </div>
              ))}
            </div>
            {chartData.length < 2 ? (
              <div style={{ textAlign:'center', padding:'48px 0', color:'#8fa3bd', fontSize:12 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📊</div>Log 2+ readings to see the intelligence chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={chartData} margin={{ top:8, right:50, left:-14, bottom:0 }}>
                  <defs>
                    {readingLines.map(l => (
                      <linearGradient key={l.key} id={`cd-grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={l.color} stopOpacity={0.12} />
                        <stop offset="95%" stopColor={l.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize:8, fill:'#94a3b8', fontFamily:'monospace' }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="L" tick={{ fontSize:8, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
                  {medications.length>0 && <YAxis yAxisId="R" orientation="right" tick={{ fontSize:8, fill:'#94a3b8' }} tickLine={false} axisLine={false} />}
                  <Tooltip content={<ChartTip />} />
                  {/* Dose change vertical markers */}
                  {doseMarkers.map((m,i) => (
                    <ReferenceLine key={i} yAxisId="L" x={m.date} stroke={m.color} strokeWidth={1.5} strokeDasharray="4 3"
                      label={{ value:`Δ ${m.label.split('\n')[0]}`, fill:m.color, fontSize:8, position:'insideTopLeft', angle:-90 }} />
                  ))}
                  {/* Target reference line */}
                  {assignment.toolType==='bp_monitor' && <>
                    <ReferenceLine yAxisId="L" y={130} stroke="#10b98150" strokeDasharray="5 4"
                      label={{ value:'Target', fill:'#10b981', fontSize:8, position:'right' }} />
                    <ReferenceLine yAxisId="L" y={160} stroke="#ef444450" strokeDasharray="5 4"
                      label={{ value:'Alert', fill:'#ef4444', fontSize:8, position:'right' }} />
                  </>}
                  {/* Reading lines */}
                  {readingLines.map(l => (
                    <Area key={l.key} yAxisId="L" type="monotone" dataKey={l.key}
                      stroke={l.color} strokeWidth={l.width} fill={`url(#cd-grad-${l.key})`}
                      strokeDasharray={(l as any).dash}
                      dot={(props:any) => {
                        const lvl = props.payload?._level;
                        const r = lvl&&lvl!=='normal' ? 5 : 2.5;
                        const fill = lvl&&lvl!=='normal' ? TC[lvl] : l.color;
                        return <circle key={props.key} cx={props.cx} cy={props.cy} r={r} fill={fill} stroke="#fff" strokeWidth={r>3?1.5:0} />;
                      }}
                      activeDot={{ r:5, stroke:'#fff', strokeWidth:2 }}
                    />
                  ))}
                  {/* Medication dose step lines */}
                  {medications.map(m => (
                    <Line key={m.id} yAxisId="R" type="stepAfter" dataKey={`💊 ${m.drugName}`}
                      stroke={m.color} strokeWidth={2} strokeDasharray="7 3"
                      dot={(props:any) => props.payload[`💊 ${m.drugName}`]!==undefined
                        ? <circle cx={props.cx} cy={props.cy} r={3} fill={m.color} stroke="#fff" strokeWidth={1} />
                        : <circle r={0} />}
                      activeDot={{ r:4 }} connectNulls={false} />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            )}
            <div style={{ fontSize:9, color:'#8fa3bd', marginTop:6, textAlign:'center' }}>
              Coloured dots = triage severity · Δ lines = dose changes · Right Y-axis = drug dose ({medications[0]?.doseUnit||'mg'})
            </div>
          </Card>

          {/* Medication Compliance Gantt */}
          <Card title="Medication Timeline & 28-Day Compliance" icon="💊" accent="#7c3aed"
            action={isDoctor && <button onClick={()=>setShowAddMed(true)} style={{ fontSize:10, fontWeight:700, padding:'4px 10px', background:'linear-gradient(135deg,#7c3aed,#a855f7)', border:'none', borderRadius:6, cursor:'pointer', color:'#fff', fontFamily:'inherit' }}>+ Add Drug</button>}>
            {medications.length===0 ? (
              <div style={{ textAlign:'center', padding:'16px 0', color:'#8fa3bd', fontSize:11 }}>
                {isDoctor ? 'Add medications to track compliance overlay' : 'No medications assigned yet'}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {medications.map(med => {
                  const ml = compByMedDate[med.id]||{};
                  const taken = last28.filter(d=>ml[d]?.taken).length;
                  const pct = Math.round((taken/last28.length)*100);
                  const pCol = pct>=80?'#10b981':pct>=60?'#f59e0b':'#ef4444';
                  return (
                    <div key={med.id} style={{ border:`1px solid ${med.color}25`, borderRadius:10, overflow:'hidden' }}>
                      {/* Drug header row */}
                      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:`${med.color}08` }}>
                        <div style={{ width:10, height:10, borderRadius:2, background:med.color, flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <span style={{ fontSize:12, fontWeight:800, color:'#0d1b2a' }}>{med.drugName}</span>
                          <span style={{ fontSize:11, fontFamily:'monospace', fontWeight:700, color:med.color, marginLeft:8 }}>{med.dose}</span>
                          <span style={{ fontSize:10, color:'#64748b', marginLeft:6 }}>{med.frequency}</span>
                          {!med.active && <span style={{ marginLeft:8, fontSize:9, background:'#fef2f2', color:'#ef4444', padding:'1px 6px', borderRadius:3, fontWeight:700 }}>STOPPED</span>}
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:13, fontWeight:900, fontFamily:'monospace', color:pCol }}>{pct}%</div>
                          <div style={{ fontSize:8, color:'#8fa3bd' }}>{taken}/28 days</div>
                        </div>
                        {isDoctor && med.active && (
                          <button onClick={()=>setDoseModal(med)} style={{ fontSize:9, fontWeight:700, padding:'3px 8px', background:'#fff', border:`1px solid ${med.color}60`, borderRadius:5, cursor:'pointer', color:med.color, fontFamily:'inherit', flexShrink:0 }}>
                            Dose Δ
                          </button>
                        )}
                      </div>
                      {/* Dose history horizontal track */}
                      {med.doseHistory?.length>0 && (
                        <div style={{ padding:'6px 12px', background:'#fff', borderTop:`1px solid ${med.color}15`, display:'flex', alignItems:'center', gap:0, overflowX:'auto' }}>
                          <div style={{ fontSize:9, background:`${med.color}12`, color:med.color, padding:'3px 8px', borderRadius:'5px 0 0 5px', fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>Start: {fds(med.startDate)}</div>
                          {med.doseHistory.map((h,i) => (
                            <div key={i} style={{ fontSize:9, background:`${med.color}18`, color:'#334155', padding:'3px 8px', borderLeft:`1px solid ${med.color}30`, whiteSpace:'nowrap', flexShrink:0 }}>
                              → <strong style={{ color:med.color }}>{h.doseValue===0?'STOP':h.dose}</strong>
                              <span style={{ color:'#8fa3bd', marginLeft:4 }}>{fds(h.changedAt)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* 28-day compliance row */}
                      <div style={{ padding:'6px 12px 8px', background:'#fafbfd', borderTop:`1px solid ${med.color}10` }}>
                        <div style={{ display:'flex', gap:2, flexWrap:'nowrap', overflowX:'auto', paddingBottom:3 }}>
                          {last28.map(d => {
                            const log = ml[d];
                            return (
                              <CompCell key={d} date={d} taken={log?.taken} onClick={()=>toggleComp(med.id,d)} />
                            );
                          })}
                        </div>
                        {/* Progress bar */}
                        <div style={{ marginTop:5, height:3, background:'#e2e8f0', borderRadius:99, overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`, height:'100%', background:pCol, borderRadius:99, transition:'width .6s' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Follow-Up Timeline */}
          <Card title="Follow-Up Timeline" icon="📅" accent="#0369a1"
            action={isDoctor && <button onClick={()=>setShowAddFU(true)} style={{ fontSize:10, fontWeight:700, padding:'4px 10px', background:'linear-gradient(135deg,#0369a1,#0ea5e9)', border:'none', borderRadius:6, cursor:'pointer', color:'#fff', fontFamily:'inherit' }}>+ Schedule</button>}>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {/* Assigned event */}
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px', background:'#f0fdf4', borderRadius:8, border:'1px solid #a7f3d0' }}>
                <div style={{ width:22, height:22, borderRadius:6, background:'#22c55e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', flexShrink:0 }}>✓</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#15803d' }}>Tool Assigned</div>
                  <div style={{ fontSize:9, color:'#64748b' }}>{fd((assignment as any).assignedAt)}</div>
                </div>
              </div>
              {followUps.map(fu => {
                const sc: Record<string,{bg:string;border:string;icon:string;text:string}> = {
                  scheduled:  { bg:'#eff6ff', border:'#bfdbfe', icon:'📅', text:'#2563eb' },
                  attended:   { bg:'#f0fdf4', border:'#a7f3d0', icon:'✅', text:'#15803d' },
                  missed:     { bg:'#fef2f2', border:'#fecaca', icon:'❌', text:'#b91c1c' },
                  rescheduled:{ bg:'#fffbeb', border:'#fde68a', icon:'🔄', text:'#a16207' },
                };
                const s = sc[fu.status]||sc.scheduled;
                return (
                  <div key={fu.id} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'8px 10px', background:s.bg, borderRadius:8, border:`1px solid ${s.border}` }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:s.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>{s.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:s.text }}>{fu.type==='clinic'?'🏥 Clinic':fu.type==='video'?'📹 Video':'📞 Phone'} · {fd(fu.scheduledDate)}</div>
                      {fu.notes && <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{fu.notes}</div>}
                      {fu.outcome && <div style={{ fontSize:10, color:'#059669', fontWeight:600 }}>↳ {fu.outcome}</div>}
                    </div>
                    {isDoctor && fu.status==='scheduled' && (
                      <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                        <button onClick={()=>updateFU(fu.id,'attended')} style={{ fontSize:9, padding:'2px 7px', background:'#22c55e', border:'none', color:'#fff', borderRadius:4, cursor:'pointer', fontWeight:700 }}>✓</button>
                        <button onClick={()=>updateFU(fu.id,'missed')}   style={{ fontSize:9, padding:'2px 7px', background:'#ef4444', border:'none', color:'#fff', borderRadius:4, cursor:'pointer', fontWeight:700 }}>✗</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {followUps.length===0 && <div style={{ fontSize:11, color:'#8fa3bd', textAlign:'center', padding:'8px 0' }}>{isDoctor?'Schedule first follow-up above':'No follow-ups scheduled yet'}</div>}
            </div>
          </Card>
        </div>

        {/* ╔══════════════════════════════════════
            COL 3 — STATS, ADHERENCE LOG, COMPLICATIONS
        ══════════════════════════════════════╗ */}
        <div>
          {/* Target values card */}
          <Card title="Targets" icon="🎯" accent="#0aaa76">
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {assignment.toolType==='bp_monitor' && [
                { label:'Systolic', ideal:'< 130 mmHg', danger:'≥ 160', current:latest?.data.systolic },
                { label:'Diastolic', ideal:'< 80 mmHg', danger:'≥ 100', current:latest?.data.diastolic },
                { label:'Pulse', ideal:'60–100 bpm', danger:'> 120', current:latest?.data.pulse },
              ].map(t => (
                <div key={t.label} style={{ padding:'8px 10px', background:'#f8fafc', borderRadius:8, border:'1px solid #e2e8f0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:'#334155' }}>{t.label}</span>
                    {t.current && <span style={{ fontSize:12, fontWeight:900, fontFamily:'monospace', color:triCol }}>{t.current}</span>}
                  </div>
                  <div style={{ fontSize:9, color:'#10b981', fontWeight:700 }}>✅ Target: {t.ideal}</div>
                  <div style={{ fontSize:9, color:'#ef4444', fontWeight:700 }}>🚨 Alert: {t.danger}</div>
                </div>
              ))}
              {assignment.toolType!=='bp_monitor' && (
                <div style={{ padding:'8px 10px', background:'#f8fafc', borderRadius:8, border:'1px solid #e2e8f0' }}>
                  <div style={{ fontSize:11, fontWeight:800, color:'#0d1b2a', marginBottom:5 }}>Latest Reading</div>
                  <div style={{ fontSize:20, fontWeight:900, fontFamily:'monospace', color:triCol }}>{latestV}</div>
                  <div style={{ fontSize:9, color:'#8fa3bd', marginTop:3 }}>{fd(latest?.recordedAt)}</div>
                </div>
              )}
              {(assignment as any).targets && (
                <div style={{ padding:'8px 10px', background:'#eff6ff', borderRadius:8, border:'1px solid #bfdbfe' }}>
                  <div style={{ fontSize:9, fontWeight:800, color:'#2563eb', textTransform:'uppercase', letterSpacing:.5, marginBottom:3 }}>Doctor's Target</div>
                  <div style={{ fontSize:11, color:'#1e40af' }}>{(assignment as any).targets}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Adherence rate + recent log */}
          <Card title="Adherence Rate" icon="📈" accent="#0891b2">
            {compStats !== null ? (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <div style={{ position:'relative', width:64, height:64, flexShrink:0 }}>
                    <svg width="64" height="64" style={{ transform:'rotate(-90deg)' }}>
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                      <circle cx="32" cy="32" r="26" fill="none"
                        stroke={compStats>=80?'#10b981':compStats>=60?'#f59e0b':'#ef4444'}
                        strokeWidth="6"
                        strokeDasharray={`${(compStats/100)*163} 163`}
                        strokeLinecap="round" />
                    </svg>
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, fontFamily:'monospace', color:compStats>=80?'#10b981':compStats>=60?'#f59e0b':'#ef4444' }}>
                      {compStats}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:compStats>=80?'#10b981':compStats>=60?'#f59e0b':'#ef4444' }}>
                      {compStats>=80?'Excellent':compStats>=60?'Moderate':'Poor'}
                    </div>
                    <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>28-day adherence</div>
                  </div>
                </div>
                {/* Reading history log */}
                <div style={{ fontSize:9, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, marginBottom:6 }}>Recent Readings Log</div>
                <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:200, overflowY:'auto' }}>
                  {readings.slice(0,8).map((r,i) => {
                    const { v: rv } = readingDisplay(assignment.toolType, r.data);
                    const rc = TC[r.triage?.level||'normal'];
                    return (
                      <div key={r.id||i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 8px', background:i%2===0?'#f8fafc':'#fff', borderRadius:6, border:'1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ fontSize:10, fontFamily:'monospace', color:'#64748b' }}>{fds(r.recordedAt)}</div>
                          {(r as any).enteredBy==='doctor' && <div style={{ fontSize:8, color:'#6366f1', fontWeight:700 }}>Dr.</div>}
                        </div>
                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                          <span style={{ fontSize:12, fontWeight:800, fontFamily:'monospace', color:rc }}>{rv}</span>
                          <div style={{ width:5, height:5, borderRadius:'50%', background:rc }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ textAlign:'center', padding:'16px 0', color:'#8fa3bd', fontSize:11 }}>Log medications to track adherence</div>
            )}
          </Card>

          {/* Complications */}
          <Card title="Complications" icon="⚠️" accent="#dc2626">
            {complications.length===0 ? (
              <div style={{ textAlign:'center', padding:'12px 0', color:'#8fa3bd', fontSize:11 }}>
                <div style={{ fontSize:22, marginBottom:4 }}>✅</div>No complications reported
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {complications.map(c => {
                  const sc: Record<string,string> = { emergency:'#ef4444', severe:'#ef4444', moderate:'#f59e0b', mild:'#10b981' };
                  const sb: Record<string,string> = { emergency:'#fef2f2', severe:'#fef2f2', moderate:'#fffbeb', mild:'#f0fdf4' };
                  const col = sc[c.severity]||'#f59e0b';
                  const bg  = sb[c.severity]||'#fffbeb';
                  return (
                    <div key={c.id} style={{ padding:'8px 10px', background:bg, borderRadius:9, border:`1px solid ${col}30` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                        <span style={{ fontSize:11, fontWeight:800, color:col }}>⚠ {c.type}</span>
                        <span style={{ fontSize:8, fontWeight:700, padding:'1px 5px', borderRadius:3, background:`${col}20`, color:col }}>{c.severity.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize:10, color:'#334155', lineHeight:1.5 }}>{c.description}</div>
                      <div style={{ display:'flex', gap:5, marginTop:5, flexWrap:'wrap' }}>
                        {c.doctorNotified && <span style={{ fontSize:8, fontWeight:700, color:'#059669', background:'#f0fdf4', padding:'1px 5px', borderRadius:3 }}>✓ Dr. Notified</span>}
                        {c.appointmentBooked && <span style={{ fontSize:8, fontWeight:700, color:'#0369a1', background:'#eff6ff', padding:'1px 5px', borderRadius:3 }}>✓ Appt Booked</span>}
                        <span style={{ fontSize:8, fontWeight:700, color:c.status==='resolved'?'#10b981':'#f59e0b', background:c.status==='resolved'?'#f0fdf4':'#fffbeb', padding:'1px 5px', borderRadius:3 }}>{c.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!isDoctor && (
              <button onClick={async()=>{
                const desc=prompt('Describe your symptom briefly:'); const type=prompt('Symptom name:');
                if(!desc||!type) return;
                await addDoc(collection(db,'toolComplications'),{ toolAssignmentId:assignment.id, patientId, type, severity:'moderate', description:desc, doctorNotified:true, appointmentBooked:false, status:'reported', reportedAt:serverTimestamp(), createdAt:serverTimestamp() });
                await addDoc(collection(db,'alerts'),{ patientId, doctorId:assignment.doctorId, type:'complication', title:`⚠️ Complication: ${type}`, message:`${patientName} reported: ${desc}`, read:false, createdAt:serverTimestamp(), urgency:'urgent' });
              }} style={{ marginTop:10, width:'100%', padding:'8px', background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:9, fontSize:11, fontWeight:700, color:'#dc2626', cursor:'pointer', fontFamily:'inherit' }}>
                🚨 Report a Complication
              </button>
            )}
          </Card>

          {/* Reading history (collapsed) */}
          <ReadingHistoryMini readings={readings} toolType={assignment.toolType} />
        </div>

      </div>{/* end 3-col grid */}

      {/* Footer */}
      <div style={{ borderTop:'1px solid #e8eef5', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', fontSize:10, color:'#8fa3bd' }}>
        <div>⚕ <strong style={{ color:'#0d1b2a' }}>AMEXAN Health</strong> · {cfg.name} Longitudinal Record · {patientName} · Dr. {doctor.name}</div>
        <div>{now}</div>
      </div>

      </div>{/* end printzone */}

      {/* ════════ MODALS ═══════════════════════════════════════════════════ */}
      {showAddMed && <AddMedModal assignmentId={assignment.id} patientId={patientId} doctor={doctor} existingCount={medications.length} onClose={()=>setShowAddMed(false)} />}
      {showAddFU  && <AddFollowUpModal assignmentId={assignment.id} patientId={patientId} doctor={doctor} onClose={()=>setShowAddFU(false)} />}
      {doseModal  && <DoseChangeModal med={doseModal} doctor={doctor} onClose={()=>setDoseModal(null)} />}
    </div>
  );
}

// ─── Reading history mini ─────────────────────────────────────────────────────
function ReadingHistoryMini({ readings, toolType }: { readings:ToolReading[]; toolType:string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card title={`History (${readings.length})`} icon="📋" accent="#64748b"
      action={<button onClick={()=>setOpen(o=>!o)} style={{ fontSize:10, fontWeight:700, padding:'3px 9px', background:'#f1f5f9', border:'none', borderRadius:5, cursor:'pointer', color:'#334155', fontFamily:'inherit' }}>{open?'▲':'▼'}</button>}>
      {!open ? (
        <div style={{ fontSize:10, color:'#8fa3bd', textAlign:'center' }}>Click ▼ to expand full history<br /><span style={{ color:'#64748b', fontWeight:600 }}>Not printed in PDF</span></div>
      ) : (
        <div style={{ maxHeight:280, overflowY:'auto' }}>
          {readings.map((r,i) => {
            const { v } = readingDisplay(toolType, r.data);
            const rc = TC[r.triage?.level||'normal'];
            return (
              <div key={r.id||i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f1f5f9', fontSize:10 }}>
                <span style={{ color:'#8fa3bd', fontFamily:'monospace' }}>{fd(r.recordedAt)}</span>
                <span style={{ fontFamily:'monospace', fontWeight:800, color:rc }}>{v}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── Add Med Modal ────────────────────────────────────────────────────────────
function AddMedModal({ assignmentId, patientId, doctor, existingCount, onClose }: { assignmentId:string; patientId:string; doctor:{uid:string;name:string}; existingCount:number; onClose:()=>void }) {
  const [form, setForm] = useState({ drugName:'', doseValue:'', doseUnit:'mg', route:'Oral', frequency:'Once daily', indication:'' });
  const [saving, setSaving] = useState(false);
  const INP: React.CSSProperties = { width:'100%', padding:'8px 10px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:12, fontFamily:'inherit', outline:'none' };
  const save = async () => {
    if (!form.drugName||!form.doseValue) return;
    setSaving(true);
    await addDoc(collection(db,'toolMedications'), { toolAssignmentId:assignmentId, patientId, doctorId:doctor.uid, doctorName:doctor.name, drugName:form.drugName, dose:`${form.doseValue}${form.doseUnit}`, doseValue:Number(form.doseValue), doseUnit:form.doseUnit, route:form.route, frequency:form.frequency, indication:form.indication, active:true, color:DRUG_PAL[existingCount%DRUG_PAL.length], doseHistory:[], startDate:serverTimestamp(), createdAt:serverTimestamp() });
    setSaving(false); onClose();
  };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:800, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:18, width:'100%', maxWidth:420, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.22)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)', padding:'16px 20px', color:'#fff' }}>
          <div style={{ fontSize:14, fontWeight:800 }}>💊 Add Medication to Tool</div>
          <div style={{ fontSize:11, opacity:.7, marginTop:2 }}>Tracked on intelligence chart</div>
        </div>
        <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
          <div><label style={{ fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Drug Name *</label><input value={form.drugName} onChange={e=>setForm(f=>({...f,drugName:e.target.value}))} placeholder="e.g. Amlodipine" style={INP} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 80px', gap:8 }}>
            <div><label style={{ fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Dose *</label><input type="number" value={form.doseValue} onChange={e=>setForm(f=>({...f,doseValue:e.target.value}))} placeholder="5" style={INP} /></div>
            <div><label style={{ fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Unit</label><select value={form.doseUnit} onChange={e=>setForm(f=>({...f,doseUnit:e.target.value}))} style={INP}>{['mg','mcg','g','IU','ml'].map(u=><option key={u}>{u}</option>)}</select></div>
          </div>
          <div><label style={{ fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Frequency</label><select value={form.frequency} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))} style={INP}>{['Once daily','Twice daily','Three times daily','At night','As needed'].map(x=><option key={x}>{x}</option>)}</select></div>
          <div><label style={{ fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Indication</label><input value={form.indication} onChange={e=>setForm(f=>({...f,indication:e.target.value}))} placeholder="e.g. Hypertension first line" style={INP} /></div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} style={{ flex:1, padding:'10px', background:'transparent', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>Cancel</button>
            <button onClick={save} disabled={!form.drugName||!form.doseValue||saving} style={{ flex:2, padding:'10px', background:'linear-gradient(135deg,#7c3aed,#a855f7)', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:!form.drugName||!form.doseValue?.5:1 }}>
              {saving?'Saving…':'💊 Add & Track'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dose Change Modal ─────────────────────────────────────────────────────────
function DoseChangeModal({ med, doctor, onClose }: { med:ToolMedication; doctor:{uid:string;name:string}; onClose:()=>void }) {
  const [newDose, setNewDose] = useState('');
  const [reason, setReason]   = useState('');
  const [note, setNote]       = useState('');
  const [stop, setStop]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const INP: React.CSSProperties = { width:'100%', padding:'8px 10px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:12, fontFamily:'inherit', outline:'none' };
  const save = async () => {
    if (!reason) return;
    setSaving(true);
    const ch = { dose:stop?'STOPPED':`${newDose}${med.doseUnit}`, doseValue:stop?0:Number(newDose), changedAt:Timestamp.now(), reason, doctorNote:note };
    await updateDoc(doc(db,'toolMedications',med.id), { dose:ch.dose, doseValue:ch.doseValue, active:!stop, endDate:stop?serverTimestamp():null, doseHistory:[...(med.doseHistory||[]),ch] });
    await addDoc(collection(db,'toolDecisionNotes'), { toolAssignmentId:med.toolAssignmentId, patientId:med.patientId, doctorId:doctor.uid, doctorName:doctor.name, note:`${stop?'Stopped':'Dose changed'}: ${med.drugName} ${med.dose} → ${ch.dose}. Reason: ${reason}. ${note}`, eventType:'dose_change', linkedMedicationId:med.id, chartMarker:true, createdAt:serverTimestamp() });
    setSaving(false); onClose();
  };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:800, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:18, width:'100%', maxWidth:400, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.22)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:`linear-gradient(135deg,${med.color},${med.color}bb)`, padding:'14px 20px', color:'#fff' }}>
          <div style={{ fontSize:13, fontWeight:800 }}>Change Dose: {med.drugName}</div>
          <div style={{ fontSize:10, opacity:.75, marginTop:2 }}>Current: {med.dose} {med.frequency}</div>
        </div>
        <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
          <label style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer' }}>
            <input type="checkbox" checked={stop} onChange={e=>setStop(e.target.checked)} style={{ width:15,height:15,accentColor:'#ef4444' }} />
            <span style={{ fontSize:12, fontWeight:700, color:'#ef4444' }}>Stop this drug</span>
          </label>
          {!stop && <div><label style={{ fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>New Dose ({med.doseUnit}) *</label><input type="number" value={newDose} onChange={e=>setNewDose(e.target.value)} placeholder={String(med.doseValue)} style={INP} /></div>}
          <div><label style={{ fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Reason *</label><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Uncontrolled BP, Side effects" style={INP} /></div>
          <div><label style={{ fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Decision Note (shown on chart)</label><textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Clinical reasoning, patient response, next steps…" style={{ ...INP, resize:'vertical' as const }} /></div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} style={{ flex:1, padding:'9px', background:'transparent', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>Cancel</button>
            <button onClick={save} disabled={!reason||(!stop&&!newDose)||saving} style={{ flex:2, padding:'10px', background:stop?'#ef4444':'linear-gradient(135deg,#0aaa76,#06b6d4)', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              {saving?'Saving…':stop?'⛔ Stop & Log':'💉 Change Dose & Mark Chart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Follow-Up Modal ───────────────────────────────────────────────────────
function AddFollowUpModal({ assignmentId, patientId, doctor, onClose }: { assignmentId:string; patientId:string; doctor:{uid:string;name:string}; onClose:()=>void }) {
  const [date, setDate]   = useState('');
  const [type, setType]   = useState<'clinic'|'video'|'phone'>('clinic');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const INP: React.CSSProperties = { width:'100%', padding:'8px 10px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:12, fontFamily:'inherit', outline:'none' };
  const save = async () => {
    if (!date) return;
    setSaving(true);
    const scheduled = Timestamp.fromDate(new Date(date));
    await addDoc(collection(db,'toolFollowUps'), { toolAssignmentId:assignmentId, patientId, doctorId:doctor.uid, scheduledDate:scheduled, type, status:'scheduled', notes, createdAt:serverTimestamp() });
    await addDoc(collection(db,'alerts'), { patientId, doctorId:doctor.uid, type:'followup', title:`📅 Follow-Up: ${fd(scheduled)}`, message:`Dr. ${doctor.name} scheduled a ${type} follow-up for ${fd(scheduled)}. ${notes}`, read:false, createdAt:serverTimestamp(), urgency:'routine' });
    setSaving(false); onClose();
  };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:800, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:18, width:'100%', maxWidth:360, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.22)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:'linear-gradient(135deg,#0369a1,#0ea5e9)', padding:'14px 20px', color:'#fff' }}>
          <div style={{ fontSize:13, fontWeight:800 }}>📅 Schedule Follow-Up</div>
        </div>
        <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
          <div><label style={{ fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Date *</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={INP} /></div>
          <div>
            <label style={{ fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:6 }}>Type</label>
            <div style={{ display:'flex', gap:7 }}>
              {(['clinic','video','phone'] as const).map(t=>(
                <button key={t} onClick={()=>setType(t)} style={{ flex:1, padding:'7px', border:`1.5px solid ${type===t?'#0369a1':'#e2e8f0'}`, borderRadius:8, background:type===t?'#eff6ff':'#fff', fontSize:11, fontWeight:700, cursor:'pointer', color:type===t?'#2563eb':'#64748b', fontFamily:'inherit' }}>
                  {t==='clinic'?'🏥':t==='video'?'📹':'📞'} {t}
                </button>
              ))}
            </div>
          </div>
          <div><label style={{ fontSize:9, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:.6, display:'block', marginBottom:4 }}>Notes</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Review plan…" style={{ ...INP, resize:'vertical' as const }} /></div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} style={{ flex:1, padding:'9px', background:'transparent', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#64748b' }}>Cancel</button>
            <button onClick={save} disabled={!date||saving} style={{ flex:2, padding:'10px', background:'linear-gradient(135deg,#0369a1,#0ea5e9)', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:!date?.5:1 }}>
              {saving?'Saving…':'📅 Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}