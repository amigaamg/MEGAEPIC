'use client';

import { useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, Calendar, Clock, Users, Pill, FlaskConical, Scan, FileText, LogOut, Activity, Bell, TrendingUp, BarChart3, UserCog, Settings, Menu, ChevronRight, CheckCircle, XCircle, PlusCircle, UserPlus, Mail, type LucideIcon } from 'lucide-react';
import { resolveWorkspaceGate } from '@/lib/amexan/workspace/WorkspaceResolutionEngine';
import { resolveFamily, familyRedirect } from '@/lib/amexan/workspace/WorkspaceGuard';
import OrganizationSetupWizard from '@/components/workspace/OrganizationSetupWizard';
import WorkspaceGuard from '@/components/workspace/WorkspaceGuard';

// Book XV WS-016: the /dashboard resolver page may render for the clinical,
// nursing, pharmacy, laboratory, radiology, department, research, teaching,
// finance, HR and ICT families. The executive family never renders this page —
// it is hard-redirected to the Facility Administration Command Center (WS-014).
const SupportedRoles = [
  'clinical_leadership', 'department', 'clinical', 'nursing', 'pharmacy',
  'laboratory', 'radiology', 'finance', 'hr', 'ict', 'research', 'teaching',
  'telemedicine', 'community_health', 'patient',
] as const;

const C = {
  navy: 'var(--sky-800)',
  sky: 'var(--primary)',
  skyLight: 'var(--sky-50)',
  skySoft: 'var(--sky-400)',
  white: 'var(--surface-card)',
  panel: 'var(--surface-elevated)',
  border: 'var(--surface-border)',
  text: 'var(--text-primary)',
  textLight: 'var(--text-muted)',
  green: 'var(--green)',
  amber: 'var(--amber)',
  red: 'var(--red)',
  purple: 'var(--purple)',
};

const S = {
  page: { minHeight: '100vh', background: C.panel, fontFamily: "'Inter', 'Noto Sans', system-ui, sans-serif", color: C.text, display: 'flex', flexDirection: 'column' as const },
  topBar: { height: 64, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 },
  logoText: { fontSize: 14, fontWeight: 700, color: C.navy },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  main: { flex: 1, overflow: 'auto', padding: 24 },
  card: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
  badge: (c: string) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: `${c}15`, color: c }),
  btn: (c: string) => ({ padding: '8px 16px', borderRadius: 8, border: 'none', background: c, color: C.white, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }),
  btnO: { padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  navItem: (a: boolean) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: a ? 600 : 400, color: a ? C.sky : C.text, background: a ? C.skyLight : 'transparent', cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left' as const }),
};

const ICONS: Record<string, LucideIcon> = { Pill, FlaskConical, Scan, FileText, LogOut, Activity, Calendar, Users, Bell, TrendingUp, BarChart3, UserCog, Settings, AlertTriangle, ArrowRight, Clock, CheckCircle, XCircle, PlusCircle, UserPlus, ChevronRight, Menu };

export default function DashboardPage() {
  return (
    <WorkspaceGuard supportedRoles={SupportedRoles} allowUnknown>
      <DashboardPageInner />
    </WorkspaceGuard>
  );
}

