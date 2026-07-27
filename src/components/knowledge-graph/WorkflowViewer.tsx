'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { EventEngine } from '@/lib/amexan/events/engine';
import { WorkflowCoordinator } from '@/lib/amexan/workflow/coordinator';
import { PatientState } from '@/lib/amexan/workflow/types';
import { getValidTransitions, getStateLabel } from '@/lib/amexan/workflow/state-machine';
import type { ActiveWorkflow } from '@/lib/amexan/workflow/coordinator';
import { buildCascadeRules, connectEventEngineToRules } from '@/lib/amexan/events/cascade';
import { RuleEngine } from '@/lib/amexan/rules';
import { ALL_RULES } from '@/lib/amexan/rules';

const STATE_COLORS: Record<string, string> = {
  self_care: '#94A3B8',
  appointment: '#3B82F6',
  waiting: '#F59E0B',
  triage: '#EF4444',
  consultation: '#8B5CF6',
  laboratory: '#10B981',
  radiology: '#06B6D4',
  pharmacy: '#14B8A6',
  observation: '#F97316',
  admission: '#6366F1',
  ward: '#A855F7',
  icu: '#DC2626',
  theatre: '#EC4899',
  recovery: '#84CC16',
  discharge: '#22C55E',
  follow_up: '#0EA5E9',
  long_term_monitoring: '#8B5CF6',
  community_care: '#14B8A6',
  home_care: '#10B981',
  deceased: '#6B7280',
  transfer: '#F59E0B',
  referral: '#6366F1',
  escalation: '#EF4444',
  telemedicine: '#3B82F6',
  physiotherapy: '#0EA5E9',
};

interface WorkflowViewerProps {
  eventEngine: EventEngine;
}

