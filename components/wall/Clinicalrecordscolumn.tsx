'use client';
// components/wall/ClinicalRecordsColumn.tsx
// Column 3: Prescriptions (with adherence, new drug reasons, stopped history)
//           Labs (with results inline), Imaging, Referrals

import { useEffect, useState } from 'react';
import {
  collection, query, where, onSnapshot, orderBy, limit,
  updateDoc, doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WallDoctor } from '@/components/PatientWallPage';

interface Prescription {
  id: string; patientId: string; doctorId: string; doctorName: string;
  medication: string; dosage: string; frequency: string; duration: string;
  route: string; indication: string; instructions: string; warnings: string;
  refills: number; active: boolean; toolType?: string;
  startDate: any; endDate?: any; createdAt: any;
  reason?: string; adherencePct?: number; newDrug?: boolean;
  stoppedReason?: string;
}
interface LabOrder {
  id: string; patientId: string; doctorId: string; doctorName: string;
  tests: string[]; priority: 'routine'|'urgent'|'stat';
  clinicalInfo: string; fasting: boolean;
  status: 'ordered'|'collected'|'resulted'|'reviewed';
  results?: { test:string; value:string; unit:string; flag:string; range:string }[];
  toolType?: string; createdAt: any; resultedAt?: any;
}
interface ImagingOrder {
  id: string; patientId: string; doctorId: string; doctorName: string;
  modality: string; region: string; indication: string;
  priority: 'routine'|'urgent'|'emergency'; contrast?: boolean;
  status: 'ordered'|'scheduled'|'completed'|'reported';
  report?: string; toolType?: string; createdAt: any;
}
interface Referral {
  id: string; patientId: string; fromDoctorId: string; fromDoctorName: string;
  toDoctorName?: string; specialty: string; reason: string;
  urgency: 'routine'|'urgent'|'emergency'; clinicalSummary: string;
  status: 'pending'|'accepted'|'completed'|'declined';
  toolType?: string; createdAt: any;
}

const STATUS_COLOR: Record<string,string> = {
  pending:'#f59e0b', ordered:'#6366f1', collected:'#0891b2',
  resulted:'#f97316', reviewed:'#10b981', active:'#10b981',
  completed:'#10b981', accepted:'#0891b2', declined:'#ef4444',
  scheduled:'#8b5cf6', reported:'#10b981', routine:'#10b981',
  urgent:'#f97316', emergency:'#ef4444', stat:'#ef4444',
};

const PRIORITY_BG: Record<string,string> = {
  routine:'#f0fdf4', urgent:'#fffbeb', stat:'#fef2f2', emergency:'#fef2f2',
};

const fmtDate = (ts:any) => { if(!ts)return'—'; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}); };

type Tab = 'Prescriptions'|'Labs'|'Imaging'|'Referrals';
const TABS: Tab[] = ['Prescriptions','Labs','Imaging','Referrals'];

interface Props {
  patientId: string;
  doctor: WallDoctor;
  onOpenRx:     () => void;
  onOpenLab:    () => void;
  onOpenImaging:() => void;
  onOpenRefer:  () => void;
}

// ── Adherence bar ─────────────────────────────────────────────────────────────
function AdherenceBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#10b981' : pct >= 80 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginTop:5 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
        <span style={{ fontSize:9, color:'#8fa3bd', textTransform:'uppercase', letterSpacing:.4 }}>Adherence</span>
        <span style={{ fontSize:10, fontWeight:800, color }}>{pct}%</span>
      </div>
      <div style={{ height:4, borderRadius:2, background:'#e2e9f3', overflow:'hidden' }}>
        <div style={{ height:'100%', borderRadius:2, background:color, width:`${pct}%`, transition:'width .5s ease' }} />
      </div>
    </div>
  );
}

