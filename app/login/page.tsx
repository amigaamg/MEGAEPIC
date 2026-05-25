"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// ─── Types ─────────────────────────────────────────────────────────────────

type LoadingState = "creds" | "google" | null;
type IdentifierMode = "email" | "username" | "idle";

// ─── Constants ─────────────────────────────────────────────────────────────

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-credential":
    "Incorrect email, username, or password. Please try again.",
  "auth/user-not-found":
    "No account found. Check your details or create an account.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment before trying again.",
  "auth/user-disabled":
    "This account is disabled. Please contact support.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/network-request-failed":
    "Network error. Please check your internet connection.",
};

// ─── Utilities ─────────────────────────────────────────────────────────────

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function mapFirebaseError(code: string): string {
  return (
    FIREBASE_ERRORS[code] ?? "Something went wrong. Please try again."
  );
}

function detectMode(value: string): IdentifierMode {
  if (!value.trim()) return "idle";
  return isEmail(value) ? "email" : "username";
}

async function resolveEmailFromUsername(username: string): Promise<string | null> {
  const db = getFirestore();
  const snap = await getDocs(
    query(
      collection(db, "users"),
      where("username", "==", username.toLowerCase().trim())
    )
  );
  return snap.empty ? null : (snap.docs[0].data().email ?? null);
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="amx-logo">
      <div className="amx-logo-mark" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M5 18L11 6L17 18" stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 13.5H14.5" stroke="white" strokeWidth="2"
            strokeLinecap="round" />
        </svg>
      </div>
      <span className="amx-logo-name">
        Amex<span>an</span>
      </span>
    </div>
  );
}

