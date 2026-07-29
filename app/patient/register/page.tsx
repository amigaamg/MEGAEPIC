'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import {
  generateAmxpId,
  createEmptyPatientIdentity,
  computeTrustScore,
} from '@/lib/amexan/patient-constitution'
import {
  createRegistrationState,
  validateStage1,
  validateStage2,
  canAdvanceStage,
  getNextStage,
  getStageLabel,
  getStageDescription,
  getStageProgress,
  COUNTRIES,
  BLOOD_GROUPS,
  ID_TYPES,
  LANGUAGES,
  KENYA_COUNTIES,
} from '@/lib/amexan/patient-constitution/registration'
import {
  type RegistrationStage,
  type RegistrationState,
  type RegistrationData,
} from '@/lib/amexan/patient-constitution/types'
import type { PatientIdentity, AmxpId, PatientVerificationLevel } from '@/lib/amexan/patient-constitution/types'
import { Check, ChevronRight, ChevronLeft, UserPlus, Mail, Phone, Shield, Globe, Heart, Users, FileText } from 'lucide-react'

const S = {
  page: { minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' },
  header: { height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 },
  card: { padding: 24, maxWidth: 720, margin: '0 auto' },
  panel: { padding: 24, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' },
  input: { width: '100%', minHeight: 48, height: 'auto', padding: '0 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 16, outline: 'none', transition: 'border-color .2s', boxSizing: 'border-box' as const },
  inputErr: { width: '100%', minHeight: 48, height: 'auto', padding: '0 14px', borderRadius: 8, border: '1px solid var(--red)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 16, outline: 'none', boxSizing: 'border-box' as const },
  select: { width: '100%', minHeight: 48, height: 'auto', padding: '0 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 16, outline: 'none', appearance: 'none' as const, cursor: 'pointer' },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' },
  error: { fontSize: 11, color: 'var(--red)', marginTop: 3 },
  stepDot: (active: boolean, done: boolean) => ({
    width: 32, height: 32, borderRadius: '50%',
    background: done ? 'var(--green)' : active ? 'var(--primary)' : 'var(--surface-border)',
    color: done || active ? 'white' : 'var(--text-muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, flexShrink: 0,
  }),
  btn: { minHeight: 48, padding: '0 24px', borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' },
  btnO: (disabled?: boolean) => ({ minHeight: 48, padding: '0 24px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'transparent', fontSize: 15, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontFamily: 'var(--font-sans)' }),
}

function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <div style={S.label}>{label}{required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}</div>
      {children}
      {error && <div style={S.error}>{error}</div>}
    </div>
  )
}

const STAGES: { id: RegistrationStage; icon: any; label: string }[] = [
  { id: 0, icon: Mail, label: 'Contact' },
  { id: 1, icon: UserPlus, label: 'Identity' },
  { id: 2, icon: Heart, label: 'Clinical' },
  { id: 3, icon: Shield, label: 'Verification' },
  { id: 4, icon: FileText, label: 'Review' },
]

export default function PatientRegistrationPage() {
  const router = useRouter()
  const topRef = useRef<HTMLDivElement>(null)

  const [state, setState] = useState<RegistrationState>(createRegistrationState('self'))
  const [identity, setIdentity] = useState<PatientIdentity>(createEmptyPatientIdentity())
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const stage = state.stage

  const updateData = useCallback((stageKey: keyof RegistrationData, fields: Partial<RegistrationData[keyof RegistrationData]>) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [stageKey]: { ...prev.data[stageKey], ...fields },
      },
      errors: {},
    }))
  }, [])

  const updateStage1 = (fields: Partial<RegistrationData['stage1']>) => updateData('stage1', fields)
  const updateStage2 = (fields: Partial<RegistrationData['stage2']>) => updateData('stage2', fields)
  const updateStage3 = (fields: Partial<RegistrationData['stage3']>) => updateData('stage3', fields)

  const showError = useCallback((msg: string) => {
    setGlobalError(msg)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  async function handleNext() {
    setGlobalError(null)
    const { canAdvance, errors } = canAdvanceStage(state)
    if (!canAdvance) {
      setState(prev => ({ ...prev, errors }))
      const msgs = Object.values(errors).filter(Boolean)
      if (msgs.length > 0) showError(msgs[0]!)
      return
    }

    if (stage === 0) {
      setLoading(true)
      try {
        const { stage1 } = state.data
        const email = stage1.email || `${stage1.phone.replace(/\D/g, '').slice(-9)}@patient.amexan.dev`
        const password = stage1.phone.replace(/\D/g, '').slice(-6) + 'Pass!'
        await createUserWithEmailAndPassword(auth, email, password)
        const amxpId = generateAmxpId('patient')
        setIdentity(prev => ({ ...prev, amxpId, human: { ...prev.human, email, phone: stage1.phone } }))
        await setDoc(doc(db, 'patient_registrations', email.replace(/[^a-zA-Z0-9]/g, '_')), {
          amxpId,
          email,
          phone: stage1.phone,
          stage: 0,
          createdAt: serverTimestamp(),
        })
      } catch (err: any) {
        const msg = err.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : 'Registration failed. Please try again.'
        showError(msg)
        setLoading(false)
        return
      }
      setLoading(false)
    }

    const next = getNextStage(stage)
    if (next !== null) {
      setState(prev => ({ ...prev, stage: next }))
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function handleBack() {
    if (stage > 0) {
      setState(prev => ({ ...prev, stage: (prev.stage - 1) as RegistrationStage }))
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function handleSubmit() {
    setLoading(true)
    setTimeout(() => {
      const { human } = identity
      human.fullName = `${state.data.stage2.givenName} ${state.data.stage2.familyName}`
      human.dateOfBirth = state.data.stage2.dateOfBirth
      human.sex = state.data.stage2.sex
      human.nationality = state.data.stage2.nationality

      const updatedIdentity = { ...identity, human, verification: { ...identity.verification, level: 1 as PatientVerificationLevel, emailVerified: true } }
      computeTrustScore(updatedIdentity)
      setIdentity(updatedIdentity)
      setCompleted(true)
      setLoading(false)
    }, 800)
  }

  if (completed) {
    return (
      <div style={S.page}>
        <div style={S.header}><UserPlus size={18} color="var(--primary)" /><span style={{ fontSize: 15, fontWeight: 700 }}>Registration Complete</span></div>
        <div style={{ ...S.card, textAlign: 'center', paddingTop: 60 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={36} color="var(--green)" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Welcome to AMEXAN</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 24px' }}>
            Your lifelong health account is ready. Your AMEXAN Patient ID:
          </p>
          <div style={{ padding: '16px 24px', background: 'var(--primary-light)', borderRadius: 12, border: '1px solid var(--sky-200)', display: 'inline-block' }}>
            <code style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1 }}>{identity.amxpId}</code>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            Trust Score: {identity.trust.score}/100 • Verification Level: {getStageLabel(1)}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
            <button onClick={() => router.push('/dashboard/patient')} style={{ ...S.btn, background: 'var(--primary)', color: 'white' }}>
              Go to Dashboard <ChevronRight size={16} />
            </button>
            <button onClick={() => router.push('/dashboard/patient/appointments')} style={S.btnO()}>
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page} ref={topRef}>
      <div style={S.header}>
        <UserPlus size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Patient Registration</span>
      </div>

      <div style={S.card}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, alignItems: 'center', justifyContent: 'center' }}>
          {STAGES.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
              <div style={S.stepDot(s.id === stage, s.id < stage)}>
                {s.id < stage ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: s.id === stage ? 600 : 400, color: s.id === stage ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
              {i < STAGES.length - 1 && (
                <div style={{ flex: 1, height: 2, background: s.id < stage ? 'var(--green)' : 'var(--surface-border)', borderRadius: 1, marginLeft: 4 }} />
              )}
            </div>
          ))}
        </div>

        <div style={S.panel}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{getStageLabel(stage)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>{getStageDescription(stage)}</div>

          <div style={{ width: '100%', height: 4, background: 'var(--surface-border)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ width: `${getStageProgress(stage)}%`, height: '100%', background: 'var(--primary)', borderRadius: 2, transition: 'width .4s ease' }} />
          </div>

          {globalError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--red-bg)', border: '1px solid var(--red-border)', color: 'var(--red)', fontSize: 12, marginBottom: 16 }} role="alert">
              {globalError}
            </div>
          )}

          {/* ═══ STAGE 0: Quick Registration ═══ */}
          {stage === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Email Address" required>
                  <input type="email" style={S.input} value={state.data.stage1.email} onChange={e => updateStage1({ email: e.target.value })} placeholder="you@example.com" autoComplete="email" inputMode="email" />
                </Field>
                <Field label="Phone Number" required>
                  <input type="tel" style={S.input} value={state.data.stage1.phone} onChange={e => updateStage1({ phone: e.target.value })} placeholder="+254 712 345 678" autoComplete="tel" inputMode="tel" />
                </Field>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--surface-border)' }}>
                A secure account will be created using your email or phone. You can add more details later.
              </div>
            </div>
          )}

          {/* ═══ STAGE 1: Personal Identity ═══ */}
          {stage === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Given Name / First Name" required error={state.errors.givenName}>
                  <input style={state.errors.givenName ? S.inputErr : S.input} type="text" value={state.data.stage2.givenName} onChange={e => updateStage2({ givenName: e.target.value })} placeholder="Jane" />
                </Field>
                <Field label="Family Name / Last Name" required error={state.errors.familyName}>
                  <input style={state.errors.familyName ? S.inputErr : S.input} type="text" value={state.data.stage2.familyName} onChange={e => updateStage2({ familyName: e.target.value })} placeholder="Smith" />
                </Field>
              </div>
              <Field label="Full Name" required error={state.errors.fullName}>
                <input style={state.errors.fullName ? S.inputErr : S.input} type="text" value={state.data.stage2.fullName} onChange={e => updateStage2({ fullName: e.target.value })} placeholder="Jane Smith" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Date of Birth" required error={state.errors.dateOfBirth}>
                  <input style={state.errors.dateOfBirth ? S.inputErr : S.input} type="date" value={state.data.stage2.dateOfBirth} onChange={e => updateStage2({ dateOfBirth: e.target.value })} />
                </Field>
                <Field label="Sex" required>
                  <select style={S.select} value={state.data.stage2.sex} onChange={e => updateStage2({ sex: e.target.value as any })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="undisclosed">Prefer not to say</option>
                  </select>
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Nationality" required error={state.errors.nationality}>
                  <select style={state.errors.nationality ? S.inputErr : S.select} value={state.data.stage2.nationality} onChange={e => updateStage2({ nationality: e.target.value })}>
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Preferred Language">
                  <select style={S.select} value={state.data.stage2.preferredLanguage} onChange={e => updateStage2({ preferredLanguage: e.target.value })}>
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="County / Region">
                <select style={S.select} value={state.data.stage2.address.county} onChange={e => updateStage2({ address: { ...state.data.stage2.address, county: e.target.value } })}>
                  <option value="">Select county...</option>
                  {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* ═══ STAGE 2: Clinical Identity ═══ */}
          {stage === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="National ID Type">
                  <select style={S.select} value={state.data.stage3.nationalIdType} onChange={e => updateStage3({ nationalIdType: e.target.value })}>
                    <option value="">Select ID type...</option>
                    {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="ID Number">
                  <input style={S.input} type="text" value={state.data.stage3.nationalId} onChange={e => updateStage3({ nationalId: e.target.value })} placeholder="ID Number" />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Blood Group">
                  <select style={S.select} value={state.data.stage3.bloodGroup} onChange={e => updateStage3({ bloodGroup: e.target.value })}>
                    <option value="">Select blood group...</option>
                    {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Pregnancy Status (if applicable)">
                  <select style={S.select} value={state.data.stage3.pregnancyStatus} onChange={e => updateStage3({ pregnancyStatus: e.target.value as any })}>
                    <option value="unknown">Not sure</option>
                    <option value="none">Not pregnant</option>
                    <option value="pregnant">Pregnant</option>
                    <option value="breastfeeding">Breastfeeding</option>
                  </select>
                </Field>
              </div>
              <Field label="Known Allergies (comma separated)">
                <input style={S.input} type="text" value={state.data.stage3.allergies.join(', ')} onChange={e => updateStage3({ allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Penicillin, Sulfa, Latex, etc." />
              </Field>
              <Field label="Existing Conditions (comma separated)">
                <input style={S.input} type="text" value={state.data.stage3.existingConditions.join(', ')} onChange={e => updateStage3({ existingConditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Diabetes, Hypertension, Asthma, etc." />
              </Field>
              <Field label="Current Medications (comma separated)">
                <input style={S.input} type="text" value={state.data.stage3.currentMedications.join(', ')} onChange={e => updateStage3({ currentMedications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Metformin, Amlodipine, etc." />
              </Field>
              <Field label="Insurance Provider">
                <input style={S.input} type="text" value={state.data.stage3.insuranceProvider || ''} onChange={e => updateStage3({ insuranceProvider: e.target.value })} placeholder="NHIF, AAR, Jubilee, etc." />
              </Field>
            </div>
          )}

          {/* ═══ STAGE 3: Verification ═══ */}
          {stage === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 16, background: 'var(--primary-light)', borderRadius: 8, border: '1px solid var(--sky-200)', fontSize: 12 }}>
                <strong style={{ color: 'var(--primary)' }}>Verification</strong>
                <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)' }}>
                  Verification increases your trust score and unlocks more features. You can verify later from your profile settings.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Email Verification', checked: true, desc: 'Your email will be verified automatically' },
                  { label: 'Phone Verification', checked: true, desc: 'OTP will be sent to your phone' },
                  { label: 'Government ID Verification', checked: false, desc: 'Upload your ID document' },
                  { label: 'Facility Visit Verification', checked: false, desc: 'Visit a partner facility for in-person verification' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 8, background: item.checked ? 'var(--sky-50)' : 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.checked ? 'var(--green)' : 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      {item.checked && <Check size={12} color="white" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STAGE 4: Review ═══ */}
          {stage === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Name', value: `${state.data.stage2.givenName} ${state.data.stage2.familyName}` },
                  { label: 'Date of Birth', value: state.data.stage2.dateOfBirth },
                  { label: 'Sex', value: state.data.stage2.sex },
                  { label: 'Nationality', value: state.data.stage2.nationality },
                  { label: 'Email', value: state.data.stage1.email || 'Provided via phone' },
                  { label: 'Phone', value: state.data.stage1.phone },
                  { label: 'Blood Group', value: state.data.stage3.bloodGroup || 'Not specified' },
                  { label: 'Allergies', value: state.data.stage3.allergies.length > 0 ? state.data.stage3.allergies.join(', ') : 'None reported' },
                  { label: 'Conditions', value: state.data.stage3.existingConditions.length > 0 ? state.data.stage3.existingConditions.join(', ') : 'None reported' },
                  { label: 'Insurance', value: state.data.stage3.insuranceProvider || 'Not specified' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontWeight: 500 }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '12px', background: 'var(--primary-light)', borderRadius: 8, border: '1px solid var(--sky-200)', marginTop: 4 }}>
                By creating this account, you agree to AMEXAN's Terms of Service and Privacy Policy. Your data is encrypted and protected.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button onClick={handleBack} disabled={stage === 0} style={S.btnO(stage === 0)}>
              <ChevronLeft size={16} /> Back
            </button>
            {stage < 4 ? (
              <button onClick={handleNext} disabled={loading} style={{ ...S.btn, background: 'var(--primary)', color: 'white', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Processing...' : 'Continue'} <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ ...S.btn, background: 'var(--primary)', color: 'white', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Creating Account...' : 'Complete Registration'} <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
