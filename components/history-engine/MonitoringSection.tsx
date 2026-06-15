'use client';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import type { MonitoringParameter, ComplicationPrevention } from '@/lib/history-engine/types';

const ROUTES = ['oral', 'iv', 'im', 'sc', 'topical', 'inhalation', 'rectal', 'other'] as const;
const TREATMENT_CATEGORIES = ['medication', 'procedure', 'iv_fluid', 'oxygen', 'other'] as const;
const DISPOSITIONS = ['home', 'admit', 'icu', 'refer', 'transfer', 'other'] as const;

interface TreatmentFormState {
  name: string;
  dose: string;
  route: (typeof ROUTES)[number];
  frequency: string;
  duration: string;
  category: (typeof TREATMENT_CATEGORIES)[number];
  notes: string;
}

interface VitalFormState {
  vital: string;
  frequency: string;
  duration: string;
}

interface LabMonitorFormState {
  test: string;
  frequency: string;
  duration: string;
}

interface ComplicationFormState {
  prevention: string;
  intervention: string;
}

const emptyTreatmentForm = (): TreatmentFormState => ({
  name: '', dose: '', route: 'oral', frequency: '', duration: '', category: 'medication', notes: '',
});

const emptyVitalForm = (): VitalFormState => ({ vital: '', frequency: '', duration: '' });
const emptyLabForm = (): LabMonitorFormState => ({ test: '', frequency: '', duration: '' });
const emptyComplicationForm = (): ComplicationFormState => ({ prevention: '', intervention: '' });

