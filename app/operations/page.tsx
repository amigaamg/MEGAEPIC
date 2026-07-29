'use client';

import { useEffect, useState } from 'react';
import { Activity, Cpu, Scale, BookOpen, Workflow, Building2, Shield, AlertTriangle, CheckCircle, Clock, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { engineRegistry } from '@/lib/amexan/operations/engine-registry';
import { ruleRegistry } from '@/lib/amexan/operations/rule-registry';
import { knowledgeRegistry } from '@/lib/amexan/operations/knowledge-registry';
import { workflowRegistry } from '@/lib/amexan/operations/workflow-registry';
import { engineHealthRegistry, EngineHealthRegistry } from '@/lib/amexan/operations/engine-health-registry';
import { getAllDivisions, getDivision, OIEntityType } from '@/lib/amexan/operations/operations-constitution';
import { initializeAGOC } from '@/lib/amexan/operations/engine-registration';
import { C, S, rowStyle } from '@/app/operations/_shared/styles';

const ls = {
  sectionTitle: { fontSize: 'clamp(12px, 1.4vw, 14px)', fontWeight: 600, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  lawCard: { background: 'rgba(47, 128, 237, 0.05)', border: '1px solid rgba(47, 128, 237, 0.15)', borderRadius: 10, padding: 'clamp(10px, 1.2vw, 16px)' },
  lawNum: { fontSize: 'clamp(8px, 0.9vw, 10px)', fontWeight: 700, color: C.sky, letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 4 },
  lawText: { fontSize: 'clamp(10px, 1.1vw, 12px)', color: '#cbd5e1', lineHeight: 1.5 },
  healthVal: (c: string) => ({ fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 700, color: c, lineHeight: 1 }),
  healthLabel: { fontSize: 'clamp(9px, 1vw, 11px)', color: '#64748b' },
  healthScore: (s: number) => ({ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: s > 80 ? C.green : s > 50 ? C.amber : C.red, lineHeight: 1 }),
  lawGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(220px, 25vw, 280px), 1fr))', gap: 'clamp(8px, 1vw, 12px)' },
};

export default function OperationsDashboard() {
  const [initialized, setInitialized] = useState(false);
  const [health, setHealth] = useState({ total: 0, healthy: 0, degraded: 0, unhealthy: 0, healthScore: 100 });

  useEffect(() => {
    if (!initialized) {
      initializeAGOC();
      setInitialized(true);
    }
    const h = engineHealthRegistry.getStatusSummary();
    setHealth(h);
    const interval = setInterval(() => setHealth(engineHealthRegistry.getStatusSummary()), 2000);
    return () => clearInterval(interval);
  }, [initialized]);

  const engineCount = engineRegistry.getCount();
  const ruleCoverage = ruleRegistry.getRuleCoverage();
  const knowledgeStats = knowledgeRegistry.getStats();
  const workflowStats = workflowRegistry.getStats();
  const divisions = getAllDivisions();

  return (
    <div style={S.page}>
      <div style={S.h1}>AGOC Operations Dashboard</div>
      <div style={S.sub}>AMEXAN Global Operations Center — Book XXIV · Five Fundamental Laws · {divisions.length} Divisions</div>

      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum(C.sky)}>{engineCount}</div>
          <div style={S.statLabel}>Engines · {Object.keys(engineRegistry.getByCategoryBreakdown()).length} categories</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.amber)}>{ruleCoverage.total}</div>
          <div style={S.statLabel}>Rules · {ruleCoverage.active} active · {ruleCoverage.byCategory ? Object.keys(ruleCoverage.byCategory).length : 0} categories</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>{knowledgeStats.total}</div>
          <div style={S.statLabel}>Knowledge · {knowledgeStats.published} published · {knowledgeStats.avgObjectsPerPackage} avg objects</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.purple)}>{workflowStats.totalWorkflows}</div>
          <div style={S.statLabel}>Workflows · {Object.keys(workflowStats.byJourney).length} journeys</div>
        </div>
      </div>

      <div style={rowStyle()}>
        <div style={{ ...S.card, flex: '1 1 clamp(280px, 40vw, 400px)' }}>
          <div style={S.cardTitle}>Engine Health</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(6px, 1vw, 12px)', marginBottom: 8, flexWrap: 'wrap' as const }}>
            <div style={ls.healthVal(C.green)}>{health.healthy}</div>
            <div style={ls.healthLabel}>healthy</div>
            <div style={ls.healthVal(C.amber)}>{health.degraded}</div>
            <div style={ls.healthLabel}>degraded</div>
            <div style={ls.healthVal(C.red)}>{health.unhealthy}</div>
            <div style={ls.healthLabel}>unhealthy</div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' as const }}>
              <div style={ls.healthScore(health.healthScore)}>{health.healthScore}%</div>
              <div style={{ fontSize: 'clamp(8px, 0.9vw, 10px)', color: '#64748b' }}>Health Score</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
            {health.total > 0 && (
              <>
                <div style={{ flex: health.healthy, height: 4, background: C.green, borderRadius: 2 }} />
                <div style={{ flex: health.degraded, height: 4, background: C.amber, borderRadius: 2 }} />
                <div style={{ flex: health.unhealthy, height: 4, background: C.red, borderRadius: 2 }} />
              </>
            )}
          </div>
        </div>
        <div style={{ ...S.card, flex: '1 1 clamp(280px, 40vw, 400px)' }}>
          <div style={S.cardTitle}>Divisions</div>
          <div style={S.cardValue(C.sky)}>{divisions.length}</div>
          <div style={{ fontSize: 'clamp(9px, 1vw, 11px)', color: '#64748b', marginTop: 4 }}>
            Constitutional Council (priority 0) · Clinical Intelligence (priority 1) · Knowledge Intelligence · Reasoning Intelligence · Question Intelligence · Documentation Intelligence · Workflow Intelligence · Performance Intelligence + 16 more
          </div>
        </div>
      </div>

      <div style={{ ...S.card, marginBottom: 20 }}>
        <div style={ls.sectionTitle}><Shield size={16} color={C.sky} /> Five Fundamental Laws</div>
        <div style={ls.lawGrid}>
          {[
            { num: 'Law I', text: 'AGOC never alters clinical data. It observes, analyzes, recommends, flags, approves. Never edits patient care.' },
            { num: 'Law II', text: 'AGOC monitors engines, not users. Doctors are not evaluated. Reasoning engines, question engines, documentation engines are.' },
            { num: 'Law III', text: 'Every engine explains itself. Nothing becomes a black box. Every decision is reconstructable from events.' },
            { num: 'Law IV', text: 'Everything is versioned. Questions, protocols, documentation, rules, knowledge, reasoning — all carry version provenance.' },
            { num: 'Law V', text: 'Every improvement is evidence-based. Nothing changes because someone "felt like it."' },
          ].map(law => (
            <div key={law.num} style={ls.lawCard}>
              <div style={ls.lawNum}>{law.num}</div>
              <div style={ls.lawText}>{law.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
