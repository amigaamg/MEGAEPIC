'use client';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { usePatientStore } from '@/src/state/patientStore';
import { runInference, symptomMap, signMap } from '@/src/engine/inference/scorer';
import { suggestNextQuestions, computeDDxEntropy } from '@/src/engine/inference/adaptiveQuestioner';
import { FEATURE_REGISTRY, FeatureDescriptor } from '@/src/engine/inference/featureRegistry';
import { ScoredDisease } from '@/src/engine/inference/types';

type InterviewPhase = 'setup' | 'symptom_history' | 'symptom_quality' | 'exam_signs' | 'complete';

interface Message {
  role: 'system' | 'assistant' | 'user';
  content: string;
  featureId?: string;
}

const SYMPTOM_CATEGORIES = [
  {
    label: 'Respiratory Symptoms',
    items: [
      { id: 'cough', label: 'Cough' },
      { id: 'fever', label: 'Fever' },
      { id: 'wheeze', label: 'Wheeze' },
      { id: 'difficulty_breathing', label: 'Difficulty Breathing' },
      { id: 'stridor', label: 'Stridor (Noisy Inspiration)' },
      { id: 'chest_pain', label: 'Chest Pain' },
      { id: 'hemoptysis', label: 'Coughing Blood' },
      { id: 'noisy_breathing', label: 'Noisy Breathing' },
      { id: 'nasal_discharge', label: 'Nasal Discharge' },
      { id: 'sore_throat', label: 'Sore Throat' },
    ],
  },
  {
    label: 'Constitutional / General',
    items: [
      { id: 'lethargy', label: 'Lethargy / Drowsiness' },
      { id: 'reduced_feeding', label: 'Reduced Feeding' },
      { id: 'cyanosis', label: 'Cyanosis (Turned Blue)' },
      { id: 'night_sweats', label: 'Night Sweats' },
      { id: 'weight_loss', label: 'Weight Loss' },
      { id: 'chest_tightness', label: 'Chest Tightness' },
    ],
  },
  {
    label: 'Other Symptoms',
    items: [
      { id: 'rash', label: 'Skin Rash' },
      { id: 'ear_pain', label: 'Ear Pain' },
      { id: 'abdominal_pain', label: 'Abdominal Pain' },
      { id: 'vomiting', label: 'Vomiting' },
      { id: 'seizures', label: 'Seizures / Convulsions' },
      { id: 'headache', label: 'Headache' },
    ],
  },
];

const QUALITY_QUESTIONS: { featureId: string; question: string; options: string[]; field: string }[] = [
  { featureId: 'cough', question: 'What type of cough?', options: ['Dry', 'Productive', 'Barking', 'Paroxysmal'], field: 'coughChar' },
  { featureId: 'cough', question: 'Cough duration?', options: ['Acute (<3 weeks)', 'Chronic (>4 weeks)'], field: 'coughDuration' },
  { featureId: 'cough', question: 'Nocturnal cough?', options: ['Yes', 'No'], field: 'nocturnalCough' },
  { featureId: 'fever', question: 'Fever pattern?', options: ['Continuous', 'Intermittent', 'Undulant'], field: 'feverPattern' },
  { featureId: 'fever', question: 'High-grade fever (>39°C)?', options: ['Yes', 'No'], field: 'highFever' },
  { featureId: 'difficulty_breathing', question: 'Chest indrawing?', options: ['Yes', 'No'], field: 'chestIndrawing' },
  { featureId: 'difficulty_breathing', question: 'Grunting?', options: ['Yes', 'No'], field: 'grunting' },
  { featureId: 'difficulty_breathing', question: 'Nasal flaring?', options: ['Yes', 'No'], field: 'nasalFlaring' },
  { featureId: 'wheeze', question: 'Wheeze pattern?', options: ['Expiratory', 'Inspiratory', 'Both'], field: 'wheezePattern' },
  { featureId: 'wheeze', question: 'Unilateral wheeze?', options: ['Yes', 'No'], field: 'unilateralWheeze' },
];

