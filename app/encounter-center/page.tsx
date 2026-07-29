"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ClinicalEncounter } from "@/components/clinical-encounter/ClinicalEncounter"
import { PatientRegistration } from "@/components/clinical-encounter/PatientRegistration"
import { listRecentEncounters, loadEncounter, type SavedEncounter } from "@/lib/amexan/encounter/encounterPersistence"
import { getDefaultOrgId } from "@/lib/config"
import { useAuth } from "@/context/AuthContext"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"
import "../encounter-center/clinical-design.css"

export default function EncounterCenterPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const [mode, setMode] = useState<'landing' | 'register' | 'encounter'>('landing')
  const [showAuth, setShowAuth] = useState(false)
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authError, setAuthError] = useState('')
  const [patient, setPatient] = useState<{ name: string; age: number; sex: 'male' | 'female'; hospitalNumber: string } | null>(null)
  const [recentEncounters, setRecentEncounters] = useState<SavedEncounter[]>([])
  const [loadingEncounters, setLoadingEncounters] = useState(true)
  const [existingEncounterData, setExistingEncounterData] = useState<{ state: any; encounterId: string } | null>(null)

  useEffect(() => {
    listRecentEncounters(getDefaultOrgId(), 10)
      .then(setRecentEncounters)
      .catch(() => {})
      .finally(() => setLoadingEncounters(false))
  }, [])

  const handleRegister = () => {
    if (!user) {
      setShowAuth(true)
      return
    }
    setMode('register')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (!authEmail || !authPassword) { setAuthError('Email and password required'); return }
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword)
      setShowAuth(false)
      setAuthEmail('')
      setAuthPassword('')
    } catch (err: any) {
      setAuthError(err.message || 'Sign in failed')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (!authName || !authEmail || !authPassword) { setAuthError('All fields required'); return }
    if (authPassword.length < 6) { setAuthError('Password must be at least 6 characters'); return }
    try {
      const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword)
      await updateProfile(cred.user, { displayName: authName })
      setShowAuth(false)
      setAuthEmail('')
      setAuthPassword('')
      setAuthName('')
    } catch (err: any) {
      setAuthError(err.message || 'Sign up failed')
    }
  }

  const handleSignOut = async () => {
    await logout()
  }

  const handleOpenEncounter = async (enc: SavedEncounter) => {
    setLoadingEncounters(true)
    try {
      const loaded = await loadEncounter('telemed-a98cf', enc.encounterId)
      if (loaded && loaded.state) {
        setExistingEncounterData({ state: loaded.state, encounterId: enc.encounterId })
      } else {
        // Fallback: open with basic patient info
        setPatient({ name: enc.patientName, age: 30, sex: 'male', hospitalNumber: enc.hospitalNumber })
        setMode('encounter')
      }
    } catch {
      setPatient({ name: enc.patientName, age: 30, sex: 'male', hospitalNumber: enc.hospitalNumber })
      setMode('encounter')
    } finally {
      setLoadingEncounters(false)
    }
  }

  if (existingEncounterData) {
    const s = existingEncounterData.state
    return (
      <div>
        <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 9999, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setExistingEncounterData(null)} className="ec-btn-ghost-sm">← Back to List</button>
        </div>
        <ClinicalEncounter
          patientName={s?.biodata?.patientName || 'Patient'}
          patientAge={s?.biodata?.age || 30}
          patientSex={s?.biodata?.sex || 'male'}
          hospitalNumber={s?.biodata?.hospitalNumber || '—'}
          initialState={s}
          encounterId={existingEncounterData.encounterId}
        />
      </div>
    )
  }

  if (mode === 'register') {
    return (
      <PatientRegistration
        onComplete={(info) => {
          setPatient(info)
          setMode('encounter')
        }}
      />
    )
  }

  if (mode === 'encounter' && patient) {
    return (
      <ClinicalEncounter
        patientName={patient.name}
        patientAge={patient.age}
        patientSex={patient.sex}
        hospitalNumber={patient.hospitalNumber}
      />
    )
  }

  return (
    <div className="app-layout ec-light">
      <header className="app-header ec-light-header">
        <div className="app-header-left">
          <span className="app-brand ec-brand">
            <span className="app-brand-dot ec-brand-dot" />
            AMEXAN
          </span>
          <span className="header-tag ec-tag">Universal Encounter Center</span>
        </div>
        <div className="app-header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <span style={{ fontSize: 12, color: '#5F6368' }}>{user.email}</span>
              <button onClick={handleSignOut} className="ec-btn-ghost-sm">Sign Out</button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} className="ec-btn ec-btn-primary" style={{ fontSize: 12, padding: '6px 14px', border: 'none', cursor: 'pointer' }}>
              Sign In
            </button>
          )}
          <Link href="/" className="btn btn-ghost btn-sm ec-btn-ghost">← Home</Link>
        </div>
      </header>

      <div className="app-main" style={{ display: "block", overflow: "auto", background: "#FFFFFF" }}>
        <main className="app-content" style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 32 }}>
          <div className="ec-dash-grid">
            <div className="ec-dash-card ec-dash-card-primary" onClick={handleRegister} style={{ cursor: "pointer" }}>
              <div className="ec-dash-card-icon">✚</div>
              <div className="ec-dash-card-title">New Patient Encounter</div>
              <div className="ec-dash-card-desc">Register a new patient and begin full clinical workflow</div>
            </div>
            <div className="ec-dash-card ec-dash-card-emergency" onClick={handleRegister} style={{ cursor: "pointer" }}>
              <div className="ec-dash-card-icon">⚡</div>
              <div className="ec-dash-card-title">Emergency Entry</div>
              <div className="ec-dash-card-desc">Fast-track — triage, vitals, ABCDE assessment</div>
            </div>
            <Link href="/patients" className="ec-dash-card" style={{ textDecoration: 'none' }}>
              <div className="ec-dash-card-icon">🔍</div>
              <div className="ec-dash-card-title">Patient Search</div>
              <div className="ec-dash-card-desc">Search existing patients by name, ID, or hospital number</div>
            </Link>
            <div className="ec-dash-card">
              <div className="ec-dash-card-icon">📊</div>
              <div className="ec-dash-card-title">View Queue</div>
              <div className="ec-dash-card-desc">See all patients in queue across departments</div>
            </div>
          </div>

          <div className="ec-section">
            <div className="ec-section-header">
              <h2 className="ec-section-title">Recent Encounters</h2>
              <span className="ec-badge">
                {loadingEncounters ? '…' : `${recentEncounters.length} encounter${recentEncounters.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            {recentEncounters.length === 0 && !loadingEncounters ? (
              <div className="ec-empty">
                <div className="ec-empty-icon">📋</div>
                <div className="ec-empty-title">No Recent Encounters</div>
                <div className="ec-empty-desc">Encounters will appear here once you start seeing patients.</div>
                <button className="ec-btn ec-btn-primary" style={{ marginTop: 20 }} onClick={handleRegister}>
                  Start First Clinical Entry →
                </button>
              </div>
            ) : (
              <div className="ec-encounter-list">
                {recentEncounters.map(enc => (
                  <div key={enc.encounterId} className="ec-encounter-row" onClick={() => handleOpenEncounter(enc)} style={{ cursor: 'pointer' }}>
                    <span className="ec-encounter-hn">{enc.hospitalNumber || '—'}</span>
                    <span className="ec-encounter-name">{enc.patientName}</span>
                    <span className="ec-encounter-phase">{enc.currentPhase}</span>
                    <span className={`ec-encounter-status ec-status-${enc.status}`}>{enc.status}</span>
                    <span className="ec-encounter-date">
                      {enc.updatedAt ? new Date(enc.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ec-status-bar">
            <span className="ec-status-item">
              <span className="ec-status-dot ec-dot-ok" />
              System Operational
            </span>
            <span className="ec-status-item">CRL Engine: <strong>Active</strong></span>
            <span className="ec-status-item">Bayesian DDX: <strong>Loaded</strong></span>
            <span className="ec-status-item">200+ Clinical Rules: <strong>Ready</strong></span>
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="ec-auth-overlay">
          <div className="ec-auth-modal">
            <div className="ec-auth-tabs">
              <button onClick={() => { setAuthTab('signin'); setAuthError('') }}
                className={`ec-auth-tab ${authTab === 'signin' ? 'ec-auth-tab-active' : ''}`}>
                Sign In
              </button>
              <button onClick={() => { setAuthTab('signup'); setAuthError('') }}
                className={`ec-auth-tab ${authTab === 'signup' ? 'ec-auth-tab-active' : ''}`}>
                Sign Up
              </button>
            </div>

            <form onSubmit={authTab === 'signin' ? handleSignIn : handleSignUp}>
              {authTab === 'signup' && (
                <div style={{ marginBottom: 16 }}>
                  <label className="ec-auth-label">Full Name</label>
                  <input className="ec-auth-input" placeholder="e.g. Dr. Kaburu" value={authName} onChange={e => setAuthName(e.target.value)} autoFocus />
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label className="ec-auth-label">Email</label>
                <input className="ec-auth-input" type="email" placeholder="doctor@hospital.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                  autoFocus={authTab === 'signin'} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="ec-auth-label">Password</label>
                <input className="ec-auth-input" type="password" placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
              </div>

              {authError && <div className="ec-auth-error">{authError}</div>}

              <button type="submit" className="ec-auth-submit">
                {authTab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <button onClick={() => setShowAuth(false)} className="ec-auth-cancel">
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        .ec-light { background: #FFFFFF; color: #0F172A; font-family: 'Inter', system-ui, sans-serif; }
        .ec-light-header { background: #FFFFFF; border-bottom: 1px solid #E2E8F0; }
        .ec-brand { color: #0F172A; font-weight: 700; }
        .ec-brand-dot { background: #2F80ED; }
        .ec-tag { color: #94A3B8; border-left-color: #E2E8F0; }
        .ec-btn-ghost { color: #475569; }
        .ec-btn-ghost-sm { background: none; border: 1px solid #E2E8F0; border-radius: 6px; padding: 4px 10px; font-size: 11px; color: #475569; cursor: pointer; }
        .ec-btn-ghost-sm:hover { background: #F8FAFC; }
        .ec-dash-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
        .ec-dash-card {
          background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px;
          padding: 20px; transition: all 0.15s; display: block;
        }
        .ec-dash-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(47,128,237,0.10); border-color: #93C5FD; }
        .ec-dash-card-primary { border-left: 3px solid #2F80ED; }
        .ec-dash-card-emergency { border-left: 3px solid #EF4444; }
        .ec-dash-card-icon { font-size: 1.5rem; margin-bottom: 10px; }
        .ec-dash-card-title { font-weight: 600; color: #0F172A; font-size: 14px; margin-bottom: 4px; }
        .ec-dash-card-desc { font-size: 12px; color: #475569; line-height: 1.5; }
        .ec-section { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .ec-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .ec-section-title { font-size: 14px; font-weight: 600; color: #0F172A; }
        .ec-badge { font-size: 11px; padding: 2px 10px; border-radius: 999px; background: #EFF6FF; color: #2F80ED; font-weight: 500; }
        .ec-empty { text-align: center; padding: 48px 0; }
        .ec-empty-icon { font-size: 2.5rem; opacity: 0.3; margin-bottom: 8px; }
        .ec-empty-title { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 4px; }
        .ec-empty-desc { font-size: 12px; color: #94A3B8; }
        .ec-btn { padding: 10px 20px; border-radius: 8px; border: none; font-size: 13px; font-weight: 500; cursor: pointer; }
        .ec-btn-primary { background: #2F80ED; color: #FFFFFF; }
        .ec-btn-primary:hover { background: #2563EB; }
        .ec-encounter-list { display: flex; flex-direction: column; gap: 6px; }
        .ec-encounter-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 8px;
          background: #F8FAFC; border: 1px solid #E2E8F0;
          cursor: pointer; transition: all 0.12s;
        }
        .ec-encounter-row:hover { background: #EFF6FF; border-color: #93C5FD; }
        .ec-encounter-hn { font-size: 12px; font-weight: 600; color: #2F80ED; min-width: 120px; font-family: 'JetBrains Mono', monospace; }
        .ec-encounter-name { flex: 1; font-size: 13px; color: #0F172A; font-weight: 500; }
        .ec-encounter-phase { font-size: 11px; color: #64748B; text-transform: capitalize; }
        .ec-encounter-status { font-size: 11px; padding: 2px 8px; border-radius: 4px; text-transform: capitalize; font-weight: 500; }
        .ec-status-active { background: #ECFDF5; color: #059669; }
        .ec-status-completed { background: #F1F5F9; color: #94A3B8; }
        .ec-encounter-date { font-size: 11px; color: #94A3B8; }
        .ec-status-bar { display: flex; align-items: center; gap: 16px; padding: 12px 16px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px; }
        .ec-status-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #475569; }
        .ec-status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .ec-dot-ok { background: #10B981; }
        .ec-auth-overlay {
          position: fixed; inset: 0; z-index: 10000;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.97);
          font-family: 'Inter',system-ui,sans-serif;
          padding: 16px;
        }
        .ec-auth-modal {
          background: #FFFFFF; border: 1px solid #E2E8F0;
          border-radius: 16px; padding: 36px; width: 400px; max-width: 100%;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
        }
        .ec-auth-tabs {
          display: flex; gap: 0; margin-bottom: 24px;
          background: #F8FAFC; border-radius: 8px; padding: 3px;
        }
        .ec-auth-tab {
          flex: 1; padding: 8px 16px; border-radius: 6px; border: none;
          background: transparent; color: #0F172A; font-weight: 600;
          font-size: 13px; cursor: pointer; transition: all 0.15s;
        }
        .ec-auth-tab-active {
          background: #FFFFFF !important; color: #0F172A !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .ec-auth-label {
          display: block; font-size: 12px; font-weight: 500;
          color: #475569; margin-bottom: 6px;
        }
        .ec-auth-input {
          width: 100%; padding: 10px 14px; border-radius: 8px;
          border: 1px solid #E2E8F0; background: #FFFFFF;
          color: #0F172A; font-size: 14px; outline: none;
          box-sizing: border-box; font-family: inherit;
        }
        .ec-auth-input:focus { border-color: #2F80ED; box-shadow: 0 0 0 2px rgba(47,128,237,0.15); }
        .ec-auth-error { color: #EF4444; font-size: 13px; margin-bottom: 16px; }
        .ec-auth-submit {
          width: 100%; padding: 12px 24px; border-radius: 8px; border: none;
          background: #2F80ED; color: #FFFFFF; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: background 0.15s;
        }
        .ec-auth-submit:hover { background: #2563EB; }
        .ec-auth-cancel {
          display: block; margin: 16px auto 0; background: none; border: none;
          color: #94A3B8; font-size: 12px; cursor: pointer;
        }

        @media (max-width: 1024px) {
          .ec-dash-grid { grid-template-columns: 1fr 1fr; }
          .ec-auth-modal { padding: 28px 24px; }
        }
        @media (max-width: 640px) {
          .ec-dash-grid { grid-template-columns: 1fr; }
          .ec-auth-modal { padding: 24px 20px; border-radius: 12px; }
          .ec-auth-input { font-size: 16px; } /* prevent iOS zoom */
          .ec-status-bar { flex-wrap: wrap; gap: 8px; }
          .ec-status-item { font-size: 10px; }
          .app-header { flex-wrap: wrap; gap: 8px; padding: 10px 16px; }
          .header-tag { display: none; }
          .ec-encounter-row { flex-wrap: wrap; gap: 6px; padding: 8px 10px; }
          .ec-encounter-hn { min-width: 0; font-size: 11px; }
          .ec-encounter-name { font-size: 12px; min-width: 120px; }
          .ec-section { padding: 14px; }
          .ec-dash-card { padding: 16px; }
        }
      `}</style>
    </div>
  )
}
