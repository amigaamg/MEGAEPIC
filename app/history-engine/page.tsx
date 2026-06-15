'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { getSectionsForProfile } from '@/lib/history-engine/patientProfileEngine';
import { SectionRenderer } from '@/components/history-engine/SectionRenderer';
import LiveDocumentation from '@/components/history-engine/LiveDocumentation';
import ThemeToggle from '@/components/history-engine/ThemeToggle';
import HistoryDashboard from '@/components/history-engine/HistoryDashboard';
import DocumentEditor from '@/components/history-engine/DocumentEditor';
import EducationPanel from '@/components/history-engine/EducationPanel';
import FollowUpPanel from '@/components/history-engine/FollowUpPanel';
import { applyTheme, getStoredTheme } from '@/lib/history-engine/themeEngine';
import { autoSaveState, getUserId, loadLastState } from '@/lib/history-engine/userStorage';

export default function HistoryEnginePage() {
  const activeSection = useHistoryStore(s => s.activeSection);
  const completedSections = useHistoryStore(s => s.completedSections);
  const setActiveSection = useHistoryStore(s => s.setActiveSection);
  const completeSection = useHistoryStore(s => s.completeSection);
  const reset = useHistoryStore(s => s.reset);
  const profile = useHistoryStore(s => s.biodata.profile);
  const biodata = useHistoryStore(s => s.biodata);
  const provisionalDiagnosis = useHistoryStore(s => s.provisionalDiagnosis);
  const encounterId = useHistoryStore(s => s.encounterId || '');
  const sectionHistory = useHistoryStore(s => s);

  const [showDashboard, setShowDashboard] = useState(false);
  const [showDocument, setShowDocument] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Compute encounter ID from state
  const encId = useMemo(() => {
    return encounterId || `enc_${biodata.name || 'unnamed'}_${Date.now()}`;
  }, [encounterId, biodata.name]);

  const sections = useMemo(() => getSectionsForProfile(profile), [profile]);

  // Auto-save every state change
  useEffect(() => {
    const state = useHistoryStore.getState();
    autoSaveState(state);
  }, [
    activeSection, completedSections, biodata,
    sectionHistory.chiefComplaints?.length,
    sectionHistory.hpi,
    sectionHistory.featureRegistry,
  ]);

  // Theme on mount
  useEffect(() => {
    applyTheme(getStoredTheme());
    document.title = 'AMEXAN — Clinical History Engine';
    // Attempt to restore last session
    try {
      const lastState = loadLastState();
      if (lastState) {
        const store = useHistoryStore.getState();
        store.orchestrator.loadState(lastState);
        useHistoryStore.setState(store.orchestrator.getState());
      }
    } catch {}
  }, []);

  const currentIdx = sections.findIndex(s => s.id === activeSection);
  const isCurrentCompleted = completedSections.includes(activeSection);

  function handleComplete() {
    completeSection(activeSection);
  }

  function handleReset() {
    if (confirmReset) {
      reset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  }

  const profileLabel = profile === 'newborn' ? 'Newborn' :
    profile === 'pediatric' ? 'Pediatrics' :
    profile === 'obstetric' ? 'Obstetrics' :
    profile === 'gynecologic' ? 'Gynecology' : 'Adult';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[var(--bg-secondary)]/95 backdrop-blur border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm font-bold text-[var(--accent)] tracking-wider">AMEXAN</a>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-xs text-[var(--text-secondary)]">{profileLabel} History</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setShowDashboard(true)}
              className="text-[10px] px-2 py-1 rounded-lg bg-[var(--accent-dim)] text-[var(--accent)] hover:bg-[var(--accent)]/20">
              📋 History
            </button>
            <button onClick={() => setShowDocument(true)}
              className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
              📄 Doc
            </button>
            {provisionalDiagnosis && (
              <button onClick={() => setShowEducation(true)}
                className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">
                📚 Learn
              </button>
            )}
            <button onClick={() => setShowFollowUp(true)}
              className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
              📋 FU
            </button>
            {profile !== 'adult' && (
              <span className="text-[9px] text-amber-400/60 bg-amber-400/10 px-2 py-0.5 rounded">
                {profile === 'newborn' ? '0-28d' :
                 profile === 'pediatric' ? '28d-12yr' :
                 profile === 'obstetric' ? 'Pregnant' :
                 profile === 'gynecologic' ? 'Female 12+' : ''}
              </span>
            )}
            <span className="text-[10px] text-[var(--text-muted)]">
              {completedSections.length}/{sections.length}
            </span>
            <button onClick={handleReset}
              className={`text-[10px] px-2 py-0.5 rounded underline transition-all ${confirmReset ? 'bg-red-500/20 text-red-400' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
              {confirmReset ? 'Confirm?' : 'New'}
            </button>
          </div>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {sections.map((sec, i) => {
            const isActive = activeSection === sec.id;
            const isComplete = completedSections.includes(sec.id);
            const prevComplete = i === 0 || completedSections.includes(sections[i - 1].id);
            const isAvailable = prevComplete || isComplete || isActive;

            return (
              <button key={sec.id} onClick={() => isAvailable && setActiveSection(sec.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)]/30'
                    : isComplete
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : isAvailable
                        ? 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-transparent'
                        : 'text-[var(--text-muted)]/30 border border-transparent cursor-not-allowed'
                }`}>
                <span>{isComplete ? '✓' : sec.icon}</span>
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Left — Form */}
          <div className="flex-1 min-w-0">
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 md:p-6">
              <SectionRenderer sectionId={activeSection} profile={profile} />
              {/* Navigation */}
              <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                {currentIdx > 0 && (
                  <button onClick={() => setActiveSection(sections[currentIdx - 1].id)}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors">
                    ← {sections[currentIdx - 1]?.label}
                  </button>
                )}
                <div className="flex-1" />
                {!isCurrentCompleted && (
                  <button onClick={handleComplete}
                    className="px-5 py-2 bg-[var(--accent)] hover:brightness-110 text-white text-sm font-medium rounded-lg transition-all">
                    ✓ Complete & Continue
                  </button>
                )}
                {isCurrentCompleted && currentIdx < sections.length - 1 && (
                  <button onClick={() => setActiveSection(sections[currentIdx + 1].id)}
                    className="px-5 py-2 bg-[var(--accent-dim)] text-[var(--accent)] hover:bg-[var(--accent)]/20 text-sm font-medium rounded-lg transition-colors">
                    Next: {sections[currentIdx + 1].label} →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right — Live Documentation */}
          <div className="w-80 hidden lg:block">
            <div className="sticky top-20 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4"
              style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <LiveDocumentation />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDashboard && <HistoryDashboard onClose={() => setShowDashboard(false)} />}
      {showDocument && <DocumentEditor onClose={() => setShowDocument(false)} />}
      {showEducation && <EducationPanel onClose={() => setShowEducation(false)} />}
      {showFollowUp && <FollowUpPanel encounterId={encId} onClose={() => setShowFollowUp(false)} />}
    </div>
  );
}
