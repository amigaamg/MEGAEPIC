'use client';
import { useEffect, useMemo } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { getQuestionsForSymptom, getFilteredQuestions, type SocratesQuestion } from '@/lib/history-engine/socratesQuestions';
import { getAllSymptoms } from '@/lib/history-engine/symptomLibrary';
import HISTORY_FEATURE_REGISTRY from '@/lib/history-engine/historyFeatureRegistry';

const ASSOC_MAP: Record<string, string> = {
  dyspnea: 'dyspnea', chest_pain: 'chest_pain', cough: 'cough',
  fever: 'fever', headache: 'headache', wheeze: 'wheeze',
  nausea: 'nausea_vomiting', vomiting: 'nausea_vomiting',
  diarrhoea: 'diarrhoea', weight_loss: 'weight_loss',
  palpitations: 'palpitations', rash: 'skin_rash',
  joint_pain: 'joint_pain', night_sweats: 'night_sweats',
  leg_swelling: 'leg_swelling', hemoptysis: 'hemoptysis',
  cyanosis: 'cyanosis', jaundice: 'jaundice', dizziness: 'dizziness',
  syncope: 'syncope', seizure: 'seizure', neck_stiffness: 'neck_stiffness',
  abdominal_pain: 'abdominal_pain', fatigue: 'fatigue',
  orthopnea: 'dyspnea', pnd: 'dyspnea',
  visual_change: 'headache',
};

const CHARACTERIZE_FIELDS = new Set([
  'onset', 'duration', 'severity', 'location', 'quality', 'pattern',
  'timing', 'onset_type', 'productive', 'sputum_color', 'sputum_amount',
  'sputum_blood', 'temperature', 'rigors', 'chills', 'night_sweats',
  'orthopnea', 'pnd', 'positional', 'frequency', 'consistency',
  'radiation', 'diurnal_variation', 'response_to_antipyretics',
  'aggravating_factors', 'relieving_factors', 'triggers',
  'night_cough', 'exercise_induced', 'vomitus_character',
  'blood_in_stool', 'tenesmus', 'urgency', 'type', 'exercise_tolerance',
  'sleep_quality', 'appetite', 'amount', 'percentage', 'intentional',
  'nausea_only', 'chronic_condition',
]);

const RISK_FACTOR_CONFIG: { field: string; label: string; type: 'boolean' | 'select'; options?: string[] }[] = [
  { field: 'risk_hiv', label: 'Known HIV positive?', type: 'boolean' },
  { field: 'risk_tb_contact', label: 'Known contact with TB patient?', type: 'boolean' },
  { field: 'risk_mosquito_exposure', label: 'Recent mosquito exposure?', type: 'boolean' },
  { field: 'risk_recent_travel', label: 'Recent travel to malaria-endemic area?', type: 'boolean' },
  { field: 'risk_sick_contact', label: 'Contact with someone who had fever?', type: 'boolean' },
  { field: 'risk_animal_contact', label: 'Recent contact with sick animals?', type: 'boolean' },
  { field: 'risk_occupational_dust', label: 'Work in dusty environment?', type: 'boolean' },
  { field: 'risk_crowded_living', label: 'Live in crowded conditions?', type: 'boolean' },
  { field: 'risk_nsaids', label: 'Take NSAIDs/painkillers regularly?', type: 'boolean' },
  { field: 'risk_dvt', label: 'Recent prolonged sitting/flights?', type: 'boolean' },
  { field: 'risk_recent_surgery', label: 'Recent chest or abdominal surgery?', type: 'boolean' },
  { field: 'risk_pregnancy', label: 'Could you be pregnant? (if applicable)', type: 'boolean' },
  { field: 'risk_travel_diarrhoea', label: 'Recent travel or change in diet?', type: 'boolean' },
  { field: 'risk_food_poisoning', label: 'Ate questionable/spoiled food recently?', type: 'boolean' },
  { field: 'risk_medication', label: 'Started any new medication?', type: 'boolean' },
  { field: 'risk_antibiotics', label: 'Recently taken antibiotics?', type: 'boolean' },
  { field: 'risk_head_trauma', label: 'Recent head trauma?', type: 'boolean' },
  { field: 'risk_anticoagulants', label: 'On blood thinners (anticoagulants)?', type: 'boolean' },
];

