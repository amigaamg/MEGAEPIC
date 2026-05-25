'use client';
import { useEffect, useState, useCallback } from 'react';
import { doc, collection, query, where, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Allergy {
  name: string;
  reaction?: string;
  severity?: 'Severe' | 'Moderate' | 'Mild';
}

interface Patient {
  id: string;
  name: string;
  photoUrl?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  allergies?: Allergy[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance?: {
    provider: string;
    number: string;
  };
  nextAppointment?: Timestamp;
  primaryDoctorName?: string;
  // Future expansion
  riskFlags?: string[];
  isolationStatus?: string[];
  vitals?: { hr?: number; spo2?: number };
}

interface Doctor {
  uid: string;
  name?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const bloodGroupColors: Record<string, { bg: string; text: string }> = {
  'O-':  { bg: '#fde8e8', text: '#b91c1c' },
  'O+':  { bg: '#fee2e2', text: '#dc2626' },
  'AB+': { bg: '#ede9fe', text: '#7c3aed' },
  'AB-': { bg: '#ede9fe', text: '#6d28d9' },
  'A+':  { bg: '#dbeafe', text: '#1d4ed8' },
  'A-':  { bg: '#dbeafe', text: '#1e40af' },
  'B+':  { bg: '#d1fae5', text: '#065f46' },
  'B-':  { bg: '#d1fae5', text: '#047857' },
};

const conditionColors: Record<string, { bg: string; text: string; border: string }> = {
  respiratory:  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  hematology:   { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  neurology:    { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
  endocrine:    { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  default:      { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
};

const conditionKeywords: Record<string, string> = {
  asthma: 'respiratory', copd: 'respiratory', pneumonia: 'respiratory',
  sickle: 'hematology', anemia: 'hematology', thalassemia: 'hematology',
  epilepsy: 'neurology', migraine: 'neurology', parkinson: 'neurology',
  diabetes: 'endocrine', thyroid: 'endocrine', obesity: 'endocrine',
};

function getConditionStyle(condition: string) {
  const lower = condition.toLowerCase();
  for (const [kw, type] of Object.entries(conditionKeywords)) {
    if (lower.includes(kw)) return conditionColors[type];
  }
  return conditionColors.default;
}

const severityConfig = {
  Severe:   { dot: '#ef4444', bg: '#fef2f2', text: '#dc2626', label: '🔴 Severe' },
  Moderate: { dot: '#f59e0b', bg: '#fffbeb', text: '#d97706', label: '🟡 Moderate' },
  Mild:     { dot: '#22c55e', bg: '#f0fdf4', text: '#16a34a', label: '🟢 Mild' },
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(ts?: Timestamp) {
  if (!ts) return null;
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(ts?: Timestamp) {
  if (!ts) return null;
  return ts.toDate().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function Skeleton({ width = '100%', height = 14, radius = 6, style = {} }: {
  width?: string | number; height?: number; radius?: number; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
}

function SkeletonPanel() {
  return (
    <div style={{ padding: '24px 20px' }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Skeleton width={76} height={76} radius={38} />
        <Skeleton width={140} height={18} />
        <Skeleton width={100} height={12} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Skeleton width={56} height={22} radius={11} />
          <Skeleton width={70} height={22} radius={11} />
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ marginBottom: 18 }}>
          <Skeleton width={90} height={12} style={{ marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Skeleton width={70} height={26} radius={13} />
            <Skeleton width={90} height={26} radius={13} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon, label, count, open, onToggle, highlight,
}: {
  icon: string; label: string; count?: number; open: boolean;
  onToggle: () => void; highlight?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: highlight ? '#fef2f2' : 'transparent',
        border: highlight ? '1px solid #fecaca' : '1px solid transparent',
        borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
        marginBottom: open ? 10 : 0, transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{
          fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: highlight ? '#b91c1c' : '#374151',
        }}>
          {label}
        </span>
        {count !== undefined && count > 0 && (
          <span style={{
            background: highlight ? '#ef4444' : '#e2e8f0',
            color: highlight ? '#fff' : '#475569',
            fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 7px',
          }}>{count}</span>
        )}
      </div>
      <span style={{
        fontSize: 11, color: '#94a3b8',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.25s', display: 'inline-block',
      }}>▾</span>
    </button>
  );
}

// ─── Inline Edit Form ─────────────────────────────────────────────────────────

function EditPanel({
  patient, onSave, onCancel,
}: {
  patient: Patient;
  onSave: (data: Partial<Patient>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: patient.name ?? '',
    height: String(patient.height ?? ''),
    weight: String(patient.weight ?? ''),
    ecName: patient.emergencyContact?.name ?? '',
    ecRelationship: patient.emergencyContact?.relationship ?? '',
    ecPhone: patient.emergencyContact?.phone ?? '',
    insuranceProvider: patient.insurance?.provider ?? '',
    insuranceNumber: patient.insurance?.number ?? '',
  });
  const [saving, setSaving] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 10px',
    fontSize: 13, outline: 'none', background: '#f8fafc', boxSizing: 'border-box',
    color: '#1e293b', fontFamily: 'inherit', transition: 'border-color 0.15s',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block',
  };

  async function handleSave() {
    setSaving(true);
    const h = Number(form.height), w = Number(form.weight);
    const bmi = h && w ? parseFloat((w / ((h / 100) ** 2)).toFixed(1)) : patient.bmi;
    await onSave({
      name: form.name || patient.name,
      height: h || patient.height,
      weight: w || patient.weight,
      bmi,
      emergencyContact: {
        name: form.ecName,
        relationship: form.ecRelationship,
        phone: form.ecPhone,
      },
      insurance: {
        provider: form.insuranceProvider,
        number: form.insuranceNumber,
      },
    });
    setSaving(false);
  }

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', marginBottom: 16 }}>✏️ Edit Patient</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>Height (cm)</label>
            <input style={inputStyle} type="number" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Weight (kg)</label>
            <input style={inputStyle} type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} />
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 10, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Emergency Contact
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input style={inputStyle} placeholder="Contact name" value={form.ecName} onChange={e => setForm(p => ({ ...p, ecName: e.target.value }))} />
            <input style={inputStyle} placeholder="Relationship" value={form.ecRelationship} onChange={e => setForm(p => ({ ...p, ecRelationship: e.target.value }))} />
            <input style={inputStyle} placeholder="Phone (e.g. +254712...)" value={form.ecPhone} onChange={e => setForm(p => ({ ...p, ecPhone: e.target.value }))} />
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 10, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Insurance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input style={inputStyle} placeholder="Provider (e.g. NHIF)" value={form.insuranceProvider} onChange={e => setForm(p => ({ ...p, insuranceProvider: e.target.value }))} />
            <input style={inputStyle} placeholder="Policy number" value={form.insuranceNumber} onChange={e => setForm(p => ({ ...p, insuranceNumber: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: 8,
              border: '1.5px solid #e2e8f0', background: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#64748b', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 2, padding: '10px', borderRadius: 8, border: 'none',
              background: saving ? '#93c5fd' : '#2563eb', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer',
              transition: 'background 0.2s', fontFamily: 'inherit',
            }}
          >
            {saving ? 'Saving…' : '✓ Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PatientInfoPanel({
  patient: initialPatient,
  doctor,
}: {
  patient: Patient;
  doctor: Doctor;
}) {
  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [loading, setLoading] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const [editing, setEditing] = useState(false);

  const [open, setOpen] = useState({
    allergies: true,
    conditions: false,
    emergency: false,
    insurance: false,
    appointment: false,
  });

  const toggle = (key: keyof typeof open) =>
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  // Realtime patient data listener
  useEffect(() => {
    if (!initialPatient.id) return;
    const ref = doc(db, 'patients', initialPatient.id);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) setPatient({ id: snap.id, ...snap.data() } as Patient);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [initialPatient.id]);

  // Realtime consent listener
  useEffect(() => {
    if (!initialPatient.id || !doctor.uid) return;
    const q = query(
      collection(db, 'patientConsent'),
      where('patientId', '==', initialPatient.id),
      where('doctorId', '==', doctor.uid),
      where('active', '==', true),
    );
    return onSnapshot(q, snap => setConsentGiven(!snap.empty));
  }, [initialPatient.id, doctor.uid]);

  const handleSave = useCallback(async (data: Partial<Patient>) => {
    const ref = doc(db, 'patients', patient.id);
    await updateDoc(ref, data as Record<string, unknown>);
    setEditing(false);
  }, [patient.id]);

  if (loading) return <SkeletonPanel />;

  const bloodStyle = patient.bloodGroup
    ? (bloodGroupColors[patient.bloodGroup] ?? { bg: '#f1f5f9', text: '#475569' })
    : null;
  const allergyCount = patient.allergies?.length ?? 0;
  const conditionCount = patient.chronicConditions?.length ?? 0;
  const hasRiskFlags = (patient.riskFlags?.length ?? 0) > 0;
  const hasIsolation = (patient.isolationStatus?.length ?? 0) > 0;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(4px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        .amx-panel * { box-sizing: border-box; }
        .amx-panel {
          font-family: 'DM Sans', 'Helvetica Neue', Arial, sans-serif;
          color: #1e293b;
        }
        .amx-section-body {
          animation: fadeSlide 0.2s ease;
        }
        .amx-edit-btn:hover {
          background: #eff6ff !important;
          border-color: #93c5fd !important;
        }
        .amx-condition-tag {
          transition: transform 0.15s, box-shadow 0.15s;
          cursor: default;
        }
        .amx-condition-tag:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .amx-call-link:hover {
          background: #bbf7d0 !important;
        }
        .amx-section-header:hover {
          background: #f8fafc !important;
        }
      `}</style>

      <div className="amx-panel">

        {/* ── Risk Flags ── */}
        {hasRiskFlags && (
          <div style={{
            background: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: 10, padding: '8px 12px', marginBottom: 12,
            display: 'flex', flexWrap: 'wrap', gap: 6,
          }}>
            {patient.riskFlags!.map(flag => (
              <span key={flag} style={{ fontSize: 11, color: '#c2410c', fontWeight: 700 }}>
                ⚠ {flag}
              </span>
            ))}
          </div>
        )}

        {/* ── Isolation Status ── */}
        {hasIsolation && (
          <div style={{
            background: '#fdf4ff', border: '1px solid #e879f9',
            borderRadius: 10, padding: '8px 12px', marginBottom: 12,
          }}>
            {patient.isolationStatus!.map(s => (
              <div key={s} style={{ fontSize: 11, color: '#86198f', fontWeight: 700 }}>
                🦠 {s}
              </div>
            ))}
          </div>
        )}

        {/* ── Identity Card ── */}
        {!editing && (
          <div style={{
            background: 'linear-gradient(150deg, #f0f7ff 0%, #f8fafc 100%)',
            border: '1px solid #dbeafe', borderRadius: 14,
            padding: '20px 16px 18px', marginBottom: 20,
            textAlign: 'center', position: 'relative',
          }}>
            {/* Consent indicator */}
            <div
              title={consentGiven ? 'Consent active' : 'Consent pending'}
              style={{
                position: 'absolute', top: 13, right: 13,
                width: 9, height: 9, borderRadius: '50%',
                background: consentGiven ? '#22c55e' : '#f59e0b',
                boxShadow: `0 0 0 2.5px ${consentGiven ? '#dcfce7' : '#fef3c7'}`,
              }}
            />

            {/* Avatar */}
            <div style={{
              width: 76, height: 76, borderRadius: '50%',
              margin: '0 auto 12px', overflow: 'hidden',
              border: '3px solid #fff',
              boxShadow: '0 4px 16px rgba(37,99,235,0.18)',
              background: patient.photoUrl
                ? 'transparent'
                : 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-1px',
            }}>
              {patient.photoUrl
                ? <img src={patient.photoUrl} alt={patient.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getInitials(patient.name)
              }
            </div>

            {/* Name */}
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 3, letterSpacing: '-0.025em' }}>
              {patient.name}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
              {patient.age !== undefined ? `${patient.age} yrs` : '—'} · {patient.gender ?? '—'}
            </div>

            {/* Metric badges */}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {bloodStyle && patient.bloodGroup && (
                <span style={{
                  background: bloodStyle.bg, color: bloodStyle.text,
                  fontWeight: 800, fontSize: 11, padding: '3px 10px', borderRadius: 20,
                  border: `1px solid ${bloodStyle.text}25`,
                }}>
                  🩸 {patient.bloodGroup}
                </span>
              )}
              {patient.height && (
                <span style={{
                  background: '#f1f5f9', color: '#475569',
                  fontWeight: 600, fontSize: 11, padding: '3px 10px', borderRadius: 20,
                }}>
                  📏 {patient.height} cm
                </span>
              )}
              {patient.weight && (
                <span style={{
                  background: '#f1f5f9', color: '#475569',
                  fontWeight: 600, fontSize: 11, padding: '3px 10px', borderRadius: 20,
                }}>
                  ⚖️ {patient.weight} kg
                </span>
              )}
              {patient.bmi && (
                <span style={{
                  background: '#f1f5f9', color: '#475569',
                  fontWeight: 600, fontSize: 11, padding: '3px 10px', borderRadius: 20,
                }}>
                  BMI {patient.bmi}
                </span>
              )}
            </div>

            {/* Live vitals (wearable integration slot) */}
            {patient.vitals && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6 }}>
                {patient.vitals.hr !== undefined && (
                  <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 700 }}>
                    ❤️ {patient.vitals.hr} bpm
                  </span>
                )}
                {patient.vitals.spo2 !== undefined && (
                  <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 700 }}>
                    💧 SpO₂ {patient.vitals.spo2}%
                  </span>
                )}
              </div>
            )}

            {patient.primaryDoctorName && (
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
                Primary: <strong style={{ color: '#64748b' }}>Dr. {patient.primaryDoctorName}</strong>
              </div>
            )}
          </div>
        )}

        {/* ── Inline Edit Form ── */}
        {editing && (
          <div style={{
            border: '1.5px solid #bfdbfe', borderRadius: 14,
            padding: '16px', marginBottom: 20, background: '#f0f7ff',
          }}>
            <EditPanel patient={patient} onSave={handleSave} onCancel={() => setEditing(false)} />
          </div>
        )}

        {/* ── Allergies ── */}
        <div style={{ marginBottom: 12 }}>
          <SectionHeader
            icon="⚠️" label="Allergies"
            count={allergyCount}
            open={open.allergies}
            onToggle={() => toggle('allergies')}
            highlight={allergyCount > 0}
          />
          {open.allergies && (
            <div className="amx-section-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allergyCount > 0 ? patient.allergies!.map((a, i) => {
                const cfg = severityConfig[a.severity ?? 'Mild'];
                return (
                  <div key={i} style={{
                    background: cfg.bg,
                    border: `1px solid ${cfg.dot}25`,
                    borderLeft: `3px solid ${cfg.dot}`,
                    borderRadius: 8, padding: '9px 12px',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 2 }}>
                      {a.name}
                    </div>
                    {a.reaction && (
                      <div style={{ fontSize: 11, color: '#64748b' }}>Reaction: {a.reaction}</div>
                    )}
                    <div style={{ fontSize: 11, color: cfg.text, fontWeight: 600, marginTop: 3 }}>
                      {cfg.label}
                    </div>
                  </div>
                );
              }) : (
                <div style={{ fontSize: 13, color: '#94a3b8', padding: '4px 2px' }}>
                  No allergies on record
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 12px' }} />

        {/* ── Conditions ── */}
        <div style={{ marginBottom: 12 }}>
          <SectionHeader
            icon="🩺" label="Conditions"
            count={conditionCount}
            open={open.conditions}
            onToggle={() => toggle('conditions')}
          />
          {open.conditions && (
            <div className="amx-section-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {conditionCount > 0 ? patient.chronicConditions!.map(c => {
                const s = getConditionStyle(c);
                return (
                  <span className="amx-condition-tag" key={c} style={{
                    background: s.bg, color: s.text,
                    border: `1px solid ${s.border}`,
                    padding: '5px 12px', borderRadius: 20,
                    fontSize: 12, fontWeight: 600,
                  }}>
                    {c}
                  </span>
                );
              }) : (
                <span style={{ fontSize: 13, color: '#94a3b8' }}>No conditions recorded</span>
              )}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 12px' }} />

        {/* ── Emergency Contact ── */}
        <div style={{ marginBottom: 12 }}>
          <SectionHeader
            icon="🚨" label="Emergency Contact"
            open={open.emergency}
            onToggle={() => toggle('emergency')}
          />
          {open.emergency && (
            <div className="amx-section-body" style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 10, padding: '12px 14px',
            }}>
              {patient.emergencyContact?.name ? (
                <>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                    {patient.emergencyContact.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                    {patient.emergencyContact.relationship}
                  </div>
                  <a
                    className="amx-call-link"
                    href={`tel:${patient.emergencyContact.phone}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      background: '#dcfce7', color: '#15803d', borderRadius: 8,
                      padding: '7px 13px', textDecoration: 'none',
                      fontSize: 13, fontWeight: 700, transition: 'background 0.15s',
                    }}
                  >
                    📞 {patient.emergencyContact.phone}
                  </a>
                </>
              ) : (
                <span style={{ fontSize: 13, color: '#94a3b8' }}>No emergency contact on file</span>
              )}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 12px' }} />

        {/* ── Insurance ── */}
        <div style={{ marginBottom: 12 }}>
          <SectionHeader
            icon="🏥" label="Insurance"
            open={open.insurance}
            onToggle={() => toggle('insurance')}
          />
          {open.insurance && (
            <div className="amx-section-body" style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 10, padding: '12px 14px',
            }}>
              {patient.insurance?.provider ? (
                <>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                    {patient.insurance.provider}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontFamily: 'monospace' }}>
                    #{patient.insurance.number}
                  </div>
                </>
              ) : (
                <span style={{ fontSize: 13, color: '#94a3b8' }}>No insurance on file</span>
              )}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 12px' }} />

        {/* ── Next Appointment ── */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader
            icon="🗓" label="Next Appointment"
            open={open.appointment}
            onToggle={() => toggle('appointment')}
          />
          {open.appointment && (
            <div className="amx-section-body">
              {patient.nextAppointment ? (
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)',
                  border: '1px solid #bfdbfe', borderRadius: 10,
                  padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{
                    background: '#2563eb', color: '#fff', borderRadius: 8,
                    padding: '7px 12px', textAlign: 'center', minWidth: 48, flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>
                      {patient.nextAppointment.toDate().getDate()}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.85, marginTop: 2 }}>
                      {patient.nextAppointment.toDate().toLocaleString('en', { month: 'short' }).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                      {formatDate(patient.nextAppointment)}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {formatTime(patient.nextAppointment)}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#94a3b8' }}>No upcoming appointment</div>
              )}
            </div>
          )}
        </div>

        {/* ── Edit Button ── */}
        {!editing && (
          <button
            className="amx-edit-btn"
            onClick={() => setEditing(true)}
            style={{
              width: '100%', padding: '11px', borderRadius: 10,
              border: '1.5px solid #dbeafe', background: '#fff',
              color: '#2563eb', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
              fontFamily: 'inherit', letterSpacing: '0.01em',
            }}
          >
            ✏️ Edit Patient
          </button>
        )}
      </div>
    </>
  );
}