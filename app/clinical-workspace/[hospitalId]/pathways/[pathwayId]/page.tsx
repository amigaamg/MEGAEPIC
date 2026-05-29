'use client';
import { useParams, useRouter } from 'next/navigation';
import { CLINICAL_PATHWAYS, WORKSPACE_PHASES } from '@/lib/encounterTypes';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import BreadcrumbNav from '@/src/components/shared/breadcrumb-nav';

const PHASE_ICONS: Record<string, string> = {};
WORKSPACE_PHASES.forEach(p => { PHASE_ICONS[p.id] = p.icon; });

export default function PathwayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.hospitalId as string;
  const pathwayId = params?.pathwayId as string;

  const pathway = CLINICAL_PATHWAYS.find(p => p.id === pathwayId);
  if (!pathway) {
    return (
      <div className="flex flex-col gap-5 animate-fade-in">
        <BreadcrumbNav items={[
          { label: 'Dashboard', href: `/clinical-workspace/${hospitalId}` },
          { label: 'Pathways', href: `/clinical-workspace/${hospitalId}/pathways` },
          { label: 'Not Found' },
        ]} />
        <div className="frost-card p-8 text-center">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>Pathway not found</h2>
          <p style={{ fontSize: 13, color: '#64748B' }}>The pathway &quot;{pathwayId}&quot; does not exist.</p>
          <button
            onClick={() => router.push(`/clinical-workspace/${hospitalId}/pathways`)}
            style={{
              marginTop: 12, padding: '8px 16px', borderRadius: 6, border: 'none',
              background: 'linear-gradient(135deg,#06B6D4,#0891B2)', color: '#fff', fontSize: 12,
              cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
            }}
          >
            ← Back to Pathways
          </button>
        </div>
      </div>
    );
  }

  const dept = DEPARTMENTS[pathway.departmentKey];
  const deptColor = dept?.color || '#06B6D4';

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <BreadcrumbNav items={[
        { label: 'Dashboard', href: `/clinical-workspace/${hospitalId}` },
        { label: 'Pathways', href: `/clinical-workspace/${hospitalId}/pathways` },
        { label: pathway.name },
      ]} />

      <div className="frost-card p-5">
        <div className="flex items-start gap-4">
          <span style={{ fontSize: 36 }}>{dept?.icon || '📋'}</span>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2 mb-1">
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>
                {pathway.name}
              </h1>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: deptColor }} />
            </div>
            <p style={{ fontSize: 12, color: '#64748B' }}>
              {dept?.label || pathway.departmentKey} · {pathway.unitId}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {pathway.encounterTypes.map(et => (
                <span key={et} style={{
                  fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                  background: `${deptColor}18`, color: deptColor,
                }}>
                  {et}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => router.push(`/clinical-workspace/${hospitalId}/departments`)}
            style={{
              padding: '10px 18px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg,#06B6D4,#0891B2)',
              color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            ➕ Start Encounter with this Pathway
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="frost-card p-4">
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>
              Clinical Workflow
            </h2>
            <div className="flex flex-col gap-2">
              {pathway.phases.map((phaseId, i) => {
                const phase = WORKSPACE_PHASES.find(p => p.id === phaseId);
                return (
                  <div key={phaseId} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#06B6D4,#0891B2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12,
                      }}>
                        {i + 1}
                      </div>
                      {i < pathway.phases.length - 1 && (
                        <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.08)', minHeight: 12 }} />
                      )}
                    </div>
                    <div className="pb-3" style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>
                        {PHASE_ICONS[phaseId] || '📋'} {phase?.label || phaseId}
                      </div>
                      {phase?.description && (
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{phase.description}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="frost-card p-4">
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>
              Scoring Systems
            </h2>
            {pathway.scores.length === 0 ? (
              <p style={{ fontSize: 12, color: '#64748B' }}>No scoring systems defined for this pathway.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {pathway.scores.map(s => (
                  <div key={s.name} className="rounded-lg" style={{ background: 'rgba(0,214,143,0.06)', padding: 12 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: 14 }}>📊</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{s.name}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: 4, marginTop: 4 }}>
                      {s.calc}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="frost-card p-4">
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>
              📋 Associated Protocols
            </h2>
            {pathway.protocols.length === 0 ? (
              <p style={{ fontSize: 12, color: '#64748B' }}>No protocols linked.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pathway.protocols.map(pr => (
                  <div
                    key={pr}
                    style={{
                      padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                      background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.12)',
                      fontSize: 11, color: '#06B6D4', fontWeight: 500,
                      transition: 'all 0.15s',
                    }}
                    className="hover:bg-cyan-500/10"
                  >
                    📄 {pr}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="frost-card p-4">
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>
              🚨 Alert Triggers
            </h2>
            {pathway.alerts.length === 0 ? (
              <p style={{ fontSize: 12, color: '#64748B' }}>No alert triggers defined.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pathway.alerts.map(a => (
                  <div
                    key={a}
                    style={{
                      padding: '8px 10px', borderRadius: 6,
                      background: 'rgba(255,69,96,0.08)', border: '1px solid rgba(255,69,96,0.15)',
                      fontSize: 11, color: '#FF4560', fontWeight: 500,
                    }}
                  >
                    ⚠ {a}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="frost-card p-4">
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>
              Pathway Info
            </h2>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: '#64748B' }}>Department</span>
                <span style={{ color: '#E2E8F0' }}>{dept?.label || pathway.departmentKey}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#64748B' }}>Unit</span>
                <span style={{ color: '#E2E8F0' }}>{pathway.unitId}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#64748B' }}>Phases</span>
                <span style={{ color: '#E2E8F0' }}>{pathway.phases.length}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#64748B' }}>Protocols</span>
                <span style={{ color: '#E2E8F0' }}>{pathway.protocols.length}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#64748B' }}>Alerts</span>
                <span style={{ color: '#FF4560' }}>{pathway.alerts.length}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#64748B' }}>Scores</span>
                <span style={{ color: '#00D68F' }}>{pathway.scores.length}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#64748B' }}>Encounter Types</span>
                <span style={{ color: '#E2E8F0' }}>{pathway.encounterTypes.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
