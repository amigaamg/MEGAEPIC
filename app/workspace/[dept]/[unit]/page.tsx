'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDepartment, getUnit } from '@/lib/workspaceData';
import { ENCOUNTER_LABELS, CLINICAL_PATHWAYS } from '@/lib/encounterTypes';
import { getDiseasesForUnit } from '@/lib/amexan/departments';
import { useAuth } from '@/context/AuthContext';

const CSS = (color: string) => `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:#070B14;color:#E2E8F0;overflow-x:hidden}
  .page{position:relative;z-index:1;min-height:100vh}
  .bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse at 50% 20%,black 30%,transparent 80%)}
  .top-bar{position:sticky;top:0;z-index:100;display:flex;align-items:center;padding:0 5%;height:60px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(7,11,20,.88);backdrop-filter:blur(20px)}
  .back-btn{display:flex;align-items:center;gap:.4rem;padding:.4rem .9rem;border-radius:6px;border:1px solid rgba(255,255,255,.06);background:transparent;color:#94A3B8;font-size:.75rem;text-decoration:none;cursor:pointer;font-family:'Inter',sans-serif}
  .back-btn:hover{background:rgba(255,255,255,.04);color:#E2E8F0}
  .top-right{display:flex;align-items:center;gap:.5rem;margin-left:auto}

  .unit-header{position:relative;padding:32px 5% 24px;overflow:hidden}
  .unit-header::after{content:'';position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,${color}12,transparent 60%);pointer-events:none}
  .unit-header-inner{max-width:1100px;margin:0 auto;position:relative;z-index:1}
  .unit-bread{font-size:.6875rem;color:#475569;margin-bottom:8px}
  .unit-bread span{cursor:pointer;color:#64748B;text-decoration:none}
  .unit-bread span:hover{color:#E2E8F0}
  .unit-id{display:flex;align-items:center;gap:1rem}
  .unit-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0}
  .unit-name{font-size:1.25rem;font-weight:700;color:#F1F5F9}
  .unit-desc{font-size:.8125rem;color:#64748B;margin-top:2px}
  .unit-stats{display:flex;gap:.6rem;margin-top:8px;flex-wrap:wrap}
  .unit-stat{font-size:.6875rem;color:#475569;padding:.2rem .6rem;border-radius:4px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04)}
  .unit-stat .num{color:#94A3B8;font-weight:600;font-family:'JetBrains Mono',monospace}

  .content{max-width:1100px;margin:0 auto;padding:0 5% 60px}
  .section-label{display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;margin-top:2rem}
  .section-label:first-child{margin-top:0}
  .section-label-text{font-size:.6875rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#475569}
  .section-label-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)}

  .quick-actions{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1.5rem}
  .qa-btn{display:inline-flex;align-items:center;gap:.3rem;padding:.4rem .9rem;border-radius:6px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);color:#94A3B8;font-size:.6875rem;text-decoration:none;transition:all .15s;cursor:pointer;font-family:'Inter',sans-serif}
  .qa-btn:hover{background:rgba(255,255,255,.05);color:#E2E8F0}
  .qa-btn.primary{background:${color};color:#070B14;border-color:${color};font-weight:600}
  .qa-btn.primary:hover{opacity:.9}
  .qa-btn.patients{background:#6366f1;color:#fff;border-color:#6366f1;font-weight:600}
  .qa-btn.patients:hover{background:#818cf8}

  .enc-type-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.5rem}
  .enc-type-card{display:flex;align-items:center;gap:.75rem;padding:.9rem 1rem;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;text-decoration:none}
  .enc-type-card:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);transform:translateY(-2px)}
  .enc-type-icon{font-size:1.125rem}
  .enc-type-info{flex:1;min-width:0}
  .enc-type-name{font-size:.8125rem;font-weight:600}
  .enc-type-arrow{color:#334155;font-size:.75rem}

  .pathway-card{padding:.9rem 1.1rem;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);margin-bottom:.5rem}
  .pathway-name{font-size:.8125rem;font-weight:600;color:#F1F5F9;margin-bottom:4px}
  .pathway-tags{display:flex;gap:.4rem;flex-wrap:wrap}
  .pathway-tag{font-size:.625rem;padding:.2rem .5rem;border-radius:4px;background:rgba(255,255,255,.03);color:#64748B;border:1px solid rgba(255,255,255,.04)}
  .empty-state{text-align:center;padding:40px 20px;color:#475569;font-size:.8125rem;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:rgba(255,255,255,.02)}
  .empty-icon{font-size:1.5rem;margin-bottom:8px}

  @media(max-width:768px){
    .enc-type-grid{grid-template-columns:1fr 1fr}
    .unit-header{padding:28px 5% 20px}
  }
`;

