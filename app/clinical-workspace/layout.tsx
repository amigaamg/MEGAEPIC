'use client';
import { useState, useMemo, useCallback } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';

type DepartmentKey = keyof typeof DEPARTMENTS;

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', href: '' },
  { icon: '🏥', label: 'Departments', href: '/departments' },
  { icon: '🩺', label: 'Encounters', href: '/encounters' },
  { icon: '👤', label: 'Patient Records', href: '/patient-records' },
  { icon: '🛤️', label: 'Pathways', href: '/pathways' },
  { icon: '📈', label: 'Analytics', href: '/analytics' },
  { icon: '⚙️', label: 'Settings', href: '/settings' },
];

export default function ClinicalWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const hospitalId = params?.hospitalId as string || 'default';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href?: string }[] = [];
    let cum = '';
    for (const seg of segments) {
      cum += '/' + seg;
      if (seg === hospitalId) { crumbs.push({ label: hospitalId === 'default' ? 'Hospital' : hospitalId, href: `/clinical-workspace/${hospitalId}` }); }
      else if (seg === 'clinical-workspace') continue;
      else if (seg === 'departments') crumbs.push({ label: 'Departments', href: `/clinical-workspace/${hospitalId}/departments` });
      else if (DEPARTMENTS[seg.toUpperCase() as DepartmentKey]) {
        const dept = DEPARTMENTS[seg.toUpperCase() as DepartmentKey];
        crumbs.push({ label: dept?.label || seg, href: cum });
      } else {
        crumbs.push({ label: seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), href: cum });
      }
    }
    return crumbs;
  }, [pathname, hospitalId]);

  const isActive = useCallback((href: string) => {
    if (href === '') return pathname === `/clinical-workspace/${hospitalId}`;
    return pathname.startsWith(`/clinical-workspace/${hospitalId}${href}`);
  }, [pathname, hospitalId]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(180deg, #071029, #0b1230, #12193a)' }}>
      <nav className="sidebar" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', marginBottom: 8 }}>
          <Link href={`/clinical-workspace/${hospitalId}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#06B6D4' }}>A</span>MEXAN
            </div>
            <div style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap' }}>Clinical Intelligence</div>
          </Link>
        </div>

        {NAV_ITEMS.map(item => (
          <Link
            key={item.label}
            href={`/clinical-workspace/${hospitalId}${item.href}`}
            className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--glass-border)' }}>
          <div className="sidebar-item" onClick={() => router.push('/')}>
            <span className="sidebar-icon">←</span>
            <span>Exit</span>
          </div>
        </div>
      </nav>

      <div style={{ marginLeft: 'var(--sidebar-collapsed)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header className="command-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', position: 'sticky', top: 0, zIndex: 40 }}>
          <div className="flex items-center gap-3 overflow-hidden">
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1.5 text-xs" style={{ overflow: 'hidden' }}>
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-1.5" style={{ whiteSpace: 'nowrap' }}>
                    {i > 0 && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    )}
                    {crumb.href && i < breadcrumbs.length - 1 ? (
                      <Link href={crumb.href} className="text-[#64748B] hover:text-[#94A3B8] transition-colors no-underline">{crumb.label}</Link>
                    ) : (
                      <span className={i === breadcrumbs.length - 1 ? 'text-[#E2E8F0] font-medium' : 'text-[#64748B]'}>{crumb.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 10, color: '#475569' }}>AMEXAN v1.0</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
