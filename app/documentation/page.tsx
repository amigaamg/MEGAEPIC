'use client';

import { useState, useCallback, useRef } from 'react';
import { createEmptyDocument, ClinicalDocument, VitalSign, ExaminationFinding, InvestigationResult, DiagnosisItem, ProblemItem, MonitoringParameter, EscalationCriteria } from '@/lib/pdf/document-types';
import { downloadPdf, openPdfInTab } from '@/lib/pdf/pdf-renderer';

const EXAM_SYSTEMS = [
  'General', 'ENT', 'Respiratory', 'Cardiovascular', 'Gastrointestinal',
  'Genitourinary', 'Musculoskeletal', 'Neurological', 'Dermatological', 'Psychiatric',
];

const ROS_SYSTEMS = [
  { id: 'constitutional', label: 'Constitutional', symptoms: ['Fever', 'Weight loss', 'Night sweats', 'Fatigue', 'Anorexia'] },
  { id: 'ent', label: 'ENT', symptoms: ['Sore throat', 'Nasal congestion', 'Hearing loss', 'Tinnitus', 'Dizziness'] },
  { id: 'respiratory', label: 'Respiratory', symptoms: ['Cough', 'Dyspnea', 'Wheeze', 'Hemoptysis', 'Sputum'] },
  { id: 'cardiovascular', label: 'Cardiovascular', symptoms: ['Chest pain', 'Palpitations', 'Orthopnea', 'PND', 'Pedal edema'] },
  { id: 'gi', label: 'Gastrointestinal', symptoms: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Dysphagia', 'Heartburn', 'Abdominal pain'] },
  { id: 'gu', label: 'Genitourinary', symptoms: ['Dysuria', 'Frequency', 'Hematuria', 'Vaginal discharge', 'Testicular pain'] },
  { id: 'msk', label: 'Musculoskeletal', symptoms: ['Joint pain', 'Joint swelling', 'Back pain', 'Myalgia', 'Weakness'] },
  { id: 'neurological', label: 'Neurological', symptoms: ['Headache', 'Seizures', 'Numbness', 'Tremor', 'Loss of consciousness'] },
  { id: 'dermatological', label: 'Dermatological', symptoms: ['Rash', 'Itching', 'Jaundice', 'Ulcers', 'Lesions'] },
  { id: 'psychiatric', label: 'Psychiatric', symptoms: ['Anxiety', 'Depression', 'Insomnia', 'Hallucinations', 'Suicidal thoughts'] },
];

const INVESTIGATION_CATEGORIES = ['Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Pathology', 'Genetics', 'Imaging', 'Other'] as const;

const MANAGEMENT_CATEGORIES = ['Immediate Actions', 'Treatments', 'Monitoring', 'Follow-Up', 'Referrals', 'Patient Education', 'Contingency Plan'] as const;

function createDefaultDocument(): ClinicalDocument {
  const doc = createEmptyDocument();
  doc.metadata.facility = 'AMEXAN Health Facility';
  doc.metadata.department = 'General Medicine';
  return doc;
}

export default function DocumentationPage() {
  const [doc, setDoc] = useState<ClinicalDocument>(createDefaultDocument);
  const [activeTab, setActiveTab] = useState<string>('history');
  const [exporting, setExporting] = useState<'pdf' | 'print' | null>(null);
  const [newVital, setNewVital] = useState({ name: '', value: '', unit: '', reference: '' });
  const [newInvestigation, setNewInvestigation] = useState({ name: '', result: '', interpretation: '', category: 'Other' as string });
  const [newDifferential, setNewDifferential] = useState({ diseaseId: '', diseaseName: '', icd10: '', probability: 'moderate' as 'high' | 'moderate' | 'low' | 'considered', score: 3 });
  const [newProblem, setNewProblem] = useState({ description: '', active: true, chronic: false });
  const [newPlanItem, setNewPlanItem] = useState({ text: '', category: 'immediateActions' as string });
  const [newMonitoringParam, setNewMonitoringParam] = useState({ parameter: '', frequency: '', target: '' });
  const [newEscalation, setNewEscalation] = useState({ condition: '', action: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const updateDoc = useCallback((updater: (prev: ClinicalDocument) => ClinicalDocument) => {
    setDoc(prev => updater(prev));
  }, []);

  const handleExportPdf = useCallback(async () => {
    setExporting('pdf');
    try {
      const finalDoc = { ...doc };
      finalDoc.metadata.generatedAt = Date.now();
      await downloadPdf(finalDoc, 'clinical-document-' + Date.now() + '.pdf');
    } finally {
      setExporting(null);
    }
  }, [doc]);

  const handlePrint = useCallback(async () => {
    setExporting('print');
    try {
      const finalDoc = { ...doc };
      finalDoc.metadata.generatedAt = Date.now();
      await openPdfInTab(finalDoc);
    } finally {
      setExporting(null);
    }
  }, [doc]);

  const clearAll = useCallback(() => {
    setDoc(createDefaultDocument());
  }, []);

  const sections: Record<string, { label: string; icon: string }> = {
    history: { label: 'History', icon: '📋' },
    ros: { label: 'Review of Systems', icon: '🔍' },
    exam: { label: 'Examination', icon: '🩺' },
    investigations: { label: 'Investigations', icon: '🧪' },
    differentials: { label: 'Differential Dx', icon: '🎯' },
    plan: { label: 'Management Plan', icon: '📋' },
    preview: { label: 'Preview & Export', icon: '📄' },
  };

  const tabKeys = Object.keys(sections);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f4f8',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        @media print { .no-print { display: none !important; } }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr !important; } .tab-labels { overflow-x: auto; } }
        .form-section { animation: fadeIn 0.25s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #0a9396 !important; box-shadow: 0 0 0 2px rgba(10,147,150,0.15); }
      `}</style>

      {/* Header */}
      <header className="no-print" style={{
        background: 'linear-gradient(135deg, #005f73 0%, #0a9396 100%)',
        padding: 'clamp(12px, 2vw, 20px)',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(16px, 2.5vw, 24px)', fontWeight: 700 }}>AMEXAN Clinical Documentation</h1>
          <p style={{ margin: '2px 0 0', fontSize: 'clamp(11px, 1.2vw, 13px)', opacity: 0.8 }}>
            Universal Clinical Record — History | Examination | Investigations | Management
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={clearAll} style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.4)',
            background: 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer',
          }}>Clear All</button>
          <button onClick={handleExportPdf} disabled={exporting === 'pdf'}
            style={{
              padding: '8px 18px', borderRadius: 6, border: 'none',
              background: '#fff', color: '#005f73', fontWeight: 600,
              fontSize: 13, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.6 : 1,
            }}>
            {exporting === 'pdf' ? 'Generating...' : '⬇ Download PDF'}
          </button>
          <button onClick={handlePrint} disabled={exporting === 'print'}
            style={{
              padding: '8px 18px', borderRadius: 6, border: '2px solid #fff',
              background: 'transparent', color: '#fff', fontWeight: 600,
              fontSize: 13, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.6 : 1,
            }}>
            {exporting === 'print' ? 'Opening...' : '🖨 Open PDF'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        {/* Tabs */}
        <div className="tab-labels no-print" style={{
          display: 'flex', background: '#fff', borderBottom: '1px solid #e8edf0',
          padding: '0 16px', overflowX: 'auto',
        }}>
          {tabKeys.map(key => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{
                padding: '12px 16px', border: 'none', background: 'transparent',
                borderBottom: activeTab === key ? '3px solid #005f73' : '3px solid transparent',
                color: activeTab === key ? '#005f73' : '#7f8c8d',
                fontWeight: activeTab === key ? 600 : 400, fontSize: 13,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}>
              {sections[key].icon} {sections[key].label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 'clamp(12px, 2vw, 24px)', overflowY: 'auto' }}>
          {/* ── HISTORY TAB ── */}
          {activeTab === 'history' && (
            <div className="form-section">
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Patient Info */}
                <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>Patient Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                      <input placeholder="Full Name" value={doc.patient.name}
                        onChange={e => updateDoc(d => { d.patient.name = e.target.value; return d; })}
                        style={inputStyle} />
                      <input placeholder="Age" type="number" value={doc.patient.age || ''}
                        onChange={e => updateDoc(d => { d.patient.age = parseInt(e.target.value) || 0; return d; })}
                        style={inputStyle} />
                      <select value={doc.patient.gender}
                        onChange={e => updateDoc(d => { d.patient.gender = e.target.value; return d; })}
                        style={inputStyle}>
                        <option value="">Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <input placeholder="MRN / Patient ID" value={doc.patient.mrn}
                      onChange={e => updateDoc(d => { d.patient.mrn = e.target.value; return d; })}
                      style={inputStyle} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input placeholder="Weight (kg)" value={doc.patient.weight || ''}
                        onChange={e => updateDoc(d => { d.patient.weight = e.target.value; return d; })}
                        style={inputStyle} />
                      <input placeholder="Height (cm)" value={doc.patient.height || ''}
                        onChange={e => updateDoc(d => { d.patient.height = e.target.value; return d; })}
                        style={inputStyle} />
                    </div>
                  </div>
                </div>

                {/* Encounter Info */}
                <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>Encounter Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input type="date" value={doc.encounter.date}
                        onChange={e => updateDoc(d => { d.encounter.date = e.target.value; return d; })}
                        style={inputStyle} />
                      <input type="time" value={doc.encounter.time}
                        onChange={e => updateDoc(d => { d.encounter.time = e.target.value; return d; })}
                        style={inputStyle} />
                    </div>
                    <input placeholder="Location / Facility" value={doc.encounter.location}
                      onChange={e => updateDoc(d => { d.encounter.location = e.target.value; return d; })}
                      style={inputStyle} />
                    <select value={doc.encounter.encounterType}
                      onChange={e => updateDoc(d => { d.encounter.encounterType = e.target.value; return d; })}
                      style={inputStyle}>
                      <option value="">Encounter Type</option>
                      <option value="Outpatient">Outpatient</option>
                      <option value="Inpatient">Inpatient</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Consultation">Consultation</option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                    <input placeholder="Referring Clinician" value={doc.encounter.referringClinician || ''}
                      onChange={e => updateDoc(d => { d.encounter.referringClinician = e.target.value; return d; })}
                      style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Chief Complaint + HPI */}
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>Chief Complaint & History of Presenting Illness</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                    <input placeholder="Chief Complaint (e.g., Cough, Chest Pain, Fever)" value={doc.subjective.chiefComplaint}
                      onChange={e => updateDoc(d => { d.subjective.chiefComplaint = e.target.value; d.encounter.chiefComplaint = e.target.value; return d; })}
                      style={{ ...inputStyle, fontWeight: 600 }} />
                    <input placeholder="Duration (e.g., 3 weeks)" value={doc.encounter.duration}
                      onChange={e => updateDoc(d => { d.encounter.duration = e.target.value; return d; })}
                      style={inputStyle} />
                    <input placeholder="Onset (e.g., gradual/sudden)" value={doc.encounter.onset}
                      onChange={e => updateDoc(d => { d.encounter.onset = e.target.value; return d; })}
                      style={inputStyle} />
                  </div>
                  <textarea placeholder="Full history of presenting illness — onset, progression, associated symptoms, severity, modifying factors, previous episodes, treatments tried..."
                    value={doc.subjective.historyOfPresentingIllness}
                    onChange={e => updateDoc(d => { d.subjective.historyOfPresentingIllness = e.target.value; return d; })}
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'Inter, sans-serif' }} />
                </div>
              </div>

              {/* Past History Sections */}
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                <SectionCard title="Past Medical History">
                  <TagInput tags={doc.patient.pastMedicalHistory}
                    onAdd={t => updateDoc(d => { d.patient.pastMedicalHistory = [...d.patient.pastMedicalHistory, t]; return d; })}
                    onRemove={i => updateDoc(d => { d.patient.pastMedicalHistory = d.patient.pastMedicalHistory.filter((_, idx) => idx !== i); return d; })}
                    placeholder="e.g., Hypertension, Diabetes" />
                  <label style={labelStyle}>Additional PMH Notes</label>
                  <textarea placeholder="Surgeries, hospitalizations, obstetrics..."
                    value={doc.subjective.pastMedicalHistory || ''}
                    onChange={e => updateDoc(d => { d.subjective.pastMedicalHistory = e.target.value; return d; })}
                    rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </SectionCard>

                <SectionCard title="Drug History & Allergies">
                  <label style={labelStyle}>Allergies</label>
                  <TagInput tags={doc.patient.allergies}
                    onAdd={t => updateDoc(d => { d.patient.allergies = [...d.patient.allergies, t]; return d; })}
                    onRemove={i => updateDoc(d => { d.patient.allergies = d.patient.allergies.filter((_, idx) => idx !== i); return d; })}
                    placeholder="e.g., Penicillin, NSAIDs" />
                  <label style={labelStyle}>Active Medications</label>
                  <TagInput tags={doc.patient.activeMedications}
                    onAdd={t => updateDoc(d => { d.patient.activeMedications = [...d.patient.activeMedications, t]; return d; })}
                    onRemove={i => updateDoc(d => { d.patient.activeMedications = d.patient.activeMedications.filter((_, idx) => idx !== i); return d; })}
                    placeholder="e.g., Amlodipine 5mg" />
                </SectionCard>

                <SectionCard title="Social & Family History">
                  <textarea placeholder="Smoking (pack-years), Alcohol, Occupation, Living situation, Family diseases (DM, HTN, Cancer, TB)..."
                    value={doc.subjective.socialHistory || ''}
                    onChange={e => updateDoc(d => { d.subjective.socialHistory = e.target.value; return d; })}
                    rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                </SectionCard>

                <SectionCard title="Travel & Occupational History">
                  <textarea placeholder="Recent travel, TB exposure, occupational hazards, mining, farming, construction, healthcare..."
                    value={doc.subjective.travelHistory || ''}
                    onChange={e => updateDoc(d => { d.subjective.travelHistory = e.target.value; return d; })}
                    rows={2} style={{ ...inputStyle, resize: 'vertical', marginBottom: 8 }} />
                  <textarea placeholder="Workplace exposures, chemicals, dust, safety equipment..."
                    value={doc.subjective.occupationalHistory || ''}
                    onChange={e => updateDoc(d => { d.subjective.occupationalHistory = e.target.value; return d; })}
                    rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </SectionCard>
              </div>
            </div>
          )}

          {/* ── ROS TAB ── */}
          {activeTab === 'ros' && (
            <div className="form-section">
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {ROS_SYSTEMS.map(sys => (
                  <div key={sys.id} style={{ background: '#fff', borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#005f73', fontWeight: 600 }}>{sys.label}</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {sys.symptoms.map(symptom => {
                        const existing = doc.subjective.symptomReview.find(s => s.symptom === symptom);
                        const present = existing?.present || false;
                        return (
                          <button key={symptom} onClick={() => {
                            updateDoc(d => {
                              const idx = d.subjective.symptomReview.findIndex(s => s.symptom === symptom);
                              if (idx >= 0) {
                                if (present) d.subjective.symptomReview.splice(idx, 1);
                                else d.subjective.symptomReview[idx].present = true;
                              } else {
                                d.subjective.symptomReview.push({ symptom, present: true });
                              }
                              return d;
                            });
                          }}
                            style={{
                              padding: '3px 10px', borderRadius: 12, border: present ? '1.5px solid #0a9396' : '1px solid #dce4e8',
                              background: present ? '#e6f7f7' : '#fff', cursor: 'pointer',
                              fontSize: 11, color: present ? '#0a9396' : '#5a6a7a', fontWeight: present ? 600 : 400,
                            }}>
                            {present ? '✓ ' : ''}{symptom}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EXAM TAB ── */}
          {activeTab === 'exam' && (
            <div className="form-section">
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>Vital Signs</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <input placeholder="BP" value={doc.objective.vitalSigns.find(v => v.name === 'BP')?.value || ''}
                    onChange={e => upsertVital(doc, updateDoc, 'BP', e.target.value, 'mmHg')}
                    style={{ ...inputStyle, width: 80 }} />
                  <input placeholder="HR" value={doc.objective.vitalSigns.find(v => v.name === 'HR')?.value || ''}
                    onChange={e => upsertVital(doc, updateDoc, 'HR', e.target.value, 'bpm')}
                    style={{ ...inputStyle, width: 80 }} />
                  <input placeholder="RR" value={doc.objective.vitalSigns.find(v => v.name === 'RR')?.value || ''}
                    onChange={e => upsertVital(doc, updateDoc, 'RR', e.target.value, '/min')}
                    style={{ ...inputStyle, width: 80 }} />
                  <input placeholder="Temp" value={doc.objective.vitalSigns.find(v => v.name === 'Temp')?.value || ''}
                    onChange={e => upsertVital(doc, updateDoc, 'Temp', e.target.value, '°C')}
                    style={{ ...inputStyle, width: 80 }} />
                  <input placeholder="SpO2" value={doc.objective.vitalSigns.find(v => v.name === 'SpO2')?.value || ''}
                    onChange={e => upsertVital(doc, updateDoc, 'SpO2', e.target.value, '%')}
                    style={{ ...inputStyle, width: 80 }} />
                  <input placeholder="GCS" value={doc.objective.vitalSigns.find(v => v.name === 'GCS')?.value || ''}
                    onChange={e => upsertVital(doc, updateDoc, 'GCS', e.target.value, '/15')}
                    style={{ ...inputStyle, width: 80 }} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input placeholder="New vital name" value={newVital.name}
                    onChange={e => setNewVital(p => ({ ...p, name: e.target.value }))}
                    style={{ ...inputStyle, width: 120 }} />
                  <input placeholder="Value" value={newVital.value}
                    onChange={e => setNewVital(p => ({ ...p, value: e.target.value }))}
                    style={{ ...inputStyle, width: 80 }} />
                  <input placeholder="Unit" value={newVital.unit}
                    onChange={e => setNewVital(p => ({ ...p, unit: e.target.value }))}
                    style={{ ...inputStyle, width: 60 }} />
                  <button onClick={() => {
                    if (newVital.name && newVital.value) {
                      upsertVital(doc, updateDoc, newVital.name, newVital.value, newVital.unit);
                      setNewVital({ name: '', value: '', unit: '', reference: '' });
                    }
                  }}
                    style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #0a9396', background: '#e6f7f7', color: '#0a9396', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    + Add Vital
                  </button>
                </div>
              </div>

              {/* Physical Exam Systems */}
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                {EXAM_SYSTEMS.map(system => {
                  const findings = doc.objective.examinationFindings.filter(f => f.system === system);
                  return (
                    <div key={system} style={{ background: '#fff', borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#005f73', fontWeight: 600 }}>{system}</h4>
                      {findings.map((f, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, fontSize: 12 }}>
                          <span style={{ color: f.normal ? '#27ae60' : '#e74c3c', fontWeight: 700 }}>{f.normal ? '✓' : '⚠'}</span>
                          <span style={{ flex: 1 }}>{f.finding}</span>
                          {f.detail && <span style={{ color: '#7f8c8d', fontSize: 11 }}>({f.detail})</span>}
                          <button onClick={() => updateDoc(d => {
                            d.objective.examinationFindings = d.objective.examinationFindings.filter((_, i) => i !== idx);
                            return d;
                          })}
                            style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer', padding: 2 }}>✕</button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        <input placeholder="Add finding..."
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const text = input.value.trim();
                              if (text) {
                                updateDoc(d => {
                                  d.objective.examinationFindings.push({
                                    system, finding: text, normal: true, detail: '',
                                  });
                                  return d;
                                });
                                input.value = '';
                              }
                            }
                          }}
                          style={{ flex: 1, padding: '5px 8px', borderRadius: 4, border: '1px solid #dce4e8', fontSize: 11 }} />
                        <select onChange={e => {
                          const val = e.target.value;
                          if (val === 'normal' || val === 'abnormal') {
                            // Need to get the last finding - actually this approach is tricky
                            // Let's just toggle the last added finding's normal status via a different approach
                          }
                        }} style={{ padding: '4px', borderRadius: 4, border: '1px solid #dce4e8', fontSize: 11 }}>
                          <option value="">Status</option>
                          <option value="normal">Normal</option>
                          <option value="abnormal">Abnormal</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* General Exam Notes */}
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>Physical Examination Summary</h3>
                <textarea placeholder="Overall physical examination narrative — general appearance, systems review summary, key findings..."
                  value={doc.objective.physicalExamination}
                  onChange={e => updateDoc(d => { d.objective.physicalExamination = e.target.value; return d; })}
                  rows={4} style={{ ...inputStyle, resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}

          {/* ── INVESTIGATIONS TAB ── */}
          {activeTab === 'investigations' && (
            <div className="form-section">
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>Investigations & Results</h3>
                {doc.objective.investigations.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12, fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f0f4f8' }}>
                        <th style={thStyle}>Investigation</th>
                        <th style={thStyle}>Result</th>
                        <th style={thStyle}>Interpretation</th>
                        <th style={thStyle}>Category</th>
                        <th style={{ ...thStyle, width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.objective.investigations.map((inv, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f0f4f8' }}>
                          <td style={tdStyle}>{inv.name}</td>
                          <td style={tdStyle}>{inv.result || 'Pending'}</td>
                          <td style={tdStyle}>{inv.interpretation || ''}</td>
                          <td style={tdStyle}>{inv.timing}</td>
                          <td style={tdStyle}>
                            <button onClick={() => updateDoc(d => {
                              d.objective.investigations = d.objective.investigations.filter((_, i) => i !== idx);
                              return d;
                            })}
                              style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 12 }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input placeholder="Investigation name" value={newInvestigation.name}
                    onChange={e => setNewInvestigation(p => ({ ...p, name: e.target.value }))}
                    style={{ ...inputStyle, width: 180 }} />
                  <input placeholder="Result / Value" value={newInvestigation.result}
                    onChange={e => setNewInvestigation(p => ({ ...p, result: e.target.value }))}
                    style={{ ...inputStyle, width: 100 }} />
                  <input placeholder="Interpretation" value={newInvestigation.interpretation}
                    onChange={e => setNewInvestigation(p => ({ ...p, interpretation: e.target.value }))}
                    style={{ ...inputStyle, width: 150 }} />
                  <select value={newInvestigation.category}
                    onChange={e => setNewInvestigation(p => ({ ...p, category: e.target.value }))}
                    style={{ ...inputStyle, width: 120 }}>
                    {INVESTIGATION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={() => {
                    if (newInvestigation.name) {
                      updateDoc(d => {
                        d.objective.investigations.push({
                          id: 'inv-' + Date.now(),
                          name: newInvestigation.name,
                          indication: '',
                          result: newInvestigation.result || undefined,
                          interpretation: newInvestigation.interpretation || undefined,
                          timing: newInvestigation.result ? 'completed' : 'pending',
                        });
                        return d;
                      });
                      setNewInvestigation({ name: '', result: '', interpretation: '', category: 'Other' });
                    }
                  }}
                    style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #0a9396', background: '#e6f7f7', color: '#0a9396', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    + Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── DIFFERENTIALS TAB ── */}
          {activeTab === 'differentials' && (
            <div className="form-section">
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>Differential Diagnosis</h3>
                {doc.differentials.topDiagnoses.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12, fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f0f4f8' }}>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Diagnosis</th>
                        <th style={thStyle}>ICD-10</th>
                        <th style={thStyle}>Probability</th>
                        <th style={{ ...thStyle, width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.differentials.topDiagnoses.map((d, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f0f4f8' }}>
                          <td style={tdStyle}>{idx + 1}</td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{d.diseaseName}</td>
                          <td style={tdStyle}>{d.icd10 || '-'}</td>
                          <td style={tdStyle}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 10,
                              background: d.probability === 'high' ? '#fce4e4' : d.probability === 'moderate' ? '#fef9e7' : '#eef8fa',
                              color: d.probability === 'high' ? '#c0392b' : d.probability === 'moderate' ? '#f39c12' : '#005f73',
                              fontSize: 11, fontWeight: 600,
                            }}>{d.probability.toUpperCase()}</span>
                          </td>
                          <td style={tdStyle}>
                            <button onClick={() => updateDoc(doc => {
                              doc.differentials.topDiagnoses = doc.differentials.topDiagnoses.filter((_, i) => i !== idx);
                              return doc;
                            })}
                              style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer' }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input placeholder="Diagnosis name" value={newDifferential.diseaseName}
                    onChange={e => setNewDifferential(p => ({ ...p, diseaseName: e.target.value }))}
                    style={{ ...inputStyle, width: 200 }} />
                  <input placeholder="ICD-10" value={newDifferential.icd10}
                    onChange={e => setNewDifferential(p => ({ ...p, icd10: e.target.value }))}
                    style={{ ...inputStyle, width: 80 }} />
                  <select value={newDifferential.probability}
                    onChange={e => setNewDifferential(p => ({ ...p, probability: e.target.value as any }))}
                    style={{ ...inputStyle, width: 100 }}>
                    <option value="high">High</option>
                    <option value="moderate">Moderate</option>
                    <option value="low">Low</option>
                    <option value="considered">Considered</option>
                  </select>
                  <button onClick={() => {
                    if (newDifferential.diseaseName) {
                      updateDoc(d => {
                        const rank = d.differentials.topDiagnoses.length + 1;
                        d.differentials.topDiagnoses.push({
                          rank, diseaseId: 'dx-' + Date.now(),
                          diseaseName: newDifferential.diseaseName,
                          icd10: newDifferential.icd10 || undefined,
                          probability: newDifferential.probability,
                          score: newDifferential.score,
                          isRedFlag: newDifferential.probability === 'high',
                          supports: [], opposes: [],
                        });
                        return d;
                      });
                      setNewDifferential({ diseaseId: '', diseaseName: '', icd10: '', probability: 'moderate', score: 3 });
                    }
                  }}
                    style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #0a9396', background: '#e6f7f7', color: '#0a9396', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    + Add Diagnosis
                  </button>
                </div>
              </div>

              {/* Assessment */}
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>Clinical Assessment</h3>
                <textarea placeholder="Clinical impression, case summary, reasoning behind differential ranking..."
                  value={doc.assessment.clinicalImpression}
                  onChange={e => updateDoc(d => { d.assessment.clinicalImpression = e.target.value; return d; })}
                  rows={4} style={{ ...inputStyle, resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
              </div>

              {/* DDx Narrative */}
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>DDx Reasoning Rationale</h3>
                <textarea placeholder="Reasoning behind differential diagnosis — why certain diagnoses rank higher, key differentiating features..."
                  value={doc.differentials.reasoningRationale}
                  onChange={e => updateDoc(d => { d.differentials.reasoningRationale = e.target.value; return d; })}
                  rows={3} style={{ ...inputStyle, resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}

          {/* ── MANAGEMENT PLAN TAB ── */}
          {activeTab === 'plan' && (
            <div className="form-section">
              {MANAGEMENT_CATEGORIES.map(cat => {
                const key = cat === 'Immediate Actions' ? 'immediateActions' :
                  cat === 'Treatments' ? 'treatments' :
                  cat === 'Monitoring' ? 'monitoring' :
                  cat === 'Follow-Up' ? 'followUp' :
                  cat === 'Referrals' ? 'referrals' :
                  cat === 'Patient Education' ? 'patientEducation' : 'contingencyPlan';
                const items = (doc.plan as any)[key] as string[] || [];
                return (
                  <div key={cat} style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>{cat}</h3>
                    {items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, fontSize: 13 }}>
                        <span>• {item}</span>
                        <button onClick={() => updateDoc(d => {
                          const arr = (d.plan as any)[key] as string[];
                          (d.plan as any)[key] = arr.filter((_: string, i: number) => i !== idx);
                          return d;
                        })}
                          style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 11, marginLeft: 'auto' }}>Remove</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <input placeholder={`Add ${cat.toLowerCase()}...`}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const text = input.value.trim();
                            if (text) {
                              updateDoc(d => {
                                const arr = (d.plan as any)[key] as string[];
                                (d.plan as any)[key] = [...arr, text];
                                return d;
                              });
                              input.value = '';
                            }
                          }
                        }}
                        style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #dce4e8', fontSize: 12 }} />
                    </div>
                  </div>
                );
              })}

              {/* Monitoring Parameters */}
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>Monitoring Parameters</h3>
                {doc.monitoring.parameters.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ fontWeight: 600 }}>{p.parameter}</span>
                    <span style={{ color: '#7f8c8d' }}>— {p.frequency}, target: {p.target}</span>
                    <button onClick={() => updateDoc(d => {
                      d.monitoring.parameters = d.monitoring.parameters.filter((_, i) => i !== idx);
                      return d;
                    })}
                      style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <input placeholder="Parameter" value={newMonitoringParam.parameter}
                    onChange={e => setNewMonitoringParam(p => ({ ...p, parameter: e.target.value }))}
                    style={{ ...inputStyle, width: 150 }} />
                  <input placeholder="Frequency" value={newMonitoringParam.frequency}
                    onChange={e => setNewMonitoringParam(p => ({ ...p, frequency: e.target.value }))}
                    style={{ ...inputStyle, width: 120 }} />
                  <input placeholder="Target" value={newMonitoringParam.target}
                    onChange={e => setNewMonitoringParam(p => ({ ...p, target: e.target.value }))}
                    style={{ ...inputStyle, width: 120 }} />
                  <button onClick={() => {
                    if (newMonitoringParam.parameter) {
                      updateDoc(d => {
                        d.monitoring.parameters.push({
                          parameter: newMonitoringParam.parameter,
                          frequency: newMonitoringParam.frequency || 'As ordered',
                          target: newMonitoringParam.target || 'Normal',
                        });
                        return d;
                      });
                      setNewMonitoringParam({ parameter: '', frequency: '', target: '' });
                    }
                  }}
                    style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #0a9396', background: '#e6f7f7', color: '#0a9396', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    + Add
                  </button>
                </div>
              </div>

              {/* Escalation Criteria */}
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>Escalation Criteria</h3>
                {doc.monitoring.escalationCriteria.map((e, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 12 }}>
                    <span style={{ fontWeight: 600 }}>{e.condition}</span>
                    <span style={{ color: '#7f8c8d' }}>→ {e.action}</span>
                    <button onClick={() => updateDoc(d => {
                      d.monitoring.escalationCriteria = d.monitoring.escalationCriteria.filter((_, i) => i !== idx);
                      return d;
                    })}
                      style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <input placeholder="Condition (e.g., SpO2 <90%)" value={newEscalation.condition}
                    onChange={e => setNewEscalation(p => ({ ...p, condition: e.target.value }))}
                    style={{ ...inputStyle, flex: 1 }} />
                  <input placeholder="Action (e.g., Call senior)" value={newEscalation.action}
                    onChange={e => setNewEscalation(p => ({ ...p, action: e.target.value }))}
                    style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={() => {
                    if (newEscalation.condition && newEscalation.action) {
                      updateDoc(d => {
                        d.monitoring.escalationCriteria.push({
                          condition: newEscalation.condition,
                          action: newEscalation.action,
                        });
                        return d;
                      });
                      setNewEscalation({ condition: '', action: '' });
                    }
                  }}
                    style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #0a9396', background: '#e6f7f7', color: '#0a9396', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    + Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── PREVIEW & EXPORT TAB ── */}
          {activeTab === 'preview' && (
            <div className="form-section">
              <div style={{ background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 20, color: '#005f73' }}>📄 Document Preview</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleExportPdf} disabled={exporting === 'pdf'}
                      style={{
                        padding: '10px 24px', borderRadius: 8, border: 'none',
                        background: '#005f73', color: '#fff', fontWeight: 600,
                        fontSize: 14, cursor: exporting ? 'not-allowed' : 'pointer',
                      }}>
                      {exporting === 'pdf' ? 'Generating...' : '⬇ Download PDF'}
                    </button>
                    <button onClick={handlePrint} disabled={exporting === 'print'}
                      style={{
                        padding: '10px 24px', borderRadius: 8, border: '2px solid #005f73',
                        background: '#fff', color: '#005f73', fontWeight: 600,
                        fontSize: 14, cursor: exporting ? 'not-allowed' : 'pointer',
                      }}>
                      🖨 Open PDF in Browser
                    </button>
                  </div>
                </div>

                {/* Preview Content */}
                <div style={{
                  background: '#fafcfe', border: '1px solid #e8edf0', borderRadius: 8, padding: 20,
                  fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.6, color: '#2c3e50',
                }}>
                  <h2 style={{ textAlign: 'center', color: '#005f73', fontSize: 18, marginBottom: 4 }}>
                    {doc.metadata.facility}
                  </h2>
                  <p style={{ textAlign: 'center', color: '#7f8c8d', fontSize: 11, marginBottom: 16 }}>
                    {doc.metadata.department} — Generated {new Date(doc.metadata.generatedAt).toLocaleString()}
                  </p>

                  <PreviewSection title="Patient Information">
                    {doc.patient.name && <div><strong>Name:</strong> {doc.patient.name}</div>}
                    {doc.patient.mrn && <div><strong>MRN:</strong> {doc.patient.mrn}</div>}
                    {doc.patient.age > 0 && <div><strong>Age:</strong> {doc.patient.age} years, {doc.patient.gender}</div>}
                    {doc.patient.allergies.length > 0 && <div><strong>Allergies:</strong> {doc.patient.allergies.join(', ')}</div>}
                  </PreviewSection>

                  <PreviewSection title="Encounter">
                    <div><strong>Date:</strong> {doc.encounter.date} at {doc.encounter.time}</div>
                    {doc.encounter.location && <div><strong>Location:</strong> {doc.encounter.location}</div>}
                    {doc.encounter.encounterType && <div><strong>Type:</strong> {doc.encounter.encounterType}</div>}
                  </PreviewSection>

                  <PreviewSection title="Chief Complaint">
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{doc.subjective.chiefComplaint || '(not specified)'}</div>
                    {doc.encounter.duration && <div><strong>Duration:</strong> {doc.encounter.duration}</div>}
                  </PreviewSection>

                  {doc.subjective.historyOfPresentingIllness && (
                    <PreviewSection title="History of Presenting Illness">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{doc.subjective.historyOfPresentingIllness}</div>
                    </PreviewSection>
                  )}

                  {doc.subjective.symptomReview.filter(s => s.present).length > 0 && (
                    <PreviewSection title="Review of Systems — Positive Findings">
                      <div>{doc.subjective.symptomReview.filter(s => s.present).map(s => s.symptom).join(', ')}</div>
                    </PreviewSection>
                  )}

                  {doc.objective.vitalSigns.length > 0 && (
                    <PreviewSection title="Vital Signs">
                      {doc.objective.vitalSigns.map(v => (
                        <span key={v.name} style={{ marginRight: 16 }}>
                          <strong>{v.name}:</strong> {v.value} {v.unit}
                        </span>
                      ))}
                    </PreviewSection>
                  )}

                  {doc.objective.examinationFindings.length > 0 && (
                    <PreviewSection title="Physical Examination">
                      {EXAM_SYSTEMS.map(sys => {
                        const f = doc.objective.examinationFindings.filter(f => f.system === sys);
                        return f.length > 0 ? (
                          <div key={sys} style={{ marginBottom: 4 }}>
                            <strong>{sys}:</strong> {f.map(f => f.finding).join(', ')}
                          </div>
                        ) : null;
                      })}
                    </PreviewSection>
                  )}

                  {doc.objective.investigations.length > 0 && (
                    <PreviewSection title="Investigations">
                      {doc.objective.investigations.map((inv, idx) => (
                        <div key={idx}><strong>{inv.name}:</strong> {inv.result || 'Pending'} {inv.interpretation ? `(${inv.interpretation})` : ''}</div>
                      ))}
                    </PreviewSection>
                  )}

                  {doc.differentials.topDiagnoses.length > 0 && (
                    <PreviewSection title="Differential Diagnosis">
                      {doc.differentials.topDiagnoses.map((d, idx) => (
                        <div key={idx}>
                          {idx + 1}. <strong>{d.diseaseName}</strong>
                          {d.icd10 ? ` (${d.icd10})` : ''}
                          {' — '}<span style={{
                            color: d.probability === 'high' ? '#c0392b' : d.probability === 'moderate' ? '#f39c12' : '#005f73',
                            fontWeight: 600, textTransform: 'uppercase', fontSize: 11,
                          }}>{d.probability}</span>
                          {d.isRedFlag ? <span style={{ color: '#e74c3c', marginLeft: 8 }}>⚠ RED FLAG</span> : ''}
                        </div>
                      ))}
                    </PreviewSection>
                  )}

                  {doc.assessment.clinicalImpression && (
                    <PreviewSection title="Assessment">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{doc.assessment.clinicalImpression}</div>
                    </PreviewSection>
                  )}

                  {MANAGEMENT_CATEGORIES.map(cat => {
                    const key = cat === 'Immediate Actions' ? 'immediateActions' :
                      cat === 'Treatments' ? 'treatments' :
                      cat === 'Monitoring' ? 'monitoring' :
                      cat === 'Follow-Up' ? 'followUp' :
                      cat === 'Referrals' ? 'referrals' :
                      cat === 'Patient Education' ? 'patientEducation' : 'contingencyPlan';
                    const items = (doc.plan as any)[key] as string[] || [];
                    return items.length > 0 ? (
                      <PreviewSection key={cat} title={cat}>
                        {items.map((item, idx) => <div key={idx}>• {item}</div>)}
                      </PreviewSection>
                    ) : null;
                  })}

                  {doc.monitoring.parameters.length > 0 && (
                    <PreviewSection title="Monitoring Parameters">
                      {doc.monitoring.parameters.map((p, idx) => (
                        <div key={idx}>• <strong>{p.parameter}</strong> — {p.frequency}, target: {p.target}</div>
                      ))}
                    </PreviewSection>
                  )}

                  {doc.monitoring.escalationCriteria.length > 0 && (
                    <PreviewSection title="Escalation Criteria">
                      {doc.monitoring.escalationCriteria.map((e, idx) => (
                        <div key={idx}>• If <strong>{e.condition}</strong> → {e.action}</div>
                      ))}
                    </PreviewSection>
                  )}

                  {doc.references.guidelines.length > 0 && (
                    <PreviewSection title="References & Guidelines">
                      {doc.references.guidelines.map((g, idx) => (
                        <div key={idx}>{idx + 1}. {g.title} ({g.issuingBody}, {g.year})</div>
                      ))}
                    </PreviewSection>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Reusable Sub-Components ── */

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 10px', fontSize: 14, color: '#005f73', fontWeight: 600 }}>{title}</h3>
      {children}
    </div>
  );
}

function TagInput({ tags, onAdd, onRemove, placeholder }: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
        {tags.map((tag, idx) => (
          <span key={idx} style={{
            padding: '2px 8px', borderRadius: 12, background: '#eef8fa',
            color: '#005f73', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {tag}
            <button onClick={() => onRemove(idx)}
              style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1 }}>✕</button>
          </span>
        ))}
      </div>
      <input placeholder={placeholder}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            const input = e.target as HTMLInputElement;
            const text = input.value.trim();
            if (text && !tags.includes(text)) {
              onAdd(text);
              input.value = '';
            }
          }
        }}
        style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #dce4e8', fontSize: 12, boxSizing: 'border-box' }} />
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{
        fontSize: 13, fontWeight: 700, color: '#005f73',
        borderBottom: '1px solid #e8edf0', paddingBottom: 4, marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function upsertVital(doc: ClinicalDocument, updateDoc: (fn: (d: ClinicalDocument) => ClinicalDocument) => void, name: string, value: string, unit: string) {
  updateDoc(d => {
    const idx = d.objective.vitalSigns.findIndex(v => v.name === name);
    if (idx >= 0) {
      d.objective.vitalSigns[idx].value = value;
      d.objective.vitalSigns[idx].unit = unit;
    } else if (value) {
      d.objective.vitalSigns.push({ name, value, unit });
    }
    return d;
  });
}

const inputStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: 6,
  border: '1px solid #dce4e8',
  fontSize: 13,
  fontFamily: 'Inter, system-ui, sans-serif',
  color: '#2c3e50',
  background: '#fff',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#7f8c8d',
  marginBottom: 4,
  marginTop: 8,
};

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
  fontSize: 11,
  color: '#7f8c8d',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: 12,
};