export default function UnitPage() {
  const raw = useParams();
  const params = raw || {};
  const router = useRouter();
  const { user, loading } = useAuth();
  const deptKey = typeof params.dept === 'string' ? params.dept.toUpperCase() : '';
  const unitId = typeof params.unit === 'string' ? params.unit : '';

  useEffect(() => { if (!loading && !user) router.replace('/clinical-auth'); }, [user, loading, router]);

  const dept = getDepartment(deptKey);
  const unit = getUnit(deptKey, unitId);
  const pathways = CLINICAL_PATHWAYS.filter(p => p.departmentKey === deptKey && p.unitId === unitId);

  if (loading || !user) return null;

  if (!dept || !unit) {
    return (
      <>
        <style>{CSS('#6366f1')}</style>
        <div className="page">
          <div className="bg-grid" />
          <nav className="top-bar">
            <span className="back-btn" onClick={() => router.push('/workspace/departments')}>← All Departments</span>
          </nav>
          <div className="empty-state" style={{ maxWidth: 400, margin: '120px auto' }}>
            <div className="empty-icon">⚠️</div>
            <div style={{ color: '#E2E8F0', fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Unit Not Found</div>
            <div>The unit &ldquo;{unitId}&rdquo; was not found.</div>
            <span className="back-btn" style={{ display: 'inline-flex', marginTop: 16 }} onClick={() => router.push(`/workspace/${deptKey}`)}>← Back</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS(dept.color)}</style>
      <div className="bg-grid" />
      <div className="page">
        <nav className="top-bar">
          <span className="back-btn" onClick={() => router.push(`/workspace/${deptKey}`)}>← {dept.label}</span>
          <div className="top-right">
            <span className="qa-btn patients" onClick={() => router.push('/patients')} style={{ padding: '.35rem .75rem', fontSize: '.6875rem' }}>📁 Patient Records</span>
          </div>
        </nav>

        <section className="unit-header">
          <div className="unit-header-inner">
            <div className="unit-bread">
              <span onClick={() => router.push('/workspace/departments')}>Departments</span> · <span onClick={() => router.push(`/workspace/${deptKey}`)}>{dept.label}</span> · {unit.label}
            </div>
            <div className="unit-id">
              <div className="unit-icon" style={{ background: `${dept.color}18`, color: dept.color }}>{unit.icon}</div>
              <div>
                <div className="unit-name">{unit.label}</div>
                <div className="unit-desc">{unit.description}</div>
                <div className="unit-stats">
                  <span className="unit-stat"><span className="num">{unit.encounterTypes.length}</span> Encounter Types</span>
                  {pathways.length > 0 && <span className="unit-stat"><span className="num">{pathways.length}</span> Clinical Pathways</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="content">
          <div className="quick-actions">
            <span className="qa-btn patients" onClick={() => router.push('/patients')}>📁 Patient Records</span>
            <span className="qa-btn primary" onClick={() => router.push(unitId === 'lbo-intelligence' ? '/clinical-workspace/default/departments/surgery/lbo-intelligence' : '#')}>+ New Encounter</span>
            {unit.encounterTypes.slice(0, 3).map(et => {
              const isLbo = unitId === 'lbo-intelligence';
              const path = isLbo ? `/clinical-workspace/default/departments/surgery/lbo-intelligence` : `/workspace/${deptKey}/${unitId}/${et.type}`;
              return <span key={et.type} className="qa-btn" onClick={() => router.push(path)}>{et.icon} {et.label}</span>;
            })}
          </div>

          <div className="section-label">
            <span className="section-label-text">Available Encounter Types · {unit.encounterTypes.length}</span>
            <span className="section-label-line" />
          </div>

          <div className="enc-type-grid">
            {unit.encounterTypes.length > 0 ? unit.encounterTypes.map(et => {
              const isLbo = unitId === 'lbo-intelligence';
              const path = isLbo ? `/clinical-workspace/default/departments/surgery/lbo-intelligence` : `/workspace/${deptKey}/${unitId}/${et.type}`;
              return (
              <div key={et.type} className="enc-type-card" onClick={() => router.push(path)}>
                <span className="enc-type-icon">{et.icon}</span>
                <div className="enc-type-info">
                  <div className="enc-type-name" style={{ color: et.color }}>{et.label}</div>
                </div>
                <span className="enc-type-arrow">→</span>
              </div>
            );
            }) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-icon">📋</div>
                <div>No encounter types configured for this unit.</div>
              </div>
            )}
          </div>

          {pathways.length > 0 && (
            <>
              <div className="section-label">
                <span className="section-label-text">Clinical Pathways</span>
                <span className="section-label-line" />
              </div>
              {pathways.map(p => (
                <div key={p.id} className="pathway-card">
                  <div className="pathway-name">{p.name}</div>
                  <div className="pathway-tags">
                    {p.encounterTypes.map(et => {
                      const label = ENCOUNTER_LABELS[et];
                      return <span key={et} className="pathway-tag">{label?.icon} {label?.label || et}</span>;
                    })}
                    {p.protocols.map(pr => <span key={pr} className="pathway-tag" style={{ color: dept.color }}>{pr}</span>)}
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="section-label" style={{ marginTop: '2rem' }}>
            <span className="section-label-text">Disease Intelligence Library · {getDiseasesForUnit(deptKey, unitId).length} diseases</span>
            <span className="section-label-line" />
          </div>
          {(() => {
            const diseases = getDiseasesForUnit(deptKey, unitId);
            return diseases.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {diseases.map(d => (
                  <div key={d.id} className="pathway-card" style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/workspace/${deptKey}/${unitId}/outpatient?disease=${d.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="pathway-name">{d.name}</span>
                      <span style={{ fontSize: '.625rem', color: '#475569', fontFamily: "'JetBrains Mono',monospace" }}>{d.icd10}</span>
                    </div>
                    <div className="pathway-tags">
                      <span className="pathway-tag">{d.differentials.length} differentials</span>
                      <span className="pathway-tag">{d.treatmentGuidelines.length} protocols</span>
                      <span className="pathway-tag">{d.investigations.length} investigations</span>
                      <span className="pathway-tag" style={{ color: dept.color }}>
                        {d.severityCriteria.length} severity criteria
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <div>No disease intelligence loaded for this unit.</div>
                <div style={{ fontSize: '.6875rem', color: '#334155', marginTop: 4 }}>
                  Disease libraries are available for PAED, IM, CARD, NEURO, OB, PSYCH
                </div>
              </div>
            );
          })()}

          <div className="section-label" style={{ marginTop: '2rem' }}>
            <span className="section-label-text">Active Encounters</span>
            <span className="section-label-line" />
          </div>
          <div className="empty-state">
            <div className="empty-icon">🩺</div>
            <div>No active encounters in this unit.</div>
            <div style={{ fontSize: '.6875rem', color: '#334155', marginTop: 4 }}>Select an encounter type above to start a new workflow.</div>
          </div>
        </div>
      </div>
    </>
  );
}
