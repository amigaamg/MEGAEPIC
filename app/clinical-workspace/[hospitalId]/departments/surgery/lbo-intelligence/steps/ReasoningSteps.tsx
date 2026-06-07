/**
 * LBO Master Encounter — Reasoning & Decision Step Components
 *
 * Enhanced with detailed DDX showing reasons in favor/against
 * from both history and examination for each differential.
 */
'use client';
import React from 'react';
import type { LboApiOutput } from '@/src/engine/domains/lbo/api/lbo-api';

// ── UI Components ──────────────────────────────────────────────────────────

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-1 mb-3">{title}</h3>
      {desc && <p className="text-xs text-gray-500 mb-2">{desc}</p>}
      {children}
    </div>
  );
}

function Pill({ label, color }: { label: string; color: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange' | 'purple' | 'amber' }) {
  const c: Record<string, string> = { green: 'bg-green-100 text-green-800', red: 'bg-red-100 text-red-800', yellow: 'bg-yellow-100 text-yellow-800', blue: 'bg-blue-100 text-blue-800', gray: 'bg-gray-100 text-gray-600', orange: 'bg-orange-100 text-orange-800', purple: 'bg-purple-100 text-purple-800', amber: 'bg-amber-100 text-amber-800' };
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${c[color] || c.gray}`}>{label}</span>;
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${className}`}>
      <h4 className="text-sm font-bold text-gray-700 mb-2">{title}</h4>
      {children}
    </div>
  );
}

