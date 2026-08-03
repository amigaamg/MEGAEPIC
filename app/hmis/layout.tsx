'use client';
import { useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, IdCard, RefreshCw, CheckCircle, Bell, ClipboardList, BarChart3, Wrench, Pill, Microscope, Radio, Building, DollarSign, Calendar, Send, Globe, FileText, Link as LinkIcon, WifiOff, Zap, TrendingUp, ArrowLeft } from "lucide-react";

const HMIS_BOOKS = [
  { icon: <Building2 size={14} />, label: 'Hospital Model', href: '/hmis/hospital', book: 'I' },
  { icon: <Users size={14} />, label: 'User Model', href: '/hmis/users', book: 'II' },
  { icon: <IdCard size={14} />, label: 'Identity', href: '/hmis/identity', book: 'III' },
  { icon: <RefreshCw size={14} />, label: 'Encounters', href: '/hmis/encounters', book: 'IV' },
  { icon: <CheckCircle size={14} />, label: 'Task Engine', href: '/hmis/tasks', book: 'V' },
  { icon: <Bell size={14} />, label: 'Notifications', href: '/hmis/notifications', book: 'VI' },
  { icon: <ClipboardList size={14} />, label: 'Orders', href: '/hmis/orders', book: 'VII' },
  { icon: <BarChart3 size={14} />, label: 'Results', href: '/hmis/results', book: 'VIII' },
  { icon: <Wrench size={14} />, label: 'Resources', href: '/hmis/resources', book: 'IX' },
  { icon: <Pill size={14} />, label: 'Pharmacy', href: '/hmis/pharmacy', book: 'X' },
  { icon: <Microscope size={14} />, label: 'Laboratory', href: '/hmis/laboratory', book: 'XI' },
  { icon: <Radio size={14} />, label: 'Radiology', href: '/hmis/radiology', book: 'XII' },
  { icon: <Building size={14} />, label: 'Theatre', href: '/hmis/theatre', book: 'XIII' },
  { icon: <DollarSign size={14} />, label: 'Billing', href: '/hmis/billing', book: 'XV' },
  { icon: <Calendar size={14} />, label: 'Scheduling', href: '/hmis/scheduling', book: 'XVI' },
  { icon: <Send size={14} />, label: 'Referrals', href: '/hmis/referrals', book: 'XVII' },
  { icon: <Globe size={14} />, label: 'Public Health', href: '/hmis/public-health', book: 'XVIII' },
  { icon: <Microscope size={14} />, label: 'Research', href: '/hmis/research', book: 'XIX' },
  { icon: <FileText size={14} />, label: 'Audit', href: '/hmis/audit', book: 'XX' },
  { icon: <LinkIcon size={14} />, label: 'Integration', href: '/hmis/integration', book: 'XXI' },
  { icon: <WifiOff size={14} />, label: 'Offline', href: '/hmis/offline', book: 'XXII' },
  { icon: <Zap size={14} />, label: 'Event Bus', href: '/hmis/events', book: 'XXIII' },
  { icon: <TrendingUp size={14} />, label: 'Analytics', href: '/hmis/analytics', book: 'XXIV' },
];

export default function HMISLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href?: string }[] = [{ label: 'HMIS', href: '/hmis' }];
    let cum = '/hmis';
    for (let i = 1; i < segments.length; i++) {
      cum += '/' + segments[i];
      const book = HMIS_BOOKS.find(b => b.href === cum);
      crumbs.push({ label: book?.label || segments[i].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), href: i < segments.length - 1 ? cum : undefined });
    }
    return crumbs;
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(180deg, #071029, #0b1230, #12193a)' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 220, zIndex: 50, background: 'rgba(7,16,41,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '0 0 20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
          <Link href="/hmis" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#06B6D4' }}>A</span>MEXAN
            </div>
            <div style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap' }}>HMIS Console</div>
          </Link>
        </div>
        {HMIS_BOOKS.map(item => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 20px',
              color: isActive(item.href) ? '#06B6D4' : '#94A3B8', fontSize: 13,
              textDecoration: 'none', transition: 'all 0.15s',
              background: isActive(item.href) ? 'rgba(6,182,212,0.08)' : 'transparent',
              borderRight: isActive(item.href) ? '2px solid #06B6D4' : '2px solid transparent',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            <span style={{ width: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'inherit' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: 9, color: '#475569', fontFamily: "'Syne',sans-serif" }}>{item.book}</span>
          </Link>
        ))}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}>
          <div
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748B', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
          >
            <span style={{ display: 'inline-flex' }}><ArrowLeft size={14} /></span><span>Exit</span>
          </div>
        </div>
      </nav>
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 48, position: 'sticky', top: 0, zIndex: 40, background: 'rgba(7,16,41,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <nav className="flex items-center gap-1.5 text-xs" style={{ overflow: 'hidden' }}>
            {breadcrumbs.map((crumb, i) => (
              <div key={i} className="flex items-center gap-1.5" style={{ whiteSpace: 'nowrap' }}>
                {i > 0 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
                {crumb.href && i < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} style={{ color: '#64748B', textDecoration: 'none' }}>{crumb.label}</Link>
                ) : (
                  <span style={{ color: i === breadcrumbs.length - 1 ? '#E2E8F0' : '#64748B', fontWeight: i === breadcrumbs.length - 1 ? 500 : 400 }}>{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
          <span style={{ fontSize: 10, color: '#475569' }}>AMEXAN HMIS v1.0</span>
        </header>
        <main style={{ flex: 1, padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}
