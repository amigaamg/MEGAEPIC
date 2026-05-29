"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

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

const ROLES = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "admin", label: "Administrator" },
  { value: "staff", label: "Staff" },
];

function Spinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function AuthRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const [confirmPwVisible, setConfirmPwVisible] = useState(false);
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

  async function handleRegister() {
    if (loading) return;
    setError(null);

    if (!name.trim()) {
      showError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      showError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      showError("Please choose a password.");
      return;
    }
    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = res.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        email: email.trim(),
        role,
        createdAt: serverTimestamp(),
        smartcardId: "AMX-" + Math.floor(100000 + Math.random() * 900000),
      });

      router.push(role === "doctor" ? "/dashboard/doctor" : role === "admin" ? "/dashboard/admin" : "/dashboard/patient");
    } catch (err: any) {
      showError(mapFirebaseError(err.code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading) handleRegister();
  }

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Get started
        </p>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--frost-50)" }}
        >
          Create your account
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Fill in your details to get instant access.
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
            htmlFor="reg-name"
          >
            Full name
          </label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Dr. Jane Smith"
            autoComplete="name"
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
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--frost-300)" }}
            htmlFor="reg-email"
          >
            Email address
          </label>
          <input
            id="reg-email"
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
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--frost-300)" }}
            htmlFor="reg-role"
          >
            I am a&hellip;
          </label>
          <div
            className="flex items-center"
            style={{
              width: "100%",
              height: 48,
              padding: "0 16px",
              borderRadius: 10,
              border: "1.5px solid var(--glass-border)",
              background: "rgba(11,18,48,0.6)",
            }}
          >
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="auth-select"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "var(--frost-50)",
                fontSize: 15,
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
                appearance: "none",
                paddingRight: 24,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23546382' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 4px center",
              }}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--frost-300)" }}
            htmlFor="reg-password"
          >
            Password
          </label>
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
              id="reg-password"
              type={pwVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="At least 6 characters"
              autoComplete="new-password"
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

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--frost-300)" }}
            htmlFor="reg-confirm"
          >
            Confirm password
          </label>
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
              id="reg-confirm"
              type={confirmPwVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Re-enter your password"
              autoComplete="new-password"
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
              onClick={() => setConfirmPwVisible((v) => !v)}
              className="shrink-0 p-1 rounded"
              style={{ color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer" }}
              aria-label={confirmPwVisible ? "Hide password" : "Show password"}
            >
              {confirmPwVisible ? (
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
        onClick={handleRegister}
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
            <Spinner /> Creating account&hellip;
          </>
        ) : (
          "Create account"
        )}
      </button>

      <div
        className="mt-6 pt-5 text-center text-xs"
        style={{
          borderTop: "1px solid var(--glass-border)",
          color: "var(--text-secondary)",
        }}
      >
        Already have an account?{" "}
        <a
          href="/auth/login"
          className="font-medium no-underline hover:underline"
          style={{ color: "var(--teal)" }}
        >
          Sign in
        </a>
        <p className="mt-3" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
          Protected by 256-bit AES encryption &amp; HIPAA compliance.
        </p>
      </div>
    </div>
  );
}
