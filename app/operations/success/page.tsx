'use client';

import { useState } from 'react';
import { Headphones, MessageSquare, Clock, Star, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { C, S } from '@/app/operations/_shared/styles';

const tickets = [
  { id: 'TKT-1001', subject: 'Integration failure with EMR system', customer: 'Northwell Health', priority: 'critical' as const, status: 'open' as const, age: 1.5, assignee: 'Alice M.', sla: 4 },
  { id: 'TKT-1002', subject: 'MFA enrollment not sending codes', customer: 'Kaiser Permanente', priority: 'high' as const, status: 'in-progress' as const, age: 3.2, assignee: 'Bob K.', sla: 8 },
  { id: 'TKT-1003', subject: 'Dashboard export CSV format issue', customer: 'Cleveland Clinic', priority: 'medium' as const, status: 'open' as const, age: 5.0, assignee: 'Carol J.', sla: 24 },
  { id: 'TKT-1004', subject: 'Question engine timeout on large forms', customer: 'Mayo Clinic', priority: 'high' as const, status: 'in-progress' as const, age: 2.1, assignee: 'Dave L.', sla: 8 },
  { id: 'TKT-1005', subject: 'New user onboarding documentation request', customer: 'Johns Hopkins', priority: 'low' as const, status: 'resolved' as const, age: 8.0, assignee: 'Eve S.', sla: 48 },
  { id: 'TKT-1006', subject: 'API rate limit needs increase', customer: 'UCSF Health', priority: 'medium' as const, status: 'open' as const, age: 0.8, assignee: 'Frank W.', sla: 24 },
  { id: 'TKT-1007', subject: 'SSL certificate renewal failed', customer: 'Partners Health', priority: 'critical' as const, status: 'open' as const, age: 0.3, assignee: 'Grace T.', sla: 4 },
  { id: 'TKT-1008', subject: 'Knowledge base article incorrect', customer: 'Interior Health', priority: 'low' as const, status: 'resolved' as const, age: 12.0, assignee: 'Heidi M.', sla: 48 },
];

const priorityColors = { critical: C.red, high: C.amber, medium: C.sky, low: C.textMuted };
const statusColors = { 'open': C.amber, 'in-progress': C.sky, 'resolved': C.green };

export default function SuccessPage() {
  const [search, setSearch] = useState('');

  const filtered = tickets.filter(t =>
    !search || t.id.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()) || t.customer.toLowerCase().includes(search.toLowerCase())
  );

  const activeTickets = tickets.filter(t => t.status !== 'resolved').length;
  const avgResolutionAge = tickets.filter(t => t.status === 'resolved').reduce((a, t) => a + t.age, 0) / Math.max(1, tickets.filter(t => t.status === 'resolved').length);

  return (
    <div style={S.page}>
      <div style={S.h1}><Headphones size={20} color={C.sky} /> Customer Success</div>
      <div style={S.sub}>Level 13 · Support tickets, satisfaction scores, and SLA management</div>

      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum(activeTickets > 5 ? C.amber : C.green)}>{activeTickets}</div>
          <div style={S.statLabel}>Active Tickets</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>4.72</div>
          <div style={S.statLabel}>CSAT Score · 5.0 scale</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.sky)}>{avgResolutionAge.toFixed(1)}h</div>
          <div style={S.statLabel}>Avg Resolution Time</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.purple)}>68</div>
          <div style={S.statLabel}>NPS Score</div>
        </div>
      </div>

      <div style={S.searchRow}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 'min(360px, 100%)' }}>
          <MessageSquare size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        </div>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={S.th}>Ticket</th>
              <th style={S.th}>Subject</th>
              <th style={S.th}>Customer</th>
              <th style={S.th}>Priority</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Age (h)</th>
              <th style={S.th}>SLA (h)</th>
              <th style={S.th}>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const slaRemaining = t.sla - t.age;
              const slaOk = slaRemaining > 2;
              return (
                <tr key={t.id} style={{ background: t.priority === 'critical' ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                  <td style={{ ...S.td, fontFamily: 'monospace', color: '#e2e8f0' }}>{t.id}</td>
                  <td style={{ ...S.td, fontWeight: 500, color: '#f1f5f9', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</td>
                  <td style={S.td}>{t.customer}</td>
                  <td style={S.td}><span style={S.badge(priorityColors[t.priority], `${priorityColors[t.priority]}15`)}>{t.priority}</span></td>
                  <td style={S.td}><span style={S.badge(statusColors[t.status], `${statusColors[t.status]}15`)}>{t.status}</span></td>
                  <td style={S.td}>{t.age}h</td>
                  <td style={{ ...S.td, color: slaOk ? C.green : C.red }}>{slaOk ? `${slaRemaining.toFixed(1)}h left` : 'BREACHED'}</td>
                  <td style={S.td}>{t.assignee}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
