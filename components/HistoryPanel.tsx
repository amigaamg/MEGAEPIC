'use client';
// ═══════════════════════════════════════════════════════════════════════════════
// ClinicalRecordSystem.tsx  ·  AMEXAN Health Platform
// World-Class Clinical History & Progress Note Management
//
// USAGE (drop-in for both old components):
//   <ClinicalRecordSystem appointments={appointments} doctor={doctor} />
//   — OR —
//   <ClinicalRecordSystem doctorId="uid" doctor={doctor} />
//
// FIRESTORE RULES NEEDED:
//   match /clinicalNotes/{id}  { allow read, write: if request.auth != null; }
//   match /clinicalAlerts/{id} { allow read, write: if request.auth != null; }
//   match /patientNotifications/{id} { allow read, write: if request.auth != null; }
//
// COMPOSITE INDEXES NEEDED (Firebase Console → Firestore → Indexes):
//   Collection: clinicalNotes  Fields: patientId ASC, visitDate DESC
// ═══════════════════════════════════════════════════════════════════════════════

import React, {
  useState, useEffect, useRef, useCallback, useMemo, useReducer,
} from 'react';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc,
  doc, serverTimestamp, orderBy, getDoc, getDocs, setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ReferralSystem from '@/components/ReferralSystem';

// ─── CSS INJECTION ────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --cr-bg:       #0a0e1a;
  --cr-surface:  #111827;
  --cr-surface2: #1a2236;
  --cr-border:   rgba(255,255,255,.08);
  --cr-text:     #f0f4ff;
  --cr-muted:    #6b7a9d;
  --cr-accent:   #4f8ef7;
  --cr-accent2:  #7c5cfc;
  --cr-green:    #10d9a0;
  --cr-red:      #f05252;
  --cr-amber:    #f5a623;
  --cr-gold:     #e6c97a;
  --cr-mono:     'JetBrains Mono', monospace;
  --cr-serif:    'DM Serif Display', Georgia, serif;
  --cr-sans:     'DM Sans', system-ui, sans-serif;
  --cr-r:        10px;
  --cr-shadow:   0 4px 24px rgba(0,0,0,.4);
}

[data-cr-light] {
  --cr-bg:       #f8faff;
  --cr-surface:  #ffffff;
  --cr-surface2: #eef2fb;
  --cr-border:   rgba(79,142,247,.12);
  --cr-text:     #0d1b3e;
  --cr-muted:    #5a6b8c;
}

.cr-root { font-family: var(--cr-sans); }
.cr-root * { box-sizing: border-box; }
.cr-sc::-webkit-scrollbar { width: 3px; height: 3px; }
.cr-sc::-webkit-scrollbar-thumb { background: rgba(79,142,247,.25); border-radius: 99px; }

@keyframes cr-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes cr-pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
@keyframes cr-shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }

.cr-anim  { animation: cr-in .2s ease; }
.cr-pulse { animation: cr-pulse 2s infinite; }

.cr-hover-row:hover { background: rgba(79,142,247,.04) !important; }
.cr-hover-card:hover { border-color: rgba(79,142,247,.35) !important; transform: translateY(-1px); transition: all .15s; }

.cr-tag {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; padding: 2px 8px;
  border-radius: 99px; white-space: nowrap;
  text-transform: uppercase; letter-spacing: .4px;
}