export default function MonitoringSection() {
  const treatmentPlan = useHistoryStore(s => s.treatmentPlan);
  const monitoringPlan = useHistoryStore(s => s.monitoringPlan);
  const setTreatmentPlan = useHistoryStore(s => s.setTreatmentPlan);
  const setMonitoringPlan = useHistoryStore(s => s.setMonitoringPlan);

  // ── Treatment form state ──
  const [showTxForm, setShowTxForm] = useState(false);
  const [txForm, setTxForm] = useState<TreatmentFormState>(emptyTreatmentForm());
  const [disposition, setDisposition] = useState(treatmentPlan.disposition);
  const [dispositionRationale, setDispositionRationale] = useState(treatmentPlan.dispositionRationale);
  const [followUp, setFollowUp] = useState(treatmentPlan.followUp);

  // ── Monitoring form state ──
  const [showVitalForm, setShowVitalForm] = useState(false);
  const [vitalForm, setVitalForm] = useState<VitalFormState>(emptyVitalForm());
  const [showLabForm, setShowLabForm] = useState(false);
  const [labForm, setLabForm] = useState<LabMonitorFormState>(emptyLabForm());
  const [showCompForm, setShowCompForm] = useState(false);
  const [compForm, setCompForm] = useState<ComplicationFormState>(emptyComplicationForm());
  const [escalationCriteria, setEscalationCriteria] = useState(monitoringPlan.escalationCriteria);
  const [reviewPlan, setReviewPlan] = useState(monitoringPlan.reviewPlan);

  // ── Treatment handlers ──
  const addTreatment = () => {
    if (!txForm.name.trim()) return;
    const item = { id: `tx_${Date.now()}`, ...txForm };
    setTreatmentPlan({
      items: [...treatmentPlan.items, item as any],
      followUp,
      disposition: disposition as any,
      dispositionRationale,
    });
    setTxForm(emptyTreatmentForm());
    setShowTxForm(false);
  };

  const removeTreatment = (id: string) => {
    setTreatmentPlan({
      items: treatmentPlan.items.filter(i => (i as any).id !== id),
      followUp,
      disposition: disposition as any,
      dispositionRationale,
    });
  };

  const updateDisposition = (val: string) => {
    setDisposition(val as any);
    setTreatmentPlan({
      items: treatmentPlan.items,
      followUp,
      disposition: val as any,
      dispositionRationale,
    });
  };

  const updateDispositionRationale = (val: string) => {
    setDispositionRationale(val);
    setTreatmentPlan({
      items: treatmentPlan.items,
      followUp,
      disposition: disposition as any,
      dispositionRationale: val,
    });
  };

  const updateFollowUp = (val: string) => {
    setFollowUp(val);
    setTreatmentPlan({
      items: treatmentPlan.items,
      followUp: val,
      disposition: disposition as any,
      dispositionRationale,
    });
  };

  // ── Monitoring handlers ──
  const addVital = () => {
    if (!vitalForm.vital.trim()) return;
    const param: MonitoringParameter = {
      id: `vital_${Date.now()}`,
      parameter: vitalForm.vital.trim(),
      frequency: vitalForm.frequency,
      target: vitalForm.duration,
      rationale: '',
    };
    setMonitoringPlan({
      ...monitoringPlan,
      vitalMonitoring: [...monitoringPlan.vitalMonitoring, param],
    });
    setVitalForm(emptyVitalForm());
    setShowVitalForm(false);
  };

  const removeVital = (id: string) => {
    setMonitoringPlan({
      ...monitoringPlan,
      vitalMonitoring: monitoringPlan.vitalMonitoring.filter(v => v.id !== id),
    });
  };

  const addLabMonitor = () => {
    if (!labForm.test.trim()) return;
    const param: MonitoringParameter = {
      id: `lab_${Date.now()}`,
      parameter: labForm.test.trim(),
      frequency: labForm.frequency,
      target: labForm.duration,
      rationale: '',
    };
    setMonitoringPlan({
      ...monitoringPlan,
      labMonitoring: [...monitoringPlan.labMonitoring, param],
    });
    setLabForm(emptyLabForm());
    setShowLabForm(false);
  };

  const removeLabMonitor = (id: string) => {
    setMonitoringPlan({
      ...monitoringPlan,
      labMonitoring: monitoringPlan.labMonitoring.filter(l => l.id !== id),
    });
  };

  const addComplication = () => {
    if (!compForm.prevention.trim()) return;
    const item: ComplicationPrevention = {
      id: `comp_${Date.now()}`,
      measure: compForm.prevention.trim(),
      rationale: compForm.intervention,
    };
    setMonitoringPlan({
      ...monitoringPlan,
      complicationPrevention: [...monitoringPlan.complicationPrevention, item],
    });
    setCompForm(emptyComplicationForm());
    setShowCompForm(false);
  };

  const removeComplication = (id: string) => {
    setMonitoringPlan({
      ...monitoringPlan,
      complicationPrevention: monitoringPlan.complicationPrevention.filter(c => c.id !== id),
    });
  };

  const inputClass = "w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none";
  const selectClass = "bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none";
  const labelClass = "text-xs text-[var(--text-secondary)] mb-1 block";
  const addBtnClass = "px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-medium rounded-lg transition-colors";
  const cancelBtnClass = "px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
  const removeBtnClass = "text-xs text-red-400 hover:text-red-300 shrink-0";

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════ */}
      {/* TREATMENT PLAN                          */}
      {/* ═══════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 bg-teal-400 rounded-full" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Treatment Plan</h2>
        </div>

        {treatmentPlan.items.length > 0 && (
          <div className="space-y-2 mb-3">
            {treatmentPlan.items.map((item, idx) => {
              const d = item as any;
              return (
                <div key={d.id || idx} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-primary)] font-medium">{d.name || d.intervention}</span>
                    <button onClick={() => removeTreatment(d.id || idx)} className={removeBtnClass}>Remove</button>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-[var(--text-secondary)]">
                    {d.dose && <span>Dose: <span className="text-[var(--text-primary)]">{d.dose}</span></span>}
                    {d.route && <span>Route: <span className="text-[var(--text-primary)]">{d.route}</span></span>}
                    {d.frequency && <span>Freq: <span className="text-[var(--text-primary)]">{d.frequency}</span></span>}
                    {d.duration && <span>Duration: <span className="text-[var(--text-primary)]">{d.duration}</span></span>}
                    {d.category && <span>Category: <span className="text-[var(--text-primary)]">{d.category}</span></span>}
                  </div>
                  {(d.notes || d.rationale) && <p className="text-xs text-[var(--text-muted)] mt-1">{d.notes || d.rationale}</p>}
                </div>
              );
            })}
          </div>
        )}

        {showTxForm ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 space-y-2">
            <input type="text" value={txForm.name} onChange={e => setTxForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Treatment name" className={inputClass} />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={txForm.dose} onChange={e => setTxForm(f => ({ ...f, dose: e.target.value }))}
                placeholder="Dose (e.g. 500mg)" className={inputClass} />
              <select value={txForm.route} onChange={e => setTxForm(f => ({ ...f, route: e.target.value as any }))}
                className={selectClass}>
                {ROUTES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={txForm.frequency} onChange={e => setTxForm(f => ({ ...f, frequency: e.target.value }))}
                placeholder="Frequency (e.g. q8h)" className={inputClass} />
              <input type="text" value={txForm.duration} onChange={e => setTxForm(f => ({ ...f, duration: e.target.value }))}
                placeholder="Duration (e.g. 7 days)" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={txForm.category} onChange={e => setTxForm(f => ({ ...f, category: e.target.value as any }))}
                className={selectClass}>
                {TREATMENT_CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <textarea value={txForm.notes} onChange={e => setTxForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notes" rows={2} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none" />
            <div className="flex gap-2">
              <button onClick={addTreatment} disabled={!txForm.name.trim()} className={addBtnClass}>Add</button>
              <button onClick={() => { setShowTxForm(false); setTxForm(emptyTreatmentForm()); }} className={cancelBtnClass}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowTxForm(true)}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors">+ Add Treatment</button>
        )}

        {/* ── Disposition & Follow-up ── */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Disposition</label>
            <select value={disposition} onChange={e => updateDisposition(e.target.value)} className={selectClass + ' w-full'}>
              {DISPOSITIONS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1).replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Follow-up</label>
            <input type="text" value={followUp} onChange={e => updateFollowUp(e.target.value)}
              placeholder="e.g. Review in 2 weeks" className={inputClass} />
          </div>
        </div>
        <div className="mt-2">
          <label className={labelClass}>Disposition Rationale</label>
          <textarea value={dispositionRationale} onChange={e => updateDispositionRationale(e.target.value)}
            placeholder="Why this disposition was chosen..." rows={2} className={inputClass + ' resize-none'} />
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* MONITORING PLAN                        */}
      {/* ═══════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 bg-teal-400 rounded-full" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Monitoring Plan</h2>
        </div>

        {/* ── Vital Monitoring ── */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Vital Monitoring</h3>
          {monitoringPlan.vitalMonitoring.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {monitoringPlan.vitalMonitoring.map(v => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[var(--text-primary)] font-medium">{v.parameter}</span>
                    <span className="text-[var(--text-muted)]">{v.frequency}</span>
                    {v.target && <span className="text-[var(--text-muted)]">× {v.target}</span>}
                  </div>
                  <button onClick={() => removeVital(v.id)} className={removeBtnClass}>Remove</button>
                </div>
              ))}
            </div>
          )}
          {showVitalForm ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 space-y-2">
              <input type="text" value={vitalForm.vital} onChange={e => setVitalForm(f => ({ ...f, vital: e.target.value }))}
                placeholder="Vital parameter (e.g. BP, HR, SpO₂)" className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={vitalForm.frequency} onChange={e => setVitalForm(f => ({ ...f, frequency: e.target.value }))}
                  placeholder="Frequency (e.g. q4h)" className={inputClass} />
                <input type="text" value={vitalForm.duration} onChange={e => setVitalForm(f => ({ ...f, duration: e.target.value }))}
                  placeholder="Duration (e.g. 24h)" className={inputClass} />
              </div>
              <div className="flex gap-2">
                <button onClick={addVital} disabled={!vitalForm.vital.trim()} className={addBtnClass}>Add</button>
                <button onClick={() => { setShowVitalForm(false); setVitalForm(emptyVitalForm()); }} className={cancelBtnClass}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowVitalForm(true)} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">+ Add Vital</button>
          )}
        </div>

        {/* ── Lab Monitoring ── */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Lab Monitoring</h3>
          {monitoringPlan.labMonitoring.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {monitoringPlan.labMonitoring.map(l => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[var(--text-primary)] font-medium">{l.parameter}</span>
                    <span className="text-[var(--text-muted)]">{l.frequency}</span>
                    {l.target && <span className="text-[var(--text-muted)]">× {l.target}</span>}
                  </div>
                  <button onClick={() => removeLabMonitor(l.id)} className={removeBtnClass}>Remove</button>
                </div>
              ))}
            </div>
          )}
          {showLabForm ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 space-y-2">
              <input type="text" value={labForm.test} onChange={e => setLabForm(f => ({ ...f, test: e.target.value }))}
                placeholder="Lab test (e.g. CBC, Creatinine)" className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={labForm.frequency} onChange={e => setLabForm(f => ({ ...f, frequency: e.target.value }))}
                  placeholder="Frequency (e.g. daily)" className={inputClass} />
                <input type="text" value={labForm.duration} onChange={e => setLabForm(f => ({ ...f, duration: e.target.value }))}
                  placeholder="Duration (e.g. 3 days)" className={inputClass} />
              </div>
              <div className="flex gap-2">
                <button onClick={addLabMonitor} disabled={!labForm.test.trim()} className={addBtnClass}>Add</button>
                <button onClick={() => { setShowLabForm(false); setLabForm(emptyLabForm()); }} className={cancelBtnClass}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowLabForm(true)} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">+ Add Lab</button>
          )}
        </div>

        {/* ── Complication Prevention ── */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Complication Prevention</h3>
          {monitoringPlan.complicationPrevention.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {monitoringPlan.complicationPrevention.map(c => (
                <div key={c.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-primary)] font-medium">{c.measure}</span>
                    <button onClick={() => removeComplication(c.id)} className={removeBtnClass}>Remove</button>
                  </div>
                  {c.rationale && <p className="text-xs text-[var(--text-muted)] mt-0.5">{c.rationale}</p>}
                </div>
              ))}
            </div>
          )}
          {showCompForm ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 space-y-2">
              <input type="text" value={compForm.prevention} onChange={e => setCompForm(f => ({ ...f, prevention: e.target.value }))}
                placeholder="Prevention measure" className={inputClass} />
              <textarea value={compForm.intervention} onChange={e => setCompForm(f => ({ ...f, intervention: e.target.value }))}
                placeholder="Intervention if complication occurs" rows={2} className={inputClass + ' resize-none'} />
              <div className="flex gap-2">
                <button onClick={addComplication} disabled={!compForm.prevention.trim()} className={addBtnClass}>Add</button>
                <button onClick={() => { setShowCompForm(false); setCompForm(emptyComplicationForm()); }} className={cancelBtnClass}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCompForm(true)} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">+ Add Prevention</button>
          )}
        </div>

        {/* ── Escalation Criteria ── */}
        <div className="mb-3">
          <label className={labelClass}>Escalation Criteria</label>
          <textarea value={escalationCriteria} onChange={e => {
            setEscalationCriteria(e.target.value);
            setMonitoringPlan({ ...monitoringPlan, escalationCriteria: e.target.value });
          }}
            placeholder="When to escalate care (e.g. SpO₂ <90%, HR >120, altered consciousness)..."
            rows={3} className={inputClass + ' resize-none'} />
        </div>

        {/* ── Review Plan ── */}
        <div>
          <label className={labelClass}>Review Plan</label>
          <textarea value={reviewPlan} onChange={e => {
            setReviewPlan(e.target.value);
            setMonitoringPlan({ ...monitoringPlan, reviewPlan: e.target.value });
          }}
            placeholder="When and how to review (e.g. clinical review in 24h, repeat imaging in 48h)..."
            rows={3} className={inputClass + ' resize-none'} />
        </div>
      </div>
    </div>
  );
}
