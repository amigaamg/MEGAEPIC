'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/firebase/authService';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, getDoc, doc } from 'firebase/firestore';

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#070B14;color:#E2E8F0;font-family:'Inter',sans-serif}
  .bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse at 50% 20%,black 30%,transparent 70%)}
  .page{position:relative;z-index:1;min-height:100vh;padding:0 5%;max-width:1200px;margin:0 auto}
  .top-bar{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:24px}
  .top-left{display:flex;align-items:center;gap:12px}
  .back-btn{padding:8px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.06);color:#94A3B8;font-size:.8125rem;text-decoration:none;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif}
  .back-btn:hover{background:rgba(255,255,255,.04);color:#E2E8F0}
  h1{font-size:1.5rem;font-weight:700;color:#F1F5F9}
  .sub{color:#64748B;font-size:.875rem;margin-bottom:24px}
  .search-bar{width:100%;padding:12px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#E2E8F0;font-size:.875rem;outline:none;margin-bottom:20px;font-family:'Inter',sans-serif}
  .search-bar:focus{border-color:rgba(6,182,212,.3);box-shadow:0 0 20px rgba(6,182,212,.05)}
  .patient-row{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);margin-bottom:6px;cursor:pointer;transition:all .15s}
  .patient-row:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);transform:translateX(4px)}
  .patient-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#06B6D4,#0891B2);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.875rem;color:#fff;flex-shrink:0}
  .patient-info{flex:1;min-width:0}
  .patient-name{font-size:.875rem;font-weight:600;color:#E2E8F0}
  .patient-meta{font-size:.75rem;color:#64748B;margin-top:2px;display:flex;gap:6px;flex-wrap:wrap}
  .patient-tag{font-size:.625rem;padding:1px 6px;border-radius:3px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);color:#475569}
  .patient-arrow{color:#334155;font-size:.75rem;flex-shrink:0}
  .empty{text-align:center;padding:60px 20px;color:#475569;font-size:.875rem;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:rgba(255,255,255,.02)}
  .empty-icon{font-size:2rem;margin-bottom:12px}
  .stats-row{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
  .stat-chip{padding:6px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);font-size:.75rem;color:#94A3B8}
  .stat-chip strong{color:#E2E8F0;font-family:'JetBrains Mono',monospace}
  @media(max-width:600px){
    .top-bar{flex-wrap:wrap;gap:8px}
  }
`;

interface PatientRecord {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: number;
  phone?: string;
  diagnosis?: string;
  status?: string;
}

export default function PatientsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { if (!loading && !user) router.replace('/clinical-auth'); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then(p => {
      if (!p) return;
      const oid = (p as any).activeOrganizationId || (p as any).organizations?.[0];
      if (oid) setOrgId(oid);
    });
  }, [user]);

  useEffect(() => {
    if (!orgId) return;
    const q = query(collection(db, 'organizations', orgId, 'patients'), orderBy('name'));
    const unsub = onSnapshot(q, (snap) => {
      const list: PatientRecord[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as PatientRecord));
      setPatients(list);
    });
    return () => unsub();
  }, [orgId]);

  const filtered = search
    ? patients.filter(p => {
        const name = (p.name || '').toLowerCase();
        const fname = (p.firstName || '').toLowerCase();
        const lname = (p.lastName || '').toLowerCase();
        const q = search.toLowerCase();
        return name.includes(q) || fname.includes(q) || lname.includes(q) || p.id?.toLowerCase().includes(q);
      })
    : patients;

  if (loading || !user) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="bg-grid" />
      <div className="page">
        <div className="top-bar">
          <div className="top-left">
            <span className="back-btn" onClick={() => router.back()}>← Back</span>
            <h1>Patient Records</h1>
          </div>
          <span className="back-btn" onClick={() => router.push('/workspace')}>Clinical Workspace →</span>
        </div>

        <div className="stats-row">
          <span className="stat-chip"><strong>{patients.length}</strong> total patients</span>
          {!orgId && <span className="stat-chip" style={{ color: '#F59E0B' }}>⚠️ No organization linked</span>}
        </div>

        <p className="sub">
          Search, view, and manage all patient records across departments.
        </p>

        <input
          className="search-bar"
          placeholder="Search by patient name, ID, or diagnosis..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {!orgId ? (
          <div className="empty">
            <div className="empty-icon">🏥</div>
            <div>No organization linked to your account</div>
            <div style={{ marginTop: 8, fontSize: '.75rem', color: '#334155' }}>
              Register or join a facility to access patient records
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📁</div>
            <div>{search ? 'No patients match your search' : 'No patients found'}</div>
            <div style={{ marginTop: 8, fontSize: '.75rem', color: '#334155' }}>
              {search ? 'Try a different search term' : 'Admit your first patient to see records here'}
            </div>
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} className="patient-row" onClick={() => router.push(`/patients/${p.id}/wall`)}>
              <div className="patient-avatar">{(p.firstName?.[0] || p.name?.[0] || '?')}</div>
              <div className="patient-info">
                <div className="patient-name">{p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown Patient'}</div>
                <div className="patient-meta">
                  {p.gender && <span className="patient-tag">{p.gender}</span>}
                  {p.age != null && <span className="patient-tag">{p.age} yrs</span>}
                  {p.phone && <span className="patient-tag">📞 {p.phone}</span>}
                  {p.diagnosis && <span className="patient-tag">{p.diagnosis.slice(0, 30)}</span>}
                </div>
              </div>
              <span className="patient-arrow">→</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
