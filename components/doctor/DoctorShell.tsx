'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  AmxDoctorTheme,
  DOCTOR_THEMES,
  DOCTOR_THEME_LIST,
  getStoredTheme,
  applyDoctorTheme,
} from '@/lib/doctor-theme';

export interface TabDefinition {
  id: string;
  icon: string;
  label: string;
  badge?: number;
}

export interface DoctorProfile {
  uid: string; name: string; email: string; specialty: string;
  clinic?: string; licenseNumber?: string; phone?: string; bio?: string;
  yearsExperience?: number; languages?: string[]; location?: string;
  photoURL?: string; rating?: number;
}

export interface DoctorShellProps {
  doctor: DoctorProfile;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: TabDefinition[];
  appointments: any[];
  activeAppts: any[];
  upcomingAppts: any[];
  children: React.ReactNode;
  topBarExtra?: React.ReactNode;
}

async function getDoctorFromFirestore(uid: string): Promise<Partial<DoctorProfile>> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.data() || {};
  } catch {
    return {};
  }
}

function ThemeSwitcher({ mini = false }: { mini?: boolean }) {
  const [current, setCurrent] = useState<AmxDoctorTheme>(getStoredTheme());
  const [open, setOpen] = useState(false);

  const switchTheme = useCallback((t: AmxDoctorTheme) => {
    applyDoctorTheme(t);
    setCurrent(t);
    setOpen(false);
  }, []);

  if (mini) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginRight: 4 }}>Theme</span>
        {DOCTOR_THEME_LIST.slice(0, 4).map(t => (
          <button
            key={t.id}
            onClick={() => switchTheme(t.id)}
            title={t.label}
            style={{
              width: current === t.id ? 20 : 14,
              height: current === t.id ? 20 : 14,
              borderRadius: '50%',
              border: current === t.id ? '2px solid var(--text)' : '1px solid var(--border)',
              background: DOCTOR_THEMES[t.id].css.match(/--accent:([^;]+)/)?.[1] || '#6366F1',
              cursor: 'pointer',
              transition: 'all .18s ease',
              padding: 0,
              boxShadow: current === t.id ? '0 0 0 2px var(--accent-dim)' : 'none',
            }}
          />
        ))}
      </div>
    );
  }

  const accent = DOCTOR_THEMES[current].css.match(/--accent:([^;]+)/)?.[1] || '#0F766E';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: '1.5px solid var(--border)',
          background: 'var(--surface)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, transition: 'all .18s',
          fontFamily: 'var(--font)',
        }}
        title="Switch Theme"
      >
        {DOCTOR_THEMES[current].icon}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14, padding: 10,
            boxShadow: 'var(--shadow-lg)',
            minWidth: 240,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', padding: '4px 8px 8px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
              Choose Theme
            </div>
            {DOCTOR_THEME_LIST.map(t => {
              const tAccent = DOCTOR_THEMES[t.id].css.match(/--accent:([^;]+)/)?.[1] || '#6366F1';
              const isActive = current === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => switchTheme(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 10,
                    border: isActive ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                    background: isActive ? 'var(--accent-dim)' : 'transparent',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                    fontFamily: 'var(--font)',
                    transition: 'all .14s',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: tAccent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, flexShrink: 0,
                  }}>
                    {t.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{t.id === current ? 'Active' : 'Click to apply'}</div>
                  </div>
                  {isActive && <span style={{ color: 'var(--accent)', fontSize: 16 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile('matches' in e ? e.matches : window.innerWidth <= 768);
    handler(mq);
    mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
  }, []);
  return isMobile;
}

export default function DoctorShell({
  doctor,
  activeTab,
  onTabChange,
  tabs,
  appointments,
  activeAppts,
  upcomingAppts,
  children,
  topBarExtra,
}: DoctorShellProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close sidebar on mobile when tab changes
  const handleTabChange = useCallback((tabId: string) => {
    onTabChange(tabId);
    if (isMobile) setSidebarOpen(false);
  }, [onTabChange, isMobile]);

  // Close sidebar on resize from mobile to desktop
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
    router.replace('/login');
  }, [router]);

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const busyCount = activeAppts.length + upcomingAppts.length;
  const firstTab = tabs.find(t => t.id === activeTab);

  const MOBILE_BREAK = 768;
  const SIDEBAR_WIDTH = 236;

  const sidebarContent = (
    <>
      <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-3))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 14px var(--accent-glow)',
          }}>⚕️</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.4px', color: 'var(--text)' }}>AMEXAN</div>
            <div style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase' }}>Doctor Portal</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-3))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 19, color: '#fff', marginBottom: 8,
        }}>{doctor.name[0]}</div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{doctor.name}</div>
        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginTop: 1 }}>{doctor.specialty || 'Specialist'}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doctor.email}</div>
      </div>

      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 11px', borderRadius: 10,
              border: 'none', background: activeTab === t.id ? 'var(--accent-dim)' : 'transparent',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text-2)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font)', width: '100%', textAlign: 'left',
              transition: 'all .14s', position: 'relative',
            }}
            onMouseEnter={e => { if (activeTab !== t.id) { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}}
            onMouseLeave={e => { if (activeTab !== t.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>{t.icon}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</span>
            {t.badge !== undefined && t.badge > 0 && (
              <span style={{
                marginLeft: 'auto', background: 'var(--red)', color: '#fff',
                borderRadius: 99, fontSize: 10, fontWeight: 700,
                padding: '1px 6px', minWidth: 18, textAlign: 'center',
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div style={{ padding: '8px 8px', borderTop: '1px solid var(--border)' }}>
        <ThemeSwitcher mini />
        <button onClick={handleSignOut} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '9px 11px', background: 'transparent',
          border: '1px solid var(--border)', borderRadius: 10,
          color: 'var(--muted)', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--font)',
          transition: 'all .14s', marginTop: 4,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent'; }}
        ><span>🚪</span> Sign Out</button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ─── DESKTOP SIDEBAR ─── */}
      {!isMobile && (
        <aside style={{
          width: sidebarOpen ? SIDEBAR_WIDTH : 0,
          minWidth: sidebarOpen ? SIDEBAR_WIDTH : 0,
          overflow: 'hidden',
          transition: 'width 0.3s ease, min-width 0.3s ease',
          flexShrink: 0,
          background: 'var(--sidebar-bg)',
          borderRight: sidebarOpen ? '1px solid var(--sidebar-border)' : 'none',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh',
          zIndex: 30,
        }}>
          {sidebarContent}
        </aside>
      )}

      {/* ─── MOBILE SIDEBAR OVERLAY ─── */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 40, backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }} />
      )}

      {isMobile && (
        <aside style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_WIDTH,
          background: 'var(--sidebar-bg)', zIndex: 50,
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--sidebar-border)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setSidebarOpen(false)} style={{
              background: 'var(--bg)', border: 'none', color: 'var(--text-2)',
              width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
          {sidebarContent}
        </aside>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: '100%' }}>
        {/* Top Bar */}
        <header style={{
          background: 'var(--header-bg)',
          borderBottom: `1px solid var(--border)`,
          padding: isMobile ? '8px 12px' : '10px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 20,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'box-shadow .3s',
          boxShadow: scrolled ? 'var(--shadow-md)' : 'var(--shadow)',
          flexShrink: 0,
          gap: isMobile ? 6 : 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, minWidth: 0 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: isMobile ? 20 : 22, color: 'var(--text)',
                padding: '4px 6px', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, lineHeight: 1,
              }}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >{sidebarOpen ? '✕' : '☰'}</button>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {!isMobile && (
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{getGreeting()},</span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: isMobile ? 14 : 18,
                  fontWeight: 800, letterSpacing: '-.3px', color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: isMobile ? 120 : 'none',
                }}>
                  Dr. {doctor.name.split(' ')[0]}
                </span>
                {firstTab && !isMobile && (
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>
                    · {firstTab.icon} {firstTab.label}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 4 : 8, alignItems: 'center', flexShrink: 0 }}>
            {busyCount > 0 && !isMobile && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 700, color: 'var(--green)',
                background: 'var(--green-dim)', padding: '6px 12px', borderRadius: 99,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--green)', display: 'inline-block',
                  animation: 'pulse-g 1.5s infinite',
                }} />
                {activeAppts.length} · {upcomingAppts.length}
              </span>
            )}
            {busyCount > 0 && isMobile && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'var(--green)',
                background: 'var(--green-dim)', padding: '4px 8px', borderRadius: 99,
              }}>
                {activeAppts.length + upcomingAppts.length}
              </span>
            )}
            {topBarExtra}
            <ThemeSwitcher />
          </div>
        </header>

        {/* Content Area */}
        <main style={{
          flex: 1,
          padding: isMobile ? '12px 12px 80px' : '20px 24px 40px',
          overflowY: 'auto',
          maxWidth: sidebarOpen && !isMobile ? 1400 : '100%',
          width: '100%',
          margin: sidebarOpen && !isMobile ? '0 auto' : 0,
          animation: 'fadeUp .22s ease',
          boxSizing: 'border-box',
        }}>
          {children}
        </main>
      </div>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="doctor-mobile-bottom-nav" style={{
        display: 'flex',
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--sidebar-bg)',
        borderTop: '1px solid var(--border)',
        padding: '4px 0 env(safe-area-inset-bottom, 4px)',
        zIndex: 40,
        boxShadow: '0 -4px 20px rgba(0,0,0,.06)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {tabs.filter(t => ['overview', 'queue', 'patients', 'clinical_docs', 'messages', 'referrals', 'tools', 'settings'].includes(t.id)).map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            style={{
              flex: '1 0 auto',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              padding: '4px 6px', minWidth: 56,
              background: 'transparent', border: 'none',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--muted)',
              fontSize: 9, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font)',
              transition: 'all .14s',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 56 }}>{t.label}</span>
            {t.badge !== undefined && t.badge > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: '50%',
                transform: 'translateX(calc(50% + 10px))',
                background: 'var(--red)', color: '#fff',
                borderRadius: 99, fontSize: 8, fontWeight: 700,
                padding: '1px 4px', minWidth: 14, textAlign: 'center',
                lineHeight: 1.3,
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <style>{`
        @media (min-width: 769px) {
          .doctor-mobile-bottom-nav { display: none !important; }
        }
        @media (max-width: 768px) {
          .doctor-mobile-bottom-nav { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

export { ThemeSwitcher };
