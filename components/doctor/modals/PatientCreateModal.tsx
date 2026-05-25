'use client';

import React, { useState, useCallback } from 'react';

interface ClinicOption { id: string; name: string; specialty: string; }
interface PathwayOption { id: string; name: string; condition: string; }

interface Props {
  onClose?: () => void;
  onCreatePatient: (data: PatientFormData) => Promise<{ uid: string } | null>;
  clinics: ClinicOption[];
  pathways: PathwayOption[];
  doctorSpecialty: string;
}

export interface PatientFormData {
  firstName: string; lastName: string; dateOfBirth?: string; age?: number; ageUnit?: 'years'|'months'|'days';
  gender: string; phone: string; email?: string;
  emergencyContact?: string; emergencyName?: string; emergencyRelation?: string;
  address?: string; city?: string; state?: string;
  occupation?: string; maritalStatus?: string;
  bloodType?: string; genotype?: string;
  allergies?: string[]; chronicConditions?: string[];
  currentMedications?: string[];
  nokName?: string; nokPhone?: string; nokRelation?: string;
  insuranceProvider?: string; insuranceNumber?: string;
  clinicId?: string; pathwayId?: string; wardId?: string;
  notes?: string; source?: 'walkin'|'referral'|'emergency'|'transfer'|'online';
}

type Step = 'select' | 'quick' | 'full' | 'assign' | 'success';

const GENDERS = ['Male','Female','Other'];
const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const GENOTYPES = ['AA','AS','SS','AC','SC'];
const SOURCES = [
  { value: 'walkin', label: 'Walk-in', icon: '🚶' },
  { value: 'referral', label: 'Referral', icon: '📋' },
  { value: 'emergency', label: 'Emergency', icon: '🚨' },
  { value: 'transfer', label: 'Transfer', icon: '🔄' },
  { value: 'online', label: 'Online Booking', icon: '🌐' },
];