export function WorkflowViewer({ eventEngine }: WorkflowViewerProps) {
  const coordinator = useMemo(() => new WorkflowCoordinator(), []);
  const [workflows, setWorkflows] = useState<ActiveWorkflow[]>([]);
  const [selectedWf, setSelectedWf] = useState<string | null>(null);
  const [wfFilter, setWfFilter] = useState<string>('all');
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoLog, setDemoLog] = useState<string[]>([]);
  const ruleEngine = useMemo(() => new RuleEngine(ALL_RULES), []);

  useEffect(() => {
    coordinator.connect(eventEngine);
    connectEventEngineToRules(eventEngine, ruleEngine);
    eventEngine.addCascadeRules(buildCascadeRules(ruleEngine));
    return () => coordinator.disconnect();
  }, [coordinator, eventEngine, ruleEngine]);

  const refresh = useCallback(() => {
    setWorkflows([...coordinator.getAllWorkflows()]);
  }, [coordinator]);

  useEffect(() => {
    const interval = setInterval(refresh, 1500);
    return () => clearInterval(interval);
  }, [refresh]);

  const filtered = useMemo(() => {
    if (wfFilter === 'all') return workflows;
    return workflows.filter(w => w.currentState === wfFilter);
  }, [workflows, wfFilter]);

  const allStates = Object.values(PatientState);

  const runDemo = () => {
    if (demoRunning) return;
    setDemoRunning(true);
    setDemoLog([]);

    const patientId = `wf_demo_${Date.now()}`;
    const log: string[] = [];

    const appendLog = (msg: string) => {
      log.push(msg);
      setDemoLog([...log]);
    };

    const wf = coordinator.createWorkflow(patientId, { patientName: 'Demo Patient' });
    appendLog(`📋 Created workflow ${wf.id.slice(0, 12)} for patient ${patientId.slice(0, 12)}`);

    const actor = { id: 'demo_doctor', type: 'clinician' as const, name: 'Dr. Demo', role: 'physician' };
    const patient = { id: patientId, encounterId: `enc_${patientId}`, mrn: 'DEMO-002' };
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    const steps: Array<{ fn: () => void; msg: string }> = [
      { fn: () => eventEngine.emit('encounter.started', { type: 'outpatient' }, { actor, patient }), msg: '🔷 Encounter started → SelfCare' },

      { fn: () => { eventEngine.emit('symptom.recorded', { symptomId: 'cough', name: 'Cough', severity: 8, productive: true, fever: true, redFlags: ['hemoptysis'] }, { actor, patient }); appendLog('⚡ Cascade: evaluate_rules, update_differential, flag_red_flag'); }, msg: '🟡 Symptom recorded (cough, productive, fever)' },

      { fn: () => { const result = coordinator.transitionTo(wf.id, PatientState.Triage); appendLog(result.success ? '➡️ Transitioned to Triage' : `❌ ${result.error}`); }, msg: '🏥 Moving to Triage' },

      { fn: () => eventEngine.emit('vital.recorded', { pulse: 105, temperature: 39.0, systolicBP: 110, diastolicBP: 70, oxygenSaturation: 92, alerts: ['tachycardia', 'hypoxia'] }, { actor, patient }), msg: '❤️ Vitals recorded (tachycardia, hypoxia)' },

      { fn: () => { const result = coordinator.transitionTo(wf.id, PatientState.Consultation); appendLog(result.success ? '➡️ Transitioned to Consultation' : `❌ ${result.error}`); }, msg: '👨‍⚕️ Moving to Consultation' },

      { fn: () => eventEngine.emit('investigation.ordered', { investigationId: 'inv_cxr', name: 'Chest X-ray', priority: 'urgent' }, { actor, patient }), msg: '🔬 CXR ordered (urgent)' },

      { fn: () => { coordinator.transitionTo(wf.id, PatientState.Laboratory); appendLog('➡️ Transitioned to Laboratory'); }, msg: '🧪 Moving to Laboratory' },

      { fn: () => eventEngine.emit('investigation.resulted', { investigationId: 'inv_cxr', name: 'Chest X-ray', result: 'Right lower lobe consolidation' }, { actor, patient }), msg: '📊 CXR resulted: consolidation' },

      { fn: () => { coordinator.transitionTo(wf.id, PatientState.Consultation); appendLog('➡️ Returned to Consultation'); }, msg: '🔄 Back to Consultation' },

      { fn: () => eventEngine.emit('diagnosis.added', { diagnosisId: 'disease_cap', name: 'Community-Acquired Pneumonia', icd10: 'J18.9', confidence: 0.9, notifiable: false }, { actor, patient }), msg: '📝 Diagnosis: CAP (J18.9)' },

      { fn: () => eventEngine.emit('treatment.prescribed', { treatmentId: 'tx_amoxicillin', name: 'Amoxicillin', dose: '500mg', frequency: 'three_times_daily', duration: 7 }, { actor, patient }), msg: '💊 Amoxicillin 500mg TDS x7d prescribed' },

      { fn: () => { coordinator.transitionTo(wf.id, PatientState.Pharmacy); appendLog('➡️ Transitioned to Pharmacy'); }, msg: '💊 Moving to Pharmacy' },

      { fn: () => { coordinator.transitionTo(wf.id, PatientState.Discharge); appendLog('➡️ Transitioned to Discharge'); }, msg: '✅ Moving to Discharge' },

      { fn: () => eventEngine.emit('discharge.ordered', { dischargeSummary: '7 days amoxicillin. Improved. Follow up 2 weeks.' }, { actor, patient }), msg: '📄 Discharge ordered' },

      { fn: () => { coordinator.transitionTo(wf.id, PatientState.FollowUp); appendLog('➡️ Transitioned to FollowUp'); }, msg: '📅 Moving to Follow-up' },

      { fn: () => eventEngine.emit('encounter.completed', { outcome: 'discharged_home' }, { actor, patient }), msg: '✅ Encounter completed' },
    ];

    let i = 0;
    const run = () => {
      if (i < steps.length) {
        const s = steps[i];
        try { s.fn(); } catch {}
        appendLog(s.msg);
        i++;
        setTimeout(run, 1000);
      } else {
        appendLog('🏁 Demo complete');
        setDemoRunning(false);
      }
    };
    run();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={runDemo}
            disabled={demoRunning}
            className="btn-primary text-xs px-4 py-1.5"
            style={{ opacity: demoRunning ? 0.5 : 1 }}
          >
            {demoRunning ? '▶ Running...' : '▶ Run Workflow Demo'}
          </button>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
          </span>
        </div>
        <select className="input w-auto" value={wfFilter} onChange={e => setWfFilter(e.target.value)}>
          <option value="all">All States</option>
          {allStates.map(s => (
            <option key={s} value={s}>{getStateLabel(s)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {filtered.map(wf => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              selected={selectedWf === wf.id}
              onSelect={() => setSelectedWf(selectedWf === wf.id ? null : wf.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="card p-6 flex items-center justify-center h-32">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No workflows match your filter. Run the demo to see a clinical workflow in action.
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 flex flex-col gap-3">
          {selectedWf ? (
            <WorkflowDetailPanel workflow={workflows.find(w => w.id === selectedWf)!} coordinator={coordinator} />
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center h-48 gap-2">
              <div className="text-2xl">🔄</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Select a workflow
              </div>
              <div className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                Click any workflow card to view state machine, transitions, and tasks
              </div>
            </div>
          )}

          {demoLog.length > 0 && (
            <div className="card p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Demo Log
              </div>
              <div className="flex flex-col gap-0.5 overflow-y-auto" style={{ maxHeight: 200 }}>
                {demoLog.map((msg, i) => (
                  <div key={i} className="text-[9px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkflowCard({ workflow, selected, onSelect }: { workflow: ActiveWorkflow; selected: boolean; onSelect: () => void }) {
  const color = STATE_COLORS[workflow.currentState] || 'var(--text-muted)';
  const validNext = getValidTransitions(workflow.currentState);

  return (
    <button
      onClick={onSelect}
      className="card w-full text-left transition-colors"
      style={{
        border: selected ? '1px solid var(--sky-200)' : '1px solid var(--surface-border)',
        background: selected ? 'var(--sky-50)' : 'var(--surface-card)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ background: color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
              {workflow.patientName || workflow.patientId.slice(0, 12)}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${color}15`, color }}>
              {getStateLabel(workflow.currentState)}
            </span>
          </div>
          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
            {workflow.id.slice(0, 12)} · {workflow.tasks.length} tasks · {validNext.length} transitions available
          </div>
          <div className="flex gap-1 mt-1.5">
            {workflow.previousStates.slice(-3).map(s => (
              <span key={s} className="text-[8px] px-1 py-0.5 rounded" style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>
                {getStateLabel(s)}
              </span>
            ))}
            {workflow.previousStates.length > 3 && (
              <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>+{workflow.previousStates.length - 3}</span>
            )}
          </div>
        </div>
        <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
          {Math.round((Date.now() - workflow.createdAt) / 1000)}s
        </div>
      </div>
    </button>
  );
}

function WorkflowDetailPanel({ workflow, coordinator }: { workflow: ActiveWorkflow; coordinator: WorkflowCoordinator }) {
  const validNext = getValidTransitions(workflow.currentState);
  const color = STATE_COLORS[workflow.currentState] || 'var(--text-muted)';

  return (
    <div className="card p-4 flex flex-col gap-3" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            {workflow.patientName || 'Unknown Patient'}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {workflow.id}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 rounded" style={{ background: `${color}10` }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-xs font-medium" style={{ color }}>{getStateLabel(workflow.currentState)}</span>
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
          State History
        </div>
        <div className="flex flex-col gap-1">
          {[workflow.currentState, ...workflow.previousStates.slice().reverse()].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[9px]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATE_COLORS[s] || 'var(--text-muted)' }} />
              <span style={{ color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {getStateLabel(s)}
              </span>
              {i === 0 && <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}>CURRENT</span>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Valid Transitions
        </div>
        <div className="flex flex-wrap gap-1">
          {validNext.map(s => (
            <span
              key={s}
              className="text-[9px] px-2 py-1 rounded cursor-pointer transition-colors"
              style={{
                background: `${STATE_COLORS[s] || 'var(--text-muted)'}15`,
                color: STATE_COLORS[s] || 'var(--text-muted)',
              }}
              onClick={() => coordinator.transitionTo(workflow.id, s)}
            >
              {getStateLabel(s)}
            </span>
          ))}
          {validNext.length === 0 && (
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Terminal state</span>
          )}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Tasks ({workflow.tasks.length})
        </div>
        {workflow.tasks.length === 0 ? (
          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>No tasks assigned</div>
        ) : (
          <div className="flex flex-col gap-1">
            {workflow.tasks.map(t => (
              <div key={t} className="text-[9px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                {t.slice(0, 16)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
        Created: {new Date(workflow.createdAt).toLocaleTimeString()} · Updated: {new Date(workflow.updatedAt).toLocaleTimeString()}
      </div>
    </div>
  );
}
