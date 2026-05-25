'use client';
// ═══════════════════════════════════════════════════════════════════════════════
// app/doctor/patients/[patientId]/page.tsx  (or wherever your route lives)
// THE WALL — Complete clinical workstation entry point
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/lib/firebase';

// ── Panel Imports ─────────────────────────────────────────────────────────────
// Each of these is a separate file you need. See the BUILD LIST at the bottom.
import DoctorMonitoringPanel from '@/components/DoctorMonitoringPanel';
import PatientInfoPanel   from '@/components/PatientInfoPanel';
import { UnifiedTimeline }    from '@/components/UnifiedTimeline';
import { ChatPanel }          from '@/components/ChatPanel';
import { DocumentsPanel }     from '@/components/DocumentsPanel';
import ActionTray         from '@/components/ActionTray';
import PrintExportPanel   from '@/components/PrintExportPanel';
import { AlertsPanel }        from '@/components/AlertsPanel';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  dateOfBirth?: string;
  dob?: string;
  bloodGroup?: string;
  bmi?: number;
  height?: number;
  weight?: number;
  nhifNumber?: string;
  insurance?: string;
  phone?: string;
  email?: string;
  address?: string;
  location?: string;
  conditions?: string[];
  emergencyContact?: { name: string; relationship: string; phone: string };
  allergies?: { drug: string; reaction: string; severity: 'mild' | 'moderate' | 'severe' }[];
  chronicConditions?: string[];
  primaryDoctorId?: string;
  primaryDoctorName?: string;
  primaryDoctorSpec?: string;
  primaryDoctorFacility?: string;
  createdAt?: any;
  nextOfKin?: string;
  registeredAt?: any;
  lastVisit?: any;
  photoURL?: string;
}

export interface WallDoctor {
  uid: string;
  name: string;
  title?: string;
  specialty?: string;
  licenseNumber?: string;
  email?: string;
}

interface Doctor extends WallDoctor {}

// ─── Column/section definitions — drives both desktop and mobile nav ──────────
type SectionId = 'info' | 'monitoring' | 'timeline' | 'chat' | 'docs' | 'actions' | 'alerts';

