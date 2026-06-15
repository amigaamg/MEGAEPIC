'use client';
import { useMemo } from 'react';
import type { DdxResult } from '@/lib/history-engine/types';

interface Props {
  aggregated: any[];
  maxWeight: number;
  ddx: DdxResult;
}

export function DDXPhaseView({ aggregated, maxWeight, ddx }: Props) {
  if (aggregated.length === 0) {
    return (
      <div className="bg-white/[.02] border border-white/10 rounded-lg p-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Ranked Differentials</div>
        <div className="text-slate-600 text-xs text-center p-6">
          No symptoms selected. Go to Chief Complaint first.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white/[.02] border border-white/10 rounded-lg p-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Ranked Differentials ({aggregated.length})</div>
        <div className="flex flex-col gap-2.5">
          {aggregated.slice(0, 15).map((d: any, i: number) => {
            const pct = Math.round((d.totalWeight / maxWeight) * 100);
            const bg = i === 0 ? 'bg-cyan-500/[.04]' : 'bg-white/[.01]';
            const border = i === 0 ? 'border-cyan-500/20' : 'border-white/[.04]';
            return (
              <div key={d.diseaseId} className={`p-3 rounded-lg ${bg} border ${border}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold
                      ${i === 0 ? 'bg-cyan-400 text-midnight-900' : i < 3 ? 'bg-blue-500 text-midnight-900' : 'bg-white/[.06] text-slate-500'}`}
                      style={{ width: 22, height: 22 }}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{d.diseaseName}</span>
                  </div>
                  <span className={`text-xs font-bold font-mono ${i === 0 ? 'text-cyan-400' : 'text-slate-400'}`}>{pct}%</span>
                </div>
                <div className="w-full h-1 rounded bg-white/[.04] overflow-hidden">
                  <div className={`h-full rounded ${i === 0 ? 'bg-cyan-400' : i < 3 ? 'bg-blue-500' : 'bg-slate-600'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {ddx.snapshots?.length > 0 && (
        <div className="bg-white/[.02] border border-white/10 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">DDX History</div>
          <div className="text-[10px] text-slate-600">
            {ddx.snapshots.length} snapshot{ddx.snapshots.length > 1 ? 's' : ''} taken
            · Last updated: {new Date(ddx.snapshots[ddx.snapshots.length - 1].timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}

export function InvestigationsPhaseView({ investigations }: { investigations: any[] }) {
  const essential = investigations.filter(i => i.priority === 'essential');
  const supportive = investigations.filter(i => i.priority === 'supportive');
  const optional = investigations.filter(i => i.priority === 'optional');

  if (essential.length === 0 && supportive.length === 0 && optional.length === 0) {
    return (
      <div className="bg-white/[.02] border border-white/10 rounded-lg p-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Investigations</div>
        <div className="text-slate-600 text-xs text-center p-4">
          No investigations suggested for current differentials.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <InvestigationGroup title={`Essential (${essential.length})`} items={essential} />
      {supportive.length > 0 && <InvestigationGroup title={`Supportive (${supportive.length})`} items={supportive} />}
      {optional.length > 0 && <InvestigationGroup title={`Optional (${optional.length})`} items={optional} />}
    </div>
  );
}

function InvestigationGroup({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="bg-white/[.02] border border-white/10 rounded-lg p-4">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">{title}</div>
      {items.map(inv => (
        <div key={inv.id} className="py-2 border-b border-white/[.03] last:border-b-0">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-xs font-medium text-slate-200">{inv.name}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold
              ${inv.priority === 'essential' ? 'bg-red-500/10 text-red-300' :
                inv.priority === 'supportive' ? 'bg-amber-500/10 text-amber-200' :
                'bg-white/[.04] text-slate-500'}`}>{inv.priority}</span>
          </div>
          <div className="text-[10px] text-slate-500">
            <span className="text-slate-600">{inv.category}</span>
            {inv.rationale && <span> · {inv.rationale}</span>}
          </div>
          {inv.expectedFinding && <div className="text-[9px] text-slate-600 mt-0.5">Expected: {inv.expectedFinding}</div>}
        </div>
      ))}
    </div>
  );
}

export function TreatmentPhaseView({ treatments }: { treatments: any[] }) {
  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const tx of treatments) {
      const cat = tx.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tx);
    }
    return groups;
  }, [treatments]);

  const catLabels: Record<string, string> = {
    medication: 'Medications', procedure: 'Procedures', surgical: 'Surgical',
    conservative: 'Conservative Care', referral: 'Referrals', supportive: 'Supportive Care',
    definitive: 'Definitive Treatment', complication_management: 'Complication Management',
    other: 'Other',
  };

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="bg-white/[.02] border border-white/10 rounded-lg p-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Treatments</div>
        <div className="text-slate-600 text-xs text-center p-4">
          No treatments suggested for current differentials.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="bg-white/[.02] border border-white/10 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">{catLabels[cat] || cat} ({items.length})</div>
          {items.map((tx: any) => (
            <div key={tx.intervention || tx.id} className="py-2 border-b border-white/[.03] last:border-b-0">
              <div className="text-xs font-medium text-slate-200 mb-0.5">{tx.intervention}</div>
              <div className="text-[10px] text-slate-500">
                {tx.forCondition?.filter(Boolean).join(', ') || ''}
                {tx.dosage ? ` · ${tx.dosage}` : ''}
                {tx.duration ? ` · ${tx.duration}` : ''}
              </div>
              {tx.rationale && <div className="text-[9px] text-slate-600 mt-0.5">{tx.rationale}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function DocumentationPhaseView({ docOutput, education }: { docOutput: any; education: any }) {
  return (
    <div className="flex flex-col gap-4">
      {education && (
        <div className="bg-white/[.02] border border-white/10 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Case Education · {education.diseaseName}</div>
          <div className="text-xs text-slate-400 leading-relaxed mb-2.5">{education.overview}</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 mb-1">Typical Presentation</div>
              <ul className="m-0 pl-3.5 text-[10px] text-slate-400 leading-relaxed">
                {education.typicalPresentation?.slice(0, 5).map((p: string, i: number) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 mb-1">First-Line Treatment</div>
              <div className="text-[10px] text-slate-400 leading-relaxed mb-2">{education.firstLineTreatment}</div>
              <div className="text-[10px] font-semibold text-slate-500 mb-1">Prognosis</div>
              <div className="text-[10px] text-slate-400 leading-relaxed">{education.prognosis}</div>
            </div>
          </div>
          {education.riskFactors?.length > 0 && (
            <>
              <div className="text-[10px] font-semibold text-slate-500 mt-2 mb-1">Risk Factors</div>
              <div className="flex flex-wrap gap-0.5">
                {education.riskFactors.map((rf: string, i: number) => (
                  <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-white/[.03] border border-white/[.04] text-slate-500">{rf}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="bg-white/[.02] border border-white/10 rounded-lg p-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Clinical Note Preview</div>
        {docOutput ? (
          <div className="text-[10px] text-slate-400 leading-relaxed whitespace-pre-wrap font-mono">
            {renderDocument(docOutput)}
          </div>
        ) : (
          <div className="text-slate-600 text-xs text-center p-6">
            Complete patient registration to generate documentation.
          </div>
        )}
      </div>
    </div>
  );
}

function renderDocument(doc: any): string {
  const lines: string[] = [];
  if (doc.clinicNote) {
    if (typeof doc.clinicNote === 'string') lines.push(doc.clinicNote);
    else {
      if (doc.clinicNote.subjective) lines.push(`SUBJECTIVE:\n${doc.clinicNote.subjective}`);
      if (doc.clinicNote.objective) lines.push(`\nOBJECTIVE:\n${doc.clinicNote.objective}`);
      if (doc.clinicNote.assessment) lines.push(`\nASSESSMENT:\n${doc.clinicNote.assessment}`);
      if (doc.clinicNote.plan) lines.push(`\nPLAN:\n${doc.clinicNote.plan}`);
    }
  }
  if (doc.soapNote) {
    if (typeof doc.soapNote === 'string') lines.push(doc.soapNote);
    else {
      if (doc.soapNote.subjective) lines.push(`S: ${doc.soapNote.subjective}`);
      if (doc.soapNote.objective) lines.push(`O: ${doc.soapNote.objective}`);
      if (doc.soapNote.assessment) lines.push(`A: ${doc.soapNote.assessment}`);
      if (doc.soapNote.plan) lines.push(`P: ${doc.soapNote.plan}`);
    }
  }
  return lines.join('\n\n') || 'No documentation generated yet.';
}

export function IntelligenceSidebar({
  complaintIds, chiefComplaints, aggregated, maxWeight, investigations, activePhase, ddx,
}: {
  complaintIds: string[]; chiefComplaints: any[]; aggregated: any[]; maxWeight: number;
  investigations: any[]; activePhase: string; ddx: any;
}) {
  if (complaintIds.length === 0) {
    return (
      <div className="text-[10px] text-slate-600 text-center py-10">
        Select symptoms in Chief Complaint to see intelligence.
      </div>
    );
  }

  return (
    <>
      <div className="text-[10px] font-semibold text-slate-600 mb-1">Selected Symptoms</div>
      <div className="flex flex-wrap gap-0.5 mb-3">
        {chiefComplaints.map(c => (
          <span key={c.symptomId} className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            {c.label}
          </span>
        ))}
      </div>

      <div className="text-[10px] font-semibold text-slate-600 mb-1">Top Differentials</div>
      {aggregated.slice(0, 5).map((d: any, i: number) => {
        const pct = Math.round((d.totalWeight / maxWeight) * 100);
        return (
          <div key={d.diseaseId} className="mb-1.5">
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-slate-400">{d.diseaseName}</span>
              <span className={`font-semibold font-mono ${i === 0 ? 'text-cyan-400' : 'text-slate-500'}`}>{pct}%</span>
            </div>
            <div className="w-full h-0.5 rounded bg-white/[.04] overflow-hidden">
              <div className="h-full rounded" style={{ width: `${pct}%`, background: i === 0 ? '#06B6D4' : '#3B82F6' }} />
            </div>
          </div>
        );
      })}

      {investigations.length > 0 && (
        <div className="text-[10px] font-semibold text-slate-600 mt-3 mb-1">
          Key Investigations ({investigations.filter((i: any) => i.priority === 'essential').length} essential)
        </div>
      )}

      {activePhase === 'ddx' && ddx?.traces?.length > 0 && (
        <>
          <div className="text-[10px] font-semibold text-slate-600 mt-3 mb-1">Clinical Reasoning</div>
          {ddx.traces.slice(0, 1).map((t: any) => (
            <div key={t.diseaseId} className="text-[9px] text-slate-500 leading-relaxed">
              <div className="text-slate-400 font-medium mb-0.5">{t.diseaseName}</div>
              {t.supporting?.slice(0, 4).map((s: string, si: number) => (
                <div key={si} className="py-0.5">✓ {s}</div>
              ))}
            </div>
          ))}
        </>
      )}
    </>
  );
}
