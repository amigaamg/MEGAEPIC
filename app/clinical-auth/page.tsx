'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  initAuthPersistence,
  createUserProfile,
  getUserProfile,
  checkAccountType,
  AccountTypeMismatchError,
  type AccountType,
  type ClinicianRole,
  type ClinicianProfile,
  type FacilityProfile,
  type UserProfile,
} from '@/lib/firebase/authService';
import {
  createOrganization,
} from '@/lib/firebase/organizationService';
import { seedOrganization } from '@/lib/firebase/seedService';

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:#070B14;color:#E2E8F0;overflow-x:hidden;min-height:100vh}
  body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background-image:radial-gradient(circle at 50% 30%,rgba(99,102,241,.08) 0%,transparent 40%),radial-gradient(circle at 80% 70%,rgba(6,182,212,.04) 0%,transparent 40%)}
  .bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse at 50% 30%,black 30%,transparent 70%)}
  .page{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 5%}

  .gate-container{max-width:560px;width:100%}
  .gate-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:100px;border:1px solid rgba(6,182,212,.2);background:rgba(6,182,212,.06);font-size:.625rem;color:#06B6D4;font-weight:500;letter-spacing:.06em;text-transform:uppercase;margin-bottom:20px}
  .gate-title{font-size:clamp(1.5rem,3vw,2rem);font-weight:700;color:#F1F5F9;letter-spacing:-.03em;margin-bottom:6px}
  .gate-sub{font-size:.875rem;color:#64748B;line-height:1.6;margin-bottom:32px}
  .gate-divider{display:flex;align-items:center;gap:12px;margin:24px 0;font-size:.625rem;color:#475569;text-transform:uppercase;letter-spacing:.1em}
  .gate-divider-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)}
  .gate-error{padding:12px 16px;border-radius:8px;border:1px solid rgba(239,68,68,.25);background:rgba(239,68,68,.08);color:#FCA5A5;font-size:.8125rem;margin-bottom:20px;line-height:1.5}
  .gate-warn-icon{font-size:1rem;margin-right:6px}

  .role-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .role-card{position:relative;border-radius:14px;padding:28px 24px;cursor:pointer;transition:all .3s;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);overflow:hidden}
  .role-card:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.14)}
  .role-card.clinician:hover{border-color:rgba(6,182,212,.3)}
  .role-card.facility:hover{border-color:rgba(99,102,241,.3)}
  .role-card.selected.clinician{border-color:rgba(6,182,212,.5);background:rgba(6,182,212,.04)}
  .role-card.selected.facility{border-color:rgba(99,102,241,.5);background:rgba(99,102,241,.04)}
  .role-card.disabled{opacity:.4;cursor:not-allowed;pointer-events:none}
  .role-icon{font-size:1.75rem;margin-bottom:12px}
  .role-name{font-size:1rem;font-weight:600;color:#F1F5F9;margin-bottom:4px}
  .role-desc{font-size:.75rem;color:#64748B;line-height:1.5}
  .role-lock{font-size:.625rem;color:#F59E0B;margin-top:8px;display:flex;align-items:center;gap:4px}
  .role-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px}
  .role-tag{padding:2px 7px;border-radius:3px;font-size:.5625rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);color:#475569}

  .auth-section{max-width:400px;width:100%;margin:0 auto;text-align:center}
  .google-btn{width:100%;padding:14px 20px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:#E2E8F0;font-size:.9375rem;font-weight:500;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:10px;font-family:'Inter',sans-serif}
  .google-btn:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.16)}
  .google-btn:disabled{opacity:.4;cursor:not-allowed}
  .google-btn .g-icon{width:20px;height:20px;flex-shrink:0}
  .back-link{font-size:.75rem;color:#475569;cursor:pointer;margin-top:16px;transition:color .15s;display:inline-block}
  .back-link:hover{color:#94A3B8}

  .onboard-form{width:100%}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .form-group{margin-bottom:16px}
  .form-label{font-size:.6875rem;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:block}
  .form-input{width:100%;padding:11px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#E2E8F0;font-size:.875rem;outline:none;transition:all .2s;font-family:'Inter',sans-serif}
  .form-input:focus{border-color:rgba(6,182,212,.3);box-shadow:0 0 20px rgba(6,182,212,.05)}
  .form-input::placeholder{color:#475569}
  .form-select{width:100%;padding:11px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#E2E8F0;font-size:.875rem;outline:none;font-family:'Inter',sans-serif;cursor:pointer;appearance:none}
  .form-select option{background:#1E293B;color:#E2E8F0}
  .form-hint{font-size:.625rem;color:#334155;margin-top:4px}
  .form-section{font-size:.6875rem;font-weight:600;color:#475569;letter-spacing:.08em;margin-bottom:12px;margin-top:4px}

  .btn-enter{width:100%;padding:16px 24px;border-radius:10px;border:none;background:linear-gradient(135deg,#06B6D4,#0891B2);color:#070B14;font-size:.9375rem;font-weight:600;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;letter-spacing:.02em}
  .btn-enter:hover{opacity:.9;transform:translateY(-1px)}
  .btn-enter:disabled{opacity:.4;cursor:not-allowed;transform:none}
  .btn-enter-sub{display:block;font-size:.625rem;font-weight:400;color:rgba(7,11,20,.6);margin-top:4px;letter-spacing:0}

  .loading-screen{display:flex;flex-direction:column;align-items:center;gap:16px;color:#64748B;font-size:.875rem}
  .spinner{width:32px;height:32px;border-radius:50%;border:3px solid rgba(255,255,255,.04);border-top-color:#06B6D4;animation:spin .8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}

  @media(max-width:600px){
    .role-grid{grid-template-columns:1fr}
    .form-row{grid-template-columns:1fr}
  }
`;

const SPECIALTIES = [
  'General Medicine', 'Internal Medicine', 'Cardiology', 'Pulmonology',
  'Gastroenterology', 'Nephrology', 'Endocrinology', 'Neurology',
  'Pediatrics', 'Obstetrics & Gynecology', 'Surgery', 'Orthopedics',
  'Ophthalmology', 'ENT', 'Dermatology', 'Psychiatry',
  'Emergency Medicine', 'Anesthesiology', 'Radiology', 'Pathology',
  'Family Medicine', 'Public Health', 'Infectious Disease', 'Oncology',
  'Rheumatology', 'Urology', 'Hematology', 'Other',
];

type Step = 'role' | 'auth' | 'onboarding';

export default function ClinicalAuthPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>('role');
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Clinician form
  const [clinicianForm, setClinicianForm] = useState({
    displayName: '',
    clinicianRole: 'doctor' as ClinicianRole,
    specialty: 'GENERAL',
    country: 'Kenya',
  });

  // Email / password form
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Facility form
  const [facilityForm, setFacilityForm] = useState({
    facilityName: '',
    facilityType: 'hospital' as string,
    facilityLevel: 'secondary' as string,
    country: 'Kenya',
    departments: '',
  });

  useEffect(() => { initAuthPersistence(); }, []);

  // ── Auth flow orchestrator ──────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    const savedType = sessionStorage.getItem('clinicalAuth_type') as AccountType | null;

    // ── PATH A: redirect from Google ──────────────────────────────────────
    if (savedType) {
      if (!user) return; // wait for onAuthStateChanged to settle
      sessionStorage.removeItem('clinicalAuth_type');

      const run = async () => {
        setSelectedType(savedType);
        setSubmitting(true);

        const { result: existing, error } = await checkAccountType(user.email || '', savedType)
          .then(r => ({ result: r, error: null as any }))
          .catch((err: any) => ({ result: undefined as any, error: err }));

        if (error) {
          if (error instanceof AccountTypeMismatchError) {
            setAuthError(error.message);
          } else {
            setAuthError(error.message || 'Account check failed.');
          }
          setSubmitting(false);
          return;
        }

        if (existing && existing.onboardingStatus === 'complete') {
          const target = existing.accountType === 'clinician' ? '/workspace/clinician' : '/workspace/facility';
          router.replace(target);
          return;
        }

        if (existing && existing.onboardingStatus === 'profile_pending') {
          setStep('onboarding');
          setSubmitting(false);
          return;
        }

        // New user — create profile with account type lock
        try {
          const profileData = savedType === 'clinician'
            ? {
                uid: user.uid,
                email: user.email || '',
                accountType: 'clinician' as const,
                displayName: user.displayName || '',
                photoURL: user.photoURL || undefined,
                clinicianRole: 'doctor' as ClinicianRole,
                country: '',
                organizations: [],
                onboardingStatus: 'profile_pending' as const,
              }
            : {
                uid: user.uid,
                email: user.email || '',
                accountType: 'facility' as const,
                displayName: user.displayName || '',
                photoURL: user.photoURL || undefined,
                facilityName: '',
                facilityType: 'hospital' as const,
                country: '',
                departments: [],
                organizations: [],
                onboardingStatus: 'profile_pending' as const,
              };
          await createUserProfile(user.uid, profileData);
          setStep('onboarding');
        } catch (err: any) {
          setAuthError(err.message || 'Profile creation failed.');
        }
        setSubmitting(false);
      };
      run();
      return;
    }

    // ── PATHS B & C: no savedType ─────────────────────────────────────────
    if (user) {
      getUserProfile(user.uid).then((profile: UserProfile | null) => {
        if (!profile) {
          setStep('role');
          return;
        }
        if (!profile.accountType && !(profile as any).onboardingStatus) {
          setStep('role');
          return;
        }
        if (profile.onboardingStatus === 'complete') {
          const target = profile.accountType === 'clinician' ? '/workspace/clinician' : '/workspace/facility';
          router.replace(target);
        } else if (profile.onboardingStatus === 'profile_pending') {
          setSelectedType(profile.accountType);
          if (profile.accountType === 'clinician') {
            const p = profile as ClinicianProfile;
            setClinicianForm(f => ({
              ...f,
              displayName: p.displayName || f.displayName,
              clinicianRole: p.clinicianRole || f.clinicianRole,
              specialty: p.specialty || f.specialty,
              country: p.country || f.country,
            }));
          }
          setStep('onboarding');
        }
      }).catch(() => {
        setStep('role');
      });
    } else {
      if (step !== 'role') setStep('role');
    }
  }, [user, authLoading, router]);

  const handleRoleSelect = useCallback((type: AccountType) => {
    setSelectedType(type);
    setAuthError('');
    if (user) {
      setStep('onboarding');
    } else {
      setStep('auth');
    }
  }, [user]);

  const handleGoogleAuth = useCallback(async () => {
    if (!selectedType) return;
    setSubmitting(true);
    setAuthError('');
    try {
      await signInWithGoogle(selectedType);
      // The popup redirect will trigger PATH A via sessionStorage
    } catch (err: any) {
      setAuthError(err.message || 'Unable to initiate Google sign-in.');
      setSubmitting(false);
    }
  }, [selectedType]);

  const handleEmailAuth = useCallback(async (signUp: boolean) => {
    if (!selectedType) return;
    if (!emailForm.email || !emailForm.password) return;
    setSubmitting(true);
    setAuthError('');
    try {
      const firebaseUser = signUp
        ? await registerWithEmail(emailForm.email, emailForm.password)
        : await signInWithEmail(emailForm.email, emailForm.password);

      if (signUp) {
        const profileData = selectedType === 'clinician'
          ? {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              accountType: 'clinician' as const,
              displayName: '',
              clinicianRole: 'doctor' as ClinicianRole,
              country: '',
              organizations: [],
              onboardingStatus: 'profile_pending' as const,
            }
          : {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              accountType: 'facility' as const,
              displayName: '',
              facilityName: '',
              facilityType: 'hospital' as const,
              country: '',
              departments: [],
              organizations: [],
              onboardingStatus: 'profile_pending' as const,
            };
        await createUserProfile(firebaseUser.uid, profileData);
        setStep('onboarding');
        setSubmitting(false);
        return;
      }
      // Sign-in: onAuthStateChanged will trigger PATH B and route
      setSubmitting(false);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setAuthError('No account found. Create one below.');
        setIsSignUp(true);
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('An account exists. Sign in instead.');
        setIsSignUp(false);
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Incorrect password.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password must be at least 6 characters.');
      } else {
        setAuthError(err.message || 'Authentication failed.');
      }
      setSubmitting(false);
    }
  }, [selectedType, emailForm]);

  const handleCompleteClinician = useCallback(async () => {
    if (!user) { setAuthError('Not authenticated.'); return; }
    if (!selectedType) { setAuthError('Account type not selected.'); return; }
    setSubmitting(true);
    setAuthError('');
    try {
      await createUserProfile(user.uid, {
        email: user.email || '',
        accountType: selectedType,
        displayName: clinicianForm.displayName,
        clinicianRole: clinicianForm.clinicianRole,
        specialty: clinicianForm.specialty,
        country: clinicianForm.country,
        onboardingStatus: 'complete',
      });
      router.replace('/workspace/clinician');
    } catch (err: any) {
      setAuthError(err.message || 'Profile setup failed.');
    }
    setSubmitting(false);
  }, [user, selectedType, clinicianForm, router]);

  const handleCompleteFacility = useCallback(async () => {
    if (!user) return;
    setSubmitting(true);
    setAuthError('');
    try {
      const deptList = facilityForm.departments.split(',').map(d => d.trim()).filter(Boolean);

      let orgId: string | null = null;
      try {
        orgId = await createOrganization({
          name: facilityForm.facilityName,
          type: facilityForm.facilityType as any,
          country: facilityForm.country,
          city: '',
          departments: deptList,
          createdBy: user.uid,
          adminUserId: user.uid,
        });
        await seedOrganization(orgId);
      } catch (orgErr: any) {
        console.warn('Organization creation skipped:', orgErr.message);
      }

      const profileUpdate: Record<string, any> = {
        email: user.email || '',
        accountType: selectedType || 'facility',
        displayName: user.displayName || 'Admin',
        facilityName: facilityForm.facilityName,
        facilityType: facilityForm.facilityType as any,
        country: facilityForm.country,
        departments: deptList,
        onboardingStatus: 'complete',
        organizations: orgId ? [orgId] : [],
      };
      if (orgId) profileUpdate.activeOrganizationId = orgId;

      await createUserProfile(user.uid, profileUpdate as any);
      router.replace('/workspace/facility');
    } catch (err: any) {
      setAuthError(err.message || 'Facility setup failed.');
    }
    setSubmitting(false);
  }, [user, selectedType, facilityForm, router]);

  if (submitting) {
    return (
      <>
        <style>{CSS}</style>
        <div className="bg-grid" />
        <div className="page">
          <div className="loading-screen">
            <div className="spinner" />
            <div>Securing your clinical identity...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="bg-grid" />
      <div className="page">
        <div className="gate-container">

          {/* ─── ROLE SELECTION ─────────────────────────────── */}
          {step === 'role' && (
            <>
              <div className="gate-badge">🔒 AMEXAN CLINICAL INFRASTRUCTURE</div>
              <h1 className="gate-title">Secure Identity Verification</h1>
              <p className="gate-sub">
                Select your account type to proceed. This choice is permanent and bound to your email —
                it determines your role, access level, and clinical permissions within the system.
              </p>
              <div className="role-grid">
                <div className="role-card clinician" onClick={() => handleRoleSelect('clinician')}>
                  <div className="role-icon">🩺</div>
                  <div className="role-name">Clinician Access</div>
                  <div className="role-desc">For doctors, nurses, pharmacists, lab technologists, and clinical staff</div>
                  <div className="role-tags">
                    <span className="role-tag">Doctor</span>
                    <span className="role-tag">Nurse</span>
                    <span className="role-tag">Consultant</span>
                    <span className="role-tag">Pharmacist</span>
                    <span className="role-tag">Lab Tech</span>
                    <span className="role-tag">Student</span>
                  </div>
                  <div className="role-lock">🔒 Permanently bound to email</div>
                </div>
                <div className="role-card facility" onClick={() => handleRoleSelect('facility')}>
                  <div className="role-icon">🏥</div>
                  <div className="role-name">Facility Access</div>
                  <div className="role-desc">For hospitals, clinics, specialist centers, and healthcare organizations</div>
                  <div className="role-tags">
                    <span className="role-tag">Hospital</span>
                    <span className="role-tag">Clinic</span>
                    <span className="role-tag">Specialist</span>
                    <span className="role-tag">Teaching Hospital</span>
                    <span className="role-tag">Telemedicine</span>
                  </div>
                  <div className="role-lock">🔒 Permanently bound to email</div>
                </div>
              </div>
            </>
          )}

          {/* ─── AUTH ────────────────────────────────────────── */}
          {step === 'auth' && (
            <>
              <div className="gate-badge" style={{ borderColor: selectedType === 'clinician' ? 'rgba(6,182,212,.2)' : 'rgba(99,102,241,.2)', background: selectedType === 'clinician' ? 'rgba(6,182,212,.06)' : 'rgba(99,102,241,.06)', color: selectedType === 'clinician' ? '#06B6D4' : '#818CF8' }}>
                🔒 {selectedType === 'clinician' ? 'CLINICIAN VERIFICATION' : 'FACILITY VERIFICATION'}
              </div>
              <h1 className="gate-title">Authenticate Your Identity</h1>
              <p className="gate-sub">
                Sign in with Google to verify your clinical identity.
                Your account type <strong>&quot;{selectedType === 'clinician' ? 'Clinician' : 'Facility'}&quot;</strong> will be permanently locked to this email.
              </p>

              {authError && (
                <div className="gate-error">
                  <span className="gate-warn-icon">⚠️</span>
                  {authError}
                </div>
              )}

              <div className="auth-section">
                <button className="google-btn" onClick={handleGoogleAuth} disabled={submitting}>
                  <svg className="g-icon" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  {submitting ? 'Verifying...' : 'Continue with Google'}
                </button>

                <div className="gate-divider"><span className="gate-divider-line" /><span>OR</span><span className="gate-divider-line" /></div>

                {!showEmailForm ? (
                  <div className="back-link" onClick={() => setShowEmailForm(true)} style={{ fontSize: '.8125rem', marginTop: 0 }}>
                    Sign in with Email →
                  </div>
                ) : (
                  <div style={{ textAlign: 'left' }}>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" placeholder="doctor@amexan.test" value={emailForm.email} onChange={e => setEmailForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input className="form-input" type="password" placeholder="••••••••" value={emailForm.password} onChange={e => setEmailForm(f => ({ ...f, password: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-enter" onClick={() => handleEmailAuth(false)} disabled={!emailForm.email || !emailForm.password || submitting} style={{ flex: 1 }}>
                        {submitting ? 'Signing in...' : 'Sign In'}
                      </button>
                      <button className="btn-enter" onClick={() => handleEmailAuth(true)} disabled={!emailForm.email || !emailForm.password || submitting} style={{ flex: 1, background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
                        {submitting ? 'Creating...' : 'Create Account'}
                      </button>
                    </div>
                    <div className="back-link" onClick={() => { setShowEmailForm(false); setAuthError(''); }} style={{ textAlign: 'center', display: 'block', marginTop: 12 }}>
                      ← Back to Google sign-in
                    </div>
                  </div>
                )}

                <div className="back-link" onClick={() => { setStep('role'); setShowEmailForm(false); setEmailForm({ email: '', password: '' }); }} style={{ marginTop: showEmailForm ? 12 : 16 }}>
                  ← Choose a different account type
                </div>
              </div>
            </>
          )}

          {/* ─── CLINICIAN ONBOARDING ───────────────────────── */}
          {step === 'onboarding' && selectedType === 'clinician' && (
            <>
              <div className="gate-badge" style={{ borderColor: 'rgba(6,182,212,.2)', background: 'rgba(6,182,212,.06)', color: '#06B6D4' }}>
                👨‍⚕️ AMEXAN CLINICAL INFRASTRUCTURE
              </div>
              <h1 className="gate-title">Complete Your Profile</h1>
              <p className="gate-sub">Set up your clinician profile to begin using the Clinical Workspace.</p>

              <div className="onboard-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="DR. KABURU MUGAMBI" value={clinicianForm.displayName} onChange={e => setClinicianForm(f => ({ ...f, displayName: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Profession</label>
                  <select className="form-select" value={clinicianForm.clinicianRole} onChange={e => setClinicianForm(f => ({ ...f, clinicianRole: e.target.value as ClinicianRole }))}>
                    <option value="doctor">Doctor</option>
                    <option value="consultant">Consultant</option>
                    <option value="medical_officer">Medical Officer</option>
                    <option value="nurse">Nurse</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="lab_technologist">Lab Technologist</option>
                    <option value="medical_student">Medical Student</option>
                    <option value="therapist">Therapist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Specialty</label>
                  <select className="form-select" value={clinicianForm.specialty} onChange={e => setClinicianForm(f => ({ ...f, specialty: e.target.value }))}>
                    <option value="GENERAL">GENERAL</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select className="form-select" value={clinicianForm.country} onChange={e => setClinicianForm(f => ({ ...f, country: e.target.value }))}>
                    <option value="Kenya">Kenya</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {authError && <div className="gate-error"><span className="gate-warn-icon">⚠️</span>{authError}</div>}

                <button className="btn-enter" onClick={handleCompleteClinician} disabled={!clinicianForm.displayName || !clinicianForm.specialty || submitting}>
                  Enter Clinical Workspace →
                </button>
              </div>
            </>
          )}

          {/* ─── FACILITY ONBOARDING ─────────────────────────── */}
          {step === 'onboarding' && selectedType === 'facility' && (
            <>
              <div className="gate-badge" style={{ borderColor: 'rgba(99,102,241,.2)', background: 'rgba(99,102,241,.06)', color: '#818CF8' }}>
                🏥 FACILITY REGISTRATION
              </div>
              <h1 className="gate-title">Register Your Facility</h1>
              <p className="gate-sub">Set up your healthcare facility to begin clinical operations.</p>

              <div className="onboard-form">
                <div className="form-group">
                  <label className="form-label">Facility Name</label>
                  <input className="form-input" placeholder="e.g. Aga Khan University Hospital" value={facilityForm.facilityName} onChange={e => setFacilityForm(f => ({ ...f, facilityName: e.target.value }))} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Facility Type</label>
                    <select className="form-select" value={facilityForm.facilityType} onChange={e => setFacilityForm(f => ({ ...f, facilityType: e.target.value }))}>
                      <option value="hospital">Hospital</option>
                      <option value="clinic">Clinic</option>
                      <option value="specialist_center">Specialist Center</option>
                      <option value="teaching_hospital">Teaching Hospital</option>
                      <option value="telemedicine">Telemedicine Center</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Level</label>
                    <select className="form-select" value={facilityForm.facilityLevel} onChange={e => setFacilityForm(f => ({ ...f, facilityLevel: e.target.value }))}>
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="tertiary">Tertiary</option>
                      <option value="specialist">Specialist</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select className="form-select" value={facilityForm.country} onChange={e => setFacilityForm(f => ({ ...f, country: e.target.value }))}>
                    <option value="Kenya">Kenya</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Departments (comma-separated)</label>
                  <input className="form-input" placeholder="e.g. Internal Medicine, Surgery, Pediatrics, OB/GYN" value={facilityForm.departments} onChange={e => setFacilityForm(f => ({ ...f, departments: e.target.value }))} />
                  <div className="form-hint">You can add and manage departments later in settings</div>
                </div>

                {authError && <div className="gate-error"><span className="gate-warn-icon">⚠️</span>{authError}</div>}

                <button className="btn-enter" onClick={handleCompleteFacility} disabled={!facilityForm.facilityName || submitting}>
                  ENTER SECURE CLINICAL WORKSPACE
                  <span className="btn-enter-sub">Your facility dashboard will be configured upon entry</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}