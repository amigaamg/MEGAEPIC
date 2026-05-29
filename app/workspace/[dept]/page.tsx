'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/firebase/authService';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import { ENCOUNTER_LABELS, CLINICAL_PATHWAYS } from '@/lib/encounterTypes';
import { WORKSPACE_DATA, type UnitInfo, type DepartmentInfo } from '@/lib/workspaceData';
import { getDiseasesForDept } from '@/lib/amexan/departments';

const CSS = (color: string) => `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:#070B14;color:#E2E8F0;overflow-x:hidden}
  body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background-image:radial-gradient(circle at 25% 25%,rgba(99,102,241,.06) 0%,transparent 50%),radial-gradient(circle at 75% 75%,rgba(6,182,212,.04) 0%,transparent 50%)}
  .page{position:relative;z-index:1;min-height:100vh}
  .bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse at 50% 20%,black 30%,transparent 80%)}
  .top-bar{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 5%;height:64px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(7,11,20,.88);backdrop-filter:blur(20px)}
  .back-btn{display:flex;align-items:center;gap:.5rem;padding:.5rem 1rem;border-radius:8px;border:1px solid rgba(255,255,255,.06);background:transparent;color:#94A3B8;font-size:.8125rem;text-decoration:none;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
  .back-btn:hover{background:rgba(255,255,255,.04);color:#E2E8F0}
  .dept-header{position:relative;padding:48px 5% 32px;overflow:hidden}
  .dept-header::after{content:'';position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,${color}15,transparent 60%);pointer-events:none}
  .dept-header-inner{max-width:1200px;margin:0 auto;position:relative;z-index:1}
  .dept-id{display:flex;align-items:flex-start;gap:1rem;margin-bottom:1rem}
  .dept-id-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0}
  .dept-id-info{flex:1}
  .dept-id-name{font-size:clamp(1.375rem,2.5vw,1.875rem);font-weight:700;color:#F1F5F9;letter-spacing:-.02em}
  .dept-id-sub{font-size:.875rem;color:#64748B;margin-top:4px;max-width:600px;line-height:1.6}
  .dept-stats{display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem}
  .dept-stat{display:flex;align-items:center;gap:.5rem;padding:.5rem 1rem;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);min-width:120px}
  .dept-stat-val{font-size:1.25rem;font-weight:700;color:#F1F5F9;font-family:'JetBrains Mono',monospace}
  .dept-stat-lbl{font-size:.625rem;color:#475569;text-transform:uppercase;letter-spacing:.06em}
  .content{max-width:1200px;margin:0 auto;padding:0 5% 60px}
  .section-label{display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;margin-top:2rem}
  .section-label-text{font-size:.6875rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#475569}
  .section-label-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)}
  .quick-actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.5rem}
  .qa-btn{display:flex;align-items:center;gap:.4rem;padding:.55rem 1.1rem;border-radius:8px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);color:#94A3B8;font-size:.75rem;text-decoration:none;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;white-space:nowrap}
  .qa-btn:hover{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:#E2E8F0}
  .qa-btn.primary{background:${color};color:#070B14;border-color:${color};font-weight:600}
  .qa-btn.primary:hover{opacity:.9}
  .qa-btn.patients{background:#6366f1;color:#fff;border-color:#6366f1;font-weight:600}
  .qa-btn.patients:hover{background:#818cf8}
  .unit-row{display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;border-radius:12px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);margin-bottom:.5rem;cursor:pointer;transition:all .25s}
  .unit-row:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);transform:translateX(4px)}
  .unit-icon{font-size:1.375rem;flex-shrink:0}
  .unit-info{flex:1;min-width:0}
  .unit-name{font-size:.875rem;font-weight:600;color:#F1F5F9}
  .unit-desc{font-size:.75rem;color:#64748B;margin-top:2px}
  .unit-meta{display:flex;align-items:center;gap:8px;flex-shrink:0}
  .unit-cases{font-size:.75rem;color:#475569;padding:3px 8px;border-radius:6px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.04);font-family:'JetBrains Mono',monospace}
  .encounter-chips{display:flex;gap:.3rem;flex-wrap:wrap;margin-top:6px}
  .enc-chip{display:inline-flex;align-items:center;gap:.25rem;padding:.2rem .55rem;border-radius:4px;font-size:.625rem;border:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.02);color:#64748B;text-decoration:none;transition:all .15s;cursor:pointer}
  .enc-chip:hover{background:${color}15;border-color:${color}25;color:${color}}
  .empty-state{text-align:center;padding:40px 20px;color:#475569;font-size:.8125rem;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:rgba(255,255,255,.02)}
  .encounter-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);margin-bottom:6px;cursor:pointer;transition:all .15s}
  .encounter-row:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);transform:translateX(4px)}
  .encounter-patient{flex:1;min-width:0}
  .encounter-patient-name{font-size:.8125rem;font-weight:600;color:#E2E8F0}
  .encounter-meta{font-size:.6875rem;color:#64748B}
  @media(max-width:768px){
    .dept-header{padding:32px 5% 24px}
    .dept-stats{gap:.5rem}
    .dept-stat{min-width:0;flex:1}
    .unit-row{flex-wrap:wrap;gap:.5rem}
    .unit-meta{width:100%}
  }
`;