const EXAM_SIGNS = [
  { id: 'chest_indrawing', label: 'Chest Indrawing' },
  { id: 'nasal_flaring', label: 'Nasal Flaring' },
  { id: 'grunting', label: 'Grunting' },
  { id: 'stridor', label: 'Inspiratory Stridor' },
  { id: 'wheeze', label: 'Expiratory Wheeze' },
  { id: 'crackles', label: 'Crackles / Crepitations' },
  { id: 'bronchial_breathing', label: 'Bronchial Breath Sounds' },
  { id: 'reduced_air_entry', label: 'Reduced Air Entry' },
  { id: 'dullness', label: 'Dullness to Percussion' },
  { id: 'hyperresonance', label: 'Hyperresonance' },
  { id: 'tracheal_deviation', label: 'Tracheal Deviation' },
  { id: 'cyanosis', label: 'Central Cyanosis' },
  { id: 'clubbing', label: 'Digital Clubbing' },
  { id: 'pallor', label: 'Pallor' },
  { id: 'jaundice', label: 'Jaundice' },
  { id: 'hepatomegaly', label: 'Hepatomegaly' },
  { id: 'splenomegaly', label: 'Splenomegaly' },
  { id: 'neck_stiffness', label: 'Neck Stiffness' },
  { id: 'bulging_fontanelle', label: 'Bulging Fontanelle' },
  { id: 'murmur', label: 'Heart Murmur' },
  { id: 'gallop_rhythm', label: 'S3 Gallop Rhythm' },
  { id: 'petechiae', label: 'Petechiae / Purpura' },
  { id: 'rash', label: 'Skin Rash' },
  { id: 'toxic_appearance', label: 'Toxic / Severely Ill' },
];

const DISEASE_COLORS: Record<string, string> = {
  pneumonia: '#ef4444',
  asthma: '#3b82f6',
  bronchiolitis: '#10b981',
  croup: '#f59e0b',
  epiglottitis: '#dc2626',
  foreign_body_aspiration: '#ec4899',
  tuberculosis: '#8b5cf6',
  pleural_effusion: '#14b8a6',
  empyema: '#f97316',
  pneumothorax: '#a855f7',
};

const SEVERITY_LEVELS: Record<string, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'CRITICAL' },
  severe: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: 'SEVERE' },
  moderate: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'MODERATE' },
  mild: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'MILD' },
};

