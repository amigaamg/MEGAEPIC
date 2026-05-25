'use client';
// ═══════════════════════════════════════════════════════════════════════════════
// PatientClinicalRecord.tsx
// Full longitudinal clinical record — doctor view
// One continuous living document per patient, all visits, real-time, printable
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc,
  serverTimestamp, orderBy, getDoc, setDoc, deleteDoc, getDocs,
} from 'firebase/firestore';
import { ref as sRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface VitalSigns {
  bp?: string;          // e.g. "120/80"
  hr?: number;          // bpm
  rr?: number;          // breaths/min
  temp?: number;        // °C
  spo2?: number;        // %
  weight?: number;      // kg
  height?: number;      // cm
  bmi?: number;
  pain?: number;        // 0–10
  fbs?: number;         // fasting blood sugar mg/dL
  rbs?: number;         // random blood sugar
}

export interface PhysicalExamination {
  general?: string;
  heent?: string;
  cvs?: string;
  respiratory?: string;
  abdomen?: string;
  cns?: string;
  msk?: string;
  skin?: string;
  other?: string;
}

export interface Diagnosis {
  id: string;
  code?: string;        // ICD-10
  description: string;
  type: 'primary' | 'secondary' | 'differential';
  status: 'active' | 'resolved' | 'chronic';
  onset?: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions?: string;
  status: 'active' | 'completed' | 'stopped' | 'pending_refill';
  startDate: string;
  endDate?: string;
  adherence?: 'good' | 'partial' | 'poor' | 'unknown';
  refillCount?: number;
  dispensed?: boolean;
}

export interface LabOrder {
  id: string;
  test: string;
  category: 'haematology' | 'biochemistry' | 'microbiology' | 'serology' | 'urinalysis' | 'imaging' | 'pathology' | 'other';
  urgency: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'collected' | 'processing' | 'resulted' | 'critical';
  orderedAt: any;
  resultAt?: any;
  result?: string;
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  flag?: 'normal' | 'high' | 'low' | 'critical';
  notes?: string;
  attachmentUrl?: string;
}

export interface ImagingOrder {
  id: string;
  study: string;           // e.g. "Chest X-Ray PA"
  modality: 'XR' | 'CT' | 'MRI' | 'USS' | 'Echo' | 'ECG' | 'EEG' | 'Other';
  bodyPart: string;
  urgency: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'scheduled' | 'performed' | 'reported' | 'reviewed';
  orderedAt: any;
  reportAt?: any;
  report?: string;
  impression?: string;
  attachmentUrl?: string;
  radiologistName?: string;
}

export interface Referral {
  id: string;
  toSpecialty: string;
  toDoctorName?: string;
  toFacility?: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  reason: string;
  notes?: string;
  status: 'pending' | 'sent' | 'accepted' | 'completed' | 'declined';
  createdAt: any;
  responseAt?: any;
  response?: string;
}

export interface Alert {
  id: string;
  type: 'allergy' | 'drug_interaction' | 'critical_value' | 'missed_dose' | 'follow_up_due' | 'lab_critical' | 'bp_alert' | 'sugar_alert' | 'custom';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: any;
  acknowledged: boolean;
  acknowledgedAt?: any;
}

export interface FollowUp {
  id: string;
  date: string;
  time?: string;
  type: 'in_person' | 'teleconsult' | 'phone' | 'message';
  reason: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  reminderSent?: boolean;
}

export interface ProgressNote {
  id: string;
  visitId: string;
  visitDate: any;
  visitType: 'new_patient' | 'follow_up' | 'emergency' | 'teleconsult' | 'review';
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;

  // SOAP / structured note
  chiefComplaint: string;
  hpi: string;                     // History of Present Illness
  ros?: string;                    // Review of Systems
  pmh?: string;                    // Past Medical History
  psh?: string;                    // Past Surgical History
  fh?: string;                     // Family History
  sh?: string;                     // Social History
  allergies?: string;
  currentMeds?: string;

  vitals?: VitalSigns;
  examination?: PhysicalExamination;
  investigations?: string;         // Summary

  diagnoses: Diagnosis[];
  plan?: string;                   // General plan narrative
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  imagingOrders: ImagingOrder[];
  referrals: Referral[];
  followUps: FollowUp[];
  alerts: Alert[];

  // Monitoring
  progressAssessment?: string;     // How patient is progressing
  educationGiven?: string;
  patientUnderstanding?: 'good' | 'fair' | 'poor';

  isLocked: boolean;               // locked after 24h
  lastEditedAt?: any;
  createdAt: any;
}

export interface PatientProfile {
  uid: string;
  name: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  nhif?: string;
  nationalId?: string;
  bloodGroup?: string;
  knownAllergies?: string;
  chronicConditions?: string;
  emergencyContact?: string;
  avatar?: string;
}

export interface DoctorProfile {
  uid: string;
  name: string;
  specialty: string;
  licenseNo?: string;
  facility?: string;
  avatar?: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtDateTime = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const ageFromDob = (dob?: string) => {
  if (!dob) return '—';
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600000)) + 'y';
};
const bmi = (w?: number, h?: number) => {
  if (!w || !h) return undefined;
  return +(w / ((h / 100) ** 2)).toFixed(1);
};
const bmiCategory = (b?: number) => {
  if (!b) return '';
  if (b < 18.5) return 'Underweight';
  if (b < 25) return 'Normal';
  if (b < 30) return 'Overweight';
  return 'Obese';
};

// Alert logic rules
const evaluateAlerts = (note: Partial<ProgressNote>): Alert[] => {
  const alerts: Alert[] = [];
  const v = note.vitals;
  if (!v) return alerts;

  if (v.bp) {
    const [sys, dia] = v.bp.split('/').map(Number);
    if (sys >= 180 || dia >= 120)
      alerts.push({ id: 'bp_hyper_crisis', type: 'bp_alert', severity: 'critical', message: `Hypertensive crisis: BP ${v.bp} mmHg — immediate intervention required`, triggeredAt: new Date(), acknowledged: false });
    else if (sys >= 140 || dia >= 90)
      alerts.push({ id: 'bp_hyper', type: 'bp_alert', severity: 'warning', message: `Elevated BP: ${v.bp} mmHg — consider antihypertensive management`, triggeredAt: new Date(), acknowledged: false });
    else if (sys < 90 || dia < 60)
      alerts.push({ id: 'bp_hypo', type: 'bp_alert', severity: 'warning', message: `Low BP: ${v.bp} mmHg — assess for hypotension`, triggeredAt: new Date(), acknowledged: false });
  }
  if (v.spo2 !== undefined && v.spo2 < 92)
    alerts.push({ id: 'spo2_low', type: 'critical_value', severity: 'critical', message: `SpO2 ${v.spo2}% — administer supplemental oxygen immediately`, triggeredAt: new Date(), acknowledged: false });
  if (v.fbs !== undefined && v.fbs >= 7.0)
    alerts.push({ id: 'fbs_high', type: 'sugar_alert', severity: 'warning', message: `Fasting glucose ${v.fbs} mmol/L — above normal range`, triggeredAt: new Date(), acknowledged: false });
  if (v.rbs !== undefined && v.rbs >= 11.1)
    alerts.push({ id: 'rbs_high', type: 'sugar_alert', severity: 'warning', message: `Random glucose ${v.rbs} mmol/L — possible hyperglycaemia`, triggeredAt: new Date(), acknowledged: false });
  if (v.hr !== undefined && (v.hr > 100 || v.hr < 50))
    alerts.push({ id: 'hr_abnormal', type: 'critical_value', severity: v.hr > 150 || v.hr < 40 ? 'critical' : 'warning', message: `Heart rate ${v.hr} bpm — ${v.hr > 100 ? 'tachycardia' : 'bradycardia'} detected`, triggeredAt: new Date(), acknowledged: false });
  if (v.temp !== undefined && v.temp >= 38.5)
    alerts.push({ id: 'fever', type: 'critical_value', severity: v.temp >= 40 ? 'critical' : 'warning', message: `Temperature ${v.temp}°C — fever present`, triggeredAt: new Date(), acknowledged: false });
  if (v.pain !== undefined && v.pain >= 7)
    alerts.push({ id: 'pain_severe', type: 'custom', severity: 'warning', message: `Severe pain: ${v.pain}/10 — pain management review required`, triggeredAt: new Date(), acknowledged: false });

  return alerts;
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

// Editable field
function EF({ label, value, onChange, multiline = false, placeholder = '', type = 'text', disabled = false }: {
  label: string; value?: string | number; onChange?: (v: string) => void;
  multiline?: boolean; placeholder?: string; type?: string; disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(String(value ?? ''));
  useEffect(() => setLocal(String(value ?? '')), [value]);

  if (disabled) return (
    <div style={EFstyle.wrap}>
      <div style={EFstyle.label}>{label}</div>
      <div style={{ ...EFstyle.val, color: local ? 'var(--text)' : 'var(--muted)' }}>{local || '—'}</div>
    </div>
  );

  return (
    <div style={EFstyle.wrap}>
      <div style={EFstyle.label}>{label}</div>
      {editing ? (
        multiline ? (
          <textarea autoFocus value={local} onChange={e => setLocal(e.target.value)}
            onBlur={() => { setEditing(false); onChange?.(local); }}
            placeholder={placeholder}
            style={{ ...EFstyle.input, minHeight: 72, resize: 'vertical' }} />
        ) : (
          <input autoFocus type={type} value={local} onChange={e => setLocal(e.target.value)}
            onBlur={() => { setEditing(false); onChange?.(local); }}
            onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); onChange?.(local); } }}
            placeholder={placeholder}
            style={EFstyle.input} />
        )
      ) : (
        <div style={{ ...EFstyle.val, cursor: 'pointer', color: local ? 'var(--text)' : 'var(--muted)' }}
          onClick={() => setEditing(true)} title="Click to edit">
          {local || <span style={{ fontStyle: 'italic' }}>{placeholder || 'Click to add…'}</span>}
          <span style={EFstyle.pen}>✎</span>
        </div>
      )}
    </div>
  );
}
const EFstyle: Record<string, React.CSSProperties> = {
  wrap: { marginBottom: 10 },
  label: { fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 3 },
  val: { fontSize: 13, lineHeight: 1.55, borderBottom: '1px dashed var(--border)', paddingBottom: 2, minHeight: 22, position: 'relative' },
  input: { width: '100%', fontSize: 13, padding: '5px 8px', borderRadius: 6, border: '1.5px solid var(--accent)', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', lineHeight: 1.55, outline: 'none' },
  pen: { fontSize: 11, color: 'var(--accent)', marginLeft: 4, opacity: .6 },
};

// Section wrapper
function Section({ title, icon, children, accent = 'var(--accent)', collapsible = true }: {
  title: string; icon: string; children: React.ReactNode; accent?: string; collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 18, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--surface2)', borderBottom: open ? '1px solid var(--border)' : 'none', cursor: collapsible ? 'pointer' : 'default' }}
        onClick={() => collapsible && setOpen(o => !o)}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '.8px', flex: 1 }}>{title}</span>
        {collapsible && <span style={{ fontSize: 11, color: 'var(--muted)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s' }}>▼</span>}
      </div>
      {open && <div style={{ padding: '12px 14px' }}>{children}</div>}
    </div>
  );
}