interface UnitData {
  id: string;
  label: string;
  description: string;
  icon: string;
  encounterTypes: string[];
  activeCases?: number;
}

interface EncounterItem {
  id: string;
  patientName: string;
  patientId: string;
  encounterType: string;
  unitId: string;
  status: string;
}

export default function DepartmentPage() {
  const raw = useParams();
  const params = raw || {};
  const deptKey = typeof params.dept === 'string' ? params.dept.toUpperCase() : '';
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [units, setUnits] = useState<UnitData[]>([]);
  const [activeEncounters, setActiveEncounters] = useState<EncounterItem[]>([]);

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
    if (!deptKey) return;

    function loadFallback() {
      const deptData = WORKSPACE_DATA.find(d => d.key === deptKey);
      if (deptData) {
        setUnits(deptData.units.map(u => ({
          id: u.id,
          label: u.label,
          description: u.description,
          icon: u.icon,
          encounterTypes: u.encounterTypes.map((et: any) => typeof et === 'string' ? et : et.type),
          activeCases: u.activeCases,
        })));
      }
    }

    if (!orgId) {
      loadFallback();
      return;
    }

    const unsub = onSnapshot(collection(db, 'organizations', orgId, 'departments', deptKey, 'units'), (snap) => {
      const list: UnitData[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as UnitData));
      if (list.length > 0) {
        setUnits(list);
      } else {
        loadFallback();
      }
    });
    return () => unsub();
  }, [orgId, deptKey]);

  useEffect(() => {
    if (!orgId || !deptKey) return;
    const q = query(
      collection(db, 'organizations', orgId, 'encounters'),
      where('departmentId', '==', deptKey),
      where('status', '==', 'active')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: EncounterItem[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as EncounterItem));
      setActiveEncounters(list);
    });
    return () => unsub();
  }, [orgId, deptKey]);

  if (loading || !user) return null;

  const deptInfo = DEPARTMENTS[deptKey];
  if (!deptInfo) {
    return (
      <>
        <style>{CSS('#6366f1')}</style>
        <div className="page">
          <div className="bg-grid" />
          <nav className="top-bar">
          <span className="back-btn" onClick={() => router.push('/workspace/departments')}>← All Departments</span>
          </nav>
          <div className="empty-state" style={{ maxWidth: 400, margin: '120px auto' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
            <div style={{ color: '#E2E8F0', fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Department Not Found</div>
            <div>&ldquo;{deptKey}&rdquo; does not exist.</div>
            <span className="back-btn" style={{ display: 'inline-flex', marginTop: 16 }} onClick={() => router.push('/workspace/departments')}>← All Departments</span>
          </div>
        </div>
      </>
    );
  }

  const color = deptInfo.color;
  const firstUnit = units[0];
  const firstEncType = firstUnit?.encounterTypes?.[0] || 'outpatient';

  return (
    <>
      <style>{CSS(color)}</style>
      <div className="bg-grid" />
      <div className="page">
        <nav className="top-bar">
          <span className="back-btn" onClick={() => router.push('/workspace')}>← All Departments</span>
        </nav>

        <section className="dept-header">
          <div className="dept-header-inner">
            <div className="dept-id">
              <div className="dept-id-icon" style={{ background: `${color}18`, color }}>{deptInfo.icon}</div>
              <div className="dept-id-info">
                <div className="dept-id-name">{deptInfo.label}</div>
                <div className="dept-id-sub">{deptInfo.label} department — realtime operational view</div>
                <div className="dept-stats">
                  <div className="dept-stat">
                    <span className="dept-stat-val" style={{ color }}>{activeEncounters.length}</span>
                    <div><div className="dept-stat-lbl">Active Cases</div></div>
                  </div>
                  <div className="dept-stat">
                    <span className="dept-stat-val" style={{ color }}>{units.length}</span>
                    <div><div className="dept-stat-lbl">Units</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="content">
          <div className="quick-actions">
            <span className="qa-btn patients" onClick={() => router.push('/patients')}>📁 Patient Records</span>
            <span className="qa-btn primary" onClick={() => {
              if (firstUnit) router.push(`/workspace/${deptKey}/${firstUnit.id}/${firstEncType}`);
            }}>+ New Encounter</span>
            <span className="qa-btn" onClick={() => {
              if (firstUnit) router.push(`/workspace/${deptKey}/${firstUnit.id}/inpatient`);
            }}>📋 Admit Patient</span>
            <span className="qa-btn" onClick={() => {
              if (firstUnit) router.push(`/workspace/${deptKey}/${firstUnit.id}/operative_note`);
            }}>📄 Operative Note</span>
            <span className="qa-btn" onClick={() => {
              if (firstUnit) router.push(`/workspace/${deptKey}/${firstUnit.id}/emergency`);
            }}>🚨 Trauma Activation</span>
            <span className="qa-btn" onClick={() => {
              if (firstUnit) router.push(`/workspace/${deptKey}/${firstUnit.id}/mdt_review`);
            }}>👥 MDT Review</span>
            <span className="qa-btn" onClick={() => router.push(`/workspace/${deptKey}`)}>📊 Refresh</span>
          </div>

          <div className="section-label">
            <span className="section-label-text">Clinical Units & Services</span>
            <span className="section-label-line" />
          </div>

          {units.length === 0 ? (
            <div className="empty-state" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '1.25rem', marginBottom: 8 }}>🏥</div>
              <div>No units configured for {deptInfo.label}</div>
              <div style={{ fontSize: '.6875rem', color: '#334155', marginTop: 4 }}>
                Units will appear once the facility completes setup
              </div>
            </div>
          ) : (
            units.map((unit, i) => (
              <div key={unit.id} className="unit-row" onClick={() => router.push(`/workspace/${deptKey}/${unit.id}`)} style={{ animationDelay: `${i * 0.04}s` }}>
                <span className="unit-icon">{unit.icon}</span>
                <div className="unit-info">
                  <div className="unit-name">{unit.label}</div>
                  <div className="unit-desc">{unit.description}</div>
                  <div className="encounter-chips">
                    {(unit.encounterTypes || []).slice(0, 5).map((et: string) => {
                      const info = ENCOUNTER_LABELS[et as keyof typeof ENCOUNTER_LABELS];
                      return (
                        <span key={et} className="enc-chip" onClick={(e) => { e.stopPropagation(); router.push(`/workspace/${deptKey}/${unit.id}/${et}`); }}>
                          {info?.icon} {info?.label || et}
                        </span>
                      );
                    })}
                    {(unit.encounterTypes || []).length > 5 && <span className="enc-chip">+{(unit.encounterTypes || []).length - 5}</span>}
                  </div>
                </div>
                <div className="unit-meta">
                  <span className="unit-cases">{activeEncounters.filter(e => e.unitId === unit.id).length} active</span>
                </div>
              </div>
            ))
          )}

          <div className="section-label" style={{ marginTop: '2rem' }}>
            <span className="section-label-text">Disease Intelligence Library · {getDiseasesForDept(deptKey).length} diseases</span>
            <span className="section-label-line" />
          </div>
          {(() => {
            const diseases = getDiseasesForDept(deptKey);
            return diseases.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '6px', marginBottom: '1rem' }}>
                {diseases.map(d => (
                  <div key={d.id} className="pathway-card" style={{ cursor: 'pointer', margin: 0 }}
                    onClick={() => {
                      const unit = units.find(u => u.id === d.subspecialtyId);
                      if (unit) router.push(`/workspace/${deptKey}/${unit.id}/outpatient?disease=${d.id}`);
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span className="pathway-name" style={{ fontSize: '.75rem' }}>{d.name}</span>
                      <span style={{ fontSize: '.5625rem', color: '#475569', fontFamily: "'JetBrains Mono',monospace" }}>{d.icd10}</span>
                    </div>
                    <div className="pathway-tags">
                      <span className="pathway-tag">{d.subspecialtyId}</span>
                      <span className="pathway-tag">{d.differentials.length} DDx</span>
                      <span className="pathway-tag">{d.treatmentGuidelines.length} Tx</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: 8 }}>📚</div>
                <div>No disease intelligence loaded for this department</div>
                <div style={{ fontSize: '.6875rem', color: '#334155', marginTop: 4 }}>
                  Available for: PAED (13), IM (4), CARD (4), NEURO (3), OB (3), PSYCH (4)
                </div>
              </div>
            );
          })()}

          <div className="section-label" style={{ marginTop: '2rem' }}>
            <span className="section-label-text">Active Cases</span>
            <span className="section-label-line" />
          </div>

          {activeEncounters.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '1.25rem', marginBottom: 8 }}>📋</div>
              <div>No active encounters in this department</div>
              <div style={{ fontSize: '.6875rem', color: '#334155', marginTop: 4 }}>
                Start a new encounter or check back when patients are admitted
              </div>
              {firstUnit && (
                <span className="qa-btn primary" style={{ display: 'inline-flex', marginTop: 12 }}
                  onClick={() => router.push(`/workspace/${deptKey}/${firstUnit.id}/${firstEncType}`)}>
                  + New Encounter
                </span>
              )}
            </div>
          ) : (
            activeEncounters.map(enc => (
              <div key={enc.id} className="encounter-row"
                onClick={() => router.push(`/workspace/${deptKey}/${enc.unitId}/${enc.encounterType}`)}>
                <div className="encounter-patient">
                  <div className="encounter-patient-name">{enc.patientName || 'Unnamed Patient'}</div>
                  <div className="encounter-meta">
                    {enc.encounterType?.replace(/_/g, ' ')} · {enc.unitId?.replace(/-/g, ' ')}
                  </div>
                </div>
                <span className="qa-btn" style={{ fontSize: '.625rem', padding: '3px 10px' }}>Open →</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
