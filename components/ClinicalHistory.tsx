'use client';

/**
 * CLINICAL HISTORY SYSTEM — Full-Stack Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles: Biodata · Past Medical · Family · Social · Surgical · Medications
 * Features:
 *   • Real-time Firestore sync (both patient + doctor can update)
 *   • Change attribution (who updated + when)
 *   • Push notifications to patient on doctor edits (and vice versa)
 *   • Consent-gated sharing with appointment doctors
 *   • Emergency access card (shows critical info instantly)
 *   • Medication dosage change tracking with audit trail
 *   • QR-code shareable emergency profile
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, addDoc, serverTimestamp, query,
  where, orderBy, getDocs, Timestamp, arrayUnion
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QRCodeSVG } from 'qrcode.react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'patient' | 'doctor';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;          // oral, IV, topical, etc.
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  condition?: string;
  active: boolean;
  notes?: string;
  dosageHistory: DosageChange[];
}

interface DosageChange {
  previousDosage: string;
  newDosage: string;
  changedBy: string;
  changedByRole: UserRole;
  changedAt: string;
  reason?: string;
}

interface MedicalCondition {
  id: string;
  name: string;
  icdCode?: string;
  diagnosedDate?: string;
  diagnosedBy?: string;
  status: 'active' | 'resolved' | 'managed' | 'chronic';
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

interface Allergy {
  id: string;
  allergen: string;
  type: 'drug' | 'food' | 'environmental' | 'other';
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
  confirmed: boolean;
  notes?: string;
}

interface Surgery {
  id: string;
  procedure: string;
  date: string;
  hospital?: string;
  surgeon?: string;
  indication?: string;
  complications?: string;
  outcome: 'successful' | 'complicated' | 'unknown';
  notes?: string;
}

interface FamilyHistory {
  id: string;
  relation: string;
  condition: string;
  ageOfOnset?: number;
  deceased?: boolean;
  notes?: string;
}

interface SocialHistory {
  smoking: { status: 'never' | 'former' | 'current'; packsPerDay?: number; yearsSmoked?: number; quitDate?: string };
  alcohol: { status: 'never' | 'occasional' | 'moderate' | 'heavy'; unitsPerWeek?: number };
  drugs: { status: 'never' | 'former' | 'current'; substances?: string };
  occupation?: string;
  maritalStatus?: string;
  exerciseFrequency?: string;
  diet?: string;
  caffeine?: string;
  stressLevel?: 'low' | 'moderate' | 'high';
  livingSituation?: string;
  educationLevel?: string;
}

interface Biodata {
  // Personal
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationalId?: string;
  bloodGroup: string;
  rhFactor: string;
  // Contact
  phone: string;
  email: string;
  address: string;
  county?: string;
  // Emergency
  emergencyContact: string;
  emergencyRelation: string;
  emergencyPhone: string;
  // Medical identifiers
  nhifNumber?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  universalId: string;
  // Physical
  heightCm?: number;
  weightKg?: number;
}

interface HistoryAudit {
  id: string;
  section: string;
  field?: string;
  previousValue?: string;
  newValue?: string;
  changedBy: string;
  changedByRole: UserRole;
  changedByName: string;
  changedAt: any;
  note?: string;
}

interface ClinicalRecord {
  patientId: string;
  biodata: Partial<Biodata>;
  conditions: MedicalCondition[];
  allergies: Allergy[];
  medications: Medication[];
  surgeries: Surgery[];
  familyHistory: FamilyHistory[];
  socialHistory: Partial<SocialHistory>;
  consentedDoctors: string[];       // doctor IDs allowed to view full record
  emergencyConsent: boolean;        // allow any ER doctor to view
  lastUpdatedBy: string;
  lastUpdatedByName: string;
  lastUpdatedByRole: UserRole;
  lastUpdatedAt: any;
  createdAt: any;
}

export interface ClinicalHistoryProps {
  patientId: string;
  patientName: string;
  viewerRole: UserRole;
  viewerId: string;
  viewerName: string;
  /** If doctor: their ID to check consent */
  appointmentId?: string;
  /** Compact view for sidebar/profile panels */
  compact?: boolean;
  /** Emergency mode — shows critical info only */
  emergency?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);
const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const SEVERITY_COLOR: Record<string, string> = {
  mild: '#22c55e', moderate: '#f59e0b', severe: '#ef4444', anaphylaxis: '#7c2d12',
};

const STATUS_COLOR: Record<string, string> = {
  active: '#3b82f6', resolved: '#22c55e', managed: '#f59e0b', chronic: '#a855f7',
};