// Vital card
function VitalCard({ label, value, unit, flag, icon }: { label: string; value?: string | number; unit?: string; flag?: string; icon: string }) {
  const col = flag === 'critical' ? '#ef4444' : flag === 'high' ? '#f97316' : flag === 'low' ? '#3b82f6' : 'var(--accent)';
  return (
    <div style={{ background: 'var(--surface2)', border: `1.5px solid ${col}33`, borderRadius: 9, padding: '9px 12px', minWidth: 90, textAlign: 'center' }}>
      <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: col, fontFamily: 'var(--mono)', lineHeight: 1 }}>{value ?? '—'}</div>
      {unit && <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>{unit}</div>}
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// Alert banner
function AlertBanner({ alert, onAck }: { alert: Alert; onAck: () => void }) {
  const col = alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6';
  const bg = alert.severity === 'critical' ? 'rgba(239,68,68,.08)' : alert.severity === 'warning' ? 'rgba(245,158,11,.08)' : 'rgba(59,130,246,.08)';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 13px', background: bg, border: `1px solid ${col}33`, borderRadius: 8, marginBottom: 6, opacity: alert.acknowledged ? .45 : 1 }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: col }}>{alert.type.replace(/_/g, ' ').toUpperCase()}</div>
        <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 1 }}>{alert.message}</div>
      </div>
      {!alert.acknowledged && (
        <button onClick={onAck} style={{ fontSize: 10, fontWeight: 700, color: col, background: `${col}18`, border: `1px solid ${col}33`, borderRadius: 5, padding: '3px 8px', cursor: 'pointer', flexShrink: 0 }}>ACK</button>
      )}
    </div>
  );
}

// ─── VISIT NOTE EDITOR ────────────────────────────────────────────────────────

