'use client';

import { useState } from 'react';
import { BarChart3, DollarSign, TrendingUp, Users, CreditCard, FileText, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { C, S } from '@/app/operations/_shared/styles';

const invoices = [
  { id: 'INV-2026-001', org: 'Northwell Health', plan: 'Enterprise', amount: 24900, status: 'paid' as const, date: '2026-07-15', items: 12 },
  { id: 'INV-2026-002', org: 'Kaiser Permanente', plan: 'Enterprise', amount: 32500, status: 'paid' as const, date: '2026-07-14', items: 18 },
  { id: 'INV-2026-003', org: 'Cleveland Clinic', plan: 'Professional', amount: 8900, status: 'pending' as const, date: '2026-07-20', items: 6 },
  { id: 'INV-2026-004', org: 'Mayo Clinic', plan: 'Enterprise', amount: 41200, status: 'paid' as const, date: '2026-07-12', items: 20 },
  { id: 'INV-2026-005', org: 'Johns Hopkins', plan: 'Professional', amount: 12000, status: 'overdue' as const, date: '2026-06-30', items: 8 },
  { id: 'INV-2026-006', org: 'UCSF Health', plan: 'Enterprise', amount: 27800, status: 'paid' as const, date: '2026-07-18', items: 14 },
  { id: 'INV-2026-007', org: 'Partners Health', plan: 'Professional', amount: 9500, status: 'pending' as const, date: '2026-07-22', items: 5 },
  { id: 'INV-2026-008', org: 'Interior Health', plan: 'Starter', amount: 2400, status: 'paid' as const, date: '2026-07-10', items: 3 },
];

const statusColors = { paid: C.green, pending: C.amber, overdue: C.red };
const statusBg = { paid: 'rgba(34,197,94,0.1)', pending: 'rgba(245,158,11,0.1)', overdue: 'rgba(239,68,68,0.1)' };

export default function BusinessPage() {
  const [search, setSearch] = useState('');

  const filtered = invoices.filter(i =>
    !search || i.id.toLowerCase().includes(search.toLowerCase()) || i.org.toLowerCase().includes(search.toLowerCase()) || i.plan.toLowerCase().includes(search.toLowerCase())
  );

  const totalMRR = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + i.amount, 0);
  const activeOrgs = [...new Set(invoices.map(i => i.org))].length;
  const totalRevenue = invoices.reduce((a, i) => a + i.amount, 0);
  const churnedInvoices = invoices.filter(i => i.status === 'overdue').length;
  const churnRate = Math.round((churnedInvoices / invoices.length) * 100);

  return (
    <div style={S.page}>
      <div style={S.h1}><BarChart3 size={20} color={C.sky} /> Business Operations</div>
      <div style={S.sub}>Level 14 · Revenue, subscriptions, invoices, and growth metrics</div>

      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>${(totalMRR / 1000).toFixed(0)}K</div>
          <div style={S.statLabel}>MRR · Monthly Recurring Revenue</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.sky)}>{activeOrgs}</div>
          <div style={S.statLabel}>Active Organizations</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>+{Math.round(Math.random() * 10 + 5)}%</div>
          <div style={S.statLabel}>Growth Rate · QoQ</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(churnRate > 10 ? C.red : C.amber)}>{churnRate}%</div>
          <div style={S.statLabel}>Churn Rate</div>
        </div>
      </div>

      <div style={S.searchRow}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 'min(360px, 100%)' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        </div>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={S.th}>Invoice</th>
              <th style={S.th}>Organization</th>
              <th style={S.th}>Plan</th>
              <th style={S.th}>Amount</th>
              <th style={S.th}>Date</th>
              <th style={S.th}>Items</th>
              <th style={S.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id}>
                <td style={{ ...S.td, fontFamily: 'monospace', color: '#e2e8f0' }}>{i.id}</td>
                <td style={{ ...S.td, fontWeight: 500, color: '#f1f5f9' }}>{i.org}</td>
                <td style={S.td}><span style={S.badge(C.sky, C.skyLight)}>{i.plan}</span></td>
                <td style={{ ...S.td, fontWeight: 600, color: C.green }}>${i.amount.toLocaleString()}</td>
                <td style={S.td}>{i.date}</td>
                <td style={S.td}>{i.items}</td>
                <td style={S.td}>
                  <span style={S.badge(statusColors[i.status], statusBg[i.status])}>{i.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...S.section, marginTop: 20 }}>
        <div style={S.sectionTitle}><TrendingUp size={14} color={C.sky} /> Revenue Breakdown</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(220px, 22vw, 260px), 1fr))', gap: 'clamp(8px, 1vw, 12px)' }}>
          {[
            { label: 'Enterprise Plans', value: `$${invoices.filter(i => i.plan === 'Enterprise').reduce((a, i) => a + i.amount, 0).toLocaleString()}`, color: C.sky, pct: 68 },
            { label: 'Professional Plans', value: `$${invoices.filter(i => i.plan === 'Professional').reduce((a, i) => a + i.amount, 0).toLocaleString()}`, color: C.purple, pct: 24 },
            { label: 'Starter Plans', value: `$${invoices.filter(i => i.plan === 'Starter').reduce((a, i) => a + i.amount, 0).toLocaleString()}`, color: C.green, pct: 8 },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: 'clamp(10px, 1.2vw, 14px)' }}>
              <div style={{ fontSize: 'clamp(9px, 1vw, 11px)', color: C.textMuted, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ marginTop: 8, height: 4, background: 'rgba(148,163,184,0.1)', borderRadius: 2 }}>
                <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