// ── Prescription item ─────────────────────────────────────────────────────────
function PrescriptionItem({ rx, onStop }: { rx: Prescription; onStop: () => void }) {
  const isNew = rx.newDrug && rx.startDate && ((Date.now() - (rx.startDate?.toDate?.()?.getTime?.() || 0)) < 14 * 86400000);
  const stopped = !rx.active;

  return (
    <div style={{ padding:'11px 13px', borderBottom:'1px solid #e8eef5', opacity: stopped ? .6 : 1, background: isNew ? '#fefce8' : '#fff' }}>
      {isNew && (
        <div style={{ fontSize:9, fontWeight:800, color:'#854d0e', background:'#fef9c3', padding:'2px 7px', borderRadius:99, display:'inline-block', marginBottom:5 }}>
          NEW — {fmtDate(rx.startDate)}
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:5, flexWrap:'wrap' }}>
            <span style={{ fontSize:14, fontWeight:800, color: stopped ? '#94a3b8' : '#0d1b2a', textDecoration: stopped ? 'line-through' : 'none' }}>
              {rx.medication}
            </span>
            <span style={{ fontSize:13, fontWeight:700, color:'#6366f1' }}>{rx.dosage}</span>
          </div>
          <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{rx.frequency} · {rx.route} · {rx.duration}</div>
          {rx.indication && <div style={{ fontSize:10, color:'#8fa3bd', marginTop:2 }}>For: {rx.indication}</div>}
          {rx.instructions && <div style={{ fontSize:11, color:'#4a5568', marginTop:4, fontStyle:'italic', lineHeight:1.5 }}>{rx.instructions}</div>}
          {rx.warnings && <div style={{ fontSize:10, color:'#ef4444', marginTop:3 }}>⚠ {rx.warnings}</div>}
          {rx.reason && <div style={{ fontSize:10, color:'#7c3aed', marginTop:4, background:'#faf5ff', padding:'3px 8px', borderRadius:6, display:'inline-block' }}>Reason: {rx.reason}</div>}
          {stopped && rx.stoppedReason && <div style={{ fontSize:10, color:'#ef4444', marginTop:4 }}>Stopped: {rx.stoppedReason}</div>}
          {rx.adherencePct !== undefined && !stopped && <AdherenceBar pct={rx.adherencePct} />}
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
          <span style={{
            fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
            background: rx.active ? '#f0fdf4' : '#f1f5f9',
            color: rx.active ? '#10b981' : '#94a3b8',
          }}>
            {rx.active ? 'Active' : 'Stopped'}
          </span>
          <span style={{ fontSize:9, color:'#8fa3bd' }}>Refills: {rx.refills}</span>
          {rx.active && (
            <button onClick={onStop} style={{ fontSize:9, color:'#ef4444', background:'none', border:'1px solid #fecaca', borderRadius:5, padding:'2px 6px', cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>
              Stop
            </button>
          )}
        </div>
      </div>
      <div style={{ fontSize:9, color:'#c4d0de', marginTop:6 }}>Dr. {rx.doctorName} · {fmtDate(rx.startDate)}</div>
    </div>
  );
}

// ── Lab Order Item ────────────────────────────────────────────────────────────
function LabItem({ lab }: { lab: LabOrder }) {
  const [showResults, setShowResults] = useState(!!lab.results?.length);
  const [reportText, setReportText]   = useState('');

  const pColor = STATUS_COLOR[lab.priority] || '#64748b';
  const sColor = STATUS_COLOR[lab.status]   || '#64748b';

  return (
    <div style={{ borderBottom:'1px solid #e8eef5' }}>
      <div style={{ padding:'11px 13px', background:PRIORITY_BG[lab.priority]||'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontSize:12, fontWeight:800, color:'#0d1b2a' }}>🔬 Lab Order</span>
            <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:99, background:`${pColor}15`, color:pColor, textTransform:'uppercase' }}>{lab.priority}</span>
            {lab.fasting && <span style={{ fontSize:10, fontWeight:700, color:'#f59e0b', background:'#fffbeb', padding:'1px 6px', borderRadius:99 }}>⚡ Fasting</span>}
          </div>
          <select
            value={lab.status}
            onChange={e => updateDoc(doc(db,'labOrders',lab.id),{ status:e.target.value })}
            style={{ fontSize:10, fontWeight:700, padding:'3px 7px', borderRadius:7, border:`1px solid ${sColor}40`, background:'#fff', color:sColor, cursor:'pointer', fontFamily:'inherit', outline:'none' }}
          >
            {['ordered','collected','resulted','reviewed'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:6 }}>
          {lab.tests.map(t => (
            <span key={t} style={{ fontSize:10, padding:'2px 8px', borderRadius:99, background:'#eff6ff', color:'#0891b2', border:'1px solid #bae6fd', fontWeight:600 }}>{t}</span>
          ))}
        </div>

        {lab.clinicalInfo && <div style={{ fontSize:11, color:'#64748b', fontStyle:'italic', marginBottom:6 }}>{lab.clinicalInfo}</div>}

        {/* Results */}
        {lab.results?.length ? (
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'8px 10px', marginTop:6 }}>
            <div style={{ fontSize:10, fontWeight:800, color:'#166534', marginBottom:6, textTransform:'uppercase', letterSpacing:.4 }}>Results</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {lab.results.map((r,i) => (
                <div key={i} style={{ fontSize:11, display:'flex', gap:4, alignItems:'baseline' }}>
                  <span style={{ color:'#4a5568' }}>{r.test}:</span>
                  <span style={{ fontWeight:700, color: r.flag==='H'?'#ef4444':r.flag==='L'?'#f97316':'#10b981', fontFamily:'monospace' }}>{r.value} {r.unit}</span>
                  {r.flag && r.flag !== 'N' && <span style={{ fontSize:9, fontWeight:800, color:r.flag==='H'?'#ef4444':'#f97316' }}>[{r.flag}]</span>}
                </div>
              ))}
            </div>
          </div>
        ) : lab.status === 'resulted' ? (
          <div style={{ marginTop:6 }}>
            <textarea
              placeholder="Enter results manually…"
              rows={2}
              onBlur={e => {
                if (e.target.value) updateDoc(doc(db,'labOrders',lab.id),{ results:[{ test:'Result', value:e.target.value, unit:'', flag:'N', range:'' }] });
              }}
              style={{ width:'100%', padding:'7px 9px', border:'1.5px solid #e2e9f3', borderRadius:8, fontSize:11, fontFamily:'inherit', outline:'none', resize:'vertical' }}
            />
          </div>
        ) : null}

        <div style={{ fontSize:9, color:'#c4d0de', marginTop:6 }}>Dr. {lab.doctorName} · {fmtDate(lab.createdAt)}</div>
      </div>
    </div>
  );
}

