'use client';
import { useState, useEffect } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { addFollowUp, loadAllEncounters, updateEncounter, type EncounterRecord, type FollowUpRecord } from '@/lib/history-engine/userStorage';

export default function FollowUpPanel({ encounterId }: { encounterId: string }) {
  const [encounter, setEncounter] = useState<EncounterRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'clinical_review' as FollowUpRecord['type'],
    notes: '',
    findings: '',
    outcome: '',
    nextFollowUp: '',
  });

  useEffect(() => {
    const enc = loadAllEncounters().find(e => e.id === encounterId);
    if (enc) setEncounter(enc);
  }, [encounterId]);

  function handleAddFollowUp() {
    const record: FollowUpRecord = {
      id: `fu_${Date.now()}`,
      encounterId,
      date: form.date,
      status: 'pending',
      notes: form.notes,
      findings: form.findings,
      outcome: form.outcome,
    };
    addFollowUp(encounterId, record);
    setEncounter(loadAllEncounters().find(e => e.id === encounterId) || null);
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0], type: 'clinical_review', notes: '', findings: '', outcome: '', nextFollowUp: '' });
  }

  function handleComplete(fuId: string) {
    const enc = loadAllEncounters().find(e => e.id === encounterId);
    if (!enc) return;
    const updatedFU = enc.followUp.map(f =>
      f.id === fuId ? { ...f, status: 'completed' as const } : f
    );
    updateEncounter(encounterId, { followUp: updatedFU });
    setEncounter(loadAllEncounters().find(e => e.id === encounterId) || null);
  }

  if (!encounter) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">Loading...</div>
    );
  }

  const pending = encounter.followUp.filter(f => f.status === 'pending');
  const completed = encounter.followUp.filter(f => f.status === 'completed');
  const totalFU = encounter.followUp.length;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--accent)]">📋 Follow-Up</h2>
          <p className="text-[10px] text-[var(--text-muted)]">{encounter.patientName} — {encounter.provisionalDiagnosis}</p>
        </div>
      </div>

        {/* Stats */}
        <div className="flex gap-3 px-4 py-3 border-b border-[var(--border)]">
          <div className="flex-1 text-center p-2 rounded-lg bg-[var(--bg-primary)]">
            <div className="text-lg font-bold text-[var(--accent)]">{totalFU}</div>
            <div className="text-[9px] text-[var(--text-muted)]">Total</div>
          </div>
          <div className="flex-1 text-center p-2 rounded-lg bg-amber-500/10">
            <div className="text-lg font-bold text-amber-400">{pending.length}</div>
            <div className="text-[9px] text-amber-400/60">Pending</div>
          </div>
          <div className="flex-1 text-center p-2 rounded-lg bg-green-500/10">
            <div className="text-lg font-bold text-green-400">{completed.length}</div>
            <div className="text-[9px] text-green-400/60">Completed</div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {encounter.followUp.length === 0 && !showForm && (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <p className="text-sm">No follow-ups recorded yet.</p>
              <button onClick={() => setShowForm(true)}
                className="mt-3 px-4 py-2 rounded-lg text-xs font-medium bg-[var(--accent-dim)] text-[var(--accent)]">
                + Add Follow-Up
              </button>
            </div>
          )}

          {encounter.followUp.map(fu => (
            <div key={fu.id}
              className={`p-3 rounded-xl border transition-all ${
                fu.status === 'completed'
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-[var(--bg-primary)] border-[var(--border)]'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-[var(--text-primary)]">
                    {(fu.type || 'clinical_review').replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                    fu.status === 'completed'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>{fu.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[var(--text-muted)]">{fu.date}</span>
                  {fu.status === 'pending' && (
                    <button onClick={() => handleComplete(fu.id)}
                      className="text-[9px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20">
                      ✓ Done
                    </button>
                  )}
                </div>
              </div>
              {fu.notes && <p className="text-[11px] text-[var(--text-secondary)] mt-1">{fu.notes}</p>}
              {fu.findings && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Findings: {fu.findings}</p>}
              {fu.outcome && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Outcome: {fu.outcome}</p>}
            </div>
          ))}
        </div>

        {/* Add form */}
        <div className="p-4 border-t border-[var(--border)]">
          {!showForm ? (
            <button onClick={() => setShowForm(true)}
              className="w-full py-2 rounded-lg text-xs font-medium bg-[var(--accent-dim)] text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all">
              + Add Follow-Up
            </button>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="px-2 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)]" />
                <select value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as any })}
                  className="px-2 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)]">
                  <option value="clinical_review">Clinical Review</option>
                  <option value="lab_repeat">Lab Repeat</option>
                  <option value="imaging_repeat">Imaging Repeat</option>
                  <option value="specialist_referral">Specialist Referral</option>
                  <option value="procedure">Procedure</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <input placeholder="Notes" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full px-2 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Findings" value={form.findings}
                  onChange={e => setForm({ ...form, findings: e.target.value })}
                  className="px-2 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
                <input placeholder="Outcome" value={form.outcome}
                  onChange={e => setForm({ ...form, outcome: e.target.value })}
                  className="px-2 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddFollowUp}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">
                  Add
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-500/10 text-[var(--text-secondary)]">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