const EMPTY_RECORD: Omit<ClinicalRecord, 'patientId' | 'createdAt'> = {
  biodata: {},
  conditions: [],
  allergies: [],
  medications: [],
  surgeries: [],
  familyHistory: [],
  socialHistory: {},
  consentedDoctors: [],
  emergencyConsent: true,
  lastUpdatedBy: '',
  lastUpdatedByName: '',
  lastUpdatedByRole: 'patient',
  lastUpdatedAt: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT + NOTIFICATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function logAudit(
  patientId: string,
  section: string,
  changedBy: string,
  changedByName: string,
  changedByRole: UserRole,
  note: string
) {
  await addDoc(collection(db, 'clinical_audits'), {
    patientId, section, changedBy, changedByName, changedByRole,
    changedAt: serverTimestamp(), note,
  });
}

async function notifyPatient(
  patientId: string,
  changedByName: string,
  changedByRole: UserRole,
  section: string
) {
  // Only notify patient when doctor makes change
  if (changedByRole !== 'doctor') return;
  await addDoc(collection(db, 'alerts'), {
    patientId,
    type: 'clinical_update',
    title: '📋 Medical Record Updated',
    body: `Dr. ${changedByName} updated your ${section}. Tap to review.`,
    severity: 'medium',
    read: false,
    createdAt: serverTimestamp(),
    actionUrl: '/dashboard/patient?tab=history',
  });
}

async function notifyDoctor(
  doctorId: string,
  patientName: string,
  section: string
) {
  await addDoc(collection(db, 'alerts'), {
    recipientId: doctorId,
    type: 'patient_update',
    title: '📋 Patient Updated Record',
    body: `${patientName} updated their ${section}. Review before next appointment.`,
    severity: 'low',
    read: false,
    createdAt: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Medication Card with dosage history ───────────────────────────────────
function MedicationCard({
  med, canEdit, onEdit, onDosageChange, onToggleActive
}: {
  med: Medication;
  canEdit: boolean;
  onEdit: () => void;
  onDosageChange: (newDosage: string, reason: string) => void;
  onToggleActive: () => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [changingDosage, setChangingDosage] = useState(false);
  const [newDosage, setNewDosage] = useState(med.dosage);
  const [reason, setReason] = useState('');

  return (
    <div className={`ch-med-card ${!med.active ? 'ch-med-inactive' : ''}`}>
      <div className="ch-med-hd">
        <div className="ch-med-icon">💊</div>
        <div className="ch-med-info">
          <div className="ch-med-name">{med.name}</div>
          <div className="ch-med-dosage">
            {med.dosage} · {med.frequency} · {med.route}
            {med.dosageHistory?.length > 0 && (
              <span className="ch-dosage-changed" title="Dosage has been changed">⚡ Modified</span>
            )}
          </div>
          {med.condition && <div className="ch-med-for">For: {med.condition}</div>}
          {med.prescribedBy && <div className="ch-med-by">Prescribed by Dr. {med.prescribedBy}</div>}
        </div>
        <div className="ch-med-badges">
          <span className={`ch-med-status ${med.active ? 'ch-status-active' : 'ch-status-stopped'}`}>
            {med.active ? '● Active' : '○ Stopped'}
          </span>
          {med.startDate && <span className="ch-med-date">Since {med.startDate}</span>}
        </div>
      </div>

      {canEdit && (
        <div className="ch-med-actions">
          <button className="ch-btn-xs" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? '▲' : '▼'} History ({med.dosageHistory?.length || 0})
          </button>
          <button className="ch-btn-xs ch-btn-warn" onClick={() => setChangingDosage(!changingDosage)}>
            💊 Change Dose
          </button>
          <button className="ch-btn-xs" onClick={onEdit}>✏️ Edit</button>
          <button className={`ch-btn-xs ${med.active ? 'ch-btn-danger' : 'ch-btn-success'}`} onClick={onToggleActive}>
            {med.active ? '⏸ Stop' : '▶ Resume'}
          </button>
        </div>
      )}

      {changingDosage && (
        <div className="ch-dosage-change-form">
          <div className="ch-form-row">
            <input className="ch-input" placeholder="New dosage (e.g. 10mg)" value={newDosage}
              onChange={e => setNewDosage(e.target.value)} />
            <input className="ch-input" placeholder="Reason for change" value={reason}
              onChange={e => setReason(e.target.value)} />
            <button className="ch-btn-primary ch-btn-sm" onClick={() => {
              onDosageChange(newDosage, reason);
              setChangingDosage(false);
            }}>Save Change</button>
          </div>
        </div>
      )}

      {showHistory && med.dosageHistory?.length > 0 && (
        <div className="ch-dosage-history">
          <div className="ch-history-label">Dosage Change History</div>
          {med.dosageHistory.map((h, i) => (
            <div key={i} className="ch-history-entry">
              <span className="ch-history-arrow">{h.previousDosage} → <strong>{h.newDosage}</strong></span>
              <span className="ch-history-meta">
                By {h.changedByRole === 'doctor' ? `Dr. ${h.changedBy}` : h.changedBy} · {h.changedAt}
                {h.reason && <span> · "{h.reason}"</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Emergency Card (shown to ER doctors) ─────────────────────────────────
function EmergencyCard({ record, patientName }: { record: Partial<ClinicalRecord>; patientName: string }) {
  const criticalAllergies = (record.allergies || []).filter(a => a.severity === 'anaphylaxis' || a.severity === 'severe');
  const activeMeds = (record.medications || []).filter(m => m.active);
  const activeConditions = (record.conditions || []).filter(c => c.status === 'active' || c.status === 'chronic');

  return (
    <div className="ch-emergency-card">
      <div className="ch-emergency-header">
        <div className="ch-emergency-pulse">🚨</div>
        <div>
          <div className="ch-emergency-title">EMERGENCY MEDICAL PROFILE</div>
          <div className="ch-emergency-name">{patientName}</div>
        </div>
        <div className="ch-emergency-blood">
          <div className="ch-blood-type">{record.biodata?.bloodGroup || '?'}{record.biodata?.rhFactor || ''}</div>
          <div className="ch-blood-label">Blood Type</div>
        </div>
      </div>

      <div className="ch-emergency-grid">
        {criticalAllergies.length > 0 && (
          <div className="ch-emergency-section ch-emergency-critical">
            <div className="ch-emergency-section-title">⚠️ CRITICAL ALLERGIES</div>
            {criticalAllergies.map(a => (
              <div key={a.id} className="ch-emergency-item">
                <strong>{a.allergen}</strong> — {a.reaction}
                <span className="ch-severity-badge" style={{ background: SEVERITY_COLOR[a.severity] + '30', color: SEVERITY_COLOR[a.severity] }}>
                  {a.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeConditions.length > 0 && (
          <div className="ch-emergency-section">
            <div className="ch-emergency-section-title">🏥 ACTIVE CONDITIONS</div>
            {activeConditions.map(c => (
              <div key={c.id} className="ch-emergency-item">
                {c.name} {c.icdCode && <span className="ch-icd">{c.icdCode}</span>}
              </div>
            ))}
          </div>
        )}

        {activeMeds.length > 0 && (
          <div className="ch-emergency-section">
            <div className="ch-emergency-section-title">💊 CURRENT MEDICATIONS</div>
            {activeMeds.map(m => (
              <div key={m.id} className="ch-emergency-item">
                <strong>{m.name}</strong> {m.dosage} · {m.frequency}
              </div>
            ))}
          </div>
        )}

        <div className="ch-emergency-section">
          <div className="ch-emergency-section-title">📞 EMERGENCY CONTACT</div>
          <div className="ch-emergency-item">
            {record.biodata?.emergencyContact || '—'} ({record.biodata?.emergencyRelation || '—'})
          </div>
          <div className="ch-emergency-item">
            📞 {record.biodata?.emergencyPhone || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ClinicalHistory({
  patientId,
  patientName,
  viewerRole,
  viewerId,
  viewerName,
  appointmentId,
  compact = false,
  emergency = false,
}: ClinicalHistoryProps) {
  const [record, setRecord] = useState<Partial<ClinicalRecord>>(EMPTY_RECORD);
  const [audits, setAudits] = useState<HistoryAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('biodata');
  const [hasConsent, setHasConsent] = useState(viewerRole === 'patient');
  const [showQR, setShowQR] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [editingCondition, setEditingCondition] = useState<MedicalCondition | null>(null);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
  const [editingFamily, setEditingFamily] = useState<FamilyHistory | null>(null);
  const [msg, setMsg] = useState('');
  const [consentGranted, setConsentGranted] = useState(false);

  const docRef = doc(db, 'clinical_records', patientId);

  // ── Real-time listener ─────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as ClinicalRecord;
        setRecord(data);
        // Check consent for doctor
        if (viewerRole === 'doctor') {
          setHasConsent(
            data.consentedDoctors?.includes(viewerId) || data.emergencyConsent
          );
        }
      } else {
        // Initialize empty record
        setDoc(docRef, {
          patientId,
          ...EMPTY_RECORD,
          createdAt: serverTimestamp(),
          lastUpdatedAt: serverTimestamp(),
        });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [patientId]);

  // ── Audit trail listener ───────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'clinical_audits'), where('patientId', '==', patientId), orderBy('changedAt', 'desc')),
      (snap) => setAudits(snap.docs.map(d => ({ id: d.id, ...d.data() } as HistoryAudit)))
    );
    return () => unsub();
  }, [patientId]);

  // ── Save helper ────────────────────────────────────────────────────────
  const saveSection = useCallback(async (section: string, data: any, note: string) => {
    setSaving(true);
    try {
      await updateDoc(docRef, {
        [section]: data,
        lastUpdatedBy: viewerId,
        lastUpdatedByName: viewerName,
        lastUpdatedByRole: viewerRole,
        lastUpdatedAt: serverTimestamp(),
      });
      await logAudit(patientId, section, viewerId, viewerName, viewerRole, note);
      if (viewerRole === 'doctor') {
        await notifyPatient(patientId, viewerName, viewerRole, section);
      } else {
        // Notify any consented doctors
        for (const docId of (record.consentedDoctors || [])) {
          await notifyDoctor(docId, patientName, section);
        }
      }
      setMsg('✅ Saved successfully');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg('❌ ' + e.message);
    }
    setSaving(false);
  }, [viewerId, viewerName, viewerRole, patientId, record, patientName]);

  // ── Grant consent to viewing doctor ───────────────────────────────────
  const grantConsent = async () => {
    if (viewerRole !== 'patient') return;
    const newList = arrayUnion(viewerId);
    await updateDoc(docRef, { consentedDoctors: newList });
    setConsentGranted(true);
  };

  // ── Medication handlers ────────────────────────────────────────────────
  const saveMedication = async (med: Medication) => {
    const meds = (record.medications || []);
    const idx = meds.findIndex(m => m.id === med.id);
    const updated = idx >= 0 ? meds.map(m => m.id === med.id ? med : m) : [...meds, med];
    await saveSection('medications', updated, `Updated medication: ${med.name}`);
    setEditingMed(null);
  };

  const changeDosage = async (medId: string, newDosage: string, reason: string) => {
    const meds = (record.medications || []);
    const updated = meds.map(m => {
      if (m.id !== medId) return m;
      const change: DosageChange = {
        previousDosage: m.dosage, newDosage,
        changedBy: viewerName, changedByRole: viewerRole,
        changedAt: new Date().toISOString(), reason,
      };
      return { ...m, dosage: newDosage, dosageHistory: [...(m.dosageHistory || []), change] };
    });
    await saveSection('medications', updated, `Dosage changed for ${meds.find(m => m.id === medId)?.name}`);
  };

  const toggleMedActive = async (medId: string) => {
    const updated = (record.medications || []).map(m =>
      m.id === medId ? { ...m, active: !m.active } : m
    );
    await saveSection('medications', updated, `Toggled active status for medication`);
  };

  // ── Condition handlers ────────────────────────────────────────────────
  const saveCondition = async (cond: MedicalCondition) => {
    const list = (record.conditions || []);
    const idx = list.findIndex(c => c.id === cond.id);
    const updated = idx >= 0 ? list.map(c => c.id === cond.id ? cond : c) : [...list, cond];
    await saveSection('conditions', updated, `Updated condition: ${cond.name}`);
    setEditingCondition(null);
  };

  // ── Allergy handlers ──────────────────────────────────────────────────
  const saveAllergy = async (allergy: Allergy) => {
    const list = (record.allergies || []);
    const idx = list.findIndex(a => a.id === allergy.id);
    const updated = idx >= 0 ? list.map(a => a.id === allergy.id ? allergy : a) : [...list, allergy];
    await saveSection('allergies', updated, `Updated allergy: ${allergy.allergen}`);
    setEditingAllergy(null);
  };

  // ── Surgery handlers ──────────────────────────────────────────────────
  const saveSurgery = async (surgery: Surgery) => {
    const list = (record.surgeries || []);
    const idx = list.findIndex(s => s.id === surgery.id);
    const updated = idx >= 0 ? list.map(s => s.id === surgery.id ? surgery : s) : [...list, surgery];
    await saveSection('surgeries', updated, `Updated surgery: ${surgery.procedure}`);
    setEditingSurgery(null);
  };

  // ── Family history handlers ───────────────────────────────────────────
  const saveFamily = async (entry: FamilyHistory) => {
    const list = (record.familyHistory || []);
    const idx = list.findIndex(f => f.id === entry.id);
    const updated = idx >= 0 ? list.map(f => f.id === entry.id ? entry : f) : [...list, entry];
    await saveSection('familyHistory', updated, `Updated family history`);
    setEditingFamily(null);
  };

  if (loading) return (
    <div className="ch-loading">
      <div className="ch-spinner" />
      <p>Loading medical records…</p>
    </div>
  );

  // Emergency view
  if (emergency) return (
    <div className="ch-wrap">
      <style>{CH_STYLES}</style>
      <EmergencyCard record={record} patientName={patientName} />
    </div>
  );

  // Consent wall for doctor
  if (viewerRole === 'doctor' && !hasConsent) return (
    <div className="ch-wrap">
      <style>{CH_STYLES}</style>
      <div className="ch-consent-wall">
        <div className="ch-consent-icon">🔒</div>
        <h3 className="ch-consent-title">Access Restricted</h3>
        <p className="ch-consent-body">
          This patient's medical records require their explicit consent before you can view them.
          During the consultation, ask the patient to grant access through their portal.
        </p>
        {record.emergencyConsent && (
          <div className="ch-consent-emergency">
            <strong>Emergency Access:</strong> Patient has enabled emergency access.
            In life-threatening situations, critical information is available below.
          </div>
        )}
        {record.emergencyConsent && <EmergencyCard record={record} patientName={patientName} />}
      </div>
    </div>
  );

  const canEdit = viewerRole === 'patient' || hasConsent;

  const sections = [
    { id: 'biodata', icon: '👤', label: 'Personal Info', count: Object.keys(record.biodata || {}).length },
    { id: 'conditions', icon: '🏥', label: 'Conditions', count: (record.conditions || []).length },
    { id: 'allergies', icon: '⚠️', label: 'Allergies', count: (record.allergies || []).length, alert: (record.allergies || []).some(a => a.severity === 'anaphylaxis') },
    { id: 'medications', icon: '💊', label: 'Medications', count: (record.medications || []).filter(m => m.active).length },
    { id: 'surgeries', icon: '🔬', label: 'Surgical Hx', count: (record.surgeries || []).length },
    { id: 'family', icon: '👨‍👩‍👦', label: 'Family Hx', count: (record.familyHistory || []).length },
    { id: 'social', icon: '🌍', label: 'Social Hx', count: Object.keys(record.socialHistory || {}).length },
    { id: 'audit', icon: '📋', label: 'Audit Trail', count: audits.length },
    { id: 'consent', icon: '🔐', label: 'Access & Sharing', count: (record.consentedDoctors || []).length },
    { id: 'emergency', icon: '🚨', label: 'Emergency Card', count: 0 },
  ];

  return (
    <div className="ch-wrap">
      <style>{CH_STYLES}</style>

      {/* Header */}
      <div className="ch-header">
        <div className="ch-header-left">
          <div className="ch-header-avatar">
            {patientName[0]}
          </div>
          <div>
            <div className="ch-header-name">{patientName}</div>
            <div className="ch-header-meta">
              {record.biodata?.universalId || patientId.slice(0, 12)}
              {record.biodata?.bloodGroup && (
                <span className="ch-blood-chip">
                  🩸 {record.biodata.bloodGroup}{record.biodata?.rhFactor}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="ch-header-right">
          {record.lastUpdatedAt && (
            <div className="ch-last-update">
              Last updated by <strong>{record.lastUpdatedByName}</strong>
              <span className="ch-update-role">({record.lastUpdatedByRole})</span>
              · {fmtDate(record.lastUpdatedAt)}
            </div>
          )}
          <button className="ch-btn-icon" onClick={() => setShowQR(!showQR)} title="QR Emergency Card">
            📱
          </button>
          {saving && <div className="ch-saving-badge">Saving…</div>}
        </div>
      </div>

      {/* Critical Allergies Banner */}
      {(record.allergies || []).some(a => a.severity === 'anaphylaxis') && (
        <div className="ch-critical-banner">
          ⚠️ CRITICAL: Anaphylaxis-level allergy — {
            (record.allergies || []).filter(a => a.severity === 'anaphylaxis').map(a => a.allergen).join(', ')
          }
        </div>
      )}

      {msg && <div className={`ch-msg ${msg.startsWith('✅') ? 'ch-msg-ok' : 'ch-msg-err'}`}>{msg}</div>}

      {/* QR Panel */}
      {showQR && (
        <div className="ch-qr-panel">
          <div className="ch-qr-inner">
            <QRCodeSVG
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/emergency/${patientId}`}
              size={120} bgColor="#fff" fgColor="#0f172a" level="H"
            />
            <div className="ch-qr-text">
              <strong>Emergency QR</strong>
              <p>Scan to access {patientName}'s emergency medical profile</p>
            </div>
          </div>
        </div>
      )}

      <div className="ch-layout">
        {/* Section Nav */}
        <nav className="ch-nav">
          {sections.map(s => (
            <button
              key={s.id}
              className={`ch-nav-item ${activeSection === s.id ? 'ch-nav-active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span className="ch-nav-icon">{s.icon}</span>
              <span className="ch-nav-label">{s.label}</span>
              {s.count > 0 && (
                <span className={`ch-nav-count ${s.alert ? 'ch-nav-count-alert' : ''}`}>{s.count}</span>
              )}
              {s.alert && <span className="ch-nav-alert-dot" />}
            </button>
          ))}
        </nav>

        {/* Section Content */}
        <div className="ch-content">

          {/* ── BIODATA ── */}
          {activeSection === 'biodata' && (
            <BiodataSection
              biodata={record.biodata || {}}
              canEdit={canEdit}
              onSave={(data) => saveSection('biodata', data, 'Updated personal information')}
              saving={saving}
            />
          )}

          {/* ── CONDITIONS ── */}
          {activeSection === 'conditions' && (
            <div className="ch-section">
              <div className="ch-section-hd">
                <div className="ch-section-title">Medical Conditions</div>
                {canEdit && (
                  <button className="ch-btn-primary ch-btn-sm"
                    onClick={() => setEditingCondition({ id: uid(), name: '', status: 'active', severity: 'moderate' })}>
                    + Add Condition
                  </button>
                )}
              </div>

              {editingCondition && (
                <ConditionForm
                  condition={editingCondition}
                  onChange={setEditingCondition}
                  onSave={() => saveCondition(editingCondition)}
                  onCancel={() => setEditingCondition(null)}
                  saving={saving}
                />
              )}

              {(record.conditions || []).length === 0 && !editingCondition ? (
                <div className="ch-empty">No medical conditions recorded.</div>
              ) : (
                <div className="ch-list">
                  {(record.conditions || []).map(cond => (
                    <div key={cond.id} className="ch-condition-card">
                      <div className="ch-condition-hd">
                        <span className="ch-condition-name">{cond.name}</span>
                        {cond.icdCode && <span className="ch-icd">{cond.icdCode}</span>}
                        <span className="ch-status-badge" style={{ background: STATUS_COLOR[cond.status] + '20', color: STATUS_COLOR[cond.status] }}>
                          {cond.status}
                        </span>
                        {cond.severity && <span className="ch-severity-badge" style={{ background: SEVERITY_COLOR[cond.severity] + '20', color: SEVERITY_COLOR[cond.severity] }}>
                          {cond.severity}
                        </span>}
                      </div>
                      <div className="ch-condition-meta">
                        {cond.diagnosedDate && `Diagnosed ${cond.diagnosedDate}`}
                        {cond.diagnosedBy && ` · By Dr. ${cond.diagnosedBy}`}
                      </div>
                      {cond.notes && <div className="ch-condition-notes">{cond.notes}</div>}
                      {canEdit && (
                        <button className="ch-btn-xs" onClick={() => setEditingCondition(cond)}>✏️ Edit</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ALLERGIES ── */}
          {activeSection === 'allergies' && (
            <div className="ch-section">
              <div className="ch-section-hd">
                <div className="ch-section-title">Allergies & Adverse Reactions</div>
                {canEdit && (
                  <button className="ch-btn-primary ch-btn-sm"
                    onClick={() => setEditingAllergy({ id: uid(), allergen: '', type: 'drug', reaction: '', severity: 'moderate', confirmed: true })}>
                    + Add Allergy
                  </button>
                )}
              </div>

              {editingAllergy && (
                <AllergyForm
                  allergy={editingAllergy}
                  onChange={setEditingAllergy}
                  onSave={() => saveAllergy(editingAllergy)}
                  onCancel={() => setEditingAllergy(null)}
                  saving={saving}
                />
              )}

              {(record.allergies || []).length === 0 && !editingAllergy ? (
                <div className="ch-empty">No known allergies recorded. <span style={{ color: '#94a3b8' }}>(NKDA if confirmed)</span></div>
              ) : (
                <div className="ch-list">
                  {(record.allergies || []).map(al => (
                    <div key={al.id} className="ch-allergy-card"
                      style={{ borderLeftColor: SEVERITY_COLOR[al.severity] }}>
                      <div className="ch-allergy-hd">
                        <span className="ch-allergy-name">{al.allergen}</span>
                        <span className="ch-allergy-type">({al.type})</span>
                        <span className="ch-severity-badge"
                          style={{ background: SEVERITY_COLOR[al.severity] + '25', color: SEVERITY_COLOR[al.severity] }}>
                          {al.severity === 'anaphylaxis' ? '🚨 ANAPHYLAXIS' : al.severity}
                        </span>
                        {al.confirmed && <span className="ch-confirmed-badge">✓ Confirmed</span>}
                      </div>
                      <div className="ch-allergy-reaction">Reaction: {al.reaction}</div>
                      {al.notes && <div className="ch-allergy-notes">{al.notes}</div>}
                      {canEdit && (
                        <button className="ch-btn-xs" onClick={() => setEditingAllergy(al)}>✏️ Edit</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MEDICATIONS ── */}
          {activeSection === 'medications' && (
            <div className="ch-section">
              <div className="ch-section-hd">
                <div className="ch-section-title">Medications</div>
                {canEdit && (
                  <button className="ch-btn-primary ch-btn-sm"
                    onClick={() => setEditingMed({
                      id: uid(), name: '', dosage: '', frequency: '', route: 'oral',
                      startDate: '', active: true, dosageHistory: [],
                    })}>
                    + Add Medication
                  </button>
                )}
              </div>

              {editingMed && (
                <MedicationForm
                  medication={editingMed}
                  onChange={setEditingMed}
                  onSave={() => saveMedication(editingMed)}
                  onCancel={() => setEditingMed(null)}
                  saving={saving}
                />
              )}

              {/* Active */}
              <div className="ch-med-group-label">Active</div>
              {(record.medications || []).filter(m => m.active).length === 0 && (
                <div className="ch-empty" style={{ marginBottom: 16 }}>No active medications.</div>
              )}
              {(record.medications || []).filter(m => m.active).map(med => (
                <MedicationCard
                  key={med.id} med={med} canEdit={canEdit}
                  onEdit={() => setEditingMed(med)}
                  onDosageChange={(dose, reason) => changeDosage(med.id, dose, reason)}
                  onToggleActive={() => toggleMedActive(med.id)}
                />
              ))}

              {/* Stopped */}
              {(record.medications || []).filter(m => !m.active).length > 0 && (
                <>
                  <div className="ch-med-group-label" style={{ marginTop: 20 }}>Stopped / Past</div>
                  {(record.medications || []).filter(m => !m.active).map(med => (
                    <MedicationCard
                      key={med.id} med={med} canEdit={canEdit}
                      onEdit={() => setEditingMed(med)}
                      onDosageChange={(dose, reason) => changeDosage(med.id, dose, reason)}
                      onToggleActive={() => toggleMedActive(med.id)}
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── SURGERIES ── */}
          {activeSection === 'surgeries' && (
            <div className="ch-section">
              <div className="ch-section-hd">
                <div className="ch-section-title">Surgical History</div>
                {canEdit && (
                  <button className="ch-btn-primary ch-btn-sm"
                    onClick={() => setEditingSurgery({ id: uid(), procedure: '', date: '', outcome: 'successful' })}>
                    + Add Procedure
                  </button>
                )}
              </div>

              {editingSurgery && (
                <SurgeryForm
                  surgery={editingSurgery}
                  onChange={setEditingSurgery}
                  onSave={() => saveSurgery(editingSurgery)}
                  onCancel={() => setEditingSurgery(null)}
                  saving={saving}
                />
              )}

              {(record.surgeries || []).length === 0 && !editingSurgery ? (
                <div className="ch-empty">No surgical history recorded.</div>
              ) : (
                <div className="ch-list">
                  {(record.surgeries || []).map(s => (
                    <div key={s.id} className="ch-surgery-card">
                      <div className="ch-surgery-hd">
                        <span className="ch-surgery-name">🔬 {s.procedure}</span>
                        <span className={`ch-surgery-outcome ch-outcome-${s.outcome}`}>{s.outcome}</span>
                      </div>
                      <div className="ch-surgery-meta">
                        {s.date && `Date: ${s.date}`}
                        {s.hospital && ` · ${s.hospital}`}
                        {s.surgeon && ` · Dr. ${s.surgeon}`}
                      </div>
                      {s.indication && <div className="ch-surgery-notes">Indication: {s.indication}</div>}
                      {s.complications && <div className="ch-surgery-notes" style={{ color: '#f87171' }}>Complications: {s.complications}</div>}
                      {canEdit && (
                        <button className="ch-btn-xs" onClick={() => setEditingSurgery(s)}>✏️ Edit</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FAMILY HISTORY ── */}
          {activeSection === 'family' && (
            <div className="ch-section">
              <div className="ch-section-hd">
                <div className="ch-section-title">Family Medical History</div>
                {canEdit && (
                  <button className="ch-btn-primary ch-btn-sm"
                    onClick={() => setEditingFamily({ id: uid(), relation: '', condition: '' })}>
                    + Add Entry
                  </button>
                )}
              </div>

              {editingFamily && (
                <FamilyHistoryForm
                  entry={editingFamily}
                  onChange={setEditingFamily}
                  onSave={() => saveFamily(editingFamily)}
                  onCancel={() => setEditingFamily(null)}
                  saving={saving}
                />
              )}

              {(record.familyHistory || []).length === 0 && !editingFamily ? (
                <div className="ch-empty">No family history recorded.</div>
              ) : (
                <div className="ch-list">
                  {(record.familyHistory || []).map(f => (
                    <div key={f.id} className="ch-family-card">
                      <div className="ch-family-hd">
                        <span className="ch-family-relation">{f.relation}</span>
                        <span className="ch-family-condition">{f.condition}</span>
                        {f.deceased && <span className="ch-deceased-badge">†</span>}
                      </div>
                      {f.ageOfOnset && <div className="ch-family-meta">Age of onset: {f.ageOfOnset}</div>}
                      {f.notes && <div className="ch-family-notes">{f.notes}</div>}
                      {canEdit && (
                        <button className="ch-btn-xs" onClick={() => setEditingFamily(f)}>✏️ Edit</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SOCIAL HISTORY ── */}
          {activeSection === 'social' && (
            <SocialHistorySection
              social={record.socialHistory || {}}
              canEdit={canEdit}
              onSave={(data) => saveSection('socialHistory', data, 'Updated social history')}
              saving={saving}
            />
          )}

          {/* ── AUDIT TRAIL ── */}
          {activeSection === 'audit' && (
            <div className="ch-section">
              <div className="ch-section-hd">
                <div className="ch-section-title">Audit Trail</div>
                <span className="ch-count-badge">{audits.length} entries</span>
              </div>
              <div className="ch-audit-list">
                {audits.length === 0 ? (
                  <div className="ch-empty">No changes recorded yet.</div>
                ) : audits.map(a => (
                  <div key={a.id} className="ch-audit-entry">
                    <div className={`ch-audit-role-dot ${a.changedByRole}`} />
                    <div className="ch-audit-body">
                      <span className="ch-audit-who">
                        {a.changedByRole === 'doctor' ? `🩺 Dr. ${a.changedByName}` : `👤 ${a.changedByName}`}
                      </span>
                      <span className="ch-audit-section"> updated <strong>{a.section}</strong></span>
                      {a.note && <span className="ch-audit-note"> — {a.note}</span>}
                      <div className="ch-audit-time">{fmtDate(a.changedAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CONSENT & SHARING ── */}
          {activeSection === 'consent' && viewerRole === 'patient' && (
            <ConsentSection
              patientId={patientId}
              record={record}
              onUpdate={(updates) => updateDoc(docRef, updates)}
            />
          )}

          {activeSection === 'consent' && viewerRole === 'doctor' && (
            <div className="ch-section">
              <div className="ch-empty">
                Access sharing is managed by the patient. You currently {hasConsent ? 'have' : 'do not have'} full access.
              </div>
            </div>
          )}

          {/* ── EMERGENCY CARD ── */}
          {activeSection === 'emergency' && (
            <div className="ch-section">
              <div className="ch-section-hd">
                <div className="ch-section-title">Emergency Card Preview</div>
                <button className="ch-btn-primary ch-btn-sm" onClick={() => setShowQR(!showQR)}>
                  📱 QR Code
                </button>
              </div>
              <EmergencyCard record={record} patientName={patientName} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-FORM COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function BiodataSection({ biodata, canEdit, onSave, saving }: any) {
  const [form, setForm] = useState({ ...biodata });
  const [editing, setEditing] = useState(false);

  const fields = [
    { group: 'Personal', items: [
      { key: 'fullName', label: 'Full Legal Name', type: 'text' },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { key: 'gender', label: 'Gender', type: 'select', opts: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
      { key: 'nationalId', label: 'National ID / Passport', type: 'text' },
      { key: 'bloodGroup', label: 'Blood Group', type: 'select', opts: ['A', 'B', 'AB', 'O', 'Unknown'] },
      { key: 'rhFactor', label: 'Rh Factor', type: 'select', opts: ['+', '-', 'Unknown'] },
    ]},
    { group: 'Physical', items: [
      { key: 'heightCm', label: 'Height (cm)', type: 'number' },
      { key: 'weightKg', label: 'Weight (kg)', type: 'number' },
    ]},
    { group: 'Contact', items: [
      { key: 'phone', label: 'Phone Number', type: 'tel' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'address', label: 'Physical Address', type: 'text' },
      { key: 'county', label: 'County', type: 'text' },
    ]},
    { group: 'Emergency Contact', items: [
      { key: 'emergencyContact', label: 'Emergency Contact Name', type: 'text' },
      { key: 'emergencyRelation', label: 'Relationship', type: 'text' },
      { key: 'emergencyPhone', label: 'Emergency Phone', type: 'tel' },
    ]},
    { group: 'Insurance & Medical ID', items: [
      { key: 'nhifNumber', label: 'NHIF Number', type: 'text' },
      { key: 'insuranceProvider', label: 'Insurance Provider', type: 'text' },
      { key: 'insuranceNumber', label: 'Insurance Number', type: 'text' },
    ]},
  ];

  return (
    <div className="ch-section">
      <div className="ch-section-hd">
        <div className="ch-section-title">Patient Biodata</div>
        {canEdit && (
          editing
            ? <div style={{ display: 'flex', gap: 6 }}>
                <button className="ch-btn-primary ch-btn-sm" onClick={async () => { await onSave(form); setEditing(false); }} disabled={saving}>
                  {saving ? 'Saving…' : '💾 Save'}
                </button>
                <button className="ch-btn-secondary ch-btn-sm" onClick={() => { setForm(biodata); setEditing(false); }}>Cancel</button>
              </div>
            : <button className="ch-btn-secondary ch-btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button>
        )}
      </div>

      {fields.map(group => (
        <div key={group.group} className="ch-biodata-group">
          <div className="ch-biodata-group-label">{group.group}</div>
          <div className="ch-biodata-grid">
            {group.items.map(f => (
              <div key={f.key} className="ch-field">
                <label className="ch-field-label">{f.label}</label>
                {editing ? (
                  f.type === 'select' ? (
                    <select className="ch-input" value={form[f.key] || ''} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}>
                      <option value="">Select</option>
                      {f.opts?.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className="ch-input" type={f.type} value={form[f.key] || ''}
                      onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))} />
                  )
                ) : (
                  <div className="ch-field-value">{form[f.key] || <span className="ch-field-empty">—</span>}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ConditionForm({ condition, onChange, onSave, onCancel, saving }: any) {
  return (
    <div className="ch-form-card">
      <div className="ch-form-title">Medical Condition</div>
      <div className="ch-form-grid">
        <div className="ch-field">
          <label className="ch-field-label">Condition Name *</label>
          <input className="ch-input" value={condition.name} onChange={e => onChange({ ...condition, name: e.target.value })} placeholder="e.g. Type 2 Diabetes Mellitus" />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">ICD-10 Code</label>
          <input className="ch-input" value={condition.icdCode || ''} onChange={e => onChange({ ...condition, icdCode: e.target.value })} placeholder="e.g. E11" />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Status</label>
          <select className="ch-input" value={condition.status} onChange={e => onChange({ ...condition, status: e.target.value })}>
            {['active', 'chronic', 'managed', 'resolved'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Severity</label>
          <select className="ch-input" value={condition.severity || ''} onChange={e => onChange({ ...condition, severity: e.target.value })}>
            <option value="">Select</option>
            {['mild', 'moderate', 'severe'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Date Diagnosed</label>
          <input className="ch-input" type="date" value={condition.diagnosedDate || ''} onChange={e => onChange({ ...condition, diagnosedDate: e.target.value })} />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Diagnosed By</label>
          <input className="ch-input" value={condition.diagnosedBy || ''} onChange={e => onChange({ ...condition, diagnosedBy: e.target.value })} placeholder="Doctor's name" />
        </div>
        <div className="ch-field ch-field-full">
          <label className="ch-field-label">Notes</label>
          <textarea className="ch-textarea" value={condition.notes || ''} onChange={e => onChange({ ...condition, notes: e.target.value })} rows={2} />
        </div>
      </div>
      <div className="ch-form-actions">
        <button className="ch-btn-primary ch-btn-sm" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save'}</button>
        <button className="ch-btn-secondary ch-btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function AllergyForm({ allergy, onChange, onSave, onCancel, saving }: any) {
  return (
    <div className="ch-form-card">
      <div className="ch-form-title">Allergy / Adverse Reaction</div>
      <div className="ch-form-grid">
        <div className="ch-field">
          <label className="ch-field-label">Allergen *</label>
          <input className="ch-input" value={allergy.allergen} onChange={e => onChange({ ...allergy, allergen: e.target.value })} placeholder="e.g. Penicillin, Peanuts" />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Type</label>
          <select className="ch-input" value={allergy.type} onChange={e => onChange({ ...allergy, type: e.target.value })}>
            {['drug', 'food', 'environmental', 'other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Reaction *</label>
          <input className="ch-input" value={allergy.reaction} onChange={e => onChange({ ...allergy, reaction: e.target.value })} placeholder="e.g. Rash, Anaphylaxis, Swelling" />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Severity *</label>
          <select className="ch-input" value={allergy.severity} onChange={e => onChange({ ...allergy, severity: e.target.value })}
            style={{ borderColor: SEVERITY_COLOR[allergy.severity] }}>
            {['mild', 'moderate', 'severe', 'anaphylaxis'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Confirmed?</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6 }}>
            <input type="checkbox" checked={allergy.confirmed} onChange={e => onChange({ ...allergy, confirmed: e.target.checked })} />
            Clinically confirmed
          </label>
        </div>
        <div className="ch-field ch-field-full">
          <label className="ch-field-label">Notes</label>
          <textarea className="ch-textarea" value={allergy.notes || ''} onChange={e => onChange({ ...allergy, notes: e.target.value })} rows={2} />
        </div>
      </div>
      <div className="ch-form-actions">
        <button className="ch-btn-primary ch-btn-sm" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save'}</button>
        <button className="ch-btn-secondary ch-btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function MedicationForm({ medication, onChange, onSave, onCancel, saving }: any) {
  return (
    <div className="ch-form-card">
      <div className="ch-form-title">Medication</div>
      <div className="ch-form-grid">
        <div className="ch-field">
          <label className="ch-field-label">Medication Name *</label>
          <input className="ch-input" value={medication.name} onChange={e => onChange({ ...medication, name: e.target.value })} placeholder="e.g. Metformin, Lisinopril" />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Dosage *</label>
          <input className="ch-input" value={medication.dosage} onChange={e => onChange({ ...medication, dosage: e.target.value })} placeholder="e.g. 500mg, 10mg" />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Frequency *</label>
          <input className="ch-input" value={medication.frequency} onChange={e => onChange({ ...medication, frequency: e.target.value })} placeholder="e.g. Twice daily, BD, QID" />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Route</label>
          <select className="ch-input" value={medication.route} onChange={e => onChange({ ...medication, route: e.target.value })}>
            {['oral', 'IV', 'IM', 'subcutaneous', 'topical', 'inhaled', 'sublingual', 'rectal', 'other'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Start Date</label>
          <input className="ch-input" type="date" value={medication.startDate} onChange={e => onChange({ ...medication, startDate: e.target.value })} />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Prescribed By</label>
          <input className="ch-input" value={medication.prescribedBy || ''} onChange={e => onChange({ ...medication, prescribedBy: e.target.value })} />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">For Condition</label>
          <input className="ch-input" value={medication.condition || ''} onChange={e => onChange({ ...medication, condition: e.target.value })} placeholder="e.g. Hypertension" />
        </div>
        <div className="ch-field ch-field-full">
          <label className="ch-field-label">Notes / Special Instructions</label>
          <textarea className="ch-textarea" value={medication.notes || ''} onChange={e => onChange({ ...medication, notes: e.target.value })} rows={2} />
        </div>
      </div>
      <div className="ch-form-actions">
        <button className="ch-btn-primary ch-btn-sm" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save'}</button>
        <button className="ch-btn-secondary ch-btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function SurgeryForm({ surgery, onChange, onSave, onCancel, saving }: any) {
  return (
    <div className="ch-form-card">
      <div className="ch-form-title">Surgical Procedure</div>
      <div className="ch-form-grid">
        <div className="ch-field ch-field-full">
          <label className="ch-field-label">Procedure *</label>
          <input className="ch-input" value={surgery.procedure} onChange={e => onChange({ ...surgery, procedure: e.target.value })} placeholder="e.g. Appendectomy, Caesarean Section" />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Date</label>
          <input className="ch-input" type="date" value={surgery.date} onChange={e => onChange({ ...surgery, date: e.target.value })} />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Hospital/Facility</label>
          <input className="ch-input" value={surgery.hospital || ''} onChange={e => onChange({ ...surgery, hospital: e.target.value })} />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Surgeon</label>
          <input className="ch-input" value={surgery.surgeon || ''} onChange={e => onChange({ ...surgery, surgeon: e.target.value })} />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Outcome</label>
          <select className="ch-input" value={surgery.outcome} onChange={e => onChange({ ...surgery, outcome: e.target.value })}>
            {['successful', 'complicated', 'unknown'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="ch-field ch-field-full">
          <label className="ch-field-label">Indication</label>
          <input className="ch-input" value={surgery.indication || ''} onChange={e => onChange({ ...surgery, indication: e.target.value })} />
        </div>
        <div className="ch-field ch-field-full">
          <label className="ch-field-label">Complications (if any)</label>
          <textarea className="ch-textarea" value={surgery.complications || ''} onChange={e => onChange({ ...surgery, complications: e.target.value })} rows={2} />
        </div>
      </div>
      <div className="ch-form-actions">
        <button className="ch-btn-primary ch-btn-sm" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save'}</button>
        <button className="ch-btn-secondary ch-btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function FamilyHistoryForm({ entry, onChange, onSave, onCancel, saving }: any) {
  return (
    <div className="ch-form-card">
      <div className="ch-form-title">Family History Entry</div>
      <div className="ch-form-grid">
        <div className="ch-field">
          <label className="ch-field-label">Relation *</label>
          <select className="ch-input" value={entry.relation} onChange={e => onChange({ ...entry, relation: e.target.value })}>
            <option value="">Select</option>
            {['Mother', 'Father', 'Maternal Grandmother', 'Maternal Grandfather', 'Paternal Grandmother', 'Paternal Grandfather', 'Sibling', 'Child', 'Uncle', 'Aunt', 'Other'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Condition *</label>
          <input className="ch-input" value={entry.condition} onChange={e => onChange({ ...entry, condition: e.target.value })} placeholder="e.g. Hypertension, Diabetes" />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Age of Onset</label>
          <input className="ch-input" type="number" value={entry.ageOfOnset || ''} onChange={e => onChange({ ...entry, ageOfOnset: parseInt(e.target.value) })} />
        </div>
        <div className="ch-field">
          <label className="ch-field-label">Deceased?</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6 }}>
            <input type="checkbox" checked={entry.deceased || false} onChange={e => onChange({ ...entry, deceased: e.target.checked })} />
            Deceased
          </label>
        </div>
        <div className="ch-field ch-field-full">
          <label className="ch-field-label">Notes</label>
          <textarea className="ch-textarea" value={entry.notes || ''} onChange={e => onChange({ ...entry, notes: e.target.value })} rows={2} />
        </div>
      </div>
      <div className="ch-form-actions">
        <button className="ch-btn-primary ch-btn-sm" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save'}</button>
        <button className="ch-btn-secondary ch-btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function SocialHistorySection({ social, canEdit, onSave, saving }: any) {
  const [form, setForm] = useState<Partial<SocialHistory>>({ ...social });
  const [editing, setEditing] = useState(false);

  return (
    <div className="ch-section">
      <div className="ch-section-hd">
        <div className="ch-section-title">Social History</div>
        {canEdit && (
          editing
            ? <div style={{ display: 'flex', gap: 6 }}>
                <button className="ch-btn-primary ch-btn-sm" onClick={async () => { await onSave(form); setEditing(false); }} disabled={saving}>
                  {saving ? 'Saving…' : '💾 Save'}
                </button>
                <button className="ch-btn-secondary ch-btn-sm" onClick={() => { setForm(social); setEditing(false); }}>Cancel</button>
              </div>
            : <button className="ch-btn-secondary ch-btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button>
        )}
      </div>

      <div className="ch-social-grid">
        {/* Smoking */}
        <div className="ch-social-card">
          <div className="ch-social-icon">🚬</div>
          <div className="ch-social-info">
            <div className="ch-social-label">Smoking</div>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <select className="ch-input ch-input-sm" value={form.smoking?.status || 'never'}
                  onChange={e => setForm(p => ({ ...p, smoking: { ...p.smoking, status: e.target.value as any } }))}>
                  {['never', 'former', 'current'].map(s => <option key={s}>{s}</option>)}
                </select>
                {form.smoking?.status === 'current' && (
                  <input className="ch-input ch-input-sm" type="number" placeholder="Packs/day"
                    value={form.smoking?.packsPerDay || ''}
                    onChange={e => setForm(p => ({ ...p, smoking: { ...p.smoking!, packsPerDay: parseFloat(e.target.value) } }))} />
                )}
              </div>
            ) : (
              <div className="ch-social-value">{form.smoking?.status || '—'}
                {form.smoking?.packsPerDay && ` · ${form.smoking.packsPerDay} packs/day`}
              </div>
            )}
          </div>
        </div>

        {/* Alcohol */}
        <div className="ch-social-card">
          <div className="ch-social-icon">🍺</div>
          <div className="ch-social-info">
            <div className="ch-social-label">Alcohol</div>
            {editing ? (
              <select className="ch-input ch-input-sm" value={form.alcohol?.status || 'never'}
                onChange={e => setForm(p => ({ ...p, alcohol: { ...p.alcohol, status: e.target.value as any } }))}>
                {['never', 'occasional', 'moderate', 'heavy'].map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <div className="ch-social-value">{form.alcohol?.status || '—'}</div>
            )}
          </div>
        </div>

        {/* Exercise */}
        <div className="ch-social-card">
          <div className="ch-social-icon">🏃</div>
          <div className="ch-social-info">
            <div className="ch-social-label">Exercise</div>
            {editing ? (
              <input className="ch-input ch-input-sm" value={form.exerciseFrequency || ''}
                placeholder="e.g. 3x/week"
                onChange={e => setForm(p => ({ ...p, exerciseFrequency: e.target.value }))} />
            ) : (
              <div className="ch-social-value">{form.exerciseFrequency || '—'}</div>
            )}
          </div>
        </div>

        {/* Occupation */}
        <div className="ch-social-card">
          <div className="ch-social-icon">💼</div>
          <div className="ch-social-info">
            <div className="ch-social-label">Occupation</div>
            {editing ? (
              <input className="ch-input ch-input-sm" value={form.occupation || ''}
                onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))} />
            ) : (
              <div className="ch-social-value">{form.occupation || '—'}</div>
            )}
          </div>
        </div>

        {/* Marital Status */}
        <div className="ch-social-card">
          <div className="ch-social-icon">💑</div>
          <div className="ch-social-info">
            <div className="ch-social-label">Marital Status</div>
            {editing ? (
              <select className="ch-input ch-input-sm" value={form.maritalStatus || ''}
                onChange={e => setForm(p => ({ ...p, maritalStatus: e.target.value }))}>
                <option value="">Select</option>
                {['Single', 'Married', 'Divorced', 'Widowed', 'Cohabiting'].map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <div className="ch-social-value">{form.maritalStatus || '—'}</div>
            )}
          </div>
        </div>

        {/* Stress */}
        <div className="ch-social-card">
          <div className="ch-social-icon">🧠</div>
          <div className="ch-social-info">
            <div className="ch-social-label">Stress Level</div>
            {editing ? (
              <select className="ch-input ch-input-sm" value={form.stressLevel || ''}
                onChange={e => setForm(p => ({ ...p, stressLevel: e.target.value as any }))}>
                <option value="">Select</option>
                {['low', 'moderate', 'high'].map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <div className="ch-social-value">{form.stressLevel || '—'}</div>
            )}
          </div>
        </div>

        {/* Diet */}
        <div className="ch-social-card ch-social-full">
          <div className="ch-social-icon">🥗</div>
          <div className="ch-social-info" style={{ flex: 1 }}>
            <div className="ch-social-label">Diet</div>
            {editing ? (
              <input className="ch-input ch-input-sm" value={form.diet || ''}
                placeholder="e.g. Vegetarian, Balanced, High carb"
                onChange={e => setForm(p => ({ ...p, diet: e.target.value }))} />
            ) : (
              <div className="ch-social-value">{form.diet || '—'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsentSection({ patientId, record, onUpdate }: any) {
  const [emergencyConsent, setEmergencyConsent] = useState(record.emergencyConsent ?? true);
  const [doctorIdInput, setDoctorIdInput] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleEmergencyConsent = async () => {
    const newVal = !emergencyConsent;
    setEmergencyConsent(newVal);
    await onUpdate({ emergencyConsent: newVal });
  };

  const removeDoctor = async (doctorId: string) => {
    const updated = (record.consentedDoctors || []).filter((id: string) => id !== doctorId);
    await onUpdate({ consentedDoctors: updated });
  };

  return (
    <div className="ch-section">
      <div className="ch-section-hd">
        <div className="ch-section-title">🔐 Access & Sharing</div>
      </div>

      <div className="ch-consent-options">
        <div className="ch-consent-toggle">
          <div>
            <div className="ch-consent-option-title">🚨 Emergency Access</div>
            <div className="ch-consent-option-desc">
              Allow any emergency room doctor to view your critical medical info (allergies, conditions, medications) in a life-threatening situation.
            </div>
          </div>
          <div
            className={`ch-toggle ${emergencyConsent ? 'ch-toggle-on' : ''}`}
            onClick={toggleEmergencyConsent}
          >
            <div className="ch-toggle-knob" />
          </div>
        </div>

        <div className="ch-consent-section">
          <div className="ch-consent-option-title">🩺 Doctor Access List</div>
          <p className="ch-consent-option-desc">
            Doctors below can view your complete medical record before and during appointments.
          </p>
          {(record.consentedDoctors || []).length === 0 ? (
            <div className="ch-empty" style={{ marginTop: 8 }}>No doctors currently have full access.</div>
          ) : (
            <div className="ch-doctor-list">
              {(record.consentedDoctors || []).map((id: string) => (
                <div key={id} className="ch-doctor-item">
                  <span>🩺 Doctor ID: {id.slice(0, 12)}…</span>
                  <button className="ch-btn-danger ch-btn-xs" onClick={() => removeDoctor(id)}>Revoke</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ch-consent-info">
          <strong>ℹ️ How Sharing Works</strong>
          <ul style={{ marginTop: 6, paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Your complete history is shared with doctors you authorize</li>
            <li>Every view and edit is logged in the audit trail</li>
            <li>You are notified whenever a doctor updates your record</li>
            <li>Emergency access shows only critical information</li>
            <li>You can revoke access at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const CH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap');

  .ch-wrap { font-family: 'IBM Plex Sans', sans-serif; color: #e2e8f0; }
  .ch-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 240px; gap: 12px; color: #64748b; }
  .ch-spinner { width: 32px; height: 32px; border: 3px solid #1e2535; border-top-color: #00e5cc; border-radius: 50%; animation: ch-spin .7s linear infinite; }
  @keyframes ch-spin { to { transform: rotate(360deg); } }

  /* Header */
  .ch-header { background: #111827; border: 1px solid #1e2a3d; border-radius: 14px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
  .ch-header-left { display: flex; align-items: center; gap: 12px; }
  .ch-header-avatar { width: 46px; height: 46px; border-radius: 12px; background: linear-gradient(135deg, #7c5af5, #00e5cc); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .ch-header-name { font-size: 16px; font-weight: 700; }
  .ch-header-meta { font-size: 11px; color: #64748b; font-family: 'IBM Plex Mono', monospace; display: flex; align-items: center; gap: 8px; margin-top: 3px; }
  .ch-blood-chip { background: rgba(239,68,68,.12); color: #f87171; border-radius: 99px; padding: 1px 8px; font-size: 10px; font-weight: 700; }
  .ch-header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .ch-last-update { font-size: 10px; color: #64748b; text-align: right; line-height: 1.5; }
  .ch-update-role { color: #4f46e5; font-weight: 600; }
  .ch-btn-icon { background: #1e2535; border: 1px solid #2d3f58; color: #94a3b8; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; font-size: 15px; transition: all .15s; }
  .ch-btn-icon:hover { border-color: #00e5cc; color: #00e5cc; }
  .ch-saving-badge { background: rgba(0,229,204,.12); color: #00e5cc; border-radius: 99px; padding: 3px 10px; font-size: 10px; font-weight: 700; animation: ch-pulse 1s infinite; }
  @keyframes ch-pulse { 0%,100%{opacity:1}50%{opacity:.5} }

  /* Banners */
  .ch-critical-banner { background: rgba(239,68,68,.12); border: 1.5px solid rgba(239,68,68,.4); border-radius: 10px; padding: 10px 16px; font-size: 12px; font-weight: 700; color: #f87171; margin-bottom: 12px; }
  .ch-msg { padding: 9px 14px; border-radius: 9px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }
  .ch-msg-ok { background: rgba(34,197,94,.1); color: #4ade80; border: 1px solid rgba(34,197,94,.2); }
  .ch-msg-err { background: rgba(239,68,68,.1); color: #f87171; border: 1px solid rgba(239,68,68,.2); }

  /* QR */
  .ch-qr-panel { background: #111827; border: 1px solid #1e2a3d; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
  .ch-qr-inner { display: flex; align-items: center; gap: 16px; }
  .ch-qr-text { font-size: 13px; }
  .ch-qr-text strong { display: block; margin-bottom: 4px; }
  .ch-qr-text p { color: #64748b; font-size: 12px; }

  /* Layout */
  .ch-layout { display: grid; grid-template-columns: 200px 1fr; gap: 14px; }
  @media (max-width: 768px) { .ch-layout { grid-template-columns: 1fr; } .ch-nav { flex-direction: row; flex-wrap: wrap; overflow-x: auto; } }

  /* Nav */
  .ch-nav { display: flex; flex-direction: column; gap: 2px; }
  .ch-nav-item { display: flex; align-items: center; gap: 8px; padding: 9px 11px; border-radius: 9px; border: none; background: transparent; color: #64748b; font-size: 12px; font-weight: 500; cursor: pointer; font-family: 'IBM Plex Sans', sans-serif; width: 100%; text-align: left; transition: all .15s; position: relative; white-space: nowrap; }
  .ch-nav-item:hover { background: #1e2535; color: #e2e8f0; }
  .ch-nav-active { background: rgba(0,229,204,.1) !important; color: #00e5cc !important; font-weight: 700; }
  .ch-nav-icon { font-size: 14px; flex-shrink: 0; width: 18px; text-align: center; }
  .ch-nav-label { flex: 1; }
  .ch-nav-count { background: #1e2535; border-radius: 99px; min-width: 18px; height: 16px; font-size: 9px; display: inline-flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'IBM Plex Mono', monospace; }
  .ch-nav-count-alert { background: rgba(239,68,68,.2); color: #f87171; }
  .ch-nav-alert-dot { position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; border-radius: 50%; background: #ef4444; }

  /* Content */
  .ch-content { min-height: 400px; }
  .ch-section { display: flex; flex-direction: column; gap: 14px; }
  .ch-section-hd { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #1e2a3d; }
  .ch-section-title { font-size: 15px; font-weight: 700; }
  .ch-count-badge { background: rgba(0,229,204,.1); color: #00e5cc; border-radius: 99px; font-size: 10px; font-weight: 700; padding: 2px 9px; }
  .ch-empty { color: #64748b; font-size: 13px; padding: 20px 0; }
  .ch-list { display: flex; flex-direction: column; gap: 10px; }

  /* Buttons */
  .ch-btn-primary { background: linear-gradient(135deg, #7c5af5, #00e5cc); color: #000; border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'IBM Plex Sans', sans-serif; transition: all .15s; }
  .ch-btn-primary:hover { opacity: .9; }
  .ch-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
  .ch-btn-secondary { background: transparent; border: 1px solid #2d3f58; color: #94a3b8; border-radius: 8px; padding: 7px 13px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'IBM Plex Sans', sans-serif; transition: all .15s; }
  .ch-btn-secondary:hover { border-color: #94a3b8; color: #e2e8f0; }
  .ch-btn-sm { padding: 6px 12px; font-size: 11px; }
  .ch-btn-xs { background: transparent; border: 1px solid #2d3f58; color: #64748b; border-radius: 6px; padding: 3px 9px; font-size: 10px; font-weight: 600; cursor: pointer; font-family: 'IBM Plex Sans', sans-serif; transition: all .15s; }
  .ch-btn-xs:hover { border-color: #64748b; color: #e2e8f0; }
  .ch-btn-warn { border-color: rgba(245,158,11,.3); color: #f59e0b; }
  .ch-btn-warn:hover { background: rgba(245,158,11,.08); }
  .ch-btn-danger { border-color: rgba(239,68,68,.3); color: #f87171; }
  .ch-btn-danger:hover { background: rgba(239,68,68,.08); }
  .ch-btn-success { border-color: rgba(34,197,94,.3); color: #4ade80; }
  .ch-btn-success:hover { background: rgba(34,197,94,.08); }

  /* Form */
  .ch-form-card { background: #111827; border: 1px solid #1e2a3d; border-radius: 12px; padding: 16px; }
  .ch-form-title { font-size: 12px; font-weight: 700; color: #00e5cc; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
  .ch-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ch-form-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .ch-form-actions { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #1e2a3d; }
  .ch-field { display: flex; flex-direction: column; gap: 4px; }
  .ch-field-full { grid-column: 1 / -1; }
  .ch-field-label { font-size: 9px; font-weight: 700; color: #4f6272; text-transform: uppercase; letter-spacing: 0.8px; }
  .ch-field-value { font-size: 13px; color: #e2e8f0; padding: 2px 0; }
  .ch-field-empty { color: #4f6272; font-style: italic; }
  .ch-input { background: #0b0f1a; border: 1px solid #2d3f58; border-radius: 7px; padding: 8px 10px; color: #e2e8f0; font-size: 12.5px; font-family: 'IBM Plex Sans', sans-serif; outline: none; transition: border-color .15s; width: 100%; }
  .ch-input:focus { border-color: #00e5cc; }
  .ch-input-sm { padding: 6px 9px; font-size: 12px; }
  select.ch-input option { background: #0b0f1a; }
  .ch-textarea { background: #0b0f1a; border: 1px solid #2d3f58; border-radius: 7px; padding: 8px 10px; color: #e2e8f0; font-size: 12.5px; font-family: 'IBM Plex Sans', sans-serif; outline: none; transition: border-color .15s; width: 100%; resize: vertical; }
  .ch-textarea:focus { border-color: #00e5cc; }

  /* Badges */
  .ch-status-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
  .ch-severity-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
  .ch-icd { background: rgba(99,102,241,.15); color: #818cf8; border-radius: 4px; padding: 1px 6px; font-size: 10px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; }
  .ch-confirmed-badge { background: rgba(34,197,94,.12); color: #4ade80; border-radius: 99px; padding: 1px 7px; font-size: 10px; font-weight: 700; }

  /* Condition card */
  .ch-condition-card { background: #111827; border: 1px solid #1e2a3d; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; }
  .ch-condition-hd { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
  .ch-condition-name { font-weight: 700; font-size: 13.5px; }
  .ch-condition-meta { font-size: 11px; color: #64748b; font-family: 'IBM Plex Mono', monospace; }
  .ch-condition-notes { font-size: 12px; color: #94a3b8; font-style: italic; }

  /* Allergy card */
  .ch-allergy-card { background: #111827; border: 1px solid #1e2a3d; border-left: 3px solid; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 5px; }
  .ch-allergy-hd { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
  .ch-allergy-name { font-weight: 700; font-size: 14px; }
  .ch-allergy-type { font-size: 11px; color: #64748b; }
  .ch-allergy-reaction { font-size: 12px; color: #94a3b8; }
  .ch-allergy-notes { font-size: 11px; color: #64748b; font-style: italic; }

  /* Medication card */
  .ch-med-card { background: #111827; border: 1px solid #1e2a3d; border-radius: 10px; padding: 13px 15px; display: flex; flex-direction: column; gap: 8px; }
  .ch-med-inactive { opacity: 0.55; }
  .ch-med-hd { display: flex; align-items: flex-start; gap: 10px; }
  .ch-med-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
  .ch-med-info { flex: 1; }
  .ch-med-name { font-weight: 700; font-size: 14px; }
  .ch-med-dosage { font-size: 12px; color: #94a3b8; font-family: 'IBM Plex Mono', monospace; margin-top: 2px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .ch-dosage-changed { background: rgba(245,158,11,.15); color: #f59e0b; border-radius: 99px; padding: 1px 7px; font-size: 9px; font-weight: 700; font-family: 'IBM Plex Sans', sans-serif; }
  .ch-med-for { font-size: 11px; color: #64748b; margin-top: 3px; }
  .ch-med-by { font-size: 11px; color: #64748b; }
  .ch-med-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .ch-med-status { display: inline-flex; padding: 2px 9px; border-radius: 99px; font-size: 10px; font-weight: 700; }
  .ch-status-active { background: rgba(34,197,94,.12); color: #4ade80; }
  .ch-status-stopped { background: rgba(100,116,139,.12); color: #64748b; }
  .ch-med-date { font-size: 10px; color: #4f6272; font-family: 'IBM Plex Mono', monospace; }
  .ch-med-actions { display: flex; gap: 6px; flex-wrap: wrap; padding-top: 6px; border-top: 1px solid #1e2a3d; }
  .ch-med-group-label { font-size: 9px; font-weight: 800; color: #4f6272; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 6px; }
  .ch-dosage-change-form { background: rgba(245,158,11,.05); border: 1px solid rgba(245,158,11,.2); border-radius: 8px; padding: 10px 12px; }
  .ch-dosage-history { background: #0b0f1a; border-radius: 8px; padding: 10px 12px; }
  .ch-history-label { font-size: 9px; font-weight: 700; color: #4f6272; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .ch-history-entry { display: flex; flex-direction: column; gap: 2px; padding: 6px 0; border-bottom: 1px solid #1e2a3d; }
  .ch-history-entry:last-child { border-bottom: none; }
  .ch-history-arrow { font-size: 12px; color: #e2e8f0; font-family: 'IBM Plex Mono', monospace; }
  .ch-history-meta { font-size: 10px; color: #64748b; }

  /* Surgery card */
  .ch-surgery-card { background: #111827; border: 1px solid #1e2a3d; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 5px; }
  .ch-surgery-hd { display: flex; align-items: center; gap: 10px; justify-content: space-between; }
  .ch-surgery-name { font-weight: 700; font-size: 13.5px; }
  .ch-surgery-outcome { font-size: 10px; font-weight: 700; padding: 2px 9px; border-radius: 99px; }
  .ch-outcome-successful { background: rgba(34,197,94,.12); color: #4ade80; }
  .ch-outcome-complicated { background: rgba(239,68,68,.12); color: #f87171; }
  .ch-outcome-unknown { background: rgba(100,116,139,.12); color: #64748b; }
  .ch-surgery-meta { font-size: 11px; color: #64748b; font-family: 'IBM Plex Mono', monospace; }
  .ch-surgery-notes { font-size: 12px; color: #94a3b8; font-style: italic; }

  /* Family card */
  .ch-family-card { background: #111827; border: 1px solid #1e2a3d; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 5px; }
  .ch-family-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ch-family-relation { font-size: 11px; font-weight: 700; background: rgba(99,102,241,.15); color: #818cf8; padding: 2px 9px; border-radius: 99px; }
  .ch-family-condition { font-weight: 700; font-size: 13.5px; }
  .ch-deceased-badge { font-size: 14px; color: #64748b; }
  .ch-family-meta { font-size: 11px; color: #64748b; }
  .ch-family-notes { font-size: 12px; color: #94a3b8; font-style: italic; }

  /* Social history */
  .ch-social-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .ch-social-full { grid-column: 1 / -1; }
  .ch-social-card { background: #111827; border: 1px solid #1e2a3d; border-radius: 10px; padding: 12px; display: flex; align-items: flex-start; gap: 10px; }
  .ch-social-icon { font-size: 22px; flex-shrink: 0; }
  .ch-social-info { flex: 1; }
  .ch-social-label { font-size: 9px; font-weight: 700; color: #4f6272; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 5px; }
  .ch-social-value { font-size: 13px; color: #e2e8f0; font-weight: 500; }

  /* Audit */
  .ch-audit-list { display: flex; flex-direction: column; gap: 8px; max-height: 500px; overflow-y: auto; }
  .ch-audit-entry { display: flex; align-items: flex-start; gap: 10px; background: #111827; border: 1px solid #1e2a3d; border-radius: 9px; padding: 10px 12px; }
  .ch-audit-role-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .ch-audit-role-dot.doctor { background: #7c5af5; }
  .ch-audit-role-dot.patient { background: #00e5cc; }
  .ch-audit-body { flex: 1; font-size: 12.5px; line-height: 1.5; }
  .ch-audit-who { font-weight: 700; }
  .ch-audit-section { color: #94a3b8; }
  .ch-audit-note { color: #64748b; font-style: italic; }
  .ch-audit-time { font-size: 10px; color: #4f6272; font-family: 'IBM Plex Mono', monospace; margin-top: 3px; }

  /* Consent */
  .ch-consent-options { display: flex; flex-direction: column; gap: 16px; }
  .ch-consent-toggle { background: #111827; border: 1px solid #1e2a3d; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
  .ch-consent-option-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .ch-consent-option-desc { font-size: 12px; color: #64748b; line-height: 1.6; }
  .ch-consent-section { background: #111827; border: 1px solid #1e2a3d; border-radius: 12px; padding: 16px; }
  .ch-consent-info { background: rgba(0,229,204,.04); border: 1px solid rgba(0,229,204,.12); border-radius: 10px; padding: 14px; font-size: 12px; color: #94a3b8; }
  .ch-toggle { width: 44px; height: 24px; background: #1e2535; border-radius: 99px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; padding: 2px; transition: all .2s; }
  .ch-toggle-on { background: #00e5cc; }
  .ch-toggle-knob { width: 20px; height: 20px; background: white; border-radius: 50%; transition: all .2s; }
  .ch-toggle-on .ch-toggle-knob { transform: translateX(20px); }
  .ch-doctor-list { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
  .ch-doctor-item { background: #0b0f1a; border: 1px solid #1e2a3d; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }

  /* Biodata */
  .ch-biodata-group { margin-bottom: 16px; }
  .ch-biodata-group-label { font-size: 9px; font-weight: 800; color: #4f6272; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #1e2a3d; }
  .ch-biodata-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 600px) { .ch-biodata-grid { grid-template-columns: 1fr; } .ch-form-grid { grid-template-columns: 1fr; } .ch-social-grid { grid-template-columns: 1fr 1fr; } }

  /* Consent wall */
  .ch-consent-wall { background: #111827; border: 1px solid #1e2a3d; border-radius: 16px; padding: 40px; text-align: center; }
  .ch-consent-icon { font-size: 48px; margin-bottom: 16px; }
  .ch-consent-title { font-size: 18px; font-weight: 800; margin-bottom: 10px; }
  .ch-consent-body { font-size: 13px; color: #94a3b8; line-height: 1.7; margin-bottom: 16px; }
  .ch-consent-emergency { background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2); border-radius: 10px; padding: 12px; font-size: 12px; color: #f87171; margin-bottom: 20px; text-align: left; }

  /* Emergency card */
  .ch-emergency-card { background: linear-gradient(135deg, #0d1a2e, #1a0a0a); border: 2px solid rgba(239,68,68,.4); border-radius: 16px; padding: 20px; }
  .ch-emergency-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid rgba(239,68,68,.2); flex-wrap: wrap; }
  .ch-emergency-pulse { font-size: 32px; animation: ch-pulse 1.5s infinite; }
  .ch-emergency-title { font-size: 10px; font-weight: 800; color: #f87171; text-transform: uppercase; letter-spacing: 2px; }
  .ch-emergency-name { font-size: 20px; font-weight: 800; color: #fff; margin-top: 3px; }
  .ch-emergency-blood { margin-left: auto; text-align: center; background: rgba(239,68,68,.15); border: 1px solid rgba(239,68,68,.3); border-radius: 10px; padding: 10px 16px; }
  .ch-blood-type { font-size: 24px; font-weight: 900; color: #f87171; font-family: 'IBM Plex Mono', monospace; }
  .ch-blood-label { font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
  .ch-emergency-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
  .ch-emergency-section { background: rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.07); border-radius: 10px; padding: 12px; }
  .ch-emergency-critical { border-color: rgba(239,68,68,.3); }
  .ch-emergency-section-title { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #94a3b8; margin-bottom: 8px; }
  .ch-emergency-item { font-size: 12.5px; color: #e2e8f0; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,.05); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .ch-emergency-item:last-child { border-bottom: none; }
`;