// ── Imaging item ──────────────────────────────────────────────────────────────
function ImagingItem({ im }: { im: ImagingOrder }) {
  const sColor = STATUS_COLOR[im.status] || '#64748b';
  const pColor = STATUS_COLOR[im.priority] || '#64748b';
  return (
    <div style={{ padding:'11px 13px', borderBottom:'1px solid #e8eef5' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:'#0d1b2a' }}>
            🏥 {im.modality} — {im.region}
            {im.contrast && <span style={{ fontSize:10, color:'#7c3aed', marginLeft:5 }}>+contrast</span>}
          </div>
          <div style={{ fontSize:10, color:'#8fa3bd', marginTop:1 }}>
            Dr. {im.doctorName} · {fmtDate(im.createdAt)} ·{' '}
            <span style={{ color:pColor, fontWeight:700, textTransform:'uppercase' }}>{im.priority}</span>
          </div>
        </div>
        <select
          value={im.status}
          onChange={e => updateDoc(doc(db,'imagingOrders',im.id),{ status:e.target.value })}
          style={{ fontSize:10, fontWeight:700, padding:'3px 7px', borderRadius:7, border:`1px solid ${sColor}40`, background:'#fff', color:sColor, cursor:'pointer', fontFamily:'inherit', outline:'none' }}
        >
          {['ordered','scheduled','completed','reported'].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ fontSize:11, color:'#64748b', fontStyle:'italic', marginBottom:6 }}>{im.indication}</div>
      {im.report && (
        <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'8px 10px' }}>
          <div style={{ fontSize:10, fontWeight:800, color:'#166534', marginBottom:4 }}>📋 Radiology report</div>
          <div style={{ fontSize:11, color:'#4a5568', lineHeight:1.6 }}>{im.report}</div>
        </div>
      )}
      {im.status === 'completed' && !im.report && (
        <textarea
          placeholder="Enter radiology report…"
          rows={2}
          onBlur={e => { if(e.target.value) updateDoc(doc(db,'imagingOrders',im.id),{ report:e.target.value, status:'reported' }); }}
          style={{ width:'100%', padding:'7px 9px', border:'1.5px solid #e2e9f3', borderRadius:8, fontSize:11, fontFamily:'inherit', outline:'none', resize:'vertical', marginTop:6 }}
        />
      )}
    </div>
  );
}

