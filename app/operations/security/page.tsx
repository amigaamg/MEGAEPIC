'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock, Key, Users, FileText } from 'lucide-react';
import { C, S } from '@/app/operations/_shared/styles';

const recentEvents = [
  { id: 'SEC-001', type: 'Failed Login', source: '203.0.113.42', user: 'admin@amexan.com', timestamp: '2026-07-30 09:23:14', severity: 'warning' as const, status: 'investigating' as const },
  { id: 'SEC-002', type: 'Unauthorized API Call', source: '198.51.100.7', user: 'system/internal', timestamp: '2026-07-30 09:12:05', severity: 'critical' as const, status: 'blocked' as const },
  { id: 'SEC-003', type: 'MFA Challenge', source: '192.0.2.88', user: 'dr.smith@amexan.com', timestamp: '2026-07-30 08:55:22', severity: 'info' as const, status: 'approved' as const },
  { id: 'SEC-004', type: 'Data Export', source: '10.0.1.45', user: 'researcher@amexan.com', timestamp: '2026-07-30 08:30:00', severity: 'info' as const, status: 'audited' as const },
  { id: 'SEC-005', type: 'Privilege Escalation', source: '172.16.0.12', user: 'engine.audit', timestamp: '2026-07-30 07:45:33', severity: 'critical' as const, status: 'blocked' as const },
  { id: 'SEC-006', type: 'SSL Certificate Expiry', source: 'api.amexan.com', user: 'system/certbot', timestamp: '2026-07-30 07:00:00', severity: 'warning' as const, status: 'renewed' as const },
  { id: 'SEC-007', type: 'New Device Login', source: '203.0.113.99', user: 'nurse.johnson@amexan.com', timestamp: '2026-07-30 06:30:18', severity: 'info' as const, status: 'approved' as const },
  { id: 'SEC-008', type: 'Rate Limit Exceeded', source: '45.33.32.156', user: 'anonymous', timestamp: '2026-07-30 06:15:44', severity: 'warning' as const, status: 'throttled' as const },
];

const severityColors = { critical: C.red, warning: C.amber, info: C.sky };
const severityBg = { critical: 'rgba(239,68,68,0.1)', warning: 'rgba(245,158,11,0.1)', info: 'rgba(47,128,237,0.1)' };
const statusColors = { investigating: C.amber, blocked: C.red, approved: C.green, audited: C.sky, renewed: C.green, throttled: C.amber };

export default function SecurityPage() {
  const [search, setSearch] = useState('');

  const filtered = recentEvents.filter(e =>
    !search || e.id.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase()) || e.source.toLowerCase().includes(search.toLowerCase()) || e.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={S.page}>
      <div style={S.h1}><Shield size={20} color={C.sky} /> Security Operations Center</div>
      <div style={S.sub}>Level 7 · Real-time threat monitoring, access control, and audit compliance</div>

      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum(C.red)}>23</div>
          <div style={S.statLabel}>Failed Logins · 24h</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>1,247</div>
          <div style={S.statLabel}>Active Sessions</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.sky)}>94%</div>
          <div style={S.statLabel}>MFA Adoption Rate</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>100%</div>
          <div style={S.statLabel}>Encryption Compliance</div>
        </div>
      </div>

      <div style={S.searchRow}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 'min(360px, 100%)' }}>
          <Key size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search security events..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        </div>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={S.th}>Event</th>
              <th style={S.th}>Type</th>
              <th style={S.th}>Source</th>
              <th style={S.th}>User</th>
              <th style={S.th}>Timestamp</th>
              <th style={S.th}>Severity</th>
              <th style={S.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id}>
                <td style={{ ...S.td, fontFamily: 'monospace', color: '#e2e8f0' }}>{e.id}</td>
                <td style={S.td}>{e.type}</td>
                <td style={{ ...S.td, fontFamily: 'monospace', color: '#94a3b8' }}>{e.source}</td>
                <td style={S.td}>{e.user}</td>
                <td style={S.td}>{e.timestamp}</td>
                <td style={S.td}>
                  <span style={S.badge(severityColors[e.severity], severityBg[e.severity])}>{e.severity}</span>
                </td>
                <td style={S.td}>
                  <span style={S.badge(statusColors[e.status], `${statusColors[e.status]}15`)}>{e.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...S.section, marginTop: 20 }}>
        <div style={S.sectionTitle}><Lock size={14} color={C.sky} /> Access Log · Audit Trail</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px, 25vw, 300px), 1fr))', gap: 'clamp(8px, 1vw, 12px)' }}>
          {[
            { label: 'Last Security Audit', value: '2026-07-29', color: C.green },
            { label: 'Active Threat Detections', value: '3', color: C.amber },
            { label: 'API Keys Rotated', value: '48 / 52', color: C.sky },
            { label: 'Compliance Standards', value: 'HIPAA · SOC 2 · GDPR', color: C.green },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: 'clamp(10px, 1.2vw, 14px)' }}>
              <div style={{ fontSize: 'clamp(9px, 1vw, 11px)', color: C.textMuted, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 'clamp(13px, 1.5vw, 15px)', fontWeight: 600, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
