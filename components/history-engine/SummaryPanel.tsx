'use client';
import { useRef } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

export default function SummaryPanel() {
  const documents = useHistoryStore(s => s.documents);
  const redFlags = useHistoryStore(s => s.redFlags);
  const biodata = useHistoryStore(s => s.biodata);
  const complaints = useHistoryStore(s => s.chiefComplaints);
  const completedSections = useHistoryStore(s => s.completedSections);
  const reset = useHistoryStore(s => s.reset);
  const ref = useRef<HTMLDivElement>(null);

  const criticalRfs = redFlags.filter(r => r.severity === 'critical');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-teal-400 rounded-full" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Clinical Summary</h2>
        </div>
        <button onClick={reset}
          className="text-[10px] text-gray-500 hover:text-gray-300 underline">
          New History
        </button>
      </div>

      <div ref={ref} className="bg-[#0b1230] border border-gray-700/50 rounded-xl p-4 space-y-4">
        {/* Patient ID */}
        <div className="text-center pb-3 border-b border-gray-800">
          <div className="text-xs text-gray-400 uppercase tracking-wider">AMEXAN History Engine</div>
          <div className="text-lg font-semibold text-white mt-1">{biodata.name || 'Patient Name'}</div>
          <div className="text-[11px] text-gray-500">
            {biodata.age ? `${biodata.age}yrs` : ''} {biodata.sex !== 'unknown' ? `· ${biodata.sex}` : ''}
            {biodata.occupation ? ` · ${biodata.occupation}` : ''}
            {biodata.residence ? ` · ${biodata.residence}` : ''}
          </div>
          <div className="text-[10px] text-gray-600 mt-1">
            Informant: {biodata.informant?.replace(/_/g, ' ') || 'Patient'}
            {biodata.reliability ? ` · Reliability: ${biodata.reliability.replace(/_/g, ' ')}` : ''}
          </div>
        </div>

        {/* Generated Sections */}
        {documents.chiefComplaintText && (
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Chief Complaint(s)</div>
            <p className="text-[11px] text-gray-300 leading-relaxed">{documents.chiefComplaintText}</p>
          </div>
        )}

        {documents.hpiNarrative && (
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">HPI</div>
            <p className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap">{documents.hpiNarrative}</p>
          </div>
        )}

        {documents.pastHistoryNarrative && documents.pastHistoryNarrative !== 'No significant past medical or surgical history.' && (
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Past History</div>
            <p className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap">{documents.pastHistoryNarrative}</p>
          </div>
        )}

        {documents.familySocialNarrative && documents.familySocialNarrative !== 'No family or social history recorded.' && (
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Family & Social</div>
            <p className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap">{documents.familySocialNarrative}</p>
          </div>
        )}

        {documents.rosNarrative && (
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Review of Systems</div>
            <p className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap">{documents.rosNarrative}</p>
          </div>
        )}

        {/* Red Flags */}
        {criticalRfs.length > 0 && (
          <div>
            <div className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Critical Red Flags</div>
            {criticalRfs.map(r => (
              <p key={r.id} className="text-[10px] text-red-300/80 py-0.5">⚠ {r.message}</p>
            ))}
          </div>
        )}

        {/* Concise Summary (at the end) */}
        {documents.summaryNarrative && (
          <div>
            <div className="text-[10px] text-teal-400 uppercase tracking-wider mb-1">Summary</div>
            <div className="bg-[#0a1030] border border-gray-700/30 rounded-lg p-3">
              <pre className="text-[11px] text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{documents.summaryNarrative}</pre>
            </div>
          </div>
        )}

        {/* Completed footer */}
        {completedSections.length >= 5 && (
          <div className="text-center pt-3 border-t border-gray-800">
            <div className="text-[10px] text-gray-600">
              History completed {new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </div>

      {/* Copy / Export */}
      <div className="flex gap-2">
        <button onClick={() => {
          navigator.clipboard.writeText(documents.fullDocumentation || documents.summaryNarrative);
        }}
          className="px-4 py-2 bg-[#12193a] border border-gray-700 text-gray-300 text-xs rounded-lg hover:bg-gray-800 transition-colors">
          Copy Full History
        </button>
        <button onClick={() => window.print()}
          className="px-4 py-2 bg-[#12193a] border border-gray-700 text-gray-300 text-xs rounded-lg hover:bg-gray-800 transition-colors">
          Print
        </button>
      </div>
    </div>
  );
}
