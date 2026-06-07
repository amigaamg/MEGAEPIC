'use client';
import React, { useState, useMemo } from 'react';
import { generateHPI, type SymptomSelection, type HpiGenerationInput } from '@/engine/note-generator/surgery/hpi-generator';
import { generateClerkingNote } from '@/engine/note-generator/surgery/clerking';
import { MedicalDocument } from '@/src/components/shared/MedicalDocument';

interface FullClerkingPhaseProps {
  patientName: string;
  patientId: string;
  unitSlug: string;
  onSave: (data: ClerkingData) => Promise<void>;
  onComplete: () => void;
  consultant?: string;
}

interface ClerkingData {
  biodata: any;
  surgicalComplaint: any;
  hpiText: string;
  pmh: any;
  ros: ReviewOfSystems;
  vitalsExam: any;
  imaging: any[];
  differentials: any[];
  operativePlan: any;
  postOpPlan: any;
  completedPhases: string[];
}

interface Biodata {
  name: string;
  mrn: string;
  age: string;
  gender: string;
  dob: string;
  occupation: string;
  phone: string;
  address: string;
  nextOfKinName: string;
  nextOfKinRelation: string;
  nextOfKinPhone: string;
  referringFacility: string;
  admissionDate: string;
  ward: string;
  bed: string;
}

interface SurgicalComplaint {
  mainSymptom: string;
  duration: string;
  onset: 'sudden' | 'gradual';
  painSite: string;
  painRadiation: string;
  painCharacter: string;
  painSeverity: number;
  associatedSymptoms: string[];
  otherSymptom: string;
  previousSimilar: 'yes' | 'no' | '';
  worseFactors: string;
  betterFactors: string;
  delayReason: string;
}

interface PMH {
  conditions: string[];
  otherCondition: string;
  pastSurgicalHistory: string;
  drugHistory: string;
  allergies: string;
  smoking: 'never' | 'current' | 'ex';
  alcohol: 'none' | 'social' | 'daily';
  alcoholUnits: string;
  familyHistory: string;
  diet: string;
  livingSituation: string;
  tbContact: 'yes' | 'no' | '';
  travelHistory: string;
}

interface ReviewOfSystems {
  general: string[];
  cvs: string[];
  resp: string[];
  gi: string[];
  gu: string[];
  cns: string[];
  msk: string[];
  endocrine: string[];
  heme: string[];
  psych: string[];
}

interface VitalsExam {
  hr: string;
  bp: string;
  temp: string;
  rr: string;
  spo2: string;
  rbs: string;
  painScore: string;
  inspection: string;
  auscultation: string;
  palpation: string;
  percussion: string;
  herniaNormal: boolean;
  herniaReducible: boolean;
  herniaIrreducible: boolean;
  dreNormal: boolean;
  dreMass: boolean;
  dreBlood: boolean;
  dreTenderness: boolean;
  cvs: string;
  resp: string;
  cns: string;
  msk: string;
}

interface ImagingStudy {
  type: string;
  findings: string;
}

interface Differential {
  name: string;
}

interface OperativePlan {
  indication: string;
  procedure: string;
  asa: string;
  consentObtained: 'yes' | 'no';
  preOps: string[];
  otherPreOp: string;
  surgeon: string;
  assistant: string;
  incision: string;
  expectedDuration: string;
  specialEquipment: string;
}

interface PostOpPlan {
  immediateSettings: string[];
  analgesia: string;
  antibiotics: string;
  dvtProphylaxis: string;
  diet: string;
  mobilization: string;
  woundCare: string;
  drains: string;
  expectedStay: string;
  followUp: string;
}

const INITIAL_BIODATA: Biodata = {
  name: '', mrn: '', age: '', gender: '', dob: '',
  occupation: '', phone: '', address: '', nextOfKinName: '',
  nextOfKinRelation: '', nextOfKinPhone: '', referringFacility: '',
  admissionDate: '', ward: '', bed: '',
};

const INITIAL_COMPLAINT: SurgicalComplaint = {
  mainSymptom: '', duration: '', onset: 'gradual',
  painSite: '', painRadiation: '', painCharacter: '',
  painSeverity: 5, associatedSymptoms: [], otherSymptom: '',
  previousSimilar: '', worseFactors: '', betterFactors: '', delayReason: '',
};

const INITIAL_PMH: PMH = {
  conditions: [], otherCondition: '', pastSurgicalHistory: '',
  drugHistory: '', allergies: '', smoking: 'never',
  alcohol: 'none', alcoholUnits: '', familyHistory: '',
  diet: '', livingSituation: '', tbContact: '', travelHistory: '',
};

const INITIAL_ROS: ReviewOfSystems = {
  general: [], cvs: [], resp: [], gi: [], gu: [], cns: [], msk: [], endocrine: [], heme: [], psych: [],
};

const INITIAL_VITALS: VitalsExam = {
  hr: '', bp: '', temp: '', rr: '', spo2: '', rbs: '',
  painScore: '', inspection: '', auscultation: '', palpation: '',
  percussion: '', herniaNormal: false, herniaReducible: false,
  herniaIrreducible: false, dreNormal: false, dreMass: false,
  dreBlood: false, dreTenderness: false, cvs: '', resp: '', cns: '', msk: '',
};