.cr-loading {
  background: linear-gradient(90deg, var(--cr-surface) 25%, var(--cr-surface2) 50%, var(--cr-surface) 75%);
  background-size: 200% 100%;
  animation: cr-shimmer 1.4s infinite;
  border-radius: 6px;
}
`;

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Appointment {
  id: string;
  patientId?: string;
  patientName?: string;
  specialty?: string;
  date?: any;
  status: 'active' | 'booked' | 'completed' | 'cancelled';
  notes?: string;
  prescriptions?: any[];
  patientNotes?: string;
  amount?: number;
}

interface DoctorProfile {
  uid: string;
  name: string;
  specialty?: string;
  licenseNo?: string;
  facility?: string;
}

interface PatientBiodata {
  uid: string;
  name: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  nhif?: string;
  nationalId?: string;
  bloodGroup?: string;
  knownAllergies?: string;
  chronicConditions?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  occupation?: string;
  maritalStatus?: string;
  religion?: string;
  address?: string;
  nextOfKin?: string;
  insurance?: string;
}

interface VitalSigns {
  bp?: string; hr?: number; rr?: number; temp?: number;
  spo2?: number; weight?: number; height?: number; bmi?: number;
  pain?: number; fbs?: number; rbs?: number; gcs?: number;
}

interface PhysicalExam {
  general?: string; heent?: string; cvs?: string;
  respiratory?: string; abdomen?: string; cns?: string;
  msk?: string; skin?: string; other?: string;
}

interface Diagnosis {
  id: string; code?: string; description: string;
  type: 'primary' | 'secondary' | 'differential';
  status: 'active' | 'resolved' | 'chronic'; onset?: string;
}

interface Prescription {
  id: string; medication: string; dosage: string;
  frequency: string; duration: string; route: string;
  instructions?: string;
  status: 'active' | 'completed' | 'stopped' | 'pending_refill';
  startDate: string; endDate?: string;
  adherence?: 'good' | 'partial' | 'poor' | 'unknown';
  refills?: number; dispensed?: boolean;
}

interface LabOrder {
  id: string; test: string;
  category: 'haematology'|'biochemistry'|'microbiology'|'serology'|'urinalysis'|'imaging'|'pathology'|'other';
  urgency: 'routine'|'urgent'|'stat';
  status: 'ordered'|'collected'|'processing'|'resulted'|'critical';
  orderedAt: any; result?: string; resultValue?: string;
  unit?: string; referenceRange?: string;
  flag?: 'normal'|'high'|'low'|'critical'; notes?: string;
}

interface ImagingOrder {
  id: string; study: string;
  modality: 'XR'|'CT'|'MRI'|'USS'|'Echo'|'ECG'|'EEG'|'Other';
  bodyPart: string; urgency: 'routine'|'urgent'|'stat';
  status: 'ordered'|'scheduled'|'performed'|'reported'|'reviewed';
  orderedAt: any; report?: string; impression?: string; radiologistName?: string;
}

interface Referral {
  id: string; toSpecialty: string; toDoctorName?: string; toFacility?: string;
  urgency: 'routine'|'urgent'|'emergency'; reason: string; notes?: string;
  status: 'pending'|'sent'|'accepted'|'completed'|'declined'; createdAt: any;
}

interface FollowUp {
  id: string; date: string; time?: string;
  type: 'in_person'|'teleconsult'|'phone'|'message';
  reason: string; status: 'scheduled'|'completed'|'missed'|'rescheduled';
}

interface ClinicalAlert {
  id: string; type: string; severity: 'info'|'warning'|'critical';
  message: string; triggeredAt: any; acknowledged: boolean;
}

interface ProgressNote {
  id: string; patientId: string; visitDate: any;
  visitType: 'new_patient'|'follow_up'|'emergency'|'teleconsult'|'review';
  doctorId: string; doctorName: string; doctorSpecialty: string;
  chiefComplaint: string; hpi: string; ros?: string;
  pmh?: string; psh?: string; fh?: string; sh?: string;
  allergies?: string; currentMeds?: string;
  vitals?: VitalSigns; examination?: PhysicalExam;
  investigations?: string;
  diagnoses: Diagnosis[]; plan?: string;
  prescriptions: Prescription[];
  labOrders: LabOrder[]; imagingOrders: ImagingOrder[];
  referrals: Referral[]; followUps: FollowUp[];
  alerts: ClinicalAlert[];
  progressAssessment?: string; educationGiven?: string;
  isLocked: boolean; lastEditedAt?: any; createdAt: any;
}

// ─── COLOUR TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:      'var(--cr-bg)',
  surf:    'var(--cr-surface)',
  surf2:   'var(--cr-surface2)',
  bdr:     'var(--cr-border)',
  txt:     'var(--cr-text)',
  mut:     'var(--cr-muted)',
  acc:     'var(--cr-accent)',
  acc2:    'var(--cr-accent2)',
  grn:     'var(--cr-green)',
  red:     'var(--cr-red)',
  amb:     'var(--cr-amber)',
  gld:     'var(--cr-gold)',
};

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const INP: React.CSSProperties = {
  width: '100%', fontSize: 13, padding: '8px 11px', borderRadius: 8,
  border: '1.5px solid var(--cr-border)', background: 'rgba(255,255,255,.04)',
  color: C.txt, fontFamily: 'var(--cr-sans)', outline: 'none',
  transition: 'border-color .15s',
};
const SEL: React.CSSProperties = {
  fontSize: 12, padding: '5px 9px', borderRadius: 7,
  border: '1px solid var(--cr-border)', background: 'rgba(255,255,255,.04)',
  color: C.txt, fontFamily: 'var(--cr-sans)', cursor: 'pointer',
};
const BTN: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8,
  background: C.acc, color: '#fff', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--cr-sans)', transition: 'opacity .15s',
};
const BTN2: React.CSSProperties = {
  ...BTN, background: 'rgba(255,255,255,.06)', color: C.txt,
  border: '1px solid var(--cr-border)',
};
const BTN_ADD: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, padding: '9px', borderRadius: 8,
  background: 'rgba(79,142,247,.08)', color: C.acc,
  border: '1.5px dashed rgba(79,142,247,.35)', cursor: 'pointer',
  width: '100%', marginTop: 8, fontFamily: 'var(--cr-sans)',
};
const LBL: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: C.mut,
  textTransform: 'uppercase', letterSpacing: '.7px',
  marginBottom: 4, display: 'block',
};
const SEC_HDR: React.CSSProperties = {
  fontSize: 10, fontWeight: 800, color: C.acc,
  textTransform: 'uppercase', letterSpacing: '.9px', marginBottom: 6,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-KE',
    { day:'2-digit', month:'short', year:'numeric' });
};
const fmtDT = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('en-KE',
    { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
};
const age = (dob?: string) => {
  if (!dob) return '';
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 864e5)) + 'y';
};
const calcBMI = (w?: number, h?: number) =>
  w && h ? +(w / ((h / 100) ** 2)).toFixed(1) : undefined;
const bmiLabel = (b?: number) =>
  !b ? '' : b < 18.5 ? 'Underweight' : b < 25 ? 'Normal' : b < 30 ? 'Overweight' : 'Obese';

// ─── ALERT ENGINE ─────────────────────────────────────────────────────────────
const buildAlerts = (vitals?: VitalSigns): ClinicalAlert[] => {
  if (!vitals) return [];
  const alerts: ClinicalAlert[] = [];
  const now = new Date();
  const mk = (id: string, type: string, sev: ClinicalAlert['severity'], msg: string) =>
    ({ id, type, severity: sev, message: msg, triggeredAt: now, acknowledged: false });

  if (vitals.bp) {
    const [s, d] = vitals.bp.split('/').map(Number);
    if (s >= 180 || d >= 120) alerts.push(mk('bp_crisis','bp_alert','critical',`Hypertensive crisis: BP ${vitals.bp} mmHg — IMMEDIATE intervention required`));
    else if (s >= 140 || d >= 90) alerts.push(mk('bp_high','bp_alert','warning',`Elevated BP: ${vitals.bp} mmHg — antihypertensive review`));
    else if (s < 90) alerts.push(mk('bp_low','bp_alert','warning',`Hypotension: ${vitals.bp} mmHg — assess volume status`));
  }
  if (vitals.spo2 !== undefined && vitals.spo2 < 92)
    alerts.push(mk('spo2','critical_value','critical',`SpO₂ ${vitals.spo2}% — administer O₂ immediately`));
  if (vitals.hr !== undefined) {
    if (vitals.hr > 150) alerts.push(mk('tachy2','critical_value','critical',`Severe tachycardia: HR ${vitals.hr} bpm`));
    else if (vitals.hr > 100) alerts.push(mk('tachy','critical_value','warning',`Tachycardia: HR ${vitals.hr} bpm`));
    else if (vitals.hr < 40) alerts.push(mk('brady2','critical_value','critical',`Severe bradycardia: HR ${vitals.hr} bpm`));
    else if (vitals.hr < 50) alerts.push(mk('brady','critical_value','warning',`Bradycardia: HR ${vitals.hr} bpm`));
  }
  if (vitals.temp !== undefined && vitals.temp >= 38.5)
    alerts.push(mk('fever','critical_value', vitals.temp >= 40 ? 'critical' : 'warning',`Fever: ${vitals.temp}°C ${vitals.temp >= 40 ? '— possible sepsis' : ''}`));
  if (vitals.fbs !== undefined && vitals.fbs >= 7.0)
    alerts.push(mk('fbs','sugar_alert','warning',`Raised FBS: ${vitals.fbs} mmol/L`));
  if (vitals.rbs !== undefined && vitals.rbs >= 11.1)
    alerts.push(mk('rbs','sugar_alert','warning',`Raised RBS: ${vitals.rbs} mmol/L — hyperglycaemia`));
  if (vitals.pain !== undefined && vitals.pain >= 7)
    alerts.push(mk('pain','pain_alert','warning',`Severe pain: ${vitals.pain}/10`));
  if (vitals.gcs !== undefined && vitals.gcs < 13)
    alerts.push(mk('gcs','critical_value','critical',`Reduced GCS: ${vitals.gcs}/15 — urgent neurological review`));
  return alerts;
};

// ─── EDITABLE FIELD ───────────────────────────────────────────────────────────
function EF({ label, value, onChange, multi=false, placeholder='', type='text', disabled=false, fullrow=false }: {
  label: string; value?: string|number; onChange?: (v: string) => void;
  multi?: boolean; placeholder?: string; type?: string; disabled?: boolean; fullrow?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(String(value ?? ''));
  useEffect(() => setLocal(String(value ?? '')), [value]);
  const commit = () => { setEditing(false); onChange?.(local); };
  const base: React.CSSProperties = { gridColumn: fullrow ? '1/-1' : undefined };
  return (
    <div style={{ marginBottom: 10, ...base }}>
      <label style={LBL}>{label}</label>
      {disabled || !onChange ? (
        <div style={{ fontSize: 13, color: local ? C.txt : C.mut, borderBottom: '1px solid var(--cr-border)', paddingBottom: 3, minHeight: 22 }}>{local || '—'}</div>
      ) : editing ? (
        multi
          ? <textarea autoFocus value={local} onChange={e => setLocal(e.target.value)} onBlur={commit}
              placeholder={placeholder} rows={3}
              style={{ ...INP, resize:'vertical', minHeight:64 }} />
          : <input autoFocus type={type} value={local} onChange={e => setLocal(e.target.value)}
              onBlur={commit} onKeyDown={e => e.key==='Enter' && commit()}
              placeholder={placeholder} style={INP} />
      ) : (
        <div onClick={() => setEditing(true)} style={{
          fontSize: 13, borderBottom: '1.5px dashed var(--cr-border)', paddingBottom: 3,
          minHeight: 22, cursor: 'text', color: local ? C.txt : C.mut,
          lineHeight: 1.6, whiteSpace: 'pre-wrap', position: 'relative',
        }}>
          {local || <em style={{ opacity: .4 }}>{placeholder || 'Click to add…'}</em>}
          <span style={{ position:'absolute', right:0, top:0, fontSize:10, color:C.acc, opacity:.5 }}>✎</span>
        </div>
      )}
    </div>
  );
}

// ─── VITAL CHIP ───────────────────────────────────────────────────────────────
function VC({ label, val, unit, flag, icon }: { label:string; val?: string|number; unit?:string; flag?:string; icon:string }) {
  const col = flag==='critical'?C.red : flag==='high'?C.amb : flag==='low'?C.acc : C.acc;
  return (
    <div style={{
      background: 'rgba(255,255,255,.04)', border: `1.5px solid ${col}28`,
      borderRadius: 10, padding:'10px 13px', minWidth: 82, textAlign:'center', flexShrink: 0,
    }}>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: col, fontFamily:'var(--cr-mono)', lineHeight: 1.1, marginTop: 2 }}>{val ?? '—'}</div>
      {unit && <div style={{ fontSize: 9, color: C.mut, marginTop: 1 }}>{unit}</div>}
      <div style={{ fontSize: 9, fontWeight: 700, color: C.mut, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── ALERT ROW ────────────────────────────────────────────────────────────────
function AlertRow({ a, onAck }: { a: ClinicalAlert; onAck?: () => void }) {
  const col = a.severity==='critical' ? C.red : a.severity==='warning' ? C.amb : C.acc;
  return (
    <div style={{
      display:'flex', gap:9, padding:'8px 12px', borderRadius:9, marginBottom:5,
      background:`${col}10`, border:`1px solid ${col}30`,
      opacity: a.acknowledged ? .4 : 1, alignItems:'flex-start',
    }}>
      <span style={{ fontSize:15, flexShrink:0 }}>{a.severity==='critical'?'🚨':'⚠️'}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:10, fontWeight:800, color:col, textTransform:'uppercase', letterSpacing:.5 }}>{a.type.replace(/_/g,' ')}</div>
        <div style={{ fontSize:12, color:C.txt, marginTop:1 }}>{a.message}</div>
      </div>
      {!a.acknowledged && onAck &&
        <button onClick={onAck} style={{ fontSize:10, fontWeight:700, color:col, background:`${col}18`, border:`1px solid ${col}35`, borderRadius:5, padding:'2px 8px', cursor:'pointer', flexShrink:0 }}>ACK</button>}
    </div>
  );
}

// ─── NOTE EDITOR ──────────────────────────────────────────────────────────────
type EdTab = 'history'|'vitals'|'exam'|'dx'|'rx'|'labs'|'imaging'|'plan';

function NoteEditor({ note, onSave, onClose, isNew }: {
  note: Partial<ProgressNote>; onSave: (n: Partial<ProgressNote>) => Promise<void>;
  onClose: () => void; isNew?: boolean;
}) {
  const [data, setData] = useState<Partial<ProgressNote>>({ ...note });
  const [tab, setTab] = useState<EdTab>('history');
  const [saving, setSaving] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<ClinicalAlert[]>(note.alerts || []);

  const upd = (k: keyof ProgressNote, v: any) => setData(d => ({ ...d, [k]: v }));
  // updV: NEVER stores `undefined` into React state — Firestore rejects it
  // When a vital is cleared (raw === '') we DELETE the key so it is simply absent.
  const updV = (k: keyof VitalSigns, raw: string) => {
    setData(d => {
      const nv: VitalSigns = { ...(d.vitals || {}) };
      if (raw === '' || raw === null || raw === undefined) {
        delete (nv as any)[k]; // remove entirely — do NOT set to undefined
      } else {
        (nv as any)[k] = k === 'bp' ? raw.trim() : isNaN(+raw) ? raw : +raw;
      }
      if (k === 'weight' || k === 'height') {
        const b = calcBMI(nv.weight, nv.height);
        if (b) nv.bmi = b; else delete nv.bmi;
      }
      setLiveAlerts(buildAlerts(nv));
      return { ...d, vitals: nv };
    });
  };
  const updE = (k: keyof PhysicalExam, v: string) => setData(d => ({ ...d, examination: { ...(d.examination||{}), [k]: v } }));

  const addDx = () => upd('diagnoses', [...(data.diagnoses||[]), { id: Date.now().toString(), description:'', type:'primary', status:'active' }]);
  const updDx = (id: string, k: keyof Diagnosis, v: any) => upd('diagnoses', (data.diagnoses||[]).map(x => x.id===id ? {...x,[k]:v} : x));
  const delDx = (id: string) => upd('diagnoses', (data.diagnoses||[]).filter(x => x.id!==id));

  const addRx = () => upd('prescriptions', [...(data.prescriptions||[]), { id: Date.now().toString(), medication:'', dosage:'', frequency:'', duration:'', route:'oral', status:'active', startDate: new Date().toISOString().slice(0,10) }]);
  const updRx = (id: string, k: keyof Prescription, v: any) => upd('prescriptions', (data.prescriptions||[]).map(x => x.id===id ? {...x,[k]:v} : x));
  const delRx = (id: string) => upd('prescriptions', (data.prescriptions||[]).filter(x => x.id!==id));

  const addLab = () => upd('labOrders', [...(data.labOrders||[]), { id: Date.now().toString(), test:'', category:'haematology', urgency:'routine', status:'ordered', orderedAt: new Date() }]);
  const updLab = (id: string, k: keyof LabOrder, v: any) => upd('labOrders', (data.labOrders||[]).map(x => x.id===id ? {...x,[k]:v} : x));
  const delLab = (id: string) => upd('labOrders', (data.labOrders||[]).filter(x => x.id!==id));

  const addImg = () => upd('imagingOrders', [...(data.imagingOrders||[]), { id: Date.now().toString(), study:'', modality:'XR', bodyPart:'', urgency:'routine', status:'ordered', orderedAt: new Date() }]);
  const updImg = (id: string, k: keyof ImagingOrder, v: any) => upd('imagingOrders', (data.imagingOrders||[]).map(x => x.id===id ? {...x,[k]:v} : x));
  const delImg = (id: string) => upd('imagingOrders', (data.imagingOrders||[]).filter(x => x.id!==id));

  const addRef = () => upd('referrals', [...(data.referrals||[]), { id: Date.now().toString(), toSpecialty:'', urgency:'routine', reason:'', status:'pending', createdAt: new Date() }]);
  const updRef = (id: string, k: keyof Referral, v: any) => upd('referrals', (data.referrals||[]).map(x => x.id===id ? {...x,[k]:v} : x));
  const delRef = (id: string) => upd('referrals', (data.referrals||[]).filter(x => x.id!==id));

  const addFU = () => upd('followUps', [...(data.followUps||[]), { id: Date.now().toString(), date:'', type:'in_person', reason:'', status:'scheduled' }]);
  const updFU = (id: string, k: keyof FollowUp, v: any) => upd('followUps', (data.followUps||[]).map(x => x.id===id ? {...x,[k]:v} : x));
  const delFU = (id: string) => upd('followUps', (data.followUps||[]).filter(x => x.id!==id));

  const save = async () => {
    setSaving(true);
    await onSave({ ...data, alerts: liveAlerts });
    setSaving(false);
  };

  const TABS: { id: EdTab; icon: string; label: string }[] = [
    { id:'history', icon:'📝', label:'History' },{ id:'vitals', icon:'💉', label:'Vitals' },
    { id:'exam', icon:'🩺', label:'Exam' },{ id:'dx', icon:'🎯', label:'Dx' },
    { id:'rx', icon:'💊', label:'Rx' },{ id:'labs', icon:'🧪', label:'Labs' },
    { id:'imaging', icon:'🩻', label:'Imaging' },{ id:'plan', icon:'📋', label:'Plan' },
  ];

  return (
    <div style={{ border:`1.5px solid ${C.acc}35`, borderRadius:14, overflow:'hidden', background:C.surf, marginBottom:16 }} className="cr-anim">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 16px', background:C.surf2, borderBottom:`1px solid ${C.bdr}`, flexWrap:'wrap' }}>
        <span style={{ fontSize:18 }}>📋</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.txt }}>{isNew ? 'New Visit Note' : 'Edit Note'}</div>
          <div style={{ fontSize:11, color:C.mut }}>{fmtDT(data.visitDate || new Date())}</div>
        </div>
        <select value={data.visitType||'follow_up'} onChange={e => upd('visitType',e.target.value)} style={SEL}>
          <option value="new_patient">New Patient</option>
          <option value="follow_up">Follow-Up</option>
          <option value="emergency">Emergency</option>
          <option value="teleconsult">Teleconsult</option>
          <option value="review">Review</option>
        </select>
        <button onClick={save} disabled={saving} style={{ ...BTN, opacity: saving?.6:1 }}>{saving ? '⟳ Saving…' : '💾 Save Note'}</button>
        <button onClick={onClose} style={BTN2}>✕</button>
      </div>

      {/* Live alerts */}
      {liveAlerts.length > 0 && (
        <div style={{ padding:'9px 16px', borderBottom:`1px solid rgba(240,82,82,.15)`, background:'rgba(240,82,82,.04)' }}>
          {liveAlerts.map(a => <AlertRow key={a.id} a={a} onAck={() => setLiveAlerts(la => la.map(x => x.id===a.id ? {...x,acknowledged:true} : x))} />)}
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:`1px solid ${C.bdr}`, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'9px 13px', background:'none', border:'none',
            borderBottom: tab===t.id ? `2.5px solid ${C.acc}` : '2.5px solid transparent',
            cursor:'pointer', fontSize:12, fontWeight: tab===t.id ? 800:500,
            color: tab===t.id ? C.acc : C.mut, whiteSpace:'nowrap',
            fontFamily:'var(--cr-sans)', display:'flex', alignItems:'center', gap:4,
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding:16, maxHeight:'58vh', overflowY:'auto' }} className="cr-sc">

        {/* HISTORY */}
        {tab==='history' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <EF label="Chief Complaint (C/C)" value={data.chiefComplaint} onChange={v => upd('chiefComplaint',v)} placeholder="Patient's primary presenting complaint…" multi fullrow />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <EF label="History of Present Illness (HPI)" value={data.hpi} onChange={v => upd('hpi',v)} placeholder="Onset, duration, character, severity, radiation, aggravating/relieving factors…" multi fullrow />
            </div>
            <EF label="Review of Systems (ROS)" value={data.ros} onChange={v => upd('ros',v)} placeholder="Systemic enquiry…" multi />
            <EF label="Past Medical History (PMH)" value={data.pmh} onChange={v => upd('pmh',v)} placeholder="Known conditions, hospitalisations…" multi />
            <EF label="Past Surgical History (PSH)" value={data.psh} onChange={v => upd('psh',v)} placeholder="Previous operations, procedures…" multi />
            <EF label="Family History (FH)" value={data.fh} onChange={v => upd('fh',v)} placeholder="Relevant hereditary conditions…" multi />
            <EF label="Social History (SH)" value={data.sh} onChange={v => upd('sh',v)} placeholder="Tobacco, alcohol, occupation, lifestyle…" multi />
            <EF label="Allergies (confirmed)" value={data.allergies} onChange={v => upd('allergies',v)} placeholder="Drug/food allergies & reactions…" multi />
            <div style={{ gridColumn:'1/-1' }}>
              <EF label="Current Medications" value={data.currentMeds} onChange={v => upd('currentMeds',v)} placeholder="List all medications with doses and frequency…" multi fullrow />
            </div>
          </div>
        )}

        {/* VITALS */}
        {tab==='vitals' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(135px,1fr))', gap:10, marginBottom:12 }}>
              <EF label="BP (mmHg)" value={data.vitals?.bp} onChange={v => updV('bp',v)} placeholder="120/80" />
              <EF label="Heart Rate (bpm)" value={data.vitals?.hr} onChange={v => updV('hr',v)} type="number" />
              <EF label="Resp Rate (/min)" value={data.vitals?.rr} onChange={v => updV('rr',v)} type="number" />
              <EF label="Temperature (°C)" value={data.vitals?.temp} onChange={v => updV('temp',v)} type="number" />
              <EF label="SpO₂ (%)" value={data.vitals?.spo2} onChange={v => updV('spo2',v)} type="number" />
              <EF label="Weight (kg)" value={data.vitals?.weight} onChange={v => updV('weight',v)} type="number" />
              <EF label="Height (cm)" value={data.vitals?.height} onChange={v => updV('height',v)} type="number" />
              <EF label="BMI (auto-calc)" value={data.vitals?.bmi} disabled />
              <EF label="Pain Score (0–10)" value={data.vitals?.pain} onChange={v => updV('pain',v)} type="number" />
              <EF label="FBS (mmol/L)" value={data.vitals?.fbs} onChange={v => updV('fbs',v)} type="number" />
              <EF label="RBS (mmol/L)" value={data.vitals?.rbs} onChange={v => updV('rbs',v)} type="number" />
              <EF label="GCS (/15)" value={data.vitals?.gcs} onChange={v => updV('gcs',v)} type="number" />
            </div>
            {data.vitals?.bmi && (
              <div style={{ fontSize:12, color:C.mut, padding:'6px 11px', background:'rgba(79,142,247,.07)', borderRadius:8, marginTop:4 }}>
                BMI {data.vitals.bmi} — <strong style={{ color:C.acc }}>{bmiLabel(data.vitals.bmi)}</strong>
              </div>
            )}
          </div>
        )}

        {/* EXAM */}
        {tab==='exam' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ gridColumn:'1/-1' }}><EF label="General Appearance" value={data.examination?.general} onChange={v => updE('general',v)} placeholder="Alert, oriented, well/ill-appearing, in distress…" multi /></div>
            <EF label="HEENT" value={data.examination?.heent} onChange={v => updE('heent',v)} placeholder="Head, eyes, ears, nose, throat…" multi />
            <EF label="CVS" value={data.examination?.cvs} onChange={v => updE('cvs',v)} placeholder="Heart sounds, murmurs, JVP, oedema…" multi />
            <EF label="Respiratory" value={data.examination?.respiratory} onChange={v => updE('respiratory',v)} placeholder="Air entry, breath sounds, wheeze, crackles…" multi />
            <EF label="Abdomen" value={data.examination?.abdomen} onChange={v => updE('abdomen',v)} placeholder="Soft/rigid, tenderness, organomegaly, bowel sounds…" multi />
            <EF label="CNS / Neurology" value={data.examination?.cns} onChange={v => updE('cns',v)} placeholder="GCS, cranial nerves, power, tone, reflexes, sensation…" multi />
            <EF label="MSK" value={data.examination?.msk} onChange={v => updE('msk',v)} placeholder="Joints, deformity, range of motion, swelling…" multi />
            <EF label="Skin / Integument" value={data.examination?.skin} onChange={v => updE('skin',v)} placeholder="Colour, turgor, rashes, lesions, jaundice…" multi />
            <div style={{ gridColumn:'1/-1' }}><EF label="Other / Special Findings" value={data.examination?.other} onChange={v => updE('other',v)} placeholder="Per-rectal, per-vaginal, fundoscopy, etc…" multi /></div>
          </div>
        )}

        {/* DIAGNOSIS */}
        {tab==='dx' && (
          <div>
            {(data.diagnoses||[]).map((dx,i) => (
              <div key={dx.id} style={{ border:`1px solid ${C.bdr}`, borderRadius:10, padding:'11px 13px', marginBottom:8, background:C.surf2 }}>
                <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:11, fontWeight:700, color:C.mut }}>#{i+1}</span>
                  <select value={dx.type} onChange={e => updDx(dx.id,'type',e.target.value)} style={SEL}>
                    <option value="primary">Primary</option><option value="secondary">Secondary</option><option value="differential">Differential</option>
                  </select>
                  <select value={dx.status} onChange={e => updDx(dx.id,'status',e.target.value)} style={SEL}>
                    <option value="active">Active</option><option value="chronic">Chronic</option><option value="resolved">Resolved</option>
                  </select>
                  <input value={dx.code||''} onChange={e => updDx(dx.id,'code',e.target.value)} placeholder="ICD-10" style={{ ...SEL, width:82 }} />
                  <button onClick={() => delDx(dx.id)} style={{ marginLeft:'auto', color:C.red, background:'none', border:'none', cursor:'pointer', fontSize:16 }}>🗑</button>
                </div>
                <input value={dx.description} onChange={e => updDx(dx.id,'description',e.target.value)} placeholder="Diagnosis description…" style={INP} />
                <input value={dx.onset||''} onChange={e => updDx(dx.id,'onset',e.target.value)} placeholder="Onset (e.g. 3 months ago)" style={{ ...INP, marginTop:6 }} />
              </div>
            ))}
            <button onClick={addDx} style={BTN_ADD}>+ Add Diagnosis</button>
            <div style={{ marginTop:14 }}>
              <EF label="Investigations Summary / Clinical Impression" value={data.investigations} onChange={v => upd('investigations',v)} placeholder="Summary of findings supporting the diagnosis…" multi />
            </div>
          </div>
        )}

        {/* PRESCRIPTIONS */}
        {tab==='rx' && (
          <div>
            {(data.prescriptions||[]).map((rx,i) => (
              <div key={rx.id} style={{ border:`1px solid ${C.bdr}`, borderRadius:10, padding:'11px 13px', marginBottom:8, background:C.surf2 }}>
                <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:14 }}>💊 <span style={{ fontSize:11, fontWeight:700, color:C.mut }}>#{i+1}</span></span>
                  <select value={rx.status} onChange={e => updRx(rx.id,'status',e.target.value)} style={SEL}>
                    <option value="active">Active</option><option value="completed">Completed</option><option value="stopped">Stopped</option><option value="pending_refill">Pending Refill</option>
                  </select>
                  <select value={rx.adherence||'unknown'} onChange={e => updRx(rx.id,'adherence',e.target.value)} style={SEL}>
                    <option value="unknown">Adherence?</option><option value="good">Good</option><option value="partial">Partial</option><option value="poor">Poor</option>
                  </select>
                  <button onClick={() => delRx(rx.id)} style={{ marginLeft:'auto', color:C.red, background:'none', border:'none', cursor:'pointer', fontSize:16 }}>🗑</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:5, marginBottom:6 }}>
                  <input value={rx.medication} onChange={e => updRx(rx.id,'medication',e.target.value)} placeholder="Medication" style={INP} />
                  <input value={rx.dosage} onChange={e => updRx(rx.id,'dosage',e.target.value)} placeholder="Dose" style={INP} />
                  <input value={rx.frequency} onChange={e => updRx(rx.id,'frequency',e.target.value)} placeholder="Frequency" style={INP} />
                  <input value={rx.duration} onChange={e => updRx(rx.id,'duration',e.target.value)} placeholder="Duration" style={INP} />
                  <select value={rx.route} onChange={e => updRx(rx.id,'route',e.target.value)} style={SEL}>
                    <option value="oral">PO</option><option value="iv">IV</option><option value="im">IM</option><option value="sc">SC</option><option value="topical">Topical</option><option value="inhaled">Inhaled</option><option value="sublingual">SL</option><option value="rectal">PR</option>
                  </select>
                </div>
                <input value={rx.instructions||''} onChange={e => updRx(rx.id,'instructions',e.target.value)} placeholder="Special instructions (e.g. take with food, avoid sunlight)…" style={{ ...INP, marginBottom:6 }} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  <div><label style={LBL}>Start Date</label><input type="date" value={rx.startDate} onChange={e => updRx(rx.id,'startDate',e.target.value)} style={INP} /></div>
                  <div><label style={LBL}>End Date</label><input type="date" value={rx.endDate||''} onChange={e => updRx(rx.id,'endDate',e.target.value)} style={INP} /></div>
                </div>
              </div>
            ))}
            <button onClick={addRx} style={BTN_ADD}>+ Add Prescription</button>
          </div>
        )}

        {/* LABS */}
        {tab==='labs' && (
          <div>
            {(data.labOrders||[]).map((lab,i) => (
              <div key={lab.id} style={{ border:`1px solid ${C.bdr}`, borderRadius:10, padding:'11px 13px', marginBottom:8, background:C.surf2 }}>
                <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.mut }}>🧪 #{i+1}</span>
                  <select value={lab.category} onChange={e => updLab(lab.id,'category',e.target.value)} style={SEL}>
                    {['haematology','biochemistry','microbiology','serology','urinalysis','pathology','other'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={lab.urgency} onChange={e => updLab(lab.id,'urgency',e.target.value)} style={SEL}>
                    <option value="routine">Routine</option><option value="urgent">Urgent</option><option value="stat">STAT</option>
                  </select>
                  <select value={lab.status} onChange={e => updLab(lab.id,'status',e.target.value)} style={SEL}>
                    <option value="ordered">Ordered</option><option value="collected">Collected</option><option value="processing">Processing</option><option value="resulted">Resulted</option><option value="critical">Critical</option>
                  </select>
                  <button onClick={() => delLab(lab.id)} style={{ marginLeft:'auto', color:C.red, background:'none', border:'none', cursor:'pointer', fontSize:16 }}>🗑</button>
                </div>
                <input value={lab.test} onChange={e => updLab(lab.id,'test',e.target.value)} placeholder="Test name (e.g. FBC, U/E/Cr, HbA1c, LFTs, Blood cultures…)" style={{ ...INP, marginBottom:6 }} />
                {(lab.status==='resulted'||lab.status==='critical') && (
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:5, marginBottom:6 }}>
                    <input value={lab.result||''} onChange={e => updLab(lab.id,'result',e.target.value)} placeholder="Result narrative" style={INP} />
                    <input value={lab.resultValue||''} onChange={e => updLab(lab.id,'resultValue',e.target.value)} placeholder="Value" style={INP} />
                    <input value={lab.unit||''} onChange={e => updLab(lab.id,'unit',e.target.value)} placeholder="Unit" style={INP} />
                    <select value={lab.flag||'normal'} onChange={e => updLab(lab.id,'flag',e.target.value)} style={SEL}>
                      <option value="normal">Normal</option><option value="high">High ↑</option><option value="low">Low ↓</option><option value="critical">Critical ‼</option>
                    </select>
                  </div>
                )}
                <input value={lab.referenceRange||''} onChange={e => updLab(lab.id,'referenceRange',e.target.value)} placeholder="Reference range (e.g. 4.5–11.0 × 10⁹/L)" style={{ ...INP, marginBottom:6 }} />
                <textarea value={lab.notes||''} onChange={e => updLab(lab.id,'notes',e.target.value)} placeholder="Clinical interpretation / comment…" rows={2} style={{ ...INP, resize:'vertical' }} />
              </div>
            ))}
            <button onClick={addLab} style={BTN_ADD}>+ Order Lab Test</button>
          </div>
        )}

        {/* IMAGING */}
        {tab==='imaging' && (
          <div>
            {(data.imagingOrders||[]).map((img,i) => (
              <div key={img.id} style={{ border:`1px solid ${C.bdr}`, borderRadius:10, padding:'11px 13px', marginBottom:8, background:C.surf2 }}>
                <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.mut }}>🩻 #{i+1}</span>
                  <select value={img.modality} onChange={e => updImg(img.id,'modality',e.target.value)} style={SEL}>
                    {['XR','CT','MRI','USS','Echo','ECG','EEG','Other'].map(m=><option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={img.urgency} onChange={e => updImg(img.id,'urgency',e.target.value)} style={SEL}>
                    <option value="routine">Routine</option><option value="urgent">Urgent</option><option value="stat">STAT</option>
                  </select>
                  <select value={img.status} onChange={e => updImg(img.id,'status',e.target.value)} style={SEL}>
                    <option value="ordered">Ordered</option><option value="scheduled">Scheduled</option><option value="performed">Performed</option><option value="reported">Reported</option><option value="reviewed">Reviewed</option>
                  </select>
                  <button onClick={() => delImg(img.id)} style={{ marginLeft:'auto', color:C.red, background:'none', border:'none', cursor:'pointer', fontSize:16 }}>🗑</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:6, marginBottom:6 }}>
                  <input value={img.study} onChange={e => updImg(img.id,'study',e.target.value)} placeholder="Study (e.g. Chest X-Ray PA view)" style={INP} />
                  <input value={img.bodyPart} onChange={e => updImg(img.id,'bodyPart',e.target.value)} placeholder="Body region" style={INP} />
                </div>
                {(img.status==='reported'||img.status==='reviewed') && <>
                  <textarea value={img.report||''} onChange={e => updImg(img.id,'report',e.target.value)} placeholder="Full radiology report…" rows={3} style={{ ...INP, resize:'vertical', marginBottom:6 }} />
                  <textarea value={img.impression||''} onChange={e => updImg(img.id,'impression',e.target.value)} placeholder="Impression / conclusion…" rows={2} style={{ ...INP, resize:'vertical', marginBottom:6 }} />
                  <input value={img.radiologistName||''} onChange={e => updImg(img.id,'radiologistName',e.target.value)} placeholder="Radiologist name" style={INP} />
                </>}
              </div>
            ))}
            <button onClick={addImg} style={BTN_ADD}>+ Order Imaging</button>
          </div>
        )}

        {/* PLAN */}
        {tab==='plan' && (
          <div>
            <EF label="Management Plan" value={data.plan} onChange={v => upd('plan',v)} placeholder="Treatment goals, monitoring strategy, lifestyle modifications…" multi />
            <EF label="Progress Assessment" value={data.progressAssessment} onChange={v => upd('progressAssessment',v)} placeholder="Patient's response to treatment, disease trajectory…" multi />
            <EF label="Patient Education Given" value={data.educationGiven} onChange={v => upd('educationGiven',v)} placeholder="Topics discussed with patient / carer…" multi />

            <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${C.bdr}` }}>
              <div style={SEC_HDR}>Referrals</div>
              {(data.referrals||[]).map(ref => (
                <div key={ref.id} style={{ border:`1px solid ${C.bdr}`, borderRadius:10, padding:'11px 13px', marginBottom:8, background:C.surf2 }}>
                  <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
                    <select value={ref.urgency} onChange={e => updRef(ref.id,'urgency',e.target.value)} style={SEL}><option value="routine">Routine</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option></select>
                    <select value={ref.status} onChange={e => updRef(ref.id,'status',e.target.value)} style={SEL}><option value="pending">Pending</option><option value="sent">Sent</option><option value="accepted">Accepted</option><option value="completed">Completed</option><option value="declined">Declined</option></select>
                    <button onClick={() => delRef(ref.id)} style={{ marginLeft:'auto', color:C.red, background:'none', border:'none', cursor:'pointer', fontSize:16 }}>🗑</button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:6 }}>
                    <input value={ref.toSpecialty} onChange={e => updRef(ref.id,'toSpecialty',e.target.value)} placeholder="Specialty" style={INP} />
                    <input value={ref.toDoctorName||''} onChange={e => updRef(ref.id,'toDoctorName',e.target.value)} placeholder="Doctor (optional)" style={INP} />
                    <input value={ref.toFacility||''} onChange={e => updRef(ref.id,'toFacility',e.target.value)} placeholder="Facility" style={INP} />
                  </div>
                  <textarea value={ref.reason} onChange={e => updRef(ref.id,'reason',e.target.value)} placeholder="Clinical reason for referral…" rows={2} style={{ ...INP, resize:'vertical', marginBottom:6 }} />
                  <textarea value={ref.notes||''} onChange={e => updRef(ref.id,'notes',e.target.value)} placeholder="Clinical summary for receiving team…" rows={2} style={{ ...INP, resize:'vertical' }} />
                </div>
              ))}
              <button onClick={addRef} style={BTN_ADD}>+ Add Referral</button>
            </div>

            <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${C.bdr}` }}>
              <div style={SEC_HDR}>Follow-Up Schedule</div>
              {(data.followUps||[]).map(fu => (
                <div key={fu.id} style={{ border:`1px solid ${C.bdr}`, borderRadius:10, padding:'11px 13px', marginBottom:8, background:C.surf2 }}>
                  <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
                    <select value={fu.type} onChange={e => updFU(fu.id,'type',e.target.value)} style={SEL}><option value="in_person">In-Person</option><option value="teleconsult">Teleconsult</option><option value="phone">Phone</option><option value="message">Message</option></select>
                    <select value={fu.status} onChange={e => updFU(fu.id,'status',e.target.value)} style={SEL}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="missed">Missed</option><option value="rescheduled">Rescheduled</option></select>
                    <button onClick={() => delFU(fu.id)} style={{ marginLeft:'auto', color:C.red, background:'none', border:'none', cursor:'pointer', fontSize:16 }}>🗑</button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:6 }}>
                    <div><label style={LBL}>Date</label><input type="date" value={fu.date} onChange={e => updFU(fu.id,'date',e.target.value)} style={INP} /></div>
                    <div><label style={LBL}>Time</label><input type="time" value={fu.time||''} onChange={e => updFU(fu.id,'time',e.target.value)} style={INP} /></div>
                  </div>
                  <input value={fu.reason} onChange={e => updFU(fu.id,'reason',e.target.value)} placeholder="Purpose of follow-up…" style={INP} />
                </div>
              ))}
              <button onClick={addFU} style={BTN_ADD}>+ Schedule Follow-Up</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NOTE CARD (read view) ────────────────────────────────────────────────────
function NoteCard({ note, canEdit, onEdit, onPrint }: { note: ProgressNote; canEdit: boolean; onEdit: () => void; onPrint: () => void }) {
  const [open, setOpen] = useState(false);
  const vtCfg: Record<string,{ icon:string; color:string; label:string }> = {
    new_patient:  { icon:'🆕', color:C.grn,  label:'New Patient' },
    follow_up:    { icon:'🔄', color:C.acc,  label:'Follow-Up' },
    emergency:    { icon:'🚨', color:C.red,  label:'Emergency' },
    teleconsult:  { icon:'📹', color:'#7c5cfc', label:'Teleconsult' },
    review:       { icon:'📋', color:C.amb,  label:'Review' },
  };
  const vc = vtCfg[note.visitType] || vtCfg.follow_up;
  const crits = (note.alerts||[]).filter(a => !a.acknowledged && a.severity==='critical').length;
  const warns = (note.alerts||[]).filter(a => !a.acknowledged && a.severity==='warning').length;

  return (
    <div style={{
      border:`1.5px solid ${C.bdr}`, borderLeft:`4px solid ${vc.color}`,
      borderRadius:12, marginBottom:12, overflow:'hidden', background:C.surf,
      transition:'border-color .2s',
    }} className="cr-anim cr-hover-card">
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 15px', cursor:'pointer' }} onClick={() => setOpen(o=>!o)}>
        <span style={{ fontSize:17 }}>{vc.icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
            <span style={{ fontSize:13, fontWeight:700, color:C.txt }}>{fmtDT(note.visitDate)}</span>
            <span className="cr-tag" style={{ background:`${vc.color}18`, color:vc.color }}>{vc.label}</span>
            {crits > 0 && <span className="cr-tag" style={{ background:'rgba(240,82,82,.12)', color:C.red }}>🚨 {crits} Critical</span>}
            {warns > 0 && <span className="cr-tag" style={{ background:'rgba(245,166,35,.12)', color:C.amb }}>⚠ {warns} Alert</span>}
          </div>
          <div style={{ fontSize:11, color:C.mut, marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            Dr. {note.doctorName} · {note.doctorSpecialty}
            {note.chiefComplaint ? ` · "${note.chiefComplaint}"` : ''}
          </div>
        </div>
        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
          {canEdit && <button onClick={e => { e.stopPropagation(); onEdit(); }} style={{ ...BTN2, padding:'4px 10px', fontSize:11 }}>✎ Edit</button>}
          <button onClick={e => { e.stopPropagation(); onPrint(); }} style={{ ...BTN2, padding:'4px 10px', fontSize:11 }}>🖨</button>
          <span style={{ fontSize:13, color:C.mut, transform:open?'rotate(180deg)':'none', transition:'transform .2s' }}>▼</span>
        </div>
      </div>

      {open && (
        <div style={{ padding:'0 15px 15px', borderTop:`1px solid ${C.bdr}` }}>
          {(note.alerts||[]).filter(a => !a.acknowledged).length > 0 && (
            <div style={{ paddingTop:10 }}>{note.alerts.filter(a=>!a.acknowledged).map(a => <AlertRow key={a.id} a={a} />)}</div>
          )}

          {note.vitals && Object.values(note.vitals).some(v => v!==undefined) && (
            <div style={{ marginTop:13 }}>
              <div style={SEC_HDR}>Vital Signs</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:5 }}>
                {note.vitals.bp && <VC label="BP" val={note.vitals.bp} unit="mmHg" icon="🫀" />}
                {note.vitals.hr !== undefined && <VC label="HR" val={note.vitals.hr} unit="bpm" icon="💓" flag={note.vitals.hr>100?'high':note.vitals.hr<50?'low':undefined} />}
                {note.vitals.temp !== undefined && <VC label="Temp" val={note.vitals.temp} unit="°C" icon="🌡️" flag={note.vitals.temp>=38.5?'high':undefined} />}
                {note.vitals.spo2 !== undefined && <VC label="SpO₂" val={`${note.vitals.spo2}%`} icon="🫁" flag={note.vitals.spo2<92?'critical':undefined} />}
                {note.vitals.weight !== undefined && <VC label="Weight" val={note.vitals.weight} unit="kg" icon="⚖️" />}
                {note.vitals.bmi !== undefined && <VC label="BMI" val={note.vitals.bmi} icon="📊" />}
                {note.vitals.pain !== undefined && <VC label="Pain" val={`${note.vitals.pain}/10`} icon="😣" flag={note.vitals.pain>=7?'critical':note.vitals.pain>=4?'high':undefined} />}
                {note.vitals.fbs !== undefined && <VC label="FBS" val={note.vitals.fbs} unit="mmol/L" icon="🩸" flag={note.vitals.fbs>=7?'high':undefined} />}
                {note.vitals.gcs !== undefined && <VC label="GCS" val={`${note.vitals.gcs}/15`} icon="🧠" flag={note.vitals.gcs<13?'critical':undefined} />}
              </div>
            </div>
          )}

          {note.chiefComplaint && <div style={{ marginTop:13 }}><div style={SEC_HDR}>Chief Complaint</div><p style={{ fontSize:13, lineHeight:1.65, margin:0, color:C.txt }}>{note.chiefComplaint}</p></div>}
          {note.hpi && <div style={{ marginTop:10 }}><div style={SEC_HDR}>History of Present Illness</div><p style={{ fontSize:13, lineHeight:1.65, margin:0, whiteSpace:'pre-wrap', color:C.txt }}>{note.hpi}</p></div>}

          {note.pmh && <div style={{ marginTop:10 }}><div style={SEC_HDR}>Past Medical History</div><p style={{ fontSize:13, lineHeight:1.6, margin:0, color:C.txt }}>{note.pmh}</p></div>}
          {note.allergies && <div style={{ marginTop:10 }}><div style={SEC_HDR}>⚠ Allergies</div><p style={{ fontSize:13, lineHeight:1.6, margin:0, color:C.amb, fontWeight:600 }}>{note.allergies}</p></div>}

          {note.examination && Object.values(note.examination).some(Boolean) && (
            <div style={{ marginTop:13 }}>
              <div style={SEC_HDR}>Physical Examination</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5, marginTop:5 }}>
                {Object.entries(note.examination).filter(([,v])=>v).map(([k,v]) => (
                  <div key={k} style={{ background:C.surf2, borderRadius:7, padding:'6px 10px' }}>
                    <div style={{ fontSize:9, fontWeight:800, color:C.mut, textTransform:'uppercase', marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:12, color:C.txt }}>{v as string}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(note.diagnoses||[]).length > 0 && (
            <div style={{ marginTop:13 }}>
              <div style={SEC_HDR}>Diagnoses</div>
              {note.diagnoses.map(dx => (
                <div key={dx.id} style={{ display:'flex', gap:7, alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${C.bdr}`, flexWrap:'wrap' }}>
                  <span className="cr-tag" style={{ background: dx.type==='primary'?'rgba(16,217,160,.15)':'rgba(107,122,157,.12)', color:dx.type==='primary'?C.grn:C.mut }}>{dx.type}</span>
                  {dx.code && <span style={{ fontSize:10, fontFamily:'var(--cr-mono)', color:C.mut, padding:'2px 6px', background:C.surf2, borderRadius:4 }}>{dx.code}</span>}
                  <span style={{ fontSize:13, fontWeight:600, flex:1, color:C.txt }}>{dx.description}</span>
                  <span className="cr-tag" style={{ background:dx.status==='active'?'rgba(240,82,82,.1)':'rgba(107,122,157,.1)', color:dx.status==='active'?C.red:C.mut }}>{dx.status}</span>
                </div>
              ))}
            </div>
          )}

          {(note.prescriptions||[]).length > 0 && (
            <div style={{ marginTop:13 }}>
              <div style={SEC_HDR}>Prescriptions</div>
              {note.prescriptions.map(rx => (
                <div key={rx.id} style={{ display:'flex', gap:10, padding:'7px 11px', background:C.surf2, borderRadius:8, marginBottom:4, alignItems:'flex-start' }}>
                  <span>💊</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.txt }}>{rx.medication}</div>
                    <div style={{ fontSize:11, color:C.mut }}>{rx.dosage} · {rx.frequency} · {rx.duration} · {rx.route?.toUpperCase()}</div>
                    {rx.instructions && <div style={{ fontSize:11, fontStyle:'italic', color:C.mut, marginTop:1 }}>{rx.instructions}</div>}
                  </div>
                  <span className="cr-tag" style={{ background:rx.status==='active'?'rgba(16,217,160,.12)':'rgba(107,122,157,.1)', color:rx.status==='active'?C.grn:C.mut }}>{rx.status}</span>
                  {rx.adherence && rx.adherence!=='unknown' && (
                    <span className="cr-tag" style={{ background:rx.adherence==='good'?'rgba(16,217,160,.1)':rx.adherence==='poor'?'rgba(240,82,82,.1)':'rgba(245,166,35,.1)', color:rx.adherence==='good'?C.grn:rx.adherence==='poor'?C.red:C.amb }}>{rx.adherence}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {(note.labOrders||[]).length > 0 && (
            <div style={{ marginTop:13 }}>
              <div style={SEC_HDR}>Laboratory</div>
              {note.labOrders.map(lab => (
                <div key={lab.id} style={{ display:'flex', gap:10, padding:'7px 11px', background:C.surf2, borderRadius:8, marginBottom:4, alignItems:'flex-start' }}>
                  <span>🧪</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.txt }}>{lab.test}</div>
                    <div style={{ fontSize:11, color:C.mut }}>{lab.category} · {lab.urgency}</div>
                    {lab.result && <div style={{ fontSize:12, fontWeight:lab.flag&&lab.flag!=='normal'?700:400, color:lab.flag==='critical'?C.red:lab.flag==='high'?C.amb:C.txt, marginTop:2 }}>{lab.resultValue} {lab.unit} — {lab.result}</div>}
                    {lab.notes && <div style={{ fontSize:11, fontStyle:'italic', color:C.mut, marginTop:1 }}>{lab.notes}</div>}
                  </div>
                  <span className="cr-tag" style={{ background:lab.flag==='critical'?'rgba(240,82,82,.12)':lab.flag==='high'?'rgba(245,166,35,.12)':lab.status==='resulted'?'rgba(16,217,160,.12)':'rgba(107,122,157,.1)', color:lab.flag==='critical'?C.red:lab.flag==='high'?C.amb:lab.status==='resulted'?C.grn:C.mut }}>{lab.flag&&lab.flag!=='normal'?lab.flag.toUpperCase():lab.status}</span>
                </div>
              ))}
            </div>
          )}

          {(note.imagingOrders||[]).length > 0 && (
            <div style={{ marginTop:13 }}>
              <div style={SEC_HDR}>Imaging</div>
              {note.imagingOrders.map(img => (
                <div key={img.id} style={{ padding:'7px 11px', background:C.surf2, borderRadius:8, marginBottom:4 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span>🩻</span>
                    <span className="cr-tag" style={{ background:'rgba(124,92,252,.15)', color:C.acc2 }}>{img.modality}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:C.txt }}>{img.study}</span>
                    <span className="cr-tag" style={{ marginLeft:'auto', background:C.surf, color:C.mut }}>{img.status}</span>
                  </div>
                  {img.impression && <div style={{ fontSize:12, color:C.txt, marginTop:5, paddingLeft:22 }}><strong>Impression:</strong> {img.impression}</div>}
                </div>
              ))}
            </div>
          )}

          {(note.referrals||[]).length > 0 && (
            <div style={{ marginTop:13 }}>
              <div style={SEC_HDR}>Referrals</div>
              {note.referrals.map(ref => (
                <div key={ref.id} style={{ padding:'7px 11px', background:C.surf2, borderRadius:8, marginBottom:4 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span>🏥</span>
                    <span style={{ fontSize:13, fontWeight:700, color:C.txt }}>{ref.toSpecialty}</span>
                    {ref.toFacility && <span style={{ fontSize:11, color:C.mut }}>@ {ref.toFacility}</span>}
                    <span className="cr-tag" style={{ marginLeft:'auto', background:ref.urgency==='emergency'?'rgba(240,82,82,.12)':'rgba(107,122,157,.1)', color:ref.urgency==='emergency'?C.red:C.mut }}>{ref.urgency}</span>
                  </div>
                  <div style={{ fontSize:12, color:C.mut, paddingLeft:22, marginTop:3 }}>{ref.reason}</div>
                </div>
              ))}
            </div>
          )}

          {(note.followUps||[]).length > 0 && (
            <div style={{ marginTop:13 }}>
              <div style={SEC_HDR}>Follow-Up Schedule</div>
              {note.followUps.map(fu => (
                <div key={fu.id} style={{ display:'flex', gap:10, padding:'7px 11px', background:C.surf2, borderRadius:8, marginBottom:4, alignItems:'center' }}>
                  <span>📅</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.txt }}>{fu.date}{fu.time ? ` at ${fu.time}` : ''}</div>
                    <div style={{ fontSize:11, color:C.mut }}>{fu.type.replace(/_/g,' ')} · {fu.reason}</div>
                  </div>
                  <span className="cr-tag" style={{ background:fu.status==='completed'?'rgba(16,217,160,.12)':fu.status==='missed'?'rgba(240,82,82,.1)':'rgba(79,142,247,.1)', color:fu.status==='completed'?C.grn:fu.status==='missed'?C.red:C.acc }}>{fu.status}</span>
                </div>
              ))}
            </div>
          )}

          {note.plan && <div style={{ marginTop:13 }}><div style={SEC_HDR}>Management Plan</div><p style={{ fontSize:13, lineHeight:1.65, margin:0, whiteSpace:'pre-wrap', color:C.txt }}>{note.plan}</p></div>}
          {note.progressAssessment && <div style={{ marginTop:8 }}><div style={SEC_HDR}>Progress Assessment</div><p style={{ fontSize:13, lineHeight:1.65, margin:0, whiteSpace:'pre-wrap', color:C.txt }}>{note.progressAssessment}</p></div>}

          <div style={{ marginTop:11, fontSize:10, color:C.mut, borderTop:`1px solid ${C.bdr}`, paddingTop:7, display:'flex', gap:12 }}>
            <span>Created: {fmtDT(note.createdAt)}</span>
            {note.lastEditedAt && <span>Edited: {fmtDT(note.lastEditedAt)}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BIODATA CARD ─────────────────────────────────────────────────────────────
function BiodataCard({ patient }: { patient: PatientBiodata }) {
  const [expanded, setExpanded] = useState(false);
  const rows = [
    { label:'Date of Birth', val: patient.dob ? `${patient.dob}  (${age(patient.dob)})` : '' },
    { label:'Gender', val: patient.gender },
    { label:'Phone', val: patient.phone },
    { label:'Email', val: patient.email },
    { label:'National ID', val: patient.nationalId },
    { label:'NHIF No.', val: patient.nhif },
    { label:'Blood Group', val: patient.bloodGroup },
    { label:'Occupation', val: patient.occupation },
    { label:'Marital Status', val: patient.maritalStatus },
    { label:'Address', val: patient.address },
    { label:'Next of Kin', val: patient.nextOfKin },
    { label:'Emergency Contact', val: patient.emergencyContact },
    { label:'Emergency Phone', val: patient.emergencyPhone },
    { label:'Insurance', val: patient.insurance },
  ].filter(r => r.val);

  const visible = expanded ? rows : rows.slice(0, 6);

  return (
    <div style={{ background:C.surf2, borderRadius:12, padding:'12px 14px', marginBottom:14, border:`1px solid ${C.bdr}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ fontSize:16 }}>🪪</span>
        <span style={{ fontSize:11, fontWeight:800, color:C.acc, textTransform:'uppercase', letterSpacing:'.8px' }}>Patient Biodata</span>
        {(patient.knownAllergies) && (
          <span className="cr-tag" style={{ background:'rgba(245,166,35,.12)', color:C.amb, marginLeft:'auto' }}>⚠ Allergies on file</span>
        )}
      </div>

      {/* Allergies — always visible, prominent */}
      {patient.knownAllergies && (
        <div style={{ background:'rgba(245,166,35,.1)', border:'1px solid rgba(245,166,35,.3)', borderRadius:8, padding:'7px 11px', marginBottom:10, display:'flex', gap:8, alignItems:'flex-start' }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <div>
            <div style={{ fontSize:10, fontWeight:800, color:C.amb, textTransform:'uppercase', letterSpacing:.5 }}>Known Allergies</div>
            <div style={{ fontSize:13, fontWeight:600, color:C.amb }}>{patient.knownAllergies}</div>
          </div>
        </div>
      )}
      {patient.chronicConditions && (
        <div style={{ background:'rgba(79,142,247,.08)', border:'1px solid rgba(79,142,247,.2)', borderRadius:8, padding:'7px 11px', marginBottom:10, display:'flex', gap:8, alignItems:'flex-start' }}>
          <span style={{ fontSize:14 }}>📌</span>
          <div>
            <div style={{ fontSize:10, fontWeight:800, color:C.acc, textTransform:'uppercase', letterSpacing:.5 }}>Chronic Conditions</div>
            <div style={{ fontSize:13, color:C.txt }}>{patient.chronicConditions}</div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'4px 12px' }}>
        {visible.map(r => (
          <div key={r.label} style={{ padding:'4px 0' }}>
            <div style={{ fontSize:9, fontWeight:700, color:C.mut, textTransform:'uppercase', letterSpacing:'.6px' }}>{r.label}</div>
            <div style={{ fontSize:12, color: r.label==='Blood Group' ? C.red : C.txt, fontWeight: r.label==='Blood Group'?700:400, marginTop:1 }}>
              {r.label==='Blood Group' && r.val ? `🩸 ${r.val}` : r.val}
            </div>
          </div>
        ))}
      </div>

      {rows.length > 6 && (
        <button onClick={() => setExpanded(e=>!e)} style={{ marginTop:8, fontSize:11, color:C.acc, background:'none', border:'none', cursor:'pointer', fontFamily:'var(--cr-sans)', fontWeight:600 }}>
          {expanded ? '▲ Show less' : `▼ Show ${rows.length - 6} more fields`}
        </button>
      )}
    </div>
  );
}

// ─── PRINT MODAL ──────────────────────────────────────────────────────────────
function PrintModal({ patient, doctor, notes, onClose }: {
  patient: PatientBiodata; doctor: DoctorProfile; notes: ProgressNote[]; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const doPrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/>
<title>Clinical Record — ${patient.name}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;font-size:10.5pt;color:#0d1b3e;background:#fff;padding:30px 34px;line-height:1.55}
.serif{font-family:'EB Garamond',Georgia,serif}
.mono{font-family:'JetBrains Mono',monospace}

/* LETTERHEAD */
.letterhead{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid #0d1b3e}
.lh-brand h1{font-family:'EB Garamond',Georgia,serif;font-size:22pt;font-weight:700;color:#0d1b3e;letter-spacing:-.5px}
.lh-brand p{font-size:9pt;color:#5a6b8c;margin-top:2px}
.lh-meta{text-align:right;font-size:9pt;color:#5a6b8c}
.lh-meta strong{display:block;font-size:11pt;color:#0d1b3e;font-weight:700}
.lh-meta .doc-no{font-family:'JetBrains Mono',monospace;font-size:8pt;color:#5a6b8c;margin-top:2px;letter-spacing:.5px}

/* PATIENT + DOCTOR HEADER */
.header-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px;border:1.5px solid #c5d2e8;border-radius:6px;overflow:hidden}
.header-cell{padding:14px 16px}
.header-cell:first-child{border-right:1.5px solid #c5d2e8}
.header-cell h2{font-size:11pt;font-weight:700;color:#0d1b3e;margin-bottom:8px;display:flex;align-items:center;gap:6px}
.row{margin-bottom:5px}
.row .lbl{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#5a6b8c;display:block;margin-bottom:1px}
.row .val{font-size:10.5pt;color:#0d1b3e}
.allergy-box{background:#fffbeb;border:1.5px solid #d97706;border-radius:5px;padding:8px 12px;margin-top:8px}
.allergy-box .lbl{color:#b45309}
.allergy-box .val{color:#92400e;font-weight:700}

/* VISIT */
.visit{border:1.5px solid #c5d2e8;border-radius:6px;margin-bottom:16px;page-break-inside:avoid}
.visit-header{display:flex;justify-content:space-between;align-items:center;background:#f0f5ff;padding:10px 14px;border-bottom:1px solid #c5d2e8;border-radius:4px 4px 0 0}
.visit-header .vtype{font-size:10pt;font-weight:700;color:#0d1b3e}
.visit-header .vdoctor{font-size:9pt;color:#5a6b8c}
.visit-body{padding:12px 14px}

/* SECTIONS */
.sec{margin-top:10px}
.sec-title{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#2d4cb0;margin-bottom:5px;padding-bottom:2px;border-bottom:1px solid #dde5f7}
.sec p{font-size:10pt;color:#0d1b3e;line-height:1.6;margin-top:3px}

/* VITALS */
.vital-strip{display:flex;gap:8px;flex-wrap:wrap;margin-top:5px}
.vital-box{border:1px solid #c5d2e8;border-radius:5px;padding:6px 10px;text-align:center;min-width:72px}
.vital-val{font-family:'JetBrains Mono',monospace;font-size:13pt;font-weight:600;color:#0d1b3e}
.vital-unit{font-size:8pt;color:#5a6b8c}
.vital-label{font-size:8pt;color:#5a6b8c;font-weight:600;margin-top:2px}
.vital-box.crit{border-color:#dc2626;background:#fff5f5}
.vital-box.crit .vital-val{color:#dc2626}
.vital-box.warn{border-color:#d97706;background:#fffbeb}
.vital-box.warn .vital-val{color:#d97706}

/* BADGES */
.badge{display:inline-flex;align-items:center;font-size:8pt;padding:2px 7px;border:1px solid #c5d2e8;border-radius:99px;margin-right:5px;font-weight:600;white-space:nowrap}
.badge.primary{border-color:#059669;color:#065f46;background:#ecfdf5}
.badge.active{border-color:#dc2626;color:#991b1b;background:#fef2f2}
.badge.stat{border-color:#dc2626;color:#991b1b}
.badge.urgent{border-color:#d97706;color:#92400e}

/* DRUGS */
.drug-row{padding:5px 10px;background:#f8faff;border-left:3px solid #4f8ef7;margin-bottom:4px;border-radius:0 4px 4px 0}
.drug-name{font-size:10.5pt;font-weight:700;color:#0d1b3e}
.drug-sub{font-size:9pt;color:#5a6b8c;margin-top:1px}

/* SIGNATURE */
.signature{margin-top:32px;border-top:2px solid #0d1b3e;padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end}
.sig-left{}
.sig-line{border-bottom:1px solid #0d1b3e;width:220px;margin-bottom:5px}
.sig-name{font-size:10.5pt;font-weight:700;color:#0d1b3e}
.sig-sub{font-size:8.5pt;color:#5a6b8c}
.sig-right{text-align:right}
.stamp-box{border:2px dashed #c5d2e8;border-radius:8px;width:130px;height:80px;display:flex;align-items:center;justify-content:center;color:#c5d2e8;font-size:9pt}

/* ALERTS */
.alert-row{padding:5px 10px;border-radius:4px;margin-bottom:4px;font-size:9.5pt}
.alert-row.critical{background:#fef2f2;border-left:3px solid #dc2626;color:#991b1b}
.alert-row.warning{background:#fffbeb;border-left:3px solid #d97706;color:#92400e}

/* FOOTER */
.footer{margin-top:20px;padding-top:10px;border-top:1px solid #c5d2e8;display:flex;justify-content:space-between;font-size:8pt;color:#94a3b8}
@media print{body{padding:16px}@page{margin:15mm}}
</style></head><body>
${ref.current?.innerHTML||''}
</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 600);
  };

  const docNo = `AMX-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,.7)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>
      <div style={{ background:C.surf, borderRadius:16, width:'92vw', maxWidth:860, maxHeight:'93vh', overflow:'hidden', display:'flex', flexDirection:'column', border:`1px solid ${C.bdr}` }}>
        <div style={{ display:'flex', gap:10, padding:'13px 18px', background:C.surf2, borderBottom:`1px solid ${C.bdr}`, alignItems:'center' }}>
          <span style={{ fontSize:18 }}>🖨️</span>
          <span style={{ flex:1, fontSize:14, fontWeight:700, color:C.txt }}>Official Clinical Record — Print / Export PDF</span>
          <button onClick={doPrint} style={BTN}>🖨 Print / Save PDF</button>
          <button onClick={onClose} style={BTN2}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:32, background:'#f0f5ff' }} className="cr-sc">
          {/* PREVIEW */}
          <div ref={ref} style={{ background:'#fff', padding:'30px 34px', borderRadius:8, boxShadow:'0 4px 32px rgba(0,0,0,.12)', maxWidth:780, margin:'0 auto' }}>
            {/* Letterhead */}
            <div className="letterhead">
              <div className="lh-brand">
                <h1>AMEXAN Health System</h1>
                <p>Clinical Record · Confidential Medical Document</p>
              </div>
              <div className="lh-meta">
                <strong>Date of Issue</strong>
                <div>{new Date().toLocaleDateString('en-KE',{day:'2-digit',month:'long',year:'numeric'})}</div>
                <div className="doc-no">Ref: {docNo}</div>
              </div>
            </div>

            {/* Patient + Doctor */}
            <div className="header-grid">
              <div className="header-cell">
                <h2>👤 Patient Information</h2>
                <div className="row"><span className="lbl">Full Name</span><span className="val" style={{ fontSize:'13pt', fontWeight:700 }}>{patient.name}</span></div>
                {patient.dob && <div className="row"><span className="lbl">Date of Birth / Age</span><span className="val">{patient.dob} ({age(patient.dob)})</span></div>}
                {patient.gender && <div className="row"><span className="lbl">Gender</span><span className="val" style={{ textTransform:'capitalize' }}>{patient.gender}</span></div>}
                {patient.nationalId && <div className="row"><span className="lbl">National ID</span><span className="val mono">{patient.nationalId}</span></div>}
                {patient.nhif && <div className="row"><span className="lbl">NHIF No.</span><span className="val mono">{patient.nhif}</span></div>}
                {patient.phone && <div className="row"><span className="lbl">Phone</span><span className="val">{patient.phone}</span></div>}
                {patient.occupation && <div className="row"><span className="lbl">Occupation</span><span className="val">{patient.occupation}</span></div>}
                {patient.address && <div className="row"><span className="lbl">Address</span><span className="val">{patient.address}</span></div>}
                {patient.emergencyContact && <div className="row"><span className="lbl">Emergency Contact</span><span className="val">{patient.emergencyContact} {patient.emergencyPhone ? `· ${patient.emergencyPhone}` : ''}</span></div>}
                {patient.knownAllergies && (
                  <div className="allergy-box">
                    <span className="lbl">⚠ KNOWN ALLERGIES</span>
                    <span className="val">{patient.knownAllergies}</span>
                  </div>
                )}
                {patient.chronicConditions && <div className="row" style={{ marginTop:6 }}><span className="lbl">Chronic Conditions</span><span className="val">{patient.chronicConditions}</span></div>}
                {patient.bloodGroup && <div className="row"><span className="lbl">Blood Group</span><span className="val" style={{ fontWeight:700, color:'#dc2626' }}>{patient.bloodGroup}</span></div>}
                {patient.insurance && <div className="row"><span className="lbl">Insurance</span><span className="val">{patient.insurance}</span></div>}
              </div>
              <div className="header-cell">
                <h2>👨‍⚕️ Treating Physician</h2>
                <div className="row"><span className="lbl">Name</span><span className="val" style={{ fontSize:'13pt', fontWeight:700 }}>Dr. {doctor.name}</span></div>
                <div className="row"><span className="lbl">Specialty</span><span className="val">{doctor.specialty}</span></div>
                {doctor.licenseNo && <div className="row"><span className="lbl">Medical Licence</span><span className="val mono">{doctor.licenseNo}</span></div>}
                {doctor.facility && <div className="row"><span className="lbl">Facility / Hospital</span><span className="val">{doctor.facility}</span></div>}
                <div className="row" style={{ marginTop:12 }}><span className="lbl">Total Visit Notes</span><span className="val" style={{ fontWeight:700 }}>{notes.length}</span></div>
              </div>
            </div>

            {/* Visit notes */}
            {notes.map((n,idx) => (
              <div key={n.id} className="visit">
                <div className="visit-header">
                  <div>
                    <div className="vtype">{n.visitType?.replace(/_/g,' ').toUpperCase()} — {fmtDT(n.visitDate)}</div>
                    <div className="vdoctor">Dr. {n.doctorName} · {n.doctorSpecialty}</div>
                  </div>
                  <div style={{ fontSize:'8pt', color:'#5a6b8c' }}>Visit {notes.length - idx} of {notes.length}</div>
                </div>
                <div className="visit-body">
                  {n.alerts?.filter(a=>a.severity!=='info'&&!a.acknowledged).map(a=>(
                    <div key={a.id} className={`alert-row ${a.severity}`}>{a.severity==='critical'?'🚨':'⚠️'} {a.message}</div>
                  ))}
                  {n.chiefComplaint && <div className="sec"><div className="sec-title">Chief Complaint</div><p>{n.chiefComplaint}</p></div>}
                  {n.hpi && <div className="sec"><div className="sec-title">History of Present Illness</div><p style={{ whiteSpace:'pre-wrap' }}>{n.hpi}</p></div>}
                  {n.ros && <div className="sec"><div className="sec-title">Review of Systems</div><p>{n.ros}</p></div>}
                  {n.pmh && <div className="sec"><div className="sec-title">Past Medical History</div><p>{n.pmh}</p></div>}
                  {n.psh && <div className="sec"><div className="sec-title">Past Surgical History</div><p>{n.psh}</p></div>}
                  {n.fh && <div className="sec"><div className="sec-title">Family History</div><p>{n.fh}</p></div>}
                  {n.sh && <div className="sec"><div className="sec-title">Social History</div><p>{n.sh}</p></div>}
                  {n.allergies && <div className="sec"><div className="sec-title" style={{ color:'#d97706' }}>Allergies</div><p style={{ fontWeight:600, color:'#92400e' }}>{n.allergies}</p></div>}
                  {n.currentMeds && <div className="sec"><div className="sec-title">Current Medications</div><p>{n.currentMeds}</p></div>}
                  {n.vitals && Object.values(n.vitals).some(v=>v!==undefined) && (
                    <div className="sec">
                      <div className="sec-title">Vital Signs</div>
                      <div className="vital-strip">
                        {n.vitals.bp && <div className="vital-box"><div className="vital-val">{n.vitals.bp}</div><div className="vital-unit">mmHg</div><div className="vital-label">BP</div></div>}
                        {n.vitals.hr !== undefined && <div className={`vital-box${n.vitals.hr>100?'warn':''}`}><div className="vital-val">{n.vitals.hr}</div><div className="vital-unit">bpm</div><div className="vital-label">HR</div></div>}
                        {n.vitals.temp !== undefined && <div className={`vital-box${n.vitals.temp>=38.5?' warn':''}`}><div className="vital-val">{n.vitals.temp}</div><div className="vital-unit">°C</div><div className="vital-label">Temp</div></div>}
                        {n.vitals.spo2 !== undefined && <div className={`vital-box${n.vitals.spo2<92?' crit':''}`}><div className="vital-val">{n.vitals.spo2}%</div><div className="vital-label">SpO₂</div></div>}
                        {n.vitals.weight !== undefined && <div className="vital-box"><div className="vital-val">{n.vitals.weight}</div><div className="vital-unit">kg</div><div className="vital-label">Wt</div></div>}
                        {n.vitals.bmi !== undefined && <div className="vital-box"><div className="vital-val">{n.vitals.bmi}</div><div className="vital-unit">BMI</div><div className="vital-label">{bmiLabel(n.vitals.bmi)}</div></div>}
                        {n.vitals.pain !== undefined && <div className={`vital-box${n.vitals.pain>=7?' crit':''}`}><div className="vital-val">{n.vitals.pain}/10</div><div className="vital-label">Pain</div></div>}
                        {n.vitals.rr !== undefined && <div className="vital-box"><div className="vital-val">{n.vitals.rr}</div><div className="vital-unit">/min</div><div className="vital-label">RR</div></div>}
                        {n.vitals.gcs !== undefined && <div className={`vital-box${n.vitals.gcs<13?' crit':''}`}><div className="vital-val">{n.vitals.gcs}/15</div><div className="vital-label">GCS</div></div>}
                      </div>
                    </div>
                  )}
                  {n.examination && Object.values(n.examination).some(Boolean) && (
                    <div className="sec">
                      <div className="sec-title">Physical Examination</div>
                      {Object.entries(n.examination).filter(([,v])=>v).map(([k,v])=>(
                        <div key={k} style={{ marginBottom:3 }}><strong style={{ textTransform:'uppercase', fontSize:'8pt', color:'#5a6b8c' }}>{k}:</strong> <span style={{ fontSize:'10pt' }}>{v as string}</span></div>
                      ))}
                    </div>
                  )}
                  {n.diagnoses?.length > 0 && (
                    <div className="sec">
                      <div className="sec-title">Diagnoses</div>
                      {n.diagnoses.map(dx=>(
                        <div key={dx.id} style={{ marginBottom:4 }}>
                          <span className={`badge ${dx.type}`}>{dx.type}</span>
                          {dx.code && <span className="badge mono">{dx.code}</span>}
                          <strong style={{ fontSize:'10.5pt' }}>{dx.description}</strong>
                          <span className={`badge ${dx.status}`} style={{ marginLeft:5 }}>{dx.status}</span>
                          {dx.onset && <span style={{ fontSize:'9pt', color:'#5a6b8c', marginLeft:5 }}>Onset: {dx.onset}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {n.investigations && <div className="sec"><div className="sec-title">Investigations / Impression</div><p>{n.investigations}</p></div>}
                  {n.prescriptions?.length > 0 && (
                    <div className="sec">
                      <div className="sec-title">Prescriptions</div>
                      {n.prescriptions.map(rx=>(
                        <div key={rx.id} className="drug-row">
                          <div className="drug-name">{rx.medication}</div>
                          <div className="drug-sub">{rx.dosage} — {rx.frequency} — {rx.duration} — Route: {rx.route?.toUpperCase()}{rx.instructions ? ` | ${rx.instructions}` : ''}</div>
                          {(rx.startDate || rx.endDate) && <div className="drug-sub" style={{ marginTop:1 }}>From: {rx.startDate}{rx.endDate ? ` → ${rx.endDate}` : ''}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  {n.labOrders?.length > 0 && (
                    <div className="sec">
                      <div className="sec-title">Laboratory Orders</div>
                      {n.labOrders.map(lab=>(
                        <div key={lab.id} style={{ marginBottom:4 }}>
                          <span className={`badge ${lab.urgency}`}>{lab.urgency.toUpperCase()}</span>
                          <strong>{lab.test}</strong> — {lab.category} — {lab.status}
                          {lab.resultValue && <span className="mono" style={{ marginLeft:6, fontWeight:700 }}>{lab.resultValue} {lab.unit}</span>}
                          {lab.result && <span style={{ marginLeft:4, fontSize:'9pt' }}>({lab.result})</span>}
                          {lab.flag && lab.flag!=='normal' && <span className={`badge ${lab.flag==='critical'?'active':''}`} style={{ marginLeft:6 }}>{lab.flag.toUpperCase()}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {n.imagingOrders?.length > 0 && (
                    <div className="sec">
                      <div className="sec-title">Imaging Orders</div>
                      {n.imagingOrders.map(img=>(
                        <div key={img.id} style={{ marginBottom:4 }}>
                          <span className="badge">{img.modality}</span>
                          <span className={`badge ${img.urgency}`}>{img.urgency.toUpperCase()}</span>
                          <strong>{img.study}</strong> ({img.bodyPart}) — {img.status}
                          {img.impression && <div style={{ fontSize:'9.5pt', color:'#0d1b3e', marginTop:3, paddingLeft:10 }}>Impression: {img.impression}</div>}
                          {img.radiologistName && <div style={{ fontSize:'8.5pt', color:'#5a6b8c', paddingLeft:10 }}>Radiologist: {img.radiologistName}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  {n.referrals?.length > 0 && (
                    <div className="sec">
                      <div className="sec-title">Referrals</div>
                      {n.referrals.map(ref=>(
                        <div key={ref.id} style={{ marginBottom:4 }}>
                          <span className={`badge ${ref.urgency}`}>{ref.urgency.toUpperCase()}</span>
                          → <strong>{ref.toSpecialty}</strong>
                          {ref.toDoctorName && <span> (Dr. {ref.toDoctorName})</span>}
                          {ref.toFacility && <span> @ {ref.toFacility}</span>}
                          <span style={{ fontSize:'9pt', color:'#5a6b8c', marginLeft:5 }}>{ref.status}</span>
                          <div style={{ fontSize:'9.5pt', color:'#0d1b3e', marginTop:2, paddingLeft:10 }}>{ref.reason}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {n.followUps?.length > 0 && (
                    <div className="sec">
                      <div className="sec-title">Follow-Up</div>
                      {n.followUps.map(fu=>(
                        <div key={fu.id} style={{ marginBottom:3 }}>
                          <strong>{fu.date}{fu.time ? ` at ${fu.time}` : ''}</strong> — {fu.type.replace(/_/g,' ')} — {fu.reason} (<em>{fu.status}</em>)
                        </div>
                      ))}
                    </div>
                  )}
                  {n.plan && <div className="sec"><div className="sec-title">Management Plan</div><p style={{ whiteSpace:'pre-wrap' }}>{n.plan}</p></div>}
                  {n.progressAssessment && <div className="sec"><div className="sec-title">Progress Assessment</div><p>{n.progressAssessment}</p></div>}
                  {n.educationGiven && <div className="sec"><div className="sec-title">Education Given to Patient</div><p>{n.educationGiven}</p></div>}
                  <div style={{ marginTop:10, borderTop:'1px dashed #c5d2e8', paddingTop:6, fontSize:'8.5pt', color:'#5a6b8c', display:'flex', justifyContent:'space-between' }}>
                    <span>Recorded: {fmtDT(n.createdAt)}</span>
                    {n.lastEditedAt && <span>Last edited: {fmtDT(n.lastEditedAt)}</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Signature block */}
            <div className="signature">
              <div className="sig-left">
                <div className="sig-line" />
                <div className="sig-name">Dr. {doctor.name}</div>
                <div className="sig-sub">{doctor.specialty}</div>
                {doctor.licenseNo && <div className="sig-sub">Lic: {doctor.licenseNo}</div>}
                {doctor.facility && <div className="sig-sub">{doctor.facility}</div>}
                <div className="sig-sub" style={{ marginTop:6 }}>Date: ___________________</div>
              </div>
              <div className="sig-right">
                <div className="stamp-box">Official Stamp</div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              <span>AMEXAN Health System — Confidential Clinical Document</span>
              <span>Ref: {docNo} · Printed: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Universal drop-in
// ═══════════════════════════════════════════════════════════════════════════════

interface Props {
  // Mode A: pass appointments array (HistoryPanel-compatible)
  appointments?: Appointment[];
  // Mode B: pass doctorId (ClinicalHistoryPanel-compatible)
  doctorId?: string;
  // Doctor profile (both modes)
  doctor: DoctorProfile;
  // Optional: initial patient selection
  initialPatientId?: string;
}

export default function ClinicalRecordSystem({
  appointments,
  doctorId: propDoctorId,
  doctor,
  initialPatientId
}: Props) {
  // safe fallback: check doctor exists
  const effectiveDoctorId = propDoctorId || doctor?.uid || '';

  const [view, setView] = useState<'clinical' | 'log'>('clinical');
  const [patients, setPatients] = useState<PatientBiodata[]>([]);
  const [selectedPid, setSelectedPid] = useState<string|null>(initialPatientId||null);
  const [patSearch, setPatSearch] = useState('');
  const [notes, setNotes] = useState<ProgressNote[]>([]);
  const [editingNote, setEditingNote] = useState<Partial<ProgressNote>|null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [apptFilter, setApptFilter] = useState<'all'|'completed'|'cancelled'>('all');
  const [apptSearch, setApptSearch] = useState('');
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  const [notifSending, setNotifSending] = useState(false);

  const selectedPatient = useMemo(() => patients.find(p => p.uid === selectedPid) || null, [patients, selectedPid]);

  // ── Load patients ──────────────────────────────────────────────────────────
  useEffect(() => {
    setPatientsLoading(true);

    if (appointments && appointments.length > 0) {
      // Mode A: from appointments prop
      const uids = [...new Set(appointments.map(a => a.patientId).filter(Boolean) as string[])];
      Promise.all(uids.map(async uid => {
        for (const col of ['patients','users','patientProfiles']) {
          try {
            const s = await getDoc(doc(db, col, uid));
            if (s.exists()) {
              const d = s.data() as any;
              return {
                uid,
                name: d.name||d.displayName||d.fullName||d.firstName+' '+d.lastName||uid.slice(0,8),
                dob: d.dob||d.dateOfBirth, gender: d.gender,
                phone: d.phone||d.phoneNumber, email: d.email,
                nhif: d.nhif, nationalId: d.nationalId||d.national_id,
                bloodGroup: d.bloodGroup||d.blood_group,
                knownAllergies: d.knownAllergies||d.allergies,
                chronicConditions: d.chronicConditions||d.chronic_conditions,
                emergencyContact: d.emergencyContact||d.emergency_contact,
                emergencyPhone: d.emergencyPhone||d.emergency_phone,
                occupation: d.occupation, maritalStatus: d.maritalStatus||d.marital_status,
                address: d.address, nextOfKin: d.nextOfKin||d.next_of_kin,
                insurance: d.insurance||d.insuranceProvider,
              } as PatientBiodata;
            }
          } catch {}
        }
        const appt = appointments.find(a => a.patientId === uid);
        return { uid, name: appt?.patientName || uid.slice(0,8) } as PatientBiodata;
      })).then(list => {
        setPatients(list.filter(Boolean) as PatientBiodata[]);
        setPatientsLoading(false);
      });
    } else {
      // Mode B: from Firestore appointments collection
      const u = onSnapshot(
        query(collection(db,'appointments'), where('doctorId','==',effectiveDoctorId)),
        async snap => {
          const uids = [...new Set(snap.docs.map(d => d.data().patientId).filter(Boolean) as string[])];
          const profiles: PatientBiodata[] = [];
          for (const uid of uids) {
            for (const col of ['patients','users','patientProfiles']) {
              try {
                const s = await getDoc(doc(db, col, uid));
                if (s.exists()) {
                  const d = s.data() as any;
                  profiles.push({
                    uid,
                    name: d.name||d.displayName||d.fullName||uid.slice(0,8),
                    dob: d.dob||d.dateOfBirth, gender: d.gender,
                    phone: d.phone||d.phoneNumber, email: d.email,
                    nhif: d.nhif, nationalId: d.nationalId,
                    bloodGroup: d.bloodGroup||d.blood_group,
                    knownAllergies: d.knownAllergies||d.allergies,
                    chronicConditions: d.chronicConditions,
                    emergencyContact: d.emergencyContact,
                    emergencyPhone: d.emergencyPhone,
                    occupation: d.occupation,
                    maritalStatus: d.maritalStatus,
                    address: d.address,
                    nextOfKin: d.nextOfKin,
                    insurance: d.insurance,
                  });
                  break;
                }
              } catch {}
            }
          }
          setPatients(profiles);
          setPatientsLoading(false);
        },
        () => setPatientsLoading(false)
      );
      return () => u();
    }
  }, [appointments, effectiveDoctorId]);

  // ── Load notes for selected patient — REAL-TIME ────────────────────────────
  useEffect(() => {
    if (!selectedPid) { setNotes([]); return; }
    setLoading(true);
    setEditingNote(null);
    setIsNew(false);

    // PRIMARY QUERY: with composite index (patientId + visitDate DESC)
    const q = query(
      collection(db, 'clinicalNotes'),
      where('patientId', '==', selectedPid),
      orderBy('visitDate', 'desc'),
    );

    const unsub = onSnapshot(q,
      snap => {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() } as ProgressNote));
        setNotes(loaded);
        setLoading(false);
      },
      async (err) => {
        // FALLBACK: if composite index doesn't exist yet, load without ordering
        console.warn('ClinicalRecordSystem: falling back to unordered query. Create a Firestore composite index on clinicalNotes(patientId ASC, visitDate DESC).', err);
        try {
          const fallbackQ = query(
            collection(db, 'clinicalNotes'),
            where('patientId', '==', selectedPid),
          );
          const snap = await getDocs(fallbackQ);
          const loaded = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as ProgressNote))
            .sort((a, b) => {
              const ta = a.visitDate?.toDate?.() || new Date(a.visitDate || 0);
              const tb = b.visitDate?.toDate?.() || new Date(b.visitDate || 0);
              return tb.getTime() - ta.getTime();
            });
          setNotes(loaded);
        } catch (e2) {
          console.error('ClinicalRecordSystem: fallback query also failed', e2);
        }
        setLoading(false);
      }
    );
    return () => unsub();
  }, [selectedPid]);

  // ── Save note ─────────────────────────────────────────────────────────────
  const saveNote = useCallback(async (noteData: Partial<ProgressNote>) => {
    if (!selectedPid) return;

    // ─────────────────────────────────────────────────────────────────────────
    // BULLETPROOF undefined-strip strategy
    //
    // noteData is pure plain data from React state — no Firestore FieldValues.
    // JSON.parse(JSON.stringify(...)) is the most reliable way to strip `undefined`
    // at every nesting depth (it omits undefined keys natively per the JSON spec).
    //
    // Firestore sentinel values (serverTimestamp) are added to the payload AFTER
    // the JSON round-trip so they are never corrupted.
    // ─────────────────────────────────────────────────────────────────────────
    let cleanData: Record<string, any>;
    try {
      cleanData = JSON.parse(JSON.stringify(noteData));
    } catch {
      // Fallback: manual recursive strip if JSON.stringify somehow fails
      const strip = (o: any): any => {
        if (o === null || o === undefined) return null;
        if (Array.isArray(o)) return o.filter(x => x !== undefined).map(strip);
        if (typeof o === 'object') {
          const out: any = {};
          for (const [k, v] of Object.entries(o)) {
            if (v !== undefined) out[k] = strip(v);
          }
          return out;
        }
        return o;
      };
      cleanData = strip(noteData);
    }

    // Build the final Firestore payload — sentinels added AFTER the clean
    const payload: Record<string, any> = {
      ...cleanData,
      patientId: selectedPid,
      doctorId: effectiveDoctorId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty || 'General Practice',
      isLocked: false,
      lastEditedAt: serverTimestamp(),   // FieldValue sentinel — safe, added after JSON clean
    };

    if (editingNote?.id) {
      await updateDoc(doc(db,'clinicalNotes',editingNote.id), payload);
    } else {
      const ref = await addDoc(collection(db,'clinicalNotes'), {
        ...payload,
        createdAt: serverTimestamp(),
        visitDate: serverTimestamp(),
      });
      // Push critical alerts to patient notifications
      for (const al of (noteData.alerts||[]).filter(a => !a.acknowledged && a.severity!=='info')) {
        await addDoc(collection(db,'patientNotifications'), {
          patientId: selectedPid, doctorId: effectiveDoctorId,
          doctorName: doctor.name, noteId: ref.id,
          type: al.type, severity: al.severity,
          title: `Clinical Alert: ${al.type.replace(/_/g,' ')}`,
          message: al.message, read: false, createdAt: serverTimestamp(),
        }).catch(()=>{});
        // Also write to legacy alerts collection
        await addDoc(collection(db,'alerts'), {
          patientId: selectedPid, doctorId: effectiveDoctorId,
          type: al.type, title: `⚠ ${al.type.replace(/_/g,' ')}`,
          message: al.message, read: false, createdAt: serverTimestamp(),
          urgency: al.severity,
        }).catch(()=>{});
      }
    }
    setEditingNote(null);
    setIsNew(false);
  }, [selectedPid, effectiveDoctorId, doctor, editingNote]);

  // ── Notify patient ─────────────────────────────────────────────────────────
  const notifyPatient = async (msg: string) => {
    if (!selectedPid) return;
    setNotifSending(true);
    await addDoc(collection(db,'patientNotifications'), {
      patientId: selectedPid, doctorId: effectiveDoctorId,
      doctorName: doctor.name, type: 'doctor_message',
      severity: 'info', title: `Message from Dr. ${doctor.name}`,
      message: msg, read: false, createdAt: serverTimestamp(),
    }).catch(()=>{});
    setNotifSending(false);
  };

  const startNew = () => {
    setEditingNote({
      visitDate: new Date(), visitType: 'follow_up',
      diagnoses:[], prescriptions:[], labOrders:[], imagingOrders:[], referrals:[], followUps:[], alerts:[],
      chiefComplaint:'', hpi:'',
    });
    setIsNew(true);
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const activeAlerts = notes.flatMap(n => (n.alerts||[]).filter(a => !a.acknowledged));
  const critCount = activeAlerts.filter(a => a.severity==='critical').length;
  const activeRx = notes.flatMap(n => (n.prescriptions||[]).filter(r => r.status==='active'));
  const pendingLabs = notes.flatMap(n => (n.labOrders||[]).filter(l => l.status==='ordered'||l.status==='processing'));

  const filteredPats = patients.filter(p =>
    !patSearch || p.name.toLowerCase().includes(patSearch.toLowerCase()) ||
    p.nhif?.includes(patSearch) || p.phone?.includes(patSearch)
  );

  const allAppts = appointments || [];
  const filteredAppts = allAppts.filter(a => {
    const ms = apptFilter==='all' ? (a.status==='completed'||a.status==='cancelled') : a.status===apptFilter;
    const mt = !apptSearch || `${a.patientName} ${a.specialty}`.toLowerCase().includes(apptSearch.toLowerCase());
    return ms && mt;
  });

  const scCfg: Record<string,{label:string;bg:string;color:string}> = {
    completed:{ label:'Completed', bg:'rgba(16,217,160,.12)', color:C.grn },
    cancelled:{ label:'Cancelled', bg:'rgba(240,82,82,.1)', color:C.red },
    active:{ label:'Active', bg:'rgba(79,142,247,.1)', color:C.acc },
    booked:{ label:'Booked', bg:'rgba(245,166,35,.1)', color:C.amb },
  };

  return (
    <div
      className="cr-root"
      data-cr-light={theme==='light' ? '' : undefined}
      style={{ background:C.bg, color:C.txt, height:'100%', display:'flex', flexDirection:'column', minHeight:0 }}
    >
      <style>{GLOBAL_CSS}</style>

      {/* ── Global toolbar ───────────────────────────────────────────────── */}
      <div style={{ display:'flex', borderBottom:`1px solid ${C.bdr}`, background:C.surf2, padding:'0 14px', flexShrink:0, alignItems:'center' }}>
        <div style={{ display:'flex', flex:1 }}>
          {[
            { id:'clinical', icon:'🏥', label:'Clinical Records' },
            { id:'log', icon:'🗂️', label:'Appointment Log' },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id as any)} style={{
              padding:'10px 15px', background:'none', border:'none',
              borderBottom: view===t.id ? `2.5px solid ${C.acc}` : '2.5px solid transparent',
              cursor:'pointer', fontSize:12, fontWeight: view===t.id ? 800:500,
              color: view===t.id ? C.acc : C.mut,
              fontFamily:'var(--cr-sans)', display:'flex', alignItems:'center', gap:5,
            }}>{t.icon} {t.label}{t.id==='clinical' && critCount>0 && <span style={{ fontSize:10, background:C.red, color:'#fff', borderRadius:99, padding:'1px 6px', marginLeft:4 }}>{critCount}</span>}</button>
          ))}
        </div>
        {/* Theme toggle */}
        <button onClick={() => setTheme(t=>t==='dark'?'light':'dark')} style={{ ...BTN2, padding:'5px 10px', fontSize:11 }}>
          {theme==='dark'?'☀️':'🌙'}
        </button>
      </div>

      {/* ── CLINICAL RECORDS VIEW ─────────────────────────────────────────── */}
      {view==='clinical' && (
        <div style={{ flex:1, display:'flex', minHeight:0, overflow:'hidden' }}>

          {/* Patient sidebar */}
          <div style={{ width:238, flexShrink:0, borderRight:`1px solid ${C.bdr}`, display:'flex', flexDirection:'column', background:C.surf }}>
            <div style={{ padding:'10px 11px 8px', borderBottom:`1px solid ${C.bdr}` }}>
              <div style={{ fontSize:11, fontWeight:800, color:C.acc, textTransform:'uppercase', letterSpacing:'.7px', marginBottom:7, display:'flex', alignItems:'center', gap:6 }}>
                Patients {critCount>0 && <span style={{ fontSize:9, background:C.red, color:'#fff', borderRadius:99, padding:'1px 6px' }} className="cr-pulse">{critCount}🚨</span>}
              </div>
              <input
                value={patSearch} onChange={e => setPatSearch(e.target.value)}
                placeholder="Search name, NHIF, phone…"
                style={{ ...INP, fontSize:12, padding:'6px 9px' }}
              />
            </div>
            <div className="cr-sc" style={{ flex:1, overflowY:'auto' }}>
              {patientsLoading && [1,2,3,4].map(i => (
                <div key={i} style={{ padding:'10px 11px', display:'flex', gap:10, alignItems:'center' }}>
                  <div className="cr-loading" style={{ width:34, height:34, borderRadius:'50%', flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div className="cr-loading" style={{ height:12, width:'70%', marginBottom:5 }} />
                    <div className="cr-loading" style={{ height:10, width:'50%' }} />
                  </div>
                </div>
              ))}
              {!patientsLoading && filteredPats.length===0 && (
                <div style={{ padding:24, textAlign:'center', fontSize:12, color:C.mut }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>👥</div>
                  No patients found
                </div>
              )}
              {filteredPats.map(p => {
                const sel = p.uid===selectedPid;
                const hue = p.name.charCodeAt(0)*7 % 360;
                return (
                  <button key={p.uid} onClick={() => { setSelectedPid(p.uid); setView('clinical'); }}
                    style={{ width:'100%', padding:'9px 11px', background: sel?'rgba(79,142,247,.08)':'transparent', border:'none', borderLeft:`3px solid ${sel?C.acc:'transparent'}`, cursor:'pointer', display:'flex', gap:10, alignItems:'center', textAlign:'left', fontFamily:'var(--cr-sans)', transition:'background .1s' }}
                    className="cr-hover-row">
                    <div style={{ width:34, height:34, borderRadius:'50%', background:`hsl(${hue},45%,35%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0 }}>{p.name[0]?.toUpperCase()}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight: sel?800:600, color: sel?C.acc:C.txt, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize:10, color:C.mut }}>{p.dob?age(p.dob):''}{p.bloodGroup?` · 🩸${p.bloodGroup}`:''}{p.nhif?` · NHIF`:''}</div>
                    </div>
                    {p.knownAllergies && <span style={{ fontSize:12, flexShrink:0 }}>⚠️</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main area */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
            {!selectedPatient ? (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, color:C.mut }}>
                <div style={{ fontSize:56 }}>📋</div>
                <div style={{ fontSize:16, fontWeight:700, color:C.txt }}>Select a patient</div>
                <div style={{ fontSize:13 }}>Choose a patient from the sidebar to open their complete longitudinal record</div>
              </div>
            ) : <>
              {/* Patient header */}
              <div style={{ padding:'11px 15px', borderBottom:`1px solid ${C.bdr}`, background:C.surf2, display:'flex', alignItems:'flex-start', gap:13, flexShrink:0, flexWrap:'wrap' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:`hsl(${selectedPatient.name.charCodeAt(0)*7%360},45%,35%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, fontWeight:800, color:'#fff', flexShrink:0 }}>{selectedPatient.name[0]?.toUpperCase()}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:16, fontWeight:800, color:C.txt, fontFamily:'var(--cr-serif)' }}>{selectedPatient.name}</span>
                    {selectedPatient.dob && <span style={{ fontSize:12, color:C.mut }}>{age(selectedPatient.dob)}</span>}
                    {selectedPatient.gender && <span style={{ fontSize:11, color:C.mut, textTransform:'capitalize' }}>{selectedPatient.gender}</span>}
                    {selectedPatient.bloodGroup && <span className="cr-tag" style={{ background:'rgba(240,82,82,.12)', color:C.red }}>🩸 {selectedPatient.bloodGroup}</span>}
                    {selectedPatient.knownAllergies && <span className="cr-tag" style={{ background:'rgba(245,166,35,.12)', color:C.amb }}>⚠ Allergies</span>}
                  </div>
                  <div style={{ display:'flex', gap:12, marginTop:4, flexWrap:'wrap', fontSize:11, color:C.mut }}>
                    {selectedPatient.phone && <span>📞 {selectedPatient.phone}</span>}
                    {selectedPatient.nhif && <span>🏥 NHIF: {selectedPatient.nhif}</span>}
                    {selectedPatient.nationalId && <span>🪪 {selectedPatient.nationalId}</span>}
                    {selectedPatient.chronicConditions && <span>📌 {selectedPatient.chronicConditions}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0, flexWrap:'wrap' }}>
                  <div style={{ textAlign:'center', padding:'5px 10px', background:C.surf, borderRadius:9, border:`1px solid ${C.bdr}` }}>
                    <div style={{ fontSize:18, fontWeight:800, color:C.acc }}>{notes.length}</div>
                    <div style={{ fontSize:9, color:C.mut, textTransform:'uppercase' }}>Visits</div>
                  </div>
                  <div style={{ textAlign:'center', padding:'5px 10px', background:C.surf, borderRadius:9, border:`1px solid ${C.bdr}` }}>
                    <div style={{ fontSize:18, fontWeight:800, color:C.grn }}>{activeRx.length}</div>
                    <div style={{ fontSize:9, color:C.mut, textTransform:'uppercase' }}>Active Rx</div>
                  </div>
                  {critCount>0 && <div style={{ textAlign:'center', padding:'5px 10px', background:'rgba(240,82,82,.07)', borderRadius:9, border:'1px solid rgba(240,82,82,.2)' }}>
                    <div style={{ fontSize:18, fontWeight:800, color:C.red }}>{critCount}</div>
                    <div style={{ fontSize:9, color:C.red, textTransform:'uppercase' }}>Alerts</div>
                  </div>}
                  <button onClick={startNew} style={BTN}>✚ New Visit</button>
                  <button onClick={() => setShowPrint(true)} style={BTN2}>🖨</button>
                </div>
              </div>

              {/* Doctor strip */}
              <div style={{ padding:'5px 15px', borderBottom:`1px solid ${C.bdr}`, fontSize:11, color:C.mut, display:'flex', gap:8, alignItems:'center', flexShrink:0, flexWrap:'wrap', background:C.surf }}>
                <span>👨‍⚕️ Dr. {doctor.name}</span>
                <span>·</span><span>{doctor.specialty}</span>
                {doctor.licenseNo && <><span>·</span><span>Lic: {doctor.licenseNo}</span></>}
                {doctor.facility && <><span>·</span><span>{doctor.facility}</span></>}
                <span style={{ marginLeft:'auto', fontSize:10, color:C.grn, fontWeight:700 }} className="cr-pulse">● LIVE</span>
              </div>

              {/* Active alerts strip */}
              {activeAlerts.length>0 && (
                <div style={{ padding:'7px 15px', borderBottom:`1px solid rgba(240,82,82,.15)`, background:'rgba(240,82,82,.04)', flexShrink:0 }}>
                  {activeAlerts.slice(0,3).map(a => (
                    <div key={a.id} style={{ fontSize:12, display:'flex', gap:7, alignItems:'center', color:a.severity==='critical'?C.red:C.amb, marginBottom:2 }}>
                      <span>{a.severity==='critical'?'🚨':'⚠️'}</span><span>{a.message}</span>
                    </div>
                  ))}
                  {activeAlerts.length>3 && <div style={{ fontSize:10, color:C.mut }}>+{activeAlerts.length-3} more unacknowledged alerts</div>}
                </div>
              )}

              {/* Active Rx + pending labs ribbon */}
              {(activeRx.length>0 || pendingLabs.length>0) && (
                <div style={{ display:'flex', gap:7, padding:'7px 15px', borderBottom:`1px solid ${C.bdr}`, overflowX:'auto', flexShrink:0 }}>
                  {activeRx.slice(0,4).map(rx => (
                    <div key={rx.id} style={{ flexShrink:0, padding:'4px 10px', background:'rgba(16,217,160,.07)', border:'1px solid rgba(16,217,160,.2)', borderRadius:7, fontSize:11 }}>
                      <div style={{ fontWeight:700, color:C.grn }}>💊 {rx.medication}</div>
                      <div style={{ color:C.mut }}>{rx.dosage} · {rx.frequency}</div>
                    </div>
                  ))}
                  {pendingLabs.slice(0,3).map(lab => (
                    <div key={lab.id} style={{ flexShrink:0, padding:'4px 10px', background:'rgba(79,142,247,.07)', border:'1px solid rgba(79,142,247,.2)', borderRadius:7, fontSize:11 }}>
                      <div style={{ fontWeight:700, color:C.acc }}>🧪 {lab.test}</div>
                      <div style={{ color:C.mut }}>{lab.status} · {lab.urgency}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Note area */}
              <div className="cr-sc" style={{ flex:1, overflowY:'auto', padding:'13px 15px' }}>

                {/* Biodata section — always at top */}
                <BiodataCard patient={selectedPatient} />

                {/* New note editor */}
                {isNew && editingNote && (
                  <NoteEditor note={editingNote} onSave={saveNote} onClose={() => { setEditingNote(null); setIsNew(false); }} isNew />
                )}

                {loading && (
                  <div style={{ padding:'0 0 14px' }}>
                    {[1,2].map(i => <div key={i} className="cr-loading" style={{ height:60, borderRadius:12, marginBottom:10 }} />)}
                  </div>
                )}

                {!loading && notes.length===0 && !isNew && (
                  <div style={{ textAlign:'center', padding:'52px 24px', color:C.mut }}>
                    <div style={{ fontSize:52, marginBottom:12 }}>📋</div>
                    <div style={{ fontSize:15, fontWeight:700, color:C.txt, marginBottom:6 }}>No visit notes yet</div>
                    <div style={{ fontSize:13 }}>Start a new visit to begin this patient's longitudinal clinical record.</div>
                    <button onClick={startNew} style={{ ...BTN, marginTop:18 }}>✚ Start Clinical Record</button>
                  </div>
                )}

                {!loading && notes.map(note => (
                  editingNote?.id===note.id
                    ? <NoteEditor key={note.id} note={editingNote!} onSave={saveNote} onClose={() => setEditingNote(null)} />
                    : <NoteCard key={note.id} note={note} canEdit={note.doctorId===effectiveDoctorId} onEdit={() => setEditingNote(note)} onPrint={() => setShowPrint(true)} />
                ))}
              </div>
            </>}
          </div>
        </div>
      )}

      {/* ── APPOINTMENT LOG ──────────────────────────────────────────────────── */}
      {view==='log' && (
        <div className="cr-sc" style={{ flex:1, overflowY:'auto', padding:'13px 15px' }}>
          <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
            <input value={apptSearch} onChange={e => setApptSearch(e.target.value)} placeholder="Search patient, specialty…" style={{ ...INP, flex:1, minWidth:200 }} />
            <div style={{ display:'flex', gap:6 }}>
              {(['all','completed','cancelled'] as const).map(f => (
                <button key={f} onClick={() => setApptFilter(f)} style={{
                  padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:700,
                  border:`1.5px solid`, cursor:'pointer', fontFamily:'var(--cr-sans)',
                  borderColor: apptFilter===f ? C.acc : C.bdr,
                  background: apptFilter===f ? C.acc : 'transparent',
                  color: apptFilter===f ? '#fff' : C.mut,
                }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
              ))}
            </div>
            <span style={{ fontSize:12, color:C.mut, alignSelf:'center' }}>{filteredAppts.length} records</span>
          </div>

          {filteredAppts.length===0
            ? <div style={{ textAlign:'center', padding:48, fontSize:13, color:C.mut }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🗂️</div>No records found.
              </div>
            : filteredAppts.map(appt => {
                const sc = scCfg[appt.status] || scCfg.booked;
                return (
                  <div key={appt.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', background:C.surf, border:`1px solid ${C.bdr}`, borderRadius:11, marginBottom:8 }} className="cr-hover-row cr-hover-card">
                    <div style={{ width:38, height:38, borderRadius:9, background:appt.status==='completed'?'rgba(16,217,160,.12)':'rgba(240,82,82,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>
                      {appt.status==='completed'?'✅':'❌'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C.txt }}>{appt.patientName||'Patient'}</div>
                      <div style={{ fontSize:11, color:C.mut }}>{appt.specialty||'Consultation'} · {fmtDate(appt.date)}</div>
                      {appt.patientNotes && <div style={{ fontSize:11, color:C.mut, fontStyle:'italic', marginTop:2 }}>"{appt.patientNotes}"</div>}
                    </div>
                    <div style={{ display:'flex', gap:7, alignItems:'center', flexShrink:0 }}>
                      {appt.amount !== undefined && appt.amount>0 && (
                        <span style={{ fontSize:12, fontWeight:700, color:C.grn, fontFamily:'var(--cr-mono)' }}>KES {appt.amount.toLocaleString()}</span>
                      )}
                      <span className="cr-tag" style={{ background:sc.bg, color:sc.color }}>{sc.label}</span>
                      {appt.status==='completed' && appt.patientId && (
                        <button onClick={() => { setSelectedPid(appt.patientId!); setView('clinical'); }} style={{ ...BTN2, padding:'4px 10px', fontSize:11 }}>📋 Records</button>
                      )}
                    </div>
                  </div>
                );
              })
          }
        </div>
      )}

      {/* Print modal */}
      {showPrint && selectedPatient && (
        <PrintModal patient={selectedPatient} doctor={doctor} notes={notes} onClose={() => setShowPrint(false)} />
      )}
    </div>
  );
}