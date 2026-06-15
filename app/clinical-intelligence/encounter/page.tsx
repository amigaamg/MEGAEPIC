'use client';
import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { SectionRenderer } from '@/components/history-engine/SectionRenderer';
import { getAllSymptoms, aggregateDifferentials } from '@/lib/history-engine/symptomLibrary';
import { enrichWithKgDifferentials } from '@/lib/history-engine/kgDifferentialBridge';
import { getInvestigationsForDiseases } from '@/lib/history-engine/investigations/investigationRegistry';
import { getTreatmentsForDiseases } from '@/lib/history-engine/treatment/treatmentRegistry';
import { getEducation } from '@/lib/history-engine/educationRegistry';
import { generateDocuments, type DocumentInput } from '@/lib/history-engine/documentGenerator';
import { HistoryOrchestrator } from '@/lib/history-engine/historyOrchestrator';
import { PhaseNavigation, type PhaseDef } from '@/components/clinical-intelligence/PhaseNavigation';
import {
  DDXPhaseView, InvestigationsPhaseView, TreatmentPhaseView,
  DocumentationPhaseView, IntelligenceSidebar,
} from '@/components/clinical-intelligence/EncounterPhases';
import { LoadingState, ErrorState, EmptyState } from '@/components/clinical-intelligence/States';
import { saveEncounter, loadEncounter, completeEncounter } from '@/lib/history-engine/encounterPersistence';

const PHASES: PhaseDef[] = [
  { id: 'registration', label: 'Registration', icon: '📋' },
  { id: 'chief_complaint', label: 'Chief Complaint', icon: '🩺' },
  { id: 'hpi', label: 'HPI & SOCRATES', icon: '💬' },
  { id: 'past_history', label: 'Past History', icon: '📜' },
  { id: 'examination', label: 'Examination', icon: '🔬' },
  { id: 'ddx', label: 'Differential DX', icon: '🧠' },
  { id: 'investigations', label: 'Investigations', icon: '🧪' },
  { id: 'treatment', label: 'Treatment', icon: '💊' },
  { id: 'documentation', label: 'Documentation', icon: '📄' },
];

const SECTION_MAP: Record<string, string> = {
  registration: 'biodata',
  chief_complaint: 'chief_complaints',
  hpi: 'hpi',
  past_history: 'past_history',
  examination: 'general_exam',
  ddx: 'clinical_reasoning',
};

