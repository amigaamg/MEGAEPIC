'use client';

import React, { useState, useMemo, useCallback } from 'react';

interface PatientEntry {
  uid: string; fullName: string; age?: number; sex?: string;
  createdAt?: any; origin?: string; activeDockets?: string[];
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical'; status?: string;
  lastReview?: any; conditions?: string[]; phone?: string; email?: string;
  bloodGroup?: string; allergies?: string[]; assignedTeam?: string;
}

interface Props {
  patients: PatientEntry[];
  dockets: { id: string; name: string }[];
  onSelectPatient: (patient: PatientEntry) => void;
  onAssignDocket: (patientId: string, docketId: string) => void;
  loading?: boolean;
}

type SortKey = 'fullName' | 'age' | 'riskLevel' | 'status' | 'origin';
type SortDir = 'asc' | 'desc';

const RISK_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1, undefined: 0 };
const RISK_COLORS = {
  Critical: { text: '#dc2626', bg: 'rgba(220,38,38,.12)' },
  High: { text: '#ea580c', bg: 'rgba(234,88,12,.12)' },
  Medium: { text: '#ca8a04', bg: 'rgba(202,138,4,.12)' },
  Low: { text: '#16a34a', bg: 'rgba(22,163,74,.12)' },
};
const STATUS_COLORS: Record<string, string> = {
  Active: '#16a34a', Inactive: '#94a3b8', Archived: '#94a3b8',
  Admitted: '#6366f1', Pending: '#ca8a04',
};

