'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import PatientCreateModal from '../modals/PatientCreateModal';
import PatientRegistryTable from '../panels/PatientRegistryTable';
import TimelineEngine from '../panels/TimelineEngine';
import ClinicalRecordSystem from '@/components/HistoryPanel';
import HistoryExaminationEngine from '@/components/HistoryExaminationEngine';
import ClinicalDocumentation from '../panels/ClinicalDocumentation';
import PrescriptionTools from '../panels/PrescriptionTools';
import ChronicDiseaseMonitor from '../panels/ChronicDiseaseMonitor';
import MedicationAdherence from '../panels/MedicationAdherence';
import LabImagingReview from '../panels/LabImagingReview';
import PatientEducation from '../panels/PatientEducation';
import ClinicalCommunicationHub from '../panels/ClinicalCommunicationHub';
import AlertEscalationEngine from '../panels/AlertEscalationEngine';
import WorkflowTaskEngine from '../panels/WorkflowTaskEngine';

interface PatientRegistryEntry {
  uid: string; fullName: string; age?: number; sex?: string;
  createdAt?: any; origin?: string; activeDockets?: string[];
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical'; status?: string;
  lastReview?: any; conditions?: string[]; phone?: string; email?: string;
  bloodGroup?: string; allergies?: string[]; assignedTeam?: string;
}

interface VitalReading {
  id: string; patientId: string; type: string;
  value: string; systolic?: number; diastolic?: number;
  unit: string; recordedAt: any; note?: string;
}

interface Props {
  doctorId: string; doctorName: string; appointments: Appointment[];
  doctorSpecialty?: string; onCreatePatient?: (data: any) => Promise<{ uid: string } | null>;
  patients?: PatientRegistryEntry[];
  dockets?: { id: string; name: string }[];
  onAssignDocket?: (patientId: string, docketId: string) => void;
}

interface Appointment {
  id: string; patientId: string; patientName?: string;
  patientEmail?: string; patientPhone?: string;
  specialty?: string; status: string; date: any;
  amount?: number; paymentStatus?: string; prescriptions?: any[];
  doctorId: string; patientNotes?: string;
}

const fmtShort = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE',{day:'numeric',month:'short'});
};

const fmtFull = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
};

const statusCfg: Record<string,{label:string;color:string;bg:string}> = {
  booked:{label:'Upcoming',color:'#6366f1',bg:'rgba(99,102,241,.1)'},
  active:{label:'● Live',color:'#10b981',bg:'rgba(16,185,129,.1)'},
  completed:{label:'Completed',color:'#64748b',bg:'rgba(100,116,139,.1)'},
  cancelled:{label:'Cancelled',color:'#ef4444',bg:'rgba(239,68,68,.1)'},
};

const riskColor: Record<string, string> = { low:'#10b981', medium:'#f59e0b', high:'#ef4444', critical:'#dc2626' };

const bpCategory = (s: number, d: number) => {
  if (s < 120 && d < 80) return { label:'Normal', color:'#10b981' };
  if (s < 130 && d < 80) return { label:'Elevated', color:'#f59e0b' };
  if (s < 140 || d < 90) return { label:'Stage 1 High', color:'#f97316' };
  return { label:'Stage 2 High', color:'#ef4444' };
};