function DashboardPageInner() {
  const { session, dashboard, loading, user, logout, needsToCompleteRegistration, needsEmailVerification, workspace, registrationStep, workspaceChoice, switchOrganization } = useAuth();
  const router = useRouter();

  // CR-WS-001: the completeness gate is authoritative. It decides whether a
  // dashboard may render ('ready'), the actor must choose a workspace
  // ('choose_workspace'), or onboarding must resume ('onboarding').
  const gate = useMemo(
    () => resolveWorkspaceGate(workspace, { registrationStep, workspaceChoice }),
    [workspace, registrationStep, workspaceChoice]
  );

  // Constitutional rule (Book XV): authentication must NEVER depend on
  // onboarding. The dashboard is always the destination after login. When the
  // workspace is incomplete, an inline Organization Setup Wizard is rendered in
  // place of the dashboard content — we never redirect back to registration
  // (which caused the login → registration redirect loop).
  const requiresSetup = !loading && gate.type === 'onboarding' && needsToCompleteRegistration;

  // Admins are never on a clinical duty rota, so the "(Off Duty)" suffix is
  // misleading for them. The command center communicates status via its widgets.
  const isAdministrativeRole = ['facility_admin', 'super_admin'].includes(
    session.professional?.primaryCategory || ''
  );

  // Facility/executive administrators land on the real-time COO Command
  // Center (Book V), never the clinician workspace or the legacy mock panel.
  useEffect(() => {
    if (!loading && isAdministrativeRole && user) {
      router.replace('/facility-admin');
    }
  }, [loading, isAdministrativeRole, user, router]);

  // WS-016: When the workspace is ready and the guard has allowed rendering,
  // redirect the actor to their family-specific dashboard (cos-* pages). The
  // generic /dashboard page is only a routing hub — it must never render as the
  // final destination for a non-administrative family.
  useEffect(() => {
    if (loading || isAdministrativeRole) return;
    if (!user) return;
    if (gate.type !== 'ready') return;
    const category = session?.professional?.primaryCategory ?? null;
    const roleName = session?.role?.name ?? null;
    const family = resolveFamily(category, roleName);
    if (family && family !== 'executive') {
      router.replace(familyRedirect(family));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAdministrativeRole, user, session, gate.type, router]);

  // Email verification is a banner, never a gate. We surface it inline.

  const activeSection = useMemo(() => {
    if (!dashboard || dashboard.sections.length === 0) return null;
    return dashboard.sections.reduce((a, b) => a.priority < b.priority ? a : b);
  }, [dashboard]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.panel, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={32} color={C.sky} style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ marginTop: 12, fontSize: 13, color: C.textLight }}>Loading AMEXAN...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.panel, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.navy }}>Not signed in</p>
          <button onClick={() => router.push('/login')} style={{ marginTop: 12, ...S.btn(C.sky) }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Book XV WS-009: multiple memberships, none active — present "Choose Workspace"
  // instead of a dashboard. Never fabricate a default workspace.
  if (gate.type === 'choose_workspace') {
    return (
      <div style={S.page}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>
        <div style={{ maxWidth: 520, width: '100%', margin: 'auto', padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={S.logoText}>AMEXAN</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 8px' }}>Choose your workspace</h1>
          <p style={{ fontSize: 13, color: C.textLight, margin: '0 0 24px', lineHeight: 1.6 }}>
            You are a member of one or more organizations. Select one to open its workspace dashboard. You can switch anytime without signing in again (WS-010).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(workspace?.memberships || []).map(m => (
              <button
                key={m.id || m.organizationId}
                onClick={async () => {
                  await switchOrganization(m.organizationId);
                  router.push('/dashboard');
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                  padding: '16px 18px', borderRadius: 12,
                  background: C.white, border: `1px solid ${C.border}`,
                  cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: C.skyLight, color: C.sky,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700,
                }}>
                  {(m.organizationName || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{m.organizationName}</div>
                  {m.roleName && (
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{m.roleName}</div>
                  )}
                </div>
                <ChevronRight size={16} color={C.textLight} />
              </button>
            ))}
            {(!workspace?.memberships || workspace.memberships.length === 0) && (
              <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: C.textLight }}>
                No memberships found. Please contact your organization admin.
              </div>
            )}
          </div>
          <button
            onClick={() => router.push('/register/constitution')}
            style={{ marginTop: 20, width: '100%', ...S.btnO }}
          >
            <ArrowRight size={14} />
            Set up a new workspace
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard && requiresSetup) {
    return (
      <div style={S.page}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>
        <div style={{ minHeight: '100vh', padding: '48px 24px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, justifyContent: 'center' }}>
            <span style={S.logoText}>AMEXAN</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, textAlign: 'center', margin: '0 0 4px' }}>
            Welcome{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.
          </h1>
          <p style={{ fontSize: 13, color: C.textLight, textAlign: 'center', margin: '0 0 28px', lineHeight: 1.6 }}>
            Let&apos;s set up your organization. Estimated time: <strong>5 minutes</strong>.
          </p>
          <OrganizationSetupWizard />
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  function Icon({ name, size = 14 }: { name: string; size?: number }) {
    const I = ICONS[name];
    return I ? <I size={size} /> : <Activity size={size} />;
  }

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Top Bar */}
      <div style={S.topBar}>
        <span style={S.logoText}>AMEXAN</span>
        <span style={{ fontSize: 10, color: C.textLight, background: C.panel, padding: '2px 8px', borderRadius: 4 }}>{dashboard.title}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: C.textLight }}>{user?.email}</span>
          <button onClick={logout} style={S.btnO}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Email Verification Banner — never blocks, always visible until verified */}
      {needsEmailVerification && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 24px', background: `${C.amber}12`, borderBottom: `1px solid ${C.amber}30`,
          fontSize: 12, color: C.text,
        }}>
          <Mail size={15} color={C.amber} />
          <span style={{ flex: 1 }}>
            <strong>Verify your email.</strong> We sent a verification link to <strong>{user?.email}</strong>. Verification only unlocks advanced capabilities — you can keep using AMEXAN while it&apos;s pending.
          </span>
          <button
            onClick={async () => {
              const { sendEmailVerification } = await import('firebase/auth');
              if (user) { await sendEmailVerification(user).catch(() => {}); alert('Verification email sent.'); }
            }}
            style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: C.amber, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          >
            Resend Email
          </button>
        </div>
      )}

      <div style={S.body}>
        {/* Left Nav */}
        <div style={{ width: 220, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '12px 8px', gap: 1, flexShrink: 0, overflow: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px 8px' }}>
            {session.professional?.primaryCategory === 'medical_doctor' ? 'Clinician' :
             session.professional?.primaryCategory === 'nurse' ? 'Nursing' :
             session.professional?.primaryCategory === 'facility_admin' ? 'Administration' :
             session.professional?.primaryCategory === 'pharmacist' ? 'Pharmacy' :
             session.professional?.primaryCategory === 'lab_technologist' ? 'Laboratory' : 'Workspace'}
          </div>
          {dashboard.sections.map(section => (
            <button key={section.id} style={S.navItem(activeSection?.id === section.id)}>
              {section.type === 'tasks' ? <Clipboard size={14} /> :
               section.type === 'patients' ? <Users size={14} /> :
               section.type === 'alerts' ? <Bell size={14} /> :
               section.type === 'schedule' ? <Calendar size={14} /> :
               <Activity size={14} />}
              {section.title.length > 22 ? section.title.slice(0, 22) + '...' : section.title}
              {section.items.filter(i => i.status === 'urgent' || i.status === 'critical').length > 0 && (
                <span style={{ marginLeft: 'auto', background: C.red, color: C.white, borderRadius: 10, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>
                  {section.items.filter(i => i.status === 'urgent' || i.status === 'critical').length}
                </span>
              )}
            </button>
          ))}

          {/* Workspace Links */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 0', marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px 8px' }}>
              Workspace
            </div>
            {dashboard.workspaceLinks.map(link => (
              <button key={link.id} onClick={() => router.push(link.href)} style={S.navItem(false)}>
                <div style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={link.icon} size={14} />
                </div>
                {link.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Quick Actions */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px 8px' }}>
              Quick Actions
            </div>
            {dashboard.quickActions.map(action => (
              <button key={action.id} onClick={() => router.push(action.link)} style={S.btnO}>
                <div style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={action.icon} size={14} />
                </div>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={S.main}>
          {/* Greeting */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: 0 }}>{dashboard.greeting}</h1>
            <p style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>
              {session.currentOrganization ? `Workspace: ${session.currentOrganization.name}` : 'Individual Practice'}
              {session.currentDepartment ? ` — ${session.currentDepartment.name}` : ''}
              {isAdministrativeRole ? '' : session.onDuty ? '' : ' (Off Duty)'}
            </p>
          </div>

          {/* Command Center Metrics — the presentation engine's live status strip */}
          {(dashboard.widgets ?? []).length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
              {(dashboard.widgets ?? []).filter(w => w.type === 'metric').map(w => {
                const cfg = w.config || {};
                const val = String(cfg.value ?? '—');
                const subtitle = cfg.subtitle ? String(cfg.subtitle) : undefined;
                const isOk = cfg.status !== 'warning' && cfg.status !== 'error';
                return (
                  <div key={w.id} style={{ ...S.card, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {w.title}
                      </span>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOk ? C.green : C.amber }} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, lineHeight: 1 }}>
                      {val}
                    </div>
                    {subtitle && (
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>{subtitle}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {dashboard.sections.map(section => (
              <div key={section.id} style={S.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {section.type === 'tasks' ? <Clipboard size={16} color={C.sky} /> :
                     section.type === 'patients' ? <Users size={16} color={C.sky} /> :
                     section.type === 'alerts' ? <Bell size={16} color={C.amber} /> :
                     section.type === 'schedule' ? <Calendar size={16} color={C.sky} /> :
                     <Activity size={16} color={C.sky} />}
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{section.title}</span>
                    {section.items.filter(i => i.status === 'critical').length > 0 && (
                      <span style={{ background: C.red, color: C.white, borderRadius: 10, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
                        CRITICAL
                      </span>
                    )}
                  </div>
                  {section.items.length > 3 && (
                    <button style={{ ...S.btnO }} onClick={() => router.push(`/${section.id}`)}>
                      View All <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                {section.items.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: C.textLight }}>
                    <Activity size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    {section.emptyMessage || 'Nothing here right now.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {section.items.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        onClick={() => item.link && router.push(item.link)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 8,
                          background: item.status === 'critical' ? `${C.red}05` :
                                     item.status === 'urgent' ? `${C.amber}05` : C.panel,
                          cursor: item.link ? 'pointer' : 'default',
                          border: item.status === 'critical' ? `1px solid ${C.red}20` :
                                  item.status === 'urgent' ? `1px solid ${C.amber}20` : 'none',
                        }}
                      >
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: item.status === 'critical' ? C.red :
                                      item.status === 'urgent' ? C.amber :
                                      item.status === 'active' ? C.green : C.textLight,
                          flexShrink: 0,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{item.title}</div>
                          {item.subtitle && (
                            <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>{item.subtitle}</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {item.patientName && (
                            <span style={S.badge(C.sky)}>{item.patientName}</span>
                          )}
                          {item.time && (
                            <span style={{ fontSize: 10, color: C.textLight, whiteSpace: 'nowrap' }}>
                              <Clock size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                              {item.time}
                            </span>
                          )}
                          {item.link && <ChevronRight size={14} color={C.textLight} />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline clipboard icon since it's not a named icon in older lucide
function Clipboard({ size = 16, color = '#64748B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}
