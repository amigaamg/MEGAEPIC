'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import {
  collection, query, where, onSnapshot, doc, setDoc,
  addDoc, updateDoc, getDoc, getDocs, serverTimestamp,
  orderBy, deleteDoc, limit,
} from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface DoctorProfile {
  uid: string; name: string; email: string; specialty: string;
  clinic?: string; licenseNumber?: string; phone?: string; bio?: string;
  yearsExperience?: number; languages?: string[]; location?: string;
  photoURL?: string; rating?: number;
}
interface Service {
  id: string; specialty: string; clinic: string; price: number;
  description: string; doctorId: string; doctorName: string; duration: number;
  isAvailable: boolean; tags?: string[]; rating?: number;
  yearsExperience?: number; location?: string; createdAt: any;
}
interface Appointment {
  id: string; patientId: string; patientName?: string; patientEmail?: string;
  patientPhone?: string; serviceId: string; specialty?: string;
  status: 'booked' | 'active' | 'completed' | 'cancelled';
  date: any; patientNotes?: string; notes?: string;
  prescriptions?: Prescription[]; consultationId?: string;
  doctorId: string; amount?: number; paymentStatus?: string;
}
interface Consultation {
  id: string; appointmentId: string; doctorId: string; patientId: string;
  status: 'active' | 'completed'; prescriptions: Prescription[];
  notes: string; startedAt: any; endedAt?: any;
}
interface Prescription {
  medication: string; dosage: string; frequency: string;
  duration: string; addedAt: string; instructions?: string;
}
interface VitalReading {
  id: string; patientId: string; type: 'bp' | 'glucose' | 'weight' | 'temp' | 'pulse';
  value: string; systolic?: number; diastolic?: number;
  unit: string; recordedAt: any; note?: string;
}
interface ChatMessage {
  id: string; threadId: string; text: string; senderId: string;
  senderRole: 'doctor' | 'patient'; timestamp: any; read: boolean;
}
interface PatientRecord {
  uid: string; name: string; email: string; phone?: string;
  age?: number; gender?: string; bloodGroup?: string;
  condition?: string; allergies?: string[]; emergencyContact?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}
interface Alert {
  id: string; patientId: string; doctorId: string; title: string;
  message: string; type: 'bp' | 'glucose' | 'medication' | 'general';
  read: boolean; createdAt: any;
}
interface LabOrder {
  id: string; appointmentId: string; patientId: string; doctorId: string;
  tests: string[]; instructions: string; status: 'ordered' | 'collected' | 'resulted';
  results?: string; createdAt: any;
}
interface Referral {
  id: string; fromDoctorId: string; toDoctorId?: string;
  patientId: string; reason: string; urgency: 'routine' | 'urgent' | 'emergency';
  specialty: string; status: 'pending' | 'accepted' | 'completed';
  notes?: string; createdAt: any; patientName?: string;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const fmtShort = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
};
const fmtTime = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
};
const isToday = (ts: any) => {
  if (!ts) return false;
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toDateString() === new Date().toDateString();
};
const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};
const bpCategory = (s: number, d: number) => {
  if (s < 120 && d < 80) return { label: 'Normal', color: '#10b981' };
  if (s < 130 && d < 80) return { label: 'Elevated', color: '#f59e0b' };
  if (s < 140 || d < 90) return { label: 'Stage 1 High', color: '#f97316' };
  return { label: 'Stage 2 High', color: '#ef4444' };
};
const riskColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
  booked:    { label: 'Upcoming',  color: '#6366f1', bg: 'rgba(99,102,241,.1)' },
  active:    { label: '● Live',    color: '#10b981', bg: 'rgba(16,185,129,.1)' },
  completed: { label: 'Completed', color: '#64748b', bg: 'rgba(100,116,139,.1)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,.1)' },
};

// ─────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────