function Collapsible({ title, open: defaultOpen, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen ?? false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 transition">
        <span>{title}</span>
        <span className={`transform transition ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
}

// ── DDX Detail Component ────────────────────────────────────────────────────

function DdxDetailCard({ diagnosis, ddx }: { diagnosis: string; ddx: any }) {
  const historyInFavor = ddx.inFavor || [];
  const historyAgainst = ddx.against || [];
  const examInFavor = ddx.examInFavor || [];
  const examAgainst = ddx.examAgainst || [];
  const totalFavor = historyInFavor.length + examInFavor.length;
  const totalAgainst = historyAgainst.length + examAgainst.length;
  const score = totalFavor - totalAgainst;

  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={`border rounded-xl p-4 transition ${score > 0 ? 'border-green-200 bg-green-50/30' : score < 0 ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-800">{diagnosis}</h4>
            {score > 0 && <Pill label={`Net +${score}`} color="green" />}
            {score < 0 && <Pill label={`Net ${score}`} color="red" />}
            {score === 0 && <Pill label="Neutral" color="gray" />}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {historyInFavor.length > 0 && <Pill label={`History: ${historyInFavor.length} in favor`} color="green" />}
            {historyAgainst.length > 0 && <Pill label={`History: ${historyAgainst.length} against`} color="red" />}
            {examInFavor.length > 0 && <Pill label={`Exam: ${examInFavor.length} in favor`} color="green" />}
            {examAgainst.length > 0 && <Pill label={`Exam: ${examAgainst.length} against`} color="red" />}
          </div>
        </div>
        <span className={`text-gray-400 ml-2 transition ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </div>
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
          {/* History In Favor */}
          {historyInFavor.length > 0 && (
            <div>
              <p className="text-xs font-bold text-green-700 uppercase mb-1">History — In Favor</p>
              {historyInFavor.map((f: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-700 mb-1">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <div>
                    <span className="font-medium">{f.finding}</span>
                    <span className="text-gray-500"> — {f.reasoning}</span>
                    {f.weight && <span className="text-gray-400"> (weight: +{f.weight})</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* History Against */}
          {historyAgainst.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-700 uppercase mb-1">History — Against</p>
              {historyAgainst.map((f: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-700 mb-1">
                  <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                  <div>
                    <span className="font-medium">{f.finding}</span>
                    <span className="text-gray-500"> — {f.reasoning}</span>
                    {f.weight && <span className="text-gray-400"> (weight: -{f.weight})</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Exam In Favor */}
          {examInFavor.length > 0 && (
            <div>
              <p className="text-xs font-bold text-green-700 uppercase mb-1">Examination — In Favor</p>
              {examInFavor.map((f: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-700 mb-1">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <div>
                    <span className="font-medium">{f.finding}</span>
                    <span className="text-gray-500"> — {f.reasoning}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Exam Against */}
          {examAgainst.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-700 uppercase mb-1">Examination — Against</p>
              {examAgainst.map((f: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-700 mb-1">
                  <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                  <div>
                    <span className="font-medium">{f.finding}</span>
                    <span className="text-gray-500"> — {f.reasoning}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalFavor === 0 && totalAgainst === 0 && (
            <p className="text-xs text-gray-400 italic">No specific evidence available for this differential at this stage.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Step 6: Clinical Reasoning (Enhanced) ────────────────────────────────────

export function ReasoningStep({ output, loading }: {
  output: LboApiOutput | null; loading: boolean;
}) {
  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /><span className="ml-3 text-gray-500">Running LBO Clinical Reasoning Engine...</span></div>;
  if (!output) return <div className="text-center py-16 text-gray-400"><p className="text-lg">No reasoning data yet.</p><p className="text-sm mt-1">Complete Steps 1-5 (History, Exam, Labs, Imaging) then run the engine.</p></div>;

  const r = output.reasoning;
  const u = (level: string) => {
    if (level === 'immediate' || level === 'emergency') return 'red';
    if (level === 'urgent') return 'orange';
    return 'blue';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Diagnosis"><p className="text-lg font-bold text-gray-900">{r.diagnosis}</p><Pill label={r.subtype.replace(/_/g,' ')} color="blue" /></Card>
        <Card title="Probability"><p className="text-2xl font-bold text-gray-900">{r.probability.toFixed(0)}%</p><Pill label={`Confidence: ${r.confidence}`} color={r.confidence === 'high' ? 'green' : r.confidence === 'medium' ? 'yellow' : 'red'} /></Card>
        <Card title="Clinical Scores">
          <div className="space-y-1 text-sm">
            <p>Volvulus: <span className="font-bold">{r.score.volvulusScore}</span></p>
            <p>Ischaemia: <span className="font-bold">{r.score.ischemiaScore}</span></p>
            <p>Perforation: <span className="font-bold">{r.score.perforationScore}</span></p>
          </div>
        </Card>
        <Card title="Urgency / Risk">
          <Pill label={`Urgency: ${r.score.urgencyLevel}`} color={u(r.score.urgencyLevel)} />
          <div className="mt-1"><Pill label={`Risk: ${r.score.riskStratification}`} color={r.score.riskStratification === 'critical' || r.score.riskStratification === 'high' ? 'red' : r.score.riskStratification === 'moderate' ? 'yellow' : 'green'} /></div>
        </Card>
      </div>

      {/* ── ENHANCED: Detailed Differential Diagnosis ────────────────────── */}
      {r.detailedDdx && r.detailedDdx.length > 0 && (
        <Section title="🧠 Detailed Differential Diagnosis" desc="Evidence-based reasoning for each differential — showing findings in favor and against from history and examination">
          <div className="space-y-2">
            {r.detailedDdx.sort((a, b) => b.netScore - a.netScore).map((ddx, i) => (
              <DdxDetailCard key={i} diagnosis={ddx.diagnosis} ddx={ddx} />
            ))}
          </div>
        </Section>
      )}

      {/* History Summary */}
      {r.historyReasoning && (
        <Collapsible title={`📋 History Summary & Risk Factors (${r.historyReasoning.riskFactors.present.length} identified)`} open>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              {r.historyReasoning.summary}
            </div>
            {r.historyReasoning.riskFactors.present.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Risk Factors Present</p>
                <div className="flex flex-wrap gap-1">
                  {r.historyReasoning.riskFactors.present.map((rf, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${rf.significance === 'major' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{rf.factor}</span>
                  ))}
                </div>
              </div>
            )}
            {r.historyReasoning.complicationScreening.filter(c => c.suspicion === 'high' || c.suspicion === 'moderate').length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Complication Screening</p>
                {r.historyReasoning.complicationScreening.filter(c => c.suspicion === 'high' || c.suspicion === 'moderate').map((c, i) => (
                  <div key={i} className={`text-xs p-2 rounded mb-1 ${c.suspicion === 'high' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    <span className="font-bold">{c.complication}:</span> {c.suspicion} suspicion — {c.triggerFindings.join('; ')}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Collapsible>
      )}

      {/* Exam Impression */}
      {r.examReasoning && (
        <Collapsible title={`🩺 Examination Summary & Clinical Impression`} open>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              {r.examReasoning.impression}
            </div>
            {r.examReasoning.urgencyAssessment && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Urgency:</span>
                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold text-white ${
                  r.examReasoning.urgencyAssessment.level === 'immediate' ? 'bg-red-600' :
                  r.examReasoning.urgencyAssessment.level === 'emergency' ? 'bg-orange-500' :
                  'bg-amber-500'
                }`}>
                  {r.examReasoning.urgencyAssessment.level.toUpperCase()} — {r.examReasoning.urgencyAssessment.timeToIntervention}
                </span>
              </div>
            )}
            {r.examReasoning.peritonismAssessment.present && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
                🚨 {r.examReasoning.peritonismAssessment.likelyAetiology}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Key Positive Findings</p>
                {r.examReasoning.keyPositiveFindings.map((f, i) => (
                  <p key={i} className={`text-xs mb-0.5 ${f.significance === 'critical' ? 'text-red-600 font-bold' : f.significance === 'major' ? 'text-amber-700' : 'text-gray-600'}`}>
                    {f.significance === 'critical' ? '🚨 ' : '• '}{f.finding}
                  </p>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Key Negative Findings</p>
                {r.examReasoning.keyNegativeFindings.map((f, i) => (
                  <p key={i} className="text-xs text-green-700 mb-0.5">✓ {f.finding}</p>
                ))}
              </div>
            </div>
          </div>
        </Collapsible>
      )}

      {/* Red Flags */}
      <Section title="🚨 Red Flags & Safety Alerts">
        <div className="space-y-2">
          {r.redFlags.flags.map((f, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${f.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <span className={`mt-0.5 text-lg ${f.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}>{f.severity === 'critical' ? '🚨' : '⚠️'}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{f.name}</p>
                <p className="text-xs text-gray-600">{f.finding}</p>
                <p className="text-xs text-gray-500 mt-1">Action: {f.action}</p>
              </div>
            </div>
          ))}
          {(!r.redFlags.flags || r.redFlags.flags.length === 0) && <p className="text-sm text-green-600">No red flags triggered.</p>}
        </div>
      </Section>

      {/* Detailed Scores */}
      <Section title="Scoring Breakdown">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(r.score.recommendations || {}).map(([key, val]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3 text-sm"><span className="font-medium capitalize">{key.replace(/_/g,' ')}:</span> {String(val)}</div>
          ))}
        </div>
      </Section>

      {/* AXR */}
      {r.axrInterpretation && (
        <Section title="Abdominal X-Ray Interpretation">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">{r.axrInterpretation.interpretation}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <span><b>Coffee bean:</b> {r.axrInterpretation.coffeeBeanSign ? 'Yes ✅' : 'No'}</span>
              <span><b>Bent inner tube:</b> {r.axrInterpretation.bentInnerTubeSign ? 'Yes ✅' : 'No'}</span>
              <span><b>Free air:</b> {r.axrInterpretation.freeAir ? 'Yes 🚨' : 'No'}</span>
              <span><b>Dilation:</b> {r.axrInterpretation.colonicDilationCm} cm</span>
            </div>
          </div>
        </Section>
      )}

      {/* CT */}
      {r.ctInterpretation && (
        <Section title="CT Abdomen & Pelvis Interpretation">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">{r.ctInterpretation.interpretation}</p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-xs mb-2">
              <span><b>Transition:</b> {r.ctInterpretation.transitionPoint ? 'Yes' : 'No'}</span>
              <span><b>Level:</b> {r.ctInterpretation.transitionLevel}</span>
              <span><b>Swirl:</b> {r.ctInterpretation.mesentericSwirl ? 'Yes' : 'No'}</span>
              <span><b>Bird beak:</b> {r.ctInterpretation.birdBeakSign ? 'Yes' : 'No'}</span>
              <span><b>Apple core:</b> {r.ctInterpretation.appleCoreLesion ? 'Yes' : 'No'}</span>
            </div>
            <p className="text-xs text-gray-500"><b>Subtype:</b> {r.ctInterpretation.subtype} | <b>Ischaemia likelihood:</b> {r.ctInterpretation.ischemiaLikelihood}</p>
          </div>
        </Section>
      )}

      {/* Safety */}
      {output.sepsis && output.sepsis.sepsisPresent && (
        <Section title="Sepsis Alert">
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🦠</span>
              <div>
                <p className="font-bold text-red-800">{output.sepsis.severity.replace(/_/g,' ').toUpperCase()}</p>
                <p className="text-sm text-red-700">{output.sepsis.action}</p>
                {output.sepsis.antibioticRecommendation && <p className="text-xs text-red-600 mt-1">Abx: {output.sepsis.antibioticRecommendation}</p>}
              </div>
            </div>
          </div>
        </Section>
      )}

      {output.ischemia && (output.ischemia.likelihood === 'high' || output.ischemia.likelihood === 'very_high') && (
        <Section title="Ischaemia Alert">
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔴</span>
              <div>
                <p className="font-bold text-red-800">BOWEL ISCHAEMIA — Likelihood: {output.ischemia.likelihood}</p>
                <p className="text-sm text-red-700">{output.ischemia.action}</p>
                <p className="text-xs text-red-600 mt-1">Timeframe: {output.ischemia.timeframe}</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Contradictions */}
      {output.contradictions.contradictions.length > 0 && (
        <Section title="Clinical Contradictions">
          <div className="space-y-2">
            {output.contradictions.contradictions.map((c, i) => (
              <div key={i} className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-sm">
                <p className="font-semibold text-purple-800">{c.type.replace(/_/g,' ')}</p>
                <p className="text-purple-700">{c.explanation}</p>
                <p className="text-xs text-purple-500 mt-1">Resolution: {c.resolution}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Missing Data */}
      {output.missingData.missingItems.length > 0 && (
        <Section title="Missing Data">
          <div className="space-y-1">
            {output.missingData.missingItems.map((m, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded ${m.urgency === 'critical' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                <span className="font-semibold uppercase w-16">{m.urgency}</span>
                <span className="w-20 text-gray-500">{m.category}</span>
                <span className="flex-1">{m.label || m.field}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Explanations */}
      <Section title="Decision Explanations">
        {Object.entries(output.explanation).map(([key, exp]) => (
          <div key={key} className="mb-4">
            <h4 className="text-sm font-bold text-gray-700 capitalize mb-1">{key.replace(/_/g,' ')}</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-700">{exp.finalDecision}</p>
              <p className="text-xs text-gray-500 mt-1">{exp.auditTrail}</p>
              <div className="mt-2 space-y-1">
                {exp.steps.map((s, j) => (
                  <div key={j} className="text-xs text-gray-600 flex gap-2">
                    <span className="text-gray-400 w-6 shrink-0">[{s.step}]</span>
                    <span>{s.conclusion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Section>

      {/* Bayesian */}
      {output.bayesianUpdates && (
        <Section title="Bayesian Differential Probabilities">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(output.bayesianUpdates).map(([disease, info]) => (
              <div key={disease} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                <p className="text-sm font-medium text-gray-700 capitalize">{disease.replace(/_/g,' ')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{(info.probability * 100).toFixed(0)}%</p>
                <p className="text-xs text-gray-400">{info.updates.length} evidence updates</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Systemic */}
      {output.systemicRisks && (
        <Section title="Systemic Risk Assessment">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Perioperative Risk</span>
              <Pill label={output.systemicRisks.perioperativeRisk} color={output.systemicRisks.perioperativeRisk === 'high' || output.systemicRisks.perioperativeRisk === 'very_high' ? 'red' : output.systemicRisks.perioperativeRisk === 'moderate' ? 'yellow' : 'green'} />
            </div>
            {output.systemicRisks.managementModifications.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs font-semibold text-gray-500">Management Modifications:</p>
                {output.systemicRisks.managementModifications.map((m, i) => (
                  <p key={i} className="text-sm text-gray-600">• {m}</p>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Step 7: Management ────────────────────────────────────────────────────

interface ManagementStepProps {
  management: string;
  operativeRecommended: string;
  stomaLikelihood: string;
  icuRequired: boolean;
  onSave: (data: { plan: string; operativeApproach: string; stomaDiscussion: string; icuAdmission: boolean; consentObtained: boolean; ngTube: boolean; ivFluids: string; antibiotics: string; catheter: boolean; analgesia: string; niv: boolean }) => void;
  initial?: {
    plan?: string; operativeApproach?: string; stomaDiscussion?: string;
    icuAdmission?: boolean; consentObtained?: boolean; ngTube?: boolean;
    ivFluids?: string; antibiotics?: string; catheter?: boolean; analgesia?: string; niv?: boolean;
  };
}

export function ManagementStep({ management, operativeRecommended, stomaLikelihood, icuRequired, onSave, initial }: ManagementStepProps) {
  const [form, setForm] = React.useState({
    plan: initial?.plan || '',
    operativeApproach: initial?.operativeApproach || '',
    stomaDiscussion: initial?.stomaDiscussion || '',
    icuAdmission: initial?.icuAdmission ?? icuRequired,
    consentObtained: initial?.consentObtained ?? false,
    ngTube: initial?.ngTube ?? true,
    ivFluids: initial?.ivFluids || 'Crystalloid (Plasmalyte / Hartmann\'s) 1L stat, then 125 mL/hr',
    antibiotics: initial?.antibiotics || 'Ceftriaxone 2g IV + Metronidazole 500mg IV (or Piperacillin-Tazobactam 4.5g IV)',
    catheter: initial?.catheter ?? true,
    analgesia: initial?.analgesia || 'Morphine 5-10mg IV PRN + Paracetamol 1g IV QDS',
    niv: initial?.niv ?? false,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <Section title="Engine-Recommended Plan">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800">{management}</p>
          <div className="flex gap-2 mt-2">
            <Pill label={`Operative: ${operativeRecommended}`} color="blue" />
            <Pill label={`Stoma: ${stomaLikelihood}`} color={stomaLikelihood === 'high' ? 'red' : stomaLikelihood === 'moderate' ? 'yellow' : 'green'} />
            <Pill label={`ICU: ${icuRequired ? 'Required' : 'Not indicated'}`} color={icuRequired ? 'red' : 'green'} />
          </div>
        </div>
      </Section>
      <Section title="Initial Resuscitation & Preparatory Orders">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.ngTube} onChange={e => set('ngTube', e.target.checked)} className="w-4 h-4" /> Nasogastric tube (Ryle's) — free drainage</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.catheter} onChange={e => set('catheter', e.target.checked)} className="w-4 h-4" /> Urinary catheter — monitor urine output</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.niv} onChange={e => set('niv', e.target.checked)} className="w-4 h-4" /> NIV / high-flow oxygen if respiratory distress</label>
          </div>
          <div className="space-y-2">
            <div><p className="text-xs font-medium text-gray-500 mb-1">IV Fluids</p><textarea value={form.ivFluids} onChange={e => set('ivFluids', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><p className="text-xs font-medium text-gray-500 mb-1">Antibiotics</p><textarea value={form.antibiotics} onChange={e => set('antibiotics', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><p className="text-xs font-medium text-gray-500 mb-1">Analgesia</p><textarea value={form.analgesia} onChange={e => set('analgesia', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          </div>
        </div>
      </Section>
      <Section title="Operative Planning">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div><p className="text-xs font-medium text-gray-500 mb-1">Operative Approach</p><textarea value={form.operativeApproach} onChange={e => set('operativeApproach', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Emergency laparotomy, sigmoid colectomy with Hartmann's procedure" /></div>
          <div><p className="text-xs font-medium text-gray-500 mb-1">Stoma Discussion</p><textarea value={form.stomaDiscussion} onChange={e => set('stomaDiscussion', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Likely end colostomy; risk of reversal discussed" /></div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.consentObtained} onChange={e => set('consentObtained', e.target.checked)} className="w-4 h-4" /> Consent obtained for surgery</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.icuAdmission} onChange={e => set('icuAdmission', e.target.checked)} className="w-4 h-4" /> ICU / HDU admission planned</label>
        </div>
      </Section>
      <div className="flex justify-end">
        <button onClick={() => onSave(form)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm">Save Management Plan</button>
      </div>
    </div>
  );
}

// ── Step 8: Operative Note ─────────────────────────────────────────────────

interface OperativeNoteData {
  preOpDiagnosis: string; postOpDiagnosis: string; procedurePerformed: string;
  surgeon: string; assistant: string; anaesthesia: string; anaesthetist: string;
  incision: string; findings: string; procedureDetails: string;
  bloodLoss: string; fluidsGiven: string; urineOutput: string;
  specimens: string; complications: string; drain: string;
  stomaCreated: boolean; stomaType: string; closureMethod: string;
  antibioticDoseGiven: boolean; dvtProphylaxis: string; disposition: string;
}

export function OperativeNoteStep({ onSave, initial }: {
  onSave: (d: OperativeNoteData) => void; initial?: Partial<OperativeNoteData>;
}) {
  const [d, setD] = React.useState<OperativeNoteData>({
    preOpDiagnosis: '', postOpDiagnosis: '', procedurePerformed: '',
    surgeon: '', assistant: '', anaesthesia: 'general', anaesthetist: '',
    incision: 'midline laparotomy', findings: '', procedureDetails: '',
    bloodLoss: '', fluidsGiven: '', urineOutput: '',
    specimens: '', complications: 'none', drain: '',
    stomaCreated: false, stomaType: '', closureMethod: 'PDS loop + staples',
    antibioticDoseGiven: true, dvtProphylaxis: 'TED stockings + LMWH', disposition: 'ICU',
    ...initial,
  });

  const set = <K extends keyof OperativeNoteData>(k: K, v: OperativeNoteData[K]) => setD(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <Section title="Pre-Operative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div><p className="text-xs text-gray-500 mb-1">Pre-op Diagnosis</p><textarea value={d.preOpDiagnosis} onChange={e => set('preOpDiagnosis', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Large bowel obstruction secondary to sigmoid volvulus" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Post-op Diagnosis</p><textarea value={d.postOpDiagnosis} onChange={e => set('postOpDiagnosis', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Sigmoid volvulus with viable bowel" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Procedure</p><textarea value={d.procedurePerformed} onChange={e => set('procedurePerformed', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Emergency laparotomy, sigmoid colectomy, end colostomy (Hartmann's)" /></div>
        </div>
      </Section>
      <Section title="Team & Anaesthesia">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6">
          <div><p className="text-xs text-gray-500 mb-1">Surgeon</p><input value={d.surgeon} onChange={e => set('surgeon', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Assistant</p><input value={d.assistant} onChange={e => set('assistant', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Anaesthetist</p><input value={d.anaesthetist} onChange={e => set('anaesthetist', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Anaesthesia</p><input value={d.anaesthesia} onChange={e => set('anaesthesia', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
        </div>
      </Section>
      <Section title="Operative Findings & Procedure">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div><p className="text-xs text-gray-500 mb-1">Findings</p><textarea value={d.findings} onChange={e => set('findings', e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Sigmoid colon twisted 540° anticlockwise; dilated to 12 cm; no evidence of ischaemia; proximal colon dilated; distal colon collapsed" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Procedure Details</p><textarea value={d.procedureDetails} onChange={e => set('procedureDetails', e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Midline laparotomy. Volvulus detorted. Sigmoid colon mobilised. Vessels ligated. Bowel transected at rectosigmoid junction and descending colon. End colostomy fashioned in left iliac fossa. Rectal stump closed. Abdomen closed in layers." /></div>
        </div>
      </Section>
      <Section title="Intra-Operative Data">
        <div className="grid grid-cols-3 gap-x-6">
          <div><p className="text-xs text-gray-500 mb-1">Blood Loss</p><input value={d.bloodLoss} onChange={e => set('bloodLoss', e.target.value)} placeholder="e.g. 200 mL" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">IV Fluids Given</p><input value={d.fluidsGiven} onChange={e => set('fluidsGiven', e.target.value)} placeholder="e.g. 2.5L crystalloid" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Urine Output</p><input value={d.urineOutput} onChange={e => set('urineOutput', e.target.value)} placeholder="e.g. 400 mL" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
        </div>
      </Section>
      <Section title="Specimens & Closure">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div><p className="text-xs text-gray-500 mb-1">Specimens Sent</p><textarea value={d.specimens} onChange={e => set('specimens', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Sigmoid colon — histology" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Complications</p><textarea value={d.complications} onChange={e => set('complications', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="None" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Closure Method</p><input value={d.closureMethod} onChange={e => set('closureMethod', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Drain</p><input value={d.drain} onChange={e => set('drain', e.target.value)} placeholder="e.g. Pelvic drain 20Fr" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.stomaCreated} onChange={e => set('stomaCreated', e.target.checked)} className="w-4 h-4" /> Stoma created</label>
          {d.stomaCreated && <div><p className="text-xs text-gray-500 mb-1">Stoma Type</p><input value={d.stomaType} onChange={e => set('stomaType', e.target.value)} placeholder="e.g. End colostomy, left iliac fossa" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.antibioticDoseGiven} onChange={e => set('antibioticDoseGiven', e.target.checked)} className="w-4 h-4" /> Intra-op antibiotics given</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!d.dvtProphylaxis} onChange={e => set('dvtProphylaxis', e.target.checked ? 'TED + LMWH' : '')} className="w-4 h-4" /> DVT prophylaxis applied</label>
        </div>
      </Section>
      <Section title="Post-Operative Disposition">
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-500">Disposition to:</label>
          {['ICU','HDU','Ward','Recovery'].map(p => (
            <label key={p} className="flex items-center gap-1 text-sm cursor-pointer">
              <input type="radio" name="disposition" checked={d.disposition === p} onChange={() => set('disposition', p)} className="w-4 h-4" /> {p}
            </label>
          ))}
        </div>
      </Section>
      <div className="flex justify-end">
        <button onClick={() => onSave(d)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm">Save Operative Note</button>
      </div>
    </div>
  );
}

// ── Step 9: Discharge ──────────────────────────────────────────────────────

interface DischargeData {
  dischargeDate: string; admissionDate: string; finalDiagnosis: string;
  operationsPerformed: string; hospitalCourse: string;
  dischargeMedications: string; woundCondition: string;
  stomaStatus: string; diet: string; activityLevel: string;
  followUpAppointment: string; followUpWith: string;
  histologyPending: boolean; reversalPlanned: boolean;
  warningSigns: string; patientInstructed: boolean;
}

export function DischargeStep({ onSave, initial }: {
  onSave: (d: DischargeData) => void; initial?: Partial<DischargeData>;
}) {
  const [d, setD] = React.useState<DischargeData>({
    dischargeDate: new Date().toISOString().split('T')[0], admissionDate: '',
    finalDiagnosis: 'Sigmoid volvulus — Large bowel obstruction', operationsPerformed: '',
    hospitalCourse: '', dischargeMedications: '', woundCondition: 'Healing well, no signs of infection',
    stomaStatus: 'Functional, passing flatus', diet: 'Normal diet as tolerated',
    activityLevel: 'Full mobilisation, no heavy lifting for 6 weeks',
    followUpAppointment: '2 weeks', followUpWith: 'Surgical outpatient clinic',
    histologyPending: true, reversalPlanned: false,
    warningSigns: 'Fever, increasing abdominal pain, vomiting, wound discharge, stoma bleeding or prolapse, inability to pass flatus',
    patientInstructed: false, ...initial,
  });

  const set = <K extends keyof DischargeData>(k: K, v: DischargeData[K]) => setD(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <Section title="Summary">
        <div className="grid grid-cols-2 gap-x-6">
          <div><p className="text-xs text-gray-500 mb-1">Admission Date</p><input type="date" value={d.admissionDate} onChange={e => set('admissionDate', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Discharge Date</p><input type="date" value={d.dischargeDate} onChange={e => set('dischargeDate', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Final Diagnosis</p><input value={d.finalDiagnosis} onChange={e => set('finalDiagnosis', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Operations Performed</p><textarea value={d.operationsPerformed} onChange={e => set('operationsPerformed', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Hospital Course</p><textarea value={d.hospitalCourse} onChange={e => set('hospitalCourse', e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
        </div>
      </Section>
      <Section title="On Discharge">
        <div className="grid grid-cols-2 gap-x-6">
          <div><p className="text-xs text-gray-500 mb-1">Medications</p><textarea value={d.dischargeMedications} onChange={e => set('dischargeMedications', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Wound Condition</p><textarea value={d.woundCondition} onChange={e => set('woundCondition', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Stoma Status</p><textarea value={d.stomaStatus} onChange={e => set('stomaStatus', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Diet</p><textarea value={d.diet} onChange={e => set('diet', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Activity</p><textarea value={d.activityLevel} onChange={e => set('activityLevel', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
        </div>
      </Section>
      <Section title="Follow-Up Plan">
        <div className="grid grid-cols-2 gap-x-6">
          <div><p className="text-xs text-gray-500 mb-1">Follow-Up Appointment</p><input value={d.followUpAppointment} onChange={e => set('followUpAppointment', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-gray-500 mb-1">Review With</p><input value={d.followUpWith} onChange={e => set('followUpWith', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.histologyPending} onChange={e => set('histologyPending', e.target.checked)} className="w-4 h-4" /> Histology pending — results to be reviewed at follow-up</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.reversalPlanned} onChange={e => set('reversalPlanned', e.target.checked)} className="w-4 h-4" /> Stoma reversal planned (3-6 months)</label>
        </div>
      </Section>
      <Section title="Patient Information">
        <div className="space-y-2">
          <div><p className="text-xs text-gray-500 mb-1">Warning Signs to Return</p><textarea value={d.warningSigns} onChange={e => set('warningSigns', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.patientInstructed} onChange={e => set('patientInstructed', e.target.checked)} className="w-4 h-4" /> Patient instructed and understands warning signs</label>
        </div>
      </Section>
      <div className="flex justify-end">
        <button onClick={() => onSave(d)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm">Save Discharge Summary</button>
      </div>
    </div>
  );
}
