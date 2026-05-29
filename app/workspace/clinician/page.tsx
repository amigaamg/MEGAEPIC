'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/firebase/authService';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, getDoc, doc } from 'firebase/firestore';
import type { ClinicianProfile } from '@/lib/firebase/authService';

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:#070B14;color:#E2E8F0;overflow-x:hidden}
  .bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse at 50% 20%,black 30%,transparent 70%)}
  .page{position:relative;z-index:1;padding:32px 5%;max-width:1200px;margin:0 auto}
  .welcome{font-size:1.25rem;font-weight:700;color:#F1F5F9;margin-bottom:4px}
  .welcome-sub{font-size:.8125rem;color:#64748B;margin-bottom:24px}
  .stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:32px}
  .stat-card{padding:16px;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02)}
  .stat-val{font-size:1.25rem;font-weight:700;color:#F1F5F9;font-family:'JetBrains Mono',monospace}
  .stat-lbl{font-size:.625rem;color:#475569;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
  .section-label{font-size:.6875rem;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;margin-top:24px;display:flex;align-items:center;gap:8px}
  .section-label:first-child{margin-top:0}
  .card-list{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .action-card{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s}
  .action-card:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);transform:translateY(-2px)}
  .action-icon{font-size:1.25rem;flex-shrink:0}
  .action-info{flex:1}
  .action-title{font-size:.8125rem;font-weight:600;color:#E2E8F0}
  .action-desc{font-size:.6875rem;color:#64748B;margin-top:1px}
  .patient-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);margin-bottom:6px;cursor:pointer;transition:all .15s}
  .patient-row:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);transform:translateX(4px)}
  .patient-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#06B6D4,#0891B2);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.75rem;color:#fff;flex-shrink:0}
  .patient-info{flex:1;min-width:0}
  .patient-name{font-size:.8125rem;font-weight:600;color:#E2E8F0}
  .patient-meta{font-size:.6875rem;color:#64748B;margin-top:1px}
  .empty{text-align:center;padding:40px;color:#475569;font-size:.8125rem;border:1px solid rgba(255,255,255,.06);border-radius:10px}
  .encounter-chip{font-size:.625rem;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,.03);color:#64748B;margin-left:8px}
  @media(max-width:600px){
    .card-list{grid-template-columns:1fr}
    .stat-grid{grid-template-columns:1fr 1fr}
  }
`;

const isToday = (ts: any) => {
  if (!ts) return false;
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toDateString() === new Date().toDateString();
};

interface PatientSummary {
  id: string;
  name: string;
  diagnosis?: string;
  encounterType?: string;
  encounterId?: string;
  deptId?: string;
  unitId?: string;
}

export default function ClinicianDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ClinicianProfile | null>(null);
  const [encounterCount, setEncounterCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [activePatients, setActivePatients] = useState<PatientSummary[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/clinical-auth');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(p => {
        if (p && p.accountType !== 'clinician') {
          router.replace('/workspace/facility');
        } else {
          const cp = p as ClinicianProfile;
          setProfile(cp);
          if (cp.activeOrganizationId) setOrgId(cp.activeOrganizationId);
          if (cp.organizations?.length > 0 && !cp.activeOrganizationId) {
            setOrgId(cp.organizations[0]);
          }
        }
      });
    }
  }, [user, router]);

  useEffect(() => {
    if (!orgId || !user) return;
    const encQuery = query(
      collection(db, 'organizations', orgId, 'encounters'),
      where('participants', 'array-contains', user.uid)
    );
    const unsub = onSnapshot(encQuery, (snap) => {
      let active = 0;
      let completed = 0;
      let todayDone = 0;
      const patients: PatientSummary[] = [];
      const seen = new Set<string>();

      snap.docs.forEach(d => {
        const data = d.data();
        if (data.status === 'active') active++;
        if (data.status === 'completed') completed++;
        if (data.status === 'completed' && isToday(data.createdAt)) todayDone++;
        if (data.patientId && !seen.has(data.patientId) && data.status === 'active') {
          seen.add(data.patientId);
          patients.push({
            id: data.patientId,
            name: data.patientName || 'Patient',
            diagnosis: data.diagnosis?.[0] || '',
            encounterType: data.encounterType,
            encounterId: data.id || d.id,
            deptId: data.departmentId || data.deptId,
            unitId: data.unitId,
          });
        }
      });

      setEncounterCount(snap.docs.length);
      setActiveCount(active);
      setCompletedToday(todayDone);
      setActivePatients(patients);
    });
    return () => unsub();
  }, [orgId, user]);

  if (loading || !user) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="bg-grid" />
      <div className="page">
        <div className="welcome">
          Welcome, {profile?.displayName || user.displayName || 'Clinician'}
        </div>
        <div className="welcome-sub">
          {profile?.clinicianRole?.replace(/_/g, ' ')} · {profile?.specialty || 'No specialty set'}
          {orgId ? ' · Live' : ''}
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-val">{activePatients.length}</div>
            <div className="stat-lbl">Active Patients</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{encounterCount}</div>
            <div className="stat-lbl">Total Encounters</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{ color: '#10B981' }}>{completedToday}</div>
            <div className="stat-lbl">Completed Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-val" style={{ color: '#F59E0B' }}>{activeCount}</div>
            <div className="stat-lbl">Active Now</div>
          </div>
        </div>

        <div className="section-label">⚡ Quick Actions</div>
        <div className="card-list">
          <div className="action-card" onClick={() => router.push('/workspace/departments')}>
            <span className="action-icon">🏥</span>
            <div className="action-info">
              <div className="action-title">All Departments</div>
              <div className="action-desc">Browse all departments, units, and start new encounters</div>
            </div>
          </div>
          <div className="action-card" onClick={() => router.push('/patients')}>
            <span className="action-icon">📁</span>
            <div className="action-info">
              <div className="action-title">Patient Records</div>
              <div className="action-desc">Search and manage patient records</div>
            </div>
          </div>
          <div className="action-card" onClick={() => router.push('/workspace/departments')}>
            <span className="action-icon">➕</span>
            <div className="action-info">
              <div className="action-title">New Encounter</div>
              <div className="action-desc">Select a department and unit to start a new encounter</div>
            </div>
          </div>
          <div className="action-card" onClick={() => router.push('/clinical-intelligence')}>
            <span className="action-icon">🧠</span>
            <div className="action-info">
              <div className="action-title">Clinical AI</div>
              <div className="action-desc">AI-assisted clinical decision support</div>
            </div>
          </div>
        </div>

        <div className="section-label" style={{ marginTop: 32 }}>🩺 Your Active Patients</div>
        {activePatients.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: '1.25rem', marginBottom: 8 }}>👤</div>
            <div>No active patients assigned</div>
            <div style={{ fontSize: '.6875rem', color: '#334155', marginTop: 4 }}>
              Patients will appear here once encounters are created and assigned to you
            </div>
          </div>
        ) : (
          activePatients.map(p => (
            <div key={p.id} className="patient-row" onClick={() => {
              if (p.deptId && p.unitId && p.encounterType) {
                router.push(`/workspace/${p.deptId}/${p.unitId}/${p.encounterType}`);
              } else if (p.encounterId) {
                router.push(`/patients/${p.id}/wall`);
              } else {
                router.push(`/patients/${p.id}/wall`);
              }
            }}>
              <div className="patient-avatar">{p.name[0]}</div>
              <div className="patient-info">
                <div className="patient-name">{p.name}</div>
                <div className="patient-meta">
                  {p.diagnosis && <span>{p.diagnosis}</span>}
                  {p.encounterType && <span className="encounter-chip">{p.encounterType.replace(/_/g, ' ')}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
