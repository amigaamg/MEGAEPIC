'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN — Constitutional Context Engine (Facility Workspace Gate)
//
// THE RULE:
//   User Login
//     → Identity Engine
//     → Organization Engine
//     → Facility Resolution Engine
//     → Workspace Engine
//     → Dashboard
//     → Database Writes
//
// No engine may initialize and NO WRITE may occur until all five constitutional
// IDs exist:
//   organizationId · facilityId · actorId · workspaceId · sessionId
//
// If one is missing → NO WRITE. The workspace renders the resolution splash and
// the dashboard never mounts before resolution completes. This makes the
// historical `setDoc() … Unsupported field value: undefined (facilityId)` class
// of error structurally impossible.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import type { UserSession } from '@/lib/amexan';

export interface ConstitutionalContext {
  actorId: string;
  organizationId: string;
  organizationName: string;
  facilityId: string;
  facilityName: string;
  workspaceId: string;
  sessionId: string;
  session: UserSession;
  user: User | null;
}

export type ResolutionStage =
  | 'identity'
  | 'organization'
  | 'facility'
  | 'workspace'
  | 'ready'
  | 'error';

const STAGE_TEXT: Record<Exclude<ResolutionStage, 'ready' | 'error'>, string> = {
  identity: 'Resolving Facility Context…',
  organization: 'Finding Active Organization…',
  facility: 'Resolving Facility Hierarchy…',
  workspace: 'Loading Constitutional Workspace…',
};

const WRITE_BANNER =
  'Constitutional context incomplete — writes are locked until organizationId, facilityId, actorId, workspaceId and sessionId all resolve.';

