'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, query, where, onSnapshot, doc, setDoc, addDoc,
  updateDoc, getDoc, getDocs, serverTimestamp, orderBy, limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ALL_PATHWAYS, DEPARTMENTS, RISK_COLORS, RISK_COLORS_DIM,
  getPathwayById, fmtDate, fmtDateTime,
  type PathwayDef, type DepartmentDef,
} from '@/components/doctor/panels/DepartmentDefinitions';

interface DocketType {
  id: string; name: string; specialty: string; description?: string;
  tools: string[]; patientCount: number; createdBy: string;
  isActive: boolean; createdAt?: any; color?: string;
}

interface EnrolledPatient {
  id: string; patientId: string; patientName: string; pathwayId: string;
  currentMilestone: number; startDate: any; status: string;
  docketId?: string; docketName?: string;
  riskLevel?: string; notes?: string; lastReview?: any;
  age?: number; sex?: string; patientIdCode?: string;
  recruitmentSource?: string; doctorId?: string; doctorName?: string;
}

interface Props {
  doctorId: string;
  doctorName: string;
  dockets: DocketType[];
  enrolledPatients: EnrolledPatient[];
  patients: { uid: string; name: string; condition?: string }[];
  allPathways: PathwayDef[];
  onBack: () => void;
  onSelectPatient: (patientId: string) => void;
  defaultMode?: 'view' | 'enroll';
}

type DocketView = 'list' | 'detail' | 'enroll';

const SPECIALTY_OPTIONS = [
  'General OPD', 'Internal Medicine', 'Cardiology', 'Endocrinology',
  'Nephrology', 'Pulmonology', 'Neurology', 'Psychiatry', 'Paediatrics',
  'Obstetrics & Gynaecology', 'Surgery', 'Orthopedics', 'HIV Care',
  'Infectious Disease', 'Oncology', 'Geriatrics', 'Emergency Medicine',
  'Rehabilitation', 'Dermatology', 'Ophthalmology', 'ENT', 'Gastroenterology',
  'Urology', 'Rheumatology', 'Hematology', 'Palliative Care', 'General',
];

const AVAILABLE_TOOLS = [
  { id: 'clinical_clerking', label: 'Clinical Clerking', icon: '📋' },
  { id: 'vital_tracking', label: 'Vital Tracking', icon: '❤️' },
  { id: 'prescription_writer', label: 'Prescription Writer', icon: '💊' },
  { id: 'lab_order', label: 'Lab Orders', icon: '🔬' },
  { id: 'imaging_order', label: 'Imaging Orders', icon: '🩻' },
  { id: 'referral_writer', label: 'Referral Writer', icon: '📨' },
  { id: 'patient_education', label: 'Patient Education', icon: '📖' },
  { id: 'htn_management', label: 'HTN Management', icon: '❤️' },
  { id: 'diabetes_tracker', label: 'Diabetes Tracker', icon: '🍬' },
  { id: 'ckd_staging', label: 'CKD Staging', icon: '🫘' },
  { id: 'asthma_tracker', label: 'Asthma Tracker', icon: '🫁' },
  { id: 'antenatal_schedule', label: 'Antenatal Schedule', icon: '🤰' },
  { id: 'hiv_art_tracker', label: 'HIV ART Tracker', icon: '🧬' },
  { id: 'tb_dot', label: 'TB DOT Tracker', icon: '🦠' },
  { id: 'immunization_tracker', label: 'Immunization Tracker', icon: '💉' },
  { id: 'pain_assessment', label: 'Pain Assessment', icon: '💉' },
  { id: 'wound_care', label: 'Wound Care', icon: '🩹' },
  { id: 'sepsis_screening', label: 'Sepsis Screening', icon: '🚨' },
  { id: 'stroke_scale', label: 'Stroke Scale', icon: '🧠' },
  { id: 'mews_scoring', label: 'MEWS Scoring', icon: '📊' },
  { id: 'ecg_reader', label: 'ECG Reader', icon: '🩻' },
  { id: 'spirometry', label: 'Spirometry', icon: '🫁' },
  { id: 'falls_risk', label: 'Falls Risk', icon: '⚠️' },
  { id: 'palliative_symptom', label: 'Palliative Symptom', icon: '🌅' },
];

