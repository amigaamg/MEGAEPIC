'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, query, where, onSnapshot, orderBy, doc, getDoc, getDocs,
} from 'firebase/firestore';
import DiseaseDashboardHub, { DiseaseType, DISEASE_META } from '@/components/clinical-dashboards/DiseaseDashboardHub';
import MonitoringDashboard from '@/components/clinical-monitoring/MonitoringDashboard';
import MedicationAdherence from '../panels/MedicationAdherence';
import LabImagingReview from '../panels/LabImagingReview';
import ClinicalToolLauncher from '@/components/clinical-monitoring/ClinicalToolLauncher';

interface PatientEntry {
  uid: string; fullName: string; age?: number; sex?: string;
  diseaseTypes: string[]; riskLevel?: string;
}

const DISEASE_OPTIONS = [
  { type: 'hypertension' as DiseaseType, icon: '❤️', label: 'Hypertension', color: '#ef4444' },
  { type: 'diabetes_t2' as DiseaseType, icon: '🍬', label: 'Type 2 Diabetes', color: '#f59e0b' },
  { type: 'asthma' as DiseaseType, icon: '🌬️', label: 'Asthma', color: '#3b82f6' },
  { type: 'hiv' as DiseaseType, icon: '🧬', label: 'HIV', color: '#8b5cf6' },
  { type: 'ckd' as DiseaseType, icon: '🫘', label: 'CKD', color: '#10b981' },
  { type: 'heart_failure' as DiseaseType, icon: '💔', label: 'Heart Failure', color: '#ec4899' },
  { type: 'copd' as DiseaseType, icon: '🫁', label: 'COPD', color: '#6366f1' },
  { type: 'sickle_cell' as DiseaseType, icon: '🩸', label: 'Sickle Cell', color: '#ef4444' },
];

type WorkspaceTab = 'monitoring' | 'disease_registry' | 'adherence' | 'lab_imaging';

interface Props {
  doctorId: string; doctorName: string;
}

