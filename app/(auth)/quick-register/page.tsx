"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ensureActor } from "@/lib/firebase/actorService";
import { generateAmxUid } from "@/lib/amexan";
import { Stethoscope, Building2, HeartPulse, Settings, KeyRound, FileText, type LucideIcon } from "lucide-react";

type Role = "doctor" | "nurse" | "patient" | "administrator";
type ContactMethod = "email" | "phone";
type AuthMethod = "password" | "passkey";

const ROLES: { id: Role; label: string; icon: LucideIcon; desc: string; color: string }[] = [
  { id: "doctor", label: "Doctor", icon: Stethoscope, desc: "Physician / Surgeon / Specialist", color: "var(--blue)" },
  { id: "nurse", label: "Nurse", icon: Building2, desc: "Registered Nurse / Midwife", color: "var(--teal)" },
  { id: "patient", label: "Patient", icon: HeartPulse, desc: "Individual seeking care", color: "var(--purple)" },
  { id: "administrator", label: "Administrator", icon: Settings, desc: "Hospital / Facility Admin", color: "var(--amber)" },
];

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password must be at least 4 characters.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment.",
  "auth/missing-email": "Please enter an email address.",
};

function mapFirebaseError(code: string): string {
  return FIREBASE_ERRORS[code] ?? "Something went wrong. Please try again.";
}

function Spinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function QuickRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "form" | "success">("role");
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("password");
  const [password, setPassword] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "form" && nameRef.current) {
      nameRef.current.focus();
    }
  }, [step]);

  const triggerShake = useCallback(() => {
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    setTimeout(() => setShake(false), 400);
  }, []);

  const showError = useCallback(
    (msg: string) => {
      setError(msg);
      triggerShake();
    },
    [triggerShake],
  );

  function selectRole(r: Role) {
    setRole(r);
    setStep("form");
    setError(null);
  }

  function goBack() {
    setStep("role");
    setError(null);
  }

  function generatePassword(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 16; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  }

  async function handlePasskeyEnrollment(userEmail: string): Promise<Credential | null> {
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "AMEXAN", id: window.location.hostname },
          user: {
            id: userId,
            name: userEmail,
            displayName: name.trim(),
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "required",
          },
          timeout: 60000,
        },
      } as CredentialCreationOptions);

      return credential;
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        showError("Passkey enrollment was cancelled.");
      } else {
        showError("Passkey enrollment failed. Please try password instead.");
      }
      return null;
    }
  }

  async function handleSubmit() {
    if (loading) return;
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) { showError("Please enter your full name."); return; }
    if (trimmedName.length < 2) { showError("Name must be at least 2 characters."); return; }

    if (contactMethod === "email") {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) { showError("Please enter your email address."); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) { showError("Please enter a valid email address."); return; }
    } else {
      const trimmedPhone = phone.trim();
      if (!trimmedPhone) { showError("Please enter your phone number."); return; }
      if (trimmedPhone.replace(/[\s\-\+\(\)]/g, "").length < 6) { showError("Please enter a valid phone number."); return; }
    }

    const userEmail = contactMethod === "email" ? email.trim() : `${phone.replace(/[\s\-\+\(\)]/g, "")}@phone.amexan`;
    const userPhone = contactMethod === "phone" ? phone.trim() : "";

    setLoading(true);

    try {
      if (authMethod === "password") {
        if (!password) { showError("Please enter a password."); setLoading(false); return; }
        if (password.length < 4) { showError("Password must be at least 4 characters."); setLoading(false); return; }

        const res = await createUserWithEmailAndPassword(auth, userEmail, password);
        const uid = res.user.uid;
        const amxUid = generateAmxUid('person');

        await setDoc(doc(db, "users", uid), {
          name: trimmedName,
          email: userEmail,
          phone: userPhone,
          role,
          amxUid,
          registrationStep: "professional",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await ensureActor({
          uid,
          amxUid,
          email: userEmail,
          displayName: trimmedName,
          phone: userPhone,
          accountType: role === 'patient' ? 'patient' : 'professional',
          clinicianRole: role === 'doctor' ? 'consultant' : role === 'nurse' ? 'nurse' : undefined,
          professionalCategory: role === 'doctor' ? 'medical_doctor' : role === 'nurse' ? 'nurse' : undefined,
        });

        setStep("success");
      } else {
        const tempPassword = generatePassword();
        const res = await createUserWithEmailAndPassword(auth, userEmail, tempPassword);
        const uid = res.user.uid;
        const amxUid = generateAmxUid('person');

        const passkeyCred = await handlePasskeyEnrollment(userEmail);
        if (!passkeyCred) {
          await res.user.delete().catch(() => {});
          setLoading(false);
          return;
        }

        await setDoc(doc(db, "users", uid), {
          name: trimmedName,
          email: userEmail,
          phone: userPhone,
          role,
          amxUid,
          registrationStep: "professional",
          passkeyCredentialId: passkeyCred.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await ensureActor({
          uid,
          amxUid,
          email: userEmail,
          displayName: trimmedName,
          phone: userPhone,
          accountType: role === 'patient' ? 'patient' : 'professional',
          clinicianRole: role === 'doctor' ? 'consultant' : role === 'nurse' ? 'nurse' : undefined,
          professionalCategory: role === 'doctor' ? 'medical_doctor' : role === 'nurse' ? 'nurse' : undefined,
        });

        setStep("success");
      }
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        // Constitutional: never dead-end a returning account. The Firebase
        // account already exists (registration was interrupted), so sign in
        // and resume onboarding instead of telling the user to register again.
        if (authMethod === "password" && password) {
          try {
            await signInWithEmailAndPassword(auth, userEmail, password);
            router.push("/register/constitution");
            return;
          } catch {
            // Password mismatch — fall through to a helpful message.
          }
        }
        showError("An account with this email already exists. Sign in to continue your registration.");
        return;
      }
      showError(mapFirebaseError(err.code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading && step === "form") handleSubmit();
  }

  return (
    <div className="flex flex-col" style={{ maxWidth: 400, margin: "0 auto" }}>
      {/* ══════ HEADING ══════ */}
      <div className="mb-6 text-center">
        <h1
          className="font-bold tracking-tight"
          style={{ color: "var(--text-primary)", fontSize: "clamp(1.5rem, 5vw, 2rem)" }}
        >
          {step === "success" ? "Account created" : "Get started in seconds"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {step === "role"
            ? "Pick your role to begin \u2014 the rest takes under 30 seconds."
            : step === "form"
              ? "Just a few details and you\u2019re in."
              : "Welcome to AMEXAN! Here\u2019s what to do next."}
        </p>
      </div>

      {/* ══════ ERROR ══════ */}
      {error && (
        <div
          className={`flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-sm mb-4 border ${shake ? "animate-shake" : ""}`}
          role="alert"
          style={{ background: "var(--red-bg)", borderColor: "var(--red-border)", color: "var(--red)" }}
        >
          <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-5px)}
          40%{transform:translateX(5px)}
          60%{transform:translateX(-3px)}
          80%{transform:translateX(3px)}
        }
        .animate-shake { animation: shake .35s ease; }
      `}</style>

      {/* ══════ STEP 1: ROLE SELECTION ══════ */}
      {step === "role" && (
        <div className="space-y-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => selectRole(r.id)}
              className="w-full text-left"
              style={{
                padding: "clamp(14px, 3vw, 20px)",
                borderRadius: "var(--radius-lg)",
                border: "1.5px solid var(--surface-border)",
                background: "var(--surface-card)",
                cursor: "pointer",
                transition: "all .2s",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = r.color;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${r.color.replace("var(", "").replace(")", "-bg,")} 0.15)`;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--surface-border)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-elevated)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <r.icon size={24} style={{ color: r.color }} aria-hidden="true" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 2 }}>
                  {r.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.desc}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* ══════ STEP 2: FORM ══════ */}
      {step === "form" && (
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          {/* Role badge */}
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={goBack}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}
              aria-label="Back to role selection"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "var(--primary-light)", color: "var(--primary)" }}
            >
              {ROLES.find((r) => r.id === role)?.label ?? "Select role"}
            </span>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }} htmlFor="qr-name">
              Full Name
            </label>
            <input
              id="qr-name"
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Smith"
              autoComplete="name"
              spellCheck={false}
              className="input"
              style={{ minHeight: 48, height: "auto", padding: "0 14px", fontSize: 16 }}
            />
          </div>

          {/* Contact: Email / Phone toggle */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Contact
              </label>
              <div className="flex rounded-md overflow-hidden" style={{ border: "1px solid var(--surface-border)" }}>
                <button
                  type="button"
                  onClick={() => { setContactMethod("email"); setError(null); }}
                  style={{
                    padding: "4px 12px", fontSize: 11, fontWeight: 600, border: "none",
                    background: contactMethod === "email" ? "var(--primary)" : "transparent",
                    color: contactMethod === "email" ? "white" : "var(--text-muted)",
                    cursor: "pointer", transition: "all .15s",
                  }}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => { setContactMethod("phone"); setError(null); }}
                  style={{
                    padding: "4px 12px", fontSize: 11, fontWeight: 600, border: "none",
                    background: contactMethod === "phone" ? "var(--primary)" : "transparent",
                    color: contactMethod === "phone" ? "white" : "var(--text-muted)",
                    cursor: "pointer", transition: "all .15s",
                  }}
                >
                  Phone
                </button>
              </div>
            </div>
            {contactMethod === "email" ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                spellCheck={false}
                className="input"
                style={{ minHeight: 48, height: "auto", padding: "0 14px", fontSize: 16, marginTop: 4 }}
              />
            ) : (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
                autoComplete="tel"
                inputMode="tel"
                className="input"
                style={{ minHeight: 48, height: "auto", padding: "0 14px", fontSize: 16, marginTop: 4 }}
              />
            )}
          </div>

          {/* Auth: Passkey / Password toggle */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Authentication
              </label>
              <div className="flex rounded-md overflow-hidden" style={{ border: "1px solid var(--surface-border)" }}>
                <button
                  type="button"
                  onClick={() => { setAuthMethod("password"); setError(null); }}
                  style={{
                    padding: "4px 12px", fontSize: 11, fontWeight: 600, border: "none",
                    background: authMethod === "password" ? "var(--primary)" : "transparent",
                    color: authMethod === "password" ? "white" : "var(--text-muted)",
                    cursor: "pointer", transition: "all .15s",
                  }}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod("passkey"); setError(null); }}
                  style={{
                    padding: "4px 12px", fontSize: 11, fontWeight: 600, border: "none",
                    background: authMethod === "passkey" ? "var(--primary)" : "transparent",
                    color: authMethod === "passkey" ? "white" : "var(--text-muted)",
                    cursor: "pointer", transition: "all .15s",
                  }}
                >
                  Passkey
                </button>
              </div>
            </div>
            {authMethod === "password" ? (
              <div
                className="flex items-center"
                style={{
                  width: "100%", minHeight: 48, height: "auto", padding: "0 14px", marginTop: 4,
                  borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)",
                  background: "var(--surface)", transition: "border-color .2s, box-shadow .2s",
                }}
              >
                <input
                  type={pwVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 4 characters"
                  autoComplete="new-password"
                  spellCheck={false}
                  style={{
                    flex: 1, border: "none", outline: "none", background: "transparent",
                    color: "var(--text-primary)", fontSize: 16, fontFamily: "var(--font-sans)", minWidth: 0,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPwVisible((v) => !v)}
                  className="shrink-0 p-1 rounded"
                  style={{ color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer" }}
                  aria-label={pwVisible ? "Hide password" : "Show password"}
                >
                  {pwVisible ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: 16, marginTop: 4, borderRadius: "var(--radius-md)",
                  background: "var(--primary-light)", border: "1px solid var(--sky-200)",
                  textAlign: "center",
                }}
              >
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  <KeyRound size={14} style={{ color: "var(--primary)", display: "inline", verticalAlign: "-2px", marginRight: 4 }} aria-hidden="true" />
                  Use your fingerprint, face, or PIN to sign in instantly.
                </p>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
            style={{
              minHeight: 52, height: "auto", padding: "0 20px", marginTop: 8,
              borderRadius: "var(--radius-md)", border: "none",
              background: loading ? "var(--primary)" : "var(--primary)",
              color: "white", fontSize: "clamp(15px, 3vw, 17px)", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "var(--font-sans)",
            }}
          >
            {loading ? (
              <><Spinner /> Creating account...</>
            ) : authMethod === "passkey" ? (
              <><KeyRound size={18} aria-hidden="true" /> Create with Passkey</>
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      )}

      {/* ══════ STEP 3: SUCCESS + COMPLETE PROFILE PROMPT ══════ */}
      {step === "success" && (
        <div className="space-y-5">
          <div className="text-center py-4">
            <div
              style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--green-bg)", display: "flex",
                alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Account created for <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{name}</span>
            </p>
          </div>

          {/* Complete profile prompt */}
          <div
            style={{
              padding: "clamp(14px, 3vw, 18px)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--sky-200)",
              background: "var(--primary-light)",
            }}
          >
            <div className="flex items-start gap-3">
              <div style={{ display: "flex", flexShrink: 0 }}>
                <FileText size={20} style={{ color: "var(--primary)" }} aria-hidden="true" />
              </div>
              <div style={{ flex: 1 }}>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  Complete your profile
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Add your professional details, qualifications, and organization to unlock all features.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => router.push("/register/constitution")}
              className="w-full"
              style={{
                minHeight: 48, padding: "0 20px",
                borderRadius: "var(--radius-md)", border: "none",
                background: "var(--primary)", color: "white",
                fontSize: 15, fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              Complete Profile
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full"
              style={{
                minHeight: 48, padding: "0 20px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--surface-border)",
                background: "transparent", color: "var(--text-secondary)",
                fontSize: 14, fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              I'll do this later \u2014 go to dashboard
            </button>
          </div>
        </div>
      )}

      {/* ══════ FOOTER ══════ */}
      {step !== "success" && (
        <div className="mt-6 pt-5 text-center text-xs" style={{ borderTop: "1px solid var(--surface-border)", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <a href="/login" className="font-medium no-underline hover:underline" style={{ color: "var(--primary)" }}>
            Sign in
          </a>
        </div>
      )}
    </div>
  );
}