// ── Referral item ─────────────────────────────────────────────────────────────
function ReferralItem({ ref: r }: { ref: Referral }) {
  const uc   = { routine:'#10b981', urgent:'#f97316', emergency:'#ef4444' }[r.urgency] || '#10b981';
  const sc   = STATUS_COLOR[r.status] || '#64748b';
  return (
    <div style={{ padding:'11px 13px', borderBottom:'1px solid #e8eef5' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
        <div style={{ fontSize:13, fontWeight:800, color:'#0d1b2a' }}>📋 {r.specialty}</div>
        <div style={{ display:'flex', gap:6 }}>
          <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:`${uc}15`, color:uc, textTransform:'uppercase' }}>{r.urgency}</span>
          <select
            value={r.status}
            onChange={e => updateDoc(doc(db,'referrals',r.id),{ status:e.target.value })}
            style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:7, border:`1px solid ${sc}40`, background:'#fff', color:sc, cursor:'pointer', fontFamily:'inherit', outline:'none' }}
          >
            {['pending','accepted','completed','declined'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div style={{ fontSize:12, fontWeight:600, color:'#0d1b2a', marginBottom:4 }}>{r.reason}</div>
      {r.clinicalSummary && <div style={{ fontSize:11, color:'#64748b', lineHeight:1.6 }}>{r.clinicalSummary}</div>}
      {r.toDoctorName && <div style={{ fontSize:10, color:'#8fa3bd', marginTop:4 }}>To: Dr. {r.toDoctorName}</div>}
      <div style={{ fontSize:9, color:'#c4d0de', marginTop:5 }}>From Dr. {r.fromDoctorName} · {fmtDate(r.createdAt)}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ClinicalRecordsColumn({ patientId, doctor, onOpenRx, onOpenLab, onOpenImaging, onOpenRefer }: Props) {
  const [tab, setTab]               = useState<Tab>('Prescriptions');
  const [prescriptions, setRx]      = useState<Prescription[]>([]);
  const [labs,     setLabs]         = useState<LabOrder[]>([]);
  const [imaging,  setImaging]      = useState<ImagingOrder[]>([]);
  const [referrals,setReferrals]    = useState<Referral[]>([]);

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db,'prescriptions'),  where('patientId','==',patientId),orderBy('createdAt','desc'),limit(50)), s=>setRx(s.docs.map(d=>({id:d.id,...d.data()} as Prescription))));
    const u2 = onSnapshot(query(collection(db,'labOrders'),       where('patientId','==',patientId),orderBy('createdAt','desc'),limit(50)), s=>setLabs(s.docs.map(d=>({id:d.id,...d.data()} as LabOrder))));
    const u3 = onSnapshot(query(collection(db,'imagingOrders'),   where('patientId','==',patientId),orderBy('createdAt','desc'),limit(50)), s=>setImaging(s.docs.map(d=>({id:d.id,...d.data()} as ImagingOrder))));
    const u4 = onSnapshot(query(collection(db,'referrals'),       where('patientId','==',patientId),orderBy('createdAt','desc'),limit(50)), s=>setReferrals(s.docs.map(d=>({id:d.id,...d.data()} as Referral))));
    return () => { u1(); u2(); u3(); u4(); };
  }, [patientId]);

  const ACTIONS: Record<Tab, ()=>void> = {
    Prescriptions: onOpenRx, Labs: onOpenLab, Imaging: onOpenImaging, Referrals: onOpenRefer,
  };

  const COUNTS: Record<Tab, number> = {
    Prescriptions: prescriptions.filter(p=>p.active).length,
    Labs:          labs.filter(l=>l.status!=='reviewed').length,
    Imaging:       imaging.filter(i=>i.status!=='reported').length,
    Referrals:     referrals.filter(r=>r.status==='pending').length,
  };

  return (
    <div style={{ background:'#fff', borderRight:'1px solid #e8eef5', display:'flex', flexDirection:'column', minHeight:0 }}>
      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:'1px solid #e8eef5', background:'#fafbfd', flexShrink:0, overflowX:'auto' as const }}>
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ flex:1, minWidth:'fit-content', padding:'10px 6px', border:'none', background:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:600, color:tab===t?'#0aaa76':'#94a3b8', borderBottom:`2.5px solid ${tab===t?'#0aaa76':'transparent'}`, position:'relative' as const, whiteSpace:'nowrap' as const }}>
            {t}
            {COUNTS[t] > 0 && (
              <span style={{ marginLeft:4, fontSize:9, fontWeight:800, background:'#0aaa76', color:'#fff', borderRadius:99, padding:'1px 5px' }}>
                {COUNTS[t]}
              </span>
            )}
          </button>
        ))}
        <button onClick={ACTIONS[tab]} style={{ padding:'9px 12px', background:'#0aaa76', border:'none', color:'#fff', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
          + New
        </button>
      </div>

      {/* Content */}
      <div style={{ overflowY:'auto', flex:1 }}>

        {tab === 'Prescriptions' && (
          <>
            <div style={{ padding:'8px 13px', background:'#f8fafc', borderBottom:'1px solid #e8eef5', fontSize:10, color:'#8fa3bd', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:.5 }}>
              {prescriptions.filter(p=>p.active).length} active · {prescriptions.filter(p=>!p.active).length} stopped
            </div>
            {prescriptions.length === 0 ? (
              <div style={{ textAlign:'center', color:'#8fa3bd', padding:'40px', fontSize:12 }}>
                <div style={{ fontSize:28, marginBottom:8 }}>💊</div>No prescriptions yet
              </div>
            ) : (
              prescriptions.map(rx => (
                <PrescriptionItem key={rx.id} rx={rx} onStop={() => updateDoc(doc(db,'prescriptions',rx.id),{ active:false, stoppedReason:'Stopped by Dr. ' + doctor.name })} />
              ))
            )}
          </>
        )}

        {tab === 'Labs' && (
          labs.length === 0 ? (
            <div style={{ textAlign:'center', color:'#8fa3bd', padding:'40px', fontSize:12 }}><div style={{ fontSize:28, marginBottom:8 }}>🔬</div>No lab orders yet</div>
          ) : labs.map(l => <LabItem key={l.id} lab={l} />)
        )}

        {tab === 'Imaging' && (
          imaging.length === 0 ? (
            <div style={{ textAlign:'center', color:'#8fa3bd', padding:'40px', fontSize:12 }}><div style={{ fontSize:28, marginBottom:8 }}>🏥</div>No imaging orders yet</div>
          ) : imaging.map(im => <ImagingItem key={im.id} im={im} />)
        )}

        {tab === 'Referrals' && (
          referrals.length === 0 ? (
            <div style={{ textAlign:'center', color:'#8fa3bd', padding:'40px', fontSize:12 }}><div style={{ fontSize:28, marginBottom:8 }}>📋</div>No referrals yet</div>
          ) : referrals.map(r => <ReferralItem key={r.id} ref={r} />)
        )}
      </div>
    </div>
  );
}