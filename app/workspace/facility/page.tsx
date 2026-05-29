'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/firebase/authService';
import { getOrganization } from '@/lib/firebase/organizationService';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import type { FacilityProfile } from '@/lib/firebase/authService';
import type { Organization } from '@/lib/firebase/organizationService';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:#070B14;color:#E2E8F0;overflow-x:hidden}
  .bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse at 50% 20%,black 30%,transparent 70%)}
  .page{position:relative;z-index:1;padding:32px 5%;max-width:1200px;margin:0 auto}
  .facility-head{display:flex;align-items:flex-start;gap:16px;margin-bottom:24px}
  .facility-icon{width:48px;height:48px;border-radius:12px;background:rgba(99,102,241,.15);color:#818CF8;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0}
  .facility-info{flex:1}
  .facility-name{font-size:1.25rem;font-weight:700;color:#F1F5F9}
  .facility-meta{font-size:.75rem;color:#64748B;margin-top:2px;display:flex;gap:8px;flex-wrap:wrap}
  .facility-meta span{padding:2px 8px;border-radius:4px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.04)}
  .stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:32px}
  .stat-card{padding:16px;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02)}
  .stat-val{font-size:1.25rem;font-weight:700;color:#F1F5F9;font-family:'JetBrains Mono',monospace}
  .stat-lbl{font-size:.625rem;color:#475569;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
  .section-label{font-size:.6875rem;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;margin-top:24px;display:flex;align-items:center;gap:8px}
  .card-list{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .action-card{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s}
  .action-card:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);transform:translateY(-2px)}
  .action-icon{font-size:1.25rem;flex-shrink:0}
  .action-info{flex:1}
  .action-title{font-size:.8125rem;font-weight:600;color:#E2E8F0}
  .action-desc{font-size:.6875rem;color:#64748B;margin-top:1px}
  .dept-grid{display:flex;flex-wrap:wrap;gap:6px}
  .dept-chip{padding:6px 12px;border-radius:6px;font-size:.75rem;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);color:#94A3B8;cursor:pointer;transition:all .15s}
  .dept-chip:hover{background:rgba(255,255,255,.04);color:#E2E8F0}
  .empty{text-align:center;padding:40px;color:#475569;font-size:.8125rem;border:1px solid rgba(255,255,255,.06);border-radius:10px}
  .encounter-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);margin-bottom:6px;cursor:pointer;transition:all .15s}
  .encounter-row:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1)}
  .encounter-patient{flex:1;min-width:0}
  .encounter-patient-name{font-size:.8125rem;font-weight:600;color:#E2E8F0}
  .encounter-meta{font-size:.6875rem;color:#64748B}
  @media(max-width:600px){
    .card-list{grid-template-columns:1fr}
    .stat-grid{grid-template-columns:1fr 1fr}
  }
`;

export default function FacilityDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<FacilityProfile | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [activeEncounters, setActiveEncounters] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [todayPatients, setTodayPatients] = useState(0);
  const [activeStaff, setActiveStaff] = useState(0);
  const [recentEncounters, setRecentEncounters] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace('/clinical-auth');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(async (p) => {
        if (p && p.accountType !== 'facility') {
          router.replace('/workspace/clinician');
          return;
        }
        const fp = p as FacilityProfile;
        setProfile(fp);
        const oid = fp.activeOrganizationId || fp.organizations?.[0];
        if (oid) {
          setOrgId(oid);
          const o = await getOrganization(oid);
          setOrg(o);
          const depts = o?.departments;
          setDepartments(depts && depts.length > 0 ? depts : Object.keys(DEPARTMENTS));
        }
      });
    }
  }, [user, router]);

  useEffect(() => {
    if (!orgId) return;
    const unsub = onSnapshot(collection(db, 'organizations', orgId, 'encounters'), (snap) => {
      let active = 0;
      let today = 0;
      const recent: any[] = [];
      const todayStr = new Date().toDateString();
      snap.forEach(d => {
        const data = d.data();
        if (data.status === 'active') active++;
        const created = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || 0);
        if (created.toDateString() === todayStr) today++;
        recent.push({ id: d.id, ...data });
      });
      setActiveEncounters(active);
      setTodayPatients(today);
      setRecentEncounters(recent.sort((a, b) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const db2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return db2.getTime() - da.getTime();
      }).slice(0, 10));
    });
    return () => unsub();
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    const unsub = onSnapshot(collection(db, 'organizations', orgId, 'patients'), (snap) => {
      setTotalPatients(snap.docs.length);
    });
    return () => unsub();
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    const unsub = onSnapshot(collection(db, 'organizations', orgId, 'members'), (snap) => {
      const active = snap.docs.filter(d => d.data().isActive !== false);
      setActiveStaff(active.length);
    });
    return () => unsub();
  }, [orgId]);

  if (loading || !user) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="bg-grid" />
      <div className="page">
        <div className="facility-head">
          <div className="facility-icon">🏥</div>
          <div className="facility-info">
            <div className="facility-name">{org?.name || profile?.facilityName || 'Facility Dashboard'}</div>
            <div className="facility-meta">
              {org?.type && <span>{org.type.replace(/_/g, ' ')}</span>}
              {profile?.country && <span>{profile.country}</span>}
              {org && <span>{departments.length} depts</span>}
              {orgId && <span style={{ color: '#10B981' }}>● Live</span>}
            </div>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-val">{activeEncounters}</div>
            <div className="stat-lbl">Active Encounters</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{todayPatients}</div>
            <div className="stat-lbl">Patients Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{departments.length}</div>
            <div className="stat-lbl">Departments</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{activeStaff}</div>
            <div className="stat-lbl">Active Staff</div>
          </div>
        </div>

        <div className="section-label">⚡ Operations</div>
        <div className="card-list">
          <div className="action-card" onClick={() => router.push('/workspace/departments')}>
            <span className="action-icon">🏥</span>
            <div className="action-info">
              <div className="action-title">All Departments</div>
              <div className="action-desc">Browse and manage all departments, units, and clinical workflows</div>
            </div>
          </div>
          <div className="action-card" onClick={() => router.push('/patients')}>
            <span className="action-icon">📁</span>
            <div className="action-info">
              <div className="action-title">Patient Records</div>
              <div className="action-desc">Access all facility patient records ({totalPatients})</div>
            </div>
          </div>
          <div className="action-card" onClick={() => router.push('/workspace')}>
            <span className="action-icon">📊</span>
            <div className="action-info">
              <div className="action-title">Analytics</div>
              <div className="action-desc">Clinical operations and performance analytics</div>
            </div>
          </div>
          <div className="action-card" onClick={() => router.push('/workspace')}>
            <span className="action-icon">⚙️</span>
            <div className="action-info">
              <div className="action-title">Facility Settings</div>
              <div className="action-desc">Configure departments, staff, and permissions</div>
            </div>
          </div>
        </div>

        {departments.length > 0 && (
          <>
            <div className="section-label" style={{ marginTop: 32 }}>🏛️ Departments</div>
            <div className="dept-grid">
              {departments.map(d => {
                const key = d.toUpperCase().replace(/\s+/g, '_');
                const deptInfo = DEPARTMENTS[key as keyof typeof DEPARTMENTS];
                return (
                  <span key={d} className="dept-chip" onClick={() => router.push(`/workspace/${key}`)}>
                    {deptInfo ? `${deptInfo.icon} ${deptInfo.label}` : d}
                  </span>
                );
              })}
            </div>
          </>
        )}

        <div className="section-label" style={{ marginTop: 32 }}>🩺 Recent Encounters</div>
        {recentEncounters.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: '1.25rem', marginBottom: 8 }}>🏥</div>
            <div>No active clinical operations</div>
            <div style={{ fontSize: '.6875rem', color: '#334155', marginTop: 4 }}>
              Encounters and admissions will appear here once clinicians begin working
            </div>
            <div style={{ marginTop: 12 }}>
              <span className="action-card" style={{ display: 'inline-flex' }} onClick={() => router.push('/workspace/departments')}>
                <span className="action-title">Go to All Departments →</span>
              </span>
            </div>
          </div>
        ) : (
          recentEncounters.slice(0, 5).map(enc => (
            <div key={enc.id} className="encounter-row"
              onClick={() => {
                const dept = enc.departmentId || enc.deptId || 'PAED';
                const unit = enc.unitId || 'general';
                const type = enc.encounterType || 'outpatient';
                router.push(`/workspace/${dept}/${unit}/${type}`);
              }}>
              <div className="encounter-patient">
                <div className="encounter-patient-name">{enc.patientName || 'Patient'}</div>
                <div className="encounter-meta">
                  {enc.encounterType?.replace(/_/g, '')} · {enc.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
