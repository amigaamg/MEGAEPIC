'use client';

import { useEffect, useState } from 'react';
import { Cpu, Search, Filter, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { engineRegistry } from '@/lib/amexan/operations/engine-registry';
import { engineHealthRegistry, EngineHealthRegistry } from '@/lib/amexan/operations/engine-health-registry';
import { initializeAGOC } from '@/lib/amexan/operations/engine-registration';
import { C, S } from '@/app/operations/_shared/styles';

const CATEGORY_COLORS: Record<string, string> = {
  clinical_reasoning: '#2F80ED', question: '#8b5cf6', clinical_documentation: '#06b6d4',
  knowledge_compiler: '#22c55e', knowledge_graph: '#10b981', presentation: '#f59e0b',
  enterprise_billing: '#ec4899', enterprise_security: '#ef4444', orchestrator: '#6366f1',
  constitutional_validation: '#a855f7',
};

function getCatColor(cat: string): string {
  return CATEGORY_COLORS[cat] || '#64748b';
}

const catBadge = (c: string) => ({ display: 'inline-block', padding: '1px 6px', borderRadius: 3, fontSize: 'clamp(8px, 0.9vw, 10px)', fontWeight: 500, background: `${c}15`, color: c, whiteSpace: 'nowrap' as const });

export default function EnginesPage() {
  const [init, setInit] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'healthy' | 'degraded' | 'unhealthy'>('all');
  const [healthMap, setHealthMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!init) { initializeAGOC(); setInit(true); }
    const update = () => {
      const map: Record<string, string> = {};
      for (const e of engineRegistry.getAll()) {
        const h = engineHealthRegistry.getHealth(e.engineId);
        map[e.engineId] = h?.status || 'healthy';
      }
      setHealthMap({ ...map });
    };
    update();
    const interval = setInterval(update, 3000);
    return () => clearInterval(interval);
  }, [init]);

  const engines = engineRegistry.getAll().filter(e => {
    if (filter !== 'all' && healthMap[e.engineId] !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.engineId.toLowerCase().includes(q) || e.engineName.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
    }
    return true;
  });

  const statusCounts = { healthy: 0, degraded: 0, unhealthy: 0 };
  for (const e of engineRegistry.getAll()) {
    const s = healthMap[e.engineId] || 'healthy';
    if (s in statusCounts) statusCounts[s as keyof typeof statusCounts]++;
  }

  return (
    <div style={S.pageWide}>
      <div style={S.h1}><Cpu size={20} color={C.sky} /> Engine Monitoring</div>

      <div style={S.card}>
        <div style={{ display: 'flex', gap: 'clamp(12px, 2vw, 24px)', alignItems: 'center', flexWrap: 'wrap' as const }}>
          <div><span style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: C.green }}>{statusCounts.healthy}</span><span style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: '#64748b', marginLeft: 4 }}>healthy</span></div>
          <div><span style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: C.amber }}>{statusCounts.degraded}</span><span style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: '#64748b', marginLeft: 4 }}>degraded</span></div>
          <div><span style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: C.red }}>{statusCounts.unhealthy}</span><span style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: '#64748b', marginLeft: 4 }}>unhealthy</span></div>
          <div style={{ marginLeft: 'auto', fontSize: 'clamp(9px, 1vw, 11px)', color: '#64748b' }}>{engines.length} engines displayed</div>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
          {engineRegistry.getCount() > 0 && (
            <>
              <div style={{ flex: statusCounts.healthy || 1, height: 3, background: C.green, borderRadius: 2 }} />
              <div style={{ flex: statusCounts.degraded || 1, height: 3, background: C.amber, borderRadius: 2 }} />
              <div style={{ flex: statusCounts.unhealthy || 1, height: 3, background: C.red, borderRadius: 2 }} />
            </>
          )}
        </div>
      </div>

      <div style={S.searchRow}>
        <div style={{ position: 'relative', flex: '1 1 auto', maxWidth: 'min(360px, 100%)' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search engines..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        </div>
        {(['all', 'healthy', 'degraded', 'unhealthy'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={S.filterBtn(filter === f)}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={S.th}>Status</th>
              <th style={S.th}>Engine</th>
              <th style={S.th}>Category</th>
              <th style={S.th}>Version</th>
              <th style={S.th}>Dependencies</th>
              <th style={S.th}>Constitutional Laws</th>
            </tr>
          </thead>
          <tbody>
            {engines.map(e => {
              const status = healthMap[e.engineId] || 'healthy';
              const statusColor = status === 'healthy' ? C.green : status === 'degraded' ? C.amber : C.red;
              const statusBg = status === 'healthy' ? 'rgba(34, 197, 94, 0.1)' : status === 'degraded' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)';
              return (
                <tr key={e.engineId} style={{ background: status === 'unhealthy' ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}>
                  <td style={S.td}><span style={S.badge(statusColor, statusBg)}><span style={S.statusDot(statusColor)} />{status}</span></td>
                  <td style={{ ...S.td, fontWeight: 500, color: '#f1f5f9' }}>{e.engineName}<div style={{ fontSize: 'clamp(8px, 0.8vw, 9px)', color: '#64748b', marginTop: 1 }}>{e.engineId}</div></td>
                  <td style={S.td}><span style={catBadge(getCatColor(e.category))}>{e.category}</span></td>
                  <td style={S.td}>{e.version}</td>
                  <td style={S.td}>{e.dependencies.length > 0 ? e.dependencies.join(', ') : <span style={{ color: '#475569' }}>none</span>}</td>
                  <td style={S.td}>{e.constitutionalLaws.map(l => `Law ${l}`).join(', ')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
