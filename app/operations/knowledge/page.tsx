'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { C, S } from '@/app/operations/_shared/styles';
import { knowledgeRegistry } from '@/lib/amexan/operations/knowledge-registry';
import { initializeAGOC } from '@/lib/amexan/operations/engine-registration';

export default function KnowledgePage() {
  const [init, setInit] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!init) { initializeAGOC(); setInit(true); }
  }, [init]);

  const stats = knowledgeRegistry.getStats();
  const gateRate = knowledgeRegistry.getGateFailureRate();
  const outdated = knowledgeRegistry.getOutdatedPackages();

  const packages = knowledgeRegistry.getAll().filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.packageId.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.diseases.some(d => d.toLowerCase().includes(q));
  });

  return (
    <div style={{ ...S.page, background: C.bg, minHeight: '100vh' }}>
      <div style={S.h1}><BookOpen size={20} color={C.sky} /> Knowledge Registry</div>

      <div style={S.statRow}>
        <div style={S.statCard}><div style={S.statNum(C.sky)}>{stats.total}</div><div style={S.statLabel}>Total Packages</div></div>
        <div style={S.statCard}><div style={S.statNum(C.green)}>{stats.published}</div><div style={S.statLabel}>Published</div></div>
        <div style={S.statCard}><div style={S.statNum(C.amber)}>{stats.superseded}</div><div style={S.statLabel}>Superseded</div></div>
        <div style={S.statCard}><div style={S.statNum(C.purple)}>{stats.avgObjectsPerPackage}</div><div style={S.statLabel}>Avg Objects</div></div>
        <div style={S.statCard}><div style={S.statNum(gateRate.failed > 0 ? C.amber : C.green)}>{gateRate.passed}/{gateRate.total}</div><div style={S.statLabel}>Gates Passed ({gateRate.rate}%)</div></div>
        <div style={S.statCard}><div style={S.statNum(outdated.length > 0 ? C.amber : C.green)}>{outdated.length}</div><div style={S.statLabel}>Outdated</div></div>
      </div>

      <div style={S.searchRow}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 'min(360px, 100%)' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search knowledge packages..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        </div>
      </div>

      <div style={S.grid2}>
        {packages.map(pkg => (
          <div key={pkg.packageId} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'clamp(12px, 1.3vw, 14px)', fontWeight: 600, color: '#f1f5f9', marginBottom: 3 }}>{pkg.name}</div>
                <div style={{ fontSize: 'clamp(9px, 1vw, 11px)', fontFamily: 'monospace', color: '#64748b', marginBottom: 8 }}>{pkg.packageId} · v{pkg.version}</div>
              </div>
              <span style={S.badge(
                pkg.status === 'published' ? C.green : pkg.status === 'superseded' ? C.amber : pkg.status === 'draft' ? C.sky : C.red,
                pkg.status === 'published' ? 'rgba(34, 197, 94, 0.1)' : pkg.status === 'superseded' ? 'rgba(245, 158, 11, 0.1)' : pkg.status === 'draft' ? 'rgba(47, 128, 237, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              )}>{pkg.status}</span>
            </div>
            <div style={{ fontSize: 'clamp(10px, 1.1vw, 12px)', color: '#94a3b8', lineHeight: 1.5, marginBottom: 8 }}>{pkg.description}</div>
            <div style={{ fontSize: 'clamp(9px, 1vw, 11px)', color: '#64748b' }}>
              <span>{pkg.objectCount} objects</span> · <span>{pkg.edgeCount} edges</span> · <span>Source: {pkg.sourceAuthority}</span>
            </div>
            {pkg.diseases.length > 0 && (
              <div style={{ marginTop: 6, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {pkg.diseases.map(d => <span key={d} style={{ padding: '1px 5px', borderRadius: 3, fontSize: 'clamp(8px, 0.9vw, 10px)', background: 'rgba(47, 128, 237, 0.1)', color: C.sky }}>{d}</span>)}
              </div>
            )}
            {pkg.approvalGateResults.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {pkg.approvalGateResults.map((g, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 3, fontSize: 'clamp(7px, 0.8vw, 9px)', fontWeight: 500, background: g.passed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: g.passed ? C.green : C.red }}>
                    {g.passed ? '✓' : '✗'} {g.gateName}
                  </span>
                ))}
              </div>
            )}
            {pkg.supersededBy && <div style={{ marginTop: 6, fontSize: 'clamp(8px, 0.9vw, 10px)', color: C.amber }}>Superseded by: {pkg.supersededBy}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
