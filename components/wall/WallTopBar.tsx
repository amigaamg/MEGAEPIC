'use client';
// components/wall/WallTopBar.tsx

import { useState } from 'react';
import { WallDoctor } from '@/components/PatientWallPage';

interface Props { doctor: WallDoctor; patientName: string; }

export default function WallTopBar({ doctor, patientName }: Props) {
  const [search, setSearch] = useState('');

  const initials = doctor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={s.bar}>
      {/* Logo */}
      <div style={s.logo}>
        <span style={s.logoA}>amex</span><span style={s.logoB}>an</span>
        <span style={s.logoTag}>Clinical OS</span>
      </div>

      {/* Breadcrumb */}
      <div style={s.breadcrumb}>
        <span style={s.bc}>Patients</span>
        <span style={s.bcSep}>›</span>
        <span style={s.bcActive}>{patientName}</span>
        <span style={s.bcSep}>›</span>
        <span style={s.bcPage}>Clinical Wall</span>
      </div>

      {/* Search */}
      <div style={s.searchWrap}>
        <svg style={s.searchIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="6.5" cy="6.5" r="4" /><line x1="10" y1="10" x2="14" y2="14" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patients, labs, notes…"
          style={s.searchInput}
        />
        {search && (
          <button onClick={() => setSearch('')} style={s.clearBtn}>✕</button>
        )}
      </div>

      {/* Right actions */}
      <div style={s.rightGroup}>
        <IconBtn title="Notifications" badge>
          <BellIcon />
        </IconBtn>
        <IconBtn title="Print / Export">
          <PrintIcon />
        </IconBtn>
        <IconBtn title="Settings">
          <GearIcon />
        </IconBtn>
        <div style={s.doctorChip}>
          <div style={s.doctorAv}>{initials}</div>
          <div style={s.doctorInfo}>
            <div style={s.doctorName}>Dr. {doctor.name.split(' ').pop()}</div>
            <div style={s.doctorSpec}>{doctor.specialty || 'Doctor'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, title, badge }: { children: React.ReactNode; title: string; badge?: boolean }) {
  return (
    <button title={title} style={s.iconBtn}>
      {children}
      {badge && <span style={s.badgeDot} />}
    </button>
  );
}

const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M8 2a5 5 0 00-5 5v3l-1.5 1.5h13L13 10V7a5 5 0 00-5-5z" />
    <path d="M6.5 13.5a1.5 1.5 0 003 0" />
  </svg>
);
const PrintIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <rect x="3" y="6" width="10" height="7" rx="1" />
    <path d="M5 6V3h6v3" />
    <line x1="5" y1="10" x2="11" y2="10" />
    <line x1="5" y1="12" x2="9" y2="12" />
  </svg>
);
const GearIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.9 11.9l1.06 1.06M3.05 12.95l1.06-1.06M11.9 4.1l1.06-1.06" />
  </svg>
);

const s: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '0 20px', height: 52,
    background: '#fff', borderBottom: '1px solid #e8eef5',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 1px 0 rgba(0,0,0,.04)',
  },
  logo: { display: 'flex', alignItems: 'baseline', gap: 3, flexShrink: 0 },
  logoA: { fontSize: 17, fontWeight: 800, color: '#0d1b2a', letterSpacing: -.5 },
  logoB: { fontSize: 17, fontWeight: 300, color: '#0aaa76', letterSpacing: -.5 },
  logoTag: { fontSize: 9, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .8, marginLeft: 6, fontWeight: 600 },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 },
  bc: { fontSize: 12, color: '#8fa3bd', cursor: 'pointer' },
  bcSep: { fontSize: 11, color: '#c4d0de' },
  bcActive: { fontSize: 12, color: '#4a5568', fontWeight: 600 },
  bcPage: { fontSize: 12, color: '#0aaa76', fontWeight: 700 },
  searchWrap: { flex: 1, maxWidth: 340, position: 'relative' as const, display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute' as const, left: 10, width: 13, height: 13, color: '#8fa3bd', pointerEvents: 'none' },
  searchInput: {
    width: '100%', padding: '7px 30px 7px 30px',
    border: '1.5px solid #e8eef5', borderRadius: 10,
    fontSize: 12, outline: 'none', background: '#f8fafc',
    color: '#0d1b2a',
  },
  clearBtn: { position: 'absolute' as const, right: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#8fa3bd', padding: 0 },
  rightGroup: { display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' },
  iconBtn: {
    width: 32, height: 32, border: '1.5px solid #e8eef5',
    borderRadius: 9, background: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#64748b', position: 'relative' as const,
  },
  badgeDot: {
    position: 'absolute' as const, top: 5, right: 5,
    width: 6, height: 6, borderRadius: '50%',
    background: '#ef4444', border: '1.5px solid #fff',
  },
  doctorChip: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: '#f8fafc', border: '1.5px solid #e8eef5', borderRadius: 10 },
  doctorAv: { width: 26, height: 26, borderRadius: '50%', background: '#e0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#0aaa76', flexShrink: 0 },
  doctorInfo: {},
  doctorName: { fontSize: 11, fontWeight: 700, color: '#0d1b2a' },
  doctorSpec: { fontSize: 9, color: '#8fa3bd', marginTop: 1 },
};