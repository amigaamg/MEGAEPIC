"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  validateIdentityStep,
  validateProfessionalStep,
  validateOrganizationCreateStep,
  REGISTRATION_STEPS,
  generateAmxUid,
  createIdentity,
  createPerson,
  createProfessional,
  createOrganization,
  createEmployment,
  createAssignment,
  addOrgMember,
  type RegistrationStep,
  type RegistrationData,
  type AmxUid,
  type EmploymentStatus,
  type AssignmentType,
  type Qualification,
} from "@/lib/amexan";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment.",
};

function mapFirebaseError(code: string): string {
  return FIREBASE_ERRORS[code] ?? "Registration failed. Please try again.";
}

const DEFAULT_DATA: RegistrationData = {
  email: '', password: '', phone: '', fullName: '', givenName: '', familyName: '',
  dateOfBirth: '', gender: 'undisclosed', nationality: '', nationalId: '',
  categories: [], primaryCategory: '' as any, specialties: [], yearsOfExperience: 0,
  qualifications: [], organizationChoice: 'none', organizationName: '',
  organizationType: undefined, organizationLevel: undefined,
  organizationRegistrationNumber: '', invitationCode: '', jobTitle: '',
  employmentType: 'permanent',
};

const PROFESSIONAL_CATEGORIES = [
  { value: 'medical_doctor', label: 'Medical Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'lab_technologist', label: 'Lab Technologist' },
  { value: 'radiographer', label: 'Radiographer' },
  { value: 'clinical_officer', label: 'Clinical Officer' },
  { value: 'midwife', label: 'Midwife' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'it_staff', label: 'IT Staff' },
  { value: 'finance_staff', label: 'Finance Staff' },
  { value: 'hr_staff', label: 'HR Staff' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'records_officer', label: 'Records Officer' },
  { value: 'facility_admin', label: 'Facility Admin' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'patient', label: 'Patient' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'other', label: 'Other' },
];

const SPECIALTIES = [
  { value: 'internal_medicine', label: 'Internal Medicine' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'obstetrics_gynecology', label: 'Obstetrics & Gynecology' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'emergency_medicine', label: 'Emergency Medicine' },
  { value: 'family_medicine', label: 'Family Medicine' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'general_practice', label: 'General Practice' },
  { value: 'public_health', label: 'Public Health' },
  { value: 'other', label: 'Other' },
];

const ORG_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'specialist_center', label: 'Specialist Center' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'individual_practice', label: 'Individual Practice' },
  { value: 'telemedicine', label: 'Telemedicine' },
  { value: 'other', label: 'Other' },
];

const EMPLOYMENT_TYPES = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'locum', label: 'Locum' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'intern', label: 'Intern' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'consultant', label: 'Consultant' },
];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
      {error && <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 4, marginLeft: 2 }}>{error}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 48, padding: '0 16px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--surface-border)',
  background: 'var(--surface)', color: 'var(--text-primary)',
  fontSize: 15, fontFamily: 'var(--font-sans)', outline: 'none',
  transition: 'border-color .2s, box-shadow .2s', boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center',
};

