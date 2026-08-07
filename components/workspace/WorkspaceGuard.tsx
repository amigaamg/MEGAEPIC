'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Guard (Book XV, WS-011..WS-016) — React binding.
//
// Wrap any dashboard/workspace page with this guard. The page declares
// `SupportedRoles`, and the guard hard-redirects on a role-family mismatch
// before the page body renders. A mismatch is a WorkspaceMismatchError: logged,
// never rendered.
//
//   const SupportedRoles = ['executive'] as const;
//   export default function Page() {
//     return <WorkspaceGuard supportedRoles={SupportedRoles}>…</WorkspaceGuard>;
//   }
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Activity } from 'lucide-react';
import {
  WorkspaceMismatchError,
  resolveFamily,
  familyRedirect,
  type SupportedRoles,
} from '@/lib/amexan/workspace/WorkspaceGuard';

const PAD = { display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa', fontFamily: "'Inter', system-ui, sans-serif" };

export default function WorkspaceGuard({
  supportedRoles,
  children,
  allowUnknown = false,
}: {
  supportedRoles: SupportedRoles;
  children: React.ReactNode;
  /** Allow the page to render for an unclassifiable role family (null). Only the
   *  /dashboard hub uses this — every specialized dashboard treats null as a hard
   *  mismatch (WS-016) and redirects. Prevents the null-family redirect loop. */
  allowUnknown?: boolean;
}) {
  const { session, user, loading } = useAuth();
  const router = useRouter();

  const category = session?.professional?.primaryCategory ?? null;
  const roleName = session?.role?.name ?? null;

  const family = useMemo(() => resolveFamily(category, roleName), [category, roleName]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    // WS-012/WS-014/WS-015/WS-016: mismatch is a hard error — log and redirect,
    // never continue rendering. A null family is a mismatch on every page EXCEPT
    // the /dashboard hub (allowUnknown), otherwise the guard would redirect into
    // itself forever.
    const allowed = (family !== null && supportedRoles.includes(family)) || (allowUnknown && family === null);
    if (!allowed) {
      const err = new WorkspaceMismatchError(category ?? 'unknown', family, supportedRoles);
      console.error('[WorkspaceGuard]', err.message);
      router.replace(family ? familyRedirect(family) : '/dashboard');
    }
  }, [loading, user, family, category, supportedRoles, allowUnknown, router]);

  if (loading) {
    return (
      <div style={PAD}>
        <div style={{ textAlign: 'center', color: '#5b6b80', fontSize: 13 }}>
          <Activity size={28} color="#0ea5e9" style={{ animation: 'wspin 1s linear infinite' }} />
          <style>{`@keyframes wspin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ marginTop: 10 }}>Resolving workspace…</p>
        </div>
      </div>
    );
  }

  const allowed = (family !== null && supportedRoles.includes(family)) || (allowUnknown && family === null);
  if (!user || !allowed) return null;

  return <>{children}</>;
}

export { WorkspaceMismatchError, resolveFamily, familyRedirect };
export type { SupportedRoles };