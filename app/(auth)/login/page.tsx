"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

type AuthMethod = 'email' | 'passkey' | 'sso';

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/user-not-found": "No account found with that email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/popup-closed-by-user": "Sign in was cancelled. Please try again.",
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

export default function AuthLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [method, setMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const [shake, setShake] = useState(false);

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

  async function handleLogin() {
    if (loading) return;
    setError(null);

    if (!email.trim()) { showError("Please enter your email address."); return; }
    if (!password) { showError("Please enter your password."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { showError("Please enter a valid email address."); return; }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch (err: any) {
      showError(mapFirebaseError(err.code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleSSO(providerName: 'google' | 'apple' | 'microsoft') {
    setLoading(true);
    setError(null);
    try {
      let provider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
      } else {
        provider = new OAuthProvider(providerName === 'apple' ? 'apple.com' : 'microsoft.com');
      }
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      showError(mapFirebaseError(err.code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasskey() {
    if (!navigator.credentials || !navigator.credentials.get) {
      showError("Passkeys are not supported on this device. Please use Email or SSO.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: 'required',
        },
      } as CredentialRequestOptions);
      if (assertion) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      showError(err.name === 'NotAllowedError' ? 'Passkey verification was cancelled.' : 'Passkey sign in failed. Please try another method.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading && method === 'email') handleLogin();
  }

  const tabs: { id: AuthMethod; label: string; icon: string }[] = [
    { id: 'email', label: 'Email', icon: '✉' },
    { id: 'passkey', label: 'Passkey', icon: '🔑' },
    { id: 'sso', label: 'SSO', icon: '🔗' },
  ];

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
          Secure access
        </p>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Welcome back
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Sign in to your AMEXAN account.
        </p>
      </div>

      {/* Auth method tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setMethod(t.id); setError(null); }}
            className="flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all"
            style={{
              background: method === t.id ? 'white' : 'transparent',
              color: method === t.id ? 'var(--primary)' : 'var(--text-muted)',
              border: method === t.id ? '1px solid var(--surface-border)' : 'none',
              boxShadow: method === t.id ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

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

      {/* ══════ EMAIL METHOD ══════ */}
      {method === 'email' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }} htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              autoComplete="email"
              spellCheck={false}
              className="input"
              style={{ height: 48, fontSize: 15 }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }} htmlFor="login-password">
                Password
              </label>
              <a href="/recovery" className="text-xs font-medium no-underline hover:underline" style={{ color: "var(--primary)" }}>
                Forgot password?
              </a>
            </div>
            <div
              className="flex items-center"
              style={{ width: "100%", height: 48, padding: "0 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)", background: "var(--surface)", transition: "border-color .2s, box-shadow .2s" }}
            >
              <input
                id="login-password"
                type={pwVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your password"
                autoComplete="current-password"
                spellCheck={false}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--text-primary)", fontSize: 15, fontFamily: "var(--font-sans)", minWidth: 0 }}
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
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full mt-5"
            style={{ height: 48, fontSize: 15 }}
          >
            {loading ? <><Spinner /> Signing in...</> : "Sign in"}
          </button>
        </div>
      )}

      {/* ══════ PASSKEY METHOD ══════ */}
      {method === 'passkey' && (
        <div className="text-center py-6 space-y-4">
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Sign in with Passkey</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Use your device&apos;s biometric or PIN for fast, passwordless sign in.
            </p>
          </div>
          <button
            onClick={handlePasskey}
            disabled={loading}
            style={{
              width: '100%', height: 48, borderRadius: 'var(--radius-md)', border: 'none',
              background: loading ? 'var(--primary)' : 'var(--primary)', color: 'white',
              fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? <><Spinner /> Verifying...</> : 'Use Passkey'}
          </button>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Passkeys use WebAuthn and work with fingerprint, face, or device PIN.
          </p>
        </div>
      )}

      {/* ══════ SSO METHOD ══════ */}
      {method === 'sso' && (
        <div className="space-y-3 py-2">
          <button onClick={() => handleSSO('google')} disabled={loading}
            style={{
              width: '100%', height: 48, borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-border)', background: 'var(--surface)',
              color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'var(--font-sans)',
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          <button onClick={() => handleSSO('apple')} disabled={loading}
            style={{
              width: '100%', height: 48, borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-border)', background: 'var(--surface)',
              color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'var(--font-sans)',
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Continue with Apple
          </button>
          <button onClick={() => handleSSO('microsoft')} disabled={loading}
            style={{
              width: '100%', height: 48, borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-border)', background: 'var(--surface)',
              color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'var(--font-sans)',
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><rect x="2" y="2" width="9" height="9" fill="#F25022"/><rect x="13" y="2" width="9" height="9" fill="#7FBA00"/><rect x="2" y="13" width="9" height="9" fill="#00A4EF"/><rect x="13" y="13" width="9" height="9" fill="#FFB900"/></svg>
            Continue with Microsoft
          </button>
          <p className="text-xs text-center pt-3" style={{ color: 'var(--text-muted)' }}>
            SSO will create an account if one doesn&apos;t exist.
          </p>
        </div>
      )}

      <div className="mt-6 pt-5 text-center text-xs" style={{ borderTop: "1px solid var(--surface-border)", color: "var(--text-secondary)" }}>
        Don&apos;t have an account?{" "}
        <a href="/register" className="font-medium no-underline hover:underline" style={{ color: "var(--primary)" }}>
          Register
        </a>
        <p className="mt-3" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
          Protected by 256-bit AES encryption &amp; HIPAA compliance.
        </p>
      </div>
    </div>
  );
}
