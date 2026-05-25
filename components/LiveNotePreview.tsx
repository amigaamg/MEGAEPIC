'use client';
import { useState, useMemo, useRef, useCallback } from 'react';
import { usePatientStore } from '@/src/state/patientStore';
import { runInference } from '@/src/engine/inference/scorer';
import { buildClinicalNote } from '@/src/engine/inference/clinicalNoteBuilder';
import { generateManagementPlan } from '@/src/engine/inference/managementPlanGenerator';
import { formatAge } from '@/src/engine/knowledge-graph/reference';
import { PrescriptionForm } from './PrescriptionForm';
import { TreatmentSheet } from './TreatmentSheet';
import { MonitoringSheets } from './MonitoringSheets';

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  critical: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  severe: { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c' },
  moderate: { bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
  mild: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
};

const AGE_BANDS = [
  { label:'Newborn (0-28d)',     min:0,  max:0.9,   hrMin:100, hrMax:160, rrMin:30, rrMax:60,  sbpMin:60, sbpMax:90,  dbpMin:30, dbpMax:60 },
  { label:'Infant (1-12mo)',     min:1,  max:11.9,  hrMin:100, hrMax:150, rrMin:30, rrMax:50,  sbpMin:80, sbpMax:100, dbpMin:50, dbpMax:65 },
  { label:'Toddler (1-3yr)',     min:12, max:35.9,  hrMin:90,  hrMax:140, rrMin:24, rrMax:40,  sbpMin:90, sbpMax:105, dbpMin:55, dbpMax:70 },
  { label:'Preschool (3-5yr)',   min:36, max:59.9,  hrMin:80,  hrMax:120, rrMin:22, rrMax:34,  sbpMin:90, sbpMax:110, dbpMin:60, dbpMax:75 },
  { label:'School (6-12yr)',     min:72, max:143.9, hrMin:70,  hrMax:110, rrMin:18, rrMax:30,  sbpMin:95, sbpMax:120, dbpMin:60, dbpMax:75 },
  { label:'Adolescent (13-18yr)',min:144,max:215.9, hrMin:60,  hrMax:100, rrMin:12, rrMax:20,  sbpMin:110,sbpMax:135, dbpMin:65, dbpMax:85 },
];

interface DrugInfo { drug: string; drugClass: string; dose: (wt: number) => string; route: string; freq: string; note: string; relevantTo: string[] }

const DRUG_DOSES: Record<string, DrugInfo> = {
  // ── Antibiotics ──────────────────────────────────────────
  benzylpenicillin: { drug: 'Benzylpenicillin', drugClass: 'antibiotic', dose: (wt) => `${(50 * wt).toLocaleString()} IU`, route: 'IV', freq: 'Q6H', note: 'First-line severe pneumonia', relevantTo: ['pneumonia', 'empyema'] },
  gentamicin: { drug: 'Gentamicin', drugClass: 'antibiotic', dose: (wt) => `${(7.5 * wt).toFixed(0)} mg`, route: 'IV/IM', freq: 'OD', note: 'Add in severe pneumonia/sepsis', relevantTo: ['pneumonia', 'empyema', 'sepsis'] },
  ceftriaxone: { drug: 'Ceftriaxone', drugClass: 'antibiotic', dose: (wt) => `${(80 * wt).toFixed(0)} mg`, route: 'IV', freq: 'OD', note: 'Escalate at 48h if no response', relevantTo: ['pneumonia', 'empyema', 'epiglottitis', 'meningitis', 'sepsis'] },
  amoxicillin: { drug: 'Amoxicillin', drugClass: 'antibiotic', dose: (wt) => `${(45 * wt).toFixed(0)} mg`, route: 'PO', freq: 'BD', note: 'Non-severe pneumonia step-down', relevantTo: ['pneumonia'] },
  ampicillin: { drug: 'Ampicillin', drugClass: 'antibiotic', dose: (wt) => `${(50 * wt).toFixed(0)} mg`, route: 'IV', freq: 'Q6H', note: 'Meningitis / neonatal sepsis', relevantTo: ['meningitis', 'sepsis'] },
  cloxacillin: { drug: 'Cloxacillin', drugClass: 'antibiotic', dose: (wt) => `${(50 * wt).toFixed(0)} mg`, route: 'IV', freq: 'Q6H', note: 'Skin infections / osteomyelitis', relevantTo: [] },
  azithromycin: { drug: 'Azithromycin', drugClass: 'antibiotic', dose: (wt) => `${(10 * wt).toFixed(0)} mg`, route: 'PO', freq: 'OD × 3d', note: 'Pertussis / atypical pneumonia', relevantTo: ['pneumonia'] },
  metronidazole: { drug: 'Metronidazole', drugClass: 'antibiotic', dose: (wt) => `${(7.5 * wt).toFixed(0)} mg`, route: 'IV/PO', freq: 'TDS', note: 'Anaerobic / empyema cover', relevantTo: ['empyema', 'pleural_effusion'] },

  // ── Antimalarials ────────────────────────────────────────
  artesunate: { drug: 'Artesunate', drugClass: 'antimalarial', dose: (wt) => `${(2.4 * wt).toFixed(0)} mg`, route: 'IV', freq: '0,12,24h then OD', note: 'Severe malaria first-line', relevantTo: [] },
  artemether: { drug: 'Artemether', drugClass: 'antimalarial', dose: () => '3.2 mg/kg IM day 1, then 1.6 mg/kg OD', route: 'IM', freq: 'OD', note: 'Severe malaria if IV not possible', relevantTo: [] },
  quinine: { drug: 'Quinine', drugClass: 'antimalarial', dose: (wt) => `${(20 * wt).toFixed(0)} mg`, route: 'IV', freq: 'Loading then 10 mg/kg Q8H', note: 'Severe malaria (if artesunate unavailable)', relevantTo: [] },

  // ── Respiratory / Asthma ─────────────────────────────────
  salbutamol: { drug: 'Salbutamol', drugClass: 'bronchodilator', dose: () => '2.5 mg', route: 'Nebulised', freq: 'Q4-6H PRN', note: 'For wheeze / bronchospasm', relevantTo: ['asthma', 'bronchiolitis'] },
  prednisolone: { drug: 'Prednisolone', drugClass: 'corticosteroid', dose: (wt) => `${(2 * wt).toFixed(0)} mg`, route: 'PO', freq: 'OD × 3-5d', note: 'Moderate-severe asthma', relevantTo: ['asthma'] },
  dexamethasone: { drug: 'Dexamethasone', drugClass: 'corticosteroid', dose: (wt) => `${(0.6 * wt).toFixed(0)} mg`, route: 'PO/IV', freq: 'Stat', note: 'Croup / severe asthma single dose', relevantTo: ['croup', 'asthma'] },
  ipratropium: { drug: 'Ipratropium Br', drugClass: 'bronchodilator', dose: () => '0.25 mg', route: 'Nebulised', freq: 'Q6-8H', note: 'Add in severe asthma', relevantTo: ['asthma'] },
  adrenaline: { drug: 'Adrenaline (1:1000)', drugClass: 'vasopressor', dose: (wt) => `${(0.5 * wt).toFixed(1)} mL`, route: 'Nebulised', freq: 'Stat, repeat Q1-2H', note: 'Croup stridor / anaphylaxis', relevantTo: ['croup', 'epiglottitis'] },

  // ── Analgesics / Antipyretics ────────────────────────────
  paracetamol: { drug: 'Paracetamol', drugClass: 'analgesic', dose: (wt) => `${(15 * wt).toFixed(0)} mg`, route: 'PO/PR', freq: 'Q6H PRN', note: 'Fever / pain', relevantTo: [] },
  ibuprofen: { drug: 'Ibuprofen', drugClass: 'analgesic', dose: (wt) => `${(10 * wt).toFixed(0)} mg`, route: 'PO', freq: 'Q8H PRN', note: 'Fever / pain (>6 months)', relevantTo: [] },
  morphine: { drug: 'Morphine', drugClass: 'analgesic', dose: (wt) => `${(0.1 * wt).toFixed(1)} mg`, route: 'IV/SC', freq: 'Q4-6H PRN', note: 'Severe pain', relevantTo: [] },

  // ── Anticonvulsants ──────────────────────────────────────
  diazepam: { drug: 'Diazepam', drugClass: 'anticonvulsant', dose: (wt) => `${(0.5 * wt).toFixed(0)} mg`, route: 'PR', freq: 'Stat', note: 'Acute seizure', relevantTo: [] },
  phenytoin: { drug: 'Phenytoin', drugClass: 'anticonvulsant', dose: (wt) => `${(20 * wt).toFixed(0)} mg`, route: 'IV', freq: 'Loading dose', note: 'Status epilepticus', relevantTo: [] },
  phenobarbitone: { drug: 'Phenobarbitone', drugClass: 'anticonvulsant', dose: (wt) => `${(20 * wt).toFixed(0)} mg`, route: 'IV/IM', freq: 'Loading dose', note: 'Neonatal seizures', relevantTo: [] },

  // ── TB Drugs ─────────────────────────────────────────────
  RHZE: { drug: 'RHZE (Rif+INH+PZA+EMB)', drugClass: 'antitubercular', dose: (wt) => `R${(15*wt).toFixed(0)} H${(10*wt).toFixed(0)} Z${(35*wt).toFixed(0)} E${(20*wt).toFixed(0)} mg`, route: 'PO', freq: 'OD × 2mo', note: 'Intensive phase TB (DOT)', relevantTo: ['tuberculosis'] },
  RH: { drug: 'RH (Rifampicin+INH)', drugClass: 'antitubercular', dose: (wt) => `R${(15*wt).toFixed(0)} H${(10*wt).toFixed(0)} mg`, route: 'PO', freq: 'OD × 4mo', note: 'Continuation phase TB', relevantTo: ['tuberculosis'] },
};

function getSeverityLevel(form: any) {
  const c = form.complaints || []; const v = form.vitals || {}; const hpi = form.hpi || {};
  const spo2 = parseFloat(v.spo2); const temp = parseFloat(v.temp);
  if (c.includes('cyanosis') || (!isNaN(spo2) && spo2 < 85) || (hpi.drooling && hpi.tripodPosition)) return 'critical';
  if ((!isNaN(spo2) && spo2 < 92) || hpi.grunting || hpi.chestIndrawing || (!isNaN(temp) && temp >= 39.5)) return 'severe';
  if ((!isNaN(spo2) && spo2 <= 94) || c.includes('difficulty_breathing') || (!isNaN(temp) && temp >= 38.5)) return 'moderate';
  if (c.length > 0) return 'mild';
  return 'unknown';
}

function buildHpiText(form: any, ageStr: string): string {
  const parts: string[] = [];
  const name = form.biodata.patientName || 'The patient';
  const mainComplaint = form.complaints[0]?.replace(/_/g, ' ') || 'illness';
  parts.push(`${name}, ${ageStr}, presented with ${mainComplaint}.`);
  if (form.complaints.length > 1) {
    parts.push(`Associated symptoms included ${form.complaints.slice(1).map((c: string) => c.replace(/_/g, ' ')).join(', ')}.`);
  }
  const h = form.hpi || {};
  if (h.coughChar) parts.push(`Cough was ${h.coughChar.replace(/_/g, ' ')}.`);
  if (h.coughDuration) parts.push(`Cough duration: ${h.coughDuration}.`);
  if (h.nocturnalCough) parts.push('Worse at night.');
  if (h.highFever) parts.push('High-grade fever >39°C.');
  if (h.chestIndrawing) parts.push('Chest indrawing noted.');
  if (h.grunting) parts.push('Audible grunting present.');
  if (h.drooling) parts.push('Drooling — red flag for epiglottitis.');
  if (h.tripodPosition) parts.push('Tripod posture adopted.');
  if (h.suddenOnset && form.complaints.includes('stridor')) parts.push('Sudden stridor — consider foreign body.');
  if (h.nightSweats) parts.push('Night sweats reported.');
  if (h.weightLoss) parts.push('Weight loss noted.');
  if (h.tbContact) parts.push('TB contact history.');
  if (h.feedingDiff) parts.push('Feeding reduced due to respiratory distress.');
  if (h.prevTx) parts.push(`Prior treatment: ${h.prevTx} (response: ${h.txResponse || 'unknown'}).`);
  return parts.join(' ');
}

function getDefaultSafety(diseaseId: string, severity: string): string {
  const map: Record<string, Record<string, string>> = {
    pneumonia: {
      mild: 'Return if fever persists >48h on antibiotics, breathing becomes laboured, or child cannot feed.',
      moderate: 'Return immediately if: RR increases, SpO2 drops below 90%, chest indrawing worsens, or child becomes lethargic.',
      severe: 'Watch for: increasing O2 requirement, rising work of breathing, inability to maintain SpO2 >90%, deterioration in conscious level.',
    },
    asthma: {
      mild: 'Return if: reliever needed more than 4-hourly, symptoms wake child at night, exercise tolerance drops.',
      moderate: 'Return immediately if: unable to speak in sentences, reliever not helping, severe distress at rest.',
      severe: 'Watch for: silent chest (no wheeze = critical), exhaustion, cyanosis, deteriorating conscious level.',
    },
    bronchiolitis: {
      moderate: 'Return immediately if: grunting, nasal flaring, severe chest indrawing, SpO2 <90%, or apnoeic pauses.',
      severe: 'Watch for: apnoeic spells, exhaustion, inability to feed, rising CO2 (drowsiness).',
    },
    epiglottitis: {
      severe: 'DO NOT examine the throat — risk of complete airway obstruction. Keep upright, calm, transfer to ICU immediately.',
    },
    foreign_body_aspiration: {
      severe: 'Maintain upright. Do NOT attempt blind finger sweep. Prepare for bronchoscopy urgently.',
    },
  };
  const d = map[diseaseId];
  if (!d) {
    if (severity === 'severe' || severity === 'critical') return 'Watch for: rising RR, increasing O2 need, decreasing conscious level, inability to maintain airway.';
    if (severity === 'moderate') return 'Return immediately if: breathing worsens, child becomes drowsy, or feeding stops completely.';
    return 'Return if: symptoms worsen, fever persists, or you are concerned about your child\'s breathing or feeding.';
  }
  return d[severity] || d.moderate || 'Return if symptoms worsen.';
}

export function LiveNotePreview() {
  const form = usePatientStore(s => s.form);
  const setField = usePatientStore(s => s.setField);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identification: true, complaints: true, hpi: true, background: true,
    vitals: true, exam: true, assessment: true, differentials: true,
    plan: true, safety: true, reference: true, doses: true,
    prescriptions: false, monitoring: false,
  });
  const editRef = useRef<HTMLTextAreaElement>(null);
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [prescriptionSaved, setPrescriptionSaved] = useState<{ medication: string; id: string } | null>(null);

  const currentDDx = useMemo(() => runInference(form), [form]);
  const severityLabel = getSeverityLevel(form);
  const hasData = currentDDx.length > 0 && currentDDx[0].rawScore > 0;
  const ageMonths = parseInt(form.biodata.ageMonths) || 0;
  const ageStr = formatAge(ageMonths);
  const weight = parseFloat(form.vitals.weight) || 0;

  const plan = useMemo(() => {
    if (!hasData) return null;
    return generateManagementPlan(form, currentDDx);
  }, [form, currentDDx, hasData]);

  const topDx = currentDDx[0];
  const severityColors = SEVERITY_STYLES[severityLabel] || SEVERITY_STYLES.mild;
  const band = AGE_BANDS.find(b => ageMonths >= b.min && ageMonths <= b.max);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startEdit = useCallback((field: string, current: string) => {
    setEditingField(field);
    setEditValue(current);
    requestAnimationFrame(() => editRef.current?.focus());
  }, []);

  const saveEdit = useCallback(() => {
    if (editingField === 'summary') setField('summary.ddxNotes', editValue);
    if (editingField === 'workingDx') setField('summary.workingDx', editValue);
    setEditingField(null);
  }, [editingField, editValue, setField]);

  const cancelEdit = useCallback(() => { setEditingField(null); }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildClinicalNote(form, currentDDx));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    const text = buildClinicalNote(form, currentDDx);
    const win = window.open('', '_blank');
    if (win) { win.document.write(`<pre style="font-family:monospace;font-size:12px;padding:20px">${text}</pre>`); win.document.close(); win.print(); }
  };

  const assessmentText = useMemo(() => {
    const lines: string[] = [];
    if (topDx) {
      lines.push(`${topDx.disease.name} (${(topDx.probability * 100).toFixed(0)}%) — ${severityLabel.toUpperCase()}`);
      const others = currentDDx.slice(1, 4);
      if (others.length) lines.push(`Differentials: ${others.map((d: any) => `${d.disease.name} (${(d.probability * 100).toFixed(0)}%)`).join(', ')}`);
    }
    return lines.join('\n');
  }, [topDx, currentDDx, severityLabel]);

  if (!hasData) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-sm font-semibold text-gray-700">Clinical Note</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-sm text-gray-400">Complete the clinical interview to generate a note.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/90 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          <span className="text-sm font-semibold text-gray-700">Clinical Note</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="text-[10px] px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            {copySuccess ? '✓ Copied' : '⎘ Copy'}
          </button>
          <button onClick={handlePrint} className="text-[10px] px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">🖨 Print</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Paediatric Clinical Consultation Note</h3>
                <p className="text-[9px] text-gray-400 mt-0.5">{new Date().toLocaleString()}</p>
              </div>
              <div className="text-[9px] font-bold px-2 py-1 rounded-lg border" style={{ background: severityColors.bg, borderColor: severityColors.border, color: severityColors.text }}>
                {severityLabel.toUpperCase()}
              </div>
            </div>
          </div>

          {/* IDENTIFICATION */}
          <Section title="Identification Data" sectionKey="identification" expanded={expandedSections} onToggle={toggleSection}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <Field label="Name" value={form.biodata.patientName} />
              <Field label="Age" value={ageStr} />
              <Field label="Sex" value={form.biodata.sex} />
              {form.biodata.residence && <Field label="Residence" value={form.biodata.residence} />}
              {form.biodata.informant && <Field label="Informant" value={`${form.biodata.informant}${form.biodata.informantRelation ? ` (${form.biodata.informantRelation})` : ''}`} />}
              {form.biodata.dateOfAdmission && <Field label="Admitted" value={form.biodata.dateOfAdmission} />}
            </div>
          </Section>

          {/* COMPLAINTS */}
          <Section title="Chief Complaints" sectionKey="complaints" expanded={expandedSections} onToggle={toggleSection}>
            <ol className="list-decimal list-inside space-y-0.5">
              {form.complaints.map((c, i) => (
                <li key={i} className="text-xs text-gray-700">{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
              ))}
            </ol>
          </Section>

          {/* HPI */}
          <Section title="History of Presenting Illness" sectionKey="hpi" expanded={expandedSections} onToggle={toggleSection}>
            <p className="text-xs text-gray-700 leading-relaxed">{buildHpiText(form, ageStr)}</p>
          </Section>

          {/* BACKGROUND */}
          <Section title="Background History" sectionKey="background" expanded={expandedSections} onToggle={toggleSection}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {form.pmh.prevAdmissions && <Field label="Prev Admissions" value={form.pmh.prevAdmDetail || 'Yes'} />}
              {form.pmh.chronicIllnesses && form.pmh.chronicIllnesses.length > 0 && <Field label="Chronic Illnesses" value={form.pmh.chronicIllnesses.join(', ')} />}
              {form.pmh.allergies && <Field label="Allergies" value={form.pmh.allergies} />}
              {form.pmh.medications && <Field label="Current Meds" value={form.pmh.medications} />}
              {form.birth.birthPlace && <Field label="Birth Place" value={form.birth.birthPlace} />}
              {form.birth.deliveryMode && <Field label="Delivery" value={form.birth.deliveryMode} />}
              {form.birth.gestAgeWeeks && <Field label="Gestation" value={`${form.birth.gestAgeWeeks} wks`} />}
              {form.birth.birthWeight && <Field label="Birth Weight" value={`${form.birth.birthWeight} kg`} />}
              {form.family.smokingExposure && <Field label="Smoke Exposure" value={form.family.smokeDetail || 'Yes'} />}
              {form.family.tbHousehold && <Field label="TB Contact" value="Household" />}
              {form.family.asthmaFamily && <Field label="Family Asthma" value="Yes" />}
            </div>
          </Section>

          {/* VITALS */}
          <Section title="Vital Signs" sectionKey="vitals" expanded={expandedSections} onToggle={toggleSection}>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {form.vitals.temp && <VitalCard label="Temp" value={`${form.vitals.temp}°C`} warn={parseFloat(form.vitals.temp) >= 38.5} />}
              {form.vitals.hr && <VitalCard label="HR" value={`${form.vitals.hr}/min`} warn={parseInt(form.vitals.hr) > 140 || parseInt(form.vitals.hr) < 80} />}
              {form.vitals.rr && <VitalCard label="RR" value={`${form.vitals.rr}/min`} warn={parseInt(form.vitals.rr) > 40} />}
              {form.vitals.spo2 && <VitalCard label="SpO₂" value={`${form.vitals.spo2}%`} warn={parseFloat(form.vitals.spo2) < 92} critical={parseFloat(form.vitals.spo2) < 85} />}
              {form.vitals.bpSystolic && <VitalCard label="BP" value={`${form.vitals.bpSystolic}/${form.vitals.bpDiastolic || '?'}`} />}
              {form.vitals.weight && <VitalCard label="Weight" value={`${form.vitals.weight} kg`} />}
              {form.vitals.muac && <VitalCard label="MUAC" value={`${form.vitals.muac} cm`} warn={parseFloat(form.vitals.muac) < 13.5} critical={parseFloat(form.vitals.muac) < 12.5} />}
              {form.vitals.capRefill && <VitalCard label="Cap Refill" value={`${form.vitals.capRefill}s`} />}
            </div>
          </Section>

          {/* EXAMINATION */}
          <Section title="Examination Findings" sectionKey="exam" expanded={expandedSections} onToggle={toggleSection}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
              <Field label="Chest Indrawing" value={yn(form.vitals.examIndrawing)} />
              <Field label="Nasal Flaring" value={yn(form.vitals.examNasalFlaring)} />
              <Field label="Grunting" value={yn(form.vitals.examGrunting)} />
              <Field label="Stridor" value={yn(form.vitals.examStridor)} />
              <Field label="Wheeze" value={yn(form.vitals.examWheeze)} />
              <Field label="Crackles" value={yn(form.vitals.examCrackles)} />
              <Field label="Bronchial Br." value={yn(form.vitals.examBronchial)} />
              <Field label="Reduced Air Entry" value={yn(form.vitals.examReducedBS)} />
              <Field label="Dullness" value={yn(form.vitals.examDullness)} />
              <Field label="Tracheal Deviation" value={yn(form.vitals.examTrachealDeviation)} />
              <Field label="Cyanosis" value={yn(form.vitals.cyanosisExam)} />
              <Field label="Clubbing" value={yn(form.vitals.clubbingExam)} />
              <Field label="Pallor" value={yn(form.vitals.pallorExam)} />
              <Field label="Hepatomegaly" value={yn(form.vitals.examHepatomegaly)} />
              <Field label="Neck Stiffness" value={yn(form.vitals.examNeckStiffness)} />
              {form.vitals.examMurmur && form.vitals.examMurmur !== 'none' && <Field label="Murmur" value={form.vitals.examMurmur} />}
            </div>
          </Section>

          {/* ASSESSMENT */}
          <Section title="Assessment" sectionKey="assessment" expanded={expandedSections} onToggle={toggleSection}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-800">Working Diagnosis:</span>
              {topDx && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: severityColors.bg + '80', color: severityColors.text }}>
                  {topDx.disease.name}
                </span>
              )}
            </div>
            {topDx && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="bg-gray-50 rounded p-1.5 text-center">
                  <p className="text-[8px] text-gray-400 uppercase">Probability</p>
                  <p className="text-sm font-bold text-gray-700">{(topDx.probability * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-gray-50 rounded p-1.5 text-center">
                  <p className="text-[8px] text-gray-400 uppercase">Severity</p>
                  <p className="text-sm font-bold" style={{ color: severityColors.text }}>{severityLabel.toUpperCase()}</p>
                </div>
                <div className="bg-gray-50 rounded p-1.5 text-center">
                  <p className="text-[8px] text-gray-400 uppercase">Weight</p>
                  <p className="text-sm font-bold text-gray-700">{weight ? `${weight} kg` : '—'}</p>
                </div>
              </div>
            )}

            {/* Editable summary */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Clinical Summary</span>
                {editingField !== 'summary' && (
                  <button onClick={() => startEdit('summary', form.summary.ddxNotes || assessmentText)}
                    className="text-[9px] text-blue-400 hover:text-blue-600">edit</button>
                )}
              </div>
              {editingField === 'summary' ? (
                <div>
                  <textarea ref={editRef} value={editValue} onChange={e => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[60px] leading-relaxed resize-y"
                    placeholder="Enter clinical summary..." />
                  <div className="flex gap-2 mt-1">
                    <button onClick={saveEdit} className="text-[10px] px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
                    <button onClick={cancelEdit} className="text-[10px] px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap min-h-[24px] p-1 rounded hover:bg-gray-50 cursor-text"
                  onClick={() => startEdit('summary', form.summary.ddxNotes || assessmentText)}>
                  {form.summary.ddxNotes || assessmentText || 'Click to add summary...'}
                </div>
              )}
            </div>

            {/* Must-not-miss safety */}
            {currentDDx.some(d => d.disease.mustNotMiss && d.probability > 0.05) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-[9px] font-bold text-red-600 uppercase mb-1">Must Not Miss</p>
                {currentDDx.filter(d => d.disease.mustNotMiss && d.probability > 0.05).map(d => (
                  <p key={d.disease.id} className="text-[10px] text-red-700">
                    • {d.disease.name} ({(d.probability * 100).toFixed(0)}%) — key discriminators must be addressed
                  </p>
                ))}
              </div>
            )}

            {/* Editable final diagnosis */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Final Diagnosis</span>
                {editingField !== 'workingDx' && (
                  <button onClick={() => startEdit('workingDx', form.summary.workingDx || topDx?.disease.name || '')}
                    className="text-[9px] text-blue-400 hover:text-blue-600">edit</button>
                )}
              </div>
              {editingField === 'workingDx' ? (
                <div>
                  <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <div className="flex gap-2 mt-1">
                    <button onClick={saveEdit} className="text-[10px] px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
                    <button onClick={cancelEdit} className="text-[10px] px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-semibold text-gray-700 p-1 rounded hover:bg-gray-50 cursor-text"
                  onClick={() => startEdit('workingDx', form.summary.workingDx || topDx?.disease.name || '')}>
                  {form.summary.workingDx || topDx?.disease.name || 'Click to set'}
                </div>
              )}
            </div>
          </Section>

          {/* DIFFERENTIALS */}
          <Section title="Differential Diagnoses" sectionKey="differentials" expanded={expandedSections} onToggle={toggleSection}>
            <div className="space-y-1">
              {currentDDx.filter(d => d.rawScore > 0).slice(0, 7).map((dx, i) => (
                <div key={dx.disease.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-3">{i + 1}.</span>
                    <span className="text-xs text-gray-700">{dx.disease.name}</span>
                    <span className={`text-[8px] px-1 py-0.5 rounded font-semibold ${dx.relation === 'primary' ? 'bg-blue-100 text-blue-600' : dx.relation === 'complication' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{dx.relation}</span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500">{Math.round(dx.probability * 100)}%</span>
                </div>
              ))}
            </div>
          </Section>

          {/* MANAGEMENT PLAN */}
          <Section title="Management Plan" sectionKey="plan" expanded={expandedSections} onToggle={toggleSection}>
            {plan ? (
              <div className="space-y-3">
                  {plan.diagnosisSpecific.map((ds, i) => (
                  <div key={i} className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-700 uppercase">{ds.diseaseName} ({ds.severity})</p>
                    {ds.prescriptions && ds.prescriptions.length > 0 ? (
                      <div className="mt-1">
                        <p className="text-[9px] font-bold text-green-600 uppercase mb-0.5">Definitive Treatment</p>
                        {ds.prescriptions[0]?.weightUsed && (
                          <p className="text-[10px] text-gray-500 mb-0.5">Using weight: <strong>{ds.prescriptions[0].weightUsed} kg</strong></p>
                        )}
                        {ds.prescriptions.map((rx, j) => (
                          <p key={j} className="text-[11px] text-gray-700 flex items-start gap-1">
                            <span className="text-green-500">→</span>
                            <span><strong>{rx.drugName}</strong> {rx.route ? `(${rx.route})` : ''}: <strong>{rx.doseComputed}</strong>{rx.frequency ? ` ${rx.frequency}` : ''}{rx.duration ? ` × ${rx.duration}` : ''}{rx.notes ? ` — ${rx.notes}` : ''}{rx.maxCapped ? <span className="text-amber-600 font-bold"> ⚠ {rx.maxCappedDetail}</span> : ''}</span>
                          </p>
                        ))}
                      </div>
                    ) : (
                      ds.steps.map((step, j) => <p key={j} className="text-[11px] text-gray-700 flex items-start gap-1"><span className="text-blue-400">•</span> {step}</p>)
                    )}
                  </div>
                ))}
                {plan.investigations.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Investigations</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.investigations.map((inv, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{inv}</span>)}
                    </div>
                  </div>
                )}
                {plan.supportiveCare.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Supportive Care</p>
                    {plan.supportiveCare.map((sc, i) => <p key={i} className="text-[11px] text-gray-600 flex items-start gap-1"><span className="text-green-500">•</span> {sc}</p>)}
                  </div>
                )}
                {plan.monitoring && <div><p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Monitoring</p><p className="text-[11px] text-gray-600">{plan.monitoring}</p></div>}
                {plan.followUp && <div><p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Follow-up</p><p className="text-[11px] text-gray-600">{plan.followUp}</p></div>}
                {plan.healthEducation.trim() && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <p className="text-[9px] font-bold text-amber-600 uppercase mb-1">Health Education</p>
                    <p className="text-[11px] text-amber-700 whitespace-pre-wrap">{plan.healthEducation}</p>
                  </div>
                )}
              </div>
            ) : <p className="text-xs text-gray-400 italic">Awaiting data to generate plan.</p>}
          </Section>

          {/* SAFETY NETTING */}
          <Section title="Safety Netting & Discharge Instructions" sectionKey="safety" expanded={expandedSections} onToggle={toggleSection}>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-red-700 mb-1">
                {topDx ? `${topDx.disease.name} — ${severityLabel.toUpperCase()}` : 'Safety Instructions'}
              </p>
              <p className="text-xs text-red-700 whitespace-pre-wrap leading-relaxed">
                {plan?.safetyNetting || getDefaultSafety(topDx?.disease.id || '', severityLabel)}
              </p>
            </div>
            <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">When to Return Immediately</p>
              <ul className="text-[11px] text-gray-600 space-y-0.5">
                <li>• Breathing difficulty worsens despite treatment</li>
                <li>• Child becomes drowsy or difficult to wake</li>
                <li>• Turns blue (cyanosis) around the mouth</li>
                <li>• Unable to feed or drink at all</li>
                <li>• Convulsions / fits</li>
                <li>• Fever persists beyond 48h on antibiotics</li>
              </ul>
            </div>
          </Section>

          {/* REFERENCE: AGE-BANDED VITALS */}
          <Section title="Reference: Age-Banded Vital Signs" sectionKey="reference" expanded={expandedSections} onToggle={toggleSection}>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-1.5 border border-gray-200 font-semibold text-gray-500">Age Group</th>
                    <th className="text-center p-1.5 border border-gray-200 font-semibold text-gray-500">HR (/min)</th>
                    <th className="text-center p-1.5 border border-gray-200 font-semibold text-gray-500">RR (/min)</th>
                    <th className="text-center p-1.5 border border-gray-200 font-semibold text-gray-500">SBP (mmHg)</th>
                    <th className="text-center p-1.5 border border-gray-200 font-semibold text-gray-500">DBP (mmHg)</th>
                  </tr>
                </thead>
                <tbody>
                  {AGE_BANDS.map(b => {
                    const isCurrent = band === b;
                    return (
                      <tr key={b.label} className={`${isCurrent ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}`}>
                        <td className="p-1.5 border border-gray-200 text-gray-700">{b.label}{isCurrent ? ' ← pt' : ''}</td>
                        <td className="text-center p-1.5 border border-gray-200 text-gray-600">{b.hrMin}–{b.hrMax}</td>
                        <td className="text-center p-1.5 border border-gray-200 text-gray-600">{b.rrMin}–{b.rrMax}</td>
                        <td className="text-center p-1.5 border border-gray-200 text-gray-600">{b.sbpMin}–{b.sbpMax}</td>
                        <td className="text-center p-1.5 border border-gray-200 text-gray-600">{b.dbpMin}–{b.dbpMax}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {band && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700">Current: {band.label}</span>
                {form.vitals.hr && (parseInt(form.vitals.hr) < band.hrMin || parseInt(form.vitals.hr) > band.hrMax) && <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700">HR abnormal</span>}
                {form.vitals.rr && (parseInt(form.vitals.rr) < band.rrMin || parseInt(form.vitals.rr) > band.rrMax) && <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700">RR abnormal</span>}
              </div>
            )}
          </Section>

          {/* DOSES */}
          <Section title="Calculated Drug Doses" sectionKey="doses" expanded={expandedSections} onToggle={toggleSection}>
            {weight > 0 ? (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-1.5 border border-gray-200 font-semibold text-gray-500">Drug</th>
                        <th className="text-left p-1.5 border border-gray-200 font-semibold text-gray-500">Dose</th>
                        <th className="text-center p-1.5 border border-gray-200 font-semibold text-gray-500">Route</th>
                        <th className="text-center p-1.5 border border-gray-200 font-semibold text-gray-500">Frequency</th>
                        <th className="text-left p-1.5 border border-gray-200 font-semibold text-gray-500">Note</th>
                        <th className="text-center p-1.5 border border-gray-200 font-semibold text-gray-500">Calculated</th>
                        <th className="text-center p-1.5 border border-gray-200 font-semibold text-gray-500">Rx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(DRUG_DOSES).map(([key, dd]) => {
                        const isRelevant = topDx && dd.relevantTo.includes(topDx.disease.id);
                        return (
                          <tr key={key}
                            className={`${isRelevant ? 'bg-blue-50 font-medium' : 'hover:bg-gray-50'} ${selectedDrug === key ? 'ring-2 ring-blue-400' : ''} cursor-pointer`}
                            onClick={() => {
                              setSelectedDrug(selectedDrug === key ? null : key);
                              setPrescriptionSaved(null);
                            }}>
                            <td className="p-1.5 border border-gray-200 text-gray-700">{dd.drug}</td>
                            <td className="p-1.5 border border-gray-200 text-gray-600 font-mono">{dd.dose(weight)}</td>
                            <td className="text-center p-1.5 border border-gray-200 text-gray-600">{dd.route}</td>
                            <td className="text-center p-1.5 border border-gray-200 text-gray-600">{dd.freq}</td>
                            <td className="p-1.5 border border-gray-200 text-gray-500">{dd.note}{isRelevant ? ' ✓' : ''}</td>
                            <td className="text-center p-1.5 border border-gray-200 text-gray-600 font-mono font-semibold">{dd.dose(weight)}</td>
                            <td className="text-center p-1.5 border border-gray-200">
                              <span className={`text-[10px] ${selectedDrug === key ? 'text-blue-600' : 'text-gray-300 hover:text-blue-400'}`}>💊</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="text-[9px] text-gray-400 mt-1">Click a row to prescribe. Blue highlight = relevant to current diagnosis.</p>
                </div>

                {/* Prescription Form */}
                {selectedDrug && (() => {
                  const dd = DRUG_DOSES[selectedDrug];
                  if (!dd) return null;
                  const patientName = form.biodata.patientName || 'Unnamed Patient';
                  const patientId = form.biodata.patientName ? `pt-${form.biodata.patientName.replace(/\s+/g, '-').toLowerCase()}` : 'pt-unknown';
                  return (
                    <div className="mt-3">
                      {prescriptionSaved ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                          <p className="text-xs font-semibold text-green-700">✓ {prescriptionSaved.medication} prescribed</p>
                          <button onClick={() => { setSelectedDrug(null); setPrescriptionSaved(null); }}
                            className="mt-2 text-[10px] px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700">
                            Done
                          </button>
                        </div>
                      ) : (
                        <PrescriptionForm
                          patientId={patientId}
                          patientName={patientName}
                          doctorId="current-user"
                          doctorName="Clinical Officer"
                          medication={dd.drug}
                          calculatedDose={dd.dose(weight)}
                          defaultRoute={dd.route}
                          defaultFrequency={dd.freq}
                          defaultIndication={dd.note}
                          drugClass={dd.drugClass}
                          toolType={topDx?.disease.id || 'clinical_intelligence'}
                          onSaved={(result) => {
                            setPrescriptionSaved({ medication: result.medication, id: result.id });
                            setSelectedDrug(null);
                          }}
                          onCancel={() => setSelectedDrug(null)}
                        />
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Enter weight in vitals to calculate drug doses.</p>
            )}
            {weight > 0 && (
              <p className="text-[9px] text-gray-400 mt-1">All doses calculated using weight: <strong>{weight} kg</strong>. Verify weight is correct before prescribing.</p>
            )}
          </Section>

          {/* TREATMENT SHEET */}
          <Section title="Treatment Sheet (Active Prescriptions)" sectionKey="prescriptions" expanded={expandedSections} onToggle={toggleSection}>
            <TreatmentSheet
              patientId={form.biodata.patientName ? `pt-${form.biodata.patientName.replace(/\s+/g, '-').toLowerCase()}` : 'pt-unknown'}
              doctorId="current-user"
            />
          </Section>

          {/* MONITORING SHEETS */}
          <Section title="Clinical Monitoring Tools" sectionKey="monitoring" expanded={expandedSections} onToggle={toggleSection}>
            <MonitoringSheets
              diagnosisId={topDx?.disease.id || ''}
              diagnosisName={topDx?.disease.name || ''}
              severity={severityLabel}
            />
          </Section>

          {/* Footer */}
          <div className="text-center text-[9px] text-gray-300 pt-2 border-t border-gray-100">
            Generated by AMEXAN Paediatric Clinical Reasoning Engine | {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function yn(val: boolean | undefined | null): string {
  if (val === true) return 'Yes';
  if (val === false) return 'No';
  return '—';
}

function Section({ title, sectionKey, expanded, onToggle, children }: {
  title: string; sectionKey: string; expanded: Record<string, boolean>;
  onToggle: (k: string) => void; children: React.ReactNode;
}) {
  const isExpanded = expanded[sectionKey] !== false;
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 transition-colors">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{title}</span>
        <span className={`text-gray-400 transition-transform text-xs ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {isExpanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 border-b border-gray-50 last:border-0">
      <span className="text-[9px] text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-[11px] font-medium text-gray-700 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function VitalCard({ label, value, warn, critical }: { label: string; value: string; warn?: boolean; critical?: boolean }) {
  return (
    <div className={`rounded-lg border p-2 text-center ${critical ? 'bg-red-50 border-red-200' : warn ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
      <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`text-xs font-bold mt-0.5 ${critical ? 'text-red-600' : warn ? 'text-amber-600' : 'text-gray-700'}`}>{value}</p>
    </div>
  );
}
