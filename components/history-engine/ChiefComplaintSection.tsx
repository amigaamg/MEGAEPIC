'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { searchSymptoms, getAllSymptoms } from '@/lib/history-engine/symptomLibrary';
import { ChiefComplaintEngine, parseDurationToHours, formatDurationFromHours, evaluateCompletionCriteria } from '@/lib/history-engine/chief-complaint';
import { generateChiefComplaintReportHTML } from '@/lib/history-engine/chief-complaint/pdf-report';
import type { ChiefComplaintObject, ComplaintOnset, ComplaintRelationship, ComplaintStatus, ComplaintSeverity, ComplaintCertainty, ComplaintSource, ComplaintConsistencyCheck, ChronologicalTimelineEntry } from '@/lib/history-engine/chief-complaint/types';

const ONSET_OPTIONS: { value: ComplaintOnset; label: string }[] = [
  { value: 'Sudden', label: 'Sudden (< 1 hr)' },
  { value: 'Gradual', label: 'Gradual (hrs-days)' },
  { value: 'Intermittent', label: 'Intermittent' },
  { value: 'Recurrent', label: 'Recurrent' },
  { value: 'Unknown', label: 'Unknown' },
];

const RELATIONSHIP_OPTIONS: { value: ComplaintRelationship; label: string }[] = [
  { value: 'Independent', label: 'Independent' },
  { value: 'Progression', label: 'Progression' },
  { value: 'Complication', label: 'Complication' },
  { value: 'Associated', label: 'Associated' },
  { value: 'Unknown', label: 'Unknown' },
];

const STATUS_OPTIONS: { value: ComplaintStatus; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Intermittent', label: 'Intermittent' },
  { value: 'Unknown', label: 'Unknown' },
];

