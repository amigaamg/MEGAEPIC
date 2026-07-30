'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Activity, Cpu, Building2, Scale, BookOpen, Workflow, Radio, Shield,
  ChevronRight, Menu, X, AlertTriangle, LayoutDashboard,
  Lock, Brain, Microscope, GraduationCap, ShoppingBag, Globe, Headphones,
  BarChart3, Layers
} from 'lucide-react';
import './_shared/responsive.css';

const C = {
  sky: '#2F80ED', skySoft: '#60a5fa', skyLight: 'rgba(47, 128, 237, 0.1)',
  white: '#fff', panel: 'rgba(15, 23, 42, 0.95)', border: 'rgba(148, 163, 184, 0.15)',
  navy: '#1e3a5f', text: '#e2e8f0', textLight: '#94a3b8', textMuted: '#64748b',
  green: '#22c55e', amber: '#f59e0b', red: '#ef4444',
};

type NavItem = { section: true; label: string } | { id: string; label: string; icon: React.ComponentType<{ size?: number }>; path: string };

const NAV_ITEMS: NavItem[] = [
  { section: true, label: 'Core Operations (L0-L6)' },
  { id: 'dashboard', label: 'Dashboard', icon: Activity, path: '/operations' },
  { id: 'engines', label: 'Engines', icon: Cpu, path: '/operations/engines' },
  { id: 'divisions', label: 'Divisions', icon: Building2, path: '/operations/divisions' },
  { id: 'rules', label: 'Rules', icon: Scale, path: '/operations/rules' },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen, path: '/operations/knowledge' },
  { id: 'workflows', label: 'Workflows', icon: Workflow, path: '/operations/workflows' },
  { id: 'telemetry', label: 'Telemetry', icon: Radio, path: '/operations/telemetry' },
  { id: 'constitution', label: 'Council', icon: Shield, path: '/operations/constitution' },
  { section: true, label: 'Advanced Operations (L7-L15)' },
  { id: 'security', label: 'Security', icon: Lock, path: '/operations/security' },
  { id: 'ai', label: 'AI Operations', icon: Brain, path: '/operations/ai' },
  { id: 'research', label: 'Research', icon: Microscope, path: '/operations/research' },
  { id: 'education', label: 'Education', icon: GraduationCap, path: '/operations/education' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/operations/marketplace' },
  { id: 'global', label: 'Global Monitor', icon: Globe, path: '/operations/global' },
  { id: 'success', label: 'Customer Success', icon: Headphones, path: '/operations/success' },
  { id: 'business', label: 'Business Ops', icon: BarChart3, path: '/operations/business' },
  { id: 'meta', label: 'Meta-Operations', icon: Layers, path: '/operations/meta' },
];

function useMediaQuery(q: string): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    setMatch(mq.matches);
    const listener = (e: MediaQueryListEvent) => setMatch(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [q]);
  return match;
}

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentId = NAV_ITEMS.find(i => 'path' in i && i.path === pathname)?.id || 'dashboard';
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [pathname, isMobile]);

  const sidebarWidth = isMobile ? '100%' : isTablet ? 56 : 220;

  const sidebarContent = (
    <>
      {NAV_ITEMS.map((item, idx) => {
        if ('section' in item && item.section) {
          if (isTablet && !isMobile) return null;
          return (
            <div key={`s-${idx}`} style={{
              padding: isMobile ? '16px 16px 4px' : '16px 16px 4px',
              fontSize: 8, fontWeight: 600, color: '#475569',
              letterSpacing: '1px', textTransform: 'uppercase' as const,
              marginTop: idx > 0 ? 8 : 0,
            }}>
              {isMobile ? '' : item.label}
            </div>
          );
        }
        if (!('icon' in item)) return null;
        const Icon = item.icon;
        const active = currentId === item.id;
        return (
          <a key={item.id} href={item.path}
            onClick={() => { if (isMobile) setMobileOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: isTablet && !isMobile ? 'center' : 'flex-start',
              gap: 10, padding: isTablet && !isMobile ? '12px 0' : '8px 16px',
              fontSize: isTablet && !isMobile ? 0 : 12, fontWeight: active ? 600 : 400,
              color: active ? '#60a5fa' : '#94a3b8',
              background: active ? 'rgba(47, 128, 237, 0.1)' : 'transparent',
              cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
              borderRight: active ? '2px solid #2F80ED' : '2px solid transparent',
              transition: 'all 0.15s', textDecoration: 'none',
              minHeight: 44, touchAction: 'manipulation',
            }}>
            <Icon size={16} style={{ flexShrink: 0 }} />
            {(!isTablet || isMobile) && item.label}
          </a>
        );
      })}
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', fontFamily: "'Inter', system-ui, sans-serif", color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 640px) {
          .agoc-sidebar-overlay { display: block !important; }
        }
        @media (min-width: 641px) {
          .agoc-sidebar-overlay { display: none !important; }
        }
      `}</style>

      <div style={{
        height: 52, background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center',
        padding: '0 clamp(8px, 2vw, 20px)', gap: 8,
        flexShrink: 0, backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 8, display: 'flex', minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation' }}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #2F80ED, #1a5bbf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>AG</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 'clamp(12px, 1.8vw, 15px)', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isMobile ? 'AGOC' : 'AMEXAN Global Operations Center'}
            </div>
            <div style={{ fontSize: 'clamp(8px, 0.9vw, 10px)', color: '#64748b', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isMobile ? 'Book XXIV' : 'Operating Intelligence · Book XXIV'}
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: 'clamp(9px, 1vw, 11px)' }}>
          {!isMobile && <span style={{ color: '#64748b' }}>{(NAV_ITEMS.find(i => 'id' in i && i.id === currentId) as any)?.label}</span>}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {(mobileOpen || !isMobile) && (
          <>
            {isMobile && mobileOpen && (
              <div className="agoc-sidebar-overlay"
                onClick={() => setMobileOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }} />
            )}
            <div style={{
              width: sidebarWidth,
              minWidth: sidebarWidth,
              background: 'rgba(15, 23, 42, 0.6)',
              borderRight: `1px solid rgba(148, 163, 184, 0.1)`,
              display: 'flex', flexDirection: 'column',
              padding: isMobile ? '60px 0 12px' : '12px 0',
              gap: 2, overflow: 'auto', flexShrink: 0,
              transition: 'width 0.2s',
              position: isMobile ? 'fixed' : 'relative',
              left: 0, top: isMobile ? 0 : 'auto', bottom: isMobile ? 0 : 'auto',
              zIndex: isMobile ? 50 : 'auto',
              WebkitOverflowScrolling: 'touch',
            }}>
              {sidebarContent}
            </div>
          </>
        )}

        <main style={{
          flex: 1, overflow: 'auto', padding: 'clamp(12px, 2vw, 24px)',
          background: 'rgba(10, 14, 26, 0.8)',
          WebkitOverflowScrolling: 'touch',
        }}>
          {children}
        </main>
      </div>

      <div style={{
        height: 28, background: 'rgba(15, 23, 42, 0.8)',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center',
        padding: '0 clamp(8px, 2vw, 16px)', gap: 'clamp(8px, 1.5vw, 16px)',
        fontSize: 'clamp(8px, 0.9vw, 10px)', color: '#64748b',
        flexShrink: 0, flexWrap: 'wrap' as const,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          AGOC Online
        </span>
        {!isMobile && <span>Book XXIV · Five Fundamental Laws</span>}
        <span style={{ marginLeft: 'auto', display: isMobile ? 'none' : 'inline' }}>
          AMEXAN v1.0.0 · Operating Intelligence
        </span>
      </div>
    </div>
  );
}