const SECTIONS: { id: SectionId; icon: string; label: string; mobile: boolean }[] = [
  { id: 'info',       icon: '👤', label: 'Patient',    mobile: true  },
  { id: 'monitoring', icon: '📊', label: 'Monitoring',  mobile: true  },
  { id: 'timeline',   icon: '🗓️', label: 'Timeline',   mobile: true  },
  { id: 'chat',       icon: '💬', label: 'Chat',        mobile: true  },
  { id: 'docs',       icon: '📁', label: 'Documents',   mobile: false },
  { id: 'actions',    icon: '⚡', label: 'Actions',     mobile: true  },
  { id: 'alerts',     icon: '🔔', label: 'Alerts',      mobile: false },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#f0f4f8', fontFamily: "'DM Sans','Segoe UI',sans-serif",
    }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .sk {
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 10px;
        }
      `}</style>
      {/* Left col */}
      <div style={{ width: 300, borderRight: '1px solid #e2e9f3', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#fff' }}>
        <div className="sk" style={{ height: 120, borderRadius: 14 }} />
        <div className="sk" style={{ height: 40 }} />
        <div className="sk" style={{ height: 40 }} />
        <div className="sk" style={{ height: 40 }} />
        <div className="sk" style={{ height: 200, borderRadius: 14 }} />
      </div>
      {/* Center col */}
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="sk" style={{ height: 180, borderRadius: 16 }} />
        <div className="sk" style={{ height: 300, borderRadius: 16 }} />
        <div className="sk" style={{ height: 200, borderRadius: 16 }} />
      </div>
      {/* Right col */}
      <div style={{ width: 300, borderLeft: '1px solid #e2e9f3', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#fff' }}>
        <div className="sk" style={{ height: 80, borderRadius: 14 }} />
        <div className="sk" style={{ height: 120, borderRadius: 14 }} />
        <div className="sk" style={{ height: 300, borderRadius: 14 }} />
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#f8fafc', fontFamily: "'DM Sans',sans-serif",
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420, padding: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>
          Unable to Load Patient
        </div>
        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onRetry} style={{
            padding: '10px 22px', background: '#0aaa76', color: '#fff',
            border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>↺ Retry</button>
          <button onClick={() => window.history.back()} style={{
            padding: '10px 22px', background: 'transparent', color: '#64748b',
            border: '1.5px solid #e2e9f3', borderRadius: 10, fontWeight: 600, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>← Back</button>
        </div>
      </div>
    </div>
  );
}

// ─── Auth-not-ready gate ──────────────────────────────────────────────────────
function AuthGate({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#f8fafc', fontFamily: "'DM Sans',sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0d1b2a', marginBottom: 6 }}>
          Authentication Required
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          Please sign in to access patient records.
        </div>
        <button onClick={onRetry} style={{
          padding: '10px 22px', background: '#0aaa76', color: '#fff',
          border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Sign In</button>
      </div>
    </div>
  );
}

// ─── Top Bar (breadcrumb + tools) ─────────────────────────────────────────────
function TopBar({
  patient, doctor, activeSection, onSectionChange, alertCount, onPrint,
}: {
  patient: Patient;
  doctor: Doctor;
  activeSection: SectionId;
  onSectionChange: (s: SectionId) => void;
  alertCount: number;
  onPrint: () => void;
}) {
  const router = useRouter();

  return (
    <div style={{
      height: 52, background: '#0d1b2a', display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 12, flexShrink: 0, borderBottom: '1px solid #ffffff1a',
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      {/* Breadcrumb */}
      <button onClick={() => router.back()} style={{
        background: 'rgba(255,255,255,.08)', border: 'none', color: '#94a3b8',
        borderRadius: 7, padding: '5px 9px', cursor: 'pointer', fontSize: 12,
        fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
      }}>
        ← Patients
      </button>
      <span style={{ color: '#334155', fontSize: 14 }}>›</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {patient.photoURL ? (
          <img src={patient.photoURL} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: '#0aaa7630',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#0aaa76',
          }}>
            {patient.name?.charAt(0) || '?'}
          </div>
        )}
        <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{patient.name}</span>
        {patient.age && <span style={{ fontSize: 11, color: '#64748b' }}>· {patient.age} yrs</span>}
        {patient.chronicConditions?.slice(0, 2).map(c => (
          <span key={c} style={{
            fontSize: 9, background: '#0aaa7620', color: '#0aaa76', borderRadius: 99,
            padding: '2px 7px', fontWeight: 700, display: 'none',
          }} className="condition-badge">{c}</span>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Section nav (desktop: shown in top bar) */}
      <div style={{
        display: 'flex', gap: 2, background: 'rgba(255,255,255,.06)',
        borderRadius: 9, padding: 3,
      }}>
        {SECTIONS.filter(s => s.mobile).map(s => (
          <button key={s.id} onClick={() => onSectionChange(s.id)} style={{
            padding: '4px 10px', border: 'none', borderRadius: 7, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
            background: activeSection === s.id ? '#0aaa76' : 'transparent',
            color: activeSection === s.id ? '#fff' : '#64748b',
            display: 'flex', alignItems: 'center', gap: 4, transition: 'all .15s',
            position: 'relative',
          }}>
            {s.icon} {s.label}
            {s.id === 'alerts' && alertCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2, width: 7, height: 7,
                background: '#ef4444', borderRadius: '50%',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Tools */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onPrint} title="Print / Export" style={{
          background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)',
          color: '#94a3b8', borderRadius: 7, width: 32, height: 32, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
        }}>🖨️</button>
        <div style={{
          background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 7, padding: '0 9px', display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, color: '#64748b',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
          Dr. {doctor.name}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — PatientWallPage
// ═══════════════════════════════════════════════════════════════════════════════
export default function PatientWallPage() {
  const params    = useParams();
  const patientId = params?.patientId as string;

  // ── State ──────────────────────────────────────────────────────────────────
  const [patient,       setPatient]       = useState<Patient | null>(null);
  const [doctor,        setDoctor]        = useState<Doctor | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [authChecked,   setAuthChecked]   = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('monitoring');
  const [alertCount,    setAlertCount]    = useState(0);
  const [showPrint,     setShowPrint]     = useState(false);
  const [isMobile,      setIsMobile]      = useState(false);
  const retryCount = useRef(0);

  // ── Detect mobile ──────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const map: Record<string, SectionId> = {
        '1': 'info', '2': 'monitoring', '3': 'timeline',
        '4': 'chat', '5': 'docs',       '6': 'actions', '7': 'alerts',
      };
      if (map[e.key]) setActiveSection(map[e.key]);
      if (e.key === 'p' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setShowPrint(true); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setAuthChecked(true); setLoading(false); return; }

      // Fetch doctor profile from Firestore (doctors collection)
      try {
        const doctorSnap = await getDoc(doc(db, 'doctors', user.uid));
        if (doctorSnap.exists()) {
          const d = doctorSnap.data();
          setDoctor({
            uid:           user.uid,
            name:          d.name || user.displayName || 'Doctor',
            title:         d.title,
            specialty:     d.specialty,
            licenseNumber: d.licenseNumber,
            email:         user.email || d.email,
          });
        } else {
          // Fallback: use Firebase Auth display name only
          setDoctor({
            uid:  user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Doctor',
            email: user.email || undefined,
          });
        }
      } catch {
        setDoctor({
          uid:  user.uid,
          name: user.displayName || 'Doctor',
        });
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  // ── Patient real-time subscription ────────────────────────────────────────
  const fetchPatient = useCallback(() => {
    if (!patientId) { setError('No patient ID provided.'); setLoading(false); return; }

    const unsub = onSnapshot(
      doc(db, 'patients', patientId),
      (snap) => {
        if (!snap.exists()) {
          setError('Patient record not found. They may have been removed or you may not have access.');
          setLoading(false);
          return;
        }
        setPatient({ id: snap.id, ...snap.data() } as Patient);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Patient snapshot error:', err);
        if (err.code === 'permission-denied') {
          setError('Access denied. You do not have permission to view this patient record.');
        } else {
          setError('Failed to load patient data. Please check your connection and try again.');
        }
        setLoading(false);
      }
    );
    return unsub;
  }, [patientId]);

  useEffect(() => {
    if (!authChecked || !doctor) return;
    const unsub = fetchPatient();
    return () => unsub?.();
  }, [authChecked, doctor, fetchPatient]);

  // ── Guard states ───────────────────────────────────────────────────────────
  if (!authChecked || loading) return <Skeleton />;
  if (!doctor) return <AuthGate onRetry={() => window.location.href = '/auth/signin'} />;
  if (error) return <ErrorState message={error} onRetry={() => { retryCount.current++; setLoading(true); setError(null); fetchPatient(); }} />;
  if (!patient) return <ErrorState message="Patient data could not be loaded." onRetry={fetchPatient} />;

  // ─── Layout helpers ─────────────────────────────────────────────────────────
  const showSection = (id: SectionId) => isMobile ? activeSection === id : true;

  // ─── Desktop 3-column Wall ─────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden',
      background: '#f0f4f8', fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
        }

        @media (max-width: 900px) {
          .desktop-col { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>

      {/* ── Top Bar ── */}
      <div className="no-print">
        <TopBar
          patient={patient}
          doctor={doctor}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          alertCount={alertCount}
          onPrint={() => setShowPrint(true)}
        />
      </div>

      {/* ── Three-Column Body ── */}
      <div style={{
        flex: 1, display: 'flex', overflow: 'hidden', gap: 0,
        animation: 'fadeIn .25s ease-out',
      }}>

        {/* ══ LEFT COLUMN: Patient info + Timeline ══════════════════════════ */}
        <div
          className="desktop-col"
          style={{
            width: isMobile ? '100%' : 300,
            display: isMobile ? (showSection('info') || showSection('timeline') ? 'flex' : 'none') : 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e2e9f3',
            background: '#fff',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {/* Patient Info */}
          {(!isMobile || showSection('info')) && (
            <div style={{ flexShrink: 0, borderBottom: '1px solid #e8eef5' }}>
              <PatientInfoPanel patient={patient as any} doctor={doctor} />
            </div>
          )}

          {/* Timeline */}
          {(!isMobile || showSection('timeline')) && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
              <UnifiedTimeline patientId={patientId} doctorId={doctor.uid} />
            </div>
          )}
        </div>

        {/* ══ CENTRE COLUMN: Monitoring + Records ═══════════════════════════ */}
        <div style={{
          flex: 1,
          display: isMobile ? (showSection('monitoring') || showSection('chat') || showSection('docs') ? 'flex' : 'none') : 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0, // prevents flexbox overflow
        }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

            {/* Core: DoctorMonitoringPanel (always visible in centre) */}
            {(!isMobile || showSection('monitoring')) && (
              <DoctorMonitoringPanel
                patientId={patientId}
                patientName={patient.name}
                patientAge={patient.age}
                patientGender={patient.gender}
                doctor={doctor}
              />
            )}

            {/* Chat */}
            {(!isMobile || showSection('chat')) && (
              <div style={{ marginTop: 16 }}>
                <ChatPanel
                  patientId={patientId}
                  doctorId={doctor.uid}
                  doctorName={doctor.name}
                />
              </div>
            )}

            {/* Documents */}
            {(!isMobile || showSection('docs')) && (
              <div style={{ marginTop: 16 }}>
                <DocumentsPanel patientId={patientId} />
              </div>
            )}

          </div>
        </div>

        {/* ══ RIGHT COLUMN: Actions + Alerts + Print ═══════════════════════ */}
        <div
          className="desktop-col"
          style={{
            width: isMobile ? '100%' : 288,
            display: isMobile ? (showSection('actions') || showSection('alerts') ? 'flex' : 'none') : 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #e2e9f3',
            background: '#fff',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px' }}>

            {/* Quick action tray */}
            {(!isMobile || showSection('actions')) && (
              <ActionTray patientId={patientId} doctor={doctor} />
            )}

            {/* Alerts */}
            {(!isMobile || showSection('alerts')) && (
              <div style={{ marginTop: 14 }}>
                <AlertsPanel
                  patientId={patientId}
                  doctorId={doctor.uid}
                  onCountChange={setAlertCount}
                />
              </div>
            )}

            {/* Print/Export — always at bottom of right col */}
            {!isMobile && (
              <div style={{ marginTop: 14 }}>
                <PrintExportPanel
                  patient={patient}
                  patientId={patientId}
                  doctorId={doctor.uid}
                  doctorName={doctor.name}
                />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div
        className="no-print"
        style={{
          display: isMobile ? 'flex' : 'none',
          background: '#0d1b2a',
          borderTop: '1px solid #ffffff15',
          padding: '6px 8px',
          gap: 2,
          flexShrink: 0,
        }}
      >
        {SECTIONS.filter(s => s.mobile).map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              flex: 1, border: 'none', borderRadius: 8, padding: '7px 4px',
              background: activeSection === s.id ? '#0aaa76' : 'transparent',
              color: activeSection === s.id ? '#fff' : '#64748b',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              fontSize: 16, transition: 'all .15s',
            }}
          >
            {s.icon}
            <span style={{ fontSize: 8, fontWeight: 700 }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Print/Export Modal (triggered from top bar) ── */}
      {showPrint && (
        <PrintExportPanel
          patient={patient}
          patientId={patientId}
          doctorId={doctor.uid}
          doctorName={doctor.name}
          modal
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// ██████████████████████ BUILD LIST — READ THIS ████████████████████████████████
// ═══════════════════════════════════════════════════════════════════════════════
//
//  This page imports 8 components. Share your existing code for each one and
//  I will rewrite it to be production-complete. Here is exactly what each
//  component must do:
//
//  ┌─────────────────────────────────────────────────────────────────────────┐
//  │ 1. components/PatientInfoPanel.tsx                                      │
//  │    • Left column identity card                                           │
//  │    • Shows: photo/avatar, name, age, gender, blood group, BMI, height   │
//  │    • Allergies section: drug name + reaction + severity badge           │
//  │    • Chronic conditions as coloured tags                                 │
//  │    • Emergency contact (name, relationship, phone with click-to-call)   │
//  │    • Insurance / NHIF number                                             │
//  │    • Next appointment pill                                               │
//  │    • "Edit patient" button that opens inline edit form                  │
//  │    Props: patient: Patient, doctor: Doctor                              │
//  ├─────────────────────────────────────────────────────────────────────────┤
//  │ 2. components/UnifiedTimeline.tsx                                        │
//  │    • Chronological spine of the patient's history                       │
//  │    • Merges: toolReadings + clinicalNotes + prescriptions +             │
//  │      labOrders + imagingOrders + referrals + alerts — ordered by date   │
//  │    • Each event has: icon, type label, summary, timestamp, actor        │
//  │    • Filter chips at top: All / Readings / Notes / Rx / Labs / Imaging  │
//  │    • Drug events are rendered with a coloured left border               │
//  │    • Clicking any event opens the relevant detail modal                 │
//  │    Props: patientId: string, doctorId: string                           │
//  ├─────────────────────────────────────────────────────────────────────────┤
//  │ 3. components/ChatPanel.tsx                                              │
//  │    • Two-way message thread between doctor and patient                  │
//  │    • Collection: `messages` with patientId + doctorId + role + text    │
//  │    • Shows role-tagged bubbles (Doctor blue-left, Patient green-right)  │
//  │    • Attach button: can pin a reading or prescription to a message      │
//  │    • Timestamps, read receipts (doctor-sent only)                       │
//  │    • Template quick-replies: "Review booked", "Readings look good", … │
//  │    Props: patientId, doctorId, doctorName                               │
//  ├─────────────────────────────────────────────────────────────────────────┤
//  │ 4. components/DocumentsPanel.tsx                                         │
//  │    • Upload + list patient documents                                    │
//  │    • Firebase Storage under patients/{patientId}/docs/                  │
//  │    • File types: PDF, image, lab result image                           │
//  │    • Each doc: name, type tag, upload date, uploader, download link     │
//  │    • Category filter: All / Results / Imaging / Consent / Referrals    │
//  │    Props: patientId: string                                              │
//  ├─────────────────────────────────────────────────────────────────────────┤
//  │ 5. components/ActionTray.tsx                                             │
//  │    • Right column contextual quick-action panel                         │
//  │    • Shows patient's current triage level (derived from latest readings)│
//  │    • ONE-CLICK buttons: Write Note, Prescribe, Lab, Imaging, Refer,    │
//  │      Send Alert — each opens the corresponding modal from              │
//  │      DoctorMonitoringPanel (or its own modal)                           │
//  │    • Upcoming tasks: next review date, pending lab results, etc.        │
//  │    • Vital summary strip: latest BP, glucose, SpO2, weight in a row    │
//  │    Props: patientId, doctor, patient                                    │
//  ├─────────────────────────────────────────────────────────────────────────┤
//  │ 6. components/AlertsPanel.tsx                                            │
//  │    • Streams `alerts` collection filtered by patientId + doctorId      │
//  │    • Groups by urgency: Emergency → Urgent → Routine                   │
//  │    • Each alert: icon, title, message snippet, time, mark-read button  │
//  │    • Unread count badge forwarded up via onCountChange callback         │
//  │    • Auto-scrolls to newest                                             │
//  │    Props: patientId, doctorId, onCountChange: (n: number) => void      │
//  ├─────────────────────────────────────────────────────────────────────────┤
//  │ 7. components/PrintExportPanel.tsx                                       │
//  │    • Inline widget OR full modal (modal prop)                           │
//  │    • Section checklist: Patient Info / Monitoring Charts / SOAP Notes / │
//  │      Prescriptions / Lab Orders / Imaging / Referrals / Timeline        │
//  │    • Export as: Browser Print / PDF download / Referral Letter template │
//  │    • Referral Letter: pre-fills Dear Dr. X, patient summary, reason    │
//  │    • Uses @media print stylesheet to hide UI chrome                     │
//  │    Props: patient, patientId, doctorId, doctorName, modal?, onClose?   │
//  ├─────────────────────────────────────────────────────────────────────────┤
//  │ 8. components/DoctorMonitoringPanel.tsx (YOU ALREADY HAVE THIS)         │
//  │    • The large panel you shared — already complete                      │
//  │    • Small change: export type { ClinicalNote, Prescription, etc. }    │
//  │      so other panels can import them without redefining                 │
//  └─────────────────────────────────────────────────────────────────────────┘
//
//  FIRESTORE COLLECTIONS REQUIRED:
//  ─────────────────────────────────
//  patients/{patientId}           — patient profile doc
//  doctors/{uid}                  — doctor profile (name, specialty, license)
//  toolAssignments                — monitoring tool assignments
//  toolReadings                   — patient readings
//  clinicalNotes                  — SOAP + progress notes
//  prescriptions                  — medication prescriptions
//  labOrders                      — lab test orders
//  imagingOrders                  — imaging/radiology orders
//  referrals                      — specialist referrals
//  alerts                         — notifications sent to patients
//  messages                       — doctor↔patient chat messages
//  patientConsent                 — consent grants
//  services                       — available doctors/specialties directory
//  documents                      — uploaded file metadata
//
//  FIRESTORE SECURITY RULES (minimum):
//  ─────────────────────────────────────
//  All collections except patients/doctors must require:
//    request.auth.uid == resource.data.doctorId   (doctor reads)
//    OR
//    request.auth.uid == resource.data.patientId  (patient reads their own)
//
//  NEXT STEPS — share these files and I'll make them best-in-class:
//  ─────────────────────────────────────────────────────────────────
//  Priority 1 (core): PatientInfoPanel, UnifiedTimeline, ActionTray
//  Priority 2 (comms): ChatPanel, AlertsPanel
//  Priority 3 (records): DocumentsPanel, PrintExportPanel
//  Priority 4 (utils): lib/firebase.ts, lib/diseaseTools.ts, lib/triageRules.ts
//
// ═══════════════════════════════════════════════════════════════════════════════