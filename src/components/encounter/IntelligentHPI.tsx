'use client';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { getPresentingComplaintsForUnit } from '@/engine/knowledge-graph';
import { generateHPI, type SymptomSelection, type HpiGenerationInput } from '@/engine/note-generator/surgery/hpi-generator';
import type { HPIEntry } from '@/types/encounter';

interface IntelligentHPIProps {
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  unitSlug: string;
  presentingComplaint: string;
  complaintDuration: string;
  existingAnswers?: HPIEntry[];
  onAnswer?: (questionId: string, question: string, answer: string | boolean) => Promise<void>;
  onHPIGenerated?: (hpiText: string) => void;
  onComplete: () => void;
}

const DEFAULT_SYMPTOMS = [
  'Abdominal Pain', 'Nausea/Vomiting', 'Abdominal Distension',
  'Constipation', 'Diarrhoea', 'Fever', 'Weight Loss',
  'Chest Pain', 'Dyspnoea', 'Cough', 'Rectal Bleeding',
  'Change in Bowel Habit', 'Lower Limb Pain', 'Leg Swelling',
  'Mass/Lump', 'Bleeding', 'Dysphagia', 'Heartburn/Acid Reflux',
  'Jaundice', 'Fatigue/Malaise', 'Loss of Appetite',
  'Night Sweats', 'Blood in Urine', 'Urinary Symptoms',
  'Back Pain', 'Trauma/Injury',
];

type SymptomCategory = 'pain' | 'fever' | 'gi' | 'bleeding' | 'mass' | 'respiratory' | 'urinary' | 'general';

const SYMPTOM_CATEGORY: Record<string, SymptomCategory> = {
  'Abdominal Pain': 'pain', 'Chest Pain': 'pain', 'Lower Limb Pain': 'pain', 'Back Pain': 'pain',
  'Fever': 'fever',
  'Nausea/Vomiting': 'gi', 'Abdominal Distension': 'gi', 'Constipation': 'gi', 'Diarrhoea': 'gi',
  'Dysphagia': 'gi', 'Heartburn/Acid Reflux': 'gi', 'Change in Bowel Habit': 'gi',
  'Rectal Bleeding': 'bleeding', 'Bleeding': 'bleeding', 'Blood in Urine': 'bleeding',
  'Mass/Lump': 'mass',
  'Dyspnoea': 'respiratory', 'Cough': 'respiratory',
  'Urinary Symptoms': 'urinary',
  'Weight Loss': 'general', 'Jaundice': 'general', 'Fatigue/Malaise': 'general',
  'Loss of Appetite': 'general', 'Night Sweats': 'general', 'Leg Swelling': 'general', 'Trauma/Injury': 'general',
};

interface PastHistoryData {
  pmh: string;
  psh: string;
  medications: string;
  allergies: string;
  social: string;
  familyHistory: string;
}

const INITIAL_PAST: PastHistoryData = {
  pmh: '', psh: '', medications: '', allergies: '', social: '', familyHistory: '',
};