export default function FullPageDocketCenter({
  doctorId, doctorName, dockets, enrolledPatients, patients, allPathways, onBack, onSelectPatient, defaultMode,
}: Props) {
  const [viewMode, setViewMode] = useState<DocketView>(defaultMode === 'enroll' ? 'enroll' : 'list');
  const [selectedDocket, setSelectedDocket] = useState<DocketType | null>(null);
  const [search, setSearch] = useState('');
  const [docketFilter, setDocketFilter] = useState<string>(viewMode === 'enroll' ? '' : 'all');

  // Create docket form
  const [createForm, setCreateForm] = useState({ name: '', specialty: '', description: '' });
  const [creatingDocket, setCreatingDocket] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Edit docket tools
  const [editingTools, setEditingTools] = useState<string[]>([]);
  const [savingTools, setSavingTools] = useState(false);

  // Enrollment flow
  const [enrollStep, setEnrollStep] = useState<'select_docket' | 'select_patient' | 'select_pathway' | 'select_risk' | 'confirm'>('select_docket');
  const [enrollPatient, setEnrollPatient] = useState<string>('');
  const [enrollPatientSearch, setEnrollPatientSearch] = useState('');
  const [enrollPathway, setEnrollPathway] = useState<string>('');
  const [enrollDocket, setEnrollDocket] = useState<string>(defaultMode === 'enroll' ? '' : selectedDocket?.id || '');
  const [enrollRisk, setEnrollRisk] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [enrollNotes, setEnrollNotes] = useState('');
  const [savingEnroll, setSavingEnroll] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  const activeDockets = dockets.filter(d => d.isActive);
  const filteredDockets = docketFilter === 'all' ? activeDockets : activeDockets.filter(d => d.id === docketFilter);

  // View a specific docket
  const viewDocket = (d: DocketType) => {
    setSelectedDocket(d);
    setViewMode('detail');
  };

  // ─── DOCKET CRUD ───

  const createDocket = async () => {
    if (!createForm.name || !createForm.specialty) return;
    setCreatingDocket(true);
    try {
      await addDoc(collection(db, 'dockets'), {
        name: createForm.name, specialty: createForm.specialty,
        description: createForm.description, tools: [],
        patientCount: 0, createdBy: doctorId, isActive: true,
        createdAt: serverTimestamp(),
      });
      setCreateForm({ name: '', specialty: '', description: '' });
      setShowCreateForm(false);
    } catch (e) { console.error(e); }
    setCreatingDocket(false);
  };

  const toggleDocket = async (id: string, isActive: boolean) => {
    await updateDoc(doc(db, 'dockets', id), { isActive });
  };

  const deleteDocket = async (id: string) => {
    if (!window.confirm('Delete this docket? This cannot be undone.')) return;
    await updateDoc(doc(db, 'dockets', id), { isActive: false });
  };

  const saveDocketTools = async () => {
    if (!selectedDocket) return;
    setSavingTools(true);
    try {
      await updateDoc(doc(db, 'dockets', selectedDocket.id), { tools: editingTools });
    } catch (e) { console.error(e); }
    setSavingTools(false);
  };

  // ─── ENROLLMENT ───

  const filteredPatients = patients.filter(p =>
    !enrollPatientSearch || p.name.toLowerCase().includes(enrollPatientSearch.toLowerCase())
  );

  const startEnroll = (docketId?: string) => {
    if (docketId) setEnrollDocket(docketId);
    setEnrollStep('select_patient');
    setViewMode('enroll');
  };

  const doEnroll = async () => {
    if (!enrollPatient || !enrollPathway) return;
    setSavingEnroll(true);
    setEnrollError('');
    try {
      const patientData = patients.find(p => p.uid === enrollPatient);
      const pathway = allPathways.find(p => p.id === enrollPathway);
      if (!patientData || !pathway) { setEnrollError('Missing data'); setSavingEnroll(false); return; }

      // Check for existing enrollment in this pathway
      const existing = enrolledPatients.find(e => e.patientId === enrollPatient && e.pathwayId === enrollPathway);
      if (existing) { setEnrollError('Patient already enrolled in this pathway.'); setSavingEnroll(false); return; }

      const docket = dockets.find(d => d.id === enrollDocket);

      const ref = doc(collection(db, 'care_pathways'));
      await setDoc(ref, {
        patientId: enrollPatient, patientName: patientData.name,
        pathwayId: enrollPathway, pathwayName: pathway.label,
        currentMilestone: 0, status: 'active',
        riskLevel: enrollRisk, notes: enrollNotes,
        docketId: enrollDocket || null, docketName: docket?.name || null,
        doctorId, doctorName, recruitmentSource: 'internal',
        startDate: serverTimestamp(), lastReview: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      if (enrollDocket) {
        const dRef = doc(db, 'dockets', enrollDocket);
        const dSnap = await getDoc(dRef);
        if (dSnap.exists()) {
          await updateDoc(dRef, { patientCount: (dSnap.data().patientCount || 0) + 1 });
        }
      }

      await addDoc(collection(db, 'patient_timeline'), {
        patientId: enrollPatient, type: 'pathway_enrolled',
        title: `Enrolled in ${pathway.label}`,
        description: `Milestone 1: ${pathway.milestones[0]}`,
        icon: pathway.icon, doctorId, doctorName,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'patientNotifications'), {
        patientId: enrollPatient, doctorId,
        title: `${pathway.icon} Care Pathway Enrolled`,
        message: `Dr. ${doctorName} has enrolled you in ${pathway.label}. First: ${pathway.milestones[0]}`,
        type: 'pathway', read: false, createdAt: serverTimestamp(),
      });

      // Reset and go back
      setEnrollStep('select_docket');
      setEnrollPatient('');
      setEnrollPathway('');
      setEnrollNotes('');
      setViewMode('list');
    } catch (e: any) {
      setEnrollError(e.message || 'Enrollment failed');
    }
    setSavingEnroll(false);
  };

  // Docket patients
  const docketPatients = enrolledPatients.filter(e =>
    selectedDocket && e.docketId === selectedDocket.id
  );

  // Enrollment counts
  const docketPatientCounts = useMemo(() => {
    const counts = new Map<string, number>();
    enrolledPatients.forEach(e => {
      if (e.docketId) counts.set(e.docketId, (counts.get(e.docketId) || 0) + 1);
    });
    return counts;
  }, [enrolledPatients]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'fadeUp .25s ease' }}>

      {/* ── HEADER ── */}
      <div style={{
        flexShrink: 0, background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => {
            if (viewMode === 'detail') setViewMode('list');
            else if (viewMode === 'enroll') setViewMode('list');
            else onBack();
          }} style={{
            background: 'var(--bg)', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
          }}>←</button>
          <span style={{ fontSize: 17, fontWeight: 800 }}>
            {viewMode === 'list' ? '🗂️ Care Dockets' :
             viewMode === 'enroll' ? '➕ Enrol Patient in Pathway' :
             selectedDocket ? selectedDocket.name : 'Docket'}
          </span>
          {viewMode === 'list' && (
            <span style={{
              background: 'rgba(15,118,110,.08)', color: '#0F766E',
              borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 8px',
            }}>{activeDockets.length} active</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {viewMode === 'list' && (
            <button onClick={() => setShowCreateForm(!showCreateForm)} style={{
              padding: '7px 14px', background: 'linear-gradient(135deg,#0F766E,#06b6d4)',
              color: '#fff', border: 'none', borderRadius: 9, fontSize: 12,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
            }}>{showCreateForm ? '✕ Cancel' : '➕ New Docket'}</button>
          )}
          {viewMode === 'detail' && selectedDocket && (
            <button onClick={() => startEnroll(selectedDocket.id)} style={{
              padding: '7px 14px', background: 'linear-gradient(135deg,#0F766E,#06b6d4)',
              color: '#fff', border: 'none', borderRadius: 9, fontSize: 12,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
            }}>➕ Enrol Patient</button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', background: 'var(--bg)' }}>

        {/* ═══ LIST VIEW ═══ */}
        {viewMode === 'list' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {/* Create form */}
            {showCreateForm && (
              <div style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 14, padding: 16, marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Create New Docket</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Docket name (e.g. Hypertension Continuity Program)"
                    style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 9, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)' }} />
                  <select value={createForm.specialty} onChange={e => setCreateForm(f => ({ ...f, specialty: e.target.value }))}
                    style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 9, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)' }}>
                    <option value="">Select specialty…</option>
                    {SPECIALTY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Description (optional)" rows={2}
                    style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 9, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)', resize: 'vertical' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowCreateForm(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: 9, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--muted)' }}>Cancel</button>
                    <button onClick={createDocket} disabled={creatingDocket || !createForm.name || !createForm.specialty} style={{
                      flex: 2, background: 'linear-gradient(135deg,#0F766E,#06b6d4)', color: '#fff',
                      border: 'none', borderRadius: 9, padding: '9px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                    }}>{creatingDocket ? 'Creating…' : '+ Create Docket'}</button>
                  </div>
                </div>
              </div>
            )}

            {activeDockets.length === 0 && !createForm.name && (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🗂️</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No care dockets yet</div>
                <div style={{ fontSize: 13, marginBottom: 20 }}>Create dockets to organize patient cohorts by specialty or clinic.</div>
                <button onClick={() => setShowCreateForm(true)} style={{
                  background: '#0F766E', color: '#fff', border: 'none', borderRadius: 10,
                  padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>➕ Create Your First Docket</button>
              </div>
            )}

            {activeDockets.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeDockets.map(d => {
                  const count = docketPatientCounts.get(d.id) || 0;
                  const dept = DEPARTMENTS.find(dd => dd.label === d.specialty);
                  return (
                    <div
                      key={d.id}
                      onClick={() => viewDocket(d)}
                      style={{
                        background: 'var(--white)', border: '1.5px solid var(--border)',
                        borderRadius: 14, padding: '14px 18px', cursor: 'pointer',
                        transition: 'all .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#0F766E40'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 11,
                            background: dept ? dept.colorDim : 'var(--bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                          }}>{dept?.icon || '🗂️'}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{d.specialty}</div>
                            {d.description && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{d.description}</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--mono)', color: '#0F766E' }}>{count}</div>
                            <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Patients</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--mono)', color: '#d69e2e' }}>{d.tools?.length || 0}</div>
                            <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Tools</div>
                          </div>
                          <span style={{ fontSize: 18 }}>→</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Inactive dockets */}
                {dockets.filter(d => !d.isActive).length > 0 && (
                  <>
                    <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Inactive</div>
                    {dockets.filter(d => !d.isActive).map(d => (
                      <div key={d.id} style={{
                        background: 'var(--white)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: '10px 14px', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center', opacity: 0.6,
                      }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                        <button onClick={() => toggleDocket(d.id, true)} style={{
                          padding: '4px 10px', borderRadius: 99, border: 'none',
                          fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                          background: 'rgba(56,161,105,.1)', color: '#38a169',
                        }}>Reactivate</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ DETAIL VIEW ═══ */}
        {viewMode === 'detail' && selectedDocket && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Docket header */}
            <div style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 14, padding: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedDocket.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{selectedDocket.specialty}</div>
                  {selectedDocket.description && <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{selectedDocket.description}</div>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <span style={{ background: 'rgba(15,118,110,.08)', color: '#0F766E', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                      {docketPatientCounts.get(selectedDocket.id) || 0} patients
                    </span>
                    <span style={{ background: 'var(--bg)', color: 'var(--muted)', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                      {selectedDocket.tools?.length || 0} tools
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleDocket(selectedDocket.id, false)} style={{
                    padding: '5px 10px', background: 'rgba(229,62,62,.1)', color: '#e53e3e',
                    border: '1px solid rgba(229,62,62,.2)', borderRadius: 8, fontSize: 11,
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>Deactivate</button>
                  <button onClick={() => deleteDocket(selectedDocket.id)} style={{
                    padding: '5px 10px', background: 'transparent', color: 'var(--muted)',
                    border: '1px solid var(--border)', borderRadius: 8, fontSize: 11,
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>Delete</button>
                </div>
              </div>
            </div>

            {/* Tools management */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>🛠️ Docket Tools</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                {(editingTools.length > 0 ? editingTools : selectedDocket.tools || []).map(toolId => {
                  const t = AVAILABLE_TOOLS.find(at => at.id === toolId);
                  return (
                    <span key={toolId} style={{
                      background: 'rgba(15,118,110,.08)', color: '#0F766E',
                      borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {t?.icon} {t?.label || toolId}
                      {editingTools.length > 0 && (
                        <button onClick={() => setEditingTools(prev => prev.filter(id => id !== toolId))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: 13, padding: 0 }}>×</button>
                      )}
                    </span>
                  );
                })}
              </div>
              {editingTools.length > 0 ? (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10, maxHeight: 150, overflowY: 'auto' }}>
                    {AVAILABLE_TOOLS.filter(t => !editingTools.includes(t.id)).map(t => (
                      <button key={t.id} onClick={() => setEditingTools(prev => [...prev, t.id])} style={{
                        padding: '3px 8px', background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: 99, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'var(--font)', color: 'var(--muted)',
                      }}>{t.icon} +{t.label}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditingTools([])} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--muted)' }}>Cancel</button>
                    <button onClick={saveDocketTools} disabled={savingTools} style={{ padding: '6px 14px', background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>{savingTools ? 'Saving…' : '💾 Save Tools'}</button>
                  </div>
                </>
              ) : (
                <button onClick={() => setEditingTools([...(selectedDocket.tools || [])])} style={{
                  padding: '6px 14px', background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text)',
                }}>✏️ Edit Tools</button>
              )}
            </div>

            {/* Patients in docket */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
                  👥 Patients ({docketPatients.length})
                </div>
                <button onClick={() => startEnroll(selectedDocket.id)} style={{
                  padding: '5px 12px', background: '#0F766E', color: '#fff', border: 'none',
                  borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>➕ Add Patient</button>
              </div>
              {docketPatients.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: 13, padding: '12px 0', textAlign: 'center' }}>
                  No patients in this docket yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {docketPatients.map(ep => {
                    const pw = allPathways.find(p => p.id === ep.pathwayId);
                    return (
                      <div key={ep.id}
                        onClick={() => onSelectPatient(ep.patientId)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                          background: 'var(--bg)', borderRadius: 10, cursor: 'pointer',
                          transition: 'all .12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = pw?.colorDim || 'var(--bg)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; }}
                      >
                        <span style={{ fontSize: 18 }}>{pw?.icon || '🩺'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{ep.patientName}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {pw?.label || '—'} · M{ep.currentMilestone + 1}
                          </div>
                        </div>
                        <span style={{
                          background: ep.status === 'active' ? 'rgba(56,161,105,.1)' : 'var(--bg)',
                          color: ep.status === 'active' ? '#38a169' : 'var(--muted)',
                          borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                        }}>{ep.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ ENROLL VIEW ═══ */}
        {viewMode === 'enroll' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              {/* Progress steps */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                {['select_docket', 'select_patient', 'select_pathway', 'select_risk', 'confirm'].map(step => {
                  const stepOrder = ['select_docket', 'select_patient', 'select_pathway', 'select_risk', 'confirm'];
                  const currentIndex = stepOrder.indexOf(enrollStep);
                  const stepIndex = stepOrder.indexOf(step);
                  return (
                    <div key={step} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: stepIndex <= currentIndex ? '#0F766E' : 'var(--border)',
                    }} />
                  );
                })}
              </div>

              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginBottom: 16 }}>
                Step {['select_docket', 'select_patient', 'select_pathway', 'select_risk', 'confirm'].indexOf(enrollStep) + 1} of 5
              </div>

              {/* Step 1: Select Docket */}
              {enrollStep === 'select_docket' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Select a Care Docket</div>
                  <button onClick={() => { setEnrollDocket(''); setEnrollStep('select_patient'); }} style={{
                    padding: '14px 16px', background: !enrollDocket ? 'rgba(15,118,110,.06)' : 'var(--white)',
                    border: `1.5px solid ${!enrollDocket ? '#0F766E' : 'var(--border)'}`,
                    borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)',
                    fontSize: 14, fontWeight: 600, color: 'var(--text)',
                  }}>📋 General — No specific docket</button>
                  {activeDockets.map(d => (
                    <button key={d.id} onClick={() => { setEnrollDocket(d.id); setEnrollStep('select_patient'); }} style={{
                      padding: '14px 16px', background: enrollDocket === d.id ? 'rgba(15,118,110,.06)' : 'var(--white)',
                      border: `1.5px solid ${enrollDocket === d.id ? '#0F766E' : 'var(--border)'}`,
                      borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{d.specialty} · {docketPatientCounts.get(d.id) || 0} patients</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Select Patient */}
              {enrollStep === 'select_patient' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Select Patient</div>
                  <input value={enrollPatientSearch} onChange={e => setEnrollPatientSearch(e.target.value)}
                    placeholder="Search patient by name…"
                    style={{ width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)' }}
                  />
                  <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {filteredPatients.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13, padding: 8 }}>No patients found.</div>}
                    {filteredPatients.map(p => {
                      const existingEnroll = enrolledPatients.filter(e => e.patientId === p.uid);
                      return (
                        <button key={p.uid} onClick={() => { setEnrollPatient(p.uid); setEnrollStep('select_pathway'); }} style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                          background: enrollPatient === p.uid ? 'rgba(15,118,110,.06)' : 'var(--white)',
                          border: `1.5px solid ${enrollPatient === p.uid ? '#0F766E' : 'var(--border)'}`,
                          borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', width: '100%',
                        }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#5a67d8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{p.name[0]}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                              {existingEnroll.length > 0
                                ? `Already in ${existingEnroll.length} pathway${existingEnroll.length > 1 ? 's' : ''}`
                                : p.condition || 'No existing enrollments'}
                            </div>
                          </div>
                          {existingEnroll.length > 0 && (
                            <span style={{ background: 'rgba(15,118,110,.08)', color: '#0F766E', borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                              {existingEnroll.length} active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setEnrollStep('select_docket')} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, padding: '9px', fontSize: 13, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)', marginTop: 4 }}>← Back</button>
                </div>
              )}

              {/* Step 3: Select Pathway */}
              {enrollStep === 'select_pathway' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Select Care Pathway</div>
                  {ALL_PATHWAYS.filter(p => p.isActive).map(pw => {
                    const alreadyEnrolled = enrolledPatients.some(e => e.patientId === enrollPatient && e.pathwayId === pw.id);
                    return (
                      <button key={pw.id} onClick={() => { if (!alreadyEnrolled) { setEnrollPathway(pw.id); setEnrollStep('select_risk'); } }} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                        background: enrollPathway === pw.id ? pw.colorDim : alreadyEnrolled ? 'var(--bg)' : 'var(--white)',
                        border: `1.5px solid ${enrollPathway === pw.id ? pw.color : alreadyEnrolled ? 'var(--border)' : 'var(--border)'}`,
                        borderRadius: 14, cursor: alreadyEnrolled ? 'not-allowed' : 'pointer',
                        textAlign: 'left', fontFamily: 'var(--font)', width: '100%',
                        opacity: alreadyEnrolled ? 0.5 : 1,
                      }}>
                        <div style={{ width: 44, height: 44, borderRadius: 11, background: `${pw.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{pw.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: pw.color }}>{pw.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{pw.category} · {pw.duration} · {pw.milestones.length} milestones</div>
                        </div>
                        {alreadyEnrolled ? (
                          <span style={{ color: '#38a169', fontSize: 11, fontWeight: 700 }}>✓ Enrolled</span>
                        ) : (
                          <span style={{ fontSize: 16, color: 'var(--muted)' }}>→</span>
                        )}
                      </button>
                    );
                  })}
                  <button onClick={() => setEnrollStep('select_patient')} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, padding: '9px', fontSize: 13, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)', marginTop: 4 }}>← Back</button>
                </div>
              )}

              {/* Step 4: Risk */}
              {enrollStep === 'select_risk' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Risk Stratification</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['low', 'medium', 'high', 'critical'] as const).map(r => (
                      <button key={r} onClick={() => setEnrollRisk(r)} style={{
                        flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                        fontWeight: 700, fontSize: 13, fontFamily: 'var(--font)',
                        background: enrollRisk === r ? RISK_COLORS[r] : 'var(--bg)',
                        color: enrollRisk === r ? '#fff' : RISK_COLORS[r],
                        border: `1.5px solid ${enrollRisk === r ? RISK_COLORS[r] : 'var(--border)'}`,
                      }}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>
                    ))}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Clinical Notes</label>
                    <textarea value={enrollNotes} onChange={e => setEnrollNotes(e.target.value)} rows={2}
                      placeholder="Optional notes for this enrollment…"
                      style={{ width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEnrollStep('select_pathway')} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, padding: '10px', fontSize: 13, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)' }}>← Back</button>
                    <button onClick={() => setEnrollStep('confirm')} style={{ flex: 2, background: '#0F766E', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>Review →</button>
                  </div>
                </div>
              )}

              {/* Step 5: Confirm */}
              {enrollStep === 'confirm' && enrollPatient && enrollPathway && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Confirm Enrollment</div>
                  {(() => {
                    const patient = patients.find(p => p.uid === enrollPatient);
                    const pathway = allPathways.find(p => p.id === enrollPathway);
                    const docket = dockets.find(d => d.id === enrollDocket);
                    if (!patient || !pathway) return null;
                    return (
                      <>
                        <div style={{ background: pathway.colorDim, border: `1px solid ${pathway.color}30`, borderRadius: 14, padding: 16 }}>
                          <div style={{ fontSize: 24, marginBottom: 8 }}>{pathway.icon}</div>
                          <div style={{ fontWeight: 800, fontSize: 16 }}>{patient.name}</div>
                          <div style={{ fontSize: 13, color: pathway.color, marginTop: 2 }}>→ {pathway.label}</div>
                          {docket && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Docket: {docket.name} ({docket.specialty})</div>}
                          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                            <span style={{ background: RISK_COLORS_DIM[enrollRisk], color: RISK_COLORS[enrollRisk], borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{enrollRisk.toUpperCase()} RISK</span>
                            <span style={{ background: 'var(--white)', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{pathway.milestones.length} milestones</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--white)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
                          Starting Milestone: <strong>"{pathway.milestones[0]}"</strong>
                        </div>
                        {enrollError && <div style={{ background: 'rgba(229,62,62,.08)', border: '1px solid rgba(229,62,62,.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#e53e3e' }}>{enrollError}</div>}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setEnrollStep('select_risk')} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, padding: '10px', fontSize: 13, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)' }}>← Back</button>
                          <button onClick={doEnroll} disabled={savingEnroll} style={{
                            flex: 2, background: 'linear-gradient(135deg,#0F766E,#06b6d4)', color: '#fff',
                            border: 'none', borderRadius: 10, padding: '10px', fontSize: 14,
                            fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                          }}>{savingEnroll ? 'Enrolling…' : '✅ Confirm Enrolment'}</button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