function ServiceModal({ doctor, existing, onClose }: { doctor: DoctorProfile; existing?: Service; onClose: () => void }) {
  const [form, setForm] = useState({
    specialty: existing?.specialty || doctor.specialty || '',
    clinic: existing?.clinic || doctor.clinic || '',
    price: existing?.price?.toString() || '',
    duration: existing?.duration?.toString() || '30',
    description: existing?.description || '',
    location: existing?.location || doctor.location || '',
    tags: existing?.tags?.join(', ') || '',
    yearsExperience: existing?.yearsExperience?.toString() || doctor.yearsExperience?.toString() || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const save = async () => {
    if (!form.specialty || !form.clinic || !form.price) { setErr('Fill all required fields.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = {
        specialty: form.specialty, clinic: form.clinic, price: Number(form.price),
        duration: Number(form.duration), description: form.description, location: form.location,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
        doctorId: doctor.uid, doctorName: doctor.name, isAvailable: true,
      };
      if (existing) await updateDoc(doc(db, 'services', existing.id), payload);
      else await addDoc(collection(db, 'services'), { ...payload, createdAt: serverTimestamp() });
      onClose();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-hd">
          <h3 className="modal-ht">{existing ? 'Edit Service' : 'Create New Service'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-grid-2">
            {[
              { k: 'specialty', label: 'Specialty *', ph: 'e.g. Cardiology' },
              { k: 'clinic', label: 'Clinic / Service Name *', ph: 'e.g. Heart Health Clinic' },
              { k: 'price', label: 'Fee (KES) *', ph: '2500', type: 'number' },
              { k: 'location', label: 'Location', ph: 'e.g. Nairobi CBD' },
              { k: 'yearsExperience', label: 'Years Experience', ph: '12', type: 'number' },
            ].map(field => (
              <div key={field.k} className="field-col">
                <label className="field-lbl">{field.label}</label>
                <input className="field-inp" type={field.type || 'text'} value={(form as any)[field.k]} onChange={f(field.k)} placeholder={field.ph} />
              </div>
            ))}
            <div className="field-col">
              <label className="field-lbl">Duration (min)</label>
              <select className="field-inp" value={form.duration} onChange={f('duration')}>
                {[15, 20, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div className="field-col form-full">
              <label className="field-lbl">Tags (comma-separated)</label>
              <input className="field-inp" value={form.tags} onChange={f('tags')} placeholder="e.g. Virtual, Paediatrics, Urgent" />
            </div>
            <div className="field-col form-full">
              <label className="field-lbl">Description</label>
              <textarea className="field-ta" rows={3} value={form.description} onChange={f('description')} placeholder="What does this service offer patients?" />
            </div>
          </div>
          {err && <div className="err-box">{err}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-cta" onClick={save} disabled={saving} style={{ flex: 2 }}>
              {saving ? 'Saving…' : existing ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrescriptionModal({ consultationId, appointmentId, existing, onClose }: {
  consultationId: string; appointmentId: string; existing: Prescription[]; onClose: () => void;
}) {
  const [rx, setRx] = useState<Prescription>({ medication: '', dosage: '', frequency: '', duration: '', addedAt: '', instructions: '' });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!rx.medication || !rx.dosage) return;
    setSaving(true);
    const newRx = [...existing, { ...rx, addedAt: new Date().toISOString() }];
    try {
      await updateDoc(doc(db, 'consultations', consultationId), { prescriptions: newRx });
      await updateDoc(doc(db, 'appointments', appointmentId), { prescriptions: newRx });
      onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-hd">
          <h3 className="modal-ht">💊 Add Prescription</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {[
            { k: 'medication', label: 'Medication *', ph: 'e.g. Amlodipine 5mg' },
            { k: 'dosage', label: 'Dosage *', ph: 'e.g. 1 tablet' },
            { k: 'frequency', label: 'Frequency', ph: 'e.g. Once daily' },
            { k: 'duration', label: 'Duration', ph: 'e.g. 30 days' },
            { k: 'instructions', label: 'Special Instructions', ph: 'e.g. Take with food' },
          ].map(f => (
            <div key={f.k} className="field-col">
              <label className="field-lbl">{f.label}</label>
              <input className="field-inp" value={(rx as any)[f.k]} onChange={e => setRx(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-cta" onClick={save} disabled={saving || !rx.medication} style={{ flex: 2 }}>
              {saving ? 'Saving…' : '💊 Add Prescription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotesModal({ consultationId, appointmentId, currentNotes, onClose }: {
  consultationId: string; appointmentId: string; currentNotes: string; onClose: () => void;
}) {
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    await updateDoc(doc(db, 'consultations', consultationId), { notes });
    await updateDoc(doc(db, 'appointments', appointmentId), { notes });
    onClose();
    setSaving(false);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-hd">
          <h3 className="modal-ht">📝 Clinical Notes</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="field-col">
            <label className="field-lbl">Notes (visible to patient after session)</label>
            <textarea className="field-ta" rows={9} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Document findings, diagnosis, recommendations, follow-up plan…" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-cta" onClick={save} disabled={saving} style={{ flex: 2 }}>
              {saving ? 'Saving…' : '💾 Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabOrderModal({ doctorId, appointment, onClose }: {
  doctorId: string; appointment: Appointment; onClose: () => void;
}) {
  const commonTests = ['Full Blood Count', 'Urine Analysis', 'Blood Sugar (Fasting)', 'HbA1c', 'Lipid Profile',
    'Liver Function Test', 'Kidney Function Test', 'Thyroid (TSH, T3, T4)', 'ECG', 'Chest X-Ray', 'Echo', 'Ultrasound'];
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);
  const toggle = (t: string) => setSelected(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const save = async () => {
    const allTests = [...selected, ...custom.split(',').map(t => t.trim()).filter(Boolean)];
    if (!allTests.length) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'labOrders'), {
        appointmentId: appointment.id, patientId: appointment.patientId,
        doctorId, tests: allTests, instructions, status: 'ordered', createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'alerts'), {
        patientId: appointment.patientId, doctorId, type: 'general',
        title: '🧪 Lab Tests Ordered',
        message: `Your doctor has ordered the following tests: ${allTests.join(', ')}. Please visit the lab at your earliest convenience.`,
        read: false, createdAt: serverTimestamp(),
      });
      onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-hd">
          <h3 className="modal-ht">🧪 Order Lab / Imaging Tests</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: -4 }}>For: <strong>{appointment.patientName}</strong></p>
          <div className="field-col">
            <label className="field-lbl">Select Tests</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {commonTests.map(t => (
                <button key={t} onClick={() => toggle(t)} style={{
                  padding: '5px 12px', borderRadius: 99, border: '1.5px solid', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  borderColor: selected.includes(t) ? 'var(--accent)' : 'var(--border)',
                  background: selected.includes(t) ? 'var(--accent-dim)' : 'var(--bg)',
                  color: selected.includes(t) ? 'var(--accent)' : 'var(--text-2)',
                }}>
                  {selected.includes(t) ? '✓ ' : ''}{t}
                </button>
              ))}
            </div>
          </div>
          <div className="field-col">
            <label className="field-lbl">Other Tests (comma-separated)</label>
            <input className="field-inp" value={custom} onChange={e => setCustom(e.target.value)} placeholder="e.g. Sputum Culture, COVID PCR" />
          </div>
          <div className="field-col">
            <label className="field-lbl">Instructions</label>
            <textarea className="field-ta" rows={3} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="e.g. Fast for 8 hours before blood draw" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-cta" onClick={save} disabled={saving || (!selected.length && !custom)} style={{ flex: 2 }}>
              {saving ? 'Ordering…' : '🧪 Send Lab Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReferralModal({ doctor, appointment, onClose }: {
  doctor: DoctorProfile; appointment: Appointment; onClose: () => void;
}) {
  const [form, setForm] = useState({ specialty: '', reason: '', urgency: 'routine', notes: '' });
  const [saving, setSaving] = useState(false);
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const save = async () => {
    if (!form.specialty || !form.reason) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'referrals'), {
        fromDoctorId: doctor.uid, patientId: appointment.patientId,
        patientName: appointment.patientName, specialty: form.specialty,
        reason: form.reason, urgency: form.urgency, notes: form.notes,
        status: 'pending', createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'alerts'), {
        patientId: appointment.patientId, doctorId: doctor.uid, type: 'general',
        title: '📋 Referral Issued',
        message: `Dr. ${doctor.name} has referred you to a ${form.specialty} specialist. Reason: ${form.reason}.`,
        read: false, createdAt: serverTimestamp(),
      });
      onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-hd">
          <h3 className="modal-ht">📋 Issue Referral</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: -4 }}>Referring: <strong>{appointment.patientName}</strong></p>
          <div className="field-col">
            <label className="field-lbl">Refer to Specialty *</label>
            <input className="field-inp" value={form.specialty} onChange={f('specialty')} placeholder="e.g. Cardiologist, Neurologist" />
          </div>
          <div className="field-col">
            <label className="field-lbl">Urgency</label>
            <select className="field-inp" value={form.urgency} onChange={f('urgency')}>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div className="field-col">
            <label className="field-lbl">Reason for Referral *</label>
            <textarea className="field-ta" rows={3} value={form.reason} onChange={f('reason')} placeholder="Clinical reason for referral…" />
          </div>
          <div className="field-col">
            <label className="field-lbl">Additional Notes</label>
            <textarea className="field-ta" rows={2} value={form.notes} onChange={f('notes')} placeholder="Any additional context for the receiving doctor…" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-cta" onClick={save} disabled={saving || !form.specialty || !form.reason} style={{ flex: 2 }}>
              {saving ? 'Sending…' : '📋 Send Referral'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertModal({ doctorId, patient, onClose }: { doctorId: string; patient: PatientRecord; onClose: () => void }) {
  const [form, setForm] = useState({ title: '', message: '', type: 'general' });
  const [saving, setSaving] = useState(false);
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const save = async () => {
    if (!form.title || !form.message) return;
    setSaving(true);
    await addDoc(collection(db, 'alerts'), {
      patientId: patient.uid, doctorId, title: form.title, message: form.message,
      type: form.type, read: false, createdAt: serverTimestamp(),
    });
    onClose();
    setSaving(false);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-hd">
          <h3 className="modal-ht">🔔 Send Alert to Patient</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: -4 }}>To: <strong>{patient.name}</strong></p>
          <div className="field-col">
            <label className="field-lbl">Alert Type</label>
            <select className="field-inp" value={form.type} onChange={f('type')}>
              <option value="general">General</option>
              <option value="medication">Medication Reminder</option>
              <option value="bp">Blood Pressure Alert</option>
              <option value="glucose">Glucose Alert</option>
            </select>
          </div>
          <div className="field-col">
            <label className="field-lbl">Title *</label>
            <input className="field-inp" value={form.title} onChange={f('title')} placeholder="e.g. Medication Reminder" />
          </div>
          <div className="field-col">
            <label className="field-lbl">Message *</label>
            <textarea className="field-ta" rows={4} value={form.message} onChange={f('message')} placeholder="Message to patient…" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-cta" onClick={save} disabled={saving || !form.title || !form.message} style={{ flex: 2 }}>
              {saving ? 'Sending…' : '🔔 Send Alert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientDetailModal({ patient, doctorId, appointments, onClose }: {
  patient: PatientRecord; doctorId: string; appointments: Appointment[]; onClose: () => void;
}) {
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [tab, setTab] = useState<'overview' | 'history' | 'vitals' | 'prescriptions'>('overview');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'vitals'), where('patientId', '==', patient.uid), orderBy('recordedAt', 'desc')),
      snap => setVitals(snap.docs.map(d => ({ id: d.id, ...d.data() } as VitalReading)))
    );
    return () => unsub();
  }, [patient.uid]);

  const patientAppts = appointments.filter(a => a.patientId === patient.uid);
  const latestBP = vitals.find(v => v.type === 'bp');
  const bpCat = latestBP ? bpCategory(latestBP.systolic!, latestBP.diastolic!) : null;
  const allRx = patientAppts.flatMap(a => a.prescriptions || []);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: '92vh' }}>
        <div className="modal-hd" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="pc-ava" style={{ width: 52, height: 52, fontSize: 22 }}>{patient.name[0]}</div>
            <div>
              <h3 className="modal-ht">{patient.name}</h3>
              <p className="modal-hs">
                {[patient.age && `${patient.age} yrs`, patient.gender, patient.bloodGroup].filter(Boolean).join(' · ')}
                {patient.riskLevel && <span className="risk-chip" style={{ background: `${riskColor[patient.riskLevel]}20`, color: riskColor[patient.riskLevel] }}>
                  {patient.riskLevel?.toUpperCase()} RISK
                </span>}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '12px 22px', borderBottom: '1px solid var(--border)' }}>
          {(['overview', 'vitals', 'history', 'prescriptions'] as const).map(t => (
            <button key={t} className={`filter-chip ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <button onClick={() => setShowAlert(true)} style={{ marginLeft: 'auto', background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,.3)', color: '#f59e0b', borderRadius: 99, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>
            🔔 Send Alert
          </button>
        </div>

        <div className="modal-body" style={{ marginTop: 0, paddingTop: 16 }}>
          {tab === 'overview' && (
            <>
              {patient.allergies?.length ? <div className="allergy-box">⚠️ Allergies: {patient.allergies.join(', ')}</div> : null}
              <div className="vitals-summary-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                {[
                  { type: 'bp', icon: '❤️', label: 'Blood Pressure', val: latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '—', sub: bpCat?.label, color: bpCat?.color },
                  { type: 'glucose', icon: '🩸', label: 'Glucose', val: vitals.find(v => v.type === 'glucose')?.value || '—', sub: 'mmol/L' },
                  { type: 'pulse', icon: '💓', label: 'Pulse', val: vitals.find(v => v.type === 'pulse')?.value || '—', sub: 'bpm' },
                  { type: 'weight', icon: '⚖️', label: 'Weight', val: vitals.find(v => v.type === 'weight')?.value || '—', sub: 'kg' },
                ].map(v => (
                  <div key={v.type} className="vs-card">
                    <span style={{ fontSize: 24 }}>{v.icon}</span>
                    <span style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--mono)', color: v.color || 'var(--text)' }}>{v.val}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>{v.label}</span>
                    {v.sub && <span style={{ fontSize: 10, fontWeight: 700, color: v.color || 'var(--muted)' }}>{v.sub}</span>}
                  </div>
                ))}
              </div>
              <div className="patient-detail-section">
                <div className="pd-section-title">📅 Visit Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {[
                    { label: 'Total Visits', val: patientAppts.length, color: 'var(--accent)' },
                    { label: 'Completed', val: patientAppts.filter(a => a.status === 'completed').length, color: '#10b981' },
                    { label: 'Prescriptions', val: allRx.length, color: 'var(--indigo)' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px', textAlign: 'center', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--mono)', color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {patient.emergencyContact && (
                <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
                  🆘 Emergency Contact: <strong>{patient.emergencyContact}</strong>
                </div>
              )}
            </>
          )}
          {tab === 'vitals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {vitals.length === 0 ? <div className="empty-sm">No vitals recorded yet.</div> : vitals.slice(0, 12).map(v => (
                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{v.type === 'bp' ? 'Blood Pressure' : v.type}</span>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{fmtDate(v.recordedAt)}</div>
                    {v.note && <div style={{ fontSize: 11, color: 'var(--text-2)', fontStyle: 'italic' }}>{v.note}</div>}
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 18, fontFamily: 'var(--mono)', color: v.type === 'bp' && v.systolic ? bpCategory(v.systolic, v.diastolic!).color : 'var(--text)' }}>
                    {v.type === 'bp' ? `${v.systolic}/${v.diastolic}` : v.value} <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{v.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
          {tab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {patientAppts.length === 0 ? <div className="empty-sm">No shared appointments.</div> : patientAppts.map(a => {
                const sc = statusCfg[a.status];
                return (
                  <div key={a.id} style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{a.specialty || 'Consultation'}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{fmtDate(a.date)}</div>
                        {a.patientNotes && <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-2)', marginTop: 3 }}>"{a.patientNotes}"</div>}
                      </div>
                      <span className="status-pill" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </div>
                    {a.notes && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-2)', background: 'var(--white)', borderRadius: 8, padding: '8px 10px', border: '1px solid var(--border)' }}>📝 {a.notes}</div>}
                    {a.prescriptions?.length ? (
                      <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {a.prescriptions.map((rx, i) => <span key={i} style={{ background: 'var(--indigo-dim)', color: 'var(--indigo)', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>💊 {rx.medication}</span>)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
          {tab === 'prescriptions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allRx.length === 0 ? <div className="empty-sm">No prescriptions yet.</div> : allRx.map((rx, i) => (
                <div key={i} className="rx-row" style={{ padding: '12px 14px' }}>
                  <div>
                    <div className="rx-name">💊 {rx.medication}</div>
                    <div className="rx-detail">{rx.dosage} · {rx.frequency} · {rx.duration}</div>
                    {rx.instructions && <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>📌 {rx.instructions}</div>}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right' }}>{rx.addedAt ? new Date(rx.addedAt).toLocaleDateString() : '—'}</div>
                </div>
              ))}
            </div>
          )}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
      {showAlert && <AlertModal doctorId={doctorId} patient={patient} onClose={() => setShowAlert(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// PANELS
// ─────────────────────────────────────────────

function ChatPanel({ doctorId, patients }: { doctorId: string; patients: PatientRecord[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    patients.forEach(p => {
      const threadId = [doctorId, p.uid].sort().join('_');
      const unsub = onSnapshot(
        query(collection(db, 'messages'), where('threadId', '==', threadId), where('read', '==', false), where('senderRole', '==', 'patient')),
        snap => setUnreadCounts(prev => ({ ...prev, [p.uid]: snap.size }))
      );
      return unsub;
    });
  }, [patients, doctorId]);

  useEffect(() => {
    if (!selectedId) return;
    const threadId = [doctorId, selectedId].sort().join('_');
    const unsub = onSnapshot(
      query(collection(db, 'messages'), where('threadId', '==', threadId), orderBy('timestamp', 'asc')),
      async snap => {
        setMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
        snap.docs.filter(d => !d.data().read && d.data().senderRole === 'patient')
          .forEach(d => updateDoc(d.ref, { read: true }));
      }
    );
    return () => unsub();
  }, [selectedId, doctorId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || !selectedId) return;
    const threadId = [doctorId, selectedId].sort().join('_');
    await addDoc(collection(db, 'messages'), {
      threadId, text: input, senderId: doctorId, senderRole: 'doctor',
      timestamp: serverTimestamp(), read: false,
    });
    setInput('');
  };

  const selectedPatient = patients.find(p => p.uid === selectedId);
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="chat-shell">
      <div className="chat-sidebar">
        <div className="chat-sidebar-hd">
          💬 Conversations
          {totalUnread > 0 && <span className="sb-badge" style={{ marginLeft: 8 }}>{totalUnread}</span>}
        </div>
        {patients.length === 0 ? <div className="empty-sm" style={{ padding: 16 }}>No patients yet.</div> : (
          patients.map(p => (
            <button key={p.uid} className={`chat-patient-btn ${selectedId === p.uid ? 'active' : ''}`} onClick={() => setSelectedId(p.uid)}>
              <div className="chat-patient-ava">{p.name[0]}</div>
              <div className="chat-patient-info">
                <span className="chat-patient-name">{p.name}</span>
                <span className="chat-patient-sub">{p.condition || p.email}</span>
              </div>
              {unreadCounts[p.uid] > 0 && <span className="sb-badge">{unreadCounts[p.uid]}</span>}
            </button>
          ))
        )}
      </div>
      <div className="chat-area">
        {!selectedId ? (
          <div className="chat-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Select a patient to message</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Secure, real-time messaging with your patients.</p>
          </div>
        ) : (
          <>
            <div className="chat-area-hd">
              <div className="chat-patient-ava">{selectedPatient?.name[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedPatient?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{selectedPatient?.condition || 'Patient'}</div>
              </div>
            </div>
            <div className="chat-feed">
              {msgs.length === 0 && <div className="empty-sm" style={{ padding: 20 }}>No messages yet. Say hello 👋</div>}
              {msgs.map(m => (
                <div key={m.id} className={`msg-bubble-wrap ${m.senderId === doctorId ? 'mine' : 'theirs'}`}>
                  <div className={`msg-bubble ${m.senderId === doctorId ? 'msg-mine' : 'msg-theirs'}`}>
                    <div className="msg-sender">{m.senderRole === 'doctor' ? 'You' : selectedPatient?.name}</div>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="chat-input-row">
              <input className="chat-inp" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message…" />
              <button className="chat-send" onClick={send}>↑</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ActiveConsultationsPanel({ doctorId, doctor, appointments }: {
  doctorId: string; doctor: DoctorProfile; appointments: Appointment[];
}) {
  const router = useRouter();
  const [starting, setStarting] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<Record<string, Consultation>>({});
  const [showRx, setShowRx] = useState<{ cId: string; aId: string; existing: Prescription[] } | null>(null);
  const [showNotes, setShowNotes] = useState<{ cId: string; aId: string; notes: string } | null>(null);
  const [showLab, setShowLab] = useState<Appointment | null>(null);
  const [showReferral, setShowReferral] = useState<Appointment | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'consultations'), where('doctorId', '==', doctorId), where('status', '==', 'active')),
      snap => {
        const map: Record<string, Consultation> = {};
        snap.docs.forEach(d => { map[d.data().appointmentId] = { id: d.id, ...d.data() } as Consultation; });
        setConsultations(map);
      }
    );
    return () => unsub();
  }, [doctorId]);

  const startConsultation = async (appt: Appointment) => {
    setStarting(appt.id);
    try {
      const consultationId = uuidv4();
      await setDoc(doc(db, 'consultations', consultationId), {
        appointmentId: appt.id, doctorId: appt.doctorId, patientId: appt.patientId,
        status: 'active', prescriptions: [], notes: '', startedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'appointments', appt.id), { status: 'active', consultationId });
      await addDoc(collection(db, 'alerts'), {
        patientId: appt.patientId, doctorId, type: 'general',
        title: '🟢 Your Consultation Has Started',
        message: `Dr. ${doctor.name} has started your consultation. Please join now.`,
        read: false, createdAt: serverTimestamp(),
      });
      router.push(`/dashboard/consultation/${consultationId}`);
    } catch (e) { console.error(e); alert('Failed to start session.'); }
    setStarting(null);
  };

  const endConsultation = async (appt: Appointment) => {
    if (!confirm('End this consultation?')) return;
    const c = consultations[appt.id];
    if (!c) return;
    await updateDoc(doc(db, 'consultations', c.id), { status: 'completed', endedAt: serverTimestamp() });
    await updateDoc(doc(db, 'appointments', appt.id), { status: 'completed' });
    await addDoc(collection(db, 'alerts'), {
      patientId: appt.patientId, doctorId, type: 'general',
      title: '✅ Consultation Complete',
      message: `Your consultation with Dr. ${doctor.name} has been completed. View your notes and prescriptions in your dashboard.`,
      read: false, createdAt: serverTimestamp(),
    });
  };

  const cancelAppointment = async (appt: Appointment) => {
    if (!confirm(`Cancel appointment for ${appt.patientName}?`)) return;
    await updateDoc(doc(db, 'appointments', appt.id), { status: 'cancelled' });
    await addDoc(collection(db, 'alerts'), {
      patientId: appt.patientId, doctorId, type: 'general',
      title: '❌ Appointment Cancelled',
      message: `Your appointment with Dr. ${doctor.name} has been cancelled. Please rebook at your convenience.`,
      read: false, createdAt: serverTimestamp(),
    });
  };

  const active = appointments.filter(a => a.status === 'active');
  const upcoming = appointments.filter(a => a.status === 'booked').sort((a, b) => {
    const da = a.date?.toDate ? a.date.toDate() : new Date(a.date);
    const db2 = b.date?.toDate ? b.date.toDate() : new Date(b.date);
    return da - db2;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {active.length > 0 && (
        <div className="panel active-sessions-panel">
          <div className="panel-hd">
            <div className="panel-title"><span className="live-dot-sm" /> Active Sessions ({active.length})</div>
          </div>
          {active.map(appt => {
            const c = consultations[appt.id];
            return (
              <div key={appt.id} className="active-session-card">
                <div className="as-left">
                  <div className="as-ava">{(appt.patientName || 'P')[0]}</div>
                  <div>
                    <div className="as-name">{appt.patientName || 'Patient'}</div>
                    <div className="as-sub">{appt.specialty}</div>
                    {appt.patientNotes && <div className="as-concern">"{appt.patientNotes}"</div>}
                    {appt.patientPhone && <div style={{ fontSize: 11, color: 'var(--muted)' }}>📞 {appt.patientPhone}</div>}
                  </div>
                </div>
                <div className="as-actions">
                  {c && (
                    <>
                      <button className="btn-action" onClick={() => setShowRx({ cId: c.id, aId: appt.id, existing: c.prescriptions })}>💊 Rx</button>
                      <button className="btn-action" onClick={() => setShowNotes({ cId: c.id, aId: appt.id, notes: c.notes })}>📝 Notes</button>
                      <button className="btn-action" onClick={() => setShowLab(appt)}>🧪 Labs</button>
                      <button className="btn-action" onClick={() => setShowReferral(appt)}>📋 Refer</button>
                    </>
                  )}
                  <button className="btn-join-live" onClick={() => router.push(`/dashboard/consultation/${c?.id || ''}`)}>🎥 Rejoin</button>
                  <button className="btn-end" onClick={() => endConsultation(appt)}>End</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">📋 Appointment Queue</div>
          <span className="count-badge">{upcoming.length} waiting</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty-sm">
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            <p>Queue is clear</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map((appt, idx) => (
              <div key={appt.id} className="queue-card">
                <div className="queue-left">
                  <div style={{ position: 'relative' }}>
                    <div className="queue-ava">{(appt.patientName || 'P')[0]}</div>
                    {idx === 0 && <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, background: 'var(--amber)', borderRadius: '50%', border: '2px solid white', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</div>}
                  </div>
                  <div>
                    <div className="queue-name">{appt.patientName || 'Patient'}</div>
                    <div className="queue-specialty">{appt.specialty || 'Consultation'}</div>
                    <div className="queue-date">{fmtDate(appt.date)}</div>
                    {appt.patientPhone && <div style={{ fontSize: 11, color: 'var(--muted)' }}>📞 {appt.patientPhone}</div>}
                    {appt.patientNotes && <div className="queue-concern">💬 "{appt.patientNotes}"</div>}
                  </div>
                </div>
                <div className="queue-right">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className="payment-pill" style={{ background: appt.paymentStatus === 'paid' ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)', color: appt.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                      {appt.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}{appt.amount ? ` · KES ${appt.amount.toLocaleString()}` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-end" onClick={() => cancelAppointment(appt)} style={{ padding: '6px 10px', fontSize: 11 }}>Cancel</button>
                    <button className="btn-start" onClick={() => startConsultation(appt)} disabled={starting === appt.id}>
                      {starting === appt.id ? 'Starting…' : '▶ Start Session'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRx && <PrescriptionModal consultationId={showRx.cId} appointmentId={showRx.aId} existing={showRx.existing} onClose={() => setShowRx(null)} />}
      {showNotes && <NotesModal consultationId={showNotes.cId} appointmentId={showNotes.aId} currentNotes={showNotes.notes} onClose={() => setShowNotes(null)} />}
      {showLab && <LabOrderModal doctorId={doctorId} appointment={showLab} onClose={() => setShowLab(null)} />}
      {showReferral && <ReferralModal doctor={doctor} appointment={showReferral} onClose={() => setShowReferral(null)} />}
    </div>
  );
}

function PatientsPanel({ doctorId, appointments }: { doctorId: string; appointments: Appointment[] }) {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selected, setSelected] = useState<PatientRecord | null>(null);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    const ids = [...new Set(appointments.map(a => a.patientId))];
    if (!ids.length) return;
    Promise.all(ids.map(id => getDoc(doc(db, 'users', id)))).then(snaps => {
      setPatients(snaps.filter(s => s.exists()).map(s => ({ uid: s.id, ...s.data() } as PatientRecord)));
    });
  }, [appointments]);

  const filtered = patients.filter(p => {
    const matchSearch = !search || `${p.name} ${p.email} ${p.condition}`.toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterRisk === 'all' || p.riskLevel === filterRisk;
    return matchSearch && matchRisk;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">👥 My Patients</div>
          <span className="count-badge">{patients.length} total</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
            <input className="search-inp" style={{ paddingLeft: 36 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, condition…" />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'high', 'medium', 'low'] as const).map(r => (
              <button key={r} className={`filter-chip ${filterRisk === r ? 'active' : ''}`} onClick={() => setFilterRisk(r)} style={filterRisk !== r && r !== 'all' ? { borderColor: `${riskColor[r as keyof typeof riskColor]}50`, color: riskColor[r as keyof typeof riskColor] } : {}}>
                {r === 'all' ? 'All' : `${r.charAt(0).toUpperCase() + r.slice(1)} Risk`}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-sm">
            <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
            <p>{search ? 'No patients match your search.' : 'No patients yet.'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12 }}>
            {filtered.map(p => {
              const patientAppts = appointments.filter(a => a.patientId === p.uid);
              const last = patientAppts[0];
              return (
                <div key={p.uid} className="patient-card" onClick={() => setSelected(p)}>
                  <div className="pc-top">
                    <div style={{ position: 'relative' }}>
                      <div className="pc-ava">{p.name[0]}</div>
                      {p.riskLevel && p.riskLevel !== 'low' && (
                        <div style={{ position: 'absolute', top: -3, right: -3, width: 12, height: 12, background: riskColor[p.riskLevel], borderRadius: '50%', border: '2px solid white' }} />
                      )}
                    </div>
                    <div>
                      <div className="pc-name">{p.name}</div>
                      <div className="pc-email">{p.email}</div>
                    </div>
                  </div>
                  <div className="pc-chips">
                    {p.bloodGroup && <span className="pc-chip blood">{p.bloodGroup}</span>}
                    {p.condition && <span className="pc-chip cond">{p.condition}</span>}
                    {p.age && <span className="pc-chip">{p.age}y</span>}
                    {p.gender && <span className="pc-chip">{p.gender}</span>}
                  </div>
                  {p.allergies?.length ? <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700 }}>⚠️ {p.allergies.join(', ')}</div> : null}
                  {last && <div className="pc-last">Last: {fmtShort(last.date)} · <span style={{ color: statusCfg[last.status]?.color }}>{statusCfg[last.status]?.label}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="pc-count">{patientAppts.length} visit{patientAppts.length !== 1 ? 's' : ''}</div>
                    {p.phone && <div style={{ fontSize: 11, color: 'var(--muted)' }}>📞 {p.phone}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selected && <PatientDetailModal patient={selected} doctorId={doctorId} appointments={appointments} onClose={() => setSelected(null)} />}
    </div>
  );
}

function HistoryPanel({ appointments, doctor }: { appointments: Appointment[]; doctor: DoctorProfile }) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [showRx, setShowRx] = useState<Appointment | null>(null);
  const [search, setSearch] = useState('');
  const filtered = appointments.filter(a => {
    const matchStatus = filter === 'all' ? a.status !== 'active' && a.status !== 'booked' : a.status === filter;
    const matchSearch = !search || `${a.patientName} ${a.specialty}`.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="panel">
      <div className="panel-hd">
        <div className="panel-title">🗂️ Appointment History</div>
        <span className="count-badge">{filtered.length} records</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <input className="search-inp" style={{ paddingLeft: 12 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, specialty…" />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'completed', 'cancelled'] as const).map(f => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-sm">No records found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(appt => {
            const sc = statusCfg[appt.status] || statusCfg.booked;
            return (
              <div key={appt.id} className="appt-card">
                <div className="appt-left">
                  <div className="appt-icon-box">{appt.status === 'completed' ? '✅' : '❌'}</div>
                  <div>
                    <div className="appt-spec">{appt.patientName || 'Patient'}</div>
                    <div className="appt-dr">{appt.specialty || 'Consultation'}</div>
                    <div className="appt-date">{fmtDate(appt.date)}</div>
                    {appt.patientNotes && <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>"{appt.patientNotes}"</div>}
                  </div>
                </div>
                <div className="appt-right">
                  {appt.amount && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--mono)' }}>KES {appt.amount.toLocaleString()}</span>}
                  <span className="status-pill" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                  {appt.status === 'completed' && (
                    <button className="btn-records" onClick={() => setShowRx(appt)}>📄 Records</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showRx && (
        <div className="overlay" onClick={() => setShowRx(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-hd">
              <div>
                <h3 className="modal-ht">Consultation Records</h3>
                <p className="modal-hs">{showRx.patientName} · {fmtDate(showRx.date)}</p>
              </div>
              <button className="modal-close" onClick={() => setShowRx(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="patient-detail-section">
                <div className="pd-section-title">📝 Clinical Notes</div>
                {showRx.notes ? <p className="rec-text">{showRx.notes}</p> : <p className="rec-empty">No notes recorded.</p>}
              </div>
              <div className="patient-detail-section">
                <div className="pd-section-title">💊 Prescriptions ({showRx.prescriptions?.length || 0})</div>
                {showRx.prescriptions?.length ? showRx.prescriptions.map((rx, i) => (
                  <div key={i} className="rx-row" style={{ marginBottom: 6 }}>
                    <div><div className="rx-name">💊 {rx.medication}</div><div className="rx-detail">{rx.dosage} · {rx.frequency} · {rx.duration}</div></div>
                  </div>
                )) : <p className="rec-empty">No prescriptions.</p>}
              </div>
              <button className="btn-secondary" onClick={() => setShowRx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EarningsPanel({ appointments }: { appointments: Appointment[] }) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const paid = appointments.filter(a => a.paymentStatus === 'paid');
  const total = paid.reduce((s, a) => s + (a.amount || 0), 0);
  const pending = appointments.filter(a => a.paymentStatus !== 'paid' && a.status !== 'cancelled').reduce((s, a) => s + (a.amount || 0), 0);
  const now = new Date();
  const thisMonth = paid.filter(a => {
    const d = a.date?.toDate ? a.date.toDate() : new Date(a.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, a) => s + (a.amount || 0), 0);

  const byMonth: Record<string, number> = {};
  paid.forEach(a => {
    const d = a.date?.toDate ? a.date.toDate() : new Date(a.date);
    const key = d.toLocaleDateString('en-KE', { month: 'short', year: 'numeric' });
    byMonth[key] = (byMonth[key] || 0) + (a.amount || 0);
  });
  const months = Object.entries(byMonth).slice(-6);
  const maxVal = Math.max(...months.map(([, v]) => v), 1);
  const avgSession = paid.length ? Math.round(total / paid.length) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { icon: '💰', label: 'Total Earned', val: `KES ${total.toLocaleString()}`, color: 'var(--green)' },
          { icon: '📅', label: 'This Month', val: `KES ${thisMonth.toLocaleString()}`, color: 'var(--accent)' },
          { icon: '⏳', label: 'Pending', val: `KES ${pending.toLocaleString()}`, color: 'var(--amber)' },
          { icon: '📊', label: 'Avg / Session', val: `KES ${avgSession.toLocaleString()}`, color: 'var(--indigo)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <div><div className="stat-val" style={{ color: s.color, fontSize: 18 }}>{s.val}</div><div className="stat-lbl">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-hd"><div className="panel-title">📊 Revenue by Month</div></div>
        {months.length === 0 ? <div className="empty-sm">No revenue data yet.</div> : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 140, padding: '0 4px' }}>
            {months.map(([m, v]) => (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}>
                <div style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}</div>
                <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', background: 'linear-gradient(180deg, var(--accent), rgba(16,185,129,0.3))', borderRadius: '6px 6px 0 0', height: `${(v / maxVal) * 90}%`, minHeight: 4, transition: 'height .6s ease' }} />
                </div>
                <div style={{ fontSize: 9, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{m}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-hd"><div className="panel-title">🧾 Recent Transactions</div></div>
        {paid.length === 0 ? <div className="empty-sm">No transactions yet.</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {paid.slice(0, 12).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{a.patientName || 'Patient'}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{a.specialty} · {fmtDate(a.date)}</div>
                </div>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--green)', fontFamily: 'var(--mono)' }}>+ KES {(a.amount || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ServicesPanel({ doctor, services }: { doctor: DoctorProfile; services: Service[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const toggle = async (svc: Service) => await updateDoc(doc(db, 'services', svc.id), { isAvailable: !svc.isAvailable });
  const remove = async (svc: Service) => {
    if (!confirm(`Delete "${svc.specialty}" service?`)) return;
    await deleteDoc(doc(db, 'services', svc.id));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">🏥 My Services</div>
          <button className="btn-sm-accent" onClick={() => setShowCreate(true)}>+ New Service</button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
          {services.filter(s => s.isAvailable).length} of {services.length} services visible to patients.
        </p>
        {services.length === 0 ? (
          <div className="empty-sm">
            <div style={{ fontSize: 40, marginBottom: 10 }}>🏥</div>
            <p>No services yet. Create one so patients can find and book you.</p>
            <button className="btn-sm-accent" style={{ marginTop: 14 }} onClick={() => setShowCreate(true)}>+ Create First Service</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {services.map(svc => (
              <div key={svc.id} className={`svc-manage-card ${!svc.isAvailable ? 'svc-paused' : ''}`}>
                <div className="svc-mc-hd">
                  <div className="svc-mc-title">{svc.specialty}</div>
                  <button className={`avail-toggle ${svc.isAvailable ? 'on' : 'off'}`} onClick={() => toggle(svc)}>
                    {svc.isAvailable ? '● Live' : 'Paused'}
                  </button>
                </div>
                <div className="svc-mc-price">KES {svc.price?.toLocaleString()}</div>
                <div className="svc-mc-meta">
                  <span>🏥 {svc.clinic}</span>
                  <span>⏱ {svc.duration} min</span>
                  {svc.location && <span>📍 {svc.location}</span>}
                  {svc.yearsExperience && <span>⭐ {svc.yearsExperience}y exp</span>}
                </div>
                {svc.tags?.length ? <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{svc.tags.map(t => <span key={t} className="svc-tag">{t}</span>)}</div> : null}
                {svc.description && <p className="svc-desc-text">{svc.description}</p>}
                <div className="svc-mc-actions">
                  <button className="btn-edit" onClick={() => setEditing(svc)}>✏️ Edit</button>
                  <button className="btn-delete" onClick={() => remove(svc)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {(showCreate || editing) && (
        <ServiceModal doctor={doctor} existing={editing || undefined} onClose={() => { setShowCreate(false); setEditing(null); }} />
      )}
    </div>
  );
}

function ReferralsPanel({ doctorId }: { doctorId: string }) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'referrals'), where('fromDoctorId', '==', doctorId), orderBy('createdAt', 'desc')),
      snap => setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Referral)))
    );
    return () => unsub();
  }, [doctorId]);

  const urgencyColor = { routine: '#10b981', urgent: '#f59e0b', emergency: '#ef4444' };

  return (
    <div className="panel">
      <div className="panel-hd">
        <div className="panel-title">📋 My Referrals</div>
        <span className="count-badge">{referrals.length} total</span>
      </div>
      {referrals.length === 0 ? (
        <div className="empty-sm">
          <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
          <p>No referrals issued yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {referrals.map(r => (
            <div key={r.id} style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.patientName || 'Patient'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>→ {r.specialty}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>{fmtDate(r.createdAt)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6 }}>{r.reason}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <span style={{ background: `${urgencyColor[r.urgency]}20`, color: urgencyColor[r.urgency], borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                    {r.urgency.toUpperCase()}
                  </span>
                  <span style={{ background: r.status === 'pending' ? 'rgba(245,158,11,.1)' : 'rgba(16,185,129,.1)', color: r.status === 'pending' ? '#f59e0b' : '#10b981', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                    {r.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ doctor, onUpdated }: { doctor: DoctorProfile; onUpdated: () => void }) {
  const [form, setForm] = useState({
    name: doctor.name || '', specialty: doctor.specialty || '', clinic: doctor.clinic || '',
    phone: doctor.phone || '', licenseNumber: doctor.licenseNumber || '', bio: doctor.bio || '',
    location: doctor.location || '', yearsExperience: doctor.yearsExperience?.toString() || '',
    languages: doctor.languages?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const save = async () => {
    setSaving(true);
    await updateDoc(doc(db, 'users', doctor.uid), {
      ...form, yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
      languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
    });
    setSaved(true); setTimeout(() => setSaved(false), 2500);
    onUpdated(); setSaving(false);
  };
  return (
    <div className="panel" style={{ maxWidth: 700 }}>
      <div className="panel-hd">
        <div className="panel-title">⚙️ Profile & Settings</div>
        {saved && <span style={{ color: 'var(--green)', fontSize: 13, fontWeight: 700 }}>✓ Saved!</span>}
      </div>
      <div className="form-grid-2" style={{ gap: 14 }}>
        {[
          { k: 'name', label: 'Full Name', ph: 'Dr. Jane Mwangi' },
          { k: 'specialty', label: 'Specialty', ph: 'e.g. Cardiology' },
          { k: 'clinic', label: 'Primary Clinic', ph: 'e.g. Nairobi Heart Centre' },
          { k: 'phone', label: 'Phone', ph: '+254 7xx xxx xxx' },
          { k: 'licenseNumber', label: 'Medical License No.', ph: 'e.g. ML-12345' },
          { k: 'location', label: 'Location', ph: 'e.g. Nairobi, Kenya' },
          { k: 'yearsExperience', label: 'Years Experience', ph: '12' },
          { k: 'languages', label: 'Languages (comma-separated)', ph: 'English, Swahili' },
        ].map(field => (
          <div key={field.k} className="field-col">
            <label className="field-lbl">{field.label}</label>
            <input className="field-inp" value={(form as any)[field.k]} onChange={f(field.k)} placeholder={field.ph} />
          </div>
        ))}
        <div className="field-col form-full">
          <label className="field-lbl">Bio / Professional Summary</label>
          <textarea className="field-ta" rows={4} value={form.bio} onChange={f('bio')} placeholder="Tell patients about your experience and approach…" />
        </div>
      </div>
      <button className="btn-cta" onClick={save} disabled={saving} style={{ marginTop: 16, maxWidth: 220 }}>
        {saving ? 'Saving…' : '💾 Save Profile'}
      </button>
    </div>
  );
}

function DiseaseToolsPanel({ appointments }: { appointments: Appointment[] }) {
  const conditions = ['All', ...Array.from(new Set(appointments.map(a => a.specialty).filter(Boolean)))];
  const [condition, setCondition] = useState('All');
  const tools: Record<string, Array<{ icon: string; label: string; desc: string; color: string }>> = {
    Cardiology: [
      { icon: '❤️', label: 'BP Population Trends', desc: 'View BP trends across all hypertension patients', color: '#dc2626' },
      { icon: '⚡', label: 'High BP Alerts', desc: 'Auto-alert when patient BP exceeds threshold', color: '#f59e0b' },
      { icon: '💊', label: 'Medication Adherence', desc: 'Track antihypertensive compliance', color: '#2563eb' },
      { icon: '📋', label: 'JNC Protocol Check', desc: 'Validate treatment against guidelines', color: '#7c3aed' },
    ],
    Diabetes: [
      { icon: '🩸', label: 'Glucose Monitor', desc: 'Track HbA1c and daily readings per patient', color: '#d97706' },
      { icon: '📈', label: 'HbA1c Tracker', desc: 'Long-term glycaemic control charts', color: '#2563eb' },
      { icon: '💉', label: 'Insulin Log Review', desc: 'Review patient insulin logs and adjust doses', color: '#7c3aed' },
      { icon: '🍱', label: 'Diet Compliance', desc: 'Review patient carb and meal logs', color: '#22c55e' },
    ],
    Respiratory: [
      { icon: '🌬️', label: 'Peak Flow Monitor', desc: 'Track peak flow readings and trends', color: '#2563eb' },
      { icon: '📓', label: 'Trigger Analysis', desc: 'Identify and map common triggers', color: '#f59e0b' },
      { icon: '💊', label: 'Inhaler Adherence', desc: 'Monitor preventive inhaler use', color: '#dc2626' },
      { icon: '🌍', label: 'Air Quality Alerts', desc: 'Notify high-risk patients on bad air days', color: '#059669' },
    ],
    General: [
      { icon: '📊', label: 'Population Health', desc: 'Overview of your patient cohort health', color: '#6366f1' },
      { icon: '🔔', label: 'Alert Rules Engine', desc: 'Create automated patient alert rules', color: '#f59e0b' },
      { icon: '📋', label: 'Protocol Library', desc: 'Clinical decision support and protocols', color: '#10b981' },
      { icon: '🎯', label: 'Care Gap Analysis', desc: 'Identify patients due for follow-up', color: '#dc2626' },
    ],
  };
  const allTools = Object.values(tools).flat();
  const currentTools = condition !== 'All' ? (tools[condition] ?? allTools.slice(0, 8)) : allTools.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">🛠️ Disease Management Tools</div>
          <select value={condition} onChange={e => setCondition(e.target.value)} className="field-inp" style={{ width: 'auto', padding: '6px 12px' }}>
            {['All', 'Cardiology', 'Diabetes', 'Respiratory', 'General'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>Clinical decision support tools for your specialty.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {currentTools.map(t => (
            <button key={t.label} style={{
              background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 14, padding: 16,
              cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: 'var(--font)',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = t.color; (e.currentTarget as HTMLElement).style.background = '#eff6ff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg)'; }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function DoctorDashboard() {
  const router = useRouter();
  const [authDone, setAuthDone] = useState(false);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'patients' | 'history' | 'messages' | 'services' | 'earnings' | 'referrals' | 'tools' | 'settings'>('overview');
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.replace('/login'); return; }
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.data() || {};
      if (data.role !== 'doctor') { router.replace('/dashboard/patient'); return; }
      setDoctor({
        uid: user.uid, name: data.name || user.displayName || 'Doctor',
        email: data.email || user.email || '', specialty: data.specialty || '',
        clinic: data.clinic, licenseNumber: data.licenseNumber, phone: data.phone,
        bio: data.bio, yearsExperience: data.yearsExperience, languages: data.languages,
        location: data.location, photoURL: data.photoURL, rating: data.rating,
      });
      setAuthDone(true);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!doctor) return;
    const unsub = onSnapshot(
      query(collection(db, 'appointments'), where('doctorId', '==', doctor.uid), orderBy('date', 'desc')),
      async snap => {
        const appts = await Promise.all(snap.docs.map(async d => {
          const a = { id: d.id, ...d.data() } as Appointment;
          if (a.patientId && !a.patientName) {
            try {
              const ps = await getDoc(doc(db, 'users', a.patientId));
              if (ps.exists()) { a.patientName = ps.data().name; a.patientEmail = ps.data().email; a.patientPhone = ps.data().phone; }
            } catch {}
          }
          return a;
        }));
        setAppointments(appts);
      }
    );
    return () => unsub();
  }, [doctor]);

  useEffect(() => {
    if (!doctor) return;
    const unsub = onSnapshot(
      query(collection(db, 'services'), where('doctorId', '==', doctor.uid), orderBy('createdAt', 'desc')),
      snap => setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)))
    );
    return () => unsub();
  }, [doctor]);

  const todayAppts = appointments.filter(a => isToday(a.date));
  const activeAppts = appointments.filter(a => a.status === 'active');
  const upcomingAppts = appointments.filter(a => a.status === 'booked');
  const completedAppts = appointments.filter(a => a.status === 'completed');
  const totalEarned = appointments.filter(a => a.paymentStatus === 'paid').reduce((s, a) => s + (a.amount || 0), 0);
  const patientIds = [...new Set(appointments.map(a => a.patientId))];

  const tabs = [
    { id: 'overview', icon: '🏠', label: 'Overview' },
    { id: 'queue', icon: '📋', label: 'Queue', badge: upcomingAppts.length + activeAppts.length },
    { id: 'patients', icon: '👥', label: 'Patients' },
    { id: 'history', icon: '🗂️', label: 'History' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'referrals', icon: '📋', label: 'Referrals' },
    { id: 'tools', icon: '🛠️', label: 'Tools' },
    { id: 'services', icon: '🏥', label: 'Services' },
    { id: 'earnings', icon: '💰', label: 'Earnings' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  const chatPatients = [...new Set(appointments.map(a => a.patientId))].map(id => {
    const a = appointments.find(x => x.patientId === id);
    return { uid: id, name: a?.patientName || 'Patient', email: a?.patientEmail || '', condition: a?.specialty } as PatientRecord;
  });

  if (!authDone || !doctor) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontWeight: 600 }}>Loading your dashboard…</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#f0f4f8; --white:#fff; --surface:#fff; --border:#e2e9f3;
          --text:#0d1b2a; --text-2:#4a5568; --muted:#8fa3bd;
          --accent:#0aaa76; --accent-2:#0dc98e; --accent-dim:rgba(10,170,118,.09);
          --green:#0aaa76; --green-dim:rgba(10,170,118,.09);
          --amber:#f59e0b; --amber-dim:rgba(245,158,11,.09);
          --red:#e53e3e; --red-dim:rgba(229,62,62,.09);
          --indigo:#5a67d8; --indigo-dim:rgba(90,103,216,.09);
          --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace;
          --r:16px; --r-sm:10px;
          --shadow:0 1px 4px rgba(0,0,0,.06); --shadow-md:0 4px 18px rgba(0,0,0,.09); --shadow-lg:0 16px 48px rgba(0,0,0,.14);
        }
        body{background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes pulse-g{0%,100%{box-shadow:0 0 0 0 rgba(10,170,118,.4)}50%{box-shadow:0 0 0 8px rgba(10,170,118,0)}}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:99px}

        .shell{display:flex;min-height:100vh}
        .sidebar{width:236px;background:var(--white);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0;z-index:30}
        .main{flex:1;overflow-y:auto;padding-bottom:80px}

        .sb-brand{padding:20px 18px 14px;border-bottom:1px solid var(--border)}
        .sb-logo{display:flex;align-items:center;gap:10px}
        .sb-icon{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#0aaa76,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 14px rgba(10,170,118,.28)}
        .sb-name{font-size:18px;font-weight:800;letter-spacing:-.4px}
        .sb-sub{font-size:9px;color:var(--accent);font-weight:700;letter-spacing:1.6px;text-transform:uppercase;margin-top:1px}

        .sb-profile{padding:14px 18px;border-bottom:1px solid var(--border)}
        .sb-ava{width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,#0aaa76,#06b6d4);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:19px;color:#fff;margin-bottom:8px}
        .sb-pname{font-weight:700;font-size:14px}
        .sb-psub{font-size:11px;color:var(--accent);font-weight:600;margin-top:1px}
        .sb-pemail{font-size:11px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

        .sb-nav{flex:1;padding:10px 8px;display:flex;flex-direction:column;gap:2px;overflow-y:auto}
        .sb-item{display:flex;align-items:center;gap:8px;padding:9px 11px;border-radius:var(--r-sm);border:none;background:transparent;color:var(--text-2);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font);width:100%;text-align:left;transition:all .14s;position:relative}
        .sb-item:hover{background:var(--bg);color:var(--text)}
        .sb-item.active{background:var(--accent-dim);color:var(--accent)}
        .sb-item-icon{font-size:15px;flex-shrink:0}
        .sb-badge{margin-left:auto;background:var(--red);color:#fff;border-radius:99px;font-size:10px;font-weight:700;padding:1px 6px;min-width:18px;text-align:center}

        .sb-footer{padding:10px 8px;border-top:1px solid var(--border)}
        .sb-signout{display:flex;align-items:center;gap:8px;width:100%;padding:9px 11px;background:transparent;border:1px solid var(--border);border-radius:var(--r-sm);color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .14s}
        .sb-signout:hover{border-color:var(--red);color:var(--red);background:var(--red-dim)}

        .top-bar{background:var(--white);border-bottom:1px solid var(--border);padding:12px 26px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:20;box-shadow:var(--shadow)}
        .tb-left{display:flex;flex-direction:column}
        .tb-greet{font-size:11px;color:var(--muted);font-weight:500}
        .tb-name{font-size:19px;font-weight:800;letter-spacing:-.3px}
        .tb-right{display:flex;gap:8px;align-items:center}
        .tb-btn{display:flex;align-items:center;gap:6px;padding:7px 13px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--white);color:var(--text-2);font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
        .tb-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}
        .tb-btn-green{background:var(--accent);color:#fff;border-color:transparent;box-shadow:0 4px 14px rgba(10,170,118,.28)}
        .tb-btn-green:hover{background:#0dc98e;color:#fff}

        .content{padding:22px 26px;animation:fadeUp .22s ease;max-width:1400px}

        .hero-card{background:linear-gradient(135deg,#0d1b2a 0%,#0f3d2e 55%,#0a5741 100%);border-radius:20px;padding:24px 28px;color:#fff;position:relative;overflow:hidden;margin-bottom:18px}
        .hero-card::before{content:'';position:absolute;top:-50px;right:-50px;width:220px;height:220px;border-radius:50%;background:rgba(10,170,118,.12);pointer-events:none}
        .hero-card::after{content:'';position:absolute;bottom:-60px;left:25%;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none}
        .hero-greet{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.6px;opacity:.65;margin-bottom:4px}
        .hero-name{font-size:22px;font-weight:800;letter-spacing:-.4px}
        .hero-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
        .hero-chip{background:rgba(255,255,255,.14);border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;backdrop-filter:blur(8px)}
        .hero-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}
        .hero-stat{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 14px;text-align:center;backdrop-filter:blur(8px)}
        .hero-stat-val{font-size:22px;font-weight:900;font-family:var(--mono)}
        .hero-stat-label{font-size:10px;opacity:.65;margin-top:2px;font-weight:600}

        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .stat-card{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow);transition:all .18s}
        .stat-card:hover{border-color:var(--accent);box-shadow:var(--shadow-md);transform:translateY(-1px)}
        .stat-icon{font-size:28px;flex-shrink:0}
        .stat-val{font-size:22px;font-weight:900;font-family:var(--mono)}
        .stat-lbl{font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px}

        .panel{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:18px 20px;box-shadow:var(--shadow)}
        .panel-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
        .panel-title{font-size:14px;font-weight:800;display:flex;align-items:center;gap:6px}
        .count-badge{background:var(--accent-dim);color:var(--accent);border-radius:99px;font-size:11px;font-weight:700;padding:2px 8px}
        .btn-sm-accent{background:var(--accent);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
        .btn-sm-accent:hover{background:#0dc98e}
        .empty-sm{text-align:center;padding:28px 0;color:var(--muted);font-size:13px}

        .active-sessions-panel{border-color:rgba(10,170,118,.4);background:rgba(10,170,118,.025)}
        .live-dot-sm{width:8px;height:8px;border-radius:50%;background:var(--green);display:inline-block;animation:pulse-g 1.5s infinite;margin-right:4px}
        .active-session-card{background:rgba(10,170,118,.06);border:1.5px solid rgba(10,170,118,.25);border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:10px}
        .as-left{display:flex;align-items:center;gap:10px}
        .as-ava{width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,#0aaa76,#06b6d4);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;color:#fff;flex-shrink:0}
        .as-name{font-weight:700;font-size:14px}
        .as-sub{font-size:12px;color:var(--muted);margin-top:2px}
        .as-concern{font-size:11px;color:var(--text-2);font-style:italic;margin-top:3px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .as-actions{display:flex;gap:7px;flex-wrap:wrap}
        .btn-action{background:var(--white);border:1px solid var(--border);border-radius:8px;padding:7px 11px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
        .btn-action:hover{border-color:var(--accent);color:var(--accent)}
        .btn-join-live{background:var(--green);color:#000;border:none;border-radius:8px;padding:8px 13px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
        .btn-join-live:hover{background:#0dc98e}
        .btn-end{background:var(--red-dim);color:var(--red);border:1px solid rgba(229,62,62,.25);border-radius:8px;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
        .btn-end:hover{background:var(--red);color:#fff}

        .queue-card{background:var(--bg);border:1.5px solid var(--border);border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;transition:border-color .18s}
        .queue-card:hover{border-color:var(--accent)}
        .queue-left{display:flex;align-items:flex-start;gap:10px}
        .queue-ava{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#5a67d8,#7c3aed);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#fff;flex-shrink:0}
        .queue-name{font-weight:700;font-size:14px}
        .queue-specialty{font-size:12px;color:var(--text-2);margin-top:2px}
        .queue-date{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:2px}
        .queue-concern{font-size:11px;color:var(--text-2);font-style:italic;margin-top:4px}
        .queue-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
        .payment-pill{font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px}
        .btn-start{background:linear-gradient(135deg,#0aaa76,#06b6d4);color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s;box-shadow:0 4px 14px rgba(10,170,118,.28)}
        .btn-start:hover{box-shadow:0 6px 20px rgba(10,170,118,.4)}
        .btn-start:disabled{opacity:.5;cursor:not-allowed}

        .appt-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r);padding:14px 18px;display:flex;justify-content:space-between;align-items:center;gap:14px;transition:border-color .18s}
        .appt-card:hover{border-color:var(--accent)}
        .appt-left{display:flex;align-items:center;gap:10px}
        .appt-icon-box{width:42px;height:42px;border-radius:11px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .appt-spec{font-weight:700;font-size:14px}
        .appt-dr{font-size:12px;color:var(--text-2);margin-top:2px}
        .appt-date{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:2px}
        .appt-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .status-pill{display:inline-flex;align-items:center;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700}
        .btn-records{background:transparent;border:1px solid var(--border);color:var(--text-2);border-radius:8px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .14s}
        .btn-records:hover{border-color:var(--accent);color:var(--accent)}

        .filter-chip{padding:6px 14px;border-radius:99px;border:1.5px solid var(--border);background:var(--white);color:var(--text-2);font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
        .filter-chip.active{background:var(--accent);border-color:var(--accent);color:#fff}
        .filter-chip:not(.active):hover{border-color:var(--accent);color:var(--accent)}

        .patient-card{background:var(--white);border:1.5px solid var(--border);border-radius:16px;padding:16px;cursor:pointer;transition:all .18s;display:flex;flex-direction:column;gap:10px}
        .patient-card:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:var(--shadow-md)}
        .pc-top{display:flex;align-items:center;gap:10px}
        .pc-ava{width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,#5a67d8,#06b6d4);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;color:#fff;flex-shrink:0}
        .pc-name{font-weight:700;font-size:14px}
        .pc-email{font-size:11px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px}
        .pc-chips{display:flex;gap:5px;flex-wrap:wrap}
        .pc-chip{font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:var(--bg);color:var(--text-2);border:1px solid var(--border)}
        .pc-chip.blood{background:rgba(229,62,62,.08);color:var(--red);border-color:rgba(229,62,62,.2)}
        .pc-chip.cond{background:var(--accent-dim);color:var(--accent);border-color:rgba(10,170,118,.2)}
        .pc-last{font-size:11px;color:var(--muted)}
        .pc-count{font-size:11px;font-weight:700;color:var(--accent)}
        .risk-chip{font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;margin-left:8px}

        .info-chip{background:var(--bg);border:1px solid var(--border);border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700}
        .allergy-box{background:var(--red-dim);border:1px solid rgba(229,62,62,.25);border-radius:10px;padding:9px 12px;font-size:12px;font-weight:700;color:var(--red)}
        .patient-detail-section{display:flex;flex-direction:column;gap:8px}
        .pd-section-title{font-size:13px;font-weight:800;padding-bottom:8px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:5px}
        .vitals-summary-grid{display:grid;gap:8px}
        .vs-card{background:var(--bg);border-radius:12px;padding:12px 8px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;border:1px solid var(--border)}
        .rec-text{font-size:13px;color:var(--text-2);line-height:1.7;background:var(--bg);border-radius:var(--r-sm);padding:12px}
        .rec-empty{font-size:13px;color:var(--muted);font-style:italic}
        .rx-row{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--bg);border-radius:8px;gap:8px}
        .rx-name{font-size:13px;font-weight:700}
        .rx-detail{font-size:11px;color:var(--muted)}

        .svc-manage-card{background:var(--white);border:1.5px solid var(--border);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;transition:all .18s}
        .svc-manage-card:hover{border-color:var(--accent);box-shadow:var(--shadow-md)}
        .svc-paused{opacity:.55}
        .svc-mc-hd{display:flex;justify-content:space-between;align-items:center}
        .svc-mc-title{font-weight:800;font-size:16px}
        .avail-toggle{padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer;border:none;font-family:var(--font);transition:all .14s}
        .avail-toggle.on{background:var(--green-dim);color:var(--green)}
        .avail-toggle.off{background:var(--red-dim);color:var(--red)}
        .svc-mc-price{font-size:22px;font-weight:900;color:var(--accent);font-family:var(--mono)}
        .svc-mc-meta{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--text-2)}
        .svc-tag{background:var(--indigo-dim);color:var(--indigo);border-radius:99px;padding:2px 8px;font-size:11px;font-weight:700}
        .svc-desc-text{font-size:12px;color:var(--muted);line-height:1.6}
        .svc-mc-actions{display:flex;gap:8px;margin-top:4px}
        .btn-edit{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
        .btn-edit:hover{border-color:var(--accent);color:var(--accent)}
        .btn-delete{background:var(--red-dim);border:1px solid rgba(229,62,62,.2);color:var(--red);border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
        .btn-delete:hover{background:var(--red);color:#fff}

        .chat-shell{display:grid;grid-template-columns:260px 1fr;background:var(--white);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;min-height:520px;box-shadow:var(--shadow)}
        .chat-sidebar{border-right:1px solid var(--border);overflow-y:auto;display:flex;flex-direction:column}
        .chat-sidebar-hd{padding:16px 16px 12px;border-bottom:1px solid var(--border);font-size:14px;font-weight:800;display:flex;align-items:center}
        .chat-patient-btn{display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;border:none;background:transparent;cursor:pointer;text-align:left;transition:background .12s;border-bottom:1px solid var(--border)}
        .chat-patient-btn:hover{background:var(--bg)}
        .chat-patient-btn.active{background:var(--accent-dim)}
        .chat-patient-ava{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#0aaa76,#06b6d4);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;flex-shrink:0}
        .chat-patient-info{display:flex;flex-direction:column;overflow:hidden;flex:1}
        .chat-patient-name{font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .chat-patient-sub{font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .chat-area{display:flex;flex-direction:column}
        .chat-area-hd{padding:13px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--bg)}
        .chat-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--muted);text-align:center}
        .chat-feed{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:14px 18px;max-height:400px}
        .msg-bubble-wrap{display:flex}
        .msg-bubble-wrap.mine{justify-content:flex-end}
        .msg-bubble-wrap.theirs{justify-content:flex-start}
        .msg-bubble{max-width:78%;padding:9px 13px;border-radius:13px;font-size:13px;line-height:1.5}
        .msg-mine{background:linear-gradient(135deg,#0aaa76,#06b6d4);color:#fff;border-bottom-right-radius:4px}
        .msg-theirs{background:var(--bg);color:var(--text);border:1px solid var(--border);border-bottom-left-radius:4px}
        .msg-sender{font-size:9px;font-weight:800;opacity:.7;margin-bottom:3px;text-transform:uppercase;letter-spacing:.5px}
        .chat-input-row{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border)}
        .chat-inp{flex:1;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r-sm);padding:10px 13px;color:var(--text);font-size:13px;font-family:var(--font);outline:none}
        .chat-inp:focus{border-color:var(--accent)}
        .chat-send{background:var(--accent);border:none;color:#fff;padding:10px 16px;border-radius:var(--r-sm);font-weight:700;cursor:pointer;font-size:16px;transition:all .14s}
        .chat-send:hover{background:#0dc98e}

        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(6px)}
        .modal-box{background:var(--white);border:1px solid var(--border);border-radius:22px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:fadeUp .2s ease}
        .modal-hd{padding:22px 22px 0;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}
        .modal-ht{font-size:18px;font-weight:800}
        .modal-hs{font-size:12px;color:var(--muted);margin-top:3px}
        .modal-close{background:var(--bg);border:none;color:var(--text-2);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:14px;flex-shrink:0}
        .modal-body{padding:0 22px 22px;display:flex;flex-direction:column;gap:14px}

        .form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .form-full{grid-column:1/-1}
        .field-col{display:flex;flex-direction:column;gap:5px}
        .field-lbl{font-size:10px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.8px}
        .field-inp{background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r-sm);padding:10px 12px;color:var(--text);font-size:14px;font-family:var(--font);outline:none;transition:border-color .14s;width:100%}
        .field-inp:focus{border-color:var(--accent)}
        .field-ta{background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r-sm);padding:10px 12px;color:var(--text);font-size:14px;font-family:var(--font);outline:none;transition:border-color .14s;width:100%;resize:vertical}
        .field-ta:focus{border-color:var(--accent)}
        .err-box{background:var(--red-dim);border:1px solid rgba(229,62,62,.3);border-radius:var(--r-sm);padding:8px 12px;font-size:12px;color:var(--red);border-left:3px solid var(--red)}
        .btn-cta{background:linear-gradient(135deg,#0aaa76,#06b6d4);color:#fff;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);width:100%;transition:all .14s;box-shadow:0 4px 16px rgba(10,170,118,.28)}
        .btn-cta:hover{box-shadow:0 6px 24px rgba(10,170,118,.4)}
        .btn-cta:disabled{opacity:.5;cursor:not-allowed}
        .btn-secondary{background:transparent;border:1.5px solid var(--border);color:var(--text-2);border-radius:12px;padding:11px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font);width:100%;transition:all .14s}
        .btn-secondary:hover{border-color:var(--text);color:var(--text)}
        .search-inp{width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r-sm);padding:10px 12px;color:var(--text);font-size:14px;font-family:var(--font);outline:none;transition:border-color .14s}
        .search-inp:focus{border-color:var(--accent)}

        .mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--white);border-top:1px solid var(--border);padding:6px 0 env(safe-area-inset-bottom,6px);z-index:40;box-shadow:0 -4px 20px rgba(0,0,0,.06)}
        .mob-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;background:transparent;border:none;color:var(--muted);font-size:10px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .14s}
        .mob-btn.active{color:var(--accent)}
        .mob-icon{font-size:20px}

        .overview-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}

        @media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,1fr)}.hero-stats{grid-template-columns:repeat(2,1fr)}.overview-grid{grid-template-columns:1fr}.vitals-summary-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:768px){.sidebar{display:none}.content{padding:14px}.top-bar{padding:12px 14px}.tb-name{font-size:15px}.stats-grid{grid-template-columns:repeat(2,1fr);gap:8px}.chat-shell{grid-template-columns:1fr}.chat-sidebar{display:none}.mobile-nav{display:flex}.form-grid-2{grid-template-columns:1fr}.hero-stats{grid-template-columns:repeat(2,1fr)}.as-concern{display:none}}
      `}</style>

      <div className="shell">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sb-logo">
              <div className="sb-icon">⚕️</div>
              <div>
                <div className="sb-name">AMEXAN</div>
                <div className="sb-sub">Doctor Portal</div>
              </div>
            </div>
          </div>
          <div className="sb-profile">
            <div className="sb-ava">{doctor.name[0]}</div>
            <div className="sb-pname">Dr. {doctor.name}</div>
            <div className="sb-psub">{doctor.specialty || 'Specialist'}</div>
            <div className="sb-pemail">{doctor.email}</div>
          </div>
          <nav className="sb-nav">
            {tabs.map(t => (
              <button key={t.id} className={`sb-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id as any)}>
                <span className="sb-item-icon">{t.icon}</span>
                {t.label}
                {t.badge !== undefined && t.badge > 0 && <span className="sb-badge">{t.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="sb-footer">
            <button className="sb-signout" onClick={() => { signOut(auth); router.replace('/login'); }}>
              <span>🚪</span> Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">
          <div className="top-bar">
            <div className="tb-left">
              <span className="tb-greet">{getGreeting()},</span>
              <span className="tb-name">Dr. {doctor.name.split(' ')[0]} 👋</span>
            </div>
            <div className="tb-right">
              {activeAppts.length > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--green)', background: 'var(--green-dim)', padding: '6px 12px', borderRadius: 99 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-g 1.5s infinite' }} />
                  {activeAppts.length} Active Session{activeAppts.length > 1 ? 's' : ''}
                </span>
              )}
              <button className="tb-btn tb-btn-green" onClick={() => setActiveTab('queue')}>📋 Queue ({upcomingAppts.length})</button>
              <button className="tb-btn" onClick={() => setActiveTab('services')}>+ Service</button>
            </div>
          </div>

          <div className="content">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="hero-card">
                  <div className="hero-greet">{getGreeting()}</div>
                  <div className="hero-name">Dr. {doctor.name}</div>
                  <div className="hero-chips">
                    {doctor.specialty && <span className="hero-chip">🩺 {doctor.specialty}</span>}
                    {doctor.clinic && <span className="hero-chip">🏥 {doctor.clinic}</span>}
                    {doctor.location && <span className="hero-chip">📍 {doctor.location}</span>}
                    {doctor.yearsExperience && <span className="hero-chip">⭐ {doctor.yearsExperience}y exp</span>}
                    {doctor.licenseNumber && <span className="hero-chip">🪪 {doctor.licenseNumber}</span>}
                  </div>
                  <div className="hero-stats">
                    <div className="hero-stat"><div className="hero-stat-val">{todayAppts.length}</div><div className="hero-stat-label">Today</div></div>
                    <div className="hero-stat"><div className="hero-stat-val" style={{ color: '#4ade80' }}>{activeAppts.length}</div><div className="hero-stat-label">Active Now</div></div>
                    <div className="hero-stat"><div className="hero-stat-val">{patientIds.length}</div><div className="hero-stat-label">Patients</div></div>
                    <div className="hero-stat"><div className="hero-stat-val">{services.filter(s => s.isAvailable).length}</div><div className="hero-stat-label">Live Services</div></div>
                  </div>
                </div>

                <div className="stats-grid">
                  {[
                    { icon: '📅', label: 'All Appointments', val: appointments.length, color: 'var(--text)' },
                    { icon: '⏳', label: 'In Queue', val: upcomingAppts.length, color: 'var(--indigo)' },
                    { icon: '✅', label: 'Completed', val: completedAppts.length, color: 'var(--green)' },
                    { icon: '💰', label: 'Total Earned', val: `KES ${totalEarned.toLocaleString()}`, color: 'var(--amber)', small: true },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <span className="stat-icon">{s.icon}</span>
                      <div>
                        <div className="stat-val" style={{ color: s.color, fontSize: s.small ? 15 : undefined }}>{s.val}</div>
                        <div className="stat-lbl">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {activeAppts.length > 0 && (
                  <ActiveConsultationsPanel doctorId={doctor.uid} doctor={doctor} appointments={activeAppts} />
                )}

                <div className="overview-grid">
                  <div className="panel">
                    <div className="panel-hd">
                      <div className="panel-title">⏳ Today's Bookings</div>
                      <button className="btn-sm-accent" onClick={() => setActiveTab('queue')}>Manage →</button>
                    </div>
                    {todayAppts.filter(a => a.status === 'booked').length === 0 ? (
                      <div className="empty-sm"><div style={{ fontSize: 28, marginBottom: 6 }}>📭</div><p>No bookings today yet</p></div>
                    ) : todayAppts.filter(a => a.status === 'booked').slice(0, 4).map(a => (
                      <div key={a.id} className="appt-card" style={{ marginBottom: 8 }}>
                        <div className="appt-left">
                          <div className="appt-icon-box">📅</div>
                          <div>
                            <div className="appt-spec">{a.patientName || 'Patient'}</div>
                            <div className="appt-dr">{a.specialty}</div>
                            <div className="appt-date">{fmtTime(a.date)}</div>
                          </div>
                        </div>
                        <span className="status-pill" style={{ background: statusCfg.booked.bg, color: statusCfg.booked.color }}>{statusCfg.booked.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="panel">
                    <div className="panel-hd">
                      <div className="panel-title">🏥 Live Services</div>
                      <button className="btn-sm-accent" onClick={() => setActiveTab('services')}>Manage →</button>
                    </div>
                    {services.filter(s => s.isAvailable).length === 0 ? (
                      <div className="empty-sm"><div style={{ fontSize: 28, marginBottom: 6 }}>🏥</div><p>No live services. Add one so patients can find you.</p></div>
                    ) : services.filter(s => s.isAvailable).slice(0, 4).map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{s.specialty}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.clinic} · {s.duration}min</div>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>KES {s.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent history preview */}
                <div className="panel">
                  <div className="panel-hd">
                    <div className="panel-title">🗂️ Recent Completed</div>
                    <button className="btn-sm-accent" onClick={() => setActiveTab('history')}>Full History →</button>
                  </div>
                  {completedAppts.slice(0, 4).length === 0 ? (
                    <div className="empty-sm">No completed appointments yet.</div>
                  ) : completedAppts.slice(0, 4).map(a => (
                    <div key={a.id} className="appt-card" style={{ marginBottom: 8 }}>
                      <div className="appt-left">
                        <div className="appt-icon-box">✅</div>
                        <div>
                          <div className="appt-spec">{a.patientName || 'Patient'}</div>
                          <div className="appt-dr">{a.specialty}</div>
                          <div className="appt-date">{fmtDate(a.date)}</div>
                        </div>
                      </div>
                      <div className="appt-right">
                        {a.amount && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--mono)' }}>KES {a.amount.toLocaleString()}</span>}
                        <span className="status-pill" style={{ background: statusCfg.completed.bg, color: statusCfg.completed.color }}>{statusCfg.completed.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'queue' && (
              <ActiveConsultationsPanel
                doctorId={doctor.uid}
                doctor={doctor}
                appointments={[...activeAppts, ...upcomingAppts]}
              />
            )}

            {activeTab === 'patients' && <PatientsPanel doctorId={doctor.uid} appointments={appointments} />}

            {activeTab === 'history' && <HistoryPanel appointments={appointments} doctor={doctor} />}

            {activeTab === 'messages' && <ChatPanel doctorId={doctor.uid} patients={chatPatients} />}

            {activeTab === 'referrals' && <ReferralsPanel doctorId={doctor.uid} />}

            {activeTab === 'tools' && <DiseaseToolsPanel appointments={appointments} />}

            {activeTab === 'services' && <ServicesPanel doctor={doctor} services={services} />}

            {activeTab === 'earnings' && <EarningsPanel appointments={appointments} />}

            {activeTab === 'settings' && (
              <SettingsPanel
                doctor={doctor}
                onUpdated={async () => {
                  const snap = await getDoc(doc(db, 'users', doctor.uid));
                  const data = snap.data() || {};
                  setDoctor(prev => prev ? { ...prev, ...data } : prev);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      <nav className="mobile-nav">
        {[
          { id: 'overview', icon: '🏠', label: 'Home' },
          { id: 'queue', icon: '📋', label: 'Queue' },
          { id: 'patients', icon: '👥', label: 'Patients' },
          { id: 'messages', icon: '💬', label: 'Chat' },
          { id: 'settings', icon: '⚙️', label: 'Settings' },
        ].map(t => (
          <button key={t.id} className={`mob-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id as any)}>
            <span className="mob-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}