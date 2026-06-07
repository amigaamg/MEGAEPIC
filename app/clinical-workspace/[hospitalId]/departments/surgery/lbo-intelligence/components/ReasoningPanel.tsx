'use client';
import React, { useState } from 'react';
import type { RegistrationData, HistoryData, ExamData, InvestigationsData, ImagingData } from '@/src/engine/domains/lbo/lbo-records';
import { reasonHistory } from '@/src/engine/domains/lbo/reasoning/lbo-history-reasoning';
import { reasonExam } from '@/src/engine/domains/lbo/reasoning/lbo-exam-reasoning';
import { reasonInvestigations } from '@/src/engine/domains/lbo/reasoning/lbo-investigation-reasoning';
import { checkLboRedFlags } from '@/src/engine/clinical-rules/lbo';

function Pill({ label, color }: { label: string; color: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange' | 'purple' | 'amber' }) {
  const c: Record<string, string> = {
    green: 'bg-green-100 text-green-800', red: 'bg-red-100 text-red-800', yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800', gray: 'bg-gray-100 text-gray-600', orange: 'bg-orange-100 text-orange-800',
    purple: 'bg-purple-100 text-purple-800', amber: 'bg-amber-100 text-amber-800',
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${c[color] || c.gray}`}>{label}</span>;
}

interface ReasoningPanelProps {
  stepId: string;
  registration: RegistrationData;
  history: HistoryData;
  exam: ExamData;
  investigations: InvestigationsData;
  imaging: ImagingData;
  engineOutput: any;
  engineLoading: boolean;
}

function PanelSection({ title, children, color = 'gray', collapsible = false }: { title: string; children: React.ReactNode; color?: string; collapsible?: boolean }) {
  const [open, setOpen] = useState(!collapsible);
  const borderColors: Record<string, string> = { red: 'border-red-200', green: 'border-green-200', blue: 'border-blue-200', amber: 'border-amber-200', purple: 'border-purple-200', gray: 'border-gray-200' };
  const headerColors: Record<string, string> = { red: 'bg-red-50 text-red-700', green: 'bg-green-50 text-green-700', blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700', purple: 'bg-purple-50 text-purple-700', gray: 'bg-gray-50 text-gray-600' };
  return (
    <div className={`border ${borderColors[color] || borderColors.gray} rounded-lg overflow-hidden`}>
      <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wide flex items-center justify-between ${headerColors[color] || headerColors.gray}`}>
        <span>{title}</span>
        {collapsible && <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-gray-600 text-base leading-none">{open ? '−' : '+'}</button>}
      </div>
      {open && <div className="p-3 text-xs space-y-1">{children}</div>}
    </div>
  );
}

function analyzeDrugRisk(drugHistory: string): { score: number; flagged: { drug: string; risk: string }[] } {
  const dh = drugHistory.toLowerCase();
  const flagged: { drug: string; risk: string }[] = [];
  let score = 0;
  const patterns: [RegExp, string, string, number][] = [
    [/(?:morphine|codeine|tramadol|fentanyl|oxycodone|dihydrocodeine)/, 'opioid', 'Opioid — causes constipation, ileus', 30],
    [/(?:amitriptyline|nortriptyline|imipramine|dosulepin)/, 'tca', 'Tricyclic antidepressant — anticholinergic, constipating', 20],
    [/(?:oxybutynin|tolterodine|solifenacin|darifenacin)/, 'anticholinergic', 'Anticholinergic — reduces gut motility', 20],
    [/(?:verapamil|nifedipine|amlodipine|felodipine)/, 'ccb', 'Calcium channel blocker — can cause constipation', 10],
    [/(?:iron|ferrous|ferric)/, 'iron', 'Iron supplements — common cause of constipation', 10],
    [/(?:loperamide|codeine phosphate)/, 'antidiarrhoeal', 'Antidiarrhoeal — constipating', 15],
    [/(?:chlorpromazine|haloperidol|olanzapine|clozapine)/, 'antipsychotic', 'Antipsychotic — anticholinergic effect', 15],
  ];
  for (const [regex, id, risk, weight] of patterns) {
    if (regex.test(dh)) { flagged.push({ drug: id, risk }); score += weight; }
  }
  return { score, flagged };
}

export default function ReasoningPanel({ stepId, registration, history, exam, investigations, imaging, engineOutput, engineLoading }: ReasoningPanelProps) {
  const [expandedDdx, setExpandedDdx] = useState<string | null>(null);

  const hasHistory = history.presentingComplaint || history.hpiOnset || history.hpiPainCharacter;
  const hasExam = exam.distensionSeverity !== 'none' || exam.vitals.heartRate !== 80 || exam.abdominalTenderness !== 'none';
  const hasLabs = investigations.wbc > 0 || investigations.lactate > 0;
  const hasImaging = imaging.axrCoffeeBeanSign || imaging.ctMesentericSwirl;

  let historyReasoning: ReturnType<typeof reasonHistory> | null = null;
  try {
    if (hasHistory) historyReasoning = reasonHistory(history, registration);
  } catch { /* ignore */ }

  let examReasoning: ReturnType<typeof reasonExam> | null = null;
  try {
    if (hasExam && hasHistory) examReasoning = reasonExam(exam, history, registration);
  } catch { /* ignore */ }

  let investigationReasoning: ReturnType<typeof reasonInvestigations> | null = null;
  try {
    if (hasLabs) investigationReasoning = reasonInvestigations(history, exam, investigations, imaging, registration);
  } catch { /* ignore */ }

  const liveRedFlags: { name: string; severity: string; finding: string; action?: string }[] = [];
  if (exam.vitals.heartRate > 100) liveRedFlags.push({ name: 'Tachycardia', severity: 'warning', finding: `HR ${exam.vitals.heartRate}`, action: 'Fluid resuscitation, ECG, consider ischaemia' });
  if (exam.vitals.systolicBP < 90) liveRedFlags.push({ name: 'Hypotension', severity: 'critical', finding: `BP ${exam.vitals.systolicBP}`, action: 'Urgent fluid resuscitation, vasopressors if needed' });
  if (exam.vitals.temperature > 38) liveRedFlags.push({ name: 'Fever', severity: 'warning', finding: `Temp ${exam.vitals.temperature}°C`, action: 'Sepsis screen, start broad-spectrum antibiotics' });
  if (exam.peritonism || exam.rigidity) liveRedFlags.push({ name: 'Peritonism', severity: 'critical', finding: 'Peritoneal signs present', action: 'Emergency laparotomy indicated — suspect perforation or ischaemia' });
  if (investigations.lactate > 4) liveRedFlags.push({ name: 'Lactate >4', severity: 'critical', finding: `Lactate ${investigations.lactate} — suspect ischaemia`, action: 'Urgent surgical review, emergency laparotomy if confirmed' });
  else if (investigations.lactate > 2) liveRedFlags.push({ name: 'Lactate elevated', severity: 'warning', finding: `Lactate ${investigations.lactate}`, action: 'Monitor closely, repeat in 4-6 hours, fluid resuscitate' });
  if (investigations.wbc > 15) liveRedFlags.push({ name: 'Leukocytosis', severity: 'warning', finding: `WBC ${investigations.wbc}`, action: 'Concern for ischaemia or sepsis' });
  if (investigations.creatinine > 110) liveRedFlags.push({ name: 'AKI', severity: 'warning', finding: `Creat ${investigations.creatinine}`, action: 'IV fluids, monitor UOP, nephrotoxin avoidance' });
  if (exam.vitals.spO2 < 92) liveRedFlags.push({ name: 'Hypoxia', severity: 'critical', finding: `SpO2 ${exam.vitals.spO2}%`, action: 'Oxygen therapy, consider ABG, ? aspiration' });

  const drugRisk = analyzeDrugRisk(history.drugHistory);
  const showGynae = registration.sex === 'female' && registration.age >= 10 && registration.age <= 55;

  const stepActions: Record<string, string[]> = {
    registration: ['Complete patient demographics', 'Record contact & referring info', 'Check allergies & anticoagulants'],
    history: ['Complete full HPI (SOCRATES)', 'Tick negative history where absent', 'Document PMH, drug, family, social', 'Complete ROS'],
    examination: ['Record full vital signs', 'Abdominal exam: inspection → auscultation → palpation', 'DRE mandatory in LBO', 'Note peritonism presence/absence'],
    investigations: ['FBC, U&E, CRP, Lactate — core LBO labs', 'Consider ABG, crossmatch, ECG', 'Monitor for AKI, anaemia, acidosis'],
    imaging: ['AXR (erect chest + supine abdomen) — first line', 'CT abdomen/pelvis with IV contrast — gold standard', 'Assess for volvulus, cancer, perforation'],
    reasoning: ['Run engine to generate diagnosis', 'Review DDX with reasons for/against', 'Check red flags and complications'],
    management: ['NPO, IV fluids, NG tube, catheter', 'Analgesia, antibiotics if septic', 'Urgent vs emergency vs elective plan'],
    operative: ['Document pre-op diagnosis & plan', 'Consent discussion & documentation', 'Prepare for theatre'],
    discharge: ['Final diagnosis & operation', 'Follow-up plan & red flags', 'Stoma care plan if applicable'],
  };

  return (
    <div className="space-y-3">
      <div className="text-center mb-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-white uppercase tracking-wider">
          {stepId.replace(/_/g, ' ')}
        </span>
        {stepActions[stepId] && (
          <div className="mt-2 text-[10px] text-gray-500 text-left bg-gray-50 rounded-lg p-2 space-y-0.5">
            {stepActions[stepId].map((a, i) => <p key={i} className="flex items-start gap-1"><span className="text-blue-500 shrink-0">→</span><span>{a}</span></p>)}
          </div>
        )}
      </div>

      {/* RED FLAGS */}
      {liveRedFlags.length > 0 && (
        <PanelSection title={`🚨 ALERTS (${liveRedFlags.length})`} color="red">
          {liveRedFlags.map((rf, i) => (
            <div key={i} className={`p-2 rounded text-xs ${rf.severity === 'critical' ? 'bg-red-100 text-red-800 font-bold' : 'bg-amber-50 text-amber-800'}`}>
              <div className="flex items-start gap-1">
                <span className="shrink-0">{rf.severity === 'critical' ? '🚨' : '⚠️'}</span>
                <div>
                  <span className="font-bold">{rf.name}:</span> {rf.finding}
                  {rf.action && <p className="text-gray-600 font-normal mt-0.5">{rf.action}</p>}
                </div>
              </div>
            </div>
          ))}
        </PanelSection>
      )}

      {/* DDX — FULL REASONING */}
      {historyReasoning && historyReasoning.ddxClues.length > 0 && (
        <PanelSection title={`📊 Differential Diagnosis (history + exam)`} color="blue" collapsible>
          {historyReasoning.ddxClues
            .sort((a, b) => b.netScore - a.netScore)
            .slice(0, 4)
            .map((ddx, i) => {
              const examShift = examReasoning?.ddxRefinement.find(e => e.diagnosis === ddx.diagnosis);
              const isExpanded = expandedDdx === ddx.diagnosis;
              const totalFavor = ddx.inFavor.length + (examShift?.inFavor.length || 0);
              const totalAgainst = ddx.against.length + (examShift?.against.length || 0);
              return (
                <div key={i} className="border border-gray-100 rounded-lg overflow-hidden mb-1">
                  <button onClick={() => setExpandedDdx(isExpanded ? null : ddx.diagnosis)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 text-left">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        ddx.netScore > 10 ? 'bg-green-500' : ddx.netScore > 0 ? 'bg-amber-500' : 'bg-red-400'
                      }`}>
                        {ddx.netScore > 0 ? '+' : ''}{ddx.netScore}
                      </span>
                      <span className="text-xs font-semibold text-gray-800 truncate">{ddx.diagnosis}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-green-600 text-[10px] font-medium">{totalFavor} for</span>
                      <span className="text-red-500 text-[10px] font-medium">{totalAgainst} against</span>
                      <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-2 space-y-1 bg-gray-50/50">
                      <p className="text-[10px] font-bold text-green-700 uppercase mt-1">In Favor — from History</p>
                      {ddx.inFavor.map((f, fi) => (
                        <div key={fi} className="bg-green-50 border border-green-100 rounded p-1.5">
                          <p className="text-[11px] text-green-800 font-medium">{f.finding} <span className="font-normal text-green-600">(+{f.weight})</span></p>
                          <p className="text-[10px] text-green-700 mt-0.5 italic">{f.reasoning}</p>
                        </div>
                      ))}
                      {examShift && examShift.inFavor.length > 0 && (
                        <>
                          <p className="text-[10px] font-bold text-green-700 uppercase mt-1">In Favor — from Examination</p>
                          {examShift.inFavor.map((f, fi) => (
                            <div key={fi} className="bg-green-50 border border-green-100 rounded p-1.5">
                              <p className="text-[11px] text-green-800 font-medium">{f.finding}</p>
                              <p className="text-[10px] text-green-700 mt-0.5 italic">{f.reasoning}</p>
                            </div>
                          ))}
                        </>
                      )}
                      <p className="text-[10px] font-bold text-red-600 uppercase mt-1">Against</p>
                      {[...ddx.against, ...(examShift?.against || [])].map((a, ai) => (
                        <div key={ai} className="bg-red-50 border border-red-100 rounded p-1.5">
                          <p className="text-[11px] text-red-700 font-medium">{'finding' in a ? (a as any).finding : (a as any).finding} <span className="font-normal text-red-500">{'weight' in a ? `(-${(a as any).weight})` : ''}</span></p>
                          <p className="text-[10px] text-red-600 mt-0.5 italic">{'reasoning' in a ? (a as any).reasoning : (a as any).reasoning}</p>
                        </div>
                      ))}
                      {examShift && (examShift.shift === 'up' || examShift.shift === 'down') && (
                        <p className={`text-[10px] font-medium mt-1 ${examShift.shift === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                          {examShift.shift === 'up' ? '↑' : '↓'} Likelihood {examShift.shift === 'up' ? 'increased' : 'decreased'} after exam
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          <p className="text-gray-400 pt-1 border-t border-gray-100 mt-1 text-[10px]">Click each DDX to see reasoning behind the score</p>
        </PanelSection>
      )}

      {/* RISK FACTORS */}
      {historyReasoning && historyReasoning.riskFactors.present.length > 0 && (
        <PanelSection title={`🔎 Risk Factors (${historyReasoning.riskFactors.present.length})`} color="amber">
          <div className="flex flex-wrap gap-1">
            {historyReasoning.riskFactors.present.map((rf, i) => (
              <span key={i} className={`px-1.5 py-0.5 rounded text-xs font-medium ${rf.significance === 'major' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                {rf.factor}
              </span>
            ))}
          </div>
        </PanelSection>
      )}

      {/* DRUG RISK */}
      {drugRisk.flagged.length > 0 && (
        <PanelSection title={`💊 Drug Risk (score: ${drugRisk.score})`} color="red">
          {drugRisk.flagged.map((d, i) => (
            <div key={i} className="flex items-start gap-1 text-red-700">
              <span>⚠️</span>
              <span className="capitalize font-medium">{d.drug}:</span>
              <span className="text-gray-600">{d.risk}</span>
            </div>
          ))}
          {drugRisk.score >= 30 && (
            <div className="mt-1 p-1.5 bg-red-50 border border-red-200 rounded text-red-700 font-bold text-xs">
              HIGH constipation risk — consider bowel regimen (laxatives, stool softeners)
            </div>
          )}
        </PanelSection>
      )}

      {/* COMPLICATION SCREENING */}
      {historyReasoning && historyReasoning.complicationScreening.filter(c => c.suspicion !== 'low').length > 0 && (
        <PanelSection title="⚠️ Complication Screening" color="purple">
          {historyReasoning.complicationScreening.filter(c => c.suspicion !== 'low').map((c, i) => (
            <div key={i} className={`text-xs p-1.5 rounded ${c.suspicion === 'high' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
              <span className="font-bold">{c.complication}:</span> <Pill label={c.suspicion} color={c.suspicion === 'high' ? 'red' : 'yellow'} />
              <p className="text-gray-600 mt-0.5 text-[10px]">Triggers: {c.triggerFindings.join(', ')}</p>
            </div>
          ))}
        </PanelSection>
      )}

      {/* EXAM IMPRESSION */}
      {examReasoning && (
        <PanelSection title="🩺 Exam Impression" color="green">
          <p className="text-gray-700 leading-relaxed text-[11px]">{examReasoning.impression}</p>
          {examReasoning.urgencyAssessment && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white ${
                examReasoning.urgencyAssessment.level === 'immediate' ? 'bg-red-600' :
                examReasoning.urgencyAssessment.level === 'emergency' ? 'bg-orange-500' : 'bg-amber-500'
              }`}>
                {examReasoning.urgencyAssessment.level.toUpperCase()}
              </span>
              <span className="text-gray-500 text-[10px]">{examReasoning.urgencyAssessment.timeToIntervention}</span>
            </div>
          )}
          {examReasoning.peritonismAssessment && (
            <div className="mt-2 p-1.5 rounded text-xs bg-gray-50 border border-gray-200">
              <p className="font-medium text-gray-700">Peritonism: {examReasoning.peritonismAssessment.pattern}</p>
              <p className="text-gray-600 text-[10px]">{examReasoning.peritonismAssessment.likelyAetiology}</p>
            </div>
          )}
        </PanelSection>
      )}

      {/* GYNAE INDICATOR */}
      {showGynae && !history.gynae?.deniesPregnancy && (
        <PanelSection title="♀ Gynaecological Context" color="purple">
          <p className="text-purple-700">Female, reproductive age ({registration.age}). Consider ectopic pregnancy, ovarian cyst, gynaecological cause of distension.</p>
        </PanelSection>
      )}

      {/* INVESTIGATION SUGGESTIONS */}
      {stepId === 'investigations' && investigationReasoning && investigationReasoning.suggestions.length > 0 && (
        <PanelSection title="🧪 Recommended Investigations" color="blue">
          {investigationReasoning.suggestions.filter(s => s.urgency === 'emergency' || s.urgency === 'urgent').slice(0, 8).map((s, i) => (
            <div key={i} className="p-1.5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-1">
                <Pill label={s.urgency} color={s.urgency === 'emergency' ? 'red' : s.urgency === 'urgent' ? 'amber' : 'blue'} />
                <span className="font-medium text-gray-800">{s.test}</span>
              </div>
              <p className="text-[10px] text-gray-600 mt-0.5">{s.rationale}</p>
            </div>
          ))}
        </PanelSection>
      )}

      {/* LAB INTERPRETATION */}
      {hasLabs && (
        <PanelSection title="🧪 Lab Interpretation" color="blue">
          {investigations.wbc > 11 && <p className="text-amber-700">WBC {investigations.wbc} — elevated</p>}
          {investigations.wbc > 15 && <p className="text-red-600 font-bold">WBC {investigations.wbc} — concerning for ischaemia</p>}
          {investigations.lactate > 2 && investigations.lactate <= 4 && <p className="text-amber-700">Lactate {investigations.lactate} — mild elevation, early ischaemia or hypoperfusion</p>}
          {investigations.lactate > 4 && <p className="text-red-600 font-bold">🚨 Lactate {investigations.lactate} — suspect ischaemia, emergency laparotomy</p>}
          {investigations.creatinine > 110 && <p className="text-amber-700">Creatinine {investigations.creatinine} — AKI risk, likely prerenal from dehydration</p>}
          {investigations.hemoglobin > 0 && investigations.hemoglobin < 10 && <p className="text-amber-700">Hb {investigations.hemoglobin} — anaemia, suspect malignancy or acute blood loss</p>}
          {investigations.crp > 200 && <p className="text-amber-700">CRP {investigations.crp} — significant inflammation, complication until proven otherwise</p>}
          {investigations.ph < 7.35 && <p className="text-red-600 font-bold">pH {investigations.ph} — metabolic acidosis correlates with ischaemia</p>}
        </PanelSection>
      )}

      {/* IMAGING INTERPRETATION */}
      {hasImaging && (
        <PanelSection title="🖼️ Imaging Interpretation" color="green">
          {imaging.axrCoffeeBeanSign && <p className="text-green-700 font-bold">✅ AXR: Coffee bean sign = sigmoid volvulus (diagnostic)</p>}
          {imaging.axrFreeAir && <p className="text-red-600 font-bold">🚨 AXR: Free air = perforation, emergency laparotomy</p>}
          {imaging.axrColonicDilationCm > 10 && <p className="text-amber-700">{'⚠️ Colonic dilation >10 cm, perforation risk'}</p>}
          {imaging.ctMesentericSwirl && <p className="text-green-700 font-bold">✅ CT: Mesenteric swirl = sigmoid volvulus (diagnostic)</p>}
          {imaging.ctBirdBeakSign && <p className="text-green-700">✅ CT: Bird beak sign = sigmoid volvulus</p>}
          {imaging.ctAppleCoreLesion && <p className="text-amber-700">⚠️ CT: Apple core lesion = obstructing carcinoma</p>}
          {imaging.ctPneumatosis && <p className="text-red-600 font-bold">🚨 CT: Pneumatosis = transmural ischaemia, emergency laparotomy</p>}
          {imaging.ctFreeAir && <p className="text-red-600 font-bold">🚨 CT: Free air = perforation</p>}
          {imaging.ctCecalDilationCm > 12 && <p className="text-amber-700">{'⚠️ Caecal dilation >12 cm, perforation risk'}</p>}
        </PanelSection>
      )}

      {/* ENGINE OUTPUT */}
      {engineOutput && !engineLoading && (
        <PanelSection title="🧠 Engine Diagnosis" color="green">
          <p className="font-bold text-gray-800 text-sm">{engineOutput.reasoning.diagnosis}</p>
          <Pill label={`${(engineOutput.reasoning.probability * 100).toFixed(0)}% confidence: ${engineOutput.reasoning.confidence}`} color={engineOutput.reasoning.confidence === 'high' ? 'green' : engineOutput.reasoning.confidence === 'medium' ? 'yellow' : 'red'} />
          {engineOutput.operativeDecision?.recommendedProcedure && (
            <div className="mt-2 p-1.5 bg-gray-50 rounded">
              <p className="font-medium text-gray-700 text-[11px]">Procedure: {engineOutput.operativeDecision.recommendedProcedure.procedure}</p>
              <p className="text-gray-500 text-[10px]">Approach: {engineOutput.operativeDecision.recommendedProcedure.approach}</p>
              <p className="text-gray-500 text-[10px]">Urgency: {engineOutput.operativeDecision.urgency}</p>
            </div>
          )}
          {engineOutput.investigationSuggestions && (
            <div className="mt-2">
              <p className="font-medium text-gray-700 text-[10px] uppercase">Suggested Investigations</p>
              {engineOutput.investigationSuggestions.suggestions.slice(0, 5).map((s: any, i: number) => (
                <p key={i} className="text-gray-600 text-[10px]">• {s.test} ({s.urgency})</p>
              ))}
            </div>
          )}
        </PanelSection>
      )}

      {engineLoading && (
        <PanelSection title="🧠 Running Engine" color="blue">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-blue-600">Processing clinical data</span>
          </div>
        </PanelSection>
      )}

      {/* INCOMPLETE */}
      {stepId === 'history' && !hasHistory && (
        <PanelSection title="⏳ Start History" color="gray">
          <p className="text-gray-500">Enter history data to see live DDX reasoning.</p>
        </PanelSection>
      )}
    </div>
  );
}
