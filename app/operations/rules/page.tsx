'use client';

import { useEffect, useState } from 'react';
import { Scale, Search, AlertTriangle } from 'lucide-react';
import { C, S } from '@/app/operations/_shared/styles';
import { ruleRegistry } from '@/lib/amexan/operations/rule-registry';
import { initializeAGOC } from '@/lib/amexan/operations/engine-registration';

const CATEGORY_COLORS: Record<string, string> = {
  safety: '#ef4444', activation: '#2F80ED', visibility: '#8b5cf6',
  priority: '#f59e0b', context: '#06b6d4', ordering: '#22c55e', contraindication: '#e11d48',
};

export default function RulesPage() {
  const [init, setInit] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');

  useEffect(() => {
    if (!init) { initializeAGOC(); setInit(true); }
  }, [init]);

  const coverage = ruleRegistry.getRuleCoverage();
  const conflicts = ruleRegistry.getConflicts();
  const orphans = ruleRegistry.getOrphanedRules(Array.from(new Set(ruleRegistry.getAll().map(r => r.engineId))));
  const neverTriggered = ruleRegistry.getNeverTriggeredRules().length;

  const rules = ruleRegistry.getAll().filter(r => {
    if (catFilter !== 'all' && r.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.ruleId.toLowerCase().includes(q) || r.ruleName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.conditions.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ ...S.page, background: C.bg, minHeight: '100vh' }}>
      <div style={S.h1}><Scale size={20} color={C.sky} /> Rules Console</div>

      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum(C.sky)}>{coverage.total}</div>
          <div style={S.statLabel}>Total Rules</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>{coverage.active}</div>
          <div style={S.statLabel}>Active Rules</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(conflicts.length > 0 ? C.red : C.green)}>{conflicts.length}</div>
          <div style={S.statLabel}>Conflicts Detected</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(orphans.length > 0 ? C.amber : C.green)}>{orphans.length}</div>
          <div style={S.statLabel}>Orphaned Rules</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(neverTriggered > 0 ? C.amber : C.green)}>{neverTriggered}</div>
          <div style={S.statLabel}>Never Triggered</div>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div style={S.card}>
          <div style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', fontWeight: 600, color: C.red, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} /> {conflicts.length} Rule Conflict{conflicts.length > 1 ? 's' : ''} Detected
          </div>
          {conflicts.map((c, i) => (
            <div key={i} style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 8, padding: 'clamp(10px, 1.2vw, 14px)', marginTop: 8 }}>
              <div style={{ fontSize: 'clamp(10px, 1.1vw, 12px)', fontWeight: 500, color: '#f1f5f9' }}>{c.ruleA.ruleId} vs {c.ruleB.ruleId}</div>
              <div style={{ fontSize: 'clamp(9px, 1vw, 11px)', color: '#94a3b8', marginTop: 2 }}>{c.reason}</div>
              <div style={{ fontSize: 'clamp(8px, 0.9vw, 10px)', color: '#64748b', marginTop: 2 }}>Engine: {c.ruleA.engineId} · Category: {c.ruleA.category}</div>
            </div>
          ))}
        </div>
      )}

      <div style={S.searchRow}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 'min(360px, 100%)' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search rules..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        </div>
        <button onClick={() => setCatFilter('all')} style={S.filterBtn(catFilter === 'all')}>All</button>
        {Object.keys(CATEGORY_COLORS).map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)} style={S.filterBtn(catFilter === cat)}>{cat}</button>
        ))}
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={S.th}>Rule ID</th>
              <th style={S.th}>Name</th>
              <th style={S.th}>Category</th>
              <th style={S.th}>Engine</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Triggers</th>
              <th style={S.th}>Conditions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.ruleId}>
                <td style={{ ...S.td, fontFamily: 'monospace', color: '#e2e8f0' }}>{r.ruleId}</td>
                <td style={{ ...S.td, fontWeight: 500, color: '#f1f5f9' }}>{r.ruleName}</td>
                <td style={S.td}><span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 3, fontSize: 'clamp(8px, 0.9vw, 10px)', fontWeight: 500, background: `${CATEGORY_COLORS[r.category] || '#64748b'}15`, color: CATEGORY_COLORS[r.category] || '#64748b' }}>{r.category}</span></td>
                <td style={S.td}>{r.engineId}</td>
                <td style={S.td}>
                  <span style={{ color: r.status === 'active' ? C.green : C.amber, fontWeight: 500 }}>
                    {r.status === 'superseded' ? `superseded by ${r.supersededBy}` : r.status}
                  </span>
                </td>
                <td style={S.td}>{r.triggerCount}</td>
                <td style={{ ...S.td, fontFamily: 'monospace', color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.conditions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