const ASSOCIATED_SYMPTOMS = ['Nausea/Vomiting', 'Fever', 'Constipation', 'Diarrhea', 'Weight Loss', 'Bleeding'];
const PMH_CONDITIONS = ['Hypertension', 'Diabetes', 'Asthma/COPD', 'TB', 'HIV', 'Heart Disease', 'Stroke', 'DVT/PE', 'Cancer'];
const PRE_OPS = ['NBM', 'IV fluids', 'Blood cross-match', 'Antibiotics', 'DVT prophylaxis', 'NG tube', 'Urinary catheter'];
const IMMEDIATE_SETTINGS = ['ICU/HDU', 'Ward', 'Recovery room', 'IV fluids', 'Oxygen', 'Monitor vitals 2 hrly', 'NG on free drainage', 'Catheter to UD bag'];
const PHASE_NAMES = ['Biodata', 'Surgical Complaint', 'HPI', 'Past Medical History', 'Review of Systems', 'Vitals & Abdominal Exam', 'Imaging', 'Differentials', 'Operative Plan', 'Post-Op Plan'];

function toSentenceCase(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function FullClerkingPhase({ patientName, patientId, unitSlug, onSave, onComplete, consultant }: FullClerkingPhaseProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [biodata, setBiodata] = useState<Biodata>(INITIAL_BIODATA);
  const [complaint, setComplaint] = useState<SurgicalComplaint>(INITIAL_COMPLAINT);
  const [hpiText, setHpiText] = useState('');
  const [hpiEdited, setHpiEdited] = useState(false);
  const [pmh, setPmh] = useState<PMH>(INITIAL_PMH);
  const [vitals, setVitals] = useState<VitalsExam>(INITIAL_VITALS);
  const [ros, setRos] = useState<ReviewOfSystems>(INITIAL_ROS);
  const [imaging, setImaging] = useState<ImagingStudy[]>([]);
  const [differentials, setDifferentials] = useState<Differential[]>([{ name: '' }, { name: '' }, { name: '' }, { name: '' }]);
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [rationale, setRationale] = useState('');
  const [opPlan, setOpPlan] = useState<OperativePlan>({
    indication: '', procedure: '', asa: '', consentObtained: 'no',
    preOps: [], otherPreOp: '', surgeon: '', assistant: '',
    incision: '', expectedDuration: '', specialEquipment: '',
  });
  const [postOpPlan, setPostOpPlan] = useState<PostOpPlan>({
    immediateSettings: [], analgesia: '', antibiotics: '',
    dvtProphylaxis: '', diet: '', mobilization: '', woundCare: '',
    drains: '', expectedStay: '', followUp: '',
  });
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [generatedNote, setGeneratedNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  const toggleAssociated = (symptom: string) => {
    setComplaint((prev) => ({
      ...prev,
      associatedSymptoms: prev.associatedSymptoms.includes(symptom)
        ? prev.associatedSymptoms.filter((s) => s !== symptom)
        : [...prev.associatedSymptoms, symptom],
    }));
  };

  const toggleCondition = (condition: string) => {
    setPmh((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter((c) => c !== condition)
        : [...prev.conditions, condition],
    }));
  };

  const togglePreOp = (item: string) => {
    setOpPlan((prev) => ({
      ...prev,
      preOps: prev.preOps.includes(item)
        ? prev.preOps.filter((i) => i !== item)
        : [...prev.preOps, item],
    }));
  };

  const toggleRosSymptom = (system: keyof ReviewOfSystems, symptom: string) => {
    setRos((prev) => ({
      ...prev,
      [system]: prev[system].includes(symptom)
        ? prev[system].filter((s) => s !== symptom)
        : [...prev[system], symptom],
    }));
  };

  const toggleImmediateSetting = (item: string) => {
    setPostOpPlan((prev) => ({
      ...prev,
      immediateSettings: prev.immediateSettings.includes(item)
        ? prev.immediateSettings.filter((i) => i !== item)
        : [...prev.immediateSettings, item],
    }));
  };

  const handleAddImaging = () => {
    setImaging((prev) => [...prev, { type: '', findings: '' }]);
  };

  const handleRemoveImaging = (index: number) => {
    setImaging((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateImaging = (index: number, field: keyof ImagingStudy, value: string) => {
    setImaging((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleUpdateDifferential = (index: number, value: string) => {
    setDifferentials((prev) => prev.map((d, i) => (i === index ? { ...d, name: value } : d)));
  };

  const generateHpiText = () => {
    const age = biodata.age ? parseInt(biodata.age) : undefined;
    const gender = biodata.gender || undefined;
    const punct = complaint.onset === 'sudden' ? 'suddently' : 'gradually';

    const symptom: SymptomSelection = {
      symptomId: 'primary',
      label: complaint.mainSymptom || 'symptom',
      selected: true,
      details: {
        site: complaint.painSite || undefined,
        onset: punct,
        duration: complaint.duration || undefined,
        character: complaint.painCharacter || undefined,
        radiation: complaint.painRadiation || undefined,
        severity: complaint.painSeverity || undefined,
        exacerbating: complaint.worseFactors || undefined,
        relieving: complaint.betterFactors || undefined,
        associatedSymptoms: complaint.associatedSymptoms.length > 0 ? complaint.associatedSymptoms : undefined,
        similarEpisodes: complaint.previousSimilar === 'yes' ? true : complaint.previousSimilar === 'no' ? false : undefined,
        progression: 'progressively worsening',
      },
      answeredQuestions: [],
    };

    const socialItems: string[] = [
      biodata.occupation ? `a ${biodata.occupation} by occupation` : undefined,
      pmh.smoking !== 'never' ? `${pmh.smoking} smoker` : undefined,
      pmh.alcohol !== 'none' ? `${pmh.alcohol} alcohol drinker${pmh.alcoholUnits ? ` (${pmh.alcoholUnits} units/week)` : ''}` : undefined,
      pmh.diet ? `on a ${pmh.diet} diet` : undefined,
      pmh.livingSituation ? `lives ${pmh.livingSituation}` : undefined,
      pmh.tbContact === 'yes' ? 'with known TB contact' : undefined,
      pmh.travelHistory ? `with recent travel history: ${pmh.travelHistory}` : undefined,
    ].filter(Boolean) as string[];

    const rosPositive: string[] = [];
    for (const [system, symptoms] of Object.entries(ros)) {
      if (symptoms.length > 0) {
        rosPositive.push(`${system}: ${symptoms.join(', ')}`);
      }
    }

    const input: HpiGenerationInput = {
      patientName: biodata.name || patientName,
      patientAge: age,
      patientGender: gender,
      presentingComplaint: complaint.mainSymptom,
      complaintDuration: complaint.duration,
      symptoms: [symptom],
      pastMedicalHistory: pmh.conditions.length > 0 ? pmh.conditions : undefined,
      pastSurgicalHistory: pmh.pastSurgicalHistory ? [pmh.pastSurgicalHistory] : undefined,
      drugHistory: pmh.drugHistory ? [pmh.drugHistory] : undefined,
      allergies: pmh.allergies ? [pmh.allergies] : undefined,
      socialHistory: socialItems.length > 0 ? socialItems : undefined,
      familyHistory: pmh.familyHistory ? [pmh.familyHistory] : undefined,
      reviewOfSystems: rosPositive.length > 0 ? rosPositive : undefined,
    };

    setHpiText(generateHPI(input));
    setHpiEdited(false);
  };

  const getClerkingData = (): ClerkingData => ({
    biodata,
    surgicalComplaint: complaint,
    hpiText: hpiEdited ? hpiText : hpiText,
    pmh,
    ros,
    vitalsExam: vitals,
    imaging,
    differentials: [{ name: primaryDiagnosis }, ...differentials.filter((d) => d.name.trim())],
    operativePlan: opPlan,
    postOpPlan,
    completedPhases,
  });

  const handleSavePhase = async () => {
    setSaving(true);
    try {
      const data = getClerkingData();
      await onSave(data);
      setCompletedPhases((prev) => {
        const phaseName = PHASE_NAMES[currentPhase];
        return prev.includes(phaseName) ? prev : [...prev, phaseName];
      });
      if (currentPhase < PHASE_NAMES.length - 1) {
        setCurrentPhase((prev) => prev + 1);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePrevious = () => {
    if (currentPhase > 0) setCurrentPhase((prev) => prev - 1);
  };

  const handleGenerateNote = () => {
    const data = getClerkingData();
    const note = generateClerkingNote({
      patientName: biodata.name || patientName,
      patientId,
      unitSlug,
      consultant: consultant || 'Dr. Consultant',
      encounterType: 'full_surgical_clerking',
      registration: {
        ward: biodata.ward,
        bed: biodata.bed,
        surgicalRisk: {
          bloodGroup: undefined,
          allergies: pmh.allergies ? [pmh.allergies] : undefined,
          anticoagulants: [],
          previousSurgery: !!pmh.pastSurgicalHistory,
        },
      },
      presentingComplaint: {
        complaint: complaint.mainSymptom,
        duration: complaint.duration,
        severity: complaint.painSeverity,
      },
      hpi: hpiText ? [{ question: 'History of Presenting Illness', answer: hpiText }] : [],
      exam: [
        { findingText: `HR: ${vitals.hr}`, present: !!vitals.hr, value: vitals.hr ? parseInt(vitals.hr) : undefined },
        { findingText: `BP: ${vitals.bp}`, present: !!vitals.bp },
        { findingText: `Temp: ${vitals.temp}°C`, present: !!vitals.temp, value: vitals.temp ? parseFloat(vitals.temp) : undefined },
        { findingText: `RR: ${vitals.rr}`, present: !!vitals.rr, value: vitals.rr ? parseInt(vitals.rr) : undefined },
        { findingText: `SpO2: ${vitals.spo2}%`, present: !!vitals.spo2, value: vitals.spo2 ? parseInt(vitals.spo2) : undefined },
        { findingText: `RBS: ${vitals.rbs}`, present: !!vitals.rbs },
        { findingText: `Pain Score: ${vitals.painScore}/10`, present: !!vitals.painScore, value: vitals.painScore ? parseInt(vitals.painScore) : undefined },
        { findingText: `Abdominal Inspection: ${vitals.inspection}`, present: !!vitals.inspection, comment: vitals.inspection },
        { findingText: `Abdominal Auscultation: ${vitals.auscultation}`, present: !!vitals.auscultation, comment: vitals.auscultation },
        { findingText: `Abdominal Palpation: ${vitals.palpation}`, present: !!vitals.palpation, comment: vitals.palpation },
        { findingText: `Abdominal Percussion: ${vitals.percussion}`, present: !!vitals.percussion, comment: vitals.percussion },
      ].filter((e) => e.present),
      ddx: [{ diseaseName: primaryDiagnosis, probability: 80 }, ...differentials.filter((d) => d.name.trim()).map((d, i) => ({ diseaseName: d.name, probability: 100 - ((i + 1) * 20) }))],
      treatment: [{ items: [opPlan.procedure, ...opPlan.preOps].filter(Boolean) }],
    });

    const fullNote = [
      note,
      '',
      '---',
      '## Operative Plan',
      `**Indication:** ${opPlan.indication}`,
      `**Procedure:** ${opPlan.procedure}`,
      `**ASA:** ${opPlan.asa}`,
      `**Consent:** ${opPlan.consentObtained === 'yes' ? 'Obtained' : 'Pending'}`,
      `**Surgeon:** ${opPlan.surgeon}`,
      `**Assistant:** ${opPlan.assistant}`,
      `**Incision:** ${opPlan.incision}`,
      `**Expected Duration:** ${opPlan.expectedDuration}`,
      opPlan.specialEquipment ? `**Special Equipment:** ${opPlan.specialEquipment}` : '',
      '',
      '## Post-Operative Plan',
      postOpPlan.immediateSettings.length > 0 ? `**Immediate:** ${postOpPlan.immediateSettings.join(', ')}` : '',
      postOpPlan.analgesia ? `**Analgesia:** ${postOpPlan.analgesia}` : '',
      postOpPlan.antibiotics ? `**Antibiotics:** ${postOpPlan.antibiotics}` : '',
      postOpPlan.dvtProphylaxis ? `**DVT Prophylaxis:** ${postOpPlan.dvtProphylaxis}` : '',
      postOpPlan.diet ? `**Diet:** ${postOpPlan.diet}` : '',
      postOpPlan.mobilization ? `**Mobilization:** ${postOpPlan.mobilization}` : '',
      postOpPlan.woundCare ? `**Wound Care:** ${postOpPlan.woundCare}` : '',
      postOpPlan.drains ? `**Drains:** ${postOpPlan.drains}` : '',
      postOpPlan.expectedStay ? `**Expected LOS:** ${postOpPlan.expectedStay} days` : '',
      postOpPlan.followUp ? `**Follow-up:** ${postOpPlan.followUp}` : '',
      '',
      '---',
      '*Generated by AMEXAN Clinical Reasoning System*',
    ].filter(Boolean).join('\n');

    setGeneratedNote(fullNote);
    setShowNote(true);
  };

  const handleCompleteAll = async () => {
    setSaving(true);
    try {
      const allPhases = [...PHASE_NAMES];
      const data = { ...getClerkingData(), completedPhases: allPhases };
      await onSave(data);
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const phaseNav = (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {PHASE_NAMES.map((name, i) => (
        <button
          key={name}
          onClick={() => setCurrentPhase(i)}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            i === currentPhase
              ? 'bg-blue-600 text-white border-blue-600'
              : completedPhases.includes(name)
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          {i + 1}. {name}
        </button>
      ))}
    </div>
  );

  const actionBar = (showPrevious: boolean, showNext: boolean, nextLabel = 'Complete & Next →') => (
    <div className="flex items-center justify-between pt-4 border-t mt-4">
      <div>
        {showPrevious && (
          <button
            onClick={handlePrevious}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Previous
          </button>
        )}
      </div>
      <div>
        {showNext && (
          <button
            onClick={handleSavePhase}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {saving ? 'Saving...' : nextLabel}
          </button>
        )}
      </div>
    </div>
  );

  const renderBiodata = () => (
    <div>
      <div className="text-sm font-semibold text-gray-800 mb-3">📋 BIODATA</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input type="text" value={biodata.name} onChange={(e) => setBiodata({ ...biodata, name: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">MRN</label>
          <input type="text" value={biodata.mrn} onChange={(e) => setBiodata({ ...biodata, mrn: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Age</label>
          <input type="text" value={biodata.age} onChange={(e) => setBiodata({ ...biodata, age: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
          <select value={biodata.gender} onChange={(e) => setBiodata({ ...biodata, gender: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm">
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">DOB</label>
          <input type="date" value={biodata.dob} onChange={(e) => setBiodata({ ...biodata, dob: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Occupation</label>
          <input type="text" value={biodata.occupation} onChange={(e) => setBiodata({ ...biodata, occupation: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
          <input type="text" value={biodata.phone} onChange={(e) => setBiodata({ ...biodata, phone: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Admission Date/Time</label>
          <input type="text" value={biodata.admissionDate} onChange={(e) => setBiodata({ ...biodata, admissionDate: e.target.value })} placeholder="e.g., 30-May-2026 14:30" className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
          <input type="text" value={biodata.address} onChange={(e) => setBiodata({ ...biodata, address: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div className="border-t pt-3 col-span-2">
          <p className="text-xs font-semibold text-gray-700 mb-2">NEXT OF KIN</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input type="text" value={biodata.nextOfKinName} onChange={(e) => setBiodata({ ...biodata, nextOfKinName: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Relation</label>
          <input type="text" value={biodata.nextOfKinRelation} onChange={(e) => setBiodata({ ...biodata, nextOfKinRelation: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
          <input type="text" value={biodata.nextOfKinPhone} onChange={(e) => setBiodata({ ...biodata, nextOfKinPhone: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Referring Facility</label>
          <input type="text" value={biodata.referringFacility} onChange={(e) => setBiodata({ ...biodata, referringFacility: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ward</label>
          <input type="text" value={biodata.ward} onChange={(e) => setBiodata({ ...biodata, ward: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bed</label>
          <input type="text" value={biodata.bed} onChange={(e) => setBiodata({ ...biodata, bed: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
      </div>
      {actionBar(false, true)}
    </div>
  );

  const renderComplaint = () => (
    <div>
      <div className="text-sm font-semibold text-gray-800 mb-3">🗣️ SURGICAL COMPLAINT</div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Main Symptom</label>
          <input type="text" value={complaint.mainSymptom} onChange={(e) => setComplaint({ ...complaint, mainSymptom: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
            <input type="text" value={complaint.duration} onChange={(e) => setComplaint({ ...complaint, duration: e.target.value })} placeholder="e.g., 3 days" className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Onset</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-sm">
                <input type="radio" name="onset" checked={complaint.onset === 'sudden'} onChange={() => setComplaint({ ...complaint, onset: 'sudden' })} /> Sudden
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input type="radio" name="onset" checked={complaint.onset === 'gradual'} onChange={() => setComplaint({ ...complaint, onset: 'gradual' })} /> Gradual
              </label>
            </div>
          </div>
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Pain (if applicable)</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Site</label>
            <input type="text" value={complaint.painSite} onChange={(e) => setComplaint({ ...complaint, painSite: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Radiation</label>
            <input type="text" value={complaint.painRadiation} onChange={(e) => setComplaint({ ...complaint, painRadiation: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Character</label>
          <div className="flex flex-wrap gap-2">
            {['Colicky', 'Burning', 'Sharp', 'Dull'].map((opt) => (
              <button
                key={opt}
                onClick={() => setComplaint({ ...complaint, painCharacter: opt.toLowerCase() })}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  complaint.painCharacter === opt.toLowerCase() ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Severity ({complaint.painSeverity}/10)</label>
          <input type="range" min={1} max={10} value={complaint.painSeverity} onChange={(e) => setComplaint({ ...complaint, painSeverity: parseInt(e.target.value) })} className="w-full" />
          <div className="flex justify-between text-xs text-gray-400"><span>Mild</span><span>Severe</span></div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Associated Symptoms</label>
          <div className="flex flex-wrap gap-2">
            {ASSOCIATED_SYMPTOMS.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleAssociated(symptom)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  complaint.associatedSymptoms.includes(symptom) ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {symptom}
              </button>
            ))}
            <div>
              <input type="text" value={complaint.otherSymptom} onChange={(e) => setComplaint({ ...complaint, otherSymptom: e.target.value })} placeholder="Other..." className="px-3 py-1 text-xs border rounded-full" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Previous similar episodes</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-sm">
              <input type="radio" name="previousSimilar" checked={complaint.previousSimilar === 'yes'} onChange={() => setComplaint({ ...complaint, previousSimilar: 'yes' })} /> Yes
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input type="radio" name="previousSimilar" checked={complaint.previousSimilar === 'no'} onChange={() => setComplaint({ ...complaint, previousSimilar: 'no' })} /> No
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">What makes it worse?</label>
            <input type="text" value={complaint.worseFactors} onChange={(e) => setComplaint({ ...complaint, worseFactors: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">What makes it better?</label>
            <input type="text" value={complaint.betterFactors} onChange={(e) => setComplaint({ ...complaint, betterFactors: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reason for delay in seeking care?</label>
          <input type="text" value={complaint.delayReason} onChange={(e) => setComplaint({ ...complaint, delayReason: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
      </div>
      {actionBar(true, true)}
    </div>
  );

  const renderHPI = () => (
    <div>
      <div className="text-sm font-semibold text-gray-800 mb-3">📝 HISTORY OF PRESENTING ILLNESS</div>
      <div className="mb-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
        ⚡ Auto-generated from Biodata & Surgical Complaint phases
      </div>
      <div className="p-4 bg-gray-50 border rounded-lg text-sm text-gray-700 leading-relaxed min-h-[100px] whitespace-pre-wrap">
        {hpiText || 'Complete Phases 1-2 and click "Generate HPI" to auto-generate the history.'}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={generateHpiText}
          className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Generate HPI
        </button>
        <button
          onClick={() => setHpiEdited(true)}
          className="px-4 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ✏️ Edit
        </button>
      </div>
      {hpiEdited && (
        <textarea
          value={hpiText}
          onChange={(e) => setHpiText(e.target.value)}
          className="w-full mt-3 px-3 py-2 border rounded-lg text-sm min-h-[120px]"
        />
      )}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">Additional History Questions</p>
        <div className="flex flex-wrap gap-2">
          {['Past admissions for similar pain', 'Recent antibiotic use', 'Travel history', 'HIV/TB status', 'COVID-19 history'].map((q) => (
            <label key={q} className="flex items-center gap-1.5 text-xs text-gray-600">
              <input type="checkbox" /> {q}
            </label>
          ))}
        </div>
      </div>
      {actionBar(true, true)}
    </div>
  );

  const renderPMH = () => (
    <div>
      <div className="text-sm font-semibold text-gray-800 mb-3">🏥 PAST MEDICAL HISTORY</div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Past Medical Conditions</label>
          <div className="flex flex-wrap gap-2">
            {PMH_CONDITIONS.map((cond) => (
              <button
                key={cond}
                onClick={() => toggleCondition(cond)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  pmh.conditions.includes(cond) ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={pmh.otherCondition}
            onChange={(e) => setPmh({ ...pmh, otherCondition: e.target.value })}
            placeholder="Other condition..."
            className="w-full px-3 py-1.5 border rounded-lg text-sm mt-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Past Surgical History</label>
          <input type="text" value={pmh.pastSurgicalHistory} onChange={(e) => setPmh({ ...pmh, pastSurgicalHistory: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Drug History</label>
          <input type="text" value={pmh.drugHistory} onChange={(e) => setPmh({ ...pmh, drugHistory: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Allergies</label>
          <input type="text" value={pmh.allergies} onChange={(e) => setPmh({ ...pmh, allergies: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Smoking</label>
            <div className="flex gap-3">
              {['never', 'current', 'ex'].map((opt) => (
                <label key={opt} className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="smoking" checked={pmh.smoking === opt} onChange={() => setPmh({ ...pmh, smoking: opt as any })} />
                  {opt === 'ex' ? 'Ex-smoker' : toSentenceCase(opt)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Alcohol</label>
            <div className="flex gap-3">
              {['none', 'social', 'daily'].map((opt) => (
                <label key={opt} className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="alcohol" checked={pmh.alcohol === opt} onChange={() => setPmh({ ...pmh, alcohol: opt as any })} />
                  {toSentenceCase(opt)}
                </label>
              ))}
            </div>
            {pmh.alcohol !== 'none' && (
              <div className="mt-1">
                <input type="text" value={pmh.alcoholUnits} onChange={(e) => setPmh({ ...pmh, alcoholUnits: e.target.value })} placeholder="Units/week" className="w-full px-3 py-1.5 border rounded-lg text-sm" />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Family History of note</label>
          <input type="text" value={pmh.familyHistory} onChange={(e) => setPmh({ ...pmh, familyHistory: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">SOCIAL HISTORY</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Occupation</label>
          <p className="text-sm text-gray-500">{biodata.occupation || '(from Biodata)'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Diet</label>
          <input type="text" value={pmh.diet} onChange={(e) => setPmh({ ...pmh, diet: e.target.value })} placeholder="e.g., high-fibre, vegetarian, low-residue" className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Living Situation</label>
          <input type="text" value={pmh.livingSituation} onChange={(e) => setPmh({ ...pmh, livingSituation: e.target.value })} placeholder="e.g., alone, with family, in a care home, rural" className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">TB Contact</label>
          <div className="flex gap-3">
            {['yes', 'no'].map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 text-sm">
                <input type="radio" name="tbContact" checked={pmh.tbContact === opt} onChange={() => setPmh({ ...pmh, tbContact: opt as any })} />
                {toSentenceCase(opt)}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Travel History</label>
          <input type="text" value={pmh.travelHistory} onChange={(e) => setPmh({ ...pmh, travelHistory: e.target.value })} placeholder="e.g., recent travel, rural/urban" className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
      </div>
      {actionBar(true, true)}
    </div>
  );

  const renderROS = () => {
    const SYSTEMS: { key: keyof ReviewOfSystems; label: string; options: string[] }[] = [
      { key: 'general', label: 'General', options: ['Fever', 'Weight loss', 'Night sweats', 'Fatigue', 'Loss of appetite'] },
      { key: 'cvs', label: 'Cardiovascular', options: ['Chest pain', 'Palpitations', 'SOB on exertion', 'Orthopnea', 'PND', 'Leg swelling', 'Claudication'] },
      { key: 'resp', label: 'Respiratory', options: ['Cough', 'Sputum', 'Hemoptysis', 'Wheeze', 'Dyspnea', 'Chest pain (pleuritic)'] },
      { key: 'gi', label: 'Gastrointestinal', options: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Dysphagia', 'Hematemesis', 'Melena', 'Hematochezia'] },
      { key: 'gu', label: 'Genitourinary', options: ['Dysuria', 'Frequency', 'Hematuria', 'Urgency', 'Nocturia', 'Vaginal discharge'] },
      { key: 'cns', label: 'Central Nervous', options: ['Headache', 'Dizziness', 'Seizures', 'Weakness', 'Numbness', 'Tremor', 'Visual changes'] },
      { key: 'msk', label: 'Musculoskeletal', options: ['Joint pain', 'Joint swelling', 'Back pain', 'Muscle weakness', 'Stiffness'] },
      { key: 'endocrine', label: 'Endocrine', options: ['Polyuria', 'Polydipsia', 'Heat intolerance', 'Cold intolerance', 'Neck swelling', 'Weight change'] },
      { key: 'heme', label: 'Haematological', options: ['Easy bruising', 'Bleeding tendency', 'Anaemia', 'Lymphadenopathy'] },
      { key: 'psych', label: 'Psychiatric', options: ['Depression', 'Anxiety', 'Sleep disturbance', 'Memory loss', 'Hallucinations'] },
    ];

    return (
      <div>
        <div className="text-sm font-semibold text-gray-800 mb-3">🔍 REVIEW OF SYSTEMS</div>
        <div className="grid grid-cols-2 gap-4">
          {SYSTEMS.map((sys) => (
            <div key={sys.key} className="p-3 border rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">{sys.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {sys.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggleRosSymptom(sys.key, opt)}
                    className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                      ros[sys.key].includes(opt) ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {actionBar(true, true)}
      </div>
    );
  };

  const renderVitals = () => (
    <div>
      <div className="text-sm font-semibold text-gray-800 mb-3">🩺 VITALS & ABDOMINAL EXAM</div>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">VITALS</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">HR</label>
            <input type="text" value={vitals.hr} onChange={(e) => setVitals({ ...vitals, hr: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">BP</label>
            <input type="text" value={vitals.bp} onChange={(e) => setVitals({ ...vitals, bp: e.target.value })} placeholder="120/80" className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Temp (°C)</label>
            <input type="text" value={vitals.temp} onChange={(e) => setVitals({ ...vitals, temp: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">RR</label>
            <input type="text" value={vitals.rr} onChange={(e) => setVitals({ ...vitals, rr: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">SpO2 (%)</label>
            <input type="text" value={vitals.spo2} onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">RBS</label>
            <input type="text" value={vitals.rbs} onChange={(e) => setVitals({ ...vitals, rbs: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Pain Score (/10)</label>
            <input type="text" value={vitals.painScore} onChange={(e) => setVitals({ ...vitals, painScore: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">ABDOMINAL EXAM</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Inspection</label>
            <input type="text" value={vitals.inspection} onChange={(e) => setVitals({ ...vitals, inspection: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Auscultation</label>
            <input type="text" value={vitals.auscultation} onChange={(e) => setVitals({ ...vitals, auscultation: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Palpation</label>
            <input type="text" value={vitals.palpation} onChange={(e) => setVitals({ ...vitals, palpation: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Percussion</label>
            <input type="text" value={vitals.percussion} onChange={(e) => setVitals({ ...vitals, percussion: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hernia Orifices</label>
            <div className="flex flex-wrap gap-2">
              {['Normal', 'Reducible', 'Irreducible'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    const key = `hernia${opt}` as 'herniaNormal' | 'herniaReducible' | 'herniaIrreducible';
                    setVitals((prev) => ({ ...prev, [key]: !prev[key] }));
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    vitals[`hernia${opt}` as keyof VitalsExam] ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">DRE</label>
            <div className="flex flex-wrap gap-2">
              {['Normal', 'Mass', 'Blood', 'Tenderness'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    const key = `dre${opt}` as 'dreNormal' | 'dreMass' | 'dreBlood' | 'dreTenderness';
                    setVitals((prev) => ({ ...prev, [key]: !prev[key] }));
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    vitals[`dre${opt}` as keyof VitalsExam] ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">SYSTEMIC REVIEW</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CVS</label>
            <input type="text" value={vitals.cvs} onChange={(e) => setVitals({ ...vitals, cvs: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Respiratory</label>
            <input type="text" value={vitals.resp} onChange={(e) => setVitals({ ...vitals, resp: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CNS</label>
            <input type="text" value={vitals.cns} onChange={(e) => setVitals({ ...vitals, cns: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">MSK</label>
            <input type="text" value={vitals.msk} onChange={(e) => setVitals({ ...vitals, msk: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
        </div>
      </div>
      {actionBar(true, true)}
    </div>
  );

  const renderImaging = () => (
    <div>
      <div className="text-sm font-semibold text-gray-800 mb-3">📡 IMAGING</div>
      <div className="space-y-3">
        {imaging.map((study, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Study #{index + 1}</span>
              <button onClick={() => handleRemoveImaging(index)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={study.type} onChange={(e) => handleUpdateImaging(index, 'type', e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-sm">
                  <option value="">Select...</option>
                  <option value="Abdominal X-ray">Abdominal X-ray</option>
                  <option value="Chest X-ray">Chest X-ray</option>
                  <option value="Abdominal USS">Abdominal USS</option>
                  <option value="CT Abdomen/Pelvis">CT Abdomen/Pelvis</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Findings</label>
                <input type="text" value={study.findings} onChange={(e) => handleUpdateImaging(index, 'findings', e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
              </div>
            </div>
          </div>
        ))}
        <button onClick={handleAddImaging} className="px-4 py-1.5 text-xs border border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors">
          + Add Imaging Study
        </button>
      </div>
      {actionBar(true, true)}
    </div>
  );

  const renderDifferentials = () => (
    <div>
      <div className="text-sm font-semibold text-gray-800 mb-3">🧠 DIFFERENTIAL DIAGNOSES</div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Primary Diagnosis</label>
          <input type="text" value={primaryDiagnosis} onChange={(e) => setPrimaryDiagnosis(e.target.value)} className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-sm font-medium" placeholder="Enter primary diagnosis..." />
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Differentials</p>
        </div>
        {differentials.map((d, i) => (
          <div key={i}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{i + 1}.</label>
            <input type="text" value={d.name} onChange={(e) => handleUpdateDifferential(i, e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-sm" placeholder={`Differential ${i + 1}`} />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Rationale</label>
          <textarea value={rationale} onChange={(e) => setRationale(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-sm min-h-[60px]" />
        </div>
      </div>
      {actionBar(true, true)}
    </div>
  );

  const renderOperativePlan = () => (
    <div>
      <div className="text-sm font-semibold text-gray-800 mb-3">🔪 OPERATIVE PLAN</div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Indication for Surgery</label>
            <input type="text" value={opPlan.indication} onChange={(e) => setOpPlan({ ...opPlan, indication: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Proposed Procedure</label>
            <input type="text" value={opPlan.procedure} onChange={(e) => setOpPlan({ ...opPlan, procedure: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Anaesthetic Risk (ASA)</label>
            <select value={opPlan.asa} onChange={(e) => setOpPlan({ ...opPlan, asa: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm">
              <option value="">Select ASA</option>
              <option value="I">I — Normal healthy</option>
              <option value="II">II — Mild systemic disease</option>
              <option value="III">III — Severe systemic disease</option>
              <option value="IV">IV — Severe life-threatening</option>
              <option value="V">V — Moribund</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Consent Obtained</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-sm">
                <input type="radio" name="consent" checked={opPlan.consentObtained === 'yes'} onChange={() => setOpPlan({ ...opPlan, consentObtained: 'yes' })} /> Yes
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input type="radio" name="consent" checked={opPlan.consentObtained === 'no'} onChange={() => setOpPlan({ ...opPlan, consentObtained: 'no' })} /> No
              </label>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Pre-op Preparations</label>
          <div className="flex flex-wrap gap-2">
            {PRE_OPS.map((item) => (
              <button
                key={item}
                onClick={() => togglePreOp(item)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  opPlan.preOps.includes(item) ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <input type="text" value={opPlan.otherPreOp} onChange={(e) => setOpPlan({ ...opPlan, otherPreOp: e.target.value })} placeholder="Other preparation..." className="w-full px-3 py-1.5 border rounded-lg text-sm mt-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Surgeon</label>
            <input type="text" value={opPlan.surgeon} onChange={(e) => setOpPlan({ ...opPlan, surgeon: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Assistant</label>
            <input type="text" value={opPlan.assistant} onChange={(e) => setOpPlan({ ...opPlan, assistant: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Planned Incision</label>
            <input type="text" value={opPlan.incision} onChange={(e) => setOpPlan({ ...opPlan, incision: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Expected Duration</label>
            <input type="text" value={opPlan.expectedDuration} onChange={(e) => setOpPlan({ ...opPlan, expectedDuration: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Special Equipment Needed</label>
          <input type="text" value={opPlan.specialEquipment} onChange={(e) => setOpPlan({ ...opPlan, specialEquipment: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
      </div>
      {actionBar(true, true)}
    </div>
  );

  const renderPostOpPlan = () => (
    <div>
      <div className="text-sm font-semibold text-gray-800 mb-3">📋 POST-OPERATIVE PLAN</div>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Immediate</p>
          <div className="flex flex-wrap gap-2">
            {IMMEDIATE_SETTINGS.map((item) => (
              <button
                key={item}
                onClick={() => toggleImmediateSetting(item)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  postOpPlan.immediateSettings.includes(item) ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Analgesia</label>
            <input type="text" value={postOpPlan.analgesia} onChange={(e) => setPostOpPlan({ ...postOpPlan, analgesia: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Antibiotics</label>
            <input type="text" value={postOpPlan.antibiotics} onChange={(e) => setPostOpPlan({ ...postOpPlan, antibiotics: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">DVT Prophylaxis</label>
            <input type="text" value={postOpPlan.dvtProphylaxis} onChange={(e) => setPostOpPlan({ ...postOpPlan, dvtProphylaxis: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Diet</label>
            <input type="text" value={postOpPlan.diet} onChange={(e) => setPostOpPlan({ ...postOpPlan, diet: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mobilization</label>
            <input type="text" value={postOpPlan.mobilization} onChange={(e) => setPostOpPlan({ ...postOpPlan, mobilization: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Wound Care</label>
            <input type="text" value={postOpPlan.woundCare} onChange={(e) => setPostOpPlan({ ...postOpPlan, woundCare: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Drains</label>
            <input type="text" value={postOpPlan.drains} onChange={(e) => setPostOpPlan({ ...postOpPlan, drains: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Expected LOS (days)</label>
            <input type="text" value={postOpPlan.expectedStay} onChange={(e) => setPostOpPlan({ ...postOpPlan, expectedStay: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Follow-up Plan</label>
          <input type="text" value={postOpPlan.followUp} onChange={(e) => setPostOpPlan({ ...postOpPlan, followUp: e.target.value })} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t mt-4">
        <div>
          <button onClick={handlePrevious} className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            ← Previous
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSavePhase}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Complete & Next →'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderGenerateNote = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-lg font-semibold text-gray-800 mb-1">All 10 Phases Complete</p>
        <p className="text-sm text-gray-500 mb-4">Generate the full surgical clerking note to review and save</p>
        <button
          onClick={handleGenerateNote}
          className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-semibold transition-colors shadow-sm"
        >
          Generate Clerking Note
        </button>
      </div>

      {showNote && (
        <MedicalDocument
          title="Full Surgical Clerking Note"
          patientName={biodata.name || patientName}
          patientId={patientId}
          unit={unitSlug}
          date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          noteText={generatedNote}
          filename={`clerking-${patientId}-${Date.now()}.pdf`}
        />
      )}

      <div className="flex justify-center pt-4 border-t">
        <button
          onClick={handleCompleteAll}
          disabled={saving || !showNote}
          className="px-10 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold transition-colors shadow-sm"
        >
          {saving ? 'Saving...' : 'Complete Clerking & Exit'}
        </button>
      </div>
    </div>
  );

  const phaseContent = useMemo(() => {
    switch (currentPhase) {
      case 0: return renderBiodata();
      case 1: return renderComplaint();
      case 2: return renderHPI();
      case 3: return renderPMH();
      case 4: return renderROS();
      case 5: return renderVitals();
      case 6: return renderImaging();
      case 7: return renderDifferentials();
      case 8: return renderOperativePlan();
      case 9: return renderPostOpPlan();
      default: return null;
    }
  }, [currentPhase, biodata, complaint, hpiText, hpiEdited, pmh, ros, vitals, imaging, differentials, primaryDiagnosis, rationale, opPlan, postOpPlan, saving, completedPhases]);

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">📋 FULL SURGICAL CLERKING</h2>
          <span className="text-xs text-gray-500">Phase {currentPhase + 1} of 10: {PHASE_NAMES[currentPhase]}</span>
        </div>
      </div>

      <div className="px-4 py-3 border-b bg-white">
        {phaseNav}
      </div>

      <div className="p-4">
        {phaseContent}
      </div>
    </div>
  );
}