export default function ClinicalMonitoringWorkspace({ doctorId, doctorName }: Props) {
  const [tab, setTab] = useState<WorkspaceTab>('disease_registry');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseType | 'all'>('all');
  const [enrolledPatients, setEnrolledPatients] = useState<PatientEntry[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientNames, setPatientNames] = useState<Record<string, string>>({});
  const [patientInfo, setPatientInfo] = useState<Record<string, { age?: number; sex?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [launchedTool, setLaunchedTool] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'disease_enrollments'), where('doctorId', '==', doctorId), where('status', '==', 'active')),
      async snap => {
        const patientMap = new Map<string, Set<string>>();
        snap.docs.forEach(d => {
          const data = d.data();
          if (!patientMap.has(data.patientId)) patientMap.set(data.patientId, new Set());
          patientMap.get(data.patientId)!.add(data.diseaseType);
        });
        const entries: PatientEntry[] = [];
        const names: Record<string, string> = {};
        const info: Record<string, { age?: number; sex?: string }> = {};

        const patientIds = [...patientMap.keys()];
        const chunks: string[][] = [];
        for (let i = 0; i < patientIds.length; i += 10) chunks.push(patientIds.slice(i, i + 10));

        for (const chunk of chunks) {
          const snaps = await Promise.all(chunk.map(id => getDoc(doc(db, 'users', id)).catch(() => null)));
          snaps.forEach((s, i) => {
            if (!s?.exists()) return;
            const data = s.data();
            const uid = chunk[i];
            names[uid] = data.name || 'Unknown';
            info[uid] = { age: data.age, sex: data.gender };
            entries.push({
              uid, fullName: data.name || 'Unknown',
              age: data.age, sex: data.gender,
              diseaseTypes: [...patientMap.get(uid)!],
              riskLevel: data.riskLevel,
            });
          });
        }
        setEnrolledPatients(entries);
        setPatientNames(names);
        setPatientInfo(info);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [doctorId]);

  const diseaseCounts: Record<string, number> = {};
  enrolledPatients.forEach(p => p.diseaseTypes.forEach(d => { diseaseCounts[d] = (diseaseCounts[d] || 0) + 1; }));

  const filteredPatients = selectedDisease === 'all'
    ? enrolledPatients
    : enrolledPatients.filter(p => p.diseaseTypes.includes(selectedDisease));

  const handleLaunchTool = useCallback((toolId: string) => {
    setLaunchedTool(toolId);
  }, []);

  if (launchedTool) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideUp .25s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setLaunchedTool(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e9f3', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: '#64748b' }}>
            ← Back to Monitoring
          </button>
        </div>
        <ClinicalToolLauncher
          toolId={launchedTool}
          patientName="Demo Patient"
          doctorId={doctorId}
          doctorName={doctorName}
          onClose={() => setLaunchedTool(null)}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideUp .25s ease' }}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">🏥 Clinical Monitoring & Disease Registries</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {([
          { id: 'monitoring' as WorkspaceTab, icon: '📊', label: 'Patient Monitoring' },
          { id: 'disease_registry' as WorkspaceTab, icon: '📋', label: 'Disease Registry', count: enrolledPatients.length },
          { id: 'adherence' as WorkspaceTab, icon: '✅', label: 'Adherence Dashboard' },
          { id: 'lab_imaging' as WorkspaceTab, icon: '🔬', label: 'Lab & Imaging Review' },
        ]).map(t => (
          <button key={t.id} className={`filter-chip ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      {tab === 'monitoring' && (
        <MonitoringDashboard
          patientId={selectedPatient || undefined}
          patientName={selectedPatient ? patientNames[selectedPatient] : undefined}
          doctorId={doctorId}
          doctorName={doctorName}
          onLaunchTool={handleLaunchTool}
        />
      )}

      {tab === 'disease_registry' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            <div key="all" onClick={() => { setSelectedDisease('all'); setSelectedPatient(null); }}
              style={{
                padding: 12, borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                background: selectedDisease === 'all' ? 'var(--accent-dim)' : 'var(--surface)',
                border: selectedDisease === 'all' ? '2px solid var(--accent)' : '1px solid var(--border)',
                transition: 'all .14s',
              }}>
              <div style={{ fontSize: 24 }}>📋</div>
              <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--mono)' }}>{enrolledPatients.length}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)' }}>All Patients</div>
            </div>
            {DISEASE_OPTIONS.map(d => (
              <div key={d.type} onClick={() => { setSelectedDisease(d.type); setSelectedPatient(null); }}
                style={{
                  padding: 12, borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                  background: selectedDisease === d.type ? `${d.color}15` : 'var(--surface)',
                  border: selectedDisease === d.type ? `2px solid ${d.color}` : '1px solid var(--border)',
                  transition: 'all .14s',
                }}>
                <div style={{ fontSize: 24 }}>{d.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--mono)', color: d.color }}>
                  {diseaseCounts[d.type] || 0}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)' }}>{d.label}</div>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-hd">
              <div className="panel-title">
                {selectedDisease === 'all' ? '📋 All Enrolled Patients' : `${DISEASE_OPTIONS.find(d => d.type === selectedDisease)?.icon} ${DISEASE_OPTIONS.find(d => d.type === selectedDisease)?.label}`}
              </div>
              <span className="count-badge">{filteredPatients.length} patients</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="empty-sm">No patients enrolled in this disease program.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {filteredPatients.map(p => (
                  <div key={p.uid}
                    onClick={() => setSelectedPatient(selectedPatient === p.uid ? null : p.uid)}
                    style={{
                      padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                      background: selectedPatient === p.uid ? 'var(--accent-dim)' : 'var(--bg)',
                      border: selectedPatient === p.uid ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      transition: 'all .14s',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="queue-ava" style={{ width: 36, height: 36, fontSize: 14 }}>
                          {p.fullName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{p.fullName}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {[p.age && `${p.age}y`, p.sex].filter(Boolean).join(' · ')}
                            <span style={{ marginLeft: 6 }}>
                              {p.diseaseTypes.map(d => DISEASE_OPTIONS.find(o => o.type === d)?.icon).join(' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                        {p.diseaseTypes.length} condition{p.diseaseTypes.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {selectedPatient === p.uid && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                          {DISEASE_OPTIONS.filter(d => p.diseaseTypes.includes(d.type)).map(d => (
                            <span key={d.type} style={{
                              padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                              background: `${d.color}15`, color: d.color, cursor: 'pointer',
                            }} onClick={(e) => { e.stopPropagation(); setSelectedDisease(d.type); }}>
                              {d.icon} {d.label}
                            </span>
                          ))}
                        </div>
                        <div style={{ maxHeight: '70vh', overflowY: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
                          <DiseaseDashboardHub
                            patientId={p.uid}
                            doctorId={doctorId}
                            doctorName={doctorName}
                            diseaseType={selectedDisease === 'all' ? 'hypertension' : selectedDisease as DiseaseType}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'adherence' && (
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-title">✅ Adherence Overview — All Patients</div>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />)}
            </div>
          ) : enrolledPatients.length === 0 ? (
            <div className="empty-sm">No patients with adherence data yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {enrolledPatients.slice(0, 10).map(p => (
                <div key={p.uid}
                  onClick={() => setSelectedPatient(selectedPatient === p.uid ? null : p.uid)}
                  style={{
                    padding: 10, borderRadius: 10, cursor: 'pointer',
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    transition: 'all .14s',
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                    {p.fullName}
                  </div>
                  {selectedPatient === p.uid && (
                    <div style={{ marginTop: 8, maxHeight: 400, overflowY: 'auto' }}>
                      <MedicationAdherence
                        patientId={p.uid}
                        doctorId={doctorId}
                        doctorName={doctorName}
                        compact
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'lab_imaging' && (
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-title">🔬 Lab & Imaging Review — All Patients</div>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />)}
            </div>
          ) : enrolledPatients.length === 0 ? (
            <div className="empty-sm">No patients with lab results yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {enrolledPatients.slice(0, 10).map(p => (
                <div key={p.uid}
                  onClick={() => setSelectedPatient(selectedPatient === p.uid ? null : p.uid)}
                  style={{
                    padding: 10, borderRadius: 10, cursor: 'pointer',
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    transition: 'all .14s',
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                    {p.fullName}
                  </div>
                  {selectedPatient === p.uid && (
                    <div style={{ marginTop: 8, maxHeight: 400, overflowY: 'auto' }}>
                      <LabImagingReview patientId={p.uid} compact />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