const GLOBAL_FIELD_MAP: Record<string, string> = {
  seenByAnyone: 'seen_by_anyone',
  treatmentTaken: 'treatment_received',
  treatmentResponse: 'response_to_treatment',
  functionalImpact: 'functional_impact',
};

const GLOBAL_QUESTION_CONFIG = [
  { key: 'flow', label: 'Overall progression of symptoms', type: 'select' as const, options: ['Worsening', 'Improving', 'Static', 'Fluctuating'] },
  { key: 'seenByAnyone', label: 'Have you seen anyone for this problem?', type: 'text' as const, guide: 'e.g. GP, nurse, hospital, traditional healer, pharmacist' },
  { key: 'treatmentTaken', label: 'What treatment have you taken?', type: 'text' as const, guide: 'List any medications, herbs, or remedies tried' },
  { key: 'treatmentResponse', label: 'How was the response to treatment?', type: 'select' as const, options: ['Good improvement', 'Partial improvement', 'No improvement', 'Worsened', 'Not applicable'] },
  { key: 'functionalImpact', label: 'How does this affect your daily activities?', type: 'text' as const, guide: 'Work, walking, eating, sleeping, self-care' },
];

function BooleanInput({ value, onChange }: { value: string | boolean | string[] | undefined; onChange: (v: boolean) => void }) {
  const isYes = value === true || value === 'true' || value === 'Yes';
  const isNo = value === false || value === 'false' || value === 'No';
  return (
    <div className="flex gap-2">
      {['Yes', 'No'].map(opt => {
        const selected = opt === 'Yes' ? isYes : isNo;
        return (
          <button key={opt} onClick={() => onChange(opt === 'Yes')}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${selected
              ? 'bg-teal-500/20 border-teal-500/40 text-teal-400'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-teal-500/30'}`}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SelectInput({ value, options, onChange }: { value: string | undefined; options?: string[]; onChange: (v: string) => void }) {
  return (
    <select onChange={e => onChange(e.target.value)}
      value={typeof value === 'string' ? value : ''}
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500">
      <option value="">Select...</option>
      {options?.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function HpiSection() {
  const complaints = useHistoryStore(s => s.chiefComplaints);
  const hpi = useHistoryStore(s => s.hpi);
  const timeline = useHistoryStore(s => s.timeline);
  const redFlags = useHistoryStore(s => s.redFlags);
  const ddx = useHistoryStore(s => s.ddx);
  const featureRegistry = useHistoryStore(s => s.featureRegistry);
  const confirmedSymptoms = useHistoryStore(s => s.confirmedSymptoms);
  const globalAnswers = useHistoryStore(s => s.globalAnswers);
  const setFeature = useHistoryStore(s => s.setFeature);
  const setSocratesAnswer = useHistoryStore(s => s.setSocratesAnswer);
  const setGlobalAnswer = useHistoryStore(s => s.setGlobalAnswer);
  const ensureHpiEntry = useHistoryStore(s => s.ensureHpiEntry);
  const completeSection = useHistoryStore(s => s.completeSection);
  const completedSections = useHistoryStore(s => s.completedSections);
  const isComplete = completedSections.includes('hpi');
  const allSymptoms = useMemo(() => getAllSymptoms(), []);

  useEffect(() => {
    for (const [, hpiEntry] of Object.entries(hpi)) {
      for (const ans of hpiEntry.socrates) {
        const field = ans.field || ans.questionId.replace(`${hpiEntry.symptomId}_`, '');
        if (field.startsWith('associated_') && (ans.answer === true || ans.answer === 'true' || ans.answer === 'Yes')) {
          const mappedId = ASSOC_MAP[field.replace('associated_', '')];
          if (mappedId && !hpi[mappedId] && !complaints.find(c => c.symptomId === mappedId)) {
            const symptom = allSymptoms.find(s => s.id === mappedId);
            if (symptom) ensureHpiEntry(mappedId, symptom.label, hpiEntry.symptomId);
          }
        }
      }
    }
  });

  // ── Known fields ──
  const knownFields = useMemo(() => {
    const k = new Set<string>();
    for (const [, e] of Object.entries(hpi)) for (const a of e.socrates) if (a.field) k.add(a.field);
    for (const [fid, fe] of Object.entries(featureRegistry)) if (fe.present !== undefined) k.add(fid);
    for (const sid of confirmedSymptoms) k.add(sid);
    for (const [gk, gv] of Object.entries(globalAnswers)) {
      if (gv) {
        k.add(gk);
        const mapped = GLOBAL_FIELD_MAP[gk];
        if (mapped) k.add(mapped);
      }
    }
    return k;
  }, [hpi, featureRegistry, confirmedSymptoms, globalAnswers]);

  const isKnown = (field: string) => knownFields.has(field) || (field.startsWith('associated_') && confirmedSymptoms.includes(ASSOC_MAP[field.replace('associated_', '')] || ''));

  // ── Symptom timeline entries ──
  const symptomEntries = useMemo(() => {
    const e: { symptomId: string; label: string; daysAgo: number; isChief: boolean }[] = [];
    for (const c of complaints) {
      const entry = hpi[c.symptomId];
      let da = c.durationDays;
      if (da <= 0 && entry) { const d = entry.socrates.find(a => a.field === 'duration')?.answer; if (d && typeof d === 'string') da = parseInt(d) || 0; }
      e.push({ symptomId: c.symptomId, label: c.label, daysAgo: da || 0, isChief: true });
    }
    for (const [, entry] of Object.entries(hpi)) {
      if (e.some(x => x.symptomId === entry.symptomId)) continue;
      const d = entry.socrates.find(a => a.field === 'duration')?.answer;
      e.push({ symptomId: entry.symptomId, label: entry.label, daysAgo: d && typeof d === 'string' ? parseInt(d) || 0 : 0, isChief: false });
    }
    e.sort((a, b) => b.daysAgo - a.daysAgo);
    return e;
  }, [complaints, hpi]);

  const allHpiSymptomIds = new Set(Object.keys(hpi));

  // ── STAGE 1: Characterize questions per symptom ──
  const getCharacterizeQuestions = (symptomId: string) => {
    const entry = hpi[symptomId];
    if (!entry) return [];
    const allQ = getQuestionsForSymptom(symptomId);
    return allQ.filter(q => {
      if (q.purpose !== 'characterize') return false;
      if (isKnown(q.field)) return false;
      const remaining = getFilteredQuestions(symptomId, entry.socrates);
      if (!remaining.some(r => r.id === q.id)) return false;
      return CHARACTERIZE_FIELDS.has(q.field);
    });
  };

  // ── STAGE 2-3: Rule-in/Rule-out diagnostic screening ──
  const diagnosticScreenQuestions = useMemo(() => {
    const topDiseases = ddx.probabilities.slice(0, 5);
    if (topDiseases.length === 0) return [];

    const items: { diseaseId: string; diseaseName: string; probability: number; questions: { q: SocratesQuestion; symptomId: string; field: string; currentAnswer: string | boolean | string[] | undefined }[] }[] = [];

    for (const dd of topDiseases) {
      const allQ: { q: SocratesQuestion; symptomId: string; field: string; currentAnswer: string | boolean | string[] | undefined }[] = [];
      for (const symptomId of allHpiSymptomIds) {
        const entry = hpi[symptomId];
        if (!entry) continue;
        const questions = getQuestionsForSymptom(symptomId);
        for (const q of questions) {
          if (isKnown(q.field)) continue;
          const remaining = getFilteredQuestions(symptomId, entry.socrates);
          if (!remaining.some(r => r.id === q.id)) continue;
          if (q.targetDiagnoses && q.targetDiagnoses.length > 0 && q.targetDiagnoses.includes(dd.diseaseId)) {
            allQ.push({ q, symptomId, field: q.field, currentAnswer: entry.socrates.find(a => a.questionId === q.id)?.answer });
          }
        }
      }
      // Also check historyFeatureRegistry for this disease
      for (const [fid, fdef] of Object.entries(HISTORY_FEATURE_REGISTRY)) {
        if (isKnown(fid)) continue;
        const w = Math.abs(fdef.diseaseWeights?.[dd.diseaseId] || 0);
        if (w >= 3) {
          allQ.push({
            q: { id: fid, field: fid, label: fdef.label, type: 'boolean', weight: w, purpose: 'rule_in', targetDiagnoses: [dd.diseaseId] },
            symptomId: 'registry',
            field: fid,
            currentAnswer: featureRegistry[fid]?.present === true ? true : featureRegistry[fid]?.present === false ? false : undefined,
          });
        }
      }
      if (allQ.length > 0) {
        items.push({ diseaseId: dd.diseaseId, diseaseName: dd.diseaseName, probability: dd.probability, questions: allQ.slice(0, 6) });
      }
    }
    return items;
  }, [ddx, hpi, featureRegistry, knownFields, allHpiSymptomIds]);

  // ── STAGE 4: Complication questions ──
  const complicationQuestions = useMemo(() => {
    const topDisease = ddx.probabilities[0];
    if (!topDisease) return [];
    const items: { q: SocratesQuestion; symptomId: string; field: string; currentAnswer: string | boolean | string[] | undefined }[] = [];
    for (const symptomId of allHpiSymptomIds) {
      const entry = hpi[symptomId];
      if (!entry) continue;
      const questions = getQuestionsForSymptom(symptomId);
      for (const q of questions) {
        if (isKnown(q.field)) continue;
        const remaining = getFilteredQuestions(symptomId, entry.socrates);
        if (!remaining.some(r => r.id === q.id)) continue;
        if (q.purpose === 'complication') {
          items.push({ q, symptomId, field: q.field, currentAnswer: entry.socrates.find(a => a.questionId === q.id)?.answer });
        }
      }
    }
    return items;
  }, [ddx, hpi, knownFields, allHpiSymptomIds]);

  // ── STAGE 5: Risk factors (patient-level, not yet answered) ──
  const unansweredRiskFactors = useMemo(() => {
    return RISK_FACTOR_CONFIG.filter(r => !isKnown(r.field));
  }, [knownFields]);

  // ── STAGE 6: Severity/function questions ──
  const severityQuestions = useMemo(() => {
    const items: { q: SocratesQuestion; symptomId: string; field: string; currentAnswer: string | boolean | string[] | undefined }[] = [];
    for (const symptomId of allHpiSymptomIds) {
      const entry = hpi[symptomId];
      if (!entry) continue;
      const questions = getQuestionsForSymptom(symptomId);
      for (const q of questions) {
        if (isKnown(q.field)) continue;
        const remaining = getFilteredQuestions(symptomId, entry.socrates);
        if (!remaining.some(r => r.id === q.id)) continue;
        if (q.purpose === 'severity') {
          items.push({ q, symptomId, field: q.field, currentAnswer: entry.socrates.find(a => a.questionId === q.id)?.answer });
        }
      }
    }
    return items;
  }, [hpi, knownFields, allHpiSymptomIds]);

  // ── Handlers ──
  const handleAnswer = (symptomId: string, qid: string, label: string, answer: string | boolean | string[], field: string) => {
    setSocratesAnswer(symptomId, qid, label, answer, 1, field);
    if (field.startsWith('associated_') && (answer === true || answer === 'Yes')) {
      const mappedId = ASSOC_MAP[field.replace('associated_', '')];
      if (mappedId && !hpi[mappedId] && !complaints.find(c => c.symptomId === mappedId)) {
        const symptom = allSymptoms.find(s => s.id === mappedId);
        if (symptom) ensureHpiEntry(mappedId, symptom.label, symptomId);
      }
    }
  };

  const handleRiskAnswer = (field: string, value: string | boolean) => {
    setFeature(field, value === true || value === 'Yes' || value === 'true');
  };

  const handleGlobalAnswer = (key: string, value: string) => setGlobalAnswer(key, value);

  // ── Render helper ──
  const renderQuestion = (symptomId: string, q: SocratesQuestion, currentAnswer: string | boolean | string[] | undefined) => {
    const field = q.field || q.id.replace(`${symptomId}_`, '');
    if (q.type === 'boolean') return <BooleanInput value={currentAnswer} onChange={v => handleAnswer(symptomId, q.id, q.label, v, field)} />;
    if (q.type === 'select') return <SelectInput value={typeof currentAnswer === 'string' ? currentAnswer : undefined} options={q.options} onChange={v => handleAnswer(symptomId, q.id, q.label, v, field)} />;
    if (q.type === 'multi_select') {
      return (
        <div className="flex flex-wrap gap-1.5">
          {q.options?.map(opt => {
            const selected = Array.isArray(currentAnswer) ? currentAnswer.includes(opt) : currentAnswer === opt;
            return (
              <button key={opt} onClick={() => handleAnswer(symptomId, q.id, q.label, opt, field)}
                className={`px-2 py-1 text-[10px] rounded-lg border transition-colors ${selected ? 'bg-teal-500/20 border-teal-500/40 text-teal-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-teal-500/30'}`}>
                {opt}
              </button>
            );
          })}
        </div>
      );
    }
    if (q.type === 'number') {
      return (
        <input type="number" onChange={e => handleAnswer(symptomId, q.id, q.label, String(parseInt(e.target.value) || 0), field)}
          value={typeof currentAnswer === 'number' ? currentAnswer : typeof currentAnswer === 'string' ? currentAnswer : ''}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500" />
      );
    }
    return (
      <input type="text" onBlur={e => { if (e.target.value !== (typeof currentAnswer === 'string' ? currentAnswer : '')) handleAnswer(symptomId, q.id, q.label, e.target.value, field); }}
        defaultValue={typeof currentAnswer === 'string' ? currentAnswer : ''}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
        placeholder={q.clinicalGuide || 'Type here...'} />
    );
  };

  const sectionLabel = (label: string, sub: string, color: string) => (
    <div className={`px-3 py-2 bg-gradient-to-r from-${color}-500/10 to-transparent border-b border-gray-700/30 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold text-${color}-400 uppercase`}>{label}</span>
        <span className="text-[10px] text-gray-500">{sub}</span>
      </div>
    </div>
  );

  const hasAnyData = symptomEntries.length > 0 || diagnosticScreenQuestions.length > 0 || complicationQuestions.length > 0 || unansweredRiskFactors.length > 0 || severityQuestions.length > 0;

  if (isComplete) {
    return (
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-400">HPI exploration completed</span>
          <button onClick={() => useHistoryStore.getState().uncompleteSection('hpi')}
            className="text-xs text-blue-400 hover:text-blue-300 underline">Edit</button>
        </div>
      </div>
    );
  }
  if (complaints.length === 0) {
    return <div className="p-6 text-center text-gray-500 text-sm">Add chief complaints first to begin HPI exploration.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">HPI — Clinical Reasoning</h2>
      </div>

      {redFlags.filter(r => r.severity === 'critical' || r.severity === 'high').length > 0 && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="text-xs font-semibold text-red-400 mb-1 uppercase tracking-wider">Red Flags</div>
          {redFlags.filter(r => r.severity === 'critical' || r.severity === 'high').slice(0, 4).map(r => (
            <div key={r.id} className="text-xs text-red-300/80 py-0.5">{r.message}</div>
          ))}
        </div>
      )}

      {/* ── STAGE 0: Timeline ── */}
      {timeline.length > 0 && (
        <div className="p-3 bg-[#12193a] border border-gray-700/50 rounded-lg">
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Timeline</div>
          <div className="space-y-1">
            {symptomEntries.map(s => {
              const cc = complaints.find(c => c.symptomId === s.symptomId);
              const answered = hpi[s.symptomId]?.socrates.filter(a => {
                const q = getQuestionsForSymptom(s.symptomId).find(v => v.id === a.questionId);
                return q && q.purpose === 'characterize';
              }).length || 0;
              return (
                <div key={s.symptomId} className="flex items-center gap-2 text-xs py-1">
                  <span className="text-teal-400 shrink-0">●</span>
                  <span className="text-gray-500 w-20 shrink-0">
                    {s.daysAgo > 0 ? `Day -${s.daysAgo}` : 'Present'}
                  </span>
                  <span className="text-gray-300">{s.label}</span>
                  {cc && <span className="text-gray-600">({cc.duration})</span>}
                  {!s.isChief && <span className="text-[10px] text-amber-400/60">associated</span>}
                  <span className="text-[10px] text-gray-600">{answered > 0 ? `${answered} characterized` : 'pending'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Symptom Inventory ── */}
      <div className="flex flex-wrap gap-1.5">
        {symptomEntries.map(s => {
          const charQs = getCharacterizeQuestions(s.symptomId);
          const done = charQs.length === 0;
          return (
            <span key={s.symptomId} className={`text-[10px] px-2 py-0.5 rounded-full border ${s.isChief
              ? done ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-teal-500/5 border-teal-500/20 text-teal-400/70'
              : done ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
              {s.label} {done ? '✓' : '...'}
            </span>
          );
        })}
      </div>

      {!hasAnyData && (
        <div className="text-center text-gray-500 text-xs py-4">
          Answer the characterizing questions below to begin diagnostic reasoning.
        </div>
      )}

      {/* ── STAGE 1: Characterize Symptoms ── */}
      {symptomEntries.length > 0 && (
        <div className="rounded-xl border border-teal-500/15 bg-[#0b1230] overflow-hidden">
          {sectionLabel('Stage 1: Characterize Symptoms', 'essential SOCRATES for each symptom', 'teal')}
          <div className="divide-y divide-gray-800">
            {symptomEntries.map(s => {
              const entry = hpi[s.symptomId];
              if (!entry) return null;
              const qs = getCharacterizeQuestions(s.symptomId);
              return (
                <div key={s.symptomId} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium ${s.isChief ? 'text-white' : 'text-amber-300'}`}>{s.label}</span>
                    {s.daysAgo > 0 && <span className="text-[10px] text-gray-500">Day -{s.daysAgo}</span>}
                    {!s.isChief && <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Associated</span>}
                    {qs.length === 0 && <span className="text-[10px] text-green-400/70">Characterized ✓</span>}
                  </div>
                  {qs.length > 0 && (
                    <div className="space-y-2.5">
                      {qs.map(q => {
                        const field = q.field || q.id.replace(`${s.symptomId}_`, '');
                        const currentAnswer = entry.socrates.find(a => a.questionId === q.id)?.answer;
                        return (
                          <div key={q.id} className="space-y-1">
                            <label className="text-xs text-gray-400">{q.label}</label>
                            {renderQuestion(s.symptomId, q, currentAnswer)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STAGE 2-3: Rule-in / Rule-out (Diagnostic Screening) ── */}
      {diagnosticScreenQuestions.length > 0 && (
        <div className="rounded-xl border border-purple-500/15 bg-[#0b1230] overflow-hidden">
          {sectionLabel('Stage 2-3: Diagnostic Screening', 'rule-in & rule-out questions by diagnosis', 'purple')}
          <div className="divide-y divide-gray-800">
            {diagnosticScreenQuestions.map(ds => (
              <div key={ds.diseaseId} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-purple-300">{ds.diseaseName}</span>
                  <span className="text-[10px] text-purple-400/70 bg-purple-500/10 px-1.5 py-0.5 rounded">{Math.round(ds.probability)}%</span>
                </div>
                <div className="space-y-2">
                  {ds.questions.map(({ q, symptomId, currentAnswer }) => {
                    const field = q.field || q.id.replace(`${symptomId}_`, '');
                    return (
                      <div key={`${symptomId}_${q.id}`} className="flex items-center justify-between gap-2 py-1 border-b border-gray-800 last:border-0">
                        <span className="text-xs text-gray-400 flex-1">{q.label}</span>
                        <div className="flex gap-1 shrink-0">
                          {['Yes', 'No'].map(opt => {
                            const val = opt === 'Yes';
                            const selected = currentAnswer === true || currentAnswer === 'true' || currentAnswer === 'Yes' ? opt === 'Yes' : currentAnswer === false || currentAnswer === 'false' || currentAnswer === 'No' ? opt === 'No' : false;
                            return (
                              <button key={opt} onClick={() => handleAnswer(symptomId, q.id, q.label, val, field)}
                                className={`px-2.5 py-1 text-[10px] font-medium rounded border transition-colors ${selected ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-purple-500/30'}`}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STAGE 4: Complications ── */}
      {complicationQuestions.length > 0 && (
        <div className="rounded-xl border border-red-500/15 bg-[#0b1230] overflow-hidden">
          {sectionLabel('Stage 4: Complication Screening', `for ${ddx.probabilities[0]?.diseaseName || 'leading diagnosis'}`, 'red')}
          <div className="p-3 space-y-2">
            {complicationQuestions.map(({ q, symptomId, currentAnswer }) => {
              const field = q.field || q.id.replace(`${symptomId}_`, '');
              return (
                <div key={`${symptomId}_${q.id}`} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-800 last:border-0">
                  <div className="flex-1">
                    <span className="text-xs text-gray-300">{q.label}</span>
                    {q.clinicalGuide && <div className="text-[10px] text-gray-500 italic">{q.clinicalGuide}</div>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {['Yes', 'No'].map(opt => {
                      const val = opt === 'Yes';
                      const selected = currentAnswer === true || currentAnswer === 'true' || currentAnswer === 'Yes' ? opt === 'Yes' : currentAnswer === false || currentAnswer === 'false' || currentAnswer === 'No' ? opt === 'No' : false;
                      return (
                        <button key={opt} onClick={() => handleAnswer(symptomId, q.id, q.label, val, field)}
                          className={`px-2.5 py-1 text-[10px] font-medium rounded border transition-colors ${selected ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-red-500/30'}`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STAGE 5: Risk Factors ── */}
      {unansweredRiskFactors.length > 0 && (
        <div className="rounded-xl border border-orange-500/15 bg-[#0b1230] overflow-hidden">
          {sectionLabel('Stage 5: Illness-Specific Risk Factors', 'exposure & medication history for current DDX', 'orange')}
          <div className="p-3 space-y-3">
            {unansweredRiskFactors.map(rf => (
              <div key={rf.field} className="space-y-1.5">
                <label className="text-xs text-gray-300">{rf.label}</label>
                <BooleanInput value={featureRegistry[rf.field]?.present === true ? true : featureRegistry[rf.field]?.present === false ? false : undefined} onChange={v => handleRiskAnswer(rf.field, v)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STAGE 6: Severity & Function ── */}
      {severityQuestions.length > 0 && (
        <div className="rounded-xl border border-yellow-500/15 bg-[#0b1230] overflow-hidden">
          {sectionLabel('Stage 6: Severity & Function', 'assessing impact and severity', 'yellow')}
          <div className="p-3 space-y-3">
            {severityQuestions.map(({ q, symptomId, currentAnswer }) => {
              const field = q.field || q.id.replace(`${symptomId}_`, '');
              return (
                <div key={`${symptomId}_${q.id}`} className="space-y-1.5">
                  <label className="text-xs text-gray-300">{q.label}</label>
                  {renderQuestion(symptomId, q, currentAnswer)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Overall Assessment ── */}
      <div className="rounded-xl border border-gray-700/50 bg-[#12193a] overflow-hidden">
        {sectionLabel('Overall Assessment', 'progression, treatment, impact', 'gray')}
        <div className="p-3 space-y-3">
          {GLOBAL_QUESTION_CONFIG.map(qc => {
            const value = globalAnswers[qc.key as keyof typeof globalAnswers] || '';
            return (
              <div key={qc.key} className="space-y-1.5">
                <label className="text-xs text-gray-300">{qc.label}</label>
                {qc.type === 'select'
                  ? <SelectInput value={typeof value === 'string' ? value : undefined} options={qc.options} onChange={v => handleGlobalAnswer(qc.key, v)} />
                  : (
                    <div>
                      <input type="text" onBlur={e => { if (e.target.value !== value) handleGlobalAnswer(qc.key, e.target.value); }}
                        defaultValue={typeof value === 'string' ? value : ''}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                        placeholder={qc.guide || 'Type here...'} />
                    </div>
                  )
                }
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-[10px] text-gray-500">
          {symptomEntries.length} symptoms · {diagnosticScreenQuestions.reduce((s, d) => s + d.questions.length, 0)} diagnostic qs · {complicationQuestions.length} complication qs · {unansweredRiskFactors.length} risk qs · {severityQuestions.length} severity qs
        </span>
        <button onClick={() => completeSection('hpi')}
          className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors">
          Complete HPI
        </button>
      </div>
    </div>
  );
}
