"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { getVerificationState, syncEmailVerification } from "@/lib/firebase/verificationService";
import { getVerificationLevelLabel, getVerificationRequirements, type VerificationLevel } from "@/lib/amexan/constitution/verification";
import { C } from "@/lib/colors";

const S = {
  page: { minHeight: '100vh', background: C.white, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '40px 16px' },
  card: { width: '100%', maxWidth: 520, background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' },
  title: { fontSize: 24, fontWeight: 700, color: C.navy, marginBottom: 8, textAlign: 'center' as const },
  subtitle: { fontSize: 14, color: C.textLight, textAlign: 'center' as const, marginBottom: 28 },
  ladder: { display: 'flex', flexDirection: 'column' as const, gap: 12, marginBottom: 28 },
  rung: (achieved: boolean, current: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
    background: achieved ? `${C.sky}10` : current ? `${C.sky}05` : C.panel,
    border: achieved ? `2px solid ${C.sky}` : current ? `2px dashed ${C.sky}` : `1px solid ${C.border}`,
    borderRadius: 12,
    transition: 'all 0.2s',
  }),
  rungIcon: (achieved: boolean, current: boolean) => ({
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: achieved ? C.sky : current ? C.skyLight : C.border,
    color: achieved ? C.white : current ? C.sky : C.textLight,
    fontSize: 16, fontWeight: 600, flexShrink: 0,
  }),
  rungContent: { flex: 1, minWidth: 0 },
  rungLabel: (achieved: boolean) => ({ fontSize: 14, fontWeight: achieved ? 600 : 500, color: achieved ? C.navy : C.text, whiteSpace: 'nowrap' as const }),
  rungDesc: { fontSize: 12, color: C.textLight, marginTop: 2 },
  rungReqs: { marginTop: 8, display: 'flex', flexDirection: 'column' as const, gap: 4 },
  reqItem: { fontSize: 11, color: C.textLight, display: 'flex', alignItems: 'center', gap: 6 },
  emailSection: { marginBottom: 24, padding: 20, background: C.skyLight, border: `1px solid ${C.sky}30`, borderRadius: 12 },
  emailTitle: { fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 8 },
  emailDesc: { fontSize: 12, color: C.textLight, marginBottom: 16 },
  btn: (primary = true) => ({
    padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: primary ? C.sky : 'transparent', color: primary ? C.white : C.sky,
    border: primary ? 'none' : `1px solid ${C.sky}`, cursor: 'pointer', width: '100%',
    transition: 'all 0.15s',
  }),
  statusMsg: (error: boolean) => ({ fontSize: 12, color: error ? C.red : C.green, marginTop: 12, textAlign: 'center' as const }),
  backLink: { marginTop: 24, textAlign: 'center' as const, fontSize: 13, color: C.sky, cursor: 'pointer' },
};

function getNextLevel(vState: any): number | null {
  for (let i = vState.currentLevel + 1; i <= 5; i++) {
    if (!vState.levels[i]?.achieved) return i
  }
  return null
}

const LEVELS: VerificationLevel[] = [0, 1, 2, 3, 4, 5];

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${C.sky}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, activeOrganizationId } = useAuth();
  const [vState, setVState] = useState<import("@/lib/amexan/constitution/verification").VerificationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    async function load() {
      if (!user || !session.identity?.uid) {
        setLoading(false);
        return;
      }
      const amxUid = session.identity.uid as string;
      try {
        const state = await getVerificationState(amxUid);
        setVState(state);

        const synced = await syncEmailVerification(amxUid, { emailVerified: user.emailVerified, email: user.email || '' });
        if (synced) setVState(synced);
      } catch (e) {
        console.error('Failed to load verification state', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, session.identity?.uid]);

  const handleSendEmailVerification = async () => {
    if (!user) return;
    setSending(true);
    setMsg(null);
    try {
      await sendEmailVerification(user);
      setMsg({ text: 'Verification email sent. Check your inbox.', error: false });
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to send verification email', error: true });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={S.page}>
        <div style={{ width: 40, height: 40, border: `3px solid ${C.sky}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!vState) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={S.title}>Verification Status</div>
          <div style={S.subtitle}>Unable to load verification state. Please try again.</div>
          <button style={S.btn()} onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.title}>Identity Verification</div>
        <div style={S.subtitle}>
          Your current level: <strong>{getVerificationLevelLabel(vState.currentLevel)}</strong> —
          {vState.currentLevel >= 5 ? 'Maximum trust achieved' : `Next: ${getVerificationLevelLabel((getNextLevel(vState) || vState.currentLevel) as VerificationLevel)}`}
        </div>

        <div style={S.ladder}>
          {LEVELS.map((level) => {
            const info = vState.levels[level];
            const achieved = info?.achieved ?? false;
            const current = level === vState.currentLevel;
            return (
              <div key={level} style={S.rung(achieved, current)}>
                <div style={S.rungIcon(achieved, current)}>
                  {achieved ? '✓' : level}
                </div>
                <div style={S.rungContent}>
                  <div style={S.rungLabel(achieved)}>{getVerificationLevelLabel(level)}</div>
                  <div style={S.rungDesc}>
                    {achieved ? `Verified ${info.achievedAt ? new Date(info.achievedAt).toLocaleDateString() : ''}` :
                      current ? 'In progress' : 'Not started'}
                  </div>
                  <div style={S.rungReqs}>
                    {getVerificationRequirements(level).map((req, i) => (
                      <div key={i} style={S.reqItem}>
                        <span>{achieved ? '✓' : '○'}</span>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {user && !user.emailVerified && (
          <div style={S.emailSection}>
            <div style={S.emailTitle}>📧 Email Verification Required</div>
            <div style={S.emailDesc}>
              Your email address has not been verified. Please verify your email to unlock Level 1 (Email Verified)
              and access clinical features.
            </div>
            <button style={S.btn()} onClick={handleSendEmailVerification} disabled={sending}>
              {sending ? 'Sending…' : 'Send Verification Email'}
            </button>
            {msg && <div style={S.statusMsg(msg.error)}>{msg.text}</div>}
          </div>
        )}

        {user && user.emailVerified && vState.currentLevel < 1 && (
          <div style={{ ...S.emailSection, background: `${C.green}10`, borderColor: `${C.green}30` }}>
            <div style={{ ...S.emailTitle, color: C.green }}>✓ Email Verified</div>
            <div style={S.emailDesc}>
              Your email is verified. The system will automatically upgrade you to Level 1 on next refresh.
            </div>
            <button style={{ ...S.btn(), background: C.green }} onClick={() => window.location.reload()}>
              Refresh Verification Status
            </button>
          </div>
        )}

        <div style={S.backLink} onClick={() => router.push(searchParams?.get('next') || '/dashboard')}>
          ← Continue to Dashboard
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}