function VisitNoteEditor({ note, patientId, doctorId, onSave, onClose, isNew = false }: {
  note: Partial<ProgressNote>; patientId: string; doctorId: string;
  onSave: (n: Partial<ProgressNote>) => void; onClose: () => void; isNew?: boolean;
}) {
  const [data, setData] = useState<Partial<ProgressNote>>(note);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'soap' | 'vitals' | 'exam' | 'dx' | 'rx' | 'labs' | 'imaging' | 'plan'>('soap');
  const [alerts, setAlerts] = useState<Alert[]>(note.alerts || []);

  const upd = (k: keyof ProgressNote, v: any) => setData(d => ({ ...d, [k]: v }));
  const updV = (k: keyof VitalSigns, v: any) => {
    const newVitals = { ...(data.vitals || {}), [k]: v === '' ? undefined : (isNaN(Number(v)) ? v : Number(v)) };
    if (k === 'weight' || k === 'height') {
      const b = bmi(newVitals.weight, newVitals.height);
      if (b) newVitals.bmi = b;
    }
    setData(d => ({ ...d, vitals: newVitals }));
    setAlerts(evaluateAlerts({ ...data, vitals: newVitals }));
  };
  const updE = (k: keyof PhysicalExamination, v: string) =>
    setData(d => ({ ...d, examination: { ...(d.examination || {}), [k]: v } }));

  const addDx = () => {
    const dx: Diagnosis = { id: Date.now().toString(), description: '', type: 'primary', status: 'active' };
    upd('diagnoses', [...(data.diagnoses || []), dx]);
  };
  const updDx = (id: string, k: keyof Diagnosis, v: any) => upd('diagnoses', (data.diagnoses || []).map(d => d.id === id ? { ...d, [k]: v } : d));
  const removeDx = (id: string) => upd('diagnoses', (data.diagnoses || []).filter(d => d.id !== id));

  const addRx = () => {
    const rx: Prescription = { id: Date.now().toString(), medication: '', dosage: '', frequency: '', duration: '', route: 'oral', status: 'active', startDate: new Date().toISOString().slice(0, 10) };
    upd('prescriptions', [...(data.prescriptions || []), rx]);
  };
  const updRx = (id: string, k: keyof Prescription, v: any) => upd('prescriptions', (data.prescriptions || []).map(r => r.id === id ? { ...r, [k]: v } : r));
  const removeRx = (id: string) => upd('prescriptions', (data.prescriptions || []).filter(r => r.id !== id));

  const addLab = () => {
    const lab: LabOrder = { id: Date.now().toString(), test: '', category: 'haematology', urgency: 'routine', status: 'ordered', orderedAt: new Date() };
    upd('labOrders', [...(data.labOrders || []), lab]);
  };
  const updLab = (id: string, k: keyof LabOrder, v: any) => upd('labOrders', (data.labOrders || []).map(l => l.id === id ? { ...l, [k]: v } : l));
  const removeLab = (id: string) => upd('labOrders', (data.labOrders || []).filter(l => l.id !== id));

  const addImaging = () => {
    const img: ImagingOrder = { id: Date.now().toString(), study: '', modality: 'XR', bodyPart: '', urgency: 'routine', status: 'ordered', orderedAt: new Date() };
    upd('imagingOrders', [...(data.imagingOrders || []), img]);
  };
  const updImg = (id: string, k: keyof ImagingOrder, v: any) => upd('imagingOrders', (data.imagingOrders || []).map(i => i.id === id ? { ...i, [k]: v } : i));
  const removeImg = (id: string) => upd('imagingOrders', (data.imagingOrders || []).filter(i => i.id !== id));

  const addReferral = () => {
    const ref: Referral = { id: Date.now().toString(), toSpecialty: '', urgency: 'routine', reason: '', status: 'pending', createdAt: new Date() };
    upd('referrals', [...(data.referrals || []), ref]);
  };
  const updRef = (id: string, k: keyof Referral, v: any) => upd('referrals', (data.referrals || []).map(r => r.id === id ? { ...r, [k]: v } : r));
  const removeRef = (id: string) => upd('referrals', (data.referrals || []).filter(r => r.id !== id));

  const addFU = () => {
    const fu: FollowUp = { id: Date.now().toString(), date: '', type: 'in_person', reason: '', status: 'scheduled' };
    upd('followUps', [...(data.followUps || []), fu]);
  };
  const updFU = (id: string, k: keyof FollowUp, v: any) => upd('followUps', (data.followUps || []).map(f => f.id === id ? { ...f, [k]: v } : f));
  const removeFU = (id: string) => upd('followUps', (data.followUps || []).filter(f => f.id !== id));

  const save = async () => {
    setSaving(true);
    const finalData = { ...data, alerts: [...alerts, ...(data.alerts || []).filter(a => !alerts.find(al => al.id === a.id))], lastEditedAt: serverTimestamp() };
    await onSave(finalData);
    setSaving(false);
  };

  const TABS = [
    { id: 'soap', label: 'History', icon: '📝' },
    { id: 'vitals', label: 'Vitals', icon: '💊' },
    { id: 'exam', label: 'Exam', icon: '🩺' },
    { id: 'dx', label: 'Diagnosis', icon: '🎯' },
    { id: 'rx', label: 'Rx', icon: '💊' },
    { id: 'labs', label: 'Labs', icon: '🧪' },
    { id: 'imaging', label: 'Imaging', icon: '🩻' },
    { id: 'plan', label: 'Plan', icon: '📋' },
  ] as const;

  return (
    <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* Editor header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 18 }}>📋</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{isNew ? 'New Visit Note' : 'Edit Visit Note'}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtDateTime(data.visitDate || new Date())}</div>
        </div>
        <select value={data.visitType || 'follow_up'} onChange={e => upd('visitType', e.target.value)}
          style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit' }}>
          <option value="new_patient">New Patient</option>
          <option value="follow_up">Follow-Up</option>
          <option value="emergency">Emergency</option>
          <option value="teleconsult">Teleconsult</option>
          <option value="review">Review</option>
        </select>
        <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? '⟳ Saving…' : '💾 Save'}</button>
        <button onClick={onClose} style={btnSecondary}>✕</button>
      </div>

      {/* Auto alerts from vitals */}
      {alerts.length > 0 && (
        <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,.04)', borderBottom: '1px solid rgba(239,68,68,.12)' }}>
          {alerts.map(a => <AlertBanner key={a.id} alert={a} onAck={() => setAlerts(al => al.map(x => x.id === a.id ? { ...x, acknowledged: true } : x))} />)}
        </div>
      )}

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ padding: '9px 14px', background: 'none', border: 'none', borderBottom: activeTab === t.id ? '2.5px solid var(--accent)' : '2.5px solid transparent', cursor: 'pointer', fontSize: 12, fontWeight: activeTab === t.id ? 800 : 500, color: activeTab === t.id ? 'var(--accent)' : 'var(--muted)', whiteSpace: 'nowrap', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, maxHeight: '60vh', overflowY: 'auto' }}>
        {/* SOAP History */}
        {activeTab === 'soap' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <EF label="Chief Complaint (C/C)" value={data.chiefComplaint} onChange={v => upd('chiefComplaint', v)} placeholder="Patient's primary complaint…" multiline />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <EF label="History of Present Illness (HPI)" value={data.hpi} onChange={v => upd('hpi', v)} placeholder="Onset, location, duration, character, aggravating/relieving factors, radiation, severity, timing…" multiline />
            </div>
            <EF label="Review of Systems (ROS)" value={data.ros} onChange={v => upd('ros', v)} placeholder="Systemic review…" multiline />
            <EF label="Past Medical History (PMH)" value={data.pmh} onChange={v => upd('pmh', v)} placeholder="Known conditions, hospitalisations…" multiline />
            <EF label="Past Surgical History (PSH)" value={data.psh} onChange={v => upd('psh', v)} placeholder="Previous surgeries, procedures…" multiline />
            <EF label="Family History (FH)" value={data.fh} onChange={v => upd('fh', v)} placeholder="Relevant family conditions…" multiline />
            <EF label="Social History (SH)" value={data.sh} onChange={v => upd('sh', v)} placeholder="Smoking, alcohol, occupation, lifestyle…" multiline />
            <EF label="Allergies" value={data.allergies} onChange={v => upd('allergies', v)} placeholder="Drug/food allergies and reactions…" multiline />
            <div style={{ gridColumn: '1/-1' }}>
              <EF label="Current Medications" value={data.currentMeds} onChange={v => upd('currentMeds', v)} placeholder="List current medications with doses…" multiline />
            </div>
          </div>
        )}

        {/* Vitals */}
        {activeTab === 'vitals' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 10, marginBottom: 16 }}>
              <EF label="Blood Pressure (mmHg)" value={data.vitals?.bp} onChange={v => updV('bp', v)} placeholder="120/80" />
              <EF label="Heart Rate (bpm)" value={data.vitals?.hr} onChange={v => updV('hr', v)} type="number" />
              <EF label="Respiratory Rate" value={data.vitals?.rr} onChange={v => updV('rr', v)} type="number" />
              <EF label="Temperature (°C)" value={data.vitals?.temp} onChange={v => updV('temp', v)} type="number" />
              <EF label="SpO2 (%)" value={data.vitals?.spo2} onChange={v => updV('spo2', v)} type="number" />
              <EF label="Weight (kg)" value={data.vitals?.weight} onChange={v => updV('weight', v)} type="number" />
              <EF label="Height (cm)" value={data.vitals?.height} onChange={v => updV('height', v)} type="number" />
              <EF label="BMI" value={data.vitals?.bmi} disabled />
              <EF label="Pain Score (0–10)" value={data.vitals?.pain} onChange={v => updV('pain', v)} type="number" />
              <EF label="FBS (mmol/L)" value={data.vitals?.fbs} onChange={v => updV('fbs', v)} type="number" />
              <EF label="RBS (mmol/L)" value={data.vitals?.rbs} onChange={v => updV('rbs', v)} type="number" />
            </div>
            {data.vitals?.bmi && (
              <div style={{ fontSize: 12, color: 'var(--muted)', padding: '6px 10px', background: 'var(--surface2)', borderRadius: 6 }}>
                BMI {data.vitals.bmi} — {bmiCategory(data.vitals.bmi)}
              </div>
            )}
          </div>
        )}

        {/* Examination */}
        {activeTab === 'exam' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <EF label="General Appearance" value={data.examination?.general} onChange={v => updE('general', v)} placeholder="Alert, oriented, well/ill-appearing…" multiline />
            </div>
            <EF label="HEENT" value={data.examination?.heent} onChange={v => updE('heent', v)} placeholder="Head, eyes, ears, nose, throat…" multiline />
            <EF label="CVS" value={data.examination?.cvs} onChange={v => updE('cvs', v)} placeholder="Heart sounds, murmurs, JVP…" multiline />
            <EF label="Respiratory" value={data.examination?.respiratory} onChange={v => updE('respiratory', v)} placeholder="Air entry, breath sounds, wheeze…" multiline />
            <EF label="Abdomen" value={data.examination?.abdomen} onChange={v => updE('abdomen', v)} placeholder="Soft, tender, organomegaly…" multiline />
            <EF label="CNS / Neuro" value={data.examination?.cns} onChange={v => updE('cns', v)} placeholder="GCS, cranial nerves, power, reflexes…" multiline />
            <EF label="MSK" value={data.examination?.msk} onChange={v => updE('msk', v)} placeholder="Joints, range of motion…" multiline />
            <EF label="Skin" value={data.examination?.skin} onChange={v => updE('skin', v)} placeholder="Rash, lesions, turgor…" multiline />
            <div style={{ gridColumn: '1/-1' }}>
              <EF label="Other / Special Findings" value={data.examination?.other} onChange={v => updE('other', v)} placeholder="Any other relevant findings…" multiline />
            </div>
          </div>
        )}

        {/* Diagnosis */}
        {activeTab === 'dx' && (
          <div>
            {(data.diagnoses || []).map((dx, i) => (
              <div key={dx.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, background: 'var(--surface2)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>#{i + 1}</span>
                  <select value={dx.type} onChange={e => updDx(dx.id, 'type', e.target.value)} style={selStyle}>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="differential">Differential</option>
                  </select>
                  <select value={dx.status} onChange={e => updDx(dx.id, 'status', e.target.value)} style={selStyle}>
                    <option value="active">Active</option>
                    <option value="chronic">Chronic</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <input value={dx.code || ''} onChange={e => updDx(dx.id, 'code', e.target.value)} placeholder="ICD-10" style={{ ...selStyle, width: 80 }} />
                  <button onClick={() => removeDx(dx.id)} style={{ marginLeft: 'auto', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🗑</button>
                </div>
                <input value={dx.description} onChange={e => updDx(dx.id, 'description', e.target.value)} placeholder="Diagnosis description…" style={{ ...selStyle, width: '100%', fontSize: 13, padding: '6px 10px' }} />
                <input value={dx.onset || ''} onChange={e => updDx(dx.id, 'onset', e.target.value)} placeholder="Onset date (e.g. 3 months ago)" style={{ ...selStyle, width: '100%', marginTop: 6, fontSize: 12 }} />
              </div>
            ))}
            <button onClick={addDx} style={btnAdd}>+ Add Diagnosis</button>
            <div style={{ marginTop: 14 }}>
              <EF label="Investigation Summary / Clinical Impression" value={data.investigations} onChange={v => upd('investigations', v)} placeholder="Summary of diagnostic findings supporting the diagnosis…" multiline />
            </div>
          </div>
        )}

        {/* Prescriptions */}
        {activeTab === 'rx' && (
          <div>
            {(data.prescriptions || []).map((rx, i) => (
              <div key={rx.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, background: 'var(--surface2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>💊</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>Rx #{i + 1}</span>
                  <select value={rx.status} onChange={e => updRx(rx.id, 'status', e.target.value)} style={selStyle}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="stopped">Stopped</option>
                    <option value="pending_refill">Pending Refill</option>
                  </select>
                  <select value={rx.adherence || 'unknown'} onChange={e => updRx(rx.id, 'adherence', e.target.value)} style={{ ...selStyle, marginLeft: 'auto' }}>
                    <option value="unknown">Adherence: Unknown</option>
                    <option value="good">Good</option>
                    <option value="partial">Partial</option>
                    <option value="poor">Poor</option>
                  </select>
                  <button onClick={() => removeRx(rx.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🗑</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 6 }}>
                  <input value={rx.medication} onChange={e => updRx(rx.id, 'medication', e.target.value)} placeholder="Medication name" style={selStyle} />
                  <input value={rx.dosage} onChange={e => updRx(rx.id, 'dosage', e.target.value)} placeholder="Dose" style={selStyle} />
                  <input value={rx.frequency} onChange={e => updRx(rx.id, 'frequency', e.target.value)} placeholder="Frequency" style={selStyle} />
                  <input value={rx.duration} onChange={e => updRx(rx.id, 'duration', e.target.value)} placeholder="Duration" style={selStyle} />
                  <select value={rx.route} onChange={e => updRx(rx.id, 'route', e.target.value)} style={selStyle}>
                    <option value="oral">PO</option>
                    <option value="iv">IV</option>
                    <option value="im">IM</option>
                    <option value="sc">SC</option>
                    <option value="topical">Topical</option>
                    <option value="inhaled">Inhaled</option>
                    <option value="sublingual">SL</option>
                    <option value="rectal">PR</option>
                  </select>
                </div>
                <input value={rx.instructions || ''} onChange={e => updRx(rx.id, 'instructions', e.target.value)} placeholder="Special instructions (e.g. take with food, avoid sun)" style={{ ...selStyle, width: '100%', marginTop: 6 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
                  <div><label style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>START DATE</label>
                    <input type="date" value={rx.startDate} onChange={e => updRx(rx.id, 'startDate', e.target.value)} style={{ ...selStyle, width: '100%' }} /></div>
                  <div><label style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>END DATE</label>
                    <input type="date" value={rx.endDate || ''} onChange={e => updRx(rx.id, 'endDate', e.target.value)} style={{ ...selStyle, width: '100%' }} /></div>
                </div>
              </div>
            ))}
            <button onClick={addRx} style={btnAdd}>+ Add Prescription</button>
          </div>
        )}

        {/* Labs */}
        {activeTab === 'labs' && (
          <div>
            {(data.labOrders || []).map((lab, i) => (
              <div key={lab.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, background: 'var(--surface2)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>🧪 #{i + 1}</span>
                  <select value={lab.category} onChange={e => updLab(lab.id, 'category', e.target.value)} style={selStyle}>
                    <option value="haematology">Haematology</option>
                    <option value="biochemistry">Biochemistry</option>
                    <option value="microbiology">Microbiology</option>
                    <option value="serology">Serology</option>
                    <option value="urinalysis">Urinalysis</option>
                    <option value="pathology">Pathology</option>
                    <option value="other">Other</option>
                  </select>
                  <select value={lab.urgency} onChange={e => updLab(lab.id, 'urgency', e.target.value)} style={selStyle}>
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                  </select>
                  <select value={lab.status} onChange={e => updLab(lab.id, 'status', e.target.value)} style={selStyle}>
                    <option value="ordered">Ordered</option>
                    <option value="collected">Collected</option>
                    <option value="processing">Processing</option>
                    <option value="resulted">Resulted</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button onClick={() => removeLab(lab.id)} style={{ marginLeft: 'auto', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🗑</button>
                </div>
                <input value={lab.test} onChange={e => updLab(lab.id, 'test', e.target.value)} placeholder="Test name (e.g. FBC, U/E/Cr, LFTs, HbA1c…)" style={{ ...selStyle, width: '100%', marginBottom: 6 }} />
                {(lab.status === 'resulted' || lab.status === 'critical') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 6, marginTop: 6 }}>
                    <input value={lab.result || ''} onChange={e => updLab(lab.id, 'result', e.target.value)} placeholder="Result narrative" style={selStyle} />
                    <input value={lab.resultValue || ''} onChange={e => updLab(lab.id, 'resultValue', e.target.value)} placeholder="Value" style={selStyle} />
                    <input value={lab.unit || ''} onChange={e => updLab(lab.id, 'unit', e.target.value)} placeholder="Unit" style={selStyle} />
                    <select value={lab.flag || 'normal'} onChange={e => updLab(lab.id, 'flag', e.target.value)} style={selStyle}>
                      <option value="normal">Normal</option>
                      <option value="high">High ↑</option>
                      <option value="low">Low ↓</option>
                      <option value="critical">Critical ‼</option>
                    </select>
                  </div>
                )}
                <input value={lab.referenceRange || ''} onChange={e => updLab(lab.id, 'referenceRange', e.target.value)} placeholder="Reference range" style={{ ...selStyle, width: '100%', marginTop: 6 }} />
                <textarea value={lab.notes || ''} onChange={e => updLab(lab.id, 'notes', e.target.value)} placeholder="Notes / clinical interpretation…" rows={2} style={{ ...selStyle, width: '100%', marginTop: 6, resize: 'vertical' }} />
              </div>
            ))}
            <button onClick={addLab} style={btnAdd}>+ Order Lab Test</button>
          </div>
        )}

        {/* Imaging */}
        {activeTab === 'imaging' && (
          <div>
            {(data.imagingOrders || []).map((img, i) => (
              <div key={img.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, background: 'var(--surface2)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>🩻 #{i + 1}</span>
                  <select value={img.modality} onChange={e => updImg(img.id, 'modality', e.target.value)} style={selStyle}>
                    {['XR', 'CT', 'MRI', 'USS', 'Echo', 'ECG', 'EEG', 'Other'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={img.urgency} onChange={e => updImg(img.id, 'urgency', e.target.value)} style={selStyle}>
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                  </select>
                  <select value={img.status} onChange={e => updImg(img.id, 'status', e.target.value)} style={selStyle}>
                    <option value="ordered">Ordered</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="performed">Performed</option>
                    <option value="reported">Reported</option>
                    <option value="reviewed">Reviewed</option>
                  </select>
                  <button onClick={() => removeImg(img.id)} style={{ marginLeft: 'auto', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🗑</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 6 }}>
                  <input value={img.study} onChange={e => updImg(img.id, 'study', e.target.value)} placeholder="Study description (e.g. Chest X-Ray PA view)" style={selStyle} />
                  <input value={img.bodyPart} onChange={e => updImg(img.id, 'bodyPart', e.target.value)} placeholder="Body part" style={selStyle} />
                </div>
                {(img.status === 'reported' || img.status === 'reviewed') && (
                  <>
                    <textarea value={img.report || ''} onChange={e => updImg(img.id, 'report', e.target.value)} placeholder="Radiology report…" rows={3} style={{ ...selStyle, width: '100%', marginTop: 6, resize: 'vertical' }} />
                    <textarea value={img.impression || ''} onChange={e => updImg(img.id, 'impression', e.target.value)} placeholder="Impression / conclusion…" rows={2} style={{ ...selStyle, width: '100%', marginTop: 6, resize: 'vertical' }} />
                    <input value={img.radiologistName || ''} onChange={e => updImg(img.id, 'radiologistName', e.target.value)} placeholder="Radiologist name" style={{ ...selStyle, width: '100%', marginTop: 6 }} />
                  </>
                )}
              </div>
            ))}
            <button onClick={addImaging} style={btnAdd}>+ Order Imaging</button>
          </div>
        )}

        {/* Plan */}
        {activeTab === 'plan' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <EF label="Management Plan" value={data.plan} onChange={v => upd('plan', v)} placeholder="Overall management plan, treatment goals, monitoring strategy…" multiline />
              <EF label="Progress Assessment" value={data.progressAssessment} onChange={v => upd('progressAssessment', v)} placeholder="How is the patient responding to treatment?…" multiline />
              <EF label="Patient Education Given" value={data.educationGiven} onChange={v => upd('educationGiven', v)} placeholder="What was explained to the patient…" multiline />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Referrals</div>
              {(data.referrals || []).map((ref, i) => (
                <div key={ref.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, background: 'var(--surface2)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <select value={ref.urgency} onChange={e => updRef(ref.id, 'urgency', e.target.value)} style={selStyle}>
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                    <select value={ref.status} onChange={e => updRef(ref.id, 'status', e.target.value)} style={selStyle}>
                      <option value="pending">Pending</option>
                      <option value="sent">Sent</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                      <option value="declined">Declined</option>
                    </select>
                    <button onClick={() => removeRef(ref.id)} style={{ marginLeft: 'auto', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🗑</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    <input value={ref.toSpecialty} onChange={e => updRef(ref.id, 'toSpecialty', e.target.value)} placeholder="Specialty (e.g. Cardiology)" style={selStyle} />
                    <input value={ref.toDoctorName || ''} onChange={e => updRef(ref.id, 'toDoctorName', e.target.value)} placeholder="Doctor name (optional)" style={selStyle} />
                    <input value={ref.toFacility || ''} onChange={e => updRef(ref.id, 'toFacility', e.target.value)} placeholder="Facility / hospital" style={selStyle} />
                  </div>
                  <textarea value={ref.reason} onChange={e => updRef(ref.id, 'reason', e.target.value)} placeholder="Reason for referral…" rows={2} style={{ ...selStyle, width: '100%', marginTop: 6, resize: 'vertical' }} />
                  <textarea value={ref.notes || ''} onChange={e => updRef(ref.id, 'notes', e.target.value)} placeholder="Referral notes / clinical summary for recipient…" rows={2} style={{ ...selStyle, width: '100%', marginTop: 6, resize: 'vertical' }} />
                </div>
              ))}
              <button onClick={addReferral} style={btnAdd}>+ Add Referral</button>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Follow-Up Schedule</div>
              {(data.followUps || []).map((fu, i) => (
                <div key={fu.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, background: 'var(--surface2)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <select value={fu.type} onChange={e => updFU(fu.id, 'type', e.target.value)} style={selStyle}>
                      <option value="in_person">In-Person</option>
                      <option value="teleconsult">Teleconsult</option>
                      <option value="phone">Phone</option>
                      <option value="message">Message</option>
                    </select>
                    <select value={fu.status} onChange={e => updFU(fu.id, 'status', e.target.value)} style={selStyle}>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="missed">Missed</option>
                      <option value="rescheduled">Rescheduled</option>
                    </select>
                    <button onClick={() => removeFU(fu.id)} style={{ marginLeft: 'auto', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🗑</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div>
                      <label style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>DATE</label>
                      <input type="date" value={fu.date} onChange={e => updFU(fu.id, 'date', e.target.value)} style={{ ...selStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>TIME</label>
                      <input type="time" value={fu.time || ''} onChange={e => updFU(fu.id, 'time', e.target.value)} style={{ ...selStyle, width: '100%' }} />
                    </div>
                  </div>
                  <input value={fu.reason} onChange={e => updFU(fu.id, 'reason', e.target.value)} placeholder="Reason for follow-up…" style={{ ...selStyle, width: '100%', marginTop: 6 }} />
                </div>
              ))}
              <button onClick={addFU} style={btnAdd}>+ Schedule Follow-Up</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VISIT NOTE READ VIEW (collapsed/expanded) ────────────────────────────────

function VisitNoteView({ note, doctorId, onEdit, onPrint }: {
  note: ProgressNote; doctorId: string; onEdit: () => void; onPrint: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const canEdit = note.doctorId === doctorId && !note.isLocked;
  const critAlerts = (note.alerts || []).filter(a => !a.acknowledged && a.severity === 'critical');
  const warnAlerts = (note.alerts || []).filter(a => !a.acknowledged && a.severity === 'warning');

  const vt = note.visitType || 'follow_up';
  const vtConfig: Record<string, { icon: string; color: string; label: string }> = {
    new_patient: { icon: '🆕', color: '#10b981', label: 'New Patient' },
    follow_up: { icon: '🔄', color: '#3b82f6', label: 'Follow-Up' },
    emergency: { icon: '🚨', color: '#ef4444', label: 'Emergency' },
    teleconsult: { icon: '📹', color: '#8b5cf6', label: 'Teleconsult' },
    review: { icon: '📋', color: '#f59e0b', label: 'Review' },
  };
  const vc = vtConfig[vt] || vtConfig.follow_up;

  return (
    <div style={{ border: '1.5px solid var(--border)', borderLeft: `4px solid ${vc.color}`, borderRadius: 10, marginBottom: 14, overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Visit header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <span style={{ fontSize: 18 }}>{vc.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{fmtDateTime(note.visitDate)}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${vc.color}18`, color: vc.color }}>{vc.label}</span>
            {critAlerts.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(239,68,68,.12)', color: '#ef4444' }}>🚨 {critAlerts.length} Critical</span>}
            {warnAlerts.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(245,158,11,.12)', color: '#f59e0b' }}>⚠ {warnAlerts.length} Alert</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            {note.doctorName} · {note.doctorSpecialty}
            {note.chiefComplaint && ` · "${note.chiefComplaint}"`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {canEdit && <button onClick={e => { e.stopPropagation(); onEdit(); }} style={btnSm}>✎ Edit</button>}
          <button onClick={e => { e.stopPropagation(); onPrint(); }} style={btnSm}>🖨</button>
          <span style={{ fontSize: 14, color: 'var(--muted)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>
          {/* Alerts */}
          {(note.alerts || []).filter(a => !a.acknowledged).length > 0 && (
            <div style={{ padding: '10px 0 4px' }}>
              {(note.alerts || []).filter(a => !a.acknowledged).map(a => (
                <div key={a.id} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 7, marginBottom: 5, background: a.severity === 'critical' ? 'rgba(239,68,68,.08)' : 'rgba(245,158,11,.08)', color: a.severity === 'critical' ? '#ef4444' : '#f59e0b', border: `1px solid ${a.severity === 'critical' ? 'rgba(239,68,68,.2)' : 'rgba(245,158,11,.2)'}`, display: 'flex', gap: 8 }}>
                  <span>{a.severity === 'critical' ? '🚨' : '⚠️'}</span><span>{a.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Vitals strip */}
          {note.vitals && Object.keys(note.vitals).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={sectionLabel}>Vital Signs</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {note.vitals.bp && <VitalCard label="BP" value={note.vitals.bp} unit="mmHg" icon="🫀" />}
                {note.vitals.hr && <VitalCard label="HR" value={note.vitals.hr} unit="bpm" icon="💓" flag={note.vitals.hr > 100 ? 'high' : note.vitals.hr < 60 ? 'low' : undefined} />}
                {note.vitals.temp && <VitalCard label="Temp" value={note.vitals.temp} unit="°C" icon="🌡️" flag={note.vitals.temp >= 38.5 ? 'high' : undefined} />}
                {note.vitals.spo2 && <VitalCard label="SpO2" value={`${note.vitals.spo2}%`} icon="🫁" flag={note.vitals.spo2 < 92 ? 'critical' : note.vitals.spo2 < 95 ? 'low' : undefined} />}
                {note.vitals.weight && <VitalCard label="Weight" value={note.vitals.weight} unit="kg" icon="⚖️" />}
                {note.vitals.bmi && <VitalCard label="BMI" value={note.vitals.bmi} icon="📊" />}
                {note.vitals.pain !== undefined && <VitalCard label="Pain" value={`${note.vitals.pain}/10`} icon="😣" flag={note.vitals.pain >= 7 ? 'critical' : note.vitals.pain >= 4 ? 'high' : undefined} />}
                {note.vitals.fbs && <VitalCard label="FBS" value={note.vitals.fbs} unit="mmol/L" icon="🩸" flag={note.vitals.fbs >= 7 ? 'high' : undefined} />}
              </div>
            </div>
          )}

          {/* HPI */}
          {note.chiefComplaint && <div style={{ marginTop: 12 }}><div style={sectionLabel}>Chief Complaint</div><p style={noteText}>{note.chiefComplaint}</p></div>}
          {note.hpi && <div style={{ marginTop: 10 }}><div style={sectionLabel}>History of Present Illness</div><p style={noteText}>{note.hpi}</p></div>}

          {/* Examination findings */}
          {note.examination && Object.values(note.examination).some(Boolean) && (
            <div style={{ marginTop: 12 }}>
              <div style={sectionLabel}>Physical Examination</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
                {Object.entries(note.examination).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--surface2)', borderRadius: 6, padding: '6px 10px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>{k.toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: 'var(--text)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnoses */}
          {(note.diagnoses || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={sectionLabel}>Diagnoses</div>
              {note.diagnoses.map(dx => (
                <div key={dx.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5, background: dx.type === 'primary' ? 'rgba(16,185,129,.15)' : 'rgba(100,116,139,.12)', color: dx.type === 'primary' ? '#10b981' : 'var(--muted)' }}>{dx.type}</span>
                  {dx.code && <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)', padding: '2px 6px', background: 'var(--surface2)', borderRadius: 4 }}>{dx.code}</span>}
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{dx.description}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, background: dx.status === 'active' ? 'rgba(239,68,68,.1)' : 'rgba(100,116,139,.1)', color: dx.status === 'active' ? '#ef4444' : 'var(--muted)', marginLeft: 'auto', flexShrink: 0 }}>{dx.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Prescriptions */}
          {(note.prescriptions || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={sectionLabel}>Prescriptions</div>
              {note.prescriptions.map(rx => (
                <div key={rx.id} style={{ display: 'flex', gap: 10, padding: '6px 10px', background: 'var(--surface2)', borderRadius: 7, marginBottom: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 14 }}>💊</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{rx.medication}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{rx.dosage} · {rx.frequency} · {rx.duration} · {rx.route?.toUpperCase()}</div>
                    {rx.instructions && <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--muted)', marginTop: 2 }}>{rx.instructions}</div>}
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: rx.status === 'active' ? 'rgba(16,185,129,.15)' : 'rgba(100,116,139,.1)', color: rx.status === 'active' ? '#10b981' : 'var(--muted)' }}>{rx.status}</span>
                  {rx.adherence && rx.adherence !== 'unknown' && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: rx.adherence === 'good' ? 'rgba(16,185,129,.1)' : rx.adherence === 'poor' ? 'rgba(239,68,68,.1)' : 'rgba(245,158,11,.1)', color: rx.adherence === 'good' ? '#10b981' : rx.adherence === 'poor' ? '#ef4444' : '#f59e0b' }}>{rx.adherence}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Lab orders */}
          {(note.labOrders || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={sectionLabel}>Laboratory Orders</div>
              {note.labOrders.map(lab => (
                <div key={lab.id} style={{ display: 'flex', gap: 10, padding: '6px 10px', background: 'var(--surface2)', borderRadius: 7, marginBottom: 4, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14 }}>🧪</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{lab.test}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{lab.category} · {lab.urgency}</div>
                    {lab.result && <div style={{ fontSize: 12, color: lab.flag === 'critical' ? '#ef4444' : lab.flag === 'high' ? '#f97316' : 'var(--text)', marginTop: 3, fontWeight: lab.flag && lab.flag !== 'normal' ? 700 : 400 }}>{lab.resultValue} {lab.unit} — {lab.result}</div>}
                    {lab.notes && <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--muted)', marginTop: 2 }}>{lab.notes}</div>}
                  </div>
                  <LabStatusBadge status={lab.status} flag={lab.flag} />
                </div>
              ))}
            </div>
          )}

          {/* Imaging orders */}
          {(note.imagingOrders || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={sectionLabel}>Imaging</div>
              {note.imagingOrders.map(img => (
                <div key={img.id} style={{ padding: '7px 10px', background: 'var(--surface2)', borderRadius: 7, marginBottom: 4 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: img.impression ? 4 : 0 }}>
                    <span style={{ fontSize: 14 }}>🩻</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 7px', background: 'rgba(139,92,246,.15)', color: '#8b5cf6', borderRadius: 5 }}>{img.modality}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{img.study}</span>
                    <span style={{ fontSize: 10, marginLeft: 'auto', padding: '2px 6px', borderRadius: 5, background: 'var(--surface)', color: 'var(--muted)' }}>{img.status}</span>
                  </div>
                  {img.impression && <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 4, paddingLeft: 22 }}><b>Impression:</b> {img.impression}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Referrals */}
          {(note.referrals || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={sectionLabel}>Referrals</div>
              {note.referrals.map(ref => (
                <div key={ref.id} style={{ padding: '7px 10px', background: 'var(--surface2)', borderRadius: 7, marginBottom: 4 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                    <span>🏥</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{ref.toSpecialty}</span>
                    {ref.toFacility && <span style={{ fontSize: 11, color: 'var(--muted)' }}>— {ref.toFacility}</span>}
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, background: ref.urgency === 'emergency' ? 'rgba(239,68,68,.12)' : 'rgba(100,116,139,.1)', color: ref.urgency === 'emergency' ? '#ef4444' : 'var(--muted)', marginLeft: 'auto' }}>{ref.urgency}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', paddingLeft: 24 }}>{ref.reason}</div>
                </div>
              ))}
            </div>
          )}

          {/* Follow-Ups */}
          {(note.followUps || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={sectionLabel}>Follow-Up Schedule</div>
              {note.followUps.map(fu => (
                <div key={fu.id} style={{ display: 'flex', gap: 10, padding: '6px 10px', background: 'var(--surface2)', borderRadius: 7, marginBottom: 4, alignItems: 'center' }}>
                  <span>📅</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{fu.date} {fu.time && `at ${fu.time}`}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fu.type.replace(/_/g, ' ')} · {fu.reason}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 7px', borderRadius: 99, background: fu.status === 'completed' ? 'rgba(16,185,129,.12)' : fu.status === 'missed' ? 'rgba(239,68,68,.1)' : 'rgba(59,130,246,.1)', color: fu.status === 'completed' ? '#10b981' : fu.status === 'missed' ? '#ef4444' : '#3b82f6' }}>{fu.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Plan */}
          {note.plan && <div style={{ marginTop: 12 }}><div style={sectionLabel}>Management Plan</div><p style={noteText}>{note.plan}</p></div>}
          {note.progressAssessment && <div style={{ marginTop: 8 }}><div style={sectionLabel}>Progress Assessment</div><p style={noteText}>{note.progressAssessment}</p></div>}
        </div>
      )}
    </div>
  );
}

function LabStatusBadge({ status, flag }: { status: LabOrder['status']; flag?: LabOrder['flag'] }) {
  const col = flag === 'critical' ? '#ef4444' : flag === 'high' ? '#f97316' : flag === 'low' ? '#3b82f6' : status === 'resulted' ? '#10b981' : 'var(--muted)';
  return <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: `${col}18`, color: col, fontWeight: 700, flexShrink: 0 }}>{flag && flag !== 'normal' ? flag.toUpperCase() : status}</span>;
}

const sectionLabel: React.CSSProperties = { fontSize: 10, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 4 };
const noteText: React.CSSProperties = { fontSize: 13, color: 'var(--text)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' };
const selStyle: React.CSSProperties = { fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit' };
const btnPrimary: React.CSSProperties = { fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 7, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' };
const btnSecondary: React.CSSProperties = { fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 7, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' };
const btnAdd: React.CSSProperties = { fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 7, background: 'rgba(99,102,241,.1)', color: 'var(--accent)', border: '1px dashed var(--accent)', cursor: 'pointer', width: '100%', marginTop: 4 };
const btnSm: React.CSSProperties = { fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' };

// ─── PRINT VIEW ───────────────────────────────────────────────────────────────

function PrintView({ patient, doctor, notes, onClose }: {
  patient: PatientProfile; doctor: DoctorProfile; notes: ProgressNote[]; onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const doPrint = () => {
    const content = printRef.current?.innerHTML || '';
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Clinical Record — ${patient.name}</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Crimson Pro', Georgia, serif; font-size: 11pt; color: #1a1a1a; background: #fff; padding: 24px; }
          h1 { font-size: 18pt; font-weight: 700; margin-bottom: 4px; }
          h2 { font-size: 13pt; font-weight: 700; margin: 14px 0 6px; border-bottom: 1.5px solid #333; padding-bottom: 3px; }
          h3 { font-size: 11pt; font-weight: 600; margin: 10px 0 4px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #000; }
          .label { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #555; margin-bottom: 2px; }
          .value { font-size: 10pt; }
          .visit { border: 1px solid #ccc; border-radius: 4px; margin-bottom: 14px; padding: 12px; page-break-inside: avoid; }
          .visit-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 700; }
          .badge { display: inline-block; font-size: 8pt; padding: 1px 6px; border: 1px solid #aaa; border-radius: 3px; margin-right: 4px; }
          .section { margin-top: 8px; }
          .section-title { font-size: 9pt; font-weight: 700; text-transform: uppercase; color: #444; letter-spacing: .5px; margin-bottom: 3px; }
          .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .drug-row { padding: 4px 8px; background: #f5f5f5; border-radius: 3px; margin-bottom: 4px; }
          .alert-row { padding: 4px 8px; border: 1px solid #d97706; border-radius: 3px; margin-bottom: 4px; background: #fffbeb; }
          .vital-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
          .vital-box { border: 1px solid #ccc; border-radius: 4px; padding: 4px 8px; text-align: center; min-width: 70px; }
          .vital-val { font-size: 14pt; font-weight: 700; }
          .vital-unit { font-size: 7pt; color: #666; }
          .vital-label { font-size: 8pt; color: #444; }
          .sig { margin-top: 32px; border-top: 1px solid #ccc; padding-top: 12px; display: flex; justify-content: space-between; }
          @media print { body { padding: 12px; } .no-print { display: none; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: 'var(--bg)', borderRadius: 14, width: '90vw', maxWidth: 800, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 800 }}>🖨️ Print / Download Clinical Record</span>
          <button onClick={doPrint} style={btnPrimary}>🖨 Print / Save PDF</button>
          <button onClick={onClose} style={btnSecondary}>✕ Close</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div ref={printRef}>
            {/* Print content */}
            <div className="header">
              <div>
                <div style={{ fontSize: '20pt', fontWeight: 700 }}>Clinical Record</div>
                <div style={{ fontSize: '11pt', marginTop: 4 }}>AMEXAN Health System</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="label">Printed</div>
                <div className="value">{new Date().toLocaleString()}</div>
              </div>
            </div>

            {/* Patient + Doctor header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20, padding: '14px', border: '1.5px solid #ccc', borderRadius: 6 }}>
              <div>
                <div style={{ fontSize: '14pt', fontWeight: 700, marginBottom: 8 }}>👤 Patient</div>
                <div className="label">Full Name</div><div className="value">{patient.name}</div>
                {patient.dob && <><div className="label" style={{ marginTop: 4 }}>Date of Birth / Age</div><div className="value">{patient.dob} ({ageFromDob(patient.dob)})</div></>}
                {patient.gender && <><div className="label" style={{ marginTop: 4 }}>Gender</div><div className="value" style={{ textTransform: 'capitalize' }}>{patient.gender}</div></>}
                {patient.nhif && <><div className="label" style={{ marginTop: 4 }}>NHIF No.</div><div className="value">{patient.nhif}</div></>}
                {patient.nationalId && <><div className="label" style={{ marginTop: 4 }}>National ID</div><div className="value">{patient.nationalId}</div></>}
                {patient.bloodGroup && <><div className="label" style={{ marginTop: 4 }}>Blood Group</div><div className="value">{patient.bloodGroup}</div></>}
                {patient.knownAllergies && <><div className="label" style={{ marginTop: 4, color: '#c00' }}>⚠ Allergies</div><div className="value" style={{ color: '#c00', fontWeight: 700 }}>{patient.knownAllergies}</div></>}
                {patient.chronicConditions && <><div className="label" style={{ marginTop: 4 }}>Chronic Conditions</div><div className="value">{patient.chronicConditions}</div></>}
              </div>
              <div>
                <div style={{ fontSize: '14pt', fontWeight: 700, marginBottom: 8 }}>👨‍⚕️ Doctor</div>
                <div className="label">Name</div><div className="value">Dr. {doctor.name}</div>
                <div className="label" style={{ marginTop: 4 }}>Specialty</div><div className="value">{doctor.specialty}</div>
                {doctor.licenseNo && <><div className="label" style={{ marginTop: 4 }}>License No.</div><div className="value">{doctor.licenseNo}</div></>}
                {doctor.facility && <><div className="label" style={{ marginTop: 4 }}>Facility</div><div className="value">{doctor.facility}</div></>}
              </div>
            </div>

            {/* All visits */}
            {notes.map(note => (
              <div key={note.id} className="visit">
                <div className="visit-header">
                  <span>{fmtDateTime(note.visitDate)} — {note.visitType?.replace(/_/g, ' ').toUpperCase()}</span>
                  <span>{note.doctorName} · {note.doctorSpecialty}</span>
                </div>

                {note.chiefComplaint && <div><div className="section-title">Chief Complaint</div><p>{note.chiefComplaint}</p></div>}
                {note.hpi && <div className="section"><div className="section-title">HPI</div><p>{note.hpi}</p></div>}

                {note.vitals && Object.keys(note.vitals).some(k => (note.vitals as any)[k]) && (
                  <div className="section">
                    <div className="section-title">Vital Signs</div>
                    <div className="vital-grid">
                      {note.vitals.bp && <div className="vital-box"><div className="vital-val">{note.vitals.bp}</div><div className="vital-unit">mmHg</div><div className="vital-label">BP</div></div>}
                      {note.vitals.hr && <div className="vital-box"><div className="vital-val">{note.vitals.hr}</div><div className="vital-unit">bpm</div><div className="vital-label">HR</div></div>}
                      {note.vitals.temp && <div className="vital-box"><div className="vital-val">{note.vitals.temp}</div><div className="vital-unit">°C</div><div className="vital-label">Temp</div></div>}
                      {note.vitals.spo2 && <div className="vital-box"><div className="vital-val">{note.vitals.spo2}%</div><div className="vital-unit"></div><div className="vital-label">SpO2</div></div>}
                      {note.vitals.weight && <div className="vital-box"><div className="vital-val">{note.vitals.weight}</div><div className="vital-unit">kg</div><div className="vital-label">Wt</div></div>}
                      {note.vitals.bmi && <div className="vital-box"><div className="vital-val">{note.vitals.bmi}</div><div className="vital-unit">BMI</div><div className="vital-label">{bmiCategory(note.vitals.bmi)}</div></div>}
                    </div>
                  </div>
                )}

                {note.diagnoses?.length > 0 && (
                  <div className="section">
                    <div className="section-title">Diagnoses</div>
                    {note.diagnoses.map(dx => <div key={dx.id} style={{ marginBottom: 2 }}><span className="badge">{dx.type}</span>{dx.code && <span className="badge">{dx.code}</span>} <strong>{dx.description}</strong> <span className="badge">{dx.status}</span></div>)}
                  </div>
                )}

                {note.prescriptions?.length > 0 && (
                  <div className="section">
                    <div className="section-title">Prescriptions</div>
                    {note.prescriptions.map(rx => <div key={rx.id} className="drug-row"><strong>{rx.medication}</strong> — {rx.dosage} {rx.frequency} × {rx.duration} ({rx.route}) {rx.instructions && `| ${rx.instructions}`}</div>)}
                  </div>
                )}

                {note.labOrders?.length > 0 && (
                  <div className="section">
                    <div className="section-title">Lab Orders</div>
                    {note.labOrders.map(lab => <div key={lab.id} style={{ marginBottom: 2 }}><span className="badge">{lab.urgency.toUpperCase()}</span> {lab.test} — <em>{lab.status}</em>{lab.resultValue && ` | Result: ${lab.resultValue} ${lab.unit}`}{lab.result && ` — ${lab.result}`}</div>)}
                  </div>
                )}

                {note.imagingOrders?.length > 0 && (
                  <div className="section">
                    <div className="section-title">Imaging</div>
                    {note.imagingOrders.map(img => <div key={img.id} style={{ marginBottom: 2 }}><span className="badge">{img.modality}</span> {img.study} — {img.status}{img.impression && ` | Impression: ${img.impression}`}</div>)}
                  </div>
                )}

                {note.referrals?.length > 0 && (
                  <div className="section">
                    <div className="section-title">Referrals</div>
                    {note.referrals.map(ref => <div key={ref.id} style={{ marginBottom: 2 }}><span className="badge">{ref.urgency.toUpperCase()}</span> → {ref.toSpecialty}{ref.toFacility && ` @ ${ref.toFacility}`}: {ref.reason}</div>)}
                  </div>
                )}

                {note.followUps?.length > 0 && (
                  <div className="section">
                    <div className="section-title">Follow-Up</div>
                    {note.followUps.map(fu => <div key={fu.id}>{fu.date} {fu.time} — {fu.type.replace(/_/g, ' ')} — {fu.reason}</div>)}
                  </div>
                )}

                {note.plan && <div className="section"><div className="section-title">Plan</div><p>{note.plan}</p></div>}

                {note.alerts?.filter(a => a.severity !== 'info').length > 0 && (
                  <div className="section">
                    <div className="section-title">Clinical Alerts</div>
                    {note.alerts.filter(a => a.severity !== 'info').map(a => <div key={a.id} className="alert-row">{a.severity.toUpperCase()}: {a.message}</div>)}
                  </div>
                )}

                <div style={{ marginTop: 10, borderTop: '1px dashed #ccc', paddingTop: 6, fontSize: '9pt', color: '#666' }}>
                  Recorded by Dr. {note.doctorName} on {fmtDateTime(note.createdAt)} {note.lastEditedAt ? `· Last edited ${fmtDateTime(note.lastEditedAt)}` : ''}
                </div>
              </div>
            ))}

            {/* Signature area */}
            <div className="sig">
              <div>
                <div>______________________________</div>
                <div style={{ fontSize: '10pt', marginTop: 4 }}>Dr. {doctor.name}</div>
                <div style={{ fontSize: '9pt', color: '#555' }}>{doctor.specialty} {doctor.licenseNo && `| Lic: ${doctor.licenseNo}`}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Date: ____________________</div>
                <div style={{ fontSize: '10pt', marginTop: 8 }}>Facility Stamp:</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HISTORY PANEL
// ═══════════════════════════════════════════════════════════════════════════════

interface HistoryPanelProps {
  doctorId: string;
  doctorProfile: DoctorProfile;
  initialPatientId?: string;
}

export default function ClinicalHistoryPanel({ doctorId, doctorProfile, initialPatientId }: HistoryPanelProps) {
  // Patients
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<ProgressNote[]>([]);
  const [editingNote, setEditingNote] = useState<Partial<ProgressNote> | null>(null);
  const [isNewNote, setIsNewNote] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Global alerts (across patients)
  const [globalAlerts, setGlobalAlerts] = useState<(Alert & { patientName: string })[]>([]);

  // Load patients who have had appointments with this doctor
  useEffect(() => {
    if (!doctorId) return;
    const u = onSnapshot(
      query(collection(db, 'appointments'), where('doctorId', '==', doctorId)),
      async snap => {
        const uids = [...new Set(snap.docs.map(d => d.data().patientId).filter(Boolean))];
        const profiles: PatientProfile[] = [];
        for (const uid of uids) {
          try {
            // Try multiple collections
            for (const col of ['patients', 'users', 'patientProfiles']) {
              const s = await getDoc(doc(db, col, uid));
              if (s.exists()) {
                const d = s.data() as any;
                profiles.push({ uid, name: d.name || d.displayName || d.fullName || uid.slice(0, 8), dob: d.dob || d.dateOfBirth, gender: d.gender, phone: d.phone || d.phoneNumber, email: d.email, nhif: d.nhif, nationalId: d.nationalId || d.national_id, bloodGroup: d.bloodGroup || d.blood_group, knownAllergies: d.knownAllergies || d.allergies, chronicConditions: d.chronicConditions || d.chronic_conditions, avatar: d.avatar || d.photoURL });
                break;
              }
            }
          } catch { profiles.push({ uid, name: uid.slice(0, 8) + '…' }); }
        }
        setPatients(profiles);
        if (initialPatientId) {
          const p = profiles.find(p => p.uid === initialPatientId);
          if (p) setSelectedPatient(p);
        }
      }
    );
    return () => u();
  }, [doctorId, initialPatientId]);

  // Load clinical notes for selected patient
  useEffect(() => {
    if (!selectedPatient) { setNotes([]); return; }
    setLoadingNotes(true);
    const u = onSnapshot(
      query(collection(db, 'clinicalNotes'), where('patientId', '==', selectedPatient.uid), orderBy('visitDate', 'desc')),
      snap => {
        setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProgressNote)));
        setLoadingNotes(false);
      },
      () => setLoadingNotes(false)
    );
    return () => u();
  }, [selectedPatient?.uid]);

  // Real-time global alerts listener
  useEffect(() => {
    if (!doctorId) return;
    const u = onSnapshot(
      query(collection(db, 'clinicalAlerts'), where('doctorId', '==', doctorId), where('acknowledged', '==', false)),
      snap => {
        setGlobalAlerts(snap.docs.map(d => ({ ...d.data() } as any)));
      }
    );
    return () => u();
  }, [doctorId]);

  // Save a note
  const saveNote = async (noteData: Partial<ProgressNote>) => {
    if (!selectedPatient) return;
    const payload = {
      ...noteData,
      patientId: selectedPatient.uid,
      doctorId,
      doctorName: doctorProfile.name,
      doctorSpecialty: doctorProfile.specialty,
      isLocked: false,
      updatedAt: serverTimestamp(),
    };

    if (editingNote?.id) {
      await updateDoc(doc(db, 'clinicalNotes', editingNote.id), payload);
      // Push alerts to global alerts collection
      if (noteData.alerts?.length) {
        for (const alert of noteData.alerts.filter(a => !a.acknowledged)) {
          await setDoc(doc(db, 'clinicalAlerts', `${editingNote.id}_${alert.id}`), {
            ...alert, doctorId, patientId: selectedPatient.uid, patientName: selectedPatient.name, noteId: editingNote.id,
          });
          // Also push to patient alerts
          await addDoc(collection(db, 'alerts'), {
            patientId: selectedPatient.uid, doctorId, type: alert.type, title: `⚠ ${alert.type.replace(/_/g, ' ')}`,
            message: alert.message, read: false, createdAt: serverTimestamp(), urgency: alert.severity,
          });
        }
      }
    } else {
      const ref = await addDoc(collection(db, 'clinicalNotes'), { ...payload, createdAt: serverTimestamp(), visitDate: serverTimestamp() });
      // Push to appointments collection as well
      await addDoc(collection(db, 'appointments'), {
        doctorId, patientId: selectedPatient.uid, patientName: selectedPatient.name,
        status: 'completed', specialty: doctorProfile.specialty, date: new Date(),
        clinicalNoteId: ref.id, amount: 0,
      });
    }
    setEditingNote(null);
    setIsNewNote(false);
  };

  const startNewNote = () => {
    setEditingNote({
      visitDate: new Date(), visitType: 'follow_up',
      diagnoses: [], prescriptions: [], labOrders: [], imagingOrders: [], referrals: [], followUps: [], alerts: [],
    });
    setIsNewNote(true);
  };

  const filteredPatients = patients.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) || p.nhif?.includes(search)
  );

  const activeAlerts = notes.flatMap(n => (n.alerts || []).filter(a => !a.acknowledged));
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const activeRx = notes.flatMap(n => (n.prescriptions || []).filter(r => r.status === 'active'));
  const pendingLabs = notes.flatMap(n => (n.labOrders || []).filter(l => l.status === 'ordered' || l.status === 'processing'));

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 600, fontFamily: 'var(--font, system-ui)', background: 'var(--bg, #f8fafc)', color: 'var(--text, #0f172a)' }}>

      {/* ── Patient list sidebar ── */}
      <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border, #e2e8f0)', display: 'flex', flexDirection: 'column', background: 'var(--bg, #fff)' }}>
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--border, #e2e8f0)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            🗂 Patients
            {criticalCount > 0 && <span style={{ fontSize: 10, background: '#ef4444', color: '#fff', borderRadius: 99, padding: '1px 7px', fontWeight: 700 }}>{criticalCount} 🚨</span>}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient…"
            style={{ width: '100%', fontSize: 12, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border, #e2e8f0)', background: 'var(--surface, #f8fafc)', color: 'var(--text, #0f172a)', fontFamily: 'inherit' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredPatients.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--muted, #94a3b8)' }}>No patients found</div>
          ) : filteredPatients.map(p => {
            const isSelected = selectedPatient?.uid === p.uid;
            return (
              <button key={p.uid} onClick={() => setSelectedPatient(p)}
                style={{ width: '100%', padding: '10px 12px', background: isSelected ? 'rgba(99,102,241,.08)' : 'transparent', border: 'none', borderLeft: `3px solid ${isSelected ? 'var(--accent, #6366f1)' : 'transparent'}`, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', textAlign: 'left', fontFamily: 'inherit' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${p.name.charCodeAt(0) * 7 % 360},50%,30%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{p.name[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--accent, #6366f1)' : 'var(--text, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted, #94a3b8)' }}>{p.dob ? ageFromDob(p.dob) : ''}{p.gender ? ` · ${p.gender[0].toUpperCase()}` : ''}{p.bloodGroup ? ` · ${p.bloodGroup}` : ''}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main record area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {!selectedPatient ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: 'var(--muted, #94a3b8)' }}>
            <div style={{ fontSize: 56 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Select a patient</div>
            <div style={{ fontSize: 13 }}>Choose a patient from the left to view their complete clinical record</div>
          </div>
        ) : (
          <>
            {/* Patient header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border, #e2e8f0)', background: 'var(--surface2, #f1f5f9)', display: 'flex', alignItems: 'flex-start', gap: 16, flexShrink: 0 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `hsl(${selectedPatient.name.charCodeAt(0) * 7 % 360},50%,30%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{selectedPatient.name[0]?.toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{selectedPatient.name}</span>
                  {selectedPatient.dob && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{ageFromDob(selectedPatient.dob)}</span>}
                  {selectedPatient.gender && <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{selectedPatient.gender}</span>}
                  {selectedPatient.bloodGroup && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', background: 'rgba(239,68,68,.12)', color: '#ef4444', borderRadius: 99 }}>🩸 {selectedPatient.bloodGroup}</span>}
                  {selectedPatient.knownAllergies && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', background: 'rgba(245,158,11,.12)', color: '#f59e0b', borderRadius: 99 }}>⚠ {selectedPatient.knownAllergies}</span>}
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                  {selectedPatient.phone && <span style={{ fontSize: 11, color: 'var(--muted)' }}>📞 {selectedPatient.phone}</span>}
                  {selectedPatient.nhif && <span style={{ fontSize: 11, color: 'var(--muted)' }}>🏥 NHIF: {selectedPatient.nhif}</span>}
                  {selectedPatient.nationalId && <span style={{ fontSize: 11, color: 'var(--muted)' }}>🪪 {selectedPatient.nationalId}</span>}
                  {selectedPatient.chronicConditions && <span style={{ fontSize: 11, color: 'var(--muted)' }}>📌 {selectedPatient.chronicConditions}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                {/* Stats */}
                <div style={{ display: 'flex', gap: 8, marginRight: 8 }}>
                  <div style={{ textAlign: 'center', padding: '5px 10px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{notes.length}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase' }}>Visits</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '5px 10px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{activeRx.length}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase' }}>Active Rx</div>
                  </div>
                  {criticalCount > 0 && (
                    <div style={{ textAlign: 'center', padding: '5px 10px', background: 'rgba(239,68,68,.07)', borderRadius: 8, border: '1px solid rgba(239,68,68,.2)' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#ef4444' }}>{criticalCount}</div>
                      <div style={{ fontSize: 9, color: '#ef4444', textTransform: 'uppercase' }}>Alerts</div>
                    </div>
                  )}
                </div>
                <button onClick={startNewNote} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>✚ New Visit</button>
                <button onClick={() => setShowPrint(true)} style={btnSecondary}>🖨 Print All</button>
              </div>
            </div>

            {/* Doctor info strip */}
            <div style={{ padding: '6px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
              <span>👨‍⚕️ Dr. {doctorProfile.name}</span>
              <span>·</span>
              <span>{doctorProfile.specialty}</span>
              {doctorProfile.licenseNo && <><span>·</span><span>Lic: {doctorProfile.licenseNo}</span></>}
              {doctorProfile.facility && <><span>·</span><span>{doctorProfile.facility}</span></>}
              <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 700, fontSize: 10 }}>🔴 LIVE</span>
            </div>

            {/* Active alerts strip */}
            {activeAlerts.length > 0 && (
              <div style={{ padding: '8px 16px', background: 'rgba(239,68,68,.04)', borderBottom: '1px solid rgba(239,68,68,.12)', flexShrink: 0 }}>
                {activeAlerts.slice(0, 3).map(a => (
                  <div key={a.id} style={{ fontSize: 12, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3, color: a.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>
                    <span>{a.severity === 'critical' ? '🚨' : '⚠️'}</span>
                    <span>{a.message}</span>
                  </div>
                ))}
                {activeAlerts.length > 3 && <div style={{ fontSize: 11, color: 'var(--muted)' }}>+{activeAlerts.length - 3} more alerts</div>}
              </div>
            )}

            {/* Summary cards — active Rx, pending labs */}
            {(activeRx.length > 0 || pendingLabs.length > 0) && (
              <div style={{ display: 'flex', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0, overflowX: 'auto' }}>
                {activeRx.slice(0, 4).map(rx => (
                  <div key={rx.id} style={{ flexShrink: 0, padding: '5px 10px', background: 'rgba(16,185,129,.07)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 7, fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>💊 {rx.medication}</div>
                    <div style={{ color: 'var(--muted)', marginTop: 1 }}>{rx.dosage} · {rx.frequency}</div>
                  </div>
                ))}
                {pendingLabs.slice(0, 3).map(lab => (
                  <div key={lab.id} style={{ flexShrink: 0, padding: '5px 10px', background: 'rgba(59,130,246,.07)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 7, fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: '#3b82f6' }}>🧪 {lab.test}</div>
                    <div style={{ color: 'var(--muted)', marginTop: 1 }}>{lab.status} · {lab.urgency}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
              {/* New note editor */}
              {editingNote && isNewNote && (
                <div style={{ marginBottom: 20 }}>
                  <VisitNoteEditor note={editingNote} patientId={selectedPatient.uid} doctorId={doctorId}
                    onSave={saveNote} onClose={() => { setEditingNote(null); setIsNewNote(false); }} isNew />
                </div>
              )}

              {loadingNotes ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading clinical record…</div>
              ) : notes.length === 0 && !isNewNote ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>No clinical notes yet</div>
                  <div style={{ fontSize: 13 }}>Start a new visit note to begin this patient's clinical record.</div>
                  <button onClick={startNewNote} style={{ ...btnPrimary, marginTop: 16 }}>✚ Start Clinical Record</button>
                </div>
              ) : (
                <div>
                  {notes.map(note => (
                    editingNote?.id === note.id ? (
                      <div key={note.id} style={{ marginBottom: 20 }}>
                        <VisitNoteEditor note={editingNote} patientId={selectedPatient.uid} doctorId={doctorId}
                          onSave={saveNote} onClose={() => setEditingNote(null)} />
                      </div>
                    ) : (
                      <VisitNoteView key={note.id} note={note} doctorId={doctorId}
                        onEdit={() => setEditingNote(note)}
                        onPrint={() => setShowPrint(true)} />
                    )
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Print modal */}
      {showPrint && selectedPatient && (
        <PrintView patient={selectedPatient} doctor={doctorProfile} notes={notes} onClose={() => setShowPrint(false)} />
      )}
    </div>
  );
}