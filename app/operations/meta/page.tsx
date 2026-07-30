'use client';

import { Layers, Shield, Activity, Clock, BookOpen, CheckCircle, AlertTriangle, Server } from 'lucide-react';
import { C, S } from '@/app/operations/_shared/styles';

const systems = [
  { name: 'Engine Registry', status: 'healthy' as const, uptime: 99.99, version: '2.4.1' },
  { name: 'Rule Engine', status: 'healthy' as const, uptime: 99.97, version: '1.9.3' },
  { name: 'Knowledge Base', status: 'healthy' as const, uptime: 99.98, version: '3.2.0' },
  { name: 'Workflow Orchestrator', status: 'healthy' as const, uptime: 99.95, version: '2.1.2' },
  { name: 'Telemetry Pipeline', status: 'degraded' as const, uptime: 98.72, version: '1.8.4' },
  { name: 'Security Gateway', status: 'healthy' as const, uptime: 100.00, version: '2.0.0' },
  { name: 'AI Inference', status: 'healthy' as const, uptime: 99.91, version: '4.0.2' },
  { name: 'Customer Portal', status: 'healthy' as const, uptime: 99.88, version: '1.5.1' },
  { name: 'Marketplace API', status: 'healthy' as const, uptime: 99.96, version: '1.2.0' },
  { name: 'Global CDN', status: 'healthy' as const, uptime: 99.99, version: '3.0.0' },
  { name: 'Database Cluster', status: 'healthy' as const, uptime: 99.99, version: '15.4' },
  { name: 'Message Bus', status: 'degraded' as const, uptime: 98.15, version: '1.7.3' },
];

const statusColors = { healthy: C.green, degraded: C.amber, unhealthy: C.red };
const statusBg = { healthy: 'rgba(34,197,94,0.1)', degraded: 'rgba(245,158,11,0.1)', unhealthy: 'rgba(239,68,68,0.1)' };

export default function MetaPage() {
  const allHealthy = systems.every(s => s.status === 'healthy');
  const avgUptime = systems.reduce((a, s) => a + s.uptime, 0) / systems.length;
  const degradedCount = systems.filter(s => s.status !== 'healthy').length;

  return (
    <div style={S.page}>
      <div style={S.h1}><Layers size={20} color={C.purple} /> Meta-Operations</div>
      <div style={S.sub}>Level 15 · System-wide health overview, constitution version, governance status</div>

      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum(allHealthy ? C.green : C.amber)}>{allHealthy ? 'ALL GOOD' : `${degradedCount} ISSUES`}</div>
          <div style={S.statLabel}>All Systems Status</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.sky)}>Book XXIV v1.0</div>
          <div style={S.statLabel}>Constitution Version</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>2026-07-29</div>
          <div style={S.statLabel}>Last System Audit</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(avgUptime > 99.5 ? C.green : C.amber)}>{avgUptime.toFixed(2)}%</div>
          <div style={S.statLabel}>Total System Uptime</div>
        </div>
      </div>

      <div style={{ ...S.section }}>
        <div style={S.sectionTitle}><Shield size={14} color={C.sky} /> Governance &amp; Constitution Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px, 25vw, 300px), 1fr))', gap: 'clamp(8px, 1vw, 12px)' }}>
          {[
            { label: 'Constitutional Council', value: 'Active · 16 Divisions', color: C.green },
            { label: 'Five Fundamental Laws', value: 'Enforced · 100% Compliance', color: C.green },
            { label: 'Engine Governance', value: `${systems.filter(s => s.status === 'healthy').length}/${systems.length} Systems Healthy`, color: allHealthy ? C.green : C.amber },
            { label: 'Operating Intelligence', value: 'Book XXIV · Version 1.0.0', color: C.sky },
            { label: 'Last Amendment', value: '2026-07-15 · Law V Clarification', color: C.textMuted },
            { label: 'Governance Mode', value: 'Autonomous · Distributed', color: C.sky },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: 'clamp(10px, 1.2vw, 14px)' }}>
              <div style={{ fontSize: 'clamp(9px, 1vw, 11px)', color: C.textMuted, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 'clamp(12px, 1.3vw, 14px)', fontWeight: 600, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={S.th}>System</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Uptime</th>
              <th style={S.th}>Version</th>
            </tr>
          </thead>
          <tbody>
            {systems.map(s => (
              <tr key={s.name} style={{ background: s.status === 'degraded' ? 'rgba(245,158,11,0.03)' : 'transparent' }}>
                <td style={{ ...S.td, fontWeight: 500, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Server size={12} color={statusColors[s.status]} /> {s.name}
                </td>
                <td style={S.td}>
                  <span style={S.badge(statusColors[s.status], statusBg[s.status])}>
                    <span style={S.statusDot(statusColors[s.status])} />{s.status}
                  </span>
                </td>
                <td style={{ ...S.td, fontWeight: 600, color: s.uptime < 99 ? C.red : s.uptime < 99.9 ? C.amber : C.green }}>{s.uptime}%</td>
                <td style={S.td}>{s.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
