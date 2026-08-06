'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { resolveFamily, familyRedirect, type WorkspaceFamily } from '@/lib/amexan/workspace/WorkspaceGuard';
import { resolveWorkspaceGate } from '@/lib/amexan/workspace/WorkspaceResolutionEngine';
import { Activity } from 'lucide-react';

export default function WorkspaceRouter() {
  const { session, user, loading, needsToCompleteRegistration, workspace, registrationStep, workspaceChoice, switchOrganization } = useAuth();
  const router = useRouter();

  const category = session?.professional?.primaryCategory ?? null;
  const roleName = session?.role?.name ?? null;
  const family: WorkspaceFamily | null = useMemo(() => resolveFamily(category, roleName), [category, roleName]);

  const gate = useMemo(
    () => resolveWorkspaceGate(workspace, { registrationStep, workspaceChoice }),
    [workspace, registrationStep, workspaceChoice]
  );

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    // Constitutional completeness gate (Book XV, CR-WS-001):
    //   ready          → route to the family dashboard
    //   choose_workspace → present workspace picker (handled in /dashboard)
    //   onboarding      → resume guided registration
    if (gate.type === 'onboarding') {
      router.replace('/register/constitution');
      return;
    }

    if (gate.type === 'choose_workspace' && !needsToCompleteRegistration) {
      router.replace('/dashboard');
      return;
    }

    // Executive family always lands in the Facility Administration Command Center.
    // Every other family lands on its real dashboards — never the legacy gate.
    router.replace(family ? familyRedirect(family) : '/dashboard');
  }, [loading, user, family, gate, needsToCompleteRegistration, router]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-elevated)', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--text-muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <Activity size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ marginTop: 12, fontSize: 13 }}>Loading your workspace…</p>
      </div>
    </div>
  );
}