function TrustBar() {
  const items = [
    { num: "2.4M+", label: "Active patients" },
    { num: "18K",   label: "Providers" },
    { num: "99.99%",label: "Uptime SLA" },
    { num: "HIPAA", label: "Certified" },
  ];
  return (
    <div className="amx-trust-bar">
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <div className="amx-trust-div" />}
          <div className="amx-trust-item">
            <div className="amx-trust-num">{item.num}</div>
            <div className="amx-trust-label">{item.label}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function SocialProof() {
  const avatars = [
    { initials: "DR", cls: "av1" },
    { initials: "MN", cls: "av2" },
    { initials: "SK", cls: "av3" },
  ];
  return (
    <div className="amx-social-strip">
      <div className="amx-avatar-stack" aria-hidden="true">
        {avatars.map((a) => (
          <div key={a.initials} className={`amx-avatar ${a.cls}`}>
            {a.initials}
          </div>
        ))}
        <div className="amx-avatar">+</div>
      </div>
      <span className="amx-social-text">
        <span className="amx-stars">★★★★★</span>
        Trusted by <strong>18,000+ providers</strong>
      </span>
    </div>
  );
}

interface InputFieldProps {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder: string;
  icon: string;
  autoComplete?: string;
  hasError?: boolean;
  rightSlot?: React.ReactNode;
  onInput?: (v: string) => void;
}

function InputField({
  id, type = "text", value, onChange, onKeyDown, placeholder,
  icon, autoComplete, hasError, rightSlot, onInput,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);

  const wrapCls = [
    "amx-input-wrap",
    focused ? "focused" : "",
    hasError ? "err" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={wrapCls}>
      <i className={`ti ${icon} amx-input-icon`} aria-hidden="true" />
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        spellCheck={false}
        className="amx-inp"
        onChange={(e) => {
          onChange(e.target.value);
          onInput?.(e.target.value);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {rightSlot}
    </div>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return <div className={dark ? "amx-spin-dark" : "amx-spin"} />;
}

// ─── Auth theme sync ───────────────────────────────────────────────────────

const AUTH_THEMES: Record<string, Record<string, string>> = {
  forest: {
    "--ap": "#0F766E","--aph": "#0D5E57","--apf": "#0F766E",
    "--apg": "rgba(15,118,110,0.12)","--apg2": "rgba(15,118,110,0.09)","--apg3": "rgba(15,118,110,0.3)","--apg4": "rgba(15,118,110,0.18)",
    "--apd": "#0F766E","--aphd": "#0D5E57","--apgd": "rgba(15,118,110,0.15)",
  },
  midnight: {
    "--ap": "#3B82F6","--aph": "#2563EB","--apf": "#3B82F6",
    "--apg": "rgba(59,130,246,0.12)","--apg2": "rgba(59,130,246,0.09)","--apg3": "rgba(59,130,246,0.3)","--apg4": "rgba(59,130,246,0.18)",
    "--apd": "#60A5FA","--aphd": "#3B82F6","--apgd": "rgba(96,165,250,0.15)",
  },
  ivory: {
    "--ap": "#E07A5F","--aph": "#C96A50","--apf": "#E07A5F",
    "--apg": "rgba(224,122,95,0.12)","--apg2": "rgba(224,122,95,0.09)","--apg3": "rgba(224,122,95,0.3)","--apg4": "rgba(224,122,95,0.18)",
    "--apd": "#E07A5F","--aphd": "#C96A50","--apgd": "rgba(224,122,95,0.15)",
  },
  slate: {
    "--ap": "#6366F1","--aph": "#4F46E5","--apf": "#6366F1",
    "--apg": "rgba(99,102,241,0.12)","--apg2": "rgba(99,102,241,0.09)","--apg3": "rgba(99,102,241,0.3)","--apg4": "rgba(99,102,241,0.18)",
    "--apd": "#818CF8","--aphd": "#6366F1","--apgd": "rgba(129,140,248,0.15)",
  },
};

function AuthThemeInjector() {
  useEffect(() => {
    const saved = localStorage.getItem("amx-theme");
    const vars = saved && AUTH_THEMES[saved] ? AUTH_THEMES[saved] : null;
    if (!vars) return;
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));
    return () => {
      Object.keys(vars).forEach((key) => root.style.removeProperty(key));
    };
  }, []);
  return null;
}

// ─── Main component ────────────────────────────────────────────────────────

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [pwVisible, setPwVisible]   = useState(false);
  const [loading, setLoading]       = useState<LoadingState>(null);
  const [error, setError]           = useState<string | null>(null);
  const [shake, setShake]           = useState(false);
  const [mode, setMode]             = useState<IdentifierMode>("idle");

  const router    = useRouter();
  const { login } = useAuth();
  const busy = loading !== null;

  const triggerShake = useCallback(() => {
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    setTimeout(() => setShake(false), 400);
  }, []);

  const showError = useCallback((msg: string) => {
    setError(msg);
    triggerShake();
  }, [triggerShake]);

  function redirectByRole(role: string | null | undefined) {
    if (!role) {
      showError("User role not assigned. Contact your administrator.");
      return;
    }
    if (role === "doctor")     router.push("/dashboard/doctor");
    else if (role === "admin") router.push("/dashboard/admin");
    else                       router.push("/dashboard/patient");
  }

  async function handleLogin() {
    if (busy) return;
    setError(null);

    if (!identifier.trim()) {
      showError("Please enter your email or username.");
      return;
    }
    if (!password) {
      showError("Please enter your password.");
      return;
    }

    setLoading("creds");
    try {
      let emailToUse = identifier.trim();

      if (!isEmail(emailToUse)) {
        const resolved = await resolveEmailFromUsername(emailToUse);
        if (!resolved) {
          showError("No account found with that username.");
          return;
        }
        emailToUse = resolved;
      }

      const role = await login(emailToUse, password);
      redirectByRole(role);
    } catch (err: any) {
      showError(mapFirebaseError(err.code ?? ""));
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    if (busy) return;
    setError(null);
    setLoading("google");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(getAuth(), provider);
      const role = await login("__google__", "__google__");
      redirectByRole(role);
    } catch (err: any) {
      showError(mapFirebaseError(err.code ?? ""));
    } finally {
      setLoading(null);
    }
  }

  const enterKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !busy) handleLogin();
  };

  const modeIcon =
    mode === "email" ? "ti-mail"
    : mode === "username" ? "ti-at"
    : "ti-user";

  return (
    <>
      <AuthThemeInjector />
      <style>{CSS}</style>

      <div className="amx-page">
        {/* ── Left brand panel ── */}
        <aside className="amx-panel">
          <div className="amx-panel-grid" aria-hidden="true" />
          <div className="amx-panel-glow" aria-hidden="true" />

          <Logo />

          <div className="amx-panel-body">
            <div className="amx-panel-tag">Healthcare Platform</div>
            <h1 className="amx-panel-h">
              The future of<br />
              <em>intelligent</em><br />
              healthcare.
            </h1>
            <p className="amx-panel-sub">
              A unified platform connecting doctors, patients, and
              administrators — built for speed, trust, and clinical excellence.
            </p>
            <TrustBar />
          </div>
        </aside>

        {/* ── Right form ── */}
        <main className="amx-form-wrap">
          <div className="amx-form-inner">

            <SocialProof />

            <div className="amx-form-top">
              <div className="amx-eyebrow">Secure access</div>
              <h2 className="amx-form-h">Welcome back</h2>
              <p className="amx-form-sub">
                Sign in to your Amexan account to continue.
              </p>
            </div>

            {/* Google */}
            <button
              className="amx-btn-google"
              onClick={handleGoogle}
              disabled={busy}
              type="button"
              aria-label="Sign in with Google"
            >
              {loading === "google" ? (
                <Spinner dark />
              ) : (
                <GoogleLogo />
              )}
              {loading === "google" ? "Signing in…" : "Continue with Google"}
            </button>

            <div className="amx-divider">
              <div className="amx-divider-line" />
              <span className="amx-divider-text">or continue with credentials</span>
              <div className="amx-divider-line" />
            </div>

            {/* Error */}
            {error && (
              <div
                className={`amx-err-box${shake ? " shake" : ""}`}
                role="alert"
              >
                <i className="ti ti-alert-circle" aria-hidden="true" />
                {error}
              </div>
            )}

            {/* Identifier */}
            <div className="amx-field">
              <div className="amx-field-header">
                <label className="amx-field-label" htmlFor="identifier">
                  Email or username
                </label>
                {mode !== "idle" && (
                  <span className="amx-mode-pill">{mode}</span>
                )}
              </div>
              <InputField
                id="identifier"
                value={identifier}
                onChange={setIdentifier}
                onInput={(v) => setMode(detectMode(v))}
                onKeyDown={enterKey}
                placeholder="you@example.com or @username"
                icon={modeIcon}
                autoComplete="username email"
                hasError={!!error}
              />
            </div>

            {/* Password */}
            <div className="amx-field">
              <div className="amx-field-header">
                <label className="amx-field-label" htmlFor="password">
                  Password
                </label>
                <a href="/auth/forgot-password" className="amx-field-link">
                  Forgot password?
                </a>
              </div>
              <InputField
                id="password"
                type={pwVisible ? "text" : "password"}
                value={password}
                onChange={setPassword}
                onKeyDown={enterKey}
                placeholder="Enter your password"
                icon="ti-lock"
                autoComplete="current-password"
                hasError={!!error}
                rightSlot={
                  <button
                    type="button"
                    className="amx-eye-btn"
                    onClick={() => setPwVisible((v) => !v)}
                    aria-label={pwVisible ? "Hide password" : "Show password"}
                  >
                    <i
                      className={`ti ${pwVisible ? "ti-eye-off" : "ti-eye"}`}
                      aria-hidden="true"
                    />
                  </button>
                }
              />
            </div>

            {/* Submit */}
            <button
              className="amx-btn-primary"
              onClick={handleLogin}
              disabled={busy}
              type="button"
            >
              {loading === "creds" ? (
                <><Spinner /> Signing in…</>
              ) : (
                "Sign in"
              )}
            </button>

            {/* Footer */}
            <div className="amx-footer">
              Don't have an account?{" "}
              <a href="/register">Create one</a>
              <p className="amx-legal">
                By signing in, you agree to our{" "}
                <a href="/terms">Terms of Service</a> and{" "}
                <a href="/privacy">Privacy Policy</a>.
                <br />
                Protected by 256-bit AES encryption &amp; HIPAA compliance.
              </p>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ─── CSS-in-JS string ──────────────────────────────────────────────────────
// In a real project, move this to globals.css or a CSS module.
const CSS = `
  .amx-page {
    min-height: 100dvh;
    display: grid;
    grid-template-columns: 1fr 520px;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    animation: amx-fadein .35s ease;
  }

  @keyframes amx-fadein { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }

  /* ── Left panel ── */
  .amx-panel {
    background: #0D0D12;
    display: flex;
    flex-direction: column;
    padding: 48px;
    position: relative;
    overflow: hidden;
  }
  .amx-panel-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(245,244,240,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245,244,240,.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }
  .amx-panel-glow {
    position: absolute; width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, var(--apg4, rgba(26,26,255,.18)) 0%, transparent 70%);
    top: -100px; left: -100px; pointer-events: none;
  }
  .amx-logo { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
  .amx-logo-mark {
    width: 38px; height: 38px; border-radius: 10px; background: var(--ap, #1A1AFF);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .amx-logo-name {
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700;
    color: #F5F4F0; letter-spacing: -.3px;
  }
  .amx-logo-name span { color: var(--ap, #1A1AFF); filter: brightness(1.5); }

  .amx-panel-body {
    flex: 1; display: flex; flex-direction: column; justify-content: center;
    position: relative; z-index: 1; padding: 40px 0;
  }
  .amx-panel-tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase;
    color: var(--apf, #5555ff); filter: brightness(1.4);
    border: 1px solid var(--apg3, rgba(26,26,255,.3));
    padding: 5px 12px; border-radius: 999px; margin-bottom: 24px; width: fit-content;
  }
  .amx-panel-tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .amx-panel-h {
    font-family: 'Syne', sans-serif;
    font-size: clamp(32px, 4vw, 52px);
    font-weight: 800; line-height: 1.05;
    color: #F5F4F0; letter-spacing: -1.5px; margin-bottom: 20px;
  }
  .amx-panel-h em { font-style: normal; color: var(--ap, #1A1AFF); filter: brightness(1.4); }
  .amx-panel-sub { font-size: 15px; color: rgba(245,244,240,.5); line-height: 1.6; max-width: 360px; font-weight: 300; }

  .amx-trust-bar {
    display: flex; align-items: center; gap: 20px;
    margin-top: 48px; border-top: 1px solid rgba(245,244,240,.08);
    padding-top: 28px;
  }
  .amx-trust-item { text-align: center; }
  .amx-trust-num { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #F5F4F0; }
  .amx-trust-label { font-size: 11px; color: rgba(245,244,240,.45); margin-top: 2px; }
  .amx-trust-div { width: 1px; height: 32px; background: rgba(245,244,240,.08); }

  /* ── Form panel ── */
  .amx-form-wrap {
    background: #FFFFFF; display: flex; flex-direction: column;
    border-left: 1px solid #E4E3DD; overflow-y: auto;
  }
  .amx-form-inner {
    flex: 1; display: flex; flex-direction: column; justify-content: center;
    padding: clamp(32px,5vw,56px) clamp(28px,5vw,52px);
    min-height: 100vh;
  }

  /* Social proof */
  .amx-social-strip { display: flex; align-items: center; gap: 0; margin-bottom: 20px; }
  .amx-avatar-stack { display: flex; margin-right: 10px; }
  .amx-avatar {
    width: 28px; height: 28px; border-radius: 50%; border: 2px solid #fff;
    background: #F5F4F0; margin-left: -8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 600; color: #4A4A5A;
  }
  .amx-avatar:first-child { margin-left: 0; }
  .amx-avatar.av1 { background: #E8E4FF; color: #534AB7; }
  .amx-avatar.av2 { background: #E1F5EE; color: #0F6E56; }
  .amx-avatar.av3 { background: #FAEEDA; color: #633806; }
  .amx-social-text { font-size: 12px; color: #4A4A5A; }
  .amx-stars { color: #F59E0B; letter-spacing: -1px; font-size: 12px; margin-right: 4px; }

  /* Form header */
  .amx-form-top { margin-bottom: 28px; }
  .amx-eyebrow { font-size: 12px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: #9090A0; margin-bottom: 8px; }
  .amx-form-h { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; color: #0D0D12; letter-spacing: -.5px; margin-bottom: 6px; }
  .amx-form-sub { font-size: 14px; color: #4A4A5A; line-height: 1.5; }

  /* Google btn */
  .amx-btn-google {
    width: 100%; height: 52px; border: 1.5px solid #E4E3DD; border-radius: 14px;
    background: #fff; display: flex; align-items: center; justify-content: center; gap: 10px;
    font-size: 14px; font-weight: 500; color: #0D0D12; cursor: pointer;
    transition: border-color .18s, background .18s, transform .12s;
    font-family: 'DM Sans', sans-serif;
  }
  .amx-btn-google:hover:not(:disabled) { border-color: #C8C6BE; background: #F9F8F5; }
  .amx-btn-google:active:not(:disabled) { transform: scale(.985); }
  .amx-btn-google:disabled { opacity: .5; cursor: not-allowed; }

  /* Divider */
  .amx-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .amx-divider-line { flex: 1; height: 1px; background: #E4E3DD; }
  .amx-divider-text { font-size: 12px; color: #9090A0; white-space: nowrap; font-weight: 500; }

  /* Error */
  .amx-err-box {
    display: flex; align-items: flex-start; gap: 9px;
    padding: 12px 14px; background: #FEF2F2;
    border: 1px solid #FCA5A5; border-radius: 10px;
    font-size: 13px; color: #DC2626; line-height: 1.45; margin-bottom: 16px;
  }
  .amx-err-box i { flex-shrink: 0; font-size: 16px; margin-top: 1px; }
  @keyframes amx-shake {
    0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}
  }
  .amx-err-box.shake { animation: amx-shake .35s ease; }

  /* Fields */
  .amx-field { margin-bottom: 14px; }
  .amx-field-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
  .amx-field-label { font-size: 13px; font-weight: 500; color: #0D0D12; }
  .amx-field-link { font-size: 12px; color: var(--ap, #1A1AFF); text-decoration: none; font-weight: 500; }
  .amx-field-link:hover { text-decoration: underline; opacity: .75; }
  .amx-mode-pill {
    display: inline-flex; align-items: center; font-size: 11px; font-weight: 600;
    letter-spacing: .04em; padding: 3px 9px; border-radius: 999px; text-transform: uppercase;
    background: var(--apg2, rgba(26,26,255,.09)); color: var(--ap, #1A1AFF);
  }

  /* Input wrap */
  .amx-input-wrap {
    display: flex; align-items: center; height: 52px;
    border: 1.5px solid #DDDBD4; border-radius: 14px;
    background: #F9F8F5; padding: 0 16px; gap: 10px;
    transition: border-color .18s, box-shadow .18s, background .18s;
  }
  .amx-input-wrap:hover { border-color: #C8C6BE; background: #fff; }
  .amx-input-wrap.focused { border-color: var(--ap, #1A1AFF); background: #fff; box-shadow: 0 0 0 3px var(--apg, rgba(26,26,255,.12)); }
  .amx-input-wrap.err { border-color: #DC2626; box-shadow: 0 0 0 3px rgba(220,38,38,.1); }
  .amx-input-icon { font-size: 17px; color: #9090A0; flex-shrink: 0; transition: color .18s; }
  .amx-input-wrap.focused .amx-input-icon { color: var(--ap, #1A1AFF); }
  .amx-input-wrap.err .amx-input-icon { color: #DC2626; }
  .amx-inp {
    flex: 1; border: none; outline: none; background: transparent;
    font-size: 15px; color: #0D0D12; font-family: 'DM Sans', sans-serif; min-width: 0;
  }
  .amx-inp::placeholder { color: #9090A0; }
  .amx-eye-btn {
    background: none; border: none; cursor: pointer; padding: 4px; color: #9090A0;
    display: flex; align-items: center; border-radius: 6px; transition: color .18s, background .18s;
  }
  .amx-eye-btn:hover { color: #0D0D12; background: #F5F4F0; }
  .amx-eye-btn i { font-size: 17px; }

  /* Submit */
  .amx-btn-primary {
    width: 100%; height: 52px; border: none; border-radius: 14px;
    background: var(--ap, #1A1AFF); color: #fff; font-size: 15px; font-weight: 600;
    font-family: 'Syne', sans-serif; letter-spacing: .01em;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background .18s, transform .12s, opacity .18s;
    margin-top: 4px;
  }
  .amx-btn-primary:hover:not(:disabled) { background: var(--aph, #0000CC); }
  .amx-btn-primary:active:not(:disabled) { transform: scale(.986); }
  .amx-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

  /* Spinners */
  .amx-spin { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: amx-sp .55s linear infinite; }
  .amx-spin-dark { width: 18px; height: 18px; border: 2px solid #E4E3DD; border-top-color: var(--ap, #1A1AFF); border-radius: 50%; animation: amx-sp .55s linear infinite; }
  @keyframes amx-sp { to { transform: rotate(360deg); } }

  /* Footer */
  .amx-footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #E4E3DD; text-align: center; font-size: 13px; color: #4A4A5A; }
  .amx-footer a { color: var(--ap, #1A1AFF); text-decoration: none; font-weight: 500; }
  .amx-footer a:hover { text-decoration: underline; }
  .amx-legal { font-size: 11px; color: #9090A0; margin-top: 14px; line-height: 1.5; }
  .amx-legal a { color: #9090A0; text-decoration: underline; }

  /* Responsive */
  @media (max-width: 900px) {
    .amx-page { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
    .amx-panel { padding: 28px 24px; }
    .amx-panel-body { padding: 20px 0; }
    .amx-panel-h { font-size: clamp(26px,6vw,40px); letter-spacing: -1px; }
    .amx-panel-sub { display: none; }
    .amx-trust-bar { flex-wrap: wrap; gap: 16px; margin-top: 24px; padding-top: 18px; }
    .amx-form-wrap { border-left: none; border-top: 1px solid #E4E3DD; }
    .amx-form-inner { min-height: auto; padding: 32px 24px 40px; }
  }
  @media (max-width: 480px) {
    .amx-panel { padding: 20px; }
    .amx-panel-h { font-size: 26px; }
    .amx-panel-tag { display: none; }
    .amx-trust-bar { gap: 12px; margin-top: 16px; padding-top: 14px; }
    .amx-trust-num { font-size: 17px; }
    .amx-form-inner { padding: 24px 20px 32px; }
    .amx-form-h { font-size: 22px; }
    .amx-btn-primary, .amx-btn-google, .amx-input-wrap { height: 48px; }
  }

  @media (prefers-color-scheme: dark) {
    .amx-form-wrap { background: #13131C; border-color: #222230; }
    .amx-form-h { color: #F0EFEC; }
    .amx-eyebrow { color: #565666; }
    .amx-form-sub { color: #9090A8; }
    .amx-field-label { color: #F0EFEC; }
    .amx-mode-pill { background: var(--apgd, rgba(77,77,255,.15)); color: var(--apd, #4D4DFF); }
    .amx-btn-google { background: #0D0D16; border-color: #1E1E2C; color: #F0EFEC; }
    .amx-btn-google:hover:not(:disabled) { background: #1E1E2C; border-color: #2A2A3C; }
    .amx-input-wrap { background: #0D0D16; border-color: #1E1E2C; }
    .amx-input-wrap:hover { background: #13131C; border-color: #2A2A3C; }
    .amx-input-wrap.focused { border-color: var(--apd, #4D4DFF); background: #13131C; box-shadow: 0 0 0 3px var(--apgd, rgba(77,77,255,.15)); }
    .amx-input-wrap.focused .amx-input-icon { color: var(--apd, #4D4DFF); }
    .amx-inp { color: #F0EFEC; }
    .amx-inp::placeholder { color: #565666; }
    .amx-eye-btn:hover { background: #1E1E2C; color: #F0EFEC; }
    .amx-divider-line { background: #222230; }
    .amx-divider-text { color: #565666; }
    .amx-err-box { background: #1A0808; border-color: #7F1D1D; color: #F87171; }
    .amx-btn-primary { background: var(--apd, #4D4DFF); }
    .amx-btn-primary:hover:not(:disabled) { background: var(--aphd, #3A3AFF); }
    .amx-spin-dark { border-color: #222230; border-top-color: var(--apd, #4D4DFF); }
    .amx-footer { border-color: #222230; color: #9090A8; }
    .amx-footer a { color: var(--apd, #4D4DFF); }
    .amx-legal { color: #565666; }
    .amx-legal a { color: #565666; }
    .amx-field-link { color: var(--apd, #4D4DFF); }
    .amx-social-text { color: #9090A8; }
    .amx-avatar { border-color: #13131C; background: #1E1E2C; }
    .amx-social-strip strong { color: #F0EFEC; }
    .amx-trust-div { background: rgba(240,239,236,.08); }
  }
`;