'use client';

import { useState } from 'react';
import { Building2, Search, ChevronDown, ChevronRight, Eye, Target, List } from 'lucide-react';
import { getAllDivisions } from '@/lib/amexan/operations/operations-constitution';
import { C, S } from '@/app/operations/_shared/styles';

const CAT_COLORS: Record<string, string> = {
  clinical_reasoning: '#2F80ED', question: '#8b5cf6', clinical_documentation: '#06b6d4',
  knowledge_compiler: '#22c55e', knowledge_graph: '#10b981', presentation: '#f59e0b',
  examination: '#ec4899', investigation: '#f97316', danger_scoring: '#ef4444',
  completeness: '#a855f7', contradiction: '#e11d48', geographic_prior: '#14b8a6',
  enterprise_billing: '#ec4899', enterprise_security: '#ef4444', enterprise_admin: '#6366f1',
  enterprise_multi_tenant: '#8b5cf6', enterprise_support: '#f59e0b', enterprise_growth: '#22c55e',
  enterprise_plugin: '#a855f7', enterprise_deployment: '#06b6d4', enterprise_analytics: '#14b8a6',
  orchestrator: '#6366f1', business_constitution: '#f97316', workflow_engine: '#8b5cf6',
  knowledge_integration: '#10b981', enterprise_customer_success: '#06b6d4',
  enterprise_licensing: '#2F80ED', enterprise_marketplace: '#f59e0b',
  enterprise_white_label: '#a855f7', constitutional_validation: '#6366f1',
  experience: '#ec4899', theme: '#8b5cf6',
};

export default function DivisionsPage() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const divisions = getAllDivisions();

  const filtered = divisions.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.purpose.toLowerCase().includes(q) || d.monitors.join(' ').toLowerCase().includes(q) || d.id.includes(q);
  });

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: 'clamp(12px, 2vw, 24px)' }}>
      <div style={S.h1}><Building2 size={20} color={C.sky} /> Divisions Center</div>

      <div style={S.searchRow}>
        <div style={{ position: 'relative', maxWidth: 'min(360px, 100%)', boxSizing: 'border-box', width: '100%' }}>
          <Search size={14} color={C.textMuted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            placeholder="Search divisions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={S.searchInput}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 30vw, 360px), 1fr))',
        gap: 'clamp(8px, 1vw, 12px)',
      }}>
        {filtered.map(div => {
          const isExpanded = expanded[div.id] || false;
          return (
            <div
              key={div.id}
              style={{
                background: C.cardBg,
                border: div.priority === 0 ? '1px solid rgba(47, 128, 237, 0.3)' : `1px solid ${C.cardBorder}`,
                borderRadius: 12,
                padding: 'clamp(12px, 1.5vw, 16px)',
                cursor: 'pointer',
                touchAction: 'manipulation',
                transition: 'all 0.15s',
              }}
              onClick={() => setExpanded({ ...expanded, [div.id]: !isExpanded })}
            >
              <div style={{ fontSize: 'clamp(13px, 1.5vw, 15px)', fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  fontSize: 'clamp(9px, 1vw, 11px)',
                  fontWeight: 700,
                  background: div.priority === 0 ? C.sky : C.skyLight,
                  color: div.priority === 0 ? '#fff' : C.sky,
                  marginRight: 8,
                  flexShrink: 0,
                }}>
                  {div.priority}
                </span>
                {div.name}
                {div.priority === 0 && (
                  <span style={{ marginLeft: 8, fontSize: 'clamp(8px, 0.9vw, 10px)', color: C.sky, fontWeight: 600, whiteSpace: 'nowrap' }}>★ HIGHEST AUTHORITY</span>
                )}
              </div>
              <div style={{ fontSize: 'clamp(11px, 1.2vw, 12px)', color: C.textLight, lineHeight: 1.5, marginTop: 8 }}>{div.purpose}</div>
              <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', fontWeight: 600, color: C.textMuted, letterSpacing: '1px', textTransform: 'uppercase', marginTop: 12, marginBottom: 4 }}>
                <Eye size={10} style={{ display: 'inline', marginRight: 3 }} /> Monitors
              </div>
              <div style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: C.textMuted, lineHeight: 1.6 }}>{div.monitors}</div>
              {isExpanded && (
                <>
                  <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', fontWeight: 600, color: C.textMuted, letterSpacing: '1px', textTransform: 'uppercase', marginTop: 12, marginBottom: 4 }}>
                    <Target size={10} style={{ display: 'inline', marginRight: 3 }} /> Consumes Engine Categories
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {div.consumesEngineCategories.map(c => (
                      <span
                        key={c}
                        style={{
                          display: 'inline-block',
                          padding: '1px 5px',
                          borderRadius: 3,
                          fontSize: 'clamp(8px, 0.9vw, 10px)',
                          background: `${CAT_COLORS[c] || '#64748b'}15`,
                          color: CAT_COLORS[c] || '#64748b',
                          marginRight: 3,
                          marginBottom: 2,
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', fontWeight: 600, color: C.textMuted, letterSpacing: '1px', textTransform: 'uppercase', marginTop: 12, marginBottom: 4 }}>
                    <List size={10} style={{ display: 'inline', marginRight: 3 }} /> Produces
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {div.produces.map((p, i) => (
                      <span
                        key={i}
                        style={{
                          display: 'inline-block',
                          padding: '1px 5px',
                          borderRadius: 3,
                          fontSize: 'clamp(8px, 0.9vw, 10px)',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          marginRight: 3,
                          marginBottom: 2,
                        }}
                      >
                        {p.type}: {p.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                {isExpanded ? <ChevronDown size={14} color={C.textMuted} /> : <ChevronRight size={14} color={C.textMuted} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