export default function PatientCreateModal({ onClose, onCreatePatient, clinics, pathways, doctorSpecialty }: Props) {
  const [step, setStep] = useState<Step>('select');
  const [saving, setSaving] = useState(false);
  const [createdUid, setCreatedUid] = useState<string | null>(null);

  const [form, setForm] = useState<PatientFormData>({
    firstName: '', lastName: '', gender: 'Male', phone: '',
    allergies: [], chronicConditions: [], currentMedications: [],
    source: 'walkin',
  });

  const update = useCallback((k: keyof PatientFormData, v: any) => setForm(f => ({ ...f, [k]: v })), []);

  const handleReset = () => {
    setForm({ firstName: '', lastName: '', gender: 'Male', phone: '', source: 'walkin' });
    setStep('select');
    setCreatedUid(null);
  };

  const quickValid = form.firstName && form.lastName && form.gender && (form.dateOfBirth || form.age) && form.phone;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const result = await onCreatePatient(form);
      if (result?.uid) { setCreatedUid(result.uid); setStep('success'); }
    } catch (e) { console.error('Create patient failed:', e); } finally { setSaving(false); }
  };

  const inpStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none',
    transition: 'border-color .15s',
  };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4, display: 'block' };

  const content = (
    <>
      {step === 'select' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>Choose registration mode:</p>
          <div onClick={() => setStep('quick')} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 24px', borderRadius: 14, cursor: 'pointer',
            background: 'var(--bg)', border: '2px solid var(--accent-dim)',
          }}>
            <div style={{ fontSize: 36 }}>⚡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Quick Registration</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Name, demographics & contact — done in 30 seconds. Assign later.</div>
            </div>
          </div>
          <div onClick={() => setStep('full')} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 24px', borderRadius: 14, cursor: 'pointer',
            background: 'var(--bg)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 36 }}>📋</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Full Registration</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Complete demographics, medical history, NOK, insurance & assign to clinic.</div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 24px', borderRadius: 14, cursor: 'pointer',
            background: 'var(--bg)', border: '1px dashed var(--border)',
          }}>
            <div style={{ fontSize: 36 }}>📦</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Bulk Import</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Import multiple patients via CSV/Excel (coming soon).</div>
            </div>
          </div>
        </div>
      )}

      {(step === 'quick' || step === 'full') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>First Name *</label>
              <input style={inpStyle} value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="John" />
            </div>
            <div>
              <label style={labelStyle}>Last Name *</label>
              <input style={inpStyle} value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Doe" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Gender *</label>
              <select style={inpStyle} value={form.gender} onChange={e => update('gender', e.target.value)}>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input style={inpStyle} type="date" value={form.dateOfBirth||''} onChange={e => {
                update('dateOfBirth', e.target.value);
                if (e.target.value) { update('age', undefined); update('ageUnit', undefined); }
              }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Age (if DOB unknown)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={inpStyle} type="number" min={0} max={150} value={form.age||''} onChange={e => {
                  update('age', parseInt(e.target.value)||undefined);
                  if (e.target.value) { update('dateOfBirth', ''); }
                }} placeholder="35" />
                <select style={{ ...inpStyle, width: 100 }} value={form.ageUnit||'years'} onChange={e => update('ageUnit', e.target.value)}>
                  <option value="years">Yrs</option>
                  <option value="months">Mo</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Phone *</label>
              <input style={inpStyle} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+254 712 345 678" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inpStyle} type="email" value={form.email||''} onChange={e => update('email', e.target.value)} placeholder="john@example.com" />
          </div>
          <div>
            <label style={labelStyle}>Source</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SOURCES.map(s => (
                <button key={s.value} className={`filter-chip ${form.source===s.value?'active':''}`} onClick={() => update('source', s.value)}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Emergency Contact</label>
            <input style={inpStyle} value={form.emergencyContact||''} onChange={e => update('emergencyContact', e.target.value)} placeholder="+254 712 345 678" />
          </div>
          {step === 'full' && (
            <>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🩺 Medical Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Blood Type</label>
                    <select style={inpStyle} value={form.bloodType||''} onChange={e => update('bloodType', e.target.value)}>
                      <option value="">— Select —</option>
                      {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Genotype</label>
                    <select style={inpStyle} value={form.genotype||''} onChange={e => update('genotype', e.target.value)}>
                      <option value="">— Select —</option>
                      {GENOTYPES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Allergies</label>
                  <input style={inpStyle} value={form.allergies?.join(', ')||''} onChange={e => update('allergies', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="Penicillin, Sulfa, Latex (comma separated)" />
                </div>
                <div>
                  <label style={labelStyle}>Chronic Conditions</label>
                  <input style={inpStyle} value={form.chronicConditions?.join(', ')||''} onChange={e => update('chronicConditions', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="Hypertension, Diabetes, Asthma" />
                </div>
                <div>
                  <label style={labelStyle}>Current Medications</label>
                  <input style={inpStyle} value={form.currentMedications?.join(', ')||''} onChange={e => update('currentMedications', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="Amlodipine 5mg, Metformin 500mg" />
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>👤 Next of Kin</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>NOK Name</label>
                    <input style={inpStyle} value={form.nokName||''} onChange={e => update('nokName', e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label style={labelStyle}>NOK Phone</label>
                    <input style={inpStyle} value={form.nokPhone||''} onChange={e => update('nokPhone', e.target.value)} placeholder="+254 712 345 679" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Relation</label>
                  <input style={inpStyle} value={form.nokRelation||''} onChange={e => update('nokRelation', e.target.value)} placeholder="Spouse, Parent, Sibling" />
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🏥 Insurance</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Provider</label>
                    <input style={inpStyle} value={form.insuranceProvider||''} onChange={e => update('insuranceProvider', e.target.value)} placeholder="NHIF, AAR, Jubilee" />
                  </div>
                  <div>
                    <label style={labelStyle}>Policy Number</label>
                    <input style={inpStyle} value={form.insuranceNumber||''} onChange={e => update('insuranceNumber', e.target.value)} placeholder="NHIF123456" />
                  </div>
                </div>
              </div>
            </>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="btn-secondary" onClick={() => setStep('select')} style={{ flex: 1 }}>Back</button>
            <button className="btn-accent" onClick={() => setStep('assign')} style={{ flex: 2 }} disabled={!quickValid}>
              {!quickValid ? 'Complete required fields →' : 'Continue to Assignment →'}
            </button>
          </div>
        </div>
      )}

      {step === 'assign' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📌</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Almost done — assign {form.firstName} {form.lastName}</div>
          </div>
          <div>
            <label style={labelStyle}>Assign to Clinic</label>
            <select style={inpStyle} value={form.clinicId||''} onChange={e => update('clinicId', e.target.value)}>
              <option value="">— No clinic assignment —</option>
              {clinics.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.specialty})</option>))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Enroll in Care Pathway</label>
            <select style={inpStyle} value={form.pathwayId||''} onChange={e => update('pathwayId', e.target.value)}>
              <option value="">— No pathway —</option>
              {pathways.map(p => (<option key={p.id} value={p.id}>{p.name} — {p.condition}</option>))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Admit to Ward (optional)</label>
            <select style={inpStyle} value={form.wardId||''} onChange={e => update('wardId', e.target.value)}>
              <option value="">— Outpatient —</option>
              <option value="general_ward">General Ward</option>
              <option value="maternity">Maternity</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="icu">ICU</option>
              <option value="hdu">HDU</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Clinical Notes</label>
            <textarea style={{ ...inpStyle, minHeight: 80, resize: 'vertical' }} value={form.notes||''} onChange={e => update('notes', e.target.value)} placeholder="Reason for visit, presenting complaint, triage notes…" />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="btn-secondary" onClick={() => setStep('full')} style={{ flex: 1 }}>← Back</button>
            <button className="btn-accent" onClick={handleSubmit} disabled={saving} style={{ flex: 2 }}>
              {saving ? '⏳ Creating Patient…' : '✅ Create Patient'}
            </button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 900, fontSize: 20 }}>Patient Created Successfully</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {form.firstName} {form.lastName} has been registered{form.clinicId ? ' and assigned to clinic' : ''}{form.pathwayId ? ' and enrolled in care pathway' : ''}.
          </div>
          {createdUid && <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>ID: {createdUid}</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
            <button className="btn-accent" onClick={handleReset}>➕ Register Another</button>
            {onClose && <button className="btn-secondary" onClick={onClose}>Done</button>}
          </div>
        </div>
      )}
    </>
  );

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{content}</div>;
}
