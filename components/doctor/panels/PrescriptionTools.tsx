'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, serverTimestamp, query, where,
  onSnapshot, orderBy, doc, updateDoc, Timestamp,
} from 'firebase/firestore';
import { writeTimelineEvent } from '@/lib/firebaseTimeline';
import {
  getDrug, searchDrugs, checkInteractions, checkContraindications,
  generateDosingSuggestion, calculateDoseByWeight, DrugEntry, DRUG_DATABASE,
} from '@/src/data/formulary';

type OrderPriority = 'routine' | 'urgent' | 'stat';
type OrderStatus = 'ordered' | 'in_progress' | 'completed' | 'cancelled';
type LabCategory = 'hematology' | 'biochemistry' | 'microbiology' | 'immunology' | 'hormonal' | 'toxicology' | 'other';
type ImagingModality = 'xray' | 'ct' | 'mri' | 'ultrasound' | 'echo' | 'ecg' | 'other';

interface Medication {
  id?: string;
  patientId: string; doctorId: string; doctorName: string;
  medication: string; dosage: string; frequency: string; route: string;
  duration: string; durationUnit: string; quantity: number;
  instructions?: string; indication?: string; drugId?: string;
  status: 'active' | 'completed' | 'stopped';
  isChronic: boolean;
  refills: number; refillsUsed: number;
  lastFilled?: Timestamp | any; nextRefillDue?: Timestamp | any;
  createdBy: string; createdAt: Timestamp | any;
  stoppedAt?: Timestamp | any; stopReason?: string;
  linkedDocketId?: string;
}

interface LabOrder {
  id?: string;
  patientId: string; doctorId: string; doctorName: string;
  testName: string; category: LabCategory;
  priority: OrderPriority; status: OrderStatus;
  clinicalQuestion?: string; specimenType?: string;
  result?: string; resultDate?: Timestamp | any;
  orderedAt: Timestamp | any; createdBy: string;
  linkedDocketId?: string;
}

interface ImagingOrder {
  id?: string;
  patientId: string; doctorId: string; doctorName: string;
  studyName: string; modality: ImagingModality;
  priority: OrderPriority; status: OrderStatus;
  clinicalQuestion?: string; bodyPart?: string;
  result?: string; resultDate?: Timestamp | any; resultUrl?: string;
  orderedAt: Timestamp | any; createdBy: string;
  linkedDocketId?: string;
}

const FREQUENCY_OPTIONS = [
  { value: 'QD', label: 'QD (Once daily)' },
  { value: 'BID', label: 'BID (Twice daily)' },
  { value: 'TID', label: 'TID (Three times daily)' },
  { value: 'QID', label: 'QID (Four times daily)' },
  { value: 'QHS', label: 'QHS (At bedtime)' },
  { value: 'Q6H', label: 'Every 6 hours' },
  { value: 'Q8H', label: 'Every 8 hours' },
  { value: 'Q12H', label: 'Every 12 hours' },
  { value: 'PRN', label: 'PRN (As needed)' },
  { value: 'STAT', label: 'STAT (Single dose)' },
];

const ROUTE_OPTIONS = [
  { value: 'oral', label: 'Oral' },
  { value: 'iv', label: 'IV' },
  { value: 'im', label: 'IM' },
  { value: 'sc', label: 'SC' },
  { value: 'topical', label: 'Topical' },
  { value: 'inhaled', label: 'Inhaled' },
  { value: 'sublingual', label: 'Sublingual' },
  { value: 'rectal', label: 'Rectal' },
  { value: 'ophthalmic', label: 'Ophthalmic' },
  { value: 'otic', label: 'Otic' },
];

const LAB_CATEGORIES: { value: LabCategory; label: string }[] = [
  { value: 'hematology', label: '🧬 Hematology' },
  { value: 'biochemistry', label: '🧪 Biochemistry' },
  { value: 'microbiology', label: '🦠 Microbiology' },
  { value: 'immunology', label: '🛡️ Immunology' },
  { value: 'hormonal', label: '⚖️ Hormonal' },
  { value: 'toxicology', label: '☠️ Toxicology' },
  { value: 'other', label: '📋 Other' },
];

const COMMON_LABS: { name: string; category: LabCategory }[] = [
  { name: 'Full Blood Count (FBC)', category: 'hematology' },
  { name: 'Hemoglobin (Hb)', category: 'hematology' },
  { name: 'White Cell Count (WCC)', category: 'hematology' },
  { name: 'Platelet Count', category: 'hematology' },
  { name: 'Coagulation Profile (PT/PTT/INR)', category: 'hematology' },
  { name: 'ESR', category: 'hematology' },
  { name: 'Blood Film', category: 'hematology' },
  { name: 'Urea & Electrolytes (U&Es)', category: 'biochemistry' },
  { name: 'Creatinine', category: 'biochemistry' },
  { name: 'eGFR', category: 'biochemistry' },
  { name: 'Liver Function Tests (LFTs)', category: 'biochemistry' },
  { name: 'Random Blood Sugar (RBS)', category: 'biochemistry' },
  { name: 'HbA1c', category: 'biochemistry' },
  { name: 'Lipid Profile', category: 'biochemistry' },
  { name: 'CRP', category: 'biochemistry' },
  { name: 'Troponin', category: 'biochemistry' },
  { name: 'Blood Cultures', category: 'microbiology' },
  { name: 'Urine Culture & Sensitivity', category: 'microbiology' },
  { name: 'Sputum Culture', category: 'microbiology' },
  { name: 'Malaria Parasite (MP)', category: 'microbiology' },
  { name: 'Hepatitis B Surface Antigen', category: 'immunology' },
  { name: 'HIV Serology', category: 'immunology' },
  { name: 'Viral Load', category: 'immunology' },
  { name: 'CD4 Count', category: 'immunology' },
  { name: 'Thyroid Function (TFTs)', category: 'hormonal' },
  { name: 'Drug Levels', category: 'toxicology' },
];