function PatientDetailInline({ patient, doctorId, doctorName, doctorSpecialty, appointments, onClose }: {
  patient: PatientRegistryEntry; doctorId: string; doctorName: string; doctorSpecialty?: string;
  appointments: Appointment[]; onClose: () => void;
}) {
  const router = useRouter();
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  type DetailTab = 'overview'|'vitals'|'history'|'prescriptions'|'timeline'|'notes'|'orders'|'monitor'|'adherence'|'labreview'|'education'|'communication'|'alerts'|'tasks';
  const [tab, setTab] = useState<DetailTab>('overview');
  const [monitorDisease, setMonitorDisease] = useState<'hypertension'|'diabetes_t2'|'asthma'|'hiv'|'ckd'|'heart_failure'|'copd'|'sickle_cell'>('hypertension');
  const [historyView, setHistoryView] = useState<'records'|'exam'|'visits'>('visits');

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db,'vitals'), where('patientId','==',patient.uid), orderBy('recordedAt','desc')),
      snap => setVitals(snap.docs.map(d => ({ id:d.id, ...d.data() }) as VitalReading))
    );
    return () => unsub();
  }, [patient.uid]);

  const patientAppts = appointments.filter(a => a.patientId === patient.uid);
  const latestBP = vitals.find(v => v.type === 'bp');
  const bpCat = latestBP ? bpCategory(latestBP.systolic!, latestBP.diastolic!) : null;
  const allRx = patientAppts.flatMap(a => a.prescriptions || []);
  const riskLevel = (patient.riskLevel?.toLowerCase() || 'low') as keyof typeof riskColor;

  return (
    <div style={{ padding: 20, borderRadius: 14, border: '2px solid var(--accent-dim)', background: 'var(--surface)', marginTop: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
        <div className="pc-ava" style={{ width: 48, height: 48, fontSize: 20 }}>{patient.fullName[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{patient.fullName}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {[patient.age && `${patient.age}y`, patient.sex, patient.bloodGroup].filter(Boolean).join(' · ')}
            {patient.riskLevel && (
              <span style={{ background: `${riskColor[riskLevel] || '#10b981'}20`, color: riskColor[riskLevel] || '#10b981', borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700, marginLeft: 8 }}>
                {patient.riskLevel} RISK
              </span>
            )}
          </div>
        </div>
        <button onClick={() => router.push(`/dashboard/doctor/patient/${patient.uid}`)}
          style={{ background:'#0ea5e9', color:'#fff', border:'none', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)' }}>
          🖥 Open Patient Workspace
        </button>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['overview','vitals','history','prescriptions','timeline','notes','orders','monitor','adherence','labreview','education','communication','alerts','tasks'] as DetailTab[]).map(t => (
          <button key={t} className={`filter-chip ${tab===t?'active':''}`} onClick={()=>setTab(t)} style={{ fontSize: 10, padding: '3px 8px' }}>
            {t === 'overview' ? '📋' : t === 'vitals' ? '❤️' : t === 'history' ? '🗂️' : t === 'prescriptions' ? '💊' : t === 'timeline' ? '📜' : t === 'notes' ? '📝' : t === 'orders' ? '📋' : t === 'monitor' ? '📊' : t === 'adherence' ? '✅' : t === 'labreview' ? '🔬' : t === 'education' ? '📖' : t === 'communication' ? '💬' : t === 'alerts' ? '🚨' : '📋'}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {patient.allergies?.length ? <div style={{ background:'var(--red-dim)', border:'1px solid rgba(239,68,68,.25)', borderRadius:10, padding:'9px 12px', fontSize:12, fontWeight:700, color:'var(--red)' }}>⚠️ Allergies: {patient.allergies.join(', ')}</div> : null}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { icon:'❤️', label:'BP', val: latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '—', sub: bpCat?.label, color: bpCat?.color },
              { icon:'🩸', label:'Glucose', val: vitals.find(v=>v.type==='glucose')?.value || '—', sub: 'mmol/L' },
              { icon:'💓', label:'Pulse', val: vitals.find(v=>v.type==='pulse')?.value || '—', sub: 'bpm' },
              { icon:'⚖️', label:'Weight', val: vitals.find(v=>v.type==='weight')?.value || '—', sub: 'kg' },
            ].map(v => (
              <div key={v.label} style={{ background:'var(--bg)', borderRadius:12, padding:'12px 8px', textAlign:'center', border:'1px solid var(--border)' }}>
                <span style={{ fontSize:24 }}>{v.icon}</span>
                <div style={{ fontSize:18, fontWeight:900, fontFamily:'var(--mono)', color:v.color||'var(--text)' }}>{v.val}</div>
                <div style={{ fontSize:10, color:'var(--muted)', fontWeight:700 }}>{v.label}</div>
                {v.sub && <div style={{ fontSize:10, fontWeight:700, color:v.color||'var(--muted)' }}>{v.sub}</div>}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label:'Total Visits', val: patientAppts.length, color:'var(--accent)' },
              { label:'Completed', val: patientAppts.filter(a=>a.status==='completed').length, color:'#10b981' },
              { label:'Prescriptions', val: allRx.length, color:'var(--indigo)' },
            ].map(s => (
              <div key={s.label} style={{ background:'var(--bg)', borderRadius:12, padding:14, textAlign:'center', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:26, fontWeight:900, fontFamily:'var(--mono)', color:s.color }}>{s.val}</div>
                <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'vitals' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {vitals.length === 0 ? <div style={{ padding:20, textAlign:'center', color:'var(--muted)' }}>No vitals recorded yet.</div> :
            vitals.slice(0,12).map(v => {
              const d = v.recordedAt?.toDate ? v.recordedAt.toDate() : new Date(v.recordedAt||0);
              return (
                <div key={v.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg)', borderRadius:10, border:'1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:.5 }}>{v.type === 'bp' ? 'Blood Pressure' : v.type}</span>
                    <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                  <span style={{ fontWeight:900, fontSize:18, fontFamily:'var(--mono)', color:v.type==='bp'&&v.systolic?bpCategory(v.systolic,v.diastolic!).color:'var(--text)' }}>
                    {v.type==='bp' ? `${v.systolic}/${v.diastolic}` : v.value} <span style={{ fontSize:12, fontWeight:600, color:'var(--muted)' }}>{v.unit}</span>
                  </span>
                </div>
              );
            })
          }
        </div>
      )}

      {tab === 'history' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:4 }}>
            {[
              { id:'visits' as const, icon:'📅', label:'Visit History' },
              { id:'records' as const, icon:'🗂️', label:'Clinical Records' },
              { id:'exam' as const, icon:'🩺', label:'History & Exam' },
            ].map(v => (
              <button key={v.id} className={`filter-chip ${historyView===v.id?'active':''}`}
                onClick={() => setHistoryView(v.id)} style={{ fontSize:10, padding:'3px 8px' }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
          {historyView === 'visits' && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {patientAppts.length === 0 ? <div style={{ padding:20, textAlign:'center', color:'var(--muted)' }}>No visit history yet.</div> :
                patientAppts.map(a => {
                  const sc = statusCfg[a.status];
                  return (
                    <div key={a.id} style={{ padding:'12px 14px', background:'var(--bg)', borderRadius:12, border:'1px solid var(--border)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13 }}>{a.specialty||'Consultation'}</div>
                          <div style={{ fontSize:11, color:'var(--muted)', fontFamily:'var(--mono)' }}>{fmtShort(a.date)}</div>
                          {a.patientNotes && <div style={{ fontSize:11, fontStyle:'italic', color:'var(--text-2)', marginTop:3 }}>"{a.patientNotes}"</div>}
                        </div>
                        <span className="status-pill" style={{ background:sc.bg, color:sc.color }}>{sc.label}</span>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}
          {historyView === 'records' && (
            <div style={{ maxHeight: 500, overflowY: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
              <ClinicalRecordSystem
                doctorId={doctorId}
                doctor={{ uid: doctorId, name: doctorName, specialty: doctorSpecialty }}
                initialPatientId={patient.uid}
              />
            </div>
          )}
          {historyView === 'exam' && (
            <div style={{ maxHeight: 500, overflowY: 'auto', borderRadius: 12, border: '1px solid var(--border)', padding: 8 }}>
              <HistoryExaminationEngine
                patient={{ uid: patient.uid, name: patient.fullName, age: patient.age, gender: patient.sex }}
                doctorId={doctorId}
                doctorName={doctorName}
                onSave={() => {}}
                onClinicalDataUpdate={() => {}}
              />
            </div>
          )}
        </div>
      )}

      {tab === 'prescriptions' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {allRx.length === 0 ? <div style={{ padding:20, textAlign:'center', color:'var(--muted)' }}>No prescriptions yet.</div> :
            allRx.map((rx:any,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', background:'var(--bg)', borderRadius:8, gap:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700 }}>💊 {rx.medication}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>{rx.dosage} · {rx.frequency} · {rx.duration}</div>
                </div>
                <div style={{ fontSize:10, color:'var(--muted)', textAlign:'right' }}>{rx.addedAt ? new Date(rx.addedAt).toLocaleDateString() : '—'}</div>
              </div>
            ))
          }
        </div>
      )}

      {tab === 'timeline' && (
        <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
          <TimelineEngine patientId={patient.uid} maxEvents={50} />
        </div>
      )}

      {tab === 'notes' && (
        <ClinicalDocumentation
          patientId={patient.uid}
          doctorId={doctorId}
          doctorName={doctorName}
          compact
        />
      )}

      {tab === 'orders' && (
        <PrescriptionTools
          patientId={patient.uid}
          doctorId={doctorId}
          doctorName={doctorName}
          compact
        />
      )}

      {tab === 'monitor' && (
        <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
            {([
              { type: 'hypertension' as const, icon: '❤️', label: 'HTN' },
              { type: 'diabetes_t2' as const, icon: '🍬', label: 'T2DM' },
              { type: 'asthma' as const, icon: '🌬️', label: 'Asthma' },
              { type: 'hiv' as const, icon: '🧬', label: 'HIV' },
              { type: 'ckd' as const, icon: '🫘', label: 'CKD' },
              { type: 'heart_failure' as const, icon: '💔', label: 'HF' },
              { type: 'copd' as const, icon: '🫁', label: 'COPD' },
              { type: 'sickle_cell' as const, icon: '🩸', label: 'SCD' },
            ]).map(d => (
              <button key={d.type}
                className={`filter-chip ${monitorDisease === d.type ? 'active' : ''}`}
                onClick={() => setMonitorDisease(d.type)}
                style={{ fontSize: 11, padding: '4px 10px' }}>
                {d.icon} {d.label}
              </button>
            ))}
          </div>
          <ChronicDiseaseMonitor
            patientId={patient.uid}
            doctorId={doctorId}
            doctorName={doctorName}
            diseaseType={monitorDisease}
            compact
          />
        </div>
      )}

      {tab === 'adherence' && (
        <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
          <MedicationAdherence
            patientId={patient.uid}
            doctorId={doctorId}
            doctorName={doctorName}
            compact
          />
        </div>
      )}

      {tab === 'labreview' && (
        <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
          <LabImagingReview
            patientId={patient.uid}
            compact
          />
        </div>
      )}

      {tab === 'education' && (
        <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
          <PatientEducation
            patientId={patient.uid}
            doctorId={doctorId}
            doctorName={doctorName}
            compact
          />
        </div>
      )}

      {tab === 'communication' && (
        <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
          <ClinicalCommunicationHub
            patientId={patient.uid}
            doctorId={doctorId}
            doctorName={doctorName}
            compact
          />
        </div>
      )}

      {tab === 'alerts' && (
        <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
          <AlertEscalationEngine
            patientId={patient.uid}
            doctorId={doctorId}
            doctorName={doctorName}
            compact
          />
        </div>
      )}

      {tab === 'tasks' && (
        <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
          <WorkflowTaskEngine
            patientId={patient.uid}
            doctorId={doctorId}
            doctorName={doctorName}
            compact
          />
        </div>
      )}
    </div>
  );
}

export default function PatientsWorkspace({ doctorId, doctorName, appointments, doctorSpecialty, onCreatePatient, patients: propPatients, dockets: propDockets, onAssignDocket }: Props) {
  const [fetchedPatients, setFetchedPatients] = useState<PatientRegistryEntry[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientRegistryEntry | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const sampleClinics = [
    { id: 'clinic1', name: 'Nairobi Medical Centre', specialty: doctorSpecialty || 'General Practice' },
    { id: 'clinic2', name: 'City Family Clinic', specialty: 'General Practice' },
  ];
  const samplePathways = [
    { id: 'hypertension', name: 'Hypertension Care', condition: 'Hypertension' },
    { id: 'diabetes_t2', name: 'Type 2 Diabetes', condition: 'Diabetes' },
    { id: 'asthma', name: 'Asthma Management', condition: 'Asthma' },
    { id: 'antenatal', name: 'Antenatal Care', condition: 'Pregnancy' },
  ];

  // Fetch patients — doctor-created + appointment-derived, real‑time
  useEffect(() => {
    if (propPatients) { setFetchedPatients(propPatients); setLoadingPatients(false); return; }

    const unsub = onSnapshot(
      query(collection(db, 'users'), where('createdBy', '==', doctorId)),
      snap => {
        const created = snap.docs.map(d => {
          const data = d.data();
          return {
            uid: d.id, fullName: data.name || 'Unknown', age: data.age, sex: data.gender,
            phone: data.phone, email: data.email || '', bloodGroup: data.bloodGroup,
            allergies: data.allergies, conditions: data.conditions || data.chronicConditions,
            riskLevel: data.riskLevel ? (data.riskLevel.charAt(0).toUpperCase() + data.riskLevel.slice(1) as any) : 'Low',
            status: data.status || 'Active', origin: data.source || 'Walk-in',
          };
        });

        const apptIds = [...new Set(appointments.map(a => a.patientId).filter(Boolean))] as string[];
        const existingIds = new Set(created.map(p => p.uid));
        const missingIds = apptIds.filter(id => !existingIds.has(id));

        if (missingIds.length === 0) { setFetchedPatients(created); setLoadingPatients(false); return; }

        Promise.all(missingIds.map(id => getDoc(doc(db, 'users', id)))).then(snaps => {
          const fromAppts = snaps.filter(s => s.exists()).map(s => {
            const d = s.data();
            return {
              uid: s.id, fullName: d.name || 'Unknown', age: d.age, sex: d.gender,
              phone: d.phone, email: d.email || '', bloodGroup: d.bloodGroup,
              allergies: d.allergies, conditions: d.conditions || d.chronicConditions,
              riskLevel: d.riskLevel ? (d.riskLevel.charAt(0).toUpperCase() + d.riskLevel.slice(1) as any) : 'Low',
              status: d.status || 'Active', origin: d.source || 'Walk-in',
            };
          });
          setFetchedPatients([...created, ...fromAppts]);
          setLoadingPatients(false);
        });
      },
      () => {
        // Fallback to appointments-based
        const ids = [...new Set(appointments.map(a => a.patientId).filter(Boolean))] as string[];
        if (!ids.length) { setFetchedPatients([]); setLoadingPatients(false); return; }
        Promise.all(ids.map(id => getDoc(doc(db, 'users', id)))).then(snaps => {
          setFetchedPatients(snaps.filter(s => s.exists()).map(s => {
            const d = s.data();
            return { uid: s.id, fullName: d.name || 'Unknown', age: d.age, sex: d.gender, phone: d.phone, email: d.email || '', bloodGroup: d.bloodGroup, allergies: d.allergies, conditions: d.conditions || d.chronicConditions, riskLevel: d.riskLevel ? (d.riskLevel.charAt(0).toUpperCase() + d.riskLevel.slice(1) as any) : 'Low', status: d.status || 'Active', origin: d.source || 'Walk-in' };
          }));
          setLoadingPatients(false);
        });
      }
    );
    return () => unsub();
  }, [doctorId, appointments, propPatients]);

  const dockets = propDockets || sampleClinics.map(c => ({ id: c.id, name: c.name }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideUp .25s ease' }}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">📋 Patient Registry</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-accent" onClick={() => setShowCreate(!showCreate)} style={{ fontSize: 11, padding: '7px 14px' }}>
              {showCreate ? '✕ Close' : '➕ Register Patient'}
            </button>
          </div>
        </div>

        {showCreate && (
          <div style={{ marginBottom: 16, padding: 16, borderRadius: 14, border: '2px solid var(--accent-dim)', background: 'var(--surface)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>➕ New Patient Registration</div>
            <PatientCreateModal
              onClose={() => setShowCreate(false)}
              onCreatePatient={onCreatePatient || (async () => null)}
              clinics={sampleClinics}
              pathways={samplePathways}
              doctorSpecialty={doctorSpecialty || 'General Practice'}
            />
          </div>
        )}

        <PatientRegistryTable
          patients={fetchedPatients}
          dockets={dockets}
          onSelectPatient={setSelectedPatient}
          onAssignDocket={onAssignDocket || (() => {})}
          loading={loadingPatients}
        />

        {/* Inline patient detail — no modal, no portal */}
        {selectedPatient && (
          <PatientDetailInline
            patient={selectedPatient}
            doctorId={doctorId}
            doctorName={doctorName}
            doctorSpecialty={doctorSpecialty}
            appointments={appointments}
            onClose={() => setSelectedPatient(null)}
          />
        )}
      </div>
    </div>
  );
}
