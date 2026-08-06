"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DEMO_WORKSPACE_ACCOUNTS, DEMO_PASSWORD, DEMO_ORG_NAME } from "@/lib/amexan/demo/demoWorkspaces";
import { UserRound } from "lucide-react";

const DEV_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true" || process.env.NODE_ENV === "development";

export default function DemoLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  async function logInAs(email: string) {
    if (loadingEmail) return;
    setError(null);
    setLoadingEmail(email);
    try {
      await login(email, DEMO_PASSWORD);
      // Route each actor to its true dashboard (declared in demoWorkspaces),
      // never through the legacy /clinical-auth gate or workspace resolver.
      const account = DEMO_WORKSPACE_ACCOUNTS.find(a => a.email === email);
      if (account) {
        // Use the demo account's declared dashboard route — this is the
        // constitutional destination for each seeded persona (WS-017).
        router.push(account.dashboardRoute);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(
        err?.code === "auth/user-not-found"
          ? `Account "${email}" not found. Run: npx tsx scripts/seed-demo-hospital.ts`
          : err?.message || "Demo sign-in failed.",
      );
    } finally {
      setLoadingEmail(null);
    }
  }

  // Disabled entirely in production — the seeded accounts are for development.
  if (process.env.NODE_ENV === "production" && !DEV_ENABLED) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-elevated)] px-6">
        <div className="text-center max-w-sm">
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Demo login is disabled in production.
          </p>
          <a href="/login" className="mt-4 inline-block text-sm font-semibold no-underline" style={{ color: "var(--primary)" }}>
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <UserRound size={18} style={{ color: "var(--primary)" }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            Developer · Book XV WS-017
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Login as a Demo User
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Switch instantly between personas in <strong>{DEMO_ORG_NAME}</strong>. Each account is fully provisioned and
          bypasses onboarding — it lands directly on its constitutional workspace.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-3.5 py-3 rounded-lg text-sm border" role="alert" style={{ background: "var(--red-bg)", borderColor: "var(--red-border)", color: "var(--red)" }}>
          {error}
        </div>
      )}

      <div className="space-y-2.5">
        {DEMO_WORKSPACE_ACCOUNTS.map((a) => (
          <button
            key={a.email}
            onClick={() => logInAs(a.email)}
            disabled={!!loadingEmail}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--surface-border)",
              cursor: loadingEmail ? "not-allowed" : "pointer",
              textAlign: "left",
              opacity: loadingEmail && loadingEmail !== a.email ? 0.4 : 1,
            }}
          >
            <div
              className="flex items-center justify-center shrink-0 text-white"
              style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary)", fontSize: 14, fontWeight: 700 }}
            >
              {a.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {a.name}
              </div>
              <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                {a.role.replace("_", " ")}
              </div>
            </div>
            <span
              className="text-[10px] font-semibold uppercase px-2 py-1 rounded-full"
              style={{ background: "var(--primary-light)", color: "var(--primary)" }}
            >
              {a.family}
            </span>
          </button>
        ))}
      </div>

      <a href="/login" className="mt-6 block text-center text-sm font-semibold no-underline hover:underline" style={{ color: "var(--primary)" }}>
        Back to standard login
      </a>
    </div>
  );
}