"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { generateRecoveryCode } from "@/lib/amexan";

function Spinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function RecoveryPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<'email' | 'sent' | 'backup'>('email');
  const [backupCode, setBackupCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  async function handleSendReset() {
    setError(null);
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Please enter a valid email address."); return; }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      const code = generateRecoveryCode();
      setGeneratedCode(code);
      setStep('sent');
    } catch (err: any) {
      const msg = err.code === 'auth/user-not-found'
        ? 'No account found with that email address.'
        : 'Failed to send recovery email. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleUseBackup() {
    setStep('backup');
    setError(null);
  }

  function handleVerifyBackup() {
    if (!backupCode.trim()) { setError("Please enter your backup code."); return; }
    router.push("/login");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading) {
      if (step === 'email') handleSendReset();
      if (step === 'backup') handleVerifyBackup();
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 48, padding: '0 16px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--surface-border)', background: 'var(--surface)',
    color: 'var(--text-primary)', fontSize: 15, fontFamily: 'var(--font-sans)',
    outline: 'none', transition: 'border-color .2s, box-shadow .2s',
    boxSizing: 'border-box',
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
          Account recovery
        </p>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Reset your password
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {step === 'email' && "Enter your email to receive a password reset link."}
          {step === 'sent' && "Check your inbox for the reset link."}
          {step === 'backup' && "Enter one of your backup recovery codes."}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-sm mb-4 border"
          role="alert"
          style={{ background: "var(--red-bg)", borderColor: "var(--red-border)", color: "var(--red)" }}>
          <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* ══════ STEP 1: Enter Email ══════ */}
      {step === 'email' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }} htmlFor="recovery-email">
              Email address
            </label>
            <input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              autoComplete="email"
              spellCheck={false}
              style={inputStyle}
            />
          </div>

          <button onClick={handleSendReset} disabled={loading}
            className="w-full mt-2 flex items-center justify-center"
            style={{
              height: 48, borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              fontFamily: 'var(--font-display)',
            }}>
            {loading ? <><Spinner /> Sending...</> : "Send reset link"}
          </button>
        </div>
      )}

      {/* ══════ STEP 2: Email Sent ══════ */}
      {step === 'sent' && (
        <div className="text-center py-4 space-y-4">
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 7L2 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              A password reset link has been sent to <strong>{email}</strong>.
            </p>
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
          </div>

          <button onClick={() => { setStep('email'); setError(null); }}
            style={{
              width: '100%', minHeight: 48, padding: '0 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-border)', background: 'transparent',
              color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}>
            Try a different email
          </button>

          <div className="pt-2 border-t" style={{ borderColor: 'var(--surface-border)' }}>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              If you don&apos;t have access to your email, use a backup code.
            </p>
            <button onClick={handleUseBackup}
              style={{
                width: '100%', minHeight: 48, padding: '0 16px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary)', background: 'transparent',
                color: 'var(--primary)', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}>
              Use backup code
            </button>
          </div>
        </div>
      )}

      {/* ══════ STEP 3: Backup Code ══════ */}
      {step === 'backup' && (
        <div className="space-y-4">
          <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--amber-bg)', border: '1px solid var(--amber-border)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--amber)' }}>Backup recovery code</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Enter one of the backup codes you saved when setting up your account.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }} htmlFor="backup-code">
              Backup code
            </label>
            <input
              id="backup-code"
              type="text"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="e.g. AB12CD34"
              spellCheck={false}
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)', letterSpacing: 2, textTransform: 'uppercase' }}
            />
          </div>

          <button onClick={handleVerifyBackup}
            className="w-full"
            style={{
              height: 48, borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-display)',
            }}>
            Verify &amp; sign in
          </button>

          <button onClick={() => { setStep('email'); setError(null); }}
            className="w-full"
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'var(--font-sans)', minHeight: 48,
              fontSize: 13,
            }}>
            Back to email recovery
          </button>
        </div>
      )}

      <div className="mt-6 pt-5 text-center text-xs" style={{ borderTop: "1px solid var(--surface-border)", color: "var(--text-secondary)" }}>
        Remember your password?{" "}
        <a href="/login" className="font-medium no-underline hover:underline" style={{ color: "var(--primary)" }}>
          Sign in
        </a>
      </div>
    </div>
  );
}