function symptomId(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function buildSymptomSelections(labels: string[]): SymptomSelection[] {
  return labels.map((label) => ({
    symptomId: symptomId(label),
    label,
    selected: false,
    details: {},
    answeredQuestions: [],
  }));
}

const SITE_OPTIONS = [
  { label: 'Epigastrium', value: 'epigastrium' },
  { label: 'RUQ', value: 'right upper quadrant' },
  { label: 'LUQ', value: 'left upper quadrant' },
  { label: 'RLQ', value: 'right lower quadrant' },
  { label: 'LLQ', value: 'left lower quadrant' },
  { label: 'Periumbilical', value: 'periumbilical region' },
  { label: 'Suprapubic', value: 'suprapubic region' },
  { label: 'Flank', value: 'flank' },
  { label: 'Central', value: 'central chest' },
  { label: 'Diffuse', value: 'diffuse' },
];

const CHARACTER_OPTIONS = [
  { label: 'Colicky', value: 'colicky' },
  { label: 'Burning', value: 'burning' },
  { label: 'Sharp/Stabbing', value: 'sharp' },
  { label: 'Dull/Aching', value: 'dull' },
  { label: 'Cramping', value: 'cramping' },
  { label: 'Gnawing', value: 'gnawing' },
  { label: 'Tearing', value: 'tearing' },
  { label: 'Throbbing', value: 'throbbing' },
];

const ASSOCIATED_OPTIONS = [
  'Nausea', 'Vomiting', 'Anorexia', 'Fever', 'Sweating',
  'Palpitations', 'Dizziness', 'Syncope', 'Dyspnoea',
  'Bloating', 'Diarrhoea', 'Constipation', 'Flatulence',
  'Dysuria', 'Urgency', 'Haematuria',
];

interface FieldRadio {
  id: string; label: string; options: { label: string; value: string }[];
}
interface FieldText {
  id: string; label: string; placeholder?: string; type?: 'text';
}
interface FieldSlider {
  id: string; label: string; min?: number; max?: number;
}
interface FieldYesNo {
  id: string; label: string;
}
interface FieldMultiCheck {
  id: string; label: string; options: string[];
}

type QuestionField = FieldRadio | FieldText | FieldSlider | FieldYesNo | FieldMultiCheck;

interface QuestionGroup {
  id: string;
  label: string;
  fields: QuestionField[];
  condition?: (details: Record<string, any>) => boolean;
}

function painQuestions(): QuestionGroup[] {
  return [
    {
      id: 'site', label: 'Site',
      fields: [{ id: 'site', label: 'Location', options: SITE_OPTIONS } as FieldRadio],
    },
    {
      id: 'onset', label: 'Onset & Duration',
      fields: [
        { id: 'onset', label: 'Onset', options: [
          { label: 'Sudden', value: 'suddenly' },
          { label: 'Gradual', value: 'gradually' },
          { label: 'Intermittent', value: 'intermittently' },
        ] } as FieldRadio,
        { id: 'duration', label: 'Duration', placeholder: 'e.g. 3 days, 6 hours' } as FieldText,
      ],
    },
    {
      id: 'character', label: 'Character',
      fields: [{ id: 'character', label: 'Nature', options: CHARACTER_OPTIONS } as FieldRadio],
    },
    {
      id: 'radiation', label: 'Radiation',
      fields: [{ id: 'radiation', label: 'Radiates to', placeholder: 'e.g. back, right shoulder, groin' } as FieldText],
    },
    {
      id: 'severity', label: 'Severity',
      fields: [{ id: 'severity', label: 'Pain score', min: 0, max: 10 } as FieldSlider],
    },
    {
      id: 'exacerbating', label: 'Exacerbating Factors',
      fields: [{ id: 'exacerbating', label: 'Made worse by', placeholder: 'e.g. movement, coughing, eating' } as FieldText],
    },
    {
      id: 'relieving', label: 'Relieving Factors',
      fields: [{ id: 'relieving', label: 'Relieved by', placeholder: 'e.g. rest, leaning forward, medication' } as FieldText],
    },
    {
      id: 'associated', label: 'Associated Symptoms',
      fields: [{ id: 'associatedSymptoms', label: 'Select all that apply', options: ASSOCIATED_OPTIONS } as FieldMultiCheck],
    },
    {
      id: 'progression', label: 'Progression',
      fields: [{ id: 'progression', label: 'Course over time', placeholder: 'e.g. getting worse, constant, improving' } as FieldText],
    },
    {
      id: 'episodes', label: 'Previous Episodes',
      fields: [
        { id: 'similarEpisodes', label: 'Similar episodes before?' } as FieldYesNo,
        { id: 'previousDiagnosis', label: 'If yes, previous diagnosis', placeholder: 'e.g. gastritis, renal colic' } as FieldText,
      ],
    },
  ];
}

function feverQuestions(): QuestionGroup[] {
  return [
    { id: 'duration', label: 'Duration',
      fields: [{ id: 'duration', label: 'How long?', placeholder: 'e.g. 2 days' } as FieldText] },
    { id: 'pattern', label: 'Pattern',
      fields: [{ id: 'onset', label: 'Pattern', options: [
        { label: 'Continuous', value: 'continuous' },
        { label: 'Intermittent', value: 'intermittent' },
        { label: 'Rigors', value: 'with rigors' },
      ] } as FieldRadio] },
    { id: 'severity', label: 'Temperature',
      fields: [
        { id: 'radiation', label: 'Highest temperature', placeholder: 'e.g. 38.5' } as FieldText,
      ] },
    { id: 'sweats', label: 'Associated',
      fields: [{ id: 'exacerbating', label: 'Associated sweats/rigors', options: [
        { label: 'Yes — drenching sweats', value: 'associated with drenching night sweats' },
        { label: 'Yes — mild', value: 'associated with mild sweats' },
        { label: 'No', value: 'without significant sweats' },
      ] } as FieldRadio] },
  ];
}

function giQuestions(): QuestionGroup[] {
  return [
    { id: 'duration', label: 'Duration',
      fields: [{ id: 'duration', label: 'How long?', placeholder: 'e.g. 3 days' } as FieldText] },
    { id: 'character', label: 'Content/Type',
      fields: [{ id: 'character', label: 'Nature', options: [
        { label: 'Bilious', value: 'bilious' },
        { label: 'Bloody/Coffee-ground', value: 'blood-stained' },
        { label: 'Feculent', value: 'feculent' },
        { label: 'Undigested food', value: 'undigested food' },
        { label: 'Watery only', value: 'watery' },
      ] } as FieldRadio] },
    { id: 'frequency', label: 'Frequency',
      fields: [{ id: 'exacerbating', label: 'How often?', placeholder: 'e.g. 4-5 times daily, after meals' } as FieldText] },
    { id: 'associated', label: 'Associated',
      fields: [{ id: 'associatedSymptoms', label: 'Associated features', options: ['Nausea', 'Abdominal Pain', 'Bloating', 'Diarrhoea', 'Fever', 'Dizziness'] } as FieldMultiCheck] },
  ];
}

function massQuestions(): QuestionGroup[] {
  return [
    { id: 'duration', label: 'Duration',
      fields: [{ id: 'duration', label: 'When first noticed?', placeholder: 'e.g. 2 weeks, 3 months' } as FieldText] },
    { id: 'site', label: 'Location',
      fields: [{ id: 'site', label: 'Where?', placeholder: 'e.g. right groin, left breast, neck' } as FieldText] },
    { id: 'character', label: 'Characteristics',
      fields: [{ id: 'character', label: 'Nature', options: [
        { label: 'Painful', value: 'painful' },
        { label: 'Painless', value: 'painless' },
        { label: 'Tender', value: 'tender' },
      ] } as FieldRadio] },
    { id: 'progression', label: 'Change',
      fields: [
        { id: 'progression', label: 'Size change over time', placeholder: 'e.g. slowly growing, stable, rapidly enlarging' } as FieldText,
      ] },
    { id: 'context', label: 'Context',
      fields: [
        { id: 'exacerbating', label: 'Related to straining/coughing?', placeholder: 'e.g. appears on standing, reduces when lying flat' } as FieldText,
        { id: 'relieving', label: 'Reducible?', options: [
          { label: 'Yes — completely', value: 'completely reducible' },
          { label: 'Yes — partially', value: 'partially reducible' },
          { label: 'No', value: 'irreducible' },
        ] } as FieldRadio,
      ] },
  ];
}

function respiratoryQuestions(): QuestionGroup[] {
  return [
    { id: 'duration', label: 'Duration',
      fields: [{ id: 'duration', label: 'How long?', placeholder: 'e.g. 4 days' } as FieldText] },
    { id: 'onset', label: 'Onset & Exertion',
      fields: [{ id: 'onset', label: 'Onset', options: [
        { label: 'At rest', value: 'at rest' },
        { label: 'On exertion', value: 'on exertion' },
        { label: 'Both', value: 'both at rest and on exertion' },
      ] } as FieldRadio] },
    { id: 'character', label: 'Nature',
      fields: [{ id: 'character', label: 'Type', options: [
        { label: 'Dry cough', value: 'dry cough' },
        { label: 'Productive cough', value: 'productive cough' },
        { label: 'Wheeze', value: 'associated wheeze' },
      ] } as FieldRadio] },
    { id: 'associated', label: 'Associated',
      fields: [{ id: 'associatedSymptoms', label: 'Associated features', options: ['Cough', 'Sputum', 'Wheeze', 'Chest Pain', 'Fever', 'Orthopnoea', 'PND', 'Haemoptysis'] } as FieldMultiCheck] },
    { id: 'severity', label: 'Severity',
      fields: [{ id: 'severity', label: 'Impact on daily activities', placeholder: 'e.g. can\'t climb stairs, SOB at rest' } as FieldText] },
  ];
}

function generalQuestions(): QuestionGroup[] {
  return [
    { id: 'duration', label: 'Duration',
      fields: [{ id: 'duration', label: 'How long noticed?', placeholder: 'e.g. 2 weeks, 3 months' } as FieldText] },
    { id: 'character', label: 'Details',
      fields: [{ id: 'character', label: 'Describe', placeholder: 'Please describe in detail' } as FieldText] },
    { id: 'progression', label: 'Course',
      fields: [{ id: 'progression', label: 'Progression', placeholder: 'e.g. worsening, fluctuating, improving' } as FieldText] },
  ];
}

function bleedingQuestions(): QuestionGroup[] {
  return [
    { id: 'duration', label: 'Duration',
      fields: [{ id: 'duration', label: 'How long?', placeholder: 'e.g. 2 days, intermittent for weeks' } as FieldText] },
    { id: 'character', label: 'Nature',
      fields: [{ id: 'character', label: 'Appearance', options: [
        { label: 'Bright red', value: 'bright red' },
        { label: 'Dark/clotted', value: 'dark' },
        { label: 'Melena (tarry)', value: 'melena' },
        { label: 'Streaks only', value: 'blood-streaked' },
      ] } as FieldRadio] },
    { id: 'severity', label: 'Amount/Severity',
      fields: [{ id: 'severity', label: 'Amount', placeholder: 'e.g. spotting, tablespoons, cups' } as FieldText] },
    { id: 'associated', label: 'Associated',
      fields: [{ id: 'relieving', label: 'Relation to bowel movements', placeholder: 'e.g. on wiping, on stool, with constipation' } as FieldText] },
  ];
}

const CATEGORY_QUESTIONS: Record<SymptomCategory, () => QuestionGroup[]> = {
  pain: painQuestions,
  fever: feverQuestions,
  gi: giQuestions,
  bleeding: bleedingQuestions,
  mass: massQuestions,
  respiratory: respiratoryQuestions,
  urinary: giQuestions,
  general: generalQuestions,
};

function RadioField({ options, value, onChange }: {
  options: { label: string; value: string }[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value === value ? '' : opt.value)}
          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
            value === opt.value
              ? 'bg-blue-50 border-blue-400 text-blue-700'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SliderField({ value, onChange, min = 0, max = 10 }: {
  value?: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  const v = value ?? 0;
  return (
    <div className="space-y-1">
      <input
        type="range"
        min={min} max={max}
        value={v}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 accent-blue-600"
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{min}</span>
        <span className="text-sm font-semibold text-blue-700">{v}/{max}</span>
        <span className="text-xs text-gray-400">{max}</span>
      </div>
    </div>
  );
}

function YesNoField({ value, onChange, label }: {
  value?: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
          value === true ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-200 text-gray-500'
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
          value === false ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-200 text-gray-500'
        }`}
      >
        No
      </button>
    </div>
  );
}

function MultiCheckField({ options, value, onChange }: {
  options: string[]; value?: string[]; onChange: (v: string[]) => void;
}) {
  const selected = value ?? [];
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
            selected.includes(opt)
              ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          {selected.includes(opt) ? '✓ ' : ''}{opt}
        </button>
      ))}
    </div>
  );
}

function TextField({ placeholder, value, onChange }: {
  placeholder?: string; value?: string; onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
    />
  );
}

function TextAreaField({ placeholder, value, onChange, rows = 2 }: {
  placeholder?: string; value?: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
    />
  );
}

export function IntelligentHPI({
  patientName, patientAge, patientGender, unitSlug,
  presentingComplaint, complaintDuration,
  existingAnswers = [], onAnswer, onHPIGenerated, onComplete,
}: IntelligentHPIProps) {
  const [symptoms, setSymptoms] = useState<SymptomSelection[]>(() => {
    const unitComplaints = getPresentingComplaintsForUnit(unitSlug);
    const merged = [...DEFAULT_SYMPTOMS];
    for (const c of unitComplaints) {
      const normalized = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
      if (!merged.some((s) => s.toLowerCase() === normalized.toLowerCase())) {
        merged.push(normalized);
      }
    }
    return buildSymptomSelections(merged);
  });
  const [pastHistory, setPastHistory] = useState<PastHistoryData>(INITIAL_PAST);
  const [generatedHpi, setGeneratedHpi] = useState('');
  const [editedHpi, setEditedHpi] = useState('');
  const [hpiEditing, setHpiEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customSymptom, setCustomSymptom] = useState('');
  const [expandedSymptoms, setExpandedSymptoms] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const hpiRef = useRef<HTMLDivElement>(null);

  const selectedSymptoms = useMemo(() => symptoms.filter((s) => s.selected), [symptoms]);
  const selectedCount = selectedSymptoms.length;

  const toggleSymptom = useCallback((id: string) => {
    setSymptoms((prev) => {
      const next = prev.map((s) => s.symptomId === id ? { ...s, selected: !s.selected } : s);
      return next;
    });
    setExpandedSymptoms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const updateDetail = useCallback((symptomId: string, field: string, value: any) => {
    setSymptoms((prev) => prev.map((s) => {
      if (s.symptomId !== symptomId) return s;
      return { ...s, details: { ...s.details, [field]: value } };
    }));
  }, []);

  const addCustomSymptom = useCallback(() => {
    const trimmed = customSymptom.trim();
    if (!trimmed) return;
    const id = symptomId(trimmed);
    if (symptoms.some((s) => s.symptomId === id)) return;
    setSymptoms((prev) => [...prev, {
      symptomId: id, label: trimmed, selected: true, details: {}, answeredQuestions: [],
    }]);
    setExpandedSymptoms((prev) => new Set(prev).add(id));
    setCustomSymptom('');
  }, [customSymptom, symptoms]);

  const findCategory = useCallback((label: string): SymptomCategory => {
    return SYMPTOM_CATEGORY[label] || 'general';
  }, []);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    try {
      const hpiSymptoms = symptoms.filter((s) => s.selected);
      const input: HpiGenerationInput = {
        patientName,
        patientAge,
        patientGender,
        presentingComplaint,
        complaintDuration,
        symptoms: hpiSymptoms.map((s) => {
          const details = s.details;
          return {
            ...s,
            details: {
              ...details,
              site: details.site || undefined,
              character: details.character || undefined,
              onset: details.onset || undefined,
              duration: details.duration || undefined,
              radiation: details.radiation || undefined,
              severity: typeof details.severity === 'number' ? details.severity : undefined,
              exacerbating: details.exacerbating || undefined,
              relieving: details.relieving || undefined,
              associatedSymptoms: Array.isArray(details.associatedSymptoms) && details.associatedSymptoms.length > 0
                ? details.associatedSymptoms : undefined,
              progression: details.progression || undefined,
              similarEpisodes: details.similarEpisodes as boolean | undefined,
              previousDiagnosis: details.previousDiagnosis || undefined,
            },
          } as SymptomSelection;
        }),
        pastMedicalHistory: pastHistory.pmh ? pastHistory.pmh.split(/[,;]\s*/).filter(Boolean) : [],
        pastSurgicalHistory: pastHistory.psh ? pastHistory.psh.split(/[,;]\s*/).filter(Boolean) : [],
        drugHistory: pastHistory.medications ? pastHistory.medications.split(/[,;]\s*/).filter(Boolean) : [],
        allergies: pastHistory.allergies ? pastHistory.allergies.split(/[,;]\s*/).filter(Boolean) : [],
        socialHistory: pastHistory.social ? pastHistory.social.split(/[,;]\s*/).filter(Boolean) : [],
        familyHistory: pastHistory.familyHistory ? pastHistory.familyHistory.split(/[,;]\s*/).filter(Boolean) : [],
      };
      const text = generateHPI(input);
      setGeneratedHpi(text);
      setEditedHpi(text);
      setHpiEditing(false);
      if (onHPIGenerated) onHPIGenerated(text);
      setTimeout(() => hpiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } finally {
      setGenerating(false);
    }
  }, [symptoms, pastHistory, patientName, patientAge, patientGender, presentingComplaint, complaintDuration, onHPIGenerated]);

  const handleComplete = useCallback(async () => {
    setSaving(true);
    try {
      const finalHpi = hpiEditing ? editedHpi : generatedHpi;
      if (onAnswer && selectedSymptoms.length > 0) {
        for (const symptom of selectedSymptoms) {
          if (symptom.details.site) await onAnswer(`${symptom.symptomId}_site`, `Site of ${symptom.label}`, symptom.details.site);
          if (symptom.details.onset) await onAnswer(`${symptom.symptomId}_onset`, `Onset of ${symptom.label}`, symptom.details.onset);
          if (symptom.details.character) await onAnswer(`${symptom.symptomId}_character`, `Character of ${symptom.label}`, symptom.details.character);
          if (symptom.details.duration) await onAnswer(`${symptom.symptomId}_duration`, `Duration of ${symptom.label}`, symptom.details.duration);
          if (symptom.details.radiation) await onAnswer(`${symptom.symptomId}_radiation`, `Radiation of ${symptom.label}`, symptom.details.radiation);
          if (symptom.details.severity !== undefined) await onAnswer(`${symptom.symptomId}_severity`, `Severity of ${symptom.label}`, String(symptom.details.severity));
          if (symptom.details.exacerbating) await onAnswer(`${symptom.symptomId}_exacerbating`, `Exacerbating factors of ${symptom.label}`, symptom.details.exacerbating);
          if (symptom.details.relieving) await onAnswer(`${symptom.symptomId}_relieving`, `Relieving factors of ${symptom.label}`, symptom.details.relieving);
          if (symptom.details.progression) await onAnswer(`${symptom.symptomId}_progression`, `Progression of ${symptom.label}`, symptom.details.progression);
          if (Array.isArray(symptom.details.associatedSymptoms) && symptom.details.associatedSymptoms.length > 0) {
            await onAnswer(`${symptom.symptomId}_associated`, `Associated symptoms with ${symptom.label}`, symptom.details.associatedSymptoms.join(', '));
          }
          if (symptom.details.similarEpisodes !== undefined) {
            await onAnswer(`${symptom.symptomId}_similar_episodes`, `Previous similar episodes of ${symptom.label}`, symptom.details.similarEpisodes);
          }
          if (symptom.details.previousDiagnosis) {
            await onAnswer(`${symptom.symptomId}_previous_dx`, `Previous diagnosis for ${symptom.label}`, symptom.details.previousDiagnosis);
          }
        }
      }
      if (onHPIGenerated && finalHpi) onHPIGenerated(finalHpi);
      onComplete();
    } finally {
      setSaving(false);
    }
  }, [symptoms, selectedSymptoms, generatedHpi, editedHpi, hpiEditing, onAnswer, onHPIGenerated, onComplete]);

  const expandAll = useCallback(() => {
    setExpandedSymptoms(new Set(selectedSymptoms.map((s) => s.symptomId)));
  }, [selectedSymptoms]);

  const collapseAll = useCallback(() => {
    setExpandedSymptoms(new Set());
  }, []);

  const selectableSymptoms = useMemo(() => {
    return symptoms.filter((s) => DEFAULT_SYMPTOMS.includes(s.label));
  }, [symptoms]);

  const unitOnlySymptoms = useMemo(() => {
    const unitComplaints = getPresentingComplaintsForUnit(unitSlug);
    return symptoms.filter((s) => !DEFAULT_SYMPTOMS.includes(s.label) && unitComplaints.some((c) => c.toLowerCase() === s.label.toLowerCase()));
  }, [symptoms, unitSlug]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <span className="text-lg">📝</span>
        <span className="text-sm font-semibold text-gray-700 tracking-wide">INTELLIGENT HPI</span>
        <span className="text-xs text-gray-400 font-mono">— History of Presenting Illness</span>
        {selectedCount > 0 && (
          <span className="ml-auto text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
            {selectedCount} symptom{selectedCount !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* ── Step 1: Symptom Selection ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Step 1: Select Symptoms</h3>
          <div className="flex gap-2">
            {selectedCount > 0 && (
              <>
                <button type="button" onClick={expandAll} className="text-xs text-blue-600 hover:text-blue-800">Expand all</button>
                <button type="button" onClick={collapseAll} className="text-xs text-blue-600 hover:text-blue-800">Collapse all</button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
          {selectableSymptoms.map((symptom) => {
            const cat = findCategory(symptom.label);
            const catColors: Record<SymptomCategory, string> = {
              pain: 'border-l-red-300', fever: 'border-l-orange-300',
              gi: 'border-l-amber-300', bleeding: 'border-l-rose-300',
              mass: 'border-l-purple-300', respiratory: 'border-l-cyan-300',
              urinary: 'border-l-blue-300', general: 'border-l-gray-300',
            };
            return (
              <button
                key={symptom.symptomId}
                type="button"
                onClick={() => toggleSymptom(symptom.symptomId)}
                className={`text-left px-3 py-2 text-xs rounded-lg border-l-2 transition-all ${
                  symptom.selected
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : `bg-white ${catColors[cat]} border-gray-200 text-gray-600 hover:border-gray-300`
                }`}
              >
                {symptom.selected && <span className="mr-1 text-blue-500">✓</span>}
                {symptom.label}
              </button>
            );
          })}
        </div>

        {unitOnlySymptoms.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Suggested for this unit</p>
            <div className="flex flex-wrap gap-1.5">
              {unitOnlySymptoms.map((symptom) => (
                <button
                  key={symptom.symptomId}
                  type="button"
                  onClick={() => toggleSymptom(symptom.symptomId)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    symptom.selected
                      ? 'bg-teal-50 border-teal-400 text-teal-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {symptom.selected ? '✓ ' : ''}{symptom.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom symptom */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customSymptom}
            onChange={(e) => setCustomSymptom(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addCustomSymptom(); }}
            placeholder="+ Add custom symptom..."
            className="flex-1 px-3 py-1.5 text-xs border border-dashed border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
          />
          <button
            type="button"
            onClick={addCustomSymptom}
            disabled={!customSymptom.trim()}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-300 disabled:opacity-30"
          >
            Add
          </button>
        </div>
      </div>

      {/* ── Step 2: Characterize Symptoms ── */}
      {selectedCount > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Step 2: Characterize Selected Symptoms
          </h3>
          <div className="space-y-2">
            {selectedSymptoms.map((symptom) => {
              const cat = findCategory(symptom.label);
              const qGroups = CATEGORY_QUESTIONS[cat]?.() ?? generalQuestions();
              const isExpanded = expandedSymptoms.has(symptom.symptomId);

              return (
                <div key={symptom.symptomId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedSymptoms((prev) => {
                      const next = new Set(prev);
                      if (next.has(symptom.symptomId)) next.delete(symptom.symptomId);
                      else next.add(symptom.symptomId);
                      return next;
                    })}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      <span className="text-blue-500 mr-1">▼</span>
                      {symptom.label}
                      {symptom.details.character && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">— {symptom.details.character}</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-400">{isExpanded ? 'Collapse' : 'Expand'}</span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 py-3 space-y-4">
                      {qGroups.map((group) => (
                        <div key={group.id}>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{group.label}</p>
                          <div className="space-y-2">
                            {group.fields.map((field) => {
                              const isRadio = 'options' in field && Array.isArray(field.options) && typeof field.options[0] !== 'string' && 'value' in (field.options[0] ?? {});
                              const isMulti = 'options' in field && Array.isArray(field.options) && typeof field.options[0] === 'string';
                              const isSlider = 'min' in field && 'max' in field;
                              const isActuallyYesNo = field.id === 'similarEpisodes';

                              if (isActuallyYesNo) {
                                const f = field as FieldYesNo;
                                return (
                                  <div key={f.id} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600 w-28 flex-shrink-0">{f.label}</span>
                                    <YesNoField
                                      value={symptom.details[f.id] as boolean | undefined}
                                      onChange={(v) => updateDetail(symptom.symptomId, f.id, v)}
                                      label=""
                                    />
                                  </div>
                                );
                              }

                              if (isRadio) {
                                const f = field as FieldRadio;
                                return (
                                  <div key={f.id}>
                                    <span className="text-xs text-gray-500 mb-1 block">{f.label}</span>
                                    <RadioField
                                      options={f.options}
                                      value={symptom.details[f.id] as string | undefined}
                                      onChange={(v) => updateDetail(symptom.symptomId, f.id, v || undefined)}
                                    />
                                  </div>
                                );
                              }

                              if (isMulti) {
                                const f = field as FieldMultiCheck;
                                return (
                                  <div key={f.id}>
                                    <span className="text-xs text-gray-500 mb-1 block">{f.label}</span>
                                    <MultiCheckField
                                      options={f.options}
                                      value={symptom.details[f.id] as string[] | undefined}
                                      onChange={(v) => updateDetail(symptom.symptomId, f.id, v.length > 0 ? v : undefined)}
                                    />
                                  </div>
                                );
                              }

                              if (isSlider) {
                                const f = field as FieldSlider;
                                return (
                                  <div key={f.id}>
                                    <span className="text-xs text-gray-500 mb-1 block">{f.label}</span>
                                    <SliderField
                                      value={symptom.details[f.id] as number | undefined}
                                      onChange={(v) => updateDetail(symptom.symptomId, f.id, v || undefined)}
                                      min={f.min} max={f.max}
                                    />
                                  </div>
                                );
                              }

                              const f = field as FieldText;
                              return (
                                <div key={f.id}>
                                  <span className="text-xs text-gray-500 mb-1 block">{f.label}</span>
                                  <TextField
                                    placeholder={f.placeholder}
                                    value={symptom.details[f.id] as string | undefined}
                                    onChange={(v) => updateDetail(symptom.symptomId, f.id, v || undefined)}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 3: Past History ── */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Step 3: Past History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Past Medical History</label>
            <TextAreaField
              placeholder="Hypertension, Type 2 Diabetes, Asthma..."
              value={pastHistory.pmh}
              onChange={(v) => setPastHistory((p) => ({ ...p, pmh: v }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Past Surgical History</label>
            <TextAreaField
              placeholder="Open cholecystectomy (2018), Appendicectomy..."
              value={pastHistory.psh}
              onChange={(v) => setPastHistory((p) => ({ ...p, psh: v }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Medications</label>
            <TextAreaField
              placeholder="Losartan 50mg, Metformin 500mg BD, Omeprazole..."
              value={pastHistory.medications}
              onChange={(v) => setPastHistory((p) => ({ ...p, medications: v }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Allergies</label>
            <TextAreaField
              placeholder="Nil known, Penicillin — rash, Codeine..."
              value={pastHistory.allergies}
              onChange={(v) => setPastHistory((p) => ({ ...p, allergies: v }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Social History</label>
            <TextAreaField
              placeholder="Retired farmer, married, 4 children, non-smoker, occasional alcohol"
              value={pastHistory.social}
              onChange={(v) => setPastHistory((p) => ({ ...p, social: v }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Family History</label>
            <TextAreaField
              placeholder="Mother — hypertension, Father — diabetes"
              value={pastHistory.familyHistory}
              onChange={(v) => setPastHistory((p) => ({ ...p, familyHistory: v }))}
            />
          </div>
        </div>
      </div>

      {/* ── Generate HPI Button ── */}
      {selectedCount > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-sm transition-all"
          >
            {generating ? 'Generating...' : generatedHpi ? '⚡ Regenerate HPI' : '⚡ Generate HPI'}
          </button>
        </div>
      )}

      {/* ── Generated HPI Display ── */}
      {(generatedHpi || hpiEditing) && (
        <div ref={hpiRef} className="border border-blue-200 rounded-lg overflow-hidden bg-gradient-to-b from-blue-50 to-white">
          <div className="flex items-center justify-between px-4 py-2 bg-blue-100/50 border-b border-blue-200">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚡</span>
              <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Generated HPI</span>
              <span className="text-[10px] text-blue-500">Consultant-level narrative</span>
            </div>
            <div className="flex gap-2">
              {hpiEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setHpiEditing(false); setEditedHpi(generatedHpi); }}
                    className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => { setHpiEditing(false); }}
                    className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save edit
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
                  >
                    Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={() => setHpiEditing(true)}
                    className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="px-4 py-3">
            {hpiEditing ? (
              <TextAreaField
                value={editedHpi}
                onChange={setEditedHpi}
                rows={8}
              />
            ) : (
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{generatedHpi}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-400">
          {selectedCount > 0 ? (
            <span>{selectedCount} symptom{selectedCount !== 1 ? 's' : ''} · {Object.values(pastHistory).filter(Boolean).length} history fields</span>
          ) : (
            <span>Select symptoms above to begin</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onComplete}
            disabled={saving}
            className="px-4 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
          >
            ← Back to Symptoms
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={saving || (selectedCount === 0)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Complete HPI →'}
          </button>
        </div>
      </div>
    </div>
  );
}
