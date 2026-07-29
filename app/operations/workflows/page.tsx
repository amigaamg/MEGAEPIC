'use client';

import { useEffect, useState } from 'react';
import { Workflow, Search, BarChart3, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { workflowRegistry } from '@/lib/amexan/operations/workflow-registry';
import { initializeAGOC } from '@/lib/amexan/operations/engine-registration';
import { C, S, rowStyle } from '@/app/operations/_shared/styles';

export default function WorkflowsPage() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!init) { initializeAGOC(); setInit(true); }
  }, [init]);

  const stats = workflowRegistry.getStats();
  const workflows = workflowRegistry.getAll();

  const barBg = { background: 'rgba(148, 163, 184, 0.1)', borderRadius: 3, height: 6, overflow: 'hidden' as const, flex: 1 };
  const barFill = (w: number, c: string) => ({ width: `${w}%`, height: 6, background: c, borderRadius: 3, transition: 'width 0.3s' });

  return (
    <div style={S.page}>
      <div style={S.h1}><Workflow size={20} color={C.sky} /> Workflow Analytics</div>

      <div style={S.statRow}>
        <div style={S.statCard}><div style={S.statNum(C.sky)}>{stats.totalWorkflows}</div><div style={S.statLabel}>Workflows</div></div>
        <div style={S.statCard}><div style={S.statNum(C.green)}>{stats.totalCompleted}</div><div style={S.statLabel}>Completed</div></div>
        <div style={S.statCard}><div style={S.statNum(stats.totalAborted > 0 ? C.amber : C.green)}>{stats.totalAborted}</div><div style={S.statLabel}>Aborted</div></div>
        <div style={S.statCard}><div style={S.statNum(C.purple)}>{Object.keys(stats.byJourney).length}</div><div style={S.statLabel}>Journeys</div></div>
      </div>

      <div style={{ ...S.card, marginBottom: 20 }}>
        <div style={{ fontSize: 'clamp(11px, 1.3vw, 13px)', fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>Workflow Distribution by Journey</div>
        {Object.entries(stats.byJourney).map(([journey, count]) => {
          const pct = stats.totalWorkflows > 0 ? Math.round(count / stats.totalWorkflows * 100) : 0;
          return (
            <div key={journey} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1vw, 12px)', marginBottom: 6 }}>
              <span style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: '#94a3b8', width: 'clamp(80px, 15vw, 120px)', flexShrink: 0 }}>{journey}</span>
              <div style={barBg}><div style={barFill(pct, C.sky)} /></div>
              <span style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: '#64748b', width: 30, textAlign: 'right' as const }}>{count}</span>
            </div>
          );
        })}
      </div>

      <div style={S.grid2}>
        {workflows.map(wf => {
          const analytics = workflowRegistry.getWorkflowAnalytics(wf.workflowId);
          return (
            <div key={wf.workflowId} style={S.cardH}>
              <div style={{ fontSize: 'clamp(12px, 1.3vw, 14px)', fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>{wf.workflowName}</div>
              <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: '#64748b', fontFamily: 'monospace', marginBottom: 8 }}>{wf.workflowId} · v{wf.version}</div>
              <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: '#64748b', marginBottom: 8 }}>Actors: {wf.actorTypes.join(', ')}</div>
              <div style={{ marginBottom: 8 }}>
                {wf.expectedPhases.map(p => <span key={p} style={S.badge(C.sky, 'rgba(47, 128, 237, 0.1)')}>{p}</span>)}
              </div>
              <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: '#94a3b8' }}>
                Expected total: {(wf.expectedTotalDuration / 60000).toFixed(0)} min
              </div>
              {analytics.totalExecutions > 0 && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.cardBorder}` }}>
                  <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: '#64748b', marginBottom: 4 }}>Analytics · {analytics.totalExecutions} executions</div>
                  <div style={{ display: 'flex', gap: 'clamp(8px, 1vw, 12px)' }}>
                    <span style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: analytics.completionRate > 80 ? C.green : C.amber }}>
                      <CheckCircle size={10} style={{ display: 'inline', marginRight: 2 }} /> {analytics.completionRate}% complete
                    </span>
                    <span style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: analytics.abortRate > 20 ? C.red : C.textLight }}>
                      <AlertTriangle size={10} style={{ display: 'inline', marginRight: 2 }} /> {analytics.abortRate}% aborted
                    </span>
                  </div>
                  {analytics.commonAbortReasons.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: 'clamp(8px, 0.9vw, 9px)', color: C.amber }}>
                      Abort reasons: {analytics.commonAbortReasons.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