const SEVERITY_OPTIONS: { value: ComplaintSeverity; label: string }[] = [
  { value: 'Mild', label: 'Mild' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Severe', label: 'Severe' },
  { value: 'Unknown', label: 'Unknown' },
];

const RED_FLAG_CATEGORIES = new Set(['chest_pain', 'syncope', 'collapse', 'seizures', 'hemoptysis', 'hematemesis_melena', 'stridor', 'severe_trauma', 'burns_major']);

export default function ChiefComplaintSection() {
  const storeComplaints = useHistoryStore(s => s.chiefComplaints);
  const addChiefComplaint = useHistoryStore(s => s.addChiefComplaint);
  const removeChiefComplaint = useHistoryStore(s => s.removeChiefComplaint);
  const setPrimaryComplaint = useHistoryStore(s => s.setPrimaryComplaint);
  const completeSection = useHistoryStore(s => s.completeSection);
  const uncompleteSection = useHistoryStore(s => s.uncompleteSection);
  const completedSections = useHistoryStore(s => s.completedSections);
  const scheduleRecompute = useHistoryStore(s => s.scheduleRecompute);
  const patientName = useHistoryStore(s => s.biodata.name || 'Unknown Patient');
  const isComplete = completedSections.includes('chief_complaints');

  const engine = useMemo(() => new ChiefComplaintEngine(), []);
  const [engineComplaints, setEngineComplaints] = useState<ChiefComplaintObject[]>([]);
  const [chronological, setChronological] = useState<ChiefComplaintObject[]>([]);
  const [timeline, setTimeline] = useState<ChronologicalTimelineEntry[]>([]);
  const [consistencyChecks, setConsistencyChecks] = useState<ComplaintConsistencyCheck[]>([]);
  const [completion, setCompletion] = useState<ReturnType<typeof evaluateCompletionCriteria> | null>(null);
  const [graphText, setGraphText] = useState('');
  const [redFlagComplaints, setRedFlagComplaints] = useState<ChiefComplaintObject[]>([]);
  const [emergencyOverride, setEmergencyOverride] = useState(false);

  // Form state
  const [search, setSearch] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [complaintName, setComplaintName] = useState('');
  const [duration, setDuration] = useState('');
  const [onset, setOnset] = useState<ComplaintOnset>('Unknown');
  const [severity, setSeverity] = useState<ComplaintSeverity>('Unknown');
  const [status, setStatus] = useState<ComplaintStatus>('Active');
  const [relationship, setRelationship] = useState<ComplaintRelationship>('Unknown');
  const [certainty, setCertainty] = useState<ComplaintCertainty>('Definite');
  const [source, setSource] = useState<ComplaintSource>('Patient');
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'timeline' | 'graph' | 'checks'>('add');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  // Simultaneous complaint resolution
  const [simultaneousModal, setSimultaneousModal] = useState<{
    groupId: string;
    complaints: ChiefComplaintObject[];
  } | null>(null);

  const syncEngineToStore = useCallback(() => {
    const output = engine.getOutput();
    setEngineComplaints(output.complaints);
    setChronological(output.chronologicalOrder);
    setTimeline(output.timeline);
    setConsistencyChecks(output.consistencyChecks);
    setCompletion(output.completion);
    setGraphText(output.narrative.graphText);
    setRedFlagComplaints(output.redFlagComplaints);
    setEmergencyOverride(output.emergencyOverride);
  }, [engine]);

  useEffect(() => {
    engine.reset();
    for (const c of storeComplaints) {
      engine.addComplaint({
        symptomId: c.symptomId,
        name: c.label,
        duration: c.duration,
        onset: c.onset,
        status: c.status,
        certainty: c.certainty,
        relationship: c.relationship,
        source: c.source,
        severity: c.severity,
      });
    }
    for (const c of storeComplaints) {
      if (c.isPrimary) {
        const found = engine.getComplaints().find(ec => ec.symptomId === c.symptomId);
        if (found) engine.setPrimaryComplaint(found.id);
      }
    }
    syncEngineToStore();
  }, []);

  const results = useMemo(() => {
    if (!search.trim()) return getAllSymptoms().slice(0, 8);
    return searchSymptoms(search).slice(0, 10);
  }, [search]);

  const handleSelectSymptom = (symptomId: string, label: string) => {
    setSelectedSymptom(symptomId);
    setComplaintName(label);
    setSearch(label);
    const isRedFlag = RED_FLAG_CATEGORIES.has(symptomId);
    if (isRedFlag) {
      setSeverity('Severe');
    }
  };

  const handleAdd = () => {
    if (!selectedSymptom || !duration) {
      setError('Please select a symptom and enter a duration');
      return;
    }

    const durationHours = parseDurationToHours(duration);
    if (durationHours <= 0) {
      setError('Please enter a valid duration');
      return;
    }

    const complaint = engine.addComplaint({
      symptomId: selectedSymptom,
      name: complaintName,
      duration,
      onset,
      status,
      certainty,
      relationship,
      source,
      severity,
    });

    addChiefComplaint(complaint.symptomId, complaint.name, duration, Math.round(durationHours / 24), {
      durationHours: complaint.durationHours,
      onset: complaint.onset,
      status: complaint.status,
      certainty: complaint.certainty,
      relationship: complaint.relationship,
      source: complaint.source,
      category: complaint.category,
      severity: complaint.severity,
      schemaActivated: complaint.schemaActivated || undefined,
      redFlagOverride: complaint.redFlagOverride,
    });

    // RULE 16: Check red flag override
    const hasRedFlag = engine.checkRedFlagOverride();

    // RULE 8: Detect simultaneous
    const simultaneous = engine.detectSimultaneous();
    if (simultaneous.length > 0) {
      setSimultaneousModal(simultaneous[0]);
    }

    syncEngineToStore();

    // Reset form
    setSelectedSymptom(null);
    setComplaintName('');
    setDuration('');
    setOnset('Unknown');
    setSeverity(hasRedFlag ? 'Severe' : 'Unknown');
    setStatus('Active');
    setRelationship('Unknown');
    setCertainty('Definite');
    setSource('Patient');
    setSearch('');
    setError(null);
    scheduleRecompute();
  };

  const handleRemove = (id: string) => {
    const complaint = engine.getComplaints().find(c => c.id === id);
    if (complaint) {
      const ccFromStore = storeComplaints.find(c => c.symptomId === complaint.symptomId);
      if (ccFromStore) removeChiefComplaint(ccFromStore.id);
    }
    engine.removeComplaint(id);
    engine.checkRedFlagOverride();
    syncEngineToStore();
    scheduleRecompute();
  };

  const handleSetPrimary = (id: string) => {
    engine.setPrimaryComplaint(id);
    const complaint = engine.getComplaints().find(c => c.id === id);
    if (complaint) {
      const ccFromStore = storeComplaints.find(c => c.symptomId === complaint.symptomId);
      if (ccFromStore) {
        setPrimaryComplaint(ccFromStore.id);
      }
    }
    syncEngineToStore();
    scheduleRecompute();
  };

  const handleUpdateRelationship = (id: string, rel: ComplaintRelationship) => {
    engine.setRelationship(id, rel);
    syncEngineToStore();
  };

  const handleUpdateSeverity = (id: string, sev: ComplaintSeverity) => {
    engine.setSeverity(id, sev);
    engine.checkRedFlagOverride();
    syncEngineToStore();
  };

  const handleUpdateStatus = (id: string, st: ComplaintStatus) => {
    engine.setStatus(id, st);
    syncEngineToStore();
  };

  const handleUpdateDuration = (id: string, dur: string) => {
    engine.updateDuration(id, dur);
    engine.checkRedFlagOverride();
    syncEngineToStore();
  };

  const handleResolveSimultaneous = (firstId: string) => {
    if (!simultaneousModal) return;
    engine.resolveSimultaneous(simultaneousModal.groupId, firstId);
    setSimultaneousModal(null);
    syncEngineToStore();
  };

  const handleComplete = () => {
    if (completing) return;
    setCompleting(true);
    setError(null);

    try {
      const output = engine.getOutput();

      if (!output.completion.checks.atLeastOneComplaint) {
        throw new Error('At least one complaint is required');
      }
      if (!output.completion.checks.exactlyOnePrimary) {
        throw new Error('Exactly one complaint must be marked as primary');
      }
      if (!output.completion.checks.everyComplaintHasDuration) {
        throw new Error('Every complaint requires a duration');
      }

      const warnings = output.consistencyChecks.filter(c => c.severity === 'warning' && !c.passed);
      if (warnings.length > 0) {
        const unresolved = warnings.map(w => w.message).join('; ');
        throw new Error(`Unresolved consistency warnings: ${unresolved}`);
      }

      completeSection('chief_complaints');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to complete section';
      setError(msg);
      console.error('[ChiefComplaintSection] completeSection failed:', e);
    } finally {
      setCompleting(false);
    }
  };

  const handleDownloadPDF = () => {
    const output = engine.getOutput();
    const html = generateChiefComplaintReportHTML(
      output,
      patientName,
      new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    );
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chief_Complaint_Report_${patientName.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isComplete) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">✓</span>
              <span className="font-medium text-sm text-green-400">Chief Complaints Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadPDF}
                className="text-[10px] px-2 py-1 rounded bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors">
                📄 PDF Report
              </button>
              <button onClick={() => uncompleteSection('chief_complaints')}
                className="text-xs text-blue-400 hover:text-blue-300 underline">
                Edit
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#0f1635] rounded-xl border border-gray-700/30 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Chronological Timeline</h3>
          <div className="space-y-2">
            {timeline.map((entry, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5" />
                  {i < timeline.length - 1 && <div className="w-px h-6 bg-gray-700" />}
                </div>
                <div>
                  <span className="text-xs font-medium text-teal-400">{entry.dayLabel}</span>
                  <p className="text-xs text-gray-300">{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {graphText && (
          <div className="bg-[#0f1635] rounded-xl border border-gray-700/30 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Complaint Graph</h3>
            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{graphText}</pre>
          </div>
        )}

        {storeComplaints.length > 0 && (
          <div className="bg-[#0f1635] rounded-xl border border-gray-700/30 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Schemas</h3>
            <div className="flex flex-wrap gap-2">
              {[...new Set(storeComplaints.map(c => c.schemaActivated).filter(Boolean))].map(schema => (
                <span key={schema} className="text-xs px-2 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  ✓ {schema}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const output = engine.getOutput();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Complaint Intake Engine</h2>
        {emergencyOverride && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
            ⚠ EMERGENCY OVERRIDE
          </span>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-700/50 pb-1">
        <button onClick={() => setActiveTab('add')}
          className={`px-3 py-1.5 text-xs rounded-t-lg transition-colors ${activeTab === 'add' ? 'bg-teal-500/10 text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
          + Add Complaints
        </button>
        <button onClick={() => setActiveTab('timeline')}
          className={`px-3 py-1.5 text-xs rounded-t-lg transition-colors ${activeTab === 'timeline' ? 'bg-teal-500/10 text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
          Timeline ({timeline.length})
        </button>
        <button onClick={() => setActiveTab('graph')}
          className={`px-3 py-1.5 text-xs rounded-t-lg transition-colors ${activeTab === 'graph' ? 'bg-teal-500/10 text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
          Graph
        </button>
        <button onClick={() => setActiveTab('checks')}
          className={`px-3 py-1.5 text-xs rounded-t-lg transition-colors ${activeTab === 'checks' ? 'bg-teal-500/10 text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
          Checks ({consistencyChecks.length})
        </button>
      </div>

      {/* ── ADD COMPLAINTS TAB ── */}
      {activeTab === 'add' && (
        <div className="space-y-4">
          {/* Symptom Search */}
          <div className="relative">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2.5 pl-9 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
              placeholder="Search symptom..." />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          </div>

          {search && results.length > 0 && (
            <div className="bg-[#12193a] border border-gray-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {results.map(s => {
                const isRedFlag = RED_FLAG_CATEGORIES.has(s.id);
                return (
                  <button key={s.id} onClick={() => handleSelectSymptom(s.id, s.label)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[#1b234f] transition-colors flex items-center justify-between ${
                      selectedSymptom === s.id ? 'bg-teal-500/10 text-teal-400' : 'text-gray-300'
                    }`}>
                    <span>{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-xs">{s.category}</span>
                      {isRedFlag && <span className="text-[9px] px-1 py-0.5 rounded bg-red-500/20 text-red-400">⚠</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Duration + Onset */}
          {selectedSymptom && (
            <div className="space-y-3 bg-[#12193a] rounded-xl border border-gray-700/50 p-4">
              <div className="text-xs text-gray-400 font-medium mb-2">Complaint Details</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Duration (text)</label>
                  <input type="text" value={duration} onChange={e => setDuration(e.target.value)}
                    className="w-full bg-[#0a1035] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                    placeholder='e.g. "3 days"' />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Duration (hours)</label>
                  <div className="w-full bg-[#0a1035] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-400">
                    {duration ? parseDurationToHours(duration) : '-'} hours
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Onset</label>
                  <select value={onset} onChange={e => setOnset(e.target.value as ComplaintOnset)}
                    className="w-full bg-[#0a1035] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500">
                    {ONSET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Severity</label>
                  <select value={severity} onChange={e => setSeverity(e.target.value as ComplaintSeverity)}
                    className="w-full bg-[#0a1035] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500">
                    {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as ComplaintStatus)}
                    className="w-full bg-[#0a1035] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500">
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Relationship</label>
                  <select value={relationship} onChange={e => setRelationship(e.target.value as ComplaintRelationship)}
                    className="w-full bg-[#0a1035] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500">
                    {RELATIONSHIP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Source</label>
                  <select value={source} onChange={e => setSource(e.target.value as ComplaintSource)}
                    className="w-full bg-[#0a1035] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500">
                    {['Patient', 'Relative', 'Caregiver', 'EMS', 'Referral', 'Record', 'Other'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Certainty</label>
                  <select value={certainty} onChange={e => setCertainty(e.target.value as ComplaintCertainty)}
                    className="w-full bg-[#0a1035] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500">
                    {['Definite', 'Probable', 'Possible', 'Unknown'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={handleAdd} disabled={!duration}
                className="w-full mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors">
                Add Complaint
              </button>
            </div>
          )}

          {/* ── COMPLAINT LIST ── */}
          {engineComplaints.length > 0 && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Selected Complaints ({engineComplaints.length})
                </span>
                {completion && (
                  <div className="flex items-center gap-2">
                    {!completion.met && completion.missing.length > 0 && (
                      <span className="text-[9px] text-amber-400">{completion.missing.length} issue(s)</span>
                    )}
                    {completion.met && <span className="text-[9px] text-green-400">All criteria met</span>}
                  </div>
                )}
              </div>

              {engineComplaints.map(c => (
                <div key={c.id}
                  className={`group relative bg-[#12193a] border rounded-lg px-3 py-2.5 transition-all ${
                    c.primary ? 'border-yellow-500/40' : 'border-gray-700'
                  } ${c.redFlagOverride ? 'border-red-500/40 bg-red-500/5' : ''}`}>
                  {/* Primary indicator + label */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button onClick={() => handleSetPrimary(c.id)}
                        className="text-sm hover:scale-110 transition-transform shrink-0"
                        title={c.primary ? 'Primary complaint' : 'Click to set as primary'}>
                        {c.primary ? '★' : '○'}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-white font-medium">{c.name}</span>
                          {c.primary && <span className="text-[9px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">Primary</span>}
                          {c.redFlagOverride && <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">⚠ Red Flag</span>}
                          {c.severity === 'Severe' && <span className="text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">Severe</span>}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {c.duration} ({formatDurationFromHours(c.durationHours)})
                          {c.onset !== 'Unknown' && ` • ${c.onset}`}
                          {c.certainty !== 'Definite' && ` • ${c.certainty}`}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(c.id)}
                      className="text-gray-600 hover:text-red-400 text-sm transition-colors ml-2">
                      ✕
                    </button>
                  </div>

                  {/* Quick actions row */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <select value={c.relationship} onChange={e => handleUpdateRelationship(c.id, e.target.value as ComplaintRelationship)}
                      className="text-[10px] bg-[#0a1035] border border-gray-700 rounded px-1.5 py-0.5 text-gray-300 focus:outline-none focus:border-teal-500">
                      {RELATIONSHIP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select value={c.severity} onChange={e => handleUpdateSeverity(c.id, e.target.value as ComplaintSeverity)}
                      className="text-[10px] bg-[#0a1035] border border-gray-700 rounded px-1.5 py-0.5 text-gray-300 focus:outline-none focus:border-teal-500">
                      {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select value={c.status} onChange={e => handleUpdateStatus(c.id, e.target.value as ComplaintStatus)}
                      className="text-[10px] bg-[#0a1035] border border-gray-700 rounded px-1.5 py-0.5 text-gray-300 focus:outline-none focus:border-teal-500">
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <span className="text-[9px] text-gray-600 ml-auto">
                      {c.category} • {c.schemaActivated || 'No schema'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── COMPLETION CRITERIA STATUS ── */}
          {engineComplaints.length > 0 && completion && (
            <div className="bg-[#12193a] rounded-xl border border-gray-700/50 p-4 space-y-2">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Completion Criteria</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(completion.checks).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={val ? 'text-green-400' : 'text-red-400'}>
                      {val ? '✓' : '✗'}
                    </span>
                    <span className="text-[10px] text-gray-400">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                  </div>
                ))}
              </div>
              {completion.missing.length > 0 && (
                <div className="text-[10px] text-amber-400 mt-1">
                  Missing: {completion.missing.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Complete button */}
          {engineComplaints.length > 0 && (
            <button onClick={handleComplete} disabled={completing}
              className="w-full mt-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
              {completing ? 'Completing...' : completion?.met ? '✓ Complete & Continue' : 'Complete & Continue'}
            </button>
          )}
        </div>
      )}

      {/* ── TIMELINE TAB ── */}
      {activeTab === 'timeline' && (
        <div className="bg-[#12193a] rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Chronological Timeline</h3>
          {timeline.length === 0 ? (
            <p className="text-xs text-gray-500">No complaints added yet.</p>
          ) : (
            <div className="space-y-3">
              {timeline.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-400 mt-1.5" />
                    {i < timeline.length - 1 && <div className="w-px h-8 bg-gray-700" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-teal-400">{entry.dayLabel}</span>
                      <span className="text-[9px] text-gray-600">({formatDurationFromHours(entry.relativeHour)} ago)</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">{entry.description}</p>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {entry.complaints.map(cc => (
                        <span key={cc.id}
                          className={`text-[9px] px-1.5 py-0.5 rounded ${
                            cc.primary
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : 'bg-gray-700/30 text-gray-400'
                          }`}>
                          {cc.name} {cc.primary ? '(P)' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── GRAPH TAB ── */}
      {activeTab === 'graph' && (
        <div className="bg-[#12193a] rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Complaint Relationship Graph</h3>
          {!graphText ? (
            <p className="text-xs text-gray-500">Add at least one complaint to see the graph.</p>
          ) : (
            <div className="bg-[#0a1035] rounded-lg p-4 border border-gray-700/30">
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">{graphText}</pre>
            </div>
          )}
          {engineComplaints.length > 1 && (
            <div className="mt-4 space-y-2">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Relationship Legend</div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="text-teal-400">├──</span> Associated
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="text-amber-400">├──</span> Progression
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="text-red-400">├──</span> Complication
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="text-gray-500">├──</span> Independent
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CHECKS TAB ── */}
      {activeTab === 'checks' && (
        <div className="space-y-3">
          {consistencyChecks.length === 0 && engineComplaints.length === 0 && (
            <div className="bg-[#12193a] rounded-xl border border-gray-700/50 p-4">
              <p className="text-xs text-gray-500">No consistency checks yet. Add complaints to run checks.</p>
            </div>
          )}
          {consistencyChecks.length === 0 && engineComplaints.length > 0 && (
            <div className="bg-[#12193a] rounded-xl border border-gray-700/50 p-4">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-xs text-green-400">All consistency checks passed</span>
              </div>
            </div>
          )}
          {consistencyChecks.map(check => (
            <div key={check.ruleId}
              className={`rounded-xl border p-4 ${
                check.severity === 'error' ? 'bg-red-500/5 border-red-500/30' :
                check.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/30' :
                'bg-blue-500/5 border-blue-500/30'
              }`}>
              <div className="flex items-start gap-2">
                <span className={
                  check.passed ? 'text-green-400' :
                  check.severity === 'error' ? 'text-red-400' :
                  check.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                }>
                  {check.passed ? '✓' : '?'}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-300">{check.ruleId}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                      check.severity === 'error' ? 'bg-red-500/10 text-red-400' :
                      check.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>{check.severity}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{check.message}</p>
                  {check.clarification && (
                    <p className="text-[10px] text-amber-400/80 mt-1 italic">{check.clarification}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Completion criteria */}
          {completion && (
            <div className="bg-[#12193a] rounded-xl border border-gray-700/50 p-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Completion Status</h4>
              <div className={`text-xs font-medium mb-3 ${completion.met ? 'text-green-400' : 'text-amber-400'}`}>
                {completion.met ? '✓ All criteria met — ready to proceed to HPI' : `✗ ${completion.missing.length} criteria not met`}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(completion.checks).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={val ? 'text-green-400' : 'text-red-400'}>
                      {val ? '✓' : '✗'}
                    </span>
                    <span className="text-[10px] text-gray-400">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency override */}
          {emergencyOverride && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-lg">⚡</span>
                <div>
                  <span className="text-xs font-semibold text-red-400">Emergency Override Active</span>
                  <p className="text-[10px] text-red-300/80 mt-0.5">
                    Red flag complaint detected. Workflow will immediately activate emergency pathway.
                  </p>
                </div>
              </div>
              {redFlagComplaints.length > 0 && (
                <div className="mt-2 space-y-1">
                  {redFlagComplaints.map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-[10px] text-red-300">
                      <span>•</span>
                      <span>{c.name}</span>
                      <span className="text-red-400/60">({c.duration})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SIMULTANEOUS COMPLAINT MODAL ── */}
      {simultaneousModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSimultaneousModal(null)}>
          <div className="bg-[#0f1635] border border-gray-700 rounded-2xl p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-white mb-2">Simultaneous Complaints Detected</h3>
            <p className="text-xs text-gray-400 mb-4">
              These complaints appear to have started at the same time. Which started first?
            </p>
            <div className="space-y-2">
              {simultaneousModal.complaints.map(c => (
                <button key={c.id} onClick={() => handleResolveSimultaneous(c.id)}
                  className="w-full text-left p-3 rounded-xl bg-[#12193a] border border-gray-700 hover:border-teal-500/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{c.name}</span>
                    <span className="text-xs text-gray-500">({c.duration})</span>
                  </div>
                </button>
              ))}
              <button onClick={() => {
                // Treat as same time — set first complaint chronology
                handleResolveSimultaneous(simultaneousModal.complaints[0].id);
              }}
                className="w-full text-center p-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Same time / Can't determine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