function useEncounterPersistence() {
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const save = useCallback(async (state: any) => {
    setIsSaving(true);
    try {
      const id = await saveEncounter(state, encounterId || undefined, state.biodata?.name);
      if (!encounterId) setEncounterId(id);
      setLastSaved(Date.now());
    } catch (err: any) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [encounterId]);

  const load = useCallback(async (id: string) => {
    try {
      const snap = await loadEncounter(id);
      if (snap) {
        setEncounterId(id);
        return snap.storeState;
      }
      setLoadError('Encounter not found.');
      return null;
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load encounter.');
      return null;
    }
  }, []);

  const complete = useCallback(async () => {
    if (encounterId) {
      await completeEncounter(encounterId);
    }
  }, [encounterId]);

  return { encounterId, isSaving, lastSaved, loadError, save, load, complete };
}

export default function UnifiedEncounterPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profile] = useState('adult' as any);
  const [activePhase, setActivePhase] = useState('registration');
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const store = useHistoryStore();
  const storeState = useHistoryStore(s => ({
    biodata: s.biodata,
    chiefComplaints: s.chiefComplaints,
    featureRegistry: s.featureRegistry,
    ddx: s.ddx,
    completedSections: s.completedSections,
    activeSection: s.activeSection,
  }));

  useEffect(() => {
    // Load from URL param if present
    const params = new URLSearchParams(window.location.search);
    const encounterId = params.get('id');
    if (encounterId) {
      loadEncounter(encounterId).then(snap => {
        if (snap?.storeState) {
          const state = snap.storeState;
          if (state.biodata) useHistoryStore.getState().setBiodata(state.biodata);
          if (state.completedSections) {
            state.completedSections.forEach((s: string) => {
              if (!useHistoryStore.getState().completedSections.includes(s)) {
                useHistoryStore.getState().completeSection(s);
              }
            });
          }
        }
        setIsLoading(false);
      }).catch(err => {
        setLoadError(err.message);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Auto-save on state changes
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(async () => {
      try {
        const fullState = useHistoryStore.getState();
        const partialState = {
          biodata: fullState.biodata,
          chiefComplaints: fullState.chiefComplaints,
          completedSections: fullState.completedSections,
        };
        const params = new URLSearchParams(window.location.search);
        const existingId = params.get('id');
        const id = await saveEncounter(partialState, existingId || undefined, partialState.biodata?.name);
        if (!existingId) {
          const url = new URL(window.location.href);
          url.searchParams.set('id', id);
          window.history.replaceState({}, '', url.toString());
        }
        setSaveStatus('Saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (err) {
        setSaveStatus('Save failed');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [storeState, isLoading]);

  const completePhase = useCallback((phaseId: string) => {
    setCompletedPhases(prev => prev.includes(phaseId) ? prev : [...prev, phaseId]);
    const idx = PHASES.findIndex(p => p.id === phaseId);
    if (idx < PHASES.length - 1) setActivePhase(PHASES[idx + 1].id);
  }, []);

  const orchestrator = useHistoryStore(s => (s as any).orchestrator) as HistoryOrchestrator | undefined;
  const chiefComplaints = useHistoryStore(s => s.chiefComplaints);
  const featureRegistry = useHistoryStore(s => s.featureRegistry);
  const ddx = useHistoryStore(s => s.ddx);
  const biodata = useHistoryStore(s => s.biodata);
  const completedSections = useHistoryStore(s => s.completedSections);
  const setActiveSection = useHistoryStore(s => s.setActiveSection);
  const completeSection = useHistoryStore(s => s.completeSection);

  const complaintIds = useMemo(() => chiefComplaints.map(c => c.symptomId), [chiefComplaints]);

  const aggregated = useMemo(() => {
    if (complaintIds.length === 0) return [];
    const map = enrichWithKgDifferentials(complaintIds, aggregateDifferentials(complaintIds));
    return Array.from(map.entries())
      .map(([diseaseId, data]) => ({ diseaseId, ...data }))
      .sort((a: any, b: any) => b.totalWeight - a.totalWeight);
  }, [complaintIds]);

  const topIds = useMemo(() => aggregated.slice(0, 5).map((d: any) => d.diseaseId), [aggregated]);

  const investigations = useMemo(() => {
    if (topIds.length === 0) return [];
    return getInvestigationsForDiseases(topIds);
  }, [topIds]);

  const treatments = useMemo(() => {
    if (topIds.length === 0) return [];
    return getTreatmentsForDiseases(topIds);
  }, [topIds]);

  const education = useMemo(() => {
    if (aggregated.length === 0) return null;
    try { return getEducation(aggregated[0].diseaseId); } catch { return null; }
  }, [aggregated]);

  const docOutput = useMemo(() => {
    if (!biodata.name) return null;
    try { return generateDocuments(useHistoryStore.getState() as unknown as DocumentInput); } catch { return null; }
  }, [biodata, chiefComplaints, ddx]);

  const maxWeight = aggregated.length > 0 ? aggregated[0].totalWeight : 1;

  const enterPhase = (id: string) => {
    const sectionId = SECTION_MAP[id];
    if (sectionId) setActiveSection(sectionId);
    setActivePhase(id);
  };

  const markDone = () => {
    if (activePhase === 'documentation') {
      completePhase('documentation');
      return;
    }
    const sectionId = SECTION_MAP[activePhase];
    if (sectionId && !completedSections.includes(sectionId)) completeSection(sectionId);
    completePhase(activePhase);
  };

  const renderPhaseContent = () => {
    const sectionId = SECTION_MAP[activePhase];
    if (sectionId) {
      return <SectionRenderer sectionId={sectionId} profile={profile} />;
    }
    switch (activePhase) {
      case 'ddx': return <DDXPhaseView aggregated={aggregated} maxWeight={maxWeight} ddx={ddx} />;
      case 'investigations': return <InvestigationsPhaseView investigations={investigations} />;
      case 'treatment': return <TreatmentPhaseView treatments={treatments} />;
      case 'documentation': return <DocumentationPhaseView docOutput={docOutput} education={education} />;
      default: return <EmptyState title="Unknown Phase" message="This phase has no content yet." />;
    }
  };

  if (isLoading) return <LoadingState message="Loading encounter..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={() => window.location.reload()} />;

  return (
    <div className="grid grid-cols-[200px_1fr_240px] h-screen bg-midnight-900 text-slate-200 overflow-hidden">
      <PhaseNavigation
        phases={PHASES}
        activePhase={activePhase}
        completedPhases={completedPhases}
        onEnterPhase={enterPhase}
      />

      <div className="overflow-hidden flex flex-col p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="text-base font-bold font-display text-slate-100">
              {PHASES.find(p => p.id === activePhase)?.icon}{' '}
              {PHASES.find(p => p.id === activePhase)?.label}
            </div>
            {saveStatus && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${saveStatus === 'Saved' ? 'bg-therapeutic-green/10 text-therapeutic-green' : 'bg-red-500/10 text-red-300'}`}>
                {saveStatus}
              </span>
            )}
          </div>
          <button onClick={markDone}
            className="px-3.5 py-1.5 rounded-md border-none cursor-pointer bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-xs font-semibold">
            {activePhase === 'documentation' ? '✓ Complete' : '✓ Next Phase'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<LoadingState message="Loading phase..." />}>
            {renderPhaseContent()}
          </Suspense>
        </div>
      </div>

      <div className="border-l border-white/10 overflow-y-auto p-4 bg-white/[.01]">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Intelligence</div>
        <IntelligenceSidebar
          complaintIds={complaintIds}
          chiefComplaints={chiefComplaints}
          aggregated={aggregated}
          maxWeight={maxWeight}
          investigations={investigations}
          activePhase={activePhase}
          ddx={ddx}
        />
      </div>
    </div>
  );
}