const COMMON_IMAGING: { name: string; modality: ImagingModality }[] = [
  { name: 'Chest X-ray (CXR)', modality: 'xray' },
  { name: 'Abdominal X-ray (AXR)', modality: 'xray' },
  { name: 'Limb X-ray', modality: 'xray' },
  { name: 'CT Head', modality: 'ct' },
  { name: 'CT Chest', modality: 'ct' },
  { name: 'CT Abdomen/Pelvis', modality: 'ct' },
  { name: 'MRI Brain', modality: 'mri' },
  { name: 'MRI Spine', modality: 'mri' },
  { name: 'Abdominal Ultrasound', modality: 'ultrasound' },
  { name: 'Pelvic Ultrasound', modality: 'ultrasound' },
  { name: 'Obstetric Ultrasound', modality: 'ultrasound' },
  { name: 'Echocardiogram (ECHO)', modality: 'echo' },
  { name: 'ECG (Electrocardiogram)', modality: 'ecg' },
];

type ActiveTab = 'medications' | 'labs' | 'imaging';

interface Props {
  patientId: string; doctorId: string; doctorName: string;
  compact?: boolean; docketId?: string;
}

function findDrugIdByName(name: string): string | undefined {
  const q = name.toLowerCase().trim();
  const entry = Object.values(DRUG_DATABASE).find(d =>
    d.name.toLowerCase() === q ||
    d.genericName.toLowerCase() === q ||
    d.brandNames.some(b => b.toLowerCase() === q)
  );
  return entry?.id;
}

