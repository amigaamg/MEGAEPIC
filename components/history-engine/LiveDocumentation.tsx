'use client';
import { useMemo } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { ChiefComplaintEngine } from '@/lib/history-engine/chief-complaint';

export default function LiveDocumentation() {
  const documents = useHistoryStore(s => s.documents);
  const redFlags = useHistoryStore(s => s.redFlags);
  const biodata = useHistoryStore(s => s.biodata);
  const activeSection = useHistoryStore(s => s.activeSection);
  const completedSections = useHistoryStore(s => s.completedSections);
  const complaints = useHistoryStore(s => s.chiefComplaints);

  const engine = useMemo(() => new ChiefComplaintEngine(), []);
  const engineOutput = useMemo(() => {
    engine.reset();
    for (const c of complaints) {
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
    for (const c of complaints) {
      if (c.isPrimary) {
        const found = engine.getComplaints().find(ec => ec.symptomId === c.symptomId);
        if (found) engine.setPrimaryComplaint(found.id);
      }
    }
    engine.checkRedFlagOverride();
    return engine.getOutput();
  }, [complaints, engine]);

  const progress = completedSections.length;
  const totalSections = 9;
  const criticalFlags = redFlags.filter(r => r.severity === 'critical');

  return (
    <div className="h-full flex flex-col text-[11px]">
      {/* Progress Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Clinical Progress</span>
          <span className="text-[10px] text-gray-500">{completedSections.length}/{totalSections}</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${(progress / totalSections) * 100}%` }} />
        </div>
      </div>

      {/* Emergency Override Banner */}
      {engineOutput.emergencyOverride && (
        <div className="mb-2 p-2 bg-red-500/15 border border-red-500/40 rounded-lg">
          <div className="text-[10px] font-bold text-red-400 uppercase flex items-center gap-1">
            ⚡ EMERGENCY OVERRIDE
          </div>
          {engineOutput.redFlagComplaints.map(c => (
            <div key={c.id} className="text-[9px] text-red-300/80 mt-0.5">
              Red flag: {c.name}
            </div>
          ))}
        </div>
      )}

      {/* Critical Red Flags */}
      {criticalFlags.length > 0 && !engineOutput.emergencyOverride && (
        <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="text-[10px] font-bold text-red-400 uppercase mb-1">Red Flags</div>
          {criticalFlags.slice(0, 2).map(r => (
            <div key={r.id} className="text-[9px] text-red-300/80 py-0.5">⚠ {r.message}</div>
          ))}
        </div>
      )}

      {/* ── LIVE COMPLAINT ENGINE OUTPUT ── */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider sticky top-0 bg-[#0a1035] py-1 z-10">
          Complaint Engine — Live View
        </div>

        {complaints.length === 0 && (
          <div className="text-gray-600 italic text-center py-6">
            Add a complaint to begin...
          </div>
        )}

        {/* Primary Complaint */}
        {engineOutput.primary && (
          <div className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-2.5">
            <div className="text-[9px] text-teal-400/60 uppercase tracking-wider mb-1">Primary Complaint</div>
            <div className="text-xs font-medium text-teal-300">
              {engineOutput.primary.name}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {engineOutput.primary.duration} ({engineOutput.primary.durationHours}h) • {engineOutput.primary.onset}
            </div>
          </div>
        )}

        {/* Chronological Timeline */}
        {engineOutput.timeline.length > 0 && (
          <div className="bg-[#12193a] border border-gray-700/30 rounded-lg p-2.5">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Chronological Timeline</div>
            <div className="space-y-1.5">
              {engineOutput.timeline.map((entry, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5" />
                    {i < engineOutput.timeline.length - 1 && <div className="w-px h-4 bg-gray-700" />}
                  </div>
                  <div>
                    <span className="text-[9px] font-medium text-teal-400">{entry.dayLabel}</span>
                    <div className="text-[10px] text-gray-300">{entry.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complaint Graph */}
        {engineOutput.narrative.graphText && (
          <div className="bg-[#12193a] border border-gray-700/30 rounded-lg p-2.5">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Active Complaint Graph</div>
            <pre className="text-[10px] text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
              {engineOutput.narrative.graphText}
            </pre>
          </div>
        )}

        {/* Activated Schemas */}
        {engineOutput.activatedSchemas.length > 0 && (
          <div className="bg-[#12193a] border border-gray-700/30 rounded-lg p-2.5">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Activated Schemas</div>
            <div className="flex flex-wrap gap-1">
              {engineOutput.activatedSchemas.map(s => (
                <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Consistency Checks */}
        {engineOutput.consistencyChecks.length > 0 && (
          <div className="bg-[#12193a] border border-gray-700/30 rounded-lg p-2.5">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Consistency Checks</div>
            {engineOutput.consistencyChecks.map(check => (
              <div key={check.ruleId} className={`text-[10px] py-0.5 ${check.passed ? 'text-green-400/60' : check.severity === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
                {check.passed ? '✓' : '?'} {check.message}
              </div>
            ))}
          </div>
        )}

        {/* Completion Criteria */}
        {engineOutput.completion && complaints.length > 0 && (
          <div className="bg-[#12193a] border border-gray-700/30 rounded-lg p-2.5">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Completion</div>
            <div className={`text-[10px] font-medium ${engineOutput.completion.met ? 'text-green-400' : 'text-amber-400'}`}>
              {engineOutput.completion.met ? '✓ Ready for HPI' : `${engineOutput.completion.missing.length} issue(s)`}
            </div>
            <div className="grid grid-cols-1 gap-0.5 mt-1">
              {Object.entries(engineOutput.completion.checks).slice(0, 4).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1 text-[9px]">
                  <span className={val ? 'text-green-400' : 'text-red-400'}>{val ? '✓' : '✗'}</span>
                  <span className="text-gray-400">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structured Data (RULE 21 compliant) */}
        {complaints.length > 0 && (
          <div className="bg-[#12193a] border border-gray-700/30 rounded-lg p-2.5">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Structured Data</div>
            <pre className="text-[9px] text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(engineOutput.complaints.map(c => ({
                name: c.name,
                duration: c.duration,
                primary: c.primary,
                relationship: c.relationship === 'Unknown' ? undefined : c.relationship,
                severity: c.severity === 'Unknown' ? undefined : c.severity,
                status: c.status,
                onset: c.onset === 'Unknown' ? undefined : c.onset,
              })), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