export default function PatientRegistryTable({ patients, dockets, onSelectPatient, onAssignDocket, loading }: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('fullName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [docketFilter, setDocketFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortKey(k); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = [...patients];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.fullName?.toLowerCase().includes(q) ||
        p.conditions?.some(c => c.toLowerCase().includes(q)) ||
        p.phone?.includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.uid?.toLowerCase().includes(q)
      );
    }
    if (riskFilter !== 'all') list = list.filter(p => (p.riskLevel || 'Low') === riskFilter);
    if (statusFilter !== 'all') list = list.filter(p => (p.status || 'Active') === statusFilter);
    if (docketFilter !== 'all') list = list.filter(p => p.activeDockets?.includes(docketFilter));

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'fullName') cmp = (a.fullName || '').localeCompare(b.fullName || '');
      else if (sortKey === 'age') cmp = (a.age || 0) - (b.age || 0);
      else if (sortKey === 'riskLevel') cmp = (RISK_ORDER[a.riskLevel || ''] || 0) - (RISK_ORDER[b.riskLevel || ''] || 0);
      else if (sortKey === 'status') cmp = (a.status || '').localeCompare(b.status || '');
      else if (sortKey === 'origin') cmp = (a.origin || '').localeCompare(b.origin || '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [patients, search, sortKey, sortDir, riskFilter, statusFilter, docketFilter]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const sortArrow = (k: SortKey) => sortKey === k ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  const tableCell = { padding: '10px 12px', fontSize: 12, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' as const };
  const tableCellWrap = { ...tableCell, whiteSpace: 'normal' as const, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' };
  const headerCell = { ...tableCell, fontWeight: 800, fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: 0.8, color: 'var(--muted)', cursor: 'pointer', userSelect: 'none' as const, position: 'sticky' as const, top: 0, background: 'var(--surface)', zIndex: 2 };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading patient registry...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, pointerEvents: 'none', opacity: 0.5 }}>🔍</span>
          <input className="search-inp" style={{ paddingLeft: 34, fontSize: 13 }} value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search name, condition, ID, phone…" />
        </div>
        <select className="filter-chip" value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setPage(0); }}
          style={{ fontSize: 11, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
          <option value="all">All Risk Levels</option>
          <option value="Critical">🔴 Critical</option>
          <option value="High">🟠 High</option>
          <option value="Medium">🟡 Medium</option>
          <option value="Low">🟢 Low</option>
        </select>
        <select className="filter-chip" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          style={{ fontSize: 11, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Admitted">Admitted</option>
          <option value="Pending">Pending</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select className="filter-chip" value={docketFilter} onChange={e => { setDocketFilter(e.target.value); setPage(0); }}
          style={{ fontSize: 11, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
          <option value="all">All Dockets</option>
          {dockets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>{filtered.length} patients</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={headerCell} onClick={() => toggleSort('fullName')}>Patient{sortArrow('fullName')}</th>
              <th style={{ ...headerCell, cursor: 'default' }}>Demographics</th>
              <th style={{ ...headerCell, cursor: 'default' }}>Active Dockets</th>
              <th style={headerCell} onClick={() => toggleSort('riskLevel')}>Risk{sortArrow('riskLevel')}</th>
              <th style={headerCell} onClick={() => toggleSort('status')}>Status{sortArrow('status')}</th>
              <th style={{ ...headerCell, cursor: 'default' }}>Last Review</th>
              <th style={{ ...headerCell, cursor: 'default' }}>Alerts</th>
              <th style={{ ...headerCell, cursor: 'default' }}>Team</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No patients match your criteria.</td></tr>
            ) : paged.map(p => {
              const rc = RISK_COLORS[p.riskLevel || 'Low'] || RISK_COLORS.Low;
              const sc = STATUS_COLORS[p.status || 'Active'] || '#94a3b8';
              const lastReview = p.lastReview?.toDate ? p.lastReview.toDate() : p.lastReview ? new Date(p.lastReview) : null;
              const alertCount = p.riskLevel === 'Critical' ? 2 : p.riskLevel === 'High' ? 1 : 0;
              return (
                <tr key={p.uid} onClick={() => onSelectPatient(p)}
                  style={{ cursor: 'pointer', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="pc-ava" style={{ width: 32, height: 32, fontSize: 13 }}>{(p.fullName||'?')[0]}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{p.fullName}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{p.uid?.slice(0, 8)}…</div>
                      </div>
                    </div>
                  </td>
                  <td style={tableCell}>
                    <div style={{ fontSize: 12 }}>{[p.age && `${p.age}y`, p.sex].filter(Boolean).join(', ')}</div>
                    {p.origin && <div style={{ fontSize: 10, color: 'var(--muted)' }}>📋 {p.origin}</div>}
                  </td>
                  <td style={{ ...tableCell, maxWidth: 180 }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(p.activeDockets?.length ? p.activeDockets : ['—']).map((d, i) => (
                        <span key={i} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600 }}>{d}</span>
                      ))}
                    </div>
                  </td>
                  <td style={tableCell}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: rc.bg, color: rc.text }}>
                      {p.riskLevel === 'Critical' ? '🔴' : p.riskLevel === 'High' ? '🟠' : p.riskLevel === 'Medium' ? '🟡' : '🟢'} {p.riskLevel || 'Low'}
                    </span>
                  </td>
                  <td style={tableCell}>
                    <span style={{ color: sc, fontWeight: 700, fontSize: 12 }}>● {p.status || 'Active'}</span>
                  </td>
                  <td style={tableCell}>
                    <div style={{ fontSize: 12, fontFamily: 'var(--mono)' }}>{lastReview ? lastReview.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : '—'}</div>
                  </td>
                  <td style={tableCell}>
                    {alertCount > 0 ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: 'rgba(220,38,38,.1)', color: '#dc2626', fontSize: 11, fontWeight: 700 }}>
                        ⚠ {alertCount} alert{alertCount !== 1 ? 's' : ''}
                      </span>
                    ) : <span style={{ color: 'var(--muted)', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={tableCell}>
                    <div style={{ fontSize: 12 }}>{p.assignedTeam || '—'}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center' }}>
          <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: 11, width: 'auto' }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
            Page {page + 1} of {totalPages} ({filtered.length} patients)
          </span>
          <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: 11, width: 'auto' }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