export default function ConstitutionRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<RegistrationStep>('identity');
  const [data, setData] = useState<RegistrationData>(DEFAULT_DATA);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [generatedAmxUid, setGeneratedAmxUid] = useState<string | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  const triggerShake = useCallback(() => {
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    setTimeout(() => setShake(false), 400);
  }, []);

  const showError = useCallback((msg: string) => {
    setGlobalError(msg);
    triggerShake();
  }, [triggerShake]);

  const update = (fields: Partial<RegistrationData>) => {
    setData(prev => ({ ...prev, ...fields }));
    setErrors(prev => {
      const next = { ...prev };
      Object.keys(fields).forEach(k => delete next[k]);
      return next;
    });
  };

  async function handleNext() {
    setGlobalError(null);

    if (step === 'identity') {
      const errs = validateIdentityStep(data);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      setLoading(true);
      try {
        const res = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
        const fbUid = res.user.uid;
        setFirebaseUid(fbUid);

        const amxUid = generateAmxUid('person');
        setGeneratedAmxUid(amxUid);

        await setDoc(doc(db, 'users', fbUid), {
          amxUid,
          email: data.email.trim(),
          name: data.fullName.trim(),
          role: data.primaryCategory || 'patient',
          createdAt: serverTimestamp(),
        });

        await createIdentity(amxUid, {
          email: data.email.trim(),
          phone: data.phone,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastLoginAt: Date.now(),
          verified: false,
          twoFactorEnabled: false,
          securityKeys: [],
          authProvider: 'email',
          status: 'active',
          recoveryEmail: data.email.trim(),
        });

        await createPerson(amxUid, {
          identityId: amxUid,
          fullName: data.fullName.trim(),
          givenName: data.givenName.trim(),
          familyName: data.familyName.trim(),
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          nationality: data.nationality,
          nationalId: data.nationalId,
          address: { country: data.nationality || 'Kenya', county: '' },
        });

        await login(data.email.trim(), data.password);
        setStep('professional');
      } catch (err: any) {
        showError(mapFirebaseError(err.code ?? ''));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 'professional') {
      const errs = validateProfessionalStep(data);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      setLoading(true);
      try {
        await createProfessional(generatedAmxUid!, {
          personId: generatedAmxUid as AmxUid,
          categories: data.categories,
          primaryCategory: data.primaryCategory,
          specialties: data.specialties || [],
          primarySpecialty: data.primarySpecialty,
          qualifications: (data.qualifications || []).map(q => ({ ...q, country: '', verified: false })) as Qualification[],
          yearsOfExperience: data.yearsOfExperience,
          licenseNumber: data.licenseNumber,
          councilNumber: data.councilNumber,
          verified: false,
          verificationDocuments: [],
        });
        setStep('organization_choice');
      } catch (err: any) {
        showError('Failed to save professional profile. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 'organization_choice') {
      if (data.organizationChoice === 'create') setStep('organization_create');
      else if (data.organizationChoice === 'join') setStep('organization_join');
      else setStep('department_select');
      return;
    }

    if (step === 'organization_create') {
      const errs = validateOrganizationCreateStep(data);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      setLoading(true);
      try {
        const orgId = await createOrganization({
          name: data.organizationName!,
          legalName: data.organizationName!,
          type: data.organizationType!,
          level: data.organizationLevel || 'level_1',
          registrationNumber: data.organizationRegistrationNumber || '',
          address: { country: 'Kenya', county: '' },
          phone: data.phone,
          email: data.email,
          branches: [],
          departments: [],
          status: 'active',
          verified: false,
          ownedBy: generatedAmxUid as AmxUid,
          config: {
            documentHeader: { logoUrl: '', facilityName: data.organizationName!, facilityAddress: '', facilityPhone: data.phone, facilityEmail: data.email, headerTemplate: '', footerTemplate: '' },
            branding: { primaryColor: '#2F80ED', secondaryColor: '#1a5bbf', accentColor: '#14b8a6', fontFamily: 'Inter' },
            clinical: { defaultWards: [], defaultClinics: [], defaultTheatres: [], diagnosisCodeSystem: 'icd_10', medicationCodeSystem: 'local', labCodeSystem: 'local', imagingCodeSystem: 'local', enableTelemedicine: false, enableAI: true, enableResearch: false },
            billing: { currency: 'KES', taxRate: 0, consultationFees: {}, bedCharges: {}, pharmacyMarkup: 0, labMarkup: 0, imagingMarkup: 0, insuranceAccepted: [], paymentMethods: ['cash', 'mpesa'] },
            integrations: { fhirEnabled: false, hl7Enabled: false, externalHmisEnabled: false, aiServicesEnabled: true, apiEnabled: false },
          },
          license: { licenseNumber: data.organizationRegistrationNumber || '', licenseType: 'health_facility', issuingAuthority: 'MOH', issuedAt: Date.now(), expiresAt: Date.now() + 365 * 86400000, renewedAt: Date.now(), status: 'pending' },
          pricingTier: 'free',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        await addOrgMember(orgId, {
          userId: firebaseUid!,
          email: data.email,
          displayName: data.fullName,
          roleId: 'admin',
          roleName: 'Organization Admin',
          departmentIds: [],
          isActive: true,
          joinedAt: Date.now(),
        });

        update({ organizationName: orgId });
        setStep('department_select');
      } catch (err: any) {
        showError('Failed to create organization. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 'organization_join') {
      setStep('department_select');
      return;
    }

    if (step === 'department_select') {
      setStep('assignment');
      return;
    }

    if (step === 'assignment') {
      setLoading(true);
      try {
        const orgId = data.organizationName || 'individual';
        const deptId = data.departmentType || 'general';

        if (data.organizationChoice !== 'none' && orgId !== 'individual') {
          const empId = await createEmployment(orgId, {
            personId: generatedAmxUid as AmxUid,
            organizationId: orgId,
            departmentId: deptId,
            professionalIdentityId: generatedAmxUid as AmxUid,
            employeeId: `EMP-${Date.now().toString(36).toUpperCase()}`,
            jobTitle: data.jobTitle || data.primaryCategory?.replace(/_/g, ' ') || 'Staff',
            employmentType: (data.employmentType || 'permanent') as EmploymentStatus,
            startDate: Date.now(),
            isPrimary: true,
            supervisorId: undefined,
            schedule: {
              type: 'full_time',
              weeklyHours: 40,
              workingDays: [1, 2, 3, 4, 5],
              leaveBalance: { annual: 30, sick: 14, study: 10, maternity: 90, paternity: 14, compassionate: 5, unpaid: 365 },
            },
            privileges: [],
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          await createAssignment(orgId, {
            personId: generatedAmxUid as AmxUid,
            employmentId: empId,
            organizationId: orgId,
            departmentId: deptId,
            type: (data.primaryCategory === 'medical_doctor' ? 'ward_round' : 'administration') as AssignmentType,
            title: data.jobTitle || data.primaryCategory?.replace(/_/g, ' ') || 'Assignment',
            startTime: Date.now(),
            endTime: Date.now() + 8 * 3600000,
            location: { type: 'ward' },
            status: 'active',
            priority: 'routine',
            assignedBy: generatedAmxUid as AmxUid,
            assignedAt: Date.now(),
            requiresSignature: false,
          });
        }
        setStep('complete');
      } catch (err: any) {
        showError('Failed to create assignment. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }
  }

  function handleBack() {
    if (step === 'professional') setStep('identity');
    else if (step === 'organization_choice') setStep('professional');
    else if (step === 'organization_create') setStep('organization_choice');
    else if (step === 'organization_join') setStep('organization_choice');
    else if (step === 'department_select') {
      if (data.organizationChoice === 'create') setStep('organization_create');
      else if (data.organizationChoice === 'join') setStep('organization_join');
      else setStep('organization_choice');
    }
    else if (step === 'assignment') setStep('department_select');
  }

  const currentStepMeta = REGISTRATION_STEPS.find(s => s.id === step);
  const totalSteps = REGISTRATION_STEPS.length;
  const stepIndex = REGISTRATION_STEPS.findIndex(s => s.id === step);
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const isFirst = step === 'identity';
  const isLast = step === 'complete';

  return (
    <div className="flex flex-col">
      {/* Progress bar */}
      <div style={{ width: '100%', height: 4, background: 'var(--surface-border)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: 2, transition: 'width 0.3s ease' }} />
      </div>

      {/* Step indicator */}
      <div className="mb-4">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {currentStepMeta?.title ?? 'Registration'}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {currentStepMeta?.subtitle ?? ''}
        </p>
      </div>

      {/* Error */}
      {globalError && (
        <div className={`flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-sm mb-4 border ${shake ? 'animate-shake' : ''}`}
          role="alert"
          style={{ background: 'var(--red-bg)', borderColor: 'var(--red-border)', color: 'var(--red)' }}>
          <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{globalError}</span>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        .animate-shake { animation: shake .35s ease; }
      `}</style>

      {/* ══════ STEP: IDENTITY ══════ */}
      {step === 'identity' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Given Name" error={errors.givenName}>
              <input style={inputStyle} type="text" value={data.givenName} onChange={e => update({ givenName: e.target.value })} placeholder="Jane" />
            </Field>
            <Field label="Family Name" error={errors.familyName}>
              <input style={inputStyle} type="text" value={data.familyName} onChange={e => update({ familyName: e.target.value })} placeholder="Smith" />
            </Field>
          </div>
          <Field label="Full Name" error={errors.fullName}>
            <input style={inputStyle} type="text" value={data.fullName} onChange={e => update({ fullName: e.target.value })} placeholder="Dr. Jane Smith" />
          </Field>
          <Field label="Email Address" error={errors.email}>
            <input style={inputStyle} type="email" value={data.email} onChange={e => update({ email: e.target.value })} placeholder="jane@example.com" autoComplete="email" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Password" error={errors.password}>
              <input style={inputStyle} type="password" value={data.password} onChange={e => update({ password: e.target.value })} placeholder="Min 8 characters" autoComplete="new-password" />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input style={inputStyle} type="tel" value={data.phone} onChange={e => update({ phone: e.target.value })} placeholder="+254 7XX XXX XXX" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date of Birth" error={errors.dateOfBirth}>
              <input style={inputStyle} type="date" value={data.dateOfBirth} onChange={e => update({ dateOfBirth: e.target.value })} />
            </Field>
            <Field label="Gender" error={errors.gender}>
              <select style={selectStyle} value={data.gender} onChange={e => update({ gender: e.target.value as any })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="undisclosed">Undisclosed</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="National ID" error={errors.nationalId}>
              <input style={inputStyle} type="text" value={data.nationalId} onChange={e => update({ nationalId: e.target.value })} placeholder="ID Number" />
            </Field>
            <Field label="Nationality" error={errors.nationality}>
              <input style={inputStyle} type="text" value={data.nationality} onChange={e => update({ nationality: e.target.value })} placeholder="Kenyan" />
            </Field>
          </div>
        </div>
      )}

      {/* ══════ STEP: PROFESSIONAL ══════ */}
      {step === 'professional' && (
        <div className="space-y-4">
          <Field label="Primary Category" error={errors.primaryCategory}>
            <select style={selectStyle} value={data.primaryCategory} onChange={e => update({ primaryCategory: e.target.value as any, categories: [e.target.value] as any[] })}>
              <option value="">Select your profession...</option>
              {PROFESSIONAL_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Specialty">
            <select style={selectStyle} value={data.primarySpecialty ?? ''} onChange={e => update({ primarySpecialty: e.target.value as any, specialties: e.target.value ? [e.target.value as any] : [] })}>
              <option value="">Select specialty (optional)...</option>
              {SPECIALTIES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="License Number" error={errors.licenseNumber}>
              <input style={inputStyle} type="text" value={data.licenseNumber ?? ''} onChange={e => update({ licenseNumber: e.target.value })} placeholder="KMPDC Number" />
            </Field>
            <Field label="Council Number" error={errors.councilNumber}>
              <input style={inputStyle} type="text" value={data.councilNumber ?? ''} onChange={e => update({ councilNumber: e.target.value })} placeholder="Council Reg No." />
            </Field>
          </div>
          <Field label="Years of Experience">
            <input style={inputStyle} type="number" value={data.yearsOfExperience} onChange={e => update({ yearsOfExperience: parseInt(e.target.value) || 0 })} placeholder="0" min={0} />
          </Field>
          <Field label="Qualifications (comma separated)">
            <input style={inputStyle} type="text" value={data.qualifications.map(q => q.degree).join(', ')} onChange={e => update({ qualifications: e.target.value.split(',').filter(Boolean).map(d => ({ degree: d.trim(), institution: '', year: new Date().getFullYear() })) })} placeholder="MBChB, MMed, etc." />
          </Field>
        </div>
      )}

      {/* ══════ STEP: ORGANIZATION CHOICE ══════ */}
      {step === 'organization_choice' && (
        <div className="space-y-3">
          <button onClick={() => update({ organizationChoice: 'none' })}
            style={{
              width: '100%', padding: 16, borderRadius: 'var(--radius-md)', textAlign: 'left',
              border: `1.5px solid ${data.organizationChoice === 'none' ? 'var(--primary)' : 'var(--surface-border)'}`,
              background: data.organizationChoice === 'none' ? 'var(--primary-light)' : 'var(--surface)',
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s',
            }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Individual Practice</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Work independently without an organization</div>
          </button>

          <button onClick={() => update({ organizationChoice: 'create' })}
            style={{
              width: '100%', padding: 16, borderRadius: 'var(--radius-md)', textAlign: 'left',
              border: `1.5px solid ${data.organizationChoice === 'create' ? 'var(--primary)' : 'var(--surface-border)'}`,
              background: data.organizationChoice === 'create' ? 'var(--primary-light)' : 'var(--surface)',
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s',
            }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Create a Facility</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Register your hospital, clinic, or practice</div>
          </button>

          <button onClick={() => update({ organizationChoice: 'join' })}
            style={{
              width: '100%', padding: 16, borderRadius: 'var(--radius-md)', textAlign: 'left',
              border: `1.5px solid ${data.organizationChoice === 'join' ? 'var(--primary)' : 'var(--surface-border)'}`,
              background: data.organizationChoice === 'join' ? 'var(--primary-light)' : 'var(--surface)',
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s',
            }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Join Existing Facility</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Use an invitation code to join an organization</div>
          </button>
        </div>
      )}

      {/* ══════ STEP: CREATE ORGANIZATION ══════ */}
      {step === 'organization_create' && (
        <div className="space-y-4">
          <Field label="Facility Name" error={errors.organizationName}>
            <input style={inputStyle} type="text" value={data.organizationName ?? ''} onChange={e => update({ organizationName: e.target.value })} placeholder="Nairobi Teaching Hospital" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" error={errors.organizationType}>
              <select style={selectStyle} value={data.organizationType ?? ''} onChange={e => update({ organizationType: e.target.value as any })}>
                <option value="">Select type...</option>
                {ORG_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Registration Number" error={errors.organizationRegistrationNumber}>
              <input style={inputStyle} type="text" value={data.organizationRegistrationNumber ?? ''} onChange={e => update({ organizationRegistrationNumber: e.target.value })} placeholder="Reg No." />
            </Field>
          </div>
        </div>
      )}

      {/* ══════ STEP: JOIN ORGANIZATION ══════ */}
      {step === 'organization_join' && (
        <div className="space-y-4">
          <Field label="Invitation Code">
            <input style={inputStyle} type="text" value={data.invitationCode ?? ''} onChange={e => update({ invitationCode: e.target.value })} placeholder="Enter invitation code" />
          </Field>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Ask your organization administrator for an invitation code. If you don't have one, choose "Create a Facility" instead.
          </p>
        </div>
      )}

      {/* ══════ STEP: DEPARTMENT SELECT ══════ */}
      {step === 'department_select' && (
        <div className="space-y-4">
          <Field label="Job Title">
            <input style={inputStyle} type="text" value={data.jobTitle ?? ''} onChange={e => update({ jobTitle: e.target.value })} placeholder="e.g. Senior Medical Officer" />
          </Field>
          <Field label="Department">
            <select style={selectStyle} value={data.departmentType ?? ''} onChange={e => update({ departmentType: e.target.value })}>
              <option value="">Select department...</option>
              <option value="emergency">Emergency</option>
              <option value="outpatient">Outpatient</option>
              <option value="inpatient">Inpatient</option>
              <option value="surgery">Surgery</option>
              <option value="medicine">Medicine</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="obstetrics_gynaecology">Obstetrics & Gynecology</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="laboratory">Laboratory</option>
              <option value="radiology">Radiology</option>
              <option value="icu">ICU</option>
              <option value="administration">Administration</option>
              <option value="it">IT</option>
              <option value="finance">Finance</option>
              <option value="hr">Human Resources</option>
            </select>
          </Field>
        </div>
      )}

      {/* ══════ STEP: ASSIGNMENT ══════ */}
      {step === 'assignment' && (
        <div className="space-y-4">
          <Field label="Employment Type">
            <select style={selectStyle} value={data.employmentType} onChange={e => update({ employmentType: e.target.value })}>
              {EMPLOYMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', border: '1px solid var(--sky-200)' }}>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Your dashboard and permissions will be generated based on your role and department.
            </p>
          </div>
        </div>
      )}

      {/* ══════ STEP: COMPLETE ══════ */}
      {step === 'complete' && (
        <div className="text-center py-6">
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Registration Complete!</h3>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Welcome to AMEXAN, {data.fullName}.
          </p>
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--primary-light)', border: '1px solid var(--sky-200)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Your AMX-UID</p>
            <p className="text-lg font-mono font-bold mt-1" style={{ color: 'var(--primary)' }}>{generatedAmxUid}</p>
          </div>
          <div className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            Your dashboard will reflect your role and organization context.
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      {!isLast && (
        <div className="flex gap-3 mt-6">
          {!isFirst && (
            <button onClick={handleBack}
              style={{
                flex: 1, height: 48, borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)',
                background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}>
              Back
            </button>
          )}
          <button onClick={handleNext} disabled={loading}
            style={{
              flex: isFirst ? 1 : 2, height: 48, borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--primary)', color: 'white',
              fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-display)', opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {loading ? (
              <><Spinner /> Processing...</>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      )}

      {isLast && (
        <button onClick={() => router.push('/dashboard')}
          style={{
            width: '100%', height: 48, borderRadius: 'var(--radius-md)', border: 'none',
            background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-display)', marginTop: 20,
          }}>
          Go to Dashboard
        </button>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