export function ClinicalChat() {
  const { form, setField, toggleArrayItem, updateForm } = usePatientStore();
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [patientName, setPatientName] = useState('');
  const [ageMonths, setAgeMonths] = useState('32');
  const [sex, setSex] = useState<string>('male');
  const [durationDays, setDurationDays] = useState('5');
  const [messages, setMessages] = useState<Message[]>([]);
  const [qualityAnswers, setQualityAnswers] = useState<Record<string, string>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentDDx = useMemo(() => runInference(form), [form]);
  const ddxEntropy = useMemo(() => computeDDxEntropy(currentDDx), [currentDDx]);

  const suggestions = useMemo(() => {
    return suggestNextQuestions(form, currentDDx)
      .filter(s => {
        if (phase === 'symptom_history' && s.feature.type !== 'symptom') return false;
        if (phase === 'exam_signs' && s.feature.type !== 'sign') return false;
        return true;
      });
  }, [form, currentDDx, phase]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestions, qualityAnswers]);

  const handleToggleSymptom = useCallback((symptomId: string) => {
    toggleArrayItem('complaints', symptomId);
  }, [toggleArrayItem]);

  const handleStartConsultation = useCallback(() => {
    if (!patientName || !ageMonths) return;
    setField('biodata.patientName', patientName);
    setField('biodata.ageMonths', ageMonths);
    setField('biodata.sex', sex);
    setMessages([{
      role: 'system',
      content: `New consultation: ${patientName}, ${ageMonths} months, ${sex}. Duration: ${durationDays} days. Select presenting symptoms above to begin.`,
    }]);
    setPhase('symptom_history');
  }, [patientName, ageMonths, sex, durationDays, setField]);

  const handleQualityAnswer = useCallback((featureId: string, question: string, answer: string) => {
    const key = `${featureId}_${question}`;
    setQualityAnswers(prev => ({ ...prev, [key]: answer }));

    const qq = QUALITY_QUESTIONS.find(q => q.featureId === featureId && q.question === question);
    if (qq) {
      if (qq.field === 'coughChar') setField('hpi.coughChar', answer.toLowerCase().replace(/\s+/g, '_'));
      else if (qq.field === 'coughDuration') setField('hpi.coughDuration', answer.includes('Chronic') ? 'chronic' : 'acute');
      else if (qq.field === 'nocturnalCough') setField('hpi.nocturnalCough', answer === 'Yes');
      else if (qq.field === 'feverPattern') setField('hpi.feverPattern', answer.toLowerCase());
      else if (qq.field === 'highFever') setField('hpi.highFever', answer === 'Yes');
      else if (qq.field === 'chestIndrawing') setField('hpi.chestIndrawing', answer === 'Yes');
      else if (qq.field === 'grunting') setField('hpi.grunting', answer === 'Yes');
      else if (qq.field === 'nasalFlaring') setField('hpi.nasalFlaring', answer === 'Yes');
      else if (qq.field === 'wheezePattern') setField('hpi.wheezePattern', answer.toLowerCase());
      else if (qq.field === 'unilateralWheeze') setField('hpi.unilateralWheeze', answer === 'Yes');
    }

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `**${question}** → ${answer}`,
      featureId,
    }]);
  }, [setField]);

  const handleExamSign = useCallback((signId: string, present: boolean) => {
    const vitalsMap: Record<string, string> = {
      chest_indrawing: 'examIndrawing',
      nasal_flaring: 'examNasalFlaring',
      grunting: 'examGrunting',
      stridor: 'examStridor',
      wheeze: 'examWheeze',
      crackles: 'examCrackles',
      bronchial_breathing: 'examBronchial',
      reduced_air_entry: 'examReducedBS',
      dullness: 'examDullness',
      hyperresonance: 'examHyperResonance',
      tracheal_deviation: 'examTrachealDeviation',
      cyanosis: 'cyanosisExam',
      clubbing: 'clubbingExam',
      pallor: 'pallorExam',
      jaundice: 'jaundiceExam',
      hepatomegaly: 'examHepatomegaly',
      splenomegaly: 'examSplenomegaly',
      neck_stiffness: 'examNeckStiffness',
      petechiae: 'examSkinPetechiae',
    };
    const field = vitalsMap[signId];
    if (field) {
      setField(`vitals.${field}`, present);
    }
    if (signId === 'bulging_fontanelle') setField('vitals.examFontanelle', present ? 'bulging' : '');
    if (signId === 'murmur') setField('vitals.examMurmur', present ? 'present' : '');
    if (signId === 'gallop_rhythm') setField('vitals.examHeartSounds', present ? 'gallop' : '');
    if (signId === 'rash') setField('vitals.examSkinRash', present ? 'generalised_maculopapular' : '');
    if (signId === 'toxic_appearance') setField('vitals.generalCondition', present ? 'toxic' : 'well');

    setMessages(prev => [...prev, {
      role: 'user',
      content: `${present ? '✓' : '✗'} ${EXAM_SIGNS.find(s => s.id === signId)?.label || signId}`,
      featureId: signId,
    }]);
  }, [setField]);

  const handleAdaptiveAnswer = useCallback((featureId: string, value: boolean) => {
    const descriptor = FEATURE_REGISTRY[featureId];
    if (!descriptor) return;
    const newForm = descriptor.setValue(form, value);
    updateForm(newForm);

    setMessages(prev => [...prev, {
      role: 'user',
      content: `${value ? 'Yes' : 'No'} — ${descriptor.questionText}`,
      featureId,
    }]);
  }, [form, updateForm]);

  const score = (diseaseId: string) => {
    const found = currentDDx.find(d => d.disease.id === diseaseId);
    return found ? Math.round(found.probability * 100) : 0;
  };

  const topDisease = currentDDx[0];
  const severity = useMemo(() => {
    const c = form.complaints;
    const v = form.vitals;
    const hpi = form.hpi;
    const spo2 = parseFloat(v.spo2);
    const temp = parseFloat(v.temp);
    if (c.includes('cyanosis') || (!isNaN(spo2) && spo2 < 85) || (hpi.drooling && hpi.tripodPosition))
      return { level: 'critical', msg: 'Immediate intervention required — airway and breathing must be stabilised urgently.' };
    if ((!isNaN(spo2) && spo2 < 92) || hpi.grunting || hpi.chestIndrawing || (!isNaN(temp) && temp >= 39.5))
      return { level: 'severe', msg: 'Urgent assessment required — escalate to higher level of care.' };
    if ((!isNaN(spo2) && spo2 <= 94) || c.includes('difficulty_breathing') || (!isNaN(temp) && temp >= 38.5))
      return { level: 'moderate', msg: 'Close monitoring required — initiate targeted treatment promptly.' };
    if (c.length > 0)
      return { level: 'mild', msg: 'Clinically manageable — may be treated as outpatient if stable.' };
    return null;
  }, [form]);

  const selectedSymptoms = form.complaints;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/90 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold text-gray-700">Clinical Interview</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              background: phase === 'setup' ? '#f1f5f9' : phase === 'complete' ? '#d1fae5' : '#dbeafe',
              color: phase === 'setup' ? '#64748b' : phase === 'complete' ? '#065f46' : '#1e40af',
            }}>
            {phase === 'setup' ? 'SETUP' : phase === 'symptom_history' ? 'HISTORY' : phase === 'symptom_quality' ? 'QUALITY' : phase === 'exam_signs' ? 'EXAM' : 'COMPLETE'}
          </span>
          {phase !== 'setup' && (
            <button onClick={() => { setPhase('setup'); setMessages([]); setQualityAnswers({}); }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium">New</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ═══════════════════ SETUP PHASE ═══════════════════ */}
        {phase === 'setup' && (
          <div className="p-4 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-base font-bold text-gray-800 mb-4">New Clinical Consultation</h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Patient Name</label>
                  <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g. B.M." />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Age (months)</label>
                  <input type="number" value={ageMonths} onChange={e => setAgeMonths(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    min="0" max="240" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Sex</label>
                  <select value={sex} onChange={e => setSex(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Duration (days)</label>
                  <input type="number" value={durationDays} onChange={e => setDurationDays(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    min="1" />
                </div>
              </div>

              {/* Risk Factors Quick Entry */}
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-2">Risk Factors</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'smokingExposure', label: 'Smoke Exposure' },
                    { id: 'tbHousehold', label: 'TB Contact' },
                    { id: 'asthmaFamily', label: 'Family Asthma' },
                    { id: 'atopyFamily', label: 'Family Atopy' },
                  ].map(rf => (
                    <button key={rf.id} onClick={() => setField(`family.${rf.id}`, !(form.family as any)[rf.id])}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${(form.family as any)[rf.id] ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                      {(form.family as any)[rf.id] ? '✓ ' : ''}{rf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptom Selection */}
              <div className="mb-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                  Presenting Symptoms — select all that apply
                </label>
                {SYMPTOM_CATEGORIES.map(cat => (
                  <div key={cat.label} className="mb-3">
                    <p className="text-[11px] font-semibold text-gray-400 mb-1.5">{cat.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map(item => (
                        <button key={item.id} onClick={() => handleToggleSymptom(item.id)}
                          className={`text-[11px] px-2.5 py-1.5 rounded-full border transition-all ${
                            selectedSymptoms.includes(item.id)
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                          }`}>
                          {selectedSymptoms.includes(item.id) ? '✓ ' : ''}{item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleStartConsultation}
                disabled={!patientName || !ageMonths || selectedSymptoms.length === 0}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
                Start Clinical Interview
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════ HISTORY PHASE ═══════════════════ */}
        {phase === 'symptom_history' && (
          <div className="p-4 space-y-4">
            {/* Severity Banner */}
            {severity && (
              <div className={`rounded-xl border-2 p-3 ${
                severity.level === 'critical' ? 'border-red-200 bg-red-50' :
                severity.level === 'severe' ? 'border-orange-200 bg-orange-50' :
                severity.level === 'moderate' ? 'border-amber-200 bg-amber-50' :
                'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {severity.level === 'critical' ? '🚨' : severity.level === 'severe' ? '⚠️' : severity.level === 'moderate' ? '⚡' : '✓'}
                  </span>
                  <span className={`text-xs font-bold ${
                    severity.level === 'critical' ? 'text-red-700' :
                    severity.level === 'severe' ? 'text-orange-700' :
                    severity.level === 'moderate' ? 'text-amber-700' :
                    'text-green-700'
                  }`}>
                    {severity.level.toUpperCase()} — {severity.msg}
                  </span>
                </div>
              </div>
            )}

            {/* Top Differentials */}
            {topDisease && (
              <div className="bg-gradient-to-r from-violet-50 to-white border border-violet-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wide">Leading Diagnosis</span>
                  <span className="text-[10px] text-violet-400">Entropy: {ddxEntropy.toFixed(2)} bits</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-violet-700">{topDisease.disease.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 font-semibold">
                    {(topDisease.probability * 100).toFixed(0)}%
                  </span>
                </div>
                {currentDDx.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentDDx.slice(1, 4).map(d => (
                      <span key={d.disease.id} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {d.disease.name} ({(d.probability * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conversation Messages */}
            {messages.length > 0 && (
              <div className="space-y-2">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : msg.role === 'system'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 text-xs rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Adaptive Questions - Symptoms */}
            {suggestions.length > 0 && (
              <div className="bg-white border border-blue-100 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-2.5 border-b border-blue-100 flex items-center gap-2">
                  <span className="text-sm">🔍</span>
                  <span className="text-xs font-bold text-blue-700">Adaptive Questions — Symptoms</span>
                  <span className="text-[10px] text-blue-400 ml-auto">
                    {suggestions.length} remaining
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  {suggestions.slice(0, 4).map((s, i) => (
                    <div key={s.feature.id} className={`pb-3 ${i < suggestions.length - 1 && i < 3 ? 'border-b border-gray-100' : ''}`}>
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        {i + 1}. {s.feature.questionText}
                      </p>
                      <div className="flex gap-2 items-center">
                        <button onClick={() => handleAdaptiveAnswer(s.feature.id, true)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">Yes</button>
                        <button onClick={() => handleAdaptiveAnswer(s.feature.id, false)}
                          className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors border border-gray-200">No</button>
                        <span className="text-[9px] text-gray-400 ml-auto">
                          IG: {(s.informationGain * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-3 pb-3">
                  <button onClick={() => { setPhase('symptom_quality'); }}
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-semibold rounded-lg transition-all">
                    Continue to Symptom Quality Details →
                  </button>
                </div>
              </div>
            )}

            {suggestions.length === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-emerald-700">All key history symptoms assessed</p>
                <p className="text-xs text-emerald-600 mt-1">Proceed to symptom quality details or examination.</p>
                <div className="flex gap-2 mt-3 justify-center">
                  <button onClick={() => setPhase('symptom_quality')}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors">
                    Symptom Details
                  </button>
                  <button onClick={() => setPhase('exam_signs')}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                    Examination
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ SYMPTOM QUALITY PHASE ═══════════════════ */}
        {phase === 'symptom_quality' && (
          <div className="p-4 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📋</span>
                <h3 className="text-sm font-bold text-gray-700">Symptom Quality Details</h3>
              </div>
              <p className="text-[10px] text-gray-400 mb-4">Provide more detail for the selected symptoms to refine the differential.</p>

              {/* Quality questions for selected symptoms */}
              {QUALITY_QUESTIONS.map(qq => {
                if (!selectedSymptoms.includes(qq.featureId)) return null;
                const key = `${qq.featureId}_${qq.question}`;
                const answered = qualityAnswers[key];
                return (
                  <div key={key} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-medium text-gray-700 mb-2">{qq.question}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {qq.options.map(opt => (
                        <button key={opt} onClick={() => handleQualityAnswer(qq.featureId, qq.question, opt)}
                          className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
                            answered === opt
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {QUALITY_QUESTIONS.filter(qq => selectedSymptoms.includes(qq.featureId)).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Select symptoms in the history phase first to see quality questions here.</p>
              )}

              <div className="flex gap-2 mt-4">
                <button onClick={() => setPhase('symptom_history')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors">← Back</button>
                <button onClick={() => setPhase('exam_signs')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">Proceed to Examination →</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════ EXAM PHASE ═══════════════════ */}
        {phase === 'exam_signs' && (
          <div className="p-4 space-y-4">
            {/* Vitals Input */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">❤️</span>
                <h3 className="text-sm font-bold text-gray-700">Vital Signs</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'temp', label: 'Temp (°C)', placeholder: '39.2' },
                  { key: 'hr', label: 'HR (/min)', placeholder: '158' },
                  { key: 'rr', label: 'RR (/min)', placeholder: '68' },
                  { key: 'spo2', label: 'SpO₂ (%)', placeholder: '84' },
                  { key: 'bpSystolic', label: 'BP Sys', placeholder: '90' },
                  { key: 'bpDiastolic', label: 'BP Dia', placeholder: '60' },
                  { key: 'weight', label: 'Weight (kg)', placeholder: '10' },
                  { key: 'muac', label: 'MUAC (cm)', placeholder: '12.3' },
                  { key: 'capRefill', label: 'Cap Refill (s)', placeholder: '3' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[9px] font-semibold text-gray-400 uppercase">{f.label}</label>
                    <input type="text" value={(form.vitals as any)[f.key] || ''}
                      onChange={e => setField(`vitals.${f.key}`, e.target.value)}
                      className="w-full mt-0.5 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder={f.placeholder} />
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Signs - inline checkbox grid */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🔬</span>
                <h3 className="text-sm font-bold text-gray-700">Examination Signs</h3>
                <span className="text-[9px] text-gray-400 ml-auto">Check all that are present</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {EXAM_SIGNS.map(sign => {
                  const isPresent = (() => {
                    const v = form.vitals as any;
                    const map: Record<string, string> = {
                      chest_indrawing: 'examIndrawing',
                      nasal_flaring: 'examNasalFlaring',
                      grunting: 'examGrunting',
                      stridor: 'examStridor',
                      wheeze: 'examWheeze',
                      crackles: 'examCrackles',
                      bronchial_breathing: 'examBronchial',
                      reduced_air_entry: 'examReducedBS',
                      dullness: 'examDullness',
                      hyperresonance: 'examHyperResonance',
                      tracheal_deviation: 'examTrachealDeviation',
                      cyanosis: 'cyanosisExam',
                      clubbing: 'clubbingExam',
                      pallor: 'pallorExam',
                      jaundice: 'jaundiceExam',
                      hepatomegaly: 'examHepatomegaly',
                      splenomegaly: 'examSplenomegaly',
                      neck_stiffness: 'examNeckStiffness',
                      petechiae: 'examSkinPetechiae',
                    };
                    const field = map[sign.id];
                    return field ? v[field] === true : false;
                  })();
                  return (
                    <button key={sign.id} onClick={() => handleExamSign(sign.id, !isPresent)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                        isPresent
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}>
                      {isPresent ? '✓ ' : ''}{sign.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Adaptive Questions - Signs */}
            {suggestions.length > 0 && (
              <div className="bg-white border border-indigo-100 rounded-xl overflow-hidden">
                <div className="bg-indigo-50 px-4 py-2.5 border-b border-indigo-100 flex items-center gap-2">
                  <span className="text-sm">🔬</span>
                  <span className="text-xs font-bold text-indigo-700">Adaptive Questions — Signs</span>
                  <span className="text-[10px] text-indigo-400 ml-auto">
                    {suggestions.length} remaining
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  {suggestions.slice(0, 5).map((s, i) => (
                    <div key={s.feature.id} className={`pb-3 ${i < suggestions.length - 1 && i < 4 ? 'border-b border-gray-100' : ''}`}>
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        {i + 1}. {s.feature.questionText}
                      </p>
                      <div className="flex gap-2 items-center">
                        <button onClick={() => handleAdaptiveAnswer(s.feature.id, true)}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors">Yes</button>
                        <button onClick={() => handleAdaptiveAnswer(s.feature.id, false)}
                          className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors border border-gray-200">No</button>
                        <span className="text-[9px] text-gray-400 ml-auto">
                          IG: {(s.informationGain * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-3 pb-3">
                  <button onClick={() => setPhase('complete')}
                    className="w-full py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg transition-all">
                    Complete Assessment →
                  </button>
                </div>
              </div>
            )}

            {suggestions.length === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-emerald-700">All examination signs assessed</p>
                <p className="text-xs text-emerald-600 mt-1">Review the differentials and clinical note in the other panels.</p>
                <button onClick={() => setPhase('complete')}
                  className="mt-3 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors">
                  Complete Assessment
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ COMPLETE PHASE ═══════════════════ */}
        {phase === 'complete' && (
          <div className="p-4 space-y-4">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-sm font-bold text-emerald-700">Assessment Complete</h3>
              <p className="text-xs text-emerald-600 mt-1">Review the differentials, clinical note, and management plan in the other panels.</p>
              <div className="flex gap-2 justify-center mt-3">
                <button onClick={() => setPhase('exam_signs')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors">← Review Exam</button>
                <button onClick={() => { setPhase('setup'); setMessages([]); setQualityAnswers({}); }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">New Consultation</button>
              </div>
            </div>

            {/* Quick Summary */}
            {topDisease && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Final Diagnostic Impression</h4>
                <div className="p-3 bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg border border-violet-100">
                  <p className="text-sm font-bold text-violet-800">
                    {topDisease.disease.name}
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-violet-200 text-violet-700 font-semibold">
                      {(topDisease.probability * 100).toFixed(0)}%
                    </span>
                  </p>
                  {severity && (
                    <p className={`text-xs font-medium mt-1 ${
                      severity.level === 'critical' ? 'text-red-600' :
                      severity.level === 'severe' ? 'text-orange-600' :
                      severity.level === 'moderate' ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {severity.level.toUpperCase()} — {severity.msg}
                    </p>
                  )}
                </div>

                {currentDDx.length > 1 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Differential Diagnoses</p>
                    <div className="space-y-1.5">
                      {currentDDx.slice(1, 5).map(d => (
                        <div key={d.disease.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{d.disease.name}</span>
                          <span className="text-gray-400">{(d.probability * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {topDisease.evidence.historyHits.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Supporting History</p>
                    <div className="flex flex-wrap gap-1">
                      {topDisease.evidence.historyHits.map(h => (
                        <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                          {h.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {topDisease.evidence.examHits.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Supporting Exam Findings</p>
                    <div className="flex flex-wrap gap-1">
                      {topDisease.evidence.examHits.map(h => (
                        <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                          {h.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
