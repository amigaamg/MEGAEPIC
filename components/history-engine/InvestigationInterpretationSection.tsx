'use client';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

const CATEGORIES = ['lab', 'imaging', 'special'] as const;
const PRIORITIES = ['routine', 'urgent', 'stat'] as const;
const FLAGS = ['high', 'low', 'normal'] as const;

interface PlanFormState {
  name: string;
  category: (typeof CATEGORIES)[number];
  reason: string;
  priority: (typeof PRIORITIES)[number];
}

interface InterpFormState {
  test: string;
  result: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  flag: (typeof FLAGS)[number];
  interpretation: string;
}

const emptyPlanForm = (): PlanFormState => ({
  name: '',
  category: 'lab',
  reason: '',
  priority: 'routine',
});

const emptyInterpForm = (): InterpFormState => ({
  test: '',
  result: '',
  unit: '',
  referenceRange: '',
  isAbnormal: false,
  flag: 'normal',
  interpretation: '',
});

export default function InvestigationInterpretationSection() {
  const investigationPlan = useHistoryStore(s => s.investigationPlan);
  const investigationInterpretation = useHistoryStore(s => s.investigationInterpretation);
  const setInvestigationPlan = useHistoryStore(s => s.setInvestigationPlan);
  const setInvestigationInterpretation = useHistoryStore(s => s.setInvestigationInterpretation);

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState<PlanFormState>(emptyPlanForm());
  const [showInterpForm, setShowInterpForm] = useState(false);
  const [interpForm, setInterpForm] = useState<InterpFormState>(emptyInterpForm());
  const [overallInterp, setOverallInterp] = useState(investigationInterpretation.overallInterpretation);

  const addInvestigation = () => {
    if (!planForm.name.trim()) return;
    const item = {
      id: `inv_${Date.now()}`,
      ...planForm,
    };
    setInvestigationPlan({
      investigations: [...investigationPlan.investigations, item as any],
      notes: investigationPlan.notes,
    });
    setPlanForm(emptyPlanForm());
    setShowPlanForm(false);
  };

  const removeInvestigation = (id: string) => {
    setInvestigationPlan({
      investigations: investigationPlan.investigations.filter(i => (i as any).id !== id),
      notes: investigationPlan.notes,
    });
  };

  const addInterpretation = () => {
    if (!interpForm.test.trim()) return;
    const item = {
      id: `interp_${Date.now()}`,
      ...interpForm,
    };
    setInvestigationInterpretation({
      items: [...investigationInterpretation.items, item as any],
      overallInterpretation: overallInterp,
    });
    setInterpForm(emptyInterpForm());
    setShowInterpForm(false);
  };

  const removeInterpretation = (id: string) => {
    setInvestigationInterpretation({
      items: investigationInterpretation.items.filter(i => (i as any).id !== id),
      overallInterpretation: overallInterp,
    });
  };

  const categoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      lab: 'bg-blue-500/20 text-blue-400',
      imaging: 'bg-purple-500/20 text-purple-400',
      special: 'bg-orange-500/20 text-orange-400',
    };
    return colors[cat] || 'bg-gray-500/20 text-gray-400';
  };

  const priorityBadge = (pri: string) => {
    const colors: Record<string, string> = {
      routine: 'bg-green-500/20 text-green-400',
      urgent: 'bg-yellow-500/20 text-yellow-400',
      stat: 'bg-red-500/20 text-red-400',
    };
    return colors[pri] || 'bg-gray-500/20 text-gray-400';
  };

  const flagBadge = (flag: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-500/20 text-red-400',
      low: 'bg-yellow-500/20 text-yellow-400',
      normal: 'bg-green-500/20 text-green-400',
    };
    return colors[flag] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* ── INVESTIGATION PLAN ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 bg-teal-400 rounded-full" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Investigation Plan</h2>
        </div>

        {investigationPlan.investigations.length > 0 && (
          <div className="space-y-2 mb-3">
            {investigationPlan.investigations.map((item, idx) => {
              const d = item as any;
              return (
                <div key={d.id || idx} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm text-[var(--text-primary)] font-medium truncate">{d.name || d.rationale}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${categoryBadge(d.category)}`}>{d.category}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityBadge(d.priority)}`}>{d.priority}</span>
                    {d.reason && <span className="text-xs text-[var(--text-muted)] truncate">{d.reason}</span>}
                  </div>
                  <button onClick={() => removeInvestigation(d.id || idx)} className="text-xs text-red-400 hover:text-red-300 ml-2 shrink-0">Remove</button>
                </div>
              );
            })}
          </div>
        )}

        {showPlanForm ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 space-y-2">
            <input type="text" value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Investigation name" className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <select value={planForm.category} onChange={e => setPlanForm(f => ({ ...f, category: e.target.value as any }))}
                className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <select value={planForm.priority} onChange={e => setPlanForm(f => ({ ...f, priority: e.target.value as any }))}
                className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none">
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <input type="text" value={planForm.reason} onChange={e => setPlanForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Reason for investigation" className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={addInvestigation} disabled={!planForm.name.trim()}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-medium rounded-lg transition-colors">Add</button>
              <button onClick={() => { setShowPlanForm(false); setPlanForm(emptyPlanForm()); }}
                className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowPlanForm(true)}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors">+ Add Investigation</button>
        )}
      </div>

      {/* ── INVESTIGATION INTERPRETATION ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 bg-teal-400 rounded-full" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Investigation Interpretation</h2>
        </div>

        {investigationInterpretation.items.length > 0 && (
          <div className="space-y-2 mb-3">
            {investigationInterpretation.items.map((item, idx) => {
              const d = item as any;
              return (
                <div key={d.id || idx} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--text-primary)] font-medium">{d.test || d.investigationName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${flagBadge(d.flag || (d.isAbnormal ? 'high' : 'normal'))}`}>
                        {d.flag || (d.isAbnormal ? 'Abnormal' : 'Normal')}
                      </span>
                    </div>
                    <button onClick={() => removeInterpretation(d.id || idx)} className="text-xs text-red-400 hover:text-red-300 shrink-0">Remove</button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                    <span>Result: <span className="text-[var(--text-primary)]">{d.result}</span></span>
                    {d.unit && <span>Unit: <span className="text-[var(--text-primary)]">{d.unit}</span></span>}
                    {d.referenceRange && <span>Ref: <span className="text-[var(--text-primary)]">{d.referenceRange}</span></span>}
                  </div>
                  {d.interpretation && <p className="text-xs text-[var(--text-muted)]">{d.interpretation}</p>}
                </div>
              );
            })}
          </div>
        )}

        {showInterpForm ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={interpForm.test} onChange={e => setInterpForm(f => ({ ...f, test: e.target.value }))}
                placeholder="Test name" className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none" />
              <input type="text" value={interpForm.result} onChange={e => setInterpForm(f => ({ ...f, result: e.target.value }))}
                placeholder="Result" className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={interpForm.unit} onChange={e => setInterpForm(f => ({ ...f, unit: e.target.value }))}
                placeholder="Unit (e.g. mg/dL)" className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none" />
              <input type="text" value={interpForm.referenceRange} onChange={e => setInterpForm(f => ({ ...f, referenceRange: e.target.value }))}
                placeholder="Reference range" className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <input type="checkbox" checked={interpForm.isAbnormal} onChange={e => setInterpForm(f => ({ ...f, isAbnormal: e.target.checked }))}
                  className="rounded accent-teal-500" />
                Abnormal
              </label>
              <select value={interpForm.flag} onChange={e => setInterpForm(f => ({ ...f, flag: e.target.value as any }))}
                className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none">
                {FLAGS.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <textarea value={interpForm.interpretation} onChange={e => setInterpForm(f => ({ ...f, interpretation: e.target.value }))}
              placeholder="Interpretation" rows={2} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none" />
            <div className="flex gap-2">
              <button onClick={addInterpretation} disabled={!interpForm.test.trim()}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-medium rounded-lg transition-colors">Add</button>
              <button onClick={() => { setShowInterpForm(false); setInterpForm(emptyInterpForm()); }}
                className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowInterpForm(true)}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors">+ Add Interpretation</button>
        )}

        <textarea value={overallInterp} onChange={e => {
          setOverallInterp(e.target.value);
          setInvestigationInterpretation({
            items: investigationInterpretation.items,
            overallInterpretation: e.target.value,
          });
        }}
          placeholder="Overall interpretation of all investigations..."
          rows={3} className="mt-3 w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none" />
      </div>
    </div>
  );
}