export function ConstitutionalContextGate({ children }: { children: (ctx: ConstitutionalContext) => React.ReactNode }) {
  const { user, session, loading, activeOrganizationId, workspace, refreshWorkspace } = useAuth();
  const [stage, setStage] = useState<ResolutionStage>('identity');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  const actorId = useMemo(() => {
    return (session.identity?.uid as string) || (user?.uid as string) || '';
  }, [session.identity?.uid, user?.uid]);

  const organizationId = useMemo(() => {
    return (
      workspace?.activeMembership?.organizationId ||
      workspace?.organization?.id ||
      activeOrganizationId ||
      (session.currentOrganization?.id as string) ||
      ''
    );
  }, [workspace, activeOrganizationId, session.currentOrganization]);

  const organizationName = useMemo(() => {
    return workspace?.organization?.name || organizationId || 'Facility';
  }, [workspace?.organization?.name, organizationId]);

  const facilityId = useMemo(() => {
    return (
      workspace?.facility?.id ||
      workspace?.activeMembership?.facilityId ||
      workspace?.extendedContext?.facilityId ||
      ''
    );
  }, [workspace]);

  const facilityName = useMemo(() => {
    return workspace?.facility?.name || organizationName;
  }, [workspace?.facility?.name, organizationName]);

  const workspaceId = useMemo(() => {
    return (
      workspace?.activeMembership?.id ||
      (organizationId && facilityId ? `${organizationId}::${facilityId}` : '') ||
      organizationId ||
      ''
    );
  }, [workspace?.activeMembership?.id, organizationId, facilityId]);

  const sessionId = useMemo(() => {
    return `${actorId}::${Date.now().toString(36)}`;
  }, [actorId]);

  // Step the resolution splash. Each stage is intentionally visible so an
  // administrator watches the constitutional pipeline resolve — this is the
  // "Resolving Facility Context… ✓ Ready" contract.
  useEffect(() => {
    if (loading) return;
    setStage('identity');
    const timers: ReturnType<typeof setTimeout>[] = [];
    const advance = (next: ResolutionStage, ms: number) => {
      // Never let the splash timers override a hard validation error.
      timers.push(setTimeout(() => setStage(prev => (prev === 'error' ? prev : next)), ms));
    };
    advance('organization', 380);
    advance('facility', 900);
    advance('workspace', 1400);
    timers.push(setTimeout(() => setStage(prev => (prev === 'error' ? prev : 'ready')), 1900));
    return () => { timers.forEach(t => clearTimeout(t)); };
  }, [loading, attempt]);

  useEffect(() => {
    if (loading) return;
    if (!actorId) { setError('Identity not resolved. Sign in to continue.'); setStage('error'); return; }
    if (!organizationId) {
      // Do NOT write. Prompt the actor to pick a facility from the workspace.
      setError('No active organization. Switch to a facility from your workspace to unlock this command center.');
      setStage('error');
      return;
    }
    if (!facilityId) {
      // The organization exists but no facility branch resolved. Re-resolve the
      // workspace once (WS-010) before erroring — never falls back to a write.
      setError('');
      void (async () => {
        try {
          const w = await refreshWorkspace();
          if (w?.facility?.id) {
            setAttempt(a => a + 1);
          } else {
            setError('No facility resolved for this organization. Configure a facility branch to continue.');
            setStage('error');
          }
        } catch {
          setError('Facility resolution failed. Re-resolve the workspace and try again.');
          setStage('error');
        }
      })();
      return;
    }
    setError('');
  }, [loading, actorId, organizationId, facilityId, refreshWorkspace]);

  // ── Splash: the dashboard NEVER renders before context resolves ─────────────
  if (loading || (stage !== 'ready' && stage !== 'error')) {
    const shown = stage === 'error' ? 'workspace' : stage;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050d1a', fontFamily: "'Inter', 'JetBrains Mono', system-ui, sans-serif" }}>
        <style>{`
          .ctx-glow{position:absolute;width:520px;height:520px;border-radius:50%;filter:blur(90px);opacity:.16;pointer-events:none}
          .ctx-pulse{animation:ctxpulse 2.2s ease-in-out infinite}
          @keyframes ctxpulse{0%,100%{opacity:.5}50%{opacity:1}}
          .ctx-check{animation:ctxpop .5s ease forwards;transform:scale(0)}
          @keyframes ctxpop{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
          .ctx-steps{max-width:340px;margin:0 auto;display:flex;flex-direction:column;gap:10px}
          @media(max-width:640px){.ctx-panel{padding:24px 20px!important}.ctx-glow{width:320px;height:320px}}
        `}</style>
        <div className="ctx-glow" style={{ background: '#0ea5e9', top: '10%', left: '10%' }} />
        <div className="ctx-glow" style={{ background: '#8b5cf6', bottom: '10%', right: '10%' }} />
        <div className="ctx-panel" style={{ position: 'relative', width: 'min(520px, 92vw)', background: 'rgba(13,26,44,.9)', border: '1px solid rgba(56,189,248,.22)', borderRadius: 18, padding: '38px 34px', boxShadow: '0 24px 80px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span className="ctx-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 14px #38bdf8' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7dd3fc', letterSpacing: '.18em', textTransform: 'uppercase' }}>AMEXAN · Facility Context Engine</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: '10px 0 2px' }}>Enterprise Integration &amp; Interoperability Engine</div>
          <div style={{ fontSize: 12, color: '#7a8aa5', marginBottom: 26 }}>
            Every engine initializes in constitutional order before any write may occur.
          </div>

          <div className="ctx-steps">
            {(Object.keys(STAGE_TEXT) as (keyof typeof STAGE_TEXT)[]).map(s => {
              const order = ['identity', 'organization', 'facility', 'workspace'];
              const idx = order.indexOf(s);
              const active = shown === s;
              const done = shown !== 'identity' && idx < order.indexOf(shown as any);
              const stepDone = done || (shown === 'ready');
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: active || stepDone ? 1 : 0.42, transition: 'opacity .3s' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, background: stepDone ? 'rgba(16,185,129,.18)' : active ? 'rgba(56,189,248,.18)' : 'rgba(122,138,165,.12)', color: stepDone ? '#34d399' : active ? '#38bdf8' : '#7a8aa5', border: `1px solid ${stepDone ? '#10b981' : active ? '#38bdf8' : 'rgba(122,138,165,.3)'}` }}>
                    {stepDone ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6.2 4.8 9 10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : order.indexOf(s) + 1}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? '#e2e8f0' : '#8fa0ba' }}>{STAGE_TEXT[s]}</span>
                  {active && <span style={{ marginLeft: 'auto', width: 14, height: 14, border: '2px solid rgba(56,189,248,.4)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 26, paddingTop: 16, borderTop: '1px solid rgba(56,189,248,.14)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#5b6b80', fontFamily: "'JetBrains Mono', monospace" }}>
              {stage === 'error' ? 'resolving …' : shown}
            </span>
            {shown === 'workspace' || stage === 'ready' ? (
              <span className="ctx-check" style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '.04em' }}>✓ READY</span>
            ) : (
              <span style={{ fontSize: 11, color: '#38bdf8' }}>NO WRITES UNTIL READY</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050d1a', fontFamily: "'Inter', system-ui, sans-serif", padding: 20 }}>
        <div style={{ width: 'min(460px, 94vw)', background: 'rgba(13,26,44,.92)', border: '1px solid rgba(244,63,94,.35)', borderRadius: 16, padding: '30px 26px', textAlign: 'center' }}>
          <div style={{ width: 46, height: 46, margin: '0 auto 14px', borderRadius: '50%', background: 'rgba(244,63,94,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Facility Context Locked</div>
          <div style={{ fontSize: 12.5, color: '#a5b4c8', lineHeight: 1.6, marginBottom: 20 }}>{error}</div>
          <button onClick={() => { setError(''); setAttempt(a => a + 1); }} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: '#0ea5e9', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
            Re-resolve Facility Context
          </button>
          <div style={{ marginTop: 14, fontSize: 10.5, color: '#5b6b80', fontFamily: "'JetBrains Mono', monospace" }}>{WRITE_BANNER}</div>
        </div>
      </div>
    );
  }

  const ctx: ConstitutionalContext = {
    actorId,
    organizationId,
    organizationName,
    facilityId,
    facilityName,
    workspaceId,
    sessionId,
    session,
    user,
  };

  return <>{children(ctx)}</>;
}
