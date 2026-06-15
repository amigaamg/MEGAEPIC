'use client';
import { useState, useEffect } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import {
  loadAllEncounters, deleteEncounter, getUserId,
  type EncounterRecord
} from '@/lib/history-engine/userStorage';
import { generatePDF } from '@/lib/history-engine/pdfGenerator';

export default function HistoryDashboard({ onClose }: { onClose: () => void }) {
  const [encounters, setEncounters] = useState<EncounterRecord[]>([]);
  const [userId, setUserId] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setEncounters(loadAllEncounters());
    setUserId(getUserId());
  }, []);

  function refresh() {
    setEncounters(loadAllEncounters());
  }

  function handleDelete(id: string) {
    if (confirm('Delete this encounter permanently?')) {
      deleteEncounter(id);
      refresh();
    }
  }

  function handleLoad(encounter: EncounterRecord) {
    const store = useHistoryStore.getState();
    store.orchestrator.loadState(encounter.state);
    useHistoryStore.setState(store.orchestrator.getState());
    onClose();
  }

  function handleDownloadPDF(encounter: EncounterRecord) {
    const doc = encounter.state.documents.fullDocumentation;
    if (!doc) return;
    generatePDF(
      `Clinical Note - ${encounter.patientName}`,
      doc,
      encounter.patientName,
      new Date(encounter.dateCreated).toLocaleDateString(),
      encounter.id
    );
  }

  const filtered = encounters.filter(e =>
    !search || e.patientName.toLowerCase().includes(search.toLowerCase()) ||
    e.chiefComplaints.toLowerCase().includes(search.toLowerCase()) ||
    e.provisionalDiagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-[95vw] max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--accent)]">History Dashboard</h2>
            <p className="text-[10px] text-[var(--text-muted)]">User: {userId.slice(0, 12)}...</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl">&times;</button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-[var(--border)]">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search encounters by patient name, complaint, or diagnosis..."
            className="w-full px-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm">No encounters saved yet.</p>
              <p className="text-xs mt-1">Complete a history assessment and save it to see it here.</p>
            </div>
          )}
          {filtered.map(enc => (
            <div key={enc.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all group">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center text-sm shrink-0">
                {enc.profile === 'newborn' ? '👶' : enc.profile === 'pediatric' ? '🧒' : enc.profile === 'obstetric' ? '🤰' : '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{enc.patientName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-dim)] text-[var(--accent)]">{enc.profile}</span>
                  {enc.completed && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Done</span>}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {enc.chiefComplaints || 'No complaints'} → {enc.provisionalDiagnosis}
                </div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
                  {new Date(enc.dateCreated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {enc.followUp.length > 0 && ` • ${enc.followUp.length} follow-up(s)`}
                </div>
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleLoad(enc)}
                  className="px-2 py-1 text-[10px] rounded-lg bg-[var(--accent-dim)] text-[var(--accent)] hover:bg-[var(--accent)]/20">
                  Open
                </button>
                <button onClick={() => handleDownloadPDF(enc)}
                  className="px-2 py-1 text-[10px] rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                  PDF
                </button>
                <button onClick={() => handleDelete(enc.id)}
                  className="px-2 py-1 text-[10px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)] text-center text-[9px] text-[var(--text-muted)]">
          {encounters.length} encounter(s) saved locally on this device
        </div>
      </div>
    </div>
  );
}
