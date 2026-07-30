'use client';

import { useState } from 'react';
import { Globe, Server, Activity, Clock, Radio, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { C, S } from '@/app/operations/_shared/styles';

const regions = [
  { id: 'na-east', name: 'North America (East)', location: 'Virginia, USA', status: 'healthy' as const, latency: 12, uptime: 99.99, requests: 45200, dataCenters: 3 },
  { id: 'na-west', name: 'North America (West)', location: 'Oregon, USA', status: 'healthy' as const, latency: 18, uptime: 99.97, requests: 38100, dataCenters: 2 },
  { id: 'eu-west', name: 'Europe (West)', location: 'Frankfurt, DE', status: 'healthy' as const, latency: 34, uptime: 99.99, requests: 29800, dataCenters: 3 },
  { id: 'eu-central', name: 'Europe (Central)', location: 'Warsaw, PL', status: 'degraded' as const, latency: 89, uptime: 98.45, requests: 12100, dataCenters: 1 },
  { id: 'apac-east', name: 'Asia Pacific (East)', location: 'Tokyo, JP', status: 'healthy' as const, latency: 98, uptime: 99.92, requests: 21400, dataCenters: 2 },
  { id: 'apac-south', name: 'Asia Pacific (South)', location: 'Singapore, SG', status: 'healthy' as const, latency: 112, uptime: 99.88, requests: 16700, dataCenters: 2 },
  { id: 'me', name: 'Middle East', location: 'Dubai, AE', status: 'degraded' as const, latency: 145, uptime: 97.30, requests: 6800, dataCenters: 1 },
  { id: 'sa', name: 'South America', location: 'São Paulo, BR', status: 'healthy' as const, latency: 76, uptime: 99.95, requests: 9200, dataCenters: 1 },
  { id: 'af', name: 'Africa', location: 'Johannesburg, ZA', status: 'healthy' as const, latency: 168, uptime: 99.71, requests: 3400, dataCenters: 1 },
  { id: 'oceania', name: 'Oceania', location: 'Sydney, AU', status: 'healthy' as const, latency: 156, uptime: 99.93, requests: 7800, dataCenters: 1 },
];

const statusColors = { healthy: C.green, degraded: C.amber, unhealthy: C.red };
const statusBg = { healthy: 'rgba(34,197,94,0.1)', degraded: 'rgba(245,158,11,0.1)', unhealthy: 'rgba(239,68,68,0.1)' };

export default function GlobalPage() {
  const [search, setSearch] = useState('');

  const filtered = regions.filter(r =>
    !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.name.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalRequests = regions.reduce((a, r) => a + r.requests, 0);
  const avgUptime = regions.reduce((a, r) => a + r.uptime, 0) / regions.length;
  const totalDataCenters = regions.reduce((a, r) => a + r.dataCenters, 0);

  return (
    <div style={S.page}>
      <div style={S.h1}><Globe size={20} color={C.sky} /> Global Monitoring</div>
      <div style={S.sub}>Level 12 · Geo-distribution, region health, and latency monitoring</div>

      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum(C.sky)}>{regions.length}</div>
          <div style={S.statLabel}>Regions Active</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>{avgUptime.toFixed(2)}%</div>
          <div style={S.statLabel}>Total Uptime (Avg)</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.amber)}>{totalDataCenters}</div>
          <div style={S.statLabel}>Data Centers</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.purple)}>{(totalRequests / 1000).toFixed(0)}K</div>
          <div style={S.statLabel}>Requests/sec</div>
        </div>
      </div>

      <div style={S.searchRow}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 'min(360px, 100%)' }}>
          <MapPin size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search regions..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        </div>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={S.th}>Status</th>
              <th style={S.th}>Region</th>
              <th style={S.th}>Location</th>
              <th style={S.th}>Latency (ms)</th>
              <th style={S.th}>Uptime</th>
              <th style={S.th}>Requests/s</th>
              <th style={S.th}>Data Centers</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ background: r.status === 'degraded' ? 'rgba(245,158,11,0.03)' : 'transparent' }}>
                <td style={S.td}>
                  <span style={S.badge(statusColors[r.status], statusBg[r.status])}>
                    <span style={S.statusDot(statusColors[r.status])} />{r.status}
                  </span>
                </td>
                <td style={{ ...S.td, fontWeight: 500, color: '#f1f5f9' }}>{r.name}</td>
                <td style={S.td}>{r.location}</td>
                <td style={{ ...S.td, fontWeight: 600, color: r.latency > 100 ? C.amber : C.green }}>{r.latency}ms</td>
                <td style={{ ...S.td, fontWeight: 600, color: r.uptime < 99 ? C.red : r.uptime < 99.9 ? C.amber : C.green }}>{r.uptime}%</td>
                <td style={S.td}>{r.requests.toLocaleString()}</td>
                <td style={S.td}>{r.dataCenters}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...S.section, marginTop: 20 }}>
        <div style={S.sectionTitle}><Radio size={14} color={C.sky} /> Global Health Overview</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {regions.map(r => (
            <div key={r.id} style={{ flex: 1, height: 8, background: statusColors[r.status], borderRadius: 2, opacity: r.status === 'healthy' ? 1 : 0.7 }} title={`${r.name}: ${r.status}`} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 20px)', flexWrap: 'wrap' as const, fontSize: 'clamp(9px, 1vw, 10px)', color: C.textMuted }}>
          {regions.filter(r => r.status !== 'healthy').map(r => (
            <span key={r.id} style={{ color: C.amber, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={10} /> {r.name} · {r.latency}ms · {r.uptime}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