export default function PrescriptionTools({ patientId, doctorId, doctorName, compact, docketId }: Props) {
  const [tab, setTab] = useState<ActiveTab>('medications');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [imagingOrders, setImagingOrders] = useState<ImagingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState<false | 'med' | 'lab' | 'img'>(false);

  // Medication form
  const [rxForm, setRxForm] = useState({
    medication: '', drugId: '', drugClass: '', dosage: '', frequency: '', route: 'oral',
    duration: '7', durationUnit: 'days', quantity: 30,
    instructions: '', indication: '', isChronic: false, refills: 0, prescriberNotes: '',
  });
  const [searchResults, setSearchResults] = useState<DrugEntry[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<DrugEntry | null>(null);
  const [showDrugInfo, setShowDrugInfo] = useState(false);
  const [showCommonSE, setShowCommonSE] = useState(false);
  const [showSeriousSE, setShowSeriousSE] = useState(false);
  const [showCIs, setShowCIs] = useState(false);
  const [showWeightCalc, setShowWeightCalc] = useState(false);
  const [weightInput, setWeightInput] = useState('70');
  const [isPediatric, setIsPediatric] = useState(false);
  const [calculatedDose, setCalculatedDose] = useState('');
  const [computedInteractions, setComputedInteractions] = useState<{ drugA: string; drugB: string; severity: string; effect: string; mechanism?: string }[]>([]);
  const [contraindicationWarnings, setContraindicationWarnings] = useState<string[]>([]);
  const [indicationSuggestions, setIndicationSuggestions] = useState<string[]>([]);
  const [conditionsInput, setConditionsInput] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);
  const [eGFRInput, setEGFRInput] = useState('');
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [showContraindicationPanel, setShowContraindicationPanel] = useState(false);
  const [customFreq, setCustomFreq] = useState('');
  const [showCustomFreq, setShowCustomFreq] = useState(false);

  // Lab form
  const [labForm, setLabForm] = useState({
    testName: '', category: 'biochemistry' as LabCategory,
    priority: 'routine' as OrderPriority, clinicalQuestion: '', specimenType: '',
  });
  const [showLabSuggestions, setShowLabSuggestions] = useState(false);

  // Imaging form
  const [imgForm, setImgForm] = useState({
    studyName: '', modality: 'xray' as ImagingModality,
    priority: 'routine' as OrderPriority, clinicalQuestion: '', bodyPart: '',
  });
  const [showImgSuggestions, setShowImgSuggestions] = useState(false);

  const [saving, setSaving] = useState(false);

  const activeMeds = useMemo(() => medications.filter(m => m.status === 'active'), [medications]);
  const activeLabs = useMemo(() => labOrders.filter(o => o.status === 'ordered' || o.status === 'in_progress'), [labOrders]);
  const activeImaging = useMemo(() => imagingOrders.filter(o => o.status === 'ordered' || o.status === 'in_progress'), [imagingOrders]);

  // Fetch data
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(onSnapshot(
      query(collection(db, 'prescriptions'), where('patientId', '==', patientId), orderBy('createdAt', 'desc')),
      snap => setMedications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Medication))),
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'labOrders'), where('patientId', '==', patientId), orderBy('orderedAt', 'desc')),
      snap => setLabOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabOrder))),
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'imagingOrders'), where('patientId', '==', patientId), orderBy('orderedAt', 'desc')),
      snap => setImagingOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as ImagingOrder))),
    ));

    setLoading(false);
    return () => unsubs.forEach(u => u());
  }, [patientId]);

  // Re-check interactions when activeMeds changes and a drug is selected
  useEffect(() => {
    if (!selectedDrug) return;
    runInteractionAndContraindicationChecks(selectedDrug);
  }, [activeMeds.length]);

  const runInteractionAndContraindicationChecks = useCallback((drug: DrugEntry) => {
    const matchedIds: string[] = [drug.id];
    activeMeds.forEach(med => {
      if (med.drugId && med.drugId !== drug.id) {
        matchedIds.push(med.drugId);
      } else if (!med.drugId) {
        const foundId = findDrugIdByName(med.medication);
        if (foundId && foundId !== drug.id) matchedIds.push(foundId);
      } else if (med.drugId !== drug.id) {
        matchedIds.push(med.drugId);
      }
    });

    if (matchedIds.length > 1) {
      const results = checkInteractions(matchedIds);
      setComputedInteractions(results.filter(r => r.drugA === drug.name || r.drugB === drug.name));
    } else {
      setComputedInteractions([]);
    }

    const conditions = conditionsInput.split(',').map(s => s.trim()).filter(Boolean);
    const allergies = allergiesInput.split(',').map(s => s.trim()).filter(Boolean);
    const warnings = checkContraindications(drug.id, {
      conditions,
      allergies,
      pregnancy: isPregnant,
      eGFR: eGFRInput ? parseFloat(eGFRInput) : undefined,
    });
    setContraindicationWarnings(warnings);
  }, [activeMeds, conditionsInput, allergiesInput, isPregnant, eGFRInput]);

  const handleSelectDrug = useCallback((drug: DrugEntry) => {
    setSelectedDrug(drug);
    setRxForm(prev => ({
      ...prev,
      medication: drug.name,
      drugId: drug.id,
      drugClass: drug.drugClass,
      dosage: '',
      frequency: '',
    }));
    setShowSearchResults(false);
    setShowDrugInfo(false);
    setShowCommonSE(false);
    setShowSeriousSE(false);
    setShowCIs(false);
    setIndicationSuggestions(drug.indications);
    setCalculatedDose('');

    runInteractionAndContraindicationChecks(drug);
  }, [runInteractionAndContraindicationChecks]);

  const handleSearchChange = useCallback((value: string) => {
    setRxForm(prev => ({ ...prev, medication: value, drugId: '', drugClass: '' }));
    if (value.trim().length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const results = searchDrugs(value.trim());
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
    if (results.length === 1 && results[0].name.toLowerCase() === value.trim().toLowerCase()) {
      handleSelectDrug(results[0]);
    }
  }, [handleSelectDrug]);

  const handleDosingClick = useCallback((d: { dose: string; frequency: string }) => {
    setRxForm(prev => ({ ...prev, dosage: d.dose, frequency: d.frequency }));
  }, []);

  const handleStrengthClick = useCallback((strength: string) => {
    setRxForm(prev => ({ ...prev, dosage: strength }));
  }, []);

  const handleCalcWeightDose = useCallback(() => {
    if (!selectedDrug || !weightInput) return;
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    const result = calculateDoseByWeight(selectedDrug.id, w, isPediatric);
    setCalculatedDose(result);
  }, [selectedDrug, weightInput, isPediatric]);

  const clearSelectedDrug = useCallback(() => {
    setSelectedDrug(null);
    setComputedInteractions([]);
    setContraindicationWarnings([]);
    setIndicationSuggestions([]);
    setCalculatedDose('');
    setRxForm(prev => ({ ...prev, drugId: '', drugClass: '' }));
  }, []);

  // ─── SAVE MEDICATION ───
  const handleSaveMedication = useCallback(async () => {
    if (!rxForm.medication.trim() || !rxForm.dosage.trim()) return;
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, 'prescriptions'), {
        ...rxForm, patientId, doctorId, doctorName, linkedDocketId: docketId || null,
        status: 'active', refillsUsed: 0,
        createdBy: doctorId, createdAt: serverTimestamp(),
      });
      await writeTimelineEvent({
        patientId, type: 'medication_prescribed',
        title: `💊 Prescribed: ${rxForm.medication} ${rxForm.dosage} ${rxForm.frequency}`,
        description: rxForm.indication ? `For ${rxForm.indication}. ${rxForm.instructions || ''}` : rxForm.instructions || '',
        severity: 'info', createdBy: doctorId,
        linkedDocId: ref.id, linkedCollection: 'prescriptions',
        metadata: { medication: rxForm.medication, dosage: rxForm.dosage, drugId: rxForm.drugId },
      });
      setRxForm({ medication: '', drugId: '', drugClass: '', dosage: '', frequency: '', route: 'oral', duration: '7', durationUnit: 'days', quantity: 30, instructions: '', indication: '', isChronic: false, refills: 0, prescriberNotes: '' });
      setSelectedDrug(null);
      setComputedInteractions([]);
      setContraindicationWarnings([]);
      setIndicationSuggestions([]);
      setCalculatedDose('');
      setShowForm(false);
    } catch (e) { console.error('Save medication failed:', e); }
    setSaving(false);
  }, [rxForm, patientId, doctorId, doctorName, docketId]);

  // ─── STOP MEDICATION ───
  const handleStopMedication = useCallback(async (medId: string, medication: string) => {
    if (!confirm(`Stop ${medication}?`)) return;
    await updateDoc(doc(db, 'prescriptions', medId), {
      status: 'stopped', stoppedAt: serverTimestamp(), stopReason: 'Doctor discontinued',
    });
    await writeTimelineEvent({
      patientId, type: 'medication_stopped',
      title: `⛔ Medication Stopped: ${medication}`,
      severity: 'warning', createdBy: doctorId,
      linkedDocId: medId, linkedCollection: 'prescriptions',
    });
  }, [patientId, doctorId]);

  // ─── SAVE LAB ORDER ───
  const handleSaveLab = useCallback(async () => {
    if (!labForm.testName.trim()) return;
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, 'labOrders'), {
        ...labForm, patientId, doctorId, doctorName, linkedDocketId: docketId || null,
        status: 'ordered', createdBy: doctorId, orderedAt: serverTimestamp(),
      });
      await writeTimelineEvent({
        patientId, type: 'lab_ordered',
        title: `🔬 Lab Ordered: ${labForm.testName}`,
        description: labForm.clinicalQuestion ? `Question: ${labForm.clinicalQuestion}` : '',
        severity: 'info', createdBy: doctorId,
        linkedDocId: ref.id, linkedCollection: 'labOrders',
        metadata: { testName: labForm.testName, priority: labForm.priority },
      });
      setLabForm({ testName: '', category: 'biochemistry', priority: 'routine', clinicalQuestion: '', specimenType: '' });
      setShowForm(false);
    } catch (e) { console.error('Save lab failed:', e); }
    setSaving(false);
  }, [labForm, patientId, doctorId, doctorName, docketId]);

  // ─── SAVE IMAGING ORDER ───
  const handleSaveImaging = useCallback(async () => {
    if (!imgForm.studyName.trim()) return;
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, 'imagingOrders'), {
        ...imgForm, patientId, doctorId, doctorName, linkedDocketId: docketId || null,
        status: 'ordered', createdBy: doctorId, orderedAt: serverTimestamp(),
      });
      await writeTimelineEvent({
        patientId, type: 'imaging_ordered',
        title: `🩻 Imaging Ordered: ${imgForm.studyName}`,
        description: imgForm.clinicalQuestion ? `Question: ${imgForm.clinicalQuestion}` : '',
        severity: 'info', createdBy: doctorId,
        linkedDocId: ref.id, linkedCollection: 'imagingOrders',
        metadata: { studyName: imgForm.studyName, modality: imgForm.modality },
      });
      setImgForm({ studyName: '', modality: 'xray', priority: 'routine', clinicalQuestion: '', bodyPart: '' });
      setShowForm(false);
    } catch (e) { console.error('Save imaging failed:', e); }
    setSaving(false);
  }, [imgForm, patientId, doctorId, doctorName, docketId]);

  // ─── UPDATE ORDER STATUS ───
  const updateOrderStatus = useCallback(async (collection: string, orderId: string, status: OrderStatus) => {
    await updateDoc(doc(db, collection, orderId), { status });
  }, []);

  const fmtDate = (ts: any) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const prioColor = (p: OrderPriority) => p === 'stat' ? '#ef4444' : p === 'urgent' ? '#f59e0b' : 'var(--muted)';
  const statusColor = (s: OrderStatus) => s === 'completed' ? '#10b981' : s === 'in_progress' ? '#3b82f6' : s === 'cancelled' ? '#ef4444' : 'var(--text-2)';

  const hasAlerts = computedInteractions.length > 0 || contraindicationWarnings.length > 0;
  const majorAlerts = computedInteractions.filter(i => i.severity === 'major').length + contraindicationWarnings.length;
  const moderateAlerts = computedInteractions.filter(i => i.severity === 'moderate').length;
  const minorAlerts = computedInteractions.filter(i => i.severity === 'minor').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        {([
          { id: 'medications' as ActiveTab, icon: '💊', label: 'Medications', count: activeMeds.length },
          { id: 'labs' as ActiveTab, icon: '🔬', label: 'Lab Orders', count: activeLabs.length },
          { id: 'imaging' as ActiveTab, icon: '🩻', label: 'Imaging', count: activeImaging.length },
        ]).map(t => (
          <button key={t.id}
            className={`filter-chip ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
            {t.count > 0 && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.8 }}>({t.count})</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'medications' && (
        <>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-sm-accent" onClick={() => { setShowForm(showForm === 'med' ? false : 'med'); }}>
              {showForm === 'med' ? '✕ Close' : '➕ Prescribe Medication'}
            </button>
          </div>

          {showForm === 'med' && (
            <div style={{ padding: 16, borderRadius: 14, border: '2px solid var(--accent-dim)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* ── Alert Panel ── */}
              {hasAlerts && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: majorAlerts > 0 ? '#fef2f2' : '#fffbeb', border: `1px solid ${majorAlerts > 0 ? '#fca5a5' : '#fcd34d'}`, marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⚠️ Alerts Detected</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: majorAlerts > 0 ? '#ef4444' : '#f59e0b', color: '#fff', fontWeight: 700 }}>
                      {majorAlerts > 0 ? `${majorAlerts} major` : `${moderateAlerts + minorAlerts} total`}
                    </span>
                  </div>
                  {contraindicationWarnings.length > 0 && (
                    <div style={{ marginBottom: 4 }}>
                      {contraindicationWarnings.map((w, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#991b1b', padding: '2px 0', display: 'flex', gap: 4 }}>
                          <span style={{ color: '#ef4444' }}>⚠</span> {w}
                        </div>
                      ))}
                    </div>
                  )}
                  {computedInteractions.map((int, i) => (
                    <div key={i} style={{
                      fontSize: 11, padding: '4px 8px', marginBottom: 2, borderRadius: 6,
                      background: int.severity === 'major' ? '#fecaca' : int.severity === 'moderate' ? '#fde68a' : '#d1fae5',
                      color: int.severity === 'major' ? '#991b1b' : int.severity === 'moderate' ? '#92400e' : '#065f46',
                      display: 'flex', gap: 6, alignItems: 'flex-start',
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 10, minWidth: 40 }}>
                        {int.severity === 'major' ? '🔴 MAJOR' : int.severity === 'moderate' ? '🟡 MOD' : '🟢 MINOR'}
                      </span>
                      <div>
                        <span style={{ fontWeight: 600 }}>{int.drugA} ↔ {int.drugB}</span>
                        <span> — {int.effect}</span>
                        {int.mechanism && <span style={{ opacity: 0.7 }}> ({int.mechanism})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Drug Search ── */}
              <div className="field-col" style={{ position: 'relative' }}>
                <span className="field-lbl">Medication *</span>
                <input className="field-inp" placeholder="Search formulary by name, brand, class, or indication..."
                  value={rxForm.medication}
                  onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  onChange={e => handleSearchChange(e.target.value)} />
                {selectedDrug && rxForm.medication === selectedDrug.name && (
                  <button style={{ position: 'absolute', right: 8, top: 28, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--muted)' }}
                    onClick={clearSelectedDrug} title="Clear selection">✕</button>
                )}
                {showSearchResults && searchResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, maxHeight: 280, overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                    {searchResults.map(drug => (
                      <div key={drug.id} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 12, transition: 'background .12s', borderBottom: '1px solid var(--border)' }}
                        onMouseDown={() => handleSelectDrug(drug)}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div style={{ fontWeight: 700 }}>{drug.name} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 11 }}>({drug.genericName})</span></div>
                        <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 1 }}>{drug.drugClass}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
                          {drug.brandNames.length > 0 && <span>Brands: {drug.brandNames.join(', ')} · </span>}
                          Ind: {drug.indications.slice(0, 2).join(', ')}{drug.indications.length > 2 ? '...' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Drug Info Panel ── */}
              {selectedDrug && (
                <div style={{ borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', background: showDrugInfo ? 'var(--accent-dim)' : 'transparent' }}
                    onClick={() => setShowDrugInfo(!showDrugInfo)}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>💊 {selectedDrug.name} — Drug Information</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{showDrugInfo ? '▲' : '▼'}</span>
                  </div>
                  {showDrugInfo && (
                    <div style={{ padding: '8px 12px', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span><b>Class:</b> {selectedDrug.drugClass}</span>
                        <span><b>Category:</b> {selectedDrug.therapeuticCategory}</span>
                        <span><b>Half-life:</b> {selectedDrug.halfLife}</span>
                        <span><b>Onset:</b> {selectedDrug.onset}</span>
                        <span><b>Duration:</b> {selectedDrug.duration}</span>
                      </div>
                      <div><b>Mechanism of Action:</b> {selectedDrug.mechanismOfAction}</div>
                      <div><b>Available Strengths:</b> {selectedDrug.availableStrengths.join(', ')}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <b>Strength shortcuts:</b>
                        {selectedDrug.availableStrengths.map(s => (
                          <button key={s} style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, border: '1px solid var(--accent)', background: 'var(--accent-dim)', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                            onMouseDown={() => handleStrengthClick(s)}>{s}</button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <b>Routes:</b>
                        {selectedDrug.routes.map(r => (
                          <span key={r} style={{ padding: '1px 8px', borderRadius: 99, fontSize: 10, background: 'var(--border)', fontWeight: 600 }}>{r}</span>
                        ))}
                      </div>

                      <div style={{ background: 'var(--border)', height: 1, margin: '2px 0' }} />

                      {/* Common side effects */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                          onClick={() => setShowCommonSE(!showCommonSE)}>
                          <span style={{ fontWeight: 700, fontSize: 11 }}>Common Side Effects</span>
                          <span style={{ fontSize: 10, color: 'var(--muted)' }}>({selectedDrug.sideEffects.length}) {showCommonSE ? '▲' : '▼'}</span>
                        </div>
                        {showCommonSE && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                            {selectedDrug.sideEffects.map((se, i) => (
                              <span key={i} style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, background: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}>{se}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Serious side effects */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                          onClick={() => setShowSeriousSE(!showSeriousSE)}>
                          <span style={{ fontWeight: 700, fontSize: 11, color: '#991b1b' }}>Serious Side Effects</span>
                          <span style={{ fontSize: 10, color: 'var(--muted)' }}>({selectedDrug.seriousSideEffects.length}) {showSeriousSE ? '▲' : '▼'}</span>
                        </div>
                        {showSeriousSE && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                            {selectedDrug.seriousSideEffects.map((se, i) => (
                              <span key={i} style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' }}>{se}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Contraindications */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                          onClick={() => setShowCIs(!showCIs)}>
                          <span style={{ fontWeight: 700, fontSize: 11, color: '#991b1b' }}>Contraindications</span>
                          <span style={{ fontSize: 10, color: 'var(--muted)' }}>({selectedDrug.contraindications.length}) {showCIs ? '▲' : '▼'}</span>
                        </div>
                        {showCIs && (
                          <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, fontSize: 11, color: '#991b1b' }}>
                            {selectedDrug.contraindications.map((ci, i) => (
                              <li key={i}>{ci}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div style={{ background: 'var(--border)', height: 1, margin: '2px 0' }} />

                      <div><b>Monitoring:</b> {selectedDrug.monitoring.join(', ')}</div>
                      <div><b>Pregnancy:</b> {selectedDrug.pregnancyCategory}{selectedDrug.pregnancyCategory === 'Category X' ? ' ⛔' : selectedDrug.pregnancyCategory === 'Category D' ? ' ⚠️' : ''}</div>
                      <div><b>Lactation:</b> {selectedDrug.lactation}</div>
                      <div><b>Metabolism:</b> {selectedDrug.metabolism}</div>
                      <div><b>Excretion:</b> {selectedDrug.excretion}</div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Drug Class (auto-filled) ── */}
              <div className="field-col">
                <span className="field-lbl">Drug Class</span>
                <input className="field-inp" value={rxForm.drugClass} placeholder="Auto-filled from formulary" readOnly
                  style={{ opacity: 0.7, cursor: 'default' }} />
              </div>

              <div className="form-grid-2">
                {/* Dosage */}
                <div className="field-col">
                  <span className="field-lbl">Dosage *</span>
                  <input className="field-inp" placeholder="e.g. 10mg, 500mg"
                    value={rxForm.dosage} onChange={e => setRxForm(prev => ({ ...prev, dosage: e.target.value }))} />
                  {selectedDrug && selectedDrug.dosing.adult.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--muted)', marginRight: 2 }}>Suggested:</span>
                      {selectedDrug.dosing.adult.map((d, i) => (
                        <button key={i} style={{ padding: '1px 6px', borderRadius: 99, fontSize: 10, border: '1px solid var(--accent-dim)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer' }}
                          onMouseDown={() => handleDosingClick(d)}>
                          {d.dose} {d.frequency}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Frequency */}
                <div className="field-col">
                  <span className="field-lbl">Frequency</span>
                  {showCustomFreq ? (
                    <input className="field-inp" placeholder="Custom frequency..." value={customFreq}
                      onChange={e => { setCustomFreq(e.target.value); setRxForm(prev => ({ ...prev, frequency: e.target.value })); }}
                      onBlur={() => { if (!customFreq.trim()) setShowCustomFreq(false); }} />
                  ) : (
                    <select className="field-inp" value={rxForm.frequency}
                      onChange={e => {
                        if (e.target.value === 'custom') { setShowCustomFreq(true); setCustomFreq(''); return; }
                        setRxForm(prev => ({ ...prev, frequency: e.target.value }));
                      }}>
                      <option value="">Select...</option>
                      {FREQUENCY_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      <option value="custom">✏️ Custom...</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="form-grid-2">
                {/* Route */}
                <div className="field-col">
                  <span className="field-lbl">Route</span>
                  <select className="field-inp" value={rxForm.route} onChange={e => setRxForm(prev => ({ ...prev, route: e.target.value }))}>
                    {ROUTE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                {/* Duration */}
                <div className="field-col">
                  <span className="field-lbl">Duration</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input className="field-inp" style={{ flex: 1 }} placeholder="7" type="number" min={1}
                      value={rxForm.duration} onChange={e => setRxForm(prev => ({ ...prev, duration: e.target.value }))} />
                    <select className="field-inp" style={{ width: 90 }} value={rxForm.durationUnit}
                      onChange={e => setRxForm(prev => ({ ...prev, durationUnit: e.target.value }))}>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                {/* Quantity */}
                <div className="field-col">
                  <span className="field-lbl">Quantity</span>
                  <input className="field-inp" type="number" min={0} placeholder="30"
                    value={rxForm.quantity} onChange={e => setRxForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))} />
                </div>
                {/* Refills (only when chronic) */}
                {rxForm.isChronic && (
                  <div className="field-col">
                    <span className="field-lbl">Refills</span>
                    <input className="field-inp" type="number" min={0} value={rxForm.refills}
                      onChange={e => setRxForm(prev => ({ ...prev, refills: parseInt(e.target.value) || 0 }))} />
                  </div>
                )}
              </div>

              {/* Indication with suggestions */}
              <div className="field-col">
                <span className="field-lbl">Indication / Diagnosis</span>
                <input className="field-inp" placeholder="e.g. Hypertension, Bacterial infection"
                  value={rxForm.indication} onChange={e => setRxForm(prev => ({ ...prev, indication: e.target.value }))} />
                {indicationSuggestions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--muted)', marginRight: 2 }}>Suggestions:</span>
                    {indicationSuggestions.map((ind, i) => (
                      <button key={i} style={{ padding: '1px 8px', borderRadius: 99, fontSize: 10, border: '1px solid var(--accent-dim)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer' }}
                        onMouseDown={() => setRxForm(prev => ({ ...prev, indication: ind }))}>
                        {ind}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="field-col">
                <span className="field-lbl">Instructions</span>
                <textarea className="field-ta" rows={2} placeholder="e.g. Take after meals, avoid alcohol..."
                  value={rxForm.instructions} onChange={e => setRxForm(prev => ({ ...prev, instructions: e.target.value }))} />
              </div>

              {/* Prescriber Notes */}
              <div className="field-col">
                <span className="field-lbl">Prescriber Notes</span>
                <textarea className="field-ta" rows={1} placeholder="Internal notes (not shown on prescription)..."
                  value={rxForm.prescriberNotes} onChange={e => setRxForm(prev => ({ ...prev, prescriberNotes: e.target.value }))} />
              </div>

              {/* Chronic + Weight calc row */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                  <input type="checkbox" checked={rxForm.isChronic}
                    onChange={e => setRxForm(prev => ({ ...prev, isChronic: e.target.checked, refills: e.target.checked ? prev.refills : 0 }))} />
                  Chronic / Long-term
                </label>
                {selectedDrug && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                    <input type="checkbox" checked={showWeightCalc}
                      onChange={e => setShowWeightCalc(e.target.checked)} />
                    ⚖️ Weight-based dose
                  </label>
                )}
              </div>

              {/* Weight-based dosing */}
              {showWeightCalc && selectedDrug && (
                <div style={{ padding: 10, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>⚖️ Weight-Based Dose Calculator</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="field-col" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 120 }}>
                      <span className="field-lbl" style={{ whiteSpace: 'nowrap' }}>Weight (kg):</span>
                      <input className="field-inp" style={{ width: 80 }} type="number" min={1} step={0.1} value={weightInput}
                        onChange={e => setWeightInput(e.target.value)} />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer' }}>
                      <input type="checkbox" checked={isPediatric} onChange={e => setIsPediatric(e.target.checked)} />
                      Pediatric
                    </label>
                    <button className="btn-sm-accent" style={{ fontSize: 11 }} onClick={handleCalcWeightDose}>Calculate</button>
                  </div>
                  {calculatedDose && (
                    <div style={{ padding: '6px 10px', borderRadius: 6, background: '#f0fdf4', border: '1px solid #86efac', fontSize: 12, fontWeight: 700, color: '#166534' }}>
                      Calculated Dose: {calculatedDose} for {weightInput} kg
                    </div>
                  )}
                  {/* Show dosing adjustments */}
                  {selectedDrug.dosing.renalAdjustment && (
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}><b>Renal:</b> {selectedDrug.dosing.renalAdjustment}</div>
                  )}
                  {selectedDrug.dosing.hepaticAdjustment && (
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}><b>Hepatic:</b> {selectedDrug.dosing.hepaticAdjustment}</div>
                  )}
                  {selectedDrug.dosing.elderlyAdjustment && (
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}><b>Elderly:</b> {selectedDrug.dosing.elderlyAdjustment}</div>
                  )}
                  {selectedDrug.dosing.pediatric && selectedDrug.dosing.pediatric.length > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      <b>Pediatric dosing:</b> {selectedDrug.dosing.pediatric.map((d, i) => (
                        <span key={i}>{d.dose} {d.frequency}{i < selectedDrug.dosing.pediatric!.length - 1 ? ' | ' : ''}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Patient Info for Contraindications ── */}
              <div style={{ borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}
                  onClick={() => setShowPatientInfo(!showPatientInfo)}>
                  <span style={{ fontWeight: 600 }}>🩺 Patient Conditions & Allergies</span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>{showPatientInfo ? '▲' : '▼'}</span>
                </div>
                {showPatientInfo && (
                  <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    <div className="field-col">
                      <span className="field-lbl">Conditions (comma separated)</span>
                      <input className="field-inp" placeholder="e.g. Asthma, Renal impairment, Diabetes"
                        value={conditionsInput} onChange={e => setConditionsInput(e.target.value)} />
                    </div>
                    <div className="field-col">
                      <span className="field-lbl">Allergies (comma separated)</span>
                      <input className="field-inp" placeholder="e.g. Sulfa, Penicillin, NSAIDs"
                        value={allergiesInput} onChange={e => setAllergiesInput(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11 }}>
                        <input type="checkbox" checked={isPregnant} onChange={e => setIsPregnant(e.target.checked)} />
                        Pregnant
                      </label>
                      <div className="field-col" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <span className="field-lbl" style={{ whiteSpace: 'nowrap' }}>eGFR:</span>
                        <input className="field-inp" style={{ width: 80 }} placeholder="e.g. 60" value={eGFRInput}
                          onChange={e => setEGFRInput(e.target.value)} />
                      </div>
                    </div>
                    <button className="btn-sm-accent" style={{ fontSize: 11, alignSelf: 'flex-start' }}
                      onClick={() => selectedDrug && runInteractionAndContraindicationChecks(selectedDrug)}>
                      Re-check Contraindications
                    </button>
                  </div>
                )}
              </div>

              {/* Save button */}
              <button className="btn-accent" onClick={handleSaveMedication} disabled={saving || !rxForm.medication.trim() || !rxForm.dosage.trim()}>
                {saving ? 'Saving...' : '💾 Prescribe Medication'}
              </button>
            </div>
          )}

          {/* Medications list */}
          {medications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 13 }}>No medications prescribed.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {medications.map(med => (
                <div key={med.id} style={{
                  padding: compact ? 8 : 10, borderRadius: 10,
                  background: 'var(--bg)', border: med.status === 'active' ? '1px solid #10b98140' : '1px solid var(--border)',
                  opacity: med.status === 'stopped' ? 0.6 : 1,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>
                        💊 {med.medication} <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{med.dosage}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                        {med.frequency} · {med.route} · {med.duration} {med.durationUnit}
                        {med.isChronic && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 99, background: '#f59e0b20', color: '#f59e0b', fontSize: 10, fontWeight: 700 }}>Chronic</span>}
                      </div>
                      {med.instructions && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, fontStyle: 'italic' }}>{med.instructions}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: med.status === 'active' ? '#10b98120' : '#ef444420', color: med.status === 'active' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                        {med.status}
                      </span>
                      {med.status === 'active' && (
                        <button className="btn-end" style={{ fontSize: 10, padding: '3px 6px' }}
                          onClick={() => med.id && handleStopMedication(med.id, med.medication)}>
                          Stop
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                    <span>Started: {fmtDate(med.createdAt)}</span>
                    {med.indication && <span>· Indication: {med.indication}</span>}
                    {med.refills > 0 && <span>· Refills: {med.refillsUsed}/{med.refills}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'labs' && (
        <>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-sm-accent" onClick={() => { setShowForm(showForm === 'lab' ? false : 'lab'); }}>
              {showForm === 'lab' ? '✕ Close' : '🔬 Order Lab Test'}
            </button>
          </div>

          {showForm === 'lab' && (
            <div style={{ padding: 16, borderRadius: 14, border: '2px solid var(--accent-dim)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="field-col" style={{ position: 'relative' }}>
                <span className="field-lbl">Test Name *</span>
                <input className="field-inp" placeholder="Search or type test name..."
                  value={labForm.testName}
                  onFocus={() => setShowLabSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLabSuggestions(false), 200)}
                  onChange={e => setLabForm(prev => ({ ...prev, testName: e.target.value }))} />
                {showLabSuggestions && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, maxHeight: 200, overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                    {COMMON_LABS.filter(l => l.name.toLowerCase().includes(labForm.testName.toLowerCase())).map(l => (
                      <div key={l.name} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background .12s' }}
                        onMouseDown={() => { setLabForm(prev => ({ ...prev, testName: l.name, category: l.category })); setShowLabSuggestions(false); }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        {LAB_CATEGORIES.find(c => c.value === l.category)?.label.split(' ')[0]} {l.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-grid-2">
                <div className="field-col">
                  <span className="field-lbl">Category</span>
                  <select className="field-inp" value={labForm.category} onChange={e => setLabForm(prev => ({ ...prev, category: e.target.value as LabCategory }))}>
                    {LAB_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="field-col">
                  <span className="field-lbl">Priority</span>
                  <select className="field-inp" value={labForm.priority} onChange={e => setLabForm(prev => ({ ...prev, priority: e.target.value as OrderPriority }))}>
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                  </select>
                </div>
              </div>
              <div className="field-col">
                <span className="field-lbl">Clinical Question</span>
                <input className="field-inp" placeholder="e.g. Rule out sepsis, monitor renal function..."
                  value={labForm.clinicalQuestion} onChange={e => setLabForm(prev => ({ ...prev, clinicalQuestion: e.target.value }))} />
              </div>
              <button className="btn-accent" onClick={handleSaveLab} disabled={saving || !labForm.testName.trim()}>
                {saving ? 'Saving...' : '🔬 Order Lab Test'}
              </button>
            </div>
          )}

          {labOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 13 }}>No lab orders.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {labOrders.map(order => (
                <div key={order.id} style={{ padding: compact ? 8 : 10, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>🔬 {order.testName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                        {LAB_CATEGORIES.find(c => c.value === order.category)?.label.split(' ').slice(1).join(' ') || order.category}
                        {order.clinicalQuestion && <span style={{ fontStyle: 'italic', marginLeft: 6 }}>· {order.clinicalQuestion}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: prioColor(order.priority), fontWeight: 700 }}>{order.priority}</span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: `${statusColor(order.status)}20`, color: statusColor(order.status), fontWeight: 700 }}>{order.status}</span>
                      {order.status === 'ordered' && (
                        <select className="field-inp" style={{ width: 80, fontSize: 10, padding: '3px 6px' }}
                          value={order.status} onChange={e => order.id && updateOrderStatus('labOrders', order.id, e.target.value as OrderStatus)}>
                          <option value="ordered">Ordered</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                    Ordered: {fmtDate(order.orderedAt)} · {order.doctorName}
                    {order.result && <span style={{ color: 'var(--accent)', fontWeight: 700 }}> · Result: {order.result}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'imaging' && (
        <>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-sm-accent" onClick={() => { setShowForm(showForm === 'img' ? false : 'img'); }}>
              {showForm === 'img' ? '✕ Close' : '🩻 Order Imaging'}
            </button>
          </div>

          {showForm === 'img' && (
            <div style={{ padding: 16, borderRadius: 14, border: '2px solid var(--accent-dim)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="field-col" style={{ position: 'relative' }}>
                <span className="field-lbl">Study Name *</span>
                <input className="field-inp" placeholder="Search or type study name..."
                  value={imgForm.studyName}
                  onFocus={() => setShowImgSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowImgSuggestions(false), 200)}
                  onChange={e => setImgForm(prev => ({ ...prev, studyName: e.target.value }))} />
                {showImgSuggestions && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, maxHeight: 200, overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                    {COMMON_IMAGING.filter(s => s.name.toLowerCase().includes(imgForm.studyName.toLowerCase())).map(s => (
                      <div key={s.name} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background .12s' }}
                        onMouseDown={() => { setImgForm(prev => ({ ...prev, studyName: s.name, modality: s.modality })); setShowImgSuggestions(false); }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        🩻 {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-grid-2">
                <div className="field-col">
                  <span className="field-lbl">Modality</span>
                  <select className="field-inp" value={imgForm.modality} onChange={e => setImgForm(prev => ({ ...prev, modality: e.target.value as ImagingModality }))}>
                    <option value="xray">X-ray</option>
                    <option value="ct">CT</option>
                    <option value="mri">MRI</option>
                    <option value="ultrasound">Ultrasound</option>
                    <option value="echo">ECHO</option>
                    <option value="ecg">ECG</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="field-col">
                  <span className="field-lbl">Priority</span>
                  <select className="field-inp" value={imgForm.priority} onChange={e => setImgForm(prev => ({ ...prev, priority: e.target.value as OrderPriority }))}>
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="field-col">
                  <span className="field-lbl">Body Part</span>
                  <input className="field-inp" placeholder="e.g. Chest, Head, Abdomen"
                    value={imgForm.bodyPart} onChange={e => setImgForm(prev => ({ ...prev, bodyPart: e.target.value }))} />
                </div>
                <div className="field-col">
                  <span className="field-lbl">Clinical Question</span>
                  <input className="field-inp" placeholder="e.g. Rule out pneumonia, fracture..."
                    value={imgForm.clinicalQuestion} onChange={e => setImgForm(prev => ({ ...prev, clinicalQuestion: e.target.value }))} />
                </div>
              </div>
              <button className="btn-accent" onClick={handleSaveImaging} disabled={saving || !imgForm.studyName.trim()}>
                {saving ? 'Saving...' : '🩻 Order Imaging Study'}
              </button>
            </div>
          )}

          {imagingOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 13 }}>No imaging orders.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {imagingOrders.map(order => (
                <div key={order.id} style={{ padding: compact ? 8 : 10, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>🩻 {order.studyName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                        {order.modality.toUpperCase()}{order.bodyPart ? ` · ${order.bodyPart}` : ''}
                        {order.clinicalQuestion && <span style={{ fontStyle: 'italic', marginLeft: 6 }}>· {order.clinicalQuestion}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: prioColor(order.priority), fontWeight: 700 }}>{order.priority}</span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: `${statusColor(order.status)}20`, color: statusColor(order.status), fontWeight: 700 }}>{order.status}</span>
                      {order.status === 'ordered' && (
                        <select className="field-inp" style={{ width: 80, fontSize: 10, padding: '3px 6px' }}
                          value={order.status} onChange={e => order.id && updateOrderStatus('imagingOrders', order.id, e.target.value as OrderStatus)}>
                          <option value="ordered">Ordered</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                    Ordered: {fmtDate(order.orderedAt)} · {order.doctorName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
