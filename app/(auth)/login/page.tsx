"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/user-not-found": "No account found with that email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/network-request-failed": "Network error. Check your connection.",
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

  function redirectByRole(role: string | null | undefined) {
    if (!role) {
      showError("User role not assigned. Contact your administrator.");
      return;
    }
    if (role === "doctor") router.push("/dashboard/doctor");
    else if (role === "admin") router.push("/dashboard/admin");
    else router.push("/dashboard/patient");
  }

  async function handleLogin() {
    if (loading) return;
    setError(null);

    if (!email.trim()) {
      showError("Please enter your email address.");
      return;
    }
    if (!password) {
      showError("Please enter your password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const role = await login(email.trim(), password);
      redirectByRole(role);
    } catch (err: any) {
      showError(mapFirebaseError(err.code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading) handleLogin();
  }

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Secure access
        </p>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--frost-50)" }}
        >
          Welcome back
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Sign in to your Amexan account.
        </p>
      </div>

      {error && (
        <div
          className={`flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-sm mb-4 border ${
            shake ? "animate-shake" : ""
          }`}
          role="alert"
          style={{
            background: "rgba(255,69,96,0.1)",
            borderColor: "rgba(255,69,96,0.25)",
            color: "var(--red)",
          }}
        >
          <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
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

      <div className="space-y-4">
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--frost-300)" }}
            htmlFor="login-email"
          >
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
            className="auth-input"
            style={{
              width: "100%",
              height: 48,
              padding: "0 16px",
              borderRadius: 10,
              border: "1.5px solid var(--glass-border)",
              background: "rgba(11,18,48,0.6)",
              color: "var(--frost-50)",
              fontSize: 15,
              fontFamily: "var(--font-sans)",
              outline: "none",
              transition: "border-color .2s, box-shadow .2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--teal)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,229,204,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--glass-border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              className="block text-xs font-medium"
              style={{ color: "var(--frost-300)" }}
              htmlFor="login-password"
            >
              Password
            </label>
            <a
              href="/auth/forgot-password"
              className="text-xs font-medium no-underline hover:underline"
              style={{ color: "var(--teal)" }}
            >
              Forgot password?
            </a>
          </div>
          <div
            className="flex items-center"
            style={{
              width: "100%",
              height: 48,
              padding: "0 16px",
              borderRadius: 10,
              border: "1.5px solid var(--glass-border)",
              background: "rgba(11,18,48,0.6)",
              transition: "border-color .2s, box-shadow .2s",
            }}
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
              className="auth-input"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "var(--frost-50)",
                fontSize: 15,
                fontFamily: "var(--font-sans)",
                minWidth: 0,
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full h-12 mt-5 flex items-center justify-center rounded-xl border-none text-sm font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "var(--teal)",
          color: "var(--midnight-900)",
          fontFamily: "var(--font-display)",
        }}
      >
        {loading ? (
          <>
            <Spinner /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

      <div
        className="mt-6 pt-5 text-center text-xs"
        style={{
          borderTop: "1px solid var(--glass-border)",
          color: "var(--text-secondary)",
        }}
      >
        Don&apos;t have an account?{" "}
        <a
            href="/register"
          className="font-medium no-underline hover:underline"
          style={{ color: "var(--teal)" }}
        >
          Register
        </a>
        <p className="mt-3" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
          Protected by 256-bit AES encryption &amp; HIPAA compliance.
        </p>
      </div>
    </div>
  );
}
